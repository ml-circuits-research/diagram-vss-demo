# FRESH2 report (test part), written by training/sketch/fresh2/fit_report.mjs

Records: results/local_GS/records_f2. Messages: 600 in the data dirs (opus_a, opus_b, opus_c, opus_d); calibration 195 messages / 596 requested actions; test 405 messages / 1313 requested actions.
Split: int(sha256(id), 16) % 3 == 0 is calibration. Thresholds and confidences are fitted on the calibration part only. MINEXEC 50; bootstrap 1000 resamples of the test messages, seed 1.
Definitions (per requested action, PAIR=value as llm_score.mjs): confidently wrong % = (executed wrong + executed extras) / everything executed; done right % = executed right / requested actions; asked % = right or wrong requests below the threshold / requested; not read % = requested actions with no produced request / requested; extras = produced requests nobody asked for. Execute when confidence >= threshold.

## Cost score: one confident mistake costs 10 right answers (the main measure, AGENTS.md 2026-11-02 19:09)

Score = (requests done right - 10 x (executed wrong + extras executed)) / requested actions x 100. A question, or a request not done, scores 0. Each reader's threshold is the one that maximises this score on the calibration part (out-of-fold confidences, the same folds and recipe as the fits below; the candidates are every out-of-fold confidence value, "execute everything" and "ask everything" = score 0; a tie keeps the higher threshold). Rules have no confidence: their only candidates are execute everything and ask everything. The old fits (unchanged JSONs) were never fitted on this data, so their threshold is read from their confidences on the calibration part. No threshold is chosen on the test part. 95% intervals: 1000 bootstrap resamples of the test messages, the same resamples as the rest of the report.

| reader | score-optimal threshold (calibration score, executed) | test score [95% CI] |
|---|---|---|
| Rules (own cut) | none: asks everything (0.0, 0) | 0.0 [0.0, 0.0] |
| VSS default | 0.8964 (8.2, 115) | 12.9 [9.2, 16.5] |
| VSS VSS-GS | 0.8982 (8.1, 114) | 12.1 [8.3, 15.6] |
| VSS default (its cut) | 0.8964 (8.2, 115) | 12.9 [9.2, 16.5] |
| VSS default, old fit (unchanged) | 0.9453 (5.4, 54) | 6.9 [4.1, 9.4] |

| reader | confidently wrong % (executed) · done right % | asked % · extras executed |
|---|---|---|
| Rules (own cut) | - · 0.0 (0 executed) | 76.5 · 0 |
| VSS default | 1.9 · 15.9 (213 executed) | 63.1 · 1 |
| VSS VSS-GS | 2.0 · 15.2 (203 executed) | 64.5 · 0 |
| VSS default (its cut) | 1.9 · 15.9 (213 executed) | 63.1 · 1 |
| VSS default, old fit (unchanged) | 1.8 · 8.5 (113 executed) | 70.6 · 0 |

Every reader executing everything (test part, no threshold):

| reader | score [95% CI] | right / wrong / not done % · extras |
|---|---|---|
| Rules (own cut) | -332.5 [-366.2, -296.5] | 58.2 / 18.3 / 23.5 · 273 |
| VSS default | -217.6 [-248.1, -188.4] | 60.4 / 18.8 / 20.8 · 118 |
| VSS VSS-GS | -220.9 [-253.8, -190.4] | 61.7 / 18.3 / 20.0 · 131 |
| VSS default (its cut) | -217.6 [-248.1, -188.4] | 60.4 / 18.8 / 20.8 · 118 |
| VSS default, old fit (unchanged) | -217.6 [-248.1, -188.4] | 60.4 / 18.8 / 20.8 · 118 |

