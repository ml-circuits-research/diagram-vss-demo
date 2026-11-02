# VSS confidence from the whole chain (not only the margin)

Owner's question follow-up to RISK_COVERAGE.md (2026-11-02): the VSS reader's confidence (the smallest margin of the chosen reading)
separates right from not-right requests poorly (AUROC 0.59 on the sample, 0.58 held-out, 0.57 short) while SOP-BERT's min probability
reaches 0.72 / 0.73 / 0.82. No model is retrained and the demo is not changed. Code: `training/sketch/vss_confidence.mjs` (wraps the
composer and the context filler from outside; none of their files is edited).

## Hypothesis

The margin measures one stage only: how clearly the best reading beats the runner-up INSIDE the chosen world. VSS's errors come from
the whole chain: the cut, the world chosen for a piece, the event, the roles, the context filler, the adapter. A confidence that sees
every stage should rank better than the margin.

## Plan (written before any new number was measured)

Unit of measurement: one produced request, outcome right / wrong / extra, exactly as in RISK_COVERAGE.md (PAIR=value, the pairing and
scoring code of `risk_coverage.mjs`; the totals are checked against `llm_score.mjs` tally). First step: reproduce VSS 77.2 / 11.4 / 11.4
(+334) on the sample; the run stops if it does not.

### Candidate signals, per stage (all read from what the composer already computes; higher = more confident after orientation)

| stage | signal (name) | what it is |
|---|---|---|
| cut | `cut_start` | at the unit's first token, the cutter's best B-<world> score minus its best I/O score |
| cut | `cut_end` | at the token after the unit, the cutter's best (B, O) score minus its I score (does the unit really end there) |
| world | `world_gap` | cutter's B-score of the chosen world minus the best other world, at the first token |
| world | `world_rank` | 1 if the chosen world is the cutter's top-ranked candidate, else 0 |
| world | `wnu_gap` | words-not-understood of the best other usable world minus the chosen one (how far the chosen world beats the others on its own criterion; 0 when no other world could read) |
| world | `tie` | 1 / (number of worlds tied at the fewest words not understood) |
| event | `event_gap` | the event cutter's score of the chosen event minus the best other event, at the first token |
| event | `event_agree` | 1 if the event cutter's hint equals the event the chosen world read |
| event | `event_margin` | the reader's own `margins.event` |
| roles | `role_min` | min of the reader's role margins (every margin except event and structure) |
| roles | `margin_min` | the old confidence: min of all margins (reported for reference; it contains event_margin and role_min) |
| roles | `residual` | the reader's residual (lower = more confident) |
| roles | `unplaced` | number of words the reader placed nowhere (fewer = more confident) |
| roles | `abstain` | the reader's own status (ok / abstain) |
| words | `notu_frac` | share of the unit's words not understood (fewer = more confident) |
| context | `ctx_fill` | number of gaps (pronoun, empty role, vague reference) filled from the message context instead of written (fewer = more confident) |
| context | `ctx_margin` | the smallest filler margin among the gaps it filled (no fill: maximal) |
| prior | `world_prior` | the chosen world's own right-rate on the fitting split (a constant per world) |

The adapter has no separate number: it is a deterministic mapping, its errors show up as roles and context signals; this is stated in
the result as not measured on its own.

### Normalisation

Each signal is turned into a number in [0, 1] by its empirical distribution on the FITTING split (percentile, orientation above, ties
averaged), then the same map is applied to the other sets. Binary signals stay 0/1. No other tuning.

### Fitting split (never the sample)

The held-out split of the SOP-BERT fine-tune (`rc/heldout_ids.txt`: make_data.py split_messages seed 0, 585 messages, 1711 gold
requests), the same one RISK_COVERAGE.md used for its thresholds. Caveat to state: these messages come from the training folders, so
the VSS worlds have seen text of the same kind (the sample's `bench_*_spans` folders are harder). Everything that is fitted (the
percentile maps, the chosen signal of a stage, the logistic weights, `world_prior`) is fitted on this split only. Selection between
rules uses the AUROC on this split; for the fitted rules it is the out-of-fold AUROC (5 folds, folds cut by message), so a fitted rule
is not rewarded for fitting its own data.

### Combination rules

