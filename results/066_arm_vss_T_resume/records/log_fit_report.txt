# FRESH2 report (test part), written by training/sketch/fresh2/fit_report.mjs

Records: results/066_arm_vss_T_resume/records. Messages: 600 in the data dirs (opus_a, opus_b, opus_c, opus_d); calibration 195 messages / 596 requested actions; test 405 messages / 1313 requested actions.
Split: int(sha256(id), 16) % 3 == 0 is calibration. Thresholds and confidences are fitted on the calibration part only. MINEXEC 50; bootstrap 1000 resamples of the test messages, seed 1.
Definitions (per requested action, PAIR=value as llm_score.mjs): confidently wrong % = (executed wrong + executed extras) / everything executed; done right % = executed right / requested actions; asked % = right or wrong requests below the threshold / requested; not read % = requested actions with no produced request / requested; extras = produced requests nobody asked for. Execute when confidence >= threshold.

## Cost score: one confident mistake costs 10 right answers (the main measure, AGENTS.md 2026-11-02 19:09)

Score = (requests done right - 10 x (executed wrong + extras executed)) / requested actions x 100. A question, or a request not done, scores 0. Each reader's threshold is the one that maximises this score on the calibration part (out-of-fold confidences, the same folds and recipe as the fits below; the candidates are every out-of-fold confidence value, "execute everything" and "ask everything" = score 0; a tie keeps the higher threshold). Rules have no confidence: their only candidates are execute everything and ask everything. The old fits (unchanged JSONs) were never fitted on this data, so their threshold is read from their confidences on the calibration part. No threshold is chosen on the test part. 95% intervals: 1000 bootstrap resamples of the test messages, the same resamples as the rest of the report.

| reader | score-optimal threshold (calibration score, executed) | test score [95% CI] |
|---|---|---|
| Rules (own cut) | none: asks everything (0.0, 0) | 0.0 [0.0, 0.0] |
| VSS VSS-T | 0.9073 (7.4, 99) | 8.5 [4.1, 12.7] |

| reader | confidently wrong % (executed) · done right % | asked % · extras executed |
|---|---|---|
| Rules (own cut) | - · 0.0 (0 executed) | 74.6 · 0 |
| VSS VSS-T | 3.7 · 13.9 (189 executed) | 64.9 · 1 |

Every reader executing everything (test part, no threshold):

| reader | score [95% CI] | right / wrong / not done % · extras |
|---|---|---|
| Rules (own cut) | -355.8 [-390.6, -317.7] | 55.5 / 19.0 / 25.4 · 290 |
| VSS VSS-T | -209.7 [-239.9, -178.8] | 61.4 / 17.8 / 20.8 · 122 |

Ranking of the five readers on their own cut (test score; the threshold is re-optimised on calibration for each cost; sensitivity only, 10 is the measure): cost 10: VSS VSS-T 8.5 > Rules (own cut) 0.0. cost 5: VSS VSS-T 20.2 > Rules (own cut) 0.0. cost 20: VSS VSS-T 5.3 > Rules (own cut) 0.0.

## 0. The fits (calibration part)

| reader | produced requests · L2 · out-of-fold AUROC | thresholds 95 / 97 / 99 (out-of-fold precision, executed) |
|---|---|---|
| Rules (own cut) | no confidence | executes everything |
| VSS VSS-T | 553 · 1 · 0.753 | 0.9223 (95.6, 68) / none (asks everything) / none (asks everything) |

## 1. Headline at the 97% threshold (test part)

### 1a. The five readers, each on its own cut

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| Rules (own cut) | 42.6 [39.6, 45.5] · 1269 | 55.5 [52.5, 58.7] |
| VSS VSS-T (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| Rules (own cut) | 0.0 · 25.4 | 290 (of 1269 executed) |
| VSS VSS-T | 79.2 · 20.8 | 0 (of 0 executed) |

## 2. The 95% and 99% thresholds (test part)

| reader | 95%: confidently wrong % · done right % | 99%: confidently wrong % · done right % |
|---|---|---|
| VSS VSS-T | 2.3 · 9.9 (133 exec) | - · 0.0 (0 exec) |

## 3. Requests done right % at an equal confidently-wrong rate (read off the test part's own curve; NOT a protocol threshold)

| reader | done right % at confidently wrong <= 5 / 3 / 1 % |
|---|---|
| Rules (own cut) | no confidence: one point, 42.6 confidently wrong, 55.5 right |
| VSS VSS-T | 20.6 / 12.9 / 2.4 |

## 4. Executing everything (no threshold), for continuity

| reader | right / wrong / not done % of requests | extras · AUROC of the confidence (test) |
|---|---|---|
| Rules (own cut) | 55.5 / 19.0 / 25.4 | 290 · - |
| VSS VSS-T | 61.4 / 17.8 / 20.8 | 122 · 0.832 |

## 5. AUROC of each confidence on the test part (right vs not right, all produced requests)

| reader | test | calibration, out-of-fold (fitted ones) |
|---|---|---|
| VSS VSS-T | 0.832 | 0.753 |

## 6. Breakdowns at the 97% threshold (test part; confidently wrong % (executed) · done right % (requested))

### 6a. Per writer folder

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| opus_a · Rules (own cut) | 44.5 (321) | 47.1 (378) |
| opus_a · VSS VSS-T | - (0) | 0.0 (378) |
| opus_b · Rules (own cut) | 37.5 (320) | 60.1 (333) |
| opus_b · VSS VSS-T | - (0) | 0.0 (333) |
| opus_c · Rules (own cut) | 37.6 (282) | 61.3 (287) |
| opus_c · VSS VSS-T | - (0) | 0.0 (287) |
| opus_d · Rules (own cut) | 49.4 (346) | 55.6 (315) |
| opus_d · VSS VSS-T | - (0) | 0.0 (315) |

### 6b. Per length class (sentences in the text)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| 1 sentence · Rules (own cut) | 17.7 (113) | 72.7 (128) |
| 1 sentence · VSS VSS-T | - (0) | 0.0 (128) |
| 2-6 sentences · Rules (own cut) | 41.7 (355) | 54.8 (378) |
| 2-6 sentences · VSS VSS-T | - (0) | 0.0 (378) |
| 7+ sentences · Rules (own cut) | 46.4 (801) | 53.2 (807) |
| 7+ sentences · VSS VSS-T | - (0) | 0.0 (807) |

### 6c. Commands vs questions (kind of the requested / produced act)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| command · Rules (own cut) | 50.3 (873) | 46.4 (935) |
| command · VSS VSS-T | - (0) | 0.0 (935) |
| question · Rules (own cut) | 19.6 (341) | 81.1 (338) |
| question · VSS VSS-T | - (0) | 0.0 (338) |
| fact/rule · Rules (own cut) | 61.8 (55) | 52.5 (40) |
| fact/rule · VSS VSS-T | - (0) | 0.0 (40) |

Messages per length class (test part): 1 sentence 123, 2-6 sentences 181, 7+ sentences 101. Per writer: opus_a 111, opus_b 100, opus_c 95, opus_d 99.
A 'not done' request of a kind has no produced request, so the commands / questions split of 'done right' uses the requested acts as denominator and the produced act's kind for the executed side.
