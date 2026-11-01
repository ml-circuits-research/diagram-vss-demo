# REPORT — world `describe`, legend sha256:fc3ca71f5fd5… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
820 annotated sentences from 2 files; provenance: {'llm': 820}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_describe_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 29 sentences
- heldout_formulations: 34 sentences
- train: 757 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
3235 tokens in the examples; 208 with no kind in the lexicon (share 0.064), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 1bdf306. Memory curve: runs/micro_describe_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.257 [rule: fit; pooled midpoint 1.205 (comparison)] (present 2.306, n 341 / absent 0.105, n 88)
- presence:members: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 428)
- set_member:members: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 62951)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.002, members 0.002, predicate 0.125

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 34 of 34)
| axis | accuracy |
|---|---|
| FULL | 0.824 |
| FULL [depth given] | 0.824 |
| FULL [depth and negation given] | 0.824 |
| FULL [presence not decided] | 0.824 |
| FULL [pooled midpoint (comparison)] | 0.441 |
| presence object: absent read absent | 1.000 |
| structure (depth, negation) | 0.882 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.971 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.853 |
| event type (synonym table) | 0.853 |
| role object | 0.882 |
| head object | 0.882 |
| lexical order head object | 1.000 |
| lexical bag head object | 1.000 |
| occupancy: not given | 0.975 |
| role members | 0.971 |
| head members | 0.971 |
| lexical order head members | 1.000 |
| lexical bag head members | 1.000 |
| heads FULL (model) | 0.853 |
| heads FULL (lexical order baseline) | 1.000 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 1.000 |
| role object [presence not decided] | 0.882 |
| role members [presence not decided] | 0.971 |
| heads FULL (model) [presence not decided] | 0.853 |
| role object [pooled midpoint (comparison)] | 0.441 |
| role members [pooled midpoint (comparison)] | 0.912 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.441 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| occupancy: known filler | 1.000 |
| presence object: present read present [pooled midpoint (comparison)] | 0.375 |
| occupancy: unknown filler | 0.810 |

residual mean 0.150; status {'ok': 29, 'unknown-event': 4, 'abstain': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.853 | 0.640 / 0.342 | 0.94 | 0.088 | 0.000 / 0.059 |
| role object | 0.857 | 0.635 / 0.464 | 1.00 | 0.143 | 0.000 / 0.000 |
| roles (pooled) | 0.857 | 0.635 / 0.464 | 1.00 | 0.143 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 757)
| axis | accuracy |
|---|---|
| FULL | 0.920 |
| FULL [depth given] | 0.920 |
| FULL [depth and negation given] | 0.920 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.022 |
| presence object: share of true 'present' readings that abstain | 0.022 |
| structure (depth, negation) | 0.940 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.987 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.937 |
| event type (synonym table) | 0.937 |
| role object | 0.937 |
| head object | 0.937 |
| lexical order head object | 0.967 |
| lexical bag head object | 0.977 |
| occupancy: known filler | 0.927 |
| role members | 0.987 |
| head members | 0.987 |
| lexical order head members | 1.000 |
| lexical bag head members | 1.000 |
| occupancy: not given | 0.986 |
| heads FULL (model) | 0.923 |
| heads FULL (lexical order baseline) | 0.967 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.977 |
| presence object: absent read absent | 0.981 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.113; status {'ok': 273, 'unknown-event': 18, 'abstain': 9}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.937 | 0.680 / 0.559 | 0.96 | 0.023 | 0.000 / 0.040 |
| role object | 0.927 | 0.660 / 0.517 | 0.98 | 0.073 | 0.020 / 0.000 |
| roles (pooled) | 0.927 | 0.660 / 0.517 | 0.98 | 0.073 | 0.020 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
NAME=0.97 it=0.88 c3_rules=0.84 c2_now=0.69 c13_one=0.69 VERB=0.68 DIR=0.64 and=0.57 the=0.57 c11_what=0.52 PAIR=0.49 c5_me=0.45 c18_does=0.44 c4_then=0.43 LAYOUT=0.39 POS=0.37 c12_that=0.35 c8_what's=0.34 of=0.31 unknown=0.30 c1_have=0.27 a=0.24 c16_new=0.18 QUANT=0.13 c17_be=0.12 AXIS=0.12 COLOR=0.12 NOTCOLOR=0.12 RECENT=0.12 SHAPE=0.12 STYLE=0.12 c14_uh=0.12 c19_goes=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c22_from=0.12 c25_pixels=0.12 c27_them=0.12 called=0.12 labeled=0.12 lines=0.12 named=0.12 with=0.12 c23_in=0.11 c24_line=0.10 ARROW=0.10 directly=0.09 c15_on=0.06 SIZE=0.05 SUPER=0.05 c9_an=0.04 c26_shape=0.03 c10_three=0.02 to=0.02 c7_i=0.02 c6_both=0.02 are=0.01

## What is weak, what to add
- heldout_formulations: FULL 0.824
- heldout_formulations: structure (depth, negation) 0.882
- heldout_formulations: predicate (surface lemma) 0.853
- heldout_formulations: event type (synonym table) 0.853
- heldout_formulations: role object 0.882
- heldout_formulations: head object 0.882
- heldout_formulations: heads FULL (model) 0.853
- heldout_formulations: FULL [depth given] 0.824
- heldout_formulations: FULL [depth and negation given] 0.824
- heldout_formulations: FULL [presence not decided] 0.824
- heldout_formulations: role object [presence not decided] 0.882
- heldout_formulations: heads FULL (model) [presence not decided] 0.853
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.441
- heldout_formulations: role object [pooled midpoint (comparison)] 0.441
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.441
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.375
- heldout_formulations: occupancy: unknown filler 0.810
- train (sample): presence object: share of 'present' readings that abstain 0.022
- train (sample): presence object: share of true 'present' readings that abstain 0.022
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `is the NAME connected_q anything` FULL 0.000 (n 1)
- heldout_formulations: `how_many come out of NAME` FULL 0.000 (n 1)
- heldout_formulations: `does anything connected_q NAME` FULL 0.000 (n 1)
- heldout_formulations: `how many people are neigh_q NAME` FULL 0.000 (n 1)
- heldout_formulations: `what position is NAME in` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role members |
|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.853 | 0.824 | 0.882 | 0.971 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.441 | 0.441 | 0.441 | 0.912 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.853 | 0.824 | 0.882 | 0.971 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.375 | 1.000 | 0.688 |  |
| train (sample) | object | product: fitted | 1.000 | 0.981 | 0.991 | 0.022 (0.000 / 0.022) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
