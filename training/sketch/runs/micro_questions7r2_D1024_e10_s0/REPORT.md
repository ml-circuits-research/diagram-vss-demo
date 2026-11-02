# REPORT — world `questions7r2`, legend sha256:ea7abf14f3aa… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
4975 annotated sentences from 2 files; provenance: {'llm': 4975}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_questions7r2_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 218 sentences
- heldout_formulations: 225 sentences
- train: 4532 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
22698 tokens in the examples; 787 with no kind in the lexicon (share 0.035), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cuda, codes path+chainL+bigram, gates learned (closed start). Code commit 695642a. Memory curve: runs/micro_questions7r2_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.518 [rule: fit; pooled midpoint 0.970 (comparison)] (present 1.763, n 2597 / absent 0.177, n 2153)
- presence:color: threshold 0.409 [rule: fit; pooled midpoint 0.749 (comparison)] (present 1.461, n 186 / absent 0.037, n 4564)
- presence:relation: threshold 0.371 [rule: fit; pooled midpoint 0.533 (comparison)] (present 1.039, n 167 / absent 0.027, n 4583)
- presence:landmark: threshold 0.218 [rule: fit; pooled midpoint 0.420 (comparison)] (present 0.765, n 645 / absent 0.074, n 4105)
- presence:landmark2: threshold 0.348 [rule: fit; pooled midpoint 0.276 (comparison)] (present 0.498, n 5 / absent 0.055, n 4745)
- presence:relation2: threshold 0.404 [rule: fit; pooled midpoint 0.556 (comparison)] (present 1.084, n 15 / absent 0.028, n 4735)
- presence:landmark3: threshold 0.271 [rule: fit; pooled midpoint 0.342 (comparison)] (present 0.628, n 40 / absent 0.055, n 4710)
- presence:region: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 4747)
- presence:notcolor: threshold 0.608 [rule: fit; pooled midpoint 0.563 (comparison)] (present 1.102, n 122 / absent 0.025, n 4628)
- presence:superlative: threshold 0.646 [rule: fit; pooled midpoint 0.504 (comparison)] (present 1.004, n 1679 / absent 0.004, n 3071)
- presence:members: threshold 0.677 [rule: fit; pooled midpoint 0.310 (comparison)] (present 0.600, n 7 / absent 0.020, n 4743)
- attr_presence:object: threshold 0.198 [rule: fit; pooled midpoint 0.409 (comparison)] (present 0.746, n 137 / absent 0.072, n 2460)
- det_presence:object: threshold 0.606 [rule: fit; pooled midpoint 0.522 (comparison)] (present 1.013, n 11 / absent 0.030, n 2586)
- set_member:members: threshold 0.143 [rule: fit; pooled midpoint 0.218 (comparison)] (present 0.436, n 12 / absent -0.000, n 676788)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, color 0.056, relation 0.067, landmark 0.001, landmark2 0.001, relation2 0.067, landmark3 0.001, region 0.067, notcolor 0.056, superlative 0.100, members 0.001, predicate 0.071

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 225)
| axis | accuracy |
|---|---|
| FULL | 0.893 |
| FULL [pooled midpoint (comparison)] | 0.660 |
| presence object: absent read absent | 0.959 |
| presence color: absent read absent | 0.993 |
| presence relation: absent read absent | 0.993 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence relation2: absent read absent | 1.000 |
| presence landmark3: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.967 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.947 |
| event type (synonym table) | 0.947 |
| role object | 0.927 |
| head object | 0.940 |
| lexical order head object | 0.807 |
| lexical bag head object | 0.867 |
| occupancy: not given | 0.997 |
| role color | 0.993 |
| head color | 0.993 |
| lexical order head color | 0.933 |
| lexical bag head color | 0.960 |
| role relation | 0.993 |
| head relation | 0.993 |
| lexical order head relation | 0.947 |
| lexical bag head relation | 0.973 |
| role landmark | 0.993 |
| head landmark | 0.993 |
| lexical order head landmark | 0.853 |
| lexical bag head landmark | 0.967 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 1.000 |
| lexical bag head landmark2 | 1.000 |
| role relation2 | 1.000 |
| head relation2 | 1.000 |
| lexical order head relation2 | 0.993 |
| lexical bag head relation2 | 0.993 |
| role landmark3 | 0.987 |
| head landmark3 | 0.987 |
| lexical order head landmark3 | 0.980 |
| lexical bag head landmark3 | 0.980 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 1.000 |
| lexical bag head region | 1.000 |
| role notcolor | 0.987 |
| head notcolor | 0.987 |
| lexical order head notcolor | 0.967 |
| lexical bag head notcolor | 0.987 |
| role superlative | 0.993 |
| head superlative | 0.993 |
| lexical order head superlative | 0.653 |
| lexical bag head superlative | 0.953 |
| role members | 1.000 |
| head members | 1.000 |
| lexical order head members | 1.000 |
| lexical bag head members | 1.000 |
| heads FULL (model) | 0.907 |
| heads FULL (lexical order baseline) | 0.440 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.760 |
| role object [pooled midpoint (comparison)] | 0.747 |
| role color [pooled midpoint (comparison)] | 0.980 |
| role relation [pooled midpoint (comparison)] | 0.993 |
| role landmark [pooled midpoint (comparison)] | 0.973 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role relation2 [pooled midpoint (comparison)] | 0.993 |
| role landmark3 [pooled midpoint (comparison)] | 0.987 |
| role region [pooled midpoint (comparison)] | 1.000 |
| role notcolor [pooled midpoint (comparison)] | 0.987 |
| role superlative [pooled midpoint (comparison)] | 0.993 |
| role members [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.673 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 0.993 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark3: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence notcolor: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence superlative: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: present read present | 0.986 |
| presence object: share of 'present' readings that abstain | 0.014 |
| presence object: share of true 'present' readings that abstain | 0.014 |
| presence superlative: present read present | 0.981 |
| presence superlative: share of 'present' readings that abstain | 0.039 |
| presence superlative: share of true 'present' readings that abstain | 0.039 |
| occupancy: known filler | 0.928 |
| presence object: present read present [pooled midpoint (comparison)] | 0.563 |
| presence superlative: present read present [pooled midpoint (comparison)] | 0.981 |
| presence landmark: present read present | 0.955 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| occupancy: unknown filler | 0.960 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.818 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.800 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.111 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.875 |
| presence notcolor: present read present | 0.750 |
| presence notcolor: present read present [pooled midpoint (comparison)] | 0.750 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence relation2: present read present | 1.000 |
| presence relation2: share of 'present' readings that abstain | 0.000 |
| presence relation2: share of true 'present' readings that abstain | 0.000 |
| presence landmark3: present read present | 0.333 |
| presence landmark3: share of 'present' readings that abstain | 0.000 |
| presence landmark3: share of true 'present' readings that abstain | 0.000 |
| presence relation2: present read present [pooled midpoint (comparison)] | 0.000 |
| presence landmark3: present read present [pooled midpoint (comparison)] | 0.333 |
| presence relation: share of FALSE 'present' readings that abstain | 1.000 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.155; status {'ok': 140, 'abstain': 5, 'unknown-event': 5}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.947 | 0.613 / 0.394 | 0.97 | 0.020 | 0.000 / 0.033 |
| role object | 0.896 | 0.460 / 0.252 | 0.97 | 0.091 | 0.013 / 0.013 |
| roles (pooled) | 0.921 | 0.391 / 0.143 | 0.95 | 0.045 | 0.017 / 0.034 |
| role superlative | 0.981 | 0.334 / 0.215 | 0.94 | 0.000 | 0.038 / 0.019 |
| role landmark | 0.955 | 0.326 / 0.144 | 0.95 | 0.000 | 0.000 / 0.045 |
| role color | 1.000 | 0.441 / 0.145 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 1.000 | 0.411 / 0.214 | 1.00 | 0.000 | 0.000 / 0.000 |
| role notcolor | 0.600 | 0.352 / 0.152 | 0.80 | 0.200 | 0.000 / 0.200 |
| role relation2 | 1.000 | 0.054 / 0.054 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark3 | 0.333 | 0.026 / 0.000 | 0.33 | 0.000 | 0.000 / 0.667 |

### train (sample) — catalog candidates (n = 150 of 4532)
| axis | accuracy |
|---|---|
| FULL | 0.880 |
| presence object: absent read absent | 0.959 |
| presence color: absent read absent | 0.993 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence relation2: absent read absent | 1.000 |
| presence landmark3: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| presence superlative: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.980 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.913 |
| event type (synonym table) | 0.913 |
| role object | 0.953 |
| head object | 0.953 |
| lexical order head object | 0.767 |
| lexical bag head object | 0.960 |
| occupancy: not given | 0.997 |
| role color | 0.993 |
| head color | 0.993 |
| lexical order head color | 0.960 |
| lexical bag head color | 1.000 |
| role relation | 0.993 |
| head relation | 0.993 |
| lexical order head relation | 0.973 |
| lexical bag head relation | 0.993 |
| role landmark | 0.993 |
| head landmark | 0.993 |
| lexical order head landmark | 0.880 |
| lexical bag head landmark | 0.993 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 1.000 |
| lexical bag head landmark2 | 1.000 |
| role relation2 | 1.000 |
| head relation2 | 1.000 |
| lexical order head relation2 | 0.993 |
| lexical bag head relation2 | 1.000 |
| role landmark3 | 1.000 |
| head landmark3 | 1.000 |
| lexical order head landmark3 | 0.993 |
| lexical bag head landmark3 | 1.000 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 1.000 |
| lexical bag head region | 1.000 |
| role notcolor | 1.000 |
| head notcolor | 1.000 |
| lexical order head notcolor | 0.967 |
| lexical bag head notcolor | 1.000 |
| role superlative | 0.987 |
| head superlative | 0.987 |
| lexical order head superlative | 0.673 |
| lexical bag head superlative | 1.000 |
| role members | 1.000 |
| head members | 1.000 |
| lexical order head members | 0.993 |
| lexical bag head members | 0.993 |
| heads FULL (model) | 0.933 |
| heads FULL (lexical order baseline) | 0.453 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.947 |
| presence superlative: present read present | 0.959 |
| presence superlative: share of 'present' readings that abstain | 0.000 |
| presence superlative: share of true 'present' readings that abstain | 0.000 |
| occupancy: known filler | 0.950 |
| presence object: present read present | 0.986 |
| presence object: share of 'present' readings that abstain | 0.026 |
| presence object: share of true 'present' readings that abstain | 0.027 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of FALSE 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence notcolor: present read present | 1.000 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 1.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 1.000 |
| presence members: share of true 'present' readings that abstain | 1.000 |
| set members: first gold member in the decoded set | 1.000 |
| occupancy: unknown filler | 1.000 |
| presence relation2: present read present | 1.000 |
| presence relation2: share of 'present' readings that abstain | 0.000 |
| presence relation2: share of true 'present' readings that abstain | 0.000 |
| presence landmark3: present read present | 1.000 |
| presence landmark3: share of 'present' readings that abstain | 0.000 |
| presence landmark3: share of true 'present' readings that abstain | 0.000 |

residual mean 0.173; status {'ok': 139, 'abstain': 8, 'unknown-event': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.913 | 0.636 / 0.443 | 0.95 | 0.040 | 0.000 / 0.047 |
| role superlative | 0.959 | 0.360 / 0.232 | 0.96 | 0.000 | 0.000 / 0.041 |
| roles (pooled) | 0.951 | 0.420 / 0.232 | 0.96 | 0.025 | 0.019 / 0.025 |
| role object | 0.948 | 0.463 / 0.253 | 0.95 | 0.026 | 0.026 / 0.026 |
| role landmark | 0.944 | 0.382 / 0.269 | 1.00 | 0.056 | 0.000 / 0.000 |
| role notcolor | 1.000 | 0.472 / 0.423 | 1.00 | 0.000 | 0.000 / 0.000 |
| role color | 1.000 | 0.445 / 0.318 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.750 | 0.543 / 0.499 | 1.00 | 0.250 | 0.000 / 0.000 |
| role members | 1.000 | 0.014 / 0.014 | 0.00 | 0.000 | 1.000 / 0.000 |
| role relation2 | 1.000 | 0.387 / 0.387 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark3 | 1.000 | 0.229 / 0.229 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=1.00 SUPER=1.00 SHAPE=1.00 NAME=1.00 NOTCOLOR=1.00 c3_rules=0.99 c18_does=0.90 c15_on=0.79 VERB=0.78 DIR=0.77 c1_have=0.74 c14_uh=0.72 with=0.70 c8_what's=0.67 c7_i=0.67 c11_what=0.67 c6_both=0.67 it=0.65 COLOR=0.61 QUANT=0.55 c4_then=0.52 the=0.50 are=0.48 c9_an=0.40 c23_in=0.33 c24_line=0.31 c5_me=0.28 and=0.27 unknown=0.23 PAIR=0.22 a=0.13 c26_shape=0.13 ARROW=0.12 AXIS=0.12 STYLE=0.12 c21_arrowheads=0.12 c22_from=0.12 c25_pixels=0.12 called=0.12 labeled=0.12 lines=0.12 named=0.12 to=0.12 SIZE=0.11 c19_goes=0.09 LAYOUT=0.07 directly=0.06 c20_arrow=0.05 c27_them=0.04 RECENT=0.00 c10_three=0.00 c2_now=0.00 c17_be=0.00 c13_one=0.00 c16_new=0.00 c12_that=0.00 of=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.893
- heldout_formulations: heads FULL (lexical order baseline) 0.440
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.760
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.660
- heldout_formulations: role object [pooled midpoint (comparison)] 0.747
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.673
- heldout_formulations: presence object: share of 'present' readings that abstain 0.014
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.014
- heldout_formulations: presence superlative: share of 'present' readings that abstain 0.039
- heldout_formulations: presence superlative: share of true 'present' readings that abstain 0.039
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.563
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.818
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.800
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.111
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.875
- heldout_formulations: presence notcolor: present read present 0.750
- heldout_formulations: presence notcolor: present read present [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence notcolor: share of 'present' readings that abstain 0.000
- heldout_formulations: presence notcolor: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation2: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark3: present read present 0.333
- heldout_formulations: presence landmark3: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark3: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation2: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence landmark3: present read present [pooled midpoint (comparison)] 0.333
- heldout_formulations: presence color: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.880
- train (sample): heads FULL (lexical order baseline) 0.453
- train (sample): presence superlative: share of 'present' readings that abstain 0.000
- train (sample): presence superlative: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.026
- train (sample): presence object: share of true 'present' readings that abstain 0.027
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence notcolor: share of 'present' readings that abstain 0.000
- train (sample): presence notcolor: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence relation2: share of 'present' readings that abstain 0.000
- train (sample): presence relation2: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark3: share of 'present' readings that abstain 0.000
- train (sample): presence landmark3: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `how COLOR c7_i are there` FULL 0.000 (n 2)
- heldout_formulations: `is n_n1 extreme_q SUPER` FULL 0.000 (n 1)
- heldout_formulations: `which are still pending , meaning the ones that are NOTCOLOR` FULL 0.000 (n 1)
- heldout_formulations: `which are linked closest NAME` FULL 0.000 (n 1)
- heldout_formulations: `which the c3_rules you're using` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role color | role relation | role landmark | role landmark2 | role relation2 | role landmark3 | role region | role notcolor | role superlative | role members |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.907 | 0.893 | 0.927 | 0.993 | 0.993 | 0.993 | 1.000 | 1.000 | 0.987 | 1.000 | 0.987 | 0.993 | 1.000 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.673 | 0.660 | 0.747 | 0.980 | 0.993 | 0.973 | 1.000 | 0.993 | 0.987 | 1.000 | 0.987 | 0.993 | 1.000 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.986 | 0.959 | 0.973 | 0.014 (0.000 / 0.014) |
| heldout_formulations | object | comparison: pooled midpoint | 0.563 | 1.000 | 0.782 |  |
| heldout_formulations | color | product: fitted | 1.000 | 0.993 | 0.996 | 0.000 (0.000 / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.800 | 0.993 | 0.896 |  |
| heldout_formulations | relation | product: fitted | 1.000 | 0.993 | 0.996 | 0.111 (1.000 / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.875 | 1.000 | 0.938 |  |
| heldout_formulations | landmark | product: fitted | 0.955 | 1.000 | 0.977 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.818 | 1.000 | 0.909 |  |
| heldout_formulations | relation2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | relation2 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark3 | product: fitted | 0.333 | 1.000 | 0.667 | 0.000 (— / 0.000) |
| heldout_formulations | landmark3 | comparison: pooled midpoint | 0.333 | 1.000 | 0.667 |  |
| heldout_formulations | notcolor | product: fitted | 0.750 | 1.000 | 0.875 | 0.000 (— / 0.000) |
| heldout_formulations | notcolor | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_formulations | superlative | product: fitted | 0.981 | 1.000 | 0.990 | 0.039 (— / 0.039) |
| heldout_formulations | superlative | comparison: pooled midpoint | 0.981 | 1.000 | 0.990 |  |
| heldout_formulations | members | product: fitted | — | 1.000 | — |  |
| heldout_formulations | members | comparison: pooled midpoint | — | 1.000 | — |  |
| train (sample) | object | product: fitted | 0.986 | 0.959 | 0.973 | 0.026 (0.000 / 0.027) |
| train (sample) | color | product: fitted | 1.000 | 0.993 | 0.996 | 0.000 (0.000 / 0.000) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark3 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | notcolor | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | superlative | product: fitted | 0.959 | 1.000 | 0.980 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 1.000 (— / 1.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
