# COMBINED_READER: one reader made of SOP-BERT and VSS, its confidence, and the demo tab "VSS + Neural" (2026-11-02)

Owner's decision (2026-11-02 21:57): "In the end I want a system that errs little and does a lot; three readers are not a goal in themselves,
that is for evaluation. Add a tab that shows what Neural and VSS can do together, and raise the confidence of both when both agree: if both
are right it is probably correct, so relax the rigour."

COMBINE.md measured that agreement between the two readers is the strongest confidence signal either has (on the calibration part, a request
both read the same is right 95% of the time). This document fixes how the two readings of a message become ONE set of requests to execute,
how each gets its confidence, and how that is measured. It was written before any number of the fit below was computed.

## Design

### 1. One cut, two readings
Both readers read the units of the SAME cut of the message (the demo already cuts each message once for every reader, ⋮ › Settings ›
Cutting). Two cuts are candidates: the BERT cutter (SOP-BERT's span head) and the VSS cutter (the world cutter). The combined confidence is
fitted for both (records below), and the cut whose combined reader has the higher calibration out-of-fold cost score is **the recommended
cut** (a tie keeps the VSS cutter, the demo's default). The demo uses the fit of the cut the message was actually cut by; with the Rules
segmenter (fitted for neither) it uses the recommended cut's fit and says so.

### 2. Pairing
The requests of the two readers on one message are paired exactly as in COMBINE.md: SOP-BERT's requests play the produced side and VSS's
requests the gold side of `layer_common.mjs pairValue` (PAIR=value: per act, a maximum-weight matching, most pairs, then most keys equal,
then most letters shared by the two units). A pair is two readings of the same act. Agreement of a pair: `agree_share` = keys with equal
canonical values (`bench-canon.js canon`) / the union of the keys of the two (action / ask excluded; a key missing on one side counts as a
disagreement; empty union: 1); `agree` = 1 when `agree_share` = 1.

### 3. What is executed
Every request of the combined reader is one of:
- **paired** (both readers produced it): **SOP-BERT's reading** is the one executed (the better reader alone: COMBINE.md, 82.6% vs 66.8%
  right when executing everything on the calibration part); VSS's reading of it is not executed;
- **SOP-BERT only** (no VSS request of the same act paired with it): SOP-BERT's reading;
- **VSS only** (a VSS request no SOP-BERT request was paired with): VSS's reading.
A VSS-only request that refers to a shape made by a paired request refers to SOP-BERT's reading of that request (the one executed).

### 4. Its confidence
Two logistic models with the recipe of `fresh2/fit_report.mjs` (percentile maps fitted on the training data of the fold, a prior, L2 from
{0.01, 0.1, 1, 10} by out-of-fold AUROC, 5 folds by message):
- **SOP-BERT executes** (paired and SOP-BERT-only requests): SOP-BERT's 24 signals with the act prior (its own confidence's signals), plus
  - `agree` (binary) and `agree_share` (percentile): full and partial agreement with the paired VSS request (0 and 0 when unpaired);
  - `other_conf`: **the other reader's confidence**, the demo's VSS confidence (`docs/model/confidence/vss.json`, `docs/js/vss-confidence.js`)
    of the paired VSS request, computed on the VSS signals as the demo has them (cut signals from the VSS world cutter at the unit); 0 when
    unpaired (VSS has no reading of this request).
- **VSS executes** (VSS-only requests): VSS's 14 signals with the world prior (its own confidence's signals). For these requests agreement and
  the other reader's confidence are constant (0: SOP-BERT produced no request of that act there), so they are not inputs of this model. On
  the BERT cut the two cut signals are the SOP-BERT cut head's probabilities at the unit's edges (COMBINE.md, A); on the VSS cut, the VSS
  cutter's (as `vss.json`).

