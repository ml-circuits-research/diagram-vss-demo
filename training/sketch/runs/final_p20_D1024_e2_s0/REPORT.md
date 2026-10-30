# REPORT — world `real`, legend sha256:ca9e132ec427… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1105 annotated sentences from 1 files; provenance: {'llm': 1105}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/final_p20_D1024_e2_s0/splits.json before training; source: split_hints.json)
- heldout_sentences: 117 sentences
- train: 988 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 10% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
6157 tokens in the examples; 470 with no kind in the lexicon (share 0.076), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 4bc1740. Memory curve: runs/final_p20_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.010 [rule: fit; pooled midpoint 0.586 (comparison)] (present 1.025, n 255 / absent 0.147, n 145)
- attr_presence:object: threshold 0.307 [rule: fit; pooled midpoint 0.496 (comparison)] (present 0.862, n 25 / absent 0.130, n 227)
- det_presence:object: threshold 0.634 [rule: fit; pooled midpoint 0.695 (comparison)] (present 1.327, n 5 / absent 0.063, n 247)
- presence:shape: threshold 0.263 [rule: fit; pooled midpoint 0.264 (comparison)] (present 0.520, n 33 / absent 0.008, n 367)
- presence:color: threshold 0.112 [rule: fit; pooled midpoint 0.260 (comparison)] (present 0.501, n 84 / absent 0.020, n 316)
- presence:size: threshold 0.200 [rule: fit; pooled midpoint 0.324 (comparison)] (present 0.615, n 59 / absent 0.033, n 341)
- presence:name: threshold 0.138 [rule: fit; pooled midpoint 0.305 (comparison)] (present 0.606, n 25 / absent 0.004, n 375)
- presence:text: threshold 0.057 [rule: fit; pooled midpoint 0.219 (comparison)] (present 0.445, n 11 / absent -0.007, n 389)
- presence:relation: threshold 0.090 [rule: fit; pooled midpoint 0.288 (comparison)] (present 0.567, n 45 / absent 0.009, n 355)
- presence:landmark: threshold 0.119 [rule: fit; pooled midpoint 0.340 (comparison)] (present 0.646, n 63 / absent 0.034, n 337)
- presence:landmark2: threshold 0.089 [rule: fit; pooled midpoint 0.112 (comparison)] (present 0.221, n 6 / absent 0.004, n 394)
- presence:region: threshold 0.153 [rule: fit; pooled midpoint 0.238 (comparison)] (present 0.458, n 17 / absent 0.018, n 383)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 399)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 399)
- presence:quantity: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:axis: threshold 0.058 [rule: fit; pooled midpoint 0.085 (comparison)] (present 0.170, n 5 / absent 0.000, n 395)
- presence:layout: threshold 0.097 [rule: fit; pooled midpoint 0.155 (comparison)] (present 0.309, n 11 / absent 0.001, n 389)
- presence:source: threshold 0.149 [rule: fit; pooled midpoint 0.392 (comparison)] (present 0.758, n 53 / absent 0.026, n 347)
- presence:target: threshold 0.050 [rule: fit; pooled midpoint 0.325 (comparison)] (present 0.609, n 36 / absent 0.042, n 364)
- presence:style: threshold 0.185 [rule: fit; pooled midpoint 0.241 (comparison)] (present 0.463, n 13 / absent 0.018, n 387)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:edge: threshold 0.390 [rule: fit; pooled midpoint 0.281 (comparison)] (present 0.553, n 10 / absent 0.008, n 390)
- presence:pairing: threshold 0.306 [rule: fit; pooled midpoint 0.292 (comparison)] (present 0.560, n 13 / absent 0.023, n 387)
- presence:superlative: threshold 0.036 [rule: fit; pooled midpoint 0.411 (comparison)] (present 0.821, n 32 / absent 0.000, n 368)
- presence:comparison: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:members: threshold 0.205 [rule: fit; pooled midpoint 0.383 (comparison)] (present 0.685, n 32 / absent 0.082, n 368)
- presence:targets: threshold 0.166 [rule: fit; pooled midpoint 0.161 (comparison)] (present 0.291, n 16 / absent 0.030, n 384)
- set_member:members: threshold 0.089 [rule: fit; pooled midpoint 0.256 (comparison)] (present 0.511, n 88 / absent 0.002, n 103496)
- set_member:targets: threshold 0.083 [rule: fit; pooled midpoint 0.117 (comparison)] (present 0.232, n 32 / absent 0.001, n 41737)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 10)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.062, color 0.056, size 0.143, name 0.002, text 0.001, relation 0.067, landmark 0.002, landmark2 0.002, region 0.067, direction 0.250, amount 0.125, quantity 0.125, axis 0.500, layout 0.250, source 0.002, target 0.002, style 0.333, arrow 0.500, edge 1.000, pairing 0.333, superlative 0.100, comparison 0.143, members 0.002, targets 0.002, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_sentences — catalog candidates (n = 117 of 117)
| axis | accuracy |
|---|---|
| FULL | 0.444 |
| FULL [depth given] | 0.444 |
| FULL [depth and negation given] | 0.444 |
| FULL [pooled midpoint (comparison)] | 0.410 |
| structure (depth, negation) | 0.923 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.675 |
| set targets: exact | 0.872 |
| predicate (surface lemma) | 0.880 |
| event type (synonym table) | 0.880 |
| role object | 0.949 |
| head object | 0.957 |
| lexical order head object | 0.786 |
| lexical bag head object | 0.786 |
| occupancy: known filler | 0.827 |
| role shape | 0.991 |
| head shape | 0.991 |
| lexical order head shape | 0.915 |
| lexical bag head shape | 1.000 |
| occupancy: not given | 0.978 |
| role color | 0.983 |
| head color | 0.983 |
| lexical order head color | 0.838 |
| lexical bag head color | 0.974 |
| role size | 0.991 |
| head size | 0.991 |
| lexical order head size | 0.863 |
| lexical bag head size | 0.974 |
| role name | 0.974 |
| head name | 0.974 |
| lexical order head name | 0.957 |
| lexical bag head name | 0.974 |
| role text | 0.983 |
| head text | 0.983 |
| lexical order head text | 0.983 |
| lexical bag head text | 1.000 |
| role relation | 0.983 |
| head relation | 0.983 |
| lexical order head relation | 0.880 |
| lexical bag head relation | 0.940 |
| role landmark | 0.923 |
| head landmark | 0.923 |
| lexical order head landmark | 0.846 |
| lexical bag head landmark | 0.872 |
| occupancy: unknown filler | 0.800 |
| role landmark2 | 0.974 |
| head landmark2 | 0.974 |
| lexical order head landmark2 | 0.983 |
| lexical bag head landmark2 | 0.983 |
| role region | 0.991 |
| head region | 0.991 |
| lexical order head region | 0.932 |
| lexical bag head region | 0.957 |
| role direction | 1.000 |
| head direction | 1.000 |
| lexical order head direction | 1.000 |
| lexical bag head direction | 1.000 |
| role amount | 0.991 |
| head amount | 0.991 |
| lexical order head amount | 0.991 |
| lexical bag head amount | 1.000 |
| role quantity | 0.983 |
| head quantity | 0.983 |
| lexical order head quantity | 0.983 |
| lexical bag head quantity | 0.991 |
| role axis | 0.991 |
| head axis | 0.991 |
| lexical order head axis | 0.983 |
| lexical bag head axis | 0.991 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 0.991 |
| lexical bag head layout | 1.000 |
| role source | 0.940 |
| head source | 0.940 |
| lexical order head source | 0.889 |
| lexical bag head source | 0.889 |
| role target | 0.880 |
| head target | 0.880 |
| lexical order head target | 0.940 |
| lexical bag head target | 0.957 |
| role style | 0.974 |
| head style | 0.974 |
| lexical order head style | 0.957 |
| lexical bag head style | 0.957 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 1.000 |
| lexical bag head arrow | 1.000 |
| role edge | 0.983 |
| head edge | 0.983 |
| lexical order head edge | 0.983 |
| lexical bag head edge | 0.983 |
| role pairing | 0.983 |
| head pairing | 0.983 |
| lexical order head pairing | 0.966 |
| lexical bag head pairing | 0.991 |
| role superlative | 0.991 |
| head superlative | 0.991 |
| lexical order head superlative | 0.872 |
| lexical bag head superlative | 0.932 |
| role comparison | 0.983 |
| head comparison | 0.983 |
| lexical order head comparison | 0.983 |
| lexical bag head comparison | 0.991 |
| role members | 0.675 |
| head members | 0.675 |
| lexical order head members | 0.906 |
| lexical bag head members | 0.897 |
| role targets | 0.872 |
| head targets | 0.872 |
| lexical order head targets | 0.957 |
| lexical bag head targets | 0.940 |
| heads FULL (model) | 0.479 |
| heads FULL (lexical order baseline) | 0.205 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.470 |
| role object [pooled midpoint (comparison)] | 0.684 |
| role shape [pooled midpoint (comparison)] | 0.991 |
| role color [pooled midpoint (comparison)] | 0.940 |
| role size [pooled midpoint (comparison)] | 0.991 |
| role name [pooled midpoint (comparison)] | 0.974 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.957 |
| role landmark [pooled midpoint (comparison)] | 0.923 |
| role landmark2 [pooled midpoint (comparison)] | 0.966 |
| role region [pooled midpoint (comparison)] | 0.983 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 0.991 |
| role quantity [pooled midpoint (comparison)] | 0.983 |
| role axis [pooled midpoint (comparison)] | 0.991 |
| role layout [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.949 |
| role target [pooled midpoint (comparison)] | 0.906 |
| role style [pooled midpoint (comparison)] | 0.983 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 0.991 |
| role pairing [pooled midpoint (comparison)] | 0.983 |
| role superlative [pooled midpoint (comparison)] | 0.991 |
| role comparison [pooled midpoint (comparison)] | 0.983 |
| role members [pooled midpoint (comparison)] | 0.897 |
| role targets [pooled midpoint (comparison)] | 0.872 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.453 |
| presence object: present read present | 0.986 |
| presence object: share of 'present' readings that abstain | 0.088 |
| presence object: share of true 'present' readings that abstain | 0.088 |
| presence shape: absent read absent | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.211 |
| presence color: share of true 'present' readings that abstain | 0.167 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 0.981 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.978 |
| presence landmark2: absent read absent | 0.991 |
| presence region: absent read absent | 0.990 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.969 |
| presence target: absent read absent | 0.904 |
| presence style: absent read absent | 0.990 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence members: absent read absent | 0.724 |
| presence members: share of 'present' readings that abstain | 1.000 |
| presence members: share of FALSE 'present' readings that abstain | 1.000 |
| presence targets: absent read absent | 0.903 |
| presence object: present read present [pooled midpoint (comparison)] | 0.587 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.667 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 0.978 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 0.980 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.979 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 0.978 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.929 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.989 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.897 |
| presence object: absent read absent | 1.000 |
| presence color: absent read absent | 0.989 |
| presence source: share of 'present' readings that abstain | 0.750 |
| presence source: share of FALSE 'present' readings that abstain | 1.000 |
| presence target: share of 'present' readings that abstain | 0.462 |
| presence target: share of FALSE 'present' readings that abstain | 0.600 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 1.000 |
| presence targets: share of 'present' readings that abstain | 1.000 |
| presence targets: share of FALSE 'present' readings that abstain | 1.000 |
| set members: first gold member in the decoded set | 0.727 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present | 0.923 |
| presence relation: share of 'present' readings that abstain | 0.083 |
| presence relation: share of true 'present' readings that abstain | 0.083 |
| presence landmark: present read present | 0.688 |
| presence landmark: share of 'present' readings that abstain | 0.154 |
| presence landmark: share of true 'present' readings that abstain | 0.091 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.900 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.917 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present | 0.938 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.250 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.500 |
| presence name: present read present | 0.750 |
| presence name: share of 'present' readings that abstain | 0.333 |
| presence name: share of true 'present' readings that abstain | 0.333 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of FALSE 'present' readings that abstain | 1.000 |
| presence name: present read present [pooled midpoint (comparison)] | 0.750 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present [pooled midpoint (comparison)] | 1.000 |
| presence pairing: present read present | 0.667 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.667 |
| presence source: present read present | 0.900 |
| presence source: share of true 'present' readings that abstain | 0.667 |
| presence target: present read present | 0.750 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence style: share of 'present' readings that abstain | 0.250 |
| presence style: share of FALSE 'present' readings that abstain | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.900 |
| presence target: present read present [pooled midpoint (comparison)] | 0.750 |
| presence targets: present read present | 1.000 |
| presence targets: share of true 'present' readings that abstain | 1.000 |
| set targets: first gold member in the decoded set | 0.800 |
| presence targets: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: present read present | 0.750 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 0.750 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.000 |
| presence superlative: present read present | 0.933 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.933 |
| presence text: share of FALSE 'present' readings that abstain | 0.500 |
| presence edge: present read present | 0.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 0.500 |
| presence axis: present read present | 0.500 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present [pooled midpoint (comparison)] | 0.500 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence color: share of FALSE 'present' readings that abstain | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |

residual mean 0.273; status {'unknown-event': 7, 'abstain': 56, 'ok': 52, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.880 | 0.397 / 0.105 | 0.94 | 0.077 | 0.017 / 0.043 |
| role object | 0.917 | 0.209 / 0.047 | 0.89 | 0.056 | 0.083 / 0.028 |
| roles (pooled) | 0.746 | 0.162 / 0.000 | 0.73 | 0.055 | 0.072 / 0.199 |
| role name | 0.400 | 0.063 / 0.000 | 0.40 | 0.000 | 0.000 / 0.600 |
| role landmark | 0.611 | 0.080 / 0.000 | 0.67 | 0.111 | 0.056 / 0.278 |
| role color | 0.947 | 0.173 / 0.035 | 0.84 | 0.053 | 0.158 / 0.000 |
| role members | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role relation | 0.857 | 0.178 / 0.038 | 0.86 | 0.071 | 0.071 / 0.071 |
| role shape | 0.900 | 0.182 / 0.148 | 1.00 | 0.100 | 0.000 / 0.000 |
| role size | 0.938 | 0.202 / 0.121 | 0.94 | 0.000 | 0.000 / 0.062 |
| role text | 1.000 | 0.130 / 0.123 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 1.000 | 0.280 / 0.118 | 1.00 | 0.000 | 0.000 / 0.000 |
| role pairing | 0.500 | 0.158 / 0.000 | 0.50 | 0.000 | 0.000 / 0.500 |
| role source | 0.692 | 0.036 / 0.000 | 0.31 | 0.077 | 0.462 / 0.231 |
| role target | 0.429 | 0.105 / 0.000 | 0.71 | 0.286 | 0.000 / 0.286 |
| role targets | 0.000 | 0.001 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role style | 0.600 | 0.085 / 0.033 | 0.80 | 0.200 | 0.000 / 0.200 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role superlative | 0.933 | 0.373 / 0.373 | 0.93 | 0.000 | 0.000 / 0.067 |
| role edge | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role axis | 0.500 | 0.071 / 0.014 | 0.50 | 0.000 | 0.000 / 0.500 |
| role layout | 1.000 | 0.143 / 0.143 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

### train (sample) — catalog candidates (n = 300 of 988)
| axis | accuracy |
|---|---|
| FULL | 0.473 |
| FULL [depth given] | 0.473 |
| FULL [depth and negation given] | 0.473 |
| presence object: present read present | 0.983 |
| presence object: share of 'present' readings that abstain | 0.066 |
| presence object: share of true 'present' readings that abstain | 0.068 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.996 |
| presence size: present read present | 0.978 |
| presence size: share of 'present' readings that abstain | 0.023 |
| presence size: share of true 'present' readings that abstain | 0.023 |
| presence name: present read present | 0.875 |
| presence text: absent read absent | 0.996 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of FALSE 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.912 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.935 |
| presence landmark: share of 'present' readings that abstain | 0.111 |
| presence landmark: share of true 'present' readings that abstain | 0.070 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.985 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.972 |
| presence target: absent read absent | 0.923 |
| presence style: absent read absent | 0.985 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence members: absent read absent | 0.689 |
| presence targets: absent read absent | 0.881 |
| structure (depth, negation) | 0.933 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.653 |
| set targets: exact | 0.857 |
| predicate (surface lemma) | 0.870 |
| event type (synonym table) | 0.870 |
| role object | 0.917 |
| head object | 0.927 |
| lexical order head object | 0.797 |
| lexical bag head object | 0.943 |
| occupancy: known filler | 0.893 |
| role shape | 1.000 |
| head shape | 1.000 |
| lexical order head shape | 0.920 |
| lexical bag head shape | 1.000 |
| occupancy: not given | 0.977 |
| role color | 0.977 |
| head color | 0.977 |
| lexical order head color | 0.813 |
| lexical bag head color | 0.987 |
| role size | 0.990 |
| head size | 0.990 |
| lexical order head size | 0.843 |
| lexical bag head size | 0.987 |
| role name | 0.993 |
| head name | 0.993 |
| lexical order head name | 0.947 |
| lexical bag head name | 1.000 |
| role text | 0.997 |
| head text | 0.997 |
| lexical order head text | 0.973 |
| lexical bag head text | 1.000 |
| role relation | 0.987 |
| head relation | 0.987 |
| lexical order head relation | 0.883 |
| lexical bag head relation | 0.970 |
| role landmark | 0.980 |
| head landmark | 0.980 |
| lexical order head landmark | 0.843 |
| lexical bag head landmark | 0.970 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.983 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.977 |
| head region | 0.977 |
| lexical order head region | 0.930 |
| lexical bag head region | 0.970 |
| role direction | 0.990 |
| head direction | 0.990 |
| lexical order head direction | 0.990 |
| lexical bag head direction | 1.000 |
| role amount | 0.990 |
| head amount | 0.990 |
| lexical order head amount | 0.990 |
| lexical bag head amount | 1.000 |
| role quantity | 0.993 |
| head quantity | 0.993 |
| lexical order head quantity | 0.993 |
| lexical bag head quantity | 1.000 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.993 |
| lexical bag head axis | 1.000 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 0.983 |
| lexical bag head layout | 1.000 |
| role source | 0.957 |
| head source | 0.957 |
| lexical order head source | 0.890 |
| lexical bag head source | 0.993 |
| role target | 0.923 |
| head target | 0.923 |
| lexical order head target | 0.927 |
| lexical bag head target | 0.997 |
| role style | 0.987 |
| head style | 0.987 |
| lexical order head style | 0.973 |
| lexical bag head style | 0.997 |
| role arrow | 0.997 |
| head arrow | 0.997 |
| lexical order head arrow | 0.997 |
| lexical bag head arrow | 1.000 |
| role edge | 0.997 |
| head edge | 0.997 |
| lexical order head edge | 0.977 |
| lexical bag head edge | 1.000 |
| role pairing | 0.997 |
| head pairing | 0.997 |
| lexical order head pairing | 0.957 |
| lexical bag head pairing | 1.000 |
| role superlative | 0.997 |
| head superlative | 0.997 |
| lexical order head superlative | 0.923 |
| lexical bag head superlative | 0.997 |
| role comparison | 0.990 |
| head comparison | 0.990 |
| lexical order head comparison | 0.990 |
| lexical bag head comparison | 1.000 |
| role members | 0.653 |
| head members | 0.653 |
| lexical order head members | 0.920 |
| lexical bag head members | 0.917 |
| role targets | 0.857 |
| head targets | 0.857 |
| lexical order head targets | 0.963 |
| lexical bag head targets | 0.957 |
| heads FULL (model) | 0.513 |
| heads FULL (lexical order baseline) | 0.230 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.747 |
| presence object: absent read absent | 0.940 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.991 |
| presence pairing: present read present | 0.923 |
| presence pairing: share of 'present' readings that abstain | 0.083 |
| presence pairing: share of true 'present' readings that abstain | 0.083 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 1.000 |
| presence members: share of true 'present' readings that abstain | 1.000 |
| presence targets: share of 'present' readings that abstain | 1.000 |
| presence targets: share of FALSE 'present' readings that abstain | 1.000 |
| set members: first gold member in the decoded set | 0.958 |
| occupancy: unknown filler | 0.943 |
| presence superlative: present read present | 0.957 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence target: share of 'present' readings that abstain | 0.308 |
| presence target: share of FALSE 'present' readings that abstain | 0.550 |
| presence name: share of 'present' readings that abstain | 0.357 |
| presence name: share of true 'present' readings that abstain | 0.357 |
| presence text: present read present | 1.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.800 |
| presence landmark2: share of true 'present' readings that abstain | 0.800 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.078 |
| presence color: share of true 'present' readings that abstain | 0.080 |
| presence members: share of FALSE 'present' readings that abstain | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence region: present read present | 0.947 |
| presence region: share of 'present' readings that abstain | 0.091 |
| presence region: share of true 'present' readings that abstain | 0.111 |
| presence source: present read present | 0.871 |
| presence source: share of 'present' readings that abstain | 0.441 |
| presence source: share of true 'present' readings that abstain | 0.296 |
| presence target: present read present | 0.905 |
| presence target: share of true 'present' readings that abstain | 0.053 |
| presence style: share of 'present' readings that abstain | 0.250 |
| presence style: share of FALSE 'present' readings that abstain | 0.750 |
| presence landmark: share of FALSE 'present' readings that abstain | 1.000 |
| presence source: share of FALSE 'present' readings that abstain | 1.000 |
| presence targets: present read present | 1.000 |
| presence targets: share of true 'present' readings that abstain | 1.000 |
| set targets: first gold member in the decoded set | 0.909 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.042 |
| presence shape: share of true 'present' readings that abstain | 0.042 |
| presence style: present read present | 1.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 0.857 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.233; status {'ok': 131, 'abstain': 149, 'no-sense': 6, 'unknown-event': 14}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.870 | 0.418 / 0.093 | 0.93 | 0.077 | 0.017 / 0.053 |
| role object | 0.902 | 0.243 / 0.064 | 0.91 | 0.073 | 0.062 / 0.026 |
| roles (pooled) | 0.837 | 0.180 / 0.000 | 0.80 | 0.028 | 0.069 / 0.136 |
| role size | 0.936 | 0.211 / 0.109 | 0.94 | 0.021 | 0.021 / 0.043 |
| role name | 0.875 | 0.085 / 0.007 | 0.56 | 0.000 | 0.312 / 0.125 |
| role relation | 0.886 | 0.194 / 0.040 | 0.89 | 0.000 | 0.000 / 0.114 |
| role landmark | 0.915 | 0.105 / 0.022 | 0.85 | 0.000 | 0.064 / 0.085 |
| role pairing | 0.923 | 0.215 / 0.044 | 0.85 | 0.000 | 0.077 / 0.077 |
| role members | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role superlative | 0.957 | 0.379 / 0.304 | 0.96 | 0.000 | 0.000 / 0.043 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role text | 1.000 | 0.132 / 0.095 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.029 / 0.015 | 0.20 | 0.000 | 0.800 / 0.000 |
| role comparison | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role color | 0.893 | 0.169 / 0.007 | 0.84 | 0.018 | 0.071 / 0.089 |
| role region | 0.857 | 0.258 / 0.021 | 0.81 | 0.048 | 0.095 / 0.095 |
| role source | 0.818 | 0.064 / 0.000 | 0.58 | 0.000 | 0.242 / 0.182 |
| role target | 0.864 | 0.126 / 0.005 | 0.82 | 0.000 | 0.045 / 0.136 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role targets | 0.000 | 0.001 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role shape | 1.000 | 0.182 / 0.149 | 0.96 | 0.000 | 0.042 / 0.000 |
| role style | 1.000 | 0.187 / 0.148 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 0.857 | 0.147 / 0.085 | 0.86 | 0.000 | 0.000 / 0.143 |
| role axis | 1.000 | 0.102 / 0.102 | 1.00 | 0.000 | 0.000 / 0.000 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role layout | 1.000 | 0.175 / 0.139 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
NAME=0.77 SUPER=0.76 COLOR=0.74 POS=0.52 DIR=0.45 VERB=0.44 AXIS=0.33 last=0.31 LAYOUT=0.29 that=0.28 in=0.28 NUM=0.26 SHAPE=0.23 them=0.22 there=0.21 line=0.20 SIZE=0.19 are=0.18 with=0.18 have=0.17 now=0.14 arrow=0.14 it=0.14 reached=0.12 NOTCOLOR=0.12 TEXT=0.12 the=0.12 PAIR=0.11 unknown=0.11 other=0.10 me=0.09 RECENT=0.09 i=0.08 can=0.08 ARROW=0.07 at=0.07 be=0.07 called=0.06 STYLE=0.06 on=0.05 does=0.05 lines=0.05 then=0.05 has=0.05 put=0.05 QUANT=0.05 what=0.04 of=0.04 and=0.04 who=0.04 to=0.04 named=0.03 from=0.03 one=0.03 labeled=0.03 shape=0.03 a=0.01

## What is weak, what to add
- heldout_sentences: FULL 0.444
- heldout_sentences: set members: exact 0.675
- heldout_sentences: set targets: exact 0.872
- heldout_sentences: predicate (surface lemma) 0.880
- heldout_sentences: event type (synonym table) 0.880
- heldout_sentences: occupancy: known filler 0.827
- heldout_sentences: occupancy: unknown filler 0.800
- heldout_sentences: role target 0.880
- heldout_sentences: head target 0.880
- heldout_sentences: role members 0.675
- heldout_sentences: head members 0.675
- heldout_sentences: role targets 0.872
- heldout_sentences: head targets 0.872
- heldout_sentences: heads FULL (model) 0.479
- heldout_sentences: heads FULL (lexical order baseline) 0.205
- heldout_sentences: heads FULL (lexical bag baseline, trained on the same training rows) 0.470
- heldout_sentences: FULL [depth given] 0.444
- heldout_sentences: FULL [depth and negation given] 0.444
- heldout_sentences: FULL [pooled midpoint (comparison)] 0.410
- heldout_sentences: role object [pooled midpoint (comparison)] 0.684
- heldout_sentences: role members [pooled midpoint (comparison)] 0.897
- heldout_sentences: role targets [pooled midpoint (comparison)] 0.872
- heldout_sentences: heads FULL (model) [pooled midpoint (comparison)] 0.453
- heldout_sentences: presence object: share of 'present' readings that abstain 0.088
- heldout_sentences: presence object: share of true 'present' readings that abstain 0.088
- heldout_sentences: presence color: share of 'present' readings that abstain 0.211
- heldout_sentences: presence color: share of true 'present' readings that abstain 0.167
- heldout_sentences: presence members: absent read absent 0.724
- heldout_sentences: presence object: present read present [pooled midpoint (comparison)] 0.587
- heldout_sentences: presence color: present read present [pooled midpoint (comparison)] 0.667
- heldout_sentences: presence targets: absent read absent [pooled midpoint (comparison)] 0.897
- heldout_sentences: presence source: share of 'present' readings that abstain 0.750
- heldout_sentences: presence target: share of 'present' readings that abstain 0.462
- heldout_sentences: presence target: share of FALSE 'present' readings that abstain 0.600
- heldout_sentences: set members: first gold member in the decoded set 0.727
- heldout_sentences: presence relation: share of 'present' readings that abstain 0.083
- heldout_sentences: presence relation: share of true 'present' readings that abstain 0.083
- heldout_sentences: presence landmark: present read present 0.688
- heldout_sentences: presence landmark: share of 'present' readings that abstain 0.154
- heldout_sentences: presence landmark: share of true 'present' readings that abstain 0.091
- heldout_sentences: presence shape: share of 'present' readings that abstain 0.000
- heldout_sentences: presence shape: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence size: share of 'present' readings that abstain 0.000
- heldout_sentences: presence size: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence text: share of 'present' readings that abstain 0.250
- heldout_sentences: presence text: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence landmark: share of FALSE 'present' readings that abstain 0.500
- heldout_sentences: presence name: present read present 0.750
- heldout_sentences: presence name: share of 'present' readings that abstain 0.333
- heldout_sentences: presence name: share of true 'present' readings that abstain 0.333
- heldout_sentences: presence name: present read present [pooled midpoint (comparison)] 0.750
- heldout_sentences: presence region: share of 'present' readings that abstain 0.000
- heldout_sentences: presence region: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: present read present 0.667
- heldout_sentences: presence pairing: share of 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: present read present [pooled midpoint (comparison)] 0.667
- heldout_sentences: presence source: share of true 'present' readings that abstain 0.667
- heldout_sentences: presence target: present read present 0.750
- heldout_sentences: presence target: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence style: share of 'present' readings that abstain 0.250
- heldout_sentences: presence target: present read present [pooled midpoint (comparison)] 0.750
- heldout_sentences: set targets: first gold member in the decoded set 0.800
- heldout_sentences: presence style: present read present 0.750
- heldout_sentences: presence style: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence style: present read present [pooled midpoint (comparison)] 0.750
- heldout_sentences: presence region: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence landmark2: present read present 0.000
- heldout_sentences: presence superlative: share of 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence text: share of FALSE 'present' readings that abstain 0.500
- heldout_sentences: presence edge: present read present 0.000
- heldout_sentences: presence edge: present read present [pooled midpoint (comparison)] 0.500
- heldout_sentences: presence axis: present read present 0.500
- heldout_sentences: presence axis: share of 'present' readings that abstain 0.000
- heldout_sentences: presence axis: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence axis: present read present [pooled midpoint (comparison)] 0.500
- heldout_sentences: presence layout: share of 'present' readings that abstain 0.000
- heldout_sentences: presence layout: share of true 'present' readings that abstain 0.000
- train (sample): FULL 0.473
- train (sample): presence object: share of 'present' readings that abstain 0.066
- train (sample): presence object: share of true 'present' readings that abstain 0.068
- train (sample): presence size: share of 'present' readings that abstain 0.023
- train (sample): presence size: share of true 'present' readings that abstain 0.023
- train (sample): presence name: present read present 0.875
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.111
- train (sample): presence landmark: share of true 'present' readings that abstain 0.070
- train (sample): presence members: absent read absent 0.689
- train (sample): presence targets: absent read absent 0.881
- train (sample): set members: exact 0.653
- train (sample): set targets: exact 0.857
- train (sample): predicate (surface lemma) 0.870
- train (sample): event type (synonym table) 0.870
- train (sample): occupancy: known filler 0.893
- train (sample): role members 0.653
- train (sample): head members 0.653
- train (sample): role targets 0.857
- train (sample): head targets 0.857
- train (sample): heads FULL (model) 0.513
- train (sample): heads FULL (lexical order baseline) 0.230
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.747
- train (sample): FULL [depth given] 0.473
- train (sample): FULL [depth and negation given] 0.473
- train (sample): presence pairing: share of 'present' readings that abstain 0.083
- train (sample): presence pairing: share of true 'present' readings that abstain 0.083
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of 'present' readings that abstain 0.308
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.550
- train (sample): presence name: share of 'present' readings that abstain 0.357
- train (sample): presence name: share of true 'present' readings that abstain 0.357
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.800
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.800
- train (sample): presence color: share of 'present' readings that abstain 0.078
- train (sample): presence color: share of true 'present' readings that abstain 0.080
- train (sample): presence region: share of 'present' readings that abstain 0.091
- train (sample): presence region: share of true 'present' readings that abstain 0.111
- train (sample): presence source: present read present 0.871
- train (sample): presence source: share of 'present' readings that abstain 0.441
- train (sample): presence source: share of true 'present' readings that abstain 0.296
- train (sample): presence target: share of true 'present' readings that abstain 0.053
- train (sample): presence style: share of 'present' readings that abstain 0.250
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.750
- train (sample): presence shape: share of 'present' readings that abstain 0.042
- train (sample): presence shape: share of true 'present' readings that abstain 0.042
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: present read present 0.857
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence color: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_sentences: `make the NAME to a SIZE COLOR SHAPE` FULL 0.000 (n 4)
- heldout_sentences: `draw a SIZE COLOR SHAPE named NAME POS the NAME` FULL 0.000 (n 2)
- heldout_sentences: `connect NAME , NAME and NAME in a PAIR` FULL 0.000 (n 2)
- heldout_sentences: `connect NAME to NAME and NAME with STYLE lines` FULL 0.000 (n 2)
- heldout_sentences: `make the NAME a SIZE COLOR SHAPE` FULL 0.000 (n 2)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_sentences | object | product: fitted | 0.986 | 1.000 | 0.993 | 0.088 (— / 0.088) |
| heldout_sentences | object | comparison: pooled midpoint | 0.587 | 1.000 | 0.794 |  |
| heldout_sentences | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | shape | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | color | product: fitted | 1.000 | 0.989 | 0.994 | 0.211 (1.000 / 0.167) |
| heldout_sentences | color | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_sentences | size | product: fitted | 0.938 | 1.000 | 0.969 | 0.000 (— / 0.000) |
| heldout_sentences | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | name | product: fitted | 0.750 | 1.000 | 0.875 | 0.333 (— / 0.333) |
| heldout_sentences | name | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_sentences | text | product: fitted | 1.000 | 0.981 | 0.991 | 0.250 (0.500 / 0.000) |
| heldout_sentences | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | relation | product: fitted | 0.923 | 1.000 | 0.962 | 0.083 (— / 0.083) |
| heldout_sentences | relation | comparison: pooled midpoint | 0.900 | 1.000 | 0.950 |  |
| heldout_sentences | landmark | product: fitted | 0.688 | 0.978 | 0.833 | 0.154 (0.500 / 0.091) |
| heldout_sentences | landmark | comparison: pooled midpoint | 0.917 | 0.978 | 0.947 |  |
| heldout_sentences | landmark2 | product: fitted | 0.000 | 0.991 | 0.495 | 1.000 (1.000 / —) |
| heldout_sentences | landmark2 | comparison: pooled midpoint | — | 0.980 | — |  |
| heldout_sentences | region | product: fitted | 1.000 | 0.990 | 0.995 | 0.000 (0.000 / 0.000) |
| heldout_sentences | region | comparison: pooled midpoint | 1.000 | 0.979 | 0.989 |  |
| heldout_sentences | axis | product: fitted | 0.500 | 1.000 | 0.750 | 0.000 (— / 0.000) |
| heldout_sentences | axis | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_sentences | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | layout | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | source | product: fitted | 0.900 | 0.969 | 0.935 | 0.750 (1.000 / 0.667) |
| heldout_sentences | source | comparison: pooled midpoint | 0.900 | 0.978 | 0.939 |  |
| heldout_sentences | target | product: fitted | 0.750 | 0.904 | 0.827 | 0.462 (0.600 / 0.000) |
| heldout_sentences | target | comparison: pooled midpoint | 0.750 | 0.929 | 0.839 |  |
| heldout_sentences | style | product: fitted | 0.750 | 0.990 | 0.870 | 0.250 (1.000 / 0.000) |
| heldout_sentences | style | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_sentences | edge | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | edge | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_sentences | pairing | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_sentences | pairing | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_sentences | superlative | product: fitted | 0.933 | 1.000 | 0.967 | 0.000 (— / 0.000) |
| heldout_sentences | superlative | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_sentences | members | product: fitted | 1.000 | 0.724 | 0.862 | 1.000 (1.000 / 1.000) |
| heldout_sentences | members | comparison: pooled midpoint | 1.000 | 0.989 | 0.995 |  |
| heldout_sentences | targets | product: fitted | 1.000 | 0.903 | 0.951 | 1.000 (1.000 / 1.000) |
| heldout_sentences | targets | comparison: pooled midpoint | 1.000 | 0.897 | 0.948 |  |
| train (sample) | object | product: fitted | 0.983 | 0.940 | 0.962 | 0.066 (0.000 / 0.068) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.042 (— / 0.042) |
| train (sample) | color | product: fitted | 1.000 | 0.996 | 0.998 | 0.078 (0.000 / 0.080) |
| train (sample) | size | product: fitted | 0.978 | 1.000 | 0.989 | 0.023 (— / 0.023) |
| train (sample) | name | product: fitted | 0.875 | 1.000 | 0.938 | 0.357 (— / 0.357) |
| train (sample) | text | product: fitted | 1.000 | 0.996 | 0.998 | 0.000 (0.000 / 0.000) |
| train (sample) | relation | product: fitted | 0.912 | 1.000 | 0.956 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.935 | 0.991 | 0.963 | 0.111 (1.000 / 0.070) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.800 (— / 0.800) |
| train (sample) | region | product: fitted | 0.947 | 0.985 | 0.966 | 0.091 (0.000 / 0.111) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.871 | 0.972 | 0.921 | 0.441 (1.000 / 0.296) |
| train (sample) | target | product: fitted | 0.905 | 0.923 | 0.914 | 0.308 (0.550 / 0.053) |
| train (sample) | style | product: fitted | 1.000 | 0.985 | 0.993 | 0.250 (0.750 / 0.000) |
| train (sample) | edge | product: fitted | 0.857 | 1.000 | 0.929 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 0.923 | 1.000 | 0.962 | 0.083 (— / 0.083) |
| train (sample) | superlative | product: fitted | 0.957 | 1.000 | 0.978 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.689 | 0.844 | 1.000 (1.000 / 1.000) |
| train (sample) | targets | product: fitted | 1.000 | 0.881 | 0.941 | 1.000 (1.000 / 1.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
