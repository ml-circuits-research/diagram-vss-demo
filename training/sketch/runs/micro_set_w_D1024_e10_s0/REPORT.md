# REPORT — world `set_w`, legend sha256:05926c6f2741… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4055 annotated sentences from 2 files; provenance: {'llm': 4055}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_set_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 187 sentences
- heldout_formulations: 186 sentences
- train: 3682 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
20427 tokens in the examples; 785 with no kind in the lexicon (share 0.038), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 68b0656. Memory curve: runs/micro_set_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.102 [rule: fit; pooled midpoint 0.280 (comparison)] (present 0.560, n 10 / absent -0.000, n 1191600)
- presence:object: threshold 0.693 [rule: fit; pooled midpoint 1.542 (comparison)] (present 2.874, n 563 / absent 0.210, n 24)
- attr_presence:object: threshold 0.498 [rule: fit; pooled midpoint 0.627 (comparison)] (present 1.178, n 12 / absent 0.075, n 560)
- det_presence:object: threshold 0.395 [rule: fit; pooled midpoint 0.508 (comparison)] (present 0.976, n 11 / absent 0.039, n 552)
- presence:shape: threshold 0.372 [rule: fit; pooled midpoint 0.626 (comparison)] (present 1.023, n 223 / absent 0.229, n 364)
- presence:color: threshold 0.333 [rule: fit; pooled midpoint 1.528 (comparison)] (present 2.899, n 499 / absent 0.157, n 88)
- presence:size: threshold 0.419 [rule: fit; pooled midpoint 0.627 (comparison)] (present 1.073, n 252 / absent 0.182, n 335)
- presence:members: threshold 0.308 [rule: fit; pooled midpoint 0.590 (comparison)] (present 0.822, n 6 / absent 0.359, n 581)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, members 0.000, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 186 of 186)
| axis | accuracy |
|---|---|
| FULL | 0.860 |
| FULL [depth given] | 0.860 |
| FULL [depth and negation given] | 0.860 |
| FULL [presence not decided] | 0.839 |
| FULL [pooled midpoint (comparison)] | 0.016 |
| presence object: present read present | 0.967 |
| presence object: share of 'present' readings that abstain | 0.020 |
| presence object: share of true 'present' readings that abstain | 0.014 |
| presence shape: absent read absent | 0.981 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.028 |
| presence color: share of true 'present' readings that abstain | 0.028 |
| presence size: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.919 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.984 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.919 |
| event type (synonym table) | 0.919 |
| role object | 0.887 |
| head object | 0.887 |
| lexical order head object | 0.930 |
| lexical bag head object | 0.806 |
| occupancy: unknown filler | 0.887 |
| role shape | 0.968 |
| head shape | 0.968 |
| lexical order head shape | 0.629 |
| lexical bag head shape | 0.914 |
| occupancy: not given | 0.989 |
| role color | 0.941 |
| head color | 0.941 |
| lexical order head color | 0.968 |
| lexical bag head color | 0.968 |
| occupancy: known filler | 0.932 |
| role size | 0.984 |
| head size | 0.984 |
| lexical order head size | 0.575 |
| lexical bag head size | 0.882 |
| role members | 0.968 |
| head members | 0.968 |
| lexical order head members | 0.968 |
| lexical bag head members | 0.968 |
| heads FULL (model) | 0.860 |
| heads FULL (lexical order baseline) | 0.403 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.651 |
| role object [presence not decided] | 0.903 |
| role shape [presence not decided] | 0.973 |
| role color [presence not decided] | 0.935 |
| role size [presence not decided] | 0.984 |
| role members [presence not decided] | 0.941 |
| heads FULL (model) [presence not decided] | 0.839 |
| role object [pooled midpoint (comparison)] | 0.113 |
| role shape [pooled midpoint (comparison)] | 0.962 |
| role color [pooled midpoint (comparison)] | 0.172 |
| role size [pooled midpoint (comparison)] | 0.973 |
| role members [pooled midpoint (comparison)] | 0.968 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.016 |
| presence object: present read present [pooled midpoint (comparison)] | 0.000 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 0.990 |
| presence color: present read present [pooled midpoint (comparison)] | 0.007 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.961 |
| presence shape: present read present | 0.985 |
| presence shape: share of 'present' readings that abstain | 0.015 |
| presence shape: share of true 'present' readings that abstain | 0.015 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.940 |
| presence object: absent read absent | 0.842 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.400 |
| presence members: share of true 'present' readings that abstain | 0.400 |
| set members: first gold member in the decoded set | 0.500 |
| presence members: present read present [pooled midpoint (comparison)] | 0.600 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.333 |
| presence shape: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.135; status {'ok': 163, 'unknown-event': 12, 'abstain': 8, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.919 | 0.486 / 0.420 | 0.96 | 0.043 | 0.000 / 0.038 |
| role object | 0.891 | 0.316 / 0.111 | 0.92 | 0.042 | 0.012 / 0.067 |
| roles (pooled) | 0.911 | 0.405 / 0.190 | 0.94 | 0.044 | 0.013 / 0.044 |
| role color | 0.929 | 0.476 / 0.325 | 0.95 | 0.052 | 0.026 / 0.019 |
| role size | 0.962 | 0.440 / 0.367 | 0.99 | 0.025 | 0.000 / 0.013 |
| role shape | 0.942 | 0.422 / 0.334 | 0.96 | 0.014 | 0.000 / 0.043 |
| role members | 0.000 | 0.354 / 0.014 | 0.50 | 0.500 | 0.000 / 0.500 |

### train (sample) — catalog candidates (n = 300 of 3682)
| axis | accuracy |
|---|---|
| FULL | 0.923 |
| FULL [depth given] | 0.923 |
| FULL [depth and negation given] | 0.923 |
| presence object: present read present | 0.971 |
| presence object: share of 'present' readings that abstain | 0.023 |
| presence object: share of true 'present' readings that abstain | 0.023 |
| presence shape: absent read absent | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.008 |
| presence color: share of true 'present' readings that abstain | 0.008 |
| presence size: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.953 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.953 |
| event type (synonym table) | 0.953 |
| role object | 0.927 |
| head object | 0.927 |
| lexical order head object | 0.970 |
| lexical bag head object | 0.990 |
| occupancy: known filler | 0.955 |
| role shape | 0.993 |
| head shape | 0.993 |
| lexical order head shape | 0.600 |
| lexical bag head shape | 0.963 |
| occupancy: not given | 1.000 |
| role color | 0.960 |
| head color | 0.960 |
| lexical order head color | 0.990 |
| lexical bag head color | 0.990 |
| role size | 0.990 |
| head size | 0.990 |
| lexical order head size | 0.540 |
| lexical bag head size | 0.917 |
| role members | 0.997 |
| head members | 0.997 |
| lexical order head members | 0.983 |
| lexical bag head members | 0.983 |
| heads FULL (model) | 0.923 |
| heads FULL (lexical order baseline) | 0.423 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.877 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.008 |
| presence shape: share of true 'present' readings that abstain | 0.008 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.007 |
| presence size: share of true 'present' readings that abstain | 0.007 |
| presence object: absent read absent | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 1.000 |
| occupancy: unknown filler | 1.000 |

residual mean 0.092; status {'ok': 278, 'abstain': 8, 'unknown-event': 11, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.953 | 0.503 / 0.431 | 0.98 | 0.023 | 0.000 / 0.023 |
| role object | 0.923 | 0.310 / 0.160 | 0.93 | 0.031 | 0.021 / 0.045 |
| roles (pooled) | 0.950 | 0.416 / 0.228 | 0.97 | 0.026 | 0.009 / 0.024 |
| role color | 0.953 | 0.507 / 0.420 | 0.98 | 0.036 | 0.004 / 0.012 |
| role shape | 0.983 | 0.446 / 0.408 | 0.99 | 0.008 | 0.000 / 0.008 |
| role size | 0.978 | 0.448 / 0.394 | 0.99 | 0.007 | 0.000 / 0.014 |
| role members | 0.800 | 0.260 / 0.088 | 1.00 | 0.200 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
COLOR=0.98 SIZE=0.93 c4_then=0.80 DIR=0.76 a=0.75 VERB=0.74 c23_in=0.50 ARROW=0.47 c27_them=0.45 SHAPE=0.45 c12_that=0.39 c6_both=0.39 NAME=0.38 are=0.36 RECENT=0.36 c26_shape=0.33 c10_three=0.30 c5_me=0.30 c3_rules=0.27 c2_now=0.27 c8_what's=0.25 of=0.24 SUPER=0.23 c9_an=0.21 with=0.20 it=0.16 c22_from=0.14 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 POS=0.12 STYLE=0.12 c18_does=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c17_be=0.11 called=0.09 LAYOUT=0.07 QUANT=0.06 c19_goes=0.04 c11_what=0.03 c14_uh=0.02 c1_have=0.02 c16_new=0.01 c15_on=0.01 c13_one=0.01 c7_i=0.00 the=0.00 to=0.00 and=0.00 unknown=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.860
- heldout_formulations: presence object: share of 'present' readings that abstain 0.020
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.014
- heldout_formulations: presence color: share of 'present' readings that abstain 0.028
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.028
- heldout_formulations: role object 0.887
- heldout_formulations: head object 0.887
- heldout_formulations: occupancy: unknown filler 0.887
- heldout_formulations: heads FULL (model) 0.860
- heldout_formulations: heads FULL (lexical order baseline) 0.403
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.651
- heldout_formulations: FULL [depth given] 0.860
- heldout_formulations: FULL [depth and negation given] 0.860
- heldout_formulations: FULL [presence not decided] 0.839
- heldout_formulations: heads FULL (model) [presence not decided] 0.839
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.016
- heldout_formulations: role object [pooled midpoint (comparison)] 0.113
- heldout_formulations: role color [pooled midpoint (comparison)] 0.172
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.016
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.007
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.015
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.015
- heldout_formulations: presence object: absent read absent 0.842
- heldout_formulations: presence members: share of 'present' readings that abstain 0.400
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.400
- heldout_formulations: set members: first gold member in the decoded set 0.500
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.600
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.333
- heldout_formulations: presence shape: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.023
- train (sample): presence object: share of true 'present' readings that abstain 0.023
- train (sample): presence color: share of 'present' readings that abstain 0.008
- train (sample): presence color: share of true 'present' readings that abstain 0.008
- train (sample): heads FULL (lexical order baseline) 0.423
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.877
- train (sample): presence shape: share of 'present' readings that abstain 0.008
- train (sample): presence shape: share of true 'present' readings that abstain 0.008
- train (sample): presence size: share of 'present' readings that abstain 0.007
- train (sample): presence size: share of true 'present' readings that abstain 0.007
- train (sample): presence members: share of 'present' readings that abstain 0.000
- train (sample): presence members: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME COLOR` FULL 0.000 (n 6)
- heldout_formulations: `make c27_them all COLOR` FULL 0.000 (n 2)
- heldout_formulations: `make the COLOR SHAPE a SIZE SHAPE` FULL 0.000 (n 1)
- heldout_formulations: `COLOR` FULL 0.000 (n 1)
- heldout_formulations: `the NAME , being the bad one , make black . hmm , would COLOR be better ? let's say COLOR` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role members |
|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.860 | 0.860 | 0.887 | 0.968 | 0.941 | 0.984 | 0.968 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.016 | 0.016 | 0.113 | 0.962 | 0.172 | 0.973 | 0.968 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.839 | 0.839 | 0.903 | 0.973 | 0.935 | 0.984 | 0.941 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.967 | 0.842 | 0.905 | 0.020 (0.333 / 0.014) |
| heldout_formulations | object | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | shape | product: fitted | 0.985 | 0.981 | 0.983 | 0.015 (0.000 / 0.015) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.940 | 0.990 | 0.965 |  |
| heldout_formulations | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.028 (— / 0.028) |
| heldout_formulations | color | comparison: pooled midpoint | 0.007 | 1.000 | 0.503 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 0.961 | 1.000 | 0.981 |  |
| heldout_formulations | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.400 (— / 0.400) |
| heldout_formulations | members | comparison: pooled midpoint | 0.600 | 1.000 | 0.800 |  |
| train (sample) | object | product: fitted | 0.971 | 1.000 | 0.985 | 0.023 (— / 0.023) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.008 (— / 0.008) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.008 (— / 0.008) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.007 (— / 0.007) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
