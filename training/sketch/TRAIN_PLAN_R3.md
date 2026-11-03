# TRAIN_PLAN_R3: round 3 of VSS, the learned world-level correction operator (written 2026-11-03)

Starting point: arm R2 of TRAIN_PLAN_R2.md (job 078, measured by job 079). This round adds one switch, `VSA_CORR=phase`, the owner's
idea of future-experiments.md ("The Rules and VSS in one space", item 2), and one GPU job that trains the R2 recipe with it. Nothing was
trained on the GPU yet: the numbers below are CPU smoke runs. With the switch unset every build and every reading is byte-identical to
before (section 4).

## 1. What the switch does

Deviations accumulate along the chain of bindings, so the reader's chart S of a request is not exactly the gold-compiled state T of its
frame. With `VSA_CORR=phase` each world learns ONE phase vector c (D numbers), and the reader decodes exp(i c) * S / |S| instead of S / |S|:
an element-wise rotation (a bind with a learned vector, FHRR), one per read, before every cleanup (structure score, predicate, every role's
presence and identity, attributes, determiners, scope terms) and before the compiled residual.

How c is fitted (`tool/sop/train.py fit_corr`): after the route book is trained and frozen, on the trainer's own loss over the training rows,
maximise mean_r Re<T_r, exp(i c) * S_r> / (|S_r| |T_r|). A unit-phase rotation keeps |S_r|, so the objective is sum_d Re(exp(i c_d) z_d) with
z_d = sum_r S_rd conj(T_rd) / (|S_r| |T_r|): it separates per dimension and its exact maximum is c_d = -arg z_d. No gradient steps, no learning
rate, no regulariser (each c_d averages every training row); the phases are put on the 8-bit grid so that Python and the browser read the same
rotation. Cost: one chart per training row (~1-4 s on the CPU for the worlds below). Then the presence thresholds are calibrated through the
corrected state, so the thresholds, the margins (and therefore the abstentions and the confidence features) all come from the corrected state.

Where it lives:
- `tool/sop/train.py`: `VSA_CORR` (unset or `phase`, anything else stops), `fit_corr`, called first in `calibrate_and_finish` (one-request and
  centre worlds; a centre world fits on the state of the centre matched to each row); the record `correction` in config.json (the fit, the
  trainer's mean cosine before / after on the training rows and on every other split).
- `tool/sop/infer.py`: `Routebook.corr` (from `corr.npz` beside routebook.npz), `Reader.set_corr`, the rotation in `read` and `residual`
  (the explained residual is unchanged by construction: both of its states are this reader's charts).
- `tool/sop/export_web.py`: the phase array `corr` in routebook.bin (8 bits), manifest key `corr` and format `vss-web-4`;
  `routebook_from_bin` reads it back.
- `docs/js/vss/routebook.js` (`rb.corr`, exp(i phase) as {re, im}), `docs/js/vss/reader.js` (`read`, `residual`): applied when the array is
  present, ignored when absent.
- `training/sketch/train_micro.sh`: passes `VSA_CORR` through, records it in BUILD.json only when set.

## 2. The job

`training/laptop/jobs_draft/080_vss_corr.sh` (after 078): job 078's recipe (the 9 worlds of GROUPS_8ops.json with their shipped settings,
NEW_DISTINCT=1, the round-2 EXTRA_DIRS, FAST=1 FAST_MEM_MB=256 on cuda) with `VSA_CORR=phase` for every world. One change only: the world
cutter, the event cutter and the context filler are arm R2's files, copied, so `docs/model/arms/R3C/registry_R3C.json` differs from R2's
only in the world models. Outputs under `docs/model/arms/R3C/` and `results/080_vss_corr/`. A gate checks that every world's export carries
the correction (manifest `corr`, BUILD.json `VSA_CORR=phase`) and logs each world's training cosine before / after. Expected ~40-60 min.

## 3. How to compare it (the measurement, job 081 to draft after 080)

The same data and settings with and without the operator: G = arm R2 (`docs/model/arms/R2/registry_R2.json`), T = arm R3C
(`docs/model/arms/R3C/registry_R3C.json`), measured exactly like job 079: `079_measure_round2.sh` with `REG_OLD` = R2's registry and context,
`REG_NEW` / `CTX_NEW` = R3C's, SOP-BERT left as R2's on both sides (it does not change), on fresh2 (opus_a..d) and short3 without pending
wires; the collectors, `fit_report.mjs` and `verdicts.mjs` (cost-score threshold fitted out of fold on the calibration part, 1000 paired
resamples of the test messages), and VSS-BERT with `confidence3/refit.sh` on the R3C readers (COMB_VARIANT=d2).

Pre-registered (AGENTS.md, Experiments):
- Hypothesis: the rotation brings the chart closer to the gold-encoded state, so role identities are decoded right more often and the margins
  separate right from wrong readings better.
- Measures: (1) per world, the trainer's mean cosine to the gold state on the held-out formulations, before / after (config.json
  `correction.cosine`, logged by job 080); (2) the role-decoding accuracy per role on the scenes and short3 with the oracle cut (the gold
  spans read as units); (3) the VSS cost score on the test parts of fresh2 and short3, R3C - R2, with its 95% interval; (4) the AUROC of the
  VSS confidence, R3C vs R2.