**Out of fold, with no leak through `other_conf`:** `vss.json` was fitted on the whole calibration part, so using it inside the folds would
leak the held-out fold's labels. Inside each fold, the VSS confidence is refitted with the recipe of `vss.json` (its 14 signals, L2 1, on the
VSS-own-cut requests of the training folds) and its value is the `other_conf` of every request of that fold (in-sample for the training
messages, out of sample for the held-out ones, as the shipped file is for the final fit). The final model uses the shipped `vss.json`
itself (checked: the recipe refitted on the whole calibration part reproduces it).

**Threshold:** one threshold over the combined confidences of all the combined reader's requests, the cost-score optimum on the out-of-fold
calibration confidences (cost 10: right − 10 × (executed wrong + extras executed) per 100 requested actions; a tie keeps the higher
threshold).

**Outcome of a combined request:** the combined reader's produced requests (SOP-BERT's on every pair and SOP-BERT-only request, VSS's
VSS-only ones) are paired with the gold requests of the message exactly as `combine/collect_pair.mjs outcomes()` (PAIR=value), all of them
at once (a VSS-only request can be an extra when SOP-BERT already took its gold request). Checked: the same code on one reader's requests
reproduces that reader's recorded outcomes.

### 5. Data, split and records
- fresh2 (600 messages, `training/sketch/llm_bench/fresh2/opus_{a,b,c,d}`). **Calibration part** (195 messages, 596 requested actions):
  `int(sha256(id), 16) % 3 == 0`. Everything is fitted and chosen there only, out of fold. **Test part** (405 messages, 1313 requested
  actions): already read for FEEDBACK_PLAN.md and COMBINE.md; scored once, labelled **"test part (already read; exploratory)"**, never used
  to choose anything.
- Records: `combine/collect_pair.mjs` with a fourth pass added: SOP-BERT reading the units of the VSS cut (`sop_vss.jsonl`; the demo's path
  for the VSS cutter: the units given, the cut head run once more for its cut signals at those units, as `fresh2/collect_sop.mjs` cut
  "vss"). The three existing passes are unchanged. BERT cut: `sop_own` + `vss_bert`; VSS cut: `sop_vss` + `vss_own`.
- Fit and report: `combine/combined_report.mjs` (new; the recipe and the statistics copied from `combine/combine_report.mjs`).

### 6. What is reported
- For each cut: the combined reader at its cost-score threshold: L2 and out-of-fold AUROC of each model, the threshold, calibration
  out-of-fold cost score [95% bootstrap over messages, 1000 resamples, seed 1], confidently wrong % of executed, done right % of requested,
  asked %, extras executed; how many requests are paired / SOP-BERT-only / VSS-only and how many of each are executed.
- **The comparison:** calibration out-of-fold cost score of the combined reader (recommended cut) against SOP-BERT alone (its own cut, the
  arm BERT-G: 24.8) and VSS alone (its own cut, the arm VSS-G: 8.2), each at its own cost-score threshold, with the 95% paired bootstrap
  interval of the difference (the same 1000 resamples of the 195 calibration messages, seed 1).
- The test part (already read; exploratory), once, for both cuts and the two readers alone.
- Bar written now, to call the combined reader better than SOP-BERT alone on the calibration part: the paired interval of the difference
  lies above 0. A miss is reported as a miss; no knob is turned after the first number.

### 7. What this cannot show, and the next step
The calibration part chose the cut, the L2, the threshold and fitted the weights; its out-of-fold score carries a small optimism, and the
test part was already read twice (FEEDBACK_PLAN.md, COMBINE.md). **The clean confirmation needs a fresh set (fresh3)**: messages from a writer
none of the readers and none of the fits has seen, written and annotated as fresh2 was, read once by the combined reader with the confidence
and threshold fixed by this document, and compared with SOP-BERT alone and VSS alone by the cost score. That is the next step of the plan.

