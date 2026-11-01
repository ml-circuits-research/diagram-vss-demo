---
name: vss-microworlds
description: Discover, build and train small VSS micro-worlds for the diagram-vss-demo formalizer from the current model's failures, and wire them into the cutter + micro-world composer.
---

# Micro-worlds for the diagram-vss-demo formalizer

Repository: ml-circuits-research/diagram-vss-demo (local: /home/claude/diagram-vss-demo). Read AGENTS.md first. Talk to the owner in Romanian; write files in English. Agents never commit; the coordinator reviews and commits to main. Round 1 (training/sketch/MICRO_ROUND1.md) is the worked example: read it before a new round.

## The architecture this skill serves

1. **Cutter**: a small fast learned model (the BIO perceptron of training/sketch/front.py, trained by training/sketch/train_cutter.py into docs/model/micro/cutter.json) cuts a message into elementary units, each with at most one semantic centre (an action or a question). Units with no centre are glue (ignored today).
2. **Router** (docs/js/vss-composer.js): CandidateRouter is the default since 2026-11-01 (registry `"router": "cutter"`). The cutter, trained with the world labels of the grouping, proposes the top 3 worlds. Each one reads the unit, and the reading with the fewest words not understood wins. Ties and reference gaps go to the context filler (docs/js/vss-context.js). The world ids in the registry must be those of the cutter's grouping. TokenRouter (sends a unit to the world of its action token) stays only as a comparison: `ROUTER=token`.
3. **Micro-worlds**: small VSS worlds, one per action or per 2-4 actions with the same roles, each with its own legend (only its events), kinds and route book, in docs/model/micro/<world>/. Registered in docs/model/micro/registry.json.
4. **Fallback**: the big VSS model (registry "fallback", today kinds_p80_s0) reads the units of every action that has no registered world.
5. **Glue worlds** (later): context statements, parasitic fragments, meta about other units, where a whole formalization is one token.
6. **Reasoning** after reading: pronouns, `$new`, verbless inheritance, asking.

## Names of the variants (owner, 2026-11-01: name each by the difference that defines it, never "today's" or "new")

A composer variant is named by three choices, written Router·Front·Grouping:
- **Router.** `TokenRouter` sends a unit to the world of its action token, using the shared front end (llm_score ROUTER=token).
  `CandidateRouter` lets the cutter propose its top 3 worlds; each one reads the unit, and the reading with the fewest words not
  understood wins (ROUTER=cutter).
- **Front.** `SharedFront`: each world's verbs and values are learned from all the data. `OwnFront`: they are learned from the
  world's own rows only (FRONT_ROWS=world).
- **Grouping.** The groups file used: `G16` (one world per action or small family), `G6` (by roles), `G7` (by measured confusion,
  action_confusion.py).

Plan A's three runs are TokenRouter·SharedFront·G16, CandidateRouter·SharedFront·G16 and CandidateRouter·OwnFront·G16.
Plan B is CandidateRouter·OwnFront·G7.

## What counts (owner's rules)

- The owner is the judge. There is no hidden test set: every annotated message is data. Measure on the data the worlds are trained on; reading it well is the goal.
- The measure is per requested action only: done right / done wrong / not done, plus extra (actions nobody requested). Weigh "done wrong" and "extra" first. No per-message scores (owner, 2026-11-01). The cutter is measured by the errors it causes (training/sketch/composer_errors.mjs), not by span F1.
- Measured fixes that use what exists need no approval; a new kind of component does.

## Tools (training/sketch)

- `train_micro.sh <world> <event,...>`: build (msg_to_world.py WORLD_EVENTS), train, export sparse to docs/model/micro/<world>/ with BUILD.json. Use `DATA=spans` (every annotated folder with spans, 4640 messages; round 1 used `DATA=everything`, 3640, without the two spans sets). `ROW_SHAPE=single|lists|chain` splits connect by construction.
- `micro_tools.py gold <world> --out DIR`: the world's gold requests from all data folders. `micro_tools.py registry w1,w2 --out F [--cutter micro/x.json]`: a scratch registry. `micro_tools.py dirs`: the data folders.
- Fit of a world: `MODEL=micro/<w> SEG=gold node llm_score.mjs DIR` and the same with `MODEL=kinds_p80_s0` (the fallback on the same rows). Error analysis: `MODEL=micro/<w> node error_analysis.mjs DIR --examples 4`.
- Composer: `REGISTRY=F SEG=composer node llm_score.mjs $(python3 micro_tools.py dirs)`; read the ALL lines and the "composer units" line (units per world, asked, ignored).

