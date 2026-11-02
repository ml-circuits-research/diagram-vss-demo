# FRESH2_RESULT: the comparison on the fresh Opus-written set (2026-11-02)

Plan: FRESH2_PLAN.md (committed before any reader read the set). Run: GPU-machine job 042 (records on branch gpu-runs,
`results/042_fresh2/records`); full report: `fresh2/REPORT_042.md`. The coordinator re-ran the fit and report from the records: identical.
Test part: 405 messages, 1313 requested actions; calibration part: 195 messages, 596.

## 1. By the protocol, as written
No reader reaches 97% precision of execution out-of-fold on the calibration part with at least 50 executed requests, so by the plan
every reader asks about everything at 97%. At 95% (test part, confidently wrong % of executed · requests done right %):

| Reader | 95% threshold from calibration | Test part |
|---|---|---|
| VSS default | 0.9231 | 5.0 · 8.6 |
| VSS round 2 | not reached | asks everything |
| SOP-BERT shipped | 0.9636 | 1.8 · 12.2 |
| SOP-BERT all-data | 0.8621 | 7.4 · 36.1 |

The calibration part (195 messages) is small for a 97% threshold with >= 50 executed requests: a limit of the plan, stated here, not
changed after the fact.

## 2. The confidences fitted earlier (old held-out split), applied unchanged at their 97% threshold

| Reader | Confidently wrong % (executed) | Requests done right % |
|---|---|---|
| VSS default | 7.3 (342) | 24.1 |
| VSS round 2 | 7.0 (357) | 25.3 |
| SOP-BERT shipped | 3.5 (452) | 33.2 |
| SOP-BERT all-data | 7.7 (777) | 54.6 |
| Rules (no confidence) | 42.6 (1269) | 55.5 |

On the old data VSS was at 3.4% and SOP-BERT shipped at 3.0% confidently wrong at these thresholds (PRECISION_BERT.md, regress.sh): on a new
writer VSS's confidence doubled its rate, SOP-BERT shipped's barely moved.

## 3. At an equal confidently-wrong rate (read off the test part's curves; not a protocol threshold)

| Reader (best of its fits) | Requests done right at <= 3% confidently wrong | at <= 1% |
|---|---|---|
| VSS (default / round 2) | 5.9 / 10.4 | 2.2 / 4.6 |
| SOP-BERT shipped | 30.6 | 18.0 (on the VSS cut) |
| SOP-BERT all-data | 37.2 | 22.8 |

How well the confidence separates right from wrong (AUROC, test part): VSS 0.79–0.84, SOP-BERT 0.84–0.88.

## 4. Executing everything (the earlier measure)

| Reader | Right / wrong / not done % · extras | On the 1000-message sample |
|---|---|---|
| Rules | 55.5 / 19.0 / 25.4 · 290 | 68.0 / 16.5 / 15.5 · 816 |
| VSS default | 58.6 / 18.2 / 23.2 · 122 | 77.1 / 11.0 / 11.9 · 315 |
| SOP-BERT shipped | 70.8 / 24.2 / 5.0 · 185 | 80.8 / 16.5 / 2.8 · 348 |
| SOP-BERT all-data | 75.1 / 20.5 / 4.4 · 138 | (trained on it) |

## Answer
On messages written by a writer no reader learned from, every reader is much worse than on the sample, and VSS loses more: 77.1 → 58.6
right, 11.0 → 18.2 wrong. On the main metric SOP-BERT is ahead: at the same confidently-wrong rate it does 3 to 6 times as many requests
right, and its confidence transfers to the new writer better than VSS's. Training SOP-BERT on all the data helped it (right 70.8 → 75.1,
wrong 24.2 → 20.5) but its new confidence needs refitting (the old fit was made for the shipped model). Breakdowns per writer, length
and commands/questions: REPORT_042.md §6.

Open: the VSS losses on this set need a root-cause analysis (composer_errors.mjs on fresh2) before any change; the set now counts as read.
