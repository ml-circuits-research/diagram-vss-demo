# REPORT — world `targets`, legend sha256:baad370a1302… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
748 annotated sentences from 2 files; provenance: {'llm': 748}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_targets_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 42 sentences
- heldout_formulations: 33 sentences
- train: 673 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
2652 tokens in the examples; 108 with no kind in the lexicon (share 0.041), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 3de6b02. Memory curve: runs/micro_targets_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.511 [rule: fit; pooled midpoint 1.028 (comparison)] (present 2.056, n 8 / absent -0.001, n 198823)
- presence:object: threshold 0.846 [rule: fit; pooled midpoint 0.709 (comparison)] (present 1.079, n 429 / absent 0.339, n 13)
- attr_presence:object: threshold 0.273 [rule: fit; pooled midpoint 0.424 (comparison)] (present 0.785, n 6 / absent 0.064, n 423)
- det_presence:object: threshold 0.396 [rule: fit; pooled midpoint 0.437 (comparison)] (present 0.851, n 14 / absent 0.023, n 415)
- presence:quantity: threshold 0.457 [rule: fit; pooled midpoint 0.496 (comparison)] (present 0.985, n 96 / absent 0.006, n 346)
- presence:members: threshold 0.538 [rule: fit; pooled midpoint 0.958 (comparison)] (present 1.832, n 6 / absent 0.084, n 438)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.002, quantity 0.333, members 0.002, predicate 0.250

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 33 of 33)
| axis | accuracy |
|---|---|
| FULL | 0.788 |
| FULL [depth given] | 0.788 |
| FULL [depth and negation given] | 0.788 |
| FULL [presence not decided] | 0.788 |
| FULL [pooled midpoint (comparison)] | 0.848 |
| presence object: present read present | 0.897 |
| presence object: share of 'present' readings that abstain | 0.037 |
| presence object: share of true 'present' readings that abstain | 0.038 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.939 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.970 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.909 |
| event type (synonym table) | 0.909 |
| role object | 0.818 |
| head object | 0.818 |
| lexical order head object | 0.970 |
| lexical bag head object | 0.939 |
| occupancy: known filler | 0.842 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.758 |
| lexical bag head quantity | 1.000 |
| occupancy: not given | 0.983 |
| role members | 0.970 |
| head members | 0.970 |
| lexical order head members | 0.970 |
| lexical bag head members | 0.970 |
| heads FULL (model) | 0.818 |
| heads FULL (lexical order baseline) | 0.727 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.939 |
| role object [presence not decided] | 0.879 |
| role quantity [presence not decided] | 1.000 |
| role members [presence not decided] | 0.909 |
| heads FULL (model) [presence not decided] | 0.848 |
| role object [pooled midpoint (comparison)] | 0.879 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.970 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.909 |
| presence object: present read present [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| occupancy: unknown filler | 0.905 |
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
| presence members: present read present [pooled midpoint (comparison)] | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.500 |

residual mean 0.181; status {'ok': 30, 'unknown-event': 2, 'abstain': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.909 | 0.592 / 0.419 | 0.97 | 0.061 | 0.000 / 0.030 |
| role object | 0.839 | 0.179 / 0.025 | 0.87 | 0.065 | 0.032 / 0.097 |
| roles (pooled) | 0.850 | 0.255 / 0.069 | 0.90 | 0.075 | 0.025 / 0.075 |
| role quantity | 1.000 | 0.546 / 0.461 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.000 | 0.293 / 0.293 | 1.00 | 1.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 673)
| axis | accuracy |
|---|---|
| FULL | 0.903 |
| FULL [depth given] | 0.903 |
| FULL [depth and negation given] | 0.903 |
| structure (depth, negation) | 0.923 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.920 |
| event type (synonym table) | 0.920 |
| role object | 0.910 |
| head object | 0.910 |
| lexical order head object | 0.980 |
| lexical bag head object | 0.997 |
| occupancy: known filler | 0.919 |
| role quantity | 0.993 |
| head quantity | 0.993 |
| lexical order head quantity | 0.790 |
| lexical bag head quantity | 1.000 |
| role members | 1.000 |
| head members | 1.000 |
| lexical order head members | 1.000 |
| lexical bag head members | 1.000 |
| occupancy: not given | 1.000 |
| heads FULL (model) | 0.910 |
| heads FULL (lexical order baseline) | 0.770 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.997 |
| presence object: present read present | 0.982 |
| presence object: share of 'present' readings that abstain | 0.056 |
| presence object: share of true 'present' readings that abstain | 0.056 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence members: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.429 |
| presence object: absent read absent | 1.000 |

residual mean 0.129; status {'unknown-event': 22, 'ok': 262, 'abstain': 15, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.920 | 0.614 / 0.513 | 0.95 | 0.030 | 0.000 / 0.050 |
| role object | 0.908 | 0.196 / 0.077 | 0.93 | 0.068 | 0.051 / 0.024 |
| roles (pooled) | 0.919 | 0.253 / 0.085 | 0.93 | 0.056 | 0.042 / 0.025 |
| role quantity | 0.968 | 0.518 / 0.394 | 0.97 | 0.000 | 0.000 / 0.032 |

## Gates (seed 0; OPEN > 0.5)
SHAPE=0.87 the=0.84 NUM=0.74 it=0.66 VERB=0.66 NAME=0.66 c12_that=0.62 c16_new=0.62 c11_what=0.61 and=0.58 c27_them=0.53 to=0.46 c4_then=0.45 are=0.44 c2_now=0.43 QUANT=0.42 RECENT=0.41 PAIR=0.40 unknown=0.37 c1_have=0.29 c23_in=0.26 c26_shape=0.16 ARROW=0.12 AXIS=0.12 LAYOUT=0.12 NOTCOLOR=0.12 STYLE=0.12 SUPER=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 with=0.12 c9_an=0.12 a=0.12 DIR=0.10 c22_from=0.10 c7_i=0.07 c18_does=0.06 c17_be=0.06 c8_what's=0.06 c19_goes=0.06 c13_one=0.05 c6_both=0.05 SIZE=0.05 c3_rules=0.04 POS=0.04 c5_me=0.04 COLOR=0.04 c10_three=0.03 of=0.02 c15_on=0.01 c14_uh=0.01

## What is weak, what to add
- heldout_formulations: FULL 0.788
- heldout_formulations: presence object: present read present 0.897
- heldout_formulations: presence object: share of 'present' readings that abstain 0.037
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.038
- heldout_formulations: role object 0.818
- heldout_formulations: head object 0.818
- heldout_formulations: occupancy: known filler 0.842
- heldout_formulations: heads FULL (model) 0.818
- heldout_formulations: heads FULL (lexical order baseline) 0.727
- heldout_formulations: FULL [depth given] 0.788
- heldout_formulations: FULL [depth and negation given] 0.788
- heldout_formulations: FULL [presence not decided] 0.788
- heldout_formulations: role object [presence not decided] 0.879
- heldout_formulations: heads FULL (model) [presence not decided] 0.848
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.848
- heldout_formulations: role object [pooled midpoint (comparison)] 0.879
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: absent read absent 0.500
- heldout_formulations: presence object: absent read absent [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.500
- train (sample): heads FULL (lexical order baseline) 0.770
- train (sample): presence object: share of 'present' readings that abstain 0.056
- train (sample): presence object: share of true 'present' readings that abstain 0.056
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.429

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `scrap NAME` FULL 0.000 (n 1)
- heldout_formulations: `bring NAME send` FULL 0.000 (n 1)
- heldout_formulations: `move it to the very front of the stack` FULL 0.000 (n 1)
- heldout_formulations: `delete the last SHAPE` FULL 0.000 (n 1)
- heldout_formulations: `delete NAME and NAME from the map` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role quantity | role members |
|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.818 | 0.788 | 0.818 | 1.000 | 0.970 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.909 | 0.848 | 0.879 | 1.000 | 0.970 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.848 | 0.788 | 0.879 | 1.000 | 0.909 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.897 | 0.500 | 0.698 | 0.037 (0.000 / 0.038) |
| heldout_formulations | object | comparison: pooled midpoint | 1.000 | 0.500 | 0.750 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | members | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| train (sample) | object | product: fitted | 0.982 | 1.000 | 0.991 | 0.056 (— / 0.056) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | — | 1.000 | — |  |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
