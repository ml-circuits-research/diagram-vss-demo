# REPORT — world `describe_w`, legend sha256:fc3ca71f5fd5… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
1080 annotated sentences from 2 files; provenance: {'llm': 1080}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_describe_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 42 sentences
- heldout_formulations: 42 sentences
- train: 996 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
4143 tokens in the examples; 249 with no kind in the lexicon (share 0.060), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit f9dc7da. Memory curve: runs/micro_describe_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.265 [rule: fit; pooled midpoint 0.843 (comparison)] (present 1.602, n 363 / absent 0.084, n 79)
- attr_presence:object: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 363)
- presence:members: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 443)
- set_member:members: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 79134)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, members 0.001, predicate 0.125

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 42 of 42)
| axis | accuracy |
|---|---|
| FULL | 0.952 |
| FULL [depth given] | 0.952 |
| FULL [depth and negation given] | 0.952 |
| FULL [presence not decided] | 0.929 |
| FULL [pooled midpoint (comparison)] | 0.833 |
| presence object: absent read absent | 1.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.976 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.976 |
| event type (synonym table) | 0.976 |
| role object | 1.000 |
| head object | 1.000 |
| lexical order head object | 0.976 |
| lexical bag head object | 0.976 |
| occupancy: not given | 0.980 |
| role members | 0.976 |
| head members | 0.976 |
| lexical order head members | 1.000 |
| lexical bag head members | 1.000 |
| heads FULL (model) | 0.976 |
| heads FULL (lexical order baseline) | 0.976 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.976 |
| role object [presence not decided] | 0.976 |
| role members [presence not decided] | 0.976 |
| heads FULL (model) [presence not decided] | 0.952 |
| role object [pooled midpoint (comparison)] | 0.857 |
| role members [pooled midpoint (comparison)] | 0.976 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.857 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| occupancy: known filler | 1.000 |
| presence object: present read present [pooled midpoint (comparison)] | 0.818 |
| occupancy: unknown filler | 1.000 |

residual mean 0.053; status {'ok': 41, 'abstain': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.976 | 0.712 / 0.568 | 1.00 | 0.024 | 0.000 / 0.000 |
| role object | 1.000 | 0.666 / 0.525 | 1.00 | 0.000 | 0.000 / 0.000 |
| roles (pooled) | 1.000 | 0.666 / 0.525 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 996)
| axis | accuracy |
|---|---|
| FULL | 0.940 |
| FULL [depth given] | 0.940 |
| FULL [depth and negation given] | 0.940 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.020 |
| presence object: share of true 'present' readings that abstain | 0.020 |
| structure (depth, negation) | 0.977 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.980 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.967 |
| event type (synonym table) | 0.967 |
| role object | 0.970 |
| head object | 0.970 |
| lexical order head object | 0.960 |
| lexical bag head object | 0.980 |
| occupancy: known filler | 0.976 |
| role members | 0.980 |
| head members | 0.980 |
| lexical order head members | 0.997 |
| lexical bag head members | 0.997 |
| occupancy: not given | 0.977 |
| heads FULL (model) | 0.950 |
| heads FULL (lexical order baseline) | 0.960 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.977 |
| presence object: absent read absent | 0.932 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 0.000 |
| occupancy: unknown filler | 0.000 |

residual mean 0.071; status {'ok': 283, 'unknown-event': 6, 'abstain': 10, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.967 | 0.696 / 0.614 | 0.98 | 0.017 | 0.000 / 0.017 |
| role object | 0.976 | 0.657 / 0.538 | 0.98 | 0.024 | 0.020 / 0.000 |
| roles (pooled) | 0.973 | 0.655 / 0.537 | 0.98 | 0.023 | 0.020 / 0.004 |
| role members | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
NAME=0.98 it=0.89 c18_does=0.87 c2_now=0.75 c4_then=0.75 COLOR=0.69 the=0.66 and=0.63 VERB=0.61 c5_me=0.57 DIR=0.55 SHAPE=0.49 to=0.48 c8_what's=0.48 c3_rules=0.45 PAIR=0.44 c6_both=0.44 c11_what=0.43 c12_that=0.40 c13_one=0.39 LAYOUT=0.36 POS=0.35 unknown=0.35 c16_new=0.15 c15_on=0.15 c24_line=0.14 c23_in=0.12 ARROW=0.12 AXIS=0.12 NOTCOLOR=0.12 RECENT=0.12 STYLE=0.12 SUPER=0.12 c14_uh=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c25_pixels=0.12 c27_them=0.12 called=0.12 labeled=0.12 lines=0.12 named=0.12 with=0.12 c22_from=0.11 SIZE=0.10 c1_have=0.10 c17_be=0.08 c19_goes=0.08 QUANT=0.05 c9_an=0.04 c26_shape=0.03 directly=0.03 c10_three=0.03 a=0.03 c7_i=0.02 of=0.00 are=0.00

## What is weak, what to add
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.833
- heldout_formulations: role object [pooled midpoint (comparison)] 0.857
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.857
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: present read present [pooled midpoint (comparison)] 0.818
- train (sample): presence object: share of 'present' readings that abstain 0.020
- train (sample): presence object: share of true 'present' readings that abstain 0.020
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.000
- train (sample): set members: first gold member in the decoded set 0.000
- train (sample): occupancy: unknown filler 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `how many people are neigh_q NAME` FULL 0.000 (n 1)
- heldout_formulations: `where_is NAME relative to n_honey` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role members |
|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.976 | 0.952 | 1.000 | 0.976 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.857 | 0.833 | 0.857 | 0.976 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.952 | 0.929 | 0.976 | 0.976 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.818 | 1.000 | 0.909 |  |
| train (sample) | object | product: fitted | 1.000 | 0.932 | 0.966 | 0.020 (0.000 / 0.020) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
