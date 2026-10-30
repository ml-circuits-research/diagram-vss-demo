# REPORT — world `real`, legend sha256:52428bd5cb12… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
2696 annotated sentences from 1 files; provenance: {'llm': 2696}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/real_p50_D1024_e2_s0/splits.json before training; source: split_hints.json)
- heldout_sentences: 272 sentences
- train: 2424 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 10% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
14741 tokens in the examples; 358 with no kind in the lexicon (share 0.024), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 120596d. Memory curve: runs/real_p50_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.141 [rule: fit; pooled midpoint 0.814 (comparison)] (present 1.490, n 268 / absent 0.138, n 132)
- attr_presence:object: threshold 0.337 [rule: fit; pooled midpoint 0.397 (comparison)] (present 0.657, n 30 / absent 0.136, n 228)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 255)
- presence:shape: threshold 0.188 [rule: fit; pooled midpoint 0.311 (comparison)] (present 0.605, n 46 / absent 0.016, n 354)
- presence:color: threshold 0.065 [rule: fit; pooled midpoint 0.369 (comparison)] (present 0.708, n 94 / absent 0.029, n 306)
- presence:size: threshold 0.218 [rule: fit; pooled midpoint 0.336 (comparison)] (present 0.638, n 81 / absent 0.035, n 319)
- presence:name: threshold 0.134 [rule: fit; pooled midpoint 0.150 (comparison)] (present 0.293, n 21 / absent 0.007, n 379)
- presence:text: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:relation: threshold 0.087 [rule: fit; pooled midpoint 0.341 (comparison)] (present 0.671, n 52 / absent 0.011, n 348)
- presence:landmark: threshold 0.174 [rule: fit; pooled midpoint 0.398 (comparison)] (present 0.756, n 73 / absent 0.040, n 327)
- presence:landmark2: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:region: threshold 0.128 [rule: fit; pooled midpoint 0.089 (comparison)] (present 0.166, n 33 / absent 0.012, n 367)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 399)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 399)
- presence:quantity: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 399)
- presence:axis: threshold 0.162 [rule: fit; pooled midpoint 0.159 (comparison)] (present 0.318, n 6 / absent -0.000, n 394)
- presence:layout: threshold 0.176 [rule: fit; pooled midpoint 0.474 (comparison)] (present 0.948, n 5 / absent 0.000, n 395)
- presence:source: threshold 0.168 [rule: fit; pooled midpoint 0.584 (comparison)] (present 1.117, n 76 / absent 0.052, n 324)
- presence:target: threshold 0.249 [rule: fit; pooled midpoint 0.463 (comparison)] (present 0.880, n 46 / absent 0.045, n 354)
- presence:style: threshold 0.272 [rule: fit; pooled midpoint 0.220 (comparison)] (present 0.424, n 14 / absent 0.015, n 386)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:edge: threshold 0.364 [rule: fit; pooled midpoint 0.388 (comparison)] (present 0.761, n 18 / absent 0.015, n 382)
- presence:pairing: threshold 0.175 [rule: fit; pooled midpoint 0.761 (comparison)] (present 1.511, n 22 / absent 0.010, n 378)
- presence:notcolor: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:depth: threshold 0.104 [rule: fit; pooled midpoint 0.142 (comparison)] (present 0.280, n 5 / absent 0.003, n 395)
- presence:superlative: threshold 0.272 [rule: fit; pooled midpoint 0.339 (comparison)] (present 0.678, n 26 / absent 0.000, n 374)
- presence:comparison: threshold 0.369 [rule: fit; pooled midpoint 0.365 (comparison)] (present 0.728, n 10 / absent 0.001, n 390)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 18)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.056, color 0.056, size 0.143, name 0.001, text 0.048, relation 0.167, landmark 0.001, landmark2 0.001, region 0.111, direction 0.250, amount 0.059, quantity 0.059, axis 0.500, layout 0.250, source 0.001, target 0.001, style 0.333, arrow 0.500, edge 0.333, pairing 0.333, notcolor 0.056, depth 0.500, superlative 0.100, comparison 0.143, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_sentences — catalog candidates (n = 272 of 272)
| axis | accuracy |
|---|---|
| FULL | 0.658 |
| FULL [depth given] | 0.658 |
| FULL [depth and negation given] | 0.658 |
| FULL [pooled midpoint (comparison)] | 0.408 |
| presence object: absent read absent | 0.875 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.995 |
| presence size: absent read absent | 0.995 |
| presence name: absent read absent | 0.996 |
| presence relation: absent read absent | 0.995 |
| presence landmark: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: present read present | 0.842 |
| presence source: share of 'present' readings that abstain | 0.030 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.833 |
| presence target: share of 'present' readings that abstain | 0.071 |
| presence target: share of true 'present' readings that abstain | 0.080 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.143 |
| presence style: share of true 'present' readings that abstain | 0.143 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.091 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence pairing: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.875 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.809 |
| event type (synonym table) | 0.809 |
| role object | 0.827 |
| head object | 0.838 |
| lexical order head object | 0.794 |
| lexical bag head object | 0.746 |
| occupancy: not given | 0.997 |
| role shape | 0.989 |
| head shape | 0.989 |
| lexical order head shape | 0.882 |
| lexical bag head shape | 0.989 |
| role color | 0.971 |
| head color | 0.971 |
| lexical order head color | 0.824 |
| lexical bag head color | 0.978 |
| role size | 0.985 |
| head size | 0.985 |
| lexical order head size | 0.824 |
| lexical bag head size | 0.963 |
| role name | 0.985 |
| head name | 0.985 |
| lexical order head name | 0.938 |
| lexical bag head name | 0.967 |
| role text | 0.996 |
| head text | 0.996 |
| lexical order head text | 0.996 |
| lexical bag head text | 0.996 |
| role relation | 0.985 |
| head relation | 0.985 |
| lexical order head relation | 0.835 |
| lexical bag head relation | 0.985 |
| role landmark | 0.974 |
| head landmark | 0.974 |
| lexical order head landmark | 0.768 |
| lexical bag head landmark | 0.875 |
| role landmark2 | 0.974 |
| head landmark2 | 0.974 |
| lexical order head landmark2 | 0.974 |
| lexical bag head landmark2 | 0.982 |
| role region | 0.963 |
| head region | 0.963 |
| lexical order head region | 0.945 |
| lexical bag head region | 0.978 |
| role direction | 0.996 |
| head direction | 0.996 |
| lexical order head direction | 0.996 |
| lexical bag head direction | 0.996 |
| role amount | 0.996 |
| head amount | 0.996 |
| lexical order head amount | 0.996 |
| lexical bag head amount | 0.996 |
| role quantity | 0.996 |
| head quantity | 0.996 |
| lexical order head quantity | 0.996 |
| lexical bag head quantity | 1.000 |
| role axis | 0.996 |
| head axis | 0.996 |
| lexical order head axis | 0.985 |
| lexical bag head axis | 0.989 |
| role layout | 0.996 |
| head layout | 0.996 |
| lexical order head layout | 0.989 |
| lexical bag head layout | 0.996 |
| role source | 0.956 |
| head source | 0.956 |
| lexical order head source | 0.846 |
| lexical bag head source | 0.915 |
| occupancy: known filler | 0.822 |
| role target | 0.960 |
| head target | 0.960 |
| lexical order head target | 0.882 |
| lexical bag head target | 0.904 |
| occupancy: unknown filler | 0.788 |
| role style | 1.000 |
| head style | 1.000 |
| lexical order head style | 0.974 |
| lexical bag head style | 0.978 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 1.000 |
| lexical bag head arrow | 1.000 |
| role edge | 0.993 |
| head edge | 0.993 |
| lexical order head edge | 0.967 |
| lexical bag head edge | 0.985 |
| role pairing | 0.985 |
| head pairing | 0.985 |
| lexical order head pairing | 0.960 |
| lexical bag head pairing | 0.989 |
| role notcolor | 0.993 |
| head notcolor | 0.993 |
| lexical order head notcolor | 0.993 |
| lexical bag head notcolor | 0.996 |
| role depth | 0.989 |
| head depth | 0.989 |
| lexical order head depth | 0.982 |
| lexical bag head depth | 0.996 |
| role superlative | 0.982 |
| head superlative | 0.982 |
| lexical order head superlative | 0.882 |
| lexical bag head superlative | 0.967 |
| role comparison | 0.996 |
| head comparison | 0.996 |
| lexical order head comparison | 0.956 |
| lexical bag head comparison | 0.996 |
| heads FULL (model) | 0.695 |
| heads FULL (lexical order baseline) | 0.136 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.434 |
| role object [pooled midpoint (comparison)] | 0.614 |
| role shape [pooled midpoint (comparison)] | 0.989 |
| role color [pooled midpoint (comparison)] | 0.960 |
| role size [pooled midpoint (comparison)] | 0.989 |
| role name [pooled midpoint (comparison)] | 0.982 |
| role text [pooled midpoint (comparison)] | 0.996 |
| role relation [pooled midpoint (comparison)] | 0.941 |
| role landmark [pooled midpoint (comparison)] | 0.934 |
| role landmark2 [pooled midpoint (comparison)] | 0.974 |
| role region [pooled midpoint (comparison)] | 0.963 |
| role direction [pooled midpoint (comparison)] | 0.996 |
| role amount [pooled midpoint (comparison)] | 0.996 |
| role quantity [pooled midpoint (comparison)] | 0.996 |
| role axis [pooled midpoint (comparison)] | 0.996 |
| role layout [pooled midpoint (comparison)] | 0.993 |
| role source [pooled midpoint (comparison)] | 0.949 |
| role target [pooled midpoint (comparison)] | 0.938 |
| role style [pooled midpoint (comparison)] | 0.996 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 0.996 |
| role pairing [pooled midpoint (comparison)] | 0.960 |
| role notcolor [pooled midpoint (comparison)] | 0.993 |
| role depth [pooled midpoint (comparison)] | 0.989 |
| role superlative [pooled midpoint (comparison)] | 0.982 |
| role comparison [pooled midpoint (comparison)] | 0.996 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.434 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 0.995 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 0.995 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 0.994 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.757 |
| presence target: present read present [pooled midpoint (comparison)] | 0.655 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence depth: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: present read present | 0.940 |
| presence object: share of 'present' readings that abstain | 0.103 |
| presence object: share of true 'present' readings that abstain | 0.103 |
| presence size: present read present | 0.978 |
| presence size: share of 'present' readings that abstain | 0.022 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present | 0.933 |
| presence name: share of 'present' readings that abstain | 0.133 |
| presence name: share of true 'present' readings that abstain | 0.143 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.047 |
| presence relation: share of true 'present' readings that abstain | 0.048 |
| presence landmark: present read present | 0.949 |
| presence landmark: share of 'present' readings that abstain | 0.089 |
| presence landmark: share of true 'present' readings that abstain | 0.089 |
| presence source: absent read absent | 0.995 |
| presence target: absent read absent | 0.986 |
| presence style: absent read absent | 1.000 |
| presence edge: absent read absent | 0.991 |
| presence object: present read present [pooled midpoint (comparison)] | 0.524 |
| presence size: present read present [pooled midpoint (comparison)] | 0.978 |
| presence name: present read present [pooled midpoint (comparison)] | 0.867 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.690 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.780 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.985 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.996 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 0.996 |
| presence comparison: present read present | 0.917 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present [pooled midpoint (comparison)] | 0.917 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.000 |
| presence color: present read present | 0.932 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.864 |
| presence shape: present read present | 0.967 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.967 |
| presence superlative: present read present | 0.900 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.931 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: share of FALSE 'present' readings that abstain | 0.500 |
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |
| presence size: share of FALSE 'present' readings that abstain | 1.000 |
| presence depth: present read present | 0.500 |
| presence depth: share of 'present' readings that abstain | 0.500 |
| presence depth: share of true 'present' readings that abstain | 0.500 |
| presence depth: present read present [pooled midpoint (comparison)] | 0.500 |
| presence axis: present read present | 0.750 |
| presence axis: share of 'present' readings that abstain | 0.333 |
| presence axis: share of true 'present' readings that abstain | 0.333 |
| presence axis: present read present [pooled midpoint (comparison)] | 0.750 |
| presence object: share of FALSE 'present' readings that abstain | 0.111 |
| presence layout: present read present | 0.667 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence layout: present read present [pooled midpoint (comparison)] | 0.333 |
| presence source: share of FALSE 'present' readings that abstain | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence name: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.262; status {'ok': 201, 'abstain': 37, 'unknown-event': 22, 'no-sense': 12}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.809 | 0.426 / 0.023 | 0.88 | 0.070 | 0.000 / 0.121 |
| role source | 0.738 | 0.123 / 0.000 | 0.79 | 0.048 | 0.000 / 0.214 |
| roles (pooled) | 0.807 | 0.203 / 0.000 | 0.81 | 0.045 | 0.040 / 0.148 |
| role target | 0.750 | 0.152 / 0.000 | 0.72 | 0.000 | 0.031 / 0.250 |
| role style | 1.000 | 0.117 / 0.054 | 0.86 | 0.000 | 0.143 / 0.000 |
| role edge | 1.000 | 0.248 / 0.201 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 0.799 | 0.221 / 0.017 | 0.83 | 0.095 | 0.063 / 0.106 |
| role size | 0.938 | 0.277 / 0.229 | 0.96 | 0.021 | 0.000 / 0.042 |
| role name | 0.824 | 0.166 / 0.007 | 0.76 | 0.059 | 0.118 / 0.118 |
| role relation | 0.933 | 0.206 / 0.089 | 0.91 | 0.022 | 0.044 / 0.044 |
| role landmark | 0.889 | 0.144 / 0.011 | 0.81 | 0.000 | 0.079 / 0.111 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 0.917 | 0.201 / 0.120 | 0.92 | 0.000 | 0.000 / 0.083 |
| role shape | 0.906 | 0.234 / 0.175 | 0.94 | 0.031 | 0.000 / 0.062 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role pairing | 0.636 | 0.218 / 0.000 | 0.73 | 0.091 | 0.000 / 0.273 |
| role color | 0.854 | 0.272 / 0.120 | 0.90 | 0.042 | 0.000 / 0.104 |
| role superlative | 0.844 | 0.314 / 0.000 | 0.84 | 0.000 | 0.000 / 0.156 |
| role region | 0.333 | 0.101 / 0.000 | 0.40 | 0.067 | 0.000 / 0.600 |
| role depth | 0.400 | 0.055 / 0.000 | 0.20 | 0.000 | 0.200 / 0.600 |
| role axis | 0.750 | 0.121 / 0.007 | 0.50 | 0.000 | 0.250 / 0.250 |
| role layout | 0.667 | 0.147 / 0.028 | 0.67 | 0.000 | 0.000 / 0.333 |
| role text | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role notcolor | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

