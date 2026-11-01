# REPORT — world `naming`, legend sha256:83d707454ab1… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
495 annotated sentences from 2 files; provenance: {'llm': 495}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_naming_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 19 sentences
- heldout_formulations: 18 sentences
- train: 458 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
2165 tokens in the examples; 60 with no kind in the lexicon (share 0.028), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 1bdf306. Memory curve: runs/micro_naming_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.540 [rule: fit; pooled midpoint 0.966 (comparison)] (present 1.016, n 407 / absent 0.915, n 12)
- det_presence:object: threshold 0.451 [rule: fit; pooled midpoint 0.484 (comparison)] (present 0.910, n 7 / absent 0.057, n 400)
- presence:name: threshold 0.352 [rule: fit; pooled midpoint 0.627 (comparison)] (present 1.251, n 291 / absent 0.004, n 128)
- presence:text: threshold 0.212 [rule: fit; pooled midpoint 0.494 (comparison)] (present 0.951, n 102 / absent 0.036, n 317)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, name 0.001, text 0.001, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 18 of 18)
| axis | accuracy |
|---|---|
| FULL | 0.833 |
| FULL [depth given] | 0.833 |
| FULL [depth and negation given] | 0.833 |
| FULL [presence not decided] | 0.944 |
| FULL [pooled midpoint (comparison)] | 0.667 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence name: absent read absent | 1.000 |
| presence text: present read present | 0.600 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| role object | 1.000 |
| head object | 1.000 |
| lexical order head object | 1.000 |
| lexical bag head object | 0.667 |
| occupancy: unknown filler | 0.963 |
| role name | 1.000 |
| head name | 1.000 |
| lexical order head name | 0.833 |
| lexical bag head name | 0.722 |
| occupancy: not given | 0.947 |
| role text | 0.833 |
| head text | 0.833 |
| lexical order head text | 0.722 |
| lexical bag head text | 0.833 |
| heads FULL (model) | 0.833 |
| heads FULL (lexical order baseline) | 0.667 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.222 |
| role object [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 0.944 |
| heads FULL (model) [presence not decided] | 0.944 |
| role object [pooled midpoint (comparison)] | 0.833 |
| role name [pooled midpoint (comparison)] | 0.944 |
| role text [pooled midpoint (comparison)] | 0.833 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.667 |
| presence object: present read present [pooled midpoint (comparison)] | 0.833 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present [pooled midpoint (comparison)] | 0.600 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence text: absent read absent | 0.923 |
| presence name: present read present [pooled midpoint (comparison)] | 0.917 |
| presence text: absent read absent [pooled midpoint (comparison)] | 0.923 |
| occupancy: known filler | 0.875 |
| presence text: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.061; status {'ok': 18}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.585 / 0.549 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 1.000 | 0.413 / 0.321 | 1.00 | 0.000 | 0.000 / 0.000 |
| roles (pooled) | 0.943 | 0.441 / 0.213 | 0.94 | 0.000 | 0.000 / 0.057 |
| role text | 0.600 | 0.301 / 0.000 | 0.60 | 0.000 | 0.000 / 0.400 |
| role name | 1.000 | 0.540 / 0.484 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 458)
| axis | accuracy |
|---|---|
| FULL | 0.927 |
| FULL [depth given] | 0.927 |
| FULL [depth and negation given] | 0.927 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence name: absent read absent | 1.000 |
| presence text: present read present | 0.985 |
| presence text: share of 'present' readings that abstain | 0.068 |
| presence text: share of true 'present' readings that abstain | 0.015 |
| structure (depth, negation) | 0.953 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.953 |
| event type (synonym table) | 0.953 |
| role object | 0.967 |
| head object | 0.967 |
| lexical order head object | 0.970 |
| lexical bag head object | 0.993 |
| occupancy: known filler | 0.960 |
| role name | 0.987 |
| head name | 0.987 |
| lexical order head name | 0.790 |
| lexical bag head name | 0.993 |
| occupancy: not given | 0.979 |
| role text | 0.947 |
| head text | 0.947 |
| lexical order head text | 0.747 |
| lexical bag head text | 0.990 |
| heads FULL (model) | 0.927 |
| heads FULL (lexical order baseline) | 0.643 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.980 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence text: absent read absent | 0.968 |
| presence object: absent read absent | 1.000 |
| presence text: share of FALSE 'present' readings that abstain | 0.571 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |

