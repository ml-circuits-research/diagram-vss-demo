# REPORT — world `connect_chain`, legend sha256:29fa627e5b3b… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
941 annotated sentences from 2 files; provenance: {'llm': 941}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_connect_chain_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 47 sentences
- heldout_formulations: 48 sentences
- train: 846 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
8690 tokens in the examples; 948 with no kind in the lexicon (share 0.109), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 25499d8. Memory curve: runs/micro_connect_chain_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.373 [rule: fit; pooled midpoint 0.535 (comparison)] (present 1.070, n 1260 / absent 0.000, n 659406)
- presence:source: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 447)
- presence:style: threshold 0.523 [rule: fit; pooled midpoint 0.422 (comparison)] (present 0.776, n 16 / absent 0.068, n 431)
- presence:arrow: threshold 0.177 [rule: fit; pooled midpoint 0.473 (comparison)] (present 0.902, n 17 / absent 0.044, n 430)
- presence:edge: threshold 0.858 [rule: fit; pooled midpoint 0.569 (comparison)] (present 1.038, n 7 / absent 0.101, n 440)
- presence:pairing: threshold 0.490 [rule: fit; pooled midpoint 0.663 (comparison)] (present 1.255, n 244 / absent 0.072, n 203)
- presence:members: threshold 0.512 [rule: fit; pooled midpoint 0.811 (comparison)] (present 1.412, n 408 / absent 0.209, n 39)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 7)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): source 0.001, style 0.333, arrow 0.500, edge 0.050, pairing 0.333, members 0.001, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 48 of 48)
| axis | accuracy |
|---|---|
| FULL | 0.708 |
| FULL [depth given] | 0.708 |
| FULL [depth and negation given] | 0.708 |
| FULL [presence not decided] | 0.083 |
| FULL [pooled midpoint (comparison)] | 0.604 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence members: present read present | 0.949 |
| presence members: share of 'present' readings that abstain | 0.081 |
| presence members: share of true 'present' readings that abstain | 0.081 |
| structure (depth, negation) | 0.917 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.854 |
| set members: first gold member in the decoded set | 0.833 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.917 |
| event type (synonym table) | 0.917 |
| role source | 1.000 |
| head source | 1.000 |
| lexical order head source | 1.000 |
| lexical bag head source | 1.000 |
| occupancy: not given | 1.000 |
| role style | 0.958 |
| head style | 0.958 |
| lexical order head style | 0.917 |
| lexical bag head style | 0.917 |
| role arrow | 0.979 |
| head arrow | 0.979 |
| lexical order head arrow | 0.958 |
| lexical bag head arrow | 0.958 |
| role edge | 0.979 |
| head edge | 0.979 |
| lexical order head edge | 0.979 |
| lexical bag head edge | 0.979 |
| role pairing | 0.979 |
| head pairing | 0.979 |
| lexical order head pairing | 1.000 |
| lexical bag head pairing | 0.979 |
| role members | 0.792 |
| head members | 0.792 |
| lexical order head members | 0.125 |
| lexical bag head members | 0.125 |
| occupancy: unknown filler | 0.881 |
| heads FULL (model) | 0.708 |
| heads FULL (lexical order baseline) | 0.104 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.104 |
| role source [presence not decided] | 0.292 |
| role style [presence not decided] | 1.000 |
| role arrow [presence not decided] | 1.000 |
| role edge [presence not decided] | 0.896 |
| role pairing [presence not decided] | 0.979 |
| role members [presence not decided] | 0.771 |
| heads FULL (model) [presence not decided] | 0.083 |
| role source [pooled midpoint (comparison)] | 1.000 |
| role style [pooled midpoint (comparison)] | 0.958 |
| role arrow [pooled midpoint (comparison)] | 0.979 |
| role edge [pooled midpoint (comparison)] | 0.979 |
| role pairing [pooled midpoint (comparison)] | 0.958 |
| role members [pooled midpoint (comparison)] | 0.667 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.604 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.865 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| occupancy: known filler | 0.844 |
| presence pairing: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: present read present | 0.500 |
| presence style: present read present [pooled midpoint (comparison)] | 0.500 |
| presence arrow: present read present | 0.500 |
| presence edge: present read present | 0.000 |
| presence members: absent read absent | 1.000 |
| presence arrow: present read present [pooled midpoint (comparison)] | 0.500 |
| presence edge: present read present [pooled midpoint (comparison)] | 0.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |

