# Future experiments

Ideas measured enough to be worth running, not yet run. Each says why, what would change, and how it would be measured.

## The VSS reader decides the action from the construction, not only from a verb (owner, 2026-11-02: documented, not now)

**Why.** In a world with several actions, the reader decides the action only from a verb lemma
(`docs/js/vss/reader.js` `read`: the predicate is the best of the world's verb lemmas; with no verb lemma among the tokens the status is
`unknown-event`). A world with one action has no predicate role and needs no verb. So grouping actions in one world (fewer worlds,
GROUPS_7) loses exactly the requests whose action is carried by the construction rather than by a verb. Measured in shapes7
(training/sketch/PLAN_B.md):
- verbless set requests ("Post blue", "Closed yellow", "the Hero a tiny blue circle"): unknown-event 15.2% of set requests vs 5.5% in a
  set-only world;
- rule vs set ("every circle should be blue" is a rule, "Box should be blue" is a set; "should be" is a trigger of both): rule read as set
  in 23.9% of rule requests vs 7.8% in a rules-only world;
- graphq7's `exists` ("is there a red circle?") and questions7's `neighbors`: unknown-event 17.8% vs 4.0%, not done 20.1% vs 3.6%.

**The idea.** The action becomes a role the reader learns from the whole frame, like any other role: the frame of "n_post blue" (a name
and a colour value, no verb) is set's frame in this world's data; a quantified object ("every circle") with a value is rule's frame.
The verb, when present, stays the strongest evidence; with no verb, the reader decides from the frame, and abstains when two actions
fit about equally (the margin, as for every role).

**Where it changes.** The VSS reader and trainer (training/vss/tool/sop: infer.py, train.py; docs/js/vss/reader.js), in Python and JS by
the same rule. Architecture work: Opus, effort high; owner's approval needed before it starts (AGENTS.md).

**How it would be measured.** Per event on the gold set inside the grouped worlds (shapes7, graphq7, questions7) vs the one-action
worlds (_w), and the composer on the fixed 1000-message sample. Compare with the cutter's event hint (training/sketch/EVENT_HINT.md,
variant (a), run first): (b) is worth it if it reads these requests at least as well without a second learned model in the composer.

**Risk.** A verbless request is often ambiguous for a person too ("Post blue" could be a fact); the reader must abstain there rather than
guess. Measure wrong first.

## Catastrophic forgetting in the fine-tuned BERT readers, and LoRA (owner, 2026-11-02: documented, not now)

**Why.** `training/neural/finetune.py` fine-tunes all the weights of distilbert-base-uncased into the act classifier (held-out accuracy
0.99 in 8 epochs). It may lose the pretrained knowledge the task relies on for words never seen in our data (for example "erase" or
"wipe" for delete). Nothing measures this today.

**The idea.** Compare full fine-tuning (lr 6e-5 and 2e-5) with LoRA (peft, r 8 and 16 on the q and v projections, trainable head), same
data, epochs and seed. Also, one LoRA adapter per family of actions over one frozen base is the neural counterpart of the small VSS
worlds: a new adapter cannot damage the others. transformers.js 3.8.1 cannot load adapters separately, so each adapter would be merged
into the base before the ONNX export.

**How it would be measured.** Per epoch, for every variant:
1. Task act accuracy: the held-out split, the 1000-message sample, the short sets.
2. Accuracy on requests whose trigger word never occurs in the fine-tuning spans (transfer of pretrained knowledge: this is the
   forgetting that costs us).
3. General language: masked-LM loss and top-1 accuracy on a fixed general-English sample, with the base model's MLM head re-attached to
   the fine-tuned encoder; plus the per-layer representation drift (cosine to the base model).

Reading: (3) worse while (1) stays high is forgetting that does not hurt the task. (2) falling while (1) rises is harmful forgetting; the
epoch where it starts says when. Runs on the owner's GPU machine (about 1 hour).

**Risk.** LoRA may reach a lower task accuracy than full fine-tuning; the comparison has to be made at equal training cost, and the
merge before the ONNX export has to be checked to give the same outputs as the unmerged adapter.

## ModernBERT as the base of the neural reader (owner, 2026-11-02: documented, not now)

**Why.** The neural reader is DistilBERT (66 M parameters, 512-token limit, pretrained on ~3 billion words of Wikipedia and books),
fine-tuned on our requests (training/neural/finetune.py, finetune_roles.py). ModernBERT-base (Answer.AI and LightOn, December 2024:
149 M parameters, 8192 tokens, pretrained on ~2 trillion tokens including code, rotary positions and alternating local/global
attention) reads language better on most published tasks and handles long texts. Our act head is already at ~99% on gold spans; a
better base could matter for the harder parts: cutting a message into requests and reading the roles.

**The idea.** The same fine-tuning scripts with `--base answerdotai/ModernBERT-base` (check first that transformers.js 3.8.1 runs its
ONNX export; if not, the version that does), trained on the owner's GPU machine (estimated 10–15 min; smaller batches on 4 GB).

