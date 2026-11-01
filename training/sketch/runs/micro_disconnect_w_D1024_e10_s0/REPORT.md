# REPORT — world `disconnect_w`, legend sha256:dd4cd15b25c9… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
169 annotated sentences from 2 files; provenance: {'llm': 169}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_disconnect_w_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 5 sentences
- heldout_formulations: 7 sentences
- train: 157 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
827 tokens in the examples; 21 with no kind in the lexicon (share 0.025), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 4626cf6. Memory curve: runs/micro_disconnect_w_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:source: threshold 0.408 [rule: fit; pooled midpoint 0.750 (comparison)] (present 0.879, n 155 / absent 0.621, n 7)
- presence:target: threshold 0.415 [rule: fit; pooled midpoint 0.651 (comparison)] (present 0.957, n 155 / absent 0.344, n 7)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): source 0.004, target 0.004, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 7 of 7)
| axis | accuracy |
|---|---|
| FULL | 0.714 |
| FULL [depth given] | 0.714 |
| FULL [depth and negation given] | 0.714 |
| FULL [presence not decided] | 0.714 |
| FULL [pooled midpoint (comparison)] | 0.714 |
| presence source: absent read absent | 0.500 |
| presence target: absent read absent | 1.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| role source | 0.714 |
| head source | 0.714 |
| lexical order head source | 0.714 |
| lexical bag head source | 0.571 |
| occupancy: not given | 0.667 |
| role target | 0.857 |
| head target | 0.857 |
| lexical order head target | 0.857 |
| lexical bag head target | 0.857 |
| heads FULL (model) | 0.714 |
| heads FULL (lexical order baseline) | 0.714 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.571 |
| role source [presence not decided] | 0.714 |
| role target [presence not decided] | 0.857 |
| heads FULL (model) [presence not decided] | 0.714 |
| role source [pooled midpoint (comparison)] | 0.714 |
| role target [pooled midpoint (comparison)] | 0.857 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.714 |
| presence source: absent read absent [pooled midpoint (comparison)] | 0.500 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present | 0.800 |
| presence source: share of 'present' readings that abstain | 0.000 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.833 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| occupancy: known filler | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.800 |
| presence target: present read present [pooled midpoint (comparison)] | 0.833 |
| presence source: share of FALSE 'present' readings that abstain | 0.000 |
| occupancy: unknown filler | 0.500 |

residual mean 0.114; status {'ok': 7}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.644 / 0.498 | 1.00 | 0.000 | 0.000 / 0.000 |
| role source | 0.800 | 0.312 / 0.122 | 0.80 | 0.000 | 0.000 / 0.200 |
| roles (pooled) | 0.818 | 0.300 / 0.000 | 0.82 | 0.000 | 0.000 / 0.182 |
| role target | 0.833 | 0.290 / 0.077 | 0.83 | 0.000 | 0.000 / 0.167 |

### train (sample) — catalog candidates (n = 157 of 157)
| axis | accuracy |
|---|---|
| FULL | 0.911 |
| FULL [depth given] | 0.911 |
| FULL [depth and negation given] | 0.911 |
| presence source: present read present | 0.986 |
| presence source: share of 'present' readings that abstain | 0.000 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 0.965 |
| presence target: share of 'present' readings that abstain | 0.007 |
| presence target: share of true 'present' readings that abstain | 0.007 |
| structure (depth, negation) | 0.955 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.955 |
| event type (synonym table) | 0.955 |
| role source | 0.949 |
| head source | 0.949 |
| lexical order head source | 0.968 |
| lexical bag head source | 0.981 |
| occupancy: known filler | 0.940 |
| role target | 0.924 |
| head target | 0.924 |
| lexical order head target | 0.943 |
| lexical bag head target | 0.987 |
| heads FULL (model) | 0.911 |
| heads FULL (lexical order baseline) | 0.936 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.975 |
| presence source: absent read absent | 0.800 |
| presence target: absent read absent | 0.833 |
| occupancy: not given | 0.857 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.068; status {'ok': 149, 'abstain': 1, 'unknown-event': 7}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.955 | 0.613 / 0.557 | 0.99 | 0.038 | 0.000 / 0.006 |
| role source | 0.953 | 0.403 / 0.196 | 0.99 | 0.033 | 0.000 / 0.013 |
| roles (pooled) | 0.940 | 0.420 / 0.211 | 0.97 | 0.037 | 0.003 / 0.023 |
| role target | 0.927 | 0.436 / 0.214 | 0.96 | 0.040 | 0.007 / 0.033 |

