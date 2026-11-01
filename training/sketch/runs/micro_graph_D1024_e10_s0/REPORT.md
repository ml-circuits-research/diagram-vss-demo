# REPORT — world `graph`, legend sha256:c3d71fdea8cb… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1091 annotated sentences from 2 files; provenance: {'llm': 1091}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_graph_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 49 sentences
- heldout_formulations: 58 sentences
- train: 984 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
5205 tokens in the examples; 59 with no kind in the lexicon (share 0.011), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 1bdf306. Memory curve: runs/micro_graph_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.233 [rule: fit; pooled midpoint 0.440 (comparison)] (present 0.824, n 188 / absent 0.055, n 261)
- presence:landmark: threshold 0.131 [rule: fit; pooled midpoint 0.452 (comparison)] (present 0.839, n 188 / absent 0.065, n 261)
- presence:source: threshold 0.081 [rule: fit; pooled midpoint 1.873 (comparison)] (present 3.523, n 260 / absent 0.223, n 189)
- presence:target: threshold 0.148 [rule: fit; pooled midpoint 0.503 (comparison)] (present 0.700, n 194 / absent 0.305, n 255)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, landmark 0.001, source 0.001, target 0.001, predicate 0.333

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 58 of 58)
| axis | accuracy |
|---|---|
| FULL | 0.948 |
| FULL [depth given] | 0.948 |
| FULL [depth and negation given] | 0.948 |
| FULL [presence not decided] | 0.948 |
| FULL [pooled midpoint (comparison)] | 0.431 |
| presence object: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence source: present read present | 1.000 |
| presence source: share of 'present' readings that abstain | 0.000 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.963 |
| presence target: share of 'present' readings that abstain | 0.038 |
| presence target: share of true 'present' readings that abstain | 0.038 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.966 |
| event type (synonym table) | 0.966 |
| role object | 1.000 |
| head object | 1.000 |
| lexical order head object | 0.552 |
| lexical bag head object | 0.741 |
| occupancy: not given | 1.000 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.552 |
| lexical bag head landmark | 0.776 |
| role source | 0.983 |
| head source | 0.983 |
| lexical order head source | 0.448 |
| lexical bag head source | 0.879 |
| occupancy: known filler | 0.980 |
| role target | 0.966 |
| head target | 0.966 |
| lexical order head target | 0.534 |
| lexical bag head target | 0.759 |
| heads FULL (model) | 0.966 |
| heads FULL (lexical order baseline) | 0.000 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.293 |
| role object [presence not decided] | 1.000 |
| role landmark [presence not decided] | 1.000 |
| role source [presence not decided] | 0.983 |
| role target [presence not decided] | 0.966 |
| heads FULL (model) [presence not decided] | 0.966 |
| role object [pooled midpoint (comparison)] | 1.000 |
| role landmark [pooled midpoint (comparison)] | 0.948 |
| role source [pooled midpoint (comparison)] | 0.500 |
| role target [pooled midpoint (comparison)] | 0.690 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.431 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.094 |
| presence target: present read present [pooled midpoint (comparison)] | 0.333 |
| occupancy: unknown filler | 1.000 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence object: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.885 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |

residual mean 0.022; status {'ok': 57, 'abstain': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.966 | 0.607 / 0.407 | 1.00 | 0.034 | 0.000 / 0.000 |
| role source | 0.969 | 0.364 / 0.149 | 1.00 | 0.031 | 0.000 / 0.000 |
| roles (pooled) | 0.973 | 0.345 / 0.144 | 0.98 | 0.009 | 0.000 / 0.018 |
| role target | 0.926 | 0.276 / 0.102 | 0.93 | 0.000 | 0.000 / 0.074 |
| role object | 1.000 | 0.359 / 0.277 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark | 1.000 | 0.377 / 0.197 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 984)
| axis | accuracy |
|---|---|
| FULL | 0.930 |
| FULL [depth given] | 0.930 |
| FULL [depth and negation given] | 0.930 |
| presence object: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence source: present read present | 1.000 |
| presence source: share of 'present' readings that abstain | 0.011 |
| presence source: share of true 'present' readings that abstain | 0.011 |
| presence target: present read present | 0.964 |
| presence target: share of 'present' readings that abstain | 0.015 |
| presence target: share of true 'present' readings that abstain | 0.015 |
| structure (depth, negation) | 0.963 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.937 |
| event type (synonym table) | 0.937 |
| role object | 0.983 |
| head object | 0.983 |
| lexical order head object | 0.610 |
| lexical bag head object | 0.977 |
| occupancy: not given | 1.000 |
| role landmark | 0.983 |
| head landmark | 0.983 |
| lexical order head landmark | 0.610 |
| lexical bag head landmark | 0.983 |
| role source | 0.973 |
| head source | 0.973 |
| lexical order head source | 0.390 |
| lexical bag head source | 0.993 |
| occupancy: known filler | 0.959 |
| role target | 0.973 |
| head target | 0.973 |
| lexical order head target | 0.533 |
| lexical bag head target | 0.990 |
| heads FULL (model) | 0.943 |
| heads FULL (lexical order baseline) | 0.000 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.957 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |

