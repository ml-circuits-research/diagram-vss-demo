# REPORT — world `real`, legend sha256:e495230f58bc… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1325 annotated sentences from 1 files; provenance: {'llm': 1325}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/A_p25_D1024_e2_s0/splits.json before training; source: split_hints.json)
- heldout_sentences: 120 sentences
- train: 1205 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 10% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
7366 tokens in the examples; 328 with no kind in the lexicon (share 0.045), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 74b4e44. Memory curve: runs/A_p25_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.084 [rule: fit; pooled midpoint 0.987 (comparison)] (present 1.721, n 259 / absent 0.253, n 141)
- attr_presence:object: threshold 0.350 [rule: fit; pooled midpoint 0.388 (comparison)] (present 0.645, n 17 / absent 0.132, n 223)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 238)
- presence:shape: threshold 0.398 [rule: fit; pooled midpoint 0.337 (comparison)] (present 0.671, n 37 / absent 0.003, n 363)
- presence:color: threshold 0.106 [rule: fit; pooled midpoint 0.313 (comparison)] (present 0.605, n 64 / absent 0.021, n 336)
- presence:size: threshold 0.221 [rule: fit; pooled midpoint 0.347 (comparison)] (present 0.656, n 53 / absent 0.039, n 347)
- presence:name: threshold 0.110 [rule: fit; pooled midpoint 0.148 (comparison)] (present 0.290, n 14 / absent 0.006, n 386)
- presence:text: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:relation: threshold 0.081 [rule: fit; pooled midpoint 0.357 (comparison)] (present 0.712, n 39 / absent 0.001, n 361)
- presence:landmark: threshold 0.126 [rule: fit; pooled midpoint 0.509 (comparison)] (present 0.911, n 61 / absent 0.107, n 339)
- presence:landmark2: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:region: threshold 0.217 [rule: fit; pooled midpoint 0.052 (comparison)] (present 0.088, n 22 / absent 0.015, n 378)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:quantity: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:axis: threshold 0.141 [rule: fit; pooled midpoint 0.139 (comparison)] (present 0.278, n 6 / absent -0.001, n 394)
- presence:layout: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:source: threshold 0.347 [rule: fit; pooled midpoint 0.681 (comparison)] (present 1.333, n 78 / absent 0.029, n 322)
- presence:target: threshold 0.354 [rule: fit; pooled midpoint 0.438 (comparison)] (present 0.812, n 47 / absent 0.063, n 353)
- presence:style: threshold 0.244 [rule: fit; pooled midpoint 0.232 (comparison)] (present 0.448, n 9 / absent 0.016, n 391)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:edge: threshold 0.356 [rule: fit; pooled midpoint 0.286 (comparison)] (present 0.571, n 5 / absent 0.001, n 395)
- presence:pairing: threshold 0.169 [rule: fit; pooled midpoint 0.543 (comparison)] (present 1.054, n 21 / absent 0.031, n 379)
- presence:notcolor: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:depth: threshold 0.394 [rule: fit; pooled midpoint 0.170 (comparison)] (present 0.340, n 6 / absent 0.001, n 394)
- presence:superlative: threshold 4.509 [rule: fit; pooled midpoint 0.346 (comparison)] (present 0.682, n 29 / absent 0.011, n 371)
- presence:comparison: threshold -0.875 [rule: fit; pooled midpoint -0.002 (comparison)] (present 0.000, n 8 / absent -0.004, n 392)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 4)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.056, color 0.056, size 0.143, name 0.001, text 0.125, relation 0.167, landmark 0.001, landmark2 0.001, region 0.111, direction 0.250, amount 0.091, quantity 0.091, axis 0.500, layout 0.250, source 0.001, target 0.001, style 0.333, arrow 0.500, edge 0.333, pairing 0.333, notcolor 0.056, depth 0.500, superlative 0.100, comparison 0.143, predicate 0.010

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_sentences — catalog candidates (n = 120 of 120)
| axis | accuracy |
|---|---|
| FULL | 0.458 |
| FULL [depth given] | 0.458 |
| FULL [depth and negation given] | 0.458 |
| FULL [pooled midpoint (comparison)] | 0.283 |
| presence object: present read present | 0.983 |
| presence object: share of 'present' readings that abstain | 0.079 |
| presence object: share of true 'present' readings that abstain | 0.034 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.987 |
| presence region: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 0.966 |
| presence style: absent read absent | 0.989 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.833 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.608 |
| event type (synonym table) | 0.600 |
| role object | 0.775 |
| head object | 0.808 |
| lexical order head object | 0.742 |
| lexical bag head object | 0.708 |
| occupancy: unknown filler | 0.760 |
| role shape | 0.992 |
| head shape | 0.992 |
| lexical order head shape | 0.933 |
| lexical bag head shape | 0.992 |
| occupancy: not given | 0.996 |
| role color | 0.983 |
| head color | 0.983 |
| lexical order head color | 0.858 |
| lexical bag head color | 0.983 |
| role size | 0.983 |
| head size | 0.983 |
| lexical order head size | 0.892 |
| lexical bag head size | 0.975 |
| role name | 0.975 |
| head name | 0.975 |
| lexical order head name | 0.967 |
| lexical bag head name | 0.975 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 1.000 |
| lexical bag head text | 1.000 |
| role relation | 0.983 |
| head relation | 0.983 |
| lexical order head relation | 0.858 |
| lexical bag head relation | 0.958 |
| role landmark | 0.933 |
| head landmark | 0.933 |
| lexical order head landmark | 0.792 |
| lexical bag head landmark | 0.875 |
| role landmark2 | 0.983 |
| head landmark2 | 0.983 |
| lexical order head landmark2 | 0.983 |
| lexical bag head landmark2 | 0.983 |
| role region | 0.950 |
| head region | 0.950 |
| lexical order head region | 0.942 |
| lexical bag head region | 0.983 |
| role direction | 1.000 |
| head direction | 1.000 |
| lexical order head direction | 1.000 |
| lexical bag head direction | 1.000 |
| role amount | 1.000 |
| head amount | 1.000 |
| lexical order head amount | 1.000 |
| lexical bag head amount | 1.000 |
| role quantity | 0.992 |
| head quantity | 0.992 |
| lexical order head quantity | 0.992 |
| lexical bag head quantity | 1.000 |
| occupancy: known filler | 0.670 |
| role axis | 0.992 |
| head axis | 0.992 |
| lexical order head axis | 0.983 |
| lexical bag head axis | 0.983 |
| role layout | 0.992 |
| head layout | 0.992 |
| lexical order head layout | 0.992 |
| lexical bag head layout | 0.992 |
| role source | 0.950 |
| head source | 0.950 |
| lexical order head source | 0.792 |
| lexical bag head source | 0.850 |
| role target | 0.942 |
| head target | 0.942 |
| lexical order head target | 0.892 |
| lexical bag head target | 0.925 |
| role style | 0.975 |
| head style | 0.975 |
| lexical order head style | 0.958 |
| lexical bag head style | 0.950 |
| role arrow | 0.992 |
| head arrow | 0.992 |
| lexical order head arrow | 0.992 |
| lexical bag head arrow | 0.992 |
| role edge | 0.992 |
| head edge | 0.992 |
| lexical order head edge | 0.992 |
| lexical bag head edge | 0.983 |
| role pairing | 0.983 |
| head pairing | 0.983 |
| lexical order head pairing | 0.933 |
| lexical bag head pairing | 0.975 |
| role notcolor | 0.992 |
| head notcolor | 0.992 |
| lexical order head notcolor | 0.992 |
| lexical bag head notcolor | 0.992 |
| role depth | 0.992 |
| head depth | 0.992 |
| lexical order head depth | 0.975 |
| lexical bag head depth | 0.992 |
| role superlative | 0.892 |
| head superlative | 0.892 |
| lexical order head superlative | 0.892 |
| lexical bag head superlative | 0.950 |
| role comparison | 0.967 |
| head comparison | 0.967 |
| lexical order head comparison | 0.967 |
| lexical bag head comparison | 0.992 |
| heads FULL (model) | 0.533 |
| heads FULL (lexical order baseline) | 0.217 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.408 |
| role object [pooled midpoint (comparison)] | 0.575 |
| role shape [pooled midpoint (comparison)] | 0.992 |
| role color [pooled midpoint (comparison)] | 0.975 |
| role size [pooled midpoint (comparison)] | 0.975 |
| role name [pooled midpoint (comparison)] | 0.975 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.950 |
| role landmark [pooled midpoint (comparison)] | 0.925 |
| role landmark2 [pooled midpoint (comparison)] | 0.983 |
| role region [pooled midpoint (comparison)] | 0.950 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 0.992 |
| role axis [pooled midpoint (comparison)] | 0.992 |
| role layout [pooled midpoint (comparison)] | 0.992 |
| role source [pooled midpoint (comparison)] | 0.908 |
| role target [pooled midpoint (comparison)] | 0.925 |
| role style [pooled midpoint (comparison)] | 0.983 |
| role arrow [pooled midpoint (comparison)] | 0.992 |
| role edge [pooled midpoint (comparison)] | 0.992 |
| role pairing [pooled midpoint (comparison)] | 0.975 |
| role notcolor [pooled midpoint (comparison)] | 0.992 |
| role depth [pooled midpoint (comparison)] | 0.992 |
| role superlative [pooled midpoint (comparison)] | 0.892 |
| role comparison [pooled midpoint (comparison)] | 0.967 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.317 |
| presence object: present read present [pooled midpoint (comparison)] | 0.448 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 0.987 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.966 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.989 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence depth: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 0.878 |
| presence source: present read present | 0.833 |
| presence source: share of 'present' readings that abstain | 0.150 |
| presence source: share of true 'present' readings that abstain | 0.150 |
| presence pairing: present read present | 0.857 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.976 |
| presence source: present read present [pooled midpoint (comparison)] | 0.625 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.714 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.200 |
| presence relation: share of true 'present' readings that abstain | 0.200 |
| presence landmark: present read present | 0.783 |
| presence landmark: share of 'present' readings that abstain | 0.211 |
| presence landmark: share of true 'present' readings that abstain | 0.222 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.733 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.739 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.933 |
| presence superlative: present read present | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.000 |
| presence target: present read present | 0.750 |
| presence target: present read present [pooled midpoint (comparison)] | 0.583 |
| presence comparison: present read present | 0.000 |
| presence comparison: present read present [pooled midpoint (comparison)] | 0.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 0.917 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.833 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present [pooled midpoint (comparison)] | 1.000 |
| presence target: share of 'present' readings that abstain | 0.167 |
| presence target: share of true 'present' readings that abstain | 0.111 |
| presence style: share of 'present' readings that abstain | 0.750 |
| presence style: share of FALSE 'present' readings that abstain | 1.000 |
| presence style: present read present | 0.600 |
| presence style: share of true 'present' readings that abstain | 0.667 |
| presence style: present read present [pooled midpoint (comparison)] | 0.800 |
| presence target: share of FALSE 'present' readings that abstain | 0.333 |
| presence axis: present read present | 0.500 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present [pooled midpoint (comparison)] | 0.500 |
| presence edge: present read present | 0.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.600 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |
| presence name: present read present | 0.500 |
| presence name: present read present [pooled midpoint (comparison)] | 0.500 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence depth: present read present | 0.667 |
| presence depth: present read present [pooled midpoint (comparison)] | 0.667 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |

residual mean 0.413; status {'ok': 79, 'abstain': 21, 'no-sense': 7, 'unknown-event': 13}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.608 | 0.339 / 0.014 | 0.82 | 0.217 | 0.000 / 0.175 |
| role object | 0.707 | 0.221 / 0.000 | 0.84 | 0.160 | 0.027 / 0.133 |
| roles (pooled) | 0.654 | 0.144 / 0.000 | 0.66 | 0.065 | 0.057 / 0.280 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role source | 0.760 | 0.083 / 0.000 | 0.72 | 0.040 | 0.080 / 0.200 |
| role pairing | 0.750 | 0.200 / 0.000 | 0.75 | 0.000 | 0.000 / 0.250 |
| role relation | 0.882 | 0.162 / 0.014 | 0.71 | 0.000 | 0.176 / 0.118 |
| role landmark | 0.720 | 0.103 / 0.000 | 0.60 | 0.040 | 0.160 / 0.240 |
| role color | 0.882 | 0.206 / 0.042 | 0.88 | 0.000 | 0.000 / 0.118 |
| role superlative | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role target | 0.692 | 0.126 / 0.000 | 0.69 | 0.077 | 0.077 / 0.231 |
| role comparison | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role shape | 0.875 | 0.162 / 0.115 | 0.88 | 0.000 | 0.000 / 0.125 |
| role size | 0.846 | 0.198 / 0.013 | 0.85 | 0.000 | 0.000 / 0.154 |
| role region | 0.143 | 0.064 / 0.000 | 0.29 | 0.143 | 0.000 / 0.714 |
| role style | 0.600 | 0.021 / 0.000 | 0.20 | 0.000 | 0.400 / 0.400 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role notcolor | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role axis | 0.500 | 0.028 / 0.006 | 0.50 | 0.000 | 0.000 / 0.500 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role edge | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role layout | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role name | 0.250 | 0.023 / 0.000 | 0.25 | 0.000 | 0.000 / 0.750 |
| role depth | 0.667 | 0.051 / 0.014 | 0.67 | 0.000 | 0.000 / 0.333 |

