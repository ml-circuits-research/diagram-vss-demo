# REPORT — world `real`, legend sha256:cbf20196eeeb… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4284 annotated sentences from 2 files; provenance: {'llm': 4284}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/d512_p80_D512_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 210 sentences
- heldout_formulations: 172 sentences
- train: 3902 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
24230 tokens in the examples; 1029 with no kind in the lexicon (share 0.042), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=512, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 40e5d86. Memory curve: runs/d512_p80_D512_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.115 [rule: fit; pooled midpoint 0.275 (comparison)] (present 0.550, n 158 / absent 0.001, n 636378)
- set_member:targets: threshold 0.090 [rule: fit; pooled midpoint 0.088 (comparison)] (present 0.177, n 49 / absent -0.000, n 198743)
- presence:object: threshold 0.471 [rule: fit; pooled midpoint 0.709 (comparison)] (present 1.270, n 356 / absent 0.148, n 254)
- presence:shape: threshold 0.210 [rule: fit; pooled midpoint 0.433 (comparison)] (present 0.832, n 63 / absent 0.034, n 547)
- presence:color: threshold 0.401 [rule: fit; pooled midpoint 0.558 (comparison)] (present 1.081, n 106 / absent 0.035, n 504)
- presence:size: threshold 0.403 [rule: fit; pooled midpoint 0.462 (comparison)] (present 0.899, n 86 / absent 0.026, n 524)
- presence:name: threshold 0.213 [rule: fit; pooled midpoint 0.200 (comparison)] (present 0.391, n 19 / absent 0.009, n 591)
- presence:text: threshold 0.282 [rule: fit; pooled midpoint 0.322 (comparison)] (present 0.601, n 28 / absent 0.044, n 582)
- presence:relation: threshold 0.421 [rule: fit; pooled midpoint 0.456 (comparison)] (present 0.845, n 79 / absent 0.068, n 531)
- presence:landmark: threshold 0.241 [rule: fit; pooled midpoint 0.355 (comparison)] (present 0.636, n 116 / absent 0.074, n 494)
- presence:landmark2: threshold 0.206 [rule: fit; pooled midpoint 0.152 (comparison)] (present 0.237, n 5 / absent 0.066, n 605)
- presence:region: threshold 0.318 [rule: fit; pooled midpoint 0.353 (comparison)] (present 0.677, n 26 / absent 0.029, n 584)
- presence:direction: threshold 0.170 [rule: fit; pooled midpoint 0.327 (comparison)] (present 0.649, n 20 / absent 0.006, n 675)
- presence:amount: threshold 0.242 [rule: fit; pooled midpoint 0.239 (comparison)] (present 0.458, n 5 / absent 0.019, n 605)
- presence:quantity: threshold 0.360 [rule: fit; pooled midpoint 0.376 (comparison)] (present 0.750, n 7 / absent 0.002, n 603)
- presence:axis: threshold 0.311 [rule: fit; pooled midpoint 0.359 (comparison)] (present 0.718, n 8 / absent 0.000, n 602)
- presence:layout: threshold 0.271 [rule: fit; pooled midpoint 0.427 (comparison)] (present 0.853, n 14 / absent 0.000, n 596)
- presence:source: threshold 0.059 [rule: fit; pooled midpoint 0.302 (comparison)] (present 0.573, n 81 / absent 0.031, n 529)
- presence:target: threshold 0.154 [rule: fit; pooled midpoint 0.365 (comparison)] (present 0.692, n 57 / absent 0.038, n 553)
- presence:style: threshold 0.292 [rule: fit; pooled midpoint 0.379 (comparison)] (present 0.740, n 20 / absent 0.017, n 590)
- presence:arrow: threshold 0.276 [rule: fit; pooled midpoint 0.331 (comparison)] (present 0.651, n 30 / absent 0.011, n 665)
- presence:edge: threshold 0.513 [rule: fit; pooled midpoint 0.416 (comparison)] (present 0.822, n 13 / absent 0.010, n 597)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 23)
- presence:pairing: threshold 0.367 [rule: fit; pooled midpoint 0.468 (comparison)] (present 0.923, n 31 / absent 0.012, n 579)
- presence:superlative: threshold 0.606 [rule: fit; pooled midpoint 0.464 (comparison)] (present 0.926, n 64 / absent 0.001, n 546)
- presence:comparison: threshold 0.648 [rule: fit; pooled midpoint 0.397 (comparison)] (present 0.786, n 13 / absent 0.007, n 597)
- presence:members: threshold 0.334 [rule: fit; pooled midpoint 0.493 (comparison)] (present 0.853, n 58 / absent 0.132, n 552)
- presence:targets: threshold 0.139 [rule: fit; pooled midpoint 0.132 (comparison)] (present 0.230, n 25 / absent 0.035, n 585)
- attr_presence:object: threshold 0.396 [rule: fit; pooled midpoint 0.459 (comparison)] (present 0.790, n 29 / absent 0.128, n 322)
- det_presence:object: threshold 0.316 [rule: fit; pooled midpoint 0.423 (comparison)] (present 0.792, n 38 / absent 0.053, n 363)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.059, quantity 0.059, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 172 of 172)
| axis | accuracy |
|---|---|
| FULL | 0.698 |
| FULL [depth given] | 0.698 |
| FULL [depth and negation given] | 0.698 |
| FULL [presence not decided] | 0.657 |
| FULL [pooled midpoint (comparison)] | 0.517 |
| presence object: present read present | 0.971 |
| presence object: share of 'present' readings that abstain | 0.010 |
| presence object: share of true 'present' readings that abstain | 0.010 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.983 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.992 |
| presence landmark2: absent read absent | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.929 |
| presence target: absent read absent | 0.923 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.965 |
| presence targets: absent read absent | 0.973 |
| structure (depth, negation) | 0.907 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.936 |
| set targets: exact | 0.965 |
| predicate (surface lemma) | 0.878 |
| event type (synonym table) | 0.878 |
| role object | 0.884 |
| head object | 0.895 |
| lexical order head object | 0.762 |
| lexical bag head object | 0.785 |
| occupancy: unknown filler | 0.906 |
| role shape | 0.988 |
| head shape | 0.988 |
| lexical order head shape | 0.907 |
| lexical bag head shape | 0.988 |
| occupancy: not given | 0.990 |
| role color | 0.953 |
| head color | 0.953 |
| lexical order head color | 0.762 |
| lexical bag head color | 0.959 |
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
| role region | 0.983 |
| head region | 0.983 |
| lexical order head region | 0.942 |
| lexical bag head region | 0.965 |
| occupancy: known filler | 0.867 |
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
| role source | 0.913 |
| head source | 0.913 |
| lexical order head source | 0.901 |
| lexical bag head source | 0.913 |
| role target | 0.907 |
| head target | 0.907 |
| lexical order head target | 0.913 |
| lexical bag head target | 0.948 |
| role style | 1.000 |
| head style | 1.000 |
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
| role members | 0.936 |
| head members | 0.936 |
| lexical order head members | 0.913 |
| lexical bag head members | 0.913 |
| role targets | 0.965 |
| head targets | 0.965 |
| lexical order head targets | 0.965 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.733 |
| heads FULL (lexical order baseline) | 0.192 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.459 |
| role object [presence not decided] | 0.872 |
| role shape [presence not decided] | 0.994 |
| role color [presence not decided] | 0.942 |
| role size [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 0.913 |
| role relation [presence not decided] | 0.988 |
| role landmark [presence not decided] | 0.983 |
| role landmark2 [presence not decided] | 0.994 |
| role region [presence not decided] | 0.988 |
| role direction [presence not decided] | 0.977 |
| role amount [presence not decided] | 1.000 |
| role quantity [presence not decided] | 1.000 |
| role axis [presence not decided] | 1.000 |
| role layout [presence not decided] | 1.000 |
| role source [presence not decided] | 0.919 |
| role target [presence not decided] | 0.913 |
| role style [presence not decided] | 0.983 |
| role arrow [presence not decided] | 1.000 |
| role edge [presence not decided] | 0.988 |
| role pairing [presence not decided] | 1.000 |
| role superlative [presence not decided] | 1.000 |
| role comparison [presence not decided] | 1.000 |
| role members [presence not decided] | 0.907 |
| role targets [presence not decided] | 0.936 |
| heads FULL (model) [presence not decided] | 0.692 |
| role object [pooled midpoint (comparison)] | 0.762 |
| role shape [pooled midpoint (comparison)] | 0.983 |
| role color [pooled midpoint (comparison)] | 0.948 |
| role size [pooled midpoint (comparison)] | 1.000 |
| role name [pooled midpoint (comparison)] | 1.000 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.983 |
| role landmark [pooled midpoint (comparison)] | 0.953 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.983 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role axis [pooled midpoint (comparison)] | 1.000 |
| role layout [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.913 |
| role target [pooled midpoint (comparison)] | 0.924 |
| role style [pooled midpoint (comparison)] | 1.000 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 1.000 |
| role superlative [pooled midpoint (comparison)] | 1.000 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.901 |
| role targets [pooled midpoint (comparison)] | 0.948 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.535 |
| presence object: present read present [pooled midpoint (comparison)] | 0.738 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence color: absent read absent [pooled midpoint (comparison)] | 0.983 |
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
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.979 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.953 |
| presence landmark: present read present | 0.900 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence region: absent read absent | 0.986 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.333 |
| presence comparison: share of true 'present' readings that abstain | 0.333 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.767 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence comparison: present read present [pooled midpoint (comparison)] | 1.000 |
| presence shape: present read present | 0.933 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.027 |
| presence color: share of true 'present' readings that abstain | 0.029 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.933 |
| presence color: present read present [pooled midpoint (comparison)] | 0.971 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.909 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.909 |
| presence object: absent read absent | 0.925 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.943 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |
| presence source: present read present | 0.867 |
| presence source: share of 'present' readings that abstain | 0.348 |
| presence source: share of true 'present' readings that abstain | 0.154 |
| presence target: share of 'present' readings that abstain | 0.095 |
| presence target: share of FALSE 'present' readings that abstain | 0.182 |
| presence members: share of 'present' readings that abstain | 0.389 |
| presence members: share of FALSE 'present' readings that abstain | 0.600 |
| presence targets: present read present | 0.833 |
| presence targets: share of 'present' readings that abstain | 0.778 |
| presence targets: share of true 'present' readings that abstain | 0.800 |
| set targets: first gold member in the decoded set | 0.833 |
| presence source: present read present [pooled midpoint (comparison)] | 0.133 |
| presence targets: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.667 |
| presence target: present read present | 0.714 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present [pooled midpoint (comparison)] | 0.357 |
| presence landmark2: present read present | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 0.308 |
| set members: first gold member in the decoded set | 0.800 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.615 |
| presence source: share of FALSE 'present' readings that abstain | 0.600 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence targets: share of FALSE 'present' readings that abstain | 0.750 |
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
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.204; status {'ok': 133, 'abstain': 23, 'unknown-event': 12, 'no-sense': 4}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.878 | 0.487 / 0.076 | 0.92 | 0.041 | 0.000 / 0.081 |
| role object | 0.860 | 0.351 / 0.087 | 0.94 | 0.088 | 0.009 / 0.053 |
| roles (pooled) | 0.854 | 0.307 / 0.018 | 0.87 | 0.040 | 0.023 / 0.106 |
| role region | 0.900 | 0.383 / 0.264 | 0.90 | 0.000 | 0.000 / 0.100 |
| role landmark | 0.871 | 0.267 / 0.000 | 0.87 | 0.000 | 0.000 / 0.129 |
| role comparison | 1.000 | 0.096 / 0.045 | 0.67 | 0.000 | 0.333 / 0.000 |
| role shape | 0.875 | 0.341 / 0.274 | 0.94 | 0.062 | 0.000 / 0.062 |
| role color | 0.854 | 0.369 / 0.000 | 0.85 | 0.024 | 0.024 / 0.122 |
| role size | 1.000 | 0.398 / 0.339 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.307 / 0.270 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.870 | 0.350 / 0.010 | 0.87 | 0.000 | 0.000 / 0.130 |
| role source | 0.706 | 0.098 / 0.000 | 0.65 | 0.000 | 0.059 / 0.294 |
| role targets | 0.667 | 0.019 / 0.003 | 0.17 | 0.000 | 0.500 / 0.333 |
| role target | 0.667 | 0.168 / 0.000 | 0.67 | 0.000 | 0.000 / 0.333 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role layout | 1.000 | 0.428 / 0.285 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.600 | 0.067 / 0.018 | 0.67 | 0.133 | 0.067 / 0.267 |
| role pairing | 1.000 | 0.310 / 0.225 | 1.00 | 0.000 | 0.000 / 0.000 |
| role style | 1.000 | 0.365 / 0.298 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.355 / 0.340 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.330 / 0.330 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 1.000 | 0.365 / 0.190 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.426 / 0.386 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 1.000 | 0.171 / 0.095 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3902)
| axis | accuracy |
|---|---|
| FULL | 0.750 |
| FULL [depth given] | 0.750 |
| FULL [depth and negation given] | 0.750 |
| presence object: present read present | 0.984 |
| presence object: share of 'present' readings that abstain | 0.049 |
| presence object: share of true 'present' readings that abstain | 0.044 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 0.992 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: present read present | 0.939 |
| presence relation: share of 'present' readings that abstain | 0.022 |
| presence relation: share of true 'present' readings that abstain | 0.022 |
| presence landmark: present read present | 0.918 |
| presence landmark: share of 'present' readings that abstain | 0.053 |
| presence landmark: share of true 'present' readings that abstain | 0.054 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.989 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.942 |
| presence target: absent read absent | 0.951 |
| presence style: absent read absent | 0.993 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.989 |
| presence targets: absent read absent | 0.986 |
| structure (depth, negation) | 0.960 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.980 |
| set targets: exact | 0.980 |
| predicate (surface lemma) | 0.907 |
| event type (synonym table) | 0.907 |
| role object | 0.937 |
| head object | 0.947 |
| lexical order head object | 0.780 |
| lexical bag head object | 0.893 |
| occupancy: known filler | 0.917 |
| role shape | 0.990 |
| head shape | 0.990 |
| lexical order head shape | 0.903 |
| lexical bag head shape | 0.993 |
| occupancy: not given | 0.993 |
| role color | 0.983 |
| head color | 0.983 |
| lexical order head color | 0.823 |
| lexical bag head color | 0.990 |
| role size | 0.983 |
| head size | 0.983 |
| lexical order head size | 0.830 |
| lexical bag head size | 0.973 |
| role name | 0.997 |
| head name | 0.997 |
| lexical order head name | 0.947 |
| lexical bag head name | 1.000 |
| role text | 0.997 |
| head text | 0.997 |
| lexical order head text | 0.960 |
| lexical bag head text | 0.997 |
| role relation | 0.987 |
| head relation | 0.987 |
| lexical order head relation | 0.837 |
| lexical bag head relation | 0.977 |
| role landmark | 0.977 |
| head landmark | 0.977 |
| lexical order head landmark | 0.793 |
| lexical bag head landmark | 0.973 |
| role landmark2 | 0.987 |
| head landmark2 | 0.987 |
| lexical order head landmark2 | 0.980 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.987 |
| head region | 0.987 |
| lexical order head region | 0.943 |
| lexical bag head region | 0.973 |
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
| lexical order head quantity | 0.990 |
| lexical bag head quantity | 1.000 |
| role axis | 0.993 |
| head axis | 0.993 |
| lexical order head axis | 0.993 |
| lexical bag head axis | 0.993 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 0.983 |
| lexical bag head layout | 1.000 |
| role source | 0.933 |
| head source | 0.933 |
| lexical order head source | 0.907 |
| lexical bag head source | 0.977 |
| role target | 0.943 |
| head target | 0.943 |
| lexical order head target | 0.923 |
| lexical bag head target | 0.990 |
| role style | 0.993 |
| head style | 0.993 |
| lexical order head style | 0.990 |
| lexical bag head style | 0.987 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 0.993 |
| lexical bag head arrow | 0.997 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.983 |
| lexical bag head edge | 0.993 |
| role pairing | 0.997 |
| head pairing | 0.997 |
| lexical order head pairing | 0.940 |
| lexical bag head pairing | 0.993 |
| role superlative | 1.000 |
| head superlative | 1.000 |
| lexical order head superlative | 0.900 |
| lexical bag head superlative | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.997 |
| lexical bag head comparison | 1.000 |
| role members | 0.980 |
| head members | 0.980 |
| lexical order head members | 0.927 |
| lexical bag head members | 0.923 |
| role targets | 0.980 |
| head targets | 0.980 |
| lexical order head targets | 0.983 |
| lexical bag head targets | 0.973 |
| heads FULL (model) | 0.783 |
| heads FULL (lexical order baseline) | 0.173 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.710 |
| presence shape: present read present | 0.963 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 0.960 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.996 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.021 |
| presence color: share of true 'present' readings that abstain | 0.021 |
| presence name: present read present | 0.938 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 0.962 |
| presence source: present read present | 0.821 |
| presence source: share of 'present' readings that abstain | 0.289 |
| presence source: share of true 'present' readings that abstain | 0.217 |
| presence target: present read present | 0.826 |
| presence target: share of 'present' readings that abstain | 0.250 |
| presence target: share of true 'present' readings that abstain | 0.105 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.400 |
| presence pairing: present read present | 0.944 |
| presence pairing: share of 'present' readings that abstain | 0.059 |
| presence pairing: share of true 'present' readings that abstain | 0.059 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.440 |
| presence members: share of true 'present' readings that abstain | 0.409 |
| set members: first gold member in the decoded set | 0.955 |
| occupancy: unknown filler | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.462 |
| presence targets: present read present | 1.000 |
| presence targets: share of 'present' readings that abstain | 0.667 |
| presence targets: share of true 'present' readings that abstain | 0.800 |
| set targets: first gold member in the decoded set | 1.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.333 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence members: share of FALSE 'present' readings that abstain | 0.667 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 1.000 |
| presence comparison: share of true 'present' readings that abstain | 1.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.250 |
| presence targets: share of FALSE 'present' readings that abstain | 0.500 |
| determiner identity (outside FULL when the legend excludes it) | 0.500 |
| presence direction: present read present | 1.000 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.000 |
| presence amount: share of true 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.161; status {'abstain': 50, 'ok': 238, 'no-sense': 4, 'unknown-event': 8}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.907 | 0.527 / 0.314 | 0.95 | 0.043 | 0.000 / 0.050 |
| role object | 0.922 | 0.356 / 0.100 | 0.93 | 0.047 | 0.036 / 0.031 |
| roles (pooled) | 0.906 | 0.314 / 0.044 | 0.89 | 0.028 | 0.048 / 0.066 |
| role relation | 0.918 | 0.326 / 0.156 | 0.92 | 0.020 | 0.020 / 0.061 |
| role landmark | 0.903 | 0.268 / 0.047 | 0.87 | 0.016 | 0.048 / 0.081 |
| role shape | 0.897 | 0.351 / 0.308 | 0.97 | 0.069 | 0.000 / 0.034 |
| role size | 0.941 | 0.392 / 0.311 | 0.96 | 0.020 | 0.000 / 0.039 |
| role color | 0.906 | 0.383 / 0.243 | 0.94 | 0.057 | 0.019 / 0.038 |
| role name | 0.938 | 0.218 / 0.083 | 0.94 | 0.000 | 0.000 / 0.062 |
| role source | 0.821 | 0.140 / 0.000 | 0.64 | 0.000 | 0.179 / 0.179 |
| role target | 0.826 | 0.184 / 0.000 | 0.74 | 0.000 | 0.087 / 0.174 |
| role arrow | 1.000 | 0.376 / 0.353 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.285 / 0.222 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 0.941 | 0.421 / 0.283 | 1.00 | 0.059 | 0.000 / 0.000 |
| role pairing | 0.944 | 0.382 / 0.131 | 0.89 | 0.000 | 0.056 / 0.056 |
| role members | 0.864 | 0.084 / 0.032 | 0.59 | 0.000 | 0.273 / 0.136 |
| role text | 0.917 | 0.261 / 0.241 | 0.92 | 0.000 | 0.000 / 0.083 |
| role style | 1.000 | 0.348 / 0.281 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.493 / 0.489 | 1.00 | 0.000 | 0.000 / 0.000 |
| role targets | 0.600 | 0.050 / 0.026 | 0.20 | 0.000 | 0.400 / 0.400 |
| role superlative | 1.000 | 0.349 / 0.214 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 0.333 | 0.007 / 0.000 | 0.00 | 0.000 | 0.333 / 0.667 |
| role comparison | 1.000 | 0.023 / 0.023 | 0.00 | 0.000 | 1.000 / 0.000 |
| role layout | 1.000 | 0.345 / 0.299 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 1.000 | 0.289 / 0.242 | 1.00 | 0.000 | 0.000 / 0.000 |
| role amount | 1.000 | 0.221 / 0.142 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 SUPER=0.96 from=0.90 once=0.85 AXIS=0.85 VERB=0.82 STYLE=0.79 LAYOUT=0.76 rules=0.75 NUM=0.71 COLOR=0.63 pixels=0.60 the=0.58 them=0.52 ARROW=0.51 TEXT=0.47 reached=0.44 what's=0.40 that=0.39 then=0.39 whole=0.36 as=0.35 NAME=0.34 PAIR=0.29 with=0.28 too=0.28 it=0.27 this=0.24 last=0.23 can=0.23 have=0.22 we=0.22 here=0.21 for=0.19 are=0.18 remove=0.17 any=0.17 DIR=0.16 do=0.14 thing=0.14 each=0.14 arrow=0.13 exist=0.13 in=0.12 NOTCOLOR=0.12 those=0.12 not=0.11 diagram=0.11 front=0.10 no=0.10 both=0.10 does=0.09 i=0.09 evenly=0.09 line=0.08 an=0.08 what=0.08 QUANT=0.07 shapes=0.07 four=0.07 every=0.07 directly=0.07 uh=0.07 by=0.06 be=0.06 map=0.06 check=0.05 just=0.05 new=0.05 two=0.05 should=0.05 show=0.04 box=0.04 me=0.04 now=0.04 you=0.03 place=0.03 there=0.03 give=0.03 tell=0.03 back=0.03 link=0.03 axis=0.03 lines=0.03 RECENT=0.03 who=0.03 if=0.03 at=0.03 three=0.03 goes=0.02 on=0.02 arrows=0.02 has=0.02 put=0.01 shape=0.01 one=0.01 SIZE=0.01 to=0.01 called=0.01 named=0.00 of=0.00 SHAPE=0.00 unknown=0.00 and=0.00 labeled=0.00 a=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.698
- heldout_formulations: presence object: share of 'present' readings that abstain 0.010
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.010
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: predicate (surface lemma) 0.878
- heldout_formulations: event type (synonym table) 0.878
- heldout_formulations: role object 0.884
- heldout_formulations: head object 0.895
- heldout_formulations: occupancy: known filler 0.867
- heldout_formulations: heads FULL (model) 0.733
- heldout_formulations: heads FULL (lexical order baseline) 0.192
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.459
- heldout_formulations: FULL [depth given] 0.698
- heldout_formulations: FULL [depth and negation given] 0.698
- heldout_formulations: FULL [presence not decided] 0.657
- heldout_formulations: role object [presence not decided] 0.872
- heldout_formulations: heads FULL (model) [presence not decided] 0.692
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.517
- heldout_formulations: role object [pooled midpoint (comparison)] 0.762
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.535
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.738
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.333
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.333
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.767
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.027
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.029
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence source: present read present 0.867
- heldout_formulations: presence source: share of 'present' readings that abstain 0.348
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.154
- heldout_formulations: presence target: share of 'present' readings that abstain 0.095
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.182
- heldout_formulations: presence members: share of 'present' readings that abstain 0.389
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.600
- heldout_formulations: presence targets: present read present 0.833
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.778
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.800
- heldout_formulations: set targets: first gold member in the decoded set 0.833
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.133
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.667
- heldout_formulations: presence target: present read present 0.714
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.357
- heldout_formulations: presence landmark2: present read present 0.000
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.308
- heldout_formulations: set members: first gold member in the decoded set 0.800
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.615
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.600
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.750
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.750
- train (sample): presence object: share of 'present' readings that abstain 0.049
- train (sample): presence object: share of true 'present' readings that abstain 0.044
- train (sample): presence relation: share of 'present' readings that abstain 0.022
- train (sample): presence relation: share of true 'present' readings that abstain 0.022
- train (sample): presence landmark: share of 'present' readings that abstain 0.053
- train (sample): presence landmark: share of true 'present' readings that abstain 0.054
- train (sample): heads FULL (model) 0.783
- train (sample): heads FULL (lexical order baseline) 0.173
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.710
- train (sample): FULL [depth given] 0.750
- train (sample): FULL [depth and negation given] 0.750
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.021
- train (sample): presence color: share of true 'present' readings that abstain 0.021
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence source: present read present 0.821
- train (sample): presence source: share of 'present' readings that abstain 0.289
- train (sample): presence source: share of true 'present' readings that abstain 0.217
- train (sample): presence target: present read present 0.826
- train (sample): presence target: share of 'present' readings that abstain 0.250
- train (sample): presence target: share of true 'present' readings that abstain 0.105
- train (sample): presence arrow: share of 'present' readings that abstain 0.000
- train (sample): presence arrow: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.400
- train (sample): presence pairing: share of 'present' readings that abstain 0.059
- train (sample): presence pairing: share of true 'present' readings that abstain 0.059
- train (sample): presence members: share of 'present' readings that abstain 0.440
- train (sample): presence members: share of true 'present' readings that abstain 0.409
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of 'present' readings that abstain 0.000
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.462
- train (sample): presence targets: share of 'present' readings that abstain 0.667
- train (sample): presence targets: share of true 'present' readings that abstain 0.800
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: present read present 0.333
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.667
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.250
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.500
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.500
- train (sample): presence direction: share of 'present' readings that abstain 0.000
- train (sample): presence direction: share of true 'present' readings that abstain 0.000
- train (sample): presence amount: share of 'present' readings that abstain 0.000
- train (sample): presence amount: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `the NAME COLOR` FULL 0.000 (n 3)
- heldout_formulations: `connect NAME to NAME and NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME and NAME to NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME PAIR NAME to NAME` FULL 0.000 (n 2)
- heldout_formulations: `make NAME a SIZE COLOR SHAPE` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role direction | role amount | role quantity | role axis | role layout | role source | role target | role style | role arrow | role edge | role pairing | role superlative | role comparison | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.733 | 0.698 | 0.884 | 0.988 | 0.953 | 1.000 | 1.000 | 1.000 | 0.983 | 0.971 | 0.994 | 0.983 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.913 | 0.907 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.936 | 0.965 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.535 | 0.517 | 0.762 | 0.983 | 0.948 | 1.000 | 1.000 | 1.000 | 0.983 | 0.953 | 1.000 | 0.983 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.913 | 0.924 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.901 | 0.948 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.692 | 0.657 | 0.872 | 0.994 | 0.942 | 1.000 | 1.000 | 0.913 | 0.988 | 0.983 | 0.994 | 0.988 | 0.977 | 1.000 | 1.000 | 1.000 | 1.000 | 0.919 | 0.913 | 0.983 | 1.000 | 0.988 | 1.000 | 1.000 | 1.000 | 0.907 | 0.936 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.971 | 0.925 | 0.948 | 0.010 (0.000 / 0.010) |
| heldout_formulations | object | comparison: pooled midpoint | 0.738 | 0.943 | 0.841 |  |
| heldout_formulations | shape | product: fitted | 0.933 | 1.000 | 0.967 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.933 | 0.993 | 0.963 |  |
| heldout_formulations | color | product: fitted | 1.000 | 0.983 | 0.992 | 0.027 (0.000 / 0.029) |
| heldout_formulations | color | comparison: pooled midpoint | 0.971 | 0.983 | 0.977 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.909 | 1.000 | 0.955 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.909 | 1.000 | 0.955 |  |
| heldout_formulations | landmark | product: fitted | 0.900 | 0.992 | 0.946 | 0.000 (0.000 / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.767 | 1.000 | 0.883 |  |
| heldout_formulations | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 1.000 | 0.986 | 0.993 | 0.000 (0.000 / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 1.000 | 0.986 | 0.993 |  |
| heldout_formulations | direction | product: fitted | — | 1.000 | — |  |
| heldout_formulations | direction | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | amount | product: fitted | — | 1.000 | — |  |
| heldout_formulations | amount | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | source | product: fitted | 0.867 | 0.929 | 0.898 | 0.348 (0.600 / 0.154) |
| heldout_formulations | source | comparison: pooled midpoint | 0.133 | 1.000 | 0.567 |  |
| heldout_formulations | target | product: fitted | 0.714 | 0.923 | 0.818 | 0.095 (0.182 / 0.000) |
| heldout_formulations | target | comparison: pooled midpoint | 0.357 | 0.979 | 0.668 |  |
| heldout_formulations | style | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | arrow | product: fitted | — | 1.000 | — |  |
| heldout_formulations | arrow | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.333 (— / 0.333) |
| heldout_formulations | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.965 | 0.983 | 0.389 (0.600 / 0.308) |
| heldout_formulations | members | comparison: pooled midpoint | 0.615 | 0.986 | 0.801 |  |
| heldout_formulations | targets | product: fitted | 0.833 | 0.973 | 0.903 | 0.778 (0.750 / 0.800) |
| heldout_formulations | targets | comparison: pooled midpoint | 1.000 | 0.953 | 0.977 |  |
| train (sample) | object | product: fitted | 0.984 | 0.962 | 0.973 | 0.049 (0.250 / 0.044) |
| train (sample) | shape | product: fitted | 0.963 | 1.000 | 0.981 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.021 (— / 0.021) |
| train (sample) | size | product: fitted | 0.960 | 0.992 | 0.976 | 0.000 (0.000 / 0.000) |
| train (sample) | name | product: fitted | 0.938 | 1.000 | 0.969 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.939 | 1.000 | 0.969 | 0.022 (— / 0.022) |
| train (sample) | landmark | product: fitted | 0.918 | 0.996 | 0.957 | 0.053 (0.000 / 0.054) |
| train (sample) | landmark2 | product: fitted | 0.333 | 1.000 | 0.667 | 1.000 (— / 1.000) |
| train (sample) | region | product: fitted | 1.000 | 0.989 | 0.994 | 0.000 (0.000 / 0.000) |
| train (sample) | direction | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | axis | product: fitted | — | 1.000 | — |  |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.821 | 0.942 | 0.882 | 0.289 (0.400 / 0.217) |
| train (sample) | target | product: fitted | 0.826 | 0.951 | 0.889 | 0.250 (0.462 / 0.105) |
| train (sample) | style | product: fitted | 1.000 | 0.993 | 0.996 | 0.000 (0.000 / 0.000) |
| train (sample) | arrow | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 0.944 | 1.000 | 0.972 | 0.059 (— / 0.059) |
| train (sample) | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| train (sample) | members | product: fitted | 1.000 | 0.989 | 0.994 | 0.440 (0.667 / 0.409) |
| train (sample) | targets | product: fitted | 1.000 | 0.986 | 0.993 | 0.667 (0.500 / 0.800) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
