# REPORT — world `real`, legend sha256:5482949ea6b5… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4284 annotated sentences from 2 files; provenance: {'llm': 4284}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/s7_p80_D1024_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 210 sentences
- heldout_formulations: 172 sentences
- train: 3902 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
24230 tokens in the examples; 1029 with no kind in the lexicon (share 0.042), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit a4ba566. Memory curve: runs/s7_p80_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.103 [rule: fit; pooled midpoint 0.309 (comparison)] (present 0.618, n 158 / absent 0.001, n 638386)
- set_member:targets: threshold 0.096 [rule: fit; pooled midpoint 0.098 (comparison)] (present 0.196, n 49 / absent -0.001, n 196735)
- presence:object: threshold 0.112 [rule: fit; pooled midpoint 0.601 (comparison)] (present 1.077, n 356 / absent 0.125, n 254)
- presence:shape: threshold 0.068 [rule: fit; pooled midpoint 0.325 (comparison)] (present 0.643, n 63 / absent 0.006, n 547)
- presence:color: threshold 0.225 [rule: fit; pooled midpoint 0.414 (comparison)] (present 0.804, n 106 / absent 0.024, n 504)
- presence:size: threshold 0.208 [rule: fit; pooled midpoint 0.361 (comparison)] (present 0.701, n 86 / absent 0.022, n 524)
- presence:name: threshold 0.211 [rule: fit; pooled midpoint 0.400 (comparison)] (present 0.799, n 19 / absent 0.002, n 591)
- presence:text: threshold 0.037 [rule: fit; pooled midpoint 0.303 (comparison)] (present 0.622, n 28 / absent -0.017, n 582)
- presence:relation: threshold 0.123 [rule: fit; pooled midpoint 0.378 (comparison)] (present 0.744, n 79 / absent 0.012, n 531)
- presence:landmark: threshold 0.154 [rule: fit; pooled midpoint 0.404 (comparison)] (present 0.773, n 116 / absent 0.036, n 494)
- presence:landmark2: threshold 0.200 [rule: fit; pooled midpoint 0.166 (comparison)] (present 0.325, n 5 / absent 0.007, n 605)
- presence:region: threshold 0.150 [rule: fit; pooled midpoint 0.266 (comparison)] (present 0.508, n 26 / absent 0.025, n 584)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 607)
- presence:amount: threshold 0.347 [rule: fit; pooled midpoint 0.328 (comparison)] (present 0.659, n 5 / absent -0.002, n 605)
- presence:quantity: threshold 0.065 [rule: fit; pooled midpoint 0.180 (comparison)] (present 0.359, n 7 / absent -0.000, n 603)
- presence:axis: threshold 0.185 [rule: fit; pooled midpoint 0.295 (comparison)] (present 0.591, n 8 / absent 0.000, n 602)
- presence:layout: threshold 0.267 [rule: fit; pooled midpoint 0.374 (comparison)] (present 0.748, n 14 / absent 0.000, n 596)
- presence:source: threshold 0.412 [rule: fit; pooled midpoint 0.383 (comparison)] (present 0.749, n 81 / absent 0.017, n 529)
- presence:target: threshold 0.285 [rule: fit; pooled midpoint 0.618 (comparison)] (present 1.202, n 57 / absent 0.033, n 553)
- presence:style: threshold 0.042 [rule: fit; pooled midpoint 0.276 (comparison)] (present 0.539, n 20 / absent 0.012, n 590)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 607)
- presence:edge: threshold 0.407 [rule: fit; pooled midpoint 0.405 (comparison)] (present 0.810, n 13 / absent 0.001, n 597)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 13)
- presence:pairing: threshold 0.410 [rule: fit; pooled midpoint 0.439 (comparison)] (present 0.869, n 31 / absent 0.009, n 579)
- presence:superlative: threshold 0.172 [rule: fit; pooled midpoint 0.450 (comparison)] (present 0.899, n 64 / absent 0.000, n 546)
- presence:comparison: threshold 0.190 [rule: fit; pooled midpoint 0.285 (comparison)] (present 0.569, n 13 / absent 0.001, n 597)
- presence:members: threshold 0.334 [rule: fit; pooled midpoint 0.522 (comparison)] (present 0.925, n 58 / absent 0.119, n 552)
- presence:targets: threshold 0.131 [rule: fit; pooled midpoint 0.143 (comparison)] (present 0.252, n 25 / absent 0.034, n 585)
- attr_presence:object: threshold 0.245 [rule: fit; pooled midpoint 0.393 (comparison)] (present 0.657, n 28 / absent 0.129, n 321)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 345)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.059, quantity 0.059, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 172 of 172)
| axis | accuracy |
|---|---|
| FULL | 0.657 |
| FULL [depth given] | 0.657 |
| FULL [depth and negation given] | 0.657 |
| FULL [presence not decided] | 0.628 |
| FULL [pooled midpoint (comparison)] | 0.494 |
| presence object: present read present | 0.971 |
| presence object: share of 'present' readings that abstain | 0.096 |
| presence object: share of true 'present' readings that abstain | 0.090 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.992 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.992 |
| presence landmark2: absent read absent | 1.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence amount: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.979 |
| presence target: absent read absent | 0.951 |
| presence style: absent read absent | 0.980 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.958 |
| presence targets: absent read absent | 0.953 |
| structure (depth, negation) | 0.907 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.936 |
| set targets: exact | 0.948 |
| predicate (surface lemma) | 0.872 |
| event type (synonym table) | 0.872 |
| role object | 0.860 |
| head object | 0.890 |
| lexical order head object | 0.762 |
| lexical bag head object | 0.785 |
| occupancy: unknown filler | 0.871 |
| role shape | 0.988 |
| head shape | 0.988 |
| lexical order head shape | 0.907 |
| lexical bag head shape | 0.988 |
| occupancy: not given | 0.992 |
| role color | 0.924 |
| head color | 0.924 |
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
| role region | 0.988 |
| head region | 0.988 |
| lexical order head region | 0.942 |
| lexical bag head region | 0.965 |
| occupancy: known filler | 0.848 |
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
| role pairing | 0.994 |
| head pairing | 0.994 |
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
| role targets | 0.948 |
| head targets | 0.948 |
| lexical order head targets | 0.965 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.703 |
| heads FULL (lexical order baseline) | 0.192 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.459 |
| role object [presence not decided] | 0.849 |
| role shape [presence not decided] | 0.988 |
| role color [presence not decided] | 0.942 |
| role size [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 0.924 |
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
| role target [presence not decided] | 0.907 |
| role style [presence not decided] | 0.983 |
| role arrow [presence not decided] | 1.000 |
| role edge [presence not decided] | 0.988 |
| role pairing [presence not decided] | 1.000 |
| role superlative [presence not decided] | 1.000 |
| role comparison [presence not decided] | 1.000 |
| role members [presence not decided] | 0.895 |
| role targets [presence not decided] | 0.942 |
| heads FULL (model) [presence not decided] | 0.674 |
| role object [pooled midpoint (comparison)] | 0.680 |
| role shape [pooled midpoint (comparison)] | 0.988 |
| role color [pooled midpoint (comparison)] | 0.901 |
| role size [pooled midpoint (comparison)] | 1.000 |
| role name [pooled midpoint (comparison)] | 0.994 |
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
| role source [pooled midpoint (comparison)] | 0.959 |
| role target [pooled midpoint (comparison)] | 0.948 |
| role style [pooled midpoint (comparison)] | 0.994 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 0.988 |
| role superlative [pooled midpoint (comparison)] | 0.994 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.895 |
| role targets [pooled midpoint (comparison)] | 0.959 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.517 |
| presence object: present read present [pooled midpoint (comparison)] | 0.646 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 0.991 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: present read present [pooled midpoint (comparison)] | 1.000 |
| presence amount: absent read absent [pooled midpoint (comparison)] | 1.000 |
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
| presence members: absent read absent [pooled midpoint (comparison)] | 0.978 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.966 |
| presence landmark: present read present | 0.900 |
| presence landmark: share of 'present' readings that abstain | 0.143 |
| presence landmark: share of true 'present' readings that abstain | 0.111 |
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
| presence color: present read present | 0.829 |
| presence color: share of 'present' readings that abstain | 0.067 |
| presence color: share of true 'present' readings that abstain | 0.034 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.933 |
| presence color: present read present [pooled midpoint (comparison)] | 0.714 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.909 |
| presence relation: share of 'present' readings that abstain | 0.150 |
| presence relation: share of true 'present' readings that abstain | 0.150 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.789 |
| presence object: absent read absent | 0.925 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.943 |
| presence source: present read present | 0.733 |
| presence source: share of 'present' readings that abstain | 0.214 |
| presence source: share of true 'present' readings that abstain | 0.182 |
| presence target: share of 'present' readings that abstain | 0.412 |
| presence target: share of FALSE 'present' readings that abstain | 0.714 |
| presence members: share of 'present' readings that abstain | 0.526 |
| presence members: share of FALSE 'present' readings that abstain | 0.500 |
| presence targets: present read present | 1.000 |
| presence targets: share of 'present' readings that abstain | 0.692 |
| presence targets: share of true 'present' readings that abstain | 1.000 |
| set targets: first gold member in the decoded set | 0.667 |
| presence source: present read present [pooled midpoint (comparison)] | 0.867 |
| presence targets: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence target: present read present | 0.714 |
| presence target: share of true 'present' readings that abstain | 0.200 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence target: present read present [pooled midpoint (comparison)] | 0.429 |
| presence landmark2: present read present | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 0.538 |
| set members: first gold member in the decoded set | 0.867 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.615 |
| presence pairing: present read present | 0.833 |
| presence pairing: share of 'present' readings that abstain | 0.200 |
| presence pairing: share of true 'present' readings that abstain | 0.200 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.667 |
| presence style: present read present | 1.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.333 |
| presence targets: share of FALSE 'present' readings that abstain | 0.429 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present [pooled midpoint (comparison)] | 1.000 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.929 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.250 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 0.500 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 1.000 |
| presence color: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.235; status {'ok': 113, 'abstain': 43, 'no-sense': 4, 'unknown-event': 12}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.872 | 0.404 / 0.087 | 0.91 | 0.047 | 0.012 / 0.081 |
| role object | 0.825 | 0.260 / 0.029 | 0.87 | 0.123 | 0.079 / 0.053 |
| roles (pooled) | 0.819 | 0.216 / 0.000 | 0.78 | 0.046 | 0.083 / 0.135 |
| role region | 0.900 | 0.299 / 0.221 | 0.90 | 0.000 | 0.000 / 0.100 |
| role landmark | 0.871 | 0.166 / 0.000 | 0.77 | 0.000 | 0.097 / 0.129 |
| role comparison | 1.000 | 0.259 / 0.223 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 0.875 | 0.245 / 0.161 | 0.94 | 0.062 | 0.000 / 0.062 |
| role color | 0.707 | 0.173 / 0.000 | 0.68 | 0.000 | 0.024 / 0.293 |
| role size | 1.000 | 0.304 / 0.271 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.216 / 0.188 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.870 | 0.220 / 0.000 | 0.74 | 0.000 | 0.130 / 0.130 |
| role source | 0.647 | 0.076 / 0.000 | 0.53 | 0.000 | 0.118 / 0.353 |
| role targets | 0.667 | 0.018 / 0.010 | 0.00 | 0.000 | 0.667 / 0.333 |
| role target | 0.600 | 0.087 / 0.000 | 0.53 | 0.000 | 0.067 / 0.400 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role layout | 1.000 | 0.295 / 0.149 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.667 | 0.059 / 0.029 | 0.40 | 0.067 | 0.333 / 0.267 |
| role pairing | 0.833 | 0.153 / 0.007 | 0.67 | 0.000 | 0.167 / 0.167 |
| role style | 1.000 | 0.259 / 0.244 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.326 / 0.322 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.234 / 0.234 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 1.000 | 0.452 / 0.372 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.072 / 0.066 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 1.000 | 0.153 / 0.093 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3902)
| axis | accuracy |
|---|---|
| FULL | 0.690 |
| FULL [depth given] | 0.690 |
| FULL [depth and negation given] | 0.690 |
| presence object: present read present | 0.962 |
| presence object: share of 'present' readings that abstain | 0.067 |
| presence object: share of true 'present' readings that abstain | 0.063 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.996 |
| presence size: absent read absent | 0.992 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: present read present | 0.938 |
| presence relation: share of 'present' readings that abstain | 0.022 |
| presence relation: share of true 'present' readings that abstain | 0.022 |
| presence landmark: present read present | 0.983 |
| presence landmark: share of 'present' readings that abstain | 0.131 |
| presence landmark: share of true 'present' readings that abstain | 0.119 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.985 |
| presence region: share of 'present' readings that abstain | 0.050 |
| presence region: share of FALSE 'present' readings that abstain | 0.250 |
| presence amount: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.981 |
| presence target: absent read absent | 0.970 |
| presence style: absent read absent | 0.979 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.981 |
| presence targets: absent read absent | 0.943 |
| structure (depth, negation) | 0.953 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.970 |
| set targets: exact | 0.940 |
| predicate (surface lemma) | 0.900 |
| event type (synonym table) | 0.900 |
| role object | 0.900 |
| head object | 0.933 |
| lexical order head object | 0.780 |
| lexical bag head object | 0.893 |
| occupancy: known filler | 0.894 |
| role shape | 0.990 |
| head shape | 0.990 |
| lexical order head shape | 0.903 |
| lexical bag head shape | 0.993 |
| occupancy: not given | 0.992 |
| role color | 0.963 |
| head color | 0.963 |
| lexical order head color | 0.823 |
| lexical bag head color | 0.990 |
| role size | 0.977 |
| head size | 0.977 |
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
| role relation | 0.983 |
| head relation | 0.983 |
| lexical order head relation | 0.837 |
| lexical bag head relation | 0.977 |
| role landmark | 0.980 |
| head landmark | 0.980 |
| lexical order head landmark | 0.793 |
| lexical bag head landmark | 0.973 |
| role landmark2 | 0.997 |
| head landmark2 | 0.997 |
| lexical order head landmark2 | 0.980 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.983 |
| head region | 0.983 |
| lexical order head region | 0.943 |
| lexical bag head region | 0.973 |
| role direction | 0.990 |
| head direction | 0.990 |
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
| role source | 0.953 |
| head source | 0.953 |
| lexical order head source | 0.907 |
| lexical bag head source | 0.977 |
| role target | 0.953 |
| head target | 0.953 |
| lexical order head target | 0.923 |
| lexical bag head target | 0.990 |
| role style | 0.980 |
| head style | 0.980 |
| lexical order head style | 0.990 |
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
| role members | 0.970 |
| head members | 0.970 |
| lexical order head members | 0.927 |
| lexical bag head members | 0.923 |
| role targets | 0.940 |
| head targets | 0.940 |
| lexical order head targets | 0.983 |
| lexical bag head targets | 0.973 |
| heads FULL (model) | 0.743 |
| heads FULL (lexical order baseline) | 0.173 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.710 |
| presence shape: present read present | 0.963 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 0.940 |
| presence size: share of 'present' readings that abstain | 0.020 |
| presence size: share of true 'present' readings that abstain | 0.021 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.991 |
| presence color: present read present | 0.917 |
| presence color: share of 'present' readings that abstain | 0.044 |
| presence color: share of true 'present' readings that abstain | 0.023 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 0.971 |
| presence source: present read present | 0.704 |
| presence source: share of 'present' readings that abstain | 0.333 |
| presence source: share of true 'present' readings that abstain | 0.263 |
| presence target: present read present | 0.818 |
| presence target: share of 'present' readings that abstain | 0.192 |
| presence target: share of true 'present' readings that abstain | 0.056 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present | 0.944 |
| presence pairing: share of 'present' readings that abstain | 0.059 |
| presence pairing: share of true 'present' readings that abstain | 0.059 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.222 |
| presence members: share of true 'present' readings that abstain | 0.182 |
| presence targets: share of 'present' readings that abstain | 0.714 |
| presence targets: share of FALSE 'present' readings that abstain | 0.750 |
| set members: first gold member in the decoded set | 0.909 |
| occupancy: unknown filler | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.111 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.333 |
| presence quantity: share of true 'present' readings that abstain | 0.333 |
| presence target: share of FALSE 'present' readings that abstain | 0.500 |
| presence members: share of FALSE 'present' readings that abstain | 0.400 |
| presence targets: present read present | 1.000 |
| presence targets: share of true 'present' readings that abstain | 0.600 |
| set targets: first gold member in the decoded set | 1.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.167 |
| presence source: share of FALSE 'present' readings that abstain | 0.600 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.833 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: share of 'present' readings that abstain | 0.800 |
| presence landmark2: share of true 'present' readings that abstain | 0.800 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.333 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.333 |
| presence amount: share of true 'present' readings that abstain | 0.333 |
| presence color: share of FALSE 'present' readings that abstain | 1.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.500 |

