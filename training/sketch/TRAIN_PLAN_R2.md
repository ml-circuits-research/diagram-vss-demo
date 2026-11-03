# TRAIN_PLAN_R2: the second retraining round of VSS and SOP-BERT (written 2026-11-03)

Starting point: the shipped readers are arm ALL of TRAIN_PLAN_1103.md (jobs 070 / 071 / 072, in the demo since 220295a). Today's analyses
found the causes below (combine/VSS_BERT_FAILURES.md, combine/VSS_FROM_TO.md, synth/VSS_SYNTH_DIAGNOSIS.md, synth/CONVERT_FIX.md,
../neural/ROLES_ROUNDTRIP.md, confidence3/NEW_FORMS_AUDIT.md). This round fixes what a measured fix exists for, adds the data the failures
call for, thins the repeated synthetic data, and drafts the GPU jobs 073 / 074 / 075. Nothing here was trained on the GPU: the numbers
are the conversion round trips (what a world can learn from its rows), a world-choice oracle with the shipped models, CPU smoke runs and the
label checks. Every switch is off by default; with all of them off every build is byte-identical to before (checked: the 9 fronts of 070's
settings relearned with the new code equal the shipped `front.json` files; `regress.sh` unchanged, section 6).

## 1. Decisions in one table

| # | what | switch / folder | in jobs 073 / 074? | measured reason |
|---|---|---|---|---|
| 1 | a world's front end learns its triggers and values with the OTHER worlds' requests as negative evidence | `FRONT_NEG=1` (pooled, balanced) or `FRONT_NEG=<grouping.json>` (per world) | **no** | removes 25-37% of the cross-world claims, but the worlds lose as many of their own action tokens: no net gain (section 2) |
| 2 | value learning: a value n-gram never takes in the trigger (`mask`); a trigger rule keeps a value token only when it is gold (`keep`) | `VAL_GUARD=1\|mask\|keep` | **no** | each part moves requests both ways; the round trip of the test sets and the oracle do not improve (section 2) |
| 3 | the `$new` converter bug: several `$new` in one wire became the last created name | `NEW_DISTINCT=1` | **yes** (VSS) | 16 world rows change, all to the right roles (section 2) |
| 4 | `set_member` calibrated on the rows whose gold has the set role (sentence words only) | none (not implemented in train.py) | **no** | end to end on VSS-BERT: fresh2 -0.9 [-1.4, -0.4], a loss shown (section 2) |
| 5 | realistic short messages: verbless, chained / gapping, self-corrections, narration, the new forms the Rules do not read | `llm_train/opus_short_r2` (255 messages, 345 requests) | **yes** (both) | the failure classes of VSS_BERT_FAILURES.md sections 1-3 (section 3) |
| 6 | synthetic short commands of the 2026-11-02 forms the data lacked, read exactly by the Rules, 69% wrapped in narration | `llm_train/synth_short_r2` (1997 messages) | **yes** (both) | 0 training requests had an undo count, an outline question or a size in a description (section 3) |
| 7 | repeated request formulations thinned | `llm_train/{synth_rules,synth_rules_ops,synth_rules_ext,synth_combo}_dd` | **yes** (both) | 1683 of 14058 synthetic messages are copies of kept ones up to names / numbers / quoted texts (section 4) |

## 2. The code fixes, with the measurements

Measures used (all on 070's data and settings unless said; tests = fresh2 opus_a..d and short3 without pending wires):
- **round trip**: `convert_check.py`, the share of a folder's requests whose world row reproduces the gold through the browser adapter;
- **world-choice oracle**: `world_choice_oracle.mjs` (new): the shipped composer reads each gold span as a unit (the cut oracle), with every
  world's `front.json` replaced by the variant's; per request: the gold world read the gold event ("world right"), another world won
  ("other world"; cause 1 of VSS_FROM_TO.md section 5 when the gold world had read the gold event), the gold world read another event, or no
  world read it. Selection on the calibration part (sha256 % 3 == 0, 808 requests), report on the test part (1745 requests). The models stay
  the shipped ones, so a world that loses its own trigger loses it here too.

### 2.1 Cross-world trigger rules (fix 1): FRONT_NEG, not adopted

Cause, confirmed on the test part with the shipped models: 67 requests (3.8%) are read by another world although the gold world read the gold
event; the other world's front end had turned a word into its own action (`manage`: "make" -> duplicate, "which" / "is" -> the value all and
then "all" -> delete; `help`: "is there", "can you" -> help_q; `layout`: "bigger" -> respace, "make them" -> equalize; `shapes`: "put" -> draw).

