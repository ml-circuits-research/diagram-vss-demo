# FRESH2 report (test part), written by training/sketch/fresh2/fit_report.mjs

Records: results/079_measure_round2/refit/records. Messages: 1113 in the data dirs (opus_a, opus_b, opus_c, opus_d, short3); calibration 368 messages / 808 requested actions; test 745 messages / 1745 requested actions.
Split: int(sha256(id), 16) % 3 == 0 is calibration. Thresholds and confidences are fitted on the calibration part only. MINEXEC 50; bootstrap 1000 resamples of the test messages, seed 1.
Definitions (per requested action, PAIR=value as llm_score.mjs): confidently wrong % = (executed wrong + executed extras) / everything executed; done right % = executed right / requested actions; asked % = right or wrong requests below the threshold / requested; not read % = requested actions with no produced request / requested; extras = produced requests nobody asked for. Execute when confidence >= threshold.

## Cost score: one confident mistake costs 10 right answers (the main measure, AGENTS.md 2026-11-02 19:09)

Score = (requests done right - 10 x (executed wrong + extras executed)) / requested actions x 100. A question, or a request not done, scores 0. Each reader's threshold is the one that maximises this score on the calibration part (out-of-fold confidences, the same folds and recipe as the fits below; the candidates are every out-of-fold confidence value, "execute everything" and "ask everything" = score 0; a tie keeps the higher threshold). Rules have no confidence: their only candidates are execute everything and ask everything. The old fits (unchanged JSONs) were never fitted on this data, so their threshold is read from their confidences on the calibration part. No threshold is chosen on the test part. 95% intervals: 1000 bootstrap resamples of the test messages, the same resamples as the rest of the report.

| reader | score-optimal threshold (calibration score, executed) | test score [95% CI] |
|---|---|---|
| Rules (own cut) | none: asks everything (0.0, 0) | 0.0 [0.0, 0.0] |
| VSS refit | 0.8751 (5.1, 52) | 3.2 [0.7, 5.1] |
| SOP-BERT refit | 0.9098 (19.4, 333) | 29.1 [24.0, 33.9] |
| Rules on the VSS cut | none: asks everything (0.0, 0) | 0.0 [0.0, 0.0] |

| reader | confidently wrong % (executed) · done right % | asked % · extras executed |
|---|---|---|
| Rules (own cut) | - · 0.0 (0 executed) | 74.4 · 0 |
| VSS refit | 3.4 · 4.9 (89 executed) | 73.6 · 0 |
| SOP-BERT refit | 2.2 · 37.7 (673 executed) | 57.5 · 3 |
| Rules on the VSS cut | - · 0.0 (0 executed) | 74.2 · 0 |

Every reader executing everything (test part, no threshold):

| reader | score [95% CI] | right / wrong / not done % · extras |
|---|---|---|
| Rules (own cut) | -288.4 [-318.3, -258.9] | 57.8 / 16.6 / 25.6 · 314 |
| VSS refit | -216.8 [-243.4, -190.6] | 62.8 / 15.9 / 21.3 · 210 |
| SOP-BERT refit | -164.7 [-192.7, -139.0] | 78.9 / 17.0 / 4.1 · 128 |
| Rules on the VSS cut | -215.6 [-242.5, -189.9] | 58.9 / 15.4 / 25.8 · 211 |

Ranking of the five readers on their own cut (test score; the threshold is re-optimised on calibration for each cost; sensitivity only, 10 is the measure): cost 10: SOP-BERT refit 29.1 > VSS refit 3.2 > Rules (own cut) 0.0. cost 5: SOP-BERT refit 37.2 > VSS refit 15.2 > Rules (own cut) 0.0. cost 20: SOP-BERT refit 16.2 > VSS refit 2.9 > Rules (own cut) 0.0.

## 0. The fits (calibration part)

| reader | produced requests · L2 · out-of-fold AUROC | thresholds 95 / 97 / 99 (out-of-fold precision, executed) |
|---|---|---|
| Rules (own cut) | no confidence | executes everything |
| VSS refit | 742 · 10 · 0.768 | 0.8746 (96.2, 53) / 0.8751 (98.1, 52) / none (asks everything) |
| SOP-BERT refit | 854 · 1 · 0.845 | 0.9098 (95.2, 333) / 0.9662 (97.1, 104) / none (asks everything) |
| Rules on the VSS cut | no confidence | executes everything |

## 1. Headline at the 97% threshold (test part)

### 1a. The five readers, each on its own cut

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| Rules (own cut) | 37.5 [34.9, 40.2] · 1612 | 57.8 [55.1, 60.5] |
| VSS refit | 3.4 [0.0, 7.7] · 89 | 4.9 [4.0, 6.0] |
| SOP-BERT refit | 1.3 [0.0, 2.9] · 234 | 13.2 [11.7, 14.9] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| Rules (own cut) | 0.0 · 25.6 | 314 (of 1612 executed) |
| VSS refit | 73.6 · 21.3 | 0 (of 89 executed) |
| SOP-BERT refit | 82.5 · 4.1 | 0 (of 234 executed) |

