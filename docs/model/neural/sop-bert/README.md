# SOP-BERT: DistilBERT fine-tuned on our requests — cuts the message, reads the action, the values, the names and the descriptions

One DistilBERT encoder with these heads (two calls per message: the cut, then all its requests in one batch):
- the act (52 classes: the action of a command, the ask of a question, else `fact` or `rule`; since arm BERT-ALL also the layout
  operations improve, respace, snap, fit, flip, sort, groupBy, equalize, straighten, untangle, the arrow operation reverse, group / ungroup,
  members / groupOf and help);
- 25 class heads, one per legend key with values (arrow, aspect, axis, color, comparison, direction, fill, kind, layer, layout, notColor,
  outline, pairing, position, position2, property, quantifier, region, scheme, shape, size, style, superlative, template, topic): `none` or
  a value;
- per name-role (anchor, anchor2, from, linked, target, to) a head `fill:<key>`: none / written (the word tags give the names) / context (a
  pronoun or vague reference: the value comes from the context rule all readers share, the last shape created or named) / description (a
  `mention` wire); the description's own keys (color, notColor, quantifier, recency, shape) as heads `desc:<key>`, and for the second
  described role of a request its own heads `desc2:<key>` (color, quantifier, recency, shape);
- the CUT: a second token head (`cut_logits`, O / B / I per word) reads the WHOLE message (<= 512 word pieces) and marks the request spans; the
  act / class / role heads then read the spans of the message in one batched second call (two calls per message);
- a B / I / O tag per word for the keys whose answer is written in the request (about, anchor, anchor2, at, count, distance, from, items,
  items2, label, linked, name, parents, scale, target, title, to); items, items2 and parents (the lists of a template) are one span per item,
  joined with "," in text order.
The head layout is `reader` in config.json; docs/js/neural.js makeReader decodes it. Load with transformers.js as AutoTokenizer +
AutoModel (dtype `q8`, file `onnx/model_quantized.onnx`); outputs `token_logits` and `seq_logits`.

- Base model: `distilbert-base-uncased` (license: Apache-2.0); fine-tuned here, weights are a derivative of it.
- Model: arm BERT-ALL of training/sketch/TRAIN_PLAN_1103.md, installed 2026-11-03 (it replaces arm BERT-G of FEEDBACK_PLAN.md, which
  stays in git history).
- Training data: `make_data.py --all` / `make_roles.py --all` (training/neural/ALL_DATA.md) with
  EXTRA_DIRS = llm_train/opus_train_a opus_train_b opus_train_c opus_train_d opus_gen_1 opus_gen_2 synth_rules synth_rules_ops
  synth_rules_ext ops_formulations opus_ext_1 synth_combo: every span-annotated message the VSS chain trains on plus these, 24698 messages,
  54584 request spans, nothing held out (so no early stop: 8 epochs, the last kept). The same data as the VSS worlds of
  docs/model/micro/registry.json (arm VSS-ALL). The fixed 1000-message sample is inside this training data (its numbers are a fit, not a
  test): act 0.9998, requests read right 0.9804.
- Test: fresh2 (600 messages by a writer not in the training data) + short3 (513 short commands); the confidence
  (docs/model/confidence/sop-bert.json, vote3.json) is fitted on the calibration part (368 messages), the numbers are the test part (745
  messages, 1745 requested actions, results/072_measure on the gpu-runs branch): cost score 33.4 [27.2, 39.0] with the best confidence
  recipe chosen on the calibration part (the votes of VSS and the Rules as inputs, per-type thresholds); arm BERT-G 31.5. With the old
  recipe on fresh2 alone: 35.9 [27.6, 44.4] against 14.4 [2.0, 26.7] for arm BERT-G, +21.6 [9.7, 33.2].
- Size: onnx/model_quantized.onnx 68.0 MB (q8). Node check (docs/js/neural.js makeReader, q8) vs torch on 50 training requests:
  {"ids": "50/50", "act": "50/50", "classes": "50/50", "tags": "50/50", "cut": "19/20"}.
- Trained with training/neural/finetune_roles.py (8 epochs, lr 6e-05, batch 32, fp16 on cuda, seed 0); run: GPU machine job 071
  (branch gpu-runs, results/071_bert_all).
