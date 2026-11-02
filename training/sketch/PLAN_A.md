# Plan A: the 16 worlds with FRONT_ROWS=world (finished 14 of 16; connect_w and move_w were stopped)

Run 2026-11-01 on the corrected data (commit 0afbd36 labels, working tree). Command per world:
`SOP_PYTHON=/home/claude/venv/bin/python3 DATA=spans FRONT_ROWS=world bash training/sketch/train_micro.sh <world>_w <events>`, two at a time.
Cutter: `python3 training/sketch/train_cutter.py --worlds training/sketch/worlds_micro/GROUPS_16.json --out docs/model/micro/cutter_worlds16.json` (retrained first).
Scratch: /tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/planA (STATUS.txt, scores, registries).

## Trap: the 6 h wall-clock guard

`sop train` has a guard (`VSA_MAX_HOURS`, default 6; training/vss/experiment/guard.py) that exits the process after 6 h from the start. It counts
the silent evaluation after training too. connect_w trained for 3.77 h, then the evaluation (`--n_eval 600`, all modes) ran into the guard:
exit 4 after the route book was written, before the export, no checkpoint (`--no_ckpt`): the whole run was lost. **A world that takes more than
about 6 h in total (training plus evaluation) needs `VSA_MAX_HOURS=12` (or more) in the command, and a smaller `N_EVAL`/`EVAL_MODES=primary`.**
Small worlds finished in 5-70 minutes; set_w 2 h 34 min.

## Fit on each world's own gold rows (SEG=gold, per request)

Cell = right / wrong / not done / extra (percent of gold requests; extra = count), then the unknown-event share of the reader status
(error_analysis.mjs). "old" = micro/<world> (shared front end). set also: set_s 65.8/15.4/18.8/1, unk 17.9%.

| world | gold rows | _w (right/wrong/not done/extra, unknown-event share) | old | fallback |
|---|---|---|---|---|
| create | 922 | 80.0/14.1/5.9/0 unk 5.5% | 61.7/16.4/21.9/0 unk 21.7% | 46.2/22.9/30.9/108 unk 16.2% |
| graph | 1280 | 90.3/4.8/4.9/39 unk 1.9% | 88.7/4.5/6.9/38 unk 3.9% | 42.5/7.8/49.7/492 unk 9.3% |
| facts | 1091 | 90.3/6.3/3.4/14 unk 2.0% | 79.7/4.4/15.9/5 unk 15.3% | 77.6/6.1/16.2/27 unk 12.5% |
| resize | 273 | 70.3/28.2/1.5/0 unk 1.5% | 57.5/20.1/22.3/0 unk 22.3% | 65.6/22.0/12.5/13 unk 7.0% |
| filters | 1524 | 74.5/15.1/10.4/121 unk 2.4% | 59.0/23.6/17.4/95 unk 11.2% | 51.5/24.4/24.1/228 unk 8.7% |
| superlatives | 1649 | 97.6/2.0/0.4/1 unk 0.4% | 95.3/2.4/2.3/0 unk 2.2% | 92.3/2.1/5.6/87 unk 0.2% |
| history | 743 | 97.8/0.0/2.2/0 unk 1.9% | 95.0/0.0/5.0/0 unk 4.7% | 81.3/0.0/18.7/36 unk 2.0% |
| describe | 1088 | 91.4/5.0/3.7/12 unk 2.5% | 82.7/4.2/13.1/5 unk 12.5% | 64.4/2.8/32.7/271 unk 7.2% |
| naming | 563 | 80.6/14.6/4.8/1 unk 3.9% | 78.5/15.6/5.9/0 unk 5.2% | 77.4/14.7/7.8/4 unk 6.4% |
| targets | 869 | 87.2/10.7/2.1/5 unk 0.8% | 79.4/11.5/9.1/5 unk 8.1% | 67.5/9.4/23.0/63 unk 11.2% |
| layout | 821 | 54.0/40.4/5.6/2 unk 4.3% | 47.0/44.0/9.0/3 unk 7.8% | 40.7/41.9/17.4/49 unk 6.2% |
| set | 4056 | 76.5/16.9/6.6/0 unk 5.5% | 64.5/15.7/19.7/0 unk 18.9% | 63.7/14.1/22.2/56 unk 17.6% |
| disconnect | 170 | 85.9/9.4/4.7/0 unk 4.7% | 64.1/7.6/28.2/0 unk 28.2% | 52.4/8.8/38.8/37 unk 14.7% |
| check | 1002 | 88.2/11.8/0.0/0 unk 0.0% | 63.2/7.5/29.3/0 unk 29.3% | 84.5/9.9/5.6/42 unk 1.2% |


