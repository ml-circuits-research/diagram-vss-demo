# ROLES_ROUNDTRIP: does SOP-BERT's training data decode back into its gold? (2026-11-03)

The SOP-BERT counterpart of `training/sketch/convert_check.py` (VSS: 31% of the synthetic gold was lost on the way into the worlds,
`training/sketch/synth/VSS_SYNTH_DIAGNOSIS.md`). Script: `training/neural/roles_roundtrip.py` + `roles_roundtrip.mjs`.

## Method

1. Rows built exactly as job 071 builds them: `make_roles.py --all` with 071's EXTRA_DIRS (byte-identical `train.jsonl` / `reader.json`,
   checked with `--compare-rows`), plus `--also` for llm_bench/short3 (non-pending wires only) and llm_bench/fresh2/opus_{a,b,c,d}, which
   are labelled with the same layout but not trained on.
2. The gold labels of every row are given to `docs/js/neural.js` as a perfect prediction: one-hot logits of a stand-in model for the
   cut head (make_roles `cut_tags`), the act, every class head at the index the loss trains (`finetune_roles.py` `Layout.class_targets`)
   and the B / I / O tag of every word. The real decoding path runs: `makeReader` (the real distilbert-base-uncased tokenizer, its word
   pieces and its 128 / 512 truncation), then `formalize` / `formalizeJoint` (act_keys, fill / desc heads, the shared context rule
   `nextContext`, as `fresh2/collect_sop.mjs` passes it).
