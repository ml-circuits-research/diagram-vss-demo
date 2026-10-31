# Why VSS misreads perfectly cut requests (2026-10-31)

Setup: the 253 held-out TRAINING messages (20% dev split, corrected labels), 1126 gold requests, each read ALONE from its annotated
span (no cut errors). Model final_p40 (learned front end, trained before the label fixes, thresholds calibrated in-sample). Scoring
as llm_score.mjs. Script: error_analysis.mjs. No training, no tuning.

Fully right: 605 / 1126 = 53.7%. Reader status: ok 658, abstain 344, unknown-event 93, no-sense 31.

| cause of the miss | % of all requests | where the cause sits |
|---|---|---|
| a list role (several shapes) filled where the gold has one shape: "connect Bias to Hidden" -> from Bias AND Hidden | 10.1 | our set-role port: member thresholds |
| action word not recognized (verbless or fronted openings: "the X ...", "are X and Y connected", "slide") | 9.3 | front end: learned triggers |
| role missed (reference shape 38, colour 20, position 15, other 20) | 8.5 | presence thresholds (calibrated in-sample) / model |
| wrong action or type ("Is Paused a circle" read as a fact; "what is next to X" neighbors vs list) | 7.2 | model / label conventions |
| name not reachable (pronouns, "$new", context) | 4.4 | front end / reasoning context |
| value not reachable ("bottom left corner", "oval", "every" -> all) | 2.4 + 0.6 | front end: learned values |
| reader refuses (no-sense) | 1.7 | model |
| source/target swapped, other role errors | ~2 | model |

Words without a kind of their own (read as `unknown`): 3.1% of the words in right requests, 7.2% in wrong ones. The kinds compress
little information here: spans are short and their words mostly have kinds; most misses are not kind collisions.

Reading: about 30 of the ~46 missing points sit in our pipeline (list-role thresholds, triggers, values, calibration), not in the VSS
core. They are fixable with the protocol already prepared (held-out calibration) and with the learned front end; the rest (~15 points:
wrong type, refusals, swaps, part of the missed roles) is the model.

## Fixes verified without retraining (same model, same 1126 requests)

| change | fully right |
|---|---|
| before | 53.7% |
| a set role (list) is first judged present by its own presence threshold, as every other role (infer.py and reader.js; before, one member above the member threshold made the list "present", so "connect Bias to Hidden" also filled the list with both names) | 54.4% |
| a list's members ordered by their position in the text (a VSS set is unordered; "arrange C, G and D" came back as C, D, G) | 55.4% |

