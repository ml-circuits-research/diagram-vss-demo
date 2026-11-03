# BRIEF_HAIKU: proofread generated diagram-editor messages (one batch per agent)

You proofread messages that a program generated for a chat-based diagram editor. Each message holds 2 to 5 requests (commands or
questions about shapes, names, colours, sizes, positions, arrows) joined into one message. The program's wording is often stiff or odd.
Your job: rewrite each message so it reads like something a real person would type, **without changing what it asks for**.

Read only this brief and your batch file. Do not read or edit any other file of the repository.

## Input

`training/sketch/llm_train/synth_combo_raw/raw_NN.jsonl` (your batch number NN is given when you are launched; 100 messages, one JSON
object per line). The fields you use:

- `id`: copy it unchanged.
- `names`: the shapes already on the canvas (for your understanding; do not add others).
- `text`: the message to rewrite.
- `wires`: one entry per request, in order. In each, **`keep`** is the list of words of that request that must stay in your text exactly
  as written (the action word, the value words, the names, reference words such as "it", "them", "that one", "the newest one", "the red
  star", numbers, quoted labels). `span` shows which part of the text the request is. Ignore `args`, `type`, `trigger`, `rules_raw`.

## Output

`training/sketch/llm_train/synth_combo_raw/rewritten/rw_NN.jsonl` (same NN), one line per input message, in the same order:

```json
{"id": "sc-00105", "text": "Link Noah, Olivia and Grandma each to the next one, and then line up the orange hexagons horizontally please."}
```

Optionally add `"note": "..."` when you had a doubt (e.g. "request 2 edits a shape request 1 deleted"). Valid JSON, one object per line,
UTF-8, inner double quotes escaped (`\"Draft\"`). Every id of the batch exactly once.

## You MUST keep

1. **Every request, in the same order.** Never drop one, never add one (no new command, no new question, not even a polite "can you
   check it?").
2. **Every `keep` word of each request, spelled exactly as given** (only the capital letter at a sentence start may change). Do not
   replace a word by a synonym: "crimson" stays crimson, "box" stays box, "rhombus" stays rhombus, "scoot" stays scoot, "beneath" stays
   beneath, "two-way" stays two-way. Multi-word keeps ("on top of", "each to the next one", "in the top left corner", "the newest one")
   stay together, word for word.
3. **Names exactly** (capitalisation included), and **the order of the names inside a request**: "connect Api to Db" must not become
   "connect Db to Api"; "is Hub left of Gate" must not become "is Gate right of Hub".
4. **Quoted labels with their quotes** ("Draft", 'OK', “x > 0”) and **numbers as written** (40 stays 40, "three" stays three).
5. **References mean the same thing**: "it", "them", "that one", "the newest one", "the red star" must still point to the shape they
   point to in the input (usually the one the request just before made or touched). Do not turn a reference into a name or a name into
   a reference.

## You MAY change

- Connecting words and punctuation: "and", "then", "after that", "also", "next", "so", commas, full stops, question marks; split a long
  sentence or join two short ones (keeping each request whole and in order).
- Capitalisation and grammar around the keep words: "a orange" -> "an orange", "show me the connections?" -> "show me the connections",
  "the ellipses a large black diamond" -> fine as is if the keep words stay.
- Polite and filler words: please, could you, can you, thanks, ok, hey, now, just (a request may start with "could you" or end with
  "please").
- Short text that is not a request: a reason or a comment ("it's the backup link", "this is for my team", "thanks!"). **Such text must
  contain no diagram words**: no shape or colour or size words, no names, no numbers, and none of these verbs or nouns: add, draw, make,
  put, place, move, set, turn, change, paint, fill, give, delete, remove, clear, drop, reset, connect, link, join, wire, attach, line,
  arrow, box, label, title, copy, swap, align, arrange, spread, space, send, bring, top, bottom, left, right, center, middle, front, back,
  group, rule, default. Keep such additions rare and short (at most one per message).
- Words between the keep words of a request when the result is clearer and means the same ("Push the last dot right side of Vcc" ->
  "push the last dot right side of Vcc" is fine; do not turn "right side of" into "to the right of": it is a keep).
- An obvious typo in a keep word of 5 or more letters may be fixed (one letter); leave shorter words as they are.

## If a message is odd

The program combines requests at random, so some messages are odd ("make all the shapes an indigo ellipse, then make the ellipses a
large black diamond", or a request that edits a shape an earlier request deleted). Keep every request anyway and make the surrounding
words as plausible as you can; add a `note` if the message makes no sense as a whole. Never fix the oddness by dropping or changing a
request.

## Examples

Input text: `I'm explaining this to my team later. Undo. After that, wire Battery to Led and Coil. what rules are there? Push the last dot right side of Vcc.`
keep: `["Undo"]`, `["wire", "Battery", "Led", "Coil"]`, `["rules"]`, `["Push", "dot", "right side of", "Vcc"]`

Good: `I'm explaining this to my team later, so first: undo. Then wire Battery to Led and Coil. What rules are there? And push the last dot right side of Vcc.`

Bad: `... wire Led and Coil to Battery ...` (names reordered), `... move the last dot to the right of Vcc ...` (keep words "Push", "right
side of" replaced), `... and delete Cellar too.` (a request added), `... which rules are active?` with "rules" kept but a new question
added after it.

Input text: `Spawn a tiny pink rectangle labeled 'OK'. That's the main flow. write "retry" on the pink block`

Good: `Spawn a tiny pink rectangle labeled 'OK' (that's the main flow), then write "retry" on the pink block.`

## Checking (not your job)

The coordinator runs `training/sketch/synth/validate_combo.py`: it finds every request's keep words in your text, re-derives the spans,
and runs the editor's rule reader on your text. A message with a keep word missing, names reordered, an unknown name, or an extra
request is rejected, so following the MUST list above is what makes your work count.
