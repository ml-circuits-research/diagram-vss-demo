# VSS_BERT_FAILURES: where VSS-BERT fails on the test parts of fresh2 and short3, and why (2026-11-03)

Question (owner): list VSS-BERT's failures by kind (confidently wrong, held but right, missed), with counts and examples, trace each to its
cause and stage, and say which causes are fixable by data, by code or by calibration, with an estimated gain.

## What was measured

- **Reader**: VSS-BERT as shipped: the BERT cutter, SOP-BERT and VSS reading its units, `docs/js/combined-confidence.js` with
  `docs/model/confidence/combined.json` (variant d2, threshold 0.9488), VSS's own confidence `docs/model/confidence/vss.json`. Models: the
  readers retrained on all data (arm ALL, 2026-11-03); checked: the files under `docs/model/micro`, `docs/model/neural/sop-bert` and
  `docs/model/context` are byte-identical to the ones the records were made with.
- **Records**: the refit of 2026-11-03 (`scratchpad/refit2/records`, `combine/collect_pair.mjs`: SOP-BERT on its own cut, VSS on the BERT
  cut). The records pass no spelling check (the demo runs one before every reader) and no drawing (`last` is empty).
- **Data**: the test parts (messages with `sha256(id) % 3 != 0`): fresh2 405 messages, 1313 requested actions; short3 340 messages, 432
  requested actions (the 513 short3 messages without a pending wire; the 17 with one are out).
- **Check**: `combine/failures_vss_bert.mjs` applies the shipped combined reader to the records exactly as the demo does and reproduces
  combined.json's test numbers: 761 executed, 747 right, 14 wrong or extra, 42.8% of the requested actions done right.
- **Causes**: the 14 confidently wrong and the 67 missed were read one by one; the 622 held but right were classified by rules (pairing
  situation, the key VSS read differently, the largest pull of the confidence), and a sample of each class was read to check the rule.
  Script: `combine/failures_classify.py` (the labels and rules are in it).

## The headline

| situation (test part) | fresh2 | short3 | both |
|---|---|---|---|
| requested actions | 1313 | 432 | 1745 |
| done right | 618 (47.1%) | 129 (29.9%) | 747 (42.8%) |
| **confidently wrong** (executed wrong + extras executed), % of executed | **7 of 625 (1.1%)** | **7 of 136 (5.1%)** | 14 of 761 (1.8%) |
| held but right (asked although its reading was right) | 447 (34.0%) | 175 (40.5%) | 622 (35.6%) |
| held and wrong (asked; its reading was wrong: the gate did its job) | 205 (15.6%) | 91 (21.1%) | 296 (17.0%) |
| missed (no reading of the request at all) | 37 (2.8%) | 30 (6.9%) | 67 (3.8%) |

Two things stand out:
1. **All 14 confident mistakes are requests both readers read the same way** (agreement). Agreement cannot see an error both readers
   share, and on short commands they share more: short3's confidently-wrong rate is 5.1% against 1.1% on fresh2, at any threshold
   (at 0.96 short3 still has 7 wrong of 107 executed). No threshold fixes them; the readings have to.
2. **Of the 622 requests held although right, 340 (55%) are held because VSS read them wrong or not at all** while SOP-BERT read them
   right. The largest single lever is VSS's reading, not the confidence.

## 1. Confidently wrong: 14 (7 fresh2, 7 short3)

