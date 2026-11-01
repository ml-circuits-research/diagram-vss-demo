# REPORT — world `filters`, legend sha256:733c394b89f6… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1236 annotated sentences from 2 files; provenance: {'llm': 1236}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_filters_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 53 sentences
- heldout_formulations: 63 sentences
- train: 1120 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
5084 tokens in the examples; 107 with no kind in the lexicon (share 0.021), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 1bdf306. Memory curve: runs/micro_filters_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.410 [rule: fit; pooled midpoint 2.614 (comparison)] (present 5.059, n 210 / absent 0.169, n 243)
- presence:color: threshold 0.316 [rule: fit; pooled midpoint 0.720 (comparison)] (present 1.155, n 41 / absent 0.285, n 412)
- presence:relation: threshold 0.506 [rule: fit; pooled midpoint 3.157 (comparison)] (present 6.163, n 60 / absent 0.150, n 393)
- presence:landmark: threshold 0.477 [rule: fit; pooled midpoint 3.334 (comparison)] (present 6.443, n 59 / absent 0.224, n 394)
- presence:landmark2: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 453)
- attr_presence:object: threshold 0.261 [rule: fit; pooled midpoint 0.349 (comparison)] (present 0.633, n 66 / absent 0.064, n 144)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.022, color 0.056, relation 0.067, landmark 0.006, landmark2 0.006, predicate 0.333

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 63 of 63)
| axis | accuracy |
|---|---|
| FULL | 0.762 |
| FULL [depth given] | 0.762 |
| FULL [depth and negation given] | 0.762 |
| FULL [presence not decided] | 0.619 |
| FULL [pooled midpoint (comparison)] | 0.365 |
| presence object: absent read absent | 0.973 |
| presence color: absent read absent | 0.978 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| structure (depth, negation) | 0.857 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.857 |
| event type (synonym table) | 0.857 |
| role object | 0.841 |
| head object | 0.857 |
| lexical order head object | 0.603 |
| lexical bag head object | 0.857 |
| occupancy: not given | 0.992 |
| role color | 0.952 |
| head color | 0.952 |
| lexical order head color | 0.873 |
| lexical bag head color | 0.937 |
| role relation | 0.984 |
| head relation | 0.984 |
| lexical order head relation | 0.825 |
| lexical bag head relation | 0.873 |
| role landmark | 0.968 |
| head landmark | 0.968 |
| lexical order head landmark | 0.825 |
| lexical bag head landmark | 0.873 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 1.000 |
| lexical bag head landmark2 | 1.000 |
| heads FULL (model) | 0.778 |
| heads FULL (lexical order baseline) | 0.349 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.667 |
| role object [presence not decided] | 0.778 |
| role color [presence not decided] | 0.841 |
| role relation [presence not decided] | 0.968 |
| role landmark [presence not decided] | 0.984 |
| role landmark2 [presence not decided] | 1.000 |
| heads FULL (model) [presence not decided] | 0.619 |
| role object [pooled midpoint (comparison)] | 0.603 |
| role color [pooled midpoint (comparison)] | 0.889 |
| role relation [pooled midpoint (comparison)] | 0.825 |
| role landmark [pooled midpoint (comparison)] | 0.825 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.365 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| occupancy: known filler | 0.733 |
| presence object: present read present [pooled midpoint (comparison)] | 0.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.100 |
| presence relation: share of true 'present' readings that abstain | 0.100 |
| presence landmark: present read present | 0.900 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| occupancy: unknown filler | 0.900 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.000 |
| presence color: present read present | 0.750 |
| presence color: present read present [pooled midpoint (comparison)] | 0.125 |
| presence color: share of 'present' readings that abstain | 0.143 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence color: share of FALSE 'present' readings that abstain | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.229; status {'ok': 52, 'unknown-event': 9, 'abstain': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.857 | 0.676 / 0.136 | 0.92 | 0.063 | 0.000 / 0.079 |
| role object | 0.640 | 0.514 / 0.225 | 0.96 | 0.320 | 0.000 / 0.040 |
| roles (pooled) | 0.745 | 0.404 / 0.066 | 0.91 | 0.182 | 0.018 / 0.073 |
| role relation | 0.909 | 0.349 / 0.076 | 0.91 | 0.091 | 0.091 / 0.000 |
| role landmark | 0.818 | 0.311 / 0.060 | 0.91 | 0.091 | 0.000 / 0.091 |
| role color | 0.750 | 0.266 / 0.000 | 0.75 | 0.000 | 0.000 / 0.250 |

### train (sample) — catalog candidates (n = 300 of 1120)
| axis | accuracy |
|---|---|
| FULL | 0.830 |
| FULL [depth given] | 0.830 |
| FULL [depth and negation given] | 0.830 |
| presence object: absent read absent | 1.000 |
| presence color: absent read absent | 0.945 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| structure (depth, negation) | 0.883 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.883 |
| event type (synonym table) | 0.883 |
| role object | 0.913 |
| head object | 0.920 |
| lexical order head object | 0.583 |
| lexical bag head object | 0.920 |
| occupancy: not given | 0.990 |
| role color | 0.947 |
| head color | 0.947 |
| lexical order head color | 0.897 |
| lexical bag head color | 0.990 |
| role relation | 0.980 |
| head relation | 0.980 |
| lexical order head relation | 0.843 |
| lexical bag head relation | 0.933 |
| role landmark | 0.970 |
| head landmark | 0.970 |
| lexical order head landmark | 0.833 |
| lexical bag head landmark | 0.933 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 1.000 |
| lexical bag head landmark2 | 1.000 |
| heads FULL (model) | 0.837 |
| heads FULL (lexical order baseline) | 0.370 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.847 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| occupancy: known filler | 0.834 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.024 |
| presence relation: share of true 'present' readings that abstain | 0.024 |
| presence landmark: present read present | 0.976 |
| presence landmark: share of 'present' readings that abstain | 0.049 |
| presence landmark: share of true 'present' readings that abstain | 0.049 |
| presence color: share of 'present' readings that abstain | 0.341 |
| presence color: share of FALSE 'present' readings that abstain | 0.923 |
| presence color: present read present | 1.000 |
| presence color: share of true 'present' readings that abstain | 0.071 |

residual mean 0.198; status {'ok': 248, 'unknown-event': 35, 'abstain': 17}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.883 | 0.699 / 0.060 | 0.90 | 0.017 | 0.000 / 0.100 |
| role object | 0.792 | 0.597 / 0.371 | 1.00 | 0.208 | 0.000 / 0.000 |
| roles (pooled) | 0.826 | 0.530 / 0.259 | 0.98 | 0.170 | 0.020 / 0.004 |
| role relation | 0.872 | 0.463 / 0.237 | 0.98 | 0.128 | 0.021 / 0.000 |
| role landmark | 0.820 | 0.472 / 0.235 | 0.94 | 0.160 | 0.040 / 0.020 |
| role color | 0.903 | 0.452 / 0.067 | 0.94 | 0.097 | 0.065 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
c26_shape=0.98 SHAPE=0.98 c3_rules=0.98 DIR=0.96 POS=0.96 c15_on=0.95 c23_in=0.91 c18_does=0.91 c27_them=0.82 VERB=0.74 c7_i=0.71 QUANT=0.70 c6_both=0.69 c2_now=0.66 COLOR=0.61 NAME=0.61 are=0.55 c1_have=0.53 c4_then=0.40 it=0.39 c14_uh=0.33 c13_one=0.31 and=0.30 c11_what=0.29 the=0.27 unknown=0.24 c9_an=0.20 c5_me=0.13 ARROW=0.12 AXIS=0.12 LAYOUT=0.12 NOTCOLOR=0.12 RECENT=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c24_line=0.12 c25_pixels=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 with=0.12 PAIR=0.09 c10_three=0.06 c19_goes=0.05 c17_be=0.03 c16_new=0.02 a=0.02 c8_what's=0.01 to=0.00 of=0.00 c12_that=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.762
- heldout_formulations: structure (depth, negation) 0.857
- heldout_formulations: predicate (surface lemma) 0.857
- heldout_formulations: event type (synonym table) 0.857
- heldout_formulations: role object 0.841
- heldout_formulations: head object 0.857
- heldout_formulations: heads FULL (model) 0.778
- heldout_formulations: heads FULL (lexical order baseline) 0.349
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.667
- heldout_formulations: FULL [depth given] 0.762
- heldout_formulations: FULL [depth and negation given] 0.762
- heldout_formulations: FULL [presence not decided] 0.619
- heldout_formulations: role object [presence not decided] 0.778
- heldout_formulations: role color [presence not decided] 0.841
- heldout_formulations: heads FULL (model) [presence not decided] 0.619
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.365
- heldout_formulations: role object [pooled midpoint (comparison)] 0.603
- heldout_formulations: role color [pooled midpoint (comparison)] 0.889
- heldout_formulations: role relation [pooled midpoint (comparison)] 0.825
- heldout_formulations: role landmark [pooled midpoint (comparison)] 0.825
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.365
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: occupancy: known filler 0.733
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.100
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.100
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence color: present read present 0.750
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.125
- heldout_formulations: presence color: share of 'present' readings that abstain 0.143
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.830
- train (sample): structure (depth, negation) 0.883
- train (sample): predicate (surface lemma) 0.883
- train (sample): event type (synonym table) 0.883
- train (sample): heads FULL (model) 0.837
- train (sample): heads FULL (lexical order baseline) 0.370
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.847
- train (sample): FULL [depth given] 0.830
- train (sample): FULL [depth and negation given] 0.830
- train (sample): presence object: share of 'present' readings that abstain 0.000
- train (sample): presence object: share of true 'present' readings that abstain 0.000
- train (sample): occupancy: known filler 0.834
- train (sample): presence relation: share of 'present' readings that abstain 0.024
- train (sample): presence relation: share of true 'present' readings that abstain 0.024
- train (sample): presence landmark: share of 'present' readings that abstain 0.049
- train (sample): presence landmark: share of true 'present' readings that abstain 0.049
- train (sample): presence color: share of 'present' readings that abstain 0.341
- train (sample): presence color: share of true 'present' readings that abstain 0.071

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `which COLOR c7_i` FULL 0.000 (n 1)
- heldout_formulations: `what are the current c3_rules` FULL 0.000 (n 1)
- heldout_formulations: `what are the c3_rules` FULL 0.000 (n 1)
- heldout_formulations: `is there a SHAPE anywhere` FULL 0.000 (n 1)
- heldout_formulations: `which everything that is COLOR right now` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role color | role relation | role landmark | role landmark2 |
|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.778 | 0.762 | 0.841 | 0.952 | 0.984 | 0.968 | 1.000 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.365 | 0.365 | 0.603 | 0.889 | 0.825 | 0.825 | 1.000 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.619 | 0.619 | 0.778 | 0.841 | 0.968 | 0.984 | 1.000 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | 0.973 | 0.986 | 0.000 (0.000 / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | color | product: fitted | 0.750 | 0.978 | 0.864 | 0.143 (1.000 / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.125 | 1.000 | 0.562 |  |
| heldout_formulations | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.100 (— / 0.100) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark | product: fitted | 0.900 | 1.000 | 0.950 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 1.000 | 0.945 | 0.973 | 0.341 (0.923 / 0.071) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.024 (— / 0.024) |
| train (sample) | landmark | product: fitted | 0.976 | 1.000 | 0.988 | 0.049 (— / 0.049) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
