# REPORT — world `targets_w`, legend sha256:baad370a1302… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
869 annotated sentences from 2 files; provenance: {'llm': 869}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_targets_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 48 sentences
- heldout_formulations: 35 sentences
- train: 786 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
3221 tokens in the examples; 223 with no kind in the lexicon (share 0.069), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit f9dc7da. Memory curve: runs/micro_targets_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 228618)
- presence:object: threshold 0.577 [rule: fit; pooled midpoint 0.591 (comparison)] (present 1.005, n 432 / absent 0.177, n 16)
- attr_presence:object: threshold 0.455 [rule: fit; pooled midpoint 0.482 (comparison)] (present 0.899, n 12 / absent 0.066, n 428)
- det_presence:object: threshold 0.479 [rule: fit; pooled midpoint 0.477 (comparison)] (present 0.934, n 16 / absent 0.021, n 416)
- presence:quantity: threshold 0.401 [rule: fit; pooled midpoint 0.496 (comparison)] (present 0.987, n 89 / absent 0.006, n 359)
- presence:members: threshold 0.503 [rule: fit; pooled midpoint 0.584 (comparison)] (present 1.083, n 6 / absent 0.085, n 455)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.001, quantity 0.250, members 0.002, predicate 0.250

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 35 of 35)
| axis | accuracy |
|---|---|
| FULL | 0.829 |
| FULL [depth given] | 0.829 |
| FULL [depth and negation given] | 0.829 |
| FULL [presence not decided] | 0.800 |
| FULL [pooled midpoint (comparison)] | 0.829 |
| presence object: present read present | 0.968 |
| presence object: share of 'present' readings that abstain | 0.000 |
| presence object: share of true 'present' readings that abstain | 0.000 |
| presence quantity: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.971 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.971 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.943 |
| event type (synonym table) | 0.943 |
| role object | 0.857 |
| head object | 0.914 |
| lexical order head object | 0.971 |
| lexical bag head object | 0.943 |
| occupancy: known filler | 0.950 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.800 |
| lexical bag head quantity | 1.000 |
| occupancy: not given | 0.985 |
| role members | 0.971 |
| head members | 0.971 |
| lexical order head members | 0.971 |
| lexical bag head members | 0.971 |
| heads FULL (model) | 0.914 |
| heads FULL (lexical order baseline) | 0.771 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.943 |
| role object [presence not decided] | 0.886 |
| role quantity [presence not decided] | 1.000 |
| role members [presence not decided] | 0.914 |
| heads FULL (model) [presence not decided] | 0.886 |
| role object [pooled midpoint (comparison)] | 0.857 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role members [pooled midpoint (comparison)] | 0.971 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.914 |
| presence object: present read present [pooled midpoint (comparison)] | 0.968 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| occupancy: unknown filler | 0.950 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 0.667 |
| presence object: absent read absent [pooled midpoint (comparison)] | 0.667 |
| presence object: share of FALSE 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 1.000 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |

residual mean 0.158; status {'ok': 34, 'unknown-event': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.943 | 0.612 / 0.534 | 0.97 | 0.029 | 0.000 / 0.029 |
| role object | 0.875 | 0.404 / 0.230 | 0.97 | 0.094 | 0.000 / 0.031 |
| roles (pooled) | 0.875 | 0.430 / 0.280 | 0.97 | 0.100 | 0.000 / 0.025 |
| role quantity | 1.000 | 0.570 / 0.525 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.000 | 0.287 / 0.287 | 1.00 | 1.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 786)
| axis | accuracy |
|---|---|
| FULL | 0.963 |
| FULL [depth given] | 0.963 |
| FULL [depth and negation given] | 0.963 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.055 |
| presence object: share of true 'present' readings that abstain | 0.049 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence members: absent read absent | 1.000 |
| structure (depth, negation) | 0.980 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.987 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.977 |
| event type (synonym table) | 0.977 |
| role object | 0.973 |
| head object | 0.973 |
| lexical order head object | 0.980 |
| lexical bag head object | 1.000 |
| occupancy: known filler | 0.986 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.803 |
| lexical bag head quantity | 0.987 |
| role members | 0.987 |
| head members | 0.987 |
| lexical order head members | 0.987 |
| lexical bag head members | 0.987 |
| occupancy: not given | 0.994 |
| heads FULL (model) | 0.970 |
| heads FULL (lexical order baseline) | 0.783 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.973 |
| presence quantity: absent read absent | 1.000 |
| presence object: absent read absent | 0.500 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.000 |
| presence members: share of true 'present' readings that abstain | 0.000 |
| set members: first gold member in the decoded set | 0.250 |
| occupancy: unknown filler | 1.000 |
| presence object: share of FALSE 'present' readings that abstain | 0.667 |
| determiner identity (outside FULL when the legend excludes it) | 1.000 |

