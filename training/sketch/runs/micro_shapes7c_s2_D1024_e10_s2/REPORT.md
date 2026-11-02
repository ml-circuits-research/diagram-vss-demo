# REPORT — world `shapes7c_s2`, legend sha256:023a518c407b… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
6334 annotated sentences from 2 files; provenance: {'llm': 6334}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_shapes7c_s2_D1024_e10_s2/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 288 sentences
- heldout_formulations: 266 sentences
- train: 5780 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
34634 tokens in the examples; 1330 with no kind in the lexicon (share 0.038), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [2], batch 8, lr 0.02, epochs 10, device cuda, codes path+chainL+bigram, gates learned (closed start). Code commit 9fb27dc. Memory curve: runs/micro_shapes7c_s2_D1024_e10_s2/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.069 [rule: fit; pooled midpoint 0.460 (comparison)] (present 0.920, n 15 / absent 0.000, n 1627235)
- presence:object: threshold 0.838 [rule: fit; pooled midpoint 2.311 (comparison)] (present 3.928, n 647 / absent 0.695, n 41)
- attr_presence:object: threshold 0.287 [rule: fit; pooled midpoint 0.471 (comparison)] (present 0.860, n 16 / absent 0.083, n 678)
- det_presence:object: threshold 0.357 [rule: fit; pooled midpoint 0.477 (comparison)] (present 0.919, n 6 / absent 0.035, n 641)
- presence:shape: threshold 0.521 [rule: fit; pooled midpoint 0.816 (comparison)] (present 1.459, n 203 / absent 0.173, n 485)
- presence:color: threshold 0.610 [rule: fit; pooled midpoint 1.754 (comparison)] (present 3.374, n 553 / absent 0.135, n 135)
- presence:size: threshold 0.707 [rule: fit; pooled midpoint 0.877 (comparison)] (present 1.557, n 273 / absent 0.198, n 415)
- presence:name: threshold 0.476 [rule: fit; pooled midpoint 0.547 (comparison)] (present 1.070, n 59 / absent 0.024, n 629)
- presence:text: threshold 0.197 [rule: fit; pooled midpoint 0.373 (comparison)] (present 0.708, n 16 / absent 0.039, n 672)
- presence:relation: threshold 0.585 [rule: fit; pooled midpoint 0.514 (comparison)] (present 0.978, n 84 / absent 0.050, n 604)
- presence:landmark: threshold 0.310 [rule: fit; pooled midpoint 0.475 (comparison)] (present 0.854, n 83 / absent 0.097, n 605)
- presence:landmark2: threshold 0.226 [rule: fit; pooled midpoint 0.265 (comparison)] (present 0.420, n 13 / absent 0.109, n 675)
- presence:region: threshold 0.161 [rule: fit; pooled midpoint 0.408 (comparison)] (present 0.796, n 39 / absent 0.021, n 700)
- presence:quantity: threshold 0.719 [rule: fit; pooled midpoint 0.469 (comparison)] (present 0.927, n 10 / absent 0.012, n 678)
- presence:members: threshold 0.436 [rule: fit; pooled midpoint 0.940 (comparison)] (present 1.445, n 8 / absent 0.435, n 680)

