# What the VSS reader cannot represent (model fix_p80_s0), by structure of the request (2026-10-31)

Read-only analysis. No repository file edited, no commit. Model `docs/model/fix_p80_s0`. Data: the fit split it was trained on
(`scratchpad/fitset/fit.jsonl`, 947 messages, 4305 requests) and the dev split (`scratchpad/review/dev.jsonl`, 253 messages, 1126
requests; read-only). Every request is read alone from its annotated span, exactly as `training/sketch/error_analysis.mjs` does
(reproduced: fit 2835 / 4305 = 65.9%; dev 693 / 1126 = 61.5%: this copy of dev gives 61.5%, not the 61.0% of ERROR_ANALYSIS.md).
No test set was opened. Scripts and raw outputs are in this folder (list at the end).

## 0. What the reader sees, and the reconstruction of its training rows

- The training row of every fit request was rebuilt exactly as `msg_to_world.py` built it (`llm_to_world.convert`, soft, on the
  tokens of the model's own `front.json`, gold created names): `frames.py`. Check: the 3900 rebuilt texts of the `train` split equal
  the 3900 texts of `runs/fix_p80_D1024_e2_s0/splits.json` as a multiset (0 differences). Of the 4305 fit requests, 3900 were trained
  on (`train.sop`), 382 are the calibration rows (`calib.sop`, 8% of the messages by hash, never trained), 23 were dropped (no event
  token and no role). All accuracies below on "fit" are given for the 3900 trained rows; the calibration rows are listed apart.
- What enters the state (reader.js `chart` / routebook.js `addresses`, twin of infer.py `Routebook.addresses` and v8_gates
  `V8.states`): `S = sum_j a_j(c) * F(token_j)`. The address `a_j` depends only on the kind sequence `c` (path: cumulative per-kind
  phases; bigram: the kind pair; chainL: per-kind gates and per-kind-pair phases). `F` is the fixed hashed star of the word
  (star_version 2: sha256 of the word, never trained). The learned parameters are the phase table and one gate per kind
  (train.py `params = [m.theta, m.logits]`). All 44 event tokens have the one kind `VERB`.
- What the decoder does (reader.js `read`, infer.py `read`): the event = the sentence's verb whose star best matches `Sn * conj(pred)`;
  then each role of that event is read independently. Single roles: present when the OCCUPANCY MARKER component
  `Re<marker, Sn * conj(role)> / core` reaches the role's threshold (reader.js line 234, infer.py lines 343-345), the filler = the best
  sentence word of the role's kinds. Set roles (members, targets): present when the best candidate's own score reaches the threshold,
  members = every candidate over the member threshold (reader.js `readSetRole`). Then the one-to-one step.

## 1. Patterns: accuracy on the model's own training rows and on dev

Exclusive patterns, first match, by the structure of the normalized tokens and the gold frame (`analyze.py`). "right" = the
command is right (error_analysis rule); "frame" = the decoded frame equals the gold training frame (event and every legend role).

| pattern | fit train n | right | frame | fit calib n | right | dev n | right | frame |
|---|---|---|---|---|---|---|---|---|
| P1 no token of the gold event in the span | 400 | 0.5% | 0.0% | 40 | 0.0% | 132 | 0.0% | 0.0% |
| P2 a gold role's word is not in the span (pronoun, context, value lost) | 361 | 0.0% | 62.0% | 48 | 0.0% | 93 | 0.0% | 51.6% |
| P3 two+ event tokens, gold = a later one | 486 | 84.6% | 84.2% | 52 | 75.0% | 142 | 76.1% | 76.1% |
| P4 two+ event tokens, gold = the first | 129 | 87.6% | 53.5% | 10 | 80.0% | 32 | 65.6% | 56.2% |
| P5 one event token, a list (set role) | 354 | 46.9% | 14.1% | 37 | 35.1% | 112 | 31.2% | 16.1% |
| P6 one event token, a filler before it | 284 | 90.8% | 89.4% | 27 | 96.3% | 75 | 90.7% | 90.7% |
| P7 one event token, unknown-kind word(s) | 161 | 77.6% | 80.7% | 10 | 60.0% | 47 | 76.6% | 74.5% |
| P8 one event token, a filler > 5 tokens away | 570 | 95.8% | 91.4% | 49 | 98.0% | 153 | 95.4% | 83.7% |
| P9 one event token, all near, no unknown kinds | 1155 | 84.9% | 78.8% | 109 | 85.3% | 340 | 82.1% | 76.8% |
| all | 3900 | 66.7% | 65.8% | 382 | 61.0% | 1126 | 61.5% | 60.7% |

Without P1 and P2 (the information is not in the tokens the reader gets), the reader is right on 82.8% of its own training rows
(2599 / 3139) and on 76.9% of dev (693 / 901). Other cuts (`analyze_out.txt`): number of names (3 names: train 54.4% / dev 34.7%;
4+: 35.4% / 20.0%), unknown-kind words (0: 69.3 / 65.8; 1: 58.6 / 42.8; 2+: ~40 / ~38), span length, number of roles, gold event.
Far roles (P8) and roles before the verb (P6) are NOT a problem (> 90%).

The sub-patterns that fail on the training rows themselves (`subpatterns_out.txt`; frame = reader-level):

| sub-pattern | fit train n | right | frame | dev n | right | frame |
|---|---|---|---|---|---|---|
| S1 `is ... <question verb>` (two verbs, `is` first, gold the later) | 463 | 84% | 391 | 134 | 75% | 102 |
| S1a of which gold path / connected / extreme | 276 | 79% | 215 | 78 | 68% | 52 |
| S2 connect one to several (gold source + targets) | 122 | 5% | 0 | 44 | 0% | 0 |
| S3 connect several to one (gold members + target) | 39 | 3% | 0 | 20 | 5% | 0 |
| S4 connect chain / all (gold members [+ pairing]) | 174 | 75% | 15 | 43 | 51% | 5 |
| S5 no own-kind word in the span (event token present, nothing lost) | 563 | 77% | 361 | 154 | 65% | 85 |
| S5c with an own-kind word (same conditions) | 2576 | 84% | 1982 | 747 | 79% | 551 |
| S6 a role the model never gives (no threshold: direction, amount, arrow, object.det, edge.attr) | 97 | 24% | 0 | 36 | 25% | 0 |
| S7 question colour without a shape ("which ones are blue") | 46 | 2% | 44 | 19 | 0% | 15 |

("own-kind word" = a token whose kind holds exactly one catalog word: to, from, the, with, a ..., not NAME, VERB, COLOR, POS ...)

## 2. Can the reader represent the gold frame? Three tests per pattern

### 2.1 Collision test (`collide.py`)

View of a row = (kind sequence, pattern of repeated words): nothing else reaches the addresses. Two rows of one view conflict when
their gold predicate sits at different positions, or a role that both gold events take is at a position in one and not in the other
(differences in roles only one of the two events reads are not conflicts: one address can carry both keys). Per view, the largest
mutually compatible subset is computed exactly.

- 3900 train rows, 1219 views (390 with 2+ rows). Views with incompatible gold: 25. Rows no route book could read right: **62 (1.6%)**.
  Of the 1298 train rows read wrong, 45 are among them (P1 9, P2 17, P5 16, P8 2, P6 1; P3, P4, P7, P9: 0).
- The conflicts are labels, not constructions: `style` 26 (`connect A to B with a solid line`: "solid" is labelled in some rows,
  left out in others), `relation` 12 / `pred position` 10 (`n_enemy is right_side` labelled move; `which reachable from X` labelled
  reachable with `which` as event token), the `them` lists of P2.
- Dev: 881 of 1126 rows have a view seen in training; 21 of them conflict with the readable training frames of their view.

So no failing pattern is explained by two identical inputs with different gold. The limits, where they exist, are in what the
addresses and the decoder can produce, not in collisions.

### 2.2 Mechanism test (code) and small controlled worlds

Small worlds: the fix_p80_s0 training rows of one pattern only, same tokens, gold frames, legend (same sha256), kinds, D 1024,
seed 0, star_version 2, threshold rule fit; thresholds fitted on the same rows (in sample: a capacity test). `build_tiny.py`,
`run_tiny.sh`, `eval_tiny.py`. Trained only while no other training ran (the fix-model run had ended; stopped when the 8-epoch run
started). Each took 2-5 minutes, RSS <= 1.1 GB.

| world (rows) | epochs | frame right in sample | the same rows, full model fix_p80_s0 |
|---|---|---|---|
| lists_s: connect source+target 74, members 74, source+targets 73, members+target 39 | 10 | 229/260 (88%): 70/74, 72/74, **64/73**, **23/39** | 47/260: 38/74, 9/74, **0/73**, **0/39** |
| isverb_s: rows with `is`: fact 55, extreme 109, connected 52, path 24 | 10 | 235/240 (98%): path **24/24**, connected 51/52 | 182/240: path **1/24**, connected 33/52 |
| noown_s: rows without an own-kind word, 25 events, 240 | 10 / 40 | 193/240 (80.4%) / 197/240 (82.1%); `miss object` 16 / 15 | 105/240 |

(Errors in the small worlds caused by their own small calibration, e.g. no threshold for `size` in noown_s, are not capacity.)

**S1, `is` before a question verb: representable, under-trained.** The event is the argmax of the predicate score over the
sentence's verbs (reader.js line 315, infer.py line 451); with all verbs of kind VERB the choice is made by the positions' addresses.
In the full model the first verb's deposit wins: `is n_x path_q n_y`: deposit of `is` 0.435, of `path_q` 0.333, path read in 1 of
24 training rows (`presence_decomp.mjs`, field `pred`). No collision (2.1), and the small world reads path 24/24 and connected
51/52 from the same rows. Verdict: under-trained (the shared address of a verb at the start of a sentence is pulled toward the
predicate by every one-verb command). No reader change.

**S2 / S3 / S4, lists: representable, under-trained.** The decoder reads source, target, members, targets independently, so the
four can be filled together (the twin-role problem of STEP4_DIAGNOSIS.md). But the addresses can separate them: in the small world
"connect A to B and C" is read right 64/73 (full model 0/73) and "connect A and B to C" 23/39 (full model 0/39), at 10 epochs, with
independent thresholds (best balanced accuracy of a single threshold, in sample: source 0.993, target 0.993, members 0.970, targets
0.984). Several-to-one is the slowest to learn: the name after the verb keeps the source address of "connect A to B" unless the right
context changes it, and only the chainL route reads the right context, through gates that are one number per kind (NAME 0.61,
`and` 0.01, `to` 0.00 in fix_p80_s0). Verdict: under-trained (S3: partly learned at 10 epochs; whether it reaches the level of S2 with
more epochs is not measured). No reader change.

**S5, a role whose presence only shared-kind words can write: the reader cannot represent it.**
Mechanism. With `occupancy_marker` (legend reader block, on in world real) a single role is present when the state holds
`role * marker`. The training target holds `role * (F(filler) + marker)` (world.Compiler.wire). The chart can write the constant
`role * marker` only through a token whose address carries the conjugate of its own star, `a_j ~ role * marker * conj(F_j)`. The
address depends only on the kind. So only a kind of one word (an own-kind word) can do it for every sentence. A kind shared by many
words (NAME: thousands, VERB: 44, COLOR 18, POS 15) has one address for all its words, and cannot cancel a star it does not know,
except for a few dominant words of a context, each at a fraction of the strength.
Evidence 1, decomposition of every presence ratio into the tokens that write it (`presence_decomp.mjs`, checked against the reader's
own presence: max difference 0.0005 over 17715 values; `presence_stats.py`). Gold-present single roles of the gold event, 3900
training rows: mean ratio 1.097, of which own-kind words 0.837, value kinds 0.148, VERB 0.085, **NAME 0.010** (the filler itself writes
nothing). Read present: 98.9% when the sentence has an own-kind word, **79.3%** when it has none (dev: 97.8% / 73.3%).
Evidence 2, "VERB NAME" (delete X, describe X, resize X, what_shape X, what_color X): object presence on the model's own 31 training
rows is -0.015 to +0.08 for every verb (threshold 0.125); the full model gives the object in 0 of the 30 such rows of noown_s.
Evidence 3, the small world: 240 rows without own-kind words trained 10 and 40 epochs: frame 80.4% -> 82.1%, object missed in 16 -> 15
rows, all 15 of kind sequence `VERB NAME` (15 of the 30 such rows): presence 0.03-0.07 against a threshold of 0.085 fitted on the same
rows, written by the verb (0.04-0.08) with ±0.03 of noise from the name (`tiny_missobj.py`). More epochs do not change it: the
information is not in the state in a form the readout uses.
Cost now: train rows wrong with the right event and a gold role read absent: 108, of which 87 have no own-kind word (12.6% of the 689
such rows, against 0.7% of the 3211 others); dev 47, of which 32 (15.8% of 203, against 1.6% of 923). Some are rescued in the command by
the offer rule (an unplaced word that one empty role admits): delete / describe "X" are right in the command, resize "X" is not.

**S6, roles never given: our calibration, not the reader.** The rule (train.py `calibrate`) leaves a role without a threshold when
the calibration rows (400 train + 210 held out) hold fewer than 5 present or 5 absent; the readout then uses the training rate
(`rate >= 0.5`): never. In fix_p80_s0: presence of direction, amount, arrow; object.det; edge.attr. 97 train / 36 dev requests (frame
right 0 of them). The representation is not tested by this; the fix is in the calibration (e.g. fit the rare roles on more rows).

**S7, the colour of a question without a shape: our converter / the world's roles.** `llm_to_world.convert` puts a question's colour
only on the object's attribute when there is a shape word ("which blue right now" -> no colour in the frame), and the legend events
count / list / exists have no colour role. The model reads exactly what it was trained on (frame right 44 / 46); the command is wrong.
52 fit / 19 dev. Data conversion (our code), not the reader.

**P1, P2: front end and context.** Without a VERB-kind token there is no predicate candidate, so no event (reader.js line 310-316):
the reader abstains by design; the cause is the learned triggers (front end). P2: the referent is outside the span (pronouns, $new,
earlier sentences): not in the input.

Smaller mechanism facts on the gold frames (`analyze.py`): 22 train / 10 dev gold frames would themselves be `no-sense` (more than half
of the tokens unknown-kind or unplaced: "all boxes that are not blue gray"); 4 / 2 fillers of a kind their role does not admit
(`everything`, `connection` are unknown-kind); 71 / 21 gold frames repeat `them` in a list (P2 anyway).

## 3. Verdicts

| pattern | fit train n, right | dev n, right | verdict | evidence |
|---|---|---|---|---|
| P1 no event token | 400, 0.5% | 132, 0% | front end (learned triggers) | no VERB token -> no predicate candidate |
| P2 information not in the span | 361, 0% | 93, 0% | data / context (reasoning) | the converter itself cannot place the word |
| S1 `is` + question verb | 463, 84% | 134, 75% | under-trained | no collision; small world path 24/24 (full 1/24) |
| S2 one to several | 122, 5% | 44, 0% | under-trained | small world 64/73 (full 0/73) |
| S3 several to one | 39, 3% | 20, 5% | under-trained (slowest) | small world 23/39 at 10 epochs (full 0/39) |
| S4 chain / all | 174, 75% | 43, 51% | under-trained | small world 72/74 (full 9/74 frame) |
| S5 no own-kind word: role presence | 563, 77% | 154, 65% | **cannot represent** (presence readout) | NAME writes 0.010 of the presence; VERB NAME object never present; small world flat 10 -> 40 epochs |
| S6 roles without a threshold | 97, 24% | 36, 25% | our calibration rule | thresholds null -> never given |
| S7 question colour, no shape | 46, 2% | 19, 0% | our converter / legend roles | the training frame has no colour |
| exact collisions | 62 rows (1.6%) | 21 | labels (style "solid", move vs fact) | collide.py |

## 4. Proposal (only for S5)

**Change: read the presence of a single role from the deposit that carries the word, not from the occupancy marker.** In VSS terms:
`occupancy_marker: false` in the legend's reader block of world real (msg_to_world.py writes it today as true). Both readers already
have this path and it is the rule the set roles use: presence = the best candidate's score `Re<F(w), Sn * conj(role)> / core`
(reader.js readRole line 235, infer.py read_role line 345); world.Compiler then also drops the marker term from the target, so a role
is trained as `role * F(filler)` only, which any token of any kind can write (its address is `role`, identity-free). No word list,
nothing per action. It needs a retraining (the target changes) and new thresholds by the same rule.

Expected effect, sized without training on the current model (`sim_presence.mjs`, `ea_dump_sim.mjs`: the same model read with this
presence, thresholds fitted by the trainer's rule on the fit calibration rows, never on dev). The model was trained for the marker, so
this is only indicative:
- the pattern S5 (no own-kind word): dev 100 -> 121 right of 203 (+21), fit train 435 -> 489 of 689 (+54); VERB NAME dev 4 -> 6 of 6;
- elsewhere (with an own-kind word): dev 593 -> 576 of 923 (-17), fit train 2167 -> 2129 (-38): mostly source / target, whose
  candidate score on a model trained for the marker does not separate absent from present (dev absent read absent: source 3/79 vs 40/79).
- net on the same model: dev +4 (693 -> 697), fit +22. The size of the pattern bounds the gain: 32 dev requests (2.8 points) are wrong
  now because a present role is read absent in a sentence without an own-kind word (87 train rows).
What it could break: the presence of a role whose word has no candidate of the role's kinds in the sentence (the marker could be
written by the function words alone, e.g. "put it to the left" with the filler unknown-kind): with the change such a role is absent;
the presence queries that rely on that ("is there a <role>?") would fire less. The residual "explained" is not affected.
Test before any full training (prepared, not run: the 8-epoch full training started first): the same three small worlds with the
marker off, `tiny/noown_m0`, `tiny/isverb_m0`, `tiny/lists_m0` (same rows, legend with `occupancy_marker: false`), run with
`./run_tiny.sh noown_m0 40` etc. when nothing trains. Criterion to state beforehand, e.g.: noown_m0 object missed in <= 3 of the 30
`VERB NAME` rows (now 15) and isverb_m0 / lists_m0 not more than 2 frames below the marker worlds (235/240, 229/260).

**Test of the proposal in the small worlds (run 2026-10-31, alongside the 8-epoch full training, RSS <= 0.88 GB each): FAILED.**
Criterion fixed before the run (coordinator, same text as above): `VERB NAME` object missing in at most 3 of the 30 rows of
noown_m0, and isverb_m0 / lists_m0 no more than 2 frames below their marker versions. Same rows, same settings, only
`occupancy_marker: false` in the legend (`tiny/*_m0`, results `tiny_noown_m0_e40.txt`, `tiny_isverb_m0_e10.txt`, `tiny_lists_m0_e10.txt`).

| world | marker on | marker off | criterion | |
|---|---|---|---|---|
| noown (40 epochs): `VERB NAME` object missing | 15 / 30 | **0 / 30** | <= 3 | pass |
| noown (40 epochs): frame right | 197 / 240 | 209 / 240 | (not a criterion) | |
| isverb (10 epochs): frame right | 235 / 240 | **231 / 240** | >= 233 | **fail** |
| lists (10 epochs): frame right | 229 / 260 | 239 / 260 | >= 227 | pass |

The criterion is missed, so the change is not taken further (AGENTS.md, experiments rule 3). What the miss is, for the record (no
patch tried): isverb_m0 has 9 errors: 1 missed relation (also in the marker version) and 8 "extra object". The 4 objects the marker
version missed are now read. The 8 are exactly the 8 rows `is n_x extreme_q topmost` of that world, whose gold frame is
`extreme` with no object although the name is in the span, and the reader now gives the object. This is the labelling gap of
STEP4_DIAGNOSIS.md group 1 L ("Is X the rightmost": `check` with a target in one convention, `extreme` without one in the other; not
settled in LABEL_CONVENTIONS.md). With the marker, the reader missed that object, and the label had left it out too. The reader limit
of S5 stays as found: presence written only by own-kind words. Fixing it is for the owner to decide, together with that label
convention.

**Not proposed (representable, under-trained):** S1-S4. Measured for the record, no training (`ea_dump_excl.mjs`): a decode rule that,
of two roles of one event that share a candidate kind and never occur together in the training frames (learned list: excl_pairs.json,
e.g. connect members/source, target/targets), keeps only the one further above its threshold, gives dev 693 -> 731 (+40, -2) and fit
2835 -> 2912 on the current model, all from S2 (dev 0 -> 34 of 45) and connect one-to-one (+6), S3 not fixed (1 -> 0). It is a
shortcut for an under-trained model, not a missing capacity; the 8-epoch run will show how much training alone recovers.

**Not reader changes:** S6 (calibration rule: rare roles get no threshold, 97 / 36 requests), S7 (converter / legend: question colour,
52 / 19), P1 (front end, 440 fit / 132 dev), P2 (context, 409 / 93), the 62 label conflicts.

## 5. The two fixes in our code, prepared behind switches (default unchanged), with their pre-registrations

Working-tree changes, not committed (the coordinator reviews and commits):

| file | change | switch |
|---|---|---|
| `training/vss/tool/sop/train.py` | `calibrate` split into `add_row` (the old loop body, moved, unchanged), `fallback_rows` (new) and `thresholds_of` (the old threshold code, unchanged; one extra report field when the fallback was used) | `CAL_FALLBACK=train` |
| `training/sketch/llm_to_world.py` | `convert`: a count / exists / list question whose colour has no shape word fills the role `color` | `QCOLOR=1` |
| `docs/js/vss-adapter.js` | count / exists / list: `if (R.color && !args.color) args.color = R.color` | none: inert for any model whose count / exists / list take no `color` role (all current models: the decoder never reads a role outside the event's roles) |

Checks that the default is unchanged:
- World build (`s7build/build.sh`): msg_to_world.py run with llm_to_world.py of git HEAD and with the working-tree one (QCOLOR unset),
  `--frac 0.8`, DATA=old and DATA=all, from scratch copies of training/sketch (so the repository's llm_train/REAL_WORLD.md is not
  written): the 10 output files (legend.json, kinds.tsv, world.json, split_hints.json, front.json, examples/train.sop, examples/calib.sop,
  raw/sentences.txt, status.json, REAL_WORLD.md) are byte-identical in both DATA settings (`s7build/h_old_*.txt` = `h_new_*.txt`). The
  DATA=old default legend has sha256 12cf77be…, the legend of fix_p80_s0. With QCOLOR=1 the legend's count / exists / list take `color`
  and 45 train + 4 calib rows (DATA=old; DATA=all: 78 + 7) gain `color=<value>`; nothing else in the rows changes.
- Trainer (`s6check/run.sh`): the tiny world lists_s, 1 epoch, `--n_cal 60` (so that a rare role misses a class), trained with the tool
  of git HEAD and with the working-tree tool (CAL_FALLBACK unset): routebook.npz identical (sha256 5c6475…) and config.json identical except
  the timestamp. With CAL_FALLBACK=train: same route book; `arrow`, null before, gets 0.0556; every other threshold identical; edge.attr
  stays null (fewer than 5 present even among all the training rows: the rule keeps "no threshold" then).
- Adapter: error_analysis rows of fix_p80_s0 on fit and dev re-run with the edited adapter: identical files (`*_rows_adapter.jsonl`).

### Pre-registration S6: `CAL_FALLBACK=train`

- Hypothesis: the roles that get no threshold from the calibration rows (in fix_p80_s0: presence of direction, amount, arrow;
  object.det; edge.attr) are never given; fitted by the same rule on the calibration rows plus the training rows that hold the missing
  class, they are given where the gold has them, with few false ones.
- One change: the baseline run of the coordinator's current protocol (run_curve.sh, same DATA, share 0.8, seed 0, same epochs) repeated
  with `CAL_FALLBACK=train` only. The training is untouched by the switch, so the route book must be byte-identical to the baseline's
  (checked first; if it is not, the run is invalid).
- Measured on the dev split (the 20% held-out training messages), reading alone (error_analysis.mjs), against the baseline model:
  (a) the roles listed null in the baseline's config.json and their new thresholds; (b) the dev requests whose gold training frame holds
  one of those roles (fix_p80_s0: 36, 9 right; recounted for the baseline): right before / after; (c) every dev request that changes from
  right to wrong.
- It worked if: (b) gains at least 8 requests AND (c) loses at most 4 requests in total (the switch changes only the thresholds of
  roles that were never given, so any loss is a false presence of such a role).

### Pre-registration S7: `QCOLOR=1`

- Hypothesis: "which ones are blue" / "how many are red" fail because their colour never reaches the training frame (llm_to_world
  keeps a question's colour only as a shape word's attribute); with the colour as the role `color` of count / exists / list, the reader
  learns it like the colour of set / check / fact.
- One change: the baseline run repeated with the world built with `QCOLOR=1` (everything else equal). The adapter line above is needed
  and already in place.
- Measured on the dev split, reading alone (error_analysis.mjs): (a) the dev count / exists / list questions with a colour and no shape
  word (fix_p80_s0: 19, 0 right; recounted for the baseline); (b) all other dev requests, right before / after.
- It worked if: (a) at least 10 of them are right AND (b) the other dev requests lose at most 1.0 point (the retraining changes the
  route book; the spread between seeds is not measured yet, so 1.0 point is the stated tolerance, not a measured one).
- Not covered: the questions' `notColor` (37 fit / dev rows) is lost before the converter: the learned front end does not produce the
  `not_<colour>` token ("which ones aren't blue" -> `which blue`). Front end, a separate item.

## Files (all in this folder)

- `ea_dump.mjs`: error_analysis.mjs, one JSON row per request with tokens, kinds, decoded frame, presence (-> fit_rows.jsonl, dev_rows.jsonl)
- `frames.py`: the training row of every request rebuilt as msg_to_world.py did, labels per position, split (-> *_frames.jsonl; checked against splits.json)
- `analyze.py` (-> analyze_out.txt), `lists.py` (-> lists_out.txt), `subpatterns_out.txt`: the pattern tables
- `collide.py` (-> collide_out.txt, collisions.json): the collision test
- `presence_decomp.mjs` (-> pd_fit.json, pd_dev.json), `presence_stats.py` (-> presence_stats_out.txt): who writes the presence
- `sim_presence.mjs` (-> sim_thresholds.json, sim_presence_out.txt), `ea_dump_sim.mjs` (-> *_rows_sim.jsonl): presence from the candidate score
- `excl_pairs.py` (-> excl_pairs.json), `ea_dump_excl.mjs` (-> *_rows_excl*.jsonl): the exclusion decode, for the record
- `build_tiny.py`, `run_tiny.sh`, `eval_tiny.py`, `tiny_missobj.py`, `tiny/<world>/` (worlds, models, logs), `tiny_<world>_e<N>.txt` (results; `*_m0`: marker off)
- `s7build/` (build.sh, the three world builds, hashes h_*.txt), `s6check/` (run.sh, the HEAD tool copy, the three tiny models and logs)
