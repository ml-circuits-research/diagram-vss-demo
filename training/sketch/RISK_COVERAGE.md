# Risk-coverage: does VSS know better than SOP-BERT where it does not know?

Owner's question (2026-11-02): "VSS is more explainable: doesn't it know better where it does not know? Can we do that with the
fine-tuned BERT too?" No training here: both readers as published; each produced request gets a confidence, the requests are sorted by
it, and the low ones are turned into "asked" (not done).

## Method (written before any result was looked at)

Readers. VSS = the composer (SEG=composer, docs/model/micro/registry.json, through training/sketch/llm_score.mjs `vssFormalize`).
SOP-BERT = docs/model/neural/sop-bert (q8, cpu) through docs/js/neural.js `formalizeJoint` with its own cut, the context rule
`nextContext` of docs/js/vss-composer.js (as training/laptop/neural_score.mjs ZS=sop-bert). Metric: per request, PAIR=value, the
scoring code of llm_score.mjs; every produced request is right, wrong (paired with a gold request, a key differs) or extra (paired
with none).

Confidence of one produced request (one number per reader, fixed here):
- VSS: the minimum of the chosen reading's margins (`unit.vss.margins`: event, structure, every role, attribute, determiner, speaker,
  scope margin), i.e. the reader's own `_margin`, the number its status `abstain` (< 0.05) is computed from. No margin: 0.
- SOP-BERT: min(p_act, p of every role the request fills). p_act = softmax probability of the chosen act (act head). For each key of
  the act (reader.act_keys) that got a value: a class key -> its class-head probability; a name role -> its fill-head probability
  (written / context / description) and, when written, the lowest tag probability of its words; a description -> also every
  desc:<key> head probability with a value; a tag key (count, distance, name, label) -> the lowest tag probability of its words.
  No temperature scaling (a monotone rescaling of one number changes neither the ranking nor the curves; only the calibration table).

Curves. Per reader and data set, the produced requests are sorted by confidence, highest first; keep the top x% (executed), the
rest are asked (not done; their gold requests become "not done", an asked extra disappears). For each x: right and wrong as % of the
gold requests; extras as a count. Equal confidences are one block: inside a block the counts grow linearly (the expected value of a
random order). Context effects of not executing a request (a later "it") are not re-run: a request's outcome is the one it has
when everything is executed.

Numbers per reader:
- right at equal wrong: the right % of gold at wrong = 11.4, 10, 8, 6, 4, 2 % of gold (interpolated on the curve); and SOP-BERT's
  wrong at VSS's full right;
- AURC: mean, over the coverages 1..N produced requests, of the share of the kept requests that are not right (wrong or extra);
  E-AURC = AURC minus the AURC of a perfect ordering of the same requests (ranking quality alone, the error rate taken out);
  AUROC of the confidence for right vs not right;
- calibration: confidence bins -> share right / wrong / extra.

