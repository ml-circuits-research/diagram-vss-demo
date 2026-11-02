# REPORT — world `questions7`, legend sha256:757204772f38… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
3959 annotated sentences from 2 files; provenance: {'llm': 3959}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_questions7_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 169 sentences
- heldout_formulations: 183 sentences
- train: 3607 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
17941 tokens in the examples; 601 with no kind in the lexicon (share 0.033), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 9b2fa1c. Memory curve: runs/micro_questions7_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.624 [rule: fit; pooled midpoint 1.054 (comparison)] (present 1.957, n 272 / absent 0.150, n 297)
- attr_presence:object: threshold 0.209 [rule: fit; pooled midpoint 0.467 (comparison)] (present 0.867, n 23 / absent 0.066, n 249)
- presence:color: threshold 0.366 [rule: fit; pooled midpoint 0.456 (comparison)] (present 0.862, n 23 / absent 0.049, n 546)
- presence:relation: threshold 0.435 [rule: fit; pooled midpoint 0.533 (comparison)] (present 1.036, n 13 / absent 0.030, n 556)
- presence:landmark: threshold 0.339 [rule: fit; pooled midpoint 0.405 (comparison)] (present 0.740, n 77 / absent 0.070, n 492)
- presence:landmark2: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 570)
- presence:notcolor: threshold 0.661 [rule: fit; pooled midpoint 0.637 (comparison)] (present 1.249, n 17 / absent 0.025, n 552)
- presence:superlative: threshold 0.530 [rule: fit; pooled midpoint 0.524 (comparison)] (present 1.046, n 242 / absent 0.002, n 327)
- presence:members: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 570)
- set_member:members: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 40736)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, color 0.056, relation 0.067, landmark 0.001, landmark2 0.001, notcolor 0.056, superlative 0.100, members 0.001, predicate 0.083

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 183)
| axis | accuracy |
|---|---|
| FULL | 0.933 |
| FULL [pooled midpoint (comparison)] | 0.580 |
| presence object: absent read absent | 0.988 |
| presence color: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| structure (depth, negation) | 0.993 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.993 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.973 |
| event type (synonym table) | 0.973 |
| role object | 0.973 |
| head object | 0.980 |
| lexical order head object | 0.707 |
| lexical bag head object | 0.847 |
| occupancy: not given | 0.998 |
| role color | 1.000 |
| head color | 1.000 |
| lexical order head color | 0.953 |
| lexical bag head color | 0.973 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.920 |
| lexical bag head relation | 0.947 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.820 |
| lexical bag head landmark | 0.933 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 1.000 |
| lexical bag head landmark2 | 1.000 |
| role notcolor | 0.987 |
| head notcolor | 0.987 |
| lexical order head notcolor | 0.967 |
| lexical bag head notcolor | 0.993 |
| role superlative | 0.993 |
| head superlative | 0.993 |
| lexical order head superlative | 0.580 |
| lexical bag head superlative | 0.960 |
| role members | 0.993 |
| head members | 0.993 |
| lexical order head members | 1.000 |
| lexical bag head members | 1.000 |
| heads FULL (model) | 0.960 |
| heads FULL (lexical order baseline) | 0.353 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.747 |
| role object [pooled midpoint (comparison)] | 0.627 |
| role color [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.993 |
| role landmark [pooled midpoint (comparison)] | 1.000 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role notcolor [pooled midpoint (comparison)] | 0.987 |
| role superlative [pooled midpoint (comparison)] | 0.993 |
| role members [pooled midpoint (comparison)] | 0.967 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.607 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence notcolor: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: present read present | 0.984 |
| presence object: share of 'present' readings that abstain | 0.032 |
| presence object: share of true 'present' readings that abstain | 0.016 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.016 |
| presence superlative: share of true 'present' readings that abstain | 0.016 |
| occupancy: known filler | 0.974 |
| presence object: present read present [pooled midpoint (comparison)] | 0.143 |
| presence superlative: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| occupancy: unknown filler | 1.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.917 |
| presence notcolor: present read present | 0.600 |
| presence notcolor: present read present [pooled midpoint (comparison)] | 0.600 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.101; status {'ok': 141, 'abstain': 8, 'unknown-event': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.973 | 0.631 / 0.442 | 0.97 | 0.013 | 0.013 / 0.013 |
| role object | 0.953 | 0.349 / 0.159 | 0.97 | 0.031 | 0.016 / 0.016 |
| roles (pooled) | 0.966 | 0.412 / 0.169 | 0.97 | 0.011 | 0.006 / 0.022 |
| role superlative | 0.984 | 0.486 / 0.380 | 0.98 | 0.000 | 0.000 / 0.016 |
| role landmark | 1.000 | 0.351 / 0.145 | 1.00 | 0.000 | 0.000 / 0.000 |
| role color | 1.000 | 0.582 / 0.496 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 1.000 | 0.477 / 0.182 | 1.00 | 0.000 | 0.000 / 0.000 |
| role notcolor | 0.600 | 0.209 / 0.000 | 0.60 | 0.000 | 0.000 / 0.400 |

### train (sample) — catalog candidates (n = 150 of 3607)
| axis | accuracy |
|---|---|
| FULL | 0.953 |
| presence object: present read present | 0.985 |
| presence object: share of 'present' readings that abstain | 0.076 |
| presence object: share of true 'present' readings that abstain | 0.062 |
| presence color: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| structure (depth, negation) | 0.980 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.967 |
| event type (synonym table) | 0.967 |
| role object | 0.967 |
| head object | 0.967 |
| lexical order head object | 0.760 |
| lexical bag head object | 0.940 |
| occupancy: known filler | 0.965 |
| role color | 1.000 |
| head color | 1.000 |
| lexical order head color | 0.940 |
| lexical bag head color | 0.987 |
| occupancy: not given | 0.999 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.973 |
| lexical bag head relation | 0.987 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.880 |
| lexical bag head landmark | 0.980 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 1.000 |
| lexical bag head landmark2 | 1.000 |
| role notcolor | 0.993 |
| head notcolor | 0.993 |
| lexical order head notcolor | 0.960 |
| lexical bag head notcolor | 1.000 |
| role superlative | 0.993 |
| head superlative | 0.993 |
| lexical order head superlative | 0.567 |
| lexical bag head superlative | 1.000 |
| role members | 1.000 |
| head members | 1.000 |
| lexical order head members | 1.000 |
| lexical bag head members | 1.000 |
| heads FULL (model) | 0.960 |
| heads FULL (lexical order baseline) | 0.353 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.913 |
| presence object: absent read absent | 0.988 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present | 0.985 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence notcolor: present read present | 1.000 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.127; status {'ok': 141, 'no-sense': 1, 'unknown-event': 2, 'abstain': 6}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.967 | 0.657 / 0.480 | 0.99 | 0.020 | 0.000 / 0.013 |
| role object | 0.942 | 0.342 / 0.112 | 0.93 | 0.043 | 0.058 / 0.014 |
| roles (pooled) | 0.965 | 0.417 / 0.225 | 0.96 | 0.023 | 0.023 / 0.012 |
| role landmark | 1.000 | 0.356 / 0.188 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 0.985 | 0.494 / 0.386 | 0.98 | 0.000 | 0.000 / 0.015 |
| role notcolor | 0.833 | 0.383 / 0.213 | 1.00 | 0.167 | 0.000 / 0.000 |
| role relation | 1.000 | 0.445 / 0.260 | 1.00 | 0.000 | 0.000 / 0.000 |
| role color | 1.000 | 0.563 / 0.385 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
SUPER=1.00 POS=1.00 SHAPE=0.99 NOTCOLOR=0.99 c3_rules=0.99 c15_on=0.99 c23_in=0.98 COLOR=0.98 and=0.92 c18_does=0.91 NAME=0.84 c6_both=0.80 VERB=0.76 DIR=0.67 QUANT=0.66 c8_what's=0.65 c11_what=0.63 c14_uh=0.54 the=0.54 c1_have=0.49 are=0.48 it=0.46 c24_line=0.43 c26_shape=0.43 c5_me=0.41 c9_an=0.28 c4_then=0.26 SIZE=0.24 PAIR=0.23 directly=0.16 unknown=0.15 ARROW=0.12 AXIS=0.12 RECENT=0.12 STYLE=0.12 c21_arrowheads=0.12 c22_from=0.12 c25_pixels=0.12 called=0.12 labeled=0.12 lines=0.12 named=0.12 LAYOUT=0.11 c19_goes=0.10 c27_them=0.07 with=0.04 c20_arrow=0.04 c7_i=0.03 a=0.03 c13_one=0.01 c17_be=0.01 c2_now=0.00 c16_new=0.00 c10_three=0.00 c12_that=0.00 to=0.00 of=0.00

## What is weak, what to add
- heldout_formulations: heads FULL (lexical order baseline) 0.353
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.747
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.580
- heldout_formulations: role object [pooled midpoint (comparison)] 0.627
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.607
- heldout_formulations: presence object: share of 'present' readings that abstain 0.032
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.016
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.016
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.016
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.143
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence notcolor: present read present 0.600
- heldout_formulations: presence notcolor: present read present [pooled midpoint (comparison)] 0.600
- heldout_formulations: presence notcolor: share of 'present' readings that abstain 0.000
- heldout_formulations: presence notcolor: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.076
- train (sample): presence object: share of true 'present' readings that abstain 0.062
- train (sample): heads FULL (lexical order baseline) 0.353
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence notcolor: share of 'present' readings that abstain 0.000
- train (sample): presence notcolor: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `which are linked to NAME` FULL 0.000 (n 2)
- heldout_formulations: `which are still pending , meaning the ones that are NOTCOLOR` FULL 0.000 (n 1)
- heldout_formulations: `which mostconnected extreme_q SUPER` FULL 0.000 (n 1)
- heldout_formulations: `which COLOR c26_shape is nearest_q SUPER NAME` FULL 0.000 (n 1)
- heldout_formulations: `how many people are neigh_q NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role color | role relation | role landmark | role landmark2 | role notcolor | role superlative | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.960 | 0.933 | 0.973 | 1.000 | 1.000 | 1.000 | 1.000 | 0.987 | 0.993 | 0.993 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.607 | 0.580 | 0.627 | 1.000 | 0.993 | 1.000 | 1.000 | 0.987 | 0.993 | 0.967 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.984 | 0.988 | 0.986 | 0.032 (1.000 / 0.016) |
| heldout_formulations | object | comparison: pooled midpoint | 0.143 | 1.000 | 0.571 |  |
| heldout_formulations | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.917 | 1.000 | 0.958 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | notcolor | product: fitted | 0.600 | 1.000 | 0.800 | 0.000 (— / 0.000) |
| heldout_formulations | notcolor | comparison: pooled midpoint | 0.600 | 1.000 | 0.800 |  |
| heldout_formulations | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.016 (— / 0.016) |
| heldout_formulations | superlative | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | object | product: fitted | 0.985 | 0.988 | 0.986 | 0.076 (1.000 / 0.062) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | notcolor | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 0.985 | 1.000 | 0.992 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
