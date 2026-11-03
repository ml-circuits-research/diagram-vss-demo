# PREPROCESS_FIXES: mechanical front-end steps, decode fixes and pre-training checks (2026-11-03)

Owner, 2026-11-03 16:44: "fix what is logical in preprocessing, so we avoid needless problems". Taken as the owner's OK for the two
mechanical front-end steps P3 and P6 of `scenes_r3/ROOT_CAUSES.md` section 6, and for the decode fixes below. No new learned component.

## 1. Pre-registration (per fix: the cause, the measure, what counts as working)

Written before the measurements of sections 3-5 except the first convert_check runs on the shipped data list (list A below), which were
run while the code was written; the criteria are those of the task and were not changed after seeing numbers.

| fix | cause (ROOT_CAUSES) | how it is measured | works when |
|---|---|---|---|
| P3 `name_digit` (front.py / front.js tokenize, switch `FRONT_NAMEDIGIT=1`, recorded as front.json `mechanical.name_digit`) | VSS "new name" / name tags: "Buoy1: a tiny red circle", "Chair2, another ..." -> the first word is not a name token (section 2: new name 8 of 99 VSS misses on scenes_test, 37 on scenes_r3; 8 of 26 non-round-tripping rows of scenes_r3b) | convert_check.py ceiling, fronts learned with and without the switch, on the shipped data list (A) and on A + scenes_r3 + scenes_r3b (B); every folder and the tests short3, fresh2, scenes_test | the "every shape" share of every trained folder stays <= 1%, no folder loses more than 1 pt of round trip, and a scenes folder gains |
| P6 `number_words` (same place, `FRONT_NUMWORDS=1`, `mechanical.number_words`) | VSS count / gap words: "three", "four", "forty px" never reach a row (section 2: count lost 6 on scenes_test, 17 on scenes_r3, all oracle failures) | as P3 | as P3 |
| P6 for SOP-BERT (make_roles.py `NUM_WORDS=table`; config reader.number_words_from = "table"; neural.js decodes with the table) | SOP-BERT's learned number map is noisy ("lights" -> 2, "circles" -> 2, "duplicate" -> 2) and misses gap words ("forty px": 5 of the 7 scenes_r3b requests that do not round-trip) | roles_roundtrip.py with and without the switch, shipped data list, scenes added as ALSO_DIRS | no folder's round trip goes down by more than 1 pt, the silent wrong labels do not rise, the noisy entries leave the map |
| P5 neural.js point decode | SOP-BERT tags "150 by 90 at 700,300" as four `at` spans (no width / height tags in the shipped layout) and the decode dropped `at` silently (31 of the 36 `at` lost on the scenes) | scene harness (`scenes_r3/scene_readers.mjs`, GATES=1) on the shipped models, old code vs new: right / wrong / not done per reader (VSS, SOP-BERT, VSS-BERT, each also at its own gate) | SOP-BERT right goes up or stays, wrong does not rise by more than the right gained, and no value is dropped without a reason |
| "never drop a value silently": vss-adapter.js `at` with only x or only y; neural.js a point it cannot read | the house: "at 400, 300", x read, y margin 0.0007: the adapter dropped `at` and the create ran elsewhere | the same harness and the house example; regress.sh | such a request is held at the gates (vss-confidence.js, neural-confidence.js, combined-confidence.js) with the reason "a value was read only in part: ...", the gated precision does not go down, regress.sh unchanged except for held requests |

## 2. What was changed

**Front end (switches; a model built without them reads exactly as before).** `training/sketch/front.py` and `docs/js/front.js`:
`tokenize(text, names, mech)`; `mech` = the model's own `mechanical` field (`mech_of(F)` / `mechOf(F)`), or, while learning in Python, the
environment (`FRONT_NAMEDIGIT`, `FRONT_NUMWORDS`). `learn()` writes `mechanical` into front.json, `train_cutter.py` into the cutter json.
Every apply path passes the model's field: normalize, normalizeMessage, segment, segmentWorlds, normalizeTrace (front.js), vss-centers.js,
the composer (cutter / event cutter tokens), the context filler (`vss-context.js`: the cutter's switches, given by the composer;
`train_context.mjs` / `layer_common.mjs` use the same), and the collectors that recompute cutter scores (`vss_confidence.mjs`,
`combine/collect_pair.mjs`, `fresh2/collect_vss.mjs`, `short_bench/short_bench.mjs`). The steps are listed in `VSS_READER_SPEC.md` section 2.

**SOP-BERT number words.** `training/neural/make_roles.py` `NUM_WORDS=table`: a number written as words is aligned to a number key by the
table of front.py (a run of 1-3 words: "forty", "forty five", "forty - five", "two hundred"); the co-occurrence alignment still runs for
what the table does not read ("halve" -> 0.5, "twice" -> 2), and the table wins for its own words in `number_words`. `docs/js/neural.js`
decodes a tagged number with the table when `reader.number_words_from` is "table", else with the map (the shipped model: unchanged).

**Decode / adapter (apply to the shipped models).**
- `docs/js/neural.js` role(), kind point: every number inside the tagged `at` spans; two -> the point (as before; a single span "360,130"
  now also gives two); more than two -> the pair joined by a comma when there is exactly one; otherwise no `at` and the wire gets the
  non-enumerable field `incomplete` [{key, text}] plus a note "not sure: ...".
- `docs/js/vss-adapter.js` toNodes: `at` with only x or only y (or not two numbers) -> no `at` (as before) and the node is marked `incomplete`;
  `docs/js/vss-composer.js` keeps the mark on the resolved request (and on the unit, `u.incomplete`) and adds a note.
- Gates: `vss-confidence.js`, `neural-confidence.js` (gate) and `combined-confidence.js` (combine; reasons) hold a request whose own reading,
  or for VSS-BERT the paired VSS reading, is incomplete, at every level but "all", with the reason "a value was read only in part: ..." (the
  combined reason names the reader). docs/js/ui.js needs no change: it shows CC.reasons for held requests.

**Checks.** `training/sketch/checks/` (README): `legend_coverage.py`, `form_audit.py`; `roles_roundtrip.py` gains per-folder causes in
roundtrip.json and `ONLY_ALSO=1`. **Harness.** `scenes_r3/scene_readers.mjs` `GATES=1` adds VSS and SOP-BERT each at its own gate.
**Test.** `test_preprocess_fixes.mjs` (42 checks: the table in the three files, tokenize parity Python / JS with every switch setting, the
shipped front.json unchanged, the adapter, the neural decode with a stand-in model, the three gates).

## 3. Results: the VSS conversion ceiling (convert_check.py)

RESULTS_CONVERT

## 4. Results: SOP-BERT label round trip (roles_roundtrip.py)

RESULTS_ROUNDTRIP

## 5. Results: the decode fixes on the shipped models (scene harness, demo examples, regress.sh)

RESULTS_DECODE

## 6. What the round-3 jobs must set

RESULTS_JOBS
