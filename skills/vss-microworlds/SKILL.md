---
name: vss-microworlds
description: Discover, build and train small VSS micro-worlds for the diagram-vss-demo formalizer from the current model's failures, and wire them into the cutter + micro-world composer.
---

# Micro-worlds for the diagram-vss-demo formalizer

Repository: ml-circuits-research/diagram-vss-demo (local: /home/claude/diagram-vss-demo). Read AGENTS.md first. Talk to the owner in Romanian; write files in English. Agents never commit; the coordinator reviews and commits to main. Round 1 (training/sketch/MICRO_ROUND1.md) is the worked example: read it before a new round.

## The architecture this skill serves

1. **Cutter**: a small fast learned model (the BIO perceptron of training/sketch/front.py, trained by training/sketch/train_cutter.py into docs/model/micro/cutter.json) cuts a message into elementary units, each with at most one semantic centre (an action or a question). Units with no centre are glue (ignored today).
2. **Router** (docs/js/vss-composer.js): a unit goes to the micro-world of its action token; with no token or an ambiguous one, the candidate worlds read it and the best fit wins (status, content placed, ok before abstain); a tie between worlds goes to the world listed first in the registry; still unsure means ask.
3. **Micro-worlds**: small VSS worlds, one per action or per 2-4 actions with the same roles, each with its own legend (only its events), kinds and route book, in docs/model/micro/<world>/. Registered in docs/model/micro/registry.json.
4. **Fallback**: the big VSS model (registry "fallback", today kinds_p80_s0) reads the units of every action that has no registered world.
5. **Glue worlds** (later): context statements, parasitic fragments, meta about other units, where a whole formalization is one token.
6. **Reasoning** after reading: pronouns, `$new`, verbless inheritance, asking.

## What counts (owner's rules)

- The owner is the judge. There is no hidden test set: every annotated message is data. Measure on the data the worlds are trained on; reading it well is the goal.
- Per message: right / honest (asked, or left to reasoning) / wrong; per request: correct / not done / done wrong, plus extra wires (commands nobody asked for). Weigh "wrong" first.
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
4. **Train**: `SOP_PYTHON=/home/claude/venv/bin/python3 DATA=spans bash training/sketch/train_micro.sh <world> <events>`. Times measured on the 8 GB machine with 2 trainings at once: ~700 rows 30 min, ~2400 rows 1 h, ~3000 rows 1.5-2 h, plus up to 1.5 h of silent evaluation after training for the largest. At most 2 trainings at once (peak RSS ~1.5 GB each plus the system). Watch with `ps -eo rss,args | grep "sop train" | grep -v grep` (never `pgrep -f`, it matches itself). Write one line per finished step to a STATUS file: the container can restart and kill everything.
5. **Judge the world on its own rows** against the fallback on the same rows: keep it as a candidate when done wrong is not higher and correct is higher. 90% fit is the goal, not a gate (round 1: only superlatives 96.6 and history 95.3 reached it; most worlds were 60-88% and still beat the fallback, e.g. graph 88.3 vs 42.7).
6. **Wire, greedy**: order the candidates by their gain over the fallback (done wrong first, then correct); add one at a time to a scratch registry and score the composer on all data. Keep a world when per-message wrong falls (or stays equal with right rising) AND per-request done wrong does not rise AND per-request correct does not fall by more than ~0.5 point; when the criteria disagree, write both rows down and let the coordinator decide (round 1: `check` cut 10 wrong messages only through fewer extras and cost 35 right ones; the coordinator left it out). A world that looks neutral alone can help with others: after the pass, retry the dropped ones once. Then write the final registry.
7. **Report** to the owner in Romanian: worlds added, fit vs fallback, the greedy table, the composer before / after (per message and per request, ALL and per data folder), units still read by the fallback, ignored and asked units, and the hand-written rules on the same data for comparison.

## Known traps

- **The shared micro front end**: every world's front.json is learned from all data (DATA), not from the world's rows. A trigger rule can lose precision on more data and disappear: round 1, `is` before a name -> `is_q` (check) has precision 0.23 on 3640 messages (also in connected / path / extreme spans) and is dropped by the 0.6 filter, so the check world reads 30% of its rows as unknown-event. Check the reader status counts of every world (error_analysis.mjs "reader status"); unknown-event above ~10% points to the front end, not the world.
- Split worlds (connect_single / lists / chain) fit better alone but did not help the composer (more units misrouted): measure the composer, not only the fit.
- The per-message numbers move little per world (a message has ~5 requests); the biggest gains come from the most frequent actions (connect: wrong 983 -> 858 messages of 1531).
- Long messages (dev_new/long, 10-20 sentences) stay 0% fully right per message: report them per request.

## Agents

- Opus, effort high: composer / router / reader code. Sonnet, effort medium: world builds, trainings, scoring, error analyses, label checks, data. Haiku, effort medium: simple data and mechanical checks.
- The coordinator states model and effort, reviews every result (re-runs the key numbers), and commits (skills/agent-experiments in this repository).
