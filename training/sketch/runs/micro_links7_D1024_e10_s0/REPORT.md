# REPORT — world `links7`, legend sha256:8bb358f5f130… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
3596 annotated sentences from 2 files; provenance: {'llm': 3596}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_links7_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 163 sentences
- heldout_formulations: 177 sentences
- train: 3256 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
29253 tokens in the examples; 2261 with no kind in the lexicon (share 0.077), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit cdb8201. Memory curve: runs/micro_links7_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.104 [rule: fit; pooled midpoint 0.267 (comparison)] (present 0.534, n 607 / absent 0.001, n 1781212)
- set_member:targets: threshold 0.077 [rule: fit; pooled midpoint 0.246 (comparison)] (present 0.492, n 165 / absent 0.001, n 1773126)
- presence:text: threshold 0.499 [rule: fit; pooled midpoint 0.467 (comparison)] (present 0.777, n 19 / absent 0.157, n 572)
- presence:source: threshold 0.593 [rule: fit; pooled midpoint 0.728 (comparison)] (present 1.052, n 316 / absent 0.403, n 247)
- attr_presence:source: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 337)
- presence:target: threshold 0.335 [rule: fit; pooled midpoint 0.634 (comparison)] (present 1.051, n 277 / absent 0.218, n 286)
- det_presence:target: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 295)
- presence:style: threshold 0.281 [rule: fit; pooled midpoint 0.435 (comparison)] (present 0.805, n 72 / absent 0.065, n 491)
- presence:arrow: threshold 0.306 [rule: fit; pooled midpoint 0.461 (comparison)] (present 0.880, n 103 / absent 0.042, n 460)
- presence:edge: threshold 0.141 [rule: fit; pooled midpoint 0.314 (comparison)] (present 0.549, n 15 / absent 0.079, n 548)
- presence:pairing: threshold 0.315 [rule: fit; pooled midpoint 0.475 (comparison)] (present 0.902, n 102 / absent 0.049, n 461)
- presence:members: threshold 0.405 [rule: fit; pooled midpoint 0.536 (comparison)] (present 0.748, n 214 / absent 0.324, n 349)
- presence:targets: threshold 0.303 [rule: fit; pooled midpoint 0.409 (comparison)] (present 0.608, n 79 / absent 0.210, n 484)
- attr_presence:edge: threshold 0.754 [rule: fit; pooled midpoint 0.601 (comparison)] (present 0.980, n 11 / absent 0.222, n 16)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): text 0.000, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.053, pairing 0.333, members 0.000, targets 0.000, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 177)
| axis | accuracy |
|---|---|
| FULL | 0.520 |
| FULL [pooled midpoint (comparison)] | 0.367 |
| presence text: absent read absent | 1.000 |
| presence source: present read present | 0.759 |
| presence source: share of 'present' readings that abstain | 0.108 |
| presence source: share of true 'present' readings that abstain | 0.067 |
| presence target: present read present | 0.847 |
| presence target: share of 'present' readings that abstain | 0.065 |
| presence target: share of true 'present' readings that abstain | 0.066 |
| presence style: absent read absent | 0.974 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 0.948 |
| presence pairing: absent read absent | 1.000 |
| presence members: absent read absent | 0.882 |
| presence targets: absent read absent | 0.911 |
| structure (depth, negation) | 0.953 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.793 |
| set targets: exact | 0.867 |
| predicate (surface lemma) | 0.953 |
| event type (synonym table) | 0.953 |
| role text | 0.987 |
| head text | 0.987 |
| lexical order head text | 0.987 |
| lexical bag head text | 0.987 |
| occupancy: not given | 0.963 |
| role source | 0.813 |
| head source | 0.813 |
| lexical order head source | 0.573 |
| lexical bag head source | 0.580 |
| occupancy: known filler | 0.833 |
| role target | 0.907 |
| head target | 0.907 |
| lexical order head target | 0.507 |
| lexical bag head target | 0.527 |
| role style | 0.947 |
| head style | 0.947 |
| lexical order head style | 0.793 |
| lexical bag head style | 0.893 |
| role arrow | 0.993 |
| head arrow | 0.993 |
| lexical order head arrow | 0.820 |
| lexical bag head arrow | 0.907 |
| role edge | 0.947 |
| head edge | 0.953 |
| lexical order head edge | 0.940 |
| lexical bag head edge | 0.940 |
| role pairing | 0.987 |
| head pairing | 0.987 |
| lexical order head pairing | 0.787 |
| lexical bag head pairing | 0.867 |
| role members | 0.767 |
| head members | 0.767 |
| lexical order head members | 0.600 |
| lexical bag head members | 0.533 |
| role targets | 0.867 |
| head targets | 0.867 |
| lexical order head targets | 0.867 |
| lexical bag head targets | 0.860 |
| heads FULL (model) | 0.520 |
| heads FULL (lexical order baseline) | 0.020 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.080 |
| role text [pooled midpoint (comparison)] | 0.993 |
| role source [pooled midpoint (comparison)] | 0.733 |
| role target [pooled midpoint (comparison)] | 0.787 |
| role style [pooled midpoint (comparison)] | 0.947 |
| role arrow [pooled midpoint (comparison)] | 0.987 |
| role edge [pooled midpoint (comparison)] | 0.980 |
| role pairing [pooled midpoint (comparison)] | 0.933 |
| role members [pooled midpoint (comparison)] | 0.667 |
| role targets [pooled midpoint (comparison)] | 0.880 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.367 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.571 |
| presence target: present read present [pooled midpoint (comparison)] | 0.609 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 0.984 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.928 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.947 |
| presence members: share of 'present' readings that abstain | 0.161 |
| presence members: share of FALSE 'present' readings that abstain | 0.100 |
| presence source: absent read absent | 0.922 |
| presence target: absent read absent | 0.986 |
| presence members: present read present | 0.897 |
| presence members: share of true 'present' readings that abstain | 0.173 |
| set members: first gold member in the decoded set | 0.867 |
| occupancy: unknown filler | 0.795 |
| presence source: absent read absent [pooled midpoint (comparison)] | 0.982 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.820 |
| presence targets: share of 'present' readings that abstain | 0.625 |
| presence targets: share of FALSE 'present' readings that abstain | 0.727 |
| presence targets: present read present | 0.684 |
| presence targets: share of true 'present' readings that abstain | 0.538 |
| set targets: first gold member in the decoded set | 0.650 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.474 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.917 |
| presence style: present read present | 0.897 |
| presence style: share of 'present' readings that abstain | 0.034 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present | 0.963 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 0.793 |
| presence arrow: present read present [pooled midpoint (comparison)] | 0.926 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.125 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: share of FALSE 'present' readings that abstain | 0.286 |
| presence source: share of FALSE 'present' readings that abstain | 0.600 |
| presence style: share of FALSE 'present' readings that abstain | 0.333 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| presence text: present read present | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 0.500 |