- It worked when the paired difference of the VSS cost score R3C - R2 has its 95% interval above 0 on fresh2 or short3 and below 0 on
  neither; otherwise it is reported as not shown (or a loss), and the switch stays off.

## 4. Smoke tests (CPU, this machine, 2026-11-03; outputs in the agent's scratch folder, not in the repository)

Worlds built by `msg_to_world.py` with the shipped settings of history8 (901 rows; its legend has no roles) and layout8 (501 rows, 10
roles), trained with the arguments of train_micro.sh, EPOCHS=2, FAST=1.

Byte identity with the switch unset (history, the trainer and the reader before this change against after):
- model folder: routebook.npz, background.npz, catalog.json, kinds.tsv, legend.json identical; config.json and metrics.json differ only in
  `trained` / `training_code_commit` / `t_train_s` (the clock and the git state of the run), REPORT.md only in the commit line;
- export (`--bits 8 --sparse --stars generated`): routebook.bin and stars.json identical, model.json only in those two config keys,
  manifest.json only in the commit and model.json's hash;
- the browser reader on 200 sentences (SOP text, status, residual, margins, presence ratios): the old reader.js on the old export, the new
  reader.js on the new export and the new reader.js on the old export give the same output file, byte for byte.

With the switch (`VSA_CORR=phase`):
- the trainer's mean cosine before -> after: history train 0.9229 -> 0.9233, held-out formulations 0.9181 -> 0.9194; layout train
  0.7175 -> 0.7222, held-out formulations 0.7390 -> 0.7433, calibration half 0.6980 -> 0.7042; a smoke run of train_micro.sh itself
  (history without EXTRA_DIRS, 536 rows, EPOCHS=1): 0.7107 -> 0.7551 train, 0.7101 -> 0.7631 held out. The less trained the route book, the
  more the rotation recovers;
- role decoding, layout, each row read from its text by the Python reader (off -> on): training rows (462, 476 gold roles) roles right
  90.3% -> 90.3%, wrong 4.8% -> 4.8%, missing 4.8% -> 4.8%, extra 14 -> 15, abstain 32 -> 31; held-out formulations (20 rows, 19 roles) and
  their calibration half (19, 19): 100% -> 100%; with the gold structure (oracle): 92.4% -> 92.4%. History: event 100% -> 100%. So at this
  scale no difference in decisions: one sentence of 200 changed (an extra unplaced word), the margins moved by 0.001 on average
  (largest 0.033), the presence thresholds by up to 0.015;
- export: manifest vss-web-4 with `corr`; the browser reader reads it, and the Python reader on the export's numbers
  (`parity_reader.web_reader`) gives the same SOP text and status on all 200 layout sentences, with and without the correction (residual
  within 6e-10);
- train_micro.sh with VSA_CORR=phase: exit 0, BUILD.json records `"VSA_CORR": "phase"`.
- `training/sketch/shrink/test_generated_stars.mjs` (cand = the shipped worlds, stars.bin written by the Python side): all 27464 stars
  identical; `training/sketch/test_vss_confidence.mjs`: PASS (303 requests, 0 differences).

## 5. Next steps (not implemented)

- A per-event vector (the event is decided from the corrected state, so it needs a two-pass read, or a vector chosen by the predicate
  readout first).
- A low-rank map in phase space (c + U V^T over the phases), trained by gradient on the same loss, with the route book frozen.
- Fitting on the decoding loss itself (softmax over the cleanup candidates per role) instead of the cosine to the gold state.
- Joint training with the route book (an extra parameter, regularised toward the identity).
