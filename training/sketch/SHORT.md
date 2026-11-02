# SHORT.md: the composer on short one-line commands (2026-11-02)

Status: analysis done, change pre-registered (draft, not run). Nothing in docs/ was changed.

## 1. Measurement

Readers: rules (docs/js/logic.js) and VSS = the default composer (docs/model/micro/registry.json: cutter_worlds7, the 7 worlds,
fallback kinds_p80_s0, event hint H1 with cutter_events.json), called as the demo calls it: `comp.formalize(text, {names, last: []})`.
Sets: docs/bench/{hand, blind, broad, seen, new_identities, heldout_formulations}.json (1128 rows, 1140 gold requests; broad has 10
rows with several requests). Scoring per gold request with llm_score.mjs `scoreMessage` (LLM_SCORE_LIB=1, PAIR=value): each bench row
becomes one gold wire (or its `wires`). Gold `tofront` / `toback` are written `toFront` / `toBack` first (the act label of
llm_score.mjs is case-sensitive; without this, rules lose 5 requests and VSS 5 that are right). The demo Benchmark's figure
(bench-canon `score().ok` per row) is given as well: it agrees with the per-request "right" on every one-request set (blind 83.3 vs
55.0, as the owner saw).
Script: training/sketch/short_bench/short_bench.mjs (+ agg.py, classify.py,
peract.py, datastats.py in the same folder; copy into training/sketch/ if this measurement is to be kept).

Per gold request, right / wrong / not done (%), extra = produced requests nobody asked for:

| set | requests | rules | VSS | demo row score rules · VSS |
|---|---|---|---|---|
| hand | 40 | 92.5 / 0.0 / 7.5, extra 1 | 55.0 / 7.5 / 37.5, extra 1 | 92.5 · 55.0 |
| blind | 60 | 83.3 / 3.3 / 13.3, extra 5 | 55.0 / 5.0 / 40.0, extra 6 | 83.3 · 55.0 |
| broad | 140 | 95.7 / 1.4 / 2.9, extra 2 | 68.6 / 12.9 / 18.6, extra 6 | 96.1 · 67.2 |
| seen | 300 | 98.7 / 0.3 / 1.0, extra 4 | 48.7 / 8.0 / 43.3, extra 11 | 98.7 · 48.7 |
| new_identities | 300 | 98.7 / 0.0 / 1.3, extra 4 | 48.7 / 10.7 / 40.7, extra 10 | 98.7 · 48.7 |
| heldout_formulations | 300 | 99.7 / 0.3 / 0.0, extra 0 | 46.0 / 15.0 / 39.0, extra 6 | 99.7 · 46.0 |
| written by hand (hand+blind+broad) | 240 | 92.1 / 1.7 / 6.2 | 62.9 / 10.0 / 27.1 | |
| all six | 1140 | 97.5 / 0.5 / 1.9 | 51.0 / 11.0 / 38.1 | |

The three generated sets come from generate.py templates whose words the rules were written with; the fair comparison is the
written sets (240 requests): rules 92.1 / 1.7 / 6.2, VSS 62.9 / 10.0 / 27.1.

Per action, written sets (rules right/wrong/not done | VSS right/wrong/not done | VSS requests lost because the cutter made no unit):
create 30: 26/2/2 | 17/8/5 | 3 · connect 21: 21/0/0 | 10/8/3 | 3 · delete 16: 15/1/0 | 3/2/11 | 11 · set 15: 15/0/0 | 8/1/6 | 5 ·
move 13: 12/1/0 | 9/2/2 | 2 · count 12: 12/0/0 | 10/2/0 | 0 · property 11: 9/1/1 | 7/2/2 | 2 · disconnect 4: 4/0/0 | 0/1/3 | 3 ·
undo 3: 3/0/0 | 1/0/2 | 2 · distribute 3: 3/0/0 | 1/0/2 | 2 · cycle 4: 4/0/0 | 1/1/2 | 2 · rule 5: 5/0/0 | 3/0/2 | 2; the other 23
actions have 1-7 requests each (table: peract.py). Generated sets, the largest losses: connect 148: VSS 50/19/79 (34 no unit), list 34:
4/5/25 (25 no unit), delete 28: 2/2/24 (23 no unit), distribute 15: 1/1/13 (13), arrange 18: 6/1/11 (11), undo 7: 0/0/7 (7).

