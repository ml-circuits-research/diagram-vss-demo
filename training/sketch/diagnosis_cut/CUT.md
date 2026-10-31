# Where the VSS own cut loses (2026-10-31)

Read-only analysis. Nothing in the repository was edited, committed or trained. Inference only (CPU, node).

Data: the old dev file `scratchpad/review/dev.jsonl` (253 held-out TRAINING messages, 1126 annotated requests; read before). As a check
on decoding choices, also `scratchpad/dev_new/msg2/dev.jsonl` (923 requests) and `scratchpad/dev_new/long/dev.jsonl` (519 requests),
also held-out training messages and also read before. No test set was opened.

Models: fix_p80_s0, m0_p80_s0, fv2_p80_s0 (one-request reader, cut by `docs/js/vss-centers.js`), centres2_p80_s0 (centre model,
`SEG=centres-model`). Scoring is llm_score.mjs's (LCS alignment on type + action, then every gold key).

## Scripts (all in this folder)

| file | what it does |
|---|---|
| `cutstats.mjs` | an instrumented copy of vss-centers.js + llm_score.mjs scoring. Per message: every span read alone (= `SEG=gold`), the cut with every centre (event token, how found: literal legend word / learned rule / pattern insertion, whether it lies inside the previous fired phrase, which literal event words the scan skipped), every chosen stretch and its reading, the alignment of both to the gold. `CUT=base` is vss-centers.js unchanged; other values are decoding variants (keys below). For a centre model it reproduces `SEG=centres-model`. `MODEL=<m> CUT=<spec> node cutstats.mjs <dev.jsonl> <out.json>` |
| `analyze.py` | per span: centres found / readings kept, cut right, alone right; first cause of every cut miss; source of every extra wire; mechanism of every loss and extra. `python3 analyze.py out.json [--alone other.json] --json out.an.json` |
| `summarize.py` | the tables below from `*.an.json` |
| `runvar.sh`, `runvar2.sh` | run variants one after another (one CPU: another agent was using the other) |
| `probe.mjs` | reads single stretches (used for the examples) |
| `summary_base.md` | the full base tables for the four models (every cause row) |
| `variants_fix.txt`, `variants_all.txt` | every variant's totals |

Reproduction check (`CUT=base`): fix 61.0% (x71) alone / 47.1% (x335) cut; m0 63.6% (x66) / 50.0% (x328); fv2 63.5% (x72) / 45.3%
(x386); centres2 50.6% (x144); msg2 and long base numbers equal FRONT_V2.md's. Identical to the reported numbers.

"Alone" for centres2: a centre model cannot read a span alone (NOTES.md decision 11), so its "alone" column is m0_p80_s0 (the
one-request model with the same front.json).

## 1. Per annotated span: readings the cut makes in it (centres found before the DP in brackets)

| model | readings in the span | spans (found) | cut right | the same spans read alone |
|---|---|---|---|---|
| fix | 0 | 146 (144) | 8 (5.5%) | 27 (18.5%) |
| fix | 1 | 841 (824) | 473 (56.2%) | 571 (67.9%) |
| fix | 2 | 124 (140) | 49 (39.5%) | 79 (63.7%) |
| fix | 3+ | 15 (18) | 0 (0.0%) | 10 (66.7%) |
| m0 | 0 | 144 (144) | 10 (6.9%) | 28 (19.4%) |
| m0 | 1 | 842 (824) | 499 (59.3%) | 597 (70.9%) |
| m0 | 2 | 125 (140) | 54 (43.2%) | 80 (64.0%) |
| m0 | 3+ | 15 (18) | 0 (0.0%) | 11 (73.3%) |
| fv2 | 0 | 126 (125) | 7 (5.6%) | 35 (27.8%) |
| fv2 | 1 | 810 (789) | 454 (56.0%) | 552 (68.1%) |
| fv2 | 2 | 175 (194) | 49 (28.0%) | 118 (67.4%) |
| fv2 | 3+ | 15 (18) | 0 (0.0%) | 10 (66.7%) |
| centres2 | 0 | 168 (99) | 0 (0.0%) | 32 (19.0%) |
| centres2 | 1 | 914 (782) | 547 (59.8%) | 660 (72.2%) |
| centres2 | 2 | 44 (190) | 23 (52.3%) | 24 (54.5%) |
| centres2 | 3+ | 0 (55) | - | - |

