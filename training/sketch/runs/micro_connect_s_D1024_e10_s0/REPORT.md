# REPORT — world `connect_s`, legend sha256:e1e5a4e83388… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
3427 annotated sentences from 2 files; provenance: {'llm': 3427}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_connect_s_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 160 sentences
- heldout_formulations: 168 sentences
- train: 3099 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
28232 tokens in the examples; 2255 with no kind in the lexicon (share 0.080), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 8ae4c3e. Memory curve: runs/micro_connect_s_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.146 [rule: fit; pooled midpoint 0.294 (comparison)] (present 0.587, n 588 / absent 0.000, n 1858052)
- set_member:targets: threshold 0.096 [rule: fit; pooled midpoint 0.234 (comparison)] (present 0.468, n 193 / absent -0.000, n 1849487)
- presence:text: threshold 0.294 [rule: fit; pooled midpoint 5.687 (comparison)] (present 11.029, n 20 / absent 0.345, n 573)
- presence:source: threshold 0.604 [rule: fit; pooled midpoint 1.936 (comparison)] (present 3.489, n 317 / absent 0.383, n 243)
- attr_presence:source: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 2, absent 342)
- presence:target: threshold 0.398 [rule: fit; pooled midpoint 1.909 (comparison)] (present 3.597, n 263 / absent 0.220, n 297)
- det_presence:target: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 287)
- presence:style: threshold 0.289 [rule: fit; pooled midpoint 0.783 (comparison)] (present 1.442, n 89 / absent 0.124, n 471)
- presence:arrow: threshold 0.430 [rule: fit; pooled midpoint 0.581 (comparison)] (present 1.077, n 107 / absent 0.085, n 453)
- presence:edge: threshold 0.427 [rule: fit; pooled midpoint 0.444 (comparison)] (present 0.719, n 12 / absent 0.169, n 548)
- presence:pairing: threshold 0.313 [rule: fit; pooled midpoint 0.524 (comparison)] (present 0.917, n 103 / absent 0.130, n 457)
- presence:members: threshold 0.486 [rule: fit; pooled midpoint 1.061 (comparison)] (present 0.793, n 204 / absent 1.329, n 356)
- presence:targets: threshold 0.276 [rule: fit; pooled midpoint 0.498 (comparison)] (present 0.558, n 89 / absent 0.438, n 471)
- attr_presence:edge: threshold 0.547 [rule: fit; pooled midpoint 0.570 (comparison)] (present 0.951, n 11 / absent 0.189, n 14)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): text 0.000, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.053, pairing 0.333, members 0.000, targets 0.000, predicate 1.000

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 168 of 168)
| axis | accuracy |
|---|---|
| FULL | 0.476 |
| FULL [depth given] | 0.476 |
| FULL [depth and negation given] | 0.476 |
| FULL [presence not decided] | 0.143 |
| FULL [pooled midpoint (comparison)] | 0.030 |
| presence text: absent read absent | 1.000 |
| presence source: present read present | 0.831 |
| presence source: share of 'present' readings that abstain | 0.085 |
| presence source: share of true 'present' readings that abstain | 0.031 |
| presence target: present read present | 0.853 |
| presence target: share of 'present' readings that abstain | 0.103 |
| presence target: share of true 'present' readings that abstain | 0.103 |
| presence style: absent read absent | 0.974 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence members: absent read absent | 0.880 |
| presence targets: absent read absent | 0.901 |
| structure (depth, negation) | 0.851 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.738 |
| set targets: exact | 0.869 |
| predicate (surface lemma) | 0.851 |
| event type (synonym table) | 0.851 |
| role text | 0.994 |
| head text | 0.994 |
| lexical order head text | 0.994 |
| lexical bag head text | 0.994 |
| occupancy: not given | 0.972 |
| role source | 0.798 |
| head source | 0.798 |
| lexical order head source | 0.565 |
| lexical bag head source | 0.560 |
| occupancy: known filler | 0.752 |
| role target | 0.857 |
| head target | 0.857 |
| lexical order head target | 0.512 |
| lexical bag head target | 0.595 |
| role style | 0.935 |
| head style | 0.935 |
| lexical order head style | 0.798 |
| lexical bag head style | 0.899 |
| role arrow | 0.982 |
| head arrow | 0.982 |
| lexical order head arrow | 0.827 |
| lexical bag head arrow | 0.917 |
| role edge | 0.976 |
| head edge | 0.982 |
| lexical order head edge | 0.946 |
| lexical bag head edge | 0.946 |
| role pairing | 0.988 |
| head pairing | 0.988 |
| lexical order head pairing | 0.833 |
| lexical bag head pairing | 0.899 |
| role members | 0.714 |
| head members | 0.714 |
| lexical order head members | 0.583 |
| lexical bag head members | 0.512 |
| role targets | 0.869 |
| head targets | 0.869 |
| lexical order head targets | 0.863 |
| lexical bag head targets | 0.851 |
| heads FULL (model) | 0.476 |
| heads FULL (lexical order baseline) | 0.018 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.077 |
| role text [presence not decided] | 0.583 |
| role source [presence not decided] | 0.577 |
| role target [presence not decided] | 0.494 |
| role style [presence not decided] | 0.940 |
| role arrow [presence not decided] | 0.952 |
| role edge [presence not decided] | 0.839 |
| role pairing [presence not decided] | 0.994 |
| role members [presence not decided] | 0.536 |
| role targets [presence not decided] | 0.601 |
| heads FULL (model) [presence not decided] | 0.143 |
| role text [pooled midpoint (comparison)] | 0.994 |
| role source [pooled midpoint (comparison)] | 0.458 |
| role target [pooled midpoint (comparison)] | 0.512 |
| role style [pooled midpoint (comparison)] | 0.899 |
| role arrow [pooled midpoint (comparison)] | 0.970 |
| role edge [pooled midpoint (comparison)] | 0.976 |
| role pairing [pooled midpoint (comparison)] | 0.940 |
| role members [pooled midpoint (comparison)] | 0.589 |
| role targets [pooled midpoint (comparison)] | 0.881 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.030 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.000 |
| presence target: present read present [pooled midpoint (comparison)] | 0.000 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.960 |
| presence members: share of 'present' readings that abstain | 0.237 |
| presence members: share of FALSE 'present' readings that abstain | 0.300 |
| presence source: absent read absent | 0.894 |
| presence target: absent read absent | 1.000 |
| presence members: present read present | 0.817 |
| presence members: share of true 'present' readings that abstain | 0.224 |
| set members: first gold member in the decoded set | 0.686 |
| occupancy: unknown filler | 0.716 |
| presence style: present read present | 0.929 |
| presence style: share of 'present' readings that abstain | 0.103 |
| presence style: share of true 'present' readings that abstain | 0.077 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.038 |
| presence arrow: share of true 'present' readings that abstain | 0.038 |
| presence style: present read present [pooled midpoint (comparison)] | 0.630 |
| presence arrow: present read present [pooled midpoint (comparison)] | 0.923 |
| presence targets: share of 'present' readings that abstain | 0.393 |
| presence targets: share of FALSE 'present' readings that abstain | 0.583 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.070 |
| presence targets: present read present | 0.727 |
| presence targets: share of true 'present' readings that abstain | 0.250 |
| set targets: first gold member in the decoded set | 0.696 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.350 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.857 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.571 |
| presence style: share of FALSE 'present' readings that abstain | 0.333 |

