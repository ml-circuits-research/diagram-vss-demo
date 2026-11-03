# FRESH2 report (test part), written by training/sketch/fresh2/fit_report.mjs

Records: results/local_GS/records_all. Messages: 872 in the data dirs (opus_a, opus_b, opus_c, opus_d, short3_np_test); calibration 195 messages / 596 requested actions; test 677 messages / 1663 requested actions.
Split: int(sha256(id), 16) % 3 == 0 is calibration. Thresholds and confidences are fitted on the calibration part only. MINEXEC 50; bootstrap 1000 resamples of the test messages, seed 1.
Definitions (per requested action, PAIR=value as llm_score.mjs): confidently wrong % = (executed wrong + executed extras) / everything executed; done right % = executed right / requested actions; asked % = right or wrong requests below the threshold / requested; not read % = requested actions with no produced request / requested; extras = produced requests nobody asked for. Execute when confidence >= threshold.

## Cost score: one confident mistake costs 10 right answers (the main measure, AGENTS.md 2026-11-02 19:09)

Score = (requests done right - 10 x (executed wrong + extras executed)) / requested actions x 100. A question, or a request not done, scores 0. Each reader's threshold is the one that maximises this score on the calibration part (out-of-fold confidences, the same folds and recipe as the fits below; the candidates are every out-of-fold confidence value, "execute everything" and "ask everything" = score 0; a tie keeps the higher threshold). Rules have no confidence: their only candidates are execute everything and ask everything. The old fits (unchanged JSONs) were never fitted on this data, so their threshold is read from their confidences on the calibration part. No threshold is chosen on the test part. 95% intervals: 1000 bootstrap resamples of the test messages, the same resamples as the rest of the report.

| reader | score-optimal threshold (calibration score, executed) | test score [95% CI] |
|---|---|---|
| Rules (own cut) | none: asks everything (0.0, 0) | 0.0 [0.0, 0.0] |
| VSS default | 0.8964 (8.2, 115) | 9.5 [5.6, 13.3] |
| VSS VSS-GS | 0.8982 (8.1, 114) | 9.2 [5.1, 12.8] |
| VSS default (its cut) | 0.8964 (8.2, 115) | 9.5 [5.6, 13.3] |
| VSS default, old fit (unchanged) | 0.9453 (5.4, 54) | 5.8 [3.2, 8.1] |

| reader | confidently wrong % (executed) · done right % | asked % · extras executed |
|---|---|---|
| Rules (own cut) | - · 0.0 (0 executed) | 74.6 · 0 |
| VSS default | 3.3 · 14.3 (246 executed) | 60.6 · 1 |
| VSS VSS-GS | 3.3 · 14.0 (241 executed) | 61.8 · 0 |
| VSS default (its cut) | 3.3 · 14.3 (246 executed) | 60.6 · 1 |
| VSS default, old fit (unchanged) | 2.3 · 7.6 (130 executed) | 67.5 · 0 |

Every reader executing everything (test part, no threshold):

| reader | score [95% CI] | right / wrong / not done % · extras |
|---|---|---|
| Rules (own cut) | -302.3 [-331.9, -271.5] | 57.3 / 17.3 / 25.4 · 311 |
| VSS default | -220.8 [-248.3, -195.6] | 57.0 / 18.3 / 24.7 · 157 |
| VSS VSS-GS | -227.3 [-255.0, -200.9] | 58.3 / 17.9 / 23.8 · 177 |
| VSS default (its cut) | -220.8 [-248.3, -195.6] | 57.0 / 18.3 / 24.7 · 157 |
| VSS default, old fit (unchanged) | -220.8 [-248.3, -195.6] | 57.0 / 18.3 / 24.7 · 157 |

Ranking of the five readers on their own cut (test score; the threshold is re-optimised on calibration for each cost; sensitivity only, 10 is the measure): cost 10: VSS default 9.5 > VSS VSS-GS 9.2 > Rules (own cut) 0.0. cost 5: VSS default 14.8 > VSS VSS-GS 11.1 > Rules (own cut) 0.0. cost 20: VSS VSS-GS 3.1 > VSS default 2.3 > Rules (own cut) 0.0.

## 0. The fits (calibration part)

| reader | produced requests · L2 · out-of-fold AUROC | thresholds 95 / 97 / 99 (out-of-fold precision, executed) |
|---|---|---|
| Rules (own cut) | no confidence | executes everything |
| VSS default | 556 · 1 · 0.776 | none (asks everything) / none (asks everything) / none (asks everything) |
| VSS VSS-GS | 566 · 1 · 0.785 | none (asks everything) / none (asks everything) / none (asks everything) |
| VSS default (its cut) | 556 · 1 · 0.776 | none (asks everything) / none (asks everything) / none (asks everything) |
| VSS default, old fit (unchanged) | old JSON, not refitted | 0.8540 / 0.8934 / 0.9438 |

## 1. Headline at the 97% threshold (test part)

