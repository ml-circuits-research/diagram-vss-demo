# COMBINE: the SOP-BERT cut for the VSS reader, and agreement between the two readers (2026-11-02)

Owner's questions (2026-11-02 21:43):
- **A.** "SOP-BERT's cutter is better: what happens with SOP-BERT's cutter and the VSS reader?" (On fresh2 VSS-G leaves 20.8% of the
  requests unread, mostly at its cut; SOP-BERT G 3.2%.)
- **B.** "If we link SOP-BERT with the VSS reader, can we raise SOP-BERT's value?": use the agreement of the two readers on a request as
  a signal of the confidence. VSS_FALSE_NEGATIVES.md found that VSS's own signals cannot see a wrong reading that parses cleanly; an
  independent reader can.

## Protocol (written before any number of this experiment was computed)

### Data and split
- fresh2: `training/sketch/llm_bench/fresh2/opus_{a,b,c,d}` (600 messages).
- **Calibration part**: the messages with `int(sha256(id), 16) % 3 == 0` (195 messages, 596 requested actions). Everything is fitted and
  chosen ONLY here, out of fold (5 folds by message: the calibration message's index, in the order of the data files, modulo 5; the same
  folds as `fresh2/fit_report.mjs`).
- **Test part** (405 messages, 1313 requested actions): it was already read once for FEEDBACK_PLAN.md. Here it is reported as
  **"test part (already read; exploratory)"**, once per configuration, in the same single run, and never used to choose anything.

### Readers and records
One node process (`combine/collect_pair.mjs`, copies of `fresh2/collect_sop.mjs` and `fresh2/collect_vss.mjs`; signals, outcomes and
the PAIR=value pairing unchanged), one pass over the 600 messages:
- **SOP-BERT**: arm BERT-G, `docs/model/neural/sop-bert`, on its own cut (its span head, the "BERT cutter").
- **VSS**: arm VSS-G, `docs/model/micro/registry.json` with its context filler, on its own cut (the VSS cutter).
- **VSS on the BERT cut**: the same VSS-G reader on the units of the SOP-BERT cut (the demo's BERT-cut path: `cutUnits(text, ctx, "bert")`
  = the span head's units with c1 > c0, passed to the composer as `units`; the world cutter is still decoded for the candidate worlds,
  CUT_SHARED.md).
Every produced request carries its outcome (right / wrong / extra, per gold request, PAIR=value as `llm_score.mjs`; checked against the
`tally` of `llm_score.mjs`), its signals, and its canonical values (`bench-canon.js canon`, the form the outcome is decided on).
Check of the records: SOP-BERT and VSS must reproduce the arms' numbers of `fresh2/VERDICTS.md` (cost-score thresholds 0.8233 and 0.8964,
calibration scores 24.8 and 8.2; execute-all on the test part 78.7 / 18.1 / 3.2 + 107 and 60.4 / 18.8 / 20.8 + 118). A difference is
reported, not patched.

### The confidence recipe (unchanged from `fresh2/fit_report.mjs`, copied into `combine/combine_report.mjs`)
Logistic regression on percentile-normalised signals (VSS: the 14 signals of "logistic all minus event" with the world prior; SOP-BERT:
the 24 signals with the act prior); percentile maps, prior and L2 (grid 0.01, 0.1, 1, 10, chosen by out-of-fold AUROC) fitted inside the
5 folds; the **threshold maximises the cost score** (AGENTS.md: right − 10 × (executed wrong + extras executed), per 100 requested actions;
a tie keeps the higher threshold) on the out-of-fold confidences of the calibration part; the final model (refit on the whole calibration
part) with that threshold is applied to the test part.

### A: the VSS reader on the SOP-BERT cut
- On the BERT-cut path the VSS signals `cut_start` / `cut_end` come from the VSS world cutter at units it did not make. **They are
  REPLACED** (not dropped) by the SOP-BERT cut head's probabilities at the unit's edges, with the definitions SOP-BERT's own confidence
  uses: `cut_start` = P(B) of the unit's first word; `cut_end` = 1 − P(I) of the word after the unit's last word (1 at the end of the
  text). Reason: on this path the cut is the BERT head's, and these two numbers say how sure that head is of the unit's edges. The other
  12 signals are unchanged.
