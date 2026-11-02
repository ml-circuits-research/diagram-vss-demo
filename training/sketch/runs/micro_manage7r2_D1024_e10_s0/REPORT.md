# REPORT — world `manage7r2`, legend sha256:39d4725dae50… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
2001 annotated sentences from 2 files; provenance: {'llm': 2001}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_manage7r2_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 84 sentences
- heldout_formulations: 78 sentences
- train: 1839 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
8622 tokens in the examples; 446 with no kind in the lexicon (share 0.052), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cuda, codes path+chainL+bigram, gates learned (closed start). Code commit 09a2cfa. Memory curve: runs/micro_manage7r2_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.081 [rule: fit; pooled midpoint 0.427 (comparison)] (present 0.854, n 641 / absent 0.000, n 2316678)
- presence:object: threshold 0.578 [rule: fit; pooled midpoint 1.229 (comparison)] (present 2.055, n 1564 / absent 0.404, n 359)
- attr_presence:object: threshold 0.467 [rule: fit; pooled midpoint 0.479 (comparison)] (present 0.889, n 20 / absent 0.068, n 1544)
- det_presence:object: threshold 0.477 [rule: fit; pooled midpoint 0.467 (comparison)] (present 0.890, n 73 / absent 0.043, n 1491)
- presence:name: threshold 0.213 [rule: fit; pooled midpoint 0.544 (comparison)] (present 1.048, n 691 / absent 0.040, n 1232)
- presence:text: threshold 0.126 [rule: fit; pooled midpoint 0.486 (comparison)] (present 0.950, n 235 / absent 0.023, n 1688)
- presence:quantity: threshold 0.599 [rule: fit; pooled midpoint 0.510 (comparison)] (present 1.000, n 227 / absent 0.021, n 1696)
- presence:members: threshold 0.136 [rule: fit; pooled midpoint 0.591 (comparison)] (present 1.038, n 292 / absent 0.145, n 1631)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, name 0.001, text 0.000, quantity 0.083, members 0.001, predicate 0.167

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 78 of 78)
| axis | accuracy |
|---|---|
| FULL | 0.808 |
| FULL [pooled midpoint (comparison)] | 0.115 |
| presence object: present read present | 0.903 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence name: absent read absent | 1.000 |
| presence text: present read present | 0.818 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.949 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.962 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.949 |
| event type (synonym table) | 0.949 |
| role object | 0.859 |
| head object | 0.859 |
| lexical order head object | 0.821 |
| lexical bag head object | 0.795 |
| occupancy: known filler | 0.833 |
| role name | 0.987 |
| head name | 0.987 |
| lexical order head name | 0.667 |
| lexical bag head name | 0.872 |
| occupancy: not given | 0.985 |
| role text | 0.962 |
| head text | 0.962 |
| lexical order head text | 0.859 |
| lexical bag head text | 0.897 |
| occupancy: unknown filler | 0.923 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.910 |
| lexical bag head quantity | 1.000 |
| role members | 0.962 |
| head members | 0.962 |
| lexical order head members | 0.859 |
| lexical bag head members | 0.846 |
| heads FULL (model) | 0.821 |
| heads FULL (lexical order baseline) | 0.385 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.500 |
| role object [pooled midpoint (comparison)] | 0.192 |
| role name [pooled midpoint (comparison)] | 0.974 |
| role text [pooled midpoint (comparison)] | 0.962 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.949 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.128 |
| presence object: present read present [pooled midpoint (comparison)] | 0.016 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present [pooled midpoint (comparison)] | 0.900 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent | 0.984 |
| presence text: absent read absent [pooled midpoint (comparison)] | 0.984 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 0.960 |
| presence text: share of FALSE 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.500 |
| presence object: absent read absent | 0.750 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.800 |
| set members: first gold member in the decoded set | 0.727 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.700 |
| presence members: share of 'present' readings that abstain | 0.250 |
| presence members: share of true 'present' readings that abstain | 0.250 |