The 1000-message sample re-run today (same command as before): VSS 74.9 / 13.1 / 12.0, extra 302; rules 67.6 / 16.9 / 15.5, extra 806.

## 2. Root cause of the VSS misses (first stage that explains each one)

559 of the 1140 requests are not right. Each is classified by the first stage that explains it, from the composer's units
(candidates, tried, zone, world, event, gaps) and the world's normalized tokens (classify.py). "syn" = of them, requests whose text
says a value by a synonym (section 4).

| cause | requests | % of misses | syn | examples |
|---|---|---|---|---|
| A cut: the cutter makes NO unit (every token O) | 260 | 46.5 | 13 | "Kill Process", "Erase Done", "Take that back", "Drag Done over to the right side", "Recolour all stars blue" |
| B cut: the unit leaves out part of the request | 25 | 4.5 | 6 | "Add three yellow triangles" (unit misses "triangles"), "make the last circle green" (unit "make the last circle") |
| B2 cut: one request split into two units | 4 | 0.7 | 0 | "Put a red circle in the bottom right corner" -> create + an extra move |
| C cutter: the right world not among the 3 candidates | 3 | 0.5 | 1 | "Which things link to Process?" |
| D the right world reads unknown-event / no-sense | 15 | 2.7 | 1 | "Make a copy of Done", "What is downstream of Check?", "Put the text \"approve\" on Check" |
| E the right world reads another event | 40 | 7.2 | 1 | "Can you make Done a bit larger" -> set, "what does Check say?" -> describe, "are there any cycles?" -> exists |
| F the right reading lost to another world's | 19 | 3.4 | 1 | "Draw a line between Start and Done" -> create, "How large is Process?" -> fact |
| G1 the context filler asks: the reader left a needed role empty (a description not placed) | 73 | 13.1 | 13 | "I want you to turn the gray diamond black", "put 5 purple ellipses beside the orange hexagon" |
| G2 the context filler asks: a pronoun with no context in the row (honest) | 14 | 2.5 | 3 | "could you turn it white" |
| H1 roles: a gold value is not a legend token after the world's front end | 56 | 10.0 | 9 | "upper left corner" -> left_of, "beneath" not below, "Add a box ..." -> circle |
| H2 roles: value tokens present, the reader places them wrong | 47 | 8.4 | 0 | "Link each star to the next" (chain), "Remove every shape that isn't red" (notColor lost) |
| multi-request row (not classified) | 3 | 0.5 | 0 | broad "connect Start to Process, then ..." |

Cause A is concentrated on short commands: hand 11/40, blind 17/60, broad 16/140, generated 216/900 requests.

### Why the cutter makes no unit (cutter_worlds7.json, the BIO perceptron of front.js)

Its weights on the position features (all learned from the long messages):
- the message's first token: `w-1=<s>` and `pl=<s>` each give O +7493 against B-<world> -300..+652;
- once a token is O, `pl=O` gives O +21942 against B-<world> +1000..+3530 and I -39459: a request must have a strong trigger word to
  start after an O;
- `w+1=</s>` (the last token) has weights only for I and O (O +1971): no training message has a B on its last token.
So a message that starts with its request starts with O, and then stays O unless its verb is a strong B word. "undo" alone: O 19203
vs B-history 16142 -> no unit; "undo that" -> B-history. "delete Done" -> unit; "Please delete Done." -> no unit (please is O, then
delete stays O). "Hub teal and make it large": "Hub teal" is O (a verbless request at the message start), only "make it large" is cut.
Trigger words never seen by the cutter (erase, wipe, detach: no weight at all) add nothing.

## 3. The data

