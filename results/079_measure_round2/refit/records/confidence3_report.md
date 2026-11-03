# confidence3: report written by training/sketch/confidence3/fit3.mjs

Records: results/079_measure_round2/refit/records (combine/collect_pair.mjs + confidence3/collect_rules3.mjs; logic.js 1c33da63d25c). Data: training/sketch/llm_bench/fresh2/opus_a training/sketch/llm_bench/fresh2/opus_b training/sketch/llm_bench/fresh2/opus_c training/sketch/llm_bench/fresh2/opus_d results/079_measure_round2/data/short3. Calibration part 368 messages / 808 requested actions; test part 745 messages / 1745 requested actions.
Checks: outcomes recomputed = recorded; vss.json recipe refitted on cal vs the shipped file: max |difference| 0.00e+0.
Cost score = (right − 10 × (executed wrong + extras executed)) per 100 requested actions. "cal (oof)" = calibration part, out-of-fold confidences. "test" = the fresh2 test part. "short" = the short commands (synth_rules sample, generated from the Rules' grammar: favours the Rules).

## 1. Diagnosis (calibration part, current confidences (a))

### 1a. Reliability: predicted confidence (out of fold) against observed precision

| confidence bin | VSS: n · mean conf · observed right | SOP-BERT: n · mean conf · observed right | VSS-BERT: n · mean conf · observed right |
|---|---|---|---|
| 0.00–0.50 | 94 · 41.1% · 24.5% | 160 · 28.8% · 31.9% | 268 · 21.9% · 14.2% |
| 0.50–0.70 | 191 · 61.7% · 61.3% | 111 · 60.9% · 54.1% | 104 · 60.0% · 63.5% |
| 0.70–0.80 | 204 · 75.2% · 78.4% | 83 · 74.9% · 79.5% | 74 · 75.0% · 77.0% |
| 0.80–0.90 | 244 · 84.6% · 87.7% | 145 · 85.5% · 86.9% | 151 · 86.1% · 88.1% |
| 0.90–0.95 | 9 · 90.8% · 100.0% | 174 · 92.8% · 92.0% | 226 · 93.1% · 96.5% |
| 0.95–1.00 | 0 | 181 · 96.9% · 96.7% | 131 · 96.1% · 98.5% |

### 1b. Right requests held by each gate, and what holds them

Held right = requests whose reading is right but whose out-of-fold confidence is below the cost-10 threshold. Pulls are from the final model (all of the calibration part): pull = weight × (typical percentile − this request's percentile), in logit units; positive pulls the confidence down. "Freed by the prior at typical" = held right requests whose final-model confidence would clear the threshold if the prior input alone were at its typical value.

- **VSS** (threshold 0.8751): 523 right requests produced, **472 held (90.2%)**; held wrong or extra 218. Mean pull over the held right requests, largest first: wnu_gap 0.00 (weight 0.29), tie -0.00 (weight 0.18), cut_end -0.00 (weight 0.20), ctx_fill -0.00 (weight 0.31), abstain -0.00 (weight 0.23), role_min -0.00 (weight 0.30). Freed by the prior at typical: 14 of 472.
- **SOP-BERT** (threshold 0.9098): 638 right requests produced, **321 held (50.3%)**; held wrong or extra 200. Mean pull over the held right requests, largest first: act_prior 0.09 (weight 2.21), fill_p_min 0.07 (weight 0.89), fill_margin_min 0.07 (weight 0.85), tag_all_min 0.06 (weight 1.18), cut_start 0.06 (weight 1.30), none_p_min 0.04 (weight 0.85). Freed by the prior at typical: 28 of 321.
- **VSS-BERT** (threshold 0.8630): 641 right requests produced, **218 held (34.0%)**. By what the three readers did (the Rules only observed here):

| situation | produced | right | executed | right but held |
|---|---|---|---|---|
| R+V+S | 404 | 97.5% | 337 | 60 |
| V+S | 125 | 84.0% | 99 | 17 |
| none agree (paired) | 124 | 32.3% | 0 | 40 |
| R+S | 96 | 66.7% | 0 | 64 |
| S only | 90 | 33.3% | 0 | 30 |
| V only | 87 | 3.4% | 2 | 2 |
| R+V (not S) | 28 | 17.9% | 0 | 5 |

The act prior of SOP-BERT (shrunk share right per act, k = 5) for the layout acts: arrange 50.6% (15 right of 32); distribute 63.7% (2 right of 4); align 74.9% (9 right of 12); overall 74.7%. The world prior of VSS: help 53.7%, layout 59.3%, manage 59.9%, shapes 65.5%, links 66.5%, position 69.5%, history 76.4%, graphq 82.6%, questions 86.7%.

### 1c. How unstable the threshold is (1000 bootstrap resamples of the 368 calibration messages, the out-of-fold confidences fixed)

| reader | threshold (all cal) | threshold 2.5% / 50% / 97.5% | executed on cal at those three | cal score at the 2.5% and 97.5% thresholds |
|---|---|---|---|---|
| VSS | 0.8751 | 0.796 / 0.875 / 0.883 | 264 / 52 / 36 of 742 | -8.2 / 4.5 |
| SOP-BERT | 0.9098 | 0.817 / 0.903 / 0.950 | 472 / 352 / 181 of 854 | 13.5 / 14.2 |
| VSS-BERT | 0.8630 | 0.832 / 0.863 / 0.924 | 481 / 437 / 291 of 954 | 30.9 / 29.2 |

### 1d. False disagreements: order of a target list, list vs no target vs mention(quantifier=all) (d1)

- Calibration part, BERT cut: 666 SOP-BERT–VSS pairs, 137 disagree under canon; **0 of them agree under d1** (0 of those SOP-BERT readings are right).
- Test part, BERT cut: 1472 SOP-BERT–VSS pairs, 337 disagree under canon; **10 of them agree under d1** (7 of those SOP-BERT readings are right). Examples: {"action":"arrange","layout":"row"} vs {"action":"arrange","target":"mention(quantifier=all)","layout":"row"}; {"action":"arrange","layout":"circle"} vs {"action":"arrange","target":"mention(quantifier=all)","layout":"circle"}; {"action":"arrange","layout":"row"} vs {"action":"arrange","target":"mention(quantifier=all)","layout":"row"}; {"action":"arrange","layout":"circle"} vs {"action":"arrange","target":"mention(quantifier=all)","layout":"circle"}

## 2. The 3-reader vote (b): what each agreement pattern is worth (BERT cut; SOP-BERT's reading unless marked)

Agreement = canonical values equal:

| pattern | cal: produced · right % | test: produced · right % |
|---|---|---|
| R+V+S | 404 · 97.5% | 885 · 95.9% |
| R+S | 96 · 66.7% | 179 · 73.7% |
| V+S | 125 · 84.0% | 250 · 84.4% |
| S only | 90 · 33.3% | 182 · 40.1% |
| none agree (paired) | 124 · 32.3% | 263 · 37.3% |
| R+V (not S) (VSS's reading) | 28 · 32.1% | 55 · 47.3% |
| V only | 87 · 3.4% | 170 · 2.9% |

Agreement with d1 (engine-true equivalence for arrange / distribute targets):

| pattern | cal: produced · right % | test: produced · right % |
|---|---|---|
| R+V+S | 404 · 97.5% | 893 · 95.7% |
| R+S | 96 · 66.7% | 179 · 73.2% |
| V+S | 125 · 84.0% | 252 · 84.1% |
| S only | 90 · 33.3% | 182 · 40.1% |
| none agree (paired) | 124 · 32.3% | 256 · 36.7% |
| R+V (not S) (VSS's reading) | 28 · 32.1% | 52 · 42.3% |
| V only | 87 · 3.4% | 170 · 2.9% |


## 3. The methods (one table per method; each column at its own cost-10 threshold)

Confidently wrong % = of what it executed (wrong + extras), 1 − precision. Asked % = of the requested actions, read but held.

### (a) the current confidences

| situation | Rules: executes everything | VSS: (a) | SOP-BERT: (a) | VSS-BERT: (a) | - |
|---|---|---|---|---|---|
| threshold (cost 10, chosen on cal oof) | executes all | 0.8751 | 0.9098 | 0.8630 | - |
| AUROC (cal, oof) | - | 0.768 | 0.845 | 0.927 | - |
| **calibration (oof)**: score [95% CI] | -295.2 [-337.6, -251.3] | 5.1 [1.9, 7.7] | 19.4 [6.8, 30.7] | 33.8 [20.3, 44.9] | - |
| calibration (oof): precision of execution | 62.4% (761 executed) | 98.1% (52 executed) | 95.2% (333 executed) | 96.6% (438 executed) | - |
| calibration (oof): done right % · confidently wrong % · asked % | 58.8% · 37.6% · 0.0% | 6.3% · 1.9% · 71.4% | 39.2% · 4.8% · 55.4% | 52.4% · 3.4% · 43.2% | - |
| **test part**: score [95% CI] | -288.4 [-318.3, -258.9] | 3.2 [0.7, 5.1] | 29.1 [24.0, 33.9] | 35.2 [28.0, 41.9] | - |
| test part: precision of execution | 62.5% (1612 executed) | 96.6% (89 executed) | 97.8% (673 executed) | 96.8% (944 executed) | - |
| test part: done right % · confidently wrong % · asked % | 57.8% · 37.5% · 0.0% | 4.9% · 3.4% · 73.6% | 37.7% · 2.2% · 57.5% | 52.4% · 3.2% · 43.2% | - |

### (b) the vote, no fitted weights (VSS / SOP-BERT: execute its own reading when ≥ 1 other reader agrees; 3-vote: 3/3 and ≥ 2/3)

| situation | Rules: executes everything | VSS: (b) agrees with ≥1 other | SOP-BERT: (b) agrees with ≥1 other | - | 3-vote: (b) vote 3/3 | 3-vote: (b) vote ≥2/3 |
|---|---|---|---|---|---|---|
| threshold (cost 10, chosen on cal oof) | executes all | ≥ 3 agree | ≥ 3 agree | - | ≥ 3 agree | ≥ 2 agree |
| AUROC (cal, oof) | - | 0.888 | 0.866 | - | 0.878 | 0.878 |
| **calibration (oof)**: score [95% CI] | -295.2 [-337.6, -251.3] | 17.3 [0.6, 32.0] | 36.4 [27.9, 44.0] | - | 36.4 [27.9, 44.0] | -29.5 [-57.3, -6.7] |
| calibration (oof): precision of execution | 62.4% (761 executed) | 94.1% (404 executed) | 97.5% (404 executed) | - | 97.5% (404 executed) | 87.6% (653 executed) |
| calibration (oof): done right % · confidently wrong % · asked % | 58.8% · 37.6% · 0.0% | 47.0% · 5.9% · 28.8% | 48.8% · 2.5% · 46.7% | - | 48.8% · 2.5% · 47.4% | 70.8% · 12.4% · 20.3% |
| **test part**: score [95% CI] | -288.4 [-318.3, -258.9] | 14.3 [3.8, 24.2] | 28.0 [20.3, 35.6] | - | 28.0 [20.3, 35.6] | -16.7 [-31.1, -2.2] |
| test part: precision of execution | 62.5% (1612 executed) | 93.5% (877 executed) | 95.9% (885 executed) | - | 95.9% (885 executed) | 89.0% (1369 executed) |
| test part: done right % · confidently wrong % · asked % | 57.8% · 37.5% · 0.0% | 47.0% · 6.5% · 29.9% | 48.7% · 4.1% · 45.8% | - | 48.7% · 4.1% · 46.8% | 69.8% · 11.0% · 20.5% |

### (c) the vote as inputs of the fitted logistics

| situation | Rules: executes everything | VSS: (c) | SOP-BERT: (c) | VSS-BERT: (c) | 3-vote: (c) |
|---|---|---|---|---|---|
| threshold (cost 10, chosen on cal oof) | executes all | 0.8002 | 0.8849 | 0.8869 | 0.9223 |
| AUROC (cal, oof) | - | 0.906 | 0.921 | 0.941 | 0.941 |
| **calibration (oof)**: score [95% CI] | -295.2 [-337.6, -251.3] | 20.2 [2.6, 34.9] | 40.3 [32.6, 47.0] | 39.5 [30.2, 47.0] | 41.3 [31.8, 49.7] |
| calibration (oof): precision of execution | 62.4% (761 executed) | 94.4% (427 executed) | 98.3% (403 executed) | 98.0% (407 executed) | 98.1% (422 executed) |
| calibration (oof): done right % · confidently wrong % · asked % | 58.8% · 37.6% · 0.0% | 49.9% · 5.6% · 26.1% | 49.0% · 1.7% · 46.7% | 49.4% · 2.0% · 46.9% | 51.2% · 1.9% · 45.0% |
| **test part**: score [95% CI] | -288.4 [-318.3, -258.9] | 11.0 [-0.2, 21.6] | 32.8 [26.1, 39.6] | 30.7 [23.8, 37.7] | 31.7 [24.7, 38.0] |
| test part: precision of execution | 62.5% (1612 executed) | 92.8% (940 executed) | 96.7% (892 executed) | 96.3% (899 executed) | 96.4% (917 executed) |
| test part: done right % · confidently wrong % · asked % | 57.8% · 37.5% · 0.0% | 50.0% · 7.2% · 26.4% | 49.5% · 3.3% · 45.2% | 49.6% · 3.7% · 46.0% | 50.7% · 3.6% · 44.7% |

### (d) the best fix of the menu per column (by cal oof score)

| situation | Rules: executes everything | VSS: (c) + d2 no prior + d5 per-type thr. | SOP-BERT: (c) + d1 | VSS-BERT: (c) + d1 + d5 per-type thr. | 3-vote: (c) + d1 + d5 per-type thr. |
|---|---|---|---|---|---|
| threshold (cost 10, chosen on cal oof) | executes all | cmd 0.8944 / q 0.5569 | 0.8849 | cmd 0.8869 / q 0.9140 | cmd 0.9224 / q 0.9143 |
| AUROC (cal, oof) | - | 0.906 | 0.921 | 0.941 | 0.941 |
| **calibration (oof)**: score [95% CI] | -295.2 [-337.6, -251.3] | 23.5 [7.3, 37.0] | 40.3 [32.6, 47.0] | 40.6 [33.2, 46.8] | 41.5 [32.0, 49.7] |
| calibration (oof): precision of execution | 62.4% (761 executed) | 95.5% (377 executed) | 98.3% (403 executed) | 98.5% (394 executed) | 98.1% (423 executed) |
| calibration (oof): done right % · confidently wrong % · asked % | 58.8% · 37.6% · 0.0% | 44.6% · 4.5% · 31.7% | 49.0% · 1.7% · 46.7% | 48.0% · 1.5% · 48.4% | 51.4% · 1.9% · 44.9% |
| **test part**: score [95% CI] | -288.4 [-318.3, -258.9] | 21.7 [13.9, 29.7] | 32.8 [26.1, 39.6] | 30.0 [22.9, 36.9] | 31.3 [24.4, 37.7] |
| test part: precision of execution | 62.5% (1612 executed) | 95.1% (829 executed) | 96.7% (892 executed) | 96.3% (886 executed) | 96.3% (920 executed) |
| test part: done right % · confidently wrong % · asked % | 57.8% · 37.5% · 0.0% | 45.2% · 4.9% · 32.0% | 49.5% · 3.3% · 45.2% | 48.9% · 3.7% · 46.7% | 50.8% · 3.7% · 44.5% |

### b3/b2 with d1 (engine-true agreement)

| situation | 3-vote: (b) vote + d1 3/3 | 3-vote: (b) vote + d1 ≥2/3 |
|---|---|---|
| threshold (cost 10, chosen on cal oof) | ≥ 3 agree | ≥ 2 agree |
| AUROC (cal, oof) | 0.878 | 0.878 |
| **calibration (oof)**: score [95% CI] | 36.4 [27.9, 44.0] | -29.5 [-57.3, -6.7] |
| calibration (oof): precision of execution | 97.5% (404 executed) | 87.6% (653 executed) |
| calibration (oof): done right % · confidently wrong % · asked % | 48.8% · 2.5% · 47.4% | 70.8% · 12.4% · 20.3% |
| **test part**: score [95% CI] | 27.2 [19.0, 35.1] | -19.5 [-34.8, -4.6] |
| test part: precision of execution | 95.7% (893 executed) | 88.7% (1376 executed) |
| test part: done right % · confidently wrong % · asked % | 49.0% · 4.3% · 46.4% | 69.9% · 11.3% · 20.1% |

## 4. Every variant tried (calibration out-of-fold cost score at cost 10; the selection rule of PLAN.md picks the highest; a tie keeps the earlier row)

| column | variant | family | threshold | cal oof score | done right % · confidently wrong % | AUROC |
|---|---|---|---|---|---|---|
| VSS | (a) | a | 0.8751 | 5.1 | 6.3% · 1.9% | 0.768 |
| VSS | (a) + d5 per-type thr. | a | cmd 0.8865 / q 0.7126 | 7.5 | 17.5% · 5.4% | 0.768 |
| SOP-BERT | (a) | a | 0.9098 | 19.4 | 39.2% · 4.8% | 0.845 |
| SOP-BERT | (a) + d5 per-type thr. | a | cmd 0.8830 / q 0.9504 | 25.4 | 40.2% · 3.6% | 0.845 |
| VSS-BERT | (a) | a | 0.8630 | 33.8 | 52.4% · 3.4% | 0.927 |
| VSS-BERT | (a) + d5 per-type thr. | a | cmd 0.8945 / q 0.8622 | 34.0 | 46.4% · 2.6% | 0.927 |
| VSS | (a) + d3 k50 | d | 0.8755 | 4.8 | 6.1% · 2.0% | 0.766 |
| VSS | (a) + d3 k50 + d5 per-type thr. | d | cmd 0.8832 / q 0.7436 | 7.3 | 16.0% · 5.1% | 0.766 |
| SOP-BERT | (a) + d3 k50 | d | 0.8742 | 20.4 | 47.6% · 5.4% | 0.844 |
| SOP-BERT | (a) + d3 k50 + d5 per-type thr. | d | cmd 0.8755 / q 0.9359 | 26.1 | 43.4% · 3.8% | 0.844 |
| VSS-BERT | (a) + d3 k50 | d | 0.8671 | 32.2 | 52.0% · 3.7% | 0.925 |
| VSS-BERT | (a) + d3 k50 + d5 per-type thr. | d | cmd 0.9005 / q 0.8665 | 32.4 | 44.8% · 2.7% | 0.925 |
| VSS | (a) + d2 no prior | d | 0.8675 | 3.5 | 7.2% · 4.9% | 0.754 |
| VSS | (a) + d2 no prior + d5 per-type thr. | d | cmd 0.8675 / q 0.6623 | 6.6 | 21.4% · 6.5% | 0.754 |
| SOP-BERT | (a) + d2 no prior | d | 0.9106 | 18.2 | 39.2% · 5.1% | 0.844 |
| SOP-BERT | (a) + d2 no prior + d5 per-type thr. | d | cmd 0.9329 / q 0.9118 | 19.3 | 34.2% · 4.2% | 0.844 |
| VSS-BERT | (a) + d2 no prior | d | 0.9213 | 34.5 | 49.4% · 2.9% | 0.925 |
| VSS-BERT | (a) + d2 no prior + d5 per-type thr. | d | cmd 0.9213 / q 0.9127 | 34.9 | 49.8% · 2.9% | 0.925 |
| VSS | (b) agrees with ≥1 other | b | ≥ 3 agree | 17.3 | 47.0% · 5.9% | 0.888 |
| VSS | (b) agrees with ≥1 other + d5 per-type thr. | b | cmd ≥ 3 agree / q ≥ 2 agree | 18.2 | 50.4% · 6.0% | 0.888 |
| SOP-BERT | (b) agrees with ≥1 other | b | ≥ 3 agree | 36.4 | 48.8% · 2.5% | 0.866 |
| SOP-BERT | (b) agrees with ≥1 other + d5 per-type thr. | b | cmd ≥ 3 agree / q ≥ 3 agree | 36.4 | 48.8% · 2.5% | 0.866 |
| 3-vote | (b) vote | b | ≥ 3 agree | 36.4 | 48.8% · 2.5% | 0.878 |
| 3-vote | (b) vote + d5 per-type thr. | b | cmd ≥ 3 agree / q ≥ 3 agree | 36.4 | 48.8% · 2.5% | 0.878 |
| VSS | (c) | c | 0.8002 | 20.2 | 49.9% · 5.6% | 0.906 |
| VSS | (c) + d5 per-type thr. | c | cmd 0.9015 / q 0.5809 | 22.5 | 42.3% · 4.5% | 0.906 |
| SOP-BERT | (c) **(chosen)** | c | 0.8849 | 40.3 | 49.0% · 1.7% | 0.921 |
| SOP-BERT | (c) + d5 per-type thr. | c | cmd 0.8849 / q 0.9073 | 40.3 | 47.8% · 1.5% | 0.921 |
| VSS-BERT | (c) | c | 0.8869 | 39.5 | 49.4% · 2.0% | 0.941 |
| VSS-BERT | (c) + d5 per-type thr. **(chosen)** | c | cmd 0.8869 / q 0.9140 | 40.6 | 48.0% · 1.5% | 0.941 |
| 3-vote | (c) | c | 0.9223 | 41.3 | 51.2% · 1.9% | 0.941 |
| 3-vote | (c) + d5 per-type thr. **(chosen)** | c | cmd 0.9223 / q 0.9143 | 41.5 | 51.4% · 1.9% | 0.941 |
| VSS | (c) + d3 k50 | d | 0.8002 | 20.3 | 50.0% · 5.6% | 0.906 |
| VSS | (c) + d3 k50 + d5 per-type thr. | d | cmd 0.9044 / q 0.5856 | 22.9 | 41.5% · 4.3% | 0.906 |
| SOP-BERT | (c) + d3 k50 | d | 0.9249 | 39.1 | 50.2% · 2.2% | 0.919 |
| SOP-BERT | (c) + d3 k50 + d5 per-type thr. | d | cmd 0.9212 / q 0.8611 | 39.9 | 52.2% · 2.3% | 0.919 |
| VSS-BERT | (c) + d3 k50 | d | 0.9232 | 39.5 | 50.6% · 2.2% | 0.940 |
| VSS-BERT | (c) + d3 k50 + d5 per-type thr. | d | cmd 0.9232 / q 0.8706 | 40.1 | 52.5% · 2.3% | 0.940 |
| 3-vote | (c) + d3 k50 | d | 0.8871 | 40.1 | 56.2% · 2.8% | 0.941 |
| 3-vote | (c) + d3 k50 + d5 per-type thr. | d | cmd 0.8871 / q 0.8665 | 40.5 | 56.6% · 2.8% | 0.941 |
| VSS | (c) + d2 no prior | d | 0.8120 | 19.2 | 48.9% · 5.7% | 0.906 |
| VSS | (c) + d2 no prior + d5 per-type thr. **(chosen)** | d | cmd 0.8944 / q 0.5569 | 23.5 | 44.6% · 4.5% | 0.906 |
| SOP-BERT | (c) + d2 no prior | d | 0.9122 | 38.4 | 52.0% · 2.6% | 0.918 |
| SOP-BERT | (c) + d2 no prior + d5 per-type thr. | d | cmd 0.9138 / q 0.9463 | 39.4 | 50.5% · 2.2% | 0.918 |
| VSS-BERT | (c) + d2 no prior | d | 0.9093 | 38.6 | 52.2% · 2.5% | 0.940 |
| VSS-BERT | (c) + d2 no prior + d5 per-type thr. | d | cmd 0.9093 / q 0.9475 | 39.7 | 50.9% · 2.1% | 0.940 |
| 3-vote | (c) + d2 no prior | d | 0.8912 | 40.3 | 56.4% · 2.8% | 0.940 |
| 3-vote | (c) + d2 no prior + d5 per-type thr. | d | cmd 0.8912 / q 0.8875 | 40.7 | 56.8% · 2.8% | 0.940 |
| VSS | (b) agrees with ≥1 other + d1 | d | ≥ 3 agree | 17.3 | 47.0% · 5.9% | 0.888 |
| VSS | (b) agrees with ≥1 other + d1 + d5 per-type thr. | d | cmd ≥ 3 agree / q ≥ 2 agree | 18.2 | 50.4% · 6.0% | 0.888 |
| SOP-BERT | (b) agrees with ≥1 other + d1 | d | ≥ 3 agree | 36.4 | 48.8% · 2.5% | 0.866 |
| SOP-BERT | (b) agrees with ≥1 other + d1 + d5 per-type thr. | d | cmd ≥ 3 agree / q ≥ 3 agree | 36.4 | 48.8% · 2.5% | 0.866 |
| 3-vote | (b) vote + d1 | d | ≥ 3 agree | 36.4 | 48.8% · 2.5% | 0.878 |
| 3-vote | (b) vote + d1 + d5 per-type thr. | d | cmd ≥ 3 agree / q ≥ 3 agree | 36.4 | 48.8% · 2.5% | 0.878 |
| VSS | (c) + d1 | d | 0.8002 | 20.2 | 49.9% · 5.6% | 0.906 |
| VSS | (c) + d1 + d5 per-type thr. | d | cmd 0.9015 / q 0.5809 | 22.5 | 42.3% · 4.5% | 0.906 |
| SOP-BERT | (c) + d1 | d | 0.8849 | 40.3 | 49.0% · 1.7% | 0.921 |
| SOP-BERT | (c) + d1 + d5 per-type thr. | d | cmd 0.8849 / q 0.9073 | 40.3 | 47.8% · 1.5% | 0.921 |
| VSS-BERT | (c) + d1 | d | 0.8869 | 39.5 | 49.4% · 2.0% | 0.941 |
| VSS-BERT | (c) + d1 + d5 per-type thr. | d | cmd 0.8869 / q 0.9140 | 40.6 | 48.0% · 1.5% | 0.941 |
| 3-vote | (c) + d1 | d | 0.9224 | 41.3 | 51.2% · 1.9% | 0.941 |
| 3-vote | (c) + d1 + d5 per-type thr. | d | cmd 0.9224 / q 0.9143 | 41.5 | 51.4% · 1.9% | 0.941 |
| VSS | (c) + d1 + d3 k50 | d | 0.8002 | 20.3 | 50.0% · 5.6% | 0.906 |
| VSS | (c) + d1 + d3 k50 + d5 per-type thr. | d | cmd 0.9044 / q 0.5856 | 22.9 | 41.5% · 4.3% | 0.906 |
| SOP-BERT | (c) + d1 + d3 k50 | d | 0.9249 | 39.1 | 50.2% · 2.2% | 0.919 |
| SOP-BERT | (c) + d1 + d3 k50 + d5 per-type thr. | d | cmd 0.9212 / q 0.8611 | 39.9 | 52.2% · 2.3% | 0.919 |
| VSS-BERT | (c) + d1 + d3 k50 | d | 0.9232 | 39.5 | 50.6% · 2.2% | 0.940 |
| VSS-BERT | (c) + d1 + d3 k50 + d5 per-type thr. | d | cmd 0.9232 / q 0.8706 | 40.1 | 52.5% · 2.3% | 0.940 |
| 3-vote | (c) + d1 + d3 k50 | d | 0.8871 | 40.1 | 56.2% · 2.8% | 0.941 |
| 3-vote | (c) + d1 + d3 k50 + d5 per-type thr. | d | cmd 0.8871 / q 0.8665 | 40.5 | 56.6% · 2.8% | 0.941 |
| VSS | (c) + d1 + d2 no prior | d | 0.8120 | 19.2 | 48.9% · 5.7% | 0.906 |
| VSS | (c) + d1 + d2 no prior + d5 per-type thr. | d | cmd 0.8944 / q 0.5569 | 23.5 | 44.6% · 4.5% | 0.906 |
| SOP-BERT | (c) + d1 + d2 no prior | d | 0.9122 | 38.4 | 52.0% · 2.6% | 0.918 |
| SOP-BERT | (c) + d1 + d2 no prior + d5 per-type thr. | d | cmd 0.9138 / q 0.9463 | 39.4 | 50.5% · 2.2% | 0.918 |
| VSS-BERT | (c) + d1 + d2 no prior | d | 0.9093 | 38.6 | 52.2% · 2.5% | 0.940 |
| VSS-BERT | (c) + d1 + d2 no prior + d5 per-type thr. | d | cmd 0.9093 / q 0.9475 | 39.7 | 50.9% · 2.1% | 0.940 |
| 3-vote | (c) + d1 + d2 no prior | d | 0.8913 | 40.3 | 56.4% · 2.8% | 0.940 |
| 3-vote | (c) + d1 + d2 no prior + d5 per-type thr. | d | cmd 0.8913 / q 0.8875 | 40.7 | 56.8% · 2.8% | 0.940 |

## 5. Verdicts (test part, once; paired bootstrap over the 745 test messages, 1000 resamples, seed 1)

| column | chosen (cal oof score) | current (a) (cal oof score) | test: chosen · current | difference [95% CI] | verdict |
|---|---|---|---|---|---|
| VSS | (c) + d2 no prior + d5 per-type thr. (23.5) | 5.1 | 21.7 · 3.2 | 18.5 [10.3, 26.9] | **better** |
| SOP-BERT | (c) (40.3) | 19.4 | 32.8 · 29.1 | 3.7 [-2.6, 10.0] | not shown |
| VSS-BERT | (c) + d5 per-type thr. (40.6) | 33.8 | 30.0 · 35.2 | -5.2 [-10.9, 0.7] | not shown |
| 3-vote vs VSS-BERT (a) | (c) + d5 per-type thr. (41.5) | 33.8 | 31.3 · 35.2 | -3.9 [-9.4, 1.6] | not shown |

### The "3 readers" tab: the weight-free vote 3/3 (+ d1, as the page) against the fitted vote ((c) + d5 per-type thr.)

Confidently wrong = (wrong + extras executed) / executed. Difference = 3/3 − fitted, in points of the confidently-wrong rate (positive: the fitted vote is wrong less often), and in cost score; 95% paired bootstrap over messages (1000 resamples, seed 1).

| part | 3/3: executed · wrong + extras · confidently wrong % · score | fitted: executed · wrong + extras · confidently wrong % · score | confidently wrong, 3/3 − fitted [95% CI] | score, fitted − 3/3 [95% CI] |
|---|---|---|---|---|
| calibration (oof) (368 messages, 808 requested) | 404 · 10 · 2.5% · 36.4 | 423 · 8 · 1.9% · 41.5 | 0.6 [-1.1, 2.1] | 5.1 [-3.5, 13.4] |
| test part (745 messages, 1745 requested) | 893 · 38 · 4.3% · 27.2 | 920 · 34 · 3.7% · 31.3 | 0.6 [-0.4, 1.5] | 4.1 [-1.1, 9.5] |
| calibration (oof), fresh2 only (195 messages, 596 requested) | 334 · 6 · 1.8% · 45.0 | 347 · 5 · 1.4% · 49.0 | 0.4 [-1.5, 1.9] | 4.0 [-7.1, 13.2] |
| calibration (oof), short3 only (173 messages, 212 requested) | 70 · 4 · 5.7% · 12.3 | 76 · 3 · 3.9% · 20.3 | 1.8 [-2.7, 6.5] | 8.0 [-8.0, 24.2] |
| test part, fresh2 only (405 messages, 1313 requested) | 727 · 30 · 4.1% · 30.2 | 733 · 23 · 3.1% · 36.6 | 1.0 [0.1, 2.0] | 6.3 [0.6, 12.2] |
| test part, short3 only (340 messages, 432 requested) | 166 · 8 · 4.8% · 18.1 | 187 · 11 · 5.9% · 15.3 | -1.1 [-4.2, 2.1] | -2.8 [-17.1, 11.4] |

### The chosen variant of each column (the selection rule)

| situation | Rules: executes everything | VSS: (c) + d2 no prior + d5 per-type thr. | SOP-BERT: (c) | VSS-BERT: (c) + d5 per-type thr. | 3-vote: (c) + d5 per-type thr. |
|---|---|---|---|---|---|
| threshold (cost 10, chosen on cal oof) | executes all | cmd 0.8944 / q 0.5569 | 0.8849 | cmd 0.8869 / q 0.9140 | cmd 0.9223 / q 0.9143 |
| AUROC (cal, oof) | - | 0.906 | 0.921 | 0.941 | 0.941 |
| **calibration (oof)**: score [95% CI] | -295.2 [-337.6, -251.3] | 23.5 [7.3, 37.0] | 40.3 [32.6, 47.0] | 40.6 [33.2, 46.8] | 41.5 [32.0, 49.7] |
| calibration (oof): precision of execution | 62.4% (761 executed) | 95.5% (377 executed) | 98.3% (403 executed) | 98.5% (394 executed) | 98.1% (423 executed) |
| calibration (oof): done right % · confidently wrong % · asked % | 58.8% · 37.6% · 0.0% | 44.6% · 4.5% · 31.7% | 49.0% · 1.7% · 46.7% | 48.0% · 1.5% · 48.4% | 51.4% · 1.9% · 44.9% |
| **test part**: score [95% CI] | -288.4 [-318.3, -258.9] | 21.7 [13.9, 29.7] | 32.8 [26.1, 39.6] | 30.0 [22.9, 36.9] | 31.3 [24.5, 37.8] |
| test part: precision of execution | 62.5% (1612 executed) | 95.1% (829 executed) | 96.7% (892 executed) | 96.3% (886 executed) | 96.3% (920 executed) |
| test part: done right % · confidently wrong % · asked % | 57.8% · 37.5% · 0.0% | 45.2% · 4.9% · 32.0% | 49.5% · 3.3% · 45.2% | 48.9% · 3.7% · 46.7% | 50.8% · 3.7% · 44.5% |

The chosen variants, cost 5 / 10 / 20 thresholds (cal oof): VSS (c) + d2 no prior + d5 per-type thr.: cmd 0.6626 / q 0.5569 / cmd 0.8944 / q 0.5569 / cmd 0.9479 / q 0.7421; SOP-BERT (c): 0.7303 / 0.8849 / 0.9251; VSS-BERT (c) + d5 per-type thr.: cmd 0.7421 / q 0.7942 / cmd 0.8869 / q 0.9140 / cmd 0.9281 / q 0.9140; 3-vote (c) + d5 per-type thr.: cmd 0.8728 / q 0.8688 / cmd 0.9223 / q 0.9143 / cmd 0.9437 / q 0.9625.

Selection optimism: the chosen variant is the best of 22-16 on 195 messages; its calibration score is optimistic, the test part is the check.
