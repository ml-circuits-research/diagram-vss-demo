# short3: short commands as real users type them (2026-11-02)

530 messages (s3-0001 .. s3-0530), 666 gold requests (wires): 510 in SOP Lang, 156 pending (op families whose SOP Lang form is not
defined yet). Written by one Opus agent, blind to the Rules reader's cues and to every training set (exposure log below).

Files
- `texts/texts_01.jsonl`: id and text only, saved before any annotation was written.
- `batch_01.jsonl`: id, domain, names, text, wires; same format as `../fresh2/*/batch_01.jsonl`. The texts are identical to
  `texts/texts_01.jsonl` (checked by script after the label check).

## What the messages are

- Short and clipped, like real use: 408 messages with 1 request (77%), 108 with 2, 14 with 3. Typos ("delte start", "conect procss
  w/ done", "triangel", "renmae"), lowercase, no punctuation, fragments ("Done red", "bigger", "line them up", "row: process, check,
  done"), arrows as shorthand ("start → orange", "start -> check"), polite ("Could you add a teal diamond between Process and
  Check?"), non-native ("a orange square please named Box2 left of Start"), dictation-like run-ons ("check up 40px pls and process
  down 40px").
- Drawing: the opening drawing Start, Process, Check, Done linked Start→Process→Check→Done. Other names exist only when the message
  creates them, or when `names` lists them (the groups Intake and Core, for 9 messages that presuppose a group). `names` = the shapes
  and groups that exist before the message, as in fresh2.
- Variety checks (script, before annotation): no two messages within a small edit distance (Levenshtein ≤ 3 or < 25% of the length,
  after lowercasing and removing punctuation), except the bare words "undo", "redo", "help", which cannot differ. Every message was
  also compared with the 94 example sentences of the user help (`docs/js/help.js`): about 70 first drafts were near copies of help
  examples (written right after reading the help) and were rewritten before annotation; "undo", "redo" and "Done red" (a ≤ 3-character
  distance from "Done is red") were kept on purpose.

## Gold

Wires as in fresh2: `{"span", "trigger", "type", "args"}`, args with the legend keys only (names as comma lists, descriptions as
`mention(...)`, `$new` for the shapes made or copied by an earlier wire of the same message). Where the SOP Lang form does not exist
yet the wire is `{"span", "pending": "<op family>", "intent": "<plain description>"}`: no type, trigger or args were invented for it.

Conventions I had to choose (not seen in the 5 fresh2 items I looked at; the coordinator may normalise them):
1. Only what the message says. No default values (no `axis=horizontal` for a plain "align"). A target outside the message ("bigger",
   "line them up", "space them evenly", "make it black instead") is left out, for the reasoning layer; a referent inside the message
   is resolved ("rename Done to End and make it a star" → target End; "copy check and put the copy below done" → `$new`).
2. Sizes from the help's numbers: bigger / larger / increase = scale 1.5, smaller / shrink = 0.67, twice / double = 2, triple = 3,
   half = 0.5; "big" = `size=large` (a set, not a resize).
3. "line" (without "arrow") = `arrow=none`; "two way" / "both directions" = `arrow=both`; "box" = rectangle; "dot", "round" = circle;
   "node" = no shape.
4. `at` written as "x,y".
5. Label of an existing arrow: `action=label` with `from`/`to`; removing it `label=""`. Its question: `ask=property property=label
   from/to`.
6. All arrows of one shape: `action=disconnect target=<shape>`; every arrow: `quantifier=all`.
7. Questions: `connected` target+anchor and `check ... comparison` target+anchor as in fresh2; `path` from/to; `reachable` from;
   `nearest` anchor; `count` of shapes / arrows / groups with `kind=shape|edge|group`; "how many connections does X have" = `degree`.
8. Facts: type `fact` with target and the stated values ("Done and Start are connected" → `linked=Start`). Rules: type `rule` with the
   shape filter and values; "forget the rules" = `action=forget`.
9. Several new shapes with their own names ("create Api and Db squares") = one create wire per shape.
10. Plural descriptions get `quantifier=all` ("remove all the stars", "the small squares"); "the circle I just made", "the last one I
    added" get `recency=newest`.
11. Trigger of a message without a verb = the value word ("Done red" → red, "check large" → large).
12. Arranging the whole drawing as a row, column, grid or circle ("grid everything", "everything in a ring") is the defined `arrange`
    action with `target=mention(quantifier=all)`. The pending `relayout` family covers what arrange cannot do: tree, layered /
    flowchart (with a direction), radial around a shape, tidy / clean up / improve / auto layout, more or less space, compact, center,
    fit to screen, straighten, untangle.

## Counts

By wire family (666 wires):

| Family | Wires | | Family | Wires |
|---|---|---|---|---|
| connect (style, heads, colour, label, chain, one-to-many) | 54 | | label a shape | 20 |
| question (17 kinds of ask) | 52 | | delete | 19 |
| recolor | 46 | | undo / redo | 18 |
| create one shape | 45 | | change kind | 17 |
| move | 41 | | create several in a layout | 17 |
| resize (scale or size) | 32 | | groups (group 11, ungroup 5) | 16 |
| align / arrange / distribute | 28 | | label an existing arrow | 15 |
| rename | 15 | | z-order | 14 |
| outline | 13 | | disconnect | 13 |
| rule (incl. forget) | 10 | | duplicate | 9 |
| fact | 8 | | swap | 5 |
| set with several values | 3 | | | |
| **pending: relayout** | 44 | | **pending: help** | 28 |
| **pending: template** (cycle, pyramid, funnel, timeline, hub and spoke, Venn, matrix, process steps, hierarchy, staircase, radial list) | 40 | | **pending: free text** (titles, headings, notes, captions) | 21 |
| **pending: edge restyle** (style, colour, heads, direction, width of an existing arrow) | 11 | | **pending: background** / **layers** | 8 / 4 |

"all / everything" appears in 52 wires. Messages: 130 are pending only, 11 mix pending and defined wires, 389 have no pending wire.
Messages by the topic they were written for: create 22, create several 14, delete 12, duplicate 6, move 18, swap 4, recolor 18,
kind 8, size 16, outline 8, rename 8, label 10, connect 22, disconnect 8, arrow label 10, arrow restyle 8, groups 10, z-order 7,
align/arrange 18, undo/redo 10, questions 38, facts 8, rules 8, re-layouts 30, free text 14, templates 26, background/layers 10,
help questions 24, 2–3 requests 135.

Split (fresh2 rule, `int(sha256(id), 16) % 3 == 0` → calibration): calibration 178 messages, 219 wires (59 pending); test 352 messages,
447 wires.

## Label check (second pass, by the writer)

Every message with a defined wire (400 messages) was re-read with its gold. Changes made: 4 triggers, no values. s3-0079 "hexagon for
start" for → hexagon; s3-0057 "red for check" red for → red; s3-0299 "done in gold" in gold → gold; s3-0041 "i want Start to be
brown" to be → want (trigger convention 11). Left as written and flagged:
- s3-0315 "Done on top" (toFront) and s3-0516 "start should be on top" (move, `position=top`): both readings are possible for both.
- s3-0476 "put "no" on the line from Check to Process" and s3-0348 "check -> process should be labeled no": the opening drawing has Process→Check,
  not Check→Process; the gold is what was asked.
- s3-0002 "put a pale blue rectangle behind everything as a background panel": pending background; it could also be read as create + toBack
  ("pale blue" is not a legend colour).

## Exposure log (what the writer read and did not read)

Read:
- `AGENTS.md`; `../fresh2/README.md`; `docs/js/help.js` in full (its prose and its 94 example sentences).
- The JSON structure of 5 fresh2 items in `../fresh2/opus_a/batch_01.jsonl`, printed with `text` and `span` masked: fo-0001..0004
  (their 12 trigger words were printed too) and fo-0083 (trigger masked as well). fo-0083 was picked by a script that scanned the args
  of all opus_a wires for the item covering the most wire kinds; only that one item was printed.
- The legend as the help's SOP Lang page lists it: `docs/js/logic.js` was loaded with node (not opened) to print the keys, their kinds
  and value names, the wire types and the plugin names. Cue words were not printed.
- The Rules reader run on the help's own example sentences (what the help's SOP Lang page does for its worked examples), to see the
  wire shape. Those outputs drop names and read several questions differently from the help, so they were not used as gold.
- Directory listings of `training/sketch/llm_bench/` and `docs/js/`.

Not opened: the source of `docs/js/logic.js`; `training/sketch/llm_train/**`; `training/sketch/synth/**`;
`training/sketch/ops/formulations.jsonl`; any `test_*.mjs`; the texts of fresh1 / fresh2 or any other test set; `SPEC.md`,
`TRAIN_MSG_SPEC.md`, `LABEL_CONVENTIONS.md`; any reader, model or result.
