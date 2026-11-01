# REPORT — world `connect`, legend sha256:e1e5a4e83388… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
2696 annotated sentences from 2 files; provenance: {'llm': 2696}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_connect_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 126 sentences
- heldout_formulations: 129 sentences
- train: 2441 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
20902 tokens in the examples; 1491 with no kind in the lexicon (share 0.071), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 25499d8. Memory curve: runs/micro_connect_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.151 [rule: fit; pooled midpoint 0.312 (comparison)] (present 0.623, n 609 / absent 0.001, n 1502699)
- set_member:targets: threshold 0.140 [rule: fit; pooled midpoint 0.274 (comparison)] (present 0.546, n 185 / absent 0.001, n 1489973)
- presence:text: threshold 0.234 [rule: fit; pooled midpoint 4.529 (comparison)] (present 8.948, n 13 / absent 0.109, n 530)
- presence:source: threshold 0.551 [rule: fit; pooled midpoint 1.213 (comparison)] (present 2.072, n 275 / absent 0.354, n 251)
- presence:target: threshold 0.330 [rule: fit; pooled midpoint 1.171 (comparison)] (present 2.144, n 236 / absent 0.197, n 290)
- presence:style: threshold 0.368 [rule: fit; pooled midpoint 2.168 (comparison)] (present 4.270, n 70 / absent 0.065, n 456)
- presence:arrow: threshold 0.355 [rule: fit; pooled midpoint 0.693 (comparison)] (present 1.348, n 64 / absent 0.037, n 462)
- presence:edge: threshold 0.433 [rule: fit; pooled midpoint 0.625 (comparison)] (present 1.124, n 55 / absent 0.127, n 471)
- presence:pairing: threshold 0.264 [rule: fit; pooled midpoint 0.513 (comparison)] (present 0.950, n 109 / absent 0.076, n 417)
- presence:members: threshold 0.506 [rule: fit; pooled midpoint 0.702 (comparison)] (present 0.827, n 215 / absent 0.577, n 311)
- presence:targets: threshold 0.256 [rule: fit; pooled midpoint 0.499 (comparison)] (present 0.668, n 85 / absent 0.331, n 441)
- attr_presence:edge: threshold 0.522 [rule: fit; pooled midpoint 0.506 (comparison)] (present 0.915, n 11 / absent 0.098, n 53)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): text 0.071, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.050, pairing 0.333, members 0.000, targets 0.000, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 129 of 129)
| axis | accuracy |
|---|---|
| FULL | 0.481 |
| FULL [depth given] | 0.481 |
| FULL [depth and negation given] | 0.481 |
| FULL [presence not decided] | 0.116 |
| FULL [pooled midpoint (comparison)] | 0.093 |
| presence text: absent read absent | 1.000 |
| presence source: present read present | 0.889 |
| presence source: share of 'present' readings that abstain | 0.132 |
| presence source: share of true 'present' readings that abstain | 0.083 |
| presence target: present read present | 0.880 |
| presence target: share of 'present' readings that abstain | 0.133 |
| presence target: share of true 'present' readings that abstain | 0.114 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence members: absent read absent | 0.885 |
| presence targets: absent read absent | 0.851 |
| structure (depth, negation) | 0.868 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.736 |
| set targets: exact | 0.822 |
| predicate (surface lemma) | 0.868 |
| event type (synonym table) | 0.868 |
| role text | 0.992 |
| head text | 0.992 |
| lexical order head text | 0.992 |
| lexical bag head text | 0.992 |
| occupancy: not given | 0.970 |
| role source | 0.845 |
| head source | 0.845 |
| lexical order head source | 0.527 |
| lexical bag head source | 0.519 |
| occupancy: known filler | 0.764 |
| role target | 0.876 |
| head target | 0.876 |
| lexical order head target | 0.543 |
| lexical bag head target | 0.651 |
| role style | 0.938 |
| head style | 0.938 |
| lexical order head style | 0.837 |
| lexical bag head style | 0.907 |
| role arrow | 0.984 |
| head arrow | 0.984 |
| lexical order head arrow | 0.907 |
| lexical bag head arrow | 0.930 |
| role edge | 0.984 |
| head edge | 0.984 |
| lexical order head edge | 0.876 |
| lexical bag head edge | 0.953 |
| role pairing | 0.992 |
| head pairing | 0.992 |
| lexical order head pairing | 0.806 |
| lexical bag head pairing | 0.907 |
| role members | 0.698 |
| head members | 0.698 |
| lexical order head members | 0.550 |
| lexical bag head members | 0.457 |
| role targets | 0.822 |
| head targets | 0.822 |
| lexical order head targets | 0.845 |
| lexical bag head targets | 0.822 |
| heads FULL (model) | 0.481 |
| heads FULL (lexical order baseline) | 0.008 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.070 |
| role text [presence not decided] | 0.992 |
| role source [presence not decided] | 0.574 |
| role target [presence not decided] | 0.504 |
| role style [presence not decided] | 0.953 |
| role arrow [presence not decided] | 0.984 |
| role edge [presence not decided] | 0.907 |
| role pairing [presence not decided] | 0.992 |
| role members [presence not decided] | 0.434 |
| role targets [presence not decided] | 0.566 |
| heads FULL (model) [presence not decided] | 0.116 |
| role text [pooled midpoint (comparison)] | 0.992 |
| role source [pooled midpoint (comparison)] | 0.519 |
| role target [pooled midpoint (comparison)] | 0.543 |
| role style [pooled midpoint (comparison)] | 0.837 |
| role arrow [pooled midpoint (comparison)] | 0.961 |
| role edge [pooled midpoint (comparison)] | 0.953 |
| role pairing [pooled midpoint (comparison)] | 0.969 |
| role members [pooled midpoint (comparison)] | 0.581 |
| role targets [pooled midpoint (comparison)] | 0.899 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.093 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.019 |
| presence target: present read present [pooled midpoint (comparison)] | 0.000 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.900 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.978 |
| presence members: share of 'present' readings that abstain | 0.064 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence source: absent read absent | 0.914 |
| presence target: absent read absent | 0.984 |
| presence members: present read present | 0.784 |
| presence members: share of true 'present' readings that abstain | 0.075 |
| set members: first gold member in the decoded set | 0.672 |
| occupancy: unknown filler | 0.745 |
| presence targets: share of 'present' readings that abstain | 0.310 |
| presence targets: share of FALSE 'present' readings that abstain | 0.357 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.435 |
| presence targets: present read present | 0.833 |
| presence targets: share of true 'present' readings that abstain | 0.267 |
| set targets: first gold member in the decoded set | 0.700 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.529 |
| presence style: present read present | 0.722 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.071 |
| presence edge: share of true 'present' readings that abstain | 0.071 |
| presence style: present read present [pooled midpoint (comparison)] | 0.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 0.714 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present [pooled midpoint (comparison)] | 0.700 |
| presence source: share of FALSE 'present' readings that abstain | 0.600 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.913 |
| presence target: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.271; status {'ok': 92, 'abstain': 20, 'unknown-event': 15, 'no-sense': 2}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.868 | 0.525 / 0.277 | 0.98 | 0.116 | 0.000 / 0.016 |
| role source | 0.762 | 0.200 / 0.000 | 0.81 | 0.111 | 0.063 / 0.127 |
| roles (pooled) | 0.691 | 0.240 / 0.000 | 0.80 | 0.149 | 0.040 / 0.160 |
| role target | 0.746 | 0.265 / 0.000 | 0.76 | 0.102 | 0.085 / 0.153 |
| role members | 0.448 | 0.144 / 0.000 | 0.74 | 0.310 | 0.017 / 0.241 |
| role targets | 0.550 | 0.075 / 0.000 | 0.60 | 0.050 | 0.000 / 0.400 |
| role style | 0.619 | 0.282 / 0.000 | 0.76 | 0.143 | 0.000 / 0.238 |
| role edge | 0.875 | 0.360 / 0.144 | 0.94 | 0.125 | 0.062 / 0.000 |
| role arrow | 0.833 | 0.396 / 0.226 | 1.00 | 0.167 | 0.000 / 0.000 |
| role pairing | 0.960 | 0.455 / 0.281 | 1.00 | 0.040 | 0.000 / 0.000 |
| role text | 0.000 | 0.207 / 0.207 | 1.00 | 1.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 2441)
| axis | accuracy |
|---|---|
| FULL | 0.573 |
| FULL [depth given] | 0.573 |
| FULL [depth and negation given] | 0.573 |
| presence text: absent read absent | 1.000 |
| presence source: present read present | 0.912 |
| presence source: share of 'present' readings that abstain | 0.070 |
| presence source: share of true 'present' readings that abstain | 0.073 |
| presence target: present read present | 0.972 |
| presence target: share of 'present' readings that abstain | 0.109 |
| presence target: share of true 'present' readings that abstain | 0.067 |
| presence style: present read present | 0.931 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence pairing: absent read absent | 0.990 |
| presence members: absent read absent | 0.887 |
| presence targets: absent read absent | 0.849 |
| structure (depth, negation) | 0.893 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.837 |
| set targets: exact | 0.877 |
| predicate (surface lemma) | 0.893 |
| event type (synonym table) | 0.893 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 1.000 |
| lexical bag head text | 1.000 |
| occupancy: not given | 0.970 |
| role source | 0.853 |
| head source | 0.853 |
| lexical order head source | 0.580 |
| lexical bag head source | 0.810 |
| occupancy: known filler | 0.813 |
| role target | 0.883 |
| head target | 0.883 |
| lexical order head target | 0.557 |
| lexical bag head target | 0.897 |
| role style | 0.970 |
| head style | 0.970 |
| lexical order head style | 0.880 |
| lexical bag head style | 0.983 |
| role arrow | 0.990 |
| head arrow | 0.990 |
| lexical order head arrow | 0.890 |
| lexical bag head arrow | 0.963 |
| role edge | 0.987 |
| head edge | 0.987 |
| lexical order head edge | 0.907 |
| lexical bag head edge | 0.993 |
| role pairing | 0.990 |
| head pairing | 0.990 |
| lexical order head pairing | 0.793 |
| lexical bag head pairing | 0.970 |
| role members | 0.827 |
| head members | 0.827 |
| lexical order head members | 0.593 |
| lexical bag head members | 0.473 |
| role targets | 0.867 |
| head targets | 0.867 |
| lexical order head targets | 0.833 |
| lexical bag head targets | 0.807 |
| heads FULL (model) | 0.573 |
| heads FULL (lexical order baseline) | 0.010 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.320 |
| presence source: absent read absent | 0.962 |
| presence target: absent read absent | 0.963 |
| presence style: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence members: present read present | 0.966 |
| presence members: share of 'present' readings that abstain | 0.077 |
| presence members: share of true 'present' readings that abstain | 0.088 |
| presence targets: share of 'present' readings that abstain | 0.244 |
| presence targets: share of FALSE 'present' readings that abstain | 0.364 |
| set members: first gold member in the decoded set | 0.910 |
| occupancy: unknown filler | 0.942 |
| presence source: share of FALSE 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.833 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.016 |
| presence pairing: share of true 'present' readings that abstain | 0.016 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |
| presence arrow: present read present | 0.968 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence targets: present read present | 0.980 |
| presence targets: share of true 'present' readings that abstain | 0.163 |
| set targets: first gold member in the decoded set | 0.960 |
| presence pairing: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.244; status {'ok': 226, 'abstain': 42, 'no-sense': 1, 'unknown-event': 31}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.893 | 0.518 / 0.311 | 0.97 | 0.073 | 0.000 / 0.033 |
| role source | 0.761 | 0.251 / 0.001 | 0.84 | 0.135 | 0.055 / 0.104 |
| roles (pooled) | 0.797 | 0.287 / 0.037 | 0.89 | 0.137 | 0.043 / 0.065 |
| role target | 0.782 | 0.346 / 0.034 | 0.89 | 0.158 | 0.053 / 0.060 |
| role style | 0.750 | 0.386 / 0.254 | 0.94 | 0.194 | 0.000 / 0.056 |
| role edge | 0.857 | 0.405 / 0.203 | 1.00 | 0.143 | 0.000 / 0.000 |
| role members | 0.713 | 0.178 / 0.030 | 0.89 | 0.213 | 0.041 / 0.074 |
| role pairing | 0.984 | 0.449 / 0.295 | 0.98 | 0.016 | 0.016 / 0.000 |
| role arrow | 0.909 | 0.395 / 0.237 | 0.97 | 0.061 | 0.000 / 0.030 |
| role targets | 0.860 | 0.108 / 0.020 | 0.82 | 0.060 | 0.100 / 0.080 |

