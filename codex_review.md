# Technical review of language formalization

Date: 2026-11-04. Reviewed checkout: `6cab823` on `main`.

Scope: the shipped Rules, VSS composer and SOP-BERT; training-data conversion, training objectives, decoding, confidence calibration and scoring. The shipped VSS registry is arm VSS-ALL, with nine `*8` worlds; SOP-BERT is arm BERT-ALL, job 071. Round 3 is a proposed build, not the shipped model reviewed here.

**Conclusion:** engineering and data preparation materially constrain performance. There are also problems of principle in the current evaluation and representation: different executable meanings can be treated as identical, and information can disappear before the model or before execution. These findings do **not** establish that VSA is fundamentally unsuitable. They do establish that current scores cannot cleanly isolate the quality of the VSS model from the surrounding pipeline.

Evidence labels used below:

- **Reproduced:** a deterministic check run during this review, using current code or shipped model files.
- **Code-confirmed:** the behavior follows directly from the current implementation; its frequency in production was not measured here.
- **Previously measured:** a result recorded in this repository, not rerun during this review. These numbers retain their original models and datasets and are subject to the scoring limitations below.

No model was retrained or changed. The checks below exercise scoring contracts and inspect data; they are not new reader benchmarks.

## 1. Highest priority: the scorer accepts unrequested changes

**Reproduced.** `scoreMessage()` and `gateTally()` in [llm_score.mjs](training/sketch/llm_score.mjs) check that every gold argument matches. They do not reject additional arguments in the produced command. The confidence collector repeats this check in [collect_pair.mjs](training/sketch/combine/collect_pair.mjs), function `outcomes()`.

| Requested arguments | Produced arguments | Current score |
|---|---|---|
| `set target=Box color=red` | `set target=Box color=red shape=circle` | 1 right, 0 wrong, 0 extra |

Changing Box's shape is an unrequested edit, even though the requested color is right. `extra` counts additional commands, so it does not catch an extra argument inside an otherwise matched command.

The same problem exists in SOP-BERT's internal `evaluate()` in [finetune_roles.py](training/neural/finetune_roles.py): additional class values and role spans increment diagnostic counters but do not make `ok` false. A direct check returned `right=1.0` while reporting an extra shape value. The optional early-stopping path uses this score; the current `--all` build keeps the last epoch, so it is not currently early-stopped by this faulty metric.

**Impact:** execution precision and cost score can be overstated. More seriously, the confidence model can learn that a semantically wrong execution is a positive example. Agreement between the collector and scorer only proves they share the same definition; it does not validate that definition.

**Recommended correction:** compare complete executable arguments after explicit, engine-verified equivalences. Reject additional arguments that change behavior. If a gold annotation intentionally permits alternatives, represent those alternatives explicitly. Then regenerate confidence labels and refit thresholds. The size of the numerical correction and whether reader rankings change are unknown until remeasurement.

## 2. Evaluation erases scale, execution order and created-object identity

**Reproduced.** Three distinct losses occur:

- [bench-canon.js](docs/js/bench-canon.js) unconditionally drops `scale`. `resize target=Box scale=2` and `resize target=Box scale=0.5` score identically. The engine actually applies the factor in [logic.js](docs/js/logic.js), the `set`/`resize` handler. This exemption is defensible for an unspecified degree of “bigger,” but not for an explicit number or the distinction between enlarging and shrinking.
- `PAIR=value` in [layer_common.mjs](training/sketch/layer_common.mjs) matches commands by action and values, with span overlap only a lower-priority tie-breaker. “Make Box red. Then make Box blue.” scores **2 right, 0 wrong** when the produced sequence makes it blue first and red last. The final state is different. This pairing is also used by the confidence collectors.
- `canon()` maps references to **any** created command to `$new`. A reference to created A and a reference to created B become the same target. This erases distinctions the execution engine still needs.

**Impact:** these are semantic blind spots, not merely presentation choices. They can reward the wrong transformation and hide errors in reference resolution. The order example applies to `PAIR=value`; the default order-based alignment does not have that specific permutation behavior.

**Recommended correction:** preserve explicit scale and created-object identity, and constrain matching by occurrence and semantic dependencies. Keep per-request metrics, but verify the resulting operations in execution order. Do not replace them with a per-message success score.

## 3. VSS training targets lose parts of the annotation before training

**Code-confirmed; impact previously measured.** [msg_to_world.py](training/sketch/msg_to_world.py) invokes `convert(..., soft=True)`. [llm_to_world.py](training/sketch/llm_to_world.py) keeps a request while omitting roles whose values cannot be located or represented. `lost` records the omission, but the resulting target describes a smaller request. A later trainer cannot learn the omitted value from that target.

