# REPORT — world `check`, legend sha256:cda0ce51c1c3… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
875 annotated sentences from 2 files; provenance: {'llm': 875}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_check_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 41 sentences
- heldout_formulations: 43 sentences
- train: 791 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
4590 tokens in the examples; 35 with no kind in the lexicon (share 0.008), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 1bdf306. Memory curve: runs/micro_check_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 440, absent 4)
- presence:shape: threshold 0.584 [rule: fit; pooled midpoint 0.817 (comparison)] (present 1.547, n 51 / absent 0.086, n 390)
- presence:color: threshold 0.658 [rule: fit; pooled midpoint 0.737 (comparison)] (present 1.387, n 54 / absent 0.087, n 387)
- presence:size: threshold 0.492 [rule: fit; pooled midpoint 0.650 (comparison)] (present 1.240, n 8 / absent 0.060, n 433)
- presence:relation: threshold 0.658 [rule: fit; pooled midpoint 0.773 (comparison)] (present 1.472, n 140 / absent 0.074, n 301)
- presence:landmark: threshold 0.390 [rule: fit; pooled midpoint 0.660 (comparison)] (present 1.155, n 317 / absent 0.165, n 124)
- presence:landmark2: threshold 0.493 [rule: fit; pooled midpoint 0.839 (comparison)] (present 1.512, n 9 / absent 0.166, n 432)
- presence:region: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 443)
- presence:comparison: threshold 0.570 [rule: fit; pooled midpoint 0.531 (comparison)] (present 0.974, n 175 / absent 0.089, n 266)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.062, color 0.056, size 0.143, relation 0.067, landmark 0.001, landmark2 0.001, region 0.067, comparison 0.143, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 43 of 43)
| axis | accuracy |
|---|---|
| FULL | 0.535 |
| FULL [depth given] | 0.535 |
| FULL [depth and negation given] | 0.535 |
| FULL [presence not decided] | 0.581 |
| FULL [pooled midpoint (comparison)] | 0.488 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: present read present | 0.952 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: absent read absent | 1.000 |
| presence comparison: present read present | 0.929 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| structure (depth, negation) | 0.605 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.605 |
| event type (synonym table) | 0.605 |
| role object | 0.605 |
| head object | 0.605 |
| lexical order head object | 1.000 |
| lexical bag head object | 0.651 |
| occupancy: known filler | 0.658 |
| role shape | 0.907 |
| head shape | 0.907 |
| lexical order head shape | 0.860 |
| lexical bag head shape | 0.953 |
| occupancy: not given | 1.000 |
| role color | 0.907 |
| head color | 0.907 |
| lexical order head color | 0.860 |
| lexical bag head color | 0.860 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 1.000 |
| lexical bag head size | 1.000 |
| role relation | 0.791 |
| head relation | 0.791 |
| lexical order head relation | 0.605 |
| lexical bag head relation | 1.000 |
| role landmark | 0.767 |
| head landmark | 0.767 |
| lexical order head landmark | 1.000 |
| lexical bag head landmark | 0.326 |
| role landmark2 | 0.930 |
| head landmark2 | 0.930 |
| lexical order head landmark2 | 0.930 |
| lexical bag head landmark2 | 0.953 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 1.000 |
| lexical bag head region | 1.000 |
| role comparison | 0.977 |
| head comparison | 0.977 |
| lexical order head comparison | 0.674 |
| lexical bag head comparison | 0.977 |
| heads FULL (model) | 0.535 |
| heads FULL (lexical order baseline) | 0.000 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.163 |
| role object [presence not decided] | 0.605 |
| role shape [presence not decided] | 0.907 |
| role color [presence not decided] | 0.907 |
| role size [presence not decided] | 1.000 |
| role relation [presence not decided] | 0.791 |
| role landmark [presence not decided] | 0.767 |
| role landmark2 [presence not decided] | 0.953 |
| role region [presence not decided] | 1.000 |
| role comparison [presence not decided] | 1.000 |
| heads FULL (model) [presence not decided] | 0.581 |
| role object [pooled midpoint (comparison)] | 0.605 |
| role shape [pooled midpoint (comparison)] | 0.907 |
| role color [pooled midpoint (comparison)] | 0.907 |
| role size [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.791 |
| role landmark [pooled midpoint (comparison)] | 0.721 |
| role landmark2 [pooled midpoint (comparison)] | 0.930 |
| role region [pooled midpoint (comparison)] | 1.000 |
| role comparison [pooled midpoint (comparison)] | 0.977 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.488 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.857 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: present read present [pooled midpoint (comparison)] | 0.929 |
| occupancy: unknown filler | 0.500 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence landmark: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: present read present | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.000 |

residual mean 0.432; status {'ok': 26, 'unknown-event': 17}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.605 | 0.331 / 0.015 | 0.72 | 0.116 | 0.000 / 0.279 |
| role object | 0.605 | 0.485 / 0.357 | 1.00 | 0.395 | 0.000 / 0.000 |
| roles (pooled) | 0.597 | 0.453 / 0.310 | 0.96 | 0.361 | 0.000 / 0.042 |
| role landmark | 0.667 | 0.420 / 0.260 | 0.97 | 0.300 | 0.000 / 0.033 |
| role comparison | 0.929 | 0.374 / 0.332 | 0.93 | 0.000 | 0.000 / 0.071 |
| role color | 0.333 | 0.601 / 0.359 | 1.00 | 0.667 | 0.000 / 0.000 |
| role shape | 0.333 | 0.552 / 0.440 | 1.00 | 0.667 | 0.000 / 0.000 |
| role relation | 0.471 | 0.462 / 0.314 | 0.94 | 0.471 | 0.000 / 0.059 |
| role landmark2 | 0.000 | 0.145 / 0.000 | 0.33 | 0.333 | 0.000 / 0.667 |

### train (sample) — catalog candidates (n = 300 of 791)
| axis | accuracy |
|---|---|
| FULL | 0.687 |
| FULL [depth given] | 0.687 |
| FULL [depth and negation given] | 0.687 |
| structure (depth, negation) | 0.693 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.693 |
| event type (synonym table) | 0.693 |
| role object | 0.690 |
| head object | 0.690 |
| lexical order head object | 0.997 |
| lexical bag head object | 0.963 |
| occupancy: known filler | 0.709 |
| role shape | 0.950 |
| head shape | 0.950 |
| lexical order head shape | 0.880 |
| lexical bag head shape | 1.000 |
| occupancy: not given | 0.999 |
| role color | 0.937 |
| head color | 0.937 |
| lexical order head color | 0.833 |
| lexical bag head color | 0.847 |
| role size | 0.993 |
| head size | 0.993 |
| lexical order head size | 0.980 |
| lexical bag head size | 0.983 |
| role relation | 0.840 |
| head relation | 0.840 |
| lexical order head relation | 0.670 |
| lexical bag head relation | 0.997 |
| role landmark | 0.837 |
| head landmark | 0.837 |
| lexical order head landmark | 0.997 |
| lexical bag head landmark | 0.793 |
| role landmark2 | 0.980 |
| head landmark2 | 0.980 |
| lexical order head landmark2 | 0.967 |
| lexical bag head landmark2 | 1.000 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 1.000 |
| lexical bag head region | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.680 |
| lexical bag head comparison | 1.000 |
| heads FULL (model) | 0.687 |
| heads FULL (lexical order baseline) | 0.043 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.780 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: present read present | 0.993 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence landmark: absent read absent | 1.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |

residual mean 0.312; status {'unknown-event': 92, 'ok': 208}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.693 | 0.360 / 0.014 | 0.75 | 0.057 | 0.000 / 0.250 |
| role object | 0.692 | 0.528 / 0.419 | 1.00 | 0.308 | 0.000 / 0.000 |
| roles (pooled) | 0.709 | 0.482 / 0.361 | 1.00 | 0.290 | 0.000 / 0.001 |
| role relation | 0.515 | 0.442 / 0.289 | 1.00 | 0.485 | 0.000 / 0.000 |
| role landmark | 0.751 | 0.455 / 0.384 | 0.99 | 0.244 | 0.000 / 0.005 |
| role landmark2 | 0.400 | 0.371 / 0.124 | 1.00 | 0.600 | 0.000 / 0.000 |
| role comparison | 1.000 | 0.404 / 0.349 | 1.00 | 0.000 | 0.000 / 0.000 |
| role color | 0.620 | 0.503 / 0.349 | 1.00 | 0.380 | 0.000 / 0.000 |
| role size | 0.667 | 0.451 / 0.381 | 1.00 | 0.333 | 0.000 / 0.000 |
| role shape | 0.583 | 0.562 / 0.440 | 1.00 | 0.417 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 SIZE=0.99 VERB=0.96 SHAPE=0.95 COLOR=0.95 and=0.86 SUPER=0.55 a=0.53 c15_on=0.49 c12_that=0.42 c19_goes=0.38 c16_new=0.30 c13_one=0.29 it=0.28 to=0.19 are=0.18 c7_i=0.18 c14_uh=0.17 ARROW=0.12 AXIS=0.12 DIR=0.12 LAYOUT=0.12 NOTCOLOR=0.12 PAIR=0.12 QUANT=0.12 RECENT=0.12 STYLE=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c23_in=0.12 c24_line=0.12 c25_pixels=0.12 c27_them=0.12 c3_rules=0.12 c8_what's=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 with=0.12 c9_an=0.11 c6_both=0.11 c26_shape=0.11 named=0.11 NAME=0.10 c5_me=0.09 c10_three=0.09 c17_be=0.09 c4_then=0.07 of=0.06 c18_does=0.06 c2_now=0.02 c11_what=0.02 c1_have=0.01 unknown=0.01 the=0.01

## What is weak, what to add
- heldout_formulations: FULL 0.535
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: structure (depth, negation) 0.605
- heldout_formulations: predicate (surface lemma) 0.605
- heldout_formulations: event type (synonym table) 0.605
- heldout_formulations: role object 0.605
- heldout_formulations: head object 0.605
- heldout_formulations: occupancy: known filler 0.658
- heldout_formulations: role relation 0.791
- heldout_formulations: head relation 0.791
- heldout_formulations: role landmark 0.767
- heldout_formulations: head landmark 0.767
- heldout_formulations: heads FULL (model) 0.535
- heldout_formulations: heads FULL (lexical order baseline) 0.000
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.163
- heldout_formulations: FULL [depth given] 0.535
- heldout_formulations: FULL [depth and negation given] 0.535
- heldout_formulations: FULL [presence not decided] 0.581
- heldout_formulations: role object [presence not decided] 0.605
- heldout_formulations: role relation [presence not decided] 0.791
- heldout_formulations: role landmark [presence not decided] 0.767
- heldout_formulations: heads FULL (model) [presence not decided] 0.581
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.488
- heldout_formulations: role object [pooled midpoint (comparison)] 0.605
- heldout_formulations: role relation [pooled midpoint (comparison)] 0.791
- heldout_formulations: role landmark [pooled midpoint (comparison)] 0.721
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.488
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.857
- heldout_formulations: occupancy: unknown filler 0.500
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: present read present 0.000
- heldout_formulations: presence landmark2: present read present [pooled midpoint (comparison)] 0.000
- train (sample): FULL 0.687
- train (sample): structure (depth, negation) 0.693
- train (sample): predicate (surface lemma) 0.693
- train (sample): event type (synonym table) 0.693
- train (sample): role object 0.690
- train (sample): head object 0.690
- train (sample): occupancy: known filler 0.709
- train (sample): role relation 0.840
- train (sample): head relation 0.840
- train (sample): role landmark 0.837
- train (sample): head landmark 0.837
- train (sample): heads FULL (model) 0.687
- train (sample): heads FULL (lexical order baseline) 0.043
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.780
- train (sample): FULL [depth given] 0.687
- train (sample): FULL [depth and negation given] 0.687
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence comparison: share of 'present' readings that abstain 0.000
- train (sample): presence comparison: share of true 'present' readings that abstain 0.000
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `is NAME POS NAME` FULL 0.000 (n 6)
- heldout_formulations: `is NAME COLOR` FULL 0.000 (n 4)
- heldout_formulations: `is NAME a SHAPE` FULL 0.000 (n 2)
- heldout_formulations: `is_q the NAME POS the NAME and the NAME` FULL 0.000 (n 2)
- heldout_formulations: `is NAME POS the NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role relation | role landmark | role landmark2 | role region | role comparison |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.535 | 0.535 | 0.605 | 0.907 | 0.907 | 1.000 | 0.791 | 0.767 | 0.930 | 1.000 | 0.977 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.488 | 0.488 | 0.605 | 0.907 | 0.907 | 1.000 | 0.791 | 0.721 | 0.930 | 1.000 | 0.977 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.581 | 0.581 | 0.605 | 0.907 | 0.907 | 1.000 | 0.791 | 0.767 | 0.953 | 1.000 | 1.000 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | size | product: fitted | — | 1.000 | — |  |
| heldout_formulations | size | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | landmark | product: fitted | 0.952 | 1.000 | 0.976 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.857 | 1.000 | 0.929 |  |
| heldout_formulations | landmark2 | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | comparison | product: fitted | 0.929 | 1.000 | 0.964 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 0.929 | 1.000 | 0.964 |  |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.993 | 1.000 | 0.997 | 0.000 (— / 0.000) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
