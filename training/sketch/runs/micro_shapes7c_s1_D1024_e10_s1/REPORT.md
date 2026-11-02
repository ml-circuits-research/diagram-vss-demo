# REPORT — world `shapes7c_s1`, legend sha256:023a518c407b… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
6334 annotated sentences from 2 files; provenance: {'llm': 6334}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_shapes7c_s1_D1024_e10_s1/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 284 sentences
- heldout_formulations: 270 sentences
- train: 5780 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
34634 tokens in the examples; 1330 with no kind in the lexicon (share 0.038), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [1], batch 8, lr 0.02, epochs 10, device cuda, codes path+chainL+bigram, gates learned (closed start). Code commit 57a9d19. Memory curve: runs/micro_shapes7c_s1_D1024_e10_s1/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.583 [rule: fit; pooled midpoint 1.772 (comparison)] (present 2.667, n 645 / absent 0.877, n 39)
- attr_presence:object: threshold 0.179 [rule: fit; pooled midpoint 0.433 (comparison)] (present 0.785, n 17 / absent 0.080, n 674)
- det_presence:object: threshold 0.659 [rule: fit; pooled midpoint 0.464 (comparison)] (present 0.890, n 7 / absent 0.038, n 638)
- presence:shape: threshold 0.575 [rule: fit; pooled midpoint 0.635 (comparison)] (present 1.157, n 193 / absent 0.113, n 491)
- presence:color: threshold 0.525 [rule: fit; pooled midpoint 1.170 (comparison)] (present 2.226, n 549 / absent 0.114, n 135)
- presence:size: threshold 0.594 [rule: fit; pooled midpoint 0.687 (comparison)] (present 1.220, n 279 / absent 0.155, n 405)
- presence:name: threshold 0.338 [rule: fit; pooled midpoint 0.509 (comparison)] (present 0.998, n 52 / absent 0.020, n 632)
- presence:text: threshold 0.212 [rule: fit; pooled midpoint 0.367 (comparison)] (present 0.705, n 22 / absent 0.030, n 662)
- presence:relation: threshold 0.397 [rule: fit; pooled midpoint 0.521 (comparison)] (present 1.012, n 84 / absent 0.029, n 600)
- presence:landmark: threshold 0.215 [rule: fit; pooled midpoint 0.479 (comparison)] (present 0.899, n 84 / absent 0.060, n 600)
- presence:landmark2: threshold 0.156 [rule: fit; pooled midpoint 0.206 (comparison)] (present 0.335, n 10 / absent 0.076, n 674)
- presence:region: threshold 0.386 [rule: fit; pooled midpoint 0.590 (comparison)] (present 1.163, n 38 / absent 0.017, n 696)
- presence:quantity: threshold 0.675 [rule: fit; pooled midpoint 0.345 (comparison)] (present 0.676, n 5 / absent 0.014, n 679)
- presence:members: threshold 0.451 [rule: fit; pooled midpoint 0.651 (comparison)] (present 1.022, n 11 / absent 0.279, n 673)
- set_member:members: threshold 0.094 [rule: fit; pooled midpoint 0.393 (comparison)] (present 0.786, n 16 / absent -0.000, n 1610254)

