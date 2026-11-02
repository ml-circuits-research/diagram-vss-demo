# Precision of execution: the three readers under the owner's main metric (2026-11-02)

Main metric of AGENTS.md ("do only what you are sure of, ask about the rest"), applied to Rules, VSS (two confidences) and SOP-BERT.
No model is retrained; no file of the readers is edited. Code: `training/sketch/precision.mjs` (+ `precision_collect.sh`, the commands
that produced the records). Export for the browser: `training/sketch/precision_thresholds.json`.

## Plan (written before anything was measured)

### Definitions

- A reader produces requests (actions). Each produced request is, as in RISK_COVERAGE.md (PAIR=value, the pairing and scoring code of
  `llm_score.mjs`): right (paired with a requested action, every key equal), wrong (paired, a key differs) or extra (paired with none).
- Executed = produced and with confidence >= the reader's threshold. Below the threshold the request is asked (not executed).
- **Precision of execution** = right / (right + wrong + extra), counted over everything executed. Extras are executed too, so they are in
  the denominator.
- **Coverage** = requests done right / requested (the "right %" of the earlier reports).
- **Asked** = requested actions whose produced request (right or wrong) was not executed because its confidence was below the threshold,
  as % of requested. Reported, never an error. **Unread** = requested actions for which the reader produced nothing at all (the cutter
  or the router found no unit); reported separately, also not an error. Executed wrong and executed extras are reported as they are.
- Context effects of not executing a request (a later "it" that would have referred to it) are not re-run: a request has the outcome it
  has when everything is executed (same simplification as RISK_COVERAGE.md).

### Confidence of each reader (all already defined and fitted by the other documents; nothing new is fitted here)

- Rules: none. Everything it produces is executed; it is measured as it is (precision, coverage, unread, extras).
- VSS old margin: minimum of the chosen reading's margins (RISK_COVERAGE.md).
- VSS combined: "logistic all minus event" of VSS_CONFIDENCE.md: logistic over 14 named stage signals, each turned into a percentile of
  the held-out distribution; L2 penalty chosen by the same 5-fold cross-validation; fitted on the held-out split only. I refit it in
  `precision.mjs` from the same records with the same code and check that the weights and the intercept (-2.757) are reproduced.
- SOP-BERT: minimum probability over its heads (RISK_COVERAGE.md).

### Extras need a confidence

An extra action is executed, so it must be gated by the same confidence. The existing records (`rc/*.jsonl` for the margin and SOP-BERT,
`vc/*.jsonl` for the VSS signals) already hold one entry per PRODUCED request, including those whose outcome is `extra`, each with its
confidence (margin, probability, or the raw signals). So no recollection is needed for the three learned readers on the sample, the
held-out split and the short set. Missing and collected here (with the unedited scripts `risk_coverage.mjs run` and
`vss_confidence.mjs collect`, on converted copies of the data): the six template short sets (`docs/bench/*`), for which no record existed.
The Rules have no records at all: collected here with a wrapper that uses the pairing code of `llm_score.mjs`.

### The operating point (fixed now)

- Threshold t of a reader = the LOWEST value of its confidence such that, executing the requests with confidence >= t, the precision of
  execution on the held-out split (585 messages, 1711 requested; the split of RISK_COVERAGE.md) is >= 97%. Candidates are the distinct
  confidence values of the produced requests on held-out; equal values execute together.
- Why 97%: about 1 silent mistake in 33 executed actions. The owner: "better fearful and asking than confident and wrong". 95% (1 in 20)
  and 99% (1 in 100) are reported as curve points with the same rule.
- Guard against a noisy tail: a candidate counts only if at least 50 requests are executed on held-out (otherwise a handful of
  very confident requests could "reach" any precision). If no candidate qualifies, the reader has no operating point at that precision:
  it is reported as "not reached" and, in the per-set tables, as asking everything; its all-executed row is given for reference.
- The threshold is chosen on held-out ONLY and applied unchanged to the sample, the short 299 and the six short sets. The numbers on
  those sets are the result; nothing is re-tuned on them. A set that comes out below 97% stays below 97%.
- Caveats stated in every table: sample1000 = VSS trained on it, SOP-BERT never saw it. Held-out = held-out for SOP-BERT; for VSS the
  worlds saw text of the same folders, and the combined confidence is FITTED on it, so its held-out precision is in-sample (optimistic);
  as a side check only, the threshold the 5-fold out-of-fold scores would have given is also reported. Short 299 = held-out for
  SOP-BERT, trained on for the VSS cutter. The six template sets favour the Rules (their cue words and templates).

### Measured, per reader and set

Precision of execution, coverage, asked %, unread %, executed wrong %, extras executed; AUROC of the confidence (right vs not right)
beside. Comparison at equal precision: coverage of each reader at the 95 / 97 / 99% thresholds (chosen on held-out, applied unchanged),
and, as reference, the best coverage the set's own curve allows at that precision (also >= 50 executed).

### Export and check

