# VSS_FROM_TO: why VSS puts the "to" name into the "from" list, the fix, and the other two VSS buckets (2026-11-03)

Question (coordinator, after `VSS_BERT_FAILURES.md`): of the 622 requests VSS-BERT holds although its reading is right, 340 are held because
VSS read them wrong or not at all. 123 of those are VSS name-tag errors, and in 44 of them (52 in the first count of
`VSS_BERT_FAILURES.md`) VSS puts the "to" name into the "from" list. Is that one bug? Fix it if it is code. Then give the top causes of the two
other big VSS buckets ("VSS read no request or another action" 155, "VSS value" 54).

What was measured, everywhere below:
- **Reader**: VSS-BERT as shipped (the BERT cutter, SOP-BERT, VSS reading the BERT units, `docs/js/combined-confidence.js` with
  `docs/model/confidence/combined.json`, variant d2, threshold 0.9488). Models: the shipped `docs/model/micro` (arm ALL), `neural/sop-bert`,
  `context`.
- **Records**: `combine/collect_pair.mjs` re-run for every code variant (the 1113 messages of the refit of 2026-11-03: fresh2 opus_a..d and the
  513 short3 messages without a pending wire), then `combine/failures_vss_bert.mjs` (the shipped combined reader applied as the demo does).
  The re-run with the shipped code reproduces the committed numbers exactly (test part: 761 executed, 747 right, cost score 34.8).
- **Data**: the test parts (`sha256(id) % 3 != 0`): fresh2 1313 requested actions, short3 432. Cost score = (done right − 10 × (executed wrong
  + extras executed)) per 100 requested actions.

## 1. The cause

**It is one pattern, and it sits in the world's reading, made visible by the adapter.** Every one of the 44 rows is a connect. The links
world (`docs/model/micro/links8`) reads the single roles right and, beside them, the set role `members` filled with every name of the unit:

| unit | world reading (links8) | adapter (`vss-adapter.js toNodes`) |
|---|---|---|
| “Modem goes to Router” | source = Modem, target = Router, **members = {Modem, Router}** | from = [Modem, Router], to = Router |
| “connect App1 and App2 to Redis” | target = Redis, **members = {App1, App2, Redis}** | from = [App1, App2, Redis], to = Redis |
| “Store and App both go to Cart” | source = Store, target = Cart, **members = {App, Cart, Store}** | from = [Store, App, Cart], to = Cart |

The adapter does what it is written to do: a set role replaces its own single role (`members` → `from`, `targets` → `to`), so the list wins
and carries the "to" name. In the engine (`logic.js` connect) `from = [Modem, Router], to = Router` draws Modem → Router and then stops with
“Router can't connect to itself”.

