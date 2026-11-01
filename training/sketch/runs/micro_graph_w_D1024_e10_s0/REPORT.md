# REPORT — world `graph_w`, legend sha256:c3d71fdea8cb… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1279 annotated sentences from 2 files; provenance: {'llm': 1279}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_graph_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 59 sentences
- heldout_formulations: 64 sentences
- train: 1156 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
6102 tokens in the examples; 73 with no kind in the lexicon (share 0.012), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit f9dc7da. Memory curve: runs/micro_graph_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.480 [rule: fit; pooled midpoint 0.634 (comparison)] (present 1.261, n 184 / absent 0.007, n 275)
- presence:landmark: threshold 0.222 [rule: fit; pooled midpoint 0.646 (comparison)] (present 1.287, n 184 / absent 0.006, n 275)
- presence:source: threshold 0.073 [rule: fit; pooled midpoint 1.246 (comparison)] (present 2.461, n 273 / absent 0.031, n 186)
- presence:target: threshold 0.144 [rule: fit; pooled midpoint 0.409 (comparison)] (present 0.657, n 213 / absent 0.160, n 246)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, landmark 0.001, source 0.001, target 0.001, predicate 0.333

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 64 of 64)
| axis | accuracy |
|---|---|
| FULL | 0.953 |
| FULL [depth given] | 0.953 |
| FULL [depth and negation given] | 0.953 |
| FULL [presence not decided] | 0.953 |
| FULL [pooled midpoint (comparison)] | 0.125 |
| presence object: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence source: present read present | 1.000 |
| presence source: share of 'present' readings that abstain | 0.000 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.968 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.969 |
| event type (synonym table) | 0.969 |
| role object | 1.000 |
| head object | 1.000 |
| lexical order head object | 0.562 |
| lexical bag head object | 0.750 |
| occupancy: not given | 1.000 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.562 |
| lexical bag head landmark | 0.781 |
| role source | 0.984 |
| head source | 0.984 |
| lexical order head source | 0.438 |
| lexical bag head source | 0.844 |
| occupancy: known filler | 0.984 |
| role target | 0.969 |
| head target | 0.969 |
| lexical order head target | 0.516 |
| lexical bag head target | 0.781 |
| heads FULL (model) | 0.969 |
| heads FULL (lexical order baseline) | 0.000 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.328 |
| role object [presence not decided] | 1.000 |
| role landmark [presence not decided] | 1.000 |
| role source [presence not decided] | 0.984 |
| role target [presence not decided] | 0.969 |
| heads FULL (model) [presence not decided] | 0.969 |
| role object [pooled midpoint (comparison)] | 0.719 |
| role landmark [pooled midpoint (comparison)] | 0.734 |
| role source [pooled midpoint (comparison)] | 0.516 |
| role target [pooled midpoint (comparison)] | 0.719 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.141 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.139 |
| presence target: present read present [pooled midpoint (comparison)] | 0.419 |
| occupancy: unknown filler | 1.000 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.071 |
| presence object: share of true 'present' readings that abstain | 0.071 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.036 |
| presence landmark: share of true 'present' readings that abstain | 0.036 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence object: present read present [pooled midpoint (comparison)] | 0.357 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.393 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |

residual mean 0.020; status {'ok': 60, 'abstain': 4}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.969 | 0.604 / 0.374 | 1.00 | 0.031 | 0.000 / 0.000 |
| role source | 0.972 | 0.354 / 0.157 | 1.00 | 0.028 | 0.000 / 0.000 |
| roles (pooled) | 0.976 | 0.291 / 0.091 | 0.97 | 0.016 | 0.024 / 0.008 |
| role target | 0.935 | 0.271 / 0.117 | 0.97 | 0.032 | 0.000 / 0.032 |
| role object | 1.000 | 0.161 / 0.058 | 0.93 | 0.000 | 0.071 / 0.000 |
| role landmark | 1.000 | 0.362 / 0.147 | 0.96 | 0.000 | 0.036 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 1156)
| axis | accuracy |
|---|---|
| FULL | 0.927 |
| FULL [depth given] | 0.927 |
| FULL [depth and negation given] | 0.927 |
| presence object: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence source: present read present | 0.994 |
| presence source: share of 'present' readings that abstain | 0.006 |
| presence source: share of true 'present' readings that abstain | 0.006 |
| presence target: present read present | 0.964 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| structure (depth, negation) | 0.970 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.930 |
| event type (synonym table) | 0.930 |
| role object | 0.993 |
| head object | 0.993 |
| lexical order head object | 0.600 |
| lexical bag head object | 0.980 |
| occupancy: not given | 1.000 |
| role landmark | 0.993 |
| head landmark | 0.993 |
| lexical order head landmark | 0.600 |
| lexical bag head landmark | 0.983 |
| role source | 0.970 |
| head source | 0.970 |
| lexical order head source | 0.403 |
| lexical bag head source | 0.987 |
| occupancy: known filler | 0.966 |
| role target | 0.977 |
| head target | 0.977 |
| lexical order head target | 0.527 |
| lexical bag head target | 0.993 |
| heads FULL (model) | 0.953 |
| heads FULL (lexical order baseline) | 0.003 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.957 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.076 |
| presence object: share of true 'present' readings that abstain | 0.076 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |

