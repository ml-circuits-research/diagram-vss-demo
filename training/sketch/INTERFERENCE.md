# Interference hypothesis: one address per kind pair, shared by every sentence construction (pre-registered 2026-10-31)

Written BEFORE any training of this study. No test set is opened (llm_bench/*, docs/bench/blind.json, hand_broad); the files
scored are the fit file (`scratchpad/fitset/fit.jsonl`, the model's own training messages) and the dev file (`scratchpad/review/dev.jsonl`,
read before). No repository-wide search was run.

## Hypothesis (the coordinator's)

The VSS reader fits its own training data only about 69% (comb1_p80_s0: 68.8% on the fit file). Cause proposed: the route book has ONE
address per kind pair (rows indexed by kinds), shared by every sentence construction that has that kind pair. With a templated grammar
(the earlier repositories' worlds, > 98%) few constructions share a row; with free LLM-written text many do, so the learned phases are
compromises (interference). Small worlds of one construction family do fit (CAPACITY.md: lists 64/73 alone vs 0/73 in the full model).

## Experiments (same settings as comb1: CAL_FALLBACK=train QCOLOR=1 MARKER=0, old data, --frac 0.8, seed 0, 2 epochs, one training at a time)

1. D sweep. `run_curve.sh` gets an env `D` (default 1024; the command line is unchanged when unset). Train D=512 (PREFIX=d512) and
   D=2048 (PREFIX=d2048). Measure `llm_score.mjs` SEG=gold on the fit file and the dev file, next to comb1 (D 1024: fit 68.8%, dev 65.5%).
   Also peak RSS of the training and the route-book size (model files in docs/model/<prefix>_p80_s0).
   Reasoning: more dimensions give more room to separate constructions inside one shared address; if D does not help, the limit is not
   the dimension.
2. Family split, D 1024. `msg_to_world.py` gets an env `FAMILY=<comma list of events>`: only the training rows (and so the roles/events of
   the legend) of those events are kept; the front end and the kind lexicon are still learned from all messages (unchanged), so only the
   set of rows differs. Default unchanged. Model A: connect,disconnect. Model B: set,create,move (three largest families besides connect).
   Measure SEG=gold on the fit and dev requests OF ITS OWN FAMILY only (files filtered by gold action: command action / question ask),
   and the full comb1 model on the same filtered requests. Cross-check: the per-act counts of the unfiltered files (context intact).
   `llm_train/REAL_WORLD.md` is restored after each build.

## Pre-registered reading

- Interference is CONFIRMED if (a) fit rises by >= 5 points from D 1024 to D 2048, or (b) a family-only model fits its family's training
  requests (fit file) >= 10 points better than comb1 does on the same requests.
- If neither holds, the hypothesis is REJECTED (as a main cause). No second try, no patches.

## Results

(filled in below after the runs)

### 1. D sweep (comb1 settings; `llm_score.mjs` SEG=gold, wires right; fit = 4305 requests, dev = 1126)

| model | D | fit | dev | route book | training peak RSS |
|---|---|---|---|---|---|
| d512_p80_s0 | 512 | 68.5% (2951) | 66.5% (749) | 17.4 MB | 1.16 GB |
| comb1_p80_s0 | 1024 | 68.8% (2961) | 65.5% (738) | 34.7 MB | 1.57 GB (trainer log) |
| d2048_p80_s0 | 2048 | 69.5% (2994) | 66.3% (747) | 69.5 MB | 2.40 GB |

(comb1 re-scored here: 68.8% / 65.5%, as in COMBINED.md. RSS: peak of the child processes of run_curve.sh, resource.getrusage.)
Fit rises 0.7 points from D 1024 to D 2048 (criterion (a): >= 5). Criterion (a) NOT met. Quadrupling D moves fit by 1 point.

### 2. Family split (D 1024), SEG=gold on the requests of the model's own family (files filtered by gold action; messages without a
family request dropped, other wires of a kept message removed)

| family (training rows at frac 0.8) | requests fit / dev | family-only model, fit | comb1, fit | difference | family-only, dev | comb1, dev |
|---|---|---|---|---|---|---|
| A: connect + disconnect (718 rows) | 720 / 186 | 41.3% (297) | 41.7% (300) | -0.4 | 39.2% (73) | 33.9% (63) |
| B: set + create + move (1597 rows) | 1600 / 442 | 67.5% (1080) | 70.0% (1120) | -2.5 | 65.2% (288) | 67.6% (299) |

Cross-check with the per-act counts of the unfiltered files (context intact, comb1 vs family-only on fit): connect+disconnect 300 vs 297;
set 553 vs 538, move 373 vs 354, create 194 vs 188. Same picture. Training peak RSS: famA 1.33 GB, famB 1.21 GB.
Criterion (b) (>= +10 points on the family's training requests) NOT met: the best difference is -0.4 (A) and -2.5 (B); the
family-only models are not better, B is slightly worse (fewer rows, less to learn from).

## Verdict

Neither (a) nor (b) holds: the interference hypothesis is REJECTED as the main cause of the ~69% fit. More dimensions do not help
(+0.7 for 4x D), and removing all other constructions from the world does not help (connect/disconnect alone still fits only 41%,
i.e. the failure is inside the family, consistent with CAPACITY.md S2/S3: one source with several targets and several sources with one
target are not representable by independent single-role reads, not a clash between families). A smaller interference share
(<= ~2 points) cannot be excluded by this test with one seed each; no second try was made.

## Files

training/sketch/INTERFERENCE.md (this file); training/sketch/run_curve.sh (env D, default 1024; `| head -5` replaced by `| sed -n 1,5p`
because head closing the pipe made msg_to_world.py die with BrokenPipe under pipefail); training/sketch/msg_to_world.py (env FAMILY);
models docs/model/{d512,d2048,famA,famB}_p80_s0; runs training/sketch/runs/{d512_p80_D512,d2048_p80_D2048,famA_p80_D1024,famB_p80_D1024}_e2_s0{,.log};
llm_train/REAL_WORLD.md restored after each build (unchanged). Raw scorer outputs and filtered files: scratchpad res/ and fam/.
Note: `sop train` needs torch; it runs with SOP_PYTHON=/home/claude/venv/bin/python3 (no .venv in the repository).

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/comb1_p80_s0` (a76b4e3), `docs/model/d2048_p80_s0` (aee681e), `docs/model/d512_p80_s0` (aee681e). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
