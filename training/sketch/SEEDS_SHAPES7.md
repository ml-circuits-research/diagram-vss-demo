# How much of a per-action difference is seed noise? (pre-registered 2026-11-02, before the runs)

**Why.** CREATE_COLOR.md judged shapes7c against shapes7 per action with one seed each: set -2.6 points, fact -2.0. Without the spread
between seeds of the same build, a 2-point difference cannot be told from noise. These are the first runs on the owner's GPU machine
(training/laptop/README.md, "Without a link"), so they also show whether a cuda build reads like a cpu build.

**Runs** (on the GPU machine, DEVICE=cuda, everything else as the seed-0 builds; world name = build + seed):
- shapes7c seeds 0, 1, 2 (CREATE_COLOR=role): worlds shapes7c_g0, shapes7c_s1, shapes7c_s2;
- shapes7 seeds 1, 2: worlds shapes7_s1, shapes7_s2 (seed 0 is the cpu build docs/model/micro/shapes7).

**Measure.** Per action (create, set, resize, fact, rule) on the per-event gold of PLAN_B.md, right / wrong / not done, as in
CREATE_COLOR.md.

**How it is used (no pass/fail).**
- The spread (max - min of right) between the seeds of one build, per action, is the noise for that action.
- A difference between builds counts only when the two builds' seed ranges do not overlap.
- shapes7c_g0 against the cpu shapes7c (same seed): the cuda/cpu difference.
The CREATE_COLOR.md verdict stands as recorded; this adds what its set and fact differences mean.

## Result

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/micro/shapes7` (9aaacfc). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
