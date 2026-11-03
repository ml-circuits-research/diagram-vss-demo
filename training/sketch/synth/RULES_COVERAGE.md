# RULES_COVERAGE: what the Rules reader can detect (inventory for the synthetic training data)

**Update 2026-11-03:** the synthetic data were regenerated against the working-tree logic.js (sha256 27a2145c4956ef03: the Rules fixes for
the reject classes, and the ops patch of `docs/js/ops-integration.md`), with the ops and ext builders; current counts and the reject table are
in `llm_train/synth_rules/README.md` ("Current version") and `llm_train/synth_rules_ext/README.md`. The line numbers and the inventory below
are still those of ca2850a.

Source: `docs/js/logic.js` **as committed at ca2850a** (unchanged at 576e88a; sha256 f9f2ac617b32694c; 2026-11-02 21:49, "Rules: label an existing arrow, the shape X, several new shapes in a
layout"); line numbers below are of that version. The working-tree logic.js was being edited by another agent while this was written (its
hash changed three times; at one point the uncommitted version no longer read `title Db "x"`), so every script here reads a pinned copy
(`synth/pin_logic.py`: `LOGIC_JS`, else `LOGIC_REV` (default HEAD) copied to `synth/.logic_<rev>.js`). Re-run `gen_rules_cover.py` after the
next Rules commit; it takes about 2 minutes.

Part 1 is read mechanically from the engine (`synth/rules_inventory.mjs`: `engine.legend`, the lexicons the formalizer reads). Part 2 is the
formalizer's own hard-coded word lists and constructions (`makeFormalizer`, lines 1293-1830), read from the source; `rules_inventory.mjs`
also prints those source lines with their line numbers. Part 3 says what the synthetic data covers and what it does not.

## Counts