## The demo tab "VSS + Neural"
A fourth reader tab with its own drawing (its own world, undo / redo) and the subtabs Drawing / SOP Lang / Settings. It makes no model call of
its own: it reuses the two readers' readings of the message (on the shared cut; the VSS cut's extra call of SOP-BERT's cut head is the one the
Neural tab already makes). It executes a request only when its combined confidence clears the threshold; below it, it says why in plain
words ("the two readers disagree on the colour", "only one reader found this request", what the executing reader itself was unsure of) and
offers "Do it anyway". Settings: safety threshold (default) or execute all. The model is `docs/model/confidence/combined.json` (versioned by
`training/sketch/stamp_models.py`); the browser code is `docs/js/combined-confidence.js` (no imports), checked against the script by
`training/sketch/test_combined_confidence.mjs`.

## Changes after the protocol was written (owner, 2026-11-02 22:08 and 22:12; none changes a fit or a threshold)
- The tab is named **VSS-BERT**; the neural tab is labelled **SOP-BERT** (its internal id stays `neural`).
- VSS-BERT always reads the units of the recommended cut (the BERT cutter, below): when the message was cut by it, the two tabs' readings are
  reused; otherwise VSS-BERT cuts with the BERT cutter and both readers read those units in the page, with the VSS-BERT drawing's names (two
  calls of the SOP-BERT model: the cut and the read). Only without a BERT cutter does it fall back to the shared cut and its fit.
- Settings levels besides the default (cost 10): **bolder** (cost 5) and **more careful** (cost 20), each the cost-score optimum on the same
  out-of-fold calibration confidences, stored in the files (combined.json per cut; also added to vss.json and sop-bert.json, whose weights do
  not change: the recipe here reproduces both files, the same cost-10 thresholds and, for VSS, the same confidences).

## Results (one run, 2026-11-02)