What is left in "role wrong" (113): lists still misread by the model (the first member of a chain missed; "connect Hub to Lamp and
Sensor" filling both the source list and the target list: 92), source and target swapped on "disconnect A from B", self-corrections.
These, the action words not recognized (front end), the values not reachable (front end) and the missed roles (thresholds calibrated
in-sample) need a rebuild and a retraining with the corrected labels and the held-out calibration.

## Two front-end changes tried, measured without training, reverted (2026-10-31)

Front end learned on the 80% fit split, measured on the 1126 dev requests (event token present / right, request fully readable by the
converter, triggers firing in the 312 chatter sentences):

| front end | no event token | wrong event token | fully readable | false triggers in chatter |
|---|---|---|---|---|
| as committed | 8.2% | 16.6% | 79.7% | 55 |
| no value n-gram over annotated trigger words + rules ordered by the lower bound of their precision | 8.0% | 16.5% | 78.2% | 67 |
| no value n-gram over annotated trigger words only | 8.0% | 16.2% | 78.4% | 67 |

Neither is better on balance (fewer readable requests, more false triggers); both reverted. The front end's remaining misses are
mostly data coverage (rare verbs: "slide", "touch") and questions whose action is spread over the sentence ("are X and Y connected").

## Retrained with the corrected labels and the held-out calibration (model fix_p80_s0, 80% fit split, seed 0)

Same 1126 held-out requests. Previous model: final_p40 (old labels, 40% share, thresholds calibrated in-sample).

| | final_p40 | fix_p80_s0 |
|---|---|---|
| VSS, requests cut as annotated (the reading alone) | 52.2% | 60.5% |
| VSS, requests cut by the tagger | 50.4% | 58.7% |
| rules (for reference) | 69.7% | 70.4% |
| extra wires (not asked for), VSS annotated cut | 80 | 71 |

Causes of the misses, fix_p80_s0 (error_analysis.mjs; read alone, 61.0% fully right):

| cause | % of requests |
|---|---|
| no action word found (status unknown-event or no event token) | 8.2 |
| wrong action or type | 6.5 |
| reader status no-sense | 0.8 |
| value not reachable | 2.2 |
| name not reachable | 4.1 |
| role missed | 7.2 |
| description read differently | 1.6 |
| role wrong (mostly lists) | 8.4 |

Reader status: ok 731, abstain 294, unknown-event 83, no-sense 18. Words with no kind of their own: 1.7% (right) vs 5.5% (wrong).

The tagger is out of the pipeline (owner's decision): the browser and llm_score.mjs now cut by the VSS reader's own centres
(vss-centers.js). With fix_p80_s0 on the same dev requests: 46.5% fully right, 335 extra wires (annotated cut 60.5% / 71). The gap
is the centres' false and missed action words; the centre attention (research/attention/PROPOSAL.md) and the text outside the spans
as negative training examples are the next steps.

## Plan step 1: text outside the spans as negative training examples (model neg_p80_s0, 80% fit split, seed 0): FAILED

Change (one): msg_to_world.py adds, for every sentence of a training message that touches no annotated span and whose normalized form
carries an action token, one wire of that event with no roles and `_negative=true` (sop train: target = minus its compiled state,
vss-demo R81). Negatives go to train.sop only (never calib.sop), none from the calibration messages; sop train keeps them in the
`train` split and leaves them out of the schema, the calibration rows and the evaluation (checked in train.py; no patch needed).
Off by default since the step failed (`NEGATIVES=1` turns them on). Same 947 messages and 4282 positive rows as fix_p80_s0; 168 negatives among 4068 training rows.
Trained with run_curve.sh (D 1024, 2 epochs, held-out calibration) and training/vss/tool/sop/infer.py as it was before bf5229e.

Criterion fixed before training: own-cut extra wires < 150 AND reading alone >= 60%. Dev = the 253 held-out training messages,
1126 requests.

| | fix_p80_s0 | neg_p80_s0 |
|---|---|---|
| VSS, requests cut as annotated (the reading alone, llm_score SEG=gold) | 60.5% | 62.4% |
| extra wires, annotated cut | 71 | 66 |
| VSS, requests cut by its own centres (vss-centers.js) | 46.5% | 47.3% |
| extra wires, own cut | 335 | **333** |
| error_analysis.mjs, read alone, fully right | 61.0% | 63.0% |
| sop train heldout_formulations FULL | 0.610 | 0.610 |

Result: reading alone >= 60% holds; extra wires 333, not < 150. The step failed. (The +1.9 points on the reading alone are one seed;
the spread between seeds is not measured yet: plan step 5.)

Root causes (measured on the same dev messages, both models):

1. Most extra wires do not come from the text the negatives cover. Each extra wire's source text placed in its message:
   inside an annotated span (one request cut into several, or a stretch of a request read on its own) 261 / 261; in a sentence that
   touches no span 51 / 51; in the outside part of a sentence that also holds a span 23 / 21 (fix / neg). So even a perfect
   rejection of the outside sentences would have left about 260 extra wires: the criterion could not be met by this change.
2. The negative target cannot change what the cut decides. vss-centers.js drops a centre only when the reader's status is
   `unknown-event` (no event token, decided by the words) or `no-sense` (more than half of the tokens unplaced, decided by placing);
   no status reads the sign or size of the predicate term, which is all a negative trains. On the 168 trained negatives themselves:
   fix_p80_s0 no-sense 109, ok + abstain 59; neg_p80_s0 no-sense 108, ok + abstain 60. Mean residual on them 0.82 / 0.84 (positives
   0.15 / 0.16), but the residual does not separate the cut's extra stretches from the annotated spans (median 0.00 for both, upper
   quartile 0.40 vs 0.42), because the cut picks the short stretch that explains itself.
3. The word "is" is the largest single source: 136 of the 333 extra wires are `fact` wires (the event token of `fact` is "is"),
   mostly 1-3 word stretches inside questions ("which shape is the biggest" -> "shape is the": 22; "Is": 17; "Who is the": 4).
   Next: path 33, connect 28, check 22, move 19, list 17.
4. The reading alone (unchanged causes, neg_p80_s0, % of requests): role wrong (mostly lists) 7.2; no action word 8.2; role missed
   6.7; wrong action or type 6.0; name not reachable 4.3; value not reachable 2.2; description read differently 1.6; no-sense 0.9.

What this means for the plan: the extra wires are a cut problem (which stretch belongs to which centre, and words like "is" that are
an event token in one construction and not in another), not a "the reader has never seen non-requests" problem. Negative examples
as built here do not reach the decision that makes the extra wires. Step 2 (centre attention: attachment of every word to a centre,
trained on the spans) addresses cause 1 and 3 directly; whether a status that reads the predicate term should exist is a reader
decision for the owner, not tuned here.