The distinction that needs preserving is **“this argument was absent” versus “this argument was present but conversion failed.”** At present, both can become an absent role in the training frame. Keeping the original message is correct; silently weakening its supervision is the problem.

Previously measured with the shipped fronts, [ROOT_CAUSES.md](training/sketch/scenes_r3/ROOT_CAUSES.md) reports conversion round-trip scores of **57.1% on scenes_test** and **49.9% on scenes_r3**. These are diagnostics of the available supervision path, not universal mathematical upper bounds on every possible model. Nevertheless, they show that large losses already exist without asking the trained reader to predict anything.

Concrete examples include missing distance on anchored placements, unsupported description filters, and fill/layer values not learned by the front end. `GAP_ROLE=1` addresses the distance conversion, but it is not in the shipped world build. The current converter avoids broadening unsupported filtered descriptions by omitting their target; it still cannot represent those descriptions faithfully.

**Recommended correction:** maintain an explicit conversion-completeness audit per role and action. A failed alignment must remain visible and must not be taught as confident absence. Use the existing conversion oracle before training; distinguish unresolved references, which the reasoning layer may fill, from dropped explicit values. A 40% round-trip admission floor, as recorded in [TRAIN_PLAN_R3.md](training/sketch/TRAIN_PLAN_R3.md), permits a large amount of damaged supervision.

## 4. The shipped SOP-BERT cannot output some valid legend arguments

**Reproduced by inspecting [config.json](docs/model/neural/sop-bert/config.json).**

- `span_keys` has no `width` or `height`.
- The `fill` classes are only `["none", "light"]`, where index zero means no value. Faint, solid and explicit no-fill are not available there.
- `act_keys.create` has no `distance`.
- `number_words` contains `lights -> 2`, `circles -> 2` and `duplicate -> 2`.

[make_roles.py](training/neural/make_roles.py) builds heads, values and per-action allowed keys from what occurs in training. It also aligns number words by request-level co-occurrence. Thus missing coverage becomes an output restriction, and incidental correlation can become a numerical label.

**Previously measured:** on scenes_test, the shipped SOP-BERT label round trip was **71.8% right**. Building the label layout with scene training data raised it to **89.0%**, or **100% allowing the references delegated to context**; this is a label-path result, not a measured gain of a retrained model ([ROOT_CAUSES.md](training/sketch/scenes_r3/ROOT_CAUSES.md)).

**Impact:** more epochs with the same labels cannot create a missing output head. The data controls both what is learned and what is expressible. This is a coverage/build-contract problem, not evidence that DistilBERT cannot understand dimensions.

**Recommended correction:** check every legend action/key/value against the actual exported head layout before shipping. Validate number alignments separately from final decoded numbers; a plausible count does not prove the aligned word expressed it.

## 5. Preprocessing and decoding can discard meaning without forcing abstention

**Reproduced / code-confirmed.**

- VSS `tokenize()` in [front.js](docs/js/front.js) turns `Move Box to -20, 30.` and `Move Box to 20, 30.` into the same token sequence, apart from source offsets. The sign is lost. The converter and adapter also accept only unsigned integer coordinate roles. Unsupported numbers should be reported, not converted into another number.
- Quoted strings are identified by a lowercased punctuation-stripped slug. In one tokenization call, `"A+B"` and `"A B"` both become `t_a_b`, and the text dictionary keeps only the first literal. The same issue can affect colliding name slugs. The input identities are no longer distinguishable downstream.
- [vss-adapter.js](docs/js/vss-adapter.js) emits `at` only when both x and y survive. A create can therefore execute without an explicitly requested position. [neural.js](docs/js/neural.js), `role()`, similarly drops a point unless exactly two numeric spans survive; `formalizeJoint()` also deletes a relative position if its anchor is absent.
- SOP-BERT's cut is limited to 512 word pieces and its request reader to 128. Words beyond the cut limit are assigned `pO=1`, not a truncation/unknown status. This code path never examined those words. Its frequency on current messages was not measured here.

The coordinate problem has a recorded user-visible example: VSS lost y in **3 of 8 house creates**, while SOP-BERT read those creates correctly ([ROOT_CAUSES.md](training/sketch/scenes_r3/ROOT_CAUSES.md), shipped ALL readers).

**Impact:** a partial parse can become a different executable command. High confidence in the surviving arguments does not establish confidence in the entire request.

**Recommended correction:** retain unique literal identities, expose truncation, and propagate failed decoding of explicit arguments into the existing abstention path. Do not rely only on the minimum confidence of values that survived decoding.