### train (sample) — catalog candidates (n = 300 of 2424)
| axis | accuracy |
|---|---|
| FULL | 0.607 |
| FULL [depth given] | 0.607 |
| FULL [depth and negation given] | 0.607 |
| presence object: present read present | 0.953 |
| presence object: share of 'present' readings that abstain | 0.101 |
| presence object: share of true 'present' readings that abstain | 0.085 |
| presence shape: absent read absent | 0.996 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.400 |
| presence name: share of true 'present' readings that abstain | 0.400 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.027 |
| presence relation: share of true 'present' readings that abstain | 0.028 |
| presence landmark: present read present | 0.939 |
| presence landmark: share of 'present' readings that abstain | 0.043 |
| presence landmark: share of true 'present' readings that abstain | 0.043 |
| presence region: absent read absent | 0.996 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 0.968 |
| presence style: absent read absent | 0.996 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.857 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.770 |
| event type (synonym table) | 0.770 |
| role object | 0.817 |
| head object | 0.847 |
| lexical order head object | 0.767 |
| lexical bag head object | 0.907 |
| occupancy: known filler | 0.791 |
| role shape | 0.990 |
| head shape | 0.990 |
| lexical order head shape | 0.900 |
| lexical bag head shape | 0.997 |
| occupancy: not given | 0.998 |
| role color | 0.940 |
| head color | 0.940 |
| lexical order head color | 0.767 |
| lexical bag head color | 0.970 |
| role size | 0.960 |
| head size | 0.960 |
| lexical order head size | 0.827 |
| lexical bag head size | 0.983 |
| role name | 0.997 |
| head name | 0.997 |
| lexical order head name | 0.963 |
| lexical bag head name | 0.997 |
| role text | 0.987 |
| head text | 0.987 |
| lexical order head text | 0.987 |
| lexical bag head text | 1.000 |
| role relation | 0.987 |
| head relation | 0.987 |
| lexical order head relation | 0.870 |
| lexical bag head relation | 0.987 |
| role landmark | 0.977 |
| head landmark | 0.977 |
| lexical order head landmark | 0.827 |
| lexical bag head landmark | 0.953 |
| role landmark2 | 0.997 |
| head landmark2 | 0.997 |
| lexical order head landmark2 | 0.997 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.973 |
| head region | 0.973 |
| lexical order head region | 0.947 |
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
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.990 |
| lexical bag head axis | 1.000 |
| role layout | 0.997 |
| head layout | 0.997 |
| lexical order head layout | 0.980 |
| lexical bag head layout | 0.997 |
| role source | 0.963 |
| head source | 0.963 |
| lexical order head source | 0.817 |
| lexical bag head source | 0.987 |
| role target | 0.960 |
| head target | 0.960 |
| lexical order head target | 0.880 |
| lexical bag head target | 0.983 |
| role style | 0.987 |
| head style | 0.987 |
| lexical order head style | 0.967 |
| lexical bag head style | 0.990 |
| role arrow | 0.983 |
| head arrow | 0.983 |
| lexical order head arrow | 0.983 |
| lexical bag head arrow | 0.993 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.957 |
| lexical bag head edge | 1.000 |
| role pairing | 0.987 |
| head pairing | 0.987 |
| lexical order head pairing | 0.963 |
| lexical bag head pairing | 0.993 |
| role notcolor | 0.980 |
| head notcolor | 0.980 |
| lexical order head notcolor | 0.980 |
| lexical bag head notcolor | 0.997 |
| role depth | 0.993 |
| head depth | 0.993 |
| lexical order head depth | 0.980 |
| lexical bag head depth | 0.997 |
| role superlative | 0.987 |
| head superlative | 0.987 |
| lexical order head superlative | 0.927 |
| lexical bag head superlative | 0.997 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.980 |
| lexical bag head comparison | 1.000 |
| heads FULL (model) | 0.687 |
| heads FULL (lexical order baseline) | 0.133 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.773 |
| presence color: present read present | 0.964 |
| presence color: share of 'present' readings that abstain | 0.038 |
| presence color: share of true 'present' readings that abstain | 0.038 |
| presence size: present read present | 0.932 |
| presence size: share of 'present' readings that abstain | 0.024 |
| presence size: share of true 'present' readings that abstain | 0.024 |
| presence name: absent read absent | 1.000 |
| presence relation: absent read absent | 0.995 |
| presence landmark: absent read absent | 0.995 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.034 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 0.941 |
| presence source: present read present | 0.882 |
| presence source: share of 'present' readings that abstain | 0.044 |
| presence source: share of true 'present' readings that abstain | 0.044 |
| presence target: present read present | 0.889 |
| presence target: share of 'present' readings that abstain | 0.051 |
| presence target: share of true 'present' readings that abstain | 0.031 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence style: present read present | 0.700 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present | 0.875 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present | 0.900 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.143 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.100 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.600 |
| presence depth: present read present | 0.800 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |
| presence shape: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.300; status {'ok': 224, 'abstain': 33, 'unknown-event': 33, 'no-sense': 10}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.770 | 0.418 / 0.014 | 0.86 | 0.087 | 0.000 / 0.143 |
| role object | 0.755 | 0.262 / 0.023 | 0.86 | 0.167 | 0.064 / 0.078 |
| roles (pooled) | 0.770 | 0.208 / 0.000 | 0.80 | 0.062 | 0.035 / 0.168 |
| role name | 0.909 | 0.138 / 0.017 | 0.55 | 0.000 | 0.364 / 0.091 |
| role relation | 0.923 | 0.224 / 0.102 | 0.92 | 0.026 | 0.026 / 0.051 |
| role landmark | 0.885 | 0.165 / 0.003 | 0.87 | 0.019 | 0.038 / 0.096 |
| role color | 0.743 | 0.200 / 0.000 | 0.73 | 0.000 | 0.014 / 0.257 |
| role size | 0.769 | 0.214 / 0.000 | 0.79 | 0.019 | 0.000 / 0.212 |
| role shape | 0.933 | 0.218 / 0.144 | 0.93 | 0.000 | 0.000 / 0.067 |
| role comparison | 1.000 | 0.248 / 0.207 | 1.00 | 0.000 | 0.000 / 0.000 |
| role source | 0.800 | 0.127 / 0.000 | 0.82 | 0.055 | 0.036 / 0.145 |
| role target | 0.861 | 0.189 / 0.016 | 0.86 | 0.000 | 0.000 / 0.139 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role edge | 1.000 | 0.273 / 0.208 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role notcolor | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role style | 0.700 | 0.137 / 0.000 | 0.70 | 0.000 | 0.000 / 0.300 |
| role pairing | 0.636 | 0.217 / 0.000 | 0.73 | 0.091 | 0.000 / 0.273 |
| role superlative | 0.818 | 0.355 / 0.000 | 0.82 | 0.000 | 0.000 / 0.182 |
| role layout | 0.833 | 0.240 / 0.059 | 0.83 | 0.000 | 0.000 / 0.167 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role region | 0.562 | 0.087 / 0.000 | 0.56 | 0.000 | 0.000 / 0.438 |
| role axis | 1.000 | 0.164 / 0.133 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role depth | 0.667 | 0.165 / 0.000 | 0.67 | 0.000 | 0.000 / 0.333 |