`precision_thresholds.json`: per reader the confidence definition, the threshold, and the held-out precision and coverage; for the
combined VSS the 14 weights, the intercept, and the percentile tables (the sorted held-out values of each signal, orientation, binary
flag) so a browser reproduces the number. Check: recompute the confidence from the JSON alone on 200 records and compare with the
script's own value; report the maximum absolute difference.

## What was done (2026-11-02)

- Extras: the existing records already hold one entry per produced request, extras included, each with its confidence (margin,
  probability, raw signals). Nothing had to be recollected for the sample, the held-out split and the short set. New records, made with
  the unedited `risk_coverage.mjs run` and `vss_confidence.mjs collect` on converted copies of `docs/bench/*` (`precision.mjs bench`):
  the six template sets. Rules records: `precision.mjs rules` (per-request outcomes checked against the `llm_score.mjs` tally on every
  message). Commands: `precision_collect.sh`.
- The combined confidence was refit by `precision.mjs` on held-out with the same code: weights, intercept (-2.757), penalty (10) and
  out-of-fold AUROC (0.822) are the ones of VSS_CONFIDENCE.md.
- One inconsistency, small: on `blind` and `broad`, the VSS records of `risk_coverage.mjs` (which also runs SOP-BERT in the same
  process) have 1 more produced request each than those of `vss_confidence.mjs` (`blind` 53 against 52, `broad` 132 against 131; all
  other sets are identical). I used the `vss_confidence.mjs` records for both VSS confidences; the cause (state left by the other reader
  in the same process) was not investigated. The effect on the six-set totals is 2 requests of 877.
- Numbers: every number below is produced by `precision.mjs measure`; the full output is in the scratchpad `pr/numbers.md`.

## Result

### The thresholds (chosen on held-out only)

Execute when confidence >= t. Held-out = 585 messages, 1711 requested actions. Rule: lowest t with held-out precision >= the level and
at least 50 executed.

| reader / level | t | held-out precision · right % of requests |
|---|---|---|
| Rules | none | 73.7 · 73.3 (executes everything) |
| VSS old margin / 95, 97, 99 | not reached | best possible 87.3 |
| VSS combined / 95 | 0.8540 | 95.0 · 50.5 |
| VSS combined / 97 (operating point) | 0.8934 | 97.1 · 38.7 |
| VSS combined / 99 | 0.9438 | 99.0 · 11.9 |
| SOP-BERT / 95, 97, 99 | not reached | best possible 94.9 |

Two of the three learned readers cannot be made 97% precise by any threshold. The VSS margin tops out at 87% and SOP-BERT's smallest
head probability at 94.9% (with at least 50 executed requests): its most confident requests are still wrong about 1 time in 20, because
its probabilities are over-confident (RISK_COVERAGE.md: requests at probability >= 0.99 are right 89% of the time). They have no
operating point at 95, 97 or 99%: by the protocol they ask about everything. Their "execute everything" rows are in the table below.
The combined VSS confidence reaches all three levels. Caveat: it is fitted on the held-out split, so its held-out precision is
in-sample; the thresholds from the out-of-fold scores would have been stricter (97%: 0.9113 instead of 0.8934).

### Applied unchanged to the other sets (97% operating point)

Sample1000: VSS trained on it, SOP-BERT never saw it.

| reader | precision of execution · right % of requests | asked % · unread % |
|---|---|---|
| Rules | 67.1 · 68.0 | 0 · 15.5 |
| VSS combined (t = 0.893) | 95.8 · 35.5 | 52.2 · 11.4 |
| VSS old margin | no threshold | asks everything |
| SOP-BERT | no threshold | asks everything |

Held-out split (SOP-BERT held out; VSS combined fitted on it, so in-sample).

| reader | precision of execution · right % of requests | asked % · unread % |
|---|---|---|
| Rules | 73.7 · 73.3 | 0 · 14.6 |
| VSS combined (t = 0.893) | 97.1 · 38.7 | 48.4 · 11.9 |

Short held-out 299 commands (held out for SOP-BERT; trained on by the VSS cutter).

| reader | precision of execution · right % of requests | asked % · unread % |
|---|---|---|
| Rules | 82.3 · 74.6 | 0 · 20.1 |
| VSS combined (t = 0.893) | 95.6 · 29.1 | 47.5 · 22.4 |