The fix (front.py `learn_values` / `learn_triggers`, `neg`): the candidates are still learned from the world's own rows, but their precision is
also charged with every occurrence in the other worlds' requests. Four forms were measured (one change each):

| variant | round trip base / synth_rules / short3 / fresh2 | oracle test: world right / other world (gold world read gold) / not read | oracle cal: world right |
|---|---|---|---|
| shipped fronts | 82.6 / 80.3 / 61.0 / 74.2 | **1491** / 67 / 22 | 688 |
| pooled, unweighted | 79.0 / 67.4 / 50.2 / 66.3 | - | - |
| pooled, the other worlds weighed as much as this world (`FRONT_NEG=1`) | 81.8 / 73.0 / 55.1 / 72.7 | 1486 / **42** / 44 | 694 |
| per world, each world weighed the same (`FRONT_NEG=worlds_micro/GROUPS_8ops.json`) | 81.3 / 73.3 / 51.9 / 70.5 | - | 685 |
| values only (pooled, balanced) | 82.5 / 74.4 / 57.3 / 74.4 | 1491 / 62 / 25 | 684 |
| triggers only (pooled, balanced) | 81.8 / 78.5 / 57.1 / 72.3 | 1487 / 44 / 43 | 693 |

Request by request (`FRONT_NEG=1` against the shipped fronts, test part): 27 requests go from "other world" to right ("Which shape is
bottommost", "make the Phone and the Laptop uh light blue", "put it in the bottom"), 25 go from right to "other world" and 11 to "not read"
("Mars to the left of Earth" -> links, "I want a dashed line between Farmer and Sheep" -> shapes, "top right", "I want Rain right under
Cloud"). The words a world wrongly claims are, most of the time, also its own legitimate action words in other requests ("put" is draw in
shapes and move in position; "remove" is delete and disconnect); a precision charge cannot tell the two uses apart, so it removes the word
from one world and the other world's reading with it. The round trip of the trained folders falls (the rows lose their event token: "no event
token" on synth_rules 5.2% -> 10.2%), which a retrained world would inherit. By the pre-registered rule (AGENTS.md, Experiments 3: no gain
on the oracle, losses in the round trip) the switch stays off. What would fix these 67: the router's choice between two worlds that both claim
the word, i.e. the world model's reading of the other words, which is data (sections 3-4), not the front end.

### 2.2 Value words swallowed (fix 2): VAL_GUARD, not adopted

The 11 failures of VSS_FROM_TO.md section 5 have three causes:
- **"add three" -> 3** (the value n-gram spans the verb, 5): `VAL_GUARD=mask` (the FRONT_V2 MASK rule alone: an n-gram that overlaps the
  annotated trigger without being inside it is no evidence). It removes "add three", "create two", "align everything", "change every" ...;
  but "three" alone does not then pass the value bar, so the count is still lost, and "how many arrows" loses kind_edge ("many arrows" overlaps
  "how many"). Round trip: trained folders +0.1 to +5.1 (ops_formulations 63.7 -> 68.8), short3 61.0 -> 60.9, fresh2 74.2 -> 73.7; oracle test
  1491 -> 1485.
- **"line up" -> align + direction up** (a trigger rule keeps a value token of its phrase, 5): `VAL_GUARD=keep` keeps it only when it is gold
  in at least trig_min_count of the rule's requests ("line up" has no request with a direction up). A first form (gold in >= 75% of them)
  lost the direction of 141 move requests: the rule "to the right" -> move fires inside "Move Cfo 60 pixels to the right" (the longest phrase
  is tried first, before "move") and its kept "right" was the direction there. The final form: round trip 82.4 / 79.8 / 60.7 / 74.1, oracle test
  1491 (=). No gain.
- **"make Gold gold"** (1): the tokenizer reads a lower-case word equal to a canvas name as the name (a mechanical step of the spec, needed for
  "connect start to done"). Not changed.

### 2.3 The `$new` converter bug (fix 3): NEW_DISTINCT=1, adopted