| | count |
|---|---|
| legend questions (keys) | 32 (20 with enumerated values, 12 free: target, count, name, scale, label, anchor, at, distance, linked, members, from, to) |
| enumerated values | 165 |
| legend cue words (beside the values' own names) | 335 (action verbs 124, shape 35, ask 33, position 22, notColor 18, outline 13, color 12, superlative 11, size 9, arrow 9, pairing 8, recency 8, layout 8, kind 6, property 6, quantifier 4, axis 4, direction 2, style 2, comparison 1) |
| actions (commands) | 21: create, delete, move, set, resize, rename, label, duplicate, swap, connect, disconnect, align, arrange, distribute, toFront, toBack, undo, redo, forget, group, ungroup |
| questions (`ask`) | 17: count, exists, list, property, check, describe, neighbors, connected, degree, path, reachable, cycle, rules, extreme, nearest, members, groupOf |
| other wire types | fact, rule |
| cues counted in the synthetic data (legend cues + the formalizer's own lists, `synth/cue_counts.py`) | 495, each in >= 5 requests of the kept data (minimum 5: "disregard", "double-headed", "fewest links", "most connections") |

## 1. The legend (mechanical, `node training/sketch/synth/rules_inventory.mjs --md`)

| question | kind | values | cue words (beside the value's own name) |
|---|---|---|---|
| target | names | (free: names) | |
| quantifier | enum | 1 | **all**: all, every, each, everything |
| count | number | (free: number) | |
| name | name | (free: name) | |
| notColor | enum | 18 | **red**: not red; **orange**: not orange; **yellow**: not yellow; **gold**: not gold; **lime**: not lime; **green**: not green; **teal**: not teal; **cyan**: not cyan; **blue**: not blue; **navy**: not navy; **indigo**: not indigo; **purple**: not purple; **magenta**: not magenta; **pink**: not pink; **brown**: not brown; **gray**: not gray; **black**: not black; **white**: not white |
| recency | enum | 2 | **newest**: new, newest, last, latest, most recent; **oldest**: first, oldest, earliest |
| action | enum | 21 | **undo**: undo, revert; **redo**: redo, reapply, re-apply; **create**: draw, create, add, make, put, place, insert, sketch, build, spawn, throw, slap, pop, stick, plonk; **delete**: delete, remove, erase, drop, clear, wipe, reset, get rid of, kill, trash, axe, ditch, zap, banish, nuke; **move**: move, shift, drag, push, nudge, slide, reposition, relocate, scoot, shove, park, tuck; **set**: set, change, turn, color, colour, paint, fill, give, recolor, recolour, transform, convert, reshape, morph; **resize**: resize, grow, enlarge, shrink, scale; **rename**: rename, call; **label**: label, title, caption, write, inscribe, stamp, tag; **duplicate**: duplicate, copy, clone, replicate, dupe; **swap**: swap, exchange, trade, switch places, trade places; **group**: group, put together, bundle; **ungroup**: ungroup, split up, break up, dissolve; **connect**: connect, link, join, wire, attach, hook, tie; **disconnect**: disconnect, unlink, detach, separate, cut, unhook, sever, snip; **align**: align, line up; **arrange**: arrange, layout, lay out, organize, organise, tidy; **distribute**: distribute, space, spread; **toFront**: bring, raise; **toBack**: send; **forget**: forget, discard, disregard |
| shape | enum | 9 | **any**: shape, shapes, node, nodes, object, objects, thing, things, element, elements, item, items, one, ones; **circle**: circles, dot, dots, ball, balls; **square**: squares; **rectangle**: rectangles, rect, rects, box, boxes, block, blocks; **triangle**: triangles; **diamond**: diamonds, rhombus; **ellipse**: ellipses, oval, ovals; **hexagon**: hexagons; **star**: stars |
| color | enum | 18 | **red**: crimson, scarlet; **orange**; **yellow**: amber; **gold**: golden; **lime**; **green**; **teal**: turquoise; **cyan**: aqua; **blue**; **navy**; **indigo**; **purple**: violet, lilac; **magenta**: fuchsia; **pink**: rose; **brown**; **gray**: grey, silver; **black**; **white** |
| outline | enum | 19 | **none**: no; **red**: crimson, scarlet; **orange**; **yellow**: amber; **gold**: golden; **lime**; **green**; **teal**: turquoise; **cyan**: aqua; **blue**; **navy**; **indigo**; **purple**: violet, lilac; **magenta**: fuchsia; **pink**: rose; **brown**; **gray**: grey, silver; **black**; **white** |
| size | enum | 5 | **tiny**: minuscule; **small**: little; **medium**: normal, regular, average; **large**: big; **huge**: giant, enormous, massive |
| scale | number | (free: number) | |
| label | text | (free: text) | |
| position | enum | 15 | **leftOf**: left of; **rightOf**: right of; **above**: above, over, on top of; **below**: below, under, beneath; **near**: next to, near, beside; **between**: between; **center**: center, middle; **top**: at the top; **bottom**: at the bottom; **left**: on the left; **right**: on the right; **topLeft**: top left; **topRight**: top right; **bottomLeft**: bottom left; **bottomRight**: bottom right |
| anchor | names | (free: names) | |
| at | point | (free: point) | |
| direction | enum | 4 | **left**; **right**; **up**: upwards; **down**: downwards |
| distance | number | (free: number) | |
| linked | names | (free: names) | |
| ask | text | 17 | **members**: what is in, what does … contain, members of; **groupOf**: which group, what group, belongs to, part of; **count**: how many; **list**: list, which, show; **exists**: is there, are there; **property**: what color, where is, how big; **check**: is A …?; **describe**: describe, what is on; **neighbors**: what is connected to; **connected**: are A and B connected; **degree**: how many connections does; **nearest**: closest, nearest, farthest; **extreme**: biggest, leftmost, most connections; **path**: is there a path, can I get from; **reachable**: what can be reached from; **cycle**: are there cycles; **rules**: what rules |
| kind | text | 3 | **group**: groups; **shape**; **edge**: arrows, connections, links, edges, lines |
| members | names | (free: names) | |
| from | names | (free: names) | |
| to | names | (free: names) | |
| style | enum | 3 | **solid**; **dashed**: dash; **dotted**: dot |
| arrow | enum | 3 | **forward**: arrow; **both**: two-way, two way, bidirectional, both ways, double-headed; **none**: line, plain, undirected |
| pairing | enum | 3 | **chain**: in a chain, one after the other, in sequence, in order; **next**: each to the next, to the next one; **all**: all to each other, every pair |
| axis | enum | 2 | **horizontal**: horizontally, in a row; **vertical**: vertically, in a column |
| layout | enum | 4 | **row**: row, line; **column**: column, stack; **grid**: grid, tidy; **circle**: circle, ring |
| property | enum | 6 | **color**: colour; **size**: how big; **shape**; **label**: text; **position**: where, location; **outline**: border |
| comparison | enum | 2 | **bigger**: larger; **smaller** |
| superlative | enum | 10 | **biggest**: largest; **smallest**: tiniest; **leftmost**; **rightmost**; **topmost**: highest; **bottommost**: lowest; **closest**: nearest; **farthest**: furthest; **mostConnected**: most connections, most links; **leastConnected**: fewest connections, least connections, fewest links |

Notes on the legend:
- `ask`, `property`, `kind` values carry "cues" that are documentation, not what the formalizer matches (`is A …?`, `what does … contain`):
  the question kind is decided by the regex chain of Part 2.
- Legend cues the formalizer does NOT read: style `dot` (the formalizer only matches `dashed|dash|dotted`, line 1769; `dot` is a circle);
  arrow `arrow` (forward is the default, no key); `outline` is read only in the patterns of line 1608, not from the colour words alone.

## 2. The formalizer's own cues and constructions (logic.js at ca2850a)

**Segmenter** (how a message is cut into requests, lines 1376-1470):
- sentences at `. ! ? ;`; parts at `and then | then | after that | afterwards | finally`; before a verb cue after `,`/`, and`/`and`
  (SPLIT_VERB 1376); one clause per created object after create/draw/add/insert/sketch/place/put/make + article (CREATE_START, OBJ_SPLIT
  1377-1378; only `please` may precede the verb); verb ellipsis "make A red, B blue and C green" / "put A left of B and C above B" (COORD,
  DIST_VERB 1384-1385: verbs make put move place turn colour/color paint set shift drag slide connect link join hook; openers please now
  then and also ok so just; one-letter names excluded, 1383); "connect A to B, then C to D" (ELLIPSIS 1397: the previous verb is repeated,
  across sentences too); a verbless piece is merged into the next one (1447).
- verbless clauses read on their own: a placement "Kitchen at the top", "Pit below the Stage" (PLACE_ONLY 1399 -> move); "A goes / leads /
  flows / feeds / sends / points / runs / passes / connects to B", "A to B" (CONNECT_ONLY 1400 -> connect); "A is red, B is blue" (FACT_LIST
  1401); "a red circle", "two blue boxes" (-> create, 1561).
- "connect A to B and B to C" -> one chain (merge after the cut, 1454-1468; only when no other key is present).

**Wire type** (1510-1516): undo `undo | redo | revert | take that/it back | do that again`; forget `forget|clear|remove|delete|drop|reset|cancel
… rules|defaults` (and legend forget, discard, disregard); rule `^(from now on | by default | in (the) future | henceforth | going forward |
always)` or `new … should|must|will (always) be`; question: first word how what what's whats which where who is are does do did has have list
show describe summarize summarise count tell any can(+I/we) could whose, or a `?` without a verb; fact: a known name or it/they + is/are, no `?`.
Polite openers removed first (1472): please kindly now ok okay so and also hey next, can/could/would/will you, I want you to, I'd/I would like
you to, let's, lets, go ahead and.

**Action from context** (1525-1570): make/put/place + article -> create, make + bigger/larger/smaller/twice/double/half/times -> resize, make
otherwise -> set, put/place otherwise -> move, put … together -> group, make/put/place + copies -> duplicate; draw/add/create/make/put/insert/
place + (two words at most) + an edge noun (arrow line edge link connection connector wire) -> connect; add a label/text/caption/title -> label;
delete + an edge noun -> disconnect; give without border/outline/label/colour -> set; swap … shape/form -> set; add X to <group> -> group,
take X out of <group> -> ungroup; `X should/must/needs to be a <shape>` -> set; start over -> delete everything; split/break … up/apart -> ungroup.
New at ca2850a: put "X" on Y -> label; remove/delete/clear/erase/drop/wipe/strip/get rid of the label/caption/title/text of X, X's label,
unlabel X -> label with label="" (REMOVE_LABEL 1323); an existing arrow named by its ends ("the arrow from A to B", "between A and B", "A->B",
"A–B", "the A→B line", "from A", "into B", EDGE_RAW 1321) + label/write/put/change … -> label with from/to (labelEdge 856), a question about it
-> property label with from/to; "the shape/box/node X", "the circle named X" -> the name X (NOUN_NAME 1317).

**Question kind** (1662-1683, first match wins): rules (rules?, defaults?) · groupOf · members · cycle (cycles?, loops?, circular) · path /
reachable (path route reach(able/es/ed) get from, get to, go from, leads? to, flows? to, indirectly, downstream, comes? after: 2 names ->
path, else reachable) · degree (how many connections/links/edges/arrows/neighbours/lines + one name + does/has/have/do) · extreme connected
(most/fewest/least connections/links/edges/arrows/connected/neighbours) · count (how many, count, number of) · nearest (closest nearest
furthest farthest) · extreme (biggest largest smallest tiniest leftmost rightmost topmost highest lowest bottommost) · exists (is/are there,
are/is any, any) · neighbors/connected (connected linked attached joined neighbours connections connects/points/links to; 2 names ->
connected) · check comparison (bigger/larger/smaller than) · property position (where) · size (how big/large/small) · property (what … colour
color size shape label text position location outline border) · label (what does X say) · check (is are does do has) · describe (describe,
summarise, overview, tell me about, what's on, what is X) · list (list show which what) · else describe. count/list + an edge word -> kind=edge;
count/list/exists + groups -> kind=group.

**Roles** (1578-1790): name (named, called, with the name, name it); label (labeled/labelled, label (it), with the/a text/label/caption/
title/word, saying, that/which says, titled, reading, text + a quoted string; a bare quote for create/connect/label/set; labeled Word);
coordinates (at/to (position/point/coordinates) x, y; x=.. y=..); distance (by N, N px/pixels/units/points); scale (twice as big, double, N
times bigger, half the size, much/a lot/way bigger/smaller, a bit bigger/smaller, bigger, larger, smaller); outline (C border/outline/stroke,
border/outline of/to C, no/without border); a change of kind (into/to/as/for/be/become a <shape>); descriptions -> mention wires (the/all
(of) (the)/every/each + recency (newest new last latest most recent first oldest earliest) + colour/size words + a shape noun; plural ->
quantifier all; bare plurals in commands; everything, all (the) shapes, all at the end of a clause; "that/which are not C" -> notColor;
this/that + noun, this/that/the same one, it/its, them/they/both/those/these -> the last reference); positions (between A and B; (to/on/at the)
left/right (side) of; above over on top of; below under underneath beneath; next to near beside close to by alongside around; a second
relation -> position2/anchor2; regions: (in/at/to/into/on/near/towards/close to/along) the top|upper left/right (corner), the center/centre/
middle (of the canvas/page/screen/diagram), the top/bottom/left/right (edge/side/row/half/part); bare "top left", "on top", "bottom",
"center" for move/create); direction ((to the) left right up down upwards downwards, not before of/side/corner); count (N/number word +
noun/copies/times, twice, a couple/pair of; also undo/redo); notColor (that/which are/is not C, non-C, not C); style (dashed dash, dotted);
arrow (two-way, two way, bidirectional, both ways, double-headed, two headed -> both; line(s), undirected, plain, without (an) arrow(s) ->
none); pairing (in a chain, one after (the) other, in sequence, in order -> chain; to the next (one) -> next; all to each other, every pair,
to each other -> all); axis of align/distribute (vertical vertically column -> vertical, else horizontal: always written); layout of arrange
(row line, column stack, grid tidy, circle ring; vertical -> column, horizontal -> row); create count + layout ("3 triangles in a circle
layout", side by side -> row, stacked / in a stack -> column), with a position; linked (connected/linked/attached/joined/wired/hooked (up)
to/with) for create, facts and count/list/exists; disconnect all/every/everything -> quantifier all.

**Spelling step** (1333-1368): a word of 3+ letters within one edit (two for 7+ letters) of a shape/colour/size cue, a one-word verb cue of
4+ letters or a canvas name is replaced by it (unique best only; a capitalised word only towards a name; inflections and -ed/-ing words left).

## 3. What the synthetic data covers

`synth/gen_rules_cover.py` (README of `llm_train/synth_rules/`): every action and question above, every value and every cue word of Part 1
and Part 2 (`synth/cue_counts.py` counts them on the text of the kept data: 495 cues, each in at least 5 requests), every target form (name,
"the box Name", a description with colour / shape / recency / quantifier / notColor, "the blue ones", everything / all shapes, a list of
names, it / them / that one / the same one, a shape created earlier in the message) in target, from, to and anchor, verb ellipsis, one clause
per created object, chains, the verbless clauses, facts and rules, and two- and three-request one-liners. Groups, double positions, outline,
coordinates, "X is connected to Y", "remove all connections", arrow labels, label removal and create + layout are in `llm_train/synth_rules_ops/`
(keys outside LABEL_CONVENTIONS.md's legend; they need DIAGRAM_OPS=1 / converter support).

**Not covered (no kept message)**, each because the Rules read it otherwise than the conventions (reported as rejects in
the README) or because no convention exists:
- style cue `dot` (not read by the formalizer); scale values (not compared: `bench-canon.js` skips scale; resize is written without it);
- size as a filter of count/list/exists or inside a mention ("the big circle"): the Rules read it, LABEL_CONVENTIONS.md has no key for it;
- property outline ("what colour is the border of X" is read as colour); `ask` cues the formalizer reads otherwise ("is there a connection
  between A and B" -> exists, "what is the shape of X" -> list, "show me the connections" -> neighbors, "what's written on X", "what does X
  point to", "is X part of a group", "is B downstream of A", "can A reach B");
- `label` cues `relabel`, `unlabel`, `title`, `caption` as uncommitted in the working tree (they changed during this run);
- the convention differences of the README's reject table ("connect A and B", several-to-one, default axis, undo count, extreme with a
  shape filter; "all" / "them all" / "the (whole) diagram" as the object, which the Rules read only as the last word of a clause).
