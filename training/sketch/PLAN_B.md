# Plan B: GROUPS_7 (7 worlds) with FRONT_ROWS=world

GROUPS_6 was stopped by the coordinator before any world finished; GROUPS_7 replaced it (`training/sketch/worlds_micro/GROUPS_7.json`, grouping by measured
cutter confusion: 64.5% of the confusions fall inside one world, GROUPS_6 46.9%, GROUPS_16 20.0%). Worlds: shapes7 (create set resize fact rule),
links7 (connect disconnect), position7 (move swap arrange align distribute toFront toBack), graphq7 (check connected path reachable cycle exists),
questions7 (count list extreme nearest describe neighbors degree property), manage7 (delete duplicate rename label), history7 (undo redo forget).
Command: `SOP_PYTHON=/home/claude/venv/bin/python3 DATA=spans FRONT_ROWS=world N_EVAL=150 EVAL_MODES=primary VSA_MAX_HOURS=16 bash training/sketch/train_micro.sh <world>7 <events>`,
two at a time (shapes7 and links7 first; peak RSS 2.2 and 3.3 GB, MemAvailable stayed above 4.5 GB, no need to serialize).
Cutter: `train_cutter.py --worlds worlds_micro/GROUPS_7.json --out docs/model/micro/cutter_worlds7.json`, trained while shapes7 and links7 ran: about 200 MB, MemAvailable did not move, so it does not compete.
Times: links7 trained 3.77 h and shapes7 about 4.2 h (the evaluation with N_EVAL=150 primary added about 1 h); the other worlds finished between 01:58 and 04:55 in two slots (see planB7/STATUS.txt).
The 6 h guard (`VSA_MAX_HOURS`, default 6) applies, see PLAN_A.md; here it was 16.

## Fit per event inside the 7-world, vs the 16-world _w world

Same gold rows per event (all 9 folders, one gold file per event, `SEG=gold`), right / wrong / not done / extra, unknown-event share of the reader status.
G16 column = the event's own `_w` world (Plan A); for connect it is micro/connect and for move micro/move_s (connect_w, move_w were not trained); swap has no world.

