# REPORT — world `real`, legend sha256:5433e2357eec… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4278 annotated sentences from 2 files; provenance: {'llm': 4278}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/centres_p80_D1024_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 237 sentences
- heldout_formulations: 143 sentences
- train: 3898 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
24328 tokens in the examples; 1007 with no kind in the lexicon (share 0.041), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 561fe91. Memory curve: runs/centres_p80_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.081 [rule: fit; pooled midpoint 0.217 (comparison)] (present 0.433, n 137 / absent 0.001, n 686890)
- set_member:targets: threshold 0.110 [rule: fit; pooled midpoint 0.083 (comparison)] (present 0.167, n 52 / absent -0.000, n 197442)
- presence:object: threshold 0.364 [rule: fit; pooled midpoint 0.400 (comparison)] (present 0.718, n 354 / absent 0.082, n 237)
- presence:shape: threshold 0.189 [rule: fit; pooled midpoint 0.332 (comparison)] (present 0.656, n 64 / absent 0.008, n 527)
- presence:color: threshold 0.115 [rule: fit; pooled midpoint 0.285 (comparison)] (present 0.559, n 107 / absent 0.010, n 484)
- presence:size: threshold 0.097 [rule: fit; pooled midpoint 0.340 (comparison)] (present 0.666, n 104 / absent 0.014, n 487)
- presence:name: threshold 0.202 [rule: fit; pooled midpoint 0.234 (comparison)] (present 0.466, n 15 / absent 0.002, n 576)
- presence:text: threshold 0.019 [rule: fit; pooled midpoint 0.385 (comparison)] (present 0.780, n 20 / absent -0.010, n 571)
- presence:relation: threshold 0.077 [rule: fit; pooled midpoint 0.296 (comparison)] (present 0.589, n 83 / absent 0.004, n 508)
- presence:landmark: threshold 0.106 [rule: fit; pooled midpoint 0.317 (comparison)] (present 0.616, n 115 / absent 0.018, n 476)
- presence:landmark2: threshold 0.158 [rule: fit; pooled midpoint 0.130 (comparison)] (present 0.254, n 7 / absent 0.006, n 584)
- presence:region: threshold 0.031 [rule: fit; pooled midpoint 0.229 (comparison)] (present 0.437, n 23 / absent 0.022, n 568)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 588)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 587)
- presence:quantity: threshold 0.034 [rule: fit; pooled midpoint 0.110 (comparison)] (present 0.219, n 7 / absent 0.000, n 584)
- presence:axis: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 587)
- presence:layout: threshold 0.025 [rule: fit; pooled midpoint 0.150 (comparison)] (present 0.300, n 9 / absent 0.001, n 582)
- presence:source: threshold 0.186 [rule: fit; pooled midpoint 0.288 (comparison)] (present 0.562, n 74 / absent 0.015, n 517)
- presence:target: threshold 0.035 [rule: fit; pooled midpoint 0.337 (comparison)] (present 0.649, n 47 / absent 0.024, n 544)
- presence:style: threshold 0.054 [rule: fit; pooled midpoint 0.269 (comparison)] (present 0.532, n 18 / absent 0.007, n 573)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 589)
- presence:edge: threshold 0.301 [rule: fit; pooled midpoint 0.352 (comparison)] (present 0.705, n 13 / absent -0.000, n 578)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 12)
- presence:pairing: threshold 0.073 [rule: fit; pooled midpoint 0.243 (comparison)] (present 0.476, n 35 / absent 0.009, n 556)
- presence:superlative: threshold 0.058 [rule: fit; pooled midpoint 0.339 (comparison)] (present 0.678, n 60 / absent 0.000, n 531)
- presence:comparison: threshold 0.314 [rule: fit; pooled midpoint 0.349 (comparison)] (present 0.698, n 8 / absent 0.000, n 583)
- presence:members: threshold 0.214 [rule: fit; pooled midpoint 0.424 (comparison)] (present 0.742, n 54 / absent 0.106, n 537)
- presence:targets: threshold 0.134 [rule: fit; pooled midpoint 0.117 (comparison)] (present 0.210, n 26 / absent 0.024, n 565)
- attr_presence:object: threshold 0.430 [rule: fit; pooled midpoint 0.462 (comparison)] (present 0.774, n 30 / absent 0.149, n 324)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 350)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.053, quantity 0.053, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 143 of 143)
| axis | accuracy |
|---|---|
| FULL | 0.112 |
| FULL [depth given] | 0.112 |
| FULL [depth and negation given] | 0.112 |
| FULL [presence not decided] | 0.133 |
| FULL [pooled midpoint (comparison)] | 0.119 |
| structure (depth, negation) | 0.566 |
| set members: exact | 0.839 |
| set members: first gold member in the decoded set | 0.286 |
| set targets: exact | 0.958 |
| predicate (surface lemma) | 0.538 |
| event type (synonym table) | 0.538 |
| role object | 0.476 |
| head object | 0.483 |
| lexical order head object | 0.734 |
| lexical bag head object | 0.790 |
| occupancy: not given | 0.992 |
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
| role text | 0.979 |
| head text | 0.979 |
| lexical order head text | 0.944 |
| lexical bag head text | 0.972 |
| role relation | 0.958 |
| head relation | 0.958 |
| lexical order head relation | 0.895 |
| lexical bag head relation | 0.951 |
| role landmark | 0.860 |
| head landmark | 0.860 |
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
| occupancy: known filler | 0.277 |
| role layout | 0.979 |
| head layout | 0.979 |
| lexical order head layout | 0.979 |
| lexical bag head layout | 0.986 |
| role source | 0.909 |
| head source | 0.909 |
| lexical order head source | 0.881 |
| lexical bag head source | 0.909 |
| role target | 0.888 |
| head target | 0.888 |
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
| role members | 0.839 |
| head members | 0.839 |
| lexical order head members | 0.902 |
| lexical bag head members | 0.902 |
| occupancy: unknown filler | 0.360 |
| role targets | 0.958 |
| head targets | 0.958 |
| lexical order head targets | 0.965 |
| lexical bag head targets | 0.958 |
| heads FULL (model) | 0.161 |
| heads FULL (lexical order baseline) | 0.189 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.455 |
| role object [presence not decided] | 0.538 |
| role shape [presence not decided] | 0.923 |
| role color [presence not decided] | 0.895 |
| role size [presence not decided] | 0.937 |
| role name [presence not decided] | 0.986 |
| role text [presence not decided] | 0.958 |
| role relation [presence not decided] | 0.958 |
| role landmark [presence not decided] | 0.860 |
| role landmark2 [presence not decided] | 0.986 |
| role region [presence not decided] | 0.937 |
| role direction [presence not decided] | 1.000 |
| role amount [presence not decided] | 1.000 |
| role quantity [presence not decided] | 1.000 |
| role axis [presence not decided] | 0.986 |
| role layout [presence not decided] | 0.979 |
| role source [presence not decided] | 0.902 |
| role target [presence not decided] | 0.902 |
| role style [presence not decided] | 0.993 |
| role arrow [presence not decided] | 0.993 |
| role edge [presence not decided] | 0.993 |
| role pairing [presence not decided] | 0.951 |
| role superlative [presence not decided] | 1.000 |
| role comparison [presence not decided] | 1.000 |
| role members [presence not decided] | 0.853 |
| role targets [presence not decided] | 0.958 |
| heads FULL (model) [presence not decided] | 0.196 |
| role object [pooled midpoint (comparison)] | 0.483 |
| role shape [pooled midpoint (comparison)] | 0.923 |
| role color [pooled midpoint (comparison)] | 0.860 |
| role size [pooled midpoint (comparison)] | 0.937 |
| role name [pooled midpoint (comparison)] | 0.986 |
| role text [pooled midpoint (comparison)] | 0.972 |
| role relation [pooled midpoint (comparison)] | 0.937 |
| role landmark [pooled midpoint (comparison)] | 0.853 |
| role landmark2 [pooled midpoint (comparison)] | 0.986 |
| role region [pooled midpoint (comparison)] | 0.937 |
| role direction [pooled midpoint (comparison)] | 0.993 |
| role amount [pooled midpoint (comparison)] | 0.993 |
| role quantity [pooled midpoint (comparison)] | 0.993 |
| role axis [pooled midpoint (comparison)] | 0.986 |
| role layout [pooled midpoint (comparison)] | 0.979 |
| role source [pooled midpoint (comparison)] | 0.902 |
| role target [pooled midpoint (comparison)] | 0.909 |
| role style [pooled midpoint (comparison)] | 0.986 |
| role arrow [pooled midpoint (comparison)] | 0.986 |
| role edge [pooled midpoint (comparison)] | 0.993 |
| role pairing [pooled midpoint (comparison)] | 0.951 |
| role superlative [pooled midpoint (comparison)] | 1.000 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.867 |
| role targets [pooled midpoint (comparison)] | 0.958 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.168 |
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
| presence target: absent read absent | 0.905 |
| presence target: share of 'present' readings that abstain | 0.333 |
| presence target: share of FALSE 'present' readings that abstain | 0.286 |
| presence style: absent read absent | 0.987 |
| presence edge: absent read absent | 0.988 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.865 |
| presence members: share of 'present' readings that abstain | 0.062 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence targets: present read present | 0.400 |
| depth estimate: fit (check) | 1.000 |
| set targets: first gold member in the decoded set | 0.400 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
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
| presence source: present read present [pooled midpoint (comparison)] | 0.545 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.958 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.987 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 0.987 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.917 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.800 |
| presence object: present read present | 0.277 |
| presence object: share of 'present' readings that abstain | 0.143 |
| presence object: share of true 'present' readings that abstain | 0.077 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 0.833 |
| presence text: share of 'present' readings that abstain | 0.200 |
| presence text: share of true 'present' readings that abstain | 0.200 |
| presence relation: present read present | 0.900 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.333 |
| presence landmark: share of 'present' readings that abstain | 0.400 |
| presence landmark: share of true 'present' readings that abstain | 0.400 |
| presence source: absent read absent | 0.957 |
| presence targets: absent read absent | 0.961 |
| presence object: present read present [pooled midpoint (comparison)] | 0.267 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present [pooled midpoint (comparison)] | 0.667 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.750 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.154 |
| presence source: absent read absent [pooled midpoint (comparison)] | 0.956 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.959 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence landmark2: present read present | 0.500 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.500 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence targets: share of 'present' readings that abstain | 0.200 |
| presence targets: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 0.667 |
| presence color: present read present | 0.182 |
| presence color: present read present [pooled midpoint (comparison)] | 0.091 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence target: present read present | 0.714 |
| presence target: share of true 'present' readings that abstain | 0.400 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.500 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present [pooled midpoint (comparison)] | 0.571 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.857 |
| presence members: share of true 'present' readings that abstain | 0.167 |
| presence targets: share of FALSE 'present' readings that abstain | 0.333 |
| presence members: present read present [pooled midpoint (comparison)] | 0.571 |
| presence pairing: present read present | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 1.000 |
| presence quantity: share of true 'present' readings that abstain | 1.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 0.000 |
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
| presence color: share of 'present' readings that abstain | 0.500 |
| presence color: share of true 'present' readings that abstain | 0.500 |
| presence object: share of FALSE 'present' readings that abstain | 1.000 |
| presence shape: present read present | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.000 |