## Results (seed 1 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, quantity 0.200, members 0.000, predicate 0.111

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 270)
| axis | accuracy |
|---|---|
| FULL | 0.713 |
| FULL [pooled midpoint (comparison)] | 0.020 |
| presence object: present read present | 0.927 |
| presence object: share of 'present' readings that abstain | 0.017 |
| presence object: share of true 'present' readings that abstain | 0.017 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.964 |
| presence size: absent read absent | 0.987 |
| presence name: present read present | 0.929 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence text: absent read absent | 1.000 |
| presence relation: present read present | 0.882 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.889 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 0.992 |
| structure (depth, negation) | 0.847 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.993 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.827 |
| event type (synonym table) | 0.827 |
| role object | 0.793 |
| head object | 0.800 |
| lexical order head object | 0.973 |
| lexical bag head object | 0.760 |
| occupancy: known filler | 0.827 |
| role shape | 0.960 |
| head shape | 0.960 |
| lexical order head shape | 0.727 |
| lexical bag head shape | 0.947 |
| occupancy: not given | 0.996 |
| role color | 0.860 |
| head color | 0.860 |
| lexical order head color | 0.973 |
| lexical bag head color | 0.980 |
| role size | 0.940 |
| head size | 0.940 |
| lexical order head size | 0.633 |
| lexical bag head size | 0.813 |
| role name | 0.980 |
| head name | 0.980 |
| lexical order head name | 0.900 |
| lexical bag head name | 0.967 |
| role text | 0.993 |
| head text | 0.993 |
| lexical order head text | 0.980 |
| lexical bag head text | 1.000 |
| role relation | 0.980 |
| head relation | 0.980 |
| lexical order head relation | 0.887 |
| lexical bag head relation | 0.947 |
| role landmark | 0.987 |
| head landmark | 0.987 |
| lexical order head landmark | 0.880 |
| lexical bag head landmark | 0.887 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.993 |
| lexical bag head landmark2 | 0.993 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 1.000 |
| lexical bag head region | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.987 |
| lexical bag head quantity | 0.987 |
| role members | 0.993 |
| head members | 0.993 |
| lexical order head members | 0.993 |
| lexical bag head members | 0.993 |
| heads FULL (model) | 0.727 |
| heads FULL (lexical order baseline) | 0.407 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.553 |
| role object [pooled midpoint (comparison)] | 0.067 |
| role shape [pooled midpoint (comparison)] | 0.953 |
| role color [pooled midpoint (comparison)] | 0.353 |
| role size [pooled midpoint (comparison)] | 0.927 |
| role name [pooled midpoint (comparison)] | 0.980 |
| role text [pooled midpoint (comparison)] | 0.993 |
| role relation [pooled midpoint (comparison)] | 0.987 |
| role landmark [pooled midpoint (comparison)] | 0.973 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.993 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.027 |
| presence object: present read present [pooled midpoint (comparison)] | 0.033 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence name: present read present [pooled midpoint (comparison)] | 0.857 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.882 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.778 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present | 0.922 |
| presence size: share of 'present' readings that abstain | 0.021 |
| presence size: share of true 'present' readings that abstain | 0.021 |
| presence name: absent read absent | 0.991 |
| presence relation: absent read absent | 0.991 |
| presence landmark: absent read absent | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.900 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present | 0.960 |
| presence color: share of 'present' readings that abstain | 0.021 |
| presence color: share of true 'present' readings that abstain | 0.011 |
| presence color: present read present [pooled midpoint (comparison)] | 0.186 |
| occupancy: unknown filler | 0.854 |
| presence shape: present read present | 0.921 |
| presence shape: share of 'present' readings that abstain | 0.029 |
| presence shape: share of true 'present' readings that abstain | 0.029 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.895 |
| presence color: share of FALSE 'present' readings that abstain | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.500 |
| presence quantity: share of true 'present' readings that abstain | 0.500 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence text: present read present | 0.667 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 0.667 |
| presence object: absent read absent | 0.667 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 1.000 |
| presence members: share of true 'present' readings that abstain | 1.000 |
| set members: first gold member in the decoded set | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: share of FALSE 'present' readings that abstain | 1.000 |
| presence name: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |

residual mean 0.246; status {'ok': 118, 'unknown-event': 20, 'abstain': 9, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.827 | 0.428 / 0.026 | 0.88 | 0.053 | 0.000 / 0.120 |
| role object | 0.792 | 0.410 / 0.065 | 0.91 | 0.132 | 0.014 / 0.076 |
| roles (pooled) | 0.828 | 0.378 / 0.054 | 0.90 | 0.090 | 0.017 / 0.083 |
| role name | 0.867 | 0.314 / 0.170 | 0.93 | 0.067 | 0.000 / 0.067 |
| role relation | 0.882 | 0.341 / 0.155 | 0.88 | 0.000 | 0.000 / 0.118 |
| role landmark | 0.889 | 0.260 / 0.058 | 0.89 | 0.000 | 0.000 / 0.111 |
| role color | 0.826 | 0.425 / 0.108 | 0.91 | 0.096 | 0.009 / 0.078 |
| role size | 0.855 | 0.340 / 0.100 | 0.91 | 0.073 | 0.018 / 0.073 |
| role shape | 0.854 | 0.314 / 0.043 | 0.88 | 0.049 | 0.024 / 0.098 |
| role quantity | 1.000 | 0.129 / 0.042 | 0.50 | 0.000 | 0.500 / 0.000 |
| role text | 0.667 | 0.197 / 0.056 | 0.67 | 0.000 | 0.000 / 0.333 |
| role members | 1.000 | 0.004 / 0.004 | 0.00 | 0.000 | 1.000 / 0.000 |
| role landmark2 | 1.000 | 0.147 / 0.147 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 150 of 5780)
| axis | accuracy |
|---|---|
| FULL | 0.847 |
| presence object: present read present | 0.992 |
| presence object: share of 'present' readings that abstain | 0.008 |
| presence object: share of true 'present' readings that abstain | 0.008 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
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
| role object | 0.873 |
| head object | 0.887 |
| lexical order head object | 0.967 |
| lexical bag head object | 0.940 |
| occupancy: known filler | 0.909 |
| role shape | 0.967 |
| head shape | 0.967 |
| lexical order head shape | 0.660 |
| lexical bag head shape | 0.973 |
| occupancy: not given | 0.999 |
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
| role relation | 0.993 |
| head relation | 0.993 |
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
| heads FULL (model) | 0.873 |
| heads FULL (lexical order baseline) | 0.367 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.753 |
| presence size: absent read absent | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.010 |
| presence color: share of true 'present' readings that abstain | 0.010 |
| presence relation: present read present | 0.917 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.917 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 0.833 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 0.667 |
| occupancy: unknown filler | 0.667 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.022 |
| presence shape: share of true 'present' readings that abstain | 0.022 |
| determiner identity (outside FULL when the legend excludes it) | 0.400 |
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
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |

residual mean 0.163; status {'ok': 130, 'unknown-event': 16, 'abstain': 4}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.873 | 0.452 / 0.060 | 0.91 | 0.040 | 0.000 / 0.087 |
| role object | 0.874 | 0.452 / 0.282 | 0.99 | 0.119 | 0.007 / 0.007 |
| roles (pooled) | 0.902 | 0.425 / 0.252 | 0.98 | 0.088 | 0.007 / 0.010 |
| role size | 0.968 | 0.395 / 0.274 | 1.00 | 0.032 | 0.000 / 0.000 |
| role color | 0.892 | 0.473 / 0.303 | 0.98 | 0.099 | 0.009 / 0.009 |
| role relation | 0.917 | 0.343 / 0.240 | 0.92 | 0.000 | 0.000 / 0.083 |
| role landmark | 0.917 | 0.319 / 0.113 | 0.92 | 0.000 | 0.000 / 0.083 |
| role members | 0.667 | 0.164 / 0.116 | 1.00 | 0.333 | 0.000 / 0.000 |
| role shape | 0.902 | 0.368 / 0.244 | 0.98 | 0.098 | 0.020 / 0.000 |
| role quantity | 1.000 | 0.169 / 0.169 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 1.000 | 0.366 / 0.339 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 1.000 | 0.393 / 0.393 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.289 / 0.247 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.103 / 0.103 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 a=1.00 COLOR=1.00 NUM=0.94 SIZE=0.91 are=0.88 c6_both=0.81 c4_then=0.70 c27_them=0.66 it=0.59 c23_in=0.58 c19_goes=0.58 c12_that=0.58 ARROW=0.56 c9_an=0.55 QUANT=0.55 NAME=0.54 TEXT=0.47 the=0.43 c18_does=0.42 c10_three=0.38 c22_from=0.37 c17_be=0.35 c3_rules=0.30 c14_uh=0.30 c2_now=0.29 with=0.28 SUPER=0.27 RECENT=0.27 VERB=0.21 c5_me=0.21 c26_shape=0.20 labeled=0.18 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 STYLE=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 lines=0.12 LAYOUT=0.06 directly=0.03 c8_what's=0.01 c11_what=0.00 c15_on=0.00 c13_one=0.00 c16_new=0.00 DIR=0.00 c1_have=0.00 c7_i=0.00 of=0.00 and=0.00 SHAPE=0.00 to=0.00 unknown=0.00 named=0.00 called=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.713
- heldout_formulations: presence object: share of 'present' readings that abstain 0.017
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.017
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present 0.882
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present 0.889
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: structure (depth, negation) 0.847
- heldout_formulations: predicate (surface lemma) 0.827
- heldout_formulations: event type (synonym table) 0.827
- heldout_formulations: role object 0.793
- heldout_formulations: head object 0.800
- heldout_formulations: occupancy: known filler 0.827
- heldout_formulations: role color 0.860
- heldout_formulations: head color 0.860
- heldout_formulations: heads FULL (model) 0.727
- heldout_formulations: heads FULL (lexical order baseline) 0.407
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.553
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.020
- heldout_formulations: role object [pooled midpoint (comparison)] 0.067
- heldout_formulations: role color [pooled midpoint (comparison)] 0.353
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.027
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.033
- heldout_formulations: presence name: present read present [pooled midpoint (comparison)] 0.857
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.882
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.778
- heldout_formulations: presence size: share of 'present' readings that abstain 0.021
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.021
- heldout_formulations: presence color: share of 'present' readings that abstain 0.021
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.011
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.186
- heldout_formulations: occupancy: unknown filler 0.854
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.029
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.029
- heldout_formulations: presence shape: present read present [pooled midpoint (comparison)] 0.895
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_formulations: presence relation: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.500
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.500
- heldout_formulations: presence size: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence text: present read present 0.667
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence object: absent read absent 0.667
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): FULL 0.847
- train (sample): presence object: share of 'present' readings that abstain 0.008
- train (sample): presence object: share of true 'present' readings that abstain 0.008
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): structure (depth, negation) 0.893
- train (sample): predicate (surface lemma) 0.873
- train (sample): event type (synonym table) 0.873
- train (sample): role object 0.873
- train (sample): head object 0.887
- train (sample): heads FULL (model) 0.873
- train (sample): heads FULL (lexical order baseline) 0.367
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.753
- train (sample): presence color: share of 'present' readings that abstain 0.010
- train (sample): presence color: share of true 'present' readings that abstain 0.010
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence object: absent read absent 0.833
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.000
- train (sample): presence members: share of true 'present' readings that abstain 0.000
- train (sample): set members: first gold member in the decoded set 0.667
- train (sample): occupancy: unknown filler 0.667
- train (sample): presence shape: share of 'present' readings that abstain 0.022
- train (sample): presence shape: share of true 'present' readings that abstain 0.022
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.400
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME COLOR` FULL 0.000 (n 10)
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 3)
- heldout_formulations: `draw a SHAPE` FULL 0.000 (n 1)
- heldout_formulations: `every new SHAPE make SIZE` FULL 0.000 (n 1)
- heldout_formulations: `a SIZE SHAPE called NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role quantity | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.727 | 0.713 | 0.793 | 0.960 | 0.860 | 0.940 | 0.980 | 0.993 | 0.980 | 0.987 | 1.000 | 1.000 | 1.000 | 0.993 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.027 | 0.020 | 0.067 | 0.953 | 0.353 | 0.927 | 0.980 | 0.993 | 0.987 | 0.973 | 1.000 | 1.000 | 1.000 | 0.993 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.927 | 0.667 | 0.797 | 0.017 (0.000 / 0.017) |
| heldout_formulations | object | comparison: pooled midpoint | 0.033 | 1.000 | 0.517 |  |
| heldout_formulations | shape | product: fitted | 0.921 | 1.000 | 0.961 | 0.029 (— / 0.029) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.895 | 1.000 | 0.947 |  |
| heldout_formulations | color | product: fitted | 0.960 | 0.964 | 0.962 | 0.021 (1.000 / 0.011) |
| heldout_formulations | color | comparison: pooled midpoint | 0.186 | 1.000 | 0.593 |  |
| heldout_formulations | size | product: fitted | 0.922 | 0.987 | 0.954 | 0.021 (0.000 / 0.021) |
| heldout_formulations | size | comparison: pooled midpoint | 0.900 | 0.986 | 0.943 |  |
| heldout_formulations | name | product: fitted | 0.929 | 0.991 | 0.960 | 0.000 (0.000 / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 0.857 | 1.000 | 0.929 |  |
| heldout_formulations | text | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | relation | product: fitted | 0.882 | 0.991 | 0.937 | 0.000 (0.000 / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.882 | 1.000 | 0.941 |  |
| heldout_formulations | landmark | product: fitted | 0.889 | 1.000 | 0.944 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.778 | 1.000 | 0.889 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | — | 1.000 | — |  |
| heldout_formulations | region | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.500 (— / 0.500) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.992 | 0.996 | 1.000 (1.000 / 1.000) |
| heldout_formulations | members | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | object | product: fitted | 0.992 | 0.833 | 0.913 | 0.008 (0.000 / 0.008) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.022 (— / 0.022) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.010 (— / 0.010) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.917 | 1.000 | 0.958 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.917 | 1.000 | 0.958 | 0.000 (— / 0.000) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
