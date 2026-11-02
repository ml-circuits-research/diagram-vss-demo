# REPORT — world `position7`, legend sha256:3eb500ccb8a6… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4375 annotated sentences from 2 files; provenance: {'llm': 4375}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_position7_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 230 sentences
- heldout_formulations: 207 sentences
- train: 3938 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
22680 tokens in the examples; 1140 with no kind in the lexicon (share 0.050), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 312cf7d. Memory curve: runs/micro_position7_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.194 [rule: fit; pooled midpoint 0.482 (comparison)] (present 0.963, n 222 / absent -0.000, n 1605081)
- presence:object: threshold 0.712 [rule: fit; pooled midpoint 0.732 (comparison)] (present 1.080, n 492 / absent 0.384, n 138)
- attr_presence:object: threshold 0.537 [rule: fit; pooled midpoint 0.470 (comparison)] (present 0.875, n 9 / absent 0.065, n 500)
- det_presence:object: threshold 0.443 [rule: fit; pooled midpoint 0.435 (comparison)] (present 0.845, n 9 / absent 0.025, n 500)
- presence:relation: threshold 0.296 [rule: fit; pooled midpoint 0.396 (comparison)] (present 0.635, n 195 / absent 0.158, n 435)
- presence:landmark: threshold 0.327 [rule: fit; pooled midpoint 0.485 (comparison)] (present 0.886, n 196 / absent 0.084, n 434)
- presence:landmark2: threshold 0.220 [rule: fit; pooled midpoint 0.275 (comparison)] (present 0.443, n 7 / absent 0.108, n 623)
- presence:region: threshold 0.412 [rule: fit; pooled midpoint 0.481 (comparison)] (present 0.794, n 175 / absent 0.168, n 455)
- presence:direction: threshold 0.215 [rule: fit; pooled midpoint 0.371 (comparison)] (present 0.707, n 34 / absent 0.034, n 596)
- presence:amount: threshold 0.309 [rule: fit; pooled midpoint 0.466 (comparison)] (present 0.871, n 33 / absent 0.061, n 597)
- presence:axis: threshold 0.530 [rule: fit; pooled midpoint 0.509 (comparison)] (present 1.016, n 43 / absent 0.002, n 587)
- presence:layout: threshold 0.436 [rule: fit; pooled midpoint 0.456 (comparison)] (present 0.912, n 69 / absent 0.000, n 561)
- presence:target: threshold 0.158 [rule: fit; pooled midpoint 0.368 (comparison)] (present 0.736, n 25 / absent 0.000, n 605)
- presence:members: threshold 0.455 [rule: fit; pooled midpoint 0.738 (comparison)] (present 1.325, n 96 / absent 0.151, n 534)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.045, axis 0.500, layout 0.250, target 0.000, members 0.000, predicate 0.125

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 207)
| axis | accuracy |
|---|---|
| FULL | 0.773 |
| FULL [pooled midpoint (comparison)] | 0.713 |
| presence object: present read present | 0.949 |
| presence object: share of 'present' readings that abstain | 0.061 |
| presence object: share of true 'present' readings that abstain | 0.054 |
| presence relation: absent read absent | 0.943 |
| presence landmark: absent read absent | 0.991 |
| presence landmark2: absent read absent | 1.000 |
| presence region: present read present | 0.878 |
| presence region: share of 'present' readings that abstain | 0.020 |
| presence region: share of true 'present' readings that abstain | 0.023 |
| presence direction: absent read absent | 0.993 |
| presence amount: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence members: absent read absent | 0.992 |
| structure (depth, negation) | 0.987 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.973 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.967 |
| event type (synonym table) | 0.967 |
| role object | 0.940 |
| head object | 0.940 |
| lexical order head object | 0.853 |
| lexical bag head object | 0.793 |
| occupancy: known filler | 0.912 |
| role relation | 0.913 |
| head relation | 0.913 |
| lexical order head relation | 0.720 |
| lexical bag head relation | 0.813 |
| occupancy: not given | 0.986 |
| role landmark | 0.987 |
| head landmark | 0.987 |
| lexical order head landmark | 0.733 |
| lexical bag head landmark | 0.667 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.987 |
| lexical bag head landmark2 | 0.987 |
| role region | 0.913 |
| head region | 0.913 |
| lexical order head region | 0.673 |
| lexical bag head region | 0.787 |
| role direction | 0.993 |
| head direction | 0.993 |
| lexical order head direction | 0.907 |
| lexical bag head direction | 0.940 |
| role amount | 1.000 |
| head amount | 1.000 |
| lexical order head amount | 0.907 |
| lexical bag head amount | 0.940 |
| role axis | 0.993 |
| head axis | 0.993 |
| lexical order head axis | 0.893 |
| lexical bag head axis | 0.980 |
| role layout | 0.987 |
| head layout | 0.987 |
| lexical order head layout | 0.900 |
| lexical bag head layout | 0.973 |
| role target | 1.000 |
| head target | 1.000 |
| lexical order head target | 0.967 |
| lexical bag head target | 0.980 |
| role members | 0.933 |
| head members | 0.933 |
| lexical order head members | 0.860 |
| lexical bag head members | 0.853 |
| heads FULL (model) | 0.780 |
| heads FULL (lexical order baseline) | 0.053 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.280 |
| role object [pooled midpoint (comparison)] | 0.940 |
| role relation [pooled midpoint (comparison)] | 0.900 |
| role landmark [pooled midpoint (comparison)] | 0.987 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.907 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role axis [pooled midpoint (comparison)] | 0.993 |
| role layout [pooled midpoint (comparison)] | 0.967 |
| role target [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.887 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.720 |
| presence object: present read present [pooled midpoint (comparison)] | 0.941 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 0.951 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: present read present [pooled midpoint (comparison)] | 0.857 |
| presence direction: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence amount: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.992 |
| presence relation: present read present | 0.833 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.975 |
| presence landmark: share of 'present' readings that abstain | 0.025 |
| presence landmark: share of true 'present' readings that abstain | 0.026 |
| presence region: absent read absent | 0.929 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.762 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.950 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.927 |
| presence object: absent read absent | 0.933 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.048 |
| presence members: share of true 'present' readings that abstain | 0.050 |
| set members: first gold member in the decoded set | 0.905 |
| occupancy: unknown filler | 0.973 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.963 |
| presence axis: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.941 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |
| presence target: present read present | 1.000 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present [pooled midpoint (comparison)] | 1.000 |
| presence layout: present read present | 0.929 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence layout: present read present [pooled midpoint (comparison)] | 0.909 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence direction: present read present | 1.000 |
| presence direction: share of 'present' readings that abstain | 0.067 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.000 |
| presence amount: share of true 'present' readings that abstain | 0.000 |
| presence direction: present read present [pooled midpoint (comparison)] | 1.000 |
| presence amount: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.500 |
| presence direction: share of FALSE 'present' readings that abstain | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |

residual mean 0.097; status {'ok': 132, 'abstain': 16, 'no-sense': 1, 'unknown-event': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.967 | 0.517 / 0.411 | 0.99 | 0.027 | 0.000 / 0.007 |
| role object | 0.941 | 0.320 / 0.048 | 0.89 | 0.000 | 0.050 / 0.059 |
| roles (pooled) | 0.902 | 0.337 / 0.063 | 0.91 | 0.027 | 0.024 / 0.071 |
| role region | 0.878 | 0.321 / 0.000 | 0.86 | 0.000 | 0.020 / 0.122 |
| role relation | 0.833 | 0.281 / 0.000 | 0.83 | 0.000 | 0.000 / 0.167 |
| role landmark | 0.975 | 0.439 / 0.282 | 0.95 | 0.000 | 0.025 / 0.025 |
| role axis | 0.938 | 0.339 / 0.253 | 0.94 | 0.000 | 0.000 / 0.062 |
| role members | 0.571 | 0.325 / 0.082 | 0.95 | 0.381 | 0.000 / 0.048 |
| role target | 1.000 | 0.494 / 0.477 | 1.00 | 0.000 | 0.000 / 0.000 |
| role layout | 0.867 | 0.295 / 0.182 | 0.93 | 0.067 | 0.000 / 0.067 |
| role landmark2 | 1.000 | 0.215 / 0.189 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 1.000 | 0.367 / 0.232 | 1.00 | 0.000 | 0.000 / 0.000 |
| role amount | 1.000 | 0.417 / 0.251 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 150 of 3938)
| axis | accuracy |
|---|---|
| FULL | 0.760 |
| presence object: present read present | 0.944 |
| presence object: share of 'present' readings that abstain | 0.108 |
| presence object: share of true 'present' readings that abstain | 0.101 |
| presence relation: absent read absent | 0.939 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: present read present | 0.867 |
| presence region: share of 'present' readings that abstain | 0.040 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence direction: absent read absent | 0.993 |
| presence amount: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.980 |
| event type (synonym table) | 0.980 |
| role object | 0.947 |
| head object | 0.947 |
| lexical order head object | 0.847 |
| lexical bag head object | 0.987 |
| occupancy: known filler | 0.931 |
| role relation | 0.900 |
| head relation | 0.900 |
| lexical order head relation | 0.660 |
| lexical bag head relation | 0.800 |
| occupancy: not given | 0.986 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.653 |
| lexical bag head landmark | 0.767 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.993 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.887 |
| head region | 0.887 |
| lexical order head region | 0.700 |
| lexical bag head region | 0.813 |
| role direction | 0.993 |
| head direction | 0.993 |
| lexical order head direction | 0.947 |
| lexical bag head direction | 0.993 |
| role amount | 1.000 |
| head amount | 1.000 |
| lexical order head amount | 0.947 |
| lexical bag head amount | 0.993 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.927 |
| lexical bag head axis | 1.000 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 0.933 |
| lexical bag head layout | 1.000 |
| role target | 1.000 |
| head target | 1.000 |
| lexical order head target | 0.953 |
| lexical bag head target | 1.000 |
| role members | 0.947 |
| head members | 0.947 |
| lexical order head members | 0.880 |
| lexical bag head members | 0.880 |
| heads FULL (model) | 0.767 |
| heads FULL (lexical order baseline) | 0.080 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.647 |
| presence region: absent read absent | 0.895 |
| presence direction: present read present | 1.000 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.000 |
| presence amount: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.182 |
| presence object: absent read absent | 0.958 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 1.000 |
| occupancy: unknown filler | 1.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.824 |
| presence relation: share of 'present' readings that abstain | 0.042 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence relation: share of FALSE 'present' readings that abstain | 0.333 |
| presence target: present read present | 1.000 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence direction: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.090; status {'ok': 123, 'abstain': 27}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.980 | 0.540 / 0.419 | 0.99 | 0.013 | 0.000 / 0.007 |
| role object | 0.944 | 0.270 / 0.027 | 0.85 | 0.000 | 0.095 / 0.056 |
| roles (pooled) | 0.911 | 0.326 / 0.055 | 0.90 | 0.024 | 0.036 / 0.065 |
| role region | 0.867 | 0.348 / 0.000 | 0.87 | 0.000 | 0.000 / 0.133 |
| role direction | 1.000 | 0.380 / 0.326 | 1.00 | 0.000 | 0.000 / 0.000 |
| role amount | 1.000 | 0.446 / 0.398 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark | 1.000 | 0.401 / 0.215 | 1.00 | 0.000 | 0.000 / 0.000 |
| role layout | 1.000 | 0.415 / 0.265 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.556 | 0.502 / 0.181 | 1.00 | 0.444 | 0.000 / 0.000 |
| role axis | 1.000 | 0.386 / 0.241 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.824 | 0.231 / 0.000 | 0.82 | 0.000 | 0.000 / 0.176 |
| role target | 1.000 | 0.455 / 0.395 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.183 / 0.183 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 AXIS=1.00 LAYOUT=1.00 c22_from=0.88 c9_an=0.84 DIR=0.82 and=0.82 c27_them=0.80 c1_have=0.74 c26_shape=0.71 with=0.68 are=0.64 VERB=0.63 c13_one=0.60 to=0.59 NUM=0.56 c16_new=0.54 c2_now=0.53 c6_both=0.50 c14_uh=0.45 c18_does=0.44 c10_three=0.40 c11_what=0.39 COLOR=0.34 c5_me=0.26 of=0.26 RECENT=0.23 SIZE=0.23 SHAPE=0.21 c7_i=0.20 c3_rules=0.14 ARROW=0.12 NOTCOLOR=0.12 PAIR=0.12 STYLE=0.12 SUPER=0.12 c21_arrowheads=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c12_that=0.10 c23_in=0.06 c20_arrow=0.04 c4_then=0.03 c8_what's=0.02 c17_be=0.01 it=0.00 c19_goes=0.00 c24_line=0.00 QUANT=0.00 a=0.00 c15_on=0.00 the=0.00 c25_pixels=0.00 NAME=0.00 unknown=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.773
- heldout_formulations: presence object: share of 'present' readings that abstain 0.061
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.054
- heldout_formulations: presence region: present read present 0.878
- heldout_formulations: presence region: share of 'present' readings that abstain 0.020
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.023
- heldout_formulations: heads FULL (model) 0.780
- heldout_formulations: heads FULL (lexical order baseline) 0.053
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.280
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.713
- heldout_formulations: role members [pooled midpoint (comparison)] 0.887
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.720
- heldout_formulations: presence region: present read present [pooled midpoint (comparison)] 0.857
- heldout_formulations: presence relation: present read present 0.833
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.025
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.026
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.762
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.048
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.050
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence direction: share of 'present' readings that abstain 0.067
- heldout_formulations: presence direction: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence amount: share of 'present' readings that abstain 0.000
- heldout_formulations: presence amount: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.500
- train (sample): FULL 0.760
- train (sample): presence object: share of 'present' readings that abstain 0.108
- train (sample): presence object: share of true 'present' readings that abstain 0.101
- train (sample): presence region: present read present 0.867
- train (sample): presence region: share of 'present' readings that abstain 0.040
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): role region 0.887
- train (sample): head region 0.887
- train (sample): heads FULL (model) 0.767
- train (sample): heads FULL (lexical order baseline) 0.080
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.647
- train (sample): presence region: absent read absent 0.895
- train (sample): presence direction: share of 'present' readings that abstain 0.000
- train (sample): presence direction: share of true 'present' readings that abstain 0.000
- train (sample): presence amount: share of 'present' readings that abstain 0.000
- train (sample): presence amount: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.182
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.000
- train (sample): presence members: share of true 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: present read present 0.824
- train (sample): presence relation: share of 'present' readings that abstain 0.042
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of FALSE 'present' readings that abstain 0.333
- train (sample): presence target: share of 'present' readings that abstain 0.000
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): presence direction: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `distribute c27_them AXIS` FULL 0.000 (n 3)
- heldout_formulations: `move NAME POS` FULL 0.000 (n 3)
- heldout_formulations: `NAME move POS NAME` FULL 0.000 (n 2)
- heldout_formulations: `move the NAME POS` FULL 0.000 (n 2)
- heldout_formulations: `move POS , is the NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role relation | role landmark | role landmark2 | role region | role direction | role amount | role axis | role layout | role target | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.780 | 0.773 | 0.940 | 0.913 | 0.987 | 1.000 | 0.913 | 0.993 | 1.000 | 0.993 | 0.987 | 1.000 | 0.933 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.720 | 0.713 | 0.940 | 0.900 | 0.987 | 1.000 | 0.907 | 1.000 | 1.000 | 0.993 | 0.967 | 1.000 | 0.887 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.949 | 0.933 | 0.941 | 0.061 (0.500 / 0.054) |
| heldout_formulations | object | comparison: pooled midpoint | 0.941 | 0.963 | 0.952 |  |
| heldout_formulations | relation | product: fitted | 0.833 | 0.943 | 0.888 | 0.000 (0.000 / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.762 | 0.951 | 0.857 |  |
| heldout_formulations | landmark | product: fitted | 0.975 | 0.991 | 0.983 | 0.025 (0.000 / 0.026) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.950 | 1.000 | 0.975 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 0.878 | 0.929 | 0.903 | 0.020 (0.000 / 0.023) |
| heldout_formulations | region | comparison: pooled midpoint | 0.857 | 0.927 | 0.892 |  |
| heldout_formulations | direction | product: fitted | 1.000 | 0.993 | 0.996 | 0.067 (1.000 / 0.000) |
| heldout_formulations | direction | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | amount | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 0.929 | 1.000 | 0.964 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 0.909 | 1.000 | 0.955 |  |
| heldout_formulations | target | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | target | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.992 | 0.996 | 0.048 (0.000 / 0.050) |
| heldout_formulations | members | comparison: pooled midpoint | 0.941 | 0.992 | 0.967 |  |
| train (sample) | object | product: fitted | 0.944 | 0.958 | 0.951 | 0.108 (1.000 / 0.101) |
| train (sample) | relation | product: fitted | 0.824 | 0.939 | 0.881 | 0.042 (0.333 / 0.000) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | region | product: fitted | 0.867 | 0.895 | 0.881 | 0.040 (0.182 / 0.000) |
| train (sample) | direction | product: fitted | 1.000 | 0.993 | 0.996 | 0.000 (0.000 / 0.000) |
| train (sample) | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | target | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
