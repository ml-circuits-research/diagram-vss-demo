# FRESH2 report (test part), written by training/sketch/fresh2/fit_report.mjs

Records: results/072_measure/fresh2/G/records. Messages: 600 in the data dirs (opus_a, opus_b, opus_c, opus_d); calibration 195 messages / 596 requested actions; test 405 messages / 1313 requested actions.
Split: int(sha256(id), 16) % 3 == 0 is calibration. Thresholds and confidences are fitted on the calibration part only. MINEXEC 50; bootstrap 1000 resamples of the test messages, seed 1.
Definitions (per requested action, PAIR=value as llm_score.mjs): confidently wrong % = (executed wrong + executed extras) / everything executed; done right % = executed right / requested actions; asked % = right or wrong requests below the threshold / requested; not read % = requested actions with no produced request / requested; extras = produced requests nobody asked for. Execute when confidence >= threshold.

## Cost score: one confident mistake costs 10 right answers (the main measure, AGENTS.md 2026-11-02 19:09)

Score = (requests done right - 10 x (executed wrong + extras executed)) / requested actions x 100. A question, or a request not done, scores 0. Each reader's threshold is the one that maximises this score on the calibration part (out-of-fold confidences, the same folds and recipe as the fits below; the candidates are every out-of-fold confidence value, "execute everything" and "ask everything" = score 0; a tie keeps the higher threshold). Rules have no confidence: their only candidates are execute everything and ask everything. The old fits (unchanged JSONs) were never fitted on this data, so their threshold is read from their confidences on the calibration part. No threshold is chosen on the test part. 95% intervals: 1000 bootstrap resamples of the test messages, the same resamples as the rest of the report.

| reader | score-optimal threshold (calibration score, executed) | test score [95% CI] |
|---|---|---|
| Rules (own cut) | none: asks everything (0.0, 0) | 0.0 [0.0, 0.0] |
| VSS G | 0.8140 (8.1, 169) | 12.1 [5.5, 18.5] |
| SOP-BERT G | 0.8233 (24.8, 401) | 14.4 [2.0, 26.7] |

| reader | confidently wrong % (executed) · done right % | asked % · extras executed |
|---|---|---|
| Rules (own cut) | - · 0.0 (0 executed) | 76.5 · 0 |
| VSS G | 4.9 · 25.1 (346 executed) | 53.2 · 5 |
| SOP-BERT G | 7.1 · 60.1 (849 executed) | 32.5 · 5 |

Every reader executing everything (test part, no threshold):

| reader | score [95% CI] | right / wrong / not done % · extras |
|---|---|---|
| Rules (own cut) | -331.7 [-364.8, -294.8] | 58.3 / 18.2 / 23.5 · 273 |
| VSS G | -197.5 [-227.9, -168.2] | 62.2 / 17.0 / 20.8 · 118 |
| SOP-BERT G | -183.2 [-217.0, -151.1] | 78.8 / 18.1 / 3.2 · 107 |

Ranking of the five readers on their own cut (test score; the threshold is re-optimised on calibration for each cost; sensitivity only, 10 is the measure): cost 10: SOP-BERT G 14.4 > VSS G 12.1 > Rules (own cut) 0.0. cost 5: SOP-BERT G 37.2 > VSS G 19.6 > Rules (own cut) 0.0. cost 20: SOP-BERT G 5.0 > VSS G 3.7 > Rules (own cut) 0.0.

## 0. The fits (calibration part)

| reader | produced requests · L2 · out-of-fold AUROC | thresholds 95 / 97 / 99 (out-of-fold precision, executed) |
|---|---|---|
| Rules (own cut) | no confidence | executes everything |
| VSS G | 556 · 10 · 0.773 | 0.8590 (95.4, 65) / none (asks everything) / none (asks everything) |
| SOP-BERT G | 651 · 1 · 0.872 | 0.9567 (95.1, 162) / 0.9782 (97.5, 80) / none (asks everything) |

## 1. Headline at the 97% threshold (test part)

