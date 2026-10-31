# Step 4 diagnosis: who makes the reading errors (model, our conversion, gold, front end)

Read-only diagnosis. Model docs/model/fix_p80_s0, data = copy of dev20c/dev.jsonl (253 messages, 1126 requests), each request read alone
from its annotated span exactly as error_analysis.mjs does. Reproduced: 687 / 1126 = 61.0% fully right (same as the last known result).
Nothing in the repository was edited, no training, no commit. Scripts and raw outputs are in this folder:
diag.mjs (one row per request: normalized tokens, raw wires, presence ratios, final command, gold), all.json (its output, 1126 rows),
cls1.js / cls3.js (automatic classification), probe*.mjs and ev*.mjs (small reads of the model on single sentences and on its own training
sentences), G3.txt / G3cls.json / B1cls.json (the lists of misses).

## Classes

- M: the wires that `vss.read()` returns are wrong (the answer is not in them, or they contradict each other).
- C: the wires are right, our conversion (readingFromWires / toNodes / canon) makes the wrong command.
- L: the gold label contradicts LABEL_CONVENTIONS.md (or labels of the same construction disagree).
- F: the front end (normalize) removed or rewrote the token the model needed (the token of the gold event, or a word that carried the
  direction); the span contains the information, the normalized tokens do not.
- X: not one of the four: the information is not in the annotated span at all (pronoun or plural description whose referent is in an
  earlier sentence, or the words that decide are outside the span). error_analysis.mjs calls this "name not reachable".

Rule used to separate F from M for the event: the legend lists the verb tokens of each event (legend.json). F = the normalized span has
no token that is a verb of the gold event. M = such a token is there and the model still reads another event. C = the event of the top
wire equals the gold event but the final command differs.

## Table of counts (misses in the group; fully right is 687 of 1126)

| group | misses | M | C | L | F | X |
|---|---|---|---|---|---|---|
| 1. wrong action or type (cause B of error_analysis) | 73 | 32 | 0 | 1 | 37 | 3 |
| 2. source and target swapped (wires literally reversed) | 7 | 6 | 0 | 0 | 1 | 0 |
| 3. lists of shapes (right action, a list involved) | 119 | 78 | 2 | 0 | 1 | 38 |

Checked by hand: every one of the 73 + 119 + 7 rows was printed with span, tokens, raw wire roles and gold and read by me; the wires of
about 40 of them were opened in more detail (presence ratios, member ratios, candidate order). The automatic rule changed in 5 rows after
reading (4 in group 1 moved F to L or X, 1 in group 3 moved M to F). Group 2 was also checked on every connect / disconnect / path request
of the dev set that has two single names (see below).

Not in the three groups, for the record: "no action word recognized" (A) 92 and "reader refuses" (C of error_analysis) 9 requests.

## Group 1: wrong action or type (73)

The example in the plan, "Is Paused a circle", is read RIGHT by this model (tokens `is_q n_paused a circle`, top wire `check`). Of 52 gold
`check` questions, none of the "Is X a circle / square / triangle" form is a miss. The type errors come from elsewhere.

M (32): a verb token of the gold event is in the span but the model's top wire is another event. 27 of them have the shape
`is <name> ... <question verb>` where the plain token `is` (verb of `fact`) wins over the second verb:
- sm-0251 "Is the Gripper reachable from the Base" -> `is the n_gripper path_q the n_base`, gold path, top wire `fact`.
- hm-0362 "Is Central connected to Depot" -> `is n_central connected_q n_depot`, gold connected, top wire `fact`.
- hm-0410 "Send the Choir to the front" -> `send the n_choir bring`, gold toFront, top wire `toBack` (two verbs in the span).
Other M: "Which are the neighbors of Closed" (`which ... neigh_q`, wire `list`, 2), `send ... bring` (2), "Is the Judge the nearest to Pro".
Counts by pattern in the whole dev set: `is ... path_q` -> top wire fact 14 of 16; `is ... connected_q` -> fact 7 of 18 (10 right);
`are ... connected_q` -> connected 5 of 5; `is ... is_q` -> check 23 of 25.
Evidence that this is the model and not our reading: (a) the top wire is read straight from `vss.read`, adapter not involved;
(b) on the model's OWN training sentences (worlds/real/examples/train.sop) `is ... path_q` (gold path) is read as `fact` in 22 of 23, and
`is ... connected_q` as `fact` in 19 of 52; (c) probe: `are n_central connected_q n_depot` -> connected, event margin 0.50;
`is n_central connected_q n_depot` -> fact, margin 0.08; `n_central connected_q n_depot` alone -> unknown (no frame).
The training data has these patterns (path 23, connected 52, extreme 22 with a leading `is`), so this is not missing data.

F (37): no token of the gold event in the normalized span. Real examples:
- sm-0271 "put them left of the Xray room" -> `arrange row left_of the n_xray room` (a learned trigger rewrote "put them" as arrange row), gold move.
- sm-0576 "add a dotted link Db to Edge" -> `draw a dotted link n_db to n_edge` ("add" -> draw, "link" not -> connect), gold connect. Same for
  sm-0310, sm-0374, sm-0398, sm-0520 (5 requests "add a ... link from X to Y" read as create).
