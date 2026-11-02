# CUTTER.md: does the existing BIO cutter cut a message into elementary units, how well, how big, what at the scale of English

Measurement and report only. Nothing in the pipeline, `docs/model/*` (except a scratch folder, deleted) or `front_params.json` was changed.
The "cutter" is the greedy averaged-perceptron BIO tagger of `front.py` (`train_segmenter`, `seg_decode`, `segment`; JS twin
`docs/js/front.js segment`), the labelled reference of VSS_READER_SPEC.md section 3 item 1 (FRONT_TAGGER=1). It labels each token
B (first token of a request) / I (inside) / O (outside every span); a unit = a B token plus the I tokens after it.
Scratch files: `/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/cutter/` (train.py, quality.py, growth.py,
time.mjs, front.json, seg_full.json, all scorer outputs `dev_*.out`, `fresh1_*.out`).

Assumption stated: the annotated spans are the definition of "one unit" (one request = one action or question). Where the cutter
disagrees with a span, I do not know whether the cutter or the annotation is wrong; I only count the disagreement.

## 1. The cutter, learned on the fit split of ALL training data

`DATA=all`, `split_of(m, 0.8)`: 2109 messages (of 2640), 125,987 tokens, `seg_epochs` = 8 (front_params.json), same trainer code, nothing tuned.
The dev files are disjoint from the fit split (checked: 0 of 531 dev messages fall in it).

| measured | value |
|---|---|
| weights (non-zero feature/label pairs) | 18,376 (B 6,443 · I 3,306 · O 8,627) |
| distinct features (strings, label dropped) | 8,687 |
| file size, as stored (JSON `segmenter` object in front.json) | 471,938 bytes (101,050 bytes gzipped); 14.7 characters per key on average |
| whole front.json (values + triggers + segmenter) | 644,992 bytes; the segmenter is 73% of it |
| weight range (integers = 1000 x averaged weight) | -27,462 .. 18,318 (fits int16) |
| training time | 10.9 s for 8 epochs over 125,987 tokens (Python, one core), 2.7 s at 25% |
| time to cut one message, JS (`front.js segment`, tokenization included) | 0.45 ms mean (dev 0.37 ms for 260 characters, msg2 0.35 ms for 208, long 1.10 ms for 669 characters) = 1.7 microseconds per character |
| time to cut one message, Python | 0.63 ms mean |
| Python and JS output | identical on all 531 dev messages |

Features per token: the lowercased word at offsets -2..+2 (names are mapped to a class by `ctx`), previous label, previous label + word, two
word bigrams, "starts a sentence" and a bias. It is a purely lexical model: there is no verb list, only what the spans taught. No neural
parameters; decoding is 3 x 12 table look-ups per token. A compact binary form was not built; a hashed int16 table of 2^15 buckets x 3
labels would be 192 KB (my arithmetic, not built, not tested for collisions).

## 2. Unit quality on the dev files

Dev files (read only, none used for fitting): `review/dev.jsonl` (253 msgs, 1126 requests), `dev_new/msg2/dev.jsonl` (233, 923),
`dev_new/long/dev.jsonl` (45, 519). Gold = the wires' `span` (found in the text), exact match after stripping spaces and commas
(`seg_eval.mjs` convention). Overlap = shares at least one word token. Script: `scratchpad/cutter/quality.py`.

| file | gold | units | exact P | exact R | exact F1 |
|---|---:|---:|---:|---:|---:|
| dev | 1126 | 1134 | 0.897 | 0.903 | 0.900 |
| dev_new/msg2 | 923 | 944 | 0.844 | 0.863 | 0.854 |
| dev_new/long | 519 | 524 | 0.803 | 0.811 | 0.807 |
| all three | 2568 | 2602 | 0.859 | 0.870 | 0.865 |

(Ignoring trailing punctuation changes nothing.) Quality falls with message length: 0.90 -> 0.81.

Requests overlapped per predicted unit, and units covering each gold request:

