# Label conventions (one set for training and test data)

The gold wires of every message, training and test, follow these conventions. They decide only HOW an answer is written, so that the
same meaning is always written the same way; they never change what the message asks for.

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

## Connect conventions (be consistent)

- "connect A to B" -> from "A", to "B". One to several ("link Hub to PcA, PcB and PcC") -> from "Hub", to "PcA,PcB,PcC", no pairing.
- "connect A, B and C in a chain / one after the other" -> from "A,B,C", pairing "chain", no `to`.
- "connect A, B, C each to the next" -> from "A,B,C", pairing "next", no `to`.
- "connect A, B and C all to each other" -> from "A,B,C", pairing "all", no `to`.

## Other conventions

- A key is written only when the text expresses it. No key "for completeness" (e.g. no pairing on a one-to-several connect).
- Self-corrections: the final value ("make it blue, no wait, teal" -> teal). A request that is taken back ("delete X... no, keep it")
  gets no wire.
- Chatter (reasons, greetings, comments) gets no wire.
- "make X bigger / smaller", "enlarge", "shrink" -> resize, target only. "make X huge" -> set, size huge.
- "what can be reached from X" / "which shapes can X reach" -> reachable, from X. "is Y reachable from X", "is there a path / route from X
  to Y", "can I get from X to Y" -> path, from X, to Y.
- A question "is X red / a circle / left of Y / bigger than Y?" -> question check. A statement "X is red" -> fact.
- "connect A to B and B to C" (a continuing sequence) -> one connect: from "A,B,C", pairing "chain".
- Several to one ("arrows from Water and Salt to Mix", "Bus and Tram both go to Metro") -> ONE connect: from "Water,Salt", to "Mix",
  no pairing (the mirror of one to several; one request, one wire, one span).
- Verb ellipsis ("Paint Mon red, Tue gold and Wed teal"): each request gets its OWN span ("Tue gold"), never a span shared by
  two wires. Its trigger is a word of its own span, as in the existing data (390 elided-verb wires counted 2026-10-31): set / create /
  fact / label / rename / rule -> the leading words of the span (136 of 137, "Tue"); move -> its position or direction phrase (180 of
  205); extreme / nearest -> the superlative word (12 of 12). connect is not settled ("Core to" 21, leading name 12 of 33).
- A request the legend cannot express gets no wire (e.g. restyling or recolouring an existing link: `connect` on two shapes already
  linked only reports that the link exists, docs/js/logic.js).
- A chain that closes a loop ("A to B, B to C, C to A") -> a chain from "A,B,C" plus a separate connect from "C" to "A" (4 of 4 in
  the existing data; a repeated name inside one chain makes a self-loop in logic.js).

## Rules fixed on 2026-10-31 (audit patterns P1-P3; every change is logged in `LABEL_FIXES_PATTERNS.md`)

- "line" -> `arrow: "none"`. The editor's cue list maps `line` to no arrowhead (logic.js:561). A connect whose text says "line" / "lines"
  (dashed line, dotted line, solid line, a line, a plain line) and does not say "arrow" gets `arrow: "none"`. A text with "arrow" keeps
  no arrow key (a plain arrow) or its own value ("two-way" -> both). Count: 401 connects say "line" without "arrow" (the 406 spans matching the word, minus 5 that are not the rule: hm-0271, hm-0310, sm-0290 and the shape names
in hm2-0162, hm2-0384); 85 already had `arrow: "none"`, the other 316 had no arrow key and were changed (sonnet_msg 28, haiku_msg 125, sonnet_msg2 21,
  haiku_msg2 14, sonnet_long 59, fresh1/sonnet 36, fresh1/haiku 33). Not changed: a chain whose "line" belongs to its first link only (hm-0271,
  hm-0310), "label the Scope line" (sm-0290, an existing link), a shape named Line / Line1.
- "next to X" / "beside X" in a question is spatial: the legend lists them as cues of position=near. "Which shapes are next to X",
  "what is next to X" -> `list`, `position: near`, `anchor: X` (17 questions changed). `neighbors` only when the question itself asks
  for connections / links ("what is linked to X", "who is connected to X", "what is connected to X"). "Is A next to B" stays `check`
  with position near.
- "the copies / clones / the new ones" after a duplicate (or create) in the same message -> `$new` (the value of the latest create /
  duplicate wire = exactly the new shapes), with the original in front when the text includes it ("Sensor,$new"). Never
  `mention(quantifier=all,recency=newest)`: with quantifier=all the editor ignores recency and matches every shape (23 wires changed,
  all in the sonnet folders). A single copy picked among several ("the copy at the right", "the last one") stays `mention(recency=newest)`.
  Open: copies from two duplicate wires in one message (sl-0060) cannot be written with one `$new`.