- Reported, VSS (own cut) next to VSS on the BERT cut (SOP-BERT beside as the reference): execute-all right / wrong / not done % and
  extras; out-of-fold AUROC; cost-score threshold; calibration out-of-fold cost score; and for the test part (already read; exploratory)
  the cost score with its 95% bootstrap interval (1000 resamples of the test messages, seed 1), confidently wrong %, done right %, asked %.
- **"A worked"**: the calibration out-of-fold cost score of VSS on the BERT cut is higher than VSS on its own cut, and the 95% paired
  bootstrap interval of the difference (1000 resamples of the 195 calibration messages, seed 1, each reader at its chosen threshold) lies
  above 0. (The thresholds are chosen on the same out-of-fold scores, so both scores carry the same small optimism.)

### B: agreement as a signal
- **Agreement of a produced request x of reader X with reader Y on the same message**: Y's produced requests play the gold in
  `layer_common.mjs pairValue` (PAIR=value: per act, a maximum-weight matching, most pairs, then most keys equal, then most letters shared by
  the two units), X's requests the produced side. x paired with y (so the same act): `agree_share` = keys with equal canonical values / the
  union of the keys of x and y (action / ask excluded; a key missing on one side is a disagreement; empty union: 1); `agree` = 1 when
  `agree_share` = 1 (same act and the same value on every key). x not paired: `agree` = 0, `agree_share` = 0.
- The two signals are added to X's logistic (`agree`: binary; `agree_share`: percentile-normalised, higher = more confident) and the
  whole recipe above is re-run (refit on calibration, out of fold, cost-score threshold).
