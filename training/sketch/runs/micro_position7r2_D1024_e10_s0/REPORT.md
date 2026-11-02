# REPORT — world `position7r2`, legend sha256:54617d552f6e… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
5565 annotated sentences from 2 files; provenance: {'llm': 5565}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_position7r2_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 278 sentences
- heldout_formulations: 266 sentences
- train: 5021 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
29385 tokens in the examples; 1704 with no kind in the lexicon (share 0.058), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cuda, codes path+chainL+bigram, gates learned (closed start). Code commit 9277791. Memory curve: runs/micro_position7r2_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.218 [rule: fit; pooled midpoint 0.495 (comparison)] (present 0.990, n 1619 / absent -0.000, n 15333760)
- presence:object: threshold 0.724 [rule: fit; pooled midpoint 0.750 (comparison)] (present 1.105, n 4247 / absent 0.395, n 1052)
- attr_presence:object: threshold 0.556 [rule: fit; pooled midpoint 0.478 (comparison)] (present 0.889, n 21 / absent 0.067, n 4226)
- det_presence:object: threshold 0.369 [rule: fit; pooled midpoint 0.474 (comparison)] (present 0.921, n 40 / absent 0.027, n 4207)
- presence:relation: threshold 0.336 [rule: fit; pooled midpoint 0.409 (comparison)] (present 0.669, n 1756 / absent 0.149, n 3543)
- presence:landmark: threshold 0.240 [rule: fit; pooled midpoint 0.505 (comparison)] (present 0.925, n 1802 / absent 0.085, n 3497)
- presence:landmark2: threshold 0.222 [rule: fit; pooled midpoint 0.261 (comparison)] (present 0.413, n 137 / absent 0.109, n 5162)
- presence:relation2: threshold 0.149 [rule: fit; pooled midpoint 0.257 (comparison)] (present 0.457, n 83 / absent 0.056, n 5216)
- presence:landmark3: threshold 0.201 [rule: fit; pooled midpoint 0.218 (comparison)] (present 0.328, n 144 / absent 0.107, n 5155)
- presence:region: threshold 0.407 [rule: fit; pooled midpoint 0.450 (comparison)] (present 0.731, n 1354 / absent 0.168, n 3945)
- presence:direction: threshold 0.375 [rule: fit; pooled midpoint 0.455 (comparison)] (present 0.872, n 295 / absent 0.037, n 5004)
- presence:amount: threshold 0.322 [rule: fit; pooled midpoint 0.534 (comparison)] (present 1.006, n 278 / absent 0.062, n 5021)
- presence:axis: threshold 0.612 [rule: fit; pooled midpoint 0.503 (comparison)] (present 1.006, n 461 / absent 0.001, n 4838)
- presence:layout: threshold 0.298 [rule: fit; pooled midpoint 0.452 (comparison)] (present 0.904, n 508 / absent 0.000, n 4791)
- presence:target: threshold 0.151 [rule: fit; pooled midpoint 0.379 (comparison)] (present 0.755, n 225 / absent 0.003, n 5074)
- presence:members: threshold 0.445 [rule: fit; pooled midpoint 0.738 (comparison)] (present 1.319, n 685 / absent 0.156, n 4614)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, relation 0.067, landmark 0.000, landmark2 0.000, relation2 0.067, landmark3 0.000, region 0.067, direction 0.250, amount 0.034, axis 0.500, layout 0.250, target 0.000, members 0.000, predicate 0.125

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 266)
| axis | accuracy |
|---|---|
| FULL | 0.733 |
| FULL [pooled midpoint (comparison)] | 0.680 |
| presence object: present read present | 0.933 |
| presence object: share of 'present' readings that abstain | 0.060 |
| presence object: share of true 'present' readings that abstain | 0.054 |
| presence relation: absent read absent | 0.961 |
| presence landmark: absent read absent | 0.991 |
| presence landmark2: absent read absent | 0.986 |
| presence relation2: absent read absent | 1.000 |
| presence landmark3: absent read absent | 1.000 |
| presence region: present read present | 0.900 |
| presence region: share of 'present' readings that abstain | 0.021 |
| presence region: share of true 'present' readings that abstain | 0.028 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence axis: absent read absent | 0.992 |
| presence layout: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence members: absent read absent | 0.962 |
| structure (depth, negation) | 0.987 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.953 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.953 |
| event type (synonym table) | 0.953 |
| role object | 0.900 |
| head object | 0.900 |
| lexical order head object | 0.860 |
| lexical bag head object | 0.753 |
| occupancy: known filler | 0.877 |
| role relation | 0.900 |
| head relation | 0.900 |
| lexical order head relation | 0.693 |
| lexical bag head relation | 0.867 |
| occupancy: not given | 0.981 |
| role landmark | 0.987 |
| head landmark | 0.987 |
| lexical order head landmark | 0.720 |
| lexical bag head landmark | 0.713 |
| role landmark2 | 0.987 |
| head landmark2 | 0.987 |
| lexical order head landmark2 | 0.987 |
| lexical bag head landmark2 | 0.973 |
| role relation2 | 0.993 |
| head relation2 | 0.993 |
| lexical order head relation2 | 0.987 |
| lexical bag head relation2 | 0.987 |
| role landmark3 | 0.973 |
| head landmark3 | 0.973 |
| lexical order head landmark3 | 0.973 |
| lexical bag head landmark3 | 0.973 |
| role region | 0.893 |
| head region | 0.893 |
| lexical order head region | 0.733 |
| lexical bag head region | 0.833 |
| role direction | 1.000 |
| head direction | 1.000 |
| lexical order head direction | 0.907 |
| lexical bag head direction | 0.953 |
| role amount | 0.993 |
| head amount | 0.993 |
| lexical order head amount | 0.900 |
| lexical bag head amount | 0.947 |
| role axis | 0.980 |
| head axis | 0.980 |
| lexical order head axis | 0.867 |
| lexical bag head axis | 0.973 |
| role layout | 0.993 |
| head layout | 0.993 |
| lexical order head layout | 0.953 |
| lexical bag head layout | 0.987 |
| role target | 1.000 |
| head target | 1.000 |
| lexical order head target | 0.947 |
| lexical bag head target | 0.960 |
| role members | 0.933 |
| head members | 0.933 |
| lexical order head members | 0.880 |
| lexical bag head members | 0.860 |
| heads FULL (model) | 0.740 |
| heads FULL (lexical order baseline) | 0.093 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.333 |
| role object [pooled midpoint (comparison)] | 0.893 |
| role relation [pooled midpoint (comparison)] | 0.860 |
| role landmark [pooled midpoint (comparison)] | 0.973 |
| role landmark2 [pooled midpoint (comparison)] | 0.993 |
| role relation2 [pooled midpoint (comparison)] | 0.987 |
| role landmark3 [pooled midpoint (comparison)] | 0.973 |
| role region [pooled midpoint (comparison)] | 0.887 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 0.987 |
| role axis [pooled midpoint (comparison)] | 0.987 |
| role layout [pooled midpoint (comparison)] | 0.993 |
| role target [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.927 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.687 |
| presence object: present read present [pooled midpoint (comparison)] | 0.916 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 0.951 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 0.991 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence relation2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark3: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: present read present [pooled midpoint (comparison)] | 0.875 |
| presence direction: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence amount: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 0.992 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.985 |
| presence relation: present read present | 0.761 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence region: absent read absent | 0.889 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.674 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.952 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.889 |
| presence object: absent read absent | 0.828 |
| presence axis: present read present | 0.900 |
| presence axis: share of 'present' readings that abstain | 0.053 |
| presence axis: share of true 'present' readings that abstain | 0.056 |
| presence members: present read present | 0.944 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 0.944 |
| occupancy: unknown filler | 0.971 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.862 |
| presence axis: present read present [pooled midpoint (comparison)] | 0.950 |
| presence members: present read present [pooled midpoint (comparison)] | 0.778 |
| presence target: present read present | 1.000 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present [pooled midpoint (comparison)] | 1.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.200 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence layout: present read present | 0.857 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence layout: present read present [pooled midpoint (comparison)] | 0.857 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.500 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence direction: present read present | 1.000 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.000 |
| presence amount: share of true 'present' readings that abstain | 0.000 |
| presence direction: present read present [pooled midpoint (comparison)] | 1.000 |
| presence amount: present read present [pooled midpoint (comparison)] | 0.929 |
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark2: share of FALSE 'present' readings that abstain | 1.000 |
| presence landmark3: present read present | 0.000 |
| presence landmark3: present read present [pooled midpoint (comparison)] | 0.000 |
| presence relation2: present read present | 0.500 |
| presence relation2: present read present [pooled midpoint (comparison)] | 0.000 |
| presence relation2: share of 'present' readings that abstain | 0.000 |
| presence relation2: share of true 'present' readings that abstain | 0.000 |
| presence axis: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.107; status {'ok': 132, 'abstain': 16, 'unknown-event': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.953 | 0.515 / 0.393 | 1.00 | 0.047 | 0.000 / 0.000 |
| role object | 0.917 | 0.305 / 0.017 | 0.88 | 0.017 | 0.050 / 0.066 |
| roles (pooled) | 0.882 | 0.321 / 0.011 | 0.88 | 0.024 | 0.024 / 0.094 |
| role region | 0.900 | 0.309 / 0.036 | 0.88 | 0.000 | 0.025 / 0.100 |
| role relation | 0.761 | 0.238 / 0.000 | 0.76 | 0.000 | 0.000 / 0.239 |
| role landmark | 0.976 | 0.432 / 0.257 | 1.00 | 0.024 | 0.000 / 0.000 |
| role axis | 0.900 | 0.315 / 0.045 | 0.85 | 0.000 | 0.050 / 0.100 |
| role members | 0.722 | 0.279 / 0.079 | 0.94 | 0.222 | 0.000 / 0.056 |
| role target | 1.000 | 0.487 / 0.428 | 1.00 | 0.000 | 0.000 / 0.000 |
| role layout | 0.857 | 0.367 / 0.183 | 0.86 | 0.000 | 0.000 / 0.143 |
| role landmark2 | 1.000 | 0.206 / 0.179 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 1.000 | 0.394 / 0.224 | 1.00 | 0.000 | 0.000 / 0.000 |
| role amount | 0.933 | 0.442 / 0.315 | 1.00 | 0.067 | 0.000 / 0.000 |
| role landmark3 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role relation2 | 0.500 | 0.031 / 0.006 | 0.50 | 0.000 | 0.000 / 0.500 |

### train (sample) — catalog candidates (n = 150 of 5021)
| axis | accuracy |
|---|---|
| FULL | 0.793 |
| presence object: present read present | 0.963 |
| presence object: share of 'present' readings that abstain | 0.075 |
| presence object: share of true 'present' readings that abstain | 0.077 |
| presence relation: absent read absent | 0.944 |
| presence landmark: absent read absent | 0.981 |
| presence landmark2: absent read absent | 0.993 |
| presence relation2: absent read absent | 1.000 |
| presence landmark3: absent read absent | 1.000 |
| presence region: present read present | 0.909 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence members: absent read absent | 0.991 |
| structure (depth, negation) | 0.973 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.993 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.920 |
| event type (synonym table) | 0.920 |
| role object | 0.940 |
| head object | 0.940 |
| lexical order head object | 0.767 |
| lexical bag head object | 0.947 |
| occupancy: known filler | 0.909 |
| role relation | 0.927 |
| head relation | 0.927 |
| lexical order head relation | 0.740 |
| lexical bag head relation | 0.840 |
| occupancy: not given | 0.986 |
| role landmark | 0.980 |
| head landmark | 0.980 |
| lexical order head landmark | 0.733 |
| lexical bag head landmark | 0.820 |
| role landmark2 | 0.993 |
| head landmark2 | 0.993 |
| lexical order head landmark2 | 0.987 |
| lexical bag head landmark2 | 0.987 |
| role relation2 | 1.000 |
| head relation2 | 1.000 |
| lexical order head relation2 | 0.987 |
| lexical bag head relation2 | 0.993 |
| role landmark3 | 0.993 |
| head landmark3 | 0.993 |
| lexical order head landmark3 | 0.960 |
| lexical bag head landmark3 | 0.987 |
| role region | 0.893 |
| head region | 0.893 |
| lexical order head region | 0.693 |
| lexical bag head region | 0.867 |
| role direction | 0.993 |
| head direction | 0.993 |
| lexical order head direction | 0.947 |
| lexical bag head direction | 0.987 |
| role amount | 0.993 |
| head amount | 0.993 |
| lexical order head amount | 0.953 |
| lexical bag head amount | 0.993 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.873 |
| lexical bag head axis | 1.000 |
| role layout | 0.967 |
| head layout | 0.967 |
| lexical order head layout | 0.907 |
| lexical bag head layout | 1.000 |
| role target | 1.000 |
| head target | 1.000 |
| lexical order head target | 0.973 |
| lexical bag head target | 1.000 |
| role members | 0.967 |
| head members | 0.967 |
| lexical order head members | 0.787 |
| lexical bag head members | 0.787 |
| heads FULL (model) | 0.800 |
| heads FULL (lexical order baseline) | 0.100 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.540 |
| presence object: absent read absent | 0.947 |
| presence region: absent read absent | 0.902 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.030 |
| presence members: share of true 'present' readings that abstain | 0.031 |
| set members: first gold member in the decoded set | 1.000 |
| occupancy: unknown filler | 1.000 |
| presence relation: present read present | 0.872 |
| presence landmark: present read present | 0.975 |
| presence landmark: share of 'present' readings that abstain | 0.024 |
| presence landmark: share of true 'present' readings that abstain | 0.026 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence relation: share of 'present' readings that abstain | 0.100 |
| presence relation: share of FALSE 'present' readings that abstain | 0.167 |
| presence direction: present read present | 1.000 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.000 |
| presence amount: share of true 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |
| presence layout: present read present | 0.643 |
| presence relation: share of true 'present' readings that abstain | 0.088 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 1.000 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark3: present read present | 0.833 |
| presence landmark3: share of 'present' readings that abstain | 0.000 |
| presence landmark3: share of true 'present' readings that abstain | 0.000 |
| presence relation2: present read present | 1.000 |
| presence relation2: share of 'present' readings that abstain | 0.000 |
| presence relation2: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.141; status {'abstain': 20, 'ok': 126, 'no-sense': 2, 'unknown-event': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.920 | 0.512 / 0.379 | 0.97 | 0.053 | 0.000 / 0.027 |
| role object | 0.937 | 0.281 / 0.038 | 0.88 | 0.018 | 0.072 / 0.045 |
| roles (pooled) | 0.906 | 0.299 / 0.038 | 0.89 | 0.018 | 0.036 / 0.076 |
| role region | 0.870 | 0.302 / 0.052 | 0.89 | 0.022 | 0.000 / 0.109 |
| role axis | 1.000 | 0.342 / 0.169 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.875 | 0.295 / 0.162 | 0.97 | 0.094 | 0.000 / 0.031 |
| role relation | 0.872 | 0.235 / 0.000 | 0.79 | 0.000 | 0.077 / 0.128 |
| role landmark | 0.975 | 0.368 / 0.203 | 0.95 | 0.000 | 0.025 / 0.025 |
| role direction | 0.875 | 0.392 / 0.254 | 0.88 | 0.000 | 0.000 / 0.125 |
| role amount | 0.857 | 0.364 / 0.219 | 0.86 | 0.000 | 0.000 / 0.143 |
| role layout | 0.643 | 0.299 / 0.000 | 0.64 | 0.000 | 0.000 / 0.357 |
| role landmark2 | 1.000 | 0.173 / 0.137 | 1.00 | 0.000 | 0.000 / 0.000 |
| role target | 1.000 | 0.447 / 0.373 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark3 | 0.833 | 0.178 / 0.060 | 0.83 | 0.000 | 0.000 / 0.167 |
| role relation2 | 1.000 | 0.289 / 0.277 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 AXIS=1.00 LAYOUT=1.00 c9_an=0.92 c27_them=0.86 c1_have=0.81 c22_from=0.80 and=0.78 with=0.76 NUM=0.74 c26_shape=0.70 VERB=0.66 are=0.63 to=0.62 c16_new=0.60 SHAPE=0.59 c13_one=0.54 c2_now=0.47 c10_three=0.44 c18_does=0.43 c19_goes=0.43 c14_uh=0.39 DIR=0.39 c11_what=0.38 c5_me=0.38 c12_that=0.35 of=0.34 COLOR=0.32 c7_i=0.29 SIZE=0.28 c4_then=0.18 RECENT=0.17 ARROW=0.12 NOTCOLOR=0.12 PAIR=0.12 STYLE=0.12 SUPER=0.12 c21_arrowheads=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c3_rules=0.10 c20_arrow=0.07 c23_in=0.03 QUANT=0.02 c8_what's=0.02 c24_line=0.01 it=0.00 c17_be=0.00 c6_both=0.00 c25_pixels=0.00 a=0.00 the=0.00 c15_on=0.00 NAME=0.00 unknown=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.733
- heldout_formulations: presence object: share of 'present' readings that abstain 0.060
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.054
- heldout_formulations: presence region: share of 'present' readings that abstain 0.021
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.028
- heldout_formulations: occupancy: known filler 0.877
- heldout_formulations: role region 0.893
- heldout_formulations: head region 0.893
- heldout_formulations: heads FULL (model) 0.740
- heldout_formulations: heads FULL (lexical order baseline) 0.093
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.333
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.680
- heldout_formulations: role object [pooled midpoint (comparison)] 0.893
- heldout_formulations: role relation [pooled midpoint (comparison)] 0.860
- heldout_formulations: role region [pooled midpoint (comparison)] 0.887
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.687
- heldout_formulations: presence region: present read present [pooled midpoint (comparison)] 0.875
- heldout_formulations: presence relation: present read present 0.761
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: absent read absent 0.889
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.674
- heldout_formulations: presence region: absent read absent [pooled midpoint (comparison)] 0.889
- heldout_formulations: presence object: absent read absent 0.828
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.053
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.056
- heldout_formulations: presence members: share of 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: absent read absent [pooled midpoint (comparison)] 0.862
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.778
- heldout_formulations: presence target: share of 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.200
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence layout: present read present 0.857
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence layout: present read present [pooled midpoint (comparison)] 0.857
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.500
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence direction: share of 'present' readings that abstain 0.000
- heldout_formulations: presence direction: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence amount: share of 'present' readings that abstain 0.000
- heldout_formulations: presence amount: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark3: present read present 0.000
- heldout_formulations: presence landmark3: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence relation2: present read present 0.500
- heldout_formulations: presence relation2: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence relation2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.793
- train (sample): presence object: share of 'present' readings that abstain 0.075
- train (sample): presence object: share of true 'present' readings that abstain 0.077
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): role region 0.893
- train (sample): head region 0.893
- train (sample): heads FULL (model) 0.800
- train (sample): heads FULL (lexical order baseline) 0.100
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.540
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.030
- train (sample): presence members: share of true 'present' readings that abstain 0.031
- train (sample): presence relation: present read present 0.872
- train (sample): presence landmark: share of 'present' readings that abstain 0.024
- train (sample): presence landmark: share of true 'present' readings that abstain 0.026
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.100
- train (sample): presence relation: share of FALSE 'present' readings that abstain 0.167
- train (sample): presence direction: share of 'present' readings that abstain 0.000
- train (sample): presence direction: share of true 'present' readings that abstain 0.000
- train (sample): presence amount: share of 'present' readings that abstain 0.000
- train (sample): presence amount: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence layout: present read present 0.643
- train (sample): presence relation: share of true 'present' readings that abstain 0.088
- train (sample): presence landmark2: share of 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of 'present' readings that abstain 0.000
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence landmark3: present read present 0.833
- train (sample): presence landmark3: share of 'present' readings that abstain 0.000
- train (sample): presence landmark3: share of true 'present' readings that abstain 0.000
- train (sample): presence relation2: share of 'present' readings that abstain 0.000
- train (sample): presence relation2: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `distribute c27_them AXIS` FULL 0.000 (n 3)
- heldout_formulations: `move NAME POS` FULL 0.000 (n 2)
- heldout_formulations: `distribute NAME AXIS` FULL 0.000 (n 2)
- heldout_formulations: `NAME move POS NAME and under NAME` FULL 0.000 (n 2)
- heldout_formulations: `NAME , NAME and NAME move POS NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role relation | role landmark | role landmark2 | role relation2 | role landmark3 | role region | role direction | role amount | role axis | role layout | role target | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.740 | 0.733 | 0.900 | 0.900 | 0.987 | 0.987 | 0.993 | 0.973 | 0.893 | 1.000 | 0.993 | 0.980 | 0.993 | 1.000 | 0.933 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.687 | 0.680 | 0.893 | 0.860 | 0.973 | 0.993 | 0.987 | 0.973 | 0.887 | 1.000 | 0.987 | 0.987 | 0.993 | 1.000 | 0.927 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.933 | 0.828 | 0.880 | 0.060 (0.200 / 0.054) |
| heldout_formulations | object | comparison: pooled midpoint | 0.916 | 0.862 | 0.889 |  |
| heldout_formulations | relation | product: fitted | 0.761 | 0.961 | 0.861 | 0.000 (0.000 / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.674 | 0.951 | 0.812 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 0.991 | 0.995 | 0.000 (0.000 / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.952 | 0.991 | 0.971 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 0.986 | 0.993 | 0.500 (1.000 / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 0.993 | 0.997 |  |
| heldout_formulations | relation2 | product: fitted | 0.500 | 1.000 | 0.750 | 0.000 (— / 0.000) |
| heldout_formulations | relation2 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark3 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark3 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | region | product: fitted | 0.900 | 0.889 | 0.894 | 0.021 (0.000 / 0.028) |
| heldout_formulations | region | comparison: pooled midpoint | 0.875 | 0.889 | 0.882 |  |
| heldout_formulations | direction | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | direction | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | amount | comparison: pooled midpoint | 0.929 | 1.000 | 0.964 |  |
| heldout_formulations | axis | product: fitted | 0.900 | 0.992 | 0.946 | 0.053 (0.000 / 0.056) |
| heldout_formulations | axis | comparison: pooled midpoint | 0.950 | 0.992 | 0.971 |  |
| heldout_formulations | layout | product: fitted | 0.857 | 1.000 | 0.929 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 0.857 | 1.000 | 0.929 |  |
| heldout_formulations | target | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | target | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 0.944 | 0.962 | 0.953 | 0.000 (0.000 / 0.000) |
| heldout_formulations | members | comparison: pooled midpoint | 0.778 | 0.985 | 0.881 |  |
| train (sample) | object | product: fitted | 0.963 | 0.947 | 0.955 | 0.075 (0.000 / 0.077) |
| train (sample) | relation | product: fitted | 0.872 | 0.944 | 0.908 | 0.100 (0.167 / 0.088) |
| train (sample) | landmark | product: fitted | 0.975 | 0.981 | 0.978 | 0.024 (0.000 / 0.026) |
| train (sample) | landmark2 | product: fitted | 1.000 | 0.993 | 0.997 | 0.000 (0.000 / 0.000) |
| train (sample) | relation2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark3 | product: fitted | 0.833 | 1.000 | 0.917 | 0.000 (— / 0.000) |
| train (sample) | region | product: fitted | 0.909 | 0.902 | 0.906 | 0.000 (0.000 / 0.000) |
| train (sample) | direction | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 0.643 | 1.000 | 0.821 | 0.000 (— / 0.000) |
| train (sample) | target | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.991 | 0.996 | 0.030 (0.000 / 0.031) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
