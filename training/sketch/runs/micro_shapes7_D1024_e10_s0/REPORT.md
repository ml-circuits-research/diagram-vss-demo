# REPORT — world `shapes7`, legend sha256:35edd5e23f74… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
6334 annotated sentences from 2 files; provenance: {'llm': 6334}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_shapes7_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 281 sentences
- heldout_formulations: 273 sentences
- train: 5780 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
34634 tokens in the examples; 1330 with no kind in the lexicon (share 0.038), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit cdb8201. Memory curve: runs/micro_shapes7_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.104 [rule: fit; pooled midpoint 0.261 (comparison)] (present 0.522, n 27 / absent 0.000, n 1621563)
- presence:object: threshold 0.827 [rule: fit; pooled midpoint 1.863 (comparison)] (present 3.075, n 648 / absent 0.651, n 33)
- attr_presence:object: threshold 0.289 [rule: fit; pooled midpoint 0.450 (comparison)] (present 0.819, n 66 / absent 0.081, n 582)
- det_presence:object: threshold 0.360 [rule: fit; pooled midpoint 0.472 (comparison)] (present 0.902, n 8 / absent 0.042, n 640)
- presence:shape: threshold 0.485 [rule: fit; pooled midpoint 0.714 (comparison)] (present 1.292, n 197 / absent 0.136, n 484)
- presence:color: threshold 0.487 [rule: fit; pooled midpoint 1.253 (comparison)] (present 2.417, n 455 / absent 0.088, n 226)
- presence:size: threshold 0.440 [rule: fit; pooled midpoint 0.750 (comparison)] (present 1.330, n 272 / absent 0.170, n 409)
- presence:name: threshold 0.383 [rule: fit; pooled midpoint 0.388 (comparison)] (present 0.738, n 54 / absent 0.038, n 627)
- presence:text: threshold 0.189 [rule: fit; pooled midpoint 0.346 (comparison)] (present 0.651, n 16 / absent 0.042, n 665)
- presence:relation: threshold 0.560 [rule: fit; pooled midpoint 0.492 (comparison)] (present 0.947, n 81 / absent 0.036, n 600)
- presence:landmark: threshold 0.230 [rule: fit; pooled midpoint 0.442 (comparison)] (present 0.807, n 82 / absent 0.076, n 599)
- presence:landmark2: threshold 0.395 [rule: fit; pooled midpoint 0.268 (comparison)] (present 0.450, n 9 / absent 0.086, n 672)
- presence:region: threshold 0.251 [rule: fit; pooled midpoint 0.363 (comparison)] (present 0.704, n 6 / absent 0.021, n 675)
- presence:quantity: threshold 0.709 [rule: fit; pooled midpoint 0.376 (comparison)] (present 0.736, n 7 / absent 0.016, n 674)
- presence:members: threshold 0.347 [rule: fit; pooled midpoint 0.612 (comparison)] (present 0.870, n 13 / absent 0.355, n 668)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, quantity 0.200, members 0.000, predicate 0.111

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 273)
| axis | accuracy |
|---|---|
| FULL | 0.593 |
| FULL [pooled midpoint (comparison)] | 0.020 |
| presence object: present read present | 0.776 |
| presence object: share of 'present' readings that abstain | 0.066 |
| presence object: share of true 'present' readings that abstain | 0.067 |
| presence shape: absent read absent | 0.987 |
| presence color: present read present | 0.976 |
| presence color: share of 'present' readings that abstain | 0.024 |
| presence color: share of true 'present' readings that abstain | 0.024 |
| presence size: absent read absent | 0.986 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 0.992 |
| structure (depth, negation) | 0.833 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.987 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.800 |
| event type (synonym table) | 0.800 |
| role object | 0.660 |
| head object | 0.660 |
| lexical order head object | 0.927 |
| lexical bag head object | 0.700 |
| occupancy: known filler | 0.791 |
| role shape | 0.967 |
| head shape | 0.967 |
| lexical order head shape | 0.660 |
| lexical bag head shape | 0.920 |
| occupancy: not given | 0.997 |
| role color | 0.860 |
| head color | 0.860 |
| lexical order head color | 0.880 |
| lexical bag head color | 0.947 |
| role size | 0.953 |
| head size | 0.953 |
| lexical order head size | 0.613 |
| lexical bag head size | 0.860 |
| role name | 0.993 |
| head name | 0.993 |
| lexical order head name | 0.900 |
| lexical bag head name | 0.953 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.987 |
| lexical bag head text | 0.993 |
| role relation | 0.993 |
| head relation | 0.993 |
| lexical order head relation | 0.887 |
| lexical bag head relation | 0.947 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.887 |
| lexical bag head landmark | 0.887 |
| role landmark2 | 0.980 |
| head landmark2 | 0.980 |
| lexical order head landmark2 | 0.973 |
| lexical bag head landmark2 | 0.980 |
| role region | 0.993 |
| head region | 0.993 |
| lexical order head region | 0.993 |
| lexical bag head region | 0.993 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.993 |
| lexical bag head quantity | 0.993 |
| role members | 0.973 |
| head members | 0.973 |
| lexical order head members | 0.980 |
| lexical bag head members | 0.980 |
| heads FULL (model) | 0.613 |
| heads FULL (lexical order baseline) | 0.373 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.560 |
| role object [pooled midpoint (comparison)] | 0.087 |
| role shape [pooled midpoint (comparison)] | 0.940 |
| role color [pooled midpoint (comparison)] | 0.427 |
| role size [pooled midpoint (comparison)] | 0.927 |
| role name [pooled midpoint (comparison)] | 0.993 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.987 |
| role landmark [pooled midpoint (comparison)] | 0.987 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.993 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.980 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.033 |
| presence object: present read present [pooled midpoint (comparison)] | 0.017 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 0.987 |
| presence color: present read present [pooled midpoint (comparison)] | 0.214 |
| presence size: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 0.991 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 0.981 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.906 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.021 |
| presence shape: share of true 'present' readings that abstain | 0.021 |
| occupancy: unknown filler | 0.776 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.915 |
| presence relation: present read present | 0.941 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.250 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.941 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.882 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.071 |
| presence name: share of true 'present' readings that abstain | 0.071 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 1.000 |
| presence quantity: share of true 'present' readings that abstain | 1.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 0.889 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 0.667 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.333 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence shape: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.306; status {'ok': 113, 'unknown-event': 22, 'abstain': 12, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.800 | 0.415 / 0.019 | 0.85 | 0.053 | 0.000 / 0.147 |
| role object | 0.640 | 0.246 / 0.000 | 0.74 | 0.144 | 0.043 / 0.216 |
| roles (pooled) | 0.782 | 0.329 / 0.000 | 0.85 | 0.095 | 0.027 / 0.124 |
| role color | 0.798 | 0.410 / 0.000 | 0.86 | 0.077 | 0.019 / 0.125 |
| role size | 0.897 | 0.393 / 0.253 | 0.95 | 0.052 | 0.000 / 0.052 |
| role shape | 0.922 | 0.387 / 0.258 | 0.96 | 0.059 | 0.020 / 0.020 |
| role relation | 0.941 | 0.281 / 0.084 | 0.94 | 0.000 | 0.000 / 0.059 |
| role landmark | 1.000 | 0.288 / 0.173 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 0.250 | 0.020 / 0.000 | 0.25 | 0.000 | 0.000 / 0.750 |
| role name | 0.933 | 0.272 / 0.195 | 0.93 | 0.067 | 0.067 / 0.000 |
| role region | 0.000 | 0.262 / 0.262 | 1.00 | 1.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.030 / 0.030 | 0.00 | 0.000 | 1.000 / 0.000 |
| role members | 0.000 | 0.410 / 0.156 | 1.00 | 1.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.320 / 0.286 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 150 of 5780)
| axis | accuracy |
|---|---|
| FULL | 0.767 |
| presence object: present read present | 0.883 |
| presence object: share of 'present' readings that abstain | 0.071 |
| presence object: share of true 'present' readings that abstain | 0.071 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.979 |
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
| role object | 0.793 |
| head object | 0.800 |
| lexical order head object | 0.967 |
| lexical bag head object | 0.940 |
| occupancy: known filler | 0.868 |
| role shape | 0.967 |
| head shape | 0.967 |
| lexical order head shape | 0.660 |
| lexical bag head shape | 0.973 |
| occupancy: not given | 0.999 |
| role color | 0.913 |
| head color | 0.913 |
| lexical order head color | 0.900 |
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
| role landmark2 | 0.993 |
| head landmark2 | 0.993 |
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
| heads FULL (model) | 0.787 |
| heads FULL (lexical order baseline) | 0.367 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.747 |
| presence size: absent read absent | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.917 |
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
| presence color: share of FALSE 'present' readings that abstain | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.000 |

