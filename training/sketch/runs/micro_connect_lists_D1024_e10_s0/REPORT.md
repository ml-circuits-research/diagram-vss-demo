# REPORT — world `connect_lists`, legend sha256:3a6c83bb8465… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
809 annotated sentences from 2 files; provenance: {'llm': 809}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_connect_lists_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 39 sentences
- heldout_formulations: 38 sentences
- train: 732 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
6279 tokens in the examples; 357 with no kind in the lexicon (share 0.057), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 25499d8. Memory curve: runs/micro_connect_lists_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.114 [rule: fit; pooled midpoint 0.474 (comparison)] (present 0.948, n 260 / absent 0.001, n 642436)
- set_member:targets: threshold 0.196 [rule: fit; pooled midpoint 0.443 (comparison)] (present 0.886, n 557 / absent 0.001, n 642139)
- presence:source: threshold 0.621 [rule: fit; pooled midpoint 0.653 (comparison)] (present 0.945, n 291 / absent 0.361, n 148)
- presence:target: threshold 0.413 [rule: fit; pooled midpoint 0.554 (comparison)] (present 0.902, n 141 / absent 0.205, n 298)
- presence:style: threshold 0.431 [rule: fit; pooled midpoint 0.457 (comparison)] (present 0.844, n 39 / absent 0.069, n 400)
- presence:arrow: threshold 0.519 [rule: fit; pooled midpoint 0.679 (comparison)] (present 1.308, n 84 / absent 0.051, n 355)
- presence:edge: threshold 0.703 [rule: fit; pooled midpoint 0.826 (comparison)] (present 1.570, n 14 / absent 0.082, n 435)
- presence:members: threshold 0.307 [rule: fit; pooled midpoint 0.627 (comparison)] (present 1.004, n 130 / absent 0.251, n 309)
- presence:targets: threshold 0.457 [rule: fit; pooled midpoint 0.676 (comparison)] (present 0.970, n 257 / absent 0.383, n 182)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): source 0.001, target 0.001, style 0.333, arrow 0.500, edge 0.062, members 0.001, targets 0.001, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 38 of 38)
| axis | accuracy |
|---|---|
| FULL | 0.395 |
| FULL [depth given] | 0.395 |
| FULL [depth and negation given] | 0.395 |
| FULL [presence not decided] | 0.026 |
| FULL [pooled midpoint (comparison)] | 0.289 |
| presence source: absent read absent | 0.933 |
| presence target: present read present | 0.429 |
| presence target: share of 'present' readings that abstain | 0.222 |
| presence target: share of true 'present' readings that abstain | 0.167 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence members: present read present | 0.923 |
| presence members: share of 'present' readings that abstain | 0.312 |
| presence members: share of true 'present' readings that abstain | 0.333 |
| presence targets: absent read absent | 0.786 |
| presence targets: share of 'present' readings that abstain | 0.111 |
| presence targets: share of FALSE 'present' readings that abstain | 0.000 |
| structure (depth, negation) | 0.842 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.684 |
| set members: first gold member in the decoded set | 0.688 |
| set targets: exact | 0.711 |
| predicate (surface lemma) | 0.842 |
| event type (synonym table) | 0.842 |
| role source | 0.842 |
| head source | 0.842 |
| lexical order head source | 0.526 |
| lexical bag head source | 0.421 |
| occupancy: not given | 0.939 |
| role target | 0.632 |
| head target | 0.632 |
| lexical order head target | 0.553 |
| lexical bag head target | 0.605 |
| occupancy: known filler | 0.571 |
| role style | 0.947 |
| head style | 0.947 |
| lexical order head style | 0.895 |
| lexical bag head style | 0.921 |
| role arrow | 0.947 |
| head arrow | 0.947 |
| lexical order head arrow | 0.816 |
| lexical bag head arrow | 0.895 |
| role edge | 0.974 |
| head edge | 0.974 |
| lexical order head edge | 0.947 |
| lexical bag head edge | 0.947 |
| role members | 0.658 |
| head members | 0.658 |
| lexical order head members | 0.579 |
| lexical bag head members | 0.579 |
| occupancy: unknown filler | 0.706 |
| role targets | 0.711 |
| head targets | 0.711 |
| lexical order head targets | 0.474 |
| lexical bag head targets | 0.132 |
| heads FULL (model) | 0.395 |
| heads FULL (lexical order baseline) | 0.026 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.000 |
| role source [presence not decided] | 0.605 |
| role target [presence not decided] | 0.395 |
| role style [presence not decided] | 0.974 |
| role arrow [presence not decided] | 0.974 |
| role edge [presence not decided] | 1.000 |
| role members [presence not decided] | 0.342 |
| role targets [presence not decided] | 0.500 |
| heads FULL (model) [presence not decided] | 0.026 |
| role source [pooled midpoint (comparison)] | 0.816 |
| role target [pooled midpoint (comparison)] | 0.553 |
| role style [pooled midpoint (comparison)] | 0.947 |
| role arrow [pooled midpoint (comparison)] | 0.921 |
| role edge [pooled midpoint (comparison)] | 0.947 |
| role members [pooled midpoint (comparison)] | 0.632 |
| role targets [pooled midpoint (comparison)] | 0.684 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.289 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: present read present [pooled midpoint (comparison)] | 0.083 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.273 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.750 |
| presence source: present read present | 0.882 |
| presence source: share of 'present' readings that abstain | 0.188 |
| presence source: share of true 'present' readings that abstain | 0.133 |
| presence target: absent read absent | 0.833 |
| presence members: absent read absent | 0.789 |
| presence targets: present read present | 0.833 |
| presence targets: share of true 'present' readings that abstain | 0.133 |
| set targets: first gold member in the decoded set | 0.750 |
| presence source: present read present [pooled midpoint (comparison)] | 0.765 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.944 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.667 |
| presence members: share of FALSE 'present' readings that abstain | 0.250 |
| presence target: share of FALSE 'present' readings that abstain | 0.333 |
| presence style: present read present | 0.500 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present | 0.833 |
| presence arrow: share of 'present' readings that abstain | 0.200 |
| presence arrow: share of true 'present' readings that abstain | 0.200 |
| presence style: present read present [pooled midpoint (comparison)] | 0.500 |
| presence arrow: present read present [pooled midpoint (comparison)] | 0.667 |
| presence source: share of FALSE 'present' readings that abstain | 1.000 |
| presence edge: present read present | 0.500 |
| presence edge: present read present [pooled midpoint (comparison)] | 0.000 |
| presence edge: share of 'present' readings that abstain | 1.000 |
| presence edge: share of true 'present' readings that abstain | 1.000 |