### 1b. Same cut: every reader on the VSS cut

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| Rules on the VSS cut | 31.8 [29.3, 34.6] · 1506 | 58.9 [56.3, 61.3] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| Rules on the VSS cut | 0.0 · 25.8 | 211 (of 1506 executed) |

## 2. The 95% and 99% thresholds (test part)

| reader | 95%: confidently wrong % · done right % | 99%: confidently wrong % · done right % |
|---|---|---|
| VSS refit | 3.2 · 5.2 (94 exec) | - · 0.0 (0 exec) |
| SOP-BERT refit | 2.2 · 37.7 (673 exec) | - · 0.0 (0 exec) |

## 3. Requests done right % at an equal confidently-wrong rate (read off the test part's own curve; NOT a protocol threshold)

| reader | done right % at confidently wrong <= 5 / 3 / 1 % |
|---|---|
| Rules (own cut) | no confidence: one point, 37.5 confidently wrong, 57.8 right |
| VSS refit | 10.4 / 8.0 / 1.8 |
| SOP-BERT refit | 52.3 / 42.8 / - |
| Rules on the VSS cut | no confidence: one point, 31.8 confidently wrong, 58.9 right |

## 4. Executing everything (no threshold), for continuity

| reader | right / wrong / not done % of requests | extras · AUROC of the confidence (test) |
|---|---|---|
| Rules (own cut) | 57.8 / 16.6 / 25.6 | 314 · - |
| VSS refit | 62.8 / 15.9 / 21.3 | 210 · 0.809 |
| SOP-BERT refit | 78.9 / 17.0 / 4.1 | 128 · 0.865 |
| Rules on the VSS cut | 58.9 / 15.4 / 25.8 | 211 · - |

## 5. AUROC of each confidence on the test part (right vs not right, all produced requests)

| reader | test | calibration, out-of-fold (fitted ones) |
|---|---|---|
| VSS refit | 0.809 | 0.768 |
| SOP-BERT refit | 0.865 | 0.845 |

## 6. Breakdowns at the 97% threshold (test part; confidently wrong % (executed) · done right % (requested))

### 6a. Per writer folder

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| opus_a · Rules (own cut) | 41.9 (327) | 50.3 (378) |
| opus_a · VSS refit | 0.0 (15) | 4.0 (378) |
| opus_a · SOP-BERT refit | 1.9 (54) | 14.0 (378) |
| opus_b · Rules (own cut) | 34.7 (323) | 63.4 (333) |
| opus_b · VSS refit | 8.7 (23) | 6.3 (333) |
| opus_b · SOP-BERT refit | 0.0 (34) | 10.2 (333) |
| opus_c · Rules (own cut) | 36.3 (284) | 63.1 (287) |
| opus_c · VSS refit | 0.0 (14) | 4.9 (287) |
| opus_c · SOP-BERT refit | 0.0 (52) | 18.1 (287) |
| opus_d · Rules (own cut) | 46.6 (343) | 58.1 (315) |
| opus_d · VSS refit | 3.8 (26) | 7.9 (315) |
| opus_d · SOP-BERT refit | 0.0 (64) | 20.3 (315) |
| short3 · Rules (own cut) | 27.5 (335) | 56.3 (432) |
| short3 · VSS refit | 0.0 (11) | 2.5 (432) |
| short3 · SOP-BERT refit | 6.7 (30) | 6.5 (432) |

### 6b. Per length class (sentences in the text)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| 1 sentence · Rules (own cut) | 25.5 (432) | 59.6 (540) |
| 1 sentence · VSS refit | 8.3 (24) | 4.1 (540) |
| 1 sentence · SOP-BERT refit | 4.1 (49) | 8.7 (540) |
| 2-6 sentences · Rules (own cut) | 39.1 (379) | 58.0 (398) |
| 2-6 sentences · VSS refit | 0.0 (29) | 7.3 (398) |
| 2-6 sentences · SOP-BERT refit | 0.0 (76) | 19.1 (398) |
| 7+ sentences · Rules (own cut) | 43.2 (801) | 56.4 (807) |
| 7+ sentences · VSS refit | 2.8 (36) | 4.3 (807) |
| 7+ sentences · SOP-BERT refit | 0.9 (109) | 13.4 (807) |

### 6c. Commands vs questions (kind of the requested / produced act)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| command · Rules (own cut) | 41.9 (1168) | 52.0 (1305) |
| command · VSS refit | 5.4 (37) | 2.7 (1305) |
| command · SOP-BERT refit | 3.6 (83) | 6.1 (1305) |
| question · Rules (own cut) | 20.8 (385) | 78.4 (389) |
| question · VSS refit | 1.9 (52) | 13.1 (389) |
| question · SOP-BERT refit | 0.0 (149) | 38.3 (389) |
| fact/rule · Rules (own cut) | 59.3 (59) | 47.1 (51) |
| fact/rule · VSS refit | - (0) | 0.0 (51) |
| fact/rule · SOP-BERT refit | 0.0 (2) | 3.9 (51) |

Messages per length class (test part): 1 sentence 454, 2-6 sentences 190, 7+ sentences 101. Per writer: opus_a 111, opus_b 100, opus_c 95, opus_d 99, short3 340.
A 'not done' request of a kind has no produced request, so the commands / questions split of 'done right' uses the requested acts as denominator and the produced act's kind for the executed side.
