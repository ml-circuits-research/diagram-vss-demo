# Which words need a kind of their own? Three measurements without training, and a rule (2026-10-31)

In short. (1) Removing one own kind at a time (read time, trained model): 16 of 87 (fix) / 30 of 167 (data2) words change fit
requests right -> wrong beyond chance (sign test, 5%); they carry almost all the dev effect. The others change nothing alone, but
dropping them all at once costs dev -23 / -36, mostly because short requests become `no-sense`. (2) No two own kinds have
near-identical learned rows; only the outgoing bigram rows and the role / presence components the decoder reads show groups
(called/named, labeled/labelled, from/then, park/place/put, ...). (3) The annotation role profiles, clustered by information
bottleneck with a cross-validated number of clusters, give 36 / 72 groups; they agree with (2) only partly (adjusted Rand 0.27 /
0.13). Rule: own kind for the sign-test words, a shared kind from the annotation clusters for every other word seen >= 2 times,
`unknown` for the rest: K 106 -> 60 (fix), 186 -> 110 (data2); read-time cost on the trained models dev -3 / -9. A training must
confirm it (section 5).

Read-only analysis. No repository file edited, nothing committed, no training run. Models: `docs/model/fix_p80_s0` (old data, 87
own kinds, K = 106) and `docs/model/data2_p80_s0` (all data, 167 own kinds, K = 186). No test set was opened.

Data (every request read alone from its annotated span, exactly as `training/sketch/error_analysis.mjs` does):
- fix_p80_s0: `scratchpad/fitset/fit.jsonl` (947 messages, 4305 requests) and `scratchpad/review/dev.jsonl` (253 messages, 1126
  requests), the files given. Baseline reproduced: fit 2835 / 4305, dev 693 / 1126 (= CAPACITY.md).
- data2_p80_s0 was trained on the 80% fit split of ALL data, so its own kinds come from 2109 messages; on the old files alone the 80
  kinds that came from the new data barely occur. So for this model the same split rule (`front.split_of(m, 0.8)`, DATA=all) was
  applied to all 2640 training messages: `kinds/data/fit_all.jsonl` (2109 messages, 10215 requests) and `kinds/data/dev_all.jsonl` (531
  messages, 2568 requests). The given files are exact subsets (947 / 947 and 253 / 253 messages identical). Baseline: fit 6271 / 10215
  (61.4%), dev 1516 / 2568 (59.0%). These dev numbers are on a different (larger) dev set than the fix numbers; do not compare them.
- docs/model/data2_p80_s0 was replaced during this analysis (16:27, commit fbaa8dc) by its SPARSE export (untrained pair rows dropped
  instead of left random). Everything on data2 in sections 1-3 and the map tests of section 4 read the DENSE export (routebook sha256
  d91046…, loaded before 16:27); only the `rule` and `drop_sign_detail` rows of data2 in section 4 read the sparse one (its baseline
  dev is 1517, not 1516; each row is counted against the baseline of its own run). `rows.py` / `rowsfn.py` read the dense format
  only; to re-run them on data2, export the run's model dense again (`sop export-web --bits 8` without `--sparse`).

"Own kind" below = the kind that `msg_to_world.py` gives a word seen >= 8 times (kind name = the word). The base kinds (17 legend
value kinds + VERB) and `unknown` are never touched.

## 1. Ablation per own-kind word (trained model, read time only)

`ablate.mjs`: for one word, its kind is replaced by `unknown` in the reader's catalog and lexicon (so its address is the `unknown`
rows, and it is no longer a candidate of a role that admitted its old kind); every message whose tokens contain the word is re-read
(the others cannot change). Counted per split: right -> wrong (rw) and wrong -> right (wr). Sign test on the FIT split only: one-sided
P(X >= rw | n = rw + wr, p = 1/2); `*` = p < 0.05 (with wr = 0 that means rw >= 5).

### fix_p80_s0 (fit = 4305 requests, dev = 1126), ranked by fit net = rw - wr

