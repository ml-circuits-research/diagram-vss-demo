# ROUND2.md: one retraining round of the 7 worlds with every measured fix (pre-registered 2026-11-02, before any training)

The owner wants each of the 7 VSS micro-worlds retrained once, not once per fix. This file says what goes into round 2, the evidence for
each part, the exact commands, and what is measured afterwards with which thresholds. Nothing here is trained yet; the data of every
world was built dry (no training) on this machine. Every change is behind a switch whose default reproduces the old build exactly, and
every switch is recorded in BUILD.json.

## 1. What changes, and the switch of each

| # | change | switch (default off) | where | evidence |
|---|---|---|---|---|
| 1 | presence thresholds fitted on all training rows | `N_CAL=100000` | sop train `--n_cal` (train_micro.sh) | BETWEEN.md, read-time refit on shapes7c |
| 2 | colour of a new shape in the event role `color` | `CREATE_COLOR=role` | llm_to_world.py | CREATE_COLOR.md (shapes7c, already in use) |
| 3 | a longer value n-gram is blocked only by a sub-n-gram that explains it | `VAL_SUB=value` | front.py learn_values | dry build (section 3), read time on shapes7c |
| 4 | a value's precision counted over requests of events that carry its kind | `VAL_PREC=event` | front.py learn_values | dry build, read time on shapes7c |
| 5 | data: the 3000 short one-request messages | `SHORT=1` | front.py train_dirs | SHORT.md (cutter); dry build here |
| 6 | data: the messages of the new operations | `OPS=1` | front.py train_dirs | DIAGRAM_OPS.md section 7 (being written) |
| 7 | groups and double positions in the conversion and legend | `DIAGRAM_OPS=1` | llm_to_world.py, msg_to_world.py, front.py | DIAGRAM_OPS.md sections 4-6 |

`DRY=1` (train_micro.sh) builds a world's data and stops before training (no model, docs/ untouched).

Check that the defaults change nothing: with all switches off, the dry build of each of the 7 worlds gives byte-identical
`raw/sentences.txt`, `legend.json`, `kinds.tsv`, front values and triggers, and `examples/{train,calib}.sop` (world name aside) to
the build folders of the current worlds (worlds_micro/shapes7c, links7, position7, graphq7, questions7, manage7, history7), before and
after all the edits of this round.

### Fix 3 and 4: what the rules are

- `VAL_PREC=event` (BETWEEN.md, "the count of a new group"): front.learn_values keeps an n-gram for its best value v when count >= 5
  and precision >= 0.8; the precision was counted over every request of the world. Now it is counted over the requests of the events
  that carry v's kind, where an event carries a kind when at least one of its requests has a gold value of that kind (the same rule
  that gives the legend its roles: from the rows). Same rule for every kind. In shapes7c "three" had precision 0.67 (22 of 33 spans;
  9 set and 2 fact spans cannot have a count), so the bigram "add three" -> 3 was learned and ate the verb; now "three" -> 3 (22/22).
- `VAL_SUB=value` (fix 3): an n-gram used to be dropped when any shorter n-gram inside it was kept. Now it is dropped only when that
  shorter n-gram explains it: it gives the same value, or its own value is still in the gold of the longer n-gram's requests with
  precision >= 0.8 (the same bar). "bottom left" -> bottom_left (5/5) is now kept although "left" -> left_of is kept, because
  left_of is not gold in those spans; "circles near" -> circles stays dropped, because "near" -> next_to is gold in those spans
  (a first version without this second condition swallowed "near" in 13 create rows; measured and corrected before this file).

### Fix 3: the value synonyms, what the data allow (the honest result)

The request was: when a span says "box" for gold rectangle ("big", "beneath", "upper left corner" ...), the converter should write
the role on the word the span uses, learned from the annotation, not from a table. Measured:

1. Writing the role on the raw word alone changes no output: vss-adapter.js maps only legend tokens to values (`SHAPES[head]`), so a
   world that reads "box" as the object head still produces the default circle. For the output to change, the word must reach the
   world as the legend token, i.e. the front's value n-grams must map it (learned, front.json `values`); the converter then finds it.
   So the fix belongs in front value learning, and the converter needs no change for it.
2. The synonyms are rare in the annotated spans (all 9 folders): box 81 spans, rectangle in the gold of only 19 (in the others "box"
   is a generic noun: "the Halt box", "Delete the Check2 box": the annotation does not give a shape); beneath 4, underneath 2, giant
   1, silver 3 (gray), grey 4, "upper left" 0, "close to" 9 (split over 3 worlds). With FRONT_ROWS=world none reaches count 5 and
   precision 0.8 in its world, and "box" -> rectangle would be wrong in about half of its uses. Big -> large is already learned
   where size is a role (shapes7c).
