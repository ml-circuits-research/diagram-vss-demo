# Why synth_rules did not help VSS-G+S (diagnosis, 2026-11-03 night, CPU)

Question: arm VSS-G+S (results/local_GS/RESULT.md) = the shipped VSS-G chain retrained on G + `llm_train/synth_rules` (8404 synthetic short
commands that the Rules read exactly as their gold). Gain: fresh2 -0.8 [-3.9, 2.4], short3 executing everything 44.3% -> 45.7% right
(Rules 54.0%). Before tomorrow's GPU job (070_vss_all.sh, even more synthetic data): is more data the lever?

**Answer in one line: no. Most of the synthetic data never reaches the worlds in a form that can be learned. The front end's value table
turns the plural shape word (and other words) of "all the circles" into the quantifier token `all`, and the conversion to world rows has
no head for "all" without LEGEND_EXT. So 31% of the synth_rules requests become training rows that cannot produce their gold; most of
them are rows with the target missing. On the synthetic data the model reads 90% of what was convertible right (its capacity is not
the limit). On short3, 35% of the requests are out of reach of any data under the current conversion. Wrong executions concentrate there:
75% of G+S's wrong executions on short3 come from requests the world cannot express.**

## Material and method

- Models: VSS-G = `docs/model/micro/registry.json` (shipped); VSS-G+S = `docs/model/arms/GS/registry_GS.json`. Rules = `docs/js/logic.js`
  (working tree, sha256 aae68526b3b3).
- Sets (scripts and outputs in the session scratchpad, not committed):
  - **synth seen**: 500 messages / 630 requests of `llm_train/synth_rules`, sampled by sha256(id) among the messages that are identical in
    the 8396-message version (position7, questions7, links7) and in the final 8404 version (the other worlds, cutters, filler). Every
    world trained on them.
  - **synth fresh**: 807 messages / 1147 requests generated with `gen_rules_cover.make_message`, seed 4242 (training: seed 0). Kept
    only when the Rules read them exactly as the gold (30 of 900 rejected). Removed: 47 equal to a training text (lower case, no punctuation),
    0 with the same token set, 14 equal to a test text, 2 duplicates. The Rules read 100.0% of them right (checked again with `collect_rules.mjs`).
  - **short3 (510)**: the 510 requests that had SOP Lang gold in the first version of short3 (commit 576e88a, never pending). 400 messages,
    calibration and test parts together. Their current gold is used (69 of the 510 were relabelled since); the 156 pending wires are not scored.
- Composer loaded as in `fresh2/collect_vss.mjs`. Scoring and pairing as there (PAIR=value, bench-canon). Check: on
  `results/local_GS/data/short3_np_test` (the RESULT.md set) this script gives 44.3% / 16.6% wrong / 39 extras (G) and 45.7% / 16.6% / 46
  (G+S), the same as RESULT.md.
