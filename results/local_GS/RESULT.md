# Arm VSS-G+S, early CPU run (2026-11-02 night): the shipped VSS chain retrained on G + `llm_train/synth_rules`

Early signal only; the full GPU run repeats it with more data. Every number states model, data and set. Nothing under docs/model/micro,
docs/model/context or docs/model/neural was written (git status shows no change there). Models: `docs/model/arms/GS/`, registry
`docs/model/arms/GS/registry_GS.json`. Everything here is in `results/local_GS/`.

## What was trained (recipe of job 061, on CPU: DEVICE=cpu FAST=1 FAST_MEM_MB=256 FAST_PROCS=1, one thread, one world at a time)

EXTRA_DIRS = the six Opus folders of G + `llm_train/synth_rules`. Each world's BUILD.json records it (checked for all 7).
Rows = rows of the world's `raw/sentences.txt`, against the shipped BUILD.json (docs/model/micro/<world>).

| world | rows shipped (G) | rows G+S | wall time | synth_rules version used |
|---|---|---|---|---|
| shapes7c | 8047 | 11716 | 2320 s (38.7 min) | final, 8404 msgs, md5 f2af38ef5abc |
| position7 | 5711 | 8256 | 1161 s (19.4 min) | 8396 msgs, md5 9be4432a761a |
| questions7 | 4824 | 6387 | 656 s (10.9 min) | 8396 msgs, md5 9be4432a761a |
| links7 | 4741 | 6034 | 1526 s (25.4 min) | 8396 msgs, md5 9be4432a761a |
| graphq7 | 3406 | 4356 | 475 s (7.9 min) | final, 8404 msgs, md5 f2af38ef5abc |
| manage7 | 1295 | 2678 | 234 s (3.9 min) | final, 8404 msgs, md5 f2af38ef5abc |
| history7 | 585 | 760 | 58 s | final, 8404 msgs, md5 f2af38ef5abc |
| world cutter (SHORT=1) | | 16844 msgs | 104 s | final |
| event cutter | | | 521 s | final |
| context filler | | 11875 train msgs | 607 s | final |
| collectors (VSS-G+S, Rules, shipped VSS-G; 872 msgs each) | | | 85 s | |

Rows grew in every world (so the synth rows reached every world). Sum of the 7 worlds: 6430 s (107 min); cutters + filler: 1232 s;
trained parts in all: 7662 s (2 h 08 min). Wall clock from the first start (22:39:41) to the last collector (01:22:43): 2 h 43 min, which includes
one discarded run (below), the dry builds before it (4 min 21 s) and the gaps between steps.

**The mix of synth_rules versions.** The synth agent regenerated `synth_rules` while the run was going (23:10:35: 7822 -> 8396 messages; 00:00:
-> 8404, final). shapes7c first trained on the 7822 version (1925 s, 11529 rows); it was retrained on the final version, and the first model is kept
unused in `docs/model/arms/GS/aside/shapes7c_synth7822/`. By the coordinator's decision position7, questions7 and links7 were NOT retrained on the
final version (8396 vs 8404 messages, the final Rules fixes). Cutters, filler and the other four worlds are on the final version. Copies of both
versions: `data/synth_rules_2311/` (8396) and `data/synth_rules_final/` (8404).

## Measure

- Calibration = the fresh2 calibration part only (195 messages, CAL_OLDHELD=0); threshold = the cost-score optimum on the out-of-fold
  calibration confidences (`fresh2/fit_report.mjs`), fitted separately for the shipped VSS-G (records of docs/model/micro/registry.json) and for
  G+S (registry_GS.json). Test part = `int(sha256(id),16) % 3 != 0`. Cost score = (right - 10 x (executed wrong + extras executed)) per 100
  requested actions; asked / not done = 0. Bootstrap: 1000 resamples of test messages, seed 1, the same draws for both readers (paired).
- fresh2 test: 405 messages, 1313 requested actions. Reproduces the shipped VSS-G: 12.9 [9.2, 16.5] (FEEDBACK_RESULT.md).
- short3 test: `llm_bench/short3`, wires with a "pending" key removed (`data/short3_np_test/`), messages left with no wire dropped, test part only:
  272 messages, 350 requested actions (97 pending wires dropped; 80 messages had only pending wires). Dropping every message that has any pending wire
  instead would leave 263 messages / 341 wires (9 fewer); not run separately. Records are the same collectors, run once on fresh2 + short3.
  The threshold is NOT refitted on short3.
- "right / wrong / not done" are % of requested actions. "wrong" = executed with a wrong reading. "not done" = asked or not produced (includes
  requests below the threshold). "extras" = executed requests nobody asked for (a count). The Rules have no confidence: they execute everything.

## Table 1: at each reader's own cost-score threshold (VSS-G t = 0.8964, VSS-G+S t = 0.8982)