- sm-0554 "Show me the rules" -> `show me the which`: the learned trigger `rules -> which` replaces the word "rules", so the object of
  the rules question is gone (gold rules). Also sm-0452 "what the rules are".
Other F: `is it small` / `is it not red` / `Tell me if the Gifts are below...` (no `is_q` token, 3); `Which rooms can be reached from Room2`,
`Which shapes are reachable from Dock5` etc. (no `reach_q`, 4); `sever the Stock link`, `Cut the link between A and D`, `take away the link
from B3 to C5`, `remove Ned's link to Kim` (no `disconnect` token, 4); `Make every shape that is not green teal` and `Everything that is
not gold should be small` (no `make` token, 2); `Dock1 and Dock2 both connect to the Island` (the word "connect" turned into `connected_q`, 2).

L (1): sm-0166 "Is Welcome the topmost shape" gold `check` (target Welcome, position top). The same construction is labelled `extreme` in 22 of
23 training requests and in sm-0281 / sm-0507 ("Is Decorate the rightmost", gold extreme without a target). LABEL_CONVENTIONS does not say
which one a yes/no question about a superlative is. (sm-0281, sm-0507 are counted M above: their wire is `fact` anyway.)

X (3): sm-0554 "every hexagon is orange" gold rule (the words "make a rule that" are outside the span); sm-0576 "Which is the most" (elliptical);
sm-0105 "the Lamp right next to it" gold move (the verb "Put" is in the previous clause).

C (0): in no row does the top wire's event equal the gold event while the final command differs.
Where the cause sits: the model for 32 rows; the learned front end (values/triggers in front.json, applied in docs/js/front.js
`applyValues`/`applyTriggers`, Python twin training/sketch/front.py) for 37.

## Group 2: source and target swapped (7)

Method: all 40 dev requests of connect / disconnect / path whose gold has two single names (no mention, no `$new`), compared wire against gold:

| event | wires right | wires swapped | other (event misread, role absent) |
|---|---|---|---|
| connect | 20 | 0 | 19 |
| disconnect | 3 | 6 | 3 |
| path | 19 | 1 | 16 (14 of them read as `fact`, group 1) |

So there is no connect swap in the dev set. The swaps are disconnect "X from Y" (6 of the 9 requests of that form, all with
source = Y, target = X in the wires) and one path.

M (6): hm-0116 "Disconnect Pipe1 from Pump" (`source=[n_pump] target=[n_pipe1]`, presence 0.57 / 0.55), hm-0349 "disconnect Latte from Mocha",
hm-0362 "Disconnect Depot from Market" (also sm-0296, sm-0329, sm-0580). The wires are what the model returns; the adapter maps source -> from
and target -> to unchanged (vss-adapter.js, case "connect"/"disconnect"/"path"). Mechanism seen in the reader: for both roles the model's top
candidate is the second name; the one-to-one step (reader.js `oneToOne`, same as infer.py `one_to_one`) gives it to the role with the larger
margin (source), and re-reads target. The training data is consistent (disconnect with two names: source = first name in 23 of 24 examples) and the model
swaps 7 of the 15 such sentences of its own training set, so this is weak weights for a rare event (15 examples), not a data or conversion error.

F (1): sm-0580 "Can Probe3 reach Probe1" -> `can n_probe3 path_q n_probe1`, wires source = Probe1. The learned triggers map both "reach" and
"reachable from / reached from" to the same token `path_q` and swallow the word "from". In training `... path_q Y` has source = Y in 26 of 26
examples of the form `X path_q Y` ("Is X reachable from Y"), so the direction information of an active "X reach Y" is gone before the model.

C (0), L (0).

## Group 3: lists of shapes (119: a miss with the right action in which the gold or our command holds a list)

X (38): the gold names are not in the span ("Chain them", "Connect them each to the next", "Distribute them vertically", "Make both speakers huge",
"connect both to it", "Link the Queue to all three workers"): the referent is in an earlier sentence. Not a reading error; cannot be fixed
from the span (error_analysis.mjs reports it as E, name not reachable).

M (78), by what the gold asks:
- one to several, "Connect Hub to Lamp and Sensor" (gold from Hub, to Lamp,Sensor): 42. In 38 the wires contain the right pair
  (`source=[Hub]`, `targets=[Lamp, Sensor]`) but also `target=[Lamp]` and `members=[Hub, Lamp, Sensor]`; toNodes lets `members` overwrite `source`
  (from = Hub,Lamp,Sensor). hm-0035 raw: `source=[n_hub] target=[n_lamp] members=[n_hub&n_lamp&n_sensor] targets=[n_lamp&n_sensor]`.
- several to one, "Connect Goal1 and Goal2 to Metric" (gold from Goal1,Goal2, to Metric): 10. Wires: `source=[goal1] target=[metric]
  members=[goal1&goal2&metric] targets=[goal2&metric]`; no combination of the roles gives the gold in 8 of 10.