## Gates (seed 0; OPEN > 0.5)
,=1.00 and=1.00 at=1.00 by=1.00 from=1.00 in=1.00 labeled=1.00 named=1.00 of=1.00 on=1.00 to=1.00 with=1.00 SUPER=0.95 REGION=0.94 COLOR=0.89 REL=0.87 rules=0.78 LAYOUT=0.76 NOTCOLOR=0.74 TEXT=0.72 once=0.71 times=0.70 NAME=0.64 connected=0.61 directly=0.59 px=0.58 them=0.56 PAIR=0.55 AXIS=0.54 it=0.52 twice=0.49 that=0.46 there=0.45 DEPTH=0.43 SHAPE=0.43 have=0.41 be=0.39 VERB=0.39 DIR=0.37 canvas=0.37 evenly=0.32 linked=0.31 its=0.25 RECENT=0.24 for=0.23 then=0.23 each=0.20 EDGE=0.20 now=0.17 unknown=0.14 here=0.14 we=0.14 cycle=0.12 do=0.12 ARROW=0.11 what=0.11 neighbors=0.09 map=0.09 order=0.08 both=0.08 check=0.08 me=0.08 has=0.07 least=0.07 an=0.06 axis=0.06 SIZE=0.06 anything=0.05 any=0.05 the=0.05 who=0.05 i=0.05 tell=0.04 new=0.04 everything=0.04 all=0.04 NUM=0.03 degree=0.03 does=0.03 most=0.03 can=0.03 are=0.03 goes=0.02 should=0.02 every=0.02 one=0.02 than=0.02 STYLE=0.02 reached=0.02 reachable=0.01 a=0.00

