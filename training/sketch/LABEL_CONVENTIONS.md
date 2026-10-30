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
