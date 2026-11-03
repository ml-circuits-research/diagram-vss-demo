# FEEDBACK_RESULT: data written from VSS's own needs did not help it (2026-11-02)

Plan: FEEDBACK_PLAN.md (with its amendments, all made before training). Runs: GPU-machine jobs 061/065 (VSS-G), 063/066 (VSS-T), 062
(BERT-G), 064 (BERT-T); verdicts by `fresh2/verdicts.mjs` (each arm's score reproduced from its own report): `fresh2/VERDICTS.md`.
Measure: the cost score on the fresh2 test part (405 messages, 1313 requests), one confident mistake = 10 right answers, each arm's
threshold fitted on the fresh2 calibration part (195 messages); paired bootstrap, 1000 resamples.

## The verdicts, as fixed beforehand

| Verdict | Result [95% CI] | Answer |
|---|---|---|
| 1. Targeting helps VSS (VSS-T − VSS-G) | −4.3 [−8.4, −0.4] | **No: targeted data made VSS worse** |
| 2. It helps VSS more than BERT | −8.5 [−20.4, 2.8] | No |
| 3. VSS reaches SOP-BERT (VSS-T in BERT-T's interval) | 8.5 vs [9.3, 28.0] | No |

## Per arm (test part)

| Arm | Score [95% CI] | Done right % · confidently wrong % |
|---|---|---|
| VSS shipped (FRESH2_RESULT / COST_SCORE) | 4.0 [−0.3, 7.9] | 8.6 · 5.0 |
| VSS-G: + 1200 base + 600 general Opus messages | 12.9 [9.2, 16.5] | 15.9 · 1.9 |
| VSS-T: + 1200 base + 600 targeted | 8.5 [4.1, 12.7] | 13.9 · 3.7 |
| SOP-BERT shipped | 9.9 [6.7, 12.6] | 12.2 · 1.8 |
| BERT-G | 14.4 [2.0, 26.7] | 60.1 · 7.1 |
| BERT-T | 18.6 [9.3, 28.0] | 44.5 · 5.5 |

## What it says
- The pre-registered answer is negative on all three lines: writing data from VSS's list of needs did not help VSS on the new writer; it
  lowered its score against the same amount of general data, and confidently-wrong rose (1.9 → 3.7%).
- Observed, not a verdict of the plan: more varied Opus data (base + G) tripled VSS's score on the new writer (4.0 → 12.9, intervals
  apart), with the fewest confident mistakes of all arms (1.9%), and brought it within BERT-G's interval (14.4 [2.0, 26.7]). Writer
  variety, not targeting, is what helped.
- Possible causes of the targeted loss, NOT yet measured (no second try on this test part): the targeted data is skewed (opus_tgt_2:
  count 125, extreme 109, "then add a" 46 times; opus_tgt_1 written to raw need counts), shifting the worlds' training mix away from the
  test's; the list's top needs were broad doubts (the links world's prior, residual) that touch right requests as often as wrong ones
  (DATA_NEEDS.md 2.2), so data written for them adds more of what VSS already read. A root-cause analysis on the calibration part
  (composer_errors.mjs, VSS-G vs VSS-T) is the next step, before any new data is written.
