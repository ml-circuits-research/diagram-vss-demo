# HIGH_LEVEL_OPS.md: high-level layout operations and arrow restyling (design, 2026-11-02)

Owner's request: support the simple whole-diagram commands people give ("improve all", "arrange all as a tree", "clean this up", "left to
right", "space them out evenly", "line everything up"), taken from what real editors offer (`RESEARCH.md`), with a measurable meaning for
"improve", and derive the formulations people write (`formulations.jsonl`). Coordinator's addition: restyle and reverse existing arrows.

Files:
- `docs/js/auto-layout.js`: the geometry (layouts, operations, quality score, `improve`). Pure, deterministic, no dependency, UMD.
- `training/sketch/ops/test_auto_layout.mjs`: its tests (and, with `LOGIC=<patched logic.js>`, end-to-end checks sentence -> engine).
- `docs/js/ops-integration.md`: the change logic.js needs (applied by `apply_ops_patch.mjs` from `ops_patch_blocks.js`). **Not applied**:
  another agent was editing logic.js. Tested on a scratch copy only.
- `training/sketch/ops/formulations.jsonl` (+ `formulations_texts.jsonl`, `make_formulations.py`): 744 short commands with gold.

## 1. Templates create, these operations re-lay out

`docs/js/templates.js` (the templates agent, `training/sketch/legend_ext/LEGEND_EXT.md`) **creates** shapes in a form from a list of texts
("draw an org chart of CEO, CTO and CFO", "make a cycle of Plan, Do, Check, Act"), and can move named shapes into a form's places
("arrange A, B and C as a timeline"). The operations here **move existing shapes** and **follow their links**: a tree layout puts a shape
under the shape whose arrow points at it; a template's hierarchy puts the items under each other in the order given.

The two meet on a few words (tree, hierarchy, org chart, mind map, hub, radial, flow, cycle). The rule (patch section SENTENCE / CLAUSE
template guard, `opsSkipTemplate`):
- a link-following layout word (tree, hierarchy, org chart, layers, flow, radial, organic, mind map, spokes) with **no creation verb** (draw,
  create, build, add, make a ...) and **no list of new items** ("of A, B and C") is a re-layout: `arrange layout=tree|layers|radial|organic`;
- everything else stays a template (process, cycle, timeline, pyramid, funnel, matrix, venn, target and the emotion forms, and every
  creation);
- `arrange layout=tree|radial` on shapes that have **no links among them** falls back to the template's hierarchy / hub form in the order
  given (the engine says so), so nothing the templates agent supports is lost.
Geometry shared: the tree layout uses the same idea as the template hierarchy (each parent centred over the block of its children, leaves
side by side), generalised to shapes of different sizes and to any direction; the circle uses the engine's `layoutOffsets` radius rule.

## 2. Conventions

- **"Everything"**: all / everything / all the shapes / the (whole) diagram / the canvas / the drawing / the whole thing / all of them / them
  all / for all -> `target=mention(quantifier=all)` (what the Rules already write for "everything", and the coordinator's convention of
  2026-11-02 in `gen_rules_cover.py`). No target word -> no `target`. "it" / "this" / "things" with nothing before it -> no target. An empty
  target on these actions means every shape of the current drawing (the cell of the canvas), so both forms execute the same.
  Exceptions: `fit` treats "the canvas / page / screen" as the destination, not the target; "all the arrows" is about arrows (no target).
- **Arrows**: one existing arrow is named by its ends, `from=` / `to=` (as `label from= to=`); every arrow: `kind=edge` (plus
  `quantifier=all` when the text says all / every / each); the arrows at a shape: `target=`.
- No new legend keys. New values: action `improve`, `respace`, `snap`, `flip`, `reverse`, `sort`, `groupBy`, `equalize`, `straighten`,
  `untangle`, `fit`; layout `tree`, `layers`, `radial`, `organic`; property `name`. The value names avoid words people type as a verb on
  their own where that would misfire: a legend value is always its own cue, so `spacing` was renamed `respace` ("even out the spacing" is a
  distribute) and `cluster` was named `groupBy` (a group or shape named "Cluster" exists in the data).
