# REPORT — world `create_w`, legend sha256:1bd5099c29d0… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
922 annotated sentences from 2 files; provenance: {'llm': 922}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_create_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 35 sentences
- heldout_formulations: 27 sentences
- train: 860 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
8602 tokens in the examples; 376 with no kind in the lexicon (share 0.044), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit f9dc7da. Memory curve: runs/micro_create_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.436 [rule: fit; pooled midpoint 0.731 (comparison)] (present 0.976, n 420 / absent 0.487, n 15)
- attr_presence:object: threshold 0.738 [rule: fit; pooled midpoint 0.569 (comparison)] (present 1.023, n 331 / absent 0.115, n 89)
- presence:size: threshold 0.477 [rule: fit; pooled midpoint 0.604 (comparison)] (present 1.107, n 186 / absent 0.102, n 249)
- presence:name: threshold 0.481 [rule: fit; pooled midpoint 0.659 (comparison)] (present 1.077, n 281 / absent 0.242, n 154)
- presence:text: threshold 0.471 [rule: fit; pooled midpoint 0.534 (comparison)] (present 0.860, n 90 / absent 0.209, n 345)
- presence:relation: threshold 0.644 [rule: fit; pooled midpoint 0.681 (comparison)] (present 1.233, n 371 / absent 0.129, n 64)
- presence:landmark: threshold 0.465 [rule: fit; pooled midpoint 0.662 (comparison)] (present 1.158, n 368 / absent 0.166, n 67)
- presence:landmark2: threshold 0.290 [rule: fit; pooled midpoint 0.350 (comparison)] (present 0.487, n 63 / absent 0.214, n 372)
- presence:region: threshold 0.371 [rule: fit; pooled midpoint 0.434 (comparison)] (present 0.754, n 20 / absent 0.114, n 415)
- presence:quantity: threshold 0.672 [rule: fit; pooled midpoint 0.556 (comparison)] (present 1.020, n 45 / absent 0.092, n 390)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.062, size 0.143, name 0.001, text 0.001, relation 0.067, landmark 0.001, landmark2 0.001, region 0.067, quantity 0.200, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 27 of 27)
| axis | accuracy |
|---|---|
| FULL | 0.815 |
| FULL [depth given] | 0.815 |
| FULL [depth and negation given] | 0.815 |
| FULL [presence not decided] | 0.778 |
| FULL [pooled midpoint (comparison)] | 0.852 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence size: absent read absent | 1.000 |
| presence name: present read present | 0.944 |
| presence name: share of 'present' readings that abstain | 0.059 |
| presence name: share of true 'present' readings that abstain | 0.059 |
| presence text: absent read absent | 1.000 |
| presence relation: present read present | 0.917 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.958 |
| presence landmark: share of 'present' readings that abstain | 0.043 |
| presence landmark: share of true 'present' readings that abstain | 0.043 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| structure (depth, negation) | 0.926 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.926 |
| event type (synonym table) | 0.926 |
| role object | 0.889 |
| head object | 0.926 |
| lexical order head object | 1.000 |
| lexical bag head object | 1.000 |
| occupancy: known filler | 0.920 |
| role size | 0.963 |
| head size | 0.963 |
| lexical order head size | 0.519 |
| lexical bag head size | 0.741 |
| occupancy: not given | 1.000 |
| role name | 0.889 |
| head name | 0.889 |
| lexical order head name | 0.741 |
| lexical bag head name | 0.778 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.815 |
| lexical bag head text | 0.889 |
| role relation | 0.889 |
| head relation | 0.889 |
| lexical order head relation | 0.926 |
| lexical bag head relation | 0.926 |
| role landmark | 0.926 |
| head landmark | 0.926 |
| lexical order head landmark | 0.852 |
| lexical bag head landmark | 0.296 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.963 |
| lexical bag head landmark2 | 0.852 |
| role region | 0.963 |
| head region | 0.963 |
| lexical order head region | 0.963 |
| lexical bag head region | 0.963 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.926 |
| lexical bag head quantity | 0.963 |
| heads FULL (model) | 0.852 |
| heads FULL (lexical order baseline) | 0.481 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.111 |
| role object [presence not decided] | 0.889 |
| role size [presence not decided] | 0.963 |
| role name [presence not decided] | 0.926 |
| role text [presence not decided] | 1.000 |
| role relation [presence not decided] | 0.963 |
| role landmark [presence not decided] | 0.963 |
| role landmark2 [presence not decided] | 0.926 |
| role region [presence not decided] | 0.889 |
| role quantity [presence not decided] | 1.000 |
| heads FULL (model) [presence not decided] | 0.815 |
| role object [pooled midpoint (comparison)] | 0.889 |
| role size [pooled midpoint (comparison)] | 0.963 |
| role name [pooled midpoint (comparison)] | 0.852 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.889 |
| role landmark [pooled midpoint (comparison)] | 0.889 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.963 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.852 |
| presence object: present read present [pooled midpoint (comparison)] | 0.960 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: present read present [pooled midpoint (comparison)] | 0.889 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.917 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.917 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| occupancy: unknown filler | 0.844 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent | 1.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |

residual mean 0.171; status {'ok': 24, 'unknown-event': 2, 'abstain': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.926 | 0.413 / 0.331 | 1.00 | 0.074 | 0.000 / 0.000 |
| role object | 0.889 | 0.352 / 0.282 | 1.00 | 0.111 | 0.000 / 0.000 |
| roles (pooled) | 0.891 | 0.309 / 0.207 | 0.95 | 0.076 | 0.017 / 0.034 |
| role name | 0.850 | 0.318 / 0.213 | 0.90 | 0.100 | 0.050 / 0.050 |
| role relation | 0.880 | 0.268 / 0.143 | 0.92 | 0.040 | 0.000 / 0.080 |
| role landmark | 0.920 | 0.296 / 0.140 | 0.92 | 0.040 | 0.040 / 0.040 |
| role size | 0.923 | 0.337 / 0.243 | 1.00 | 0.077 | 0.000 / 0.000 |
| role region | 0.000 | 0.276 / 0.276 | 1.00 | 1.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.319 / 0.310 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.281 / 0.233 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.141 / 0.141 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 860)
| axis | accuracy |
|---|---|
| FULL | 0.913 |
| FULL [depth given] | 0.913 |
| FULL [depth and negation given] | 0.913 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.004 |
| presence object: share of true 'present' readings that abstain | 0.004 |
| presence size: absent read absent | 1.000 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.006 |
| presence name: share of true 'present' readings that abstain | 0.006 |
| presence text: absent read absent | 0.995 |
| presence relation: present read present | 0.992 |
| presence relation: share of 'present' readings that abstain | 0.004 |
| presence relation: share of true 'present' readings that abstain | 0.004 |
| presence landmark: present read present | 0.980 |
| presence landmark: share of 'present' readings that abstain | 0.004 |
| presence landmark: share of true 'present' readings that abstain | 0.004 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| structure (depth, negation) | 0.953 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.953 |
| event type (synonym table) | 0.953 |
| role object | 0.960 |
| head object | 0.963 |
| lexical order head object | 0.997 |
| lexical bag head object | 1.000 |
| occupancy: known filler | 0.959 |
| role size | 0.993 |
| head size | 0.993 |
| lexical order head size | 0.550 |
| lexical bag head size | 0.977 |
| occupancy: not given | 0.999 |
| role name | 0.957 |
| head name | 0.957 |
| lexical order head name | 0.603 |
| lexical bag head name | 0.990 |
| role text | 0.993 |
| head text | 0.993 |
| lexical order head text | 0.727 |
| lexical bag head text | 1.000 |
| role relation | 0.960 |
| head relation | 0.960 |
| lexical order head relation | 0.947 |
| lexical bag head relation | 0.993 |
| role landmark | 0.953 |
| head landmark | 0.953 |
| lexical order head landmark | 0.850 |
| lexical bag head landmark | 0.937 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.860 |
| lexical bag head landmark2 | 0.880 |
| role region | 0.997 |
| head region | 0.997 |
| lexical order head region | 0.973 |
| lexical bag head region | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.917 |
| lexical bag head quantity | 1.000 |
| heads FULL (model) | 0.917 |
| heads FULL (lexical order baseline) | 0.363 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.797 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 1.000 |
| presence name: absent read absent | 0.992 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.095 |
| presence landmark2: share of true 'present' readings that abstain | 0.095 |
| presence text: present read present | 0.988 |
| presence text: share of 'present' readings that abstain | 0.024 |
| presence text: share of true 'present' readings that abstain | 0.012 |
| presence text: share of FALSE 'present' readings that abstain | 1.000 |
| presence name: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.115; status {'ok': 276, 'unknown-event': 14, 'abstain': 10}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.953 | 0.415 / 0.363 | 0.98 | 0.023 | 0.000 / 0.023 |
| role object | 0.958 | 0.381 / 0.335 | 1.00 | 0.038 | 0.000 / 0.003 |
| roles (pooled) | 0.958 | 0.336 / 0.201 | 0.99 | 0.035 | 0.006 / 0.008 |
| role name | 0.931 | 0.372 / 0.306 | 0.99 | 0.064 | 0.006 / 0.006 |
| role relation | 0.954 | 0.301 / 0.173 | 0.99 | 0.038 | 0.004 / 0.008 |
| role landmark | 0.946 | 0.325 / 0.187 | 0.98 | 0.035 | 0.004 / 0.019 |
| role size | 0.985 | 0.374 / 0.339 | 1.00 | 0.015 | 0.000 / 0.000 |
| role region | 0.875 | 0.435 / 0.329 | 1.00 | 0.125 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.314 / 0.207 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.148 / 0.062 | 0.90 | 0.000 | 0.095 / 0.000 |
| role text | 0.988 | 0.279 / 0.185 | 0.98 | 0.000 | 0.012 / 0.012 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 VERB=0.88 c1_have=0.76 c13_one=0.75 are=0.59 SHAPE=0.59 c2_now=0.54 NAME=0.47 c3_rules=0.47 TEXT=0.43 it=0.41 c10_three=0.40 c14_uh=0.36 c4_then=0.30 c17_be=0.17 with=0.12 LAYOUT=0.12 ARROW=0.12 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 RECENT=0.12 STYLE=0.12 SUPER=0.12 and=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c24_line=0.12 c25_pixels=0.12 lines=0.12 c18_does=0.10 labeled=0.09 directly=0.09 c6_both=0.08 c8_what's=0.08 c19_goes=0.08 c26_shape=0.07 QUANT=0.07 c15_on=0.05 c27_them=0.03 c12_that=0.02 c23_in=0.02 c11_what=0.02 c9_an=0.01 c7_i=0.01 c16_new=0.01 DIR=0.01 c5_me=0.01 a=0.01 of=0.01 to=0.00 called=0.00 COLOR=0.00 NUM=0.00 the=0.00 SIZE=0.00 unknown=0.00 named=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.815
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of 'present' readings that abstain 0.059
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.059
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.043
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.043
- heldout_formulations: role object 0.889
- heldout_formulations: role name 0.889
- heldout_formulations: head name 0.889
- heldout_formulations: role relation 0.889
- heldout_formulations: head relation 0.889
- heldout_formulations: heads FULL (model) 0.852
- heldout_formulations: heads FULL (lexical order baseline) 0.481
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.111
- heldout_formulations: FULL [depth given] 0.815
- heldout_formulations: FULL [depth and negation given] 0.815
- heldout_formulations: FULL [presence not decided] 0.778
- heldout_formulations: role object [presence not decided] 0.889
- heldout_formulations: role region [presence not decided] 0.889
- heldout_formulations: heads FULL (model) [presence not decided] 0.815
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.852
- heldout_formulations: role object [pooled midpoint (comparison)] 0.889
- heldout_formulations: role name [pooled midpoint (comparison)] 0.852
- heldout_formulations: role relation [pooled midpoint (comparison)] 0.889
- heldout_formulations: role landmark [pooled midpoint (comparison)] 0.889
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.852
- heldout_formulations: presence name: present read present [pooled midpoint (comparison)] 0.889
- heldout_formulations: occupancy: unknown filler 0.844
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.004
- train (sample): presence object: share of true 'present' readings that abstain 0.004
- train (sample): presence name: share of 'present' readings that abstain 0.006
- train (sample): presence name: share of true 'present' readings that abstain 0.006
- train (sample): presence relation: share of 'present' readings that abstain 0.004
- train (sample): presence relation: share of true 'present' readings that abstain 0.004
- train (sample): presence landmark: share of 'present' readings that abstain 0.004
- train (sample): presence landmark: share of true 'present' readings that abstain 0.004
- train (sample): heads FULL (lexical order baseline) 0.363
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.797
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.095
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.095
- train (sample): presence text: share of 'present' readings that abstain 0.024
- train (sample): presence text: share of true 'present' readings that abstain 0.012
- train (sample): presence name: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `draw a new SHAPE with the name NAME between put it to POS of NAME` FULL 0.000 (n 1)
- heldout_formulations: `a new shape : SIZE COLOR SHAPE , named NAME , at the POS` FULL 0.000 (n 1)
- heldout_formulations: `draw a SIZE COLOR SHAPE called NAME , then place it to POS of NAME` FULL 0.000 (n 1)
- heldout_formulations: `draw a SHAPE named NAME POS NAME , coloured COLOR` FULL 0.000 (n 1)
- heldout_formulations: `spin out a COLOR SHAPE named NAME POS NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role quantity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.852 | 0.815 | 0.889 | 0.963 | 0.889 | 1.000 | 0.889 | 0.926 | 1.000 | 0.963 | 1.000 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.852 | 0.852 | 0.889 | 0.963 | 0.852 | 1.000 | 0.889 | 0.889 | 1.000 | 0.963 | 1.000 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.815 | 0.778 | 0.889 | 0.963 | 0.926 | 1.000 | 0.963 | 0.963 | 0.926 | 0.889 | 1.000 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | — | — | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.960 | — | — |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 0.944 | 1.000 | 0.972 | 0.059 (— / 0.059) |
| heldout_formulations | name | comparison: pooled midpoint | 0.889 | 1.000 | 0.944 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.917 | 1.000 | 0.958 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.917 | 1.000 | 0.958 |  |
| heldout_formulations | landmark | product: fitted | 0.958 | 1.000 | 0.979 | 0.043 (— / 0.043) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.917 | 1.000 | 0.958 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | — | 1.000 | — |  |
| heldout_formulations | region | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.004 (— / 0.004) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | name | product: fitted | 1.000 | 0.992 | 0.996 | 0.006 (0.000 / 0.006) |
| train (sample) | text | product: fitted | 0.988 | 0.995 | 0.991 | 0.024 (1.000 / 0.012) |
| train (sample) | relation | product: fitted | 0.992 | 1.000 | 0.996 | 0.004 (— / 0.004) |
| train (sample) | landmark | product: fitted | 0.980 | 1.000 | 0.990 | 0.004 (— / 0.004) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.095 (— / 0.095) |
| train (sample) | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
