# Port of the centre reader (B's E3d design) into the real VSS tool and the browser reader: design decisions

Step 2 of PLAN_2026-10-31.md. Source design: research/attention/B (vss.py CentreReader, E3d: centre-relative addresses keyed by the
centre's kind, attachment to the nearest centre on each side with a learned weight, a learned null probability per word, the attachment
also trained on the annotated spans). Success criterion, fixed before any run (owner): VSS cutting by itself >= 58% requests fully
right on dev (the 253 held-out training messages, id hash >= 0.8), extra wires <= 100. References: annotated cut 60.5% / 71 extra,
VSS hard centres (vss-centers.js) 46.5% / 335 extra, model fix_p80_s0.

## What the code does (where)

| part | Python (training) | Python (numpy inference) | browser |
|---|---|---|---|
| message tokens | training/sketch/front.py `normalize_message` | same | docs/js/front.js `normalizeMessage` |
| training rows | training/sketch/centres_rows.py + msg_to_world.py `CENTRES=1` -> examples/messages.jsonl | - | - |
| model, loss | training/vss/experiment/centres.py `CentreModel` | - | - |
| loop, calibration, export | training/vss/tool/sop/train.py `train_centres` | - | - |
| addresses, weights | centres.py `states` | tool/sop/infer.py `Routebook.centre_addresses` | docs/js/vss/routebook.js `centreAddresses` |
| one state per centre, reading | - | infer.py `Reader.centre_chart`, `read_message` | docs/js/vss/reader.js `centreChart`, `readMessage`; docs/js/vss.js `readMessage` |
| export | - | tool/sop/export_web.py (arrays cthR, cthL, cthC, cbgL, cbgR, cA, cDist, cbeta, cN; header centre_kinds) | loader.js (unchanged) |
| parity | training/sketch/parity_centres.py (golden) | | training/sketch/parity_centres.mjs |

The world chooses the reader: legend `reader.centres = true` (written by msg_to_world.py with CENTRES=1). Without the flag every path
is the one-request reader, unchanged (checked: old vs new infer.py on 215 dev spans, old vs new docs/js on all 1126 dev spans, SOP text,
residual and status identical; export-web of an old model byte-identical).

## Decisions (made before any training run; none changed after seeing dev numbers)

1. Centres = the tokens whose kind is a kind of the legend's verbs. In world `real` that is one kind, VERB (every event token), so "phases
   keyed by the centre's kind" (E3d) has one table; the code keeps the E x K x D tables for worlds with several centre kinds. The
   one-request model does not distinguish events in its addresses either (all event tokens are VERB), so this is the like-for-like port.
2. Message normalization (`normalize_message`): the one-request front end applies ONE trigger rule per span; a message has many. Here every
   rule that fires is applied, left to right; at a position the first rule in the learned order whose phrase and context match fires, the
   scan resumes after its phrase; contexts are read on the value-normalized tokens (before any trigger replacement). Rules are indexed by
   their first word: linear in the tokens. Also: a word read as a name anywhere in the message (a capitalised word inside a sentence) is a
   name everywhere in it (a second tokenization with those names known) - a mechanical step (names by capital letter), the same at
   training and at reading. Measured once on the 1200 training messages: 7298 event tokens for 5431 annotated requests.
3. Training rows: the requests' tokens are the message's tokens inside the span (not the span normalized alone), so a target never names
   a token the message does not have. The wire (target) is built by the same llm_to_world.convert as the one-request rows.
4. Centre of a request: a token of its span that is an event token: the one of the request's own event overlapping the annotated
   trigger, else the first of its own event, else the first event token of the span; one request per centre. On the 80% fit split:
   4303 requests with a span, 3934 with a centre (369 without: the front end finds no action word in the span; they get no state, their
   words still form their span for the attachment target), 5804 event tokens, i.e. 1870 centres that are not requests (trained to null).