residual mean 0.296; status {'ok': 22, 'unknown-event': 5, 'abstain': 10, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.842 | 0.510 / 0.380 | 1.00 | 0.158 | 0.000 / 0.000 |
| role target | 0.353 | 0.082 / 0.000 | 0.47 | 0.176 | 0.059 / 0.471 |
| roles (pooled) | 0.558 | 0.138 / 0.000 | 0.62 | 0.128 | 0.070 / 0.314 |
| role members | 0.438 | 0.102 / 0.004 | 0.56 | 0.188 | 0.062 / 0.375 |
| role source | 0.750 | 0.156 / 0.000 | 0.75 | 0.100 | 0.100 / 0.150 |
| role targets | 0.600 | 0.129 / 0.000 | 0.70 | 0.100 | 0.000 / 0.300 |
| role style | 0.500 | 0.162 / 0.000 | 0.50 | 0.000 | 0.000 / 0.500 |
| role arrow | 0.714 | 0.350 / 0.025 | 0.71 | 0.143 | 0.143 / 0.143 |
| role edge | 0.500 | 0.011 / 0.002 | 0.00 | 0.000 | 0.500 / 0.500 |

### train (sample) — catalog candidates (n = 300 of 732)
| axis | accuracy |
|---|---|
| FULL | 0.650 |
| FULL [depth given] | 0.650 |
| FULL [depth and negation given] | 0.650 |
| presence source: absent read absent | 0.972 |
| presence target: present read present | 0.913 |
| presence target: share of 'present' readings that abstain | 0.107 |
| presence target: share of true 'present' readings that abstain | 0.042 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence members: present read present | 0.989 |
| presence members: share of 'present' readings that abstain | 0.353 |
| presence members: share of true 'present' readings that abstain | 0.394 |
| presence targets: absent read absent | 0.847 |
| structure (depth, negation) | 0.933 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.847 |
| set members: first gold member in the decoded set | 0.940 |
| set targets: exact | 0.853 |
| predicate (surface lemma) | 0.933 |
| event type (synonym table) | 0.933 |
| role source | 0.880 |
| head source | 0.880 |
| lexical order head source | 0.630 |
| lexical bag head source | 0.807 |
| occupancy: not given | 0.964 |
| role target | 0.920 |
| head target | 0.920 |
| lexical order head target | 0.630 |
| lexical bag head target | 0.803 |
| occupancy: known filler | 0.865 |
| role style | 0.997 |
| head style | 0.997 |
| lexical order head style | 0.897 |
| lexical bag head style | 0.973 |
| role arrow | 0.993 |
| head arrow | 0.993 |
| lexical order head arrow | 0.820 |
| lexical bag head arrow | 0.997 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.993 |
| lexical bag head edge | 1.000 |
| role members | 0.817 |
| head members | 0.817 |
| lexical order head members | 0.667 |
| lexical bag head members | 0.633 |
| occupancy: unknown filler | 0.934 |
| role targets | 0.837 |
| head targets | 0.837 |
| lexical order head targets | 0.470 |
| lexical bag head targets | 0.323 |
| heads FULL (model) | 0.650 |
| heads FULL (lexical order baseline) | 0.070 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.133 |
| presence source: present read present | 0.884 |
| presence source: share of 'present' readings that abstain | 0.051 |
| presence source: share of true 'present' readings that abstain | 0.033 |
| presence target: absent read absent | 0.955 |
| presence members: absent read absent | 0.881 |
| presence targets: present read present | 0.993 |
| presence targets: share of 'present' readings that abstain | 0.036 |
| presence targets: share of true 'present' readings that abstain | 0.020 |
| set targets: first gold member in the decoded set | 0.931 |
| presence targets: share of FALSE 'present' readings that abstain | 0.150 |
| presence source: share of FALSE 'present' readings that abstain | 1.000 |
| presence members: share of FALSE 'present' readings that abstain | 0.182 |
| presence target: share of FALSE 'present' readings that abstain | 0.875 |
| presence arrow: present read present | 0.981 |
| presence arrow: share of 'present' readings that abstain | 0.019 |
| presence arrow: share of true 'present' readings that abstain | 0.019 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |

residual mean 0.177; status {'ok': 220, 'abstain': 60, 'unknown-event': 20}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.933 | 0.530 / 0.433 | 0.99 | 0.057 | 0.000 / 0.010 |
| role target | 0.856 | 0.187 / 0.011 | 0.88 | 0.063 | 0.036 / 0.081 |
| roles (pooled) | 0.823 | 0.197 / 0.028 | 0.87 | 0.103 | 0.058 / 0.075 |
| role members | 0.670 | 0.109 / 0.015 | 0.60 | 0.180 | 0.250 / 0.150 |
| role source | 0.823 | 0.193 / 0.000 | 0.87 | 0.070 | 0.027 / 0.108 |
| role targets | 0.818 | 0.175 / 0.097 | 0.97 | 0.164 | 0.013 / 0.019 |
| role arrow | 0.963 | 0.393 / 0.159 | 0.96 | 0.019 | 0.019 / 0.019 |
| role style | 0.968 | 0.316 / 0.196 | 1.00 | 0.032 | 0.000 / 0.000 |
| role edge | 1.000 | 0.205 / 0.164 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
and=0.99 to=0.99 c15_on=0.91 c27_them=0.74 it=0.73 c1_have=0.71 c3_rules=0.64 c13_one=0.57 c14_uh=0.57 c9_an=0.50 c23_in=0.49 c24_line=0.48 VERB=0.48 c2_now=0.47 SHAPE=0.46 c18_does=0.44 c6_both=0.43 c10_three=0.35 QUANT=0.30 are=0.30 COLOR=0.28 c7_i=0.24 c17_be=0.22 c12_that=0.18 AXIS=0.12 LAYOUT=0.12 NOTCOLOR=0.12 POS=0.12 RECENT=0.12 SIZE=0.12 SUPER=0.12 c11_what=0.12 c16_new=0.12 c21_arrowheads=0.12 c25_pixels=0.12 c26_shape=0.12 c8_what's=0.12 called=0.12 directly=0.12 labeled=0.12 lines=0.12 named=0.12 c5_me=0.10 PAIR=0.07 a=0.06 DIR=0.01 c19_goes=0.01 with=0.01 c20_arrow=0.01 of=0.01 STYLE=0.01 c4_then=0.00 ARROW=0.00 c22_from=0.00 NAME=0.00 the=0.00 unknown=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.395
- heldout_formulations: presence target: present read present 0.429
- heldout_formulations: presence target: share of 'present' readings that abstain 0.222
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.167
- heldout_formulations: presence members: share of 'present' readings that abstain 0.312
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.333
- heldout_formulations: presence targets: absent read absent 0.786
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.111
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: structure (depth, negation) 0.842
- heldout_formulations: set members: exact 0.684
- heldout_formulations: set members: first gold member in the decoded set 0.688
- heldout_formulations: set targets: exact 0.711
- heldout_formulations: predicate (surface lemma) 0.842
- heldout_formulations: event type (synonym table) 0.842
- heldout_formulations: role source 0.842
- heldout_formulations: head source 0.842
- heldout_formulations: role target 0.632
- heldout_formulations: head target 0.632
- heldout_formulations: occupancy: known filler 0.571
- heldout_formulations: role members 0.658
- heldout_formulations: head members 0.658
- heldout_formulations: occupancy: unknown filler 0.706
- heldout_formulations: role targets 0.711
- heldout_formulations: head targets 0.711
- heldout_formulations: heads FULL (model) 0.395
- heldout_formulations: heads FULL (lexical order baseline) 0.026
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.000
- heldout_formulations: FULL [depth given] 0.395
- heldout_formulations: FULL [depth and negation given] 0.395
- heldout_formulations: FULL [presence not decided] 0.026
- heldout_formulations: role source [presence not decided] 0.605
- heldout_formulations: role target [presence not decided] 0.395
- heldout_formulations: role members [presence not decided] 0.342
- heldout_formulations: role targets [presence not decided] 0.500
- heldout_formulations: heads FULL (model) [presence not decided] 0.026
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.289
- heldout_formulations: role source [pooled midpoint (comparison)] 0.816
- heldout_formulations: role target [pooled midpoint (comparison)] 0.553
- heldout_formulations: role members [pooled midpoint (comparison)] 0.632
- heldout_formulations: role targets [pooled midpoint (comparison)] 0.684
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.289
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.083
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.273
- heldout_formulations: presence targets: absent read absent [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence source: present read present 0.882
- heldout_formulations: presence source: share of 'present' readings that abstain 0.188
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.133
- heldout_formulations: presence target: absent read absent 0.833
- heldout_formulations: presence members: absent read absent 0.789
- heldout_formulations: presence targets: present read present 0.833
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.133
- heldout_formulations: set targets: first gold member in the decoded set 0.750
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.765
- heldout_formulations: presence targets: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.250
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.333
- heldout_formulations: presence style: present read present 0.500
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: present read present 0.833
- heldout_formulations: presence arrow: share of 'present' readings that abstain 0.200
- heldout_formulations: presence arrow: share of true 'present' readings that abstain 0.200
- heldout_formulations: presence style: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence arrow: present read present [pooled midpoint (comparison)] 0.667
- heldout_formulations: presence edge: present read present 0.500
- heldout_formulations: presence edge: present read present [pooled midpoint (comparison)] 0.000
- train (sample): FULL 0.650
- train (sample): presence target: share of 'present' readings that abstain 0.107
- train (sample): presence target: share of true 'present' readings that abstain 0.042
- train (sample): presence members: share of 'present' readings that abstain 0.353
- train (sample): presence members: share of true 'present' readings that abstain 0.394
- train (sample): presence targets: absent read absent 0.847
- train (sample): set members: exact 0.847
- train (sample): set targets: exact 0.853
- train (sample): role source 0.880
- train (sample): head source 0.880
- train (sample): occupancy: known filler 0.865
- train (sample): role members 0.817
- train (sample): head members 0.817
- train (sample): role targets 0.837
- train (sample): head targets 0.837
- train (sample): heads FULL (model) 0.650
- train (sample): heads FULL (lexical order baseline) 0.070
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.133
- train (sample): FULL [depth given] 0.650
- train (sample): FULL [depth and negation given] 0.650
- train (sample): presence source: present read present 0.884
- train (sample): presence source: share of 'present' readings that abstain 0.051
- train (sample): presence source: share of true 'present' readings that abstain 0.033
- train (sample): presence members: absent read absent 0.881
- train (sample): presence targets: share of 'present' readings that abstain 0.036
- train (sample): presence targets: share of true 'present' readings that abstain 0.020
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.150
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.182
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.875
- train (sample): presence arrow: share of 'present' readings that abstain 0.019
- train (sample): presence arrow: share of true 'present' readings that abstain 0.019
- train (sample): presence style: share of 'present' readings that abstain 0.000
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `connect NAME to NAME and NAME to NAME` FULL 0.000 (n 5)
- heldout_formulations: `NAME and NAME go into the NAME` FULL 0.000 (n 1)
- heldout_formulations: `NAME and NAME go onto NAME` FULL 0.000 (n 1)
- heldout_formulations: `NAME to both stages` FULL 0.000 (n 1)
- heldout_formulations: `connect NAME into NAME and NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role source | role target | role style | role arrow | role edge | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.395 | 0.395 | 0.842 | 0.632 | 0.947 | 0.947 | 0.974 | 0.658 | 0.711 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.289 | 0.289 | 0.816 | 0.553 | 0.947 | 0.921 | 0.947 | 0.632 | 0.684 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.026 | 0.026 | 0.605 | 0.395 | 0.974 | 0.974 | 1.000 | 0.342 | 0.500 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | source | product: fitted | 0.882 | 0.933 | 0.908 | 0.188 (1.000 / 0.133) |
| heldout_formulations | source | comparison: pooled midpoint | 0.765 | 1.000 | 0.882 |  |
| heldout_formulations | target | product: fitted | 0.429 | 0.833 | 0.631 | 0.222 (0.333 / 0.167) |
| heldout_formulations | target | comparison: pooled midpoint | 0.083 | 0.944 | 0.514 |  |
| heldout_formulations | style | product: fitted | 0.500 | 1.000 | 0.750 | 0.000 (— / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | arrow | product: fitted | 0.833 | 1.000 | 0.917 | 0.200 (— / 0.200) |
| heldout_formulations | arrow | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_formulations | edge | product: fitted | 0.500 | 1.000 | 0.750 | 1.000 (— / 1.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | members | product: fitted | 0.923 | 0.789 | 0.856 | 0.312 (0.250 / 0.333) |
| heldout_formulations | members | comparison: pooled midpoint | 0.273 | 1.000 | 0.636 |  |
| heldout_formulations | targets | product: fitted | 0.833 | 0.786 | 0.810 | 0.111 (0.000 / 0.133) |
| heldout_formulations | targets | comparison: pooled midpoint | 0.667 | 0.750 | 0.708 |  |
| train (sample) | source | product: fitted | 0.884 | 0.972 | 0.928 | 0.051 (1.000 / 0.033) |
| train (sample) | target | product: fitted | 0.913 | 0.955 | 0.934 | 0.107 (0.875 / 0.042) |
| train (sample) | style | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | arrow | product: fitted | 0.981 | 1.000 | 0.991 | 0.019 (— / 0.019) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | members | product: fitted | 0.989 | 0.881 | 0.935 | 0.353 (0.182 / 0.394) |
| train (sample) | targets | product: fitted | 0.993 | 0.847 | 0.920 | 0.036 (0.150 / 0.020) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
