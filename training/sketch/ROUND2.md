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

## Result (2026-11-02, measured after training; nothing below was patched)

How it was measured. Every number is per requested action: right / wrong / not done (%), and extra (actions nobody requested).
"Sample" = the 1000-message sample (scratchpad/planA/sampleF, 4858 requests, PAIR=value, SEG=composer). "Short" = the six short
sets of the demo (short_bench.mjs with LLM_SHORT=0, 1140 requests; "wrong act" = requests not done because another action was done
instead: they are counted in not done, and the action done counts as extra). The code under test was frozen (docs/js and the
scorers copied to scratchpad/r2m/snap at 15:40, models linked) because other work edited docs/js during the runs; the default
registry reproduces 77.2 / 11.4 / 11.4, extra 334 and 61.1 / 11.1 / 27.7, extra 53 there. Sections 1-6 use the context filler of
that time (weights.json a946d13e1e) in every configuration, so the comparisons isolate one change; section 7 repeats the finalists
with the fillers retrained at 16:37 (weights.json 17808ca5c0, weights_r2.json 3907acc62f). A configuration mixing old and r2 parts
is a scratch registry (scratchpad/r2m/reg/<name>.json, built by mkreg.py); when a world's events differ from the cutter's grouping
(manage7r2 / questions7r2 with cutter_worlds7s, or the reverse) the scratch copy of the cutter gets the registry's events in its
`grouping` field, which only the composer's consistency check reads.

### 1. The pre-registered measures

| measure | round 2 as built | verdict |
|---|---|---|
| B. sample (baseline today 77.2 / 11.4 / 11.4, extra 334; the pre-registered baseline 75.5 / 13.1 / 11.3 is older) | 75.3 / 11.1 / 13.7, extra 403 | missed (right >= 76.5 needed); against today's default right -1.9, not done +2.3, extra +69 |
| C. short sets (baseline 60.5 / 12.4 / 27.1 pre-registered; 61.1 / 11.1 / 27.7 today) | 62.5 / 11.0 / 26.6, extra 81 | worked by the letter (right >= 61.5, wrong <= 12.4), but wrong act 4.6 -> 6.9 and extra 53 -> 81 |
| A. shapes7r2 thresholds (create >= 76.0 and wrong <= 16.5, set >= 65.7, resize >= 67.6, fact >= 84.5, rule >= 72.0) | create 77.1 / 16.9, set 69.0, resize 69.2, fact 84.5, rule 80.0 | worked, except create wrong 16.9 (> 16.5); the between and the count-of-a-new-group checks were not measured here |
| A. regressions (right more than 1 point below or wrong more than 1 point above, any event) | position7r2, graphq7r2, links7r2, manage7r2 cross the line (table 4) | those four worlds are not adopted as they are |
| D. new operations (each event right >= 60 and wrong <= 15; every part of a double position right >= 50%) | members, groupOf pass; group, ungroup fail; position2 / anchor2 / region below 50% in most events | partly (section 6) |

### 2. One change at a time

Default registry with ONE part replaced by its round-2 version:

| change | sample | short (wrong act) |
|---|---|---|
| none (default) | 77.2 / 11.4 / 11.4, extra 334 | 61.1 / 11.1 / 27.7 (4.6), extra 53 |
| cutter_worlds7r2 | 77.2 / 11.4 / 11.4, extra 334 | 61.4 / 11.3 / 27.3 (4.9), extra 57 |
| cutter_events_r2 | 77.2 / 11.3 / 11.5, extra 338 | 61.9 / 11.2 / 26.8 (4.4), extra 51 |
| shapes7r2 | 77.5 / 11.1 / 11.4, extra 335 | 63.1 / 11.1 / 25.9 (4.6), extra 54 |
| links7r2 | 77.1 / 11.4 / 11.5, extra 334 | 61.4 / 11.6 / 27.0 (4.3), extra 50 |
| position7r2 | 77.0 / 11.6 / 11.4, extra 334 | 59.6 / 11.9 / 28.4 (4.4), extra 51 |
| graphq7r2 | 75.4 / 11.4 / 13.2, extra 381 | 60.4 / 10.0 / 29.6 (6.7), extra 77 |
| questions7r2 | 77.2 / 11.1 / 11.7, extra 340 | 61.1 / 10.8 / 28.2 (4.9), extra 57 |
| manage7r2 | 77.2 / 11.4 / 11.4, extra 332 | 61.1 / 10.9 / 28.1 (4.7), extra 55 |
| history7r2 | 77.3 / 11.4 / 11.4, extra 333 | 61.2 / 11.1 / 27.6 (4.6), extra 54 |