| world7 | event | G7 own-front (right/wrong/not done/extra, unk) | G16 _w (connect, move: old) | fallback |
|---|---|---|---|---|
| shapes7 | create | 28.2/61.7/10.1/14 unk 7.8% | 80.0/14.1/5.9/0 unk 5.5% | 46.2/22.9/30.9/108 unk 16.2% |
| shapes7 | set | 64.3/18.5/17.2/24 unk 15.2% | 76.5/16.9/6.6/0 unk 5.5% | 63.7/14.1/22.2/56 unk 17.6% |
| shapes7 | resize | 65.9/26.4/7.7/11 unk 1.5% | 70.3/28.2/1.5/0 unk 1.5% | 65.6/22.0/12.5/13 unk 7.0% |
| shapes7 | fact | 85.5/6.0/8.5/2 unk 7.6% | 90.3/7.4/2.3/0 unk 2.2% | 79.5/6.9/13.6/12 unk 10.9% |
| shapes7 | rule | 70.6/1.7/27.8/43 unk 3.9% | 90.0/1.1/8.9/14 unk 1.1% | 68.3/2.2/29.4/15 unk 20.6% |
| links7 | connect | 41.2/54.8/4.0/1 unk 3.6% | 39.5/47.2/13.3/0 unk 12.0% | 19.6/48.1/32.3/244 unk 23.5% |
| links7 | disconnect | 84.7/9.4/5.9/9 unk 0.6% | 85.9/9.4/4.7/0 unk 4.7% | 52.4/8.8/38.8/37 unk 14.7% |
| position7 | move | 67.3/31.5/1.2/6 unk 0.8% | 65.2/26.9/7.9/0 unk 7.9% | 46.9/31.4/21.7/174 unk 14.6% |
| position7 | swap | 91.1/6.7/2.2/0 unk 2.2% | - unk - | 88.8/6.1/5.0/0 unk 4.5% |
| position7 | arrange | 53.9/40.4/5.6/23 unk 0.2% | 57.5/40.9/1.6/1 unk 0.4% | 39.3/49.0/11.7/35 unk 3.1% |
| position7 | align | 57.2/27.3/15.5/2 unk 13.4% | 57.2/27.3/15.5/1 unk 14.4% | 46.4/13.9/39.7/11 unk 15.5% |
| position7 | distribute | 41.2/53.8/4.9/0 unk 1.6% | 41.8/53.3/4.9/0 unk 2.7% | 37.9/54.4/7.7/3 unk 3.8% |
| position7 | toFront | 78.3/17.1/4.6/8 unk 0.0% | 81.7/16.6/1.7/3 unk 0.0% | 62.3/6.9/30.9/41 unk 7.4% |
| position7 | toBack | 85.5/7.8/6.6/8 unk 0.6% | 91.0/7.2/1.8/2 unk 0.0% | 81.9/8.4/9.6/12 unk 1.2% |
| graphq7 | check | 85.9/12.4/1.7/0 unk 1.1% | 88.2/11.8/0.0/0 unk 0.0% | 84.5/9.9/5.6/42 unk 1.2% |
| graphq7 | connected | 88.9/6.5/4.7/22 unk 0.5% | 92.3/6.5/1.3/0 unk 1.3% | 46.3/5.6/48.1/210 unk 5.9% |
| graphq7 | path | 90.1/4.8/5.0/20 unk 1.6% | 91.7/4.2/4.2/15 unk 1.6% | 45.7/11.2/43.1/222 unk 4.7% |
| graphq7 | reachable | 77.2/0.7/22.1/26 unk 4.1% | 77.2/0.7/22.1/24 unk 5.5% | 15.2/0.0/84.8/64 unk 40.7% |
| graphq7 | cycle | 89.3/0.0/10.7/19 unk 0.0% | 98.0/0.0/2.0/0 unk 1.5% | 80.1/0.0/19.9/25 unk 6.1% |
| graphq7 | exists | 67.8/12.0/20.3/6 unk 17.8% | 89.5/6.5/4.0/0 unk 4.0% | 50.0/12.0/38.0/74 unk 9.8% |
| questions7 | count | 68.9/27.2/3.9/6 unk 2.9% | 69.4/27.3/3.3/4 unk 2.7% | 68.4/30.8/0.9/4 unk 0.3% |
| questions7 | list | 66.7/4.3/29.0/137 unk 4.3% | 73.6/4.1/22.3/117 unk 1.3% | 31.1/22.8/46.0/150 unk 18.5% |
| questions7 | extreme | 98.5/0.8/0.7/6 unk 0.2% | 98.9/0.7/0.5/1 unk 0.4% | 94.5/0.2/5.2/61 unk 0.2% |
| questions7 | nearest | 92.2/6.4/1.4/5 unk 0.2% | 93.9/5.9/0.2/0 unk 0.2% | 85.8/7.5/6.6/26 unk 0.0% |
| questions7 | describe | 95.1/0.7/4.2/1 unk 3.9% | 95.8/1.4/2.8/2 unk 2.1% | 89.5/1.1/9.5/3 unk 8.4% |
| questions7 | neighbors | 77.7/2.2/20.1/40 unk 2.2% | 93.8/2.7/3.6/2 unk 2.7% | 21.0/0.0/79.0/146 unk 13.4% |
| questions7 | degree | 89.9/1.9/8.2/14 unk 3.5% | 92.1/2.5/5.3/8 unk 2.5% | 76.1/1.6/22.3/54 unk 3.5% |
| questions7 | property | 82.4/13.8/3.8/3 unk 2.7% | 83.1/14.2/2.7/0 unk 2.7% | 59.8/9.2/31.0/68 unk 5.0% |
| manage7 | delete | 81.2/15.8/3.0/0 unk 2.0% | 81.2/15.8/3.0/0 unk 2.0% | 52.0/16.8/31.2/2 unk 25.7% |
| manage7 | duplicate | 93.3/4.9/1.8/1 unk 0.6% | 92.0/6.1/1.8/0 unk 0.9% | 72.7/6.7/20.6/8 unk 9.2% |
| manage7 | rename | 92.3/5.8/1.9/1 unk 0.8% | 92.3/5.8/1.9/1 unk 0.8% | 90.7/6.3/3.0/1 unk 2.7% |
| manage7 | label | 59.8/30.2/10.1/0 unk 9.5% | 59.3/30.7/10.1/0 unk 9.5% | 53.3/30.2/16.6/3 unk 13.1% |
| history7 | undo | 98.5/0.0/1.5/0 unk 1.5% | 98.5/0.0/1.5/0 unk 1.5% | 94.3/0.0/5.7/3 unk 0.4% |
| history7 | redo | 97.7/0.0/2.3/0 unk 1.6% | 97.7/0.0/2.3/0 unk 1.6% | 85.9/0.0/14.1/4 unk 0.8% |
| history7 | forget | 96.8/0.0/3.2/0 unk 3.2% | 96.8/0.0/3.2/0 unk 3.2% | 56.8/0.0/43.2/4 unk 0.6% |

