# Front end v2 (FRONT_V2=1): does learning the front end better lift the one-request reading?

Pre-registered 2026-10-31, before any training or scoring of the new model. One run, no knobs turned after the numbers.
Cause analysis: `FRONT_DIAG.md` (same folder).

## What changed (code only, no training so far)

Behind one environment switch `FRONT_V2=1` (default: unchanged). Python `front.py` (learning and applying) and its twin `docs/js/front.js` (applying).

| change | where | what it does |
|---|---|---|
| MASK | `learn_values` | a word n-gram that overlaps an annotated trigger without being inside it is no evidence for a value; it still counts in the denominator of the precision. (`make all the` -> `all` ate the verb `make`.) |
| CTX2 | `learn_triggers`, `apply_triggers`, `normalize_message`; JS `applyTriggers`, `normalizeMessage` | a rule may also condition on the second token to the left (rule field `prev2`); the most specific rule is tried first. |
| NAMEPH | same | a trigger that starts with a name ("Bank to Fraud", "the Hero a") is no longer dropped: it is learned as a pattern over the placeholder `NAME` ("NAME to NAME"); such a rule (field `ins`) INSERTS the event token in front of the matched words, the names stay. |

Applying a `front.json` is the same code with the switch on or off: the new rule fields (`prev2`, `ins`, phrases with `NAME`) are read when
present. Only learning is behind the switch. `front.json` has an extra key `v2` when learned with the switch on.

Checks done (nothing trained):
- Switch off: `front.learn` on the fit split gives byte-for-byte the output of the old `front.py` (also with `FRONT_TAGGER=1`), and the same content
  as the committed `docs/model/fix_p80_s0/front.json` (re-serialized with the committed format: identical bytes). The old and the new applying code give the same
  tokens for `normalize` (every annotated span) and `normalize_message` (every message) of all 2640 training messages with the committed `fix_p80_s0/front.json`.
- Parity Python/JS (`parity_front_golden.py` writes the golden, `parity_front.mjs` reads it; it now also checks the normalization of every annotated span
  and of the whole message with source spans): committed `fix_p80_s0/front.json` 2640/2640 identical; a `front.json` learned with `FRONT_V2=1` from the fit
  split 2640/2640 identical (12783 spans), and learned from all 2640 messages (3600 rules, 1467 with `prev2`, 197 pattern rules with `ins`) 2640/2640 identical.
  A `front.json` learned from the fit split with the switch on: 112 value n-grams, 1695 rules (652 with `prev2`, 109 pattern rules) against 119 and 961.

## Front-end counts without training (learned from the fit split, 947 messages / 4305 requests; dev = `review/dev.jsonl`, 253 messages / 1126 requests)

(a) annotated spans with no event token; (b) rule firings in the text outside every span; (c) spans with an event token but not the gold one.
Same definitions as `FRONT_DIAG.md`; computed with the real `front.py` code by `measure_v2.py` (this folder; (b) uses the rule-firing count of `front_x.py`, whose rules equal `front.py`'s).

| | fit (a) | fit (b) | fit (c) | dev (a) | dev (b) | dev (c) |
|---|---:|---:|---:|---:|---:|---:|
| `FRONT_V2` off (= committed fix_p80_s0 front end) | 328 | 397 | 135 | 92 | 112 | 40 |
| `FRONT_V2=1` | 174 | 392 | 133 | 60 | 109 | 43 |

Dev (a) 92 -> 60 is 8.2% -> 5.3% of the requests.

## Hypothesis

Roughly half of the spans the front end leaves without an event token (dev: 92 of 1126) get one, without more false triggers in the text outside the spans
(dev (b) 112 -> 109) and without more wrong events (dev (c) 40 -> 43); so the reader reads more requests from their span (cause A falls) and
does not lose elsewhere. NAMEPH is the largest part of the gain (name-initial triggers: "Bank to Fraud ..." now gets `connect`). What the
reader does with a token stream in which an event token stands in front of the names it did not replace is NOT known: the route book is
trained on such streams for the first time. The default cut (`vssCentres`) finds centres where a rule fired; an inserted event token counts as a fired rule.

## Training (one, coordinator's slot)

Old data, 2 epochs, same recipe as `fix_p80_s0`: `PREFIX=fv2 SEED=0 FRONT_V2=1 ./run_curve.sh 0.8` (DATA unset = `sonnet_msg`, `haiku_msg`; D 1024; held-out
calibration; no negatives) -> `docs/model/fv2_p80_s0`. Baseline: `docs/model/fix_p80_s0` (same settings, switch off). `front_params.json` unchanged.

## Measures (model `fv2_p80_s0` against `fix_p80_s0`)

On the old dev file (`review/dev.jsonl`, 253 messages, 1126 wires), with the current MAIN scorer:
1. `llm_score.mjs` with `SEG=gold` (reading alone, annotated spans): wires right, extra wires;
2. `llm_score.mjs` with the default cut (the VSS reader's own cut): wires right, extra wires (reported, not in the criterion);
3. `error_analysis.mjs` (annotated spans read alone): cause A "action word not recognized" and the other causes B-G.
Also reported, not in the criterion: the same on the dev files `dev_new/msg2/dev.jsonl` and `dev_new/long/dev.jsonl`, and the front-end counts (a) (b) (c) above for the model's own `front.json`.

## Criterion (on the OLD dev file, all three must hold)

Baseline `fix_p80_s0`, MAIN scorer: reading alone 61.0% (extra wires 71); cause A 8.2%.
1. reading alone (`SEG=gold`, MAIN scorer) wires right >= 61.0% + 1.5 points = 62.5%;
2. cause A (error_analysis) <= 6.0%;
3. extra wires with `SEG=gold` <= 80.

PASS only if all three hold. Otherwise: fail; report the numbers and the causes (error_analysis), no patches, no second try. A pass on this file says
nothing about the test sets; a new test set is needed for an honest number.
