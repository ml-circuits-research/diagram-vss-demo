# REPORT — world `history7r2`, legend sha256:6a7ca9d3f830… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
710 annotated sentences from 2 files; provenance: {'llm': 710}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_history7r2_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 22 sentences
- heldout_formulations: 35 sentences
- train: 653 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
2397 tokens in the examples; 183 with no kind in the lexicon (share 0.076), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cuda, codes path+chainL+bigram, gates learned (closed start). Code commit 248f718. Memory curve: runs/micro_history7r2_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): predicate 0.333

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 35 of 35)
| axis | accuracy |
|---|---|
| FULL | 1.000 |
| FULL [pooled midpoint (comparison)] | 1.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| heads FULL (model) | 1.000 |
| heads FULL (lexical order baseline) | 1.000 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 1.000 |

residual mean 0.054; status {'ok': 35}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.950 / 0.890 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 150 of 653)
| axis | accuracy |
|---|---|
| FULL | 1.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| heads FULL (model) | 1.000 |
| heads FULL (lexical order baseline) | 1.000 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 1.000 |

residual mean 0.044; status {'ok': 150}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.974 / 0.933 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
c12_that=0.93 the=0.90 it=0.90 SHAPE=0.77 c16_new=0.74 c27_them=0.73 unknown=0.72 c7_i=0.71 c3_rules=0.71 c2_now=0.69 c8_what's=0.54 NAME=0.50 c22_from=0.46 c1_have=0.45 of=0.44 COLOR=0.43 c9_an=0.42 c4_then=0.42 c13_one=0.42 QUANT=0.41 c5_me=0.41 c15_on=0.40 c11_what=0.39 c18_does=0.29 lines=0.27 PAIR=0.25 ARROW=0.23 c24_line=0.22 AXIS=0.12 LAYOUT=0.12 NOTCOLOR=0.12 POS=0.12 RECENT=0.12 SIZE=0.12 STYLE=0.12 SUPER=0.12 are=0.12 c14_uh=0.12 c19_goes=0.12 c20_arrow=0.12 c21_arrowheads=0.12 c23_in=0.12 c25_pixels=0.12 c26_shape=0.12 called=0.12 directly=0.12 labeled=0.12 named=0.12 to=0.12 DIR=0.09 c17_be=0.07 c10_three=0.07 and=0.06 c6_both=0.05 a=0.05 with=0.04 VERB=0.02

## What is weak, what to add
- nothing under 0.9 on these splits

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- none under 0.9

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL |  |
|---|---|---|---|
| heldout_formulations | product readout: presence decided | 1.000 | 1.000 |  |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 1.000 | 1.000 |  |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan |  |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
