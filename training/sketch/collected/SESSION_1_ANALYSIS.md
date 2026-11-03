# Session 1: the owner's first real session with the demo (2026-11-03, 10:54-11:03 UTC)

Source: `sop-requests-2026-11-03-1303.jsonl` (format `sop-collect/2`, `training/sketch/COLLECT_FORMAT.md`), 26 messages: 22 spoken in the dock
with dictation language ro-RO and translated on the device (`by: builtin`, none edited), 3 typed in English, 1 reply chip. Tab: VSS-BERT
(`combined`). Models: `combined` 579b1dfc36, `neural` fd69a08c3b, `micro` cbbd85b5 (the shipped ones: `docs/model/versions.json` gives the
same versions today). **The gate of VSS-BERT was on "execute all" in that browser**: every reading ran, even at confidence 0.

The test set made from it: `training/sketch/llm_bench/collected_1` (ids `col-0001..0026` = turns 2..27 as sent; `colc-0001..0026` = the
same turns in corrected English). Ids below are the `col-` ids; "turn" is the turn number of the collected file.

## How the readings were recomputed

- `training/sketch/combine/collect_pair.mjs` (the records of the demo's VSS-BERT: SOP-BERT on its own cut, VSS on the BERT cut) and
  `training/sketch/combine/failures_vss_bert.mjs` (the shipped `docs/model/confidence/combined.json`, applied as the demo applies it), at the
  default level `cost` (threshold **0.9488**). The demo's spell checker (`docs/js/spell.js` with `docs/model/spell/vocab.json` and the legend's
  words) runs before every reader, so the texts were also run after the spell checker: it changed 5 texts ("Hello" -> "Help", "muh" -> "uh",
  "surfaces" -> "places", "unites" -> "cites", "settlement" -> "element").
- With the spell checker, the recomputed confidences equal the recorded ones on 21 of 25 messages (to 4 decimals; turn 4: 0.2331 vs 0.2333,
  turn 15: 0.9567 vs 0.9575; turns 9, 10, 11 differ more: the collectors start from an empty conversation context, the demo had the earlier
  turns). The gate verdict is the same on every message.
- Readers alone: the collectors of job 072 (`training/sketch/fresh2/collect_vss.mjs`, `collect_sop.mjs CUTS=own`, `collect_rules.mjs CUTS=own`).
  Scratch records: not kept in the repository (rerun with the commands in the last section).

## Turn by turn

"Gate at default": what VSS-BERT at the default level (0.9488) would have done with the reading the demo made. "Cause": the first cause in
the pipeline order (speech -> translation -> spell checker -> cut -> reader -> missing data form -> engine -> layout) whose fix makes the
request right or honest; a second cause in brackets.

