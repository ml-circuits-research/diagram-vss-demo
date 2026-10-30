# REPORT — world `real`, legend sha256:ed6d9bb40cbb… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
2100 annotated sentences from 1 files; provenance: {'llm': 2100}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/final_p40_D1024_e2_s0/splits.json before training; source: split_hints.json)
- heldout_sentences: 199 sentences
- train: 1901 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 10% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
11899 tokens in the examples; 664 with no kind in the lexicon (share 0.056), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit b23979b. Memory curve: runs/final_p40_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.132 [rule: fit; pooled midpoint 0.622 (comparison)] (present 1.149, n 245 / absent 0.096, n 155)
- attr_presence:object: threshold 0.350 [rule: fit; pooled midpoint 0.386 (comparison)] (present 0.646, n 28 / absent 0.127, n 214)
- det_presence:object: threshold 0.523 [rule: fit; pooled midpoint 0.397 (comparison)] (present 0.732, n 6 / absent 0.061, n 236)
- presence:shape: threshold 0.116 [rule: fit; pooled midpoint 0.344 (comparison)] (present 0.680, n 27 / absent 0.009, n 373)
- presence:color: threshold 0.089 [rule: fit; pooled midpoint 0.313 (comparison)] (present 0.604, n 69 / absent 0.022, n 331)
- presence:size: threshold 0.198 [rule: fit; pooled midpoint 0.343 (comparison)] (present 0.655, n 64 / absent 0.031, n 336)
- presence:name: threshold 0.154 [rule: fit; pooled midpoint 0.534 (comparison)] (present 1.065, n 20 / absent 0.002, n 380)
- presence:text: threshold 0.468 [rule: fit; pooled midpoint 0.342 (comparison)] (present 0.697, n 11 / absent -0.013, n 389)
- presence:relation: threshold 0.151 [rule: fit; pooled midpoint 0.382 (comparison)] (present 0.754, n 60 / absent 0.010, n 340)
- presence:landmark: threshold 0.182 [rule: fit; pooled midpoint 0.423 (comparison)] (present 0.815, n 75 / absent 0.032, n 325)
- presence:landmark2: threshold 0.053 [rule: fit; pooled midpoint 0.101 (comparison)] (present 0.192, n 5 / absent 0.010, n 395)
- presence:region: threshold 0.179 [rule: fit; pooled midpoint 0.263 (comparison)] (present 0.503, n 24 / absent 0.023, n 376)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:quantity: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:axis: threshold 0.223 [rule: fit; pooled midpoint 0.213 (comparison)] (present 0.428, n 6 / absent -0.001, n 394)
- presence:layout: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:source: threshold 0.099 [rule: fit; pooled midpoint 0.630 (comparison)] (present 1.226, n 57 / absent 0.034, n 343)
- presence:target: threshold 0.056 [rule: fit; pooled midpoint 0.584 (comparison)] (present 1.131, n 43 / absent 0.038, n 357)
- presence:style: threshold 0.319 [rule: fit; pooled midpoint 0.360 (comparison)] (present 0.705, n 14 / absent 0.015, n 386)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:edge: threshold 0.297 [rule: fit; pooled midpoint 0.425 (comparison)] (present 0.847, n 12 / absent 0.004, n 388)
- presence:pairing: threshold 0.375 [rule: fit; pooled midpoint 0.504 (comparison)] (present 0.991, n 26 / absent 0.016, n 374)
- presence:superlative: threshold 0.293 [rule: fit; pooled midpoint 0.438 (comparison)] (present 0.876, n 32 / absent 0.000, n 368)
- presence:comparison: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:members: threshold 0.233 [rule: fit; pooled midpoint 0.465 (comparison)] (present 0.816, n 45 / absent 0.114, n 355)
- presence:targets: threshold 0.227 [rule: fit; pooled midpoint 0.293 (comparison)] (present 0.538, n 12 / absent 0.047, n 388)
- set_member:members: threshold 0.129 [rule: fit; pooled midpoint 0.320 (comparison)] (present 0.638, n 128 / absent 0.002, n 181924)
- set_member:targets: threshold 0.083 [rule: fit; pooled midpoint 0.195 (comparison)] (present 0.389, n 22 / absent 0.000, n 91004)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 12)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.062, color 0.056, size 0.143, name 0.001, text 0.001, relation 0.067, landmark 0.001, landmark2 0.001, region 0.067, direction 0.250, amount 0.077, quantity 0.077, axis 0.500, layout 0.250, source 0.001, target 0.001, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.001, targets 0.001, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_sentences — catalog candidates (n = 199 of 199)
| axis | accuracy |
|---|---|
| FULL | 0.392 |
| FULL [depth given] | 0.392 |
| FULL [depth and negation given] | 0.392 |
| FULL [pooled midpoint (comparison)] | 0.407 |
| presence object: present read present | 0.937 |
| presence object: share of 'present' readings that abstain | 0.116 |
| presence object: share of true 'present' readings that abstain | 0.087 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.987 |
| presence size: present read present | 0.967 |
| presence size: share of 'present' readings that abstain | 0.033 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present | 0.818 |
| presence name: share of 'present' readings that abstain | 0.091 |
| presence name: share of true 'present' readings that abstain | 0.111 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: present read present | 0.895 |
| presence landmark: share of 'present' readings that abstain | 0.257 |
| presence landmark: share of true 'present' readings that abstain | 0.265 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.994 |
| presence axis: absent read absent | 1.000 |
| presence source: absent read absent | 0.962 |
| presence target: absent read absent | 0.916 |
| presence style: absent read absent | 0.994 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence members: absent read absent | 0.728 |
| presence targets: absent read absent | 0.872 |
| structure (depth, negation) | 0.905 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.673 |
| set targets: exact | 0.849 |
| predicate (surface lemma) | 0.849 |
| event type (synonym table) | 0.849 |
| role object | 0.844 |
| head object | 0.849 |
| lexical order head object | 0.739 |
| lexical bag head object | 0.779 |
| occupancy: known filler | 0.784 |
| role shape | 0.995 |
| head shape | 0.995 |
| lexical order head shape | 0.935 |
| lexical bag head shape | 1.000 |
| occupancy: not given | 0.978 |
| role color | 0.980 |
| head color | 0.980 |
| lexical order head color | 0.864 |
| lexical bag head color | 0.985 |
| role size | 0.985 |
| head size | 0.985 |
| lexical order head size | 0.844 |
| lexical bag head size | 0.965 |
| role name | 0.970 |
| head name | 0.970 |
| lexical order head name | 0.935 |
| lexical bag head name | 0.965 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.970 |
| lexical bag head text | 0.985 |
| role relation | 0.965 |
| head relation | 0.965 |
| lexical order head relation | 0.839 |
| lexical bag head relation | 0.920 |
| role landmark | 0.940 |
| head landmark | 0.940 |
| lexical order head landmark | 0.779 |
| lexical bag head landmark | 0.824 |
| occupancy: unknown filler | 0.833 |
| role landmark2 | 0.985 |
| head landmark2 | 0.985 |
| lexical order head landmark2 | 0.965 |
| lexical bag head landmark2 | 0.975 |
| role region | 0.985 |
| head region | 0.985 |
| lexical order head region | 0.950 |
| lexical bag head region | 0.950 |
| role direction | 1.000 |
| head direction | 1.000 |
| lexical order head direction | 1.000 |
| lexical bag head direction | 1.000 |
| role amount | 0.995 |
| head amount | 0.995 |
| lexical order head amount | 0.995 |
| lexical bag head amount | 1.000 |
| role quantity | 0.985 |
| head quantity | 0.985 |
| lexical order head quantity | 0.985 |
| lexical bag head quantity | 1.000 |
| role axis | 0.990 |
| head axis | 0.990 |
| lexical order head axis | 0.985 |
| lexical bag head axis | 0.985 |
| role layout | 0.970 |
| head layout | 0.970 |
| lexical order head layout | 0.970 |
| lexical bag head layout | 0.990 |
| role source | 0.935 |
| head source | 0.935 |
| lexical order head source | 0.869 |
| lexical bag head source | 0.899 |
| role target | 0.894 |
| head target | 0.894 |
| lexical order head target | 0.915 |
| lexical bag head target | 0.925 |
| role style | 0.980 |
| head style | 0.980 |
| lexical order head style | 0.965 |
| lexical bag head style | 0.970 |
| role arrow | 0.995 |
| head arrow | 0.995 |
| lexical order head arrow | 0.995 |
| lexical bag head arrow | 0.995 |
| role edge | 0.995 |
| head edge | 0.995 |
| lexical order head edge | 0.985 |
| lexical bag head edge | 0.985 |
| role pairing | 0.990 |
| head pairing | 0.990 |
| lexical order head pairing | 0.955 |
| lexical bag head pairing | 0.990 |
| role superlative | 0.990 |
| head superlative | 0.990 |
| lexical order head superlative | 0.925 |
| lexical bag head superlative | 0.960 |
| role comparison | 0.970 |
| head comparison | 0.970 |
| lexical order head comparison | 0.970 |
| lexical bag head comparison | 0.995 |
| role members | 0.673 |
| head members | 0.673 |
| lexical order head members | 0.889 |
| lexical bag head members | 0.879 |
| role targets | 0.849 |
| head targets | 0.849 |
| lexical order head targets | 0.960 |
| lexical bag head targets | 0.940 |
| heads FULL (model) | 0.417 |
| heads FULL (lexical order baseline) | 0.201 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.377 |
| role object [pooled midpoint (comparison)] | 0.668 |
| role shape [pooled midpoint (comparison)] | 0.995 |
| role color [pooled midpoint (comparison)] | 0.960 |
| role size [pooled midpoint (comparison)] | 0.990 |
| role name [pooled midpoint (comparison)] | 0.955 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.945 |
| role landmark [pooled midpoint (comparison)] | 0.905 |
| role landmark2 [pooled midpoint (comparison)] | 0.970 |
| role region [pooled midpoint (comparison)] | 0.980 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 0.995 |
| role quantity [pooled midpoint (comparison)] | 0.985 |
| role axis [pooled midpoint (comparison)] | 0.990 |
| role layout [pooled midpoint (comparison)] | 0.970 |
| role source [pooled midpoint (comparison)] | 0.920 |
| role target [pooled midpoint (comparison)] | 0.940 |
| role style [pooled midpoint (comparison)] | 0.985 |
| role arrow [pooled midpoint (comparison)] | 0.995 |
| role edge [pooled midpoint (comparison)] | 0.995 |
| role pairing [pooled midpoint (comparison)] | 0.990 |
| role superlative [pooled midpoint (comparison)] | 0.990 |
| role comparison [pooled midpoint (comparison)] | 0.970 |
| role members [pooled midpoint (comparison)] | 0.859 |
| role targets [pooled midpoint (comparison)] | 0.905 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.417 |
| presence object: present read present [pooled midpoint (comparison)] | 0.615 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence size: present read present [pooled midpoint (comparison)] | 0.967 |
| presence name: present read present [pooled midpoint (comparison)] | 0.364 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.871 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 0.982 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.994 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 0.980 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.994 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.960 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.933 |
| presence relation: present read present | 0.893 |
| presence relation: share of 'present' readings that abstain | 0.120 |
| presence relation: share of true 'present' readings that abstain | 0.120 |
| presence landmark2: present read present | 0.667 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.875 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.111 |
| presence color: share of true 'present' readings that abstain | 0.120 |
| presence size: absent read absent | 0.993 |
| presence name: absent read absent | 0.988 |
| presence landmark: absent read absent | 0.993 |
| presence members: share of 'present' readings that abstain | 1.000 |
| presence members: share of FALSE 'present' readings that abstain | 1.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.800 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence object: absent read absent | 0.884 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.941 |
| presence source: present read present | 0.909 |
| presence source: share of 'present' readings that abstain | 0.423 |
| presence source: share of true 'present' readings that abstain | 0.350 |
| presence target: share of 'present' readings that abstain | 0.200 |
| presence target: share of FALSE 'present' readings that abstain | 0.286 |
| presence targets: present read present | 1.000 |
| presence targets: share of 'present' readings that abstain | 1.000 |
| presence targets: share of true 'present' readings that abstain | 1.000 |
| set targets: first gold member in the decoded set | 0.750 |
| presence source: present read present [pooled midpoint (comparison)] | 0.619 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.250 |
| presence target: present read present | 0.846 |
| presence target: share of true 'present' readings that abstain | 0.091 |
| presence target: present read present [pooled midpoint (comparison)] | 0.583 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 1.000 |
| presence pairing: present read present | 0.875 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 1.000 |
| presence targets: share of FALSE 'present' readings that abstain | 1.000 |
| set members: first gold member in the decoded set | 0.773 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.875 |
| presence members: present read present [pooled midpoint (comparison)] | 0.955 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present [pooled midpoint (comparison)] | 0.875 |
| presence style: present read present | 0.667 |
| presence style: share of 'present' readings that abstain | 0.200 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 0.800 |
| presence object: share of FALSE 'present' readings that abstain | 0.500 |
| presence source: share of FALSE 'present' readings that abstain | 0.667 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |
| presence size: share of FALSE 'present' readings that abstain | 1.000 |
| presence superlative: present read present | 0.867 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.867 |
| presence style: share of FALSE 'present' readings that abstain | 1.000 |
| presence edge: present read present | 0.667 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 0.667 |
| presence axis: present read present | 0.333 |
| presence axis: present read present [pooled midpoint (comparison)] | 0.333 |
| presence name: share of FALSE 'present' readings that abstain | 0.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |

