# TEST_LOG.md: every scoring run on a test set

One line per run: date, test set (and whether it had been scored before), model, cut, numbers (llm_score.mjs, main scorer; wires
right of the gold wires, extra wires), who ran it and why. Aggregate numbers only.

| date | test set | scored before? | model | cut | rules: wires right / extra | vss: wires right / extra | by / why |
|---|---|---|---|---|---|---|---|
| 2026-10-31 | llm_bench/fresh1 (sonnet 500 msgs / 3030 wires; haiku 500 / 2514) | no (first scoring) | kinds_p80_s0 | default own cut (vss-centers.js) | sonnet 69.8% / 427; haiku 78.7% / 321; all 73.8% / 748 | sonnet 47.7% / 837; haiku 59.9% / 814; all 53.2% / 1651 | cut agent; diagnosis_cut/CUT.md section 7 (pre-registered Q1 test) |
| 2026-10-31 | llm_bench/fresh1 | yes (same session, run above) | kinds_p80_s0 | SEG=q1 | as above | sonnet 50.6% / 397; haiku 59.1% / 324; all 54.4% / 721 | same |
| 2026-10-31 | llm_bench/fresh1 | yes | kinds_p80_s0 | SEG=gold (reading alone; all rows carry spans) | as above | sonnet 57.0% / 210; haiku 66.8% / 182; all 61.4% / 392 | same (reported, not in the criterion) |
| 2026-10-31 | llm_bench/fresh1 | yes | comb1_p80_s0 | default own cut | as above | sonnet 47.7% / 836; haiku 59.7% / 814; all 53.1% / 1650 | same |
| 2026-10-31 | llm_bench/fresh1 | yes | comb1_p80_s0 | SEG=q1 | as above | sonnet 50.1% / 387; haiku 60.1% / 324; all 54.6% / 711 | same |
| 2026-10-31 | llm_bench/fresh1 | yes | comb1_p80_s0 | SEG=gold | as above | sonnet 56.5% / 211; haiku 66.5% / 181; all 61.1% / 392 | same (reported, not in the criterion) |
| 2026-10-31 | llm_bench/fresh1 | yes (CUT.md section 7, same session) | kinds_p80_s0 | default own cut (re-run; identical to the line above) | sonnet 69.8% / 427; haiku 78.7% / 321; all 73.8% / 748 (not done 12.8%, done wrong 13.4%) | sonnet 47.7% / 837; haiku 59.9% / 814; all 53.2% / 1651 (not done 16.0%, done wrong 30.8%) | decode agent; DECODE.md (pre-registered, report only) |
| 2026-10-31 | llm_bench/fresh1 | yes | kinds_p80_s0 | SEG=q1 Q1B=1 (q1 cut, roleless test learned from the training frames) | as above | sonnet 50.8% / 417; haiku 64.4% / 333; all 57.0% / 750 (not done 19.9%, done wrong 23.1%) | same |
| 2026-10-31 | llm_bench/fresh1 | yes | kinds_p80_s0 front end + scratch cutter (BIO segmenter trained on the fit split of DATA=all, 2109 msgs; copy docs/model/_cutter_tmp_kinds, deleted afterwards) | SEG=tagger | as above | sonnet 54.7% / 302; haiku 61.1% / 262; all 57.6% / 564 (not done 21.5%, done wrong 20.9%; messages fully right 11.0%) | cutter agent; CUTTER.md (report only, aggregates) |
| 2026-10-31 | llm_bench/fresh1 | yes | comb1_p80_s0 front end + scratch cutter (as above; _cutter_tmp_comb1) | SEG=tagger | as above | sonnet 54.1% / 304; haiku 60.8% / 261; all 57.1% / 565 (not done 21.6%, done wrong 21.2%; messages fully right 10.8%) | same |

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/comb1_p80_s0` (a76b4e3), `docs/model/kinds_p80_s0` (a76b4e3). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
