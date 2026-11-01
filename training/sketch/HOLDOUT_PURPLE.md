# Abstraction test: can a world read a value it never saw? (pre-registered 2026-11-01, before the run)

**Question.** Is a value read from its kind, or does the world need to see the word itself in training? The legend gives every
value its question's kind: `purple` is a COLOR. If kinds are what the world uses, a world that never saw "purple" should still read
"make Box purple" as set color=purple. This decides whether operator worlds such as set need every value in their data
(skills/vss-world-design, "fewer words per world").

**Build (one change).**
- Test model: `set_nopurple`, the world set_w with one change: HOLDOUT=purple. Every message whose text contains the word "purple" is
  left out of its rows, its own front and its kinds: 192 of 4640 messages, 3822 rows instead of 4055.
- Everything else as set_w: DATA=spans FRONT_ROWS=world, KINDMAP=diagnosis_kinds/kinds_comb1.json, D 1024, 10 epochs, seed 0.
- The legend is unchanged, so `purple` keeps the kind COLOR. The front passes the word through unchanged with or without the hold-out:
  "make Box purple and Hub teal" -> `make n_box purple and n_hub teal` in both.

```
HOLDOUT=purple DATA=spans FRONT_ROWS=world N_EVAL=150 EVAL_MODES=primary VSA_MAX_HOURS=12 bash training/sketch/train_micro.sh set_nopurple set
```

**Measure.**
- **Data:** gold set requests (micro_tools.py gold set: 2879 messages, 4056 requests), split by holdout_split.py:
  - P: the 128 requests whose gold value is purple (125 messages);
  - M: all 233 requests of the 156 messages that mention purple;
  - R: the 3823 requests of the other 2723 messages.
- **Scoring:** `MODEL=micro/<w> SEG=gold node llm_score.mjs <dir>`, per request: right / wrong / not done.
- **Wrong readings:** for P, also count which value a wrong reading took. Another colour is the dangerous case.

**Baseline, measured now: set_w, which saw purple in training.**

| set | right / wrong / not done |
|---|---|
| P (128) | 80.5 / 10.2 / 9.4 |
| M (233) | 78.5 / 12.9 / 8.6 |
| R (3823) | 76.4 / 17.2 / 6.4 |

**Threshold: "it worked".**
- On P, set_nopurple has right >= 75.5 (at most 5 points below set_w) and wrong <= 12.2 (at most 2 points above).
- 5 points on 128 requests is about 6 requests.
- On R, right must not fall by more than 1 point against set_w. Its data lost 233 rows, so a small drop there is not about
  abstraction.

**If it misses.** Stop and report: values are then learned per word, and an operator world needs its values in the data. A wrong
reading that takes another colour is reported apart: it is worse than "not done".

Run: on the laptop box (training/laptop/README.md) or here after Plan B. Result: this file, section "Result".
