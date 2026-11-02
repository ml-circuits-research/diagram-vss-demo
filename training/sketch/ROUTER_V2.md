# Composer v2: the cutter's worlds as candidates, fewest words not understood, the context layer after VSS

Owner's decision, 2026-11-01:
1. The GLOBAL trigger mapper goes. No phrase -> action table runs before the router. Inside a micro-world, trigger rules learned only from
   that world's own rows are allowed.
2. The cutter predicts the candidate worlds: its B label carries the world (B-<world>).
3. Among the candidates, the world whose VSS reader leaves the fewest words not understood wins. A tie that remains goes to the post-VSS
   layer. The VSS layer never asks.
4. The post-VSS context filler (docs/js/vss-context.js, docs/model/context/weights.json, margin 0) is part of the pipeline.

Coordinator, same day: the owner regroups the worlds by shared roles. The retraining compares the current 16 worlds with 6 worlds, so the
cutter takes its world -> events grouping from a file.

The new pipeline sits behind switches. The defaults are byte-identical (section 5). No VSS world was trained. Nothing was committed.

## 1. Cutter with worlds (`train_cutter.py --worlds [GROUPING]`)

- Labels: B-<world> for the worlds of the grouping, I, O. The label B-fallback is added only when some legend event has no world.
- The trainer, the features and the epochs are those of the shipped cutter (`front.py train_segmenter`, now with an optional label
  function; called without it, it is the old code path). Data: the same 7 folders as `cutter.json`.
- Grouping file: a `{world: [events]}` map, or a registry. With no file, it is `docs/model/micro/registry.json`.
  - Events must be legend events (`generate.EVENTS`). A question with ask=rules is the event `list`.
  - An event listed by two worlds is an error.
  - Label order (the order that breaks ties in decoding): the grouping's worlds, then fallback, then I, O.
- The output stores `labels`, `worlds`, `grouping` and `events_of_no_world`.
- Written:

  | file | grouping | worlds | fallback label | weights |
  |---|---|---|---|---|
  | `docs/model/micro/cutter_worlds.json` | registry (15 worlds) | 15 | yes (check, swap) | 38331 |
  | `docs/model/micro/cutter_worlds16.json` | `worlds_micro/GROUPS_16.json`: the 15 + check | 16 | yes (swap only) | 38450 |
  | `docs/model/micro/cutter_worlds6.json` | `worlds_micro/GROUPS_6.json` | 6 | no (all 35 events have a world) | 31933 |

- GROUPS_6 follows the owner's list. "rules" is not a legend event: ask=rules is the event `list`, which is already in questions.
  `cycle` moves from history to questions, and `swap` goes to position.
- `training/sketch/worlds_micro/` is in .gitignore (line 13), so the two GROUPS files need `git add -f` or a .gitignore exception.

JS side, docs/js/front.js (`segmentSpans` is unchanged):
- `segDecodeLabels`: the decoder with any label set.
- `segmentWorlds(text, names, C)`: returns `[{c0, c1, worlds: [{world, score}]}]`, the worlds ranked by their B-<world> score at the
  unit's first token.
- The Python twin is `front.py segment_worlds`. Parity on all 4640 messages: 22339 units, 0 messages differ.

## 2. Per-world front end (`FRONT_ROWS=world`, msg_to_world.py)

- Needs WORLD_EVENTS. The value n-grams AND the trigger rules are learned only from the spans of the world's requests (and its ROW_SHAPE).
  The text outside the spans and the requests of other events are not read (`front.learn(..., keep=...)`), so a rule's precision is
  counted inside the world.
- The names of every wire still count as names, so the tokenization of the rows does not change. The kinds do not change.
- front.json gets a field `front_rows`, and REAL_WORLD.md gets one line.
- Unset or `FRONT_ROWS=all`: exactly as before.
- train_micro.sh passes FRONT_ROWS through and records `"FRONT_ROWS"` in BUILD.json (`""` when unset).
  - Two trainings were running from that file, so it was replaced by rename (new inode); the running shells kept the old file.
  - The `graph_s` training another agent started at 11:00 already uses the new file, with FRONT_ROWS unset, which is the default path.
- Example, world check (DATA=spans, 1002 rows): 27 value n-grams and 129 trigger rules, all `is_q`. The global front end has 221 n-grams
  and 2718 rules, of which 28 are `is_q`.