### train (sample) — catalog candidates (n = 300 of 1205)
| axis | accuracy |
|---|---|
| FULL | 0.503 |
| FULL [depth given] | 0.503 |
| FULL [depth and negation given] | 0.503 |
| presence object: present read present | 0.948 |
| presence object: share of 'present' readings that abstain | 0.077 |
| presence object: share of true 'present' readings that abstain | 0.055 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 0.833 |
| presence name: present read present | 0.786 |
| presence relation: present read present | 0.968 |
| presence relation: share of 'present' readings that abstain | 0.032 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.935 |
| presence landmark: share of 'present' readings that abstain | 0.128 |
| presence landmark: share of true 'present' readings that abstain | 0.093 |
| presence region: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 0.985 |
| presence style: absent read absent | 0.987 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.813 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.620 |
| event type (synonym table) | 0.620 |
| role object | 0.807 |
| head object | 0.817 |
| lexical order head object | 0.723 |
| lexical bag head object | 0.937 |
| occupancy: known filler | 0.723 |
| role shape | 0.987 |
| head shape | 0.987 |
| lexical order head shape | 0.913 |
| lexical bag head shape | 0.997 |
| occupancy: not given | 0.997 |
| role color | 0.957 |
| head color | 0.957 |
| lexical order head color | 0.820 |
| lexical bag head color | 0.983 |
| role size | 0.967 |
| head size | 0.967 |
| lexical order head size | 0.870 |
| lexical bag head size | 0.987 |
| role name | 0.980 |
| head name | 0.980 |
| lexical order head name | 0.943 |
| lexical bag head name | 1.000 |
| role text | 0.993 |
| head text | 0.993 |
| lexical order head text | 0.993 |
| lexical bag head text | 1.000 |
| role relation | 0.977 |
| head relation | 0.977 |
| lexical order head relation | 0.880 |
| lexical bag head relation | 0.980 |
| role landmark | 0.960 |
| head landmark | 0.960 |
| lexical order head landmark | 0.830 |
| lexical bag head landmark | 0.950 |
| role landmark2 | 0.993 |
| head landmark2 | 0.993 |
| lexical order head landmark2 | 0.993 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.960 |
| head region | 0.960 |
| lexical order head region | 0.943 |
| lexical bag head region | 0.963 |
| role direction | 0.997 |
| head direction | 0.997 |
| lexical order head direction | 0.997 |
| lexical bag head direction | 1.000 |
| role amount | 0.997 |
| head amount | 0.997 |
| lexical order head amount | 0.997 |
| lexical bag head amount | 1.000 |
| role quantity | 0.987 |
| head quantity | 0.987 |
| lexical order head quantity | 0.987 |
| lexical bag head quantity | 1.000 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.983 |
| lexical bag head axis | 1.000 |
| role layout | 0.997 |
| head layout | 0.997 |
| lexical order head layout | 0.997 |
| lexical bag head layout | 1.000 |
| role source | 0.950 |
| head source | 0.950 |
| lexical order head source | 0.793 |
| lexical bag head source | 0.987 |
| role target | 0.957 |
| head target | 0.957 |
| lexical order head target | 0.847 |
| lexical bag head target | 0.980 |
| role style | 0.990 |
| head style | 0.990 |
| lexical order head style | 0.960 |
| lexical bag head style | 0.987 |
| role arrow | 0.990 |
| head arrow | 0.990 |
| lexical order head arrow | 0.990 |
| lexical bag head arrow | 1.000 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.967 |
| lexical bag head edge | 0.987 |
| role pairing | 0.990 |
| head pairing | 0.990 |
| lexical order head pairing | 0.960 |
| lexical bag head pairing | 0.997 |
| role notcolor | 0.993 |
| head notcolor | 0.993 |
| lexical order head notcolor | 0.993 |
| lexical bag head notcolor | 0.997 |
| role depth | 1.000 |
| head depth | 1.000 |
| lexical order head depth | 0.980 |
| lexical bag head depth | 1.000 |
| role superlative | 0.923 |
| head superlative | 0.923 |
| lexical order head superlative | 0.923 |
| lexical bag head superlative | 0.980 |
| role comparison | 0.987 |
| head comparison | 0.987 |
| lexical order head comparison | 0.987 |
| lexical bag head comparison | 1.000 |
| heads FULL (model) | 0.583 |
| heads FULL (lexical order baseline) | 0.163 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.777 |
| presence object: absent read absent | 0.900 |
| presence size: absent read absent | 0.995 |
| presence name: absent read absent | 1.000 |
| presence relation: absent read absent | 0.995 |
| presence landmark: absent read absent | 0.980 |
| presence source: present read present | 0.889 |
| presence source: share of 'present' readings that abstain | 0.083 |
| presence source: share of true 'present' readings that abstain | 0.083 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.111 |
| presence pairing: share of true 'present' readings that abstain | 0.111 |
| presence superlative: present read present | 0.000 |
| presence size: share of 'present' readings that abstain | 0.032 |
| presence size: share of true 'present' readings that abstain | 0.033 |
| presence name: share of 'present' readings that abstain | 0.182 |
| presence name: share of true 'present' readings that abstain | 0.182 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.837 |
| presence target: share of 'present' readings that abstain | 0.077 |
| presence target: share of true 'present' readings that abstain | 0.083 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.200 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 0.953 |
| presence color: share of 'present' readings that abstain | 0.024 |
| presence color: share of true 'present' readings that abstain | 0.024 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 1.000 |
| presence relation: share of FALSE 'present' readings that abstain | 1.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.500 |
| presence region: present read present | 0.714 |
| presence region: share of 'present' readings that abstain | 0.400 |
| presence region: share of true 'present' readings that abstain | 0.400 |
| presence comparison: present read present | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.200 |
| presence axis: share of true 'present' readings that abstain | 0.200 |
| presence depth: present read present | 1.000 |
| presence depth: share of 'present' readings that abstain | 0.167 |
| presence depth: share of true 'present' readings that abstain | 0.167 |
| presence object: share of FALSE 'present' readings that abstain | 0.444 |

