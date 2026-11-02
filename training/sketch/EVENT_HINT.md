# Fix 2 for fewer worlds: the cutter tells a world which action, when the world cannot (pre-registered 2026-11-02, before the run)

**Owner's decision (2026-11-02):** variant (a). Variant (b), the reader learning the action from the construction, is in
`future-experiments.md` at the repository root.

**Why.** In a world with several actions, the VSS reader decides the action only from a verb lemma (reader.js `read`: the predicate is
the best of the world's verb lemmas; `hasVerb` false -> status `unknown-event`). A one-action world needs no verb (no predicate role).
With 16 worlds the cutter's world label was the action; with 7 worlds it names only the world. Measured in shapes7 (PLAN_B.md):
- verbless set requests ("Post blue", "Closed yellow"): unknown-event 15.2% of set requests vs 5.5% in set_w;
- rule read as set ("every circle should be blue": "should be" is a set trigger in the data too): wrong action 23.9% vs 7.8%.

**The change.**
1. An EVENT CUTTER: `train_cutter.py --worlds worlds_micro/GROUPS_EVENTS.json --out docs/model/micro/cutter_events.json`, a grouping with
   one world per legend event (B-<event> labels). Same features, trainer and epochs as every cutter (the design of action_confusion.py).
2. The composer (router "cutter") reads the event cutter's top B-<event> label at each unit's first token: the unit's EVENT HINT.
3. A world reads the unit as today. Then, only if the hint is one of that world's events:
   - **H1 (the change measured):** if the reading's status is `unknown-event`, the world reads the unit again with the event given
     (reader.js `read` with `opts.event`: the predicate's candidates are that event's verb lemmas, and the verb check is met by the hint).
   - **H2 (measured and reported apart, same threshold):** also when the reading is readable but its event differs from the hint.
4. Off by default: registry field `"event_cutter"` (absent = today's composer). JS only: the hint exists only in the composer.

**Measure.** The composer on the fixed 1000-message sample (planA/sample1000_ids.txt, 4858 gold requests, PAIR=value, SEG=composer),
per request right / wrong / not done and extra; same registry as G7 (planB7/registry_g7.json: cutter_worlds7, micro/<world>7), plus the
event cutter. Also: how many units got a hint, how many readings it changed, and per action the change in right and wrong.

**Baseline.** G7: 69.6 / 14.3 / 16.1, extra 321.

**Threshold: "it worked"** (each of H1 and H2):
- right at least 1.0 point above G7 (>= 70.6), and
- wrong at most 0.5 points above G7 (<= 14.8), and extra at most 10% above (<= 353).

**If it misses.** Stop and report.

Fix 1 (CREATE_COLOR.md, shapes7c) is measured on its own first; the two are combined only after each has its own result.

## Result
