# REPORT — world `links7r2`, legend sha256:2279f239b4fe… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
3880 annotated sentences from 2 files; provenance: {'llm': 3880}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/micro_links7r2_D1024_e10_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 166 sentences
- heldout_formulations: 191 sentences
- train: 3523 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
31305 tokens in the examples; 2420 with no kind in the lexicon (share 0.077), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 10, device cuda, codes path+chainL+bigram, gates learned (closed start). Code commit cfd4ccf. Memory curve: runs/micro_links7r2_D1024_e10_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.120 [rule: fit; pooled midpoint 0.301 (comparison)] (present 0.601, n 3721 / absent 0.001, n 11957345)
- set_member:targets: threshold 0.110 [rule: fit; pooled midpoint 0.223 (comparison)] (present 0.446, n 1103 / absent 0.001, n 11904427)
- presence:text: threshold 0.448 [rule: fit; pooled midpoint 0.508 (comparison)] (present 0.850, n 32 / absent 0.166, n 3657)
- presence:source: threshold 0.590 [rule: fit; pooled midpoint 0.763 (comparison)] (present 1.125, n 2223 / absent 0.401, n 1466)
- attr_presence:source: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 2222)
- presence:target: threshold 0.353 [rule: fit; pooled midpoint 0.673 (comparison)] (present 1.123, n 1944 / absent 0.224, n 1745)
- det_presence:target: threshold 0.657 [rule: fit; pooled midpoint 0.475 (comparison)] (present 0.876, n 12 / absent 0.074, n 1932)
- presence:style: threshold 0.358 [rule: fit; pooled midpoint 0.499 (comparison)] (present 0.934, n 556 / absent 0.064, n 3133)
- presence:arrow: threshold 0.304 [rule: fit; pooled midpoint 0.483 (comparison)] (present 0.912, n 696 / absent 0.054, n 2993)
- presence:edge: threshold 0.358 [rule: fit; pooled midpoint 0.454 (comparison)] (present 0.825, n 123 / absent 0.083, n 3566)
- presence:pairing: threshold 0.325 [rule: fit; pooled midpoint 0.513 (comparison)] (present 0.975, n 592 / absent 0.052, n 3097)
- presence:members: threshold 0.385 [rule: fit; pooled midpoint 0.576 (comparison)] (present 0.811, n 1321 / absent 0.342, n 2368)
- presence:targets: threshold 0.264 [rule: fit; pooled midpoint 0.367 (comparison)] (present 0.526, n 513 / absent 0.208, n 3176)
- attr_presence:edge: threshold 0.553 [rule: fit; pooled midpoint 0.530 (comparison)] (present 0.888, n 19 / absent 0.172, n 104)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): text 0.000, source 0.000, target 0.000, style 0.333, arrow 0.500, edge 0.053, pairing 0.333, members 0.000, targets 0.000, predicate 0.500

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 150 of 191)
| axis | accuracy |
|---|---|
| FULL | 0.520 |
| FULL [pooled midpoint (comparison)] | 0.367 |
| presence text: absent read absent | 1.000 |
| presence source: present read present | 0.827 |
| presence source: share of 'present' readings that abstain | 0.139 |
| presence source: share of true 'present' readings that abstain | 0.090 |
| presence target: present read present | 0.847 |
| presence target: share of 'present' readings that abstain | 0.032 |
| presence target: share of true 'present' readings that abstain | 0.033 |
| presence style: absent read absent | 0.965 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 0.985 |
| presence pairing: absent read absent | 1.000 |
| presence members: absent read absent | 0.886 |
| presence targets: absent read absent | 0.917 |
| structure (depth, negation) | 0.953 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.760 |
| set targets: exact | 0.860 |
| predicate (surface lemma) | 0.953 |
| event type (synonym table) | 0.953 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.993 |
| lexical bag head text | 0.993 |
| occupancy: not given | 0.968 |
| role source | 0.853 |
| head source | 0.853 |
| lexical order head source | 0.573 |
| lexical bag head source | 0.580 |
| occupancy: known filler | 0.859 |
| role target | 0.907 |
| head target | 0.907 |
| lexical order head target | 0.507 |
| lexical bag head target | 0.520 |
| role style | 0.927 |
| head style | 0.927 |
| lexical order head style | 0.787 |
| lexical bag head style | 0.907 |
| role arrow | 0.993 |
| head arrow | 0.993 |
| lexical order head arrow | 0.833 |
| lexical bag head arrow | 0.913 |
| role edge | 0.980 |
| head edge | 0.987 |
| lexical order head edge | 0.940 |
| lexical bag head edge | 0.940 |
| role pairing | 0.993 |
| head pairing | 0.993 |
| lexical order head pairing | 0.807 |
| lexical bag head pairing | 0.887 |
| role members | 0.733 |
| head members | 0.733 |
| lexical order head members | 0.607 |
| lexical bag head members | 0.527 |
| role targets | 0.860 |
| head targets | 0.860 |
| lexical order head targets | 0.840 |
| lexical bag head targets | 0.807 |
| heads FULL (model) | 0.527 |
| heads FULL (lexical order baseline) | 0.007 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.100 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.713 |
| role target [pooled midpoint (comparison)] | 0.800 |
| role style [pooled midpoint (comparison)] | 0.953 |
| role arrow [pooled midpoint (comparison)] | 0.987 |
| role edge [pooled midpoint (comparison)] | 0.987 |
| role pairing [pooled midpoint (comparison)] | 0.960 |
| role members [pooled midpoint (comparison)] | 0.647 |
| role targets [pooled midpoint (comparison)] | 0.867 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.367 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.525 |
| presence target: present read present [pooled midpoint (comparison)] | 0.629 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.931 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.939 |
| presence members: share of 'present' readings that abstain | 0.232 |
| presence members: share of FALSE 'present' readings that abstain | 0.200 |
| presence source: absent read absent | 0.919 |
| presence target: absent read absent | 0.986 |
| presence members: present read present | 0.836 |
| presence members: share of true 'present' readings that abstain | 0.239 |
| set members: first gold member in the decoded set | 0.746 |
| occupancy: unknown filler | 0.766 |
| presence source: absent read absent [pooled midpoint (comparison)] | 0.982 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: present read present [pooled midpoint (comparison)] | 0.653 |
| presence style: present read present | 0.862 |
| presence style: share of 'present' readings that abstain | 0.103 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 0.862 |
| presence arrow: present read present [pooled midpoint (comparison)] | 0.958 |
| presence targets: present read present | 0.739 |
| presence targets: share of 'present' readings that abstain | 0.444 |
| presence targets: share of true 'present' readings that abstain | 0.294 |
| set targets: first gold member in the decoded set | 0.667 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.545 |
| presence targets: share of FALSE 'present' readings that abstain | 0.700 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 0.889 |
| presence source: share of FALSE 'present' readings that abstain | 0.800 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.958 |
| presence style: share of FALSE 'present' readings that abstain | 0.750 |
| presence edge: share of FALSE 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |

residual mean 0.233; status {'ok': 105, 'abstain': 38, 'unknown-event': 4, 'no-sense': 3}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.953 | 0.558 / 0.413 | 0.99 | 0.040 | 0.000 / 0.007 |
| role source | 0.798 | 0.198 / 0.000 | 0.76 | 0.036 | 0.071 / 0.167 |
| roles (pooled) | 0.760 | 0.241 / 0.000 | 0.78 | 0.062 | 0.039 / 0.178 |
| role target | 0.824 | 0.292 / 0.000 | 0.82 | 0.027 | 0.027 / 0.149 |
| role members | 0.492 | 0.136 / 0.000 | 0.61 | 0.186 | 0.068 / 0.322 |
| role style | 0.781 | 0.334 / 0.000 | 0.84 | 0.062 | 0.000 / 0.156 |
| role arrow | 0.960 | 0.420 / 0.323 | 1.00 | 0.040 | 0.000 / 0.000 |
| role targets | 0.542 | 0.051 / 0.000 | 0.50 | 0.000 | 0.042 / 0.458 |
| role edge | 0.889 | 0.163 / 0.102 | 1.00 | 0.111 | 0.000 / 0.000 |
| role pairing | 0.966 | 0.371 / 0.215 | 1.00 | 0.034 | 0.000 / 0.000 |
| role text | 1.000 | 0.194 / 0.194 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 150 of 3523)
| axis | accuracy |
|---|---|
| FULL | 0.613 |
| presence text: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 0.973 |
| presence style: absent read absent | 0.974 |
| presence arrow: absent read absent | 0.991 |
| presence edge: absent read absent | 0.993 |
| presence pairing: absent read absent | 0.992 |
| presence members: present read present | 1.000 |
| presence members: share of 'present' readings that abstain | 0.109 |
| presence members: share of true 'present' readings that abstain | 0.111 |
| presence targets: absent read absent | 0.887 |
| presence targets: share of 'present' readings that abstain | 0.486 |
| presence targets: share of FALSE 'present' readings that abstain | 0.857 |
| structure (depth, negation) | 0.967 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.860 |
| set members: first gold member in the decoded set | 0.982 |
| set targets: exact | 0.873 |
| predicate (surface lemma) | 0.967 |
| event type (synonym table) | 0.967 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.993 |
| lexical bag head text | 0.993 |
| occupancy: not given | 0.969 |
| role source | 0.907 |
| head source | 0.907 |
| lexical order head source | 0.627 |
| lexical bag head source | 0.813 |
| role target | 0.913 |
| head target | 0.913 |
| lexical order head target | 0.520 |
| lexical bag head target | 0.907 |
| role style | 0.980 |
| head style | 0.980 |
| lexical order head style | 0.813 |
| lexical bag head style | 0.960 |
| role arrow | 0.987 |
| head arrow | 0.987 |
| lexical order head arrow | 0.753 |
| lexical bag head arrow | 1.000 |
| role edge | 0.993 |
| head edge | 0.993 |
| lexical order head edge | 0.973 |
| lexical bag head edge | 0.987 |
| role pairing | 0.993 |
| head pairing | 0.993 |
| lexical order head pairing | 0.867 |
| lexical bag head pairing | 0.973 |
| role members | 0.847 |
| head members | 0.847 |
| lexical order head members | 0.633 |
| lexical bag head members | 0.547 |
| occupancy: unknown filler | 0.962 |
| role targets | 0.867 |
| head targets | 0.867 |
| lexical order head targets | 0.847 |
| lexical bag head targets | 0.807 |
| heads FULL (model) | 0.613 |
| heads FULL (lexical order baseline) | 0.020 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.353 |
| presence source: present read present | 0.885 |
| presence source: share of 'present' readings that abstain | 0.078 |
| presence source: share of true 'present' readings that abstain | 0.078 |
| presence members: absent read absent | 0.890 |
| presence targets: present read present | 1.000 |
| presence targets: share of true 'present' readings that abstain | 0.238 |
| set targets: first gold member in the decoded set | 0.913 |
| occupancy: known filler | 0.901 |
| presence target: present read present | 0.871 |
| presence target: share of 'present' readings that abstain | 0.016 |
| presence target: share of true 'present' readings that abstain | 0.016 |
| presence members: share of FALSE 'present' readings that abstain | 0.100 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.032 |
| presence style: share of true 'present' readings that abstain | 0.036 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.079 |
| presence arrow: share of true 'present' readings that abstain | 0.054 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 0.000 |
| presence edge: share of FALSE 'present' readings that abstain | 0.000 |
| presence arrow: share of FALSE 'present' readings that abstain | 1.000 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence pairing: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.205; status {'abstain': 27, 'ok': 118, 'unknown-event': 5}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.967 | 0.557 / 0.442 | 1.00 | 0.033 | 0.000 / 0.000 |
| role members | 0.764 | 0.179 / 0.049 | 0.89 | 0.218 | 0.091 / 0.018 |
| roles (pooled) | 0.864 | 0.276 / 0.037 | 0.88 | 0.063 | 0.051 / 0.073 |
| role source | 0.846 | 0.213 / 0.000 | 0.82 | 0.044 | 0.066 / 0.110 |
| role targets | 0.739 | 0.069 / 0.003 | 0.74 | 0.130 | 0.130 / 0.130 |
| role target | 0.847 | 0.328 / 0.000 | 0.86 | 0.028 | 0.014 / 0.125 |
| role pairing | 1.000 | 0.449 / 0.343 | 1.00 | 0.000 | 0.000 / 0.000 |
| role style | 1.000 | 0.398 / 0.282 | 0.96 | 0.000 | 0.036 / 0.000 |
| role arrow | 0.973 | 0.421 / 0.266 | 0.95 | 0.000 | 0.027 / 0.027 |
| role edge | 1.000 | 0.223 / 0.139 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 1.000 | 0.184 / 0.184 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
to=1.00 and=1.00 POS=0.99 c27_them=0.97 c14_uh=0.97 TEXT=0.96 SHAPE=0.92 are=0.92 NUM=0.91 c22_from=0.86 c8_what's=0.84 LAYOUT=0.76 c19_goes=0.76 VERB=0.74 c18_does=0.71 c16_new=0.66 PAIR=0.65 c17_be=0.58 c5_me=0.56 c1_have=0.56 c2_now=0.44 c15_on=0.44 with=0.42 RECENT=0.36 c11_what=0.36 c3_rules=0.35 STYLE=0.28 labeled=0.27 c12_that=0.26 c13_one=0.19 c6_both=0.17 c10_three=0.14 AXIS=0.12 NOTCOLOR=0.12 SIZE=0.12 SUPER=0.12 c21_arrowheads=0.12 c23_in=0.12 c24_line=0.12 c25_pixels=0.12 c26_shape=0.12 called=0.12 lines=0.12 named=0.12 it=0.06 directly=0.04 c7_i=0.01 COLOR=0.00 of=0.00 QUANT=0.00 DIR=0.00 ARROW=0.00 c9_an=0.00 c4_then=0.00 a=0.00 c20_arrow=0.00 NAME=0.00 unknown=0.00 the=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.520
- heldout_formulations: presence source: present read present 0.827
- heldout_formulations: presence source: share of 'present' readings that abstain 0.139
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.090
- heldout_formulations: presence target: present read present 0.847
- heldout_formulations: presence target: share of 'present' readings that abstain 0.032
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.033
- heldout_formulations: presence members: absent read absent 0.886
- heldout_formulations: set members: exact 0.760
- heldout_formulations: set targets: exact 0.860
- heldout_formulations: role source 0.853
- heldout_formulations: head source 0.853
- heldout_formulations: occupancy: known filler 0.859
- heldout_formulations: role members 0.733
- heldout_formulations: head members 0.733
- heldout_formulations: role targets 0.860
- heldout_formulations: head targets 0.860
- heldout_formulations: heads FULL (model) 0.527
- heldout_formulations: heads FULL (lexical order baseline) 0.007
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.100
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.367
- heldout_formulations: role source [pooled midpoint (comparison)] 0.713
- heldout_formulations: role target [pooled midpoint (comparison)] 0.800
- heldout_formulations: role members [pooled midpoint (comparison)] 0.647
- heldout_formulations: role targets [pooled midpoint (comparison)] 0.867
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.367
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.525
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.629
- heldout_formulations: presence members: share of 'present' readings that abstain 0.232
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.200
- heldout_formulations: presence members: present read present 0.836
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.239
- heldout_formulations: set members: first gold member in the decoded set 0.746
- heldout_formulations: occupancy: unknown filler 0.766
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.653
- heldout_formulations: presence style: present read present 0.862
- heldout_formulations: presence style: share of 'present' readings that abstain 0.103
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: share of 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: present read present [pooled midpoint (comparison)] 0.862
- heldout_formulations: presence targets: present read present 0.739
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.444
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.294
- heldout_formulations: set targets: first gold member in the decoded set 0.667
- heldout_formulations: presence targets: present read present [pooled midpoint (comparison)] 0.545
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.700
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: present read present [pooled midpoint (comparison)] 0.889
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.800
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of FALSE 'present' readings that abstain 0.750
- heldout_formulations: presence edge: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- train (sample): FULL 0.613
- train (sample): presence members: share of 'present' readings that abstain 0.109
- train (sample): presence members: share of true 'present' readings that abstain 0.111
- train (sample): presence targets: absent read absent 0.887
- train (sample): presence targets: share of 'present' readings that abstain 0.486
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.857
- train (sample): set members: exact 0.860
- train (sample): set targets: exact 0.873
- train (sample): role members 0.847
- train (sample): head members 0.847
- train (sample): role targets 0.867
- train (sample): head targets 0.867
- train (sample): heads FULL (model) 0.613
- train (sample): heads FULL (lexical order baseline) 0.020
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.353
- train (sample): presence source: present read present 0.885
- train (sample): presence source: share of 'present' readings that abstain 0.078
- train (sample): presence source: share of true 'present' readings that abstain 0.078
- train (sample): presence members: absent read absent 0.890
- train (sample): presence targets: share of true 'present' readings that abstain 0.238
- train (sample): presence target: present read present 0.871
- train (sample): presence target: share of 'present' readings that abstain 0.016
- train (sample): presence target: share of true 'present' readings that abstain 0.016
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.100
- train (sample): presence pairing: share of 'present' readings that abstain 0.000
- train (sample): presence pairing: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of 'present' readings that abstain 0.032
- train (sample): presence style: share of true 'present' readings that abstain 0.036
- train (sample): presence arrow: share of 'present' readings that abstain 0.079
- train (sample): presence arrow: share of true 'present' readings that abstain 0.054
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence style: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence edge: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.000
- train (sample): presence text: share of true 'present' readings that abstain 0.000
- train (sample): presence pairing: share of FALSE 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `connect NAME to NAME and NAME to NAME` FULL 0.000 (n 8)
- heldout_formulations: `NAME connect NAME` FULL 0.000 (n 3)
- heldout_formulations: `connect NAME to NAME PAIR NAME to NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME , NAME to NAME , and NAME to NAME` FULL 0.000 (n 1)
- heldout_formulations: `NAME to NAME labeled powerup` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role text | role source | role target | role style | role arrow | role edge | role pairing | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.527 | 0.520 | 1.000 | 0.853 | 0.907 | 0.927 | 0.993 | 0.980 | 0.993 | 0.733 | 0.860 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.367 | 0.367 | 1.000 | 0.713 | 0.800 | 0.953 | 0.987 | 0.987 | 0.960 | 0.647 | 0.867 |
| heldout_formulations | v16 protocol: every role read, not available to the product | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan | nan |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | source | product: fitted | 0.827 | 0.919 | 0.873 | 0.139 (0.800 / 0.090) |
| heldout_formulations | source | comparison: pooled midpoint | 0.525 | 0.982 | 0.754 |  |
| heldout_formulations | target | product: fitted | 0.847 | 0.986 | 0.917 | 0.032 (0.000 / 0.033) |
| heldout_formulations | target | comparison: pooled midpoint | 0.629 | 1.000 | 0.814 |  |
| heldout_formulations | style | product: fitted | 0.862 | 0.965 | 0.913 | 0.103 (0.750 / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 0.862 | 1.000 | 0.931 |  |
| heldout_formulations | arrow | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | arrow | comparison: pooled midpoint | 0.958 | 1.000 | 0.979 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 0.985 | 0.993 | 0.000 (0.000 / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 0.889 | 1.000 | 0.944 |  |
| heldout_formulations | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.958 | 1.000 | 0.979 |  |
| heldout_formulations | members | product: fitted | 0.836 | 0.886 | 0.861 | 0.232 (0.200 / 0.239) |
| heldout_formulations | members | comparison: pooled midpoint | 0.653 | 0.931 | 0.792 |  |
| heldout_formulations | targets | product: fitted | 0.739 | 0.917 | 0.828 | 0.444 (0.700 / 0.294) |
| heldout_formulations | targets | comparison: pooled midpoint | 0.545 | 0.939 | 0.742 |  |
| train (sample) | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 0.885 | 1.000 | 0.943 | 0.078 (— / 0.078) |
| train (sample) | target | product: fitted | 0.871 | 0.973 | 0.922 | 0.016 (0.000 / 0.016) |
| train (sample) | style | product: fitted | 1.000 | 0.974 | 0.987 | 0.032 (0.000 / 0.036) |
| train (sample) | arrow | product: fitted | 1.000 | 0.991 | 0.995 | 0.079 (1.000 / 0.054) |
| train (sample) | edge | product: fitted | 1.000 | 0.993 | 0.996 | 0.000 (0.000 / 0.000) |
| train (sample) | pairing | product: fitted | 1.000 | 0.992 | 0.996 | 0.000 (0.000 / 0.000) |
| train (sample) | members | product: fitted | 1.000 | 0.890 | 0.945 | 0.109 (0.100 / 0.111) |
| train (sample) | targets | product: fitted | 1.000 | 0.887 | 0.944 | 0.486 (0.857 / 0.238) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