`llm_to_world.py ent()`: a wire with two or more `$new` gives each its own created name: the created names written in the clause and not named
elsewhere in the wire, in text order, one per `$new` in the order the roles are converted. A wire with one `$new` is converted as before.
Every world row that changes (070's data + the tests, fronts of the shipped settings):

| | rows | examples (before -> after) |
|---|---|---|
| trained | 8 | sl-0015 "Align Signup and Login horizontally": members {Login, Login} -> {Signup, Login}; sm2-0383 "Hook Do to Check and Check to Act": {Do, Act, Act} -> {Do, Check, Act}; ot-0317 "link Clue1 to Clue2": source Clue2 -> Clue1 |
| tests | 8 | fo-0154 "Arrows from Dad and Mom to Me": members {Me, Me} -> {Dad, Mom}; s3-0146 "connect Api to Db": source Db -> Api |

All 16 change to the roles the text states. `convert_check` cannot see it (the scorer writes every reference as `$new`).

### 2.4 `set_member` calibration at training time (fix 4): not adopted

The shipped links8 threshold `set_member.members` is 0.118 (calibrated against the whole catalog). Calibrating it on the rows whose gold
has the set role, the gold members against the other names of the same sentence (what the decoder reads), gives 0.331 (links), 0.363
(position), 0.336 (manage), 0.272 (shapes members), 0.576 (shapes items). At training time this is what `calibrate_and_finish` would fit
with that population, so the thresholds were written into copies of the shipped worlds and measured end to end (collect_pair + the
shipped combined reader, as VSS_FROM_TO.md did for variant B):

| | VSS-BERT test part, cost score | paired difference (1000 resamples) |
|---|---|---|
| shipped | fresh2 42.4, short3 13.9, both 35.4 (767 right) | |
| set_member on the member rows | fresh2 41.5, short3 13.4, both 34.6 (753 right) | fresh2 -0.9 [-1.4, -0.4], short3 -0.5 [-1.2, 0.0] |

Why: the threshold drops 17.7% of the true members of links, and still keeps 74% of the names read in rows whose gold has no set (their
ratios average 0.62, above the true members' 0.58). The set role is read where the gold has none because of what the model learned
(VSS_FROM_TO.md fact 2), not because of the calibration population; the adapter's one-to-one rule (fix C, shipped) already removes most of
what it causes (44 -> 15). No change to `train.py`.

## 3. The new data

| folder | kind | messages / requests | validation | round trip VSS / SOP-BERT (073 / 074 settings) |
|---|---|---|---|---|
| `llm_train/opus_short_r2` | realistic, written by an Opus writer in 4 batches (texts saved first), README | 255 / 345 (7 excluded: no certain reading; 3 overlaps removed) | 329 of 330 Rules paraphrases read as the gold (the one left: the Rules' "make A and B circles"); `synth/build_opus_r2.py` | 56.8% (25.2% no event token: verbless forms) / 94.2% right, 99.7% with references |
| `llm_train/synth_short_r2` | synthetic (`synth/gen_short_r2.py`), README | 1997 / 1997 (of 2400 candidates) | read exactly by the Rules (`check_file.py --mode rules`), overlap-removed | 91.1% / 96.0% (+4.0% asked: label="") |

Every text of both folders was compared with every test set (the six template sets, llm_short, fresh2, short3 and short3's saved texts:
exact after lower-casing / punctuation stripped, and the same token set). Coverage of the new forms in the training data (070's EXTRA_DIRS
-> 073's; requests, in brackets the short single-request messages):

| form | 070 | 073 |
|---|---|---|
| undo / redo with a count | 0 (0) | 54 (53) |
| outline question | 0 (0) | 74 (74) |
| a size in a description ("the small squares") | 0 (0) | 74 (74) |
| outline on an existing shape / on a new shape | 32 (27) / 32 (30) | 132 (120) / 110 (107) |
| how many arrows | 301 (12) | 312 (30) |
| arrow label by its ends | 168 (86) | 335 (237) |
| arrow restyle by its ends / every arrow | 144 (87) / 58 (43) | 224 (163) / 120 (105) |
| at x,y | 98 (87) | 155 (146) |
| layout operations | 564 (448) | 609 (489) |
| templates | 1583 (550) | 1711 (665) |
| free text / help questions | 729 (448) / 857 (485) | 647 (367) / 804 (436) (copies removed by section 4) |

## 4. Repetition (data_repetition.py)

A request's frame: its span lower-cased with names -> N, quoted texts -> Q, digits -> #; value words stay. Per folder (all training folders,
and opus_tgt_1 / 2, which no job trains on):

| folder | messages | requests | distinct span frames / requests | most frequent span start (n, share) | the K=2 rule would drop |
|---|---|---|---|---|---|
| sonnet_msg | 600 | 3127 | 0.637 | `make the N` (102, 3.3%) | 1 |
| haiku_msg | 600 | 2304 | 0.486 | `connect N to` (342, 14.8%) | 12 |
| sonnet_msg2 | 600 | 2789 | 0.644 | `is the N` (65, 2.3%) | 3 |
| haiku_msg2 | 600 | 2001 | 0.466 | `connect N to` (96, 4.8%) | 101 |
| sonnet_long | 240 | 2562 | 0.694 | `is the N` (115, 4.5%) | 0 |
| fresh1/sonnet | 500 | 3030 | 0.510 | `make the N` (312, 10.3%) | 4 |
| fresh1/haiku | 500 | 2514 | 0.370 | `connect N to` (249, 9.9%) | 49 |
| sonnet_spans | 500 | 2173 | 0.822 | `the N is` (86, 4.0%) | 0 |
| haiku_spans | 500 | 2202 | 0.516 | `connect N to` (251, 11.4%) | 5 |
| sonnet_short | 1500 | 1500 | 0.865 | `connect N to` (35, 2.3%) | 104 |
| haiku_short | 1500 | 1500 | 0.787 | `is there a` (32, 2.1%) | 177 |
| opus_train_a / b / c / d | 300 each | 994 / 891 / 1059 / 1015 | 0.889 / 0.927 / 0.781 / 0.910 | `N should be` (35) / `connect N to` (19) / `N should be` (58) / `is the N` (47) | 3 / 3 / 10 / 3 |
| opus_gen_1 / 2 | 300 each | 991 / 1094 | 0.868 / 0.858 | `N should be` (35) / `connect N to` (48) | 4 / 2 |
| opus_tgt_1 / 2 (not trained) | 300 each | 941 / 1023 | 0.761 / 0.860 | `connect N to` (63) / `N should be` (53) | 10 / 0 |
| **synth_rules** | 8404 | 11707 | **0.717** | `what is the` (139, 1.2%) | **1054** |
| **synth_rules_ops** | 1374 | 1470 | **0.556** | `how many shapes` (45, 3.1%) | **407** |
| **synth_rules_ext** | 2783 | 3664 | 0.800 | `is it possible` (131, 3.6%) | **208** |
| ops_formulations | 700 | 733 | 0.936 | `arrange as a` (26, 3.5%) | 3 |
| opus_ext_1 | 500 | 743 | 0.939 | `how do i` (36, 4.8%) | 0 |
| **synth_combo** | 1497 | 4521 | 0.761 | `what color is` (54, 1.2%) | **14** |

The rule (documented in data_repetition.py and each `_dd` README): messages in sha256(id) order; a message is dropped when every one of its
request spans has a frame that 2 kept messages already carry. Applied to the four synthetic folders (they are EXTRA_DIRS folders, so a copy
replaces them in the jobs' EXTRA_DIRS with no loader change):

| folder | messages before -> after | requests | distinct span frames / requests |
|---|---|---|---|
| synth_rules -> synth_rules_dd | 8404 -> 7350 | 11707 -> 10468 | 0.717 -> 0.802 |
| synth_rules_ops -> synth_rules_ops_dd | 1374 -> 967 | 1470 -> 1057 | 0.556 -> 0.774 |
| synth_rules_ext -> synth_rules_ext_dd | 2783 -> 2575 | 3664 -> 3451 | 0.800 -> 0.849 |
| synth_combo -> synth_combo_dd | 1497 -> 1483 | 4521 -> 4489 | 0.761 -> 0.766 |

Not applied: the base realistic folders (haiku_msg2 would lose 101, fresh1/haiku 49, haiku_short 177): they are hard-coded in four
loaders (front.py TRAIN_DIRS, train_cutter.py, micro_tools.py, make_data.py) and shared by every arm; changing them needs a loader switch in
each, left for a later round. The repetition the owner names inside realistic text ("connect N to" starts 14.8% of haiku_msg's requests,
"then add a" in opus_tgt_2) is a writer's habit spread over different messages: reported, not removed (dropping such messages would drop
their other content).

## 5. The jobs (training/laptop/jobs_draft/)

| job | what | after | expected time (RTX 3050 Ti; scaled from 070 / 071 / 072) |
|---|---|---|---|
| 073_vss_round2 | 070 with NEW_DISTINCT=1 and the round-2 EXTRA_DIRS; world settings from the shipped `docs/model/micro/<world>8/BUILD.json`; gates: the folders, the round-2 code present with FRONT_NEG / VAL_GUARD off, legend_values.json current, convert_check (every shape <= 1%, round trip >= 40% per trained folder); 9 worlds, world + event cutter, registry_R2.json, context filler, a smoke read (16 messages, 6 new); all to docs/model/arms/R2/ | - | ~60-80 min |
| 074_bert_round2 | 071 with the round-2 EXTRA_DIRS; gate roles_roundtrip (95% / 1%); to docs/model/arms/R2/neural/sop-bert-R2 | - (waits for every GPU slot) | ~30 min + the wait |
| 075_measure_round2 | the R2 readers against the shipped ones (arm ALL) on fresh2 + short3: conversion ceilings, collectors, fit_report + verdicts (VSS, SOP-BERT), VSS-BERT shipped (shipped confidence) vs R2 (refit.sh with COMB_VARIANT=d2), paired bootstrap; COMPARE.md; the refitted confidence files to docs/model/arms/R2/confidence, the shipped ones restored | 073, 074 | ~25-30 min (CPU) |

Smoke runs (CPU, this machine; outputs removed): 073's CPU part as written (data checks, world table from the shipped BUILD.json files,
convert_check gate and floor: passed, the table of section 3); `train_micro.sh` on a 339-row links world with 073's settings (EPOCHS=1, exit 0,
BUILD.json records NEW_DISTINCT) and on a 299-row history world with FRONT_NEG=<grouping> VAL_GUARD=1 (exit 0, both recorded in BUILD.json and
front.json); 074's CPU part as written (make_data / make_roles --all: 55029 request rows, 52 acts, every needed key; roles_roundtrip
--compare-rows identical rows, gate passed); 075's COMPARE.md code on stand-in records (the VSS-BERT bootstrap reproduces the cost scores of
section 2.4). The GPU parts are 070 / 071 / 072's, unchanged.

