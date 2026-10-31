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

## Training log

First attempt (before the trainer's memory fix): killed by the system for memory (exit 137); nothing exported, no data cut, no setting changed. After the fix (main 98a6b9a)
the one pre-registered run: `PREFIX=data2 SEED=0 DATA=all SOP_PYTHON=/home/claude/venv/bin/python3 ./run_curve.sh 0.8` in the main tree. World: 80% fit split of the 2640 messages
= 2109 messages, 10215 requests, 10159 rows (56 dropped), 153 value n-grams, 1762 trigger rules, 186 kinds, vocab 4387; 9129 training rows x 2 epochs, D 1024, seed 0.
Peak RSS 0.93 GB at the start, 3.59 GB at export (route book). Model: `docs/model/data2_p80_s0`. `llm_train/REAL_WORLD.md` now describes this DATA=all build.

## Result (one run, nothing changed after seeing numbers)

Two scorers: OLD = commit 28e1385 (exported with `git archive` to a scratch folder; decides the criterion), MAIN = current scorer (order-free disconnect / connected / swap / check-between).
Wires right, extra wires in brackets. SEG=gold = reading alone; default = the reader's own cut. The rules line is the same for both models.

OLD scorer (decides):

| dev | rules | fix_p80_s0 gold | data2_p80_s0 gold | fix_p80_s0 default | data2_p80_s0 default |
|---|---|---|---|---|---|
| old (1126 wires) | 70.4% (x182) | 60.5% (x71) | 63.2% (x81) | 46.5% (x335) | 47.9% (x332) |
| msg2 (923) | 65.4% (x207) | 44.7% (x96) | 59.7% (x79) | 39.8% (x414) | 51.5% (x386) |
| long (519) | 56.3% (x98) | 47.4% (x46) | 49.1% (x43) | 37.0% (x243) | 36.6% (x224) |

MAIN scorer:

| dev | rules | fix_p80_s0 gold | data2_p80_s0 gold | fix_p80_s0 default | data2_p80_s0 default |
|---|---|---|---|---|---|
| old | 70.4% (x182) | 61.0% (x71) | 63.2% (x81) | 47.1% (x335) | 48.1% (x332) |
| msg2 | 65.4% (x207) | 45.7% (x96) | 59.8% (x79) | 40.3% (x414) | 51.5% (x386) |
| long | 56.3% (x98) | 47.4% (x46) | 49.1% (x43) | 37.0% (x243) | 36.6% (x224) |

error_analysis causes (OLD scorer; share of requests read alone from their spans; under MAIN only G differs: old 7.9 -> 7.5, msg2 5.4 -> 9.2):

| cause | old: fix -> data2 | msg2: fix -> data2 | long: fix -> data2 |
|---|---|---|---|
| A action word not recognized | 8.2% -> 7.2% | 22.5% -> 7.6% | 16.6% -> 15.4% |
| B wrong action or type | 6.5% -> 7.3% | 11.1% -> 8.6% | 9.2% -> 8.5% |
| C reader refuses | 0.8% -> 0.5% | 2.5% -> 0.7% | 0.4% -> 0.2% |
| D value not reachable | 2.2% -> 1.9% | 2.0% -> 3.3% | 2.3% -> 2.5% |
| E name not reachable | 4.1% -> 4.3% | 2.1% -> 3.0% | 8.1% -> 9.1% |
| F role missed | 7.2% -> 6.2% | 7.9% -> 7.6% | 5.8% -> 5.2% |
| G role wrong | 8.4% -> 7.5% | 6.4% -> 9.3% | 10.0% -> 10.6% |
| fully right requests | 61.0% -> 63.6% | 45.5% -> 59.9% | 46.6% -> 47.4% |

## Criterion (OLD scorer, old dev)

1. reading alone >= 62.5%: 63.2%. Met.
2. extra wires with SEG=gold <= 80: 81. NOT met (one over).
3. cause A below 8.2%: 7.2%. Met.

**FAIL** (criterion 2 missed by one wire; stated as pre-registered, no second run, no rounding). The reading rose; the extra wires rose with it, 71 -> 81.

## Root-cause analysis

- Cause A (no action word) fell where the new data has the verbs: msg2 22.5% -> 7.6%, old 8.2% -> 7.2%. This is a data cause and the data fixed it (trigger rules 961 -> 1762).
  On the long dev it barely moved (16.6% -> 15.4%). Its examples are mostly requests without an action word the front end knows: "Music purple" (gold: set the colour of the shape just created; a verbless request),
  "show as a dashed line from the Truck to the Farm", "attach that to Ideas as well", "Mak it a red circle, ..." (typo). Cause: the front end's trigger rules and the verbless-request design (plan step 4), not the reader.
- Cause B (wrong action or type) fell on msg2 (11.1 -> 8.6) and long (9.2 -> 8.5) but rose on old (6.5 -> 7.3). Examples: yes/no questions read as bare value queries ("Is Paused a circle", "Is Start still connected to Check"),
  and "have a link to" read as connect. Cause: the model's wires (question forms share words with commands, as in STEP4_DIAGNOSIS.md); more data of this kind did not remove it.
- D, E, G did not fall and some rose on msg2 and long (E names on long 8.1 -> 9.1; G roles on msg2 6.4 -> 9.3 under the old scorer): the new data adds request shapes with several shapes and anchors (lists, long messages) and the role assignment does not follow. Cause: the model's wires and the front end's names, not coverage.
- Extra wires (SEG=gold) rose 71 -> 81 on old because the reader executes more requests where before it answered unknown-event (cause A 92 -> 81 requests, C 9 -> 6); some of the newly read requests are wrong, and a wrong executed wire counts as extra.
- With the reader's own cut the gain is small on old (46.5 -> 47.9) and zero on long (37.0 -> 36.6); extra wires stay at 332 / 224 (plan step 1 / 2 targets: < 150 and <= 100). The cut, not the data, limits the full pipeline.
- The rules reader is unchanged (70.4 / 65.4 / 56.3) and still above the VSS reading alone on all three dev files (63.2, 59.7, 49.1).
- Summary: more data fixed the coverage causes (A, C) and raised the reading a lot on the new distribution (msg2 44.7 -> 59.7) but only +2.7 points on the old dev; what remains sits in wires (B, G), names (E) and the cut. No knob was turned.

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

The exported model docs/model/data2_p80_s0 is NOT in git: its routebook.bin is 101.7 MB, over GitHub's 100 MB file limit (the route
book grows with the square of the number of kinds: 186 here, 106 before). It stays in the workspace; size is an open problem for the demo.
