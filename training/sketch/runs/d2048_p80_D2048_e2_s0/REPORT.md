# REPORT — world `real`, legend sha256:cbf20196eeeb… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4284 annotated sentences from 2 files; provenance: {'llm': 4284}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/d2048_p80_D2048_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 210 sentences
- heldout_formulations: 172 sentences
- train: 3902 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
24230 tokens in the examples; 1029 with no kind in the lexicon (share 0.042), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=2048, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 40e5d86. Memory curve: runs/d2048_p80_D2048_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.083 [rule: fit; pooled midpoint 0.265 (comparison)] (present 0.529, n 158 / absent 0.001, n 654450)
- set_member:targets: threshold 0.062 [rule: fit; pooled midpoint 0.080 (comparison)] (present 0.160, n 49 / absent -0.000, n 200751)
- presence:object: threshold 0.425 [rule: fit; pooled midpoint 0.796 (comparison)] (present 1.469, n 356 / absent 0.123, n 254)
- presence:shape: threshold 0.178 [rule: fit; pooled midpoint 0.568 (comparison)] (present 1.124, n 63 / absent 0.013, n 547)
- presence:color: threshold 0.387 [rule: fit; pooled midpoint 0.673 (comparison)] (present 1.324, n 106 / absent 0.022, n 504)
- presence:size: threshold 0.458 [rule: fit; pooled midpoint 0.539 (comparison)] (present 1.062, n 86 / absent 0.016, n 524)
- presence:name: threshold 0.157 [rule: fit; pooled midpoint 0.403 (comparison)] (present 0.802, n 19 / absent 0.005, n 591)
- presence:text: threshold 0.196 [rule: fit; pooled midpoint 0.305 (comparison)] (present 0.585, n 28 / absent 0.025, n 582)
- presence:relation: threshold 0.381 [rule: fit; pooled midpoint 0.459 (comparison)] (present 0.868, n 79 / absent 0.050, n 531)
- presence:landmark: threshold 0.154 [rule: fit; pooled midpoint 0.334 (comparison)] (present 0.625, n 116 / absent 0.044, n 494)
- presence:landmark2: threshold 0.119 [rule: fit; pooled midpoint 0.092 (comparison)] (present 0.148, n 5 / absent 0.035, n 605)
- presence:region: threshold 0.298 [rule: fit; pooled midpoint 0.331 (comparison)] (present 0.635, n 26 / absent 0.028, n 584)
- presence:direction: threshold 0.166 [rule: fit; pooled midpoint 0.338 (comparison)] (present 0.670, n 20 / absent 0.007, n 637)
- presence:amount: threshold 0.235 [rule: fit; pooled midpoint 0.214 (comparison)] (present 0.420, n 5 / absent 0.009, n 605)
- presence:quantity: threshold 0.298 [rule: fit; pooled midpoint 0.369 (comparison)] (present 0.736, n 7 / absent 0.002, n 603)
- presence:axis: threshold 0.327 [rule: fit; pooled midpoint 0.353 (comparison)] (present 0.705, n 8 / absent -0.000, n 602)
- presence:layout: threshold 0.284 [rule: fit; pooled midpoint 0.418 (comparison)] (present 0.836, n 14 / absent 0.000, n 596)
- presence:source: threshold 0.096 [rule: fit; pooled midpoint 0.283 (comparison)] (present 0.547, n 81 / absent 0.018, n 529)
- presence:target: threshold 0.111 [rule: fit; pooled midpoint 0.342 (comparison)] (present 0.654, n 57 / absent 0.030, n 553)
- presence:style: threshold 0.168 [rule: fit; pooled midpoint 0.342 (comparison)] (present 0.676, n 20 / absent 0.009, n 590)
- presence:arrow: threshold 0.219 [rule: fit; pooled midpoint 0.317 (comparison)] (present 0.626, n 30 / absent 0.007, n 627)
- presence:edge: threshold 0.473 [rule: fit; pooled midpoint 0.408 (comparison)] (present 0.808, n 13 / absent 0.009, n 597)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 23)
- presence:pairing: threshold 0.400 [rule: fit; pooled midpoint 0.464 (comparison)] (present 0.920, n 31 / absent 0.009, n 579)
- presence:superlative: threshold 0.321 [rule: fit; pooled midpoint 0.485 (comparison)] (present 0.969, n 64 / absent 0.000, n 546)
- presence:comparison: threshold 0.574 [rule: fit; pooled midpoint 0.382 (comparison)] (present 0.761, n 13 / absent 0.002, n 597)
- presence:members: threshold 0.243 [rule: fit; pooled midpoint 0.446 (comparison)] (present 0.797, n 58 / absent 0.096, n 552)
- presence:targets: threshold 0.141 [rule: fit; pooled midpoint 0.114 (comparison)] (present 0.205, n 25 / absent 0.023, n 585)
- attr_presence:object: threshold 0.362 [rule: fit; pooled midpoint 0.413 (comparison)] (present 0.748, n 29 / absent 0.079, n 323)
- det_presence:object: threshold 0.495 [rule: fit; pooled midpoint 0.371 (comparison)] (present 0.703, n 5 / absent 0.039, n 347)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.059, quantity 0.059, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 172 of 172)
| axis | accuracy |
|---|---|
| FULL | 0.674 |
| FULL [depth given] | 0.674 |
| FULL [depth and negation given] | 0.674 |
| FULL [presence not decided] | 0.634 |
| FULL [pooled midpoint (comparison)] | 0.436 |
| presence object: present read present | 0.961 |
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
| presence source: absent read absent | 0.943 |
| presence target: absent read absent | 0.923 |
| presence style: absent read absent | 0.980 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.965 |
| presence targets: absent read absent | 0.980 |
| structure (depth, negation) | 0.907 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.942 |
| set targets: exact | 0.977 |
| predicate (surface lemma) | 0.872 |
| event type (synonym table) | 0.872 |
| role object | 0.872 |
| head object | 0.884 |
| lexical order head object | 0.762 |
| lexical bag head object | 0.785 |
| occupancy: unknown filler | 0.929 |
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
| role relation | 0.977 |
| head relation | 0.977 |
| lexical order head relation | 0.866 |
| lexical bag head relation | 0.953 |
| role landmark | 0.983 |
| head landmark | 0.983 |
| lexical order head landmark | 0.820 |
| lexical bag head landmark | 0.866 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.994 |
| lexical bag head landmark2 | 0.988 |
| role region | 0.983 |
| head region | 0.983 |
| lexical order head region | 0.942 |
| lexical bag head region | 0.965 |
| occupancy: known filler | 0.871 |
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
| role source | 0.930 |
| head source | 0.930 |
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
| role members | 0.942 |
| head members | 0.942 |
| lexical order head members | 0.913 |
| lexical bag head members | 0.913 |
| role targets | 0.977 |
| head targets | 0.977 |
| lexical order head targets | 0.965 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.715 |
| heads FULL (lexical order baseline) | 0.192 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.459 |
| role object [presence not decided] | 0.872 |
| role shape [presence not decided] | 0.994 |
| role color [presence not decided] | 0.942 |
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
| role target [presence not decided] | 0.913 |
| role style [presence not decided] | 0.983 |
| role arrow [presence not decided] | 1.000 |
| role edge [presence not decided] | 0.988 |
| role pairing [presence not decided] | 1.000 |
| role superlative [presence not decided] | 1.000 |
| role comparison [presence not decided] | 1.000 |
| role members [presence not decided] | 0.884 |
| role targets [presence not decided] | 0.948 |
| heads FULL (model) [presence not decided] | 0.669 |
| role object [pooled midpoint (comparison)] | 0.703 |
| role shape [pooled midpoint (comparison)] | 0.983 |
| role color [pooled midpoint (comparison)] | 0.930 |
| role size [pooled midpoint (comparison)] | 1.000 |
| role name [pooled midpoint (comparison)] | 0.994 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.977 |
| role landmark [pooled midpoint (comparison)] | 0.965 |
| role landmark2 [pooled midpoint (comparison)] | 0.994 |
| role region [pooled midpoint (comparison)] | 0.983 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role axis [pooled midpoint (comparison)] | 1.000 |
| role layout [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.913 |
| role target [pooled midpoint (comparison)] | 0.930 |
| role style [pooled midpoint (comparison)] | 1.000 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 1.000 |
| role superlative [pooled midpoint (comparison)] | 1.000 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.901 |
| role targets [pooled midpoint (comparison)] | 0.936 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.459 |
| presence object: present read present [pooled midpoint (comparison)] | 0.637 |
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
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.979 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.933 |
| presence landmark: present read present | 0.967 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence region: absent read absent | 0.986 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.833 |
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
| presence shape: present read present [pooled midpoint (comparison)] | 0.867 |
| presence color: present read present [pooled midpoint (comparison)] | 0.829 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.864 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.864 |
| presence object: absent read absent | 0.906 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.962 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |
| presence source: present read present | 0.867 |
| presence source: share of 'present' readings that abstain | 0.619 |
| presence source: share of true 'present' readings that abstain | 0.615 |
| presence target: share of 'present' readings that abstain | 0.182 |
| presence target: share of FALSE 'present' readings that abstain | 0.273 |
| presence members: share of 'present' readings that abstain | 0.333 |
| presence members: share of FALSE 'present' readings that abstain | 0.400 |
| presence targets: present read present | 1.000 |
| presence targets: share of 'present' readings that abstain | 0.889 |
| presence targets: share of true 'present' readings that abstain | 1.000 |
| set targets: first gold member in the decoded set | 0.833 |
| presence source: present read present [pooled midpoint (comparison)] | 0.133 |
| presence targets: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.333 |
| presence target: present read present | 0.786 |
| presence target: share of true 'present' readings that abstain | 0.091 |
| presence style: share of 'present' readings that abstain | 0.333 |
| presence style: share of FALSE 'present' readings that abstain | 0.667 |
| presence target: present read present [pooled midpoint (comparison)] | 0.357 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 0.308 |
| set members: first gold member in the decoded set | 0.867 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.615 |
| presence source: share of FALSE 'present' readings that abstain | 0.625 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence targets: share of FALSE 'present' readings that abstain | 0.667 |
| presence pairing: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: present read present | 1.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
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
| presence name: present read present [pooled midpoint (comparison)] | 0.500 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.200; status {'ok': 129, 'abstain': 27, 'no-sense': 3, 'unknown-event': 13}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.872 | 0.495 / 0.082 | 0.93 | 0.058 | 0.000 / 0.070 |
| role object | 0.851 | 0.348 / 0.093 | 0.93 | 0.088 | 0.009 / 0.061 |
| roles (pooled) | 0.868 | 0.313 / 0.026 | 0.86 | 0.043 | 0.054 / 0.089 |
| role region | 0.900 | 0.373 / 0.210 | 0.90 | 0.000 | 0.000 / 0.100 |
| role landmark | 0.935 | 0.283 / 0.093 | 0.94 | 0.000 | 0.000 / 0.065 |
| role comparison | 1.000 | 0.179 / 0.125 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 0.875 | 0.339 / 0.254 | 0.94 | 0.062 | 0.000 / 0.062 |
| role color | 0.854 | 0.377 / 0.050 | 0.88 | 0.049 | 0.024 / 0.098 |
| role size | 1.000 | 0.385 / 0.328 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.290 / 0.275 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.826 | 0.350 / 0.000 | 0.83 | 0.000 | 0.000 / 0.174 |
| role source | 0.765 | 0.076 / 0.000 | 0.29 | 0.000 | 0.471 / 0.235 |
| role targets | 0.833 | 0.026 / 0.009 | 0.00 | 0.000 | 0.833 / 0.167 |
| role target | 0.733 | 0.169 / 0.000 | 0.67 | 0.000 | 0.067 / 0.267 |
| role landmark2 | 1.000 | 0.004 / 0.004 | 0.00 | 0.000 | 1.000 / 0.000 |
| role layout | 1.000 | 0.422 / 0.265 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.667 | 0.071 / 0.041 | 0.67 | 0.133 | 0.133 / 0.200 |
| role pairing | 1.000 | 0.248 / 0.108 | 1.00 | 0.000 | 0.000 / 0.000 |
| role style | 1.000 | 0.393 / 0.366 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.378 / 0.358 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.306 / 0.306 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 1.000 | 0.535 / 0.473 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.426 / 0.373 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 1.000 | 0.182 / 0.086 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3902)
| axis | accuracy |
|---|---|
| FULL | 0.773 |
| FULL [depth given] | 0.773 |
| FULL [depth and negation given] | 0.773 |
| presence object: present read present | 0.989 |
| presence object: share of 'present' readings that abstain | 0.027 |
| presence object: share of true 'present' readings that abstain | 0.028 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 0.992 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: present read present | 0.939 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.967 |
| presence landmark: share of 'present' readings that abstain | 0.065 |
| presence landmark: share of true 'present' readings that abstain | 0.034 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.989 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.950 |
| presence target: absent read absent | 0.955 |
| presence style: absent read absent | 0.982 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.981 |
| presence targets: absent read absent | 0.986 |
| structure (depth, negation) | 0.960 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.973 |
| set targets: exact | 0.987 |
| predicate (surface lemma) | 0.907 |
| event type (synonym table) | 0.907 |
| role object | 0.943 |
| head object | 0.950 |
| lexical order head object | 0.780 |
| lexical bag head object | 0.893 |
| occupancy: known filler | 0.930 |
| role shape | 0.993 |
| head shape | 0.993 |
| lexical order head shape | 0.903 |
| lexical bag head shape | 0.993 |
| occupancy: not given | 0.993 |
| role color | 0.980 |
| head color | 0.980 |
| lexical order head color | 0.823 |
| lexical bag head color | 0.990 |
| role size | 0.983 |
| head size | 0.983 |
| lexical order head size | 0.830 |
| lexical bag head size | 0.973 |
| role name | 1.000 |
| head name | 1.000 |
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
| role landmark | 0.980 |
| head landmark | 0.980 |
| lexical order head landmark | 0.793 |
| lexical bag head landmark | 0.973 |
| role landmark2 | 0.993 |
| head landmark2 | 0.993 |
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
| role source | 0.940 |
| head source | 0.940 |
| lexical order head source | 0.907 |
| lexical bag head source | 0.977 |
| role target | 0.947 |
| head target | 0.947 |
| lexical order head target | 0.923 |
| lexical bag head target | 0.990 |
| role style | 0.983 |
| head style | 0.983 |
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
| role members | 0.973 |
| head members | 0.973 |
| lexical order head members | 0.927 |
| lexical bag head members | 0.923 |
| role targets | 0.987 |
| head targets | 0.987 |
| lexical order head targets | 0.983 |
| lexical bag head targets | 0.973 |
| heads FULL (model) | 0.807 |
| heads FULL (lexical order baseline) | 0.173 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.710 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.037 |
| presence shape: share of true 'present' readings that abstain | 0.037 |
| presence size: present read present | 0.960 |
| presence size: share of 'present' readings that abstain | 0.020 |
| presence size: share of true 'present' readings that abstain | 0.021 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.987 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.021 |
| presence color: share of true 'present' readings that abstain | 0.021 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.062 |
| presence name: share of true 'present' readings that abstain | 0.062 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 0.962 |
| presence source: present read present | 0.821 |
| presence source: share of 'present' readings that abstain | 0.306 |
| presence source: share of true 'present' readings that abstain | 0.217 |
| presence target: present read present | 0.826 |
| presence target: share of 'present' readings that abstain | 0.258 |
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
| presence source: share of FALSE 'present' readings that abstain | 0.462 |
| presence pairing: present read present | 0.944 |
| presence pairing: share of 'present' readings that abstain | 0.059 |
| presence pairing: share of true 'present' readings that abstain | 0.059 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.296 |
| presence members: share of true 'present' readings that abstain | 0.182 |
| set members: first gold member in the decoded set | 0.955 |
| occupancy: unknown filler | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.125 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.500 |
| presence members: share of FALSE 'present' readings that abstain | 0.800 |
| presence targets: present read present | 1.000 |
| presence targets: share of 'present' readings that abstain | 0.889 |
| presence targets: share of true 'present' readings that abstain | 0.800 |
| set targets: first gold member in the decoded set | 1.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.200 |
| presence targets: share of FALSE 'present' readings that abstain | 1.000 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.667 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.500 |
| presence direction: present read present | 1.000 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.000 |
| presence amount: share of true 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.667 |

