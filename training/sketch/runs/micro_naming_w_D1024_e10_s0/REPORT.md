# REPORT — world `naming_w`, legend sha256:83d707454ab1… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
563 annotated sentences from 2 files; provenance: {'llm': 563}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_naming_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 20 sentences
- heldout_formulations: 23 sentences
- train: 520 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
2469 tokens in the examples; 68 with no kind in the lexicon (share 0.028), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 0776f18. Memory curve: runs/micro_naming_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.459 [rule: fit; pooled midpoint 0.825 (comparison)] (present 1.019, n 409 / absent 0.630, n 11)
- attr_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 408)
- det_presence:object: threshold 0.440 [rule: fit; pooled midpoint 0.444 (comparison)] (present 0.827, n 14 / absent 0.060, n 395)
- presence:name: threshold 0.346 [rule: fit; pooled midpoint 0.574 (comparison)] (present 1.138, n 270 / absent 0.009, n 150)
- presence:text: threshold 0.280 [rule: fit; pooled midpoint 0.495 (comparison)] (present 0.957, n 118 / absent 0.033, n 302)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, name 0.001, text 0.001, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 23 of 23)
| axis | accuracy |
|---|---|
| FULL | 0.913 |
| FULL [depth given] | 0.913 |
| FULL [depth and negation given] | 0.913 |
| FULL [presence not decided] | 0.957 |
| FULL [pooled midpoint (comparison)] | 0.783 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence name: absent read absent | 1.000 |
| presence text: present read present | 0.875 |
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
| lexical bag head object | 0.652 |
| occupancy: unknown filler | 1.000 |
| role name | 1.000 |
| head name | 1.000 |
| lexical order head name | 0.826 |
| lexical bag head name | 0.739 |
| occupancy: not given | 0.958 |
| role text | 0.913 |
| head text | 0.913 |
| lexical order head text | 0.652 |
| lexical bag head text | 0.739 |
| heads FULL (model) | 0.913 |
| heads FULL (lexical order baseline) | 0.609 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.130 |
| role object [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 0.957 |
| heads FULL (model) [presence not decided] | 0.957 |
| role object [pooled midpoint (comparison)] | 0.870 |
| role name [pooled midpoint (comparison)] | 0.957 |
| role text [pooled midpoint (comparison)] | 0.913 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.783 |
| presence object: present read present [pooled midpoint (comparison)] | 0.870 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present [pooled midpoint (comparison)] | 0.875 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence text: absent read absent | 0.933 |
| presence name: present read present [pooled midpoint (comparison)] | 0.929 |
| presence text: absent read absent [pooled midpoint (comparison)] | 0.933 |
| occupancy: known filler | 0.900 |
| presence text: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.016; status {'ok': 23}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.582 / 0.534 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 1.000 | 0.508 / 0.382 | 1.00 | 0.000 | 0.000 / 0.000 |
| roles (pooled) | 0.978 | 0.511 / 0.399 | 0.98 | 0.000 | 0.000 / 0.022 |
| role text | 0.875 | 0.469 / 0.332 | 0.88 | 0.000 | 0.000 / 0.125 |
| role name | 1.000 | 0.541 / 0.496 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 520)
| axis | accuracy |
|---|---|
| FULL | 0.917 |
| FULL [depth given] | 0.917 |
| FULL [depth and negation given] | 0.917 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.005 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence text: absent read absent | 0.963 |
| structure (depth, negation) | 0.953 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.953 |
| event type (synonym table) | 0.953 |
| role object | 0.953 |
| head object | 0.957 |
| lexical order head object | 0.977 |
| lexical bag head object | 0.990 |
| occupancy: known filler | 0.954 |
| role name | 0.993 |
| head name | 0.993 |
| lexical order head name | 0.773 |
| lexical bag head name | 0.993 |
| role text | 0.933 |
| head text | 0.933 |
| lexical order head text | 0.723 |
| lexical bag head text | 0.983 |
| occupancy: not given | 0.973 |
| heads FULL (model) | 0.920 |
| heads FULL (lexical order baseline) | 0.620 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.967 |
| presence name: absent read absent | 0.990 |
| presence text: present read present | 0.986 |
| presence text: share of 'present' readings that abstain | 0.076 |
| presence text: share of true 'present' readings that abstain | 0.014 |
| presence object: absent read absent | 1.000 |
| presence name: share of FALSE 'present' readings that abstain | 1.000 |
| presence text: share of FALSE 'present' readings that abstain | 0.625 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |

residual mean 0.091; status {'ok': 279, 'abstain': 7, 'unknown-event': 14}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.953 | 0.566 / 0.513 | 0.98 | 0.027 | 0.000 / 0.020 |
| role object | 0.953 | 0.518 / 0.448 | 1.00 | 0.047 | 0.000 / 0.000 |
| roles (pooled) | 0.952 | 0.523 / 0.457 | 0.99 | 0.040 | 0.002 / 0.007 |
| role name | 0.995 | 0.549 / 0.473 | 0.99 | 0.000 | 0.000 / 0.005 |
| role text | 0.855 | 0.483 / 0.379 | 0.95 | 0.108 | 0.012 / 0.036 |

## Gates (seed 0; OPEN > 0.5)
c9_an=0.93 TEXT=0.92 with=0.92 VERB=0.91 to=0.85 it=0.67 RECENT=0.67 NUM=0.61 LAYOUT=0.54 c8_what's=0.43 c3_rules=0.40 c16_new=0.33 c23_in=0.32 c12_that=0.32 of=0.31 COLOR=0.31 NAME=0.28 c26_shape=0.26 c19_goes=0.24 c1_have=0.19 c4_then=0.13 ARROW=0.12 AXIS=0.12 DIR=0.12 NOTCOLOR=0.12 PAIR=0.12 POS=0.12 QUANT=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 and=0.12 are=0.12 c10_three=0.12 c17_be=0.12 c18_does=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c24_line=0.12 c25_pixels=0.12 c27_them=0.12 c6_both=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 a=0.08 c14_uh=0.07 c13_one=0.07 c2_now=0.06 c5_me=0.05 c7_i=0.03 SHAPE=0.03 unknown=0.02 c11_what=0.02 the=0.01 c15_on=0.01

## What is weak, what to add
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: present read present 0.875
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: heads FULL (lexical order baseline) 0.609
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.130
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.783
- heldout_formulations: role object [pooled midpoint (comparison)] 0.870
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.783
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.870
- heldout_formulations: presence text: present read present [pooled midpoint (comparison)] 0.875
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.000
- train (sample): presence object: share of true 'present' readings that abstain 0.000
- train (sample): presence name: share of 'present' readings that abstain 0.005
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): heads FULL (lexical order baseline) 0.620
- train (sample): presence text: share of 'present' readings that abstain 0.076
- train (sample): presence text: share of true 'present' readings that abstain 0.014
- train (sample): presence text: share of FALSE 'present' readings that abstain 0.625

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `label NAME as n_grandma NAME` FULL 0.000 (n 1)
- heldout_formulations: `label NAME the label NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role name | role text |
|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.913 | 0.913 | 1.000 | 1.000 | 0.913 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.783 | 0.783 | 0.870 | 0.957 | 0.913 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.957 | 0.957 | 1.000 | 1.000 | 0.957 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | — | — | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.870 | — | — |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 0.929 | 1.000 | 0.964 |  |
| heldout_formulations | text | product: fitted | 0.875 | 0.933 | 0.904 | 0.000 (0.000 / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 0.875 | 0.933 | 0.904 |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | name | product: fitted | 1.000 | 0.990 | 0.995 | 0.005 (1.000 / 0.000) |
| train (sample) | text | product: fitted | 0.986 | 0.963 | 0.974 | 0.076 (0.625 / 0.014) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
