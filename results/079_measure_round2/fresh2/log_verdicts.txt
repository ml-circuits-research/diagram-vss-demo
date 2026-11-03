# Verdicts of FEEDBACK_PLAN.md (cost score), written by training/sketch/fresh2/verdicts.mjs

Arms (records read):

| arm | records | reader |
|---|---|---|
| VSS-G | results/079_measure_round2/fresh2/ALL/records/vss_arm.jsonl | VSS |
| VSS-T | results/079_measure_round2/fresh2/R2/records/vss_arm.jsonl | VSS |
| BERT-G | results/079_measure_round2/fresh2/ALL/records/sop_arm_own.jsonl | SOP-BERT |
| BERT-T | results/079_measure_round2/fresh2/R2/records/sop_arm_own.jsonl | SOP-BERT |

Messages: 600 in the data dirs; calibration (fresh2 calibration part only, no CAL_FOLDERS) 195 messages / 596 requested actions; test 405 messages / 1313 requested actions. Split: int(sha256(id), 16) % 3 == 0 is calibration. Each arm: confidences and the cost-score threshold fitted on the calibration part only (fit_report.mjs recipe, out-of-fold); the test part is only scored. Score = (done right - 10 x (executed wrong + extras executed)) / requested actions x 100. Bootstrap: 1000 resamples of the 405 test messages, seed 1, the same resamples for every arm (paired); intervals are the 2.5% and 97.5% quantiles.

## Check: each arm's score against its own report.md

| arm | row of report.md | report.md: threshold (cal score, executed) and test score [95% CI] | this script | same? |
|---|---|---|---|---|
| VSS-G | VSS ALL | 0.8885 (9.2, 143); 15.2 [10.7, 19.4] | 0.8885 (9.2, 143); 15.2 [10.7, 19.4] | yes |
| VSS-T | VSS R2 | 0.9419 (6.5, 39); 3.0 [0.4, 5.1] | 0.9419 (6.5, 39); 3.0 [0.4, 5.1] | yes |
| BERT-G | SOP-BERT ALL | 0.8074 (30.2, 378); 35.9 [27.6, 44.4] | 0.8074 (30.2, 378); 35.9 [27.6, 44.4] | yes |
| BERT-T | SOP-BERT R2 | 0.8487 (30.5, 325); 33.1 [24.1, 41.2] | 0.8487 (30.5, 325); 33.1 [24.1, 41.2] | yes |

## Per arm (test part, at the arm's own cost-score threshold)

| arm | threshold | score [95% CI] | done right % | confidently wrong % (executed) | asked % | extras executed | execute-all right / wrong / not done % |
|---|---|---|---|---|---|---|---|
| VSS-G | 0.8885 | 15.2 [10.7, 19.4] | 20.5 | 2.5 (276 executed) | 59.8 | 2 | 66.6 / 14.1 / 19.3 (extras 157) |
| VSS-T | 0.9419 | 3.0 [0.4, 5.1] | 4.6 | 3.2 (62 executed) | 76.5 | 0 | 66.2 / 15.1 / 18.7 (extras 157) |
| BERT-G | 0.8074 | 35.9 [27.6, 44.4] | 57.3 | 3.6 (780 executed) | 37.9 | 7 | 80.8 / 15.9 / 3.3 (extras 113) |
| BERT-T | 0.8487 | 33.1 [24.1, 41.2] | 52.2 | 3.5 (710 executed) | 43.7 | 5 | 81.2 / 16.2 / 2.6 (extras 102) |

Requests done right % at <= 3% confidently wrong (the test part's own curve; reported beside, NOT the verdict):

| arm | done right % at <= 3% [95% CI] |
|---|---|
| VSS-G | 22.2 [12.3, 29.8] |
| VSS-T | 7.8 [1.8, 25.1] |
| BERT-G | 56.1 [49.4, 61.5] |
| BERT-T | 45.5 [40.3, 62.0] |

## Verdicts on the cost score (the measure)

| # | quantity | point | 95% CI | verdict |
|---|---|---|---|---|
| 1 | VSS-T - VSS-G (score) | -12.1 | [-15.9, -8.0] | interval not above 0: not shown |
| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | -9.3 | [-19.4, 2.2] | interval not above 0: not shown |
| 3 | VSS-T score vs the 95% CI of BERT-T's score | VSS-T 3.0 | BERT-T [24.1, 41.2] | VSS-T outside BERT-T's interval: not reached |

## The same three on requests done right % at <= 3% confidently wrong (beside, not the verdict)

| # | quantity | point (percentage points) | 95% CI | reading |
|---|---|---|---|---|
| 1 | VSS-T - VSS-G | -14.5 | [-22.7, 3.0] | interval not above 0 |
| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | -3.8 | [-23.2, 13.6] | interval not above 0 |
| 3 | VSS-T vs the 95% CI of BERT-T | VSS-T 7.8 | BERT-T [40.3, 62.0] | outside |

A miss on any line is a negative result; no second try with the same test part (FEEDBACK_PLAN.md).
