# MODEL_SIZE: a smaller exported VSS model for the browser

## Problem

`docs/model/data2_p80_s0` (all training data, 186 kinds, D 1024, 8-bit export): `routebook.bin` is 106.7 MB (101.7 MiB), over GitHub's
100 MB file limit and too big for a browser demo. Almost all of it is three tables indexed by a pair of kinds (bg, A, L: K x K x D bytes
each, 35.4 MB each); path and bg0 (K x D) are 0.19 MB each. The browser also holds every table as float64 plus float32 cos / sin tables:
about 1.7 GB of memory for data2_p80_s0.

## Fact measured before the pre-registration (no accuracy looked at)

Training changes only the rows of the phase table that some training sentence reads (train.py LeanTheta, commit 98a6b9a); every other row
keeps its initial random value. Measured on the exported files by regenerating the initial table (rng(200 + seed), the LeanTheta stream),
quantizing it exactly as export_web does and comparing byte for byte (scratch script `reach.py`): a row is "trained" when at least one of
its D bytes differs from its initial value. The split is clean: a row has either 0-10% of its bytes equal to the initial value (trained;
a few rarely reached A / L rows keep 10-99%) or 100% (never trained).

| model | K | path trained | bg0 trained | bg trained | A trained | L trained | K x K rows trained (bg + A + L) |
|---|---|---|---|---|---|---|---|
| fix_p80_s0 | 106 | 105 / 106 | 38 / 106 | 734 / 11236 (6.5%) | 1881 / 11236 (16.7%) | 1881 / 11236 (16.7%) | 4496 / 33708 (13.3%) |
| data2_p80_s0 | 186 | 185 / 186 | 62 / 186 | 1624 / 34596 (4.7%) | 4922 / 34596 (14.2%) | 4925 / 34596 (14.2%) | 11471 / 103788 (11.1%) |

(The training log of data2 counts 11770 rows reached by a training sentence, root row included; about 50 of them were reached with a
weight so small that their 8-bit values did not move.)

### Kinds: which carry trained rows (owner's question: does the own-kind cut-off, a word seen >= 8 times, waste space?)

Per kind: the number of trained K x K rows (bg, A, L) in which the kind is one of the two kinds, and its token count in the training texts
(`runs/<run>/splits.json` texts.train, kinds from the catalog).

| data2_p80_s0 (K 186) | kinds | trained rows touching them |
|---|---|---|
| 0 training tokens (NOTCOLOR) | 1 | 0 |
| 1-7 training tokens | 12 | 539 |
| 8-19 training tokens | 73 | 3958 |
| 20-49 training tokens | 42 | 4053 |
| 50-199 training tokens | 34 | 5042 |
| >= 200 training tokens | 24 | 9258 |

(A row touches two kinds, so the column sums to more than the 11471 rows.) 85 of the 186 kinds have fewer than 20 training tokens; the
24 most frequent kinds hold 75% of all training tokens. A dense table pays K^2 rows for every kind; a rare kind has 10-49 trained rows
(46 kinds) against its 3 x (2K - 1) = 1113 rows in the dense tables. The 64 most frequent kinds hold only 38.5% of the trained rows,
the 128 most frequent 75.7%: the rare kinds are not empty, they are just sparse. So the cut-off costs space only in the DENSE format
(K^2); stored sparsely, a rare kind costs only the rows its training sentences reach. fix_p80_s0: 44 of 106 kinds have < 20 tokens.

## Hypothesis (direction A, option 1)

Storing only the trained rows of bg, A and L (path and bg0 stay dense), and letting an untrained row contribute nothing at reading time
(the bigram term of that token is left out; a chain term over an untrained A or L pair is left out), keeps the reading of the dev spans
within noise of the dense model, because an untrained row is pure random noise (its value never met a training sentence).

## How it is measured

- Models: data2_p80_s0 and fix_p80_s0, each exported dense (as now) and sparse (the same 8-bit values for the stored rows).
- `llm_score.mjs` (current scorer), SEG=gold (reading alone, annotated spans) and the default cut, on the three dev files (old =
  scratchpad/review/dev.jsonl, msg2, long; held-out training messages with spans, read before by the people working on the reader).
- Also counted: the share of dev reads (spans read by `vss.read`) that read at least one untrained row, per table.
- Parity: Python (infer.Routebook on the sparse file) and JS (docs/js/vss on the sparse file) give the same SOP text and status on every
  dev span; the dense files still load and score as before.

