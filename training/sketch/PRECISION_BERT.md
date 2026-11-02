# SOP-BERT with a fitted confidence: the same treatment as VSS (2026-11-02)

PRECISION.md compared a VSS whose confidence is a fitted combination of 17 stage signals with a SOP-BERT whose confidence is only the
minimum of its head probabilities. That is not a fair comparison. Here SOP-BERT gets the same treatment by the same protocol.
No model is retrained; no reader file is edited. Code: `precision_bert_collect.mjs` (collects the signals), `precision_bert.mjs`
(fits and measures), `precision_confidence_bert.mjs` (dependency-free compute function), export `precision_thresholds_bert.json`.

## Plan (written before anything was measured)

### Unit and outcome

The unit is one produced request of SOP-BERT (one cut span read by the model as a request, not "none"), with the outcome right / wrong /
extra from the pairing code of `risk_coverage.mjs` (PAIR=value), exactly the records of PRECISION.md. Right = 1; wrong and extra = 0.

### Signals available from SOP-BERT without retraining

All come from one run of the model (the read of the request, and the cut head over the whole message). Orientation: higher = more
confident, fixed now (a signal for which no direction is obvious is marked "free": its weight may take either sign).
Missing (the request has no such head) counts as 1, as in VSS ("nothing to doubt").

| head | signal | what it is |
|---|---|---|
| act | `act_p` | probability of the top act |
| act | `act_margin` | top act minus second act |
| act | `act_negent` | 1 - entropy of the act head / ln(number of acts) |
| act | `act_prior` | right-rate of the chosen act on the fitting split (smoothed, as `world_prior` of VSS) |
| value heads | `val_p_min`, `val_margin_min` | over the value (class) heads of the keys the request filled: lowest probability, lowest margin (top minus second) |
| value heads | `none_p_min` | over the value heads of the act's keys that stayed empty: lowest probability of "none" (did it rightly leave them empty) |
| fill heads | `fill_p_min`, `fill_margin_min` | over the fill:<key> heads of the act's name keys: lowest probability, lowest margin |
| fill heads | `ctx_fill` | number of keys filled from the context (pronoun, vague reference); fewer = more confident |
| name tags | `tag_p_min`, `tag_margin_min` | over the words of the filled written spans: lowest tag probability, lowest margin |
| name tags | `tag_all_min` | lowest winning-tag probability over all words of the request (also words tagged O) |
| name tags | `tag_stray` | number of words tagged with a role the act does not have; fewer = more confident |
| desc heads | `desc_p_min`, `desc_margin_min` | over the desc:<key> heads of the keys the description filled: lowest probability, lowest margin |
| cut head | `cut_start` | probability of B at the request's first word |
| cut head | `cut_end` | probability that the request ends there (the next word is not I); 1 at the end of the message |
| cut head | `cut_inner_min` | lowest I probability inside the request (1 for one word) |
| text | `unk_share` | share of the request's word pieces that are [UNK]; fewer = more confident |
| text | `split_share` | share of the request's words split into more than one word piece; fewer = more confident |
| text | `n_words` | words in the request (free) |
| request | `n_roles` | number of keys filled (free) |
| message | `n_units` | number of requests the cut head found in the message (free) |

`min_p` (today's confidence, recomputed with the same rule as `risk_coverage.mjs` and checked equal to the existing records) is kept
for rule (a). Not used because the model does not give it without retraining: any score per word piece beyond the heads above.

### Combination rules

(a) `min`: today's minimum of the probabilities (no fitting).
(b) `temperature`: the same minimum, but every head's softmax divided by a temperature T fitted on the fitting split (one T for all
    heads; and a variant with one T per head family: act, value, fill, tag, desc) by maximising the log-likelihood of right / not right
    under the temperature-scaled minimum (a grid on T, fixed now: 0.5 to 20).