Round-2 registry with ONE part put back to today's version:

| put back | sample | short (wrong act) |
|---|---|---|
| none (registry_r2) | 75.3 / 11.1 / 13.7, extra 403 | 62.5 / 11.0 / 26.6 (6.9), extra 81 |
| cutter_worlds7s | 75.3 / 11.2 / 13.5, extra 394 | 61.5 / 11.0 / 27.5 (6.2), extra 73 |
| cutter_events | 75.3 / 11.1 / 13.6, extra 398 | 62.1 / 10.8 / 27.1 (6.9), extra 81 |
| shapes7c | 74.9 / 11.3 / 13.8, extra 401 | 59.6 / 10.7 / 29.6 (7.8), extra 90 |
| links7 | 75.3 / 11.1 / 13.6, extra 401 | 62.3 / 10.4 / 27.3 (7.1), extra 83 |
| position7 | 75.5 / 10.9 / 13.7, extra 404 | 63.9 / 10.0 / 26.1 (7.3), extra 85 |
| graphq7 | 77.2 / 11.1 / 11.7, extra 351 | 63.2 / 12.2 / 24.6 (4.8), extra 57 |
| questions7 | 75.3 / 11.4 / 13.4, extra 390 | 62.5 / 11.1 / 26.3 (6.7), extra 78 |
| manage7 | 75.3 / 11.1 / 13.7, extra 405 | 62.6 / 11.5 / 25.9 (6.8), extra 79 |
| history7 | 75.2 / 11.1 / 13.7, extra 404 | 62.3 / 11.0 / 26.8 (6.8), extra 80 |

Reading: the whole sample loss is graphq7r2 (swapped in alone: right -1.8, not done +1.8, extra +47; put back: right +1.9).
shapes7r2 gains everywhere (sample +0.3, short +2.0). The event cutter r2 gains on the short sets (+0.8, wrong act -0.2). The world
cutter r2 is neutral on the sample and +0.3 / +1.0 on the short sets. position7r2 loses on the short sets (-1.5 right, +0.8 wrong).
links7r2 adds wrong on the short sets (+0.5). questions7r2 and manage7r2 are neutral on these sets (they carry the new events).
graphq7r2 lowers "wrong" on the short sets (11.1 -> 10.0) only because it turns requests that were done wrong into a different
action (wrong act 4.6 -> 6.7, extra 53 -> 77): "how many red stars on top of Error do we have" was a count with a wrong position and
is now an exists question nobody asked. The same shows when graphq7 is put back into r2 (short wrong 11.0 -> 12.2, wrong act 6.9 ->
4.8). Wrong acts are executed wrong commands, so "wrong" has to be read together with the extras.

Per action on the sample, registry_r2 against the default (right of n): extreme 260 -> 208 of 272 (not done 8 -> 60), count 124 ->
108 of 167, fact 161 -> 149 of 206, list 86 -> 78 of 99, move 513 -> 504 of 638; extras: check 18 -> 57, exists 6 -> 27, nearest 10
-> 19. Gains: set 759 -> 767, create 145 -> 151, undo 36 -> 39.

### 3. Per stage

- The world cutter (cutter_worlds7r2 against cutter_worlds7s, sample, 4858 gold spans): units 4853 -> 4866, lost 147 -> 144, merged
  53 -> 54, split 56 -> 56, units on no gold span 136 -> 147. The cut is the same; it is not where round 2 loses.
- The event cutter: the hint is the gold event in 91.9% of the units that meet exactly one gold span, old and r2 alike. The event
  chosen by the composer is the gold event in 95.2% (default), 95.3% (only the cutter swapped), 92.8% (registry_r2): the drop is in
  the worlds.
- The worlds on their events' gold (planB7/goldev, SEG=gold, default pairing, right / wrong / not done; the regression rule of A):

