# REPORT — world `real`, legend sha256:f170e7b38dbd… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
10159 annotated sentences from 2 files; provenance: {'llm': 10159}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/data2_p80_D1024_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 516 sentences
- heldout_formulations: 514 sentences
- train: 9129 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
56389 tokens in the examples; 2619 with no kind in the lexicon (share 0.046), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 98a6b9a. Memory curve: runs/data2_p80_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.126 [rule: fit; pooled midpoint 0.627 (comparison)] (present 1.155, n 545 / absent 0.099, n 371)
- presence:shape: threshold 0.172 [rule: fit; pooled midpoint 0.372 (comparison)] (present 0.740, n 72 / absent 0.004, n 844)
- presence:color: threshold 0.070 [rule: fit; pooled midpoint 0.377 (comparison)] (present 0.734, n 142 / absent 0.021, n 774)
- presence:size: threshold 0.071 [rule: fit; pooled midpoint 0.286 (comparison)] (present 0.542, n 98 / absent 0.030, n 818)
- presence:name: threshold 0.237 [rule: fit; pooled midpoint 0.361 (comparison)] (present 0.722, n 31 / absent 0.001, n 885)
- presence:text: threshold 0.075 [rule: fit; pooled midpoint 0.334 (comparison)] (present 0.675, n 27 / absent -0.008, n 889)
- presence:relation: threshold 0.108 [rule: fit; pooled midpoint 0.360 (comparison)] (present 0.711, n 109 / absent 0.008, n 807)
- presence:landmark: threshold 0.124 [rule: fit; pooled midpoint 0.401 (comparison)] (present 0.764, n 164 / absent 0.037, n 752)
- presence:landmark2: threshold 0.240 [rule: fit; pooled midpoint 0.190 (comparison)] (present 0.372, n 8 / absent 0.007, n 908)
- presence:region: threshold 0.159 [rule: fit; pooled midpoint 0.349 (comparison)] (present 0.673, n 49 / absent 0.025, n 867)
- presence:direction: threshold 0.327 [rule: fit; pooled midpoint 0.300 (comparison)] (present 0.598, n 5 / absent 0.001, n 911)
- presence:amount: threshold 0.434 [rule: fit; pooled midpoint 0.400 (comparison)] (present 0.803, n 8 / absent -0.003, n 908)
- presence:quantity: threshold 0.060 [rule: fit; pooled midpoint 0.173 (comparison)] (present 0.348, n 10 / absent -0.002, n 906)
- presence:axis: threshold 0.385 [rule: fit; pooled midpoint 0.367 (comparison)] (present 0.732, n 17 / absent 0.001, n 899)
- presence:layout: threshold 0.109 [rule: fit; pooled midpoint 0.394 (comparison)] (present 0.787, n 16 / absent 0.002, n 900)
- presence:source: threshold 0.066 [rule: fit; pooled midpoint 0.485 (comparison)] (present 0.941, n 127 / absent 0.028, n 789)
- presence:target: threshold 0.030 [rule: fit; pooled midpoint 0.419 (comparison)] (present 0.799, n 104 / absent 0.039, n 812)
- presence:style: threshold 0.119 [rule: fit; pooled midpoint 0.310 (comparison)] (present 0.612, n 23 / absent 0.008, n 893)
- presence:arrow: threshold 0.480 [rule: fit; pooled midpoint 0.293 (comparison)] (present 0.589, n 8 / absent -0.003, n 908)
- presence:edge: threshold 0.363 [rule: fit; pooled midpoint 0.433 (comparison)] (present 0.861, n 18 / absent 0.004, n 898)
- presence:pairing: threshold 0.435 [rule: fit; pooled midpoint 0.389 (comparison)] (present 0.776, n 27 / absent 0.002, n 889)
- presence:superlative: threshold 0.085 [rule: fit; pooled midpoint 0.406 (comparison)] (present 0.811, n 79 / absent 0.002, n 837)
- presence:comparison: threshold 0.177 [rule: fit; pooled midpoint 0.237 (comparison)] (present 0.473, n 9 / absent 0.000, n 907)
- presence:members: threshold 0.331 [rule: fit; pooled midpoint 0.464 (comparison)] (present 0.769, n 84 / absent 0.159, n 832)
- presence:targets: threshold 0.150 [rule: fit; pooled midpoint 0.157 (comparison)] (present 0.276, n 33 / absent 0.038, n 883)
- set_member:members: threshold 0.104 [rule: fit; pooled midpoint 0.254 (comparison)] (present 0.507, n 212 / absent 0.000, n 1789363)
- attr_presence:object: threshold 0.300 [rule: fit; pooled midpoint 0.364 (comparison)] (present 0.605, n 43 / absent 0.124, n 492)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 532)
- set_member:targets: threshold 0.095 [rule: fit; pooled midpoint 0.108 (comparison)] (present 0.215, n 68 / absent 0.000, n 494696)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 17)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.043, quantity 0.043, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.333, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 514 of 514)
| axis | accuracy |
|---|---|
| FULL | 0.576 |
| FULL [depth given] | 0.576 |
| FULL [depth and negation given] | 0.576 |
| FULL [presence not decided] | 0.558 |
| FULL [pooled midpoint (comparison)] | 0.446 |
| presence object: present read present | 0.948 |
| presence object: share of 'present' readings that abstain | 0.070 |
| presence object: share of true 'present' readings that abstain | 0.063 |
| presence shape: absent read absent | 0.995 |
| presence color: absent read absent | 0.995 |
| presence size: absent read absent | 0.998 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 0.998 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.987 |
| presence landmark2: absent read absent | 1.000 |
| presence region: present read present | 0.967 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.930 |
| presence target: absent read absent | 0.913 |
| presence style: absent read absent | 0.993 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.963 |
| presence targets: absent read absent | 0.945 |
| structure (depth, negation) | 0.911 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.918 |
| set targets: exact | 0.940 |
| predicate (surface lemma) | 0.823 |
| event type (synonym table) | 0.823 |
| role object | 0.840 |
| head object | 0.872 |
| lexical order head object | 0.681 |
| lexical bag head object | 0.768 |
| occupancy: unknown filler | 0.865 |
| role shape | 0.988 |
| head shape | 0.988 |
| lexical order head shape | 0.909 |
| lexical bag head shape | 0.982 |
| occupancy: not given | 0.988 |
| role color | 0.951 |
| head color | 0.951 |
| lexical order head color | 0.831 |
| lexical bag head color | 0.955 |
| role size | 0.990 |
| head size | 0.990 |
| lexical order head size | 0.911 |
| lexical bag head size | 0.963 |
| role name | 0.990 |
| head name | 0.990 |
| lexical order head name | 0.965 |
| lexical bag head name | 0.979 |
| role text | 0.998 |
| head text | 0.998 |
| lexical order head text | 0.986 |
| lexical bag head text | 0.992 |
| role relation | 0.967 |
| head relation | 0.967 |
| lexical order head relation | 0.877 |
| lexical bag head relation | 0.926 |
| role landmark | 0.971 |
| head landmark | 0.971 |
| lexical order head landmark | 0.829 |
| lexical bag head landmark | 0.860 |
| role landmark2 | 0.992 |
| head landmark2 | 0.992 |
| lexical order head landmark2 | 0.984 |
| lexical bag head landmark2 | 0.982 |
| role region | 0.986 |
| head region | 0.986 |
| lexical order head region | 0.940 |
| lexical bag head region | 0.961 |
| occupancy: known filler | 0.823 |
| role direction | 0.994 |
| head direction | 0.994 |
| lexical order head direction | 0.986 |
| lexical bag head direction | 0.990 |
| role amount | 0.992 |
| head amount | 0.992 |
| lexical order head amount | 0.984 |
| lexical bag head amount | 0.990 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.988 |
| lexical bag head quantity | 1.000 |
| role axis | 0.996 |
| head axis | 0.996 |
| lexical order head axis | 0.965 |
| lexical bag head axis | 0.990 |
| role layout | 0.998 |
| head layout | 0.998 |
| lexical order head layout | 0.982 |
| lexical bag head layout | 0.992 |
| role source | 0.914 |
| head source | 0.914 |
| lexical order head source | 0.883 |
| lexical bag head source | 0.926 |
| role target | 0.905 |
| head target | 0.905 |
| lexical order head target | 0.893 |
| lexical bag head target | 0.928 |
| role style | 0.992 |
| head style | 0.992 |
| lexical order head style | 0.977 |
| lexical bag head style | 0.988 |
| role arrow | 0.994 |
| head arrow | 0.994 |
| lexical order head arrow | 0.988 |
| lexical bag head arrow | 0.988 |
| role edge | 0.996 |
| head edge | 0.996 |
| lexical order head edge | 0.977 |
| lexical bag head edge | 0.990 |
| role pairing | 0.986 |
| head pairing | 0.986 |
| lexical order head pairing | 0.957 |
| lexical bag head pairing | 0.977 |
| role superlative | 0.998 |
| head superlative | 0.998 |
| lexical order head superlative | 0.944 |
| lexical bag head superlative | 0.986 |
| role comparison | 0.998 |
| head comparison | 0.998 |
| lexical order head comparison | 0.990 |
| lexical bag head comparison | 0.998 |
| role members | 0.903 |
| head members | 0.903 |
| lexical order head members | 0.868 |
| lexical bag head members | 0.866 |
| role targets | 0.940 |
| head targets | 0.940 |
| lexical order head targets | 0.971 |
| lexical bag head targets | 0.961 |
| heads FULL (model) | 0.650 |
| heads FULL (lexical order baseline) | 0.165 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.403 |
| role object [presence not decided] | 0.833 |
| role shape [presence not decided] | 0.986 |
| role color [presence not decided] | 0.957 |
| role size [presence not decided] | 0.990 |
| role name [presence not decided] | 0.990 |
| role text [presence not decided] | 0.907 |
| role relation [presence not decided] | 0.979 |
| role landmark [presence not decided] | 0.971 |
| role landmark2 [presence not decided] | 0.982 |
| role region [presence not decided] | 0.982 |
| role direction [presence not decided] | 0.992 |
| role amount [presence not decided] | 1.000 |
| role quantity [presence not decided] | 1.000 |
| role axis [presence not decided] | 0.996 |
| role layout [presence not decided] | 0.998 |
| role source [presence not decided] | 0.895 |
| role target [presence not decided] | 0.897 |
| role style [presence not decided] | 0.992 |
| role arrow [presence not decided] | 0.996 |
| role edge [presence not decided] | 0.990 |
| role pairing [presence not decided] | 0.998 |
| role superlative [presence not decided] | 0.998 |
| role comparison [presence not decided] | 0.998 |
| role members [presence not decided] | 0.842 |
| role targets [presence not decided] | 0.920 |
| heads FULL (model) [presence not decided] | 0.634 |
| role object [pooled midpoint (comparison)] | 0.722 |
| role shape [pooled midpoint (comparison)] | 0.988 |
| role color [pooled midpoint (comparison)] | 0.930 |
| role size [pooled midpoint (comparison)] | 0.981 |
| role name [pooled midpoint (comparison)] | 0.981 |
| role text [pooled midpoint (comparison)] | 0.996 |
| role relation [pooled midpoint (comparison)] | 0.942 |
| role landmark [pooled midpoint (comparison)] | 0.938 |
| role landmark2 [pooled midpoint (comparison)] | 0.990 |
| role region [pooled midpoint (comparison)] | 0.984 |
| role direction [pooled midpoint (comparison)] | 0.994 |
| role amount [pooled midpoint (comparison)] | 0.992 |
| role quantity [pooled midpoint (comparison)] | 0.996 |
| role axis [pooled midpoint (comparison)] | 0.996 |
| role layout [pooled midpoint (comparison)] | 0.996 |
| role source [pooled midpoint (comparison)] | 0.932 |
| role target [pooled midpoint (comparison)] | 0.932 |
| role style [pooled midpoint (comparison)] | 0.992 |
| role arrow [pooled midpoint (comparison)] | 0.996 |
| role edge [pooled midpoint (comparison)] | 0.996 |
| role pairing [pooled midpoint (comparison)] | 0.986 |
| role superlative [pooled midpoint (comparison)] | 0.996 |
| role comparison [pooled midpoint (comparison)] | 0.998 |
| role members [pooled midpoint (comparison)] | 0.864 |
| role targets [pooled midpoint (comparison)] | 0.936 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.504 |
| presence object: present read present [pooled midpoint (comparison)] | 0.674 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 0.998 |
| presence color: absent read absent [pooled midpoint (comparison)] | 0.997 |
| presence size: absent read absent [pooled midpoint (comparison)] | 0.998 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 0.998 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: present read present [pooled midpoint (comparison)] | 0.933 |
| presence direction: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence amount: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 0.970 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.980 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.998 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.977 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.937 |
| presence landmark: present read present | 0.951 |
| presence landmark: share of 'present' readings that abstain | 0.193 |
| presence landmark: share of true 'present' readings that abstain | 0.141 |
| presence region: absent read absent | 0.989 |
| presence comparison: present read present | 0.800 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.760 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.988 |
| presence comparison: present read present [pooled midpoint (comparison)] | 0.800 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 0.956 |
| presence color: share of 'present' readings that abstain | 0.060 |
| presence color: share of true 'present' readings that abstain | 0.062 |
| presence size: present read present | 0.955 |
| presence size: share of 'present' readings that abstain | 0.023 |
| presence size: share of true 'present' readings that abstain | 0.024 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.977 |
| presence color: present read present [pooled midpoint (comparison)] | 0.779 |
| presence size: present read present [pooled midpoint (comparison)] | 0.860 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.125 |
| presence text: share of true 'present' readings that abstain | 0.143 |
| presence relation: present read present | 0.821 |
| presence relation: share of 'present' readings that abstain | 0.109 |
| presence relation: share of true 'present' readings that abstain | 0.109 |
| presence text: present read present [pooled midpoint (comparison)] | 0.857 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.673 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence object: absent read absent | 0.915 |
| presence source: present read present | 0.855 |
| presence source: share of 'present' readings that abstain | 0.539 |
| presence source: share of true 'present' readings that abstain | 0.383 |
| presence target: share of 'present' readings that abstain | 0.415 |
| presence target: share of FALSE 'present' readings that abstain | 0.583 |
| presence members: share of 'present' readings that abstain | 0.453 |
| presence members: share of FALSE 'present' readings that abstain | 0.533 |
| presence targets: present read present | 0.846 |
| presence targets: share of 'present' readings that abstain | 0.611 |
| presence targets: share of true 'present' readings that abstain | 0.545 |
| set targets: first gold member in the decoded set | 0.733 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.990 |
| presence source: present read present [pooled midpoint (comparison)] | 0.731 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.846 |
| presence target: present read present | 0.885 |
| presence target: share of true 'present' readings that abstain | 0.283 |
| presence style: share of 'present' readings that abstain | 0.071 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence target: present read present [pooled midpoint (comparison)] | 0.625 |
| presence landmark2: present read present | 0.625 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: share of FALSE 'present' readings that abstain | 0.000 |
| presence layout: present read present | 0.889 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.938 |
| presence members: share of true 'present' readings that abstain | 0.433 |
| set members: first gold member in the decoded set | 0.750 |
| presence layout: present read present [pooled midpoint (comparison)] | 0.778 |
| presence members: present read present [pooled midpoint (comparison)] | 0.823 |
| presence source: share of FALSE 'present' readings that abstain | 0.793 |
| presence pairing: present read present | 0.714 |
| presence pairing: share of 'present' readings that abstain | 0.067 |
| presence pairing: share of true 'present' readings that abstain | 0.067 |
| presence targets: share of FALSE 'present' readings that abstain | 0.640 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.750 |
| presence style: present read present | 1.000 |
| presence style: share of true 'present' readings that abstain | 0.091 |
| presence edge: present read present | 0.909 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 0.818 |
| presence edge: present read present [pooled midpoint (comparison)] | 0.909 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present [pooled midpoint (comparison)] | 1.000 |
| presence superlative: present read present | 0.966 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.931 |
| presence name: present read present | 0.867 |
| presence landmark2: share of 'present' readings that abstain | 0.800 |
| presence landmark2: share of true 'present' readings that abstain | 0.800 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 0.533 |
| presence direction: present read present | 0.571 |
| presence amount: present read present | 0.500 |
| presence direction: present read present [pooled midpoint (comparison)] | 0.571 |
| presence amount: present read present [pooled midpoint (comparison)] | 0.500 |
| presence name: share of 'present' readings that abstain | 0.308 |
| presence name: share of true 'present' readings that abstain | 0.308 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 0.667 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.176 |
| presence arrow: present read present | 0.750 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present [pooled midpoint (comparison)] | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.250 |
| presence amount: share of true 'present' readings that abstain | 0.250 |
| presence direction: share of 'present' readings that abstain | 0.250 |
| presence direction: share of true 'present' readings that abstain | 0.250 |
| presence shape: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 1.000 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.230; status {'abstain': 145, 'ok': 323, 'no-sense': 10, 'unknown-event': 36}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.823 | 0.425 / 0.085 | 0.92 | 0.101 | 0.008 / 0.076 |
| role object | 0.783 | 0.261 / 0.015 | 0.86 | 0.130 | 0.050 / 0.087 |
| roles (pooled) | 0.778 | 0.210 / 0.000 | 0.76 | 0.071 | 0.087 / 0.151 |
| role region | 0.935 | 0.332 / 0.221 | 0.97 | 0.032 | 0.000 / 0.032 |
| role landmark | 0.886 | 0.164 / 0.012 | 0.77 | 0.011 | 0.125 / 0.102 |
| role comparison | 0.800 | 0.222 / 0.092 | 0.80 | 0.000 | 0.000 / 0.200 |
| role shape | 0.915 | 0.283 / 0.150 | 0.94 | 0.021 | 0.000 / 0.064 |
| role color | 0.736 | 0.205 / 0.000 | 0.75 | 0.057 | 0.046 / 0.207 |
| role size | 0.913 | 0.263 / 0.072 | 0.89 | 0.000 | 0.022 / 0.087 |
| role text | 1.000 | 0.208 / 0.116 | 0.86 | 0.000 | 0.143 / 0.000 |
| role relation | 0.730 | 0.172 / 0.000 | 0.68 | 0.032 | 0.079 / 0.238 |
| role source | 0.750 | 0.081 / 0.000 | 0.50 | 0.017 | 0.267 / 0.233 |
| role targets | 0.600 | 0.034 / 0.000 | 0.33 | 0.000 | 0.267 / 0.400 |
| role target | 0.764 | 0.125 / 0.001 | 0.64 | 0.055 | 0.182 / 0.182 |
| role landmark2 | 0.500 | 0.024 / 0.000 | 0.12 | 0.000 | 0.375 / 0.500 |
| role layout | 0.889 | 0.260 / 0.045 | 0.89 | 0.000 | 0.000 / 0.111 |
| role members | 0.485 | 0.116 / 0.002 | 0.53 | 0.206 | 0.162 / 0.309 |
| role pairing | 0.682 | 0.216 / 0.000 | 0.68 | 0.045 | 0.045 / 0.273 |
| role style | 0.917 | 0.219 / 0.123 | 0.92 | 0.083 | 0.083 / 0.000 |
| role edge | 0.833 | 0.240 / 0.076 | 0.92 | 0.083 | 0.000 / 0.083 |
| role axis | 0.889 | 0.204 / 0.071 | 0.89 | 0.000 | 0.000 / 0.111 |
| role superlative | 0.966 | 0.450 / 0.383 | 0.97 | 0.000 | 0.000 / 0.034 |
| role name | 0.722 | 0.124 / 0.000 | 0.56 | 0.056 | 0.222 / 0.222 |
| role direction | 0.571 | 0.075 / 0.000 | 0.43 | 0.000 | 0.143 / 0.429 |
| role amount | 0.500 | 0.055 / 0.000 | 0.38 | 0.000 | 0.125 / 0.500 |
| role quantity | 1.000 | 0.268 / 0.105 | 1.00 | 0.000 | 0.000 / 0.000 |
| role arrow | 0.500 | 0.159 / 0.040 | 0.83 | 0.333 | 0.000 / 0.167 |