### Does every event of a multi-event world get its rules? (`front_rows_check.py`, DATA=spans, PYTHONHASHSEED=0)

For each world, the front end is learned exactly as FRONT_ROWS=world learns it. Each request of the world is then normalized as its
training row is. "own token" = the row holds a token of its own event. The full table is the script's output (`python3
front_rows_check.py worlds_micro/GROUPS_16.json worlds_micro/GROUPS_6.json`, about 10 minutes).

- **Every event of every world gets trigger rules** in both groupings. The fewest are undo 10, swap 12 and rename 18.
- **GROUPS_16**:
  - Own-rows front ends cover each event's own token at least as well as the global front end for every event except count (96.7% vs
    97.1%).
  - Gains: check 42.4% -> 100%, set 79.2% -> 94.7%, connect 89.9% -> 99.7%, create 82.0% -> 94.4%, delete 75.2% -> 98.0%,
    disconnect 71.8% -> 95.3%, neighbors 69.2% -> 96.4%.
  - Lowest: reachable 77.9% (19.3% of its rows carry another graph token, mostly `connected_q`/`path_q`), align 85.1%, label 90.5%.
- **GROUPS_6**: merging events lowers the precision of the rules inside a world, and some rules are dropped:

  | world | event | own token, own-rows front, 6 worlds | own-rows front, 16 worlds | global front |
  |---|---|---|---|---|
  | shapes | set | 80.9% (15.5% no event token) | 94.7% | 79.2% |
  | shapes | resize | 77.0% (21.5% another event's token) | 98.2% | 78.5% |
  | shapes | rule | 73.9% | 92.2% | 70.6% |
  | shapes | check | 98.5% | 100% | 42.4% |
  | links | connect | 94.9% | 99.7% | 89.9% |
  | questions | exists | 70.5% (19.3% another event's token) | 96.0% | 79.6% |
  | questions | neighbors | 79.5% | 96.4% | 69.2% |
  | position | move | 99.0% | 99.4% | 92.0% |

  - In the 6 worlds, each world's reader must pick the event from the words more often.
  - Two events have fewer rows with their own token than with today's global front end: exists 70.5 vs 79.6, resize 77.0 vs 78.5.
  - These are row-normalization counts, not readings. Whether the reader still finds the event is measured only after training.
- End-to-end build of a multi-event world with FRONT_ROWS=world (questions, 10 events, to scratch, not trained):
  - 4457 requests -> 4411 rows (46 dropped: no event token and no role).
  - 96 value n-grams, 969 trigger rules; the legend lists exactly the 10 events.
  - `sop check`: 2/2 files OK.

## 3. Composer v2 (docs/js/vss-composer.js, router "cutter")

Switch: registry field `"router": "cutter"` (then the registry's `cutter` is a cutter with worlds, plus optional `"context"`), or
`loadComposer(..., {router: "cutter", context, k})`. Default: router "token", today's code path.

1. **Cut and candidates.** `segmentWorlds` cuts the message. The candidates of a unit are the cutter's **top 3** worlds.
   - k = 3 is the smallest k with recall >= 97% in cutter_worlds_probe.py: recall@2 96.6%, recall@3 97.9% (free decode, all requests).
   - Why a fixed k and not a score margin: the probe measured recall per k, not per margin. A margin would have to be chosen by a new
     measurement, and AGENTS.md forbids choosing it on the fly.
   - For GROUPS_6 (6 labels) the probe has not been run. k = 3 is then half of the worlds. Re-applying the same rule (smallest k with
     >= 97%) needs `cutter_worlds_probe.py` to read the grouping; it reads only the registry today. Not done; coordinator's call.
2. **Reading.** Each candidate reads the unit with its own front end.
   - `front.js normalizeTrace` = `normalize` plus the surface words behind each token.
   - Parity: 476742 normalizations (21 front ends x every gold span), 0 differ.
3. **Words not understood.** This is the count of words_not_understood.mjs: surface words, punctuation excluded, not behind a role filler,
   an accepted offer or the action token. A reading with status unknown-event or no-sense understands no word.
4. **Choice.** The fewest words not understood wins. Two rules follow from the owner's text; they are stated here so they can be checked:
   - **(a)** A reading that understands no word is not a reading. If no candidate understood a word, the unit is ignored ("not
     understood"). AGENTS.md: never guess silently.
   - **(b)** The fallback reading counts only when its event is one no registered world holds ("the fallback is a candidate only for
     events no world holds"). The cutter's "fallback" label stands for exactly those events.
5. **Tie** -> `vss-context.js chooseReading`. Each tied reading is tried on the context without changing it (`step` with `dry`).
   - If exactly one reading fits (the context completes it with no gap to ask), it wins: decided by "context".
   - If several fit, or none, the first in the cutter's rank wins: decided by "order". When none fits, the filler then asks about the gap.
   - **This "order" step is my choice.** It follows the margin-0 rule (take the first-ranked rather than ask). The coordinator should
     confirm it.
6. **Filling.** The context filler (`Context`, weights.json, margin 0) fills the reference gaps of the chosen reading.
   - A request with a gap the filler cannot fill is zone "ask" and is not executed.
   - The VSS layer itself never asks.
7. **Validation.** The composer refuses a cutter whose worlds and events differ from the registry's.
   - Example: `cutter_worlds16.json` with today's registry -> error "the cutter's world check is not in the registry".

## 4. Scoring (llm_score.mjs)

- `SEG=composer ROUTER=cutter` runs v2 (or a registry with `"router": "cutter"`).
  - Cutter: `CUTTER`, else `docs/model/micro/cutter_worlds.json`.
  - Filler model: `CONTEXT`, else `docs/model/context/weights.json`.
  - Requests the filler asks about are not executed, so they count as not done.
  - An extra line "composer v2: ..." gives: decided by words / context / order, tie sizes, asked by the filler, why units were ignored.
- `PAIR=value`: the pairing of `layer_common.mjs pairValue` instead of the order-only LCS.
  - The weights use the scored values (the final canon).
  - The unit is `node.span` when the composer gives it (v2 does), else the first occurrence of `node.src` in the text.
  - Unset or `PAIR=order`: as before.

## 5. Proof that the defaults are unchanged

| what | before (HEAD code) vs after | result |
|---|---|---|
| `llm_score.mjs` SEG=composer, llm_bench/haiku_spans | stdout | byte-identical |
| SEG=composer, haiku_spans + llm_train/haiku_msg | stdout | byte-identical |
| MODEL=kinds_p80_s0 SEG=gold, haiku_spans | stdout | byte-identical |
| MODEL=kinds_p80_s0 SEG=tagger CUTTER=micro/cutter.json, haiku_spans | stdout | byte-identical |
| MODEL=kinds_p80_s0 (VSS cut), haiku_spans | stdout | byte-identical |
| default MODEL=sketch, llm_bench/haiku | stdout | byte-identical |
| `train_cutter.py` (no option) | cutter.json | byte-identical (its segmenter also equals the shipped one) |
| `msg_to_world.py` WORLD_EVENTS=check DATA=spans KINDMAP=kinds_comb1, HEAD code vs new code, PYTHONHASHSEED=0 | the whole world folder | byte-identical |

**Finding: a bug in front.py that predates this change.** Without a fixed hash seed, two runs of the SAME code give different front.json
files.
- `learn_values` breaks a tie between two values by `Counter.most_common`, i.e. by insertion order. That order comes from iterating a
  set of strings (`gold_values`), which changes with PYTHONHASHSEED.
- Seen here: "the boxes" -> `rectangles` in one run, `all` in the other. The trigger counts that depend on it shift too (e.g. "make all":
  n 5 vs 7).
- So no front.json is exactly reproducible today. The fix belongs in front.py: a sorted iteration or an explicit tie rule. That changes
  outputs, so it was not done here.

## 6. Smoke test (code check)

Setup:
- Worlds: today's 15, trained with the global front end. Fallback kinds_p80_s0.
- Cutter: cutter_worlds.json. haiku_spans is NOT in the cutter's training folders (for v1's cutter.json either).
- Filler: weights.json, margin 0.
- Data: llm_bench/haiku_spans, 500 messages, 2202 requested actions.

| composer | pairing | right | done wrong | not done | extra |
|---|---|---|---|---|---|
| v1 (today) | order-only | 1540 (69.9%) | 14.4% | 15.6% | 104 |
| **v2** | order-only | **1597 (72.5%)** | **13.7%** | **13.8%** (incl. 54 asked by the filler) | **55** |
| v1 | PAIR=value | 70.2% | 14.2% | 15.6% | 104 |
| v2 | PAIR=value | 73.0% | 13.3% | 13.8% | 55 |

v2 units: 2167, every one read by 3 candidate worlds.
- Decided by the fewest words not understood: 2003. Ties of 2 readings: 5, all decided by "order"; none by "context".
- Asked by the filler: 54.
- Ignored: 159, of which 154 no candidate could read (unknown-event / no-sense) and 5 only the fallback read, with a world's event.
- v1 ignored 214 units and asked 19.

What this does and does not show:
- The code runs end to end, and v2 is not worse on this folder.
- v2 also contains the filler (v1 does not). The two changes are not separated here. The filler alone, on v1 at margin 0 (LAYERS.md B.2,
  all data): right 61.4 -> 63.0%, wrong 14.4 -> 10.5%.
- This is one folder, with worlds whose front ends are still global. It is not a measurement of v2.

## 7. Training plan for the coordinator (not started)

Common settings:
- Command per world: `SOP_PYTHON=/home/claude/venv/bin/python3 DATA=spans FRONT_ROWS=world bash training/sketch/train_micro.sh <name> <events>`.
- At most 2 at once; watch with `ps -eo rss,args | grep "sop train" | grep -v grep`; one STATUS line per finished world.
- "Rows" are the requests with a span (DATA=spans); a few are dropped at build (questions: 4457 -> 4411).

Times are estimates from the measured runs (run folder: command.txt -> REPORT.md, 2 trainings at once):
- set 3142 rows 102 min, set_s 4188 rows 140 min (peak 1.56 GB);
- move 2378 rows 63 min, move_s 3042 rows 132 min;
- connect 2696 rows 197 min (peak 3.18 GB);
- **connect_s, 3427 rows: still running after 4 h 44 min at 11:03** (peak 3.27 GB);
- the small worlds 3-37 min.

### Plan A: the current 16 worlds with FRONT_ROWS=world

Folder `<world>_w`, so the current worlds stay for comparison. Order = most requests first, two slots.

| # | slot | name | events | rows | estimate (from) |
|---|---|---|---|---|---|
| 1 | A | set_w | set | 4192 | ~2.5 h (set_s 140 min, 4188 rows) |
| 2 | B | connect_w | connect | 3427 | >= 5 h (connect_s still running at 4 h 44) |
| 3 | A | move_w | move | 3044 | ~2.2 h (move_s 132 min, 3042 rows) |
| 4 | A | superlatives_w | extreme,nearest | 1649 | ~20 min (12 min, 1278) |
| 5 | A | filters_w | count,exists,list | 1524 | ~15 min (9 min, 1236) |
| 6 | A | graph_w | path,reachable,connected | 1280 | ~15 min (11 min, 1091) |
| 7 | A | describe_w | describe,property,neighbors,degree | 1088 | ~20 min (14 min, 820) |
| 8 | B | check_w | check | 1002 | ~10 min (9 min, 875) |
| 9 | B | facts_w | fact,rule | 954 | ~25 min (20 min, 861) |
| 10 | B | create_w | create | 922 | ~45 min (37 min, 754) |
| 11 | A | targets_w | delete,duplicate,toFront,toBack | 869 | ~10 min (7 min, 748) |
| 12 | B | layout_w | arrange,align,distribute | 822 | ~35 min (29 min, 694) |
| 13 | A | history_w | undo,redo,forget,cycle | 743 | ~5 min (4 min, 663) |
| 14 | B | naming_w | rename,label | 563 | ~20 min (15 min, 495) |
| 15 | A | resize_w | resize | 274 | ~5 min |
| 16 | B | disconnect_w | disconnect | 170 | ~5 min |

- Sum about 14 h of training. Wall time about 7.5 h on two slots: slot A about 6 h, slot B about 7.5 h. connect_w dominates.
- `swap` (179 requests) has no world: the fallback reads it.
- Then the registry:
  - `"router": "cutter"`, `"cutter": "micro/cutter_worlds16.json"`, `"context": "context/weights.json"`, fallback kinds_p80_s0;
  - worlds: `{"world": "<world>", "events": [...], "model": "micro/<world>_w"}` for the 16 worlds of GROUPS_16.
  - The world ids must be the GROUPS_16 names (the cutter's labels); only the model folder carries `_w`.
- Score: `REGISTRY=<file> SEG=composer node llm_score.mjs $(python3 micro_tools.py dirs)`, also with `PAIR=value`.

### Plan B: the 6 worlds (GROUPS_6), FRONT_ROWS=world

| # | name | events | rows | estimate |
|---|---|---|---|---|
| 1 | shapes | create,set,resize,check,fact,rule | 7344 | ~4-5 h: linear from set_s; not measured at this size, peak RSS unknown |
| 2 | links | connect,disconnect,path,reachable,connected | 4877 | >= 6 h: connect rows are the slow ones (connect_s > 4 h 44 on 3427 rows); peak likely >= 3.2 GB |
| 3 | questions | count,exists,list,extreme,nearest,describe,neighbors,degree,property,cycle | 4457 (4411 built) | ~1-2.5 h (its parts ran at 9-14 min per ~1000 rows) |
| 4 | position | move,swap,arrange,align,distribute | 4045 | ~2.5-3 h (move_s 132 min, 3042) |
| 5 | manage | delete,duplicate,rename,label,toFront,toBack | 1432 | ~20-30 min |
| 6 | history | undo,redo,forget | 547 | ~5 min |

- Suggested slots: shapes + questions first, then links + position, then manage + history.
- Do not pair shapes with links until shapes' peak RSS is known: no world this large has been trained.
- Wall time about 10-12 h. These are estimates; I don't know how time and memory grow beyond 4200 rows.
- Every legend event has a world, so the fallback reads nothing.
- Registry: `"cutter": "micro/cutter_worlds6.json"`, worlds `{"world": "shapes", "events": [...], "model": "micro/shapes"}` and so on.
- Section 2: several events of these worlds have fewer rows with their own token than in the 16 worlds (set 80.9%, resize 77.0%,
  exists 70.5%, rule 73.9%). Check the reader status counts (unknown-event share) of each 6-world after training (SKILL.md trap).
- k = 3 of 6: see section 3.1.

If one plan has to go first: Plan A, set_w and connect_w first. They are the most requested actions, and Plan A measures the front-end
change alone (one change at a time). Plan B changes the grouping AND the front end together. To separate the two, its comparison is with
Plan A, not with today's worlds.

## Files

Changed:
- `docs/js/front.js`: `segDecodeLabels`, `segmentWorlds`, `normalizeTrace`.
- `docs/js/vss-composer.js`: router "cutter".
- `docs/js/vss-context.js`: `step` option `dry`, `chooseReading`.
- `training/sketch/front.py`: `train_segmenter` labels, `seg_decode_labels`, `segment_worlds`, `learn(keep=)`.
- `training/sketch/train_cutter.py`: `--worlds [GROUPING]`.
- `training/sketch/msg_to_world.py`: `FRONT_ROWS`.
- `training/sketch/train_micro.sh`: FRONT_ROWS passed through and recorded.
- `training/sketch/llm_score.mjs`: `ROUTER=cutter`, `PAIR=value`.

New:
- `docs/model/micro/cutter_worlds.json`, `cutter_worlds16.json`, `cutter_worlds6.json`.
- `training/sketch/worlds_micro/GROUPS_16.json`, `GROUPS_6.json` (in a gitignored folder).
- `training/sketch/front_rows_check.py`.
- `training/sketch/ROUTER_V2.md`.

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/kinds_p80_s0` (a76b4e3), `docs/model/micro/check_w` (f2725dd), `docs/model/micro/connect_s` (68b0656), `docs/model/micro/create_w` (f2725dd), `docs/model/micro/cutter.json` (98fb038), `docs/model/micro/cutter_worlds.json` (845883d), `docs/model/micro/cutter_worlds16.json` (4626cf6), `docs/model/micro/cutter_worlds6.json` (845883d), `docs/model/micro/describe_w` (f2725dd), `docs/model/micro/disconnect_w` (f9dc7da), `docs/model/micro/facts_w` (f2725dd), `docs/model/micro/filters_w` (75ec6ae), `docs/model/micro/graph_s` (68b0656), `docs/model/micro/graph_w` (75ec6ae), `docs/model/micro/history_w` (f2725dd), `docs/model/micro/layout_w` (f2725dd), `docs/model/micro/move_s` (68b0656), `docs/model/micro/naming_w` (f2725dd), `docs/model/micro/resize_w` (f9dc7da), `docs/model/micro/set_s` (cf15a5d), `docs/model/micro/set_w` (0776f18), `docs/model/micro/superlatives_w` (5fb6f34), `docs/model/micro/targets_w` (f2725dd). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
