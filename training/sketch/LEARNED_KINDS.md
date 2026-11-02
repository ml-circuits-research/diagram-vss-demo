# Learned kind map: design and status (2026-10-31, PARKED)

Status: **parked by the owner's decision** (2026-10-31): the learned kind map is a fallback, to be tried only if the simpler kind
methods (ablation, merging, per-action verbs) are not enough. Implementation stopped part-way. No training was run, nothing was
measured, so nothing below is a result. The pre-registration of the tests was not written (no measured training was started).

## Question

Today each word has one fixed kind (msg_to_world.py): a legend value token -> its question's kind; an event token -> VERB; a token
seen >= 8 times in the training spans -> a kind of its own; every other word -> `unknown`. The route book has 3 K^2 + 4 K + 41 rows
of D phases for K kinds. Old data, `--frac 0.8`: 102 kinds in kinds.tsv (87 own kinds), K about 106 in the route book;
fix_p80_s0's routebook.bin is 34.7 MB at 8 bits. Can the own / `unknown` kinds be learned instead, as M free slots (M = 16 / 32)?

## Design chosen

Three steps. Only the first two are new code; the third is the standard pipeline.

1. Soft phase (`sop train <world> --learn_kinds M`): the route book (path, bigram, chainL phases, one gate per kind) and, per
   learnable word w, logits l_w over a pool of kinds, trained together by the trainer's loss -cos(S, S_world) on the `train` split.
2. Hard map: argmax p_w per word, written as `learned_kinds.tsv` (word, kind) and `learned_kinds.json` (per word: count, p_max,
   entropy; per slot: its words), in the run folder. No model is exported by the soft phase.
3. Hard phase: msg_to_world.py with a switch that reads the map, then the unchanged `sop train` and the unchanged browser reader.
   The exported model has the standard format with K = the 14 legend kinds + VERB + NAME / NUM / TEXT + the used slots + the kept
   role-filler kinds + `unknown` (about 60 for M = 32 on old data, 0.8: about 3 x 60^2 rows instead of 3 x 106^2, about a third).

### Which words are learnable

- Learnable: a training token whose kind today is its own kind (kind == the word) or none (`unknown`), AND that never fills a role
  (head, attribute or determiner, world.filler_words) or a speaker in the training frames.
- Fixed (kept as today): legend value tokens, event tokens (VERB), the value patterns (NAME, NUM, TEXT), and the role fillers.
- Why the role fillers stay fixed: a kind that fills a role in the training frames becomes one of that role's candidate kinds
  (train.build_schema), and the reader takes the filler from every sentence word of those kinds. A slot shared by `it` and `the`
  would make `the` a candidate object. The loss cannot see this, since the decoder's candidate sets are not part of it. The fillers
  are read from the frames, not from a list. On fix_p80_s0 the learnable words that fill roles are arrow, it, line, rules, shape,
  shapes, that, them.
- Variant (`--learn_kinds_verbs V`): the event tokens are learnable too, over a pool of their own, `VERB_00` .. `VERB_<V-1>`, so a
  verb kind never holds a non-verb word. The readers find predicate candidates from the legend's verb list, not from the kind name.
  vss-centers.js counts as value tokens only the kinds matching /^[A-Z]+$/, so names with `_` and digits do not change that.
- Slot names: `slot00` .. `slot<M-1>` (lowercase with digits: never matched as legend value kinds by vss-centers.js).

### How a kind choice enters the state: straight-through Gumbel-softmax, mixing the complex unit vectors

- Forward: each occurrence j of a learnable word draws one hard kind, c_j = argmax_a (l_w[a] + Gumbel noise). The state is exactly
  V8.states for that hard kind sequence. Every term is a word star at a unit-modulus route-book address, so the forward pass uses
  the reader's own VSA algebra and is a legal hard-kind model at every step. The read-off (argmax) is therefore consistent with what
  was trained.
- Backward: the relaxed choice y_j = softmax(l_w + Gumbel noise), at temperature 1, enters through the mixture of the pool's
  complex unit vectors:
  - path factor z_j = sum_a y_j(a) exp(i path[a]); the path term is prod_{l<=j} z_l;
  - bigram sum_{a,b} y_(j-1)(a) y_j(b) exp(i bg[a,b]);
  - chain sum_{a,b} y_q(a) y_k(b) exp(i A[a,b]), and the same for L;
  - gate sum_a y_j(a) g_a.

  For path and bigram this is the exact expectation of the term over the kind draw. For the chain recursion it is the mean-field
  expectation.
- Why not mix the phases (sum_a y(a) theta_a): this is not defined on the circle. theta and theta + 2 pi are the same phase but give
  different mixtures and different gradients.