| rank | word | fit tokens | fit right->wrong | fit wrong->right | fit net | dev tokens | dev right->wrong | dev wrong->right | dev net | sign test p (fit) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | the | 1780 | 209 | 4 | 205 | 494 | 71 | 4 | 67 | 6.46e-57 * |
| 2 | to | 1049 | 190 | 10 | 180 | 263 | 38 | 1 | 37 | 1.47e-44 * |
| 3 | of | 189 | 56 | 0 | 56 | 47 | 15 | 0 | 15 | 1.39e-17 * |
| 4 | and | 623 | 54 | 6 | 48 | 173 | 10 | 5 | 5 | 4.86e-11 * |
| 5 | it | 137 | 39 | 0 | 39 | 33 | 10 | 1 | 9 | 1.82e-12 * |
| 6 | a | 904 | 41 | 3 | 38 | 223 | 13 | 2 | 11 | 8.09e-10 * |
| 7 | named | 58 | 30 | 0 | 30 | 14 | 7 | 0 | 7 | 9.31e-10 * |
| 8 | called | 64 | 24 | 0 | 24 | 11 | 3 | 0 | 3 | 5.96e-08 * |
| 9 | labeled | 147 | 23 | 0 | 23 | 36 | 9 | 0 | 9 | 1.19e-07 * |
| 10 | from | 132 | 17 | 0 | 17 | 41 | 9 | 0 | 9 | 7.63e-06 * |
| 11 | shape | 157 | 11 | 0 | 11 | 40 | 1 | 0 | 1 | 0.000488 * |
| 12 | with | 226 | 10 | 2 | 8 | 62 | 2 | 0 | 2 | 0.0193 * |
| 13 | directly | 13 | 7 | 0 | 7 | 2 | 1 | 0 | 1 | 0.00781 * |
| 14 | shapes | 14 | 5 | 0 | 5 | 8 | 2 | 0 | 2 | 0.0312 * |
| 15 | i | 20 | 5 | 0 | 5 | 3 | 1 | 0 | 1 | 0.0312 * |
| 16 | pixels | 26 | 5 | 0 | 5 | 12 | 1 | 1 | 0 | 0.0312 * |
| 17 | can | 45 | 4 | 0 | 4 | 4 | 0 | 0 | 0 | 0.0625 |
| 18 | in | 127 | 5 | 1 | 4 | 23 | 0 | 1 | -1 | 0.109 |
| 19 | has | 31 | 3 | 0 | 3 | 9 | 3 | 0 | 3 | 0.125 |
| 20 | are | 108 | 3 | 0 | 3 | 38 | 2 | 2 | 0 | 0.125 |
| 21 | arrow | 50 | 3 | 0 | 3 | 11 | 0 | 1 | -1 | 0.125 |
| 22 | last | 23 | 2 | 0 | 2 | 10 | 2 | 0 | 2 | 0.25 |
| 23 | what's | 44 | 2 | 0 | 2 | 11 | 0 | 0 | 0 | 0.25 |
| 24 | does | 35 | 2 | 0 | 2 | 9 | 0 | 0 | 0 | 0.25 |
| 25 | any | 17 | 2 | 0 | 2 | 3 | 0 | 0 | 0 | 0.25 |
| 26 | just | 9 | 2 | 0 | 2 | 1 | 0 | 0 | 0 | 0.25 |
| 27 | on | 46 | 1 | 0 | 1 | 15 | 3 | 0 | 3 | 0.5 |
| 28 | there | 46 | 1 | 0 | 1 | 13 | 1 | 0 | 1 | 0.5 |
| 29 | check | 10 | 1 | 0 | 1 | 1 | 1 | 0 | 1 | 0.5 |
| 30 | you | 9 | 1 | 0 | 1 | 2 | 1 | 0 | 1 | 0.5 |
| ... |
| 58 | we | 21 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 1 |
| 59 | goes | 20 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 1 |
| 60 | do | 17 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 1 |
| 61 | should | 17 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 1 |
| 62 | for | 16 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 1 |
| 63 | axis | 15 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 1 |
| 64 | evenly | 15 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 65 | back | 14 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 1 |
| 66 | give | 14 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 1 |
| 67 | here | 14 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 68 | link | 14 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 1 |
| 69 | show | 14 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 1 |
| 70 | as | 13 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 1 |
| 71 | by | 12 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 1 |
| 72 | diagram | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 73 | too | 12 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 1 |
| 74 | each | 11 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 1 |
| 75 | map | 11 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 1 |
| 76 | those | 11 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 77 | if | 10 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 78 | box | 9 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 1 |
| 79 | four | 9 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 1 |
| 80 | this | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 81 | exist | 8 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 1 |
| 82 | front | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 83 | no | 8 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 1 |
| 84 | place | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 85 | two | 8 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 1 |
| 86 | whole | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 87 | line | 87 | 1 | 2 | -1 | 18 | 0 | 0 | 0 | 0.875 |

### data2_p80_s0 (fit_all = 10215 requests, dev_all = 2568)

| rank | word | fit tokens | fit right->wrong | fit wrong->right | fit net | dev tokens | dev right->wrong | dev wrong->right | dev net | sign test p (fit) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | the | 4096 | 372 | 20 | 352 | 1108 | 118 | 7 | 111 | 1.93e-85 * |
| 2 | to | 2122 | 355 | 28 | 327 | 515 | 81 | 8 | 73 | 1.4e-73 * |
| 3 | a | 1815 | 246 | 14 | 232 | 455 | 66 | 6 | 60 | 2.96e-56 * |
| 4 | of | 365 | 76 | 2 | 74 | 84 | 20 | 0 | 20 | 1.02e-20 * |
| 5 | named | 135 | 73 | 0 | 73 | 27 | 20 | 0 | 20 | 1.06e-22 * |
| 6 | called | 180 | 69 | 0 | 69 | 45 | 19 | 0 | 19 | 1.69e-21 * |
| 7 | it | 444 | 78 | 14 | 64 | 115 | 26 | 2 | 24 | 3.08e-12 * |
| 8 | shapes | 114 | 54 | 0 | 54 | 36 | 17 | 0 | 17 | 5.55e-17 * |
| 9 | and | 1536 | 64 | 24 | 40 | 376 | 14 | 5 | 9 | 1.19e-05 * |
| 10 | from | 356 | 34 | 0 | 34 | 88 | 14 | 0 | 14 | 5.82e-11 * |
| 11 | once | 38 | 27 | 0 | 27 | 9 | 5 | 0 | 5 | 7.45e-09 * |
| 12 | labeled | 147 | 25 | 0 | 25 | 36 | 6 | 0 | 6 | 2.98e-08 * |
| 13 | does | 162 | 24 | 0 | 24 | 33 | 8 | 0 | 8 | 5.96e-08 * |
| 14 | old | 41 | 23 | 0 | 23 | 7 | 4 | 0 | 4 | 1.19e-07 * |
| 15 | shape | 311 | 22 | 0 | 22 | 83 | 6 | 0 | 6 | 2.38e-07 * |
| 16 | as | 78 | 14 | 1 | 13 | 21 | 6 | 0 | 6 | 0.000488 * |
| 17 | with | 396 | 19 | 6 | 13 | 101 | 4 | 0 | 4 | 0.00732 * |
| 18 | are | 430 | 10 | 0 | 10 | 107 | 5 | 0 | 5 | 0.000977 * |
| 19 | directly | 26 | 8 | 0 | 8 | 6 | 2 | 0 | 2 | 0.00391 * |
| 20 | i | 94 | 8 | 0 | 8 | 24 | 1 | 0 | 1 | 0.00391 * |
| 21 | no | 99 | 9 | 1 | 8 | 25 | 0 | 2 | -2 | 0.0107 * |
| 22 | pixels | 57 | 7 | 0 | 7 | 21 | 6 | 1 | 5 | 0.00781 * |
| 23 | lines | 104 | 7 | 0 | 7 | 31 | 0 | 0 | 0 | 0.00781 * |
| 24 | on | 134 | 6 | 0 | 6 | 43 | 3 | 0 | 3 | 0.0156 * |
| 25 | one | 193 | 7 | 1 | 6 | 65 | 1 | 1 | 0 | 0.0352 * |
| 26 | into | 51 | 6 | 0 | 6 | 8 | 0 | 0 | 0 | 0.0156 * |
| 27 | wait | 40 | 6 | 0 | 6 | 5 | 0 | 0 | 0 | 0.0156 * |
| 28 | about | 10 | 5 | 0 | 5 | 5 | 2 | 0 | 2 | 0.0312 * |
| 29 | rules | 82 | 5 | 0 | 5 | 22 | 1 | 0 | 1 | 0.0312 * |
| 30 | arrows | 82 | 5 | 0 | 5 | 15 | 0 | 0 | 0 | 0.0312 * |
| ... |
| 138 | i'd | 11 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 139 | stack | 11 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | 1 |
| 140 | bit | 10 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 1 |
| 141 | him | 10 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 142 | same | 10 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 143 | way | 10 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 144 | around | 9 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 1 |
| 145 | but | 9 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 146 | change | 9 | 0 | 0 | 0 | 8 | 0 | 0 | 0 | 1 |
| 147 | linked | 9 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 148 | please | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 149 | these | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 150 | connection | 8 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 1 |
| 151 | defaults | 8 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 1 |
| 152 | far | 8 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 1 |
| 153 | hall | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 154 | hmm | 8 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 1 |
| 155 | list | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 156 | long | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 157 | loop | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 158 | page | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 159 | sheet | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| 160 | stop | 8 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 |
| 161 | have | 142 | 0 | 0 | 0 | 27 | 0 | 1 | -1 | 1 |
| 162 | back | 48 | 0 | 1 | -1 | 9 | 0 | 0 | 0 | 1 |
| 163 | along | 19 | 0 | 1 | -1 | 3 | 0 | 0 | 0 | 1 |
| 164 | axis | 18 | 0 | 1 | -1 | 3 | 0 | 0 | 0 | 1 |
| 165 | things | 14 | 0 | 1 | -1 | 2 | 0 | 0 | 0 | 1 |
| 166 | then | 59 | 1 | 2 | -1 | 18 | 0 | 1 | -1 | 0.875 |
| 167 | that | 169 | 1 | 4 | -3 | 34 | 0 | 1 | -1 | 0.969 |

