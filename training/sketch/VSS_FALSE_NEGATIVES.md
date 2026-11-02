# VSS-G: why it asks about so many requests it would have got right (2026-11-02)

Question (owner): at its safety threshold VSS-G executes only about 16% of requests, although executing everything it would get about
60% right. Is its confidence computed badly?

Data: ONLY the fresh2 calibration part (195 messages, 596 requested actions, 556 requests VSS-G produced), arm VSS-G records
`065_arm_vss_G_resume/records/vss_arm.jsonl`. Confidences are the out-of-fold ones of `fresh2/fit_report.mjs` (5 folds by message,
L2 = 1, threshold 0.8964, the same number the report and `docs/model/confidence/vss.json` give). No test-part message or record was looked at.
Scripts: `/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/vfn/` (a2 to a6, built on a copy of the first 222 lines of fit_report.mjs).

## Direct answer

**It is not a bug. It is a weak measure that is honestly calibrated.** Every check for a bug came back clean (section 4). The confidence says
what it should: of the requests it rates 0.8 to 0.9, 87% are right; of those it rates above 0.9, 95% are right. The trouble is that it can
only single out about a quarter of the right readings with that kind of certainty, because one confident mistake costs ten right answers,
so a request is executed only when it is right at least 91% of the time (10 / 11).

Top 3 causes:

1. **The ranking is not sharp enough for a 91% bar, and this writer lowered the bar's supply.** Right vs not-right AUROC is 0.78 out of
   fold (old held-out data: 0.82), and only 72% of the readings VSS-G produces are right (old held-out data: 82%). The same recipe on the old
   data executes 43% of produced requests; on fresh2 it executes 21%.
2. **The world's own accuracy (the world prior) is the biggest single pull, and it is true, not a style artefact.** On this writer the
   shapes world reads 69% right, position 71%, links 52%. That is the largest pull-down for 146 of the 289 false negatives, and links never
   clears the bar (0 of 48 right links readings executed). 157 of the 289 false negatives are in these three worlds.
3. **The parse-quality signals cannot see a wrong reading that parses cleanly.** Residual, unplaced words, abstain, words-not-understood and the
   cut score all measure how tidy the parse was. 39% of VSS-G's wrong readings (and 30% of the extras) parse cleanly, while 33% of its right
   readings do not. So the tidy-looking right readings and the tidy-looking wrong readings get the same score, and a right reading with one
   untidy sign (a stray word, a low cut score) falls below the bar.

## 1. Confusion at the cost threshold (556 produced requests, calibration part)

| Cell | Count | % of 556 |
|---|---|---|
| Right and executed (true positive) | 109 | 19.6 |
| Wrong or extra, and executed (false positive) | 6 | 1.1 |
| Right but asked (false negative) | 289 | 52.0 |
| Wrong or extra, and asked (true negative) | 152 | 27.3 |

