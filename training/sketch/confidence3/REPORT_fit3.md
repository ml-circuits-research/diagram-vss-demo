# confidence3: report written by training/sketch/confidence3/fit3.mjs

Records: <scratchpad>/conf3/rec_fresh2 (combine/collect_pair.mjs + confidence3/collect_rules3.mjs; logic.js e4e0707194be). Data: training/sketch/llm_bench/fresh2/opus_a training/sketch/llm_bench/fresh2/opus_b training/sketch/llm_bench/fresh2/opus_c training/sketch/llm_bench/fresh2/opus_d. Calibration part 195 messages / 596 requested actions; test part 405 messages / 1313 requested actions. Short commands "synth": <scratchpad>/conf3/rec_short, 357 messages / 490 requested actions (evaluation only). Short commands "short3": <scratchpad>/conf3/rec_short3, 389 messages / 499 requested actions (evaluation only).
Checks: outcomes recomputed = recorded; vss.json recipe refitted on cal vs the shipped file: max |difference| 0.00e+0.
Cost score = (right − 10 × (executed wrong + extras executed)) per 100 requested actions. "cal (oof)" = calibration part, out-of-fold confidences. "test" = the fresh2 test part. "short" = the short commands (synth_rules sample, generated from the Rules' grammar: favours the Rules).

## 1. Diagnosis (calibration part, current confidences (a))

### 1a. Reliability: predicted confidence (out of fold) against observed precision

| confidence bin | VSS: n · mean conf · observed right | SOP-BERT: n · mean conf · observed right | VSS-BERT: n · mean conf · observed right |
|---|---|---|---|
| 0.00–0.50 | 88 · 33.5% · 38.6% | 122 · 25.8% · 25.4% | 180 · 22.6% · 12.8% |
| 0.50–0.70 | 121 · 61.8% · 54.5% | 58 · 62.2% · 58.6% | 64 · 61.7% · 65.6% |
| 0.70–0.80 | 94 · 75.7% · 74.5% | 57 · 75.2% · 68.4% | 57 · 75.6% · 77.2% |
| 0.80–0.90 | 142 · 85.4% · 86.6% | 108 · 86.2% · 90.7% | 117 · 86.2% · 86.3% |
| 0.90–0.95 | 100 · 92.5% · 94.0% | 115 · 92.6% · 95.7% | 189 · 92.9% · 97.9% |
| 0.95–1.00 | 11 · 95.8% · 100.0% | 191 · 97.3% · 94.2% | 99 · 96.2% · 99.0% |

### 1b. Right requests held by each gate, and what holds them

Held right = requests whose reading is right but whose out-of-fold confidence is below the cost-10 threshold. Pulls are from the final model (all of the calibration part): pull = weight × (typical percentile − this request's percentile), in logit units; positive pulls the confidence down. "Freed by the prior at typical" = held right requests whose final-model confidence would clear the threshold if the prior input alone were at its typical value.

- **VSS** (threshold 0.8964): 398 right requests produced, **289 held (72.6%)**; held wrong or extra 152. Mean pull over the held right requests, largest first: world_prior 0.06 (weight 1.72), cut_start 0.02 (weight 1.06), cut_end 0.01 (weight 0.72), wnu_gap 0.01 (weight 0.40), notu_frac 0.01 (weight 0.68), world_gap 0.00 (weight 0.37). Freed by the prior at typical: 11 of 289.
- **SOP-BERT** (threshold 0.8233): 492 right requests produced, **114 held (23.2%)**; held wrong or extra 136. Mean pull over the held right requests, largest first: fill_p_min 0.20 (weight 1.33), fill_margin_min 0.20 (weight 1.32), act_prior 0.14 (weight 1.51), cut_end 0.14 (weight 1.76), cut_start 0.14 (weight 1.16), tag_all_min 0.07 (weight 1.45). Freed by the prior at typical: 12 of 114.
- **VSS-BERT** (threshold 0.8701): 493 right requests produced, **157 held (31.8%)**. By what the three readers did (the Rules only observed here):

| situation | produced | right | executed | right but held |
|---|---|---|---|---|
| R+V+S | 316 | 98.4% | 271 | 42 |
| none agree (paired) | 95 | 42.1% | 3 | 38 |
| V+S | 92 | 83.7% | 66 | 14 |
| R+S | 69 | 66.7% | 2 | 44 |
| S only | 65 | 23.1% | 0 | 15 |
| V only | 51 | 2.0% | 0 | 1 |
| R+V (not S) | 18 | 16.7% | 0 | 3 |

The act prior of SOP-BERT (shrunk share right per act, k = 5) for the layout acts: arrange 55.6% (9 right of 18); distribute 64.2% (2 right of 4); align 64.8% (4 right of 7); overall 75.6%. The world prior of VSS: links 53.2%, shapes 68.8%, position 71.3%, manage 73.7%, questions 83.4%, graphq 85.2%, history 89.1%.

### 1c. How unstable the threshold is (1000 bootstrap resamples of the 195 calibration messages, the out-of-fold confidences fixed)

| reader | threshold (all cal) | threshold 2.5% / 50% / 97.5% | executed on cal at those three | cal score at the 2.5% and 97.5% thresholds |
|---|---|---|---|---|
| VSS | 0.8964 | 0.824 / 0.894 / 0.947 | 226 / 118 / 14 of 556 | 1.0 / 2.3 |
| SOP-BERT | 0.8233 | 0.787 / 0.845 / 0.978 | 426 / 385 / 80 of 651 | 19.8 / 9.7 |
| VSS-BERT | 0.8701 | 0.842 / 0.870 / 0.882 | 373 / 342 / 325 of 706 | 38.6 / 45.3 |

### 1d. False disagreements: order of a target list, list vs no target vs mention(quantifier=all) (d1)

- Calibration part, BERT cut: 523 SOP-BERT–VSS pairs, 115 disagree under canon; **0 of them agree under d1** (0 of those SOP-BERT readings are right).
- Test part, BERT cut: 1126 SOP-BERT–VSS pairs, 310 disagree under canon; **5 of them agree under d1** (3 of those SOP-BERT readings are right). Examples: {"action":"arrange","layout":"row"} vs {"action":"arrange","layout":"row","target":"search,api,ingestor,rawbucket,cleaner,cleanbucket,indexer"}; {"action":"arrange","layout":"circle"} vs {"action":"arrange","target":"mention(quantifier=all)","layout":"circle"}; {"action":"arrange","layout":"row"} vs {"action":"arrange","target":"mention(quantifier=all)","layout":"row"}; {"action":"arrange","layout":"row"} vs {"action":"arrange","layout":"row","target":"decoder,encoder,input,latent,loss,output"}
- Short commands "synth": 291 pairs, 143 disagree under canon; **3 agree under d1** (2 right). Examples: “build an oval. Space all dots out horizontally evenly”: {"action":"distribute","axis":"horizontal","target":"mention(quantifier=all)"} vs {"action":"distribute","axis":"horizontal","target":"bridge,shrine"}; “arrange all in a circle”: {"action":"arrange","layout":"circle"} vs {"action":"arrange","layout":"circle","target":"check,done,retry,start"}; “distribute all vertically”: {"action":"distribute","axis":"vertical","target":"mention(quantifier=all)"} vs {"action":"distribute","axis":"vertical","target":"check,done,retry,start"}
- Short commands "short3": 309 pairs, 92 disagree under canon; **7 agree under d1** (2 right). Examples: “distribute horizontally”: {"action":"distribute","axis":"horizontal"} vs {"action":"distribute","axis":"horizontal","target":"check,done,process,start"}; “stack everything in a column”: {"action":"arrange","layout":"column"} vs {"action":"arrange","target":"mention(quantifier=all)","layout":"column"}; “put all shapes in a row”: {"action":"arrange","layout":"row"} vs {"action":"arrange","target":"mention(quantifier=all)","layout":"row"}; “arrange in grid, then make all shapes tiny”: {"action":"arrange","layout":"grid"} vs {"action":"arrange","layout":"grid","target":"check,done,process,start"}

## 2. The 3-reader vote (b): what each agreement pattern is worth (BERT cut; SOP-BERT's reading unless marked)

Agreement = canonical values equal:

| pattern | cal: produced · right % | test: produced · right % | synth: produced · right % | short3: produced · right % |
|---|---|---|---|---|
| R+V+S | 316 · 98.4% | 650 · 97.5% | 126 · 100.0% | 148 · 88.5% |
| R+S | 69 · 66.7% | 134 · 69.4% | 85 · 98.8% | 54 · 83.3% |
| V+S | 92 · 83.7% | 166 · 89.8% | 22 · 0.0% | 69 · 69.6% |
| none agree (paired) | 95 · 42.1% | 250 · 40.0% | 191 · 2.6% | 79 · 15.2% |
| R+V (not S) (VSS's reading) | 18 · 55.6% | 50 · 52.0% | 30 · 100.0% | 18 · 50.0% |
| S only | 65 · 23.1% | 139 · 33.8% | 28 · 7.1% | 106 · 18.9% |
| V only | 51 · 2.0% | 94 · 1.1% | 66 · 0.0% | 76 · 7.9% |

Agreement with d1 (engine-true equivalence for arrange / distribute targets):

| pattern | cal: produced · right % | test: produced · right % | synth: produced · right % | short3: produced · right % |
|---|---|---|---|---|
| R+V+S | 316 · 98.4% | 654 · 97.2% | 128 · 100.0% | 150 · 88.7% |
| R+S | 69 · 66.7% | 133 · 69.9% | 84 · 98.8% | 52 · 82.7% |
| V+S | 92 · 83.7% | 167 · 89.8% | 23 · 0.0% | 74 · 64.9% |
| none agree (paired) | 94 · 42.6% | 247 · 39.7% | 188 · 1.6% | 72 · 16.7% |
| R+V (not S) (VSS's reading) | 19 · 52.6% | 49 · 51.0% | 31 · 100.0% | 20 · 45.0% |
| S only | 65 · 23.1% | 139 · 33.8% | 28 · 7.1% | 106 · 18.9% |
| V only | 51 · 2.0% | 94 · 1.1% | 66 · 0.0% | 76 · 7.9% |


## 3. The methods (one table per method; each column at its own cost-10 threshold)

Confidently wrong % = of what it executed (wrong + extras), 1 − precision. Asked % = of the requested actions, read but held.

### (a) the current confidences

| situation | Rules: executes everything | VSS: (a) | SOP-BERT: (a) | VSS-BERT: (a) | - |
|---|---|---|---|---|---|
| threshold (cost 10, chosen on cal oof) | executes all | 0.8964 | 0.8233 | 0.8701 | - |
| AUROC (cal, oof) | - | 0.776 | 0.872 | 0.939 | - |
| **calibration (oof)**: score [95% CI] | -347.8 [-404.5, -294.9] | 8.2 [-3.1, 17.6] | 24.8 [2.1, 43.2] | 46.3 [34.5, 55.3] | - |
| calibration (oof): precision of execution | 59.5% (600 executed) | 94.8% (115 executed) | 94.3% (401 executed) | 98.2% (342 executed) | - |
| calibration (oof): done right % · confidently wrong % · asked % | 59.9% · 40.5% · 0.0% | 18.3% · 5.2% · 63.4% | 63.4% · 5.7% · 31.7% | 56.4% · 1.8% · 41.3% | - |
| **test part**: score [95% CI] | -354.9 [-390.1, -316.6] | 12.9 [9.2, 16.5] | 14.4 [2.0, 26.7] | 40.6 [34.0, 47.0] | - |
| test part: precision of execution | 57.5% (1269 executed) | 98.1% (213 executed) | 92.9% (849 executed) | 97.7% (709 executed) | - |
| test part: done right % · confidently wrong % · asked % | 55.6% · 42.5% · 0.0% | 15.9% · 1.9% · 63.1% | 60.1% · 7.1% · 32.5% | 52.8% · 2.3% · 43.9% | - |
| **short commands synth**: score [95% CI] | 99.8 [99.4, 100.0] | -8.4 [-19.5, 1.6] | -94.9 [-124.4, -65.9] | -4.5 [-20.4, 9.8] | - |
| short commands synth: precision of execution | 100.0% (489 executed) | 80.6% (36 executed) | 71.4% (217 executed) | 89.3% (121 executed) | - |
| short commands synth: done right % · confidently wrong % · asked % | 99.8% · 0.0% · 0.0% | 5.9% · 19.4% · 49.0% | 31.6% · 28.6% · 48.8% | 22.0% · 10.7% · 68.6% | - |
| **short commands short3**: score [95% CI] | -206.6 [-249.8, -158.6] | -4.0 [-15.4, 5.8] | -121.2 [-158.4, -88.5] | -33.7 [-56.4, -12.2] | - |
| short commands short3: precision of execution | 66.0% (377 executed) | 87.7% (57 executed) | 69.2% (253 executed) | 82.1% (173 executed) | - |
| short commands short3: done right % · confidently wrong % · asked % | 49.9% · 34.0% · 0.0% | 10.0% · 12.3% · 47.5% | 35.1% · 30.8% · 33.3% | 28.5% · 17.9% · 49.7% | - |

### (b) the vote, no fitted weights (VSS / SOP-BERT: execute its own reading when ≥ 1 other reader agrees; 3-vote: 3/3 and ≥ 2/3)

| situation | Rules: executes everything | VSS: (b) agrees with ≥1 other | SOP-BERT: (b) agrees with ≥1 other | - | 3-vote: (b) vote 3/3 | 3-vote: (b) vote ≥2/3 |
|---|---|---|---|---|---|---|
| threshold (cost 10, chosen on cal oof) | executes all | ≥ 3 agree | ≥ 3 agree | - | ≥ 3 agree | ≥ 2 agree |
| AUROC (cal, oof) | - | 0.898 | 0.877 | - | 0.886 | 0.886 |
| **calibration (oof)**: score [95% CI] | -347.8 [-404.5, -294.9] | 23.0 [4.6, 38.5] | 43.8 [34.9, 52.4] | - | 43.8 [34.9, 52.4] | -11.1 [-39.4, 17.3] |
| calibration (oof): precision of execution | 59.5% (600 executed) | 94.9% (313 executed) | 98.4% (316 executed) | - | 98.4% (316 executed) | 89.7% (495 executed) |
| calibration (oof): done right % · confidently wrong % · asked % | 59.9% · 40.5% · 0.0% | 49.8% · 5.1% · 31.0% | 52.2% · 1.6% · 45.5% | - | 52.2% · 1.6% · 45.6% | 74.5% · 10.3% · 18.8% |
| **test part**: score [95% CI] | -354.9 [-390.1, -316.6] | 29.6 [21.8, 36.7] | 36.1 [29.3, 42.2] | - | 36.1 [29.3, 42.2] | -5.9 [-22.5, 8.9] |
| test part: precision of execution | 57.5% (1269 executed) | 96.4% (641 executed) | 97.5% (650 executed) | - | 97.5% (650 executed) | 90.2% (1000 executed) |
| test part: done right % · confidently wrong % · asked % | 55.6% · 42.5% · 0.0% | 47.1% · 3.6% · 31.2% | 48.3% · 2.5% · 48.0% | - | 48.3% · 2.5% · 48.8% | 68.7% · 9.8% · 23.9% |
| **short commands synth**: score [95% CI] | 99.8 [99.4, 100.0] | 24.9 [21.1, 28.9] | 25.7 [21.9, 29.8] | - | 25.7 [21.9, 29.8] | 2.0 [-19.0, 22.0] |
| short commands synth: precision of execution | 100.0% (489 executed) | 100.0% (122 executed) | 100.0% (126 executed) | - | 100.0% (126 executed) | 91.3% (263 executed) |
| short commands synth: done right % · confidently wrong % · asked % | 99.8% · 0.0% · 0.0% | 24.9% · 0.0% · 30.6% | 25.7% · 0.0% · 65.7% | - | 25.7% · 0.0% · 67.1% | 49.0% · 8.7% · 39.6% |
| **short commands short3**: score [95% CI] | -206.6 [-249.8, -158.6] | -7.8 [-24.2, 8.4] | -7.8 [-24.7, 8.3] | - | -7.8 [-24.7, 8.3] | -65.5 [-94.9, -38.3] |
| short commands short3: precision of execution | 66.0% (377 executed) | 88.5% (148 executed) | 88.5% (148 executed) | - | 88.5% (148 executed) | 80.6% (289 executed) |
| short commands short3: done right % · confidently wrong % · asked % | 49.9% · 34.0% · 0.0% | 26.3% · 11.5% · 29.5% | 26.3% · 11.5% · 50.1% | - | 26.3% · 11.5% · 53.9% | 46.7% · 19.4% · 27.9% |

### (c) the vote as inputs of the fitted logistics

| situation | Rules: executes everything | VSS: (c) | SOP-BERT: (c) | VSS-BERT: (c) | 3-vote: (c) |
|---|---|---|---|---|---|
| threshold (cost 10, chosen on cal oof) | executes all | 0.8175 | 0.8557 | 0.8547 | 0.8855 |
| AUROC (cal, oof) | - | 0.910 | 0.940 | 0.952 | 0.950 |
| **calibration (oof)**: score [95% CI] | -347.8 [-404.5, -294.9] | 26.2 [7.7, 40.3] | 49.8 [40.4, 58.4] | 48.3 [31.6, 61.3] | 50.3 [35.0, 62.1] |
| calibration (oof): precision of execution | 59.5% (600 executed) | 95.5% (310 executed) | 98.6% (352 executed) | 97.3% (409 executed) | 97.9% (388 executed) |
| calibration (oof): done right % · confidently wrong % · asked % | 59.9% · 40.5% · 0.0% | 49.7% · 4.5% · 31.4% | 58.2% · 1.4% · 39.3% | 66.8% · 2.7% · 30.0% | 63.8% · 2.1% · 33.4% |
| **test part**: score [95% CI] | -354.9 [-390.1, -316.6] | 29.6 [21.9, 36.7] | 40.9 [33.5, 48.2] | 40.0 [31.1, 48.0] | 45.6 [38.3, 52.8] |
| test part: precision of execution | 57.5% (1269 executed) | 96.4% (641 executed) | 97.5% (746 executed) | 96.7% (822 executed) | 97.8% (786 executed) |
| test part: done right % · confidently wrong % · asked % | 55.6% · 42.5% · 0.0% | 47.1% · 3.6% · 31.2% | 55.4% · 2.5% · 40.5% | 60.5% · 3.3% · 35.6% | 58.6% · 2.2% · 38.2% |
| **short commands synth**: score [95% CI] | 99.8 [99.4, 100.0] | 24.9 [21.1, 28.9] | 12.4 [-1.2, 25.7] | -15.7 [-35.8, 4.0] | -10.0 [-30.8, 8.0] |
| short commands synth: precision of execution | 100.0% (489 executed) | 100.0% (122 executed) | 94.2% (171 executed) | 87.6% (209 executed) | 88.7% (204 executed) |
| short commands synth: done right % · confidently wrong % · asked % | 99.8% · 0.0% · 0.0% | 24.9% · 0.0% · 30.6% | 32.9% · 5.8% · 56.5% | 37.3% · 12.4% · 50.4% | 36.9% · 11.3% · 51.2% |
| **short commands short3**: score [95% CI] | -206.6 [-249.8, -158.6] | -9.2 [-26.2, 7.4] | -30.3 [-55.0, -9.4] | -42.5 [-68.5, -18.7] | -37.9 [-62.8, -15.0] |
| short commands short3: precision of execution | 66.0% (377 executed) | 88.2% (152 executed) | 83.7% (190 executed) | 82.0% (217 executed) | 82.6% (207 executed) |
| short commands short3: done right % · confidently wrong % · asked % | 49.9% · 34.0% · 0.0% | 26.9% · 11.8% · 28.7% | 31.9% · 16.3% · 42.1% | 35.7% · 18.0% · 41.5% | 34.3% · 17.4% · 43.5% |

### (d) the best fix of the menu per column (by cal oof score)

| situation | Rules: executes everything | VSS: (c) + d2 no prior + d5 per-type thr. | SOP-BERT: (c) + d1 + d5 per-type thr. | VSS-BERT: (c) + d1 + d5 per-type thr. | 3-vote: (c) + d1 + d2 no prior + d5 per-type thr. |
|---|---|---|---|---|---|
| threshold (cost 10, chosen on cal oof) | executes all | cmd 0.9108 / q 0.5074 | cmd 0.8557 / q 0.9041 | cmd 0.8547 / q 0.9217 | cmd 0.8838 / q 0.6538 |
| AUROC (cal, oof) | - | 0.909 | 0.940 | 0.952 | 0.952 |
| **calibration (oof)**: score [95% CI] | -347.8 [-404.5, -294.9] | 30.5 [19.8, 39.9] | 51.2 [43.9, 58.5] | 49.2 [35.7, 59.8] | 51.3 [35.9, 63.6] |
| calibration (oof): precision of execution | 59.5% (600 executed) | 97.3% (259 executed) | 99.1% (338 executed) | 97.7% (392 executed) | 97.8% (405 executed) |
| calibration (oof): done right % · confidently wrong % · asked % | 59.9% · 40.5% · 0.0% | 42.3% · 2.7% · 39.3% | 56.2% · 0.9% · 41.6% | 64.3% · 2.3% · 32.9% | 66.4% · 2.2% · 30.5% |
| **test part**: score [95% CI] | -354.9 [-390.1, -316.6] | 25.1 [17.7, 32.3] | 40.4 [33.3, 46.9] | 39.3 [30.8, 47.2] | 46.0 [38.2, 53.5] |
| test part: precision of execution | 57.5% (1269 executed) | 96.3% (561 executed) | 97.5% (728 executed) | 96.8% (802 executed) | 97.6% (824 executed) |
| test part: done right % · confidently wrong % · asked % | 55.6% · 42.5% · 0.0% | 41.1% · 3.7% · 37.2% | 54.1% · 2.5% · 41.8% | 59.1% · 3.2% · 37.0% | 61.2% · 2.4% · 35.4% |
| **short commands synth**: score [95% CI] | 99.8 [99.4, 100.0] | 16.7 [8.1, 23.7] | 10.8 [-2.6, 24.2] | -12.0 [-32.1, 8.3] | -46.9 [-72.5, -23.1] |
| short commands synth: precision of execution | 100.0% (489 executed) | 97.4% (115 executed) | 93.9% (163 executed) | 88.3% (205 executed) | 81.4% (221 executed) |
| short commands synth: done right % · confidently wrong % · asked % | 99.8% · 0.0% · 0.0% | 22.9% · 2.6% · 32.0% | 31.2% · 6.1% · 58.2% | 36.9% · 11.7% · 51.2% | 36.7% · 18.6% · 48.0% |
| **short commands short3**: score [95% CI] | -206.6 [-249.8, -158.6] | -4.4 [-20.2, 10.5] | -29.3 [-52.3, -9.0] | -40.9 [-68.1, -17.5] | -46.9 [-74.0, -23.2] |
| short commands short3: precision of execution | 66.0% (377 executed) | 89.5% (143 executed) | 83.7% (184 executed) | 82.2% (214 executed) | 81.1% (217 executed) |
| short commands short3: done right % · confidently wrong % · asked % | 49.9% · 34.0% · 0.0% | 25.7% · 10.5% · 30.9% | 30.9% · 16.3% · 43.3% | 35.3% · 17.8% · 41.9% | 35.3% · 18.9% · 41.9% |

### b3/b2 with d1 (engine-true agreement)

| situation | 3-vote: (b) vote + d1 3/3 | 3-vote: (b) vote + d1 ≥2/3 |
|---|---|---|
| threshold (cost 10, chosen on cal oof) | ≥ 3 agree | ≥ 2 agree |
| AUROC (cal, oof) | 0.886 | 0.886 |
| **calibration (oof)**: score [95% CI] | 43.8 [34.9, 52.4] | -12.8 [-41.8, 15.2] |
| calibration (oof): precision of execution | 98.4% (316 executed) | 89.5% (496 executed) |
| calibration (oof): done right % · confidently wrong % · asked % | 52.2% · 1.6% · 45.6% | 74.5% · 10.5% · 18.6% |
| **test part**: score [95% CI] | 34.7 [27.2, 41.3] | -6.5 [-23.2, 8.4] |
| test part: precision of execution | 97.2% (654 executed) | 90.1% (1003 executed) |
| test part: done right % · confidently wrong % · asked % | 48.4% · 2.8% · 48.6% | 68.8% · 9.9% · 23.8% |
| **short commands synth**: score [95% CI] | 26.1 [22.3, 30.2] | 0.4 [-21.3, 20.6] |
| short commands synth: precision of execution | 100.0% (128 executed) | 91.0% (266 executed) |
| short commands synth: done right % · confidently wrong % · asked % | 26.1% · 0.0% · 66.7% | 49.4% · 9.0% · 39.0% |
| **short commands short3**: score [95% CI] | -7.4 [-24.4, 8.7] | -79.6 [-110.6, -50.5] |
| short commands short3: precision of execution | 88.7% (150 executed) | 78.7% (296 executed) |
| short commands short3: done right % · confidently wrong % · asked % | 26.7% · 11.3% · 53.5% | 46.7% · 21.3% · 26.5% |

## 4. Every variant tried (calibration out-of-fold cost score at cost 10; the selection rule of PLAN.md picks the highest; a tie keeps the earlier row)

| column | variant | family | threshold | cal oof score | done right % · confidently wrong % | AUROC |
|---|---|---|---|---|---|---|
| VSS | (a) | a | 0.8964 | 8.2 | 18.3% · 5.2% | 0.776 |
| VSS | (a) + d5 per-type thr. | a | cmd 0.8978 / q 0.8884 | 8.9 | 19.0% · 5.0% | 0.776 |
| SOP-BERT | (a) | a | 0.8233 | 24.8 | 63.4% · 5.7% | 0.872 |
| SOP-BERT | (a) + d5 per-type thr. | a | cmd 0.8448 / q 0.8983 | 26.2 | 59.7% · 5.3% | 0.872 |
| VSS-BERT | (a) | a | 0.8701 | 46.3 | 56.4% · 1.8% | 0.939 |
| VSS-BERT | (a) + d5 per-type thr. | a | cmd 0.8813 / q 0.8063 | 48.5 | 56.9% · 1.5% | 0.939 |
| VSS | (a) + d3 k50 | d | 0.8908 | 8.1 | 19.8% · 5.6% | 0.778 |
| VSS | (a) + d3 k50 + d5 per-type thr. | d | cmd 0.8663 / q 0.8917 | 8.4 | 23.5% · 6.0% | 0.778 |
| SOP-BERT | (a) + d3 k50 | d | 0.9164 | 25.3 | 43.8% · 4.0% | 0.873 |
| SOP-BERT | (a) + d3 k50 + d5 per-type thr. | d | cmd 0.9165 / q 0.6601 | 28.2 | 51.7% · 4.3% | 0.873 |
| VSS-BERT | (a) + d3 k50 | d | 0.9176 | 43.3 | 56.7% · 2.3% | 0.938 |
| VSS-BERT | (a) + d3 k50 + d5 per-type thr. | d | cmd 0.9176 / q 0.8358 | 45.5 | 58.9% · 2.2% | 0.938 |
| VSS | (a) + d2 no prior | d | 0.8493 | 6.0 | 7.7% · 2.1% | 0.756 |
| VSS | (a) + d2 no prior + d5 per-type thr. | d | cmd 0.8002 / q 0.8432 | 9.6 | 19.6% · 4.9% | 0.756 |
| SOP-BERT | (a) + d2 no prior | d | 0.8883 | 29.0 | 55.9% · 4.6% | 0.878 |
| SOP-BERT | (a) + d2 no prior + d5 per-type thr. | d | cmd 0.8890 / q 0.7474 | 31.5 | 60.1% · 4.5% | 0.878 |
| VSS-BERT | (a) + d2 no prior | d | 0.9274 | 40.6 | 54.0% · 2.4% | 0.941 |
| VSS-BERT | (a) + d2 no prior + d5 per-type thr. | d | cmd 0.9554 / q 0.7538 | 47.1 | 50.5% · 0.7% | 0.941 |
| VSS | (b) agrees with ≥1 other | b | ≥ 3 agree | 23.0 | 49.8% · 5.1% | 0.898 |
| VSS | (b) agrees with ≥1 other + d5 per-type thr. | b | cmd ≥ 3 agree / q ≥ 2 agree | 26.2 | 53.0% · 4.8% | 0.898 |
| SOP-BERT | (b) agrees with ≥1 other | b | ≥ 3 agree | 43.8 | 52.2% · 1.6% | 0.877 |
| SOP-BERT | (b) agrees with ≥1 other + d5 per-type thr. | b | cmd ≥ 3 agree / q ≥ 3 agree | 43.8 | 52.2% · 1.6% | 0.877 |
| 3-vote | (b) vote | b | ≥ 3 agree | 43.8 | 52.2% · 1.6% | 0.886 |
| 3-vote | (b) vote + d5 per-type thr. | b | cmd ≥ 3 agree / q ≥ 3 agree | 43.8 | 52.2% · 1.6% | 0.886 |
| VSS | (c) | c | 0.8175 | 26.2 | 49.7% · 4.5% | 0.910 |
| VSS | (c) + d5 per-type thr. | c | cmd 0.8306 / q 0.5325 | 29.2 | 52.7% · 4.3% | 0.910 |
| SOP-BERT | (c) | c | 0.8557 | 49.8 | 58.2% · 1.4% | 0.940 |
| SOP-BERT | (c) + d5 per-type thr. **(chosen)** | c | cmd 0.8557 / q 0.9041 | 51.2 | 56.2% · 0.9% | 0.940 |
| VSS-BERT | (c) | c | 0.8547 | 48.3 | 66.8% · 2.7% | 0.952 |
| VSS-BERT | (c) + d5 per-type thr. **(chosen)** | c | cmd 0.8547 / q 0.9217 | 49.2 | 64.3% · 2.3% | 0.952 |
| 3-vote | (c) | c | 0.8855 | 50.3 | 63.8% · 2.1% | 0.950 |
| 3-vote | (c) + d5 per-type thr. | c | cmd 0.8855 / q 0.8755 | 50.7 | 64.1% · 2.1% | 0.950 |
| VSS | (c) + d3 k50 | d | 0.8180 | 26.2 | 49.7% · 4.5% | 0.911 |
| VSS | (c) + d3 k50 + d5 per-type thr. | d | cmd 0.8294 / q 0.5333 | 29.2 | 52.7% · 4.3% | 0.911 |
| SOP-BERT | (c) + d3 k50 | d | 0.8556 | 48.8 | 58.9% · 1.7% | 0.939 |
| SOP-BERT | (c) + d3 k50 + d5 per-type thr. | d | cmd 0.8556 / q 0.9047 | 50.3 | 57.0% · 1.2% | 0.939 |
| VSS-BERT | (c) + d3 k50 | d | 0.8837 | 47.7 | 62.8% · 2.3% | 0.953 |
| VSS-BERT | (c) + d3 k50 + d5 per-type thr. | d | cmd 0.8699 / q 0.9243 | 48.0 | 63.1% · 2.3% | 0.953 |
| 3-vote | (c) + d3 k50 | d | 0.8736 | 50.0 | 65.1% · 2.3% | 0.951 |
| 3-vote | (c) + d3 k50 + d5 per-type thr. | d | cmd 0.8736 / q 0.6906 | 50.5 | 67.3% · 2.4% | 0.951 |
| VSS | (c) + d2 no prior | d | 0.8332 | 25.8 | 49.3% · 4.5% | 0.909 |
| VSS | (c) + d2 no prior + d5 per-type thr. **(chosen)** | d | cmd 0.9108 / q 0.5074 | 30.5 | 42.3% · 2.7% | 0.909 |
| SOP-BERT | (c) + d2 no prior | d | 0.8918 | 48.5 | 61.9% · 2.1% | 0.941 |
| SOP-BERT | (c) + d2 no prior + d5 per-type thr. | d | cmd 0.8918 / q 0.6582 | 49.8 | 64.9% · 2.3% | 0.941 |
| VSS-BERT | (c) + d2 no prior | d | 0.9012 | 48.0 | 59.7% · 1.9% | 0.954 |
| VSS-BERT | (c) + d2 no prior + d5 per-type thr. | d | cmd 0.8984 / q 0.6594 | 49.0 | 64.1% · 2.3% | 0.954 |
| 3-vote | (c) + d2 no prior | d | 0.8866 | 49.5 | 62.9% · 2.1% | 0.952 |
| 3-vote | (c) + d2 no prior + d5 per-type thr. | d | cmd 0.8866 / q 0.6576 | 50.7 | 65.8% · 2.2% | 0.952 |
| VSS | (b) agrees with ≥1 other + d1 | d | ≥ 3 agree | 23.0 | 49.8% · 5.1% | 0.897 |
| VSS | (b) agrees with ≥1 other + d1 + d5 per-type thr. | d | cmd ≥ 3 agree / q ≥ 2 agree | 26.2 | 53.0% · 4.8% | 0.897 |
| SOP-BERT | (b) agrees with ≥1 other + d1 | d | ≥ 3 agree | 43.8 | 52.2% · 1.6% | 0.877 |
| SOP-BERT | (b) agrees with ≥1 other + d1 + d5 per-type thr. | d | cmd ≥ 3 agree / q ≥ 3 agree | 43.8 | 52.2% · 1.6% | 0.877 |
| 3-vote | (b) vote + d1 | d | ≥ 3 agree | 43.8 | 52.2% · 1.6% | 0.886 |
| 3-vote | (b) vote + d1 + d5 per-type thr. | d | cmd ≥ 3 agree / q ≥ 3 agree | 43.8 | 52.2% · 1.6% | 0.886 |
| VSS | (c) + d1 | d | 0.8153 | 26.2 | 49.7% · 4.5% | 0.910 |
| VSS | (c) + d1 + d5 per-type thr. | d | cmd 0.8271 / q 0.5229 | 29.2 | 52.7% · 4.3% | 0.910 |
| SOP-BERT | (c) + d1 | d | 0.8557 | 49.8 | 58.2% · 1.4% | 0.940 |
| SOP-BERT | (c) + d1 + d5 per-type thr. | d | cmd 0.8557 / q 0.9041 | 51.2 | 56.2% · 0.9% | 0.940 |
| VSS-BERT | (c) + d1 | d | 0.8547 | 48.3 | 66.8% · 2.7% | 0.952 |
| VSS-BERT | (c) + d1 + d5 per-type thr. | d | cmd 0.8547 / q 0.9217 | 49.2 | 64.3% · 2.3% | 0.952 |
| 3-vote | (c) + d1 | d | 0.8903 | 48.8 | 62.2% · 2.1% | 0.950 |
| 3-vote | (c) + d1 + d5 per-type thr. | d | cmd 0.8602 / q 0.8760 | 50.0 | 66.8% · 2.5% | 0.950 |
| VSS | (c) + d1 + d3 k50 | d | 0.8158 | 26.2 | 49.7% · 4.5% | 0.911 |
| VSS | (c) + d1 + d3 k50 + d5 per-type thr. | d | cmd 0.8259 / q 0.5237 | 29.2 | 52.7% · 4.3% | 0.911 |
| SOP-BERT | (c) + d1 + d3 k50 | d | 0.8556 | 48.8 | 58.9% · 1.7% | 0.939 |
| SOP-BERT | (c) + d1 + d3 k50 + d5 per-type thr. | d | cmd 0.8556 / q 0.9047 | 50.3 | 57.0% · 1.2% | 0.939 |
| VSS-BERT | (c) + d1 + d3 k50 | d | 0.8837 | 47.7 | 62.8% · 2.3% | 0.953 |
| VSS-BERT | (c) + d1 + d3 k50 + d5 per-type thr. | d | cmd 0.8699 / q 0.9243 | 48.0 | 63.1% · 2.3% | 0.953 |
| 3-vote | (c) + d1 + d3 k50 | d | 0.8747 | 49.8 | 64.9% · 2.3% | 0.951 |
| 3-vote | (c) + d1 + d3 k50 + d5 per-type thr. | d | cmd 0.8747 / q 0.6942 | 50.3 | 67.1% · 2.4% | 0.951 |
| VSS | (c) + d1 + d2 no prior | d | 0.8337 | 25.8 | 49.3% · 4.5% | 0.909 |
| VSS | (c) + d1 + d2 no prior + d5 per-type thr. | d | cmd 0.9106 / q 0.4972 | 30.2 | 41.9% · 2.7% | 0.909 |
| SOP-BERT | (c) + d1 + d2 no prior | d | 0.8918 | 48.5 | 61.9% · 2.1% | 0.941 |
| SOP-BERT | (c) + d1 + d2 no prior + d5 per-type thr. | d | cmd 0.8918 / q 0.6582 | 49.8 | 64.9% · 2.3% | 0.941 |
| VSS-BERT | (c) + d1 + d2 no prior | d | 0.9012 | 48.0 | 59.7% · 1.9% | 0.954 |
| VSS-BERT | (c) + d1 + d2 no prior + d5 per-type thr. | d | cmd 0.8984 / q 0.6594 | 49.0 | 64.1% · 2.3% | 0.954 |
| 3-vote | (c) + d1 + d2 no prior | d | 0.8838 | 50.2 | 63.6% · 2.1% | 0.952 |
| 3-vote | (c) + d1 + d2 no prior + d5 per-type thr. **(chosen)** | d | cmd 0.8838 / q 0.6538 | 51.3 | 66.4% · 2.2% | 0.952 |

## 5. Verdicts (test part, once; paired bootstrap over the 405 test messages, 1000 resamples, seed 1)

| column | chosen (cal oof score) | current (a) (cal oof score) | test: chosen · current | difference [95% CI] | verdict |
|---|---|---|---|---|---|
| VSS | (c) + d2 no prior + d5 per-type thr. (30.5) | 8.2 | 25.1 · 12.9 | 12.3 [4.0, 19.8] | **better** |
| SOP-BERT | (c) + d5 per-type thr. (51.2) | 24.8 | 41.1 · 14.4 | 26.7 [15.9, 38.2] | **better** |
| VSS-BERT | (c) + d5 per-type thr. (49.2) | 46.3 | 40.0 · 40.6 | -0.6 [-7.1, 4.8] | not shown |
| 3-vote vs VSS-BERT (a) | (c) + d1 + d2 no prior + d5 per-type thr. (51.3) | 46.3 | 46.0 · 40.6 | 5.4 [-1.0, 11.0] | not shown |

### The chosen variant of each column (the selection rule)

| situation | Rules: executes everything | VSS: (c) + d2 no prior + d5 per-type thr. | SOP-BERT: (c) + d5 per-type thr. | VSS-BERT: (c) + d5 per-type thr. | 3-vote: (c) + d1 + d2 no prior + d5 per-type thr. |
|---|---|---|---|---|---|
| threshold (cost 10, chosen on cal oof) | executes all | cmd 0.9108 / q 0.5074 | cmd 0.8557 / q 0.9041 | cmd 0.8547 / q 0.9217 | cmd 0.8838 / q 0.6538 |
| AUROC (cal, oof) | - | 0.909 | 0.940 | 0.952 | 0.952 |
| **calibration (oof)**: score [95% CI] | -347.8 [-404.5, -294.9] | 30.5 [19.8, 39.9] | 51.2 [43.9, 58.5] | 49.2 [35.7, 59.8] | 51.3 [35.9, 63.6] |
| calibration (oof): precision of execution | 59.5% (600 executed) | 97.3% (259 executed) | 99.1% (338 executed) | 97.7% (392 executed) | 97.8% (405 executed) |
| calibration (oof): done right % · confidently wrong % · asked % | 59.9% · 40.5% · 0.0% | 42.3% · 2.7% · 39.3% | 56.2% · 0.9% · 41.6% | 64.3% · 2.3% · 32.9% | 66.4% · 2.2% · 30.5% |
| **test part**: score [95% CI] | -354.9 [-390.1, -316.6] | 25.1 [17.7, 32.3] | 41.1 [34.1, 47.6] | 40.0 [31.5, 48.0] | 46.0 [38.2, 53.5] |
| test part: precision of execution | 57.5% (1269 executed) | 96.3% (561 executed) | 97.7% (727 executed) | 96.9% (800 executed) | 97.6% (824 executed) |
| test part: done right % · confidently wrong % · asked % | 55.6% · 42.5% · 0.0% | 41.1% · 3.7% · 37.2% | 54.1% · 2.3% · 41.9% | 59.0% · 3.1% · 37.2% | 61.2% · 2.4% · 35.4% |
| **short commands synth**: score [95% CI] | 99.8 [99.4, 100.0] | 16.7 [8.1, 23.7] | 10.4 [-3.1, 23.6] | -10.4 [-30.3, 8.9] | -46.9 [-72.5, -23.1] |
| short commands synth: precision of execution | 100.0% (489 executed) | 97.4% (115 executed) | 93.8% (161 executed) | 88.6% (202 executed) | 81.4% (221 executed) |
| short commands synth: done right % · confidently wrong % · asked % | 99.8% · 0.0% · 0.0% | 22.9% · 2.6% · 32.0% | 30.8% · 6.2% · 58.6% | 36.5% · 11.4% · 51.8% | 36.7% · 18.6% · 48.0% |
| **short commands short3**: score [95% CI] | -206.6 [-249.8, -158.6] | -4.4 [-20.2, 10.5] | -29.5 [-52.5, -9.1] | -41.1 [-68.1, -17.5] | -46.9 [-74.0, -23.2] |
| short commands short3: precision of execution | 66.0% (377 executed) | 89.5% (143 executed) | 83.6% (183 executed) | 82.2% (213 executed) | 81.1% (217 executed) |
| short commands short3: done right % · confidently wrong % · asked % | 49.9% · 34.0% · 0.0% | 25.7% · 10.5% · 30.9% | 30.7% · 16.4% · 43.5% | 35.1% · 17.8% · 42.1% | 35.3% · 18.9% · 41.9% |

The chosen variants, cost 5 / 10 / 20 thresholds (cal oof): VSS (c) + d2 no prior + d5 per-type thr.: cmd 0.8332 / q 0.5074 / cmd 0.9108 / q 0.5074 / cmd 0.9108 / q 0.5074; SOP-BERT (c) + d5 per-type thr.: cmd 0.7732 / q 0.7130 / cmd 0.8557 / q 0.9041 / cmd 0.8557 / q 0.9041; VSS-BERT (c) + d5 per-type thr.: cmd 0.8260 / q 0.8159 / cmd 0.8547 / q 0.9217 / cmd 0.9496 / q 0.9217; 3-vote (c) + d1 + d2 no prior + d5 per-type thr.: cmd 0.8449 / q 0.6538 / cmd 0.8838 / q 0.6538 / cmd 0.9512 / q 0.9401.

Selection optimism: the chosen variant is the best of 22-16 on 195 messages; its calibration score is optimistic, the test part is the check.

## 6. The symptom commands (canvas Start, Check, Done, Retry)

| command | reader | reading | (a) confidence · executes? | chosen confidence · executes? |
|---|---|---|---|---|
| arrange all | Rules | {"action":"arrange","target":"mention(quantifier=all)"} | executes | executes |
| arrange all | VSS | vss {"action":"arrange","target":"check,done,retry,start"} | 0.420 · no | 0.289 · no |
| arrange all | SOP-BERT | sop {"action":"arrange","layout":"circle"} | 0.344 · no | 0.327 · no |
| arrange all | VSS-BERT | sop {"action":"arrange","layout":"circle"} | 0.305 · no | 0.155 · no |
| arrange all | 3-vote | vss {"action":"arrange","target":"check,done,retry,start"} | - | 0.305 · no |
| arrange all in a circle | Rules | {"action":"arrange","layout":"circle"} | executes | executes |
| arrange all in a circle | VSS | vss {"action":"arrange","layout":"circle","target":"check,done,retry,start"} | 0.712 · no | 0.390 · no |
| arrange all in a circle | SOP-BERT | sop {"action":"arrange","layout":"circle"} | 0.571 · no | 0.665 · no |
| arrange all in a circle | VSS-BERT | sop {"action":"arrange","layout":"circle"} | 0.463 · no | 0.638 · no |
| arrange all in a circle | 3-vote | sop {"action":"arrange","layout":"circle"} | - | 0.962 · yes |
| distribute all vertically | Rules | {"action":"distribute","axis":"vertical"} | executes | executes |
| distribute all vertically | VSS | vss {"action":"distribute","axis":"vertical","target":"check,done,retry,start"} | 0.426 · no | 0.286 · no |
| distribute all vertically | SOP-BERT | sop {"action":"distribute","axis":"vertical","target":"mention(quantifier=all)"} | 0.640 · no | 0.397 · no |
| distribute all vertically | VSS-BERT | sop {"action":"distribute","axis":"vertical","target":"mention(quantifier=all)"} | 0.410 · no | 0.318 · no |
| distribute all vertically | 3-vote | sop {"action":"distribute","axis":"vertical","target":"mention(quantifier=all)"} | - | 0.941 · yes |
