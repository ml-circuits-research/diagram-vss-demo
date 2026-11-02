# REPORT — world `shapes7c_g0`, legend sha256:023a518c407b… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
6334 annotated sentences from 2 files; provenance: {'llm': 6334}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_shapes7c_g0_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 281 sentences
- heldout_formulations: 273 sentences
- train: 5780 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
34634 tokens in the examples; 1330 with no kind in the lexicon (share 0.038), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cuda, codes path+chainL+bigram, gates learned (closed start). Code commit 57a9d19. Memory curve: runs/micro_shapes7c_g0_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.105 [rule: fit; pooled midpoint 0.274 (comparison)] (present 0.549, n 27 / absent 0.000, n 1615903)
- presence:object: threshold 0.899 [rule: fit; pooled midpoint 1.885 (comparison)] (present 3.059, n 648 / absent 0.711, n 33)
- attr_presence:object: threshold 0.232 [rule: fit; pooled midpoint 0.451 (comparison)] (present 0.826, n 17 / absent 0.076, n 644)
- det_presence:object: threshold 0.390 [rule: fit; pooled midpoint 0.443 (comparison)] (present 0.845, n 8 / absent 0.042, n 640)
- presence:shape: threshold 0.487 [rule: fit; pooled midpoint 0.789 (comparison)] (present 1.453, n 197 / absent 0.126, n 484)
- presence:color: threshold 0.482 [rule: fit; pooled midpoint 1.240 (comparison)] (present 2.335, n 520 / absent 0.145, n 161)
- presence:size: threshold 0.586 [rule: fit; pooled midpoint 0.764 (comparison)] (present 1.367, n 272 / absent 0.160, n 409)
- presence:name: threshold 0.353 [rule: fit; pooled midpoint 0.559 (comparison)] (present 1.083, n 54 / absent 0.035, n 627)
- presence:text: threshold 0.163 [rule: fit; pooled midpoint 0.327 (comparison)] (present 0.610, n 16 / absent 0.045, n 665)
- presence:relation: threshold 0.460 [rule: fit; pooled midpoint 0.567 (comparison)] (present 1.099, n 81 / absent 0.035, n 600)
- presence:landmark: threshold 0.230 [rule: fit; pooled midpoint 0.517 (comparison)] (present 0.966, n 82 / absent 0.068, n 599)
- presence:landmark2: threshold 0.399 [rule: fit; pooled midpoint 0.259 (comparison)] (present 0.433, n 9 / absent 0.085, n 672)
- presence:region: threshold 0.261 [rule: fit; pooled midpoint 0.394 (comparison)] (present 0.764, n 6 / absent 0.024, n 675)
- presence:quantity: threshold 0.612 [rule: fit; pooled midpoint 0.353 (comparison)] (present 0.689, n 7 / absent 0.018, n 674)
- presence:members: threshold 0.361 [rule: fit; pooled midpoint 0.610 (comparison)] (present 0.882, n 13 / absent 0.339, n 668)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, quantity 0.200, members 0.000, predicate 0.111

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 273)
| axis | accuracy |
|---|---|
| FULL | 0.573 |
| FULL [pooled midpoint (comparison)] | 0.013 |
| presence object: present read present | 0.750 |
| presence object: share of 'present' readings that abstain | 0.149 |
| presence object: share of true 'present' readings that abstain | 0.149 |
| presence shape: absent read absent | 0.987 |
| presence color: present read present | 0.980 |
| presence color: share of 'present' readings that abstain | 0.010 |
| presence color: share of true 'present' readings that abstain | 0.010 |
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
| role object | 0.647 |
| head object | 0.647 |
| lexical order head object | 0.927 |
| lexical bag head object | 0.700 |
| occupancy: known filler | 0.786 |
| role shape | 0.967 |
| head shape | 0.967 |
| lexical order head shape | 0.660 |
| lexical bag head shape | 0.920 |
| occupancy: not given | 0.998 |
| role color | 0.853 |
| head color | 0.853 |
| lexical order head color | 0.987 |
| lexical bag head color | 0.987 |
| role size | 0.947 |
| head size | 0.947 |
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
| heads FULL (model) | 0.593 |
| heads FULL (lexical order baseline) | 0.373 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.560 |
| role object [pooled midpoint (comparison)] | 0.087 |
| role shape [pooled midpoint (comparison)] | 0.940 |
| role color [pooled midpoint (comparison)] | 0.247 |
| role size [pooled midpoint (comparison)] | 0.907 |
| role name [pooled midpoint (comparison)] | 0.973 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.993 |
| role landmark [pooled midpoint (comparison)] | 0.973 |
| role landmark2 [pooled midpoint (comparison)] | 0.993 |
| role region [pooled midpoint (comparison)] | 0.993 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.980 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.027 |
| presence object: present read present [pooled midpoint (comparison)] | 0.017 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.071 |
| presence size: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 0.962 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.849 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.021 |
| presence shape: share of true 'present' readings that abstain | 0.021 |
| occupancy: unknown filler | 0.776 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.894 |
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
| presence landmark: present read present [pooled midpoint (comparison)] | 0.765 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.750 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 0.786 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 1.000 |
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
| presence shape: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.302; status {'ok': 108, 'unknown-event': 22, 'abstain': 17, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.800 | 0.420 / 0.019 | 0.86 | 0.060 | 0.000 / 0.140 |
| role object | 0.619 | 0.200 / 0.000 | 0.68 | 0.151 | 0.094 / 0.230 |
| roles (pooled) | 0.778 | 0.313 / 0.000 | 0.85 | 0.107 | 0.035 / 0.114 |
| role color | 0.817 | 0.424 / 0.094 | 0.93 | 0.117 | 0.008 / 0.067 |
| role size | 0.879 | 0.327 / 0.121 | 0.93 | 0.052 | 0.000 / 0.069 |
| role shape | 0.922 | 0.386 / 0.212 | 0.96 | 0.059 | 0.020 / 0.020 |
| role relation | 0.941 | 0.316 / 0.143 | 0.94 | 0.000 | 0.000 / 0.059 |
| role landmark | 1.000 | 0.263 / 0.159 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 0.250 | 0.022 / 0.000 | 0.25 | 0.000 | 0.000 / 0.750 |
| role name | 0.933 | 0.302 / 0.191 | 1.00 | 0.067 | 0.000 / 0.000 |
| role region | 0.000 | 0.229 / 0.229 | 1.00 | 1.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.114 / 0.114 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.000 | 0.400 / 0.153 | 1.00 | 1.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.286 / 0.275 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 150 of 5780)
| axis | accuracy |
|---|---|
| FULL | 0.747 |
| presence object: present read present | 0.867 |
| presence object: share of 'present' readings that abstain | 0.198 |
| presence object: share of true 'present' readings that abstain | 0.198 |
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
| role object | 0.773 |
| head object | 0.787 |
| lexical order head object | 0.967 |
| lexical bag head object | 0.940 |
| occupancy: known filler | 0.867 |
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
| heads FULL (model) | 0.773 |
| heads FULL (lexical order baseline) | 0.367 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.753 |
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
| presence landmark2: present read present | 0.000 |