## 6. Data preparation is inconsistent across the shipped pipeline

**Reproduced from shipped build metadata, cutter manifests and the current data loaders.**

| Learned part | Messages in its declared input recipe | Relevant difference |
|---|---:|---|
| VSS world/front build (`DATA=spans`, `SHORT` unset) | 21,698 | Includes the two original benchmark span folders; excludes the 3,000 Sonnet/Haiku short messages |
| VSS world cutter | 23,698 | Includes those 3,000 short messages; excludes the two benchmark span folders |
| VSS event cutter | 20,698 | Excludes both groups |
| SOP-BERT `make_data --all` | 24,698 | Includes both groups |

These counts describe loader inputs, not the number of rows used for gradient updates after conversion and calibration splits. Sources: [registry.json](docs/model/micro/registry.json), [shapes8/BUILD.json](docs/model/micro/shapes8/BUILD.json), the registry's two cutter JSON files, [front.py](training/sketch/front.py), [make_data.py](training/neural/make_data.py).

This is not necessarily an accidental choice, but the parts do **not** use one common corpus. A construction the cutter has learned may remain unreadable by the selected world or absent from the event cutter. Comparisons are also not pure architecture comparisons.

The reconstructed SOP-BERT corpus contains **54,584 annotated requests**, of which **21,362 (39.1%)** come from folders named `synth_*`. This is permitted by repository policy and useful for literal commands. It is still a substantial training weight, not merely a small coverage supplement. Training iterates over request rows without an explicit source-balanced sampler. Exact case-insensitive message duplicates account for only 85 excess rows, so exact duplication alone is not demonstrated to be the main problem.

**Recommended correction:** export an explicit input manifest for every learned part, with coverage and effective request weights. Explain intentional differences. Do not blindly deduplicate or rebalance: round 2 changed several things together and lost performance; that does not identify the causal contribution of deduplication alone ([TRAIN_PLAN_R3.md](training/sketch/TRAIN_PLAN_R3.md), section A.2).

## 7. The VSS technique has identifiable limits, but current evidence does not isolate a fundamental capacity failure

**Code-confirmed.** VSS combines learned value/trigger normalization, kind-based routing into a complex vector, role decoding, world selection and context filling. It is not a single model directly learning a full message-to-program transformation.

The front end commits early to one canonical value per matched n-gram. In the shipped shapes front, `wide -> rectangle`, while bare `right of`, `left of`, `two`, `three` and `four` have no entries; no `fill_*` or `layer_*` value is present. These are direct inspections of [shapes8/front.json](docs/model/micro/shapes8/front.json). Request-level co-occurrence is not the same as word meaning: width often accompanies rectangles in the data, but it does not imply rectangle.

The routebook's addresses depend on word-kind sequences, and the state sums bound word vectors ([routebook.js](docs/js/vss/routebook.js), [reader.js](docs/js/vss/reader.js)). Training maximizes vector cosine similarity ([trainer.py](training/vss/experiment/trainer.py)); it does not directly optimize the final cost of an extra action or a wrong target. SOP-BERT's cross-entropy training is also a surrogate objective. Neither loss alone establishes selective execution precision.

The older [EPOCHS.md](training/sketch/EPOCHS.md) experiment improved fit from 65.3% to 67.4% with more epochs, but its own analysis attributes roughly 16.5% of requests to front-end/context losses. Low end-to-end fit therefore cannot, by itself, prove that vector dimension or the VSA algebra is the fundamental bottleneck. Those old single-world numbers are not current nine-world scores.

**Recommended research order:** first measure representability and scoring correctly; then measure the world on faithful targets and gold cuts; only then attribute the remaining errors to routing, decoding, optimization or capacity. A dimension change is an experiment to pre-register, not a demonstrated remedy.

## 8. Confidence is an empirical predictor, not a correctness guarantee

The project already has valuable safeguards: out-of-fold confidence fitting, cost-sensitive thresholds, reader agreement, and UI checks that hold requests depending on unexecuted creates. These should be retained.

However:

- The positive labels currently inherit the scorer's semantic blind spots from findings 1–2.
- Agreement does not imply independent evidence. The learned readers share annotated data, and the combined reader uses a common cut. Both can agree on the same omission.
- The historical [confidence3/RESULT.md](training/sketch/confidence3/RESULT.md) records a concrete distribution change: on its then-unseen synthetic short set, the two learned readers agreed against Rules 23 times and were wrong every time. That is evidence about those older models, not a current error rate.
- The cost-10 threshold maximizes an empirical utility. It is not a certified upper bound on the future confidently-wrong rate.
- `gateTally()` scores filtered outputs from an all-executed reading; it does not replay the UI's dependency gate and resulting state. The code documents this approximation. It can overstate useful coverage when an earlier create is held. Scene replay is therefore essential alongside request-local scores.

