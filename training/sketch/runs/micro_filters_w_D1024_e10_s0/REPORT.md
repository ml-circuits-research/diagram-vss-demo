# REPORT — world `filters_w`, legend sha256:9e2d4f592b2f… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1520 annotated sentences from 2 files; provenance: {'llm': 1520}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_filters_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 68 sentences
- heldout_formulations: 76 sentences
- train: 1376 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
5971 tokens in the examples; 149 with no kind in the lexicon (share 0.025), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit f9dc7da. Memory curve: runs/micro_filters_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.382 [rule: fit; pooled midpoint 3.300 (comparison)] (present 6.535, n 182 / absent 0.065, n 286)
- presence:color: threshold 0.429 [rule: fit; pooled midpoint 0.631 (comparison)] (present 0.901, n 59 / absent 0.360, n 409)
- presence:relation: threshold 0.714 [rule: fit; pooled midpoint 0.638 (comparison)] (present 1.079, n 46 / absent 0.196, n 422)
- presence:landmark: threshold 0.440 [rule: fit; pooled midpoint 0.652 (comparison)] (present 1.065, n 48 / absent 0.239, n 420)
- presence:landmark2: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 468)
- presence:notcolor: threshold 0.358 [rule: fit; pooled midpoint 0.527 (comparison)] (present 0.958, n 49 / absent 0.095, n 419)
- attr_presence:object: threshold 0.360 [rule: fit; pooled midpoint 0.455 (comparison)] (present 0.847, n 53 / absent 0.062, n 129)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.022, color 0.056, relation 0.067, landmark 0.006, landmark2 0.006, notcolor 0.056, predicate 0.333

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 76 of 76)
| axis | accuracy |
|---|---|
| FULL | 0.934 |
| FULL [depth given] | 0.934 |
| FULL [depth and negation given] | 0.934 |
| FULL [presence not decided] | 0.803 |
| FULL [pooled midpoint (comparison)] | 0.618 |
| presence object: absent read absent | 1.000 |
| presence color: absent read absent | 0.984 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| structure (depth, negation) | 0.961 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.961 |
| event type (synonym table) | 0.961 |
| role object | 0.947 |
| head object | 0.947 |
| lexical order head object | 0.671 |
| lexical bag head object | 0.855 |
| occupancy: not given | 0.997 |
| role color | 0.987 |
| head color | 0.987 |
| lexical order head color | 0.842 |
| lexical bag head color | 0.855 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.842 |
| lexical bag head relation | 0.895 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.855 |
| lexical bag head landmark | 0.908 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 1.000 |
| lexical bag head landmark2 | 1.000 |
| role notcolor | 0.987 |
| head notcolor | 0.987 |
| lexical order head notcolor | 0.882 |
| lexical bag head notcolor | 0.908 |
| heads FULL (model) | 0.934 |
| heads FULL (lexical order baseline) | 0.263 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.526 |
| role object [presence not decided] | 0.895 |
| role color [presence not decided] | 0.908 |
| role relation [presence not decided] | 1.000 |
| role landmark [presence not decided] | 1.000 |
| role landmark2 [presence not decided] | 1.000 |
| role notcolor [presence not decided] | 1.000 |
| heads FULL (model) [presence not decided] | 0.803 |
| role object [pooled midpoint (comparison)] | 0.671 |
| role color [pooled midpoint (comparison)] | 0.987 |
| role relation [pooled midpoint (comparison)] | 1.000 |
| role landmark [pooled midpoint (comparison)] | 0.974 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role notcolor [pooled midpoint (comparison)] | 0.974 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.618 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence notcolor: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: present read present | 0.955 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| occupancy: known filler | 0.915 |
| presence object: present read present [pooled midpoint (comparison)] | 0.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.077 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.917 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| occupancy: unknown filler | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.818 |
| presence notcolor: present read present | 0.889 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |
| presence notcolor: present read present [pooled midpoint (comparison)] | 0.778 |
| presence color: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.105; status {'ok': 71, 'abstain': 2, 'unknown-event': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.961 | 0.690 / 0.491 | 0.96 | 0.013 | 0.013 / 0.026 |
| role object | 0.840 | 0.535 / 0.295 | 0.96 | 0.120 | 0.000 / 0.040 |
| roles (pooled) | 0.928 | 0.476 / 0.171 | 0.97 | 0.043 | 0.000 / 0.029 |
| role color | 1.000 | 0.448 / 0.277 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 1.000 | 0.363 / 0.180 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark | 1.000 | 0.472 / 0.172 | 1.00 | 0.000 | 0.000 / 0.000 |
| role notcolor | 0.889 | 0.505 / 0.132 | 0.89 | 0.000 | 0.000 / 0.111 |

### train (sample) — catalog candidates (n = 300 of 1376)
| axis | accuracy |
|---|---|
| FULL | 0.970 |
| FULL [depth given] | 0.970 |
| FULL [depth and negation given] | 0.970 |
| presence object: absent read absent | 1.000 |
| presence color: absent read absent | 0.996 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| structure (depth, negation) | 0.980 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.980 |
| event type (synonym table) | 0.980 |
| role object | 0.987 |
| head object | 0.987 |
| lexical order head object | 0.613 |
| lexical bag head object | 0.930 |
| occupancy: not given | 0.999 |
| role color | 0.987 |
| head color | 0.987 |
| lexical order head color | 0.867 |
| lexical bag head color | 0.927 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.877 |
| lexical bag head relation | 0.940 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.870 |
| lexical bag head landmark | 0.940 |
| role landmark2 | 0.997 |
| head landmark2 | 0.997 |
| lexical order head landmark2 | 0.997 |
| lexical bag head landmark2 | 1.000 |
| role notcolor | 1.000 |
| head notcolor | 1.000 |
| lexical order head notcolor | 0.893 |
| lexical bag head notcolor | 0.953 |
| heads FULL (model) | 0.970 |
| heads FULL (lexical order baseline) | 0.280 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.750 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| occupancy: known filler | 0.970 |
| presence color: present read present | 0.974 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence notcolor: present read present | 1.000 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.027 |
| presence relation: share of true 'present' readings that abstain | 0.027 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.026 |
| presence landmark: share of true 'present' readings that abstain | 0.026 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.085; status {'ok': 292, 'abstain': 2, 'unknown-event': 6}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.980 | 0.726 / 0.524 | 0.99 | 0.010 | 0.000 / 0.010 |
| role object | 0.966 | 0.595 / 0.455 | 1.00 | 0.034 | 0.000 / 0.000 |
| roles (pooled) | 0.970 | 0.525 / 0.317 | 0.98 | 0.023 | 0.008 / 0.008 |
| role color | 0.925 | 0.494 / 0.324 | 0.97 | 0.050 | 0.000 / 0.025 |
| role notcolor | 1.000 | 0.589 / 0.354 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 1.000 | 0.328 / 0.199 | 0.97 | 0.000 | 0.027 / 0.000 |
| role landmark | 1.000 | 0.497 / 0.387 | 0.97 | 0.000 | 0.026 / 0.000 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
c26_shape=0.99 c7_i=0.99 SHAPE=0.99 c3_rules=0.97 NOTCOLOR=0.96 c23_in=0.91 VERB=0.86 c6_both=0.85 POS=0.84 c15_on=0.80 c13_one=0.73 NAME=0.64 c11_what=0.57 DIR=0.50 c18_does=0.44 c27_them=0.41 the=0.36 are=0.34 c1_have=0.32 it=0.30 and=0.24 QUANT=0.23 c9_an=0.16 c10_three=0.12 ARROW=0.12 AXIS=0.12 LAYOUT=0.12 PAIR=0.12 RECENT=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c24_line=0.12 c25_pixels=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 with=0.12 c4_then=0.12 c16_new=0.12 c14_uh=0.09 c19_goes=0.04 c17_be=0.04 a=0.04 c5_me=0.04 COLOR=0.03 c2_now=0.02 unknown=0.02 c8_what's=0.01 to=0.01 c12_that=0.00 of=0.00

## What is weak, what to add
- heldout_formulations: heads FULL (lexical order baseline) 0.263
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.526
- heldout_formulations: FULL [presence not decided] 0.803
- heldout_formulations: role object [presence not decided] 0.895
- heldout_formulations: heads FULL (model) [presence not decided] 0.803
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.618
- heldout_formulations: role object [pooled midpoint (comparison)] 0.671
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.618
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.077
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.818
- heldout_formulations: presence notcolor: present read present 0.889
- heldout_formulations: presence notcolor: share of 'present' readings that abstain 0.000
- heldout_formulations: presence notcolor: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence notcolor: present read present [pooled midpoint (comparison)] 0.778
- train (sample): heads FULL (lexical order baseline) 0.280
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.750
- train (sample): presence object: share of 'present' readings that abstain 0.000
- train (sample): presence object: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): presence notcolor: share of 'present' readings that abstain 0.000
- train (sample): presence notcolor: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.027
- train (sample): presence relation: share of true 'present' readings that abstain 0.027
- train (sample): presence landmark: share of 'present' readings that abstain 0.026
- train (sample): presence landmark: share of true 'present' readings that abstain 0.026
- train (sample): presence color: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `how COLOR c7_i are there` FULL 0.000 (n 2)
- heldout_formulations: `which items are still not finished , meaning c7_i that are which NOTCOLOR` FULL 0.000 (n 1)
- heldout_formulations: `is_there a COLOR c26_shape anywhere` FULL 0.000 (n 1)
- heldout_formulations: `or a SHAPE` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role color | role relation | role landmark | role landmark2 | role notcolor |
|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.934 | 0.934 | 0.947 | 0.987 | 1.000 | 1.000 | 1.000 | 0.987 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.618 | 0.618 | 0.671 | 0.987 | 1.000 | 0.974 | 1.000 | 0.974 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.803 | 0.803 | 0.895 | 0.908 | 1.000 | 1.000 | 1.000 | 1.000 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.955 | 1.000 | 0.977 | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | color | product: fitted | 1.000 | 0.984 | 0.992 | 0.077 (1.000 / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.917 | 1.000 | 0.958 |  |
| heldout_formulations | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.818 | 1.000 | 0.909 |  |
| heldout_formulations | notcolor | product: fitted | 0.889 | 1.000 | 0.944 | 0.000 (— / 0.000) |
| heldout_formulations | notcolor | comparison: pooled midpoint | 0.778 | 1.000 | 0.889 |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.974 | 0.996 | 0.985 | 0.000 (0.000 / 0.000) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.027 (— / 0.027) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.026 (— / 0.026) |
| train (sample) | notcolor | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
