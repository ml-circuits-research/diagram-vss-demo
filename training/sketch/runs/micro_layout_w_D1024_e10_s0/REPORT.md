# REPORT — world `layout_w`, legend sha256:946700dd5632… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
812 annotated sentences from 2 files; provenance: {'llm': 812}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_layout_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 39 sentences
- heldout_formulations: 41 sentences
- train: 732 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
5497 tokens in the examples; 600 with no kind in the lexicon (share 0.109), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit f9dc7da. Memory curve: runs/micro_layout_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.461 [rule: fit; pooled midpoint 0.803 (comparison)] (present 1.604, n 718 / absent 0.002, n 387358)
- presence:object: threshold 0.464 [rule: fit; pooled midpoint 0.482 (comparison)] (present 0.735, n 24 / absent 0.229, n 415)
- presence:axis: threshold 0.314 [rule: fit; pooled midpoint 0.588 (comparison)] (present 1.175, n 166 / absent 0.002, n 273)
- presence:layout: threshold 0.416 [rule: fit; pooled midpoint 0.498 (comparison)] (present 0.968, n 247 / absent 0.028, n 192)
- presence:members: threshold 0.582 [rule: fit; pooled midpoint 1.234 (comparison)] (present 2.226, n 304 / absent 0.242, n 135)
- attr_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 25)
- det_presence:object: threshold 0.551 [rule: fit; pooled midpoint 0.497 (comparison)] (present 0.895, n 5 / absent 0.098, n 21)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, axis 0.500, layout 0.250, members 0.001, predicate 0.250

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 41 of 41)
| axis | accuracy |
|---|---|
| FULL | 0.707 |
| FULL [depth given] | 0.707 |
| FULL [depth and negation given] | 0.707 |
| FULL [presence not decided] | 0.293 |
| FULL [pooled midpoint (comparison)] | 0.390 |
| presence object: absent read absent | 1.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence layout: absent read absent | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.037 |
| presence members: share of true 'present' readings that abstain | 0.038 |
| structure (depth, negation) | 0.951 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.878 |
| set members: first gold member in the decoded set | 0.963 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.951 |
| event type (synonym table) | 0.951 |
| role object | 0.951 |
| head object | 0.951 |
| lexical order head object | 0.854 |
| lexical bag head object | 0.854 |
| occupancy: not given | 0.989 |
| role axis | 0.976 |
| head axis | 0.976 |
| lexical order head axis | 0.512 |
| lexical bag head axis | 0.902 |
| occupancy: known filler | 0.915 |
| role layout | 0.976 |
| head layout | 0.976 |
| lexical order head layout | 0.951 |
| lexical bag head layout | 0.976 |
| role members | 0.732 |
| head members | 0.732 |
| lexical order head members | 0.341 |
| lexical bag head members | 0.293 |
| occupancy: unknown filler | 0.963 |
| heads FULL (model) | 0.707 |
| heads FULL (lexical order baseline) | 0.098 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.146 |
| role object [presence not decided] | 0.439 |
| role axis [presence not decided] | 0.976 |
| role layout [presence not decided] | 1.000 |
| role members [presence not decided] | 0.732 |
| heads FULL (model) [presence not decided] | 0.293 |
| role object [pooled midpoint (comparison)] | 0.951 |
| role axis [pooled midpoint (comparison)] | 0.976 |
| role layout [pooled midpoint (comparison)] | 0.878 |
| role members [pooled midpoint (comparison)] | 0.415 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.390 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: present read present [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.545 |
| presence axis: absent read absent | 1.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: absent read absent | 0.923 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.923 |
| presence object: present read present | 0.800 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: present read present [pooled midpoint (comparison)] | 0.800 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |

residual mean 0.204; status {'ok': 38, 'abstain': 1, 'no-sense': 1, 'unknown-event': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.951 | 0.446 / 0.326 | 0.98 | 0.024 | 0.000 / 0.024 |
| role axis | 0.950 | 0.376 / 0.227 | 0.95 | 0.000 | 0.000 / 0.050 |
| roles (pooled) | 0.811 | 0.389 / 0.156 | 0.93 | 0.122 | 0.000 / 0.068 |
| role members | 0.630 | 0.420 / 0.139 | 0.93 | 0.296 | 0.000 / 0.074 |
| role layout | 0.952 | 0.382 / 0.191 | 1.00 | 0.048 | 0.000 / 0.000 |
| role object | 0.667 | 0.316 / 0.000 | 0.67 | 0.000 | 0.000 / 0.333 |

### train (sample) — catalog candidates (n = 300 of 732)
| axis | accuracy |
|---|---|
| FULL | 0.770 |
| FULL [depth given] | 0.770 |
| FULL [depth and negation given] | 0.770 |
| presence object: absent read absent | 1.000 |
| presence axis: absent read absent | 0.989 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.012 |
| presence layout: share of true 'present' readings that abstain | 0.012 |
| presence members: absent read absent | 0.967 |
| structure (depth, negation) | 0.967 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.963 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.967 |
| event type (synonym table) | 0.967 |
| role object | 0.990 |
| head object | 0.990 |
| lexical order head object | 0.943 |
| lexical bag head object | 0.970 |
| occupancy: not given | 0.993 |
| role axis | 0.970 |
| head axis | 0.970 |
| lexical order head axis | 0.623 |
| lexical bag head axis | 0.993 |
| role layout | 0.990 |
| head layout | 0.990 |
| lexical order head layout | 0.957 |
| lexical bag head layout | 0.997 |
| occupancy: known filler | 0.960 |
| role members | 0.790 |
| head members | 0.790 |
| lexical order head members | 0.310 |
| lexical bag head members | 0.307 |
| heads FULL (model) | 0.770 |
| heads FULL (lexical order baseline) | 0.170 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.277 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence layout: absent read absent | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 0.966 |
| occupancy: unknown filler | 0.966 |
| presence object: present read present | 0.824 |
| presence object: share of 'present' readings that abstain | 0.071 |
| presence object: share of true 'present' readings that abstain | 0.071 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.500 |
| presence axis: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.182; status {'ok': 287, 'no-sense': 2, 'unknown-event': 8, 'abstain': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.967 | 0.477 / 0.320 | 0.97 | 0.007 | 0.000 / 0.027 |
| role layout | 0.982 | 0.450 / 0.316 | 0.99 | 0.012 | 0.006 / 0.006 |
| roles (pooled) | 0.855 | 0.459 / 0.289 | 0.98 | 0.125 | 0.004 / 0.020 |
| role axis | 0.938 | 0.427 / 0.274 | 0.96 | 0.027 | 0.000 / 0.035 |
| role members | 0.710 | 0.495 / 0.297 | 0.99 | 0.280 | 0.000 / 0.010 |
| role object | 0.824 | 0.337 / 0.000 | 0.76 | 0.000 | 0.059 / 0.176 |

## Gates (seed 0; OPEN > 0.5)
and=0.96 c27_them=0.86 VERB=0.82 c22_from=0.57 AXIS=0.53 LAYOUT=0.50 c13_one=0.34 c14_uh=0.34 POS=0.20 PAIR=0.17 it=0.14 c12_that=0.14 c3_rules=0.13 COLOR=0.13 NUM=0.12 ARROW=0.12 NOTCOLOR=0.12 RECENT=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 are=0.12 c21_arrowheads=0.12 c25_pixels=0.12 c26_shape=0.12 c8_what's=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c2_now=0.11 c16_new=0.11 c4_then=0.10 c17_be=0.10 SHAPE=0.06 c9_an=0.05 c1_have=0.05 c18_does=0.05 c24_line=0.04 to=0.03 of=0.03 c7_i=0.02 c5_me=0.02 QUANT=0.02 c15_on=0.02 c11_what=0.01 DIR=0.01 c23_in=0.01 c20_arrow=0.01 c6_both=0.01 a=0.01 with=0.01 unknown=0.01 c19_goes=0.01 c10_three=0.01 the=0.01 NAME=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.707
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.037
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.038
- heldout_formulations: set members: exact 0.878
- heldout_formulations: role members 0.732
- heldout_formulations: head members 0.732
- heldout_formulations: heads FULL (model) 0.707
- heldout_formulations: heads FULL (lexical order baseline) 0.098
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.146
- heldout_formulations: FULL [depth given] 0.707
- heldout_formulations: FULL [depth and negation given] 0.707
- heldout_formulations: FULL [presence not decided] 0.293
- heldout_formulations: role object [presence not decided] 0.439
- heldout_formulations: role members [presence not decided] 0.732
- heldout_formulations: heads FULL (model) [presence not decided] 0.293
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.390
- heldout_formulations: role layout [pooled midpoint (comparison)] 0.878
- heldout_formulations: role members [pooled midpoint (comparison)] 0.415
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.390
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.545
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: present read present 0.800
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.800
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- train (sample): FULL 0.770
- train (sample): presence layout: share of 'present' readings that abstain 0.012
- train (sample): presence layout: share of true 'present' readings that abstain 0.012
- train (sample): role members 0.790
- train (sample): head members 0.790
- train (sample): heads FULL (model) 0.770
- train (sample): heads FULL (lexical order baseline) 0.170
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.277
- train (sample): FULL [depth given] 0.770
- train (sample): FULL [depth and negation given] 0.770
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.000
- train (sample): presence members: share of true 'present' readings that abstain 0.000
- train (sample): presence object: present read present 0.824
- train (sample): presence object: share of 'present' readings that abstain 0.071
- train (sample): presence object: share of true 'present' readings that abstain 0.071
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.000
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.500
- train (sample): presence axis: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `distribute c27_them AXIS` FULL 0.000 (n 4)
- heldout_formulations: `NAME , NAME , NAME : three blocks for my routine . drop them arrange LAYOUT` FULL 0.000 (n 1)
- heldout_formulations: `NAME first , then NAME , then NAME on top . i mean LAYOUT them arrange LAYOUT` FULL 0.000 (n 1)
- heldout_formulations: `NAME , NAME , NAME : cars roll through in that order . draw it as a arrange LAYOUT` FULL 0.000 (n 1)
- heldout_formulations: `NAME , NAME , NAME . weekly routine . make them a LAYOUT , a arrange LAYOUT LAYOUT` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role axis | role layout | role members |
|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.707 | 0.707 | 0.951 | 0.976 | 0.976 | 0.732 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.390 | 0.390 | 0.951 | 0.976 | 0.878 | 0.415 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.293 | 0.293 | 0.439 | 0.976 | 1.000 | 0.732 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.800 | 1.000 | 0.900 | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.800 | 1.000 | 0.900 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.923 | 0.962 | 0.037 (0.000 / 0.038) |
| heldout_formulations | members | comparison: pooled midpoint | 0.545 | 0.923 | 0.734 |  |
| train (sample) | object | product: fitted | 0.824 | 1.000 | 0.912 | 0.071 (— / 0.071) |
| train (sample) | axis | product: fitted | 1.000 | 0.989 | 0.995 | 0.000 (0.000 / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.012 (— / 0.012) |
| train (sample) | members | product: fitted | 1.000 | 0.967 | 0.983 | 0.000 (0.000 / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