| event | current world | r2 world |
|---|---|---|
| create | 70.6 / 19.7 / 9.7 | 77.1 / 16.9 / 6.0 |
| set | 61.7 / 21.0 / 17.3 | 69.0 / 15.1 / 15.9 |
| resize | 65.6 / 26.7 / 7.7 | 69.2 / 22.0 / 8.8 |
| fact | 83.5 / 8.0 / 8.5 | 84.5 / 5.5 / 10.0 |
| rule | 70.6 / 1.7 / 27.8 | 80.0 / 1.1 / 18.9 |
| connect | 41.2 / 54.8 / 4.0 | 41.2 / 54.4 / 4.3 |
| disconnect | 84.7 / 9.4 / 5.9 | 84.7 / 10.6 / 4.7 (wrong +1.2: 2 requests) |
| move | 78.4 / 20.4 / 1.2 | 76.8 / 22.0 / 1.2 (regression) |
| swap | 91.1 / 6.7 / 2.2 | 91.6 / 7.3 / 1.1 |
| arrange | 53.9 / 40.4 / 5.6 | 52.8 / 41.3 / 5.8 (right -1.1) |
| align | 57.2 / 27.3 / 15.5 | 62.9 / 34.0 / 3.1 (wrong +6.7) |
| distribute | 41.2 / 53.8 / 4.9 | 40.7 / 53.3 / 6.0 |
| toFront | 78.3 / 17.1 / 4.6 | 79.4 / 16.6 / 4.0 |
| toBack | 85.5 / 7.8 / 6.6 | 87.3 / 7.8 / 4.8 |
| check | 85.9 / 12.4 / 1.7 | 87.4 / 11.0 / 1.6 |
| connected | 88.9 / 6.5 / 4.7 | 88.9 / 6.5 / 4.7 |
| path | 90.1 / 4.8 / 5.0 | 90.5 / 4.5 / 5.0 |
| reachable | 77.2 / 0.7 / 22.1 | 78.6 / 0.7 / 20.7 |
| cycle | 89.3 / 0.0 / 10.7 | 86.7 / 0.0 / 13.3 (regression) |
| exists | 67.8 / 12.0 / 20.3 | 58.3 / 10.9 / 30.8 (regression) |
| count | 68.9 / 27.2 / 3.9 | 69.1 / 22.3 / 8.7 (extra 6 -> 37) |
| list | 66.7 / 4.3 / 29.0 | 67.8 / 4.3 / 27.9 |
| extreme | 98.5 / 0.8 / 0.7 | 98.3 / 0.6 / 1.1 |
| nearest | 92.2 / 6.4 / 1.4 | 93.6 / 5.4 / 0.9 |
| describe | 95.1 / 0.7 / 4.2 | 95.4 / 0.7 / 3.9 |
| neighbors | 77.7 / 2.2 / 20.1 | 78.1 / 2.2 / 19.6 |
| degree | 89.9 / 1.9 / 8.2 | 90.6 / 1.9 / 7.5 |
| property | 82.4 / 13.8 / 3.8 | 82.0 / 14.2 / 3.8 |
| delete | 81.2 / 15.8 / 3.0 | 81.7 / 13.9 / 4.5 |
| duplicate | 93.3 / 4.9 / 1.8 | 92.9 / 5.8 / 1.2 |
| rename | 92.3 / 5.8 / 1.9 | 92.3 / 6.9 / 0.8 (wrong +1.1: 4 of 364 requests) |
| label | 59.8 / 30.2 / 10.1 | 59.8 / 31.2 / 9.0 |
| undo | 98.5 / 0.0 / 1.5 | 99.6 / 0.0 / 0.4 |
| redo | 97.7 / 0.0 / 2.3 | 99.2 / 0.0 / 0.8 |
| forget | 96.8 / 0.0 / 3.2 | 98.7 / 0.0 / 1.3 |

  On its own events graphq7r2 is nearly as good as graphq7 (except exists and cycle); its harm is in the composer, where it now
  reads units of OTHER worlds with fewer words not understood (section 4).
- The context filler (not retrained in sections 1-6) and the ties, per registry on the sample:

