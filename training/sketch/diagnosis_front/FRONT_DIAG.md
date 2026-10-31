# Why the learned front end puts no event token in 328 of its own 4305 training requests

Model: docs/model/fix_p80_s0 (front.json). Data: the fit split (947 messages, 4305 requests) and, for the changes, the dev file
(253 messages, 1126 requests, read only). Nothing in the repository was edited; no training, no commit. Test sets not opened.
Scripts and outputs are in this folder (list at the end).

## 0. What was reproduced

- `emit.mjs` repeats error_analysis.mjs (docs/js/front.js `normalize` on each span, names = message names + names created earlier):
  4305 requests, 328 with no event token (7.6%), all 328 "not fully right", as the coordinator measured.
- `check_relearn.py`: re-running `front.learn` on fit.jsonl with front_params.json gives exactly the stored front.json
  (119 values, 961 trigger rules). So the diagnosis below is of the real learning step.
- Event tokens produced by the front end = the legend's event verbs (generate.EVENTS), as in error_analysis.

## 1. The classes (first reason, in this order; every request is in exactly one)

| class | n | % of 328 | what it is |
|---|---:|---:|---|
| 1a verbless: the trigger is a name or starts with one | 107 | 32.6 | "Bank to Fraud with a dotted line", "Post blue", "Paris to Lille", "Yellow a yellow circle" (verb ellipsis) |
| 1b verbless: determiner + name | 34 | 10.4 | "the Hero a tiny blue circle", "the Lab small" |
| 1c verbless: the trigger is a value / position / description | 65 | 19.8 | "Fridge above Sink", "Laser to the top left", "a teal square called Science below Reading" |
| **1 total verbless** | **206** | **62.8** | (a previous measurement found 209; same order, the definition differs by 3) |
| 2 the trigger phrase never became a rule | 77 | 23.5 | 47 count only, 18 count + precision, 12 precision only |
| 3a a rule of the phrase exists, but not for this context | 6 | 1.8 | "Any lime things", "All three should be rectangles" |
| 3b a value n-gram rewrote the trigger word before the rule was tried | 14 | 4.3 | "Make all the circles teal" -> `all circles teal` |
| 4 ambiguous phrase: the event is decided by a word outside the 1-token context | 24 | 7.3 | "Can Prod be reached from Git" vs "What can be reached from Ingress" |
| 5 other | 1 | 0.3 | trigger "Where" is a prefix of the token "where's" |
| total | 328 | | |

Not found in any request: a rule that fired but lost to a longer rule (impossible by construction: apply_triggers returns on the
first match, so a fired rule always leaves an event token); a trigger word turned into a name (the "name" cases are all in 1a: the
annotated trigger itself is a name, e.g. a shape called "Post"/"Delete"/"Share" followed by a colour); an annotated trigger that is
not a contiguous substring of its span (all 328 triggers are contiguous). Class 4 is the closest to a "spread" trigger.

`classes_328.tsv` lists all 328 with their class. By event: 1a = set 43, connect 31, move 24, fact 6, label 3; 1b = set 29, fact 4,
label 1; 1c = move 39, create 15, set 4, extreme 2, connect 2; class 2 = connect 24, rule 13, list 6, ...; class 4 = path 11,
reachable 5, delete 2, ...

### How the classes were decided (so they can be checked)
- Gold event token = `front.event_token(w)`. Trigger phrase = the learner's own computation: annotated trigger, value-normalized
  (`apply_values`), punctuation dropped, **cut at the first name** (learn_triggers does this), then located in the value-normalized span.
- 1a: the cut leaves nothing (the trigger starts with a name). 1b: the cut leaves only determiners (`the`). 1c: what is left is only
  value tokens / digits / function words. The function-word list (the, a, to, of, at, in, on, with, and, it, them, her, very, just,
  far, pixels ...) is in `diag3.py` and is used ONLY to count "verbless" here; nothing learned uses it. Class 1 is therefore a
  count under that definition, not a fact of the data. Of the 65 in 1c, 16 have a rule of the same phrase in another context
  ("above" with NAME,B), so they are partly learnable (they would be class 3a if "above" is accepted as a trigger word).
- 3b: the trigger phrase, normalized alone, is not found in the span once the whole span is normalized (a longer value n-gram ate it).
- 4: the phrase's most general key (phrase, *, *) has share < trig_share 0.75, i.e. two events use the phrase.
- 3a: not 3b/4, phrase has a rule in some other context.
- 2: otherwise; the numbers are those of the key (phrase,*,*) (the most generous), counted exactly as learn_triggers counts them
  (n = annotated occurrences, share = top event / n, prec = n / (n + occurrences in chatter + in spans of other events)).

## 2. Examples and numbers per class