### train (sample) — catalog candidates (n = 300 of 9129)
| axis | accuracy |
|---|---|
| FULL | 0.673 |
| FULL [depth given] | 0.673 |
| FULL [depth and negation given] | 0.673 |
| presence object: present read present | 0.911 |
| presence object: share of 'present' readings that abstain | 0.053 |
| presence object: share of true 'present' readings that abstain | 0.042 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: present read present | 0.980 |
| presence landmark: share of 'present' readings that abstain | 0.096 |
| presence landmark: share of true 'present' readings that abstain | 0.061 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.984 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.934 |
| presence target: absent read absent | 0.910 |
| presence style: absent read absent | 0.996 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.959 |
| presence targets: absent read absent | 0.951 |
| structure (depth, negation) | 0.920 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.937 |
| set targets: exact | 0.947 |
| predicate (surface lemma) | 0.880 |
| event type (synonym table) | 0.880 |
| role object | 0.863 |
| head object | 0.873 |
| lexical order head object | 0.690 |
| lexical bag head object | 0.890 |
| occupancy: known filler | 0.856 |
| role shape | 0.997 |
| head shape | 0.997 |
| lexical order head shape | 0.950 |
| lexical bag head shape | 1.000 |
| occupancy: not given | 0.989 |
| role color | 0.957 |
| head color | 0.957 |
| lexical order head color | 0.837 |
| lexical bag head color | 0.993 |
| role size | 0.990 |
| head size | 0.990 |
| lexical order head size | 0.893 |
| lexical bag head size | 0.967 |
| role name | 0.997 |
| head name | 0.997 |
| lexical order head name | 0.967 |
| lexical bag head name | 0.997 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.977 |
| lexical bag head text | 1.000 |
| role relation | 0.990 |
| head relation | 0.990 |
| lexical order head relation | 0.897 |
| lexical bag head relation | 0.977 |
| role landmark | 0.977 |
| head landmark | 0.977 |
| lexical order head landmark | 0.827 |
| lexical bag head landmark | 0.957 |
| role landmark2 | 0.993 |
| head landmark2 | 0.993 |
| lexical order head landmark2 | 0.980 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.987 |
| head region | 0.987 |
| lexical order head region | 0.937 |
| lexical bag head region | 0.983 |
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
| lexical order head quantity | 0.990 |
| lexical bag head quantity | 1.000 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.980 |
| lexical bag head axis | 1.000 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 0.990 |
| lexical bag head layout | 1.000 |
| role source | 0.913 |
| head source | 0.913 |
| lexical order head source | 0.870 |
| lexical bag head source | 0.970 |
| role target | 0.897 |
| head target | 0.897 |
| lexical order head target | 0.877 |
| lexical bag head target | 0.983 |
| role style | 0.993 |
| head style | 0.993 |
| lexical order head style | 0.983 |
| lexical bag head style | 0.997 |
| role arrow | 0.997 |
| head arrow | 0.997 |
| lexical order head arrow | 0.990 |
| lexical bag head arrow | 0.993 |
| role edge | 0.993 |
| head edge | 0.993 |
| lexical order head edge | 0.983 |
| lexical bag head edge | 0.993 |
| role pairing | 0.997 |
| head pairing | 0.997 |
| lexical order head pairing | 0.947 |
| lexical bag head pairing | 1.000 |
| role superlative | 1.000 |
| head superlative | 1.000 |
| lexical order head superlative | 0.927 |
| lexical bag head superlative | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.997 |
| lexical bag head comparison | 1.000 |
| role members | 0.927 |
| head members | 0.927 |
| lexical order head members | 0.893 |
| lexical bag head members | 0.887 |
| role targets | 0.947 |
| head targets | 0.947 |
| lexical order head targets | 0.970 |
| lexical bag head targets | 0.957 |
| heads FULL (model) | 0.707 |
| heads FULL (lexical order baseline) | 0.190 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.670 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.967 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.667 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence object: absent read absent | 0.941 |
| presence landmark: absent read absent | 0.987 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence target: share of 'present' readings that abstain | 0.294 |
| presence target: share of FALSE 'present' readings that abstain | 0.636 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.067 |
| presence pairing: share of true 'present' readings that abstain | 0.067 |
| presence members: present read present | 0.903 |
| presence members: share of 'present' readings that abstain | 0.263 |
| presence members: share of true 'present' readings that abstain | 0.143 |
| set members: first gold member in the decoded set | 0.875 |
| occupancy: unknown filler | 0.854 |
| presence color: present read present | 0.947 |
| presence color: share of 'present' readings that abstain | 0.056 |
| presence color: share of true 'present' readings that abstain | 0.056 |
| presence name: present read present | 0.900 |
| presence name: share of 'present' readings that abstain | 0.222 |
| presence name: share of true 'present' readings that abstain | 0.222 |
| presence source: share of 'present' readings that abstain | 0.298 |
| presence source: share of FALSE 'present' readings that abstain | 0.562 |
| presence targets: share of 'present' readings that abstain | 0.750 |
| presence targets: share of FALSE 'present' readings that abstain | 0.846 |
| presence source: present read present | 0.912 |
| presence source: share of true 'present' readings that abstain | 0.161 |
| presence members: share of FALSE 'present' readings that abstain | 0.600 |
| presence targets: present read present | 0.778 |
| set targets: first gold member in the decoded set | 0.778 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.087 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence targets: share of true 'present' readings that abstain | 0.571 |
| presence target: present read present | 0.906 |
| presence target: share of true 'present' readings that abstain | 0.034 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 0.800 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 0.750 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.286 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.500 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.667 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |

residual mean 0.207; status {'abstain': 63, 'ok': 213, 'unknown-event': 21, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.880 | 0.451 / 0.117 | 0.92 | 0.043 | 0.000 / 0.077 |
| role object | 0.805 | 0.288 / 0.000 | 0.86 | 0.092 | 0.034 / 0.103 |
| roles (pooled) | 0.826 | 0.241 / 0.003 | 0.85 | 0.068 | 0.047 / 0.106 |
| role landmark | 0.923 | 0.197 / 0.059 | 0.90 | 0.019 | 0.038 / 0.058 |
| role size | 0.906 | 0.290 / 0.220 | 0.94 | 0.031 | 0.000 / 0.062 |
| role text | 1.000 | 0.203 / 0.161 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.903 | 0.243 / 0.082 | 0.94 | 0.032 | 0.000 / 0.065 |
| role landmark2 | 0.667 | 0.013 / -0.002 | 0.00 | 0.000 | 0.667 / 0.333 |
| role superlative | 1.000 | 0.473 / 0.431 | 1.00 | 0.000 | 0.000 / 0.000 |
| role color | 0.735 | 0.191 / 0.000 | 0.71 | 0.020 | 0.041 / 0.245 |
| role pairing | 0.938 | 0.255 / 0.102 | 0.94 | 0.062 | 0.062 / 0.000 |
| role members | 0.625 | 0.138 / 0.013 | 0.78 | 0.219 | 0.062 / 0.156 |
| role name | 0.900 | 0.146 / 0.013 | 0.70 | 0.000 | 0.200 / 0.100 |
| role source | 0.744 | 0.152 / 0.002 | 0.74 | 0.077 | 0.077 / 0.179 |
| role targets | 0.667 | 0.040 / 0.000 | 0.33 | 0.111 | 0.444 / 0.222 |
| role region | 1.000 | 0.344 / 0.256 | 1.00 | 0.000 | 0.000 / 0.000 |
| role target | 0.757 | 0.164 / 0.017 | 0.86 | 0.135 | 0.027 / 0.108 |
| role shape | 0.933 | 0.283 / 0.263 | 0.93 | 0.000 | 0.000 / 0.067 |
| role style | 0.800 | 0.207 / 0.085 | 0.80 | 0.000 | 0.000 / 0.200 |
| role edge | 0.600 | 0.269 / 0.116 | 0.80 | 0.200 | 0.000 / 0.200 |
| role axis | 1.000 | 0.272 / 0.215 | 1.00 | 0.000 | 0.000 / 0.000 |
| role layout | 1.000 | 0.377 / 0.274 | 1.00 | 0.000 | 0.000 / 0.000 |
| role arrow | 0.667 | 0.266 / 0.171 | 1.00 | 0.333 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.298 / 0.274 | 1.00 | 0.000 | 0.000 / 0.000 |
| role comparison | 1.000 | 0.306 / 0.306 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 SUPER=1.00 COLOR=0.99 LAYOUT=0.98 AXIS=0.97 once=0.96 pixels=0.96 rules=0.95 have=0.95 TEXT=0.88 active=0.86 PAIR=0.83 undid=0.81 that=0.79 connections=0.78 again=0.75 NUM=0.73 whole=0.71 come=0.71 it=0.70 line=0.69 last=0.65 are=0.63 defaults=0.63 NAME=0.59 canvas=0.57 ARROW=0.56 its=0.53 set=0.53 for=0.49 diagram=0.47 me=0.45 as=0.45 little=0.44 we=0.42 there=0.42 them=0.41 VERB=0.41 my=0.40 bit=0.39 this=0.39 please=0.36 axe=0.35 page=0.32 links=0.31 everything=0.29 him=0.28 RECENT=0.26 how=0.26 map=0.26 her=0.26 lines=0.25 zap=0.24 earlier=0.23 from=0.22 exist=0.22 old=0.22 show=0.21 now=0.21 evenly=0.20 in=0.20 does=0.18 uh=0.18 any=0.17 far=0.16 front=0.16 do=0.15 about=0.14 not=0.14 what's=0.14 check=0.13 total=0.13 plan=0.12 no=0.12 NOTCOLOR=0.12 put=0.12 connection=0.11 then=0.11 remove=0.11 wait=0.10 list=0.10 ones=0.09 around=0.09 things=0.08 change=0.08 here=0.08 board=0.07 thing=0.07 others=0.06 feeds=0.06 hmm=0.06 node=0.06 throw=0.06 but=0.06 axis=0.06 well=0.06 loop=0.06 step=0.05 those=0.05 anything=0.05 arrow=0.05 too=0.05 sheet=0.05 anywhere=0.05 if=0.04 corner=0.04 flow=0.04 stack=0.04 SHAPE=0.04 other=0.03 with=0.03 long=0.03 more=0.03 along=0.03 first=0.03 park=0.03 mean=0.03 stop=0.03 give=0.03 another=0.03 on=0.03 side=0.03 two=0.03 out=0.03 tell=0.03 go=0.03 linked=0.02 these=0.02 colour=0.02 i'd=0.02 like=0.02 default=0.02 sits=0.02 leads=0.02 order=0.02 also=0.02 directly=0.02 can=0.02 could=0.02 hall=0.02 place=0.02 labelled=0.02 each=0.02 so=0.02 way=0.02 same=0.02 still=0.01 box=0.01 you=0.01 link=0.01 arrows=0.01 i=0.01 by=0.01 just=0.01 want=0.01 has=0.01 new=0.01 every=0.01 both=0.01 be=0.01 who=0.01 four=0.01 goes=0.01 at=0.01 should=0.01 into=0.01 an=0.01 DIR=0.01 three=0.01 back=0.01 shapes=0.01 STYLE=0.01 what=0.00 SIZE=0.00 QUANT=0.00 the=0.00 shape=0.00 one=0.00 of=0.00 named=0.00 labeled=0.00 called=0.00 to=0.00 unknown=0.00 and=0.00 a=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.576
- heldout_formulations: presence object: share of 'present' readings that abstain 0.070
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.063
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: predicate (surface lemma) 0.823
- heldout_formulations: event type (synonym table) 0.823
- heldout_formulations: role object 0.840
- heldout_formulations: head object 0.872
- heldout_formulations: occupancy: unknown filler 0.865
- heldout_formulations: occupancy: known filler 0.823
- heldout_formulations: heads FULL (model) 0.650
- heldout_formulations: heads FULL (lexical order baseline) 0.165
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.403
- heldout_formulations: FULL [depth given] 0.576
- heldout_formulations: FULL [depth and negation given] 0.576
- heldout_formulations: FULL [presence not decided] 0.558
- heldout_formulations: role object [presence not decided] 0.833
- heldout_formulations: role source [presence not decided] 0.895
- heldout_formulations: role target [presence not decided] 0.897
- heldout_formulations: role members [presence not decided] 0.842
- heldout_formulations: heads FULL (model) [presence not decided] 0.634
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.446
- heldout_formulations: role object [pooled midpoint (comparison)] 0.722
- heldout_formulations: role members [pooled midpoint (comparison)] 0.864
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.504
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.674
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.193
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.141
- heldout_formulations: presence comparison: present read present 0.800
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.760
- heldout_formulations: presence comparison: present read present [pooled midpoint (comparison)] 0.800
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.060
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.062
- heldout_formulations: presence size: share of 'present' readings that abstain 0.023
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.024
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.779
- heldout_formulations: presence size: present read present [pooled midpoint (comparison)] 0.860
- heldout_formulations: presence text: share of 'present' readings that abstain 0.125
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.143
- heldout_formulations: presence relation: present read present 0.821
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.109
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.109
- heldout_formulations: presence text: present read present [pooled midpoint (comparison)] 0.857
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.673
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_formulations: presence source: present read present 0.855
- heldout_formulations: presence source: share of 'present' readings that abstain 0.539
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.383
- heldout_formulations: presence target: share of 'present' readings that abstain 0.415
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.583
- heldout_formulations: presence members: share of 'present' readings that abstain 0.453
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.533
- heldout_formulations: presence targets: present read present 0.846
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.611
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.545
- heldout_formulations: set targets: first gold member in the decoded set 0.733
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.731
- heldout_formulations: presence targets: present read present [pooled midpoint (comparison)] 0.846
- heldout_formulations: presence target: present read present 0.885
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.283
- heldout_formulations: presence style: share of 'present' readings that abstain 0.071
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.625
- heldout_formulations: presence landmark2: present read present 0.625
- heldout_formulations: presence text: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence layout: present read present 0.889
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.433
- heldout_formulations: set members: first gold member in the decoded set 0.750
- heldout_formulations: presence layout: present read present [pooled midpoint (comparison)] 0.778
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.823
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.793
- heldout_formulations: presence pairing: present read present 0.714
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.067
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.067
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.640
- heldout_formulations: presence pairing: present read present [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.091
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: present read present [pooled midpoint (comparison)] 0.818
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence name: present read present 0.867
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.800
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.800
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence name: present read present [pooled midpoint (comparison)] 0.533
- heldout_formulations: presence direction: present read present 0.571
- heldout_formulations: presence amount: present read present 0.500
- heldout_formulations: presence direction: present read present [pooled midpoint (comparison)] 0.571
- heldout_formulations: presence amount: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence name: share of 'present' readings that abstain 0.308
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.308
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence color: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.176
- heldout_formulations: presence arrow: present read present 0.750
- heldout_formulations: presence arrow: share of 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence amount: share of 'present' readings that abstain 0.250
- heldout_formulations: presence amount: share of true 'present' readings that abstain 0.250
- heldout_formulations: presence direction: share of 'present' readings that abstain 0.250
- heldout_formulations: presence direction: share of true 'present' readings that abstain 0.250
- heldout_formulations: presence shape: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.673
- train (sample): presence object: share of 'present' readings that abstain 0.053
- train (sample): presence object: share of true 'present' readings that abstain 0.042
- train (sample): presence landmark: share of 'present' readings that abstain 0.096
- train (sample): presence landmark: share of true 'present' readings that abstain 0.061
- train (sample): predicate (surface lemma) 0.880
- train (sample): event type (synonym table) 0.880
- train (sample): role object 0.863
- train (sample): head object 0.873
- train (sample): occupancy: known filler 0.856
- train (sample): role target 0.897
- train (sample): head target 0.897
- train (sample): heads FULL (model) 0.707
- train (sample): heads FULL (lexical order baseline) 0.190
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.670
- train (sample): FULL [depth given] 0.673
- train (sample): FULL [depth and negation given] 0.673
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: present read present 0.667
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence target: share of 'present' readings that abstain 0.294
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.636
- train (sample): presence pairing: share of 'present' readings that abstain 0.067
- train (sample): presence pairing: share of true 'present' readings that abstain 0.067
- train (sample): presence members: share of 'present' readings that abstain 0.263
- train (sample): presence members: share of true 'present' readings that abstain 0.143
- train (sample): set members: first gold member in the decoded set 0.875
- train (sample): occupancy: unknown filler 0.854
- train (sample): presence color: share of 'present' readings that abstain 0.056
- train (sample): presence color: share of true 'present' readings that abstain 0.056
- train (sample): presence name: share of 'present' readings that abstain 0.222
- train (sample): presence name: share of true 'present' readings that abstain 0.222
- train (sample): presence source: share of 'present' readings that abstain 0.298
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.562
- train (sample): presence targets: share of 'present' readings that abstain 0.750
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.846
- train (sample): presence source: share of true 'present' readings that abstain 0.161
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.600
- train (sample): presence targets: present read present 0.778
- train (sample): set targets: first gold member in the decoded set 0.778
- train (sample): presence region: share of 'present' readings that abstain 0.087
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence targets: share of true 'present' readings that abstain 0.571
- train (sample): presence target: share of true 'present' readings that abstain 0.034
- train (sample): presence style: share of 'present' readings that abstain 0.000
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence style: present read present 0.800
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: present read present 0.750
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.286
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.667
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence arrow: share of 'present' readings that abstain 0.000
- train (sample): presence arrow: share of true 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 6)
- heldout_formulations: `connect NAME to NAME and NAME` FULL 0.000 (n 5)
- heldout_formulations: `connect NAME to NAME and NAME to NAME` FULL 0.000 (n 5)
- heldout_formulations: `is NAME path_q NAME` FULL 0.000 (n 5)
- heldout_formulations: `is NAME POS NAME` FULL 0.000 (n 4)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role direction | role amount | role quantity | role axis | role layout | role source | role target | role style | role arrow | role edge | role pairing | role superlative | role comparison | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.650 | 0.576 | 0.840 | 0.988 | 0.951 | 0.990 | 0.990 | 0.998 | 0.967 | 0.971 | 0.992 | 0.986 | 0.994 | 0.992 | 1.000 | 0.996 | 0.998 | 0.914 | 0.905 | 0.992 | 0.994 | 0.996 | 0.986 | 0.998 | 0.998 | 0.903 | 0.940 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.504 | 0.446 | 0.722 | 0.988 | 0.930 | 0.981 | 0.981 | 0.996 | 0.942 | 0.938 | 0.990 | 0.984 | 0.994 | 0.992 | 0.996 | 0.996 | 0.996 | 0.932 | 0.932 | 0.992 | 0.996 | 0.996 | 0.986 | 0.996 | 0.998 | 0.864 | 0.936 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.634 | 0.558 | 0.833 | 0.986 | 0.957 | 0.990 | 0.990 | 0.907 | 0.979 | 0.971 | 0.982 | 0.982 | 0.992 | 1.000 | 1.000 | 0.996 | 0.998 | 0.895 | 0.897 | 0.992 | 0.996 | 0.990 | 0.998 | 0.998 | 0.998 | 0.842 | 0.920 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.948 | 0.915 | 0.931 | 0.070 (0.176 / 0.063) |
| heldout_formulations | object | comparison: pooled midpoint | 0.674 | 0.990 | 0.832 |  |
| heldout_formulations | shape | product: fitted | 1.000 | 0.995 | 0.998 | 0.000 (0.000 / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.977 | 0.998 | 0.987 |  |
| heldout_formulations | color | product: fitted | 0.956 | 0.995 | 0.975 | 0.060 (0.000 / 0.062) |
| heldout_formulations | color | comparison: pooled midpoint | 0.779 | 0.997 | 0.888 |  |
| heldout_formulations | size | product: fitted | 0.955 | 0.998 | 0.976 | 0.023 (0.000 / 0.024) |
| heldout_formulations | size | comparison: pooled midpoint | 0.860 | 0.998 | 0.929 |  |
| heldout_formulations | name | product: fitted | 0.867 | 1.000 | 0.933 | 0.308 (— / 0.308) |
| heldout_formulations | name | comparison: pooled midpoint | 0.533 | 1.000 | 0.767 |  |
| heldout_formulations | text | product: fitted | 1.000 | 0.998 | 0.999 | 0.125 (0.000 / 0.143) |
| heldout_formulations | text | comparison: pooled midpoint | 0.857 | 0.998 | 0.927 |  |
| heldout_formulations | relation | product: fitted | 0.821 | 1.000 | 0.911 | 0.109 (— / 0.109) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.673 | 1.000 | 0.837 |  |
| heldout_formulations | landmark | product: fitted | 0.951 | 0.987 | 0.969 | 0.193 (1.000 / 0.141) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.760 | 1.000 | 0.880 |  |
| heldout_formulations | landmark2 | product: fitted | 0.625 | 1.000 | 0.812 | 0.800 (— / 0.800) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 0.967 | 0.989 | 0.978 | 0.000 (0.000 / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 0.933 | 0.988 | 0.961 |  |
| heldout_formulations | direction | product: fitted | 0.571 | 1.000 | 0.786 | 0.250 (— / 0.250) |
| heldout_formulations | direction | comparison: pooled midpoint | 0.571 | 1.000 | 0.786 |  |
| heldout_formulations | amount | product: fitted | 0.500 | 1.000 | 0.750 | 0.250 (— / 0.250) |
| heldout_formulations | amount | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 0.889 | 1.000 | 0.944 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 0.778 | 1.000 | 0.889 |  |
| heldout_formulations | source | product: fitted | 0.855 | 0.930 | 0.892 | 0.539 (0.793 / 0.383) |
| heldout_formulations | source | comparison: pooled midpoint | 0.731 | 0.970 | 0.851 |  |
| heldout_formulations | target | product: fitted | 0.885 | 0.913 | 0.899 | 0.415 (0.583 / 0.283) |
| heldout_formulations | target | comparison: pooled midpoint | 0.625 | 0.980 | 0.803 |  |
| heldout_formulations | style | product: fitted | 1.000 | 0.993 | 0.997 | 0.071 (0.000 / 0.091) |
| heldout_formulations | style | comparison: pooled midpoint | 0.818 | 0.998 | 0.908 |  |
| heldout_formulations | arrow | product: fitted | 0.750 | 1.000 | 0.875 | 0.000 (— / 0.000) |
| heldout_formulations | arrow | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | edge | product: fitted | 0.909 | 1.000 | 0.955 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 0.909 | 1.000 | 0.955 |  |
| heldout_formulations | pairing | product: fitted | 0.714 | 1.000 | 0.857 | 0.067 (— / 0.067) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_formulations | superlative | product: fitted | 0.966 | 1.000 | 0.983 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 0.931 | 1.000 | 0.966 |  |
| heldout_formulations | comparison | product: fitted | 0.800 | 1.000 | 0.900 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 0.800 | 1.000 | 0.900 |  |
| heldout_formulations | members | product: fitted | 0.938 | 0.963 | 0.950 | 0.453 (0.533 / 0.433) |
| heldout_formulations | members | comparison: pooled midpoint | 0.823 | 0.977 | 0.900 |  |
| heldout_formulations | targets | product: fitted | 0.846 | 0.945 | 0.896 | 0.611 (0.640 / 0.545) |
| heldout_formulations | targets | comparison: pooled midpoint | 0.846 | 0.937 | 0.891 |  |
| train (sample) | object | product: fitted | 0.911 | 0.941 | 0.926 | 0.053 (0.286 / 0.042) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.947 | 1.000 | 0.974 | 0.056 (— / 0.056) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | name | product: fitted | 0.900 | 1.000 | 0.950 | 0.222 (— / 0.222) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.967 | 1.000 | 0.983 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.980 | 0.987 | 0.983 | 0.096 (0.667 / 0.061) |
| train (sample) | landmark2 | product: fitted | 0.667 | 1.000 | 0.833 | 1.000 (— / 1.000) |
| train (sample) | region | product: fitted | 1.000 | 0.984 | 0.992 | 0.087 (0.500 / 0.000) |
| train (sample) | direction | product: fitted | — | 1.000 | — |  |
| train (sample) | amount | product: fitted | — | 1.000 | — |  |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.912 | 0.934 | 0.923 | 0.298 (0.562 / 0.161) |
| train (sample) | target | product: fitted | 0.906 | 0.910 | 0.908 | 0.294 (0.636 / 0.034) |
| train (sample) | style | product: fitted | 0.800 | 0.996 | 0.898 | 0.000 (0.000 / 0.000) |
| train (sample) | arrow | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | edge | product: fitted | 0.750 | 1.000 | 0.875 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.067 (— / 0.067) |
| train (sample) | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 0.903 | 0.959 | 0.931 | 0.263 (0.600 / 0.143) |
| train (sample) | targets | product: fitted | 0.778 | 0.951 | 0.865 | 0.750 (0.846 / 0.571) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
