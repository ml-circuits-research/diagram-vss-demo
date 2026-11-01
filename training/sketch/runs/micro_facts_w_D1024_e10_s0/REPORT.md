# REPORT — world `facts_w`, legend sha256:0607adbd3437… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1091 annotated sentences from 2 files; provenance: {'llm': 1091}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_facts_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 55 sentences
- heldout_formulations: 42 sentences
- train: 994 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
4696 tokens in the examples; 150 with no kind in the lexicon (share 0.032), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit f9dc7da. Memory curve: runs/micro_facts_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.137 [rule: fit; pooled midpoint 0.587 (comparison)] (present 1.174, n 22 / absent -0.001, n 294110)
- presence:object: threshold 0.693 [rule: fit; pooled midpoint 0.893 (comparison)] (present 1.360, n 430 / absent 0.427, n 25)
- presence:shape: threshold 0.469 [rule: fit; pooled midpoint 0.511 (comparison)] (present 0.945, n 122 / absent 0.077, n 333)
- presence:color: threshold 0.596 [rule: fit; pooled midpoint 0.672 (comparison)] (present 1.239, n 342 / absent 0.106, n 113)
- presence:size: threshold 0.631 [rule: fit; pooled midpoint 0.783 (comparison)] (present 1.510, n 109 / absent 0.057, n 346)
- presence:relation: threshold 0.568 [rule: fit; pooled midpoint 0.568 (comparison)] (present 1.074, n 38 / absent 0.062, n 417)
- presence:landmark: threshold 0.212 [rule: fit; pooled midpoint 0.552 (comparison)] (present 0.980, n 40 / absent 0.124, n 415)
- presence:landmark2: threshold 0.263 [rule: fit; pooled midpoint 0.239 (comparison)] (present 0.352, n 8 / absent 0.126, n 454)
- presence:members: threshold 0.192 [rule: fit; pooled midpoint 0.697 (comparison)] (present 1.271, n 11 / absent 0.122, n 444)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.062, color 0.056, size 0.143, relation 0.067, landmark 0.001, landmark2 0.001, members 0.001, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 42 of 42)
| axis | accuracy |
|---|---|
| FULL | 0.762 |
| FULL [depth given] | 0.762 |
| FULL [depth and negation given] | 0.762 |
| FULL [presence not decided] | 0.857 |
| FULL [pooled midpoint (comparison)] | 0.500 |
| presence object: present read present | 0.895 |
| presence object: share of 'present' readings that abstain | 0.029 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.000 |
| presence members: absent read absent | 0.974 |
| presence members: share of 'present' readings that abstain | 0.333 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| structure (depth, negation) | 0.976 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.929 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.976 |
| event type (synonym table) | 0.976 |
| role object | 0.857 |
| head object | 0.857 |
| lexical order head object | 0.952 |
| lexical bag head object | 0.667 |
| occupancy: unknown filler | 0.923 |
| role shape | 0.952 |
| head shape | 0.952 |
| lexical order head shape | 0.619 |
| lexical bag head shape | 0.810 |
| occupancy: not given | 0.987 |
| role color | 0.905 |
| head color | 0.905 |
| lexical order head color | 1.000 |
| lexical bag head color | 1.000 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.762 |
| lexical bag head size | 0.857 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.952 |
| lexical bag head relation | 0.952 |
| occupancy: known filler | 0.870 |
| role landmark | 0.976 |
| head landmark | 0.976 |
| lexical order head landmark | 0.952 |
| lexical bag head landmark | 0.952 |
| role landmark2 | 0.976 |
| head landmark2 | 0.976 |
| lexical order head landmark2 | 0.976 |
| lexical bag head landmark2 | 0.976 |
| role members | 0.929 |
| head members | 0.929 |
| lexical order head members | 0.952 |
| lexical bag head members | 0.952 |
| heads FULL (model) | 0.762 |
| heads FULL (lexical order baseline) | 0.429 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.548 |
| role object [presence not decided] | 0.929 |
| role shape [presence not decided] | 1.000 |
| role color [presence not decided] | 0.976 |
| role size [presence not decided] | 1.000 |
| role relation [presence not decided] | 1.000 |
| role landmark [presence not decided] | 0.976 |
| role landmark2 [presence not decided] | 0.952 |
| role members [presence not decided] | 0.929 |
| heads FULL (model) [presence not decided] | 0.857 |
| role object [pooled midpoint (comparison)] | 0.595 |
| role shape [pooled midpoint (comparison)] | 0.952 |
| role color [pooled midpoint (comparison)] | 0.905 |
| role size [pooled midpoint (comparison)] | 0.929 |
| role relation [pooled midpoint (comparison)] | 1.000 |
| role landmark [pooled midpoint (comparison)] | 0.976 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.952 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.500 |
| presence object: present read present [pooled midpoint (comparison)] | 0.595 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.500 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence shape: present read present | 0.875 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 0.900 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.200 |
| presence size: share of true 'present' readings that abstain | 0.200 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 0.974 |
| presence landmark2: absent read absent | 1.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.933 |
| presence color: present read present [pooled midpoint (comparison)] | 0.900 |
| presence size: present read present [pooled midpoint (comparison)] | 0.700 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 0.667 |
| presence object: share of FALSE 'present' readings that abstain | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 0.500 |
| set members: first gold member in the decoded set | 1.000 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.117; status {'abstain': 3, 'ok': 38, 'unknown-event': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.976 | 0.519 / 0.413 | 0.98 | 0.000 | 0.000 / 0.024 |
| role object | 0.872 | 0.253 / 0.048 | 0.90 | 0.026 | 0.000 / 0.103 |
| roles (pooled) | 0.864 | 0.304 / 0.019 | 0.87 | 0.029 | 0.019 / 0.107 |
| role relation | 1.000 | 0.233 / 0.138 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark | 1.000 | 0.270 / 0.246 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role shape | 0.875 | 0.374 / 0.106 | 0.88 | 0.000 | 0.000 / 0.125 |
| role color | 0.871 | 0.369 / 0.088 | 0.90 | 0.032 | 0.000 / 0.097 |
| role size | 1.000 | 0.290 / 0.031 | 0.80 | 0.000 | 0.200 / 0.000 |
| role members | 0.000 | 0.054 / 0.047 | 0.50 | 0.500 | 0.000 / 0.500 |

### train (sample) — catalog candidates (n = 300 of 994)
| axis | accuracy |
|---|---|
| FULL | 0.957 |
| FULL [depth given] | 0.957 |
| FULL [depth and negation given] | 0.957 |
| presence object: present read present | 0.993 |
| presence object: share of 'present' readings that abstain | 0.011 |
| presence object: share of true 'present' readings that abstain | 0.011 |
| presence shape: absent read absent | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.004 |
| presence color: share of true 'present' readings that abstain | 0.004 |
| presence size: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.990 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.997 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.967 |
| event type (synonym table) | 0.967 |
| role object | 0.987 |
| head object | 0.987 |
| lexical order head object | 0.963 |
| lexical bag head object | 0.977 |
| occupancy: known filler | 0.985 |
| role shape | 0.993 |
| head shape | 0.993 |
| lexical order head shape | 0.720 |
| lexical bag head shape | 0.867 |
| occupancy: not given | 1.000 |
| role color | 0.990 |
| head color | 0.990 |
| lexical order head color | 1.000 |
| lexical bag head color | 1.000 |
| role size | 0.993 |
| head size | 0.993 |
| lexical order head size | 0.707 |
| lexical bag head size | 0.820 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.923 |
| lexical bag head relation | 0.930 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.920 |
| lexical bag head landmark | 0.930 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.997 |
| lexical bag head landmark2 | 0.997 |
| role members | 0.997 |
| head members | 0.997 |
| lexical order head members | 0.987 |
| lexical bag head members | 0.987 |
| heads FULL (model) | 0.980 |
| heads FULL (lexical order baseline) | 0.490 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.667 |
| presence color: absent read absent | 1.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 1.000 |
| presence members: share of true 'present' readings that abstain | 1.000 |
| set members: first gold member in the decoded set | 0.750 |
| occupancy: unknown filler | 1.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |

residual mean 0.049; status {'ok': 290, 'abstain': 7, 'unknown-event': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.967 | 0.513 / 0.433 | 0.99 | 0.027 | 0.000 / 0.007 |
| role object | 0.986 | 0.324 / 0.170 | 0.98 | 0.004 | 0.011 / 0.011 |
| roles (pooled) | 0.984 | 0.375 / 0.203 | 0.98 | 0.005 | 0.009 / 0.011 |
| role color | 0.987 | 0.415 / 0.238 | 0.99 | 0.004 | 0.004 / 0.008 |
| role relation | 1.000 | 0.420 / 0.323 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark | 1.000 | 0.465 / 0.307 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 0.976 | 0.428 / 0.335 | 0.99 | 0.012 | 0.000 / 0.012 |
| role size | 0.977 | 0.359 / 0.213 | 0.99 | 0.011 | 0.000 / 0.011 |
| role members | 0.750 | 0.032 / 0.015 | 0.00 | 0.000 | 0.750 / 0.250 |
| role landmark2 | 1.000 | 0.140 / 0.140 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.97 COLOR=0.97 VERB=0.85 SIZE=0.76 c9_an=0.47 ARROW=0.46 c14_uh=0.45 it=0.36 PAIR=0.36 c15_on=0.33 c27_them=0.31 NAME=0.27 c23_in=0.27 c17_be=0.27 c26_shape=0.22 are=0.21 SUPER=0.17 c2_now=0.16 c3_rules=0.15 c6_both=0.15 c5_me=0.14 to=0.12 AXIS=0.12 DIR=0.12 LAYOUT=0.12 NOTCOLOR=0.12 RECENT=0.12 STYLE=0.12 c11_what=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c24_line=0.12 c25_pixels=0.12 c8_what's=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 with=0.12 a=0.11 c1_have=0.11 c4_then=0.07 called=0.07 c12_that=0.06 and=0.05 c7_i=0.05 c10_three=0.04 of=0.02 c13_one=0.02 c16_new=0.01 c19_goes=0.01 SHAPE=0.01 QUANT=0.01 the=0.00 c18_does=0.00 unknown=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.762
- heldout_formulations: presence object: present read present 0.895
- heldout_formulations: presence object: share of 'present' readings that abstain 0.029
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: present read present 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.333
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: role object 0.857
- heldout_formulations: head object 0.857
- heldout_formulations: occupancy: known filler 0.870
- heldout_formulations: heads FULL (model) 0.762
- heldout_formulations: heads FULL (lexical order baseline) 0.429
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.548
- heldout_formulations: FULL [depth given] 0.762
- heldout_formulations: FULL [depth and negation given] 0.762
- heldout_formulations: FULL [presence not decided] 0.857
- heldout_formulations: heads FULL (model) [presence not decided] 0.857
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.500
- heldout_formulations: role object [pooled midpoint (comparison)] 0.595
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.595
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence shape: present read present 0.875
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of 'present' readings that abstain 0.200
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.200
- heldout_formulations: presence size: present read present [pooled midpoint (comparison)] 0.700
- heldout_formulations: presence object: absent read absent 0.667
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.500
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence landmark: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.011
- train (sample): presence object: share of true 'present' readings that abstain 0.011
- train (sample): presence color: share of 'present' readings that abstain 0.004
- train (sample): presence color: share of true 'present' readings that abstain 0.004
- train (sample): heads FULL (lexical order baseline) 0.490
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.667
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): set members: first gold member in the decoded set 0.750
- train (sample): presence landmark2: share of 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME is POS NAME and NAME` FULL 0.000 (n 1)
- heldout_formulations: `from_now_on every new SHAPE should be COLOR` FULL 0.000 (n 1)
- heldout_formulations: `NAME and NAME is SIZE` FULL 0.000 (n 1)
- heldout_formulations: `from_now_on , every new SHAPE should be COLOR` FULL 0.000 (n 1)
- heldout_formulations: `NAME COLOR` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role relation | role landmark | role landmark2 | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.762 | 0.762 | 0.857 | 0.952 | 0.905 | 1.000 | 1.000 | 0.976 | 0.976 | 0.929 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.500 | 0.500 | 0.595 | 0.952 | 0.905 | 0.929 | 1.000 | 0.976 | 1.000 | 0.952 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.857 | 0.857 | 0.929 | 1.000 | 0.976 | 1.000 | 1.000 | 0.976 | 0.952 | 0.929 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.895 | 0.667 | 0.781 | 0.029 (1.000 / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.595 | 1.000 | 0.797 |  |
| heldout_formulations | shape | product: fitted | 0.875 | 1.000 | 0.938 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_formulations | color | product: fitted | 0.900 | 1.000 | 0.950 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.900 | 1.000 | 0.950 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.200 (— / 0.200) |
| heldout_formulations | size | comparison: pooled midpoint | 0.700 | 1.000 | 0.850 |  |
| heldout_formulations | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 0.974 | 0.987 | 0.000 (0.000 / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 0.974 | 0.987 | 0.333 (0.000 / 0.500) |
| heldout_formulations | members | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| train (sample) | object | product: fitted | 0.993 | 1.000 | 0.996 | 0.011 (— / 0.011) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.004 (— / 0.004) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
