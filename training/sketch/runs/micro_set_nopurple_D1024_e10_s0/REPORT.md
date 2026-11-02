# REPORT — world `set_nopurple`, legend sha256:05926c6f2741… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
3822 annotated sentences from 2 files; provenance: {'llm': 3822}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_set_nopurple_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 180 sentences
- heldout_formulations: 175 sentences
- train: 3467 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
19357 tokens in the examples; 741 with no kind in the lexicon (share 0.038), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 0cbdcc5. Memory curve: runs/micro_set_nopurple_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.102 [rule: fit; pooled midpoint 0.369 (comparison)] (present 0.738, n 24 / absent -0.000, n 1122856)
- presence:object: threshold 0.740 [rule: fit; pooled midpoint 2.178 (comparison)] (present 4.094, n 550 / absent 0.261, n 30)
- attr_presence:object: threshold 0.575 [rule: fit; pooled midpoint 0.656 (comparison)] (present 1.239, n 12 / absent 0.073, n 548)
- det_presence:object: threshold 0.462 [rule: fit; pooled midpoint 0.663 (comparison)] (present 1.288, n 8 / absent 0.038, n 542)
- presence:shape: threshold 0.434 [rule: fit; pooled midpoint 0.729 (comparison)] (present 1.065, n 218 / absent 0.394, n 362)
- presence:color: threshold 0.425 [rule: fit; pooled midpoint 2.247 (comparison)] (present 4.313, n 485 / absent 0.180, n 95)
- presence:size: threshold 0.327 [rule: fit; pooled midpoint 0.706 (comparison)] (present 1.198, n 255 / absent 0.213, n 325)
- presence:members: threshold 0.237 [rule: fit; pooled midpoint 0.794 (comparison)] (present 1.086, n 13 / absent 0.502, n 567)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.062, color 0.056, size 0.143, members 0.001, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 175)
| axis | accuracy |
|---|---|
| FULL | 0.833 |
| FULL [pooled midpoint (comparison)] | 0.013 |
| presence object: present read present | 0.943 |
| presence object: share of 'present' readings that abstain | 0.025 |
| presence object: share of true 'present' readings that abstain | 0.017 |
| presence shape: absent read absent | 0.976 |
| presence color: present read present | 0.983 |
| presence color: share of 'present' readings that abstain | 0.009 |
| presence color: share of true 'present' readings that abstain | 0.009 |
| presence size: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.920 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.987 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.920 |
| event type (synonym table) | 0.920 |
| role object | 0.873 |
| head object | 0.873 |
| lexical order head object | 0.933 |
| lexical bag head object | 0.813 |
| occupancy: unknown filler | 0.830 |
| role shape | 0.967 |
| head shape | 0.967 |
| lexical order head shape | 0.633 |
| lexical bag head shape | 0.967 |
| occupancy: not given | 0.989 |
| role color | 0.927 |
| head color | 0.927 |
| lexical order head color | 0.973 |
| lexical bag head color | 0.967 |
| occupancy: known filler | 0.925 |
| role size | 0.980 |
| head size | 0.980 |
| lexical order head size | 0.573 |
| lexical bag head size | 0.900 |
| role members | 0.967 |
| head members | 0.967 |
| lexical order head members | 0.960 |
| lexical bag head members | 0.960 |
| heads FULL (model) | 0.833 |
| heads FULL (lexical order baseline) | 0.407 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.660 |
| role object [pooled midpoint (comparison)] | 0.113 |
| role shape [pooled midpoint (comparison)] | 0.953 |
| role color [pooled midpoint (comparison)] | 0.153 |
| role size [pooled midpoint (comparison)] | 0.973 |
| role members [pooled midpoint (comparison)] | 0.960 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.013 |
| presence object: present read present [pooled midpoint (comparison)] | 0.000 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 0.988 |
| presence color: present read present [pooled midpoint (comparison)] | 0.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.968 |
| presence shape: present read present | 0.981 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.925 |
| presence object: absent read absent | 0.867 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.400 |
| presence members: share of true 'present' readings that abstain | 0.400 |
| set members: first gold member in the decoded set | 0.667 |
| presence members: present read present [pooled midpoint (comparison)] | 0.600 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.500 |
| presence shape: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.144; status {'ok': 133, 'unknown-event': 10, 'abstain': 5, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.920 | 0.487 / 0.415 | 0.95 | 0.033 | 0.000 / 0.047 |
| role object | 0.872 | 0.261 / 0.057 | 0.90 | 0.045 | 0.015 / 0.083 |
| roles (pooled) | 0.899 | 0.381 / 0.146 | 0.94 | 0.052 | 0.010 / 0.049 |
| role color | 0.913 | 0.458 / 0.215 | 0.96 | 0.055 | 0.008 / 0.031 |
| role size | 0.953 | 0.451 / 0.388 | 0.98 | 0.031 | 0.000 / 0.016 |
| role shape | 0.945 | 0.412 / 0.301 | 0.96 | 0.018 | 0.000 / 0.036 |
| role members | 0.167 | 0.351 / 0.017 | 0.67 | 0.667 | 0.167 / 0.167 |

### train (sample) — catalog candidates (n = 150 of 3467)
| axis | accuracy |
|---|---|
| FULL | 0.867 |
| presence object: present read present | 0.955 |
| presence object: share of 'present' readings that abstain | 0.023 |
| presence object: share of true 'present' readings that abstain | 0.016 |
| presence shape: absent read absent | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.016 |
| presence color: share of true 'present' readings that abstain | 0.016 |
| presence size: absent read absent | 1.000 |
| presence members: absent read absent | 0.993 |
| structure (depth, negation) | 0.947 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.993 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.947 |
| event type (synonym table) | 0.947 |
| role object | 0.907 |
| head object | 0.907 |
| lexical order head object | 0.947 |
| lexical bag head object | 0.973 |
| occupancy: known filler | 0.942 |
| role shape | 0.987 |
| head shape | 0.987 |
| lexical order head shape | 0.607 |
| lexical bag head shape | 0.993 |
| occupancy: not given | 0.994 |
| role color | 0.953 |
| head color | 0.953 |
| lexical order head color | 0.973 |
| lexical bag head color | 0.987 |
| role size | 0.993 |
| head size | 0.993 |
| lexical order head size | 0.553 |
| lexical bag head size | 0.920 |
| role members | 0.960 |
| head members | 0.960 |
| lexical order head members | 0.953 |
| lexical bag head members | 0.953 |
| heads FULL (model) | 0.867 |
| heads FULL (lexical order baseline) | 0.413 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.860 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.018 |
| presence shape: share of true 'present' readings that abstain | 0.018 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 0.875 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 1.000 |
| occupancy: unknown filler | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.089; status {'ok': 136, 'abstain': 6, 'no-sense': 2, 'unknown-event': 6}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.947 | 0.496 / 0.432 | 0.98 | 0.033 | 0.000 / 0.020 |
| role object | 0.908 | 0.274 / 0.110 | 0.93 | 0.035 | 0.014 / 0.057 |
| roles (pooled) | 0.931 | 0.402 / 0.182 | 0.96 | 0.042 | 0.012 / 0.027 |
| role color | 0.946 | 0.489 / 0.390 | 0.98 | 0.047 | 0.016 / 0.008 |
| role shape | 0.966 | 0.439 / 0.407 | 0.97 | 0.017 | 0.017 / 0.017 |
| role size | 0.985 | 0.459 / 0.418 | 0.99 | 0.000 | 0.000 / 0.015 |
| role members | 0.286 | 0.535 / 0.093 | 1.00 | 0.714 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
COLOR=0.92 SIZE=0.85 VERB=0.81 c4_then=0.80 DIR=0.62 SHAPE=0.60 of=0.60 ARROW=0.54 a=0.50 c12_that=0.41 NAME=0.39 c26_shape=0.39 c23_in=0.37 are=0.35 c6_both=0.34 c5_me=0.33 c22_from=0.32 RECENT=0.31 c10_three=0.27 c8_what's=0.27 SUPER=0.27 it=0.21 c2_now=0.21 c9_an=0.21 with=0.19 c27_them=0.17 c3_rules=0.15 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 POS=0.12 STYLE=0.12 c18_does=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c1_have=0.12 c16_new=0.11 LAYOUT=0.11 called=0.11 c19_goes=0.10 c17_be=0.09 QUANT=0.06 c11_what=0.03 c15_on=0.00 c7_i=0.00 c13_one=0.00 c14_uh=0.00 to=0.00 the=0.00 and=0.00 unknown=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.833
- heldout_formulations: presence object: share of 'present' readings that abstain 0.025
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.017
- heldout_formulations: presence color: share of 'present' readings that abstain 0.009
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.009
- heldout_formulations: role object 0.873
- heldout_formulations: head object 0.873
- heldout_formulations: occupancy: unknown filler 0.830
- heldout_formulations: heads FULL (model) 0.833
- heldout_formulations: heads FULL (lexical order baseline) 0.407
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.660
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.013
- heldout_formulations: role object [pooled midpoint (comparison)] 0.113
- heldout_formulations: role color [pooled midpoint (comparison)] 0.153
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.013
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: absent read absent 0.867
- heldout_formulations: presence members: share of 'present' readings that abstain 0.400
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.400
- heldout_formulations: set members: first gold member in the decoded set 0.667
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.600
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.500
- heldout_formulations: presence shape: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.867
- train (sample): presence object: share of 'present' readings that abstain 0.023
- train (sample): presence object: share of true 'present' readings that abstain 0.016
- train (sample): presence color: share of 'present' readings that abstain 0.016
- train (sample): presence color: share of true 'present' readings that abstain 0.016
- train (sample): heads FULL (model) 0.867
- train (sample): heads FULL (lexical order baseline) 0.413
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.860
- train (sample): presence shape: share of 'present' readings that abstain 0.018
- train (sample): presence shape: share of true 'present' readings that abstain 0.018
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence object: absent read absent 0.875
- train (sample): presence members: share of 'present' readings that abstain 0.000
- train (sample): presence members: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME COLOR` FULL 0.000 (n 5)
- heldout_formulations: `make c27_them all COLOR` FULL 0.000 (n 2)
- heldout_formulations: `the NAME make a SIZE COLOR SHAPE` FULL 0.000 (n 1)
- heldout_formulations: `COLOR` FULL 0.000 (n 1)
- heldout_formulations: `mak it a COLOR SHAPE , a large one , actualy a make SIZE one` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role members |
|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.833 | 0.833 | 0.873 | 0.967 | 0.927 | 0.980 | 0.967 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.013 | 0.013 | 0.113 | 0.953 | 0.153 | 0.973 | 0.960 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.943 | 0.867 | 0.905 | 0.025 (0.500 / 0.017) |
| heldout_formulations | object | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | shape | product: fitted | 0.981 | 0.976 | 0.979 | 0.000 (0.000 / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.925 | 0.988 | 0.956 |  |
| heldout_formulations | color | product: fitted | 0.983 | 1.000 | 0.992 | 0.009 (— / 0.009) |
| heldout_formulations | color | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 0.968 | 1.000 | 0.984 |  |
| heldout_formulations | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.400 (— / 0.400) |
| heldout_formulations | members | comparison: pooled midpoint | 0.600 | 1.000 | 0.800 |  |
| train (sample) | object | product: fitted | 0.955 | 0.875 | 0.915 | 0.023 (1.000 / 0.016) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.018 (— / 0.018) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.016 (— / 0.016) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.993 | 0.996 | 0.000 (0.000 / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
