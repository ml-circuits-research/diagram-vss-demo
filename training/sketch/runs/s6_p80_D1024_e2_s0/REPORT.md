# REPORT — world `real`, legend sha256:12cf77be5d58… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4282 annotated sentences from 2 files; provenance: {'llm': 4282}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/s6_p80_D1024_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 210 sentences
- heldout_formulations: 172 sentences
- train: 3900 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
24217 tokens in the examples; 1026 with no kind in the lexicon (share 0.042), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit b7f903c. Memory curve: runs/s6_p80_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.112 [rule: fit; pooled midpoint 0.283 (comparison)] (present 0.565, n 170 / absent 0.001, n 656446)
- set_member:targets: threshold 0.099 [rule: fit; pooled midpoint 0.109 (comparison)] (present 0.219, n 45 / absent -0.001, n 190715)
- presence:object: threshold 0.125 [rule: fit; pooled midpoint 0.651 (comparison)] (present 1.193, n 353 / absent 0.109, n 257)
- presence:shape: threshold 0.060 [rule: fit; pooled midpoint 0.400 (comparison)] (present 0.792, n 57 / absent 0.007, n 553)
- presence:color: threshold 0.131 [rule: fit; pooled midpoint 0.372 (comparison)] (present 0.728, n 108 / absent 0.015, n 502)
- presence:size: threshold 0.287 [rule: fit; pooled midpoint 0.364 (comparison)] (present 0.704, n 85 / absent 0.024, n 525)
- presence:name: threshold 0.214 [rule: fit; pooled midpoint 0.247 (comparison)] (present 0.488, n 17 / absent 0.005, n 593)
- presence:text: threshold 0.077 [rule: fit; pooled midpoint 0.298 (comparison)] (present 0.610, n 26 / absent -0.014, n 584)
- presence:relation: threshold 0.129 [rule: fit; pooled midpoint 0.445 (comparison)] (present 0.888, n 77 / absent 0.002, n 533)
- presence:landmark: threshold 0.151 [rule: fit; pooled midpoint 0.461 (comparison)] (present 0.898, n 108 / absent 0.024, n 502)
- presence:landmark2: threshold 0.187 [rule: fit; pooled midpoint 0.166 (comparison)] (present 0.328, n 8 / absent 0.003, n 602)
- presence:region: threshold 0.119 [rule: fit; pooled midpoint 0.266 (comparison)] (present 0.508, n 28 / absent 0.024, n 582)
- presence:direction: threshold 0.332 [rule: fit; pooled midpoint 0.339 (comparison)] (present 0.677, n 20 / absent 0.001, n 683)
- presence:amount: threshold 0.261 [rule: fit; pooled midpoint 0.387 (comparison)] (present 0.776, n 28 / absent -0.002, n 675)
- presence:quantity: threshold 0.053 [rule: fit; pooled midpoint 0.175 (comparison)] (present 0.350, n 8 / absent 0.000, n 602)
- presence:axis: threshold 0.208 [rule: fit; pooled midpoint 0.281 (comparison)] (present 0.563, n 9 / absent -0.000, n 601)
- presence:layout: threshold 0.268 [rule: fit; pooled midpoint 0.396 (comparison)] (present 0.791, n 12 / absent 0.000, n 598)
- presence:source: threshold 0.213 [rule: fit; pooled midpoint 0.387 (comparison)] (present 0.752, n 82 / absent 0.023, n 528)
- presence:target: threshold 0.254 [rule: fit; pooled midpoint 0.514 (comparison)] (present 1.001, n 58 / absent 0.027, n 552)
- presence:style: threshold 0.115 [rule: fit; pooled midpoint 0.296 (comparison)] (present 0.581, n 20 / absent 0.010, n 590)
- presence:arrow: threshold 0.171 [rule: fit; pooled midpoint 0.341 (comparison)] (present 0.684, n 30 / absent -0.001, n 673)
- presence:edge: threshold 0.335 [rule: fit; pooled midpoint 0.365 (comparison)] (present 0.729, n 14 / absent 0.001, n 596)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 24)
- presence:pairing: threshold 0.459 [rule: fit; pooled midpoint 0.429 (comparison)] (present 0.847, n 35 / absent 0.011, n 575)
- presence:superlative: threshold 0.180 [rule: fit; pooled midpoint 0.424 (comparison)] (present 0.849, n 62 / absent 0.000, n 548)
- presence:comparison: threshold 0.294 [rule: fit; pooled midpoint 0.272 (comparison)] (present 0.544, n 5 / absent -0.000, n 605)
- presence:members: threshold 0.256 [rule: fit; pooled midpoint 0.490 (comparison)] (present 0.847, n 62 / absent 0.133, n 548)
- presence:targets: threshold 0.128 [rule: fit; pooled midpoint 0.157 (comparison)] (present 0.283, n 23 / absent 0.031, n 587)
- attr_presence:object: threshold 0.253 [rule: fit; pooled midpoint 0.392 (comparison)] (present 0.663, n 28 / absent 0.121, n 323)
- det_presence:object: threshold 0.255 [rule: fit; pooled midpoint 0.351 (comparison)] (present 0.643, n 40 / absent 0.059, n 371)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.059, quantity 0.059, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 172 of 172)
| axis | accuracy |
|---|---|
| FULL | 0.645 |
| FULL [depth given] | 0.645 |
| FULL [depth and negation given] | 0.645 |
| FULL [presence not decided] | 0.628 |
| FULL [pooled midpoint (comparison)] | 0.477 |
| presence object: present read present | 0.961 |
| presence object: share of 'present' readings that abstain | 0.117 |
| presence object: share of true 'present' readings that abstain | 0.111 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.957 |
| presence target: absent read absent | 0.937 |
| presence style: absent read absent | 0.981 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.951 |
| presence targets: absent read absent | 0.940 |
| structure (depth, negation) | 0.913 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.930 |
| set targets: exact | 0.936 |
| predicate (surface lemma) | 0.872 |
| event type (synonym table) | 0.872 |
| role object | 0.866 |
| head object | 0.890 |
| lexical order head object | 0.762 |
| lexical bag head object | 0.785 |
| occupancy: unknown filler | 0.894 |
| role shape | 0.994 |
| head shape | 0.994 |
| lexical order head shape | 0.907 |
| lexical bag head shape | 0.988 |
| occupancy: not given | 0.990 |
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
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
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
| role source | 0.942 |
| head source | 0.942 |
| lexical order head source | 0.901 |
| lexical bag head source | 0.913 |
| role target | 0.913 |
| head target | 0.913 |
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
| role pairing | 0.988 |
| head pairing | 0.988 |
| lexical order head pairing | 0.965 |
| lexical bag head pairing | 0.988 |
| role superlative | 0.994 |
| head superlative | 0.994 |
| lexical order head superlative | 0.919 |
| lexical bag head superlative | 0.965 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.983 |
| lexical bag head comparison | 1.000 |
| role members | 0.930 |
| head members | 0.930 |
| lexical order head members | 0.913 |
| lexical bag head members | 0.913 |
| role targets | 0.936 |
| head targets | 0.936 |
| lexical order head targets | 0.965 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.692 |
| heads FULL (lexical order baseline) | 0.209 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.465 |
| role object [presence not decided] | 0.849 |
| role shape [presence not decided] | 0.988 |
| role color [presence not decided] | 0.959 |
| role size [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 0.913 |
| role relation [presence not decided] | 0.983 |
| role landmark [presence not decided] | 0.977 |
| role landmark2 [presence not decided] | 1.000 |
| role region [presence not decided] | 0.983 |
| role direction [presence not decided] | 0.977 |
| role amount [presence not decided] | 1.000 |
| role quantity [presence not decided] | 1.000 |
| role axis [presence not decided] | 1.000 |
| role layout [presence not decided] | 1.000 |
| role source [presence not decided] | 0.924 |
| role target [presence not decided] | 0.913 |
| role style [presence not decided] | 0.983 |
| role arrow [presence not decided] | 1.000 |
| role edge [presence not decided] | 0.988 |
| role pairing [presence not decided] | 1.000 |
| role superlative [presence not decided] | 0.994 |
| role comparison [presence not decided] | 1.000 |
| role members [presence not decided] | 0.890 |
| role targets [presence not decided] | 0.942 |
| heads FULL (model) [presence not decided] | 0.674 |
| role object [pooled midpoint (comparison)] | 0.663 |
| role shape [pooled midpoint (comparison)] | 0.988 |
| role color [pooled midpoint (comparison)] | 0.919 |
| role size [pooled midpoint (comparison)] | 1.000 |
| role name [pooled midpoint (comparison)] | 1.000 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.953 |
| role landmark [pooled midpoint (comparison)] | 0.953 |
| role landmark2 [pooled midpoint (comparison)] | 0.994 |
| role region [pooled midpoint (comparison)] | 0.988 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 0.988 |
| role axis [pooled midpoint (comparison)] | 1.000 |
| role layout [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.953 |
| role target [pooled midpoint (comparison)] | 0.948 |
| role style [pooled midpoint (comparison)] | 0.994 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 0.988 |
| role superlative [pooled midpoint (comparison)] | 0.988 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.895 |
| role targets [pooled midpoint (comparison)] | 0.942 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.500 |
| presence object: present read present [pooled midpoint (comparison)] | 0.606 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: present read present [pooled midpoint (comparison)] | 1.000 |
| presence direction: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence amount: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 0.978 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.978 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.945 |
| presence landmark: present read present | 0.900 |
| presence landmark: share of 'present' readings that abstain | 0.074 |
| presence landmark: share of true 'present' readings that abstain | 0.074 |
| presence region: absent read absent | 0.993 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.852 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence comparison: present read present [pooled midpoint (comparison)] | 1.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.067 |
| presence shape: share of true 'present' readings that abstain | 0.067 |
| presence color: present read present | 0.812 |
| presence color: share of 'present' readings that abstain | 0.038 |
| presence color: share of true 'present' readings that abstain | 0.038 |
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
| presence relation: share of 'present' readings that abstain | 0.150 |
| presence relation: share of true 'present' readings that abstain | 0.150 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.789 |
| presence object: absent read absent | 0.926 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.943 |
| presence source: present read present | 0.875 |
| presence source: share of 'present' readings that abstain | 0.350 |
| presence source: share of true 'present' readings that abstain | 0.286 |
| presence target: share of 'present' readings that abstain | 0.389 |
| presence target: share of FALSE 'present' readings that abstain | 0.667 |
| presence members: share of 'present' readings that abstain | 0.500 |
| presence members: share of FALSE 'present' readings that abstain | 0.429 |
| presence targets: present read present | 1.000 |
| presence targets: share of 'present' readings that abstain | 0.667 |
| presence targets: share of true 'present' readings that abstain | 0.833 |
| set targets: first gold member in the decoded set | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.800 |
| presence targets: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.500 |
| presence target: present read present | 0.600 |
| presence target: share of true 'present' readings that abstain | 0.111 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence target: present read present [pooled midpoint (comparison)] | 0.429 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 0.538 |
| set members: first gold member in the decoded set | 0.867 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.692 |
| presence source: share of FALSE 'present' readings that abstain | 0.500 |
| presence pairing: present read present | 0.667 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence targets: share of FALSE 'present' readings that abstain | 0.556 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.667 |
| presence style: present read present | 1.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present [pooled midpoint (comparison)] | 1.000 |
| presence superlative: present read present | 0.929 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.857 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.500 |
| presence quantity: share of true 'present' readings that abstain | 0.500 |
| presence quantity: present read present [pooled midpoint (comparison)] | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.250 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.237; status {'ok': 110, 'abstain': 47, 'no-sense': 3, 'unknown-event': 12}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.872 | 0.410 / 0.071 | 0.91 | 0.041 | 0.006 / 0.087 |
| role object | 0.833 | 0.259 / 0.026 | 0.85 | 0.114 | 0.096 / 0.053 |
| roles (pooled) | 0.827 | 0.216 / 0.000 | 0.78 | 0.046 | 0.092 / 0.127 |
| role region | 0.900 | 0.335 / 0.210 | 0.90 | 0.000 | 0.000 / 0.100 |
| role landmark | 0.871 | 0.166 / 0.000 | 0.81 | 0.000 | 0.065 / 0.129 |
| role comparison | 1.000 | 0.262 / 0.224 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 0.938 | 0.251 / 0.156 | 0.94 | 0.062 | 0.062 / 0.000 |
| role color | 0.684 | 0.189 / 0.000 | 0.68 | 0.026 | 0.026 / 0.289 |
| role size | 1.000 | 0.298 / 0.248 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.208 / 0.176 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.870 | 0.216 / 0.001 | 0.74 | 0.000 | 0.130 / 0.130 |
| role source | 0.765 | 0.087 / 0.000 | 0.59 | 0.000 | 0.176 / 0.235 |
| role targets | 0.667 | 0.035 / 0.012 | 0.17 | 0.000 | 0.500 / 0.333 |
| role target | 0.600 | 0.090 / 0.000 | 0.53 | 0.000 | 0.067 / 0.400 |
| role landmark2 | 1.000 | 0.012 / 0.012 | 0.00 | 0.000 | 1.000 / 0.000 |
| role layout | 1.000 | 0.288 / 0.143 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.667 | 0.050 / 0.025 | 0.40 | 0.067 | 0.333 / 0.267 |
| role pairing | 0.667 | 0.111 / 0.000 | 0.67 | 0.000 | 0.000 / 0.333 |
| role style | 1.000 | 0.257 / 0.238 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.319 / 0.315 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.227 / 0.227 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 0.929 | 0.409 / 0.147 | 0.93 | 0.000 | 0.000 / 0.071 |
| role quantity | 1.000 | 0.060 / 0.047 | 0.50 | 0.000 | 0.500 / 0.000 |
| role name | 1.000 | 0.147 / 0.078 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3900)
| axis | accuracy |
|---|---|
| FULL | 0.683 |
| FULL [depth given] | 0.683 |
| FULL [depth and negation given] | 0.683 |
| presence object: present read present | 0.957 |
| presence object: share of 'present' readings that abstain | 0.056 |
| presence object: share of true 'present' readings that abstain | 0.057 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.996 |
| presence size: absent read absent | 0.992 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 0.996 |
| presence relation: present read present | 0.922 |
| presence relation: share of 'present' readings that abstain | 0.064 |
| presence relation: share of true 'present' readings that abstain | 0.064 |
| presence landmark: present read present | 0.951 |
| presence landmark: share of 'present' readings that abstain | 0.100 |
| presence landmark: share of true 'present' readings that abstain | 0.069 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.989 |
| presence region: share of 'present' readings that abstain | 0.053 |
| presence region: share of FALSE 'present' readings that abstain | 0.333 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.950 |
| presence target: absent read absent | 0.941 |
| presence style: absent read absent | 0.979 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.962 |
| presence targets: absent read absent | 0.929 |
| structure (depth, negation) | 0.963 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.947 |
| set targets: exact | 0.930 |
| predicate (surface lemma) | 0.917 |
| event type (synonym table) | 0.917 |
| role object | 0.897 |
| head object | 0.923 |
| lexical order head object | 0.770 |
| lexical bag head object | 0.900 |
| occupancy: known filler | 0.899 |
| role shape | 0.990 |
| head shape | 0.990 |
| lexical order head shape | 0.900 |
| lexical bag head shape | 0.993 |
| occupancy: not given | 0.989 |
| role color | 0.963 |
| head color | 0.963 |
| lexical order head color | 0.837 |
| lexical bag head color | 0.993 |
| role size | 0.987 |
| head size | 0.987 |
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
| role relation | 0.980 |
| head relation | 0.980 |
| lexical order head relation | 0.827 |
| lexical bag head relation | 0.973 |
| role landmark | 0.973 |
| head landmark | 0.973 |
| lexical order head landmark | 0.790 |
| lexical bag head landmark | 0.963 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.980 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.983 |
| head region | 0.983 |
| lexical order head region | 0.940 |
| lexical bag head region | 0.967 |
| role direction | 1.000 |
| head direction | 1.000 |
| lexical order head direction | 0.990 |
| lexical bag head direction | 1.000 |
| role amount | 1.000 |
| head amount | 1.000 |
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
| role source | 0.933 |
| head source | 0.933 |
| lexical order head source | 0.907 |
| lexical bag head source | 0.977 |
| role target | 0.930 |
| head target | 0.930 |
| lexical order head target | 0.933 |
| lexical bag head target | 0.990 |
| role style | 0.977 |
| head style | 0.977 |
| lexical order head style | 0.977 |
| lexical bag head style | 0.987 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 0.993 |
| lexical bag head arrow | 0.997 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.983 |
| lexical bag head edge | 0.993 |
| role pairing | 0.993 |
| head pairing | 0.993 |
| lexical order head pairing | 0.943 |
| lexical bag head pairing | 0.993 |
| role superlative | 0.993 |
| head superlative | 0.993 |
| lexical order head superlative | 0.900 |
| lexical bag head superlative | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.997 |
| lexical bag head comparison | 1.000 |
| role members | 0.947 |
| head members | 0.947 |
| lexical order head members | 0.910 |
| lexical bag head members | 0.910 |
| role targets | 0.927 |
| head targets | 0.927 |
| lexical order head targets | 0.970 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.727 |
| heads FULL (lexical order baseline) | 0.167 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.693 |
| presence shape: present read present | 0.964 |
| presence shape: share of 'present' readings that abstain | 0.037 |
| presence shape: share of true 'present' readings that abstain | 0.037 |
| presence size: present read present | 0.980 |
| presence size: share of 'present' readings that abstain | 0.058 |
| presence size: share of true 'present' readings that abstain | 0.060 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.991 |
| presence color: present read present | 0.909 |
| presence color: share of 'present' readings that abstain | 0.024 |
| presence color: share of true 'present' readings that abstain | 0.025 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 0.962 |
| presence source: present read present | 0.750 |
| presence source: share of 'present' readings that abstain | 0.441 |
| presence source: share of true 'present' readings that abstain | 0.238 |
| presence target: present read present | 0.750 |
| presence target: share of 'present' readings that abstain | 0.516 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present | 0.882 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.405 |
| presence members: share of true 'present' readings that abstain | 0.296 |
| presence targets: share of 'present' readings that abstain | 0.621 |
| presence targets: share of FALSE 'present' readings that abstain | 0.750 |
| set members: first gold member in the decoded set | 0.926 |
| occupancy: unknown filler | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.071 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 0.857 |
| presence style: share of 'present' readings that abstain | 0.083 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.167 |
| presence source: share of FALSE 'present' readings that abstain | 0.769 |
| presence superlative: present read present | 0.933 |
| presence superlative: share of 'present' readings that abstain | 0.107 |
| presence superlative: share of true 'present' readings that abstain | 0.107 |
| presence members: share of FALSE 'present' readings that abstain | 0.700 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 1.000 |
| presence targets: present read present | 1.000 |
| presence targets: share of true 'present' readings that abstain | 0.333 |
| set targets: first gold member in the decoded set | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence text: share of FALSE 'present' readings that abstain | 1.000 |
| presence direction: present read present | 1.000 |
| presence direction: share of 'present' readings that abstain | 0.333 |
| presence direction: share of true 'present' readings that abstain | 0.333 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.333 |
| presence amount: share of true 'present' readings that abstain | 0.333 |
| presence landmark: share of FALSE 'present' readings that abstain | 1.000 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.172; status {'abstain': 77, 'ok': 212, 'unknown-event': 9, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.917 | 0.442 / 0.272 | 0.96 | 0.047 | 0.000 / 0.037 |
| role object | 0.862 | 0.267 / 0.048 | 0.89 | 0.082 | 0.051 / 0.056 |
| roles (pooled) | 0.876 | 0.229 / 0.012 | 0.84 | 0.032 | 0.063 / 0.092 |
| role relation | 0.885 | 0.224 / 0.024 | 0.85 | 0.019 | 0.058 / 0.096 |
| role landmark | 0.905 | 0.191 / 0.006 | 0.86 | 0.000 | 0.048 / 0.095 |
| role shape | 0.900 | 0.243 / 0.030 | 0.87 | 0.000 | 0.033 / 0.100 |
| role size | 0.962 | 0.261 / 0.076 | 0.90 | 0.000 | 0.058 / 0.038 |
| role color | 0.796 | 0.238 / 0.000 | 0.82 | 0.020 | 0.000 / 0.184 |
| role name | 1.000 | 0.174 / 0.066 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.080 / 0.053 | 1.00 | 0.000 | 0.000 / 0.000 |
| role source | 0.750 | 0.087 / 0.000 | 0.57 | 0.000 | 0.179 / 0.250 |
| role target | 0.750 | 0.135 / 0.000 | 0.75 | 0.000 | 0.000 / 0.250 |
| role arrow | 1.000 | 0.289 / 0.287 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.318 / 0.286 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 0.889 | 0.316 / 0.092 | 0.89 | 0.000 | 0.000 / 0.111 |
| role pairing | 0.882 | 0.219 / 0.075 | 0.88 | 0.000 | 0.000 / 0.118 |
| role members | 0.778 | 0.077 / 0.021 | 0.70 | 0.074 | 0.148 / 0.148 |
| role text | 0.929 | 0.215 / 0.170 | 0.93 | 0.000 | 0.000 / 0.071 |
| role style | 0.857 | 0.215 / 0.083 | 0.86 | 0.000 | 0.000 / 0.143 |
| role landmark2 | 1.000 | 0.021 / 0.015 | 0.00 | 0.000 | 1.000 / 0.000 |
| role superlative | 0.933 | 0.406 / 0.035 | 0.83 | 0.000 | 0.100 / 0.067 |
| role layout | 1.000 | 0.278 / 0.159 | 1.00 | 0.000 | 0.000 / 0.000 |
| role targets | 0.778 | 0.059 / 0.007 | 0.67 | 0.111 | 0.222 / 0.111 |
| role comparison | 1.000 | 0.245 / 0.245 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.271 / 0.265 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 1.000 | 0.137 / 0.054 | 0.67 | 0.000 | 0.333 / 0.000 |
| role amount | 1.000 | 0.113 / 0.038 | 0.67 | 0.000 | 0.333 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 SUPER=0.98 COLOR=0.95 LAYOUT=0.90 AXIS=0.88 once=0.87 pixels=0.86 rules=0.84 STYLE=0.69 TEXT=0.69 have=0.67 VERB=0.61 NAME=0.61 NUM=0.58 whole=0.57 from=0.52 them=0.49 ARROW=0.38 last=0.37 for=0.36 as=0.36 any=0.34 PAIR=0.33 thing=0.31 reached=0.31 it=0.29 this=0.28 we=0.27 do=0.27 diagram=0.26 now=0.23 both=0.22 there=0.21 each=0.19 here=0.19 map=0.17 that=0.17 those=0.17 exist=0.15 no=0.13 DIR=0.13 are=0.12 NOTCOLOR=0.12 i=0.12 too=0.10 remove=0.10 show=0.10 four=0.09 line=0.09 two=0.09 check=0.07 uh=0.07 arrow=0.06 directly=0.06 me=0.06 at=0.06 evenly=0.06 then=0.06 front=0.05 shapes=0.05 box=0.05 by=0.05 axis=0.05 in=0.05 what's=0.04 what=0.04 just=0.04 place=0.04 give=0.03 you=0.03 back=0.03 lines=0.03 an=0.03 if=0.03 RECENT=0.03 link=0.03 can=0.03 should=0.03 arrows=0.02 does=0.02 on=0.02 new=0.02 three=0.02 SIZE=0.02 every=0.02 the=0.02 not=0.02 goes=0.02 put=0.02 tell=0.02 who=0.02 with=0.02 be=0.02 QUANT=0.01 has=0.01 one=0.01 SHAPE=0.01 unknown=0.01 shape=0.01 named=0.01 and=0.01 called=0.01 of=0.00 labeled=0.00 to=0.00 a=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.645
- heldout_formulations: presence object: share of 'present' readings that abstain 0.117
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.111
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: predicate (surface lemma) 0.872
- heldout_formulations: event type (synonym table) 0.872
- heldout_formulations: role object 0.866
- heldout_formulations: head object 0.890
- heldout_formulations: occupancy: unknown filler 0.894
- heldout_formulations: occupancy: known filler 0.843
- heldout_formulations: heads FULL (model) 0.692
- heldout_formulations: heads FULL (lexical order baseline) 0.209
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.465
- heldout_formulations: FULL [depth given] 0.645
- heldout_formulations: FULL [depth and negation given] 0.645
- heldout_formulations: FULL [presence not decided] 0.628
- heldout_formulations: role object [presence not decided] 0.849
- heldout_formulations: role members [presence not decided] 0.890
- heldout_formulations: heads FULL (model) [presence not decided] 0.674
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.477
- heldout_formulations: role object [pooled midpoint (comparison)] 0.663
- heldout_formulations: role members [pooled midpoint (comparison)] 0.895
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.606
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.074
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.074
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.852
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.067
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.067
- heldout_formulations: presence color: present read present 0.812
- heldout_formulations: presence color: share of 'present' readings that abstain 0.038
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.038
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.150
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.150
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.789
- heldout_formulations: presence source: present read present 0.875
- heldout_formulations: presence source: share of 'present' readings that abstain 0.350
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.286
- heldout_formulations: presence target: share of 'present' readings that abstain 0.389
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.667
- heldout_formulations: presence members: share of 'present' readings that abstain 0.500
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.429
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.667
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.833
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.800
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.500
- heldout_formulations: presence target: present read present 0.600
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.111
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.429
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.538
- heldout_formulations: set members: first gold member in the decoded set 0.867
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.692
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.500
- heldout_formulations: presence pairing: present read present 0.667
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.556
- heldout_formulations: presence pairing: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: present read present [pooled midpoint (comparison)] 0.857
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.500
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.500
- heldout_formulations: presence quantity: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.250
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.683
- train (sample): presence object: share of 'present' readings that abstain 0.056
- train (sample): presence object: share of true 'present' readings that abstain 0.057
- train (sample): presence relation: share of 'present' readings that abstain 0.064
- train (sample): presence relation: share of true 'present' readings that abstain 0.064
- train (sample): presence landmark: share of 'present' readings that abstain 0.100
- train (sample): presence landmark: share of true 'present' readings that abstain 0.069
- train (sample): presence region: share of 'present' readings that abstain 0.053
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.333
- train (sample): role object 0.897
- train (sample): occupancy: known filler 0.899
- train (sample): heads FULL (model) 0.727
- train (sample): heads FULL (lexical order baseline) 0.167
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.693
- train (sample): FULL [depth given] 0.683
- train (sample): FULL [depth and negation given] 0.683
- train (sample): presence shape: share of 'present' readings that abstain 0.037
- train (sample): presence shape: share of true 'present' readings that abstain 0.037
- train (sample): presence size: share of 'present' readings that abstain 0.058
- train (sample): presence size: share of true 'present' readings that abstain 0.060
- train (sample): presence color: share of 'present' readings that abstain 0.024
- train (sample): presence color: share of true 'present' readings that abstain 0.025
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence source: present read present 0.750
- train (sample): presence source: share of 'present' readings that abstain 0.441
- train (sample): presence source: share of true 'present' readings that abstain 0.238
- train (sample): presence target: present read present 0.750
- train (sample): presence target: share of 'present' readings that abstain 0.516
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): presence arrow: share of 'present' readings that abstain 0.000
- train (sample): presence arrow: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence pairing: present read present 0.882
- train (sample): presence pairing: share of 'present' readings that abstain 0.000
- train (sample): presence pairing: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.405
- train (sample): presence members: share of true 'present' readings that abstain 0.296
- train (sample): presence targets: share of 'present' readings that abstain 0.621
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.750
- train (sample): presence text: share of 'present' readings that abstain 0.071
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence style: present read present 0.857
- train (sample): presence style: share of 'present' readings that abstain 0.083
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.167
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.769
- train (sample): presence superlative: share of 'present' readings that abstain 0.107
- train (sample): presence superlative: share of true 'present' readings that abstain 0.107
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.700
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence targets: share of true 'present' readings that abstain 0.333
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence direction: share of 'present' readings that abstain 0.333
- train (sample): presence direction: share of true 'present' readings that abstain 0.333
- train (sample): presence amount: share of 'present' readings that abstain 0.333
- train (sample): presence amount: share of true 'present' readings that abstain 0.333
- train (sample): presence color: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 3)
- heldout_formulations: `connect NAME to NAME and NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME with a solid arrow` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME and NAME to NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME PAIR NAME to NAME` FULL 0.000 (n 2)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role direction | role amount | role quantity | role axis | role layout | role source | role target | role style | role arrow | role edge | role pairing | role superlative | role comparison | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.692 | 0.645 | 0.866 | 0.994 | 0.930 | 1.000 | 1.000 | 1.000 | 0.983 | 0.977 | 1.000 | 0.988 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.942 | 0.913 | 0.983 | 1.000 | 1.000 | 0.988 | 0.994 | 1.000 | 0.930 | 0.936 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.500 | 0.477 | 0.663 | 0.988 | 0.919 | 1.000 | 1.000 | 1.000 | 0.953 | 0.953 | 0.994 | 0.988 | 1.000 | 1.000 | 0.988 | 1.000 | 1.000 | 0.953 | 0.948 | 0.994 | 1.000 | 1.000 | 0.988 | 0.988 | 1.000 | 0.895 | 0.942 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.674 | 0.628 | 0.849 | 0.988 | 0.959 | 1.000 | 1.000 | 0.913 | 0.983 | 0.977 | 1.000 | 0.983 | 0.977 | 1.000 | 1.000 | 1.000 | 1.000 | 0.924 | 0.913 | 0.983 | 1.000 | 0.988 | 1.000 | 0.994 | 1.000 | 0.890 | 0.942 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.961 | 0.926 | 0.944 | 0.117 (0.250 / 0.111) |
| heldout_formulations | object | comparison: pooled midpoint | 0.606 | 0.943 | 0.775 |  |
| heldout_formulations | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.067 (— / 0.067) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_formulations | color | product: fitted | 0.812 | 1.000 | 0.906 | 0.038 (— / 0.038) |
| heldout_formulations | color | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.909 | 1.000 | 0.955 | 0.150 (— / 0.150) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.789 | 1.000 | 0.895 |  |
| heldout_formulations | landmark | product: fitted | 0.900 | 1.000 | 0.950 | 0.074 (— / 0.074) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.852 | 1.000 | 0.926 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 1.000 | 0.993 | 0.997 | 0.000 (0.000 / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 1.000 | 0.993 | 0.997 |  |
| heldout_formulations | direction | product: fitted | — | 1.000 | — |  |
| heldout_formulations | direction | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | amount | product: fitted | — | 1.000 | — |  |
| heldout_formulations | amount | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.500 (— / 0.500) |
| heldout_formulations | quantity | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | source | product: fitted | 0.875 | 0.957 | 0.916 | 0.350 (0.500 / 0.286) |
| heldout_formulations | source | comparison: pooled midpoint | 0.800 | 0.978 | 0.889 |  |
| heldout_formulations | target | product: fitted | 0.600 | 0.937 | 0.768 | 0.389 (0.667 / 0.111) |
| heldout_formulations | target | comparison: pooled midpoint | 0.429 | 1.000 | 0.714 |  |
| heldout_formulations | style | product: fitted | 1.000 | 0.981 | 0.990 | 0.000 (0.000 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 0.993 | 0.997 |  |
| heldout_formulations | arrow | product: fitted | — | 1.000 | — |  |
| heldout_formulations | arrow | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | superlative | product: fitted | 0.929 | 1.000 | 0.964 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 0.857 | 1.000 | 0.929 |  |
| heldout_formulations | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.951 | 0.976 | 0.500 (0.429 / 0.538) |
| heldout_formulations | members | comparison: pooled midpoint | 0.692 | 0.978 | 0.835 |  |
| heldout_formulations | targets | product: fitted | 1.000 | 0.940 | 0.970 | 0.667 (0.556 / 0.833) |
| heldout_formulations | targets | comparison: pooled midpoint | 1.000 | 0.945 | 0.973 |  |
| train (sample) | object | product: fitted | 0.957 | 0.962 | 0.959 | 0.056 (0.000 / 0.057) |
| train (sample) | shape | product: fitted | 0.964 | 1.000 | 0.982 | 0.037 (— / 0.037) |
| train (sample) | color | product: fitted | 0.909 | 0.996 | 0.953 | 0.024 (0.000 / 0.025) |
| train (sample) | size | product: fitted | 0.980 | 0.992 | 0.986 | 0.058 (0.000 / 0.060) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 0.996 | 0.998 | 0.071 (1.000 / 0.000) |
| train (sample) | relation | product: fitted | 0.922 | 1.000 | 0.961 | 0.064 (— / 0.064) |
| train (sample) | landmark | product: fitted | 0.951 | 0.991 | 0.971 | 0.100 (1.000 / 0.069) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| train (sample) | region | product: fitted | 1.000 | 0.989 | 0.995 | 0.053 (0.333 / 0.000) |
| train (sample) | direction | product: fitted | 1.000 | 1.000 | 1.000 | 0.333 (— / 0.333) |
| train (sample) | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.333 (— / 0.333) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.750 | 0.950 | 0.850 | 0.441 (0.769 / 0.238) |
| train (sample) | target | product: fitted | 0.750 | 0.941 | 0.845 | 0.516 (1.000 / 0.000) |
| train (sample) | style | product: fitted | 0.857 | 0.979 | 0.918 | 0.083 (0.167 / 0.000) |
| train (sample) | arrow | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 0.882 | 1.000 | 0.941 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 0.933 | 1.000 | 0.967 | 0.107 (— / 0.107) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.962 | 0.981 | 0.405 (0.700 / 0.296) |
| train (sample) | targets | product: fitted | 1.000 | 0.929 | 0.964 | 0.621 (0.750 / 0.333) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