- The 6 false positives: 5 wrong, 1 extra. The 152 true negatives: 89 wrong, 63 extras (requests nobody asked for).
- Executed: 115, of which 109 right (94.8% precision); 18.3% of the 596 requested actions done right. The score is (109 - 10 x 6) / 596 = 8.2.
- Right readings in total: 398 (66.8% of the 596 requested; the owner's "about 60%" is the same figure on the test part).
- False negatives per 100 right readings: 73. False positives per 100 not-right readings: 4.
- Where the false negatives sit: 119 of the 289 have a confidence of 0.80 to 0.896 (just under the line), 70 have 0.70 to 0.80, 66 have 0.50 to 0.70, 34 are below 0.50.
  In the same 0.80 to 0.896 band there are only 19 wrong readings, so 86% of that band is right, which is still under the 91% break-even.

By world (right readings: executed of all):

| World | Right readings executed | Share |
|---|---|---|
| graphq | 32 of 45 | 71% |
| history | 4 of 8 | 50% |
| questions | 34 of 84 | 40% |
| position | 23 of 72 | 32% |
| manage | 4 of 20 | 20% |
| shapes | 12 of 121 | 10% |
| links | 0 of 48 | 0% |

By writer (false negatives of right readings): opus_a 57 of 88, opus_b 56 of 85, opus_c 103 of 132, opus_d 73 of 93. By kind: commands 212
false negatives vs 42 executed right; questions 63 vs 66; facts and rules 14 vs 1. The loss is in commands, and in the shapes world above all.

## 2. Which features pull the false negatives down

Method: the model is a logistic regression on 14 percentile-scaled features. For each false negative, the pull of a feature = weight x
(its percentile minus the mean percentile of the right readings that were executed). The pulls add up to the confidence gap in logit units.
The mean gap between a false negative and an executed right reading is -1.48 logit units.

| Feature (weight) | Mean pull (logit) | False negatives where it is the biggest / second biggest pull |
|---|---|---|
| world prior (1.72) | -0.48 | 146 / 32 |
| cut start score (1.06) | -0.28 | 62 / 82 |
| words not understood, share (0.68) | -0.12 | 11 / 39 |
| unplaced words (0.84) | -0.12 | 19 / 27 |
| residual (0.78) | -0.11 | 11 / 23 |
| cut end score (0.72) | -0.11 | 16 / 44 |
| the other 8 features together | -0.26 | 24 / 42 |

Notes:
- It is not one feature of the reading. The world prior is a third of the gap, the cut start score a fifth, and the parse-quality group (words not
  understood, unplaced, residual, cut end) another third; none of the rest matters. The role margin has weight 0.07 and the tie signal -0.13: they carry nothing.
- What-if test (set one feature to the executed-right typical value, count the false negatives that would cross the line, and the wrong readings
  that would cross with them):

| Feature set to its typical value | False negatives that cross | Wrong readings that cross too |
|---|---|---|
| world prior | 68 | 15 |
| cut start | 25 | 6 |
| cut end | 23 | 3 |
| words not understood, share | 15 | 1 |

  Even the best single repair brings in 4.5 right readings for every wrong one, which is below the 10:1 the cost asks for. No single feature is the problem.
- Most false negatives are not "bad on one feature", they are "average on everything": their percentile is about 0.5 on nearly all features, the
  same as the typical right reading (all right readings together average 0.54 on the main ones, executed ones 0.65 to 0.74).

Ten false negatives, spread evenly from the most confident to the least (the reading's act and arguments are the gold ones, because it is
right; the pulls are the three largest, in logit units):

| Request span (act, world) | Confidence | Largest pulls |
|---|---|---|
| fo-0405 "Make Pay green" (set color, shapes) | 0.894 | world prior -0.72, cut end -0.28 |
| fo-0356 "Forget the rules" (forget, history) | 0.873 | cut end -0.43, words not understood -0.41 |
| fo-0447 "Is Persona connected to anything" (degree, questions; cutter ranked another world first) | 0.851 | world rank -1.10, world gap -0.24 |
| fo-0159 "line up Dev1, Dev2 and Dev3 horizontally" (align, position) | 0.824 | unplaced -0.47, residual -0.32 |
| fo-0486 "What's the bottommost booth" (extreme, questions) | 0.788 | unplaced -0.37, words not understood -0.33 |
| fo-0580 "connect Marinate to Grill" (connect, links) | 0.754 | world prior -1.14, residual -0.39 |
| fo-0178 "distribute Maths, Science and Art horizontally" (distribute, position) | 0.692 | unplaced -0.37, cut end -0.32 |
| fo-0582 "make it a rectangle again" (set shape, shapes; context filled a gap) | 0.628 | world prior -0.72, cut start -0.56 |
| fo-0469 "drop a gold star named Treasure in the top right corner" (create, shapes) | 0.488 | world prior -0.72, cut end -0.48 |
| fo-0231 "an arrow from Earth to Iss with the label "orbit"" (connect, links; abstained, context filled) | 0.051 | world prior -1.14, context margin -0.64 |

Reading the table: the first two are clean, simple requests that sit 0.003 and 0.02 below the line, so a hair of noise decides them. The links
and shapes requests are held back mainly by the world they are read in, whatever they say. The "unplaced"/"residual" ones are
requests with a word or two the reader could not place, yet the reading came out right.

## 3. Old held-out data vs fresh2 calibration: does a feature measure the writer instead of correctness?

Old held-out = the records of VSS_CONFIDENCE.md (585 messages, 1619 produced requests, shipped worlds, Sonnet and Haiku text); the fields match
the fresh2 records (same `f`). I ran the old model's own percentile tables on the right readings of each set, so a lower number means
"the old confidence would find this right reading less certain". Columns: mean percentile of a right reading, old held-out, then fresh2
calibration with VSS-G.

| Feature | Old held-out to fresh2 VSS-G (right readings) | Shift |
|---|---|---|
| cut start | 0.52 to 0.48 | -0.04 |
| cut end | 0.59 to 0.50 | -0.09 |
| world gap | 0.52 to 0.46 | -0.06 |
| world prior | 0.53 to 0.48 | -0.05 |
| words not understood | 0.53 to 0.60 | +0.06 |
| residual | 0.54 to 0.53 | -0.01 |
| unplaced words | 0.53 to 0.51 | -0.02 |
| world rank, abstain, role margin, others | within 0.03 | 0 |

- **Right readings barely shift.** Added up with the old weights, all shifts are -0.15 logit units (shipped worlds on fresh2: -0.25). The old
  confidence's median for a right reading is 0.893 on old data and 0.881 on fresh2 VSS-G, 0.870 for the shipped worlds. A right reading looks almost the
  same to the confidence whatever the writer. So no feature is measuring the writer's style; the cut end score shifts most (-0.09), which is the
  signature of longer, run-on messages, but it carries a small weight (0.18 in the old model, 0.72 in the new one).
- **What changed is the other side.** In the old data the median wrong reading scored 0.71 against 0.89 for right (AUROC 0.83). On fresh2 the
  wrong ones score 0.71 as well but the right share fell from 82% to 71%, and the old model's AUROC fell to 0.76 (shipped 0.74). Single-feature
  AUROCs of the parse-quality group fell: residual 0.73 to 0.65, unplaced 0.69 to 0.66, words not understood 0.69 to 0.64. Cut start rose
  (0.62 to 0.68) and role margin rose (0.52 to 0.60).
- **The world prior moved a lot, in the right direction.** Right share per world old to now: shapes 84% to 69%, links 59% to 52%,
  position 88% to 71%, manage 85% to 74%, questions 80% to 84%, graphq 91% to 87%. These are real accuracy drops of the reader on this
  writer, not style signals; the prior reports them faithfully (and it is the biggest cause of the false negatives).
- Same recipe on the two sets (fit_report.mjs, out-of-fold, cost 10):

| Data | Executed of produced / of right readings | Precision |
|---|---|---|
| Old held-out (82% right, AUROC 0.82) | 43% / 50% | 96% |
| Fresh2 calibration, VSS-G (72% right, AUROC 0.78) | 21% / 27% | 95% |

## 4. Bug checks

| Check | Result | Verdict |
|---|---|---|
| Recompute the 13 raw features of 31 requests (5 messages: fo-0007, fo-0231, fo-0405, fo-0014, fo-0016) by hand, from the composer's raw output (cutter scores per token, candidates, words tried, margins, context steps), with code written separately from the collector | 403 values, 0 mismatches (tolerance 1e-9) | Features are right |
| Re-run the collector of the repository (which holds the VSS-G worlds) on 6 calibration messages and compare with the records | 32 requests, 608 feature values, 0 differences; outcomes and worlds identical | Records are what the demo produces |
| Percentile tables: sorted, counts non-decreasing, percentile non-decreasing in the oriented value, 0 at the least confident end and 1 at the most confident end | All 14 pass. Features with a sign of -1 (residual, unplaced, abstain, words not understood, context fill) read 1 for the best value; highest reaches 0.56 to 0.85 only because tied values share a percentile | Oriented as intended (higher = more confident) |
| Missing value counts as "nothing to doubt" (percentile 1) | By design: cut end (ends the text, 13% of right readings), role margin (6%), context margin (91% have no fill) | Design choice, not a bug; see below |
| The demo's `docs/model/confidence/vss.json` against a refit of the calibration part | Weights, intercept and all tables identical; the JS port `vss-confidence.js` gives the same confidence as fit_report on every one of the 556 requests (max difference 0) | Deployed = fitted |
| AUROC in-fold vs out-of-fold (L2 grid) | In-fold 0.811 / 0.811 / 0.810 / 0.801 for L2 0.01 / 0.1 / 1 / 10; out-of-fold 0.776 at L2 = 1 (per fold 0.78, 0.82, 0.74, 0.77, 0.81) | 3.4 points of optimism; no leak, a small model on 556 rows |
| Calibration of the out-of-fold confidence | Rated 0.3 to 0.5: 41% right; 0.5 to 0.7: 55%; 0.7 to 0.8: 74%; 0.8 to 0.9: 87%; above 0.9: 95% | Calibrated, slightly over-confident below 0.7 |
| Precision by rank (out of fold) | Top 115: 95%; top 200: 92%; top 250: 90%; top 400: 82%; all 556: 72% | The cost line (91%) falls at about rank 200 to 250; the best score is at rank 115 |

Two small weaknesses found, neither the cause: (a) the world prior is computed from the same rows the model is then fitted on, so in-fold
the prior looks slightly more useful than it is (out-of-fold it is done per fold, so the threshold is not affected); (b) the weights of tie (-0.13),
role margin (0.07) and world-nu-gap (0.40 but AUROC 0.52) mean three features add noise and nothing else.

Per-feature AUROC (right vs not-right, with the confident end oriented high), fresh2 calibration: cut start 0.68, residual 0.65, unplaced 0.66,
words not understood 0.64, world prior 0.65, world gap 0.64, role margin 0.60, cut end 0.59, context 0.57, abstain 0.56, world rank 0.56,
words-not-understood gap 0.52, tie 0.50. No single feature passes 0.68, and the combined model reaches 0.78 out of fold. Within a world it ranks
right above not-right with AUROC 0.83 (position), 0.76 (shapes), 0.70 (graphq), 0.69 (questions), 0.65 (manage), 0.62 (links): links is
the weakest and also the least accurate world.

## What would fix it in the long term

The cost rule is fine; the ceiling is the information in the features. A calibrated confidence with AUROC 0.78 on a reader that is right 72% of the
time cannot execute more than about a quarter of the right readings at 10:1. The fixes, in order of how much each should help:

| Fix | What it addresses | Expected effect |
|---|---|---|
| A feature that checks the value, not the parse: agreement of VSS with an independent reader (SOP-BERT or a second VSS seed) on the same request; the model's own probability of each chosen role filler | Cause 3: 39% of wrong readings parse cleanly | Largest. The only signal that sees a clean-looking wrong reading |
| Make the weak worlds better (shapes, links, position) with varied writer data (the finding of FEEDBACK_RESULT.md) | Cause 2: the prior is low because the worlds are wrong 30 to 48% of the time | Raises the prior and the executed share together |
| More calibration data: pool the old held-out records (1619 requests) with fresh2 after the test part is scored, and refit with a per-world intercept | Cause 1 and the 3.4-point optimism | Small but sure (AUROC about +0.01 to 0.02); stabilises the threshold |
| Smoother normalisation: stop giving "missing" a percentile of 1 for cut end and role margin; use a separate "missing" flag, drop tie, role margin and word-nu-gap | Noise from three useless features | Tiny |

A different decision rule would not help: break-even precision is cost / (cost + 1) (91% at 10:1, 83% at 5:1). Changing the cost is the owner's
policy choice, not a repair of the confidence.

Caveats: the pulls use the final model's tables on the calibration rows (in-sample) for the percentile of each feature, while the confidence
used to say who is executed is out of fold; the what-if test adds the change to the out-of-fold logit, so it is approximate. The old-vs-new
comparison mixes a writer change and a model change (shipped worlds vs VSS-G); the shipped worlds on fresh2 give nearly the same numbers as VSS-G
(right share 71%, old-confidence AUROC 0.74), so the drop comes with the new writer, not with the retraining.
