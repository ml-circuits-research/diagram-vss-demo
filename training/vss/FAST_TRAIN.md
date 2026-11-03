# FAST_TRAIN: faster `sop train` without changing what is learned (2026-11-02)

Switch: environment variable `FAST`. It is off by default. `train_micro.sh` passes it through unchanged (e.g. `FAST=1 bash
training/sketch/train_micro.sh ...`).

| value | what it does | outputs |
|---|---|---|
| unset / `0` | the trainer as before | as before |
| `FAST=1` | calibration and training loop rewritten | **byte-identical** model (route book, thresholds, background, catalog, metrics) |
| `FAST=2` | `FAST=1` + the chain recursions vectorised (fewer GPU kernel launches) | equal within float tolerance; held-out scores over 3 seeds below |

`FAST_PROCS=<n>` sets how many processes read the calibration rows. The default is min(8, the CPUs this process may use).
`FAST_MEM_MB=<n>` (with FAST=1 or 2; off by default) bounds the memory of a training step. A batch whose chain terms would need more
than n MB is computed in micro-batches of rows of similar length, with the gradients summed before the one Adam step. It is equal
within float tolerance on those steps only; every other step is unchanged (section 5).

Code: `tool/sop/train.py` (`fast_map`, `calibrate_and_finish`, `Compact.states_fast`, `train_one`), `tool/sop/infer.py` (`Reader.best`,
`_conj`, `_MEMO`), `experiment/v8_gates.py` (`V8.states_packed`, `V8.states_vec`, `_pairs`), `experiment/trainer.py` (`lazy_loss`,
`micro_step`), `fast_micro_groups` in train.py.
With `FAST` unset, every changed function takes its old path.

## 1. Profile (graphq7, CPU here, before)

The world is a copy of `training/sketch/worlds_micro/graphq7`: 2729 rows, 2460 training rows x 10 epochs = 24,600 sentences = 3075 steps
of 8, D = 1024, 57 kinds. Arguments are those of `train_micro.sh` with the round-2 calibration (`--n_cal 100000` = every training
row) and `N_EVAL=150 EVAL_MODES=primary`. One torch thread (`OMP_NUM_THREADS=1`). The machine is a 2-core Xeon at 2.1 GHz shared with
other agents, so CPU seconds (`time.process_time`) are given beside wall seconds. The stage timer is the scratch harness
`stagetime.py`, which wraps the trainer's functions and does not change them.

### 1.1 The whole run

| stage | wall s | share | what it is |
|---|---|---|---|
| data build: `msg_to_world.py` (outside `sop train`) | 16 | (2% of the pipeline) | front end learned, rows converted |
| `sop check` (outside) | 0.2 | | |
| load + check examples, baselines | 0.3 | 0.0% | |
| **training loop** | **420** | **52.3%** | 3075 Adam steps |
| export route book | 1.3 | 0.2% | |
| **calibration (thresholds + background)** | **376** | **46.8%** | numpy reader on CPU, one process |
| - of which `Reader.read` | 348 | 43.4% | 2 reads per row; every row read twice |
| - of which `Reader.chart` | 28 | 3.4% | |
| - of which background `formalize` | 16 | 2.0% | |
| - of which `fit_threshold` | 0.0 | 0.0% | already O(n log n) (8c2ba11) |
| trainer evaluation (`N_EVAL=150`, primary) | 1.5 | 0.2% | |
| report | 0.0 | | |
| `sop export-web --sparse` (outside) | 7 | | |
| total `sop train` | 803 | 100% | |