## Gates (seed 0; OPEN > 0.5)
to=1.00 and=0.99 c27_them=0.95 TEXT=0.94 VERB=0.87 c2_now=0.85 c3_rules=0.84 c16_new=0.82 c15_on=0.81 c14_uh=0.75 PAIR=0.74 RECENT=0.71 c1_have=0.71 c24_line=0.69 are=0.65 c11_what=0.65 LAYOUT=0.65 SHAPE=0.60 c19_goes=0.56 COLOR=0.56 c17_be=0.55 c18_does=0.44 directly=0.27 c10_three=0.26 c20_arrow=0.24 c12_that=0.18 labeled=0.16 POS=0.15 it=0.14 AXIS=0.12 NOTCOLOR=0.12 SIZE=0.12 SUPER=0.12 c21_arrowheads=0.12 c25_pixels=0.12 c26_shape=0.12 called=0.12 lines=0.12 named=0.12 c9_an=0.11 c8_what's=0.09 ARROW=0.04 c6_both=0.03 c5_me=0.01 c7_i=0.01 c13_one=0.01 with=0.01 of=0.00 QUANT=0.00 DIR=0.00 c22_from=0.00 c23_in=0.00 STYLE=0.00 c4_then=0.00 NAME=0.00 a=0.00 the=0.00 unknown=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.481
- heldout_formulations: presence source: present read present 0.889
- heldout_formulations: presence source: share of 'present' readings that abstain 0.132
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.083
- heldout_formulations: presence target: present read present 0.880
- heldout_formulations: presence target: share of 'present' readings that abstain 0.133
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.114
- heldout_formulations: presence members: absent read absent 0.885
- heldout_formulations: presence targets: absent read absent 0.851
- heldout_formulations: structure (depth, negation) 0.868
- heldout_formulations: set members: exact 0.736
- heldout_formulations: set targets: exact 0.822
- heldout_formulations: predicate (surface lemma) 0.868
- heldout_formulations: event type (synonym table) 0.868
- heldout_formulations: role source 0.845
- heldout_formulations: head source 0.845
- heldout_formulations: occupancy: known filler 0.764
- heldout_formulations: role target 0.876
- heldout_formulations: head target 0.876
- heldout_formulations: role members 0.698
- heldout_formulations: head members 0.698
- heldout_formulations: role targets 0.822
- heldout_formulations: head targets 0.822
- heldout_formulations: heads FULL (model) 0.481
- heldout_formulations: heads FULL (lexical order baseline) 0.008
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.070
- heldout_formulations: FULL [depth given] 0.481
- heldout_formulations: FULL [depth and negation given] 0.481
- heldout_formulations: FULL [presence not decided] 0.116
- heldout_formulations: role source [presence not decided] 0.574
- heldout_formulations: role target [presence not decided] 0.504
- heldout_formulations: role members [presence not decided] 0.434
- heldout_formulations: role targets [presence not decided] 0.566
- heldout_formulations: heads FULL (model) [presence not decided] 0.116
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.093
- heldout_formulations: role source [pooled midpoint (comparison)] 0.519
- heldout_formulations: role target [pooled midpoint (comparison)] 0.543
- heldout_formulations: role style [pooled midpoint (comparison)] 0.837
- heldout_formulations: role members [pooled midpoint (comparison)] 0.581
- heldout_formulations: role targets [pooled midpoint (comparison)] 0.899
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.093
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.019
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.064
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present 0.784
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.075
- heldout_formulations: set members: first gold member in the decoded set 0.672
- heldout_formulations: occupancy: unknown filler 0.745
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.310
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.357
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.435
- heldout_formulations: presence targets: present read present 0.833
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.267
- heldout_formulations: set targets: first gold member in the decoded set 0.700
- heldout_formulations: presence targets: present read present [pooled midpoint (comparison)] 0.529
- heldout_formulations: presence style: present read present 0.722
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.071
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.071
- heldout_formulations: presence style: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence edge: present read present [pooled midpoint (comparison)] 0.714
- heldout_formulations: presence arrow: share of 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: present read present [pooled midpoint (comparison)] 0.700
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.600
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- train (sample): FULL 0.573
- train (sample): presence source: share of 'present' readings that abstain 0.070
- train (sample): presence source: share of true 'present' readings that abstain 0.073
- train (sample): presence target: share of 'present' readings that abstain 0.109
- train (sample): presence target: share of true 'present' readings that abstain 0.067
- train (sample): presence style: share of 'present' readings that abstain 0.000
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence members: absent read absent 0.887
- train (sample): presence targets: absent read absent 0.849
- train (sample): structure (depth, negation) 0.893
- train (sample): set members: exact 0.837
- train (sample): set targets: exact 0.877
- train (sample): predicate (surface lemma) 0.893
- train (sample): event type (synonym table) 0.893
- train (sample): role source 0.853
- train (sample): head source 0.853
- train (sample): occupancy: known filler 0.813
- train (sample): role target 0.883
- train (sample): head target 0.883
- train (sample): role members 0.827
- train (sample): head members 0.827
- train (sample): role targets 0.867
- train (sample): head targets 0.867
- train (sample): heads FULL (model) 0.573
- train (sample): heads FULL (lexical order baseline) 0.010
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.320
- train (sample): FULL [depth given] 0.573
- train (sample): FULL [depth and negation given] 0.573
- train (sample): presence members: share of 'present' readings that abstain 0.077
- train (sample): presence members: share of true 'present' readings that abstain 0.088
- train (sample): presence targets: share of 'present' readings that abstain 0.244
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.364
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.833
- train (sample): presence pairing: share of 'present' readings that abstain 0.016
- train (sample): presence pairing: share of true 'present' readings that abstain 0.016
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence arrow: share of 'present' readings that abstain 0.000
- train (sample): presence arrow: share of true 'present' readings that abstain 0.000
- train (sample): presence targets: share of true 'present' readings that abstain 0.163
- train (sample): presence pairing: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `connect NAME to NAME and NAME to NAME` FULL 0.000 (n 12)
- heldout_formulations: `NAME connect NAME` FULL 0.000 (n 3)
- heldout_formulations: `connect NAME to NAME PAIR NAME to NAME` FULL 0.000 (n 2)
- heldout_formulations: `NAME and NAME go into the NAME` FULL 0.000 (n 1)
- heldout_formulations: `NAME and NAME go onto NAME` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role text | role source | role target | role style | role arrow | role edge | role pairing | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.481 | 0.481 | 0.992 | 0.845 | 0.876 | 0.938 | 0.984 | 0.984 | 0.992 | 0.698 | 0.822 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.093 | 0.093 | 0.992 | 0.519 | 0.543 | 0.837 | 0.961 | 0.953 | 0.969 | 0.581 | 0.899 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.116 | 0.116 | 0.992 | 0.574 | 0.504 | 0.953 | 0.984 | 0.907 | 0.992 | 0.434 | 0.566 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | source | product: fitted | 0.889 | 0.914 | 0.901 | 0.132 (0.600 / 0.083) |
| heldout_formulations | source | comparison: pooled midpoint | 0.019 | 1.000 | 0.509 |  |
| heldout_formulations | target | product: fitted | 0.880 | 0.984 | 0.932 | 0.133 (1.000 / 0.114) |
| heldout_formulations | target | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | style | product: fitted | 0.722 | 1.000 | 0.861 | 0.000 (— / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | arrow | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | arrow | comparison: pooled midpoint | 0.700 | 1.000 | 0.850 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.071 (— / 0.071) |
| heldout_formulations | edge | comparison: pooled midpoint | 0.714 | 1.000 | 0.857 |  |
| heldout_formulations | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.913 | 1.000 | 0.957 |  |
| heldout_formulations | members | product: fitted | 0.784 | 0.885 | 0.835 | 0.064 (0.000 / 0.075) |
| heldout_formulations | members | comparison: pooled midpoint | 0.435 | 0.900 | 0.667 |  |
| heldout_formulations | targets | product: fitted | 0.833 | 0.851 | 0.842 | 0.310 (0.357 / 0.267) |
| heldout_formulations | targets | comparison: pooled midpoint | 0.529 | 0.978 | 0.753 |  |
| train (sample) | source | product: fitted | 0.912 | 0.962 | 0.937 | 0.070 (0.000 / 0.073) |
| train (sample) | target | product: fitted | 0.972 | 0.963 | 0.967 | 0.109 (0.833 / 0.067) |
| train (sample) | style | product: fitted | 0.931 | 1.000 | 0.966 | 0.000 (— / 0.000) |
| train (sample) | arrow | product: fitted | 0.968 | 1.000 | 0.984 | 0.000 (— / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 1.000 | 0.990 | 0.995 | 0.016 (0.000 / 0.016) |
| train (sample) | members | product: fitted | 0.966 | 0.887 | 0.927 | 0.077 (0.000 / 0.088) |
| train (sample) | targets | product: fitted | 0.980 | 0.849 | 0.914 | 0.244 (0.364 / 0.163) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
