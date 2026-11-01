# REPORT — world `connect_single`, legend sha256:1612ddc0d023… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
946 annotated sentences from 2 files; provenance: {'llm': 946}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_connect_single_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 40 sentences
- heldout_formulations: 43 sentences
- train: 863 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
5933 tokens in the examples; 186 with no kind in the lexicon (share 0.031), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 25499d8. Memory curve: runs/micro_connect_single_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:text: threshold 0.446 [rule: fit; pooled midpoint 2.461 (comparison)] (present 4.849, n 6 / absent 0.073, n 434)
- presence:source: threshold 0.824 [rule: fit; pooled midpoint 0.854 (comparison)] (present 1.039, n 424 / absent 0.669, n 16)
- presence:target: threshold 0.825 [rule: fit; pooled midpoint 0.752 (comparison)] (present 1.056, n 429 / absent 0.448, n 11)
- presence:style: threshold 0.535 [rule: fit; pooled midpoint 0.558 (comparison)] (present 1.050, n 104 / absent 0.065, n 336)
- presence:arrow: threshold 0.683 [rule: fit; pooled midpoint 0.638 (comparison)] (present 1.227, n 52 / absent 0.048, n 388)
- presence:edge: threshold 0.449 [rule: fit; pooled midpoint 0.602 (comparison)] (present 1.106, n 107 / absent 0.098, n 333)
- attr_presence:edge: threshold 0.553 [rule: fit; pooled midpoint 0.500 (comparison)] (present 0.888, n 7 / absent 0.113, n 100)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): text 0.071, source 0.001, target 0.001, style 0.333, arrow 0.500, edge 0.050, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 43 of 43)
| axis | accuracy |
|---|---|
| FULL | 0.791 |
| FULL [depth given] | 0.791 |
| FULL [depth and negation given] | 0.791 |
| FULL [presence not decided] | 0.814 |
| FULL [pooled midpoint (comparison)] | 0.721 |
| presence text: absent read absent | 1.000 |
| presence source: present read present | 0.973 |
| presence source: share of 'present' readings that abstain | 0.111 |
| presence source: share of true 'present' readings that abstain | 0.111 |
| presence target: present read present | 0.946 |
| presence target: share of 'present' readings that abstain | 0.029 |
| presence target: share of true 'present' readings that abstain | 0.029 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| structure (depth, negation) | 0.860 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.860 |
| event type (synonym table) | 0.860 |
| role text | 0.977 |
| head text | 0.977 |
| lexical order head text | 0.977 |
| lexical bag head text | 0.977 |
| occupancy: not given | 1.000 |
| role source | 0.837 |
| head source | 0.837 |
| lexical order head source | 1.000 |
| lexical bag head source | 0.442 |
| occupancy: known filler | 0.795 |
| role target | 0.837 |
| head target | 0.837 |
| lexical order head target | 0.977 |
| lexical bag head target | 0.512 |
| role style | 0.930 |
| head style | 0.930 |
| lexical order head style | 0.698 |
| lexical bag head style | 0.884 |
| role arrow | 0.977 |
| head arrow | 0.977 |
| lexical order head arrow | 0.930 |
| lexical bag head arrow | 0.930 |
| role edge | 0.953 |
| head edge | 0.953 |
| lexical order head edge | 0.698 |
| lexical bag head edge | 0.907 |
| heads FULL (model) | 0.791 |
| heads FULL (lexical order baseline) | 0.651 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.163 |
| role text [presence not decided] | 0.977 |
| role source [presence not decided] | 0.860 |
| role target [presence not decided] | 0.884 |
| role style [presence not decided] | 0.884 |
| role arrow [presence not decided] | 0.977 |
| role edge [presence not decided] | 0.907 |
| heads FULL (model) [presence not decided] | 0.814 |
| role text [pooled midpoint (comparison)] | 0.977 |
| role source [pooled midpoint (comparison)] | 0.767 |
| role target [pooled midpoint (comparison)] | 0.837 |
| role style [pooled midpoint (comparison)] | 0.930 |
| role arrow [pooled midpoint (comparison)] | 0.977 |
| role edge [pooled midpoint (comparison)] | 0.953 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.721 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.892 |
| presence target: present read present [pooled midpoint (comparison)] | 0.946 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| occupancy: unknown filler | 0.857 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present [pooled midpoint (comparison)] | 1.000 |

