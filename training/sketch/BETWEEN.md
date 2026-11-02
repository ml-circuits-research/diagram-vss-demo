# "between A and B" read with one anchor in shapes7c (pre-registered 2026-11-02, before the run)

**Cause (measured on readings, create gold planB7/goldev/create, SEG=gold path of llm_score.mjs).** The second anchor is dropped by
the reader's presence decision for `landmark2`, not by the adapter or the front end:

- On the 131 gold "between" create requests, shapes7c places `landmark2` in 60; in 57 of the other 71 its presence ratio is under
  the threshold. create_w places it in 125 (6 under its threshold).
- The thresholds: create_w 0.290, shapes7c 0.399, shapes7 0.395. The median presence ratio on these requests is about the same
  (create_w 0.48, shapes7c 0.42), so shapes7c's threshold cuts through the middle of the present class.
- Why: the presence thresholds are fitted (`fit_threshold`, train.py) on a calibration sample of `--n_cal 400` training rows (plus
  the calibration halves of the held-out formulations). That sample holds 63 rows with `landmark2` in create_w (922 rows) but only 9 in
  shapes7c (6334 rows; REPORT.md: "present 0.433, n 9 / absent 0.085, n 672"). Read again on all 6334 training rows, the 0.399
  threshold keeps only 59.9% of the present `landmark2` (balanced accuracy 0.80). The same rule fitted on all rows gives 0.146 (97.8%
  kept, balanced accuracy 0.98).
- The adapter is not the cause: whenever the reader places `landmark2`, vss-adapter.js `place()` emits the two anchors.
- The front end differs too, but it is a small effect here. create_w learned the value `and -> between` (precision 0.84 in create spans), so its
  rows read "between n_a between n_b". In shapes7c's pool "and" has precision 0.23 (set 310, fact 77 spans without it), so the rows
  keep "and". After the threshold fix shapes7c reads 106 of 131 right and create_w 109.
- Direct check (no retraining, the threshold changed at read time): `landmark2` 0.146 -> create 70.3 -> 75.3 right (wrong 20.1 ->
  15.1); between position+anchor right 57 -> 106 of 131; one-anchor readings 52 -> 3; no other relation changes; set, resize and rule
  are unchanged, and fact goes from 83.5 to 83.6. All thresholds refitted the same way on all rows: create 76.0, set 67.9 (+6.2),
  resize 69.6 (+4.0), fact 86.4 (+2.9), rule 70.6 (=).

**The count of a new group: the cause is different (front end).** shapes7c's front learned `add three -> 3`, `add two -> 2`,
`create two -> 2` instead of `two -> 2` and `three -> 3`. In the pooled create+set+resize+fact+rule spans, "two" and "three" have
precisions 0.63 and 0.67, below val_min_prec 0.8 (set 5+9, resize 3, fact 2 spans without a number), so the bigram wins. That value
eats the trigger verb: "add three small pink ellipses" becomes "3 small pink ellipses" (no `draw`), and 25 training rows are verbless
the same way. 48 of 87 gold counts are lost: 28 not read and 19 with quantity absent. A read-time diagnostic with the unigrams in place
of the bigrams brings this to 10 lost (create 648 -> 682 right). The presence threshold of `quantity` (n 7 present) is not the cause:
refitting it keeps the same rows. This needs a separate change in front.py value learning. One candidate is precision counted only
in spans of events whose legend has the value's role. FRONT_V2 MASK alone would drop the bigram but would also leave "two" as a word.

## Proposed change (one): calibrate the presence thresholds on all training rows

Hypothesis: the `landmark2` threshold of shapes7c is wrong because it is fitted on 9 present rows. Fitting it with the same rule on
all training rows (`--n_cal` >= the number of training rows) restores the second anchor. The word vectors do not change; only the
thresholds do. train.py has no calibrate-only mode (`--eval_only` keeps the thresholds), so the build retrains. It is also possible
to add such a mode and keep the vectors.

train_micro.sh passes `N_CAL` to `sop train --n_cal` and records it in BUILD.json (added with this pre-registration).