## Gates (seed 0; OPEN > 0.5)
VERB=0.72 to=0.72 c22_from=0.62 and=0.55 c27_them=0.42 NAME=0.37 c7_i=0.30 it=0.26 c12_that=0.25 c16_new=0.24 the=0.18 unknown=0.17 c18_does=0.13 ARROW=0.12 AXIS=0.12 COLOR=0.12 DIR=0.12 LAYOUT=0.12 NOTCOLOR=0.12 PAIR=0.12 QUANT=0.12 RECENT=0.12 SHAPE=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 are=0.12 c10_three=0.12 c11_what=0.12 c14_uh=0.12 c15_on=0.12 c19_goes=0.12 c1_have=0.12 c21_arrowheads=0.12 c23_in=0.12 c25_pixels=0.12 c26_shape=0.12 c2_now=0.12 c8_what's=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 of=0.12 with=0.12 c13_one=0.11 c4_then=0.10 c17_be=0.08 c9_an=0.07 c5_me=0.06 c6_both=0.06 a=0.06 c24_line=0.05 c3_rules=0.04 c20_arrow=0.03 POS=0.02

## What is weak, what to add
- heldout_formulations: FULL 0.714
- heldout_formulations: presence source: absent read absent 0.500
- heldout_formulations: role source 0.714
- heldout_formulations: head source 0.714
- heldout_formulations: occupancy: not given 0.667
- heldout_formulations: role target 0.857
- heldout_formulations: head target 0.857
- heldout_formulations: heads FULL (model) 0.714
- heldout_formulations: heads FULL (lexical order baseline) 0.714
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.571
- heldout_formulations: FULL [depth given] 0.714
- heldout_formulations: FULL [depth and negation given] 0.714
- heldout_formulations: FULL [presence not decided] 0.714
- heldout_formulations: role source [presence not decided] 0.714
- heldout_formulations: role target [presence not decided] 0.857
- heldout_formulations: heads FULL (model) [presence not decided] 0.714
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.714
- heldout_formulations: role source [pooled midpoint (comparison)] 0.714
- heldout_formulations: role target [pooled midpoint (comparison)] 0.857
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.714
- heldout_formulations: presence source: absent read absent [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence source: present read present 0.800
- heldout_formulations: presence source: share of 'present' readings that abstain 0.000
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence target: present read present 0.833
- heldout_formulations: presence target: share of 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.800
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.833
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: occupancy: unknown filler 0.500
- train (sample): presence source: share of 'present' readings that abstain 0.000
- train (sample): presence source: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of 'present' readings that abstain 0.007
- train (sample): presence target: share of true 'present' readings that abstain 0.007
- train (sample): presence source: absent read absent 0.800
- train (sample): presence target: absent read absent 0.833
- train (sample): occupancy: not given 0.857
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `disconnect NAME` FULL 0.000 (n 1)
- heldout_formulations: `disconnect the link from NAME to NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role source | role target |
|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.714 | 0.714 | 0.714 | 0.857 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.714 | 0.714 | 0.714 | 0.857 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.714 | 0.714 | 0.714 | 0.857 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | source | product: fitted | 0.800 | 0.500 | 0.650 | 0.000 (0.000 / 0.000) |
| heldout_formulations | source | comparison: pooled midpoint | 0.800 | 0.500 | 0.650 |  |
| heldout_formulations | target | product: fitted | 0.833 | 1.000 | 0.917 | 0.000 (— / 0.000) |
| heldout_formulations | target | comparison: pooled midpoint | 0.833 | 1.000 | 0.917 |  |
| train (sample) | source | product: fitted | 0.986 | 0.800 | 0.893 | 0.000 (0.000 / 0.000) |
| train (sample) | target | product: fitted | 0.965 | 0.833 | 0.899 | 0.007 (0.000 / 0.007) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
