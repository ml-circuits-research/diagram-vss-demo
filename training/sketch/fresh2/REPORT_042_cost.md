# FRESH2 report (test part), written by training/sketch/fresh2/fit_report.mjs

Records: /tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/gpuruns/results/042_fresh2/records. Messages: 600 in the data dirs (opus_a, opus_b, opus_c, opus_d); calibration 195 messages / 596 requested actions; test 405 messages / 1313 requested actions.
Split: int(sha256(id), 16) % 3 == 0 is calibration. Thresholds and confidences are fitted on the calibration part only. MINEXEC 50; bootstrap 1000 resamples of the test messages, seed 1.
Definitions (per requested action, PAIR=value as llm_score.mjs): confidently wrong % = (executed wrong + executed extras) / everything executed; done right % = executed right / requested actions; asked % = right or wrong requests below the threshold / requested; not read % = requested actions with no produced request / requested; extras = produced requests nobody asked for. Execute when confidence >= threshold.

## Cost score: one confident mistake costs 10 right answers (the main measure, AGENTS.md 2026-11-02 19:09)

Score = (requests done right - 10 x (executed wrong + extras executed)) / requested actions x 100. A question, or a request not done, scores 0. Each reader's threshold is the one that maximises this score on the calibration part (out-of-fold confidences, the same folds and recipe as the fits below; the candidates are every out-of-fold confidence value, "execute everything" and "ask everything" = score 0; a tie keeps the higher threshold). Rules have no confidence: their only candidates are execute everything and ask everything. The old fits (unchanged JSONs) were never fitted on this data, so their threshold is read from their confidences on the calibration part. No threshold is chosen on the test part. 95% intervals: 1000 bootstrap resamples of the test messages, the same resamples as the rest of the report.

| reader | score-optimal threshold (calibration score, executed) | test score [95% CI] |
|---|---|---|
| Rules (own cut) | none: asks everything (0.0, 0) | 0.0 [0.0, 0.0] |
| VSS default | 0.9231 (5.5, 55) | 4.0 [-0.3, 7.9] |
| VSS round 2 | 0.8995 (2.5, 70) | 5.3 [1.5, 9.1] |
| SOP-BERT shipped | 0.9636 (7.2, 87) | 9.9 [6.7, 12.6] |
| SOP-BERT all-data | 0.8357 (17.8, 282) | 7.1 [-4.5, 17.6] |
| Rules on the VSS cut | none: asks everything (0.0, 0) | 0.0 [0.0, 0.0] |
| VSS default (its cut) | 0.9231 (5.5, 55) | 4.0 [-0.3, 7.9] |
| SOP-BERT shipped on the VSS cut | 0.9505 (11.2, 111) | 15.5 [12.9, 18.2] |
| SOP-BERT all-data on the VSS cut | 0.8461 (15.8, 215) | 9.7 [0.3, 18.3] |
| VSS default, old fit (unchanged) | 0.9419 (7.7, 57) | 4.2 [-0.4, 8.0] |
| VSS round 2, old fit (unchanged) | 0.9449 (6.7, 40) | 5.2 [3.1, 7.1] |
| SOP-BERT shipped, old fit (unchanged) | 0.9349 (15.6, 159) | 20.6 [15.9, 25.1] |
| SOP-BERT all-data, old fit (unchanged) | 0.9393 (21.8, 317) | 22.1 [12.6, 30.8] |

| reader | confidently wrong % (executed) · done right % | asked % · extras executed |
|---|---|---|
| Rules (own cut) | - · 0.0 (0 executed) | 74.6 · 0 |
| VSS default | 5.0 · 8.6 (119 executed) | 67.8 · 0 |
| VSS round 2 | 4.4 · 9.9 (136 executed) | 68.7 · 1 |
| SOP-BERT shipped | 1.8 · 12.2 (163 executed) | 82.6 · 0 |
| SOP-BERT all-data | 7.7 · 42.9 (610 executed) | 49.5 · 5 |
| Rules on the VSS cut | - · 0.0 (0 executed) | 74.0 · 0 |
| VSS default (its cut) | 5.0 · 8.6 (119 executed) | 67.8 · 0 |
| SOP-BERT shipped on the VSS cut | 0.9 · 17.1 (226 executed) | 70.6 · 0 |
| SOP-BERT all-data on the VSS cut | 6.6 · 33.3 (468 executed) | 52.8 · 2 |
| VSS default, old fit (unchanged) | 5.0 · 8.8 (121 executed) | 67.6 · 0 |
| VSS round 2, old fit (unchanged) | 1.3 · 5.9 (79 executed) | 73.0 · 0 |
| SOP-BERT shipped, old fit (unchanged) | 2.0 · 26.0 (348 executed) | 68.6 · 2 |
| SOP-BERT all-data, old fit (unchanged) | 5.1 · 48.0 (664 executed) | 45.8 · 11 |

