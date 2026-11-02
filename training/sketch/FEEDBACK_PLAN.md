# FEEDBACK_PLAN: does data written from VSS's own failures help it more than the same amount of general data?

Written 2026-11-02 19:00 by the coordinator, before any targeted data exists and before any arm is trained. The owner's goal: a VSS that
reads as well as fine-tuned SOP-BERT and reports better when it is unsure, and that says what data it needs. Nothing below changes after the
first result; a change is a new plan with its own date.

## Hypothesis
VSS's named failures (unknown words, unplaced words, phrases no front end maps, no action word, poor world choice), collected from
unlabelled text by `feedback/data_needs.mjs`, point at the data it lacks. Training data written from that list helps VSS more than the same
amount of training data written from the general brief, on text from a writer it has not learned from.

## Data
- Base: every annotated folder the shipped VSS chain trains on (training/neural/ALL_DATA.md) + `llm_train/opus_train_{a,b,c,d}` (1200
  messages written by Opus from the general brief, label-checked).
- **T (targeted)**: 600 messages written by Opus from the top needs of `feedback/DATA_NEEDS.md` (computed on the text of the fresh2
  calibration part and the training pool; never the fresh2 test part), by constructions and actions, not copying any example.
- **G (general, the control)**: 600 messages written by Opus from the general brief, same writers' setup, same length mix.
- T and G are written in parallel, label-checked the same way, and neither writer sees the other's brief or any evaluation text.

## Arms (each trained the shipped way: VSS = 7 worlds + world cutter + event cutter + context filler; SOP-BERT = make_roles --all + 8 epochs)
| Arm | Training data |
|---|---|
| VSS-G, BERT-G | base + G |
| VSS-T, BERT-T | base + T |
Also reported: today's shipped readers (FRESH2_RESULT.md), for reference only.

## Measure (fresh2 test part: 405 messages, read by no one before; the same pipeline as FRESH2_PLAN.md)
- Confidences and thresholds of every arm fitted with the same recipe on the union of the old held-out split's text and the fresh2
  calibration part (a larger calibration set than FRESH2_PLAN.md's 195 messages, which was too small to reach 97%).
- **Primary**: requests done right at <= 3% confidently wrong (each arm's own test-part curve), and at the 97% threshold fixed on calibration:
  confidently wrong % and requests done right %.
- Secondary: execute-all right / wrong / not done + extras; AUROC; the share of VSS-T's misses still covered by the top needs.

## What counts as "it helps" (fixed now)
- **Targeting helps VSS** if VSS-T − VSS-G, requests done right at <= 3% confidently wrong, is > 0 with its 95% bootstrap interval (1000
  resamples of test messages) above 0.
- **It helps VSS more than BERT** if (VSS-T − VSS-G) − (BERT-T − BERT-G) has its 95% interval above 0.
- **VSS reaches SOP-BERT** if VSS-T's requests done right at <= 3% confidently wrong is within the 95% interval of BERT-T's.
A miss on any line is reported as a negative result; no second try with the same test part.

## Amendment 2026-11-02 19:10 (before any targeted data exists and before any arm is trained)
The owner made the cost score the measure (AGENTS.md): score = (requests done right − 10 × (executed wrong + extras executed)) per 100
requested actions; asked / not done = 0. Each arm's threshold maximises the score on the calibration data (out-of-fold). The three
verdicts above are judged on this score on the test part (same 95% bootstrap rule) instead of "requests done right at <= 3% confidently
wrong", which is still reported beside it.

## Amendment 2026-11-02 19:40 (before any arm is trained)
Calibration is the fresh2 calibration part only (195 messages), for every arm and both readers. The old held-out split is dropped from it:
every arm is trained on all data, so that split is training data for the arms and their confidences on it would be in-sample (thresholds
too lax). The cost-score threshold (a maximum, not a 97% target) can be fitted on 195 messages.