- `tidy` / `tidy up` change meaning: today the Rules read them as `arrange layout=grid`; in this design they are `improve`. Training data
  that has "tidy" -> arrange grid must be relabelled (section 8).

- **Zones and free texts (2026-11-03).** A re-layout lays out the shapes it is given as ONE set, whatever zone they are on: "arrange all in
  a circle" is one circle of every shape, "distribute all vertically" one evenly spaced run from top to bottom (the owner's rule: do what
  the user says). On the whole drawing (no target, "all", "everything") the **free texts** (titles, captions) are not part of the set:
  they stay where they are, the layout keeps off them where it can (they are obstacles), and a text a shape still lies on moves aside as
  little as it can; the reply says so ("I moved the text IntakeCaption aside to make room."). A zone (`layer=zone`) holds the shapes whose
  centre lies on it (the topmost zone there); the reply names the shapes the layout took off their zone ("Check and Done are no longer on
  ReviewZone."). Zones and backgrounds do not move or grow: growing each zone around the members left on it makes zones overlap each other
  as soon as shapes cross over (a circle of the four shapes of the opening drawing), so it is not done. Re-layouts in this sense: arrange
  (every layout), align, distribute, improve, respace, flip, sort, groupBy, straighten, untangle. Not: snap (local), equalize (not a
  layout), fit / centre (the drawing, texts included, moves as a whole). A group's name is written where no shape, name tag, text or other
  group name is (above its frame on the left, else the next free corner; `logic.js groupLabels`, drawn by ui.js), because a group's frame
  stretches across zones when its shapes leave their zone. History: a first version (2026-11-03, the same day) went zone by zone on the
  whole drawing; "arrange all in a circle" then showed two pairs and "distribute all vertically" did nothing, which reads as broken.
- Panels (backgrounds and zones) draw no name tag (ui.js, 2026-11-03): their group's frame, their caption and the details name them, and
  the name shows on hover. On the opening drawing the zone's tag stood between the group's name and the caption, and a shape laid out on
  the zone could sit under it.

## 3. The catalogue

`SOP` shows the wire; parameters in brackets are optional. "Asks" = the engine raises a Clarify (the reader's wire is right, the world
does not allow it, and the answer proposes what would work); "fails" = an SOPError.

| operation | SOP Lang | parameters and defaults | what it does | asks / fails | status |
|---|---|---|---|---|---|
| improve | `command action=improve [target=]` | minGain 1 point | tries the candidates of section 4, applies the best only if it raises the quality score; says the scores | empty canvas fails; nothing better: no change, says so | new (module, patch) |
| tree | `command action=arrange layout=tree [direction=down\|up\|left\|right] [anchor=root] [target=]` | direction down; root: the shape with no incoming arrow that reaches most shapes | levels by depth, each parent centred over its children, children in their current order; a forest side by side | no links: asks (falls back to the hierarchy template when the template module is loaded and targets are named); a loop: asks, names it, offers layers; a shape with two parents: asks, offers layers | new |
| layers | `command action=arrange layout=layers [direction=] [anchor=start] [target=]` | direction down | Sugiyama: loops broken (said), longest-path layers, barycenter ordering (fewest crossings kept), exact placement around the neighbours | no links: asks | new |
| radial | `command action=arrange layout=radial [anchor=centre] [target=]` | centre: the source with most links, else the most linked shape | rings by distance from the centre, wedges by subtree size | no links: asks (hub template fallback as for tree) | new |
| organic | `command action=arrange layout=organic [target=]` | 60-140 iterations | force-directed (Fruchterman-Reingold), seeded by the current positions, deterministic | - | new |
| auto | `command action=arrange [direction=] [target=]` | - | the layout the links ask for: tree if they form one, layers if loop-free arrows, circle (<= 10) / organic for loops, grid without links; with a direction and no links: a row / column | - | changed (was: grid) |
| grid, row, column, circle | `command action=arrange layout=grid\|row\|column\|circle [direction=] [target=]` | reading order; circle: linked shapes next to each other | as before, now without overlaps, a selection stays where it is and avoids the other shapes, groups move as blocks; row / column with direction left / up reverse the order | empty: fails | changed (reading order instead of creation order; overlap-free) |
| align edges | `command action=align direction=left\|right\|up\|down [target=]` | - | left (right, top, bottom) edges flush with the outermost; overlaps pushed apart along the line | < 2 shapes fails | new (`align` with axis unchanged) |
| align centres | `command action=align axis=horizontal\|vertical [target=]` | horizontal; the line through the first shape named | the centres on one line; shapes that would overlap are pushed apart along it, 24 px apart (`AutoLayout.align`, since 2026-11-03) | < 2 shapes fails; too long for the canvas: done, the reply says they do not all fit | changed |
| distribute | `command action=distribute [axis=] [target=]` | horizontal | equal GAPS between neighbours in their order along the axis (`AutoLayout.distribute`, since 2026-11-03; was equal centre steps, which put two shapes of the opening drawing on each other); the ends stay when the others fit between them with at least 16 px between neighbours, else the span widens about its centre, so no two of them touch | < 3 fails; cannot fit on the canvas even at 16 px: nothing moves, the reply says why | changed |
| more / less space | `command action=respace comparison=bigger\|smaller [scale=] [distance=] [target=]` | bigger x1.5, smaller x0.67; "a lot / double" 2 (0.5), "a bit" 1.25 (0.8); distance = the wanted typical gap in px | positions scaled about the centre of the shapes, overlaps removed, kept on the canvas (compressed if needed, and said) | neither comparison nor distance: asks | new |
| snap to grid | `command action=snap [distance=grid] [target=]` | 20 px | centres to the nearest grid point; a shape that would overlap takes the nearest free grid point | - | new |
| centre / fit | `command action=fit [position=center] [target=]` | - | everything inside the canvas, moved as little as possible (position=center: the drawing centred), compressed when too large | empty fails | new |
| flip | `command action=flip [axis=horizontal\|vertical] [target=]` | horizontal (left and right swap) | mirrors the positions about the middle of the shapes; shapes themselves are not mirrored | empty fails | new |
| sort | `command action=sort [property=name\|color\|size\|shape\|label] [superlative=biggest\|smallest] [layout=row\|column\|grid\|circle] [target=]` | name; ascending (biggest = descending) | the shapes take the current places in reading order, in sorted order (natural name order, palette colour order); with a layout: that layout in sorted order | < 2 fails | new |
| group by | `command action=groupBy [property=color\|shape\|size] [target=]` | color | one compact block per value, blocks side by side in reading order | < 2 fails | new |
| same size / colour | `command action=equalize property=size\|color\|shape\|outline [anchor=model] [target=]` | size; the most common value (ties: the first in reading order), or the model's | sets the property on the others; then removes any new overlap | other properties fail | new |
| straighten | `command action=straighten [target=]` | tolerance max(12 px, 25% of the length), at most 60 px | a nearly horizontal / vertical link becomes exactly so (the end read later moves) | nothing nearly straight: no change, says so | new |
| untangle | `command action=untangle [target=]` | 8 nearest places (5 above 100 shapes), 4 passes (2) | shapes swap places when that lowers crossings x10 + links through shapes x5 + overlaps x50 + length | no swap helps: says so, suggests tree / layers | new |
| restyle arrows | `command action=set from= to= \| kind=edge [quantifier=all] [target=] style=\|color=\|arrow=forward\|both\|none\|size=` | size -> stroke width tiny 1, small 1.5, medium 2, large 3.5, huge 5 | changes the existing arrow(s) (patch op `edgeSet`) | no such arrow / nothing to change: fails with the arrows there | new (ui.js must draw `e.width`) |
| thicker / thinner arrows | `command action=resize from= to= \| kind=edge [scale=]` | x1.5 | stroke width scaled (1 to 8 px) | as restyle | new |
| reverse arrows | `command action=reverse from= to= \| target= \| [quantifier=all]` | every arrow when nothing is named | swaps the ends of the arrow(s) | no such arrow fails | new |

Why `reverse` is its own action, not `set arrow=backward` (the coordinator asked us to decide): reversing swaps the ends, so paths,
reachability and "which shapes can be reached from X" change, and the arrow is then named by its new ends; `arrow=` describes the heads
(forward, both, none) of an arrow that keeps its ends. A value `backward` would make the same arrow answer "from A to B" with a head at A,
and every graph question would need to know about it. Restyling the heads stays `set arrow=both|none|forward`.

Groups (logic.js groups plugin): in the re-layouts (arrange, improve, respace, sort, groupBy, untangle), a group whose members all move,
together with other shapes, moves as one block (its members keep their offsets); a group named alone as the target is laid out itself.
z-order (the order of `state.shapes`) is not changed by any operation. Background panels and zones (templates) are left out of the
layouts. Frames: an operation works in the drawing (canvas cell) of its first target, else in the current one. A shape's box in every
layout includes its name tag above it (22 px, as ui.js draws it), so no layout puts a name on another shape or text; snap uses the shapes'
own centres.

## 4. The quality score and "improve"

`AutoLayout.score(shapes, links, {canvas})` -> `{score, metrics, terms}`. score = 100 - sum(weight x term), each term in [0, 1]:

| criterion | metric (raw count in `metrics`) | term | weight |
|---|---|---|---|
| overlap | pairs of shapes closer than 2 px | min(1, 2 x pairs / n) | 30 |
| crossing | pairs of links that cross (links sharing a shape do not count) | min(1, crossings / m) | 20 |
| through | a link passing through a shape that is not one of its ends | min(1, 2 x cases / m) | 15 |
| outside | shapes not entirely on the canvas | shapes / n | 10 |
| length | coefficient of variation of the link lengths | min(1, cv) | 7 |
| align | shapes sharing no x and no y centre (2 px) with any other | share | 6 |
| spacing | coefficient of variation of the nearest-neighbour distances | min(1, cv) | 6 |
| flow | arrows not pointing the way most arrows point | share of directed links | 6 |

Weights: overlaps make a diagram unreadable; crossings matter most among the aesthetics (Purchase 1997, `RESEARCH.md`); the rest are
evenness and tidiness. The weights were chosen once, before testing, and not tuned.

`improve`: candidates from the least to the most disruptive: (1) separate (overlaps and off-canvas only), (2) straighten, (3) untangle,
(4) the layout the link structure asks for (tree in the current main arrow direction if the links form a tree; layers if loop-free arrows;
circle for <= 10 shapes with loops, organic for more; grid without links; reading order kept), (5) organic for any linked diagram of 4+
shapes. Each is scored on the whole diagram; the best is applied only if it beats the current score by >= 1 point, and a less disruptive
candidate within 1 point of the best is preferred. **It never returns a worse score** (tested on 47 diagrams); when nothing beats the current
score it changes nothing and says "The layout already scores S/100 and nothing I tried scores higher".

## 5. Measurements (all on 2026-11-02, this working tree)

- `node training/sketch/ops/test_auto_layout.mjs`: **291/291**. Every layout on 7 fixtures (tree, DAG, loop, three parts with a lone
  shape, no links, plain lines, mixed sizes): no overlap, on the canvas, deterministic, or the expected question; empty canvas, one shape,
  unknown layout / root / shape; a tree laid out as a tree in 4 directions (every child one level past its parent, siblings on one level,
  parents centred, no crossings, children in their current order); layers follow the arrows; selections avoid the other shapes; groups move as
  blocks; the score counts each criterion; **improve never lowered the score on 47 diagrams** and changes nothing on a clean grid; every
  operation of section 3. On 200 shapes / 260 links every layout runs in 55-225 ms and improve in about 1.0-1.5 s (node 22).
- With `LOGIC=<patched copy of logic.js>`: **309/309** (the 18 end-to-end checks: sentence -> Rules -> engine -> world, including "remove the
  arrowhead ..." keeping the arrow, a loop asking, a tree without links falling back to the hierarchy template, an org chart of new items
  still a template, a group kept as a block).
- The existing suites on the patched copy: test_diagram_ops 190/190, test_editor_history, test_help_answers 58/58, test_start_diagram 39/39,
  test_templates 7285/7285, test_combined_confidence, test_vote_confidence, test_vss_confidence: all pass, as without the patch
  (test_bench_canon and test_neural_confidence fail the same way with and without it: missing local files).
- The Rules (check_rules.mjs, exact gold) on the existing synthetic data, same logic.js snapshot unpatched / patched: synth_rules 7816 ->
  7761, synth_rules_ops 1340 -> 1340, synth_combo 1292 -> 1278. **Every one of the 63 lost lines is a "tidy" line whose gold is still
  `arrange layout=grid`**: the intended change of section 2 (relabel, section 8). No other line changed.
- The Rules on `formulations.jsonl` (744 lines): unpatched **92** exact, patched **703** (94.5%). The 41 left: 19 are the existing convention
  difference "no axis word -> no axis" (the Rules write axis=horizontal for align / distribute), 9 typos the spelling step does not fix
  (tre, layrs, radialy, gird, colum, les, cetner, flipp, clsuter, thiker), 3 lists containing a shape named like a verb ("Build" splits the
  clause), and the rest pronoun / ellipsis cases in two-request lines ("make it red" after a reverse, "the one from Process to Check dotted",
  "center it" — "center" is not a verb cue: making it one would turn "Kitchen in the center" into a fit).

## 6. How the Rules read it (summary; the patch is `docs/js/ops-integration.md`)

1. Verb cues (legend values): improve (improve, tidy, tidy up, tidyup, neaten, declutter, unclutter, clean up, cleanup, beautify, prettify),
   respace (compact, condense, squeeze, tighten), snap, flip / mirror, reverse / invert, sort / alphabetize, equalize / equalise / unify,
   straighten, untangle / disentangle / uncross, fit / recenter; arrange gains rearrange, relayout, re-layout, reorganize, reformat; `tidy`
   leaves arrange and grid.
2. `opsAction(text, action)`: phrases that turn the verb read so far into an operation, on the clause with known names masked: "make it
   look better" (set -> improve), "put them in a grid" (move -> arrange), "remove the crossings" (delete -> untangle), "bring everything
   closer together" (toFront -> respace), "make the lines straight" (connect -> straighten), "group them by colour" (group -> groupBy), "sort
   out the mess" (sort -> improve), "align the left edges" (align -> direction=left), ...
3. `opsRestyle(text, action)`: a change to EXISTING arrows (a definite arrow: the / all / every / its, A-B, A→B, or arrowhead words, plus a
   style, colour, head or thickness word) -> set / resize; "connect A to B dashed" and "draw a dashed arrow" stay connect. The ends are read
   like connect's (from / to); no ends -> kind=edge.
4. Verbless clauses: only short ones (<= 14 words) that are not a remark ("Ugh, messy.", "That's the main flow.", "I'm drawing the family
   tree" are not requests): "tree layout pls", "left to right", "less clutter", "Start-Done line red".
5. `opsArgs`: layout, direction (left to right, top to bottom, LR / TD / TB / RL / BT, upside down, root at the left, horizontal / vertical
   for a tree or layers), the root / centre (`with X at the top`, `rooted at X`, `around X`, `X in the middle`), comparison and scale of
   respace, axis of flip, property / superlative / layout of sort, property of groupBy and equalize, model of equalize (`as X`, `like X`),
   style / colour / heads / size of a restyle (the last style word wins: "make the dashed arrow solid"), the whole-diagram words.

## 7. Ambiguous phrasings and what the system should do

| phrasing | readings | what to do |
|---|---|---|
| "flip" / "flip it" | mirror the positions, or reverse the arrows | with an arrow word -> reverse; without -> flip (mirror). Confident only in those two forms. |
| "turn it upside down" | flip vertically, or a tree growing upwards | with a tree / layers word -> arrange direction=up; else flip axis=vertical |
| "make it a tree" / "make a tree" | re-layout by the links, or draw the tree template | "it" / "everything" / names -> re-layout; "make a tree" (article, no target) -> template; no links among the shapes -> the engine uses the hierarchy form and says so |
| "arrange as a hierarchy" with unlinked shapes | link tree vs template hierarchy | engine falls back to the template form (order given) and says so |
| "group by colour" | make named groups, or cluster the positions | groupBy (positions); no named group is made. If the user wants named groups: "group the red ones as Reds" |
| "spread them out" | distribute evenly (existing convention), or more space | "spread out (evenly / in a row)" -> distribute; "spread out more / further apart" -> respace bigger |
| "space them out" | same | same rule: a comparative word makes it respace |
| "clean the canvas" (no "up") | clear everything, or tidy | not read (no action) -> asks. Before the patch the spelling step turned "clean" into "clear": **"clean up the diagram" deleted everything** |
| "center everything" / "move everything to the center" | centre the drawing, or move every shape to the middle | "center X" (first word) -> fit position=center; "move ... to the center" stays move (existing semantics, documented, see section 9) |
| "fit" | fit to the canvas (move shapes) or zoom to fit (view) | fit moves shapes; the canvas has no zoom. The answer says what moved |
| "make them the same" | which property? | not read as equalize (no property word): it stays `set` with nothing to change, and the engine asks what should change |
| "line them up" | align, or arrange in a row | align (existing convention); "line them up in a row" = align axis=horizontal |
| "tidy up into a grid" | improve vs grid | a pattern word wins: arrange layout=grid |
| "make the arrows thicker" | stroke width, or bigger shapes | arrow word -> resize kind=edge (needs ui.js stroke width) |
| "fix the layout" vs "fix the spacing" | improve / respace / distribute | improve for both (improve may pick only the spacing) |
| "too crowded" (alone) | more space, or a remark | in a verbless remark it is not a request; "it's too crowded, spread it out" -> respace bigger |
| "sort" (alone) | by what? | sort property=name by default (the reader writes none; the engine sorts by name and says so) |
| "make that arrow two-way" | which arrow? | "this / that arrow" gets no `kind=edge` (it would mean every arrow): the wire has no arrow, the engine asks which one, or the reasoning layer fills it from the context |

## 8. What the coordinator needs to change elsewhere (not done here)

- **Relabel "tidy"**: the 63 synthetic lines (`llm_train/synth_rules` 49, `llm_train/synth_combo` 14) and the realistic ones with gold
  `arrange layout=grid` for tidy (`haiku_short` 2, `sonnet_short` 1) -> `improve` (keep layout=grid only when "grid" is said). In
  `synth/gen_rules_cover.py` `r_arrange`, the "tidy" branch must write `{"action": "improve"}` (+ target).
- `training/sketch/llm_train/TRAIN_MSG_SPEC.md` and `LABEL_CONVENTIONS.md`: the new actions, layouts and the arrow conventions of
  section 2 (copy from section 3's SOP column); `arrange`: "target (omit for everything)" is outdated by the 2026-11-02 convention.
- `training/sketch/synth/gen_rules_cover.py`: generators for the new actions, from `formulations.jsonl` (same wire format as synth_combo:
  `gold` = `wires`; `names` = the canvas; each line has `op` and sometimes a `note`).
- `docs/js/ui.js`: draw an edge's `width` (stroke width) when set; the help (help.js) entries of section 3 of ops-integration.md.
- `docs/js/bench-canon.js`: `scale` is not compared, so `respace` carries the direction in `comparison` (compared). Nothing to change.
- The learned readers (VSS worlds, neural) know none of the new actions until trained on this data (AGENTS.md: learned from the annotation).

## 9. Findings about the current Rules (before the patch; facts to report, some fixed by the patch)

- "clean up the diagram" -> `delete target=mention(quantifier=all)`: the spelling step reads "clean" as "clear". A confident destructive
  mistake. Fixed (clean is a known word; "clean up" -> improve).
- "remove the arrowhead from the Start to Done arrow" -> `disconnect` (deletes the arrow). Fixed (restyle arrow=none).
- "make the arrow from Start to Done dashed" -> `connect` (no change: the arrow exists). "make all arrows red" -> `connect color=red`.
  Fixed (restyle).
- With a shape named Pay on the canvas, "lay out ..." reads "lay" as "Pay"; with Cart, "org chart" reads "chart" as "Cart". Fixed for these
  words (added to the spelling step's known words); the general cause (lower-case words corrected towards names) remains.
- A shape named like a verb cue in a list ("arrange Plan, Build and Ship in a row") splits the clause before "Build" and creates a shape:
  not fixed (a general Rules issue).
- "make a ring of them" -> create (a ring of new circles): not fixed.
- "move everything to the center" moves each shape towards the centre, one by one (`move` semantics): not changed; `fit position=center`
  is the whole-drawing form.
