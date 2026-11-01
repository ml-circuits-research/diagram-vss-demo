# REPORT — world `superlatives`, legend sha256:e70bd9f04e3d… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1278 annotated sentences from 2 files; provenance: {'llm': 1278}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_superlatives_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 57 sentences
- heldout_formulations: 56 sentences
- train: 1165 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
6679 tokens in the examples; 153 with no kind in the lexicon (share 0.023), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 1bdf306. Memory curve: runs/micro_superlatives_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.568 [rule: fit; pooled midpoint 0.521 (comparison)] (present 0.978, n 160 / absent 0.065, n 297)
- attr_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 163)
- presence:landmark: threshold 0.340 [rule: fit; pooled midpoint 0.445 (comparison)] (present 0.888, n 105 / absent 0.002, n 352)
- presence:superlative: threshold 0.940 [rule: fit; pooled midpoint 0.933 (comparison)] (present 1.016, n 457 / absent 0.850, n 6)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.059, landmark 0.003, superlative 0.100, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 56 of 56)
| axis | accuracy |
|---|---|
| FULL | 0.893 |
| FULL [depth given] | 0.893 |
| FULL [depth and negation given] | 0.893 |
| FULL [presence not decided] | 0.982 |
| FULL [pooled midpoint (comparison)] | 0.929 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence landmark: absent read absent | 1.000 |
| presence superlative: present read present | 0.911 |
| presence superlative: share of 'present' readings that abstain | 0.294 |
| presence superlative: share of true 'present' readings that abstain | 0.294 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| role object | 0.982 |
| head object | 1.000 |
| lexical order head object | 0.554 |
| lexical bag head object | 0.964 |
| occupancy: known filler | 0.942 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.696 |
| lexical bag head landmark | 0.946 |
| occupancy: not given | 1.000 |
| role superlative | 0.911 |
| head superlative | 0.911 |
| lexical order head superlative | 1.000 |
| lexical bag head superlative | 1.000 |
| heads FULL (model) | 0.911 |
| heads FULL (lexical order baseline) | 0.357 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.929 |
| role object [presence not decided] | 0.982 |
| role landmark [presence not decided] | 1.000 |
| role superlative [presence not decided] | 1.000 |
| heads FULL (model) [presence not decided] | 1.000 |
| role object [pooled midpoint (comparison)] | 0.982 |
| role landmark [pooled midpoint (comparison)] | 1.000 |
| role superlative [pooled midpoint (comparison)] | 0.946 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.946 |
| presence object: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.946 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 1.000 |
| occupancy: unknown filler | 1.000 |
| presence object: absent read absent | 1.000 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |

residual mean 0.063; status {'abstain': 15, 'ok': 41}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.597 / 0.476 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 0.960 | 0.387 / 0.318 | 1.00 | 0.040 | 0.000 / 0.000 |
| roles (pooled) | 0.939 | 0.219 / 0.038 | 0.80 | 0.010 | 0.153 / 0.051 |
| role superlative | 0.911 | 0.071 / 0.008 | 0.64 | 0.000 | 0.268 / 0.089 |
| role landmark | 1.000 | 0.460 / 0.416 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 1165)
| axis | accuracy |
|---|---|
| FULL | 0.937 |
| FULL [depth given] | 0.937 |
| FULL [depth and negation given] | 0.937 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence landmark: absent read absent | 1.000 |
| presence superlative: present read present | 0.959 |
| presence superlative: share of 'present' readings that abstain | 0.199 |
| presence superlative: share of true 'present' readings that abstain | 0.199 |
| structure (depth, negation) | 0.980 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.980 |
| event type (synonym table) | 0.980 |
| role object | 0.993 |
| head object | 0.997 |
| lexical order head object | 0.630 |
| lexical bag head object | 0.977 |
| occupancy: known filler | 0.959 |
| role landmark | 0.993 |
| head landmark | 0.993 |
| lexical order head landmark | 0.757 |
| lexical bag head landmark | 0.997 |
| occupancy: not given | 1.000 |
| role superlative | 0.943 |
| head superlative | 0.943 |
| lexical order head superlative | 0.997 |
| lexical bag head superlative | 1.000 |
| heads FULL (model) | 0.940 |
| heads FULL (lexical order baseline) | 0.500 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.973 |
| presence object: absent read absent | 1.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |

residual mean 0.062; status {'ok': 238, 'abstain': 56, 'unknown-event': 6}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.980 | 0.602 / 0.472 | 0.99 | 0.013 | 0.000 / 0.007 |
| role object | 0.982 | 0.399 / 0.288 | 1.00 | 0.018 | 0.000 / 0.000 |
| roles (pooled) | 0.957 | 0.214 / 0.038 | 0.86 | 0.014 | 0.116 / 0.029 |
| role superlative | 0.943 | 0.089 / 0.028 | 0.77 | 0.017 | 0.187 / 0.040 |
| role landmark | 0.973 | 0.446 / 0.408 | 0.97 | 0.000 | 0.000 / 0.027 |

## Gates (seed 0; OPEN > 0.5)
SUPER=0.99 c8_what's=0.65 VERB=0.57 c15_on=0.53 c4_then=0.48 NAME=0.47 DIR=0.46 c9_an=0.37 c26_shape=0.30 c18_does=0.20 c6_both=0.18 c10_three=0.15 c3_rules=0.15 ARROW=0.12 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 POS=0.12 QUANT=0.12 RECENT=0.12 SIZE=0.12 STYLE=0.12 a=0.12 and=0.12 c14_uh=0.12 c19_goes=0.12 c1_have=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c23_in=0.11 COLOR=0.11 with=0.07 LAYOUT=0.06 c22_from=0.06 c12_that=0.06 are=0.05 c17_be=0.05 it=0.05 c16_new=0.05 SHAPE=0.03 c7_i=0.02 c27_them=0.02 c2_now=0.02 to=0.02 c5_me=0.01 c11_what=0.01 of=0.01 unknown=0.01 c13_one=0.00 the=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.893
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.294
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.294
- heldout_formulations: heads FULL (lexical order baseline) 0.357
- heldout_formulations: FULL [depth given] 0.893
- heldout_formulations: FULL [depth and negation given] 0.893
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.000
- train (sample): presence object: share of true 'present' readings that abstain 0.000
- train (sample): presence superlative: share of 'present' readings that abstain 0.199
- train (sample): presence superlative: share of true 'present' readings that abstain 0.199
- train (sample): heads FULL (lexical order baseline) 0.500
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `which is extreme_q SUPER one` FULL 0.000 (n 1)
- heldout_formulations: `which one is extreme_q SUPER right now` FULL 0.000 (n 1)
- heldout_formulations: `which COLOR c26_shape is nearest_q SUPER NAME` FULL 0.000 (n 1)
- heldout_formulations: `which n_block is nearest_q SUPER the NAME` FULL 0.000 (n 1)
- heldout_formulations: `which stop is the extreme_q SUPER mostconnected` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role landmark | role superlative |
|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.911 | 0.893 | 0.982 | 1.000 | 0.911 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.946 | 0.929 | 0.982 | 1.000 | 0.946 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 1.000 | 0.982 | 0.982 | 1.000 | 1.000 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | superlative | product: fitted | 0.911 | — | — | 0.294 (— / 0.294) |
| heldout_formulations | superlative | comparison: pooled midpoint | 0.946 | — | — |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 0.959 | — | — | 0.199 (— / 0.199) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
