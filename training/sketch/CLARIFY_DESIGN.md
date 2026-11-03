# CLARIFY_DESIGN: how the conversation continues when a request is not executed (2026-11-03)

Owner's question: "Does a request do what is sure and come with a series of questions? Does it match the human's answers in chat to the
earlier questions? Or is it better not to phrase them as questions, but as a list of reasons why we were not sure, so the user must write
more clearly what they want: not as fluent, but explicit and clear."

Short answer: **no questions; reasons and the request written explicitly (design B)**. Measured on the 876 requests VSS-BERT did not execute
on the test parts: when the user writes the request again in the explicit shape the reply shows, VSS-BERT does it right 66.6% of the time
and wrong 2.2%; when the user answers a question with the missing value alone, the learned readers do it right 0.2% of the time (they were
trained on commands, not on answers), and putting the answer into the held request by code gets at best 50.5% right with 12.9% wrong,
executed without any reader's confidence.

## 1. What the demo does today

Run in a real browser with the shipped models (`training/sketch/clarify_probe_ui.py`, on a `git archive HEAD docs` copy so the other agents'
edits in progress do not change the page; every reader's line shown in the chat). How it works in the code (`docs/js/ui.js`):
- Every message is cut once and read by every reader; each reader's gate executes what clears its threshold and lists the rest under the
  reply ("Not sure about 1 of the 2 requests, so it was not done:"), each with its reasons and a **Do it anyway** button.
- A held request is **not remembered as an open question**. Nothing links a later message to it. Its button stays live in the old reply and,
  when pressed, runs that reading against the drawing as it is then.
- The only answer the demo matches is to the **engine's own question** ("Which circle? Start (middle left) and Done (bottom center)."): the
  next message is compared with the candidate names after removing "I mean", "use", "the one named / called"; an exact name runs the asked
  request again with that name; anything else is read as a new message and the question is dropped.
- The readers' context is the names on the canvas and `last` = the shapes the last executed request touched. A held request does not change
  `last`, so "it" in a follow-up points to the last thing done, not to the held request.

| situation (VSS-BERT tab; the other readers in brackets) | what is executed | what is said |
|---|---|---|
| “Make Check red and put Done below it” | Check is red; “put Done below it” is held (0.94, threshold 0.95) | “Check is now red. Not sure about 1 of the 2 requests, so it was not done: “put Done below it”: confidence 0.94, it acts from 0.95: both readers read it the same way, but the confidence of the reading is still below the threshold; SOP-BERT alone is not sure: not sure which shape ‘it’ means (taken from the conversation: Check).” [Do it anyway] (Rules, VSS and 3 readers moved Done; SOP-BERT held it) |
| then “the red one” | nothing | read as a new request: SOP-BERT reads a move with the shape taken from the conversation, VSS reads nothing; held: “only one reader found this request”. The earlier held request is untouched. |
| then “yes” | nothing | every reader: “I couldn’t turn that into anything I can do.” |
| then “Done” | nothing | read as a request (SOP-BERT: improve, VSS: respace); held: “the two readers read different actions here”. Done is also a shape's name. |
| then “move it left of Check” | nothing | held; “it” is filled from the conversation with Check (the last shape touched), i.e. “move Check left of Check”; the Rules ask “Which shape should I move?” |
| then “I meant the circle” | nothing | held: SOP-BERT reads a fact, VSS an align |
| is the earlier held request ever resolved? | no | its Do it anyway button is still live in the first reply |
| “make Start blue and line them up”, then “Align Start, Process, Check and Done horizontally.” | Start blue; “line them up” held (the readers disagree on the axis, the target and the direction); then the explicit command is executed by every reader | the old held request keeps its live button: pressing it now would align again |
| “Make Check red. Then put Done below it, and connect Start to Done with a dashed arrow. Process can be a hexagon”, then “yes, do it”, then “I meant Done should be below Check” | 3 of 4; “put Done below it” held (0.89); “yes, do it” → nothing (a held request “it”); “I meant Done should be below Check” → Done moved (read as a new, complete request) and a held request “I meant” | the old held request keeps its live button (it would move Done a second time, harmless here; a held create would make a second shape) |
| “add two circles named A1 and A2”, “make the circle green”, “the left one”, “A2” | VSS-BERT holds the create (readers disagree on count / items) and the set; Rules and VSS ask “Which circle? Start (middle left) and Done (bottom center).” | “the left one” is matched by nobody (only an exact name answers); “A2” is not among the candidates: “I couldn’t turn that into anything I can do.” |

So today: the system does what it is sure of and lists the rest with reasons and a button; it asks no questions of its own (only the
engine asks "which X?"); a short answer is read as a new command, and a held request is resolved only by the button or, without the
system knowing it, by a new complete command. The reasons mix numbers and reader names ("confidence 0.94, it acts from 0.95", "SOP-BERT
alone is not sure").

## 2. The experiment: what the readers do with a short answer and with an explicit rewrite

`training/sketch/clarify_experiment.mjs` (build / score) on every request VSS-BERT did not execute on the test parts of fresh2 and short3
(`combine/failures_vss_bert.mjs` rows), 876 cases (27 facts and 15 with an unnamed new shape left out). Each case gets one follow-up
message, read alone by SOP-BERT and VSS on the BERT cut (`combine/collect_pair.mjs` with the context's `last` taken from the row; a
temporary copy, see "Runs") and gated by the shipped combined reader. The goal of the follow-up is the held request's gold.
- **B (no question; rewrite)**: the gold request written by `clarify.js commandText`: the explicit shape the reply shows, with the values the
  user meant ("Move Done below Check.", "Connect Batter to Pan.").
- **A (question; answer)**: 402 cases have a slot to ask about: the first key the two readers disagree on, or the shape a context fill stood
  for. The answer is the gold value in words ("teal", "Batter and Pan", "below Kitchen", "Warehouse"), read with the most favourable context
  (`last` = the shapes of the held request). The other 474 cases have no disagreement: design A would ask "Did you mean ...?" and "yes" would
  run the reading, which is what Do it anyway does.

| follow-up (cases) | done right | done wrong | not done (held again / nothing read) |
|---|---|---|---|
| **B: the request written explicitly (876)** | **66.6%** | **2.2%** | 31.3% |
| B, fresh2 cases (620) | 76.5% | 0.8% | 22.7% |
| B, short3 cases (256) | 42.6% | 5.5% | 52.0% |
| B, the held reading was right (592) | 71.6% | 1.2% | 27.2% |
| B, the held reading was wrong (284) | 56.0% | 4.2% | 39.8% |
| B, the 402 cases with a slot | 64.9% | 3.5% | 31.6% |
| **A: the answer alone, read by the readers (402)** | **0.2%** | 0.2% | 99.5% |
| A: some reading of the answer contains the right value of the slot | 63.4% | | |
| A2: that value put into the held reading by code (an upper bound; nothing gates it) | 50.5% | 12.9% | 36.6% |
| “Did you mean ...?” + “yes” = run the held reading (474) | 80.6% | 19.4% | 0% |

What it shows:
1. **The learned readers cannot read an answer.** "teal", "Warehouse" or "below Kitchen" alone gives no request or another one (a bare name
   is read as delete, respace, set ...); 99.5% are not done. They are trained on commands. Slot filling would need either a hand-written merge
   (A2) or a new learned reader of answers, trained on dialogue data that does not exist.
2. **A2, the hand-written merge, is worse and unsafe.** It needs words matched to legend slots by code (a hand-written equivalence the
   learned readers may not have, AGENTS.md), and the merged request was read by nobody as a whole, so it has no confidence: 12.9% of the
   cases would be executed wrong, against 2.2% for B, which goes through the gate again.
3. **"yes" is not evidence.** The reading behind a "did you mean" is wrong 19.4% of the time; a "yes" typed out of habit runs it. The
   button is the same act but the reply can show exactly what it runs.
4. **An explicit rewrite works where the readers are good** (fresh2-like requests: 76.5% right, 0.8% wrong) and only partly on the new
   forms of short3 (42.6% right, 5.5% wrong: the shared errors of VSS_BERT_FAILURES.md, e.g. outline and undo with a count), and it is
   honest when it fails: 31.3% are held again, with reasons.

Limits: the rewrites were generated from the gold in the exact shape the reply shows; real users will write their own variants. The
answers were the gold value in the most favourable context. One run, on test parts already read (VSS_BERT_FAILURES.md).

## 3. Why B, in the terms of the project

- **Do only what you are sure of.** In B nothing runs that a reader has not read as a whole and the gate has not passed, except through the
  explicit Do it anyway button. In A the slot answer is merged by code and runs without a confidence.
- **Honesty: no promise the system cannot keep.** A question promises that the answer will be understood; measured, it is understood 0.2% of
  the time. B promises nothing but shows the form the system reads best; when that still fails, the next reply says why again.
- **Explicit and clear over fluent** (owner). B asks the user to write the request with names and values, in the help's forms, and shows one.
- **No hand-written equivalences between language and the legend** (AGENTS.md). B adds none: the reply is output written by code (as
  `summarize()` already is); the readers read the rewrite as any message. A needs a slot matcher or a new learned component (owner's
  approval).

The one place where matching an answer stays right is the engine's own question ("Which circle? Start or Done."): the choices come from the
drawing, the answer is an exact name (a mechanical step), and the reading was already sure. It stays as it is.

## 4. The design (B), exactly

### 4.1 What is executed
Unchanged: every request whose combined confidence clears the threshold of the chosen level, in message order. Added (VSS_BERT_FAILURES.md
fix 3): a request that **names** a shape that a held request of the same message would make (the create's `name`) is held too, as the VSS
gate already does for references. Its reason: "it uses what “add Fail below Check in red” would have made, and that was not done".

### 4.2 The reply (`clarify.js replyText`; the chat renders the same content with buttons)
```
<what was done, the engine's summary>                          e.g. Check is now red.
Not done, because I am not sure what you meant:                (n > 1: "Not done (n), because I am not sure what you meant:")
• “<the words of the request>”
  – <reason 1>                                                 at most 3 reasons, in this order: depends on a held request; two actions /
  – <reason 2>                                                 only one reader; the values the readers read differently (both values);
                                                               what the executing reader itself was unsure of, in words
  <one of these lines>
    Write it with <the keys> stated, like this: “<clearer command with ‹a or b?› placeholders>”     (the readers disagree on a value)
    Write it with the name instead of the word, like this: “<command with the name>”, or press Do it anyway.   (a context fill)
    Write the one you meant: “<command of reading 1>” or “<command of reading 2>”                   (two actions)
    If you meant “<command>”, write it like that, or press Do it anyway.                            (agreement, still below threshold)
    Do the request it depends on first; then write: “<command>”                                     (no Do it anyway)
  Do it anyway would run: “<the reading, written explicitly>”   (only when the line above has placeholders or two alternatives)
  [Do it anyway] [Edit]
```
Examples, as the module writes them:
```
Check is now red.
Not done, because I am not sure what you meant:
• “put Done below it”
  – “it” was taken to mean Check; the name was not written
  Write it with the name instead of the word, like this: “Move Done below Check.”, or press Do it anyway.

Not done (2), because I am not sure what you meant:
• “add Fail below Check in red”
  – the two readers read the name (Fail or nothing) and the position (below or above) differently
  Write it with the name and the position stated, like this: “Add a red shape named ‹which name?› ‹below or above?› Check.”
  Do it anyway would run: “Add a red shape named Fail below Check.”
• “connect Check to Fail with label "no"”
  – it uses what “add Fail below Check in red” would have made, and that was not done
  Do the request it depends on first; then write: “Connect Check to Fail. Label the arrow from Check to Fail "no".”

• “Coach2 to Seniors”
  – the words could mean two different things: connect or rename
  Write the one you meant: “Connect Coach2 to Seniors.” or “Rename Coach2 to Seniors.”
  Do it anyway would run: “Connect Coach2 to Seniors.”
```
Rules of the text: no numbers and no model names in the chat (the confidence, the threshold and which reader read what stay in **details**);
names as the drawing writes them; the clearer command uses the help's forms (`commandText`: "Connect A to B with a dashed arrow", "a line"
= no arrowhead, "two-way arrow", "Move A to the top right corner", "Label the arrow from A to B "x"", a connect with a label as two
commands). Checked on every gold request of fresh2 and short3: all 2332 are written without a gap, and the Rules read 91.0% of them back to
the same request.

### 4.3 The buttons
- **Do it anyway**: as today, one per held request; it runs exactly the reading that "Do it anyway would run" names, as one undoable turn.
  Not offered for a request held because it depends on another held one (the reason says which to do first). After use: "Done anyway".
- **Edit** (new): puts the clearer command into the message box, not sent; the user fills the ‹placeholders› or corrects it and sends it.
  It is then read like any message and goes through the gate.

### 4.4 What happens to a held request afterwards (`clarify.js updatePending`, `supersedes`)
- It stays **held**; nothing the user writes is merged into it, and no later message is read as an answer to it.
- It becomes **superseded** when a later message executes a request with the same action (or question) on the same shapes (target, from, to,
  anchor; a context fill counts with the name it was filled with). Its button turns into "replaced by your new command" and is disabled, so
  the request cannot run twice (today it can).
- It becomes **done anyway** when its button is used.
- A message in which no reader finds any request, while held requests are open (e.g. "yes", "the red one" when nothing is read), gets
  (`clarify.js nothingReadText`): "I found no request in this message, and I did not ask a question. The request I was not sure of is still
  not done: press Do it anyway under it, or write it again in full, e.g. “Move Done below Check.”" No word list decides this: it is the
  case "nothing was read" + "something is held".
  Note: today "the red one" and "move it left of Check" are read as (held) requests, not as nothing; they get the normal reply with their
  own reasons, which say "only one of the two readers found a request here" and "“it” was taken to mean Check".

### 4.5 The engine's question stays
"Which circle? Start (middle left) and Done (bottom center)." with the names as chips; an exact name (after "I mean", "use") answers it, as
today. Anything else is read as a new message; the reply adds "Write one of the names to answer the question." when no reader found a request.

### 4.6 Where the reasons come from (input of `clarify.js heldReply`)
| field | source in ui.js |
|---|---|
| `reading`, `other` | the executing reader's request and its partner's, canonical (`bench-canon.js canon` of the nodes) |
| `differ` | `combined-confidence.js agreement` (the item's `differ`) |
| `otherAct` | `combined-confidence.js reasons` group "action" (the other reader read another action on these words) |
| `signals` | `neural-confidence.js reasons` / `vss-confidence.js reasons` of the executing reader, as {group, text}; for a context fill {group: "context", word, filled, key} from the reader's gap / fill record |
| `dependsOn` | the held requests whose created names (or references) this one uses |

## 5. The prototype

- `docs/js/clarify.js` (new, pure ES module, no imports): `commandText` (a reading as an explicit command, placeholders for open keys),
  `reasonsOf`, `openKeys`, `heldReply`, `replyText`, `nothingReadText`, `supersedes`, `updatePending`.
- `training/sketch/test_clarify.mjs` (new): 56 checks, all pass: the help forms of `commandText`; the reasons and lines of each situation
  (disagreement, context fill, depends, two actions, one reader, agreement below the threshold); the "nothing read" text; superseding; every
  gold request of fresh2 and short3 written without a gap, and the Rules reading 91.0% of them back to the same request (floor 88%).
  `node training/sketch/test_clarify.mjs` (about 3 s).
- Integration into ui.js (after the other agent's work): in `doPart`, build the heldInput of each held unit (4.6) and render `heldReply`
  in `heldHTML` (reasons as a list, the clearer command, the Edit and Do it anyway buttons); keep a per-reader list of pending held requests
  and call `updatePending` with the executed readings of each new message; disable superseded buttons; use `nothingReadText` when nothing was
  read and something is pending; move the numbers to the details; add the name-dependency rule to the combined gate (`combinedRead`, where the
  reference rule already is). Then a browser test like `clarify_probe_ui.py` with assertions.

## Runs (2026-11-03)

- Probe: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 training/sketch/clarify_probe_ui.py <docs copy> <out.json>` (5 conversations, a
  fresh page each; `ONLY=4` plays one).
- Experiment: `node training/sketch/clarify_experiment.mjs build <rows.json> <dir> training/sketch/llm_bench/fresh2/opus_{a,b,c,d}
  training/sketch/llm_bench/short3`; then for D in A, B: a temporary copy of `combine/collect_pair.mjs` with `last: []` replaced by
  `last: (r.last || []).slice()` (sed, deleted after the run), `THREADS=2 node <copy> <dir>/rec_D clar <dir>/D` (A 18 s, B 51 s), and
  `node training/sketch/combine/failures_vss_bert.mjs <dir>/rec_D <dir>/D_rows.json <dir>/D`; then `clarify_experiment.mjs score <dir>`.

## 6. Integrated into the demo (2026-11-03)

`docs/js/ui.js` renders `clarify.js heldView` for every held request of every gated tab (VSS-BERT, and VSS / SOP-BERT when they are shown
in the chat), with the buttons Do it anyway and Edit; keeps per tab the held requests (`rd.held`) and calls `updatePending` with the readings
each later message (or Do it anyway) executed; uses `nothingReadText` when nothing is read while something is held; keeps the engine's
question open when nothing is read (4.5). Changes to 4.1–4.4 made while integrating:
- **The name rule (4.1)** is wider than "names a held create's name": SOP-BERT often reads the create without its name (s3-0261 "add Fail
  below Check": SOP-BERT reads no name, VSS reads Fail), so the rule is: while a create of the message is held, a request that names a shape
  which is not in the drawing and which no executed create of the message makes is held, reason "it needs “<the create>” first"
  (`ui.js holdNamed`, applied after every gate). Measured on the test part with the 2026-11-03 refit records (`combine/failures_vss_bert.mjs`,
  `DEP=names`): cost score 34.8 → 35.9, confidently wrong 1.84% → 1.58% (14 → 12 of 761 → 758 executed), done right 42.8% → 42.8% (747 → 746;
  s3-0088 "connect Done to Plan" is held although right); calibration part 40.3 → 42.8 (2 → 0 confidently wrong, nothing right lost). The
  narrow form (the held create's own name) held nothing on these records.
- The reason of a request that depends on a held one reads "it needs “…” first, and that was not done".
- The line above the held requests has no count ("Not done, because I am not sure what you meant:"): the chat has no numbers.
- `supersedes` compares the shapes the request is about (a create: its name; otherwise target, from, to; the anchor only when none of those
  is named) and needs all of the held request's shapes in the executed one: "move Start left of Check" does not replace "move Done below Check".
- "Write it with <keys> stated" names only the keys whose placeholder the command form shows (an align has no direction); a list of more than
  three names is shortened in the reasons ("Backdrop, Check, Done and others") and is never a placeholder choice.
- The executing reader's own reasons are said without numbers and stage names (`ui.js plainReason`).
Test: `training/sketch/test_clarify_ui.py` (browser).

