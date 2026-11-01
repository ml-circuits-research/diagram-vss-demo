# REPORT — world `set_s`, legend sha256:05926c6f2741… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4188 annotated sentences from 2 files; provenance: {'llm': 4188}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_set_s_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 188 sentences
- heldout_formulations: 199 sentences
- train: 3801 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
21070 tokens in the examples; 814 with no kind in the lexicon (share 0.039), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 8ae4c3e. Memory curve: runs/micro_set_s_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.080 [rule: fit; pooled midpoint 2.608 (comparison)] (present 5.215, n 13 / absent 0.000, n 1219499)
- presence:object: threshold 0.740 [rule: fit; pooled midpoint 4.057 (comparison)] (present 7.320, n 565 / absent 0.795, n 23)
- attr_presence:object: threshold 0.441 [rule: fit; pooled midpoint 0.703 (comparison)] (present 1.336, n 13 / absent 0.071, n 562)
- det_presence:object: threshold 0.394 [rule: fit; pooled midpoint 0.459 (comparison)] (present 0.879, n 14 / absent 0.039, n 551)
- presence:shape: threshold 0.728 [rule: fit; pooled midpoint 1.355 (comparison)] (present 2.106, n 215 / absent 0.603, n 373)
- presence:color: threshold 0.443 [rule: fit; pooled midpoint 4.041 (comparison)] (present 7.801, n 480 / absent 0.281, n 108)
- presence:size: threshold 0.745 [rule: fit; pooled midpoint 1.753 (comparison)] (present 3.060, n 249 / absent 0.445, n 339)
- presence:members: threshold 0.432 [rule: fit; pooled midpoint 4.444 (comparison)] (present 8.034, n 8 / absent 0.854, n 580)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, members 0.000, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 199 of 199)
| axis | accuracy |
|---|---|
| FULL | 0.648 |
| FULL [depth given] | 0.648 |
| FULL [depth and negation given] | 0.648 |
| FULL [presence not decided] | 0.668 |
| FULL [pooled midpoint (comparison)] | 0.005 |
| presence object: present read present | 0.949 |
| presence object: share of 'present' readings that abstain | 0.015 |
| presence object: share of true 'present' readings that abstain | 0.016 |
| presence shape: absent read absent | 0.988 |
| presence color: present read present | 0.992 |
| presence color: share of 'present' readings that abstain | 0.024 |
| presence color: share of true 'present' readings that abstain | 0.024 |
| presence size: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.744 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.995 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.744 |
| event type (synonym table) | 0.744 |
| role object | 0.724 |
| head object | 0.724 |
| lexical order head object | 0.925 |
| lexical bag head object | 0.794 |
| occupancy: unknown filler | 0.701 |
| role shape | 0.930 |
| head shape | 0.930 |
| lexical order head shape | 0.638 |
| lexical bag head shape | 0.960 |
| occupancy: not given | 0.992 |
| role color | 0.789 |
| head color | 0.789 |
| lexical order head color | 0.965 |
| lexical bag head color | 0.965 |
| occupancy: known filler | 0.754 |
| role size | 0.894 |
| head size | 0.894 |
| lexical order head size | 0.568 |
| lexical bag head size | 0.889 |
| role members | 0.980 |
| head members | 0.980 |
| lexical order head members | 0.970 |
| lexical bag head members | 0.970 |
| heads FULL (model) | 0.648 |
| heads FULL (lexical order baseline) | 0.397 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.653 |
| role object [presence not decided] | 0.749 |
| role shape [presence not decided] | 0.950 |
| role color [presence not decided] | 0.789 |
| role size [presence not decided] | 0.935 |
| role members [presence not decided] | 0.950 |
| heads FULL (model) [presence not decided] | 0.668 |
| role object [pooled midpoint (comparison)] | 0.090 |
| role shape [pooled midpoint (comparison)] | 0.638 |
| role color [pooled midpoint (comparison)] | 0.171 |
| role size [pooled midpoint (comparison)] | 0.573 |
| role members [pooled midpoint (comparison)] | 0.970 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.005 |
| presence object: present read present [pooled midpoint (comparison)] | 0.000 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 0.890 |
| presence size: share of 'present' readings that abstain | 0.031 |
| presence size: share of true 'present' readings that abstain | 0.031 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.014 |
| presence shape: present read present | 0.937 |
| presence shape: share of 'present' readings that abstain | 0.017 |
| presence shape: share of true 'present' readings that abstain | 0.017 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.400 |
| presence object: absent read absent | 0.750 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.400 |
| presence members: share of true 'present' readings that abstain | 0.400 |
| set members: first gold member in the decoded set | 0.833 |
| presence members: present read present [pooled midpoint (comparison)] | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence shape: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.326; status {'ok': 140, 'unknown-event': 48, 'abstain': 8, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.744 | 0.400 / 0.049 | 0.89 | 0.146 | 0.000 / 0.111 |
| role object | 0.713 | 0.347 / 0.077 | 0.91 | 0.204 | 0.011 / 0.083 |
| roles (pooled) | 0.741 | 0.369 / 0.093 | 0.91 | 0.192 | 0.020 / 0.067 |
| role color | 0.745 | 0.491 / 0.292 | 0.96 | 0.236 | 0.018 / 0.018 |
| role size | 0.756 | 0.260 / 0.000 | 0.86 | 0.128 | 0.023 / 0.116 |
| role shape | 0.819 | 0.273 / 0.082 | 0.92 | 0.111 | 0.014 / 0.069 |
| role members | 0.333 | 0.357 / 0.018 | 0.50 | 0.500 | 0.333 / 0.167 |

### train (sample) — catalog candidates (n = 300 of 3801)
| axis | accuracy |
|---|---|
| FULL | 0.740 |
| FULL [depth given] | 0.740 |
| FULL [depth and negation given] | 0.740 |
| presence object: present read present | 0.973 |
| presence object: share of 'present' readings that abstain | 0.005 |
| presence object: share of true 'present' readings that abstain | 0.005 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 0.967 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.777 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.990 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.777 |
| event type (synonym table) | 0.777 |
| role object | 0.780 |
| head object | 0.780 |
| lexical order head object | 0.963 |
| lexical bag head object | 0.983 |
| occupancy: known filler | 0.805 |
| role shape | 0.950 |
| head shape | 0.950 |
| lexical order head shape | 0.603 |
| lexical bag head shape | 0.993 |
| occupancy: not given | 0.997 |
| role color | 0.807 |
| head color | 0.807 |
| lexical order head color | 0.990 |
| lexical bag head color | 0.983 |
| role size | 0.943 |
| head size | 0.943 |
| lexical order head size | 0.547 |
| lexical bag head size | 0.907 |
| role members | 0.987 |
| head members | 0.987 |
| lexical order head members | 0.977 |
| lexical bag head members | 0.977 |
| heads FULL (model) | 0.740 |
| heads FULL (lexical order baseline) | 0.403 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.870 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence size: absent read absent | 1.000 |
| presence shape: present read present | 0.990 |
| presence shape: share of 'present' readings that abstain | 0.048 |
| presence shape: share of true 'present' readings that abstain | 0.048 |
| presence object: absent read absent | 0.833 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.250 |
| presence members: share of true 'present' readings that abstain | 0.250 |
| set members: first gold member in the decoded set | 0.571 |
| occupancy: unknown filler | 0.571 |
| determiner identity (outside FULL when the legend excludes it) | 0.333 |

residual mean 0.254; status {'ok': 226, 'unknown-event': 65, 'abstain': 7, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.777 | 0.408 / 0.038 | 0.88 | 0.107 | 0.000 / 0.117 |
| role object | 0.771 | 0.351 / 0.157 | 0.95 | 0.183 | 0.004 / 0.047 |
| roles (pooled) | 0.800 | 0.378 / 0.158 | 0.95 | 0.163 | 0.009 / 0.037 |
| role size | 0.875 | 0.268 / 0.122 | 0.95 | 0.074 | 0.000 / 0.051 |
| role color | 0.767 | 0.514 / 0.407 | 0.97 | 0.205 | 0.000 / 0.028 |
| role shape | 0.874 | 0.294 / 0.156 | 0.94 | 0.109 | 0.042 / 0.017 |
| role members | 0.429 | 0.223 / 0.056 | 0.86 | 0.571 | 0.143 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
COLOR=1.00 SIZE=0.99 a=0.92 c4_then=0.87 c23_in=0.80 c6_both=0.79 are=0.76 QUANT=0.74 DIR=0.71 c27_them=0.69 NAME=0.55 it=0.51 the=0.44 SHAPE=0.44 ARROW=0.43 PAIR=0.40 c17_be=0.39 SUPER=0.35 c12_that=0.31 c18_does=0.28 RECENT=0.27 c5_me=0.23 c14_uh=0.22 c26_shape=0.22 with=0.21 c9_an=0.19 c3_rules=0.18 c22_from=0.15 c8_what's=0.15 AXIS=0.12 NOTCOLOR=0.12 POS=0.12 STYLE=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 of=0.11 c10_three=0.07 LAYOUT=0.06 called=0.05 c13_one=0.04 c2_now=0.04 VERB=0.02 c19_goes=0.02 c11_what=0.01 c16_new=0.00 c15_on=0.00 c1_have=0.00 to=0.00 and=0.00 c7_i=0.00 unknown=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.648
- heldout_formulations: presence object: share of 'present' readings that abstain 0.015
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.016
- heldout_formulations: presence color: share of 'present' readings that abstain 0.024
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.024
- heldout_formulations: structure (depth, negation) 0.744
- heldout_formulations: predicate (surface lemma) 0.744
- heldout_formulations: event type (synonym table) 0.744
- heldout_formulations: role object 0.724
- heldout_formulations: head object 0.724
- heldout_formulations: occupancy: unknown filler 0.701
- heldout_formulations: role color 0.789
- heldout_formulations: head color 0.789
- heldout_formulations: occupancy: known filler 0.754
- heldout_formulations: role size 0.894
- heldout_formulations: head size 0.894
- heldout_formulations: heads FULL (model) 0.648
- heldout_formulations: heads FULL (lexical order baseline) 0.397
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.653
- heldout_formulations: FULL [depth given] 0.648
- heldout_formulations: FULL [depth and negation given] 0.648
- heldout_formulations: FULL [presence not decided] 0.668
- heldout_formulations: role object [presence not decided] 0.749
- heldout_formulations: role color [presence not decided] 0.789
- heldout_formulations: heads FULL (model) [presence not decided] 0.668
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.005
- heldout_formulations: role object [pooled midpoint (comparison)] 0.090
- heldout_formulations: role shape [pooled midpoint (comparison)] 0.638
- heldout_formulations: role color [pooled midpoint (comparison)] 0.171
- heldout_formulations: role size [pooled midpoint (comparison)] 0.573
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.005
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence size: present read present 0.890
- heldout_formulations: presence size: share of 'present' readings that abstain 0.031
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.031
- heldout_formulations: presence size: present read present [pooled midpoint (comparison)] 0.014
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.017
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.017
- heldout_formulations: presence shape: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.400
- heldout_formulations: presence object: absent read absent 0.750
- heldout_formulations: presence members: share of 'present' readings that abstain 0.400
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.400
- heldout_formulations: set members: first gold member in the decoded set 0.833
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.740
- train (sample): presence object: share of 'present' readings that abstain 0.005
- train (sample): presence object: share of true 'present' readings that abstain 0.005
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): structure (depth, negation) 0.777
- train (sample): predicate (surface lemma) 0.777
- train (sample): event type (synonym table) 0.777
- train (sample): role object 0.780
- train (sample): head object 0.780
- train (sample): occupancy: known filler 0.805
- train (sample): role color 0.807
- train (sample): head color 0.807
- train (sample): heads FULL (model) 0.740
- train (sample): heads FULL (lexical order baseline) 0.403
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.870
- train (sample): FULL [depth given] 0.740
- train (sample): FULL [depth and negation given] 0.740
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): presence shape: share of 'present' readings that abstain 0.048
- train (sample): presence shape: share of true 'present' readings that abstain 0.048
- train (sample): presence object: absent read absent 0.833
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.250
- train (sample): presence members: share of true 'present' readings that abstain 0.250
- train (sample): set members: first gold member in the decoded set 0.571
- train (sample): occupancy: unknown filler 0.571
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.333

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME COLOR` FULL 0.000 (n 12)
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 10)
- heldout_formulations: `make c27_them all COLOR` FULL 0.000 (n 2)
- heldout_formulations: `both SIZE and COLOR` FULL 0.000 (n 1)
- heldout_formulations: `i make NAME SIZE and COLOR` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role members |
|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.648 | 0.648 | 0.724 | 0.930 | 0.789 | 0.894 | 0.980 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.005 | 0.005 | 0.090 | 0.638 | 0.171 | 0.573 | 0.970 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.668 | 0.668 | 0.749 | 0.950 | 0.789 | 0.935 | 0.950 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.949 | 0.750 | 0.849 | 0.015 (0.000 / 0.016) |
| heldout_formulations | object | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | shape | product: fitted | 0.937 | 0.988 | 0.962 | 0.017 (0.000 / 0.017) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | color | product: fitted | 0.992 | 1.000 | 0.996 | 0.024 (— / 0.024) |
| heldout_formulations | color | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | size | product: fitted | 0.890 | 1.000 | 0.945 | 0.031 (— / 0.031) |
| heldout_formulations | size | comparison: pooled midpoint | 0.014 | 1.000 | 0.507 |  |
| heldout_formulations | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.400 (— / 0.400) |
| heldout_formulations | members | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| train (sample) | object | product: fitted | 0.973 | 0.833 | 0.903 | 0.005 (0.000 / 0.005) |
| train (sample) | shape | product: fitted | 0.990 | 1.000 | 0.995 | 0.048 (— / 0.048) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | size | product: fitted | 0.967 | 1.000 | 0.984 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.250 (— / 0.250) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
