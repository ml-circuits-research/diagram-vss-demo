# FRESH2 report (test part), written by training/sketch/fresh2/fit_report.mjs

Records: results/072_measure/short3/ALL/records. Messages: 513 in the data dirs (short3); calibration 173 messages / 212 requested actions; test 340 messages / 432 requested actions.
Split: int(sha256(id), 16) % 3 == 0 is calibration. Thresholds and confidences are fitted on the calibration part only. MINEXEC 50; bootstrap 1000 resamples of the test messages, seed 1.
Definitions (per requested action, PAIR=value as llm_score.mjs): confidently wrong % = (executed wrong + executed extras) / everything executed; done right % = executed right / requested actions; asked % = right or wrong requests below the threshold / requested; not read % = requested actions with no produced request / requested; extras = produced requests nobody asked for. Execute when confidence >= threshold.

## Cost score: one confident mistake costs 10 right answers (the main measure, AGENTS.md 2026-11-02 19:09)

Score = (requests done right - 10 x (executed wrong + extras executed)) / requested actions x 100. A question, or a request not done, scores 0. Each reader's threshold is the one that maximises this score on the calibration part (out-of-fold confidences, the same folds and recipe as the fits below; the candidates are every out-of-fold confidence value, "execute everything" and "ask everything" = score 0; a tie keeps the higher threshold). Rules have no confidence: their only candidates are execute everything and ask everything. The old fits (unchanged JSONs) were never fitted on this data, so their threshold is read from their confidences on the calibration part. No threshold is chosen on the test part. 95% intervals: 1000 bootstrap resamples of the test messages, the same resamples as the rest of the report.

| reader | score-optimal threshold (calibration score, executed) | test score [95% CI] |
|---|---|---|
| Rules (own cut) | none: asks everything (0.0, 0) | 0.0 [0.0, 0.0] |
| VSS ALL | none: asks everything (0.0, 0) | 0.0 [0.0, 0.0] |
| SOP-BERT ALL | 0.9424 (7.1, 15) | 4.2 [-1.4, 8.5] |

| reader | confidently wrong % (executed) · done right % | asked % · extras executed |
|---|---|---|
| Rules (own cut) | - · 0.0 (0 executed) | 68.1 · 0 |
| VSS ALL | - · 0.0 (0 executed) | 69.7 · 0 |
| SOP-BERT ALL | 3.4 · 6.5 (29 executed) | 82.9 · 0 |

Every reader executing everything (test part, no threshold):

| reader | score [95% CI] | right / wrong / not done % · extras |
|---|---|---|
| Rules (own cut) | -156.7 [-202.0, -114.0] | 56.3 / 11.8 / 31.9 · 41 |
| VSS ALL | -271.3 [-323.8, -220.8] | 50.5 / 19.2 / 30.3 · 56 |
| SOP-BERT ALL | -216.2 [-261.3, -167.5] | 68.5 / 21.1 / 10.4 · 32 |

Ranking of the five readers on their own cut (test score; the threshold is re-optimised on calibration for each cost; sensitivity only, 10 is the measure): cost 10: SOP-BERT ALL 4.2 > Rules (own cut) 0.0 > VSS ALL 0.0. cost 5: SOP-BERT ALL 16.2 > VSS ALL 3.5 > Rules (own cut) 0.0. cost 20: SOP-BERT ALL 1.9 > Rules (own cut) 0.0 > VSS ALL 0.0.

## 0. The fits (calibration part)

| reader | produced requests · L2 · out-of-fold AUROC | thresholds 95 / 97 / 99 (out-of-fold precision, executed) |
|---|---|---|
| Rules (own cut) | no confidence | executes everything |
| VSS ALL | 158 · 1 · 0.820 | none (asks everything) / none (asks everything) / none (asks everything) |
| SOP-BERT ALL | 202 · 1 · 0.704 | none (asks everything) / none (asks everything) / none (asks everything) |

## 1. Headline at the 97% threshold (test part)

### 1a. The five readers, each on its own cut

| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |
|---|---|---|
| Rules (own cut) | 27.5 [22.4, 32.7] · 335 | 56.3 [51.4, 61.4] |
| VSS ALL (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |
| SOP-BERT ALL (no level reached: asks everything) | - [-] · 0 | 0.0 [0.0, 0.0] |

| reader | asked % · not read % | extras executed |
|---|---|---|
| Rules (own cut) | 0.0 · 31.9 | 41 (of 335 executed) |
| VSS ALL | 69.7 · 30.3 | 0 (of 0 executed) |
| SOP-BERT ALL | 89.6 · 10.4 | 0 (of 0 executed) |

## 2. The 95% and 99% thresholds (test part)

| reader | 95%: confidently wrong % · done right % | 99%: confidently wrong % · done right % |
|---|---|---|
| VSS ALL | - · 0.0 (0 exec) | - · 0.0 (0 exec) |
| SOP-BERT ALL | - · 0.0 (0 exec) | - · 0.0 (0 exec) |

## 3. Requests done right % at an equal confidently-wrong rate (read off the test part's own curve; NOT a protocol threshold)

| reader | done right % at confidently wrong <= 5 / 3 / 1 % |
|---|---|
| Rules (own cut) | no confidence: one point, 27.5 confidently wrong, 56.3 right |
| VSS ALL | 2.1 / 2.1 / 2.1 |
| SOP-BERT ALL | 20.6 / 8.1 / 4.6 |

## 4. Executing everything (no threshold), for continuity

| reader | right / wrong / not done % of requests | extras · AUROC of the confidence (test) |
|---|---|---|
| Rules (own cut) | 56.3 / 11.8 / 31.9 | 41 · - |
| VSS ALL | 50.5 / 19.2 / 30.3 | 56 · 0.771 |
| SOP-BERT ALL | 68.5 / 21.1 / 10.4 | 32 · 0.794 |

## 5. AUROC of each confidence on the test part (right vs not right, all produced requests)

| reader | test | calibration, out-of-fold (fitted ones) |
|---|---|---|
| VSS ALL | 0.771 | 0.820 |
| SOP-BERT ALL | 0.794 | 0.704 |

## 6. Breakdowns at the 97% threshold (test part; confidently wrong % (executed) · done right % (requested))

### 6a. Per writer folder

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| short3 · Rules (own cut) | 27.5 (335) | 56.3 (432) |
| short3 · VSS ALL | - (0) | 0.0 (432) |
| short3 · SOP-BERT ALL | - (0) | 0.0 (432) |

### 6b. Per length class (sentences in the text)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| 1 sentence · Rules (own cut) | 28.0 (318) | 55.6 (412) |
| 1 sentence · VSS ALL | - (0) | 0.0 (412) |
| 1 sentence · SOP-BERT ALL | - (0) | 0.0 (412) |
| 2-6 sentences · Rules (own cut) | 17.6 (17) | 70.0 (20) |
| 2-6 sentences · VSS ALL | - (0) | 0.0 (20) |
| 2-6 sentences · SOP-BERT ALL | - (0) | 0.0 (20) |
| 7+ sentences · Rules (own cut) | - (0) | - (0) |
| 7+ sentences · VSS ALL | - (0) | - (0) |
| 7+ sentences · SOP-BERT ALL | - (0) | - (0) |

### 6c. Commands vs questions (kind of the requested / produced act)

| group · reader | confidently wrong % (executed) | done right % (requested) |
|---|---|---|
| command · Rules (own cut) | 26.7 (288) | 57.0 (370) |
| command · VSS ALL | - (0) | 0.0 (370) |
| command · SOP-BERT ALL | - (0) | 0.0 (370) |
| question · Rules (own cut) | 32.6 (43) | 56.9 (51) |
| question · VSS ALL | - (0) | 0.0 (51) |
| question · SOP-BERT ALL | - (0) | 0.0 (51) |
| fact/rule · Rules (own cut) | 25.0 (4) | 27.3 (11) |
| fact/rule · VSS ALL | - (0) | 0.0 (11) |
| fact/rule · SOP-BERT ALL | - (0) | 0.0 (11) |

Messages per length class (test part): 1 sentence 331, 2-6 sentences 9, 7+ sentences 0. Per writer: short3 340.
A 'not done' request of a kind has no produced request, so the commands / questions split of 'done right' uses the requested acts as denominator and the produced act's kind for the executed side.
