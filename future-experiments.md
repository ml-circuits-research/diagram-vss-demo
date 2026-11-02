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
