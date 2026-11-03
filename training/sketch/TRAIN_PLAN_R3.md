# TRAIN_PLAN_R3: round 3 of VSS and SOP-BERT (rewritten 2026-11-03)

Round 3 has two arms, measured one after the other, one change each:

- **Arm R3** (section A): the shipped arm ALL (TRAIN_PLAN_1103.md, jobs 070 / 071) retrained with the round-3 data (P1 of
  `scenes_r3/ROOT_CAUSES.md` section 6) and two converter switches, `GAP_ROLE=1` (P2) and `NEW_DISTINCT=1`. Measured against arm ALL.
- **Arm R3C** (section B): arm R3 + `VSA_CORR=phase` (the learned world-level correction phase vector), nothing else. Measured against R3.
  It replaces the first draft of this plan, which put VSA_CORR on top of arm R2 (job 080, never queued, deleted).

Not in this round: P3 and P6 (need the owner's OK, not given), P4, P5, FRONT_NEG, VAL_GUARD, VAL_SHADOW, VAL_PREC=event.

| job | what | AFTER | expected time (RTX 3050 Ti, the GPU machine's CPU) |
|---|---|---|---|
| `081_vss_r3` | arm R3, VSS: 9 worlds, world + event cutter, context filler, registry_R3.json, smoke read | - | ~70-90 min |
| `082_bert_r3` | arm R3, SOP-BERT (071's recipe, the R3 data) | - (waits for every GPU slot) | ~30-35 min + the wait for 081's worlds |
| `083_measure_r3` | R3 vs ALL on fresh2, short3, scenes_test, collected_1; refit of R3's confidences; COMPARE.md, VERDICT.md | 081, 082 | ~10-15 min (CPU) |
| `084_vss_r3c` | arm R3C, VSS: the 9 worlds with VSA_CORR=phase; R3's cutters and filler copied | 081, 083 | ~45-60 min |
| `085_measure_r3c` | R3C vs R3 on the same four sets; refit of R3C's confidences; COMPARE.md, VERDICT.md | 084, 082, 083 | ~10-15 min (CPU) |

In all ~3 h of machine time if nothing waits (081 and 082 share the card by the slot locks; 084 waits for 083 so that its worlds do not share
the memory with 083's collectors: job 073 was stopped by the memory guard). The runner's AFTER means "ended", not "succeeded": a job after a
failed one starts and stops at its own input checks.

**Before queueing: one owner decision is needed** (section A.5, SOP-BERT gate): as the data stands, job 082 stops at its label round-trip gate
on `llm_train/scenes_r3b` (94.7% < 95%); 083 and 085 then stop at their input checks. 081 and 084 are not affected.

## A. Arm R3

### A.1 What changes against arm ALL

| what | where | VSS (081) | SOP-BERT (082) |
|---|---|---|---|
| `llm_train/scenes_r3` (16 scenes, 701 messages, 714 requests) | EXTRA_DIRS | yes | yes |
| `llm_train/scenes_r3b` (4 targeted scenes, 96 messages, 94 requests) | EXTRA_DIRS | yes | yes |
| `llm_train/opus_r3_gaps` (the forms of the owner's session 1, 136 messages, 147 requests) | EXTRA_DIRS | yes | yes |
| `GAP_ROLE=1`: a gap with a relation ("6 px above Pot") fills the role `amount`; `docs/js/vss-adapter.js` reads it as `distance` | llm_to_world.py | yes | (reads the gold directly) |
| `NEW_DISTINCT=1`: several `$new` in one wire become distinct created names (TRAIN_PLAN_R2.md 2.3) | llm_to_world.py | yes | (reads the gold directly) |
| the 12 folders of arm ALL, unchanged (not round 2's `*_dd`, `synth_short_r2`, `opus_short_r2`: A.2) | EXTRA_DIRS | yes | yes |
| every other setting: the shipped `docs/model/micro/<world>8/BUILD.json` (arm ALL); FAST=1 FAST_MEM_MB=256 FAST_PROCS=2 (job 078's memory-safe settings) | train_micro.sh | yes | 071's recipe |

**The preprocessing switches approved by the owner (P3 name token, P6 number words, the decode fixes) are part of arm R3 once each is measured.**
They are being implemented by another agent as build switches, off by default. The jobs take them in one place each: `PREP_SWITCHES` at
the top of 081 / 084 (NAME=VALUE words, exported for every learned part and appended to every world's settings in worlds.tsv) and of 082
(exported for make_data / make_roles / roles_roundtrip). The coordinator fills in the names; the dry-run numbers below are with
`PREP_SWITCHES` empty and must be re-run with them (081 / 082 with GATES_ONLY=1). Two things to check when they are added: (1) a switch that
the browser front end (front.js) or the adapter must also apply at read time has to be recorded in each world's exported files (BUILD.json /
front.json) so that the collectors of 083 / 085 read arm R3 as it was built, and convert_check.py `KEYS` must list it for `--registry`;
(2) decode fixes in docs/js (neural.js P5, vss-adapter partial `at`) apply to BOTH arms in 083 (the shipped models are read by the same code),
so they are not part of the R3 - ALL difference; if they should be credited, they need their own measurement on the shipped models first.

`opus_r3_gaps` is the folder of the gaps found in the owner's session (`collected/SESSION_1_ANALYSIS.md`, fix 3; its README): training data
written by an Opus writer from those gaps, not the benchmark. Never trained on: `llm_bench/scenes_test`, `llm_bench/short3`, `llm_bench/fresh2`,
`llm_bench/collected_1`.

What the new data changes, per learned part:
- VSS worlds: the 955 new requests reach 8 of the 9 worlds (shapes 477, manage 138, questions 109, position 84, links 73, graphq 50, history 19,
  layout 5); help gets none. All 9 are retrained (help comes out as arm ALL's, ~1 min) so that the arm is one build on one data list.
- the world cutter, the event cutter and the context filler learn from every message: retrained.
- SOP-BERT: its layout is built from the data (a key gets a head only if the data has it). With the R3 data it gains the span heads `width`,
  `height`, `distance` on create, the fill values `faint` / `none`, and `layer` / `label` in a description (082 checks each of them).

### A.2 The base: arm ALL's data list + NEW_DISTINCT, not arm R2

Round 2 (arm R2: ALL + NEW_DISTINCT + the deduplicated synthetic folders + synth_short_r2 + opus_short_r2) lost on fresh2: VSS-BERT 42.4 -> 36.4,
-6.0 [-12.4, -0.2]. The question was whether that loss came from the confidence refit (then R2's data could be kept) or from the data. The
numbers of job 079 (`results/079_measure_round2` on gpu-runs) do not let us blame the refit:
- the fit recipe was the same on both sides: VSS and SOP-BERT alone are fitted by the same `fit_report.mjs` on the same calibration part for
  arm ALL and arm R2 (verdicts.mjs), and VSS-BERT's shipped combined.json was itself fitted by refit.sh (job 072) on the same data with the
  same variant d2;
- executing everything, the readings barely moved (fresh2: VSS right 66.6% -> 66.2%, wrong 14.1% -> 15.1%; SOP-BERT right 80.8% -> 81.2%);
- what moved is the readers' own confidence signal: VSS's out-of-fold AUROC fell on both sets (fresh2 0.772 -> 0.759, short3 0.832 -> 0.801),
  so its cost-score threshold executed 39 calibration requests instead of 143, and VSS alone fell 15.2 -> 3.0 on fresh2 (a loss shown).
  A confidence that separates right from wrong less well is a property of the retrained reader, i.e. of its data and training, not of the
  refit procedure.

So the R2 loss cannot be shown to come from the refit, and **arm R3 keeps arm ALL's 12 folders**. NEW_DISTINCT=1 is kept: it is a converter
correctness fix (16 rows of 070's data + tests change, all to the roles the text states), the owner's expectation. Caveat: NEW_DISTINCT was
never measured alone (it was bundled with R2's data, and is bundled with R3's data here); with 16 rows of 25k its effect is expected to be ~0.

### A.3 Data checks (2026-11-03, this machine)

- `front.extra_dirs()` with the 15 folders: every folder found and annotated; DATA=spans + EXTRA_DIRS = 22631 messages (arm ALL: 21698).
- Overlap of the three new folders with every test set (exact text after lower-casing / stripping punctuation, the same token set, shared ids):
  0 everywhere, except one same-token-set pair, `sc3b-23-013` "Sun: a medium yellow circle in the top right, named Sun." vs scenes_test
  `sc3-14-018` "a sun in the top right: medium yellow circle named Sun" (different wording of a common create; kept).

### A.4 One converter fix made here (llm_to_world.py; needs the coordinator's review)

The first dry run of 081's gate **failed**: `opus_r3_gaps` turned 2.0% of its requests into "every shape" (3 of 147; gate 1%):
"delete all the panels" (gold `delete target=mention(layer=zone,quantifier=all)`), "remove the background shapes" and "change the color of the
zones to pink" were written as world rows that delete / colour **every shape**. Five more ("delete the background boxes", gold
`mention(layer=background,quantifier=all,shape=rectangle)`) were written as "every rectangle". That is exactly the mistake of the owner's
session (turn 15 deleted Backdrop, both zones and Process).

Cause (our code): the LEGEND_EXT rule of `llm_to_world.py ent()` "a description is never written broader than its gold" checked only the
filters a world row can carry (shape, colour, not-colour, recency). `layer` and `label` in a mention are new (SESSION_1_ANALYSIS.md fix 2; the
engine reads them since then), and a world row has no place for them, so they were silently dropped. Fix: a mention with any filter key the
entity cannot carry (layer, label, size) is left out the same way ("description filter lost": the row then says nothing about that role, it
does not teach a wrong set). No switch: no mention in arm ALL's 12 folders has such a key (counted: layer / label only in opus_r3_gaps and
collected_1, size in synth_short_r2 / opus_short_r2 / one short3 request), so every build of arm ALL's data is unchanged. Measured: the 8 rows
above change from a broader target to no target; every other folder of the table below is identical to the decimal before and after;
`scenes_r3/test_gap_role.py` ok. The gate is unchanged (1%) and now passes.

Not fixed (a VSS model limit, not a converter bug): VSS cannot read "the zones", "the background boxes" or a text by its words at all (no role
for layer / label); SOP-BERT can (A.5).

### A.5 Gate numbers of the dry run (CPU; the GPU jobs repeat them)

**081, convert_check** (the R3 world table, LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1 NEW_DISTINCT=1 GAP_ROLE=1, fronts learned with the 15
folders; `results`-style table, share of requests):

| folder | requests | round trip | every shape |
|---|---|---|---|
| base (DATA=spans: 9 folders) | 22702 | 82.7% | 0.4% |
| opus_train_a / b / c / d | 994 / 891 / 1059 / 1015 | 74.6 / 71.8 / 73.7 / 71.4% | 0.2 / 0.3 / 0.2 / 0.5% |
| opus_gen_1 / 2 | 991 / 1094 | 76.2 / 77.9% | 0.5 / 0.3% |
| synth_rules / synth_rules_ops / synth_rules_ext | 11707 / 1470 / 3664 | 79.8 / 76.5 / 82.4% | 0.0% |
| ops_formulations / opus_ext_1 / synth_combo | 733 / 743 / 4521 | 63.6 / 49.4 / 79.5% | 0.3 / 0.1 / 0.1% |
| **scenes_r3 / scenes_r3b / opus_r3_gaps** | 714 / 94 / 147 | **62.6 / 72.3 / 57.1%** | 0.6 / 0.0 / **0.0%** (2.0% before A.4) |
| scenes_test (not trained) | 163 | 65.6% | 0.6% |
| collected_1 (not trained) | 44 | 38.6% | 0.0% |
| short3 (no pending) / fresh2 (not trained) | 644 / 1909 | 61.2 / 74.4% | 0.0 / 0.3% |

Gate: every shape <= 1% in every trained folder: **passed**; round-trip floor 40%: **passed** (lowest opus_ext_1 49.4%). For comparison
(ROOT_CAUSES.md): the shipped worlds' ceiling on scenes_test is 57.1%; arm ALL's settings with the fronts learned without the scenes 63.2%.

**082, SOP-BERT rows** (`make_roles.py --all` with the 15 folders): 55539 request rows (071: 54.6k), 52 acts, 25 class keys, span keys
about, anchor, anchor2, at, count, distance, from, height, items, items2, label, linked, name, parents, scale, target, title, to, width;
fill = none / faint / light / solid (+ the "none" class); layer = background / zone; description keys color, label, layer, notColor,
quantifier, recency, shape; create's keys include width, height, distance. Every head 082 checks is there.

**082, label round trip** (`roles_roundtrip.py --compare-rows`, gate 95% / 1%; right or reference only):

| folder | requests | right | right or reference only | silent wrong labels |
|---|---|---|---|---|
| ALL trained folders | 55539 | 95.2% | 99.5% | 0.1% |
| scenes_r3 | 714 | 86.1% | 99.6% | 0.1% |
| **scenes_r3b** | 94 | 92.6% | **94.7%** | 0.0% |
| opus_r3_gaps | 147 | 99.3% | 99.3% | 0.7% |
| scenes_test (not trained) | 163 | 89.0% | 100.0% | 0.0% |
| collected_1 (not trained) | 44 | 81.8% | 93.2% | 4.5% |
| short3 / fresh2 a, b, c, d (not trained) | 650 / 514, 468, 471, 456 | 95.7 / 87.9, 91.5, 94.3, 90.8% | 98.0 / 99.8, 99.8, 100, 100% | 0.3 / 0.2, 0, 0, 0% |

**Gate: FAILED on scenes_r3b, 94.7% < 95%.** Cause (known, ROOT_CAUSES.md sections 3 and 5): 5 of its 94 requests write the gap in words
("forty px right of Bed2", "two px below Sign", "thirty px away", "twenty px right of Table", "forty px right of Gull"); make_roles.py's learned
number words align no gap word, so the `distance` tag is missing in the label and the decoded request has no distance (cause "number not read
back"; 0 silent wrong labels). The fix is P6 (number words aligned by the number kind, or a digit-word table), which needs the owner's OK.
The gate was not changed. **The owner decides one of:**
1. OK for P6 first (then the rows are rebuilt and the gate re-run before queueing 082);
2. a written exception for this folder in 082's gate (scenes_r3b at 94.7%, the 5 spelled gap numbers, 0 silent wrong labels): the model is then
   trained to read no distance there, which in the demo is a create placed without its gap (done wrong, not dangerous);
3. SOP-BERT trained without scenes_r3b (AGENTS.md says not to drop realistic data the pipeline cannot read; listed for completeness).

### A.6 Pre-registration (AGENTS.md, Experiments)

- **Hypothesis.** The scene forms (noun-led creates "Wall first: a faint orange rectangle ...", sizes "150 by 90", gaps with a relation,
  fills, coordinates with a space) and the session-1 forms ("make me a square", "in the form of a circle", "a text element that says",
  "connect all", "join A and B", the panels, a text by its words) in the training data make both readers read these requests right, and VSS
  carries gaps (GAP_ROLE), so that VSS-BERT executes more right requests on step-by-step drawings without executing more wrong ones, and
  without losing on the long messages (fresh2) and the short commands (short3).
- **Measures** (job 083, the recipe of 079, arm ALL = the shipped readers with the shipped confidence files):
  1. main: the cost score of **VSS-BERT** (the demo's reader, its default level, combined.json variant d2): R3 - ALL, paired, 95% interval
     from 1000 resamples of the messages; on fresh2 and short3 the test part (sha256 % 3 != 0; R3's confidences are refitted on the
     calibration part of fresh2 + short3, the same data as the shipped fit); on scenes_test and collected_1 every message (no confidence of
     either arm is fitted on them);
  2. beside it: VSS-BERT's confidently-wrong rate (of what it executes) and share done right; VSS alone and SOP-BERT alone (verdicts.mjs:
     threshold fitted on each set's calibration part; collected_1 is too small for that fit and is reported as "-" there); the Rules executing
     everything; the out-of-fold AUROC of each confidence (report.md); the VSS conversion ceilings (convert_check --registry).
- **It worked (R3 adopted) when** the VSS-BERT difference R3 - ALL has its 95% interval **above 0 on fresh2 or on scenes_test**, and its 95%
  interval is **below 0 on none of fresh2, short3, scenes_test**. A loss shown on fresh2 or on short3 means **not adopted**, whatever the
  scenes show. collected_1 (22 requests per variant) is reported only. 083 writes this verdict to `results/083_measure_r3/VERDICT.md`.
  Caveat stated now: scenes_test's steps are resampled one by one, but the steps of one scene are not independent (4 scenes), so its interval
  is narrower than the truth; a gain shown only on scenes_test is the weaker of the two ways to pass.
- Baseline on the extra sets (the shipped readers, this machine, the 083 code path with the shipped models on both sides): scenes_test
  VSS-BERT cost score 41.1 (162 messages, 163 requests; 41.1% done right, 0 executed wrong); collected_1 -45.5 (it executes one request, the
  delete of turn 15, and it is wrong).
- Expected (ceilings, not predictions): VSS's conversion ceiling on scenes_test 57.1% (shipped fronts) -> 65.6% (R3 table); SOP-BERT's label
  ceiling on scenes_test 71.8% -> 89.0% (100% with references); fresh2 / short3 ceilings unchanged (74.4% / 61.2%; 95.7% short3 labels).
- If the threshold is missed: stop and report; no second try in this round.

### A.7 Other things for the owner (not blocking 081)

- The panels' convention and the engine differ: opus_r3_gaps's README writes `layer=background` for "the background boxes" meaning every panel
  (background or zone); `docs/js/logic.js filterShapes` keeps only `layer === 'background'` there. A right SOP-BERT reading of "delete the
  background boxes" on the demo drawing will then delete Backdrop only, not the zones. The data or the engine should change to match; the
  training is not affected.
- **`training/sketch/legend_ext/legend_values.json` is stale on main (blocks 081 / 084 as they are):** re-exported from the committed
  `docs/js/logic.js` it gains values, not only the sha line: position `inside` and `onTop`, and a new enum `object` (sun, moon, cloud, sky,
  ground, grass, ...). 081's legend check stops there (the dry run with GATES_ONLY=1 did). The coordinator must re-export and commit it
  (`node training/sketch/legend_ext/export_legend_values.mjs`) before queueing; convert_check with the re-exported file (restored afterwards)
  gives the A.5 table identical row for row, gate passed. The check now restores the file before it stops (it left it modified before).

## B. Arm R3C: arm R3 + VSA_CORR=phase

### B.1 What the switch does

Deviations accumulate along the chain of bindings, so the reader's chart S of a request is not exactly the gold-compiled state T of its
frame. With `VSA_CORR=phase` each world learns ONE phase vector c (D numbers), and the reader decodes exp(i c) * S / |S| instead of S / |S|:
an element-wise rotation (a bind with a learned vector, FHRR), one per read, before every cleanup (structure score, predicate, every role's
presence and identity, attributes, determiners, scope terms) and before the compiled residual.

How c is fitted (`tool/sop/train.py fit_corr`): after the route book is trained and frozen, on the trainer's own loss over the training rows,
maximise mean_r Re<T_r, exp(i c) * S_r> / (|S_r| |T_r|). A unit-phase rotation keeps |S_r|, so the objective is sum_d Re(exp(i c_d) z_d) with
z_d = sum_r S_rd conj(T_rd) / (|S_r| |T_r|): it separates per dimension and its exact maximum is c_d = -arg z_d. No gradient steps, no learning
rate, no regulariser; the phases are put on the 8-bit grid so that Python and the browser read the same rotation. Then the presence
thresholds are calibrated through the corrected state, so the thresholds, the margins and the confidence features all come from it.

Where it lives: `tool/sop/train.py` (`VSA_CORR`, `fit_corr`, the record `correction` in config.json: the fit and the trainer's mean cosine
before / after on every split); `tool/sop/infer.py` (`Routebook.corr`, `Reader.set_corr`, the rotation in `read` and `residual`);
`tool/sop/export_web.py` (the phase array `corr` in routebook.bin, manifest `vss-web-4`); `docs/js/vss/routebook.js`, `docs/js/vss/reader.js`
(applied when the array is present, ignored when absent); `training/sketch/train_micro.sh` (passes VSA_CORR, records it in BUILD.json).
With the switch unset every build and every reading is byte-identical to before (B.5).

### B.2 The jobs

- `084_vss_r3c.sh` (after 081 and 083): job 081's recipe (the same 9 worlds, settings, data, NEW_DISTINCT=1 GAP_ROLE=1, FAST_PROCS=2) with
  `VSA_CORR=phase` for every world. One change only: the world cutter, the event cutter and the context filler are arm R3's files, copied (084
  checks that arm R3 was built with the same EXTRA_DIRS), so `docs/model/arms/R3C/registry_R3C.json` differs from R3's only in the world
  models. The same convert_check gate as 081. After training, a check that every world's export carries the correction (manifest `corr`,
  BUILD.json `VSA_CORR=phase`) and the log of each world's training cosine before / after.
- `085_measure_r3c.sh` (after 084, 082, 083): G = arm R3 (its models and the confidence files 083 refitted for it), T = arm R3C (refit.sh on
  the R3C VSS + R3 SOP-BERT, the same data); SOP-BERT is R3's on both sides (its columns are equal by construction). It checks first that
  R3 and R3C share their cutters and filler byte for byte and that their worlds' BUILD.json differ only in VSA_CORR.

### B.3 Measures

1. per world, the trainer's mean cosine to the gold state on the training rows and on the held-out formulations, before / after
   (`results/085_measure_r3c/corr_cosine.md`, from config.json `correction.cosine`);
2. VSS alone: cost score R3C - R3 on the four sets (verdicts.mjs), and its out-of-fold AUROC (report.md);
3. VSS-BERT: cost score R3C - R3, confidently wrong, done right, as in A.6.

### B.4 Pre-registration

- **Hypothesis.** The rotation brings the chart closer to the gold-encoded state, so role identities are decoded right more often and the
  margins separate right from wrong readings better (a higher AUROC of the VSS confidence).
- **It worked (R3C adopted over R3) when** the VSS-BERT difference R3C - R3 has its 95% interval above 0 on fresh2 or on scenes_test, and
  below 0 on none of fresh2, short3, scenes_test (the rule of A.6). Otherwise it is reported as not shown (or a loss) and the switch stays
  off. VSS alone and the cosines are reported beside it; a gain of VSS alone without a VSS-BERT gain is reported, not adopted.
- R3C is measured whether or not R3 is adopted (the comparison R3C - R3 holds either way); it can only be adopted together with R3.

### B.5 Smoke tests of the switch (CPU, 2026-11-03, from the first version of this plan)

- Byte identity with the switch unset (history world, the trainer and the reader before / after the change): routebook.npz, background.npz,
  catalog.json, kinds.tsv, legend.json identical; config.json / metrics.json / REPORT.md differ only in the clock and commit fields; the export
  (routebook.bin, stars.json) identical; the browser reader on 200 sentences gives the same output file byte for byte (old reader on old export,
  new reader on new export, new reader on old export).
- With the switch: the trainer's mean cosine before -> after: history train 0.9229 -> 0.9233, held-out formulations 0.9181 -> 0.9194; layout
  train 0.7175 -> 0.7222, held-out 0.7390 -> 0.7433; a train_micro.sh smoke run (history, 536 rows, EPOCHS=1) 0.7107 -> 0.7551 train, 0.7101
  -> 0.7631 held out (the less trained the route book, the more the rotation recovers). Role decoding on layout (462 training rows): 90.3% ->
  90.3% right; margins moved by 0.001 on average. So at the smoke scale no difference in decisions.
- The export (manifest vss-web-4, `corr`) is read by the browser reader; the Python reader on the export's numbers gives the same SOP text and
  status on all 200 layout sentences with and without the correction (residual within 6e-10). train_micro.sh records `"VSA_CORR": "phase"`.
- `shrink/test_generated_stars.mjs`: all 27464 stars identical; `test_vss_confidence.mjs`: PASS.

### B.6 Next steps (not implemented)

A per-event vector (two-pass read); a low-rank map in phase space trained by gradient with the route book frozen; fitting on the decoding
loss itself instead of the cosine; joint training with the route book.

## C. Files

- Jobs: `training/laptop/jobs_draft/081_vss_r3.sh`, `082_bert_r3.sh`, `083_measure_r3.sh`, `084_vss_r3c.sh`, `085_measure_r3c.sh`;
  `080_vss_corr.sh` deleted (built on R2, never queued). 081, 082 and 084 accept `GATES_ONLY=1` (run the gates, train nothing; the runner never
  sets it).
- Code: `training/sketch/llm_to_world.py` (A.4: a mention filter a row cannot carry is left out), `training/sketch/train_micro.sh` (GAP_ROLE
  passed and recorded in BUILD.json when set; unset: BUILD.json as before).
- Reproduce the dry checks (CPU, ~15 min on 2 cores):
  `HOME=<scratch> GATES_ONLY=1 bash training/laptop/jobs_draft/081_vss_r3.sh` (then remove `results/081_vss_r3` and `docs/model/arms/R3`);
  082's gates the same way (it runs `npm install` in training/laptop first).