| | cutter data (7 folders, train_cutter.py) | world data (DATA=spans, 9 folders) |
|---|---|---|
| messages / requests | 3640 / 18327 | 4640 / 22702 |
| words per message, median (10th percentile) | 41 (24) | 40 (26) |
| messages with one request | 53 (1.5%) | 53 (1.1%) |
| short commands (one request, at most 8 words, at most 1 word outside the span) | 32 (0.9%) | 32 (0.7%) |
| messages whose first word is inside a span | 393 (10.8%) | 831 (17.9%) |

The bench rows: median 6 words, 78% at most 8 words. Short commands are 32 of 18327 cutter requests; per action 0-7 (delete 7,
forget 3, set 4; create, connect, move, list, count, arrange, distribute, disconnect, label, resize: 0 or 1). So "short command"
style is missing for every action, not for a few; the cutter learns that a message starts and ends with text that is not a request.

The worlds read spans, and the spans are short (median 2-9 words per action; at most 8 words: connect 64%, create 34%, arrange 73%,
85-100% for the rest), so the worlds see short request text; what they do not see is a request that is the whole message (capital first word,
no lead-in).

Already written and unused: llm_train/sonnet and llm_train/haiku, 3000 LLM-written one-request lines with gold (`wire`), median 5
words, 2711 at most 8 words, 60-309 per action (e.g. "nope, undo", "sever Ned from Meg", "raise Stamp to the front"). They are the
kind of text people type in the demo. Neither the cutter nor the worlds read them: they have no `span`.

### What fixing the cut is worth (a simulation, not a model)

The composer with ONE change: when the cutter makes no unit, one unit from the token with the largest B-<world> score to the end of
the message, its worlds ranked at that token; everything else unchanged (short_bench.mjs BEST=1):

| | right / wrong / not done |
|---|---|
| written sets (240) | 62.9 / 10.0 / 27.1 -> 70.8 / 11.7 / 17.5 |
| blind | 55.0 / 5.0 / 40.0 -> 61.7 / 6.7 / 31.7 |
| all six (1140) | 51.0 / 11.0 / 38.1 -> 61.3 / 12.8 / 25.9 |

Forcing the whole message into one unit ranked at its first token is worse (all six 45.4 / 8.2 / 46.3): the world ranking at a
lead-in word ("now", "can you") is wrong. A trained cutter is needed, not a rule. After the cut, the causes left are G1 (96), H1 (66),
H2 (58), E (57), D (48): the world side, for later steps.

## 4. Value synonyms (owner's report: "create a a blue box and a red circle" -> two circles)

The rules map synonyms with hand-written lists (logic.js SHAPE_VALUES, COLOR_VALUES, size values). In the VSS worlds the value tokens
come from the LEARNED value n-grams of each world's front end (front.json `values`, FRONT_ROWS=world: learned from the world's own
rows only). Of the 28 synonyms of those lists, the world front ends map only two: "oval" -> ellipse and "big" -> large, and only in
shapes7c. "box" stays "box" in every world (shapes7c has only the n-gram "box called" -> rectangle; "box" has its own kind c7_i);
"big" is not large in links7, position7, graphq7, questions7, manage7, history7; little, grey, dot, ball, rhombus, ... are unknown words.
In the training spans the synonyms are rare except big: big 340 (vs large 439), box/boxes 42 (vs rectangle 442), oval 31, ball 7,
silver 7; the others 0-3. When the text says "box" for gold rectangle, llm_to_world.convert looks for the token "rectangle" in the
span, does not find it, and drops the shape (soft: counted as lost): the row trains a create with no shape, and the adapter's default
shape is circle.

Counted: bench requests whose text says a value by a synonym: 55 of 1140 (VSS right 7, rules right 51); the synonym is the visible
cause in 10 of them (with the cut simulated: 12), the rest are masked by an earlier cause (no unit, empty role). In the 1000-message
sample: 94 of 4858 requests (big 68, oval 9, box 6, boxes 5, ball 2, silver 2, dot 1, golden 1).

