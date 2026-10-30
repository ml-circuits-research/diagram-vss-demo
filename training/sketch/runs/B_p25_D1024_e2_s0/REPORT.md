# REPORT — world `real`, legend sha256:bd4b45541bf5… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1322 annotated sentences from 1 files; provenance: {'llm': 1322}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/B_p25_D1024_e2_s0/splits.json before training; source: split_hints.json)
- heldout_sentences: 122 sentences
- train: 1200 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 10% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
7474 tokens in the examples; 344 with no kind in the lexicon (share 0.046), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 530e54e. Memory curve: runs/B_p25_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.224 [rule: fit; pooled midpoint 0.620 (comparison)] (present 1.156, n 268 / absent 0.083, n 132)
- attr_presence:object: threshold 0.253 [rule: fit; pooled midpoint 0.408 (comparison)] (present 0.686, n 22 / absent 0.129, n 242)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 262)
- presence:shape: threshold 0.280 [rule: fit; pooled midpoint 0.255 (comparison)] (present 0.503, n 34 / absent 0.007, n 366)
- presence:color: threshold 0.096 [rule: fit; pooled midpoint 0.214 (comparison)] (present 0.421, n 71 / absent 0.006, n 329)
- presence:size: threshold 0.352 [rule: fit; pooled midpoint 0.283 (comparison)] (present 0.550, n 56 / absent 0.016, n 344)
- presence:name: threshold 0.092 [rule: fit; pooled midpoint 0.189 (comparison)] (present 0.376, n 20 / absent 0.001, n 380)
- presence:text: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:relation: threshold 0.122 [rule: fit; pooled midpoint 0.375 (comparison)] (present 0.733, n 48 / absent 0.017, n 352)
- presence:landmark: threshold 0.205 [rule: fit; pooled midpoint 0.395 (comparison)] (present 0.730, n 72 / absent 0.060, n 328)
- presence:landmark2: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:region: threshold 0.187 [rule: fit; pooled midpoint 0.245 (comparison)] (present 0.466, n 23 / absent 0.024, n 377)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:quantity: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:axis: threshold 0.115 [rule: fit; pooled midpoint 0.164 (comparison)] (present 0.329, n 7 / absent 0.000, n 393)
- presence:layout: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:source: threshold 0.177 [rule: fit; pooled midpoint 0.425 (comparison)] (present 0.828, n 74 / absent 0.023, n 326)
- presence:target: threshold 0.168 [rule: fit; pooled midpoint 0.345 (comparison)] (present 0.653, n 53 / absent 0.037, n 347)
- presence:style: threshold 0.282 [rule: fit; pooled midpoint 0.316 (comparison)] (present 0.621, n 12 / absent 0.012, n 388)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:edge: threshold 0.235 [rule: fit; pooled midpoint 0.245 (comparison)] (present 0.485, n 8 / absent 0.005, n 392)
- presence:pairing: threshold 0.153 [rule: fit; pooled midpoint 0.295 (comparison)] (present 0.574, n 19 / absent 0.016, n 381)
- presence:notcolor: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:depth: threshold 0.173 [rule: fit; pooled midpoint 0.215 (comparison)] (present 0.429, n 9 / absent 0.002, n 391)
- presence:superlative: threshold 0.380 [rule: fit; pooled midpoint 0.367 (comparison)] (present 0.726, n 34 / absent 0.007, n 366)
- presence:comparison: threshold 0.386 [rule: fit; pooled midpoint 0.057 (comparison)] (present 0.113, n 6 / absent 0.001, n 394)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 7)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.056, color 0.056, size 0.143, name 0.001, text 0.125, relation 0.167, landmark 0.001, landmark2 0.001, region 0.111, direction 0.250, amount 0.091, quantity 0.091, axis 0.500, layout 0.250, source 0.001, target 0.001, style 0.333, arrow 0.500, edge 0.333, pairing 0.333, notcolor 0.056, depth 0.500, superlative 0.100, comparison 0.143, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_sentences — catalog candidates (n = 122 of 122)
| axis | accuracy |
|---|---|
| FULL | 0.672 |
| FULL [depth given] | 0.672 |
| FULL [depth and negation given] | 0.672 |
| FULL [pooled midpoint (comparison)] | 0.475 |
| presence object: present read present | 0.895 |
| presence object: share of 'present' readings that abstain | 0.159 |
| presence object: share of true 'present' readings that abstain | 0.147 |
| presence shape: absent read absent | 1.000 |
| presence color: present read present | 0.778 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 0.991 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.989 |
| presence region: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 0.980 |
| presence style: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.926 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.869 |
| event type (synonym table) | 0.869 |
| role object | 0.852 |
| head object | 0.869 |
| lexical order head object | 0.779 |
| lexical bag head object | 0.795 |
| occupancy: known filler | 0.800 |
| role shape | 1.000 |
| head shape | 1.000 |
| lexical order head shape | 0.926 |
| lexical bag head shape | 0.992 |
| occupancy: not given | 0.998 |
| role color | 0.959 |
| head color | 0.959 |
| lexical order head color | 0.844 |
| lexical bag head color | 0.984 |
| role size | 0.975 |
| head size | 0.975 |
| lexical order head size | 0.869 |
| lexical bag head size | 0.984 |
| role name | 0.984 |
| head name | 0.984 |
| lexical order head name | 0.951 |
| lexical bag head name | 0.975 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 1.000 |
| lexical bag head text | 1.000 |
| role relation | 0.984 |
| head relation | 0.984 |
| lexical order head relation | 0.861 |
| lexical bag head relation | 0.943 |
| role landmark | 0.951 |
| head landmark | 0.951 |
| lexical order head landmark | 0.836 |
| lexical bag head landmark | 0.861 |
| role landmark2 | 0.984 |
| head landmark2 | 0.984 |
| lexical order head landmark2 | 0.984 |
| lexical bag head landmark2 | 0.984 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 0.934 |
| lexical bag head region | 0.967 |
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
| role axis | 0.992 |
| head axis | 0.992 |
| lexical order head axis | 0.975 |
| lexical bag head axis | 0.975 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 1.000 |
| lexical bag head layout | 1.000 |
| role source | 0.959 |
| head source | 0.959 |
| lexical order head source | 0.803 |
| lexical bag head source | 0.885 |
| role target | 0.959 |
| head target | 0.959 |
| lexical order head target | 0.893 |
| lexical bag head target | 0.951 |
| role style | 0.975 |
| head style | 0.975 |
| lexical order head style | 0.975 |
| lexical bag head style | 0.967 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 1.000 |
| lexical bag head arrow | 1.000 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 1.000 |
| lexical bag head edge | 0.992 |
| role pairing | 1.000 |
| head pairing | 1.000 |
| lexical order head pairing | 0.943 |
| lexical bag head pairing | 0.992 |
| role notcolor | 0.992 |
| head notcolor | 0.992 |
| lexical order head notcolor | 0.992 |
| lexical bag head notcolor | 0.992 |
| role depth | 0.992 |
| head depth | 0.992 |
| lexical order head depth | 0.975 |
| lexical bag head depth | 0.992 |
| role superlative | 0.984 |
| head superlative | 0.984 |
| lexical order head superlative | 0.893 |
| lexical bag head superlative | 0.959 |
| role comparison | 0.984 |
| head comparison | 0.984 |
| lexical order head comparison | 0.984 |
| lexical bag head comparison | 0.992 |
| heads FULL (model) | 0.705 |
| heads FULL (lexical order baseline) | 0.197 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.451 |
| role object [pooled midpoint (comparison)] | 0.623 |
| role shape [pooled midpoint (comparison)] | 1.000 |
| role color [pooled midpoint (comparison)] | 0.934 |
| role size [pooled midpoint (comparison)] | 0.984 |
| role name [pooled midpoint (comparison)] | 0.992 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.943 |
| role landmark [pooled midpoint (comparison)] | 0.943 |
| role landmark2 [pooled midpoint (comparison)] | 0.984 |
| role region [pooled midpoint (comparison)] | 1.000 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 0.992 |
| role axis [pooled midpoint (comparison)] | 0.975 |
| role layout [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.934 |
| role target [pooled midpoint (comparison)] | 0.951 |
| role style [pooled midpoint (comparison)] | 0.975 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 0.992 |
| role notcolor [pooled midpoint (comparison)] | 0.992 |
| role depth [pooled midpoint (comparison)] | 0.992 |
| role superlative [pooled midpoint (comparison)] | 0.984 |
| role comparison [pooled midpoint (comparison)] | 0.975 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.508 |
| presence object: present read present [pooled midpoint (comparison)] | 0.521 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.611 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.980 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence depth: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 0.991 |
| presence color: absent read absent | 1.000 |
| occupancy: unknown filler | 0.788 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 0.973 |
| presence source: present read present | 0.864 |
| presence source: share of 'present' readings that abstain | 0.000 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.143 |
| presence pairing: share of true 'present' readings that abstain | 0.143 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.727 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.857 |
| presence relation: present read present | 0.938 |
| presence relation: share of 'present' readings that abstain | 0.133 |
| presence relation: share of true 'present' readings that abstain | 0.133 |
| presence landmark: present read present | 0.789 |
| presence landmark: share of 'present' readings that abstain | 0.125 |
| presence landmark: share of true 'present' readings that abstain | 0.067 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.625 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.722 |
| presence target: present read present | 0.909 |
| presence target: share of 'present' readings that abstain | 0.083 |
| presence target: share of true 'present' readings that abstain | 0.100 |
| presence target: present read present [pooled midpoint (comparison)] | 0.818 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present | 0.929 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.933 |
| presence color: share of 'present' readings that abstain | 0.214 |
| presence color: share of true 'present' readings that abstain | 0.214 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.333 |
| presence name: share of true 'present' readings that abstain | 0.200 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: present read present | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 0.000 |
| presence name: share of FALSE 'present' readings that abstain | 1.000 |
| presence comparison: present read present | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| presence superlative: present read present | 0.846 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.917 |
| presence axis: present read present | 0.667 |
| presence axis: share of 'present' readings that abstain | 1.000 |
| presence axis: share of true 'present' readings that abstain | 1.000 |
| presence axis: present read present [pooled midpoint (comparison)] | 0.000 |
| presence comparison: present read present [pooled midpoint (comparison)] | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 1.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 1.000 |
| presence depth: present read present | 1.000 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence depth: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |

residual mean 0.289; status {'ok': 90, 'abstain': 23, 'unknown-event': 6, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.869 | 0.400 / 0.102 | 0.93 | 0.082 | 0.016 / 0.049 |
| role object | 0.790 | 0.178 / 0.000 | 0.75 | 0.074 | 0.111 / 0.136 |
| roles (pooled) | 0.782 | 0.155 / 0.000 | 0.74 | 0.040 | 0.081 / 0.177 |
| role color | 0.737 | 0.139 / 0.000 | 0.58 | 0.000 | 0.158 / 0.263 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role source | 0.792 | 0.105 / 0.000 | 0.83 | 0.042 | 0.000 / 0.167 |
| role pairing | 1.000 | 0.243 / 0.165 | 0.86 | 0.000 | 0.143 / 0.000 |
| role relation | 0.882 | 0.145 / 0.012 | 0.76 | 0.000 | 0.118 / 0.118 |
| role landmark | 0.750 | 0.087 / 0.000 | 0.75 | 0.050 | 0.050 / 0.200 |
| role target | 0.769 | 0.155 / 0.021 | 0.77 | 0.077 | 0.077 / 0.154 |
| role shape | 1.000 | 0.182 / 0.159 | 1.00 | 0.000 | 0.000 / 0.000 |
| role size | 0.812 | 0.163 / 0.000 | 0.81 | 0.000 | 0.000 / 0.188 |
| role name | 0.833 | 0.126 / 0.063 | 0.83 | 0.167 | 0.167 / 0.000 |
| role region | 1.000 | 0.308 / 0.152 | 1.00 | 0.000 | 0.000 / 0.000 |
| role style | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role superlative | 0.846 | 0.223 / 0.016 | 0.85 | 0.000 | 0.000 / 0.154 |
| role notcolor | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role axis | 0.667 | 0.009 / 0.002 | 0.00 | 0.000 | 0.667 / 0.333 |
| role depth | 0.667 | 0.148 / 0.042 | 0.67 | 0.000 | 0.000 / 0.333 |

### train (sample) — catalog candidates (n = 300 of 1200)
| axis | accuracy |
|---|---|
| FULL | 0.693 |
| FULL [depth given] | 0.693 |
| FULL [depth and negation given] | 0.693 |
| presence object: present read present | 0.938 |
| presence object: share of 'present' readings that abstain | 0.069 |
| presence object: share of true 'present' readings that abstain | 0.060 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 0.915 |
| presence size: share of 'present' readings that abstain | 0.023 |
| presence size: share of true 'present' readings that abstain | 0.023 |
| presence name: present read present | 0.833 |
| presence name: share of 'present' readings that abstain | 0.273 |
| presence name: share of true 'present' readings that abstain | 0.200 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.040 |
| presence relation: share of true 'present' readings that abstain | 0.042 |
| presence landmark: present read present | 0.923 |
| presence landmark: share of 'present' readings that abstain | 0.128 |
| presence landmark: share of true 'present' readings that abstain | 0.083 |
| presence region: absent read absent | 0.992 |
| presence axis: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 0.970 |
| presence style: absent read absent | 1.000 |
| presence edge: absent read absent | 0.996 |
| presence pairing: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.913 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.833 |
| event type (synonym table) | 0.833 |
| role object | 0.857 |
| head object | 0.870 |
| lexical order head object | 0.767 |
| lexical bag head object | 0.927 |
| occupancy: known filler | 0.835 |
| role shape | 0.993 |
| head shape | 0.993 |
| lexical order head shape | 0.897 |
| lexical bag head shape | 0.997 |
| occupancy: not given | 0.997 |
| role color | 0.973 |
| head color | 0.973 |
| lexical order head color | 0.770 |
| lexical bag head color | 0.997 |
| role size | 0.977 |
| head size | 0.977 |
| lexical order head size | 0.833 |
| lexical bag head size | 0.987 |
| role name | 0.987 |
| head name | 0.987 |
| lexical order head name | 0.957 |
| lexical bag head name | 1.000 |
| role text | 0.990 |
| head text | 0.990 |
| lexical order head text | 0.990 |
| lexical bag head text | 1.000 |
| role relation | 0.987 |
| head relation | 0.987 |
| lexical order head relation | 0.910 |
| lexical bag head relation | 0.973 |
| role landmark | 0.970 |
| head landmark | 0.970 |
| lexical order head landmark | 0.860 |
| lexical bag head landmark | 0.950 |
| role landmark2 | 0.983 |
| head landmark2 | 0.983 |
| lexical order head landmark2 | 0.983 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.990 |
| head region | 0.990 |
| lexical order head region | 0.930 |
| lexical bag head region | 0.970 |
| role direction | 0.997 |
| head direction | 0.997 |
| lexical order head direction | 0.997 |
| lexical bag head direction | 1.000 |
| role amount | 0.997 |
| head amount | 0.997 |
| lexical order head amount | 0.997 |
| lexical bag head amount | 1.000 |
| role quantity | 0.990 |
| head quantity | 0.990 |
| lexical order head quantity | 0.990 |
| lexical bag head quantity | 1.000 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.987 |
| lexical bag head axis | 1.000 |
| role layout | 0.997 |
| head layout | 0.997 |
| lexical order head layout | 0.997 |
| lexical bag head layout | 1.000 |
| role source | 0.967 |
| head source | 0.967 |
| lexical order head source | 0.803 |
| lexical bag head source | 0.983 |
| role target | 0.953 |
| head target | 0.953 |
| lexical order head target | 0.863 |
| lexical bag head target | 0.977 |
| role style | 0.993 |
| head style | 0.993 |
| lexical order head style | 0.960 |
| lexical bag head style | 0.983 |
| role arrow | 0.997 |
| head arrow | 0.997 |
| lexical order head arrow | 0.997 |
| lexical bag head arrow | 0.997 |
| role edge | 0.990 |
| head edge | 0.993 |
| lexical order head edge | 0.977 |
| lexical bag head edge | 0.990 |
| role pairing | 0.990 |
| head pairing | 0.990 |
| lexical order head pairing | 0.933 |
| lexical bag head pairing | 0.997 |
| role notcolor | 0.997 |
| head notcolor | 0.997 |
| lexical order head notcolor | 0.997 |
| lexical bag head notcolor | 0.997 |
| role depth | 0.997 |
| head depth | 0.997 |
| lexical order head depth | 0.993 |
| lexical bag head depth | 0.997 |
| role superlative | 1.000 |
| head superlative | 1.000 |
| lexical order head superlative | 0.933 |
| lexical bag head superlative | 1.000 |
| role comparison | 0.990 |
| head comparison | 0.990 |
| lexical order head comparison | 0.983 |
| lexical bag head comparison | 1.000 |
| heads FULL (model) | 0.740 |
| heads FULL (lexical order baseline) | 0.183 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.790 |
| presence object: absent read absent | 0.927 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 0.996 |
| presence relation: absent read absent | 0.996 |
| presence landmark: absent read absent | 0.987 |
| presence source: present read present | 0.875 |
| presence source: share of 'present' readings that abstain | 0.020 |
| presence source: share of true 'present' readings that abstain | 0.020 |
| presence pairing: present read present | 0.895 |
| presence pairing: share of 'present' readings that abstain | 0.176 |
| presence pairing: share of true 'present' readings that abstain | 0.176 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.049 |
| presence color: share of true 'present' readings that abstain | 0.049 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence target: share of 'present' readings that abstain | 0.146 |
| presence target: share of FALSE 'present' readings that abstain | 0.714 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.045 |
| presence region: share of true 'present' readings that abstain | 0.050 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.872 |
| presence target: share of true 'present' readings that abstain | 0.029 |
| presence style: present read present | 0.833 |
| presence style: share of 'present' readings that abstain | 0.100 |
| presence style: share of true 'present' readings that abstain | 0.100 |
| presence edge: present read present | 0.857 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence edge: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.667 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present | 0.400 |
| presence object: share of FALSE 'present' readings that abstain | 0.286 |
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| presence depth: present read present | 1.000 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence name: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.270; status {'abstain': 42, 'ok': 232, 'no-sense': 7, 'unknown-event': 19}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.833 | 0.410 / 0.062 | 0.90 | 0.080 | 0.013 / 0.087 |
| role object | 0.819 | 0.229 / 0.000 | 0.84 | 0.075 | 0.050 / 0.106 |
| roles (pooled) | 0.828 | 0.186 / 0.000 | 0.82 | 0.033 | 0.042 / 0.139 |
| role size | 0.860 | 0.167 / 0.000 | 0.84 | 0.000 | 0.020 / 0.140 |
| role name | 0.769 | 0.075 / 0.000 | 0.62 | 0.000 | 0.154 / 0.231 |
| role relation | 0.889 | 0.178 / 0.029 | 0.85 | 0.000 | 0.037 / 0.111 |
| role landmark | 0.857 | 0.101 / 0.000 | 0.79 | 0.000 | 0.071 / 0.143 |
| role source | 0.831 | 0.135 / 0.000 | 0.85 | 0.034 | 0.017 / 0.136 |
| role pairing | 0.850 | 0.161 / 0.000 | 0.75 | 0.050 | 0.150 / 0.100 |
| role superlative | 1.000 | 0.337 / 0.292 | 1.00 | 0.000 | 0.000 / 0.000 |
| role color | 0.884 | 0.182 / 0.001 | 0.86 | 0.014 | 0.043 / 0.101 |
| role region | 0.952 | 0.313 / 0.117 | 0.90 | 0.000 | 0.048 / 0.048 |
| role shape | 0.935 | 0.174 / 0.128 | 0.94 | 0.000 | 0.000 / 0.065 |
| role target | 0.829 | 0.190 / 0.000 | 0.83 | 0.024 | 0.024 / 0.146 |
| role style | 0.833 | 0.125 / 0.002 | 0.75 | 0.000 | 0.083 / 0.167 |
| role edge | 0.714 | 0.213 / 0.114 | 0.86 | 0.143 | 0.000 / 0.143 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role notcolor | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role axis | 1.000 | 0.171 / 0.103 | 1.00 | 0.000 | 0.000 / 0.000 |
| role comparison | 0.400 | 0.066 / 0.000 | 0.40 | 0.000 | 0.000 / 0.600 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role depth | 0.500 | 0.114 / 0.023 | 0.50 | 0.000 | 0.000 / 0.500 |
| role text | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role layout | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
,=1.00 and=1.00 at=1.00 from=1.00 in=1.00 labeled=1.00 named=1.00 of=1.00 on=1.00 to=1.00 with=1.00 COLOR=0.82 SUPER=0.78 REGION=0.73 NAME=0.59 AXIS=0.58 the=0.58 there=0.38 times=0.36 REL=0.35 that=0.35 them=0.33 unknown=0.32 rules=0.31 DIR=0.31 SHAPE=0.27 TEXT=0.27 PAIR=0.25 NOTCOLOR=0.24 ARROW=0.24 last=0.23 have=0.23 VERB=0.22 are=0.20 NUM=0.18 SIZE=0.17 it=0.16 DEPTH=0.15 lines=0.13 EDGE=0.13 each=0.12 cycle=0.12 called=0.12 i=0.11 LAYOUT=0.11 be=0.09 now=0.09 link=0.08 path=0.08 show=0.07 route=0.06 can=0.06 me=0.05 RECENT=0.05 STYLE=0.05 has=0.04 does=0.04 then=0.04 who=0.03 what=0.03 a=0.02

## What is weak, what to add
- heldout_sentences: FULL 0.672
- heldout_sentences: presence object: present read present 0.895
- heldout_sentences: presence object: share of 'present' readings that abstain 0.159
- heldout_sentences: presence object: share of true 'present' readings that abstain 0.147
- heldout_sentences: presence color: present read present 0.778
- heldout_sentences: predicate (surface lemma) 0.869
- heldout_sentences: event type (synonym table) 0.869
- heldout_sentences: role object 0.852
- heldout_sentences: head object 0.869
- heldout_sentences: occupancy: known filler 0.800
- heldout_sentences: heads FULL (model) 0.705
- heldout_sentences: heads FULL (lexical order baseline) 0.197
- heldout_sentences: heads FULL (lexical bag baseline, trained on the same training rows) 0.451
- heldout_sentences: FULL [depth given] 0.672
- heldout_sentences: FULL [depth and negation given] 0.672
- heldout_sentences: FULL [pooled midpoint (comparison)] 0.475
- heldout_sentences: role object [pooled midpoint (comparison)] 0.623
- heldout_sentences: heads FULL (model) [pooled midpoint (comparison)] 0.508
- heldout_sentences: presence object: present read present [pooled midpoint (comparison)] 0.521
- heldout_sentences: presence color: present read present [pooled midpoint (comparison)] 0.611
- heldout_sentences: occupancy: unknown filler 0.788
- heldout_sentences: presence source: present read present 0.864
- heldout_sentences: presence source: share of 'present' readings that abstain 0.000
- heldout_sentences: presence source: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: share of 'present' readings that abstain 0.143
- heldout_sentences: presence pairing: share of true 'present' readings that abstain 0.143
- heldout_sentences: presence source: present read present [pooled midpoint (comparison)] 0.727
- heldout_sentences: presence pairing: present read present [pooled midpoint (comparison)] 0.857
- heldout_sentences: presence relation: share of 'present' readings that abstain 0.133
- heldout_sentences: presence relation: share of true 'present' readings that abstain 0.133
- heldout_sentences: presence landmark: present read present 0.789
- heldout_sentences: presence landmark: share of 'present' readings that abstain 0.125
- heldout_sentences: presence landmark: share of true 'present' readings that abstain 0.067
- heldout_sentences: presence relation: present read present [pooled midpoint (comparison)] 0.625
- heldout_sentences: presence landmark: present read present [pooled midpoint (comparison)] 0.722
- heldout_sentences: presence target: share of 'present' readings that abstain 0.083
- heldout_sentences: presence target: share of true 'present' readings that abstain 0.100
- heldout_sentences: presence target: present read present [pooled midpoint (comparison)] 0.818
- heldout_sentences: presence shape: share of 'present' readings that abstain 0.000
- heldout_sentences: presence shape: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence size: share of 'present' readings that abstain 0.000
- heldout_sentences: presence size: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence color: share of 'present' readings that abstain 0.214
- heldout_sentences: presence color: share of true 'present' readings that abstain 0.214
- heldout_sentences: presence name: share of 'present' readings that abstain 0.333
- heldout_sentences: presence name: share of true 'present' readings that abstain 0.200
- heldout_sentences: presence region: share of 'present' readings that abstain 0.000
- heldout_sentences: presence region: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence style: present read present 0.000
- heldout_sentences: presence style: present read present [pooled midpoint (comparison)] 0.000
- heldout_sentences: presence comparison: present read present 0.000
- heldout_sentences: presence target: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: present read present 0.846
- heldout_sentences: presence superlative: share of 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence axis: present read present 0.667
- heldout_sentences: presence axis: present read present [pooled midpoint (comparison)] 0.000
- heldout_sentences: presence comparison: present read present [pooled midpoint (comparison)] 0.000
- heldout_sentences: presence depth: share of 'present' readings that abstain 0.000
- heldout_sentences: presence depth: share of true 'present' readings that abstain 0.000
- heldout_sentences: determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): FULL 0.693
- train (sample): presence object: share of 'present' readings that abstain 0.069
- train (sample): presence object: share of true 'present' readings that abstain 0.060
- train (sample): presence size: share of 'present' readings that abstain 0.023
- train (sample): presence size: share of true 'present' readings that abstain 0.023
- train (sample): presence name: present read present 0.833
- train (sample): presence name: share of 'present' readings that abstain 0.273
- train (sample): presence name: share of true 'present' readings that abstain 0.200
- train (sample): presence relation: share of 'present' readings that abstain 0.040
- train (sample): presence relation: share of true 'present' readings that abstain 0.042
- train (sample): presence landmark: share of 'present' readings that abstain 0.128
- train (sample): presence landmark: share of true 'present' readings that abstain 0.083
- train (sample): predicate (surface lemma) 0.833
- train (sample): event type (synonym table) 0.833
- train (sample): role object 0.857
- train (sample): head object 0.870
- train (sample): occupancy: known filler 0.835
- train (sample): heads FULL (model) 0.740
- train (sample): heads FULL (lexical order baseline) 0.183
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.790
- train (sample): FULL [depth given] 0.693
- train (sample): FULL [depth and negation given] 0.693
- train (sample): presence source: present read present 0.875
- train (sample): presence source: share of 'present' readings that abstain 0.020
- train (sample): presence source: share of true 'present' readings that abstain 0.020
- train (sample): presence pairing: present read present 0.895
- train (sample): presence pairing: share of 'present' readings that abstain 0.176
- train (sample): presence pairing: share of true 'present' readings that abstain 0.176
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.049
- train (sample): presence color: share of true 'present' readings that abstain 0.049
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence target: share of 'present' readings that abstain 0.146
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.714
- train (sample): presence region: share of 'present' readings that abstain 0.045
- train (sample): presence region: share of true 'present' readings that abstain 0.050
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence target: present read present 0.872
- train (sample): presence target: share of true 'present' readings that abstain 0.029
- train (sample): presence style: present read present 0.833
- train (sample): presence style: share of 'present' readings that abstain 0.100
- train (sample): presence style: share of true 'present' readings that abstain 0.100
- train (sample): presence edge: present read present 0.857
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.667
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence comparison: present read present 0.400
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.286
- train (sample): presence relation: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence depth: share of 'present' readings that abstain 0.000
- train (sample): presence depth: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_sentences: `move NAME REL NAME` FULL 0.000 (n 2)
- heldout_sentences: `make NAME COLOR` FULL 0.000 (n 2)
- heldout_sentences: `make NAME to COLOR` FULL 0.000 (n 1)
- heldout_sentences: `duplicate NAME NUM times` FULL 0.000 (n 1)
- heldout_sentences: `what is the size of NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_sentences | object | product: fitted | 0.895 | 0.973 | 0.934 | 0.159 (1.000 / 0.147) |
| heldout_sentences | object | comparison: pooled midpoint | 0.521 | 1.000 | 0.760 |  |
| heldout_sentences | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | shape | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | color | product: fitted | 0.778 | 1.000 | 0.889 | 0.214 (— / 0.214) |
| heldout_sentences | color | comparison: pooled midpoint | 0.611 | 1.000 | 0.806 |  |
| heldout_sentences | size | product: fitted | 0.929 | 1.000 | 0.964 | 0.000 (— / 0.000) |
| heldout_sentences | size | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_sentences | name | product: fitted | 1.000 | 0.991 | 0.995 | 0.333 (1.000 / 0.200) |
| heldout_sentences | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | relation | product: fitted | 0.938 | 1.000 | 0.969 | 0.133 (— / 0.133) |
| heldout_sentences | relation | comparison: pooled midpoint | 0.625 | 1.000 | 0.812 |  |
| heldout_sentences | landmark | product: fitted | 0.789 | 0.989 | 0.889 | 0.125 (1.000 / 0.067) |
| heldout_sentences | landmark | comparison: pooled midpoint | 0.722 | 1.000 | 0.861 |  |
| heldout_sentences | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | region | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | axis | product: fitted | 0.667 | 1.000 | 0.833 | 1.000 (— / 1.000) |
| heldout_sentences | axis | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | source | product: fitted | 0.864 | 1.000 | 0.932 | 0.000 (— / 0.000) |
| heldout_sentences | source | comparison: pooled midpoint | 0.727 | 1.000 | 0.864 |  |
| heldout_sentences | target | product: fitted | 0.909 | 0.980 | 0.945 | 0.083 (0.000 / 0.100) |
| heldout_sentences | target | comparison: pooled midpoint | 0.818 | 0.980 | 0.899 |  |
| heldout_sentences | style | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | style | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | edge | product: fitted | — | 1.000 | — |  |
| heldout_sentences | edge | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_sentences | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.143 (— / 0.143) |
| heldout_sentences | pairing | comparison: pooled midpoint | 0.857 | 1.000 | 0.929 |  |
| heldout_sentences | depth | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | depth | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | superlative | product: fitted | 0.846 | 1.000 | 0.923 | 0.000 (— / 0.000) |
| heldout_sentences | superlative | comparison: pooled midpoint | 0.917 | 1.000 | 0.958 |  |
| heldout_sentences | comparison | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | comparison | comparison: pooled midpoint | 0.000 | 0.991 | 0.495 |  |
| train (sample) | object | product: fitted | 0.938 | 0.927 | 0.933 | 0.069 (0.286 / 0.060) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.049 (— / 0.049) |
| train (sample) | size | product: fitted | 0.915 | 1.000 | 0.957 | 0.023 (— / 0.023) |
| train (sample) | name | product: fitted | 0.833 | 0.996 | 0.915 | 0.273 (1.000 / 0.200) |
| train (sample) | relation | product: fitted | 1.000 | 0.996 | 0.998 | 0.040 (0.000 / 0.042) |
| train (sample) | landmark | product: fitted | 0.923 | 0.987 | 0.955 | 0.128 (0.667 / 0.083) |
| train (sample) | region | product: fitted | 1.000 | 0.992 | 0.996 | 0.045 (0.000 / 0.050) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.875 | 1.000 | 0.938 | 0.020 (— / 0.020) |
| train (sample) | target | product: fitted | 0.872 | 0.970 | 0.921 | 0.146 (0.714 / 0.029) |
| train (sample) | style | product: fitted | 0.833 | 1.000 | 0.917 | 0.100 (— / 0.100) |
| train (sample) | edge | product: fitted | 0.857 | 0.996 | 0.927 | 0.000 (0.000 / 0.000) |
| train (sample) | pairing | product: fitted | 0.895 | 1.000 | 0.947 | 0.176 (— / 0.176) |
| train (sample) | depth | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 0.400 | 1.000 | 0.700 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