a. `min-stage`: per stage, the stage's best single normalised signal on the fitting split (stages: cut, world, event, roles, words,
   context; prior excluded); the confidence is the MIN over stages. Also `min-all`: the min over all normalised signals.
b. `logistic`: a logistic regression (right = 1, wrong and extra = 0) on all normalised signals, L2 penalty chosen from
   {0.01, 0.1, 1, 10} by the same 5-fold cross-validation, features not standardised (they are already in [0, 1]), every weight printed
   by signal name. Variants: without `world_prior`; per-stage subsets (to see which stage carries most); all stages minus one stage.

Fixed choice of the winner: the best (out-of-fold) AUROC on the held-out split among: the old margin, each single signal, `min-stage`,
`min-all`, the logistic variants. The winner is then reported ONCE on the sample1000 and once on the short held-out set (the 299
held-out commands of the short set), with the equal-wrong table. SOP-BERT is read from the existing records for reference.

### What is reported

1. Reproduction check (VSS 77.2 / 11.4 / 11.4 on the sample).
2. AUROC per signal and per combination, per set.
3. Equal-wrong table: wrong 11.4 / 8 / 6 / 4 / 2 % of gold -> right % (definition of RISK_COVERAGE.md), for the old margin, the winner,
   SOP-BERT.
4. Which stage carries most (single-stage AUROC; drop-one loss of the logistic).
5. Decomposition: of VSS's wrong (and extra) requests, how many each stage's signal would flag when it flags the lowest 20% of the
   produced requests (threshold from the fitting split), and how many are flagged by no stage.
6. Plain-words answer: does a combination beat SOP-BERT's 0.72 on the sample, or by how much does it fall short.

## Result (2026-11-02)

Run: `node training/sketch/vss_confidence.mjs collect ...` on the three sets, then `analyze` (records and the full printed report in
/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/vc/: sample.jsonl, heldout.jsonl, short.jsonl, analysis.md).
Reproduction check passed: sample VSS 77.2 / 11.4 / 11.4 (+334), held-out 78.0 / 10.1 / 11.9 (+112), short-299 66.6 / 11.0 / 22.4 (+38).
Small choices made while coding, not in the plan: `world_prior` is shrunk toward the overall rate with 5 pseudo-requests; a signal
that is missing (no role margin, no filled gap, unit ends the text) counts as "nothing to doubt" (most confident); the "flag" in the
decomposition is the largest threshold that flags at most 20% of the held-out requests (ties can make it less). `ctx_left` was
collected and not used.

### Answer in plain words

Yes, the hypothesis holds, with a twist. A confidence that looks at the whole chain beats SOP-BERT's 0.72: the winning rule reaches
AUROC 0.807 on the sample1000 (SOP-BERT 0.721, the old margin 0.589), 0.84 on the short held-out set (SOP-BERT 0.815). It is fitted
on the held-out split only, and the sample and the short set were looked at once, with the winner chosen before.
The twist: the margin itself is the weak part. The stage that carries most is the reading itself (how well the chosen world
accounts for the words: residual 0.68 and words-not-understood 0.66 on the sample, as found before), not the role margins (0.55).
The rest of the chain adds a few points each only together: roles alone 0.75 held-out, everything 0.82. The world's own accuracy as a
prior is the strongest single non-reader signal (0.65) because the links world is right only 59% of the time.
At equal wrong the combined rule is ahead of SOP-BERT on the sample at every level (4% wrong: 60.9 against 45.9 right; 2%: 49.0
against 26.8). On the short held-out set SOP-BERT is still ahead at 8% and 6% wrong and VSS is ahead at 4% and 2%.

### Winning rule (fixed choice: best out-of-fold AUROC on the held-out split)

"logistic all minus event": a logistic regression on 14 normalised signals (every one a percentile in [0, 1] of the held-out
distribution, higher = more confident), L2 penalty 10 (chosen by the 5-fold cross-validation, the largest value of the grid),
intercept -2.757; right = 1, wrong and extra = 0. It is 0.004 above "logistic all" (which keeps the event signals, 0.818): the
difference is inside noise, the rule picked the first. Weights by name:

