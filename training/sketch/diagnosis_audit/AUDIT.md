# AUDIT: are the measurements trustworthy? (2026-10-31)

Independent audit of the scorer (`training/sketch/llm_score.mjs` + `docs/js/bench-canon.js`) and of the gold labels, measured against
what the editor executes (`docs/js/logic.js`). Nothing in the repository was edited, nothing committed, nothing trained. Not opened:
`training/sketch/llm_bench/*`, `docs/bench/*`, `hand_broad`.

Data: dev file `review/dev.jsonl` (253 messages, 1126 gold requests; read before, not a fresh test set). Training data:
`training/sketch/llm_train/sonnet_msg2` + `haiku_msg2` (1200 messages, 4790 requests). Model: `docs/model/comb1_p80_s0`.

Scripts (all in this folder; run from here):

| script | what it does |
|---|---|
| `audit_lib.mjs` | the readers and the scoring path of llm_score.mjs copied verbatim (vssFormalize, align, the matching rule); gold wire -> reader-style nodes; Wilson interval; seeded shuffle |
| `selftest.mjs ../review/dev.jsonl selftest_dev.json` | Q1a: gold wires fed to the scorer as a reader's output; legend validation; gold run in the editor |
| `MODEL=comb1_p80_s0 node leniency.mjs ../review/dev.jsonl leniency_dev.json` | Q1b: extra keys on wires counted right, judged statically (from the handlers) and by running both versions in the editor |
| `sample.mjs <n> <seed> <out> <files...>` | Q2: fixed-seed sample of requests (`sample_dev.txt`, `sample_train.txt`) |
| `judgments.json`, `tally.mjs` | Q2: my judgements (every request not listed is "correct") and the rates |
| `python3 -I patterns.py` -> `patterns.json` | counts of the flagged constructions over dev and all of msg2 |
| `editor_probe.mjs` | four small runs of the editor that decide what some labels execute |

The copy of the pipeline reproduces llm_score exactly: rules 793/1126 (70.4%), VSS SEG=gold 738/1126 (65.5%), VSS own cut 593/1126
(52.7%), the numbers in `training/sketch/COMBINED.md`.

---------------------------------------------------------------------------------------------------------------------------------------

## 1a. Scorer self-test: gold as the reading

Each gold message was turned into the nodes a reader emits (lists as arrays, `count` / `distance` as numbers, every `mention(...)` as a
mention wire referenced by `{ref}`, `$new` as a reference to the latest create / duplicate wire of the message), then scored by the
llm_score path (canon -> LCS alignment on type + action/ask -> every gold key compared).

**Result: 1126 / 1126 wires right (100.00%), 0 extra wires, 253 / 253 messages fully right. No case fails.**

Also checked, all clean: every mention in the gold has its keys in alphabetical order and only keys a reader can produce; every gold key
and value passes the editor's legend check (`legend.validate`, 0 errors, 0 warnings); no `$new` without an earlier create.

Side findings (not failures of llm_score):
- **`bench-canon.js` `score()` ignores the arguments of multi-request rows.** Its `row.wires` branch passes each gold wire to `score1`,
  which reads `row.gold`; a wire in the TRAIN_MSG_SPEC format has `args`, not `gold`, so only the type is compared. Fed deliberately wrong
  nodes (same types, wrong actions), it scores 253 / 253 dev messages fully right. `llm_score.mjs` does not use this function; the browser
  bench (`docs/js/ui.js:639`) and `score_all.mjs` do. Whether any bench set has `wires` rows I did not check (those files are off limits).