| file | unit overlaps 0 requests | 1 (elementary) | 2+ (merged) | gold covered by 0 units | by 1 | by 2+ (split) |
|---|---:|---:|---:|---:|---:|---:|
| dev | 45 (4.0%) | 1078 (95.1%) | 11 (1.0%) | 31 (2.8%) | 1090 (96.8%) | 5 (0.4%) |
| dev_new/msg2 | 40 (4.2%) | 895 (94.8%) | 9 (1.0%) | 36 (3.9%) | 862 (93.4%) | 25 (2.7%) |
| dev_new/long | 46 (8.8%) | 472 (90.1%) | 6 (1.1%) | 44 (8.5%) | 467 (90.0%) | 8 (1.5%) |
| all | 131 (5.0%) | 2445 (94.0%) | 26 (1.0%) | 111 (4.3%) | 2419 (94.2%) | 38 (1.5%) |

So 94% of the units are elementary by the annotation's definition, 1% are merged, 5% hold no request. 4.3% of the requests are not covered at all
(missed), 1.5% are split. The exact-span errors beyond that (F1 0.865 vs 94% elementary) are boundary shifts: a unit that overlaps one request but
starts or ends elsewhere.

Action tokens per unit (the verb tokens of the legend events, after the `kinds_p80_s0` front end `FR.normalize` on the unit text; the
event token list is the `verbs` of its model.json legend):

| unit class (all three files) | n | 0 action tokens | 1 | 2 | 3+ |
|---|---:|---:|---:|---:|---:|
| 0-request units | 131 | 53 | 66 | 11 | 1 |
| elementary units | 2445 | 337 (13.8%) | 1698 (69.4%) | 300 (12.3%) | 110 (4.5%) |
| merged units | 26 | 5 | 17 | 3 | 1 |
| for comparison: the GOLD spans | 2568 | 386 (15.0%) | 1764 (68.7%) | 309 (12.0%) | 109 (4.2%) |

"Exactly one action token" is NOT a property of a unit, not even of a gold span: 31% of the annotated spans have 0 or 2+ action tokens
(0: the learned trigger rules do not fire, e.g. an unseen trigger; 2+: "make X bigger", "put it ... and colour", a value-verb such as `color`
or `space` counted as an event token). The cutter's units match the gold spans in this distribution almost exactly, so the action-token count
cannot be used to judge the cutter. A merged unit is not recognised by having two action tokens (17 of 26 have one).

### 10 units with no request (text outside every span; random sample of the 131, seed 1)

Note: 6 of the 10 look like requests or statements of fact ("Base connects to Lift"): these are sentences the annotation left outside the spans
(descriptions of the diagram, not asks). Whether this is the cutter's error or an annotation convention (LABEL_CONVENTIONS.md) I did not check.

| file / id | unit | action tokens |
|---|---|---:|
| dev sm-0466 | Base connects to Lift | 1 |
| dev sm-0325 | A1 goes to B3 and B3 goes to C5 | 0 |
| msg2 sm2-0360 | Wr1 should be bigger | 1 |
| dev sm-0432 | Camera1 and Camera2 both watch the Vault | 0 |
| long sl-0214 | The Tent in the middle | 1 |
| long sl-0178 | The Hawk is the apex | 1 |
| long sl-0184 | Crew attach to it | 0 |
| long sl-0077 | From Idle it can go up or down | 1 |
| msg2 sm2-0091 | call it a standby | 1 |
| dev sm-0375 | Is there something that isn't gold or navy | 1 |

### 10 merged units (a unit over 2+ gold requests; 10 of the 26)

