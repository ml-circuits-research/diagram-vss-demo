# Future improvement ideas (parked 2026-11-03, to resume on Friday)

The owner, 2026-11-03 17:03: low quota this week; park the ideas here, write no more code, use only the trainings in progress.
Experiment ideas stay in `future-experiments.md`; this file lists the code and data work found while analysing the scene mistakes
(`training/sketch/scenes_r3/ROOT_CAUSES.md`).

## 1. Preprocessing fixes (started, unfinished: branch `wip/preprocess-fixes`, unreviewed, untested)
- **P3, a name at the start of a span**: "Buoy1: a tiny red circle ...", "Chair2, another ..." read as a name token (front.py / front.js,
  same rule in both, behind a build switch so the shipped models read as before).
- **P6, number words**: a mechanical number-word step for the number kind ("forty px" -> 40) in the VSS front end and in SOP-BERT's
  number alignment (make_roles.py today learns noisy pairs: "lights" -> 2, "circles" -> 2). It also unblocks job 082: SOP-BERT's label
  gate fails on scenes_r3b at 94.7% (threshold 95%) only on 5 gaps written in words.
- **Never drop a value silently**: VSS reads only x of "at 400, 300" -> the adapter drops `at` and the create runs elsewhere; SOP-BERT with
  more than two number spans drops `at` (P5: take the two adjacent numbers joined by a comma). A value the text has but the reader could not
  read completely should make the request uncertain (held, with the reason), not produce a different command.
- To finish: review the branch, parity tests (parity_front.mjs), test_*.mjs, regress.sh, then the round-3 jobs get the switches in
  `PREP_SWITCHES` (081, 082, 084).

## 2. Pre-training data checks (a systematic way to catch "the data never had it")
- **Legend coverage**: for every legend key / value and every SOP-BERT action, the number of examples in the training folders, per reader.
  It would have flagged width / height, fill faint / none and distance on create before any training.
- **Form audit of a new data set**: run the existing oracles (convert_check.py for VSS, roles_roundtrip.py for SOP-BERT) on it and group the
  failures by first cause, before the GPU.
- **Disagreement mining**: requests where VSS and SOP-BERT read differently (from the collected requests and the benchmark sets) as a list
  of data gaps to write data for.
- **Production loop**: the collected requests of the demo go through the two checks above regularly and feed the next data round.

## 3. Front-end learning (VSS)
- P4: bare "right of X" / "left of X" is not learned as a value (precision 0.78, because of "bottom right of"); VAL_SHADOW as tried lowered
  fresh2 by 1.7 pts. Needs a better rule for counting precision only where the n-gram is applied.
- fill_* / layer_* words: the shapes front end has none (comes with the scene data of round 3; check after 081).

## 4. Engine semantics (owner decision)
- "the background boxes": the data means every panel (background and zones); the engine selects only `layer === 'background'`.

## 5. Measurement
- VSS-BERT minus SOP-BERT alone, paired, with its 95% interval (today only each against its own baseline): shows whether pairing with VSS
  is a gain shown or a trend (fresh2: confidently wrong 3.6% -> 1.2%, right 57.3% -> 48.5%, cost score 35.9 -> 42.4).
- scenes_test intervals are too narrow: steps of one scene depend on each other (4 scenes); resample by scene.

## 6. Round 3 status (2026-11-03)
- Jobs 081-085 drafted and committed (bdd7241), `training/sketch/TRAIN_PLAN_R3.md` (pre-registered adoption rule).
- 081 (VSS R3) passes its gates on the CPU; 082 (SOP-BERT R3) stops at its label gate until P6 is in (item 1).
