# REPORT — world `real`, legend sha256:12cf77be5d58… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4282 annotated sentences from 2 files; provenance: {'llm': 4282}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/fv3_p80_D1024_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 210 sentences
- heldout_formulations: 172 sentences
- train: 3900 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
24336 tokens in the examples; 1024 with no kind in the lexicon (share 0.042), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 81e1d04. Memory curve: runs/fv3_p80_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.119 [rule: fit; pooled midpoint 0.290 (comparison)] (present 0.580, n 168 / absent 0.001, n 678536)
- set_member:targets: threshold 0.092 [rule: fit; pooled midpoint 0.107 (comparison)] (present 0.214, n 45 / absent -0.001, n 190715)
- presence:object: threshold 0.112 [rule: fit; pooled midpoint 0.583 (comparison)] (present 1.053, n 355 / absent 0.113, n 255)
- presence:shape: threshold 0.375 [rule: fit; pooled midpoint 0.343 (comparison)] (present 0.677, n 57 / absent 0.009, n 553)
- presence:color: threshold 0.121 [rule: fit; pooled midpoint 0.412 (comparison)] (present 0.813, n 108 / absent 0.011, n 502)
- presence:size: threshold 0.306 [rule: fit; pooled midpoint 0.360 (comparison)] (present 0.698, n 85 / absent 0.022, n 525)
- presence:name: threshold 0.205 [rule: fit; pooled midpoint 0.236 (comparison)] (present 0.471, n 17 / absent 0.001, n 593)
- presence:text: threshold 0.014 [rule: fit; pooled midpoint 0.314 (comparison)] (present 0.642, n 26 / absent -0.014, n 584)
- presence:relation: threshold 0.114 [rule: fit; pooled midpoint 0.368 (comparison)] (present 0.727, n 78 / absent 0.009, n 532)
- presence:landmark: threshold 0.170 [rule: fit; pooled midpoint 0.400 (comparison)] (present 0.768, n 109 / absent 0.031, n 501)
- presence:landmark2: threshold 0.164 [rule: fit; pooled midpoint 0.160 (comparison)] (present 0.315, n 8 / absent 0.006, n 602)
- presence:region: threshold 0.131 [rule: fit; pooled midpoint 0.290 (comparison)] (present 0.551, n 29 / absent 0.030, n 581)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 608)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 607)
- presence:quantity: threshold 0.070 [rule: fit; pooled midpoint 0.180 (comparison)] (present 0.360, n 8 / absent -0.000, n 602)
- presence:axis: threshold 0.183 [rule: fit; pooled midpoint 0.308 (comparison)] (present 0.616, n 9 / absent 0.000, n 601)
- presence:layout: threshold 0.297 [rule: fit; pooled midpoint 0.401 (comparison)] (present 0.801, n 12 / absent 0.000, n 598)
- presence:source: threshold 0.259 [rule: fit; pooled midpoint 0.364 (comparison)] (present 0.706, n 81 / absent 0.022, n 529)
- presence:target: threshold 0.312 [rule: fit; pooled midpoint 0.344 (comparison)] (present 0.661, n 57 / absent 0.027, n 553)
- presence:style: threshold 0.047 [rule: fit; pooled midpoint 0.257 (comparison)] (present 0.504, n 20 / absent 0.010, n 590)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 607)
- presence:edge: threshold 0.309 [rule: fit; pooled midpoint 0.353 (comparison)] (present 0.707, n 14 / absent -0.001, n 596)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 14)
- presence:pairing: threshold 0.408 [rule: fit; pooled midpoint 0.445 (comparison)] (present 0.880, n 35 / absent 0.009, n 575)
- presence:superlative: threshold 0.201 [rule: fit; pooled midpoint 0.432 (comparison)] (present 0.864, n 62 / absent 0.000, n 548)
- presence:comparison: threshold 0.241 [rule: fit; pooled midpoint 0.274 (comparison)] (present 0.547, n 5 / absent 0.001, n 605)
- presence:members: threshold 0.375 [rule: fit; pooled midpoint 0.494 (comparison)] (present 0.866, n 62 / absent 0.121, n 548)
- presence:targets: threshold 0.197 [rule: fit; pooled midpoint 0.155 (comparison)] (present 0.281, n 23 / absent 0.029, n 587)
- attr_presence:object: threshold 0.364 [rule: fit; pooled midpoint 0.373 (comparison)] (present 0.623, n 28 / absent 0.122, n 327)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 352)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.059, quantity 0.059, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 172 of 172)
| axis | accuracy |
|---|---|
| FULL | 0.692 |
| FULL [depth given] | 0.692 |
| FULL [depth and negation given] | 0.692 |
| FULL [presence not decided] | 0.669 |
| FULL [pooled midpoint (comparison)] | 0.517 |
| presence object: present read present | 0.962 |
| presence object: share of 'present' readings that abstain | 0.085 |
| presence object: share of true 'present' readings that abstain | 0.078 |
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
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.952 |
| presence target: absent read absent | 0.966 |
| presence style: absent read absent | 0.981 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.966 |
| presence targets: absent read absent | 0.968 |
| structure (depth, negation) | 0.942 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.936 |
| set targets: exact | 0.959 |
| predicate (surface lemma) | 0.901 |
| event type (synonym table) | 0.901 |
| role object | 0.895 |
| head object | 0.913 |
| lexical order head object | 0.750 |
| lexical bag head object | 0.791 |
| occupancy: unknown filler | 0.872 |
| role shape | 0.988 |
| head shape | 0.988 |
| lexical order head shape | 0.907 |
| lexical bag head shape | 0.988 |
| occupancy: not given | 0.992 |
| role color | 0.948 |
| head color | 0.948 |
| lexical order head color | 0.779 |
| lexical bag head color | 0.971 |
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
| lexical order head relation | 0.872 |
| lexical bag head relation | 0.959 |
| role landmark | 0.983 |
| head landmark | 0.983 |
| lexical order head landmark | 0.826 |
| lexical bag head landmark | 0.872 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.994 |
| lexical bag head landmark2 | 0.988 |
| role region | 0.994 |
| head region | 0.994 |
| lexical order head region | 0.948 |
| lexical bag head region | 0.971 |
| occupancy: known filler | 0.865 |
| role direction | 0.994 |
| head direction | 0.994 |
| lexical order head direction | 0.994 |
| lexical bag head direction | 0.994 |
| role amount | 0.994 |
| head amount | 0.994 |
| lexical order head amount | 0.994 |
| lexical bag head amount | 0.994 |
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
| lexical order head source | 0.895 |
| lexical bag head source | 0.919 |
| role target | 0.936 |
| head target | 0.936 |
| lexical order head target | 0.907 |
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
| role members | 0.936 |
| head members | 0.936 |
| lexical order head members | 0.907 |
| lexical bag head members | 0.907 |
| role targets | 0.959 |
| head targets | 0.959 |
| lexical order head targets | 0.965 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.727 |
| heads FULL (lexical order baseline) | 0.203 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.477 |
| role object [presence not decided] | 0.895 |
| role shape [presence not decided] | 0.988 |
| role color [presence not decided] | 0.965 |
| role size [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 0.913 |
| role relation [presence not decided] | 0.988 |
| role landmark [presence not decided] | 0.983 |
| role landmark2 [presence not decided] | 0.994 |
| role region [presence not decided] | 0.988 |
| role direction [presence not decided] | 0.971 |
| role amount [presence not decided] | 1.000 |
| role quantity [presence not decided] | 1.000 |
| role axis [presence not decided] | 1.000 |
| role layout [presence not decided] | 1.000 |
| role source [presence not decided] | 0.930 |
| role target [presence not decided] | 0.895 |
| role style [presence not decided] | 0.983 |
| role arrow [presence not decided] | 1.000 |
| role edge [presence not decided] | 0.988 |
| role pairing [presence not decided] | 1.000 |
| role superlative [presence not decided] | 0.994 |
| role comparison [presence not decided] | 1.000 |
| role members [presence not decided] | 0.890 |
| role targets [presence not decided] | 0.930 |
| heads FULL (model) [presence not decided] | 0.703 |
| role object [pooled midpoint (comparison)] | 0.721 |
| role shape [pooled midpoint (comparison)] | 0.988 |
| role color [pooled midpoint (comparison)] | 0.907 |
| role size [pooled midpoint (comparison)] | 1.000 |
| role name [pooled midpoint (comparison)] | 1.000 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.959 |
| role landmark [pooled midpoint (comparison)] | 0.959 |
| role landmark2 [pooled midpoint (comparison)] | 0.994 |
| role region [pooled midpoint (comparison)] | 0.994 |
| role direction [pooled midpoint (comparison)] | 0.994 |
| role amount [pooled midpoint (comparison)] | 0.994 |
| role quantity [pooled midpoint (comparison)] | 0.988 |
| role axis [pooled midpoint (comparison)] | 1.000 |
| role layout [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.953 |
| role target [pooled midpoint (comparison)] | 0.930 |
| role style [pooled midpoint (comparison)] | 0.994 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 0.988 |
| role superlative [pooled midpoint (comparison)] | 0.994 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.890 |
| role targets [pooled midpoint (comparison)] | 0.953 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.547 |
| presence object: present read present [pooled midpoint (comparison)] | 0.686 |
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
| presence source: absent read absent [pooled midpoint (comparison)] | 0.979 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.972 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.994 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.979 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.961 |
| presence landmark: present read present | 0.900 |
| presence landmark: share of 'present' readings that abstain | 0.148 |
| presence landmark: share of true 'present' readings that abstain | 0.148 |
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
| presence color: present read present | 0.879 |
| presence color: share of 'present' readings that abstain | 0.103 |
| presence color: share of true 'present' readings that abstain | 0.103 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.933 |
| presence color: present read present [pooled midpoint (comparison)] | 0.667 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.864 |
| presence relation: share of 'present' readings that abstain | 0.158 |
| presence relation: share of true 'present' readings that abstain | 0.158 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.789 |
| presence object: absent read absent | 0.929 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.964 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence source: present read present | 0.882 |
| presence source: share of 'present' readings that abstain | 0.364 |
| presence source: share of true 'present' readings that abstain | 0.200 |
| presence members: share of 'present' readings that abstain | 0.529 |
| presence members: share of FALSE 'present' readings that abstain | 0.400 |
| presence targets: present read present | 0.833 |
| presence targets: share of 'present' readings that abstain | 0.900 |
| presence targets: share of true 'present' readings that abstain | 1.000 |
| set targets: first gold member in the decoded set | 0.833 |
| presence source: present read present [pooled midpoint (comparison)] | 0.765 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.833 |
| presence target: present read present | 0.667 |
| presence target: share of 'present' readings that abstain | 0.333 |
| presence target: share of true 'present' readings that abstain | 0.300 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence target: present read present [pooled midpoint (comparison)] | 0.533 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.400 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.857 |
| presence members: share of true 'present' readings that abstain | 0.583 |
| set members: first gold member in the decoded set | 0.688 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.643 |
| presence source: share of FALSE 'present' readings that abstain | 0.714 |
| presence pairing: present read present | 0.667 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence targets: share of FALSE 'present' readings that abstain | 0.800 |
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
| presence superlative: present read present [pooled midpoint (comparison)] | 0.929 |
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

residual mean 0.221; status {'ok': 118, 'abstain': 44, 'no-sense': 3, 'unknown-event': 7}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.901 | 0.430 / 0.195 | 0.95 | 0.052 | 0.000 / 0.047 |
| role object | 0.875 | 0.257 / 0.036 | 0.88 | 0.062 | 0.062 / 0.062 |
| roles (pooled) | 0.847 | 0.216 / 0.000 | 0.78 | 0.032 | 0.101 / 0.121 |
| role region | 1.000 | 0.358 / 0.303 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark | 0.900 | 0.169 / 0.012 | 0.77 | 0.000 | 0.133 / 0.100 |
| role comparison | 1.000 | 0.253 / 0.209 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 0.875 | 0.244 / 0.162 | 0.94 | 0.062 | 0.000 / 0.062 |
| role color | 0.763 | 0.199 / 0.000 | 0.71 | 0.026 | 0.079 / 0.211 |
| role size | 1.000 | 0.295 / 0.249 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.212 / 0.183 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.864 | 0.223 / 0.003 | 0.73 | 0.000 | 0.136 / 0.136 |
| role source | 0.833 | 0.091 / 0.000 | 0.67 | 0.000 | 0.167 / 0.167 |
| role targets | 0.667 | 0.022 / 0.009 | 0.00 | 0.000 | 0.667 / 0.333 |
| role target | 0.625 | 0.084 / 0.000 | 0.44 | 0.000 | 0.188 / 0.375 |
| role landmark2 | 1.000 | 0.006 / 0.006 | 0.00 | 0.000 | 1.000 / 0.000 |
| role layout | 1.000 | 0.281 / 0.137 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.625 | 0.040 / 0.002 | 0.38 | 0.125 | 0.375 / 0.250 |
| role pairing | 0.667 | 0.157 / 0.000 | 0.67 | 0.000 | 0.000 / 0.333 |
| role style | 1.000 | 0.263 / 0.247 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.322 / 0.320 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.213 / 0.213 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 0.929 | 0.431 / 0.274 | 0.93 | 0.000 | 0.000 / 0.071 |
| role quantity | 1.000 | 0.057 / 0.050 | 0.50 | 0.000 | 0.500 / 0.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role name | 1.000 | 0.158 / 0.083 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3900)
| axis | accuracy |
|---|---|
| FULL | 0.720 |
| FULL [depth given] | 0.720 |
| FULL [depth and negation given] | 0.720 |
| presence object: present read present | 0.963 |
| presence object: share of 'present' readings that abstain | 0.059 |
| presence object: share of true 'present' readings that abstain | 0.060 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.996 |
| presence size: absent read absent | 0.992 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 0.993 |
| presence relation: present read present | 0.941 |
| presence relation: share of 'present' readings that abstain | 0.062 |
| presence relation: share of true 'present' readings that abstain | 0.062 |
| presence landmark: present read present | 0.934 |
| presence landmark: share of 'present' readings that abstain | 0.088 |
| presence landmark: share of true 'present' readings that abstain | 0.088 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.989 |
| presence region: share of 'present' readings that abstain | 0.100 |
| presence region: share of FALSE 'present' readings that abstain | 0.333 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.955 |
| presence target: absent read absent | 0.967 |
| presence style: absent read absent | 0.979 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.977 |
| presence targets: absent read absent | 0.979 |
| structure (depth, negation) | 0.977 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.953 |
| set targets: exact | 0.970 |
| predicate (surface lemma) | 0.937 |
| event type (synonym table) | 0.937 |
| role object | 0.910 |
| head object | 0.940 |
| lexical order head object | 0.770 |
| lexical bag head object | 0.900 |
| occupancy: known filler | 0.909 |
| role shape | 0.993 |
| head shape | 0.993 |
| lexical order head shape | 0.900 |
| lexical bag head shape | 0.993 |
| occupancy: not given | 0.993 |
| role color | 0.973 |
| head color | 0.973 |
| lexical order head color | 0.837 |
| lexical bag head color | 1.000 |
| role size | 0.983 |
| head size | 0.983 |
| lexical order head size | 0.827 |
| lexical bag head size | 0.977 |
| role name | 1.000 |
| head name | 1.000 |
| lexical order head name | 0.937 |
| lexical bag head name | 1.000 |
| role text | 0.993 |
| head text | 0.993 |
| lexical order head text | 0.953 |
| lexical bag head text | 1.000 |
| role relation | 0.983 |
| head relation | 0.983 |
| lexical order head relation | 0.827 |
| lexical bag head relation | 0.977 |
| role landmark | 0.977 |
| head landmark | 0.977 |
| lexical order head landmark | 0.790 |
| lexical bag head landmark | 0.967 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.980 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.987 |
| head region | 0.987 |
| lexical order head region | 0.940 |
| lexical bag head region | 0.973 |
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
| role source | 0.940 |
| head source | 0.940 |
| lexical order head source | 0.907 |
| lexical bag head source | 0.977 |
| role target | 0.953 |
| head target | 0.953 |
| lexical order head target | 0.933 |
| lexical bag head target | 0.990 |
| role style | 0.977 |
| head style | 0.977 |
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
| role pairing | 0.997 |
| head pairing | 0.997 |
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
| role members | 0.953 |
| head members | 0.953 |
| lexical order head members | 0.910 |
| lexical bag head members | 0.910 |
| role targets | 0.970 |
| head targets | 0.970 |
| lexical order head targets | 0.970 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.767 |
| heads FULL (lexical order baseline) | 0.167 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.710 |
| presence shape: present read present | 0.966 |
| presence shape: share of 'present' readings that abstain | 0.036 |
| presence shape: share of true 'present' readings that abstain | 0.036 |
| presence size: present read present | 0.980 |
| presence size: share of 'present' readings that abstain | 0.058 |
| presence size: share of true 'present' readings that abstain | 0.060 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence color: present read present | 0.915 |
| presence color: share of 'present' readings that abstain | 0.045 |
| presence color: share of true 'present' readings that abstain | 0.047 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.053 |
| presence name: share of true 'present' readings that abstain | 0.053 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.250 |
| presence quantity: share of true 'present' readings that abstain | 0.250 |
| presence object: absent read absent | 0.962 |
| presence source: present read present | 0.815 |
| presence source: share of 'present' readings that abstain | 0.382 |
| presence source: share of true 'present' readings that abstain | 0.091 |
| presence target: present read present | 0.789 |
| presence target: share of 'present' readings that abstain | 0.375 |
| presence target: share of true 'present' readings that abstain | 0.067 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of true 'present' readings that abstain | 0.059 |
| presence pairing: present read present | 0.941 |
| presence pairing: share of 'present' readings that abstain | 0.062 |
| presence pairing: share of true 'present' readings that abstain | 0.062 |
| presence members: present read present | 0.926 |
| presence members: share of 'present' readings that abstain | 0.355 |
| presence members: share of true 'present' readings that abstain | 0.320 |
| set members: first gold member in the decoded set | 0.778 |
| occupancy: unknown filler | 0.917 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.125 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 0.857 |
| presence style: share of 'present' readings that abstain | 0.083 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.167 |
| presence source: share of FALSE 'present' readings that abstain | 0.917 |
| presence targets: share of 'present' readings that abstain | 0.643 |
| presence targets: share of FALSE 'present' readings that abstain | 0.667 |
| presence superlative: present read present | 0.933 |
| presence superlative: share of 'present' readings that abstain | 0.107 |
| presence superlative: share of true 'present' readings that abstain | 0.107 |
| presence members: share of FALSE 'present' readings that abstain | 0.500 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.889 |
| presence targets: present read present | 0.889 |
| presence targets: share of true 'present' readings that abstain | 0.625 |
| set targets: first gold member in the decoded set | 0.889 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence text: share of FALSE 'present' readings that abstain | 1.000 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.169; status {'abstain': 69, 'ok': 224, 'no-sense': 3, 'unknown-event': 4}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.937 | 0.455 / 0.311 | 0.99 | 0.050 | 0.000 / 0.013 |
| role object | 0.882 | 0.262 / 0.037 | 0.89 | 0.056 | 0.046 / 0.062 |
| roles (pooled) | 0.876 | 0.224 / 0.004 | 0.83 | 0.021 | 0.063 / 0.103 |
| role relation | 0.904 | 0.224 / 0.007 | 0.87 | 0.019 | 0.058 / 0.077 |
| role landmark | 0.889 | 0.191 / 0.005 | 0.83 | 0.000 | 0.063 / 0.111 |
| role shape | 0.933 | 0.226 / 0.047 | 0.90 | 0.000 | 0.033 / 0.067 |
| role size | 0.942 | 0.259 / 0.081 | 0.90 | 0.000 | 0.038 / 0.058 |
| role color | 0.857 | 0.240 / 0.001 | 0.86 | 0.020 | 0.020 / 0.122 |
| role name | 1.000 | 0.172 / 0.072 | 0.95 | 0.000 | 0.053 / 0.000 |
| role quantity | 1.000 | 0.085 / 0.056 | 0.75 | 0.000 | 0.250 / 0.000 |
| role source | 0.786 | 0.091 / 0.000 | 0.71 | 0.000 | 0.071 / 0.214 |
| role target | 0.750 | 0.123 / 0.000 | 0.70 | 0.000 | 0.050 / 0.250 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role edge | 1.000 | 0.326 / 0.307 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 0.944 | 0.326 / 0.159 | 0.89 | 0.000 | 0.056 / 0.056 |
| role pairing | 0.941 | 0.249 / 0.091 | 0.88 | 0.000 | 0.059 / 0.059 |
| role members | 0.704 | 0.067 / 0.003 | 0.63 | 0.037 | 0.111 / 0.259 |
| role text | 1.000 | 0.208 / 0.152 | 1.00 | 0.000 | 0.000 / 0.000 |
| role style | 0.857 | 0.221 / 0.085 | 0.86 | 0.000 | 0.000 / 0.143 |
| role landmark2 | 1.000 | 0.022 / 0.013 | 0.00 | 0.000 | 1.000 / 0.000 |
| role superlative | 0.933 | 0.402 / 0.033 | 0.83 | 0.000 | 0.100 / 0.067 |
| role layout | 1.000 | 0.283 / 0.135 | 1.00 | 0.000 | 0.000 / 0.000 |
| role targets | 0.667 | 0.036 / 0.000 | 0.33 | 0.000 | 0.333 / 0.333 |
| role comparison | 1.000 | 0.309 / 0.309 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.282 / 0.268 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 SUPER=0.98 COLOR=0.97 AXIS=0.94 LAYOUT=0.92 once=0.88 rules=0.85 pixels=0.80 have=0.74 NUM=0.69 TEXT=0.63 NAME=0.61 them=0.58 whole=0.57 with=0.55 there=0.54 it=0.54 PAIR=0.53 VERB=0.50 last=0.48 from=0.45 we=0.42 for=0.39 thing=0.37 as=0.34 that=0.28 diagram=0.28 now=0.24 do=0.23 exist=0.23 map=0.22 ARROW=0.21 are=0.20 any=0.20 those=0.19 no=0.19 each=0.18 this=0.18 both=0.17 here=0.15 DIR=0.14 i=0.14 NOTCOLOR=0.12 arrow=0.12 in=0.10 check=0.10 remove=0.10 too=0.09 the=0.09 line=0.09 four=0.09 directly=0.08 show=0.08 two=0.07 evenly=0.07 SHAPE=0.07 by=0.07 uh=0.06 what's=0.06 box=0.06 front=0.05 what=0.05 shapes=0.05 me=0.05 at=0.05 give=0.04 axis=0.04 you=0.03 place=0.03 just=0.03 arrows=0.03 if=0.03 RECENT=0.03 an=0.03 link=0.03 goes=0.02 three=0.02 back=0.02 lines=0.02 new=0.02 not=0.02 does=0.02 then=0.02 on=0.02 should=0.02 tell=0.02 QUANT=0.02 has=0.02 who=0.02 can=0.01 put=0.01 every=0.01 STYLE=0.01 be=0.01 SIZE=0.01 one=0.01 of=0.01 named=0.01 and=0.01 unknown=0.01 shape=0.01 called=0.00 to=0.00 labeled=0.00 a=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.692
- heldout_formulations: presence object: share of 'present' readings that abstain 0.085
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.078
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: role object 0.895
- heldout_formulations: occupancy: unknown filler 0.872
- heldout_formulations: occupancy: known filler 0.865
- heldout_formulations: heads FULL (model) 0.727
- heldout_formulations: heads FULL (lexical order baseline) 0.203
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.477
- heldout_formulations: FULL [depth given] 0.692
- heldout_formulations: FULL [depth and negation given] 0.692
- heldout_formulations: FULL [presence not decided] 0.669
- heldout_formulations: role object [presence not decided] 0.895
- heldout_formulations: role target [presence not decided] 0.895
- heldout_formulations: role members [presence not decided] 0.890
- heldout_formulations: heads FULL (model) [presence not decided] 0.703
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.517
- heldout_formulations: role object [pooled midpoint (comparison)] 0.721
- heldout_formulations: role members [pooled midpoint (comparison)] 0.890
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.547
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.686
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.148
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.148
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.852
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present 0.879
- heldout_formulations: presence color: share of 'present' readings that abstain 0.103
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.103
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present 0.864
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.158
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.158
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.789
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_formulations: presence source: present read present 0.882
- heldout_formulations: presence source: share of 'present' readings that abstain 0.364
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.200
- heldout_formulations: presence members: share of 'present' readings that abstain 0.529
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.400
- heldout_formulations: presence targets: present read present 0.833
- heldout_formulations: set targets: first gold member in the decoded set 0.833
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.765
- heldout_formulations: presence targets: present read present [pooled midpoint (comparison)] 0.833
- heldout_formulations: presence target: present read present 0.667
- heldout_formulations: presence target: share of 'present' readings that abstain 0.333
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.300
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.533
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.400
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present 0.857
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.583
- heldout_formulations: set members: first gold member in the decoded set 0.688
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.643
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.714
- heldout_formulations: presence pairing: present read present 0.667
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.800
- heldout_formulations: presence pairing: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.500
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.500
- heldout_formulations: presence quantity: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.250
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.720
- train (sample): presence object: share of 'present' readings that abstain 0.059
- train (sample): presence object: share of true 'present' readings that abstain 0.060
- train (sample): presence relation: share of 'present' readings that abstain 0.062
- train (sample): presence relation: share of true 'present' readings that abstain 0.062
- train (sample): presence landmark: share of 'present' readings that abstain 0.088
- train (sample): presence landmark: share of true 'present' readings that abstain 0.088
- train (sample): presence region: share of 'present' readings that abstain 0.100
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.333
- train (sample): heads FULL (model) 0.767
- train (sample): heads FULL (lexical order baseline) 0.167
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.710
- train (sample): FULL [depth given] 0.720
- train (sample): FULL [depth and negation given] 0.720
- train (sample): presence shape: share of 'present' readings that abstain 0.036
- train (sample): presence shape: share of true 'present' readings that abstain 0.036
- train (sample): presence size: share of 'present' readings that abstain 0.058
- train (sample): presence size: share of true 'present' readings that abstain 0.060
- train (sample): presence color: share of 'present' readings that abstain 0.045
- train (sample): presence color: share of true 'present' readings that abstain 0.047
- train (sample): presence name: share of 'present' readings that abstain 0.053
- train (sample): presence name: share of true 'present' readings that abstain 0.053
- train (sample): presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.250
- train (sample): presence quantity: share of true 'present' readings that abstain 0.250
- train (sample): presence source: present read present 0.815
- train (sample): presence source: share of 'present' readings that abstain 0.382
- train (sample): presence source: share of true 'present' readings that abstain 0.091
- train (sample): presence target: present read present 0.789
- train (sample): presence target: share of 'present' readings that abstain 0.375
- train (sample): presence target: share of true 'present' readings that abstain 0.067
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.059
- train (sample): presence pairing: share of 'present' readings that abstain 0.062
- train (sample): presence pairing: share of true 'present' readings that abstain 0.062
- train (sample): presence members: share of 'present' readings that abstain 0.355
- train (sample): presence members: share of true 'present' readings that abstain 0.320
- train (sample): set members: first gold member in the decoded set 0.778
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.125
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence style: present read present 0.857
- train (sample): presence style: share of 'present' readings that abstain 0.083
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.167
- train (sample): presence targets: share of 'present' readings that abstain 0.643
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.667
- train (sample): presence superlative: share of 'present' readings that abstain 0.107
- train (sample): presence superlative: share of true 'present' readings that abstain 0.107
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.889
- train (sample): presence targets: present read present 0.889
- train (sample): presence targets: share of true 'present' readings that abstain 0.625
- train (sample): set targets: first gold member in the decoded set 0.889
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
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
| heldout_formulations | product readout: presence decided | 0.727 | 0.692 | 0.895 | 0.988 | 0.948 | 1.000 | 1.000 | 1.000 | 0.983 | 0.983 | 1.000 | 0.994 | 0.994 | 0.994 | 1.000 | 1.000 | 1.000 | 0.942 | 0.936 | 0.983 | 1.000 | 1.000 | 0.988 | 0.994 | 1.000 | 0.936 | 0.959 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.547 | 0.517 | 0.721 | 0.988 | 0.907 | 1.000 | 1.000 | 1.000 | 0.959 | 0.959 | 0.994 | 0.994 | 0.994 | 0.994 | 0.988 | 1.000 | 1.000 | 0.953 | 0.930 | 0.994 | 1.000 | 1.000 | 0.988 | 0.994 | 1.000 | 0.890 | 0.953 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.703 | 0.669 | 0.895 | 0.988 | 0.965 | 1.000 | 1.000 | 0.913 | 0.988 | 0.983 | 0.994 | 0.988 | 0.971 | 1.000 | 1.000 | 1.000 | 1.000 | 0.930 | 0.895 | 0.983 | 1.000 | 0.988 | 1.000 | 0.994 | 1.000 | 0.890 | 0.930 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.962 | 0.929 | 0.945 | 0.085 (0.250 / 0.078) |
| heldout_formulations | object | comparison: pooled midpoint | 0.686 | 0.964 | 0.825 |  |
| heldout_formulations | shape | product: fitted | 0.933 | 1.000 | 0.967 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_formulations | color | product: fitted | 0.879 | 1.000 | 0.939 | 0.103 (— / 0.103) |
| heldout_formulations | color | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.864 | 1.000 | 0.932 | 0.158 (— / 0.158) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.789 | 1.000 | 0.895 |  |
| heldout_formulations | landmark | product: fitted | 0.900 | 1.000 | 0.950 | 0.148 (— / 0.148) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.852 | 1.000 | 0.926 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 1.000 | 0.993 | 0.997 | 0.000 (0.000 / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 1.000 | 0.993 | 0.997 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.500 (— / 0.500) |
| heldout_formulations | quantity | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | source | product: fitted | 0.882 | 0.952 | 0.917 | 0.364 (0.714 / 0.200) |
| heldout_formulations | source | comparison: pooled midpoint | 0.765 | 0.979 | 0.872 |  |
| heldout_formulations | target | product: fitted | 0.667 | 0.966 | 0.816 | 0.333 (0.400 / 0.300) |
| heldout_formulations | target | comparison: pooled midpoint | 0.533 | 0.972 | 0.753 |  |
| heldout_formulations | style | product: fitted | 1.000 | 0.981 | 0.991 | 0.000 (0.000 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 0.994 | 0.997 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | superlative | product: fitted | 0.929 | 1.000 | 0.964 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 0.929 | 1.000 | 0.964 |  |
| heldout_formulations | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 0.857 | 0.966 | 0.912 | 0.529 (0.400 / 0.583) |
| heldout_formulations | members | comparison: pooled midpoint | 0.643 | 0.979 | 0.811 |  |
| heldout_formulations | targets | product: fitted | 0.833 | 0.968 | 0.901 | 0.900 (0.800 / 1.000) |
| heldout_formulations | targets | comparison: pooled midpoint | 0.833 | 0.961 | 0.897 |  |
| train (sample) | object | product: fitted | 0.963 | 0.962 | 0.962 | 0.059 (0.000 / 0.060) |
| train (sample) | shape | product: fitted | 0.966 | 1.000 | 0.983 | 0.036 (— / 0.036) |
| train (sample) | color | product: fitted | 0.915 | 0.996 | 0.955 | 0.045 (0.000 / 0.047) |
| train (sample) | size | product: fitted | 0.980 | 0.992 | 0.986 | 0.058 (0.000 / 0.060) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.053 (— / 0.053) |
| train (sample) | text | product: fitted | 1.000 | 0.993 | 0.996 | 0.125 (1.000 / 0.000) |
| train (sample) | relation | product: fitted | 0.941 | 1.000 | 0.971 | 0.062 (— / 0.062) |
| train (sample) | landmark | product: fitted | 0.934 | 1.000 | 0.967 | 0.088 (— / 0.088) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| train (sample) | region | product: fitted | 1.000 | 0.989 | 0.995 | 0.100 (0.333 / 0.059) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.250 (— / 0.250) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.815 | 0.955 | 0.885 | 0.382 (0.917 / 0.091) |
| train (sample) | target | product: fitted | 0.789 | 0.967 | 0.878 | 0.375 (0.889 / 0.067) |
| train (sample) | style | product: fitted | 0.857 | 0.979 | 0.918 | 0.083 (0.167 / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 0.941 | 1.000 | 0.971 | 0.062 (— / 0.062) |
| train (sample) | superlative | product: fitted | 0.933 | 1.000 | 0.967 | 0.107 (— / 0.107) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 0.926 | 0.977 | 0.952 | 0.355 (0.500 / 0.320) |
| train (sample) | targets | product: fitted | 0.889 | 0.979 | 0.934 | 0.643 (0.667 / 0.625) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
