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

Run 2026-11-02 here (the command above). Model: docs/model/micro/shapes7c (BUILD.json records CREATE_COLOR=role, 6334 rows).
Scored with `MODEL=micro/<w> SEG=gold node training/sketch/llm_score.mjs planB7/goldev/<event>` and error_analysis.mjs.

| event | shapes7 | shapes7c |
|---|---|---|
| create | 28.2 / 61.7 / 10.1 | 70.3 / 20.1 / 9.7 |
| set | 64.3 / 18.5 / 17.2 | 61.7 / 21.0 / 17.3 |
| resize | 65.9 / 26.4 / 7.7 | 65.6 / 26.7 / 7.7 |
| fact | 85.5 / 6.0 / 8.5 | 83.5 / 8.0 / 8.5 |
| rule | 70.6 / 1.7 / 27.8 | 70.6 / 1.7 / 27.8 |

(right / wrong / not done, % of requests.)

Verdict: **it did not work.** create right 70.3 < 75.0 and wrong 20.1 > 16.1; set -2.6 and fact -2.0 points (limit -1). resize and
rule pass. Stopped here, as pre-registered.

Root causes (error_analysis.mjs and per-request dumps):
- **The colour is fixed.** Wrong `color` in create readings: shapes7 507, shapes7c 16, create_w 29. "Role missed": 53.8% -> 2.5%.
- **create's remaining gap to create_w (fully right 70.6% vs 80.2%) was already in shapes7, hidden behind the colour** (one category
  per request, the colour came first):
  - "between A and B" reads only the first anchor (`anchor:forest` for `forest,river`): create_w 23, shapes7 62, shapes7c 71;
  - the count of a new group ("add 3 circles") is lost: create_w 1, shapes7 20, shapes7c 20;
  - no verb read (unknown-event, "a blue one named Team right of it"): 75 vs 52, the cause fix 2 (EVENT_HINT.md) addresses in the composer.
- **set and fact lose the target.** 116 set requests (17 the other way) and 20 fact requests now read the target empty
  (`target:∅≠barn`). 65 of the 116 restyle a named shape as a coloured shape, "Make the Barn a big red rectangle", "Make Actor1 a big
  blue circle": with the colour in the event role, this is now create's frame (shape, size and colour in the same roles), and the name
  is no longer read as set's target. The other 51 are plain recolours ("Set Base to red", "Recolor Hall to navy"); their cause is not
  established here.

**Also reported (no threshold): the composer.** Fixed 1000-message sample, G7 registry (planB7/registry_g7.json) with micro/shapes7c in
place of micro/shapes7 (scratch cc_comp/registry_g7c.json):

| run | right / wrong / not done | extra |
|---|---|---|
| G7 | 69.6 / 14.3 / 16.1 | 321 |
| G7 with shapes7c | 71.3 / 12.6 / 16.1 | 323 |

Per action, right: create +83, set -1, every other action unchanged. Why set loses 2.6 points on the per-event gold but only 1 request
here is not established.