residual mean 0.057; status {'ok': 285, 'unknown-event': 11, 'abstain': 4}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.937 | 0.588 / 0.361 | 0.97 | 0.030 | 0.000 / 0.033 |
| role source | 0.956 | 0.446 / 0.199 | 0.98 | 0.038 | 0.011 / 0.005 |
| roles (pooled) | 0.953 | 0.401 / 0.165 | 0.97 | 0.027 | 0.007 / 0.020 |
| role target | 0.943 | 0.352 / 0.120 | 0.94 | 0.014 | 0.014 / 0.043 |
| role object | 0.957 | 0.372 / 0.274 | 0.98 | 0.026 | 0.000 / 0.017 |
| role landmark | 0.957 | 0.417 / 0.334 | 0.98 | 0.026 | 0.000 / 0.017 |

## Gates (seed 0; OPEN > 0.5)
VERB=0.99 to=0.98 and=0.97 c18_does=0.92 c22_from=0.91 directly=0.87 c23_in=0.59 c10_three=0.57 c16_new=0.52 ARROW=0.49 c26_shape=0.47 c12_that=0.43 c20_arrow=0.39 c9_an=0.39 c11_what=0.35 are=0.33 QUANT=0.30 c4_then=0.30 c8_what's=0.28 c13_one=0.25 it=0.24 with=0.23 c17_be=0.21 c14_uh=0.21 c27_them=0.20 c1_have=0.19 c2_now=0.16 AXIS=0.12 COLOR=0.12 LAYOUT=0.12 NOTCOLOR=0.12 RECENT=0.12 SHAPE=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 c15_on=0.12 c19_goes=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 called=0.12 labeled=0.12 lines=0.12 named=0.12 of=0.12 c6_both=0.11 POS=0.09 PAIR=0.09 DIR=0.08 c7_i=0.08 a=0.07 c3_rules=0.06 unknown=0.03 c5_me=0.01 NAME=0.01 the=0.00

## What is weak, what to add
- heldout_formulations: presence source: share of 'present' readings that abstain 0.000
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of 'present' readings that abstain 0.038
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.038
- heldout_formulations: heads FULL (lexical order baseline) 0.000
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.293
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.431
- heldout_formulations: role source [pooled midpoint (comparison)] 0.500
- heldout_formulations: role target [pooled midpoint (comparison)] 0.690
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.431
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.094
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.333
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.885
- train (sample): presence source: share of 'present' readings that abstain 0.011
- train (sample): presence source: share of true 'present' readings that abstain 0.011
- train (sample): presence target: share of 'present' readings that abstain 0.015
- train (sample): presence target: share of true 'present' readings that abstain 0.015
- train (sample): heads FULL (lexical order baseline) 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.000
- train (sample): presence object: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `does the NAME path_q the NAME` FULL 0.000 (n 1)
- heldout_formulations: `can NAME be reach_q from NAME` FULL 0.000 (n 1)
- heldout_formulations: `what is path_q NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role landmark | role source | role target |
|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.966 | 0.948 | 1.000 | 1.000 | 0.983 | 0.966 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.431 | 0.431 | 1.000 | 0.948 | 0.500 | 0.690 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.966 | 0.948 | 1.000 | 1.000 | 0.983 | 0.966 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.885 | 1.000 | 0.942 |  |
| heldout_formulations | source | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | source | comparison: pooled midpoint | 0.094 | 1.000 | 0.547 |  |
| heldout_formulations | target | product: fitted | 0.963 | 1.000 | 0.981 | 0.038 (— / 0.038) |
| heldout_formulations | target | comparison: pooled midpoint | 0.333 | 1.000 | 0.667 |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 1.000 | 1.000 | 1.000 | 0.011 (— / 0.011) |
| train (sample) | target | product: fitted | 0.964 | 1.000 | 0.982 | 0.015 (— / 0.015) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
