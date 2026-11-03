# LEGEND_EXT: free text, layers, templates, the help world, the opening drawing

Owner's requests of 2026-11-02 22:31 and 22:35. This document is the design; the engine and the Rules reader implement it
(`docs/js/logic.js`), with the geometry and the help answers in standalone modules. The learned readers (VSS, SOP-BERT) do not read the
new forms yet: section 7 is the data they need.

Files:

| file | what |
|---|---|
| `docs/js/templates.js` | template geometry: items + params + box -> shapes, texts, links (pure; 24 templates, 12 colour schemes, placement, names) |
| `docs/js/help-answers.js` | help wire + legend -> answer text and example sentences (pure) |
| `docs/js/start-diagram.js` | the opening drawing as SOP Lang wires (4 levels: background, zones, items, texts; 2 groups) |
| `docs/js/logic.js` | legend keys and values, engine (z-bands, panels, free text, templates plugin, help plugin), Rules reader of the three forms |
| `docs/js/ui.js`, `docs/index.html` | drawing free text, fills, quiet template shapes; the opening drawing; help example buttons |
| `docs/js/help.js`, `docs/js/docs.js` | help topics (free text, help questions), Templates page, capabilities, key groups |
| `training/sketch/test_templates.mjs`, `test_help_answers.mjs`, `test_start_diagram.mjs` | tests (section 10) |

## 1. Three decisions

1. **Free text is a shape kind, not a new wire type**: `shape=text`. Every existing action works on it unchanged (move, set, resize,
   label, delete, toFront, group, align), and so do names, mentions by name, undo. Only what makes no sense is refused (connect, turning
   a text into a shape or back).
2. **Templates are values of one key, `template`, used by two existing actions**: `create` (draw the form from texts) and `arrange` (lay
   existing shapes out in the form). Not one action per template: the trigger of "make a timeline of A, B" is the verb (make, draw, lay
   out); the template is a noun, i.e. a value. A learned reader then learns 24 values of one key, not 24 verb kinds; a new template is a
   legend value plus a geometry function, no new action; the help lists it at once. The engine picks the handler by the more specific
   `when` (`{action: create, template: true}` beats `{action: create}`), so nothing else changes.
3. **Help is a question**: `question ask=help topic=… aspect=… about=…`. It never changes the drawing. The answer is generated from the
   legend, the plugins and the help pages, never written per question.

## 2. Free text, panels and z-bands

### SOP Lang

```
@s1 command action=create shape=text label="Q3 roadmap" size=large color=red position=top     # a free text
@s2 command action=move target=text1 position=bottomRight                                    # moved like a shape
@s3 command action=set target=text1 color=blue size=huge                                     # colour; size = the font size
@s4 command action=label target=text1 label="Q4 roadmap"                                     # its words: the label of a text item
@s5 command action=delete target=text1
@s6 command action=create shape=rectangle name=Lane layer=zone fill=light width=300 height=120 position=bottom   # a zone
```

New legend values and keys (shapes plugin):

| key | kind | values (Rules cues) |
|---|---|---|
| `shape` | enum | + `text` (texts, title, heading, headline, caption, subtitle) |
| `width`, `height` | number | pixels: an explicit box for any shape (panels, templates) |
| `fill` | enum | solid (opaque, filled), light (pale, light, pastel, see-through, translucent), faint (very light, faint, washed out), none (hollow, empty, unfilled, transparent, outline only) |
| `layer` | enum | background (background, backdrop), zone (zone, panel, container, area, lane, swimlane), item |

How a free text differs:
- a **label** is text written inside a shape: part of it, moves with it, shortened with "…" to fit, its colour chosen for contrast;
- a **name** is the handle above a shape, used to point at it; it is not content;
- a **free text** is an item of its own: its own name (text1, …), its words (`label`), a font size (`size`: tiny 12, small 14, medium
  18, large 26, huge 36 px), a colour (default black), a place (default: a free spot near the top centre); no body, no outline, no
  name tag on the canvas; arrows do not attach to it. Its box is estimated from the words (0.56 em per character), so placement and
  collisions use its real size.

### Engine semantics

- `dims(s)`: a text -> the box of its words; a shape with `w`/`h` -> that box; otherwise the size as before.
- **z-bands**: the z-order is still one list (`state.shapes`, back to front) and `toFront`/`toBack` still move across everything (as
  in PowerPoint). A NEW item is inserted on top of its own band: background (0) < zone (1) < item (2) < text (3). Without layers and
  texts every item is band 2 and the old behaviour (push to the end) is unchanged.
