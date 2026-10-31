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
llm_score.mjs).

## Parity (Python numpy vs browser, same exported numbers)

parity_centres.py writes a golden file (numpy reader on the dequantized routebook.bin / stars.bin), parity_centres.mjs compares.
Exact: message tokens, centres, acceptance, members, SOP text of every reading, status, ignored spans. Numbers: null probabilities,
residuals, states (relative). "Bit-exact" holds for the outputs; the numbers agree to ~1e-16, not to the last bit, because numpy's and
V8's cos / sin / exp may differ in the last bit and numpy's matrix products sum in another order (the one-request reader has the same
property).
- mini model (D 64, 30 unit steps, only to test the code), 253 dev messages, 1494 centres: all exact fields identical; max |null diff|
  1.1e-16, residual 5.6e-16, state 2.2e-16.
