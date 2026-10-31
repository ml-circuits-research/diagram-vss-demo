# DECODE.md: two decode switches, EXCL and Q1b (pre-registered 2026-10-31, before any measurement)

Decode only: no training, no model file changed. Models `docs/model/comb1_p80_s0` and `docs/model/kinds_p80_s0` as exported. Every
switch is off by default, and off it must give byte-identical output (checked, section 3).
No test set is opened. `llm_bench/fresh1` is only scored, for aggregate numbers, and every run is logged in `TEST_LOG.md`.

## 0. The causes (measured before, not here)

- EXCL. The connect family fits only ~41% even in a model trained on connect alone (INTERFERENCE.md). The cause is the twin list
  roles: the decoder reads source, members, target and targets independently, so "source + members" and "target + targets" are
  given together. The training frames never do that (CAPACITY.md S2 / S3). The redesign with one list role failed
  (LISTS_ONE_ROLE.md). CAPACITY.md measured a decode rule at read time on fix_p80_s0 (dev 693 -> 731, error_analysis rule): "of two
  roles of one event that never occur together in the training frames, keep only the one further above its threshold".
- Q1b. Part 3 of the q1 cut (diagnosis_cut/CUT.md section 6) drops a reading that fills none of its event's roles, unless the
  legend gives the event no roles. On fresh1 that dropped "describe the diagram"-type requests (kinds_p80_s0, describe 99 -> 8 of
  104; CUT.md section 7). The legend lists the roles an event may take, not whether it may take none.

## 1. The two changes

### EXCL (reader): a learned exclusion of role pairs

- Data. Learned from the model's training frames by `training/vss/tool/sop/decode_stats.py`. Training frames = the rows of split
  `train` in the run's `splits.json`, read from the world rebuilt with the model's own settings (the texts are checked against
  `splits.json`), shape ok, not negative. A pair (a, b) of one event's legend roles is an exclusion pair when all three hold:
  (1) the two roles share a candidate kind (the schema's head_kinds / kinds); (2) each is given in >= 5 training frames of the event;
  (3) the two are given together in 0 training frames of the event.
  This is CAPACITY.md's rule unchanged (diagnosis_capacity/excl_pairs.py). The 5 and the shared-kind condition come from that rule
  and are not chosen here. No hand list. The pairs are written to `docs/model/<model>/decode.json` (`excl_pairs`), a separate file
  next to the exported files, so model.json and its manifest hashes are not touched.
- Rule. At the end of `Reader.read` (after the one-to-one rule, the required-role queries and the scope terms), for each exclusion
  pair of the decided event (in the stored order) whose two roles are both given: score = presence ratio / the role's presence
  threshold (threshold 1 when the role has none). The role with the smaller score is removed (ties keep the first of the pair),
  together with its margins (`r` and `r.*`), identity margin and determiner candidate. Nothing else changes.
- Switch. Python `infer.Reader(..., excl_pairs=<dict>)`. JS `load(..., { excl: <dict> })` (docs/js/vss/reader.js
  `opts.excl`). `llm_score.mjs` `EXCL=1` reads `decode.json` from the model folder. The two readers implement the same code path.
  Parity test: `parity_reader.py --excl` / `parity_reader.mjs --excl` (section 3).
- Measured. `llm_score.mjs` (VSS column), EXCL off / on, both models, on three dev files that were read before (held-out training
  messages, not test sets): `scratchpad/review` (old dev, 1126 requests), `scratchpad/dev_new/msg2` (923) and `scratchpad/dev_new/long`
  (519). Each with SEG=gold (the annotated spans read alone) and with the default cut. Reported per run: correct, not done, done
  wrong (% of the gold wires), and extra wires.
- Criterion, on the old dev file (`review`), SEG=gold: correct with EXCL >= correct without + 1.5 points, AND done wrong with EXCL
  <= done wrong without. PASS only if both models meet both conditions. msg2, long and the default cut are reported, not criteria.

### Q1b (cut): may an event be read with no role? Learned from the training frames

- Data. From the same training frames (decode_stats.py): an event is `roleless_ok` when at least 5% of its training frames fill no
  role. The 5% is stated once here and not tuned. Written to `decode.json` (`roleless_ok`). Events with no training frame are not
  roleless_ok.
- Rule. The q1 cut (docs/js/vss-centers.js `vssCentresQ1`), part 3 only: a reading that fills none of its event's roles is not a
  request unless its event is roleless_ok. This replaces "unless the legend gives the event no roles". Everything else in q1
  (left-to-right centres, joins up to 3, score, tie rule) is unchanged.
- Where it lives. The cut exists only in JS (vss-centers.js; no Python cut). The learned data are computed in Python
  (decode_stats.py) and read by the JS cut. There is nothing in the reader to make parallel.
- Switch. `vssCentres(text, names, F, vss, { cut: "q1", roleless: [...] })`. `llm_score.mjs` `SEG=q1 Q1B=1` reads `decode.json`.
  Without `roleless` the q1 cut is unchanged.
- Measured. `llm_score.mjs`, both models, the three dev files: default cut, SEG=q1 (for reference) and SEG=q1 Q1B=1. Same four
  numbers.
- Criterion, on the old dev file (`review`), against the DEFAULT cut: done wrong with Q1b <= done wrong of the default cut
  - 5.0 points, AND correct with Q1b >= correct of the default cut. PASS only if both models meet both conditions.

### fresh1 (after the dev measurements, only for the switches that pass)

- One run each, kinds_p80_s0, both halves (`llm_bench/fresh1/sonnet`, `llm_bench/fresh1/haiku`): the default cut; SEG=q1 Q1B=1 if
  Q1b passes; SEG=q1 Q1B=1 EXCL=1 if both pass (if only EXCL passes: the default cut with EXCL=1 instead). Reported: llm_score's ALL line and the two halves (correct, not done, done wrong,
  extra), plus the rules reader's line. fresh1 was scored before (CUT.md section 7, same session), so it is no longer an unseen set.
  These numbers are reported, not a criterion. No messages or per-message outputs are opened (no `--dump`, no `-v`). Every run is
  logged in TEST_LOG.md.