residual mean 0.374; status {'abstain': 46, 'ok': 198, 'unknown-event': 43, 'no-sense': 13}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.620 | 0.337 / 0.008 | 0.81 | 0.193 | 0.003 / 0.187 |
| role object | 0.745 | 0.227 / 0.000 | 0.83 | 0.130 | 0.042 / 0.125 |
| roles (pooled) | 0.717 | 0.168 / 0.000 | 0.75 | 0.075 | 0.043 / 0.209 |
| role size | 0.769 | 0.196 / 0.000 | 0.79 | 0.051 | 0.026 / 0.179 |
| role name | 0.647 | 0.082 / 0.000 | 0.59 | 0.059 | 0.118 / 0.294 |
| role relation | 0.833 | 0.172 / 0.000 | 0.83 | 0.000 | 0.000 / 0.167 |
| role landmark | 0.843 | 0.118 / 0.000 | 0.76 | 0.000 | 0.078 / 0.157 |
| role source | 0.758 | 0.123 / 0.003 | 0.82 | 0.113 | 0.048 / 0.129 |
| role pairing | 0.750 | 0.204 / 0.032 | 0.83 | 0.167 | 0.083 / 0.083 |
| role superlative | 0.000 | 0.070 / 0.000 | 0.13 | 0.130 | 0.000 / 0.870 |
| role target | 0.783 | 0.149 / 0.000 | 0.76 | 0.043 | 0.065 / 0.174 |
| role shape | 0.846 | 0.188 / 0.091 | 0.92 | 0.077 | 0.000 / 0.077 |
| role style | 1.000 | 0.190 / 0.147 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.230 / 0.187 | 1.00 | 0.000 | 0.000 / 0.000 |
| role color | 0.759 | 0.201 / 0.000 | 0.80 | 0.056 | 0.019 / 0.185 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role region | 0.294 | 0.037 / 0.000 | 0.18 | 0.000 | 0.118 / 0.706 |
| role notcolor | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role layout | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role axis | 1.000 | 0.106 / 0.041 | 0.80 | 0.000 | 0.200 / 0.000 |
| role depth | 1.000 | 0.088 / 0.050 | 0.83 | 0.000 | 0.167 / 0.000 |
| role text | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
,=1.00 and=1.00 at=1.00 from=1.00 in=1.00 labeled=1.00 named=1.00 of=1.00 on=1.00 to=1.00 with=1.00 SUPER=0.87 NAME=0.77 REGION=0.71 COLOR=0.69 rules=0.55 them=0.44 AXIS=0.43 times=0.39 are=0.36 VERB=0.35 DIR=0.31 REL=0.31 have=0.30 there=0.29 EDGE=0.29 that=0.29 TEXT=0.28 last=0.28 lines=0.25 DEPTH=0.25 we=0.24 PAIR=0.23 unknown=0.22 i=0.22 NOTCOLOR=0.21 NUM=0.20 LAYOUT=0.20 SHAPE=0.19 now=0.19 ARROW=0.17 it=0.17 each=0.14 show=0.13 path=0.12 me=0.10 RECENT=0.09 has=0.08 can=0.07 who=0.06 route=0.06 what=0.05 SIZE=0.05 than=0.05 the=0.05 does=0.04 then=0.04 be=0.04 called=0.03 STYLE=0.03 a=0.01

