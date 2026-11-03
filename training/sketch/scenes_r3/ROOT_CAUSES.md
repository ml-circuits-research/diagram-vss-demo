# ROOT_CAUSES: why VSS and SOP-BERT make big mistakes on step-by-step drawings (2026-11-03)

The owner's question: on step-by-step drawings, the house example and the new scenes, VSS and SOP-BERT make big mistakes; the Rules draw the
house well. Find the root causes; improve the data or, if needed, the architecture (BERT's reading heads, the legend).

**Short answer.** The shipped readers (VSS: `docs/model/micro/registry.json`, 9 worlds, arm VSS-ALL; SOP-BERT: `docs/model/neural/sop-bert`,
arm BERT-ALL) were trained before the scenes existed, and the scenes are written in forms that their training data does not hold. Most of
the mistakes are not the models misreading what they know; they are forms that the data never taught, and for VSS a large share that the
conversion of the data cannot even express:

1. **Noun-led creates** ("Wall first: a faint orange rectangle ...", "Tank: blue rectangle ...", "Buoy1: a tiny red circle at ..."): 247 of
   the 332 creates of the 20 scenes. VSS finds no action word (no event token) and reads nothing or reads it in another world; SOP-BERT
   reads `set` / `move` on the prefix. This is the largest cause for both (act / world: VSS 38% of the gold requests, SOP-BERT 20%).
2. **SOP-BERT has no width / height heads at all**, `fill` has only the value `light`, and `create` does not read `distance`. The shipped
   layout comes from the training data (make_roles.py: a key gets a head only if the data has it), and the data had none of these. A
   consequence that looks like a decode bug: in "black rectangle 150 by 90 at 700,300" the numbers 150 and 90 are tagged `at`, the `at`
   role gets four spans, and neural.js drops it (it needs exactly two). 31 of the 36 `at` values SOP-BERT loses on the scenes are in
   requests with a width / height.
3. **VSS's conversion ceiling on the scenes is 50-57%** with the shipped fronts: half of the gold cannot reach a world row. Measured
   causes: no event token (17%), fill / layer words the shapes front end never learned (no `fill_*` / `layer_*` value at all), a gap with a
   relation never carried in rows (a pipeline bug, fixed behind GAP_ROLE=1), "three" / "four" not values of the shapes front end, and bare
   "right of X" not a value of the shapes front end (precision 0.78 < 0.8).
4. **The house**: SOP-BERT draws it exactly like the Rules (8/8 shapes). VSS loses `at` in 3 of 8 creates ("Draw a huge brown square named
   Walls at 400, 300": the reader fills x = 400 but the y role's margin is 0.0007; the adapter needs both). VSS-BERT at its gate executes a
   request only when the two readers agree, so these 3 creates are held: the house shows 5 of 8 shapes. On the other demo examples VSS loses
   "right of Form" (the front end does not turn bare "right of" into right_of) and labels in long creates; VSS-BERT holds every one of them.
5. The gate of VSS-BERT works as designed: on the 867 scene steps it executed 327 requests, 13 of them wrong (96.0% precision), and held
   202 requests that were right (32 on the test scenes, 170 on scenes_r3), mostly because VSS disagreed or had no reading.

## 1. What was run

`scene_readers.mjs` (new, in this folder) runs the shipped readers on every step of a scene, **in context**: the canvas names and groups are
those of the gold drawing so far (as the demo builds them: shape names + group names; `last` = what the previous gold step touched), so a
reader is never punished for its own earlier mistakes in the per-request score. Readers: Rules; VSS (the demo's composer, own cut);
SOP-BERT (own cut head, signals on); VSS-BERT as `ui.js combinedRead` (VSS on the BERT cut's units, `combined-confidence.js` with
`docs/model/confidence/combined.json`) executing everything (`vb_all`) and at its default gate `cost` (`vb_gate`). Requests are paired with
the gold as the collectors do (`bench-canon.js` canon, `layer_common.mjs` pairValue, PAIR=value). Each reader's readings are also replayed
step by step in its own engine and the final drawing is compared with the gold drawing (`scene_replay.py`): what the owner sees.
Demo examples (`docs/js/scenarios.js`) have no gold: the Rules' reading is the reference there (the Rules read all 110 requests of the 9
examples, and their drawing is the reference drawing).

Data: `llm_bench/scenes_test` (4 scenes, 166 steps, 163 requests, held out), `llm_train/scenes_r3` (16 scenes, 701 steps, 714 requests;
never trained on by the shipped readers, so it is as unseen as the test scenes), 9 demo examples (76 turns).

### Per request (gold context)

| data | reader | right | wrong | not done | extra | precision of execution | cost score |
|---|---|---|---|---|---|---|---|
| scenes_test (163) | Rules | 52.8% | 14.1% | 33.1% | 21 | 66.2% | -217.2 |
| | VSS | 49.7% | 28.2% | 22.1% | 17 | 56.2% | -336.8 |
| | SOP-BERT | 60.7% | 34.4% | 4.9% | 29 | 53.8% | -460.7 |
| | VSS-BERT, all | 61.3% | 36.2% | 2.5% | 50 | 47.8% | -607.4 |
| | VSS-BERT, gate | 41.7% | 0.0% | 58.3% | 0 | 100.0% | 41.7 |
| scenes_r3 (714) | Rules | 47.9% | 18.1% | 34.0% | 78 | 62.3% | -242.0 |
| | VSS | 43.4% | 27.3% | 29.3% | 98 | 51.4% | -366.9 |
| | SOP-BERT | 57.8% | 35.4% | 6.7% | 147 | 50.8% | -502.4 |
| | VSS-BERT, all | 58.3% | 37.3% | 4.5% | 233 | 45.5% | -640.6 |
| | VSS-BERT, gate | 34.5% | 1.8% | 63.7% | 0 | 95.0% | 16.2 |
| demo examples (110, Rules = reference) | VSS | 70.9% | 26.4% | 2.7% | 3 | 70.9% | -220.0 |
| | SOP-BERT | 95.5% | 4.5% | 0% | 0 | 95.5% | 50.0 |
| | VSS-BERT, all | 95.5% | 4.5% | 0% | 2 | 93.8% | 31.8 |
| | VSS-BERT, gate | 60.9% | 0% | 39.1% | 0 | 100.0% | 60.9 |

### The final drawings (replay; what the owner sees)

| data | reader | shapes as gold | missing | differ | extra shapes | of the differing: create read right / wrong |
|---|---|---|---|---|---|---|
| scenes_test (78 shapes) | Rules | 4 | 72 | 2 | 1 | 0 / 2 |
| | VSS | 2 | 47 | 29 | 26 | 0 / 29 |
| | SOP-BERT | 8 | 18 | 52 | 10 | 7 / 45 |
| | VSS-BERT, all | 9 | 16 | 53 | 44 | 7 / 46 |
| | VSS-BERT, gate | 1 | 76 | 1 | 0 | 0 / 1 |
| demo examples (54 shapes) | VSS | 24 | 4 | 26 | 0 | 4 / 22 |
| | SOP-BERT | 52 | 0 | 2 | 0 | 1 / 1 |
| | VSS-BERT, gate | 18 | 31 | 5 | 0 | 0 / 5 |

On the scenes no reader draws the picture: one lost create (a panel, a body) and every shape placed relative to it moves or is refused, so the
drawings diverge early. A shape that differs although its own create was read right (anchored to a shape placed elsewhere, the engine's
free-place search) is rare (7 of 52 for SOP-BERT on the test scenes): the drawings are wrong because the readings are wrong, not because
of the engine. What differs: positions (SOP-BERT 48 of 52 differing shapes: lost `at`, lost gaps), sizes (lost width / height), fill and
layer (panels drawn as plain shapes). The Rules draw almost nothing of the scenes (they read 27.7% of the training-scene requests as
nothing: noun-led creates, "Name: description" lines), but where they read, they are mostly right; that is why the house looks right
with the Rules and the scenes do not.

## 2. The causes, per reader

Each miss (a gold request done wrong or not done, or an extra) gets its first cause in pipeline order (`scene_causes.py`): cut -> act /
world -> gate -> names (description, context / pronoun, name tags, new name) -> values (lost before wrong). "Oracle fails" = the gold of that
request does not survive the reader's own data path even with a perfect model: for VSS the conversion ceiling with the shipped fronts
(`convert_check.py --registry docs/model/micro/registry.json`), for SOP-BERT the label round trip of the shipped layout
(`roles_roundtrip.py`, EXTRA_DIRS of the shipped model, scenes added with ALSO_DIRS). An oracle failure is a data / legend / adapter /
decode cause; an oracle pass is a model / data-coverage cause.

### VSS, scenes_test (99 misses on 163 requests; 66 of them fail the conversion oracle)

| cause | misses | % of misses | % of gold | oracle fails |
|---|---|---|---|---|
| act / world (no event token: noun-led creates; group commands; other world) | 50 | 50.5% | 30.7% | 27 |
| name tags (target / anchor) | 10 | 10.1% | 6.1% | 7 |
| new name ("..., Frame", "Name: ...") | 8 | 8.1% | 4.9% | 5 |
| value lost: colour / fill | 6 | 6.1% | 3.7% | 6 |
| value lost: count ("three", "four") | 6 | 6.1% | 3.7% | 6 |
| cut | 3 | 3.0% | 1.8% | 3 |
| description | 3 | 3.0% | 1.8% | 3 |
| value lost: width / height | 2 | 2.0% | 1.2% | 1 |
| value lost: distance | 2 | 2.0% | 1.2% | 2 |
| value lost: position, label, at, shape, size | 7 | 7.1% | 4.3% | 4 |
| context / pronoun | 2 | 2.0% | 1.2% | 2 |

Every wrong key of the wrong requests (a request counts once per key): width / height lost 20, name tags 11, colour / fill lost 10, new
name 9, distance lost 8, position lost 8, count lost 6, at lost 5, layer lost 4. On scenes_r3 the same order: act / world 272 of 502 misses
(38.1% of the gold; 157 fail the oracle), then name tags 39, new name 37, colour 19, cut 19, count 17 (all 17 fail the oracle: number
words), context 16, description 16.

### SOP-BERT, scenes_test (93 misses on 163 requests; 42 fail the label oracle of the shipped layout)

| cause | misses | % of misses | % of gold | oracle fails |
|---|---|---|---|---|
| act / world (the prefix of a noun-led create read as set / move; group not read) | 29 | 31.2% | 17.8% | 4 |
| context / pronoun ("the compass" -> star1, "that glow" -> circle1) | 11 | 11.8% | 6.7% | 11 |
| value lost: colour / fill (faint, light) / layer | 11 | 11.8% | 6.7% | 10 |
| new name | 10 | 10.8% | 6.1% | 5 |
| cut (chatter read as a request: "Potted plant in the corner:") | 8 | 8.6% | 4.9% | 0 |
| value lost: layout ("in a grid", "in a row") | 6 | 6.5% | 3.7% | 0 |
| value lost: width / height | 5 | 5.4% | 3.1% | 5 |
| value lost: distance (create: no `distance` in act_keys) | 5 | 5.4% | 3.1% | 5 |
| name tags | 3 | 3.2% | 1.8% | 0 |
| description, other | 5 | 5.4% | 3.1% | 2 |

Every wrong key: width / height lost 36, colour / fill lost 15, context 11, new name 10, at lost 9, layer lost 8, distance lost 8. On
scenes_r3: act / world 145 of 448 misses (20.3% of the gold, 15 fail the oracle), context 59 (all fail: the shared context rule gives
another shape), chatter read as a request 40, new name 36, colour 28, width / height 22, distance 20.

### VSS-BERT

Executing everything it is SOP-BERT plus VSS-only requests: the same causes as SOP-BERT plus more extras (50 on the test scenes, 233 on
scenes_r3: VSS reads the other half of a request SOP-BERT cut in two). At the gate (the default), what it executes is right 96% of the time
(13 wrong of 327 executed on the 20 scenes). Its misses are held requests:

| data | held, the request was wrong (good) | held, the request was right | cut (nothing read) |
|---|---|---|---|
| scenes_test | 59 | 32 | 4 |
| scenes_r3 | 253 | 170 | 32 |
| demo examples | 5 | 38 | 0 |

Why a right request is held: the combined confidence is high only when the two readings agree. Of the 38 held right requests of the demo,
26 were paired with a VSS reading that differs (VSS lost `at`, a position, a label), 10 agreed but stayed below the threshold, 2 had no VSS
reading. So the gate's misses follow VSS's errors: every fix of VSS lifts VSS-BERT.

### The Rules (for comparison)

Their misses on the scenes are mostly "nothing read" (41 of 98 on the test scenes; 198 of 450 on scenes_r3): noun-led creates and
"Name: ..." lines have no verb they parse. When they read, they are right more often than the learned readers (precision 62-66% vs
51-56%), and on the demo examples (verb-first, one clause each) they read everything.

### Cause classes asked for, with the numbers above

| class | VSS | SOP-BERT | where it sits |
|---|---|---|---|
| cut | 3-4% of misses | 9% (chatter read as a request, one request read twice) | model (SOP span head), data |
| act / world | 50-54% | 31-32% | data: noun-led creates, "Name: description" (scenes_r3 has them; the shipped models did not train on it); VSS also front end (no event token for a noun) |
| value lost: at | 1-2% primary; 5 requests | 9 requests on the test scenes, 36 on all scenes | SOP: no width / height heads -> 4 `at` spans -> decode drops `at`; VSS: the y role (house) |
| value lost: size / width / height | 20 requests (VSS), 36 (SOP) | | SOP: no heads (layout from data); VSS: model (the rows carry them: 100% in the ceiling) |
| value lost: distance | 8 / 8 | | VSS: pipeline bug (fixed, GAP_ROLE); SOP: `create` has no `distance` (act_keys from data) |
| value lost: count | 6 (VSS) | 0 | VSS front end: "three" -> 3 not learned (precision 0.75) |
| value lost: colour / fill / layer | 10 / 4 | 15 / 8 | VSS front end has no fill_* / layer_* values; SOP fill head has only `light` |
| name tags, new name | 18% | 14% | model / data; VSS: a name at the start of a span is not a name token ("Buoy1: ...") |
| description | 3% | 2% | gold says the default name (circle1) the text calls "that glow" |
| context filler / pronoun | 2% | 12% | the shared context rule (last shape) vs "the title", "the compass": left to the reasoning layer (AGENTS.md), but the owner sees it as wrong |
| adapter / decode | the y-without-x drop (adapter needs both); the gap of a relation (fixed) | the 4-span `at` drop (only because the heads are missing) | |
| confidence / gate | - | - | VSS-BERT: 32 right requests held on the test scenes, 38 on the demo |
| engine default | 0-7 shapes per reader (create read right, placed elsewhere) | | engine findings of scenes_r3/README.md; small |
| legend gap | none needed by the gold (the writer avoided "inside", rotation, "half the height") | the SOP layout lacks keys the legend has (width, height; fill values; distance for create) | data -> layout |

## 3. The architecture-level suspects, checked

**SOP-BERT reading heads**
- *Many names and numbers in one message.* The span tagger tags them, but the shipped layout has **no width / height tags**: "black rectangle
  150 by 90 at 700,300" -> `at` spans [150, 90, 700, 300]; neural.js `role()` (kind point) needs exactly 2 numbers and returns nothing.
  31 of the 36 lost `at` on the scenes have a width / height in the gold. "a gold rectangle 90 by 70 at 360,130, Frame" -> `at` spans
  [70, 360, 130, Frame]. Oracle: with the shipped layout the label round trip of scenes_test is **71.8%** right (82.8% with the references
  the context rule fills); 26 requests fail "key not learned" (width / height), 2 "value with no class" (fill faint / none). With scenes_r3 in
  the training data (the layout then gets width / height tags, `fill` faint / none, `distance` for create) the round trip is **89.0%**
  (100.0% with references); short3 and fresh2 do not change (95.7%; 87.9 / 91.5 / 94.3 / 90.8%). So the head is not missing from the
  architecture: the layout is built from the data, and the data lacked these keys.
- *Numbers as words.* Count words decode right ("Four tiny green circles" -> count 4). The learned number-word map is noisy
  (`config.json reader.number_words`: "lights" -> 2, "circles" -> 2, "duplicate" -> 2; co-occurrence alignment in make_roles.py) and has no
  gap words: in scenes_r3b, "forty px", "two px", "thirty px", "ten px" are not aligned (5 of the 7 requests of scenes_r3b that do not
  round-trip). Few such words in the data; more data or a digit-word table for the number kind (a mechanical step, needs the owner's OK).
- *Class heads collapse rare values.* Yes, by construction: a head has only the values seen in training (`fill`: none / light; legend: 4
  values). Faint fills and "none" fills cannot be read. Data.
- *512 / word-piece limit.* Not hit: the longest scene step has 36 words; requests are read with max_length 128.
- *Several requests in one step.* 61 gold requests sit in steps with 2+ requests: SOP-BERT reads 26 of them right (43%) vs 60% in
  one-request steps; the misses there are mostly a merged or split cut and the second create losing its values, not values crossing between
  requests (no case of a value of one request landing in the other was seen in the examples).
- *Act keys.* `create` reads no `distance` (act_keys from the data): "6 px right of LampShade" is tagged `distance=6` and then dropped.

**VSS**
- *Distance with an anchor.* Confirmed: `llm_to_world.py place()` / `place_ops()` never wrote `distance`; 0 / 38 gaps with a relation
  reached a row. Fixed behind GAP_ROLE=1 (below).
- *Number words for count.* Confirmed: the shapes front end has "five", "six" but not "two", "three", "four" (precision of "three" -> 3:
  0.75, of "two" -> 2: 0.63, bar 0.8: "the three rooms", "two circles" in descriptions). VAL_PREC=event (the existing switch for exactly
  this) recovers 4 of 19 count rows on scenes_r3 but lowers fresh2 74.4 -> 73.1%: not used.
- *Absolute positions.* The rows carry `at` (86% of the ceiling); the reader loses y in long creates (the house: x read, y margin 0.0007;
  "at 190, 310" read, "at 190, 300" not). Model / data: "at X, Y" with a space occurs 0 times in scenes_r3 and 4 times in the shipped data.
- *The composer with many names.* No effect: adding 40 more names to the canvas list (PAD_NAMES=40, 56-76 names in all) leaves every
  outcome of every reader on the test scenes identical; misses do not grow with the number of names on the canvas (VSS misses per gold
  request by names on the canvas: 0-9 names 77%, 10-19 60%, 20-29 39%, 30+ 34%: later steps are simpler edits).
- *The front end.* Two learned-value gaps matter most on the demo: bare "right of" / "left of" (shapes world: "right of" -> right_of has
  precision 0.78 because 49 of its 279 occurrences are inside "bottom right of" / "top right of") and fill / layer words (no `fill_*`,
  `layer_*` value learned; "light" -> fill_light 0.71). And "wide" -> rectangle (0.94; "780 wide" panels are always rectangles).

**The legend.** The scenes' gold needs no key or value the legend lacks (the writer avoided "inside", rotation and "half the height"; 0 uses
of "inside" in the 867 texts). The gaps are in what the readers learned from the legend: SOP-BERT's layout (width, height, fill values,
distance for create) and VSS's front end (fill / layer / number words). `position=inside` (being added now) is not used by any scene.

## 4. Fixes made (with tests and the round-trip gates)

**F1. GAP_ROLE=1** (`llm_to_world.py`, off by default, byte-identical off): a gap written with a relation fills the role `amount`, as the gap
of a move with a direction already does. `docs/js/vss-adapter.js place()` reads `amount` beside a relation as `distance` (reader code: the
coordinator should review; a world built without GAP_ROLE has no `amount` on create).
- Test: `test_gap_role.py` (converter off / on, the direction case unchanged, the adapter both ways): ok.
- Conversion ceiling (convert_check, fronts learned with EXTRA_DIRS = the 12 shipped folders + scenes_r3, LEGEND_EXT=1 DIAGRAM_OPS=1
  VAL_PICK=specific NEW_DISTINCT=1): scenes_r3 60.4 -> **61.6%**, scenes_test 63.2 -> **65.0%** (distance differs 39 -> 24 rows); every other
  folder identical to the decimal (14 training folders, short3 61.2%, fresh2 74.4%). With the shipped fronts: scenes_r3 49.9 -> 50.6%,
  scenes_test 57.1 -> 58.3%.
- The adapter change on the SHIPPED worlds (2049 messages: fresh2, short3, scenes_test, scenes_r3, collected_1): 4 readings change, all by
  an added `distance` on a relation (the position world already fills `amount` there): sc3-12-033 "put Bar 20 px below Trio" becomes right;
  the 3 others (s3-0325, sc3-09-022, sc3-15-024) were already wrong by their act (a move read for a create) and stay wrong. Not
  byte-identical; no outcome got worse.

**F2. convert_check.py** passed VAL_SUB / VAL_PREC from the environment to no world (the 070 table builder dropped them), so those
switches could not be measured; they (and VAL_SHADOW) are now passed like VAL_PICK.

**F3. roles_roundtrip.py ALSO_DIRS** (off by default): more folders checked with the training layout; it is how the SOP-BERT label ceiling of
the scenes was measured (it had no option for them).

**Tried and not adopted (a folder went down):**
- VAL_PREC=event: scenes count 19 -> 15 differing rows, scenes_r3 61.6 -> 61.3%, fresh2 74.4 -> 73.1%.
- VAL_SHADOW=1 (new, `front.py`, off): an n-gram's precision counted only over its occurrences that a longer kept n-gram does not consume
  (so "right of" is learned): scenes_r3 61.6 -> 62.7%, scenes_test 65.0 -> 66.9%, but fresh2 74.4 -> 72.7%, synth_rules 79.8 -> 76.8%,
  synth_combo 79.5 -> 76.4%. Kept in the code, off, with the result in its docstring.
- VAL_SUB=value: no change on any folder.

## 5. Data: llm_train/scenes_r3b (new, 4 scenes, 96 steps, 94 requests)

Written as an Opus writer with the validation of scenes_r3 (texts saved first; gold run through the engine, 0 errors; no overlap, nothing off
the canvas; no text overlap with any test set; frame repetition 0.979 / 0.926). It holds the forms of the causes above inside ordinary
scenes: coordinates with a space or brackets (33 steps), sizes in several word orders (20), gaps with a relation, also in words (16), bare
"right of" / "left of" (12), panels with pale / faint / light and background / zone (6), counts in words (2). See its README.
- The shipped readers on it (gold context): Rules 53.2%, VSS 45.7%, SOP-BERT 54.3%, VSS-BERT 56.4% / gate 37.2% right with 1 wrong.
- Conversion ceiling with scenes_r3 + scenes_r3b in EXTRA_DIRS and GAP_ROLE=1: scenes_r3b 72.3%, scenes_r3 61.6 -> 62.2%, scenes_test
  65.0 -> **65.6%**, short3 and fresh2 unchanged, every training folder unchanged except opus_gen_1 76.3 -> 76.2% (1 request of 991).
- SOP-BERT label round trip with scenes_r3 + scenes_r3b: scenes_r3b 92.6% (94.7% with references; the 5 misses are the gap number words),
  every other folder unchanged (scenes_test 89.0%, short3 95.7%, fresh2 87.9 / 91.5 / 94.3 / 90.8%).

## 6. Proposals for round 3 (expected gains are ceilings, not predictions of the trained readers)

| # | proposal | kind | expected gain (measured ceiling) |
|---|---|---|---|
| P1 | Train both readers with `llm_train/scenes_r3` + `scenes_r3b` in EXTRA_DIRS | data | SOP-BERT label ceiling on scenes_test 71.8 -> 89.0% right (100% with references; it gets width / height tags, fill faint / none, distance on create, which also ends the 4-span `at` drop); VSS conversion ceiling 57.1 -> 63.2% (fronts learn noun triggers: no event token 11.7 -> 8.6%); no other folder changes |
| P2 | Build the VSS worlds with GAP_ROLE=1 | pipeline fix (done, switch) | VSS ceiling scenes_test +1.8 pts, scenes_r3 +1.2 pts, nothing else changes; VSS-BERT agrees more on gaps |
| P3 | A name token for a capitalised word with a digit at the start of a span ("Buoy1: ...", "Chair2, another ...") in front.py / front.js tokenize | mechanical front-end step: needs the owner's OK (VSS_READER_SPEC lists the mechanical steps) | the "new name" rows of scenes_r3b (8 of 26 non-round-tripping rows) and part of VSS's "new name" misses (37 on scenes_r3) |
| P4 | Front value learning that counts precision only where the n-gram is applied (VAL_SHADOW) restricted or redesigned so that no folder drops | front end (learned, no hand list) | the demo's "right of X" (VSS loses the position in 14 demo requests); as tried it lowers fresh2 by 1.7 pts, so it needs a better rule, not this one |
| P5 | neural.js: a point with more than two number spans takes the two adjacent ones joined by a comma ("360,130") | decode robustness | only for a model without width / height tags (the shipped one): up to 31 `at` values on the scenes; moot after P1 |
| P6 | SOP-BERT number words: align gap / count words by the number kind only, or a digit-word table as a mechanical step | data / mechanical (owner's OK) | the 5 gap-word requests of scenes_r3b; removes noisy entries ("lights" -> 2) |
| P7 | Re-measure VSS-BERT after P1-P2 | measurement | the gate holds 170 right requests on scenes_r3 because VSS disagrees; each VSS fix raises what VSS-BERT executes |

What is not a reader problem: "the compass", "the title", "that glow" for shapes the engine named star1 / text1 / circle1 (SOP-BERT 59
misses on scenes_r3, all failing the oracle): the shared context rule gives the last shape; this is the reasoning layer's job by AGENTS.md,
and the readers should ask there rather than guess.

## Files

- `training/sketch/scenes_r3/scene_readers.mjs`: the readers step by step in context, scored per request, replayed in the engine
  (`PAD_NAMES=n`: n more names on the canvas; `SCENARIOS=house,...`: the demo examples with the Rules as reference).
- `training/sketch/scenes_r3/scene_score.py`: per-request table. `scene_causes.py`: the cause of every miss (with the oracle overlay).
  `scene_replay.py`: the final drawings against the gold. `test_gap_role.py`: the test of F1.
- Changed: `training/sketch/llm_to_world.py` (GAP_ROLE), `docs/js/vss-adapter.js` (amount beside a relation), `training/sketch/front.py`
  (VAL_SHADOW, off, not used), `training/sketch/convert_check.py` (VAL_SUB / VAL_PREC / VAL_SHADOW passed), `training/neural/roles_roundtrip.py`
  (ALSO_DIRS).
- New data: `training/sketch/llm_train/scenes_r3b/` (README, msg_21..24, texts/).

Reproduce (CPU, ~5 min for all scenes):
```
node training/sketch/scenes_r3/scene_readers.mjs OUT training/sketch/llm_bench/scenes_test/batch_0*.jsonl
SCENARIOS=house,traffic,zoo,login,org,solar,states,network,story node training/sketch/scenes_r3/scene_readers.mjs OUT_DEMO
python3 training/sketch/scenes_r3/scene_score.py OUT/steps.jsonl
python3 training/sketch/scenes_r3/scene_causes.py OUT/steps.jsonl --vss-dump CC.jsonl --sop-dump RR/decoded.jsonl
python3 training/sketch/scenes_r3/scene_replay.py OUT
LEGEND_EXT=1 DIAGRAM_OPS=1 python3 training/sketch/convert_check.py --registry docs/model/micro/registry.json --no-base --dump CC.jsonl llm_train/scenes_r3 llm_bench/scenes_test
EXTRA_DIRS="<the 12 shipped folders>" ALSO_DIRS="llm_train/scenes_r3 llm_bench/scenes_test" python3 training/neural/roles_roundtrip.py --work RR
```