**1a (107)** `sm-0029` "Signup to Help with a plain line" (trigger "Signup to Help", gold connect); `sm-0058` "Bank to Fraud with a dotted
line"; "Post blue" (gold set; "Post" is a shape name). The annotation marks the two names and "to" as the trigger; `learn_triggers`
cuts at the first name, so the phrase is empty and no rule is made. There is no action word anywhere in the span.

**1b (34)** `sm-0087` "the Hero a tiny blue circle" (trigger "the Hero a", gold set); `sm-0167` "the Chain a long ellipse"; `sm-0204`
"the Lab small". The cut leaves the phrase `the`, which exists as a candidate (34 occurrences, share 0.85) but has precision 0.01
(1202 occurrences in chatter, 1216 in other-event spans), so it is correctly not a rule.

**1c (65)** `sm-0032` "Fridge above Sink" (trigger "above"); `sm-0035` "Bank to the bottom left" (trigger "to the bottom left");
`create` spans like "a teal square called Science below Reading" (trigger = the shape description "a teal square").

**2 (77)** Numbers are (n, share, precision; chatter / other-event-span false occurrences) of the general key.
- count only, 47 (phrase seen once, always with precision 1.0): `hm-0107` "Find a route from Clip1 to Clip3", phrase `find a route` (1, 1.0, 1.0);
  "Lb sends traffic to App1 and App2" `sends traffic to` (1, 1.0, 1.0); "every circle should be blue" `every circle should be` (1, 1.0, 1.0).
  Two sub-kinds: (i) the annotated trigger carries a subject/object (`every circle should be`, `all new ellipses should be`, `make all the
  boxes`, `tell me the shapes`, `what shapes are not blue`), so each distinct noun gives a new one-off phrase: 11 "rule" and 6 "list"
  spans are of this kind; (ii) a real verb seen once (`paint`, `wire`, `mark`, `sends samples to`, `fans out to`).
- count + precision, 18: "Farm feeds Mill and Mill feeds Shop" `feeds` (1, 1.0, 0.05: 19 false occurrences, 10 chatter sentences);
  "Give Floor3 a medium gray rectangle shape" `give` (1, 1.0, 0.07: 2 chatter, 12 spans); "Does Cy follow Ann" `follow`.
- precision only, 12: "Login goes to Signup with a dashed arrow" `goes to` (5, 1.0, 0.28: 13 chatter occurrences);
  "Post leads to Like and to Share" `leads to` (2, 1.0, 0.17); "Name it Love" `name` (2, 1.0, 0.4).
- Data finding behind the precision failures: the chatter (text outside every span) of the fit split contains sentences that have the
  same shape as the annotated requests, e.g. "Lexer feeds Parser and Parser feeds Ast, nothing more.", "Check goes to Scanner and
  Scanner goes to Gate.", "Trays leads to Hot, Hot to Cold, and Cold to Cashier.", "Seed links to Page1 and Page2, and Page2 links to
  Page3.", "Control talks to Dish1, Dish2 and Dish3." In 30 of the 77 class-2 requests a false occurrence in chatter or in another
  event's span is what kills the rule. For `goes to` the false occurrences are 12 of 13 in the same context (NAME, NAME) as the gold
  one, so no context can separate them: the learner sees the same sentence annotated 5 times and left unannotated 13 times. That is a
  property of the annotation (these sentences are probably "descriptions of a diagram", not requests), not of the learner.

**3a (6)** "Any lime things on the map yet" / "any triangles": `any` has 4 annotations, share 1.0, but precision 0.21 in general (15
false occurrences); the only rule is (`any`, *, `shape`) n=2, the context here is (B, `lime`) / (B, `triangles`). "All three should be
rectangles": `should be` has rules for (NAME,a), (NAME,*), (*,gray)..., this context is (`three`, `rectangles`). The context test is on the exact
neighbouring word, so a context seen fewer than twice has no rule and the most general key fails on precision.

**3b (14)** `hm-0090` "Make all the circles teal", `hm-0110` "Make every circle orange": the value table has `make all the` -> `all`
and `make every` -> `all` (each seen exactly 5 times, always with the gold quantifier `all`, so count 5 and precision 1.0 pass
val_min_count 5 / val_min_prec 0.8), so the word `make` is gone before any trigger rule is tried. Same for `align them` -> `horizontally`
(5 of 6) in "Align them horizontally" (6 spans). The verb co-occurs perfectly with the value because
the verb is always there when the value is: learn_values does not know which words are triggers.

