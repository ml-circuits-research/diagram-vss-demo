# One cut for all three readers (2026-11-02)

**Owner's decision.** The three readers (Rules, VSS, Neural) read the SAME units of a message; how the message is cut is one global
setting (⋮ › Help › "Cutting into requests"): Rules segmenter, VSS cutter, or BERT cutter (the span head of the joint neural model,
available when that model is published). Default: the VSS cutter (`DEFAULT_CUT` in docs/js/vss-composer.js).

**How.** `VSSFormalizer.cut(text, ctx, strategy, env)` returns `[{c0, c1, src}]`; every reader reads exactly those units
(`rules.formalize(t, ctx, {units})`, `VSSFormalizer.formalize(t, ctx, _, {units})`, `neural.formalize(t, ctx, {units})`). With an
external cut, VSS still runs its world cutter once over the message: a unit's candidate worlds are the top 3 by summed B-<world> score
inside the unit; a unit with no world signal is read by all 7 worlds (fewest words not understood decides). With each reader's own cut
the outputs are identical to before (VSS: 1000 of 1000 sample messages and 1128 of 1128 short ones; Rules: score_rules unchanged).

**Measured** (`node training/sketch/cut_bench.mjs`; per gold request right / wrong / not done %, + extra; PAIR=value):

| set, reader | Rules cut | VSS cut |
|---|---|---|
| sample (4858), Rules | 67.9 / 16.8 / 15.3 +821 | 73.6 / 11.9 / 14.5 +406 |
| sample, VSS | 69.8 / 15.8 / 14.4 +833 | 77.2 / 11.4 / 11.4 +334 |
| short sets (1140), Rules | 97.5 / 0.5 / 1.9 +16 | 87.7 / 1.8 / 10.4 +17 |
| short sets, VSS | 58.6 / 13.7 / 27.7 +89 | 61.1 / 11.1 / 27.7 +53 |

Cut errors against the gold spans:

| set, cut | units / gold | lost / merged / split / extra units | ms per message |
|---|---|---|---|
| sample, Rules | 6051 / 4858 | 0 / 191 / 192 / 1202 | 8.3 |
| sample, VSS | 4853 / 4858 | 147 / 53 / 56 / 136 | 3.3 |
| short, Rules | 1119 / 1118 | 0 / 0 / 1 / 0 | 1.1 |
| short, VSS | 1024 / 1118 | 96 / 0 / 2 / 0 | 0.6 |

**Reading.** On whole messages the VSS cut is better for both readers (wrong 11.9 vs 16.8 for Rules, extras halved): the rules'
segmenter cuts chatter into units (1202 extra units). On short one-line commands the rules' segmenter is better: the VSS cutter makes no
unit for 96 of 1118 commands, so Rules with the VSS cut drops from 97.5 to 87.7 right. The BERT cut is measured when the joint model is
published (`BERT_MODEL=<folder> node training/sketch/cut_bench.mjs`).