residual mean 0.145; status {'abstain': 50, 'ok': 238, 'no-sense': 4, 'unknown-event': 8}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.907 | 0.533 / 0.334 | 0.95 | 0.047 | 0.000 / 0.047 |
| role object | 0.932 | 0.364 / 0.137 | 0.95 | 0.047 | 0.026 / 0.021 |
| roles (pooled) | 0.922 | 0.326 / 0.054 | 0.90 | 0.028 | 0.045 / 0.050 |
| role relation | 0.918 | 0.344 / 0.148 | 0.94 | 0.020 | 0.000 / 0.061 |
| role landmark | 0.952 | 0.276 / 0.055 | 0.92 | 0.000 | 0.032 / 0.048 |
| role shape | 0.931 | 0.360 / 0.321 | 0.97 | 0.069 | 0.034 / 0.000 |
| role size | 0.941 | 0.373 / 0.260 | 0.94 | 0.020 | 0.020 / 0.039 |
| role color | 0.887 | 0.374 / 0.229 | 0.92 | 0.038 | 0.000 / 0.075 |
| role name | 1.000 | 0.204 / 0.066 | 0.94 | 0.000 | 0.062 / 0.000 |
| role source | 0.821 | 0.132 / 0.000 | 0.64 | 0.000 | 0.179 / 0.179 |
| role target | 0.826 | 0.192 / 0.000 | 0.74 | 0.000 | 0.087 / 0.174 |
| role arrow | 1.000 | 0.383 / 0.368 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.285 / 0.179 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 0.941 | 0.421 / 0.318 | 1.00 | 0.059 | 0.000 / 0.000 |
| role pairing | 0.944 | 0.358 / 0.063 | 0.89 | 0.000 | 0.056 / 0.056 |
| role members | 0.864 | 0.102 / 0.042 | 0.82 | 0.091 | 0.136 / 0.045 |
| role text | 0.917 | 0.261 / 0.253 | 0.92 | 0.000 | 0.000 / 0.083 |
| role style | 1.000 | 0.394 / 0.368 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.521 / 0.511 | 1.00 | 0.000 | 0.000 / 0.000 |
| role targets | 1.000 | 0.037 / 0.026 | 0.20 | 0.000 | 0.800 / 0.000 |
| role superlative | 1.000 | 0.552 / 0.489 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 0.667 | 0.022 / 0.000 | 0.00 | 0.000 | 0.667 / 0.333 |
| role comparison | 1.000 | 0.085 / 0.085 | 1.00 | 0.000 | 0.000 / 0.000 |
| role layout | 1.000 | 0.336 / 0.259 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 1.000 | 0.298 / 0.234 | 1.00 | 0.000 | 0.000 / 0.000 |
| role amount | 1.000 | 0.183 / 0.129 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 SUPER=0.97 from=0.90 once=0.88 AXIS=0.83 LAYOUT=0.79 the=0.74 STYLE=0.70 rules=0.69 VERB=0.69 NUM=0.69 COLOR=0.67 reached=0.66 pixels=0.65 it=0.56 that=0.47 ARROW=0.45 them=0.44 NAME=0.44 TEXT=0.40 whole=0.38 then=0.38 PAIR=0.37 with=0.37 as=0.35 last=0.33 we=0.31 for=0.31 DIR=0.28 do=0.27 are=0.22 can=0.21 this=0.20 here=0.20 those=0.19 exist=0.19 there=0.18 have=0.18 both=0.18 thing=0.16 too=0.16 what's=0.16 remove=0.16 i=0.14 evenly=0.13 each=0.13 diagram=0.12 NOTCOLOR=0.12 now=0.11 front=0.11 arrow=0.11 any=0.10 does=0.09 shapes=0.09 map=0.08 by=0.07 four=0.07 uh=0.07 no=0.06 two=0.05 QUANT=0.05 in=0.05 box=0.05 be=0.04 every=0.04 new=0.04 me=0.04 directly=0.04 arrows=0.04 three=0.04 an=0.04 back=0.03 you=0.03 check=0.03 what=0.03 give=0.03 show=0.03 just=0.03 line=0.03 at=0.03 place=0.03 RECENT=0.03 should=0.03 tell=0.03 axis=0.03 not=0.03 has=0.03 if=0.02 goes=0.02 link=0.02 on=0.02 who=0.02 shape=0.01 put=0.01 lines=0.01 SHAPE=0.01 one=0.01 unknown=0.01 called=0.01 SIZE=0.00 of=0.00 named=0.00 to=0.00 and=0.00 a=0.00 labeled=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.674
- heldout_formulations: presence object: share of 'present' readings that abstain 0.010
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.010
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: predicate (surface lemma) 0.872
- heldout_formulations: event type (synonym table) 0.872
- heldout_formulations: role object 0.872
- heldout_formulations: head object 0.884
- heldout_formulations: occupancy: known filler 0.871
- heldout_formulations: heads FULL (model) 0.715
- heldout_formulations: heads FULL (lexical order baseline) 0.192
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.459
- heldout_formulations: FULL [depth given] 0.674
- heldout_formulations: FULL [depth and negation given] 0.674
- heldout_formulations: FULL [presence not decided] 0.634
- heldout_formulations: role object [presence not decided] 0.872
- heldout_formulations: role members [presence not decided] 0.884
- heldout_formulations: heads FULL (model) [presence not decided] 0.669
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.436
- heldout_formulations: role object [pooled midpoint (comparison)] 0.703
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.459
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.637
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.833
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.027
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.029
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence shape: present read present [pooled midpoint (comparison)] 0.867
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.829
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present 0.864
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.864
- heldout_formulations: presence color: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence source: present read present 0.867
- heldout_formulations: presence source: share of 'present' readings that abstain 0.619
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.615
- heldout_formulations: presence target: share of 'present' readings that abstain 0.182
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.273
- heldout_formulations: presence members: share of 'present' readings that abstain 0.333
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.400
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.889
- heldout_formulations: set targets: first gold member in the decoded set 0.833
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.133
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.333
- heldout_formulations: presence target: present read present 0.786
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.091
- heldout_formulations: presence style: share of 'present' readings that abstain 0.333
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.667
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.357
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.308
- heldout_formulations: set members: first gold member in the decoded set 0.867
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.615
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.625
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.667
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence name: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.773
- train (sample): presence object: share of 'present' readings that abstain 0.027
- train (sample): presence object: share of true 'present' readings that abstain 0.028
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.065
- train (sample): presence landmark: share of true 'present' readings that abstain 0.034
- train (sample): heads FULL (model) 0.807
- train (sample): heads FULL (lexical order baseline) 0.173
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.710
- train (sample): FULL [depth given] 0.773
- train (sample): FULL [depth and negation given] 0.773
- train (sample): presence shape: share of 'present' readings that abstain 0.037
- train (sample): presence shape: share of true 'present' readings that abstain 0.037
- train (sample): presence size: share of 'present' readings that abstain 0.020
- train (sample): presence size: share of true 'present' readings that abstain 0.021
- train (sample): presence color: share of 'present' readings that abstain 0.021
- train (sample): presence color: share of true 'present' readings that abstain 0.021
- train (sample): presence name: share of 'present' readings that abstain 0.062
- train (sample): presence name: share of true 'present' readings that abstain 0.062
- train (sample): presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence source: present read present 0.821
- train (sample): presence source: share of 'present' readings that abstain 0.306
- train (sample): presence source: share of true 'present' readings that abstain 0.217
- train (sample): presence target: present read present 0.826
- train (sample): presence target: share of 'present' readings that abstain 0.258
- train (sample): presence target: share of true 'present' readings that abstain 0.105
- train (sample): presence arrow: share of 'present' readings that abstain 0.000
- train (sample): presence arrow: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.462
- train (sample): presence pairing: share of 'present' readings that abstain 0.059
- train (sample): presence pairing: share of true 'present' readings that abstain 0.059
- train (sample): presence members: share of 'present' readings that abstain 0.296
- train (sample): presence members: share of true 'present' readings that abstain 0.182
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of 'present' readings that abstain 0.125
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.800
- train (sample): presence targets: share of 'present' readings that abstain 0.889
- train (sample): presence targets: share of true 'present' readings that abstain 0.800
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.200
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: present read present 0.667
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.500
- train (sample): presence direction: share of 'present' readings that abstain 0.000
- train (sample): presence direction: share of true 'present' readings that abstain 0.000
- train (sample): presence amount: share of 'present' readings that abstain 0.000
- train (sample): presence amount: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.667

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
| heldout_formulations | product readout: presence decided | 0.715 | 0.674 | 0.872 | 0.988 | 0.953 | 1.000 | 1.000 | 1.000 | 0.977 | 0.983 | 1.000 | 0.983 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.930 | 0.913 | 0.983 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.942 | 0.977 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.459 | 0.436 | 0.703 | 0.983 | 0.930 | 1.000 | 0.994 | 1.000 | 0.977 | 0.965 | 0.994 | 0.983 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.913 | 0.930 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.901 | 0.936 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.669 | 0.634 | 0.872 | 0.994 | 0.942 | 1.000 | 1.000 | 0.913 | 0.983 | 0.983 | 1.000 | 0.983 | 0.977 | 1.000 | 1.000 | 1.000 | 1.000 | 0.924 | 0.913 | 0.983 | 1.000 | 0.988 | 1.000 | 1.000 | 1.000 | 0.884 | 0.948 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.961 | 0.906 | 0.933 | 0.010 (0.000 / 0.010) |
| heldout_formulations | object | comparison: pooled midpoint | 0.637 | 0.962 | 0.800 |  |
| heldout_formulations | shape | product: fitted | 0.933 | 1.000 | 0.967 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.867 | 1.000 | 0.933 |  |
| heldout_formulations | color | product: fitted | 1.000 | 0.983 | 0.992 | 0.027 (0.000 / 0.029) |
| heldout_formulations | color | comparison: pooled midpoint | 0.829 | 1.000 | 0.914 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.864 | 1.000 | 0.932 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.864 | 1.000 | 0.932 |  |
| heldout_formulations | landmark | product: fitted | 0.967 | 0.992 | 0.979 | 0.000 (0.000 / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.833 | 1.000 | 0.917 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
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
| heldout_formulations | source | product: fitted | 0.867 | 0.943 | 0.905 | 0.619 (0.625 / 0.615) |
| heldout_formulations | source | comparison: pooled midpoint | 0.133 | 1.000 | 0.567 |  |
| heldout_formulations | target | product: fitted | 0.786 | 0.923 | 0.854 | 0.182 (0.273 / 0.091) |
| heldout_formulations | target | comparison: pooled midpoint | 0.357 | 0.986 | 0.671 |  |
| heldout_formulations | style | product: fitted | 1.000 | 0.980 | 0.990 | 0.333 (0.667 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | arrow | product: fitted | — | 1.000 | — |  |
| heldout_formulations | arrow | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.965 | 0.983 | 0.333 (0.400 / 0.308) |
| heldout_formulations | members | comparison: pooled midpoint | 0.615 | 0.979 | 0.797 |  |
| heldout_formulations | targets | product: fitted | 1.000 | 0.980 | 0.990 | 0.889 (0.667 / 1.000) |
| heldout_formulations | targets | comparison: pooled midpoint | 1.000 | 0.933 | 0.966 |  |
| train (sample) | object | product: fitted | 0.989 | 0.962 | 0.975 | 0.027 (0.000 / 0.028) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.037 (— / 0.037) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.021 (— / 0.021) |
| train (sample) | size | product: fitted | 0.960 | 0.992 | 0.976 | 0.020 (0.000 / 0.021) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.062 (— / 0.062) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.939 | 1.000 | 0.969 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.967 | 0.987 | 0.977 | 0.065 (0.667 / 0.034) |
| train (sample) | landmark2 | product: fitted | 0.667 | 1.000 | 0.833 | 1.000 (— / 1.000) |
| train (sample) | region | product: fitted | 1.000 | 0.989 | 0.994 | 0.000 (0.000 / 0.000) |
| train (sample) | direction | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | axis | product: fitted | — | 1.000 | — |  |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.821 | 0.950 | 0.886 | 0.306 (0.462 / 0.217) |
| train (sample) | target | product: fitted | 0.826 | 0.955 | 0.890 | 0.258 (0.500 / 0.105) |
| train (sample) | style | product: fitted | 1.000 | 0.982 | 0.991 | 0.125 (0.200 / 0.000) |
| train (sample) | arrow | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 0.944 | 1.000 | 0.972 | 0.059 (— / 0.059) |
| train (sample) | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.981 | 0.991 | 0.296 (0.800 / 0.182) |
| train (sample) | targets | product: fitted | 1.000 | 0.986 | 0.993 | 0.889 (1.000 / 0.800) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
