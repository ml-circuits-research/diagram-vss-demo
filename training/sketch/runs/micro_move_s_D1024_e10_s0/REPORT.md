# REPORT — world `move_s`, legend sha256:c94565dd3fcf… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
3042 annotated sentences from 2 files; provenance: {'llm': 3042}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_move_s_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 149 sentences
- heldout_formulations: 158 sentences
- train: 2735 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
14845 tokens in the examples; 429 with no kind in the lexicon (share 0.029), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 23c01a6. Memory curve: runs/micro_move_s_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.472 [rule: fit; pooled midpoint 3.073 (comparison)] (present 6.145, n 9 / absent -0.000, n 1193517)
- presence:object: threshold 0.673 [rule: fit; pooled midpoint 0.949 (comparison)] (present 1.082, n 527 / absent 0.817, n 22)
- attr_presence:object: threshold 0.555 [rule: fit; pooled midpoint 0.473 (comparison)] (present 0.881, n 9 / absent 0.064, n 530)
- det_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 535)
- presence:relation: threshold 0.318 [rule: fit; pooled midpoint 0.540 (comparison)] (present 0.874, n 226 / absent 0.206, n 323)
- presence:landmark: threshold 0.284 [rule: fit; pooled midpoint 0.631 (comparison)] (present 1.114, n 237 / absent 0.147, n 312)
- presence:landmark2: threshold 0.372 [rule: fit; pooled midpoint 0.550 (comparison)] (present 0.935, n 14 / absent 0.165, n 535)
- presence:region: threshold 0.313 [rule: fit; pooled midpoint 0.540 (comparison)] (present 0.835, n 243 / absent 0.245, n 306)
- presence:direction: threshold 0.397 [rule: fit; pooled midpoint 0.464 (comparison)] (present 0.878, n 33 / absent 0.051, n 516)
- presence:amount: threshold 0.420 [rule: fit; pooled midpoint 0.545 (comparison)] (present 0.996, n 46 / absent 0.094, n 503)
- presence:members: threshold 0.751 [rule: fit; pooled midpoint 3.752 (comparison)] (present 7.349, n 7 / absent 0.156, n 542)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.000, relation 0.067, landmark 0.000, landmark2 0.000, region 0.067, direction 0.250, amount 0.048, members 0.000, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 158 of 158)
| axis | accuracy |
|---|---|
| FULL | 0.785 |
| FULL [depth given] | 0.785 |
| FULL [depth and negation given] | 0.785 |
| FULL [presence not decided] | 0.772 |
| FULL [pooled midpoint (comparison)] | 0.652 |
| presence object: present read present | 0.993 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.819 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.955 |
| presence landmark: share of 'present' readings that abstain | 0.015 |
| presence landmark: share of true 'present' readings that abstain | 0.016 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 0.843 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.968 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.981 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.968 |
| event type (synonym table) | 0.968 |
| role object | 0.956 |
| head object | 0.956 |
| lexical order head object | 0.968 |
| lexical bag head object | 0.766 |
| occupancy: known filler | 0.887 |
| role relation | 0.854 |
| head relation | 0.854 |
| lexical order head relation | 0.532 |
| lexical bag head relation | 0.766 |
| role landmark | 0.949 |
| head landmark | 0.949 |
| lexical order head landmark | 0.557 |
| lexical bag head landmark | 0.525 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.962 |
| lexical bag head landmark2 | 0.956 |
| occupancy: not given | 0.971 |
| role region | 0.854 |
| head region | 0.854 |
| lexical order head region | 0.582 |
| lexical bag head region | 0.759 |
| role direction | 0.987 |
| head direction | 0.987 |
| lexical order head direction | 0.918 |
| lexical bag head direction | 0.943 |
| role amount | 1.000 |
| head amount | 1.000 |
| lexical order head amount | 0.905 |
| lexical bag head amount | 0.943 |
| role members | 0.975 |
| head members | 0.975 |
| lexical order head members | 0.975 |
| lexical bag head members | 0.975 |
| heads FULL (model) | 0.785 |
| heads FULL (lexical order baseline) | 0.006 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.297 |
| role object [presence not decided] | 0.956 |
| role relation [presence not decided] | 0.842 |
| role landmark [presence not decided] | 0.943 |
| role landmark2 [presence not decided] | 0.994 |
| role region [presence not decided] | 0.848 |
| role direction [presence not decided] | 1.000 |
| role amount [presence not decided] | 1.000 |
| role members [presence not decided] | 0.968 |
| heads FULL (model) [presence not decided] | 0.772 |
| role object [pooled midpoint (comparison)] | 0.810 |
| role relation [pooled midpoint (comparison)] | 0.848 |
| role landmark [pooled midpoint (comparison)] | 0.930 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.886 |
| role direction [pooled midpoint (comparison)] | 0.987 |
| role amount [pooled midpoint (comparison)] | 0.994 |
| role members [pooled midpoint (comparison)] | 0.975 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.652 |
| presence object: present read present [pooled midpoint (comparison)] | 0.822 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.803 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.909 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 0.898 |
| presence direction: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence amount: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent | 0.901 |
| presence landmark: absent read absent | 0.988 |
| presence region: present read present | 0.891 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 0.914 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 0.988 |
| presence region: present read present [pooled midpoint (comparison)] | 0.891 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.000 |
| presence amount: share of true 'present' readings that abstain | 0.000 |
| presence amount: present read present [pooled midpoint (comparison)] | 0.933 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| occupancy: unknown filler | 0.944 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 0.714 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.333 |
| set members: first gold member in the decoded set | 0.250 |
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.000 |
| presence direction: present read present | 0.846 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence direction: present read present [pooled midpoint (comparison)] | 0.846 |

