# REPORT — world `real`, legend sha256:e564ffb7e941… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
718 annotated sentences from 2 files; provenance: {'llm': 718}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/famA_p80_D1024_e2_s0/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 36 sentences
- heldout_formulations: 24 sentences
- train: 658 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 0% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: []); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
5434 tokens in the examples; 341 with no kind in the lexicon (share 0.063), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit b6f9641. Memory curve: runs/famA_p80_D1024_e2_s0/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- set_member:members: threshold 0.114 [rule: fit; pooled midpoint 0.188 (comparison)] (present 0.375, n 486 / absent 0.001, n 493209)
- set_member:targets: threshold 0.084 [rule: fit; pooled midpoint 0.127 (comparison)] (present 0.254, n 153 / absent 0.001, n 493542)
- presence:text: threshold 0.883 [rule: fit; pooled midpoint 0.037 (comparison)] (present 0.009, n 9 / absent 0.064, n 427)
- presence:source: threshold 0.347 [rule: fit; pooled midpoint 0.446 (comparison)] (present 0.599, n 231 / absent 0.294, n 205)
- presence:target: threshold 0.250 [rule: fit; pooled midpoint 0.386 (comparison)] (present 0.560, n 167 / absent 0.213, n 269)
- presence:style: threshold 0.227 [rule: fit; pooled midpoint 0.267 (comparison)] (present 0.448, n 82 / absent 0.087, n 354)
- presence:arrow: threshold 0.118 [rule: fit; pooled midpoint 0.210 (comparison)] (present 0.355, n 17 / absent 0.064, n 419)
- presence:edge: threshold 0.255 [rule: fit; pooled midpoint 0.334 (comparison)] (present 0.604, n 62 / absent 0.065, n 374)
- attr_presence:edge: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 56)
- presence:pairing: threshold 0.370 [rule: fit; pooled midpoint 0.403 (comparison)] (present 0.710, n 132 / absent 0.096, n 304)
- presence:members: threshold 0.307 [rule: fit; pooled midpoint 0.410 (comparison)] (present 0.506, n 179 / absent 0.313, n 257)
- presence:targets: threshold 0.182 [rule: fit; pooled midpoint 0.268 (comparison)] (present 0.307, n 78 / absent 0.230, n 358)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): text 0.083, source 0.001, target 0.001, style 0.333, arrow 0.500, edge 0.500, pairing 0.333, members 0.001, targets 0.001, predicate 0.023

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 24 of 24)
| axis | accuracy |
|---|---|
| FULL | 0.167 |
| FULL [depth given] | 0.167 |
| FULL [depth and negation given] | 0.167 |
| FULL [presence not decided] | 0.083 |
| FULL [pooled midpoint (comparison)] | 0.125 |
| presence text: absent read absent | 1.000 |
| presence source: present read present | 0.667 |
| presence source: share of 'present' readings that abstain | 0.308 |
| presence source: share of true 'present' readings that abstain | 0.250 |
| presence target: absent read absent | 0.429 |
| presence target: share of 'present' readings that abstain | 0.643 |
| presence target: share of FALSE 'present' readings that abstain | 0.750 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence members: absent read absent | 0.786 |
| presence targets: present read present | 1.000 |
| presence targets: share of 'present' readings that abstain | 0.615 |
| presence targets: share of true 'present' readings that abstain | 0.667 |
| structure (depth, negation) | 0.958 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.708 |
| set targets: exact | 0.625 |
| set targets: first gold member in the decoded set | 1.000 |
| predicate (surface lemma) | 0.958 |
| event type (synonym table) | 0.958 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 1.000 |
| lexical bag head text | 1.000 |
| occupancy: not given | 0.863 |
| role source | 0.625 |
| head source | 0.625 |
| lexical order head source | 0.542 |
| lexical bag head source | 0.500 |
| occupancy: unknown filler | 0.778 |
| role target | 0.542 |
| head target | 0.542 |
| lexical order head target | 0.625 |
| lexical bag head target | 0.750 |
| role style | 1.000 |
| head style | 1.000 |
| lexical order head style | 0.875 |
| lexical bag head style | 0.875 |
| role arrow | 1.000 |
| head arrow | 1.000 |
| lexical order head arrow | 1.000 |
| lexical bag head arrow | 1.000 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.917 |
| lexical bag head edge | 0.917 |
| role pairing | 0.917 |
| head pairing | 0.917 |
| lexical order head pairing | 0.750 |
| lexical bag head pairing | 0.917 |
| role members | 0.708 |
| head members | 0.708 |
| lexical order head members | 0.583 |
| lexical bag head members | 0.583 |
| role targets | 0.625 |
| head targets | 0.625 |
| lexical order head targets | 0.750 |
| lexical bag head targets | 0.667 |
| heads FULL (model) | 0.167 |
| heads FULL (lexical order baseline) | 0.000 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.083 |
| role text [presence not decided] | 1.000 |
| role source [presence not decided] | 0.583 |
| role target [presence not decided] | 0.417 |
| role style [presence not decided] | 0.875 |
| role arrow [presence not decided] | 1.000 |
| role edge [presence not decided] | 0.917 |
| role pairing [presence not decided] | 1.000 |
| role members [presence not decided] | 0.417 |
| role targets [presence not decided] | 0.583 |
| heads FULL (model) [presence not decided] | 0.083 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.583 |
| role target [pooled midpoint (comparison)] | 0.625 |
| role style [pooled midpoint (comparison)] | 1.000 |
| role arrow [pooled midpoint (comparison)] | 1.000 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 0.875 |
| role members [pooled midpoint (comparison)] | 0.667 |
| role targets [pooled midpoint (comparison)] | 0.750 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.125 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 0.333 |
| presence target: absent read absent [pooled midpoint (comparison)] | 0.923 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence members: absent read absent [pooled midpoint (comparison)] | 0.929 |
| presence targets: present read present [pooled midpoint (comparison)] | 0.500 |
| presence target: present read present | 0.667 |
| presence target: share of true 'present' readings that abstain | 0.500 |
| presence targets: absent read absent | 0.588 |
| occupancy: known filler | 0.714 |
| presence target: present read present [pooled midpoint (comparison)] | 0.111 |
| presence targets: absent read absent [pooled midpoint (comparison)] | 0.812 |
| presence source: absent read absent | 0.545 |
| presence pairing: present read present | 0.667 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence members: present read present | 0.778 |
| presence targets: share of FALSE 'present' readings that abstain | 0.571 |
| set members: first gold member in the decoded set | 0.700 |
| presence source: absent read absent [pooled midpoint (comparison)] | 0.800 |
| presence pairing: present read present [pooled midpoint (comparison)] | 0.600 |
| presence members: present read present [pooled midpoint (comparison)] | 0.500 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence members: share of 'present' readings that abstain | 0.100 |
| presence members: share of true 'present' readings that abstain | 0.143 |
| presence source: share of FALSE 'present' readings that abstain | 0.400 |
| presence members: share of FALSE 'present' readings that abstain | 0.000 |

