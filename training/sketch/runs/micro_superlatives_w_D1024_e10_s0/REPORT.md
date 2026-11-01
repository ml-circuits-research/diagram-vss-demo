# REPORT — world `superlatives_w`, legend sha256:e70bd9f04e3d… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1643 annotated sentences from 2 files; provenance: {'llm': 1643}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_superlatives_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 74 sentences
- heldout_formulations: 76 sentences
- train: 1493 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
9108 tokens in the examples; 218 with no kind in the lexicon (share 0.024), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit f2725dd. Memory curve: runs/micro_superlatives_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.374 [rule: fit; pooled midpoint 0.516 (comparison)] (present 0.961, n 192 / absent 0.070, n 282)
- attr_presence:object: threshold 0.443 [rule: fit; pooled midpoint 0.475 (comparison)] (present 0.879, n 8 / absent 0.071, n 192)
- presence:landmark: threshold 0.343 [rule: fit; pooled midpoint 0.432 (comparison)] (present 0.864, n 103 / absent 0.001, n 371)
- presence:superlative: threshold 0.561 [rule: fit; pooled midpoint 0.639 (comparison)] (present 1.013, n 476 / absent 0.266, n 7)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.033, landmark 0.002, superlative 0.100, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 76 of 76)
| axis | accuracy |
|---|---|
| FULL | 0.987 |
| FULL [depth given] | 0.987 |
| FULL [depth and negation given] | 0.987 |
| FULL [presence not decided] | 0.974 |
| FULL [pooled midpoint (comparison)] | 0.987 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence landmark: absent read absent | 1.000 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.026 |
| presence superlative: share of true 'present' readings that abstain | 0.026 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| role object | 1.000 |
| head object | 1.000 |
| lexical order head object | 0.513 |
| lexical bag head object | 0.908 |
| occupancy: known filler | 1.000 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.776 |
| lexical bag head landmark | 0.974 |
| occupancy: not given | 1.000 |
| role superlative | 0.987 |
| head superlative | 0.987 |
| lexical order head superlative | 0.987 |
| lexical bag head superlative | 1.000 |
| heads FULL (model) | 0.987 |
| heads FULL (lexical order baseline) | 0.368 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.882 |
| role object [presence not decided] | 0.987 |
| role landmark [presence not decided] | 1.000 |
| role superlative [presence not decided] | 0.987 |
| heads FULL (model) [presence not decided] | 0.974 |
| role object [pooled midpoint (comparison)] | 1.000 |
| role landmark [pooled midpoint (comparison)] | 1.000 |
| role superlative [pooled midpoint (comparison)] | 0.987 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.987 |
| presence object: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| occupancy: unknown filler | 1.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 1.000 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |

residual mean 0.027; status {'ok': 74, 'abstain': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.605 / 0.501 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 1.000 | 0.540 / 0.465 | 1.00 | 0.000 | 0.000 / 0.000 |
| roles (pooled) | 0.992 | 0.466 / 0.401 | 0.98 | 0.000 | 0.008 / 0.008 |
| role superlative | 0.987 | 0.435 / 0.398 | 0.97 | 0.000 | 0.013 / 0.013 |
| role landmark | 1.000 | 0.442 / 0.396 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 1493)
| axis | accuracy |
|---|---|
| FULL | 1.000 |
| FULL [depth given] | 1.000 |
| FULL [depth and negation given] | 1.000 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence landmark: absent read absent | 1.000 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| role object | 1.000 |
| head object | 1.000 |
| lexical order head object | 0.577 |
| lexical bag head object | 0.933 |
| occupancy: known filler | 1.000 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.747 |
| lexical bag head landmark | 1.000 |
| occupancy: not given | 1.000 |
| role superlative | 1.000 |
| head superlative | 1.000 |
| lexical order head superlative | 0.997 |
| lexical bag head superlative | 1.000 |
| heads FULL (model) | 1.000 |
| heads FULL (lexical order baseline) | 0.430 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.933 |
| presence superlative: absent read absent | 1.000 |
| presence object: absent read absent | 1.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |

residual mean 0.031; status {'ok': 300}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.614 / 0.487 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 1.000 | 0.538 / 0.450 | 1.00 | 0.000 | 0.000 / 0.000 |
| roles (pooled) | 1.000 | 0.471 / 0.404 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 1.000 | 0.447 / 0.401 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark | 1.000 | 0.452 / 0.378 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
SUPER=0.99 c15_on=0.75 c8_what's=0.66 DIR=0.66 VERB=0.58 NAME=0.51 c1_have=0.44 c14_uh=0.42 c26_shape=0.27 QUANT=0.23 c6_both=0.16 c4_then=0.16 c9_an=0.15 c3_rules=0.14 c18_does=0.14 c23_in=0.13 ARROW=0.12 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 POS=0.12 RECENT=0.12 SIZE=0.12 STYLE=0.12 a=0.12 and=0.12 c19_goes=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c24_line=0.12 c25_pixels=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 to=0.12 c10_three=0.12 with=0.08 LAYOUT=0.07 are=0.07 c12_that=0.04 c17_be=0.03 it=0.03 COLOR=0.03 unknown=0.02 c7_i=0.02 c16_new=0.02 SHAPE=0.02 c27_them=0.02 c5_me=0.02 c11_what=0.01 of=0.01 c2_now=0.01 c13_one=0.00 the=0.00

## What is weak, what to add
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.026
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.026
- heldout_formulations: heads FULL (lexical order baseline) 0.368
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.882
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.000
- train (sample): presence object: share of true 'present' readings that abstain 0.000
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): heads FULL (lexical order baseline) 0.430
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `which mostconnected extreme_q SUPER` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role landmark | role superlative |
|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.987 | 0.987 | 1.000 | 1.000 | 0.987 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.987 | 0.987 | 1.000 | 1.000 | 0.987 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.974 | 0.974 | 0.987 | 1.000 | 0.987 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | superlative | product: fitted | 1.000 | — | — | 0.026 (— / 0.026) |
| heldout_formulations | superlative | comparison: pooled midpoint | 1.000 | — | — |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