residual mean 0.231; status {'ok': 107, 'abstain': 36, 'unknown-event': 5, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.953 | 0.552 / 0.410 | 0.99 | 0.040 | 0.000 / 0.007 |
| role source | 0.723 | 0.176 / 0.000 | 0.71 | 0.036 | 0.048 / 0.241 |
| roles (pooled) | 0.760 | 0.236 / 0.000 | 0.77 | 0.065 | 0.053 / 0.175 |
| role target | 0.824 | 0.278 / 0.000 | 0.80 | 0.027 | 0.054 / 0.149 |
| role members | 0.583 | 0.146 / 0.000 | 0.72 | 0.217 | 0.083 / 0.200 |
| role targets | 0.550 | 0.035 / 0.000 | 0.30 | 0.000 | 0.250 / 0.450 |
| role pairing | 0.938 | 0.380 / 0.124 | 1.00 | 0.062 | 0.000 / 0.000 |
| role style | 0.839 | 0.325 / 0.000 | 0.87 | 0.032 | 0.000 / 0.129 |
| role arrow | 0.963 | 0.396 / 0.240 | 0.96 | 0.000 | 0.000 / 0.037 |
| role edge | 0.889 | 0.235 / 0.177 | 1.00 | 0.111 | 0.000 / 0.000 |
| role text | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

### train (sample) — catalog candidates (n = 150 of 3256)
| axis | accuracy |
|---|---|
| FULL | 0.640 |
| presence text: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: present read present | 0.913 |
| presence target: share of 'present' readings that abstain | 0.046 |
| presence target: share of true 'present' readings that abstain | 0.032 |
| presence style: absent read absent | 0.982 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 0.992 |
| presence members: present read present | 0.981 |
| presence members: share of 'present' readings that abstain | 0.082 |
| presence members: share of true 'present' readings that abstain | 0.075 |
| presence targets: absent read absent | 0.916 |
| structure (depth, negation) | 0.953 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.833 |
| set members: first gold member in the decoded set | 0.946 |
| set targets: exact | 0.893 |
| predicate (surface lemma) | 0.947 |
| event type (synonym table) | 0.947 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 1.000 |
| lexical bag head text | 1.000 |
| occupancy: not given | 0.977 |
| role source | 0.913 |
| head source | 0.913 |
| lexical order head source | 0.620 |
| lexical bag head source | 0.820 |
| role target | 0.920 |
| head target | 0.920 |
| lexical order head target | 0.513 |
| lexical bag head target | 0.893 |
| occupancy: known filler | 0.896 |
| role style | 0.980 |
| head style | 0.980 |
| lexical order head style | 0.787 |
| lexical bag head style | 0.967 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 0.780 |
| lexical bag head arrow | 0.973 |
| role edge | 0.993 |
| head edge | 0.993 |
| lexical order head edge | 0.953 |
| lexical bag head edge | 0.980 |
| role pairing | 0.980 |
| head pairing | 0.980 |
| lexical order head pairing | 0.833 |
| lexical bag head pairing | 0.973 |
| role members | 0.800 |
| head members | 0.800 |
| lexical order head members | 0.627 |
| lexical bag head members | 0.507 |
| occupancy: unknown filler | 0.950 |
| role targets | 0.887 |
| head targets | 0.887 |
| lexical order head targets | 0.840 |
| lexical bag head targets | 0.827 |
| heads FULL (model) | 0.640 |
| heads FULL (lexical order baseline) | 0.020 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.353 |
| presence target: absent read absent | 0.973 |
| presence targets: share of 'present' readings that abstain | 0.455 |
| presence targets: share of FALSE 'present' readings that abstain | 0.800 |
| presence source: present read present | 0.895 |
| presence source: share of 'present' readings that abstain | 0.078 |
| presence source: share of true 'present' readings that abstain | 0.078 |
| presence members: absent read absent | 0.910 |
| presence targets: present read present | 0.958 |
| presence targets: share of true 'present' readings that abstain | 0.304 |
| set targets: first gold member in the decoded set | 0.958 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.030 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence members: share of FALSE 'present' readings that abstain | 0.125 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.500 |
| presence target: share of FALSE 'present' readings that abstain | 0.500 |
| presence pairing: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.169; status {'ok': 120, 'abstain': 23, 'unknown-event': 7}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.947 | 0.547 / 0.459 | 1.00 | 0.053 | 0.000 / 0.000 |
| role target | 0.863 | 0.349 / 0.044 | 0.89 | 0.055 | 0.027 / 0.082 |
| roles (pooled) | 0.835 | 0.290 / 0.044 | 0.89 | 0.106 | 0.047 / 0.059 |
| role members | 0.607 | 0.216 / 0.060 | 0.91 | 0.375 | 0.071 / 0.018 |
| role source | 0.856 | 0.214 / 0.007 | 0.83 | 0.044 | 0.067 / 0.100 |
| role targets | 0.708 | 0.078 / 0.017 | 0.67 | 0.125 | 0.167 / 0.167 |
| role style | 0.969 | 0.388 / 0.318 | 1.00 | 0.031 | 0.000 / 0.000 |
| role edge | 0.857 | 0.313 / 0.232 | 1.00 | 0.143 | 0.000 / 0.000 |
| role pairing | 0.920 | 0.446 / 0.320 | 1.00 | 0.080 | 0.000 / 0.000 |
| role arrow | 1.000 | 0.425 / 0.258 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
to=1.00 and=1.00 TEXT=0.99 c27_them=0.98 POS=0.96 c14_uh=0.95 are=0.90 LAYOUT=0.85 NUM=0.82 c8_what's=0.82 c22_from=0.82 c18_does=0.76 c19_goes=0.75 VERB=0.73 c1_have=0.70 PAIR=0.67 c16_new=0.66 c11_what=0.60 c17_be=0.57 COLOR=0.56 labeled=0.52 RECENT=0.48 c5_me=0.47 c2_now=0.46 SHAPE=0.46 c3_rules=0.46 with=0.45 c12_that=0.43 c15_on=0.35 c6_both=0.26 c13_one=0.23 directly=0.19 c10_three=0.12 AXIS=0.12 NOTCOLOR=0.12 SIZE=0.12 SUPER=0.12 c21_arrowheads=0.12 c23_in=0.12 c24_line=0.12 c25_pixels=0.12 c26_shape=0.12 called=0.12 lines=0.12 named=0.12 it=0.01 STYLE=0.01 c7_i=0.01 of=0.01 QUANT=0.00 ARROW=0.00 DIR=0.00 c9_an=0.00 c4_then=0.00 c20_arrow=0.00 NAME=0.00 a=0.00 unknown=0.00 the=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.520
- heldout_formulations: presence source: present read present 0.759
- heldout_formulations: presence source: share of 'present' readings that abstain 0.108
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.067
- heldout_formulations: presence target: present read present 0.847
- heldout_formulations: presence target: share of 'present' readings that abstain 0.065
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.066
- heldout_formulations: presence members: absent read absent 0.882
- heldout_formulations: set members: exact 0.793
- heldout_formulations: set targets: exact 0.867
- heldout_formulations: role source 0.813
- heldout_formulations: head source 0.813
- heldout_formulations: occupancy: known filler 0.833
- heldout_formulations: role members 0.767
- heldout_formulations: head members 0.767
- heldout_formulations: role targets 0.867
- heldout_formulations: head targets 0.867
- heldout_formulations: heads FULL (model) 0.520
- heldout_formulations: heads FULL (lexical order baseline) 0.020
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.080
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.367
- heldout_formulations: role source [pooled midpoint (comparison)] 0.733
- heldout_formulations: role target [pooled midpoint (comparison)] 0.787
- heldout_formulations: role members [pooled midpoint (comparison)] 0.667
- heldout_formulations: role targets [pooled midpoint (comparison)] 0.880
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.367
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.571
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.609
- heldout_formulations: presence members: share of 'present' readings that abstain 0.161
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.100
- heldout_formulations: presence members: present read present 0.897
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.173
- heldout_formulations: set members: first gold member in the decoded set 0.867
- heldout_formulations: occupancy: unknown filler 0.795
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.820
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.625
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.727
- heldout_formulations: presence targets: present read present 0.684
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.538
- heldout_formulations: set targets: first gold member in the decoded set 0.650
- heldout_formulations: presence targets: present read present [pooled midpoint (comparison)] 0.474
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: present read present 0.897
- heldout_formulations: presence style: share of 'present' readings that abstain 0.034
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: share of 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: present read present [pooled midpoint (comparison)] 0.793
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.125
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of FALSE 'present' readings that abstain 0.286
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.600
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.333
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence text: present read present 0.000
- heldout_formulations: presence text: present read present [pooled midpoint (comparison)] 0.500
- train (sample): FULL 0.640
- train (sample): presence target: share of 'present' readings that abstain 0.046
- train (sample): presence target: share of true 'present' readings that abstain 0.032
- train (sample): presence members: share of 'present' readings that abstain 0.082
- train (sample): presence members: share of true 'present' readings that abstain 0.075
- train (sample): set members: exact 0.833
- train (sample): set targets: exact 0.893
- train (sample): occupancy: known filler 0.896
- train (sample): role members 0.800
- train (sample): head members 0.800
- train (sample): role targets 0.887
- train (sample): head targets 0.887
- train (sample): heads FULL (model) 0.640
- train (sample): heads FULL (lexical order baseline) 0.020
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.353
- train (sample): presence targets: share of 'present' readings that abstain 0.455
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.800
- train (sample): presence source: present read present 0.895
- train (sample): presence source: share of 'present' readings that abstain 0.078
- train (sample): presence source: share of true 'present' readings that abstain 0.078
- train (sample): presence targets: share of true 'present' readings that abstain 0.304
- train (sample): presence style: share of 'present' readings that abstain 0.030
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.125
- train (sample): presence pairing: share of 'present' readings that abstain 0.000
- train (sample): presence pairing: share of true 'present' readings that abstain 0.000
- train (sample): presence arrow: share of 'present' readings that abstain 0.000
- train (sample): presence arrow: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence pairing: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `connect NAME to NAME and NAME to NAME` FULL 0.000 (n 10)
- heldout_formulations: `NAME connect NAME` FULL 0.000 (n 3)
- heldout_formulations: `connect NAME to NAME with a solid arrow` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME PAIR NAME to NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect the NAME to the NAME and the NAME to the NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role text | role source | role target | role style | role arrow | role edge | role pairing | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.520 | 0.520 | 0.987 | 0.813 | 0.907 | 0.947 | 0.993 | 0.947 | 0.987 | 0.767 | 0.867 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.367 | 0.367 | 0.993 | 0.733 | 0.787 | 0.947 | 0.987 | 0.980 | 0.933 | 0.667 | 0.880 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | text | product: fitted | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | text | comparison: pooled midpoint | 0.500 | 1.000 | 0.750 |  |
| heldout_formulations | source | product: fitted | 0.759 | 0.922 | 0.841 | 0.108 (0.600 / 0.067) |
| heldout_formulations | source | comparison: pooled midpoint | 0.571 | 0.982 | 0.777 |  |
| heldout_formulations | target | product: fitted | 0.847 | 0.986 | 0.917 | 0.065 (0.000 / 0.066) |
| heldout_formulations | target | comparison: pooled midpoint | 0.609 | 1.000 | 0.804 |  |
| heldout_formulations | style | product: fitted | 0.897 | 0.974 | 0.935 | 0.034 (0.333 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 0.793 | 1.000 | 0.897 |  |
| heldout_formulations | arrow | product: fitted | 0.963 | 1.000 | 0.981 | 0.000 (— / 0.000) |
| heldout_formulations | arrow | comparison: pooled midpoint | 0.926 | 1.000 | 0.963 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 0.948 | 0.974 | 0.125 (0.286 / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 0.984 | 0.992 |  |
| heldout_formulations | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.917 | 1.000 | 0.958 |  |
| heldout_formulations | members | product: fitted | 0.897 | 0.882 | 0.889 | 0.161 (0.100 / 0.173) |
| heldout_formulations | members | comparison: pooled midpoint | 0.820 | 0.928 | 0.874 |  |
| heldout_formulations | targets | product: fitted | 0.684 | 0.911 | 0.798 | 0.625 (0.727 / 0.538) |
| heldout_formulations | targets | comparison: pooled midpoint | 0.474 | 0.947 | 0.711 |  |
| train (sample) | text | product: fitted | — | 1.000 | — |  |
| train (sample) | source | product: fitted | 0.895 | 1.000 | 0.948 | 0.078 (— / 0.078) |
| train (sample) | target | product: fitted | 0.913 | 0.973 | 0.943 | 0.046 (0.500 / 0.032) |
| train (sample) | style | product: fitted | 1.000 | 0.982 | 0.991 | 0.030 (0.500 / 0.000) |
| train (sample) | arrow | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 1.000 | 0.992 | 0.996 | 0.000 (0.000 / 0.000) |
| train (sample) | members | product: fitted | 0.981 | 0.910 | 0.946 | 0.082 (0.125 / 0.075) |
| train (sample) | targets | product: fitted | 0.958 | 0.916 | 0.937 | 0.455 (0.800 / 0.304) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
