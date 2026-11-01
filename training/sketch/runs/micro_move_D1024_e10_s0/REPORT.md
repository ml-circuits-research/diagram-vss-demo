# REPORT — world `move`, legend sha256:c94565dd3fcf… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
2378 annotated sentences from 2 files; provenance: {'llm': 2378}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_move_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 109 sentences
- heldout_formulations: 131 sentences
- train: 2138 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
11703 tokens in the examples; 350 with no kind in the lexicon (share 0.030), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 3de6b02. Memory curve: runs/micro_move_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.509 [rule: fit; pooled midpoint 0.996 (comparison)] (present 1.992, n 11 / absent -0.001, n 871906)
- presence:object: threshold 0.740 [rule: fit; pooled midpoint 0.733 (comparison)] (present 1.067, n 491 / absent 0.399, n 18)
- attr_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 493)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 492)
- presence:relation: threshold 0.258 [rule: fit; pooled midpoint 0.457 (comparison)] (present 0.742, n 197 / absent 0.172, n 312)
- presence:landmark: threshold 0.297 [rule: fit; pooled midpoint 0.542 (comparison)] (present 0.947, n 193 / absent 0.137, n 316)
- presence:landmark2: threshold 0.244 [rule: fit; pooled midpoint 0.477 (comparison)] (present 0.807, n 14 / absent 0.146, n 495)
- presence:region: threshold 0.634 [rule: fit; pooled midpoint 0.514 (comparison)] (present 0.796, n 225 / absent 0.232, n 284)
- presence:direction: threshold 0.322 [rule: fit; pooled midpoint 0.389 (comparison)] (present 0.730, n 43 / absent 0.048, n 466)
- presence:amount: threshold 0.354 [rule: fit; pooled midpoint 0.490 (comparison)] (present 0.896, n 46 / absent 0.085, n 463)
- presence:members: threshold 0.595 [rule: fit; pooled midpoint 1.522 (comparison)] (present 2.901, n 6 / absent 0.143, n 503)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, relation 0.067, landmark 0.001, landmark2 0.001, region 0.067, direction 0.250, amount 0.050, members 0.001, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 131 of 131)
| axis | accuracy |
|---|---|
| FULL | 0.832 |
| FULL [depth given] | 0.832 |
| FULL [depth and negation given] | 0.832 |
| FULL [presence not decided] | 0.672 |
| FULL [pooled midpoint (comparison)] | 0.786 |
| presence object: present read present | 0.983 |
| presence object: share of 'present' readings that abstain | 0.017 |
| presence object: share of true 'present' readings that abstain | 0.017 |
| presence relation: present read present | 0.980 |
| presence relation: share of 'present' readings that abstain | 0.074 |
| presence relation: share of true 'present' readings that abstain | 0.041 |
| presence landmark: present read present | 0.955 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.954 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.985 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.954 |
| event type (synonym table) | 0.954 |
| role object | 0.939 |
| head object | 0.939 |
| lexical order head object | 0.954 |
| lexical bag head object | 0.824 |
| occupancy: known filler | 0.907 |
| role relation | 0.939 |
| head relation | 0.939 |
| lexical order head relation | 0.603 |
| lexical bag head relation | 0.771 |
| role landmark | 0.954 |
| head landmark | 0.954 |
| lexical order head landmark | 0.641 |
| lexical bag head landmark | 0.687 |
| role landmark2 | 0.992 |
| head landmark2 | 0.992 |
| lexical order head landmark2 | 0.969 |
| lexical bag head landmark2 | 0.962 |
| occupancy: not given | 0.991 |
| role region | 0.947 |
| head region | 0.947 |
| lexical order head region | 0.611 |
| lexical bag head region | 0.786 |
| role direction | 0.985 |
| head direction | 0.985 |
| lexical order head direction | 0.924 |
| lexical bag head direction | 0.954 |
| role amount | 1.000 |
| head amount | 1.000 |
| lexical order head amount | 0.908 |
| lexical bag head amount | 0.954 |
| role members | 0.977 |
| head members | 0.977 |
| lexical order head members | 0.969 |
| lexical bag head members | 0.969 |
| heads FULL (model) | 0.832 |
| heads FULL (lexical order baseline) | 0.115 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.397 |
| role object [presence not decided] | 0.931 |
| role relation [presence not decided] | 0.863 |
| role landmark [presence not decided] | 0.939 |
| role landmark2 [presence not decided] | 0.969 |
| role region [presence not decided] | 0.870 |
| role direction [presence not decided] | 0.908 |
| role amount [presence not decided] | 1.000 |
| role members [presence not decided] | 0.977 |
| heads FULL (model) [presence not decided] | 0.672 |
| role object [pooled midpoint (comparison)] | 0.939 |
| role relation [pooled midpoint (comparison)] | 0.870 |
| role landmark [pooled midpoint (comparison)] | 0.939 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.893 |
| role direction [pooled midpoint (comparison)] | 0.985 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.969 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.786 |
| presence object: present read present [pooled midpoint (comparison)] | 0.983 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.760 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.909 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.853 |
| presence direction: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence amount: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent | 0.933 |
| presence landmark: absent read absent | 0.988 |
| presence region: present read present | 0.880 |
| presence region: share of 'present' readings that abstain | 0.068 |
| presence region: share of true 'present' readings that abstain | 0.068 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 0.960 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 0.988 |
| presence region: present read present [pooled midpoint (comparison)] | 0.960 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.000 |
| presence amount: share of true 'present' readings that abstain | 0.000 |
| presence amount: present read present [pooled midpoint (comparison)] | 1.000 |
| occupancy: unknown filler | 0.939 |
| presence landmark2: present read present | 0.750 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 0.857 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.333 |
| presence members: share of true 'present' readings that abstain | 0.333 |
| set members: first gold member in the decoded set | 0.500 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.857 |
| presence members: present read present [pooled midpoint (comparison)] | 0.000 |
| presence relation: share of FALSE 'present' readings that abstain | 0.400 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |
| presence direction: present read present | 0.800 |
| presence direction: present read present [pooled midpoint (comparison)] | 0.800 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |

residual mean 0.121; status {'ok': 108, 'abstain': 17, 'unknown-event': 6}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.954 | 0.537 / 0.444 | 0.97 | 0.015 | 0.000 / 0.031 |
| role object | 0.943 | 0.279 / 0.164 | 0.97 | 0.041 | 0.016 / 0.016 |
| roles (pooled) | 0.908 | 0.290 / 0.068 | 0.92 | 0.036 | 0.023 / 0.056 |
| role relation | 0.942 | 0.325 / 0.112 | 0.94 | 0.038 | 0.038 / 0.019 |
| role landmark | 0.894 | 0.401 / 0.246 | 0.94 | 0.043 | 0.000 / 0.064 |
| role region | 0.863 | 0.172 / 0.000 | 0.82 | 0.020 | 0.059 / 0.118 |
| role amount | 1.000 | 0.395 / 0.274 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 0.750 | 0.254 / 0.092 | 0.75 | 0.000 | 0.000 / 0.250 |
| role members | 0.250 | 0.152 / 0.019 | 0.50 | 0.250 | 0.000 / 0.500 |
| role direction | 0.800 | 0.280 / 0.000 | 0.80 | 0.000 | 0.000 / 0.200 |

### train (sample) — catalog candidates (n = 300 of 2138)
| axis | accuracy |
|---|---|
| FULL | 0.783 |
| FULL [depth given] | 0.783 |
| FULL [depth and negation given] | 0.783 |
| structure (depth, negation) | 0.903 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.993 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.903 |
| event type (synonym table) | 0.903 |
| role object | 0.903 |
| head object | 0.903 |
| lexical order head object | 0.963 |
| lexical bag head object | 0.953 |
| occupancy: known filler | 0.850 |
| role relation | 0.867 |
| head relation | 0.867 |
| lexical order head relation | 0.523 |
| lexical bag head relation | 0.763 |
| role landmark | 0.913 |
| head landmark | 0.913 |
| lexical order head landmark | 0.530 |
| lexical bag head landmark | 0.757 |
| role landmark2 | 0.987 |
| head landmark2 | 0.987 |
| lexical order head landmark2 | 0.963 |
| lexical bag head landmark2 | 0.990 |
| role region | 0.913 |
| head region | 0.913 |
| lexical order head region | 0.650 |
| lexical bag head region | 0.783 |
| occupancy: not given | 0.990 |
| role direction | 0.993 |
| head direction | 0.993 |
| lexical order head direction | 0.927 |
| lexical bag head direction | 0.983 |
| role amount | 0.997 |
| head amount | 0.997 |
| lexical order head amount | 0.920 |
| lexical bag head amount | 0.983 |
| role members | 0.987 |
| head members | 0.987 |
| lexical order head members | 0.980 |
| lexical bag head members | 0.980 |
| heads FULL (model) | 0.783 |
| heads FULL (lexical order baseline) | 0.077 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.570 |
| presence object: present read present | 0.988 |
| presence relation: absent read absent | 0.912 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: present read present | 0.796 |
| presence direction: absent read absent | 0.996 |
| presence amount: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| presence object: share of 'present' readings that abstain | 0.016 |
| presence object: share of true 'present' readings that abstain | 0.016 |
| presence relation: present read present | 0.943 |
| presence region: absent read absent | 0.982 |
| presence region: share of 'present' readings that abstain | 0.106 |
| presence region: share of FALSE 'present' readings that abstain | 0.333 |
| presence region: share of true 'present' readings that abstain | 0.098 |
| presence direction: present read present | 1.000 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.000 |
| presence amount: share of true 'present' readings that abstain | 0.000 |
| presence relation: share of 'present' readings that abstain | 0.039 |
| presence relation: share of true 'present' readings that abstain | 0.043 |
| presence landmark: present read present | 0.975 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.875 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| presence direction: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 1.000 |
| set members: first gold member in the decoded set | 0.667 |
| occupancy: unknown filler | 0.667 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |

residual mean 0.164; status {'unknown-event': 28, 'ok': 241, 'abstain': 30, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.903 | 0.514 / 0.415 | 0.95 | 0.047 | 0.000 / 0.050 |
| role object | 0.899 | 0.296 / 0.169 | 0.98 | 0.091 | 0.014 / 0.010 |
| roles (pooled) | 0.844 | 0.314 / 0.080 | 0.93 | 0.106 | 0.023 / 0.050 |
| role relation | 0.811 | 0.326 / 0.080 | 0.92 | 0.140 | 0.035 / 0.049 |
| role landmark | 0.816 | 0.427 / 0.331 | 0.98 | 0.163 | 0.000 / 0.021 |
| role landmark2 | 0.636 | 0.269 / 0.057 | 0.91 | 0.273 | 0.000 / 0.091 |
| role region | 0.781 | 0.140 / 0.000 | 0.70 | 0.000 | 0.076 / 0.219 |
| role direction | 0.955 | 0.396 / 0.241 | 1.00 | 0.045 | 0.000 / 0.000 |
| role amount | 0.958 | 0.472 / 0.435 | 1.00 | 0.042 | 0.000 / 0.000 |
| role members | 0.333 | 0.364 / 0.236 | 1.00 | 0.667 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 DIR=0.99 and=0.98 c23_in=0.79 c1_have=0.77 c13_one=0.72 c10_three=0.64 c6_both=0.63 NUM=0.52 of=0.52 c14_uh=0.50 c9_an=0.45 SHAPE=0.44 c12_that=0.42 c11_what=0.41 c7_i=0.32 VERB=0.28 c19_goes=0.27 c2_now=0.25 QUANT=0.25 are=0.24 c5_me=0.22 COLOR=0.21 LAYOUT=0.20 RECENT=0.15 it=0.14 ARROW=0.12 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c24_line=0.12 c26_shape=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c3_rules=0.09 unknown=0.09 c17_be=0.07 c16_new=0.05 c4_then=0.05 with=0.04 to=0.04 c18_does=0.04 c8_what's=0.02 NAME=0.01 c27_them=0.01 a=0.00 c15_on=0.00 the=0.00 c25_pixels=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.832
- heldout_formulations: presence object: share of 'present' readings that abstain 0.017
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.017
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.074
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.041
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: heads FULL (model) 0.832
- heldout_formulations: heads FULL (lexical order baseline) 0.115
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.397
- heldout_formulations: FULL [depth given] 0.832
- heldout_formulations: FULL [depth and negation given] 0.832
- heldout_formulations: FULL [presence not decided] 0.672
- heldout_formulations: role relation [presence not decided] 0.863
- heldout_formulations: role region [presence not decided] 0.870
- heldout_formulations: heads FULL (model) [presence not decided] 0.672
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.786
- heldout_formulations: role relation [pooled midpoint (comparison)] 0.870
- heldout_formulations: role region [pooled midpoint (comparison)] 0.893
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.786
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.760
- heldout_formulations: presence region: absent read absent [pooled midpoint (comparison)] 0.853
- heldout_formulations: presence region: present read present 0.880
- heldout_formulations: presence region: share of 'present' readings that abstain 0.068
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.068
- heldout_formulations: presence amount: share of 'present' readings that abstain 0.000
- heldout_formulations: presence amount: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: present read present 0.750
- heldout_formulations: presence object: absent read absent 0.857
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.333
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.333
- heldout_formulations: set members: first gold member in the decoded set 0.500
- heldout_formulations: presence object: absent read absent [pooled midpoint (comparison)] 0.857
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence relation: share of FALSE 'present' readings that abstain 0.400
- heldout_formulations: presence landmark: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence direction: present read present 0.800
- heldout_formulations: presence direction: present read present [pooled midpoint (comparison)] 0.800
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence direction: share of 'present' readings that abstain 0.000
- heldout_formulations: presence direction: share of true 'present' readings that abstain 0.000
- train (sample): FULL 0.783
- train (sample): occupancy: known filler 0.850
- train (sample): role relation 0.867
- train (sample): head relation 0.867
- train (sample): heads FULL (model) 0.783
- train (sample): heads FULL (lexical order baseline) 0.077
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.570
- train (sample): FULL [depth given] 0.783
- train (sample): FULL [depth and negation given] 0.783
- train (sample): presence region: present read present 0.796
- train (sample): presence object: share of 'present' readings that abstain 0.016
- train (sample): presence object: share of true 'present' readings that abstain 0.016
- train (sample): presence region: share of 'present' readings that abstain 0.106
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.333
- train (sample): presence region: share of true 'present' readings that abstain 0.098
- train (sample): presence direction: share of 'present' readings that abstain 0.000
- train (sample): presence direction: share of true 'present' readings that abstain 0.000
- train (sample): presence amount: share of 'present' readings that abstain 0.000
- train (sample): presence amount: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.039
- train (sample): presence relation: share of true 'present' readings that abstain 0.043
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: present read present 0.875
- train (sample): presence landmark2: share of 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence direction: share of FALSE 'present' readings that abstain 0.000
- train (sample): set members: first gold member in the decoded set 0.667
- train (sample): occupancy: unknown filler 0.667
- train (sample): presence members: share of 'present' readings that abstain 0.000
- train (sample): presence members: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME POS NAME` FULL 0.000 (n 2)
- heldout_formulations: `move NAME POS c27_them` FULL 0.000 (n 1)
- heldout_formulations: `NAME , NAME and NAME move POS NAME` FULL 0.000 (n 1)
- heldout_formulations: `move NAME POS` FULL 0.000 (n 1)
- heldout_formulations: `move POS , is the NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role relation | role landmark | role landmark2 | role region | role direction | role amount | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.832 | 0.832 | 0.939 | 0.939 | 0.954 | 0.992 | 0.947 | 0.985 | 1.000 | 0.977 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.786 | 0.786 | 0.939 | 0.870 | 0.939 | 1.000 | 0.893 | 0.985 | 1.000 | 0.969 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.672 | 0.672 | 0.931 | 0.863 | 0.939 | 0.969 | 0.870 | 0.908 | 1.000 | 0.977 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.983 | 0.857 | 0.920 | 0.017 (0.000 / 0.017) |
| heldout_formulations | object | comparison: pooled midpoint | 0.983 | 0.857 | 0.920 |  |
| heldout_formulations | relation | product: fitted | 0.980 | 0.933 | 0.957 | 0.074 (0.400 / 0.041) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.760 | 0.960 | 0.860 |  |
| heldout_formulations | landmark | product: fitted | 0.955 | 0.988 | 0.971 | 0.000 (0.000 / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.909 | 0.988 | 0.948 |  |
| heldout_formulations | landmark2 | product: fitted | 0.750 | 1.000 | 0.875 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 0.880 | 1.000 | 0.940 | 0.068 (— / 0.068) |
| heldout_formulations | region | comparison: pooled midpoint | 0.960 | 0.853 | 0.907 |  |
| heldout_formulations | direction | product: fitted | 0.800 | 1.000 | 0.900 | 0.000 (— / 0.000) |
| heldout_formulations | direction | comparison: pooled midpoint | 0.800 | 1.000 | 0.900 |  |
| heldout_formulations | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | amount | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.333 (— / 0.333) |
| heldout_formulations | members | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| train (sample) | object | product: fitted | 0.988 | 1.000 | 0.994 | 0.016 (— / 0.016) |
| train (sample) | relation | product: fitted | 0.943 | 0.912 | 0.928 | 0.039 (0.000 / 0.043) |
| train (sample) | landmark | product: fitted | 0.975 | 1.000 | 0.987 | 0.000 (— / 0.000) |
| train (sample) | landmark2 | product: fitted | 0.875 | 1.000 | 0.938 | 0.000 (— / 0.000) |
| train (sample) | region | product: fitted | 0.796 | 0.982 | 0.889 | 0.106 (0.333 / 0.098) |
| train (sample) | direction | product: fitted | 1.000 | 0.996 | 0.998 | 0.000 (0.000 / 0.000) |
| train (sample) | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