(c) `logistic`: logistic regression (right = 1) over the named signals, each turned into a percentile of the fitting-split distribution
    (ties averaged, binary signals 0/1), L2 penalty from {0.01, 0.1, 1, 10} chosen by the same 5-fold cross-validation, the same code as
    VSS (`precision.mjs`: `fitTable`, `logistic`, `percentile`). Variants: all signals; without `act_prior`.

### Fitting split and selection

The held-out split of SOP-BERT's own fine-tune (`make_data.py` split_messages, 585 messages, 1711 requested actions, SOP-BERT never trained
on them), the split that PRECISION.md used. Folds are cut by message (message index mod 5). Selection: the best 5-fold out-of-fold AUROC
(right vs not right) among (a), (b), (b per family) and (c). A fitted rule is scored on folds it was not fitted on (temperature and
percentile maps too). The winner is then refit on the whole split.

### Operating point (the protocol of PRECISION.md, unchanged except the scores used)

Threshold = the LOWEST value of the confidence whose precision of execution on held-out is >= 95 / 97 / 99% with at least 50 executed
requests. 97% is the operating point. This time the threshold is read from the OUT-OF-FOLD scores of the winner (each held-out request
scored by a model that did not see its fold); the final model, refit on all held-out, is then applied with that threshold. The
in-sample threshold is also reported. For parity the VSS combined confidence is also given with its threshold from its own out-of-fold
scores (PRECISION.md only noted it: 0.9113 against 0.8934 in-sample at 97%).

### Applied once to

sample1000 (SOP-BERT never saw it; VSS TRAINED on it), short held-out 299 (held out for SOP-BERT; trained on by the VSS cutter), the six
template sets (hand, blind, broad, seen, new_identities, heldout_formulations; they favour the Rules). Per set: precision of execution,
right % of requests, asked %, extras executed; and the equal-precision comparison with VSS combined at the same 97% level. Nothing is
re-tuned on these sets.

### What "it worked" means

Hypothesis: with a fitted confidence SOP-BERT reaches 97% precision of execution on held-out (it did not with the minimum, best 94.9%).
It worked if (c) or (b) reaches 97% with >= 50 executed on held-out by the out-of-fold threshold. If it does not, that is the result.
The comparison with VSS is then the right % of requests at the same precision.

## What was done (2026-11-02)