residual mean 0.191; status {'ok': 32, 'unknown-event': 6, 'abstain': 5}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.860 | 0.473 / 0.188 | 0.98 | 0.116 | 0.000 / 0.023 |
| role source | 0.837 | 0.152 / 0.041 | 0.88 | 0.140 | 0.093 / 0.023 |
| roles (pooled) | 0.817 | 0.223 / 0.065 | 0.92 | 0.148 | 0.043 / 0.035 |
| role target | 0.833 | 0.184 / 0.062 | 0.90 | 0.095 | 0.024 / 0.071 |
| role style | 0.769 | 0.396 / 0.330 | 1.00 | 0.231 | 0.000 / 0.000 |
| role edge | 0.846 | 0.389 / 0.199 | 1.00 | 0.154 | 0.000 / 0.000 |
| role arrow | 0.667 | 0.309 / 0.257 | 1.00 | 0.333 | 0.000 / 0.000 |
| role text | 0.000 | 0.221 / 0.221 | 1.00 | 1.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 863)
| axis | accuracy |
|---|---|
| FULL | 0.800 |
| FULL [depth given] | 0.800 |
| FULL [depth and negation given] | 0.800 |
| presence text: absent read absent | 1.000 |
| presence source: present read present | 0.981 |
| presence source: share of 'present' readings that abstain | 0.020 |
| presence source: share of true 'present' readings that abstain | 0.020 |
| presence target: present read present | 0.931 |
| presence target: share of 'present' readings that abstain | 0.025 |
| presence target: share of true 'present' readings that abstain | 0.025 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| structure (depth, negation) | 0.883 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 1.000 |
| set targets: exact | 1.000 |
| predicate (surface lemma) | 0.883 |
| event type (synonym table) | 0.883 |
| role text | 0.993 |
| head text | 0.993 |
| lexical order head text | 0.987 |
| lexical bag head text | 1.000 |
| occupancy: not given | 1.000 |
| role source | 0.867 |
| head source | 0.867 |
| lexical order head source | 0.980 |
| lexical bag head source | 0.947 |
| occupancy: known filler | 0.858 |
| role target | 0.823 |
| head target | 0.823 |
| lexical order head target | 0.937 |
| lexical bag head target | 0.950 |
| role style | 0.977 |
| head style | 0.977 |
| lexical order head style | 0.753 |
| lexical bag head style | 0.960 |
| role arrow | 0.983 |
| head arrow | 0.983 |
| lexical order head arrow | 0.880 |
| lexical bag head arrow | 0.930 |
| role edge | 0.980 |
| head edge | 0.980 |
| lexical order head edge | 0.740 |
| lexical bag head edge | 0.943 |
| heads FULL (model) | 0.800 |
| heads FULL (lexical order baseline) | 0.600 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.830 |
| presence style: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |

residual mean 0.198; status {'ok': 254, 'abstain': 11, 'unknown-event': 35}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.883 | 0.473 / 0.143 | 0.95 | 0.063 | 0.000 / 0.053 |
| role source | 0.864 | 0.192 / 0.075 | 0.97 | 0.119 | 0.017 / 0.017 |
| roles (pooled) | 0.855 | 0.258 / 0.084 | 0.95 | 0.113 | 0.014 / 0.032 |
| role target | 0.819 | 0.217 / 0.071 | 0.91 | 0.113 | 0.020 / 0.068 |
| role style | 0.905 | 0.418 / 0.353 | 1.00 | 0.095 | 0.000 / 0.000 |
| role edge | 0.923 | 0.450 / 0.388 | 1.00 | 0.077 | 0.000 / 0.000 |
| role arrow | 0.861 | 0.362 / 0.253 | 1.00 | 0.139 | 0.000 / 0.000 |
| role text | 0.500 | 0.421 / 0.273 | 1.00 | 0.500 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
to=0.99 VERB=0.91 c27_them=0.84 TEXT=0.74 LAYOUT=0.66 RECENT=0.60 c24_line=0.53 c15_on=0.53 c14_uh=0.53 c23_in=0.51 c2_now=0.50 and=0.50 c1_have=0.48 c17_be=0.40 c16_new=0.37 QUANT=0.34 c10_three=0.33 COLOR=0.31 labeled=0.29 c12_that=0.26 PAIR=0.21 are=0.17 c3_rules=0.15 it=0.14 of=0.13 AXIS=0.12 NOTCOLOR=0.12 SHAPE=0.12 SIZE=0.12 SUPER=0.12 c21_arrowheads=0.12 c25_pixels=0.12 c26_shape=0.12 c8_what's=0.12 called=0.12 lines=0.12 named=0.12 directly=0.11 POS=0.10 c13_one=0.09 c20_arrow=0.08 c11_what=0.07 c5_me=0.05 c18_does=0.05 c19_goes=0.05 NAME=0.04 c7_i=0.02 DIR=0.01 ARROW=0.01 c9_an=0.01 c6_both=0.01 STYLE=0.01 c22_from=0.01 unknown=0.00 a=0.00 c4_then=0.00 with=0.00 the=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.791
- heldout_formulations: presence source: share of 'present' readings that abstain 0.111
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.111
- heldout_formulations: presence target: share of 'present' readings that abstain 0.029
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.029
- heldout_formulations: structure (depth, negation) 0.860
- heldout_formulations: predicate (surface lemma) 0.860
- heldout_formulations: event type (synonym table) 0.860
- heldout_formulations: role source 0.837
- heldout_formulations: head source 0.837
- heldout_formulations: occupancy: known filler 0.795
- heldout_formulations: role target 0.837
- heldout_formulations: head target 0.837
- heldout_formulations: heads FULL (model) 0.791
- heldout_formulations: heads FULL (lexical order baseline) 0.651
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.163
- heldout_formulations: FULL [depth given] 0.791
- heldout_formulations: FULL [depth and negation given] 0.791
- heldout_formulations: FULL [presence not decided] 0.814
- heldout_formulations: role source [presence not decided] 0.860
- heldout_formulations: role target [presence not decided] 0.884
- heldout_formulations: role style [presence not decided] 0.884
- heldout_formulations: heads FULL (model) [presence not decided] 0.814
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.721
- heldout_formulations: role source [pooled midpoint (comparison)] 0.767
- heldout_formulations: role target [pooled midpoint (comparison)] 0.837
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.721
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.892
- heldout_formulations: occupancy: unknown filler 0.857
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: share of 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: share of true 'present' readings that abstain 0.000
- train (sample): FULL 0.800
- train (sample): presence source: share of 'present' readings that abstain 0.020
- train (sample): presence source: share of true 'present' readings that abstain 0.020
- train (sample): presence target: share of 'present' readings that abstain 0.025
- train (sample): presence target: share of true 'present' readings that abstain 0.025
- train (sample): presence style: share of 'present' readings that abstain 0.000
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): structure (depth, negation) 0.883
- train (sample): predicate (surface lemma) 0.883
- train (sample): event type (synonym table) 0.883
- train (sample): role source 0.867
- train (sample): head source 0.867
- train (sample): occupancy: known filler 0.858
- train (sample): role target 0.823
- train (sample): head target 0.823
- train (sample): heads FULL (model) 0.800
- train (sample): heads FULL (lexical order baseline) 0.600
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.830
- train (sample): FULL [depth given] 0.800
- train (sample): FULL [depth and negation given] 0.800
- train (sample): presence arrow: share of 'present' readings that abstain 0.000
- train (sample): presence arrow: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `show as a STYLE ARROW the NAME to the NAME` FULL 0.000 (n 1)
- heldout_formulations: `connect NAME to the NAME with a STYLE c20_arrow` FULL 0.000 (n 1)
- heldout_formulations: `NAME too , but NAME with a STYLE c24_line` FULL 0.000 (n 1)
- heldout_formulations: `the NAME to the NAME` FULL 0.000 (n 1)
- heldout_formulations: `NAME is neigh_q NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role text | role source | role target | role style | role arrow | role edge |
|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.791 | 0.791 | 0.977 | 0.837 | 0.837 | 0.930 | 0.977 | 0.953 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.721 | 0.721 | 0.977 | 0.767 | 0.837 | 0.930 | 0.977 | 0.953 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.814 | 0.814 | 0.977 | 0.860 | 0.884 | 0.884 | 0.977 | 0.907 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | text | product: fitted | — | 1.000 | — |  |
| heldout_formulations | text | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | source | product: fitted | 0.973 | — | — | 0.111 (— / 0.111) |
| heldout_formulations | source | comparison: pooled midpoint | 0.892 | — | — |  |
| heldout_formulations | target | product: fitted | 0.946 | — | — | 0.029 (— / 0.029) |
| heldout_formulations | target | comparison: pooled midpoint | 0.946 | — | — |  |
| heldout_formulations | style | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | arrow | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | arrow | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.981 | 1.000 | 0.990 | 0.020 (— / 0.020) |
| train (sample) | target | product: fitted | 0.931 | 1.000 | 0.965 | 0.025 (— / 0.025) |
| train (sample) | style | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | arrow | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