residual mean 0.578; status {'unknown-event': 60, 'ok': 62, 'abstain': 19, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.538 | 0.334 / 0.000 | 0.58 | 0.042 | 0.000 / 0.420 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| roles (pooled) | 0.256 | 0.071 / 0.000 | 0.26 | 0.018 | 0.014 / 0.726 |
| role members | 0.071 | 0.076 / 0.000 | 0.36 | 0.286 | 0.000 / 0.643 |
| role object | 0.129 | 0.042 / 0.000 | 0.14 | 0.012 | 0.000 / 0.859 |
| role shape | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role source | 0.412 | 0.068 / 0.000 | 0.35 | 0.000 | 0.059 / 0.588 |
| role targets | 0.400 | 0.045 / 0.000 | 0.40 | 0.000 | 0.000 / 0.600 |
| role size | 0.357 | 0.116 / 0.000 | 0.36 | 0.000 | 0.000 / 0.643 |
| role text | 0.625 | 0.105 / 0.000 | 0.50 | 0.000 | 0.125 / 0.375 |
| role relation | 0.600 | 0.170 / 0.000 | 0.60 | 0.000 | 0.000 / 0.400 |
| role landmark | 0.130 | 0.017 / 0.000 | 0.13 | 0.000 | 0.000 / 0.870 |
| role color | 0.095 | 0.016 / 0.000 | 0.05 | 0.000 | 0.048 / 0.905 |
| role landmark2 | 0.000 | 0.021 / 0.004 | 0.00 | 0.000 | 0.000 / 1.000 |
| role style | 1.000 | 0.210 / 0.118 | 1.00 | 0.000 | 0.000 / 0.000 |
| role target | 0.250 | 0.038 / -0.019 | 0.25 | 0.000 | 0.000 / 0.750 |
| role edge | 1.000 | 0.323 / 0.323 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 1.000 | 0.391 / 0.301 | 1.00 | 0.000 | 0.000 / 0.000 |
| role pairing | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role quantity | 1.000 | 0.026 / 0.026 | 0.00 | 0.000 | 1.000 / 0.000 |
| role layout | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role region | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role name | 0.500 | 0.067 / 0.000 | 0.50 | 0.000 | 0.000 / 0.500 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 1.000 | 0.336 / 0.336 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3898)
| axis | accuracy |
|---|---|
| FULL | 0.067 |
| FULL [depth given] | 0.067 |
| FULL [depth and negation given] | 0.067 |
| structure (depth, negation) | 0.587 |
| set members: exact | 0.820 |
| set targets: exact | 0.917 |
| predicate (surface lemma) | 0.550 |
| event type (synonym table) | 0.550 |
| role object | 0.493 |
| head object | 0.503 |
| lexical order head object | 0.720 |
| lexical bag head object | 0.873 |
| occupancy: known filler | 0.344 |
| role shape | 0.907 |
| head shape | 0.907 |
| lexical order head shape | 0.900 |
| lexical bag head shape | 0.990 |
| occupancy: not given | 0.987 |
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
| role landmark | 0.843 |
| head landmark | 0.843 |
| lexical order head landmark | 0.807 |
| lexical bag head landmark | 0.967 |
| role landmark2 | 0.980 |
| head landmark2 | 0.980 |
| lexical order head landmark2 | 0.980 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.950 |
| head region | 0.950 |
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
| role target | 0.907 |
| head target | 0.907 |
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
| role members | 0.820 |
| head members | 0.820 |
| lexical order head members | 0.897 |
| lexical bag head members | 0.897 |
| role targets | 0.917 |
| head targets | 0.917 |
| lexical order head targets | 0.940 |
| lexical bag head targets | 0.923 |
| heads FULL (model) | 0.120 |
| heads FULL (lexical order baseline) | 0.160 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.607 |
| presence object: present read present | 0.371 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present | 0.400 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 0.222 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 0.833 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.994 |
| presence quantity: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.917 |
| presence target: absent read absent | 0.859 |
| presence style: absent read absent | 0.959 |
| presence edge: absent read absent | 0.976 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 0.993 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.835 |
| presence targets: absent read absent | 0.919 |
| depth estimate: fit (check) | 1.000 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence relation: present read present | 0.966 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.341 |
| presence name: present read present | 0.800 |
| presence name: share of 'present' readings that abstain | 0.500 |
| presence name: share of true 'present' readings that abstain | 0.500 |
| presence object: absent read absent | 0.975 |
| presence source: present read present | 0.844 |
| presence source: share of 'present' readings that abstain | 0.051 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.800 |
| presence target: share of 'present' readings that abstain | 0.263 |
| presence target: share of true 'present' readings that abstain | 0.125 |
| presence edge: present read present | 0.714 |
| presence edge: share of 'present' readings that abstain | 0.444 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence members: share of 'present' readings that abstain | 0.071 |
| presence members: share of FALSE 'present' readings that abstain | 0.115 |
| set members: first gold member in the decoded set | 0.452 |
| occupancy: unknown filler | 0.469 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence landmark: share of 'present' readings that abstain | 0.267 |
| presence landmark: share of true 'present' readings that abstain | 0.267 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.167 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.167 |
| presence members: present read present | 0.889 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| presence targets: share of 'present' readings that abstain | 0.350 |
| presence targets: share of FALSE 'present' readings that abstain | 0.462 |
| presence superlative: present read present | 0.750 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence layout: present read present | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.364 |
| presence targets: present read present | 0.438 |
| presence targets: share of true 'present' readings that abstain | 0.143 |
| set targets: first gold member in the decoded set | 0.389 |
| presence edge: share of FALSE 'present' readings that abstain | 1.000 |
| presence pairing: present read present | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence superlative: share of FALSE 'present' readings that abstain | 0.000 |
| presence region: share of 'present' readings that abstain | 1.000 |
| presence region: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.539; status {'unknown-event': 122, 'ok': 134, 'abstain': 42, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.550 | 0.298 / 0.000 | 0.59 | 0.040 | 0.000 / 0.410 |
| role object | 0.162 | 0.055 / 0.000 | 0.20 | 0.039 | 0.000 / 0.799 |
| roles (pooled) | 0.305 | 0.086 / 0.000 | 0.33 | 0.032 | 0.005 / 0.663 |
| role relation | 0.622 | 0.204 / 0.000 | 0.62 | 0.000 | 0.000 / 0.378 |
| role landmark | 0.190 | 0.027 / 0.000 | 0.19 | 0.000 | 0.000 / 0.810 |
| role shape | 0.067 | 0.007 / 0.000 | 0.07 | 0.000 | 0.000 / 0.933 |
| role size | 0.357 | 0.121 / 0.000 | 0.36 | 0.000 | 0.000 / 0.643 |
| role color | 0.078 | 0.015 / 0.000 | 0.08 | 0.000 | 0.000 / 0.922 |
| role name | 0.353 | 0.062 / -0.003 | 0.35 | 0.000 | 0.000 / 0.647 |
| role quantity | 0.750 | 0.074 / 0.023 | 0.75 | 0.000 | 0.000 / 0.250 |
| role source | 0.692 | 0.138 / 0.000 | 0.69 | 0.000 | 0.000 / 0.308 |
| role target | 0.727 | 0.161 / 0.000 | 0.64 | 0.000 | 0.091 / 0.273 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role edge | 0.625 | 0.193 / 0.000 | 0.62 | 0.000 | 0.000 / 0.375 |
| role pairing | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role members | 0.097 | 0.078 / 0.000 | 0.52 | 0.419 | 0.000 / 0.484 |
| role text | 0.846 | 0.197 / 0.038 | 0.85 | 0.000 | 0.000 / 0.154 |
| role style | 0.875 | 0.242 / 0.182 | 0.88 | 0.000 | 0.000 / 0.125 |
| role landmark2 | 0.000 | 0.004 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role superlative | 0.750 | 0.306 / 0.000 | 0.75 | 0.000 | 0.000 / 0.250 |
| role layout | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role targets | 0.333 | 0.039 / 0.000 | 0.33 | 0.056 | 0.056 / 0.611 |
| role region | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 1.000 | 0.294 / 0.213 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)


