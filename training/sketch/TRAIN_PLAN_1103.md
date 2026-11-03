# TRAIN_PLAN_1103: one set of GPU jobs that teaches the learned readers the forms of 2026-11-02 (written 2026-11-03)

Forms (LEGEND_EXT.md, HIGH_LEVEL_OPS.md, LABEL_CONVENTIONS.md last section): free text (`shape=text`); templates (`template`, `items`,
`items2`, `parents`, `scheme`, `title`); panels (`width`, `height`, `fill`, `layer`); help questions (`question ask=help topic aspect about`);
the layout operations (improve, respace, snap, fit, flip, sort, groupBy, equalize, straighten, untangle, reverse; `arrange layout=tree|layers|
radial|organic`, `align direction=`, arrow restyle `set / resize from= to=` or `kind=edge quantifier=all`); arrow labels (`label from= to=`,
`label=""`, property=label of an arrow); create with a layout. Nothing here has been trained on the GPU yet; the numbers below are a dry
build of the data and CPU smoke runs (EPOCHS=1, a few hundred rows), which show that the code paths work, not how well the readers read.

## 0. Update 2026-11-03 morning: the conversion fix (training/sketch/synth/CONVERT_FIX.md, VSS_SYNTH_DIAGNOSIS.md)

The diagnosis of arm VSS-G+S found that much of the gold never reached the worlds in a learnable form (31% of synth_rules requests became
rows that cannot produce their gold; with LEGEND_EXT=1 alone, 4.1% of them became "every shape": "remove all the stars" -> delete
mention(quantifier=all)). Job 070 now runs with three switches (each off by default; all off = every build byte-identical to before):

| switch | what it changes |
|---|---|
| `VAL_PICK=specific` (front.py learn_values) | a value n-gram stands for the most specific value that passes the bars, not the most frequent one ("circles" -> circles, not the quantifier `all`); a longer n-gram that refines a kept one is kept ("not orange" -> not_orange although "not" -> all) |
| `LEGEND_EXT=1` (llm_to_world.py, extended) | a description is never written broader than its gold (no shape word or a lost filter -> the role is left out, never "every shape"); new roles outline (a colour token or no_outline), x / y (at "x,y"), linked (a shape), the undo / redo count (quantity); generate.ROLES += outline, x, y, linked; docs/js/vss-adapter.js reads them |
| `DIAGRAM_OPS=1` (existing) | groups (group, ungroup in manage; members, groupOf in questions: `worlds_micro/GROUPS_8ops.json`, `GROUPS_EVENTS_8ops.json`) and double positions (position2 / anchor2, a region with a relation) |

Before training, 070 runs `training/sketch/convert_check.py` (the share of each folder's requests whose world row reproduces the gold through
the browser adapter, the "every shape" share, the "no world" share) and stops if a trained folder's "every shape" share is above 1%.
Round trip (share of requests), 070's data, fronts learned as msg_to_world learns them:

| folder | requests | 070 as drafted (LEGEND_EXT=1) | 070 now (+ VAL_PICK, DIAGRAM_OPS, new roles) | every shape before -> now |
|---|---|---|---|---|
| base (DATA=spans, 9 folders) | 22702 | 80.0% | 80.3% | 0.3% -> 0.0% |
| G folders (opus_train_a..d, opus_gen_1/2) | 6044 | 69.1-76.1% | 69.9-76.1% | 0.2-1.3% -> 0.0% |
| synth_rules | 11707 | 72.5% | 79.3% | 4.1% -> 0.0% |
| synth_rules_ops | 1470 | 35.4% (21.1% in no world) | 76.5% (0.0%) | 0 -> 0 |
| synth_rules_ext | 3664 | 80.6% | 82.2% | 1.3% -> 0.0% |
| ops_formulations | 733 | 59.1% | 62.1% | 4.5% -> 0.0% |
| opus_ext_1 | 743 | 47.4% | 47.1% | 0.3% -> 0.0% |
| synth_combo | 4521 | 72.2% | 79.0% | 4.2% -> 0.0% |
| short3 (no pending; not trained) | 644 | 55.7% (shipped worlds: 41.9%) | 60.6% | 1.2% -> 0.0% |
| fresh2 (not trained) | 1909 | 71.2% (shipped worlds: 71.5%) | 72.0% | 0.9% -> 0.0% |

So synth_rules_ops stays in EXTRA_DIRS (most of it is now convertible). Sections 1-6 below are the plan as first drafted; where they say
"GROUPS_8", "DIAGRAM_OPS stays off" or "groups are in no world", job 070 now uses GROUPS_8ops with DIAGRAM_OPS=1.

