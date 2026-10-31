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
