---
name: vss-world-design
description: DRAFT. Decide the granularity of VSS micro-worlds (which actions share a world) and prepare the training data of each world, from measured criteria; for diagram-vss-demo and any other macro-world.
---

# Designing VSS worlds: granularity and data (DRAFT, 2026-11-01)

The owner's goal: a recipe that says how big a world should be and how to prepare its data, reusable for new domains. This
draft separates what is measured from what is still a hypothesis. Plan A (training/sketch/PLAN_A.md) and Plan B (PLAN_B.md, 6 worlds)
are the measurements that will turn the hypotheses into rules or drop them. Use with skills/vss-microworlds (the build loop).

## Measured (diagram-vss-demo)

1. **A world learns its words only from its own rows.** If verbs and values are learned from all the data and shared by every world,
   the world loses rules. Example: the 0.6 precision filter dropped `is` -> is_q, so check read 30% of its rows as unknown-event.
   With its own front (FRONT_ROWS=world), set went from 65.8 to 76.5% right, and its unknown-event share from 17.9 to 5.5%
   (4056 requests, commit 0776f18). Done wrong rose 1.5 points.
2. **No equivalence between phrases and actions before the router.** The global TriggerMapper caused 1148 actions mapped to
   another action, plus 1372 verbs not recognised (COMPOSER_ERRORS.md). The router sends a unit to the world where it fits
   best, and nothing else.
3. **Split by meaning, not by construction.** connect_single / lists / chain each fit better alone. In the composer they misrouted
   more units, and the composer got worse (MICRO_ROUND1.md).
4. **A world must pay for itself in the composer.** superlatives fits 96.6% vs 93.5% for the fallback, but in the composer it
   changed one message. check cut 31 extras and lost 35 right messages. A world that is neutral in the composer is not kept.
5. **More data does not fix a wrong front end.** Round 2 (DATA=spans) made connect_s worse (+55 wrong messages) with the shared
   front (MICRO_ROUND2.md).
6. **Labels must agree at the borders between worlds.** "X is VALUE" was labelled set in one data set and fact in the others
   (146 cases, LABEL_FIXES_SPANS.md). A border case labelled two ways cannot be learned by the cutter or by either world.
7. **Cost grows with rows; connect rows are the slowest.** connect_s: 3427 rows, 2 h 25 min of training. The trainer's own
   evaluation adds hours and changes nothing in the model: N_EVAL=150 EVAL_MODES=primary for big worlds.

8. **Which actions get mixed up is measurable and concentrated.** Tool: `python3 action_confusion.py --groups <files>`. It is the
   cutter perceptron with one label per event, scored on a 20% test split. Of 4685 gold requests, 516 were confused, and a few
   pairs carry most of them: extreme/nearest 74, check/connected 30, move/set 23, resize/set 22, count/degree 21, cycle/path 17.
   Share of the confusions that fall inside one world: GROUPS_16 20.0%, GROUPS_6 (by roles) 46.9%, GROUPS_7 (by confusion) 64.5%.
   The data contradicts grouping by roles in two places:
   - check, cycle and exists are questions about the graph, like path and connected;
   - toFront and toBack get mixed up with move.

## Hypotheses (being measured)

- **Merge actions that the cutter confuses** (GROUPS_7, Plan B). The world then chooses between them with the whole unit in view,
  and router ties between worlds become fewer. Plan A, variant 3: 450 units were decided by registry order.
- Grouping by roles alone (GROUPS_6) was replaced by GROUPS_7 before training, on measurement 8.
- **Split again only where a rare action loses.** For each action inside a merged world, compare done right / done wrong with its
  own small world (e.g. disconnect inside links6 vs disconnect_w, 169 rows vs ~3400 connect rows). If it loses, first check its
  data (too few rows, labels that disagree), then the split.
- **Operator worlds** (set, move) may act on abstract representations: the key is taken from the value's learned kind, not from the
  words. They would need different data (values held out) and a different preparation. Not tested.
- **Fewer words per world.** Keep the identity of a word, train only on its kind. Vocabulary is ~550-2700 words per world today.
  Not tested: hold out "purple" or "hexagon" at training, then measure.

## Procedure (current)

1. Start from groups by meaning, not from one world per action. Run `action_confusion.py` on the annotated data and group the
   pairs that are confused often. Leave the big commands apart while their confusion is under ~3% of their requests.
2. Per world: gold rows (`micro_tools.py gold`). Check the border labels with the neighbouring worlds by script. Fix the labels
   (skills/llm-annotated-data); never edit the texts. Add data where an action has under ~150 rows.
3. Train with its own front (DATA=spans FRONT_ROWS=world). Big worlds: VSA_MAX_HOURS=16, N_EVAL=150 EVAL_MODES=primary.
4. Measure per action inside the world, against its small world and against the fallback. Then the composer on a fixed sample of
   1000 messages (seed 0) before the full data. Count per request: right / wrong / not done, plus extra.
5. Keep the grouping with the fewest worlds that loses no action (done wrong first).