Runs: `THREADS=2 node training/sketch/combine/collect_pair.mjs <records> fresh2 training/sketch/llm_bench/fresh2/opus_{a,b,c,d}` (119 s; passes
1-3 byte-identical to COMBINE.md's records), then `EXPORT=1 node training/sketch/combine/combined_report.mjs <records> <report.md> <the same
four folders>` (3 s). Records and full report: scratchpad `combined/records/`, `combined/report.md` (not in the repository). Models: VSS-G
(`docs/model/micro/registry.json`), SOP-BERT G (`docs/model/neural/sop-bert`), `docs/model/confidence/vss.json` as VSS's own confidence.
Checks: the outcomes recomputed from the records equal the recorded ones (7412 requests); vss.json's recipe refitted on the whole calibration
part gives the shipped file's confidences exactly (max difference 0).

**The cut.** Calibration out-of-fold cost score of the combined reader: **BERT cut 46.3** [34.5, 55.3], VSS cut 31.9 [16.2, 46.2] (difference
14.4 [3.5, 25.7]). Recommended: the BERT cutter.

**The verdict (bar of section 6): met.** On the calibration part, out of fold, each at its own cost-score threshold:

| reader | cost score (cal, oof) | done right % | confidently wrong % of executed | asked % | test part (already read; exploratory): score / done right / confidently wrong |
|---|---|---|---|---|---|
| **VSS-BERT (BERT cut)**, threshold 0.8701 | **46.3** [34.5, 55.3] | 56.4% | 1.8% (6 of 342) | 41.3% | 40.6 [34.0, 47.0] / 52.8% / 2.3% (16 of 709) |
| VSS-BERT (VSS cut), threshold 0.8471 | 31.9 [16.2, 46.2] | 52.0% | 3.7% (12 of 322) | 41.4% | 33.4 [26.6, 39.9] / 47.8% / 2.9% |
| SOP-BERT alone (own cut), 0.8233 | 24.8 [2.1, 43.2] | 63.4% | 5.7% (23 of 401) | 31.7% | 14.4 [2.0, 26.7] / 60.1% / 7.1% (60 of 849) |
| VSS alone (own cut), 0.8964 | 8.2 [−3.1, 17.6] | 18.3% | 5.2% (6 of 115) | 63.4% | 12.9 [9.2, 16.5] / 15.9% / 1.9% (4 of 213) |

Paired differences (95% bootstrap over the 195 calibration messages, 1000 resamples, seed 1): VSS-BERT − SOP-BERT alone **+21.5 [7.2, 37.9]**
(interval above 0); VSS-BERT − VSS alone **+38.1 [27.1, 49.0]**. Test part (already read; exploratory): +26.2 [15.9, 36.8] and +27.7
[20.3, 34.5]. AUROC of the combined confidence: 0.939 (cal, oof), 0.937 (test).

What it executes (BERT cut, calibration part): of 408 requests both readers read the same (95.1% right) it executes 337, 5 of them wrong or
extra; of 115 paired but not agreeing (53.0% right) 5; of 128 that only SOP-BERT produced (33.6% right) none; of 55 that only VSS produced
(1 right) none. The VSS-only part of the model has almost nothing to learn from (1 right request of 55; out-of-fold AUROC 0.10, L2 0.01): it
never executes. Weights of the added inputs (percentile scale): agree 1.34, agree_share 0.60, other_conf 0.40.

**The balance (coordinator's question: correctness and coverage).** Requests done right at the same confidently-wrong rate, the best point of
each reader's curve read the same way (calibration oof / test part, exploratory):

| confidently wrong at most | VSS-BERT (BERT cut) | SOP-BERT alone |
|---|---|---|
| 1% | 37.6% / 37.8% | 6.4% / 1.8% |
| 2% | 56.4% / 51.9% | 6.4% / 10.2% |
| 3% | 57.7% / 56.8% | 13.1% / 20.4% |
| 5% | 63.8% / 61.3% | 25.8% / 31.0% |
| 5.7% (SOP-BERT's rate at its threshold, cal) | 64.8% / 63.4% | 63.4% / 48.1% |
| 7.1% (SOP-BERT's rate at its threshold, test) | 70.8% / 69.5% | 67.6% / 60.2% |

At every rate VSS-BERT does at least as many requests right as SOP-BERT alone; at SOP-BERT's own calibration rate the margin is small (64.8%
vs 63.4%), at 1-3% it is large. At its cost-10 threshold VSS-BERT trades 7 points of done right (56.4% vs 63.4%) for a third of the confident
mistakes (1.8% vs 5.7%).

Cost sensitivity (threshold chosen on cal oof at that cost; cal / test): VSS-BERT cost 5: 0.8701 (the same as cost 10), 56.4% / 52.8% done
right, 1.8% / 2.3% wrong; cost 20: 0.8813, 54.0% / 50.4% done right, 1.5% / 1.6% wrong. SOP-BERT alone cost 5: 0.8233 (same as cost 10);
cost 20: 0.9617, 23.3% / 24.8% done right, 3.5% / 3.8% wrong. VSS alone cost 5: 0.8322, 33.4% done right (cal); cost 20: 0.9474, 2.3%.

**What this cannot show, and the next step.** The calibration part chose the cut, the L2, the threshold and the weights (the out-of-fold
score still carries a small optimism), and the test part had been read twice before. Errors both readers share (4.9% of the agreeing
requests) stay invisible to agreement. **The clean confirmation needs a fresh set (fresh3)**: messages from a writer no reader and no fit has
seen, read once by VSS-BERT with combined.json as it is now, compared with SOP-BERT alone and VSS alone by the cost score. That is the next step.

### Files
- `training/sketch/combine/COMBINED_READER.md` (this file), `combine/combined_report.mjs` (fit, report, EXPORT), `combine/collect_pair.mjs`
  (pass 4 added), `combine/combined_parity.json` (the parity fixture)
- `docs/model/confidence/combined.json` (new; versioned in `docs/model/versions.json`), levels cost5 / cost20 added to `vss.json` and `sop-bert.json`
- `docs/js/combined-confidence.js` (new), `docs/js/ui.js` (the VSS-BERT tab, the SOP-BERT label, the levels), `vss-confidence.js` and
  `neural-confidence.js` (the cost5 / cost20 levels), help pages (`docs-concepts.js` "Two readers together", tab names in `help.js`, `docs-arch.js`)
- tests: `training/sketch/test_combined_confidence.mjs`, `training/sketch/test_combined_ui.py`; `test_vss_gate_ui.py`, `test_neural_gate_ui.py` updated
