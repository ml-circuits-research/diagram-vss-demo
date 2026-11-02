# FRESH2_PLAN: the comparison on the fresh Opus-written set (written before any reader reads it)

Written 2026-11-02 by the coordinator, before any reader has read a message of `llm_bench/fresh2/`. Nothing below may change after the first
score; a change is a new plan with its own date.

## The data
- `training/sketch/llm_bench/fresh2/opus_{a,b,c,d}/batch_01.jsonl`: 600 messages (fo-0001 .. fo-0600), 1912 wires before the label check,
  written blind by four Opus agents (texts saved first, then annotated; byte identity checked by the coordinator), in the legend of
  `llm_bench/SPEC.md`, spans and triggers as `llm_train/TRAIN_MSG_SPEC.md`. Lengths: about 30% one request, 45% 2–6 sentences, 25% 7–20.
- The training data of every reader was written by Sonnet and Haiku; this set by Opus: same legend and conventions, a different writer.
- Label check: two Sonnet agents, blind to every reader, against `LABEL_CONVENTIONS.md` and the majority of the corrected training data
  (`opus_*/LABEL_FIXES.md`). The snapshot before the check is kept outside the repository.
- No reader is trained on this set, ever: it is the test set of this comparison. After the first score it counts as read (AGENTS.md).

## The split (fixed now)
- **Calibration**: the messages whose `int(sha256(id), 16) % 3 == 0` (about 200). Used only to fit each reader's confidence and threshold.
- **Test**: the other messages (about 400). Read once per reader, reported once.

## The readers
1. Rules (no confidence: executes everything it reads).
2. VSS, the default registry (`docs/model/micro/registry.json`) with the context filler of commit 10c5526.
3. VSS, round 2 (`registry_r2.json`, `context/weights_r2.json`).
4. SOP-BERT as shipped (`docs/model/neural/sop-bert`: trained without the 1000-message sample and its 10% held-out).
5. SOP-BERT trained on all the data the VSS chain is trained on (`training/neural/ALL_DATA.md`), when its GPU run has finished.
Every reader uses its own cut (the demo default for VSS is the VSS cut; SOP-BERT its cut head; Rules its segmenter); a second table gives
every reader the same cut (the VSS cut), as in CUT_SHARED.md.

## The confidences and thresholds (fitted on the calibration part only)
- VSS: the features of `VSS_CONFIDENCE.md` (winner "logistic all minus event"); SOP-BERT: the 24 signals of `PRECISION_BERT.md`.
- Same recipe for both: percentile normalisation, act/world priors and L2 fitted inside 5 folds of the calibration part (folds by message),
  the L2 from the same grid as before, chosen by out-of-fold AUROC; the threshold is the lowest whose out-of-fold precision of execution
  on the calibration part is >= 97% with >= 50 executed requests (also 95% and 99%). If no threshold qualifies, the reader asks about
  everything at that level.
- Also reported, unchanged: the confidences and thresholds fitted earlier on the old held-out split (precision_thresholds.json,
  precision_thresholds_bert.json), applied as they are: how well they transfer to a new writer.

## What is reported (test part)
1. **Headline (AGENTS.md, owner 2026-11-02): confidently wrong** = executed wrong (requested actions done wrong + extras) / everything
   executed, at the 97% threshold. Next to it: requests done right %, asked %, not read %, extras executed.
2. The comparison: requests done right at the same confidently-wrong rate (5%, 3%, 1%), from each reader's test-part curve, labelled as
   read off the test part.
3. Executing everything (no threshold): right / wrong / not done % of requests + extras, the earlier measure, for continuity.
4. AUROC of each confidence on the test part.
5. Breakdowns: per writer slice (opus_a .. opus_d), per length class (1 request / 2–6 sentences / 7+), commands vs questions.
6. Uncertainty: a 95% bootstrap interval over messages (1000 resamples) for the headline and for requests done right.
Numbers are per gold request (the `llm_score.mjs` metric, PAIR=value). Heavy runs go to the owner's GPU machine (the runner), in parallel.

## What decides
The reader with the lowest confidently-wrong rate at a reasonable share of requests done right, and, at equal confidently-wrong rate,
the one that does more right. No threshold is chosen on the test part.