residual mean 0.084; status {'ok': 281, 'unknown-event': 12, 'abstain': 5, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.953 | 0.565 / 0.540 | 0.96 | 0.010 | 0.000 / 0.037 |
| role object | 0.966 | 0.447 / 0.383 | 1.00 | 0.034 | 0.000 / 0.000 |
| roles (pooled) | 0.960 | 0.490 / 0.400 | 0.99 | 0.031 | 0.002 / 0.009 |
| role text | 0.882 | 0.483 / 0.385 | 0.95 | 0.079 | 0.013 / 0.039 |
| role name | 0.980 | 0.554 / 0.466 | 0.99 | 0.010 | 0.000 / 0.010 |

## Gates (seed 0; OPEN > 0.5)
with=0.92 c9_an=0.92 TEXT=0.91 VERB=0.89 to=0.84 RECENT=0.75 it=0.66 NUM=0.63 c8_what's=0.54 c12_that=0.48 LAYOUT=0.41 c23_in=0.41 of=0.40 c3_rules=0.31 NAME=0.27 c13_one=0.24 c16_new=0.21 c26_shape=0.14 SHAPE=0.14 c14_uh=0.14 ARROW=0.12 AXIS=0.12 COLOR=0.12 DIR=0.12 NOTCOLOR=0.12 PAIR=0.12 POS=0.12 QUANT=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 and=0.12 are=0.12 c10_three=0.12 c17_be=0.12 c18_does=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c24_line=0.12 c25_pixels=0.12 c27_them=0.12 c2_now=0.12 c6_both=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c4_then=0.10 c1_have=0.09 c19_goes=0.06 c7_i=0.05 c5_me=0.05 a=0.03 the=0.02 c15_on=0.01 unknown=0.01 c11_what=0.01

## What is weak, what to add
- heldout_formulations: FULL 0.833
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: present read present 0.600
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: role text 0.833
- heldout_formulations: head text 0.833
- heldout_formulations: heads FULL (model) 0.833
- heldout_formulations: heads FULL (lexical order baseline) 0.667
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.222
- heldout_formulations: FULL [depth given] 0.833
- heldout_formulations: FULL [depth and negation given] 0.833
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.667
- heldout_formulations: role object [pooled midpoint (comparison)] 0.833
- heldout_formulations: role text [pooled midpoint (comparison)] 0.833
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.833
- heldout_formulations: presence text: present read present [pooled midpoint (comparison)] 0.600
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: occupancy: known filler 0.875
- heldout_formulations: presence text: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.000
- train (sample): presence object: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.068
- train (sample): presence text: share of true 'present' readings that abstain 0.015
- train (sample): heads FULL (lexical order baseline) 0.643
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of FALSE 'present' readings that abstain 0.571

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `label NAME as n_grandma NAME` FULL 0.000 (n 1)
- heldout_formulations: `give NAME the label NAME` FULL 0.000 (n 1)
- heldout_formulations: `label the first SHAPE NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role name | role text |
|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.833 | 0.833 | 1.000 | 1.000 | 0.833 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.667 | 0.667 | 0.833 | 0.944 | 0.833 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.944 | 0.944 | 1.000 | 1.000 | 0.944 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | — | — | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.833 | — | — |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 0.917 | 1.000 | 0.958 |  |
| heldout_formulations | text | product: fitted | 0.600 | 0.923 | 0.762 | 0.000 (0.000 / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 0.600 | 0.923 | 0.762 |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 0.985 | 0.968 | 0.977 | 0.068 (0.571 / 0.015) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