3. The wires are compared with the gold in bench-canon form (`canon` / `canonWant`), paired as `llm_score.mjs` PAIR=value (as job 072).
4. Each gold request that does not come back gets the cause of its first wrong key; each row whose label states something other than its
   gold (a value trained as the "no value" class, a written value left untagged or tagged on the wrong word, a description trained
   without one of its keys or with another role's keys, a key the layout does not learn) is a **silent wrong label**: the model is trained
   to be confidently wrong there.

Columns: *right* = the wire is the gold; *right or reference only* = also the requests whose only difference is a reference the shared
context rule fills ("make it red": the reasoning layer's job, AGENTS.md) or the gold naming a shape created earlier in the message where
every reader writes `$new`; *refused* = gold the layout cannot hold and the engine refuses the decoded request (label="", the group name that
is also a target; see below); *silent wrong labels* = share of rows.

## Result: 071 as queued (gpu-runs 4c21b7d, HEAD code) → after the fixes (working tree)

| folder | trained | requests | round trip right | right or reference only | refused (after) | wrong (after) | missing (after) | silent wrong labels |
|---|---|---|---|---|---|---|---|---|
| llm_train/sonnet_msg | yes | 3127 | 86.4% → 87.9% | 98.0% → 99.8% | 0.0% | 12.0% | 0.1% | 1.9% → 0.0% |
| llm_train/haiku_msg | yes | 2304 | 94.1% → 100.0% | 94.1% → 100.0% | 0.0% | 0.0% | 0.0% | 5.9% → 0.0% |
| llm_train/sonnet_msg2 | yes | 2789 | 92.1% → 93.3% | 98.4% → 99.8% | 0.0% | 6.6% | 0.0% | 1.5% → 0.0% |
| llm_train/haiku_msg2 | yes | 2001 | 98.7% → 99.5% | 99.2% → 100.0% | 0.0% | 0.5% | 0.0% | 0.8% → 0.0% |
| llm_train/sonnet_long | yes | 2562 | 83.9% → 87.2% | 95.5% → 99.8% | 0.0% | 12.8% | 0.0% | 4.4% → 0.1% |
| llm_bench/fresh1/sonnet | yes | 3030 | 92.9% → 94.2% | 98.2% → 99.9% | 0.0% | 5.8% | 0.0% | 1.7% → 0.0% |
| llm_bench/fresh1/haiku | yes | 2514 | 94.3% → 95.7% | 98.5% → 100.0% | 0.0% | 4.3% | 0.0% | 1.4% → 0.0% |
| llm_train/sonnet_short | yes | 1500 | 98.5% → 99.9% | 98.5% → 100.0% | 0.0% | 0.1% | 0.0% | 1.5% → 0.0% |
| llm_train/haiku_short | yes | 1500 | 98.3% → 99.5% | 98.7% → 100.0% | 0.0% | 0.5% | 0.0% | 1.3% → 0.0% |
| llm_train/opus_train_a | yes | 994 | 90.5% → 93.4% | 96.8% → 99.9% | 0.0% | 6.6% | 0.0% | 3.1% → 0.0% |
| llm_train/opus_train_b | yes | 891 | 85.3% → 88.9% | 96.0% → 100.0% | 0.0% | 11.1% | 0.0% | 3.9% → 0.0% |
| llm_train/opus_train_c | yes | 1059 | 86.5% → 89.2% | 96.6% → 100.0% | 0.0% | 10.8% | 0.0% | 3.4% → 0.0% |
| llm_train/opus_train_d | yes | 1015 | 80.4% → 83.3% | 96.7% → 100.0% | 0.0% | 16.7% | 0.0% | 3.3% → 0.0% |
| llm_train/opus_gen_1 | yes | 991 | 88.0% → 90.2% | 97.4% → 99.9% | 0.0% | 9.8% | 0.0% | 2.5% → 0.0% |
| llm_train/opus_gen_2 | yes | 1094 | 89.0% → 91.7% | 97.1% → 100.0% | 0.0% | 8.3% | 0.0% | 2.9% → 0.0% |
| llm_train/synth_rules | yes | 11707 | 96.2% → 98.5% | 97.4% → 99.8% | 0.0% | 1.5% | 0.0% | 2.5% → 0.2% |
| llm_train/synth_rules_ops | yes | 1470 | 65.9% → 85.3% | 67.5% → 87.6% | 12.1% | 14.7% | 0.0% | 20.3% → 0.0% |
| llm_train/synth_rules_ext | yes | 3664 | 98.3% → 99.5% | 98.7% → 99.9% | 0.0% | 0.5% | 0.0% | 0.8% → 0.1% |
| llm_train/ops_formulations | yes | 733 | 98.9% → 99.5% | 99.5% → 100.0% | 0.0% | 0.5% | 0.0% | 0.5% → 0.0% |
| llm_train/opus_ext_1 | yes | 743 | 89.6% → 91.4% | 96.0% → 97.7% | 1.1% | 8.6% | 0.0% | 1.6% → 0.1% |
| llm_train/synth_combo | yes | 4521 | 98.5% → 99.7% | 98.5% → 99.7% | 0.0% | 0.3% | 0.0% | 1.5% → 0.3% |
| llm_bench/sonnet_spans | yes | 2173 | 87.9% → 90.1% | 97.3% → 99.9% | 0.0% | 9.9% | 0.0% | 2.5% → 0.0% |
| llm_bench/haiku_spans | yes | 2202 | 94.3% → 99.2% | 94.9% → 100.0% | 0.0% | 0.8% | 0.0% | 5.0% → 0.0% |
| llm_bench/short3 | no | 650 | 92.8% → 95.7% | 95.1% → 98.0% | 0.6% | 4.3% | 0.0% | 3.2% → 0.3% |
| llm_bench/fresh2/opus_a | no | 514 | 85.6% → 87.9% | 97.1% → 99.8% | 0.0% | 12.1% | 0.0% | 2.9% → 0.2% |
| llm_bench/fresh2/opus_b | no | 468 | 89.3% → 91.5% | 97.2% → 99.8% | 0.0% | 8.5% | 0.0% | 2.6% → 0.0% |
| llm_bench/fresh2/opus_c | no | 471 | 92.6% → 94.3% | 98.1% → 100.0% | 0.0% | 5.7% | 0.0% | 1.9% → 0.0% |
| llm_bench/fresh2/opus_d | no | 456 | 88.6% → 90.8% | 97.8% → 100.0% | 0.0% | 9.2% | 0.0% | 2.2% → 0.0% |
| **ALL trained folders** | yes | 54584 | **92.7% → 95.3%** | **96.7% → 99.5%** | 0.3% | 4.7% | 0.0% | **2.8% → 0.1%** |

No request is dropped from the rows (every annotated non-pending wire of these folders has its span in the text and its act in the act
set); the cut tags lose or merge 5 spans of 57,143 (sm-0070, sm-0194, sm-0394: spans that overlap another span). The `wrong` column after
the fixes is almost all the shared context rule (below), which is not in the labels.

## Causes (gold requests that do not come back; all folders, first wrong key)

| cause | before | after | where |
|---|---|---|---|
| shared context rule gives another shape, gold a list ("link them all from Api") | 1304 | 1304 | context rule (not a label) |
| shared context rule gives another shape, gold one shape ("make it large", first request of the message) | 1146 | 1149 | context rule (not a label) |
| **value "none" trained as the "no value" class: arrow=none (a plain line), outline=none** | 1034 | 0 | finetune_roles.py class_targets (fixed) |
| label="" (remove a label): no word to tag | 149 | 149 | layout; the engine asks "What should the label say?" |
| **at (legend kind point) not learned** | 105 | 0 | make_roles.py SPAN_KINDS (fixed) |
| **position2 / anchor2 / region not learned** (engine keys outside the legend questions) | 146 | 0 | make_roles.py + neural.js SAME_AS (fixed) |
| **two described roles share one description** ("move the triangles right of the gray rect") | 134 | 1 | desc2:<key> heads (fixed) |
| description beside names in one role ("Make both desks brown": Desk,mention(recency=newest)) | 41 | 41 | layout (fill is one class) |
| one word for two keys: group name also a target ("Move Scene3 into Intake") | 40 | 40 | B/I/O: one tag per word; the engine refuses a group of one shape |
| **list items tagged on the wrong word** ("build a dawn of Training, Launch, Build": the verb "build" tagged as the item Build; self-corrections) | 30 + 18 | 4 + 11 | make_roles.py find_part (fixed: in order, case first) |
| **name tags misaligned**, mostly a name taken by a number word found by co-occurrence ("Slide Day to the left": Day tagged distance=100; "then Box3 too": Box3 tagged distance) | 37 | 5 | make_roles.py: numbers aligned last (fixed) |
| gold writes the name of a shape created earlier where the decoder writes $new | 27 | 27 | gold convention / scorer, not the labels |
| a label with a comma split into two ("label Persona 'Maria, 34'") | 7 | 1 | make_roles.py: a text is one value (fixed) |
| "help" topic / aspect / about, template, kind | 0 | 0 | - |
| parents repeated more often than written (org charts: 5), items listed bottom-up in the gold (pyramids: 4) | 9 | 9 | layout |
| undo count, disconnect target (short3 only, no training row has them) | 6 | 6 | data |

Per key (after): the gold keys still lost by the labels are `label` (label="", 149), `target` (41 description + names, 40 group, 5),
`from` / `to` (11 list order, 7 $new), `parents` / `items` (9), `count` / `distance` / `scale` (6).

## Silent wrong labels (rows)

Before (071 as queued), 2.8% of the trained rows: arrow=none trained as "no arrow value" 1129, outline=none 18, position2 / anchor2 120 /
120, at 106, region 65, a second described role decoded with the first role's description 133 (88 + 46 rows whose desc label is another
role's), names beside a description 41, values written but tagged on another word / not tagged 19, number words mapped to another number 2.
After: 0.1% (46 trained rows: 41 description beside names in one role, 5 values written but not tagged), every trained folder ≤ 0.3%.

Rows the layout cannot hold but whose decoded request the engine refuses (not executed wrong; counted apart): label="" 146 and the group
name that is also a target 44 (synth_rules_ops 12.1% of its rows, opus_ext_1 1.1%).

## Fixes (working tree; no switch)

1. `finetune_roles.py` `Layout.class_targets`: a gold value spelled "none" is its own class (index ≥ 1); before, `vals.index("none")` found
   the leading "no value" class, so every arrow=none / outline=none row taught "no value" (1147 rows; "connect A to B with a line" would
   always come out as an arrow).
2. `make_roles.py` alignment (`find_part`): the parts of a list are looked for in their order and in the gold's case first; a text (label,
   title) is one value even with a comma; the number keys are aligned after the name keys (a co-occurrence number word never takes a
   name); a number with a unit glued on ("50px") is aligned to that word.
3. `make_roles.py` + `docs/js/neural.js`: `at` (legend kind point: one span per coordinate, decoded "x,y"), and `position2`, `anchor2`,
   `region` (engine keys, read with the legend question named in neural.js `SAME_AS`: position, anchor, position) are learned.
4. `make_roles.py` + `neural.js` + `neural-confidence.js`, `fresh2/collect_sop.mjs`, `precision_bert_collect.mjs`: a second described
   role has its own heads `desc2:<key>` (reader.json `desc2_keys`); a model without them reads `desc:<key>` for every role, as before.
   This adds 5 class heads (40 instead of 35 class keys); the class loss is their mean, so each head's weight is 7/8 of before.

The shipped model cannot decode differently: neural.js reads the new keys and heads only when the model's reader has them. Checked:
docs/model/neural/sop-bert decoded by HEAD's neural.js and by the working tree's: identical wires, notes and per-key reads on 1400 of 1400
messages (short3, fresh2, synth_rules_ops); `test_neural_confidence.mjs` PASS; `test_neural_gate_ui.py` PASS.

## The smoke-run oddity (classes 19/50 torch vs node)

Not a class-order or vocabulary mismatch. The order of the class heads comes from one list (make_roles.py reader.json `classes` ->
finetune_roles.py Layout -> config.json `reader` -> neural.js makeReader), and the tiny CPU run (finetune_roles.py --base tiny, 440 rows, 25
steps, then the export) decoded by neural.js on the **fp32** ONNX graph matches torch on every request: word pieces, act, classes and tags
50/50, cut 20/20 (on the final rows with desc2 / position2 / at heads: 30/30 and 20/20). On the q8 graph the same run gives classes 48/50,
tags 44/50, cut 16/20: an untrained model's near-tied logits flip under 8-bit quantization. `check_roles_node.mjs` now takes `DTYPE=fp32`
for this check.

## Gate in job 071

After make_roles, before the GPU: `roles_roundtrip.py --compare-rows $FT/roles_all_ALL --gate 95 1`. It stops the job if a trained folder
comes back right, reference-only or refused for less than 95% of its gold requests, or if more than 1% of its rows carry a silent wrong
label. 95%: after the fixes every trained folder is at ≥ 97.7% right-or-reference (synth_rules_ops 99.7% with its refused label="" and
group requests); 071 as queued had 10 of 22 folders between 94.1% and 98.0% and synth_rules_ops at 67.5%, so 95% separates a working
pipeline from a broken one with a 2.7-point margin, and a loss of the VSS size (31%) stops the job at once. With HEAD's code the gate stops
(22 folders fail, most on the 1% silent rule); with the working tree it passes.

## Not fixed (need a decision)

- The shared context rule: 2453 requests (4.3%) whose gold resolves a pronoun to a list or to a shape the rule does not hold. Not in the
  labels; the same rule for every reader.
- label="" (149) and the group name that is also a target (40): the engine refuses them. A head for "remove the label" would need a
  decision.
- A role that is a description beside names (41): fill is one class per role.
