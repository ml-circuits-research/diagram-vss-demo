# REPORT — world `real`, legend sha256:bd4b45541bf5… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1318 annotated sentences from 1 files; provenance: {'llm': 1318}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/learned_p25_D1024_e2_s0/splits.json before training; source: split_hints.json)
- heldout_sentences: 111 sentences
- train: 1207 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 10% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
7586 tokens in the examples; 334 with no kind in the lexicon (share 0.044), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit d96cc32. Memory curve: runs/learned_p25_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.253 [rule: fit; pooled midpoint 1.088 (comparison)] (present 1.992, n 263 / absent 0.184, n 137)
- attr_presence:object: threshold 0.294 [rule: fit; pooled midpoint 0.376 (comparison)] (present 0.617, n 26 / absent 0.135, n 234)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 258)
- presence:shape: threshold 0.401 [rule: fit; pooled midpoint 0.361 (comparison)] (present 0.713, n 39 / absent 0.009, n 361)
- presence:color: threshold 0.145 [rule: fit; pooled midpoint 0.381 (comparison)] (present 0.727, n 79 / absent 0.034, n 321)
- presence:size: threshold 0.202 [rule: fit; pooled midpoint 0.469 (comparison)] (present 0.907, n 69 / absent 0.030, n 331)
- presence:name: threshold 0.079 [rule: fit; pooled midpoint 0.250 (comparison)] (present 0.496, n 17 / absent 0.005, n 383)
- presence:text: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:relation: threshold 0.163 [rule: fit; pooled midpoint 0.384 (comparison)] (present 0.746, n 47 / absent 0.023, n 353)
- presence:landmark: threshold 0.179 [rule: fit; pooled midpoint 0.444 (comparison)] (present 0.826, n 68 / absent 0.063, n 332)
- presence:landmark2: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:region: threshold 0.217 [rule: fit; pooled midpoint 0.278 (comparison)] (present 0.537, n 23 / absent 0.019, n 377)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:quantity: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:axis: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:layout: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 399)
- presence:source: threshold 0.200 [rule: fit; pooled midpoint 0.466 (comparison)] (present 0.910, n 75 / absent 0.023, n 325)
- presence:target: threshold 0.297 [rule: fit; pooled midpoint 0.468 (comparison)] (present 0.897, n 51 / absent 0.039, n 349)
- presence:style: threshold 0.181 [rule: fit; pooled midpoint 0.187 (comparison)] (present 0.362, n 14 / absent 0.013, n 386)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:edge: threshold 0.251 [rule: fit; pooled midpoint 0.266 (comparison)] (present 0.524, n 8 / absent 0.008, n 392)
- presence:pairing: threshold 0.145 [rule: fit; pooled midpoint 0.337 (comparison)] (present 0.665, n 18 / absent 0.009, n 382)
- presence:notcolor: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 399)
- presence:depth: threshold 0.195 [rule: fit; pooled midpoint 0.294 (comparison)] (present 0.588, n 7 / absent 0.000, n 393)
- presence:superlative: threshold 0.381 [rule: fit; pooled midpoint 0.383 (comparison)] (present 0.762, n 32 / absent 0.004, n 368)
- presence:comparison: threshold 0.345 [rule: fit; pooled midpoint 0.348 (comparison)] (present 0.696, n 9 / absent 0.000, n 391)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 8)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.056, color 0.056, size 0.143, name 0.001, text 0.125, relation 0.167, landmark 0.001, landmark2 0.001, region 0.111, direction 0.250, amount 0.091, quantity 0.091, axis 0.500, layout 0.250, source 0.001, target 0.001, style 0.333, arrow 0.500, edge 0.333, pairing 0.333, notcolor 0.056, depth 0.500, superlative 0.100, comparison 0.143, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_sentences — catalog candidates (n = 111 of 111)
| axis | accuracy |
|---|---|
| FULL | 0.631 |
| FULL [depth given] | 0.631 |
| FULL [depth and negation given] | 0.631 |
| FULL [pooled midpoint (comparison)] | 0.315 |
| structure (depth, negation) | 0.901 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.829 |
| event type (synonym table) | 0.829 |
| role object | 0.811 |
| head object | 0.865 |
| lexical order head object | 0.748 |
| lexical bag head object | 0.766 |
| occupancy: known filler | 0.774 |
| role shape | 0.991 |
| head shape | 0.991 |
| lexical order head shape | 0.937 |
| lexical bag head shape | 0.991 |
| occupancy: not given | 0.996 |
| role color | 0.964 |
| head color | 0.964 |
| lexical order head color | 0.838 |
| lexical bag head color | 0.982 |
| role size | 0.991 |
| head size | 0.991 |
| lexical order head size | 0.865 |
| lexical bag head size | 0.991 |
| role name | 0.973 |
| head name | 0.973 |
| lexical order head name | 0.955 |
| lexical bag head name | 0.982 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 1.000 |
| lexical bag head text | 1.000 |
| role relation | 0.964 |
| head relation | 0.964 |
| lexical order head relation | 0.847 |
| lexical bag head relation | 0.928 |
| role landmark | 0.928 |
| head landmark | 0.928 |
| lexical order head landmark | 0.802 |
| lexical bag head landmark | 0.838 |
| role landmark2 | 0.982 |
| head landmark2 | 0.982 |
| lexical order head landmark2 | 0.982 |
| lexical bag head landmark2 | 0.982 |
| role region | 0.991 |
| head region | 0.991 |
| lexical order head region | 0.937 |
| lexical bag head region | 0.955 |
| role direction | 1.000 |
| head direction | 1.000 |
| lexical order head direction | 1.000 |
| lexical bag head direction | 1.000 |
| role amount | 1.000 |
| head amount | 1.000 |
| lexical order head amount | 1.000 |
| lexical bag head amount | 1.000 |
| role quantity | 0.991 |
| head quantity | 0.991 |
| lexical order head quantity | 0.991 |
| lexical bag head quantity | 1.000 |
| role axis | 0.973 |
| head axis | 0.973 |
| lexical order head axis | 0.973 |
| lexical bag head axis | 0.973 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 1.000 |
| lexical bag head layout | 1.000 |
| role source | 0.955 |
| head source | 0.955 |
| lexical order head source | 0.793 |
| lexical bag head source | 0.874 |
| role target | 0.946 |
| head target | 0.946 |
| lexical order head target | 0.883 |
| lexical bag head target | 0.946 |
| role style | 0.982 |
| head style | 0.982 |
| lexical order head style | 0.973 |
| lexical bag head style | 0.964 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 1.000 |
| lexical bag head arrow | 1.000 |
| role edge | 0.991 |
| head edge | 0.991 |
| lexical order head edge | 1.000 |
| lexical bag head edge | 0.991 |
| role pairing | 1.000 |
| head pairing | 1.000 |
| lexical order head pairing | 0.937 |
| lexical bag head pairing | 0.991 |
| role notcolor | 1.000 |
| head notcolor | 1.000 |
| lexical order head notcolor | 1.000 |
| lexical bag head notcolor | 1.000 |
| role depth | 0.991 |
| head depth | 0.991 |
| lexical order head depth | 0.973 |
| lexical bag head depth | 0.991 |
| role superlative | 0.973 |
| head superlative | 0.973 |
| lexical order head superlative | 0.856 |
| lexical bag head superlative | 0.946 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.991 |
| lexical bag head comparison | 1.000 |
| heads FULL (model) | 0.721 |
| heads FULL (lexical order baseline) | 0.171 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.432 |
| role object [pooled midpoint (comparison)] | 0.477 |
| role shape [pooled midpoint (comparison)] | 0.991 |
| role color [pooled midpoint (comparison)] | 0.919 |
| role size [pooled midpoint (comparison)] | 0.964 |
| role name [pooled midpoint (comparison)] | 0.991 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.946 |
| role landmark [pooled midpoint (comparison)] | 0.946 |
| role landmark2 [pooled midpoint (comparison)] | 0.982 |
| role region [pooled midpoint (comparison)] | 0.991 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 0.991 |
| role axis [pooled midpoint (comparison)] | 0.973 |
| role layout [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.937 |
| role target [pooled midpoint (comparison)] | 0.937 |
| role style [pooled midpoint (comparison)] | 0.982 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 1.000 |
| role notcolor [pooled midpoint (comparison)] | 1.000 |
| role depth [pooled midpoint (comparison)] | 0.991 |
| role superlative [pooled midpoint (comparison)] | 0.973 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.360 |
| presence object: present read present | 0.902 |
| presence object: share of 'present' readings that abstain | 0.070 |
| presence object: share of true 'present' readings that abstain | 0.073 |
| presence shape: absent read absent | 1.000 |
| presence color: present read present | 0.875 |
| presence color: share of 'present' readings that abstain | 0.071 |
| presence color: share of true 'present' readings that abstain | 0.071 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 0.979 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.987 |
| presence region: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 0.978 |
| presence style: absent read absent | 0.990 |
| presence edge: absent read absent | 0.990 |
| presence pairing: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence object: present read present [pooled midpoint (comparison)] | 0.213 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.562 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.978 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.990 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence depth: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent | 1.000 |
| occupancy: unknown filler | 0.826 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 0.949 |
| presence source: present read present | 0.905 |
| presence source: share of 'present' readings that abstain | 0.105 |
| presence source: share of true 'present' readings that abstain | 0.105 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.974 |
| presence source: present read present [pooled midpoint (comparison)] | 0.762 |
| presence pairing: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present | 0.812 |
| presence relation: share of 'present' readings that abstain | 0.154 |
| presence relation: share of true 'present' readings that abstain | 0.154 |
| presence landmark: present read present | 0.714 |
| presence landmark: share of 'present' readings that abstain | 0.062 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.688 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.762 |
| presence target: present read present | 0.818 |
| presence target: present read present [pooled midpoint (comparison)] | 0.727 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.786 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 1.000 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.333 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present [pooled midpoint (comparison)] | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present [pooled midpoint (comparison)] | 1.000 |
| presence superlative: present read present | 0.812 |
| presence superlative: share of 'present' readings that abstain | 0.077 |
| presence superlative: share of true 'present' readings that abstain | 0.077 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.812 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence style: share of 'present' readings that abstain | 0.333 |
| presence style: share of FALSE 'present' readings that abstain | 1.000 |
| presence edge: share of 'present' readings that abstain | 1.000 |
| presence edge: share of FALSE 'present' readings that abstain | 1.000 |
| presence style: present read present | 0.667 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 0.667 |
| presence name: share of FALSE 'present' readings that abstain | 1.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 1.000 |
| presence depth: present read present | 1.000 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence depth: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |

residual mean 0.302; status {'unknown-event': 8, 'abstain': 17, 'ok': 83, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.829 | 0.359 / 0.047 | 0.89 | 0.099 | 0.036 / 0.072 |
| role object | 0.721 | 0.179 / 0.000 | 0.81 | 0.147 | 0.059 / 0.132 |
| roles (pooled) | 0.749 | 0.162 / 0.000 | 0.79 | 0.078 | 0.039 / 0.173 |
| role color | 0.778 | 0.189 / 0.033 | 0.83 | 0.111 | 0.056 / 0.111 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role source | 0.783 | 0.102 / 0.008 | 0.78 | 0.043 | 0.043 / 0.174 |
| role pairing | 1.000 | 0.268 / 0.178 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.765 | 0.143 / 0.000 | 0.65 | 0.000 | 0.118 / 0.235 |
| role landmark | 0.682 | 0.086 / 0.000 | 0.73 | 0.045 | 0.000 / 0.273 |
| role target | 0.692 | 0.138 / 0.008 | 0.77 | 0.077 | 0.000 / 0.231 |
| role size | 0.933 | 0.230 / 0.176 | 1.00 | 0.067 | 0.000 / 0.000 |
| role shape | 0.857 | 0.184 / 0.138 | 1.00 | 0.143 | 0.000 / 0.000 |
| role name | 0.800 | 0.120 / 0.088 | 1.00 | 0.200 | 0.000 / 0.000 |
| role comparison | 1.000 | 0.252 / 0.252 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 0.857 | 0.245 / 0.072 | 0.86 | 0.000 | 0.000 / 0.143 |
| role superlative | 0.812 | 0.224 / 0.000 | 0.75 | 0.000 | 0.062 / 0.188 |
| role style | 0.667 | 0.085 / 0.024 | 0.67 | 0.000 | 0.000 / 0.333 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role depth | 0.667 | 0.139 / 0.036 | 0.67 | 0.000 | 0.000 / 0.333 |

### train (sample) — catalog candidates (n = 300 of 1207)
| axis | accuracy |
|---|---|
| FULL | 0.613 |
| FULL [depth given] | 0.613 |
| FULL [depth and negation given] | 0.613 |
| presence object: present read present | 0.895 |
| presence object: share of 'present' readings that abstain | 0.060 |
| presence object: share of true 'present' readings that abstain | 0.048 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 0.974 |
| presence size: share of 'present' readings that abstain | 0.051 |
| presence size: share of true 'present' readings that abstain | 0.026 |
| presence name: present read present | 0.933 |
| presence name: share of 'present' readings that abstain | 0.118 |
| presence name: share of true 'present' readings that abstain | 0.071 |
| presence relation: present read present | 0.921 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.944 |
| presence landmark: share of 'present' readings that abstain | 0.093 |
| presence landmark: share of true 'present' readings that abstain | 0.059 |
| presence region: absent read absent | 0.996 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 0.973 |
| presence style: absent read absent | 0.992 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.840 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.760 |
| event type (synonym table) | 0.760 |
| role object | 0.787 |
| head object | 0.807 |
| lexical order head object | 0.767 |
| lexical bag head object | 0.923 |
| occupancy: known filler | 0.748 |
| role shape | 0.990 |
| head shape | 0.990 |
| lexical order head shape | 0.920 |
| lexical bag head shape | 1.000 |
| occupancy: not given | 0.997 |
| role color | 0.970 |
| head color | 0.970 |
| lexical order head color | 0.833 |
| lexical bag head color | 0.977 |
| role size | 0.990 |
| head size | 0.990 |
| lexical order head size | 0.867 |
| lexical bag head size | 0.983 |
| role name | 0.983 |
| head name | 0.983 |
| lexical order head name | 0.947 |
| lexical bag head name | 1.000 |
| role text | 0.997 |
| head text | 0.997 |
| lexical order head text | 0.997 |
| lexical bag head text | 1.000 |
| role relation | 0.960 |
| head relation | 0.960 |
| lexical order head relation | 0.843 |
| lexical bag head relation | 0.960 |
| role landmark | 0.950 |
| head landmark | 0.950 |
| lexical order head landmark | 0.790 |
| lexical bag head landmark | 0.937 |
| role landmark2 | 0.987 |
| head landmark2 | 0.987 |
| lexical order head landmark2 | 0.987 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.973 |
| head region | 0.973 |
| lexical order head region | 0.943 |
| lexical bag head region | 0.967 |
| role direction | 0.993 |
| head direction | 0.993 |
| lexical order head direction | 0.993 |
| lexical bag head direction | 1.000 |
| role amount | 0.993 |
| head amount | 0.993 |
| lexical order head amount | 0.993 |
| lexical bag head amount | 1.000 |
| role quantity | 0.997 |
| head quantity | 0.997 |
| lexical order head quantity | 0.997 |
| lexical bag head quantity | 1.000 |
| role axis | 0.993 |
| head axis | 0.993 |
| lexical order head axis | 0.993 |
| lexical bag head axis | 0.997 |
| role layout | 0.997 |
| head layout | 0.997 |
| lexical order head layout | 0.997 |
| lexical bag head layout | 1.000 |
| role source | 0.943 |
| head source | 0.943 |
| lexical order head source | 0.797 |
| lexical bag head source | 0.983 |
| role target | 0.930 |
| head target | 0.930 |
| lexical order head target | 0.867 |
| lexical bag head target | 0.973 |
| role style | 0.980 |
| head style | 0.980 |
| lexical order head style | 0.977 |
| lexical bag head style | 0.997 |
| role arrow | 0.990 |
| head arrow | 0.990 |
| lexical order head arrow | 0.990 |
| lexical bag head arrow | 0.997 |
| role edge | 0.990 |
| head edge | 0.990 |
| lexical order head edge | 0.980 |
| lexical bag head edge | 0.997 |
| role pairing | 0.993 |
| head pairing | 0.993 |
| lexical order head pairing | 0.957 |
| lexical bag head pairing | 0.997 |
| role notcolor | 0.993 |
| head notcolor | 0.993 |
| lexical order head notcolor | 0.993 |
| lexical bag head notcolor | 0.997 |
| role depth | 0.997 |
| head depth | 0.997 |
| lexical order head depth | 0.977 |
| lexical bag head depth | 1.000 |
| role superlative | 0.993 |
| head superlative | 0.993 |
| lexical order head superlative | 0.927 |
| lexical bag head superlative | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.977 |
| lexical bag head comparison | 1.000 |
| heads FULL (model) | 0.663 |
| heads FULL (lexical order baseline) | 0.180 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.757 |
| presence object: absent read absent | 0.933 |
| presence size: absent read absent | 0.995 |
| presence name: absent read absent | 0.987 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.985 |
| presence source: present read present | 0.846 |
| presence source: share of 'present' readings that abstain | 0.045 |
| presence source: share of true 'present' readings that abstain | 0.045 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.167 |
| presence pairing: share of true 'present' readings that abstain | 0.167 |
| presence superlative: present read present | 0.909 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence size: share of FALSE 'present' readings that abstain | 1.000 |
| presence target: present read present | 0.758 |
| presence target: share of 'present' readings that abstain | 0.065 |
| presence target: share of true 'present' readings that abstain | 0.080 |
| presence style: share of 'present' readings that abstain | 0.200 |
| presence style: share of FALSE 'present' readings that abstain | 0.500 |
| presence color: present read present | 0.976 |
| presence color: share of 'present' readings that abstain | 0.098 |
| presence color: share of true 'present' readings that abstain | 0.098 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence shape: present read present | 0.913 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.667 |
| presence region: present read present | 0.909 |
| presence region: share of 'present' readings that abstain | 0.182 |
| presence region: share of true 'present' readings that abstain | 0.200 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence name: share of FALSE 'present' readings that abstain | 0.333 |
| presence object: share of FALSE 'present' readings that abstain | 0.333 |
| presence style: present read present | 0.500 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 0.600 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence depth: present read present | 1.000 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.340; status {'ok': 218, 'unknown-event': 42, 'abstain': 34, 'no-sense': 6}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.760 | 0.373 / 0.028 | 0.86 | 0.110 | 0.007 / 0.130 |
| role object | 0.706 | 0.226 / 0.000 | 0.83 | 0.162 | 0.036 / 0.132 |
| roles (pooled) | 0.737 | 0.182 / 0.000 | 0.79 | 0.087 | 0.036 / 0.176 |
| role size | 0.950 | 0.235 / 0.146 | 0.95 | 0.025 | 0.025 / 0.025 |
| role name | 0.875 | 0.119 / 0.056 | 0.88 | 0.062 | 0.062 / 0.062 |
| role relation | 0.745 | 0.166 / 0.000 | 0.77 | 0.021 | 0.000 / 0.234 |
| role landmark | 0.810 | 0.107 / 0.000 | 0.78 | 0.016 | 0.048 / 0.175 |
| role source | 0.721 | 0.130 / 0.000 | 0.79 | 0.098 | 0.033 / 0.180 |
| role pairing | 0.846 | 0.233 / 0.069 | 0.85 | 0.077 | 0.077 / 0.077 |
| role superlative | 0.909 | 0.300 / 0.075 | 0.91 | 0.000 | 0.000 / 0.091 |
| role target | 0.625 | 0.162 / 0.000 | 0.72 | 0.150 | 0.050 / 0.225 |
| role color | 0.820 | 0.194 / 0.000 | 0.80 | 0.060 | 0.080 / 0.120 |
| role shape | 0.875 | 0.147 / 0.021 | 0.88 | 0.000 | 0.000 / 0.125 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role region | 0.588 | 0.184 / 0.000 | 0.53 | 0.059 | 0.118 / 0.353 |
| role notcolor | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 1.000 | 0.215 / 0.174 | 1.00 | 0.000 | 0.000 / 0.000 |
| role style | 0.429 | 0.118 / 0.000 | 0.57 | 0.143 | 0.000 / 0.429 |
| role edge | 0.500 | 0.169 / 0.000 | 0.67 | 0.167 | 0.000 / 0.333 |
| role depth | 0.857 | 0.203 / 0.098 | 0.86 | 0.000 | 0.000 / 0.143 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role text | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role layout | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
,=1.00 and=1.00 at=1.00 from=1.00 in=1.00 labeled=1.00 named=1.00 of=1.00 on=1.00 to=1.00 with=1.00 SUPER=0.81 COLOR=0.76 REGION=0.74 NAME=0.68 AXIS=0.47 many=0.44 rules=0.44 VERB=0.42 REL=0.38 DEPTH=0.33 them=0.27 last=0.27 LAYOUT=0.27 we=0.26 times=0.26 SIZE=0.26 have=0.25 TEXT=0.22 that=0.22 ARROW=0.21 are=0.21 the=0.21 NOTCOLOR=0.20 PAIR=0.19 EDGE=0.19 reached=0.18 NUM=0.17 DIR=0.17 it=0.15 lines=0.14 there=0.14 i=0.12 unknown=0.12 SHAPE=0.12 each=0.12 cycle=0.12 how=0.10 now=0.09 path=0.08 show=0.08 link=0.07 called=0.06 be=0.06 RECENT=0.06 route=0.06 can=0.06 what=0.06 me=0.06 does=0.05 has=0.05 then=0.04 STYLE=0.04 who=0.04 than=0.03 a=0.01

## What is weak, what to add
- heldout_sentences: FULL 0.631
- heldout_sentences: predicate (surface lemma) 0.829
- heldout_sentences: event type (synonym table) 0.829
- heldout_sentences: role object 0.811
- heldout_sentences: head object 0.865
- heldout_sentences: occupancy: known filler 0.774
- heldout_sentences: heads FULL (model) 0.721
- heldout_sentences: heads FULL (lexical order baseline) 0.171
- heldout_sentences: heads FULL (lexical bag baseline, trained on the same training rows) 0.432
- heldout_sentences: FULL [depth given] 0.631
- heldout_sentences: FULL [depth and negation given] 0.631
- heldout_sentences: FULL [pooled midpoint (comparison)] 0.315
- heldout_sentences: role object [pooled midpoint (comparison)] 0.477
- heldout_sentences: heads FULL (model) [pooled midpoint (comparison)] 0.360
- heldout_sentences: presence object: share of 'present' readings that abstain 0.070
- heldout_sentences: presence object: share of true 'present' readings that abstain 0.073
- heldout_sentences: presence color: present read present 0.875
- heldout_sentences: presence color: share of 'present' readings that abstain 0.071
- heldout_sentences: presence color: share of true 'present' readings that abstain 0.071
- heldout_sentences: presence object: present read present [pooled midpoint (comparison)] 0.213
- heldout_sentences: presence color: present read present [pooled midpoint (comparison)] 0.562
- heldout_sentences: occupancy: unknown filler 0.826
- heldout_sentences: presence source: share of 'present' readings that abstain 0.105
- heldout_sentences: presence source: share of true 'present' readings that abstain 0.105
- heldout_sentences: presence pairing: share of 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence source: present read present [pooled midpoint (comparison)] 0.762
- heldout_sentences: presence relation: present read present 0.812
- heldout_sentences: presence relation: share of 'present' readings that abstain 0.154
- heldout_sentences: presence relation: share of true 'present' readings that abstain 0.154
- heldout_sentences: presence landmark: present read present 0.714
- heldout_sentences: presence landmark: share of 'present' readings that abstain 0.062
- heldout_sentences: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence relation: present read present [pooled midpoint (comparison)] 0.688
- heldout_sentences: presence landmark: present read present [pooled midpoint (comparison)] 0.762
- heldout_sentences: presence target: present read present 0.818
- heldout_sentences: presence target: present read present [pooled midpoint (comparison)] 0.727
- heldout_sentences: presence size: share of 'present' readings that abstain 0.000
- heldout_sentences: presence size: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence size: present read present [pooled midpoint (comparison)] 0.786
- heldout_sentences: presence shape: share of 'present' readings that abstain 0.000
- heldout_sentences: presence shape: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence name: share of 'present' readings that abstain 0.333
- heldout_sentences: presence name: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence comparison: share of 'present' readings that abstain 0.000
- heldout_sentences: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence region: share of 'present' readings that abstain 0.000
- heldout_sentences: presence region: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: present read present 0.812
- heldout_sentences: presence superlative: share of 'present' readings that abstain 0.077
- heldout_sentences: presence superlative: share of true 'present' readings that abstain 0.077
- heldout_sentences: presence superlative: present read present [pooled midpoint (comparison)] 0.812
- heldout_sentences: presence target: share of 'present' readings that abstain 0.000
- heldout_sentences: presence target: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence style: share of 'present' readings that abstain 0.333
- heldout_sentences: presence style: present read present 0.667
- heldout_sentences: presence style: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence style: present read present [pooled midpoint (comparison)] 0.667
- heldout_sentences: presence target: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence depth: share of 'present' readings that abstain 0.000
- heldout_sentences: presence depth: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): FULL 0.613
- train (sample): presence object: present read present 0.895
- train (sample): presence object: share of 'present' readings that abstain 0.060
- train (sample): presence object: share of true 'present' readings that abstain 0.048
- train (sample): presence size: share of 'present' readings that abstain 0.051
- train (sample): presence size: share of true 'present' readings that abstain 0.026
- train (sample): presence name: share of 'present' readings that abstain 0.118
- train (sample): presence name: share of true 'present' readings that abstain 0.071
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.093
- train (sample): presence landmark: share of true 'present' readings that abstain 0.059
- train (sample): structure (depth, negation) 0.840
- train (sample): predicate (surface lemma) 0.760
- train (sample): event type (synonym table) 0.760
- train (sample): role object 0.787
- train (sample): head object 0.807
- train (sample): occupancy: known filler 0.748
- train (sample): heads FULL (model) 0.663
- train (sample): heads FULL (lexical order baseline) 0.180
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.757
- train (sample): FULL [depth given] 0.613
- train (sample): FULL [depth and negation given] 0.613
- train (sample): presence source: present read present 0.846
- train (sample): presence source: share of 'present' readings that abstain 0.045
- train (sample): presence source: share of true 'present' readings that abstain 0.045
- train (sample): presence pairing: share of 'present' readings that abstain 0.167
- train (sample): presence pairing: share of true 'present' readings that abstain 0.167
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence target: present read present 0.758
- train (sample): presence target: share of 'present' readings that abstain 0.065
- train (sample): presence target: share of true 'present' readings that abstain 0.080
- train (sample): presence style: share of 'present' readings that abstain 0.200
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence color: share of 'present' readings that abstain 0.098
- train (sample): presence color: share of true 'present' readings that abstain 0.098
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.667
- train (sample): presence region: share of 'present' readings that abstain 0.182
- train (sample): presence region: share of true 'present' readings that abstain 0.200
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence name: share of FALSE 'present' readings that abstain 0.333
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.333
- train (sample): presence style: present read present 0.500
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: present read present 0.600
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence depth: share of 'present' readings that abstain 0.000
- train (sample): presence depth: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_sentences: `move NAME REL NAME` FULL 0.000 (n 2)
- heldout_sentences: `make NAME COLOR` FULL 0.000 (n 2)
- heldout_sentences: `how many SHAPE are on the screen` FULL 0.000 (n 1)
- heldout_sentences: `duplicate NAME NUM times` FULL 0.000 (n 1)
- heldout_sentences: `disconnect NAME from NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_sentences | object | product: fitted | 0.902 | 0.949 | 0.925 | 0.070 (0.000 / 0.073) |
| heldout_sentences | object | comparison: pooled midpoint | 0.213 | 0.974 | 0.594 |  |
| heldout_sentences | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | shape | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | color | product: fitted | 0.875 | 1.000 | 0.938 | 0.071 (— / 0.071) |
| heldout_sentences | color | comparison: pooled midpoint | 0.562 | 1.000 | 0.781 |  |
| heldout_sentences | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | size | comparison: pooled midpoint | 0.786 | 1.000 | 0.893 |  |
| heldout_sentences | name | product: fitted | 1.000 | 0.979 | 0.990 | 0.333 (1.000 / 0.000) |
| heldout_sentences | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | relation | product: fitted | 0.812 | 1.000 | 0.906 | 0.154 (— / 0.154) |
| heldout_sentences | relation | comparison: pooled midpoint | 0.688 | 1.000 | 0.844 |  |
| heldout_sentences | landmark | product: fitted | 0.714 | 0.987 | 0.851 | 0.062 (1.000 / 0.000) |
| heldout_sentences | landmark | comparison: pooled midpoint | 0.762 | 1.000 | 0.881 |  |
| heldout_sentences | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | region | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | source | product: fitted | 0.905 | 1.000 | 0.952 | 0.105 (— / 0.105) |
| heldout_sentences | source | comparison: pooled midpoint | 0.762 | 1.000 | 0.881 |  |
| heldout_sentences | target | product: fitted | 0.818 | 0.978 | 0.898 | 0.000 (0.000 / 0.000) |
| heldout_sentences | target | comparison: pooled midpoint | 0.727 | 0.978 | 0.852 |  |
| heldout_sentences | style | product: fitted | 0.667 | 0.990 | 0.828 | 0.333 (1.000 / 0.000) |
| heldout_sentences | style | comparison: pooled midpoint | 0.667 | 0.990 | 0.828 |  |
| heldout_sentences | edge | product: fitted | — | 0.990 | — | 1.000 (1.000 / —) |
| heldout_sentences | edge | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_sentences | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | pairing | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | depth | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | depth | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | superlative | product: fitted | 0.812 | 1.000 | 0.906 | 0.077 (— / 0.077) |
| heldout_sentences | superlative | comparison: pooled midpoint | 0.812 | 1.000 | 0.906 |  |
| heldout_sentences | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | object | product: fitted | 0.895 | 0.933 | 0.914 | 0.060 (0.333 / 0.048) |
| train (sample) | shape | product: fitted | 0.913 | 1.000 | 0.957 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.976 | 1.000 | 0.988 | 0.098 (— / 0.098) |
| train (sample) | size | product: fitted | 0.974 | 0.995 | 0.985 | 0.051 (1.000 / 0.026) |
| train (sample) | name | product: fitted | 0.933 | 0.987 | 0.960 | 0.118 (0.333 / 0.071) |
| train (sample) | relation | product: fitted | 0.921 | 1.000 | 0.961 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.944 | 0.985 | 0.965 | 0.093 (0.667 / 0.059) |
| train (sample) | region | product: fitted | 0.909 | 0.996 | 0.952 | 0.182 (0.000 / 0.200) |
| train (sample) | source | product: fitted | 0.846 | 1.000 | 0.923 | 0.045 (— / 0.045) |
| train (sample) | target | product: fitted | 0.758 | 0.973 | 0.865 | 0.065 (0.000 / 0.080) |
| train (sample) | style | product: fitted | 0.500 | 0.992 | 0.746 | 0.200 (0.500 / 0.000) |
| train (sample) | edge | product: fitted | 0.600 | 1.000 | 0.800 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.167 (— / 0.167) |
| train (sample) | depth | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 0.909 | 1.000 | 0.955 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