On the owner's GPU the loop is short: graphq7r2 70 s, shapes7r2 297 s (round-2 logs). There the calibration is the stage that grows:
it costs rows x (candidate words of the roles' kinds) x D on one CPU core.

### 1.2 Why the calibration was slow

Profile of 100 rows, 2 reads each, plus `formalize`:
- **60% of a read: `M.conj()`.** `Reader.best` computes `np.real(M.conj() @ x)`, and `M.conj()` copies the whole candidate matrix
  (up to thousands of words x 1024 complex) on every cleanup.
- **Every row is read twice:** `calibrate()` runs once on the training sample and again on the sample + the held-out calibration
  half, and the reads do not depend on the earlier stats.
- **Each row has two reads** (`presence` decided and `presence="all"`) that compute mostly the same cleanups.
- **One process.**

### 1.3 Where the training loop's time goes

`torch.profiler`, graphq7, steps 20-50, CPU, 1 thread; self CPU time per op:

| part of a step | share |
|---|---|
| backward of the per-position slices `EA[:, :k, k]`, `EL[:, k, k+1:]`, `addr[:, k]` (SliceBackward / SelectBackward). Each one fills a zero tensor of the whole B x T x T x D (or B x T x D) for every position k: O(B T^3 D) memory traffic per step | ~25% (`fill_` 12.5%, `add_` 11.7%) |
| complex exponentials `torch.polar` and their backward (`sgn`) | ~24% |
| Adam on the held phase rows (1917 x 1024 float64) | ~15% |
| `batch_fn`: encode in Python + compile each target (`Compiler.wire`) every step | 9% |
| the rest: products, einsum/bmm, index | ~27% |

Per step: 1307 compute ops (each one a kernel launch on a GPU) and 4 device->host syncs (`torch.unique` and the boolean mask in
`Compact.states`, `loss.item()`, the finite-loss `assert`). On a GPU a step of this size is bounded by launches and syncs, not by
arithmetic. That is why the card was lightly used.

## 2. Changes

### FAST=1 (byte-identical)

Calibration (`train.py calibrate_and_finish`, `infer.py`):
1. `Reader.best` and `read_set_role` use a conjugate computed once per candidate matrix (`_conj`). It is the same array, sent to the
   same BLAS call.
2. Each calibration row is read once per run (`row_entries` -> cache). `add_row` appends the same entries in the same order, so the
   stats dict, the thresholds and the key order of `config.json` are the same.
3. During a row's two reads, `best()` remembers its result for the same candidate matrix and the same probe vector (`infer._MEMO`,
   cleared per row).
4. The rows are read by a pool of `FAST_PROCS` forked processes (`fast_map`). Only indices and results cross the pipe, and the results
   are applied in the original order. The `CAL_FALLBACK=train` rows are chosen first (the choice does not depend on their reads), then
   read in the pool. The background `formalize` of the calibration rows runs in the pool too; the wire ids do not enter the residual.

Training loop (`train.py train_one`, `Compact`, `v8_gates.py`, `trainer.py`):
5. Every training row is encoded and its target compiled **once**. They are held on the device: graphq7 38 MB of targets; it grows with
   rows, not steps. A batch is a gather of those rows: the same tensors `batch_fn` built, without the per-step Python compile and the
   host->device copies.
6. The rows each batch reads are computed on the host **before** training (`reached_rows` per row, union per batch), held on the device
   and sliced per step. This replaces `torch.unique` + boolean mask, a sync every step. The batch's small phase table is built as
   before; entries read only with weight 0 (padded positions) point to its zero row.
7. `V8.states_packed`: the chain tables A and L are gathered only for the pairs the recursions read (q < k), not as B x T x T x D tensors
   sliced per position. The pairs are gathered in the flattening order of the full tables, so each phase row's gradient is summed in
   the same order; A is then reordered by k (a permutation, exact) and split per k. This removes the zero-fills of 1.3.
8. `trainer.train_loop(lazy_loss=True)`: the loss is read (`.item()`) and the finiteness of every step's loss checked (accumulated on
   the device) only at the log lines and at the end. A non-finite loss still stops the run, at the next log line, with the step range.

### FAST=2 (within float tolerance)

9. `V8.states_vec` replaces `states_packed`:
   - the weights of every pair (p(q, k), pL(k, q)) and the root / right products of every position are computed at once;
   - the right recursion keeps its loop over positions (addr_k needs addr_q for q < k), at 4 ops per position instead of ~10;
   - the left re-addressing has no recursion: it becomes one product over the pairs, summed per k (`index_add`).
   The same function, with the sums taken in another order. Compute ops per step: 1307 (before) -> 1103 (FAST=1) -> 501 (FAST=2).

Not changed: the batch size (8), the order of the updates (`--shuffle` order), the learning rate, the model, the float64 / complex128
precision. A larger batch or length buckets would change what is learned (fewer, different updates); the trainer's plan fixes batch 8,
so they are not used. `--length_buckets` exists and is untouched; FAST=1 falls back to the old loop with it.

## 3. Before / after (CPU here)

graphq7, whole `sop train`, 1 torch thread, calibration with `FAST_PROCS=2` on this 2-core machine:

| run | training loop | calibration | total `sop train` | per epoch (loop) |
|---|---|---|---|---|
| before (FAST unset) | 420 s | 376 s | 803 s | 42 s |
| FAST=1 | 241 s | 28.6 s | 283 s | 24 s |
| FAST=2 (seed 0, after the fix below) | 201 s | 54 s | 269 s | 20 s |