## What is weak, what to add
- heldout_sentences: FULL 0.458
- heldout_sentences: presence object: share of 'present' readings that abstain 0.079
- heldout_sentences: presence object: share of true 'present' readings that abstain 0.034
- heldout_sentences: structure (depth, negation) 0.833
- heldout_sentences: predicate (surface lemma) 0.608
- heldout_sentences: event type (synonym table) 0.600
- heldout_sentences: role object 0.775
- heldout_sentences: head object 0.808
- heldout_sentences: occupancy: unknown filler 0.760
- heldout_sentences: occupancy: known filler 0.670
- heldout_sentences: role superlative 0.892
- heldout_sentences: head superlative 0.892
- heldout_sentences: heads FULL (model) 0.533
- heldout_sentences: heads FULL (lexical order baseline) 0.217
- heldout_sentences: heads FULL (lexical bag baseline, trained on the same training rows) 0.408
- heldout_sentences: FULL [depth given] 0.458
- heldout_sentences: FULL [depth and negation given] 0.458
- heldout_sentences: FULL [pooled midpoint (comparison)] 0.283
- heldout_sentences: role object [pooled midpoint (comparison)] 0.575
- heldout_sentences: role superlative [pooled midpoint (comparison)] 0.892
- heldout_sentences: heads FULL (model) [pooled midpoint (comparison)] 0.317
- heldout_sentences: presence object: present read present [pooled midpoint (comparison)] 0.448
- heldout_sentences: presence object: absent read absent 0.878
- heldout_sentences: presence source: present read present 0.833
- heldout_sentences: presence source: share of 'present' readings that abstain 0.150
- heldout_sentences: presence source: share of true 'present' readings that abstain 0.150
- heldout_sentences: presence pairing: present read present 0.857
- heldout_sentences: presence pairing: share of 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence source: present read present [pooled midpoint (comparison)] 0.625
- heldout_sentences: presence pairing: present read present [pooled midpoint (comparison)] 0.714
- heldout_sentences: presence relation: share of 'present' readings that abstain 0.200
- heldout_sentences: presence relation: share of true 'present' readings that abstain 0.200
- heldout_sentences: presence landmark: present read present 0.783
- heldout_sentences: presence landmark: share of 'present' readings that abstain 0.211
- heldout_sentences: presence landmark: share of true 'present' readings that abstain 0.222
- heldout_sentences: presence relation: present read present [pooled midpoint (comparison)] 0.733
- heldout_sentences: presence landmark: present read present [pooled midpoint (comparison)] 0.739
- heldout_sentences: presence color: share of 'present' readings that abstain 0.000
- heldout_sentences: presence color: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: present read present 0.000
- heldout_sentences: presence superlative: present read present [pooled midpoint (comparison)] 0.000
- heldout_sentences: presence target: present read present 0.750
- heldout_sentences: presence target: present read present [pooled midpoint (comparison)] 0.583
- heldout_sentences: presence comparison: present read present 0.000
- heldout_sentences: presence comparison: present read present [pooled midpoint (comparison)] 0.000
- heldout_sentences: presence shape: share of 'present' readings that abstain 0.000
- heldout_sentences: presence shape: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence size: share of 'present' readings that abstain 0.000
- heldout_sentences: presence size: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence size: present read present [pooled midpoint (comparison)] 0.833
- heldout_sentences: presence region: share of 'present' readings that abstain 0.000
- heldout_sentences: presence region: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence target: share of 'present' readings that abstain 0.167
- heldout_sentences: presence target: share of true 'present' readings that abstain 0.111
- heldout_sentences: presence style: share of 'present' readings that abstain 0.750
- heldout_sentences: presence style: present read present 0.600
- heldout_sentences: presence style: share of true 'present' readings that abstain 0.667
- heldout_sentences: presence style: present read present [pooled midpoint (comparison)] 0.800
- heldout_sentences: presence target: share of FALSE 'present' readings that abstain 0.333
- heldout_sentences: presence axis: present read present 0.500
- heldout_sentences: presence axis: share of 'present' readings that abstain 0.000
- heldout_sentences: presence axis: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence axis: present read present [pooled midpoint (comparison)] 0.500
- heldout_sentences: presence edge: present read present 0.000
- heldout_sentences: presence edge: present read present [pooled midpoint (comparison)] 0.000
- heldout_sentences: presence object: share of FALSE 'present' readings that abstain 0.600
- heldout_sentences: presence landmark: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence name: present read present 0.500
- heldout_sentences: presence name: present read present [pooled midpoint (comparison)] 0.500
- heldout_sentences: presence name: share of 'present' readings that abstain 0.000
- heldout_sentences: presence name: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence depth: present read present 0.667
- heldout_sentences: presence depth: present read present [pooled midpoint (comparison)] 0.667
- heldout_sentences: presence depth: share of 'present' readings that abstain 0.000
- heldout_sentences: presence depth: share of true 'present' readings that abstain 0.000
- heldout_sentences: determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): FULL 0.503
- train (sample): presence object: share of 'present' readings that abstain 0.077
- train (sample): presence object: share of true 'present' readings that abstain 0.055
- train (sample): presence size: present read present 0.833
- train (sample): presence name: present read present 0.786
- train (sample): presence relation: share of 'present' readings that abstain 0.032
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.128
- train (sample): presence landmark: share of true 'present' readings that abstain 0.093
- train (sample): structure (depth, negation) 0.813
- train (sample): predicate (surface lemma) 0.620
- train (sample): event type (synonym table) 0.620
- train (sample): role object 0.807
- train (sample): head object 0.817
- train (sample): occupancy: known filler 0.723
- train (sample): heads FULL (model) 0.583
- train (sample): heads FULL (lexical order baseline) 0.163
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.777
- train (sample): FULL [depth given] 0.503
- train (sample): FULL [depth and negation given] 0.503
- train (sample): presence source: present read present 0.889
- train (sample): presence source: share of 'present' readings that abstain 0.083
- train (sample): presence source: share of true 'present' readings that abstain 0.083
- train (sample): presence pairing: share of 'present' readings that abstain 0.111
- train (sample): presence pairing: share of true 'present' readings that abstain 0.111
- train (sample): presence superlative: present read present 0.000
- train (sample): presence size: share of 'present' readings that abstain 0.032
- train (sample): presence size: share of true 'present' readings that abstain 0.033
- train (sample): presence name: share of 'present' readings that abstain 0.182
- train (sample): presence name: share of true 'present' readings that abstain 0.182
- train (sample): presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence target: present read present 0.837
- train (sample): presence target: share of 'present' readings that abstain 0.077
- train (sample): presence target: share of true 'present' readings that abstain 0.083
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of 'present' readings that abstain 0.200
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.024
- train (sample): presence color: share of true 'present' readings that abstain 0.024
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence region: present read present 0.714
- train (sample): presence region: share of 'present' readings that abstain 0.400
- train (sample): presence region: share of true 'present' readings that abstain 0.400
- train (sample): presence comparison: present read present 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.200
- train (sample): presence axis: share of true 'present' readings that abstain 0.200
- train (sample): presence depth: share of 'present' readings that abstain 0.167
- train (sample): presence depth: share of true 'present' readings that abstain 0.167
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.444

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_sentences: `NAME in the REGION` FULL 0.000 (n 4)
- heldout_sentences: `which SHAPE are COLOR right now` FULL 0.000 (n 3)
- heldout_sentences: `is NAME SIZE than NAME` FULL 0.000 (n 2)
- heldout_sentences: `is_there SHAPE COLOR SHAPE here` FULL 0.000 (n 2)
- heldout_sentences: `which is the SUPER` FULL 0.000 (n 2)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_sentences | object | product: fitted | 0.983 | 0.878 | 0.931 | 0.079 (0.600 / 0.034) |
| heldout_sentences | object | comparison: pooled midpoint | 0.448 | 0.976 | 0.712 |  |
| heldout_sentences | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | shape | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | color | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_sentences | size | product: fitted | 0.917 | 1.000 | 0.958 | 0.000 (— / 0.000) |
| heldout_sentences | size | comparison: pooled midpoint | 0.833 | 1.000 | 0.917 |  |
| heldout_sentences | name | product: fitted | 0.500 | 1.000 | 0.750 | 0.000 (— / 0.000) |
| heldout_sentences | name | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_sentences | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.200 (— / 0.200) |
| heldout_sentences | relation | comparison: pooled midpoint | 0.733 | 1.000 | 0.867 |  |
| heldout_sentences | landmark | product: fitted | 0.783 | 0.987 | 0.885 | 0.211 (0.000 / 0.222) |
| heldout_sentences | landmark | comparison: pooled midpoint | 0.739 | 0.987 | 0.863 |  |
| heldout_sentences | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | region | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | axis | product: fitted | 0.500 | 1.000 | 0.750 | 0.000 (— / 0.000) |
| heldout_sentences | axis | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_sentences | source | product: fitted | 0.833 | 1.000 | 0.917 | 0.150 (— / 0.150) |
| heldout_sentences | source | comparison: pooled midpoint | 0.625 | 1.000 | 0.812 |  |
| heldout_sentences | target | product: fitted | 0.750 | 0.966 | 0.858 | 0.167 (0.333 / 0.111) |
| heldout_sentences | target | comparison: pooled midpoint | 0.583 | 0.966 | 0.774 |  |
| heldout_sentences | style | product: fitted | 0.600 | 0.989 | 0.795 | 0.750 (1.000 / 0.667) |
| heldout_sentences | style | comparison: pooled midpoint | 0.800 | 0.989 | 0.895 |  |
| heldout_sentences | edge | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | edge | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | pairing | product: fitted | 0.857 | 1.000 | 0.929 | 0.000 (— / 0.000) |
| heldout_sentences | pairing | comparison: pooled midpoint | 0.714 | 1.000 | 0.857 |  |
| heldout_sentences | depth | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_sentences | depth | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_sentences | superlative | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | superlative | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | comparison | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | comparison | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| train (sample) | object | product: fitted | 0.948 | 0.900 | 0.924 | 0.077 (0.444 / 0.055) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.953 | 1.000 | 0.977 | 0.024 (— / 0.024) |
| train (sample) | size | product: fitted | 0.833 | 0.995 | 0.914 | 0.032 (0.000 / 0.033) |
| train (sample) | name | product: fitted | 0.786 | 1.000 | 0.893 | 0.182 (— / 0.182) |
| train (sample) | relation | product: fitted | 0.968 | 0.995 | 0.982 | 0.032 (1.000 / 0.000) |
| train (sample) | landmark | product: fitted | 0.935 | 0.980 | 0.957 | 0.128 (0.500 / 0.093) |
| train (sample) | region | product: fitted | 0.714 | 1.000 | 0.857 | 0.400 (— / 0.400) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.200 (— / 0.200) |
| train (sample) | source | product: fitted | 0.889 | 1.000 | 0.944 | 0.083 (— / 0.083) |
| train (sample) | target | product: fitted | 0.837 | 0.985 | 0.911 | 0.077 (0.000 / 0.083) |
| train (sample) | style | product: fitted | 1.000 | 0.987 | 0.994 | 0.200 (1.000 / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.111 (— / 0.111) |
| train (sample) | depth | product: fitted | 1.000 | 1.000 | 1.000 | 0.167 (— / 0.167) |
| train (sample) | superlative | product: fitted | 0.000 | 1.000 | 0.500 |  |
| train (sample) | comparison | product: fitted | 0.000 | 1.000 | 0.500 |  |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