**Recommended correction:** fix semantic labels first; then refit on the intended mixture of short commands, long messages and interactive scenes. Report score, wrong/executed, right/requested and AUROC with uncertainty. For scenes, resample by scene rather than treating dependent steps as independent. Keep calibration data distinct from the particular measurement used to judge a proposed change; no secret test set is required.

## 9. Release checks can report failure and still publish artifacts

**Code-confirmed.** In [confidence3/refit.sh](training/sketch/confidence3/refit.sh), failed parity tests fall through to `echo`; the script then stamps the models and prints `done`. `set -e` does not stop these handled failure branches. In [finetune_roles.py](training/neural/finetune_roles.py), a failed Node check can become `agree=None` and training/export still completes.

Separately, [layer_common.mjs](training/sketch/layer_common.mjs), `build()`, accepts an existing cache identified by registry basename without verifying model/data/code content. `REBUILD=1` avoids reuse, but correctness depends on callers remembering it.

**Impact:** these paths can bless mismatched exports or reuse obsolete readings. This review found the failure paths; it did not establish that a shipped release was corrupted by them.

**Recommended correction:** make mandatory parity failures fail the build; key cached readings by actual model, data and relevant code hashes; publish a model bundle only after its checks succeed.

## Recommended order of work

1. **Repair the definition of “right.”** Full executable arguments, explicit numeric scale, identity and order. Add the deterministic cases below to the scoring contract. Remeasure before using old precision claims to justify deployment changes.
2. **Preserve incomplete readings as incomplete.** Conversion failures, omitted explicit values and truncation must be visible to the existing confidence/abstention path.
3. **Validate training coverage and artifact consistency.** Gold-to-label-to-wire round trips; required legend heads; number alignment; per-part input manifests; mandatory parity checks.
4. **Retrain with a fixed protocol and refit confidence.** Change one cause at a time. Evaluate request outcomes and interaction replay, and perform root-cause analysis after each evaluation.
5. **Only then test VSS capacity hypotheses.** Use faithful targets to distinguish limits of the model from preprocessing and decoding errors. Do not infer a VSA failure from a pipeline that has already discarded the answer.

## Reproduction of the scoring findings

Run from the repository root. These are deliberately supplied incorrect outputs, not claims that a reader produced them in these particular sentences. They demonstrate what the current evaluation accepts.

```bash
LLM_SCORE_LIB=1 SEG=gold MODEL=micro/history8 PAIR=value node --input-type=module <<'JS'
import { scoreMessage } from './training/sketch/llm_score.mjs';

const cases = [
  ['extra shape', ['Make Box red.'],
    [{action:'set', target:'Box', color:'red'}],
    [{action:'set', target:'Box', color:'red', shape:'circle'}]],
  ['wrong scale', ['Resize Box by 2.'],
    [{action:'resize', target:'Box', scale:2}],
    [{action:'resize', target:'Box', scale:0.5}]],
  ['wrong order', ['Make Box red.', 'Then make Box blue.'],
    [{action:'set', target:'Box', color:'red'},
     {action:'set', target:'Box', color:'blue'}],
    [{action:'set', target:'Box', color:'blue'},
     {action:'set', target:'Box', color:'red'}]]
];
for (const [name, spans, want, got] of cases) {
  const text = spans.join(' ');
  const row = {text, wires: want.map((args, i) =>
    ({type:'command', args, span:spans[i]}))};
  const nodes = got.map((args, i) => ({id:`n${i}`, type:'command', args,
    span:[text.indexOf(spans[i]), text.indexOf(spans[i]) + spans[i].length]}));
  const s = scoreMessage(nodes, row);
  console.log(name, {right:s.right, wrong:s.wrongAligned, extra:s.extra});
}
JS
```

Observed in this review: `extra shape {right:1, wrong:0, extra:0}`, `wrong scale {right:1, wrong:0, extra:0}`, `wrong order {right:2, wrong:0, extra:0}`. The `history8` model is loaded only because the scoring module requires a model at import; no inference is used in these checks.

Review limits: no full benchmark, new training run or browser replay was performed. Previously recorded gains/losses were not independently reproduced. The frequency of the new semantic scoring failures and their effect on shipped thresholds remain to be measured. Only this report was added to the working tree.
