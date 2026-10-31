# REPORT — world `real`, legend sha256:13e56355d30e… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4282 annotated sentences from 2 files; provenance: {'llm': 4282}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/m0_p80_D1024_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 210 sentences
- heldout_formulations: 172 sentences
- train: 3900 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
24217 tokens in the examples; 1026 with no kind in the lexicon (share 0.042), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 046a7a3. Memory curve: runs/m0_p80_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.099 [rule: fit; pooled midpoint 0.249 (comparison)] (present 0.497, n 170 / absent 0.000, n 656446)
- set_member:targets: threshold 0.089 [rule: fit; pooled midpoint 0.092 (comparison)] (present 0.185, n 45 / absent -0.000, n 192723)
- presence:object: threshold 0.465 [rule: fit; pooled midpoint 0.821 (comparison)] (present 1.497, n 353 / absent 0.145, n 257)
- presence:shape: threshold 0.177 [rule: fit; pooled midpoint 0.436 (comparison)] (present 0.856, n 57 / absent 0.017, n 553)
- presence:color: threshold 0.314 [rule: fit; pooled midpoint 0.540 (comparison)] (present 1.071, n 108 / absent 0.009, n 502)
- presence:size: threshold 0.367 [rule: fit; pooled midpoint 0.501 (comparison)] (present 0.986, n 85 / absent 0.017, n 525)
- presence:name: threshold 0.219 [rule: fit; pooled midpoint 0.607 (comparison)] (present 1.202, n 17 / absent 0.012, n 593)
- presence:text: threshold 0.206 [rule: fit; pooled midpoint 0.532 (comparison)] (present 1.026, n 26 / absent 0.039, n 584)
- presence:relation: threshold 0.339 [rule: fit; pooled midpoint 0.460 (comparison)] (present 0.867, n 77 / absent 0.053, n 533)
- presence:landmark: threshold 0.194 [rule: fit; pooled midpoint 0.351 (comparison)] (present 0.635, n 108 / absent 0.068, n 502)
- presence:landmark2: threshold 0.140 [rule: fit; pooled midpoint 0.108 (comparison)] (present 0.167, n 8 / absent 0.049, n 602)
- presence:region: threshold 0.193 [rule: fit; pooled midpoint 0.343 (comparison)] (present 0.653, n 28 / absent 0.032, n 582)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 607)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 606)
- presence:quantity: threshold 0.503 [rule: fit; pooled midpoint 0.368 (comparison)] (present 0.735, n 8 / absent 0.001, n 602)
- presence:axis: threshold 0.297 [rule: fit; pooled midpoint 0.332 (comparison)] (present 0.663, n 9 / absent 0.000, n 601)
- presence:layout: threshold 0.311 [rule: fit; pooled midpoint 0.441 (comparison)] (present 0.882, n 12 / absent 0.000, n 598)
- presence:source: threshold 0.047 [rule: fit; pooled midpoint 0.271 (comparison)] (present 0.522, n 82 / absent 0.019, n 528)
- presence:target: threshold 0.126 [rule: fit; pooled midpoint 0.378 (comparison)] (present 0.726, n 58 / absent 0.030, n 552)
- presence:style: threshold 0.177 [rule: fit; pooled midpoint 0.288 (comparison)] (present 0.567, n 20 / absent 0.010, n 590)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 607)
- presence:edge: threshold 0.211 [rule: fit; pooled midpoint 0.362 (comparison)] (present 0.718, n 14 / absent 0.007, n 596)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 14)
- presence:pairing: threshold 0.334 [rule: fit; pooled midpoint 0.440 (comparison)] (present 0.871, n 35 / absent 0.010, n 575)
- presence:superlative: threshold 0.672 [rule: fit; pooled midpoint 0.465 (comparison)] (present 0.926, n 62 / absent 0.003, n 548)
- presence:comparison: threshold 0.607 [rule: fit; pooled midpoint 0.387 (comparison)] (present 0.771, n 5 / absent 0.003, n 605)
- presence:members: threshold 0.262 [rule: fit; pooled midpoint 0.436 (comparison)] (present 0.768, n 62 / absent 0.105, n 548)
- presence:targets: threshold 0.125 [rule: fit; pooled midpoint 0.132 (comparison)] (present 0.238, n 23 / absent 0.026, n 587)
- attr_presence:object: threshold 0.313 [rule: fit; pooled midpoint 0.414 (comparison)] (present 0.729, n 28 / absent 0.100, n 323)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 348)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.059, quantity 0.059, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 172 of 172)
| axis | accuracy |
|---|---|
| FULL | 0.692 |
| FULL [depth given] | 0.692 |
| FULL [depth and negation given] | 0.692 |
| FULL [presence not decided] | 0.657 |
| FULL [pooled midpoint (comparison)] | 0.436 |
| presence object: present read present | 0.961 |
| presence object: share of 'present' readings that abstain | 0.067 |
| presence object: share of true 'present' readings that abstain | 0.051 |
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
| presence source: absent read absent | 0.929 |
| presence target: absent read absent | 0.915 |
| presence style: absent read absent | 0.987 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.965 |
| presence targets: absent read absent | 0.953 |
| structure (depth, negation) | 0.907 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.942 |
| set targets: exact | 0.948 |
| predicate (surface lemma) | 0.878 |
| event type (synonym table) | 0.878 |
| role object | 0.866 |
| head object | 0.884 |
| lexical order head object | 0.762 |
| lexical bag head object | 0.785 |
| occupancy: unknown filler | 0.906 |
| role shape | 0.988 |
| head shape | 0.988 |
| lexical order head shape | 0.907 |
| lexical bag head shape | 0.988 |
| occupancy: not given | 0.989 |
| role color | 0.965 |
| head color | 0.965 |
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
| role relation | 0.977 |
| head relation | 0.977 |
| lexical order head relation | 0.866 |
| lexical bag head relation | 0.953 |
| role landmark | 0.983 |
| head landmark | 0.983 |
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
| occupancy: known filler | 0.874 |
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
| role source | 0.919 |
| head source | 0.919 |
| lexical order head source | 0.901 |
| lexical bag head source | 0.913 |
| role target | 0.907 |
| head target | 0.907 |
| lexical order head target | 0.913 |
| lexical bag head target | 0.948 |
| role style | 0.988 |
| head style | 0.988 |
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
| role targets | 0.948 |
| head targets | 0.948 |
| lexical order head targets | 0.965 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.727 |
| heads FULL (lexical order baseline) | 0.209 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.465 |
| role object [presence not decided] | 0.866 |
| role shape [presence not decided] | 0.994 |
| role color [presence not decided] | 0.959 |
| role size [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 0.924 |
| role relation [presence not decided] | 0.983 |
| role landmark [presence not decided] | 0.983 |
| role landmark2 [presence not decided] | 1.000 |
| role region [presence not decided] | 0.983 |
| role direction [presence not decided] | 0.977 |
| role amount [presence not decided] | 1.000 |
| role quantity [presence not decided] | 1.000 |
| role axis [presence not decided] | 1.000 |
| role layout [presence not decided] | 1.000 |
| role source [presence not decided] | 0.913 |
| role target [presence not decided] | 0.901 |
| role style [presence not decided] | 0.983 |
| role arrow [presence not decided] | 1.000 |
| role edge [presence not decided] | 0.988 |
| role pairing [presence not decided] | 1.000 |
| role superlative [presence not decided] | 1.000 |
| role comparison [presence not decided] | 1.000 |
| role members [presence not decided] | 0.913 |
| role targets [presence not decided] | 0.942 |
| heads FULL (model) [presence not decided] | 0.692 |
| role object [pooled midpoint (comparison)] | 0.663 |
| role shape [pooled midpoint (comparison)] | 0.977 |
| role color [pooled midpoint (comparison)] | 0.953 |
| role size [pooled midpoint (comparison)] | 1.000 |
| role name [pooled midpoint (comparison)] | 0.988 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.977 |
| role landmark [pooled midpoint (comparison)] | 0.971 |
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
| heads FULL (model) [pooled midpoint (comparison)] | 0.453 |
| presence object: present read present [pooled midpoint (comparison)] | 0.588 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 0.993 |
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
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.979 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.940 |
| presence landmark: present read present | 0.967 |
| presence landmark: share of 'present' readings that abstain | 0.033 |
| presence landmark: share of true 'present' readings that abstain | 0.034 |
| presence region: absent read absent | 0.986 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.867 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence comparison: present read present [pooled midpoint (comparison)] | 1.000 |
| presence shape: present read present | 0.933 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.867 |
| presence color: present read present [pooled midpoint (comparison)] | 0.938 |
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
| presence object: absent read absent [pooled midpoint (comparison)] | 0.943 |
| presence source: present read present | 0.867 |
| presence source: share of 'present' readings that abstain | 0.174 |
| presence source: share of true 'present' readings that abstain | 0.154 |
| presence target: share of 'present' readings that abstain | 0.130 |
| presence target: share of FALSE 'present' readings that abstain | 0.250 |
| presence members: share of 'present' readings that abstain | 0.333 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence targets: present read present | 1.000 |
| presence targets: share of 'present' readings that abstain | 0.769 |
| presence targets: share of true 'present' readings that abstain | 0.833 |
| set targets: first gold member in the decoded set | 0.833 |
| presence source: present read present [pooled midpoint (comparison)] | 0.133 |
| presence targets: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence target: present read present | 0.786 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence style: share of 'present' readings that abstain | 0.200 |
| presence style: share of FALSE 'present' readings that abstain | 0.500 |
| presence target: present read present [pooled midpoint (comparison)] | 0.357 |
| presence landmark2: present read present | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 0.462 |
| set members: first gold member in the decoded set | 0.867 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.615 |
| presence source: share of FALSE 'present' readings that abstain | 0.200 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence targets: share of FALSE 'present' readings that abstain | 0.714 |
| presence pairing: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: present read present | 1.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.400 |
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
| presence name: share of 'present' readings that abstain | 0.500 |
| presence name: share of true 'present' readings that abstain | 0.500 |
| presence name: present read present [pooled midpoint (comparison)] | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.206; status {'ok': 127, 'abstain': 29, 'no-sense': 5, 'unknown-event': 11}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.878 | 0.500 / 0.073 | 0.91 | 0.041 | 0.012 / 0.081 |
| role object | 0.842 | 0.324 / 0.049 | 0.89 | 0.088 | 0.044 / 0.070 |
| roles (pooled) | 0.858 | 0.298 / 0.024 | 0.85 | 0.035 | 0.046 / 0.107 |
| role region | 0.900 | 0.418 / 0.308 | 0.90 | 0.000 | 0.000 / 0.100 |
| role landmark | 0.935 | 0.278 / 0.073 | 0.90 | 0.000 | 0.032 / 0.065 |
| role comparison | 1.000 | 0.148 / 0.081 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 0.875 | 0.338 / 0.244 | 0.94 | 0.062 | 0.000 / 0.062 |
| role color | 0.842 | 0.357 / 0.000 | 0.84 | 0.000 | 0.000 / 0.158 |
| role size | 1.000 | 0.402 / 0.353 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.295 / 0.272 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.826 | 0.354 / 0.000 | 0.83 | 0.000 | 0.000 / 0.174 |
| role source | 0.765 | 0.102 / 0.000 | 0.65 | 0.000 | 0.118 / 0.235 |
| role targets | 0.667 | 0.031 / 0.019 | 0.17 | 0.000 | 0.500 / 0.333 |
| role target | 0.733 | 0.189 / 0.000 | 0.73 | 0.000 | 0.000 / 0.267 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role layout | 1.000 | 0.420 / 0.265 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.667 | 0.059 / 0.025 | 0.47 | 0.067 | 0.267 / 0.267 |
| role pairing | 1.000 | 0.305 / 0.168 | 1.00 | 0.000 | 0.000 / 0.000 |
| role style | 1.000 | 0.397 / 0.372 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.501 / 0.500 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.294 / 0.294 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 1.000 | 0.327 / 0.111 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.266 / 0.180 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 1.000 | 0.127 / 0.046 | 0.50 | 0.000 | 0.500 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3900)
| axis | accuracy |
|---|---|
| FULL | 0.707 |
| FULL [depth given] | 0.707 |
| FULL [depth and negation given] | 0.707 |
| presence object: present read present | 0.968 |
| presence object: share of 'present' readings that abstain | 0.027 |
| presence object: share of true 'present' readings that abstain | 0.028 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 0.992 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: present read present | 0.962 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.952 |
| presence landmark: share of 'present' readings that abstain | 0.017 |
| presence landmark: share of true 'present' readings that abstain | 0.017 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.993 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.916 |
| presence target: absent read absent | 0.930 |
| presence style: absent read absent | 0.982 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.973 |
| presence targets: absent read absent | 0.961 |
| structure (depth, negation) | 0.967 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.957 |
| set targets: exact | 0.960 |
| predicate (surface lemma) | 0.923 |
| event type (synonym table) | 0.923 |
| role object | 0.910 |
| head object | 0.927 |
| lexical order head object | 0.770 |
| lexical bag head object | 0.900 |
| occupancy: known filler | 0.909 |
| role shape | 0.993 |
| head shape | 0.993 |
| lexical order head shape | 0.900 |
| lexical bag head shape | 0.993 |
| occupancy: not given | 0.989 |
| role color | 0.980 |
| head color | 0.980 |
| lexical order head color | 0.837 |
| lexical bag head color | 0.993 |
| role size | 0.990 |
| head size | 0.990 |
| lexical order head size | 0.827 |
| lexical bag head size | 0.977 |
| role name | 0.997 |
| head name | 0.997 |
| lexical order head name | 0.937 |
| lexical bag head name | 1.000 |
| role text | 0.997 |
| head text | 0.997 |
| lexical order head text | 0.953 |
| lexical bag head text | 0.997 |
| role relation | 0.987 |
| head relation | 0.987 |
| lexical order head relation | 0.827 |
| lexical bag head relation | 0.973 |
| role landmark | 0.983 |
| head landmark | 0.983 |
| lexical order head landmark | 0.790 |
| lexical bag head landmark | 0.963 |
| role landmark2 | 0.987 |
| head landmark2 | 0.987 |
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
| role source | 0.910 |
| head source | 0.910 |
| lexical order head source | 0.907 |
| lexical bag head source | 0.977 |
| role target | 0.923 |
| head target | 0.923 |
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
| role superlative | 1.000 |
| head superlative | 1.000 |
| lexical order head superlative | 0.900 |
| lexical bag head superlative | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.997 |
| lexical bag head comparison | 1.000 |
| role members | 0.957 |
| head members | 0.957 |
| lexical order head members | 0.910 |
| lexical bag head members | 0.910 |
| role targets | 0.960 |
| head targets | 0.960 |
| lexical order head targets | 0.970 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.740 |
| heads FULL (lexical order baseline) | 0.167 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.693 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.036 |
| presence shape: share of true 'present' readings that abstain | 0.036 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.019 |
| presence size: share of true 'present' readings that abstain | 0.020 |
| presence relation: absent read absent | 0.996 |
| presence landmark: absent read absent | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.023 |
| presence color: share of true 'present' readings that abstain | 0.023 |
| presence name: present read present | 0.947 |
| presence name: share of 'present' readings that abstain | 0.222 |
| presence name: share of true 'present' readings that abstain | 0.222 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 0.952 |
| presence source: present read present | 0.821 |
| presence source: share of 'present' readings that abstain | 0.333 |
| presence source: share of true 'present' readings that abstain | 0.174 |
| presence target: present read present | 0.800 |
| presence target: share of 'present' readings that abstain | 0.229 |
| presence target: share of true 'present' readings that abstain | 0.062 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 0.938 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.500 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.118 |
| presence pairing: share of true 'present' readings that abstain | 0.118 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.353 |
| presence members: share of true 'present' readings that abstain | 0.296 |
| presence targets: share of 'present' readings that abstain | 0.842 |
| presence targets: share of FALSE 'present' readings that abstain | 1.000 |
| set members: first gold member in the decoded set | 0.926 |
| occupancy: unknown filler | 0.972 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 0.857 |
| presence style: share of 'present' readings that abstain | 0.091 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.333 |
| presence style: share of FALSE 'present' readings that abstain | 0.200 |
| presence superlative: present read present | 1.000 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence members: share of FALSE 'present' readings that abstain | 0.571 |
| presence landmark2: share of 'present' readings that abstain | 0.500 |
| presence landmark2: share of true 'present' readings that abstain | 0.500 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.368 |
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
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.157; status {'abstain': 63, 'ok': 227, 'unknown-event': 8, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.923 | 0.540 / 0.363 | 0.95 | 0.033 | 0.003 / 0.043 |
| role object | 0.887 | 0.341 / 0.101 | 0.93 | 0.067 | 0.021 / 0.046 |
| roles (pooled) | 0.890 | 0.302 / 0.035 | 0.88 | 0.033 | 0.041 / 0.077 |
| role relation | 0.942 | 0.344 / 0.159 | 0.96 | 0.019 | 0.000 / 0.038 |
| role landmark | 0.921 | 0.292 / 0.174 | 0.92 | 0.000 | 0.000 / 0.079 |
| role shape | 0.933 | 0.361 / 0.321 | 0.97 | 0.067 | 0.033 / 0.000 |
| role size | 0.981 | 0.394 / 0.307 | 0.98 | 0.019 | 0.019 / 0.000 |
| role color | 0.878 | 0.378 / 0.289 | 0.92 | 0.041 | 0.000 / 0.082 |
| role name | 0.947 | 0.176 / 0.014 | 0.74 | 0.000 | 0.211 / 0.053 |
| role quantity | 1.000 | 0.271 / 0.195 | 1.00 | 0.000 | 0.000 / 0.000 |
| role source | 0.821 | 0.119 / 0.000 | 0.68 | 0.000 | 0.143 / 0.179 |
| role target | 0.800 | 0.178 / 0.000 | 0.75 | 0.000 | 0.050 / 0.200 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role edge | 1.000 | 0.473 / 0.405 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 0.833 | 0.405 / 0.145 | 0.89 | 0.056 | 0.000 / 0.111 |
| role pairing | 1.000 | 0.335 / 0.075 | 0.88 | 0.000 | 0.118 / 0.000 |
| role members | 0.778 | 0.076 / 0.012 | 0.70 | 0.074 | 0.148 / 0.148 |
| role text | 0.929 | 0.287 / 0.242 | 0.93 | 0.000 | 0.000 / 0.071 |
| role style | 0.857 | 0.323 / 0.134 | 0.86 | 0.000 | 0.000 / 0.143 |
| role landmark2 | 0.333 | 0.017 / 0.000 | 0.17 | 0.000 | 0.167 / 0.667 |
| role superlative | 1.000 | 0.281 / 0.132 | 1.00 | 0.000 | 0.000 / 0.000 |
| role layout | 1.000 | 0.345 / 0.232 | 1.00 | 0.000 | 0.000 / 0.000 |
| role targets | 0.889 | 0.041 / 0.000 | 0.33 | 0.000 | 0.556 / 0.111 |
| role comparison | 1.000 | 0.183 / 0.183 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.403 / 0.375 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 SUPER=0.97 from=0.92 once=0.86 AXIS=0.81 pixels=0.78 rules=0.76 LAYOUT=0.73 STYLE=0.71 the=0.70 COLOR=0.69 VERB=0.69 NUM=0.64 them=0.58 NAME=0.50 reached=0.46 whole=0.46 it=0.44 then=0.44 as=0.44 ARROW=0.43 TEXT=0.41 that=0.40 do=0.32 for=0.32 DIR=0.31 last=0.29 both=0.28 we=0.27 this=0.25 what's=0.25 thing=0.23 any=0.22 are=0.21 now=0.21 have=0.20 can=0.18 exist=0.18 those=0.18 here=0.14 with=0.14 too=0.14 i=0.13 remove=0.12 NOTCOLOR=0.12 each=0.11 diagram=0.11 does=0.10 front=0.10 four=0.09 map=0.09 line=0.09 evenly=0.08 no=0.08 by=0.08 there=0.08 shapes=0.07 arrow=0.07 back=0.07 uh=0.06 two=0.06 me=0.05 directly=0.05 every=0.04 new=0.04 QUANT=0.04 PAIR=0.04 box=0.04 at=0.04 should=0.04 you=0.04 in=0.04 be=0.04 RECENT=0.04 an=0.04 not=0.04 show=0.04 check=0.03 place=0.03 give=0.03 just=0.03 if=0.03 goes=0.03 three=0.02 arrows=0.02 what=0.02 axis=0.02 link=0.02 tell=0.02 lines=0.02 on=0.02 who=0.01 unknown=0.01 has=0.01 put=0.01 one=0.01 shape=0.01 to=0.01 and=0.01 named=0.00 called=0.00 SHAPE=0.00 of=0.00 SIZE=0.00 a=0.00 labeled=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.692
- heldout_formulations: presence object: share of 'present' readings that abstain 0.067
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.051
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: predicate (surface lemma) 0.878
- heldout_formulations: event type (synonym table) 0.878
- heldout_formulations: role object 0.866
- heldout_formulations: head object 0.884
- heldout_formulations: occupancy: known filler 0.874
- heldout_formulations: heads FULL (model) 0.727
- heldout_formulations: heads FULL (lexical order baseline) 0.209
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.465
- heldout_formulations: FULL [depth given] 0.692
- heldout_formulations: FULL [depth and negation given] 0.692
- heldout_formulations: FULL [presence not decided] 0.657
- heldout_formulations: role object [presence not decided] 0.866
- heldout_formulations: heads FULL (model) [presence not decided] 0.692
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.436
- heldout_formulations: role object [pooled midpoint (comparison)] 0.663
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.453
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.588
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.033
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.034
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.867
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence shape: present read present [pooled midpoint (comparison)] 0.867
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present 0.864
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.864
- heldout_formulations: presence source: present read present 0.867
- heldout_formulations: presence source: share of 'present' readings that abstain 0.174
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.154
- heldout_formulations: presence target: share of 'present' readings that abstain 0.130
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.250
- heldout_formulations: presence members: share of 'present' readings that abstain 0.333
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.769
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.833
- heldout_formulations: set targets: first gold member in the decoded set 0.833
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.133
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_formulations: presence target: present read present 0.786
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of 'present' readings that abstain 0.200
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.500
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.357
- heldout_formulations: presence landmark2: present read present 0.000
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.462
- heldout_formulations: set members: first gold member in the decoded set 0.867
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.615
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.200
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.714
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.400
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of 'present' readings that abstain 0.500
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.500
- heldout_formulations: presence name: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.707
- train (sample): presence object: share of 'present' readings that abstain 0.027
- train (sample): presence object: share of true 'present' readings that abstain 0.028
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.017
- train (sample): presence landmark: share of true 'present' readings that abstain 0.017
- train (sample): heads FULL (model) 0.740
- train (sample): heads FULL (lexical order baseline) 0.167
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.693
- train (sample): FULL [depth given] 0.707
- train (sample): FULL [depth and negation given] 0.707
- train (sample): presence shape: share of 'present' readings that abstain 0.036
- train (sample): presence shape: share of true 'present' readings that abstain 0.036
- train (sample): presence size: share of 'present' readings that abstain 0.019
- train (sample): presence size: share of true 'present' readings that abstain 0.020
- train (sample): presence color: share of 'present' readings that abstain 0.023
- train (sample): presence color: share of true 'present' readings that abstain 0.023
- train (sample): presence name: share of 'present' readings that abstain 0.222
- train (sample): presence name: share of true 'present' readings that abstain 0.222
- train (sample): presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence source: present read present 0.821
- train (sample): presence source: share of 'present' readings that abstain 0.333
- train (sample): presence source: share of true 'present' readings that abstain 0.174
- train (sample): presence target: present read present 0.800
- train (sample): presence target: share of 'present' readings that abstain 0.229
- train (sample): presence target: share of true 'present' readings that abstain 0.062
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence pairing: share of 'present' readings that abstain 0.118
- train (sample): presence pairing: share of true 'present' readings that abstain 0.118
- train (sample): presence members: share of 'present' readings that abstain 0.353
- train (sample): presence members: share of true 'present' readings that abstain 0.296
- train (sample): presence targets: share of 'present' readings that abstain 0.842
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence style: present read present 0.857
- train (sample): presence style: share of 'present' readings that abstain 0.091
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: present read present 0.333
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.200
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.571
- train (sample): presence landmark2: share of 'present' readings that abstain 0.500
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.500
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.368
- train (sample): presence targets: present read present 0.889
- train (sample): presence targets: share of true 'present' readings that abstain 0.625
- train (sample): set targets: first gold member in the decoded set 0.889
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.000

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
| heldout_formulations | product readout: presence decided | 0.727 | 0.692 | 0.866 | 0.988 | 0.965 | 1.000 | 1.000 | 1.000 | 0.977 | 0.983 | 0.994 | 0.983 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.919 | 0.907 | 0.988 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.942 | 0.948 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.453 | 0.436 | 0.663 | 0.977 | 0.953 | 1.000 | 0.988 | 1.000 | 0.977 | 0.971 | 0.994 | 0.983 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.913 | 0.930 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.901 | 0.936 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.692 | 0.657 | 0.866 | 0.994 | 0.959 | 1.000 | 1.000 | 0.924 | 0.983 | 0.983 | 1.000 | 0.983 | 0.977 | 1.000 | 1.000 | 1.000 | 1.000 | 0.913 | 0.901 | 0.983 | 1.000 | 0.988 | 1.000 | 1.000 | 1.000 | 0.913 | 0.942 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.961 | 0.906 | 0.933 | 0.067 (0.400 / 0.051) |
| heldout_formulations | object | comparison: pooled midpoint | 0.588 | 0.943 | 0.766 |  |
| heldout_formulations | shape | product: fitted | 0.933 | 1.000 | 0.967 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.867 | 0.993 | 0.930 |  |
| heldout_formulations | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.938 | 1.000 | 0.969 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.500 (— / 0.500) |
| heldout_formulations | name | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.864 | 1.000 | 0.932 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.864 | 1.000 | 0.932 |  |
| heldout_formulations | landmark | product: fitted | 0.967 | 0.992 | 0.979 | 0.033 (0.000 / 0.034) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.867 | 1.000 | 0.933 |  |
| heldout_formulations | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | region | product: fitted | 1.000 | 0.986 | 0.993 | 0.000 (0.000 / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 1.000 | 0.986 | 0.993 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | source | product: fitted | 0.867 | 0.929 | 0.898 | 0.174 (0.200 / 0.154) |
| heldout_formulations | source | comparison: pooled midpoint | 0.133 | 1.000 | 0.567 |  |
| heldout_formulations | target | product: fitted | 0.786 | 0.915 | 0.851 | 0.130 (0.250 / 0.000) |
| heldout_formulations | target | comparison: pooled midpoint | 0.357 | 0.986 | 0.671 |  |
| heldout_formulations | style | product: fitted | 1.000 | 0.987 | 0.993 | 0.200 (0.500 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.965 | 0.983 | 0.333 (0.000 / 0.462) |
| heldout_formulations | members | comparison: pooled midpoint | 0.615 | 0.979 | 0.797 |  |
| heldout_formulations | targets | product: fitted | 1.000 | 0.953 | 0.977 | 0.769 (0.714 / 0.833) |
| heldout_formulations | targets | comparison: pooled midpoint | 1.000 | 0.940 | 0.970 |  |
| train (sample) | object | product: fitted | 0.968 | 0.952 | 0.960 | 0.027 (0.000 / 0.028) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.036 (— / 0.036) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.023 (— / 0.023) |
| train (sample) | size | product: fitted | 1.000 | 0.992 | 0.996 | 0.019 (0.000 / 0.020) |
| train (sample) | name | product: fitted | 0.947 | 1.000 | 0.974 | 0.222 (— / 0.222) |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 0.962 | 0.996 | 0.979 | 0.000 (0.000 / 0.000) |
| train (sample) | landmark | product: fitted | 0.952 | 1.000 | 0.976 | 0.017 (— / 0.017) |
| train (sample) | landmark2 | product: fitted | 0.333 | 1.000 | 0.667 | 0.500 (— / 0.500) |
| train (sample) | region | product: fitted | 0.938 | 0.993 | 0.965 | 0.000 (0.000 / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.821 | 0.916 | 0.869 | 0.333 (0.500 / 0.174) |
| train (sample) | target | product: fitted | 0.800 | 0.930 | 0.865 | 0.229 (0.368 / 0.062) |
| train (sample) | style | product: fitted | 0.857 | 0.982 | 0.920 | 0.091 (0.200 / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.118 (— / 0.118) |
| train (sample) | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.973 | 0.987 | 0.353 (0.571 / 0.296) |
| train (sample) | targets | product: fitted | 0.889 | 0.961 | 0.925 | 0.842 (1.000 / 0.625) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
