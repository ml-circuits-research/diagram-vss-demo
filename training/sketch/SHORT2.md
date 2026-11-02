# SHORT2.md: the causes G1, H2 (and E, D, F) of the composer's misses on short commands (2026-11-02)

Follows SHORT.md (its "Result" section: VSS 60.5 / 12.4 / 27.1 on the six short sets). Model, data and scripts:
- composer = docs/model/micro/registry.json (cutter_worlds7s, the 7 worlds, event hint H1, context filler context/weights.json margin 0),
  called as the demo calls it: `comp.formalize(text, {names, last: []})`;
- short sets: `cd training/sketch/short_bench && node short_bench.mjs <out.json>; python3 agg.py <out.json>; python3 classify.py <out.json>`
  (docs/bench/{hand, blind, broad, seen, new_identities, heldout_formulations}.json, 1140 gold requests);
- 1000-message sample: `PAIR=value SEG=composer node training/sketch/llm_score.mjs <the 9 sampleF folders>`, the ALL block (4858 requests).
Numbers are per gold request: right / wrong / not done (%), extra = requests nobody asked for.

## 1. Baseline today

| | right / wrong / not done | extra |
|---|---|---|
| short sets, all six (1140) | 60.3 / 12.4 / 27.4 | 53 |
| written by hand (hand + blind + broad, 240) | 74.2 / 10.4 / 15.4 | 18 |
| generated (seen + new_identities + heldout_formulations, 900) | 56.6 / 12.9 / 30.6 | 35 |
| 1000-message sample (4858) | 75.6 / 13.1 / 11.3 | 335 |