- Records: the existing `rc/*.jsonl` hold only the minimum probability, so SOP-BERT was re-run once over every set with
  `precision_bert_collect.mjs`, which wraps the unedited `neural.js` `makeReader` from outside (the model call is intercepted to read the
  logits it already computes; the cut head's logits are read the same way). Sets: held-out 585 messages, sample1000, short held-out 299,
  the six template sets. Checked: for every produced request (5072 + 1757 + 299 + 1218) the outcome and the minimum probability equal the
  earlier `risk_coverage.mjs` records (0 differences); the minimum recomputed from the recorded head logits agrees to 2e-4 (logits are
  rounded to 3 decimals).
- VSS combined at its out-of-fold threshold: a scratch copy of `precision.mjs` (only the output paths changed) re-made its held-out
  fit (same weights, intercept -2.757, out-of-fold AUROC 0.822) and its out-of-fold scores.
- Stricter than the VSS recipe in one point: here the percentile tables, the act prior and the temperature are refitted inside each
  training fold, so the out-of-fold AUROC does not use the left-out fold at all. (VSS_CONFIDENCE.md fitted its tables on all of
  held-out before cross-validating the weights.) The L2 penalty is chosen by the same out-of-fold AUROC, as there.
- Numbers: `precision_bert.mjs`, full output in the scratchpad `pbv/numbers_bert.md`.

## Result

### Which rule wins (5-fold out-of-fold AUROC on SOP-BERT's held-out split, right vs not right)

| rule | out-of-fold AUROC | note |
|---|---|---|
| (a) minimum of the probabilities (today's) | 0.725 | no fitting |
| (b) temperature scaling, one T | 0.710 | T = 1.38 |
| (b) temperature scaling, one T per head family | 0.785 | T from 0.5 to 20 |
| (c) logistic over the 24 signals | 0.877 | L2 0.01 (the smallest of the grid) |
| (c) logistic without `act_prior` | 0.873 | |
| VSS combined (for reference) | 0.822 | |

The winner is (c), logistic over all 24 signals. Temperature scaling alone does not help: one temperature makes the ranking slightly
worse, and a temperature per head family gets part of the way (0.785). What carries the logistic is mostly the fill heads (alone 0.772;
dropping them costs the most, 0.877 to 0.843), then the cut head (alone 0.726; dropping it 0.862), the act head (alone 0.741) and the
text signals (dropping them 0.864). The value heads, the name tags and the desc heads alone are weak (0.50 to 0.68), as are all the
single signals except `fill_p_min` (0.774) and `cut_start` (0.732).

Weights of the winner (each signal a percentile in [0, 1]; intercept -10.25; a positive weight means "more of it, more sure"):
act_p -3.81, act_margin +7.10, act_negent -2.67, act_prior +2.26, val_p_min -3.50, val_margin_min +4.32, none_p_min +1.09,
fill_p_min +3.41, fill_margin_min -0.87, ctx_fill +1.99, tag_p_min +0.79, tag_margin_min -1.65, tag_all_min +1.78, tag_stray +4.16,
desc_p_min +2.96, desc_margin_min -0.07, cut_start +2.26, cut_end +0.91, cut_inner_min -0.50, unk_share 0 (no [UNK] in held-out), split_share
-0.55, n_words -0.49, n_roles +2.95, n_units -0.32. The signs of the pairs that measure nearly the same thing (act_p / act_margin /
act_negent; val_p / val_margin) cancel each other: read the weights as a fit, not as a story about each signal.

### The thresholds (held-out only, from the out-of-fold scores)

| level | t | held-out precision · right % of requests |
|---|---|---|
| 95 | 0.8421 | 95.1 · 65.2 |
| 97 (operating point) | 0.9029 | 97.0 · 57.0 |
| 99 | 0.9570 | 99.0 · 40.9 |

With the minimum of the probabilities no level is reached (best 94.9%). VSS combined from its own out-of-fold scores: 0.8564 (95),
0.9113 (97), and 99% is not reached (in-sample it was 0.9438); PRECISION.md's in-sample 97% threshold 0.8934 was indeed optimistic.
The final model, refit on all of held-out, gives 97.6% at 0.9029 on held-out (in-sample).

### Applied unchanged at the 97% point (SOP-BERT t = 0.9029, VSS combined t = 0.9113, both from out-of-fold scores)

Sample1000 (SOP-BERT never saw it; VSS trained on it).

| reader | precision of execution · right % of requests | asked % · extras executed |
|---|---|---|
| SOP-BERT fitted | 97.0 · 52.4 | 43.8 · 25 |
| VSS combined | 96.5 · 27.3 | 60.7 · 23 |
| SOP-BERT today (minimum, executes all) | 77.4 · 80.8 | 0 · 348 |

Held-out split (both confidences are fitted on it, so these are in-sample).

| reader | precision of execution · right % of requests | asked % · extras executed |
|---|---|---|
| SOP-BERT fitted | 97.6 · 56.6 | 40.1 · 7 |
| VSS combined | 96.9 · 31.4 | 55.9 · 4 |

Short held-out 299 (held out for SOP-BERT; the VSS cutter trained on them).

| reader | precision of execution · right % of requests | asked % · extras executed |
|---|---|---|
| SOP-BERT fitted | 96.4 · 45.2 | 51.5 · 1 |
| VSS combined | 95.7 · 22.4 | 54.5 · 1 |

The six template sets (written from the Rules' own cues; SOP-BERT is far from its training text there).

| set | SOP-BERT fitted: precision · right % | VSS combined: precision · right % |
|---|---|---|
| hand (40) | 100 · 42.5 | 100 · 25.0 |
| blind (60) | 100 · 43.3 | 94.1 · 26.7 |
| broad (140) | 98.4 · 45.0 | 100 · 29.3 |
| seen (300) | 95.3 · 41.0 | 97.2 · 23.3 |
| new_identities (300) | 94.4 · 33.7 | 97.1 · 22.7 |
| heldout_formulations (300) | 86.5 · 15.0 | 100 · 16.0 |
| six pooled (1140) | 94.9 · 32.9 | 98.1 · 22.2 |

Asked % of the SOP-BERT rows: sample 43.8, held-out 40.1, short 51.5, six pooled 62.7 (VSS: 60.7, 55.9, 54.5, 49.7; plus the requests VSS
does not read at all, 11 to 28%, against 2 to 3% for SOP-BERT). At 95% and 99%, SOP-BERT fitted: sample 95.6 · 61.3 and 98.5 · 35.1; short
299 96.1 · 58.2 and 100 · 29.8; VSS combined at 95%: 94.0 · 47.7 (sample), 91.7 · 40.5 (short 299), and it does not reach 99%.
AUROC of the confidence: SOP-BERT minimum 0.721 / 0.725 / 0.815 on sample / held-out / short 299, fitted 0.904 / 0.896 / 0.879,
VSS combined 0.807 / 0.831 / 0.840.

### Direct answer

Yes. With a fitted confidence SOP-BERT reaches 97% precision of execution: 97.0% on its held-out split with the threshold read from out-of-fold
scores (57.0% of the requests done right), and 97.0% on the sample, which it never saw, where it does 52.4% of the requests right and
asks 43.8%. At that same precision VSS combined does 27.3% right on the sample (96.5% precision), 31.4% on held-out and 22.4% on the short 299
(SOP-BERT: 52.4, 56.6, 45.2). So SOP-BERT then does about 1.7 to 2 times as much right as VSS. The earlier conclusion of PRECISION.md, that
only VSS had an honest "I am sure" setting, came from giving VSS a fitted confidence and SOP-BERT only the minimum; it does not survive
giving both the same treatment. The sample favours VSS (trained on it) and the short 299 favours VSS's cutter, and SOP-BERT still wins there.

Where it does not hold: on the template sets the held-out threshold does not carry over (94.9% pooled, 86.5% on heldout_formulations,
where SOP-BERT is right on only 48% of requests even when it executes everything), while VSS combined stays at 98.1% there at lower
coverage. Elsewhere the precision after transfer is 96.4 to 97.0, not above 97 (the same drop of about a point that VSS showed).

### Limits

The L2 penalty chosen is the smallest of the grid (0.01), so a smaller one might do slightly better; not tried (no second try).
The out-of-fold AUROC is still slightly optimistic because the penalty was chosen by it. The held-out split is the fitting split for both
fitted confidences, so the held-out rows are in-sample for the final models; the sample and the short 299 are the honest rows.
Not re-run: the context effects of not executing a request. The signals need the head logits of the model, so a browser port must read
`seq_logits`, `token_logits` and `cut_logits` as `precision_bert_collect.mjs` does (the function `features`).

## Files

`training/sketch/PRECISION_BERT.md` (this file), `precision_bert_collect.mjs` (signal extraction), `precision_bert.mjs` (fit and
measurement), `precision_confidence_bert.mjs` (dependency-free compute function: `bertConfidence`, `bertTemperatureConfidence`),
`precision_thresholds_bert.json` (winner, 24 weights, intercept, percentile tables, act prior, thresholds at 95/97/99 from out-of-fold and
in-sample scores; execute when confidence >= `threshold` = 0.9029). Export check: confidence recomputed from the JSON alone on 200
produced requests, max absolute difference 0.0 (identical code path); the execute/ask decisions of the JSON threshold equal the script's
on all 5072 sample requests.