**How it would be measured.** Against the fine-tuned DistilBERT joint reader on the same split: act accuracy, role accuracy per key,
the cut's errors (lost / merged / split requests) and the per-request score on the fixed 1000-message sample and the demo's short sets;
plus the browser cost: download size (~150 MB q8 vs ~68 MB) and ms per message on CPU (WASM). Adopt only if it reads clearly better
for a cost the demo can carry.

**Risk.** About 2-3x slower and 2x larger than DistilBERT in the browser for a gain that may be small on short commands; transformers.js
support to be checked.

## The same readers on a legend where a wrong action is costly: the real test of the main metric (2026-11-02: documented, not now)

**Why.** The main metric (owner, 2026-11-02; AGENTS.md "What counts as an error") is the precision of execution: do only what you are
sure of, ask about the rest. In the diagram editor a confident mistake costs one undo, so the editor can show whether a reader's
confidence ranks its readings, but not whether a reader can be trusted where a wrong action is serious. The owner's argument for the
metric is exactly that case ("if the decisions were of life and death this matters most"). Two things the diagram legend cannot test:
- whether the confidence and the threshold hold up when the target precision is much higher than anything a drawing needs (the
  threshold has to be chosen for a precision fixed beforehand, not for a trade-off with questions);
- whether one threshold per reader is enough when wrong actions differ in cost (in a drawing every wrong value costs one undo; in a
  dosing or payment legend a wrong unit or amount is worse than a wrong time of day).

**The idea.** A second, small legend for a domain where a wrong action is serious, used only as a research bench, never as a tool:
for example medication orders on a fixed list (drug, dose, unit, route, time) or transfers between fixed accounts (amount, currency,
account, date). Realistic messages written by LLM agents in the style of real use (the same specs as the diagram data: whole messages,
text that is not a request, self-corrections, typos), saved before annotation, annotated as spans. The same three kinds of reader: VSS
worlds trained on its annotation, SOP-BERT fine-tuned on it, Rules written for its legend. No hand-written equivalences for the learned
readers, as here.

**How it would be measured.** Before the run, with the owner: the target precision, and which wrong actions count as serious. Then, per
reader: the threshold chosen on held-out messages to reach the target precision; on a fresh set no reader has seen, the precision of
execution reached, the share of requests done right at that precision, the AUROC of the confidence, and the serious wrong actions
counted apart; the comparison at equal precision. Also: the threshold carried over from the diagram legend against the one chosen in
the new domain (VSS_CONFIDENCE.md notes that a threshold may have to be chosen per domain).

**Risk.** Writing and annotating realistic data for a new legend is the main cost (the diagram data took several batches and checks).
LLM-written messages in such a domain may be cleaner than real ones. A new legend means new worlds and a new SOP-BERT: the owner's
approval is needed before it starts. Nothing in it may be presented as usable for real orders or payments.

## Smaller and different vector representations for the VSS worlds (owner, 2026-11-02 20:36: documented, not now)

**What the worlds use today.** Every vector is D = 1024 complex numbers of modulus 1, that is 1024 phases (Fourier HRR, also called a
phasor or FHRR code; docs/js/vss/stars.js): binding is adding phases, unbinding subtracting them, bundling a sum, and similarity the real
part of the inner product. The route book learns phase rotations by gradient descent and is stored with 8 bits per phase; the word
vectors are fixed and generated from a seed (training/sketch/shrink/SHRINK.md measures storing vs generating them, and 4-bit phases).

**Questions.**
1. **D = 512 (or 256)** with the same code: half the size and about half the compute. The capacity of a bundle (how many bound terms
   a sentence vector can hold and still be read back) grows with D, so long requests may suffer first. Measure: retrain the 7 worlds at
   D = 512 with FAST=1 (training/vss/FAST_TRAIN.md), the same data and seed; compare on the fresh2 test part with the cost score, per
   request length.
2. **Dense binary vectors** (binary spatter codes / MAP-B: 1024 bits, binding = XOR, bundling = bitwise majority, similarity = Hamming):
   a vector is 128 bytes instead of 1024 phases (8x smaller at 8-bit phases), and reading is popcounts, very fast in a browser. Costs:
   binary codes hold fewer terms in a bundle at the same D than phasor codes, so more bits may be needed for the same reading (an
   expected D of a few thousand bits, still smaller than today); and XOR has no "small rotation", so the route book cannot be learned
   by plain gradient descent: either train in phases and binarise (sign of the real part) after training, measuring what is lost, or
   train with a straight-through estimator. Measure: (a) binarise today's trained worlds at D = 1024 and 2048 without retraining, decisions
   changed on the sample and fresh2; (b) only if (a) loses little, a trainer for binary route books.
3. **Other codes** to compare on the same protocol if 1 or 2 is promising: real-valued HRR (circular convolution; same size as phases at
   float, harder to quantise), and sparse block codes (k-of-n blocks; very small and fast, binding by block-wise rotation).

**How it is judged.** The cost score and the confidently-wrong rate on the fresh2 test part (same readers otherwise), the download size,
the load and read time in the browser. A smaller code is adopted only if the score stays within the bootstrap interval of today's.

**Risk.** Each step needs retraining all worlds (minutes with FAST on the GPU machine, once the memory fix lands). Binarising after
training may lose much more than quantising phases; that is what step 2(a) measures before any trainer is written.