| file / id | unit | requests overlapped | action tokens |
|---|---|---:|---:|
| msg2 sm2-0445 | Red to Green to Amber to Red | 2 | 0 |
| dev hm-0022 | connect Intake to Triage with an arrow, then connect Triage to Fixed with a dotted line | 2 | 1 |
| msg2 sm2-0202 | Throw Retry under No and tie No to Retry | 2 | 0 |
| msg2 sm2-0318 | Park Left at the far left and Right at the far right | 2 | 0 |
| msg2 sm2-0593 | Cloud to Rain, Rain to Sea, Sea to Cloud | 2 | 0 |
| long sl-0203 | Put the Tent left of the Stage and the Stand right of it | 2 | 1 |
| msg2 sm2-0340 | Put Now above Next and Next above Later | 2 | 1 |
| dev sm-0397 | Mirror at the left wall, Barre in front of it | 2 | 1 |
| dev sm-0396 | Put the Display at the top, large and cyan | 2 | 1 |
| dev sm-0065 | Turn the Sun into a yellow star, put it at the top right | 2 | 1 |

Pattern: merges are "X and Y" / chains where the second request has no verb of its own (ellipsis: "and Next above Later", "Barre in front of it")
or comma-joined lists of pairs. These are exactly the cases where the second request has no trigger word to start a B.

## 3. End to end (reader scored with each cut)