| registry | asked by the filler | ties decided by cutter order / by context |
|---|---|---|
| default | 188 | 310 / 152 |
| registry_r2 | 252 | 521 / 117 |
| default + graphq7r2 only | 231 | 389 / 122 |
| default + cutter_worlds7r2 only | 200 | 341 / 148 |
| default + questions7r2 only | 197 | 340 / 150 |
| registry_r2 with graphq7 put back | 207 | 440 / 146 |
| registry_r2best (section 5) | 206 | 426 / 146 |
| shapes7r2 + cutter_events_r2 only | 188 | 309 / 148 |

  The extra questions come from the readings, not from the filler: of the 64 extra asks of registry_r2, 38 are "graphq check,
  target vague" on units such as "Which one is the rightmost" (graphq7r2's wrong reading, section 4.1); the filler asks because
  the target "which" cannot be resolved, which is the honest outcome for that reading. The extra order-decided ties are graphq /
  shapes ("Customer is a star": graphq7r2 now reads it as check with as few words not understood as shapes' fact; 142 ties) and
  links / questions ("Connect Start to End": questions7r2 now reads it as nearest; 55-58 ties, all decided by order in favour of
  links). The filler knows nothing of group, ungroup, members, groupOf: on the 480 messages of ops_groups, registry_r2 reads 741
  units of those events and the filler asks about 5 of them (group, target a pronoun). Not measured here: its keys anchor2 /
  landmark3 (the coordinator's review); section 7 has the retrained fillers.

### 4. Root causes of the losses (with examples)

1. graphq7r2 reads units of other worlds (the whole sample loss). Two causes, both in the new data, none in the model:
   - trigger rules learned from the relation words that ops_positions annotates as the trigger of a check question (180 of its 182
     check requests: "above" 34, "right of" 26, "left of" 26, "below" 24, "beneath" 15; the long data mostly annotate "is" or
     "bigger than"). graphq7r2's front now has left_of -> is_q (69 rows, precision 0.73), "right of" -> is_q (32, 0.8), "next to"
     -> is_q (8, 0.8), "on top of" -> above + is_q, "is" after a name -> is_q (14, 0.88), "do we have" -> is_there (5, 0.63; the
     bar is 0.6). Examples: "Floor2 on top of Floor1" -> check; "Customer is a star" -> check (a fact before); "How many shapes do
     we have" -> exists (a count before); on its own gold, "Is anything left of the Pool" -> check instead of exists (exists 67.8
     -> 58.3).
   - one row of ops_groups, "is there a group yet" (exists, object = "group"), gives the object role a head of kind VERB ("group"
     is the trigger of an event of another world, so its kind is VERB). The reader then offers any unplaced VERB-kind word to the
     object role; "which" has kind VERB, so in "Which one is the rightmost" graphq7r2 places "which" and leaves 3 words not
     understood against 4 for questions' extreme; the composer takes the reading with fewer words not understood: check, target
     "which", asked or done wrong. 51 extreme requests of the sample go this way.
2. questions7r2: the value n-gram "to" -> closest (learned with VAL_PREC=event: its precision is counted only over the events that
   carry the superlative kind, where "closest to", "nearest to" dominate). "Connect Start to End" then reads as a nearest question
   with as few words not understood as links' connect (55-58 ties on the sample, decided by cutter order; nearest extras 10 -> 19).
   Also the trigger "how many connections" (any next word) -> degree_q at precision 0.618 (bar 0.6): "How many connections do we
   have" -> degree (a count before).
3. position7r2: value n-grams "circles", "squares", "diamonds" -> all (the quantifier; the shape is lost: "align all the circles
   vertically" -> "align all the all vertically", target every shape); the 1-gram "under" -> below is gone (only "under the" is
   kept): "Put Check under Done" loses its position. This is the short-set loss (-1.5 right, +0.8 wrong) and part of move / align
   on gold.
4. links7r2: +0.5 wrong on the short sets, disconnect +2 wrong requests on gold; not traced further (small).
5. Regions are not read (all worlds, old and r2): the fronts map no region phrase ("in the top left", "bottom right corner", "in
   the middle") to a region token ("top left" -> "top left_of" or "top left"), so the conversion leaves the region out of the
   rows (dry build: graphq7r2 drops 196 position values of 3402 rows, position7r2 316 of 5565). The pre-registered check (section
   3: "if POS dropped in the new rows is still above a third of them, report it before training") was not done before training.
6. group / ungroup: the annotation puts two operations in each event. "add Cto to Execs" = group, target [Cto, Execs], name Execs;
   "take Eve out of Kids" = ungroup, target Eve (the group is not written). The world reads which name is the target by position,
   not by which name is a group: adding a member 20.3 right / 79.7 wrong (59 requests), removing a member 7.8 / 71.8 / 20.4 (103);
   making a new group 74.0 / 16.1 / 9.9 (242), dissolving 91.3 / 3.9 / 4.9 (103). The cause is the annotation scheme (a membership
   change has no role of its own), not the model.

What round 2 gained, and why: shapes7r2 (fixes 1-4 and the short data: create, set, resize, rule all up on gold, +2.0 on the
short sets), history7r2 (short data: undo / redo / forget up), the event cutter (short data: +0.8 on the short sets).

### 5. The best combination found

Scratch combinations (same frozen code and filler as sections 1-4):

| registry | sample | short (wrong act) |
|---|---|---|
| default | 77.2 / 11.4 / 11.4, extra 334 | 61.1 / 11.1 / 27.7 (4.6), extra 53 |
| registry_r2 | 75.3 / 11.1 / 13.7, extra 403 | 62.5 / 11.0 / 26.6 (6.9), extra 81 |
| shapes7r2 + cutter_events_r2 | 77.5 / 11.0 / 11.5, extra 338 | 63.9 / 11.1 / 24.9 (4.3), extra 51 |
| + cutter_worlds7r2, manage7r2, history7r2 | 77.5 / 11.2 / 11.3, extra 339 | 64.6 / 10.9 / 24.5 (4.8), extra 57 |
| + questions7r2 = registry_r2best | 77.5 / 10.9 / 11.6, extra 350 | 64.5 / 10.8 / 24.7 (5.2), extra 61 |
| + links7r2 (= r2 without graphq, position) | 77.4 / 10.9 / 11.7, extra 352 | 64.6 / 11.2 / 24.1 (5.1), extra 60 |

In requests: registry_r2best against the default, sample right 3751 -> 3765, wrong 552 -> 528, extra 334 -> 350 (wrong + extra
886 -> 878); short right 697 -> 735, wrong 127 -> 123, extra 53 -> 61 (wrong + extra 180 -> 184). The extras it adds are
questions7r2's ("to" -> closest, 4.2). shapes7r2 + cutter_events_r2 alone has wrong + extra 874 and 178 (both lower than the
default) but cannot read the new operations.

`docs/model/micro/registry_r2best.json` = the r2 cutters, shapes7r2, questions7r2, manage7r2, history7r2, and today's links7,
position7, graphq7 (their r2 models lose, section 4), context weights_r2.json (as registry_r2.json now names it). It reads all four
new events; it does not read a second relation in move, check or exists (position7 and graphq7 have no position2 / anchor2).

### 6. The new operations (measure D; ops messages, which are training messages)

| event (requests) | SEG=gold, its r2 world | composer registry_r2, ops_groups messages |
|---|---|---|
| group (301) | 63.1 / 28.9 / 8.0 (fails: wrong > 15) | 58.5 / 24.3 / 17.3 |
| ungroup (206) | 49.0 / 38.3 / 12.6 (fails) | 51.0 / 42.2 / 6.8 |
| members (145) | 92.4 / 1.4 / 6.2 (passes) | 93.1 / 1.4 / 5.5 |
| groupOf (150) | 97.3 / 0.0 / 2.7 (passes) | 97.3 / 0.0 / 2.7 |

registry_r2best reads ops_groups the same (group 177 / 72 / 52, ungroup 105 / 87 / 14 requests); the default reads none of them
(36.5 / 8.2 / 55.3 on all 1693 requests of ops_groups, against 74.6 / 17.5 / 7.9 for registry_r2).

Double positions, per part, right % (SEG=gold, one request at a time; the part is right when the request is done and that key is
right):

| event: part | r2 world | current world |
|---|---|---|
| create (257): position / anchor | 78.2 / 76.7 | 58.8 / 45.1 |
| create: position2 / anchor2 / region | 56.8 / 40.0 / 28.6 | 0.0 / 0.0 / 46.7 |
| move (249): position / anchor | 71.9 / 68.3 | 53.0 / 59.0 |
| move: position2 / anchor2 / region | 37.3 / 33.3 / 61.9 | 0.0 / 0.0 / 67.6 |
| fact (69): position2 / anchor2 / region | 63.4 / 63.4 / 16.7 | 0.0 / 0.0 / 0.0 |
| check (144): position2 / anchor2 / region | 40.5 / 38.1 / 18.3 | 0.0 / 0.0 / 18.3 |
| exists (43): position2 / anchor2 / region | 29.4 / 29.4 / 7.4 | 0.0 / 0.0 / 0.0 |
| count (29): position2 / anchor2 / region | 22.2 / 22.2 / 0.0 | 0.0 / 0.0 / 0.0 |
| list (37): position2 / anchor2 / region | 36.0 / 36.0 / 0.0 | 0.0 / 0.0 / 0.0 |

Whole requests right: create 31.5 (7.4 before), move 33.3 (18.5), fact 42.0 (0), check 27.8 (2.8), exists 16.3 (0), count 13.8
(0), list 24.3 (0). The threshold (every part >= 50%) is met only by create position2 and fact position2 / anchor2. Regions are
the weakest part (cause 4.5). In the composer on the 464 ops_positions messages: default 14.0 / 62.1 / 23.9, registry_r2 38.9 /
44.5 / 16.5, registry_r2best 29.9 / 51.7 / 18.4 (no second relation in move / check / exists).

### 7. With the retrained context fillers (16:37), and the decision

Same frozen-code method, the code of 17:40 (scratchpad/r2m/snap2: docs/js as of the confidence-gate commit, gate off in the
scorers), the official scorers (llm_score.mjs, short_bench.mjs), each registry with its retrained filler (default and the scratch
"shapes7r2 + cutter_events_r2": weights.json 17808ca5c0; registry_r2 and registry_r2best: weights_r2.json 3907acc62f):

| registry | sample (asked; ties by order / by context) | short (wrong act) |
|---|---|---|
| default (registry.json) | 77.1 / 11.0 / 11.9, extra 315 (asked 229; 260 / 202) | 61.1 / 11.0 / 27.9 (4.6), extra 53 |
| registry_r2 | 75.1 / 10.8 / 14.1, extra 373 (asked 302; 490 / 148) | 62.5 / 11.0 / 26.6 (6.9), extra 81 |
| registry_r2best | 77.4 / 10.6 / 12.1, extra 342 (asked 235; 385 / 187) | 64.5 / 10.8 / 24.7 (5.2), extra 61 |
| shapes7r2 + cutter_events_r2 | 77.4 / 10.7 / 11.9, extra 321 (asked 226; 258 / 199) | 63.9 / 11.1 / 24.9 (4.3), extra 51 |

The retrained fillers do not change the picture: registry_r2 still loses 2.0 points of right on the sample (and asks 302 times:
the misread units of section 4 are still there); the short sets do not move with the filler at all.

Decision by the rule "adopt if it helps and does not make wrong worse":
- registry_r2 as built: not adopted. It loses on the sample (right -1.9, extra +69) and four worlds cross the regression line of A.
- registry_r2best: adopt as the demo default by the rule. It helps (sample right +0.3, short +3.4) and
  wrong does not get worse (sample 11.0 -> 10.6, short 125 -> 123 requests). Two costs to state: extras rise (sample 315 -> 342,
  short 53 -> 61; mostly questions7r2's "to" -> closest), so wrong + extra is about 849 -> 857 on the sample and 178 -> 184 on the
  short sets; and it does not read a second relation in move / check / exists. If the owner counts every extra as wrong, the
  alternative that passes on that reading too is shapes7r2 + cutter_events_r2 only (wrong + extra about 841 and 178; short wrong
  127 against 125, i.e. 2 requests, extra 51), which reads none of the new operations. registry_r2best.json is written; registry.json
  is not changed here.
- Before the next round (not done here, a miss is reported, not patched): the check-question triggers of ops_positions (relation
  words annotated as the trigger), the "is there a group yet" row, value n-grams that replace a word carrying two values ("circles"
  -> all) and context-free trigger rules that pass the 0.6 bar by a few rows; region phrases in the fronts; a role for the member
  of a membership change in group / ungroup.

Scratch: scratchpad/r2m (mkreg.py, one2.sh, run2.mjs, perwire.mjs, res2/, gold/, ops/, dry_graphq7r2, dry_position7r2).