Before the jobs run, on gpu-runs: the code and data of this round, and `training/sketch/legend_ext/legend_values.json` re-exported (logic.js
changed in ad1b272: only its sha line differs; 073 stops otherwise, as 070 would).

## 6. Verification (2026-11-03)

- All switches off, `SERIAL=1 GATE=cost bash training/sketch/regress.sh`: sample Rules 69.1 / 15.5 / 15.4 +769, VSS 77.7 / 9.3 / 13.0 +470;
  templates 98.9 / 0.4 / 0.8 +4, 78.5 / 7.6 / 13.9 +69; llm_short 72.4 / 5.6 / 22.0 +374, 71.1 / 8.6 / 20.3 +442; VSS gated cost 5.8 / 13.1 / 7.6;
  rules sets 39/40 53/60 300/300 300/300 299/300; test_diagram_ops 273/273, test_editor_history PASS. Identical to the table of ee21ec2 except
  the Rules' llm_short extras (+375 -> +374): docs/js/logic.js changed since in commit ad1b272 (another agent's palette work); this round
  changed no file under docs/js or docs/model, so the difference is not from it.
- With all switches off the 9 fronts that convert_check learns with 070's settings are byte-identical to the shipped front.json files.
- convert_check gate with 073's switches and data: every shape <= 0.5% in every trained folder (gate 1%), round trips in section 3 / 073's log.
- roles_roundtrip gate with 074's data: every trained folder passes (ALL trained 95.4% right, 99.5% right or reference only, 0.1% silent).

