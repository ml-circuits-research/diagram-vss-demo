# REPORT — world `real`, legend sha256:31e2548a3435… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1597 annotated sentences from 2 files; provenance: {'llm': 1597}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/famB_p80_D1024_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 66 sentences
- heldout_formulations: 71 sentences
- train: 1460 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
9552 tokens in the examples; 185 with no kind in the lexicon (share 0.019), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit ebd557f. Memory curve: runs/famB_p80_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 728)
- presence:object: threshold 0.703 [rule: fit; pooled midpoint 0.631 (comparison)] (present 0.872, n 450 / absent 0.390, n 16)
- attr_presence:object: threshold 0.545 [rule: fit; pooled midpoint 0.465 (comparison)] (present 0.824, n 71 / absent 0.105, n 358)
- det_presence:object: threshold 0.466 [rule: fit; pooled midpoint 0.434 (comparison)] (present 0.820, n 7 / absent 0.048, n 422)
- presence:shape: threshold 0.572 [rule: fit; pooled midpoint 0.477 (comparison)] (present 0.925, n 99 / absent 0.029, n 367)
- presence:color: threshold 0.295 [rule: fit; pooled midpoint 0.447 (comparison)] (present 0.880, n 176 / absent 0.014, n 290)
- presence:size: threshold 0.442 [rule: fit; pooled midpoint 0.501 (comparison)] (present 0.968, n 192 / absent 0.034, n 274)
- presence:name: threshold 0.237 [rule: fit; pooled midpoint 0.318 (comparison)] (present 0.617, n 33 / absent 0.020, n 433)
- presence:text: threshold 0.481 [rule: fit; pooled midpoint 0.339 (comparison)] (present 0.660, n 42 / absent 0.018, n 424)
- presence:relation: threshold 0.327 [rule: fit; pooled midpoint 0.485 (comparison)] (present 0.882, n 157 / absent 0.088, n 309)
- presence:landmark: threshold 0.378 [rule: fit; pooled midpoint 0.379 (comparison)] (present 0.702, n 156 / absent 0.057, n 310)
- presence:landmark2: threshold 0.368 [rule: fit; pooled midpoint 0.269 (comparison)] (present 0.446, n 18 / absent 0.092, n 448)
- presence:region: threshold 0.305 [rule: fit; pooled midpoint 0.450 (comparison)] (present 0.800, n 72 / absent 0.099, n 394)
- presence:direction: threshold 0.135 [rule: fit; pooled midpoint 0.256 (comparison)] (present 0.491, n 7 / absent 0.022, n 459)
- presence:amount: threshold 0.305 [rule: fit; pooled midpoint 0.362 (comparison)] (present 0.691, n 10 / absent 0.033, n 456)
- presence:members: threshold 1.041 [rule: fit; pooled midpoint 0.601 (comparison)] (present 1.175, n 7 / absent 0.026, n 465)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.062, color 0.056, size 0.143, name 0.001, text 0.001, relation 0.067, landmark 0.001, landmark2 0.001, region 0.067, direction 0.250, amount 0.071, members 0.500, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 71 of 71)
| axis | accuracy |
|---|---|
| FULL | 0.704 |
| FULL [depth given] | 0.704 |
| FULL [depth and negation given] | 0.704 |
| FULL [presence not decided] | 0.746 |
| FULL [pooled midpoint (comparison)] | 0.732 |
| presence object: present read present | 0.914 |
| presence object: share of 'present' readings that abstain | 0.037 |
| presence object: share of true 'present' readings that abstain | 0.038 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.845 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.972 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.845 |
| event type (synonym table) | 0.845 |
| role object | 0.775 |
| head object | 0.775 |
| lexical order head object | 0.972 |
| lexical bag head object | 0.704 |
| occupancy: unknown filler | 0.804 |
| role shape | 0.972 |
| head shape | 0.972 |
| lexical order head shape | 0.803 |
| lexical bag head shape | 0.972 |
| occupancy: not given | 0.996 |
| role color | 0.901 |
| head color | 0.901 |
| lexical order head color | 0.535 |
| lexical bag head color | 0.915 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.718 |
| lexical bag head size | 0.958 |
| role name | 1.000 |
| head name | 1.000 |
| lexical order head name | 0.986 |
| lexical bag head name | 1.000 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.944 |
| lexical bag head text | 0.972 |
| role relation | 0.958 |
| head relation | 0.958 |
| lexical order head relation | 0.732 |
| lexical bag head relation | 0.915 |
| role landmark | 0.986 |
| head landmark | 0.986 |
| lexical order head landmark | 0.746 |
| lexical bag head landmark | 0.831 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.986 |
| lexical bag head landmark2 | 0.972 |
| role region | 0.958 |
| head region | 0.958 |
| lexical order head region | 0.859 |
| lexical bag head region | 0.915 |
| occupancy: known filler | 0.847 |
| role direction | 1.000 |
| head direction | 1.000 |
| lexical order head direction | 1.000 |
| lexical bag head direction | 1.000 |
| role amount | 1.000 |
| head amount | 1.000 |
| lexical order head amount | 1.000 |
| lexical bag head amount | 1.000 |
| role members | 0.972 |
| head members | 0.972 |
| lexical order head members | 0.972 |
| lexical bag head members | 0.972 |
| heads FULL (model) | 0.704 |
| heads FULL (lexical order baseline) | 0.085 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.465 |
| role object [presence not decided] | 0.845 |
| role shape [presence not decided] | 1.000 |
| role color [presence not decided] | 0.901 |
| role size [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 1.000 |
| role relation [presence not decided] | 0.958 |
| role landmark [presence not decided] | 0.986 |
| role landmark2 [presence not decided] | 1.000 |
| role region [presence not decided] | 0.958 |
| role direction [presence not decided] | 0.944 |
| role amount [presence not decided] | 1.000 |
| role members [presence not decided] | 0.972 |
| heads FULL (model) [presence not decided] | 0.746 |
| role object [pooled midpoint (comparison)] | 0.789 |
| role shape [pooled midpoint (comparison)] | 0.986 |
| role color [pooled midpoint (comparison)] | 0.901 |
| role size [pooled midpoint (comparison)] | 1.000 |
| role name [pooled midpoint (comparison)] | 1.000 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.958 |
| role landmark [pooled midpoint (comparison)] | 0.986 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.958 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.972 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.732 |
| presence object: present read present [pooled midpoint (comparison)] | 0.931 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: present read present [pooled midpoint (comparison)] | 1.000 |
| presence direction: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence amount: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence shape: present read present | 0.857 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence region: absent read absent | 0.961 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.929 |
| presence color: present read present [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.961 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.889 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.889 |
| presence landmark: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 0.500 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.000 |
| set members: first gold member in the decoded set | 0.000 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.500 |
| presence members: present read present [pooled midpoint (comparison)] | 0.000 |

residual mean 0.234; status {'abstain': 4, 'ok': 56, 'no-sense': 6, 'unknown-event': 5}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.845 | 0.463 / 0.043 | 0.89 | 0.042 | 0.000 / 0.113 |
| role object | 0.779 | 0.175 / 0.000 | 0.82 | 0.074 | 0.029 / 0.147 |
| roles (pooled) | 0.837 | 0.268 / 0.000 | 0.86 | 0.032 | 0.011 / 0.132 |
| role region | 0.900 | 0.420 / 0.212 | 0.90 | 0.000 | 0.000 / 0.100 |
| role shape | 0.857 | 0.251 / 0.037 | 0.86 | 0.000 | 0.000 / 0.143 |
| role color | 0.788 | 0.331 / 0.000 | 0.82 | 0.030 | 0.000 / 0.182 |
| role size | 1.000 | 0.392 / 0.299 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.192 / 0.145 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.842 | 0.353 / 0.000 | 0.84 | 0.000 | 0.000 / 0.158 |
| role landmark | 0.944 | 0.264 / 0.094 | 0.94 | 0.000 | 0.000 / 0.056 |
| role landmark2 | 1.000 | 0.164 / 0.164 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 1.000 | 0.227 / 0.227 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

### train (sample) — catalog candidates (n = 300 of 1460)
| axis | accuracy |
|---|---|
| FULL | 0.750 |
| FULL [depth given] | 0.750 |
| FULL [depth and negation given] | 0.750 |
| presence object: present read present | 0.933 |
| presence object: share of 'present' readings that abstain | 0.071 |
| presence object: share of true 'present' readings that abstain | 0.071 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 0.990 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence name: absent read absent | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.934 |
| presence relation: share of 'present' readings that abstain | 0.033 |
| presence relation: share of true 'present' readings that abstain | 0.024 |
| presence landmark: present read present | 0.968 |
| presence landmark: share of 'present' readings that abstain | 0.033 |
| presence landmark: share of true 'present' readings that abstain | 0.033 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.965 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.883 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.880 |
| event type (synonym table) | 0.880 |
| role object | 0.827 |
| head object | 0.827 |
| lexical order head object | 0.987 |
| lexical bag head object | 0.947 |
| occupancy: known filler | 0.868 |
| role shape | 0.990 |
| head shape | 0.990 |
| lexical order head shape | 0.783 |
| lexical bag head shape | 1.000 |
| occupancy: not given | 0.995 |
| role color | 0.943 |
| head color | 0.943 |
| lexical order head color | 0.603 |
| lexical bag head color | 0.983 |
| role size | 0.980 |
| head size | 0.980 |
| lexical order head size | 0.640 |
| lexical bag head size | 0.963 |
| role name | 0.987 |
| head name | 0.987 |
| lexical order head name | 0.917 |
| lexical bag head name | 1.000 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.923 |
| lexical bag head text | 1.000 |
| role relation | 0.920 |
| head relation | 0.920 |
| lexical order head relation | 0.667 |
| lexical bag head relation | 0.937 |
| role landmark | 0.957 |
| head landmark | 0.957 |
| lexical order head landmark | 0.660 |
| lexical bag head landmark | 0.920 |
| role landmark2 | 0.997 |
| head landmark2 | 0.997 |
| lexical order head landmark2 | 0.973 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.947 |
| head region | 0.947 |
| lexical order head region | 0.867 |
| lexical bag head region | 0.943 |
| role direction | 1.000 |
| head direction | 1.000 |
| lexical order head direction | 0.983 |
| lexical bag head direction | 1.000 |
| role amount | 0.997 |
| head amount | 0.997 |
| lexical order head amount | 0.977 |
| lexical bag head amount | 1.000 |
| role members | 0.997 |
| head members | 0.997 |
| lexical order head members | 0.997 |
| lexical bag head members | 0.997 |
| heads FULL (model) | 0.750 |
| heads FULL (lexical order baseline) | 0.027 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.790 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence text: absent read absent | 1.000 |
| presence landmark2: present read present | 0.875 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence size: absent read absent | 1.000 |
| presence relation: absent read absent | 0.960 |
| presence landmark: absent read absent | 1.000 |
| presence shape: present read present | 0.984 |
| presence shape: share of 'present' readings that abstain | 0.016 |
| presence shape: share of true 'present' readings that abstain | 0.016 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence relation: share of FALSE 'present' readings that abstain | 0.143 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.000 |
| presence amount: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 0.865 |
| presence region: share of 'present' readings that abstain | 0.050 |
| presence region: share of true 'present' readings that abstain | 0.031 |
| presence object: absent read absent | 1.000 |
| presence direction: present read present | 1.000 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.125 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 1.000 |
| occupancy: unknown filler | 1.000 |

residual mean 0.201; status {'ok': 235, 'abstain': 30, 'no-sense': 15, 'unknown-event': 20}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.880 | 0.478 / 0.104 | 0.93 | 0.050 | 0.000 / 0.070 |
| role object | 0.820 | 0.168 / 0.000 | 0.83 | 0.069 | 0.055 / 0.111 |
| roles (pooled) | 0.862 | 0.269 / 0.034 | 0.89 | 0.053 | 0.022 / 0.085 |
| role size | 0.944 | 0.382 / 0.308 | 0.96 | 0.019 | 0.000 / 0.037 |
| role text | 1.000 | 0.198 / 0.144 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.830 | 0.334 / 0.067 | 0.90 | 0.070 | 0.000 / 0.100 |
| role landmark | 0.873 | 0.249 / 0.074 | 0.92 | 0.069 | 0.020 / 0.059 |
| role name | 0.840 | 0.227 / 0.170 | 1.00 | 0.160 | 0.000 / 0.000 |
| role landmark2 | 0.875 | 0.112 / 0.058 | 0.88 | 0.000 | 0.000 / 0.125 |
| role color | 0.857 | 0.358 / 0.000 | 0.87 | 0.017 | 0.000 / 0.126 |
| role shape | 0.954 | 0.284 / 0.184 | 0.97 | 0.031 | 0.015 / 0.015 |
| role amount | 0.857 | 0.284 / 0.211 | 1.00 | 0.143 | 0.000 / 0.000 |
| role region | 0.800 | 0.379 / 0.000 | 0.80 | 0.025 | 0.025 / 0.175 |
| role direction | 1.000 | 0.320 / 0.274 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.000 | 0.377 / 0.377 | 1.00 | 1.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.87 NAME=0.82 VERB=0.45 NUM=0.45 the=0.45 QUANT=0.33 COLOR=0.31 them=0.28 DIR=0.20 not=0.18 too=0.17 each=0.14 pixels=0.14 are=0.12 ARROW=0.12 AXIS=0.12 NOTCOLOR=0.12 STYLE=0.12 any=0.12 arrow=0.12 arrows=0.12 as=0.12 axis=0.12 back=0.12 can=0.12 check=0.12 diagram=0.12 directly=0.12 do=0.12 does=0.12 evenly=0.12 exist=0.12 from=0.12 has=0.12 have=0.12 here=0.12 if=0.12 line=0.12 lines=0.12 link=0.12 me=0.12 now=0.12 once=0.12 reached=0.12 remove=0.12 rules=0.12 shapes=0.12 show=0.12 tell=0.12 then=0.12 there=0.12 thing=0.12 this=0.12 those=0.12 we=0.12 what=0.12 what's=0.12 who=0.12 whole=0.12 map=0.12 for=0.12 at=0.10 front=0.10 LAYOUT=0.10 that=0.10 no=0.10 every=0.09 both=0.08 should=0.08 four=0.08 give=0.08 PAIR=0.08 it=0.08 uh=0.07 i=0.07 be=0.07 in=0.07 you=0.07 shape=0.07 with=0.07 last=0.07 SUPER=0.07 new=0.06 two=0.06 by=0.06 just=0.06 box=0.06 three=0.05 one=0.05 place=0.05 an=0.04 on=0.04 goes=0.04 RECENT=0.04 put=0.03 SIZE=0.03 unknown=0.01 to=0.01 of=0.01 called=0.01 named=0.01 and=0.01 a=0.01 SHAPE=0.01 labeled=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.704
- heldout_formulations: presence object: share of 'present' readings that abstain 0.037
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.038
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: structure (depth, negation) 0.845
- heldout_formulations: predicate (surface lemma) 0.845
- heldout_formulations: event type (synonym table) 0.845
- heldout_formulations: role object 0.775
- heldout_formulations: head object 0.775
- heldout_formulations: occupancy: unknown filler 0.804
- heldout_formulations: occupancy: known filler 0.847
- heldout_formulations: heads FULL (model) 0.704
- heldout_formulations: heads FULL (lexical order baseline) 0.085
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.465
- heldout_formulations: FULL [depth given] 0.704
- heldout_formulations: FULL [depth and negation given] 0.704
- heldout_formulations: FULL [presence not decided] 0.746
- heldout_formulations: role object [presence not decided] 0.845
- heldout_formulations: heads FULL (model) [presence not decided] 0.746
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.732
- heldout_formulations: role object [pooled midpoint (comparison)] 0.789
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.732
- heldout_formulations: presence shape: present read present 0.857
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present 0.889
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.889
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: absent read absent 0.500
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present 0.000
- heldout_formulations: set members: first gold member in the decoded set 0.000
- heldout_formulations: presence object: absent read absent [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.000
- train (sample): FULL 0.750
- train (sample): presence object: share of 'present' readings that abstain 0.071
- train (sample): presence object: share of true 'present' readings that abstain 0.071
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.033
- train (sample): presence relation: share of true 'present' readings that abstain 0.024
- train (sample): presence landmark: share of 'present' readings that abstain 0.033
- train (sample): presence landmark: share of true 'present' readings that abstain 0.033
- train (sample): structure (depth, negation) 0.883
- train (sample): predicate (surface lemma) 0.880
- train (sample): event type (synonym table) 0.880
- train (sample): role object 0.827
- train (sample): head object 0.827
- train (sample): occupancy: known filler 0.868
- train (sample): heads FULL (model) 0.750
- train (sample): heads FULL (lexical order baseline) 0.027
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.790
- train (sample): FULL [depth given] 0.750
- train (sample): FULL [depth and negation given] 0.750
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: present read present 0.875
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): presence shape: share of 'present' readings that abstain 0.016
- train (sample): presence shape: share of true 'present' readings that abstain 0.016
- train (sample): presence landmark2: share of 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence relation: share of FALSE 'present' readings that abstain 0.143
- train (sample): presence amount: share of 'present' readings that abstain 0.000
- train (sample): presence amount: share of true 'present' readings that abstain 0.000
- train (sample): presence region: present read present 0.865
- train (sample): presence region: share of 'present' readings that abstain 0.050
- train (sample): presence region: share of true 'present' readings that abstain 0.031
- train (sample): presence direction: share of 'present' readings that abstain 0.000
- train (sample): presence direction: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.125
- train (sample): presence members: share of 'present' readings that abstain 0.000
- train (sample): presence members: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 3)
- heldout_formulations: `make QUANT SHAPE to COLOR` FULL 0.000 (n 1)
- heldout_formulations: `NAME POS NAME` FULL 0.000 (n 1)
- heldout_formulations: `make the NAME a tall SIZE SHAPE` FULL 0.000 (n 1)
- heldout_formulations: `QUANT is a SHAPE should become COLOR` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role direction | role amount | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.704 | 0.704 | 0.775 | 0.972 | 0.901 | 1.000 | 1.000 | 1.000 | 0.958 | 0.986 | 1.000 | 0.958 | 1.000 | 1.000 | 0.972 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.732 | 0.732 | 0.789 | 0.986 | 0.901 | 1.000 | 1.000 | 1.000 | 0.958 | 0.986 | 1.000 | 0.958 | 1.000 | 1.000 | 0.972 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.746 | 0.746 | 0.845 | 1.000 | 0.901 | 1.000 | 1.000 | 1.000 | 0.958 | 0.986 | 1.000 | 0.958 | 0.944 | 1.000 | 0.972 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.914 | 0.500 | 0.707 | 0.037 (0.000 / 0.038) |
| heldout_formulations | object | comparison: pooled midpoint | 0.931 | 0.500 | 0.716 |  |
| heldout_formulations | shape | product: fitted | 0.857 | 1.000 | 0.929 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.929 | 1.000 | 0.964 |  |
| heldout_formulations | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.889 | 1.000 | 0.944 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.889 | 1.000 | 0.944 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 1.000 | 0.961 | 0.980 | 0.000 (0.000 / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 1.000 | 0.961 | 0.980 |  |
| heldout_formulations | direction | product: fitted | — | 1.000 | — |  |
| heldout_formulations | direction | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | amount | product: fitted | — | 1.000 | — |  |
| heldout_formulations | amount | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | members | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | members | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| train (sample) | object | product: fitted | 0.933 | 1.000 | 0.967 | 0.071 (— / 0.071) |
| train (sample) | shape | product: fitted | 0.984 | 1.000 | 0.992 | 0.016 (— / 0.016) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | size | product: fitted | 0.990 | 1.000 | 0.995 | 0.000 (— / 0.000) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.934 | 0.960 | 0.947 | 0.033 (0.143 / 0.024) |
| train (sample) | landmark | product: fitted | 0.968 | 1.000 | 0.984 | 0.033 (— / 0.033) |
| train (sample) | landmark2 | product: fitted | 0.875 | 1.000 | 0.938 | 0.000 (— / 0.000) |
| train (sample) | region | product: fitted | 0.865 | 0.965 | 0.915 | 0.050 (0.125 / 0.031) |
| train (sample) | direction | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