residual mean 0.070; status {'ok': 146, 'abstain': 7, 'unknown-event': 5}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.968 | 0.521 / 0.447 | 0.99 | 0.019 | 0.000 / 0.013 |
| role object | 0.967 | 0.348 / 0.250 | 0.99 | 0.027 | 0.000 / 0.007 |
| roles (pooled) | 0.894 | 0.366 / 0.194 | 0.92 | 0.028 | 0.000 / 0.078 |
| role relation | 0.797 | 0.327 / 0.000 | 0.82 | 0.027 | 0.000 / 0.176 |
| role landmark | 0.900 | 0.420 / 0.262 | 0.93 | 0.029 | 0.000 / 0.071 |
| role region | 0.864 | 0.413 / 0.117 | 0.89 | 0.030 | 0.000 / 0.106 |
| role amount | 1.000 | 0.385 / 0.205 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.377 / 0.319 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.000 | 0.131 / 0.000 | 0.25 | 0.250 | 0.000 / 0.750 |
| role direction | 0.846 | 0.313 / 0.043 | 0.85 | 0.000 | 0.000 / 0.154 |

### train (sample) — catalog candidates (n = 300 of 2735)
| axis | accuracy |
|---|---|
| FULL | 0.767 |
| FULL [depth given] | 0.767 |
| FULL [depth and negation given] | 0.767 |
| presence object: present read present | 0.996 |
| presence object: share of 'present' readings that abstain | 0.012 |
| presence object: share of true 'present' readings that abstain | 0.012 |
| presence relation: absent read absent | 0.940 |
| presence landmark: absent read absent | 0.994 |
| presence landmark2: absent read absent | 1.000 |
| presence region: present read present | 0.933 |
| presence region: share of 'present' readings that abstain | 0.007 |
| presence region: share of true 'present' readings that abstain | 0.008 |
| presence direction: absent read absent | 1.000 |
| presence amount: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.910 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.993 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.910 |
| event type (synonym table) | 0.910 |
| role object | 0.903 |
| head object | 0.907 |
| lexical order head object | 0.960 |
| lexical bag head object | 0.950 |
| occupancy: known filler | 0.852 |
| role relation | 0.830 |
| head relation | 0.830 |
| lexical order head relation | 0.597 |
| lexical bag head relation | 0.777 |
| occupancy: not given | 0.978 |
| role landmark | 0.937 |
| head landmark | 0.937 |
| lexical order head landmark | 0.597 |
| lexical bag head landmark | 0.733 |
| role landmark2 | 0.993 |
| head landmark2 | 0.993 |
| lexical order head landmark2 | 0.970 |
| lexical bag head landmark2 | 0.987 |
| role region | 0.867 |
| head region | 0.867 |
| lexical order head region | 0.533 |
| lexical bag head region | 0.783 |
| role direction | 0.990 |
| head direction | 0.990 |
| lexical order head direction | 0.930 |
| lexical bag head direction | 0.983 |
| role amount | 0.990 |
| head amount | 0.990 |
| lexical order head amount | 0.907 |
| lexical bag head amount | 0.987 |
| role members | 0.990 |
| head members | 0.990 |
| lexical order head members | 0.980 |
| lexical bag head members | 0.980 |
| heads FULL (model) | 0.770 |
| heads FULL (lexical order baseline) | 0.023 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.680 |
| presence relation: present read present | 0.771 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.990 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence region: absent read absent | 0.827 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 0.867 |
| presence region: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.667 |
| set members: first gold member in the decoded set | 0.667 |
| occupancy: unknown filler | 0.667 |
| presence landmark: share of FALSE 'present' readings that abstain | 0.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| presence direction: present read present | 1.000 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence amount: present read present | 1.000 |
| presence amount: share of 'present' readings that abstain | 0.000 |
| presence amount: share of true 'present' readings that abstain | 0.000 |
| presence relation: share of FALSE 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |

residual mean 0.146; status {'abstain': 14, 'unknown-event': 26, 'ok': 259, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.910 | 0.508 / 0.433 | 0.96 | 0.050 | 0.000 / 0.040 |
| role object | 0.905 | 0.357 / 0.263 | 0.99 | 0.092 | 0.011 / 0.004 |
| roles (pooled) | 0.845 | 0.382 / 0.227 | 0.94 | 0.097 | 0.004 / 0.058 |
| role region | 0.886 | 0.423 / 0.211 | 0.91 | 0.029 | 0.000 / 0.086 |
| role relation | 0.661 | 0.327 / 0.000 | 0.80 | 0.140 | 0.000 / 0.198 |
| role landmark | 0.851 | 0.439 / 0.339 | 0.98 | 0.124 | 0.000 / 0.025 |
| role landmark2 | 0.778 | 0.326 / 0.225 | 1.00 | 0.222 | 0.000 / 0.000 |
| role members | 0.500 | 0.157 / 0.000 | 0.67 | 0.167 | 0.000 / 0.333 |
| role direction | 0.857 | 0.407 / 0.226 | 1.00 | 0.143 | 0.000 / 0.000 |
| role amount | 0.893 | 0.464 / 0.399 | 1.00 | 0.107 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 and=0.99 NUM=0.89 c23_in=0.84 c1_have=0.81 DIR=0.79 to=0.78 c13_one=0.77 c10_three=0.73 of=0.69 c12_that=0.68 c14_uh=0.53 c22_from=0.53 c6_both=0.49 are=0.47 LAYOUT=0.46 c9_an=0.43 c11_what=0.40 c16_new=0.32 c19_goes=0.31 SHAPE=0.30 c15_on=0.27 QUANT=0.27 c5_me=0.25 c3_rules=0.25 c2_now=0.20 COLOR=0.20 SIZE=0.20 c18_does=0.19 VERB=0.17 NAME=0.15 with=0.12 it=0.12 ARROW=0.12 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 STYLE=0.12 SUPER=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c26_shape=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c4_then=0.09 RECENT=0.08 unknown=0.05 c8_what's=0.04 c17_be=0.02 c27_them=0.01 a=0.01 c7_i=0.00 c25_pixels=0.00 the=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.785
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present 0.819
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.015
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.016
- heldout_formulations: presence region: absent read absent 0.843
- heldout_formulations: occupancy: known filler 0.887
- heldout_formulations: role relation 0.854
- heldout_formulations: head relation 0.854
- heldout_formulations: role region 0.854
- heldout_formulations: head region 0.854
- heldout_formulations: heads FULL (model) 0.785
- heldout_formulations: heads FULL (lexical order baseline) 0.006
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.297
- heldout_formulations: FULL [depth given] 0.785
- heldout_formulations: FULL [depth and negation given] 0.785
- heldout_formulations: FULL [presence not decided] 0.772
- heldout_formulations: role relation [presence not decided] 0.842
- heldout_formulations: role region [presence not decided] 0.848
- heldout_formulations: heads FULL (model) [presence not decided] 0.772
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.652
- heldout_formulations: role object [pooled midpoint (comparison)] 0.810
- heldout_formulations: role relation [pooled midpoint (comparison)] 0.848
- heldout_formulations: role region [pooled midpoint (comparison)] 0.886
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.652
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.822
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.803
- heldout_formulations: presence region: absent read absent [pooled midpoint (comparison)] 0.898
- heldout_formulations: presence region: present read present 0.891
- heldout_formulations: presence region: share of 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: present read present [pooled midpoint (comparison)] 0.891
- heldout_formulations: presence amount: share of 'present' readings that abstain 0.000
- heldout_formulations: presence amount: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence region: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: absent read absent 0.714
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present 0.333
- heldout_formulations: set members: first gold member in the decoded set 0.250
- heldout_formulations: presence relation: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence direction: present read present 0.846
- heldout_formulations: presence direction: share of 'present' readings that abstain 0.000
- heldout_formulations: presence direction: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence direction: present read present [pooled midpoint (comparison)] 0.846
- train (sample): FULL 0.767
- train (sample): presence object: share of 'present' readings that abstain 0.012
- train (sample): presence object: share of true 'present' readings that abstain 0.012
- train (sample): presence region: share of 'present' readings that abstain 0.007
- train (sample): presence region: share of true 'present' readings that abstain 0.008
- train (sample): occupancy: known filler 0.852
- train (sample): role relation 0.830
- train (sample): head relation 0.830
- train (sample): role region 0.867
- train (sample): head region 0.867
- train (sample): heads FULL (model) 0.770
- train (sample): heads FULL (lexical order baseline) 0.023
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.680
- train (sample): FULL [depth given] 0.767
- train (sample): FULL [depth and negation given] 0.767
- train (sample): presence relation: present read present 0.771
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence region: absent read absent 0.827
- train (sample): presence landmark2: share of 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): presence object: absent read absent 0.867
- train (sample): presence region: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence members: present read present 0.667
- train (sample): set members: first gold member in the decoded set 0.667
- train (sample): occupancy: unknown filler 0.667
- train (sample): presence landmark: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.000
- train (sample): presence members: share of true 'present' readings that abstain 0.000
- train (sample): presence direction: share of 'present' readings that abstain 0.000
- train (sample): presence direction: share of true 'present' readings that abstain 0.000
- train (sample): presence amount: share of 'present' readings that abstain 0.000
- train (sample): presence amount: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of FALSE 'present' readings that abstain 0.000
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `move NAME POS` FULL 0.000 (n 5)
- heldout_formulations: `NAME move POS NAME` FULL 0.000 (n 3)
- heldout_formulations: `the NAME move POS c27_them` FULL 0.000 (n 2)
- heldout_formulations: `NAME POS NAME` FULL 0.000 (n 2)
- heldout_formulations: `move the NAME POS` FULL 0.000 (n 2)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role relation | role landmark | role landmark2 | role region | role direction | role amount | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.785 | 0.785 | 0.956 | 0.854 | 0.949 | 1.000 | 0.854 | 0.987 | 1.000 | 0.975 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.652 | 0.652 | 0.810 | 0.848 | 0.930 | 1.000 | 0.886 | 0.987 | 0.994 | 0.975 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.772 | 0.772 | 0.956 | 0.842 | 0.943 | 0.994 | 0.848 | 1.000 | 1.000 | 0.968 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.993 | 0.714 | 0.854 | 0.000 (0.000 / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.822 | 1.000 | 0.911 |  |
| heldout_formulations | relation | product: fitted | 0.819 | 0.901 | 0.860 | 0.000 (0.000 / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.803 | 0.914 | 0.858 |  |
| heldout_formulations | landmark | product: fitted | 0.955 | 0.988 | 0.972 | 0.015 (0.000 / 0.016) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.909 | 0.988 | 0.949 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 0.891 | 0.843 | 0.867 | 0.000 (0.000 / 0.000) |
| heldout_formulations | region | comparison: pooled midpoint | 0.891 | 0.898 | 0.894 |  |
| heldout_formulations | direction | product: fitted | 0.846 | 1.000 | 0.923 | 0.000 (— / 0.000) |
| heldout_formulations | direction | comparison: pooled midpoint | 0.846 | 1.000 | 0.923 |  |
| heldout_formulations | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | amount | comparison: pooled midpoint | 0.933 | 1.000 | 0.967 |  |
| heldout_formulations | members | product: fitted | 0.333 | 1.000 | 0.667 | 0.000 (— / 0.000) |
| heldout_formulations | members | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| train (sample) | object | product: fitted | 0.996 | 0.867 | 0.931 | 0.012 (0.000 / 0.012) |
| train (sample) | relation | product: fitted | 0.771 | 0.940 | 0.856 | 0.000 (0.000 / 0.000) |
| train (sample) | landmark | product: fitted | 0.990 | 0.994 | 0.992 | 0.000 (0.000 / 0.000) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | region | product: fitted | 0.933 | 0.827 | 0.880 | 0.007 (0.000 / 0.008) |
| train (sample) | direction | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | amount | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