3. Counted with an analysis-only synonym list (SHORT.md section 4's list plus position words; never used by a reader): lost values
   whose span says the value by a synonym: shapes7c 14 (+9 create rows where "box" is the only shape word), graphq7 6, position7 3,
   questions7 2, the others 0, of 22702 requests. The losses of the conversion are mostly other causes (section 3).
4. Tried and rejected: values learned from all requests of every world (`VAL_ROWS=all`, with VAL_PREC=event so a word only competes in
   events that carry the kind): shapes7c dropped values 226 -> 233 and the front learned other worlds' words ("in" -> chain, "these"
   -> chain, "person" -> mostconnected, "from" -> farthest). Precision per request instead of per event: shapes7c learned "an" ->
   orange, "on the" -> small, "must" -> large. Neither is in round 2; the switch was removed from the code.

What fix 3 does carry: VAL_SUB=value, the multi-word values that a shorter, wrong n-gram blocked.

### Fix 4: where it is switched on, and why not everywhere

The rule is the same everywhere; per world it is switched on only where its dry build drops fewer values and event tokens than
without it (decided here, before training, from the conversion counts of section 3):

| world | values dropped (fillers), default -> VAL_PREC=event | event token not found | on in round 2 |
|---|---|---|---|
| shapes7 | 226 -> 208 (NUM 20 -> 2) | 934 -> 902 | yes |
| questions7 | 53 -> 48 (SUPER 18 -> 13) | 153 -> 151 | yes |
| links7 | 596 -> 596 | 137 -> 154 | no |
| position7 | 222 -> 283 (DIR 4 -> 39, POS 160 -> 187) | 112 -> 111 | no |
| graphq7 | 55 -> 55 | 180 -> 181 | no |
| manage7 | 8 -> 8 | 35 -> 36 | no |
| history7 | 0 -> 0 | 11 -> 11 | no (no value n-grams) |

