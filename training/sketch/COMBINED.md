# COMBINED.md: the three single fixes together (pre-registered 2026-10-31)

## Pre-registration (written before the training)

Each fix passed alone against `fix_p80_s0` (old data, `--frac 0.8`, seed 0, 2 epochs; dev file
`review/dev.jsonl`, main scorer `llm_score.mjs`). Numbers: requests cut as annotated (SEG=gold) / own cut.

| model / fix                | SEG=gold | own cut |
|----------------------------|---------:|--------:|
| fix_p80_s0 (baseline)      |    61.0% |   47.1% |
| CAL_FALLBACK=train         |    62.0% |   47.9% |
| QCOLOR=1                   |    62.7% |   48.8% |
| MARKER=0                   |    63.6% |   50.0% |

Front end v2 is NOT included (it hurt the own cut).

- Hypothesis: the three fixes add up (they act on different places: calibration of roles with few examples, the colour role of
  count / exists / list questions, the occupancy marker of the reader), so all three together beat each of them alone.
- Run: `CAL_FALLBACK=train QCOLOR=1 MARKER=0 PREFIX=comb1 SEED=0 ./run_curve.sh 0.8` -> `docs/model/comb1_p80_s0`. Same data, split,
  seed and epochs as `fix_p80_s0`. One change (the three switches), one training, one measurement.
- Measure: `llm_score.mjs` with SEG=gold and with the own cut on the old dev file; `error_analysis.mjs` on the same file, compared with
  `fix_p80_s0`. Report only (not part of the criterion): `dev_new/msg2`, `dev_new/long`, and the fit file `fitset`
  (how well the model fits its own data; `fix_p80_s0`: 65.3%).
- Criterion: SEG=gold >= 63.6% AND own cut >= 50.0% (at least the best single fix on both).
- If the criterion is missed: stop and report it. No patches, no second try.

## Result (model `docs/model/comb1_p80_s0`; run log `runs/comb1_p80_D1024_e2_s0.log`)

Scorer `llm_score.mjs` (VSS column, "wires right"), MODEL=comb1_p80_s0. Dev file `review/dev.jsonl` (253 messages, 1126 requests; it was
read before, it is a held-out part of the training messages' kind, not a fresh test set). `fix_p80_s0` re-scored here on the same files.

| file                                   | fix_p80_s0 | comb1_p80_s0 | best single fix |
|----------------------------------------|-----------:|-------------:|----------------:|
| dev, SEG=gold (cut as annotated)       |      61.0% |    **65.5%** (738/1126) | 63.6% (MARKER=0) |
| dev, own cut                           |      47.1% |    **52.7%** (593/1126) | 50.0% (MARKER=0) |
| dev_new/msg2, SEG=gold (report only)   |          - |        51.4% (474/923) | |
| dev_new/msg2, own cut (report only)    |          - |        44.1% (407/923) | |
| dev_new/long, SEG=gold (report only)   |          - |        47.4% (246/519) | |
| dev_new/long, own cut (report only)    |          - |        38.7% (201/519) | |
| fitset, SEG=gold (fit to its own data) |      65.3% |    68.8% (2961/4305) | |
| fitset, own cut                        |      48.1% |    52.0% (2239/4305) | |

(No fix_p80_s0 numbers were re-run for dev_new/msg2 and long; the rules reader on them: msg2 65.4%, long 56.3%.)

Criterion: SEG=gold >= 63.6% AND own cut >= 50.0%. Got 65.5% and 52.7%. **PASS** on both. The gains are close to additive:
+4.5 (gold) and +5.6 (own cut) against the baseline; the best single fix gave +2.6 and +2.9. Extra wires: 71 -> 64 (gold), 335 -> 328 (own cut).

### Error analysis (`error_analysis.mjs`, dev, each request read alone from its span; vs fix_p80_s0)

Fully right 693 (61.5%) -> 743 (66.0%) (this scorer counts a request fully right; the 61.0% above is the wire count of llm_score).
Misses 433 -> 383. Reader status: ok 731 -> 808, abstain 294 -> 221, unknown-event 83 -> 76, no-sense 18 -> 21.

| first cause (where it sits)                          | fix_p80_s0 | comb1 |
|------------------------------------------------------|-----------:|------:|
| A action word not recognized (front end)             |         92 |    92 |
| B wrong action or type (model)                       |         73 |    66 |
| C reader refuses (model)                             |          9 |     5 |
| D value not reachable (front end)                    |         25 |    27 |
| E name not reachable (context / pronoun, our code)   |         46 |    46 |
| F role missed (model / calibration)                  |         81 |    63 |
| G description read differently (converter)           |         18 |     6 |
| G role wrong (model)                                 |         89 |    78 |

Where the gain comes from: F -18, G description -12, G role wrong -11, B -7, C -4 (total -50). A, D, E did not move: they sit in the
front end and in context resolution, which none of the three fixes touches. They are now 165 of the 383 misses (43%), the largest
block left; A (92 requests, e.g. "slide ... to the left by 80 pixels", "Does the Gripper touch the Arm", "Are the Jump and the Tunnel
connected" read as unknown-event) is a data / front-end cause. Remaining model-side misses: G role wrong 78 (e.g. connect chain roles
`Connect Alpha to Beta, then Beta to Launch2`, and `$new` targets), F 63, B 66 (connected / neighbors / check confused).
New examples of F/B appear on the other side too (e.g. "Is Start still connected to Check" now read ok with the wrong frame), so the
trade is not one-way, but the totals fall in every model-side row.

dev_new/msg2 and dev_new/long are weaker than the dev file (51.4% / 47.4% with gold cut; the own cut loses a further 7-9 points), as
the baseline was not measured there, they say nothing about the fixes, only the level of the model on newer, longer text.
