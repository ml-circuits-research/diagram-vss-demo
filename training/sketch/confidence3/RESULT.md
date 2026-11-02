# confidence3 RESULT: what holds the simple commands, three readers voting, and what to use tomorrow (2026-11-02, night)

Protocol: `PLAN.md` (written before any number of a new method). Full generated report with every table: `REPORT_fit3.md` (written by
`fit3.mjs`). Models: VSS-G (`docs/model/micro/registry.json`), SOP-BERT G (`docs/model/neural/sop-bert`), Rules `docs/js/logic.js`
(sha e4e0707194be for fresh2; logic.js was being edited by another agent during the night: the short sets were read with later versions,
051fac047039 and beec2826076c). The SOP-BERT and VSS records are byte-identical to COMBINED_READER.md's.

Data: fresh2 calibration part (195 messages, 596 requested actions; fitted and chosen there, out of fold), fresh2 test part (405 / 1313;
scored once for the new methods), and two short-command sets used **only to evaluate**:
- **synth**: 357 messages (490 requests) of `llm_train/synth_rules` (every id with sha256 % 20 == 0) + the 3 symptom commands. The generator
  keeps only messages the Rules read exactly as the gold (`synth/gen_rules_cover.py`), so the Rules are 100% right there by construction.
  Unseen by today's VSS and SOP-BERT (written after they were trained).
- **short3** (added after PLAN.md, evaluation only): the 389 messages (499 requests) of `llm_bench/short3` without a "pending" wire (141
  messages hold one: an op with no SOP Lang form yet). Blind Opus-written short commands. Its gold has conventions not yet normalised (below),
  so its numbers are lower bounds for every reader.

## 1. Diagnosis: why the simple commands are held

**a. The symptom is reproduced.** On the canvas Start, Check, Done, Retry, with the current confidences (a), every reader holds the three
commands (`REPORT_fit3.md` section 6): VSS 0.42 / 0.71 / 0.43 (threshold 0.896), SOP-BERT 0.34 / 0.57 / 0.64 (0.823), VSS-BERT 0.31 /
0.46 / 0.41 (0.870). One of them is held rightly: SOP-BERT reads "arrange all" as `layout=circle` (a value nobody said).

**b. Reliability (calibration, out of fold).** The numbers are honest on average: in each bin the observed share right is close to the mean
confidence (e.g. SOP-BERT 0.80-0.90: predicted 86.2%, observed 90.7%; VSS-BERT 0.90-0.95: 92.9% vs 97.9%). The confidences are not
mis-scaled; recalibration (Platt / isotonic, d4) is monotone and would execute the same requests at the cost-score threshold, so it would
only change the number shown, not what is done.

**c. What holds right requests** (cost-10 threshold, calibration, out of fold):

| reader | right requests produced | right but held | what pulls them down (final model, mean pull over the held right ones) |
|---|---|---|---|
| VSS | 398 | **289 (72.6%)** | nothing in particular: the typical VSS request is below the threshold (AUROC 0.776). Largest pull: the world prior 0.06; a typical prior would free 11 of 289 |
| SOP-BERT | 492 | 114 (23.2%) | the fill heads (fill_p_min 0.20, fill_margin_min 0.20), the act prior 0.14, the cut edges (0.14, 0.14); a typical act prior would free 12 of 114 |
| VSS-BERT | 493 | 157 (31.8%) | 42 of them are requests all three readers read the same (that group is 98.4% right); 44 are SOP-BERT + Rules agreeing (66.7% right) |

The act prior "arrange: right about 56%" comes from 18 calibration requests (9 right), all inside long messages ("arrange them in a grid",
"Arrange P1 thru P6 in a grid", "put Pot1 to Pot5 in a row"), which are genuinely hard; the prior applies that to every arrange, including
"arrange all in a circle". It is a real but small part of the hold (12 of 114 for SOP-BERT). The larger cause: **the confidences were
calibrated on long messages only**; a short command has nothing that tells the logistic it is easy.

**d. The threshold is unstable for the readers alone** (1000 bootstrap resamples of the 195 calibration messages, confidences fixed):

