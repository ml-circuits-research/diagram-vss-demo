# REPORT — world `check_w`, legend sha256:cda0ce51c1c3… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1002 annotated sentences from 2 files; provenance: {'llm': 1002}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_check_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 52 sentences
- heldout_formulations: 42 sentences
- train: 908 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
4809 tokens in the examples; 55 with no kind in the lexicon (share 0.011), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit f9dc7da. Memory curve: runs/micro_check_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.486 [rule: fit; pooled midpoint 0.646 (comparison)] (present 1.021, n 447 / absent 0.271, n 5)
- attr_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 448)
- presence:shape: threshold 0.446 [rule: fit; pooled midpoint 0.540 (comparison)] (present 1.003, n 45 / absent 0.078, n 407)
- presence:color: threshold 0.506 [rule: fit; pooled midpoint 0.565 (comparison)] (present 1.061, n 52 / absent 0.068, n 400)
- presence:size: threshold 0.238 [rule: fit; pooled midpoint 0.206 (comparison)] (present 0.364, n 9 / absent 0.049, n 443)
- presence:relation: threshold 0.446 [rule: fit; pooled midpoint 0.550 (comparison)] (present 1.029, n 153 / absent 0.070, n 299)
- presence:landmark: threshold 0.697 [rule: fit; pooled midpoint 0.562 (comparison)] (present 0.983, n 331 / absent 0.142, n 121)
- presence:landmark2: threshold 0.245 [rule: fit; pooled midpoint 0.375 (comparison)] (present 0.607, n 16 / absent 0.144, n 436)
- presence:region: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 455)
- presence:comparison: threshold 0.668 [rule: fit; pooled midpoint 0.524 (comparison)] (present 0.952, n 179 / absent 0.097, n 273)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, shape 0.062, color 0.056, size 0.143, relation 0.067, landmark 0.001, landmark2 0.001, region 0.067, comparison 0.143, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 42 of 42)
| axis | accuracy |
|---|---|
| FULL | 0.905 |
| FULL [depth given] | 0.905 |
| FULL [depth and negation given] | 0.905 |
| FULL [presence not decided] | 0.738 |
| FULL [pooled midpoint (comparison)] | 0.857 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.024 |
| presence object: share of true 'present' readings that abstain | 0.024 |
| presence shape: absent read absent | 1.000 |
| presence color: present read present | 0.889 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence size: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| role object | 1.000 |
| head object | 1.000 |
| lexical order head object | 1.000 |
| lexical bag head object | 0.714 |
| occupancy: known filler | 0.947 |
| role shape | 1.000 |
| head shape | 1.000 |
| lexical order head shape | 0.857 |
| lexical bag head shape | 0.929 |
| occupancy: not given | 1.000 |
| role color | 0.976 |
| head color | 0.976 |
| lexical order head color | 0.786 |
| lexical bag head color | 0.786 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.952 |
| lexical bag head size | 0.952 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.762 |
| lexical bag head relation | 0.833 |
| role landmark | 0.952 |
| head landmark | 0.952 |
| lexical order head landmark | 0.976 |
| lexical bag head landmark | 0.357 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.952 |
| lexical bag head landmark2 | 0.952 |
| role region | 0.976 |
| head region | 0.976 |
| lexical order head region | 0.976 |
| lexical bag head region | 0.976 |
| role comparison | 0.976 |
| head comparison | 0.976 |
| lexical order head comparison | 0.690 |
| lexical bag head comparison | 0.857 |
| heads FULL (model) | 0.905 |
| heads FULL (lexical order baseline) | 0.024 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.143 |
| role object [presence not decided] | 1.000 |
| role shape [presence not decided] | 1.000 |
| role color [presence not decided] | 0.976 |
| role size [presence not decided] | 0.833 |
| role relation [presence not decided] | 1.000 |
| role landmark [presence not decided] | 0.976 |
| role landmark2 [presence not decided] | 1.000 |
| role region [presence not decided] | 0.952 |
| role comparison [presence not decided] | 0.952 |
| heads FULL (model) [presence not decided] | 0.738 |
| role object [pooled midpoint (comparison)] | 0.976 |
| role shape [pooled midpoint (comparison)] | 1.000 |
| role color [pooled midpoint (comparison)] | 0.976 |
| role size [pooled midpoint (comparison)] | 0.976 |
| role relation [pooled midpoint (comparison)] | 1.000 |
| role landmark [pooled midpoint (comparison)] | 0.952 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.976 |
| role comparison [pooled midpoint (comparison)] | 0.952 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.857 |
| presence object: present read present [pooled midpoint (comparison)] | 0.976 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.889 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence comparison: absent read absent [pooled midpoint (comparison)] | 0.966 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence color: absent read absent | 1.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.913 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| occupancy: unknown filler | 0.970 |
| presence relation: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.913 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.500 |
| presence comparison: present read present | 0.923 |
| presence comparison: share of 'present' readings that abstain | 0.000 |
| presence comparison: share of true 'present' readings that abstain | 0.000 |
| presence comparison: present read present [pooled midpoint (comparison)] | 0.923 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |

residual mean 0.051; status {'ok': 41, 'abstain': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.502 / 0.411 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 1.000 | 0.501 / 0.439 | 0.98 | 0.000 | 0.024 / 0.000 |
| roles (pooled) | 0.954 | 0.401 / 0.179 | 0.94 | 0.000 | 0.009 / 0.046 |
| role color | 0.889 | 0.477 / 0.346 | 0.89 | 0.000 | 0.000 / 0.111 |
| role shape | 1.000 | 0.564 / 0.536 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 1.000 | 0.482 / 0.380 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark | 0.913 | 0.255 / 0.149 | 0.91 | 0.000 | 0.000 / 0.087 |
| role size | 1.000 | 0.107 / 0.072 | 1.00 | 0.000 | 0.000 / 0.000 |
| role comparison | 0.923 | 0.263 / 0.175 | 0.92 | 0.000 | 0.000 / 0.077 |
| role region | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role landmark2 | 1.000 | 0.171 / 0.149 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 908)
| axis | accuracy |
|---|---|
| FULL | 0.973 |
| FULL [depth given] | 0.973 |
| FULL [depth and negation given] | 0.973 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 0.977 |
| presence landmark: share of 'present' readings that abstain | 0.000 |
| presence landmark: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.111 |
| presence landmark2: share of true 'present' readings that abstain | 0.111 |
| presence comparison: absent read absent | 1.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| role object | 0.993 |
| head object | 0.997 |
| lexical order head object | 0.983 |
| lexical bag head object | 0.963 |
| occupancy: known filler | 0.993 |
| role shape | 1.000 |
| head shape | 1.000 |
| lexical order head shape | 0.887 |
| lexical bag head shape | 0.990 |
| occupancy: not given | 0.999 |
| role color | 1.000 |
| head color | 1.000 |
| lexical order head color | 0.883 |
| lexical bag head color | 0.890 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.977 |
| lexical bag head size | 0.983 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.687 |
| lexical bag head relation | 0.847 |
| role landmark | 0.983 |
| head landmark | 0.983 |
| lexical order head landmark | 0.987 |
| lexical bag head landmark | 0.817 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.970 |
| lexical bag head landmark2 | 0.973 |
| role region | 0.997 |
| head region | 0.997 |
| lexical order head region | 0.997 |
| lexical bag head region | 1.000 |
| role comparison | 1.000 |
| head comparison | 1.000 |
| lexical order head comparison | 0.587 |
| lexical bag head comparison | 0.857 |
| heads FULL (model) | 0.977 |
| heads FULL (lexical order baseline) | 0.017 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.530 |
| presence landmark2: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence comparison: present read present | 1.000 |
| presence comparison: share of 'present' readings that abstain | 0.016 |
| presence comparison: share of true 'present' readings that abstain | 0.016 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence landmark: absent read absent | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent | 0.667 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.040; status {'ok': 297, 'abstain': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.500 / 0.445 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 0.997 | 0.497 / 0.423 | 1.00 | 0.003 | 0.000 / 0.000 |
| roles (pooled) | 0.991 | 0.402 / 0.227 | 0.99 | 0.001 | 0.004 / 0.007 |
| role relation | 1.000 | 0.482 / 0.456 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark | 0.977 | 0.279 / 0.186 | 0.98 | 0.000 | 0.000 / 0.023 |
| role landmark2 | 1.000 | 0.244 / 0.115 | 0.89 | 0.000 | 0.111 / 0.000 |
| role comparison | 1.000 | 0.273 / 0.130 | 0.98 | 0.000 | 0.016 / 0.000 |
| role color | 1.000 | 0.549 / 0.522 | 1.00 | 0.000 | 0.000 / 0.000 |
| role size | 1.000 | 0.226 / 0.089 | 1.00 | 0.000 | 0.000 / 0.000 |
| role shape | 1.000 | 0.557 / 0.488 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
POS=0.99 SIZE=0.98 COLOR=0.97 SHAPE=0.91 a=0.70 VERB=0.63 NAME=0.52 SUPER=0.44 c27_them=0.42 AXIS=0.35 c6_both=0.32 c16_new=0.17 c7_i=0.17 with=0.16 to=0.15 c23_in=0.14 c14_uh=0.13 of=0.12 c8_what's=0.12 c15_on=0.12 ARROW=0.12 DIR=0.12 LAYOUT=0.12 NOTCOLOR=0.12 PAIR=0.12 QUANT=0.12 RECENT=0.12 STYLE=0.12 and=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c24_line=0.12 c25_pixels=0.12 called=0.12 labeled=0.12 lines=0.12 directly=0.09 c13_one=0.09 c3_rules=0.08 it=0.08 c4_then=0.08 c10_three=0.07 are=0.07 c12_that=0.06 named=0.05 c26_shape=0.05 c17_be=0.04 c19_goes=0.04 c2_now=0.02 c5_me=0.02 c9_an=0.02 c11_what=0.01 c1_have=0.01 c18_does=0.01 the=0.01 unknown=0.01

## What is weak, what to add
- heldout_formulations: presence object: share of 'present' readings that abstain 0.024
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.024
- heldout_formulations: presence color: present read present 0.889
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: heads FULL (lexical order baseline) 0.024
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.143
- heldout_formulations: FULL [presence not decided] 0.738
- heldout_formulations: role size [presence not decided] 0.833
- heldout_formulations: heads FULL (model) [presence not decided] 0.738
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.857
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.857
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.889
- heldout_formulations: presence shape: share of 'present' readings that abstain 0.000
- heldout_formulations: presence shape: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence comparison: share of 'present' readings that abstain 0.000
- heldout_formulations: presence comparison: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.000
- train (sample): presence object: share of true 'present' readings that abstain 0.000
- train (sample): presence relation: share of 'present' readings that abstain 0.000
- train (sample): presence relation: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark: share of 'present' readings that abstain 0.000
- train (sample): presence landmark: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.111
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.111
- train (sample): heads FULL (lexical order baseline) 0.017
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.530
- train (sample): presence comparison: share of 'present' readings that abstain 0.016
- train (sample): presence comparison: share of true 'present' readings that abstain 0.016
- train (sample): presence color: share of 'present' readings that abstain 0.000
- train (sample): presence color: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence object: absent read absent 0.667
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `is_q NAME at the POS` FULL 0.000 (n 1)
- heldout_formulations: `is_q NAME really COLOR` FULL 0.000 (n 1)
- heldout_formulations: `is_q it POS` FULL 0.000 (n 1)
- heldout_formulations: `is_q NAME a SIZE shape than NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role relation | role landmark | role landmark2 | role region | role comparison |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.905 | 0.905 | 1.000 | 1.000 | 0.976 | 1.000 | 1.000 | 0.952 | 1.000 | 0.976 | 0.976 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.857 | 0.857 | 0.976 | 1.000 | 0.976 | 0.976 | 1.000 | 0.952 | 1.000 | 0.976 | 0.952 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.738 | 0.738 | 1.000 | 1.000 | 0.976 | 0.833 | 1.000 | 0.976 | 1.000 | 0.952 | 0.952 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | — | — | 0.024 (— / 0.024) |
| heldout_formulations | object | comparison: pooled midpoint | 0.976 | — | — |  |
| heldout_formulations | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | shape | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | color | product: fitted | 0.889 | 1.000 | 0.944 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.889 | 1.000 | 0.944 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | landmark | product: fitted | 0.913 | 1.000 | 0.957 | 0.000 (— / 0.000) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.913 | 1.000 | 0.957 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | comparison | product: fitted | 0.923 | 1.000 | 0.962 | 0.000 (— / 0.000) |
| heldout_formulations | comparison | comparison: pooled midpoint | 0.923 | 0.966 | 0.944 |  |
| train (sample) | object | product: fitted | 1.000 | 0.667 | 0.833 | 0.000 (0.000 / 0.000) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | landmark | product: fitted | 0.977 | 1.000 | 0.989 | 0.000 (— / 0.000) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.111 (— / 0.111) |
| train (sample) | comparison | product: fitted | 1.000 | 1.000 | 1.000 | 0.016 (— / 0.016) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