(SHORT.md gave 60.5 / 12.4 / 27.1 for the short sets; heldout_formulations differs by 3 requests, 54.0 then, 53.0 today. I did not find
what changed in between; every comparison below is against today's run.) classify.py today: 453 requests not right; G1 92, H2 59,
H1 68, E 45, D 27, F 24, A 96.

## 2. Does a description need the drawing? No.

The demo passes `{names, last}` to every reader (ui.js readWith, and the Benchmark: `{names: r.names, last: []}`); short_bench passes
the same. No reader gets the drawing (colours, shapes) when it formalizes. The rules do not need it either: logic.js turns "the gray
diamond" into a `mention(color=gray, shape=diamond)` wire, and the engine resolves the mention against the canvas when it executes.
The VSS path has the same step already: when the reader puts a description in an entity role (object `{head: diamond, attr: gray}`),
vss-adapter.js `ref()` emits a `mention` node, the context filler marks it `desc` and leaves it to the engine (decision `left`), and the
request is executed. So the composer does not miss descriptions because it lacks the drawing: it misses them because **the reader never
puts the description in the role** (section 3). Nothing has to move to the engine.

## 3. G1: the context filler asks because the reader left a needed role empty (92 requests; 96 after fix 1, section 6)

Every G1 request was read again (composer units, the world's reading, its `_unplaced` words, its presence ratios, its schema). All 96 have
the same first cause: the reader's frame has the entity role empty, the learned needs (`missingRoles`) say the action needs it, there is
no candidate in the row's context, so the filler asks. The context filler is right to ask; the adapter does not drop anything (the role
is not in the reading). Sub-causes (fix-1 run, 96):

| sub-cause | requests | examples |
|---|---|---|
| the description's words are unplaced; the role admits SHAPE heads, but its presence ratio is under the calibrated threshold | 56 | "turn the gray diamond black" (object presence 0.52, threshold 0.90), "Recolour all stars blue" (0.86 / 0.90), "make the last circle green" (0.64), "shift the hexagon to the left" (0.69 / 0.71), "connect every circle to the next" (source 0.02 / 0.59) |
| the description's words are unplaced and the role CANNOT take them: its head kinds exclude SHAPE | 9 | "put 5 purple ellipses beside the orange hexagon", "please put a huge red oval under the navy rectangle" (shapes7c landmark heads: NAME, them, it only) |
| the head word is not a legend token after the world's front end (box, dot(s), oval, shapes; H1-like) | 14 | "get rid of the dots", "could you clone the oval", "now connect the black dots in a chain", "let's connect all white boxes in a chain" |
| a region phrase read as a relation, so an anchor is needed and there is none (front end: "on the left" -> left_of) | 11 | "could you create a star called Home on the left", "now make a teal diamond on the right", "can you insert a gold square named Side at the bottom" |
| other (several roles empty, a pronoun, a name unplaced) | 6 | "can you join it with the box", "now connect Form with the box" |

Where the cause sits: **the world training data and the thresholds calibrated on it (model side)**. In the 9 data folders the worlds are
trained on (DATA=spans), a description is almost never the filler of an entity role; the gold args say a name instead:

| action, arg | gold args | a description (`mention(...)`) |
|---|---|---|
| set target | 4056 | 141 (3.5%) |
| connect from / to | 3427 / 2278 | 4 (0.1%) / 11 (0.5%) |
| move target / anchor | 3045 / 1522 | 43 (1.4%) / 4 (0.3%) |
| create anchor | 814 | 0 |
| check / fact target | 1002 / 911 | 6 / 0 |

The learned schemas show it: shapes7c `object` attr_rate 0.003, det_rate 0.012; shapes7c and graphq7 `landmark` head kinds NAME / them / it
(no SHAPE, no COLOR: a description cannot be a landmark); links7 `source` attr kinds COLOR but attr_rate 0.001 and no attr threshold (the
attribute is never given); links7 `target` no attr kinds at all; position7 `landmark` no attr. The presence thresholds were fitted on
calibration rows whose fillers are names (ratio near 1.0), so a description's lower ratio falls under them. The 3000 short one-request
messages (llm_train/sonnet_short, haiku_short) do not fix this either: target 208 descriptions of 1569, from 0 of 356, to 11 of 254,
anchor 0 of 478; and the worlds were not trained on them (only the cutter was, SHORT.md).

For round 2 (model side): annotated messages where descriptions fill every entity role: "connect the red circle to the blue star",
"put a hexagon left of the orange square", "move Gem under the last diamond", "link every gray square to the next one", "delete the
stars that are not yellow", with colour, quantifier (all / every / each), recency (newest / oldest / last / first) and "not <colour>";
then the schemas get SHAPE heads and COLOR attrs in landmark / source / target and the thresholds are calibrated on rows that include them.

## 4. H2: the value tokens are present but placed wrong (59 requests)

Each H2 request's reading was looked at; first cause:

| sub-cause | requests | where | examples |
|---|---|---|---|
| the reader put a relation value in the `region` role, or a region value in the `relation` role; the adapter looked each value up only in its own role's table and dropped it silently | 10 | **our code (vss-adapter.js place)**: fixed, fix 1 | "put Check to the right of Done" (region=right_of, landmark=Done -> no position), "Move Process to the top left" (relation=top_left), "could you put CEO on the left." (relation=left_side), "which teal squares in the center?" |
| the colour of a description not read (attr) | 17 | model / data (section 3: attr_rate 0.001-0.003, links7 target has no attr) | "connect the red circle to Done" -> mention(circle), "link Roof to the orange hexagon", "move E right of the pink diamond" |
| a needed role empty (description not placed) and the context filler filled it with every shape of the canvas (group candidate g_canvas) | 6 | model first (as G1); the filler's choice is a guess the text contradicts | "Connect the circles in a chain" -> from: Start, Process, Check, Done; "Link each star to the next" |
| "not <colour>" lost | 6 | model / data (manage7 and shapes7c have no notcolor role filled in data) | "Remove the triangles that are not green", "which stars that are not cyan" |
| relation / anchor not read in a long create (name, label and a position) | 8 | model | "put a medium cyan diamond named Atlas labeled "refund" right of the magenta rectangle", "now draw a large ellipse labeled "close" under the lime star" |
| second anchor of "between" lost (the second name unplaced) | 5 | model (landmark2 rate 0.022 in shapes7c) | "draw a white circle between Start and Done" -> anchor Start |
| position not read in count / list | 4 | model | "how many hexagons on the left are there?", "list gray triangles to the right of Roof?" |
| quantifier "every" not read (det) | 1 | model | "Colour every circle red" |
| "connect Start and Check" read as two set roles | 1 | model | from and to both [Start, Check] |
| "what rules are active?" read as list | 1 | model / front end | |

## 5. E, D, F (all model / front-end side; no cause in our code)

- **E, right world reads another event (45)**: "what is reachable from X?" -> path (front end maps "reachable" to path_q; 9), "which shapes
  are connected to X?" / "Which nodes point to Done?" -> list (7), "what does X say?" -> describe, not property label (4), "are there any
  cycles?" / "Any loops in the graph?" -> exists (4), "make X (a bit) larger" -> set, not resize ("larger" is no size token; 4), "what links to X?" -> connect (3), "from now on
  circles should be teal" -> set, not rule (3), "line up ... vertically" -> arrange, not align (2). The event is decided by the world's
  verb tokens (front end, learned) and these phrasings are missing or attached to another event in the data.
- **D, unknown-event / no-sense (27)**: trigger words the worlds never saw as that event's verb ("Erase Done", "Kill Process", "Wipe out
  the red ones", "delet Check" (typo), "show triangles", "what comes after Q?", "What lies downstream of Process?", "Make a copy of Done"),
  and "make the squares that are not orange gold" (no-sense: more than half the tokens unplaced). Data / lexicon (round 2 synonyms).
- **F, the right reading lost to another world's (24)**: the router keeps the reading with the fewest words not understood, and the right
  world's reading leaves more words not understood because it fails on a role (section 3): "is there a blue star?" graphq exists leaves 3
  words, shapes fact 2 (5 such); "Done is to the left of Check" graphq check 2 vs shapes fact 3 (3); "remove the arrow between Check and
  Done" manage delete 4 vs links disconnect 6 (2); "delete the circles which are not purple" questions list 3 vs manage delete 5.
  The rule (fewest words not understood) is not what fails: the right world does not understand the description / negation.

## 6. Fixes in our code, measured

### Fix 1 (adopted): the adapter places a position value by what it is (docs/js/vss-adapter.js, toNodes `place`)

A relation value (left_of, right_of, above, below, next_to, between) is a relation whichever of `relation` / `region` holds it; a region
value (top_left, center, left_side, ...) is a region whichever of `region` / `relation` / `relation2` holds it. Before, a value in the
other role matched neither table and was dropped silently (the request ran without its position). The tables are legend value -> SOP
value, not words; the same rule for every event that has a position.

| | before | after fix 1 |
|---|---|---|
| short sets, all six | 60.3 / 12.4 / 27.4, extra 53 | 61.1 / 11.1 / 27.7, extra 53 |
| written by hand (240) | 74.2 / 10.4 / 15.4 | 75.0 / 9.6 / 15.4 |
| generated (900) | 56.6 / 12.9 / 30.6 | 57.4 / 11.6 / 31.0 |
| per set (hand, blind, broad, seen, new_identities, heldout_formulations), right | 75.0, 61.7, 79.3, 59.3, 57.3, 53.0 | 75.0, 61.7, 80.7, 60.3, 57.3, 54.7 |
| 1000-message sample | 75.6 / 13.1 / 11.3, extra 335 | **77.2 / 11.4 / 11.4, extra 334** |

On the short sets 14 requests change: 10 wrong -> right, 4 wrong -> not done ("create a star called Home on the left": the front end
reads "on the left" as left_of, so the create now needs an anchor and is asked instead of drawn without a position; their cause is
the front end, H1), none right -> wrong. On the sample: right +1.6, wrong -1.7 points.

### Need read (tested, NOT adopted; vss-composer.js, registry field `need_read`, off by default)

For G1 and the 6 canvas-group fills of H2: when the filler finds an `empty` needed role and the reading has unplaced words, the same world
reads the unit again with the reader's existing option presence "all" (same event), and an empty entity role's filler is taken only when
its head (and attr / det) are words the first reading left unplaced, it fills only the roles the filler found empty, and it accounts for
every unplaced word. The description then becomes a mention node, as the rules'.

| | fix 1 | fix 1 + need read (every empty gap) | fix 1 + need read (asked gaps only) |
|---|---|---|---|
| short sets, all six | 61.1 / 11.1 / 27.7 | 62.4 / 12.1 / 25.5 | 62.2 / 12.2 / 25.6 |
| 1000-message sample | 77.2 / 11.4 / 11.4, extra 334 | 77.2 / 11.4 / 11.4, extra 333 | (not run) |

13 requests not done -> right ("turn the gray diamond black", "Connect the circles in a chain", "now turn the stars purple", "connect the
squares to each other") and 13 not done -> wrong: "make the ellipses that are not orange red" (8 of that kind: notcolor lost, sometimes the
colour taken as the new colour), "can you paint the hexagons gold" (quantifier), "make the last circle green" (recency: "last" is not a
legend token), "make the ellipse larger" (E: set, not resize, was hidden behind the question). Wrong +1.0 point on the short sets for
+1.3 right: by the rule "done wrong" first, not adopted. Without the guard "every unplaced word accounted for" it was 62.8 / 12.9 / 24.3
(23 not done -> wrong). It is kept off by default for the round-2 worlds (with descriptions in the data, the wrong ones above should read
their colour / negation and the test can be repeated).

### Desc ask (tested, NOT adopted, removed)

Do not let the filler fill an empty role from the context when the unit has an unplaced word that the role's head kinds admit (aimed at
the 6 canvas-group fills). Short sets 59.6 / 10.6 / 29.8: 10 wrong -> not done but 18 right -> not done ("turn Process into a hexagon": the
filler rightly fills target=Process from the text, and "hexagon" is unplaced). Removed from the code.