Run on the owner's GPU machine (training/laptop/README.md, job gpu-runs/jobs/010_shapes7d.sh):
```
N_CAL=100000 CREATE_COLOR=role SEED=0 DEVICE=cuda VSA_MEM_FRACTION=0.45 SOP_PYTHON=python3 DATA=spans FRONT_ROWS=world N_EVAL=150 \
  EVAL_MODES=primary VSA_MAX_HOURS=16 bash training/sketch/train_micro.sh shapes7d create,set,resize,fact,rule
```
**Baseline (coordinator, at pre-registration):** shapes7d is built on cuda, so the baseline is shapes7c_g0: the same build on cuda,
same seed, without N_CAL (SEEDS_SHAPES7.md). The thresholds below are written against shapes7c (cpu); when shapes7c_g0 is measured,
the same differences apply to its numbers (create right +3.7 and wrong -3.6; the other actions at most 1 point below), and both are
reported. The seed spread of SEEDS_SHAPES7.md says how much of a 1-point move is noise; the verdict uses the thresholds as written.

Measure: `MODEL=micro/shapes7d SEG=gold node training/sketch/llm_score.mjs planB7/goldev/<event>` for the 5 events, plus per-relation
position+anchor on create (the table below). REPORT.md `presence:landmark2` n present must be > 100.

Threshold "it worked" (against shapes7c):
- create right >= 74.0 (shapes7c 70.3; read-time estimate 75.3-76.0) and wrong <= 16.5 (20.1);
- between position+anchor right >= 95 of 131 (57; create_w 109), one-anchor readings <= 10 (52).

Regression: set, resize, fact or rule right more than 1 point below shapes7c (61.7, 65.6, 83.5, 70.6); or any other relation value's
position+anchor right on create more than 2 requests below the shapes7c table.

## Per relation, position+anchor right (SEG=gold)

shapes7c on create (922 requests; 871 with a position):

| position | n | right | % | not read | position wrong | anchor wrong |
|---|---|---|---|---|---|---|
| near | 325 | 260 | 80.0 | 34 | 26 | 5 |
| above | 131 | 113 | 86.3 | 12 | 4 | 2 |
| below | 133 | 115 | 86.5 | 9 | 3 | 6 |
| leftOf | 31 | 24 | 77.4 | 4 | 1 | 2 |
| rightOf | 63 | 48 | 76.2 | 9 | 2 | 4 |
| between | 131 | 57 | 43.5 | 4 | 1 | 69 |
| center | 7 | 5 | 71.4 | 1 | 1 | 0 |
| top | 10 | 7 | 70.0 | 2 | 1 | 0 |
| bottom | 12 | 9 | 75.0 | 3 | 0 | 0 |
| left | 5 | 0 | 0.0 | 1 | 4 | 0 |
| right | 4 | 0 | 0.0 | 1 | 3 | 0 |
| topLeft | 3 | 0 | 0.0 | 1 | 2 | 0 |
| topRight | 5 | 5 | 100.0 | 0 | 0 | 0 |
| bottomLeft | 5 | 0 | 0.0 | 0 | 5 | 0 |
| bottomRight | 6 | 5 | 83.3 | 1 | 0 | 0 |
| all | 871 | 648 | 74.4 | 82 | 53 | 88 |

position7 on move (3045 move requests; 2834 with a position):

| position | n | right | % | not read | position wrong | anchor wrong |
|---|---|---|---|---|---|---|
| near | 185 | 119 | 64.3 | 2 | 61 | 3 |
| above | 266 | 192 | 72.2 | 1 | 61 | 12 |
| below | 368 | 281 | 76.4 | 5 | 58 | 24 |
| leftOf | 252 | 156 | 61.9 | 2 | 92 | 2 |
| rightOf | 322 | 196 | 60.9 | 2 | 109 | 15 |
| between | 129 | 83 | 64.3 | 0 | 34 | 12 |
| center | 267 | 260 | 97.4 | 3 | 4 | 0 |
| top | 241 | 220 | 91.3 | 6 | 15 | 0 |
| bottom | 198 | 182 | 91.9 | 2 | 14 | 0 |
| left | 181 | 72 | 39.8 | 0 | 109 | 0 |
| right | 186 | 136 | 73.1 | 2 | 48 | 0 |
| topLeft | 53 | 50 | 94.3 | 0 | 3 | 0 |
| topRight | 58 | 55 | 94.8 | 0 | 3 | 0 |
| bottomLeft | 58 | 47 | 81.0 | 2 | 9 | 0 |
| bottomRight | 70 | 63 | 90.0 | 3 | 4 | 0 |
| all | 2834 | 2112 | 74.5 | 30 | 624 | 68 |

position7's `landmark2` threshold is fine: 0.220 keeps 100% of the present rows when read on all training rows. Its losses are a
position read as nothing, for example "Put Books at the left" -> `move n_books left_side` with no position, or "Rb should be left of
Qb" with no position. The cause of these is not established here.
