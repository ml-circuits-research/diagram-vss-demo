# REPORT — world `graphq7`, legend sha256:66d7f4184a90… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
2729 annotated sentences from 2 files; provenance: {'llm': 2729}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_graphq7_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 138 sentences
- heldout_formulations: 131 sentences
- train: 2460 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
13017 tokens in the examples; 220 with no kind in the lexicon (share 0.017), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 9aaacfc. Memory curve: runs/micro_graphq7_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.444 [rule: fit; pooled midpoint 0.673 (comparison)] (present 1.309, n 331 / absent 0.037, n 207)
- presence:shape: threshold 0.236 [rule: fit; pooled midpoint 0.473 (comparison)] (present 0.909, n 31 / absent 0.037, n 507)
- presence:color: threshold 0.810 [rule: fit; pooled midpoint 0.779 (comparison)] (present 1.495, n 31 / absent 0.063, n 507)
- presence:size: threshold 0.421 [rule: fit; pooled midpoint 0.289 (comparison)] (present 0.554, n 20 / absent 0.024, n 560)
- presence:relation: threshold 0.622 [rule: fit; pooled midpoint 0.569 (comparison)] (present 1.089, n 77 / absent 0.050, n 461)
- presence:landmark: threshold 0.385 [rule: fit; pooled midpoint 0.614 (comparison)] (present 1.143, n 257 / absent 0.085, n 281)
- presence:landmark2: threshold 0.370 [rule: fit; pooled midpoint 0.396 (comparison)] (present 0.719, n 29 / absent 0.073, n 551)
- presence:region: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 578)
- presence:source: threshold 0.120 [rule: fit; pooled midpoint 0.894 (comparison)] (present 1.757, n 134 / absent 0.031, n 404)
- presence:target: threshold 0.075 [rule: fit; pooled midpoint 0.381 (comparison)] (present 0.712, n 105 / absent 0.049, n 433)
- presence:notcolor: threshold 0.685 [rule: fit; pooled midpoint 0.392 (comparison)] (present 0.728, n 5 / absent 0.056, n 533)
- presence:comparison: threshold 0.694 [rule: fit; pooled midpoint 0.473 (comparison)] (present 0.914, n 76 / absent 0.031, n 462)
- attr_presence:object: threshold 0.368 [rule: fit; pooled midpoint 0.390 (comparison)] (present 0.679, n 15 / absent 0.101, n 313)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, source 0.000, target 0.000, notcolor 0.056, comparison 0.143, predicate 0.167

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 131 of 131)
| axis | accuracy |
|---|---|
| FULL | 0.885 |
| FULL [pooled midpoint (comparison)] | 0.542 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: present read present | 0.946 |
| presence landmark: share of 'present' readings that abstain | 0.038 |
| presence landmark: share of true 'present' readings that abstain | 0.038 |
| presence landmark2: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| presence comparison: present read present | 0.875 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| structure (depth, negation) | 0.969 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.947 |
| event type (synonym table) | 0.947 |
| role object | 0.977 |
| head object | 0.977 |
| lexical order head object | 0.710 |
| lexical bag head object | 0.748 |
| occupancy: known filler | 0.928 |
| role shape | 0.992 |
| head shape | 0.992 |
| lexical order head shape | 0.962 |
| lexical bag head shape | 0.962 |
| occupancy: not given | 0.999 |
| role color | 0.985 |
| head color | 0.985 |
| lexical order head color | 0.924 |
| lexical bag head color | 0.924 |
| role size | 0.992 |
| head size | 0.992 |
| lexical order head size | 0.992 |
| lexical bag head size | 0.992 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.893 |
| lexical bag head relation | 0.939 |
| role landmark | 0.977 |
| head landmark | 0.977 |
| lexical order head landmark | 0.573 |
| lexical bag head landmark | 0.672 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.977 |
| lexical bag head landmark2 | 0.992 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 1.000 |
| lexical bag head region | 1.000 |
| role source | 0.992 |
| head source | 0.992 |
| lexical order head source | 0.725 |
| lexical bag head source | 0.939 |
| role target | 0.985 |
| head target | 0.985 |
| lexical order head target | 0.763 |
| lexical bag head target | 0.893 |
| role notcolor | 1.000 |
| head notcolor | 1.000 |
| lexical order head notcolor | 1.000 |
| lexical bag head notcolor | 1.000 |
| role comparison | 0.977 |
| head comparison | 0.977 |
| lexical order head comparison | 0.878 |
| lexical bag head comparison | 0.931 |
| heads FULL (model) | 0.893 |
| heads FULL (lexical order baseline) | 0.160 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.382 |
| role object [pooled midpoint (comparison)] | 0.908 |
| role shape [pooled midpoint (comparison)] | 0.985 |
| role color [pooled midpoint (comparison)] | 0.985 |
| role size [pooled midpoint (comparison)] | 0.992 |
| role relation [pooled midpoint (comparison)] | 1.000 |
| role landmark [pooled midpoint (comparison)] | 0.817 |
| role landmark2 [pooled midpoint (comparison)] | 0.985 |
| role region [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.824 |
| role target [pooled midpoint (comparison)] | 0.855 |
| role notcolor [pooled midpoint (comparison)] | 1.000 |
| role comparison [pooled midpoint (comparison)] | 0.985 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.550 |
| presence object: present read present [pooled midpoint (comparison)] | 0.883 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.571 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence notcolor: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: present read present [pooled midpoint (comparison)] | 0.938 |
| presence color: present read present | 0.889 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence landmark: absent read absent | 1.000 |
| presence comparison: absent read absent | 0.991 |
| presence color: present read present [pooled midpoint (comparison)] | 0.889 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 0.991 |
| presence object: absent read absent | 1.000 |
| presence source: present read present | 1.000 |
| presence source: share of 'present' readings that abstain | 0.000 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.968 |
| presence target: share of 'present' readings that abstain | 0.067 |
| presence target: share of true 'present' readings that abstain | 0.067 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.361 |
| presence target: present read present [pooled midpoint (comparison)] | 0.387 |
| occupancy: unknown filler | 0.988 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present | 0.000 |
| presence comparison: share of FALSE 'present' readings that abstain | 0.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.000 |
| presence shape: present read present | 0.800 |
| presence shape: share of 'present' readings that abstain | 0.250 |
| presence shape: share of true 'present' readings that abstain | 0.250 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.600 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.667 |
| presence landmark2: share of true 'present' readings that abstain | 0.667 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.333 |

residual mean 0.091; status {'ok': 118, 'unknown-event': 4, 'abstain': 9}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.947 | 0.559 / 0.380 | 0.98 | 0.031 | 0.000 / 0.023 |
| role object | 0.963 | 0.381 / 0.207 | 0.99 | 0.025 | 0.000 / 0.013 |
| roles (pooled) | 0.940 | 0.331 / 0.101 | 0.93 | 0.016 | 0.024 / 0.044 |
| role landmark | 0.946 | 0.304 / 0.086 | 0.91 | 0.000 | 0.036 / 0.054 |
| role comparison | 0.875 | 0.217 / 0.083 | 0.88 | 0.000 | 0.000 / 0.125 |
| role color | 0.800 | 0.378 / 0.069 | 0.90 | 0.100 | 0.000 / 0.100 |
| role source | 0.972 | 0.368 / 0.215 | 1.00 | 0.028 | 0.000 / 0.000 |
| role target | 0.935 | 0.260 / 0.050 | 0.90 | 0.000 | 0.032 / 0.065 |
| role relation | 1.000 | 0.378 / 0.304 | 1.00 | 0.000 | 0.000 / 0.000 |
| role size | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role shape | 0.800 | 0.331 / 0.009 | 0.60 | 0.000 | 0.200 / 0.200 |
| role landmark2 | 1.000 | 0.105 / 0.006 | 0.33 | 0.000 | 0.667 / 0.000 |

### train (sample) — catalog candidates (n = 150 of 2460)
| axis | accuracy |
|---|---|
| FULL | 0.900 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.987 |
| presence landmark: share of 'present' readings that abstain | 0.027 |
| presence landmark: share of true 'present' readings that abstain | 0.027 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.980 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.927 |
| event type (synonym table) | 0.927 |
| role object | 0.980 |
| head object | 0.980 |
| lexical order head object | 0.707 |
| lexical bag head object | 0.953 |
| occupancy: known filler | 0.967 |
| role shape | 0.993 |
| head shape | 0.993 |
| lexical order head shape | 0.947 |
| lexical bag head shape | 0.960 |
| occupancy: not given | 1.000 |
| role color | 0.993 |
| head color | 0.993 |
| lexical order head color | 0.973 |
| lexical bag head color | 0.980 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.993 |
| lexical bag head size | 0.993 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.840 |
| lexical bag head relation | 0.907 |
| role landmark | 0.993 |
| head landmark | 0.993 |
| lexical order head landmark | 0.500 |
| lexical bag head landmark | 0.913 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.973 |
| lexical bag head landmark2 | 0.993 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 1.000 |
| lexical bag head region | 1.000 |
| role source | 0.987 |
| head source | 0.987 |
| lexical order head source | 0.720 |
| lexical bag head source | 1.000 |
| role target | 0.980 |
| head target | 0.980 |
| lexical order head target | 0.800 |
| lexical bag head target | 0.993 |
| role notcolor | 1.000 |
| head notcolor | 1.000 |
| lexical order head notcolor | 0.993 |
| lexical bag head notcolor | 1.000 |
| role comparison | 0.993 |
| head comparison | 0.993 |
| lexical order head comparison | 0.867 |
| lexical bag head comparison | 0.960 |
| heads FULL (model) | 0.940 |
| heads FULL (lexical order baseline) | 0.127 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.767 |
| presence relation: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence comparison: present read present | 0.950 |
| presence comparison: share of 'present' readings that abstain | 0.053 |
| presence comparison: share of true 'present' readings that abstain | 0.053 |
| presence object: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence source: present read present | 0.976 |
| presence source: share of 'present' readings that abstain | 0.024 |
| presence source: share of true 'present' readings that abstain | 0.024 |
| presence target: present read present | 0.933 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 0.750 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence notcolor: present read present | 1.000 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |

residual mean 0.075; status {'ok': 141, 'abstain': 6, 'unknown-event': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.927 | 0.564 / 0.400 | 0.98 | 0.053 | 0.000 / 0.020 |
| role object | 0.969 | 0.345 / 0.195 | 0.97 | 0.000 | 0.000 / 0.031 |
| roles (pooled) | 0.961 | 0.351 / 0.150 | 0.95 | 0.003 | 0.010 / 0.036 |
| role relation | 1.000 | 0.356 / 0.162 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark | 0.987 | 0.358 / 0.181 | 0.96 | 0.000 | 0.027 / 0.013 |
| role landmark2 | 1.000 | 0.351 / 0.344 | 1.00 | 0.000 | 0.000 / 0.000 |
| role comparison | 0.950 | 0.204 / 0.091 | 0.90 | 0.000 | 0.050 / 0.050 |
| role size | 1.000 | 0.107 / 0.107 | 1.00 | 0.000 | 0.000 / 0.000 |
| role source | 0.952 | 0.429 / 0.203 | 0.95 | 0.000 | 0.000 / 0.048 |
| role target | 0.900 | 0.315 / 0.095 | 0.93 | 0.033 | 0.000 / 0.067 |
| role color | 0.750 | 0.356 / 0.033 | 0.75 | 0.000 | 0.000 / 0.250 |
| role shape | 0.875 | 0.483 / 0.364 | 0.88 | 0.000 | 0.000 / 0.125 |
| role notcolor | 1.000 | 0.191 / 0.191 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 to=1.00 SIZE=1.00 and=0.99 SHAPE=0.99 c18_does=0.97 c26_shape=0.96 VERB=0.96 c22_from=0.96 c10_three=0.93 COLOR=0.91 c16_new=0.89 directly=0.79 c23_in=0.77 with=0.75 c15_on=0.74 c9_an=0.66 QUANT=0.65 NOTCOLOR=0.64 c6_both=0.61 SUPER=0.55 AXIS=0.53 c12_that=0.51 named=0.49 c4_then=0.47 are=0.46 c8_what's=0.44 c20_arrow=0.39 c24_line=0.36 c11_what=0.36 unknown=0.31 c19_goes=0.31 c13_one=0.29 c5_me=0.29 c17_be=0.29 c14_uh=0.21 c27_them=0.18 c1_have=0.12 ARROW=0.12 DIR=0.12 LAYOUT=0.12 PAIR=0.12 RECENT=0.12 STYLE=0.12 c21_arrowheads=0.12 c25_pixels=0.12 called=0.12 labeled=0.12 lines=0.12 c7_i=0.11 it=0.10 of=0.07 c3_rules=0.06 a=0.01 c2_now=0.00 NAME=0.00 the=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.885
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.038
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.038
- heldout_formulations: presence comparison: present read present 0.875
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: heads FULL (model) 0.893
- heldout_formulations: heads FULL (lexical order baseline) 0.160
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.382
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.542
- heldout_formulations: role landmark [pooled midpoint (comparison)] 0.817
- heldout_formulations: role source [pooled midpoint (comparison)] 0.824
- heldout_formulations: role target [pooled midpoint (comparison)] 0.855
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.550
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.883
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.571
- heldout_formulations: presence color: present read present 0.889
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.889
- heldout_formulations: presence source: share of 'present' readings that abstain 0.000
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of 'present' readings that abstain 0.067
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.067
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.361
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.387
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: present read present 0.000
- heldout_formulations: presence comparison: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence size: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence shape: present read present 0.800
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.250
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.250
- heldout_formulations: presence shape: present read present [pooled midpoint (comparison)] 0.600
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.667
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.667
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.333
- train (sample): presence object: share of 'present' readings that abstain 0.000
- train (sample): presence object: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.027
- train (sample): presence landmark: share of true 'present' readings that abstain 0.027
- train (sample): presence landmark2: share of 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): heads FULL (lexical order baseline) 0.127
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.767
- train (sample): presence comparison: share of 'present' readings that abstain 0.053
- train (sample): presence comparison: share of true 'present' readings that abstain 0.053
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence source: share of 'present' readings that abstain 0.024
- train (sample): presence source: share of true 'present' readings that abstain 0.024
- train (sample): presence target: share of 'present' readings that abstain 0.000
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): presence color: present read present 0.750
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence notcolor: share of 'present' readings that abstain 0.000
- train (sample): presence notcolor: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `is_q NAME SIZE` FULL 0.000 (n 1)
- heldout_formulations: `is there a SHAPE anywhere` FULL 0.000 (n 1)
- heldout_formulations: `is any pillar COLOR` FULL 0.000 (n 1)
- heldout_formulations: `is NAME still connected_q NAME` FULL 0.000 (n 1)
- heldout_formulations: `is_q NAME really COLOR` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role relation | role landmark | role landmark2 | role region | role source | role target | role notcolor | role comparison |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.893 | 0.885 | 0.977 | 0.992 | 0.985 | 0.992 | 1.000 | 0.977 | 1.000 | 1.000 | 0.992 | 0.985 | 1.000 | 0.977 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.550 | 0.542 | 0.908 | 0.985 | 0.985 | 0.992 | 1.000 | 0.817 | 0.985 | 1.000 | 0.824 | 0.855 | 1.000 | 0.985 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.883 | 1.000 | 0.942 |  |
| heldout_formulations | shape | product: fitted | 0.800 | 1.000 | 0.900 | 0.250 (— / 0.250) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.600 | 1.000 | 0.800 |  |
| heldout_formulations | color | product: fitted | 0.889 | 1.000 | 0.944 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.889 | 1.000 | 0.944 |  |
| heldout_formulations | size | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | size | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | landmark | product: fitted | 0.946 | 1.000 | 0.973 | 0.038 (— / 0.038) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.571 | 1.000 | 0.786 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.667 (— / 0.667) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.333 | 1.000 | 0.667 |  |
| heldout_formulations | source | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | source | comparison: pooled midpoint | 0.361 | 1.000 | 0.681 |  |
| heldout_formulations | target | product: fitted | 0.968 | 1.000 | 0.984 | 0.067 (— / 0.067) |
| heldout_formulations | target | comparison: pooled midpoint | 0.387 | 1.000 | 0.694 |  |
| heldout_formulations | notcolor | product: fitted | — | 1.000 | — |  |
| heldout_formulations | notcolor | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | comparison | product: fitted | 0.875 | 0.991 | 0.933 | 0.000 (0.000 / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 0.938 | 0.991 | 0.964 |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.750 | 1.000 | 0.875 | 0.000 (— / 0.000) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.987 | 1.000 | 0.993 | 0.027 (— / 0.027) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.976 | 1.000 | 0.988 | 0.024 (— / 0.024) |
| train (sample) | target | product: fitted | 0.933 | 1.000 | 0.967 | 0.000 (— / 0.000) |
| train (sample) | notcolor | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 0.950 | 1.000 | 0.975 | 0.053 (— / 0.053) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