residual mean 0.137; status {'ok': 72, 'no-sense': 2, 'unknown-event': 2, 'abstain': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.949 | 0.605 / 0.540 | 0.99 | 0.038 | 0.000 / 0.013 |
| role object | 0.875 | 0.379 / 0.079 | 0.89 | 0.016 | 0.000 / 0.109 |
| roles (pooled) | 0.882 | 0.390 / 0.017 | 0.88 | 0.017 | 0.017 / 0.101 |
| role text | 0.818 | 0.431 / 0.000 | 0.82 | 0.000 | 0.000 / 0.182 |
| role name | 0.962 | 0.518 / 0.340 | 1.00 | 0.038 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.397 / 0.327 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.727 | 0.108 / 0.000 | 0.55 | 0.000 | 0.182 / 0.273 |

### train (sample) — catalog candidates (n = 150 of 1839)
| axis | accuracy |
|---|---|
| FULL | 0.840 |
| presence object: present read present | 0.991 |
| presence object: share of 'present' readings that abstain | 0.027 |
| presence object: share of true 'present' readings that abstain | 0.028 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence text: absent read absent | 0.992 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 0.991 |
| structure (depth, negation) | 0.920 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.927 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.913 |
| event type (synonym table) | 0.913 |
| role object | 0.927 |
| head object | 0.927 |
| lexical order head object | 0.740 |
| lexical bag head object | 0.993 |
| occupancy: known filler | 0.946 |
| role name | 0.987 |
| head name | 0.987 |
| lexical order head name | 0.633 |
| lexical bag head name | 0.993 |
| role text | 0.987 |
| head text | 0.987 |
| lexical order head text | 0.913 |
| lexical bag head text | 0.993 |
| occupancy: not given | 0.988 |
| role quantity | 0.993 |
| head quantity | 0.993 |
| lexical order head quantity | 0.860 |
| lexical bag head quantity | 1.000 |
| role members | 0.927 |
| head members | 0.927 |
| lexical order head members | 0.813 |
| lexical bag head members | 0.813 |
| heads FULL (model) | 0.873 |
| heads FULL (lexical order baseline) | 0.353 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.800 |
| presence name: absent read absent | 1.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.077 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence object: absent read absent | 0.867 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.846 |
| set members: first gold member in the decoded set | 0.786 |
| occupancy: unknown filler | 0.786 |
| presence members: share of 'present' readings that abstain | 0.217 |
| presence members: share of true 'present' readings that abstain | 0.227 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence text: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.145; status {'ok': 128, 'no-sense': 5, 'unknown-event': 7, 'abstain': 10}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.913 | 0.591 / 0.520 | 0.97 | 0.053 | 0.000 / 0.033 |
| role object | 0.939 | 0.408 / 0.279 | 0.96 | 0.053 | 0.026 / 0.009 |
| roles (pooled) | 0.909 | 0.384 / 0.105 | 0.94 | 0.061 | 0.030 / 0.030 |
| role name | 0.964 | 0.476 / 0.314 | 1.00 | 0.036 | 0.000 / 0.000 |
| role quantity | 0.952 | 0.362 / 0.262 | 1.00 | 0.048 | 0.000 / 0.000 |
| role text | 0.923 | 0.448 / 0.167 | 1.00 | 0.077 | 0.000 / 0.000 |
| role members | 0.643 | 0.089 / 0.000 | 0.64 | 0.143 | 0.143 / 0.214 |

## Gates (seed 0; OPEN > 0.5)
and=1.00 c9_an=0.99 TEXT=0.95 c4_then=0.94 with=0.91 c27_them=0.90 RECENT=0.88 SHAPE=0.86 c22_from=0.85 to=0.83 it=0.81 VERB=0.81 c16_new=0.76 c12_that=0.73 DIR=0.70 c6_both=0.66 named=0.55 NUM=0.55 the=0.53 c3_rules=0.52 c20_arrow=0.48 LAYOUT=0.43 QUANT=0.42 c17_be=0.36 are=0.24 c1_have=0.20 c19_goes=0.17 c2_now=0.15 c10_three=0.14 c13_one=0.14 c8_what's=0.12 ARROW=0.12 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 POS=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 c18_does=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 directly=0.12 labeled=0.12 lines=0.12 c26_shape=0.11 c5_me=0.06 c23_in=0.04 called=0.04 of=0.03 NAME=0.03 c15_on=0.01 a=0.01 COLOR=0.01 c14_uh=0.01 c7_i=0.01 c11_what=0.00 unknown=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.808
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: present read present 0.818
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: role object 0.859
- heldout_formulations: head object 0.859
- heldout_formulations: occupancy: known filler 0.833
- heldout_formulations: heads FULL (model) 0.821
- heldout_formulations: heads FULL (lexical order baseline) 0.385
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.500
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.115
- heldout_formulations: role object [pooled midpoint (comparison)] 0.192
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.128
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.016
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.500
- heldout_formulations: presence object: absent read absent 0.750
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present 0.800
- heldout_formulations: set members: first gold member in the decoded set 0.727
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.700
- heldout_formulations: presence members: share of 'present' readings that abstain 0.250
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.250
- train (sample): FULL 0.840
- train (sample): presence object: share of 'present' readings that abstain 0.027
- train (sample): presence object: share of true 'present' readings that abstain 0.028
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): heads FULL (model) 0.873
- train (sample): heads FULL (lexical order baseline) 0.353
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.800
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.077
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence object: absent read absent 0.867
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence members: present read present 0.846
- train (sample): set members: first gold member in the decoded set 0.786
- train (sample): occupancy: unknown filler 0.786
- train (sample): presence members: share of 'present' readings that abstain 0.217
- train (sample): presence members: share of true 'present' readings that abstain 0.227
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `group NAME to NAME` FULL 0.000 (n 3)
- heldout_formulations: `give NAME the label TEXT` FULL 0.000 (n 2)
- heldout_formulations: `delete the old COLOR SHAPE` FULL 0.000 (n 2)
- heldout_formulations: `label NAME as n_grandma NAME` FULL 0.000 (n 1)
- heldout_formulations: `delete QUANT SHAPE that QUANT black` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role name | role text | role quantity | role members |
|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.821 | 0.808 | 0.859 | 0.987 | 0.962 | 1.000 | 0.962 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.128 | 0.115 | 0.192 | 0.974 | 0.962 | 1.000 | 0.949 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.903 | 0.750 | 0.827 | 0.000 (0.000 / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.016 | 1.000 | 0.508 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 0.960 | 1.000 | 0.980 |  |
| heldout_formulations | text | product: fitted | 0.818 | 0.984 | 0.901 | 0.000 (0.000 / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 0.900 | 0.984 | 0.942 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 0.800 | 1.000 | 0.900 | 0.250 (— / 0.250) |
| heldout_formulations | members | comparison: pooled midpoint | 0.700 | 1.000 | 0.850 |  |
| train (sample) | object | product: fitted | 0.991 | 0.867 | 0.929 | 0.027 (0.000 / 0.028) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 0.992 | 0.996 | 0.077 (1.000 / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 0.846 | 0.991 | 0.919 | 0.217 (0.000 / 0.227) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