### 1a. The five readers, each on its own cut

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| Rules (own cut) | 40.1 [37.0, 43.0] · 1277 | 58.3 [55.4, 61.4] |
| VSS G (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |
| SOP-BERT G | 2.9 [0.6, 5.7] · 172 | 12.7 [11.0, 14.7] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| Rules (own cut) | 0.0 · 23.5 | 273 (of 1277 executed) |
| VSS G | 79.2 · 20.8 | 0 (of 0 executed) |
| SOP-BERT G | 83.7 · 3.2 | 0 (of 172 executed) |

## 2. The 95% and 99% thresholds (test part)

| reader | 95%: confidently wrong % · done right % | 99%: confidently wrong % · done right % |
|---|---|---|
| VSS G | 0.7 · 11.5 (152 exec) | - · 0.0 (0 exec) |
| SOP-BERT G | 4.5 · 27.4 (377 exec) | - · 0.0 (0 exec) |

## 3. Requests done right % at an equal confidently-wrong rate (read off the test part's own curve; NOT a protocol threshold)

| reader | done right % at confidently wrong <= 5 / 3 / 1 % |
|---|---|
| Rules (own cut) | no confidence: one point, 40.1 confidently wrong, 58.3 right |
| VSS G | 25.2 / 19.9 / 12.0 |
| SOP-BERT G | 31.0 / 20.4 / 1.8 |

## 4. Executing everything (no threshold), for continuity

| reader | right / wrong / not done % of requests | extras · AUROC of the confidence (test) |
|---|---|---|
| Rules (own cut) | 58.3 / 18.2 / 23.5 | 273 · - |
| VSS G | 62.2 / 17.0 / 20.8 | 118 · 0.830 |
| SOP-BERT G | 78.8 / 18.1 / 3.2 | 107 · 0.865 |

## 5. AUROC of each confidence on the test part (right vs not right, all produced requests)

| reader | test | calibration, out-of-fold (fitted ones) |
|---|---|---|
| VSS G | 0.830 | 0.773 |
| SOP-BERT G | 0.865 | 0.872 |

## 6. Breakdowns at the 97% threshold (test part; confidently wrong % (executed) · done right % (requested))

### 6a. Per writer folder

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| opus_a · Rules (own cut) | 41.9 (327) | 50.3 (378) |
| opus_a · VSS G | - (0) | 0.0 (378) |
| opus_a · SOP-BERT G | 2.4 (41) | 10.6 (378) |
| opus_b · Rules (own cut) | 34.7 (323) | 63.4 (333) |
| opus_b · VSS G | - (0) | 0.0 (333) |
| opus_b · SOP-BERT G | 0.0 (37) | 11.1 (333) |
| opus_c · Rules (own cut) | 36.3 (284) | 63.1 (287) |
| opus_c · VSS G | - (0) | 0.0 (287) |
| opus_c · SOP-BERT G | 3.1 (32) | 10.8 (287) |
| opus_d · Rules (own cut) | 46.6 (343) | 58.1 (315) |
| opus_d · VSS G | - (0) | 0.0 (315) |
| opus_d · SOP-BERT G | 4.8 (62) | 18.7 (315) |

### 6b. Per length class (sentences in the text)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| 1 sentence · Rules (own cut) | 18.4 (114) | 72.7 (128) |
| 1 sentence · VSS G | - (0) | 0.0 (128) |
| 1 sentence · SOP-BERT G | 9.1 (22) | 15.6 (128) |
| 2-6 sentences · Rules (own cut) | 40.1 (362) | 57.4 (378) |
| 2-6 sentences · VSS G | - (0) | 0.0 (378) |
| 2-6 sentences · SOP-BERT G | 0.0 (46) | 12.2 (378) |
| 7+ sentences · Rules (own cut) | 43.2 (801) | 56.4 (807) |
| 7+ sentences · VSS G | - (0) | 0.0 (807) |
| 7+ sentences · SOP-BERT G | 2.9 (104) | 12.5 (807) |

### 6c. Commands vs questions (kind of the requested / produced act)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| command · Rules (own cut) | 46.8 (880) | 50.1 (935) |
| command · VSS G | - (0) | 0.0 (935) |
| command · SOP-BERT G | 12.5 (40) | 3.7 (935) |
| question · Rules (own cut) | 19.3 (342) | 81.7 (338) |
| question · VSS G | - (0) | 0.0 (338) |
| question · SOP-BERT G | 0.0 (132) | 39.1 (338) |
| fact/rule · Rules (own cut) | 61.8 (55) | 52.5 (40) |
| fact/rule · VSS G | - (0) | 0.0 (40) |
| fact/rule · SOP-BERT G | - (0) | 0.0 (40) |

Messages per length class (test part): 1 sentence 123, 2-6 sentences 181, 7+ sentences 101. Per writer: opus_a 111, opus_b 100, opus_c 95, opus_d 99.
A 'not done' request of a kind has no produced request, so the commands / questions split of 'done right' uses the requested acts as denominator and the produced act's kind for the executed side.