Reading (rare actions inside a big world):
- shapes7 loses create badly (28.2 right, 61.7 wrong vs 80.0 / 14.1), set (64.3 vs 76.5), fact and rule (70.6 vs 90.0; rule not-done 27.8 vs 8.9), resize a little.
  Causes found by the coordinator: (1) colour lives as object.attr in create rows but as the event role `color` in set/fact rows, so shapes7 drops create colours;
  (2) verbless set requests ("Post blue") get no event; (3) the grouped front maps "should be" to the set verb, so rules read as set.
- links7: connect 41.2 right / 54.8 wrong / 4.0 not done vs micro/connect 39.5 / 47.2 / 13.3: not done turns mostly into wrong (+1.7 right, +7.6 wrong), so it is not a win
  when wrong is worse than not done. On the 38 then-leading connect spans it is much better (68.4 right vs 5.3) with 1 chain misreading vs 6. disconnect 84.7 vs 85.9, same.
- graphq7: exists drops (67.8 vs 89.5; unknown-event 17.8% vs 4.0%), cycle (89.3 vs 98.0), connected/path/check about equal, reachable equal.
- questions7: neighbors drops a lot (77.7 vs 93.8, not done 20.1 vs 3.6), list (66.7 vs 73.6, 137 extra); extreme, nearest, describe, degree, property, count about equal.
- position7: move improves not done (1.2 vs 7.9) but wrong goes up (31.5 vs 26.9); toFront/toBack and align/distribute about equal; swap gets a world (91.1 right).
- manage7, history7: equal to the _w worlds (same rows, same rules).
- Rare events (rule, create, exists, neighbors, cycle, toFront/toBack) are the ones that lose most; big commands move a little.

## Composer on the fixed 1000-message sample (seed 0, PAIR=value), ALL and per folder

Cell = right / wrong / not done / extra (count). Columns:
- A3 = CandidateRouter·OwnFront·G16 with the 14 _w worlds (connect micro/connect, move micro/move_s), cutter_worlds16 (PLAN_A.md variant 3);
- default = today's registry (commit 2a8dc20: router cutter, cutter_worlds16, context filler; re-run here only to get per-folder numbers; ALL equals the coordinator's 67.7 / 12.7 / 19.7 / 166);
- G7 = CandidateRouter·OwnFront·G7: registry planB7/registry_g7.json, cutter_worlds7, models micro/<world>7, context weights.

