# Fix 1 for fewer worlds: the colour of a new shape in the same place as every other colour (pre-registered 2026-11-02, before the run)

**Why.** The owner (2026-11-02) prefers fewer worlds and wants the causes of the G7 losses fixed. On the fixed 1000-message sample, G7 has
155 fewer right requests than G16 with the _w worlds (3380 vs 3535). create (-95) and set (-94) explain more than all of it: the other
five 7-worlds together are ahead (degree +21, move +16, path +13, extreme +11, ...).

**Cause measured (PLAN_B.md, error_analysis.mjs).** llm_to_world.py writes the colour of a new shape as the attribute of the shape word
(`object.attr=teal`), but a colour set on a shape (set, fact, rule) as the event role `color`. Size is already the event role `size` in
create rows. In shapes7, COLOR tokens are read into the event role, which create's legend does not have, so the colour is dropped:
"role missed" in 53.8% of the create requests (create_w 2.0%), create right 28.2 vs 80.0.

**One change.** `CREATE_COLOR=role` (llm_to_world.py, off by default, recorded in BUILD.json): the colour of a new shape fills the event
role `color`. Rows are the same (6334, same sentences, checked by a dry build); create's legend gains the role `color`.
docs/js/vss-adapter.js already reads both forms (`obj.attr`, then `R.color`). Everything else as shapes7.

```
CREATE_COLOR=role SOP_PYTHON=/home/claude/venv/bin/python3 DATA=spans FRONT_ROWS=world N_EVAL=150 EVAL_MODES=primary VSA_MAX_HOURS=16 \
  bash training/sketch/train_micro.sh shapes7c create,set,resize,fact,rule
```

**Measure.** Per event on the gold set (the per-event gold files of PLAN_B.md, `MODEL=micro/shapes7c SEG=gold node llm_score.mjs`),
per request right / wrong / not done, plus error_analysis.mjs for the causes.

**Threshold: "it worked".**
- create in shapes7c: right >= 75.0 and wrong <= 16.1 (create_w: 80.0 / 14.1; at most 5 points below, 2 points above).
- set, resize, fact, rule in shapes7c: right at most 1 point below shapes7 (64.3, 65.9, 85.5, 70.6).

**Expected, not fixed by this change.** set's verbless requests ("Post blue": no verb, so `unknown-event` in a world with several
events) and rule read as set ("every circle should be blue"). Both are about how the action is decided, not about the data; they are
reported separately.

**Also reported (no threshold).** The composer on the fixed sample with G7 and shapes7c in place of shapes7.

**If it misses.** Stop and report.

## Result
