# COST_SCORE: which reader scores best when one confident mistake costs 10 right answers

Measure (owner, 2026-11-02 19:09; AGENTS.md "What counts as an error"): score = (requests done right - 10 x (executed wrong + extras
executed)) / requested actions x 100. A question, or a request not done, scores 0. So asking about everything scores exactly 0, and a reader
that executes everything usually scores far below 0. Each reader's threshold is the one that gives the best score on its calibration data,
using out-of-fold confidences (each request scored by a model that did not see its fold). "Execute everything" and "ask everything" were
candidates too. No threshold is chosen on the data it is scored on.

## Direct answer

- On the old data (sample1000 and short 299): the SOP-BERT with its fitted confidence scores best, 35.1 on the sample and 27.4 on the short
  commands. VSS combined scores 19.8 and 13.4. Rules score 0 (the best they can do is ask about everything).
- On the new writer (fresh2 test part, 405 messages): SOP-BERT shipped scores best, 9.9 on its own cut (15.5 on the VSS cut). Next come
  SOP-BERT all-data (7.1), VSS round 2 (5.3), VSS default (4.0) and Rules (0). The three learned readers' intervals overlap, so the order
  below SOP-BERT shipped is not settled; that SOP-BERT shipped is above Rules and above the VSS default is.
- With every reader executing everything, all scores are deeply negative (-190 to -355 on fresh2): none of them can be left unguarded.
- All scores on the new writer are far lower than on the old data: with a confident mistake costing 10, a reader that is 95% sure and
  right 95% of the time still loses.

## Old data (held-out split fits the threshold; applied once to the two sets)

Threshold read from the 585-message held-out split (1711 requested actions), out-of-fold. SOP-BERT never saw sample1000; VSS was trained on
it, so the sample favours VSS.

| Reader | Threshold (held-out score) | Score: sample1000 / short 299 |
|---|---|---|
| SOP-BERT fitted confidence | 0.9253 (40.5) | 35.1 / 27.4 |
| VSS combined confidence | 0.8904 (26.2) | 19.8 / 13.4 |
| SOP-BERT, raw minimum probability | 0.9983 (7.1) | 1.3 / 12.7 |
| Rules | asks everything (0.0) | 0.0 / 0.0 |

What stands behind these scores (sample1000 / short 299):

| Reader | Done right % · asked % | Confidently wrong % · extras executed |
|---|---|---|
| SOP-BERT fitted | 47.2 / 40.8 · 49.2 / 56.2 | 2.5 / 3.2 · 20 / 1 |
| VSS combined | 36.5 / 30.1 · 51.1 / 46.5 | 4.4 / 5.3 · 35 / 2 |
| SOP-BERT raw minimum | 13.4 / 19.4 · 83.1 / 77.9 | 8.3 / 3.3 · 24 / 0 |

Executing everything, sample1000 / short 299: Rules -265.3 / -86.0, VSS -105.2 / -170.9, SOP-BERT -155.5 /
-146.5. Sensitivity (not the measure), sample1000 / short 299: at cost 5, SOP-BERT fitted 47.2 / 44.8, VSS 35.3 / 22.7; at cost 20, SOP-BERT
fitted 24.4 / 29.8, VSS 7.8 / 1.3. The order does not change with the cost.

## New writer (fresh2 test part, 405 messages, 1313 requested actions)

Threshold from the 195-message calibration part, out-of-fold (the same folds and recipe as REPORT_042.md). 95% interval: 1000 bootstrap
resamples of the test messages. Full tables: `fresh2/REPORT_042_cost.md`.

| Reader (own cut) | Threshold (calibration score) | Test score [95% interval] |
|---|---|---|
| SOP-BERT shipped | 0.9636 (7.2) | 9.9 [6.7, 12.6] |
| SOP-BERT all-data | 0.8357 (17.8) | 7.1 [-4.5, 17.6] |
| VSS round 2 | 0.8995 (2.5) | 5.3 [1.5, 9.1] |
| VSS default | 0.9231 (5.5) | 4.0 [-0.3, 7.9] |
| Rules | asks everything (0.0) | 0.0 |

| Reader (own cut) | Done right % · asked % | Confidently wrong % · extras executed |
|---|---|---|
| SOP-BERT shipped | 12.2 · 82.6 | 1.8 · 0 |
| SOP-BERT all-data | 42.9 · 49.5 | 7.7 · 5 |
| VSS round 2 | 9.9 · 68.7 | 4.4 · 1 |
| VSS default | 8.6 · 67.8 | 5.0 · 0 |

On the VSS cut (every reader reading the same pieces): SOP-BERT shipped 15.5 [12.9, 18.2], SOP-BERT all-data 9.7 [0.3, 18.3], VSS default
4.0, Rules 0.

Sensitivity (not the measure): at cost 5 the two SOP-BERTs tie (all-data 23.4, shipped 23.3) ahead of the VSS readers (15.1, 13.3); at cost
20 SOP-BERT shipped leads (5.2), then all-data 3.3, VSS round 2 2.0, VSS default 1.8.

Reading: the shipped SOP-BERT wins by being very careful (it executes 12% of requests, nearly all right). The all-data model does much more
(43% right) but its confidence, fitted on only 596 requested actions, is not sharp enough at cost 10, and its interval is wide. The
calibration part is small; the thresholds are noisy, and the score would be steadier with a larger calibration set.

## Files

- `training/sketch/fresh2/fit_report.mjs`: the cost section is the first of the report (COST=n changes the cost; 10 is the measure).
- `training/sketch/precision_bert.mjs`: the cost section for the old data (needs PR=<dir with rules.jsonl>; NOWRITE=1 leaves
  precision_thresholds_bert.json alone). Run from the scratchpad records: `NOWRITE=1 PR=pr node training/sketch/precision_bert.mjs pb pbv/vss_items.json <out>`.
- `training/sketch/regress.sh`: prints the cost score of the gated VSS at the demo's 97% threshold, computed from the same composer run.
  The score-optimal threshold is not in it: it needs a second composer run with another threshold; here it comes from the records (table above).