## 1. Decisions

**One switch, `LEGEND_EXT=1`** (default off: every earlier build is byte-for-byte as before, as with DIAGRAM_OPS). It is set by the jobs and
recorded in each world's BUILD.json. `generate.py` adds the events and roles in place, `front.py` the value tables (read from the legend
itself: `legend_ext/legend_values.json`, exported from `docs/js/logic.js` by `legend_ext/export_legend_values.mjs`), `llm_to_world.py` the
conversion of the gold.

**Worlds** (`worlds_micro/GROUPS_8.json`, 9 worlds, 47 events):

| world | events | why |
|---|---|---|
| shapes | create, set, resize, fact, rule | templates and free text are values of `create` (LEGEND_EXT.md section 1: a template is a value, not a verb); arrow restyle is `set` / `resize` with the arrow's ends |
| links | connect, disconnect, **reverse** | reverse names an arrow by its ends, the roles of disconnect |
| position | move, swap, arrange, align, distribute, toFront, toBack | `arrange template=`, `arrange layout=tree...`, `align direction=` are new values / roles of existing events |
| **layout** (new) | improve, respace, snap, fit, flip, sort, groupBy, equalize, straighten, untangle | whole-diagram operations with the same roles: a target that is mostly everything, plus one value |
| graphq, questions, manage, history | as GROUPS_7 | questions: property / count / list of arrows; manage: `label from= to=`, `label=""` |
| **help** (new) | help | a world that answers instead of drawing: its leads (how do I, can I, what kinds of) come before words of every other world, so it is told apart by the question form |

Measured, not guessed (`action_confusion.py`, the cutter perceptron with one B label per event, on the new folders: synth_rules*,
ops_formulations, opus_ext_1, synth_combo; 12130 training / 3128 test messages, 4716 test requests, 51 events): the operations are confused
with set / resize (equalize/set 5, equalize/resize 3, straighten/set 3) and among themselves (improve/fit, improve/untangle, snap/fit) more
than with the position events (4 in all). Confusions inside one world: 57.7% with the layout world, 60.7% with the ten operations inside
position (8 of 272 confusions more). The layout world keeps position at 7 events (a smaller world fits its own data better) at the cost of
those 8 cross-world cases, which the router's 3 candidate worlds read anyway. help is confused with no event in particular (164 test
requests, 94.5% read as help; the rest spread over 8 events).

**Not in any world** (as first drafted; replaced by section 0: DIAGRAM_OPS=1, GROUPS_8ops): group / ungroup / members / groupOf (310 requests of synth_rules_ops). DIAGRAM_OPS stays off, as in the shipped chain
(one change at a time); the world cutter and the event cutter leave out the 305 messages that hold them (a request with no B label; counted in
the cutter file, `left_out_no_legend_event`). SOP-BERT reads them (its acts follow the legend).

**How the new keys are written in a VSS world** (`llm_to_world.py`, LEGEND_EXT block):

| form | world tokens / roles |
|---|---|
| enum keys template, scheme, fill, layer, topic, aspect, property, kind | value roles; the token is a prefix + the value (`tpl_timeline`, `sch_warm`, `tp_to_front`, `asp_how`, `prop_name`, `kind_edge`), because the values collide with other words of the legend (template tree / layout tree, topic connect / the verb, topic red / the colour, fill none / arrow none). The front end learns which words write them, as for every value. `docs/js/vss-adapter.js extValue` decodes them |
| items, items2, parents | set roles (like members): one member per item, its name token (`n_*`) or quoted text (`t_*`), joined with "," in text order by the adapter |
| title | a text role, as a label |
| width, height | numbers |
| shape=text | the shape word `text` (plural `texts`): "add a title "Q3"" -> the front learns title -> text |
| label="" | the value token `no_label` (role text) |
| kind=edge, quantifier=all | the value roles `kind` (kind_edge: "how many arrows" keeps the edge word through the trigger rule) and `quantifier` (all) |
| an arrow by its ends (set / resize / label / property / reverse) | roles source / target (a list keeps its first shape; 11 such requests) |
| ops | target (object / members), axis, comparison, distance -> amount, fit position -> region, property, superlative, layout, anchor -> landmark |
| "the whole diagram" | the quantifier token `all` as the head of the mention when no shape word or pronoun is there |
| help `about` | NOT a role: the words of `about` are by definition outside the legend; an unknown word has no kind a VSS role can bind. Left out and counted (148) |

## 2. Data (dry build, 2026-11-03, `msg_to_world.py`, EXTRA_DIRS = G folders + synth_rules + synth_rules_ops + synth_rules_ext + ops_formulations + opus_ext_1 + synth_combo; 21698 messages, 51584 requests with a span)

