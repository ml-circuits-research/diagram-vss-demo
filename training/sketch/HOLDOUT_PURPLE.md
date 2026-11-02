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

## Result

Run 2026-11-02 here (the command above, with `SOP_PYTHON=/home/claude/venv/bin/python3`). Model: docs/model/micro/set_nopurple
(BUILD.json records HOLDOUT=purple). Scored with `MODEL=micro/<w> SEG=gold node training/sketch/llm_score.mjs <dir>` on the three
splits; set_w re-scored in the same run and equal to the baseline above.

| set | set_w | set_nopurple |
|---|---|---|
| P (128) | 80.5 / 10.2 / 9.4 | 78.1 / 12.5 / 9.4 |
| M (233) | 78.5 / 12.9 / 8.6 | 76.8 / 14.6 / 8.6 |
| R (3823) | 76.4 / 17.2 / 6.4 | 75.5 / 18.1 / 6.5 |

(right / wrong / not done, % of requests.)

Verdict: **it did not work**, by one request. P right 78.1 >= 75.5 and R right -0.9 (within 1 point) pass; P wrong 12.5% (16 of 128)
is above 12.2% (at most 15). Stopped here, as pre-registered.

Which value the wrong P readings took (set_w: 13 wrong, all of them a wrong target, the colour read right). set_nopurple: 16 wrong;
the 13 target errors are the same messages, plus three where **purple was read as another colour, the dangerous case**. In all three
the message also holds a colour word the world saw in training, and that word was taken instead of purple:
- hm-0108 "Set every shape that is not white to purple": color=white;
- sm2-0210 "Make Tante teal, no wait, make her purple": color=teal;
- sl-0070 "Jazz is gold, no wait, Jazz should be purple": color=gold.

Root cause: a value the world never saw is read from its kind most of the time (100 of 128 purple requests right without seeing the
word, against 103 with it), but when a seen word of the same kind is in the message, the seen word wins. Two of the three are
corrections ("X, no wait, purple"), where the right value is the later, unseen one.

For skills/vss-world-design: an operator world can read values it never saw when they are alone in the request, but not against a seen
value of the same kind; the values a world must choose between belong in its data.

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/micro/set_nopurple` (43ed76c), `docs/model/micro/set_w` (0776f18). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
