# sop-bert-R2: SOP-BERT fine-tuned on ALL the data (no held-out)

Same architecture, heads and export as docs/model/neural/sop-bert (see its README). Differences: trained with make_roles.py --all
(training/neural/ALL_DATA.md): the 55029 request spans of every message the shipped VSS chain trains on (25267 messages), nothing removed, no
held-out, so no early stop: 8 epochs (the best epoch of the shipped run), lr 6e-05, batch 32, fp16 on cuda, seed 0; the last epoch is kept.
Fit on the TRAINING data only (not a test): sample1000 (inside the training set) act 0.9996, requests read right 0.9774.
Size: onnx/model_quantized.onnx 68.0 MB (q8). Node check vs torch on 50 training requests: {"ids": "50/50", "act": "50/50", "classes": "50/50", "tags": "50/50", "cut": "20/20"}.
Evaluation: on a fresh test set only (calibration part for confidences/thresholds, test part for the numbers).