FAST=1 over seeds 0 / 1 / 2: loop 241 / 239 / 231 s, calibration 28.6 / 32.7 / 29.2 s. The FAST=2 runs had a bug, since fixed: `infer.py`
switched its cleanup cache on for FAST=1 only. Their calibration (93-103 s) therefore ran the pool without the conjugate cache and
memo. The values are the same (the uncached path), the time is not. With the fix, FAST=2's calibration is FAST=1's code. Re-run of seed 0 with the fix: route book, background, catalog and thresholds
byte-identical to the earlier FAST=2 run; calibration 54 s (the machine was busier than during the FAST=1 runs). FAST=2's loop
is 1.15x faster than FAST=1 on the CPU. On a GPU, where launches dominate, the gain should be larger: job 053.

FAST=1: 2.8x on the whole run here, the loop 1.74x and the calibration 13x. The calibration alone, one process: 81 -> 11.4 ms per
row (7.1x), and the rows are read once instead of twice. With 8-16 processes on the owner's machine it scales with the cores.

history7 (492 training rows x 10 epochs, no roles), whole `sop train`, 1 thread:

| run | training loop (per epoch) | calibration | total |
|---|---|---|---|
| before | 36 s (3.6 s) | 3.2 s | 43.1 s |
| FAST=1 | 24 s (2.4 s) | 2.9 s | 30.8 s |
| FAST=2 | 20 s (2.0 s) | 2.3 s | 26.5 s |

FAST=1's route book, background and catalog are byte-identical to the run before.

shapes7c, the first epoch only (`--stop_after 723`, 5780 rows; its longest row has 34 tokens): 245 s before, 105 s with FAST=1, 96 s with
FAST=1 + FAST_MEM_MB=256 (section 5).

GPU: not measured here (no card). Job scripts for the owner's machine, not pushed:
`/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/gpujobs/`
- `051_fast_graphq7r2.sh`: job 024 with FAST=1 under the id graphq7r2fast. Time per stage; thresholds side by side with graphq7r2.
- `052_fast_parallel4.sh`: history, manage, graphq, questions (r2) at once on the card, with a memory cap per process and nvidia-smi
  logged.