Not trained: connect_w, move_w (stopped by the coordinator). Gold rows differ per world (gold requests of the world's events, all 9 folders).

Reading:
- 12 of 14 worlds gain in right; the gain is almost all in "not done" (unknown-event falls, e.g. check 29.3% -> 0.0%, disconnect 28.2% -> 4.7%,
  resize 22.3% -> 1.5%, set 18.9% -> 5.5%, create 21.7% -> 5.5%, describe 12.5% -> 2.5%).
- "Done wrong" rises in the worlds that gained: check 7.5 -> 11.8, resize 20.1 -> 28.2, create 16.4 -> 14.1 (down), filters 23.6 -> 15.1 (down),
  facts 4.4 -> 6.3, graph 4.5 -> 4.8, set 15.7 -> 16.9, disconnect 7.6 -> 9.4, targets 11.5 -> 10.7. Requests that were "not done" are now read, and
  some are read wrong. layout is the weakest (54.0 right, 40.4 wrong).
- naming and graph barely move (they already had unknown-event 5% / 4%).
- check_w is 88.2 right with 0 unknown; the fallback is 84.5 but with 42 extra.

## describe_w: 0 value rules, property questions

describe_w/front.json has `values: 0` (300 trigger rules). Property questions ("what color is X"), on the gold rows of the event
(right / wrong / not done / extra; unknown-event):

| rows | describe_w | describe (old) | fallback |
|---|---|---|---|
| property, 261 requests | 83.1 / 14.2 / 2.7 / 0; unk 7 | 80.8 / 12.6 / 6.5 / 0; unk 17 | 59.8 / 9.2 / 31.0 / 68; unk 13 |
| property asking a colour, 131 messages | 86.5 / 13.5 / 0.0 / 0 | 85.0 / 12.0 / 3.0 / 0 | 60.9 / 6.8 / 32.3 / 43 |
| describe | 95.8 / 1.4 / 2.8 / 2 | 93.3 / 1.1 / 5.6 / 1 | 89.5 / 1.1 / 9.5 / 3 |
| neighbors | 93.8 / 2.7 / 3.6 / 2 | 71.4 / 2.7 / 25.9 / 0 | 21.0 / 0.0 / 79.0 / 146 |
| degree | 92.1 / 2.5 / 5.3 / 8 | 82.4 / 1.6 / 16.0 / 4 | 76.1 / 1.6 / 22.3 / 54 |

describe_w is not worse than describe on property: right +2.3 (colour +1.5), not done lower, but "done wrong" is 1.5 points higher in both cuts
(14.2 vs 12.6, 13.5 vs 12.0). The missing value rules do not hurt these questions.

## Composer on the fixed sample (1000 messages, seed 0, by message id; ids in planA/sample1000_ids.txt), PAIR=value

Cell = right / wrong / not done / extra (count), percent of gold requests. "not done" includes the requests the context filler asked about.
1. today's composer: default registry (token router, cutter.json; models set_s, move_s, ...).
2. router v2, OLD worlds: registry_old.json (cutter_worlds16, context weights, micro/<world>; check -> micro/check; set, move, connect = micro/set, micro/move, micro/connect).
3. router v2, _w worlds: registry_w_partial.json: the 14 _w worlds, **connect -> micro/connect and move -> micro/move_s** (connect_w and move_w do not exist).

| folder (gold wires) | 1 today | 2 v2 old worlds | 3 v2 _w worlds |
|---|---|---|---|
| ALL (1000 msgs, 4858 gold) | 61.8 / 13.7 / 24.6 / 306 | 67.6 / 12.7 / 19.7 / 167 | 72.8 / 11.5 / 15.7 / 318 |
| bench_fresh1_haiku (542) | 70.8 / 11.6 / 17.5 / 23 | 78.2 / 12.5 / 9.2 / 11 | 78.4 / 15.3 / 6.3 / 18 |
| bench_fresh1_sonnet (700) | 64.3 / 13.6 / 22.1 / 31 | 66.6 / 11.6 / 21.9 / 14 | 73.4 / 12.1 / 14.4 / 43 |
| bench_haiku_spans (442) | 67.9 / 16.1 / 16.1 / 27 | 69.5 / 17.0 / 13.6 / 14 | 72.4 / 11.5 / 16.1 / 40 |
| bench_sonnet_spans (483) | 38.5 / 18.6 / 42.9 / 35 | 40.2 / 15.3 / 44.5 / 19 | 46.2 / 12.4 / 41.4 / 42 |
| train_haiku_msg (483) | 88.4 / 6.4 / 5.2 / 8 | 87.8 / 7.7 / 4.6 / 7 | 92.8 / 5.6 / 1.7 / 8 |
| train_haiku_msg2 (427) | 69.8 / 8.9 / 21.3 / 28 | 81.3 / 10.8 / 8.0 / 12 | 85.9 / 7.0 / 7.0 / 22 |
| train_sonnet_long (535) | 55.5 / 20.0 / 24.5 / 47 | 59.4 / 18.3 / 22.2 / 26 | 70.5 / 14.6 / 15.0 / 49 |
| train_sonnet_msg (667) | 60.0 / 15.0 / 25.0 / 38 | 65.7 / 9.4 / 24.9 / 29 | 70.5 / 10.8 / 18.7 / 47 |
| train_sonnet_msg2 (579) | 44.6 / 12.1 / 43.4 / 69 | 63.4 / 12.8 / 23.8 / 35 | 67.5 / 12.4 / 20.0 / 49 |

Asked by the context filler (inside not done), ALL: 48 / 175 / 186 (variants 1 / 2 / 3). Variant 3 ties: 491 units tied at the fewest words not
understood, 450 decided by order; variant 2: 14 ties.

Reading:
- v2 with old worlds already beats today's composer (right 61.8 -> 67.6, extra 306 -> 167, not done 24.6 -> 19.7), as in ROUTER_V2.md section 6.
- the _w worlds add 5.2 points of right (72.8) and cut not done to 15.7, wrong 12.7 -> 11.5; extra goes up again, 167 -> 318, and the order-decided
  ties go from 14 to 450: with own-rows front ends more worlds read the same unit (a wrong world can read a unit without unknown words).
  The extra count is the thing to watch.
- Caveat: variant 3 is not pure; connect and move are not _w.

## Files

Changed or new: docs/model/micro/cutter_worlds16.json (retrained), docs/model/micro/<world>_w/ for the 14 worlds (check, create, describe, disconnect, facts,
filters, graph, history, layout, naming, resize, set, superlatives, targets), training/sketch/worlds_micro/<world>_w/ (build folders, gitignored),
training/sketch/runs/micro_<world>_w*, training/sketch/PLAN_A.md.

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/micro/check` (ffa8b0d), `docs/model/micro/check_w` (f2725dd), `docs/model/micro/connect` (cd4be6a), `docs/model/micro/cutter.json` (98fb038), `docs/model/micro/cutter_worlds16.json` (4626cf6), `docs/model/micro/describe_w` (f2725dd), `docs/model/micro/move` (ffa8b0d), `docs/model/micro/move_s` (68b0656), `docs/model/micro/set` (cd4be6a), `docs/model/micro/set_s` (cf15a5d), `docs/model/micro/set_w` (0776f18). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
