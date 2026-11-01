# REPORT — world `layout`, legend sha256:946700dd5632… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
694 annotated sentences from 2 files; provenance: {'llm': 694}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_layout_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 42 sentences
- heldout_formulations: 32 sentences
- train: 620 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
4684 tokens in the examples; 484 with no kind in the lexicon (share 0.103), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 1bdf306. Memory curve: runs/micro_layout_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.590 [rule: fit; pooled midpoint 0.864 (comparison)] (present 1.726, n 783 / absent 0.001, n 361215)
- presence:object: threshold 0.597 [rule: fit; pooled midpoint 0.516 (comparison)] (present 0.802, n 16 / absent 0.231, n 426)
- presence:axis: threshold 0.339 [rule: fit; pooled midpoint 0.539 (comparison)] (present 1.068, n 177 / absent 0.011, n 265)
- presence:layout: threshold 0.488 [rule: fit; pooled midpoint 0.608 (comparison)] (present 1.166, n 193 / absent 0.050, n 249)
- presence:members: threshold 0.624 [rule: fit; pooled midpoint 1.175 (comparison)] (present 2.167, n 329 / absent 0.184, n 113)
- attr_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 16)
- det_presence:object: threshold 0.503 [rule: fit; pooled midpoint 0.530 (comparison)] (present 1.048, n 5 / absent 0.012, n 12)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, axis 0.500, layout 0.250, members 0.001, predicate 0.250

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 32 of 32)
| axis | accuracy |
|---|---|
| FULL | 0.688 |
| FULL [depth given] | 0.688 |
| FULL [depth and negation given] | 0.688 |
| FULL [presence not decided] | 0.219 |
| FULL [pooled midpoint (comparison)] | 0.406 |
| presence object: absent read absent | 1.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence layout: absent read absent | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| structure (depth, negation) | 0.906 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.906 |
| set members: first gold member in the decoded set | 0.909 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.906 |
| event type (synonym table) | 0.906 |
| role object | 0.938 |
| head object | 0.938 |
| lexical order head object | 0.875 |
| lexical bag head object | 0.875 |
| occupancy: not given | 0.986 |
| role axis | 0.969 |
| head axis | 0.969 |
| lexical order head axis | 0.344 |
| lexical bag head axis | 0.844 |
| occupancy: known filler | 0.882 |
| role layout | 0.969 |
| head layout | 0.969 |
| lexical order head layout | 0.719 |
| lexical bag head layout | 0.938 |
| role members | 0.719 |
| head members | 0.719 |
| lexical order head members | 0.312 |
| lexical bag head members | 0.250 |
| occupancy: unknown filler | 0.909 |
| heads FULL (model) | 0.688 |
| heads FULL (lexical order baseline) | 0.031 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.094 |
| role object [presence not decided] | 0.438 |
| role axis [presence not decided] | 0.969 |
| role layout [presence not decided] | 0.969 |
| role members [presence not decided] | 0.719 |
| heads FULL (model) [presence not decided] | 0.219 |
| role object [pooled midpoint (comparison)] | 0.938 |
| role axis [pooled midpoint (comparison)] | 0.969 |
| role layout [pooled midpoint (comparison)] | 0.938 |
| role members [pooled midpoint (comparison)] | 0.438 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.406 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: present read present [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.579 |
| presence object: present read present | 0.667 |
| presence members: absent read absent | 0.889 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: present read present [pooled midpoint (comparison)] | 0.667 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.889 |
| presence axis: absent read absent | 1.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |

residual mean 0.207; status {'ok': 29, 'unknown-event': 2, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.906 | 0.437 / 0.309 | 0.94 | 0.031 | 0.000 / 0.062 |
| role axis | 0.952 | 0.361 / 0.208 | 0.95 | 0.000 | 0.000 / 0.048 |
| roles (pooled) | 0.786 | 0.391 / 0.098 | 0.91 | 0.125 | 0.000 / 0.089 |
| role members | 0.636 | 0.473 / 0.143 | 0.95 | 0.318 | 0.000 / 0.045 |
| role object | 0.500 | 0.195 / 0.000 | 0.50 | 0.000 | 0.000 / 0.500 |
| role layout | 0.889 | 0.350 / 0.186 | 0.89 | 0.000 | 0.000 / 0.111 |

### train (sample) — catalog candidates (n = 300 of 620)
| axis | accuracy |
|---|---|
| FULL | 0.757 |
| FULL [depth given] | 0.757 |
| FULL [depth and negation given] | 0.757 |
| presence object: absent read absent | 1.000 |
| presence axis: absent read absent | 0.994 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.008 |
| presence layout: share of true 'present' readings that abstain | 0.008 |
| presence members: absent read absent | 0.986 |
| structure (depth, negation) | 0.933 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.937 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.933 |
| event type (synonym table) | 0.933 |
| role object | 0.997 |
| head object | 1.000 |
| lexical order head object | 0.960 |
| lexical bag head object | 0.973 |
| occupancy: not given | 0.997 |
| role axis | 0.963 |
| head axis | 0.963 |
| lexical order head axis | 0.590 |
| lexical bag head axis | 0.997 |
| role layout | 0.977 |
| head layout | 0.977 |
| lexical order head layout | 0.563 |
| lexical bag head layout | 0.997 |
| occupancy: known filler | 0.936 |
| role members | 0.777 |
| head members | 0.777 |
| lexical order head members | 0.257 |
| lexical bag head members | 0.250 |
| heads FULL (model) | 0.760 |
| heads FULL (lexical order baseline) | 0.037 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.220 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence layout: absent read absent | 1.000 |
| presence members: present read present | 0.995 |
| presence members: share of 'present' readings that abstain | 0.010 |
| presence members: share of true 'present' readings that abstain | 0.010 |
| set members: first gold member in the decoded set | 0.924 |
| occupancy: unknown filler | 0.924 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.083 |
| presence object: share of true 'present' readings that abstain | 0.083 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence axis: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.224; status {'ok': 276, 'unknown-event': 19, 'abstain': 4, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.933 | 0.455 / 0.265 | 0.97 | 0.040 | 0.000 / 0.027 |
| role layout | 0.947 | 0.438 / 0.303 | 0.98 | 0.046 | 0.008 / 0.008 |
| roles (pooled) | 0.828 | 0.434 / 0.221 | 0.97 | 0.151 | 0.008 / 0.020 |
| role axis | 0.919 | 0.409 / 0.248 | 0.94 | 0.024 | 0.000 / 0.057 |
| role members | 0.704 | 0.454 / 0.177 | 0.98 | 0.287 | 0.009 / 0.009 |
| role object | 0.917 | 0.270 / 0.123 | 0.92 | 0.083 | 0.083 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
and=0.97 c27_them=0.90 LAYOUT=0.79 VERB=0.79 SHAPE=0.57 AXIS=0.50 COLOR=0.38 it=0.35 PAIR=0.33 ARROW=0.31 c14_uh=0.26 c22_from=0.26 c1_have=0.19 a=0.18 unknown=0.17 c17_be=0.13 NOTCOLOR=0.12 RECENT=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 are=0.12 c21_arrowheads=0.12 c25_pixels=0.12 c26_shape=0.12 c8_what's=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c13_one=0.11 c2_now=0.10 c4_then=0.09 c12_that=0.08 c16_new=0.07 c3_rules=0.06 to=0.05 c18_does=0.05 c9_an=0.03 c5_me=0.03 POS=0.03 of=0.02 with=0.01 c7_i=0.01 c15_on=0.01 c19_goes=0.01 c20_arrow=0.01 c10_three=0.01 c24_line=0.01 c6_both=0.01 DIR=0.01 c11_what=0.01 QUANT=0.01 c23_in=0.00 NAME=0.00 the=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.688
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.000
- heldout_formulations: occupancy: known filler 0.882
- heldout_formulations: role members 0.719
- heldout_formulations: head members 0.719
- heldout_formulations: heads FULL (model) 0.688
- heldout_formulations: heads FULL (lexical order baseline) 0.031
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.094
- heldout_formulations: FULL [depth given] 0.688
- heldout_formulations: FULL [depth and negation given] 0.688
- heldout_formulations: FULL [presence not decided] 0.219
- heldout_formulations: role object [presence not decided] 0.438
- heldout_formulations: role members [presence not decided] 0.719
- heldout_formulations: heads FULL (model) [presence not decided] 0.219
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.406
- heldout_formulations: role members [pooled midpoint (comparison)] 0.438
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.406
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.579
- heldout_formulations: presence object: present read present 0.667
- heldout_formulations: presence members: absent read absent 0.889
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence members: absent read absent [pooled midpoint (comparison)] 0.889
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- train (sample): FULL 0.757
- train (sample): presence layout: share of 'present' readings that abstain 0.008
- train (sample): presence layout: share of true 'present' readings that abstain 0.008
- train (sample): role members 0.777
- train (sample): head members 0.777
- train (sample): heads FULL (model) 0.760
- train (sample): heads FULL (lexical order baseline) 0.037
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.220
- train (sample): FULL [depth given] 0.757
- train (sample): FULL [depth and negation given] 0.757
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.010
- train (sample): presence members: share of true 'present' readings that abstain 0.010
- train (sample): presence object: share of 'present' readings that abstain 0.083
- train (sample): presence object: share of true 'present' readings that abstain 0.083
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence axis: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `distribute c27_them AXIS` FULL 0.000 (n 4)
- heldout_formulations: `line all of c27_them up AXIS` FULL 0.000 (n 1)
- heldout_formulations: `distribute c27_them AXIS too` FULL 0.000 (n 1)
- heldout_formulations: `arrange NAME , NAME , NAME arrange circle` FULL 0.000 (n 1)
- heldout_formulations: `distribute AXIS c27_them evenly` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role axis | role layout | role members |
|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.688 | 0.688 | 0.938 | 0.969 | 0.969 | 0.719 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.406 | 0.406 | 0.938 | 0.969 | 0.938 | 0.438 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.219 | 0.219 | 0.438 | 0.969 | 0.969 | 0.719 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.889 | 0.944 | 0.000 (0.000 / 0.000) |
| heldout_formulations | members | comparison: pooled midpoint | 0.579 | 0.889 | 0.734 |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.083 (— / 0.083) |
| train (sample) | axis | product: fitted | 1.000 | 0.994 | 0.997 | 0.000 (0.000 / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.008 (— / 0.008) |
| train (sample) | members | product: fitted | 0.995 | 0.986 | 0.991 | 0.010 (0.000 / 0.010) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