**4 (24)** `reached from` (16 requests): used 14 times as the trigger of `path` ("Can Prod be reached from Git", 2 names) and 17 times of
`reachable` ("What can be reached from Ingress", 1 name); share 0.55, and both have the same one-token contexts (`be`, NAME). The
deciding words ("can ... be", "what can be") are two to four tokens to the left. Others: `show me` (3: count/list/describe, share 0.33; the
deciding word is the next phrase), `does` (is_there vs is_q, "Does Salt exist as a star"), `remove` (delete vs disconnect, "Remove the
connection between ..."), `place` (draw / move / arrange).

**5 (1)** "Where's the Road relative to the Crater": annotated trigger "Where", the tokenizer keeps `where's` as one word.

## 3. Where the causes sit in front.py, and a change for each

| class | where | learning change tested | what it might break |
|---|---|---|---|
| 1 (206) | not a front-end defect. In `learn_triggers`, `cut = next(k for k,x in enumerate(tt) if x.startswith("n_"))` throws away every trigger that starts with a name. | NAMEPH: keep such a trigger with names as a placeholder (`NAME to NAME`, `the NAME a`) and learn it as a pattern rule that INSERTS the event token in front of the matched words (it cannot replace them, the names must stay). | `NAME a`/`NAME blue` are annotated `set` in some messages and `fact` in others (most of the 12 new wrong events on fit, e.g. "Sandbox yellow", "Frame a triangle"); the route book was trained on streams without these inserted tokens and must be retrained and the old tests re-run. |
| 2 count | `learn_triggers`: the unit of learning is the whole annotated trigger, `n >= trig_min_count`. | SUB: every contiguous sub-phrase of an annotated trigger is a candidate (`every circle should be` gives `should be`, `make all the boxes` gives `boxes`...), counted over all triggers that contain it; fp counted as before but not inside the span's own trigger. | more rules (961 -> 2131) and more events in chatter ("the thread path", "the designers draw", "at the front"); the sub-phrase replaces only part of the trigger. |
| 2 prec | `prec = n/(n+fp)` with fp from unannotated request-like sentences. | none by learning: needs the annotation (are "X feeds Y" sentences without a span requests or not?). SMOOTH (`n/(n+fp+1)`) only trades coverage for fewer false triggers. | |
| 3b | `learn_values`: n-grams are counted without knowing the trigger words. | MASK: an n-gram that overlaps an annotated trigger but is not inside it still counts in the denominator but gives no evidence for a value (`make all the`, `make every`, `align them`, `many circles`, `at the top` stop being values). | 'all' must then be learned from words that really mean it ("every", "all the"), so 7 value n-grams disappear; the route book was trained with them. |
| 3a, 4 | `learn_triggers`/`apply_triggers`: the context is exactly one token on each side, compared as a word. | CTX2: a rule may also condition on the second token to the left (`prev2`), the most specific rule first. | 1566 rules (+605); JS twin (front.js applyTriggers and normalizeMessage) and the parity test must change. |
| 3a | same | CLS: a context token that is a legend value token is replaced by its kind (COLOR, SHAPE ...), so (B,lime) and (B,triangles) are one context. | did not help (see below): fit false triggers 397 -> 418, dev 112 -> 119. Not proposed. |

## 4. Measurements (re-learned in a scratch folder with `front_x.py`; same params; fit = learned from fit, dev = learned from fit, read on dev)

(a) spans with no event token (by `normalize` on the span); (b) event tokens produced by the whole-message path
(`normalize_message` logic: every rule that fires) at a position outside every span; (c) spans that have an event token but not the
gold one. Fit: 4305 spans, dev: 1126 spans. `front_x.py` with no flag reproduces front.json exactly, and (a) = 328 on fit.

| variant | rules | fit (a) | fit (b) | fit (c) | dev (a) | dev (b) | dev (c) |
|---|---:|---:|---:|---:|---:|---:|---:|
| baseline (stored front.json) | 961 | 328 | 397 | 135 | 92 | 112 | 40 |
| MASK (3b) | 973 | 312 | 387 | 135 | 89 | 107 | 39 |
| CTX2 (3a, 4) | 1566 | 296 | 398 | 123 | 90 | 113 | 38 |
| MASK + CTX2 | 1586 | 280 | 388 | 123 | 87 | 108 | 37 |
| NAMEPH (1a, 1b) | 1031 | 222 | 401 | 145 | 65 | 113 | 46 |
| SUB (2, 1c) | 2131 | 224 | 612 | 207 | 63 | 170 | 57 |
| SUB + SMOOTH | 2045 | 248 | 559 | 213 | 68 | 158 | 61 |
| MASK + SUB + CTX2 | 3591 | 179 | 662 | 195 | 58 | 185 | 52 |
| MASK + SUB + SMOOTH + CTX2 | 3492 | 191 | 607 | 192 | 59 | 173 | 52 |
| MASK + SUB + SMOOTH + CTX2 + NAMEPH | 3725 | 100 | 622 | 196 | 32 | 178 | 58 |
| SMOOTH alone | 936 | 351 | 356 | 127 | 97 | 96 | 38 |
| CLS | 919 | 312 | 418 | 141 | 89 | 119 | 40 |
| what-if `trig_min_count` = 1 (not a proposal, memorizes) | 2278 | 201 | 456 | 72 | 80 | 129 | 39 |

Per class (of the 328; still no event / event = gold / event other), fit:

| class (n) | MASK | CTX2 | NAMEPH | SUB | MASK+SUB+CTX2 |
|---|---|---|---|---|---|
| 1a (107) | 107/0/0 | 107/0/0 | 14/87/6 | 80/27/0 | 84/23/0 |
| 1b (34) | 34/0/0 | 34/0/0 | 22/11/1 | 34/0/0 | 34/0/0 |
| 1c (65) | 64/1/0 | 50/15/0 | 64/1/0 | 27/35/3 | 11/51/3 |
| 2 (77) | 73/4/0 | 76/1/0 | 77/0/0 | 41/33/3 | 40/35/2 |
| 3a (6) | 6/0/0 | 6/0/0 | 6/0/0 | 3/3/0 | 2/3/1 |
| 3b (14) | 0/14/0 | 14/0/0 | 14/0/0 | 14/0/0 | 0/14/0 |
| 4 (24) | 24/0/0 | 8/14/2 | 24/0/0 | 13/5/6 | 4/15/5 |

Reading the numbers:
- MASK removes 14 of 14 class 3b and costs nothing: fit (a) 328 -> 312, (b) 397 -> 387, dev (a) 92 -> 89, (b) 112 -> 107. A first
  version that dropped straddling n-grams entirely also created bogus values (`in the` -> center); counting them in the denominator
  avoids it.
- CTX2 fixes 14 of 24 class 4 and 15 of 65 class 1c, with no new false triggers (b 397 -> 398), but dev gains only 2: the ambiguous
  phrases are frequent in fit (`reached from` 31 times) and rare in dev.
- NAMEPH is the largest single gain on the verbless classes (fit (a) -106, dev -27) with almost no new false triggers
  ((b) +4 fit, +1 dev), but 12 of its new events are wrong on fit (c +10, dev +6) and it changes the token stream the route book reads.
- SUB gives the biggest drop in (a) for the verb classes (fit -104, dev -29) but at a price: false triggers +215 on fit (+54%) and
  +58 on dev (+52%), wrong events +72 / +17. About two new false triggers per recovered span. SMOOTH reduces that
  (SUB+SMOOTH: (b) 559 / 158) and gives back 24 / 5 of the gain. Any choice here is a thresholds choice and should be made by the
  held-out protocol (select_front.py), not from these numbers.
- On dev the share of spans without an event token is 8.2% (92/1126), the same as fit's 7.6%: this is not a fit/dev gap; the
  front end behaves the same way on text it did not learn from.
- The what-if `trig_min_count` = 1 shows the limit of count: it recovers all 47 "count only" requests on fit but dev (a) falls only 92 -> 80, and
  false triggers rise by 59 / 17; it memorizes training triggers.

## 5. One-sentence answer

The front end misses 328 of its own triggers because 63% of them are not words at all (the annotated trigger is a name, a determiner
plus a name, or a value/position phrase: `learn_triggers` cuts at the first name and keeps only action-like phrases), and of the 122
that do have an action word, 77 never reach the thresholds (one-off phrases that carry their subject, or request-like sentences left
unannotated in the chatter), 24 use a phrase shared by two events whose deciding word is outside the one-token context window, and 14 lose
the verb to a value n-gram (`make all the` -> `all`) in `learn_values` before the triggers are tried.

## 6. Files (all in this folder)

- `emit.mjs` repeats error_analysis.mjs (MODEL=fix_p80_s0 node emit.mjs fit.jsonl fit_emit.json); `fit_emit.json` its output.
- `common.py`, `check_relearn.py` (re-learn == stored front.json), `diag1.py` (instrumented counts of learn_triggers), `diag2.py`, `diag3.py`
  (classification) -> `diag2.json`, `diag3.json`, `classes_328.tsv`.
- `front_x.py` the scratch variants (flags SUB, MASK, CTX2, CLS, NAMEPH, SMOOTH), `measure.py` (a, b, c), `variants.py`, `variants2.py`
  -> `variants2.json`, `variants2.txt`, `F_*.json` (the re-learned front ends), `inspect_b.py`, `lost.py`, `prec_ctx.py`, `chat_ex.py`.
- Limits: (1) the effect on the reader (route book) was not measured, only front-end counts; every change alters the token stream the
  route book was trained on. (2) (b) counts rule firings in text outside spans, which may include unannotated requests (see 2); baseline (b)
  is already 397 on fit. (3) Names for dev are the message names plus names in the wires, as `front.requests` does; fit (a) with this
  rule is also 328. (4) No parameter was searched; each variant was run once as defined.