- 5 gold wires fail when the gold itself is run in the editor (canvas = the message's names): 4 in 3 messages (hm-0509, sm-0236, sm-0411)
  because an in-message "undo" reverts the previous turn (here: the canvas itself), see pattern P4; 1 (hm-0048) refers to Collar after
  "Rename Collar to Neckline" in the same message (right: `target: Neckline`).

## 1b. Leniency: extra keys

llm_score compares only the keys the gold has. For every request counted right, the keys the reading has and the gold lacks were listed
and judged two ways: **static** (the handler that runs the wire reads that key and the value is not the handler's default; e.g. an extra
`shape=circle` on a create is the default, an extra `target` on a create is never read, an extra `pairing=chain` on a list without `to`
is the default branch, logic.js:567-570) and **dynamic** (gold-prefix + gold wire vs gold-prefix + gold wire + the extra keys, run in a
fresh editor; state and answer compared). They agree except 5 rules cases where the synthetic canvas happened to give the same answer
(an extra `target` on extreme / count, which restricts the answer to that one shape); static is used for the numbers.

Separately: `scale` is never compared (bench-canon.js:4), so a resize that grows when the text says shrink counts as right.

| reader (dev, comb1_p80_s0 for VSS) | right | right with extra keys | extra keys change execution | + resize direction wrong | strict re-score |
|---|---:|---:|---:|---:|---:|
| rules                | 793 (70.4%) | 51 | 35 | 0 | **758 (67.3%)** |
| VSS, cut as annotated (SEG=gold) | 738 (65.5%) | 28 | 25 | 2 | **711 (63.1%)** |
| VSS, own cut         | 593 (52.7%) | 22 | 15 | 2 | **576 (51.2%)** |

Messages fully right: rules 44 -> 35, VSS gold cut 53 -> 38, VSS own cut 10 -> 9.

Which keys (count on wires counted right):
- rules: `connect +arrow=none` 23 (22 are "... with a dotted / dashed / solid line"), `+target` on create 4 / undo 3 / redo 2 / forget 1
  (never read: no change), `extreme +target` 4, `nearest +target` 2 (not read when an anchor exists), `resize +size=large` 2 (sets a size
  instead of scaling; one of them on "shrink Kitchen"), `set +color=lime` 1 ("Make the Chair huge"), `set +size=large` 1, `connect
  +style=dotted / +color=pink / +arrow=both` 1 each, `count +target` 1, `describe +target` 1, `move +color/+shape/+size` 4, `connect +shape` 1,
  `rules +color` 1 (these 6 are never read: no change).
- VSS gold cut: `connect +to` 18 (a chain / next / all list that also gets a `to`: logic.js:568 concatenates from + to, so the chain gets
  a repeated name, i.e. a self-loop, and for "all" duplicate pairs), `connect +arrow=none` 7 (all "... line"), `connect +style=solid` 5
  (default, no change).
- VSS own cut: `connect +to` 13, `connect +style=solid` 7 (no change), `+style=dotted` 1, `set +size=large` 1.
- Resize direction: VSS reads "shrink Kitchen" and "Shrink the Office" as grow (scale 1.5) and both count right. The rules reader has none.

**The arrow=none cases are a label question, not only a reader one.** The gold writes no arrow key for "... with a dotted line" (70 of 72
such connects in dev + msg2; the TRAIN_MSG_SPEC example does the same), but the editor's own cue list maps `line` to `arrow=none`
(logic.js:561) and the legend says "none (a plain line, no arrowhead)". If "line" is read as the editor reads it, those wires are not
wrong: rules 779 (69.2%), VSS gold cut 718 (63.8%), VSS own cut 576 (51.2%).

So: the scorer's leniency moves the rules reader by 1.2 to 3.1 points and VSS by 1.5 to 2.4 (gold cut) / 1.5 (own cut). The order
of the readers and the gaps between them do not change. Other leniencies checked and negligible on dev: label / name case (0 right wires
differ only by case), `$new` identity (canon writes every reference to a created shape as `$new`; of the right wires with `$new`, 0 (rules)
and 1 (VSS) come after two or more creates, where the scorer cannot tell which shape was meant).

---------------------------------------------------------------------------------------------------------------------------------------

## 2. Label audit

Method: requests (gold wires) drawn uniformly, seed **20261031** (mulberry32 + Fisher-Yates, `sample.mjs`), 150 of the 1126 dev requests
and 100 of the 4790 msg2 requests (both writers pooled). Each judged against the whole message text, by what the editor would execute:
C correct, A acceptable alternative, W wrong, U the text is ambiguous; U-line marks the "... line" connects of section 1b (no arrow key).
Interval: Wilson 95%.

| | n | C | A | W | U | U-line | wrong | wrong if "line" = arrow none |
|---|---:|---:|---:|---:|---:|---:|---|---|
| dev | 150 | 138 | 2 | 2 | 1 | 7 | **1.3% [0.4-4.7%]** | 6.0% [3.2-11.0%] |
| training msg2 | 100 | 95 | 0 | 2 | 2 | 1 | **2.0% [0.6-7.0%]** | 3.0% [1.0-8.5%] |

(Wrong or ambiguous together: dev 6.7% [3.7-11.8%], training 5.0% [2.2-11.2%].)

Wrong labels and the right one:
- dev #95 hm-0058 "What is next to the Shelf" (shop floor layout): gold `neighbors` (what is connected). Right: `question list
  position=near anchor=Shelf`.
- dev #141 sm-0166 "Is Welcome the topmost shape, or Landing?": gold `check position=top` (is it in the top band of the canvas).
  Right: `question extreme superlative=topmost`, as the other 61 "Is X the -most" questions are labelled.
- train #6 sm2-0167 "are they bigger than the Hall" (Room1, Room2): gold `check target=Room1,Room2`; the editor checks only the first
  target (logic.js:699, :839) and answers for Room1 alone (`editor_probe.mjs` (c)). Right: two wires, one check per room.
- train #17 sm2-0348 "Align the sensors in a column" (Sensor + 3 copies): gold `arrange target=Sensor,mention(quantifier=all,
  recency=newest)`; with quantifier=all the editor ignores recency (logic.js:418), so every shape is arranged (probe (d)). Right:
  `command align target=Sensor,$new axis=vertical` (arrange layout=column also fits; the target is the error).

Acceptable alternatives: dev #5 ("make them gold" after creating five stars: `mention(quantifier=all,shape=star)` where the convention
says `$new`; same result unless other stars exist), dev #106 ("The Dogs wing is on the left" as `move`; the convention says fact; same
placement). Ambiguous: dev #14 (a conditional, "If the ticket is urgent, make Triage huge, otherwise leave it"), train #2 ("undo that"
after a request already taken back), train #57 ("Redo that last move, I think I messed it").

### Systematic patterns (counts over dev + all of msg2, `patterns.py`)

- **P1 "line" without "plain" -> no arrow key**: dev 33, sonnet_msg2 21 (+2 with arrow=none), haiku_msg2 16. Consistent with the spec's
  example, against the editor's cue list. Decide which one holds and make the other match; until then the rules reader's arrow=none on
  these (21 dev wires) is hidden by the scorer's leniency.
- **P2 a question with "next to" / "beside" is always `neighbors`** (12 of 12: dev 2, sonnet 5, haiku 5), while "near" / "close to" is
  always spatial (65 of 65: check / list / exists / count with position=near). The legend gives "next to", "near", "beside" all as cues of
  position=near; neighbors' cue is "what is connected to". Several are spatial in context (hm-0058 shop, sm2-0078 "Dad and Mum are in the
  middle, Sis and Bro below ... Which shapes are next to Dad?", hm2-0017 after "space ... out evenly"). One construction, one label,
  partly wrong.
- **P3 sonnet_msg2 only: "the copies / the clones / the newest ones" -> `mention(quantifier=all,recency=newest)`** (11 wires, 0 in
  haiku_msg2 and dev). In the editor this matches every shape on the canvas ("Make the copies purple" paints everything). Right: `$new`
  (the duplicate / create wire's value is exactly the new shapes), e.g. `target: Sensor,$new`.
- **P4 correct labels the editor executes differently from the text (editor findings, not label errors):**
  - an undo / redo after a command of the same message: dev 18 (10 undo, 8 redo), msg2 172 (105 undo, 67 redo); in the samples dev 2 of
    150, training 6 of 100. A message is one transaction, and `undo` restores the state before the PREVIOUS turn, discarding everything
    the current message already did (`editor_probe.mjs` (a): turn 3 "connect A to B, then undo that" also removes turn 2's B->C; as the
    first message after the canvas it empties the canvas). The legend has no other way to say it, so the labels are right; what the
    editor does with them is not what the text asks.
  - a chain / "each to the next" whose order in the text differs from the canvas order: dev 9, msg2 39 (samples: dev 2, training 2).
    logic.js:568 sorts the shapes by creation order before linking (probe (b): from=Fox,Corn,Hen on canvas Fox,Hen,Corn draws Fox->Hen->Corn).
    This assumes the canvas order is the order of `names`; with a `$new` in the middle of a chain (sm2-0546 "Link Spawn to Key and Key
    to Chest", Key just created) it is wrong whatever the order of the names.
- Single cases, not systematic: a check with two targets (1, sm2-0167), "Is X the topmost" as check (1 of 62), a pronoun for shapes
  created in the message written as a mention instead of `$new` (2: sm-0113, sm2-0258), the old name after a rename (hm-0048, sm2-0059),
  conditional requests written as plain commands (4).

## Bottom line

- The scorer does what it claims: the gold scores 100% with 0 extra wires; mentions, lists, `$new` and the order-free keys are handled.
- Its leniency (extra keys ignored, `scale` ignored) inflates the reported numbers by 1.5 to 3.1 points per reader on dev (strict: rules
  67.3%, VSS 63.1% gold cut, 51.2% own cut); it does not change which reader is ahead. Most of it is two things: the "line" / arrow
  question (rules) and chain lists that also get a `to` (VSS, a self-loop in the drawing). Counting an execution-changing extra key as
  wrong is a one-line change in the matching rule and would make the numbers mean "the editor does what the gold does".
- The labels are good: 1.3% wrong on dev [0.4-4.7%], 2.0% on training [0.6-7.0%]; up to 6.0% / 3.0% if "line" means no arrowhead.
  The systematic problems are P1 ("line"), P2 ("next to" = neighbors), P3 (sonnet's `quantifier=all,recency=newest`), and two editor
  behaviours (P4: in-message undo / redo, chain order) that make some correct labels execute differently from the text.
- `bench-canon.js` `score()` does not compare arguments for rows with `wires`; any number produced through it on such rows is type-only.