| folder (gold wires) | A3 (G16 _w) | default (G16 shared front) | G7 |
|---|---|---|---|
| bench_fresh1_haiku (542) | 78.4 / 15.3 / 6.3 / 18 | 75.5 / 15.1 / 9.4 / 11 | 79.0 / 15.5 / 5.5 / 19 |
| bench_fresh1_sonnet (700) | 73.4 / 12.1 / 14.4 / 43 | 66.4 / 11.7 / 21.9 / 13 | 68.4 / 14.0 / 17.6 / 39 |
| bench_haiku_spans (442) | 72.4 / 11.5 / 16.1 / 40 | 70.1 / 15.8 / 14.0 / 15 | 76.7 / 13.6 / 9.7 / 24 |
| bench_sonnet_spans (483) | 46.2 / 12.4 / 41.4 / 42 | 41.4 / 14.1 / 44.5 / 18 | 44.7 / 15.5 / 39.8 / 34 |
| train_haiku_msg (483) | 92.8 / 5.6 / 1.7 / 8 | 88.6 / 6.8 / 4.6 / 7 | 82.8 / 14.1 / 3.1 / 9 |
| train_haiku_msg2 (427) | 85.9 / 7.0 / 7.0 / 22 | 80.8 / 11.2 / 8.0 / 12 | 81.7 / 10.5 / 7.7 / 28 |
| train_sonnet_long (535) | 70.5 / 14.6 / 15.0 / 49 | 60.9 / 16.6 / 22.4 / 25 | 62.8 / 18.7 / 18.5 / 58 |
| train_sonnet_msg (667) | 70.5 / 10.8 / 18.7 / 47 | 65.8 / 10.5 / 23.7 / 30 | 68.8 / 11.7 / 19.5 / 54 |
| train_sonnet_msg2 (579) | 67.5 / 12.4 / 20.0 / 49 | 63.0 / 12.8 / 24.2 / 35 | 64.6 / 15.2 / 20.2 / 56 |
| ALL (4858 gold) | 72.8 / 11.5 / 15.7 / 318 | 67.7 / 12.7 / 19.7 / 166 | 69.6 / 14.3 / 16.1 / 321 |

Units decided by order (tie after the fewest words not understood), whole sample:

| run | decided by words | context | order | tied units (2 / 3 readings) | asked by the filler |
|---|---|---|---|---|---|
| default (G16, shared front) | 4233 | 5 | 9 | 14 / 0 | 178 |
| A3 (G16 _w) | 4089 | 58 | 450 | 491 / 17 (incl. context ties) | 186 |
| G7 | 4150 | 141 | 308 | 414 / 35 | 202 |

Reading:
- G7 is better than the default in right (69.6 vs 67.7) and not done (16.1 vs 19.7) but worse in wrong (14.3 vs 12.7) and extra (321 vs 166). Against A3 it is worse in right (69.6 vs 72.8)
  and wrong (14.3 vs 11.5), about equal in extra (321 vs 318) and not done (16.1 vs 15.7).
- Ties: 308 units decided by order in G7, 450 in A3, 9 in the default. Own-rows front ends make several candidate worlds read the same unit with 0 unknown words; the order decides a lot.
  G7 has fewer candidate worlds that are alike (7 labels, top 3 of them), but its ties are still 30 times the default's.
- Per folder, G7 beats A3 in right only in bench_haiku_spans (76.7 vs 72.4) and bench_fresh1_haiku (79.0 vs 78.4); it is behind in the other seven, most in train_haiku_msg (82.8 vs 92.8) and train_sonnet_long (62.8 vs 70.5).
  The five events the coordinator named (create, set, resize, fact, rule) are read by shapes7 here; no per-event hybrid with the _w world exists in this run (one model per world in the registry).

## Files

New or changed (not committed by me): docs/model/micro/cutter_worlds7.json, docs/model/micro/{shapes,links,position,graphq,questions,manage,history}7/ (the coordinator committed shapes7 and links7),
training/sketch/worlds_micro/<world>7/ (build folders, gitignored), training/sketch/runs/micro_<world>7*, training/sketch/PLAN_B.md.
Scratch (not in the repository): /tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/planB7 (STATUS.txt, ev/ per-event scores, registry_g7.json, sampleF_*.txt).