Why the world fills `members` with every name (three facts, all measured on the shipped links8):
1. **The member threshold is calibrated on the wrong population.** `training/vss/tool/sop/train.py calibrate_and_finish` reads the calibration
   rows with `rd.read(S, toks, ...)` without the sentence filter, so a set role's "absent" class is every entity word of the catalog
   (links8's report: present 607, absent 1,781,212; mean absent 0.001). The decoder reads only the sentence's words. The threshold that
   comes out, `set_member.members` = 0.118, sits far below the other names of the same sentence: on the 6681 training rows of links, read by
   the browser reader, the gold members have a mean ratio of 0.58 and the other names of a sentence that has members 0.24 (p90 0.51).
2. **The set role also passes its presence threshold where the gold has none.** `members` is read as present in 2867 of the 6681 links
   rows, the gold has it in 2253; the rows without it in the gold (“X goes to Y”: the single source and target are read too) give 1799
   member ratios with a mean of 0.62, above the true members' mean.
3. **The one-to-one rule skips set roles.** `Reader.oneToOne` (and `infer.py one_to_one`) count a role's head with `headOf`, which returns
   null for a `["set", ...]` filler, so a name may sit in `target` and in `members` at once.

**The training rows reproduce from / to** (task point 2, `convert_check.py --registry docs/model/micro/registry.json --tests`): of 6456 connect
requests, none has the "to" name in `from` after the round trip; the conversion (`llm_to_world.convert`) writes `members` only for a list
of sources and `target` for the end. A converter bug found on the way, not the cause: a gold `$new` (a shape made earlier in the message) is
converted to the name of the LAST shape made, so “Arrows from Dad and Mom to Me” becomes members = {Me, Me}, target = Me. It touches 11 of
the 51,584 training world rows (links 6, position 3, graphq 1, shapes 1); `convert_check` does not see it because the scorer writes every
reference as `$new`.

## 2. The fixes measured (one at a time)

Hypothesis written before each run: the change removes most of the from / to readings (the VSS readings on the BERT units of the test part
whose `from` holds a `to` name: 71), does not lower another world's right readings, and does not lower the cost score of VSS-BERT on either
test part (shipped confidence files).

| variant (code) | VSS readings, test part: right / wrong / extra | connect: right / wrong / from holds a to name | fresh2 cost · confidently wrong · done right | short3 cost · confidently wrong · done right | verdict |
|---|---|---|---|---|---|
| shipped | 1121 / 299 / 216 | 149 / 92 / 71 | 41.7 · 7 of 625 (1.12%) · 618 (47.1%) | 13.7 · 7 of 136 (5.15%) · 129 (29.9%) | before |
| A. reader: set roles in the one-to-one rule (`reader.js` + `infer.py`; Python/JS parity identical on 2576 spans × 5 worlds) | 1137 / 280 / 219 | 170 / 70 / 14 | 41.7 · 8 of 636 (1.26%) · 628 (47.8%) | 13.2 · 7 of 134 (5.22%) · 127 (29.4%) | **not kept**: short3 falls; 8 shapes readings right → wrong (both parts) |
| B. `set_member` recalibrated on the sentence's words (links8 members 0.118 → 0.366, targets 0.117 → 0.216; same rule `fit_threshold`, all 6681 training rows) | 1118 / 297 / 218 | 145 / 90 / 43 | 41.4 · 8 of 632 · 624 | 13.4 · 7 of 135 · 128 | **not kept**: the threshold drops 21% of true members (fact 2 dominates) |
| P. adapter: the role `shape`'s value through `SHAPES` (“make A and B squares” gave shape = squares) | 1126 / 294 / 216 | 149 / 92 / 71 | **42.0** · 7 of 628 (1.11%) · 621 (47.3%) | 13.7 · 7 of 136 (5.15%) · 129 (29.9%) | kept |
| P + C. adapter: the one-to-one rule on the request (below) | **1154 / 265 / 217** | **176 / 65 / 25** | **42.4 · 8 of 645 (1.24%) · 637 (48.5%)** | **13.9 · 7 of 137 (5.11%) · 130 (30.1%)** | **kept** |

Both test parts together: shipped 34.8 · 14 of 761 (1.84%) · 747 (42.8%); P + C **35.4 · 15 of 782 (1.92%) · 767 (44.0%)**.
Calibration part, same shipped confidence: shipped 40.3 (2 of 348 wrong, 346 right), P + C 40.3 (3 of 359, 356 right).

Why A was dropped: the shapes world reads `object` beside `members` for “Make Milk and Foam white” (object = Milk, members = {Foam, Milk});
the adapter lets `members` replace `object`, so the list was right. With A, Milk collides between `object` and `members`, the larger margin
keeps it (`object`), and the list loses Milk. The rule has to run after the adapter has let each set replace its own single role. Variant A's
patch is kept outside the repository (not applied).

**Fix C** (`docs/js/vss-adapter.js toNodes`, at the end): a name word of the request fills one argument. When `ref()` turned the same name
word into two argument values (more often than the name occurs among the request's tokens), and one of them is an element of a list
argument (`from`, `to`, `target`: the set roles) while the other is a single-valued argument, the list drops it. A value that came from “it” /
“them” is not a name word and is never counted; two lists that share a name are left as they are (25 readings remain, e.g. “Core to Srv1,
Srv2 and Srv3” → from = [Core, Srv1, Srv2, Srv3], to = [Srv1, Srv2, Srv3]). No table, no word: the same rule for every argument.

What changed on the test part (P + C against the shipped code): 20 held-right requests are now done right (both readers agree); 1 held-wrong
becomes held-right; **1 new confidently wrong**: fo-0577 “Waterfall into Pond”, where the gold is one chain `from = pump,filter,uv,
waterfall,pond` spread over several cut units; both readers read this unit's arrow Waterfall → Pond, which is part of that chain (the cut
category of `VSS_BERT_FAILURES.md`, as fo-0433). On the calibration part the new mistake is fo-0242 “Connect Rain to Pond” (gold `to = $new`:
Pond is made earlier in the message; the readers name it): the "request runs although the create of its shape was held" category.
Four VSS readings counted right before are now counted wrong (fo-0047, fo-0062, fo-0397, fo-0470: “Cart to Pay, Pay to Receipt”, gold a chain
`from = cart,pay,receipt`): before, VSS read `from = [cart, pay, receipt], to = receipt`, which the scorer called right because it compares
only the gold's keys (`to` is not one); the engine draws Cart → Receipt, Pay → Receipt and stops on “Receipt can't connect to itself”. Now
`from = [cart, pay], to = receipt`: wrong in both. A scorer that ignores keys the gold does not have is a measurement issue to settle.

After P + C the held-but-right requests that VSS causes go from 340 to 306; the “`from` holds the `to` name” rows from 44 to 15.

## 3. The confidence refit (not adopted)

The fix changes VSS's readings, so `confidence3/refit.sh` was run on the fresh2 + short3 calibration data with VARIANT d2, into a scratch
REC folder, STAMP=0 (the shipped files backed up first):

| VSS-BERT (BERT cut), combined.json | threshold | calibration, out-of-fold: cost score · executed · confidently wrong | test (exploratory) cost score |
|---|---|---|---|
| shipped (records of the shipped code) | 0.9488 | **39.85** · 344 · 2 (0.6%) | 34.8 |
| refit on the P + C readings | 0.9344 | **37.38** · 379 · 7 (1.85%) | 36.8 |
| refit on the variant A readings | 0.9344 | 37.87 · 372 · 6 (1.6%) | 37.2 (and test_vote_confidence failed: vote3.json's agreement changed canon → engine) |

The out-of-fold score falls, so by the rule the new files were **not adopted**: `docs/model/confidence/*.json`,
`combine/combined_parity.json` and `confidence3/vote3_parity.json` were restored byte for byte, and no model file changed (no
`stamp_models.py` run needed). The calibration part decides on very few mistakes (2 against 7 of about 350 executed); the test part, read
after the fact, goes the other way. The four parity tests pass on the shipped files with the new code.

## 4. Verification

- `SERIAL=1 GATE=cost bash training/sketch/regress.sh` (right / wrong / not done % + extra): Rules unchanged. VSS ungated: sample 76.9 / 10.1 /
  12.9 +471 → **77.7 / 9.3 / 13.0 +470**; templates 78.0 / 8.2 / 13.9 +69 → **78.5 / 7.6 / 13.9 +69**; llm_short 70.8 / 8.9 / 20.3 +442 →
  **71.1 / 8.6 / 20.3 +442**. These rows change on purpose: the lists no longer carry the other end's name, and plural shape values reach the
  engine as legend values. VSS gated (cost, t 0.8718): 5.8 / 13.1 / 7.6, unchanged. Rules sets unchanged; test_diagram_ops 273/273,
  test_editor_history PASS.
- Confidence parity tests on the shipped files: test_vss_confidence, test_combined_confidence, test_vote_confidence,
  test_neural_confidence: all pass.
- `convert_check.py --registry ... --tests` with fix C: 4 of 54,137 round trips change from right to differs, all from the converter's `$new`
  bug above (“Arrows from Dad and Mom to Me” is converted to members = {Me, Me}) or from a gold that names one shape twice (synth_combo “Drag it
  between Clean and Source”, `it` = Source).
- UI tests (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers, run last, on the working tree that holds the other agent's ui.js work):
  `test_vss_gate_ui.py` PASS (17 checks), `test_combined_ui.py` PASS (35 checks).

## 5. The other two VSS buckets

### “VSS read no request, or another action”: 155 (fresh2 89, short3 66)

Each unit was read again by the shipped composer on the BERT units (`scratchpad ft/bucket_units.mjs`), and classified by where the error
first sits:

| # | cause | n (fresh2 / short3) | where | examples |
|---|---|---|---|---|
| 1 | **another world won the router**: the gold world read the gold event, another world left fewer words not understood (or tied). In 32 of the 41 that world's **learned front end had turned a word of the unit into its own action token** (most of them common words: “make”, “which”, “put”, “is there”; a few legitimate, “remove” → delete for “remove all links”) | 41 (24 / 17) | code: `training/sketch/front.py` with FRONT_ROWS=world learns each world's trigger and value rules from that world's rows only, so their precision is never checked against the other worlds' rows (manage8: “make” → duplicate, n 114, precision 0.97; layout8: “make” → equalize, “bigger” → respace; manage8 value “which” → all); fixing it needs the fronts relearned and the worlds retrained | fo-0010 “Which shape is bottommost now” → manage reads “delete all shape all bottommost now”; fo-0213 “make her large” → “duplicate her large”; fo-0135 “is there a red shape somewhere” → help reads “help_q asp_can a tp_red shape”; s3-0373 “bigger” → “respace bigger”; fo-0125 “TitleBar goes at the top” → shapes “n_titlebar draw top” |
| 2 | **the right world read another of its own events** | 35 (29 / 6) | data (the worlds' training rows) | rules → list 5 (“What rules are active right now”); arrange → move 5 (“Put Srv1, Srv2, Srv3 in a row”); resize → set 4 (“make Start a little smaller”); count kind=edge → degree 3 (“How many arrows now”, a 2026-11-02 form); path → exists 2, connected → check 2 |
| 3 | **no action word**: the gold world finds no action token (unknown-event, 20) or no world reads the unit at all (12) | 32 (12 / 20) | data: verbless short commands and forms without a learned trigger | “Draft blue”, “start big”, “hexagon for start”, “done in gold”, “Isp1 and Isp2 gray”, “Aggregator -> Store”, “red arrow from start to done”, “even”, “fix” |

Then: the event was right but the context filler asked for a reference (“make them gray”, “connect them in a chain”, “center it”) 19
(calibration of the filler; SOP-BERT filled it right); the gold world tried and read yet another event 18 (data); the gold world was not
among the cutter's candidates 9 (data, cutter); other 1.

### “VSS value”: 54 (fresh2 37, short3 17)

| # | cause | n | where | examples |
|---|---|---|---|---|
| 1 | **forms added 2026-11-02 not read** | 15 | data | help aspect / topic 5 (“can I group shapes”, “how to delete everything”); kind=edge 2 (“number of arrows”); a template's count 2 (“make a cycle with 4 steps”); heading / title text 2; at = x,y 1; a create's layout 1; a template word read where none was meant 2 (“…because is a cycle”) |
| 2 | **the front end loses or changes the value word** | 11 | code: `front.py`'s learned value n-grams span the verb or the shape word (“add three” → 3, “three squares” → 3), so “add three squares under Todo” becomes “draw squares below n_todo” and the count is gone (5); the trigger rule turns “line” into align and leaves “up”, which the world reads as direction = up (“line up App1 and App2 horizontally”, 5); a colour word equal to a shape's name becomes the name (“make Gold gold”, 1). Needs the fronts relearned and the worlds retrained | fo-0446, fo-0096, fo-0018, fo-0467, fo-0549; fo-0034, fo-0040, fo-0238, fo-0303, fo-0335; fo-0058 |
| 3 | **two values in one unit** (a self-correction, or a second word of the same kind): the reader keeps the first, or puts the second into another role (often the new role `outline`) | 8 | data (self-corrections are rare in the worlds' rows) | “Make Alarm red. No wait, orange” → color orange, outline red; “Make Frontend a star. Just kidding, a hexagon” → star; “a row … make it a grid” → row |

Then: `shape` = the plural token (“make A and B squares” → squares) 4, **code, fixed here (P)**; typos the demo's spelling check corrects
first (the records skip it: “doted”, “rectangels”, “bottomost”) 3, measurement; arrow attributes after commas (“connect done to start,
two-way, red”) 3, data; others 10 (a shape word not read and the adapter's default circle 2, “fewest” read as mostconnected 1, “not orange”
read as orange 1, a colour as the attribute of a named shape in a check 1, …).

## 6. What would fix the rest

- Model side of the from / to pattern (25 readings left, two lists sharing names): in `train.py`, calibrate `set_member` on the sentence's
  words, as the decoder reads (variant B shows that alone does not help while fact 2 holds); and fix the converter's `$new` mapping (each
  `$new` to the shape the annotation means, not the last one made). Both need the worlds retrained.
- The biggest single code cause found in the two other buckets is the per-world front end (41 + 11 units): learn each world's trigger and
  value rules with their precision measured over the rows of every world, and never let a value n-gram take in a trigger or a shape word.
  It is a front-end learning rule (no approval needed by AGENTS.md), but it changes the tokens the worlds were trained on: relearn the fronts,
  retrain the worlds, re-run `convert_check.py` and `regress.sh`.
- The scorer: compare the keys of both the gold and the reading (a reading with a key the gold does not have is not right), or settle which
  extra keys are harmless; today 4 chain readings that make the engine fail are counted right.

## Files

- `docs/js/vss-adapter.js` (changed): fix P (`shapeValue`: the role `shape` through `SHAPES`) and fix C (the one-to-one rule on the request:
  `shapeKey`, `usedName`, `SHAPE_ARGS`).
- `training/sketch/combine/VSS_FROM_TO.md` (this file).
- Not changed in the end: `docs/js/vss/reader.js` and `training/vss/tool/sop/infer.py` (variant A, reverted), the model files and the
  confidence files (refit not adopted).
- Scratch (not in the repository; `/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/ft/`): `run_variant.sh`
  (records + the shipped combined reader per variant), `score.py`, `vsscheck.py`, `setcal.mjs` + `fit.py` (variant B's ratios and thresholds),
  `bucket_units.mjs`, `act_classify.py`, `trig.mjs` (section 5), `variantA_reader.patch`, the refit folders `refit_fix/` and `refit_PC/`.