Findings:
- The effect is concentrated: of 87 (167) own kinds, 16 (30) pass the sign test; 41 (82) change nothing or help when removed (net <=
  0 on fit). The sign-test words carry the dev effect: dev net 179 (fix) / 423 (data2) for them against 10 / 8 for all the others
  together; 15 of 16 (24 of 30) of them also lose on dev. Ranks agree between fit and dev (Spearman 0.57 / 0.52) and between the two
  models on their 86 shared words (Spearman 0.73); every fix sign-test word is also one in data2 (data2 adds about, are, arrows, as,
  does, into, lines, no, old, on, once, one, rules, wait).
- Frequency predicts it only at the top. Fit tokens >= 128: 10 of 10 (fix), 16 of 25 (data2) pass; 8-15 tokens: 2 of 34, 1 of 59.
  Exceptions both ways: `directly` (13 tokens, 7 flips, 0 back), `once` (38, 27 / 0), `old` (41, 23 / 0) need their kind; `now` (85
  tokens, 0 flips), `have` (142, 0), `that` (169, removal helps 4 / 1) do not. The cut-off 8 keeps 71 (137) words that change nothing
  measurable alone.
- Removing words ONE AT A TIME underestimates removing them together. All 71 fix words that fail the sign test, set to `unknown` at
  once: fit -103, dev -23 (the sum of their single effects: fit -46, dev -10); data2, 137 words: fit -193, dev -36. Measured cause
  (`why`, first difference between the two readings, section 4): 74 of the 106 fit flips (fix) and 131 of 210 (data2) are status
  `no-sense`: with all these words `unknown`, more than half of the tokens of a short request cannot be placed and the reader
  refuses. Only 11 (39) are a role read absent. So a word that changes nothing alone can still not be `unknown` in bulk: it needs a
  kind, not necessarily its OWN. This is why the rule below puts these words into shared kinds instead of dropping them. (Removing
  `the` alone, for comparison: 95 of 209 fit flips are a role read absent, 51 an extra role, 30 `no-sense`.)

## 2. The learned rows of the own kinds

`rows.py` (raw rows), `rowsfn.py` (what the readout reads of them), `cluster.py`.

Reached rows and initial values. The rows training reached were rebuilt from the training sentences (`runs/<run>/splits.json`) with
the rule of `train.reached_rows` (path m[c_k]; bg0[c_0]; bg[c_(k-1), c_k]; A[c_q, c_k] q < k; L[c_q, c_k] q > k): data2 11769 + the
root = 11770, exactly the count in the training log; fix 4641 + root. The initial value of every row was regenerated as
`train.LeanTheta` draws it (rng 200 + seed, V2 table and identities skipped, then V4 / V5 / V6 in one stream). Check: 765 / 807
rows training did not reach equal their regenerated value within the 8-bit step (max error 0.0123 rad, step 0.0245). Reached rows
moved a median 0.40 (fix) / 0.37 (data2) rad per dimension from their start.

2a. Raw rows (mean cos(theta_a - theta_b) over D, same context, only rows both kinds reached; null = a reached row against a random
row: sd 0.023 / 0.022). No pair of own kinds has near-identical rows in any family. Only the OUTGOING bigram rows (bg[a, x], the
address the kind gives to the next token) show similarity: fix max 0.78 (`called/named`), then does/the 0.75, from/then 0.67,
of/the 0.54; 7 pairs > 0.5 (data2: called/named 0.94, does/the 0.86, put/the 0.76, of/the 0.76, and/feeds 0.75; 52 pairs > 0.5).
path, bg0, incoming bg, A and L: p99 <= 0.17 (fix) / 0.30 (data2). The cosine of the training MOVES (final - initial) is near 0
everywhere except path rows of words that always occur together (do/we 0.59, me/tell 0.53): co-occurrence, not interchangeability.
Why raw identity cannot be expected: the rows start random and training changes only the part the readout uses; the rest stays at
its random start. So the comparison has to be made on what the decoder reads.

