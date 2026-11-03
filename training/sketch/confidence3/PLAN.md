# confidence3 PLAN: three readers voting, and fixes to the confidences (pre-registered 2026-11-02, ~22:10, before any test-part number of a new method)

Owner's request (2026-11-02 evening): "We must do something about the confidence, it is sabotaging us. Maybe Rules can also give a vote of
confidence, so we have 3 readers, and if 2 or 3 agree it is safe? Something must be done so the confidence is computed correctly for
SOP-BERT, for VSS-BERT and for VSS alone." Owner's decision relayed by the coordinator (2026-11-02 ~22:05): no human-written data will come;
calibrate on the Opus-written blind sets we have (fresh2 calibration part now; tomorrow also the calibration part of llm_bench/short3, same
hash split); agreement with the Rules after training on Rules-generated data is acceptable ("on simple things the Rules win").

Symptom (demo, tonight): "arrange all", "arrange all in a circle", "distribute all vertically" are read right by VSS and SOP-BERT and all
are held (VSS 0.42-0.89 vs 0.90; SOP-BERT 0.37-0.76 vs 0.82 with "requests read as 'arrange' are often read wrong (right about 56%)";
VSS-BERT "disagree": a different order of the shapes, or a list against nothing).

## Data, split, records
- fresh2 (600 Opus-written messages, `training/sketch/llm_bench/fresh2/opus_{a,b,c,d}`). **Calibration part**: `int(sha256(id),16) % 3 == 0`
  (195 messages, 596 requested actions). Everything is fitted and chosen there, out of fold (5 folds by message, as `fit_report.mjs`).
  **Test part** (405 messages, 1313 requested actions): read before for FEEDBACK_PLAN.md and COMBINED_READER.md with the current
  confidences; for the NEW methods below it is scored once, by the rule below, after every choice is fixed.
- The readers' training data (incl. the old held-out split) is in-sample for the readers: not used for calibration.
- **Short commands** (a third situation, reported, not used to choose): a fixed sample of `llm_train/synth_rules` (short commands generated
  from the Rules' grammar, written 21:47 tonight, after today's VSS and SOP-BERT models were trained: unseen by both): every message with
  `int(sha256(id),16) % 20 == 0`, plus the three symptom commands. Generated from the Rules, so it favours the Rules; labelled as such.
- Records: `combine/collect_pair.mjs` (SOP-BERT own cut = the BERT cut; VSS own cut; VSS on the BERT units; SOP-BERT on the VSS units),
  plus a new Rules collector (`confidence3/collect_rules3.mjs`): the Rules on their own cut and on the BERT units, every request with its
  canonical reading (`got`), span and outcome, and Rules signals.
- Outcome of a request: unchanged (`PAIR=value`, `bench-canon.js` canon against the gold). Cost score = (right − 10 × (executed wrong +
  extras executed)) per 100 requested actions; asked / not done = 0.

## Readers (columns)
Rules (own cut, executes everything: no confidence), VSS (own cut), SOP-BERT (own cut = BERT cut), VSS-BERT (BERT cut, COMBINED_READER.md),
3-vote (Rules + VSS + SOP-BERT on the BERT cut).

## Methods
- **(a) current**: vss.json recipe (14 signals + world prior), sop-bert.json recipe (24 signals + act prior), combined.json recipe
  (COMBINED_READER.md), refitted by the same code on the same records (checked against the shipped files).
- **(b) 3-reader vote, no fitted weights.** On the BERT cut, SOP-BERT's requests are paired with VSS's and with the Rules' (`pairValue`,
  as `combined_report.mjs agreement()`), and VSS's still-unpaired requests with the Rules' still-unpaired ones. Two readings agree when
  every key's canonical value is equal (agree = 1 of COMBINED_READER.md). A request's vote n_agree = the number of readers holding the
  same reading (1, 2 or 3). **b3**: execute when 3/3 agree; **b2**: execute when ≥ 2/3 agree. The executed reading is the agreeing one
  (SOP-BERT's when SOP-BERT is in the agreement, else VSS's). Per agreement pattern (R+V+S, R+S, V+S, R+V) the calibration precision is
  reported. Choice between b2 and b3 for the 3-vote column: the higher calibration cost score (no fold needed: nothing is fitted).
