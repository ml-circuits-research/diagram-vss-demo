# MEMORIZATION: how much does each reader memorise? (owner's question, 2026-11-02)

Owner: "VSS cannot learn the answers, while BERT can, right? We learn only the semantics of words. The risk with BERT and other large
models is that they learn the right answers and do not generalise: they have a larger memory."

This file has the plan (section 1, written before any number), then what each part was trained on (section 2, read from the code and
the BUILD.json / training logs), then the results (section 3+, added after the runs).

## 1. Plan (before any number)

**Hypothesis.** SOP-BERT (a fine-tuned DistilBERT, 6 layers, 768 wide, about 66M parameters) scores clearly higher on messages it was trained on than on messages of the
same kind it never saw. The VSS worlds' reading core (the vector-space transformations) shows a gap near zero, because its trained
numbers are word and route vectors shared by many requests. The parts of the VSS chain that are lists of learned features (the front
end's n-grams, the cutter, the context filler) can memorise and are measured separately.

**Memorisation gap** = score on trained messages minus score on unseen messages of the same kind, same scorer (llm_score.mjs
`PAIR=value` via risk_coverage.mjs): per requested action, the share done right, done wrong, not done; extras counted per message set
(extra actions per 100 requests). Also the **precision of execution** (right / (right + wrong + extra) among executed requests) at the
thresholds of `precision_thresholds.json` (PRECISION.md, operating point 97%, chosen on SOP-BERT's held-out split and VSS's), and the
share of requests done right at that threshold.

**Threshold that means "memorises":** the gap in "right" is at least 3 points AND its 95% interval (bootstrap over messages, 2000
resamples, seed 0) excludes 0. A gap under 3 points, or an interval containing 0, is "no measurable memorisation at this sample size".
Intervals are always printed; a small set is said to be small.

**Sets** (ids written by `training/sketch/memorization_split.py`; all by message, never by request):
- SOP-BERT: trained = 600 random messages of its training pool (`make_data.py split_messages`, 90% of the pool); unseen = its 585
  held-out messages (10%, seed 0) and the 1000-message sample (removed from its pool before the split).
- VSS: the world cores' own calibration split. `msg_to_world.py` sends the requests of 8% of the messages (sha256(id|cal) < 0.08) to
  `calib.sop`: these are never trained on by any world's weights (half set the presence thresholds, half are reported). 417 messages
  of the folders the shipped worlds read. Trained = 500 random other messages of the same folders.
- Cells that no reader trained on (cal and in SOP-BERT's held-out or sample) are reported on their own: they test both readers on
  exactly the same unseen messages.
- Single VSS reader without the chain: `SEG=gold MODEL=micro/<world>` on the gold spans of the world's own events, calibration
  messages vs the other messages (no cutter, no filler involved; the front end learned from all of them).

**Not decided from these runs:** any change to a model. Only a report. One run per set; if a run fails it is reported, not patched.

**Limits stated up front.** (a) No message is unseen by every part of the VSS chain (section 2), so the chain-level gap measured on
the calibration messages isolates the world cores only. Owner's decision (2026-11-02, 18:07): VSS is NOT retrained with data left out
(little data), so there is no GPU job; SOP-BERT will be re-fine-tuned on all data and a fresh test set is being written. (b) The
calibration messages are a hash sample of the same folders, so they are of the same kind as the trained ones; SOP-BERT's and VSS's
held-out sets are not the same messages, so their absolute scores are not comparable with each other except on the shared cell.
(c) **Deviation:** `precision_thresholds.json` has no threshold at 95 / 97 / 99% for `vss_old_margin` or `sop_bert` (null: the level
is not reached), so the PRECISION.md thresholds cannot be applied. Instead: precision of execution of everything executed, and at one
threshold fixed from the trained set (its median confidence) and applied unchanged to the unseen sets, which also shows whether the
confidence is as high on unseen messages. (d) The earlier records in scratchpad/rc are from an older composer and filler; VSS was
re-run on the committed HEAD (ac33631) in a snapshot; SOP-BERT is unchanged (same ONNX sha), so its held-out and sample records were reused.

## 2. What each part was trained on (from the code, not measured)

| Part | Trained on | Unseen messages |
|---|---|---|
| World cores (7, registry.json) | `DATA=spans`: 9 folders, 4640 messages; every request row except the 8% calibration messages | 417 (8% by sha256(id\|cal)) |
| Front end (`front.json` per world) | all rows of its own world, incl. the calibration messages (front.py learn on `load_msgs`) | none |
| Word cutter `cutter_worlds7s` | 7 folders + sonnet_short, haiku_short (not the two `*_spans` folders) | the 1000 `*_spans` messages |
| Event cutter `cutter_events` | the 7 folders only | `*_spans` and short messages |
| Context filler `weights.json` | 80% of the 4640 messages (FNV-1a of id, id%5 != 0): 3697 train, 943 test | 943 (20%) |
| SOP-BERT | its pool (7 folders + short, minus the 1000 sample), 90% of it; 585 held out | held-out 585, sample 1000 |

Messages unseen by core + cutter + filler: the calibration messages in a `*_spans` folder whose id hash is in the filler's test part
(16 messages). The front end saw them. So no message is unseen by every part.

Sizes of the models (what each can store): SOP-BERT about 66M parameters (6 layers, 768 wide); a VSS world has a few thousand route and word vectors (D=1024,
sparse export) plus the front end's n-gram tables (thousands of entries) and the cutter's perceptron weights.

## 3. Results (run 2026-11-02; models of the committed HEAD ac33631; scripts memorization_split.py, memorization_report.py)

Right / wrong / not done are shares of the requested actions; "extras" are actions nobody requested, per 100 requests.

### 3.1 SOP-BERT

| Set | Right / wrong / not done | Extras per 100 |
|---|---|---|
| Trained on (random 600 messages, 1700 requests) | 88.0 / 11.9 / 0.1 | 0 |
| Held-out 10% (585 messages, 1711 requests) | 83.8 / 13.9 / 2.3 | 5 |
| Sample, never in its pool (1000 messages, 4858 requests) | 80.8 / 16.5 / 2.8 | 7 |

Memorisation gap in "right": trained minus held-out **+4.2 points** (95% interval +1.6 to +6.7); trained minus sample **+7.2** (+5.1
to +9.3). Wrong rises from 11.9 to 13.9 and 16.5, not done from 0.1 to 2.3 and 2.8. Precision of execution (all executed): 87.9 trained,
81.6 held-out, 77.4 sample. At the trained set's median confidence (0.968), applied unchanged: 96.5 trained, 91.4 held-out, 89.5 sample,
so its confidence is not lower on unseen messages: it is as sure and more often wrong. Exact span texts that also occur in training:
13.1% of held-out requests, 11.0% of the sample: the unseen sets are not mostly repeats. The sample is a different mix (two annotator folders SOP-BERT
never saw), so the held-out gap (+4.2) is the cleaner number; the sample gap includes some shift of message kind.

### 3.2 VSS

World cores alone, on the annotated spans (no cutter, no filler), per world, `SEG=gold`, trained minus calibration messages:

| World | Right on trained / on unseen | Gap |
|---|---|---|
| shapes | 69.4 / 64.4 | +5.0 |
| links | 43.6 / 41.5 | +2.1 |
| position | 75.4 / 70.5 | +4.9 |
| graphq, questions, manage, history | 85.7 / 85.2, 85.3 / 84.2, 84.7 / 83.3, 98.0 / 95.7 | +0.5, +1.1, +1.4, +2.3 |
| All 7 together (20603 vs 2099 requests) | 72.7 / 69.5 | **+3.1** (interval +/-2.1 by request; no message clustering) |

The unseen requests of the gold-span test are 13.1% exact repeats of training span texts (the same as SOP-BERT's held-out), so the
comparison is fair. (links scores low on gold spans for both; it is the world's own reading, not memorisation.)

The whole composer (cutter, worlds, filler) on whole messages:

| Set | Right / wrong / not done | Extras per 100 |
|---|---|---|
| Trained (random 500 messages, 2452 requests) | 77.1 / 11.1 / 11.8 | 5 |
| Calibration messages: cores never trained on them (417, 2099) | 75.3 / 11.9 / 12.9 | 6 |

Gap in "right": **+1.8 points**, interval -0.9 to +4.6 (contains 0). Precision of execution 82.4 trained, 80.5 calibration; at the trained
median confidence: 85.9 vs 83.9. Not a measurable gap at this size. It is a lower bound for the whole chain, because the cutters,
front ends and filler saw these messages.

The same 117 messages that neither reader's core trained on (calibration messages that are also in SOP-BERT's held-out or sample):
VSS 77.0 / 11.3 / 11.6, SOP-BERT 82.5 / 14.7 / 2.9 (right / wrong / not done). SOP-BERT is higher in "right" but wrong 3.4 points more
often; VSS does less and asks more (not done 11.6 vs 2.9).

### 3.3 Which VSS part saw which messages, and what the data show

| Part | Unseen messages exist? | Measured effect |
|---|---|---|
| World cores | yes, 417 (8%) | gold spans +3.1 pts; composer +1.8 pts (not significant) |
| Cutters | yes: the 1000 messages of the two `*_spans` folders (cutter_events also: short) | cannot be separated: those folders are harder for both readers (VSS 66.4 vs 79.8 right, SOP-BERT 70.5 vs 86.1 on the same messages, SOP-BERT never trained on them) |
| Context filler | yes, the 20% test part (943 messages) | VSS right on filler-test messages 81.9 vs 79.0 on filler-train: no gap (104 vs 306 messages, small) |
| Front ends | none: learned from every row | not measurable here |

So only the world cores give a clean measurement. The cutter and front-end memorisation cannot be measured without retraining a
cutter or front end on less data (owner declined).

## 4. Answer to the owner's question

Yes for the direction, no for the size of the difference. SOP-BERT memorises measurably: on messages it was trained on it gets 88.0%
of requests right, on messages of the same kind it never saw 83.8% (a gap of 4.2 points, interval 1.6 to 6.7), and it is just as
confident on the unseen ones, so it makes more confident mistakes there (wrong 11.9 -> 13.9%, precision at the same confidence
96.5 -> 91.4%). The VSS world cores also show a small gap (3.1 points on gold spans, 1.8 points through the whole composer, the latter
not distinguishable from zero), so "VSS cannot learn the answers" is not exactly true at this scale: its trained numbers are
word and route vectors, but a world still scores some points higher on requests it was trained on. The two gaps are of similar
size (4.2 vs 3.1 on the core readers; the interval of each overlaps the other). The bigger difference is elsewhere: on unseen messages VSS
leaves 11-13% undone and is wrong 11-12%, SOP-BERT leaves 2-3% undone and is wrong 14-16%; BERT turns uncertainty into wrong
answers where VSS turns it into questions.

Where VSS can memorise: the front end's n-gram tables (value and trigger rules learned from the rows, including any repeated phrase),
the cutter (a perceptron over word features, trained on every message), the context filler (a few weights, little capacity). Where it
cannot: the route rows are shared by pairs of word kinds (a row stores "this kind next to that kind", not a sentence), and the word
vectors are fixed per word. These cannot hold a whole answer, but nothing in the data says the other parts memorise much either; the
test of the cutters and front ends needs a retrain with data held out, which was not done.

What is still open: the gap of the whole VSS chain (front end, cutters, filler) is unmeasured; the fresh test set the owner has
ordered will give an unseen set for both readers on the same messages (rerun memorization_report.py on its records).