residual mean 0.178; status {'abstain': 66, 'ok': 220, 'no-sense': 6, 'unknown-event': 8}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.900 | 0.438 / 0.265 | 0.96 | 0.057 | 0.000 / 0.043 |
| role object | 0.859 | 0.278 / 0.025 | 0.89 | 0.089 | 0.057 / 0.052 |
| roles (pooled) | 0.866 | 0.236 / 0.005 | 0.85 | 0.033 | 0.052 / 0.102 |
| role relation | 0.898 | 0.241 / 0.061 | 0.90 | 0.020 | 0.020 / 0.082 |
| role landmark | 0.935 | 0.185 / 0.019 | 0.84 | 0.000 | 0.097 / 0.065 |
| role shape | 0.897 | 0.237 / 0.042 | 0.90 | 0.000 | 0.000 / 0.103 |
| role size | 0.902 | 0.257 / 0.099 | 0.90 | 0.000 | 0.000 / 0.098 |
| role color | 0.811 | 0.231 / 0.000 | 0.83 | 0.019 | 0.000 / 0.170 |
| role name | 1.000 | 0.167 / 0.060 | 1.00 | 0.000 | 0.000 / 0.000 |
| role source | 0.679 | 0.095 / 0.000 | 0.50 | 0.000 | 0.179 / 0.321 |
| role target | 0.739 | 0.149 / 0.000 | 0.74 | 0.000 | 0.000 / 0.261 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role edge | 1.000 | 0.307 / 0.259 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 0.941 | 0.332 / 0.269 | 0.94 | 0.000 | 0.000 / 0.059 |
| role pairing | 0.944 | 0.278 / 0.069 | 0.89 | 0.000 | 0.056 / 0.056 |
| role members | 0.818 | 0.082 / 0.029 | 0.82 | 0.091 | 0.091 / 0.091 |
| role text | 0.917 | 0.197 / 0.162 | 0.92 | 0.000 | 0.000 / 0.083 |
| role style | 1.000 | 0.275 / 0.263 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.207 / 0.062 | 0.67 | 0.000 | 0.333 / 0.000 |
| role targets | 0.600 | 0.043 / 0.014 | 0.40 | 0.000 | 0.200 / 0.400 |
| role superlative | 1.000 | 0.439 / 0.277 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 0.833 | 0.028 / 0.011 | 0.17 | 0.000 | 0.667 / 0.167 |
| role comparison | 1.000 | 0.214 / 0.214 | 1.00 | 0.000 | 0.000 / 0.000 |
| role layout | 1.000 | 0.247 / 0.147 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 1.000 | 0.097 / 0.055 | 0.67 | 0.000 | 0.333 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 SUPER=0.98 COLOR=0.97 LAYOUT=0.93 AXIS=0.90 once=0.89 rules=0.82 pixels=0.80 TEXT=0.77 NUM=0.74 have=0.74 PAIR=0.72 NAME=0.60 whole=0.55 VERB=0.53 last=0.46 it=0.46 with=0.45 there=0.45 them=0.37 for=0.35 do=0.32 as=0.32 thing=0.31 reached=0.30 diagram=0.28 that=0.24 this=0.20 any=0.20 ARROW=0.20 those=0.20 we=0.19 DIR=0.18 are=0.18 now=0.17 each=0.16 i=0.16 line=0.16 exist=0.14 no=0.14 map=0.13 here=0.13 show=0.12 NOTCOLOR=0.12 too=0.10 STYLE=0.10 evenly=0.10 the=0.09 directly=0.08 arrow=0.08 both=0.08 uh=0.08 two=0.07 front=0.07 remove=0.07 what=0.07 box=0.07 four=0.06 from=0.06 me=0.06 shapes=0.05 check=0.05 axis=0.05 then=0.05 by=0.04 at=0.04 lines=0.04 be=0.04 if=0.04 just=0.04 place=0.04 you=0.03 can=0.03 tell=0.03 three=0.03 link=0.03 an=0.03 has=0.03 back=0.03 on=0.03 new=0.03 RECENT=0.03 arrows=0.03 goes=0.03 give=0.02 who=0.02 should=0.02 every=0.02 SHAPE=0.02 what's=0.02 does=0.02 not=0.02 in=0.02 put=0.01 QUANT=0.01 shape=0.01 named=0.01 one=0.01 SIZE=0.01 called=0.01 of=0.00 to=0.00 unknown=0.00 labeled=0.00 and=0.00 a=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.657
- heldout_formulations: presence object: share of 'present' readings that abstain 0.096
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.090
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: predicate (surface lemma) 0.872
- heldout_formulations: event type (synonym table) 0.872
- heldout_formulations: role object 0.860
- heldout_formulations: head object 0.890
- heldout_formulations: occupancy: unknown filler 0.871
- heldout_formulations: occupancy: known filler 0.848
- heldout_formulations: heads FULL (model) 0.703
- heldout_formulations: heads FULL (lexical order baseline) 0.192
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.459
- heldout_formulations: FULL [depth given] 0.657
- heldout_formulations: FULL [depth and negation given] 0.657
- heldout_formulations: FULL [presence not decided] 0.628
- heldout_formulations: role object [presence not decided] 0.849
- heldout_formulations: role members [presence not decided] 0.895
- heldout_formulations: heads FULL (model) [presence not decided] 0.674
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.494
- heldout_formulations: role object [pooled midpoint (comparison)] 0.680
- heldout_formulations: role members [pooled midpoint (comparison)] 0.895
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.517
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.646
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.143
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.111
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.852
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present 0.829
- heldout_formulations: presence color: share of 'present' readings that abstain 0.067
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.034
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.714
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.150
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.150
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.789
- heldout_formulations: presence source: present read present 0.733
- heldout_formulations: presence source: share of 'present' readings that abstain 0.214
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.182
- heldout_formulations: presence target: share of 'present' readings that abstain 0.412
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.714
- heldout_formulations: presence members: share of 'present' readings that abstain 0.526
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.500
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.692
- heldout_formulations: set targets: first gold member in the decoded set 0.667
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.867
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_formulations: presence target: present read present 0.714
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.200
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.429
- heldout_formulations: presence landmark2: present read present 0.000
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.538
- heldout_formulations: set members: first gold member in the decoded set 0.867
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.615
- heldout_formulations: presence pairing: present read present 0.833
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.200
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.200
- heldout_formulations: presence pairing: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.333
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.429
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.250
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence name: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.690
- train (sample): presence object: share of 'present' readings that abstain 0.067
- train (sample): presence object: share of true 'present' readings that abstain 0.063
- train (sample): presence relation: share of 'present' readings that abstain 0.022
- train (sample): presence relation: share of true 'present' readings that abstain 0.022
- train (sample): presence landmark: share of 'present' readings that abstain 0.131
- train (sample): presence landmark: share of true 'present' readings that abstain 0.119
- train (sample): presence region: share of 'present' readings that abstain 0.050
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.250
- train (sample): occupancy: known filler 0.894
- train (sample): heads FULL (model) 0.743
- train (sample): heads FULL (lexical order baseline) 0.173
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.710
- train (sample): FULL [depth given] 0.690
- train (sample): FULL [depth and negation given] 0.690
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of 'present' readings that abstain 0.020
- train (sample): presence size: share of true 'present' readings that abstain 0.021
- train (sample): presence color: share of 'present' readings that abstain 0.044
- train (sample): presence color: share of true 'present' readings that abstain 0.023
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence source: present read present 0.704
- train (sample): presence source: share of 'present' readings that abstain 0.333
- train (sample): presence source: share of true 'present' readings that abstain 0.263
- train (sample): presence target: present read present 0.818
- train (sample): presence target: share of 'present' readings that abstain 0.192
- train (sample): presence target: share of true 'present' readings that abstain 0.056
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence pairing: share of 'present' readings that abstain 0.059
- train (sample): presence pairing: share of true 'present' readings that abstain 0.059
- train (sample): presence members: share of 'present' readings that abstain 0.222
- train (sample): presence members: share of true 'present' readings that abstain 0.182
- train (sample): presence targets: share of 'present' readings that abstain 0.714
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.750
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of 'present' readings that abstain 0.111
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.333
- train (sample): presence quantity: share of true 'present' readings that abstain 0.333
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.400
- train (sample): presence targets: share of true 'present' readings that abstain 0.600
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.167
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.600
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: present read present 0.833
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.800
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.800
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.333
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence amount: share of 'present' readings that abstain 0.333
- train (sample): presence amount: share of true 'present' readings that abstain 0.333
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.500

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
| heldout_formulations | product readout: presence decided | 0.703 | 0.657 | 0.860 | 0.988 | 0.924 | 1.000 | 1.000 | 1.000 | 0.983 | 0.971 | 0.994 | 0.988 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.948 | 0.924 | 0.983 | 1.000 | 1.000 | 0.994 | 1.000 | 1.000 | 0.936 | 0.948 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.517 | 0.494 | 0.680 | 0.988 | 0.901 | 1.000 | 0.994 | 1.000 | 0.953 | 0.953 | 0.994 | 0.988 | 1.000 | 1.000 | 0.988 | 1.000 | 1.000 | 0.959 | 0.948 | 0.994 | 1.000 | 1.000 | 0.988 | 0.994 | 1.000 | 0.895 | 0.959 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.674 | 0.628 | 0.849 | 0.988 | 0.942 | 1.000 | 1.000 | 0.924 | 0.983 | 0.977 | 1.000 | 0.983 | 0.977 | 1.000 | 1.000 | 1.000 | 1.000 | 0.924 | 0.907 | 0.983 | 1.000 | 0.988 | 1.000 | 1.000 | 1.000 | 0.895 | 0.942 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.971 | 0.925 | 0.948 | 0.096 (0.250 / 0.090) |
| heldout_formulations | object | comparison: pooled midpoint | 0.646 | 0.943 | 0.795 |  |
| heldout_formulations | shape | product: fitted | 0.933 | 1.000 | 0.967 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_formulations | color | product: fitted | 0.829 | 0.992 | 0.910 | 0.067 (1.000 / 0.034) |
| heldout_formulations | color | comparison: pooled midpoint | 0.714 | 0.991 | 0.853 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.909 | 1.000 | 0.955 | 0.150 (— / 0.150) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.789 | 1.000 | 0.895 |  |
| heldout_formulations | landmark | product: fitted | 0.900 | 0.992 | 0.946 | 0.143 (1.000 / 0.111) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.852 | 1.000 | 0.926 |  |
| heldout_formulations | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 1.000 | 0.993 | 0.997 | 0.000 (0.000 / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 1.000 | 0.993 | 0.997 |  |
| heldout_formulations | amount | product: fitted | — | 1.000 | — |  |
| heldout_formulations | amount | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | source | product: fitted | 0.733 | 0.979 | 0.856 | 0.214 (0.333 / 0.182) |
| heldout_formulations | source | comparison: pooled midpoint | 0.867 | 0.978 | 0.922 |  |
| heldout_formulations | target | product: fitted | 0.714 | 0.951 | 0.832 | 0.412 (0.714 / 0.200) |
| heldout_formulations | target | comparison: pooled midpoint | 0.429 | 1.000 | 0.714 |  |
| heldout_formulations | style | product: fitted | 1.000 | 0.980 | 0.990 | 0.000 (0.000 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 0.993 | 0.997 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 0.833 | 1.000 | 0.917 | 0.200 (— / 0.200) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 0.929 | 1.000 | 0.964 |  |
| heldout_formulations | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.958 | 0.979 | 0.526 (0.500 / 0.538) |
| heldout_formulations | members | comparison: pooled midpoint | 0.615 | 0.978 | 0.797 |  |
| heldout_formulations | targets | product: fitted | 1.000 | 0.953 | 0.977 | 0.692 (0.429 / 1.000) |
| heldout_formulations | targets | comparison: pooled midpoint | 1.000 | 0.966 | 0.983 |  |
| train (sample) | object | product: fitted | 0.962 | 0.971 | 0.966 | 0.067 (0.333 / 0.063) |
| train (sample) | shape | product: fitted | 0.963 | 1.000 | 0.981 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.917 | 0.996 | 0.956 | 0.044 (1.000 / 0.023) |
| train (sample) | size | product: fitted | 0.940 | 0.992 | 0.966 | 0.020 (0.000 / 0.021) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.938 | 1.000 | 0.969 | 0.022 (— / 0.022) |
| train (sample) | landmark | product: fitted | 0.983 | 0.991 | 0.987 | 0.131 (0.500 / 0.119) |
| train (sample) | landmark2 | product: fitted | 0.833 | 1.000 | 0.917 | 0.800 (— / 0.800) |
| train (sample) | region | product: fitted | 1.000 | 0.985 | 0.993 | 0.050 (0.250 / 0.000) |
| train (sample) | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.333 (— / 0.333) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.333 (— / 0.333) |
| train (sample) | axis | product: fitted | — | 1.000 | — |  |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.704 | 0.981 | 0.842 | 0.333 (0.600 / 0.263) |
| train (sample) | target | product: fitted | 0.818 | 0.970 | 0.894 | 0.192 (0.500 / 0.056) |
| train (sample) | style | product: fitted | 1.000 | 0.979 | 0.989 | 0.111 (0.167 / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 0.944 | 1.000 | 0.972 | 0.059 (— / 0.059) |
| train (sample) | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.981 | 0.991 | 0.222 (0.400 / 0.182) |
| train (sample) | targets | product: fitted | 1.000 | 0.943 | 0.972 | 0.714 (0.750 / 0.600) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
