# REPORT — world `graphq7r2`, legend sha256:5f40b9138237… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
3402 annotated sentences from 2 files; provenance: {'llm': 3402}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_graphq7r2_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 158 sentences
- heldout_formulations: 156 sentences
- train: 3088 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
16940 tokens in the examples; 466 with no kind in the lexicon (share 0.028), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cuda, codes path+chainL+bigram, gates learned (closed start). Code commit 7396cf7. Memory curve: runs/micro_graphq7r2_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.527 [rule: fit; pooled midpoint 1.936 (comparison)] (present 3.804, n 2068 / absent 0.068, n 1178)
- presence:shape: threshold 0.240 [rule: fit; pooled midpoint 0.447 (comparison)] (present 0.848, n 117 / absent 0.047, n 3129)
- presence:color: threshold 0.385 [rule: fit; pooled midpoint 0.850 (comparison)] (present 1.600, n 182 / absent 0.100, n 3064)
- presence:size: threshold 0.387 [rule: fit; pooled midpoint 0.547 (comparison)] (present 1.065, n 26 / absent 0.029, n 3220)
- presence:relation: threshold 0.542 [rule: fit; pooled midpoint 0.820 (comparison)] (present 1.583, n 538 / absent 0.056, n 2708)
- presence:landmark: threshold 0.322 [rule: fit; pooled midpoint 0.792 (comparison)] (present 1.165, n 1645 / absent 0.419, n 1601)
- presence:landmark2: threshold 0.391 [rule: fit; pooled midpoint 0.949 (comparison)] (present 1.765, n 47 / absent 0.133, n 3199)
- presence:relation2: threshold 0.227 [rule: fit; pooled midpoint 0.464 (comparison)] (present 0.859, n 60 / absent 0.070, n 3186)
- presence:landmark3: threshold 0.223 [rule: fit; pooled midpoint 0.401 (comparison)] (present 0.670, n 96 / absent 0.133, n 3150)
- presence:region: threshold 0.302 [rule: fit; pooled midpoint 0.504 (comparison)] (present 0.939, n 23 / absent 0.069, n 3223)
- presence:source: threshold 0.086 [rule: fit; pooled midpoint 0.740 (comparison)] (present 1.450, n 800 / absent 0.030, n 2446)
- presence:target: threshold 0.113 [rule: fit; pooled midpoint 0.346 (comparison)] (present 0.660, n 598 / absent 0.033, n 2648)
- presence:notcolor: threshold 0.580 [rule: fit; pooled midpoint 1.072 (comparison)] (present 2.074, n 31 / absent 0.069, n 3215)
- presence:comparison: threshold 0.560 [rule: fit; pooled midpoint 0.476 (comparison)] (present 0.908, n 456 / absent 0.044, n 2790)
- attr_presence:object: threshold 0.256 [rule: fit; pooled midpoint 0.449 (comparison)] (present 0.795, n 108 / absent 0.103, n 1919)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 2026)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, relation 0.067, landmark 0.000, landmark2 0.000, relation2 0.067, landmark3 0.000, region 0.067, source 0.000, target 0.000, notcolor 0.056, comparison 0.143, predicate 0.167

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 156)
| axis | accuracy |
|---|---|
| FULL | 0.867 |
| FULL [pooled midpoint (comparison)] | 0.160 |
| presence object: absent read absent | 1.000 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.993 |
| presence size: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence relation2: absent read absent | 0.993 |
| presence landmark3: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence source: present read present | 0.976 |
| presence source: share of 'present' readings that abstain | 0.000 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.914 |
| presence target: share of 'present' readings that abstain | 0.031 |
| presence target: share of true 'present' readings that abstain | 0.031 |
| presence notcolor: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.967 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.933 |
| event type (synonym table) | 0.933 |
| role object | 0.967 |
| head object | 0.967 |
| lexical order head object | 0.640 |
| lexical bag head object | 0.373 |
| occupancy: not given | 0.999 |
| role shape | 1.000 |
| head shape | 1.000 |
| lexical order head shape | 0.973 |
| lexical bag head shape | 0.973 |
| role color | 0.980 |
| head color | 0.980 |
| lexical order head color | 0.913 |
| lexical bag head color | 0.907 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.993 |
| lexical bag head size | 0.993 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.867 |
| lexical bag head relation | 0.893 |
| role landmark | 0.993 |
| head landmark | 0.993 |
| lexical order head landmark | 0.540 |
| lexical bag head landmark | 0.513 |
| role landmark2 | 0.980 |
| head landmark2 | 0.980 |
| lexical order head landmark2 | 0.973 |
| lexical bag head landmark2 | 0.980 |
| role relation2 | 0.993 |
| head relation2 | 0.993 |
| lexical order head relation2 | 0.987 |
| lexical bag head relation2 | 0.987 |
| role landmark3 | 0.993 |
| head landmark3 | 0.993 |
| lexical order head landmark3 | 0.973 |
| lexical bag head landmark3 | 0.967 |
| role region | 0.993 |
| head region | 0.993 |
| lexical order head region | 0.993 |
| lexical bag head region | 0.993 |
| role source | 0.987 |
| head source | 0.987 |
| lexical order head source | 0.720 |
| lexical bag head source | 0.807 |
| occupancy: unknown filler | 0.988 |
| role target | 0.973 |
| head target | 0.973 |
| lexical order head target | 0.767 |
| lexical bag head target | 0.820 |
| role notcolor | 1.000 |
| head notcolor | 1.000 |
| lexical order head notcolor | 0.993 |
| lexical bag head notcolor | 0.993 |
| role comparison | 0.993 |
| head comparison | 0.993 |
| lexical order head comparison | 0.893 |
| lexical bag head comparison | 0.893 |
| heads FULL (model) | 0.887 |
| heads FULL (lexical order baseline) | 0.107 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.160 |
| role object [pooled midpoint (comparison)] | 0.367 |
| role shape [pooled midpoint (comparison)] | 0.993 |
| role color [pooled midpoint (comparison)] | 0.980 |
| role size [pooled midpoint (comparison)] | 0.993 |
| role relation [pooled midpoint (comparison)] | 0.980 |
| role landmark [pooled midpoint (comparison)] | 0.793 |
| role landmark2 [pooled midpoint (comparison)] | 0.973 |
| role relation2 [pooled midpoint (comparison)] | 0.993 |
| role landmark3 [pooled midpoint (comparison)] | 0.980 |
| role region [pooled midpoint (comparison)] | 0.993 |
| role source [pooled midpoint (comparison)] | 0.827 |
| role target [pooled midpoint (comparison)] | 0.867 |
| role notcolor [pooled midpoint (comparison)] | 1.000 |
| role comparison [pooled midpoint (comparison)] | 0.987 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.167 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark3: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.593 |
| presence target: present read present [pooled midpoint (comparison)] | 0.750 |
| presence notcolor: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 0.991 |
| presence object: present read present | 0.978 |
| presence object: share of 'present' readings that abstain | 0.289 |
| presence object: share of true 'present' readings that abstain | 0.289 |
| presence landmark: present read present | 0.986 |
| presence landmark: share of 'present' readings that abstain | 0.029 |
| presence landmark: share of true 'present' readings that abstain | 0.029 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence comparison: present read present | 0.938 |
| presence comparison: share of 'present' readings that abstain | 0.067 |
| presence comparison: share of true 'present' readings that abstain | 0.067 |
| occupancy: known filler | 0.924 |
| presence object: present read present [pooled midpoint (comparison)] | 0.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.559 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: present read present [pooled midpoint (comparison)] | 0.938 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.909 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.895 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.250 |
| presence shape: share of true 'present' readings that abstain | 0.250 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.750 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark3: present read present | 0.750 |
| presence landmark3: share of 'present' readings that abstain | 0.000 |
| presence landmark3: share of true 'present' readings that abstain | 0.000 |
| presence landmark3: present read present [pooled midpoint (comparison)] | 0.250 |
| presence landmark2: present read present | 0.250 |
| presence relation2: share of 'present' readings that abstain | 0.000 |
| presence relation2: share of FALSE 'present' readings that abstain | 0.000 |
| presence region: present read present | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.000 |
| presence region: present read present [pooled midpoint (comparison)] | 0.000 |
| presence relation2: present read present | 1.000 |
| presence relation2: share of true 'present' readings that abstain | 0.000 |
| presence relation2: present read present [pooled midpoint (comparison)] | 0.500 |
| presence notcolor: present read present | 1.000 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |
| presence notcolor: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |

residual mean 0.206; status {'ok': 116, 'abstain': 29, 'unknown-event': 4, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.933 | 0.539 / 0.323 | 0.99 | 0.053 | 0.000 / 0.013 |
| role source | 0.952 | 0.358 / 0.216 | 0.98 | 0.024 | 0.000 / 0.024 |
| roles (pooled) | 0.935 | 0.319 / 0.000 | 0.84 | 0.007 | 0.098 / 0.059 |
| role target | 0.886 | 0.272 / 0.053 | 0.89 | 0.000 | 0.000 / 0.114 |
| role object | 0.947 | 0.279 / 0.000 | 0.68 | 0.011 | 0.274 / 0.042 |
| role landmark | 0.986 | 0.341 / 0.121 | 0.96 | 0.000 | 0.029 / 0.014 |
| role comparison | 0.938 | 0.323 / 0.149 | 0.88 | 0.000 | 0.062 / 0.062 |
| role color | 0.846 | 0.454 / 0.042 | 0.85 | 0.000 | 0.000 / 0.154 |
| role relation | 1.000 | 0.424 / 0.260 | 1.00 | 0.000 | 0.000 / 0.000 |
| role size | 1.000 | 0.162 / 0.162 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 1.000 | 0.398 / 0.153 | 0.75 | 0.000 | 0.250 / 0.000 |
| role landmark3 | 0.750 | 0.145 / 0.040 | 0.75 | 0.000 | 0.000 / 0.250 |
| role landmark2 | 0.250 | 0.068 / 0.000 | 0.25 | 0.000 | 0.000 / 0.750 |
| role region | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role relation2 | 1.000 | 0.202 / 0.115 | 1.00 | 0.000 | 0.000 / 0.000 |
| role notcolor | 1.000 | 0.645 / 0.645 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 150 of 3088)
| axis | accuracy |
|---|---|
| FULL | 0.873 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.318 |
| presence object: share of true 'present' readings that abstain | 0.322 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.987 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: absent read absent | 0.993 |
| presence relation2: absent read absent | 1.000 |
| presence landmark3: absent read absent | 1.000 |
| presence region: absent read absent | 0.993 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| presence comparison: absent read absent | 0.992 |
| structure (depth, negation) | 0.953 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.913 |
| event type (synonym table) | 0.913 |
| role object | 0.967 |
| head object | 0.973 |
| lexical order head object | 0.580 |
| lexical bag head object | 0.773 |
| occupancy: known filler | 0.946 |
| role shape | 1.000 |
| head shape | 1.000 |
| lexical order head shape | 0.967 |
| lexical bag head shape | 0.973 |
| occupancy: not given | 0.997 |
| role color | 0.993 |
| head color | 0.993 |
| lexical order head color | 0.953 |
| lexical bag head color | 0.953 |
| role size | 0.993 |
| head size | 0.993 |
| lexical order head size | 0.980 |
| lexical bag head size | 0.980 |
| role relation | 0.987 |
| head relation | 0.987 |
| lexical order head relation | 0.760 |
| lexical bag head relation | 0.840 |
| role landmark | 0.973 |
| head landmark | 0.973 |
| lexical order head landmark | 0.487 |
| lexical bag head landmark | 0.753 |
| role landmark2 | 0.993 |
| head landmark2 | 0.993 |
| lexical order head landmark2 | 0.973 |
| lexical bag head landmark2 | 0.987 |
| role relation2 | 1.000 |
| head relation2 | 1.000 |
| lexical order head relation2 | 0.980 |
| lexical bag head relation2 | 0.987 |
| role landmark3 | 1.000 |
| head landmark3 | 1.000 |
| lexical order head landmark3 | 0.960 |
| lexical bag head landmark3 | 0.980 |
| role region | 0.993 |
| head region | 0.993 |
| lexical order head region | 0.993 |
| lexical bag head region | 1.000 |
| role source | 0.973 |
| head source | 0.973 |
| lexical order head source | 0.747 |
| lexical bag head source | 0.913 |
| role target | 0.967 |
| head target | 0.967 |
| lexical order head target | 0.833 |
| lexical bag head target | 0.960 |
| role notcolor | 1.000 |
| head notcolor | 1.000 |
| lexical order head notcolor | 1.000 |
| lexical bag head notcolor | 1.000 |
| role comparison | 0.993 |
| head comparison | 0.993 |
| lexical order head comparison | 0.887 |
| lexical bag head comparison | 0.887 |
| heads FULL (model) | 0.907 |
| heads FULL (lexical order baseline) | 0.100 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.453 |
| presence object: absent read absent | 0.982 |
| presence relation: absent read absent | 0.991 |
| presence landmark: absent read absent | 0.985 |
| presence source: present read present | 0.946 |
| presence source: share of 'present' readings that abstain | 0.000 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.833 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark3: present read present | 1.000 |
| presence landmark3: share of 'present' readings that abstain | 0.000 |
| presence landmark3: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.200 |
| presence landmark2: share of true 'present' readings that abstain | 0.250 |
| presence relation2: present read present | 1.000 |
| presence relation2: share of 'present' readings that abstain | 0.000 |
| presence relation2: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.500 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 1.000 |
| presence size: present read present | 0.667 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark2: share of FALSE 'present' readings that abstain | 0.000 |
| presence comparison: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.197; status {'ok': 114, 'abstain': 29, 'unknown-event': 5, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.913 | 0.538 / 0.304 | 0.96 | 0.047 | 0.000 / 0.040 |
| role object | 0.956 | 0.270 / 0.000 | 0.68 | 0.022 | 0.300 / 0.022 |
| roles (pooled) | 0.939 | 0.354 / 0.000 | 0.87 | 0.016 | 0.090 / 0.045 |
| role relation | 0.972 | 0.443 / 0.282 | 0.97 | 0.000 | 0.000 / 0.028 |
| role landmark | 0.961 | 0.395 / 0.264 | 0.97 | 0.013 | 0.000 / 0.026 |
| role source | 0.895 | 0.402 / 0.185 | 0.92 | 0.026 | 0.000 / 0.079 |
| role target | 0.800 | 0.322 / 0.000 | 0.80 | 0.000 | 0.000 / 0.200 |
| role comparison | 1.000 | 0.353 / 0.176 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 1.000 | 0.529 / 0.499 | 1.00 | 0.000 | 0.000 / 0.000 |
| role color | 0.857 | 0.569 / 0.399 | 1.00 | 0.143 | 0.000 / 0.000 |
| role landmark3 | 1.000 | 0.227 / 0.154 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.182 / 0.073 | 0.75 | 0.000 | 0.250 / 0.000 |
| role relation2 | 1.000 | 0.348 / 0.337 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 1.000 | 0.294 / 0.294 | 1.00 | 0.000 | 0.000 / 0.000 |
| role size | 0.667 | 0.114 / 0.033 | 0.67 | 0.000 | 0.000 / 0.333 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 to=1.00 SIZE=1.00 SHAPE=0.99 and=0.98 c22_from=0.98 c26_shape=0.98 NOTCOLOR=0.97 VERB=0.96 c10_three=0.94 c18_does=0.92 directly=0.92 c9_an=0.81 COLOR=0.81 with=0.79 QUANT=0.77 c15_on=0.75 c20_arrow=0.73 c23_in=0.71 c6_both=0.67 PAIR=0.63 c16_new=0.61 SUPER=0.57 are=0.54 AXIS=0.54 c4_then=0.54 c8_what's=0.54 c14_uh=0.52 named=0.51 c12_that=0.46 DIR=0.42 unknown=0.38 c5_me=0.38 c19_goes=0.38 c11_what=0.35 c17_be=0.35 c24_line=0.35 of=0.24 RECENT=0.16 ARROW=0.12 LAYOUT=0.12 STYLE=0.12 c21_arrowheads=0.12 c25_pixels=0.12 called=0.12 labeled=0.12 lines=0.12 c27_them=0.07 c1_have=0.07 c3_rules=0.06 c7_i=0.02 c13_one=0.01 it=0.01 a=0.00 c2_now=0.00 NAME=0.00 the=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.867
- heldout_formulations: presence source: share of 'present' readings that abstain 0.000
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of 'present' readings that abstain 0.031
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.031
- heldout_formulations: heads FULL (model) 0.887
- heldout_formulations: heads FULL (lexical order baseline) 0.107
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.160
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.160
- heldout_formulations: role object [pooled midpoint (comparison)] 0.367
- heldout_formulations: role landmark [pooled midpoint (comparison)] 0.793
- heldout_formulations: role source [pooled midpoint (comparison)] 0.827
- heldout_formulations: role target [pooled midpoint (comparison)] 0.867
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.167
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.593
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence object: share of 'present' readings that abstain 0.289
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.289
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.029
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.029
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.067
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.067
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.559
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.895
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.250
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.250
- heldout_formulations: presence shape: present read present [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence color: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark3: present read present 0.750
- heldout_formulations: presence landmark3: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark3: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark3: present read present [pooled midpoint (comparison)] 0.250
- heldout_formulations: presence landmark2: present read present 0.250
- heldout_formulations: presence relation2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation2: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence region: present read present 0.000
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence region: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence relation2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation2: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence notcolor: share of 'present' readings that abstain 0.000
- heldout_formulations: presence notcolor: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): FULL 0.873
- train (sample): presence object: share of 'present' readings that abstain 0.318
- train (sample): presence object: share of true 'present' readings that abstain 0.322
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): heads FULL (lexical order baseline) 0.100
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.453
- train (sample): presence source: share of 'present' readings that abstain 0.000
- train (sample): presence source: share of true 'present' readings that abstain 0.000
- train (sample): presence target: present read present 0.833
- train (sample): presence target: share of 'present' readings that abstain 0.000
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence landmark3: share of 'present' readings that abstain 0.000
- train (sample): presence landmark3: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.200
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.250
- train (sample): presence relation2: share of 'present' readings that abstain 0.000
- train (sample): presence relation2: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.500
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence size: present read present 0.667
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence comparison: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `is_q the NAME POS NAME and the NAME` FULL 0.000 (n 2)
- heldout_formulations: `is SHAPE anywhere` FULL 0.000 (n 1)
- heldout_formulations: `is_q NAME is connected to NAME` FULL 0.000 (n 1)
- heldout_formulations: `is any pillar COLOR` FULL 0.000 (n 1)
- heldout_formulations: `NAME is path_q the NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role relation | role landmark | role landmark2 | role relation2 | role landmark3 | role region | role source | role target | role notcolor | role comparison |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.887 | 0.867 | 0.967 | 1.000 | 0.980 | 1.000 | 1.000 | 0.993 | 0.980 | 0.993 | 0.993 | 0.993 | 0.987 | 0.973 | 1.000 | 0.993 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.167 | 0.160 | 0.367 | 0.993 | 0.980 | 0.993 | 0.980 | 0.793 | 0.973 | 0.993 | 0.980 | 0.993 | 0.827 | 0.867 | 1.000 | 0.987 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.978 | 1.000 | 0.989 | 0.289 (— / 0.289) |
| heldout_formulations | object | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.250 (— / 0.250) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_formulations | color | product: fitted | 1.000 | 0.993 | 0.996 | 0.000 (0.000 / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.909 | 1.000 | 0.955 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.895 | 1.000 | 0.947 |  |
| heldout_formulations | landmark | product: fitted | 0.986 | 1.000 | 0.993 | 0.029 (— / 0.029) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.559 | 1.000 | 0.779 |  |
| heldout_formulations | landmark2 | product: fitted | 0.250 | 1.000 | 0.625 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | relation2 | product: fitted | 1.000 | 0.993 | 0.997 | 0.000 (0.000 / 0.000) |
| heldout_formulations | relation2 | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | landmark3 | product: fitted | 0.750 | 1.000 | 0.875 | 0.000 (— / 0.000) |
| heldout_formulations | landmark3 | comparison: pooled midpoint | 0.250 | 1.000 | 0.625 |  |
| heldout_formulations | region | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | region | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | source | product: fitted | 0.976 | 1.000 | 0.988 | 0.000 (— / 0.000) |
| heldout_formulations | source | comparison: pooled midpoint | 0.593 | 1.000 | 0.796 |  |
| heldout_formulations | target | product: fitted | 0.914 | 1.000 | 0.957 | 0.031 (— / 0.031) |
| heldout_formulations | target | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_formulations | notcolor | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | notcolor | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | comparison | product: fitted | 0.938 | 1.000 | 0.969 | 0.067 (— / 0.067) |
| heldout_formulations | comparison | comparison: pooled midpoint | 0.938 | 0.991 | 0.964 |  |
| train (sample) | object | product: fitted | 1.000 | 0.982 | 0.991 | 0.318 (0.000 / 0.322) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | size | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 1.000 | 0.991 | 0.995 | 0.000 (0.000 / 0.000) |
| train (sample) | landmark | product: fitted | 0.987 | 0.985 | 0.986 | 0.000 (0.000 / 0.000) |
| train (sample) | landmark2 | product: fitted | 1.000 | 0.993 | 0.996 | 0.200 (0.000 / 0.250) |
| train (sample) | relation2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark3 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | region | product: fitted | 1.000 | 0.993 | 0.996 | 0.500 (1.000 / 0.000) |
| train (sample) | source | product: fitted | 0.946 | 1.000 | 0.973 | 0.000 (— / 0.000) |
| train (sample) | target | product: fitted | 0.833 | 1.000 | 0.917 | 0.000 (— / 0.000) |
| train (sample) | notcolor | product: fitted | — | 1.000 | — |  |
| train (sample) | comparison | product: fitted | 1.000 | 0.992 | 0.996 | 0.000 (0.000 / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
