# Conversion fix before the GPU run (2026-11-03): running log

Task: make the training gold reach the VSS worlds in a learnable form (VSS_SYNTH_DIAGNOSIS.md), every change behind an off-by-default
switch (all switches off = builds byte-identical to HEAD), then wire the switches and a round-trip check into jobs 070 / 071 / 072.

## Log

- 02:12 restart. Found in the working tree (previous agent): front.py VAL_PICK=specific (+ a leftover debug env XSPEC in the
  sub-n-gram block), msg_to_world.py prints it, train_micro.sh passes / records it, new convert_check.py + convert_check.mjs (working:
  outputs of two runs in the scratchpad, 070 as drafted and 070 + VAL_PICK=specific).
- step 1 (VAL_PICK=specific), why "wrong on fresh" rose 8.8% -> 13.1% (scratch records d_GS / d_GSmp, manage + position requests of
  synth fresh): 15 requests went from not done to wrong, 1 from right to wrong. The restored shape exposed filters that are still lost:
  "the boxes that are not orange" -> delete mention(quantifier=all,shape=rectangle) (4 of the 16: notcolor lost, the row is a BROADER
  description), and value words the front end never learned ("aqua dot", "the most recent dot", "the first hexagon", "Label all of the
  stars payment" unquoted label, "in a column" read as the layout for align). Clear cause for the first: the value table maps "not" -> all
  (every "not <colour>" in the synthetic data is inside a plural description), and a kept sub-n-gram blocks every longer n-gram, so
  "not orange" -> not_orange is never kept. The previous agent's debug variant (XSPEC: lift the block whenever the longer value is
  rarer) was tested and rejected: it adds 150 n-grams, many wrong ("black diamonds" -> diamonds, "blue to" -> not_blue, "align all
  shapes" -> horizontally). Fix (part of VAL_PICK=specific, no new switch): a longer n-gram is kept when it REFINES a kept sub-n-gram
  (its value implies the sub-n-gram's value in >= min_prec of its requests and is rarer) and no other kept sub-n-gram's value is still
  in its gold. It adds exactly: "not <colour>" -> not_<colour> (18 in shapes, 15 in manage), "every star/triangle", "each
  hexagon/square/triangle" -> the plural shape, "triangle that is" -> triangles; nothing else. Round trip (070 data, LEGEND_EXT=1):
  synth_rules 77.1% -> 79.3%, synth_combo 76.9% -> 79.0%, base 80.2% -> 80.3%, fresh2 72.0% = 72.0%, short3 55.4% = 55.4%.
  The value words never learned (aqua, recency words, unquoted labels) are not fixable in the front end without data: left.
- step 2 (plural descriptions, LEGEND_EXT=1): llm_to_world.convert ent(): a description is never written broader than its gold. When its
  shape word is missing (front end made "stars" into `all`) a quantifier / "everything" head is refused, and when a filter (colour,
  not-colour, recency) has no token the description is left out (lost "description filter lost: ..."), so the row says nothing about the
  role. "every shape" share: 0.0% in every folder, with or without VAL_PICK (070 as drafted: synth_rules 4.1%, synth_combo 4.2%,
  ops_formulations 4.5%, short3 1.2%). (First version had a bug: a sentinel "?" matched the question-mark token; fixed.)
- convert_check.py: --dump FILE (every request's outcome, row vs gold) for the analyses.
- step 3 (keys with no role, LEGEND_EXT=1): generate.ROLES += outline, x, y, linked; front.py: outline values are value tokens (a colour
  = its own token, kind COLOR; none = no_outline); llm_to_world ext_values: outline, at "x,y" -> x / y (number roles), linked (a shape,
  ent()), undo / redo count -> quantity; docs/js/vss-adapter.js reads them back (outline, at, linked, undo/redo count; linked is an
  entity role for offers). Kind / disconnect quantifier / arrow-label from-to / create & arrange layout were already converted under
  LEGEND_EXT; what is left of them on short3 is words the front end never learned ("color the arrows red": "arrows" not a value in the
  shapes world; "side by side" -> row; "hub and spoke" -> radial; "go back three steps").
  synth_rules_ops round trip 35.9% -> 51.4%; short3 55.4% -> 57.1% (outline 6 ok of 14, at 7 of 9, undo 1 of 3; the rest miss the
  event token: "outline start black", "start: red border" have no learned set trigger).
- DIAGRAM_OPS=1 (groups, position2 / region with a relation): new worlds_micro/GROUPS_8ops.json (GROUPS_8 + manage: group, ungroup;
  questions: members, groupOf, as GROUPS_7r2) and GROUPS_EVENTS_8ops.json. Conversion: synth_rules_ops 51.4% -> 76.5% (no world 21.1% ->
  0), short3 57.1% -> 59.6% (no world 3.0% -> 0); every other folder within 0.1 point.
- step 6: docs/js/bench-canon.js canonWant sorts the keys of a gold mention (as canon does for a mention wire).
- verify, every switch off: `SERIAL=1 GATE=cost bash training/sketch/regress.sh` = the committed table exactly (sample Rules
  69.1/15.5/15.4 +769, VSS 76.0/11.8/12.2 +309; templates 98.9/0.4/0.8 +4, 59.5/11.8/28.7 +76; llm_short 72.4/5.6/22.0 +375,
  66.9/9.4/23.7 +400; gated cost 12.1 / 11.6 / 12.0; rules sets 39/40 53/60 300/300 300/300 299/300; test_diagram_ops 255/255,
  test_editor_history pass). msg_to_world.py world data (manage, shapes CREATE_COLOR=role, questions, history; G + synth_rules) built
  with HEAD's front.py / generate.py / llm_to_world.py / msg_to_world.py and with the working tree: identical files (diff -r).
- convert_check.py: --registry REG (the trained worlds of a registry: their events, BUILD.json settings, exported front.json; for job 072),
  file arguments resolved against the caller's folder. Shipped registry (docs/model/micro/registry.json, no switch): short3 41.9%, fresh2 71.5%.
- 070 updated (switches, GROUPS_8ops / GROUPS_EVENTS_8ops, VAL_PICK in KEYS and in every world's settings, the convert_check gate after
  worlds.tsv, registry fields, 4 smoke messages). Its check / table / gate section was run in the scratchpad: gate passed, table as
  above (short3 60.6% with the per-world settings of the table). Bug found and fixed on the way: `GROUPS` is a bash builtin array, an
  assignment to it is ignored (renamed W_GROUPS / EV_GROUPS). Gate failure path checked (exit 3).
- FOUND (not caused by this work): the committed training/sketch/legend_ext/legend_values.json carries logic_sha256_16 27a2145c4956ef03,
  but HEAD's docs/js/logic.js is aae68526b3b30b53 (values identical). 070's check `export_legend_values.mjs && git diff --quiet` would stop
  the job. The re-exported file is left in the working tree: commit it with this change.
- smoke (CPU, EPOCHS=1, LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1, 070's EXTRA_DIRS, scratch models): manage8 (delete, duplicate,
  rename, label, group, ungroup; 3909 rows, 99 s), history8 (901 rows, 95 s), shapes8 (CREATE_COLOR=role, 15919 rows, 605 s); read through
  the browser composer (vss-composer.js, shipped cutters / filler, the cutter's grouping set in memory to the smoke worlds; oracle = gold
  units + gold world + gold event H2). Hand rows: "remove all the stars" -> delete mention(quantifier=all,shape=star) and "delete the
  circles that are not red" -> mention(notcolor=red,quantifier=all,shape=circle), right in both modes; "add a circle at 100,200" -> at=100,200;
  "add a square connected to Done" / "Start is connected to Done" -> linked=Done (oracle); "ungroup Ends" right; "group Start and Done as Ends"
  -> group name=Ends (target also takes Ends: 1 epoch). Key right at oracle level, synth_rules_ops (trained on): at 43/45, linked 46/47,
  count 84/98, from/to 110/146, outline 14/60, position2 12/46, region 8/17; short3: outline 2/15, at 1/2, count 11/32, kind 0/4.
  Outline is mostly read into the colour role at 1 epoch ("give Process a blue border" -> color=blue); the adapter now places the token
  no_outline by what it is (outline=none, never a colour). kind=edge set requests come out as nothing at oracle level: the shipped
  filler asks for the missing target (070 retrains the filler on the gold, where these have no target). Undo count: no training request
  has one (only short3 does), so the role exists but nothing teaches it.
- final regress (after the last adapter change), every switch off: identical to the committed table again (same numbers as above;
  test_diagram_ops 255/255, test_editor_history pass).
- retrain, CPU one core each, 10 epochs, the GS data (G folders + synth_rules), settings of results/local_GS/worlds.tsv + LEGEND_EXT=1
  VAL_PICK=specific DIAGRAM_OPS=1, GROUPS_7 events: manage7 2685 rows 266 s, position7 8311 rows 1192 s; the other 5 worlds, cutters
  and filler of docs/model/arms/GS. Scored as the diagnosis scores (fresh2 collector pairing PAIR=value, bench-canon; full composer):

  | set | requests | GS (docs/model/arms/GS) right / wrong | GS + new manage7, position7 right / wrong |
  |---|---|---|---|
  | synth fresh, manage + position requests | 375 | 46.9% / 8.8% | 72.8% / 12.8% |
  | synth fresh, all | 1147 | 58.8% / 15.0% (+77 extras) | 67.0% / 16.2% (+67) |
  | short3 (510), manage + position requests | 166 | 44.6% / 10.8% | 53.0% / 10.8% |
  | short3 (510), all | 510 | 45.9% / 14.7% (+67) | 48.6% / 14.5% (+65) |

  (GS short3 45.9% here vs 45.1% in the diagnosis: bench-canon now sorts the gold mention keys.) Wrong on synth fresh still rises with the
  executed share; its causes (manage + position, 48 wrong): the axis written as a layout word ("align the hexagons in a column",
  "space all the nodes evenly in a row": 13), value words the front end never learned (aqua, "the last oval", "lower left corner"), the
  unquoted label ("label the last oval fail"), "clear the square" read as plural. None of these is a conversion loss.

## Round trip (convert_check.py), share of each folder's requests; job 070's EXTRA_DIRS

| folder | requests | no switch, GROUPS_7 (HEAD code) | 070 as drafted: LEGEND_EXT=1, GROUPS_8 (HEAD code) | now: LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1, GROUPS_8ops | every shape: drafted -> now |
|---|---|---|---|---|---|
| base (DATA=spans) | 22702 | 79.4% | 80.0% | 80.3% | 0.3% -> 0.0% |
| opus_train_a | 994 | 72.4% | 72.6% | 73.2% | 0.7% -> 0.0% |
| opus_train_b | 891 | 68.7% | 69.1% | 69.9% | 1.3% -> 0.0% |
| opus_train_c | 1059 | 70.8% | 71.3% | 71.7% | 0.5% -> 0.0% |
| opus_train_d | 1015 | 69.5% | 69.8% | 70.0% | 0.7% -> 0.0% |
| opus_gen_1 | 991 | 73.3% | 73.9% | 73.9% | 0.3% -> 0.0% |
| opus_gen_2 | 1094 | 75.5% | 76.1% | 76.1% | 0.2% -> 0.0% |
| synth_rules | 11707 | 65.9% | 72.5% | 79.3% | 4.1% -> 0.0% |
| synth_rules_ops | 1470 | 5.5% (no world 31.0%) | 35.4% (no world 21.1%) | 76.5% (no world 0.0%) | 0.0% -> 0.0% |
| synth_rules_ext | 3664 | 25.6% | 80.6% | 82.2% | 1.3% -> 0.0% |
| ops_formulations | 733 | 16.1% | 59.1% | 62.1% | 4.5% -> 0.0% |
| opus_ext_1 | 743 | 14.9% | 47.4% | 47.1% | 0.3% -> 0.0% |
| synth_combo | 4521 | 66.6% | 72.2% | 79.0% | 4.2% -> 0.0% |
| short3 (no pending) | 644 | 42.9% (shipped worlds 41.9%) | 55.7% | 60.6% | 1.2% -> 0.0% |
| fresh2 (opus_a..d) | 1909 | 70.9% (shipped worlds 71.5%) | 71.2% | 72.0% | 0.9% -> 0.0% |

The HEAD columns use HEAD's front.py / generate.py / llm_to_world.py with today's adapter and bench-canon (the mention-key sort moves short3 by
about 1 point). "now" uses the per-world settings of 070's world table (shapes CREATE_COLOR=role).

## State: done (scratch outputs removed)

Changed: training/sketch/{front.py, generate.py, llm_to_world.py, msg_to_world.py, train_micro.sh, TRAIN_PLAN_1103.md,
legend_ext/legend_values.json (re-export, sha line only)}, docs/js/{vss-adapter.js, bench-canon.js}, training/laptop/jobs_draft/{070,071,072}.
New: training/sketch/{convert_check.py, convert_check.mjs, synth/CONVERT_FIX.md}, training/sketch/worlds_micro/{GROUPS_8ops.json,
GROUPS_EVENTS_8ops.json} (worlds_micro/ is git-ignored: `git add -f`).