- Configurations:
  1. **SOP-BERT + agreement with VSS on the BERT cut** (the main one for B: one cut, two readers, the linked system);
  2. SOP-BERT + agreement with VSS on its own cut;
  3. **VSS + agreement with SOP-BERT** (VSS on its own cut; the main one for VSS's false negatives);
  4. VSS on the BERT cut + agreement with SOP-BERT;
  5. the rule **"execute only when both agree"** (no confidence): a SOP-BERT request is executed when `agree` = 1 with the VSS reading,
     executed once (SOP-BERT's request; the number of pairs whose two outcomes differ is reported), with VSS on the BERT cut and with VSS
     on its own cut.
- Also reported (calibration out of fold, each configuration at its own cost-score threshold; then the test part, exploratory): of VSS's
  false negatives (right readings asked at VSS's threshold), how many VSS + agreement executes, and how many wrong / extra readings it
  executes with them; of SOP-BERT's confident mistakes (wrong or extra executed at SOP-BERT's threshold), how many SOP-BERT + agreement
  catches (asks), and how many right ones it stops executing with them.
- **"B worked" for SOP-BERT**: configuration 1 has a higher calibration out-of-fold cost score than SOP-BERT alone, with the 95% paired
  bootstrap interval of the difference (as in A) above 0. The same test for VSS: configuration 3 against VSS alone. The other
  configurations are reported beside, not as verdicts.

No knob is turned after the first number; a miss is reported as a miss.

## Results (one run, 2026-11-02)

Run: `node training/sketch/combine/collect_pair.mjs <records> fresh2 training/sketch/llm_bench/fresh2/opus_{a,b,c,d}` (one process, 2 CPU
threads, 88 s for the 600 messages), then `node training/sketch/combine/combine_report.mjs <records> <report.md> <the same four folders>` (2 s).
Records and the full report: `/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/combine/records/` and
`.../scratchpad/combine/report.md` (not in the repository). Models: VSS-G (`docs/model/micro/registry.json`), SOP-BERT G
(`docs/model/neural/sop-bert`). Data: fresh2. Every number is per requested action (PAIR=value).

**Check of the records.** They reproduce the arms of `fresh2/VERDICTS.md` exactly: SOP-BERT threshold 0.8233, calibration score 24.8 (401
executed), test 14.4, execute-all on the test part 78.7% / 18.1% / 3.2% + 107 extras; VSS threshold 0.8964, calibration score 8.2 (115
executed), test 12.9, execute-all 60.4% / 18.8% / 20.8% + 118 extras.

Table labels: **cal (oof)** = calibration part, out-of-fold confidences, where everything was fitted and chosen. **test (already read;
exploratory)** = the test part, already read for FEEDBACK_PLAN.md, scored once here, not used to choose anything. Intervals: 95% bootstrap
over messages (1000 resamples, seed 1). The cost score is right − 10 × (executed wrong + extras executed) per 100 requested actions.

### Answer to A: the VSS reader on SOP-BERT's cut

**On the cost score it changes nothing that can be shown.** With SOP-BERT's cut, VSS reads more: the share it does not read falls from
17.4% to 14.9% (calibration) and from 20.8% to 15.8% (test). Executing everything, it gets more right (60.4% to 65.3% on the test part) and
not fewer wrong (18.8% in both cases). At its cost-score threshold it executes about twice as many right requests (18.3% to 31.2% of
the requested actions on calibration), but its share of confident mistakes also rises (5.2% to 6.5%). The calibration cost score moves
from 8.2 to 9.4: difference +1.2 [−8.1, 10.7], **not shown** (the protocol's bar: interval above 0). On the test part (already read;
exploratory) it is 12.9 against 12.3.

Why the better cut helps so little: of the 1909 requested actions, VSS on its own cut leaves 377 unread. SOP-BERT's cut gives VSS a request
for 116 of them. On SOP-BERT's cut VSS still leaves 297 unread, and SOP-BERT reads 257 of those 297 from the same units. So most of what VSS
does not read is lost in the VSS reader itself (it finds no action word, or it cannot place more than half the tokens), not at the cut.

| situation | VSS (own cut) | VSS on the BERT cut | SOP-BERT |
|---|---|---|---|
| execute all, right % (cal) | 66.8% | 69.8% | 82.6% |
| execute all, wrong % (cal) | 15.8% | 15.3% | 15.6% |
| execute all, not done % (cal) | 17.4% | 14.9% | 1.8% |
| execute all, extras (cal) | 64 | 71 | 66 |
| execute all, right % (test, already read; exploratory) | 60.4% | 65.3% | 78.7% |
| execute all, wrong % (test, already read; exploratory) | 18.8% | 18.8% | 18.1% |
| execute all, not done % (test, already read; exploratory) | 20.8% | 15.8% | 3.2% |
| execute all, extras (test, already read; exploratory) | 118 | 126 | 107 |

| situation | VSS (own cut) | VSS on the BERT cut | SOP-BERT |
|---|---|---|---|
| L2 · AUROC (cal, oof) | 1 · 0.776 | 10 · 0.806 | 1 · 0.872 |
| cost-score threshold (chosen on cal, oof) | 0.8964 | 0.8100 | 0.8233 |
| cost score (cal, oof) | 8.2 [−3.1, 17.6] | 9.4 [−3.9, 21.7] | 24.8 [2.1, 43.2] |
| done right % of requested (cal, oof) | 18.3% | 31.2% | 63.4% |
| confidently wrong % of executed (cal, oof) | 5.2% (6 of 115) | 6.5% (13 of 199) | 5.7% (23 of 401) |
| asked % (cal, oof) | 63.4% | 52.3% | 31.7% |
| AUROC (test, already read; exploratory) | 0.841 | 0.836 | 0.865 |
| cost score (test, already read; exploratory) | 12.9 [9.2, 16.5] | 12.3 [4.1, 19.9] | 14.4 [2.0, 26.7] |
| done right % of requested (test, already read; exploratory) | 15.9% | 29.9% | 60.1% |
| confidently wrong % of executed (test, already read; exploratory) | 1.9% (4 of 213) | 5.5% (23 of 415) | 7.1% (60 of 849) |
| asked % (test, already read; exploratory) | 63.1% | 53.0% | 32.5% |

### Answer to B: agreement between the two readers

**Yes. Agreement with the VSS reader raises SOP-BERT's value, and it raises VSS's value even more.** When the two readers give the same
act with the same values, the request is right 95% of the time (calibration), above the 91% that the cost rule requires (10 / 11). When they
do not agree, SOP-BERT is right only 43% of the time and VSS only 19%. No signal either reader had before could make that split.

- **SOP-BERT + agreement with VSS on the BERT cut** (the main configuration): calibration cost score 24.8 to 45.3, difference
  **+20.5 [6.5, 36.6]: B worked for SOP-BERT.** AUROC 0.872 to 0.922. Confidently wrong 5.7% to 1.8% of executed, at 55.4% of the requests
  done right (was 63.4%). On the test part (already read; exploratory): 14.4 to 42.0, confidently wrong 7.1% to 2.0%, done right 60.1% to
  52.6%.
- **VSS + agreement with SOP-BERT**: calibration cost score 8.2 to 35.2, difference **+27.0 [13.9, 41.5]: B worked for VSS.** The share of
  requests done right goes from 18.3% to 60.4% at 4.0% confidently wrong. Of VSS's 289 false negatives (right readings it asked about),
  255 (88%) are executed with agreement, along with 13 wrong or extra readings it now executes. Test part (already read; exploratory): 12.9
  to 35.0.
- **The rule "execute only when both agree"** (no confidence) scores 31.5 and 34.2 on calibration (SOP-BERT alone: 24.8). The differences
  from SOP-BERT alone are +6.7 [−11.2, 26.3] and +9.4 [−8.2, 27.5]: not shown. The rule executes the agreeing extras (12 on calibration),
  which the logistic with agreement mostly asks about. It is a weaker use of the same information than adding it to the confidence.
- The partner matters a little: SOP-BERT with agreement against VSS on the **BERT cut** (45.3) does better than against VSS on its own cut
  (38.6, +13.8 [−0.3, 29.3] over SOP-BERT alone, not shown). The shared cut gives more pairs that can agree (62.7% of SOP-BERT's requests
  against 58.4%).

| situation | SOP-BERT, agreement with VSS on the BERT cut | SOP-BERT, agreement with VSS own cut | VSS, agreement with SOP-BERT | VSS on the BERT cut, agreement with SOP-BERT |
|---|---|---|---|---|
| produced requests (cal) | 651 | 651 | 556 | 578 |
| paired with a request of the other reader (same act) | 80.3% | 78.0% | 91.4% | 90.5% |
| agree (same act, same values) | 62.7% | 58.4% | 68.3% | 70.6% |
| right among those that agree | 95.1% | 95.8% | 95.8% | 95.1% |
| right among those that do not agree | 42.8% | 47.2% | 19.3% | 16.5% |

| situation | SOP-BERT | SOP-BERT + agreement (VSS on the BERT cut) | SOP-BERT + agreement (VSS own cut) | both agree, rule (SOP-BERT and VSS on the BERT cut) |
|---|---|---|---|---|
| L2 · AUROC (cal, oof) | 1 · 0.872 | 10 · 0.922 | 10 · 0.910 | - |
| cost-score threshold (chosen on cal, oof) | 0.8233 | 0.8708 | 0.8782 | agree = 1 |
| cost score (cal, oof) | 24.8 [2.1, 43.2] | 45.3 [33.6, 54.3] | 38.6 [23.2, 50.2] | 31.5 [14.2, 46.9] |
| done right % of requested (cal, oof) | 63.4% | 55.4% | 52.0% | 65.1% |
| confidently wrong % of executed (cal, oof) | 5.7% (23 of 401) | 1.8% (6 of 336) | 2.5% (8 of 318) | 4.9% (20 of 408) |
| asked % (cal, oof) | 31.7% | 42.1% | 45.1% | 31.7% |
| extras executed (cal, oof) | 5 | 2 | 2 | 12 |
| AUROC (test, already read; exploratory) | 0.865 | 0.922 | 0.912 | - |
| cost score (test, already read; exploratory) | 14.4 [2.0, 26.7] | 42.0 [35.5, 47.9] | 37.2 [30.9, 42.9] | 34.5 [25.2, 43.3] |
| done right % of requested (test, already read; exploratory) | 60.1% | 52.6% | 48.7% | 59.6% |
| confidently wrong % of executed (test, already read; exploratory) | 7.1% (60 of 849) | 2.0% (14 of 705) | 2.3% (15 of 654) | 4.0% (33 of 816) |
| extras executed (test, already read; exploratory) | 5 | 4 | 4 | 19 |

| situation | VSS (own cut) | VSS + agreement (SOP-BERT) | VSS on the BERT cut | VSS on the BERT cut + agreement (SOP-BERT) |
|---|---|---|---|---|
| L2 · AUROC (cal, oof) | 1 · 0.776 | 10 · 0.922 | 10 · 0.806 | 0.1 · 0.939 |
| cost-score threshold (chosen on cal, oof) | 0.8964 | 0.7819 | 0.8100 | 0.8908 |
| cost score (cal, oof) | 8.2 [−3.1, 17.6] | 35.2 [20.5, 50.2] | 9.4 [−3.9, 21.7] | 40.4 [28.0, 51.9] |
| done right % of requested (cal, oof) | 18.3% | 60.4% | 31.2% | 58.9% |
| confidently wrong % of executed (cal, oof) | 5.2% (6 of 115) | 4.0% (15 of 375) | 6.5% (13 of 199) | 3.0% (11 of 362) |
| asked % (cal, oof) | 63.4% | 21.0% | 52.3% | 25.3% |
| AUROC (test, already read; exploratory) | 0.841 | 0.957 | 0.836 | 0.954 |
| cost score (test, already read; exploratory) | 12.9 [9.2, 16.5] | 35.0 [26.4, 42.6] | 12.3 [4.1, 19.9] | 37.2 [29.3, 44.7] |
| done right % of requested (test, already read; exploratory) | 15.9% | 54.8% | 29.9% | 53.2% |
| confidently wrong % of executed (test, already read; exploratory) | 1.9% (4 of 213) | 3.5% (26 of 746) | 5.5% (23 of 415) | 2.9% (21 of 720) |

What agreement changes, request by request (each configuration at its own cost-score threshold):

| situation | VSS → VSS + agreement (cal, oof) | VSS → VSS + agreement (test, already read; exploratory) | SOP-BERT → SOP-BERT + agreement with VSS on the BERT cut (cal, oof) | SOP-BERT → SOP-BERT + agreement with VSS on the BERT cut (test, already read; exploratory) |
|---|---|---|---|---|
| executed: alone → with agreement | 115 → 375 | 213 → 746 | 401 → 336 | 849 → 705 |
| right readings asked alone (false negatives) | 289 | 584 | 114 | 244 |
| ... of which executed with agreement | 255 (88.2%) | 512 (87.7%) | 21 (18.4%) | 58 (23.8%) |
| wrong or extra executed alone (confident mistakes) | 6 | 4 | 23 | 60 |
| ... of which asked with agreement (caught) | 4 (66.7%) | 4 (100.0%) | 18 (78.3%) | 48 (80.0%) |
| wrong or extra newly executed with agreement | 13 | 26 | 1 | 2 |
| right executed alone, asked with agreement (lost) | 4 | 1 | 69 | 156 |

In plain words: for VSS, agreement mostly **unlocks** right readings it was too unsure of (255 of 289). For SOP-BERT it mostly **catches**
confident mistakes (18 of 23 on calibration, 48 of 60 on the test part), and the price is 3 to 4 right requests asked per mistake caught (69 for 18 on calibration, 156 for 48 on the test part).
Weights of the agreement signals in the final fits (percentile scale): SOP-BERT + agreement with VSS on the BERT cut: agree 1.41,
agree_share 0.65; VSS + agreement: agree 2.12, agree_share 1.15.

### Limits

- **Errors both readers share stay invisible.** Both readers learned from the same annotated data. 4.9% of the requests on which they agree
  are still wrong (20 of 408, calibration), and agreement cannot see those.
- The verdicts compare out-of-fold scores at thresholds chosen on those same scores. That makes both sides of each comparison equally a
  little optimistic. The 195 calibration messages give wide intervals. The test part was already read, but it moves the same way and by
  about the same amount (SOP-BERT +27.6 [16.9, 38.9], VSS +22.2 [12.8, 30.1]).
- Using agreement in the demo means running both readers on every message, and SOP-BERT is a 66 MB model download plus its inference.
  It also needs a code change: the confidence files and `docs/js/*-confidence.js` would have to take the agreement signals, and the pairing
  of the two readers' outputs would have to happen in the browser. Nothing in `docs/js` was changed here.

### Files
- `training/sketch/combine/COMBINE.md` (this file; the protocol above was written before the run)
- `training/sketch/combine/collect_pair.mjs` (the records: SOP-BERT own cut, VSS own cut, VSS on the BERT cut, one process)
- `training/sketch/combine/combine_report.mjs` (the fits, the agreement signals, the tables)