5. Formulas: exactly B's CentreReader with ck=True (E3d) and null=True, the null from the kinds in a +-2 window, Dist buckets
   min(|t-c|, 15), the barrier = learned cost per kind of every word strictly between (prefix sums). Address = relative path + left
   bigram + right bigram (B's). No chainL: as written it is quadratic (C_existing_mechanisms.md section 5), and B's design that passed
   has none; the path/bigram/chainL codes of the one-request model are not used by the centre model.
6. Loss: -mean cos over matched centres + BCE(null of every centre, "not a request") + BCE(attachment, "in this centre's request") on
   both sides + BCE(self weight, "is a request"), each a mean, summed with weight 1 (B's E3c).
7. Batches: messages in shuffled order; a batch is closed when it holds >= 8 matched centres (--batch 8), so a step has about as many
   states as a step of the one-request training (8 rows). lr 0.02, Adam, 2 epochs, D 1024, seed 0 (run_curve.sh settings).
8. Reading: a centre is accepted when its null probability < 0.5 (B). Its members = the centre and every token attached to it with
   weight >= 0.5 (B's zone rule 1: the weights are probabilities, trained against the spans). The state S_c (with ALL its soft-weighted
   tokens) is read by the unchanged one-request decoder (structure, presence thresholds, one-to-one, residual, status) with the members as
   its sentence. Formalizations come out in text order (centre order).
9. Ignored text: the maximal runs of tokens taken by no accepted centre whose reading is `ok` or `abstain`, trimmed of punctuation. A
   centre read as `unknown-event` / `no-sense` takes nothing (its words are reported as ignored).
10. Calibration: the same presence thresholds and rule (fit), on the same rows (a training sample + the calibration half of calib.sop),
   each row read from the state of its centre in its message and with that centre's members as the sentence. calib.sop is halved per
   MESSAGE (hash of the message id), not per row, so that no message is half calibration and half reported.
11. Single-request reading with a centre model (train.py's own evaluation, REPORT.md): the span is read as a message and the first
   accepted centre with an `ok` / `abstain` reading answers. The number that counts is llm_score.mjs SEG=centres-model.
12. Linearity: tokens -> kinds -> nearest centres (two scans) -> weights from prefix sums -> one prefix sum of phases per centre kind ->
   each token adds to at most 2 states. Memory O(T D). No pairwise table anywhere.

## Bug found by the parity test (fixed in Python)

`infer.Reader.read_set_role` read the set roles (`members`, `targets`) over the whole catalog, the browser over the sentence's words.
On 215 dev spans of the one-request model (Python npz vs browser export) the set-role presence differed in 27 readings; with the fix 17
remain (the rest are the 8-bit export and Python's missing sentence candidates). The fix changes only the Python side (train.py's own
evaluation); llm_score.mjs uses the browser reader. Python parity readers must be built with sentence_candidates=True (as vss.js in
llm_score.mjs). What the fix (commit bf5229e) does NOT change: the calibration. train.py's calibrate() reads with no sentence filter
(filt=None), so read_set_role gets filt=None and role_cands(r, None) = the same catalog candidates as before; the presence, set-member,
attribute and determiner thresholds of every model trained after it are computed as for fix_p80_s0. It changes the Python formalize()
path only: the numbers sop train writes in REPORT.md / metrics.json, and the residual statistics in background.npz (read by no reader).

## Parity (Python numpy vs browser, same exported numbers)

parity_centres.py writes a golden file (numpy reader on the dequantized routebook.bin / stars.bin), parity_centres.mjs compares.
Exact: message tokens, centres, acceptance, members, SOP text of every reading, status, ignored spans. Numbers: null probabilities,
residuals, states (relative). "Bit-exact" holds for the outputs; the numbers agree to ~1e-16, not to the last bit, because numpy's and
V8's cos / sin / exp may differ in the last bit and numpy's matrix products sum in another order (the one-request reader has the same
property).
- mini model (D 64, 30 unit steps, only to test the code), 253 dev messages, 1494 centres: all exact fields identical; max |null diff|
  1.1e-16, residual 5.6e-16, state 2.2e-16.
- trained model centres_p80_s0 (D 1024), the same 253 dev messages, 1494 centres: all exact fields identical; max |null diff| 1.1e-16,
  residual 1.1e-15, state 1.6e-16. (A first run showed 136 differences, all line order only: the browser writes `_margin.members` right
  after a set role's line, Python later; Python's frame_wires now writes it in the same place. A difference of the one-request writer too.)

## The registered run (one run, seed 0) and its result: FAIL

Model centres_p80_s0: `CENTRES=1 PREFIX=centres SOP_PYTHON=<venv python> training/sketch/run_curve.sh 0.8` (world
training/sketch/worlds_centres/real, the 80% fit split = 947 messages, of them 864 trained and 83 for calibration (calib.sop, halved per
message); 3922 annotated requests in the trained messages, 5292 centres, 3582 matched to a request, 1710 not; D 1024, 2 epochs, 751 steps,
83 s of training on CPU; numpy vs torch states 1.3e-07). Exported to docs/model/centres_p80_s0 (routebook.bin 22.5 MB, the one-request
fix_p80_s0 has 34.7 MB). The training data are the same messages as fix_p80_s0's (llm_train/*_msg; the new *_msg2 / sonnet_long folders
are not in the glob), with no negative rows (NEGATIVES=0; the text outside the spans is inside the messages).

Dev: the 253 held-out training messages (id hash >= 0.8), 1126 gold wires, llm_score.mjs, the browser reader:

| reader | cut | correct | not done | done wrong | extra wires | messages fully right |
|---|---|---|---|---|---|---|
| fix_p80_s0 (one request) | annotated spans (SEG=gold) | 60.5% | 15.3% | 24.2% | 71 | 14.2% |
| fix_p80_s0 | hard centres (vss-centers.js, default) | 46.5% | - | - | 335 | 2.4% |
| **centres_p80_s0** | **its own (SEG=centres-model)** | **47.7%** | **19.1%** | **33.2%** | **143** | **4.0%** |
| rules (reference) | rules | 70.4% | 12.2% | 17.4% | 182 | 17.4% |

Criterion (fixed before the run): >= 58% and <= 100 extra wires. **Both missed: 47.7% (-10.3 points), 143 extra.** Against the hard
centres, about the same accuracy (+1.2 points) and fewer extra wires (335 -> 143). Ignored text reported: 1053 spans, 7255 tokens in the
253 messages. Per AGENTS.md rule 3 the run stops here (coordinator's decision (a)); no change was made after seeing these numbers except
the line-order fix above (output text only, no number changes).

sop train's own REPORT.md for this model says FULL 0.112 (held-out half of calib.sop) / 0.067 (training sample): there every
annotated span is read ALONE as a message (decision 11). That is not what the model was trained on (a span alone has other neighbours:
BOS / EOS bigrams and null context; e.g. "make n_order a large blue diamond" alone: its centre is rejected), so those numbers do not
measure the model; the model is not usable as a one-span reader. The measure is llm_score.mjs SEG=centres-model.

## Root causes of the misses (error_analysis.mjs SEG=centres-model; first cause that explains a miss; % of the 1126 requests)

| cause | % | where it sits |
|---|---|---|
| X0 no event token in the span | 8.8 | front end (learned triggers; the one-request reader: 8.2) |
| X1 every centre in the span rejected (null >= 0.5) ("delete the old Done box", "What is next to the Shelf") | 6.1 | model: the null probability |
| H a name (5.0) or a value (4.6) of the span not taken by the centre (attachment < 0.5) | 9.6 | model: the attachment |
| G role wrong, mostly lists: a set role filled where the gold has one shape ("connect Idle to Running" -> from = [Idle, Running]) | 8.2 | model: addresses (below) |
| F role missed ("make Triage huge" -> no target) | 7.2 | model / thresholds |
| B wrong action or type | 4.4 | model |
| E name not reachable (pronouns, $new) 3.1, D value not reachable 2.5, G description 1.2, C reader refuses 0.7 | 7.5 | front end / context |

Fully right in this analysis 48.1% (llm_score's alignment: 47.7%). Cut of the matched centre against its span (punctuation not counted):
exact 523, missing span words 392, taking words outside it 50. Extra readings: 60 accepted centres outside every span, 44 second
accepted centres inside one span.

Reading: the cut itself (X1 + H, 15.7 points) and the reading (G + F + B, about 20 points) both cost more than the 10.3 points missing.
The list / twin-role errors (G) and the role misses (F) are the error class that B's E3d removed in the synthetic world by keying the
relative phases by the centre's kind; this port does not have it (next section).

## A deviation of this port from E3d (decision 1), found after the run

In B's world every event had its own kind (ACT_<event>), so "phases keyed by the centre's kind" gave one phase table per EVENT. In world
real every event token has the one kind VERB, so this port has ONE table: it is in effect B's E3c (no keying), not E3d. The address of
"the first name after the action word" must then serve source (connect), object (make, move), members (arrange): the error class above.

## Pre-registration of a second run (written 2026-10-31 before any implementation; registered as RUN 2 by the owner's decision the same day: the owner approved B's E3d, run 1 was E3c because of the one-kind collapse)

Run 2, fixed now, before the code is written: model centres2_p80_s0 = `CENTRES=1 CENTRE_KEY=event PREFIX=centres2 run_curve.sh 0.8`
(seed 0, the same world worlds_centres/real rebuilt by the same script, the same 80% fit split); `sop train --centre_key event`
(default `kind` = run 1). The table of rows = the legend's event tokens (`Legend.all_verbs()`, sorted: 44 in world real) plus one shared
row `*` for a centre token outside it (none in world real); a centre's row = its token's lemma. cthR, cthL and cthC are keyed by that row.
Measured once on the same dev copy (scratchpad dev20c/dev.jsonl, 253 messages), the same scoring (llm_score.mjs SEG=centres-model, the
scorer of run 1, so that the numbers compare with 47.7% / 143), then error_analysis.mjs SEG=centres-model. One run; if it misses, stop.

- Hypothesis: with the centre-relative phases keyed by the centre's EVENT TOKEN (as E3d is in B's world), the address-confusion errors
  drop (G role wrong / lists 8.2%, F role missed 7.2%), and the requests fully right rise to the criterion.
- The one change: cthR, cthL (and cthC) get one row per legend event token that is a centre (44 in world real), selected by the centre's
  token (its lemma), instead of one row per centre kind. In code: the `erow` map of experiment/centres.py, infer.Routebook.centre_addresses
  and routebook.js centreAddresses goes from kind -> row to centre token -> row (a centre token outside the table, impossible for the
  legend's verbs, would take a shared row). Nothing else changes: the world (worlds_centres/real, the same kinds, the same messages and
  rows), the front end, the null and attachment formulas, the loss, batches (>= 8 matched centres), lr 0.02, 2 epochs, D 1024, seed 0,
  attach / null thresholds 0.5, the calibration rule, the scorer.
- Criterion (the same as run 1): VSS cutting by itself >= 58% requests fully right on the same 253 dev messages, extra wires <= 100.
  One run; if it misses, stop and report.
- Cost: route book +9.1 M phases (cthR, cthL: 44 x 103 x 1024 each instead of 1 x 103 x 1024), routebook.bin 22.5 MB -> about 31.6 MB at
  8 bits (+40%; still under fix_p80_s0's 34.7 MB). Training: one prefix scan per event token present in a batch instead of one, and Adam
  on 31.6 M instead of 22.5 M parameters: estimated 2-4 min instead of 83 s (an estimate, not measured). Reading: one prefix sum per
  event token present in the message (still linear in the tokens).
- Kinds: AGENTS.md says "the trigger word of a request -> the verb kind of its action", which reads as one kind PER ACTION; the world
  builder (msg_to_world.py) gives every event token the one kind VERB. The faithful port of E3d does NOT need per-event kinds in the
  world: E3d keys only the centre-relative phases by the centre, and in B's world the centre's kind happened to be its event. Per-event
  phase tables in the centre reader are enough and keep the world identical to run 1's (one change at a time). Per-event kinds in the
  world would change every reader (the one-request model's path / bigram / chainL tables are keyed by kinds; K 103 -> about 146) and the
  baselines would have to be retrained: a separate decision for the owner, not part of this second run.

## Linear cost (measured; trained model, D 1024, CPU, one message of N tokens = the dev messages' normalized tokens repeated)

| N tokens | centres (accepted) | numpy: states s | numpy: read_message s (states + every reading) | numpy us / token | numpy peak RSS MB | browser (node) readMessage s | browser us / token | node RSS after MB |
|---|---|---|---|---|---|---|---|---|
| 100 | 8 (6) | 0.065 | 0.075 | 752 | 250 | 0.108 | 1084 | 345 |
| 1 000 | 89 (67) | 0.575 | 0.381 | 381 | 324 | 0.376 | 376 | 388 |
| 10 000 | 938 (697) | 4.06 | 5.69 | 569 | 1 226 | 4.25 | 425 | 896 |

Time grows linearly (per token at 10 000 within 1.5x of 1 000 in numpy, 1.1x in the browser). Memory is linear too but large: about 90 KB
per token in numpy and 55 KB in the browser at D 1024, because the per-token addresses (aL, aR), the bigram terms and the prefix sums
(T x D complex each) are kept for the residual of each centre; 1 M tokens would need B's streamed computation (states_stream: running
prefix sums kept only at the centres), not built here. Scripts: scratchpad port/scale.py, scale.mjs (not in the repository).

## Open problems

1. The run failed both criteria. The deviation from E3d above is the first candidate; the pre-registered second run tests it.
2. The front end finds no action word in 8.8% of the requests (the same cause as for the one-request reader: data, step 3 of the plan).
3. The null probability rejects 6.1% of the requests and lets 60 false centres through; the attachment leaves out a name or value of
   9.6% of the requests (threshold 0.5 on weights trained against the spans).
4. Memory per token (above); the browser keeps every per-token address of the message.
5. Python and the browser agree on every output, and on the numbers to 1e-15, not bit for bit (libm / V8 last-bit differences and the
   order of sums in numpy's matrix products; the one-request reader has the same property).
6. bf5229e (set roles read over the sentence's words in Python) does not change calibration (see above); a comparison between this model
   and fix_p80_s0 on llm_score.mjs mixes only one change (the centre reader), since the browser reader was unchanged.
7. Mechanical tokenization: "I'm" inside a sentence becomes the name n_i_m (front end, both readers; not changed here).

## Files changed (working tree; agents do not commit since 2026-10-31 ~09:40; three earlier commits bf5229e, 28cda8a, 03ff6e5 are on main)

- training/sketch/msg_to_world.py: CENTRES=1 path (legend reader.centres, requests' tokens from the message, examples/messages.jsonl,
  REAL_WORLD.md into the world folder); unchanged with CENTRES unset (checked: the built world folder is identical to the HEAD script's).
- training/sketch/run_curve.sh: CENTRES=1 -> world worlds_centres/real, NEGATIVES=0, docs/model/real never replaced; with CENTRES unset
  every command line identical (checked with stubbed commands).
- training/sketch/llm_score.mjs, training/sketch/error_analysis.mjs: SEG=centres-model; other modes byte-identical outputs on
  fix_p80_s0 (default 46.5% / 335, SEG=gold 60.5% / 71, error analysis 61.0%; stdout and --dump compared with the HEAD scripts).
- training/vss/tool/sop/infer.py: the set role's `_margin.<role>` line written right after the role's line (as the browser).
- .gitignore: training/sketch/worlds_centres/.
- research/attention/port/NOTES.md (this file); docs/model/centres_p80_s0/ (the exported model, 28 MB).

## Run 2 (pre-registered above): phases keyed by the centre's event token. Result: FAIL

Built (working tree): `--centre_key event` in sop train (train.py), CentreModel(centre_tokens) in experiment/centres.py (rows = the 44
legend event tokens + '*', the batch carries each centre's row), Routebook.centre_addresses(c, lem) in infer.py and centreAddresses(c, lem)
in routebook.js (the route book carries `centre_tokens`; without it the kind keying of run 1 is used), export_web.py header
`centre_tokens`, run_curve.sh CENTRE_KEY=event. Parity on a mini event-keyed model (D 64, 30 unit steps) and on the trained model, the
253 dev messages, 1494 centres: all exact fields identical, numbers within 1e-15 (run 1's model re-checked with the new code: identical).
Found on the way: Python's fmt printed -0.0 as "-0.000", the browser "0.000"; Python now adds 0.0 first (changes Python output only for
an exact -0.0).

Model centres2_p80_s0 (`CENTRES=1 CENTRE_KEY=event PREFIX=centres2 run_curve.sh 0.8`, the same world rebuilt, seed 0, D 1024, 2 epochs,
751 steps, 237 s of training (run 1: 83 s), final cos -0.854 (run 1: -0.802); routebook.bin 31.8 MB (run 1: 22.5 MB). It replaced run
1's npz in worlds_centres/real/model; run 1's export stays in docs/model/centres_p80_s0.

| reader on dev (253 messages, 1126 gold wires; llm_score.mjs, the scorer of run 1) | correct | not done | done wrong | extra wires |
|---|---|---|---|---|
| fix_p80_s0, annotated spans | 60.5% | 15.3% | 24.2% | 71 |
| centres_p80_s0 (run 1, E3c in effect) | 47.7% | 19.1% | 33.2% | 143 |
| **centres2_p80_s0 (run 2, E3d)** | **50.6%** | **18.5%** | **30.9%** | **144** |

Criterion >= 58% and <= 100 extra wires: **both missed** (50.6%, 144). Run 2 vs run 1: +2.9 points, extras unchanged. Stopped (one run).

Root causes, run 2 (error_analysis.mjs SEG=centres-model, % of the 1126 requests; run 1 in brackets): X0 no event token in the span 8.8
(8.8), X1 every centre rejected by the null 6.1 (6.1), H a name / value of the span not taken by the centre 10.5 (9.6), G role wrong 7.9
(8.2), F role missed 4.2 (7.2), B wrong action 4.5 (4.4), C reader refuses 0.0 (0.7), D / E / G-description 7.1 (6.8). Extras: 60
accepted centres outside every span, 44 second centres in a span (both as run 1). Fully right in the analysis 50.9%.
What changed: role missed -3.0 and reader refusals -0.7 points (the keying helps where an address had to serve two roles); what did not:
the list / twin-role errors ("connect Bias to Hidden" -> from = [Bias, Hidden]: the set role members filled beside source; connect is
right in 18 of 173 requests, rules 106, the one-request reader on annotated spans 43; the open owner decision on twin list roles) and
everything that sits in the cut (null, attachment) and the front end, which the keying does not touch (X0 + X1 + H = 25.4 points).

Files changed for run 2 (working tree, in addition to the list above): training/vss/experiment/centres.py, training/vss/tool/sop/train.py
(`--centre_key`), training/vss/tool/sop/infer.py (centre_tokens rows; fmt of -0.0), training/vss/tool/sop/export_web.py (header
centre_tokens), docs/js/vss/routebook.js and docs/js/vss/reader.js (centre_tokens rows, lemmas passed), training/sketch/run_curve.sh
(CENTRE_KEY); new docs/model/centres2_p80_s0/ (37 MB). With CENTRES unset nothing changed in behaviour, checked after these changes:
fix_p80_s0 SEG=gold 60.5% / 71, default 46.5% / 335 (--dump byte-identical to the HEAD scripts'), the browser's one-request reader
identical on all 1126 dev spans (SOP text, residual, status) to the code before the port, run_curve.sh command lines identical.

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/centres2_p80_s0` (28e1385), `docs/model/centres_p80_s0` (28e1385), `docs/model/fix_p80_s0` (cf0545a), `docs/model/real` (530e54e). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
