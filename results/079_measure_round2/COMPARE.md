# TRAIN_PLAN_R2.md: the round-2 readers (arm R2) vs the shipped readers (arm ALL), cost score on the test part

Cost score = (requests done right - 10 x (executed wrong + extras executed)) per 100 requested actions. VSS and SOP-BERT alone: each executes
above its own cost-score threshold, fitted out of fold on the situation's calibration part (int(sha256(id),16) % 3 == 0), 95% intervals from
1000 paired resamples of the test messages (fresh2/verdicts.mjs). VSS-BERT: the demo's combined reader, shipped = the shipped models with
docs/model/confidence/combined.json, R2 = the R2 models with the combined.json refit.sh fitted on the calibration part (variant d2), both
applied by combine/failures_vss_bert.mjs; 1000 paired resamples of the test messages (seed 0). The Rules execute everything.

| situation (test messages / requests) | VSS shipped | VSS R2 | SOP-BERT shipped | SOP-BERT R2 | VSS-BERT shipped | VSS-BERT R2 | Rules | VSS R2 - shipped | SOP-BERT R2 - shipped | VSS-BERT R2 - shipped |
|---|---|---|---|---|---|---|---|---|---|---|
| fresh2 (405 / 1313) | 15.2 [10.7, 19.4]<br>right 20.5%, conf. wrong 2.5% | 3.0 [0.4, 5.1]<br>right 4.6%, conf. wrong 3.2% | 35.9 [27.6, 44.4]<br>right 57.3%, conf. wrong 3.6% | 33.1 [24.1, 41.2]<br>right 52.2%, conf. wrong 3.5% | 42.4 [37.2, 47.3]<br>right 48.5%, conf. wrong 1.2% | 36.4 [27.9, 43.7]<br>right 51.6%, conf. wrong 2.9% | -331.7<br>right 58.3% | -12.1 [-15.9, -8.0] | -2.8 [-12.4, 7.1] | -6.0 [-12.4, -0.2] |
| short3 (340 / 432) | 0.0 [0.0, 0.0]<br>right 0.0%, conf. wrong - (asks everything) | 0.7 [0.0, 1.6]<br>right 0.7%, conf. wrong 0.0% | 4.2 [-1.4, 8.5]<br>right 6.5%, conf. wrong 3.4% | 0.0 [0.0, 0.0]<br>right 0.0%, conf. wrong - | 13.9 [-0.9, 25.9]<br>right 30.1%, conf. wrong 5.1% | 15.7 [1.7, 29.8]<br>right 36.6%, conf. wrong 5.4% | -156.7<br>right 56.2% | +0.7 [0.0, 1.6] | -4.2 [-8.4, 1.4] | +1.9 [-13.0, 16.9] |

A difference whose interval lies above 0 is a gain shown; an interval below 0 is a loss shown; otherwise not shown either way.

The conversion ceiling (convert_check.py --registry: the share of the requests whose world row reproduces the gold; what a perfect reading of
each world could reach):

| set | shipped (arm ALL) | R2 |
|---|---|---|
| llm_bench/short3 (no pending) | 61.0% | 63.8% |
| llm_bench/fresh2 (opus_a..d) | 74.2% | 76.5% |

Details: <situation>/ALL/report.md (shipped), <situation>/R2/report.md (new), <situation>/verdicts.md (G = shipped, T = R2),
vssbert/{ALL,R2}/rows.json (VSS-BERT per request), refit/records/*_report.md (the refit of the R2 confidences).
