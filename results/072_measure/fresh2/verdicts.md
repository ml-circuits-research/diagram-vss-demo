# Verdicts of FEEDBACK_PLAN.md (cost score), written by training/sketch/fresh2/verdicts.mjs

Arms (records read):

| arm | records | reader |
|---|---|---|
| VSS-G | results/072_measure/fresh2/G/records/vss_arm.jsonl | VSS |
| VSS-T | results/072_measure/fresh2/ALL/records/vss_arm.jsonl | VSS |
| BERT-G | results/072_measure/fresh2/G/records/sop_arm_own.jsonl | SOP-BERT |
| BERT-T | results/072_measure/fresh2/ALL/records/sop_arm_own.jsonl | SOP-BERT |

Messages: 600 in the data dirs; calibration (fresh2 calibration part only, no CAL_FOLDERS) 195 messages / 596 requested actions; test 405 messages / 1313 requested actions. Split: int(sha256(id), 16) % 3 == 0 is calibration. Each arm: confidences and the cost-score threshold fitted on the calibration part only (fit_report.mjs recipe, out-of-fold); the test part is only scored. Score = (done right - 10 x (executed wrong + extras executed)) / requested actions x 100. Bootstrap: 1000 resamples of the 405 test messages, seed 1, the same resamples for every arm (paired); intervals are the 2.5% and 97.5% quantiles.

## Check: each arm's score against its own report.md

| arm | row of report.md | report.md: threshold (cal score, executed) and test score [95% CI] | this script | same? |
|---|---|---|---|---|
| VSS-G | VSS G | 0.8140 (8.1, 169); 12.1 [5.5, 18.5] | 0.8140 (8.1, 169); 12.1 [5.5, 18.5] | yes |
| VSS-T | VSS ALL | 0.9072 (8.1, 103); 10.1 [6.4, 13.5] | 0.9072 (8.1, 103); 10.1 [6.4, 13.5] | yes |
| BERT-G | SOP-BERT G | 0.8233 (24.8, 401); 14.4 [2.0, 26.7] | 0.8233 (24.8, 401); 14.4 [2.0, 26.7] | yes |
| BERT-T | SOP-BERT ALL | 0.8074 (30.2, 378); 35.9 [27.6, 44.4] | 0.8074 (30.2, 378); 35.9 [27.6, 44.4] | yes |

## Per arm (test part, at the arm's own cost-score threshold)

| arm | threshold | score [95% CI] | done right % | confidently wrong % (executed) | asked % | extras executed | execute-all right / wrong / not done % |
|---|---|---|---|---|---|---|---|
| VSS-G | 0.8140 | 12.1 [5.5, 18.5] | 25.1 | 4.9 (346 executed) | 53.2 | 5 | 62.2 / 17.0 / 20.8 (extras 118) |
| VSS-T | 0.9072 | 10.1 [6.4, 13.5] | 13.2 | 2.3 (177 executed) | 67.3 | 0 | 64.2 / 16.5 / 19.3 (extras 157) |
| BERT-G | 0.8233 | 14.4 [2.0, 26.7] | 60.1 | 7.1 (849 executed) | 32.5 | 5 | 78.8 / 18.1 / 3.2 (extras 107) |
| BERT-T | 0.8074 | 35.9 [27.6, 44.4] | 57.3 | 3.6 (780 executed) | 37.9 | 7 | 80.8 / 15.9 / 3.3 (extras 113) |

Requests done right % at <= 3% confidently wrong (the test part's own curve; reported beside, NOT the verdict):

| arm | done right % at <= 3% [95% CI] |
|---|---|
| VSS-G | 19.9 [12.6, 26.8] |
| VSS-T | 20.8 [8.4, 27.0] |
| BERT-G | 20.4 [6.8, 33.3] |
| BERT-T | 56.1 [49.4, 61.5] |

## Verdicts on the cost score (the measure)

| # | quantity | point | 95% CI | verdict |
|---|---|---|---|---|
| 1 | VSS-T - VSS-G (score) | -2.0 | [-8.9, 4.9] | interval not above 0: not shown |
| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | -23.5 | [-37.5, -9.1] | interval not above 0: not shown |
| 3 | VSS-T score vs the 95% CI of BERT-T's score | VSS-T 10.1 | BERT-T [27.6, 44.4] | VSS-T outside BERT-T's interval: not reached |

## The same three on requests done right % at <= 3% confidently wrong (beside, not the verdict)

| # | quantity | point (percentage points) | 95% CI | reading |
|---|---|---|---|---|
| 1 | VSS-T - VSS-G | +0.9 | [-11.8, 8.1] | interval not above 0 |
| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | -34.8 | [-55.3, -17.7] | interval not above 0 |
| 3 | VSS-T vs the 95% CI of BERT-T | VSS-T 20.8 | BERT-T [49.4, 61.5] | outside |

A miss on any line is a negative result; no second try with the same test part (FEEDBACK_PLAN.md).