## What is weak, what to add
- heldout_formulations: FULL 0.112
- heldout_formulations: structure (depth, negation) 0.566
- heldout_formulations: set members: exact 0.839
- heldout_formulations: set members: first gold member in the decoded set 0.286
- heldout_formulations: predicate (surface lemma) 0.538
- heldout_formulations: event type (synonym table) 0.538
- heldout_formulations: role object 0.476
- heldout_formulations: head object 0.483
- heldout_formulations: role color 0.867
- heldout_formulations: head color 0.867
- heldout_formulations: role landmark 0.860
- heldout_formulations: head landmark 0.860
- heldout_formulations: occupancy: known filler 0.277
- heldout_formulations: role target 0.888
- heldout_formulations: head target 0.888
- heldout_formulations: role members 0.839
- heldout_formulations: head members 0.839
- heldout_formulations: occupancy: unknown filler 0.360
- heldout_formulations: heads FULL (model) 0.161
- heldout_formulations: heads FULL (lexical order baseline) 0.189
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.455
- heldout_formulations: FULL [depth given] 0.112
- heldout_formulations: FULL [depth and negation given] 0.112
- heldout_formulations: FULL [presence not decided] 0.133
- heldout_formulations: role object [presence not decided] 0.538
- heldout_formulations: role color [presence not decided] 0.895
- heldout_formulations: role landmark [presence not decided] 0.860
- heldout_formulations: role members [presence not decided] 0.853
- heldout_formulations: heads FULL (model) [presence not decided] 0.196
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.119
- heldout_formulations: role object [pooled midpoint (comparison)] 0.483
- heldout_formulations: role color [pooled midpoint (comparison)] 0.860
- heldout_formulations: role landmark [pooled midpoint (comparison)] 0.853
- heldout_formulations: role members [pooled midpoint (comparison)] 0.867
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.168
- heldout_formulations: presence source: present read present 0.636
- heldout_formulations: presence source: share of 'present' readings that abstain 0.100
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.143
- heldout_formulations: presence target: share of 'present' readings that abstain 0.333
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.286
- heldout_formulations: presence members: absent read absent 0.865
- heldout_formulations: presence members: share of 'present' readings that abstain 0.062
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence targets: present read present 0.400
- heldout_formulations: set targets: first gold member in the decoded set 0.400
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.545
- heldout_formulations: presence targets: present read present [pooled midpoint (comparison)] 0.800
- heldout_formulations: presence object: present read present 0.277
- heldout_formulations: presence object: share of 'present' readings that abstain 0.143
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.077
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: present read present 0.833
- heldout_formulations: presence text: share of 'present' readings that abstain 0.200
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.200
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present 0.333
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.400
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.400
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.267
- heldout_formulations: presence text: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.154
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_formulations: presence landmark2: present read present 0.500
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.200
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence color: present read present 0.182
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.091
- heldout_formulations: presence target: present read present 0.714
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.400
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.500
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.571
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present 0.857
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.167
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.333
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.571
- heldout_formulations: presence pairing: present read present 0.000
- heldout_formulations: presence pairing: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence quantity: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence layout: present read present 0.000
- heldout_formulations: presence layout: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: present read present 0.000
- heldout_formulations: presence region: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.500
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.500
- heldout_formulations: presence shape: present read present 0.000
- heldout_formulations: presence shape: present read present [pooled midpoint (comparison)] 0.000
- train (sample): FULL 0.067
- train (sample): structure (depth, negation) 0.587
- train (sample): set members: exact 0.820
- train (sample): predicate (surface lemma) 0.550
- train (sample): event type (synonym table) 0.550
- train (sample): role object 0.493
- train (sample): head object 0.503
- train (sample): occupancy: known filler 0.344
- train (sample): role color 0.843
- train (sample): head color 0.843
- train (sample): role size 0.880
- train (sample): head size 0.880
- train (sample): role landmark 0.843
- train (sample): head landmark 0.843
- train (sample): role members 0.820
- train (sample): head members 0.820
- train (sample): heads FULL (model) 0.120
- train (sample): heads FULL (lexical order baseline) 0.160
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.607
- train (sample): FULL [depth given] 0.067
- train (sample): FULL [depth and negation given] 0.067
- train (sample): presence object: present read present 0.371
- train (sample): presence object: share of 'present' readings that abstain 0.000
- train (sample): presence object: share of true 'present' readings that abstain 0.000
- train (sample): presence shape: present read present 0.400
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence color: present read present 0.222
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): presence size: present read present 0.833
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence target: absent read absent 0.859
- train (sample): presence members: absent read absent 0.835
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: present read present 0.341
- train (sample): presence name: present read present 0.800
- train (sample): presence name: share of 'present' readings that abstain 0.500
- train (sample): presence name: share of true 'present' readings that abstain 0.500
- train (sample): presence source: present read present 0.844
- train (sample): presence source: share of 'present' readings that abstain 0.051
- train (sample): presence source: share of true 'present' readings that abstain 0.000
- train (sample): presence target: present read present 0.800
- train (sample): presence target: share of 'present' readings that abstain 0.263
- train (sample): presence target: share of true 'present' readings that abstain 0.125
- train (sample): presence edge: present read present 0.714
- train (sample): presence edge: share of 'present' readings that abstain 0.444
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.071
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.115
- train (sample): set members: first gold member in the decoded set 0.452
- train (sample): occupancy: unknown filler 0.469
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.267
- train (sample): presence landmark: share of true 'present' readings that abstain 0.267
- train (sample): presence style: share of 'present' readings that abstain 0.000
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: present read present 0.167
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.167
- train (sample): presence members: present read present 0.889
- train (sample): presence members: share of true 'present' readings that abstain 0.000
- train (sample): presence targets: share of 'present' readings that abstain 0.350
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.462
- train (sample): presence superlative: present read present 0.750
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence layout: present read present 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.364
- train (sample): presence targets: present read present 0.438
- train (sample): presence targets: share of true 'present' readings that abstain 0.143
- train (sample): set targets: first gold member in the decoded set 0.389
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
| heldout_formulations | product readout: presence decided | 0.161 | 0.112 | 0.476 | 0.923 | 0.867 | 0.937 | 0.986 | 0.979 | 0.958 | 0.860 | 0.986 | 0.937 | 0.993 | 0.993 | 1.000 | 0.986 | 0.979 | 0.909 | 0.888 | 0.993 | 0.986 | 0.993 | 0.951 | 1.000 | 1.000 | 0.839 | 0.958 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.168 | 0.119 | 0.483 | 0.923 | 0.860 | 0.937 | 0.986 | 0.972 | 0.937 | 0.853 | 0.986 | 0.937 | 0.993 | 0.993 | 0.993 | 0.986 | 0.979 | 0.902 | 0.909 | 0.986 | 0.986 | 0.993 | 0.951 | 1.000 | 1.000 | 0.867 | 0.958 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.196 | 0.133 | 0.538 | 0.923 | 0.895 | 0.937 | 0.986 | 0.958 | 0.958 | 0.860 | 0.986 | 0.937 | 1.000 | 1.000 | 1.000 | 0.986 | 0.979 | 0.902 | 0.902 | 0.993 | 0.993 | 0.993 | 0.951 | 1.000 | 1.000 | 0.853 | 0.958 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.277 | 0.971 | 0.624 | 0.143 (1.000 / 0.077) |
| heldout_formulations | object | comparison: pooled midpoint | 0.267 | 1.000 | 0.633 |  |
| heldout_formulations | shape | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | shape | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | color | product: fitted | 0.182 | 1.000 | 0.591 | 0.500 (— / 0.500) |
| heldout_formulations | color | comparison: pooled midpoint | 0.091 | 1.000 | 0.545 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 0.833 | 1.000 | 0.917 | 0.200 (— / 0.200) |
| heldout_formulations | text | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | relation | product: fitted | 0.900 | 1.000 | 0.950 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_formulations | landmark | product: fitted | 0.333 | 1.000 | 0.667 | 0.400 (— / 0.400) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.154 | 1.000 | 0.577 |  |
| heldout_formulations | landmark2 | product: fitted | 0.500 | 1.000 | 0.750 | 1.000 (— / 1.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | region | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | region | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | layout | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | layout | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | source | product: fitted | 0.636 | 0.957 | 0.797 | 0.100 (0.000 / 0.143) |
| heldout_formulations | source | comparison: pooled midpoint | 0.545 | 0.956 | 0.751 |  |
| heldout_formulations | target | product: fitted | 0.714 | 0.905 | 0.810 | 0.333 (0.286 / 0.400) |
| heldout_formulations | target | comparison: pooled midpoint | 0.571 | 0.958 | 0.765 |  |
| heldout_formulations | style | product: fitted | 1.000 | 0.987 | 0.994 | 0.000 (0.000 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 0.667 | 0.987 | 0.827 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 0.988 | 0.994 | 0.500 (1.000 / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 0.987 | 0.994 |  |
| heldout_formulations | pairing | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 0.857 | 0.865 | 0.861 | 0.062 (0.000 / 0.167) |
| heldout_formulations | members | comparison: pooled midpoint | 0.571 | 0.917 | 0.744 |  |
| heldout_formulations | targets | product: fitted | 0.400 | 0.961 | 0.680 | 0.200 (0.333 / 0.000) |
| heldout_formulations | targets | comparison: pooled midpoint | 0.800 | 0.959 | 0.880 |  |
| train (sample) | object | product: fitted | 0.371 | 0.975 | 0.673 | 0.000 (0.000 / 0.000) |
| train (sample) | shape | product: fitted | 0.400 | 1.000 | 0.700 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.222 | 1.000 | 0.611 | 0.000 (— / 0.000) |
| train (sample) | size | product: fitted | 0.833 | 1.000 | 0.917 | 0.000 (— / 0.000) |
| train (sample) | name | product: fitted | 0.800 | 1.000 | 0.900 | 0.500 (— / 0.500) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.966 | 1.000 | 0.983 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.341 | 1.000 | 0.670 | 0.267 (— / 0.267) |
| train (sample) | landmark2 | product: fitted | 0.167 | 1.000 | 0.583 | 1.000 (— / 1.000) |
| train (sample) | region | product: fitted | 0.000 | 0.994 | 0.497 | 1.000 (1.000 / —) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 0.000 | 1.000 | 0.500 |  |
| train (sample) | source | product: fitted | 0.844 | 0.917 | 0.880 | 0.051 (0.167 / 0.000) |
| train (sample) | target | product: fitted | 0.800 | 0.859 | 0.829 | 0.263 (0.364 / 0.125) |
| train (sample) | style | product: fitted | 1.000 | 0.959 | 0.979 | 0.000 (0.000 / 0.000) |
| train (sample) | edge | product: fitted | 0.714 | 0.976 | 0.845 | 0.444 (1.000 / 0.000) |
| train (sample) | pairing | product: fitted | 0.000 | 1.000 | 0.500 |  |
| train (sample) | superlative | product: fitted | 0.750 | 0.993 | 0.872 | 0.000 (0.000 / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 0.889 | 0.835 | 0.862 | 0.071 (0.115 / 0.000) |
| train (sample) | targets | product: fitted | 0.438 | 0.919 | 0.678 | 0.350 (0.462 / 0.143) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
