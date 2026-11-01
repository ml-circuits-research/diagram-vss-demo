# Micro-world round 2: set, connect, move, graph retrained on DATA=spans (4640 messages)

Scratch folder with all logs: `/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/mw2` (base/comp_*.txt, fit_*.txt, greedy.txt, STATUS.txt; `v1/` holds the first composer runs, see "Code changed mid-round").
Worlds trained as `set_s`, `connect_s`, `move_s`, `graph_s` (docs/model/micro/<w>/, training/sketch/worlds_micro/<w>/), command `SOP_PYTHON=... DATA=spans bash training/sketch/train_micro.sh <w> <events>`, D=1024, 10 epochs, seed 0.
Eval: all 9 data folders, 4640 messages, 22702 gold wires; all numbers are on the training data (owner's rule). Per-message R/H/W = right/honest/wrong; per-request C/ND/DW = correct/not done/done wrong.

## Result in one paragraph

Two of four worlds are replaced: `set` -> `set_s`, `move` -> `move_s` (registry order unchanged, 15 worlds). Composer ALL: per message wrong 2773 -> 2727 (59.8% -> 58.8%), right 957 -> 974, honest 910 -> 939; per request correct 60.7 -> 61.2, done wrong 15.4 -> 14.8, extra 1395 -> 1390. `connect_s` is worse than `connect` in the composer and is not used; `graph_s` is neutral (identical fit, composer identical) and not used. Not all 9 folders improve (table below): the gain is small and concentrated in the folders with the most move/set requests (haiku_spans, haiku_msg, sonnet_msg), while sonnet_msg2, haiku_msg2 and fresh1/sonnet get a few more wrong messages.

## Fit on own gold rows (correct / not done / done wrong, per request), same rows for the three columns

Gold rows: `micro_tools.py gold <w>` (set 4192 requests, connect 3427, move 3044, graph 1280). The round-1 world and the new world have the same events; trained rows: set_s 4188 (4 unreadable dropped), connect_s 3427, move_s 3042, graph_s 1275.

| world | new (spans) | round 1 (everything) | fallback kinds_p80_s0 |
|---|---|---|---|
| set | 63.3/21.5/15.1 | 62.2/22.4/15.4 | 61.4/24.8/13.8 |
| connect | 38.2/10.7/51.2 | 39.5/13.3/47.2 | 19.6/32.3/48.1 |
| move | 65.2/7.9/26.9 | 63.5/9.0/27.5 | 46.9/21.7/31.4 |
| graph | 88.7/6.9/4.5 | 88.7/6.9/4.5 (per act differs: path 525 vs 521, connected 507 vs 502, reachable 103 vs 112 of 578/557/145) | 42.5/49.7/7.8 |

Extra wires of the fallback on these rows: set 183, connect 244, move 174, graph 492 (the worlds: 0, 0, 0, 38). connect_s fits worse than round-1 connect on done wrong (+4 points) although it saw 731 more messages; set_s and move_s fit slightly better. Set: the fallback has fewer done wrong (13.8 vs 15.1) but reads fewer (61.4 vs 63.3 correct).

## Replacement table (greedy on top of the kept ones, one composer scoring at a time)

| step | change | per message R/H/W (n) | per request C/ND/DW (extra) | decision |
|---|---|---|---|---|
| 0 | base: registry of round 1 (15 worlds) | 20.6/19.6/59.8 (957/910/2773) | 60.7/23.9/15.4 (1395) | |
| 1 | set -> set_s | 20.6/19.8/59.6 (955/921/2764) | 60.7/23.9/15.4 (1397) | keep: wrong -9, right -2 (two honest more), done wrong equal; borderline |
| 2 | move -> move_s | 21.0/20.2/58.8 (974/939/2727) | 61.2/23.9/14.8 (1390) | keep: wrong -37, right +19, DW -0.6 |
| 3 | graph -> graph_s | 21.0/20.2/58.8 (974/939/2727) | 61.2/23.9/14.8 (1388) | not kept: wrong and right equal (rule asks right to rise); 2 fewer extra |
| 4 | connect -> connect_s | 20.2/19.8/60.0 (937/921/2782) | 60.8/23.9/15.3 (1393) | not kept: wrong +55, right -37, DW +0.5, correct -0.4 |

Retry of the dropped ones: graph_s was tried on top of set_s+move_s (step 3) and connect_s on top of the same (step 4) after the two kept ones, so that is the retry; neither changes sign. Full lines: greedy.txt.

## Composer before / after, per data folder

Before = round-1 registry, after = final registry (set_s, move_s), both on the current code.

| folder | before msg R/H/W (n) | after msg R/H/W (n) | before req C/ND/DW (extra) | after req C/ND/DW (extra) |
|---|---|---|---|---|
| llm_train/sonnet_msg | 7.2/15.8/77.0 (43/95/462) | 8.0/16.7/75.3 (48/100/452) | 57.3/23.1/19.6 (176) | 58.3/23.1/18.6 (173) |
| llm_train/haiku_msg | 62.2/7.2/30.7 (373/43/184) | 63.0/8.5/28.5 (378/51/171) | 88.1/4.2/7.7 (34) | 88.6/4.3/7.0 (34) |
| llm_train/sonnet_msg2 | 3.5/31.3/65.2 (21/188/391) | 3.3/31.0/65.7 (20/186/394) | 46.5/41.2/12.3 (264) | 46.5/41.2/12.2 (264) |
| llm_train/haiku_msg2 | 28.7/28.5/42.8 (172/171/257) | 28.3/28.7/43.0 (170/172/258) | 66.7/24.5/8.8 (143) | 66.6/24.5/8.9 (141) |
| llm_train/sonnet_long | 0.8/1.3/97.9 (2/3/235) | 0.8/1.7/97.5 (2/4/234) | 49.5/26.9/23.5 (219) | 50.5/27.1/22.3 (223) |
| llm_bench/fresh1/sonnet | 19.6/18.4/62.0 (98/92/310) | 19.2/18.0/62.8 (96/90/314) | 65.2/19.1/15.7 (151) | 65.5/19.2/15.3 (151) |
| llm_bench/fresh1/haiku | 27.4/22.0/50.6 (137/110/253) | 27.4/22.4/50.2 (137/112/251) | 69.4/17.0/13.6 (125) | 69.6/17.0/13.4 (125) |
| llm_bench/sonnet_spans | 1.2/23.4/75.4 (6/117/377) | 1.0/25.2/73.8 (5/126/369) | 36.7/42.4/20.9 (179) | 37.6/42.3/20.1 (175) |
| llm_bench/haiku_spans | 21.0/18.2/60.8 (105/91/304) | 23.6/19.6/56.8 (118/98/284) | 69.9/15.6/14.4 (104) | 70.8/15.8/13.4 (104) |
| ALL (4640) | 20.6/19.6/59.8 (957/910/2773) | 21.0/20.2/58.8 (974/939/2727) | 60.7/23.9/15.4 (1395) | 61.2/23.9/14.8 (1390) |

Per-message wrong falls in 6 of 9 folders (sonnet_msg, haiku_msg, sonnet_long, fresh1/haiku, sonnet_spans, haiku_spans) and rises in 3 (sonnet_msg2 +3, haiku_msg2 +1, fresh1/sonnet +4). Per-request done wrong falls or stays in 8 of 9 (haiku_msg2 +0.1).

## Hand-written rules on the same folders (current code)

| folder | per message R/H/W | per request C/ND/DW (extra) |
|---|---|---|
| llm_train/sonnet_msg | 9.0/6.0/85.0 | 60.6/19.1/20.3 (523) |
| llm_train/haiku_msg | 30.5/0.7/68.8 | 79.7/2.6/17.7 (303) |
| llm_train/sonnet_msg2 | 9.8/5.8/84.3 | 63.1/18.6/18.3 (633) |
| llm_train/haiku_msg2 | 26.0/2.0/72.0 | 72.5/9.8/17.7 (434) |
| llm_train/sonnet_long | 0.0/0.8/99.2 | 53.4/19.5/27.1 (536) |
| llm_bench/fresh1/sonnet | 19.2/9.6/71.2 | 69.8/17.0/13.2 (427) |
| llm_bench/fresh1/haiku | 43.0/7.2/49.8 | 78.7/7.8/13.5 (321) |
| llm_bench/sonnet_spans | 4.6/9.6/85.8 | 44.9/32.3/22.9 (361) |
| llm_bench/haiku_spans | 38.2/3.2/58.6 | 81.3/6.5/12.2 (202) |
| ALL | 21.0/5.0/74.0 (976/231/3433) | 66.6/15.3/18.1 (3793) with the code before the change below; 66.8/15.1/18.1 (3740) after, 21.1/5.1/73.8 |

The rules still have more correct per request (66.8 vs 61.2) and per folder win on the haiku sets, but also 3740 extra wires against 1390 and 73.8% wrong messages against 58.8%.

## Units per world (final registry, 23027 units)

set_s 3289, connect 2380, move_s 2426, superlatives 1547, graph 1034, describe 716, targets 693, layout 685, create 628, history 585, naming 532, filters 1359, facts 1207, resize 212, disconnect 111; the fallback kinds_p80_s0 reads 1254 (units of actions with no world: check, swap, degree...); several candidate worlds read 3347 units; asked 210; ignored 4159 (3224 have no action token). Base had set 3300, move 2438, ignored 4141.

## Code changed mid-round

The first composer runs (base 956/885/2799, set step 954/897/2789, move step 974/912/2754, graph step 974/912/2754; the connect step already ran on the new code) were made before docs/js/logic.js and bench-canon.js were modified (files dated Oct 31 23:21; the rules line moved 976 -> 977 right). The base, set and graph runs were repeated (the move run twice) on the current code and the tables above use only the repeat; the first runs are in `mw2/v1/`. Decisions are the same in both. Keep this in mind when comparing with round-1 numbers.

## Problems in skills/vss-microworlds/SKILL.md (found while following it)

1. `micro_tools.py gold connect_s` breaks: `gold` treats any world name starting with `connect_` as a ROW_SHAPE (`if not shape and a.arg.startswith("connect_"): shape = a.arg.split("_",1)[1]` gives shape `s`). Also `gold` needs docs/model/micro/<w>/BUILD.json, which exists only after training ends. Workaround used: gold of the round-1 world with the same events. Fix: read ROW_SHAPE only from BUILD.json (empty for `_s`), or compute the gold from events given on the command line. (Bug report; code not changed.)
2. The skill does not say that new worlds with a suffix (`_s`) need the registry command to read BUILD.json (works) nor how to name a retrain; step 4 should name the rule "new name, registry unchanged until step 6".
3. Step 4 times are too low for the largest worlds on this run: set_s (4188 rows) 1 h 43 min of training plus about 40 min of silent evaluation before BUILD.json appears; connect_s (3427 rows) 2 h 25 min of training (peak RSS 3.3 GB) plus about 3 h before export finished; move_s ~1.5 h; graph_s (1275 rows) under 1 h. The completion signal is the file docs/model/micro/<w>/BUILD.json; the skill should say so (a log line does not appear for the evaluation).
4. A background `while ! [ -f ... ]` wait loop is killed after the background time limit and the notice looks like a failure; the skill should recommend `timeout 590 bash -c 'until [ -f BUILD.json ]; do sleep 20; done'` in the foreground, repeated.
5. Step 6 rule does not cover "wrong equal, right equal, extras fall" (graph_s) or "wrong falls by 9 while right falls by 2" (set_s). Define: keep if wrong falls by at least 0.1 point of messages and right does not fall by more than the wrong fall; equal -> keep the registered world.
6. The composer scoring takes 2 min alone, up to 10+ min while two trainings run, and then the foreground command is moved to the background by the tool timeout (600 s). Say: run it in the background and poll the output file.
7. The rules/logic code is shared with the eval: any change to docs/js/logic.js or bench-canon.js during a round changes the numbers (rules 976 -> 977 right, the composer changed by tens of messages). The skill should require re-running the base after any code change and writing the commit of the code used in the table.
8. Step 5's "keep as a candidate when done wrong is not higher and correct is higher": set_s would fail it against the fallback (15.1 vs 13.8 done wrong), yet it helped the composer slightly. The fit gate again does not predict the composer result (also connect_s vs connect: fit -1.3 correct, +4 done wrong, composer clearly worse).
9. Step 7 report items "units still read by the fallback, ignored and asked" are available only in the "composer units" line; the skill should say the per-folder extra and the three-way counts come from the lines "vss per message" / "vss per request" and give a script (the parser used here is mw2/tab.py).
10. More data did not make connect better: training on 731 more messages made connect_s lose 1.3 correct on its rows and 55 messages in the composer. Likely cause: the shared front end (front.json learned from all 4640 messages) or the data of the two spans sets (sonnet_spans is a hard set: 1% fully right); not diagnosed. FRONT_ROWS=world (next round) addresses the first.

## Files changed

docs/model/micro/registry.json (set -> set_s, move -> move_s); new: docs/model/micro/{set_s,connect_s,move_s,graph_s}/, training/sketch/worlds_micro/{set_s,connect_s,move_s,graph_s}/, training/sketch/runs/micro_{set_s,connect_s,move_s,graph_s}_D1024_e10_s0*, this file. connect_s and graph_s are trained but not registered.
