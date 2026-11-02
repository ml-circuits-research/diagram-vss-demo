# CONTEXT_FILLER.md: the context filler retrained on the current composer (2026-11-02)

Review 2026-11-02 (`review_concepts.md`), items 1 and 7. Metric: per gold request, right / wrong / not done (%), + extra; "asks" = units
the filler asked about (not executed); "ties by order" = units whose tied readings the filler could not separate.

## 1. What was broken

- `train_context.mjs` could not run. Its data builder (`layer_common.mjs build()`) loaded the composer without the event cutter (it
  threw), cut with the plain B/I/O decoder on a B-<world> cutter, and called `comp.route()`, removed with the token router.
- So `docs/model/context/weights.json` was frozen: trained 2026-11-01 on the readings of the 15-world composer (`kinds_p80_s0`
  fallback, `micro/cutter.json`), a system that no longer exists. `registry_r2.json` reused it.
- Hand-written lists in `docs/js/vss-context.js`: `ENTITY_KEYS = [target, from, to, anchor]` (no `anchor2`), `ENTITY_ROLES` (no
  `landmark3`), `SHAPE_WORDS`, `PROPERTY_VERBS` (copies of the adapter's tables), and the feature list `role_target ... role_anchor`.
  - Consequence: with the round-2 worlds a pronoun in `landmark3` was not marked `@it`; the adapter dropped it silently and no gap
    was raised.
- No working root-cause tool for the composer on whole messages: `composer_errors.mjs` and `words_not_understood.mjs` called
  `comp.route` / `comp.fallback`; `layer_score.mjs` went through the broken builder; `gate_export.mjs` read the removed fallback model.

## 2. The fix

- **Entity roles and keys come from the registry, not from lists** (`vss-context.js`):
  - `rawNodes`: an entity role is a role whose filler is an entity, i.e. an entity wire of the reader (`readingFromWires` gives it as
    an object or a list). There is no role list.
  - `entitySpec(worlds)`: the entity keys are the SOP args the adapter writes from the entity roles of the registry's worlds.
    - The roles: the schema roles with `main` "entity", learned from the annotated data.
    - The keys are found by running `toNodes` on probe readings of every legend event: entity roles hold probe names; word roles
      take each of their lexicon values, one at a time and all together.
    - Default registry: `target, anchor, from, to`. `registry_r2.json`: `target, anchor, anchor2, from, to`, with roles incl. `landmark3`.
  - The composer computes it once on load and adds it to the filler's model. `Context`, `deriveNeeds` and `missingRoles` take the
    keys from there. `featureNames(keys)` makes `role_<key>` per key.
  - `SHAPE_WORDS` / `PROPERTY_VERBS` are now the adapter's own exported `SHAPES` / `PROPERTY`.
  - Checked: the default registry with the old weights gives byte-identical `llm_score` output on the sample (77.2 / 11.4 / 11.4 +334,
    asks 188, ties by order 310).
- **Training path rebuilt on the composer as the demo runs it** (`layer_common.mjs build()`):
  - `loadRegistry` + `comp.formalize(text, {names, last: []}, {update: scorerUpdate})`: world cutter, event cutter, the registry's
    worlds, no fallback, no `route`.
  - The composer now exposes each unit's raw nodes as `unit.raw` (not enumerable, so dumps are unchanged).
  - Every unit that gave a request (zone read or ask) is a training unit.
  - Ties in that pass are decided by the registry's current filler (one pass, fixed beforehand).
  - `REGISTRY=<file>` selects the registry; the cache has one file per registry.
- **Same data and protocol as the original (LAYERS.md part B):**
  - the 9 folders of `micro_tools.py dirs`, 4640 messages;
  - 80/20 split by FNV hash of the id (3697 / 943);
  - mention ranking with teacher forcing;
  - conditional logit, L2 1e-3, Adam, 600 steps.
  - Written margin: 0 (the owner's choice for drawing). The pre-registered 95% rule is recorded as `margin_rule_95`: 2.75 for the
    default registry, 3 for r2.
- **One weights file per registry:**
  - `docs/model/context/weights.json` for `registry.json`;
  - `docs/model/context/weights_r2.json` for `registry_r2.json` (its `"context"` now points there);
  - `stamp_models.py` was run.

Training (teacher-forced, at margin 0):

| | gap instances train / test | test: right fills / wrong fills / asked |
|---|---|---|
| old file (LAYERS.md, 15-world composer) | 1254 / 327 | 172 / 57 / 98 |
| new, default registry | 1970 / 469 | 263 (78.0%) / 74 / 132 |
| new, registry_r2 | 1721 / 406 | 222 (76.8%) / 67 / 117 |

Known limits of the training data:
- The 9 folders hold no group / ungroup / members / groupOf requests, so `needs` still covers 36 actions.
- They hold no `anchor2`, so `role_anchor2` has weight 0.
- The ops data (`llm_train/ops_*`) was not added, to keep the original protocol. Adding it is the next step if the round-2 worlds are adopted.

## 3. Numbers (1000-message sample, 4858 requests; short sets = the six template sets, 1140 requests, plus llm_short 3000)

| registry / weights | sample right / wrong / not done | extra | asks | ties by order | short six sets | llm_short |
|---|---|---|---|---|---|---|
| default, old weights | 77.2 / 11.4 / 11.4 (3751 / 552 / 555) | 334 | 188 | 310 | 61.1 / 11.1 / 27.7 +53 | 65.2 / 9.5 / 25.3 +410 |
| default, **new** weights | 77.1 / 11.0 / 11.9 (3747 / 534 / 577) | 315 | 229 | 260 | 61.1 / 11.0 / 27.9 +53 | 65.4 / 9.4 / 25.3 +409 |
| r2, old weights | 75.3 / 11.1 / 13.7 | 403 | 252 | 522 | 62.5 / 11.0 / 26.6 +81 | 75.7 / 7.6 / 16.6 +282 |
| r2, **new** weights_r2 | 75.1 / 10.8 / 14.1 | 373 | 302 | 490 | not measured (killed twice by memory) | not measured |

Notes:
- The short run of r2 with the new weights was killed twice by the memory limit of the shared machine; it is still to run.
- "r2, old weights" is with the entity-key fix (`landmark3`, `anchor2`). Before the fix it was 75.3 / 11.1 / 13.6 +402.
- Commands:
  - sample: `PAIR=value SEG=composer [REGISTRY=..] [CONTEXT=..] node llm_score.mjs <sampleF/*>`;
  - short sets: `short_bench.mjs` with a registry copy whose `context` is the weights file;
  - root causes: `composer_errors.mjs`, which reproduces llm_score's totals exactly.

What the new weights do:
- **Default registry:**
  - Done wrong goes down by 18 requests (552 -> 534) and extras by 19. Right goes down by 4.
  - The filler asks 41 more units. Root causes (default, old -> new):
    - "filler filled wrong": 85 -> 70;
    - "filler asked": 127 -> 151.
  - Ties decided by order fall from 310 to 260; the context decides more of them.
- **registry_r2:** the same direction. Wrong 11.1 -> 10.8, extras 403 -> 373, right -0.2, asks +50.
- The new weights put a higher weight on NULL ("nobody in the context"): 1.47 against 0.92 before.

**Adopted:** both new files, because wrong falls and nothing rises in wrong.
- Under the owner's metric of 2026-11-02 (precision of execution first), fewer wrong fills for more asks is the intended direction.
- The filler's ranking is not tuned toward filling. Whether a fill is executed will be decided by the confidence gate
  (VSS_CONFIDENCE.md), not by this margin.
- The old file is `git show HEAD:docs/model/context/weights.json`.

## 4. The root-cause tool (`composer_errors.mjs`, review item 7)

- Usage: `[REGISTRY=<file>] [CONTEXT=<file>] node composer_errors.mjs <dir ...> [--examples N] [--json out.json]`. Any registry works.
- It runs `comp.formalize` exactly as llm_score does and scores with the same canon and the same `pairValue`.
- Each request not right gets the first stage that explains it. The stages:
  - cut: lost, trigger outside every unit, merged, cut short;
  - world / event: not a candidate, unknown-event, another event, another world won (by words / tie by context / tie by order), ignored;
  - filler asked, by gap kind;
  - pairing;
  - keys: filler filled wrong / dropped, adapter, roles (wrong role / not placed / more values / order), front end, description.
- Extras are classified too.

Default registry, old weights, sample (1107 misses):

| stage | requests | of the misses | done wrong | not done |
|---|---|---|---|---|
| cut | 312 | 28.2% | 90 | 222 |
| world / event | 197 | 17.8% | 3 | 194 |
| filler asked | 127 | 11.5% | 10 | 117 |
| pairing | 22 | 2.0% | 0 | 22 |
| keys | 449 | 40.6% | 449 | 0 |

- Largest single causes:
  - front end: the value is not a token of the unit (155);
  - cut lost (146);
  - cut short (100);
  - the filler filled an empty or pronoun key wrong (81);
  - the gold world read another event (84).
- Extras:
  - the gold request of the unit is done with another action: 178;
  - text outside every request: 106;
  - a second request from one gold request: 50.

Deleted: `words_not_understood.mjs`, `layer_score.mjs`, `gate_export.mjs`. They could not be repaired cheaply and nothing that runs
needs them. `gate_probe.py` and `cutter_worlds_probe.py` read `gate_export.mjs` output and stay without an input. `wnu_stats.py` read
`words_not_understood.mjs` output. `layer_common.mjs` keeps `pairValue`, which `llm_score.mjs PAIR=value` uses.

## 5. Not done: one reference layer for all readers (review item 12)

The filler works on SOP args, not on VSS internals. Its input per request is:
- the main node, whose entity keys hold a name, `@it` / `@them`, a mention, or nothing;
- the request's span;
- the message text and the canvas names.

So it can sit after every reader:
- **Each reader hands over that form.** VSS already does (`rawNodes`). The Neural reader would emit `@it` / `@them` or an empty key
  instead of resolving `fill: context` with `NEXT_CONTEXT`. The Rules would emit the same instead of `ctx.last`.
- **One loop resolves the references.** It runs `Context.step(raw, c0, c1)` on the requests in text order, fills or asks, and carries
  the created names (`nextContext`).
- **What stays shared:** the entity keys (`entitySpec`, or the legend's names-kind questions for the readers that already write SOP
  args) and the needs (learned from gold).
- **The weights:** the gaps each reader leaves differ, so `train_context.mjs` would build its instances from each reader's output. Two
  options to measure: one weights file per reader, or one on the pooled instances.
- **What stays VSS-only:** `chooseReading` (ties between worlds).
- **How to measure:** per reader, right / wrong / not done before and after removing its own resolution code.