Scorer `llm_score.mjs`, VSS column. Model = `kinds_p80_s0` / `comb1_p80_s0` exported as they are (route book trained on the 947 messages
of DATA=old, fit split), in a scratch copy (`docs/model/_cutter_tmp_kinds`, `_cutter_tmp_comb1`, since deleted) whose front.json had only its
`segmenter` replaced by the scratch cutter of section 1 (SEG=tagger still works: the unit texts are passed to `FRONT.normalize` with that
front.json's values and triggers). The segmenter-only difference means the SEG=gold / default / q1 columns are identical to the unmodified models.
Rows with cut "tagger" = the cutter of this file; "default" = the VSS reader's own cut; "q1 Q1B" = SEG=q1 Q1B=1.
Dev = the three files together (531 messages, 2568 requests), aggregates from `dev_*.out`.

kinds_p80_s0, dev (3 files):

| cut | correct | not done | done wrong | extra wires | messages fully right |
|---|---:|---:|---:|---:|---:|
| SEG=gold (annotated spans) | 56.7% | 23.8% | 19.5% | 201 | 15.4% |
| **SEG=tagger (this cutter)** | **54.8%** | 25.5% | 19.7% | 268 | 14.1% |
| default own cut | 47.0% | 22.4% | 30.6% | 974 | 4.3% |
| SEG=q1 Q1B=1 | 51.7% | 24.5% | 23.9% | 445 | 11.5% |

comb1_p80_s0, dev (3 files):

| cut | correct | not done | done wrong | extra wires | messages fully right |
|---|---:|---:|---:|---:|---:|
| SEG=gold | 56.8% | 23.4% | 19.8% | 190 | 16.0% |
| **SEG=tagger** | **54.9%** | 25.2% | 19.9% | 257 | 14.9% |
| default own cut | 46.8% | 22.4% | 30.8% | 974 | 4.0% |
| SEG=q1 Q1B=1 | 52.1% | 24.1% | 23.8% | 421 | 11.5% |

Per dev file, "wires right" (kinds): dev gold 65.6 / tagger 64.1 / default 53.0; msg2 51.8 / 49.4 / 45.0; long 46.2 / 44.1 / 37.6.

fresh1 (sonnet 500 + haiku 500 = 1000 messages, 5544 requests; aggregates only; set already scored before, see TEST_LOG.md).
SEG=tagger is the new run (two lines added to TEST_LOG.md); gold, default, q1 are the earlier logged runs of TEST_LOG.md (not re-run).

| model | cut | correct | not done | done wrong | extra wires | messages fully right |
|---|---|---:|---:|---:|---:|---:|
| kinds_p80_s0 | SEG=gold | 61.4% | - | - | 392 | - |
| kinds_p80_s0 | **SEG=tagger** | **57.6%** | 21.5% | 20.9% | 564 | 11.0% |
| kinds_p80_s0 | default own cut | 53.2% | 16.0% | 30.8% | 1651 | - |
| kinds_p80_s0 | SEG=q1 Q1B=1 | 57.0% | 19.9% | 23.1% | 750 | - |
| comb1_p80_s0 | SEG=gold | 61.1% | - | - | 392 | - |
| comb1_p80_s0 | **SEG=tagger** | **57.1%** | 21.6% | 21.2% | 565 | 10.8% |
| comb1_p80_s0 | default own cut | 53.1% | - | - | 1650 | - |
| comb1_p80_s0 | SEG=q1 (no Q1B) | 54.6% | - | - | 711 | - |

("-" = not in the TEST_LOG line.) The rules reader on the same sets is unchanged by the cut: dev 65.8% correct / 487 extra, fresh1 73.8% / 748.

Reading: the cutter closes about 3/4 of the gap between the VSS reader's own cut and the annotated cut on dev (47.0 -> 54.8, gold 56.7) and about
half on fresh1 (53.2 -> 57.6, gold 61.4), with a fraction of the extra wires (dev 974 -> 268). It is equal to or better than the q1 cut + Q1B
(57.0 on fresh1, 51.7 dev). The gap that remains to the gold cut is 2 points dev, 3.8 points fresh1; the 25% of requests "not done" are not the cut's
(they are the same with gold). The cutter was never trained on fresh1 or on the dev files.

## 4. Size at the scale of English

### Measured: growth of the cutter with data
Same trainer, nested subsets of the fit split (messages hashing below 0.8 x share), 8 epochs each. N = tokens in the training messages.

| share of fit split | messages | tokens N | word types (lowercased, names mapped) | features | weights |
|---|---:|---:|---:|---:|---:|
| 6.25% | 137 | 8,157 | 1,116 | 2,340 | 4,914 |
| 12.5% | 254 | 15,425 | 1,607 | 3,391 | 7,123 |
| 25% | 515 | 31,750 | 2,400 | 4,746 | 9,995 |
| 50% | 1,033 | 61,791 | 3,324 | 6,304 | 13,311 |
| 75% | 1,576 | 93,830 | 4,022 | 7,689 | 16,254 |
| 100% | 2,109 | 125,987 | 4,516 | 8,687 | 18,376 |

Least-squares fit in log-log (Heaps style, y = K N^b), six points / last four points (25..100%):
- word types: b = 0.513 / 0.462 (classic Heaps for English text is about 0.4-0.6)
- features: b = 0.472 (K 34.6) / 0.442 (K 48.7)
- weights: b = 0.475 (K 70.8) / 0.445 (K 99.2)
The exponent is already falling with N (0.47 -> 0.44), as expected when a narrow-domain vocabulary starts to saturate. One run per share, no seeds
repeated: the exponents have an uncertainty I did not measure (my guess: +-0.03).

### Extrapolated (power law; not measured)
| training data | tokens | features | weights | as stored (JSON, 26 bytes/weight) |
|---|---:|---:|---:|---:|
| measured: 1x (our fit split) | 126 k | 8.7 k | 18.4 k | 0.47 MB |
| 10x our data | 1.26 M | 24-26 k | 51-56 k | 1.3-1.5 MB |
| 100x our data | 12.6 M | 67-78 k | 143-167 k | 3.7-4.3 MB |

Assuming the same kind of text (diagram requests, same domain, same annotation). 100x our data is about 21,000 messages. A cutter for THIS
world therefore stays under 5 MB even stored as verbose JSON (under 1 MB as int16 table), and decoding cost does not grow with the weights
(table look-ups per token), so about 0.5 ms per message stays.

### A general English clause / sentence-unit cutter (extrapolation, plus known values from memory)
Same recipe (lexical features, no pretrained embedding) on open-domain English: the exponent of a mixed-domain corpus is higher than ours
(narrow domain), plausibly 0.5-0.6 for types, and I do not know it. Using our fitted line only as a floor and b = 0.5-0.55 as a rough upper
range: 10 M tokens -> 60-70 k features (our fit) up to about 150-250 k; 100 M tokens -> 170-210 k (our fit) up to about 0.5-1 M features; a
hash table makes the size independent of the vocabulary. My estimate: a purely lexical perceptron cutter for general English clauses would be
**0.3-1.5 M weights, 1-6 MB** (int16 + hashing: 1-3 MB), 1 ms-scale per sentence on a CPU. This is an estimate; what is measured is only the
table above. What it would NOT do is decide a clause boundary that needs meaning ("I saw the man who ... "): a lexical window of 5 words cannot.

Known small models for the same job (values from my memory of papers/model cards, rounded; verify before quoting):

| model | parameters | size | note |
|---|---:|---:|---|
| this cutter (measured) | 18 k weights | 0.47 MB JSON | diagram domain |
| CRF clause/chunk tagger (CoNLL-2000/2001 style, CRF++/crfsuite) | 0.5-5 M weights (sparse) | 5-50 MB text model files, ~1-10 MB binary | known order of magnitude, not a specific model |
| BiLSTM(-CRF) tagger, 1-2 layers, 100-300 dim, 20-50 k vocabulary | 3-15 M (most of it the embedding table; the LSTMs 0.5-2 M) | 12-60 MB fp32 | e.g. computed from the dimensions, not a published single figure |
| spaCy `senter` / small CNN pipeline | about 0.5-1 M | about 1-5 MB | approximate |
| NLTK Punkt (unsupervised sentence splitter) | a few thousand abbreviation/collocation entries | < 1 MB | splits sentences only, not clauses |
| bert-tiny (L2 H128) / bert-mini (L4 H256) | 4.4 M / 11 M | 17 / 45 MB fp32 | published |
| ELECTRA-small / TinyBERT-4L / MobileBERT | 14 M / 14.5 M / 25 M | 55 / 58 / 100 MB fp32 | published |
| DistilBERT-base | 66 M | 255 MB fp32 (about 64 MB int8) | published; most-used distilled token classifier |
| BERT-base | 110 M | 440 MB fp32 | published |
| learned multilingual sentence segmenters (SaT / wtpsplit family) | tens of M up to hundreds of M | 100 MB+ | published family, exact counts not remembered |

Where a transformer would be needed: the cutter's remaining errors (merged ellipsis "and Next above Later", split requests, the 5% units that hold no request)
are decisions that need the meaning of the next words, which a window of +-2 words only partly sees. A 4-layer/128-256-dim token classifier
(5-15 M parameters) is the smallest class of model I would expect to fix part of it; I did not test this.

## Answers in short
1. Does it do the job? Yes, mostly: 94% of its units cover exactly one annotated request, 1% merge two, 5% hold no request (often a diagram
   description left outside the spans), 4.3% of requests are not covered, 1.5% are split; exact-span F1 0.90 / 0.85 / 0.81 on short / medium / long messages.
2. How well end to end: dev 54.8% correct vs 47.0% (VSS own cut) and 56.7% (annotated cut); fresh1 57.6% vs 53.2% and 61.4%.
3. Size and speed: 18,376 weights, 8,687 features, 472 KB JSON, trained in 11 s, 0.45 ms per message in JS.
4. Scale: measured exponent about 0.44-0.47; 10x data about 2.8x the weights, 100x about 8x (this world, extrapolated); general English: estimated 0.3-1.5 M weights, a few MB.

## Notes and caveats
- The scratch copies `docs/model/_cutter_tmp_kinds` and `_cutter_tmp_comb1` were deleted after the runs.
- The route books were trained on DATA=old (947 messages) while the cutter used DATA=all (2109); this mixes two fit sets but the dev files are outside both.
- Dev scores of the three dev files were seen before by others (they are held-out training messages, not a fresh test set); fresh1 was scored before.
- No hand-written equivalence was added; the cutter is the existing code, unmodified.

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/comb1_p80_s0` (a76b4e3), `docs/model/kinds_p80_s0` (a76b4e3). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
