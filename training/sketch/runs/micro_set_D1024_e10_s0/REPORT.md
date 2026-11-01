# REPORT — world `set`, legend sha256:05926c6f2741… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
3142 annotated sentences from 2 files; provenance: {'llm': 3142}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_set_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 137 sentences
- heldout_formulations: 151 sentences
- train: 2854 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
15748 tokens in the examples; 581 with no kind in the lexicon (share 0.037), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 25499d8. Memory curve: runs/micro_set_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.124 [rule: fit; pooled midpoint 0.492 (comparison)] (present 0.984, n 17 / absent 0.000, n 918790)
- presence:object: threshold 0.866 [rule: fit; pooled midpoint 0.828 (comparison)] (present 1.163, n 510 / absent 0.494, n 27)
- attr_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 509)
- det_presence:object: threshold 0.446 [rule: fit; pooled midpoint 0.490 (comparison)] (present 0.945, n 11 / absent 0.036, n 499)
- presence:shape: threshold 0.505 [rule: fit; pooled midpoint 0.561 (comparison)] (present 1.030, n 176 / absent 0.093, n 361)
- presence:color: threshold 0.337 [rule: fit; pooled midpoint 0.674 (comparison)] (present 1.252, n 451 / absent 0.096, n 86)
- presence:size: threshold 0.478 [rule: fit; pooled midpoint 0.567 (comparison)] (present 1.069, n 214 / absent 0.065, n 323)
- presence:members: threshold 0.731 [rule: fit; pooled midpoint 0.776 (comparison)] (present 1.380, n 10 / absent 0.172, n 527)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.062, color 0.056, size 0.143, members 0.001, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 151 of 151)
| axis | accuracy |
|---|---|
| FULL | 0.682 |
| FULL [depth given] | 0.682 |
| FULL [depth and negation given] | 0.682 |
| FULL [presence not decided] | 0.702 |
| FULL [pooled midpoint (comparison)] | 0.675 |
| presence object: present read present | 0.934 |
| presence object: share of 'present' readings that abstain | 0.059 |
| presence object: share of true 'present' readings that abstain | 0.030 |
| presence shape: absent read absent | 0.971 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.011 |
| presence color: share of true 'present' readings that abstain | 0.011 |
| presence size: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.762 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.993 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.762 |
| event type (synonym table) | 0.762 |
| role object | 0.722 |
| head object | 0.722 |
| lexical order head object | 0.921 |
| lexical bag head object | 0.795 |
| occupancy: unknown filler | 0.763 |
| role shape | 0.954 |
| head shape | 0.954 |
| lexical order head shape | 0.656 |
| lexical bag head shape | 0.967 |
| occupancy: not given | 0.987 |
| role color | 0.788 |
| head color | 0.788 |
| lexical order head color | 0.974 |
| lexical bag head color | 0.987 |
| occupancy: known filler | 0.792 |
| role size | 0.974 |
| head size | 0.974 |
| lexical order head size | 0.603 |
| lexical bag head size | 0.894 |
| role members | 0.980 |
| head members | 0.980 |
| lexical order head members | 0.967 |
| lexical bag head members | 0.967 |
| heads FULL (model) | 0.682 |
| heads FULL (lexical order baseline) | 0.424 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.649 |
| role object [presence not decided] | 0.775 |
| role shape [presence not decided] | 0.954 |
| role color [presence not decided] | 0.788 |
| role size [presence not decided] | 0.974 |
| role members [presence not decided] | 0.960 |
| heads FULL (model) [presence not decided] | 0.702 |
| role object [pooled midpoint (comparison)] | 0.728 |
| role shape [pooled midpoint (comparison)] | 0.947 |
| role color [pooled midpoint (comparison)] | 0.775 |
| role size [pooled midpoint (comparison)] | 0.974 |
| role members [pooled midpoint (comparison)] | 0.967 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.675 |
| presence object: present read present [pooled midpoint (comparison)] | 0.943 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 0.971 |
| presence color: present read present [pooled midpoint (comparison)] | 0.979 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.020 |
| presence shape: share of true 'present' readings that abstain | 0.021 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.979 |
| determiner identity (outside FULL when the legend excludes it) | 0.667 |
| presence object: absent read absent | 0.667 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.500 |
| presence members: share of true 'present' readings that abstain | 0.500 |
| set members: first gold member in the decoded set | 0.800 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.667 |
| presence members: present read present [pooled midpoint (comparison)] | 0.750 |
| presence object: share of FALSE 'present' readings that abstain | 1.000 |
| presence shape: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.297; status {'ok': 107, 'unknown-event': 33, 'abstain': 8, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.762 | 0.415 / 0.033 | 0.85 | 0.093 | 0.000 / 0.146 |
| role object | 0.717 | 0.236 / 0.053 | 0.90 | 0.203 | 0.022 / 0.080 |
| roles (pooled) | 0.782 | 0.383 / 0.101 | 0.95 | 0.186 | 0.018 / 0.031 |
| role color | 0.746 | 0.509 / 0.376 | 0.99 | 0.254 | 0.008 / 0.000 |
| role size | 0.933 | 0.447 / 0.353 | 1.00 | 0.067 | 0.000 / 0.000 |
| role shape | 0.904 | 0.405 / 0.321 | 0.96 | 0.077 | 0.019 / 0.019 |
| role members | 0.400 | 0.267 / 0.031 | 0.60 | 0.600 | 0.400 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 2854)
| axis | accuracy |
|---|---|
| FULL | 0.780 |
| FULL [depth given] | 0.780 |
| FULL [depth and negation given] | 0.780 |
| presence object: present read present | 0.991 |
| presence object: share of 'present' readings that abstain | 0.013 |
| presence object: share of true 'present' readings that abstain | 0.013 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.790 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.997 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.790 |
| event type (synonym table) | 0.790 |
| role object | 0.797 |
| head object | 0.797 |
| lexical order head object | 0.973 |
| lexical bag head object | 0.993 |
| occupancy: known filler | 0.825 |
| role shape | 0.947 |
| head shape | 0.947 |
| lexical order head shape | 0.573 |
| lexical bag head shape | 0.997 |
| occupancy: not given | 1.000 |
| role color | 0.823 |
| head color | 0.823 |
| lexical order head color | 0.987 |
| lexical bag head color | 0.987 |
| role size | 0.960 |
| head size | 0.960 |
| lexical order head size | 0.540 |
| lexical bag head size | 0.923 |
| role members | 0.993 |
| head members | 0.993 |
| lexical order head members | 0.977 |
| lexical bag head members | 0.977 |
| heads FULL (model) | 0.780 |
| heads FULL (lexical order baseline) | 0.423 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.890 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.009 |
| presence shape: share of true 'present' readings that abstain | 0.009 |
| presence size: absent read absent | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.005 |
| presence color: share of true 'present' readings that abstain | 0.005 |
| determiner identity (outside FULL when the legend excludes it) | 0.714 |
| presence object: absent read absent | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 0.857 |
| occupancy: unknown filler | 0.857 |

