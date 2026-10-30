# REPORT — world `sketch`, legend sha256:9a92ad4aa726… (version 1)

Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED or HYPOTHESIS except where a line says so.

## Given and learned (rule 20)
GIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds (lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) with structured per-sentence targets with pre-set roles; the model learns the assignment.

## Data
8600 annotated sentences from 3 files; provenance: {'generator': 8600}. Audit: none in this world folder (audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): none.

## Splits (written to runs/sketch_n8000_D1024_e2_s0_calattr/splits.json before training; source: split_hints.json)
- calibration_heldout_formulations: 159 sentences
- heldout_formulations: 141 sentences
- heldout_sentences: 727 sentences
- new_identities: 300 sentences
- train: 7273 sentences

The four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, 10% by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in training: ['250', '35', '45', '90', 'n_atlas', 'n_begin', 'n_dev', 'n_e', 'n_f', 'n_finish', 'n_gem', 'n_hub2', 'n_inbox', 'n_kiwi', 'n_ledger', 'n_moon', 'n_nova', 'n_ops', 'n_orbit', 'n_prism', 'n_q', 'n_vault', 'n_venus', 'n_zed', 't_archive', 't_checkout', 't_notify', 't_refund', 't_review', 't_step_3', 't_sync', 't_upload']); plus held-out depth from None when the world says so. The lexical bag baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.

## Kinds (spec 6.3)
40170 tokens in the examples; 0 with no kind in the lexicon (share 0.000), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). Word -> kind table: model/catalog.json.

## Training
D=1024, seeds [0], batch 8, lr 0.02, epochs 2, device cpu, codes path+chainL+bigram, gates learned (closed start). Code commit 9c85649-dirty. Memory curve: runs/sketch_n8000_D1024_e2_s0_calattr/train.log (trainer.train_loop, rule 21).

## Thresholds (rule 25)
Abstention tau = 0.05: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the calibration half of the held-out formulations when enabled (never the scored rows):
- presence:object: threshold 0.001 [rule: fit; pooled midpoint 0.386 (comparison)] (present 0.773, n 434 / absent 0.000, n 125)
- presence:shape: threshold 0.417 [rule: fit; pooled midpoint 0.431 (comparison)] (present 0.862, n 13 / absent 0.000, n 546)
- presence:color: threshold 0.032 [rule: fit; pooled midpoint 0.240 (comparison)] (present 0.472, n 59 / absent 0.009, n 500)
- presence:size: threshold 0.029 [rule: fit; pooled midpoint 0.266 (comparison)] (present 0.510, n 49 / absent 0.021, n 510)
- presence:name: threshold 0.050 [rule: fit; pooled midpoint 0.362 (comparison)] (present 0.723, n 37 / absent 0.001, n 522)
- presence:text: threshold 0.080 [rule: fit; pooled midpoint 0.360 (comparison)] (present 0.722, n 36 / absent -0.002, n 523)
- presence:relation: threshold 0.118 [rule: fit; pooled midpoint 0.328 (comparison)] (present 0.644, n 85 / absent 0.012, n 474)
- presence:landmark: threshold 0.127 [rule: fit; pooled midpoint 0.371 (comparison)] (present 0.715, n 85 / absent 0.028, n 474)
- presence:landmark2: threshold 0.221 [rule: fit; pooled midpoint 0.261 (comparison)] (present 0.518, n 9 / absent 0.004, n 550)
- presence:region: threshold 0.120 [rule: fit; pooled midpoint 0.284 (comparison)] (present 0.541, n 51 / absent 0.027, n 508)
- presence:direction: threshold 0.184 [rule: fit; pooled midpoint 0.407 (comparison)] (present 0.813, n 9 / absent 0.001, n 550)
- presence:amount: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 3, absent 556)
- presence:quantity: threshold 0.202 [rule: fit; pooled midpoint 0.233 (comparison)] (present 0.465, n 15 / absent 0.001, n 544)
- presence:axis: threshold 0.313 [rule: fit; pooled midpoint 0.471 (comparison)] (present 0.942, n 14 / absent 0.000, n 545)
- presence:layout: threshold 0.232 [rule: fit; pooled midpoint 0.360 (comparison)] (present 0.719, n 10 / absent 0.000, n 549)
- presence:source: threshold 0.175 [rule: fit; pooled midpoint 0.444 (comparison)] (present 0.887, n 117 / absent 0.000, n 442)
- attr_presence:source: threshold 0.740 [rule: fit; pooled midpoint 0.603 (comparison)] (present 1.013, n 24 / absent 0.192, n 93)
- det_presence:source: threshold 0.389 [rule: fit; pooled midpoint 0.550 (comparison)] (present 1.004, n 17 / absent 0.096, n 100)
- presence:target: threshold 0.354 [rule: fit; pooled midpoint 0.475 (comparison)] (present 0.948, n 89 / absent 0.002, n 470)
- attr_presence:target: threshold 0.586 [rule: fit; pooled midpoint 0.577 (comparison)] (present 0.998, n 11 / absent 0.157, n 78)
- det_presence:target: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 0, absent 89)
- presence:style: threshold 0.493 [rule: fit; pooled midpoint 0.394 (comparison)] (present 0.780, n 21 / absent 0.007, n 538)
- presence:arrow: threshold 0.445 [rule: fit; pooled midpoint 0.318 (comparison)] (present 0.635, n 11 / absent 0.000, n 548)
- presence:edge: threshold 0.450 [rule: fit; pooled midpoint 0.455 (comparison)] (present 0.906, n 36 / absent 0.003, n 523)
- presence:pairing: threshold 0.380 [rule: fit; pooled midpoint 0.420 (comparison)] (present 0.840, n 18 / absent 0.000, n 541)
- presence:notcolor: threshold 0.312 [rule: fit; pooled midpoint 0.385 (comparison)] (present 0.768, n 29 / absent 0.001, n 530)
- presence:depth: threshold 0.176 [rule: fit; pooled midpoint 0.269 (comparison)] (present 0.537, n 7 / absent 0.000, n 552)
- attr_presence:object: threshold 0.543 [rule: fit; pooled midpoint 0.519 (comparison)] (present 0.920, n 119 / absent 0.117, n 315)
- det_presence:object: threshold 0.421 [rule: fit; pooled midpoint 0.398 (comparison)] (present 0.733, n 10 / absent 0.062, n 424)
- attr_presence:landmark: threshold 0.601 [rule: fit; pooled midpoint 0.617 (comparison)] (present 1.075, n 12 / absent 0.158, n 73)
- det_presence:landmark: no threshold (one class missing in the calibration rows: read by the training rate (always / never); n present 1, absent 84)

## Results (seed 0 model in model/; mean ± std over seeds when more than one)