- `053_fast_loop_gpu.sh`: the loop alone, FAST=0 / 1 / 2, 1000 steps for the time, 300 steps for the per-step loss difference (FAST=0
  is run twice: cuda's own run-to-run noise).

Several worlds on one 4 GB card (estimate from the round-2 logs, to be confirmed by job 052):
- Torch allocates 0.07-0.17 GB per world. The 0.5-1.4 GB "reserved" is the caching allocator keeping blocks.
- Each process also has a CUDA context of ~0.3-0.4 GB, outside the allocator cap.
- With `VSA_MEM_FRACTION=0.2` and `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True,garbage_collection_threshold:0.6`, a world needs
  ~0.5-0.8 GB, so 4 worlds fit.
- CPU for 4 at once: `FAST_PROCS=4`, `OMP_NUM_THREADS=4` each on 16 threads.

## 4. Equality checks

FAST=1 against FAST unset (same code otherwise):
- **graphq7, every step's loss**: `--stop_after 300 --loss_every_step` gives the same `repr` of the loss at all 300 steps, and the same
  sha256 of every route book array. Also history7 (150 steps).
- **graphq7, whole run, seed 0**: `routebook.npz`, `background.npz` and `catalog.json` byte-identical. `config.json` identical except
  `trained` and `training_code_commit` (every threshold the same). `metrics.json` identical except `t_train_s`. The sparse 8-bit export
  (`routebook.bin`, `stars.bin`) is byte-identical.
- **Held-out scores, SEG=gold** (`llm_score.mjs` on the held-out requests of graphq7's events, the audit's `goldev_ho`, 271 requests):
  both 84.5 / 5.9 / 9.6 (right / not done / done wrong), 9 extra. This is the audit's number for the shipped graphq7 (UPSTREAM_AUDIT 3.2).

FAST=2 against FAST=1 (same seeds; FAST=1 = before, by the check above):

| seed | max phase difference (route book, rad) | max gate-logit difference | max presence-threshold difference | held-out SEG=gold FAST=1 | held-out SEG=gold FAST=2 |
|---|---|---|---|---|---|
| 0 | 0 | 1.4e-14 | 2.2e-16 | 84.5 / 5.9 / 9.6, extra 9 | 84.5 / 5.9 / 9.6, extra 9 |
| 1 | 2.8e-14 | 2.1e-13 | 4.4e-16 | 84.9 / 5.9 / 9.2, extra 9 | 84.9 / 5.9 / 9.2, extra 9 |
| 2 | 0 | 1.4e-14 | 2.2e-16 | 84.5 / 5.9 / 9.6, extra 9 | 84.5 / 5.9 / 9.6, extra 9 |

The route book is stored as float32: a phase difference of 0 means identical after rounding to float32. On 300 steps of graphq7,
every step's loss differs from FAST=0's by at most 2.2e-16. The held-out scores are identical per seed. The seed-to-seed spread
(84.5-84.9 right) is larger than any FAST=2 difference, which is none.

Caveat (FAST=1, calibration in the pool): `Reader.read(table=None)` keeps the previous row's table (`self._table`). In a world with table
roles (WikiSQL-style `_table` rows), a row without a table would then see a different "previous row" in a worker. No world here has
table roles: every diagram legend has none.

## 5. Memory of a training step (FAST_MEM_MB)

Job 061 (arm G) ran out of memory on the card at a 1.3 GB cap: "Tried to allocate 266 MiB" in the backward pass. 266 MiB is exactly one
B x T x T x D complex128 tensor at T = 46 (B = 8, D = 1024). The phase table is tens of MB. What fills memory is the chain terms, which
grow as B x T^2 x D for the batch's longest row: the other 7 rows of the batch are padded to that row's length.

Peak growth of one step (forward + backward + Adam) over the resting process, CPU RSS, `memprobe.py` (the trainer's own `build_v8`,
`Compact`, loss and `micro_step`; K = 59 kinds as shapes7c; one row of length T and seven of length 6; the warm-up step uses only
the seven short rows, so the long row's memory is new):

| T of the longest row | before | FAST=1 | FAST=2 | FAST=1 + FAST_MEM_MB=256 | FAST=2 + FAST_MEM_MB=256 |
|---|---|---|---|---|---|
| 20 | 497 MB | 327 MB | 378 MB | 347 MB (not split) | 384 MB (not split) |
| 34 | 1265 MB | 864 MB | 803 MB | 450 MB | 544 MB |
| 46 | 2309 MB | 1578 MB | 1492 MB | 388 MB | 507 MB |
| 60 | (not run) | 2593 MB | 2503 MB | 316 MB | 427 MB |

About 12-14 complex128 tensors of B x pairs x D are alive at the peak: the gathered phases, their exponentials, the stacked addresses
of the recursion and the products autograd saves, plus their gradients. Packing the pairs (FAST=1, forward and backward: the backward
of a gather of the pairs is a gather-sized scatter, with no T x T x D zero tensor) cuts about a third. Most of the rest is padding: one
long row makes all 8 rows cost T^2. `FAST_MEM_MB` (`fast_micro_groups`) takes care of that:
- when B x T(T-1)/2 x D x 208 bytes (the measured 13 tensors) exceeds the budget, the batch's rows are sorted by length and cut into
  consecutive groups that fit; a single row is always a group of its own;
- each group is computed at its own longest row, keeping the batch's padded width for the gate products, as `t_used` already does;
- the gradients of -sum(cos)/B of each group add up in `.grad`, then there is one Adam step (`trainer.micro_step`).

The update is the same as with -cos.mean() over the batch, up to the order of the float sums (rows' contributions are added group
by group). Steps under the budget are unchanged.

shapes7c, first epoch (723 steps, every row once), peak RSS during the loop minus RSS at its start:

| run | peak growth | time | steps split |
|---|---|---|---|
| before | +1.30 GB (0.88 -> 2.18 GB) | 245 s | - |
| FAST=1 | +0.91 GB (0.98 -> 1.89 GB) | 105 s | - |
| FAST=1 + FAST_MEM_MB=256 | +0.36 GB (0.98 -> 1.34 GB) | 96 s | 16 of 723 |

Equality:
- shapes7c after 723 steps: FAST=1's route book has the same sha256 as before. With FAST_MEM_MB=256 the largest phase difference is
  0 (float32 route book) and the largest gate-logit difference 1.8e-15.
- graphq7 with FAST_MEM_MB=1 (every step split into single rows, the worst case): every step's loss over 300 steps within 2.2e-16 of
  before.

On the card the same ratio applies to the torch allocator (the tensors are the same). A world's peak is set by its longest rows, so
`FAST_MEM_MB=256` with `VSA_MEM_FRACTION` around 0.2-0.35 keeps long-row worlds (links7: 46 tokens, arm G's longer rows) inside the
cap. Not done: splitting one row's positions (a row of 60 tokens alone still needs ~0.3 GB); checkpointing the recursion.
