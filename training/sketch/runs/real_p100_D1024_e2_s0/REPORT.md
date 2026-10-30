# REPORT — world `real`, legend sha256:4bac6d9ff633… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
5341 annotated sentences from 1 files; provenance: {'llm': 5341}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/real_p100_D1024_e2_s0/splits.json before training; source: split_hints.json)
- heldout_sentences: 571 sentences
- train: 4770 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 10% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
29265 tokens in the examples; 555 with no kind in the lexicon (share 0.019), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 08023a3. Memory curve: runs/real_p100_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.251 [rule: fit; pooled midpoint 1.033 (comparison)] (present 1.857, n 263 / absent 0.209, n 137)
- presence:shape: threshold 0.311 [rule: fit; pooled midpoint 0.395 (comparison)] (present 0.772, n 45 / absent 0.018, n 355)
- presence:color: threshold 0.081 [rule: fit; pooled midpoint 0.506 (comparison)] (present 0.991, n 85 / absent 0.020, n 315)
- presence:size: threshold 0.238 [rule: fit; pooled midpoint 0.369 (comparison)] (present 0.692, n 78 / absent 0.047, n 322)
- presence:name: threshold 0.061 [rule: fit; pooled midpoint 0.553 (comparison)] (present 1.110, n 10 / absent -0.003, n 390)
- presence:text: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 397)
- presence:relation: threshold 0.223 [rule: fit; pooled midpoint 0.426 (comparison)] (present 0.851, n 44 / absent 0.002, n 356)
- presence:landmark: threshold 0.193 [rule: fit; pooled midpoint 0.478 (comparison)] (present 0.896, n 75 / absent 0.061, n 325)
- presence:landmark2: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:region: threshold 0.196 [rule: fit; pooled midpoint 0.181 (comparison)] (present 0.344, n 29 / absent 0.019, n 371)
- presence:direction: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 400)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 400)
- presence:quantity: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:axis: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:layout: threshold 0.168 [rule: fit; pooled midpoint 0.268 (comparison)] (present 0.534, n 8 / absent 0.002, n 392)
- presence:source: threshold 0.280 [rule: fit; pooled midpoint 0.561 (comparison)] (present 1.120, n 70 / absent 0.002, n 330)
- presence:target: threshold 0.191 [rule: fit; pooled midpoint 0.420 (comparison)] (present 0.820, n 52 / absent 0.019, n 348)
- presence:style: threshold 0.442 [rule: fit; pooled midpoint 0.634 (comparison)] (present 1.254, n 8 / absent 0.014, n 392)
- presence:arrow: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 398)
- presence:edge: threshold 0.584 [rule: fit; pooled midpoint 0.593 (comparison)] (present 1.173, n 13 / absent 0.014, n 387)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 13)
- presence:pairing: threshold 0.452 [rule: fit; pooled midpoint 0.987 (comparison)] (present 1.973, n 12 / absent 0.002, n 388)
- presence:notcolor: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 396)
- presence:depth: threshold 0.157 [rule: fit; pooled midpoint 0.176 (comparison)] (present 0.347, n 11 / absent 0.004, n 389)
- presence:superlative: threshold 0.120 [rule: fit; pooled midpoint 0.347 (comparison)] (present 0.694, n 35 / absent 0.000, n 365)
- presence:comparison: threshold 0.439 [rule: fit; pooled midpoint 0.379 (comparison)] (present 0.758, n 10 / absent 0.001, n 390)
- attr_presence:object: threshold 0.464 [rule: fit; pooled midpoint 0.446 (comparison)] (present 0.767, n 22 / absent 0.125, n 232)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 250)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, shape 0.056, color 0.056, size 0.143, name 0.000, text 0.020, relation 0.167, landmark 0.000, landmark2 0.000, region 0.111, direction 0.250, amount 0.048, quantity 0.048, axis 0.500, layout 0.250, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.333, pairing 0.333, notcolor 0.056, depth 0.500, superlative 0.100, comparison 0.143, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_sentences — catalog candidates (n = 571 of 571)
| axis | accuracy |
|---|---|
| FULL | 0.615 |
| FULL [depth given] | 0.615 |
| FULL [depth and negation given] | 0.615 |
| FULL [pooled midpoint (comparison)] | 0.268 |
| presence object: absent read absent | 0.929 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.998 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 0.992 |
| presence relation: absent read absent | 0.995 |
| presence landmark: absent read absent | 0.992 |
| presence region: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: present read present | 0.878 |
| presence source: share of 'present' readings that abstain | 0.037 |
| presence source: share of true 'present' readings that abstain | 0.025 |
| presence target: present read present | 0.896 |
| presence target: share of 'present' readings that abstain | 0.045 |
| presence target: share of true 'present' readings that abstain | 0.050 |
| presence style: present read present | 0.818 |
| presence style: share of 'present' readings that abstain | 0.800 |
| presence style: share of true 'present' readings that abstain | 0.778 |
| presence edge: present read present | 0.933 |
| presence edge: share of 'present' readings that abstain | 0.071 |
| presence edge: share of true 'present' readings that abstain | 0.071 |
| presence pairing: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.876 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.821 |
| event type (synonym table) | 0.821 |
| role object | 0.795 |
| head object | 0.809 |
| lexical order head object | 0.786 |
| lexical bag head object | 0.765 |
| occupancy: not given | 0.998 |
| role shape | 0.989 |
| head shape | 0.989 |
| lexical order head shape | 0.895 |
| lexical bag head shape | 0.991 |
| role color | 0.972 |
| head color | 0.972 |
| lexical order head color | 0.828 |
| lexical bag head color | 0.975 |
| role size | 0.986 |
| head size | 0.986 |
| lexical order head size | 0.832 |
| lexical bag head size | 0.974 |
| role name | 0.988 |
| head name | 0.988 |
| lexical order head name | 0.956 |
| lexical bag head name | 0.979 |
| role text | 0.993 |
| head text | 0.993 |
| lexical order head text | 0.993 |
| lexical bag head text | 0.996 |
| role relation | 0.970 |
| head relation | 0.970 |
| lexical order head relation | 0.842 |
| lexical bag head relation | 0.975 |
| role landmark | 0.963 |
| head landmark | 0.963 |
| lexical order head landmark | 0.783 |
| lexical bag head landmark | 0.879 |
| role landmark2 | 0.981 |
| head landmark2 | 0.981 |
| lexical order head landmark2 | 0.981 |
| lexical bag head landmark2 | 0.988 |
| role region | 0.968 |
| head region | 0.968 |
| lexical order head region | 0.944 |
| lexical bag head region | 0.977 |
| role direction | 0.996 |
| head direction | 0.996 |
| lexical order head direction | 0.996 |
| lexical bag head direction | 0.998 |
| role amount | 0.996 |
| head amount | 0.996 |
| lexical order head amount | 0.996 |
| lexical bag head amount | 0.998 |
| role quantity | 0.993 |
| head quantity | 0.993 |
| lexical order head quantity | 0.993 |
| lexical bag head quantity | 1.000 |
| role axis | 0.984 |
| head axis | 0.984 |
| lexical order head axis | 0.984 |
| lexical bag head axis | 0.996 |
| role layout | 0.995 |
| head layout | 0.995 |
| lexical order head layout | 0.984 |
| lexical bag head layout | 0.995 |
| role source | 0.954 |
| head source | 0.954 |
| lexical order head source | 0.828 |
| lexical bag head source | 0.912 |
| occupancy: known filler | 0.780 |
| role target | 0.960 |
| head target | 0.960 |
| lexical order head target | 0.874 |
| lexical bag head target | 0.900 |
| role style | 0.993 |
| head style | 0.993 |
| lexical order head style | 0.979 |
| lexical bag head style | 0.975 |
| role arrow | 0.998 |
| head arrow | 0.998 |
| lexical order head arrow | 0.998 |
| lexical bag head arrow | 0.998 |
| role edge | 0.996 |
| head edge | 0.996 |
| lexical order head edge | 0.972 |
| lexical bag head edge | 0.979 |
| role pairing | 0.981 |
| head pairing | 0.981 |
| lexical order head pairing | 0.960 |
| lexical bag head pairing | 0.984 |
| role notcolor | 0.989 |
| head notcolor | 0.989 |
| lexical order head notcolor | 0.989 |
| lexical bag head notcolor | 0.993 |
| role depth | 0.989 |
| head depth | 0.989 |
| lexical order head depth | 0.979 |
| lexical bag head depth | 0.998 |
| role superlative | 0.986 |
| head superlative | 0.986 |
| lexical order head superlative | 0.895 |
| lexical bag head superlative | 0.965 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.970 |
| lexical bag head comparison | 0.996 |
| heads FULL (model) | 0.644 |
| heads FULL (lexical order baseline) | 0.152 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.464 |
| role object [pooled midpoint (comparison)] | 0.452 |
| role shape [pooled midpoint (comparison)] | 0.989 |
| role color [pooled midpoint (comparison)] | 0.946 |
| role size [pooled midpoint (comparison)] | 0.984 |
| role name [pooled midpoint (comparison)] | 0.982 |
| role text [pooled midpoint (comparison)] | 0.993 |
| role relation [pooled midpoint (comparison)] | 0.949 |
| role landmark [pooled midpoint (comparison)] | 0.937 |
| role landmark2 [pooled midpoint (comparison)] | 0.981 |
| role region [pooled midpoint (comparison)] | 0.968 |
| role direction [pooled midpoint (comparison)] | 0.996 |
| role amount [pooled midpoint (comparison)] | 0.996 |
| role quantity [pooled midpoint (comparison)] | 0.993 |
| role axis [pooled midpoint (comparison)] | 0.984 |
| role layout [pooled midpoint (comparison)] | 0.993 |
| role source [pooled midpoint (comparison)] | 0.953 |
| role target [pooled midpoint (comparison)] | 0.967 |
| role style [pooled midpoint (comparison)] | 0.982 |
| role arrow [pooled midpoint (comparison)] | 0.998 |
| role edge [pooled midpoint (comparison)] | 0.996 |
| role pairing [pooled midpoint (comparison)] | 0.960 |
| role notcolor [pooled midpoint (comparison)] | 0.989 |
| role depth [pooled midpoint (comparison)] | 0.989 |
| role superlative [pooled midpoint (comparison)] | 0.986 |
| role comparison [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.284 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 0.998 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 0.998 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 0.992 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.809 |
| presence target: present read present [pooled midpoint (comparison)] | 0.894 |
| presence style: present read present [pooled midpoint (comparison)] | 0.182 |
| presence edge: present read present [pooled midpoint (comparison)] | 0.933 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence depth: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: present read present | 0.869 |
| presence object: share of 'present' readings that abstain | 0.039 |
| presence object: share of true 'present' readings that abstain | 0.037 |
| presence size: present read present | 0.967 |
| presence size: share of 'present' readings that abstain | 0.011 |
| presence size: share of true 'present' readings that abstain | 0.011 |
| presence name: present read present | 0.957 |
| presence name: share of 'present' readings that abstain | 0.115 |
| presence name: share of true 'present' readings that abstain | 0.045 |
| presence relation: present read present | 0.949 |
| presence relation: share of 'present' readings that abstain | 0.026 |
| presence relation: share of true 'present' readings that abstain | 0.027 |
| presence landmark: present read present | 0.946 |
| presence landmark: share of 'present' readings that abstain | 0.046 |
| presence landmark: share of true 'present' readings that abstain | 0.028 |
| presence source: absent read absent | 0.998 |
| presence target: absent read absent | 0.986 |
| presence style: absent read absent | 0.998 |
| presence edge: absent read absent | 1.000 |
| occupancy: unknown filler | 0.762 |
| presence object: present read present [pooled midpoint (comparison)] | 0.248 |
| presence size: present read present [pooled midpoint (comparison)] | 0.956 |
| presence name: present read present [pooled midpoint (comparison)] | 0.652 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.785 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.821 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.986 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present [pooled midpoint (comparison)] | 1.000 |
| presence shape: present read present | 0.964 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.964 |
| presence pairing: present read present | 0.800 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.000 |
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.667 |
| presence color: present read present | 0.933 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.764 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.143 |
| presence region: share of true 'present' readings that abstain | 0.143 |
| presence region: present read present [pooled midpoint (comparison)] | 1.000 |
| presence superlative: present read present | 0.912 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.929 |
| presence object: share of FALSE 'present' readings that abstain | 0.091 |
| presence layout: present read present | 0.857 |
| presence layout: share of 'present' readings that abstain | 0.167 |
| presence layout: share of true 'present' readings that abstain | 0.167 |
| presence layout: present read present [pooled midpoint (comparison)] | 0.714 |
| presence name: share of FALSE 'present' readings that abstain | 0.500 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 1.000 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |
| presence depth: present read present | 0.545 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence depth: present read present [pooled midpoint (comparison)] | 0.545 |
| presence source: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.286; status {'ok': 453, 'abstain': 47, 'no-sense': 22, 'unknown-event': 49}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.821 | 0.427 / 0.022 | 0.89 | 0.068 | 0.000 / 0.110 |
| role source | 0.745 | 0.149 / 0.000 | 0.83 | 0.102 | 0.020 / 0.153 |
| roles (pooled) | 0.763 | 0.218 / 0.000 | 0.80 | 0.060 | 0.025 / 0.177 |
| role target | 0.764 | 0.202 / 0.000 | 0.81 | 0.069 | 0.028 / 0.167 |
| role style | 0.750 | 0.046 / 0.000 | 0.17 | 0.000 | 0.583 / 0.250 |
| role edge | 0.875 | 0.108 / 0.022 | 0.81 | 0.000 | 0.062 / 0.125 |
| role object | 0.732 | 0.242 / 0.000 | 0.82 | 0.111 | 0.025 / 0.157 |
| role size | 0.917 | 0.277 / 0.201 | 0.91 | 0.000 | 0.010 / 0.083 |
| role name | 0.880 | 0.208 / 0.084 | 0.92 | 0.080 | 0.040 / 0.040 |
| role relation | 0.833 | 0.217 / 0.000 | 0.86 | 0.044 | 0.022 / 0.122 |
| role landmark | 0.855 | 0.179 / 0.008 | 0.87 | 0.040 | 0.024 / 0.105 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role comparison | 1.000 | 0.256 / 0.209 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 0.900 | 0.254 / 0.190 | 0.90 | 0.000 | 0.000 / 0.100 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role pairing | 0.522 | 0.178 / 0.000 | 0.70 | 0.174 | 0.000 / 0.304 |
| role color | 0.847 | 0.275 / 0.000 | 0.87 | 0.020 | 0.000 / 0.133 |
| role region | 0.438 | 0.100 / 0.000 | 0.41 | 0.031 | 0.062 / 0.531 |
| role superlative | 0.867 | 0.347 / 0.000 | 0.87 | 0.000 | 0.000 / 0.133 |
| role layout | 0.667 | 0.200 / 0.000 | 0.56 | 0.000 | 0.111 / 0.333 |
| role notcolor | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role depth | 0.500 | 0.106 / 0.000 | 0.50 | 0.000 | 0.000 / 0.500 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role text | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

### train (sample) — catalog candidates (n = 300 of 4770)
| axis | accuracy |
|---|---|
| FULL | 0.593 |
| FULL [depth given] | 0.593 |
| FULL [depth and negation given] | 0.593 |
| presence object: present read present | 0.922 |
| presence object: share of 'present' readings that abstain | 0.084 |
| presence object: share of true 'present' readings that abstain | 0.084 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 0.996 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.995 |
| presence region: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 0.990 |
| presence target: absent read absent | 0.967 |
| presence style: absent read absent | 0.991 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| presence superlative: present read present | 0.964 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 0.817 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.763 |
| event type (synonym table) | 0.763 |
| role object | 0.800 |
| head object | 0.810 |
| lexical order head object | 0.763 |
| lexical bag head object | 0.890 |
| occupancy: known filler | 0.755 |
| role shape | 0.997 |
| head shape | 0.997 |
| lexical order head shape | 0.913 |
| lexical bag head shape | 0.997 |
| occupancy: not given | 0.998 |
| role color | 0.977 |
| head color | 0.977 |
| lexical order head color | 0.823 |
| lexical bag head color | 0.977 |
| role size | 0.993 |
| head size | 0.993 |
| lexical order head size | 0.880 |
| lexical bag head size | 0.993 |
| role name | 0.977 |
| head name | 0.977 |
| lexical order head name | 0.933 |
| lexical bag head name | 1.000 |
| role text | 0.990 |
| head text | 0.990 |
| lexical order head text | 0.990 |
| lexical bag head text | 1.000 |
| role relation | 0.970 |
| head relation | 0.970 |
| lexical order head relation | 0.873 |
| lexical bag head relation | 0.990 |
| role landmark | 0.973 |
| head landmark | 0.973 |
| lexical order head landmark | 0.807 |
| lexical bag head landmark | 0.947 |
| role landmark2 | 0.997 |
| head landmark2 | 0.997 |
| lexical order head landmark2 | 0.997 |
| lexical bag head landmark2 | 1.000 |
| role region | 0.937 |
| head region | 0.937 |
| lexical order head region | 0.907 |
| lexical bag head region | 0.970 |
| role direction | 0.997 |
| head direction | 0.997 |
| lexical order head direction | 0.997 |
| lexical bag head direction | 1.000 |
| role amount | 0.997 |
| head amount | 0.997 |
| lexical order head amount | 0.997 |
| lexical bag head amount | 1.000 |
| role quantity | 0.993 |
| head quantity | 0.993 |
| lexical order head quantity | 0.993 |
| lexical bag head quantity | 1.000 |
| role axis | 0.980 |
| head axis | 0.980 |
| lexical order head axis | 0.980 |
| lexical bag head axis | 1.000 |
| role layout | 0.990 |
| head layout | 0.990 |
| lexical order head layout | 0.983 |
| lexical bag head layout | 1.000 |
| role source | 0.943 |
| head source | 0.943 |
| lexical order head source | 0.820 |
| lexical bag head source | 0.980 |
| role target | 0.957 |
| head target | 0.957 |
| lexical order head target | 0.890 |
| lexical bag head target | 0.977 |
| role style | 0.987 |
| head style | 0.987 |
| lexical order head style | 0.967 |
| lexical bag head style | 0.987 |
| role arrow | 0.993 |
| head arrow | 0.993 |
| lexical order head arrow | 0.993 |
| lexical bag head arrow | 0.993 |
| role edge | 0.987 |
| head edge | 0.987 |
| lexical order head edge | 0.957 |
| lexical bag head edge | 0.997 |
| role pairing | 0.977 |
| head pairing | 0.977 |
| lexical order head pairing | 0.950 |
| lexical bag head pairing | 0.993 |
| role notcolor | 0.990 |
| head notcolor | 0.990 |
| lexical order head notcolor | 0.990 |
| lexical bag head notcolor | 0.990 |
| role depth | 1.000 |
| head depth | 1.000 |
| lexical order head depth | 0.990 |
| lexical bag head depth | 1.000 |
| role superlative | 0.997 |
| head superlative | 0.997 |
| lexical order head superlative | 0.907 |
| lexical bag head superlative | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.967 |
| lexical bag head comparison | 1.000 |
| heads FULL (model) | 0.630 |
| heads FULL (lexical order baseline) | 0.137 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.743 |
| presence size: present read present | 0.971 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.967 |
| presence relation: share of 'present' readings that abstain | 0.034 |
| presence relation: share of true 'present' readings that abstain | 0.034 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.038 |
| presence landmark: share of true 'present' readings that abstain | 0.039 |
| presence superlative: absent read absent | 1.000 |
| presence object: absent read absent | 0.987 |
| presence source: present read present | 0.889 |
| presence source: share of 'present' readings that abstain | 0.048 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.875 |
| presence target: share of 'present' readings that abstain | 0.114 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.067 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present | 0.800 |
| presence pairing: share of 'present' readings that abstain | 0.250 |
| presence pairing: share of true 'present' readings that abstain | 0.250 |
| presence color: present read present | 0.979 |
| presence color: share of 'present' readings that abstain | 0.065 |
| presence color: share of true 'present' readings that abstain | 0.065 |
| presence edge: present read present | 0.692 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence source: share of FALSE 'present' readings that abstain | 1.000 |
| presence style: present read present | 0.800 |
| presence style: share of 'present' readings that abstain | 0.400 |
| presence style: share of true 'present' readings that abstain | 0.375 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.500 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence name: share of FALSE 'present' readings that abstain | 1.000 |
| presence layout: present read present | 0.667 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.571 |
| presence depth: present read present | 1.000 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.322; status {'ok': 209, 'abstain': 36, 'no-sense': 8, 'unknown-event': 47}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.763 | 0.395 / 0.009 | 0.81 | 0.050 | 0.000 / 0.187 |
| role object | 0.718 | 0.295 / 0.000 | 0.82 | 0.163 | 0.057 / 0.120 |
| roles (pooled) | 0.746 | 0.232 / 0.000 | 0.79 | 0.076 | 0.035 / 0.178 |
| role superlative | 0.964 | 0.408 / 0.371 | 0.96 | 0.000 | 0.000 / 0.036 |
| role size | 0.944 | 0.306 / 0.269 | 0.97 | 0.028 | 0.000 / 0.028 |
| role relation | 0.763 | 0.194 / 0.000 | 0.79 | 0.053 | 0.026 / 0.184 |
| role landmark | 0.879 | 0.199 / 0.035 | 0.88 | 0.034 | 0.034 / 0.086 |
| role source | 0.722 | 0.160 / 0.000 | 0.81 | 0.093 | 0.000 / 0.185 |
| role target | 0.818 | 0.211 / 0.000 | 0.85 | 0.030 | 0.000 / 0.152 |
| role name | 0.700 | 0.164 / 0.000 | 0.80 | 0.100 | 0.000 / 0.200 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role pairing | 0.533 | 0.163 / 0.000 | 0.60 | 0.200 | 0.133 / 0.267 |
| role color | 0.868 | 0.251 / 0.000 | 0.81 | 0.000 | 0.057 / 0.132 |
| role notcolor | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role arrow | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role edge | 0.692 | 0.109 / 0.000 | 0.69 | 0.000 | 0.000 / 0.308 |
| role region | 0.321 | 0.087 / 0.000 | 0.32 | 0.000 | 0.000 / 0.679 |
| role quantity | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role style | 0.800 | 0.062 / 0.000 | 0.50 | 0.000 | 0.300 / 0.200 |
| role shape | 0.962 | 0.249 / 0.225 | 0.96 | 0.000 | 0.000 / 0.038 |
| role comparison | 1.000 | 0.285 / 0.273 | 1.00 | 0.000 | 0.000 / 0.000 |
| role layout | 0.400 | 0.130 / 0.000 | 0.40 | 0.000 | 0.000 / 0.600 |
| role axis | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role depth | 1.000 | 0.296 / 0.182 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role direction | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
,=1.00 and=1.00 as=1.00 at=1.00 by=1.00 from=1.00 in=1.00 labeled=1.00 named=1.00 of=1.00 on=1.00 to=1.00 with=1.00 REGION=0.99 SUPER=0.98 COLOR=0.98 than=0.98 REL=0.96 TEXT=0.96 connected=0.95 px=0.94 NOTCOLOR=0.93 once=0.92 rules=0.92 times=0.91 AXIS=0.90 linked=0.90 LAYOUT=0.86 twice=0.82 PAIR=0.78 there=0.74 have=0.70 DEPTH=0.69 then=0.66 RECENT=0.64 my=0.59 that=0.56 NAME=0.55 them=0.53 it=0.52 for=0.49 canvas=0.47 whole=0.47 SHAPE=0.43 exist=0.43 DIR=0.42 evenly=0.41 last=0.40 we=0.39 now=0.36 this=0.35 EDGE=0.34 VERB=0.32 no=0.29 each=0.27 its=0.26 map=0.23 too=0.23 has=0.22 those=0.22 here=0.21 be=0.17 both=0.15 do=0.15 ARROW=0.14 SIZE=0.13 around=0.13 order=0.13 cycle=0.12 i=0.11 unknown=0.10 old=0.10 far=0.10 uh=0.09 what=0.09 an=0.08 neighbors=0.08 anything=0.08 axis=0.08 degree=0.07 how=0.06 who=0.06 default=0.06 go=0.06 least=0.05 the=0.04 everything=0.04 any=0.04 me=0.03 if=0.03 check=0.03 new=0.03 most=0.02 reach=0.02 directly=0.02 tell=0.02 NUM=0.02 give=0.02 one=0.02 STYLE=0.02 all=0.02 reached=0.02 goes=0.01 can=0.01 are=0.01 should=0.01 every=0.01 does=0.01 reachable=0.00 a=0.00

## What is weak, what to add
- heldout_sentences: FULL 0.615
- heldout_sentences: presence source: present read present 0.878
- heldout_sentences: presence source: share of 'present' readings that abstain 0.037
- heldout_sentences: presence source: share of true 'present' readings that abstain 0.025
- heldout_sentences: presence target: present read present 0.896
- heldout_sentences: presence target: share of 'present' readings that abstain 0.045
- heldout_sentences: presence target: share of true 'present' readings that abstain 0.050
- heldout_sentences: presence style: present read present 0.818
- heldout_sentences: presence style: share of 'present' readings that abstain 0.800
- heldout_sentences: presence style: share of true 'present' readings that abstain 0.778
- heldout_sentences: presence edge: share of 'present' readings that abstain 0.071
- heldout_sentences: presence edge: share of true 'present' readings that abstain 0.071
- heldout_sentences: structure (depth, negation) 0.876
- heldout_sentences: predicate (surface lemma) 0.821
- heldout_sentences: event type (synonym table) 0.821
- heldout_sentences: role object 0.795
- heldout_sentences: head object 0.809
- heldout_sentences: occupancy: known filler 0.780
- heldout_sentences: heads FULL (model) 0.644
- heldout_sentences: heads FULL (lexical order baseline) 0.152
- heldout_sentences: heads FULL (lexical bag baseline, trained on the same training rows) 0.464
- heldout_sentences: FULL [depth given] 0.615
- heldout_sentences: FULL [depth and negation given] 0.615
- heldout_sentences: FULL [pooled midpoint (comparison)] 0.268
- heldout_sentences: role object [pooled midpoint (comparison)] 0.452
- heldout_sentences: heads FULL (model) [pooled midpoint (comparison)] 0.284
- heldout_sentences: presence source: present read present [pooled midpoint (comparison)] 0.809
- heldout_sentences: presence target: present read present [pooled midpoint (comparison)] 0.894
- heldout_sentences: presence style: present read present [pooled midpoint (comparison)] 0.182
- heldout_sentences: presence object: present read present 0.869
- heldout_sentences: presence object: share of 'present' readings that abstain 0.039
- heldout_sentences: presence object: share of true 'present' readings that abstain 0.037
- heldout_sentences: presence size: share of 'present' readings that abstain 0.011
- heldout_sentences: presence size: share of true 'present' readings that abstain 0.011
- heldout_sentences: presence name: share of 'present' readings that abstain 0.115
- heldout_sentences: presence name: share of true 'present' readings that abstain 0.045
- heldout_sentences: presence relation: share of 'present' readings that abstain 0.026
- heldout_sentences: presence relation: share of true 'present' readings that abstain 0.027
- heldout_sentences: presence landmark: share of 'present' readings that abstain 0.046
- heldout_sentences: presence landmark: share of true 'present' readings that abstain 0.028
- heldout_sentences: occupancy: unknown filler 0.762
- heldout_sentences: presence object: present read present [pooled midpoint (comparison)] 0.248
- heldout_sentences: presence name: present read present [pooled midpoint (comparison)] 0.652
- heldout_sentences: presence relation: present read present [pooled midpoint (comparison)] 0.785
- heldout_sentences: presence landmark: present read present [pooled midpoint (comparison)] 0.821
- heldout_sentences: presence comparison: share of 'present' readings that abstain 0.000
- heldout_sentences: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence shape: share of 'present' readings that abstain 0.000
- heldout_sentences: presence shape: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: present read present 0.800
- heldout_sentences: presence pairing: share of 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: present read present [pooled midpoint (comparison)] 0.000
- heldout_sentences: presence relation: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence landmark: share of FALSE 'present' readings that abstain 0.667
- heldout_sentences: presence color: share of 'present' readings that abstain 0.000
- heldout_sentences: presence color: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence color: present read present [pooled midpoint (comparison)] 0.764
- heldout_sentences: determiner identity (outside FULL when the legend excludes it) 0.000
- heldout_sentences: presence region: share of 'present' readings that abstain 0.143
- heldout_sentences: presence region: share of true 'present' readings that abstain 0.143
- heldout_sentences: presence superlative: share of 'present' readings that abstain 0.000
- heldout_sentences: presence superlative: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence object: share of FALSE 'present' readings that abstain 0.091
- heldout_sentences: presence layout: present read present 0.857
- heldout_sentences: presence layout: share of 'present' readings that abstain 0.167
- heldout_sentences: presence layout: share of true 'present' readings that abstain 0.167
- heldout_sentences: presence layout: present read present [pooled midpoint (comparison)] 0.714
- heldout_sentences: presence name: share of FALSE 'present' readings that abstain 0.500
- heldout_sentences: presence target: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence color: share of FALSE 'present' readings that abstain 0.000
- heldout_sentences: presence depth: present read present 0.545
- heldout_sentences: presence depth: share of 'present' readings that abstain 0.000
- heldout_sentences: presence depth: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence depth: present read present [pooled midpoint (comparison)] 0.545
- train (sample): FULL 0.593
- train (sample): presence object: share of 'present' readings that abstain 0.084
- train (sample): presence object: share of true 'present' readings that abstain 0.084
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): structure (depth, negation) 0.817
- train (sample): predicate (surface lemma) 0.763
- train (sample): event type (synonym table) 0.763
- train (sample): role object 0.800
- train (sample): head object 0.810
- train (sample): occupancy: known filler 0.755
- train (sample): heads FULL (model) 0.630
- train (sample): heads FULL (lexical order baseline) 0.137
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.743
- train (sample): FULL [depth given] 0.593
- train (sample): FULL [depth and negation given] 0.593
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.034
- train (sample): presence relation: share of true 'present' readings that abstain 0.034
- train (sample): presence landmark: share of 'present' readings that abstain 0.038
- train (sample): presence landmark: share of true 'present' readings that abstain 0.039
- train (sample): presence source: present read present 0.889
- train (sample): presence source: share of 'present' readings that abstain 0.048
- train (sample): presence source: share of true 'present' readings that abstain 0.000
- train (sample): presence target: present read present 0.875
- train (sample): presence target: share of 'present' readings that abstain 0.114
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): presence name: share of 'present' readings that abstain 0.067
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): presence pairing: present read present 0.800
- train (sample): presence pairing: share of 'present' readings that abstain 0.250
- train (sample): presence pairing: share of true 'present' readings that abstain 0.250
- train (sample): presence color: share of 'present' readings that abstain 0.065
- train (sample): presence color: share of true 'present' readings that abstain 0.065
- train (sample): presence edge: present read present 0.692
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence style: present read present 0.800
- train (sample): presence style: share of 'present' readings that abstain 0.400
- train (sample): presence style: share of true 'present' readings that abstain 0.375
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.000
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence layout: present read present 0.667
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.571
- train (sample): presence depth: share of 'present' readings that abstain 0.000
- train (sample): presence depth: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_sentences: `NAME REGION` FULL 0.000 (n 13)
- heldout_sentences: `which rules` FULL 0.000 (n 7)
- heldout_sentences: `disconnect NAME from NAME` FULL 0.000 (n 5)
- heldout_sentences: `bring it DEPTH` FULL 0.000 (n 5)
- heldout_sentences: `move NAME REGION` FULL 0.000 (n 4)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_sentences | object | product: fitted | 0.869 | 0.929 | 0.899 | 0.039 (0.091 / 0.037) |
| heldout_sentences | object | comparison: pooled midpoint | 0.248 | 1.000 | 0.624 |  |
| heldout_sentences | shape | product: fitted | 0.964 | 1.000 | 0.982 | 0.000 (— / 0.000) |
| heldout_sentences | shape | comparison: pooled midpoint | 0.964 | 1.000 | 0.982 |  |
| heldout_sentences | color | product: fitted | 0.933 | 0.998 | 0.965 | 0.000 (0.000 / 0.000) |
| heldout_sentences | color | comparison: pooled midpoint | 0.764 | 0.998 | 0.881 |  |
| heldout_sentences | size | product: fitted | 0.967 | 1.000 | 0.984 | 0.011 (— / 0.011) |
| heldout_sentences | size | comparison: pooled midpoint | 0.956 | 1.000 | 0.978 |  |
| heldout_sentences | name | product: fitted | 0.957 | 0.992 | 0.974 | 0.115 (0.500 / 0.045) |
| heldout_sentences | name | comparison: pooled midpoint | 0.652 | 1.000 | 0.826 |  |
| heldout_sentences | relation | product: fitted | 0.949 | 0.995 | 0.972 | 0.026 (0.000 / 0.027) |
| heldout_sentences | relation | comparison: pooled midpoint | 0.785 | 0.998 | 0.891 |  |
| heldout_sentences | landmark | product: fitted | 0.946 | 0.992 | 0.969 | 0.046 (0.667 / 0.028) |
| heldout_sentences | landmark | comparison: pooled midpoint | 0.821 | 0.992 | 0.907 |  |
| heldout_sentences | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.143 (— / 0.143) |
| heldout_sentences | region | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | layout | product: fitted | 0.857 | 1.000 | 0.929 | 0.167 (— / 0.167) |
| heldout_sentences | layout | comparison: pooled midpoint | 0.714 | 1.000 | 0.857 |  |
| heldout_sentences | source | product: fitted | 0.878 | 0.998 | 0.938 | 0.037 (1.000 / 0.025) |
| heldout_sentences | source | comparison: pooled midpoint | 0.809 | 1.000 | 0.904 |  |
| heldout_sentences | target | product: fitted | 0.896 | 0.986 | 0.941 | 0.045 (0.000 / 0.050) |
| heldout_sentences | target | comparison: pooled midpoint | 0.894 | 0.986 | 0.940 |  |
| heldout_sentences | style | product: fitted | 0.818 | 0.998 | 0.908 | 0.800 (1.000 / 0.778) |
| heldout_sentences | style | comparison: pooled midpoint | 0.182 | 1.000 | 0.591 |  |
| heldout_sentences | edge | product: fitted | 0.933 | 1.000 | 0.967 | 0.071 (— / 0.071) |
| heldout_sentences | edge | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_sentences | pairing | product: fitted | 0.800 | 1.000 | 0.900 | 0.000 (— / 0.000) |
| heldout_sentences | pairing | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_sentences | depth | product: fitted | 0.545 | 1.000 | 0.773 | 0.000 (— / 0.000) |
| heldout_sentences | depth | comparison: pooled midpoint | 0.545 | 1.000 | 0.773 |  |
| heldout_sentences | superlative | product: fitted | 0.912 | 1.000 | 0.956 | 0.000 (— / 0.000) |
| heldout_sentences | superlative | comparison: pooled midpoint | 0.929 | 1.000 | 0.964 |  |
| heldout_sentences | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | comparison | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | object | product: fitted | 0.922 | 0.987 | 0.955 | 0.084 (0.000 / 0.084) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.979 | 1.000 | 0.989 | 0.065 (— / 0.065) |
| train (sample) | size | product: fitted | 0.971 | 1.000 | 0.986 | 0.000 (— / 0.000) |
| train (sample) | name | product: fitted | 1.000 | 0.996 | 0.998 | 0.067 (1.000 / 0.000) |
| train (sample) | relation | product: fitted | 0.967 | 1.000 | 0.983 | 0.034 (— / 0.034) |
| train (sample) | landmark | product: fitted | 1.000 | 0.995 | 0.997 | 0.038 (0.000 / 0.039) |
| train (sample) | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.889 | 0.990 | 0.939 | 0.048 (1.000 / 0.000) |
| train (sample) | target | product: fitted | 0.875 | 0.967 | 0.921 | 0.114 (0.571 / 0.000) |
| train (sample) | style | product: fitted | 0.800 | 0.991 | 0.896 | 0.400 (0.500 / 0.375) |
| train (sample) | edge | product: fitted | 0.692 | 1.000 | 0.846 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 0.800 | 1.000 | 0.900 | 0.250 (— / 0.250) |
| train (sample) | depth | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 0.964 | 1.000 | 0.982 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