Chance per role (1 / catalog candidates of the role's kinds): object 0.010, shape 0.056, color 0.056, size 0.143, name 0.013, text 0.026, relation 0.167, landmark 0.011, landmark2 0.013, region 0.111, direction 0.250, amount 0.050, quantity 0.050, axis 0.500, layout 0.250, source 0.010, target 0.011, style 0.333, arrow 0.500, edge 0.333, pairing 0.333, notcolor 0.056, depth 0.500, predicate 0.025

Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.

### heldout_formulations — catalog candidates (n = 141 of 141)
| axis | accuracy |
|---|---|
| FULL | 0.894 |
| FULL [depth given] | 0.894 |
| FULL [depth and negation given] | 0.894 |
| FULL [presence not decided] | 0.922 |
| FULL [pooled midpoint (comparison)] | 0.794 |
| presence object: absent read absent | 1.000 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence direction: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| structure (depth, negation) | 0.993 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 0.993 |
| event type (synonym table) | 0.993 |
| role object | 0.943 |
| head object | 0.993 |
| lexical order head object | 0.695 |
| lexical bag head object | 0.922 |
| occupancy: not given | 1.000 |
| role shape | 1.000 |
| head shape | 1.000 |
| lexical order head shape | 1.000 |
| lexical bag head shape | 1.000 |
| role color | 1.000 |
| head color | 1.000 |
| lexical order head color | 0.887 |
| lexical bag head color | 1.000 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.922 |
| lexical bag head size | 0.929 |
| role name | 0.979 |
| head name | 0.979 |
| lexical order head name | 0.901 |
| lexical bag head name | 0.972 |
| role text | 1.000 |
| head text | 1.000 |
| lexical order head text | 0.915 |
| lexical bag head text | 0.993 |
| role relation | 0.993 |
| head relation | 0.993 |
| lexical order head relation | 0.837 |
| lexical bag head relation | 0.908 |
| role landmark | 1.000 |
| head landmark | 1.000 |
| lexical order head landmark | 0.837 |
| lexical bag head landmark | 0.858 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.986 |
| lexical bag head landmark2 | 1.000 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 0.950 |
| lexical bag head region | 0.965 |
| role direction | 1.000 |
| head direction | 1.000 |
| lexical order head direction | 1.000 |
| lexical bag head direction | 1.000 |
| role amount | 1.000 |
| head amount | 1.000 |
| lexical order head amount | 1.000 |
| lexical bag head amount | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.943 |
| lexical bag head quantity | 1.000 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.950 |
| lexical bag head axis | 0.986 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 1.000 |
| lexical bag head layout | 1.000 |
| role source | 1.000 |
| head source | 1.000 |
| lexical order head source | 0.702 |
| lexical bag head source | 0.851 |
| role target | 0.979 |
| head target | 1.000 |
| lexical order head target | 0.738 |
| lexical bag head target | 0.887 |
| role style | 0.993 |
| head style | 0.993 |
| lexical order head style | 0.894 |
| lexical bag head style | 0.993 |
| role arrow | 0.993 |
| head arrow | 0.993 |
| lexical order head arrow | 0.972 |
| lexical bag head arrow | 0.993 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.865 |
| lexical bag head edge | 0.986 |
| role pairing | 1.000 |
| head pairing | 1.000 |
| lexical order head pairing | 0.965 |
| lexical bag head pairing | 1.000 |
| role notcolor | 1.000 |
| head notcolor | 1.000 |
| lexical order head notcolor | 0.936 |
| lexical bag head notcolor | 0.950 |
| role depth | 1.000 |
| head depth | 1.000 |
| lexical order head depth | 0.965 |
| lexical bag head depth | 1.000 |
| heads FULL (model) | 0.965 |
| heads FULL (lexical order baseline) | 0.121 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.489 |
| role object [presence not decided] | 0.950 |
| role shape [presence not decided] | 1.000 |
| role color [presence not decided] | 1.000 |
| role size [presence not decided] | 1.000 |
| role name [presence not decided] | 1.000 |
| role text [presence not decided] | 1.000 |
| role relation [presence not decided] | 1.000 |
| role landmark [presence not decided] | 1.000 |
| role landmark2 [presence not decided] | 1.000 |
| role region [presence not decided] | 1.000 |
| role direction [presence not decided] | 1.000 |
| role amount [presence not decided] | 1.000 |
| role quantity [presence not decided] | 1.000 |
| role axis [presence not decided] | 1.000 |
| role layout [presence not decided] | 1.000 |
| role source [presence not decided] | 1.000 |
| role target [presence not decided] | 0.979 |
| role style [presence not decided] | 1.000 |
| role arrow [presence not decided] | 0.993 |
| role edge [presence not decided] | 1.000 |
| role pairing [presence not decided] | 1.000 |
| role notcolor [presence not decided] | 1.000 |
| role depth [presence not decided] | 1.000 |
| heads FULL (model) [presence not decided] | 0.993 |
| role object [pooled midpoint (comparison)] | 0.858 |
| role shape [pooled midpoint (comparison)] | 1.000 |
| role color [pooled midpoint (comparison)] | 0.979 |
| role size [pooled midpoint (comparison)] | 0.993 |
| role name [pooled midpoint (comparison)] | 0.972 |
| role text [pooled midpoint (comparison)] | 1.000 |
| role relation [pooled midpoint (comparison)] | 0.965 |
| role landmark [pooled midpoint (comparison)] | 0.979 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.986 |
| role direction [pooled midpoint (comparison)] | 1.000 |
| role amount [pooled midpoint (comparison)] | 1.000 |
| role quantity [pooled midpoint (comparison)] | 0.993 |
| role axis [pooled midpoint (comparison)] | 1.000 |
| role layout [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 1.000 |
| role target [pooled midpoint (comparison)] | 0.979 |
| role style [pooled midpoint (comparison)] | 1.000 |
| role arrow [pooled midpoint (comparison)] | 0.993 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 1.000 |
| role notcolor [pooled midpoint (comparison)] | 1.000 |
| role depth [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.865 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence direction: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence notcolor: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence depth: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present | 1.000 |
| presence source: share of 'present' readings that abstain | 0.048 |
| presence source: share of true 'present' readings that abstain | 0.048 |
| presence target: present read present | 1.000 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 0.933 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present | 0.750 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.700 |
| occupancy: known filler | 0.980 |
| presence source: present read present [pooled midpoint (comparison)] | 1.000 |
| presence target: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence arrow: present read present [pooled midpoint (comparison)] | 0.750 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence object: present read present | 1.000 |
| presence object: share of 'present' readings that abstain | 0.053 |
| presence object: share of true 'present' readings that abstain | 0.053 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence object: present read present [pooled midpoint (comparison)] | 0.901 |
| presence axis: present read present [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present | 0.846 |
| presence name: share of 'present' readings that abstain | 0.091 |
| presence name: share of true 'present' readings that abstain | 0.091 |
| presence text: present read present | 1.000 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence relation: present read present | 0.957 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.087 |
| presence landmark: share of true 'present' readings that abstain | 0.087 |
| presence size: present read present [pooled midpoint (comparison)] | 0.909 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.783 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.870 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.143 |
| presence region: share of true 'present' readings that abstain | 0.143 |
| presence region: present read present [pooled midpoint (comparison)] | 0.714 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 1.000 |
| presence depth: present read present | 1.000 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence depth: present read present [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present | 1.000 |
| presence color: share of 'present' readings that abstain | 0.000 |
| presence color: share of true 'present' readings that abstain | 0.000 |
| presence color: present read present [pooled midpoint (comparison)] | 0.812 |
| presence notcolor: present read present | 1.000 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |
| presence notcolor: present read present [pooled midpoint (comparison)] | 1.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.125 |
| presence quantity: share of true 'present' readings that abstain | 0.125 |
| presence quantity: present read present [pooled midpoint (comparison)] | 0.875 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |

residual mean 0.085; status {'ok': 127, 'abstain': 13, 'no-sense': 1}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 0.993 | 0.432 / 0.323 | 1.00 | 0.007 | 0.000 / 0.000 |
| role source | 1.000 | 0.213 / 0.100 | 0.95 | 0.000 | 0.048 / 0.000 |
| roles (pooled) | 0.952 | 0.287 / 0.110 | 0.95 | 0.028 | 0.034 / 0.020 |
| role target | 0.919 | 0.268 / 0.136 | 1.00 | 0.081 | 0.000 / 0.000 |
| role style | 0.933 | 0.176 / 0.055 | 0.93 | 0.000 | 0.000 / 0.067 |
| role arrow | 0.750 | 0.232 / 0.079 | 0.75 | 0.000 | 0.000 / 0.250 |
| role edge | 1.000 | 0.278 / 0.240 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 0.916 | 0.356 / 0.163 | 0.94 | 0.074 | 0.053 / 0.011 |
| role axis | 1.000 | 0.412 / 0.377 | 1.00 | 0.000 | 0.000 / 0.000 |
| role size | 1.000 | 0.337 / 0.237 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 0.786 | 0.254 / 0.000 | 0.71 | 0.000 | 0.071 / 0.214 |
| role text | 1.000 | 0.263 / 0.202 | 1.00 | 0.000 | 0.000 / 0.000 |
| role relation | 0.957 | 0.270 / 0.116 | 0.96 | 0.000 | 0.000 / 0.043 |
| role landmark | 1.000 | 0.234 / 0.116 | 0.91 | 0.000 | 0.087 / 0.000 |
| role region | 1.000 | 0.229 / 0.042 | 0.86 | 0.000 | 0.143 / 0.000 |
| role pairing | 1.000 | 0.377 / 0.343 | 1.00 | 0.000 | 0.000 / 0.000 |
| role depth | 1.000 | 0.286 / 0.167 | 1.00 | 0.000 | 0.000 / 0.000 |
| role color | 1.000 | 0.310 / 0.166 | 1.00 | 0.000 | 0.000 / 0.000 |
| role notcolor | 1.000 | 0.380 / 0.288 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.188 / 0.048 | 0.88 | 0.000 | 0.125 / 0.000 |
| role landmark2 | 1.000 | 0.141 / 0.128 | 1.00 | 0.000 | 0.000 / 0.000 |

### heldout_sentences — catalog candidates (n = 600 of 727)
| axis | accuracy |
|---|---|
| FULL | 0.902 |
| FULL [depth given] | 0.902 |
| FULL [depth and negation given] | 0.902 |
| FULL [pooled midpoint (comparison)] | 0.742 |
| presence object: present read present | 0.992 |
| presence object: share of 'present' readings that abstain | 0.047 |
| presence object: share of true 'present' readings that abstain | 0.047 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 1.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.032 |
| presence size: share of true 'present' readings that abstain | 0.032 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: present read present | 0.988 |
| presence relation: share of 'present' readings that abstain | 0.048 |
| presence relation: share of true 'present' readings that abstain | 0.048 |
| presence landmark: present read present | 0.988 |
| presence landmark: share of 'present' readings that abstain | 0.036 |
| presence landmark: share of true 'present' readings that abstain | 0.036 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence direction: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| role object | 0.982 |
| head object | 0.993 |
| lexical order head object | 0.843 |
| lexical bag head object | 0.922 |
| occupancy: known filler | 0.963 |
| role shape | 0.998 |
| head shape | 0.998 |
| lexical order head shape | 0.983 |
| lexical bag head shape | 0.998 |
| occupancy: not given | 1.000 |
| role color | 0.990 |
| head color | 0.990 |
| lexical order head color | 0.883 |
| lexical bag head color | 0.963 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.895 |
| lexical bag head size | 0.918 |
| role name | 0.992 |
| head name | 0.992 |
| lexical order head name | 0.910 |
| lexical bag head name | 0.982 |
| role text | 0.992 |
| head text | 0.992 |
| lexical order head text | 0.943 |
| lexical bag head text | 0.997 |
| role relation | 0.998 |
| head relation | 0.998 |
| lexical order head relation | 0.860 |
| lexical bag head relation | 0.917 |
| role landmark | 0.990 |
| head landmark | 0.998 |
| lexical order head landmark | 0.860 |
| lexical bag head landmark | 0.857 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.992 |
| lexical bag head landmark2 | 0.997 |
| role region | 0.998 |
| head region | 0.998 |
| lexical order head region | 0.910 |
| lexical bag head region | 0.930 |
| role direction | 0.997 |
| head direction | 0.997 |
| lexical order head direction | 0.962 |
| lexical bag head direction | 0.993 |
| role amount | 0.968 |
| head amount | 0.968 |
| lexical order head amount | 0.968 |
| lexical bag head amount | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.973 |
| lexical bag head quantity | 1.000 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.967 |
| lexical bag head axis | 0.997 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 0.987 |
| lexical bag head layout | 1.000 |
| role source | 0.998 |
| head source | 1.000 |
| lexical order head source | 0.857 |
| lexical bag head source | 0.957 |
| role target | 1.000 |
| head target | 1.000 |
| lexical order head target | 0.883 |
| lexical bag head target | 0.938 |
| role style | 1.000 |
| head style | 1.000 |
| lexical order head style | 0.977 |
| lexical bag head style | 0.998 |
| role arrow | 0.993 |
| head arrow | 0.993 |
| lexical order head arrow | 0.985 |
| lexical bag head arrow | 0.992 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.965 |
| lexical bag head edge | 0.998 |
| role pairing | 1.000 |
| head pairing | 1.000 |
| lexical order head pairing | 0.973 |
| lexical bag head pairing | 1.000 |
| role notcolor | 1.000 |
| head notcolor | 1.000 |
| lexical order head notcolor | 0.955 |
| lexical bag head notcolor | 0.973 |
| role depth | 1.000 |
| head depth | 1.000 |
| lexical order head depth | 0.973 |
| lexical bag head depth | 1.000 |
| heads FULL (model) | 0.922 |
| heads FULL (lexical order baseline) | 0.207 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.580 |
| role object [pooled midpoint (comparison)] | 0.825 |
| role shape [pooled midpoint (comparison)] | 0.998 |
| role color [pooled midpoint (comparison)] | 0.963 |
| role size [pooled midpoint (comparison)] | 0.983 |
| role name [pooled midpoint (comparison)] | 0.985 |
| role text [pooled midpoint (comparison)] | 0.985 |
| role relation [pooled midpoint (comparison)] | 0.972 |
| role landmark [pooled midpoint (comparison)] | 0.973 |
| role landmark2 [pooled midpoint (comparison)] | 0.998 |
| role region [pooled midpoint (comparison)] | 0.970 |
| role direction [pooled midpoint (comparison)] | 0.995 |
| role amount [pooled midpoint (comparison)] | 0.968 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role axis [pooled midpoint (comparison)] | 1.000 |
| role layout [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.993 |
| role target [pooled midpoint (comparison)] | 1.000 |
| role style [pooled midpoint (comparison)] | 1.000 |
| role arrow [pooled midpoint (comparison)] | 0.993 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 1.000 |
| role notcolor [pooled midpoint (comparison)] | 1.000 |
| role depth [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.760 |
| presence object: present read present [pooled midpoint (comparison)] | 0.821 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.841 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.807 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.880 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence direction: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence notcolor: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence depth: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence direction: present read present | 0.913 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence direction: present read present [pooled midpoint (comparison)] | 0.870 |
| presence object: absent read absent | 1.000 |
| presence text: present read present | 0.853 |
| presence text: share of 'present' readings that abstain | 0.103 |
| presence text: share of true 'present' readings that abstain | 0.103 |
| presence source: present read present | 1.000 |
| presence source: share of 'present' readings that abstain | 0.000 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 1.000 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.071 |
| presence style: share of true 'present' readings that abstain | 0.071 |
| presence arrow: present read present | 0.556 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present [pooled midpoint (comparison)] | 0.735 |
| presence source: present read present [pooled midpoint (comparison)] | 0.953 |
| presence target: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence arrow: present read present [pooled midpoint (comparison)] | 0.556 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present | 0.914 |
| presence color: share of 'present' readings that abstain | 0.094 |
| presence color: share of true 'present' readings that abstain | 0.094 |
| presence color: present read present [pooled midpoint (comparison)] | 0.696 |
| determiner identity (outside FULL when the legend excludes it) | 0.887 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present [pooled midpoint (comparison)] | 1.000 |
| presence name: present read present | 0.907 |
| presence name: share of 'present' readings that abstain | 0.000 |
| presence name: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present [pooled midpoint (comparison)] | 0.918 |
| presence region: present read present | 0.981 |
| presence region: share of 'present' readings that abstain | 0.075 |
| presence region: share of true 'present' readings that abstain | 0.075 |
| presence region: present read present [pooled midpoint (comparison)] | 0.667 |
| presence shape: present read present | 0.900 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.900 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 1.000 |
| presence notcolor: present read present | 1.000 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |
| presence notcolor: present read present [pooled midpoint (comparison)] | 1.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.200 |
| presence landmark2: share of true 'present' readings that abstain | 0.200 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 0.800 |
| presence depth: present read present | 1.000 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence depth: present read present [pooled midpoint (comparison)] | 1.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |

residual mean 0.082; status {'ok': 531, 'abstain': 69}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.451 / 0.338 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 0.979 | 0.355 / 0.097 | 0.95 | 0.014 | 0.047 / 0.008 |
| roles (pooled) | 0.953 | 0.303 / 0.082 | 0.93 | 0.010 | 0.036 / 0.037 |
| role size | 1.000 | 0.301 / 0.181 | 0.97 | 0.000 | 0.032 / 0.000 |
| role relation | 0.988 | 0.274 / 0.102 | 0.94 | 0.000 | 0.048 / 0.012 |
| role landmark | 0.929 | 0.259 / 0.100 | 0.95 | 0.060 | 0.036 / 0.012 |
| role layout | 1.000 | 0.305 / 0.204 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 0.913 | 0.324 / 0.226 | 0.91 | 0.000 | 0.000 / 0.087 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role text | 0.853 | 0.214 / 0.000 | 0.76 | 0.000 | 0.088 / 0.147 |
| role source | 0.988 | 0.238 / 0.097 | 1.00 | 0.012 | 0.000 / 0.000 |
| role target | 1.000 | 0.325 / 0.192 | 1.00 | 0.000 | 0.000 / 0.000 |
| role style | 1.000 | 0.192 / 0.090 | 0.93 | 0.000 | 0.071 / 0.000 |
| role arrow | 0.556 | 0.114 / 0.000 | 0.56 | 0.000 | 0.000 / 0.444 |
| role edge | 1.000 | 0.282 / 0.256 | 1.00 | 0.000 | 0.000 / 0.000 |
| role color | 0.914 | 0.255 / 0.007 | 0.83 | 0.000 | 0.086 / 0.086 |
| role axis | 1.000 | 0.388 / 0.351 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 0.907 | 0.284 / 0.096 | 0.91 | 0.000 | 0.000 / 0.093 |
| role region | 0.981 | 0.248 / 0.060 | 0.91 | 0.000 | 0.074 / 0.019 |
| role shape | 0.900 | 0.287 / 0.224 | 0.90 | 0.000 | 0.000 / 0.100 |
| role pairing | 1.000 | 0.351 / 0.259 | 1.00 | 0.000 | 0.000 / 0.000 |
| role notcolor | 1.000 | 0.350 / 0.217 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.152 / 0.057 | 0.80 | 0.000 | 0.200 / 0.000 |
| role depth | 1.000 | 0.308 / 0.173 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.316 / 0.113 | 1.00 | 0.000 | 0.000 / 0.000 |

### new_identities — catalog candidates (n = 300 of 300)
| axis | accuracy |
|---|---|
| FULL | 0.907 |
| FULL [depth given] | 0.907 |
| FULL [depth and negation given] | 0.907 |
| FULL [pooled midpoint (comparison)] | 0.793 |
| presence object: present read present | 0.973 |
| presence object: share of 'present' readings that abstain | 0.050 |
| presence object: share of true 'present' readings that abstain | 0.050 |
| presence shape: absent read absent | 1.000 |
| presence color: absent read absent | 0.993 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: present read present | 0.974 |
| presence relation: share of 'present' readings that abstain | 0.000 |
| presence relation: share of true 'present' readings that abstain | 0.000 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.026 |
| presence landmark: share of true 'present' readings that abstain | 0.026 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence direction: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| role object | 0.977 |
| head object | 0.980 |
| lexical order head object | 0.767 |
| lexical bag head object | 0.910 |
| occupancy: known filler | 0.982 |
| role shape | 0.997 |
| head shape | 0.997 |
| lexical order head shape | 0.977 |
| lexical bag head shape | 1.000 |
| occupancy: not given | 1.000 |
| role color | 0.987 |
| head color | 0.987 |
| lexical order head color | 0.893 |
| lexical bag head color | 0.957 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.913 |
| lexical bag head size | 0.930 |
| role name | 0.993 |
| head name | 0.993 |
| lexical order head name | 0.917 |
| lexical bag head name | 0.980 |
| role text | 0.983 |
| head text | 0.983 |
| lexical order head text | 0.947 |
| lexical bag head text | 0.997 |
| role relation | 0.997 |
| head relation | 0.997 |
| lexical order head relation | 0.870 |
| lexical bag head relation | 0.947 |
| role landmark | 0.997 |
| head landmark | 1.000 |
| lexical order head landmark | 0.870 |
| lexical bag head landmark | 0.897 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.983 |
| lexical bag head landmark2 | 0.993 |
| role region | 0.997 |
| head region | 0.997 |
| lexical order head region | 0.937 |
| lexical bag head region | 0.943 |
| role direction | 1.000 |
| head direction | 1.000 |
| lexical order head direction | 0.980 |
| lexical bag head direction | 0.993 |
| role amount | 0.987 |
| head amount | 0.987 |
| lexical order head amount | 0.987 |
| lexical bag head amount | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.990 |
| lexical bag head quantity | 1.000 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.983 |
| lexical bag head axis | 1.000 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 0.963 |
| lexical bag head layout | 1.000 |
| role source | 0.990 |
| head source | 1.000 |
| lexical order head source | 0.780 |
| lexical bag head source | 0.940 |
| role target | 1.000 |
| head target | 1.000 |
| lexical order head target | 0.860 |
| lexical bag head target | 0.927 |
| role style | 1.000 |
| head style | 1.000 |
| lexical order head style | 0.957 |
| lexical bag head style | 0.997 |
| role arrow | 0.997 |
| head arrow | 0.997 |
| lexical order head arrow | 0.973 |
| lexical bag head arrow | 0.990 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.947 |
| lexical bag head edge | 0.997 |
| role pairing | 1.000 |
| head pairing | 1.000 |
| lexical order head pairing | 0.947 |
| lexical bag head pairing | 1.000 |
| role notcolor | 0.997 |
| head notcolor | 0.997 |
| lexical order head notcolor | 0.980 |
| lexical bag head notcolor | 0.983 |
| role depth | 1.000 |
| head depth | 1.000 |
| lexical order head depth | 0.977 |
| lexical bag head depth | 1.000 |
| heads FULL (model) | 0.923 |
| heads FULL (lexical order baseline) | 0.240 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.530 |
| role object [pooled midpoint (comparison)] | 0.843 |
| role shape [pooled midpoint (comparison)] | 0.997 |
| role color [pooled midpoint (comparison)] | 0.950 |
| role size [pooled midpoint (comparison)] | 0.993 |
| role name [pooled midpoint (comparison)] | 0.990 |
| role text [pooled midpoint (comparison)] | 0.983 |
| role relation [pooled midpoint (comparison)] | 0.990 |
| role landmark [pooled midpoint (comparison)] | 0.993 |
| role landmark2 [pooled midpoint (comparison)] | 1.000 |
| role region [pooled midpoint (comparison)] | 0.977 |
| role direction [pooled midpoint (comparison)] | 0.993 |
| role amount [pooled midpoint (comparison)] | 0.987 |
| role quantity [pooled midpoint (comparison)] | 1.000 |
| role axis [pooled midpoint (comparison)] | 1.000 |
| role layout [pooled midpoint (comparison)] | 1.000 |
| role source [pooled midpoint (comparison)] | 0.997 |
| role target [pooled midpoint (comparison)] | 1.000 |
| role style [pooled midpoint (comparison)] | 1.000 |
| role arrow [pooled midpoint (comparison)] | 0.997 |
| role edge [pooled midpoint (comparison)] | 1.000 |
| role pairing [pooled midpoint (comparison)] | 1.000 |
| role notcolor [pooled midpoint (comparison)] | 0.997 |
| role depth [pooled midpoint (comparison)] | 1.000 |
| heads FULL (model) [pooled midpoint (comparison)] | 0.803 |
| presence object: present read present [pooled midpoint (comparison)] | 0.805 |
| presence shape: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence color: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence size: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence name: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence text: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: present read present [pooled midpoint (comparison)] | 0.923 |
| presence landmark: present read present [pooled midpoint (comparison)] | 0.974 |
| presence landmark2: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence region: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence direction: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence quantity: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence axis: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence layout: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence target: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence style: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence arrow: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence edge: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence pairing: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence notcolor: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence depth: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence object: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence source: present read present | 1.000 |
| presence source: share of 'present' readings that abstain | 0.015 |
| presence source: share of true 'present' readings that abstain | 0.015 |
| presence target: present read present | 1.000 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.958 |
| presence object: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence relation: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence landmark: absent read absent [pooled midpoint (comparison)] | 1.000 |
| presence source: present read present [pooled midpoint (comparison)] | 1.000 |
| presence target: present read present [pooled midpoint (comparison)] | 1.000 |
| presence style: present read present [pooled midpoint (comparison)] | 1.000 |
| presence edge: present read present [pooled midpoint (comparison)] | 1.000 |
| occupancy: unknown filler | 0.931 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present [pooled midpoint (comparison)] | 0.923 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present [pooled midpoint (comparison)] | 1.000 |
| presence color: present read present | 0.938 |
| presence color: share of 'present' readings that abstain | 0.219 |
| presence color: share of true 'present' readings that abstain | 0.167 |
| presence color: present read present [pooled midpoint (comparison)] | 0.531 |
| presence region: present read present | 0.947 |
| presence region: share of 'present' readings that abstain | 0.167 |
| presence region: share of true 'present' readings that abstain | 0.167 |
| presence region: present read present [pooled midpoint (comparison)] | 0.632 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present [pooled midpoint (comparison)] | 1.000 |
| presence text: present read present | 0.688 |
| presence text: present read present [pooled midpoint (comparison)] | 0.688 |
| presence name: present read present | 0.920 |
| presence name: share of 'present' readings that abstain | 0.043 |
| presence name: share of true 'present' readings that abstain | 0.043 |
| presence name: present read present [pooled midpoint (comparison)] | 1.000 |
| presence depth: present read present | 1.000 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence depth: present read present [pooled midpoint (comparison)] | 1.000 |
| presence arrow: present read present | 0.875 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present [pooled midpoint (comparison)] | 0.875 |
| presence shape: present read present | 0.857 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence shape: present read present [pooled midpoint (comparison)] | 0.857 |
| presence text: share of 'present' readings that abstain | 0.000 |
| presence text: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence pairing: present read present [pooled midpoint (comparison)] | 1.000 |
| presence direction: present read present | 1.000 |
| presence direction: share of 'present' readings that abstain | 0.000 |
| presence direction: share of true 'present' readings that abstain | 0.000 |
| presence direction: present read present [pooled midpoint (comparison)] | 0.667 |
| presence notcolor: present read present | 0.833 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |
| presence notcolor: present read present [pooled midpoint (comparison)] | 0.833 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence layout: present read present [pooled midpoint (comparison)] | 1.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present [pooled midpoint (comparison)] | 1.000 |
| presence color: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.107; status {'ok': 268, 'abstain': 32}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.478 / 0.353 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 0.969 | 0.349 / 0.062 | 0.92 | 0.004 | 0.049 / 0.027 |
| roles (pooled) | 0.954 | 0.303 / 0.070 | 0.93 | 0.008 | 0.035 / 0.038 |
| role relation | 0.974 | 0.284 / 0.178 | 0.97 | 0.000 | 0.000 / 0.026 |
| role landmark | 0.974 | 0.246 / 0.123 | 0.97 | 0.026 | 0.026 / 0.000 |
| role source | 0.955 | 0.314 / 0.113 | 0.98 | 0.045 | 0.015 / 0.000 |
| role target | 1.000 | 0.307 / 0.157 | 1.00 | 0.000 | 0.000 / 0.000 |
| role style | 1.000 | 0.227 / 0.113 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.297 / 0.261 | 1.00 | 0.000 | 0.000 / 0.000 |
| role size | 1.000 | 0.335 / 0.242 | 1.00 | 0.000 | 0.000 / 0.000 |
| role landmark2 | 1.000 | 0.171 / 0.092 | 1.00 | 0.000 | 0.000 / 0.000 |
| role color | 0.938 | 0.216 / 0.007 | 0.78 | 0.000 | 0.156 / 0.062 |
| role region | 0.947 | 0.226 / 0.018 | 0.79 | 0.000 | 0.158 / 0.053 |
| role quantity | 1.000 | 0.130 / 0.069 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 0.688 | 0.198 / 0.000 | 0.69 | 0.000 | 0.000 / 0.312 |
| role name | 0.920 | 0.269 / 0.084 | 0.88 | 0.000 | 0.040 / 0.080 |
| role depth | 1.000 | 0.324 / 0.180 | 1.00 | 0.000 | 0.000 / 0.000 |
| role arrow | 0.875 | 0.200 / 0.107 | 0.88 | 0.000 | 0.000 / 0.125 |
| role shape | 0.857 | 0.307 / 0.191 | 0.86 | 0.000 | 0.000 / 0.143 |
| role pairing | 1.000 | 0.328 / 0.258 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 1.000 | 0.303 / 0.161 | 1.00 | 0.000 | 0.000 / 0.000 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role notcolor | 0.833 | 0.338 / 0.147 | 0.83 | 0.000 | 0.000 / 0.167 |
| role layout | 1.000 | 0.397 / 0.340 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.399 / 0.368 | 1.00 | 0.000 | 0.000 / 0.000 |

### train (sample) — catalog candidates (n = 300 of 7273)
| axis | accuracy |
|---|---|
| FULL | 0.937 |
| FULL [depth given] | 0.937 |
| FULL [depth and negation given] | 0.937 |
| presence object: present read present | 0.996 |
| presence object: share of 'present' readings that abstain | 0.051 |
| presence object: share of true 'present' readings that abstain | 0.051 |
| presence shape: absent read absent | 1.000 |
| presence color: present read present | 0.971 |
| presence color: share of 'present' readings that abstain | 0.088 |
| presence color: share of true 'present' readings that abstain | 0.061 |
| presence size: absent read absent | 1.000 |
| presence name: absent read absent | 1.000 |
| presence text: absent read absent | 1.000 |
| presence relation: absent read absent | 1.000 |
| presence landmark: absent read absent | 1.000 |
| presence landmark2: absent read absent | 1.000 |
| presence region: absent read absent | 1.000 |
| presence direction: absent read absent | 1.000 |
| presence quantity: absent read absent | 1.000 |
| presence axis: absent read absent | 1.000 |
| presence layout: absent read absent | 1.000 |
| presence source: absent read absent | 1.000 |
| presence target: absent read absent | 1.000 |
| presence style: absent read absent | 1.000 |
| presence arrow: absent read absent | 1.000 |
| presence edge: absent read absent | 1.000 |
| presence pairing: absent read absent | 1.000 |
| presence notcolor: absent read absent | 1.000 |
| presence depth: absent read absent | 1.000 |
| structure (depth, negation) | 1.000 |
| depth estimate: fit (check) | 1.000 |
| predicate (surface lemma) | 1.000 |
| event type (synonym table) | 1.000 |
| role object | 0.977 |
| head object | 0.997 |
| lexical order head object | 0.803 |
| lexical bag head object | 0.930 |
| occupancy: known filler | 0.986 |
| role shape | 1.000 |
| head shape | 1.000 |
| lexical order head shape | 0.987 |
| lexical bag head shape | 1.000 |
| occupancy: not given | 1.000 |
| role color | 0.993 |
| head color | 0.993 |
| lexical order head color | 0.887 |
| lexical bag head color | 0.960 |
| role size | 1.000 |
| head size | 1.000 |
| lexical order head size | 0.923 |
| lexical bag head size | 0.947 |
| role name | 0.997 |
| head name | 0.997 |
| lexical order head name | 0.933 |
| lexical bag head name | 0.983 |
| role text | 0.997 |
| head text | 0.997 |
| lexical order head text | 0.953 |
| lexical bag head text | 1.000 |
| role relation | 1.000 |
| head relation | 1.000 |
| lexical order head relation | 0.827 |
| lexical bag head relation | 0.910 |
| role landmark | 0.993 |
| head landmark | 1.000 |
| lexical order head landmark | 0.827 |
| lexical bag head landmark | 0.837 |
| role landmark2 | 1.000 |
| head landmark2 | 1.000 |
| lexical order head landmark2 | 0.987 |
| lexical bag head landmark2 | 0.997 |
| role region | 1.000 |
| head region | 1.000 |
| lexical order head region | 0.940 |
| lexical bag head region | 0.943 |
| role direction | 0.997 |
| head direction | 0.997 |
| lexical order head direction | 0.970 |
| lexical bag head direction | 0.980 |
| role amount | 0.990 |
| head amount | 0.990 |
| lexical order head amount | 0.990 |
| lexical bag head amount | 1.000 |
| role quantity | 1.000 |
| head quantity | 1.000 |
| lexical order head quantity | 0.977 |
| lexical bag head quantity | 1.000 |
| role axis | 1.000 |
| head axis | 1.000 |
| lexical order head axis | 0.980 |
| lexical bag head axis | 1.000 |
| role layout | 1.000 |
| head layout | 1.000 |
| lexical order head layout | 0.980 |
| lexical bag head layout | 1.000 |
| role source | 1.000 |
| head source | 1.000 |
| lexical order head source | 0.810 |
| lexical bag head source | 0.943 |
| role target | 0.997 |
| head target | 1.000 |
| lexical order head target | 0.847 |
| lexical bag head target | 0.923 |
| role style | 1.000 |
| head style | 1.000 |
| lexical order head style | 0.970 |
| lexical bag head style | 1.000 |
| role arrow | 0.997 |
| head arrow | 0.997 |
| lexical order head arrow | 0.990 |
| lexical bag head arrow | 0.997 |
| role edge | 1.000 |
| head edge | 1.000 |
| lexical order head edge | 0.937 |
| lexical bag head edge | 1.000 |
| role pairing | 1.000 |
| head pairing | 1.000 |
| lexical order head pairing | 0.970 |
| lexical bag head pairing | 1.000 |
| role notcolor | 1.000 |
| head notcolor | 1.000 |
| lexical order head notcolor | 0.973 |
| lexical bag head notcolor | 0.983 |
| role depth | 1.000 |
| head depth | 1.000 |
| lexical order head depth | 0.987 |
| lexical bag head depth | 1.000 |
| heads FULL (model) | 0.967 |
| heads FULL (lexical order baseline) | 0.223 |
| heads FULL (lexical bag baseline, trained on the same training rows) | 0.567 |
| presence color: absent read absent | 0.996 |
| presence object: absent read absent | 1.000 |
| presence source: present read present | 1.000 |
| presence source: share of 'present' readings that abstain | 0.000 |
| presence source: share of true 'present' readings that abstain | 0.000 |
| presence target: present read present | 1.000 |
| presence target: share of 'present' readings that abstain | 0.000 |
| presence target: share of true 'present' readings that abstain | 0.000 |
| presence size: present read present | 1.000 |
| presence size: share of 'present' readings that abstain | 0.000 |
| presence size: share of true 'present' readings that abstain | 0.000 |
| determiner identity (outside FULL when the legend excludes it) | 0.864 |
| presence direction: present read present | 0.889 |
| presence direction: share of 'present' readings that abstain | 0.250 |
| presence direction: share of true 'present' readings that abstain | 0.250 |
| presence relation: present read present | 1.000 |
| presence relation: share of 'present' readings that abstain | 0.019 |
| presence relation: share of true 'present' readings that abstain | 0.019 |
| presence landmark: present read present | 1.000 |
| presence landmark: share of 'present' readings that abstain | 0.058 |
| presence landmark: share of true 'present' readings that abstain | 0.058 |
| presence layout: present read present | 1.000 |
| presence layout: share of 'present' readings that abstain | 0.000 |
| presence layout: share of true 'present' readings that abstain | 0.000 |
| presence name: present read present | 0.950 |
| presence name: share of 'present' readings that abstain | 0.158 |
| presence name: share of true 'present' readings that abstain | 0.158 |
| presence pairing: present read present | 1.000 |
| presence pairing: share of 'present' readings that abstain | 0.000 |
| presence pairing: share of true 'present' readings that abstain | 0.000 |
| presence notcolor: present read present | 1.000 |
| presence notcolor: share of 'present' readings that abstain | 0.000 |
| presence notcolor: share of true 'present' readings that abstain | 0.000 |
| presence style: present read present | 1.000 |
| presence style: share of 'present' readings that abstain | 0.000 |
| presence style: share of true 'present' readings that abstain | 0.000 |
| presence edge: present read present | 1.000 |
| presence edge: share of 'present' readings that abstain | 0.000 |
| presence edge: share of true 'present' readings that abstain | 0.000 |
| presence text: present read present | 0.929 |
| presence text: share of 'present' readings that abstain | 0.154 |
| presence text: share of true 'present' readings that abstain | 0.154 |
| presence shape: present read present | 1.000 |
| presence shape: share of 'present' readings that abstain | 0.000 |
| presence shape: share of true 'present' readings that abstain | 0.000 |
| presence region: present read present | 1.000 |
| presence region: share of 'present' readings that abstain | 0.000 |
| presence region: share of true 'present' readings that abstain | 0.000 |
| presence quantity: present read present | 1.000 |
| presence quantity: share of 'present' readings that abstain | 0.000 |
| presence quantity: share of true 'present' readings that abstain | 0.000 |
| presence depth: present read present | 1.000 |
| presence depth: share of 'present' readings that abstain | 0.000 |
| presence depth: share of true 'present' readings that abstain | 0.000 |
| presence axis: present read present | 1.000 |
| presence axis: share of 'present' readings that abstain | 0.000 |
| presence axis: share of true 'present' readings that abstain | 0.000 |
| presence arrow: present read present | 0.667 |
| presence arrow: share of 'present' readings that abstain | 0.000 |
| presence arrow: share of true 'present' readings that abstain | 0.000 |
| presence landmark2: present read present | 1.000 |
| presence landmark2: share of 'present' readings that abstain | 0.000 |
| presence landmark2: share of true 'present' readings that abstain | 0.000 |
| presence color: share of FALSE 'present' readings that abstain | 1.000 |

residual mean 0.055; status {'ok': 269, 'abstain': 31}

| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |
|---|---|---|---|---|---|
| predicate | 1.000 | 0.470 / 0.354 | 1.00 | 0.000 | 0.000 / 0.000 |
| role object | 0.970 | 0.367 / 0.099 | 0.94 | 0.026 | 0.051 / 0.004 |
| roles (pooled) | 0.972 | 0.322 / 0.110 | 0.95 | 0.014 | 0.039 / 0.014 |
| role color | 0.971 | 0.272 / 0.067 | 0.91 | 0.000 | 0.059 / 0.029 |
| role source | 1.000 | 0.281 / 0.127 | 1.00 | 0.000 | 0.000 / 0.000 |
| role target | 0.978 | 0.322 / 0.197 | 1.00 | 0.022 | 0.000 / 0.000 |
| role size | 1.000 | 0.339 / 0.224 | 1.00 | 0.000 | 0.000 / 0.000 |
| role direction | 0.889 | 0.241 / 0.019 | 0.67 | 0.000 | 0.222 / 0.111 |
| role relation | 1.000 | 0.308 / 0.121 | 0.98 | 0.000 | 0.019 / 0.000 |
| role landmark | 0.962 | 0.278 / 0.149 | 0.94 | 0.038 | 0.058 / 0.000 |
| role layout | 1.000 | 0.430 / 0.368 | 1.00 | 0.000 | 0.000 / 0.000 |
| role name | 0.950 | 0.244 / 0.027 | 0.80 | 0.000 | 0.150 / 0.050 |
| role amount | 0.000 | 0.000 / 0.000 | 0.00 | 0.000 | 0.000 / 1.000 |
| role pairing | 1.000 | 0.340 / 0.315 | 1.00 | 0.000 | 0.000 / 0.000 |
| role notcolor | 1.000 | 0.357 / 0.250 | 1.00 | 0.000 | 0.000 / 0.000 |
| role style | 1.000 | 0.237 / 0.132 | 1.00 | 0.000 | 0.000 / 0.000 |
| role edge | 1.000 | 0.306 / 0.270 | 1.00 | 0.000 | 0.000 / 0.000 |
| role text | 0.929 | 0.264 / 0.036 | 0.79 | 0.000 | 0.143 / 0.071 |
| role shape | 1.000 | 0.323 / 0.280 | 1.00 | 0.000 | 0.000 / 0.000 |
| role region | 1.000 | 0.347 / 0.239 | 1.00 | 0.000 | 0.000 / 0.000 |
| role quantity | 1.000 | 0.304 / 0.170 | 1.00 | 0.000 | 0.000 / 0.000 |
| role depth | 1.000 | 0.405 / 0.372 | 1.00 | 0.000 | 0.000 / 0.000 |
| role axis | 1.000 | 0.426 / 0.384 | 1.00 | 0.000 | 0.000 / 0.000 |
| role arrow | 0.667 | 0.194 / 0.048 | 0.67 | 0.000 | 0.000 / 0.333 |
| role landmark2 | 1.000 | 0.150 / 0.095 | 1.00 | 0.000 | 0.000 / 0.000 |

## Gates (seed 0; OPEN > 0.5)
,=1.00 and=1.00 as=1.00 at=1.00 by=1.00 from=1.00 in=1.00 into=1.00 labeled=1.00 named=1.00 of=1.00 on=1.00 to=1.00 with=1.00 PAIR=1.00 VERB=0.99 REL=0.99 LAYOUT=0.98 NOTCOLOR=0.95 AXIS=0.92 canvas=0.76 rules=0.62 REGION=0.61 EDGE=0.59 TEXT=0.58 DIR=0.54 SIZE=0.53 DEPTH=0.48 ?=0.46 px=0.41 NAME=0.40 times=0.28 there=0.20 !=0.12 1=0.12 copies=0.12 default=0.12 does=0.12 for=0.12 has=0.12 i=0.12 me=0.12 new=0.12 now=0.12 one=0.12 says=0.12 that=0.12 this=0.12 unknown=0.12 evenly=0.05 should=0.04 SHAPE=0.03 say=0.02 be=0.02 ARROW=0.01 we=0.01 STYLE=0.01 .=0.01 do=0.01 PRON=0.01 have=0.01 are=0.00 NUM=0.00 RECENT=0.00 COLOR=0.00 a=0.00 the=0.00 QUANT=0.00

## What is weak, what to add
- heldout_formulations: FULL 0.894
- heldout_formulations: heads FULL (lexical order baseline) 0.121
- heldout_formulations: heads FULL (lexical bag baseline, trained on the same training rows) 0.489
- heldout_formulations: FULL [depth given] 0.894
- heldout_formulations: FULL [depth and negation given] 0.894
- heldout_formulations: FULL [pooled midpoint (comparison)] 0.794
- heldout_formulations: role object [pooled midpoint (comparison)] 0.858
- heldout_formulations: heads FULL (model) [pooled midpoint (comparison)] 0.865
- heldout_formulations: presence source: share of 'present' readings that abstain 0.048
- heldout_formulations: presence source: share of true 'present' readings that abstain 0.048
- heldout_formulations: presence target: share of 'present' readings that abstain 0.000
- heldout_formulations: presence target: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of 'present' readings that abstain 0.000
- heldout_formulations: presence style: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: present read present 0.750
- heldout_formulations: presence arrow: share of 'present' readings that abstain 0.000
- heldout_formulations: presence arrow: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of 'present' readings that abstain 0.000
- heldout_formulations: presence edge: share of true 'present' readings that abstain 0.000
- heldout_formulations: determiner identity (outside FULL when the legend excludes it) 0.700
- heldout_formulations: presence arrow: present read present [pooled midpoint (comparison)] 0.750
- heldout_formulations: presence object: share of 'present' readings that abstain 0.053
- heldout_formulations: presence object: share of true 'present' readings that abstain 0.053
- heldout_formulations: presence axis: share of 'present' readings that abstain 0.000
- heldout_formulations: presence axis: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of 'present' readings that abstain 0.000
- heldout_formulations: presence size: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence name: present read present 0.846
- heldout_formulations: presence name: share of 'present' readings that abstain 0.091
- heldout_formulations: presence name: share of true 'present' readings that abstain 0.091
- heldout_formulations: presence text: share of 'present' readings that abstain 0.000
- heldout_formulations: presence text: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of 'present' readings that abstain 0.000
- heldout_formulations: presence relation: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence landmark: share of 'present' readings that abstain 0.087
- heldout_formulations: presence landmark: share of true 'present' readings that abstain 0.087
- heldout_formulations: presence relation: present read present [pooled midpoint (comparison)] 0.783
- heldout_formulations: presence landmark: present read present [pooled midpoint (comparison)] 0.870
- heldout_formulations: presence region: share of 'present' readings that abstain 0.143
- heldout_formulations: presence region: share of true 'present' readings that abstain 0.143
- heldout_formulations: presence region: present read present [pooled midpoint (comparison)] 0.714
- heldout_formulations: presence pairing: share of 'present' readings that abstain 0.000
- heldout_formulations: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence depth: share of 'present' readings that abstain 0.000
- heldout_formulations: presence depth: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of 'present' readings that abstain 0.000
- heldout_formulations: presence color: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence color: present read present [pooled midpoint (comparison)] 0.812
- heldout_formulations: presence notcolor: share of 'present' readings that abstain 0.000
- heldout_formulations: presence notcolor: share of true 'present' readings that abstain 0.000
- heldout_formulations: presence quantity: share of 'present' readings that abstain 0.125
- heldout_formulations: presence quantity: share of true 'present' readings that abstain 0.125
- heldout_formulations: presence quantity: present read present [pooled midpoint (comparison)] 0.875
- heldout_formulations: presence landmark2: share of 'present' readings that abstain 0.000
- heldout_formulations: presence landmark2: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence object: share of 'present' readings that abstain 0.047
- heldout_sentences: presence object: share of true 'present' readings that abstain 0.047
- heldout_sentences: presence size: share of 'present' readings that abstain 0.032
- heldout_sentences: presence size: share of true 'present' readings that abstain 0.032
- heldout_sentences: presence relation: share of 'present' readings that abstain 0.048
- heldout_sentences: presence relation: share of true 'present' readings that abstain 0.048
- heldout_sentences: presence landmark: share of 'present' readings that abstain 0.036
- heldout_sentences: presence landmark: share of true 'present' readings that abstain 0.036
- heldout_sentences: heads FULL (lexical order baseline) 0.207
- heldout_sentences: heads FULL (lexical bag baseline, trained on the same training rows) 0.580
- heldout_sentences: FULL [pooled midpoint (comparison)] 0.742
- heldout_sentences: role object [pooled midpoint (comparison)] 0.825
- heldout_sentences: heads FULL (model) [pooled midpoint (comparison)] 0.760
- heldout_sentences: presence object: present read present [pooled midpoint (comparison)] 0.821
- heldout_sentences: presence size: present read present [pooled midpoint (comparison)] 0.841
- heldout_sentences: presence relation: present read present [pooled midpoint (comparison)] 0.807
- heldout_sentences: presence landmark: present read present [pooled midpoint (comparison)] 0.880
- heldout_sentences: presence layout: share of 'present' readings that abstain 0.000
- heldout_sentences: presence layout: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence direction: share of 'present' readings that abstain 0.000
- heldout_sentences: presence direction: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence direction: present read present [pooled midpoint (comparison)] 0.870
- heldout_sentences: presence text: present read present 0.853
- heldout_sentences: presence text: share of 'present' readings that abstain 0.103
- heldout_sentences: presence text: share of true 'present' readings that abstain 0.103
- heldout_sentences: presence source: share of 'present' readings that abstain 0.000
- heldout_sentences: presence source: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence target: share of 'present' readings that abstain 0.000
- heldout_sentences: presence target: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence style: share of 'present' readings that abstain 0.071
- heldout_sentences: presence style: share of true 'present' readings that abstain 0.071
- heldout_sentences: presence arrow: present read present 0.556
- heldout_sentences: presence edge: share of 'present' readings that abstain 0.000
- heldout_sentences: presence edge: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence text: present read present [pooled midpoint (comparison)] 0.735
- heldout_sentences: presence arrow: present read present [pooled midpoint (comparison)] 0.556
- heldout_sentences: presence color: share of 'present' readings that abstain 0.094
- heldout_sentences: presence color: share of true 'present' readings that abstain 0.094
- heldout_sentences: presence color: present read present [pooled midpoint (comparison)] 0.696
- heldout_sentences: determiner identity (outside FULL when the legend excludes it) 0.887
- heldout_sentences: presence axis: share of 'present' readings that abstain 0.000
- heldout_sentences: presence axis: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence name: share of 'present' readings that abstain 0.000
- heldout_sentences: presence name: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence region: share of 'present' readings that abstain 0.075
- heldout_sentences: presence region: share of true 'present' readings that abstain 0.075
- heldout_sentences: presence region: present read present [pooled midpoint (comparison)] 0.667
- heldout_sentences: presence shape: share of 'present' readings that abstain 0.000
- heldout_sentences: presence shape: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence arrow: share of 'present' readings that abstain 0.000
- heldout_sentences: presence arrow: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: share of 'present' readings that abstain 0.000
- heldout_sentences: presence pairing: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence notcolor: share of 'present' readings that abstain 0.000
- heldout_sentences: presence notcolor: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence landmark2: share of 'present' readings that abstain 0.200
- heldout_sentences: presence landmark2: share of true 'present' readings that abstain 0.200
- heldout_sentences: presence landmark2: present read present [pooled midpoint (comparison)] 0.800
- heldout_sentences: presence depth: share of 'present' readings that abstain 0.000
- heldout_sentences: presence depth: share of true 'present' readings that abstain 0.000
- heldout_sentences: presence quantity: share of 'present' readings that abstain 0.000
- heldout_sentences: presence quantity: share of true 'present' readings that abstain 0.000
- new_identities: presence object: share of 'present' readings that abstain 0.050
- new_identities: presence object: share of true 'present' readings that abstain 0.050
- new_identities: presence relation: share of 'present' readings that abstain 0.000
- new_identities: presence relation: share of true 'present' readings that abstain 0.000
- new_identities: presence landmark: share of 'present' readings that abstain 0.026
- new_identities: presence landmark: share of true 'present' readings that abstain 0.026
- new_identities: heads FULL (lexical order baseline) 0.240
- new_identities: heads FULL (lexical bag baseline, trained on the same training rows) 0.530
- new_identities: FULL [pooled midpoint (comparison)] 0.793
- new_identities: role object [pooled midpoint (comparison)] 0.843
- new_identities: heads FULL (model) [pooled midpoint (comparison)] 0.803
- new_identities: presence object: present read present [pooled midpoint (comparison)] 0.805
- new_identities: presence source: share of 'present' readings that abstain 0.015
- new_identities: presence source: share of true 'present' readings that abstain 0.015
- new_identities: presence target: share of 'present' readings that abstain 0.000
- new_identities: presence target: share of true 'present' readings that abstain 0.000
- new_identities: presence style: share of 'present' readings that abstain 0.000
- new_identities: presence style: share of true 'present' readings that abstain 0.000
- new_identities: presence edge: share of 'present' readings that abstain 0.000
- new_identities: presence edge: share of true 'present' readings that abstain 0.000
- new_identities: presence size: share of 'present' readings that abstain 0.000
- new_identities: presence size: share of true 'present' readings that abstain 0.000
- new_identities: presence landmark2: share of 'present' readings that abstain 0.000
- new_identities: presence landmark2: share of true 'present' readings that abstain 0.000
- new_identities: presence color: share of 'present' readings that abstain 0.219
- new_identities: presence color: share of true 'present' readings that abstain 0.167
- new_identities: presence color: present read present [pooled midpoint (comparison)] 0.531
- new_identities: presence region: share of 'present' readings that abstain 0.167
- new_identities: presence region: share of true 'present' readings that abstain 0.167
- new_identities: presence region: present read present [pooled midpoint (comparison)] 0.632
- new_identities: presence quantity: share of 'present' readings that abstain 0.000
- new_identities: presence quantity: share of true 'present' readings that abstain 0.000
- new_identities: presence text: present read present 0.688
- new_identities: presence text: present read present [pooled midpoint (comparison)] 0.688
- new_identities: presence name: share of 'present' readings that abstain 0.043
- new_identities: presence name: share of true 'present' readings that abstain 0.043
- new_identities: presence depth: share of 'present' readings that abstain 0.000
- new_identities: presence depth: share of true 'present' readings that abstain 0.000
- new_identities: presence arrow: present read present 0.875
- new_identities: presence arrow: share of 'present' readings that abstain 0.000
- new_identities: presence arrow: share of true 'present' readings that abstain 0.000
- new_identities: presence arrow: present read present [pooled midpoint (comparison)] 0.875
- new_identities: presence shape: present read present 0.857
- new_identities: presence shape: share of 'present' readings that abstain 0.000
- new_identities: presence shape: share of true 'present' readings that abstain 0.000
- new_identities: presence shape: present read present [pooled midpoint (comparison)] 0.857
- new_identities: presence text: share of 'present' readings that abstain 0.000
- new_identities: presence text: share of true 'present' readings that abstain 0.000
- new_identities: presence pairing: share of 'present' readings that abstain 0.000
- new_identities: presence pairing: share of true 'present' readings that abstain 0.000
- new_identities: presence direction: share of 'present' readings that abstain 0.000
- new_identities: presence direction: share of true 'present' readings that abstain 0.000
- new_identities: presence direction: present read present [pooled midpoint (comparison)] 0.667
- new_identities: presence notcolor: present read present 0.833
- new_identities: presence notcolor: share of 'present' readings that abstain 0.000
- new_identities: presence notcolor: share of true 'present' readings that abstain 0.000
- new_identities: presence notcolor: present read present [pooled midpoint (comparison)] 0.833
- new_identities: presence layout: share of 'present' readings that abstain 0.000
- new_identities: presence layout: share of true 'present' readings that abstain 0.000
- new_identities: presence axis: share of 'present' readings that abstain 0.000
- new_identities: presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence object: share of 'present' readings that abstain 0.051
- train (sample): presence object: share of true 'present' readings that abstain 0.051
- train (sample): presence color: share of 'present' readings that abstain 0.088
- train (sample): presence color: share of true 'present' readings that abstain 0.061
- train (sample): heads FULL (lexical order baseline) 0.223
- train (sample): heads FULL (lexical bag baseline, trained on the same training rows) 0.567
- train (sample): presence source: share of 'present' readings that abstain 0.000
- train (sample): presence source: share of true 'present' readings that abstain 0.000
- train (sample): presence target: share of 'present' readings that abstain 0.000
- train (sample): presence target: share of true 'present' readings that abstain 0.000
- train (sample): presence size: share of 'present' readings that abstain 0.000
- train (sample): presence size: share of true 'present' readings that abstain 0.000
- train (sample): determiner identity (outside FULL when the legend excludes it) 0.864
- train (sample): presence direction: present read present 0.889
- train (sample): presence direction: share of 'present' readings that abstain 0.250
- train (sample): presence direction: share of true 'present' readings that abstain 0.250
- train (sample): presence relation: share of 'present' readings that abstain 0.019
- train (sample): presence relation: share of true 'present' readings that abstain 0.019
- train (sample): presence landmark: share of 'present' readings that abstain 0.058
- train (sample): presence landmark: share of true 'present' readings that abstain 0.058
- train (sample): presence layout: share of 'present' readings that abstain 0.000
- train (sample): presence layout: share of true 'present' readings that abstain 0.000
- train (sample): presence name: share of 'present' readings that abstain 0.158
- train (sample): presence name: share of true 'present' readings that abstain 0.158
- train (sample): presence pairing: share of 'present' readings that abstain 0.000
- train (sample): presence pairing: share of true 'present' readings that abstain 0.000
- train (sample): presence notcolor: share of 'present' readings that abstain 0.000
- train (sample): presence notcolor: share of true 'present' readings that abstain 0.000
- train (sample): presence style: share of 'present' readings that abstain 0.000
- train (sample): presence style: share of true 'present' readings that abstain 0.000
- train (sample): presence edge: share of 'present' readings that abstain 0.000
- train (sample): presence edge: share of true 'present' readings that abstain 0.000
- train (sample): presence text: share of 'present' readings that abstain 0.154
- train (sample): presence text: share of true 'present' readings that abstain 0.154
- train (sample): presence shape: share of 'present' readings that abstain 0.000
- train (sample): presence shape: share of true 'present' readings that abstain 0.000
- train (sample): presence region: share of 'present' readings that abstain 0.000
- train (sample): presence region: share of true 'present' readings that abstain 0.000
- train (sample): presence quantity: share of 'present' readings that abstain 0.000
- train (sample): presence quantity: share of true 'present' readings that abstain 0.000
- train (sample): presence depth: share of 'present' readings that abstain 0.000
- train (sample): presence depth: share of true 'present' readings that abstain 0.000
- train (sample): presence axis: share of 'present' readings that abstain 0.000
- train (sample): presence axis: share of true 'present' readings that abstain 0.000
- train (sample): presence arrow: present read present 0.667
- train (sample): presence arrow: share of 'present' readings that abstain 0.000
- train (sample): presence arrow: share of true 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of 'present' readings that abstain 0.000
- train (sample): presence landmark2: share of true 'present' readings that abstain 0.000

Formulations with the lowest FULL on the held-out splits (add examples of these formulations):
- heldout_formulations: `NAME is COLOR` FULL 0.000 (n 7)
- heldout_sentences: `move NAME DIR by NUM px` FULL 0.000 (n 5)
- heldout_sentences: `rename NAME NAME` FULL 0.000 (n 5)
- new_identities: `label NAME TEXT` FULL 0.000 (n 5)
- heldout_sentences: `move PRON DIR by NUM px` FULL 0.000 (n 4)
- heldout_sentences: `move NAME DIR by NUM px .` FULL 0.000 (n 4)
- heldout_sentences: `NAME is COLOR .` FULL 0.000 (n 4)
- new_identities: `move NAME DIR by NUM px` FULL 0.000 (n 3)

- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.

## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)
The PRODUCT number comes first: the product readout decides presence (a role missing from the text reads "not given"; `_empty` is the product), with the thresholds of model/config.json (set on training rows + the calibration half of the held-out formulations). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to the product, never a default. Catalog candidates.

| split | readout | heads FULL | FULL | role object | role shape | role color | role size | role name | role text | role relation | role landmark | role landmark2 | role region | role direction | role amount | role quantity | role axis | role layout | role source | role target | role style | role arrow | role edge | role pairing | role notcolor | role depth |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| heldout_formulations | product readout: presence decided | 0.965 | 0.894 | 0.943 | 1.000 | 1.000 | 1.000 | 0.979 | 1.000 | 0.993 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.979 | 0.993 | 0.993 | 1.000 | 1.000 | 1.000 | 1.000 |
| heldout_formulations | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | 0.865 | 0.794 | 0.858 | 1.000 | 0.979 | 0.993 | 0.972 | 1.000 | 0.965 | 0.979 | 1.000 | 0.986 | 1.000 | 1.000 | 0.993 | 1.000 | 1.000 | 1.000 | 0.979 | 1.000 | 0.993 | 1.000 | 1.000 | 1.000 | 1.000 |
| heldout_formulations | v16 protocol: every role read, not available to the product | 0.993 | 0.922 | 0.950 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 | 0.979 | 1.000 | 0.993 | 1.000 | 1.000 | 1.000 | 1.000 |

## Presence per role (judgment 752853c §2)
Product readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.

| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |
|---|---|---|---|---|---|---|
| heldout_formulations | object | product: fitted | 1.000 | 1.000 | 1.000 | 0.053 (— / 0.053) |
| heldout_formulations | object | comparison: pooled midpoint | 0.901 | 1.000 | 0.951 |  |
| heldout_formulations | shape | product: fitted | — | 1.000 | — |  |
| heldout_formulations | shape | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | color | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | color | comparison: pooled midpoint | 0.812 | 1.000 | 0.906 |  |
| heldout_formulations | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | size | comparison: pooled midpoint | 0.909 | 1.000 | 0.955 |  |
| heldout_formulations | name | product: fitted | 0.846 | 1.000 | 0.923 | 0.091 (— / 0.091) |
| heldout_formulations | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | text | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | text | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | relation | product: fitted | 0.957 | 1.000 | 0.978 | 0.000 (— / 0.000) |
| heldout_formulations | relation | comparison: pooled midpoint | 0.783 | 1.000 | 0.891 |  |
| heldout_formulations | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.087 (— / 0.087) |
| heldout_formulations | landmark | comparison: pooled midpoint | 0.870 | 1.000 | 0.935 |  |
| heldout_formulations | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.143 (— / 0.143) |
| heldout_formulations | region | comparison: pooled midpoint | 0.714 | 1.000 | 0.857 |  |
| heldout_formulations | direction | product: fitted | — | 1.000 | — |  |
| heldout_formulations | direction | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.125 (— / 0.125) |
| heldout_formulations | quantity | comparison: pooled midpoint | 0.875 | 1.000 | 0.938 |  |
| heldout_formulations | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | layout | product: fitted | — | 1.000 | — |  |
| heldout_formulations | layout | comparison: pooled midpoint | — | 1.000 | — |  |
| heldout_formulations | source | product: fitted | 1.000 | 1.000 | 1.000 | 0.048 (— / 0.048) |
| heldout_formulations | source | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | target | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | target | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | style | product: fitted | 0.933 | 1.000 | 0.967 | 0.000 (— / 0.000) |
| heldout_formulations | style | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | arrow | product: fitted | 0.750 | 1.000 | 0.875 | 0.000 (— / 0.000) |
| heldout_formulations | arrow | comparison: pooled midpoint | 0.750 | 1.000 | 0.875 |  |
| heldout_formulations | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | pairing | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | notcolor | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | notcolor | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_formulations | depth | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_formulations | depth | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | object | product: fitted | 0.992 | 1.000 | 0.996 | 0.047 (— / 0.047) |
| heldout_sentences | object | comparison: pooled midpoint | 0.821 | 1.000 | 0.910 |  |
| heldout_sentences | shape | product: fitted | 0.900 | 1.000 | 0.950 | 0.000 (— / 0.000) |
| heldout_sentences | shape | comparison: pooled midpoint | 0.900 | 1.000 | 0.950 |  |
| heldout_sentences | color | product: fitted | 0.914 | 1.000 | 0.957 | 0.094 (— / 0.094) |
| heldout_sentences | color | comparison: pooled midpoint | 0.696 | 1.000 | 0.848 |  |
| heldout_sentences | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.032 (— / 0.032) |
| heldout_sentences | size | comparison: pooled midpoint | 0.841 | 1.000 | 0.921 |  |
| heldout_sentences | name | product: fitted | 0.907 | 1.000 | 0.954 | 0.000 (— / 0.000) |
| heldout_sentences | name | comparison: pooled midpoint | 0.918 | 1.000 | 0.959 |  |
| heldout_sentences | text | product: fitted | 0.853 | 1.000 | 0.926 | 0.103 (— / 0.103) |
| heldout_sentences | text | comparison: pooled midpoint | 0.735 | 1.000 | 0.868 |  |
| heldout_sentences | relation | product: fitted | 0.988 | 1.000 | 0.994 | 0.048 (— / 0.048) |
| heldout_sentences | relation | comparison: pooled midpoint | 0.807 | 1.000 | 0.904 |  |
| heldout_sentences | landmark | product: fitted | 0.988 | 1.000 | 0.994 | 0.036 (— / 0.036) |
| heldout_sentences | landmark | comparison: pooled midpoint | 0.880 | 1.000 | 0.940 |  |
| heldout_sentences | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.200 (— / 0.200) |
| heldout_sentences | landmark2 | comparison: pooled midpoint | 0.800 | 1.000 | 0.900 |  |
| heldout_sentences | region | product: fitted | 0.981 | 1.000 | 0.991 | 0.075 (— / 0.075) |
| heldout_sentences | region | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| heldout_sentences | direction | product: fitted | 0.913 | 1.000 | 0.957 | 0.000 (— / 0.000) |
| heldout_sentences | direction | comparison: pooled midpoint | 0.870 | 1.000 | 0.935 |  |
| heldout_sentences | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | layout | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | source | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | source | comparison: pooled midpoint | 0.953 | 1.000 | 0.977 |  |
| heldout_sentences | target | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | target | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | style | product: fitted | 1.000 | 1.000 | 1.000 | 0.071 (— / 0.071) |
| heldout_sentences | style | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | arrow | product: fitted | 0.556 | 1.000 | 0.778 | 0.000 (— / 0.000) |
| heldout_sentences | arrow | comparison: pooled midpoint | 0.556 | 1.000 | 0.778 |  |
| heldout_sentences | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | pairing | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | notcolor | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | notcolor | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| heldout_sentences | depth | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| heldout_sentences | depth | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| new_identities | object | product: fitted | 0.973 | 1.000 | 0.987 | 0.050 (— / 0.050) |
| new_identities | object | comparison: pooled midpoint | 0.805 | 1.000 | 0.903 |  |
| new_identities | shape | product: fitted | 0.857 | 1.000 | 0.929 | 0.000 (— / 0.000) |
| new_identities | shape | comparison: pooled midpoint | 0.857 | 1.000 | 0.929 |  |
| new_identities | color | product: fitted | 0.938 | 0.993 | 0.965 | 0.219 (1.000 / 0.167) |
| new_identities | color | comparison: pooled midpoint | 0.531 | 1.000 | 0.766 |  |
| new_identities | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| new_identities | size | comparison: pooled midpoint | 0.923 | 1.000 | 0.962 |  |
| new_identities | name | product: fitted | 0.920 | 1.000 | 0.960 | 0.043 (— / 0.043) |
| new_identities | name | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| new_identities | text | product: fitted | 0.688 | 1.000 | 0.844 | 0.000 (— / 0.000) |
| new_identities | text | comparison: pooled midpoint | 0.688 | 1.000 | 0.844 |  |
| new_identities | relation | product: fitted | 0.974 | 1.000 | 0.987 | 0.000 (— / 0.000) |
| new_identities | relation | comparison: pooled midpoint | 0.923 | 1.000 | 0.962 |  |
| new_identities | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.026 (— / 0.026) |
| new_identities | landmark | comparison: pooled midpoint | 0.974 | 1.000 | 0.987 |  |
| new_identities | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| new_identities | landmark2 | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| new_identities | region | product: fitted | 0.947 | 1.000 | 0.974 | 0.167 (— / 0.167) |
| new_identities | region | comparison: pooled midpoint | 0.632 | 1.000 | 0.816 |  |
| new_identities | direction | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| new_identities | direction | comparison: pooled midpoint | 0.667 | 1.000 | 0.833 |  |
| new_identities | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| new_identities | quantity | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| new_identities | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| new_identities | axis | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| new_identities | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| new_identities | layout | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| new_identities | source | product: fitted | 1.000 | 1.000 | 1.000 | 0.015 (— / 0.015) |
| new_identities | source | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| new_identities | target | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| new_identities | target | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| new_identities | style | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| new_identities | style | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| new_identities | arrow | product: fitted | 0.875 | 1.000 | 0.938 | 0.000 (— / 0.000) |
| new_identities | arrow | comparison: pooled midpoint | 0.875 | 1.000 | 0.938 |  |
| new_identities | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| new_identities | edge | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| new_identities | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| new_identities | pairing | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| new_identities | notcolor | product: fitted | 0.833 | 1.000 | 0.917 | 0.000 (— / 0.000) |
| new_identities | notcolor | comparison: pooled midpoint | 0.833 | 1.000 | 0.917 |  |
| new_identities | depth | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| new_identities | depth | comparison: pooled midpoint | 1.000 | 1.000 | 1.000 |  |
| train (sample) | object | product: fitted | 0.996 | 1.000 | 0.998 | 0.051 (— / 0.051) |
| train (sample) | shape | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | color | product: fitted | 0.971 | 0.996 | 0.983 | 0.088 (1.000 / 0.061) |
| train (sample) | size | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | name | product: fitted | 0.950 | 1.000 | 0.975 | 0.158 (— / 0.158) |
| train (sample) | text | product: fitted | 0.929 | 1.000 | 0.964 | 0.154 (— / 0.154) |
| train (sample) | relation | product: fitted | 1.000 | 1.000 | 1.000 | 0.019 (— / 0.019) |
| train (sample) | landmark | product: fitted | 1.000 | 1.000 | 1.000 | 0.058 (— / 0.058) |
| train (sample) | landmark2 | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | region | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | direction | product: fitted | 0.889 | 1.000 | 0.944 | 0.250 (— / 0.250) |
| train (sample) | quantity | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | axis | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | layout | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | source | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | target | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | style | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | arrow | product: fitted | 0.667 | 1.000 | 0.833 | 0.000 (— / 0.000) |
| train (sample) | edge | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | pairing | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | notcolor | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |
| train (sample) | depth | product: fitted | 1.000 | 1.000 | 1.000 | 0.000 (— / 0.000) |

## Structure given vs estimated (author C3)
`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json (`kinds`: the count of level-opener kinds by default; the open-gate count and the fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); `FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.

## Checklist
[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated [x] margin [ ] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) [x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)
