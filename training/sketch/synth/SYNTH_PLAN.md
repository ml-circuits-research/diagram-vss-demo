# SYNTH_PLAN: does training on synth_rules make the learned readers do short commands as well as the Rules? (proposal, not run)

Written 2026-11-02 by the synth agent, before any arm is trained. A proposal for the coordinator and the owner: nothing below has been run.
Once the owner accepts it, nothing changes before the first result (AGENTS.md "Experiments").

## Hypothesis

People with a problem fall back to short, literal commands (owner, 2026-11-02 22:04). The learned readers miss many of the short commands
the Rules read (RULES_VS_LEARNED.md: rare cue words, descriptions in roles, whole-diagram objects, features absent from training; the VSS
worlds trained on 709 one-request messages). Adding `llm_train/synth_rules` (7822 short messages, 10755 requests, every Rules cue word in at
least 5 requests, gold equal to the Rules' reading) to the shipped G data raises each learned reader's cost score on realistic short commands
written by someone else, without lowering it on long messages.

## Arms (one change: the data)

| arm | data | reader |
|---|---|---|
| VSS-G | the shipped G data (training/neural/ALL_DATA.md + EXTRA_DIRS of docs/model/micro/registry.json: opus_train_a..d, opus_gen_1, opus_gen_2) | the shipped models (jobs 061/065); FAST=1 is byte-identical to the shipped training (FAST_TRAIN.md), so G is not retrained |
| VSS-G+S | G + `llm_train/synth_rules` | retrained, every learned part |
| BERT-G | the same G data | the shipped SOP-BERT (job 062) |
| BERT-G+S | G + `llm_train/synth_rules` | retrained, the shipped recipe |

Not in these arms (each a later plan of its own, one change at a time): `llm_train/synth_combo` (the proofread 2-5 request combinations),
`llm_train/synth_rules_ops` (groups, double positions, outline, coordinates, linked, arrow labels, create + layout: needs DIAGRAM_OPS=1 and
converter support for outline / at / linked / layout / label with from-to, which llm_to_world.py does not read today), and SHORT=1 for the
VSS worlds (llm_train/{sonnet,haiku}_short in the world data).

**The VSS worlds must train on the synthetic one-liners, not only the cutter.** EXTRA_DIRS does that: `front.py train_dirs()` appends it,
`msg_to_world.py` builds every world's rows from `FR.load_msgs()` (= train_dirs), and the same list reaches `train_cutter.py`, the context
filler (`micro_tools.py DIRS`, `layer_common.mjs dirsAll`) and `training/neural/make_data.py` / `make_roles.py`. Check before training, per
world: BUILD.json records EXTRA_DIRS with `llm_train/synth_rules`, and `worlds_micro/<world>/raw/sentences.txt` has more rows than the G
build (expected: about +8000 one-request rows in all, most in shapes7c, position7, links7, questions7). A world whose row count did not grow
is a failed build, not a result.

## Validation sets

1. **Realistic short commands written blind (the measure that matters).** ~500 one-line commands, written by Opus agents (model Opus, effort
   high) who have read neither logic.js, nor the generators, nor any training or test set. Brief (written before writing starts, saved with
   the set): "you are a person using a chat-based diagram editor, typing short, literal commands, often because a longer request failed";
   the legend in plain words (what the editor can do: the 21 actions, the 17 questions, facts, default rules; shapes, colours, sizes,
   positions, arrows and lines, layout), with no list of synonyms; personas (engineers, students, non-native speakers, people in a hurry,
   voice dictation); about 1 command in 4 with a description instead of a name ("the red circle", "all the boxes", "everything"), about
   1 in 10 with two requests, typos as people make them; every action and question at least 8 times. Five writers x 100, each with a
   different persona mix. Texts saved before annotation (`texts/texts_NN.jsonl`, ids and texts only); annotation by LABEL_CONVENTIONS.md
   (and the coordinator's decisions of 2026-11-02) in a second pass, then the label check (`training/sketch/review_data.py` style) and the
   check that annotated texts equal the saved ones. Split: calibration = int(sha256(id), 16) % 3 == 0 (as fresh2), test = the rest.
   Overlap check against synth_rules before use: `python3 training/sketch/synth/check_file.py <set> /tmp/x --mode report` (it lists exact and
   token-set copies; none expected, since synth_rules already removed everything equal to short3 / llm_short / fresh2).
   Note: `llm_bench/short3` (530 messages, one Opus writer, written blind, 156 of 666 gold requests pending) already exists; it can be one of
   the five writers' parts if the coordinator checks that its brief matches the one above, or the set is written fresh as `short4`.
2. **fresh2 test part** (405 messages, 1313 requests, the long-message writer nobody trained on): regression check for long messages.
3. **The six template sets** (hand, blind, broad, seen, new_identities, heldout_formulations): coverage only. They were written or generated
   from the Rules' own cues and templates, as synth_rules was; after training on synth_rules they no longer measure generalisation.
4. llm_short: reported, flagged: it is SOP-BERT's training data, and the VSS cutter's.

## Measure (fixed now)

- Per requested action, for each reader: right / wrong / not done (asked or not produced), plus extras (executed, nobody asked); the Rules
  beside them (executing everything).
- **Cost score** (owner, 2026-11-02 19:09): (right − 10 × (executed wrong + extras executed)) per 100 requested actions; asked = 0.
  Each learned arm's threshold is the one that maximises the score on the calibration data, fitted once with the fresh2 recipe
  (`fresh2/fit_report.mjs`) on the union of the short set's calibration part and the fresh2 calibration part (195 messages); the same
  threshold is used on both test parts. Beside the score: confidently-wrong rate, share done right, AUROC of the confidence.
- Paired bootstrap, 1000 resamples of test messages, 95% intervals.
- Verdicts (fixed now):
  - **S helps VSS on short commands**: VSS-G+S − VSS-G, cost score on the short test part, interval above 0.
  - **S helps SOP-BERT on short commands**: BERT-G+S − BERT-G, same rule.
  - **No harm on long messages**: for each reader, the fresh2 test part difference has its interval's upper bound >= 0 (harm = the whole
    interval below 0).
  - Reported, not a verdict: each G+S arm against the Rules on the short test part (right % at the arm's threshold and its wrong % vs the
    Rules' right % and wrong %).
- After the run: root-cause analysis of the misses (`training/sketch/composer_errors.mjs` / `error_analysis.mjs` for VSS, the per-key
  differences for SOP-BERT), separately for requests whose trigger occurs in synth_rules and those whose trigger does not.

## GPU jobs (proposed commands; the machine's job numbering is the coordinator's)

Common: `EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_gen_1
llm_train/opus_gen_2 llm_train/synth_rules"` (the shipped list + synth_rules). The data adds 7822 messages / 10755 requests to 9440 / 31746
(+34% requests, most of them short), so training time grows by about a third.

1. **VSS-G+S** (job A): for each of the 7 worlds of registry.json, with that world's own BUILD.json settings,
   `FAST=1 FAST_MEM_MB=256 VSA_MEM_FRACTION=0.3 DEVICE=cuda EXTRA_DIRS="$EXTRA_DIRS" bash training/sketch/train_micro.sh <world> <events>`
   (DATA=spans, no SHORT, no OPS, HOLDOUT="", as shipped; output to a new model folder per world, not over docs/model/micro); then the world
   cutter (`train_cutter.py`, SHORT=1 as shipped) and the event cutter (`train_cutter.py`, no SHORT) with the same EXTRA_DIRS; then the
   context filler (`train_context.mjs`, same EXTRA_DIRS); a new `registry_synth.json` pointing at them. FAST_MEM_MB=256 bounds a step's
   memory (the long G rows: links7 46 tokens); the synthetic rows are short and add steps, not memory.
2. **BERT-G+S** (job B): `EXTRA_DIRS="$EXTRA_DIRS" python3 training/neural/make_roles.py --all --out ~/vss-box/ft/roles_GS`, then
   `python3 training/neural/finetune_roles.py --base distilbert-base-uncased --name sop-bert-gs --data ~/vss-box/ft/roles_GS --epochs 8
   --lr 6e-5 --bs 32 --seed 0` (fp16 on cuda, no held-out, the last epoch kept: the job 062 recipe), q8 ONNX export as shipped.
3. **Collect and fit** (job C, CPU is enough): the fresh2 collectors (`fresh2/collect_vss.mjs` with REGISTRY=registry_synth.json,
   `collect_sop.mjs` with MODEL=sop-bert-gs, `collect_rules.mjs`) on the short set and on fresh2; `fit_report.mjs` per arm; `verdicts.mjs`
   for the paired intervals.

## Risks written down before the run

- Template data can shift the mix: arm T of FEEDBACK_PLAN.md (skewed targeted data) made VSS worse. synth_rules is 45% of the messages but
  short; if fresh2 drops, the next step is a smaller share (one pre-registered size), not tuning on the test part.
- The gold of synth_rules is the Rules' reading wherever the conventions agree; where they differ the messages were rejected (README), so
  the learned readers will not learn the Rules' differences, and will not learn those constructions either.
- logic.js changed several times during the generation (the data was checked against the committed ca2850a); re-run the generator after
  any Rules commit that changes a reading, before training.
