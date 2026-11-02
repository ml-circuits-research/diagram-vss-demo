# REPORT — world `shapes7r2`, legend sha256:654618c0ca21… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
7737 annotated sentences from 2 files; provenance: {'llm': 7737}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_shapes7r2_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 333 sentences
- heldout_formulations: 323 sentences
- train: 7081 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
44153 tokens in the examples; 1763 with no kind in the lexicon (share 0.040), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cuda, codes path+chainL+bigram, gates learned (closed start). Code commit 53bb062. Memory curve: runs/micro_shapes7r2_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.084 [rule: fit; pooled midpoint 0.357 (comparison)] (present 0.714, n 218 / absent 0.000, n 17450066)
- presence:object: threshold 0.603 [rule: fit; pooled midpoint 1.713 (comparison)] (present 2.812, n 6984 / absent 0.615, n 430)
- attr_presence:object: threshold 0.261 [rule: fit; pooled midpoint 0.374 (comparison)] (present 0.672, n 22 / absent 0.077, n 6962)
- det_presence:object: threshold 0.195 [rule: fit; pooled midpoint 0.377 (comparison)] (present 0.715, n 108 / absent 0.039, n 6876)
- presence:shape: threshold 0.416 [rule: fit; pooled midpoint 0.690 (comparison)] (present 1.265, n 1981 / absent 0.114, n 5433)
- presence:color: threshold 0.569 [rule: fit; pooled midpoint 1.302 (comparison)] (present 2.478, n 5568 / absent 0.126, n 1846)
- presence:size: threshold 0.568 [rule: fit; pooled midpoint 0.748 (comparison)] (present 1.349, n 2674 / absent 0.148, n 4740)
- presence:name: threshold 0.401 [rule: fit; pooled midpoint 0.492 (comparison)] (present 0.926, n 797 / absent 0.059, n 6617)
- presence:text: threshold 0.235 [rule: fit; pooled midpoint 0.412 (comparison)] (present 0.754, n 235 / absent 0.069, n 7179)
- presence:relation: threshold 0.398 [rule: fit; pooled midpoint 0.589 (comparison)] (present 1.128, n 1301 / absent 0.049, n 6113)
- presence:landmark: threshold 0.251 [rule: fit; pooled midpoint 0.534 (comparison)] (present 0.976, n 1369 / absent 0.092, n 6045)
- presence:landmark2: threshold 0.226 [rule: fit; pooled midpoint 0.299 (comparison)] (present 0.484, n 216 / absent 0.115, n 7198)
- presence:relation2: threshold 0.172 [rule: fit; pooled midpoint 0.382 (comparison)] (present 0.702, n 134 / absent 0.062, n 7280)
- presence:landmark3: threshold 0.192 [rule: fit; pooled midpoint 0.232 (comparison)] (present 0.350, n 193 / absent 0.113, n 7221)
- presence:region: threshold 0.235 [rule: fit; pooled midpoint 0.568 (comparison)] (present 1.080, n 111 / absent 0.057, n 7303)
- presence:quantity: threshold 0.610 [rule: fit; pooled midpoint 0.559 (comparison)] (present 1.092, n 130 / absent 0.026, n 7284)
- presence:members: threshold 0.270 [rule: fit; pooled midpoint 0.648 (comparison)] (present 1.024, n 121 / absent 0.273, n 7293)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, relation2 0.067, landmark3 0.000, region 0.067, quantity 0.200, members 0.000, predicate 0.111

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 323)
| axis | accuracy |
|---|---|
| FULL | 0.720 |
| FULL [pooled midpoint (comparison)] | 0.000 |
| presence object: present read present | 0.941 |
| presence object: share of 'present' readings that abstain | 0.027 |
| presence object: share of true 'present' readings that abstain | 0.027 |
| presence shape: absent read absent | 0.989 |
| presence color: present read present | 0.960 |
| presence color: share of 'present' readings that abstain | 0.031 |
| presence color: share of true 'present' readings that abstain | 0.031 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence relation2: absent read absent | 1.000 |
| presence landmark3: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.847 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.993 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.827 |
| event type (synonym table) | 0.827 |
| role object | 0.807 |
| head object | 0.813 |
| lexical order head object | 0.940 |
| lexical bag head object | 0.700 |
| occupancy: known filler | 0.830 |
| role shape | 0.967 |
| head shape | 0.967 |
| lexical order head shape | 0.713 |
| lexical bag head shape | 0.953 |
| occupancy: not given | 0.999 |
| role color | 0.840 |
| head color | 0.840 |
| lexical order head color | 0.973 |
| lexical bag head color | 0.987 |
| role size | 0.940 |
| head size | 0.940 |
| lexical order head size | 0.633 |
| lexical bag head size | 0.833 |
| role name | 0.973 |
| head name | 0.973 |
| lexical order head name | 0.893 |
| lexical bag head name | 0.940 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.973 |
| lexical bag head text | 0.980 |
| role relation | 0.987 |
| head relation | 0.987 |
| lexical order head relation | 0.847 |
| lexical bag head relation | 0.933 |
| role landmark | 0.987 |
| head landmark | 0.987 |
| lexical order head landmark | 0.847 |
| lexical bag head landmark | 0.887 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.973 |
| lexical bag head landmark2 | 0.980 |
| role relation2 | 1.000 |
| head relation2 | 1.000 |
| lexical order head relation2 | 0.993 |
| lexical bag head relation2 | 0.993 |
| role landmark3 | 0.987 |
| head landmark3 | 0.987 |
| lexical order head landmark3 | 0.987 |
| lexical bag head landmark3 | 0.980 |
| role region | 0.993 |
| head region | 0.993 |
| lexical order head region | 0.960 |
| lexical bag head region | 0.973 |
| role quantity | 0.993 |
| head quantity | 0.993 |
| lexical order head quantity | 0.973 |
| lexical bag head quantity | 0.980 |
| role members | 0.980 |
| head members | 0.980 |
| lexical order head members | 0.973 |
| lexical bag head members | 0.973 |
| heads FULL (model) | 0.747 |
| heads FULL (lexical order baseline) | 0.353 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.553 |
| role object [pooled midpoint (comparison)] | 0.080 |
| role shape [pooled midpoint (comparison)] | 0.953 |
| role color [pooled midpoint (comparison)] | 0.213 |
| role size [pooled midpoint (comparison)] | 0.887 |
| role name [pooled midpoint (comparison)] | 0.973 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.987 |
| role landmark [pooled midpoint (comparison)] | 0.967 |
| role landmark2 [pooled midpoint (comparison)] | 0.993 |
| role relation2 [pooled midpoint (comparison)] | 0.993 |
| role landmark3 [pooled midpoint (comparison)] | 0.987 |
| role region [pooled midpoint (comparison)] | 0.960 |
| role quantity [pooled midpoint (comparison)] | 0.993 |
| role members [pooled midpoint (comparison)] | 0.973 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.020 |
| presence object: present read present [pooled midpoint (comparison)] | 0.009 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.020 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark3: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 0.958 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.826 |
| occupancy: unknown filler | 0.818 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.947 |
| presence name: present read present | 0.923 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.048 |
| presence relation: share of true 'present' readings that abstain | 0.048 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 0.923 |
| presence relation: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.857 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 0.875 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.333 |
| presence members: share of true 'present' readings that abstain | 0.333 |
| set members: first gold member in the decoded set | 0.750 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.667 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.667 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present [pooled midpoint (comparison)] | 0.000 |
| presence landmark3: present read present | 0.000 |
| presence landmark3: present read present [pooled midpoint (comparison)] | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence relation2: present read present | 1.000 |
| presence relation2: share of 'present' readings that abstain | 0.000 |
| presence relation2: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.750 |
| presence relation2: present read present [pooled midpoint (comparison)] | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence shape: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.242; status {'ok': 119, 'unknown-event': 20, 'no-sense': 3, 'abstain': 8}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.827 | 0.430 / 0.049 | 0.90 | 0.073 | 0.000 / 0.100 |
| role object | 0.799 | 0.397 / 0.128 | 0.92 | 0.137 | 0.014 / 0.065 |
| roles (pooled) | 0.820 | 0.361 / 0.079 | 0.91 | 0.108 | 0.014 / 0.072 |
| role color | 0.800 | 0.401 / 0.076 | 0.90 | 0.117 | 0.017 / 0.083 |
| role size | 0.836 | 0.313 / 0.069 | 0.93 | 0.091 | 0.000 / 0.073 |
| role shape | 0.907 | 0.405 / 0.326 | 1.00 | 0.093 | 0.000 / 0.000 |
| role name | 0.750 | 0.271 / 0.064 | 0.88 | 0.125 | 0.000 / 0.125 |
| role region | 0.833 | 0.228 / 0.197 | 1.00 | 0.167 | 0.000 / 0.000 |
| role relation | 0.913 | 0.296 / 0.054 | 0.87 | 0.000 | 0.043 / 0.087 |
| role landmark | 0.913 | 0.266 / 0.093 | 0.91 | 0.000 | 0.000 / 0.087 |
| role quantity | 0.750 | 0.106 / 0.036 | 0.75 | 0.000 | 0.000 / 0.250 |
| role members | 0.250 | 0.340 / 0.043 | 0.75 | 0.750 | 0.250 / 0.000 |
| role text | 1.000 | 0.284 / 0.234 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark3 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role landmark2 | 1.000 | 0.142 / 0.081 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation2 | 1.000 | 0.140 / 0.140 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 150 of 7081)
| axis | accuracy |
|---|---|
| FULL | 0.800 |
| presence object: present read present | 0.976 |
| presence object: share of 'present' readings that abstain | 0.016 |
| presence object: share of true 'present' readings that abstain | 0.016 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 0.989 |
| presence color: share of 'present' readings that abstain | 0.011 |
| presence color: share of true 'present' readings that abstain | 0.011 |
| presence size: absent read absent | 0.988 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence relation2: absent read absent | 1.000 |
| presence landmark3: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.867 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.993 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.847 |
| event type (synonym table) | 0.847 |
| role object | 0.867 |
| head object | 0.867 |
| lexical order head object | 0.960 |
| lexical bag head object | 0.820 |
| occupancy: known filler | 0.874 |
| role shape | 0.973 |
| head shape | 0.973 |
| lexical order head shape | 0.700 |
| lexical bag head shape | 0.953 |
| role color | 0.893 |
| head color | 0.893 |
| lexical order head color | 0.993 |
| lexical bag head color | 0.973 |
| role size | 0.960 |
| head size | 0.960 |
| lexical order head size | 0.660 |
| lexical bag head size | 0.887 |
| occupancy: not given | 0.999 |
| role name | 0.973 |
| head name | 0.973 |
| lexical order head name | 0.853 |
| lexical bag head name | 0.987 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.967 |
| lexical bag head text | 1.000 |
| role relation | 0.967 |
| head relation | 0.967 |
| lexical order head relation | 0.800 |
| lexical bag head relation | 0.987 |
| role landmark | 0.973 |
| head landmark | 0.973 |
| lexical order head landmark | 0.800 |
| lexical bag head landmark | 0.973 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.953 |
| lexical bag head landmark2 | 0.987 |
| role relation2 | 1.000 |
| head relation2 | 1.000 |
| lexical order head relation2 | 0.973 |
| lexical bag head relation2 | 0.973 |
| role landmark3 | 0.993 |
| head landmark3 | 0.993 |
| lexical order head landmark3 | 0.960 |
| lexical bag head landmark3 | 0.973 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 0.973 |
| lexical bag head region | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.993 |
| lexical bag head quantity | 1.000 |
| role members | 0.987 |
| head members | 0.987 |
| lexical order head members | 0.980 |
| lexical bag head members | 0.980 |
| heads FULL (model) | 0.807 |
| heads FULL (lexical order baseline) | 0.333 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.667 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence name: present read present | 0.947 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.038 |
| presence relation: share of true 'present' readings that abstain | 0.038 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.038 |
| presence landmark: share of true 'present' readings that abstain | 0.038 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.143 |
| presence landmark2: share of true 'present' readings that abstain | 0.143 |
| presence object: absent read absent | 0.750 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.500 |
| presence members: share of true 'present' readings that abstain | 0.500 |
| set members: first gold member in the decoded set | 0.667 |
| occupancy: unknown filler | 0.667 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence landmark3: present read present | 0.833 |
| presence landmark3: share of 'present' readings that abstain | 0.200 |
| presence landmark3: share of true 'present' readings that abstain | 0.200 |
| presence relation2: present read present | 1.000 |
| presence relation2: share of 'present' readings that abstain | 0.250 |
| presence relation2: share of true 'present' readings that abstain | 0.250 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.205; status {'ok': 122, 'unknown-event': 20, 'abstain': 8}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.847 | 0.427 / 0.050 | 0.90 | 0.053 | 0.000 / 0.100 |
| role object | 0.866 | 0.396 / 0.128 | 0.96 | 0.113 | 0.014 / 0.021 |
| roles (pooled) | 0.869 | 0.365 / 0.124 | 0.95 | 0.094 | 0.018 / 0.037 |
| role shape | 0.911 | 0.389 / 0.260 | 0.98 | 0.067 | 0.000 / 0.022 |
| role color | 0.850 | 0.420 / 0.228 | 0.95 | 0.112 | 0.009 / 0.037 |
| role name | 0.818 | 0.271 / 0.010 | 0.86 | 0.045 | 0.000 / 0.136 |
| role relation | 0.833 | 0.335 / 0.108 | 0.90 | 0.067 | 0.000 / 0.100 |
| role landmark | 0.867 | 0.244 / 0.055 | 0.90 | 0.067 | 0.033 / 0.067 |
| role size | 0.902 | 0.378 / 0.249 | 1.00 | 0.098 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.157 / 0.105 | 0.86 | 0.000 | 0.143 / 0.000 |
| role members | 0.333 | 0.278 / 0.052 | 0.67 | 0.667 | 0.333 / 0.000 |
| role text | 1.000 | 0.230 / 0.165 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 1.000 | 0.268 / 0.210 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.119 / 0.119 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark3 | 0.833 | 0.082 / 0.007 | 0.67 | 0.000 | 0.167 / 0.167 |
| role relation2 | 1.000 | 0.156 / 0.078 | 0.75 | 0.000 | 0.250 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 a=1.00 COLOR=1.00 are=0.82 SIZE=0.81 NUM=0.74 DIR=0.69 c17_be=0.67 c6_both=0.67 ARROW=0.67 c27_them=0.62 c4_then=0.59 QUANT=0.52 SUPER=0.50 NAME=0.45 c9_an=0.44 c10_three=0.44 the=0.43 c3_rules=0.42 it=0.42 c22_from=0.42 VERB=0.40 with=0.37 RECENT=0.35 c16_new=0.34 of=0.30 c14_uh=0.30 c19_goes=0.23 TEXT=0.21 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 STYLE=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 lines=0.12 c26_shape=0.08 LAYOUT=0.07 c18_does=0.04 directly=0.04 c12_that=0.00 c2_now=0.00 c8_what's=0.00 c5_me=0.00 c23_in=0.00 c11_what=0.00 c13_one=0.00 c15_on=0.00 c1_have=0.00 c7_i=0.00 and=0.00 to=0.00 labeled=0.00 SHAPE=0.00 unknown=0.00 named=0.00 called=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.720
- heldout_formulations: presence object: share of 'present' readings that abstain 0.027
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.027
- heldout_formulations: presence color: share of 'present' readings that abstain 0.031
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.031
- heldout_formulations: structure (depth, negation) 0.847
- heldout_formulations: predicate (surface lemma) 0.827
- heldout_formulations: event type (synonym table) 0.827
- heldout_formulations: role object 0.807
- heldout_formulations: head object 0.813
- heldout_formulations: occupancy: known filler 0.830
- heldout_formulations: role color 0.840
- heldout_formulations: head color 0.840
- heldout_formulations: heads FULL (model) 0.747
- heldout_formulations: heads FULL (lexical order baseline) 0.353
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.553
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.000
- heldout_formulations: role object [pooled midpoint (comparison)] 0.080
- heldout_formulations: role color [pooled midpoint (comparison)] 0.213
- heldout_formulations: role size [pooled midpoint (comparison)] 0.887
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.020
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.009
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.020
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: present read present [pooled midpoint (comparison)] 0.826
- heldout_formulations: occupancy: unknown filler 0.818
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.048
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.048
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.857
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: absent read absent 0.875
- heldout_formulations: presence members: share of 'present' readings that abstain 0.333
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.333
- heldout_formulations: set members: first gold member in the decoded set 0.750
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.667
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence landmark3: present read present 0.000
- heldout_formulations: presence landmark3: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence relation2: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.800
- train (sample): presence object: share of 'present' readings that abstain 0.016
- train (sample): presence object: share of true 'present' readings that abstain 0.016
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.011
- train (sample): presence color: share of true 'present' readings that abstain 0.011
- train (sample): structure (depth, negation) 0.867
- train (sample): predicate (surface lemma) 0.847
- train (sample): event type (synonym table) 0.847
- train (sample): role object 0.867
- train (sample): head object 0.867
- train (sample): occupancy: known filler 0.874
- train (sample): role color 0.893
- train (sample): head color 0.893
- train (sample): heads FULL (model) 0.807
- train (sample): heads FULL (lexical order baseline) 0.333
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.667
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.038
- train (sample): presence relation: share of true 'present' readings that abstain 0.038
- train (sample): presence landmark: share of 'present' readings that abstain 0.038
- train (sample): presence landmark: share of true 'present' readings that abstain 0.038
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.143
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.143
- train (sample): presence object: absent read absent 0.750
- train (sample): presence members: share of 'present' readings that abstain 0.500
- train (sample): presence members: share of true 'present' readings that abstain 0.500
- train (sample): set members: first gold member in the decoded set 0.667
- train (sample): occupancy: unknown filler 0.667
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark3: present read present 0.833
- train (sample): presence landmark3: share of 'present' readings that abstain 0.200
- train (sample): presence landmark3: share of true 'present' readings that abstain 0.200
- train (sample): presence relation2: share of 'present' readings that abstain 0.250
- train (sample): presence relation2: share of true 'present' readings that abstain 0.250
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME COLOR` FULL 0.000 (n 4)
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 4)
- heldout_formulations: `from_now_on , all new SHAPE should be COLOR` FULL 0.000 (n 2)
- heldout_formulations: `make c27_them all COLOR` FULL 0.000 (n 2)
- heldout_formulations: `make the NAME larger` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role relation2 | role landmark3 | role region | role quantity | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.747 | 0.720 | 0.807 | 0.967 | 0.840 | 0.940 | 0.973 | 1.000 | 0.987 | 0.987 | 1.000 | 1.000 | 0.987 | 0.993 | 0.993 | 0.980 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.020 | 0.000 | 0.080 | 0.953 | 0.213 | 0.887 | 0.973 | 1.000 | 0.987 | 0.967 | 0.993 | 0.993 | 0.987 | 0.960 | 0.993 | 0.973 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.941 | 0.875 | 0.908 | 0.027 (0.000 / 0.027) |
| heldout_formulations | object | comparison: pooled midpoint | 0.009 | 1.000 | 0.504 |  |
| heldout_formulations | shape | product: fitted | 1.000 | 0.989 | 0.994 | 0.000 (0.000 / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.947 | 1.000 | 0.974 |  |
| heldout_formulations | color | product: fitted | 0.960 | 1.000 | 0.980 | 0.031 (— / 0.031) |
| heldout_formulations | color | comparison: pooled midpoint | 0.020 | 1.000 | 0.510 |  |
| heldout_formulations | size | product: fitted | 0.958 | 1.000 | 0.979 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 0.826 | 1.000 | 0.913 |  |
| heldout_formulations | name | product: fitted | 0.923 | 1.000 | 0.962 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 0.923 | 1.000 | 0.962 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.048 (— / 0.048) |
| heldout_formulations | relation | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.857 | 1.000 | 0.929 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_formulations | relation2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | relation2 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark3 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark3 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.333 (— / 0.333) |
| heldout_formulations | members | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| train (sample) | object | product: fitted | 0.976 | 0.750 | 0.863 | 0.016 (0.000 / 0.016) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.989 | 1.000 | 0.995 | 0.011 (— / 0.011) |
| train (sample) | size | product: fitted | 1.000 | 0.988 | 0.994 | 0.000 (0.000 / 0.000) |
| train (sample) | name | product: fitted | 0.947 | 1.000 | 0.974 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.038 (— / 0.038) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.038 (— / 0.038) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.143 (— / 0.143) |
| train (sample) | relation2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.250 (— / 0.250) |
| train (sample) | landmark3 | product: fitted | 0.833 | 1.000 | 0.917 | 0.200 (— / 0.200) |
| train (sample) | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.500 (— / 0.500) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
