# REPORT — world `create`, legend sha256:1bd5099c29d0… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
754 annotated sentences from 2 files; provenance: {'llm': 754}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_create_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 25 sentences
- heldout_formulations: 26 sentences
- train: 703 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
6917 tokens in the examples; 271 with no kind in the lexicon (share 0.039), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 3de6b02. Memory curve: runs/micro_create_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.795 [rule: fit; pooled midpoint 1.141 (comparison)] (present 1.116, n 405 / absent 1.166, n 20)
- attr_presence:object: threshold 0.542 [rule: fit; pooled midpoint 0.578 (comparison)] (present 1.018, n 336 / absent 0.137, n 69)
- presence:size: threshold 0.734 [rule: fit; pooled midpoint 0.645 (comparison)] (present 1.081, n 194 / absent 0.208, n 231)
- presence:name: threshold 0.586 [rule: fit; pooled midpoint 1.827 (comparison)] (present 3.419, n 261 / absent 0.235, n 164)
- presence:text: threshold 0.497 [rule: fit; pooled midpoint 0.617 (comparison)] (present 0.888, n 107 / absent 0.347, n 318)
- presence:relation: threshold 0.644 [rule: fit; pooled midpoint 1.119 (comparison)] (present 1.165, n 357 / absent 1.074, n 68)
- presence:landmark: threshold 0.437 [rule: fit; pooled midpoint 0.969 (comparison)] (present 1.127, n 358 / absent 0.811, n 67)
- presence:landmark2: threshold 0.413 [rule: fit; pooled midpoint 0.589 (comparison)] (present 0.824, n 50 / absent 0.355, n 375)
- presence:region: threshold 0.546 [rule: fit; pooled midpoint 1.036 (comparison)] (present 1.859, n 25 / absent 0.213, n 400)
- presence:quantity: threshold 0.830 [rule: fit; pooled midpoint 0.970 (comparison)] (present 1.805, n 16 / absent 0.135, n 409)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.062, size 0.143, name 0.001, text 0.001, relation 0.067, landmark 0.001, landmark2 0.001, region 0.067, quantity 0.250, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 26 of 26)
| axis | accuracy |
|---|---|
| FULL | 0.808 |
| FULL [depth given] | 0.808 |
| FULL [depth and negation given] | 0.808 |
| FULL [presence not decided] | 0.846 |
| FULL [pooled midpoint (comparison)] | 0.000 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.045 |
| presence object: share of true 'present' readings that abstain | 0.045 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| structure (depth, negation) | 0.846 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.846 |
| event type (synonym table) | 0.846 |
| role object | 0.846 |
| head object | 0.846 |
| lexical order head object | 1.000 |
| lexical bag head object | 1.000 |
| occupancy: known filler | 0.833 |
| role size | 0.962 |
| head size | 0.962 |
| lexical order head size | 0.538 |
| lexical bag head size | 0.731 |
| occupancy: not given | 1.000 |
| role name | 0.846 |
| head name | 0.846 |
| lexical order head name | 0.731 |
| lexical bag head name | 0.654 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.808 |
| lexical bag head text | 0.885 |
| role relation | 0.808 |
| head relation | 0.808 |
| lexical order head relation | 1.000 |
| lexical bag head relation | 1.000 |
| role landmark | 0.846 |
| head landmark | 0.846 |
| lexical order head landmark | 0.846 |
| lexical bag head landmark | 0.269 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.808 |
| lexical bag head landmark2 | 0.769 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 1.000 |
| lexical bag head region | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 1.000 |
| lexical bag head quantity | 1.000 |
| heads FULL (model) | 0.808 |
| heads FULL (lexical order baseline) | 0.346 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.077 |
| role object [presence not decided] | 0.846 |
| role size [presence not decided] | 0.962 |
| role name [presence not decided] | 0.846 |
| role text [presence not decided] | 1.000 |
| role relation [presence not decided] | 0.846 |
| role landmark [presence not decided] | 0.846 |
| role landmark2 [presence not decided] | 1.000 |
| role region [presence not decided] | 1.000 |
| role quantity [presence not decided] | 1.000 |
| heads FULL (model) [presence not decided] | 0.846 |
| role object [pooled midpoint (comparison)] | 0.000 |
| role size [pooled midpoint (comparison)] | 0.962 |
| role name [pooled midpoint (comparison)] | 0.308 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.192 |
| role landmark [pooled midpoint (comparison)] | 0.308 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.000 |
| presence object: present read present [pooled midpoint (comparison)] | 0.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.950 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| occupancy: unknown filler | 0.867 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.150 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.300 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |

residual mean 0.189; status {'ok': 21, 'unknown-event': 4, 'abstain': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.846 | 0.368 / 0.136 | 0.96 | 0.115 | 0.000 / 0.038 |
| role object | 0.846 | 0.175 / 0.094 | 0.96 | 0.154 | 0.038 / 0.000 |
| roles (pooled) | 0.842 | 0.267 / 0.127 | 0.96 | 0.132 | 0.009 / 0.026 |
| role size | 0.917 | 0.248 / 0.168 | 1.00 | 0.083 | 0.000 / 0.000 |
| role text | 1.000 | 0.279 / 0.240 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.792 | 0.296 / 0.182 | 0.92 | 0.125 | 0.000 / 0.083 |
| role landmark | 0.833 | 0.311 / 0.244 | 0.96 | 0.125 | 0.000 / 0.042 |
| role name | 0.778 | 0.314 / 0.238 | 1.00 | 0.222 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.258 / 0.204 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 703)
| axis | accuracy |
|---|---|
| FULL | 0.783 |
| FULL [depth given] | 0.783 |
| FULL [depth and negation given] | 0.783 |
| presence object: present read present | 0.992 |
| presence object: share of 'present' readings that abstain | 0.056 |
| presence object: share of true 'present' readings that abstain | 0.056 |
| presence size: absent read absent | 1.000 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.013 |
| presence name: share of true 'present' readings that abstain | 0.014 |
| presence text: absent read absent | 1.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.982 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| structure (depth, negation) | 0.813 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.813 |
| event type (synonym table) | 0.813 |
| role object | 0.810 |
| head object | 0.810 |
| lexical order head object | 0.990 |
| lexical bag head object | 0.997 |
| occupancy: known filler | 0.823 |
| role size | 0.953 |
| head size | 0.953 |
| lexical order head size | 0.540 |
| lexical bag head size | 0.970 |
| occupancy: not given | 0.999 |
| role name | 0.857 |
| head name | 0.857 |
| lexical order head name | 0.650 |
| lexical bag head name | 0.990 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.760 |
| lexical bag head text | 1.000 |
| role relation | 0.853 |
| head relation | 0.853 |
| lexical order head relation | 0.953 |
| lexical bag head relation | 0.997 |
| role landmark | 0.847 |
| head landmark | 0.847 |
| lexical order head landmark | 0.873 |
| lexical bag head landmark | 0.937 |
| role landmark2 | 0.977 |
| head landmark2 | 0.977 |
| lexical order head landmark2 | 0.867 |
| lexical bag head landmark2 | 0.990 |
| role region | 0.967 |
| head region | 0.967 |
| lexical order head region | 0.963 |
| lexical bag head region | 1.000 |
| role quantity | 0.977 |
| head quantity | 0.977 |
| lexical order head quantity | 0.970 |
| lexical bag head quantity | 1.000 |
| heads FULL (model) | 0.783 |
| heads FULL (lexical order baseline) | 0.393 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.887 |
| presence size: present read present | 0.992 |
| presence size: share of 'present' readings that abstain | 0.008 |
| presence size: share of true 'present' readings that abstain | 0.008 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 1.000 |
| presence region: share of true 'present' readings that abstain | 1.000 |
| presence object: absent read absent | 1.000 |
| presence name: absent read absent | 0.990 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.061 |
| presence landmark2: share of true 'present' readings that abstain | 0.061 |
| presence name: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.233; status {'ok': 226, 'abstain': 18, 'unknown-event': 56}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.813 | 0.355 / 0.055 | 0.91 | 0.097 | 0.000 / 0.090 |
| role object | 0.803 | 0.205 / 0.098 | 0.95 | 0.186 | 0.041 / 0.010 |
| roles (pooled) | 0.822 | 0.296 / 0.150 | 0.98 | 0.170 | 0.014 / 0.008 |
| role name | 0.779 | 0.339 / 0.250 | 0.98 | 0.216 | 0.011 / 0.005 |
| role relation | 0.833 | 0.337 / 0.236 | 1.00 | 0.163 | 0.000 / 0.004 |
| role landmark | 0.824 | 0.352 / 0.294 | 0.98 | 0.160 | 0.000 / 0.015 |
| role size | 0.899 | 0.256 / 0.160 | 0.99 | 0.094 | 0.007 / 0.007 |
| role region | 0.091 | 0.425 / 0.307 | 0.91 | 0.909 | 0.091 / 0.000 |
| role quantity | 0.222 | 0.338 / 0.115 | 1.00 | 0.778 | 0.000 / 0.000 |
| role text | 1.000 | 0.275 / 0.203 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 0.825 | 0.246 / 0.118 | 0.95 | 0.175 | 0.050 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 a=0.94 c23_in=0.63 SHAPE=0.58 NAME=0.56 c13_one=0.52 c2_now=0.48 TEXT=0.48 and=0.48 c3_rules=0.43 VERB=0.38 c1_have=0.33 with=0.30 PAIR=0.18 c4_then=0.17 c18_does=0.16 ARROW=0.12 AXIS=0.12 NOTCOLOR=0.12 RECENT=0.12 STYLE=0.12 SUPER=0.12 are=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c24_line=0.12 c25_pixels=0.12 lines=0.12 c14_uh=0.09 LAYOUT=0.09 c17_be=0.08 c27_them=0.07 QUANT=0.06 directly=0.06 c12_that=0.06 c19_goes=0.05 c6_both=0.05 c26_shape=0.05 c15_on=0.04 c8_what's=0.04 c9_an=0.04 c11_what=0.03 c10_three=0.02 labeled=0.02 c7_i=0.01 of=0.01 DIR=0.01 it=0.01 to=0.01 NUM=0.01 c16_new=0.01 called=0.01 c5_me=0.01 the=0.00 SIZE=0.00 named=0.00 unknown=0.00 COLOR=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.808
- heldout_formulations: presence object: share of 'present' readings that abstain 0.045
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.045
- heldout_formulations: structure (depth, negation) 0.846
- heldout_formulations: predicate (surface lemma) 0.846
- heldout_formulations: event type (synonym table) 0.846
- heldout_formulations: role object 0.846
- heldout_formulations: head object 0.846
- heldout_formulations: occupancy: known filler 0.833
- heldout_formulations: role name 0.846
- heldout_formulations: head name 0.846
- heldout_formulations: role relation 0.808
- heldout_formulations: head relation 0.808
- heldout_formulations: role landmark 0.846
- heldout_formulations: head landmark 0.846
- heldout_formulations: heads FULL (model) 0.808
- heldout_formulations: heads FULL (lexical order baseline) 0.346
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.077
- heldout_formulations: FULL [depth given] 0.808
- heldout_formulations: FULL [depth and negation given] 0.808
- heldout_formulations: FULL [presence not decided] 0.846
- heldout_formulations: role object [presence not decided] 0.846
- heldout_formulations: role name [presence not decided] 0.846
- heldout_formulations: role relation [presence not decided] 0.846
- heldout_formulations: role landmark [presence not decided] 0.846
- heldout_formulations: heads FULL (model) [presence not decided] 0.846
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.000
- heldout_formulations: role object [pooled midpoint (comparison)] 0.000
- heldout_formulations: role name [pooled midpoint (comparison)] 0.308
- heldout_formulations: role relation [pooled midpoint (comparison)] 0.192
- heldout_formulations: role landmark [pooled midpoint (comparison)] 0.308
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: occupancy: unknown filler 0.867
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.150
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.300
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence name: present read present [pooled midpoint (comparison)] 0.000
- train (sample): FULL 0.783
- train (sample): presence object: share of 'present' readings that abstain 0.056
- train (sample): presence object: share of true 'present' readings that abstain 0.056
- train (sample): presence name: share of 'present' readings that abstain 0.013
- train (sample): presence name: share of true 'present' readings that abstain 0.014
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): structure (depth, negation) 0.813
- train (sample): predicate (surface lemma) 0.813
- train (sample): event type (synonym table) 0.813
- train (sample): role object 0.810
- train (sample): head object 0.810
- train (sample): occupancy: known filler 0.823
- train (sample): role name 0.857
- train (sample): head name 0.857
- train (sample): role relation 0.853
- train (sample): head relation 0.853
- train (sample): role landmark 0.847
- train (sample): head landmark 0.847
- train (sample): heads FULL (model) 0.783
- train (sample): heads FULL (lexical order baseline) 0.393
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.887
- train (sample): FULL [depth given] 0.783
- train (sample): FULL [depth and negation given] 0.783
- train (sample): presence size: share of 'present' readings that abstain 0.008
- train (sample): presence size: share of true 'present' readings that abstain 0.008
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.061
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.061
- train (sample): presence name: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `could you draw a SIZE COLOR SHAPE named NAME in POS NAME and NAME` FULL 0.000 (n 1)
- heldout_formulations: `a COLOR SHAPE for the NAME , call it NAME , and move it POS the NAME` FULL 0.000 (n 1)
- heldout_formulations: `a COLOR SHAPE called NAME that move POS the NAME` FULL 0.000 (n 1)
- heldout_formulations: `connect a SIZE COLOR SHAPE named NAME POS NAME` FULL 0.000 (n 1)
- heldout_formulations: `spin out a COLOR SHAPE named NAME POS NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role quantity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.808 | 0.808 | 0.846 | 0.962 | 0.846 | 1.000 | 0.808 | 0.846 | 1.000 | 1.000 | 1.000 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.000 | 0.000 | 0.000 | 0.962 | 0.308 | 1.000 | 0.192 | 0.308 | 1.000 | 1.000 | 1.000 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.846 | 0.846 | 0.846 | 0.962 | 0.846 | 1.000 | 0.846 | 0.846 | 1.000 | 1.000 | 1.000 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | — | — | 0.045 (— / 0.045) |
| heldout_formulations | object | comparison: pooled midpoint | 0.000 | — | — |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.950 | 1.000 | 0.975 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.150 | 1.000 | 0.575 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.300 | 1.000 | 0.650 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | — | 1.000 | — |  |
| heldout_formulations | region | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | quantity | product: fitted | — | 1.000 | — |  |
| heldout_formulations | quantity | comparison: pooled midpoint | — | 1.000 | — |  |
| train (sample) | object | product: fitted | 0.992 | 1.000 | 0.996 | 0.056 (— / 0.056) |
| train (sample) | size | product: fitted | 0.992 | 1.000 | 0.996 | 0.008 (— / 0.008) |
| train (sample) | name | product: fitted | 1.000 | 0.990 | 0.995 | 0.013 (0.000 / 0.014) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.982 | 1.000 | 0.991 | 0.000 (— / 0.000) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.061 (— / 0.061) |
| train (sample) | region | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