## What is weak, what to add
- heldout_sentences: FULL 0.658
- heldout_sentences: presence object: absent read absent 0.875
- heldout_sentences: presence source: present read present 0.842
- heldout_sentences: presence source: share of 'present' readings that abstain 0.030
- heldout_sentences: presence source: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence target: present read present 0.833
- heldout_sentences: presence target: share of 'present' readings that abstain 0.071
- heldout_sentences: presence target: share of true 'present' readings that abstain 0.080
- heldout_sentences: presence style: share of 'present' readings that abstain 0.143
- heldout_sentences: presence style: share of true 'present' readings that abstain 0.143
- heldout_sentences: presence edge: share of 'present' readings that abstain 0.091
- heldout_sentences: presence edge: share of true 'present' readings that abstain 0.000
- heldout_sentences: structure (depth, negation) 0.875
- heldout_sentences: predicate (surface lemma) 0.809
- heldout_sentences: event type (synonym table) 0.809
- heldout_sentences: role object 0.827
- heldout_sentences: head object 0.838
- heldout_sentences: occupancy: known filler 0.822
- heldout_sentences: occupancy: unknown filler 0.788
- heldout_sentences: heads FULL (model) 0.695
- heldout_sentences: heads FULL (lexical order baseline) 0.136
- heldout_sentences: heads FULL (lexical bag baseline, trained on the same training rows) 0.434
- heldout_sentences: FULL [depth given] 0.658
- heldout_sentences: FULL [depth and negation given] 0.658
- heldout_sentences: FULL [pooled midpoint (comparison)] 0.408
- heldout_sentences: role object [pooled midpoint (comparison)] 0.614
- heldout_sentences: heads FULL (model) [pooled midpoint (comparison)] 0.434
- heldout_sentences: presence source: present read present [pooled midpoint (comparison)] 0.757
- heldout_sentences: presence target: present read present [pooled midpoint (comparison)] 0.655
- heldout_sentences: presence object: share of 'present' readings that abstain 0.103
- heldout_sentences: presence object: share of true 'present' readings that abstain 0.103
- heldout_sentences: presence size: share of 'present' readings that abstain 0.022
- heldout_sentences: presence size: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence name: share of 'present' readings that abstain 0.133
- heldout_sentences: presence name: share of true 'present' readings that abstain 0.143
- heldout_sentences: presence relation: share of 'present' readings that abstain 0.047
- heldout_sentences: presence relation: share of true 'present' readings that abstain 0.048
- heldout_sentences: presence landmark: share of 'present' readings that abstain 0.089
- heldout_sentences: presence landmark: share of true 'present' readings that abstain 0.089
- heldout_sentences: presence object: present read present [pooled midpoint (comparison)] 0.524
- heldout_sentences: presence name: present read present [pooled midpoint (comparison)] 0.867
- heldout_sentences: presence relation: present read present [pooled midpoint (comparison)] 0.690
- heldout_sentences: presence landmark: present read present [pooled midpoint (comparison)] 0.780
- heldout_sentences: presence comparison: share of 'present' readings that abstain 0.000
- heldout_sentences: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: share of 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: present read present [pooled midpoint (comparison)] 0.000
- heldout_sentences: presence color: share of 'present' readings that abstain 0.000
- heldout_sentences: presence color: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence color: present read present [pooled midpoint (comparison)] 0.864
- heldout_sentences: presence shape: share of 'present' readings that abstain 0.000
- heldout_sentences: presence shape: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: share of 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence region: share of 'present' readings that abstain 0.000
- heldout_sentences: presence region: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence edge: share of FALSE 'present' readings that abstain 0.500
- heldout_sentences: presence relation: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence target: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence color: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence depth: present read present 0.500
- heldout_sentences: presence depth: share of 'present' readings that abstain 0.500
- heldout_sentences: presence depth: share of true 'present' readings that abstain 0.500
- heldout_sentences: presence depth: present read present [pooled midpoint (comparison)] 0.500
- heldout_sentences: presence axis: present read present 0.750
- heldout_sentences: presence axis: share of 'present' readings that abstain 0.333
- heldout_sentences: presence axis: share of true 'present' readings that abstain 0.333
- heldout_sentences: presence axis: present read present [pooled midpoint (comparison)] 0.750
- heldout_sentences: presence object: share of FALSE 'present' readings that abstain 0.111
- heldout_sentences: presence layout: present read present 0.667
- heldout_sentences: presence layout: share of 'present' readings that abstain 0.000
- heldout_sentences: presence layout: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence layout: present read present [pooled midpoint (comparison)] 0.333
- heldout_sentences: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_sentences: presence name: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.607
- train (sample): presence object: share of 'present' readings that abstain 0.101
- train (sample): presence object: share of true 'present' readings that abstain 0.085
- train (sample): presence name: share of 'present' readings that abstain 0.400
- train (sample): presence name: share of true 'present' readings that abstain 0.400
- train (sample): presence relation: share of 'present' readings that abstain 0.027
- train (sample): presence relation: share of true 'present' readings that abstain 0.028
- train (sample): presence landmark: share of 'present' readings that abstain 0.043
- train (sample): presence landmark: share of true 'present' readings that abstain 0.043
- train (sample): structure (depth, negation) 0.857
- train (sample): predicate (surface lemma) 0.770
- train (sample): event type (synonym table) 0.770
- train (sample): role object 0.817
- train (sample): head object 0.847
- train (sample): occupancy: known filler 0.791
- train (sample): heads FULL (model) 0.687
- train (sample): heads FULL (lexical order baseline) 0.133
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.773
- train (sample): FULL [depth given] 0.607
- train (sample): FULL [depth and negation given] 0.607
- train (sample): presence color: share of 'present' readings that abstain 0.038
- train (sample): presence color: share of true 'present' readings that abstain 0.038
- train (sample): presence size: share of 'present' readings that abstain 0.024
- train (sample): presence size: share of true 'present' readings that abstain 0.024
- train (sample): presence shape: share of 'present' readings that abstain 0.034
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence source: present read present 0.882
- train (sample): presence source: share of 'present' readings that abstain 0.044
- train (sample): presence source: share of true 'present' readings that abstain 0.044
- train (sample): presence target: present read present 0.889
- train (sample): presence target: share of 'present' readings that abstain 0.051
- train (sample): presence target: share of true 'present' readings that abstain 0.031
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence style: present read present 0.700
- train (sample): presence style: share of 'present' readings that abstain 0.000
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence pairing: present read present 0.875
- train (sample): presence pairing: share of 'present' readings that abstain 0.000
- train (sample): presence pairing: share of true 'present' readings that abstain 0.000
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.143
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.100
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.600
- train (sample): presence depth: present read present 0.800
- train (sample): presence depth: share of 'present' readings that abstain 0.000
- train (sample): presence depth: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_sentences: `NAME REGION` FULL 0.000 (n 7)
- heldout_sentences: `make NAME COLOR` FULL 0.000 (n 2)
- heldout_sentences: `delete RECENT SHAPE` FULL 0.000 (n 2)
- heldout_sentences: `PAIR all 4` FULL 0.000 (n 2)
- heldout_sentences: `bring it DEPTH` FULL 0.000 (n 2)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_sentences | object | product: fitted | 0.940 | 0.875 | 0.907 | 0.103 (0.111 / 0.103) |
| heldout_sentences | object | comparison: pooled midpoint | 0.524 | 0.986 | 0.755 |  |
| heldout_sentences | shape | product: fitted | 0.967 | 1.000 | 0.983 | 0.000 (— / 0.000) |
| heldout_sentences | shape | comparison: pooled midpoint | 0.967 | 1.000 | 0.983 |  |
| heldout_sentences | color | product: fitted | 0.932 | 0.995 | 0.963 | 0.000 (0.000 / 0.000) |
| heldout_sentences | color | comparison: pooled midpoint | 0.864 | 0.995 | 0.929 |  |
| heldout_sentences | size | product: fitted | 0.978 | 0.995 | 0.987 | 0.022 (1.000 / 0.000) |
| heldout_sentences | size | comparison: pooled midpoint | 0.978 | 1.000 | 0.989 |  |
| heldout_sentences | name | product: fitted | 0.933 | 0.996 | 0.964 | 0.133 (0.000 / 0.143) |
| heldout_sentences | name | comparison: pooled midpoint | 0.867 | 0.995 | 0.931 |  |
| heldout_sentences | relation | product: fitted | 1.000 | 0.995 | 0.997 | 0.047 (0.000 / 0.048) |
| heldout_sentences | relation | comparison: pooled midpoint | 0.690 | 1.000 | 0.845 |  |
| heldout_sentences | landmark | product: fitted | 0.949 | 1.000 | 0.975 | 0.089 (— / 0.089) |
| heldout_sentences | landmark | comparison: pooled midpoint | 0.780 | 0.994 | 0.887 |  |
| heldout_sentences | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | region | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | axis | product: fitted | 0.750 | 1.000 | 0.875 | 0.333 (— / 0.333) |
| heldout_sentences | axis | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_sentences | layout | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_sentences | layout | comparison: pooled midpoint | 0.333 | 1.000 | 0.667 |  |
| heldout_sentences | source | product: fitted | 0.842 | 0.995 | 0.919 | 0.030 (1.000 / 0.000) |
| heldout_sentences | source | comparison: pooled midpoint | 0.757 | 1.000 | 0.878 |  |
| heldout_sentences | target | product: fitted | 0.833 | 0.986 | 0.909 | 0.071 (0.000 / 0.080) |
| heldout_sentences | target | comparison: pooled midpoint | 0.655 | 0.985 | 0.820 |  |
| heldout_sentences | style | product: fitted | 1.000 | 1.000 | 1.000 | 0.143 (— / 0.143) |
| heldout_sentences | style | comparison: pooled midpoint | 1.000 | 0.996 | 0.998 |  |
| heldout_sentences | edge | product: fitted | 1.000 | 0.991 | 0.996 | 0.091 (0.500 / 0.000) |
| heldout_sentences | edge | comparison: pooled midpoint | 1.000 | 0.996 | 0.998 |  |
| heldout_sentences | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | pairing | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | depth | product: fitted | 0.500 | 1.000 | 0.750 | 0.500 (— / 0.500) |
| heldout_sentences | depth | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_sentences | superlative | product: fitted | 0.900 | 1.000 | 0.950 | 0.000 (— / 0.000) |
| heldout_sentences | superlative | comparison: pooled midpoint | 0.931 | 1.000 | 0.966 |  |
| heldout_sentences | comparison | product: fitted | 0.917 | 1.000 | 0.958 | 0.000 (— / 0.000) |
| heldout_sentences | comparison | comparison: pooled midpoint | 0.917 | 1.000 | 0.958 |  |
| train (sample) | object | product: fitted | 0.953 | 0.941 | 0.947 | 0.101 (0.600 / 0.085) |
| train (sample) | shape | product: fitted | 1.000 | 0.996 | 0.998 | 0.034 (1.000 / 0.000) |
| train (sample) | color | product: fitted | 0.964 | 1.000 | 0.982 | 0.038 (— / 0.038) |
| train (sample) | size | product: fitted | 0.932 | 1.000 | 0.966 | 0.024 (— / 0.024) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.400 (— / 0.400) |
| train (sample) | relation | product: fitted | 1.000 | 0.995 | 0.998 | 0.027 (0.000 / 0.028) |
| train (sample) | landmark | product: fitted | 0.939 | 0.995 | 0.967 | 0.043 (0.000 / 0.043) |
| train (sample) | region | product: fitted | 1.000 | 0.996 | 0.998 | 0.100 (1.000 / 0.000) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.882 | 1.000 | 0.941 | 0.044 (— / 0.044) |
| train (sample) | target | product: fitted | 0.889 | 0.968 | 0.929 | 0.051 (0.143 / 0.031) |
| train (sample) | style | product: fitted | 0.700 | 0.996 | 0.848 | 0.000 (0.000 / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 0.875 | 1.000 | 0.938 | 0.000 (— / 0.000) |
| train (sample) | depth | product: fitted | 0.800 | 1.000 | 0.900 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 0.900 | 1.000 | 0.950 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
