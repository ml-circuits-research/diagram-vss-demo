# LLM-written TRAINING messages: what to write

You write realistic messages that a person types into a chat-based diagram editor, each with its gold formalization in the editor's
legend. They TRAIN a small reader that must later understand messages it has never seen, written by other people. So the data must look
like real use, not like a template: whole messages of any natural length, from one or two sentences up to long messages of 10-20
sentences (a person describing or reworking a whole diagram), simple and complex sentences mixed (subordinate clauses, reasons,
"and then", a question tagged on, self-corrections, text that is not a request). Mostly instructions, plus questions in about half of
the messages. No quotas: never pad a message or add sentences to reach a length or a count per action; write what a person would write.

Do NOT read anything under training/sketch/llm_bench (the test set) or any other file of the repository except this one.

## Output

JSON Lines, one message per line:

```json
{"id": "m-0001", "domain": "network diagram", "names": ["Router", "Lan"], "text": "ok so I'm mapping the office network. Could you slap a gray hexagon named Switch right under the Router? Then hook it up to Lan with a dashed line, it's a backup link. How many hexagons do we have now?", "wires": [
  {"span": "Could you slap a gray hexagon named Switch right under the Router", "trigger": "slap", "type": "command", "args": {"action": "create", "shape": "hexagon", "color": "gray", "name": "Switch", "position": "below", "anchor": "Router"}},
  {"span": "Then hook it up to Lan with a dashed line", "trigger": "hook it up", "type": "command", "args": {"action": "connect", "from": "$new", "to": "Lan", "style": "dashed"}},
  {"span": "How many hexagons do we have now", "trigger": "How many", "type": "question", "args": {"ask": "count", "shape": "hexagon"}}]}
```

- `names`: the shapes ALREADY on the canvas before this message (one capitalised word each, letters and digits only). Mention only these
  or shapes the message itself creates.