residual mean 0.197; status {'ok': 125, 'abstain': 9, 'unknown-event': 16}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.873 | 0.445 / 0.035 | 0.89 | 0.020 | 0.000 / 0.107 |
| role object | 0.783 | 0.260 / 0.000 | 0.84 | 0.112 | 0.056 / 0.105 |
| roles (pooled) | 0.864 | 0.372 / 0.084 | 0.92 | 0.081 | 0.023 / 0.056 |
| role size | 0.968 | 0.451 / 0.373 | 0.98 | 0.016 | 0.000 / 0.016 |
| role color | 0.878 | 0.487 / 0.379 | 0.97 | 0.092 | 0.000 / 0.031 |
| role relation | 0.917 | 0.317 / 0.216 | 0.92 | 0.000 | 0.000 / 0.083 |
| role landmark | 0.917 | 0.348 / 0.174 | 0.92 | 0.000 | 0.000 / 0.083 |
| role members | 0.667 | 0.118 / 0.080 | 1.00 | 0.333 | 0.000 / 0.000 |
| role shape | 0.902 | 0.423 / 0.330 | 0.98 | 0.098 | 0.020 / 0.000 |
| role quantity | 1.000 | 0.285 / 0.285 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 1.000 | 0.342 / 0.295 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 1.000 | 0.254 / 0.254 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.282 / 0.253 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 VERB=0.95 NUM=0.84 c6_both=0.78 c4_then=0.78 RECENT=0.66 directly=0.65 c27_them=0.62 NAME=0.61 are=0.60 ARROW=0.58 it=0.55 QUANT=0.54 SUPER=0.48 SIZE=0.47 TEXT=0.47 the=0.41 c19_goes=0.37 c18_does=0.29 c2_now=0.29 COLOR=0.27 c3_rules=0.24 c22_from=0.23 c23_in=0.20 LAYOUT=0.19 with=0.15 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 STYLE=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 lines=0.12 c8_what's=0.08 c26_shape=0.08 c12_that=0.02 c13_one=0.00 DIR=0.00 c11_what=0.00 c10_three=0.00 c5_me=0.00 c17_be=0.00 c9_an=0.00 c15_on=0.00 c14_uh=0.00 c16_new=0.00 c7_i=0.00 c1_have=0.00 of=0.00 to=0.00 and=0.00 a=0.00 unknown=0.00 named=0.00 SHAPE=0.00 labeled=0.00 called=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.593
- heldout_formulations: presence object: present read present 0.776
- heldout_formulations: presence object: share of 'present' readings that abstain 0.066
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.067
- heldout_formulations: presence color: share of 'present' readings that abstain 0.024
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.024
- heldout_formulations: structure (depth, negation) 0.833
- heldout_formulations: predicate (surface lemma) 0.800
- heldout_formulations: event type (synonym table) 0.800
- heldout_formulations: role object 0.660
- heldout_formulations: head object 0.660
- heldout_formulations: occupancy: known filler 0.791
- heldout_formulations: role color 0.860
- heldout_formulations: head color 0.860
- heldout_formulations: heads FULL (model) 0.613
- heldout_formulations: heads FULL (lexical order baseline) 0.373
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.560
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.020
- heldout_formulations: role object [pooled midpoint (comparison)] 0.087
- heldout_formulations: role color [pooled midpoint (comparison)] 0.427
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.033
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.017
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.214
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.021
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.021
- heldout_formulations: occupancy: unknown filler 0.776
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: present read present 0.250
- heldout_formulations: presence members: share of 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.882
- heldout_formulations: presence name: share of 'present' readings that abstain 0.071
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.071
- heldout_formulations: presence object: absent read absent 0.889
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.000
- heldout_formulations: set members: first gold member in the decoded set 0.667
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.333
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.767
- train (sample): presence object: present read present 0.883
- train (sample): presence object: share of 'present' readings that abstain 0.071
- train (sample): presence object: share of true 'present' readings that abstain 0.071
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): structure (depth, negation) 0.893
- train (sample): predicate (surface lemma) 0.873
- train (sample): event type (synonym table) 0.873
- train (sample): role object 0.793
- train (sample): head object 0.800
- train (sample): occupancy: known filler 0.868
- train (sample): heads FULL (model) 0.787
- train (sample): heads FULL (lexical order baseline) 0.367
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.747
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
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
- train (sample): presence color: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: present read present 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME COLOR` FULL 0.000 (n 8)
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 6)
- heldout_formulations: `make c27_them all COLOR` FULL 0.000 (n 2)
- heldout_formulations: `NAME is POS NAME and NAME` FULL 0.000 (n 1)
- heldout_formulations: `from_now_on every new SHAPE should be COLOR` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role quantity | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.613 | 0.593 | 0.660 | 0.967 | 0.860 | 0.953 | 0.993 | 1.000 | 0.993 | 1.000 | 0.980 | 0.993 | 1.000 | 0.973 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.033 | 0.020 | 0.087 | 0.940 | 0.427 | 0.927 | 0.993 | 1.000 | 0.987 | 0.987 | 1.000 | 0.993 | 1.000 | 0.980 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.776 | 0.889 | 0.832 | 0.066 (0.000 / 0.067) |
| heldout_formulations | object | comparison: pooled midpoint | 0.017 | 1.000 | 0.509 |  |
| heldout_formulations | shape | product: fitted | 1.000 | 0.987 | 0.994 | 0.021 (0.000 / 0.021) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.915 | 0.987 | 0.951 |  |
| heldout_formulations | color | product: fitted | 0.976 | 1.000 | 0.988 | 0.024 (— / 0.024) |
| heldout_formulations | color | comparison: pooled midpoint | 0.214 | 1.000 | 0.607 |  |
| heldout_formulations | size | product: fitted | 0.981 | 0.986 | 0.984 | 0.000 (0.000 / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 0.906 | 0.986 | 0.946 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.071 (— / 0.071) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.941 | 1.000 | 0.971 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.941 | 0.991 | 0.966 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.882 | 1.000 | 0.941 |  |
| heldout_formulations | landmark2 | product: fitted | 0.250 | 1.000 | 0.625 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | — | 1.000 | — |  |
| heldout_formulations | region | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.992 | 0.996 | 0.000 (0.000 / 0.000) |
| heldout_formulations | members | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | object | product: fitted | 0.883 | 1.000 | 0.941 | 0.071 (— / 0.071) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.022 (— / 0.022) |
| train (sample) | color | product: fitted | 1.000 | 0.979 | 0.990 | 0.000 (0.000 / 0.000) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.917 | 1.000 | 0.958 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.917 | 1.000 | 0.958 | 0.000 (— / 0.000) |
| train (sample) | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| train (sample) | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