residual mean 0.252; status {'ok': 41, 'unknown-event': 4, 'abstain': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.917 | 0.461 / 0.245 | 1.00 | 0.083 | 0.000 / 0.000 |
| role members | 0.762 | 0.278 / 0.050 | 0.88 | 0.143 | 0.024 / 0.095 |
| roles (pooled) | 0.797 | 0.304 / 0.037 | 0.88 | 0.095 | 0.014 / 0.108 |
| role pairing | 0.960 | 0.410 / 0.225 | 1.00 | 0.040 | 0.000 / 0.000 |
| role style | 0.500 | 0.078 / 0.000 | 0.50 | 0.000 | 0.000 / 0.500 |
| role arrow | 0.500 | 0.122 / 0.024 | 0.50 | 0.000 | 0.000 / 0.500 |
| role edge | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

### train (sample) — catalog candidates (n = 300 of 846)
| axis | accuracy |
|---|---|
| FULL | 0.900 |
| FULL [depth given] | 0.900 |
| FULL [depth and negation given] | 0.900 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 0.996 |
| presence edge: absent read absent | 1.000 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.008 |
| presence members: share of true 'present' readings that abstain | 0.008 |
| structure (depth, negation) | 0.957 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.950 |
| set members: first gold member in the decoded set | 0.964 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.957 |
| event type (synonym table) | 0.957 |
| role source | 1.000 |
| head source | 1.000 |
| lexical order head source | 1.000 |
| lexical bag head source | 1.000 |
| occupancy: not given | 0.999 |
| role style | 1.000 |
| head style | 1.000 |
| lexical order head style | 0.973 |
| lexical bag head style | 0.997 |
| role arrow | 0.993 |
| head arrow | 0.993 |
| lexical order head arrow | 0.967 |
| lexical bag head arrow | 0.997 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.987 |
| lexical bag head edge | 1.000 |
| role pairing | 0.983 |
| head pairing | 0.983 |
| lexical order head pairing | 0.993 |
| lexical bag head pairing | 0.977 |
| occupancy: known filler | 0.966 |
| role members | 0.913 |
| head members | 0.913 |
| lexical order head members | 0.083 |
| lexical bag head members | 0.083 |
| occupancy: unknown filler | 0.964 |
| heads FULL (model) | 0.900 |
| heads FULL (lexical order baseline) | 0.080 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.080 |
| presence pairing: absent read absent | 1.000 |
| presence members: absent read absent | 1.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.250 |
| presence edge: share of true 'present' readings that abstain | 0.250 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of FALSE 'present' readings that abstain | 0.000 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |

residual mean 0.204; status {'ok': 284, 'unknown-event': 13, 'abstain': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.957 | 0.476 / 0.383 | 0.99 | 0.033 | 0.000 / 0.010 |
| role pairing | 0.968 | 0.418 / 0.236 | 1.00 | 0.032 | 0.000 / 0.000 |
| roles (pooled) | 0.929 | 0.357 / 0.195 | 0.99 | 0.068 | 0.004 / 0.002 |
| role members | 0.905 | 0.328 / 0.161 | 0.99 | 0.091 | 0.004 / 0.004 |
| role style | 1.000 | 0.281 / 0.216 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.087 / 0.032 | 0.75 | 0.000 | 0.250 / 0.000 |
| role arrow | 0.900 | 0.374 / 0.259 | 1.00 | 0.100 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
VERB=0.99 c27_them=0.87 and=0.85 c24_line=0.53 it=0.47 c3_rules=0.46 PAIR=0.38 c14_uh=0.36 DIR=0.32 c12_that=0.30 c11_what=0.24 c17_be=0.21 COLOR=0.21 SHAPE=0.20 of=0.16 c5_me=0.15 c15_on=0.13 c4_then=0.12 AXIS=0.12 LAYOUT=0.12 NOTCOLOR=0.12 RECENT=0.12 SIZE=0.12 SUPER=0.12 are=0.12 c16_new=0.12 c21_arrowheads=0.12 c25_pixels=0.12 c26_shape=0.12 c2_now=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 STYLE=0.11 ARROW=0.11 c6_both=0.10 c18_does=0.10 c8_what's=0.07 POS=0.06 c7_i=0.04 c1_have=0.03 c9_an=0.03 c10_three=0.03 to=0.03 QUANT=0.02 c19_goes=0.01 c13_one=0.01 c22_from=0.01 the=0.01 c20_arrow=0.01 with=0.00 NAME=0.00 a=0.00 unknown=0.00 c23_in=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.708
- heldout_formulations: presence members: share of 'present' readings that abstain 0.081
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.081
- heldout_formulations: set members: exact 0.854
- heldout_formulations: set members: first gold member in the decoded set 0.833
- heldout_formulations: role members 0.792
- heldout_formulations: head members 0.792
- heldout_formulations: occupancy: unknown filler 0.881
- heldout_formulations: heads FULL (model) 0.708
- heldout_formulations: heads FULL (lexical order baseline) 0.104
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.104
- heldout_formulations: FULL [depth given] 0.708
- heldout_formulations: FULL [depth and negation given] 0.708
- heldout_formulations: FULL [presence not decided] 0.083
- heldout_formulations: role source [presence not decided] 0.292
- heldout_formulations: role edge [presence not decided] 0.896
- heldout_formulations: role members [presence not decided] 0.771
- heldout_formulations: heads FULL (model) [presence not decided] 0.083
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.604
- heldout_formulations: role members [pooled midpoint (comparison)] 0.667
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.604
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.865
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: occupancy: known filler 0.844
- heldout_formulations: presence style: present read present 0.500
- heldout_formulations: presence style: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence arrow: present read present 0.500
- heldout_formulations: presence edge: present read present 0.000
- heldout_formulations: presence arrow: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence edge: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: share of 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: share of true 'present' readings that abstain 0.000
- train (sample): presence pairing: share of 'present' readings that abstain 0.000
- train (sample): presence pairing: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of 'present' readings that abstain 0.008
- train (sample): presence members: share of true 'present' readings that abstain 0.008
- train (sample): heads FULL (lexical order baseline) 0.080
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.080
- train (sample): presence style: share of 'present' readings that abstain 0.000
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.250
- train (sample): presence edge: share of true 'present' readings that abstain 0.250
- train (sample): presence arrow: share of 'present' readings that abstain 0.000
- train (sample): presence arrow: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence arrow: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `the NAME makes the NAME and the NAME makes the NAME` FULL 0.000 (n 1)
- heldout_formulations: `connect NAME , NAME and NAME in a PAIR , and make the arrows STYLE` FULL 0.000 (n 1)
- heldout_formulations: `draw STYLE connect from the NAME to the NAME and from the NAME to the NAME` FULL 0.000 (n 1)
- heldout_formulations: `connect the NAME to NAME , NAME to NAME , NAME to the NAME` FULL 0.000 (n 1)
- heldout_formulations: `connect all of c12_that in one PAIR` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role source | role style | role arrow | role edge | role pairing | role members |
|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.708 | 0.708 | 1.000 | 0.958 | 0.979 | 0.979 | 0.979 | 0.792 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.604 | 0.604 | 1.000 | 0.958 | 0.979 | 0.979 | 0.958 | 0.667 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.083 | 0.083 | 0.292 | 1.000 | 1.000 | 0.896 | 0.979 | 0.771 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | style | product: fitted | 0.500 | 1.000 | 0.750 | 0.000 (— / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | arrow | product: fitted | 0.500 | 1.000 | 0.750 | 0.000 (— / 0.000) |
| heldout_formulations | arrow | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | edge | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | edge | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | members | product: fitted | 0.949 | 1.000 | 0.974 | 0.081 (— / 0.081) |
| heldout_formulations | members | comparison: pooled midpoint | 0.865 | 1.000 | 0.932 |  |
| train (sample) | style | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | arrow | product: fitted | 1.000 | 0.996 | 0.998 | 0.000 (0.000 / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.250 (— / 0.250) |
| train (sample) | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 1.000 | 1.000 | 0.008 (— / 0.008) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
