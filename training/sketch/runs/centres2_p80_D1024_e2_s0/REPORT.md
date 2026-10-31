# REPORT — world `real`, legend sha256:5433e2357eec… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4278 annotated sentences from 2 files; provenance: {'llm': 4278}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/centres2_p80_D1024_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 237 sentences
- heldout_formulations: 143 sentences
- train: 3898 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
24328 tokens in the examples; 1007 with no kind in the lexicon (share 0.041), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 02d60dc-dirty. Memory curve: runs/centres2_p80_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.115 [rule: fit; pooled midpoint 0.246 (comparison)] (present 0.492, n 137 / absent 0.000, n 686890)
- set_member:targets: threshold 0.072 [rule: fit; pooled midpoint 0.099 (comparison)] (present 0.199, n 52 / absent -0.001, n 197442)
- presence:object: threshold 0.357 [rule: fit; pooled midpoint 0.515 (comparison)] (present 0.918, n 354 / absent 0.113, n 237)
- presence:shape: threshold 0.241 [rule: fit; pooled midpoint 0.389 (comparison)] (present 0.762, n 64 / absent 0.016, n 527)
- presence:color: threshold 0.465 [rule: fit; pooled midpoint 0.403 (comparison)] (present 0.780, n 107 / absent 0.025, n 484)
- presence:size: threshold 0.325 [rule: fit; pooled midpoint 0.390 (comparison)] (present 0.754, n 104 / absent 0.026, n 487)
- presence:name: threshold 0.608 [rule: fit; pooled midpoint 0.353 (comparison)] (present 0.704, n 15 / absent 0.003, n 576)
- presence:text: threshold 0.344 [rule: fit; pooled midpoint 0.422 (comparison)] (present 0.853, n 20 / absent -0.010, n 571)
- presence:relation: threshold 0.139 [rule: fit; pooled midpoint 0.363 (comparison)] (present 0.712, n 83 / absent 0.015, n 508)
- presence:landmark: threshold 0.255 [rule: fit; pooled midpoint 0.410 (comparison)] (present 0.786, n 115 / absent 0.035, n 476)
- presence:landmark2: threshold 0.226 [rule: fit; pooled midpoint 0.158 (comparison)] (present 0.308, n 7 / absent 0.008, n 584)
- presence:region: threshold 0.224 [rule: fit; pooled midpoint 0.332 (comparison)] (present 0.632, n 23 / absent 0.032, n 568)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 588)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 587)
- presence:quantity: threshold 0.245 [rule: fit; pooled midpoint 0.254 (comparison)] (present 0.507, n 7 / absent 0.001, n 584)
- presence:axis: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 587)
- presence:layout: threshold 0.361 [rule: fit; pooled midpoint 0.325 (comparison)] (present 0.649, n 9 / absent 0.001, n 582)
- presence:source: threshold 0.257 [rule: fit; pooled midpoint 0.342 (comparison)] (present 0.666, n 74 / absent 0.018, n 517)
- presence:target: threshold 0.159 [rule: fit; pooled midpoint 0.417 (comparison)] (present 0.809, n 47 / absent 0.025, n 544)
- presence:style: threshold 0.083 [rule: fit; pooled midpoint 0.277 (comparison)] (present 0.546, n 18 / absent 0.008, n 573)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 589)
- presence:edge: threshold 0.314 [rule: fit; pooled midpoint 0.362 (comparison)] (present 0.724, n 13 / absent -0.000, n 578)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 12)
- presence:pairing: threshold 0.165 [rule: fit; pooled midpoint 0.299 (comparison)] (present 0.585, n 35 / absent 0.013, n 556)
- presence:superlative: threshold 0.248 [rule: fit; pooled midpoint 0.437 (comparison)] (present 0.875, n 60 / absent 0.000, n 531)
- presence:comparison: threshold 0.471 [rule: fit; pooled midpoint 0.433 (comparison)] (present 0.865, n 8 / absent 0.001, n 583)
- presence:members: threshold 0.267 [rule: fit; pooled midpoint 0.475 (comparison)] (present 0.832, n 54 / absent 0.118, n 537)
- presence:targets: threshold 0.138 [rule: fit; pooled midpoint 0.138 (comparison)] (present 0.250, n 26 / absent 0.026, n 565)
- attr_presence:object: threshold 0.461 [rule: fit; pooled midpoint 0.485 (comparison)] (present 0.830, n 30 / absent 0.139, n 324)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 350)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.053, quantity 0.053, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 143 of 143)
| axis | accuracy |
|---|---|
| FULL | 0.119 |
| FULL [depth given] | 0.119 |
| FULL [depth and negation given] | 0.119 |
| FULL [presence not decided] | 0.126 |
| FULL [pooled midpoint (comparison)] | 0.126 |
| structure (depth, negation) | 0.566 |
| set members: exact | 0.853 |
| set members: first gold member in the decoded set | 0.286 |
| set targets: exact | 0.958 |
| predicate (surface lemma) | 0.538 |
| event type (synonym table) | 0.538 |
| role object | 0.545 |
| head object | 0.552 |
| lexical order head object | 0.734 |
| lexical bag head object | 0.790 |
| occupancy: not given | 0.993 |
| role shape | 0.923 |
| head shape | 0.923 |
| lexical order head shape | 0.923 |
| lexical bag head shape | 0.972 |
| role color | 0.867 |
| head color | 0.867 |
| lexical order head color | 0.853 |
| lexical bag head color | 0.979 |
| role size | 0.937 |
| head size | 0.937 |
| lexical order head size | 0.902 |
| lexical bag head size | 0.965 |
| role name | 0.986 |
| head name | 0.986 |
| lexical order head name | 0.972 |
| lexical bag head name | 0.979 |
| role text | 0.972 |
| head text | 0.972 |
| lexical order head text | 0.944 |
| lexical bag head text | 0.972 |
| role relation | 0.958 |
| head relation | 0.958 |
| lexical order head relation | 0.895 |
| lexical bag head relation | 0.951 |
| role landmark | 0.853 |
| head landmark | 0.853 |
| lexical order head landmark | 0.839 |
| lexical bag head landmark | 0.874 |
| role landmark2 | 0.986 |
| head landmark2 | 0.986 |
| lexical order head landmark2 | 0.986 |
| lexical bag head landmark2 | 0.986 |
| role region | 0.937 |
| head region | 0.937 |
| lexical order head region | 0.937 |
| lexical bag head region | 0.965 |
| role direction | 0.993 |
| head direction | 0.993 |
| lexical order head direction | 0.993 |
| lexical bag head direction | 1.000 |
| role amount | 0.993 |
| head amount | 0.993 |
| lexical order head amount | 0.993 |
| lexical bag head amount | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.993 |
| lexical bag head quantity | 1.000 |
| role axis | 0.986 |
| head axis | 0.986 |
| lexical order head axis | 0.986 |
| lexical bag head axis | 0.986 |
| occupancy: known filler | 0.302 |
| role layout | 0.979 |
| head layout | 0.979 |
| lexical order head layout | 0.979 |
| lexical bag head layout | 0.986 |
| role source | 0.909 |
| head source | 0.909 |
| lexical order head source | 0.881 |
| lexical bag head source | 0.909 |
| role target | 0.895 |
| head target | 0.895 |
| lexical order head target | 0.916 |
| lexical bag head target | 0.937 |
| role style | 0.993 |
| head style | 0.993 |
| lexical order head style | 0.979 |
| lexical bag head style | 0.986 |
| role arrow | 0.986 |
| head arrow | 0.986 |
| lexical order head arrow | 0.986 |
| lexical bag head arrow | 0.986 |
| role edge | 0.993 |
| head edge | 0.993 |
| lexical order head edge | 0.993 |
| lexical bag head edge | 1.000 |
| role pairing | 0.951 |
| head pairing | 0.951 |
| lexical order head pairing | 0.951 |
| lexical bag head pairing | 0.979 |
| role superlative | 1.000 |
| head superlative | 1.000 |
| lexical order head superlative | 0.895 |
| lexical bag head superlative | 0.965 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.993 |
| lexical bag head comparison | 1.000 |
| role members | 0.853 |
| head members | 0.853 |
| lexical order head members | 0.902 |
| lexical bag head members | 0.902 |
| occupancy: unknown filler | 0.347 |
| role targets | 0.958 |
| head targets | 0.958 |
| lexical order head targets | 0.965 |
| lexical bag head targets | 0.958 |
| heads FULL (model) | 0.168 |
| heads FULL (lexical order baseline) | 0.189 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.455 |
| role object [presence not decided] | 0.552 |
| role shape [presence not decided] | 0.930 |
| role color [presence not decided] | 0.888 |
| role size [presence not decided] | 0.937 |
| role name [presence not decided] | 0.986 |
| role text [presence not decided] | 0.958 |
| role relation [presence not decided] | 0.958 |
| role landmark [presence not decided] | 0.853 |
| role landmark2 [presence not decided] | 0.986 |
| role region [presence not decided] | 0.937 |
| role direction [presence not decided] | 1.000 |
| role amount [presence not decided] | 1.000 |
| role quantity [presence not decided] | 1.000 |
| role axis [presence not decided] | 0.986 |
| role layout [presence not decided] | 0.979 |
| role source [presence not decided] | 0.902 |
| role target [presence not decided] | 0.909 |
| role style [presence not decided] | 0.993 |
| role arrow [presence not decided] | 0.993 |
| role edge [presence not decided] | 0.993 |
| role pairing [presence not decided] | 0.951 |
| role superlative [presence not decided] | 1.000 |
| role comparison [presence not decided] | 1.000 |
| role members [presence not decided] | 0.860 |
| role targets [presence not decided] | 0.958 |
| heads FULL (model) [presence not decided] | 0.196 |
| role object [pooled midpoint (comparison)] | 0.538 |
| role shape [pooled midpoint (comparison)] | 0.923 |
| role color [pooled midpoint (comparison)] | 0.881 |
| role size [pooled midpoint (comparison)] | 0.937 |
| role name [pooled midpoint (comparison)] | 0.986 |
| role text [pooled midpoint (comparison)] | 0.972 |
| role relation [pooled midpoint (comparison)] | 0.958 |
| role landmark [pooled midpoint (comparison)] | 0.846 |
| role landmark2 [pooled midpoint (comparison)] | 0.986 |
| role region [pooled midpoint (comparison)] | 0.937 |
| role direction [pooled midpoint (comparison)] | 0.993 |
| role amount [pooled midpoint (comparison)] | 0.993 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role axis [pooled midpoint (comparison)] | 0.986 |
| role layout [pooled midpoint (comparison)] | 0.979 |
| role source [pooled midpoint (comparison)] | 0.909 |
| role target [pooled midpoint (comparison)] | 0.916 |
| role style [pooled midpoint (comparison)] | 0.993 |
| role arrow [pooled midpoint (comparison)] | 0.986 |
| role edge [pooled midpoint (comparison)] | 0.993 |
| role pairing [pooled midpoint (comparison)] | 0.951 |
| role superlative [pooled midpoint (comparison)] | 1.000 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.867 |
| role targets [pooled midpoint (comparison)] | 0.958 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.182 |
| presence object: absent read absent | 0.971 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: present read present | 0.636 |
| presence source: share of 'present' readings that abstain | 0.100 |
| presence source: share of true 'present' readings that abstain | 0.143 |
| presence target: absent read absent | 0.919 |
| presence target: share of 'present' readings that abstain | 0.333 |
| presence target: share of FALSE 'present' readings that abstain | 0.333 |
| presence style: absent read absent | 0.987 |
| presence edge: absent read absent | 0.988 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.892 |
| presence members: share of 'present' readings that abstain | 0.143 |
| presence members: share of FALSE 'present' readings that abstain | 0.125 |
| presence targets: present read present | 0.400 |
| depth estimate: fit (check) | 1.000 |
| set targets: first gold member in the decoded set | 0.400 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.971 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.636 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.959 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.987 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 0.988 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.919 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.800 |
| presence object: present read present | 0.511 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 0.667 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.900 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.133 |
| presence source: absent read absent | 0.957 |
| presence targets: absent read absent | 0.961 |
| presence object: present read present [pooled midpoint (comparison)] | 0.489 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present [pooled midpoint (comparison)] | 0.667 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.900 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.067 |
| presence source: absent read absent [pooled midpoint (comparison)] | 0.957 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.961 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence targets: share of 'present' readings that abstain | 0.200 |
| presence targets: share of true 'present' readings that abstain | 0.500 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present | 0.182 |
| presence color: present read present [pooled midpoint (comparison)] | 0.364 |
| presence target: present read present | 0.429 |
| presence target: share of true 'present' readings that abstain | 0.333 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.500 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present [pooled midpoint (comparison)] | 0.429 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.857 |
| presence members: share of true 'present' readings that abstain | 0.167 |
| presence targets: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.714 |
| presence pairing: present read present | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| presence layout: present read present | 0.000 |
| presence layout: present read present [pooled midpoint (comparison)] | 0.000 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: share of FALSE 'present' readings that abstain | 1.000 |
| presence region: present read present | 0.000 |
| presence region: present read present [pooled midpoint (comparison)] | 0.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present [pooled midpoint (comparison)] | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence shape: present read present | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.000 |