## 7. Expected gains (estimates from the counts, not measurements; the measurement is 075)

Pre-registered for 075 (cost score on the test parts, shipped = arm ALL): the round **worked** if VSS-BERT R2 - shipped is >= 0 on both
fresh2 and short3 with short3's interval above 0, and VSS-BERT's confidently-wrong share does not rise on either; VSS and SOP-BERT alone are
reported beside it.
- short3 (short commands): the new forms with no training request before (undo counts, outline question, size in descriptions: 5 of the 14
  confidently wrong of VSS_BERT_FAILURES.md section 1 and 11 missed) and the verbless / chained / gapped commands (36 missed by the cut and the
  act): VSS_BERT_FAILURES.md estimates +3 to +5 cost points overall, about +12 on short3, if the readers learn them. The VSS conversion
  ceiling on short3 rises 61.0% -> 63.8% (fresh2 74.2% -> 76.5%); the oracle with the R2 fronts and the shipped models: world right 85.4%
  -> 85.8% (short3 79.4% -> 80.1%).
- fresh2 (long messages): small; narration and self-corrections are a few dozen messages against 25k.
- NEW_DISTINCT: ~0 (16 rows). Deduplication: no gain expected on the test sets by itself; less weight on formulaic synthetic frames.

## 8. Risks