| cause | stage | fixable by | n | examples |
|---|---|---|---|---|
| a request runs although the request that makes its shape was held | pairing / gate | code | 3 | s3-0261 “add Fail below Check in red and **connect Check to Fail** with label "no"”: the create is held (VSS and SOP-BERT disagree), the connect runs: “There is no shape named Fail”. s3-0146 “create Api and Db squares, **connect Api to Db**”: same. fo-0435 “Add a red diamond named Error …. **Label the diamond** "invalid input"”: the create is held, the label runs on no diamond / another one. |
| a value both readers drop or misread (new forms of 2026-11-02) | value | data | 4 | s3-0062 “undo twice” and s3-0188 “undo the last 2 changes” → undo without the count. s3-0354 “make the outline of check orange” → the fill colour. s3-0358 “what is the outline color of process” → property colour. |
| the cut splits one request; the first half runs | cut | data | 3 | fo-0534 self-correction “Ivy can be a dark navy …, **but no, teal** reads better”: the unit stops before “but no”; navy is executed. fo-0453 “Draw an arrow from Guests to Budget either way **and label it "headcount"**”: the arrow is drawn, the label part is held (a correct part, counted wrong). fo-0433 a chain “Retail to Returns …, and Returns to Factory” cut in two: the first link runs, the second is held. |
| a description loses a value | description | data | 1 | s3-0293 “trash the **small** squares” → every square is deleted. |
| a list loses a reference to new shapes | name tag | data | 1 | fo-0052 “Connect Scheduler to Worker **and the copies**” → only Worker (the copies were never made: “Make 3 copies” was missed). |
| the gold chose one of two questions that both answer | scoring artifact | gold | 1 | fo-0460 “Is Closing linked to anything yet”: neighbors (gold: degree). |
| a typo the demo would have corrected | scoring artifact | measurement | 1 | fo-0259 “add 8 tiny **whte** stars”: both readers drop the colour; the demo's spelling check turns “whte” into “white” before reading, the records skip that step. |

What the confidence could have used and does not: SOP-BERT's unknown-word signal `unk_share` is 0 on all 2636 recorded requests (the
tokenizer splits a typo into pieces, it never returns an unknown token), so its weight is 0. VSS's `unplaced` (words that fit no part of
the reading) is > 0 on 7 of the 13 executed-wrong requests of the test part, but also on 148 of 747 executed-right ones: holding them
would cost more than it saves (−78 cost points). The calibration part has only 2 executed-wrong requests at this threshold: too few to
learn what separates a shared error.

## 2. Held but right: 622 (447 fresh2, 175 short3)

