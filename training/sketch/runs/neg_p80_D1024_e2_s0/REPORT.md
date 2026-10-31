# REPORT — world `real`, legend sha256:12cf77be5d58… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4450 annotated sentences from 2 files; provenance: {'llm': 4282, 'llm-outside-spans': 168}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/neg_p80_D1024_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 210 sentences
- heldout_formulations: 172 sentences
- train: 4068 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
26283 tokens in the examples; 2167 with no kind in the lexicon (share 0.082), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit fa74228. Memory curve: runs/neg_p80_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.120 [rule: fit; pooled midpoint 0.368 (comparison)] (present 0.734, n 170 / absent 0.001, n 665397)
- set_member:targets: threshold 0.105 [rule: fit; pooled midpoint 0.104 (comparison)] (present 0.209, n 45 / absent -0.001, n 194163)
- presence:object: threshold 0.114 [rule: fit; pooled midpoint 0.644 (comparison)] (present 1.178, n 353 / absent 0.110, n 257)
- presence:shape: threshold 0.030 [rule: fit; pooled midpoint 0.396 (comparison)] (present 0.783, n 57 / absent 0.009, n 553)
- presence:color: threshold 0.131 [rule: fit; pooled midpoint 0.484 (comparison)] (present 0.951, n 108 / absent 0.017, n 502)
- presence:size: threshold 0.297 [rule: fit; pooled midpoint 0.389 (comparison)] (present 0.749, n 85 / absent 0.028, n 525)
- presence:name: threshold 0.303 [rule: fit; pooled midpoint 0.236 (comparison)] (present 0.469, n 17 / absent 0.003, n 593)
- presence:text: threshold 0.035 [rule: fit; pooled midpoint 0.300 (comparison)] (present 0.614, n 26 / absent -0.015, n 584)
- presence:relation: threshold 0.104 [rule: fit; pooled midpoint 0.470 (comparison)] (present 0.928, n 77 / absent 0.013, n 533)
- presence:landmark: threshold 0.150 [rule: fit; pooled midpoint 0.485 (comparison)] (present 0.925, n 108 / absent 0.045, n 502)
- presence:landmark2: threshold 0.168 [rule: fit; pooled midpoint 0.141 (comparison)] (present 0.280, n 8 / absent 0.001, n 602)
- presence:region: threshold 0.171 [rule: fit; pooled midpoint 0.304 (comparison)] (present 0.580, n 28 / absent 0.028, n 582)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 607)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 606)
- presence:quantity: threshold 0.099 [rule: fit; pooled midpoint 0.189 (comparison)] (present 0.379, n 8 / absent -0.000, n 602)
- presence:axis: threshold 0.206 [rule: fit; pooled midpoint 0.305 (comparison)] (present 0.609, n 9 / absent 0.000, n 601)
- presence:layout: threshold 0.306 [rule: fit; pooled midpoint 0.534 (comparison)] (present 1.069, n 12 / absent 0.000, n 598)
- presence:source: threshold 0.247 [rule: fit; pooled midpoint 0.460 (comparison)] (present 0.892, n 82 / absent 0.028, n 528)
- presence:target: threshold 0.255 [rule: fit; pooled midpoint 0.650 (comparison)] (present 1.266, n 58 / absent 0.034, n 552)
- presence:style: threshold 0.085 [rule: fit; pooled midpoint 0.288 (comparison)] (present 0.564, n 20 / absent 0.012, n 590)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 607)
- presence:edge: threshold 0.350 [rule: fit; pooled midpoint 0.367 (comparison)] (present 0.735, n 14 / absent -0.001, n 596)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 14)
- presence:pairing: threshold 0.486 [rule: fit; pooled midpoint 0.595 (comparison)] (present 1.177, n 35 / absent 0.012, n 575)
- presence:superlative: threshold 0.203 [rule: fit; pooled midpoint 0.432 (comparison)] (present 0.864, n 62 / absent 0.001, n 548)
- presence:comparison: threshold 0.254 [rule: fit; pooled midpoint 0.268 (comparison)] (present 0.537, n 5 / absent -0.001, n 605)
- presence:members: threshold 0.318 [rule: fit; pooled midpoint 0.602 (comparison)] (present 1.054, n 62 / absent 0.150, n 548)
- presence:targets: threshold 0.160 [rule: fit; pooled midpoint 0.154 (comparison)] (present 0.270, n 23 / absent 0.039, n 587)
- attr_presence:object: threshold 0.355 [rule: fit; pooled midpoint 0.371 (comparison)] (present 0.621, n 28 / absent 0.121, n 322)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 347)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.056, quantity 0.056, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 172 of 172)
| axis | accuracy |
|---|---|
| FULL | 0.610 |
| FULL [depth given] | 0.610 |
| FULL [depth and negation given] | 0.610 |
| FULL [presence not decided] | 0.366 |
| FULL [pooled midpoint (comparison)] | 0.448 |
| presence object: present read present | 0.961 |
| presence object: share of 'present' readings that abstain | 0.097 |
| presence object: share of true 'present' readings that abstain | 0.091 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.992 |
| presence landmark2: absent read absent | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.957 |
| presence target: absent read absent | 0.937 |
| presence style: absent read absent | 0.981 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.938 |
| presence targets: absent read absent | 0.927 |
| structure (depth, negation) | 0.913 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.860 |
| set targets: exact | 0.901 |
| predicate (surface lemma) | 0.878 |
| event type (synonym table) | 0.878 |
| role object | 0.866 |
| head object | 0.890 |
| lexical order head object | 0.762 |
| lexical bag head object | 0.785 |
| occupancy: unknown filler | 0.894 |
| role shape | 0.988 |
| head shape | 0.988 |
| lexical order head shape | 0.907 |
| lexical bag head shape | 0.988 |
| occupancy: not given | 0.989 |
| role color | 0.924 |
| head color | 0.924 |
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
| role landmark | 0.971 |
| head landmark | 0.971 |
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
| role source | 0.948 |
| head source | 0.948 |
| lexical order head source | 0.901 |
| lexical bag head source | 0.913 |
| role target | 0.924 |
| head target | 0.924 |
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
| role superlative | 1.000 |
| head superlative | 1.000 |
| lexical order head superlative | 0.919 |
| lexical bag head superlative | 0.965 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.983 |
| lexical bag head comparison | 1.000 |
| role members | 0.860 |
| head members | 0.860 |
| lexical order head members | 0.913 |
| lexical bag head members | 0.913 |
| role targets | 0.901 |
| head targets | 0.901 |
| lexical order head targets | 0.965 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.640 |
| heads FULL (lexical order baseline) | 0.209 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.465 |
| role object [presence not decided] | 0.866 |
| role shape [presence not decided] | 0.988 |
| role color [presence not decided] | 0.959 |
| role size [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 0.913 |
| role relation [presence not decided] | 0.983 |
| role landmark [presence not decided] | 0.983 |
| role landmark2 [presence not decided] | 1.000 |
| role region [presence not decided] | 0.983 |
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
| role members [presence not decided] | 0.471 |
| role targets [presence not decided] | 0.878 |
| heads FULL (model) [presence not decided] | 0.378 |
| role object [pooled midpoint (comparison)] | 0.674 |
| role shape [pooled midpoint (comparison)] | 0.988 |
| role color [pooled midpoint (comparison)] | 0.890 |
| role size [pooled midpoint (comparison)] | 0.994 |
| role name [pooled midpoint (comparison)] | 1.000 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.953 |
| role landmark [pooled midpoint (comparison)] | 0.953 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.988 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 0.988 |
| role axis [pooled midpoint (comparison)] | 1.000 |
| role layout [pooled midpoint (comparison)] | 0.994 |
| role source [pooled midpoint (comparison)] | 0.948 |
| role target [pooled midpoint (comparison)] | 0.942 |
| role style [pooled midpoint (comparison)] | 0.994 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 0.988 |
| role superlative [pooled midpoint (comparison)] | 1.000 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.901 |
| role targets [pooled midpoint (comparison)] | 0.895 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.471 |
| presence object: present read present [pooled midpoint (comparison)] | 0.636 |
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
| presence target: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.918 |
| presence landmark: present read present | 0.900 |
| presence landmark: share of 'present' readings that abstain | 0.107 |
| presence landmark: share of true 'present' readings that abstain | 0.074 |
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
| presence color: present read present | 0.781 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.933 |
| presence color: present read present [pooled midpoint (comparison)] | 0.594 |
| presence size: present read present [pooled midpoint (comparison)] | 0.950 |
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
| presence source: share of 'present' readings that abstain | 0.400 |
| presence source: share of true 'present' readings that abstain | 0.286 |
| presence target: share of 'present' readings that abstain | 0.400 |
| presence target: share of FALSE 'present' readings that abstain | 0.667 |
| presence members: share of 'present' readings that abstain | 1.000 |
| presence members: share of FALSE 'present' readings that abstain | 1.000 |
| presence targets: present read present | 1.000 |
| presence targets: share of 'present' readings that abstain | 1.000 |
| presence targets: share of true 'present' readings that abstain | 1.000 |
| set targets: first gold member in the decoded set | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.733 |
| presence targets: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence target: present read present | 0.733 |
| presence target: share of true 'present' readings that abstain | 0.182 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence targets: share of FALSE 'present' readings that abstain | 1.000 |
| presence target: present read present [pooled midpoint (comparison)] | 0.429 |
| presence landmark2: present read present | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 1.000 |
| set members: first gold member in the decoded set | 0.800 |
| presence layout: present read present [pooled midpoint (comparison)] | 0.667 |
| presence members: present read present [pooled midpoint (comparison)] | 0.308 |
| presence source: share of FALSE 'present' readings that abstain | 0.667 |
| presence pairing: present read present | 0.667 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
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
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 1.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.250 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.500 |
| presence name: share of true 'present' readings that abstain | 0.500 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.250; status {'ok': 101, 'abstain': 56, 'no-sense': 3, 'unknown-event': 12}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.878 | 0.389 / 0.040 | 0.88 | 0.035 | 0.029 / 0.087 |
| role object | 0.833 | 0.266 / 0.046 | 0.87 | 0.114 | 0.079 / 0.053 |
| roles (pooled) | 0.789 | 0.219 / 0.000 | 0.77 | 0.043 | 0.061 / 0.168 |
| role region | 0.900 | 0.313 / 0.217 | 0.90 | 0.000 | 0.000 / 0.100 |
| role landmark | 0.871 | 0.171 / 0.000 | 0.81 | 0.000 | 0.065 / 0.129 |
| role comparison | 1.000 | 0.252 / 0.210 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 0.875 | 0.251 / 0.165 | 0.94 | 0.062 | 0.000 / 0.062 |
| role color | 0.658 | 0.191 / 0.000 | 0.68 | 0.026 | 0.000 / 0.316 |
| role size | 1.000 | 0.291 / 0.232 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.211 / 0.172 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.870 | 0.211 / 0.002 | 0.74 | 0.000 | 0.130 / 0.130 |
| role source | 0.824 | 0.091 / 0.000 | 0.59 | 0.000 | 0.235 / 0.176 |
| role targets | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role target | 0.733 | 0.094 / 0.000 | 0.60 | 0.000 | 0.133 / 0.267 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role layout | 1.000 | 0.370 / 0.193 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role pairing | 0.667 | 0.121 / 0.000 | 0.67 | 0.000 | 0.000 / 0.333 |
| role style | 1.000 | 0.258 / 0.243 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.336 / 0.332 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.223 / 0.223 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 1.000 | 0.478 / 0.406 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.065 / 0.061 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 1.000 | 0.124 / 0.029 | 0.50 | 0.000 | 0.500 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3900)
| axis | accuracy |
|---|---|
| FULL | 0.643 |
| FULL [depth given] | 0.643 |
| FULL [depth and negation given] | 0.643 |
| presence object: present read present | 0.967 |
| presence object: share of 'present' readings that abstain | 0.060 |
| presence object: share of true 'present' readings that abstain | 0.062 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.996 |
| presence size: absent read absent | 0.992 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 0.996 |
| presence relation: present read present | 0.941 |
| presence relation: share of 'present' readings that abstain | 0.062 |
| presence relation: share of true 'present' readings that abstain | 0.062 |
| presence landmark: present read present | 0.967 |
| presence landmark: share of 'present' readings that abstain | 0.117 |
| presence landmark: share of true 'present' readings that abstain | 0.119 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.989 |
| presence region: share of 'present' readings that abstain | 0.053 |
| presence region: share of FALSE 'present' readings that abstain | 0.333 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.950 |
| presence target: absent read absent | 0.941 |
| presence style: absent read absent | 0.982 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.954 |
| presence targets: absent read absent | 0.907 |
| structure (depth, negation) | 0.963 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.870 |
| set targets: exact | 0.883 |
| predicate (surface lemma) | 0.917 |
| event type (synonym table) | 0.917 |
| role object | 0.900 |
| head object | 0.927 |
| lexical order head object | 0.770 |
| lexical bag head object | 0.900 |
| occupancy: known filler | 0.888 |
| role shape | 0.990 |
| head shape | 0.990 |
| lexical order head shape | 0.900 |
| lexical bag head shape | 0.993 |
| occupancy: not given | 0.988 |
| role color | 0.963 |
| head color | 0.963 |
| lexical order head color | 0.837 |
| lexical bag head color | 0.993 |
| role size | 0.983 |
| head size | 0.983 |
| lexical order head size | 0.827 |
| lexical bag head size | 0.977 |
| role name | 0.997 |
| head name | 0.997 |
| lexical order head name | 0.937 |
| lexical bag head name | 1.000 |
| role text | 0.993 |
| head text | 0.993 |
| lexical order head text | 0.953 |
| lexical bag head text | 0.997 |
| role relation | 0.983 |
| head relation | 0.983 |
| lexical order head relation | 0.827 |
| lexical bag head relation | 0.973 |
| role landmark | 0.980 |
| head landmark | 0.980 |
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
| role source | 0.933 |
| head source | 0.933 |
| lexical order head source | 0.907 |
| lexical bag head source | 0.977 |
| role target | 0.930 |
| head target | 0.930 |
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
| role pairing | 0.993 |
| head pairing | 0.993 |
| lexical order head pairing | 0.943 |
| lexical bag head pairing | 0.993 |
| role superlative | 0.987 |
| head superlative | 0.987 |
| lexical order head superlative | 0.900 |
| lexical bag head superlative | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.997 |
| lexical bag head comparison | 1.000 |
| role members | 0.870 |
| head members | 0.870 |
| lexical order head members | 0.910 |
| lexical bag head members | 0.910 |
| role targets | 0.883 |
| head targets | 0.883 |
| lexical order head targets | 0.970 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.683 |
| heads FULL (lexical order baseline) | 0.167 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.693 |
| presence shape: present read present | 0.964 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 0.980 |
| presence size: share of 'present' readings that abstain | 0.038 |
| presence size: share of true 'present' readings that abstain | 0.040 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.996 |
| presence color: present read present | 0.909 |
| presence color: share of 'present' readings that abstain | 0.024 |
| presence color: share of true 'present' readings that abstain | 0.025 |
| presence name: present read present | 0.947 |
| presence name: share of 'present' readings that abstain | 0.222 |
| presence name: share of true 'present' readings that abstain | 0.222 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: share of 'present' readings that abstain | 1.000 |
| presence members: share of FALSE 'present' readings that abstain | 1.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.250 |
| presence quantity: share of true 'present' readings that abstain | 0.250 |
| presence object: absent read absent | 0.962 |
| presence source: present read present | 0.750 |
| presence source: share of 'present' readings that abstain | 0.353 |
| presence source: share of true 'present' readings that abstain | 0.143 |
| presence target: present read present | 0.750 |
| presence target: share of 'present' readings that abstain | 0.452 |
| presence target: share of true 'present' readings that abstain | 0.067 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence targets: share of 'present' readings that abstain | 1.000 |
| presence targets: share of FALSE 'present' readings that abstain | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present | 0.882 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 1.000 |
| set members: first gold member in the decoded set | 0.963 |
| occupancy: unknown filler | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.071 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 0.857 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.692 |
| presence superlative: present read present | 0.867 |
| presence superlative: share of 'present' readings that abstain | 0.038 |
| presence superlative: share of true 'present' readings that abstain | 0.038 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.812 |
| presence targets: present read present | 1.000 |
| presence targets: share of true 'present' readings that abstain | 1.000 |
| set targets: first gold member in the decoded set | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence text: share of FALSE 'present' readings that abstain | 1.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.189; status {'abstain': 92, 'ok': 197, 'unknown-event': 8, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.917 | 0.427 / 0.225 | 0.96 | 0.040 | 0.000 / 0.043 |
| role object | 0.867 | 0.273 / 0.026 | 0.89 | 0.077 | 0.051 / 0.056 |
| roles (pooled) | 0.820 | 0.228 / 0.000 | 0.80 | 0.036 | 0.054 / 0.144 |
| role relation | 0.904 | 0.226 / 0.036 | 0.87 | 0.019 | 0.058 / 0.077 |
| role landmark | 0.921 | 0.195 / 0.015 | 0.83 | 0.000 | 0.095 / 0.079 |
| role shape | 0.900 | 0.263 / 0.229 | 0.97 | 0.067 | 0.000 / 0.033 |
| role size | 0.942 | 0.271 / 0.148 | 0.94 | 0.019 | 0.019 / 0.038 |
| role color | 0.796 | 0.247 / 0.000 | 0.86 | 0.061 | 0.000 / 0.143 |
| role name | 0.947 | 0.161 / 0.004 | 0.74 | 0.000 | 0.211 / 0.053 |
| role quantity | 1.000 | 0.079 / 0.029 | 0.75 | 0.000 | 0.250 / 0.000 |
| role source | 0.750 | 0.091 / 0.000 | 0.64 | 0.000 | 0.107 / 0.250 |
| role target | 0.750 | 0.132 / 0.000 | 0.70 | 0.000 | 0.050 / 0.250 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role edge | 1.000 | 0.326 / 0.289 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 0.889 | 0.314 / 0.181 | 0.94 | 0.056 | 0.000 / 0.056 |
| role pairing | 0.882 | 0.249 / 0.060 | 0.88 | 0.000 | 0.000 / 0.118 |
| role members | 0.000 | 0.001 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role text | 0.929 | 0.248 / 0.178 | 1.00 | 0.071 | 0.000 / 0.000 |
| role style | 0.857 | 0.216 / 0.082 | 0.86 | 0.000 | 0.000 / 0.143 |
| role landmark2 | 1.000 | 0.023 / 0.017 | 0.00 | 0.000 | 1.000 / 0.000 |
| role superlative | 0.867 | 0.403 / 0.000 | 0.83 | 0.000 | 0.033 / 0.133 |
| role layout | 1.000 | 0.277 / 0.094 | 1.00 | 0.000 | 0.000 / 0.000 |
| role targets | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 1.000 | 0.306 / 0.306 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.290 / 0.284 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 SUPER=0.98 COLOR=0.97 for=0.97 AXIS=0.90 once=0.87 LAYOUT=0.84 pixels=0.84 rules=0.81 TEXT=0.73 NUM=0.67 from=0.63 whole=0.62 VERB=0.60 NAME=0.56 PAIR=0.54 have=0.52 with=0.47 them=0.44 thing=0.41 as=0.35 any=0.34 last=0.30 that=0.27 do=0.26 it=0.23 those=0.22 we=0.22 now=0.21 there=0.21 DIR=0.20 this=0.20 too=0.18 remove=0.14 can=0.13 line=0.13 each=0.13 exist=0.13 NOTCOLOR=0.12 i=0.11 SIZE=0.11 check=0.10 at=0.10 both=0.09 are=0.09 arrow=0.09 then=0.09 here=0.08 ARROW=0.08 in=0.08 evenly=0.07 reached=0.07 no=0.07 directly=0.07 show=0.07 two=0.07 front=0.06 uh=0.06 box=0.06 four=0.06 me=0.05 what=0.05 shapes=0.05 if=0.05 axis=0.04 diagram=0.04 what's=0.04 by=0.04 give=0.04 link=0.04 back=0.04 you=0.04 just=0.04 place=0.03 three=0.03 an=0.03 not=0.03 has=0.03 arrows=0.03 SHAPE=0.03 new=0.03 RECENT=0.03 map=0.03 tell=0.02 does=0.02 goes=0.02 STYLE=0.02 should=0.02 on=0.02 be=0.02 who=0.02 put=0.02 lines=0.02 QUANT=0.01 every=0.01 shape=0.01 one=0.01 of=0.01 named=0.01 called=0.00 unknown=0.00 the=0.00 labeled=0.00 and=0.00 to=0.00 a=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.610
- heldout_formulations: presence object: share of 'present' readings that abstain 0.097
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.091
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: set members: exact 0.860
- heldout_formulations: predicate (surface lemma) 0.878
- heldout_formulations: event type (synonym table) 0.878
- heldout_formulations: role object 0.866
- heldout_formulations: head object 0.890
- heldout_formulations: occupancy: unknown filler 0.894
- heldout_formulations: occupancy: known filler 0.843
- heldout_formulations: role members 0.860
- heldout_formulations: head members 0.860
- heldout_formulations: heads FULL (model) 0.640
- heldout_formulations: heads FULL (lexical order baseline) 0.209
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.465
- heldout_formulations: FULL [depth given] 0.610
- heldout_formulations: FULL [depth and negation given] 0.610
- heldout_formulations: FULL [presence not decided] 0.366
- heldout_formulations: role object [presence not decided] 0.866
- heldout_formulations: role members [presence not decided] 0.471
- heldout_formulations: role targets [presence not decided] 0.878
- heldout_formulations: heads FULL (model) [presence not decided] 0.378
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.448
- heldout_formulations: role object [pooled midpoint (comparison)] 0.674
- heldout_formulations: role color [pooled midpoint (comparison)] 0.890
- heldout_formulations: role targets [pooled midpoint (comparison)] 0.895
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.471
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.636
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.107
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.074
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.852
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present 0.781
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.594
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.150
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.150
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.789
- heldout_formulations: presence source: present read present 0.875
- heldout_formulations: presence source: share of 'present' readings that abstain 0.400
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.286
- heldout_formulations: presence target: share of 'present' readings that abstain 0.400
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.667
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.733
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_formulations: presence target: present read present 0.733
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.182
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.429
- heldout_formulations: presence landmark2: present read present 0.000
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: set members: first gold member in the decoded set 0.800
- heldout_formulations: presence layout: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.308
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.667
- heldout_formulations: presence pairing: present read present 0.667
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.250
- heldout_formulations: presence name: share of 'present' readings that abstain 0.500
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.500
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.643
- train (sample): presence object: share of 'present' readings that abstain 0.060
- train (sample): presence object: share of true 'present' readings that abstain 0.062
- train (sample): presence relation: share of 'present' readings that abstain 0.062
- train (sample): presence relation: share of true 'present' readings that abstain 0.062
- train (sample): presence landmark: share of 'present' readings that abstain 0.117
- train (sample): presence landmark: share of true 'present' readings that abstain 0.119
- train (sample): presence region: share of 'present' readings that abstain 0.053
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.333
- train (sample): set members: exact 0.870
- train (sample): set targets: exact 0.883
- train (sample): occupancy: known filler 0.888
- train (sample): role members 0.870
- train (sample): head members 0.870
- train (sample): role targets 0.883
- train (sample): head targets 0.883
- train (sample): heads FULL (model) 0.683
- train (sample): heads FULL (lexical order baseline) 0.167
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.693
- train (sample): FULL [depth given] 0.643
- train (sample): FULL [depth and negation given] 0.643
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of 'present' readings that abstain 0.038
- train (sample): presence size: share of true 'present' readings that abstain 0.040
- train (sample): presence color: share of 'present' readings that abstain 0.024
- train (sample): presence color: share of true 'present' readings that abstain 0.025
- train (sample): presence name: share of 'present' readings that abstain 0.222
- train (sample): presence name: share of true 'present' readings that abstain 0.222
- train (sample): presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.250
- train (sample): presence quantity: share of true 'present' readings that abstain 0.250
- train (sample): presence source: present read present 0.750
- train (sample): presence source: share of 'present' readings that abstain 0.353
- train (sample): presence source: share of true 'present' readings that abstain 0.143
- train (sample): presence target: present read present 0.750
- train (sample): presence target: share of 'present' readings that abstain 0.452
- train (sample): presence target: share of true 'present' readings that abstain 0.067
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence pairing: present read present 0.882
- train (sample): presence pairing: share of 'present' readings that abstain 0.000
- train (sample): presence pairing: share of true 'present' readings that abstain 0.000
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.071
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence style: present read present 0.857
- train (sample): presence style: share of 'present' readings that abstain 0.000
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.692
- train (sample): presence superlative: present read present 0.867
- train (sample): presence superlative: share of 'present' readings that abstain 0.038
- train (sample): presence superlative: share of true 'present' readings that abstain 0.038
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.812
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence color: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `make NAME COLOR` FULL 0.000 (n 3)
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 3)
- heldout_formulations: `connect NAME to NAME and NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME with a solid arrow` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME with a STYLE line` FULL 0.000 (n 2)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role direction | role amount | role quantity | role axis | role layout | role source | role target | role style | role arrow | role edge | role pairing | role superlative | role comparison | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.640 | 0.610 | 0.866 | 0.988 | 0.924 | 1.000 | 1.000 | 1.000 | 0.983 | 0.971 | 0.994 | 0.988 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.948 | 0.924 | 0.983 | 1.000 | 1.000 | 0.988 | 1.000 | 1.000 | 0.860 | 0.901 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.471 | 0.448 | 0.674 | 0.988 | 0.890 | 0.994 | 1.000 | 1.000 | 0.953 | 0.953 | 1.000 | 0.988 | 1.000 | 1.000 | 0.988 | 1.000 | 0.994 | 0.948 | 0.942 | 0.994 | 1.000 | 1.000 | 0.988 | 1.000 | 1.000 | 0.901 | 0.895 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.378 | 0.366 | 0.866 | 0.988 | 0.959 | 1.000 | 1.000 | 0.913 | 0.983 | 0.983 | 1.000 | 0.983 | 0.977 | 1.000 | 1.000 | 1.000 | 1.000 | 0.924 | 0.907 | 0.983 | 1.000 | 0.988 | 1.000 | 1.000 | 1.000 | 0.471 | 0.878 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.961 | 0.926 | 0.944 | 0.097 (0.250 / 0.091) |
| heldout_formulations | object | comparison: pooled midpoint | 0.636 | 0.943 | 0.790 |  |
| heldout_formulations | shape | product: fitted | 0.933 | 1.000 | 0.967 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_formulations | color | product: fitted | 0.781 | 1.000 | 0.891 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.594 | 1.000 | 0.797 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 0.950 | 1.000 | 0.975 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.500 (— / 0.500) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.909 | 1.000 | 0.955 | 0.150 (— / 0.150) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.789 | 1.000 | 0.895 |  |
| heldout_formulations | landmark | product: fitted | 0.900 | 0.992 | 0.946 | 0.107 (1.000 / 0.074) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.852 | 1.000 | 0.926 |  |
| heldout_formulations | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 1.000 | 0.993 | 0.997 | 0.000 (0.000 / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 1.000 | 0.993 | 0.997 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | source | product: fitted | 0.875 | 0.957 | 0.916 | 0.400 (0.667 / 0.286) |
| heldout_formulations | source | comparison: pooled midpoint | 0.733 | 0.978 | 0.856 |  |
| heldout_formulations | target | product: fitted | 0.733 | 0.937 | 0.835 | 0.400 (0.667 / 0.182) |
| heldout_formulations | target | comparison: pooled midpoint | 0.429 | 0.993 | 0.711 |  |
| heldout_formulations | style | product: fitted | 1.000 | 0.981 | 0.990 | 0.000 (0.000 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 0.993 | 0.997 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.938 | 0.969 | 1.000 (1.000 / 1.000) |
| heldout_formulations | members | comparison: pooled midpoint | 0.308 | 0.986 | 0.647 |  |
| heldout_formulations | targets | product: fitted | 1.000 | 0.927 | 0.964 | 1.000 (1.000 / 1.000) |
| heldout_formulations | targets | comparison: pooled midpoint | 1.000 | 0.918 | 0.959 |  |
| train (sample) | object | product: fitted | 0.967 | 0.962 | 0.965 | 0.060 (0.000 / 0.062) |
| train (sample) | shape | product: fitted | 0.964 | 1.000 | 0.982 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.909 | 0.996 | 0.953 | 0.024 (0.000 / 0.025) |
| train (sample) | size | product: fitted | 0.980 | 0.992 | 0.986 | 0.038 (0.000 / 0.040) |
| train (sample) | name | product: fitted | 0.947 | 1.000 | 0.974 | 0.222 (— / 0.222) |
| train (sample) | text | product: fitted | 1.000 | 0.996 | 0.998 | 0.071 (1.000 / 0.000) |
| train (sample) | relation | product: fitted | 0.941 | 1.000 | 0.971 | 0.062 (— / 0.062) |
| train (sample) | landmark | product: fitted | 0.967 | 0.996 | 0.981 | 0.117 (0.000 / 0.119) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| train (sample) | region | product: fitted | 1.000 | 0.989 | 0.995 | 0.053 (0.333 / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.250 (— / 0.250) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.750 | 0.950 | 0.850 | 0.353 (0.692 / 0.143) |
| train (sample) | target | product: fitted | 0.750 | 0.941 | 0.845 | 0.452 (0.812 / 0.067) |
| train (sample) | style | product: fitted | 0.857 | 0.982 | 0.920 | 0.000 (0.000 / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 0.882 | 1.000 | 0.941 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 0.867 | 1.000 | 0.933 | 0.038 (— / 0.038) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.954 | 0.977 | 1.000 (1.000 / 1.000) |
| train (sample) | targets | product: fitted | 1.000 | 0.907 | 0.954 | 1.000 (1.000 / 1.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
