# act-distilbert: the demo's neural reader, fine-tuned on our annotated requests

A sequence classifier: the text of one request -> its act (the action of a command, the ask of a question, else `fact` or `rule`;
36 classes, the act set of docs/js/neural.js ACTION + ASK + fact + rule; the class names are `id2label` in config.json).
Load with transformers.js as `text-classification` (dtype `q8`, file `onnx/model_quantized.onnx`).

- Base model: `distilbert-base-uncased` (license: Apache-2.0); fine-tuned here, weights are a derivative of it.
- Data: 15683 request spans from the span-annotated messages of training/sketch (made by training/neural/make_data.py; split by message id,
  10% of the messages held out; the fixed 1000-message sample and the docs/bench sets are never trained on).
- Held-out act accuracy (fp32 torch): 0.9901. Other sets: blind 0.983, broad 0.949, hand 1.000, heldout_formulations 0.977, new_identities 0.970, sample1000 0.987, seen 0.973.
- Size: onnx/model_quantized.onnx 67.6 MB (q8). Node check vs torch top label on 50 held-out rows: agree 50/50.
- Trained with training/neural/finetune.py (epochs <= 8, lr 6e-05, batch 32, fp16 on cuda, seed 0).
