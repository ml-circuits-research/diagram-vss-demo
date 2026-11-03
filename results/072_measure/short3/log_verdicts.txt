# Verdicts of FEEDBACK_PLAN.md (cost score), written by training/sketch/fresh2/verdicts.mjs

Arms (records read):

| arm | records | reader |
|---|---|---|
| VSS-G | results/072_measure/short3/G/records/vss_arm.jsonl | VSS |
| VSS-T | results/072_measure/short3/ALL/records/vss_arm.jsonl | VSS |
| BERT-G | results/072_measure/short3/G/records/sop_arm_own.jsonl | SOP-BERT |
| BERT-T | results/072_measure/short3/ALL/records/sop_arm_own.jsonl | SOP-BERT |

Messages: 513 in the data dirs; calibration (fresh2 calibration part only, no CAL_FOLDERS) 173 messages / 212 requested actions; test 340 messages / 432 requested actions. Split: int(sha256(id), 16) % 3 == 0 is calibration. Each arm: confidences and the cost-score threshold fitted on the calibration part only (fit_report.mjs recipe, out-of-fold); the test part is only scored. Score = (done right - 10 x (executed wrong + extras executed)) / requested actions x 100. Bootstrap: 1000 resamples of the 340 test messages, seed 1, the same resamples for every arm (paired); intervals are the 2.5% and 97.5% quantiles.

## Check: each arm's score against its own report.md

| arm | row of report.md | report.md: threshold (cal score, executed) and test score [95% CI] | this script | same? |
|---|---|---|---|---|
| VSS-G | VSS G | 0.6355 (4.2, 20); 6.3 [-1.6, 12.6] | 0.6355 (4.2, 20); 6.3 [-1.6, 12.6] | yes |
| VSS-T | VSS ALL | none: asks everything (0.0, 0); 0.0 [0.0, 0.0] | asks everything; 0.0 [0.0, 0.0] | yes |
| BERT-G | SOP-BERT G | 0.6795 (9.4, 20); 0.2 [-10.5, 10.3] | 0.6795 (9.4, 20); 0.2 [-10.5, 10.3] | yes |
| BERT-T | SOP-BERT ALL | 0.9424 (7.1, 15); 4.2 [-1.4, 8.5] | 0.9424 (7.1, 15); 4.2 [-1.4, 8.5] | yes |

## Per arm (test part, at the arm's own cost-score threshold)

| arm | threshold | score [95% CI] | done right % | confidently wrong % (executed) | asked % | extras executed | execute-all right / wrong / not done % |
|---|---|---|---|---|---|---|---|
| VSS-G | 0.6355 | 6.3 [-1.6, 12.6] | 10.9 | 4.1 (49 executed) | 40.3 | 1 | 36.8 / 14.6 / 48.6 (extras 47) |
| VSS-T | asks everything | 0.0 [0.0, 0.0] | 0.0 | - (0 executed) | 69.7 | 0 | 50.5 / 19.2 / 30.3 (extras 56) |
| BERT-G | 0.6795 | 0.2 [-10.5, 10.3] | 11.8 | 8.9 (56 executed) | 54.9 | 2 | 44.9 / 22.5 / 32.6 (extras 124) |
| BERT-T | 0.9424 | 4.2 [-1.4, 8.5] | 6.5 | 3.4 (29 executed) | 82.9 | 0 | 68.5 / 21.1 / 10.4 (extras 32) |

Requests done right % at <= 3% confidently wrong (the test part's own curve; reported beside, NOT the verdict):

| arm | done right % at <= 3% [95% CI] |
|---|---|
| VSS-G | 9.5 [6.4, 22.5] |
| VSS-T | 2.1 [0.7, 12.2] |
| BERT-G | 8.3 [4.0, 17.1] |
| BERT-T | 8.1 [3.2, 31.6] |

## Verdicts on the cost score (the measure)

| # | quantity | point | 95% CI | verdict |
|---|---|---|---|---|
| 1 | VSS-T - VSS-G (score) | -6.3 | [-12.5, 1.6] | interval not above 0: not shown |
| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | -10.2 | [-21.8, 1.2] | interval not above 0: not shown |
| 3 | VSS-T score vs the 95% CI of BERT-T's score | VSS-T 0.0 | BERT-T [-1.4, 8.5] | **VSS reaches SOP-BERT** |

## The same three on requests done right % at <= 3% confidently wrong (beside, not the verdict)

| # | quantity | point (percentage points) | 95% CI | reading |
|---|---|---|---|---|
| 1 | VSS-T - VSS-G | -7.4 | [-18.8, 1.4] | interval not above 0 |
| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | -7.2 | [-34.1, 4.7] | interval not above 0 |
| 3 | VSS-T vs the 95% CI of BERT-T | VSS-T 2.1 | BERT-T [3.2, 31.6] | outside |

A miss on any line is a negative result; no second try with the same test part (FEEDBACK_PLAN.md).