- single to single with a list role added, "Connect Hola to Adios with a dashed line": 7 (`targets=[adios&hola]` added to a right source/target).
- chain / next / all-to-each-other: 12; in 11 the first name is in no role ("Connect Base, Arm and Gripper in a chain" -> `members=[arm&gripper]`,
  `targets=[arm]`; hm-0019, hm-0042, sm-0140, sm-0556, sm-0580 ...).
- sequence forms "A to B and B to C": 4; arrange/anchor: 3 (hm-0020 "between the Flask and the Stand": landmark and landmark2 swapped
  (training has landmark first in 58 of 58), hm-0505 first member missed, sm-0283 "around the Dealer" put into the target list).
Evidence that the four-role pattern is the model and not the conversion: for the model's own training sentences the wires are
`source+target+members+targets` for 96 of 120 gold "source + targets" sentences, but also for 57 of 231 gold "members only" sentences and 26 of 38 gold
"members + target" sentences, i.e. the same four roles fire for three different gold structures, and the exclusivity that holds in all of the training
data (source never with members, target never with targets, 0 of 643 connect examples) is not reproduced. On chain sentences of its own training set the
first member is missing in 36 of 236 (members-only sentences with a pairing).
Presence check, wires only (misses only, so no claim about a rule): for the 42 one-to-several misses, the role with the larger presence/threshold ratio
within (source, members) is the gold one in 42 of 42 and within (target, targets) in 37 of 42; for the 13 several-to-one / sequence misses the pick is right for `from` in only 2 of 13.
(Thresholds from model.json: presence source 0.213, target 0.254, members 0.256, targets 0.128.)

C (2): hm-0032 "Arrange the Problem, Solution and Market in a row" and sm-0109 "Line up the Bowl, Vase and Plate in a column". Wires: `object=[problem]
members=[market, solution]`; the first name is in `object`, the rest in `members`. Location: docs/js/vss-adapter.js, line 94, `withMembers`
(`args.target = list(R.members)` overwrites `args.target = ref(obj)` set earlier in the same case), called at line 162 for every event that has `members`.

F (1): hm-0349 "Move Tea rightOf Latte": the text says `rightOf` (camel case), the front end has no value for it, so no relation reaches the model.

L (0): I found no gold label in the list group that contradicts LABEL_CONVENTIONS.md.

## Where the cause sits and the fix I would make (not done)

| finding | where | fix | same rule for every role? | Python and JS the same? |
|---|---|---|---|---|
| Group 3 C: `object` + `members` (2 rows) | docs/js/vss-adapter.js `withMembers` (line 94) | target = object and members together, ordered by position in the text, for events whose set role is the list of the same question as `object` (arrange, align, distribute, move, set, resize) | yes if the legend declares which single role a set role extends (legend reader.set_roles, now only a list of names); for connect it must NOT be applied to `source` (source + members would give Hub,Lamp,Sensor), so the legend declaration is needed | the adapter exists only in JS (it is not in infer.py); the declaration lives in legend.json, shared |
| Group 3 M, twin roles both filled (source+members, target+targets) | reader decode, after the roles are read: docs/js/vss/reader.js `read` (loop at line 322, before `oneToOne`) and training/vss/tool/sop/infer.py `read` (line 399-460) | one decision per twin pair (keep the one whose presence ratio over its threshold is larger), written once in the legend (`set_roles` with the single role each one replaces) | yes, any set role and its twin | must be written in both files and checked with parity.mjs |
| Group 3 M, first member missing; Group 2 M, disconnect swap; Group 1 M, `is` beats the second verb | the model weights (what the model returns on its own training sentences), not code | more or different training data for these constructions, or a change of the reader that is the owner's decision (AGENTS.md: new learned component needs approval) | - | - |
| Group 1 F (37), Group 2 F (1), Group 3 F (1) | learned front end: front.json triggers/values, docs/js/front.js `applyTriggers` / `applyValues`, training/sketch/front.py `learn` | look at the triggers that fire wrongly (`rules -> which`, `put them -> arrange row`, `reach` and `reachable from` -> same `path_q`, `add ... link -> draw`) and at the values missing (`rightOf`); relearn with held-out selection, no hand table | yes, one learning procedure | front.js is the twin of front.py (parity_front.mjs) |
| Group 1 L (1) | training/sketch/LABEL_CONVENTIONS.md | write down how a yes/no question about a superlative ("Is X the rightmost") is labelled, then relabel sm-0166 or the others | - | - |

## Answer to the question in the task

The plan (PLAN step 4) called groups 1, 2 and 3 "ours, in the adapter / set-role reading". Measured: the adapter is the cause of 2 of the 199 rows
(both in group 3, `object` + `members`). ERROR_ANALYSIS.md put them on the model: that is right for 116 rows (32 + 6 + 78), and the front end
explains 39 more (37 + 1 + 1) that the older text did not separate. 41 rows are information that is not in the span (3 + 38), 1 is a gold label.
