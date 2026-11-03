# SOP-BERT: DistilBERT fine-tuned on our requests — cuts the message, reads the action, the values, the names and the descriptions

One DistilBERT encoder with these heads (two calls per message: the cut, then all its requests in one batch):
- the act (36 classes: the action of a command, the ask of a question, else `fact` or `rule`, or `none`: the text is not a request);
- 15 class heads, one per legend key with values (arrow, axis, color, comparison, direction, kind, layout, notColor, pairing, position, property, shape, size, style, superlative): `none` or a value;
- per name-role (anchor, from, target, to) a head `fill:<key>`: none / written (the word tags give the names) / context (a pronoun
  or vague reference: the value comes from the context rule all readers share, the last shape created or named) / description (a `mention`
  wire); and the description's own keys (color, notColor, quantifier, recency, shape) as heads `desc:<key>`;
- the CUT: a second token head (`cut_logits`, O / B / I per word) reads the WHOLE message (<= 512 word pieces) and marks the request spans; the
  act / class / role heads then read the spans of the message in one batched second call (two calls per message);
- a B / I / O tag per word for the keys whose answer is written in the request (anchor, count, distance, from, label, name, target, to).
The head layout is `reader` in config.json; docs/js/neural.js makeReader decodes it. Load with transformers.js as AutoTokenizer +
AutoModel (dtype `q8`, file `onnx/model_quantized.onnx`); outputs `token_logits` and `seq_logits`.

- Base model: `distilbert-base-uncased` (license: Apache-2.0); fine-tuned here, weights are a derivative of it.
- Model: arm BERT-G of training/sketch/FEEDBACK_PLAN.md (FEEDBACK_RESULT.md), installed 2026-11-02 by the owner's decision (it replaces the
  model trained on 15683 spans with 10% of the messages held out; that one stays in git history).
- Training data: `make_data.py --all` / `make_roles.py --all` (training/neural/ALL_DATA.md) with
  EXTRA_DIRS = llm_train/opus_train_a opus_train_b opus_train_c opus_train_d (1200 base Opus messages) + llm_train/opus_gen_1 opus_gen_2
  (600 general Opus messages): every span-annotated message the VSS chain trains on plus these, 9440 messages, 31746 request spans,
  nothing held out (so no early stop: 8 epochs, the last kept). The same data as the VSS worlds of docs/model/micro/registry.json (arm VSS-G).
  The fixed 1000-message sample is inside this training data (its numbers are a fit, not a test): act 0.9998, requests read right 0.9428.
- Test: the fresh2 messages (training/sketch/llm_bench/fresh2, 600 messages by a writer not in the training data): the confidence
  (docs/model/confidence/sop-bert.json) is fitted on the calibration part (195 messages), the numbers are the test part (405 messages,
  1313 requested actions): cost score 14.4 [2.0, 26.7] at the cost-score threshold 0.8233 (60.1% of the requests done right, 7.1% of
  what it executed wrong); the previous model 9.9 [6.7, 12.6] (fresh2/VERDICTS.md).
- Size: onnx/model_quantized.onnx 67.8 MB (q8). Node check (docs/js/neural.js makeReader, q8) vs torch on 50 training requests: {"ids": "50/50", "act": "50/50", "classes": "50/50", "tags": "50/50", "cut": "19/20"}.
- Trained with training/neural/finetune_roles.py (8 epochs, lr 6e-05, batch 32, fp16 on cuda, seed 0); run: GPU machine job 062
  (branch gpu-runs, results/062_arm_bert_G).