- `wires`: one per action or question, IN THE ORDER the text states them. Text that is not a request ("ok so I'm mapping the office
  network", "it's a backup link", "thanks!") gets no wire.
- `span`: the exact substring of `text` (copied character for character) that expresses this request, without the chatter around it.
- `trigger`: the exact word or words inside `span` that say WHICH action or question it is (the verb or question phrase: "slap",
  "hook it up", "How many", "get rid of", "is ... bigger than" -> write "bigger than"). Copied as written, typos included.

## The legend (the only things the editor can do; express everything in it)

Wire `type` is `command`, `question`, `fact` (the user states how something IS, e.g. "Db is green") or `rule` (a default for shapes created
LATER: "from now on circles are orange").

Commands, by `action` (other keys as listed; leave out what the sentence does not say):
- `create`: shape, color, size, name, label, count (only when 2 or more), position, anchor
- `delete`: target
- `move`: target, then either position (+ anchor) or direction (+ distance in pixels)
- `set`: target and the new color / shape / size (size only as tiny, small, medium, large, huge)
- `resize`: target ("make X bigger / smaller", "enlarge", "shrink")
- `rename`: target, name; `label`: target, label (the text written on the shape)
- `duplicate`: target, count (only when 2 or more); `swap`: target = "A,B"
- `connect`: from, to, and optionally style, arrow, color, label, pairing; `disconnect`: from, to
- `align`: target, axis; `arrange`: target (omit for "everything"), layout; `distribute`: target, axis
- `toFront`, `toBack`: target; `undo`; `redo`; `forget` (forget the default rules)

Questions, by `ask`:
- `count`, `exists`, `list`: filters shape, color, notColor, position + anchor (count of connections: `kind` = "edge")
- `property`: target, property = color | position | size | shape | label
- `describe`: target (omit for the whole diagram); `neighbors`: target; `connected`: target, anchor (are A and B directly linked)
- `degree`: target; `path`: from, to; `reachable`: from; `cycle`; `rules`
- `check`: target and one of color / shape / size / notColor, or position + anchor, or comparison (bigger | smaller) + anchor
- `extreme`: superlative = biggest | smallest | leftmost | rightmost | topmost | bottommost | mostConnected | leastConnected
- `nearest`: anchor, superlative = closest | farthest, optional shape / color

Facts: target and color / shape / size, or position + anchor. Rules: shape (optional) and color or size.

Values:
- shape: circle, square, rectangle (box), triangle, diamond, ellipse (oval), hexagon, star
- color: red, orange, yellow, gold, lime, green, teal, cyan, blue, navy, indigo, purple, magenta, pink, brown, gray, black, white
- size: tiny, small, medium, large, huge
- position: leftOf, rightOf, above, below, near, between (anchor = "A,B"), and canvas places center, top, bottom, left, right, topLeft,
  topRight, bottomLeft, bottomRight
- direction: left, right, up, down; distance: a number of pixels
- style: dashed, dotted; arrow: none (a plain line, no arrowhead), both (two-way); a plain arrow needs no arrow key
- layout: row, column, grid, circle; axis: horizontal, vertical; pairing: chain, next, all

## Gold conventions (exactly these, or the scoring cannot compare)

- An existing shape by name -> its name, as in `names` ("target": "Router").
- A shape created earlier in the same message -> "$new" ("draw a box called Cache and connect it to Db" -> the connect wire has
  from "$new", to "Db"; later sentences that name Cache also write "$new").
- A description instead of a name -> `mention(k=v,...)` with keys in alphabetical order among color, notcolor, quantifier, recency, shape,
  all lower case: "the red circle" -> "mention(color=red,shape=circle)"; "all the squares" / "every square" / "the squares" ->
  "mention(quantifier=all,shape=square)"; "the boxes that are not blue" -> "mention(notcolor=blue,quantifier=all,shape=rectangle)";
  "the new / last / latest diamond" -> "mention(recency=newest,shape=diamond)"; "the first star" -> "mention(recency=oldest,shape=star)";
  "everything" as a target -> "mention(quantifier=all)".
- A pronoun ("it", "them", "that one") -> what it refers to, written as above (a name, "$new" or a mention).
- Several shapes in one key -> comma-joined in order: "Start,Done".
- Numbers as digits ("count": "3", "distance": "40"). Labels exactly as written inside the quotes, without the quotes.
- Never invent keys; never add a key the sentence does not express.

## Coverage

Spread the requests over EVERY action and question of the legend, roughly in proportion to how often people would use them (create, set,
connect, move most often; but at least 40 requests per file set for every action and every question type, including extreme, nearest, connected,
degree, comparison checks, distribute, toFront / toBack, pairing, notColor and recency mentions). Vary which optional keys appear.
Use different domains, personas and names throughout; never reuse a sentence frame more than a few times.

## Connect conventions (be consistent)

- "connect A to B" -> from "A", to "B". One to several ("link Hub to PcA, PcB and PcC") -> from "Hub", to "PcA,PcB,PcC", no pairing.
- "connect A, B and C in a chain / one after the other" -> from "A,B,C", pairing "chain", no `to`.
- "connect A, B, C each to the next" -> from "A,B,C", pairing "next", no `to`.
- "connect A, B and C all to each other" -> from "A,B,C", pairing "all", no `to`.

## Variety (the point of the exercise)

- Many domains: flowcharts, org charts, network and cloud diagrams, state machines, mind maps, family trees, kanban-like boards, school
  diagrams, UI wireframes made of shapes, pipelines, floor plans, game maps, recipes, sports plays, story boards, anything people draw.
- Many people: terse engineers, chatty students, non-native speakers (small grammar slips), voice dictation (run-ons, "uh", "okay so"),
  self-corrections ("make it blue, no wait, teal": gold = teal), polite requests, imperatives, questions to check the result. About 1
  message in 10 has a typo or two.
- Vary the verbs and phrasings as widely as real people do; every action and every question kind must appear many times, each time in a
  different way. Do not reuse a sentence frame more than a few times in the whole file.
- Use $new for a shape created earlier in the same message (also when a later sentence refers to it by its name or by "it").