Order: AFTER the cut change. It is smaller (55 requests vs 260), its effect is mostly hidden until the cut is fixed, and it needs the
7 worlds retrained (GPU), whereas the cut change needs only the cutter (CPU). Its fix belongs in the data pipeline (convert taking
the value word the span uses as the role filler, so the world learns box = rectangle from the gold; and the front end's value
n-grams learned so that "big" is large in every world, not only where the world's own rows say it often), not in the texts and not
in a hand-written synonym table. Not established: which threshold of front.learn drops "box" -> rectangle in shapes7c (33 rows).

## 5. Pre-registration (2026-11-02, before the run): short one-request messages in the CUTTER's training data

Hypothesis: the composer misses short commands mainly because its cutter, trained only on long messages (0.9% short, 89% starting
with text outside every span), labels a whole short message O. Adding LLM-written one-request messages, with spans, to the cutter's
training data makes the cutter cut them; the worlds are not changed.

Data (no new texts; the existing pipeline's annotation step, as for llm_bench/{sonnet,haiku}_spans):
1. Source: llm_train/sonnet/train_*.jsonl and llm_train/haiku/train_*.jsonl (3000 rows, LLM-written, gold `wire`). Texts, ids and names
   are copied unchanged; the coordinator checks byte identity of the texts before and after.
2. Annotation (an LLM annotator, model Sonnet, by TRAIN_MSG_SPEC.md and LABEL_CONVENTIONS.md): each row becomes a message
   `{id, names, text, wires: [{span, trigger, type, args}]}` with `args` = the row's `wire.args`, `span` = the exact substring that is
   the request without the chatter ("nope, undo" -> "undo"), `trigger` inside the span. The label check of
   skills/llm-annotated-data/SKILL.md step 4 is run on the gold (these rows predate the 2026-10-31 rules, e.g. "line" -> arrow none);
   fixes are listed in a LABEL_FIXES.md as for the spans sets. A row the annotator cannot span is reported, not dropped silently.
   Output: llm_train/sonnet_short/msg_*.jsonl, llm_train/haiku_short/msg_*.jsonl.
3. No quota, no padding: all 3000 rows as written (60-309 per action).

Build (CPU, minutes; no GPU):
- train_cutter.py: add "llm_train/sonnet_short", "llm_train/haiku_short" to DIRS behind a switch (e.g. SHORT=1), default unchanged.
- `SHORT=1 python3 training/sketch/train_cutter.py --worlds training/sketch/worlds_micro/GROUPS_7.json --out docs/model/micro/cutter_worlds7s.json`
- docs/model/micro/registry_short.json = registry.json with "cutter": "micro/cutter_worlds7s.json" (worlds, fallback, context, event
  cutter unchanged: one change).

Measure:
- short sets: `cd training/sketch/short_bench && REGISTRY=../../../docs/model/micro/registry_short.json node short_bench.mjs out_short.json;
  python3 agg.py out_short.json; python3 classify.py out_short.json` (the script of section 1), against the baseline above;
- long messages: `REGISTRY=docs/model/micro/registry_short.json PAIR=value SEG=composer node training/sketch/llm_score.mjs <the 9 sampleF folders>`
  against 74.9 / 13.1 / 12.0, extra 302.

Threshold ("it worked" = all of these):
- written sets (240 requests): right at least 67.9% (baseline 62.9, +5 points; the simulation gives 70.8), wrong at most 12.5% (10.0);
- all six sets (1140): right at least 57.0% (51.0), wrong at most 13.5% (11.0); requests of cause A at most 80 (260);
- 1000-message sample: right at least 74.4% (74.9 - 0.5), wrong at most 13.6% (13.1 + 0.5), extra at most 332 (302 + 10%).
Miss -> stop and report; no second try with other data in the same run.

Not established: whether the annotator keeps lead-in words ("could you", "please") in the span as the long data do (TRAIN_MSG_SPEC.md
example keeps "Could you"); the annotation spec must say it, as the long data's convention. The event cutter (cutter_events.json) has
the same training data and likely the same bias at the message start; it only gives the hint of an already cut unit, so it is left
for a separate step.