| world | rows | shipped rows (G) | values left out (by kind) |
|---|---|---|---|
| shapes | 15919 | 8047 | TEMPLATE 38, SCHEME 32, KIND 27, FILL 4, LAYER 3, LAYOUT 12 (+ older kinds); items 100 (an item of several words has no single token) |
| position | 10143 | 5711 | TEMPLATE 144 of 200 arrange-template values: too few per template for the front's value thresholds (count 5, precision 0.8) |
| questions | 7432 | 4824 | KIND 13 |
| links | 6680 | 4741 | (as before: PAIR 850) |
| graphq | 4905 | 3406 | - |
| manage | 3678 | 1295 | NOLABEL 40 of 146 |
| history | 901 | 585 | - |
| help | 847 | - | ASPECT 126, TOPIC 154 (the lead's words also become aspect tokens, e.g. "how do I delete" -> asp_how x3, so topic delete is lost); about 148 |
| layout | 501 | - | PROP 13, AXIS 3, POS 17 (center is the fit trigger itself) |

SOP-BERT rows (`make_roles.py --all`): 54584 request rows (24698 messages), 52 acts, 23 class keys (topic 109 values, template 24,
aspect 5, scheme 12, kind 2, quantifier 1, property 7, layer 2, fill 1 ...), 15 span keys (items 4489/4489 aligned, items2 35/35, parents
6/12, title 270/273, about 148/148).

## 3. Code changed (see the report of the coordinator's diff for the full list)

- `training/sketch/generate.py`: LEGEND_EXT events and roles.
- `training/sketch/front.py`: LEGEND_EXT value tables (prefix tokens, text, new layouts, arrow forward, no_label, quantifier all; the
  property question's own key is read by its pseudo-verb, not as a value).
- `training/sketch/llm_to_world.py`: the conversion of section 1.
- `training/sketch/msg_to_world.py`: items / items2 / parents are set roles of the legend (when present).
- `training/sketch/train_micro.sh`: passes LEGEND_EXT, records it in BUILD.json.
- `training/sketch/train_cutter.py`: a message with a request whose event is no legend event is left out (counted); before, such a request
  got a B-fallback label that was trained but never decoded. No change for data without such requests (the shipped data).
- `training/sketch/worlds_micro/GROUPS_8.json`, `GROUPS_EVENTS_8.json` (new; GROUPS_7 / GROUPS_EVENTS unchanged).
- `training/sketch/legend_ext/export_legend_values.mjs`, `legend_values.json` (new).
- `docs/js/vss-adapter.js`: the new events (help, ops, reverse) and roles -> SOP Lang; `extValue`; a create that read a template, items or a
  title gets no default shape (circle). A shipped model never produces these roles: its wires are identical on sample1000 + short3 (section 4).
  `docs/js/vss-composer.js` needs no change (the smoke ran it unchanged).
- `training/neural/make_roles.py`: legend kind `texts` (items, items2, parents) is a span key (one B-/I- span per item).
- `docs/js/neural.js`: acts improve ... untangle, reverse, group, ungroup, help, members, groupOf (make_data.py / make_roles.py read the act
  set from here); a `texts` key is decoded as the spans joined with ","; `anchor` is kept without a position for arrange (root) and equalize
  (model).
- `training/sketch/fresh2/verdicts.mjs`: `--json` (per-arm numbers and both readers' paired differences); without it, unchanged.
- `training/laptop/jobs_draft/070_vss_all.sh`, `071_bert_all.sh`, `072_measure.sh` (new).

## 4. Smoke runs (CPU, one core, this machine)

All with LEGEND_EXT=1 and the full EXTRA_DIRS unless said; outputs removed afterwards (nothing of them is in the diff). They show that each
step runs and passes the new forms through; the readers are untrained (1 epoch, a few hundred rows), so their reading quality says nothing.

| step | command | result |
|---|---|---|
| data, 9 worlds | `msg_to_world.py` (dry, section 2) | every world builds; `sop check` passes the legends |
| train + export, 9 worlds | `train_micro.sh smoke_<world>` with FRAC 0.02-0.5 (242-329 rows), EPOCHS=1, N_EVAL=20, FAST=1 FAST_MEM_MB=256, DEVICE=cpu, one thread | all exit 0 in 15-37 s each; export (sparse, stars generated) with front.json and BUILD.json (LEGEND_EXT recorded) |
| world cutter, event cutter | `train_cutter.py --worlds GROUPS_8.json` / `GROUPS_EVENTS_8.json` (main() with its DIRS replaced by 5 small folders, 5552 messages) | 9 / 47 B labels, no fallback; 305 messages with group requests left out and counted; event cutter 2 min 18 s for 80k tokens |
| composer in node | `llm_score.mjs` vssFormalize (as `fresh2/collect_vss.mjs` loads it) on a smoke registry of the 9 worlds + both cutters + the shipped context filler, 60 + 18 messages of opus_ext_1, synth_rules_ext, ops_formulations, synth_rules_ops | new wires produced: `question ask=help aspect=...` (8), untangle, equalize (`property`, `anchor`), straighten, groupBy, snap, improve, fit (`position=center`), reverse (`from`, `to`), `align direction=left`, `arrange layout=layers`, `property property=label`, `create shape=text label=...`, `create ... items=Feedback,Awareness,Basics,Sales` and `title=` (set roles of texts read end to end) |
| collectors | `fresh2/collect_vss.mjs` on the smoke registry + a smoke context filler; `collect_sop.mjs` on the smoke SOP-BERT | both run; the VSS outcomes are checked against llm_score's tally by the collector itself |
| context filler | `train_context.mjs` on the smoke registry (1700 messages of 3 folders) | exit 0 in 73 s, weights written |
| adapter, shipped output | the shipped composer (docs/model/micro/registry.json) on sample1000 + short3 (1530 messages), with the new and with the HEAD `vss-adapter.js` | **identical wires on all 1530 messages** |
| adapter, new forms | `toNodes` on hand-made readings | `create template=timeline items=Q1,Q2 title=Plan`, `question ask=help topic=toFront aspect=how`, `set style=dashed kind=edge quantifier=all`, `improve target=mention(quantifier=all)`, `label from=A to=B label=""`, `create shape=text size=large label=Q3` |
| SOP-BERT rows | `make_data.py --all`, `make_roles.py --all` (full data) | 52 acts, 54584 request rows, 24698 cut messages; class heads template, topic, aspect, scheme, kind, quantifier, property, fill, layer; span heads items, items2, parents, title, about |
| SOP-BERT train + export | `finetune_roles.py --base tiny` (distilbert-base-uncased cannot be downloaded here: huggingface.co is blocked) on a 440-row slice, 25 steps, CPU | exit 0 in 20 s; ONNX + q8 export; `check_roles_node.mjs`: word pieces 50/50, act 50/50, tags 46/50, cut 18/20, classes 19/50 (an untrained tiny model's near-tied class logits flip under q8; not a decoding difference) |
| SOP-BERT in node | `neural.js` formalize with the smoke model (loads, reads), and with reads of the shape makeReader returns | `question ask=help aspect=how topic=connect`, `create template=timeline items=Q1,Q2,Q3 title=2027`, `set kind=edge quantifier=all style=dashed`, `sort property=name`; act_keys of help = about, aspect, topic |
| verdicts --json, COMPARE.md | `verdicts.mjs --json` on the FEEDBACK_PLAN records of jobs 062/064/065/066 (stand-in), then the job's table code | runs; VSS-G 12.9 [9.2, 16.5] as in the registry's note; the table renders |

## 5. GPU jobs (training/laptop/jobs_draft/; to be copied to jobs/ of the gpu-runs branch after the code is on it)

| job | what | after | expected time on the RTX 3050 Ti (3.7 GB) |
|---|---|---|---|
| 070_vss_all | conversion gate (convert_check.py, stop above 1% "every shape"), 9 worlds of GROUPS_8ops (LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1, FAST=1 FAST_MEM_MB=256, WORLD_PAR=2, VSA_MEM_FRACTION 0.35, a failed world retried alone at 0.85), world cutter (SHORT=1, GROUPS_8ops) and event cutter (GROUPS_EVENTS_8ops) on CPU in parallel, registry_ALL.json, context filler, a smoke read; everything to docs/model/arms/ALL/ | - | worlds ~35 min (~55 min if shapes and links need the 0.85 retry, as in job 061/065), cutters ~25-30 min in parallel, context filler ~15-20 min: **~60-80 min** |
| 071_bert_all | make_data / make_roles --all, finetune_roles.py (job 062 recipe: 8 epochs, lr 6e-5, bs 32, fp16) -> docs/model/arms/ALL/neural/sop-bert-ALL, node check | - (waits for every GPU slot: runs when no world trains) | ~190 s per epoch (062: 100 s on 31.7k rows + 9.4k messages; now 54.6k + 24.7k): **~30 min** + the wait |
| 072_measure | the conversion ceiling of the shipped and the new worlds on short3 / fresh2 (convert_check.py --registry); collectors (shipped and new VSS, shipped and new SOP-BERT, Rules) on fresh2 and short3 (minus the 17 messages with a pending wire); fit_report per pair; verdicts.mjs --json (paired bootstrap, 1000 resamples); COMPARE.md (rows situations, columns readers, cost score); confidence3/refit.sh on the new readers, copies to docs/model/arms/ALL/confidence, shipped files restored | 070, 071 | **~20-25 min** (CPU) |

Scaling basis: job 065 world times (shapes7c 8047 rows 419 s alone at 0.85, links7 534 s, position7 357 s, questions7 / graphq7 ~207 s,
manage7 75 s, history7 23 s), job 061 cutters (< 6 min on 6440 messages), job 065 context filler (284 s), job 062 SOP-BERT (100 s per
epoch). The whole chain with MAXJOBS=2: **~2-2.5 hours**.

## 6. Risks

1. **Memory**: shapes (15919 rows, 2x) and links ran out of the 0.35 cap in job 061 with half the rows. FAST_MEM_MB=256 bounds a step; the
   end-of-run eval / export peak (2.8-4.3 GB RSS) grows with the rows. The 0.85 retry is there; if a world still fails, its log says so and the
   job stops before the registry.
2. **The help world's front end**: the value learner turns every word of a lead into an aspect token and sometimes swallows the topic
   ("how do I delete" -> asp_how asp_how asp_how); 154 topic values are not in the normalized spans. A help reading may then have no topic: the
   engine answers the aspect in general. Not wrong, less useful.
3. **`about` is not read by VSS** (148 requests): "can I add images?" comes out without about=images; SOP-BERT reads it (span head).
4. **Templates in position**: 144 of 200 `arrange template=` values are lost (too few examples per template for the value thresholds); VSS
   will mostly read arrange-with-template as arrange without a template.
5. **Multi-word items** ("Build MVP", lower-case items) have no single VSS token: 100 item values lost in shapes; VSS writes the items it
   can bind, so a template's item list can come out short (a wrong request, not an ask) unless the confidence catches it.
6. **Groups** (310 requests): as first drafted, trained by SOP-BERT only. Now (section 0) DIAGRAM_OPS=1 puts them in manage / questions; the
   shipped context filler knows nothing of group / ungroup (ROUND2.md: it asked about 5 of 741 such units), and the retrained filler of
   070 learns them from the data.
14. **The new roles of section 0** are learned from little data: outline 64 + 15 requests, at 98 + 8, linked 72 + 1 (synth_rules_ops +
   short3); several short3 forms have no learned trigger ("outline start black", "start: red border", "go back three steps"), so their
   rows have no event token (the round trip counts them as "no event token").
7. **label=""** is a learned value (no_label): 40 of 146 not found in the spans (the remove phrase is the trigger).
8. **Confidence**: the new readers' thresholds come from refit.sh on fresh2 + short3 calibration parts; few of those messages use the new forms,
   so the confidence of the new forms is fitted on little data. The confidence files are written to docs/model/arms/ALL/confidence and
   must be copied to docs/model/confidence only when the arm is adopted.
9. **SOP-BERT topic head**: 109 of 217 topics occur in training; the others cannot be produced (the head has no class for them).
10. **A shipped-output change in the adapter** (section 3: heads `text` and `all`): checked on the 1000-message sample with the shipped
    registry (section 4).
11. **Items are entity keys of the context filler** (they are set roles, like members): when a template create reads no items, the filler
    may treat them as a gap; it learns from the gold (whose items are never context shapes) to leave it, so the request is asked, but this was
    only seen in a 1700-message smoke.
12. The cutter and context-filler times are scaled from smaller data; on this 2-core Xeon the event cutter took 2.3 min for 80k tokens.
13. The data synth_rules* was checked against a logic.js snapshot; if the Rules change again before the run, regenerate first (SYNTH_PLAN.md).

## 7. Applying the diff (coordinator)

```
WT=/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/wt_prep
git -C $WT diff HEAD > patch                      # the 10 tracked files (HEAD = 23617e2)
# new files (git status shows the first four; worlds_micro/ is in .gitignore, so the two GROUPS files need `git add -f`, as GROUPS_7.json had):
#   training/laptop/jobs_draft/070_vss_all.sh 071_bert_all.sh 072_measure.sh
#   training/sketch/TRAIN_PLAN_1103.md
#   training/sketch/legend_ext/export_legend_values.mjs  training/sketch/legend_ext/legend_values.json
#   training/sketch/worlds_micro/GROUPS_8.json  training/sketch/worlds_micro/GROUPS_EVENTS_8.json
```
The jobs need this code on the gpu-runs branch before they are copied to `jobs/` there.