Ranking of the five readers on their own cut (test score; the threshold is re-optimised on calibration for each cost; sensitivity only, 10 is the measure): cost 10: VSS default 12.9 > VSS VSS-GS 12.1 > Rules (own cut) 0.0. cost 5: VSS default 19.3 > VSS VSS-GS 18.2 > Rules (own cut) 0.0. cost 20: VSS VSS-GS 3.7 > VSS default 2.6 > Rules (own cut) 0.0.

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
| Rules (own cut) | 40.2 [37.1, 43.1] · 1277 | 58.2 [55.3, 61.3] |
| VSS default (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |
| VSS VSS-GS (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| Rules (own cut) | 0.0 · 23.5 | 273 (of 1277 executed) |
| VSS default | 79.2 · 20.8 | 0 (of 0 executed) |
| VSS VSS-GS | 80.0 · 20.0 | 0 (of 0 executed) |

### 1b. Same cut: every reader on the VSS cut

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| VSS default (its cut) (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| VSS default (its cut) | 79.2 · 20.8 | 0 (of 0 executed) |

### 1c. The old fits applied unchanged (precision_thresholds.json, precision_thresholds_bert.json): how they transfer to a new writer

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| VSS default, old fit (unchanged) | 5.4 [3.2, 7.9] · 367 | 26.4 [23.9, 28.8] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| VSS default, old fit (unchanged) | 51.5 · 20.8 | 3 (of 367 executed) |

## 2. The 95% and 99% thresholds (test part)

| reader | 95%: confidently wrong % · done right % | 99%: confidently wrong % · done right % |
|---|---|---|
| VSS default | - · 0.0 (0 exec) | - · 0.0 (0 exec) |
| VSS VSS-GS | - · 0.0 (0 exec) | - · 0.0 (0 exec) |
| VSS default (its cut) | - · 0.0 (0 exec) | - · 0.0 (0 exec) |
| VSS default, old fit (unchanged) | 8.5 · 37.5 (539 exec) | 1.7 · 8.9 (119 exec) |

## 3. Requests done right % at an equal confidently-wrong rate (read off the test part's own curve; NOT a protocol threshold)

| reader | done right % at confidently wrong <= 5 / 3 / 1 % |
|---|---|
| Rules (own cut) | no confidence: one point, 40.2 confidently wrong, 58.2 right |
| VSS default | 24.8 / 18.1 / 10.4 |
| VSS VSS-GS | 19.3 / 16.6 / 7.8 |
| VSS default (its cut) | 24.8 / 18.1 / 10.4 |
| VSS default, old fit (unchanged) | 26.2 / 17.5 / 1.1 |

## 4. Executing everything (no threshold), for continuity

| reader | right / wrong / not done % of requests | extras · AUROC of the confidence (test) |
|---|---|---|
| Rules (own cut) | 58.2 / 18.3 / 23.5 | 273 · - |
| VSS default | 60.4 / 18.8 / 20.8 | 118 · 0.841 |
| VSS VSS-GS | 61.7 / 18.3 / 20.0 | 131 · 0.812 |
| VSS default (its cut) | 60.4 / 18.8 / 20.8 | 118 · 0.841 |

## 5. AUROC of each confidence on the test part (right vs not right, all produced requests)

| reader | test | calibration, out-of-fold (fitted ones) |
|---|---|---|
| VSS default | 0.841 | 0.776 |
| VSS VSS-GS | 0.812 | 0.785 |
| VSS default (its cut) | 0.841 | 0.776 |
| VSS default, old fit (unchanged) | 0.826 | - |

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

### 6b. Per length class (sentences in the text)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| 1 sentence · Rules (own cut) | 18.4 (114) | 72.7 (128) |
| 1 sentence · VSS default | - (0) | 0.0 (128) |
| 1 sentence · VSS VSS-GS | - (0) | 0.0 (128) |
| 2-6 sentences · Rules (own cut) | 40.3 (362) | 57.1 (378) |
| 2-6 sentences · VSS default | - (0) | 0.0 (378) |
| 2-6 sentences · VSS VSS-GS | - (0) | 0.0 (378) |
| 7+ sentences · Rules (own cut) | 43.2 (801) | 56.4 (807) |
| 7+ sentences · VSS default | - (0) | 0.0 (807) |
| 7+ sentences · VSS VSS-GS | - (0) | 0.0 (807) |

### 6c. Commands vs questions (kind of the requested / produced act)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| command · Rules (own cut) | 46.9 (880) | 49.9 (935) |
| command · VSS default | - (0) | 0.0 (935) |
| command · VSS VSS-GS | - (0) | 0.0 (935) |
| question · Rules (own cut) | 19.3 (342) | 81.7 (338) |
| question · VSS default | - (0) | 0.0 (338) |
| question · VSS VSS-GS | - (0) | 0.0 (338) |
| fact/rule · Rules (own cut) | 61.8 (55) | 52.5 (40) |
| fact/rule · VSS default | - (0) | 0.0 (40) |
| fact/rule · VSS VSS-GS | - (0) | 0.0 (40) |

Messages per length class (test part): 1 sentence 123, 2-6 sentences 181, 7+ sentences 101. Per writer: opus_a 111, opus_b 100, opus_c 95, opus_d 99.
A 'not done' request of a kind has no produced request, so the commands / questions split of 'done right' uses the requested acts as denominator and the produced act's kind for the executed side.
