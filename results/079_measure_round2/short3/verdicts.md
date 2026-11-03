# Verdicts of FEEDBACK_PLAN.md (cost score), written by training/sketch/fresh2/verdicts.mjs

Arms (records read):

| arm | records | reader |
|---|---|---|
| VSS-G | results/079_measure_round2/short3/ALL/records/vss_arm.jsonl | VSS |
| VSS-T | results/079_measure_round2/short3/R2/records/vss_arm.jsonl | VSS |
| BERT-G | results/079_measure_round2/short3/ALL/records/sop_arm_own.jsonl | SOP-BERT |
| BERT-T | results/079_measure_round2/short3/R2/records/sop_arm_own.jsonl | SOP-BERT |

Messages: 513 in the data dirs; calibration (fresh2 calibration part only, no CAL_FOLDERS) 173 messages / 212 requested actions; test 340 messages / 432 requested actions. Split: int(sha256(id), 16) % 3 == 0 is calibration. Each arm: confidences and the cost-score threshold fitted on the calibration part only (fit_report.mjs recipe, out-of-fold); the test part is only scored. Score = (done right - 10 x (executed wrong + extras executed)) / requested actions x 100. Bootstrap: 1000 resamples of the 340 test messages, seed 1, the same resamples for every arm (paired); intervals are the 2.5% and 97.5% quantiles.

## Check: each arm's score against its own report.md

| arm | row of report.md | report.md: threshold (cal score, executed) and test score [95% CI] | this script | same? |
|---|---|---|---|---|
| VSS-G | VSS ALL | none: asks everything (0.0, 0); 0.0 [0.0, 0.0] | asks everything; 0.0 [0.0, 0.0] | yes |
| VSS-T | VSS R2 | 0.9311 (1.9, 4); 0.7 [0.0, 1.6] | 0.9311 (1.9, 4); 0.7 [0.0, 1.6] | yes |
| BERT-G | SOP-BERT ALL | 0.9424 (7.1, 15); 4.2 [-1.4, 8.5] | 0.9424 (7.1, 15); 4.2 [-1.4, 8.5] | yes |
| BERT-T | SOP-BERT R2 | 0.9933 (0.9, 2); 0.0 [0.0, 0.0] | 0.9933 (0.9, 2); 0.0 [0.0, 0.0] | yes |

## Per arm (test part, at the arm's own cost-score threshold)

| arm | threshold | score [95% CI] | done right % | confidently wrong % (executed) | asked % | extras executed | execute-all right / wrong / not done % |
|---|---|---|---|---|---|---|---|
| VSS-G | asks everything | 0.0 [0.0, 0.0] | 0.0 | - (0 executed) | 69.7 | 0 | 50.9 / 18.8 / 30.3 (extras 56) |
| VSS-T | 0.9311 | 0.7 [0.0, 1.6] | 0.7 | 0.0 (3 executed) | 70.4 | 0 | 52.5 / 18.5 / 28.9 (extras 53) |
| BERT-G | 0.9424 | 4.2 [-1.4, 8.5] | 6.5 | 3.4 (29 executed) | 82.9 | 0 | 68.5 / 21.1 / 10.4 (extras 32) |
| BERT-T | 0.9933 | 0.0 [0.0, 0.0] | 0.0 | - (0 executed) | 91.2 | 0 | 71.8 / 19.4 / 8.8 (extras 26) |

Requests done right % at <= 3% confidently wrong (the test part's own curve; reported beside, NOT the verdict):

| arm | done right % at <= 3% [95% CI] |
|---|---|
| VSS-G | 2.5 [1.1, 11.5] |
| VSS-T | 10.2 [3.4, 18.3] |
| BERT-G | 8.1 [3.2, 31.6] |
| BERT-T | 1.9 [0.7, 20.5] (3 of 1000 resamples had no prefix within 3%, counted as 0) |

## Verdicts on the cost score (the measure)

| # | quantity | point | 95% CI | verdict |
|---|---|---|---|---|
| 1 | VSS-T - VSS-G (score) | +0.7 | [0.0, 1.6] | interval not above 0: not shown |
| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | +4.9 | [-0.9, 9.2] | interval not above 0: not shown |
| 3 | VSS-T score vs the 95% CI of BERT-T's score | VSS-T 0.7 | BERT-T [0.0, 0.0] | VSS-T outside BERT-T's interval: not reached |

## The same three on requests done right % at <= 3% confidently wrong (beside, not the verdict)

| # | quantity | point (percentage points) | 95% CI | reading |
|---|---|---|---|---|
| 1 | VSS-T - VSS-G | +7.6 | [0.5, 14.3] | **interval above 0** |
| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | +13.9 | [-7.9, 32.2] | interval not above 0 |
| 3 | VSS-T vs the 95% CI of BERT-T | VSS-T 10.2 | BERT-T [0.7, 20.5] | **within** |

A miss on any line is a negative result; no second try with the same test part (FEEDBACK_PLAN.md).