## Loop: discover, build, train, wire

1. **Failures**: score the current composer on all data; error_analysis.mjs on the misses; group them by gold action and construction.
2. **Propose worlds** in training/sketch/worlds_micro/PROPOSAL_<date>.md: events, roles, row counts (from `micro_tools.py gold`), why. One action per world; merge only actions with the same roles.
3. **Data**: a world with fewer than ~150 rows or missing constructions gets more annotated messages (skills/llm-annotated-data in this repository), then a label check.
4. **Train**: `SOP_PYTHON=/home/claude/venv/bin/python3 DATA=spans bash training/sketch/train_micro.sh <world> <events>`. Times measured on the 8 GB machine with 2 trainings at once: ~700 rows 30 min, ~2400 rows 1 h, set_s (4188 rows) 1 h 43 min + ~40 min of silent evaluation, connect_s (3427 rows) 2 h 25 min + ~3 h of silent evaluation before export: connect rows are the slow ones. The only completion signal is docs/model/micro/<world>/BUILD.json; wait for it with a foreground `timeout 590 bash -c 'until [ -f .../BUILD.json ]; do sleep 30; done'` repeated (a background wait loop is killed at the tool's time limit and looks like a failure). At most 2 trainings at once (peak RSS ~1.5 GB each plus the system). Watch with `ps -eo rss,args | grep "sop train" | grep -v grep` (never `pgrep -f`, it matches itself). Write one line per finished step to a STATUS file: the container can restart and kill everything.
5. **Judge the world on its own rows** against the fallback on the same rows: keep it as a candidate when done wrong is not higher and correct is higher. 90% fit is the goal, not a gate (round 1: only superlatives 96.6 and history 95.3 reached it; most worlds were 60-88% and still beat the fallback, e.g. graph 88.3 vs 42.7).
6. **Wire, greedy**: order the candidates by their gain over the fallback (done wrong first, then correct); add one at a time to a scratch registry and score the composer on all data. Keep a world when done wrong + extra falls and done right does not fall by more than ~0.5 point; when the criteria disagree, write both rows down and let the coordinator decide (round 1: `check` cut 31 extras and cost 1.6 points of done right; the coordinator left it out). A world that looks neutral alone can help with others: after the pass, retry the dropped ones once. A neutral world (no change) is not registered: fewer worlds is better at equal numbers. Then write the final registry.
   Record the code and data version (git commit) of every composer run: a data fix or a scorer change during a round moves the base, which must then be re-run.
7. **Report** to the owner in Romanian: worlds added, fit vs fallback, the greedy table, the composer before / after (per requested action: right / wrong / not done, extra; ALL and per data folder), units still read by the fallback, ignored and asked units, and the hand-written rules on the same data for comparison.

## Known traps

- **The shared micro front end**: every world's front.json is learned from all data (DATA), not from the world's rows. A trigger rule can lose precision on more data and disappear: round 1, `is` before a name -> `is_q` (check) has precision 0.23 on 3640 messages (also in connected / path / extreme spans) and is dropped by the 0.6 filter, so the check world reads 30% of its rows as unknown-event. Check the reader status counts of every world (error_analysis.mjs "reader status"); unknown-event above ~10% points to the front end, not the world.
- **The 6 h wall-clock guard** (VSA_MAX_HOURS, default 6) counts training plus the silent evaluation and saves no checkpoint: Plan A's connect_w trained 3.77 h and was killed during the evaluation, after the route book was written and before the export, so it was lost. Set `VSA_MAX_HOURS=12` for any world above ~2500 rows of connect or ~4000 rows of anything else.
- Split worlds (connect_single / lists / chain) fit better alone but did not help the composer (more units misrouted): measure the composer, not only the fit.
- The biggest gains come from the most frequent actions (round 1: connect cut done wrong from 17.8% to 14.5% of requests).

## Agents

- Opus, effort high: composer / router / reader code. Sonnet, effort medium: world builds, trainings, scoring, error analyses, label checks, data. Haiku, effort medium: simple data and mechanical checks.
- The coordinator states model and effort, reviews every result (re-runs the key numbers), and commits (skills/agent-experiments in this repository).