| id (turn) | Romanian as recognized → English sent | what the owner meant | speech error | translation error | VSS-BERT read and did (execute all) | gate at default | cause |
|---|---|---|---|---|---|---|---|
| col-0001 (2) | "Hello Make me to squares and The traingle The Shape of Circle" → same | create 2 squares and a triangle; "the shape of circle" unclear (laid out in a circle, or a third shape) | spoken in English into the ro-RO recognizer: "to" = two, "The traingle The Shape of" garbled | none (English in, English out) | spell "Hello" → "Help"; read `set shape=square` (0.31), `property … circle` (0.30), `rename make → squares`, `connect …` (0): nothing drawn, "Which shape should I change?" | held all | **speech** (reader: "make me a X" read as set) |
| col-0002 (3) | "Fă mi un triunghi galben" → "Make me a yellow triangle" | create a yellow triangle | none | none | `set color=yellow shape=triangle` (0.41): "Which shape should I change?" | held | **missing data form**: "make me a <shape>" = create (Rules, VSS, SOP-BERT all read set) |
| col-0003 (4) | "în un triunghi galben legat cu o linie de rombul ok" → "in a yellow triangle linked with a line of OK rhombus" | create a yellow triangle and connect it with a line to Check (the "ok?" diamond) | "în" for "și" / "Fă-mi" | "de rombul" → "of" (should be "to the") | `create triangle yellow` (0.23): drew triangle1; the connect was never a request | held (the create, a right reading) | **cut**: "… linked with a line to …" stays inside the create's unit in every reader, also in corrected English (translation, speech) |
| col-0004 (5) | "muh creangăl One near the romb" → "muh crangăl one near the rhombus" | move triangle1 near Check | "mută triangle one" → "muh creangăl One" | none | spell "muh" → "uh"; `create diamond near the oldest diamond` (0.40): drew diamond1; `list near …` (0) | held | **speech** (corrected: every reader right; SOP-BERT/VSS-BERT 0.94, held just under the threshold) |
| col-0005 (6) | "mută triunghiul galben lângă sub Diamond One" → "Move the yellow triangle next to under Diamond One" | move the yellow triangle below diamond1 (self-correction "next to … under") | "Diamond One" for the name diamond1 (dictation writes numbers as words) | none | `move target=mention() anchor=mention(color=orange,shape=triangle) near` (0.50): "Which shape?" | held | **missing data form**: a name dictated as words ("Diamond One"), a position self-correction; SOP-BERT read "yellow" as orange |
| col-0006 (7) | chip "diamond1" | the answer to "Which shape?" | - | - | handled as the answer to the question (no reading in the decision): "Done." | - | none (a chip answer; not a request on its own; marked `meta: chip`) |
| col-0007 (8) | "așează toate elementele sub forma unui cerc" → "Place all the elements in the form of a circle" | arrange everything in a circle | none | none | `set shape=circle target=all` (0.51) + `create circle` (0): drew circle1, "MainTitle is a text; a text can't become a circle" | held | **missing data form**: "place … in the form of a <layout>" = arrange (Rules: move; VSS: create circle) |
| col-0008 (9) | "nu am spus să desenez un cerc schimbă așezarea de auto" → "I didn't say to draw a circle change the car laying" | complaint about turn 8 + "change the layout to automatic" (arrange, no layout) | none (or "de tot" misheard) | "așezarea de auto" → "the car laying" | units "the" (0.06) and "laying" (0.14): arranged 7 shapes as a tree, took Start, Process, Done … off their zones | held | **translation** (missing data form: a complaint followed by the wanted command; corrected English still read as `set` / `create circle`) |
| col-0009 (10) | "mărește suprafețele unul rece și doi review ca să acopere tot spațiul" → "Increases surfaces one cold and two reviews to cover all the space" | enlarge the two zones ("1 · receive", "2 · review") to cover the whole canvas | "1 · receive" → "unul rece" | "rece" → "cold", "review" → "reviews" | spell "surfaces" → "places"; `distribute target=all` (0.75 recomputed) + `improve`, `label`: "Spaced 7 shapes evenly", "Which shape should I label?" | held | **speech** (translation; missing data form: zones named by their captions' words; engine: no "fill the canvas") |
| col-0010 (11) | "conectează toate elementele" → "Connect all items" | connect every element (the owner then saw a chain) | none | none | `connect` without from (0.12; SOP-BERT drops "all items") + a VSS `set all` (0): connected Done → triangle1 → diamond1 (the chain), "What should change about …" | held | **missing data form**: "connect all" (the Rules read it right: from=mention(quantifier=all)) |
| col-0011 (12) | "așează toate elementele pentru a forma un triunghi virtual" → "Place all the elements to form a virtual triangle" | arrange everything on a triangle | none | none | `set shape=triangle target=all` (0.47) + `move all` (0.09): "a text can't become a triangle", "Where should Backdrop go?" | held | **engine**: no triangle layout (legend: row, column, grid, circle, tree, layers, radial, organic; templates) (+ the missing form of turn 8) |
| col-0012 (13) | "așează boxurile din fundal ca să ocupe tot ca în vasul" → "Place the background boxes to occupy everything as in the vessel" | stretch the panels (Backdrop, the zones) over the whole canvas | "tot canvasul" (the whole canvas) → "tot ca în vasul" | follows the speech error ("vessel") | `arrange target=all rectangles` (0.47): "Arranged 1 shape as a grid"; `move all` (0.03): "Where should Backdrop go?" | held | **speech** (missing data form: the panels as a description; engine: no "fill the canvas") |
| col-0013 (14) | "am zis Canvas nu ca vase" → "I said canvas not as vessels" | a correction of the recognizer's word in turn 13 | - | - | nothing read: "I couldn't turn that into anything I can do." | - | none (honest; `meta: complaint`) |
| col-0014 (15) | "șterge boxurile din fundal" → "Delete background boxes" | delete the three panels Backdrop, IntakeZone, ReviewZone | none | none | `delete target=mention(quantifier=all,shape=rectangle)` (**0.96**): "Removed the links Start–Process and Process–Check. Deleted Backdrop, IntakeZone, ReviewZone and **Process**." | **executed: a confident, destructive mistake** (0.9567 ≥ 0.9488) | **missing data form**: "background" is dropped, the legend has no mention by layer, so "boxes" = every rectangle (+ engine: the mention filter does not read `layer`; gate policy) |
| col-0015 (16) | "Unește elegant toate boxurile" → "Elegantly unite all the boxes" | ambiguous: connect them nicely, or bring them together (a tidy layout); "boxes" = every element | none | none | `untangle all rectangles` (0.28) + `set` (0): "There are no rectangles on the canvas." | held | **reader**: an ambiguous request read as an action (should ask) |
| col-0016 (17) | "Unește elegant toate elementele diagrame" → "Elegantly unites all elements of diagrams" | as turn 16 | none | "unites" (3rd person) | spell "unites" → "cites"; `arrange` (0.18) + `fit` (0.01): "Arranged 6 shapes as a tree … They do not all fit on the canvas without touching." | held | **reader** (spell checker) |
| col-0017 (18) | "îmbunătățește le altul" → "improve them another" | improve the layout (again / differently) | "altul" for "altfel" | "another" | `improve target=all` (0.36): "removed overlaps: 71.5 → 94.4/100" | held (a right reading) | none (right; the gate is too careful here) |
| col-0018 (19) | "așezarea" → "the settlement" | "the layout": a fragment continuing turn 18 | none | "așezarea" → "the settlement" | spell "settlement" → "element"; a reading without action (0.16): "There is no shape named element" | held | **translation** (spell checker); `meta: fragment` |
| col-0019 (20) | "layout" → "Layout" | the word alone; the intended "improve the layout" is typed in turn 21 | English into ro-RO | none | `arrange` (0.87): "Arranged 6 shapes as a tree." | held | **reader**: a one-word fragment read as an auto layout (mild); `meta: fragment` |
| col-0020 (21) | typed "improve layout" | improve the layout | - | - | `improve target=all` (0.90): "the score went from 84.1 to 92.7/100" | held (a right reading) | none (right; held at default) |
| col-0021 (22) | "șterge Order flow" → "Delete Order Flow" | delete the title text (MainTitle, words "Order flow") | none | none | `delete target=Order` (0.49): "There is no shape named Order" | held | **missing data form**: a text reached by its words (+ engine: no mention by label; the readers see names, not the texts' words) |
| col-0022 (23) | "delete orderflow" → "Delete Orderflow" | the same | the recognizer joined "order flow" | none | `delete target=Orderflow` (**0.947**): "no shape named Orderflow" | held, by 0.002 | **speech** (+ the form of turn 22) |
| col-0023 (24) | typed `delete "order flow"` | the same | - | - | SOP-BERT `label label="order flow"` (0.49), VSS `forget` (0.0005): "**Forgot all default rules.** Which shape should I label?" | held | **missing data form**: a quoted reference; VSS reads `forget` (destructive) |
| col-0024 (25) | typed `remove "Order flow"` | the same | - | - | the same: **forgot the default rules** again, asked which shape to label | held | **missing data form** (as turn 24) |
| col-0025 (26) | "Adaugă un element text pe care să scrie hello World" → "Add a text item to write Hello World" | a free text "Hello World" | none | "pe care să scrie" → "to write" (should be "that says") | `create` without shape (0.38): drew circle2 | held | **translation** (corrected "Add a text element that says Hello World": SOP-BERT and VSS-BERT right, 0.74, held) |
| col-0026 (27) | "ai desenat un cerc Trebuia un element text" → "you drew a circle needed a text element" | complaint + "I needed a text element" (with the words of turn 26) | none | subject dropped ("I needed") | spell/cut drop "you"; `create circle` (0.29): drew circle3 | held | **missing data form**: a complaint and the wanted command ("you drew X, I needed Y" = Y) |

What happened in the session with "execute all": 16 messages changed the drawing or the rules; 5 of these changes match what the owner
asked (triangle1 in turn 4, the automatic tree layout in turn 9, the chain of connections in turn 11 — in the demo the context filler gave
the connect its shapes; the recomputed reading without the conversation has none —, the improves in turns 18 and 21); the others drew shapes nobody asked for (diamond1, circle1, circle2, circle3), moved everything (tree
layouts, an even spread, a grid), deleted Process with its two links, and forgot the default rules twice. **At the default level, VSS-BERT
would have executed exactly one request of the 26 messages, and it is the destructive mistake of turn 15**; it would have held the 3 right
readings (0.23, 0.36, 0.90) and everything else.

## Causes

Primary cause per message (26 messages):

| cause | messages | ids |
|---|---|---|
| missing data form (a construction the learned readers never saw, or a legend form that does not exist) | 9 | col-0002, 0005, 0007, 0010, 0014, 0021, 0023, 0024, 0026 |
| speech recognition | 5 | col-0001, 0004, 0009, 0012, 0022 |
| translation | 3 | col-0008, 0018, 0025 |
| reader (an ambiguous request or a fragment read as an action) | 3 | col-0015, 0016, 0019 |
| cut | 1 | col-0003 |
| engine (no such operation) | 1 | col-0011 |
| layout | 0 | (turn 17: the tree "does not all fit without touching"; turn 9 took shapes off their zones: as designed, HIGH_LEVEL_OPS.md section 2) |
| none (right reading, honest answer, or a chip) | 4 | col-0006, 0013, 0017, 0020 |

Involved at all (primary or secondary): missing data form 14, speech 6, translation 5, engine 5 (no `layer` / `label` in the mention filter
for 0012, 0014, 0021-0024; no triangle layout; no "fill the canvas"), the spell checker 4 (0001 "Hello" → "Help", a help lead; 0009, 0016,
0018), reader 4, cut 1.

Of the 22 requested actions (as sent), 7 need a form the legend does not have today (col-0011 layout triangle; col-0012, 0014 mention by
layer; col-0021..0024 mention by label) and one more (col-0009) names the zones only by their captions' words: **at most 14 of 22 can be
done right by any reader today**.

## Fixes, ranked by impact

1. **Gating policy for destructive actions.** The only request the default gate lets through was the worst one: `delete` of a description
   that resolved to 4 shapes, including one the owner did not mean (Process, with its two links). `forget` was produced twice from a delete
   with a quoted name. Proposals: (a) the "execute all" level never executes `delete`, `forget`, `disconnect`, `ungroup` or an `undo` read
   from a non-undo message; (b) at every level, a destructive request whose target is a description (a mention) that resolves to more than
   one shape, or that resolves to shapes the words do not name, asks first with the list ("Delete Backdrop, IntakeZone, ReviewZone and
   Process?"); (c) the cost of a destructive mistake is higher than 10 right answers: a per-action threshold (the levels in combined.json
   `cost` and `cost20` are the same threshold today, 0.9488, so a higher global cost does not help). (a) and (b) are UI/engine policy, no
   training.
2. **Two mention keys the engine and the data need: `layer` and `label`** (both are legend keys already; only the mention filter
   `logic.js filterShapes` does not read them). `mention(layer=background,…)` = every panel (layer background or zone: what the user sees
   behind the items), `mention(layer=zone,…)` = the zones; `mention(label=<words>)` = the shape or text item whose words match (case and
   punctuation ignored). They fix 7 messages of this session (the panels: turns 13, 15; the title by its words: turns 22-25) and make the
   turn-15 mistake impossible. The readers also need the texts' words: the readers see `names` only; the context filler (or `names` with
   the labels) must carry the words of the text items. Data: `training/sketch/llm_train/opus_r3_gaps` batch 02 (31 messages).
3. **Data forms for the learned readers** (`opus_r3_gaps`, 136 messages, 147 requests): "make me a <shape>" = create (turns 2, 3; every
   reader reads set); "place / put / arrange all the elements in the form / shape of a <layout>" = arrange (turns 8, 12; Rules read move,
   VSS create); "a text element / item / box that says X" = free text (turns 26, 27); "connect all (the elements)" = connect
   from=mention(quantifier=all) (turn 11; SOP-BERT drops the target); "join / unite A and B" = connect; complaints with the wanted command
   ("I didn't say X, I meant Y" = Y; turns 9, 27); "X linked with a line to Y" after a verbless create (turn 4, the cut).
4. **Speech and translation mitigations** (front end, measured before and after on this file):
   - the canvas vocabulary for the recognizer and a post-correction toward it: the names (diamond1, triangle1: "Diamond One" and "triangle
     one" are dictation's way of writing them; a mechanical step like the digits of VSS_READER_SPEC.md: "<word> one" → "<word>1" only when
     that name is on the canvas) and the texts' words ("unul rece" → "1 · receive", "orderflow" → "Order flow");
   - the dictation language: the owner spoke English into the ro-RO recognizer twice (turns 2, 20): an "auto" or bilingual option, or
     sending the recognized words untranslated when they are already English;
   - the translation: words of the diagram vocabulary that the translator gets wrong in this session ("așezarea" → "settlement",
     "auto" → "car", "pe care să scrie" → "to write", "de" → "of"): show the English before sending when the translator's output has words
     that none of the readers knows (they were held anyway), and collect the user's edits (the dock already allows editing; none were made);
   - the spell checker turned real words into other words: "Hello" → "Help" (a help lead), "surfaces" → "places", "unites" → "cites",
     "settlement" → "element". Real English words must be `keep` words (vocab.json keeps only words of 2+ training messages); an English
     word list for `keep` is a data fix, not a reader change.
5. **Engine.** A triangle layout (and the other outline forms people say: triangle, star, square/frame) as `arrange layout=`; "make the
   panels cover the canvas" (a resize to the canvas box; today `fit` moves shapes, `resize` scales by 1.5). Both are legend values plus a
   geometry, no reader change.
6. **Gate calibration on short commands.** Right readings were held at 0.90 ("improve layout"), 0.94 ("Move triangle1 near the rhombus",
   corrected) and 0.74 ("Add a text element that says Hello World", corrected). combined.json was fitted on fresh2 (long messages); the
   job-072 refit (fresh2 + short3) and this file as a further check.
7. **Collection.** Store the question a chip answers (turn 7 is an answer, not a request) and the words of the text items next to `names`
   (turns 22-25 cannot be annotated or read without them; here they came from `docs/js/start-diagram.js`).

## Measurement on collected_1 (the shipped readers)

Rows = situations, columns = readers. "right / wrong / not done" are shares of the 22 requested actions when the reader executes everything
it reads (PAIR=value pairing, bench-canon form, as short3 in job 072); "extras" = requests read that nobody asked for (meta messages
included). VSS-BERT at its default level: the shipped combined.json, level `cost` (0.9488), on the BERT cut.

| situation (26 messages, 22 requests) | Rules | VSS | SOP-BERT | VSS-BERT, executing everything | VSS-BERT at its default level |
|---|---|---|---|---|---|
| as translated (the English sent) | right 14% · wrong 32% · not done 55% · extras 9 | right 9% · wrong 27% · not done 64% · extras 8 | right 14% · wrong 36% · not done 50% · extras 17 | right 14% · wrong 36% · not done 50% · extras 29 | done right 0% · confidently wrong 100% of executed (1 of 1) · held 45% (10; 3 of them right) |
| corrected English | right 23% · wrong 36% · not done 41% · extras 12 | right 18% · wrong 27% · not done 55% · extras 8 | right 32% · wrong 32% · not done 36% · extras 14 | right 32% · wrong 32% · not done 36% · extras 24 | done right 0% · confidently wrong 100% of executed (1 of 1) · held 59% (13; 7 of them right) |
| as the demo read it (the English sent, after the spell checker) | right 14% · wrong 32% · not done 55% · extras 9 | right 9% · wrong 27% · not done 64% · extras 8 | right 14% · wrong 32% · not done 55% · extras 16 | right 14% · wrong 32% · not done 55% · extras 29 | done right 0% · confidently wrong 100% of executed (1 of 1) · held 41% (9; 3 of them right) |

Reading: correcting speech and translation more than doubles what the learned readers get right (SOP-BERT and VSS-BERT 14% → 32%), and the
rest is mostly forms the readers never saw or the legend lacks. At the default level VSS-BERT executes one request in each situation, the
delete of turn 15, and it is wrong. The one executed mistake is a small number on 26 messages; it is reported because it is the case the
main metric is about.

## Reproduce

```
python3 training/sketch/collect_to_bench.py <the jsonl> --out training/sketch/llm_bench/collected_1        # done; gold added after
# a data dir per situation: batch_01.jsonl (as sent), batch_02.jsonl renamed batch_01.jsonl (corrected), and the spell-checked as-sent texts
node training/sketch/combine/collect_pair.mjs <rec>/<sit> pair <data dir>
node training/sketch/combine/failures_vss_bert.mjs <rec>/<sit> <out.json> <data dir>
node training/sketch/fresh2/collect_vss.mjs <out>/vss_arm.jsonl <sit> <data dir>
CUTS=own node training/sketch/fresh2/collect_sop.mjs "<out>/sop_arm_%CUT%.jsonl" <sit> <data dir>
CUTS=own node training/sketch/fresh2/collect_rules.mjs "<out>/rules_%CUT%.jsonl" <sit> <data dir>
```
The spell-checked texts: `docs/js/spell.js` `create({params, words: vocab.words + legendWords(engine.legend), keep})`, `check(text, {names})`,
as `docs/js/ui.js` does.
