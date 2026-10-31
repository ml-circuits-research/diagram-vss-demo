# REPORT — world `real`, legend sha256:12cf77be5d58… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4282 annotated sentences from 2 files; provenance: {'llm': 4282}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/ep8_p80_D1024_e8_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 210 sentences
- heldout_formulations: 172 sentences
- train: 3900 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
24217 tokens in the examples; 1026 with no kind in the lexicon (share 0.042), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 8, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 8e43320. Memory curve: runs/ep8_p80_D1024_e8_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.130 [rule: fit; pooled midpoint 0.388 (comparison)] (present 0.776, n 170 / absent 0.001, n 654438)
- set_member:targets: threshold 0.147 [rule: fit; pooled midpoint 0.157 (comparison)] (present 0.314, n 45 / absent -0.001, n 196739)
- presence:object: threshold 0.168 [rule: fit; pooled midpoint 0.669 (comparison)] (present 1.263, n 353 / absent 0.076, n 257)
- presence:shape: threshold 0.044 [rule: fit; pooled midpoint 0.448 (comparison)] (present 0.891, n 57 / absent 0.006, n 553)
- presence:color: threshold 0.149 [rule: fit; pooled midpoint 0.469 (comparison)] (present 0.929, n 108 / absent 0.008, n 502)
- presence:size: threshold 0.269 [rule: fit; pooled midpoint 0.405 (comparison)] (present 0.794, n 85 / absent 0.015, n 525)
- presence:name: threshold 0.291 [rule: fit; pooled midpoint 0.285 (comparison)] (present 0.567, n 17 / absent 0.003, n 593)
- presence:text: threshold 0.075 [rule: fit; pooled midpoint 0.322 (comparison)] (present 0.660, n 26 / absent -0.015, n 584)
- presence:relation: threshold 0.091 [rule: fit; pooled midpoint 0.455 (comparison)] (present 0.923, n 77 / absent -0.014, n 533)
- presence:landmark: threshold 0.127 [rule: fit; pooled midpoint 0.495 (comparison)] (present 0.959, n 108 / absent 0.031, n 502)
- presence:landmark2: threshold 0.284 [rule: fit; pooled midpoint 0.233 (comparison)] (present 0.459, n 8 / absent 0.006, n 602)
- presence:region: threshold 0.155 [rule: fit; pooled midpoint 0.302 (comparison)] (present 0.576, n 28 / absent 0.029, n 582)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 607)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 606)
- presence:quantity: threshold 0.108 [rule: fit; pooled midpoint 0.232 (comparison)] (present 0.463, n 8 / absent -0.000, n 602)
- presence:axis: threshold 0.289 [rule: fit; pooled midpoint 0.390 (comparison)] (present 0.780, n 9 / absent -0.001, n 601)
- presence:layout: threshold 0.322 [rule: fit; pooled midpoint 0.458 (comparison)] (present 0.916, n 12 / absent 0.000, n 598)
- presence:source: threshold 0.263 [rule: fit; pooled midpoint 0.356 (comparison)] (present 0.698, n 82 / absent 0.014, n 528)
- presence:target: threshold 0.294 [rule: fit; pooled midpoint 0.657 (comparison)] (present 1.289, n 58 / absent 0.025, n 552)
- presence:style: threshold 0.156 [rule: fit; pooled midpoint 0.351 (comparison)] (present 0.690, n 20 / absent 0.013, n 590)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 607)
- presence:edge: threshold 0.336 [rule: fit; pooled midpoint 0.429 (comparison)] (present 0.861, n 14 / absent -0.003, n 596)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 14)
- presence:pairing: threshold 0.515 [rule: fit; pooled midpoint 0.534 (comparison)] (present 1.063, n 35 / absent 0.005, n 575)
- presence:superlative: threshold 0.170 [rule: fit; pooled midpoint 0.438 (comparison)] (present 0.876, n 62 / absent -0.000, n 548)
- presence:comparison: threshold 0.288 [rule: fit; pooled midpoint 0.343 (comparison)] (present 0.687, n 5 / absent -0.001, n 605)
- presence:members: threshold 0.398 [rule: fit; pooled midpoint 0.624 (comparison)] (present 1.104, n 62 / absent 0.144, n 548)
- presence:targets: threshold 0.284 [rule: fit; pooled midpoint 0.240 (comparison)] (present 0.433, n 23 / absent 0.047, n 587)
- attr_presence:object: threshold 0.260 [rule: fit; pooled midpoint 0.403 (comparison)] (present 0.697, n 28 / absent 0.109, n 318)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 343)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.059, quantity 0.059, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 172 of 172)
| axis | accuracy |
|---|---|
| FULL | 0.669 |
| FULL [depth given] | 0.669 |
| FULL [depth and negation given] | 0.669 |
| FULL [presence not decided] | 0.645 |
| FULL [pooled midpoint (comparison)] | 0.506 |
| presence object: present read present | 0.922 |
| presence object: share of 'present' readings that abstain | 0.091 |
| presence object: share of true 'present' readings that abstain | 0.084 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.984 |
| presence landmark2: absent read absent | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.979 |
| presence target: absent read absent | 0.972 |
| presence style: absent read absent | 0.981 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.965 |
| presence targets: absent read absent | 0.987 |
| structure (depth, negation) | 0.913 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.948 |
| set targets: exact | 0.977 |
| predicate (surface lemma) | 0.878 |
| event type (synonym table) | 0.878 |
| role object | 0.831 |
| head object | 0.866 |
| lexical order head object | 0.762 |
| lexical bag head object | 0.785 |
| occupancy: unknown filler | 0.859 |
| role shape | 0.988 |
| head shape | 0.988 |
| lexical order head shape | 0.907 |
| lexical bag head shape | 0.988 |
| occupancy: not given | 0.994 |
| role color | 0.930 |
| head color | 0.930 |
| lexical order head color | 0.779 |
| lexical bag head color | 0.965 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.884 |
| lexical bag head size | 0.983 |
| role name | 1.000 |
| head name | 1.000 |
| lexical order head name | 0.988 |
| lexical bag head name | 1.000 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.977 |
| lexical bag head text | 0.988 |
| role relation | 0.983 |
| head relation | 0.983 |
| lexical order head relation | 0.866 |
| lexical bag head relation | 0.953 |
| role landmark | 0.977 |
| head landmark | 0.977 |
| lexical order head landmark | 0.820 |
| lexical bag head landmark | 0.866 |
| role landmark2 | 0.994 |
| head landmark2 | 0.994 |
| lexical order head landmark2 | 0.994 |
| lexical bag head landmark2 | 0.988 |
| role region | 0.988 |
| head region | 0.988 |
| lexical order head region | 0.942 |
| lexical bag head region | 0.965 |
| occupancy: known filler | 0.843 |
| role direction | 1.000 |
| head direction | 1.000 |
| lexical order head direction | 1.000 |
| lexical bag head direction | 1.000 |
| role amount | 1.000 |
| head amount | 1.000 |
| lexical order head amount | 1.000 |
| lexical bag head amount | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.988 |
| lexical bag head quantity | 1.000 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.994 |
| lexical bag head axis | 1.000 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 0.983 |
| lexical bag head layout | 0.994 |
| role source | 0.959 |
| head source | 0.959 |
| lexical order head source | 0.901 |
| lexical bag head source | 0.913 |
| role target | 0.942 |
| head target | 0.942 |
| lexical order head target | 0.913 |
| lexical bag head target | 0.948 |
| role style | 0.983 |
| head style | 0.983 |
| lexical order head style | 0.983 |
| lexical bag head style | 0.983 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 1.000 |
| lexical bag head arrow | 1.000 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.988 |
| lexical bag head edge | 0.988 |
| role pairing | 1.000 |
| head pairing | 1.000 |
| lexical order head pairing | 0.965 |
| lexical bag head pairing | 0.988 |
| role superlative | 1.000 |
| head superlative | 1.000 |
| lexical order head superlative | 0.919 |
| lexical bag head superlative | 0.965 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.983 |
| lexical bag head comparison | 1.000 |
| role members | 0.948 |
| head members | 0.948 |
| lexical order head members | 0.913 |
| lexical bag head members | 0.913 |
| role targets | 0.977 |
| head targets | 0.977 |
| lexical order head targets | 0.965 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.721 |
| heads FULL (lexical order baseline) | 0.209 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.465 |
| role object [presence not decided] | 0.849 |
| role shape [presence not decided] | 0.988 |
| role color [presence not decided] | 0.959 |
| role size [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 0.919 |
| role relation [presence not decided] | 0.988 |
| role landmark [presence not decided] | 0.988 |
| role landmark2 [presence not decided] | 0.994 |
| role region [presence not decided] | 0.988 |
| role direction [presence not decided] | 0.977 |
| role amount [presence not decided] | 1.000 |
| role quantity [presence not decided] | 1.000 |
| role axis [presence not decided] | 1.000 |
| role layout [presence not decided] | 1.000 |
| role source [presence not decided] | 0.924 |
| role target [presence not decided] | 0.907 |
| role style [presence not decided] | 0.983 |
| role arrow [presence not decided] | 1.000 |
| role edge [presence not decided] | 0.988 |
| role pairing [presence not decided] | 1.000 |
| role superlative [presence not decided] | 1.000 |
| role comparison [presence not decided] | 1.000 |
| role members [presence not decided] | 0.901 |
| role targets [presence not decided] | 0.936 |
| heads FULL (model) [presence not decided] | 0.698 |
| role object [pooled midpoint (comparison)] | 0.692 |
| role shape [pooled midpoint (comparison)] | 0.988 |
| role color [pooled midpoint (comparison)] | 0.919 |
| role size [pooled midpoint (comparison)] | 1.000 |
| role name [pooled midpoint (comparison)] | 1.000 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.953 |
| role landmark [pooled midpoint (comparison)] | 0.953 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.988 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 0.994 |
| role axis [pooled midpoint (comparison)] | 1.000 |
| role layout [pooled midpoint (comparison)] | 0.994 |
| role source [pooled midpoint (comparison)] | 0.948 |
| role target [pooled midpoint (comparison)] | 0.942 |
| role style [pooled midpoint (comparison)] | 0.994 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 0.994 |
| role superlative [pooled midpoint (comparison)] | 0.994 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.901 |
| role targets [pooled midpoint (comparison)] | 0.959 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.535 |
| presence object: present read present [pooled midpoint (comparison)] | 0.657 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: present read present [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 0.978 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.966 |
| presence landmark: present read present | 0.967 |
| presence landmark: share of 'present' readings that abstain | 0.129 |
| presence landmark: share of true 'present' readings that abstain | 0.069 |
| presence region: absent read absent | 0.993 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.852 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence comparison: present read present [pooled midpoint (comparison)] | 1.000 |
| presence shape: present read present | 0.933 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 0.812 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.933 |
| presence color: present read present [pooled midpoint (comparison)] | 0.750 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.909 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.789 |
| presence object: absent read absent | 0.926 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.981 |
| presence source: present read present | 0.875 |
| presence source: share of 'present' readings that abstain | 0.235 |
| presence source: share of true 'present' readings that abstain | 0.143 |
| presence members: share of 'present' readings that abstain | 0.278 |
| presence members: share of FALSE 'present' readings that abstain | 0.400 |
| presence targets: present read present | 0.667 |
| presence targets: share of 'present' readings that abstain | 0.667 |
| presence targets: share of true 'present' readings that abstain | 0.750 |
| set targets: first gold member in the decoded set | 0.667 |
| presence source: present read present [pooled midpoint (comparison)] | 0.733 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.833 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence target: present read present | 0.600 |
| presence target: share of 'present' readings that abstain | 0.231 |
| presence target: share of true 'present' readings that abstain | 0.111 |
| presence style: share of 'present' readings that abstain | 0.333 |
| presence style: share of FALSE 'present' readings that abstain | 0.667 |
| presence target: present read present [pooled midpoint (comparison)] | 0.357 |
| presence landmark2: present read present | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 0.231 |
| set members: first gold member in the decoded set | 0.867 |
| presence layout: present read present [pooled midpoint (comparison)] | 0.667 |
| presence members: present read present [pooled midpoint (comparison)] | 0.538 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.333 |
| presence pairing: share of true 'present' readings that abstain | 0.333 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.833 |
| presence style: present read present | 1.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.667 |
| presence targets: share of FALSE 'present' readings that abstain | 0.500 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present [pooled midpoint (comparison)] | 1.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.500 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.929 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 0.500 |
| presence object: share of FALSE 'present' readings that abstain | 0.250 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.235; status {'ok': 127, 'abstain': 30, 'no-sense': 3, 'unknown-event': 12}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.878 | 0.415 / 0.085 | 0.91 | 0.041 | 0.006 / 0.081 |
| role object | 0.781 | 0.283 / 0.001 | 0.83 | 0.123 | 0.070 / 0.096 |
| roles (pooled) | 0.821 | 0.241 / 0.000 | 0.82 | 0.049 | 0.052 / 0.130 |
| role region | 0.900 | 0.335 / 0.213 | 0.90 | 0.000 | 0.000 / 0.100 |
| role landmark | 0.935 | 0.209 / 0.013 | 0.87 | 0.000 | 0.065 / 0.065 |
| role comparison | 1.000 | 0.287 / 0.251 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 0.875 | 0.268 / 0.222 | 0.94 | 0.062 | 0.000 / 0.062 |
| role color | 0.684 | 0.211 / 0.000 | 0.71 | 0.026 | 0.000 / 0.289 |
| role size | 1.000 | 0.320 / 0.277 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.228 / 0.191 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.870 | 0.228 / 0.011 | 0.87 | 0.000 | 0.000 / 0.130 |
| role source | 0.765 | 0.102 / 0.000 | 0.71 | 0.000 | 0.059 / 0.235 |
| role targets | 0.667 | 0.023 / 0.000 | 0.17 | 0.000 | 0.500 / 0.333 |
| role target | 0.600 | 0.097 / 0.000 | 0.53 | 0.000 | 0.067 / 0.400 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role layout | 1.000 | 0.311 / 0.104 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.733 | 0.077 / 0.013 | 0.73 | 0.067 | 0.067 / 0.200 |
| role pairing | 1.000 | 0.180 / 0.026 | 0.67 | 0.000 | 0.333 / 0.000 |
| role style | 1.000 | 0.295 / 0.289 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.355 / 0.355 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.279 / 0.279 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 1.000 | 0.473 / 0.401 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.149 / 0.115 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 1.000 | 0.192 / 0.106 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3900)
| axis | accuracy |
|---|---|
| FULL | 0.743 |
| FULL [depth given] | 0.743 |
| FULL [depth and negation given] | 0.743 |
| presence object: present read present | 0.957 |
| presence object: share of 'present' readings that abstain | 0.072 |
| presence object: share of true 'present' readings that abstain | 0.062 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.996 |
| presence size: absent read absent | 0.992 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 0.996 |
| presence relation: present read present | 0.923 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.968 |
| presence landmark: share of 'present' readings that abstain | 0.078 |
| presence landmark: share of true 'present' readings that abstain | 0.033 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.993 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.969 |
| presence target: absent read absent | 0.981 |
| presence style: absent read absent | 0.982 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.989 |
| presence targets: absent read absent | 0.986 |
| structure (depth, negation) | 0.967 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.977 |
| set targets: exact | 0.987 |
| predicate (surface lemma) | 0.920 |
| event type (synonym table) | 0.920 |
| role object | 0.893 |
| head object | 0.923 |
| lexical order head object | 0.770 |
| lexical bag head object | 0.900 |
| occupancy: known filler | 0.903 |
| role shape | 0.990 |
| head shape | 0.990 |
| lexical order head shape | 0.900 |
| lexical bag head shape | 0.993 |
| occupancy: not given | 0.994 |
| role color | 0.970 |
| head color | 0.970 |
| lexical order head color | 0.837 |
| lexical bag head color | 0.993 |
| role size | 0.990 |
| head size | 0.990 |
| lexical order head size | 0.827 |
| lexical bag head size | 0.977 |
| role name | 1.000 |
| head name | 1.000 |
| lexical order head name | 0.937 |
| lexical bag head name | 1.000 |
| role text | 0.993 |
| head text | 0.993 |
| lexical order head text | 0.953 |
| lexical bag head text | 0.997 |
| role relation | 0.987 |
| head relation | 0.987 |
| lexical order head relation | 0.827 |
| lexical bag head relation | 0.973 |
| role landmark | 0.977 |
| head landmark | 0.977 |
| lexical order head landmark | 0.790 |
| lexical bag head landmark | 0.963 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.980 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.987 |
| head region | 0.987 |
| lexical order head region | 0.940 |
| lexical bag head region | 0.967 |
| role direction | 0.990 |
| head direction | 0.990 |
| lexical order head direction | 0.990 |
| lexical bag head direction | 1.000 |
| role amount | 0.990 |
| head amount | 0.990 |
| lexical order head amount | 0.990 |
| lexical bag head amount | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.987 |
| lexical bag head quantity | 1.000 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.993 |
| lexical bag head axis | 1.000 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 0.980 |
| lexical bag head layout | 1.000 |
| role source | 0.953 |
| head source | 0.953 |
| lexical order head source | 0.907 |
| lexical bag head source | 0.977 |
| role target | 0.967 |
| head target | 0.967 |
| lexical order head target | 0.933 |
| lexical bag head target | 0.990 |
| role style | 0.980 |
| head style | 0.980 |
| lexical order head style | 0.977 |
| lexical bag head style | 0.987 |
| role arrow | 0.993 |
| head arrow | 0.993 |
| lexical order head arrow | 0.993 |
| lexical bag head arrow | 0.997 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.983 |
| lexical bag head edge | 0.993 |
| role pairing | 1.000 |
| head pairing | 1.000 |
| lexical order head pairing | 0.943 |
| lexical bag head pairing | 0.993 |
| role superlative | 0.997 |
| head superlative | 0.997 |
| lexical order head superlative | 0.900 |
| lexical bag head superlative | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.997 |
| lexical bag head comparison | 1.000 |
| role members | 0.977 |
| head members | 0.977 |
| lexical order head members | 0.910 |
| lexical bag head members | 0.910 |
| role targets | 0.983 |
| head targets | 0.983 |
| lexical order head targets | 0.970 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.793 |
| heads FULL (lexical order baseline) | 0.167 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.693 |
| presence shape: present read present | 0.964 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.982 |
| presence color: present read present | 0.932 |
| presence color: share of 'present' readings that abstain | 0.048 |
| presence color: share of true 'present' readings that abstain | 0.024 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.250 |
| presence quantity: share of true 'present' readings that abstain | 0.250 |
| presence object: absent read absent | 0.962 |
| presence source: present read present | 0.786 |
| presence source: share of 'present' readings that abstain | 0.300 |
| presence source: share of true 'present' readings that abstain | 0.182 |
| presence target: present read present | 0.750 |
| presence target: share of 'present' readings that abstain | 0.250 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.059 |
| presence pairing: share of true 'present' readings that abstain | 0.059 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.167 |
| presence members: share of true 'present' readings that abstain | 0.148 |
| set members: first gold member in the decoded set | 1.000 |
| occupancy: unknown filler | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.071 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 0.857 |
| presence style: share of 'present' readings that abstain | 0.091 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.833 |
| presence landmark2: share of true 'present' readings that abstain | 0.833 |
| presence style: share of FALSE 'present' readings that abstain | 0.200 |
| presence source: share of FALSE 'present' readings that abstain | 0.625 |
| presence superlative: present read present | 0.967 |
| presence superlative: share of 'present' readings that abstain | 0.069 |
| presence superlative: share of true 'present' readings that abstain | 0.069 |
| presence members: share of FALSE 'present' readings that abstain | 0.333 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 1.000 |
| presence targets: present read present | 1.000 |
| presence targets: share of 'present' readings that abstain | 0.462 |
| presence targets: share of true 'present' readings that abstain | 0.444 |
| set targets: first gold member in the decoded set | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.500 |
| presence targets: share of FALSE 'present' readings that abstain | 0.500 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence text: share of FALSE 'present' readings that abstain | 1.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.750 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence color: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.164; status {'ok': 233, 'abstain': 57, 'unknown-event': 10}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.920 | 0.443 / 0.292 | 0.94 | 0.020 | 0.000 / 0.060 |
| role object | 0.856 | 0.306 / 0.034 | 0.89 | 0.087 | 0.051 / 0.056 |
| roles (pooled) | 0.885 | 0.258 / 0.021 | 0.87 | 0.032 | 0.048 / 0.083 |
| role relation | 0.923 | 0.240 / 0.062 | 0.92 | 0.000 | 0.000 / 0.077 |
| role landmark | 0.952 | 0.236 / 0.080 | 0.92 | 0.000 | 0.032 / 0.048 |
| role shape | 0.900 | 0.263 / 0.089 | 0.90 | 0.000 | 0.000 / 0.100 |
| role size | 0.981 | 0.283 / 0.181 | 0.98 | 0.000 | 0.000 / 0.019 |
| role color | 0.837 | 0.257 / 0.000 | 0.84 | 0.020 | 0.020 / 0.143 |
| role name | 1.000 | 0.214 / 0.091 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.144 / 0.037 | 0.75 | 0.000 | 0.250 / 0.000 |
| role source | 0.786 | 0.118 / 0.000 | 0.64 | 0.000 | 0.143 / 0.214 |
| role target | 0.750 | 0.154 / 0.000 | 0.75 | 0.000 | 0.000 / 0.250 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role edge | 1.000 | 0.364 / 0.350 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 0.889 | 0.328 / 0.086 | 0.89 | 0.000 | 0.000 / 0.111 |
| role pairing | 1.000 | 0.275 / 0.076 | 0.94 | 0.000 | 0.059 / 0.000 |
| role members | 0.852 | 0.125 / 0.035 | 0.85 | 0.074 | 0.074 / 0.074 |
| role text | 0.929 | 0.226 / 0.172 | 0.93 | 0.000 | 0.000 / 0.071 |
| role style | 0.857 | 0.246 / 0.118 | 0.86 | 0.000 | 0.000 / 0.143 |
| role landmark2 | 1.000 | 0.038 / 0.028 | 0.17 | 0.000 | 0.833 / 0.000 |
| role superlative | 0.967 | 0.428 / 0.055 | 0.90 | 0.000 | 0.067 / 0.033 |
| role layout | 1.000 | 0.377 / 0.281 | 1.00 | 0.000 | 0.000 / 0.000 |
| role targets | 0.889 | 0.070 / 0.010 | 0.56 | 0.111 | 0.444 / 0.000 |
| role comparison | 1.000 | 0.335 / 0.335 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.374 / 0.351 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 SUPER=1.00 COLOR=1.00 LAYOUT=1.00 AXIS=0.99 TEXT=0.99 from=0.99 once=0.99 pixels=0.99 PAIR=0.99 have=0.98 reached=0.98 ARROW=0.97 rules=0.97 STYLE=0.97 too=0.95 directly=0.95 both=0.95 any=0.92 remove=0.91 for=0.90 no=0.90 as=0.89 diagram=0.89 exist=0.87 DIR=0.83 whole=0.82 now=0.78 it=0.78 check=0.75 map=0.74 them=0.74 at=0.74 that=0.73 this=0.73 NUM=0.71 show=0.68 thing=0.68 each=0.67 last=0.66 those=0.64 there=0.61 then=0.61 what's=0.58 VERB=0.58 i=0.58 uh=0.55 are=0.55 shapes=0.54 here=0.53 SIZE=0.52 NAME=0.43 what=0.41 we=0.38 RECENT=0.34 line=0.33 do=0.33 me=0.24 two=0.20 box=0.20 not=0.17 front=0.16 by=0.14 back=0.13 NOTCOLOR=0.12 in=0.12 can=0.11 an=0.10 new=0.10 three=0.08 four=0.08 arrow=0.07 be=0.06 you=0.06 axis=0.05 evenly=0.04 arrows=0.03 give=0.03 should=0.03 who=0.02 place=0.02 just=0.02 put=0.01 every=0.01 lines=0.01 link=0.01 tell=0.00 has=0.00 does=0.00 if=0.00 goes=0.00 on=0.00 QUANT=0.00 one=0.00 shape=0.00 labeled=0.00 named=0.00 called=0.00 SHAPE=0.00 of=0.00 with=0.00 the=0.00 unknown=0.00 and=0.00 to=0.00 a=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.669
- heldout_formulations: presence object: share of 'present' readings that abstain 0.091
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.084
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: predicate (surface lemma) 0.878
- heldout_formulations: event type (synonym table) 0.878
- heldout_formulations: role object 0.831
- heldout_formulations: head object 0.866
- heldout_formulations: occupancy: unknown filler 0.859
- heldout_formulations: occupancy: known filler 0.843
- heldout_formulations: heads FULL (model) 0.721
- heldout_formulations: heads FULL (lexical order baseline) 0.209
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.465
- heldout_formulations: FULL [depth given] 0.669
- heldout_formulations: FULL [depth and negation given] 0.669
- heldout_formulations: FULL [presence not decided] 0.645
- heldout_formulations: role object [presence not decided] 0.849
- heldout_formulations: heads FULL (model) [presence not decided] 0.698
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.506
- heldout_formulations: role object [pooled midpoint (comparison)] 0.692
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.535
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.657
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.129
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.069
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.852
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present 0.812
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.789
- heldout_formulations: presence source: present read present 0.875
- heldout_formulations: presence source: share of 'present' readings that abstain 0.235
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.143
- heldout_formulations: presence members: share of 'present' readings that abstain 0.278
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.400
- heldout_formulations: presence targets: present read present 0.667
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.667
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.750
- heldout_formulations: set targets: first gold member in the decoded set 0.667
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.733
- heldout_formulations: presence targets: present read present [pooled midpoint (comparison)] 0.833
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_formulations: presence target: present read present 0.600
- heldout_formulations: presence target: share of 'present' readings that abstain 0.231
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.111
- heldout_formulations: presence style: share of 'present' readings that abstain 0.333
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.667
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.357
- heldout_formulations: presence landmark2: present read present 0.000
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.231
- heldout_formulations: set members: first gold member in the decoded set 0.867
- heldout_formulations: presence layout: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.538
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.333
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.333
- heldout_formulations: presence pairing: present read present [pooled midpoint (comparison)] 0.833
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.667
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.500
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.500
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.250
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.743
- train (sample): presence object: share of 'present' readings that abstain 0.072
- train (sample): presence object: share of true 'present' readings that abstain 0.062
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.078
- train (sample): presence landmark: share of true 'present' readings that abstain 0.033
- train (sample): role object 0.893
- train (sample): heads FULL (model) 0.793
- train (sample): heads FULL (lexical order baseline) 0.167
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.693
- train (sample): FULL [depth given] 0.743
- train (sample): FULL [depth and negation given] 0.743
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.048
- train (sample): presence color: share of true 'present' readings that abstain 0.024
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.250
- train (sample): presence quantity: share of true 'present' readings that abstain 0.250
- train (sample): presence source: present read present 0.786
- train (sample): presence source: share of 'present' readings that abstain 0.300
- train (sample): presence source: share of true 'present' readings that abstain 0.182
- train (sample): presence target: present read present 0.750
- train (sample): presence target: share of 'present' readings that abstain 0.250
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence pairing: share of 'present' readings that abstain 0.059
- train (sample): presence pairing: share of true 'present' readings that abstain 0.059
- train (sample): presence members: share of 'present' readings that abstain 0.167
- train (sample): presence members: share of true 'present' readings that abstain 0.148
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.071
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence style: present read present 0.857
- train (sample): presence style: share of 'present' readings that abstain 0.091
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.833
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.833
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.200
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.625
- train (sample): presence superlative: share of 'present' readings that abstain 0.069
- train (sample): presence superlative: share of true 'present' readings that abstain 0.069
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.333
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence targets: share of 'present' readings that abstain 0.462
- train (sample): presence targets: share of true 'present' readings that abstain 0.444
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.750
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `make NAME COLOR` FULL 0.000 (n 3)
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 3)
- heldout_formulations: `connect NAME to NAME and NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME with a solid arrow` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME and NAME to NAME` FULL 0.000 (n 2)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role direction | role amount | role quantity | role axis | role layout | role source | role target | role style | role arrow | role edge | role pairing | role superlative | role comparison | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.721 | 0.669 | 0.831 | 0.988 | 0.930 | 1.000 | 1.000 | 1.000 | 0.983 | 0.977 | 0.994 | 0.988 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.959 | 0.942 | 0.983 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.948 | 0.977 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.535 | 0.506 | 0.692 | 0.988 | 0.919 | 1.000 | 1.000 | 1.000 | 0.953 | 0.953 | 1.000 | 0.988 | 1.000 | 1.000 | 0.994 | 1.000 | 0.994 | 0.948 | 0.942 | 0.994 | 1.000 | 1.000 | 0.994 | 0.994 | 1.000 | 0.901 | 0.959 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.698 | 0.645 | 0.849 | 0.988 | 0.959 | 1.000 | 1.000 | 0.919 | 0.988 | 0.988 | 0.994 | 0.988 | 0.977 | 1.000 | 1.000 | 1.000 | 1.000 | 0.924 | 0.907 | 0.983 | 1.000 | 0.988 | 1.000 | 1.000 | 1.000 | 0.901 | 0.936 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.922 | 0.926 | 0.924 | 0.091 (0.250 / 0.084) |
| heldout_formulations | object | comparison: pooled midpoint | 0.657 | 0.981 | 0.819 |  |
| heldout_formulations | shape | product: fitted | 0.933 | 1.000 | 0.967 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_formulations | color | product: fitted | 0.812 | 1.000 | 0.906 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.909 | 1.000 | 0.955 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.789 | 1.000 | 0.895 |  |
| heldout_formulations | landmark | product: fitted | 0.967 | 0.984 | 0.975 | 0.129 (1.000 / 0.069) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.852 | 1.000 | 0.926 |  |
| heldout_formulations | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 1.000 | 0.993 | 0.997 | 0.000 (0.000 / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 1.000 | 0.993 | 0.997 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | source | product: fitted | 0.875 | 0.979 | 0.927 | 0.235 (0.667 / 0.143) |
| heldout_formulations | source | comparison: pooled midpoint | 0.733 | 0.978 | 0.856 |  |
| heldout_formulations | target | product: fitted | 0.600 | 0.972 | 0.786 | 0.231 (0.500 / 0.111) |
| heldout_formulations | target | comparison: pooled midpoint | 0.357 | 1.000 | 0.679 |  |
| heldout_formulations | style | product: fitted | 1.000 | 0.981 | 0.990 | 0.333 (0.667 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 0.993 | 0.997 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.333 (— / 0.333) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.833 | 1.000 | 0.917 |  |
| heldout_formulations | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 0.929 | 1.000 | 0.964 |  |
| heldout_formulations | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.965 | 0.983 | 0.278 (0.400 / 0.231) |
| heldout_formulations | members | comparison: pooled midpoint | 0.538 | 0.986 | 0.762 |  |
| heldout_formulations | targets | product: fitted | 0.667 | 0.987 | 0.827 | 0.667 (0.500 / 0.750) |
| heldout_formulations | targets | comparison: pooled midpoint | 0.833 | 0.966 | 0.900 |  |
| train (sample) | object | product: fitted | 0.957 | 0.962 | 0.959 | 0.072 (0.500 / 0.062) |
| train (sample) | shape | product: fitted | 0.964 | 1.000 | 0.982 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.932 | 0.996 | 0.964 | 0.048 (1.000 / 0.024) |
| train (sample) | size | product: fitted | 1.000 | 0.992 | 0.996 | 0.000 (0.000 / 0.000) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 0.996 | 0.998 | 0.071 (1.000 / 0.000) |
| train (sample) | relation | product: fitted | 0.923 | 1.000 | 0.962 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.968 | 0.982 | 0.975 | 0.078 (0.750 / 0.033) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.833 (— / 0.833) |
| train (sample) | region | product: fitted | 1.000 | 0.993 | 0.996 | 0.000 (0.000 / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.250 (— / 0.250) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.786 | 0.969 | 0.878 | 0.300 (0.625 / 0.182) |
| train (sample) | target | product: fitted | 0.750 | 0.981 | 0.866 | 0.250 (1.000 / 0.000) |
| train (sample) | style | product: fitted | 0.857 | 0.982 | 0.920 | 0.091 (0.200 / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.059 (— / 0.059) |
| train (sample) | superlative | product: fitted | 0.967 | 1.000 | 0.983 | 0.069 (— / 0.069) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.989 | 0.994 | 0.167 (0.333 / 0.148) |
| train (sample) | targets | product: fitted | 1.000 | 0.986 | 0.993 | 0.462 (0.500 / 0.444) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