| situation | measure | Rules (executes all) | VSS-G (shipped) | VSS-G+S |
|---|---|---|---|---|
| fresh2 test (1313 requests) | right % | 58.2% | 15.9% | 15.2% |
| | wrong % | 18.3% | 0.2% | 0.3% |
| | not done % | 23.5% | 83.9% | 84.5% |
| | extras (count) | 273 | 1 | 0 |
| | cost score [95% CI] | -332.5 [-366.2, -296.5] | 12.9 [9.2, 16.5] | 12.1 [8.3, 15.6] |
| | paired G+S - G | | | -0.8 [-3.9, 2.4] |
| short3 test (350 requests) | right % | 54.0% | 8.3% | 9.7% |
| | wrong % | 13.4% | 1.1% | 1.1% |
| | not done % | 32.6% | 90.6% | 89.1% |
| | extras (count) | 38 | 0 | 0 |
| | cost score [95% CI] | -188.9 [-239.8, -133.2] | -3.1 [-15.2, 7.0] | -1.7 [-15.9, 8.5] |
| | paired G+S - G | | | +1.4 [-10.4, 12.9] |

(The Rules' own cost-optimal choice on the fresh2 calibration is "ask everything" = 0.0; the row above is the Rules executing everything.)
Executed: fresh2 213 (G) / 203 (G+S) requests; short3 33 / 38. AUROC of the confidence on the fresh2 test part: 0.841 (G), 0.812 (G+S).

## Table 2: no threshold, every reader executes everything it produces

| situation | measure | Rules | VSS-G (shipped) | VSS-G+S |
|---|---|---|---|---|
| fresh2 test | right % | 58.2% | 60.4% | 61.7% |
| | wrong % | 18.3% | 18.8% | 18.3% |
| | not done % | 23.5% | 20.8% | 20.0% |
| | extras (count) | 273 | 118 | 131 |
| | cost score [95% CI] | -332.5 [-366.2, -296.5] | -217.6 [-248.1, -188.4] | -220.9 [-253.8, -190.4] |
| | paired G+S - G | | | -3.3 [-24.4, 17.5] |
| short3 test | right % | 54.0% | 44.3% | 45.7% |
| | wrong % | 13.4% | 16.6% | 16.6% |
| | not done % | 32.6% | 39.1% | 37.7% |
| | extras (count) | 38 | 39 | 46 |
| | cost score [95% CI] | -188.9 [-239.8, -133.2] | -232.9 [-285.5, -181.3] | -251.4 [-303.5, -197.0] |
| | paired G+S - G | | | -18.6 [-55.4, 19.6] |

## Reading (early signal, no verdict)

- Every paired difference has an interval that contains 0: on this small run, training on synth_rules neither helps nor harms measurably on
  fresh2 or on short3, at the threshold or without one.
- Without a threshold, the learned reader gains 1.4 points of right on short3 (44.3 -> 45.7) and 1.3 on fresh2; wrong is unchanged; extras rise
  slightly (39 -> 46, 118 -> 131). The Rules still read more of short3 right than either VSS (54.0 vs 44.3 / 45.7).
- With the fresh2-fitted threshold both VSS arms execute only 10-11% of the short3 requests (33 / 38 of 350) and are almost never wrong when they
  do (4 of 33 / 4 of 38 wrong): the confidence fitted on long messages holds most short commands. The Rules read 54% of them. This gap is not
  closed by the synth data in this run. (Cause not analysed here: that needs the root-cause pass of AGENTS.md; the confidence features were
  calibrated on fresh2 only, as briefed.)
- The comparison is one seed, one run, one set of 272 messages: the intervals are wide (short3 +-12).

## Files
- Models: `docs/model/arms/GS/{micro/<7 worlds>,cutter_worlds7s.json,cutter_events.json,context/weights.json,registry_GS.json}`, logs in
  `docs/model/arms/GS/logs/`, the unused first shapes7c in `docs/model/arms/GS/aside/`.
- `results/local_GS/`: `timings.txt`, `train_<world>.log`, `cutter_*.log`, `context.log`, scripts `run_world.sh run_cutters.sh run_context.sh
  run_collect.sh paired.mjs`, `worlds.tsv`, records `records_all/` (fresh2 + short3) and `records_f2/` (fresh2 only), reports
  `report_fresh2.md` (fresh2 only, fit_report) and `report_fresh2_plus_short3.md` (short3 as a writer slice), fits `fit/*.json`, data `data/`.
- Left behind in the working tree (not mine to clean): `training/sketch/runs/micro_*_gs_*` and `training/sketch/worlds_micro/*_gs/`
  (training runs and built world data), `results/local_GS/layer_cache_GS.json` (cache of the context filler build, deletable).