residual mean 0.284; status {'abstain': 101, 'ok': 79, 'unknown-event': 14, 'no-sense': 5}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.849 | 0.402 / 0.081 | 0.92 | 0.090 | 0.015 / 0.060 |
| role object | 0.815 | 0.204 / 0.010 | 0.84 | 0.089 | 0.065 / 0.097 |
| roles (pooled) | 0.710 | 0.168 / 0.000 | 0.69 | 0.055 | 0.078 / 0.235 |
| role size | 0.935 | 0.263 / 0.190 | 0.97 | 0.032 | 0.000 / 0.032 |
| role name | 0.692 | 0.116 / 0.000 | 0.69 | 0.077 | 0.077 / 0.231 |
| role landmark | 0.750 | 0.110 / 0.000 | 0.59 | 0.023 | 0.182 / 0.227 |
| role relation | 0.781 | 0.181 / 0.000 | 0.72 | 0.031 | 0.094 / 0.188 |
| role landmark2 | 0.571 | 0.009 / 0.000 | 0.00 | 0.000 | 0.571 / 0.429 |
| role color | 0.926 | 0.231 / 0.028 | 0.85 | 0.037 | 0.111 / 0.037 |
| role source | 0.731 | 0.090 / 0.009 | 0.62 | 0.154 | 0.269 / 0.115 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role targets | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role target | 0.588 | 0.183 / 0.000 | 0.76 | 0.176 | 0.000 / 0.235 |
| role text | 1.000 | 0.139 / 0.100 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 0.923 | 0.234 / 0.215 | 0.92 | 0.000 | 0.000 / 0.077 |
| role pairing | 0.778 | 0.271 / 0.000 | 0.78 | 0.000 | 0.000 / 0.222 |
| role members | 0.000 | 0.002 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role region | 0.800 | 0.233 / 0.000 | 0.80 | 0.000 | 0.000 / 0.200 |
| role style | 0.571 | 0.129 / 0.000 | 0.71 | 0.143 | 0.000 / 0.286 |
| role layout | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role superlative | 0.867 | 0.358 / 0.063 | 0.87 | 0.000 | 0.000 / 0.133 |
| role edge | 0.667 | 0.185 / 0.045 | 0.67 | 0.000 | 0.000 / 0.333 |
| role axis | 0.333 | 0.051 / 0.000 | 0.33 | 0.000 | 0.000 / 0.667 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