The six template sets pooled (1140 requests; written from the Rules' own cues, they favour the Rules; SOP-BERT had not seen them).

| reader | precision of execution · right % of requests | asked % · unread % |
|---|---|---|
| Rules | 98.9 · 98.3 | 0 · 1.2 |
| VSS combined (t = 0.893) | 97.8 · 27.6 | 44.3 · 27.9 |

Per template set (Rules precision · right %; VSS combined precision · right %): hand 100 · 95.0 / 100 · 30.0; blind 87.7 · 83.3 /
95.5 · 35.0; broad 97.1 · 95.7 / 100 · 37.1; seen 100 · 100 / 96.8 · 30.0; new_identities 100 · 100 / 96.3 · 26.3;
heldout_formulations 99.7 · 99.7 / 100 · 20.3. The short 2701 trained commands (all readers trained on them): Rules 78.4 · 70.4,
VSS combined 95.5 · 28.1. Executed wrong and extras executed are in the full output (VSS combined at 97%: 0.9% wrong and 34 extras
on the sample, 0.9% and 4 on held-out, 1.0% and 1 on short 299; Rules: 16.5% wrong and 816 extras on the sample).

The threshold does not carry over exactly: 97.1% on held-out became 95.8% on the sample, 95.6% on the short 299 and 95.5% on the
trained short commands; it stayed above 97% only on the template sets. A threshold chosen for 97% on held-out gives about 96% elsewhere.

### Everything executed (no threshold), for reference

| set / reader | precision · right % of requests | AUROC of the confidence |
|---|---|---|
| sample / Rules | 67.1 · 68.0 | none |
| sample / VSS | 80.9 · 77.2 | margin 0.589, combined 0.807 |
| sample / SOP-BERT | 77.4 · 80.8 | 0.721 |
| held-out / Rules | 73.7 · 73.3 | none |
| held-out / VSS | 82.4 · 78.0 | margin 0.583, combined 0.831 |
| held-out / SOP-BERT | 81.6 · 83.8 | 0.725 |
| short 299 / Rules | 82.3 · 74.6 | none |
| short 299 / VSS | 73.7 · 66.6 | margin 0.571, combined 0.840 |
| short 299 / SOP-BERT | 77.6 · 77.6 | 0.815 |
| six template sets / Rules | 98.9 · 98.3 | none |
| six template sets / VSS | 79.7 · 61.1 | margin 0.612, combined 0.862 |
| six template sets / SOP-BERT | 57.6 · 61.6 | 0.823 |

### Comparison at equal precision (right % of requests, held-out thresholds applied unchanged)

| level | VSS combined: sample · held-out · short 299 | others |
|---|---|---|
| 95% | 48.3 · 50.5 · 41.1 (precision 94.0 · 95.0 · 91.8) | margin, SOP-BERT: no threshold |
| 97% | 35.5 · 38.7 · 29.1 (precision 95.8 · 97.1 · 95.6) | margin, SOP-BERT: no threshold |
| 99% | 9.6 · 11.9 · 8.7 (precision 97.7 · 99.0 · 100) | margin, SOP-BERT: no threshold |

Reference, not the protocol (a threshold read off the set itself, at least 50 executed): at 97% on the sample the combined confidence
could execute 23.7%, on the six template sets 33.3%; SOP-BERT reaches 95% only on the short 299 (25.4%) and the six template sets (24.4%),
and 97% only on the short 299 (23.4%), never on the sample or held-out (highest 94.0% and 94.9%). The old margin never reaches 95%.

### Direct answer: at >= 97% precision, how much does each reader do right and how much does it ask?

| reader | right % of requests | asked % |
|---|---|---|
| Rules | no confidence: 68 (sample), 73 (held-out), 75 (short 299), 98 (templates), at precision 67 / 74 / 82 / 99 | 0: it never asks; it does not read 15 / 15 / 20 / 1 |
| VSS combined confidence | 35.5 (sample), 38.7 (held-out), 29.1 (short 299), at precision 95.8 / 97.1 / 95.6 | 52 / 48 / 48; plus 11 / 12 / 22 not read at all |
| VSS old margin, SOP-BERT | 0: no threshold gives 97% (best 87% and 95%) | everything |

In plain words. Under the main metric only one of the three can be run at 97%: the VSS reader with its combined confidence. It does
about 4 requests in 10 right, asks about half, and cannot read about one in ten; about 1 executed action in 25 to 33 is wrong or
extra, which is roughly the 1 in 33 aimed at (a bit worse outside the held-out split). The Rules do more right (68 to 75% of the
requests on the realistic sets) but execute everything, so about a third of what they execute on the sample is wrong or extra (precision
67%), a quarter on held-out; they are precise (98.9%) only on the template sets written from their own cues. SOP-BERT is the most accurate
reader when it executes everything (80.8% right on the sample), but its confidence cannot separate its mistakes from its right requests
well enough: even its most confident requests are wrong 1 time in 20, so it has no honest "I am sure" setting at 95% or more. The VSS
margin was never a usable confidence; the confidence built from the whole chain (VSS_CONFIDENCE.md) is what makes VSS the only reader
that can say where it is not sure. The price is large: at 97%, half the requests are asked.

Limits. The threshold of the combined VSS confidence is chosen on a split on which the confidence was fitted (optimistic by about a
point; it gave 95.5 to 95.8% elsewhere). The sample is trained on by VSS and not by SOP-BERT, and the 299 short commands the other way
round, so these numbers do not rank the readers on equal data; the template sets favour the Rules. Context effects of not executing a
request are not re-run. Looked at but not done: a different guard than 50 executed, or fitting a per-reader calibration of SOP-BERT's
probabilities (which would not change its ranking, only the AUROC it already has).