- Implementation: dl = y - y.detach() has value exactly 0 and carries the gradient of y. The forward value is unchanged, and the
  gradient is that of the mixture at the drawn kinds, to first order, which is what a straight-through estimator uses.
  - Path: P_j * (1 + sum_{l<=j} dl_l . u[pool] * conj(u[c_l])). Its value is exactly P_j, its first derivative is that of
    prod_l z_l, and |u| = 1.
  - Bigram, A and L: the hard table entry plus two einsums, one for the varying choice on each side of the pair, over the pool only
    (B x T x Mc x D gathers; the sentences are short: mean 5.7 tokens, max 22).
- Optimizer: one Adam over theta, the gate logits and the kind logits, at the trainer's lr (no separate rate). The loss, the
  zeroing of the root row and the finite-loss assertion are the same as in experiment/trainer.train_loop.

### Unseen words: the `unknown` slot (not the mean distribution)

- At inference an unseen word has kind `unknown`, as in the standard reader, unchanged.
- `unknown` is one choice in every free word's pool. Every learnable word starts half unknown: l_w = 0 for the M slots and log(M)
  for `unknown`, so p_w(unknown) = 1/2 at the start.
- A word leaves `unknown` only when its occurrences pull it to a slot. Words with little evidence stay `unknown` and train the
  `unknown` address, as the rare words do today. Without this prior, the hard phase (no word dropout, standard trainer) would leave
  `unknown` untrained when every seen word took a slot.
- The constant log(M) is stated once here, not tuned. It acts as a soft, evidence-based frequency floor, which must be said when
  reporting.

### Switches (default behaviour unchanged)

| switch | where | effect | status |
|---|---|---|---|
| `--learn_kinds M` | `sop train` | run the soft phase, write the map, write no model | module written; the train.py argparse flag and the hook in `main()` (after the splits and the schema) are NOT added yet |
| `--learn_kinds_verbs V` | `sop train` | the event tokens learnable over V verb slots | in the module; flag not added |
| `--learn_kinds_out PATH` | `sop train` | where the map goes (default `<run_dir>/learned_kinds.tsv`) | in the module; flag not added |
| `KINDS_FILE=<tsv>` | msg_to_world.py env | every word listed in the file gets the file's kind (`unknown` = no entry; legend value tokens never overridden); every other word keeps today's rule | NOT implemented |

## Where the code stands

- `training/vss/tool/sop/learn_kinds.py` (new, untested: it has never been imported or run):
  - `learnable_words`;
  - `soft_states` (V8.states with the straight-through terms);
  - `SoftKinds` (Gumbel draw per occurrence, pool masks);
  - `run`, which:
    - builds the model through V8's structure at D 1, then LeanTheta with the whole table held (every slot pair can be reached) and
      the same initial stream as train.build_v8;
    - checks soft_states against V8.states with the relaxed part at 0;
    - trains with the batch, order and targets of train_one;
    - prints per epoch the p_w entropy (mean and occurrence-weighted, against the uniform log(M+1)), the share of words with
      p_max >= 0.9, the words whose argmax is unknown and the slots used;
    - writes the map and the per-slot word lists.
- No other repository file was changed. train.py and msg_to_world.py are untouched.
- Scratch only, no training: worlds built with the unchanged msg_to_world.py into
  `/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/lk/w20` and
  `/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/lk/w80`, with `stats.py` there (old data):
  - --frac 0.2: 1101 rows, 53 kinds, 38 own kinds, 193 unknown-kind word types;
  - --frac 0.8: 4282 rows, 102 kinds, 87 own kinds; 326 unknown-kind types, of which 185 are seen once; the most frequent is `,`
    (386 times).

  The repository's `llm_train/REAL_WORLD.md`, rewritten by those builds, was restored, and `git status` shows it unchanged.

## What remains if this is resumed

1. Add the three `sop train` flags and the hook in train.py `main()`.
2. Add `KINDS_FILE` to msg_to_world.py, with a kinds.tsv header that names the map file.
3. Unit checks:
   - soft_states vs V8.states, with the relaxed part 0;
   - for path + bigram with one learnable token, soft_states with dl = e_a - e_c must equal V8.states with kind C_a exactly
     (the expansion is exact there);
   - bit identity with the switches off: the world built with the HEAD and the edited msg_to_world.py, and a short `--stop_after`
     training with the HEAD and the edited tool.
4. Write the pre-registration here before any measured training:
   - the tiny check: entropy, p_max, slots with their words;
   - the main comparison: M = 32 vs the frequency kinds, on old data, --frac 0.8, seed 0, 2 epochs, the baseline's switches, scored
     on the dev file with llm_score.mjs SEG=gold and the own cut, plus error_analysis.mjs and the route-book size;
   - the criterion: SEG=gold not more than 0.5 points below the baseline AND the route book at most half its size.

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/fix_p80_s0` (cf0545a). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
