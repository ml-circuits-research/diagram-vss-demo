# Small worlds, a router and decoding by fit: survey of vss-demo and a design for the editor (2026-10-31)

Read-only. Nothing in /home/claude/vss-demo or /home/claude/diagram-vss-demo was edited, trained or committed. No test set was opened
(llm_bench/*, docs/bench/blind.json, hand_broad). Counts below come from the fit file (`scratchpad/fitset/fit.jsonl`, 947 messages,
4305 requests), the all-data fit split (`scratchpad/kinds/data/fit_all.jsonl`, 2109 / 10215), and the dev files `review/dev.jsonl`
(253 / 1126), `dev_new/msg2/dev.jsonl` (233 / 923) and `dev_new/long/dev.jsonl` (45 / 519). All of these are training-type messages that have
been read before. The scripts are in this folder: `famcnt.py` (rows per family), `fam.py` (family partition from the legend),
`tokamb.py` (which event tokens are ambiguous), `legrouter.py` (router from the legend), `router.py` (router from a learned table). The
normalization uses comb1_p80_s0's front.json.

## 1. Survey of vss-demo

### 1.1 Several worlds and a dispatcher by fit
- **Code.** `tool/sop/infer.py formalize_text` (in our copy: `training/vss/tool/sop/infer.py` l.902-931): every world's reader reads the
  WHOLE sentence. The sort key is (status no-sense/unknown-event, relative residual = residual / no_fit_residual, -mean margin), and the
  smallest key wins. The output is `unknown` with `_world=none` when the best reader cannot place the sentence or its relative residual is >= 1.
  `_world_margin` = the gap in relative residual to the runner-up. The CLI is `sop formalize --worlds <root>` (`cli.py` l.52-67, `readers_of_root`).
  Spec: `tool/SPEC_worlds_server_sop_cli.md` section 9 (l.575-590): "by fit" is labelled PLANNED, with the criterion "identification > 0.95 on
  single-world sentences", and "sticky context" is labelled HYPOTHESIS, not built. Design note: `vision/ACTIVATION_rules_and_worlds_2026-10-26.md` l.24-30
  (level W = "the vote").
- **Measured.** Only a smoke test: "the dispatcher by fit sends 3 + 3 sentences to the right worlds" (`tool/README.md` l.312). The no-fit
  residual 0.9 is stated and not calibrated, because a world folder has no out-of-world sentences (`tool/README.md` l.60-63, l.353). The
  real-data test (seven SNIPS per-intent worlds, vss-vs-bert R72/R75) is cited (ACTIVATION l.30, responses.md D9 l.96-108), but that
  repository is not on this machine and no number is available here (C_existing_mechanisms.md section 7 found the same).
- **Browser.** `app/src/worlds.js dispatch` (l.24-35, 77 lines in all) ranks by status (ok < abstain < unknown-event < no-sense), then by
  residual. `app/src/main.js tryAnimation` (l.268-275) makes the same choice between the animation world and the diagram world. Both
  are code only, with no measurement. The reader's port lists "the dispatcher by fit over several worlds" as not ported
  (`app/READER.md`).
- **Granularity.** One sentence, one world. Mixing worlds inside a sentence is out of scope (SPEC l.590-591, l.594-595).

### 1.2 Negative examples across worlds (R81) and the refusal pass
- R81 (`train.py`): a top-level wire with `_negative=true` is trained toward MINUS its compiled state. Negatives are kept out of
  calibration, schema and evaluation. In vss-demo no frozen example carries `_negative` (STATUS.md l.81-85: 0 files), so there is no result there.
- Our test (training/sketch/ERROR_ANALYSIS.md, "Plan step 1"): 168 negatives from text outside the spans. Reading alone went 60.5 -> 62.4,
  and own-cut extra wires 335 -> 333 against a criterion of < 150: **FAIL**. Cause: no reader status reads the sign of the predicate term,
  so negatives cannot change what the cut decides, and 261 of the 335 extras lie inside annotated spans.
- Synthetic two-world test (research/attention/B/RESULTS.md, E5, l.261-292): world B recovers 0.925 of its gold-cut requests from world A's
  zones. A steals 7% of B's requests through shared action words (add/move/remove). When A is trained with B's requests as "not mine", A
  steals 0.000, B recovers 0.998, and A pays 0.5 points.
- Refusal pass R90/R92/R94 (`infer.py formalize`): a second readout with other decoder keys. Its residual feeds the dispatcher. No result
  is available here.

### 1.3 Staged / hierarchical reading, beams over hypotheses, backtracking
- **Structure hypotheses** (`infer.py read`, l.443-460): every (reporting depth, negation) pair is scored by `structure_score`. The best
  wins, and `margins.structure` = best minus second. This is a small exhaustive beam with the reader's fit as the score. Results:
  - Commands world, 4 scope hypotheses (RESULTS.md 10d, l.991-1016): scope 1.000 on 7 templated forms, and confident-wrong 0.000 at
    coverage 0.968 on the scope-only pairs.
  - Unseen depth 3 (10b, l.924-957): 0.813 FULL.
  - Depth by fit vs by gates (`tool/README.md` "test results"): fit 0.912 vs gates 1.000 on the smoke reader.
- **Hierarchy by nesting** (RESULTS.md "Hierarchy without rules", l.141; 6c, l.319): "X says that P" as an anchor plus a relative path.
  Seen depths 1.00, depth 2 ~0.85.
- **Segmenter** (`app/src/segment/segment.js` l.1-20, l.117-194): cuts at punctuation and connectives, then hill-climbs over cut masks. A
  unit that reads poorly is merged with a neighbour or split at a weak cut and read again. The rule: fewer tokens in poor units, then the
  higher minimum margin, then the smaller residual, then fewer units. A tie produces "two readings to choose from". Measured only with fake
  readers: 47/47 (STATUS.md step 13). No real reader numbers.
- **Choosing among alternatives by "the clearest frame"** (spec 12.3/13.3; spelling, speech, homophones): the reader-as-chooser LOST to the
  classic corrector, form level typed 0.795 vs classic 0.970 and speech 0.600 vs 0.615 (STATUS.md step 9; the classic stays the default).
- **Kind by fit (N5 homographs, RESULTS.md 10e, l.1226-1248)**: superposing the two kinds and choosing at readout by fit gave 0.907 against
  0.989 for the majority kind. **NOT met**. The verb hypothesis won only 0.37 of the verb uses with margin > tau.
- **Re-reading after placing (a form of backtracking)**: `presence_without_placed` subtracts the placed words and re-reads the empty roles.
  It raised heads-exact from 0.942 to 0.979 on the 800 diagram sentences, with 33/33 second-pass roles right (STATUS.md l.298-306). The
  offer rule (l.285-292) gives 30/30 right questions.

### 1.4 Confidence per world
- Margins, tau 0.05 (stated, not fitted), presence margins, abstain, no-sense (> 0.5 of tokens unplaced). Calibration on the reference
  world (10b): confident-wrong 0.000 on seen axes. On unseen transitions the margin is informative, but the model reaches < 1% wrong only
  by abstaining on 30-40%.
- **The residual SHARE is a weak fit signal** (RESULTS.md 15, l.1682-1707, and 15-bis): the share went the WRONG way (gap -0.267). The
  missing information is detectable by the residual's direction, not its size. In our repo, EXPERIMENT_BOUNDARIES found that only 67% of
  gold requests are fully placed, and ERROR_ANALYSIS found that the residual does not separate the cut's extra stretches from spans
  (median 0.00 for both). **Consequence:** a cross-world choice should not rest on the residual.

### 1.5 Mixture inside one world; per-world routes
- **diagram_multi** (English plus Romanian in ONE world, STATUS.md l.226-229): English inside the bilingual world scores heldout
  formulations 0.863 against 0.864 alone, and new identities 0.832 against 0.850. Mixing two languages' templated constructions in one
  world cost at most 0.02.
- **Routes chosen per world** (`activate.py`): the `vorder` decision flipped between probes on one- or two-row differences. A paired test
  fixed it (STATUS.md l.269-283).

### 1.6 How vss-demo's worlds were built (kinds, constructions, requests per input)
- **Kinds were HAND-WRITTEN** (`training/worlds/diagram/generate.py` l.62-110):
  - every verb of all 20 events has the one kind VERB;
  - every value list has its own kind (COLOR, SIZE, STYLE, REL, REGION, ANCHOR, DIR, AXIS, LAYOUT, FRACTION, UNIT, PAIR, LABEL,
    COMPONENT, EDGE);
  - **function words are their own kinds** (l.97: "function words are their own kind (as the paper's worlds)"): to, of, in, on, at, by,
    from, with, into, as, and, the, ",", ".", do, not, never, is, are;
  - small hand groups: a/an -> `a`, QUANT (all, every, each, any, both), DEM, PRON (it, them, everything), INTRO (called, named,
    labelled, titled), and FILLER (about 30 words: please, can, you, i, want, okay, so, um, ...).
  The open gates are GIVEN: to, of, in, on, at, by, from, with, into, as, and, ",", "." (l.147). Our learned kinds (kinds.tsv: VERB 44,
  value kinds, own kinds seen >= 8 times: to, from, the, and, ...) are in the same spirit, but learned.
- **Constructions.** One world with all 20 events: 40 templates x 11 prefix families = 440 formulations, 46 held out. 5000 training
  sentences (COVERAGE.md). The paper's commands world has 7 forms (RESULTS 10d).
- **One request per input.** Level 1 is "one command per sentence" (generate.py docstring, l.10). The decoder reads one event per sentence
  (`tool/README.md` "Limits of v1"). Multi-request input goes through the segmenter, which was never measured with a real reader.
- **What the > 98% is.**
  - Diagram world: 0.979 heads-exact on 800 eval sentences (400 new identities plus 400 held-out formulations of the templates), reached
    by decoder fixes: per-event role sets 0.723 -> 0.942, the bare-label form 0.949, and presence_without_placed 0.979 (STATUS.md
    l.212-306, l.314-322). The trainer's FULL is 0.864-0.896.
  - Reference world: 1.000 on seen formulations, but **0.638 on unseen transitions** (RESULTS 10b).
  - WikiSQL, the one real-text world: selected column 0.81 and FULL 0.38 (8c).
  **Consequence for our hypothesis:** vss-demo did NOT fit by using small worlds. It fit ONE world of 20 events because the text came
  from 40 templates. What made the difference is the number of constructions that share a kind pair, not the number of actions per world.
  Small family worlds help only to the extent that free-text constructions group by family.

### 1.7 The nearest things already measured in our repository
- **Small worlds of one pattern** (CAPACITY.md 2.2): lists 229/260 alone against 47/260 in the full model, `is` + question verb 235/240
  against 182/240, no-own-kind 197/240 against 105/240. These are in-sample, 10-40 epochs.
- **More training of the one big world** (EPOCHS.md): 8 epochs give fit 65.3 -> 67.4 (+2.1). So the one big world is not under-trained.
  This argues for interference (capacity per shared address), not for epochs.
- **Phases keyed per action** (research/attention/port/NOTES.md, run 2, centre reader): per-event-token phase tables gave +2.9 points
  (47.7 -> 50.6%) and **FAILED** the 58% criterion. "Role missed" fell 3.0 points. The cut (null, attachment) and the front end dominated.
- **INTERFERENCE.md** (pre-registered, running): a D sweep and two family-only worlds (A connect+disconnect, B set+create+move). It
  CONFIRMS if a family world fits its own family's requests >= 10 points better than comb1.

## 2. Our copy (training/vss): a dispatcher we can reuse
- Python: `infer.formalize_text` (whole-sentence dispatcher), `readers_of_root`, `sop formalize --worlds`. Reusable as-is for a
  Python check. Its key (relative residual) is the weak signal of 1.4.
- Browser: there is no dispatcher in docs/js (grep finds none). vss-demo `app/src/worlds.js dispatch` (status rank, then residual) is a
  70-line ES module that can be copied and adapted to our vss.js.
- Reusable parts:
  - `docs/js/vss-centers.js vssCentresQ1`: the exact DP over stretches of up to 3 centres per sentence, with the score "content placed
    minus unplaced".
  - `infer.read_message`: the ignored zones.
  - `msg_to_world.py FAMILY=` (working tree, INTERFERENCE): only a family's rows. **But its legend still lists all 35 events** (l.93-95),
    so another family's event token can become this world's predicate. A routed world must list only its own events (a one-line filter).
- Per-world unplaced is NOT comparable across worlds: `unplaced` = unknown plus the world's own `content_kinds` (infer.py l.830-833). A
  cross-world score must count content tokens with one global set.

## 3. Design for the editor (one page)

**Worlds: 9 action families**, derived from the legend alone. Average-linkage Jaccard over `events[].roles`, merging while two clusters
share >= 0.4 of their roles (a stated constant, not tuned on any reading; the next merge is at 0.39) (`fam.py`).

| world | events | rows fit (old) | rows fit (all data) | dev | msg2 | long |
|---|---|---|---|---|---|---|
| W1 place | create, move | 893 | 1793 | 247 | 129 | 120 |
| W2 object-only | degree, delete, describe, duplicate, label, neighbors, property, rename, swap, toBack, toFront | 469 | 1345 | 120 | 184 | 38 |
| W3 attributes | check, fact, rule, set | 1040 | 2308 | 275 | 153 | 153 |
| W4 layout | align, arrange, distribute, resize | 202 | 574 | 48 | 76 | 24 |
| W5 connect | connect | 688 | 1587 | 173 | 122 | 81 |
| W6 graph | disconnect, path, reachable | 178 | 463 | 56 | 53 | 11 |
| W7 no-role | cycle, forget, redo, undo | 129 | 435 | 35 | 57 | 13 |
| W8 scene sets | connected, count, exists, list | 321 | 931 | 91 | 89 | 42 |
| W9 superlatives | extreme, nearest | 385 | 779 | 81 | 60 | 37 |
| total | | 4305 | 10215 | 1126 | 923 | 519 |

A message holds 3-4 families (fit: 430 messages with 3 families and 388 with 4, out of 947; long: 5-8). So routing must be per stretch.
A per-message dispatcher like vss-demo's, or a "sticky context", would misroute most requests.

**Kinds per world.** First experiment: the shared kind lexicon learned from all messages (as INTERFERENCE: unchanged), and the
legend of the world restricted to its family's events. A foreign event token keeps the kind VERB but cannot become this world's predicate.
Later, each as its own one-change experiment:
- the KINDS.md rule recomputed on the family's rows (fewer own kinds per world);
- per-event verb kinds inside a world (VERB_<event>). This is affordable because K is small per world, and it is the per-action keying
  that run 2 tried only in the centre reader.

**Router (level 1, from the action token, nothing learned).** Candidate worlds = the families of the event tokens in the stretch, through
the legend (event token -> event -> family). Measured on the gold spans of dev (`legrouter.py`):
- 77.4% have one family, the right one;
- 2.7% have one family, a wrong one (a trigger of another action: `label` in connect spans, `delete` in undo spans);
- 11.5% have 2-3 families, with the gold among them in 11.3%. These are almost all `is` (W3 fact) and/or `which` (W8 list) beside a
  question token (W9 extreme, W8, W6): `tokamb.py` shows `is` belongs to fact in only 12-15% of the spans that contain it, and `which`
  to list in 23-24%;
- 8.2% have no event token (a front-end cause, not addressed by worlds).

On msg2 and long the no-token share is 22.5% / 16.6% (the old front end on newer text).

**Router (level 2, by fit).** When a stretch has 2-3 candidate worlds, each reads it, and the key picks the winner:
- (a) status unknown-event / no-sense last;
- (b) the higher score = global content tokens of the stretch (names, numbers, texts, legend value tokens; event tokens excluded) placed by
  the frame, minus those not placed. The placed set comes from the frame, not from each world's own `unplaced`;
- (c) a reading that fills a role before a roleless one, without dropping the roleless one (q1's part 3 drop is what failed on fresh1:
  describe 99 -> 8);
- (d) ok before abstain;
- (e) the smaller residual, as the last tie-break only (1.4).

A learned alternative (`router.py`): a count table P(family | event-token set) built from the fit spans. On dev spans it is right 88.6%
and wrong 3.2%; with p >= 0.9 it gives 923 right and 20 wrong. It is a new learned component, so it needs the owner's approval, and it
would be tried only if level 2 is measured as the first cause of misses.

**Decoding (stretches x worlds, with a stop rule).** Per sentence, the q1 DP enumerates stretches holding 1-3 centres. Each stretch is read
lazily by its candidate worlds in router order:
- Accept the first reading if it is `ok`, fills a role (or its event has none) and its min margin is >= tau. Otherwise read the next
  candidate and keep the best by the key.
- If the routed world's best reading is poor, backtrack once to all 9 worlds. This covers the 2.7% "one wrong family", and it is rare
  and bounded.

The DP is exact over (stretch, world) because the score is additive, so no beam width is needed. "Certainty" is the world margin = the
score gap between the best and second world on the chosen stretch, plus the reader's own margins.

**Honest fallback.**
- (i) Two worlds give `ok` readings with different events and equal scores: ask, showing both readings, and execute neither.
- (ii) A stretch that every candidate world reads poorly, a sentence with no centre, or text taken by no stretch: an ignored zone ("I did
  not understand '...'; say it with shapes and arrows, e.g. connect A to B"). The rest of the message is executed (AGENTS.md).
- (iii) `abstain` readings are reported apart. Whether they are asked or executed is the owner's decision, as today.

**Cost.**
- Training: 9 trainings whose rows add up to one world's. comb1 trained in 133 s at peak RSS 1.57 GB, so the training compute is about
  the same, plus 9x the world build, calibration and export. Estimate: 15-30 min serially on the CPU, one training at a time.
- Route books: comb1's sparse export is 4673 rows (4.8 MB). For the 9 worlds the estimate is 6-10 MB sparse (rows shared by families
  are stored once per world). This is measured in E1. Word stars are global and could be shared.
- Reading: about 1.25 readings per stretch instead of 1 (77% single family). q1 takes 69 s per 253 dev messages in node today, so about
  85-90 s (estimate).
- Code: a JS multi-world adapter (load N models, router, key, stop/ask rule, about 120-150 lines); scorer modes `SEG=gold-hier` /
  `SEG=q1-hier` in llm_score.mjs and error_analysis.mjs; the one-line legend filter in msg_to_world.py.

**Reused:** FAMILY switch, run_curve.sh, sop train and its calibration (CAL_FALLBACK=train for the small calibration sets), the learned
front end and kinds, the q1 DP and score, worlds.js and formalize_text as patterns, read_message's ignored zones, statuses and tau.
**New:** the legend-derived partition, the per-world legend filter, the multi-world adapter with the global key and the stop/ask
rule, and the scorer modes.

**Ceiling, stated beforehand.** Worlds cannot fix the front-end and context causes. On comb1's dev these are A no action word 92,
D value not reachable 27, E name not reachable 46 (165 of 383 misses). The model-side misses are B 66 + C 5 + F 63 + G 78 + G-description 6
= 218 (19.4 points). On fit, P1+P2 (information not in the span) are about 20% of requests.

## 4. The smallest first experiment (E1: the reading alone, cut as annotated)

- **Precondition.** INTERFERENCE.md (b) CONFIRMS. If it is rejected, E1 is not run, because the design has no measured basis.
- **Hypothesis.** The 9 family worlds, with the token router and the fit tie-break, read dev requests cut as annotated better than the one
  big world comb1_p80_s0.
- **One change.** The rows are split into the 9 worlds of section 3, each legend restricted to its events; the router plus the key decide
  per span. Everything else is as comb1: `CAL_FALLBACK=train QCOLOR=1 MARKER=0`, old data, `--frac 0.8`, seed 0, 2 epochs, D 1024, the same
  front end and kind lexicon. Nine runs, one at a time: `FAMILY=<events> PREFIX=hier_W<i> ./run_curve.sh 0.8`. llm_train/REAL_WORLD.md is
  restored after each run.
- **Measured.** `llm_score.mjs` on `review/dev.jsonl`, comparing SEG=gold for comb1 (65.5%, 738/1126, extra 64) with SEG=gold-hier:
  correct / not done / done wrong / asked, and error_analysis causes.
  Diagnostics (not criteria):
  - per route outcome: token-1-family, by fit among 2-3, backtracked, none;
  - the share of by-fit choices that are right;
  - an ORACLE run with the gold family per span, as the upper bound of routing;
  - the fit file (comb1 68.8%);
  - msg2 and long;
  - route-book sizes and read time.
- **Criterion (fixed now).** Dev SEG=gold-hier >= 69.5% (+4.0 points = 23% of the 218 model-side misses; above the retraining noise of
  about +-0.5-1 point seen in S7 and KINDS) AND the done-wrong share is not above comb1's. If it misses, stop and report, with no second partition.
- **Next, only if E1 passes.**
  - E2: the cut, q1 DP x worlds, against comb1 SEG=q1 on the same dev: >= +3.0 points AND extra wires not above comb1's.
  - Then one fresh test set, scored once.
  - Then the per-world kinds (E3), and cross-world "not mine" negatives (E4). E4 only if wrong-world choices are the first measured
    cause. It also needs a key term that reads the predicate, since negatives alone did not reach any status: ERROR_ANALYSIS.

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/comb1_p80_s0` (a76b4e3). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