1. **Verbless forms in VSS**: 25.2% of opus_short_r2's rows have no event token: a front-end trigger rule needs 2 requests with the same
   phrase and context ("Done → gold"). Many verbless rows are seen once; they still train the cutters and SOP-BERT (round trip 94%).
2. **opus_short_r2 is small** (345 requests against ~55k): its forms may not move a model trained on everything; the cutter (one B label per
   request) and SOP-BERT are the likeliest to learn them.
3. **Dedup changes the synthetic data's balance** (synth_rules_ops -30%): its forms are still kept twice per formulation; groups / at / linked
   requests drop in count. Watch the group / ungroup / outline rows of 073's REAL_WORLD.md files.
4. **Narration in synth_short_r2** uses 12 prefixes and 8 suffixes; 1374 messages with them could teach the cutter that these words never
   start a request ("next," "now"). They are outside the spans by construction, as in real use.
5. **Confidence**: 075 refits every confidence file on the R2 readers on the same calibration part as before (few new-form messages); the
   shipped files are restored and the R2 copies kept under docs/model/arms/R2/confidence until the arm is adopted.
6. The 67 cross-world readings (2.1) and the from / to lists (2.4) are not fixed by this round.

## 9. Files

Changed: `training/sketch/front.py` (FRONT_NEG, VAL_GUARD; `neg_labels`, `grams_of`), `msg_to_world.py` (FRONT_NEG wiring, switches printed),
`llm_to_world.py` (NEW_DISTINCT), `convert_check.py` (the new switches per world, KEYS, the round-2 switches in its header line),
`train_micro.sh` (the three switches passed and recorded in BUILD.json only when set), `legend_ext/legend_values.json` (re-export, sha line).
New: `training/sketch/world_choice_oracle.mjs`, `data_repetition.py`, `synth/gen_short_r2.py`, `synth/build_opus_r2.py`,
`synth/synth_short_r2_check.json`, `llm_train/opus_short_r2/` (README, texts/, annot/, msg_01..04, CHECK.json), `llm_train/synth_short_r2/`
(README, msg_01..02), `llm_train/{synth_rules,synth_rules_ops,synth_rules_ext,synth_combo}_dd/` (README, msg_*, DEDUP.json),
`training/laptop/jobs_draft/{073_vss_round2,074_bert_round2,075_measure_round2}.sh`, this file.

## Result (2026-11-03, jobs 074, 078, 079; results/079_measure_round2 on gpu-runs): not adopted

Test parts, cost score with each reader's own fitted threshold, paired intervals (R2 - shipped arm ALL):

| situation | VSS | SOP-BERT | VSS-BERT |
|---|---|---|---|
| fresh2 (1313 requests) | 15.2 -> 3.0, -12.1 [-15.9, -8.0] (loss) | 35.9 -> 33.1, -2.8 [-12.4, 7.1] | 42.4 -> 36.4, -6.0 [-12.4, -0.2] (loss) |
| short3 (432 requests) | 0.0 -> 0.7, +0.7 [0.0, 1.6] | 4.2 -> 0.0, -4.2 [-8.4, 1.4] | 13.9 -> 15.7, +1.9 [-13.0, 16.9] |

Executing everything, the readings barely moved (fresh2 VSS right 66.6% -> 66.2%, SOP-BERT 80.8% -> 81.2%); the losses come mostly from
the confidences fitted on the R2 readers (VSS R2's threshold executes 39 requests on calibration). The conversion ceiling rose (short3
61.0 -> 63.8%, fresh2 74.2 -> 76.5%), but the readers did not use it on these sets. The shipped readers (arm ALL) stay in the demo.
Next round: the scenes (scenes_r3, scenes_r3b) and the forms they expose (ROOT_CAUSES.md P1-P3), GAP_ROLE, and job 080 (VSA_CORR).
