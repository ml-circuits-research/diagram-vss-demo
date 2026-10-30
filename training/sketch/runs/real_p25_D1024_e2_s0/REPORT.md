# REPORT — world `real`, legend sha256:765e8af451e7… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1306 annotated sentences from 1 files; provenance: {'llm': 1306}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/real_p25_D1024_e2_s0/splits.json before training; source: split_hints.json)
- heldout_sentences: 130 sentences
- train: 1176 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 10% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
6980 tokens in the examples; 314 with no kind in the lexicon (share 0.045), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit d96cc32. Memory curve: runs/real_p25_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.296 [rule: fit; pooled midpoint 0.821 (comparison)] (present 1.539, n 262 / absent 0.103, n 138)
- attr_presence:object: threshold 0.340 [rule: fit; pooled midpoint 0.369 (comparison)] (present 0.603, n 26 / absent 0.134, n 223)
- det_presence:object: threshold 0.472 [rule: fit; pooled midpoint 0.453 (comparison)] (present 0.843, n 7 / absent 0.063, n 242)
- presence:shape: threshold 0.293 [rule: fit; pooled midpoint 0.268 (comparison)] (present 0.531, n 36 / absent 0.005, n 364)
- presence:color: threshold 0.087 [rule: fit; pooled midpoint 0.391 (comparison)] (present 0.770, n 81 / absent 0.012, n 319)
- presence:size: threshold 0.192 [rule: fit; pooled midpoint 0.295 (comparison)] (present 0.531, n 67 / absent 0.058, n 333)
- presence:name: threshold 0.076 [rule: fit; pooled midpoint 0.409 (comparison)] (present 0.812, n 22 / absent 0.005, n 378)
- presence:text: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:relation: threshold 0.156 [rule: fit; pooled midpoint 0.436 (comparison)] (present 0.878, n 48 / absent -0.007, n 352)
- presence:landmark: threshold 0.150 [rule: fit; pooled midpoint 0.410 (comparison)] (present 0.780, n 72 / absent 0.039, n 328)
- presence:landmark2: threshold 0.044 [rule: fit; pooled midpoint 0.066 (comparison)] (present 0.126, n 5 / absent 0.006, n 395)
- presence:region: threshold 0.189 [rule: fit; pooled midpoint 0.054 (comparison)] (present 0.089, n 26 / absent 0.019, n 374)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:quantity: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:axis: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:layout: threshold 0.202 [rule: fit; pooled midpoint 0.124 (comparison)] (present 0.247, n 12 / absent 0.000, n 388)
- presence:source: threshold 0.203 [rule: fit; pooled midpoint 0.464 (comparison)] (present 0.901, n 78 / absent 0.026, n 322)
- presence:target: threshold 0.151 [rule: fit; pooled midpoint 0.421 (comparison)] (present 0.814, n 54 / absent 0.028, n 346)
- presence:style: threshold 0.197 [rule: fit; pooled midpoint 0.190 (comparison)] (present 0.367, n 15 / absent 0.012, n 385)
- presence:arrow: threshold 0.107 [rule: fit; pooled midpoint 0.062 (comparison)] (present 0.128, n 6 / absent -0.003, n 394)
- presence:edge: threshold 0.269 [rule: fit; pooled midpoint 0.258 (comparison)] (present 0.499, n 20 / absent 0.017, n 380)
- presence:pairing: threshold 0.179 [rule: fit; pooled midpoint 0.272 (comparison)] (present 0.518, n 17 / absent 0.025, n 383)
- presence:notcolor: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:depth: threshold 0.122 [rule: fit; pooled midpoint 0.099 (comparison)] (present 0.198, n 7 / absent -0.000, n 393)
- presence:superlative: threshold 0.446 [rule: fit; pooled midpoint 0.311 (comparison)] (present 0.621, n 27 / absent 0.001, n 373)
- presence:comparison: threshold 0.261 [rule: fit; pooled midpoint 0.259 (comparison)] (present 0.517, n 7 / absent 0.001, n 393)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 19)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.056, color 0.056, size 0.143, name 0.001, text 0.125, relation 0.167, landmark 0.001, landmark2 0.001, region 0.111, direction 0.250, amount 0.091, quantity 0.091, axis 0.500, layout 0.250, source 0.001, target 0.001, style 0.333, arrow 0.500, edge 0.333, pairing 0.333, notcolor 0.056, depth 0.500, superlative 0.100, comparison 0.143, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_sentences — catalog candidates (n = 130 of 130)
| axis | accuracy |
|---|---|
| FULL | 0.508 |
| FULL [depth given] | 0.508 |
| FULL [depth and negation given] | 0.508 |
| FULL [pooled midpoint (comparison)] | 0.308 |
| presence object: absent read absent | 0.923 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 0.981 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.988 |
| presence landmark2: absent read absent | 0.972 |
| presence region: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: present read present | 0.909 |
| presence source: share of 'present' readings that abstain | 0.000 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 1.000 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.500 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.286 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence pairing: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.854 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.808 |
| event type (synonym table) | 0.808 |
| role object | 0.738 |
| head object | 0.746 |
| lexical order head object | 0.769 |
| lexical bag head object | 0.762 |
| occupancy: not given | 0.995 |
| role shape | 0.985 |
| head shape | 0.985 |
| lexical order head shape | 0.900 |
| lexical bag head shape | 0.992 |
| role color | 0.977 |
| head color | 0.977 |
| lexical order head color | 0.854 |
| lexical bag head color | 0.985 |
| role size | 0.985 |
| head size | 0.985 |
| lexical order head size | 0.838 |
| lexical bag head size | 0.969 |
| role name | 0.977 |
| head name | 0.977 |
| lexical order head name | 0.946 |
| lexical bag head name | 0.977 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 1.000 |
| lexical bag head text | 1.000 |
| role relation | 0.946 |
| head relation | 0.946 |
| lexical order head relation | 0.823 |
| lexical bag head relation | 0.985 |
| role landmark | 0.954 |
| head landmark | 0.954 |
| lexical order head landmark | 0.785 |
| lexical bag head landmark | 0.900 |
| role landmark2 | 0.962 |
| head landmark2 | 0.962 |
| lexical order head landmark2 | 0.985 |
| lexical bag head landmark2 | 0.985 |
| role region | 0.954 |
| head region | 0.954 |
| lexical order head region | 0.938 |
| lexical bag head region | 0.977 |
| role direction | 0.992 |
| head direction | 0.992 |
| lexical order head direction | 0.992 |
| lexical bag head direction | 0.992 |
| role amount | 0.992 |
| head amount | 0.992 |
| lexical order head amount | 0.992 |
| lexical bag head amount | 0.992 |
| role quantity | 0.992 |
| head quantity | 0.992 |
| lexical order head quantity | 0.992 |
| lexical bag head quantity | 1.000 |
| role axis | 0.977 |
| head axis | 0.977 |
| lexical order head axis | 0.977 |
| lexical bag head axis | 0.977 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 1.000 |
| lexical bag head layout | 1.000 |
| role source | 0.969 |
| head source | 0.969 |
| lexical order head source | 0.815 |
| lexical bag head source | 0.900 |
| occupancy: known filler | 0.729 |
| role target | 0.977 |
| head target | 0.977 |
| lexical order head target | 0.885 |
| lexical bag head target | 0.900 |
| occupancy: unknown filler | 0.714 |
| role style | 0.977 |
| head style | 0.977 |
| lexical order head style | 0.977 |
| lexical bag head style | 0.977 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 1.000 |
| lexical bag head arrow | 1.000 |
| role edge | 0.985 |
| head edge | 0.985 |
| lexical order head edge | 0.962 |
| lexical bag head edge | 0.977 |
| role pairing | 0.977 |
| head pairing | 0.977 |
| lexical order head pairing | 0.938 |
| lexical bag head pairing | 0.977 |
| role notcolor | 1.000 |
| head notcolor | 1.000 |
| lexical order head notcolor | 1.000 |
| lexical bag head notcolor | 1.000 |
| role depth | 0.985 |
| head depth | 0.985 |
| lexical order head depth | 0.977 |
| lexical bag head depth | 0.992 |
| role superlative | 0.962 |
| head superlative | 0.962 |
| lexical order head superlative | 0.869 |
| lexical bag head superlative | 0.938 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.969 |
| lexical bag head comparison | 0.992 |
| heads FULL (model) | 0.546 |
| heads FULL (lexical order baseline) | 0.138 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.415 |
| role object [pooled midpoint (comparison)] | 0.508 |
| role shape [pooled midpoint (comparison)] | 0.985 |
| role color [pooled midpoint (comparison)] | 0.938 |
| role size [pooled midpoint (comparison)] | 0.985 |
| role name [pooled midpoint (comparison)] | 0.985 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.923 |
| role landmark [pooled midpoint (comparison)] | 0.900 |
| role landmark2 [pooled midpoint (comparison)] | 0.938 |
| role region [pooled midpoint (comparison)] | 0.954 |
| role direction [pooled midpoint (comparison)] | 0.992 |
| role amount [pooled midpoint (comparison)] | 0.992 |
| role quantity [pooled midpoint (comparison)] | 0.992 |
| role axis [pooled midpoint (comparison)] | 0.977 |
| role layout [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.962 |
| role target [pooled midpoint (comparison)] | 0.946 |
| role style [pooled midpoint (comparison)] | 0.977 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 0.985 |
| role pairing [pooled midpoint (comparison)] | 0.977 |
| role notcolor [pooled midpoint (comparison)] | 1.000 |
| role depth [pooled midpoint (comparison)] | 0.985 |
| role superlative [pooled midpoint (comparison)] | 0.977 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.338 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.974 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 0.945 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.864 |
| presence target: present read present [pooled midpoint (comparison)] | 0.714 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence depth: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: present read present | 0.750 |
| presence object: share of 'present' readings that abstain | 0.105 |
| presence object: share of true 'present' readings that abstain | 0.111 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 0.979 |
| presence style: absent read absent | 0.972 |
| presence edge: absent read absent | 0.981 |
| presence object: present read present [pooled midpoint (comparison)] | 0.319 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.979 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.972 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 0.981 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present | 0.727 |
| presence relation: share of 'present' readings that abstain | 0.125 |
| presence relation: share of true 'present' readings that abstain | 0.125 |
| presence landmark: present read present | 0.852 |
| presence landmark: share of 'present' readings that abstain | 0.167 |
| presence landmark: share of true 'present' readings that abstain | 0.130 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.591 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.556 |
| presence landmark: share of FALSE 'present' readings that abstain | 1.000 |
| presence shape: present read present | 0.917 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.917 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence name: share of 'present' readings that abstain | 0.250 |
| presence name: share of FALSE 'present' readings that abstain | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence name: present read present | 1.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 0.833 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.250 |
| presence comparison: share of true 'present' readings that abstain | 0.250 |
| presence comparison: present read present [pooled midpoint (comparison)] | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: share of FALSE 'present' readings that abstain | 1.000 |
| presence edge: share of FALSE 'present' readings that abstain | 1.000 |
| presence color: present read present | 0.941 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.647 |
| presence landmark2: present read present | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.000 |
| presence superlative: present read present | 0.800 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.933 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of FALSE 'present' readings that abstain | 1.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence depth: present read present | 0.500 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence depth: present read present [pooled midpoint (comparison)] | 0.500 |

residual mean 0.345; status {'ok': 85, 'abstain': 26, 'no-sense': 8, 'unknown-event': 11}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.808 | 0.442 / 0.015 | 0.87 | 0.062 | 0.000 / 0.131 |
| role source | 0.833 | 0.100 / 0.017 | 0.88 | 0.042 | 0.000 / 0.125 |
| roles (pooled) | 0.724 | 0.150 / 0.000 | 0.74 | 0.059 | 0.041 / 0.217 |
| role target | 0.933 | 0.179 / 0.067 | 0.93 | 0.000 | 0.000 / 0.067 |
| role style | 1.000 | 0.095 / 0.058 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.216 / 0.179 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 0.631 | 0.154 / 0.000 | 0.65 | 0.095 | 0.071 / 0.274 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role pairing | 0.625 | 0.203 / 0.000 | 0.75 | 0.125 | 0.000 / 0.250 |
| role relation | 0.696 | 0.131 / 0.000 | 0.65 | 0.043 | 0.087 / 0.261 |
| role landmark | 0.821 | 0.097 / 0.000 | 0.75 | 0.036 | 0.107 / 0.143 |
| role shape | 0.846 | 0.180 / 0.150 | 0.92 | 0.077 | 0.000 / 0.077 |
| role size | 0.905 | 0.229 / 0.139 | 0.95 | 0.048 | 0.000 / 0.048 |
| role name | 0.857 | 0.165 / 0.120 | 1.00 | 0.143 | 0.000 / 0.000 |
| role comparison | 1.000 | 0.144 / 0.072 | 0.75 | 0.000 | 0.250 / 0.000 |
| role region | 0.250 | 0.054 / 0.000 | 0.38 | 0.125 | 0.000 / 0.625 |
| role color | 0.842 | 0.208 / 0.109 | 0.89 | 0.053 | 0.000 / 0.105 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role superlative | 0.706 | 0.198 / 0.000 | 0.71 | 0.000 | 0.000 / 0.294 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role depth | 0.333 | 0.047 / 0.000 | 0.33 | 0.000 | 0.000 / 0.667 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

### train (sample) — catalog candidates (n = 300 of 1176)
| axis | accuracy |
|---|---|
| FULL | 0.523 |
| FULL [depth given] | 0.523 |
| FULL [depth and negation given] | 0.523 |
| presence object: absent read absent | 0.956 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 0.987 |
| presence relation: absent read absent | 0.995 |
| presence landmark: absent read absent | 0.985 |
| presence landmark2: absent read absent | 0.987 |
| presence region: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.995 |
| presence source: share of 'present' readings that abstain | 0.048 |
| presence source: share of FALSE 'present' readings that abstain | 1.000 |
| presence target: absent read absent | 0.975 |
| presence style: absent read absent | 0.991 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.100 |
| presence pairing: share of true 'present' readings that abstain | 0.100 |
| presence depth: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.793 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.713 |
| event type (synonym table) | 0.713 |
| role object | 0.753 |
| head object | 0.757 |
| lexical order head object | 0.760 |
| lexical bag head object | 0.900 |
| occupancy: not given | 0.997 |
| role shape | 0.993 |
| head shape | 0.993 |
| lexical order head shape | 0.913 |
| lexical bag head shape | 0.997 |
| role color | 0.947 |
| head color | 0.947 |
| lexical order head color | 0.793 |
| lexical bag head color | 0.977 |
| role size | 0.983 |
| head size | 0.983 |
| lexical order head size | 0.870 |
| lexical bag head size | 0.983 |
| role name | 0.987 |
| head name | 0.987 |
| lexical order head name | 0.973 |
| lexical bag head name | 1.000 |
| role text | 0.993 |
| head text | 0.993 |
| lexical order head text | 0.993 |
| lexical bag head text | 1.000 |
| role relation | 0.983 |
| head relation | 0.983 |
| lexical order head relation | 0.900 |
| lexical bag head relation | 0.983 |
| role landmark | 0.980 |
| head landmark | 0.980 |
| lexical order head landmark | 0.860 |
| lexical bag head landmark | 0.960 |
| role landmark2 | 0.990 |
| head landmark2 | 0.990 |
| lexical order head landmark2 | 0.983 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.943 |
| head region | 0.943 |
| lexical order head region | 0.923 |
| lexical bag head region | 0.977 |
| role direction | 0.993 |
| head direction | 0.993 |
| lexical order head direction | 0.993 |
| lexical bag head direction | 1.000 |
| role amount | 0.993 |
| head amount | 0.993 |
| lexical order head amount | 0.993 |
| lexical bag head amount | 1.000 |
| role quantity | 0.987 |
| head quantity | 0.987 |
| lexical order head quantity | 0.987 |
| lexical bag head quantity | 1.000 |
| role axis | 0.977 |
| head axis | 0.977 |
| lexical order head axis | 0.977 |
| lexical bag head axis | 1.000 |
| role layout | 0.983 |
| head layout | 0.983 |
| lexical order head layout | 0.973 |
| lexical bag head layout | 0.997 |
| role source | 0.930 |
| head source | 0.930 |
| lexical order head source | 0.800 |
| lexical bag head source | 0.970 |
| role target | 0.947 |
| head target | 0.947 |
| lexical order head target | 0.873 |
| lexical bag head target | 0.983 |
| role style | 0.983 |
| head style | 0.983 |
| lexical order head style | 0.970 |
| lexical bag head style | 0.997 |
| role arrow | 0.997 |
| head arrow | 0.997 |
| lexical order head arrow | 0.990 |
| lexical bag head arrow | 1.000 |
| role edge | 0.990 |
| head edge | 0.990 |
| lexical order head edge | 0.963 |
| lexical bag head edge | 0.997 |
| role pairing | 0.980 |
| head pairing | 0.980 |
| lexical order head pairing | 0.947 |
| lexical bag head pairing | 0.993 |
| occupancy: known filler | 0.691 |
| role notcolor | 0.997 |
| head notcolor | 0.997 |
| lexical order head notcolor | 0.997 |
| lexical bag head notcolor | 1.000 |
| role depth | 0.997 |
| head depth | 0.997 |
| lexical order head depth | 0.987 |
| lexical bag head depth | 1.000 |
| role superlative | 0.980 |
| head superlative | 0.980 |
| lexical order head superlative | 0.943 |
| lexical bag head superlative | 0.987 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.983 |
| lexical bag head comparison | 1.000 |
| heads FULL (model) | 0.567 |
| heads FULL (lexical order baseline) | 0.180 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.747 |
| presence object: present read present | 0.818 |
| presence object: share of 'present' readings that abstain | 0.096 |
| presence object: share of true 'present' readings that abstain | 0.091 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: present read present | 0.733 |
| presence superlative: share of 'present' readings that abstain | 0.091 |
| presence superlative: share of true 'present' readings that abstain | 0.091 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 0.958 |
| presence color: share of 'present' readings that abstain | 0.043 |
| presence color: share of true 'present' readings that abstain | 0.043 |
| presence size: present read present | 0.971 |
| presence size: share of 'present' readings that abstain | 0.029 |
| presence size: share of true 'present' readings that abstain | 0.029 |
| presence source: present read present | 0.820 |
| presence source: share of true 'present' readings that abstain | 0.024 |
| presence target: share of 'present' readings that abstain | 0.031 |
| presence target: share of FALSE 'present' readings that abstain | 0.200 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence relation: present read present | 0.963 |
| presence relation: share of 'present' readings that abstain | 0.148 |
| presence relation: share of true 'present' readings that abstain | 0.115 |
| presence landmark: present read present | 0.975 |
| presence landmark: share of 'present' readings that abstain | 0.143 |
| presence landmark: share of true 'present' readings that abstain | 0.077 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.750 |
| presence landmark2: share of true 'present' readings that abstain | 0.600 |
| presence target: present read present | 0.794 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 0.750 |
| presence style: share of 'present' readings that abstain | 0.375 |
| presence style: share of true 'present' readings that abstain | 0.167 |
| presence edge: present read present | 0.800 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 1.000 |
| presence name: share of 'present' readings that abstain | 0.300 |
| presence name: share of FALSE 'present' readings that abstain | 0.333 |
| presence name: present read present | 1.000 |
| presence name: share of true 'present' readings that abstain | 0.286 |
| presence layout: present read present | 0.750 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: share of FALSE 'present' readings that abstain | 1.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence relation: share of FALSE 'present' readings that abstain | 1.000 |
| presence arrow: present read present | 0.667 |
| presence depth: present read present | 1.000 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.500 |
| presence region: share of true 'present' readings that abstain | 0.500 |
| presence object: share of FALSE 'present' readings that abstain | 0.250 |
| presence landmark: share of FALSE 'present' readings that abstain | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |

residual mean 0.393; status {'abstain': 49, 'ok': 189, 'no-sense': 12, 'unknown-event': 50}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.713 | 0.422 / 0.011 | 0.82 | 0.110 | 0.000 / 0.177 |
| role pairing | 0.625 | 0.195 / 0.009 | 0.81 | 0.250 | 0.062 / 0.125 |
| roles (pooled) | 0.687 | 0.164 / 0.000 | 0.72 | 0.086 | 0.052 / 0.226 |
| role object | 0.632 | 0.202 / 0.000 | 0.73 | 0.158 | 0.058 / 0.211 |
| role superlative | 0.647 | 0.232 / 0.000 | 0.65 | 0.059 | 0.059 / 0.294 |
| role shape | 0.923 | 0.167 / 0.129 | 0.92 | 0.000 | 0.000 / 0.077 |
| role color | 0.742 | 0.201 / 0.000 | 0.81 | 0.097 | 0.032 / 0.161 |
| role size | 0.872 | 0.216 / 0.074 | 0.90 | 0.051 | 0.026 / 0.077 |
| role source | 0.667 | 0.106 / 0.000 | 0.73 | 0.083 | 0.017 / 0.250 |
| role relation | 0.867 | 0.184 / 0.000 | 0.77 | 0.000 | 0.100 / 0.133 |
| role landmark | 0.929 | 0.118 / 0.041 | 0.86 | 0.000 | 0.071 / 0.071 |
| role landmark2 | 1.000 | 0.037 / 0.014 | 0.40 | 0.000 | 0.600 / 0.000 |
| role target | 0.711 | 0.161 / 0.000 | 0.79 | 0.079 | 0.000 / 0.211 |
| role style | 0.667 | 0.123 / 0.000 | 0.67 | 0.111 | 0.111 / 0.222 |
| role edge | 0.727 | 0.188 / 0.000 | 0.82 | 0.091 | 0.000 / 0.182 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role name | 0.875 | 0.114 / 0.004 | 0.62 | 0.000 | 0.250 / 0.125 |
| role layout | 0.375 | 0.078 / 0.000 | 0.38 | 0.000 | 0.000 / 0.625 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 1.000 | 0.183 / 0.149 | 1.00 | 0.000 | 0.000 / 0.000 |
| role notcolor | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role arrow | 0.667 | 0.043 / 0.012 | 0.67 | 0.000 | 0.000 / 0.333 |
| role region | 0.261 | 0.023 / 0.000 | 0.13 | 0.000 | 0.130 / 0.739 |
| role text | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role depth | 0.750 | 0.128 / 0.034 | 0.75 | 0.000 | 0.000 / 0.250 |

## Gates (seed 0; OPEN > 0.5)
,=1.00 and=1.00 from=1.00 in=1.00 labeled=1.00 named=1.00 of=1.00 on=1.00 to=1.00 with=1.00 REGION=0.85 SUPER=0.82 COLOR=0.80 NAME=0.66 REL=0.64 linked=0.53 LAYOUT=0.49 DIR=0.48 PAIR=0.46 DEPTH=0.43 rules=0.40 connected=0.39 that=0.38 them=0.37 there=0.36 px=0.35 NOTCOLOR=0.35 AXIS=0.34 unknown=0.34 times=0.33 have=0.33 SHAPE=0.30 RECENT=0.29 be=0.29 than=0.24 TEXT=0.23 now=0.23 VERB=0.20 it=0.17 the=0.16 EDGE=0.15 most=0.14 each=0.13 i=0.12 ARROW=0.12 SIZE=0.10 NUM=0.10 has=0.09 any=0.09 least=0.09 are=0.08 me=0.08 who=0.06 all=0.05 reached=0.05 can=0.05 directly=0.05 reachable=0.05 one=0.04 does=0.04 STYLE=0.04 a=0.02

## What is weak, what to add
- heldout_sentences: FULL 0.508
- heldout_sentences: presence source: share of 'present' readings that abstain 0.000
- heldout_sentences: presence source: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence target: share of 'present' readings that abstain 0.000
- heldout_sentences: presence target: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence style: share of 'present' readings that abstain 0.500
- heldout_sentences: presence style: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence edge: share of 'present' readings that abstain 0.286
- heldout_sentences: presence edge: share of true 'present' readings that abstain 0.000
- heldout_sentences: structure (depth, negation) 0.854
- heldout_sentences: predicate (surface lemma) 0.808
- heldout_sentences: event type (synonym table) 0.808
- heldout_sentences: role object 0.738
- heldout_sentences: head object 0.746
- heldout_sentences: occupancy: known filler 0.729
- heldout_sentences: occupancy: unknown filler 0.714
- heldout_sentences: heads FULL (model) 0.546
- heldout_sentences: heads FULL (lexical order baseline) 0.138
- heldout_sentences: heads FULL (lexical bag baseline, trained on the same training rows) 0.415
- heldout_sentences: FULL [depth given] 0.508
- heldout_sentences: FULL [depth and negation given] 0.508
- heldout_sentences: FULL [pooled midpoint (comparison)] 0.308
- heldout_sentences: role object [pooled midpoint (comparison)] 0.508
- heldout_sentences: heads FULL (model) [pooled midpoint (comparison)] 0.338
- heldout_sentences: presence source: present read present [pooled midpoint (comparison)] 0.864
- heldout_sentences: presence target: present read present [pooled midpoint (comparison)] 0.714
- heldout_sentences: presence object: present read present 0.750
- heldout_sentences: presence object: share of 'present' readings that abstain 0.105
- heldout_sentences: presence object: share of true 'present' readings that abstain 0.111
- heldout_sentences: presence object: present read present [pooled midpoint (comparison)] 0.319
- heldout_sentences: presence pairing: share of 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence relation: present read present 0.727
- heldout_sentences: presence relation: share of 'present' readings that abstain 0.125
- heldout_sentences: presence relation: share of true 'present' readings that abstain 0.125
- heldout_sentences: presence landmark: present read present 0.852
- heldout_sentences: presence landmark: share of 'present' readings that abstain 0.167
- heldout_sentences: presence landmark: share of true 'present' readings that abstain 0.130
- heldout_sentences: presence relation: present read present [pooled midpoint (comparison)] 0.591
- heldout_sentences: presence landmark: present read present [pooled midpoint (comparison)] 0.556
- heldout_sentences: presence shape: share of 'present' readings that abstain 0.000
- heldout_sentences: presence shape: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence size: share of 'present' readings that abstain 0.000
- heldout_sentences: presence size: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence name: share of 'present' readings that abstain 0.250
- heldout_sentences: presence name: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence name: present read present [pooled midpoint (comparison)] 0.833
- heldout_sentences: presence comparison: share of 'present' readings that abstain 0.250
- heldout_sentences: presence comparison: share of true 'present' readings that abstain 0.250
- heldout_sentences: presence region: share of 'present' readings that abstain 0.000
- heldout_sentences: presence region: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence color: share of 'present' readings that abstain 0.000
- heldout_sentences: presence color: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence color: present read present [pooled midpoint (comparison)] 0.647
- heldout_sentences: presence landmark2: present read present 0.000
- heldout_sentences: presence landmark2: present read present [pooled midpoint (comparison)] 0.000
- heldout_sentences: presence superlative: present read present 0.800
- heldout_sentences: presence superlative: share of 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence target: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence depth: present read present 0.500
- heldout_sentences: presence depth: share of 'present' readings that abstain 0.000
- heldout_sentences: presence depth: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence depth: present read present [pooled midpoint (comparison)] 0.500
- train (sample): FULL 0.523
- train (sample): presence source: share of 'present' readings that abstain 0.048
- train (sample): presence pairing: share of 'present' readings that abstain 0.100
- train (sample): presence pairing: share of true 'present' readings that abstain 0.100
- train (sample): structure (depth, negation) 0.793
- train (sample): predicate (surface lemma) 0.713
- train (sample): event type (synonym table) 0.713
- train (sample): role object 0.753
- train (sample): head object 0.757
- train (sample): occupancy: known filler 0.691
- train (sample): heads FULL (model) 0.567
- train (sample): heads FULL (lexical order baseline) 0.180
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.747
- train (sample): FULL [depth given] 0.523
- train (sample): FULL [depth and negation given] 0.523
- train (sample): presence object: present read present 0.818
- train (sample): presence object: share of 'present' readings that abstain 0.096
- train (sample): presence object: share of true 'present' readings that abstain 0.091
- train (sample): presence superlative: present read present 0.733
- train (sample): presence superlative: share of 'present' readings that abstain 0.091
- train (sample): presence superlative: share of true 'present' readings that abstain 0.091
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.043
- train (sample): presence color: share of true 'present' readings that abstain 0.043
- train (sample): presence size: share of 'present' readings that abstain 0.029
- train (sample): presence size: share of true 'present' readings that abstain 0.029
- train (sample): presence source: present read present 0.820
- train (sample): presence source: share of true 'present' readings that abstain 0.024
- train (sample): presence target: share of 'present' readings that abstain 0.031
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.200
- train (sample): presence relation: share of 'present' readings that abstain 0.148
- train (sample): presence relation: share of true 'present' readings that abstain 0.115
- train (sample): presence landmark: share of 'present' readings that abstain 0.143
- train (sample): presence landmark: share of true 'present' readings that abstain 0.077
- train (sample): presence landmark2: share of 'present' readings that abstain 0.750
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.600
- train (sample): presence target: present read present 0.794
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): presence style: present read present 0.750
- train (sample): presence style: share of 'present' readings that abstain 0.375
- train (sample): presence style: share of true 'present' readings that abstain 0.167
- train (sample): presence edge: present read present 0.800
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence name: share of 'present' readings that abstain 0.300
- train (sample): presence name: share of FALSE 'present' readings that abstain 0.333
- train (sample): presence name: share of true 'present' readings that abstain 0.286
- train (sample): presence layout: present read present 0.750
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence arrow: present read present 0.667
- train (sample): presence depth: share of 'present' readings that abstain 0.000
- train (sample): presence depth: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.500
- train (sample): presence region: share of true 'present' readings that abstain 0.500
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.250
- train (sample): presence arrow: share of 'present' readings that abstain 0.000
- train (sample): presence arrow: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_sentences: `move NAME REL NAME` FULL 0.000 (n 5)
- heldout_sentences: `NAME REGION` FULL 0.000 (n 3)
- heldout_sentences: `which rules` FULL 0.000 (n 3)
- heldout_sentences: `is_there COLOR SHAPE left` FULL 0.000 (n 2)
- heldout_sentences: `duplicate NAME NUM times` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_sentences | object | product: fitted | 0.750 | 0.923 | 0.837 | 0.105 (0.000 / 0.111) |
| heldout_sentences | object | comparison: pooled midpoint | 0.319 | 0.974 | 0.647 |  |
| heldout_sentences | shape | product: fitted | 0.917 | 1.000 | 0.958 | 0.000 (— / 0.000) |
| heldout_sentences | shape | comparison: pooled midpoint | 0.917 | 1.000 | 0.958 |  |
| heldout_sentences | color | product: fitted | 0.941 | 1.000 | 0.971 | 0.000 (— / 0.000) |
| heldout_sentences | color | comparison: pooled midpoint | 0.647 | 1.000 | 0.824 |  |
| heldout_sentences | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | name | product: fitted | 1.000 | 0.981 | 0.990 | 0.250 (1.000 / 0.000) |
| heldout_sentences | name | comparison: pooled midpoint | 0.833 | 1.000 | 0.917 |  |
| heldout_sentences | relation | product: fitted | 0.727 | 1.000 | 0.864 | 0.125 (— / 0.125) |
| heldout_sentences | relation | comparison: pooled midpoint | 0.591 | 1.000 | 0.795 |  |
| heldout_sentences | landmark | product: fitted | 0.852 | 0.988 | 0.920 | 0.167 (1.000 / 0.130) |
| heldout_sentences | landmark | comparison: pooled midpoint | 0.556 | 1.000 | 0.778 |  |
| heldout_sentences | landmark2 | product: fitted | 0.000 | 0.972 | 0.486 | 1.000 (1.000 / —) |
| heldout_sentences | landmark2 | comparison: pooled midpoint | 0.000 | 0.945 | 0.472 |  |
| heldout_sentences | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | region | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | layout | product: fitted | — | 1.000 | — |  |
| heldout_sentences | layout | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_sentences | source | product: fitted | 0.909 | 1.000 | 0.955 | 0.000 (— / 0.000) |
| heldout_sentences | source | comparison: pooled midpoint | 0.864 | 1.000 | 0.932 |  |
| heldout_sentences | target | product: fitted | 1.000 | 0.979 | 0.990 | 0.000 (0.000 / 0.000) |
| heldout_sentences | target | comparison: pooled midpoint | 0.714 | 0.979 | 0.847 |  |
| heldout_sentences | style | product: fitted | 1.000 | 0.972 | 0.986 | 0.500 (1.000 / 0.000) |
| heldout_sentences | style | comparison: pooled midpoint | 1.000 | 0.972 | 0.986 |  |
| heldout_sentences | arrow | product: fitted | — | 1.000 | — |  |
| heldout_sentences | arrow | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_sentences | edge | product: fitted | 1.000 | 0.981 | 0.991 | 0.286 (1.000 / 0.000) |
| heldout_sentences | edge | comparison: pooled midpoint | 1.000 | 0.981 | 0.991 |  |
| heldout_sentences | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | pairing | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | depth | product: fitted | 0.500 | 1.000 | 0.750 | 0.000 (— / 0.000) |
| heldout_sentences | depth | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_sentences | superlative | product: fitted | 0.800 | 1.000 | 0.900 | 0.000 (— / 0.000) |
| heldout_sentences | superlative | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_sentences | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.250 (— / 0.250) |
| heldout_sentences | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | object | product: fitted | 0.818 | 0.956 | 0.887 | 0.096 (0.250 / 0.091) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.958 | 1.000 | 0.979 | 0.043 (— / 0.043) |
| train (sample) | size | product: fitted | 0.971 | 1.000 | 0.986 | 0.029 (— / 0.029) |
| train (sample) | name | product: fitted | 1.000 | 0.987 | 0.994 | 0.300 (0.333 / 0.286) |
| train (sample) | relation | product: fitted | 0.963 | 0.995 | 0.979 | 0.148 (1.000 / 0.115) |
| train (sample) | landmark | product: fitted | 0.975 | 0.985 | 0.980 | 0.143 (1.000 / 0.077) |
| train (sample) | landmark2 | product: fitted | 1.000 | 0.987 | 0.994 | 0.750 (1.000 / 0.600) |
| train (sample) | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.500 (— / 0.500) |
| train (sample) | layout | product: fitted | 0.750 | 1.000 | 0.875 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.820 | 0.995 | 0.907 | 0.048 (1.000 / 0.024) |
| train (sample) | target | product: fitted | 0.794 | 0.975 | 0.885 | 0.031 (0.200 / 0.000) |
| train (sample) | style | product: fitted | 0.750 | 0.991 | 0.871 | 0.375 (1.000 / 0.167) |
| train (sample) | arrow | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| train (sample) | edge | product: fitted | 0.800 | 1.000 | 0.900 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.100 (— / 0.100) |
| train (sample) | depth | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 0.733 | 1.000 | 0.867 | 0.091 (— / 0.091) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
