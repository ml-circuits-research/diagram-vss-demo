# REPORT — world `facts`, legend sha256:0607adbd3437… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
861 annotated sentences from 2 files; provenance: {'llm': 861}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_facts_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 43 sentences
- heldout_formulations: 35 sentences
- train: 783 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
3788 tokens in the examples; 100 with no kind in the lexicon (share 0.026), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 1bdf306. Memory curve: runs/micro_facts_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.800 [rule: fit; pooled midpoint 4.005 (comparison)] (present 4.099, n 416 / absent 3.911, n 27)
- presence:shape: threshold 0.634 [rule: fit; pooled midpoint 1.144 (comparison)] (present 2.091, n 91 / absent 0.198, n 352)
- presence:color: threshold 0.649 [rule: fit; pooled midpoint 2.086 (comparison)] (present 3.631, n 333 / absent 0.540, n 110)
- presence:size: threshold 0.667 [rule: fit; pooled midpoint 1.426 (comparison)] (present 2.600, n 106 / absent 0.251, n 337)
- presence:relation: threshold 0.744 [rule: fit; pooled midpoint 2.003 (comparison)] (present 3.870, n 46 / absent 0.136, n 397)
- presence:landmark: threshold 0.423 [rule: fit; pooled midpoint 1.944 (comparison)] (present 3.611, n 46 / absent 0.276, n 397)
- presence:landmark2: threshold 0.240 [rule: fit; pooled midpoint 0.317 (comparison)] (present 0.344, n 7 / absent 0.291, n 439)
- presence:members: threshold 0.237 [rule: fit; pooled midpoint 4.387 (comparison)] (present 8.508, n 14 / absent 0.265, n 429)
- set_member:members: threshold 0.225 [rule: fit; pooled midpoint 4.053 (comparison)] (present 8.106, n 24 / absent -0.001, n 214070)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.062, color 0.056, size 0.143, relation 0.067, landmark 0.002, landmark2 0.002, members 0.002, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 35 of 35)
| axis | accuracy |
|---|---|
| FULL | 0.686 |
| FULL [depth given] | 0.686 |
| FULL [depth and negation given] | 0.686 |
| FULL [presence not decided] | 0.771 |
| FULL [pooled midpoint (comparison)] | 0.000 |
| structure (depth, negation) | 0.829 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.971 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.829 |
| event type (synonym table) | 0.829 |
| role object | 0.743 |
| head object | 0.743 |
| lexical order head object | 0.971 |
| lexical bag head object | 0.629 |
| occupancy: known filler | 0.759 |
| role shape | 0.971 |
| head shape | 0.971 |
| lexical order head shape | 0.600 |
| lexical bag head shape | 0.943 |
| occupancy: not given | 0.995 |
| role color | 0.857 |
| head color | 0.857 |
| lexical order head color | 1.000 |
| lexical bag head color | 1.000 |
| role size | 0.971 |
| head size | 0.971 |
| lexical order head size | 0.886 |
| lexical bag head size | 0.943 |
| role relation | 0.971 |
| head relation | 0.971 |
| lexical order head relation | 0.943 |
| lexical bag head relation | 0.943 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.943 |
| lexical bag head landmark | 0.943 |
| role landmark2 | 0.971 |
| head landmark2 | 0.971 |
| lexical order head landmark2 | 0.971 |
| lexical bag head landmark2 | 0.971 |
| role members | 0.971 |
| head members | 0.971 |
| lexical order head members | 1.000 |
| lexical bag head members | 1.000 |
| heads FULL (model) | 0.686 |
| heads FULL (lexical order baseline) | 0.457 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.514 |
| role object [presence not decided] | 0.800 |
| role shape [presence not decided] | 0.971 |
| role color [presence not decided] | 0.886 |
| role size [presence not decided] | 0.971 |
| role relation [presence not decided] | 1.000 |
| role landmark [presence not decided] | 1.000 |
| role landmark2 [presence not decided] | 0.971 |
| role members [presence not decided] | 0.971 |
| heads FULL (model) [presence not decided] | 0.771 |
| role object [pooled midpoint (comparison)] | 0.029 |
| role shape [pooled midpoint (comparison)] | 0.629 |
| role color [pooled midpoint (comparison)] | 0.257 |
| role size [pooled midpoint (comparison)] | 0.886 |
| role relation [pooled midpoint (comparison)] | 0.943 |
| role landmark [pooled midpoint (comparison)] | 0.943 |
| role landmark2 [pooled midpoint (comparison)] | 0.971 |
| role members [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.000 |
| presence object: present read present | 0.929 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence relation: present read present | 0.500 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.500 |
| presence landmark: share of true 'present' readings that abstain | 0.500 |
| presence landmark2: present read present | 0.000 |
| presence members: absent read absent | 0.966 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| occupancy: unknown filler | 0.880 |
| presence object: present read present [pooled midpoint (comparison)] | 0.000 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 0.955 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.077 |
| presence color: present read present [pooled midpoint (comparison)] | 0.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 1.000 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |

residual mean 0.256; status {'unknown-event': 6, 'ok': 28, 'abstain': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.829 | 0.441 / 0.038 | 0.89 | 0.057 | 0.000 / 0.114 |
| role object | 0.735 | 0.242 / 0.059 | 0.91 | 0.176 | 0.000 / 0.088 |
| roles (pooled) | 0.783 | 0.284 / 0.058 | 0.90 | 0.133 | 0.012 / 0.084 |
| role color | 0.808 | 0.358 / 0.202 | 0.96 | 0.154 | 0.000 / 0.038 |
| role relation | 0.500 | 0.127 / 0.025 | 0.50 | 0.000 | 0.000 / 0.500 |
| role landmark | 1.000 | 0.156 / 0.048 | 0.50 | 0.000 | 0.500 / 0.000 |
| role landmark2 | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role shape | 0.929 | 0.290 / 0.193 | 0.93 | 0.000 | 0.000 / 0.071 |
| role size | 0.750 | 0.356 / 0.305 | 1.00 | 0.250 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 783)
| axis | accuracy |
|---|---|
| FULL | 0.847 |
| FULL [depth given] | 0.847 |
| FULL [depth and negation given] | 0.847 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.012 |
| presence object: share of true 'present' readings that abstain | 0.012 |
| presence shape: absent read absent | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence size: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence members: absent read absent | 0.996 |
| structure (depth, negation) | 0.863 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.973 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.853 |
| event type (synonym table) | 0.853 |
| role object | 0.900 |
| head object | 0.900 |
| lexical order head object | 0.957 |
| lexical bag head object | 0.990 |
| occupancy: known filler | 0.884 |
| role shape | 0.983 |
| head shape | 0.983 |
| lexical order head shape | 0.830 |
| lexical bag head shape | 1.000 |
| occupancy: not given | 0.999 |
| role color | 0.913 |
| head color | 0.913 |
| lexical order head color | 1.000 |
| lexical bag head color | 1.000 |
| role size | 0.983 |
| head size | 0.983 |
| lexical order head size | 0.767 |
| lexical bag head size | 0.917 |
| role relation | 0.980 |
| head relation | 0.980 |
| lexical order head relation | 0.907 |
| lexical bag head relation | 0.933 |
| role landmark | 0.977 |
| head landmark | 0.977 |
| lexical order head landmark | 0.903 |
| lexical bag head landmark | 0.933 |
| role landmark2 | 0.997 |
| head landmark2 | 0.997 |
| lexical order head landmark2 | 0.987 |
| lexical bag head landmark2 | 0.987 |
| role members | 0.973 |
| head members | 0.973 |
| lexical order head members | 0.973 |
| lexical bag head members | 0.973 |
| heads FULL (model) | 0.857 |
| heads FULL (lexical order baseline) | 0.563 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.823 |
| presence color: absent read absent | 1.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.045 |
| presence landmark: share of true 'present' readings that abstain | 0.045 |
| presence shape: present read present | 0.979 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 0.750 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 0.125 |
| occupancy: unknown filler | 0.125 |
| presence members: share of 'present' readings that abstain | 0.500 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of true 'present' readings that abstain | 1.000 |

residual mean 0.170; status {'ok': 254, 'unknown-event': 40, 'abstain': 5, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.853 | 0.468 / 0.052 | 0.90 | 0.047 | 0.000 / 0.100 |
| role object | 0.895 | 0.256 / 0.104 | 0.98 | 0.095 | 0.011 / 0.011 |
| roles (pooled) | 0.875 | 0.306 / 0.116 | 0.96 | 0.093 | 0.007 / 0.032 |
| role color | 0.882 | 0.388 / 0.220 | 0.99 | 0.109 | 0.000 / 0.009 |
| role relation | 0.786 | 0.233 / 0.052 | 0.89 | 0.107 | 0.000 / 0.107 |
| role landmark | 0.759 | 0.348 / 0.000 | 0.83 | 0.103 | 0.034 / 0.138 |
| role shape | 0.902 | 0.283 / 0.185 | 0.94 | 0.039 | 0.000 / 0.059 |
| role size | 0.929 | 0.308 / 0.180 | 0.99 | 0.057 | 0.000 / 0.014 |
| role landmark2 | 0.750 | 0.083 / 0.017 | 0.75 | 0.000 | 0.000 / 0.250 |
| role members | 0.125 | 0.158 / 0.000 | 0.25 | 0.250 | 0.125 / 0.625 |

## Gates (seed 0; OPEN > 0.5)
are=0.95 COLOR=0.95 POS=0.90 of=0.89 a=0.89 VERB=0.79 SIZE=0.72 c14_uh=0.51 c9_an=0.37 NAME=0.32 c1_have=0.31 ARROW=0.30 c23_in=0.25 c15_on=0.16 c17_be=0.15 c5_me=0.14 c10_three=0.14 SUPER=0.14 AXIS=0.12 LAYOUT=0.12 NOTCOLOR=0.12 PAIR=0.12 RECENT=0.12 STYLE=0.12 c11_what=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 c8_what's=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 with=0.12 c3_rules=0.09 c26_shape=0.09 it=0.06 called=0.06 DIR=0.06 c4_then=0.05 c27_them=0.05 c13_one=0.05 c7_i=0.05 c22_from=0.04 c12_that=0.03 to=0.02 the=0.02 c2_now=0.02 c19_goes=0.01 c6_both=0.01 QUANT=0.01 unknown=0.01 SHAPE=0.01 c18_does=0.01 c16_new=0.01 and=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.686
- heldout_formulations: structure (depth, negation) 0.829
- heldout_formulations: predicate (surface lemma) 0.829
- heldout_formulations: event type (synonym table) 0.829
- heldout_formulations: role object 0.743
- heldout_formulations: head object 0.743
- heldout_formulations: occupancy: known filler 0.759
- heldout_formulations: role color 0.857
- heldout_formulations: head color 0.857
- heldout_formulations: heads FULL (model) 0.686
- heldout_formulations: heads FULL (lexical order baseline) 0.457
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.514
- heldout_formulations: FULL [depth given] 0.686
- heldout_formulations: FULL [depth and negation given] 0.686
- heldout_formulations: FULL [presence not decided] 0.771
- heldout_formulations: role object [presence not decided] 0.800
- heldout_formulations: role color [presence not decided] 0.886
- heldout_formulations: heads FULL (model) [presence not decided] 0.771
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.000
- heldout_formulations: role object [pooled midpoint (comparison)] 0.029
- heldout_formulations: role shape [pooled midpoint (comparison)] 0.629
- heldout_formulations: role color [pooled midpoint (comparison)] 0.257
- heldout_formulations: role size [pooled midpoint (comparison)] 0.886
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present 0.500
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.500
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.500
- heldout_formulations: presence landmark2: present read present 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: occupancy: unknown filler 0.880
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence shape: present read present [pooled midpoint (comparison)] 0.077
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence size: present read present [pooled midpoint (comparison)] 0.000
- train (sample): FULL 0.847
- train (sample): presence object: share of 'present' readings that abstain 0.012
- train (sample): presence object: share of true 'present' readings that abstain 0.012
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): structure (depth, negation) 0.863
- train (sample): predicate (surface lemma) 0.853
- train (sample): event type (synonym table) 0.853
- train (sample): occupancy: known filler 0.884
- train (sample): heads FULL (model) 0.857
- train (sample): heads FULL (lexical order baseline) 0.563
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.823
- train (sample): FULL [depth given] 0.847
- train (sample): FULL [depth and negation given] 0.847
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.045
- train (sample): presence landmark: share of true 'present' readings that abstain 0.045
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: present read present 0.750
- train (sample): presence landmark2: share of 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): set members: first gold member in the decoded set 0.125
- train (sample): occupancy: unknown filler 0.125
- train (sample): presence members: share of 'present' readings that abstain 0.500
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME COLOR` FULL 0.000 (n 2)
- heldout_formulations: `from now SHAPE are COLOR` FULL 0.000 (n 1)
- heldout_formulations: `NAME is POS NAME and NAME` FULL 0.000 (n 1)
- heldout_formulations: `from_now_on every new SHAPE should be COLOR` FULL 0.000 (n 1)
- heldout_formulations: `every new SHAPE make SIZE` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role relation | role landmark | role landmark2 | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.686 | 0.686 | 0.743 | 0.971 | 0.857 | 0.971 | 0.971 | 1.000 | 0.971 | 0.971 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.000 | 0.000 | 0.029 | 0.629 | 0.257 | 0.886 | 0.943 | 0.943 | 0.971 | 1.000 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.771 | 0.771 | 0.800 | 0.971 | 0.886 | 0.971 | 1.000 | 1.000 | 0.971 | 0.971 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.929 | 1.000 | 0.964 | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 0.077 | 1.000 | 0.538 |  |
| heldout_formulations | color | product: fitted | 0.955 | 1.000 | 0.977 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | relation | product: fitted | 0.500 | 1.000 | 0.750 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.500 (— / 0.500) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | members | product: fitted | — | 0.966 | — | 0.000 (0.000 / —) |
| heldout_formulations | members | comparison: pooled midpoint | — | 1.000 | — |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.012 (— / 0.012) |
| train (sample) | shape | product: fitted | 0.979 | 1.000 | 0.989 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.045 (— / 0.045) |
| train (sample) | landmark2 | product: fitted | 0.750 | 1.000 | 0.875 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.996 | 0.998 | 0.500 (0.000 / 1.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