### train (sample) — catalog candidates (n = 300 of 1901)
| axis | accuracy |
|---|---|
| FULL | 0.423 |
| FULL [depth given] | 0.423 |
| FULL [depth and negation given] | 0.423 |
| presence object: present read present | 0.913 |
| presence object: share of 'present' readings that abstain | 0.042 |
| presence object: share of true 'present' readings that abstain | 0.036 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 0.996 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.981 |
| presence axis: absent read absent | 1.000 |
| presence source: absent read absent | 0.977 |
| presence target: absent read absent | 0.940 |
| presence style: absent read absent | 0.984 |
| presence edge: absent read absent | 0.996 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: present read present | 0.909 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence members: absent read absent | 0.740 |
| presence targets: absent read absent | 0.865 |
| structure (depth, negation) | 0.880 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.737 |
| set targets: exact | 0.847 |
| predicate (surface lemma) | 0.837 |
| event type (synonym table) | 0.837 |
| role object | 0.847 |
| head object | 0.853 |
| lexical order head object | 0.717 |
| lexical bag head object | 0.937 |
| occupancy: known filler | 0.797 |
| role shape | 1.000 |
| head shape | 1.000 |
| lexical order head shape | 0.940 |
| lexical bag head shape | 0.997 |
| occupancy: not given | 0.981 |
| role color | 0.977 |
| head color | 0.977 |
| lexical order head color | 0.850 |
| lexical bag head color | 0.983 |
| role size | 0.997 |
| head size | 0.997 |
| lexical order head size | 0.873 |
| lexical bag head size | 0.983 |
| role name | 0.990 |
| head name | 0.990 |
| lexical order head name | 0.950 |
| lexical bag head name | 1.000 |
| role text | 0.997 |
| head text | 0.997 |
| lexical order head text | 0.970 |
| lexical bag head text | 1.000 |
| role relation | 0.970 |
| head relation | 0.970 |
| lexical order head relation | 0.877 |
| lexical bag head relation | 0.977 |
| role landmark | 0.973 |
| head landmark | 0.973 |
| lexical order head landmark | 0.810 |
| lexical bag head landmark | 0.960 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.983 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.977 |
| head region | 0.977 |
| lexical order head region | 0.970 |
| lexical bag head region | 0.977 |
| role direction | 0.990 |
| head direction | 0.990 |
| lexical order head direction | 0.990 |
| lexical bag head direction | 1.000 |
| role amount | 0.987 |
| head amount | 0.987 |
| lexical order head amount | 0.987 |
| lexical bag head amount | 1.000 |
| role quantity | 0.993 |
| head quantity | 0.993 |
| lexical order head quantity | 0.993 |
| lexical bag head quantity | 1.000 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.993 |
| lexical bag head axis | 1.000 |
| role layout | 0.983 |
| head layout | 0.983 |
| lexical order head layout | 0.983 |
| lexical bag head layout | 1.000 |
| role source | 0.937 |
| head source | 0.937 |
| lexical order head source | 0.833 |
| lexical bag head source | 0.983 |
| role target | 0.927 |
| head target | 0.927 |
| lexical order head target | 0.880 |
| lexical bag head target | 0.987 |
| role style | 0.980 |
| head style | 0.980 |
| lexical order head style | 0.960 |
| lexical bag head style | 0.980 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 1.000 |
| lexical bag head arrow | 1.000 |
| role edge | 0.993 |
| head edge | 0.993 |
| lexical order head edge | 0.970 |
| lexical bag head edge | 0.993 |
| role pairing | 0.993 |
| head pairing | 0.993 |
| lexical order head pairing | 0.967 |
| lexical bag head pairing | 1.000 |
| role superlative | 0.990 |
| head superlative | 0.990 |
| lexical order head superlative | 0.890 |
| lexical bag head superlative | 1.000 |
| role comparison | 0.973 |
| head comparison | 0.973 |
| lexical order head comparison | 0.973 |
| lexical bag head comparison | 1.000 |
| role members | 0.733 |
| head members | 0.733 |
| lexical order head members | 0.937 |
| lexical bag head members | 0.930 |
| role targets | 0.847 |
| head targets | 0.847 |
| lexical order head targets | 0.960 |
| lexical bag head targets | 0.957 |
| heads FULL (model) | 0.450 |
| heads FULL (lexical order baseline) | 0.203 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.733 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.054 |
| presence size: share of true 'present' readings that abstain | 0.054 |
| presence superlative: absent read absent | 1.000 |
| presence members: share of 'present' readings that abstain | 1.000 |
| presence members: share of FALSE 'present' readings that abstain | 1.000 |
| presence name: present read present | 0.929 |
| presence name: share of 'present' readings that abstain | 0.286 |
| presence name: share of true 'present' readings that abstain | 0.231 |
| presence relation: present read present | 0.903 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.961 |
| presence landmark: share of 'present' readings that abstain | 0.061 |
| presence landmark: share of true 'present' readings that abstain | 0.061 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.056 |
| presence shape: share of true 'present' readings that abstain | 0.056 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 0.956 |
| presence source: present read present | 0.881 |
| presence source: share of 'present' readings that abstain | 0.214 |
| presence source: share of true 'present' readings that abstain | 0.108 |
| presence target: present read present | 0.906 |
| presence target: share of 'present' readings that abstain | 0.093 |
| presence target: share of true 'present' readings that abstain | 0.034 |
| presence style: present read present | 0.909 |
| presence style: share of 'present' readings that abstain | 0.214 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.111 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence targets: share of 'present' readings that abstain | 1.000 |
| presence targets: share of FALSE 'present' readings that abstain | 1.000 |
| presence source: share of FALSE 'present' readings that abstain | 1.000 |
| presence pairing: present read present | 0.889 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 1.000 |
| set members: first gold member in the decoded set | 0.895 |
| occupancy: unknown filler | 0.935 |
| presence text: present read present | 0.889 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.214 |
| presence targets: present read present | 0.917 |
| presence targets: share of true 'present' readings that abstain | 1.000 |
| set targets: first gold member in the decoded set | 0.833 |
| presence style: share of FALSE 'present' readings that abstain | 0.750 |
| presence edge: share of FALSE 'present' readings that abstain | 1.000 |
| presence region: share of 'present' readings that abstain | 0.083 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.500 |
| presence axis: share of true 'present' readings that abstain | 0.500 |
| presence region: present read present | 1.000 |
| presence region: share of true 'present' readings that abstain | 0.143 |
| determiner identity (outside FULL when the legend excludes it) | 0.600 |
| presence object: share of FALSE 'present' readings that abstain | 0.200 |
| presence name: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.289; status {'ok': 139, 'abstain': 125, 'unknown-event': 29, 'no-sense': 7}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.837 | 0.408 / 0.033 | 0.88 | 0.060 | 0.013 / 0.103 |
| role object | 0.766 | 0.254 / 0.000 | 0.86 | 0.120 | 0.023 / 0.114 |
| roles (pooled) | 0.754 | 0.200 / 0.000 | 0.77 | 0.059 | 0.044 / 0.188 |
| role superlative | 0.909 | 0.396 / 0.298 | 0.91 | 0.000 | 0.000 / 0.091 |
| role size | 0.974 | 0.260 / 0.189 | 0.92 | 0.000 | 0.053 / 0.026 |
| role name | 0.867 | 0.110 / 0.003 | 0.67 | 0.000 | 0.200 / 0.133 |
| role relation | 0.757 | 0.202 / 0.000 | 0.81 | 0.054 | 0.000 / 0.189 |
| role landmark | 0.860 | 0.165 / 0.021 | 0.84 | 0.035 | 0.053 / 0.105 |
| role shape | 1.000 | 0.234 / 0.188 | 0.94 | 0.000 | 0.056 / 0.000 |
| role color | 0.844 | 0.245 / 0.084 | 0.91 | 0.067 | 0.000 / 0.089 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role source | 0.720 | 0.087 / 0.000 | 0.70 | 0.060 | 0.080 / 0.220 |
| role target | 0.778 | 0.175 / 0.000 | 0.83 | 0.056 | 0.000 / 0.167 |
| role style | 0.833 | 0.215 / 0.150 | 0.92 | 0.083 | 0.000 / 0.083 |
| role edge | 0.889 | 0.292 / 0.248 | 0.89 | 0.000 | 0.000 / 0.111 |
| role pairing | 0.800 | 0.223 / 0.113 | 0.90 | 0.100 | 0.000 / 0.100 |
| role members | 0.158 | 0.003 / 0.000 | 0.00 | 0.000 | 0.158 / 0.842 |
| role text | 0.889 | 0.136 / 0.089 | 0.89 | 0.000 | 0.000 / 0.111 |
| role landmark2 | 1.000 | 0.024 / 0.006 | 0.00 | 0.000 | 1.000 / 0.000 |
| role targets | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role axis | 1.000 | 0.110 / 0.038 | 0.50 | 0.000 | 0.500 / 0.000 |
| role region | 0.778 | 0.211 / 0.011 | 0.78 | 0.111 | 0.111 / 0.111 |
| role layout | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.94 SUPER=0.92 COLOR=0.92 NAME=0.76 rules=0.69 LAYOUT=0.69 AXIS=0.58 them=0.58 there=0.54 last=0.49 once=0.45 pixels=0.41 PAIR=0.41 DIR=0.40 VERB=0.38 have=0.34 we=0.34 that=0.32 for=0.31 it=0.29 STYLE=0.27 in=0.25 NUM=0.25 evenly=0.24 four=0.24 TEXT=0.23 any=0.22 are=0.22 line=0.21 SHAPE=0.21 here=0.17 the=0.15 now=0.15 arrow=0.15 axis=0.12 NOTCOLOR=0.12 both=0.12 SIZE=0.11 reached=0.10 show=0.09 ARROW=0.08 with=0.08 directly=0.07 at=0.07 me=0.07 i=0.07 arrows=0.06 can=0.06 lines=0.06 be=0.06 by=0.06 RECENT=0.05 three=0.05 tell=0.05 shapes=0.05 an=0.04 what=0.04 what's=0.04 goes=0.04 not=0.04 unknown=0.03 on=0.03 put=0.03 every=0.03 shape=0.03 does=0.03 has=0.03 QUANT=0.03 who=0.02 then=0.02 from=0.02 of=0.02 one=0.02 called=0.02 and=0.02 named=0.01 to=0.01 labeled=0.01 a=0.01