- **Panels are not obstacles**: placing a new shape ignores shapes of layer background or zone (items go on them, not around them).
- `arrange`, `align`, `distribute` leave panels out when the targets also contain ordinary items (a background never joins a row).
- `set size=…` on a shape with an explicit box drops the box; `resize`/`scale` scales `w`/`h`; `width=`/`height=` set them.
- `toBack` of several shapes (a group) now keeps their relative order (it used to reverse it; found by the z-order tests).

## 3. Templates

### SOP Lang

```
@s1 command action=create template=timeline items=Kickoff,Design,Build,Launch title="2027"
@s2 command action=create template=heart items=Trust,Care,Joy scheme=warm position=topRight size=small
@s3 command action=create template=process count=5 axis=vertical
@s4 command action=create template=balance items=Cost,Risk items2=Speed title="Build or buy"
@s5 command action=create template=hierarchy items=CEO,CTO,CFO,Dev parents=CEO,CEO,CTO
@s6 command action=arrange template=cycle target=Start,Process,Check,Done
```

Keys (templates plugin; `TemplateKit.legend()` is the single source):

| key | kind | meaning |
|---|---|---|
| `template` | enum | the form (24 values, below) |
| `items` | texts | the texts, in order |
| `items2` | texts | a second list: the other side (bridge, balance), roots (tree), lower glass (hourglass), axis names (matrix), shared middle (venn), base (pillars) |
| `title` | text | a heading, or the centre / goal / deck / roof, depending on the form |
| `parents` | texts | hierarchy: the parent of each item after the first |
| `scheme` | enum | classic, warm, cool, ocean, forest, earth, sunset, love, calm, mono, rainbow, bold (colour names of the palette only) |
| reused | | `color` (one colour for all items), `size` (how much of the place: tiny .4 … huge 1.0, default large .92), `position` / `region` / `at` / `anchor` (the place), `axis` (vertical process, timeline), `count` (placeholders when there are no items), `name` (the group name) |

### The catalogue (24)

Structure (11):

| template | good for | form |
|---|---|---|
| process | a workflow, a recipe, a procedure | boxes left to right joined by arrows; wraps back as a snake; axis=vertical for a column |
| cycle | a life cycle, a feedback loop, PDCA | items on a ring, clockwise from the top, arrows round; title in the middle |
| hierarchy | an org chart, a family tree, a breakdown | first item on top, children level by level under their parent (parents= or filled level by level), lines |
| pyramid | needs, priorities, foundations | bands widening from the narrow top |
| funnel | sales funnel, hiring, narrowing down | bands narrowing from the wide top |
| timeline | a roadmap, milestones, a history | a track with one dot per item, items alternating above and below (left/right when vertical) |
| list | a checklist, an agenda | a header bar with the title, rows below (two columns past 7) |
| matrix | 2x2: urgent/important, SWOT | four quadrants in reading order; items2 = axis names |
| target | the core of what matters | concentric see-through rings, the first item at the centre; each ring's text at its top |
| venn | what 2-3 groups share | 2-3 overlapping see-through circles; items2 = the shared middle |
| hub | a mind map, a team around a lead | the title in a centre circle, items around, spokes |

Emotion (13), forms that recall something felt, made of the same shapes, texts and arrows:

| template | good for | form |
|---|---|---|
| heart | values, thanks, care | items on a heart outline drawn by lines (small dots complete it); title inside |
| burst | celebration, a launch, energy | a gold star with the title, items as rays at alternating distances |
| steps | growth, progress, a career path | blocks standing on one line, each taller (a staircase), a rising arrow over their tops |
| bridge | bringing two sides together | two pillars (items, items2) under a deck with the title; dashed two-way links across |
| mountain | a hard climb to a high goal | a mountain behind; camps on a winding trail up; the last item a star at the summit |
| spiral | widening growth, iterations | items on a spiral from the centre outwards, arrows |
| wave | ups and downs, a journey with highs and lows | items on crests and troughs, a curve through small dots |
| tree | what grows from what | a trunk with the title, items as a crown, items2 as roots (three stubs when none) |
| road | a journey to a destination | milestones along a winding road rising to a gold star (the title, the goal) |
| balance | pros and cons, trade-offs | beam on a post; items hang left, items2 right; the side with more items hangs lower |
| hourglass | deadlines, many becoming one | an hourglass outline; items fill the upper glass, items2 the lower |
| sunrise | a new beginning, hope | a sun with the title on the horizon, items on an arc above as rays |
| pillars | what holds something up | a roof with the title, one column per item, a base (items2) |

