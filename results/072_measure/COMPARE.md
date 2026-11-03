# TRAIN_PLAN_1103.md: new (arm ALL) vs shipped readers, cost score on the test part

Cost score = (requests done right - 10 x (executed wrong + extras executed)) per 100 requested actions; each learned reader executes only
above its own cost-score threshold, fitted out of fold on the situation's calibration part (int(sha256(id),16) % 3 == 0); 95% intervals
from 1000 paired resamples of the test messages (fresh2/verdicts.mjs; the same draws for every reader). The Rules execute everything.

| situation (test messages / requests) | VSS shipped | VSS new | SOP-BERT shipped | SOP-BERT new | Rules | VSS new - shipped | SOP-BERT new - shipped |
|---|---|---|---|---|---|---|---|
| fresh2 (405 / 1313) | 12.1 [5.5, 18.5]<br>right 25.1%, conf. wrong 4.9% | 10.1 [6.4, 13.5]<br>right 13.2%, conf. wrong 2.3% | 14.4 [2.0, 26.7]<br>right 60.1%, conf. wrong 7.1% | 35.9 [27.6, 44.4]<br>right 57.3%, conf. wrong 3.6% | -331.7<br>right 58.3% | -2.0 [-8.9, 4.9] | +21.6 [9.7, 33.2] |