residual mean 0.229; status {'ok': 232, 'unknown-event': 61, 'abstain': 5, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.790 | 0.413 / 0.038 | 0.87 | 0.080 | 0.000 / 0.130 |
| role object | 0.788 | 0.244 / 0.090 | 0.98 | 0.198 | 0.010 / 0.014 |
| roles (pooled) | 0.823 | 0.406 / 0.123 | 0.99 | 0.170 | 0.005 / 0.007 |
| role size | 0.913 | 0.460 / 0.417 | 0.99 | 0.080 | 0.000 / 0.007 |
| role shape | 0.875 | 0.456 / 0.417 | 0.99 | 0.117 | 0.000 / 0.008 |
| role color | 0.791 | 0.539 / 0.426 | 1.00 | 0.209 | 0.004 / 0.000 |
| role members | 0.714 | 0.242 / 0.083 | 1.00 | 0.286 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
COLOR=1.00 SIZE=0.95 c4_then=0.74 it=0.73 c6_both=0.72 SHAPE=0.65 NAME=0.62 c27_them=0.56 DIR=0.56 QUANT=0.55 c12_that=0.52 a=0.50 the=0.46 c23_in=0.42 SUPER=0.38 c19_goes=0.38 with=0.36 are=0.33 c10_three=0.30 c17_be=0.30 c9_an=0.24 c18_does=0.23 c13_one=0.23 c14_uh=0.21 c15_on=0.17 c22_from=0.16 ARROW=0.12 AXIS=0.12 LAYOUT=0.12 NOTCOLOR=0.12 PAIR=0.12 POS=0.12 STYLE=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 c8_what's=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c3_rules=0.12 c2_now=0.08 c26_shape=0.05 c5_me=0.04 of=0.02 c11_what=0.02 c16_new=0.01 VERB=0.01 c1_have=0.01 RECENT=0.00 c7_i=0.00 to=0.00 and=0.00 unknown=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.682
- heldout_formulations: presence object: share of 'present' readings that abstain 0.059
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.030
- heldout_formulations: presence color: share of 'present' readings that abstain 0.011
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.011
- heldout_formulations: structure (depth, negation) 0.762
- heldout_formulations: predicate (surface lemma) 0.762
- heldout_formulations: event type (synonym table) 0.762
- heldout_formulations: role object 0.722
- heldout_formulations: head object 0.722
- heldout_formulations: occupancy: unknown filler 0.763
- heldout_formulations: role color 0.788
- heldout_formulations: head color 0.788
- heldout_formulations: occupancy: known filler 0.792
- heldout_formulations: heads FULL (model) 0.682
- heldout_formulations: heads FULL (lexical order baseline) 0.424
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.649
- heldout_formulations: FULL [depth given] 0.682
- heldout_formulations: FULL [depth and negation given] 0.682
- heldout_formulations: FULL [presence not decided] 0.702
- heldout_formulations: role object [presence not decided] 0.775
- heldout_formulations: role color [presence not decided] 0.788
- heldout_formulations: heads FULL (model) [presence not decided] 0.702
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.675
- heldout_formulations: role object [pooled midpoint (comparison)] 0.728
- heldout_formulations: role color [pooled midpoint (comparison)] 0.775
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.675
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.020
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.021
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.667
- heldout_formulations: presence object: absent read absent 0.667
- heldout_formulations: presence members: share of 'present' readings that abstain 0.500
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.500
- heldout_formulations: set members: first gold member in the decoded set 0.800
- heldout_formulations: presence object: absent read absent [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence shape: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.780
- train (sample): presence object: share of 'present' readings that abstain 0.013
- train (sample): presence object: share of true 'present' readings that abstain 0.013
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): structure (depth, negation) 0.790
- train (sample): predicate (surface lemma) 0.790
- train (sample): event type (synonym table) 0.790
- train (sample): role object 0.797
- train (sample): head object 0.797
- train (sample): occupancy: known filler 0.825
- train (sample): role color 0.823
- train (sample): head color 0.823
- train (sample): heads FULL (model) 0.780
- train (sample): heads FULL (lexical order baseline) 0.423
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.890
- train (sample): FULL [depth given] 0.780
- train (sample): FULL [depth and negation given] 0.780
- train (sample): presence shape: share of 'present' readings that abstain 0.009
- train (sample): presence shape: share of true 'present' readings that abstain 0.009
- train (sample): presence color: share of 'present' readings that abstain 0.005
- train (sample): presence color: share of true 'present' readings that abstain 0.005
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.714
- train (sample): presence members: share of 'present' readings that abstain 0.000
- train (sample): presence members: share of true 'present' readings that abstain 0.000
- train (sample): set members: first gold member in the decoded set 0.857
- train (sample): occupancy: unknown filler 0.857

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME COLOR` FULL 0.000 (n 11)
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 8)
- heldout_formulations: `both SIZE and COLOR` FULL 0.000 (n 1)
- heldout_formulations: `QUANT SHAPE to COLOR` FULL 0.000 (n 1)
- heldout_formulations: `make c27_them all COLOR` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role members |
|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.682 | 0.682 | 0.722 | 0.954 | 0.788 | 0.974 | 0.980 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.675 | 0.675 | 0.728 | 0.947 | 0.775 | 0.974 | 0.967 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.702 | 0.702 | 0.775 | 0.954 | 0.788 | 0.974 | 0.960 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.934 | 0.667 | 0.800 | 0.059 (1.000 / 0.030) |
| heldout_formulations | object | comparison: pooled midpoint | 0.943 | 0.667 | 0.805 |  |
| heldout_formulations | shape | product: fitted | 1.000 | 0.971 | 0.985 | 0.020 (0.000 / 0.021) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.979 | 0.971 | 0.975 |  |
| heldout_formulations | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.011 (— / 0.011) |
| heldout_formulations | color | comparison: pooled midpoint | 0.979 | 1.000 | 0.989 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.500 (— / 0.500) |
| heldout_formulations | members | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| train (sample) | object | product: fitted | 0.991 | 1.000 | 0.996 | 0.013 (— / 0.013) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.009 (— / 0.009) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.005 (— / 0.005) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
