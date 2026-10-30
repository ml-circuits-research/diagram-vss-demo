# Results: Rules vs VSS on the demo's legend (2026-10-30)

All numbers: one seed (0), CPU (2 cores), measured by `node training/sketch/score_all.mjs --limit 300` with the browser pipeline (rules
segmenter and spelling correction → snorm → VSS reader → adapter), scored by `docs/js/bench-canon.js`. A message counts only when its wire
type and every labelled answer match (multi-clause messages: every wire, in order). One seed means these are indications, not results with an
uncertainty: the vss-demo D2 runs show seed-to-seed differences of a few points (0.906 / 0.894 / 0.888 on held-out formulations).

## The shipped model (docs/model/sketch)

Run `runs/sketch_n8000_D1024_e2_s0_calattr` (8000 generated sentences, D 1024, 2 epochs, star version 2, fitted thresholds with the
held-out-formulation calibration half), trained with the local calibration patch `patches/vss-demo_calibrate_attr_all.patch` (below).
Export: 8 bits, 14.75 MB (route book 14.35 MB, stars 0.38 MB, model.json 0.03 MB). Training 784-850 s on CPU.

| test set | n | Rules | VSS |
|---|---|---|---|
| hand-labelled (the rules were tuned with these in view) | 40 | 95.0% | 87.5% |
| blind paraphrases (written before any reader ran; nothing tuned on them) | 60 | 78.3% | 45.0% |
| broad English set (written blind; commands, questions, typos, casual, multi-clause) | 128 | 95.3% | 84.4% |
| generated, seen formulations | 300 | 100% | 98.7% |
| generated, names and labels never seen in training | 300 | 100% | 98.0% |
| generated, held-out template × prefix combinations | 300 | 99.7% | 97.7% |

Broad set by category (rules / VSS / n): create 18/18/20, delete 5/5/5, move 7/6/7, set 6/6/6, resize 2/2/2, rename 2/2/2, label 1/1/1,
duplicate 2/1/2, swap 1/1/1, connect 8/8/8, disconnect 2/2/2, layout 3/3/3, history 2/2/2, questions 33/22/33, fact 2/2/2, rule 3/3/3,
typo 5/5/5, casual 4/4/5, new legend questions 9/9/9, multi-clause 7/6/10. Typos pass for both because the shared segmenter corrects spelling
before any reader.

Time per message (node 22, after load): rules median 0.45 ms (p95 1.1), VSS median 3.0 ms (p95 6.8); VSS load 0.7 s.

Reading the table: the rules and every test sentence have the same author, so the rules' numbers are an upper bound of what they would do on
other people's English; the generated sets share the templates the VSS model was trained on. The blind and broad sets are the fairer
comparison, and on them the VSS reader is behind the rules by 11 to 33 points, mostly on questions and on phrasings outside the templates.

## Runs before it (same day, kept for the record)

| run | data | change | FULL on its own splits (held-out formulations / held-out sentences / new identities) |
|---|---|---|---|
| `runs/sketch_D1024_e2_s0` | 6000 sentences | first model | 0.806 / 0.887 / 0.830 |
| `runs/sketch_n8000_D1024_e2_s0` | 8000 sentences, more descriptions in source / target / landmark | data only | 0.773 / 0.848 / 0.813 |
| `runs/sketch_n8000_D1024_e2_s0_calattr` | same 8000 | calibration patch | 0.894 / 0.902 / 0.907 |

The first model, on the benchmark of the first row's data, with the reader's offers accepted (see below): hand 85.0%, blind 43.3%, broad 82.8%.

## Two findings about the vss-demo tool

1. **Offers.** When a role's presence ratio is under its threshold but an unplaced word fits exactly one empty role, the reader writes
   `_offer.<role>=<word>` and leaves the role empty; the vss-demo app asks the person to confirm. This demo accepts offers (History lists
   them). Without accepting them the first model scored 83.7 / 78.0 / 92.3% on the generated sets instead of 97.7 / 93.0 / 96.0%.
2. **Attribute and determiner thresholds of rare roles** (`patches/vss-demo_calibrate_attr_all.patch`). `sop train` calibrates the
   attribute / determiner thresholds from a read in which presence is decided by the role's TRAINING RATE (no presence thresholds exist yet at
   that point), so a role present in under half of the sentences (landmark, source, target) is read as absent there, its attribute ratio is
   never measured, it gets no threshold, and the reader then never reads its colour or determiner ("connect the brown circle to Home" →
   source = circle). The patch measures those ratios with `presence="all"` on the rows whose gold fills the role. It is applied to a local
   vss-demo checkout only; the diagram world of vss-demo (landmark, source, target, edge) is probably affected the same way.