| signal (stage) | weight |
|---|---|
| residual (roles) | +1.262 |
| world_prior (prior) | +1.255 |
| world_rank (world) | +0.984 |
| notu_frac (words) | +0.852 |
| unplaced (roles) | +0.800 |
| world_gap (world) | +0.576 |
| abstain (roles) | +0.562 |
| cut_start (cut) | +0.506 |
| ctx_margin (context) | +0.407 |
| cut_end (cut) | +0.184 |
| tie (world) | -0.118 |
| ctx_fill (context) | +0.110 |
| wnu_gap (world) | -0.036 |
| role_min (roles) | +0.013 |

Read the signs through the normalisation: `residual`, `unplaced`, `abstain`, `notu_frac`, `ctx_fill` are already flipped, so a
positive weight means "less residual / fewer unplaced words / ... = more likely right". `role_min` (the old margin's role part) has
weight 0.013: the model does not use it. Percentile maps and the prior are fitted on the held-out split only.
World prior used (right share of produced requests on held-out): history 100%, graphq 91%, position 88%, manage 85%, shapes 84%,
questions 80%, links 59% (overall 82.4%).

### AUROC (does the confidence separate right from not right?)

| confidence | held-out (selection) | sample |
|---|---|---|
| old margin (min of all margins) | 0.583 | 0.589 |
| min over stages (best signal per stage) | 0.750 | 0.726 |
| min over all 16 signals | 0.735 | 0.744 |
| logistic, all 17 signals | 0.818 | 0.808 |
| logistic, winner (no event signals) | 0.822 | 0.807 |
| SOP-BERT min probability | 0.725 | 0.721 |

Held-out numbers of fitted rules are out-of-fold (5 folds by message); the min rules are not fitted beyond the stage pick. Short
held-out set (299 commands): old margin 0.571, min over stages 0.792, min over all 0.726, logistic all 0.839, winner 0.840, SOP-BERT 0.815.
Rule (a) alone (min over stages: cut_start, world_gap, event_gap, residual, notu_frac, ctx_margin) beats SOP-BERT on the sample by
0.005 and not on the short set (0.792 against 0.815). Rule (b) beats it on both, by 0.086 (sample) and 0.025 (short).

### Single signals (AUROC; higher = ranks right above not-right)

| signal (stage) | held-out | sample |
|---|---|---|
| residual (roles) | 0.725 | 0.684 |
| unplaced (roles) | 0.691 | 0.653 |
| notu_frac (words) | 0.691 | 0.658 |
| world_prior (prior) | 0.670 | 0.654 |
| world_gap (world) | 0.637 | 0.617 |
| cut_start (cut) | 0.623 | 0.629 |
| event_gap (event) | 0.621 | 0.582 |
| old margin (min of all margins) | 0.583 | 0.589 |
| ctx_margin / ctx_fill (context) | 0.547 / 0.546 | 0.578 / 0.575 |
| role_min (roles) | 0.521 | 0.554 |
| cut_end, world_rank, event_agree, event_margin, abstain | 0.53 to 0.56 | 0.54 to 0.63 |
| wnu_gap, tie (world) | 0.49 to 0.50 | 0.50 |

(Short set, same order of strength: unplaced 0.786, notu_frac 0.780, residual 0.725, event_margin 0.642, world_gap 0.606; all in
analysis.md.)

### Which stage carries most

| stage | alone (held-out / sample) | all minus this stage |
|---|---|---|
| roles (residual, unplaced, abstain, role_min) | 0.751 / 0.728 | 0.781 / 0.775 |
| words (notu_frac) | 0.688 / 0.658 | 0.815 / 0.808 |
| prior (world_prior) | 0.663 / 0.654 | 0.791 / 0.790 (no prior) |
| world (gap, rank, wnu_gap, tie) | 0.631 / 0.625 | 0.812 / 0.802 |
| cut (start, end) | 0.615 / 0.645 | 0.816 / 0.800 |
| event (gap, agree, margin) | 0.601 / 0.568 | 0.822 / 0.807 |
| context (fill, margin) | 0.506 / 0.578 | 0.818 / 0.803 |

(All 17 signals: 0.818 / 0.808.) Removing the roles stage costs most (0.037 held-out, 0.033 sample), then the prior (0.027 / 0.018),
then the world and the cut (about 0.005 to 0.008 each); the event signals add nothing (removing them even helps by 0.004 held-out).
The roles stage here is mostly the reader's residual and unplaced words, not its margins. No stage alone reaches 0.72 on the sample
except roles (0.728) by a hair; the chain is what gets to 0.81.

### Equal wrong: right % of gold at the same wrong % of gold (the definition of RISK_COVERAGE.md)

Sample1000 (the one report of the winner):

| wrong % of gold | VSS old margin / winner | SOP-BERT |
|---|---|---|
| 11.4 | 77.2 / 77.2 | 73.8 |
| 8 | 67.8 / 73.0 | 64.1 |
| 6 | 55.5 / 67.1 | 55.0 |
| 4 | 38.5 / 60.9 | 45.9 |
| 2 | 10.1 / 49.0 | 26.8 |

Short held-out set (299 commands; the one report of the winner; VSS wrong is 11.0 with everything executed):

| wrong % of gold | VSS old margin / winner | SOP-BERT |
|---|---|---|
| 11.4 | 66.6 / 66.6 | 74.2 |
| 8 | 54.8 / 60.9 | 70.6 |
| 6 | 48.8 / 59.2 | 62.5 |
| 4 | 29.1 / 56.5 | 52.2 |
| 2 | 8.4 / 41.5 | 30.4 |

(Held-out split, where the winner was fitted, so in-sample and only for orientation: at 8 / 4 / 2% wrong the winner 75.6 / 64.4 / 51.7,
SOP-BERT 73.1 / 55.3 / 27.0.) VSS's full "all executed" row stays at 77.2 / 11.4 on the sample, so no tail is gained for free:
the gain is that the first requests dropped are mostly the wrong ones. At 2% wrong the winner keeps 49.0% right on the sample against 10.1% for the margin.

### Decomposition: which of VSS's errors each stage's signal would flag

Each stage uses its best single signal; "flag" = it is in the lowest of its distribution, with the threshold fixed on held-out so that
at most 20% of held-out requests are flagged. Sample1000: 552 wrong, 334 extra, 3751 right.

| flagged by | % of wrong / % of extra | % of right flagged |
|---|---|---|
| cut (cut_start) | 36.1 / 55.4 | 17.6 |
| world (world_gap) | 24.1 / 52.1 | 14.7 |
| event (event_gap) | 14.9 / 56.9 | 15.6 |
| roles (residual) | 40.8 / 40.7 | 12.7 |
| words (notu_frac) | 19.4 / 33.8 | 13.0 |
| context (ctx_margin) | 23.4 / 16.8 | 5.8 |
| world prior (links world) | 49.6 / 21.0 | 10.9 |
| old margin (min of all margins) | 37.0 / 31.7 | 18.8 |
| the winning rule (lowest 20% of held-out) | 48.2 / 59.0 | 14.0 |
| none of the six stages | 29.5 / 9.0 | 52.8 |

Of the 552 wrong requests, 70.5% are flagged by at least one of the six stages (and 29.5% by none); 23.7% are flagged by exactly one
stage (alone: roles 10.3, cut 6.7, context 4.3, world 1.1, event 0.9, words 0.4, as % of wrong). Most extras (91%) are flagged by some stage; the cut
and the event signals see about 55% of them, the old margin 32%. The prior flags 50% of the wrong requests, because the links
world holds a large share of them. The wrong requests no stage sees (29.5%) are read confidently by every stage: a
wrong value with a clear margin, a normal residual, a known world; no signal of this chain separates them. The adapter has no
number of its own and is not measured separately. Held-out gives the same picture (wrong flagged by roles 50.9, cut 32.9, words 26.0,
world 24.9, prior 45.7, none 24.9); on the 299 short commands the roles and words signals carry (75.8 and 51.5% of the 33 wrong).

### Cautions

- The fit is on 1619 produced requests (1711 gold); the logistic regression has 17 features with a penalty at the edge of its
  grid (10). The sample and short results are out of the fitting split, which is why the held-out number was kept as the choice.
- The held-out split comes from the training folders; the VSS worlds saw text of the same kind. On the sample (bench folders harder
  for SOP-BERT; VSS equal) the AUROC of the winner is 0.015 under its held-out value, so the rule carries over.
- Nothing here retrains a world or changes the demo; the signals are read from the composer from outside. Using this confidence to
  ask instead of execute would need the signals exposed by the composer (the other agent's files) and a per-domain threshold.
