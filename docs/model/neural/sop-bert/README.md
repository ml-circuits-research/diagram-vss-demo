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
- Data: 15683 request spans from the span-annotated messages of training/sketch (made by training/neural/make_roles.py; split by message id,
  10% of the messages held out; the fixed 1000-message sample and the docs/bench sets are never trained on).
- Held-out act accuracy (fp32 torch): 0.9889. Held-out requests read right (act, every gold class key incl. fill / desc, every gold role on exactly its words): 0.8808.
  Held-out name-roles per filler kind (value read right / gold): context 83/103, description 4/34, written 1611/1659.
  1000-message sample: act 0.9879, requests read right 0.8666.
- Size: onnx/model_quantized.onnx 67.8 MB (q8). Node check (docs/js/neural.js makeReader, q8) vs torch on 50 held-out requests: {"ids": "50/50", "act": "50/50", "classes": "50/50", "tags": "49/50", "cut": "19/20"}.
- Trained with training/neural/finetune_roles.py (epochs <= 8, lr 6e-05, batch 32, fp16 on cuda, seed 0).