Threshold for SOP-BERT (chosen on the held-out split of finetune_roles.py: make_data.py split_messages, seed 0, 585 messages, 1711
requests; the 1000-message sample is not used to choose it): ask instead of execute when the confidence is under t, with
- T1: t maximising, on held-out, right kept - (wrong + extra) kept (an executed request that is not right costs what a right one gains);
- T2: the same with not-right counted twice (right - 2 (wrong + extra));
- T3: the lowest t whose held-out wrong is at most 11.4% of gold (VSS's wrong on the sample), if SOP-BERT's held-out wrong is above it.
Each t is then applied unchanged to the sample (and the short set) and the right / wrong / not done / extra there are reported.

Data. The fixed 1000-message sample (training/sketch/eval/sample1000/*, ids training/neural/sample1000_ids.txt): never trained on by
SOP-BERT; the VSS worlds are trained on the annotated folders it is drawn from (no hidden test set, AGENTS.md). The short set
(llm_train/sonnet_short + haiku_short, 3000 one-request commands): 90% of it is SOP-BERT training data (the other 299 are held-out);
reported as such.

## Run (2026-11-02)

`node training/sketch/risk_coverage.mjs run <out> <set> <dirs>` then `... report <records>`; records in
/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/rc/ (sample.jsonl, heldout.jsonl, short.jsonl, report_all.md).
Models: registry.json sha256 as of 13:20 today (7 worlds, cutter_worlds7s, event hint H1, context/weights.json); sop-bert
model_quantized.onnx q8, cpu. The per-request outcomes are checked against llm_score.mjs `tally` on every message (identical totals), and
the totals reproduce the owner's numbers: sample VSS 77.2 / 11.4 / 11.4 (+334), SOP-BERT 80.8 / 16.5 / 2.8 (+348). vss-composer.js,
vss-context.js and llm_score.mjs were edited by others during the run; 108 sample messages re-run on the edited code gave identical records.

## Results

### Ranking quality (does the confidence separate right from not right?)

| set | VSS AUROC / E-AURC | SOP-BERT AUROC / E-AURC |
|---|---|---|
| sample (1000 msg, 4858 req) | 0.589 / 0.155 | 0.721 / 0.101 |
| held-out (585 msg, 1711 req) | 0.583 / 0.147 | 0.725 / 0.084 |
| short, 299 held-out commands | 0.571 / 0.211 | 0.815 / 0.057 |
| short, 2701 trained commands | 0.594 / 0.193 | 0.872 / 0.027 |

AUROC 0.5 = the confidence says nothing; 1 = it ranks every right request above every not-right one. E-AURC: lower is better
(0 = perfect ranking). AURC (error rate included): sample VSS 0.175, SOP-BERT 0.129.

### Risk-coverage on the sample (executed = % of the reader's own produced requests; extras still executed in brackets)

VSS (4637 produced):

| executed | right % of gold | wrong % of gold (extra) |
|---|---|---|
| 100% | 77.2 | 11.4 (334) |
| 95% | 74.2 | 10.2 (306) |
| 90% | 71.2 | 8.9 (284) |
| 80% | 64.2 | 7.3 (236) |
| 70% | 56.7 | 6.2 (190) |
| 60% | 48.8 | 5.2 (159) |
| 50% | 40.7 | 4.2 (137) |
| 30% | 23.9 | 2.9 (86) |
| 10% | 7.0 | 1.8 (36) |

SOP-BERT (5072 produced):

| executed | right % of gold | wrong % of gold (extra) |
|---|---|---|
| 100% | 80.8 | 16.5 (348) |
| 95% | 79.0 | 14.1 (300) |
| 90% | 76.3 | 12.5 (249) |
| 80% | 70.0 | 9.7 (183) |
| 70% | 62.4 | 7.7 (141) |
| 60% | 54.5 | 5.8 (113) |
| 50% | 46.2 | 4.1 (91) |
| 30% | 28.0 | 2.1 (58) |
| 10% | 9.8 | 0.3 (16) |

### Equal-wrong comparison, sample (right % of gold when both are cut back to the same wrong %)

| wrong % of gold | VSS right % | SOP-BERT right % |
|---|---|---|
| 11.4 | 77.2 (all executed) | 73.8 (86% executed) |
| 10 | 73.9 | 71.0 |
| 8 | 67.8 | 64.1 |
| 6 | 55.5 | 55.0 |
| 4 | 38.5 | 45.9 |
| 2 | 10.1 | 26.8 |

The other way: SOP-BERT cut back to VSS's 77.2% right still has 13.3% wrong (+265 extra), against VSS's 11.4% (+334).
Same table on the held-out split: at 11.4 / 8 / 4 / 2% wrong, VSS 78.0 / 70.3 / 46.9 / 16.1, SOP-BERT 83.1 / 73.1 / 55.3 / 27.0.
Short set (3000, mostly SOP-BERT training data): at 8 / 4% wrong, VSS 60.9 / 37.7, SOP-BERT 81.5 / 72.1; on its 299 held-out
commands VSS 54.8 / 29.1, SOP-BERT 70.6 / 52.2.

### Calibration, sample (share of the produced requests in each confidence bin)

VSS (confidence = min margin):

| margin (n) | right % | wrong % / extra % |
|---|---|---|
| >= 0.5 (495) | 74.1 | 18.0 / 7.9 |
| [0.3, 0.5) (1061) | 88.5 | 5.9 / 5.6 |
| [0.2, 0.3) (1062) | 86.8 | 8.5 / 4.7 |
| [0.15, 0.2) (441) | 85.3 | 8.2 / 6.6 |
| [0.1, 0.15) (451) | 78.7 | 12.0 / 9.3 |
| [0.05, 0.1) (496) | 78.2 | 14.1 / 7.7 |
| < 0.05, status abstain (631) | 64.0 | 23.8 / 12.2 |

SOP-BERT (confidence = min probability):

| probability (n) | right % | wrong % / extra % |
|---|---|---|
| >= 0.99 (1469) | 89.3 | 6.8 / 3.9 |
| [0.95, 0.99) (1140) | 87.2 | 9.6 / 3.2 |
| [0.9, 0.95) (585) | 76.2 | 18.8 / 5.0 |
| [0.8, 0.9) (647) | 77.3 | 16.8 / 5.9 |
| [0.7, 0.8) (345) | 67.0 | 22.6 / 10.4 |
| [0.5, 0.7) (470) | 56.4 | 29.1 / 14.5 |
| < 0.5 (416) | 42.3 | 37.5 / 20.2 |

SOP-BERT's probability is monotone (higher = more often right) but over-confident under 0.95 (a request at 0.8-0.9 is right 77% of
the time). VSS's margin is not monotone: the highest margins (>= 0.5) are right only 74% of the time, as often as margins 0.05-0.15;
only the `abstain` bin (< 0.05) is clearly worse. Held-out shows the same shapes (VSS >= 0.5: 74.1% right; SOP-BERT < 0.5: 47.5%).

### Thresholds for SOP-BERT (chosen on held-out, applied unchanged)

| rule (t) | held-out: right / wrong / not done, extra | sample: right / wrong / not done, extra |
|---|---|---|
| none (execute all) | 83.8 / 13.9 / 2.3, +85 | 80.8 / 16.5 / 2.8, +348 |
| T3 wrong <= 11.4% (t = 0.287) | 83.1 / 11.4 / 5.5, +81 | 80.3 / 14.7 / 5.0, +332 |
| T1 right - not right (t = 0.357) | 82.5 / 10.6 / 6.9, +77 | 79.6 / 14.3 / 6.1, +312 |
| T2 right - 2 not right (t = 0.595) | 76.7 / 8.4 / 14.9, +63 | 75.1 / 12.0 / 12.9, +227 |

(VSS for reference: 77.2 / 11.4 / 11.4, +334 on the sample.) Asked on the sample: T1 200, T2 612 of 5072 produced requests.
On the short set: T1 80.6 / 7.0 / 12.4, T2 72.8 / 4.1 / 23.1 (VSS 65.2 / 9.5 / 25.3).
The thresholds do not carry over one for one: the sample is harder for SOP-BERT than its held-out split (the held-out messages come
from the folders it was trained on; the sample's bench_*_spans folders, ids h- and s-, are not among them: there SOP-BERT has
21.0% and 28.0% wrong, VSS 12.9% and 14.3%). So a threshold set on held-out for 11.4% wrong gives 14.7% on the sample.

### Not pre-registered (looked at after the results; not used for the answer)

Other VSS numbers as a confidence, AUROC on the sample: residual 0.68 (lower = more right), words not understood 0.66, status ok vs
abstain 0.57, tie / decidedBy 0.50. Each is better than the min margin (0.59) and each is below SOP-BERT's 0.72. SOP-BERT's act
probability alone: 0.62. Per world (VSS): links requests are right 54% of the time (751), every other world 82-96%; the margin does
not show it.

## Answer in plain words

- Which reader knows better when it does not know? SOP-BERT. Its probability separates its right requests from its wrong ones much
  better (AUROC 0.72 vs 0.59 on the sample, 0.73 vs 0.58 on held-out). VSS asks more, but that comes from what it cannot read at all
  (11.4% not done); among the requests it does execute, its margin barely tells the right ones from the wrong ones, and its most
  confident readings (margin >= 0.5) are among its worst. VSS's honesty is in what it refuses to read, not in its confidence number.
- At equal wrong VSS is still ahead between 6 and 11.4% wrong (at 11.4%: 77.2 vs 73.8 right), because SOP-BERT starts with more
  wrong; below about 5% wrong SOP-BERT is ahead (at 4%: 45.9 vs 38.5; at 2%: 26.8 vs 10.1). On the short commands SOP-BERT is ahead
  everywhere.
- Yes, SOP-BERT can ask instead of guess with one threshold on its own probabilities, no training. Chosen on held-out: t = 0.36 (T1,
  ask when not-right is likelier than right) gives on the sample 79.6 right / 14.3 wrong / 6.1 not done (+312 extra): 1.2 points of
  right for 2.2 points less wrong. To reach VSS's wrong on the sample it needs about t = 0.6 (T2): 75.1 / 12.0 / 12.9 (+227), i.e.
  against VSS's 77.2 / 11.4 / 11.4 (+334): 2.1 points less right, 0.6 points more wrong, 107 fewer extras. A threshold that would reach exactly 11.4% wrong
  on the sample cannot be read off held-out, because the sample's bench folders are harder for SOP-BERT than its own held-out split.
