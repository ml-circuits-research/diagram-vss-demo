# REPORT — world `manage7`, legend sha256:fdf259818928… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1091 annotated sentences from 2 files; provenance: {'llm': 1091}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_manage7_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 49 sentences
- heldout_formulations: 47 sentences
- train: 995 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
4382 tokens in the examples; 232 with no kind in the lexicon (share 0.053), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 9b2fa1c. Memory curve: runs/micro_manage7_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.734 [rule: fit; pooled midpoint 0.690 (comparison)] (present 1.025, n 435 / absent 0.354, n 14)
- attr_presence:object: threshold 0.457 [rule: fit; pooled midpoint 0.490 (comparison)] (present 0.913, n 13 / absent 0.067, n 431)
- det_presence:object: threshold 0.476 [rule: fit; pooled midpoint 0.455 (comparison)] (present 0.864, n 14 / absent 0.046, n 421)
- presence:name: threshold 0.255 [rule: fit; pooled midpoint 0.488 (comparison)] (present 0.976, n 138 / absent 0.000, n 311)
- presence:text: threshold 0.117 [rule: fit; pooled midpoint 0.490 (comparison)] (present 0.961, n 70 / absent 0.019, n 379)
- presence:quantity: threshold 0.388 [rule: fit; pooled midpoint 0.495 (comparison)] (present 0.982, n 77 / absent 0.008, n 372)
- presence:members: threshold 0.598 [rule: fit; pooled midpoint 0.587 (comparison)] (present 1.114, n 5 / absent 0.061, n 454)
- set_member:members: threshold 0.587 [rule: fit; pooled midpoint 0.499 (comparison)] (present 0.998, n 8 / absent -0.000, n 247204)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, name 0.001, text 0.001, quantity 0.100, members 0.001, predicate 0.250

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 47 of 47)
| axis | accuracy |
|---|---|
| FULL | 0.809 |
| FULL [pooled midpoint (comparison)] | 0.872 |
| presence object: present read present | 0.909 |
| presence object: share of 'present' readings that abstain | 0.024 |
| presence object: share of true 'present' readings that abstain | 0.025 |
| presence name: absent read absent | 1.000 |
| presence text: present read present | 0.875 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.979 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.979 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.979 |
| event type (synonym table) | 0.979 |
| role object | 0.851 |
| head object | 0.872 |
| lexical order head object | 0.979 |
| lexical bag head object | 0.830 |
| occupancy: unknown filler | 1.000 |
| role name | 1.000 |
| head name | 1.000 |
| lexical order head name | 0.702 |
| lexical bag head name | 0.872 |
| occupancy: not given | 0.988 |
| role text | 0.957 |
| head text | 0.957 |
| lexical order head text | 0.830 |
| lexical bag head text | 0.872 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.851 |
| lexical bag head quantity | 1.000 |
| role members | 0.979 |
| head members | 0.979 |
| lexical order head members | 0.979 |
| lexical bag head members | 0.979 |
| heads FULL (model) | 0.830 |
| heads FULL (lexical order baseline) | 0.362 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.574 |
| role object [pooled midpoint (comparison)] | 0.915 |
| role name [pooled midpoint (comparison)] | 1.000 |
| role text [pooled midpoint (comparison)] | 0.957 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.979 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.915 |
| presence object: present read present [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present [pooled midpoint (comparison)] | 0.875 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent | 0.974 |
| occupancy: known filler | 0.793 |
| presence text: absent read absent [pooled midpoint (comparison)] | 0.974 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: share of FALSE 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 0.500 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.500 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 1.000 |

residual mean 0.113; status {'ok': 45, 'unknown-event': 1, 'abstain': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.979 | 0.609 / 0.549 | 0.98 | 0.000 | 0.000 / 0.021 |
| role object | 0.867 | 0.241 / 0.023 | 0.89 | 0.022 | 0.000 / 0.111 |
| roles (pooled) | 0.893 | 0.350 / 0.154 | 0.92 | 0.027 | 0.000 / 0.080 |
| role text | 0.875 | 0.460 / 0.339 | 0.88 | 0.000 | 0.000 / 0.125 |
| role name | 1.000 | 0.547 / 0.503 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.565 / 0.521 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.000 | 0.129 / 0.129 | 1.00 | 1.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 150 of 995)
| axis | accuracy |
|---|---|
| FULL | 0.940 |
| presence object: present read present | 0.993 |
| presence object: share of 'present' readings that abstain | 0.071 |
| presence object: share of true 'present' readings that abstain | 0.071 |
| presence name: present read present | 1.000 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence text: absent read absent | 0.984 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.967 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.960 |
| event type (synonym table) | 0.960 |
| role object | 0.960 |
| head object | 0.960 |
| lexical order head object | 1.000 |
| lexical bag head object | 0.993 |
| occupancy: known filler | 0.963 |
| role name | 1.000 |
| head name | 1.000 |
| lexical order head name | 0.680 |
| lexical bag head name | 1.000 |
| role text | 0.973 |
| head text | 0.973 |
| lexical order head text | 0.873 |
| lexical bag head text | 0.993 |
| occupancy: not given | 0.996 |
| role quantity | 0.993 |
| head quantity | 0.993 |
| lexical order head quantity | 0.820 |
| lexical bag head quantity | 1.000 |
| role members | 1.000 |
| head members | 1.000 |
| lexical order head members | 1.000 |
| lexical bag head members | 1.000 |
| heads FULL (model) | 0.947 |
| heads FULL (lexical order baseline) | 0.373 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.987 |
| presence name: absent read absent | 1.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.053 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |
| presence object: absent read absent | 1.000 |
| presence text: share of FALSE 'present' readings that abstain | 0.500 |

residual mean 0.096; status {'ok': 134, 'no-sense': 2, 'abstain': 11, 'unknown-event': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.960 | 0.599 / 0.548 | 0.99 | 0.027 | 0.000 / 0.013 |
| role object | 0.959 | 0.263 / 0.170 | 0.93 | 0.034 | 0.068 / 0.007 |
| roles (pooled) | 0.963 | 0.372 / 0.216 | 0.95 | 0.033 | 0.041 / 0.004 |
| role name | 1.000 | 0.554 / 0.485 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 0.963 | 0.528 / 0.394 | 1.00 | 0.037 | 0.000 / 0.000 |
| role text | 0.895 | 0.526 / 0.448 | 1.00 | 0.105 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
c9_an=0.95 with=0.94 TEXT=0.94 and=0.92 RECENT=0.89 it=0.83 to=0.81 VERB=0.76 NUM=0.70 NAME=0.64 c23_in=0.55 the=0.54 SHAPE=0.47 c6_both=0.47 c1_have=0.46 QUANT=0.45 c16_new=0.43 are=0.40 DIR=0.40 c19_goes=0.39 LAYOUT=0.39 c3_rules=0.38 COLOR=0.25 c12_that=0.24 c22_from=0.22 c10_three=0.12 ARROW=0.12 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 POS=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 c17_be=0.12 c18_does=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c26_shape=0.09 c27_them=0.09 c13_one=0.06 c2_now=0.05 c4_then=0.05 c8_what's=0.04 c5_me=0.02 of=0.02 unknown=0.01 c7_i=0.01 a=0.01 c15_on=0.01 c11_what=0.01 c14_uh=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.809
- heldout_formulations: presence object: share of 'present' readings that abstain 0.024
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.025
- heldout_formulations: presence text: present read present 0.875
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: role object 0.851
- heldout_formulations: head object 0.872
- heldout_formulations: heads FULL (model) 0.830
- heldout_formulations: heads FULL (lexical order baseline) 0.362
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.574
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.872
- heldout_formulations: presence text: present read present [pooled midpoint (comparison)] 0.875
- heldout_formulations: occupancy: known filler 0.793
- heldout_formulations: presence name: share of 'present' readings that abstain 0.000
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: absent read absent 0.500
- heldout_formulations: presence object: absent read absent [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.071
- train (sample): presence object: share of true 'present' readings that abstain 0.071
- train (sample): presence name: share of 'present' readings that abstain 0.000
- train (sample): presence name: share of true 'present' readings that abstain 0.000
- train (sample): heads FULL (lexical order baseline) 0.373
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.053
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of FALSE 'present' readings that abstain 0.500

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `give NAME the label TEXT` FULL 0.000 (n 2)
- heldout_formulations: `delete the old COLOR SHAPE` FULL 0.000 (n 2)
- heldout_formulations: `label NAME as n_grandma NAME` FULL 0.000 (n 1)
- heldout_formulations: `scrap NAME` FULL 0.000 (n 1)
- heldout_formulations: `delete NAME and NAME from the map` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role name | role text | role quantity | role members |
|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.830 | 0.809 | 0.851 | 1.000 | 0.957 | 1.000 | 0.979 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.915 | 0.872 | 0.915 | 1.000 | 0.957 | 1.000 | 0.979 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.909 | 0.500 | 0.705 | 0.024 (0.000 / 0.025) |
| heldout_formulations | object | comparison: pooled midpoint | 1.000 | 0.500 | 0.750 |  |
| heldout_formulations | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 0.875 | 0.974 | 0.924 | 0.000 (0.000 / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 0.875 | 0.974 | 0.924 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | members | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | object | product: fitted | 0.993 | 1.000 | 0.996 | 0.071 (— / 0.071) |
| train (sample) | name | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | text | product: fitted | 1.000 | 0.984 | 0.992 | 0.053 (0.500 / 0.000) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | — | 1.000 | — |  |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