residual mean 0.088; status {'ok': 278, 'unknown-event': 4, 'abstain': 16, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.977 | 0.651 / 0.550 | 1.00 | 0.020 | 0.000 / 0.003 |
| role object | 0.983 | 0.409 / 0.345 | 0.95 | 0.017 | 0.048 / 0.000 |
| roles (pooled) | 0.975 | 0.431 / 0.346 | 0.96 | 0.025 | 0.039 / 0.000 |
| role quantity | 1.000 | 0.559 / 0.527 | 1.00 | 0.000 | 0.000 / 0.000 |
| role members | 0.000 | 0.170 / 0.088 | 1.00 | 1.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
the=0.77 c16_new=0.75 NUM=0.69 POS=0.67 VERB=0.67 NAME=0.66 c13_one=0.64 it=0.64 RECENT=0.62 c4_then=0.61 c11_what=0.61 QUANT=0.56 SHAPE=0.41 c22_from=0.36 unknown=0.34 c27_them=0.21 to=0.18 DIR=0.16 c1_have=0.15 ARROW=0.12 AXIS=0.12 NOTCOLOR=0.12 PAIR=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 with=0.12 LAYOUT=0.11 are=0.10 c19_goes=0.08 c2_now=0.08 c9_an=0.08 c8_what's=0.07 c18_does=0.07 c12_that=0.07 c17_be=0.06 c15_on=0.06 c10_three=0.05 c6_both=0.05 COLOR=0.05 c26_shape=0.05 and=0.05 c3_rules=0.05 a=0.04 c5_me=0.03 c23_in=0.03 of=0.02 c7_i=0.01 c14_uh=0.01

## What is weak, what to add
- heldout_formulations: FULL 0.829
- heldout_formulations: presence object: share of 'present' readings that abstain 0.000
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.000
- heldout_formulations: role object 0.857
- heldout_formulations: heads FULL (lexical order baseline) 0.771
- heldout_formulations: FULL [depth given] 0.829
- heldout_formulations: FULL [depth and negation given] 0.829
- heldout_formulations: FULL [presence not decided] 0.800
- heldout_formulations: role object [presence not decided] 0.886
- heldout_formulations: heads FULL (model) [presence not decided] 0.886
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.829
- heldout_formulations: role object [pooled midpoint (comparison)] 0.857
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence object: absent read absent 0.667
- heldout_formulations: presence object: absent read absent [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence object: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.055
- train (sample): presence object: share of true 'present' readings that abstain 0.049
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): heads FULL (lexical order baseline) 0.783
- train (sample): presence object: absent read absent 0.500
- train (sample): presence members: share of 'present' readings that abstain 0.000
- train (sample): presence members: share of true 'present' readings that abstain 0.000
- train (sample): set members: first gold member in the decoded set 0.250
- train (sample): presence object: share of FALSE 'present' readings that abstain 0.667

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `delete the old COLOR SHAPE` FULL 0.000 (n 2)
- heldout_formulations: `scrap NAME` FULL 0.000 (n 1)
- heldout_formulations: `bring NAME send` FULL 0.000 (n 1)
- heldout_formulations: `push it to the very bring of the stack` FULL 0.000 (n 1)
- heldout_formulations: `delete NAME and NAME from the map` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role quantity | role members |
|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.914 | 0.829 | 0.857 | 1.000 | 0.971 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.914 | 0.829 | 0.857 | 1.000 | 0.971 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.886 | 0.800 | 0.886 | 1.000 | 0.914 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 0.968 | 0.667 | 0.817 | 0.000 (0.000 / 0.000) |
| heldout_formulations | object | comparison: pooled midpoint | 0.968 | 0.667 | 0.817 |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | members | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | object | product: fitted | 1.000 | 0.500 | 0.750 | 0.055 (0.667 / 0.049) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