## What is weak, what to add
- heldout_sentences: FULL 0.392
- heldout_sentences: presence object: share of 'present' readings that abstain 0.116
- heldout_sentences: presence object: share of true 'present' readings that abstain 0.087
- heldout_sentences: presence size: share of 'present' readings that abstain 0.033
- heldout_sentences: presence size: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence name: present read present 0.818
- heldout_sentences: presence name: share of 'present' readings that abstain 0.091
- heldout_sentences: presence name: share of true 'present' readings that abstain 0.111
- heldout_sentences: presence landmark: present read present 0.895
- heldout_sentences: presence landmark: share of 'present' readings that abstain 0.257
- heldout_sentences: presence landmark: share of true 'present' readings that abstain 0.265
- heldout_sentences: presence members: absent read absent 0.728
- heldout_sentences: presence targets: absent read absent 0.872
- heldout_sentences: set members: exact 0.673
- heldout_sentences: set targets: exact 0.849
- heldout_sentences: predicate (surface lemma) 0.849
- heldout_sentences: event type (synonym table) 0.849
- heldout_sentences: role object 0.844
- heldout_sentences: head object 0.849
- heldout_sentences: occupancy: known filler 0.784
- heldout_sentences: occupancy: unknown filler 0.833
- heldout_sentences: role target 0.894
- heldout_sentences: head target 0.894
- heldout_sentences: role members 0.673
- heldout_sentences: head members 0.673
- heldout_sentences: role targets 0.849
- heldout_sentences: head targets 0.849
- heldout_sentences: heads FULL (model) 0.417
- heldout_sentences: heads FULL (lexical order baseline) 0.201
- heldout_sentences: heads FULL (lexical bag baseline, trained on the same training rows) 0.377
- heldout_sentences: FULL [depth given] 0.392
- heldout_sentences: FULL [depth and negation given] 0.392
- heldout_sentences: FULL [pooled midpoint (comparison)] 0.407
- heldout_sentences: role object [pooled midpoint (comparison)] 0.668
- heldout_sentences: role members [pooled midpoint (comparison)] 0.859
- heldout_sentences: heads FULL (model) [pooled midpoint (comparison)] 0.417
- heldout_sentences: presence object: present read present [pooled midpoint (comparison)] 0.615
- heldout_sentences: presence name: present read present [pooled midpoint (comparison)] 0.364
- heldout_sentences: presence landmark: present read present [pooled midpoint (comparison)] 0.871
- heldout_sentences: presence relation: present read present 0.893
- heldout_sentences: presence relation: share of 'present' readings that abstain 0.120
- heldout_sentences: presence relation: share of true 'present' readings that abstain 0.120
- heldout_sentences: presence landmark2: present read present 0.667
- heldout_sentences: presence relation: present read present [pooled midpoint (comparison)] 0.875
- heldout_sentences: presence color: share of 'present' readings that abstain 0.111
- heldout_sentences: presence color: share of true 'present' readings that abstain 0.120
- heldout_sentences: presence color: present read present [pooled midpoint (comparison)] 0.800
- heldout_sentences: presence object: absent read absent 0.884
- heldout_sentences: presence source: share of 'present' readings that abstain 0.423
- heldout_sentences: presence source: share of true 'present' readings that abstain 0.350
- heldout_sentences: presence target: share of 'present' readings that abstain 0.200
- heldout_sentences: presence target: share of FALSE 'present' readings that abstain 0.286
- heldout_sentences: set targets: first gold member in the decoded set 0.750
- heldout_sentences: presence source: present read present [pooled midpoint (comparison)] 0.619
- heldout_sentences: presence targets: present read present [pooled midpoint (comparison)] 0.250
- heldout_sentences: presence target: present read present 0.846
- heldout_sentences: presence target: share of true 'present' readings that abstain 0.091
- heldout_sentences: presence target: present read present [pooled midpoint (comparison)] 0.583
- heldout_sentences: presence text: share of 'present' readings that abstain 0.000
- heldout_sentences: presence text: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence landmark: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence shape: share of 'present' readings that abstain 0.000
- heldout_sentences: presence shape: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: present read present 0.875
- heldout_sentences: presence pairing: share of 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_sentences: set members: first gold member in the decoded set 0.773
- heldout_sentences: presence pairing: present read present [pooled midpoint (comparison)] 0.875
- heldout_sentences: presence region: share of 'present' readings that abstain 0.000
- heldout_sentences: presence region: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence region: present read present [pooled midpoint (comparison)] 0.875
- heldout_sentences: presence style: present read present 0.667
- heldout_sentences: presence style: share of 'present' readings that abstain 0.200
- heldout_sentences: presence style: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence style: present read present [pooled midpoint (comparison)] 0.800
- heldout_sentences: presence object: share of FALSE 'present' readings that abstain 0.500
- heldout_sentences: presence source: share of FALSE 'present' readings that abstain 0.667
- heldout_sentences: presence color: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: present read present 0.867
- heldout_sentences: presence superlative: share of 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: present read present [pooled midpoint (comparison)] 0.867
- heldout_sentences: presence edge: present read present 0.667
- heldout_sentences: presence edge: share of 'present' readings that abstain 0.000
- heldout_sentences: presence edge: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence edge: present read present [pooled midpoint (comparison)] 0.667
- heldout_sentences: presence axis: present read present 0.333
- heldout_sentences: presence axis: present read present [pooled midpoint (comparison)] 0.333
- heldout_sentences: presence name: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence axis: share of 'present' readings that abstain 0.000
- heldout_sentences: presence axis: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.423
- train (sample): presence object: share of 'present' readings that abstain 0.042
- train (sample): presence object: share of true 'present' readings that abstain 0.036
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence members: absent read absent 0.740
- train (sample): presence targets: absent read absent 0.865
- train (sample): structure (depth, negation) 0.880
- train (sample): set members: exact 0.737
- train (sample): set targets: exact 0.847
- train (sample): predicate (surface lemma) 0.837
- train (sample): event type (synonym table) 0.837
- train (sample): role object 0.847
- train (sample): head object 0.853
- train (sample): occupancy: known filler 0.797
- train (sample): role members 0.733
- train (sample): head members 0.733
- train (sample): role targets 0.847
- train (sample): head targets 0.847
- train (sample): heads FULL (model) 0.450
- train (sample): heads FULL (lexical order baseline) 0.203
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.733
- train (sample): FULL [depth given] 0.423
- train (sample): FULL [depth and negation given] 0.423
- train (sample): presence size: share of 'present' readings that abstain 0.054
- train (sample): presence size: share of true 'present' readings that abstain 0.054
- train (sample): presence name: share of 'present' readings that abstain 0.286
- train (sample): presence name: share of true 'present' readings that abstain 0.231
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.061
- train (sample): presence landmark: share of true 'present' readings that abstain 0.061
- train (sample): presence shape: share of 'present' readings that abstain 0.056
- train (sample): presence shape: share of true 'present' readings that abstain 0.056
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): presence source: present read present 0.881
- train (sample): presence source: share of 'present' readings that abstain 0.214
- train (sample): presence source: share of true 'present' readings that abstain 0.108
- train (sample): presence target: share of 'present' readings that abstain 0.093
- train (sample): presence target: share of true 'present' readings that abstain 0.034
- train (sample): presence style: share of 'present' readings that abstain 0.214
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.111
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence pairing: present read present 0.889
- train (sample): presence pairing: share of 'present' readings that abstain 0.000
- train (sample): presence pairing: share of true 'present' readings that abstain 0.000
- train (sample): set members: first gold member in the decoded set 0.895
- train (sample): presence text: present read present 0.889
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.214
- train (sample): set targets: first gold member in the decoded set 0.833
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.750
- train (sample): presence region: share of 'present' readings that abstain 0.083
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.500
- train (sample): presence axis: share of true 'present' readings that abstain 0.500
- train (sample): presence region: share of true 'present' readings that abstain 0.143
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.600
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.200

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_sentences: `connect NAME , NAME and NAME in a PAIR` FULL 0.000 (n 6)
- heldout_sentences: `make the NAME a SIZE COLOR SHAPE` FULL 0.000 (n 6)
- heldout_sentences: `make the NAME to a SIZE COLOR SHAPE` FULL 0.000 (n 5)
- heldout_sentences: `connect NAME to NAME and NAME to NAME` FULL 0.000 (n 4)
- heldout_sentences: `move NAME POS NAME` FULL 0.000 (n 3)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_sentences | object | product: fitted | 0.937 | 0.884 | 0.910 | 0.116 (0.500 / 0.087) |
| heldout_sentences | object | comparison: pooled midpoint | 0.615 | 0.941 | 0.778 |  |
| heldout_sentences | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | shape | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | color | product: fitted | 1.000 | 0.987 | 0.994 | 0.111 (0.000 / 0.120) |
| heldout_sentences | color | comparison: pooled midpoint | 0.800 | 0.993 | 0.897 |  |
| heldout_sentences | size | product: fitted | 0.967 | 0.993 | 0.980 | 0.033 (1.000 / 0.000) |
| heldout_sentences | size | comparison: pooled midpoint | 0.967 | 1.000 | 0.983 |  |
| heldout_sentences | name | product: fitted | 0.818 | 0.988 | 0.903 | 0.091 (0.000 / 0.111) |
| heldout_sentences | name | comparison: pooled midpoint | 0.364 | 1.000 | 0.682 |  |
| heldout_sentences | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | relation | product: fitted | 0.893 | 1.000 | 0.946 | 0.120 (— / 0.120) |
| heldout_sentences | relation | comparison: pooled midpoint | 0.875 | 1.000 | 0.938 |  |
| heldout_sentences | landmark | product: fitted | 0.895 | 0.993 | 0.944 | 0.257 (0.000 / 0.265) |
| heldout_sentences | landmark | comparison: pooled midpoint | 0.871 | 0.993 | 0.932 |  |
| heldout_sentences | landmark2 | product: fitted | 0.667 | 1.000 | 0.833 | 1.000 (— / 1.000) |
| heldout_sentences | landmark2 | comparison: pooled midpoint | 1.000 | 0.982 | 0.991 |  |
| heldout_sentences | region | product: fitted | 1.000 | 0.994 | 0.997 | 0.000 (0.000 / 0.000) |
| heldout_sentences | region | comparison: pooled midpoint | 0.875 | 0.994 | 0.934 |  |
| heldout_sentences | axis | product: fitted | 0.333 | 1.000 | 0.667 | 0.000 (— / 0.000) |
| heldout_sentences | axis | comparison: pooled midpoint | 0.333 | 1.000 | 0.667 |  |
| heldout_sentences | source | product: fitted | 0.909 | 0.962 | 0.936 | 0.423 (0.667 / 0.350) |
| heldout_sentences | source | comparison: pooled midpoint | 0.619 | 0.980 | 0.800 |  |
| heldout_sentences | target | product: fitted | 0.846 | 0.916 | 0.881 | 0.200 (0.286 / 0.091) |
| heldout_sentences | target | comparison: pooled midpoint | 0.583 | 0.994 | 0.789 |  |
| heldout_sentences | style | product: fitted | 0.667 | 0.994 | 0.830 | 0.200 (1.000 / 0.000) |
| heldout_sentences | style | comparison: pooled midpoint | 0.800 | 1.000 | 0.900 |  |
| heldout_sentences | edge | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_sentences | edge | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_sentences | pairing | product: fitted | 0.875 | 1.000 | 0.938 | 0.000 (— / 0.000) |
| heldout_sentences | pairing | comparison: pooled midpoint | 0.875 | 1.000 | 0.938 |  |
| heldout_sentences | superlative | product: fitted | 0.867 | 1.000 | 0.933 | 0.000 (— / 0.000) |
| heldout_sentences | superlative | comparison: pooled midpoint | 0.867 | 1.000 | 0.933 |  |
| heldout_sentences | members | product: fitted | 1.000 | 0.728 | 0.864 | 1.000 (1.000 / 1.000) |
| heldout_sentences | members | comparison: pooled midpoint | 0.955 | 0.960 | 0.957 |  |
| heldout_sentences | targets | product: fitted | 1.000 | 0.872 | 0.936 | 1.000 (1.000 / 1.000) |
| heldout_sentences | targets | comparison: pooled midpoint | 0.250 | 0.933 | 0.591 |  |
| train (sample) | object | product: fitted | 0.913 | 0.956 | 0.935 | 0.042 (0.200 / 0.036) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.056 (— / 0.056) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.054 (— / 0.054) |
| train (sample) | name | product: fitted | 0.929 | 0.996 | 0.962 | 0.286 (1.000 / 0.231) |
| train (sample) | text | product: fitted | 0.889 | 1.000 | 0.944 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.903 | 1.000 | 0.952 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.961 | 1.000 | 0.980 | 0.061 (— / 0.061) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| train (sample) | region | product: fitted | 1.000 | 0.981 | 0.990 | 0.083 (0.000 / 0.143) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.500 (— / 0.500) |
| train (sample) | source | product: fitted | 0.881 | 0.977 | 0.929 | 0.214 (1.000 / 0.108) |
| train (sample) | target | product: fitted | 0.906 | 0.940 | 0.923 | 0.093 (0.214 / 0.034) |
| train (sample) | style | product: fitted | 0.909 | 0.984 | 0.947 | 0.214 (0.750 / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 0.996 | 0.998 | 0.111 (1.000 / 0.000) |
| train (sample) | pairing | product: fitted | 0.889 | 1.000 | 0.944 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 0.909 | 1.000 | 0.955 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.740 | 0.870 | 1.000 (1.000 / 1.000) |
| train (sample) | targets | product: fitted | 0.917 | 0.865 | 0.891 | 1.000 (1.000 / 1.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
