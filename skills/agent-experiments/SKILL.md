---
name: agent-experiments
description: Coordinate measured improvement work with sub-agents: root cause first, one change per measurement, brief agents tightly, re-check their numbers, commit only reviewed results, report plainly to the owner.
---

# Coordinating experiments with agents

For long improvement sessions where a coordinator supervises several agents (Opus for model / reader / architecture code and independent reviews, effort high; Sonnet for pipelines, trainings, evaluations, analyses, label checks and data, effort medium; Haiku for simple data and mechanical checks, effort medium).

## Coordinator duties

- **Root cause before changes.** After every evaluation, classify the misses by the first cause that explains them, with counts and examples, and say where each cause sits (data, front end, our code, calibration, model). Decide from the causes, not from the totals.
- **One change per measurement**, behind a switch whose default is byte-identical (prove it: same outputs, same files). State the hypothesis, the measure and the threshold before running when the decision matters; small measured fixes of our own code need no ceremony.
- **Know the noise.** Before calling a 1-2 point difference a result, measure the spread over seeds.
- **Measure what the user gets**: per message, correct / honest (asked, or left to reasoning) / wrong; weigh wrong first.
- **Brief each agent like a peer**: the goal, what is already known and ruled out, the exact files and commands, what it must not touch (files another agent is editing, the training slot, other repositories), "do not commit; report the files changed", and the format of the final message.
- **One heavy job at a time** on a small machine: tell agents how to check (`ps -eo rss,args | grep "sop train" | grep -v grep`) and give them the slot explicitly. Agents that work on the same files go in separate git worktrees.
- **Verify before reporting**: re-run the key numbers yourself, read the diff, check texts / labels / defaults by script. Agents' reports can be wrong or incomplete (seen: silent text edits, a quota invented by the agent, a shared dev file overwritten).
- **Commit yourself**, only reviewed results, with the numbers in the message; negative results are committed too, as negative results.
- **Talk to the owner plainly**, in their language: what was measured, what it means, what is next; no inflated words, no guessing; when unsure, say so and how to find out. Ask only for decisions that are really theirs (a new kind of component, a change of goal); do what they proposed without asking again.

## Traps seen

- Thresholds chosen without knowing the noise, then pass/fail on 0.5-point differences.
- Picking the best of ~20 variants on one dev file and reporting that number as the expected gain (it shrank from +7.7 to +1.2 on fresh data).
- A metric that is a proxy (keys matching labels) instead of the outcome (what the editor draws).
- Waiter loops whose `pgrep -f` pattern matches their own command line.
- `cmd | head` under `set -o pipefail` killing the producer.
