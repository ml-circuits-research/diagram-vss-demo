# Verdicts of FEEDBACK_PLAN.md (cost score), written by training/sketch/fresh2/verdicts.mjs

Arms (records read):

| arm | records | reader |
|---|---|---|
| VSS-G | gpu-runs:results/065_arm_vss_G_resume/records/vss_arm.jsonl | VSS |
| VSS-T | gpu-runs:results/066_arm_vss_T_resume/records/vss_arm.jsonl | VSS |
| BERT-G | gpu-runs:results/062_arm_bert_G/records/sop_arm_own.jsonl | SOP-BERT |
| BERT-T | gpu-runs:results/064_arm_bert_T/records/sop_arm_own.jsonl | SOP-BERT |

Messages: 600 in the data dirs; calibration (fresh2 calibration part only, no CAL_FOLDERS) 195 messages / 596 requested actions; test 405 messages / 1313 requested actions. Split: int(sha256(id), 16) % 3 == 0 is calibration. Each arm: confidences and the cost-score threshold fitted on the calibration part only (fit_report.mjs recipe, out-of-fold); the test part is only scored. Score = (done right - 10 x (executed wrong + extras executed)) / requested actions x 100. Bootstrap: 1000 resamples of the 405 test messages, seed 1, the same resamples for every arm (paired); intervals are the 2.5% and 97.5% quantiles.

## Check: each arm's score against its own report.md

| arm | row of report.md | report.md: threshold (cal score, executed) and test score [95% CI] | this script | same? |
|---|---|---|---|---|
| VSS-G | VSS VSS-G | 0.8964 (8.2, 115); 12.9 [9.2, 16.5] | 0.8964 (8.2, 115); 12.9 [9.2, 16.5] | yes |
| VSS-T | VSS VSS-T | 0.9073 (7.4, 99); 8.5 [4.1, 12.7] | 0.9073 (7.4, 99); 8.5 [4.1, 12.7] | yes |
| BERT-G | SOP-BERT BERT-G | 0.8233 (24.8, 401); 14.4 [2.0, 26.7] | 0.8233 (24.8, 401); 14.4 [2.0, 26.7] | yes |
| BERT-T | SOP-BERT BERT-T | 0.9149 (17.1, 278); 18.6 [9.3, 28.0] | 0.9149 (17.1, 278); 18.6 [9.3, 28.0] | yes |

## Per arm (test part, at the arm's own cost-score threshold)

| arm | threshold | score [95% CI] | done right % | confidently wrong % (executed) | asked % | extras executed | execute-all right / wrong / not done % |
|---|---|---|---|---|---|---|---|
| VSS-G | 0.8964 | 12.9 [9.2, 16.5] | 15.9 | 1.9 (213 executed) | 63.1 | 1 | 60.4 / 18.8 / 20.8 (extras 118) |
| VSS-T | 0.9073 | 8.5 [4.1, 12.7] | 13.9 | 3.7 (189 executed) | 64.9 | 1 | 61.4 / 17.8 / 20.8 (extras 122) |
| BERT-G | 0.8233 | 14.4 [2.0, 26.7] | 60.1 | 7.1 (849 executed) | 32.5 | 5 | 78.7 / 18.1 / 3.2 (extras 107) |
| BERT-T | 0.9149 | 18.6 [9.3, 28.0] | 44.5 | 5.5 (618 executed) | 50.7 | 4 | 78.0 / 19.5 / 2.5 (extras 104) |

Requests done right % at <= 3% confidently wrong (the test part's own curve; reported beside, NOT the verdict):

| arm | done right % at <= 3% [95% CI] |
|---|---|
| VSS-G | 18.1 [13.7, 26.4] |
| VSS-T | 12.9 [2.2, 22.8] |
| BERT-G | 20.4 [6.8, 33.3] |
| BERT-T | 19.8 [3.8, 42.3] |

## Verdicts on the cost score (the measure)

| # | quantity | point | 95% CI | verdict |
|---|---|---|---|---|
| 1 | VSS-T - VSS-G (score) | -4.3 | [-8.4, -0.4] | interval not above 0: not shown |
| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | -8.5 | [-20.4, 2.8] | interval not above 0: not shown |
| 3 | VSS-T score vs the 95% CI of BERT-T's score | VSS-T 8.5 | BERT-T [9.3, 28.0] | VSS-T outside BERT-T's interval: not reached |

## The same three on requests done right % at <= 3% confidently wrong (beside, not the verdict)

| # | quantity | point (percentage points) | 95% CI | reading |
|---|---|---|---|---|
| 1 | VSS-T - VSS-G | -5.1 | [-15.3, 2.4] | interval not above 0 |
| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | -4.5 | [-25.3, 13.2] | interval not above 0 |
| 3 | VSS-T vs the 95% CI of BERT-T | VSS-T 12.9 | BERT-T [3.8, 42.3] | **within** |

A miss on any line is a negative result; no second try with the same test part (FEEDBACK_PLAN.md).