residual mean 0.306; status {'ok': 108, 'abstain': 35, 'unknown-event': 22, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.851 | 0.521 / 0.311 | 0.98 | 0.131 | 0.000 / 0.018 |
| role source | 0.703 | 0.196 / 0.000 | 0.81 | 0.132 | 0.022 / 0.165 |
| roles (pooled) | 0.681 | 0.233 / 0.000 | 0.78 | 0.147 | 0.049 / 0.172 |
| role target | 0.707 | 0.268 / 0.000 | 0.77 | 0.134 | 0.073 / 0.159 |
| role members | 0.457 | 0.124 / 0.000 | 0.61 | 0.243 | 0.086 / 0.300 |
| role style | 0.765 | 0.341 / 0.022 | 0.85 | 0.147 | 0.059 / 0.088 |
| role arrow | 0.897 | 0.384 / 0.200 | 0.97 | 0.103 | 0.034 / 0.000 |
| role targets | 0.565 | 0.046 / 0.000 | 0.52 | 0.000 | 0.043 / 0.435 |
| role pairing | 0.929 | 0.424 / 0.165 | 1.00 | 0.071 | 0.000 / 0.000 |
| role edge | 0.556 | 0.126 / 0.041 | 0.89 | 0.333 | 0.000 / 0.111 |
| role text | 0.000 | 0.258 / 0.258 | 1.00 | 1.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 3099)
| axis | accuracy |
|---|---|
| FULL | 0.557 |
| FULL [depth given] | 0.557 |
| FULL [depth and negation given] | 0.557 |
| presence text: absent read absent | 1.000 |
| presence source: absent read absent | 0.951 |
| presence target: present read present | 0.959 |
| presence target: share of 'present' readings that abstain | 0.085 |
| presence target: share of true 'present' readings that abstain | 0.085 |
| presence style: absent read absent | 0.983 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 0.995 |
| presence members: present read present | 0.929 |
| presence members: share of 'present' readings that abstain | 0.074 |
| presence members: share of true 'present' readings that abstain | 0.058 |
| presence targets: absent read absent | 0.902 |
| structure (depth, negation) | 0.897 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.810 |
| set members: first gold member in the decoded set | 0.874 |
| set targets: exact | 0.883 |
| predicate (surface lemma) | 0.897 |
| event type (synonym table) | 0.897 |
| role text | 0.997 |
| head text | 0.997 |
| lexical order head text | 0.993 |
| lexical bag head text | 1.000 |
| occupancy: not given | 0.975 |
| role source | 0.833 |
| head source | 0.833 |
| lexical order head source | 0.593 |
| lexical bag head source | 0.833 |
| role target | 0.917 |
| head target | 0.920 |
| lexical order head target | 0.533 |
| lexical bag head target | 0.873 |
| occupancy: known filler | 0.821 |
| role style | 0.963 |
| head style | 0.963 |
| lexical order head style | 0.877 |
| lexical bag head style | 0.980 |
| role arrow | 0.987 |
| head arrow | 0.987 |
| lexical order head arrow | 0.843 |
| lexical bag head arrow | 0.983 |
| role edge | 0.997 |
| head edge | 0.997 |
| lexical order head edge | 0.970 |
| lexical bag head edge | 0.987 |
| role pairing | 0.990 |
| head pairing | 0.990 |
| lexical order head pairing | 0.810 |
| lexical bag head pairing | 0.980 |
| role members | 0.793 |
| head members | 0.793 |
| lexical order head members | 0.603 |
| lexical bag head members | 0.517 |
| occupancy: unknown filler | 0.869 |
| role targets | 0.877 |
| head targets | 0.877 |
| lexical order head targets | 0.837 |
| lexical bag head targets | 0.823 |
| heads FULL (model) | 0.560 |
| heads FULL (lexical order baseline) | 0.010 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.327 |
| presence source: present read present | 0.842 |
| presence source: share of 'present' readings that abstain | 0.054 |
| presence source: share of true 'present' readings that abstain | 0.033 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.059 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.023 |
| presence arrow: share of true 'present' readings that abstain | 0.023 |
| presence members: absent read absent | 0.892 |
| presence target: absent read absent | 0.993 |
| presence targets: share of 'present' readings that abstain | 0.484 |
| presence targets: share of FALSE 'present' readings that abstain | 0.864 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence source: share of FALSE 'present' readings that abstain | 0.500 |
| presence members: share of FALSE 'present' readings that abstain | 0.176 |
| presence targets: present read present | 0.933 |
| presence targets: share of true 'present' readings that abstain | 0.286 |
| set targets: first gold member in the decoded set | 0.857 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.500 |
| presence pairing: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.254; status {'ok': 217, 'abstain': 52, 'no-sense': 3, 'unknown-event': 28}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.897 | 0.521 / 0.346 | 0.98 | 0.083 | 0.000 / 0.020 |
| role target | 0.829 | 0.343 / 0.029 | 0.88 | 0.121 | 0.071 / 0.050 |
| roles (pooled) | 0.772 | 0.286 / 0.028 | 0.87 | 0.137 | 0.038 / 0.091 |
| role members | 0.622 | 0.203 / 0.025 | 0.87 | 0.277 | 0.034 / 0.101 |
| role source | 0.737 | 0.237 / 0.000 | 0.83 | 0.114 | 0.024 / 0.150 |
| role style | 0.811 | 0.410 / 0.246 | 1.00 | 0.189 | 0.000 / 0.000 |
| role arrow | 0.915 | 0.396 / 0.142 | 0.98 | 0.085 | 0.021 / 0.000 |
| role pairing | 0.965 | 0.478 / 0.327 | 1.00 | 0.035 | 0.000 / 0.000 |
| role targets | 0.694 | 0.066 / 0.006 | 0.63 | 0.041 | 0.102 / 0.265 |
| role edge | 0.889 | 0.254 / 0.116 | 1.00 | 0.111 | 0.000 / 0.000 |
| role text | 0.500 | 0.609 / 0.340 | 1.00 | 0.500 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
to=1.00 and=0.98 TEXT=0.97 are=0.91 c3_rules=0.90 c27_them=0.90 c11_what=0.88 NUM=0.88 PAIR=0.85 c14_uh=0.83 VERB=0.79 c18_does=0.76 LAYOUT=0.74 c19_goes=0.73 c17_be=0.68 c8_what's=0.66 with=0.65 c15_on=0.64 COLOR=0.59 RECENT=0.58 c1_have=0.55 c16_new=0.52 c12_that=0.46 labeled=0.43 c2_now=0.40 directly=0.39 STYLE=0.31 SHAPE=0.31 of=0.30 POS=0.21 c10_three=0.21 c5_me=0.18 it=0.13 AXIS=0.12 NOTCOLOR=0.12 SIZE=0.12 SUPER=0.12 c21_arrowheads=0.12 c24_line=0.12 c25_pixels=0.12 c26_shape=0.12 called=0.12 lines=0.12 named=0.12 c6_both=0.01 c13_one=0.01 c9_an=0.00 ARROW=0.00 c7_i=0.00 QUANT=0.00 c22_from=0.00 DIR=0.00 c20_arrow=0.00 a=0.00 c4_then=0.00 c23_in=0.00 NAME=0.00 the=0.00 unknown=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.476
- heldout_formulations: presence source: present read present 0.831
- heldout_formulations: presence source: share of 'present' readings that abstain 0.085
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.031
- heldout_formulations: presence target: present read present 0.853
- heldout_formulations: presence target: share of 'present' readings that abstain 0.103
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.103
- heldout_formulations: presence members: absent read absent 0.880
- heldout_formulations: structure (depth, negation) 0.851
- heldout_formulations: set members: exact 0.738
- heldout_formulations: set targets: exact 0.869
- heldout_formulations: predicate (surface lemma) 0.851
- heldout_formulations: event type (synonym table) 0.851
- heldout_formulations: role source 0.798
- heldout_formulations: head source 0.798
- heldout_formulations: occupancy: known filler 0.752
- heldout_formulations: role target 0.857
- heldout_formulations: head target 0.857
- heldout_formulations: role members 0.714
- heldout_formulations: head members 0.714
- heldout_formulations: role targets 0.869
- heldout_formulations: head targets 0.869
- heldout_formulations: heads FULL (model) 0.476
- heldout_formulations: heads FULL (lexical order baseline) 0.018
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.077
- heldout_formulations: FULL [depth given] 0.476
- heldout_formulations: FULL [depth and negation given] 0.476
- heldout_formulations: FULL [presence not decided] 0.143
- heldout_formulations: role text [presence not decided] 0.583
- heldout_formulations: role source [presence not decided] 0.577
- heldout_formulations: role target [presence not decided] 0.494
- heldout_formulations: role edge [presence not decided] 0.839
- heldout_formulations: role members [presence not decided] 0.536
- heldout_formulations: role targets [presence not decided] 0.601
- heldout_formulations: heads FULL (model) [presence not decided] 0.143
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.030
- heldout_formulations: role source [pooled midpoint (comparison)] 0.458
- heldout_formulations: role target [pooled midpoint (comparison)] 0.512
- heldout_formulations: role style [pooled midpoint (comparison)] 0.899
- heldout_formulations: role members [pooled midpoint (comparison)] 0.589
- heldout_formulations: role targets [pooled midpoint (comparison)] 0.881
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.030
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.237
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.300
- heldout_formulations: presence source: absent read absent 0.894
- heldout_formulations: presence members: present read present 0.817
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.224
- heldout_formulations: set members: first gold member in the decoded set 0.686
- heldout_formulations: occupancy: unknown filler 0.716
- heldout_formulations: presence style: share of 'present' readings that abstain 0.103
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.077
- heldout_formulations: presence arrow: share of 'present' readings that abstain 0.038
- heldout_formulations: presence arrow: share of true 'present' readings that abstain 0.038
- heldout_formulations: presence style: present read present [pooled midpoint (comparison)] 0.630
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.393
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.583
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.070
- heldout_formulations: presence targets: present read present 0.727
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.250
- heldout_formulations: set targets: first gold member in the decoded set 0.696
- heldout_formulations: presence targets: present read present [pooled midpoint (comparison)] 0.350
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: present read present [pooled midpoint (comparison)] 0.857
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.571
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.333
- train (sample): FULL 0.557
- train (sample): presence target: share of 'present' readings that abstain 0.085
- train (sample): presence target: share of true 'present' readings that abstain 0.085
- train (sample): presence members: share of 'present' readings that abstain 0.074
- train (sample): presence members: share of true 'present' readings that abstain 0.058
- train (sample): structure (depth, negation) 0.897
- train (sample): set members: exact 0.810
- train (sample): set members: first gold member in the decoded set 0.874
- train (sample): set targets: exact 0.883
- train (sample): predicate (surface lemma) 0.897
- train (sample): event type (synonym table) 0.897
- train (sample): role source 0.833
- train (sample): head source 0.833
- train (sample): occupancy: known filler 0.821
- train (sample): role members 0.793
- train (sample): head members 0.793
- train (sample): occupancy: unknown filler 0.869
- train (sample): role targets 0.877
- train (sample): head targets 0.877
- train (sample): heads FULL (model) 0.560
- train (sample): heads FULL (lexical order baseline) 0.010
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.327
- train (sample): FULL [depth given] 0.557
- train (sample): FULL [depth and negation given] 0.557
- train (sample): presence source: present read present 0.842
- train (sample): presence source: share of 'present' readings that abstain 0.054
- train (sample): presence source: share of true 'present' readings that abstain 0.033
- train (sample): presence style: share of 'present' readings that abstain 0.059
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence arrow: share of 'present' readings that abstain 0.023
- train (sample): presence arrow: share of true 'present' readings that abstain 0.023
- train (sample): presence members: absent read absent 0.892
- train (sample): presence targets: share of 'present' readings that abstain 0.484
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.864
- train (sample): presence pairing: share of 'present' readings that abstain 0.000
- train (sample): presence pairing: share of true 'present' readings that abstain 0.000
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.500
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.176
- train (sample): presence targets: share of true 'present' readings that abstain 0.286
- train (sample): set targets: first gold member in the decoded set 0.857
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.000
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.000
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.500
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
| heldout_formulations | product readout: presence decided | 0.476 | 0.476 | 0.994 | 0.798 | 0.857 | 0.935 | 0.982 | 0.976 | 0.988 | 0.714 | 0.869 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.030 | 0.030 | 0.994 | 0.458 | 0.512 | 0.899 | 0.970 | 0.976 | 0.940 | 0.589 | 0.881 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.143 | 0.143 | 0.583 | 0.577 | 0.494 | 0.940 | 0.952 | 0.839 | 0.994 | 0.536 | 0.601 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | text | product: fitted | — | 1.000 | — |  |
| heldout_formulations | text | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | source | product: fitted | 0.831 | 0.894 | 0.863 | 0.085 (0.571 / 0.031) |
| heldout_formulations | source | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | target | product: fitted | 0.853 | 1.000 | 0.926 | 0.103 (— / 0.103) |
| heldout_formulations | target | comparison: pooled midpoint | 0.000 | 1.000 | 0.500 |  |
| heldout_formulations | style | product: fitted | 0.929 | 0.974 | 0.951 | 0.103 (0.333 / 0.077) |
| heldout_formulations | style | comparison: pooled midpoint | 0.630 | 1.000 | 0.815 |  |
| heldout_formulations | arrow | product: fitted | 1.000 | 1.000 | 1.000 | 0.038 (— / 0.038) |
| heldout_formulations | arrow | comparison: pooled midpoint | 0.923 | 1.000 | 0.962 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.857 | 1.000 | 0.929 |  |
| heldout_formulations | members | product: fitted | 0.817 | 0.880 | 0.848 | 0.237 (0.300 / 0.224) |
| heldout_formulations | members | comparison: pooled midpoint | 0.070 | 1.000 | 0.535 |  |
| heldout_formulations | targets | product: fitted | 0.727 | 0.901 | 0.814 | 0.393 (0.583 / 0.250) |
| heldout_formulations | targets | comparison: pooled midpoint | 0.350 | 0.960 | 0.655 |  |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.842 | 0.951 | 0.897 | 0.054 (0.500 / 0.033) |
| train (sample) | target | product: fitted | 0.959 | 0.993 | 0.976 | 0.085 (0.000 / 0.085) |
| train (sample) | style | product: fitted | 1.000 | 0.983 | 0.992 | 0.059 (0.500 / 0.000) |
| train (sample) | arrow | product: fitted | 1.000 | 1.000 | 1.000 | 0.023 (— / 0.023) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 1.000 | 0.995 | 0.998 | 0.000 (0.000 / 0.000) |
| train (sample) | members | product: fitted | 0.929 | 0.892 | 0.910 | 0.074 (0.176 / 0.058) |
| train (sample) | targets | product: fitted | 0.933 | 0.902 | 0.918 | 0.484 (0.864 / 0.286) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
