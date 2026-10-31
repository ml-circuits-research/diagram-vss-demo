# REPORT — world `real`, legend sha256:12cf77be5d58… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4282 annotated sentences from 2 files; provenance: {'llm': 4282}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/fv2_p80_D1024_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 213 sentences
- heldout_formulations: 169 sentences
- train: 3900 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
24581 tokens in the examples; 1026 with no kind in the lexicon (share 0.042), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit bced516-dirty. Memory curve: runs/fv2_p80_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.116 [rule: fit; pooled midpoint 0.283 (comparison)] (present 0.566, n 168 / absent 0.001, n 690584)
- set_member:targets: threshold 0.093 [rule: fit; pooled midpoint 0.115 (comparison)] (present 0.230, n 45 / absent -0.001, n 190715)
- presence:object: threshold 0.102 [rule: fit; pooled midpoint 0.544 (comparison)] (present 0.975, n 358 / absent 0.113, n 255)
- presence:shape: threshold 0.043 [rule: fit; pooled midpoint 0.336 (comparison)] (present 0.664, n 58 / absent 0.009, n 555)
- presence:color: threshold 0.098 [rule: fit; pooled midpoint 0.342 (comparison)] (present 0.673, n 110 / absent 0.011, n 503)
- presence:size: threshold 0.225 [rule: fit; pooled midpoint 0.353 (comparison)] (present 0.688, n 86 / absent 0.018, n 527)
- presence:name: threshold 0.222 [rule: fit; pooled midpoint 0.233 (comparison)] (present 0.465, n 17 / absent 0.002, n 596)
- presence:text: threshold 0.025 [rule: fit; pooled midpoint 0.310 (comparison)] (present 0.631, n 26 / absent -0.012, n 587)
- presence:relation: threshold 0.114 [rule: fit; pooled midpoint 0.372 (comparison)] (present 0.737, n 78 / absent 0.008, n 535)
- presence:landmark: threshold 0.156 [rule: fit; pooled midpoint 0.394 (comparison)] (present 0.764, n 109 / absent 0.023, n 504)
- presence:landmark2: threshold 0.221 [rule: fit; pooled midpoint 0.169 (comparison)] (present 0.333, n 8 / absent 0.006, n 605)
- presence:region: threshold 0.147 [rule: fit; pooled midpoint 0.300 (comparison)] (present 0.571, n 29 / absent 0.030, n 584)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 611)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 610)
- presence:quantity: threshold 0.070 [rule: fit; pooled midpoint 0.182 (comparison)] (present 0.364, n 8 / absent -0.000, n 605)
- presence:axis: threshold 0.181 [rule: fit; pooled midpoint 0.322 (comparison)] (present 0.645, n 9 / absent 0.000, n 604)
- presence:layout: threshold 0.319 [rule: fit; pooled midpoint 0.410 (comparison)] (present 0.820, n 12 / absent 0.000, n 601)
- presence:source: threshold 0.257 [rule: fit; pooled midpoint 0.353 (comparison)] (present 0.686, n 81 / absent 0.020, n 532)
- presence:target: threshold 0.240 [rule: fit; pooled midpoint 0.335 (comparison)] (present 0.645, n 57 / absent 0.025, n 556)
- presence:style: threshold 0.067 [rule: fit; pooled midpoint 0.248 (comparison)] (present 0.484, n 18 / absent 0.011, n 595)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 610)
- presence:edge: threshold 0.308 [rule: fit; pooled midpoint 0.320 (comparison)] (present 0.641, n 12 / absent 0.000, n 601)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 12)
- presence:pairing: threshold 0.430 [rule: fit; pooled midpoint 0.426 (comparison)] (present 0.844, n 35 / absent 0.008, n 578)
- presence:superlative: threshold 0.170 [rule: fit; pooled midpoint 0.433 (comparison)] (present 0.865, n 62 / absent 0.000, n 551)
- presence:comparison: threshold 0.214 [rule: fit; pooled midpoint 0.277 (comparison)] (present 0.553, n 5 / absent 0.000, n 608)
- presence:members: threshold 0.298 [rule: fit; pooled midpoint 0.482 (comparison)] (present 0.847, n 62 / absent 0.118, n 551)
- presence:targets: threshold 0.209 [rule: fit; pooled midpoint 0.162 (comparison)] (present 0.296, n 23 / absent 0.027, n 590)
- attr_presence:object: threshold 0.316 [rule: fit; pooled midpoint 0.399 (comparison)] (present 0.677, n 28 / absent 0.122, n 328)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 353)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.062, color 0.056, size 0.143, name 0.000, text 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.059, quantity 0.059, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, superlative 0.100, comparison 0.143, members 0.000, targets 0.000, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 169 of 169)
| axis | accuracy |
|---|---|
| FULL | 0.734 |
| FULL [depth given] | 0.734 |
| FULL [depth and negation given] | 0.734 |
| FULL [presence not decided] | 0.686 |
| FULL [pooled midpoint (comparison)] | 0.568 |
| presence object: present read present | 0.972 |
| presence object: share of 'present' readings that abstain | 0.065 |
| presence object: share of true 'present' readings that abstain | 0.049 |
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
| presence target: absent read absent | 0.932 |
| presence style: absent read absent | 0.994 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.966 |
| presence targets: absent read absent | 0.975 |
| structure (depth, negation) | 0.970 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.941 |
| set targets: exact | 0.964 |
| predicate (surface lemma) | 0.929 |
| event type (synonym table) | 0.929 |
| role object | 0.911 |
| head object | 0.935 |
| lexical order head object | 0.746 |
| lexical bag head object | 0.799 |
| occupancy: unknown filler | 0.908 |
| role shape | 1.000 |
| head shape | 1.000 |
| lexical order head shape | 0.911 |
| lexical bag head shape | 0.994 |
| occupancy: not given | 0.991 |
| role color | 0.970 |
| head color | 0.970 |
| lexical order head color | 0.787 |
| lexical bag head color | 0.964 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.888 |
| lexical bag head size | 0.994 |
| role name | 1.000 |
| head name | 1.000 |
| lexical order head name | 0.988 |
| lexical bag head name | 1.000 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.976 |
| lexical bag head text | 0.988 |
| role relation | 0.982 |
| head relation | 0.982 |
| lexical order head relation | 0.870 |
| lexical bag head relation | 0.959 |
| role landmark | 0.982 |
| head landmark | 0.982 |
| lexical order head landmark | 0.822 |
| lexical bag head landmark | 0.876 |
| role landmark2 | 0.994 |
| head landmark2 | 0.994 |
| lexical order head landmark2 | 0.994 |
| lexical bag head landmark2 | 0.994 |
| role region | 0.994 |
| head region | 0.994 |
| lexical order head region | 0.947 |
| lexical bag head region | 0.970 |
| occupancy: known filler | 0.906 |
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
| lexical order head layout | 0.982 |
| lexical bag head layout | 0.994 |
| role source | 0.941 |
| head source | 0.941 |
| lexical order head source | 0.893 |
| lexical bag head source | 0.923 |
| role target | 0.911 |
| head target | 0.911 |
| lexical order head target | 0.905 |
| lexical bag head target | 0.941 |
| role style | 0.994 |
| head style | 0.994 |
| lexical order head style | 0.970 |
| lexical bag head style | 0.994 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 1.000 |
| lexical bag head arrow | 1.000 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.976 |
| lexical bag head edge | 1.000 |
| role pairing | 0.988 |
| head pairing | 0.988 |
| lexical order head pairing | 0.964 |
| lexical bag head pairing | 0.988 |
| role superlative | 1.000 |
| head superlative | 1.000 |
| lexical order head superlative | 0.917 |
| lexical bag head superlative | 0.964 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.982 |
| lexical bag head comparison | 1.000 |
| role members | 0.941 |
| head members | 0.941 |
| lexical order head members | 0.905 |
| lexical bag head members | 0.905 |
| role targets | 0.964 |
| head targets | 0.964 |
| lexical order head targets | 0.964 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.781 |
| heads FULL (lexical order baseline) | 0.207 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.473 |
| role object [presence not decided] | 0.905 |
| role shape [presence not decided] | 0.994 |
| role color [presence not decided] | 0.982 |
| role size [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 0.905 |
| role relation [presence not decided] | 0.988 |
| role landmark [presence not decided] | 0.988 |
| role landmark2 [presence not decided] | 0.994 |
| role region [presence not decided] | 0.988 |
| role direction [presence not decided] | 0.970 |
| role amount [presence not decided] | 1.000 |
| role quantity [presence not decided] | 1.000 |
| role axis [presence not decided] | 1.000 |
| role layout [presence not decided] | 1.000 |
| role source [presence not decided] | 0.905 |
| role target [presence not decided] | 0.905 |
| role style [presence not decided] | 0.994 |
| role arrow [presence not decided] | 1.000 |
| role edge [presence not decided] | 1.000 |
| role pairing [presence not decided] | 1.000 |
| role superlative [presence not decided] | 1.000 |
| role comparison [presence not decided] | 1.000 |
| role members [presence not decided] | 0.893 |
| role targets [presence not decided] | 0.929 |
| heads FULL (model) [presence not decided] | 0.728 |
| role object [pooled midpoint (comparison)] | 0.751 |
| role shape [pooled midpoint (comparison)] | 0.994 |
| role color [pooled midpoint (comparison)] | 0.935 |
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
| role source [pooled midpoint (comparison)] | 0.959 |
| role target [pooled midpoint (comparison)] | 0.947 |
| role style [pooled midpoint (comparison)] | 0.994 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 0.988 |
| role superlative [pooled midpoint (comparison)] | 0.994 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.893 |
| role targets [pooled midpoint (comparison)] | 0.941 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.604 |
| presence object: present read present [pooled midpoint (comparison)] | 0.725 |
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
| presence source: absent read absent [pooled midpoint (comparison)] | 0.972 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence style: absent read absent [pooled midpoint (comparison)] | 0.994 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.948 |
| presence landmark: present read present | 0.900 |
| presence landmark: share of 'present' readings that abstain | 0.111 |
| presence landmark: share of true 'present' readings that abstain | 0.111 |
| presence region: absent read absent | 0.994 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.852 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence comparison: present read present [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.864 |
| presence relation: share of 'present' readings that abstain | 0.105 |
| presence relation: share of true 'present' readings that abstain | 0.105 |
| presence size: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.789 |
| presence object: absent read absent | 0.914 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.930 |
| presence color: present read present | 0.912 |
| presence color: share of 'present' readings that abstain | 0.065 |
| presence color: share of true 'present' readings that abstain | 0.065 |
| presence color: present read present [pooled midpoint (comparison)] | 0.735 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.067 |
| presence shape: share of true 'present' readings that abstain | 0.067 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.933 |
| presence source: present read present | 0.889 |
| presence source: share of 'present' readings that abstain | 0.565 |
| presence source: share of true 'present' readings that abstain | 0.438 |
| presence target: share of 'present' readings that abstain | 0.333 |
| presence target: share of FALSE 'present' readings that abstain | 0.600 |
| presence members: share of 'present' readings that abstain | 0.556 |
| presence members: share of FALSE 'present' readings that abstain | 0.600 |
| presence targets: present read present | 1.000 |
| presence targets: share of 'present' readings that abstain | 0.800 |
| presence targets: share of true 'present' readings that abstain | 0.833 |
| set targets: first gold member in the decoded set | 0.833 |
| presence source: present read present [pooled midpoint (comparison)] | 0.882 |
| presence targets: present read present [pooled midpoint (comparison)] | 1.000 |
| presence target: present read present | 0.688 |
| presence target: share of true 'present' readings that abstain | 0.091 |
| presence target: present read present [pooled midpoint (comparison)] | 0.600 |
| presence landmark2: present read present | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.867 |
| presence members: share of true 'present' readings that abstain | 0.538 |
| set members: first gold member in the decoded set | 0.812 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.667 |
| presence source: share of FALSE 'present' readings that abstain | 0.857 |
| presence pairing: present read present | 0.667 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.667 |
| presence targets: share of FALSE 'present' readings that abstain | 0.750 |
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
| presence object: share of FALSE 'present' readings that abstain | 0.400 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.179; status {'ok': 123, 'abstain': 41, 'no-sense': 2, 'unknown-event': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.929 | 0.437 / 0.206 | 0.96 | 0.041 | 0.006 / 0.030 |
| role object | 0.908 | 0.254 / 0.052 | 0.92 | 0.055 | 0.046 / 0.037 |
| roles (pooled) | 0.880 | 0.219 / 0.013 | 0.82 | 0.020 | 0.082 / 0.099 |
| role region | 1.000 | 0.354 / 0.303 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark | 0.900 | 0.169 / 0.011 | 0.80 | 0.000 | 0.100 / 0.100 |
| role comparison | 1.000 | 0.266 / 0.229 | 1.00 | 0.000 | 0.000 / 0.000 |
| role size | 1.000 | 0.314 / 0.274 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.205 / 0.182 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.864 | 0.220 / 0.001 | 0.77 | 0.000 | 0.091 / 0.136 |
| role color | 0.861 | 0.229 / 0.020 | 0.83 | 0.028 | 0.056 / 0.111 |
| role shape | 1.000 | 0.236 / 0.141 | 0.93 | 0.000 | 0.067 / 0.000 |
| role source | 0.833 | 0.082 / 0.005 | 0.50 | 0.000 | 0.333 / 0.167 |
| role targets | 0.667 | 0.035 / 0.014 | 0.17 | 0.000 | 0.500 / 0.333 |
| role target | 0.688 | 0.095 / 0.000 | 0.62 | 0.000 | 0.062 / 0.312 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role style | 1.000 | 0.267 / 0.245 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.316 / 0.297 | 1.00 | 0.000 | 0.000 / 0.000 |
| role layout | 1.000 | 0.275 / 0.123 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.688 | 0.034 / 0.000 | 0.38 | 0.000 | 0.312 / 0.312 |
| role pairing | 0.667 | 0.138 / 0.000 | 0.67 | 0.000 | 0.000 / 0.333 |
| role axis | 1.000 | 0.208 / 0.208 | 1.00 | 0.000 | 0.000 / 0.000 |
| role superlative | 1.000 | 0.463 / 0.364 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.077 / 0.072 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role name | 1.000 | 0.161 / 0.083 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3900)
| axis | accuracy |
|---|---|
| FULL | 0.720 |
| FULL [depth given] | 0.720 |
| FULL [depth and negation given] | 0.720 |
| presence object: present read present | 0.953 |
| presence object: share of 'present' readings that abstain | 0.060 |
| presence object: share of true 'present' readings that abstain | 0.061 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.996 |
| presence size: absent read absent | 0.992 |
| presence name: absent read absent | 0.996 |
| presence text: absent read absent | 0.996 |
| presence relation: present read present | 0.922 |
| presence relation: share of 'present' readings that abstain | 0.064 |
| presence relation: share of true 'present' readings that abstain | 0.064 |
| presence landmark: present read present | 0.934 |
| presence landmark: share of 'present' readings that abstain | 0.102 |
| presence landmark: share of true 'present' readings that abstain | 0.070 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.989 |
| presence region: share of 'present' readings that abstain | 0.100 |
| presence region: share of FALSE 'present' readings that abstain | 0.333 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.955 |
| presence target: absent read absent | 0.938 |
| presence style: absent read absent | 0.979 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence members: absent read absent | 0.963 |
| presence targets: absent read absent | 0.979 |
| structure (depth, negation) | 0.983 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.943 |
| set targets: exact | 0.970 |
| predicate (surface lemma) | 0.943 |
| event type (synonym table) | 0.943 |
| role object | 0.910 |
| head object | 0.943 |
| lexical order head object | 0.770 |
| lexical bag head object | 0.900 |
| occupancy: known filler | 0.911 |
| role shape | 0.997 |
| head shape | 0.997 |
| lexical order head shape | 0.900 |
| lexical bag head shape | 0.993 |
| occupancy: not given | 0.991 |
| role color | 0.980 |
| head color | 0.980 |
| lexical order head color | 0.837 |
| lexical bag head color | 1.000 |
| role size | 0.983 |
| head size | 0.983 |
| lexical order head size | 0.827 |
| lexical bag head size | 0.977 |
| role name | 0.997 |
| head name | 0.997 |
| lexical order head name | 0.937 |
| lexical bag head name | 1.000 |
| role text | 0.997 |
| head text | 0.997 |
| lexical order head text | 0.953 |
| lexical bag head text | 1.000 |
| role relation | 0.980 |
| head relation | 0.980 |
| lexical order head relation | 0.827 |
| lexical bag head relation | 0.977 |
| role landmark | 0.970 |
| head landmark | 0.970 |
| lexical order head landmark | 0.790 |
| lexical bag head landmark | 0.967 |
| role landmark2 | 0.997 |
| head landmark2 | 0.997 |
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
| role source | 0.943 |
| head source | 0.943 |
| lexical order head source | 0.907 |
| lexical bag head source | 0.977 |
| role target | 0.927 |
| head target | 0.927 |
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
| role pairing | 0.993 |
| head pairing | 0.993 |
| lexical order head pairing | 0.943 |
| lexical bag head pairing | 0.993 |
| role superlative | 0.997 |
| head superlative | 0.997 |
| lexical order head superlative | 0.900 |
| lexical bag head superlative | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.997 |
| lexical bag head comparison | 1.000 |
| role members | 0.943 |
| head members | 0.943 |
| lexical order head members | 0.910 |
| lexical bag head members | 0.910 |
| role targets | 0.970 |
| head targets | 0.970 |
| lexical order head targets | 0.970 |
| lexical bag head targets | 0.953 |
| heads FULL (model) | 0.770 |
| heads FULL (lexical order baseline) | 0.167 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.710 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.069 |
| presence shape: share of true 'present' readings that abstain | 0.069 |
| presence size: present read present | 0.980 |
| presence size: share of 'present' readings that abstain | 0.038 |
| presence size: share of true 'present' readings that abstain | 0.040 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.991 |
| presence color: present read present | 0.938 |
| presence color: share of 'present' readings that abstain | 0.065 |
| presence color: share of true 'present' readings that abstain | 0.067 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.050 |
| presence name: share of true 'present' readings that abstain | 0.053 |
| presence size: share of FALSE 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.250 |
| presence quantity: share of true 'present' readings that abstain | 0.250 |
| presence object: absent read absent | 0.971 |
| presence source: present read present | 0.821 |
| presence source: share of 'present' readings that abstain | 0.371 |
| presence source: share of true 'present' readings that abstain | 0.174 |
| presence target: present read present | 0.750 |
| presence target: share of 'present' readings that abstain | 0.406 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of true 'present' readings that abstain | 0.059 |
| presence pairing: present read present | 0.882 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.963 |
| presence members: share of 'present' readings that abstain | 0.333 |
| presence members: share of true 'present' readings that abstain | 0.231 |
| set members: first gold member in the decoded set | 0.815 |
| occupancy: unknown filler | 0.944 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.067 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 0.857 |
| presence style: share of 'present' readings that abstain | 0.083 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.833 |
| presence landmark2: share of 'present' readings that abstain | 1.000 |
| presence landmark2: share of true 'present' readings that abstain | 1.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.167 |
| presence source: share of FALSE 'present' readings that abstain | 0.750 |
| presence superlative: present read present | 0.967 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence members: share of FALSE 'present' readings that abstain | 0.600 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.765 |
| presence targets: present read present | 0.889 |
| presence targets: share of 'present' readings that abstain | 0.643 |
| presence targets: share of true 'present' readings that abstain | 0.500 |
| set targets: first gold member in the decoded set | 0.889 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence targets: share of FALSE 'present' readings that abstain | 0.833 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence text: share of FALSE 'present' readings that abstain | 1.000 |
| presence name: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 1.000 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.159; status {'abstain': 67, 'ok': 228, 'unknown-event': 3, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.943 | 0.458 / 0.313 | 0.98 | 0.037 | 0.000 / 0.020 |
| role object | 0.877 | 0.254 / 0.043 | 0.89 | 0.062 | 0.051 / 0.062 |
| roles (pooled) | 0.879 | 0.224 / 0.013 | 0.85 | 0.024 | 0.056 / 0.097 |
| role relation | 0.885 | 0.220 / 0.009 | 0.85 | 0.019 | 0.058 / 0.096 |
| role landmark | 0.889 | 0.190 / 0.002 | 0.84 | 0.000 | 0.048 / 0.111 |
| role shape | 0.967 | 0.238 / 0.149 | 0.90 | 0.000 | 0.067 / 0.033 |
| role size | 0.942 | 0.269 / 0.159 | 0.92 | 0.000 | 0.019 / 0.058 |
| role color | 0.898 | 0.243 / 0.015 | 0.86 | 0.000 | 0.041 / 0.102 |
| role name | 1.000 | 0.179 / 0.067 | 0.95 | 0.000 | 0.053 / 0.000 |
| role quantity | 1.000 | 0.079 / 0.047 | 0.75 | 0.000 | 0.250 / 0.000 |
| role source | 0.821 | 0.094 / 0.000 | 0.68 | 0.000 | 0.143 / 0.179 |
| role target | 0.750 | 0.131 / 0.000 | 0.75 | 0.000 | 0.000 / 0.250 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role edge | 1.000 | 0.319 / 0.296 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 0.944 | 0.334 / 0.230 | 0.94 | 0.056 | 0.056 / 0.000 |
| role pairing | 0.882 | 0.241 / 0.068 | 0.88 | 0.000 | 0.000 / 0.118 |
| role members | 0.741 | 0.074 / 0.018 | 0.74 | 0.074 | 0.074 / 0.185 |
| role text | 1.000 | 0.208 / 0.161 | 1.00 | 0.000 | 0.000 / 0.000 |
| role style | 0.857 | 0.215 / 0.084 | 0.86 | 0.000 | 0.000 / 0.143 |
| role landmark2 | 0.833 | 0.015 / 0.006 | 0.00 | 0.000 | 0.833 / 0.167 |
| role superlative | 0.967 | 0.407 / 0.087 | 0.97 | 0.000 | 0.000 / 0.033 |
| role layout | 1.000 | 0.269 / 0.126 | 1.00 | 0.000 | 0.000 / 0.000 |
| role targets | 0.667 | 0.040 / 0.003 | 0.44 | 0.000 | 0.222 / 0.333 |
| role comparison | 1.000 | 0.313 / 0.313 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.309 / 0.292 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 COLOR=0.98 SUPER=0.98 AXIS=0.94 LAYOUT=0.92 once=0.88 rules=0.86 pixels=0.83 NUM=0.73 TEXT=0.73 have=0.68 them=0.63 NAME=0.60 it=0.60 whole=0.58 PAIR=0.57 last=0.50 there=0.47 VERB=0.45 SHAPE=0.44 as=0.38 thing=0.38 for=0.36 any=0.34 STYLE=0.34 diagram=0.33 with=0.31 we=0.30 exist=0.26 that=0.25 map=0.24 ARROW=0.22 now=0.21 those=0.21 this=0.20 DIR=0.19 each=0.17 are=0.16 i=0.16 do=0.14 line=0.14 here=0.13 remove=0.13 NOTCOLOR=0.12 no=0.11 too=0.10 four=0.10 both=0.10 evenly=0.08 check=0.08 show=0.07 directly=0.07 at=0.07 by=0.07 uh=0.06 shapes=0.06 two=0.06 box=0.06 front=0.05 axis=0.05 me=0.04 what=0.04 back=0.04 arrow=0.04 what's=0.04 just=0.03 three=0.03 place=0.03 if=0.03 give=0.03 you=0.03 arrows=0.03 in=0.03 goes=0.03 an=0.03 the=0.02 has=0.02 lines=0.02 link=0.02 from=0.02 on=0.02 new=0.02 colour=0.02 then=0.02 should=0.02 does=0.02 who=0.02 RECENT=0.02 tell=0.02 can=0.02 not=0.01 every=0.01 QUANT=0.01 shape=0.01 put=0.01 be=0.01 one=0.01 unknown=0.01 of=0.01 named=0.01 and=0.00 SIZE=0.00 called=0.00 labeled=0.00 to=0.00 a=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.734
- heldout_formulations: presence object: share of 'present' readings that abstain 0.065
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.049
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: heads FULL (model) 0.781
- heldout_formulations: heads FULL (lexical order baseline) 0.207
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.473
- heldout_formulations: FULL [depth given] 0.734
- heldout_formulations: FULL [depth and negation given] 0.734
- heldout_formulations: FULL [presence not decided] 0.686
- heldout_formulations: role members [presence not decided] 0.893
- heldout_formulations: heads FULL (model) [presence not decided] 0.728
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.568
- heldout_formulations: role object [pooled midpoint (comparison)] 0.751
- heldout_formulations: role members [pooled midpoint (comparison)] 0.893
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.604
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.725
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.111
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.111
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.852
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present 0.864
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.105
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.105
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.789
- heldout_formulations: presence color: share of 'present' readings that abstain 0.065
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.065
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.735
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.067
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.067
- heldout_formulations: presence source: present read present 0.889
- heldout_formulations: presence source: share of 'present' readings that abstain 0.565
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.438
- heldout_formulations: presence target: share of 'present' readings that abstain 0.333
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.600
- heldout_formulations: presence members: share of 'present' readings that abstain 0.556
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.600
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.800
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.833
- heldout_formulations: set targets: first gold member in the decoded set 0.833
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.882
- heldout_formulations: presence target: present read present 0.688
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.091
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.600
- heldout_formulations: presence landmark2: present read present 0.000
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of 'present' readings that abstain 0.000
- heldout_formulations: presence layout: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present 0.867
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.538
- heldout_formulations: set members: first gold member in the decoded set 0.812
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.857
- heldout_formulations: presence pairing: present read present 0.667
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.750
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.000
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.400
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.720
- train (sample): presence object: share of 'present' readings that abstain 0.060
- train (sample): presence object: share of true 'present' readings that abstain 0.061
- train (sample): presence relation: share of 'present' readings that abstain 0.064
- train (sample): presence relation: share of true 'present' readings that abstain 0.064
- train (sample): presence landmark: share of 'present' readings that abstain 0.102
- train (sample): presence landmark: share of true 'present' readings that abstain 0.070
- train (sample): presence region: share of 'present' readings that abstain 0.100
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.333
- train (sample): heads FULL (model) 0.770
- train (sample): heads FULL (lexical order baseline) 0.167
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.710
- train (sample): FULL [depth given] 0.720
- train (sample): FULL [depth and negation given] 0.720
- train (sample): presence shape: share of 'present' readings that abstain 0.069
- train (sample): presence shape: share of true 'present' readings that abstain 0.069
- train (sample): presence size: share of 'present' readings that abstain 0.038
- train (sample): presence size: share of true 'present' readings that abstain 0.040
- train (sample): presence color: share of 'present' readings that abstain 0.065
- train (sample): presence color: share of true 'present' readings that abstain 0.067
- train (sample): presence name: share of 'present' readings that abstain 0.050
- train (sample): presence name: share of true 'present' readings that abstain 0.053
- train (sample): presence size: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.250
- train (sample): presence quantity: share of true 'present' readings that abstain 0.250
- train (sample): presence source: present read present 0.821
- train (sample): presence source: share of 'present' readings that abstain 0.371
- train (sample): presence source: share of true 'present' readings that abstain 0.174
- train (sample): presence target: present read present 0.750
- train (sample): presence target: share of 'present' readings that abstain 0.406
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.059
- train (sample): presence pairing: present read present 0.882
- train (sample): presence pairing: share of 'present' readings that abstain 0.000
- train (sample): presence pairing: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.333
- train (sample): presence members: share of true 'present' readings that abstain 0.231
- train (sample): set members: first gold member in the decoded set 0.815
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.067
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence style: present read present 0.857
- train (sample): presence style: share of 'present' readings that abstain 0.083
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: present read present 0.833
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.167
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.750
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.600
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.765
- train (sample): presence targets: present read present 0.889
- train (sample): presence targets: share of 'present' readings that abstain 0.643
- train (sample): presence targets: share of true 'present' readings that abstain 0.500
- train (sample): set targets: first gold member in the decoded set 0.889
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.833
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence name: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence color: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `connect NAME to NAME and NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME and NAME to NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME PAIR NAME to NAME` FULL 0.000 (n 2)
- heldout_formulations: `make QUANT SHAPE COLOR` FULL 0.000 (n 1)
- heldout_formulations: `make QUANT SHAPE to COLOR` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role direction | role amount | role quantity | role axis | role layout | role source | role target | role style | role arrow | role edge | role pairing | role superlative | role comparison | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.781 | 0.734 | 0.911 | 1.000 | 0.970 | 1.000 | 1.000 | 1.000 | 0.982 | 0.982 | 0.994 | 0.994 | 0.994 | 0.994 | 1.000 | 1.000 | 1.000 | 0.941 | 0.911 | 0.994 | 1.000 | 1.000 | 0.988 | 1.000 | 1.000 | 0.941 | 0.964 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.604 | 0.568 | 0.751 | 0.994 | 0.935 | 1.000 | 1.000 | 1.000 | 0.959 | 0.959 | 0.994 | 0.994 | 0.994 | 0.994 | 0.988 | 1.000 | 1.000 | 0.959 | 0.947 | 0.994 | 1.000 | 1.000 | 0.988 | 0.994 | 1.000 | 0.893 | 0.941 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.728 | 0.686 | 0.905 | 0.994 | 0.982 | 1.000 | 1.000 | 0.905 | 0.988 | 0.988 | 0.994 | 0.988 | 0.970 | 1.000 | 1.000 | 1.000 | 1.000 | 0.905 | 0.905 | 0.994 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.893 | 0.929 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.972 | 0.914 | 0.943 | 0.065 (0.400 / 0.049) |
| heldout_formulations | object | comparison: pooled midpoint | 0.725 | 0.930 | 0.828 |  |
| heldout_formulations | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.067 (— / 0.067) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_formulations | color | product: fitted | 0.912 | 1.000 | 0.956 | 0.065 (— / 0.065) |
| heldout_formulations | color | comparison: pooled midpoint | 0.735 | 1.000 | 0.868 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.864 | 1.000 | 0.932 | 0.105 (— / 0.105) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.789 | 1.000 | 0.895 |  |
| heldout_formulations | landmark | product: fitted | 0.900 | 1.000 | 0.950 | 0.111 (— / 0.111) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.852 | 1.000 | 0.926 |  |
| heldout_formulations | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | region | product: fitted | 1.000 | 0.994 | 0.997 | 0.000 (0.000 / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 1.000 | 0.993 | 0.997 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | layout | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | source | product: fitted | 0.889 | 0.952 | 0.920 | 0.565 (0.857 / 0.438) |
| heldout_formulations | source | comparison: pooled midpoint | 0.882 | 0.972 | 0.927 |  |
| heldout_formulations | target | product: fitted | 0.688 | 0.932 | 0.810 | 0.333 (0.600 / 0.091) |
| heldout_formulations | target | comparison: pooled midpoint | 0.600 | 0.986 | 0.793 |  |
| heldout_formulations | style | product: fitted | 1.000 | 0.994 | 0.997 | 0.000 (0.000 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 0.994 | 0.997 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | superlative | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | superlative | comparison: pooled midpoint | 0.929 | 1.000 | 0.964 |  |
| heldout_formulations | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 0.867 | 0.966 | 0.917 | 0.556 (0.600 / 0.538) |
| heldout_formulations | members | comparison: pooled midpoint | 0.667 | 0.986 | 0.826 |  |
| heldout_formulations | targets | product: fitted | 1.000 | 0.975 | 0.987 | 0.800 (0.750 / 0.833) |
| heldout_formulations | targets | comparison: pooled midpoint | 1.000 | 0.948 | 0.974 |  |
| train (sample) | object | product: fitted | 0.953 | 0.971 | 0.962 | 0.060 (0.000 / 0.061) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.069 (— / 0.069) |
| train (sample) | color | product: fitted | 0.938 | 0.996 | 0.967 | 0.065 (0.000 / 0.067) |
| train (sample) | size | product: fitted | 0.980 | 0.992 | 0.986 | 0.038 (0.000 / 0.040) |
| train (sample) | name | product: fitted | 1.000 | 0.996 | 0.998 | 0.050 (0.000 / 0.053) |
| train (sample) | text | product: fitted | 1.000 | 0.996 | 0.998 | 0.067 (1.000 / 0.000) |
| train (sample) | relation | product: fitted | 0.922 | 1.000 | 0.961 | 0.064 (— / 0.064) |
| train (sample) | landmark | product: fitted | 0.934 | 0.991 | 0.963 | 0.102 (1.000 / 0.070) |
| train (sample) | landmark2 | product: fitted | 0.833 | 1.000 | 0.917 | 1.000 (— / 1.000) |
| train (sample) | region | product: fitted | 1.000 | 0.989 | 0.995 | 0.100 (0.333 / 0.059) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.250 (— / 0.250) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.821 | 0.955 | 0.888 | 0.371 (0.750 / 0.174) |
| train (sample) | target | product: fitted | 0.750 | 0.938 | 0.844 | 0.406 (0.765 / 0.000) |
| train (sample) | style | product: fitted | 0.857 | 0.979 | 0.918 | 0.083 (0.167 / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 0.882 | 1.000 | 0.941 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 0.967 | 1.000 | 0.983 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 0.963 | 0.963 | 0.963 | 0.333 (0.600 / 0.231) |
| train (sample) | targets | product: fitted | 0.889 | 0.979 | 0.934 | 0.643 (0.833 / 0.500) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
