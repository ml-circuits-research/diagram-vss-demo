# SOP-BERT on all the data (owner's decision, 2026-11-02 18:07)

"We have little data: do not cut data. Fine-tune SOP-BERT again, on all the data (the same data the VSS worlds are trained on), and we
generate a new test set for evaluation." Target: SOP-BERT trains on exactly the annotated folders the shipped VSS chain trains on, with
nothing left out: no sample removed, no held-out. A fresh test set (written by Opus agents) is split into a calibration part (fits both
readers' confidences and thresholds) and a test part (the numbers).

## What the shipped VSS chain trains on

Shipped = `docs/model/micro/registry.json` (the default; `registry_r2.json` is round 2, trained, not the default). Folders are under
`training/sketch/`.

| Part | Switches (from BUILD.json / the cutter's `data`) | Folders | Messages |
|---|---|---|---|
| 7 worlds (shapes7c, links7, position7, graphq7, questions7, manage7, history7) | `DATA=spans`, no SHORT, no OPS, `HOLDOUT=""` (no held-out), `front.py TRAIN_DIRS["spans"]` | llm_train/{sonnet_msg, haiku_msg, sonnet_msg2, haiku_msg2, sonnet_long} (600+600+600+600+240), llm_bench/fresh1/{sonnet, haiku} (500+500), llm_bench/{sonnet_spans, haiku_spans} (500+500) | 4640 |
| Cutter `cutter_worlds7s.json` | `train_cutter.py` DIRS with `SHORT=1` | the first 7 folders above (3640) + llm_train/{sonnet_short, haiku_short} (1500+1500); NOT the two `*_spans` folders | 6640 |
| Event cutter `cutter_events.json` | `train_cutter.py`, no SHORT | the first 7 folders | 3640 |
| Context filler `context/weights.json` | `train_context.mjs` through `layer_common.mjs dirsAll()` = `micro_tools.py DIRS` (9 folders, no short); trained on 80% of them (hash of the id), 20% only to check | the 7 + the two `*_spans` folders | 4640 |

Union of everything the shipped chain trains on: **11 folders, 7640 messages** = the 9 folders of the worlds/context (4640) + the 2 short
folders (3000) the cutter adds. (Round 2 additionally trains on llm_train/{ops_groups, ops_positions}, 944 messages; it is not shipped, and
SOP-BERT has never seen them. The owner said "the same data the VSS worlds are trained on"; the ops folders are only in the `r2` chain.
Add them to `make_data.py DIRS` if r2 becomes the default.)

## What SOP-BERT (docs/model/neural/sop-bert, job 031) trained on

`make_data.py` DIRS = the 7 folders + sonnet_short + haiku_short (6640 messages), minus the fixed 1000-message sample
(`sample1000_ids.txt`), then 10% of the rest held out by message id (seed 0):

- train 5269 messages (15683 requests), held-out 585 messages (1711 requests), used for early stopping;
- never used: the sample, 1000 messages (786 inside the 6640 folders, 214 inside the two `*_spans` folders; evaluation only);
- never used: the other 786 messages of `llm_bench/{sonnet,haiku}_spans` that are not in the sample (`make_data.py` says "not used at all");
- all of that although the VSS worlds trained on all of them, so SOP-BERT and the worlds were never compared on equal data.

## The difference

| | messages | requests |
|---|---|---|
| old train | 5269 | 15683 |
| old held-out (early stopping) | 585 | 1711 |
| old sample (evaluation only) | 1000 | 4858 |
| `*_spans` messages outside the sample (never used) | 786 | 3450 |
| **all data (training)** | **7640** | **25702** |

SOP-BERT used 5854 messages (17394 requests) for training and early stopping; the all-data run adds 1786 messages (the 1000 sample
messages and the 786 unsampled `*_spans` messages) and 8308 requests, and trains on every one of the 7640. The sample no longer
measures SOP-BERT: it is training data now, and `eval_sample1000` can only report the fit on the training data.

## How (the changes)

- `make_data.py --all` and `make_roles.py --all`: `split_messages(..., all_data=True)` returns DIRS + SAMPLE_DIRS in full (ids checked
  unique), an empty held-out, and the sample's messages (still exported as `eval_sample1000`, now a fit-on-train check). The default
  behaviour (no flag) is unchanged.
- `finetune_roles.py`: with an empty held-out there is nothing to early-stop on. It trains the fixed `--epochs` (8) and keeps the last
  epoch. The shipped run (job 031, `results/031_finetune_roles.log` on `gpu-runs`) scored the held-out as the mean of requests read right
  and the cut F1: epoch 7 0.9057, **epoch 8 0.9082 = the best epoch**, so the best epoch was the last of 8 and its learning-rate schedule
  (6% warm-up, linear decay over 8 epochs) was the full one. Same hyper-parameters and seed: lr 6e-5, batch 32, fp16, seed 0, 8 epochs.
  The sanity number is the fit on the training data only (eval_sample1000 and the training cut, which are INSIDE the training set: not a
  test); no held-out sanity number is reported. The node parity check runs on 50 training requests / 20 training messages.
- GPU job: `041_sopbert_all.sh` writes the model to a NEW folder (`results/041_sopbert_all/sop-bert-all`), never to
  `docs/model/neural/sop-bert`.

Evaluation of the all-data model is on the fresh test set only: calibrate on its calibration part, report on its test part.