## Results (seed 2 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, quantity 0.200, members 0.000, predicate 0.111

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 266)
| axis | accuracy |
|---|---|
| FULL | 0.560 |
| FULL [pooled midpoint (comparison)] | 0.007 |
| presence object: present read present | 0.708 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: present read present | 0.882 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence text: absent read absent | 1.000 |
| presence relation: present read present | 0.857 |
| presence relation: share of 'present' readings that abstain | 0.056 |
| presence relation: share of true 'present' readings that abstain | 0.056 |
| presence landmark: present read present | 0.773 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 0.992 |
| structure (depth, negation) | 0.853 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.987 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.847 |
| event type (synonym table) | 0.847 |
| role object | 0.620 |
| head object | 0.620 |
| lexical order head object | 0.960 |
| lexical bag head object | 0.733 |
| occupancy: known filler | 0.754 |
| role shape | 0.973 |
| head shape | 0.973 |
| lexical order head shape | 0.713 |
| lexical bag head shape | 0.933 |
| occupancy: not given | 0.999 |
| role color | 0.827 |
| head color | 0.827 |
| lexical order head color | 0.967 |
| lexical bag head color | 0.967 |
| role size | 0.953 |
| head size | 0.953 |
| lexical order head size | 0.660 |
| lexical bag head size | 0.900 |
| role name | 0.987 |
| head name | 0.987 |
| lexical order head name | 0.887 |
| lexical bag head name | 0.940 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.973 |
| lexical bag head text | 0.987 |
| role relation | 0.980 |
| head relation | 0.980 |
| lexical order head relation | 0.860 |
| lexical bag head relation | 0.933 |
| role landmark | 0.967 |
| head landmark | 0.967 |
| lexical order head landmark | 0.853 |
| lexical bag head landmark | 0.873 |
| role landmark2 | 0.987 |
| head landmark2 | 0.987 |
| lexical order head landmark2 | 0.980 |
| lexical bag head landmark2 | 0.980 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 1.000 |
| lexical bag head region | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.993 |
| lexical bag head quantity | 1.000 |
| role members | 0.980 |
| head members | 0.980 |
| lexical order head members | 0.980 |
| lexical bag head members | 0.980 |
| heads FULL (model) | 0.560 |
| heads FULL (lexical order baseline) | 0.407 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.567 |
| role object [pooled midpoint (comparison)] | 0.067 |
| role shape [pooled midpoint (comparison)] | 0.940 |
| role color [pooled midpoint (comparison)] | 0.173 |
| role size [pooled midpoint (comparison)] | 0.893 |
| role name [pooled midpoint (comparison)] | 0.987 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.980 |
| role landmark [pooled midpoint (comparison)] | 0.960 |
| role landmark2 [pooled midpoint (comparison)] | 0.987 |
| role region [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.980 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.007 |
| presence object: present read present [pooled midpoint (comparison)] | 0.008 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: present read present [pooled midpoint (comparison)] | 0.882 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.905 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.727 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: share of 'present' readings that abstain | 0.128 |
| presence object: share of true 'present' readings that abstain | 0.118 |
| presence size: present read present | 0.898 |
| presence size: share of 'present' readings that abstain | 0.023 |
| presence size: share of true 'present' readings that abstain | 0.023 |
| presence name: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.714 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 0.991 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present | 0.943 |
| presence color: share of 'present' readings that abstain | 0.050 |
| presence color: share of true 'present' readings that abstain | 0.050 |
| presence color: present read present [pooled midpoint (comparison)] | 0.010 |
| presence landmark2: present read present | 0.333 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| occupancy: unknown filler | 0.780 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.333 |
| presence shape: present read present | 0.975 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.850 |
| presence object: absent read absent | 0.875 |
| presence object: share of FALSE 'present' readings that abstain | 1.000 |
| presence members: present read present | 0.667 |
| presence members: share of 'present' readings that abstain | 0.667 |
| presence members: share of true 'present' readings that abstain | 0.500 |
| set members: first gold member in the decoded set | 0.667 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.333 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.500 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.305; status {'ok': 110, 'unknown-event': 21, 'abstain': 18, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.847 | 0.424 / 0.023 | 0.88 | 0.033 | 0.000 / 0.120 |
| role object | 0.603 | 0.216 / 0.000 | 0.67 | 0.142 | 0.071 / 0.255 |
| roles (pooled) | 0.752 | 0.290 / 0.000 | 0.81 | 0.093 | 0.039 / 0.155 |
| role name | 0.882 | 0.213 / 0.049 | 0.88 | 0.000 | 0.000 / 0.118 |
| role relation | 0.857 | 0.257 / 0.000 | 0.81 | 0.000 | 0.048 / 0.143 |
| role landmark | 0.773 | 0.254 / 0.000 | 0.77 | 0.000 | 0.000 / 0.227 |
| role color | 0.792 | 0.393 / 0.007 | 0.87 | 0.112 | 0.032 / 0.096 |
| role size | 0.863 | 0.228 / 0.032 | 0.88 | 0.039 | 0.020 / 0.098 |
| role landmark2 | 0.333 | 0.066 / 0.000 | 0.33 | 0.000 | 0.000 / 0.667 |
| role shape | 0.907 | 0.395 / 0.226 | 0.98 | 0.070 | 0.000 / 0.023 |
| role members | 0.333 | 0.259 / 0.009 | 0.33 | 0.333 | 0.333 / 0.333 |
| role quantity | 1.000 | 0.117 / 0.117 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.319 / 0.299 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 150 of 5780)
| axis | accuracy |
|---|---|
| FULL | 0.787 |
| presence object: present read present | 0.906 |
| presence object: share of 'present' readings that abstain | 0.086 |
| presence object: share of true 'present' readings that abstain | 0.086 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.016 |
| presence size: share of true 'present' readings that abstain | 0.016 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.893 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.993 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.873 |
| event type (synonym table) | 0.873 |
| role object | 0.813 |
| head object | 0.820 |
| lexical order head object | 0.967 |
| lexical bag head object | 0.940 |
| occupancy: known filler | 0.879 |
| role shape | 0.967 |
| head shape | 0.967 |
| lexical order head shape | 0.660 |
| lexical bag head shape | 0.973 |
| occupancy: not given | 1.000 |
| role color | 0.920 |
| head color | 0.920 |
| lexical order head color | 0.987 |
| lexical bag head color | 0.993 |
| role size | 0.987 |
| head size | 0.987 |
| lexical order head size | 0.580 |
| lexical bag head size | 0.853 |
| role name | 1.000 |
| head name | 1.000 |
| lexical order head name | 0.947 |
| lexical bag head name | 0.993 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.980 |
| lexical bag head text | 1.000 |
| role relation | 0.987 |
| head relation | 0.987 |
| lexical order head relation | 0.920 |
| lexical bag head relation | 0.987 |
| role landmark | 0.993 |
| head landmark | 0.993 |
| lexical order head landmark | 0.920 |
| lexical bag head landmark | 0.980 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.993 |
| lexical bag head landmark2 | 1.000 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 0.993 |
| lexical bag head region | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.993 |
| lexical bag head quantity | 1.000 |
| role members | 0.993 |
| head members | 0.993 |
| lexical order head members | 0.980 |
| lexical bag head members | 0.980 |
| heads FULL (model) | 0.807 |
| heads FULL (lexical order baseline) | 0.367 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.753 |
| presence size: absent read absent | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.010 |
| presence color: share of true 'present' readings that abstain | 0.010 |
| presence relation: present read present | 0.833 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.917 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 0.667 |
| occupancy: unknown filler | 0.667 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.022 |
| presence shape: share of true 'present' readings that abstain | 0.022 |
| determiner identity (outside FULL when the legend excludes it) | 0.600 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |

residual mean 0.185; status {'ok': 122, 'unknown-event': 16, 'abstain': 12}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.873 | 0.453 / 0.069 | 0.91 | 0.033 | 0.000 / 0.093 |
| role object | 0.804 | 0.223 / 0.003 | 0.85 | 0.112 | 0.070 / 0.084 |
| roles (pooled) | 0.875 | 0.315 / 0.078 | 0.92 | 0.083 | 0.034 / 0.042 |
| role size | 0.968 | 0.277 / 0.137 | 0.98 | 0.032 | 0.016 / 0.000 |
| role color | 0.892 | 0.421 / 0.214 | 0.97 | 0.090 | 0.009 / 0.018 |
| role relation | 0.833 | 0.263 / 0.021 | 0.83 | 0.000 | 0.000 / 0.167 |
| role landmark | 0.917 | 0.326 / 0.106 | 0.92 | 0.000 | 0.000 / 0.083 |
| role members | 0.667 | 0.144 / 0.084 | 1.00 | 0.333 | 0.000 / 0.000 |
| role shape | 0.902 | 0.419 / 0.331 | 0.98 | 0.098 | 0.020 / 0.000 |
| role quantity | 1.000 | 0.266 / 0.266 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 1.000 | 0.311 / 0.270 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 1.000 | 0.318 / 0.318 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.293 / 0.262 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.012 / 0.012 | 0.00 | 0.000 | 1.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 COLOR=1.00 a=1.00 SIZE=0.92 NUM=0.88 are=0.77 c27_them=0.68 c6_both=0.68 c4_then=0.58 c23_in=0.57 QUANT=0.53 NAME=0.49 ARROW=0.47 VERB=0.44 c9_an=0.43 the=0.42 TEXT=0.38 c17_be=0.36 it=0.35 c19_goes=0.34 c3_rules=0.34 RECENT=0.31 with=0.29 c22_from=0.26 c18_does=0.24 c14_uh=0.22 c2_now=0.20 c26_shape=0.19 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 STYLE=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 lines=0.12 SUPER=0.12 directly=0.10 LAYOUT=0.06 c12_that=0.05 c8_what's=0.01 c10_three=0.00 c11_what=0.00 c5_me=0.00 labeled=0.00 DIR=0.00 c13_one=0.00 c15_on=0.00 c16_new=0.00 c1_have=0.00 of=0.00 c7_i=0.00 and=0.00 to=0.00 SHAPE=0.00 unknown=0.00 named=0.00 called=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.560
- heldout_formulations: presence object: present read present 0.708
- heldout_formulations: presence name: present read present 0.882
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present 0.857
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.056
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.056
- heldout_formulations: presence landmark: present read present 0.773
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: structure (depth, negation) 0.853
- heldout_formulations: predicate (surface lemma) 0.847
- heldout_formulations: event type (synonym table) 0.847
- heldout_formulations: role object 0.620
- heldout_formulations: head object 0.620
- heldout_formulations: occupancy: known filler 0.754
- heldout_formulations: role color 0.827
- heldout_formulations: head color 0.827
- heldout_formulations: heads FULL (model) 0.560
- heldout_formulations: heads FULL (lexical order baseline) 0.407
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.567
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.007
- heldout_formulations: role object [pooled midpoint (comparison)] 0.067
- heldout_formulations: role color [pooled midpoint (comparison)] 0.173
- heldout_formulations: role size [pooled midpoint (comparison)] 0.893
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.007
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.008
- heldout_formulations: presence name: present read present [pooled midpoint (comparison)] 0.882
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.727
- heldout_formulations: presence object: share of 'present' readings that abstain 0.128
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.118
- heldout_formulations: presence size: present read present 0.898
- heldout_formulations: presence size: share of 'present' readings that abstain 0.023
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.023
- heldout_formulations: presence size: present read present [pooled midpoint (comparison)] 0.714
- heldout_formulations: presence color: share of 'present' readings that abstain 0.050
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.050
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.010
- heldout_formulations: presence landmark2: present read present 0.333
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- heldout_formulations: occupancy: unknown filler 0.780
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.333
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence shape: present read present [pooled midpoint (comparison)] 0.850
- heldout_formulations: presence object: absent read absent 0.875
- heldout_formulations: presence members: present read present 0.667
- heldout_formulations: presence members: share of 'present' readings that abstain 0.667
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.500
- heldout_formulations: set members: first gold member in the decoded set 0.667
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.333
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.500
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- train (sample): FULL 0.787
- train (sample): presence object: share of 'present' readings that abstain 0.086
- train (sample): presence object: share of true 'present' readings that abstain 0.086
- train (sample): presence size: share of 'present' readings that abstain 0.016
- train (sample): presence size: share of true 'present' readings that abstain 0.016
- train (sample): structure (depth, negation) 0.893
- train (sample): predicate (surface lemma) 0.873
- train (sample): event type (synonym table) 0.873
- train (sample): role object 0.813
- train (sample): head object 0.820
- train (sample): occupancy: known filler 0.879
- train (sample): heads FULL (model) 0.807
- train (sample): heads FULL (lexical order baseline) 0.367
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.753
- train (sample): presence color: share of 'present' readings that abstain 0.010
- train (sample): presence color: share of true 'present' readings that abstain 0.010
- train (sample): presence relation: present read present 0.833
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.000
- train (sample): presence members: share of true 'present' readings that abstain 0.000
- train (sample): set members: first gold member in the decoded set 0.667
- train (sample): occupancy: unknown filler 0.667
- train (sample): presence shape: share of 'present' readings that abstain 0.022
- train (sample): presence shape: share of true 'present' readings that abstain 0.022
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.600
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 8)
- heldout_formulations: `NAME COLOR` FULL 0.000 (n 5)
- heldout_formulations: `draw a SIZE COLOR SHAPE labeled NAME POS the NAME` FULL 0.000 (n 4)
- heldout_formulations: `from_now_on , every new SHAPE should be COLOR` FULL 0.000 (n 2)
- heldout_formulations: `draw a SHAPE named NAME POS the NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role quantity | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.560 | 0.560 | 0.620 | 0.973 | 0.827 | 0.953 | 0.987 | 1.000 | 0.980 | 0.967 | 0.987 | 1.000 | 1.000 | 0.980 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.007 | 0.007 | 0.067 | 0.940 | 0.173 | 0.893 | 0.987 | 1.000 | 0.980 | 0.960 | 0.987 | 1.000 | 1.000 | 0.980 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.708 | 0.875 | 0.792 | 0.128 (1.000 / 0.118) |
| heldout_formulations | object | comparison: pooled midpoint | 0.008 | 1.000 | 0.504 |  |
| heldout_formulations | shape | product: fitted | 0.975 | 1.000 | 0.988 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.850 | 1.000 | 0.925 |  |
| heldout_formulations | color | product: fitted | 0.943 | 1.000 | 0.972 | 0.050 (— / 0.050) |
| heldout_formulations | color | comparison: pooled midpoint | 0.010 | 1.000 | 0.505 |  |
| heldout_formulations | size | product: fitted | 0.898 | 1.000 | 0.949 | 0.023 (— / 0.023) |
| heldout_formulations | size | comparison: pooled midpoint | 0.714 | 1.000 | 0.857 |  |
| heldout_formulations | name | product: fitted | 0.882 | 1.000 | 0.941 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 0.882 | 1.000 | 0.941 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.857 | 1.000 | 0.929 | 0.056 (— / 0.056) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.905 | 0.991 | 0.948 |  |
| heldout_formulations | landmark | product: fitted | 0.773 | 1.000 | 0.886 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.727 | 1.000 | 0.864 |  |
| heldout_formulations | landmark2 | product: fitted | 0.333 | 1.000 | 0.667 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.333 | 1.000 | 0.667 |  |
| heldout_formulations | region | product: fitted | — | 1.000 | — |  |
| heldout_formulations | region | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 0.667 | 0.992 | 0.829 | 0.667 (1.000 / 0.500) |
| heldout_formulations | members | comparison: pooled midpoint | 0.333 | 1.000 | 0.667 |  |
| train (sample) | object | product: fitted | 0.906 | 1.000 | 0.953 | 0.086 (— / 0.086) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.022 (— / 0.022) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.010 (— / 0.010) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.016 (— / 0.016) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.833 | 1.000 | 0.917 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.917 | 1.000 | 0.958 | 0.000 (— / 0.000) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| train (sample) | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