Even with exactly one reading in the span, the cut is 11-12 points under the reading alone (the stretch is not the span, below).
Spans with 2+ readings are read alone at ~64-67% and cut at 0-44%. fv2 has 175 such spans against fix's 124: this is where its
reading gain is lost.

## 2. Extra wires by source

| source | fix | m0 | fv2 | centres2 |
|---|---|---|---|---|
| a second reading inside one annotated span | 158 | 157 | 213 | 42 |
| the span's only reading, with another action than the gold (counted as a miss + an extra) | 44 | 38 | 42 | 53 |
| a centre outside every span, in a sentence that holds a span | 86 | 86 | 83 | 49 (both kinds) |
| a centre outside every span, in a sentence with no span | 47 | 47 | 48 | |
| total | 335 | 328 | 386 | 144 |

Event tokens of the second readings (fix; the same pattern for m0, fv2 adds `move + move` 30, `make + make` 7):
`extreme_q + extreme_q` 35, `path_q + path_q` 15, `connect + connect` 14, `path_q + path_q + path_q` 12, `nearest_q + nearest_q + path_q` 10,
`arrange + arrange` 9, `connected_q + connected_q` 8. Extra wires by centre token (fix): `is` 85, `path_q` 41, `extreme_q` 37, `connect` 29,
`connected_q` 21, `move` 20, `which` 16. The centre model's second readings are `is` + the question token: `is + is_q` 14,
`is + connected_q` 9, `is + path_q` 4; its extras by token: `is` 79 of 144.

## 3. Missed requests (cut not right): where the request's centre went. In brackets: right when the span is read alone (lost by the cut)

| what happened to the request | fix | m0 | fv2 | centres2 |
|---|---|---|---|---|
| no centre in the span | 136 (20) | 134 (20) | 118 (29) | 99 (2) |
| - no event token even when read alone (verbless for the front end) | 90 (0) | 90 (0) | 59 (0) | 92 (0) |
| - event token alone, not in the message scan (rule context; skipped by the scan) | 46 (20) | 44 (20) | 59 (29) | 7 (2) |
| centre found, not read (dropped by the DP / null >= 0.5 or no-sense) | 2 (1) | 0 | 1 (0) | 69 (30) |
| centre present, the request's words taken by a neighbour centre's stretch | 72 (61) | 74 (58) | 67 (53) | 1 (0) |
| centre present, read wrong: | 386 (111) | 355 (105) | 430 (150) | 387 (147) |
| - split into 2+ readings | 90 (46) | 86 (43) | 141 (85) | 21 (5) |
| - stretch stopped by a second event token of the span | 36 (15) | 23 (7) | 55 (19) | 71 (40) |
| - stretch left span words out (no other event token) | 128 (16) | 116 (19) | 112 (18) | 118 (45) |
| - stretch took words outside the span | 77 (31) | 72 (33) | 65 (25) | 23 (10) |
| - stretch = span, read differently | 55 (3) | 58 (3) | 57 (3) | 154 (47) |
| total misses | 596 (193) | 563 (183) | 616 (232) | 556 (179) |

So 193 / 183 / 232 requests that the one-request reader reads right alone are lost by vss-centers.js; 179 by the centre model.
(The cut also gets 36 / 30 / 27 / 33 right that are wrong alone.)

## 4. Mechanisms (counted on the base runs; lost requests = right alone, not right cut / extra wires)