residual mean 0.197; status {'ok': 111, 'abstain': 23, 'unknown-event': 16}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.873 | 0.452 / 0.076 | 0.91 | 0.040 | 0.000 / 0.087 |
| role object | 0.762 | 0.195 / 0.000 | 0.73 | 0.112 | 0.147 / 0.126 |
| roles (pooled) | 0.861 | 0.337 / 0.030 | 0.88 | 0.076 | 0.056 / 0.064 |
| role size | 0.968 | 0.391 / 0.262 | 0.97 | 0.016 | 0.016 / 0.016 |
| role color | 0.892 | 0.469 / 0.320 | 0.97 | 0.081 | 0.000 / 0.027 |
| role relation | 0.917 | 0.330 / 0.176 | 0.92 | 0.000 | 0.000 / 0.083 |
| role landmark | 0.917 | 0.316 / 0.151 | 0.92 | 0.000 | 0.000 / 0.083 |
| role members | 0.667 | 0.151 / 0.109 | 1.00 | 0.333 | 0.000 / 0.000 |
| role shape | 0.902 | 0.407 / 0.337 | 0.96 | 0.078 | 0.020 / 0.020 |
| role quantity | 1.000 | 0.398 / 0.398 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 1.000 | 0.372 / 0.337 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 1.000 | 0.286 / 0.286 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.268 / 0.232 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 a=1.00 COLOR=1.00 SIZE=0.95 NUM=0.90 are=0.86 c6_both=0.78 c4_then=0.71 c27_them=0.63 c23_in=0.61 ARROW=0.59 c9_an=0.58 QUANT=0.57 c12_that=0.50 NAME=0.50 c19_goes=0.47 TEXT=0.46 the=0.44 it=0.43 c22_from=0.38 c3_rules=0.33 VERB=0.30 c17_be=0.29 c14_uh=0.28 with=0.25 RECENT=0.22 c18_does=0.21 SUPER=0.16 c26_shape=0.14 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 STYLE=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 lines=0.12 c2_now=0.11 c10_three=0.09 c5_me=0.08 directly=0.06 LAYOUT=0.05 c8_what's=0.01 c11_what=0.00 DIR=0.00 labeled=0.00 c13_one=0.00 c16_new=0.00 c15_on=0.00 c1_have=0.00 c7_i=0.00 and=0.00 of=0.00 to=0.00 SHAPE=0.00 named=0.00 unknown=0.00 called=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.573
- heldout_formulations: presence object: present read present 0.750
- heldout_formulations: presence object: share of 'present' readings that abstain 0.149
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.149
- heldout_formulations: presence color: share of 'present' readings that abstain 0.010
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.010
- heldout_formulations: structure (depth, negation) 0.833
- heldout_formulations: predicate (surface lemma) 0.800
- heldout_formulations: event type (synonym table) 0.800
- heldout_formulations: role object 0.647
- heldout_formulations: head object 0.647
- heldout_formulations: occupancy: known filler 0.786
- heldout_formulations: role color 0.853
- heldout_formulations: head color 0.853
- heldout_formulations: heads FULL (model) 0.593
- heldout_formulations: heads FULL (lexical order baseline) 0.373
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.560
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.013
- heldout_formulations: role object [pooled midpoint (comparison)] 0.087
- heldout_formulations: role color [pooled midpoint (comparison)] 0.247
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.027
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.017
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.071
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: present read present [pooled midpoint (comparison)] 0.849
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.021
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.021
- heldout_formulations: occupancy: unknown filler 0.776
- heldout_formulations: presence shape: present read present [pooled midpoint (comparison)] 0.894
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: present read present 0.250
- heldout_formulations: presence members: share of 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.765
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence name: present read present [pooled midpoint (comparison)] 0.786
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.000
- heldout_formulations: set members: first gold member in the decoded set 0.667
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.333
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.747
- train (sample): presence object: present read present 0.867
- train (sample): presence object: share of 'present' readings that abstain 0.198
- train (sample): presence object: share of true 'present' readings that abstain 0.198
- train (sample): presence size: share of 'present' readings that abstain 0.016
- train (sample): presence size: share of true 'present' readings that abstain 0.016
- train (sample): structure (depth, negation) 0.893
- train (sample): predicate (surface lemma) 0.873
- train (sample): event type (synonym table) 0.873
- train (sample): role object 0.773
- train (sample): head object 0.787
- train (sample): occupancy: known filler 0.867
- train (sample): heads FULL (model) 0.773
- train (sample): heads FULL (lexical order baseline) 0.367
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.753
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
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.400
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
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
| heldout_formulations | product readout: presence decided | 0.593 | 0.573 | 0.647 | 0.967 | 0.853 | 0.947 | 0.993 | 1.000 | 0.993 | 1.000 | 0.980 | 0.993 | 1.000 | 0.973 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.027 | 0.013 | 0.087 | 0.940 | 0.247 | 0.907 | 0.973 | 1.000 | 0.993 | 0.973 | 0.993 | 0.993 | 1.000 | 0.980 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.750 | 1.000 | 0.875 | 0.149 (— / 0.149) |
| heldout_formulations | object | comparison: pooled midpoint | 0.017 | 1.000 | 0.509 |  |
| heldout_formulations | shape | product: fitted | 1.000 | 0.987 | 0.994 | 0.021 (0.000 / 0.021) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.894 | 1.000 | 0.947 |  |
| heldout_formulations | color | product: fitted | 0.980 | 1.000 | 0.990 | 0.010 (— / 0.010) |
| heldout_formulations | color | comparison: pooled midpoint | 0.071 | 1.000 | 0.535 |  |
| heldout_formulations | size | product: fitted | 0.962 | 0.986 | 0.974 | 0.000 (0.000 / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 0.849 | 0.986 | 0.917 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 0.786 | 1.000 | 0.893 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.941 | 1.000 | 0.971 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.941 | 1.000 | 0.971 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.765 | 1.000 | 0.882 |  |
| heldout_formulations | landmark2 | product: fitted | 0.250 | 1.000 | 0.625 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_formulations | region | product: fitted | — | 1.000 | — |  |
| heldout_formulations | region | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.992 | 0.996 | 0.000 (0.000 / 0.000) |
| heldout_formulations | members | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | object | product: fitted | 0.867 | 1.000 | 0.934 | 0.198 (— / 0.198) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.022 (— / 0.022) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.016 (— / 0.016) |
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