residual mean 0.053; status {'ok': 279, 'abstain': 12, 'unknown-event': 9}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.930 | 0.599 / 0.415 | 0.97 | 0.040 | 0.000 / 0.030 |
| role source | 0.950 | 0.426 / 0.197 | 0.99 | 0.045 | 0.006 / 0.006 |
| roles (pooled) | 0.964 | 0.346 / 0.096 | 0.97 | 0.021 | 0.018 / 0.014 |
| role target | 0.951 | 0.338 / 0.109 | 0.96 | 0.014 | 0.000 / 0.035 |
| role object | 0.983 | 0.174 / 0.057 | 0.92 | 0.008 | 0.075 / 0.008 |
| role landmark | 0.983 | 0.406 / 0.348 | 0.99 | 0.008 | 0.000 / 0.008 |

## Gates (seed 0; OPEN > 0.5)
VERB=0.99 to=0.99 and=0.96 c18_does=0.92 directly=0.91 c22_from=0.88 c10_three=0.75 c16_new=0.70 DIR=0.64 QUANT=0.58 c26_shape=0.53 c12_that=0.51 c23_in=0.51 c14_uh=0.51 c24_line=0.47 c4_then=0.45 c20_arrow=0.44 c9_an=0.40 c17_be=0.39 are=0.36 c6_both=0.35 with=0.35 c11_what=0.33 c27_them=0.30 c8_what's=0.29 c13_one=0.27 c3_rules=0.18 c7_i=0.18 a=0.17 it=0.15 c1_have=0.13 ARROW=0.12 AXIS=0.12 COLOR=0.12 LAYOUT=0.12 NOTCOLOR=0.12 PAIR=0.12 RECENT=0.12 SHAPE=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 c15_on=0.12 c19_goes=0.12 c21_arrowheads=0.12 c25_pixels=0.12 called=0.12 labeled=0.12 lines=0.12 named=0.12 of=0.12 c2_now=0.10 POS=0.07 unknown=0.03 c5_me=0.01 NAME=0.00 the=0.00

## What is weak, what to add
- heldout_formulations: presence source: share of 'present' readings that abstain 0.000
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.000
- heldout_formulations: heads FULL (lexical order baseline) 0.000
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.328
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.125
- heldout_formulations: role object [pooled midpoint (comparison)] 0.719
- heldout_formulations: role landmark [pooled midpoint (comparison)] 0.734
- heldout_formulations: role source [pooled midpoint (comparison)] 0.516
- heldout_formulations: role target [pooled midpoint (comparison)] 0.719
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.141
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.139
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.419
- heldout_formulations: presence object: share of 'present' readings that abstain 0.071
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.071
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.036
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.036
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.357
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.393
- train (sample): presence source: share of 'present' readings that abstain 0.006
- train (sample): presence source: share of true 'present' readings that abstain 0.006
- train (sample): presence target: share of 'present' readings that abstain 0.000
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): heads FULL (lexical order baseline) 0.003
- train (sample): presence object: share of 'present' readings that abstain 0.076
- train (sample): presence object: share of true 'present' readings that abstain 0.076
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
| heldout_formulations | product readout: presence decided | 0.969 | 0.953 | 1.000 | 1.000 | 0.984 | 0.969 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.141 | 0.125 | 0.719 | 0.734 | 0.516 | 0.719 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.969 | 0.953 | 1.000 | 1.000 | 0.984 | 0.969 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.071 (— / 0.071) |
| heldout_formulations | object | comparison: pooled midpoint | 0.357 | 1.000 | 0.679 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.036 (— / 0.036) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.393 | 1.000 | 0.696 |  |
| heldout_formulations | source | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | source | comparison: pooled midpoint | 0.139 | 1.000 | 0.569 |  |
| heldout_formulations | target | product: fitted | 0.968 | 1.000 | 0.984 | 0.000 (— / 0.000) |
| heldout_formulations | target | comparison: pooled midpoint | 0.419 | 1.000 | 0.710 |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.076 (— / 0.076) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.994 | 1.000 | 0.997 | 0.006 (— / 0.006) |
| train (sample) | target | product: fitted | 0.964 | 1.000 | 0.982 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
