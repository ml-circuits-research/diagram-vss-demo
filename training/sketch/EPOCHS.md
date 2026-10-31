# EPOCHS: is the low reading of the training messages caused by too little training, or by the reader's capacity?

## Pre-registration (fixed by the coordinator before training; do not edit)

Fact: the one-request VSS reader `fix_p80_s0` (old data, 80% fit split, D 1024, 2 epochs, `run_curve.sh` settings) reads its OWN
training messages only 65.3% right with requests cut as annotated (fit file: 947 messages, 4305 requests) and 61.0% on unseen dev
messages (253 messages, 1126 requests). With 2.4 times more data (`data2_p80_s0`) the fit stays 65.0%. 2 epochs was never tested
against more.

- Hypothesis: with 8 epochs instead of 2, same data, same seed, same everything else, the reading of the training messages rises.
- Measure: `llm_score.mjs` with SEG=gold on the fit file and on the dev file (vss line, wires right), plus the training loss at the
  end of training, for `fix_p80_s0` (2 epochs) and the new model `ep8_p80_s0` (8 epochs).
- Verdict: fit >= 80% means the training length was the cause; fit < 70% means the capacity of the reader (more training does not
  fit the data); in between: partly. The dev reading is reported too (does it follow the fit?).
- Run: `EPOCHS=8 PREFIX=ep8 SEED=0 ./run_curve.sh 0.8` (DATA unset = old data, as `fix_p80_s0`).

## Result

Run on 2026-10-31. Model `docs/model/ep8_p80_s0` (36 MB; run `runs/ep8_p80_D1024_e8_s0`), trained with
`EPOCHS=8 PREFIX=ep8 SEED=0 ./run_curve.sh 0.8` (947 messages, 4282 trainable rows). Both models re-scored with the same scorer
(`SEG=gold node llm_score.mjs`, `MODEL=<model>`); both files are training/dev messages with annotated spans (not test sets). The
2-epoch run reproduces the given 65.3% / 61.0%. Same seed: the first logged loss (step 500) is identical in both runs (-0.730), so
the runs differ only in length.

| model | epochs | fit wires right (4305) | fit messages fully right | dev wires right (1126) | dev messages fully right | training loss |
|---|---|---|---|---|---|---|
| fix_p80_s0 | 2 | 65.3% (2811) | 22.7% | 61.0% (687) | 14.6% | -0.730 at step 500 (only value logged; run ends at 7800 sentences) |
| ep8_p80_s0 | 8 | 67.4% (2900) | 27.7% | 63.1% (711) | 20.2% | -0.730 at step 500, -0.834 at step 3500 of 3900 (best logged -0.847, noisy) |

Rules on the same files (no training, unchanged): fit 68.1%, dev 70.4%. The trainer's own scores: held-out formulations 0.610 -> 0.669,
train sample 0.633 -> 0.743 (full catalog candidates).

Verdict: fit 67.4% < 70%: the capacity of the reader, not the training length. Four times more training gives +2.1 points on the fit
and +2.1 on dev; the reader does not fit its own training messages. Dev follows the fit (61.0 -> 63.1, gap to fit 4.3 -> 4.3 points),
so there is no sign of memorisation: the 8-epoch model is not overfit, and also does not fit the data.

Root causes (`error_analysis.mjs`, requests read alone from their annotated span; share of all 4305 fit requests; fit / dev in brackets
only where dev differs in direction):

| cause (where it sits) | 2 epochs | 8 epochs |
|---|---|---|
| A action word not recognized (front end) | 328 (7.6%) | 328 (7.6%) |
| B wrong action or type (model) | 237 (5.5%) | 213 (4.9%) |
| C reader refuses (model) | 26 (0.6%) | 30 (0.7%) |
| D value not reachable (front end) | 130 (3.0%) | 137 (3.2%) |
| E name not reachable (front end / context) | 219 (5.1%) | 219 (5.1%) |
| F role missed (model) | 272 (6.3%) | 293 (6.8%) |
| G description read differently | 35 (0.8%) | 35 (0.8%) |
| G role wrong (model) | 223 (5.2%) | 136 (3.2%) |
| fully right | 2835 (65.9%) | 2914 (67.7%) |

Dev: A 92 -> 92, B 73 -> 65, C 9 -> 8, D 25 -> 29, E 46 -> 48, F 81 -> 90, G-desc 18 -> 17, G role wrong 89 -> 60; fully right 61.5% -> 63.7%.

What fell with more training: "role wrong" (223 -> 136 on fit, 89 -> 60 on dev) and a little "wrong action" (237 -> 213). Some of the
wrong roles became "role missed" (272 -> 293), i.e. the reader now leaves the role empty instead of filling it with another word.
What did not fall: A (328), E (219), D (130-137), G-description (35) are identical or nearly so: these sit in the front end (the
word never gets an event or value token, the name is a pronoun or from context), which training length cannot change; together
they are 16.5% of all requests. Reader status on fit (4305 requests):

| model | ok | abstain | unknown-event | no-sense |
|---|---|---|---|---|
| fix_p80_s0 (2 epochs) | 2909 | 1042 | 299 | 55 |
| ep8_p80_s0 (8 epochs) | 3268 | 679 | 288 | 70 |

More training makes the reader more certain (abstain 1042 -> 679, ok +359) and does not change unknown-event (299 -> 288) or no-sense
(55 -> 70), which come from the front end. Note on the wording of the verdict: the 70% line is the pre-registered cut for "capacity";
the part of the miss that cannot be trained away (the front-end causes A, D, E, G-description, 16.5% of requests) already caps the
fit at about 83% (100 - 16.5) before the reader makes any error of its own, so the capacity verdict is partly a front-end verdict. This is an
observation, not a new test; no further run was made.

Files: `training/sketch/run_curve.sh` (EPOCHS env, default 2, the command line is unchanged when it is unset), `training/sketch/EPOCHS.md`,
`docs/model/ep8_p80_s0/`, `training/sketch/runs/ep8_p80_D1024_e8_s0*`. `llm_train/REAL_WORLD.md` was restored with git checkout.
