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

Run 2026-11-02. Event cutter: `python3 training/sketch/train_cutter.py --worlds training/sketch/worlds_micro/GROUPS_EVENTS.json --out
docs/model/micro/cutter_events.json` (35 labels B-<event>, one per GROUPS_7 event, every one with training requests, no B-fallback;
3640 messages). Composer: router cutter, registry planB7/registry_g7.json, plus `"event_cutter": "micro/cutter_events.json"` and
`"event_hint": "H1"` or `"H2"` (scratch eventhint/registry_h1.json, registry_h2.json). Sample: planA/sampleF (the fixed 1000 messages,
4858 gold requests), `PAIR=value SEG=composer node training/sketch/llm_score.mjs <9 folders>`. Without the two fields the output is
byte-identical to planB7/sampleF_g7.txt (checked after the reader change and again after the composer change).

| run | right / wrong / not done (count) | extra |
|---|---|---|
| G7 | 69.6 / 14.3 / 16.1 (3380 / 696 / 782) | 321 |
| H1 | 73.2 / 14.8 / 12.1 (3554 / 718 / 586) | 300 |
| H2 | 70.0 / 14.7 / 15.3 (3403 / 712 / 743) | 431 |

Counts (4797 units in each run):
- every unit gets a hint, and in all 4797 the hint is an event of one of the unit's candidate worlds (an event belongs to one world, so
  at most one reading per unit is read again);
- H1: 295 readings read again (all first status unknown-event), in 295 units; the unit's chosen reading changed in 238: 161 units not
  read before are now read, 6 not read before are now asked by the context filler, 71 had another world's reading and now take the
  hinted world's. Units ignored: 198 in G7, 31 in H1;
- H2: 573 readings read again (295 unknown-event, 252 ok, 26 abstain); changed 507 units (305 of them had a readable reading before).

Per action, change against G7 (right / wrong / not done; extra counted on the produced action):
- H1: set +133 / 0 / -133 (extra +12); create +9 / +3 / -12; exists +7 / 0 / -7; connect +5 / +16 / -21; count +5 / +1 / -6;
  label +3 / 0 / -3 (extra -32); list, align +3 / +1 / -4; check +1 / -1 / 0 (extra -8); the other actions move by 2 or less.
- H2: the same gains on set (+134), create, exists, reachable (+7), rule (+7), label, and losses where a readable reading is replaced:
  nearest -40 right (+42 not done), degree -27, extreme -26 (extra +41), cycle -14, path -13, toFront -11, connected -10, neighbors -6;
  extra up on extreme +41, count +23, check +21, move +18, property +12.

Root causes of the new wrongs (examples from the dumps, scratch eventhint/dump/{g7,h1,h2}_*.json and *_hint.json):
- H1, connect (+16 wrong net; 25 new wrong connect requests): verbless or unknown-verb connect units that G7 left not done ("Alpha to
  Beta", "Off to On, On to Standby, Standby to Off", "Apply -> Interview -> Offer", "Joe knows Jim", "Fn1 and Fn2 publish to Bus") are now
  read by links7 as connect, but with wrong roles: 14 put both names in `from` (from: alpha,beta, gold from: alpha, to: beta), 8 chains
  lose pairing=chain, 2 "each to the next" get the wrong order, 1 reference. The action is right; the roles read by links7 on a unit with
  no connect verb are wrong. Where: the model (links7's role reading without its verb); not measured further here.
- H1, create (+3): "a pink one called Pie above Dessert" is now create but loses the colour and gets shape circle: the known shapes7 create
  colour cause (PLAN_B.md, fix 1 / CREATE_COLOR.md), not the hint.
- H2: the event cutter's top event is often wrong where the world's own verb reading was right; the re-read forces the cutter's event:
  nearest read as extreme 37 times, degree as count 23, extreme as nearest 20, path as check 17, connected as check 16, cycle as path 15,
  toFront as move 14. Those requests go from right to not done (the produced action does not pair with the gold one) and add extra.

Verdict against the threshold (right >= 70.6, wrong <= 14.8, extra <= 353):
- H1 worked: right 73.2 (+3.6 points), wrong 14.78 (718 of 4858, +0.45 points, under the 0.5 limit by 2 requests), extra 300 (-21). The
  gain is set requests with no set verb now done (+133). The wrong margin is thin and all of it is connect roles read without a verb.
- H2 did not work: right 70.0 (+0.5, under the +1.0 needed) and extra 431 (above 353); wrong 14.7 is within the limit. Overriding a
  readable reading with the event cutter's label loses more than it gains.