(Counts of valexp3.py, scratchpad; they count every request of the world's events, msg_to_world counts only kept rows, hence the small
differences from section 3.) Why position7 loses: "to the right" -> right_of passes 0.8 by one occurrence (209 of 261 move spans;
before, 209 of 262 with one arrange span) and then eats the direction of "move X 50 pixels to the right" (35 rows); "at the top" -> top
(176/217) eats "at the top left". These n-grams are ambiguous inside move itself; the 0.8 bar decides them. links7 loses 17 event
tokens because the rule adds "arrow between" -> two_way, which changes the trigger rules learned on top of the values ("NAME to NAME
with a dashed arrow" rows). Not fixed in this round.

## 2. Read-time evidence (model unchanged, only the front.json swapped or the thresholds refitted)

shapes7c, gold per event (`MODEL=<model> SEG=gold node training/sketch/llm_score.mjs planB7/goldev/<event>`, right / wrong / not done
per request; planB7 = scratchpad/planB7):

| | create | set | resize | fact | rule |
|---|---|---|---|---|---|
| shapes7c (today) | 70.5 / 19.8 / 9.7 | 61.7 / 21.0 / 17.3 (CREATE_COLOR.md) | 65.6 / 26.7 / 7.7 | 83.5 / 8.0 / 8.5 (CREATE_COLOR.md) | 70.6 / 1.7 / 27.8 |
| thresholds refit on all rows (fix 1, BETWEEN.md) | 76.0 | 67.9 | 69.6 | 86.4 | 70.6 |
| front of VAL_PREC=event + VAL_SUB=value (fix 3+4) | 74.4 / 18.3 / 7.3 | = (PAIR=value 63.7 -> 63.6) | -0.8 (PAIR=value 65.6 -> 64.8) | = | 73.9 / 1.1 / 25.0 |

The front swap is a lower bound of the trained effect: the model was trained on rows normalized by the old front ("3 small pink
ellipses" with no verb), and the new front gives "draw 3 small pink ellipses". The two causes are different requests (the second
anchor of "between" for fix 1, the count and the verb for fix 4), so the gains are expected to add up only in part.
With PAIR=value (the composer's scoring) the same runs give create 71.3 -> 74.5 (VAL_PREC=event alone) -> 74.9 (both).

No read-time evidence exists for the other six worlds (N_CAL was refit at read time only on shapes7c); for them round 2 is expected
to be at least as good, and regressions are what is checked.

## 3. Dry build of the data (no training), rows and values dropped

`DATA=spans FRONT_ROWS=world DRY=1 <switches> bash training/sketch/train_micro.sh <name> <events>` (msg_to_world.py prints the line
"Values left out per legend question kind"; "values" = value fillers whose legend token is not in the normalized span, by legend
question; the rows are kept, the role is left out). Configurations: **base** = the current builds; **r2** = fixes 2-4 as switched in
section 1 (VAL_SUB=value everywhere, VAL_PREC=event in shapes and questions); **r2+short** = r2 + SHORT=1; **r2 full** = the round-2
commands (r2 + SHORT=1 OPS=1 DIAGRAM_OPS=1, new events in manage and questions) on the new-operation data as they were at the time
of the build (partial: ops_positions and ops_groups were still being written, about 4-6 files of 40 messages each).

| world | rows base / r2 / r2+short / r2 full | values dropped base -> r2 | event token not found base -> r2 |
|---|---|---|---|
| shapes7 | 6334 / 6334 / 7046 / 7159 | 256 -> 233 (NUM 20 -> 2, POS 51 -> 46) | 926 -> 894 |
| links7 | 3596 / 3596 / 3829 / 3847 | 596 -> 596 | 136 -> 136 |
| position7 | 4375 / 4375 / 4930 / 5076 | 216 -> 216 | 101 -> 101 |
| graphq7 | 2729 / 2729 / 3160 / 3205 | 57 -> 45 (NOTCOLOR 37 -> 25: "not blue", "not red") | 155 -> 155 |
| questions7 | 3959 / 3959 / 4512 / 4596 | 54 -> 49 (SUPER 12 -> 7) | 127 -> 125 |
| manage7 | 1091 / 1091 / 1369 / 1462 | 8 -> 8 | 35 -> 35 |
| history7 | 536 / 536 / 710 / 710 | 0 -> 0 | 0 -> 0 |

Values dropped per kind, base -> r2 full (partial ops data): shapes7 {COLOR 47, NOTCOLOR 7, NUM 20, POS 51, RECENT 6, SHAPE 110,
SIZE 15} -> {COLOR 48, NOTCOLOR 13, NUM 5, POS 108, RECENT 8, SHAPE 144, SIZE 15}; links7 {ARROW 14, PAIR 564, RECENT 3, STYLE 15} ->
{ARROW 20, PAIR 570, RECENT 3, STYLE 15}; position7 {AXIS 41, DIR 4, LAYOUT 3, NUM 2, POS 159, RECENT 7} -> {AXIS 49, DIR 4, LAYOUT 6,
NOTCOLOR 2, NUM 2, POS 218, RECENT 11}; graphq7 {COLOR 1, NOTCOLOR 37, POS 8, SHAPE 5, SIZE 6} -> {COLOR 1, NOTCOLOR 38, POS 41,
SHAPE 10, SIZE 3}; questions7 {COLOR 4, NOTCOLOR 24, POS 6, SHAPE 8, SUPER 12} -> {COLOR 4, NOTCOLOR 37, POS 15, SHAPE 4, SUPER 16};
manage7 {NOTCOLOR 3, NUM 1, RECENT 4} -> {NOTCOLOR 6, NUM 1, RECENT 2}; event token not found: shapes7 926 -> 1019, links7 136 -> 159,
position7 101 -> 113, graphq7 155 -> 259, questions7 127 -> 183, manage7 35 -> 53.

Reading:
- links7 (PAIR 564: chains whose pairing word is not a legend token) and position7 (POS 159) carry most dropped values; round 2 does
  not change them. They are listed for a later step.
- The short data add 233 to 712 rows per world. Their event token is missing more often than in the long data (shapes7: 129 of 712
  new rows, 18%, against 14% before): their verbs are often rare ("slap", "hook up", "sever") and a trigger needs 2 occurrences.
- The new-operation rows lose many region / second-relation values (POS: shapes7 +38, graphq7 +31, position7 +54): canvas places in
  words the world's front does not map yet ("bottom right corner", "in the middle" -> center 15, bottom_right 20 in shapes7). With
  partial data the n-grams do not reach count 5; DIAGRAM_OPS.md 6.5 asks to check this. **Re-run the dry build when the data are
  final; if POS dropped in the new rows is still above a third of them, report it before training.**
- New events and roles appear as DIAGRAM_OPS.md section 5 says: manage7r2 group (object, name, members; 45 rows at the time),
  ungroup (object; 19); questions7r2 members (object; 19), groupOf (object; 24); relation2 / landmark3 / region in create and fact
  (shapes7r2), move (position7r2), check and exists (graphq7r2), count and list (questions7r2).
- Texts unchanged: the sha256 of every tracked llm_train / llm_bench .jsonl file is the same before and after all dry builds, and
  `git status` shows no change there (the pipeline only reads them).

Do the short messages help the worlds? The worlds read spans, and the spans of the long data are already short (median 2-9 words); a
short message's span is the same kind of text. What they add is more requests per action (60-309 each) and the verbs people type in
the demo; the short sets' misses of the worlds (SHORT.md causes D, E, H1: 111 requests) are where they can help. They do not fix the
cut (cause A), which is the cutter's (cutter_worlds7s). Their effect is not separated from the other changes in this round.

## 4. Commands (one per world; GPU jobs in scratchpad/round2_jobs/011..017)

Common: `N_CAL=100000 CREATE_COLOR=role VAL_SUB=value SHORT=1 OPS=1 DIAGRAM_OPS=1 SEED=0 DEVICE=cuda VSA_MEM_FRACTION=0.45 SOP_PYTHON=python3
DATA=spans FRONT_ROWS=world N_EVAL=150 EVAL_MODES=primary VSA_MAX_HOURS=16`, then:

```
<common> VAL_PREC=event bash training/sketch/train_micro.sh shapes7r2 create,set,resize,fact,rule
<common> bash training/sketch/train_micro.sh links7r2 connect,disconnect
<common> bash training/sketch/train_micro.sh position7r2 move,swap,arrange,align,distribute,toFront,toBack
<common> bash training/sketch/train_micro.sh graphq7r2 check,connected,path,reachable,cycle,exists
<common> VAL_PREC=event bash training/sketch/train_micro.sh questions7r2 count,list,extreme,nearest,describe,neighbors,degree,property,members,groupOf
<common> bash training/sketch/train_micro.sh manage7r2 delete,duplicate,rename,label,group,ungroup
<common> bash training/sketch/train_micro.sh history7r2 undo,redo,forget
```

CREATE_COLOR=role changes only create rows (shapes7r2); it is given to every world so the commands are uniform. Each job stops if
llm_train/{sonnet_short, haiku_short, ops_groups, ops_positions} has no msg_*.jsonl. The gpu-runs branch must carry this commit (the
switches are in front.py, llm_to_world.py, msg_to_world.py, train_micro.sh).

## 5. Also needed in the same round (not in these jobs; the composer cannot load the r2 worlds without them)

1. The new-operation data final (llm_train/ops_groups, ops_positions; texts saved before annotation and checked), then the dry build
   of section 3 again (`DRY=1`, the commands above without DEVICE), compared with this file.
2. `worlds_micro/GROUPS_7.json` (manage += group, ungroup; questions += members, groupOf) and `worlds_micro/GROUPS_EVENTS.json` (+ one
   world per new event), as DIAGRAM_OPS.md section 5 says; train_cutter.py needs the ops folders in its DIRS (behind a switch, as
   SHORT=1) and DIAGRAM_OPS=1 for the new event tokens; then both cutters retrained:
   `SHORT=1 OPS=1 DIAGRAM_OPS=1 python3 training/sketch/train_cutter.py --worlds training/sketch/worlds_micro/GROUPS_7.json --out docs/model/micro/cutter_worlds7r2.json`
   and the same with `GROUPS_EVENTS.json` -> `cutter_events_r2.json` (train_cutter.py is not changed by this round; its owner adds
   the switch).
3. No fallback: the fallback model (kinds_p80_s0) was removed from the composer and the registry on 2026-11-02 (it read 0 requests), so
   there is nothing to retrain here and the composer no longer checks the worlds' events against a fallback legend (run_curve.sh, which
   built single models, was deleted).
4. `docs/model/micro/registry_r2.json` = registry.json with the 7 r2 models, the r2 events of manage and questions, the r2 cutters
   and no fallback (make_registry_r2.py); then `stamp_models.py` for the versions.

If the ops data are not ready, the 7 worlds can still be trained and measured per event (SEG=gold needs neither the
cutter nor the registry), but not in the composer.

## 6. Measures and thresholds (fixed now)

All per requested action: right / wrong / not done (%), and extra. The baseline is today's worlds and today's default registry.

**A. Per event, SEG=gold** (`MODEL=micro/<world>r2 SEG=gold node training/sketch/llm_score.mjs planB7/goldev/<event>` for every event of the
world, planB7 = scratchpad/planB7; the same command on the current world gives the baseline; PLAN_B.md's G7 column and CREATE_COLOR.md
are the numbers today).

It worked (shapes7r2 against shapes7c, the worlds with read-time evidence):
- create right >= 76.0 and wrong <= 16.5 (70.5 / 19.8; read time: 76.0 with fix 1, 74.4 with fixes 3+4);
- between position+anchor right >= 95 of 131 (57) and one-anchor readings <= 10 (52) (BETWEEN.md table);
- the count of a new group: gold `count` read right in >= 70 of the 87 create requests that have one (BETWEEN.md: 48 lost);
- set right >= 65.7, resize >= 67.6, fact >= 84.5 (read time 67.9, 69.6, 86.4, minus 2), rule >= 72.0 (read time 73.9 with the new
  front, minus 2).

Regression (any of these means round 2 is not adopted for that world as it is):
- any event of any world: right more than 1 point below, or wrong more than 1 point above, its current world (same command);
- position7r2 per position value (BETWEEN.md table, move): position+anchor right more than 2 requests below for any value.

**B. The composer on the fixed 1000-message sample** (`PAIR=value SEG=composer REGISTRY=docs/model/micro/registry_r2.json node
training/sketch/llm_score.mjs $(ls -d scratchpad/planA/sampleF/*)`). Baseline: today's default registry (cutter_worlds7s) 75.5 / 13.1 /
11.3, extra 336 (the figure the request names, 74.9 / 13.1 / 12.0, extra 302, is the earlier registry with cutter_worlds7; both are
reported). It worked: right >= 76.5, wrong <= 13.1, extra <= 370. Regression: right < 75.0 or wrong > 13.6. The cutters change too
(new data, new labels), so a change here is not attributed to the worlds alone.

**C. The demo's short sets** (`cd training/sketch/short_bench && REGISTRY=../../../docs/model/micro/registry_r2.json node short_bench.mjs
out_r2.json; python3 agg.py out_r2.json; python3 classify.py out_r2.json`). Baseline (default registry, SHORT.md "Result"): all six
sets 60.5 / 12.4 / 27.1. It worked: right >= 61.5 and wrong <= 12.4. Regression: right < 60.0 or wrong > 12.9.

**D. The new operations** (first measurement): one gold file per new event (group, ungroup, members, groupOf) and one for the requests
with two relations or region + relation, from llm_train/ops_* in the format of planB7/goldev; SEG=gold per event. It worked: each new
event right >= 60 and wrong <= 15; double positions: every part (position, anchor, position2, anchor2, region) right in >= 50% of
the requests. These are training messages (AGENTS.md: worlds are measured on the data they are trained on); a fresh set written after
training is better and is not part of this round.

After the measures: error_analysis.mjs on the misses of A for shapes7r2 and of D, and a report in plain words. A miss is reported, not
patched.

## 7. Not in round 2 (debt, listed; not measured enough to carry)

- Value n-grams applied left to right, longest at the earliest position: "at the top left" -> "top left_of" (the 3-gram "at the top"
  starts first). An order that prefers the longest match over the earliest needs a JS change too (front.js) and parity checks.
- Ambiguous position phrases inside move ("to the right": relation 209, direction 35, region 15) decided by the 0.8 bar; the value of a
  phrase that depends on what follows ("of NAME") needs context in the value rules.
- links7: PAIR values dropped in 564 rows (chains: "A to B, B to C" has no pairing word); position7 POS 159.
- Names that are colour words ("Green green", "Red is red"): the colour token is read as a name; rows lose the colour (shapes7 ~25).
- "box" as rectangle only as a head of create (19 of 81 spans): a learned head-word -> value map read by the adapter would be the
  place; vss-adapter.js is not changed in this round.

## 8. Files

Changed: training/sketch/front.py (VAL_PREC, VAL_SUB, train_dirs SHORT / OPS, group names under DIAGRAM_OPS, front.json field
`value_learning`), training/sketch/llm_to_world.py (DIAGRAM_OPS), training/sketch/msg_to_world.py (rows carry `groups`, group names as
created names, per-kind dropped values in REAL_WORLD.md and on stdout), training/sketch/train_micro.sh (switches, DRY, BUILD.json).
docs/js/front.js is unchanged: front.json keeps its format (the new field is not read), and learning is Python only.
Scratch (not in the repository): scratchpad/r2/ (dry-build reports dry/*.txt, valexp3.py, read-time models m/, readtime.txt),
scratchpad/round2_jobs/ (the 7 GPU jobs).

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/kinds_p80_s0` (a76b4e3), `docs/model/micro/shapes7` (9aaacfc). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