## 7. Fallback world removed (owner, 2026-11-02)

The fallback model kinds_p80_s0 read 0 of 4643 requests on the sample and 0 of 877 on the short sets. Changes:
- vss-composer.js: the registry's "fallback" is optional with router "cutter" (router "token" still needs one); no check of the worlds'
  events against a fallback legend (a new event of a new world needs no fallback); a cutter candidate "fallback" is skipped and keeps its
  place in the top 3 (the other candidates are those of before); the event cutter's check no longer looks up a fallback legend.
- docs/model/micro/registry.json and registry_short.json: "fallback" and "fallback_version" removed.
- training/sketch/llm_score.mjs: with SEG=composer and no MODEL / registry fallback, no single model is loaded ("fallback none").
- docs/js/vss-formalizer.js: loadComposerAt already loads only what the registry names (comments updated, the versioned loading untouched);
  short_bench.mjs loads through loadComposer and needed no change.
- training/sketch/stamp_models.py: a registry field `<model>_version` is removed when the registry no longer names that model; re-run: 0 changed.

Same numbers without it (fix-1 code): short sets 61.1 / 11.1 / 27.7, extra 53, in both runs, every row's VSS score and every unit
identical (0 of 1128 rows differ); sample 77.2 / 11.4 / 11.4, extra 334 in both runs, the whole ALL block identical.
Not changed (not my files): docs/js/ui.js still writes "micro-worlds and the fallback", shows a fallback row (empty name, 0 bytes) in the
composer table, says "A request no world can read goes to a general fallback reader", and VSS_HINT (51.5e6 bytes) includes the fallback.

## 8. Summary

- Of G1 + H2 (148 at the start), one cause is in our code: the adapter dropped a position value held by the other position role (10
  requests). Fixed; it also helps the long messages (sample wrong 13.1 -> 11.4).
- The rest is the world data: descriptions (shape + colour, quantifier, recency, "not <colour>") almost never fill an entity role in the
  training messages (0-3.5% per role), so the learned schemas and thresholds do not read them. A post-VSS step can recover the head of
  the description but not its colour / negation / recency, and turns as many questions into wrong requests as into right ones.
- E, D, F: event words and trigger synonyms missing from the data, and the router losing a right world that fails on a description.
- The composer never needs the drawing to formalize a description: the adapter emits a mention and the engine resolves it, as for the rules.