residual mean 0.248; status {'abstain': 16, 'ok': 7, 'unknown-event': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.958 | 0.613 / 0.369 | 1.00 | 0.042 | 0.000 / 0.000 |
| role source | 0.667 | 0.070 / 0.000 | 0.50 | 0.000 | 0.167 / 0.333 |
| roles (pooled) | 0.688 | 0.103 / 0.000 | 0.56 | 0.021 | 0.146 / 0.292 |
| role targets | 0.667 | 0.039 / 0.020 | 0.33 | 0.000 | 0.333 / 0.333 |
| role target | 0.667 | 0.078 / 0.000 | 0.33 | 0.000 | 0.333 / 0.333 |
| role pairing | 0.667 | 0.162 / 0.000 | 0.67 | 0.000 | 0.000 / 0.333 |
| role members | 0.600 | 0.082 / 0.000 | 0.70 | 0.100 | 0.000 / 0.300 |
| role style | 1.000 | 0.201 / 0.136 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.402 / 0.395 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 658)
| axis | accuracy |
|---|---|
| FULL | 0.303 |
| FULL [depth given] | 0.303 |
| FULL [depth and negation given] | 0.303 |
| presence text: absent read absent | 1.000 |
| presence source: present read present | 0.723 |
| presence target: present read present | 0.783 |
| presence style: absent read absent | 0.996 |
| presence arrow: present read present | 1.000 |
| presence arrow: share of 'present' readings that abstain | 0.091 |
| presence arrow: share of true 'present' readings that abstain | 0.100 |
| presence edge: present read present | 0.829 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence pairing: absent read absent | 0.995 |
| presence members: absent read absent | 0.819 |
| presence targets: absent read absent | 0.716 |
| structure (depth, negation) | 0.910 |
| depth estimate: fit (check) | 1.000 |
| set members: exact | 0.797 |
| set targets: exact | 0.767 |
| predicate (surface lemma) | 0.877 |
| event type (synonym table) | 0.877 |
| role text | 0.987 |
| head text | 0.987 |
| lexical order head text | 0.987 |
| lexical bag head text | 1.000 |
| occupancy: not given | 0.923 |
| role source | 0.730 |
| head source | 0.730 |
| lexical order head source | 0.547 |
| lexical bag head source | 0.860 |
| occupancy: known filler | 0.751 |
| role target | 0.767 |
| head target | 0.767 |
| lexical order head target | 0.660 |
| lexical bag head target | 0.920 |
| role style | 0.973 |
| head style | 0.973 |
| lexical order head style | 0.827 |
| lexical bag head style | 0.933 |
| role arrow | 0.990 |
| head arrow | 0.990 |
| lexical order head arrow | 0.960 |
| lexical bag head arrow | 0.997 |
| role edge | 0.973 |
| head edge | 0.973 |
| lexical order head edge | 0.877 |
| lexical bag head edge | 0.967 |
| role pairing | 0.967 |
| head pairing | 0.967 |
| lexical order head pairing | 0.683 |
| lexical bag head pairing | 0.987 |
| role members | 0.753 |
| head members | 0.753 |
| lexical order head members | 0.577 |
| lexical bag head members | 0.557 |
| role targets | 0.767 |
| head targets | 0.767 |
| lexical order head targets | 0.793 |
| lexical bag head targets | 0.697 |
| heads FULL (model) | 0.307 |
| heads FULL (lexical order baseline) | 0.037 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.303 |
| presence source: absent read absent | 0.809 |
| presence target: absent read absent | 0.779 |
| presence arrow: absent read absent | 0.996 |
| presence edge: absent read absent | 1.000 |
| presence pairing: present read present | 0.956 |
| presence pairing: share of 'present' readings that abstain | 0.069 |
| presence pairing: share of true 'present' readings that abstain | 0.070 |
| presence members: present read present | 0.881 |
| presence members: share of 'present' readings that abstain | 0.053 |
| presence members: share of true 'present' readings that abstain | 0.058 |
| set members: first gold member in the decoded set | 0.819 |
| occupancy: unknown filler | 0.836 |
| presence target: share of 'present' readings that abstain | 0.393 |
| presence target: share of true 'present' readings that abstain | 0.292 |
| presence style: present read present | 0.900 |
| presence style: share of 'present' readings that abstain | 0.065 |
| presence style: share of true 'present' readings that abstain | 0.044 |
| presence source: share of 'present' readings that abstain | 0.400 |
| presence source: share of true 'present' readings that abstain | 0.333 |
| presence targets: present read present | 0.931 |
| presence targets: share of 'present' readings that abstain | 0.539 |
| presence targets: share of true 'present' readings that abstain | 0.389 |
| set targets: first gold member in the decoded set | 0.871 |
| presence source: share of FALSE 'present' readings that abstain | 0.654 |
| presence targets: share of FALSE 'present' readings that abstain | 0.672 |
| presence arrow: share of FALSE 'present' readings that abstain | 0.000 |
| presence target: share of FALSE 'present' readings that abstain | 0.575 |
| presence members: share of FALSE 'present' readings that abstain | 0.036 |
| presence pairing: share of FALSE 'present' readings that abstain | 0.000 |
| presence style: share of FALSE 'present' readings that abstain | 1.000 |
| presence text: present read present | 0.000 |

