---
name: vss-microworlds
description: Discover, build and train small VSS micro-worlds for the diagram-vss-demo formalizer from the current model's failures, and wire them into the cutter + micro-world composer.
---

# Micro-worlds for the diagram-vss-demo formalizer

Repository: ml-circuits-research/diagram-vss-demo (local: /home/claude/diagram-vss-demo). Read AGENTS.md first. Talk to the owner in Romanian; write files in English. Agents never commit; the coordinator reviews and commits to main.

## The architecture this skill serves

1. **Cutter**: a small fast learned model (today the BIO perceptron of training/sketch/front.py, `FRONT_TAGGER=1`, docs/js/front.js `segment`) cuts a message into elementary units, each with at most one semantic centre (an action or a question). Units with no centre are glue.
2. **Router**: a unit goes to the micro-world of its action token; with no token or an ambiguous one (`is`), the candidate worlds read it and the best fit wins; unsure means ask the user.
3. **Micro-worlds**: small VSS worlds, one per action or per 2-3 actions with the same roles, each with its own legend (only its events), kinds and route book. A world is small enough when it fits its own data >= 90% (the big world fits 69%).
4. **Fallback**: the current big VSS model (best one in docs/model, e.g. kinds_p80_s0 / comb1_p80_s0) reads whatever no micro-world reads well, until a micro-world replaces it.
5. **Glue worlds** (later): context statements, parasitic fragments (uh, please, hedges), meta about other units (corrections, retractions, conditions), where a whole formalization is one token.
6. **Reasoning** after reading: pronouns, `$new`, verbless inheritance, asking.

## What counts (owner's rules)

- The owner is the judge. There is no hidden test set: every annotated message (training, old test sets, fresh sets, production feedback) is data. Measure on the data the worlds are trained on; if they read it well, that is the goal (worlds learn transformations, not facts).
- Per message: correct / honest (asked, or a reference left to reasoning) / wrong. Weigh "wrong" (a wrong command, or one nobody asked for) first.
- Measured fixes that use what exists need no approval; a new kind of component does.

## Loop: discover, build, train, wire

1. **Failures**: score the current composer (or the fallback model) on all annotated data with training/sketch/llm_score.mjs and training/sketch/error_analysis.mjs; group the misses by gold action and construction (lists, two verbs, verbless, etc.).
2. **Propose worlds**: from the failures and the legend (docs/js/logic.js; training/sketch/llm_train/TRAIN_MSG_SPEC.md lists the keys per action), propose micro-worlds: which events, which roles, why. Prefer one action per world; merge only actions with the same roles. Write the proposal (events, row counts) to training/sketch/worlds_micro/PROPOSAL_<date>.md.
3. **Data per world**: the annotated requests whose gold action is in the world, from all data folders (training/sketch/llm_train/*, training/sketch/llm_bench/* once they carry spans). If a world has too few rows (< ~150) or misses constructions, have a Sonnet or Haiku agent write more annotated messages for it (skill llm-annotated-data), then a label check.
4. **Build**: training/sketch/msg_to_world.py with the world's events only. The legend must be filtered to the world's events, with the current best switches (CAL_FALLBACK=train QCOLOR=1 MARKER=0, KINDMAP when available). Output to training/sketch/worlds_micro/<world>/.
5. **Train**: training/sketch/run_curve.sh or `sop train` directly, `SOP_PYTHON=/home/claude/venv/bin/python3`, D 1024, more epochs is fine for small worlds (10+). Small worlds can train in parallel: keep the sum of peak RSS under ~6 GB (check with `ps -eo rss,args | grep "sop train"`). Export sparse (`sop export-web --sparse`) to docs/model/micro/<world>/.
6. **Judge the world**: its fit on its own requests (SEG=gold) >= 90% and its "done wrong" low. If not: split it further, add data, or keep the fallback for it.
7. **Wire**: register the world in the composer's registry (docs/model/micro/registry.json: events -> model folder) so docs/js/vss-formalizer.js and llm_score.mjs (SEG=composer) route units to it; re-score the whole composer on all data; keep the world only if the composer's per-message wrong share falls and correct rises.
8. **Report** to the owner in Romanian: worlds added, their fit, the composer's numbers before / after, what is still read by the fallback.

## Agents

- Opus, effort high: composer / router / reader code. Sonnet, effort medium: world builds, trainings, scoring, error analyses, label checks, data. Haiku, effort medium: simple data and mechanical checks.
- The coordinator states model and effort, reviews every result (re-runs the key numbers), and commits (skill agent-experiments).