| # | mechanism | fix | m0 | fv2 | centres2 | where it sits |
|---|---|---|---|---|---|---|
| M1a | ONE trigger phrase gives two or three centres: `centres()` resumes one token after the fired rule's FIRST word, inside its phrase, and the rest of the phrase fires again ("which shape is the leftmost": rule `the leftmost` -> `extreme_q`, then `leftmost` -> `extreme_q` again; "is there a path from" -> 3 x `path_q`; "directly linked" -> 2 x `connected_q`) | 30 / 60 | 26 / 60 | 32 / 67 | 0 / 0 | vss-centers.js `centres()`: `from += kk + 1` |
| M1b | a literal legend event word of the request (`is`, `which`, `make`, ...) beside its own action token; besides being a centre, it blocks the whole span: `read()` accepts a stretch only with EXACTLY one event token, so "Is Start still connected to Check" can never be read whole | 13 / 15 | 5 / 13 | 15 / 16 | 23 / 35 | vss-centers.js (one-event-token filter, no joined stretch); centre model: the null of `is` |
| M1c | two trigger words of one annotated request | 0 / 2 | 0 / 2 | 1 / 4 | 1 / 3 | label / data |
| M2 | a learned rule fires inside the request on a word that is not its trigger (`chain` -> connect in "Connect A, B and C in a chain"; "Is" -> `is_q` before `connected_q`; fv2: `NAME to NAME`, `on the left` -> move) | 19 / 81 | 19 / 82 | 56 / 126 | 32 / 4 | front-end rules (v2 learns 1.7x more), and the cut that turns every firing into a centre |
| M3 | the request's words go to the next centre's stretch: in 43 of the 72 (fix) that centre is a chatter `is` to the right ("Make the Car a medium gray rectangle, uh, the cabin is steel" -> "Make" / "the Car a medium gray rectangle, uh, the cabin is" read as a fact) | 61 / 0 | 58 / 0 | 53 / 0 | 1 / 0 | the per-stretch score: every reading earns +1 for its own event token, so "Make" alone (1) + the fact (5) ties the right cut (5 + 1), and ties go to the shortest first stretch |
| M5 | event token found alone, not in the message: the rule's context at the span start (B) differs inside the sentence, or a literal skipped because the scan takes the first rule in RULE order, not the leftmost | 20 / 0 | 20 / 0 | 29 / 0 | 2 / 0 | vss-centers.js `centres()` (rule order, contexts on slices); front-end contexts |
| M6 | stretch = span (or the only reading), read with another action: the reader | 3 / 44 | 3 / 38 | 3 / 42 | 47 / 53 | reader; for centres2, 14 of the 47 are "Is X a circle" where the message normalization keeps `is` (fact) and the span alone gets `is_q`: front.js `normalizeMessage` gives the first word of a sentence the context of the `.` before it, not `B` |
| M7 | one centre, no other event token, but the stretch is not the span: cut short ("Move Logout to the bottom left corner" -> "...the bottom", a tie resolved to the shortest stretch) or extended into chatter whose words the reader places ("Move Bar to the right of Tables, because guests like the bar near") | 47 / 0 | 52 / 0 | 43 / 0 | 102 / 0 | the per-stretch score (vss-centers.js); centres2: the attachment (< 0.5) |
| M8 | a centre outside every span (`is` in chatter: "this is", "the cabin is") | 0 / 133 | 0 / 133 | 0 / 131 | 0 / 49 | front end (literal legend word) + no rejection of a reading that fills no role |
| M9 | centre found, not read | 0 / 0 | 0 | 0 | 18 / 0 | centres2: null probability |

(A request is counted under the first mechanism that explains it; M4, verbless requests, loses nothing to the cut: they are wrong alone too.)

The two kinds the brief asked to separate: "two event tokens of ONE request" (M1a + M1b + M1c) lose 43 / 31 / 48 requests and make
77 / 75 / 87 extra wires; "a rule firing on a non-trigger word" (M2) loses 19 / 19 / 56 and makes 81 / 82 / 126. Most of fv2's extra
loss (232 vs 193) is M2. Both are the same decoding fact: the cut never lets a stretch hold two event tokens.

The reader's own two-verb handling (CAPACITY.md S1) bounds what any cut can get from these spans: of the 190 dev spans whose alone
normalization holds 2+ event tokens, fix reads 129 right alone and picks the wrong event in 36 (m0: 136 right, 30 wrong event).

## 5. Fixes measured without training (decoding only, vss-centers.js copy; fix_p80_s0, old dev)

Variant keys of `cutstats.mjs` (CUT=key=value,...):
- `scan=resume`: the scan resumes after the fired rule's whole phrase (fixes M1a only).
- `scan=ltr`: the centres are the event tokens of a left-to-right scan, the loop of front.js `normalizeMessage` (at each position the
  first rule, in the learned order, that starts there; a literal event word is a centre; resume after the phrase). Fixes M1a and the
  skipped literals of M5, but makes every literal `is` / `which` a centre.