Every reader executing everything (test part, no threshold):

| reader | score [95% CI] | right / wrong / not done % · extras |
|---|---|---|
| Rules (own cut) | -355.8 [-390.6, -317.7] | 55.5 / 19.0 / 25.4 · 290 |
| VSS default | -216.3 [-246.2, -185.7] | 58.6 / 18.2 / 23.2 · 122 |
| VSS round 2 | -238.6 [-268.2, -209.1] | 59.9 / 19.0 / 21.0 · 142 |
| SOP-BERT shipped | -312.3 [-352.5, -273.1] | 70.8 / 24.2 / 5.0 · 185 |
| SOP-BERT all-data | -234.9 [-272.7, -198.1] | 75.1 / 20.5 / 4.4 · 138 |
| Rules on the VSS cut | -228.2 [-254.7, -200.2] | 57.4 / 16.6 / 26.0 · 157 |
| VSS default (its cut) | -216.3 [-246.2, -185.7] | 58.6 / 18.2 / 23.2 · 122 |
| SOP-BERT shipped on the VSS cut | -217.6 [-249.4, -184.5] | 66.5 / 21.3 / 12.2 · 93 |
| SOP-BERT all-data on the VSS cut | -189.9 [-221.3, -158.3] | 69.0 / 19.3 / 11.7 · 87 |
| VSS default, old fit (unchanged) | -216.3 [-246.2, -185.7] | 58.6 / 18.2 / 23.2 · 122 |
| VSS round 2, old fit (unchanged) | -238.6 [-268.2, -209.1] | 59.9 / 19.0 / 21.0 · 142 |
| SOP-BERT shipped, old fit (unchanged) | -312.3 [-352.5, -273.1] | 70.8 / 24.2 / 5.0 · 185 |
| SOP-BERT all-data, old fit (unchanged) | -234.9 [-272.7, -198.1] | 75.1 / 20.5 / 4.4 · 138 |

Ranking of the five readers on their own cut (test score; the threshold is re-optimised on calibration for each cost; sensitivity only, 10 is the measure): cost 10: SOP-BERT shipped 9.9 > SOP-BERT all-data 7.1 > VSS round 2 5.3 > VSS default 4.0 > Rules (own cut) 0.0. cost 5: SOP-BERT all-data 23.4 > SOP-BERT shipped 23.3 > VSS default 15.1 > VSS round 2 13.3 > Rules (own cut) 0.0. cost 20: SOP-BERT shipped 5.2 > SOP-BERT all-data 3.3 > VSS round 2 2.0 > VSS default 1.8 > Rules (own cut) 0.0.

## 0. The fits (calibration part)

| reader | produced requests · L2 · out-of-fold AUROC | thresholds 95 / 97 / 99 (out-of-fold precision, executed) |
|---|---|---|
| Rules (own cut) | no confidence | executes everything |
| VSS default | 546 · 1 · 0.774 | 0.9231 (96.4, 55) / none (asks everything) / none (asks everything) |
| VSS round 2 | 559 · 1 · 0.761 | none (asks everything) / none (asks everything) / none (asks everything) |
| SOP-BERT shipped | 659 · 0.1 · 0.835 | 0.9636 (95.4, 87) / none (asks everything) / none (asks everything) |
| SOP-BERT all-data | 644 · 10 · 0.851 | 0.8621 (95.0, 220) / none (asks everything) / none (asks everything) |
| Rules on the VSS cut | no confidence | executes everything |
| VSS default (its cut) | 546 · 1 · 0.774 | 0.9231 (96.4, 55) / none (asks everything) / none (asks everything) |
| SOP-BERT shipped on the VSS cut | 597 · 0.01 · 0.815 | 0.9451 (95.2, 126) / none (asks everything) / none (asks everything) |
| SOP-BERT all-data on the VSS cut | 597 · 10 · 0.819 | 0.8960 (95.2, 104) / none (asks everything) / none (asks everything) |
| VSS default, old fit (unchanged) | old JSON, not refitted | 0.8540 / 0.8934 / 0.9438 |
| VSS round 2, old fit (unchanged) | old JSON, not refitted | 0.8540 / 0.8934 / 0.9438 |
| SOP-BERT shipped, old fit (unchanged) | old JSON, not refitted | 0.8421 / 0.9029 / 0.9570 |
| SOP-BERT all-data, old fit (unchanged) | old JSON, not refitted | 0.8421 / 0.9029 / 0.9570 |