Each catalogue entry (`TemplateKit.catalogue()`) has: name, title, family, good-for, how it is drawn, params, item range, default
count, default scheme, Rules cue words, one example sentence. The help answers and the Templates help page are generated from it.

### Engine semantics (`create template=…`)

1. Parameters: items (or `count` placeholders "Step 1…"), kept inside the template's range (the answer says when items were cut or
   added); items2 likewise.
2. The place (`TemplateKit.place`): the preferred box (a canvas part, `at`, or the side of an anchor shape or group), then the whole
   cell, its halves, its quarters; the first box where the layout fits (no crowding) and covers no obstacle wins. Obstacles: every shape
   of the cell except a background of its own (the opening drawing's Backdrop); zones and other templates' backgrounds count, so two forms
   never overlap. No box -> a **new frame** (an empty cell titled with the template's title); the answer says so, and says when the
   preferred place was taken.
3. The geometry (`TemplateKit.layout`): pure, deterministic; sizes shrink (factor 1 -> 0.5) until no two items or texts overlap and
   everything is inside the box; still crowded -> the engine refuses with a reason ("try fewer items, shorter texts, or a bigger place").
4. Emission: the elements in band order (background, zone, item, text), each an `add` patch with `w`/`h` (texts: their font), `fill`,
   `layer`, `quiet` (no name tag on the canvas) and `template` (its group); then the links; then one `group` patch. Names: items, hubs and
   goals after their text when free (Build MVP -> BuildMVP), the rest `<group>-<id>` (Timeline1-dot3); the group after the title
   (Our values -> OurValues; "2027" -> Timeline2027) or Timeline1, Timeline2….
5. Undo: it is one wire, so one step ("a wire is applied whole or not at all").

`arrange template=…`: the targets (groups expanded, panels left out) move to the template's item places in the order given; nothing is
created, no links are added. The template keys `layout=row|column|grid|circle` stay with `layoutOffsets` / the arrange handler; the
templates do not duplicate them (process is not a row: it adds arrows and wraps).

## 4. The help world

### SOP Lang

```
@q1 question ask=help                                         # "help", "what can you do?"
@q1 question ask=help topic=connect aspect=how                # "how do I connect two shapes?"
@q1 question ask=help topic=color aspect=values               # "what colours can I use?"
@q1 question ask=help topic=group aspect=can                  # "can I group things?"
@q1 question ask=help topic=connections aspect=overview       # "what can you do with arrows?"
@q1 question ask=help topic=timeline aspect=how               # "how do I make a timeline?"
@q1 question ask=help topic=pyramid aspect=example            # "show me an example of a pyramid"
@q1 question ask=help aspect=can about=images                 # "can I add images?"
```

- `topic` (enum, generated): every action value, question value, legend key, value of an enum key (a colour, a shape kind, a template,
  a style…), plugin name, and `general`. It is built after all plugins are loaded (`HelpAnswers.topicLegend`), so a new action, key or
  template is a topic at once.
- `aspect`: overview (help, what can you do, tell me about), how (how do I, how to), can (can I, is it possible, do you support),
  values (what kinds of, which colours), example (show me an example).
- `about` (text): the words of a help question that name nothing in the legend; the answer says honestly that it does not know them,
  then what it can do.

### The answer (`docs/js/help-answers.js`)

Assembled from, in this order of trust: the legend (questions, kinds, values, cue words, which plugin defines which key), the plugins
(what each runs, switched on or off: "That part is switched off now, in Settings › Capabilities"), the help pages' prose and examples
(`HelpKit.ACTIONS / ASKS / CAPS / TOPICS`) and the template catalogue. One part per sense of the topic (`label` is an action and a
key: both are answered). Each answer returns up to four example sentences (from the help pages, or examples that use the topic's words);
the reply shows them as buttons that send them. A value added to the legend appears in the answers with no other change (tested).

The engine: plugin `help` (switchable like any capability), handler `question ask=help`; the step carries `examples`; the drawing is
never changed.

## 5. The opening drawing

`docs/js/start-diagram.js`, run by every reader's engine when the page opens (not a message), then "Is there a path from Start to Done?"
is sent as the first message.

| level | items |
|---|---|
| 0 background | Backdrop: 780 x 464, navy, fill faint, layer background |
| 1 zones | IntakeZone (blue, light), ReviewZone (green, light), layer zone |
| 2 items | Start (large blue circle), Process ("Validate"), Check (yellow diamond "ok?"), Done (green circle); Start -> Process -> Check -> Done (dashed, "yes") |
| 3 texts | MainTitle "Order flow" (large navy), IntakeCaption "1 · receive", ReviewCaption "2 · review" |
| groups | Intake = IntakeZone, Start, Process, IntakeCaption; Review = ReviewZone, Check, Done, ReviewCaption |

The help pages' examples keep working on it (every one is checked, section 10). The title text is called MainTitle, not Title: the Rules
mark known names in any case, so a text named Title would capture "add a title …".

## 6. What the Rules reader detects

The Rules' cue words are their own (AGENTS.md: "The Rules' cue words are the Rules' own"); the learned readers get none of them.

**Help** (`HELP_LEAD` in logic.js, read before anything else in a clause): help; help me (with); I need help; what (else) can you/I do
(with); what can you draw/make/use; how do/can/could/should/would I/we/you; how to; what is the way to; is it possible (to); is there a
way to; are you able to; does it support; can/could I/we; can/could you (only a bare capability question: "can you draw stars?",
"can you do timelines?", "can you help?"; with an article, a name, a quote, all/every/the… it is a request, read as before); show/give
me an example (of); examples of; what kinds/types/sorts of; what/which colours/sizes/shapes/styles/templates/layouts/positions/forms/fills
can/are available/exist; tell me about; explain; what is a(n) X. Not help: a lead followed by a drawing question (how many, which,
where, is there); a help lead with a shape's name in it and no action word ("how do I get from Auth to Logs", "which shapes can Spawn
reach": path / reachable questions, read as before); "help" / "I need help" / "explain" followed by a request, a name or more than four
words ("Please help, I'm in the middle of a lab report…"); "explain what the diagram contains"; a clause starting with a shape named
Help. Topic, in this order: a template cue (plural allowed); a specific action cue (not make/add/draw/put/set/change…); a
family noun (arrows/lines/links/connections -> connections, groups -> groups, text/title/heading -> text, colours -> color, sizes ->
size, kinds of shapes -> shape, positions/where -> position, styles -> style, outlines/borders -> outline, fills/transparent -> fill,
templates -> template, layouts -> layout, rules/defaults -> rules, questions -> queries, backgrounds/zones/layers -> layer,
front/back/behind/overlap -> toFront, bigger/smaller -> resize); a value cue (star, purple, dashed…); the words left that the legend
does not know -> `about`; finally a generic verb. Aspect from the lead (how / example / values / overview / can).

**Free text** (decided right after the action, before positions are read): a command whose action is create, label or move, with a
quoted text, and with no known name, no pronoun, no shape noun and no "on <something>" other than a canvas part ("write "Stop" on the
red octagon" stays a label); a create also needs a text noun (text, title, heading,
headline, caption, subtitle, banner, note, words). Examples: "add a title "Q3" at the top in big red letters", "write "Draft" in the
bottom right", "title the diagram "Order flow"", "add a red text "hello"". The cues of `shape=text` are kept out of the shape nouns of
descriptions, so "the title" is not a mention and "what text does Done have" reads as before.

**Templates** (`templateOf`, before the clause's own reading; the sentence splitter keeps a template's list of items in one piece):
a template cue that is the object of a verb of making, as the first verb of the clause (draw, make, create, build, add, sketch, lay out,
put together, do + "a/an" + modifiers; no article only for plural forms: "draw rising steps of …", "draw pillars of …"), or the target
of an arrangement whose objects are only shape names or "everything" (arrange, lay out, organise, turn, put, place, make … as/into/in a
…), or alone at the start ("a timeline of A, B"). Modifiers: colours, sizes, scheme words, numbers, "5-step", simple, quick, vertical….
A capitalised known name is never a cue. Not a template: a template word in other text ("the heart rate", "our sales funnel is drawn as
boxes", "the chairs sit in a loop", "add a link … to make a loop"); a list or form "of the …" with one item ("a timeline of the
project"); items that are descriptions ("a list of the red shapes", "a list of everything that is not green"). Then, from the words after the cue: title (titled, called, named, headed, with the title; around
"…"; to "…" for road; with "…" in the middle for venn; on "…" for pillars), scheme (+ colours/palette/tones), one colour (in blue),
axis (vertical, top to bottom), count (5 steps / 4 levels …), a canvas part (in the top left, in the bottom half…), a side of a named
shape (below Done), a second list (against, versus, with roots, on the other side; from … to … for bridge and balance), and the items
(of / for / with / showing / : …, split at commas, "and", "then", arrows). Arrange: an arrange verb (or turn/put/make … into/as) with
named shapes or "everything" before the cue; or a create whose items are all existing names. Not a template: "make a list of the
circles" (items that are only shape words).

Known cue collisions, resolved by the article/verb rule above or left to the reader to ask: list (ask=list), title (label verb),
steps / process, roadmap (timeline) / road, path (ask=path; not a road cue), scale (resize; not a balance cue), column (layout; not a
pillars cue), star (shape) / starburst, circle (layout) / cycle, tree / hierarchy (family tree, org tree -> hierarchy; tree, roots -> tree).

## 7. Data for the learned readers

None of the three new forms is read by VSS or SOP-BERT today. Risk until they are trained: SOP-BERT may read "How do I connect two
shapes?" as a connect command (a confident mistake); the gates should keep most of these unexecuted, but this is not measured yet.

**Worlds.** VSS: a new world `help` (one event, `help`; roles topic, aspect, about), because help questions share the words of every
other world and must be told apart by their question form; `template` is a value role of `create` (world shapes) and of `arrange` (world
position); `items`, `items2`, `title` are TEXT/NAME spans, as labels are today; `shape=text` is a value of create. The cutter learns
B-help. SOP-BERT: a new ask class `help`, value heads `topic` (one class per topic, ~160, generated), `aspect`, `template`, `scheme`,
`fill`, `layer`, and span heads for `items`/`items2`/`title`/`about` (like `label`).

**(a) Synthetic from the Rules** (AGENTS.md 2026-11-02 22:04), an extension of `synth/gen_rules_cover.py` writing
`llm_train/synth_rules_ext/msg_NN.jsonl`, kept only when the Rules' wires equal the gold (check_rules.mjs), rejects reported by cause:
- help: every aspect lead x topics drawn least-used-first over every action, key, value, template and plugin family noun, plus `about`
  with words outside the legend (images, rotate, fonts, 3D, export…); every topic at least 3 times, every lead at least 20;
  negatives in the same files: "can you" requests and drawing questions written with the same leads (they must keep their wires);
- templates: every template cue x item forms (comma list, "and", quoted items, colon), with and without title / scheme / colour / size /
  place / axis / count / second list; arrange forms with names and "everything"; each template at least 40, each cue at least 5;
- free text: create (each text noun), write/put/title forms, each size and colour word, places; edits of a text by name (move, set,
  label, delete, toFront).
- one-, two- and three-request messages mixing these with the existing actions, as synth_combo does.

**(b) Realistic, written blind by Opus** (brief to be written as `llm_train/BRIEF_EXT.md`, same rules as TRAIN_MSG_SPEC.md: save texts
before annotating, many domains and personas, whole messages): people asking how things work in the middle of work ("hmm how do I make
the arrow dashed? anyway connect A to B"), after an error ("why didn't it draw a cloud? what shapes can I use then"), first contact
("hi, what can you do?"), help questions mixed with requests; template requests with real lists (agendas, roadmaps, OKRs, lesson plans,
wedding plans, team values, pros and cons, funnels, org charts); titles and notes on the canvas. Four batches of 150 messages, then a
coverage report (which templates, topics, aspects are missing) before any training.

### Proposed section for LABEL_CONVENTIONS.md (not added to the file yet)

```
## Help questions, free text, templates (proposal, LEGEND_EXT.md, 2026-11-02)

- A question about the editor itself -> `question`, ask "help". topic: the most specific thing of the legend it names: a template
  ("timeline"), else an action named by a specific verb ("connect", "group"), else a family noun (arrows/lines/connections ->
  "connections", groups -> "groups", text/titles/headings -> "text", colours -> "color", sizes -> "size", kinds of shapes -> "shape",
  positions -> "position", line styles -> "style", templates -> "template"), else a value ("star", "purple", "dashed"). No topic for
  "help" / "what can you do". aspect: "how" (how do I, how to), "can" (can I, is it possible, do you support), "values" (what kinds of,
  which colours can I use), "example" (show me an example), "overview" (help with X, what can you do with X, tell me about X); none for a
  bare "help". Words of the question that name nothing in the legend -> about, exactly as written ("can I add images?" -> about
  "images", aspect "can"). trigger: the lead ("How do I", "can I", "What colours", "help").
- Not help: questions about the drawing ("which shapes are there?" -> list; "how many circles?" -> count). "can you / could you" + a
  concrete object (an article, a name, a quote, "all", "every") is a request ("can you draw a star" -> create); a bare capability
  question is help ("can you draw stars?").
- A free text -> create, shape "text", label = the quoted words, size = the letter size word (big letters -> large), color, position.
  "write "X" at the top", "title the diagram "X"", "add a caption "X"" with no shape to put it on are free texts; "write "X" on Done"
  is a label of Done. "the title" as a description is not written as a mention (it is not one); name the text item when the text does.
- A template -> create, template = its value, items = the texts in order, comma-joined, exactly as written without quotes; items2, title,
  scheme, color, size, position (+ anchor), axis, count only when the text says them. "a 5-step process" -> count "5", no items.
  "lay out A, B and C as a cycle" -> arrange, target "A,B,C", template "cycle". trigger: the verb, or the template noun when there is no
  verb ("a timeline of A, B and C").
```

## 8. logic.js hooks added (for the auto-layout integration that follows)

- `dims(s)`: texts (`shape=text`, `font` or `FONT_PX[size]`) and explicit boxes (`s.w`, `s.h`) before the size rule. Exported:
  `FONT_PX`, `fontOf`.
- `BAND(s)`, `isPanel(s)`; the `add` patch inserts at the top of the item's band; `hits()` ignores panels; `itemsOnly(list)` in
  align / distribute / arrange.
- shape properties now possible: `w`, `h`, `fill`, `layer`, `font`, `quiet` (no name tag), `template` (the group of a template's shape).
- `boxArgs(a, shape)` (width/height/fill/layer of a create), `createText(a, ctx)` (handler `{action: create, shape: text}`).
- `makeTemplatesPlugin(TK)` (handlers `{create, template}`, `{arrange, template}`; `templateBox()` turns position/region/at/anchor into
  TemplateKit's `prefer`), `makeHelpPlugin(HA)`; both are added in `createSystem` when `TemplateKit` / `HelpAnswers` are present
  (globals in the browser, `require` in node), and the `topic` legend is built after all plugins.
- Engine step: `examples` is copied from a handler's result.
- Formalizer: `helpOf`, `helpTopic`, `templateOf`, `templateClause`, `pushWire`; constants `HELP_LEAD`, `HELP_GENERIC`, `HELP_FAMILY`,
  `HELP_STOP`, `TPL_MOD`, `TPL_PLACES`, `TEXT_NOUN`, `ALL_SHAPES`; `TPL_PART` marks a sentence part that is one template request.
- layout plugin: `toBack` of several shapes keeps their order.
- `worldNodes` writes `fill`, `layer`, `width`, `height`.

## 9. Not done / limits

- VSS and SOP-BERT do not read the new forms (section 7).
- A text is counted among "shapes" by count / list questions; "how many texts" works (shape=text).
- Descriptions of texts ("the title", "the heading") are not mentions; texts are reached by name.
- Arrange with a template moves shapes only; a template's decorations and links are not added to existing shapes.
- The opening drawing leaves no free part of its cell, so a template asked for there goes to a new frame (the answer says so).
- Template shapes' names are hidden on the canvas (`quiet`); they are in the details and the SOP Lang tab.

## 10. Tests (all pass)

- `node training/sketch/test_templates.mjs`: 24 templates x every item count bound x 4 boxes x title / second list: no overlap among
  items and texts, inside the box, one element per item, link counts, stable output, legal unique names; placement around obstacles,
  preferred region, new frame, side of an anchor; parameters (placeholders, matrix limits, schemes, one colour, vertical axis, parents,
  ring order, summit, tilt).
- `node training/sketch/test_help_answers.mjs`: the generator on a hand-made legend (a value added to the legend appears; switched-off
  plugin said; unknown topics honest), every topic x every aspect on the live legend, every offered example runs on the opening drawing,
  the Rules reader on the owner's six questions and kin (and requests / drawing questions that must stay as they are), every help-page
  example runs on the opening drawing.
- `node training/sketch/test_start_diagram.mjs`: the opening drawing (legend-valid wires, z-order = wire order, levels non-decreasing,
  groups, containment), band insertion of new items/zones/texts, toFront/toBack of a shape, the background and a group (order kept),
  undo, Rules wires for them, panels not obstacles, free text create/move/set/label/delete/refusals, a template's group, bands and undo.