### 1a. The five readers, each on its own cut

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| Rules (own cut) | 38.6 [35.9, 41.1] · 1551 | 57.3 [54.6, 60.1] |
| VSS default (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |
| VSS VSS-GS (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| Rules (own cut) | 0.0 · 25.4 | 311 (of 1551 executed) |
| VSS default | 75.3 · 24.7 | 0 (of 0 executed) |
| VSS VSS-GS | 76.2 · 23.8 | 0 (of 0 executed) |

### 1b. Same cut: every reader on the VSS cut

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| VSS default (its cut) (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| VSS default (its cut) | 75.3 · 24.7 | 0 (of 0 executed) |

### 1c. The old fits applied unchanged (precision_thresholds.json, precision_thresholds_bert.json): how they transfer to a new writer

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| VSS default, old fit (unchanged) | 7.3 [5.0, 9.8] · 439 | 24.5 [22.5, 26.6] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| VSS default, old fit (unchanged) | 49.3 · 24.7 | 6 (of 439 executed) |

## 2. The 95% and 99% thresholds (test part)

| reader | 95%: confidently wrong % · done right % | 99%: confidently wrong % · done right % |
|---|---|---|
| VSS default | - · 0.0 (0 exec) | - · 0.0 (0 exec) |
| VSS VSS-GS | - · 0.0 (0 exec) | - · 0.0 (0 exec) |
| VSS default (its cut) | - · 0.0 (0 exec) | - · 0.0 (0 exec) |
| VSS default, old fit (unchanged) | 10.0 · 34.6 (640 exec) | 2.2 · 8.1 (137 exec) |

## 3. Requests done right % at an equal confidently-wrong rate (read off the test part's own curve; NOT a protocol threshold)

| reader | done right % at confidently wrong <= 5 / 3 / 1 % |
|---|---|
| Rules (own cut) | no confidence: one point, 38.6 confidently wrong, 57.3 right |
| VSS default | 18.6 / 13.7 / 7.0 |
| VSS VSS-GS | 16.5 / 13.7 / 3.4 |
| VSS default (its cut) | 18.6 / 13.7 / 7.0 |
| VSS default, old fit (unchanged) | 16.9 / 10.3 / 0.9 |

## 4. Executing everything (no threshold), for continuity

| reader | right / wrong / not done % of requests | extras · AUROC of the confidence (test) |
|---|---|---|
| Rules (own cut) | 57.3 / 17.3 / 25.4 | 311 · - |
| VSS default | 57.0 / 18.3 / 24.7 | 157 · 0.822 |
| VSS VSS-GS | 58.3 / 17.9 / 23.8 | 177 · 0.793 |
| VSS default (its cut) | 57.0 / 18.3 / 24.7 | 157 · 0.822 |

## 5. AUROC of each confidence on the test part (right vs not right, all produced requests)

| reader | test | calibration, out-of-fold (fitted ones) |
|---|---|---|
| VSS default | 0.822 | 0.776 |
| VSS VSS-GS | 0.793 | 0.785 |
| VSS default (its cut) | 0.822 | 0.776 |
| VSS default, old fit (unchanged) | 0.815 | - |

## 6. Breakdowns at the 97% threshold (test part; confidently wrong % (executed) · done right % (requested))

### 6a. Per writer folder

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| opus_a · Rules (own cut) | 41.9 (327) | 50.3 (378) |
| opus_a · VSS default | - (0) | 0.0 (378) |
| opus_a · VSS VSS-GS | - (0) | 0.0 (378) |
| opus_b · Rules (own cut) | 34.7 (323) | 63.4 (333) |
| opus_b · VSS default | - (0) | 0.0 (333) |
| opus_b · VSS VSS-GS | - (0) | 0.0 (333) |
| opus_c · Rules (own cut) | 36.3 (284) | 63.1 (287) |
| opus_c · VSS default | - (0) | 0.0 (287) |
| opus_c · VSS VSS-GS | - (0) | 0.0 (287) |
| opus_d · Rules (own cut) | 46.9 (343) | 57.8 (315) |
| opus_d · VSS default | - (0) | 0.0 (315) |
| opus_d · VSS VSS-GS | - (0) | 0.0 (315) |
| short3_np_test · Rules (own cut) | 31.0 (274) | 54.0 (350) |
| short3_np_test · VSS default | - (0) | 0.0 (350) |
| short3_np_test · VSS VSS-GS | - (0) | 0.0 (350) |

### 6b. Per length class (sentences in the text)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| 1 sentence · Rules (own cut) | 27.6 (373) | 58.6 (461) |
| 1 sentence · VSS default | - (0) | 0.0 (461) |
| 1 sentence · VSS VSS-GS | - (0) | 0.0 (461) |
| 2-6 sentences · Rules (own cut) | 39.5 (377) | 57.7 (395) |
| 2-6 sentences · VSS default | - (0) | 0.0 (395) |
| 2-6 sentences · VSS VSS-GS | - (0) | 0.0 (395) |
| 7+ sentences · Rules (own cut) | 43.2 (801) | 56.4 (807) |
| 7+ sentences · VSS default | - (0) | 0.0 (807) |
| 7+ sentences · VSS VSS-GS | - (0) | 0.0 (807) |

### 6c. Commands vs questions (kind of the requested / produced act)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| command · Rules (own cut) | 43.5 (1123) | 51.2 (1241) |
| command · VSS default | - (0) | 0.0 (1241) |
| command · VSS VSS-GS | - (0) | 0.0 (1241) |
| question · Rules (own cut) | 20.3 (369) | 79.2 (371) |
| question · VSS default | - (0) | 0.0 (371) |
| question · VSS VSS-GS | - (0) | 0.0 (371) |
| fact/rule · Rules (own cut) | 59.3 (59) | 47.1 (51) |
| fact/rule · VSS default | - (0) | 0.0 (51) |
| fact/rule · VSS VSS-GS | - (0) | 0.0 (51) |

Messages per length class (test part): 1 sentence 387, 2-6 sentences 189, 7+ sentences 101. Per writer: opus_a 111, opus_b 100, opus_c 95, opus_d 99, short3_np_test 272.
A 'not done' request of a kind has no produced request, so the commands / questions split of 'done right' uses the requested acts as denominator and the produced act's kind for the executed side.