- `G=2|3`: a stretch may hold up to G consecutive centres; it is read alone exactly as an annotated span (front.js `normalize` + one
  reading, more than one event token allowed: the reader's own two-verb choice). The DP compares the joined reading with the split by
  the same total score.
- `score=noev`: a stretch scores (non-event content tokens placed) - (non-event content tokens unplaced); event tokens neither for nor
  against (base: every content token, so each reading earns +1 for its own event token, which rewards splitting).
- `minrole=legend`: a reading that fills none of its event's roles is not a request, unless the legend gives the event no roles
  (undo, redo, forget, cycle). From the legend, no word list.
- `tie=keep`: on an equal score, the segmentation that drops fewer readable centres wins (base: the first one found).
- tried and not kept: `tie=fewer` (on an equal score, fewer readings: over-joins parallel requests), `tie=near` (words to the nearer
  centre), `tie=margin` (the weakest reading's margin), `joindiff` (no join of two centres of the same token), `score=roles`, `nv=any`.

| variant (fix_p80_s0, old dev, 1126 wires) | wires right | extra wires |
|---|---|---|
| base (vss-centers.js today) | 47.1% | 335 |
| scan=resume (one line) | 48.9% | 260 |
| scan=ltr | 49.4% | 491 |
| scan=ltr, noev, keep, minrole=legend, no joins (G=1) | 47.8% | 246 |
| scan=ltr, G=3, base score | 54.3% | 222 |
| scan=ltr, G=3, noev, keep | 54.6% | 168 |
| **Q1 = scan=ltr, G=3, noev, keep, minrole=legend** | **54.8%** | **109** |
| scan=ltr, G=3, noev, fewer+keep+near, minrole=legend (P) | 54.0% | 109 |
| scan=ltr, G=2 (same as P) | 54.2% | 129 |
| base scan, G=2, noev, fewer | 52.0% | 90 |
| scan=resume, G=3 (same as P) | 51.2% | 95 |
| reading alone (SEG=gold) | 61.0% | 71 |
| centres2_p80_s0, its own cut | 50.6% | 144 |
| rules | 70.4% | 182 |

The joins carry the gain (G=1 -> G=3: 47.8% -> 54.8%); `noev` + `minrole=legend` carry the extra wires (222 -> 109).

Q1 on the other models and dev files (one decoding, chosen on fix / old dev; msg2 and long were not used to choose it):

| | base cut | Q1 cut | reading alone (SEG=gold) |
|---|---|---|---|
| fix, old dev | 47.1% (x335) | 54.8% (x109) | 61.0% (x71) |
| m0, old dev | 50.0% (x328) | 56.1% (x114) | 63.6% (x66) |
| fv2, old dev | 45.3% (x386) | 56.4% (x124) | 63.5% (x72) |
| fix, msg2 (923) | 40.3% (x414) | 45.6% (x163) | 45.7% (x96) |
| m0, msg2 | 42.7% (x411) | 48.3% (x164) | 50.1% (x91) |
| fv2, msg2 | 39.9% (x451) | 47.8% (x163) | 48.6% (x97) |
| fix, long (519) | 37.0% (x243) | 40.1% (x130) | 47.4% (x46) |
| m0, long | 37.2% (x235) | 37.8% (x116) | 46.4% (x40) |
| fv2, long | 36.8% (x254) | 39.3% (x141) | 49.1% (x51) |

With Q1 the front-end v2 gain is no longer lost to the cut: fv2's own cut goes from below fix's (45.3 vs 47.1) to above it (56.4 vs
54.8). Every Q1 number beats centres2's own cut (50.6% x144) on old dev. Cost: 69 s for the old dev file against 55 s (m0, node).

What Q1 leaves (fix, old dev; lost requests / extra wires): M7 stretch not the span 51 / 0 (44 of them take outside words); M10 a
joined stretch holding two requests ("Hero is blue and Villain is black", "Put Trap1 at the left and Trap3 at the right") 20 / 0;
M3 10 / 0; M9 unreadable 6; M2 5 / 15; M6 3 / 48; M8 0 / 43 (`is` 28, `is_q` 16 of all extras). Per span: 918 spans with one
reading, 65.7% right (alone 70.2%); spans with 2+ centres found are now cut as well as they are read alone (192 spans, 55.7% vs 56.2%).

## 6. Proposal

**The cheapest generic fix is Q1, all in vss-centers.js decoding, no training, no word list:**
1. centres = the event tokens of the left-to-right rule scan already in front.js `normalizeMessage` (replaces `centres()`, whose two
   faults are M1a and M5: it resumes inside a fired phrase and takes rules in rule order instead of text order);
2. a stretch may hold up to three consecutive centres and is then read like an annotated span; the DP decides join vs split by the
   reader's fit: non-event content placed minus non-event content unplaced (the event token no longer pays a reading for itself);
   ties keep the readable centres;
3. a reading that fills none of its event's roles is not a request, unless the legend's event has no roles.

Sized on old dev: fix +87 wires (47.1 -> 54.8%), extra wires 335 -> 109; on msg2 / long (not used to choose) +49 / +16 wires for fix.
Part 1 alone (`scan=resume`, one line) is +20 wires and -75 extra wires; part 2 is where most of the gain is; part 3 removes 59 extras.

Because the variants were compared on the old dev file, its 54.8% is a selection number. A pre-registration for the coordinator
(AGENTS.md rule: one change, threshold fixed first): implement Q1 behind a switch in docs/js/vss-centers.js (default unchanged;
`CUT=base` byte-identical), check that `cutstats.mjs` and llm_score.mjs agree on the three dev files, then measure ONCE on a fresh set
with spans. The threshold is the coordinator's to fix; for reference, on old dev Q1 is 6.2 points under the reading alone with
1.54x its extra wires for fix, 7.5 points / 1.73x for m0.

Next, by measured size (all decoding except where said):
- M7, 51 lost: a stretch extended into chatter whose words the reader places changes the reading. Generic idea, measurable without
  training: accept an extension only if the reading of the shorter stretch keeps its event and fillers (the added words must be
  explained without re-reading the rest). Bound 51 on old dev.
- M10, 20 lost: joins of parallel requests ("A is blue and B is black"). `tie=fewer` makes it worse, `joindiff` costs more than it
  saves (54.0%); open.
- S1 (reader, training): 36 requests with two event tokens read alone with the wrong event (fix); now that joined requests reach
  the reader whole, this is the reading's bound on them (CAPACITY.md: under-trained, the small world reads them).
- M8 chatter `is`, 43 extras after Q1: front end (the legend's literal `is`); the reader returns `ok` for "is a bit of a mess".
- Centre model (centres2): its losses sit in the reading of the right members (47, of which 14 from `normalizeMessage` giving a
  sentence's first word the context of the `.` before it instead of B; fixing that changes its training rows, so it needs retraining),
  the null (30) and the attachment (45 cut short + 40 stopped by `is`). The one-request reader with Q1 is already above it.

## 7. Q1 implemented (working tree on fe7e599) and the pre-registered test (written 2026-10-31 before any score on fresh1)

Implementation (default unchanged):
- `docs/js/vss-centers.js`: `vssCentres(text, names, F, vss, { cut: "q1" })` calls the new `vssCentresQ1` (also exported; `spans: true`
  returns `{src, c0, c1}`). Without `cut` the old code runs, untouched. The one constant: `MAX_JOIN = 3` (centres per stretch). No other
  number: the score, the role rule (from the legend's event roles) and the tie rule (fewer dropped readable centres) have none.
- `training/sketch/llm_score.mjs`: `SEG=q1`. `training/sketch/error_analysis.mjs`: `SEG=q1` (each gold request read from the unused q1
  stretch that overlaps its span most; X0q when none; extra stretches counted). `docs/js/vss-formalizer.js`:
  `formalize(text, ctx, rulesFormalize, { cut: "q1" })`; the callers in ui.js pass nothing (default cut).
- Checks (old dev file, fix_p80_s0): default own cut 47.1% (530/1126), 335 extra wires, and SEG=gold 61.0% / 71, with stdout and
  `--dump` byte-identical to the scripts before the change; error_analysis.mjs default and SEG=centres-model (centres2_p80_s0) output
  byte-identical. The q1 cut gives the same stretches as the analysis copy (cutstats.mjs `CUT=scan=ltr,G=3,score=noev,tie=keep,minrole=legend`)
  in 253 / 253 messages; llm_score SEG=q1 54.8% (617/1126), 109 extra wires (= section 5).

Pre-registration (one measurement, nothing changed after it):
- Test set: `training/sketch/llm_bench/fresh1` (two folders, `sonnet` and `haiku`; 1000 messages), never scored before. It is scored
  only; its messages and per-message outputs are not opened by this agent (no `--dump`, no `-v`): aggregate lines only.
- Models: kinds_p80_s0 and comb1_p80_s0, as exported in docs/model.
- Commands, for each model M: `MODEL=M node llm_score.mjs llm_bench/fresh1/sonnet llm_bench/fresh1/haiku` (default own cut),
  the same with `SEG=q1`, and with `SEG=gold` (reading alone, reported only; meaningful only if the rows carry spans).
- Hypothesis: the q1 cut loses fewer requests than the default cut on messages never seen, as on the three dev files.
- Criterion, per model, on the whole of fresh1 (llm_score's ALL line over both folders): wires right with SEG=q1 minus wires right with
  the default cut >= +3.0 points, AND extra wires with SEG=q1 < extra wires with the default cut. PASS if both models meet both
  conditions; otherwise FAIL (reported per model). Each half (sonnet, haiku) is reported, not part of the criterion.
- Every scoring run is appended to `training/sketch/TEST_LOG.md`.

### Result on fresh1 (one run each, nothing changed after it): FAIL

llm_score.mjs, main scorer; wires right (extra wires). All rows of fresh1 carry spans (500 + 500 messages), so SEG=gold is the reading alone.

| model | half | rules | SEG=gold | default own cut | q1 | q1 - default |
|---|---|---|---|---|---|---|
| kinds_p80_s0 | sonnet (3030) | 69.8% (427) | 57.0% (210) | 47.7% (837) | 50.6% (397) | +2.9 |
| kinds_p80_s0 | haiku (2514) | 78.7% (321) | 66.8% (182) | 59.9% (814) | 59.1% (324) | -0.8 |
| kinds_p80_s0 | **all (5544)** | 73.8% (748) | 61.4% (392) | **53.2% (1651)** | **54.4% (721)** | **+1.2** |
| comb1_p80_s0 | sonnet | 69.8% (427) | 56.5% (211) | 47.7% (836) | 50.1% (387) | +2.4 |
| comb1_p80_s0 | haiku | 78.7% (321) | 66.5% (181) | 59.7% (814) | 60.1% (324) | +0.4 |
| comb1_p80_s0 | **all** | 73.8% (748) | 61.1% (392) | **53.1% (1650)** | **54.6% (711)** | **+1.5** |

Criterion: +3.0 points AND fewer extra wires, per model. Extra wires: met for both (1651 -> 721, 1650 -> 711). Points: +1.2 and +1.5,
NOT met. **FAIL.** No change was made after the numbers (AGENTS.md experiments rule 3).

Root-cause note from aggregate numbers only (the per-act counts llm_score prints; no message or per-message output was opened):
- "not done" rose 16.0% -> 24.9% (kinds) while "done wrong" fell 30.8% -> 20.6%: q1 trades wrong readings for missing ones.
- By action (kinds, wires right default -> q1, of n): describe 99 -> 8 of 104, count 115 -> 76 of 255, connected 89 -> 74 of 123;
  gains: path 10 -> 57 of 174, nearest 38 -> 65 of 66, property 8 -> 36 of 56, move +21, fact +19, check +19 (comb1 the same pattern:
  describe 100 -> 7, count 116 -> 102).
- The describe loss is part 3 of Q1 (a reading that fills none of its event's roles is not a request unless the legend's event has no
  roles): `describe` has the role `object` in the legend, but "describe the diagram"-type requests fill none, and are dropped. On the
  old dev file this was visible but small (describe 10 -> 7 of 12). Count questions with no filled role ("how many shapes are there")
  are hit by the same rule. Describe alone is 91 wires = 1.6 points of the 3.0. A rule from the legend that says which roles an event
  needs is not in the legend today (it lists roles, not required ones); whether to learn "required" from the annotated data, or to drop
  part 3, is a new decision and a new pre-registration, not a patch of this run.