residual mean 0.562; status {'unknown-event': 60, 'ok': 71, 'abstain': 10, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.538 | 0.289 / 0.000 | 0.58 | 0.042 | 0.000 / 0.420 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| roles (pooled) | 0.285 | 0.093 / 0.000 | 0.30 | 0.025 | 0.011 / 0.690 |
| role members | 0.071 | 0.084 / 0.000 | 0.36 | 0.286 | 0.000 / 0.643 |
| role object | 0.247 | 0.100 / 0.000 | 0.28 | 0.035 | 0.000 / 0.718 |
| role shape | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role source | 0.412 | 0.076 / 0.000 | 0.35 | 0.000 | 0.059 / 0.588 |
| role targets | 0.400 | 0.022 / 0.000 | 0.20 | 0.000 | 0.200 / 0.600 |
| role size | 0.357 | 0.116 / 0.000 | 0.36 | 0.000 | 0.000 / 0.643 |
| role text | 0.500 | 0.106 / 0.000 | 0.50 | 0.000 | 0.000 / 0.500 |
| role relation | 0.600 | 0.212 / 0.000 | 0.60 | 0.000 | 0.000 / 0.400 |
| role landmark | 0.087 | 0.020 / 0.000 | 0.09 | 0.000 | 0.000 / 0.913 |
| role color | 0.095 | 0.016 / 0.000 | 0.10 | 0.000 | 0.000 / 0.905 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role style | 1.000 | 0.219 / 0.130 | 1.00 | 0.000 | 0.000 / 0.000 |
| role target | 0.250 | 0.044 / 0.000 | 0.17 | 0.000 | 0.083 / 0.750 |
| role edge | 1.000 | 0.309 / 0.309 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 1.000 | 0.388 / 0.285 | 1.00 | 0.000 | 0.000 / 0.000 |
| role pairing | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role quantity | 1.000 | 0.231 / 0.231 | 1.00 | 0.000 | 0.000 / 0.000 |
| role layout | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role region | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role name | 0.500 | 0.076 / 0.000 | 0.50 | 0.000 | 0.000 / 0.500 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 1.000 | 0.365 / 0.365 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3898)
| axis | accuracy |
|---|---|
| FULL | 0.077 |
| FULL [depth given] | 0.077 |
| FULL [depth and negation given] | 0.077 |
| structure (depth, negation) | 0.587 |
| set members: exact | 0.830 |
| set targets: exact | 0.910 |
| predicate (surface lemma) | 0.550 |
| event type (synonym table) | 0.550 |
| role object | 0.553 |
| head object | 0.563 |
| lexical order head object | 0.720 |
| lexical bag head object | 0.873 |
| occupancy: known filler | 0.352 |
| role shape | 0.910 |
| head shape | 0.910 |
| lexical order head shape | 0.900 |
| lexical bag head shape | 0.990 |
| occupancy: not given | 0.988 |
| role color | 0.843 |
| head color | 0.843 |
| lexical order head color | 0.830 |
| lexical bag head color | 0.997 |
| role size | 0.880 |
| head size | 0.880 |
| lexical order head size | 0.813 |
| lexical bag head size | 0.970 |
| role name | 0.963 |
| head name | 0.963 |
| lexical order head name | 0.943 |
| lexical bag head name | 1.000 |
| role text | 0.993 |
| head text | 0.993 |
| lexical order head text | 0.957 |
| lexical bag head text | 0.997 |
| role relation | 0.943 |
| head relation | 0.943 |
| lexical order head relation | 0.850 |
| lexical bag head relation | 0.973 |
| role landmark | 0.837 |
| head landmark | 0.837 |
| lexical order head landmark | 0.807 |
| lexical bag head landmark | 0.967 |
| role landmark2 | 0.980 |
| head landmark2 | 0.980 |
| lexical order head landmark2 | 0.980 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.953 |
| head region | 0.953 |
| lexical order head region | 0.953 |
| lexical bag head region | 0.980 |
| role direction | 0.997 |
| head direction | 0.997 |
| lexical order head direction | 0.997 |
| lexical bag head direction | 1.000 |
| role amount | 0.993 |
| head amount | 0.993 |
| lexical order head amount | 0.993 |
| lexical bag head amount | 1.000 |
| role quantity | 0.997 |
| head quantity | 0.997 |
| lexical order head quantity | 0.987 |
| lexical bag head quantity | 1.000 |
| role axis | 0.983 |
| head axis | 0.983 |
| lexical order head axis | 0.983 |
| lexical bag head axis | 0.990 |
| role layout | 0.990 |
| head layout | 0.990 |
| lexical order head layout | 0.990 |
| lexical bag head layout | 1.000 |
| role source | 0.920 |
| head source | 0.920 |
| lexical order head source | 0.870 |
| lexical bag head source | 0.973 |
| role target | 0.903 |
| head target | 0.903 |
| lexical order head target | 0.927 |
| lexical bag head target | 0.983 |
| role style | 0.973 |
| head style | 0.973 |
| lexical order head style | 0.973 |
| lexical bag head style | 0.983 |
| role arrow | 0.987 |
| head arrow | 0.987 |
| lexical order head arrow | 0.987 |
| lexical bag head arrow | 0.997 |
| role edge | 0.977 |
| head edge | 0.977 |
| lexical order head edge | 0.973 |
| lexical bag head edge | 0.983 |
| role pairing | 0.950 |
| head pairing | 0.950 |
| lexical order head pairing | 0.950 |
| lexical bag head pairing | 0.997 |
| role superlative | 0.973 |
| head superlative | 0.973 |
| lexical order head superlative | 0.907 |
| lexical bag head superlative | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.993 |
| lexical bag head comparison | 1.000 |
| role members | 0.830 |
| head members | 0.830 |
| lexical order head members | 0.897 |
| lexical bag head members | 0.897 |
| role targets | 0.910 |
| head targets | 0.910 |
| lexical order head targets | 0.940 |
| lexical bag head targets | 0.923 |
| heads FULL (model) | 0.130 |
| heads FULL (lexical order baseline) | 0.160 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.607 |
| presence object: present read present | 0.557 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present | 0.600 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 0.222 |
| presence size: present read present | 0.833 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.917 |
| presence target: absent read absent | 0.853 |
| presence style: absent read absent | 0.959 |
| presence edge: absent read absent | 0.982 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 0.993 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.854 |
| presence targets: absent read absent | 0.906 |
| depth estimate: fit (check) | 1.000 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence relation: present read present | 0.966 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.205 |
| presence name: present read present | 0.400 |
| presence object: absent read absent | 0.987 |
| presence source: present read present | 0.844 |
| presence source: share of 'present' readings that abstain | 0.103 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.800 |
| presence target: share of 'present' readings that abstain | 0.231 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 0.571 |
| presence members: share of 'present' readings that abstain | 0.103 |
| presence members: share of FALSE 'present' readings that abstain | 0.174 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 0.452 |
| occupancy: unknown filler | 0.510 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: share of 'present' readings that abstain | 0.429 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence targets: share of 'present' readings that abstain | 0.500 |
| presence targets: share of FALSE 'present' readings that abstain | 0.667 |
| presence landmark2: present read present | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.333 |
| presence members: present read present | 0.889 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present | 0.750 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence layout: present read present | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.391 |
| presence targets: present read present | 0.562 |
| presence targets: share of true 'present' readings that abstain | 0.222 |
| set targets: first gold member in the decoded set | 0.500 |
| presence pairing: present read present | 0.000 |
| presence edge: share of FALSE 'present' readings that abstain | 1.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence superlative: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.526; status {'unknown-event': 122, 'ok': 141, 'abstain': 35, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.550 | 0.259 / 0.000 | 0.59 | 0.040 | 0.000 / 0.410 |
| role object | 0.257 | 0.103 / 0.000 | 0.30 | 0.045 | 0.000 / 0.698 |
| roles (pooled) | 0.328 | 0.105 / 0.000 | 0.36 | 0.035 | 0.002 / 0.637 |
| role relation | 0.622 | 0.233 / 0.000 | 0.62 | 0.000 | 0.000 / 0.378 |
| role landmark | 0.155 | 0.026 / 0.000 | 0.16 | 0.000 | 0.000 / 0.845 |
| role shape | 0.100 | 0.010 / 0.000 | 0.10 | 0.000 | 0.000 / 0.900 |
| role size | 0.357 | 0.120 / 0.000 | 0.36 | 0.000 | 0.000 / 0.643 |
| role color | 0.078 | 0.017 / 0.000 | 0.08 | 0.000 | 0.000 / 0.922 |
| role name | 0.353 | 0.065 / 0.000 | 0.35 | 0.000 | 0.000 / 0.647 |
| role quantity | 0.750 | 0.189 / 0.072 | 0.75 | 0.000 | 0.000 / 0.250 |
| role source | 0.692 | 0.151 / 0.000 | 0.69 | 0.000 | 0.000 / 0.308 |
| role target | 0.727 | 0.179 / 0.000 | 0.73 | 0.000 | 0.000 / 0.273 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role edge | 0.500 | 0.157 / 0.000 | 0.50 | 0.000 | 0.000 / 0.500 |
| role pairing | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role members | 0.097 | 0.090 / 0.000 | 0.52 | 0.419 | 0.000 / 0.484 |
| role text | 0.846 | 0.207 / 0.041 | 0.85 | 0.000 | 0.000 / 0.154 |
| role style | 0.875 | 0.248 / 0.185 | 0.88 | 0.000 | 0.000 / 0.125 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role superlative | 0.750 | 0.322 / 0.000 | 0.75 | 0.000 | 0.000 / 0.250 |
| role layout | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role targets | 0.333 | 0.052 / 0.000 | 0.39 | 0.111 | 0.056 / 0.556 |
| role region | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 1.000 | 0.334 / 0.298 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)