- **(c) the vote as features of the fitted logistics.** Each reader's own logistic (its signals and prior, recipe (a)) plus
  `agree_rules`, `agree_vss` / `agree_sop` (the other learned reader), `n_agree`, and Rules signals of the paired Rules request:
  `rules_clean` (the Rules produced this request with no note about it and no not-understood piece in the message), `rules_notes` (the
  number of the Rules' notes in the message). For VSS-BERT and the 3-vote column: the combined reader of COMBINED_READER.md with these inputs
  added to both of its parts (its VSS-only part can then execute a VSS request the Rules agree with). Clarify (an ambiguous reference found
  when the Rules EXECUTE) is not in the records: the records hold only the canvas names, not the shapes, so it cannot be computed; it is not used.
- **(d) fixes the diagnosis may point at; a closed menu, fixed now:**
  - d1 *engine-true agreement*: in agreement only (not in scoring), `arrange` and `distribute` targets are compared as SETS (logic.js
    sorts an arrange list by creation order and a distribute list by coordinate before using it), and for these two actions "no target",
    the unfiltered `mention(quantifier=all)` and the list of every canvas name are the same reading (logic.js: no target = every shape).
    Nothing else is made equivalent (align uses its first target as the base: order kept).
  - d2 *no prior*: the act prior (SOP-BERT) / the world prior (VSS) removed from the logistic.
  - d3 *stronger shrinkage of the prior*: prior = (right + overall × k) / (n + k) with k = 50 instead of 5.
  - d4 *recalibration* (Platt on the out-of-fold confidences; isotonic): monotone, so the cost-score threshold executes the same requests;
    reported for the reliability curves (what number the person is shown), not as a score change.
  - d5 *per-type threshold*: separate cost-score thresholds for commands and questions (out of fold confidences, calibration).
  - d6 *larger calibration set from the readers' training data*: NOT done: those messages are in-sample for the readers.
  d1-d3 and d5 may be combined with (a) or (c); every combination tried is listed in RESULT.md with its calibration out-of-fold score.

## Selection rule (calibration only)
For each column (VSS, SOP-BERT, VSS-BERT, 3-vote), the method chosen is the one with the highest calibration out-of-fold cost score at
cost 10 (threshold at the cost-score optimum of its own out-of-fold confidences; a tie keeps the simpler method: (a) < (b) < (c) < (d)).
Thresholds at cost 5 and cost 20 are chosen the same way and stored. Selection among many variants on 195 messages carries optimism: the
selected method's calibration score is reported with that warning; the test part is the check.

## Verdict rule (test part, once)
For each column, the chosen method against (a) current: the difference of the cost score on the fresh2 test part, paired bootstrap over the
405 test messages, 1000 resamples, seed 1, 95% interval (2.5% / 97.5% quantiles). **Better**: the interval lies above 0. **Worse**: below 0.
Otherwise **not shown**. Also: the 3-vote column (chosen method) against VSS-BERT (a), the same test. Beside each: done right %,
confidently wrong % of executed, asked %. A miss is reported as a miss; no second try on the test part.

## Diagnosis (calibration only, before the methods)
- reliability curves per reader (out-of-fold predicted confidence in bins vs observed precision);
- per gate: how many requests that are RIGHT are held, and which feature groups pull them below the threshold (the logistic's pulls, as
  the demo's reasons), with the share due to the prior;
- threshold instability: the cost-score threshold re-chosen on 1000 bootstrap resamples of the 195 calibration messages (fixed
  out-of-fold confidences): its 2.5 / 50 / 97.5% quantiles and the executed count;
- false disagreements of VSS-BERT: how many paired requests disagree only by the order of a target list or by list vs no-target vs
  mention(quantifier=all) for arrange / distribute (d1), and how often such a pair is right.

## Re-fit tomorrow
`training/sketch/confidence3/refit.sh` re-runs the collectors on the new models and refits, writing `docs/model/confidence/*.json`
(and the vote file if a vote method wins). Inputs: fresh2 calibration part, and `llm_bench/short3`'s calibration part when present (same
hash split). Never synthetic text (synth_rules / synth_combo are the learned readers' training data tomorrow).

## Changes after the protocol was written (none changes a fit, a variant, the selection or the verdict rule)
- The file was written at 21:54 CET (file time), not "~22:10" as the title says; the first fit ran at ~22:00.
- Owner's decision relayed by the coordinator (~22:05), received while the records were being collected: no independence caveat; refit.sh
  also takes the calibration part of `llm_bench/short3`.
- `llm_bench/short3` appeared during the night (530 messages): its 389 messages without a "pending" wire were added as a second
  short-command EVALUATION set (all of it, nothing fitted or chosen on it). Its gold conventions are not yet normalised (RESULT.md).
- The synth sample is filtered by its generator to messages the Rules read exactly as the gold: the Rules are 100% there by construction.
- fit3.mjs got a table of the chosen variants (the same numbers, printed together) after the verdicts were read.
