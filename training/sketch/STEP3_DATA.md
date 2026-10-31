# Step 3: does the new annotated training data help the one-request VSS reader?

Pre-registered 2026-10-31, before any training or scoring of the new model. One run, no knobs turned after the numbers.

## Data and code

- New training data (committed, labels checked): `llm_train/sonnet_msg2` (600 messages), `llm_train/haiku_msg2` (600), `llm_train/sonnet_long` (240 long).
- `front.py` now has `TRAIN_DIRS` and the env var `DATA`: unset or `old` = `sonnet_msg`, `haiku_msg` (1200 messages, exactly as before); `all` = those plus the three
  new folders (2640 messages). Callers of `load_msgs`: `msg_to_world.py`, `select_front.py`, and `front.py` itself (its `__main__`). `run_curve.sh` runs
  `msg_to_world.py` in the caller's environment, so `DATA` passes through.
- Check that `DATA` unset is unchanged: `load_msgs()` returns the same 1200 messages in the same order as the old glob; `msg_to_world.py --frac 0.8` gives
  947 messages, 4305 requests, 4282 rows, 23 dropped, 102 kinds, 236 lexicon words, the same as the committed `llm_train/REAL_WORLD.md` (that file differs in one line only:
  it was last written by the negatives run, which counted 168 negatives; they are off by default).
- The model trained: `PREFIX=data2 SEED=0 DATA=all ./run_curve.sh 0.8` (80% fit split by `split_of`, D 1024, 2 epochs, held-out calibration, no negatives) -> `docs/model/data2_p80_s0`.
  Baseline: `docs/model/fix_p80_s0` (same settings, old data).

## Dev files (read-only inputs for scoring; the 80/20 rule is not changed)

| file | content | messages |
|---|---|---|
| `review/dev.jsonl` (scratchpad) | old: 20% of sonnet_msg + haiku_msg | 253 |
| `dev_new/msg2/dev.jsonl` | sonnet_msg2 + haiku_msg2 with `split_of(m, 0.8)` false | 233 (923 gold wires) |
| `dev_new/long/dev.jsonl` | sonnet_long, same rule | 45 (519 gold wires) |

Both models are scored on all three dev files. The new model never saw any of them (the rule keeps these 20% out of the fit split).

## Hypothesis

The causes the new data targets drop: "no action word" (A), "wrong action or type" (B), and the list roles; the reading does not fall on the old dev file.

## Measures

For `fix_p80_s0` and for the new model, on the three dev files: `llm_score.mjs` with `SEG=gold` (reading alone, annotated spans) and with the default cut
(the VSS reader's own cut), which also prints the rules reader's line; `error_analysis.mjs` (annotated-span requests, causes A-G).

## Criterion (on the OLD dev file)

PASS only if all three hold:
1. reading alone (SEG=gold) wires right >= 62.5% (fix_p80_s0: 60.5%);
2. extra wires with SEG=gold <= 80 (now 71);
3. error_analysis cause "A action word not recognized" below 8.2%.

The msg2 and long dev files are reported, not part of the criterion. Otherwise: fail; report, no patches, no second try.

## Result: training did not complete (out of memory)

`SOP_PYTHON=/home/claude/venv/bin/python3 PREFIX=data2 SEED=0 DATA=all ./run_curve.sh 0.8` built the world (80% fit split of 2640 messages: 10159 rows, 56 dropped,
153 value n-grams, 1762 trigger rules, 186 kinds, vocab 4387) and started `sop train` (9129 training rows x 2 epochs, D 1024), which was killed by the system (exit 137,
out of memory) before the first log line after "[train]". (A first attempt failed only because the worktree has no `.venv` and `sop` fell back to a Python without torch; fixed with
`SOP_PYTHON`, no setting changed.) No model was exported, so there are no new numbers and the criterion is not evaluated. Per the rules: no data cut, no settings changed. 
The old run (4282 rows) fit in memory; 10159 rows (2.4x) did not on this 7-8 GB machine.

## Baseline: fix_p80_s0 (scored before training the new model)

Wires right (SEG=gold = reading alone; default = the reader's own cut), extra wires in brackets (extra: rules 182 / 207 / 98 on old / msg2 / long).

| dev file | rules | fix_p80_s0 SEG=gold | fix_p80_s0 default cut |
|---|---|---|---|
| old (253 msgs, 1126 wires) | 70.4% (793), extra 182 | 60.5% (681), extra 71 | 46.5% (524), extra 335 |
| msg2 (233 msgs, 923 wires) | 65.4% (604), extra 207 | 44.7% (413), extra 96 | 39.8% (367), extra 414 |
| long (45 msgs, 519 wires) | 56.3% (292), extra 98 | 47.4% (246), extra 46 | 37.0% (192), extra 243 |

error_analysis causes (share of all gold requests read alone from their spans):

| cause | old | msg2 | long |
|---|---|---|---|
| A action word not recognized | 8.2% | 22.5% | 16.6% |
| B wrong action or type | 6.5% | 11.1% | 9.2% |
| C reader refuses | 0.8% | 2.5% | 0.4% |
| D value not reachable | 2.2% | 2.0% | 2.3% |
| E name not reachable | 4.1% | 2.1% | 8.1% |
| F role missed | 7.2% | 7.9% | 5.8% |
| G role wrong (+ description read differently) | 8.4% (+1.6%) | 6.4% (+0.1%) | 10.0% (+1.0%) |
