# REPORT — world `resize`, legend sha256:368fb8770075… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
211 annotated sentences from 2 files; provenance: {'llm': 211}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_resize_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 11 sentences
- heldout_formulations: 6 sentences
- train: 194 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
722 tokens in the examples; 41 with no kind in the lexicon (share 0.057), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 1bdf306. Memory curve: runs/micro_resize_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.242 [rule: fit; pooled midpoint 0.162 (comparison)] (present 0.329, n 8 / absent -0.006, n 30742)
- presence:object: threshold 0.654 [rule: fit; pooled midpoint 4.585 (comparison)] (present 8.926, n 191 / absent 0.244, n 14)
- attr_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 188)
- presence:members: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 4, absent 201)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.006, members 0.007, predicate 0.250

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 6 of 6)
| axis | accuracy |
|---|---|
| FULL | 0.667 |
| FULL [depth given] | 0.667 |
| FULL [depth and negation given] | 0.667 |
| FULL [presence not decided] | 0.500 |
| FULL [pooled midpoint (comparison)] | 0.167 |
| structure (depth, negation) | 0.667 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.667 |
| event type (synonym table) | 0.667 |
| role object | 0.667 |
| head object | 0.667 |
| lexical order head object | 0.833 |
| lexical bag head object | 0.833 |
| occupancy: unknown filler | 0.600 |
| role members | 1.000 |
| head members | 1.000 |
| lexical order head members | 1.000 |
| lexical bag head members | 1.000 |
| occupancy: not given | 1.000 |
| heads FULL (model) | 0.667 |
| heads FULL (lexical order baseline) | 0.833 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.833 |
| role object [presence not decided] | 0.500 |
| role members [presence not decided] | 1.000 |
| heads FULL (model) [presence not decided] | 0.500 |
| role object [pooled midpoint (comparison)] | 0.167 |
| role members [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.167 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence object: present read present [pooled midpoint (comparison)] | 0.000 |
| presence object: absent read absent | 1.000 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |

residual mean 0.474; status {'unknown-event': 2, 'ok': 4}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.667 | 0.533 / 0.103 | 0.83 | 0.167 | 0.000 / 0.167 |
| role object | 0.600 | 0.464 / 0.250 | 1.00 | 0.400 | 0.000 / 0.000 |
| roles (pooled) | 0.600 | 0.464 / 0.250 | 1.00 | 0.400 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 194 of 194)
| axis | accuracy |
|---|---|
| FULL | 0.825 |
| FULL [depth given] | 0.825 |
| FULL [depth and negation given] | 0.825 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.027 |
| presence object: share of true 'present' readings that abstain | 0.027 |
| structure (depth, negation) | 0.825 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.825 |
| event type (synonym table) | 0.825 |
| role object | 0.825 |
| head object | 0.825 |
| lexical order head object | 0.959 |
| lexical bag head object | 0.974 |
| occupancy: known filler | 0.813 |
| role members | 1.000 |
| head members | 1.000 |
| lexical order head members | 0.985 |
| lexical bag head members | 0.985 |
| occupancy: not given | 1.000 |
| heads FULL (model) | 0.825 |
| heads FULL (lexical order baseline) | 0.959 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.959 |
| presence object: absent read absent | 1.000 |
| set members: first gold member in the decoded set | 1.000 |
| occupancy: unknown filler | 1.000 |

residual mean 0.236; status {'ok': 155, 'unknown-event': 34, 'abstain': 5}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.825 | 0.573 / 0.119 | 0.91 | 0.088 | 0.000 / 0.088 |
| role object | 0.813 | 0.469 / 0.153 | 0.96 | 0.165 | 0.022 / 0.022 |
| roles (pooled) | 0.816 | 0.463 / 0.152 | 0.95 | 0.162 | 0.027 / 0.022 |
| role members | 1.000 | 0.111 / 0.031 | 0.67 | 0.000 | 0.333 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
NAME=0.73 VERB=0.72 it=0.69 the=0.57 c12_that=0.35 c27_them=0.35 a=0.33 c6_both=0.32 unknown=0.30 c26_shape=0.29 COLOR=0.28 c10_three=0.26 SHAPE=0.24 SIZE=0.24 and=0.22 c14_uh=0.19 to=0.17 c1_have=0.14 c17_be=0.13 c2_now=0.12 DIR=0.12 ARROW=0.12 AXIS=0.12 LAYOUT=0.12 NOTCOLOR=0.12 PAIR=0.12 POS=0.12 QUANT=0.12 RECENT=0.12 STYLE=0.12 SUPER=0.12 are=0.12 c11_what=0.12 c13_one=0.12 c15_on=0.12 c19_goes=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c23_in=0.12 c24_line=0.12 c25_pixels=0.12 c3_rules=0.12 c8_what's=0.12 c9_an=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 of=0.12 with=0.12 c16_new=0.10 c7_i=0.08 c4_then=0.06 c5_me=0.06 c18_does=0.04

## What is weak, what to add
- heldout_formulations: FULL 0.667
- heldout_formulations: structure (depth, negation) 0.667
- heldout_formulations: predicate (surface lemma) 0.667
- heldout_formulations: event type (synonym table) 0.667
- heldout_formulations: role object 0.667
- heldout_formulations: head object 0.667
- heldout_formulations: occupancy: unknown filler 0.600
- heldout_formulations: heads FULL (model) 0.667
- heldout_formulations: heads FULL (lexical order baseline) 0.833
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.833
- heldout_formulations: FULL [depth given] 0.667
- heldout_formulations: FULL [depth and negation given] 0.667
- heldout_formulations: FULL [presence not decided] 0.500
- heldout_formulations: role object [presence not decided] 0.500
- heldout_formulations: heads FULL (model) [presence not decided] 0.500
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.167
- heldout_formulations: role object [pooled midpoint (comparison)] 0.167
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.167
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.000
- train (sample): FULL 0.825
- train (sample): presence object: share of 'present' readings that abstain 0.027
- train (sample): presence object: share of true 'present' readings that abstain 0.027
- train (sample): structure (depth, negation) 0.825
- train (sample): predicate (surface lemma) 0.825
- train (sample): event type (synonym table) 0.825
- train (sample): role object 0.825
- train (sample): head object 0.825
- train (sample): occupancy: known filler 0.813
- train (sample): heads FULL (model) 0.825
- train (sample): FULL [depth given] 0.825
- train (sample): FULL [depth and negation given] 0.825

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `make the NAME larger` FULL 0.000 (n 1)
- heldout_formulations: `make NAME even bigger` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role members |
|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.667 | 0.667 | 0.667 | 1.000 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.167 | 0.167 | 0.167 | 1.000 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.500 | 0.500 | 0.500 | 1.000 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| train (sample) | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.027 (— / 0.027) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