## Criterion (fixed before the sparse accuracy is measured)

PASS only if all hold, for data2_p80_s0:
1. reading alone (SEG=gold), old dev file, wires right: sparse >= dense - 0.3 points;
2. routebook.bin of the sparse export under 20 MB;
3. parity: identical SOP text and status for every dev span between Python and JS on the sparse export;
4. the dense format still loads: fix_p80_s0 dense scores exactly as before the change.
msg2, long, the default cut, extra wires and fix_p80_s0 sparse are reported, not part of the criterion. Otherwise: fail, report, no patch.

## Bit depth (reported, no decision here)

The export's bit depth is chosen after training (`sop export-web --bits`). The trained float32 tables of these two models are no longer on
disk (the world's model folder was overwritten by later runs), so 6-bit and 4-bit variants are made from the 8-bit export: q6 = round(q8 / 4),
q4 = round(q8 / 16) (round half to even). A 6-bit or 4-bit level is exactly an 8-bit level (4 q6, 16 q4), so these variants are scored with the
8-bit loader; their real file size is computed (bytes x 6/8, x 4/8). Re-quantizing an 8-bit value is not exactly the same as quantizing the
float32 original (it can differ by one level when the original sat near a boundary); stated with the numbers.

## Result (one run of each, nothing changed after seeing numbers)

Run 2026-10-31. Sparse exports made with `sop export-web --from-web docs/model/<m> --out <dir> --sparse` (the dense 8-bit export's bytes
kept for every stored row; the trained float32 tables are no longer on disk). Dev files: old = scratchpad/review/dev.jsonl (253 messages,
1126 wires), msg2 = dev_new/msg2 (233, 923), long = dev_new/long (45, 519): held-out training messages with spans, read before. Scorer:
current `llm_score.mjs` (MAIN). Wires right, extra wires in brackets. The dense numbers reproduce STEP3_DATA.md (MAIN scorer).

| model | file | dense SEG=gold | sparse SEG=gold | dense default cut | sparse default cut |
|---|---|---|---|---|---|
| data2_p80_s0 | old | 63.2% 712 (x81) | 63.2% 712 (x81) | 48.1% 542 (x332) | 48.0% 541 (x332) |
| data2_p80_s0 | msg2 | 59.8% 552 (x79) | 59.8% 552 (x79) | 51.5% 475 (x386) | 51.6% 476 (x386) |
| data2_p80_s0 | long | 49.1% 255 (x43) | 49.3% 256 (x43) | 36.6% 190 (x224) | 36.6% 190 (x224) |
| fix_p80_s0 | old | 61.0% 687 (x71) | 61.0% 687 (x71) | 47.1% 530 (x335) | 47.1% 530 (x335) |
| fix_p80_s0 | msg2 | 45.7% 422 (x96) | 45.8% 423 (x96) | 40.3% 372 (x414) | 40.3% 372 (x413) |
| fix_p80_s0 | long | 47.4% 246 (x46) | 47.4% 246 (x46) | 37.0% 192 (x243) | 37.0% 192 (x243) |

Route book reads (SEG=gold; one read = one `Routebook.addresses` call) that read at least one untrained row:

| model | file | reads | touching any untrained row | bg | A | L | untrained share of the pair reads (bg / A / L) |
|---|---|---|---|---|---|---|---|
| data2_p80_s0 | old | 2165 | 140 (6.5%) | 72 | 116 | 116 | 1.0% / 0.7% / 0.7% |
| data2_p80_s0 | msg2 | 1770 | 152 (8.6%) | 82 | 130 | 130 | 1.2% / 1.2% / 1.2% |
| data2_p80_s0 | long | 957 | 124 (13.0%) | 74 | 106 | 108 | 2.5% / 2.0% / 2.0% |
| fix_p80_s0 | old | 2151 | 172 (8.0%) | 92 | 158 | 158 | 1.2% / 1.0% / 1.0% |
| fix_p80_s0 | msg2 | 1615 | 265 (16.4%) | 172 | 213 | 213 | 2.9% / 2.8% / 2.8% |
| fix_p80_s0 | long | 950 | 175 (18.4%) | 123 | 157 | 157 | 4.2% / 3.6% / 3.6% |

Readings that change, dense vs sparse (JS, all 2568 annotated spans of the three files, `parity_reader.mjs --against`): data2_p80_s0:
SOP text (margins included) 160 spans, wires / role values or status 11 spans (status 7); fix_p80_s0: 234, 23 (13).

Parity (`parity_reader.py` + `parity_reader.mjs`, 2568 spans, Python numpy reader and JS reader on the same export): sparse data2_p80_s0,
sparse fix_p80_s0 and dense fix_p80_s0: tokens, SOP texts and statuses all identical; max residual difference 7.6e-10 (bound 1e-4).

Dense format: fix_p80_s0 and data2_p80_s0 dense score byte-identical output lines before and after the code change; a dense export of
the current world model (m0_p80_s0's) with the changed export_web.py is byte-identical to docs/model/m0_p80_s0 made by the old code.

Size and memory (data2_p80_s0): routebook.bin 106.7 MB -> 12.2 MB (stored rows: bg 1624, A 4922, L 4925; index 0.05 MB); the folder
111.5 MB -> 17.1 MB (stars.bin 4.6 MB, model.json 0.14 MB, front.json 0.17 MB). Node, loading the model and reading one sentence:
RSS 1816 MB -> 325 MB, load 7.1 s -> 0.9 s. fix_p80_s0: routebook.bin 34.7 MB -> 4.8 MB.

### Criterion

1. old dev, SEG=gold: sparse 63.2% (712) vs dense 63.2% (712): difference 0.0 points. Met.
2. routebook.bin 12.2 MB < 20 MB. Met.
3. parity: all 2568 spans identical between Python and JS. Met.
4. dense format still loads and scores exactly as before. Met.

**PASS.** `docs/model/data2_p80_s0` is now the sparse export (the dense folder is kept outside the repository, in the session scratchpad).

### Why option 1 changes so little

An untrained row is a random phase vector: its term is a random unit-modulus vector, nearly orthogonal to every star the decoder compares
with, so it adds noise of about 1/sqrt(D) per term to the scores instead of information. Leaving it out removes that noise and also
removes its share of the address's norm. Only 0.7-4% of the pair reads are untrained, and an A / L term is further weighted by the
gates; so 11 of 2568 data2 spans change a decision (7 a status), in both directions (net +1 wire on long SEG=gold, -1 on old default
cut, +1 on msg2 default cut). Examples: "slide Lunch right of that column" object -> landmark; "colour everything orange" ok -> abstain.

### Option 2 (regenerate untrained rows from the seed) — not built

It would keep outputs identical to the dense model, but the browser would need numpy's PCG64 generator and its uniform double draw in JS
(128-bit integer arithmetic with BigInt, a jump-ahead over (1 + K^2 + K + V) x D draws, then the row's position in the P x D stream), one
row of 1024 draws per untrained pair read. Not needed: option 1 passed, and option 1 is also the honest rule (an untrained pair says nothing).

## Direction B: several worlds (size estimate only, owner's guidance: not now)

Training rows of data2_p80_s0 (splits.json texts.train, 9129 rows) grouped by the event of their first legend verb token; kinds per
group from the catalog; reached pairs as train.py reached_rows counts them (bg adjacent, A q < k, L q > k).

| world | events | rows | kinds | dense K x K tables | reached pairs | sparse |
|---|---|---|---|---|---|---|
| links | connect, disconnect, neighbors, path, reachable, cycle, connected, degree | 1831 | 129 | 51.1 MB | 4907 | 5.0 MB |
| shapes and attributes | create, delete, move, set, resize, rename, label, duplicate, swap, align, arrange, distribute, toFront, toBack, undo, redo, forget, rule, fact | 5232 | 171 | 89.8 MB | 7315 | 7.5 MB |
| questions | count, exists, list, property, describe, check, extreme, nearest | 1391 | 103 | 32.6 MB | 2301 | 2.4 MB |
| no legend verb token in the row | (no world: the router cannot route it) | 675 | 128 | | 3119 | |
| three worlds | | | | 173.5 MB | | 14.9 MB |
| one world (today) | | 9129 | 185 | 106.3 MB | 11522 | 11.8 MB |

Several worlds do not shrink the model: 72 kinds (function words, the legend's value kinds, NAME, VERB) occur in all three worlds, so each
world keeps 100-170 kinds, and dense the three together are 1.6 times today's size; sparse they are 1.3 times (pairs shared by worlds are
stored once per world). Risks: a wrong world when the action word is wrong or missing (675 training rows, 7.4%, have no legend verb
token; today's cause A "action word not recognized" is 7-15% of the dev requests); messages with requests of several worlds need a cut
first. The text estimate (11522 pairs) agrees with the measured trained rows (11471 changed + about 50 reached but unchanged in 8 bits).

## Bit depth and D (direction C)

Sizes of the dense K x K tables (bg + A + L) of data2_p80_s0 (K 186) and fix_p80_s0 (K 106):

| | 8 bits | 6 bits | 4 bits |
|---|---|---|---|
| data2 dense, D 1024 | 106.3 MB | 79.7 MB | 53.1 MB |
| data2 dense, D 512 | 53.1 MB | 39.9 MB | 26.6 MB |
| fix dense, D 1024 | 34.5 MB | 25.9 MB | 17.3 MB |
| fix dense, D 512 | 17.3 MB | 12.9 MB | 8.6 MB |
| data2 sparse routebook.bin, D 1024 | 12.2 MB | 9.1 MB (packed; format has no 6-bit packing) | 6.1 MB |
| data2 sparse stars.bin | 4.6 MB | 3.5 MB | 2.3 MB |

D 512 halves every size; its accuracy needs a training (not run). 6 and 4 bits re-quantized from the 8-bit sparse exports (see above;
6-bit levels scored inside an 8-bit file, 4-bit as a real 4-bit file), route book and stars together. Wires right, extra in brackets:

| model | file | 8 bits gold | 6 bits gold | 4 bits gold | 8 bits default | 6 bits default | 4 bits default |
|---|---|---|---|---|---|---|---|
| data2 sparse | old | 712 (x81) | 712 (x81) | 714 (x81) | 541 (x332) | 540 (x332) | 544 (x334) |
| data2 sparse | msg2 | 552 (x79) | 554 (x77) | 552 (x80) | 476 (x386) | 474 (x387) | 475 (x387) |
| data2 sparse | long | 256 (x43) | 255 (x43) | 255 (x43) | 190 (x224) | 189 (x224) | 190 (x224) |
| fix sparse | old | 687 (x71) | 687 (x71) | 689 (x71) | 530 (x335) | 530 (x335) | 528 (x335) |
| fix sparse | msg2 | 423 (x96) | 424 (x95) | 420 (x96) | 372 (x413) | 372 (x413) | 368 (x414) |
| fix sparse | long | 246 (x46) | 247 (x46) | 246 (x46) | 192 (x243) | 193 (x243) | 194 (x242) |

4 bits moves at most 4 wires of 1126 / 923 / 519 in either direction: the data2 sparse 4-bit folder would be about 8.8 MB. Not adopted
here (no criterion was pre-registered for it); a 4-bit export is `--bits 4` at export time.

## Implementation

- `training/vss/tool/sop/export_web.py`: `--sparse` (from a model folder: rows compared in float32 with the regenerated initial rows) and
  `--from-web <dense export> --sparse` (rows compared in the exported bits; an A / L row that moved less than half a quantization step
  in every entry counts as untrained there: 1 A and 2 L rows of 3764 on the m0 model); `read_bin` returns a sparse table as its stored rows
  plus `<name>_rowmap`; `routebook_from_bin` builds an `infer.Routebook` from an export; `untrained_rows` regenerates the initial table
  and refuses a model it does not reproduce (position code, or no row equal to its initial value).
- `training/vss/tool/sop/infer.py`: `Routebook.pair_rows` and the absent-row rule in `addresses`; `Reader` accepts a given route book
  without a routebook.npz.
- `docs/js/vss/loader.js` (index arrays, sparse tables with `rowOf`), `docs/js/vss/routebook.js` (the same absent-row rule).
- `training/sketch/parity_reader.py` / `parity_reader.mjs`: the one-request reader's Python / JS parity on an export folder.
  `python3 parity_reader.py --web <dir> --msgs <jsonl> ... --out g.json; node parity_reader.mjs g.json <dir> [--against <other dir>]`.
- run_curve.sh / build.sh still export dense: switching them is the coordinator's choice (other runs compare against dense baselines).

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/data2_p80_s0` (fbaa8dc), `docs/model/fix_p80_s0` (cf0545a), `docs/model/m0_p80_s0` (bced516). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