- **Stages, by oracles** (each request gets the first stage whose oracle makes it right):
  1. full composer;
  2. **cut**: the gold spans are the units (`formalize(..., {units})`);
  3. **world choice**: plus the gold world as the only candidate;
  4. **event in the world**: plus the event hint = gold event (mode H2: the world reads again with the event when it read another one);
  5. **not expressible**: the gold cannot be produced even by a perfect world. Test: the world's own training target for this request
     (`msg_to_world.py` -> `llm_to_world.convert(soft=True)` with the world's front.json), passed through the adapter (`vss-adapter.js`
     toNodes, the composer's reference rule between requests) and compared with the gold in bench-canon form. This is the ceiling:
     if the training row is wrong, more rows of it cannot teach the right answer;
  6. **not read**: no world understood a word (with all oracles);
  7. **context filler asked** (the request was asked about, not executed);
  8. **role / value reading in the world**: everything else (the model itself).
  The tokens of the Python and JS front ends agreed on all 28746 + 11685 requests checked.

## 1. Fit on its own training data

Share of requested actions; "not done" = asked or not produced.

| set | measure | Rules | VSS-G (shipped) | VSS-G+S |
|---|---|---|---|---|
| synth seen (630 requests, trained on) | right | 100.0% | 37.0% | 68.1% |
| | wrong | 0.0% | 24.4% | 13.2% |
| | not done | 0.0% | 38.6% | 18.7% |
| synth fresh (1147, new seed) | right | 100.0% | 29.4% | 58.8% |
| | wrong | 0.0% | 23.5% | 15.0% |
| | not done | 0.0% | 47.2% | 26.2% |
| short3 (510) | right | 53.9% | 43.1% | 45.1% |
| | wrong | 12.7% | 15.7% | 15.5% |
| | not done | 33.3% | 41.2% | 39.4% |

G+S misreads a third of its own training data. The split below shows that this is not capacity:

| set | requests whose gold the world can express (ceiling) | G+S right on those | G+S right on the others | G+S wrong on the others |
|---|---|---|---|---|
| synth seen | 75.9% | 89.7% (wrong 5.9%) | 0.0% | 36.2% |
| synth fresh | 70.4% | 82.8% (wrong 8.9%) | 1.5% | 29.5% |
| short3 (510) | 64.7% | 68.2% (wrong 6.1%) | 2.8% | 32.8% |

(VSS-G: ceiling 58.3% / 52.0% / 65.1%; right on the expressible 63.5% / 55.9% / 65.4%.)

On the synthetic data, G+S reads 90% of the requests it could have learned right. The 24% it could not learn are read wrong a third of the
time. On short3, 59 of the 79 wrong executions of G+S (75%) are requests whose gold the world cannot express.

## 2. Stage breakdown of the misses

Right % at each oracle level (share of requests):

| set | reader | full | + gold cut | + gold world | + gold event | ceiling (conversion + adapter) |
|---|---|---|---|---|---|---|
| synth seen | VSS-G | 37.0% | 40.6% | 41.1% | 47.6% | 58.3% |
| synth seen | VSS-G+S | 68.1% | 68.1% | 69.7% | 71.1% | 75.9% |
| synth fresh | VSS-G | 29.4% | 34.4% | 35.0% | 40.4% | 52.0% |
| synth fresh | VSS-G+S | 58.8% | 59.3% | 60.7% | 63.0% | 70.4% |
| short3 (510) | VSS-G | 43.1% | 48.4% | 50.6% | 56.7% | 65.1% |
| short3 (510) | VSS-G+S | 45.1% | 49.2% | 51.0% | 56.1% | 64.7% |

First cause of each request that is not right (share of all requests; columns = stages):

| set | reader | right | cut | world choice | event in world | not expressible | not read | filler asked | role / value reading |
|---|---|---|---|---|---|---|---|---|---|
| synth seen | VSS-G | 37.0% | 4.0% | 0.5% | 6.5% | 41.7% | 1.7% | 1.4% | 7.1% |
| synth seen | VSS-G+S | 68.1% | 0.0% | 1.6% | 1.4% | 24.1% | 0.0% | 0.3% | 4.4% |
| synth fresh | VSS-G | 29.4% | 5.1% | 0.7% | 5.3% | 47.6% | 1.6% | 1.9% | 8.5% |
| synth fresh | VSS-G+S | 58.8% | 0.5% | 1.4% | 2.4% | 28.9% | 0.2% | 1.5% | 6.5% |
| short3 (510) | VSS-G | 43.1% | 5.3% | 2.2% | 6.1% | 33.9% | 2.2% | 2.7% | 4.5% |
| short3 (510) | VSS-G+S | 45.1% | 4.3% | 1.8% | 5.1% | 34.1% | 1.4% | 4.1% | 4.1% |

(The filler never turned a right reading into a wrong one: "filler changed it" is 0.0% everywhere.)

Why the gold is not expressible (share of all requests):

| reason | synth seen G / G+S | synth fresh G / G+S | short3 G / G+S |
|---|---|---|---|
| expressible | 58.3% / 75.9% | 52.0% / 70.4% | 65.1% / 64.7% |
| description lost in the front end (its head or shape word replaced) | 12.7% / 13.0% | 15.0% / 16.6% | 3.3% / 4.7% |
| value token not produced by the front end | 21.0% / 7.1% | 24.1% / 8.3% | 6.1% / 5.5% |
| name or shape word not found (typo, unknown word) | 5.9% / 2.4% | 5.9% / 2.1% | 3.9% / 3.9% |
| a key the world's conversion has no role for (outline, layout, at, label of an arrow from/to, undo count, kind, disconnect quantifier) | 1.0% / 1.0% | 1.0% / 1.0% | 13.7% / 13.7% |
| event in no world (group, ungroup) | 0 / 0 | 0.3% / 0.3% | 3.7% / 3.7% |
| reference outside the span / pronoun (the filler's job) | 1.0% / 0.6% | 1.6% / 1.3% | 2.4% / 2.2% |
| gold format: mention keys not sorted (9 short3 wires, e.g. `mention(shape=diamond,color=yellow)`; every reader, the Rules too, is scored wrong on them) | 0 / 0 | 0 / 0 | 1.6% / 1.4% |

Where the Rules beat VSS-G+S on short3 (510): the Rules are right on 53.9%, G+S on 45.1%. The Rules are right and G+S is not on 21.5% of the
requests. Of these: 6.3% keys the world cannot carry, 3.3% descriptions lost in the front end, 1.8% value tokens, 1.8% group/ungroup,
2.5% the filler asked, 1.6% cut, 1.6% role reading, 0.8% world choice, 0.4% event. On the 275 requests the Rules read right (the forms
synth_rules was made to cover), G+S reads 60.0% right (G 57.1%), and only 72.4% of them are expressible.

The cutters learned the synthetic style almost perfectly, but this did not carry over to short3:

| set | reader | units = gold spans exactly (messages) | world cutter's label = gold world | event cutter's hint = gold event |
|---|---|---|---|---|
| synth seen | VSS-G | 78.0% | 91.0% | 77.0% |
| synth seen | VSS-G+S | 99.6% | 99.5% | 97.1% |
| synth fresh | VSS-G | 69.3% | 89.5% | 74.0% |
| synth fresh | VSS-G+S | 97.5% | 98.9% | 94.3% |
| short3 (510) | VSS-G | 72.0% | 79.2% | 67.3% |
| short3 (510) | VSS-G+S | 75.0% | 81.6% | 71.6% |

## 3. Simple commands

Opening drawing (names Backdrop, IntakeZone, ReviewZone, Start, Process, Check, Done, MainTitle, IntakeCaption, ReviewCaption) and a plain
canvas (Start, Process, Check, Done). The outputs are the same on both canvases, except that G lists 10 or 4 names.

| command | Rules | VSS-G | VSS-G+S |
|---|---|---|---|
| arrange all | arrange target=all | arrange, target filled by the filler with every name on the canvas (on the opening drawing: Backdrop, zones and texts too) | **asks which target** |
| arrange all in a circle | arrange all layout=circle | same as above, layout=circle | **asks which target** |
| align all horizontally | align all axis=horizontal | every name, axis=horizontal | **asks which target** |
| distribute all vertically | distribute all axis=vertical | every name, axis=vertical | **asks which target** |
| make Done red | right | right | right |
| connect Start to Done | right | right | right |
| delete Check | right | right | right |
| move Done below Start | right | right | right |
| bigger | nothing (no target) | asks which target | asks which target |
| undo | right | right | right |

Where they go wrong: "all" is never a role filler in a world. The conversion (`llm_to_world.convert`) looks for a head among
shapes/shape/everything (it/them/everything/all only with LEGEND_EXT=1), finds none in "align all horizontally", and writes the row with
**no target**. The world learns "align all ..." = align with no target. The G filler fills the empty target with every name on the
canvas. The G+S filler was trained on the synthetic rows, where such an empty target has the gold mention(quantifier=all), which it
cannot produce, so it learned to ask. Neither arm can say "all". With LEGEND_EXT=1 the conversion of all 20 of these requests is right
(ceiling 100%, below).

## 4. Do the new rows reach the worlds?

- **Rows**: yes. Every world's `raw/sentences.txt` grew (shapes 8047 -> 11716, ..., manage 1295 -> 2678). Of the 11685 synth_rules requests
  that belong to a world, 0.0% were dropped. **But only 68.7% of them are rows that can produce their gold** (G+S fronts; 51.9% with the
  G fronts). Missing keys: target 2513, anchor 286, position 258, axis 161, size 116, shape 108, ... The LLM-written G data are at 84.5%
  with either front (G 84.5%, G+S 84.4%): the synthetic data did not damage them, and did not fix them either.
- **The target of a plural description is lost in 68% of the synthetic ones** (1675 of 2463 targets "all the X / the X that are not C / the
  blue ones"). The reason is the **front end's value table** (`front.py learn_values`). An n-gram becomes the value it co-occurs with most
  often, and a plural description's gold carries two values: the plural shape token and `all` (quantifier). For "circles" in the manage
  world the counts tie 13 : 13, and the tie goes to `all` because the values are counted in sorted order. So "delete all the circles"
  is normalized to `delete all the all`, and the shape is gone before the world reads it. The synthetic data (56% of targets are
  descriptions) multiplied these n-grams. Value n-grams that map to `all`:

  | world | G fronts | G+S fronts | examples (G+S) |
  |---|---|---|---|
  | shapes | 13 | 79 | all hexagons, nodes, not, isn't, make all, color of the |
  | position | 2 | 45 | circles, boxes, hexagons, shapes, things, space out |
  | manage | 3 | 35 | circles, stars, shapes, ones, navy, is, not, erase, wipe the |
  | questions, links, graphq, history | 0 | 0 | |

  "not" -> `all` also blocks every "not <colour>" n-gram (any kept sub-n-gram blocks a longer one), so notColor is lost (124 shapes rows).
- **Value tables**: yes, they gain the new value n-grams (shapes 100 -> 254, position 67 -> 186, questions 85 -> 143, links 48 -> 95,
  graphq 39 -> 98, manage 20 -> 89). "Value token not produced by the front end" falls from 21.0% to 7.1% on synth seen.
- **World cutter**: trained on them (SHORT=1, 16844 messages, synth_rules 8404 used). It cuts synth almost perfectly (99.6% exact units) and
  short3 at 75.0% (G 72.0%).
- **Event cutter**: trained on synth_rules (EXTRA_DIRS) but **without SHORT=1** (the same in 070_vss_all.sh). Its hint is right on 94-97%
  of synth requests and 71.6% of short3 requests.
- **Typos**: synth_rules has typos only where the Rules' spelling step corrects them. The VSS front end has no such step, so a row like
  "line up all dimaonds" is trained without its target. 2.4% of synth seen.

## 5. Conclusion and levers

| lever | evidence | verdict |
|---|---|---|
| more data of the same kind | synth seen: 89.7% right on the expressible; 0% on the 24% that are not expressible; short3: 35.3% out of reach of any data | **not the lever** until the conversion is fixed |
| epochs / capacity | 89.7% of the expressible training requests right, 93.7% with every oracle | not the lever |
| front-end value table (the `all` collapse) | 68% of synthetic plural-description targets lost; 13.0% of synth seen not expressible for this reason; tie 13 : 13 broken alphabetically | **main cause on synthetic data**; fix tested below |
| conversion keys / LEGEND_EXT / DIAGRAM_OPS | short3: 13.7% keys with no role + 3.7% group/ungroup; "all" has no head without LEGEND_EXT | **main cause on short3**; LEGEND_EXT=1 is already in 070 |
| cut | G+S: 0.0% of synth seen, 4.3% of short3 | style gap, small |
| world choice | 1.6% / 1.8% | small |
| event in world (event cutter) | 1.4% / 5.1%; hint right on 71.6% of short3 | second; event cutter without SHORT=1 (tested below) |
| context filler | asked 0.3% synth / 4.1% short3 (G 2.7%); never changed a right reading | follows the conversion: it learned to ask for the "all" targets it cannot fill |
| gold convention | 9 short3 wires with unsorted mention keys (1.4-1.6%, every reader scored wrong) | fix the gold (bench-canon could sort mention keys) |

## 6. Tested tonight (CPU, one change each, scratch models only; nothing under docs/model was written)

**A. Front-end value table: pick the most specific value (VAL_PICK=specific).** The one change: among the values that pass the existing
bars (count >= 5, precision >= 0.8), an n-gram stands for the value with the fewest requests in the rows, not for the most frequent
one with ties broken alphabetically. Nothing else changed: same data (manage7 on the final synth_rules, position7 on the 8396 version they
were trained on), same settings and seed, same cutters and context filler as G+S. Before = the shipped G+S worlds. The rule reproduces the
shipped G+S fronts byte for byte when switched off. It changes 13 n-grams in manage ("circles", "stars", "navy" ... -> their own value),
15 in position, 28 in shapes; 0 elsewhere. Training time: manage7 227 s, position7 1102 s.

| set (requests of the two rebuilt worlds) | measure | G+S before | G+S after |
|---|---|---|---|
| synth seen (manage + position, 187) | right | 60.4% | 71.7% |
| | wrong | 7.0% | 5.3% |
| | expressible (ceiling) | 62.6% | 72.7% |
| synth fresh (375) | right | 46.9% | 59.2% |
| | wrong | 8.8% | 13.1% |
| | expressible | 51.5% | 63.5% |
| short3 (166) | right | 42.2% | 44.6% |
| | wrong | 13.3% | 12.7% |
| | expressible | 60.8% | 62.7% |
| whole sets: synth seen / synth fresh / short3 | right | 68.1% / 58.8% / 45.1% | 71.4% / 62.8% / 45.9% |
| | wrong | 13.2% / 15.0% / 15.5% | 12.9% / 16.4% / 15.1% |
| | extras (count) | 35 / 77 / 67 | 32 / 65 / 66 |

It works where it was aimed: +10 to +12 points right on the synthetic descriptions of these worlds. On short3 it moves 4 requests (2.4
points on 166, noise): short3's descriptions are few (4.7%) and its misses are elsewhere (keys and events of no world). The 10
simple commands give the same output as before (the "all" target still has no head without LEGEND_EXT). Wrong on synth fresh rose
(8.8% -> 13.1%): more requests are executed, and some of the restored descriptions are read with a wrong filter. Not analysed further tonight.

**B. Event cutter with SHORT=1** (the world cutter has it, the event cutter does not; 070 is the same). Hint = gold event on short3: 71.6%
-> 72.7%; right 45.1% -> 45.5% (2 requests); synth unchanged. **Not a lever.**

**C. Tomorrow's setting, conversion only (no training): LEGEND_EXT=1, the EXTRA_DIRS of 070, GROUPS_8**, fronts learned as msg_to_world
learns them. Share of requests whose world row reproduces the gold (ceiling), and the share whose row turns a description into **"every
shape"**: "remove all the stars" -> delete target=mention(quantifier=all). The front end has made "stars" into `all`, and LEGEND_EXT then
takes the token `all` as the head.

| folder | G+S today (no LEGEND_EXT) | 070 as drafted | 070 + VAL_PICK=specific |
|---|---|---|---|
| synth_rules (11707 requests) | 68.7% | 77.4% (every shape: 4.1%) | 82.4% (every shape: 0.5%) |
| synth_combo (4521) | | 75.4% (4.2%) | 80.4% (0.5%) |
| synth_rules_ext (3664) | | 81.8% | 83.1% |
| synth_rules_ops (1470) | | **39.0%** (21.1% in no world; position2/anchor2, at, linked, outline have no role) | 39.5% |
| G data, LLM-written (28746) | 84.4% | 84.8% (0.3%) | 85.1% (0.1%) |
| short3 (510) | 64.7% | 70.6% (every shape: 1.6% = 8 requests, e.g. "remove all the stars", "trash the small squares", "delete the stars") | 71.6% (0) |
| the 10 simple commands, 2 canvases (20) | 60% (the 4 "all" commands are not expressible) | 100% | 100% |

LEGEND_EXT=1 is the change that matters most for short commands: "all" gets a head, and +6 points of short3 become expressible. Without the
value fix, though, it trains about 670 synthetic rows (4.1% of synth_rules + 4.2% of synth_combo) that read "delete all the circles" as
"delete every shape", the worst kind of confident mistake. The ceiling of short3 stays at 71.6%: 13.7% of it are keys no converter carries
and 3.7% are groups. More data cannot reach those.

## 7. Suggested changes for tomorrow (070_vss_all.sh; not edited)

1. **Code, before the job** (front.py, an off-by-default switch, recorded in BUILD.json by train_micro.sh): `VAL_PICK=specific` in
   `learn_values`, as `front_patch.py` of this diagnosis does. Then in 070:
   ```diff
   -export EXTRA_DIRS LEGEND_EXT=1
   +export EXTRA_DIRS LEGEND_EXT=1 VAL_PICK=specific   # front.py: an n-gram stands for its most specific value (VSS_SYNTH_DIAGNOSIS.md)
   ...
   -    print(f"{w}\t{w}8\t{','.join(g[w])}\t{env} FAST=1 FAST_MEM_MB=256 LEGEND_EXT=1")
   +    print(f"{w}\t{w}8\t{','.join(g[w])}\t{env} FAST=1 FAST_MEM_MB=256 LEGEND_EXT=1 VAL_PICK=specific")
   ```
   and `"VAL_PICK"` added to KEYS. If the switch is not in front.py by then, do not drop LEGEND_EXT: run as drafted, but report the
   "every shape" rows (4.1%) and check "delete all the circles" by hand before any shipping.
2. **Leave synth_rules_ops out of EXTRA_DIRS** until its keys have roles (DIAGRAM_OPS=1 and converters for at / outline / linked /
   position2): only 39% of its requests become rows that reproduce the gold.
   ```diff
   -EXTRA_DIRS="... llm_train/synth_rules llm_train/synth_rules_ops llm_train/synth_rules_ext ..."
   +EXTRA_DIRS="... llm_train/synth_rules llm_train/synth_rules_ext ..."
   ```
3. **Add a ceiling check to the data checks of 070** (before training, CPU, under a minute per folder): for each EXTRA_DIRS folder, the share of
   requests whose world row reproduces the gold and the share broadened to every shape. A folder with a low share adds rows that teach
   dropping keys.
4. Not worth changing: epochs or capacity (90% of the expressible training requests are read right), event cutter SHORT=1 (+0.4 point).
5. Gold: sort the mention keys of the 9 short3 wires (or let bench-canon canonWant sort them); today every reader is scored wrong on them.

What more data cannot fix, on short3 (510): 13.7% keys without a role, 3.7% groups, about 4% names and typos the front end does not know,
and the style gap of the cut and the event (cut 4.3%, event 5.1%, world 1.8%: the cutters read synth at 97-99.6% and short3 at 72-82%).
The data that would help there is realistic short commands like short3 (the owner's "people fall back to short commands"), not more
template commands.

## Files

Scripts and outputs in the session scratchpad (not committed): `work/diag.mjs` (oracle stages + ceiling), `work/ceiling.py`, `ceiling2.py`,
`ceil_only.mjs` (conversion + adapter ceiling), `ceilclass.py`, `agg.py`, `cross.py`, `cutters.mjs`, `simple_show.mjs`, `gen_fresh.py` (fresh
synth, seed 4242), `front_patch.py`, `build_world_x.py`, `train_x.sh`, `learn_fronts.py`.