2b. Functional profile (`rowsfn.py`): a bigram row adds exp(i theta) to a token's address; the decoder reads it through Re<role_r,
a_j>/D (filler of role r), Re<pred, a_j>/D (predicate) and Re<role_r * marker * conj(F_j), a_j>/D (presence of role r; stars from
stars.bin). Per kind: out_role = the components of its outgoing rows (what it makes of the NEXT token), in_role and in_presence =
those of its incoming rows (its OWN token), averaged over its contexts by use; a part counts when its energy is >= 3x that of a
never-trained row. Result:
- in_presence carries signal for 82 of 87 (fix) / 154 of 167 (data2) own kinds: almost every own kind is a presence writer, as
  CAPACITY.md found for the sentences without one. This component is per word by construction (conj of the word's own star): two
  words cannot share it in one row. A row is unit-modulus per dimension, so a kind shared by m presence-writing words can give each
  at most about 1/sqrt(m) of the strength through that row (the path and chain terms add more room). This is the cost of merging
  under `occupancy_marker: true`.
- out_role carries signal for 34 / 62 kinds: the words that announce the role of the next token, e.g. called/named -> name (0.89 /
  0.85), labeled -> text (0.85), from -> source (0.88), then -> source (0.59), the -> object (0.65), a -> size (0.50), and -> members
  (0.65), to -> target (0.47), by -> amount, pixels -> direction, what's / has / any / you / just -> pred.
- in_role: only the content words that are fillers themselves (it, them, shape, shapes, line, ...).
- kinds whose rows write nothing the readout reads: fix diagram, now, this, those; data2 active, again, anywhere, colour, defaults,
  my, old, set, that, this, total, undid (`old` passes the ablation test anyway, so its effect must come from rows other than the
  bigram rows measured here; not checked further).

Clusters of the functional profiles (average linkage on cosine), cosine >= 0.9 ("near-identical"):
- fix: {at, do, for, have, not, once, we} (all: presence of object), {be, can, reached}, {called, named}, {does, the}, {from,
  then}, {any, you}, {as, tell}, {every, new}.
- data2: {come, do, for, have, not, once, show, tell, we}, {an, back, still}, {canvas, corner, page}, {does, how, throw}, {its,
  others, you}, {park, place, put}, {along, axis}, {arrow, loop}, {bit, little}, {called, named}, {diagram, whole}, {everything,
  shape}, {from, then}, {i'd, like}, {labeled, labelled}, {new, the}, {remove, zap}, {stop, who}, {too, well}.
At cosine >= 0.75 the big groups are "writes presence of object" (18 / 25 words) and "writes presence of source / target" (8 / 7).
The read-time test of these merges (each cluster read with the kind of its most frequent word): fix 18 words changed, fit -36,
dev -5 (section 4). {to, into} appear together only at 0.75 in data2; `onto` never occurs in the fit spans.

## 3. Role profiles from the annotation (no model)

`profiles.py`: every request normalized with the model's own front end (tokenization only) and converted to its training row as
`msg_to_world.py` does (gold created names); per word token (not a legend value token, not an event token) four features: `self`
(the role it fills, or none), `next` / `prev` (the role of the nearest labelled token to the right / left, or none), `pos` (its
offset from the predicate token: -3+, -2, -1, +1, +2, +3+, no predicate). Token counts agree with the JS reader's (the 1780, to 1049
on fit).

3a. Significance merge (`cluster.py`, merge only when two words' profiles differ less than two samples of one distribution would,
95%): with hundreds of tokens even small differences are significant, so frequent words never merge (fix 55 singletons of 87; data2
102 of 167); merges happen among rare words only. Not usable as a rule.

3b. Information bottleneck with a cross-validated stop (`ib.py`): units = the words, plus one unit UNK (all words below the unit
threshold: what `unknown` stands for). Repeatedly merge the two clusters whose merge loses the least information about the four
features on the training tokens; the number of clusters K* = the one with the best held-out log-likelihood of the features in a
2-fold split of the FIT messages (fold = hash of the id); dev only reports.
- own-kind words as units: fix K* = 36 of 88 units (dev would pick 50); data2 K* = 72 of 168 (dev: 82).
- every word seen >= 2 times as a unit (no frequency list; words seen once form UNK): fix 232 units -> K* 37; data2 432 -> K* 74.
  (Seen >= 1: fix K* 44, but each hapax is then clustered on one token.)
Clusters (data2, own-kind words, K* = 72; multi-word only): {about, change, colour, far, for, more, ones, way}, {board, diagram, map,
plan, step, this, total, undid}, {again, connections, him, my, that, things}, {check, give, place, show, stack, tell}, {any,
anything, its, others, you}, {box, exist, front, not, we}, {but, loop, please, too, well}, {default, defaults, earlier, rules, set},
{active, last, old, whole}, {anywhere, do, her, two}, {axe, connection, remove, zap}, {axis, canvas, corner, page}, {bit, have,
little, sheet}, {every, if, list, new}, {has, node, stop, what's}, {how, i'd, like, want}, {also, so, still}, {another, arrows,
order}, {around, linked, other}, {be, hall, should}, {both, flow, go}, {by, same, side}, {first, links, out}, {four, these, those},
{here, now, thing}, {hmm, long, mean}, {no, uh, wait}, {park, put, throw}, {along, evenly}, {called, named}, {come, does}, {could,
who}, {feeds, leads}, {just, sits}, {labeled, labelled}, {link, then}. Singletons: UNK, a, an, and, are, arrow, as, at, back, can,
directly, each, everything, from, goes, i, in, into, it, line, lines, me, of, on, once, one, pixels, shape, shapes, the, them, there,
three, to, what, with.
Fix (K* = 36): {as, at, exist, for, front, have, not, we}, {an, by, each, no, too, uh}, {any, has, just, me, what's, you}, {diagram,
here, map, now, thing}, {be, can, reached, remove}, {box, i, shapes, there}, {check, give, place, put}, {does, every, if, new}, {four,
those, three, two}, {last, rules, this, whole}, {show, tell, what, who}, {are, do, that}, {arrow, arrows}, {axis, pixels}, {back,
both}, {called, named}, {directly, once}, {evenly, on}, {goes, should}, {link, then}; singletons UNK, a, and, from, in, it, labeled,
line, lines, of, one, shape, the, them, to, with.
With all words seen >= 2 (data2), rare words join: {put, place, park, drop, push, shove, throw, tuck}, {remove, zap, axe, kill, take,
get, reach, run, path, second}, {connects, feeds, leads, points}, {labeled, labelled, text, word}, {from, starting}, {into, calls,
leading, manages, moves, output, pointing, sends, talks, through, triggers, writes}. `to` stays a singleton in every variant; no
annotation variant puts {to, into} together (only the learned rows do, at cosine 0.75); `onto` never occurs in the fit spans.

3c. Agreement of 2 and 3. Adjusted Rand index between the functional-row clusters (cosine 0.75) and the IB clusters: fix 0.27, data2
0.13 (0 = chance); the significance merge of 3a: 0.03. The mean functional cosine of two words in one IB cluster is 0.59 (fix) /
0.51 (data2), against 0.18 / 0.16 for any two own kinds: the annotation clusters are functionally similar on average, but the two
partitions are far from equal. Pairs both measurements put together (IB cluster and cosine >= 0.75): called/named, labeled/labelled,
any/anything/its/others/you, park/put/throw, place/put, remove/zap/axe, canvas/corner/page, show/tell/give/check, exist/front/not/we,
every/new, bit/little, i'd/like/want, just/sits, no/wait, too/well, along/evenly. They disagree where the rows group by the role whose
PRESENCE a word writes (fix {at, do, for, have, not, once, we}: presence of object) while the annotation also sees the position:
`from` and `then` share their outgoing rows (next token = source) but `then` stands at a clause start and `from` after the verb.

## 4. Proposed rule, sizes and expected effect

Rule (no hand list; two data inputs, both from the FIT split only):
1. Own kind: a word keeps a kind of its own when its read-time ablation on a model that gave it one changes fit requests right ->
   wrong more often than wrong -> right beyond chance: one-sided sign test, p < 0.05 (with no flip back: >= 5 flips).
2. Shared kinds: every other word seen >= 2 times in the fit spans gets the kind of its cluster in the information-bottleneck
   clustering of the annotation profiles (section 3b, units = those words + UNK, K by 2-fold cross-validation inside fit); the
   sign-test words are taken out of their clusters.
3. `unknown`: the words in UNK's cluster and the words seen once.
Legend value tokens keep their question's kind and event tokens keep VERB, as now. The only constants are the conventional 5% of the
test and "seen twice" (the minimum for the cross-validation to say anything; it also keeps the hapaxes as the training material of
`unknown`, the closest proxy for words never seen). Step 1 needs a model in which the candidates had kinds: today's models
serve (fix -> 16 words, data2 -> 30), and the rule is re-run when the data grow.

Resulting kinds (`kinds_fix.json`, `kinds_data2.json`):

| | today: own kind if seen >= 8 | rule |
|---|---|---|
| fix (old data) | 87 own kinds, K = 106; dense route book 34.7 MB; reached rows 4641 | 16 own + 25 shared kinds, K = 60; dense 11.2 MB; reached rows 3915 (sparse 4.0 MB); 231 words with a kind (143 of them `unknown` today) |
| data2 (all data) | 167 own kinds, K = 186; dense 106.7 MB; reached rows 11769 | 30 own + 61 shared kinds, K = 110; dense 37.4 MB; reached rows 10627 (sparse 10.9 MB); 422 words with a kind (253 `unknown` today) |

(Dense size at D 1024 / 8 bits = (3 K^2 + 2 K) x 1024 bytes + logits: path and bg0 K rows, bg / A / L K^2 rows each; 34,735,916 and
106,662,616 bytes for the dense exports. Sparse export = reached rows x 1024; the committed sparse data2_p80_s0 is 12,176,304 bytes,
which the estimate 11769 rows = 12.1 MB matches.)

Size is NOT the main gain any more: since commit fbaa8dc (16:30 today) the route book is exported sparse, and the sparse size
follows the reached rows, which the rule changes little (data2 12.1 -> 10.9 MB; fix 4.8 -> 4.0 MB). The dense K^2 size (107 -> 37
MB) still matters for `run_curve.sh`, which exports dense. The gains the rule is for: (a) the kinds follow a measured criterion
instead of an unselected cut-off; (b) 137 (data2) words that change nothing alone stop holding a kind of their own; (c) 253 words that
are `unknown` today (seen 2-7 times) get the kind of words with the same annotated role profile ({drop, push, shove, tuck} with
put / place; {kill, take} with remove / zap / axe; {connects, points} with feeds / leads; {text, word} with labelled).

Expected effect, read time on the trained models (no retraining; `ablate.mjs --maps`). This is a pessimistic estimate for every
merged kind: its rows were trained for ONE word (its presence components carry that word's star), so another word read with them
cannot get its presence. A training gives the shared kind's rows all its words.

**fix** (fit / dev as in section 1):

| map | own kinds left | K | dense route book MB | reached rows (sparse MB) | fit right->wrong | fit wrong->right | fit net | dev right->wrong | dev wrong->right | dev net | dev right after |
|---|---|---|---|---|---|---|---|---|---|---|---|
| current | 87 | 106 | 34.7 | 4641 (4.8) | 0 | 0 | 0 | 0 | 0 | 0 | 693 |
| drop_sign | 16 | 35 | 3.8 | 1346 (1.4) | 106 | 3 | -103 | 29 | 6 | -23 | 670 |
| drop_all | 0 | 19 | 1.1 | 452 (0.5) | 1386 | 15 | -1371 | 361 | 7 | -354 | 339 |
| drop_net<1 | 46 | 65 | 13.1 | 2805 (2.9) | 12 | 2 | -10 | 6 | 0 | -6 | 687 |
| drop_net<2 | 26 | 45 | 6.3 | 1753 (1.8) | 42 | 2 | -40 | 13 | 2 | -11 | 682 |
| drop_net<3 | 21 | 40 | 5.0 | 1589 (1.6) | 60 | 2 | -58 | 16 | 2 | -14 | 679 |
| drop_net<5 | 16 | 35 | 3.8 | 1346 (1.4) | 106 | 3 | -103 | 29 | 6 | -23 | 670 |
| drop_net<10 | 11 | 30 | 2.8 | 1156 (1.2) | 144 | 3 | -141 | 33 | 7 | -26 | 667 |
| drop_net<20 | 9 | 28 | 2.5 | 1031 (1.1) | 180 | 3 | -177 | 43 | 7 | -36 | 657 |
| drop_net<40 | 4 | 23 | 1.7 | 744 (0.8) | 431 | 3 | -428 | 106 | 5 | -101 | 592 |
| ib | 35 | 54 | 9.1 | 3100 (3.2) | 61 | 2 | -59 | 17 | 0 | -17 | 676 |
| sign_ib | 40 | 59 | 10.8 | 3227 (3.3) | 22 | 2 | -20 | 8 | 0 | -8 | 685 |
| ib_min2 | 36 | 55 | 9.4 | 3731 (3.8) | 65 | 6 | -59 | 13 | 2 | -11 | 682 |
| m2_09 | 69 | 88 | 24.0 | 4018 (4.1) | 36 | 0 | -36 | 5 | 0 | -5 | 688 |
| rule | 40 | 59 | 10.8 | 3889 (4.0) | 26 | 6 | -20 | 5 | 2 | -3 | 690 |
| drop_sign_detail | 16 | 35 | 3.8 | 1346 (1.4) | 106 | 3 | -103 | 29 | 6 | -23 | 670 |
| the_detail | 86 | 105 | 34.1 | 4337 (4.4) | 209 | 4 | -205 | 71 | 4 | -67 | 626 |

**data2** (fit / dev as in section 1):

| map | own kinds left | K | dense route book MB | reached rows (sparse MB) | fit right->wrong | fit wrong->right | fit net | dev right->wrong | dev wrong->right | dev net | dev right after |
|---|---|---|---|---|---|---|---|---|---|---|---|
| current | 167 | 186 | 106.7 | 11769 (12.1) | 0 | 0 | 0 | 0 | 0 | 0 | 1516 |
| drop_sign | 30 | 49 | 7.5 | 2767 (2.8) | 210 | 17 | -193 | 46 | 10 | -36 | 1480 |
| drop_all | 0 | 19 | 1.1 | 568 (0.6) | 2801 | 47 | -2754 | 705 | 18 | -687 | 829 |
| drop_net<1 | 85 | 104 | 33.4 | 6442 (6.6) | 38 | 9 | -29 | 11 | 3 | -8 | 1508 |
| drop_net<2 | 59 | 78 | 18.9 | 4834 (5.0) | 75 | 9 | -66 | 21 | 3 | -18 | 1498 |
| drop_net<3 | 42 | 61 | 11.6 | 3541 (3.6) | 133 | 12 | -121 | 38 | 6 | -32 | 1484 |
| drop_net<5 | 32 | 51 | 8.1 | 2974 (3.0) | 189 | 16 | -173 | 44 | 7 | -37 | 1479 |
| drop_net<10 | 18 | 37 | 4.3 | 1852 (1.9) | 313 | 18 | -295 | 68 | 11 | -57 | 1459 |
| drop_net<20 | 15 | 34 | 3.6 | 1582 (1.6) | 395 | 20 | -375 | 87 | 8 | -79 | 1437 |
| drop_net<40 | 9 | 28 | 2.5 | 1281 (1.3) | 593 | 19 | -574 | 130 | 8 | -122 | 1394 |
| ib | 71 | 90 | 25.1 | 8202 (8.4) | 134 | 7 | -127 | 27 | 1 | -26 | 1490 |
| sign_ib | 80 | 99 | 30.3 | 8735 (8.9) | 40 | 5 | -35 | 10 | 1 | -9 | 1507 |
| ib_min2 | 73 | 92 | 26.2 | 9491 (9.7) | 156 | 13 | -143 | 33 | 4 | -29 | 1487 |
| m2_09 | 124 | 143 | 63.1 | 9689 (9.9) | 154 | 5 | -149 | 32 | 2 | -30 | 1486 |
| rule | 87 | 106 | 34.7 | 10383 (10.6) | 39 | 16 | -23 | 13 | 4 | -9 | 1508 |
| drop_sign_detail | 30 | 49 | 7.5 | 2767 (2.8) | 210 | 17 | -193 | 47 | 10 | -37 | 1480 |


(`rule` at read time: the sign-test words keep their kind; each other word is read with the kind of the most frequent word of its
cluster that has a kind in the model; a cluster without one -> `unknown`, because the model has no rows for a new kind. Its columns
"own kinds left", K and sizes therefore count the model's kinds used at read time, not the rule's kinds: those are in the table above.
The data2 `rule` and `drop_sign_detail` rows read the sparse export, baseline dev 1517: `rule` = 1517 -> 1508.)

Summary: on the trained models, without retraining, the rule costs fix dev 693 -> 690 (-3; fit -20) and data2 dev 1517 -> 1508 (-9;
fit -23), while K falls 106 -> 60 and 186 -> 110. Dropping the non-significant words instead (drop_sign) costs dev -23 / -36; the
annotation clusters without the sign test (ib) -17 / -26; the learned-row clusters (m2_09) -5 / -30.

What the right -> wrong flips are made of (`why`: the first difference between the two readings; fix model, and data2 sparse):

- fix `rule`: fit {"a role read before is now absent": 9, "same roles, other filler": 5, "other event": 10, "an extra role": 2}; dev {"other event": 3, "same roles, other filler": 1, "a role read before is now absent": 1}
- fix `drop_sign_detail`: fit {"a role read before is now absent": 11, "status no-sense": 74, "an extra role": 3, "other event": 10, "same roles, other filler": 8}; dev {"an extra role": 1, "status no-sense": 18, "a role read before is now absent": 3, "other event": 6, "same roles, other filler": 1}
- fix `the_detail`: fit {"a role read before is now absent": 95, "an extra role": 51, "same roles, other filler": 24, "status no-sense": 30, "other event": 9}; dev {"a role read before is now absent": 30, "same roles, other filler": 3, "status no-sense": 16, "an extra role": 14, "other event": 8}
- data2 `rule`: fit {"same roles, other filler": 8, "a role read before is now absent": 14, "other event": 9, "an extra role": 4, "status no-sense": 4}; dev {"same roles, other filler": 5, "a role read before is now absent": 2, "other event": 4, "status no-sense": 2}
- data2 `drop_sign_detail`: fit {"status no-sense": 131, "other event": 9, "an extra role": 11, "a role read before is now absent": 39, "same roles, other filler": 20}; dev {"status no-sense": 34, "same roles, other filler": 3, "an extra role": 1, "a role read before is now absent": 6, "other event": 3}


## 5. What a training must confirm, and the one run

The read-time numbers above measure the trained models, not models trained with the new kinds. A training must confirm:
1. that a reader trained with the rule's kinds (data2: K 110 instead of 186; dense 37 instead of 107 MB, sparse 10.9 instead of 12.2 MB) reads the
   all-data dev split at least as well as data2_p80_s0 within the stated tolerance;
2. that the shared kinds recover what the read-time merge loses (their rows are then trained on all their words), i.e. the
   requests that flip right -> wrong under the read-time `rule` map come back;
3. that the 253 words which get a kind (today `unknown`) help and do not hurt: the dev requests containing one of them, right
   before / after;
4. that the presence of single roles (CAPACITY.md S5) does not get worse: the dev requests whose gold role is read absent although
   its word is in the span, before / after (shared kinds give each word less presence strength, section 2b).

Pre-registration (to be shown to the owner before the run):
- Hypothesis: kinds from the rule (K 110 instead of 186) lose no reading quality against the frequency cut-off 8, and the requests
  holding a word that gets a kind for the first time read at least as well.
- One change: the world built with `KINDMAP` (below), everything else as data2_p80_s0 (DATA=all, share 0.8, seed 0, 2 epochs, same
  front end, same trainer).
- Measured: `error_analysis.mjs` on `kinds/data/dev_all.jsonl` (read alone), right / not done / done wrong, against data2_p80_s0
  dense (1516 / 2568 right; `run_curve.sh` exports dense, so dense against dense; the committed sparse export reads 1517), plus items
  2-4 above; the fit split too.
- It worked if: dev right >= 1490 (at most 1.0 point = 26 requests below 1516: the stated tolerance, the seed spread is not
  measured) AND fit right >= 6271 - 102 (1.0 point). If it misses: stop and report; no second map.

Switch to add (not implemented; specified only): `KINDMAP=<file.json>` in `msg_to_world.py`. When set, the frequency loop
(`for t, c in cnt.items(): if c >= a.freq ...`) is replaced by `for w, k in json.load(open(path))["map"].items(): kinds[w] = k`,
after `kinds = dict(base)`, refusing any entry that is a legend value token or an event token (a kind map never overrides them);
words not in the map get no entry (`unknown`). `kinds.tsv`'s header and REAL_WORLD.md name the file and its sha256 instead of
"seen >= N times". The training rows do not change (`convert` reads the lexicon only when no normalizer is given), only kinds.tsv.
The map file is `kinds_data2.json` from this folder (format {"map": {word: kind}}; shared kinds are named c<i>_<most frequent word>,
lowercase like the own kinds). A copy should go into the repository with the script that writes it before the run.

Command (when the training slot is free; it writes worlds/real and docs/model/kinds_p80_s0):

    cd /home/claude/diagram-vss-demo/training/sketch && DATA=all KINDMAP=/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/kinds/kinds_data2.json PREFIX=kinds ./run_curve.sh 0.8

then `MODEL=kinds_p80_s0 node error_analysis.mjs <folder holding dev_all.jsonl>` and the same for data2_p80_s0.

## Files (all in this folder)

- `prep_all.py` -> `data/fit_all.jsonl`, `data/dev_all.jsonl` (the all-data split; subset check)
- `ablate.mjs`: read-time kind maps on a trained model (single words: `--single`; maps: `--maps`) -> `abl_fix.json`, `abl_data2.json`
  (single), `abl_<tag>_maps.json`, `abl_<tag>_rule.json`; logs `*.log`
- `rows.py` -> `rows_<tag>.json` (raw rows, initial values, reached rows); `rowsfn.py` -> `rowsfn_<tag>.json` (functional profiles)
- `profiles.py` -> `prof_<tag>.json` (annotation features); `cluster.py` -> `clusters_<tag>.json` (2a/2b clusters, 3a, agreement);
  `ib.py` -> `ib_<tag>_self-next-prev-pos[_min2].json` (3b)
- `maps.py` -> `maps_<tag>.json`, `maps_<tag>_rule.json`, `rule_<tag>.json` (sign test), `kinds_<tag>.json` (the rule's kind map)
- `stats.py` -> `stats_out.txt` (every number of this file)

## 6. Training test on the old data against comb1_p80_s0 (pre-registered 2026-10-31, written before the training)

The coordinator's protocol: one training on the old data, against the new baseline `comb1_p80_s0` (CAL_FALLBACK=train QCOLOR=1
MARKER=0, `--frac 0.8`, seed 0, 2 epochs; llm_score.mjs on the old dev file `review/dev.jsonl`: SEG=gold 65.5%, own cut 52.7%; fit
68.8%).

The kind map, rebuilt for this baseline (`kinds_comb1.json`; scripts of this folder, nothing hand-edited):
- step 1 of the rule (sign test) was re-run on comb1_p80_s0 itself (`abl_comb1.json`; the old fit split `fitset/fit.jsonl`, which is
  identical to the current `front.split_of(m, 0.8)` of DATA=old: 947 / 947 messages). 13 words keep a kind of their own: the, to,
  labeled, and, with, of, named, a, it, called, lines, are, directly. Against fix_p80_s0 (16 words) `from`, `shape`, `shapes`, `i`,
  `pixels` no longer pass and `lines`, `are` do: with MARKER=0 a role's presence is no longer written only by own-kind words.
- step 2 (annotation clusters, `ib.py --min 2`, comb1's front end): the profiles are identical to those of fix_p80_s0 (same 2-fold
  curve), K* = 37 clusters over the 232 words seen >= 2 times plus UNK; with the 13 words taken out: 27 shared kinds.
- Result: 13 own + 27 shared kinds + 18 legend kinds (incl. VERB) + `unknown` = K 59 (comb1: 106). 231 words have a non-legend kind,
  143 of them `unknown` in comb1 (+1 not in its catalog). Route book estimated from the training rows: dense 10.8 MB (comb1 34.7),
  reached rows 3869 (comb1 4672), sparse 4.0 MB (4.8).
- Read time on comb1 without retraining (the rule's map, each shared kind read with the rows of its most frequent kinded word,
  pessimistic): fit 2976 -> 2957 (-25 / +6), dev 743 -> 736 (-8 / +1) requests fully right (error_analysis rule).

The switch: `KINDMAP=<file.json>` in `msg_to_world.py` (implemented as specified in section 5; default unchanged: with KINDMAP unset the
10 files of the world (legend.json, kinds.tsv, world.json, split_hints.json, front.json, examples/train.sop, examples/calib.sop,
raw/sentences.txt, status.json, REAL_WORLD.md) are byte-identical to those of the unedited script, with the default settings and with
QCOLOR=1 MARKER=0, `--frac 0.8`; the latter's legend sha256 cbf20196... = comb1_p80_s0's).

- Hypothesis: the kinds of the rule (K 59 instead of 106) read as well as the frequency cut-off 8 on the comb1 settings.
- One change: KINDMAP=diagnosis_kinds/kinds_comb1.json; everything else as comb1_p80_s0:
  `cd training/sketch && SOP_PYTHON=/home/claude/venv/bin/python3 CAL_FALLBACK=train QCOLOR=1 MARKER=0 KINDMAP=$PWD/diagnosis_kinds/kinds_comb1.json PREFIX=kinds SEED=0 ./run_curve.sh 0.8`
  -> `docs/model/kinds_p80_s0`.
- Measure: llm_score.mjs (VSS, wires right) on `review/dev.jsonl` with SEG=gold and with the own cut, as COMBINED.md.
- Criterion: dev SEG=gold >= 64.5% AND own cut >= 51.7% (each at most 1.0 point under comb1). If missed: stop and report.
- Also reported (not part of the criterion): K, dense / sparse route-book size, fit (fitset, SEG=gold and own cut), and the dev
  requests containing a word that gets a kind for the first time (read alone from the span: right in comb1 / in kinds).

### Result (model `docs/model/kinds_p80_s0`; run log `runs/kinds_p80_D1024_e2_s0.log`; written after the training)

The training ran as pre-registered (no other training running; llm_train/REAL_WORLD.md restored afterwards). The world: kinds 59 in the
trainer ("kinds 59; vocab 2627"), 3870 of 10720 phase-table rows reached (comb1: 4673 of 34173), same legend (sha256 cbf20196...),
same front end as comb1 (front.json byte-identical), 3902 training rows.

llm_score.mjs, VSS column, wires right; dev file `review/dev.jsonl` (1126 requests, read before; not a fresh test set). comb1_p80_s0
re-scored here on the dev file: identical to COMBINED.md; its fit numbers are COMBINED.md's (not re-run).

| file | comb1_p80_s0 (K 106) | kinds_p80_s0 (K 59) | criterion |
|---|---:|---:|---|
| dev, SEG=gold (cut as annotated) | 65.5% (738/1126), extra 64 | **65.6% (739/1126)**, extra 66 | >= 64.5%: pass |
| dev, own cut | 52.7% (593/1126), extra 328 | **53.0% (597/1126)**, extra 329 | >= 51.7%: pass |
| fit, SEG=gold (report only) | 68.8% (2961/4305) | 69.1% (2974/4305) | |
| fit, own cut (report only) | 52.0% (2239/4305) | 52.0% (2238/4305) | |

Criterion: SEG=gold >= 64.5% AND own cut >= 51.7%. Got 65.6% and 53.0%: **PASS** on both. The kinds of the rule read as well as the
cut-off 8 (+0.1 and +0.3 points: inside the tolerance, not a measured gain; the seed spread is not known).

Route book: dense 10,815,872 bytes (comb1 34,735,916: 3.2x smaller); sparse (not exported here) estimated 3870 x 1024 = 4.0 MB (comb1
4673 rows = 4.8 MB).

Each request read alone from its span (error_analysis rule, `ablate.mjs --dump`; `scores/base_comb1.jsonl`, `scores/base_kinds.jsonl`;
llm_score outputs in `scores/score_<model>_<gold|own>_<dev|fit>.txt`): dev 743 -> 745 fully right (13 right -> wrong, 15 wrong -> right), fit 2976 -> 2994 (28 / 46). Status changes are mostly
ok <-> abstain (dev 64 ok -> abstain, 46 abstain -> ok).

| dev requests (read alone) | n | comb1 right | kinds right | right -> wrong | wrong -> right |
|---|---:|---:|---:|---:|---:|
| containing a word that gets a kind for the first time (144 words, `unknown` in comb1) | 75 | 31 | 30 | 3 | 2 |
| containing a word whose own kind became a shared kind (74 words) | 397 | 233 | 229 | 8 | 4 |
| all | 1126 | 743 | 745 | 13 | 15 |

On fit the same two groups: 411 requests 174 -> 182 (3 / 11) and 1518 requests 908 -> 918 (10 / 20). The newly kinded words are rare
in dev (75 requests; most frequent: connected, around, my 4 each; change, ones, go, previous 3), so their effect on dev is not
measurable here (-1, 3 vs 2 flips). The words that lost their own kind lose 4 dev requests (8 vs 4 flips) and gain 10 on fit; the
total is +2 dev, +18 fit.

What this does and does not show: one seed, one dev file that has been read before; the result says the 47 kinds removed (106 -> 59)
were not needed by this reader on the old data, not that the new kinds help. Not run: the all-data version (`kinds_data2.json`
would have to be rebuilt on a comb1-type all-data model first, as step 1 of the rule was rebuilt here).

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/comb1_p80_s0` (a76b4e3), `docs/model/data2_p80_s0` (fbaa8dc), `docs/model/fix_p80_s0` (cf0545a), `docs/model/kinds_p80_s0` (a76b4e3). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