## What is weak, what to add
- heldout_formulations: FULL 0.119
- heldout_formulations: structure (depth, negation) 0.566
- heldout_formulations: set members: exact 0.853
- heldout_formulations: set members: first gold member in the decoded set 0.286
- heldout_formulations: predicate (surface lemma) 0.538
- heldout_formulations: event type (synonym table) 0.538
- heldout_formulations: role object 0.545
- heldout_formulations: head object 0.552
- heldout_formulations: role color 0.867
- heldout_formulations: head color 0.867
- heldout_formulations: role landmark 0.853
- heldout_formulations: head landmark 0.853
- heldout_formulations: occupancy: known filler 0.302
- heldout_formulations: role target 0.895
- heldout_formulations: head target 0.895
- heldout_formulations: role members 0.853
- heldout_formulations: head members 0.853
- heldout_formulations: occupancy: unknown filler 0.347
- heldout_formulations: heads FULL (model) 0.168
- heldout_formulations: heads FULL (lexical order baseline) 0.189
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.455
- heldout_formulations: FULL [depth given] 0.119
- heldout_formulations: FULL [depth and negation given] 0.119
- heldout_formulations: FULL [presence not decided] 0.126
- heldout_formulations: role object [presence not decided] 0.552
- heldout_formulations: role color [presence not decided] 0.888
- heldout_formulations: role landmark [presence not decided] 0.853
- heldout_formulations: role members [presence not decided] 0.860
- heldout_formulations: heads FULL (model) [presence not decided] 0.196
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.126
- heldout_formulations: role object [pooled midpoint (comparison)] 0.538
- heldout_formulations: role color [pooled midpoint (comparison)] 0.881
- heldout_formulations: role landmark [pooled midpoint (comparison)] 0.846
- heldout_formulations: role members [pooled midpoint (comparison)] 0.867
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.182
- heldout_formulations: presence source: present read present 0.636
- heldout_formulations: presence source: share of 'present' readings that abstain 0.100
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.143
- heldout_formulations: presence target: share of 'present' readings that abstain 0.333
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.333
- heldout_formulations: presence members: absent read absent 0.892
- heldout_formulations: presence members: share of 'present' readings that abstain 0.143
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.125
- heldout_formulations: presence targets: present read present 0.400
- heldout_formulations: set targets: first gold member in the decoded set 0.400
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.636
- heldout_formulations: presence targets: present read present [pooled midpoint (comparison)] 0.800
- heldout_formulations: presence object: present read present 0.511
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: present read present 0.667
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present 0.133
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.489
- heldout_formulations: presence text: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.067
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: present read present 0.000
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.200
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.500
- heldout_formulations: presence color: present read present 0.182
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.364
- heldout_formulations: presence target: present read present 0.429
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.333
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.500
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.429
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present 0.857
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.167
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.714
- heldout_formulations: presence pairing: present read present 0.000
- heldout_formulations: presence pairing: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence layout: present read present 0.000
- heldout_formulations: presence layout: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: present read present 0.000
- heldout_formulations: presence region: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence shape: present read present 0.000
- heldout_formulations: presence shape: present read present [pooled midpoint (comparison)] 0.000
- train (sample): FULL 0.077
- train (sample): structure (depth, negation) 0.587
- train (sample): set members: exact 0.830
- train (sample): predicate (surface lemma) 0.550
- train (sample): event type (synonym table) 0.550
- train (sample): role object 0.553
- train (sample): head object 0.563
- train (sample): occupancy: known filler 0.352
- train (sample): role color 0.843
- train (sample): head color 0.843
- train (sample): role size 0.880
- train (sample): head size 0.880
- train (sample): role landmark 0.837
- train (sample): head landmark 0.837
- train (sample): role members 0.830
- train (sample): head members 0.830
- train (sample): heads FULL (model) 0.130
- train (sample): heads FULL (lexical order baseline) 0.160
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.607
- train (sample): FULL [depth given] 0.077
- train (sample): FULL [depth and negation given] 0.077
- train (sample): presence object: present read present 0.557
- train (sample): presence object: share of 'present' readings that abstain 0.000
- train (sample): presence object: share of true 'present' readings that abstain 0.000
- train (sample): presence shape: present read present 0.600
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence color: present read present 0.222
- train (sample): presence size: present read present 0.833
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence target: absent read absent 0.853
- train (sample): presence members: absent read absent 0.854
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: present read present 0.205
- train (sample): presence name: present read present 0.400
- train (sample): presence source: present read present 0.844
- train (sample): presence source: share of 'present' readings that abstain 0.103
- train (sample): presence source: share of true 'present' readings that abstain 0.000
- train (sample): presence target: present read present 0.800
- train (sample): presence target: share of 'present' readings that abstain 0.231
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: present read present 0.571
- train (sample): presence members: share of 'present' readings that abstain 0.103
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.174
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): set members: first gold member in the decoded set 0.452
- train (sample): occupancy: unknown filler 0.510
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of 'present' readings that abstain 0.000
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.429
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence targets: share of 'present' readings that abstain 0.500
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.667
- train (sample): presence landmark2: present read present 0.000
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.333
- train (sample): presence members: present read present 0.889
- train (sample): presence members: share of true 'present' readings that abstain 0.000
- train (sample): presence superlative: present read present 0.750
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): presence layout: present read present 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.391
- train (sample): presence targets: present read present 0.562
- train (sample): presence targets: share of true 'present' readings that abstain 0.222
- train (sample): set targets: first gold member in the decoded set 0.500
- train (sample): presence pairing: present read present 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence region: present read present 0.000
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence superlative: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME move POS` FULL 0.000 (n 5)
- heldout_formulations: `NAME is COLOR` FULL 0.000 (n 3)
- heldout_formulations: `connect NAME to NAME and NAME` FULL 0.000 (n 2)
- heldout_formulations: `move NAME POS NAME` FULL 0.000 (n 2)
- heldout_formulations: `draw a SIZE COLOR SHAPE labeled NAME POS the NAME` FULL 0.000 (n 2)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role direction | role amount | role quantity | role axis | role layout | role source | role target | role style | role arrow | role edge | role pairing | role superlative | role comparison | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.168 | 0.119 | 0.545 | 0.923 | 0.867 | 0.937 | 0.986 | 0.972 | 0.958 | 0.853 | 0.986 | 0.937 | 0.993 | 0.993 | 1.000 | 0.986 | 0.979 | 0.909 | 0.895 | 0.993 | 0.986 | 0.993 | 0.951 | 1.000 | 1.000 | 0.853 | 0.958 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.182 | 0.126 | 0.538 | 0.923 | 0.881 | 0.937 | 0.986 | 0.972 | 0.958 | 0.846 | 0.986 | 0.937 | 0.993 | 0.993 | 1.000 | 0.986 | 0.979 | 0.909 | 0.916 | 0.993 | 0.986 | 0.993 | 0.951 | 1.000 | 1.000 | 0.867 | 0.958 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.196 | 0.126 | 0.552 | 0.930 | 0.888 | 0.937 | 0.986 | 0.958 | 0.958 | 0.853 | 0.986 | 0.937 | 1.000 | 1.000 | 1.000 | 0.986 | 0.979 | 0.902 | 0.909 | 0.993 | 0.993 | 0.993 | 0.951 | 1.000 | 1.000 | 0.860 | 0.958 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.511 | 0.971 | 0.741 | 0.000 (0.000 / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.489 | 0.971 | 0.730 |  |
| heldout_formulations | shape | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | shape | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | color | product: fitted | 0.182 | 1.000 | 0.591 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.364 | 1.000 | 0.682 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | relation | product: fitted | 0.900 | 1.000 | 0.950 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.900 | 1.000 | 0.950 |  |
| heldout_formulations | landmark | product: fitted | 0.133 | 1.000 | 0.567 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.067 | 1.000 | 0.533 |  |
| heldout_formulations | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | region | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | region | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | layout | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | source | product: fitted | 0.636 | 0.957 | 0.797 | 0.100 (0.000 / 0.143) |
| heldout_formulations | source | comparison: pooled midpoint | 0.636 | 0.957 | 0.797 |  |
| heldout_formulations | target | product: fitted | 0.429 | 0.919 | 0.674 | 0.333 (0.333 / 0.333) |
| heldout_formulations | target | comparison: pooled midpoint | 0.429 | 0.959 | 0.694 |  |
| heldout_formulations | style | product: fitted | 1.000 | 0.987 | 0.994 | 0.000 (0.000 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 0.987 | 0.994 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 0.988 | 0.994 | 0.500 (1.000 / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 0.988 | 0.994 |  |
| heldout_formulations | pairing | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 0.857 | 0.892 | 0.875 | 0.143 (0.125 / 0.167) |
| heldout_formulations | members | comparison: pooled midpoint | 0.714 | 0.919 | 0.817 |  |
| heldout_formulations | targets | product: fitted | 0.400 | 0.961 | 0.680 | 0.200 (0.000 / 0.500) |
| heldout_formulations | targets | comparison: pooled midpoint | 0.800 | 0.961 | 0.880 |  |
| train (sample) | object | product: fitted | 0.557 | 0.987 | 0.772 | 0.000 (0.000 / 0.000) |
| train (sample) | shape | product: fitted | 0.600 | 1.000 | 0.800 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.222 | 1.000 | 0.611 | 0.000 (— / 0.000) |
| train (sample) | size | product: fitted | 0.833 | 1.000 | 0.917 | 0.000 (— / 0.000) |
| train (sample) | name | product: fitted | 0.400 | 1.000 | 0.700 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.966 | 1.000 | 0.983 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.205 | 1.000 | 0.602 | 0.000 (— / 0.000) |
| train (sample) | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| train (sample) | region | product: fitted | 0.000 | 1.000 | 0.500 |  |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 0.000 | 1.000 | 0.500 |  |
| train (sample) | source | product: fitted | 0.844 | 0.917 | 0.880 | 0.103 (0.333 / 0.000) |
| train (sample) | target | product: fitted | 0.800 | 0.853 | 0.826 | 0.231 (0.391 / 0.000) |
| train (sample) | style | product: fitted | 1.000 | 0.959 | 0.979 | 0.000 (0.000 / 0.000) |
| train (sample) | edge | product: fitted | 0.571 | 0.982 | 0.777 | 0.429 (1.000 / 0.000) |
| train (sample) | pairing | product: fitted | 0.000 | 1.000 | 0.500 |  |
| train (sample) | superlative | product: fitted | 0.750 | 0.993 | 0.872 | 0.000 (0.000 / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 0.889 | 0.854 | 0.872 | 0.103 (0.174 / 0.000) |
| train (sample) | targets | product: fitted | 0.562 | 0.906 | 0.734 | 0.500 (0.667 / 0.222) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