## 1. Headline at the 97% threshold (test part)

### 1a. The five readers, each on its own cut

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| Rules (own cut) | 42.6 [39.6, 45.5] · 1269 | 55.5 [52.5, 58.7] |
| VSS default (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |
| VSS round 2 (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |
| SOP-BERT shipped (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |
| SOP-BERT all-data (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| Rules (own cut) | 0.0 · 25.4 | 290 (of 1269 executed) |
| VSS default | 76.8 · 23.2 | 0 (of 0 executed) |
| VSS round 2 | 79.0 · 21.0 | 0 (of 0 executed) |
| SOP-BERT shipped | 95.0 · 5.0 | 0 (of 0 executed) |
| SOP-BERT all-data | 95.6 · 4.4 | 0 (of 0 executed) |

### 1b. Same cut: every reader on the VSS cut

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| Rules on the VSS cut | 33.2 [30.4, 36.0] · 1129 | 57.4 [54.4, 60.3] |
| VSS default (its cut) (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |
| SOP-BERT shipped on the VSS cut (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |
| SOP-BERT all-data on the VSS cut (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| Rules on the VSS cut | 0.0 · 26.0 | 157 (of 1129 executed) |
| VSS default (its cut) | 76.8 · 23.2 | 0 (of 0 executed) |
| SOP-BERT shipped on the VSS cut | 87.8 · 12.2 | 0 (of 0 executed) |
| SOP-BERT all-data on the VSS cut | 88.3 · 11.7 | 0 (of 0 executed) |

### 1c. The old fits applied unchanged (precision_thresholds.json, precision_thresholds_bert.json): how they transfer to a new writer

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| VSS default, old fit (unchanged) | 7.3 [4.4, 10.8] · 342 | 24.1 [21.8, 26.6] |
| VSS round 2, old fit (unchanged) | 7.0 [4.4, 9.5] · 357 | 25.3 [23.0, 27.6] |
| SOP-BERT shipped, old fit (unchanged) | 3.5 [2.0, 5.3] · 452 | 33.2 [30.5, 36.1] |
| SOP-BERT all-data, old fit (unchanged) | 7.7 [6.0, 9.7] · 777 | 54.6 [51.7, 57.9] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| VSS default, old fit (unchanged) | 51.1 · 23.2 | 4 (of 342 executed) |
| VSS round 2, old fit (unchanged) | 52.2 · 21.0 | 5 (of 357 executed) |
| SOP-BERT shipped, old fit (unchanged) | 61.2 · 5.0 | 8 (of 452 executed) |
| SOP-BERT all-data, old fit (unchanged) | 37.9 · 4.4 | 19 (of 777 executed) |

## 2. The 95% and 99% thresholds (test part)

| reader | 95%: confidently wrong % · done right % | 99%: confidently wrong % · done right % |
|---|---|---|
| VSS default | 5.0 · 8.6 (119 exec) | - · 0.0 (0 exec) |
| VSS round 2 | - · 0.0 (0 exec) | - · 0.0 (0 exec) |
| SOP-BERT shipped | 1.8 · 12.2 (163 exec) | - · 0.0 (0 exec) |
| SOP-BERT all-data | 7.4 · 36.1 (512 exec) | - · 0.0 (0 exec) |
| VSS default (its cut) | 5.0 · 8.6 (119 exec) | - · 0.0 (0 exec) |
| SOP-BERT shipped on the VSS cut | 1.5 · 19.6 (261 exec) | - · 0.0 (0 exec) |
| SOP-BERT all-data on the VSS cut | 2.1 · 17.4 (234 exec) | - · 0.0 (0 exec) |
| VSS default, old fit (unchanged) | 11.2 · 34.9 (516 exec) | 3.7 · 7.8 (107 exec) |
| VSS round 2, old fit (unchanged) | 10.2 · 35.4 (518 exec) | 1.2 · 6.5 (86 exec) |
| SOP-BERT shipped, old fit (unchanged) | 6.0 · 41.9 (585 exec) | 1.6 · 19.1 (255 exec) |
| SOP-BERT all-data, old fit (unchanged) | 10.4 · 60.8 (891 exec) | 4.2 · 43.2 (592 exec) |

## 3. Requests done right % at an equal confidently-wrong rate (read off the test part's own curve; NOT a protocol threshold)

| reader | done right % at confidently wrong <= 5 / 3 / 1 % |
|---|---|
| Rules (own cut) | no confidence: one point, 42.6 confidently wrong, 55.5 right |
| VSS default | 10.6 / 5.6 / 2.2 |
| VSS round 2 | 20.0 / 5.2 / 4.6 |
| SOP-BERT shipped | 25.7 / 21.2 / 10.0 |
| SOP-BERT all-data | 13.9 / 9.1 / 0.1 |
| Rules on the VSS cut | no confidence: one point, 33.2 confidently wrong, 57.4 right |
| VSS default (its cut) | 10.6 / 5.6 / 2.2 |
| SOP-BERT shipped on the VSS cut | 34.7 / 28.7 / 18.0 |
| SOP-BERT all-data on the VSS cut | 23.7 / 20.3 / 2.1 |
| VSS default, old fit (unchanged) | 16.3 / 5.9 / 1.4 |
| VSS round 2, old fit (unchanged) | 21.9 / 10.4 / 2.6 |
| SOP-BERT shipped, old fit (unchanged) | 37.7 / 30.6 / 10.7 |
| SOP-BERT all-data, old fit (unchanged) | 46.7 / 37.2 / 22.8 |

## 4. Executing everything (no threshold), for continuity

| reader | right / wrong / not done % of requests | extras · AUROC of the confidence (test) |
|---|---|---|
| Rules (own cut) | 55.5 / 19.0 / 25.4 | 290 · - |
| VSS default | 58.6 / 18.2 / 23.2 | 122 · 0.808 |
| VSS round 2 | 59.9 / 19.0 / 21.0 | 142 · 0.835 |
| SOP-BERT shipped | 70.8 / 24.2 / 5.0 | 185 · 0.880 |
| SOP-BERT all-data | 75.1 / 20.5 / 4.4 | 138 · 0.849 |
| Rules on the VSS cut | 57.4 / 16.6 / 26.0 | 157 · - |
| VSS default (its cut) | 58.6 / 18.2 / 23.2 | 122 · 0.808 |
| SOP-BERT shipped on the VSS cut | 66.5 / 21.3 / 12.2 | 93 · 0.864 |
| SOP-BERT all-data on the VSS cut | 69.0 / 19.3 / 11.7 | 87 · 0.838 |

## 5. AUROC of each confidence on the test part (right vs not right, all produced requests)

| reader | test | calibration, out-of-fold (fitted ones) |
|---|---|---|
| VSS default | 0.808 | 0.774 |
| VSS round 2 | 0.835 | 0.761 |
| SOP-BERT shipped | 0.880 | 0.835 |
| SOP-BERT all-data | 0.849 | 0.851 |
| VSS default (its cut) | 0.808 | 0.774 |
| SOP-BERT shipped on the VSS cut | 0.864 | 0.815 |
| SOP-BERT all-data on the VSS cut | 0.838 | 0.819 |
| VSS default, old fit (unchanged) | 0.787 | - |
| VSS round 2, old fit (unchanged) | 0.805 | - |
| SOP-BERT shipped, old fit (unchanged) | 0.881 | - |
| SOP-BERT all-data, old fit (unchanged) | 0.882 | - |

## 6. Breakdowns at the 97% threshold (test part; confidently wrong % (executed) · done right % (requested))

### 6a. Per writer folder

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| opus_a · Rules (own cut) | 44.5 (321) | 47.1 (378) |
| opus_a · VSS default | - (0) | 0.0 (378) |
| opus_a · VSS round 2 | - (0) | 0.0 (378) |
| opus_a · SOP-BERT shipped | - (0) | 0.0 (378) |
| opus_a · SOP-BERT all-data | - (0) | 0.0 (378) |
| opus_b · Rules (own cut) | 37.5 (320) | 60.1 (333) |
| opus_b · VSS default | - (0) | 0.0 (333) |
| opus_b · VSS round 2 | - (0) | 0.0 (333) |
| opus_b · SOP-BERT shipped | - (0) | 0.0 (333) |
| opus_b · SOP-BERT all-data | - (0) | 0.0 (333) |
| opus_c · Rules (own cut) | 37.6 (282) | 61.3 (287) |
| opus_c · VSS default | - (0) | 0.0 (287) |
| opus_c · VSS round 2 | - (0) | 0.0 (287) |
| opus_c · SOP-BERT shipped | - (0) | 0.0 (287) |
| opus_c · SOP-BERT all-data | - (0) | 0.0 (287) |
| opus_d · Rules (own cut) | 49.4 (346) | 55.6 (315) |
| opus_d · VSS default | - (0) | 0.0 (315) |
| opus_d · VSS round 2 | - (0) | 0.0 (315) |
| opus_d · SOP-BERT shipped | - (0) | 0.0 (315) |
| opus_d · SOP-BERT all-data | - (0) | 0.0 (315) |

### 6b. Per length class (sentences in the text)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| 1 sentence · Rules (own cut) | 17.7 (113) | 72.7 (128) |
| 1 sentence · VSS default | - (0) | 0.0 (128) |
| 1 sentence · VSS round 2 | - (0) | 0.0 (128) |
| 1 sentence · SOP-BERT shipped | - (0) | 0.0 (128) |
| 1 sentence · SOP-BERT all-data | - (0) | 0.0 (128) |
| 2-6 sentences · Rules (own cut) | 41.7 (355) | 54.8 (378) |
| 2-6 sentences · VSS default | - (0) | 0.0 (378) |
| 2-6 sentences · VSS round 2 | - (0) | 0.0 (378) |
| 2-6 sentences · SOP-BERT shipped | - (0) | 0.0 (378) |
| 2-6 sentences · SOP-BERT all-data | - (0) | 0.0 (378) |
| 7+ sentences · Rules (own cut) | 46.4 (801) | 53.2 (807) |
| 7+ sentences · VSS default | - (0) | 0.0 (807) |
| 7+ sentences · VSS round 2 | - (0) | 0.0 (807) |
| 7+ sentences · SOP-BERT shipped | - (0) | 0.0 (807) |
| 7+ sentences · SOP-BERT all-data | - (0) | 0.0 (807) |

### 6c. Commands vs questions (kind of the requested / produced act)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| command · Rules (own cut) | 50.3 (873) | 46.4 (935) |
| command · VSS default | - (0) | 0.0 (935) |
| command · VSS round 2 | - (0) | 0.0 (935) |
| command · SOP-BERT shipped | - (0) | 0.0 (935) |
| command · SOP-BERT all-data | - (0) | 0.0 (935) |
| question · Rules (own cut) | 19.6 (341) | 81.1 (338) |
| question · VSS default | - (0) | 0.0 (338) |
| question · VSS round 2 | - (0) | 0.0 (338) |
| question · SOP-BERT shipped | - (0) | 0.0 (338) |
| question · SOP-BERT all-data | - (0) | 0.0 (338) |
| fact/rule · Rules (own cut) | 61.8 (55) | 52.5 (40) |
| fact/rule · VSS default | - (0) | 0.0 (40) |
| fact/rule · VSS round 2 | - (0) | 0.0 (40) |
| fact/rule · SOP-BERT shipped | - (0) | 0.0 (40) |
| fact/rule · SOP-BERT all-data | - (0) | 0.0 (40) |

Messages per length class (test part): 1 sentence 123, 2-6 sentences 181, 7+ sentences 101. Per writer: opus_a 111, opus_b 100, opus_c 95, opus_d 99.
A 'not done' request of a kind has no produced request, so the commands / questions split of 'done right' uses the requested acts as denominator and the produced act's kind for the executed side.