| cause | stage | fixable by | fresh2 | short3 | examples (VSS-BERT's confidence in brackets) |
|---|---|---|---|---|---|
| VSS read no request, or another action, where SOP-BERT read it right | VSS act / world | data (VSS) | 89 | 66 | s3-0370 “change the name of Check to Review” (0.75); s3-0275 “write "ok?" inside Check” (0.75); s3-0510 “check is linked to what” (0.50); fo-0293 “Can you put Teacher1, Teacher2 and Teacher3 in a row” (0.35); s3-0286 “make it black instead” (0.32) |
| VSS tagged the names differently (52 of them in the test part: VSS puts the other end's name into the `from` list too: from “Store, App, Cart” to “Cart”) | VSS name tag | data or code (VSS; to check) | 110 | 13 | fo-0397 “Store and App both go to Cart” (0.83); fo-0286 “conect Pro and Con with a plain line” → from “Pro, Con” (0.85); fo-0076 “Alert gets a dotted arrow from Aggregator” → ends swapped (0.75); fo-0542 “add 3 small blue hexagons around Base” → anchor dropped (0.70) |
| the BERT cut head was unsure at the unit's edge (a request after “and”, “then”, “could you”, a comma) | confidence feature: cut | calibration | 103 | 15 | fo-0230 “Could you move Sun to the top right corner” (0.84); fo-0055 “Syslog should be at the bottom right” (0.81); s3-0005 “dotted line process to done” (0.92) |
| VSS read a value differently | VSS value | data (VSS) | 37 | 17 | fo-0034 “line Svc1 Svc2 and Svc3 up verticaly” → direction up (0.44); s3-0205 “number of arrows” → no kind (0.51); fo-0399 “put Dining right under Kitchen” → direction right (0.66) |
| a reference (“it”, “them”) was filled from context, right here | confidence feature: context filler | calibration | 42 | 6 | fo-0032 “make it pink” (0.81); fo-0143 “label it "Search here"” (0.76); s3-0500 “connect Process to it” (0.81) |
| few words or roles: short commands look unusual to the confidence | confidence feature: short request | calibration | 25 | 22 | fo-0096 “Is Cache teal” (0.93); fo-0066 “Nuke OldService” (0.89); s3-0319 “how many circles” (0.94); fo-0058 “Silver gray” (0.90) |
| the name tags were less sure than usual | confidence feature: name tags | calibration | 19 | 5 | fo-0408 “connect Home, Search and Item each to the next” (0.92); fo-0557 “RedBase goes top left” (0.92) |
| a new form with few calibration requests like it | calibration data (new forms) | calibration | 1 | 12 | s3-0152 “improve the layout” (0.89); s3-0467 “untangle the arrows” (0.89); s3-0021 “straighten the lines” (0.81); s3-0103 “group check and done” (0.90) |
| a request only VSS produced: that part of the model never executes (4.7% of these were right on the calibration part) | calibration data | calibration | 4 | 8 | s3-0063 “swot matrix”; s3-0388 “bundle all circles together as Dots” |
| a false disagreement: VSS's target (all shapes / none / every name) does the same in the engine | pairing / agreement | code | 6 | 4 | s3-0347 “spread them out” (VSS: Check, Done, Process, Start); fo-0172 “arrange everything in a circle” (VSS: target “all”) |
| other signals (values, action) | confidence feature | calibration | 6 | 4 | fo-0255 “Which shapes are below Cloud” (0.94) |
| VSS read the description differently | VSS description | data (VSS) | 5 | 3 | fo-0485 “put Shot5 in front of everything else” → target “everything” |

164 of the 622 are within 0.05 of the threshold (0.90 to 0.9488). Lowering the threshold does not free them for free: on the test part
(exploratory, read after the fact) the cost score is 34.8 at 0.9488, 37.7 at 0.92, 35.0 at 0.90, 29.2 at 0.85: a flat curve, the
threshold is a noisy choice made on 2 calibration mistakes.

## 3. Missed: 67 (37 fresh2, 30 short3)

| cause | stage | fixable by | fresh2 | short3 | examples |
|---|---|---|---|---|---|
| one unit holds two requests (or a request and narration); one of them is read | cut (merged) | data (cutter) | 9 | 13 | s3-0475 “start left, done right”; s3-0193 “check pink, also bigger”; s3-0265 “start → hexagon, process → diamond”; fo-0282 “add an indigo rectangle named Budget, copy it twice”; fo-0562 “Connect Hose to Bed1, Bed2 and Bed3, and Valve to Hose”; fo-0246 “deleted the arrow from Cow to Human, can you undo” → disconnect |
| no unit covers the request: the cutter left it outside every request | cut (dropped) | data (cutter) | 11 | 0 | fo-0277 “Wolf just turned into a star. **undo pls**”; fo-0375 “**List all the hexagons.** I think …”; fo-0055 “Put them in a column. Wait, not a column, a row”; fo-0184 “Plants belwo it” |
| the unit covers only part of the request | cut (fragment) | data (cutter) | 3 | 0 | fo-0052 “Make 3 copies of Worker” cut into “Make” and “Worker”; fo-0271 “can u make Fish a lil bigger” |
| a form added 2026-11-02: both readers read another action | act / world (new form) | data | 0 | 11 | s3-0181 “no border on start”, s3-0322 “take the border off process” (outline none); s3-0093 “make a timeline with Start Process Check Done” (template); s3-0109 “circle Y at 700,100”; s3-0529 “call the start to process link begin” (arrow label); s3-0471 “re-arrange so the arrows dont overlap” (untangle) |
| the unit is right, both readers read another action | act / world | data | 4 | 5 | fo-0210 gapping “rename Coach1 to Juniors and **Coach2 to Seniors**” → connect; s3-0073 “no wait, put it back like before” → redo; s3-0087 “Begin instead of Start” → move; fo-0107 “Thumbnail: 3 more just like it” |
| a question both forms answer; the gold chose the other | scoring artifact | gold | 6 | 0 | fo-0335 “How many shapes are connected to Score” (count vs degree); fo-0554 “Is Teardown the last one on the right” (check vs extreme) |
| a statement of the current state annotated as a fact | gold convention | gold | 4 | 1 | fo-0197 “Mars is already red, so leave it”; fo-0400 “Start is already a circle”; s3-0517 “check lives in the top right” |

## 4. Held and wrong: 296 (the gate did its job)

Not failures of the gate, but they say where the readings break. By the first key SOP-BERT's reading gets wrong: name tags 103 (fresh2 78,
short3 25), context filler 72 (64, 8), values 56 (18, 38), cut 33 (28, 5), descriptions 32 (17, 15).

## 5. The fix list, ranked by estimated gain

Gains are in cost-score points on the test parts (right − 10 × confidently wrong, per 100 requested actions; today 34.8). They are
estimates from the counts above, not measurements; each fix needs its own run.

| # | fix | where | what it removes | estimated gain |
|---|---|---|---|---|
| 1 | VSS reads what SOP-BERT reads: training data for the forms VSS misses (verbless and short commands, rename / label phrasings, lists with “both … go to”), and a check of the `from`-list pattern (52 cases: VSS adds the `to` name to `from`; if it is one pattern in the composer it is a code fix) | data (VSS), maybe code | 340 held-but-right that VSS misreads; agreeing pairs execute at about 71% | **+8 to +14** |
| 2 | short commands of the new forms in the training data: undo with a count, outline (set, none, question), size in descriptions, arrow labels, templates, at x,y, untangle / straighten | data (both readers) | 5 confidently wrong on short3 (short3 5.1% → about 1%), 11 missed, 13 held | **+3 to +5** (short3 alone: about +12) |
| 3 | the combined gate holds a request that names a shape a held request would have made (the VSS gate does this for references; the combined gate does not for names) | code (ui.js combinedRead / combined gate) | 3 confidently wrong | **+1.7** |
| 4 | the BERT cutter: chained short commands (“start left, done right”), gapping, self-corrections (“navy, but no, teal”), requests inside narration | data (cutter) | 36 missed, 3 confidently wrong | **+2 to +3** |
| 5 | new calibration data: a fresh set of messages and of short commands for the calibration part (the threshold rests on 2 mistakes; short commands are penalised by `n_roles` / `n_words`; new forms have almost no calibration requests) | calibration | part of the 260 agreeing-but-held (cut, short, context) | **0 to +3** (the test curve is flat: +2.9 at best, read after the fact) |
| 6 | agreement: engine-equal targets (every name = all shapes = no target) count as agreeing for arrange / distribute / align | code (combined-confidence.js agreement, as vote-confidence.js engine mode) | 10 held but right | +0.4 |
| 7 | measurement: run the spelling check in the collectors as the demo does; settle the gold conventions for questions both forms answer (degree / count / neighbors, extreme / check) and for “X is already red” | measurement, gold (owner) | 1 + 1 confidently wrong, 11 missed | +1.2 on paper, nothing in the demo |

Not worth it now: a confidence input for “a word nobody placed” (VSS `unplaced`): on these numbers it holds more right requests than
wrong ones; `unk_share` is dead (always 0) and can be dropped from the SOP-BERT features.

## Files

- `training/sketch/combine/failures_vss_bert.mjs` (new): the shipped combined reader on the records, one row per gold request and per extra.
  `node training/sketch/combine/failures_vss_bert.mjs <records> <rows.json> training/sketch/llm_bench/fresh2/opus_{a,b,c,d} training/sketch/llm_bench/short3`
  (1 s).
- `training/sketch/combine/failures_classify.py` (new): the causes (manual labels for the 14 + 67, rules for the rest) and the tables.
  `python3 training/sketch/combine/failures_classify.py <rows.json> [classes.json]`.