residual mean 0.262; status {'ok': 135, 'abstain': 138, 'unknown-event': 26, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.877 | 0.588 / 0.304 | 0.98 | 0.103 | 0.000 / 0.020 |
| role source | 0.638 | 0.101 / 0.000 | 0.53 | 0.112 | 0.217 / 0.250 |
| roles (pooled) | 0.736 | 0.158 / 0.000 | 0.70 | 0.107 | 0.140 / 0.157 |
| role target | 0.706 | 0.113 / 0.000 | 0.60 | 0.098 | 0.206 / 0.196 |
| role arrow | 0.833 | 0.190 / 0.073 | 0.92 | 0.167 | 0.083 / 0.000 |
| role edge | 0.784 | 0.312 / 0.000 | 0.84 | 0.054 | 0.000 / 0.162 |
| role pairing | 0.905 | 0.301 / 0.037 | 0.87 | 0.032 | 0.063 / 0.063 |
| role members | 0.638 | 0.151 / 0.000 | 0.83 | 0.244 | 0.047 / 0.118 |
| role style | 0.865 | 0.182 / 0.006 | 0.87 | 0.038 | 0.038 / 0.096 |
| role targets | 0.855 | 0.053 / 0.014 | 0.55 | 0.032 | 0.339 / 0.113 |
| role text | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |

## Gates (seed 0; OPEN > 0.5)
to=0.69 them=0.49 in=0.46 VERB=0.38 with=0.34 PAIR=0.28 from=0.24 four=0.23 NAME=0.21 line=0.21 three=0.20 QUANT=0.20 too=0.20 arrow=0.20 LAYOUT=0.16 both=0.16 TEXT=0.13 for=0.13 POS=0.13 those=0.12 on=0.12 of=0.12 remove=0.12 AXIS=0.12 NOTCOLOR=0.12 SHAPE=0.12 SIZE=0.12 SUPER=0.12 any=0.12 are=0.12 at=0.12 axis=0.12 box=0.12 called=0.12 can=0.12 check=0.12 diagram=0.12 do=0.12 does=0.12 evenly=0.12 every=0.12 exist=0.12 front=0.12 give=0.12 has=0.12 have=0.12 here=0.12 i=0.12 if=0.12 last=0.12 map=0.12 me=0.12 named=0.12 new=0.12 not=0.12 now=0.12 once=0.12 pixels=0.12 place=0.12 put=0.12 reached=0.12 rules=0.12 shape=0.12 shapes=0.12 show=0.12 tell=0.12 that=0.12 there=0.12 thing=0.12 two=0.12 we=0.12 what=0.12 what's=0.12 who=0.12 whole=0.12 RECENT=0.12 it=0.12 directly=0.11 and=0.11 just=0.11 STYLE=0.11 this=0.10 uh=0.10 labeled=0.10 by=0.09 you=0.09 as=0.09 no=0.09 be=0.09 ARROW=0.08 a=0.08 an=0.08 COLOR=0.08 each=0.08 should=0.07 then=0.07 DIR=0.06 lines=0.06 back=0.06 goes=0.06 arrows=0.06 link=0.06 the=0.05 one=0.04 unknown=0.02

## What is weak, what to add
- heldout_formulations: FULL 0.167
- heldout_formulations: presence source: present read present 0.667
- heldout_formulations: presence source: share of 'present' readings that abstain 0.308
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.250
- heldout_formulations: presence target: absent read absent 0.429
- heldout_formulations: presence target: share of 'present' readings that abstain 0.643
- heldout_formulations: presence target: share of FALSE 'present' readings that abstain 0.750
- heldout_formulations: presence members: absent read absent 0.786
- heldout_formulations: presence targets: share of 'present' readings that abstain 0.615
- heldout_formulations: presence targets: share of true 'present' readings that abstain 0.667
- heldout_formulations: set members: exact 0.708
- heldout_formulations: set targets: exact 0.625
- heldout_formulations: occupancy: not given 0.863
- heldout_formulations: role source 0.625
- heldout_formulations: head source 0.625
- heldout_formulations: occupancy: unknown filler 0.778
- heldout_formulations: role target 0.542
- heldout_formulations: head target 0.542
- heldout_formulations: role members 0.708
- heldout_formulations: head members 0.708
- heldout_formulations: role targets 0.625
- heldout_formulations: head targets 0.625
- heldout_formulations: heads FULL (model) 0.167
- heldout_formulations: heads FULL (lexical order baseline) 0.000
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.083
- heldout_formulations: FULL [depth given] 0.167
- heldout_formulations: FULL [depth and negation given] 0.167
- heldout_formulations: FULL [presence not decided] 0.083
- heldout_formulations: role source [presence not decided] 0.583
- heldout_formulations: role target [presence not decided] 0.417
- heldout_formulations: role style [presence not decided] 0.875
- heldout_formulations: role members [presence not decided] 0.417
- heldout_formulations: role targets [presence not decided] 0.583
- heldout_formulations: heads FULL (model) [presence not decided] 0.083
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.125
- heldout_formulations: role source [pooled midpoint (comparison)] 0.583
- heldout_formulations: role target [pooled midpoint (comparison)] 0.625
- heldout_formulations: role pairing [pooled midpoint (comparison)] 0.875
- heldout_formulations: role members [pooled midpoint (comparison)] 0.667
- heldout_formulations: role targets [pooled midpoint (comparison)] 0.750
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.125
- heldout_formulations: presence source: present read present [pooled midpoint (comparison)] 0.333
- heldout_formulations: presence targets: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence target: present read present 0.667
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.500
- heldout_formulations: presence targets: absent read absent 0.588
- heldout_formulations: occupancy: known filler 0.714
- heldout_formulations: presence target: present read present [pooled midpoint (comparison)] 0.111
- heldout_formulations: presence targets: absent read absent [pooled midpoint (comparison)] 0.812
- heldout_formulations: presence source: absent read absent 0.545
- heldout_formulations: presence pairing: present read present 0.667
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: present read present 0.778
- heldout_formulations: presence targets: share of FALSE 'present' readings that abstain 0.571
- heldout_formulations: set members: first gold member in the decoded set 0.700
- heldout_formulations: presence source: absent read absent [pooled midpoint (comparison)] 0.800
- heldout_formulations: presence pairing: present read present [pooled midpoint (comparison)] 0.600
- heldout_formulations: presence members: present read present [pooled midpoint (comparison)] 0.500
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence members: share of 'present' readings that abstain 0.100
- heldout_formulations: presence members: share of true 'present' readings that abstain 0.143
- heldout_formulations: presence source: share of FALSE 'present' readings that abstain 0.400
- heldout_formulations: presence members: share of FALSE 'present' readings that abstain 0.000
- train (sample): FULL 0.303
- train (sample): presence source: present read present 0.723
- train (sample): presence target: present read present 0.783
- train (sample): presence arrow: share of 'present' readings that abstain 0.091
- train (sample): presence arrow: share of true 'present' readings that abstain 0.100
- train (sample): presence edge: present read present 0.829
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence members: absent read absent 0.819
- train (sample): presence targets: absent read absent 0.716
- train (sample): set members: exact 0.797
- train (sample): set targets: exact 0.767
- train (sample): predicate (surface lemma) 0.877
- train (sample): event type (synonym table) 0.877
- train (sample): role source 0.730
- train (sample): head source 0.730
- train (sample): occupancy: known filler 0.751
- train (sample): role target 0.767
- train (sample): head target 0.767
- train (sample): role members 0.753
- train (sample): head members 0.753
- train (sample): role targets 0.767
- train (sample): head targets 0.767
- train (sample): heads FULL (model) 0.307
- train (sample): heads FULL (lexical order baseline) 0.037
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.303
- train (sample): FULL [depth given] 0.303
- train (sample): FULL [depth and negation given] 0.303
- train (sample): presence source: absent read absent 0.809
- train (sample): presence target: absent read absent 0.779
- train (sample): presence pairing: share of 'present' readings that abstain 0.069
- train (sample): presence pairing: share of true 'present' readings that abstain 0.070
- train (sample): presence members: present read present 0.881
- train (sample): presence members: share of 'present' readings that abstain 0.053
- train (sample): presence members: share of true 'present' readings that abstain 0.058
- train (sample): set members: first gold member in the decoded set 0.819
- train (sample): occupancy: unknown filler 0.836
- train (sample): presence target: share of 'present' readings that abstain 0.393
- train (sample): presence target: share of true 'present' readings that abstain 0.292
- train (sample): presence style: share of 'present' readings that abstain 0.065
- train (sample): presence style: share of true 'present' readings that abstain 0.044
- train (sample): presence source: share of 'present' readings that abstain 0.400
- train (sample): presence source: share of true 'present' readings that abstain 0.333
- train (sample): presence targets: share of 'present' readings that abstain 0.539
- train (sample): presence targets: share of true 'present' readings that abstain 0.389
- train (sample): set targets: first gold member in the decoded set 0.871
- train (sample): presence source: share of FALSE 'present' readings that abstain 0.654
- train (sample): presence targets: share of FALSE 'present' readings that abstain 0.672
- train (sample): presence arrow: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence target: share of FALSE 'present' readings that abstain 0.575
- train (sample): presence members: share of FALSE 'present' readings that abstain 0.036
- train (sample): presence pairing: share of FALSE 'present' readings that abstain 0.000
- train (sample): presence text: present read present 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `connect NAME to NAME and NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME and NAME to NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME PAIR NAME to NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME` FULL 0.000 (n 2)
- heldout_formulations: `connect NAME to NAME and NAME with solid lines` FULL 0.000 (n 1)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role text | role source | role target | role style | role arrow | role edge | role pairing | role members | role targets |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.167 | 0.167 | 1.000 | 0.625 | 0.542 | 1.000 | 1.000 | 1.000 | 0.917 | 0.708 | 0.625 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.125 | 0.125 | 1.000 | 0.583 | 0.625 | 1.000 | 1.000 | 1.000 | 0.875 | 0.667 | 0.750 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.083 | 0.083 | 1.000 | 0.583 | 0.417 | 0.875 | 1.000 | 0.917 | 1.000 | 0.417 | 0.583 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | text | product: fitted | — | 1.000 | — |  |
| heldout_formulations | text | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | source | product: fitted | 0.667 | 0.545 | 0.606 | 0.308 (0.400 / 0.250) |
| heldout_formulations | source | comparison: pooled midpoint | 0.333 | 0.800 | 0.567 |  |
| heldout_formulations | target | product: fitted | 0.667 | 0.429 | 0.548 | 0.643 (0.750 / 0.500) |
| heldout_formulations | target | comparison: pooled midpoint | 0.111 | 0.923 | 0.517 |  |
| heldout_formulations | style | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | arrow | product: fitted | — | 1.000 | — |  |
| heldout_formulations | arrow | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 0.600 | 1.000 | 0.800 |  |
| heldout_formulations | members | product: fitted | 0.778 | 0.786 | 0.782 | 0.100 (0.000 / 0.143) |
| heldout_formulations | members | comparison: pooled midpoint | 0.500 | 0.929 | 0.714 |  |
| heldout_formulations | targets | product: fitted | 1.000 | 0.588 | 0.794 | 0.615 (0.571 / 0.667) |
| heldout_formulations | targets | comparison: pooled midpoint | 0.500 | 0.812 | 0.656 |  |
| train (sample) | text | product: fitted | 0.000 | 1.000 | 0.500 |  |
| train (sample) | source | product: fitted | 0.723 | 0.809 | 0.766 | 0.400 (0.654 / 0.333) |
| train (sample) | target | product: fitted | 0.783 | 0.779 | 0.781 | 0.393 (0.575 / 0.292) |
| train (sample) | style | product: fitted | 0.900 | 0.996 | 0.948 | 0.065 (1.000 / 0.044) |
| train (sample) | arrow | product: fitted | 1.000 | 0.996 | 0.998 | 0.091 (0.000 / 0.100) |
| train (sample) | edge | product: fitted | 0.829 | 1.000 | 0.914 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 0.956 | 0.995 | 0.975 | 0.069 (0.000 / 0.070) |
| train (sample) | members | product: fitted | 0.881 | 0.819 | 0.850 | 0.053 (0.036 / 0.058) |
| train (sample) | targets | product: fitted | 0.931 | 0.716 | 0.824 | 0.539 (0.672 / 0.389) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