## 2. Results (written after the runs)

### 2.0 Checks before the numbers

- Default unchanged. `llm_score.mjs` with the switches unset, on the old dev file, both models, SEG=gold / default cut / SEG=q1:
  stdout and `--dump` are byte-identical to the scripts of git HEAD (aee681e). The Python reader with `excl_pairs` unset gives
  byte-identical parity goldens to HEAD's (`parity_reader.py`, kinds_p80_s0, old dev, 1126 spans).
- Parity with EXCL on. `parity_reader.py --excl` against `parity_reader.mjs` on the three dev files, both models (2568 spans each):
  tokens, SOP texts and statuses all identical, max |residual difference| 9.0e-10. EXCL changes the SOP text of 105 of the 1126 old-dev
  spans (kinds_p80_s0).
- Learned data. The worlds were rebuilt with each model's settings into the scratchpad (`QCOLOR=1 MARKER=0 msg_to_world.py --frac 0.8
  --out ...`, plus `KINDMAP=diagnosis_kinds/kinds_comb1.json` for kinds). Legend sha256 cbf20196... = the models'. The 3902 `train`
  texts equal `splits.json`. llm_train/REAL_WORLD.md was restored, identical. Both models get the same data (decode.json, 3902 rows):
  - excl_pairs: check [comparison, size] [landmark, shape]; connect [members, source] [members, targets] [members, text]
    [target, targets] [targets, text]; count [landmark, object]; create [name, text]; move [region, relation]; set [members, object].
    These are the pairs of CAPACITY.md's excl_pairs.json (fix_p80_s0), the same list.
  - roleless_ok (>= 5% of the event's training frames with no role): count 33%, cycle 100%, delete 18%, describe 24%, distribute 11%,
    forget 100%, list 33%, property 7%, redo 100%, resize 7%, swap 7%, undo 100%. The schema rebuilt from the rows gives the same
    lists as the models' stored schema.

### 2.1 Dev numbers (llm_score.mjs, VSS column; % of the gold wires; extra = wires read that no gold wire matches)

#### kinds_p80_s0

| file (gold wires) | reading | correct | not done | done wrong | extra wires |
|---|---|---|---|---|---|
| review (1126) | SEG=gold | 65.6% (739) | 14.4% | 20.0% | 66 |
| review (1126) | SEG=gold + EXCL | 66.2% (745) | 14.4% | 19.4% | 66 |
| review (1126) | default cut | 53.0% (597) | 13.9% | 33.0% | 329 |
| review (1126) | default cut + EXCL | 54.2% (610) | 13.9% | 31.9% | 330 |
| review (1126) | SEG=q1 (legend test) | 59.1% (665) | 16.4% | 24.5% | 116 |
| review (1126) | SEG=q1 + Q1b | 59.0% (664) | 15.8% | 25.2% | 128 |
| msg2 (923) | SEG=gold | 51.8% (478) | 34.3% | 13.9% | 95 |
| msg2 (923) | SEG=gold + EXCL | 52.4% (484) | 34.3% | 13.2% | 95 |
| msg2 (923) | default cut | 45.0% (415) | 31.9% | 23.2% | 409 |
| msg2 (923) | default cut + EXCL | 45.6% (421) | 31.9% | 22.5% | 409 |
| msg2 (923) | SEG=q1 (legend test) | 49.0% (452) | 34.8% | 16.3% | 178 |
| msg2 (923) | SEG=q1 + Q1b | 50.1% (462) | 33.0% | 16.9% | 191 |
| long (519) | SEG=gold | 46.2% (240) | 25.2% | 28.5% | 40 |
| long (519) | SEG=gold + EXCL | 46.2% (240) | 25.2% | 28.5% | 40 |
| long (519) | default cut | 37.6% (195) | 24.1% | 38.3% | 236 |
| long (519) | default cut + EXCL | 37.8% (196) | 24.1% | 38.2% | 236 |
| long (519) | SEG=q1 (legend test) | 38.7% (201) | 29.1% | 32.2% | 120 |
| long (519) | SEG=q1 + Q1b | 38.7% (201) | 27.9% | 33.3% | 126 |

#### comb1_p80_s0

| file (gold wires) | reading | correct | not done | done wrong | extra wires |
|---|---|---|---|---|---|
| review (1126) | SEG=gold | 65.5% (738) | 14.3% | 20.2% | 64 |
| review (1126) | SEG=gold + EXCL | 66.1% (744) | 14.3% | 19.6% | 64 |
| review (1126) | default cut | 52.7% (593) | 13.7% | 33.7% | 328 |
| review (1126) | default cut + EXCL | 54.2% (610) | 13.7% | 32.1% | 328 |
| review (1126) | SEG=q1 (legend test) | 59.0% (664) | 16.5% | 24.5% | 112 |
| review (1126) | SEG=q1 + Q1b | 59.1% (665) | 15.8% | 25.1% | 126 |
| msg2 (923) | SEG=gold | 51.4% (474) | 33.9% | 14.7% | 89 |
| msg2 (923) | SEG=gold + EXCL | 51.6% (476) | 34.0% | 14.4% | 89 |
| msg2 (923) | default cut | 44.1% (407) | 32.1% | 23.8% | 410 |
| msg2 (923) | default cut + EXCL | 44.2% (408) | 32.1% | 23.7% | 410 |
| msg2 (923) | SEG=q1 (legend test) | 49.5% (457) | 33.8% | 16.7% | 160 |
| msg2 (923) | SEG=q1 + Q1b | 50.6% (467) | 32.1% | 17.3% | 175 |
| long (519) | SEG=gold | 47.4% (246) | 24.7% | 27.9% | 37 |
| long (519) | SEG=gold + EXCL | 47.0% (244) | 24.7% | 28.3% | 37 |
| long (519) | default cut | 38.7% (201) | 24.1% | 37.2% | 236 |
| long (519) | default cut + EXCL | 39.1% (203) | 24.1% | 36.8% | 236 |
| long (519) | SEG=q1 (legend test) | 39.7% (206) | 28.7% | 31.6% | 113 |
| long (519) | SEG=q1 + Q1b | 39.7% (206) | 27.7% | 32.6% | 120 |

### 2.2 Verdicts

**EXCL: FAIL.** Old dev, SEG=gold: kinds 65.6% -> 66.2% (+0.5 points, +6 wires), comb1 65.5% -> 66.1% (+0.5, +6). Done wrong went
down (20.0 -> 19.4, 20.2 -> 19.6), so that condition holds. The required +1.5 points is not met by either model. Per the rule, nothing
was changed after the numbers. On msg2 / long it is +0.6 / 0.0 (kinds) and +0.2 / -0.4 (comb1).
What the miss is, for the record (old dev, kinds, SEG=gold; the parity goldens off / on). 105 spans change, about 100 of them connect.
The reader of these models gives two or three of the four list roles together very often (e.g. members + targets + source + target
16 times). The rule keeps the wrong role about as often as the right one: 12 messages got better, 6 got worse, net +6 wires.
CAPACITY.md measured +40 on fix_p80_s0, which reads presence with the occupancy marker. comb1 / kinds are MARKER=0, where presence is
the best candidate's score. CAPACITY.md section 4 already noted that this score does not separate absent from present source /
target on a marker model. A likely cause (not measured here): with the candidate-score presence, the ratio to the threshold does not
rank the twin roles well enough to pick the right one.

**Q1b: PASS.** Old dev, against the default cut. Done wrong: kinds 33.0% -> 25.2% (-7.8 points, needed -5.0), comb1 33.7% -> 25.1%
(-8.6). Correct: kinds 53.0% -> 59.0%, comb1 52.7% -> 59.1% (not lower). Both models meet both conditions.
Against the q1 cut with the legend test (reference, not the criterion), Q1b keeps the describe readings: msg2 describe 10 -> 17 of
20 (both models), old dev 9 -> 10 of 12. Correct changes by -0.1 / +0.1 (old dev) and +1.1 (msg2). It also keeps some roleless
readings that are wrong or not asked for: done wrong rises +0.6 to +1.2 points and extra wires +6 to +15 on every file. These come from
the roleless_ok events (count, list, delete, resize, property, swap, distribute), which the legend test dropped.

### 2.3 fresh1 (kinds_p80_s0; one run each; scored before in this session, so not an unseen set; aggregates only, nothing opened)

EXCL failed, so there are no EXCL runs. llm_score.mjs, % of the gold wires; extra = extra wires.

| reading | half (gold wires) | correct | not done | done wrong | extra |
|---|---|---|---|---|---|
| rules | sonnet (3030) | 69.8% | 17.0% | 13.2% | 427 |
| rules | haiku (2514) | 78.7% | 7.8% | 13.5% | 321 |
| rules | **all (5544)** | **73.8%** | 12.8% | 13.4% | 748 |
| VSS default cut | sonnet | 47.7% | 18.6% | 33.7% | 837 |
| VSS default cut | haiku | 59.9% | 12.9% | 27.2% | 814 |
| VSS default cut | **all** | **53.2%** | 16.0% | 30.8% | 1651 |
| VSS q1 + Q1b | sonnet | 50.8% | 24.0% | 25.2% | 417 |
| VSS q1 + Q1b | haiku | 64.4% | 15.1% | 20.5% | 333 |
| VSS q1 + Q1b | **all** | **57.0%** | 19.9% | 23.1% | 750 |
| (VSS q1, legend test: CUT.md section 7) | all | 54.4% | 24.9% | 20.6% | 721 |

The default cut is identical to the run in TEST_LOG.md (53.2% / 1651). Against it, Q1b gives +3.8 points correct, -7.7 points done
wrong, +3.9 points not done, and 901 fewer extra wires. Against q1 with the legend test: +2.6 correct, +2.5 done wrong, -5.0 not done,
+29 extra. describe 8 -> 100 of 104 (default cut 99) and count 76 -> 131 of 255 (default 115), from the per-act line.

## 3. Files

- `training/vss/tool/sop/decode_stats.py` (new): excl_pairs and roleless_ok from a world's training frames -> decode.json.
- `docs/model/comb1_p80_s0/decode.json`, `docs/model/kinds_p80_s0/decode.json` (new; model.json / manifest untouched).
- `training/vss/tool/sop/infer.py`: `Reader(..., excl_pairs=None)`, `Reader.exclude`, the call at the end of `read`.
- `docs/js/vss/reader.js`: `opts.excl`, `Reader.exclude`, the same call. `docs/js/vss-centers.js`: `opts.roleless` in the q1 cut.
- `training/sketch/llm_score.mjs`: `EXCL=1`, `Q1B=1` (with SEG=q1). `training/sketch/parity_reader.py` / `.mjs`: `--excl`.
- Raw outputs, rebuilt worlds, goldens and scripts (jobs.sh, table.py): `scratchpad/decode/`.