| reader | threshold | 2.5% / 50% / 97.5% of the re-chosen threshold | requests executed on cal at those three |
|---|---|---|---|
| VSS | 0.8964 | 0.824 / 0.894 / 0.947 | 226 / 118 / 14 of 556 |
| SOP-BERT | 0.8233 | 0.787 / 0.845 / 0.978 | 426 / 385 / 80 of 651 |
| VSS-BERT | 0.8701 | 0.842 / 0.870 / 0.882 | 373 / 342 / 325 of 706 |

VSS's and SOP-BERT's thresholds sit on a flat, noisy part of the curve: another 195 messages could have given SOP-BERT 0.98 (80 executed)
or VSS 0.95 (14 executed). VSS-BERT's is stable.

**e. False disagreements.** What is truly equivalent for the engine (`logic.js`): **arrange** sorts its shapes by creation order before
placing them (`.sort((p, q) => p.order - q.order)`), so the order of an arrange target list does NOT matter (the brief assumed it did);
**distribute** sorts by coordinate, so its order does not matter either; for both, **no target = every shape** on the canvas, so "no
target", the unfiltered `mention(quantifier=all)` and the list of every canvas name are the same request. **align** uses its first target as
the base: order matters; not made equivalent. A filtered mention ("all the stars") cannot be compared with a list without the shapes.
With that equivalence (d1), disagreeing SOP-BERT–VSS pairs that become agreements: calibration 0 of 115, test 5 of 310, synth 3 of 143
(including "arrange all in a circle" and "distribute all vertically"), short3 7 of 92 ("distribute horizontally", "stack everything in a
column"). Real, exactly the symptom, but rare in the calibration data, so it moves no calibration number.

## 2. Three readers voting: what each agreement is worth (BERT cut; d1 agreement)

| who agrees | cal: produced · right | test | synth | short3 |
|---|---|---|---|---|
| Rules + VSS + SOP-BERT | 316 · 98.4% | 654 · 97.2% | 128 · 100.0% | 150 · 88.7% |
| VSS + SOP-BERT (Rules differ) | 92 · 83.7% | 167 · 89.8% | 23 · 0.0% | 74 · 64.9% |
| Rules + SOP-BERT (VSS differs) | 69 · 66.7% | 133 · 69.9% | 84 · 98.8% | 52 · 82.7% |
| Rules + VSS (SOP-BERT differs; VSS's reading) | 19 · 52.6% | 49 · 51.0% | 31 · 100.0% | 20 · 45.0% |
| none agree | 94 · 42.6% | 247 · 39.7% | 188 · 1.6% | 72 · 16.7% |
| SOP-BERT only / VSS only | 65 · 23.1% / 51 · 2.0% | 139 · 33.8% / 94 · 1.1% | 28 · 7.1% / 66 · 0.0% | 106 · 18.9% / 76 · 7.9% |

**"If 2 of 3 agree it is safe" is not supported**: a 2/3 agreement is right 53-90% of the time depending on which two, far below the 91%
a cost of 10 needs; executing ≥ 2/3 scores −11.1 (cal) / −5.9 (test). **3 of 3 is safe on long messages** (98.4% / 97.2%) and on the
Rules' own commands (100%), but not on short3 (88.7%; partly gold conventions, below).

## 3. The methods (each column at its own cost-10 threshold chosen on calibration, out of fold)

Cells: cost score [95% CI] · done right % of requested · confidently wrong % of executed. Asked % and precision per cell are in `REPORT_fit3.md`.

**(a) the current confidences**

| situation | Rules (no gate) | VSS | SOP-BERT | VSS-BERT | 3-vote |
|---|---|---|---|---|---|
| calibration (oof) | −347.8 · 59.9% · 40.5% | 8.2 [−3.1, 17.6] · 18.3% · 5.2% | 24.8 [2.1, 43.2] · 63.4% · 5.7% | 46.3 [34.5, 55.3] · 56.4% · 1.8% | - |
| test part | −354.9 · 55.6% · 42.5% | 12.9 [9.2, 16.5] · 15.9% · 1.9% | 14.4 [2.0, 26.7] · 60.1% · 7.1% | 40.6 [34.0, 47.0] · 52.8% · 2.3% | - |
| short: synth | 99.8 · 99.8% · 0.0% | −8.4 · 5.9% · 19.4% | −94.9 · 31.6% · 28.6% | −4.5 · 22.0% · 10.7% | - |
| short: short3 | −206.6 · 49.9% · 34.0% | −4.0 · 10.0% · 12.3% | −121.2 · 35.1% · 30.8% | −33.7 · 28.5% · 17.9% | - |

**(b) the vote, no fitted weights** (VSS / SOP-BERT: its own reading, executed when the cost-optimal vote count agrees, which came out as
3/3 for both; 3-vote: 3/3 and ≥ 2/3; d1 agreement changes the 3/3 cells by < 1.5 points, see the report)

| situation | VSS | SOP-BERT | 3-vote 3/3 | 3-vote ≥ 2/3 |
|---|---|---|---|---|
| calibration (oof) | 23.0 [4.6, 38.5] · 49.8% · 5.1% | 43.8 [34.9, 52.4] · 52.2% · 1.6% | 43.8 [34.9, 52.4] · 52.2% · 1.6% | −11.1 · 74.5% · 10.3% |
| test part | 29.6 [21.8, 36.7] · 47.1% · 3.6% | 36.1 [29.3, 42.2] · 48.3% · 2.5% | 36.1 [29.3, 42.2] · 48.3% · 2.5% | −5.9 · 68.7% · 9.8% |
| short: synth | 24.9 · 24.9% · 0.0% | 25.7 · 25.7% · 0.0% | 25.7 · 25.7% · 0.0% | 2.0 · 49.0% · 8.7% |
| short: short3 | −7.8 · 26.3% · 11.5% | −7.8 · 26.3% · 11.5% | −7.8 · 26.3% · 11.5% | −65.5 · 46.7% · 19.4% |

**(c) the vote as inputs of the fitted logistics** (agree_rules, agree with the other learned reader, n_agree, rules_clean, rules_notes)

| situation | VSS | SOP-BERT | VSS-BERT | 3-vote |
|---|---|---|---|---|
| calibration (oof) | 26.2 [7.7, 40.3] · 49.7% · 4.5% | 49.8 [40.4, 58.4] · 58.2% · 1.4% | 48.3 [31.6, 61.3] · 66.8% · 2.7% | 50.3 [35.0, 62.1] · 63.8% · 2.1% |
| test part | 29.6 [21.9, 36.7] · 47.1% · 3.6% | 40.9 [33.5, 48.2] · 55.4% · 2.5% | 40.0 [31.1, 48.0] · 60.5% · 3.3% | 45.6 [38.3, 52.8] · 58.6% · 2.2% |
| short: synth | 24.9 · 24.9% · 0.0% | 12.4 · 32.9% · 5.8% | −15.7 · 37.3% · 12.4% | −10.0 · 36.9% · 11.3% |
| short: short3 | −9.2 · 26.9% · 11.8% | −30.3 · 31.9% · 16.3% | −42.5 · 35.7% · 18.0% | −37.9 · 34.3% · 17.4% |

**(d) the chosen variant per column** (the selection rule: the best calibration out-of-fold score of 16-22 variants per column; every
variant in `REPORT_fit3.md` section 4)

| situation | VSS: (c) + d2 no prior + d5 per-type thr. | SOP-BERT: (c) + d5 per-type thr. | VSS-BERT: (c) + d5 per-type thr. | 3-vote: (c) + d1 + d2 + d5 |
|---|---|---|---|---|
| threshold (command / question) | 0.9108 / 0.5074 | 0.8557 / 0.9041 | 0.8547 / 0.9217 | 0.8838 / 0.6538 |
| calibration (oof) | 30.5 [19.8, 39.9] · 42.3% · 2.7% | 51.2 [43.9, 58.5] · 56.2% · 0.9% | 49.2 [35.7, 59.8] · 64.3% · 2.3% | 51.3 [35.9, 63.6] · 66.4% · 2.2% |
| test part | 25.1 [17.7, 32.3] · 41.1% · 3.7% | 41.1 [34.1, 47.6] · 54.1% · 2.3% | 40.0 [31.5, 48.0] · 59.0% · 3.1% | 46.0 [38.2, 53.5] · 61.2% · 2.4% |
| short: synth | 16.7 · 22.9% · 2.6% | 10.4 · 30.8% · 6.2% | −10.4 · 36.5% · 11.4% | −46.9 · 36.7% · 18.6% |
| short: short3 | −4.4 · 25.7% · 10.5% | −29.5 · 30.7% · 16.4% | −41.1 · 35.1% · 17.8% | −46.9 · 35.3% · 18.9% |

(d1 ties d0 on calibration for SOP-BERT and VSS-BERT, since it changes no calibration pair; the rule kept the simpler one. d3 (prior
shrinkage k = 50) never won. d2 (no prior) won only inside (c) for VSS and the 3-vote, by < 1 point.)

## 4. Verdicts (pre-registered rule: the chosen variant against (a) on the test part, paired bootstrap over the 405 test messages, 1000 resamples, seed 1)

| column | chosen | test: chosen vs current | difference [95% CI] | verdict |
|---|---|---|---|---|
| VSS | (c) + d2 + d5 | 25.1 vs 12.9 | +12.3 [4.0, 19.8] | **better** |
| SOP-BERT | (c) + d5 | 41.1 vs 14.4 | +26.7 [15.9, 38.2] | **better** |
| VSS-BERT | (c) + d5 | 40.0 vs 40.6 | −0.6 [−7.1, 4.8] | not shown |
| 3-vote (chosen) vs VSS-BERT (a) | (c) + d1 + d2 + d5 | 46.0 vs 40.6 | +5.4 [−1.0, 11.0] | not shown |

In plain words: **telling each reader whether the other two read the request the same way is what fixes VSS alone and SOP-BERT alone** (VSS
does 41.1% of the requests right instead of 15.9%, confidently wrong 3.7% of what it executes instead of 1.9%; SOP-BERT's
confidently-wrong rate drops from 7.1% to 2.3%, done right from 60.1% to 54.1%). For
the pair VSS-BERT, adding the Rules' vote does not add anything measurable on fresh2. The 3-vote is better on calibration and test by 5
points, but the interval includes 0: not shown.

**On short commands nothing is good yet**, and this is the main finding of the night: every learned reader, with any confidence, is
confidently wrong 10-30% of the time on short3, and the fitted vote models (c, d), calibrated on long messages only, extrapolate badly:
on the synth set VSS and SOP-BERT agree with each other and against the Rules 23 times and are wrong every time (on fresh2 the same
agreement is 84-90% right), and the fitted weights trust it. The weight-free 3/3 vote is the most robust (0% wrong on synth, the
fewest wrong on short3 among the voting methods), but on short3 even 3/3 is right only 88.7%.

**What part of the short3 numbers is the gold, not the readers.** Of the short3 requests all three readers read the same and are scored
wrong, many are gold conventions the README itself leaves to the coordinator: `scale` in 21 short3 wires ("bigger" → scale 1.5), which
can never be matched because **`bench-canon.js` drops `scale` from a reading (`canon`) but not from the gold (`canonWant`)** (a scoring bug:
any gold with `scale` is unreachable; fresh2 has none, so no fresh2 number changes); `$new` vs the new shape's name ("put a star named Hot ...
and send it to the back"); `undo count=2`; `kind=shape` in "how many shapes". These must be normalised before short3 is used to calibrate.

## 5. Recommendation for tomorrow

1. **Before the refit**: fix `canonWant` to skip `scale` like `canon` (one line in `docs/js/bench-canon.js`, then `regress.sh`), and
   normalise short3's conventions (`$new` vs name, `undo` count, `kind=shape`, pending wires). Without that the confidences learn the
   convention noise.
2. **Refit after retraining, on blind text only**: `bash training/sketch/confidence3/refit.sh` (fresh2 calibration part + short3
   calibration part, same hash split; never synth_rules / synth_combo, which are the learned readers' training data tomorrow). It rewrites
   `docs/model/confidence/{vss,sop-bert,combined,vote3}.json`, runs the four parity tests and stamps the versions. With short3 in the
   calibration the fitted weights see short commands; re-run the selection of `fit3.mjs` there (the variants are fixed) and read the
   short3 test part, not the synth set, as the short-command check.
3. **Demo, tonight's models**: wire the (c) confidences for the **VSS** and **SOP-BERT** tabs (`columnVss`, `columnSop`: verdict
   "better"). Add a **"3 readers"** tab with the weight-free rule **"all three agree"** as the default (it executes "arrange all in a
   circle" and "distribute all vertically": n_agree 3 under d1) and the fitted 3-vote as the "bolder" setting. Keep VSS-BERT as it is.
   Use the d1 agreement everywhere (it is what the engine does; on calibration it changes nothing).
4. Do not adopt "2 of 3 agree = safe": measured, it is not.

## 6. Demo code (prepared, not wired)

- `docs/js/vote-confidence.js` (imports `pairValue`, `percentile`, `bertEdges` from `combined-confidence.js`): `engineNorm` (d1),
  `agreementOf`, `columnVss(model, msg, level)`, `columnSop(model, msg, level)`, `vote3(model, msg, level, rule)` (rule = true: the
  weight-free 3/3), `thresholdOf` (per-type thresholds), `reason(item)`.
- `docs/model/confidence/vote3.json` (new; run `training/sketch/stamp_models.py` before committing so it gets a version). vss.json,
  sop-bert.json and combined.json are unchanged.
- `training/sketch/test_vote_confidence.mjs`: parity with the script on 60 test-part messages (all three columns and the rule: the same
  requests, vote counts, max |confidence difference| 0) and engineNorm examples. Passes.

**The ui.js change** (for the agent that owns ui.js):
- Settings: a reader tab **"3 readers"** (id `vote3`), built like the VSS-BERT tab: its own drawing, undo / redo, subtabs Drawing / SOP Lang
  / Settings; levels "all three agree" (default: `vote3(model, msg, "cost", true)`), "bolder" (the fitted vote: `vote3(model, msg, "cost")`),
  "execute all".
- Inputs per message, all on the BERT cut (the VSS-BERT tab already has SOP-BERT and VSS on it): the Rules on the same units
  (`sys.formalize(text, ctx, { units })`), and for every reader's non-mention node `{pa: type + ":" + (action || ask), got: canon(node,
  nodes) (bench-canon.js), span: node.span, args0: {action, name, count}}`; SOP-BERT `f` = `neural-confidence.js signals(result, i).f`
  and `act`; VSS `f` = `unit.signals`, `world`, `conf` = `vss-confidence.js confidence(vss.json, unit.signals, unit.world)`, `bert_edges`
  (or `cutWords` = the neural result's `joint.cut`); Rules `notes` = the count of the Rules result's notes starting with `@<node id>:`,
  `rulesMsg = {msgNotes: notes not starting with "@", unread: segments with id null}`; `names` = the canvas names.
- Execute the items with `execute`; an item with `from: "vss"` executes VSS's nodes of that request (with the mentions they refer to),
  otherwise SOP-BERT's. Held items: `reason(item)` + "Do it anyway", as the VSS-BERT tab.
- VSS and SOP-BERT tabs: replace their gate's confidence by `columnVss` / `columnSop` (inputs: the other two readers' readings of the same
  units; `columnSop` was fitted on the BERT cut), thresholds from vote3.json.

## Files

- `training/sketch/confidence3/PLAN.md` (pre-registration), `RESULT.md` (this), `REPORT_fit3.md` (generated, every table)
- `training/sketch/confidence3/collect_rules3.mjs` (Rules records on three cuts), `fit3.mjs` (fits, diagnosis, report, selection,
  verdicts), `export3.mjs` (vote3.json + fixture), `refit.sh` (the one command for tomorrow), `vote3_parity.json` (fixture)
- `training/sketch/combine/collect_pair.mjs`: a 5th output `units.jsonl` (the units of both cuts; passes 1-4 unchanged, records byte-identical)
- `docs/js/vote-confidence.js`, `docs/model/confidence/vote3.json`, `training/sketch/test_vote_confidence.mjs`
- Records (not in the repository): scratchpad `conf3/rec_fresh2`, `rec_short`, `rec_short3`; `refit.sh` was run once tonight on them
  (SKIP_COLLECT=1, STAMP=0): it reproduced vss.json, sop-bert.json and combined.json (same weights and thresholds; only the "about" text
  and two test-part bootstrap bounds differed), and the shipped files were then restored unchanged.
