# Pair consistency: where near-identical constructions get different actions

Read-only analysis of the nine annotated folders (`python3 training/sketch/micro_tools.py dirs`): 4635 messages, 22702 wires. No data file was changed. Companion file: `training/sketch/pair_fixes_proposed.jsonl` (one proposed fix per line, **not applied**; 158 wires).

## Method

1. **Normalisation of each gold span** (`strict` pattern): names (the message's `names`, names it creates, any capitalised word after the first) -> `NAME`; digits -> `NUM`; quoted text -> `TEXT`; legend value words -> their key: `COLOR` (the 18 colours + a few synonyms), `SIZE` (tiny..huge and big, little, giant...), `SHAPE` (the 8 shapes, box, oval, plurals), `POSITION` (left of, right of, above, below, under, next to, near, between, top left, in the center, ...), plus four keys I added because the pairs differ exactly there: `LAYOUT` (row, column, grid, "in a circle"), `AXIS` (horizontally, vertically), `STYLE` (dashed, dotted), `CMP` (bigger, smaller, larger). Name lists ("A, B and C") are collapsed to one `NAME`, leading filler (ok, so, then, please, could you ...) is dropped, all other words are kept, lower case.
2. **Looser pattern** (`loose`): the wire's trigger words + the order of the value keys left in the span (e.g. `is | NAME COLOR`, `put | NAME POSITION`).
3. **Loose + mood**: the loose pattern plus D/Q (Q = inverted auxiliary / wh-word at the start of the span, or `?` right after it). Used because set/fact/check differ in mood only.
4. For each pair: patterns that occur with both actions, the majority action, the **minority labels** (wires not of the majority action in a shared pattern) and their share of **all the pair's wires** (both actions). A minority label is only a *candidate* inconsistency; the sections below read the cases and separate real English ambiguity from annotation inconsistency.
5. Decision rule (AGENTS.md, skill `llm-annotated-data`): the conventions win; where they are silent, the majority labelling of the same construction decides if it is >= 2/3 and >= 5 cases; otherwise the case is listed for the owner. Every proposed fix was re-checked against the data files (id, wire index, span, before-args identical).

Caveat: shared patterns need the same words; when the two actions use different trigger words (connect/path, move/swap, describe/property, extreme/nearest, set/create) the pattern view shows nothing shared by construction, so for these pairs I also scanned the opposite direction (a cue of action A inside a wire labelled B) by script and by reading; the result is in each section.

## Summary

| pair | wires (A / B) | shared strict | shared loose | minority loose (share) | minority strict (share) | minority after mood | real ambiguities | inconsistent wires proposed for fix | undecidable (owner) |
|---|---|---|---|---|---|---|---|---|---|
| set/resize | 4192/274 | 1 | 4 | 5 (0.11%) | 1 (0.02%) | 4 (0.09%) | 2 | 1 | 0 |
| set/fact | 4192/774 | 36 | 26 | 127 (2.56%) | 148 (2.98%) | 127 (2.56%) | 3 | 155 | 11 (3 mixed spans, 7 continuations, 1 superlative) |
| check/fact | 1002/774 | 3 | 11 | 156 (8.78%) | 4 (0.23%) | 4 (0.23%) | 2 | 0 | 0 |
| set/check | 4192/1002 | 1 | 7 | 64 (1.23%) | 1 (0.02%) | 1 (0.02%) | 1 | 0 | 0 |
| set/create | 4192/922 | 0 | 0 | 0 (0.00%) | 0 (0.00%) | 0 (0.00%) | 1 | 0 | 0 |
| connect/path | 3427/578 | 0 | 0 | 0 (0.00%) | 0 (0.00%) | 0 (0.00%) | 2 | 0 | 0 |
| connect/disconnect | 3427/170 | 0 | 0 | 0 (0.00%) | 0 (0.00%) | 0 (0.00%) | 1 | 0 | 1 |
| move/arrange | 3044/446 | 0 | 1 | 1 (0.03%) | 0 (0.00%) | 1 (0.03%) | 2 | 1 | 4 |
| move/swap | 3044/179 | 0 | 0 | 0 (0.00%) | 0 (0.00%) | 0 (0.00%) | 1 | 0 | 0 |
| describe/property | 285/261 | 0 | 0 | 0 (0.00%) | 0 (0.00%) | 0 (0.00%) | 1 | 0 | 0 |
| extreme/nearest | 1225/424 | 0 | 0 | 0 (0.00%) | 0 (0.00%) | 0 (0.00%) | 1 | 0 | 0 |
| count/list/exists | 692/417/275 | 0 | 2 | 5 (0.36%) | 0 (0.00%) | 5 (0.36%) | 2 | 1 | 3 |

Reading the table: the raw minority counts overstate the problem for check/fact (156 -> 4 once mood is in the pattern: pure statement/question mood, not an inconsistency) and set/check (64 -> 1; the 64 are the set/fact cluster). The real inconsistencies are **155 wires in set/fact (all but 9 of them in one folder, `llm_bench/sonnet_spans`)** and three single wires (s-0215, sm-0005, s-0188). In total 158 proposed fixes = 0.70% of the 22702 wires.

Top inconsistencies overall: (1) `set` for "X is VALUE" statements in sonnet_spans: 146 wires (fact in the 633 other cases); (2) `fact` for "X should/must be VALUE": 9 wires (set in 255 others); (3) single wires: s-0215 resize for "make it large" (set 51 vs 1), sm-0005 arrange for "side by side at the top" (move 6 vs 1), s-0188 list for "any gray neighbors" (exists 236 vs 1).

## set/resize

**Wires**: set 4192, resize 274 (total 4466).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 909 | 1 | 52 | 1 | 0.02% |
| loose (trigger + value keys) | 927 | 4 | 27 | 5 | 0.11% |
| loose + sentence mood (D/Q) | 943 | 4 | 24 | 4 | 0.09% |

After the proposed fixes: strict 0 shared / 0 minority, loose 3 shared / 4 minority.


Shared strict patterns:

| pattern | counts | majority | minority |
|---|---|---|---|
| `make it SIZE` | set 51, resize 1 | set (51/52) | 1 |

Examples for `make it SIZE`:
- set: sm-0001 "make it large"; sm-0027 "make it huge"; sm-0112 "make it large"
- resize: s-0215 "make it large"

Shared loose patterns:

| pattern | counts | majority | minority |
|---|---|---|---|
| `shrink ¦ NAME SIZE` | resize 15, set 1 | resize (15/16) | 1 |
| `resize ¦ NAME SIZE` | set 4, resize 2 | set (4/6) | 2 |
| `shrink ¦ SIZE` | resize 2, set 1 | resize (2/3) | 1 |
| `large ¦ SIZE` | resize 1, set 1 | resize (1/2) | 1 |

Examples for `shrink ¦ NAME SIZE`:
- resize: hm2-0030 "Shrink Summit a little"; hm2-0142 "Shrink the Bass a little"; hm2-0240 "Shrink Table2 a little"
- set: hm2-0082 "Shrink the Balcony to tiny"

Examples for `resize ¦ NAME SIZE`:
- set: hm-0386 "resize the Fiddle to small"; hm-0391 "Resize Welcome to medium"; hm-0449 "resize the Warrior to large"
- resize: hm2-0215 "resize Depot2 a little"; hm2-0490 "Resize Sink5 a little"

Examples for `shrink ¦ SIZE`:
- resize: fs-0370 "shrink it a little"; h-0212 "Shrink everything a little"
- set: s-0301 "shrink the peasant to tiny"


**Verdict: consistent.** One construction family, decided by the value word: an explicit size value (tiny..huge) is `set` ("make it SIZE" 51 set; "resize X to SIZE" 6 set; "shrink / stretch / enlarge X to SIZE" 7 set; against 1 resize); a relative change with no value ("bigger", "smaller", "enlarge", "shrink", "a little", "a bit") is `resize` (274 wires, 0 with a `size` key).

- Real English ambiguity (2): (a) "a little / a bit" is both a legend cue for `small` (cue list: `small: little`) and a degree adverb ("shrink X a little", 15 resize wires, always resize); the loose key SIZE cannot tell them apart, the word before it ("shrink/resize ... a little") does. (b) a comparison with other shapes ("should be larger than the rest", sl-0088) says "larger" but fixes a level; labelled `set large` (1 case, no majority).
- Annotation inconsistency (1): **s-0215** "make it large" is `resize`; the convention ("make X huge" -> set) and 51 of 52 identical spans decide: `set`, `size: large`. Proposed fix 1.
- Undecidable: none.

## set/fact

**Wires**: set 4192, fact 774 (total 4966).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 900 | 36 | 1219 | 148 | 2.98% |
| loose (trigger + value keys) | 989 | 26 | 789 | 127 | 2.56% |
| loose + sentence mood (D/Q) | 1003 | 26 | 788 | 127 | 2.56% |

After the proposed fixes: strict 14 shared / 49 minority, loose 9 shared / 9 minority.


Shared strict patterns:

| pattern | counts | majority | minority |
|---|---|---|---|
| `NAME is COLOR` | fact 257, set 30 | fact (257/287) | 30 |
| `NAME COLOR` | set 268, fact 15 | set (268/283) | 15 |
| `the NAME COLOR` | set 135, fact 6 | set (135/141) | 6 |
| `the NAME is COLOR` | fact 51, set 8 | fact (51/59) | 8 |

(+32 more shared patterns, smaller)

Examples for `NAME is COLOR`:
- fact: sm-0017 "Hero is blue"; sm-0017 "Villain is black"; sm-0024 "Billing is purple"
- set: s-0171 "Series is gold"; s-0171 "Pitch is white"; s-0191 "Draft is white"

Examples for `NAME COLOR`:
- set: sm-0039 "Closed yellow"; sm-0039 "Locked red"; sm-0106 "Post blue"
- fact: sm-0378 "Sandbox yellow"; sm-0378 "Slide red"; sm-0378 "Swing blue"

Shared loose patterns:

| pattern | counts | majority | minority |
|---|---|---|---|
| `is ¦ NAME COLOR` | fact 311, set 39 | fact (311/350) | 39 |
| `is ¦ NAME SIZE COLOR SHAPE` | fact 69, set 13 | fact (69/82) | 13 |
| `is ¦ NAME COLOR SHAPE` | fact 57, set 14 | fact (57/71) | 14 |
| `should be ¦ NAME COLOR` | set 54, fact 1 | set (54/55) | 1 |
| `is ¦ NAME SIZE` | fact 42, set 6 | fact (42/48) | 6 |

(+21 more shared patterns, smaller)

Examples for `is ¦ NAME COLOR`:
- fact: sm-0017 "Hero is blue"; sm-0017 "Villain is black"; sm-0024 "Billing is purple"
- set: s-0171 "The Seed is green"; s-0171 "Series is gold"; s-0171 "Pitch is white"

Examples for `is ¦ NAME SIZE COLOR SHAPE`:
- fact: sm-0284 "The Room is a huge white square"; sm-0297 "Anemone is a small pink circle"; sm-0409 "Falcon is a small gray triangle"
- set: s-0296 "Beach is a big cyan ellipse"; s-0299 "The Drone is a small white triangle"; s-0310 "The Basin is a big blue ellipse"

Examples for `is ¦ NAME COLOR SHAPE`:
- fact: sm-0297 "the Crab is a red hexagon"; sm-0431 "The Rose is a pink circle"; sm-0469 "Stop is a red hexagon"
- set: s-0273 "The Invoice is a gold hexagon"; s-0309 "The Input is a white rectangle"; s-0374 "The Proxy is an orange hexagon"


**Verdict: one large systematic inconsistency, in one folder.** `llm_bench/sonnet_spans` (the old `s-` set) labels declarative statements "X is VALUE" as `set` command in 146 wires; the same construction is `fact` in every other folder (633 fact, 0 set) and in the conventions ("A statement 'X is red' -> fact"). Inside sonnet_spans itself the construction is split 146 set / 42 fact with no visible reason (e.g. s-0096 "Box1 is blue, Box2 is red" are facts, s-0171 "Series is gold" is set). The statements of one sentence ("Line1 is red, Line2 blue, Line3 green") are labelled alike, so the fix also covers the verbless continuations ("Hike a green triangle", "Line2 blue") and one relative clause ("which is green", s-0425). This cluster is 146/4966 = 2.9% of the pair's requests and is also the whole source of the set/check shared patterns (below).

- Second cluster, opposite direction: 9 `fact` wires for "X should be / must be VALUE" (s-0170, s-0211, s-0305, each with two elided continuations: "Sq a square", "Blues blue"). "should/must be" is set in 255 other wires (3 fact vs 255 set): proposed fact -> set.
- Convention-decided, no change: "stays / remains VALUE" is fact (5 fact, 0 set; the 2 `set` wires matching "stay" are a shape named Stay and "make her pink"); "I want X blue" / "X needs to be" are set.
- Real English ambiguity (3): (a) a statement that is also a wish in one span ("The Fx is a star, and magenta. Please keep it small", s-0245; "The Ladder is brown and tall... let's say large", s-0278; "The Alert is a red triangle, I want it to be tiny", s-0322): labelled set, kept (the span holds a request); (b) a verbless continuation after a place statement, "..., big and gold" (fact: fs-0270, fs-0301, sl-0234, fs-0230 = 4; set: sm-0259, fs-0151, s-0062 = 3: the preceding verb is "is in" vs "goes / should be"); (c) a superlative as a size, "The Fiction section is the biggest" (s-0392, labelled `set` huge; "Recess is the smallest, tiny" is fact).
- Proposed fixes: 146 set -> fact (sonnet_spans) + 9 fact -> set (should/must be) = 155 wires, 3.1% of the pair's requests. After them, loose shared patterns drop from 26 to 9 (9 minority wires: the 3 mixed spans, the continuation cases and 4 one-off verbless pairs).

## check/fact

**Wires**: check 1002, fact 774 (total 1776).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 232 | 3 | 271 | 4 | 0.23% |
| loose (trigger + value keys) | 271 | 11 | 698 | 156 | 8.78% |
| loose + sentence mood (D/Q) | 284 | 3 | 15 | 4 | 0.23% |

After the proposed fixes: strict 3 shared / 4 minority, loose 12 shared / 173 minority.


Shared strict patterns:

| pattern | counts | majority | minority |
|---|---|---|---|
| `NAME is COLOR` | fact 257, check 1 | fact (257/258) | 1 |
| `NAME is POSITION the NAME` | fact 6, check 1 | fact (6/7) | 1 |
| `the NAME is POSITION the NAME` | fact 4, check 2 | fact (4/6) | 2 |

Examples for `NAME is COLOR`:
- fact: sm-0017 "Hero is blue"; sm-0017 "Villain is black"; sm-0024 "Billing is purple"
- check: s-0186 "Warn is yellow"

Examples for `NAME is POSITION the NAME`:
- fact: sm-0208 "Plane1 is above the Runway"; hm-0066 "Alarm is above the Lock"; hm-0074 "Tax is below the Salary"
- check: fs-0253 "Maple is above the Elm"

Shared loose patterns:

| pattern | counts | majority | minority |
|---|---|---|---|
| `is ¦ NAME COLOR` | fact 311, check 103 | fact (311/414) | 103 |
| `is ¦ NAME SHAPE` | check 78, fact 32 | check (78/110) | 32 |
| `is ¦ NAME SIZE` | fact 42, check 11 | fact (42/53) | 11 |
| `above ¦ NAME POSITION NAME` | check 49, fact 1 | check (49/50) | 1 |
| `left of ¦ NAME POSITION NAME` | check 35, fact 1 | check (35/36) | 1 |

(+6 more shared patterns, smaller)

Examples for `is ¦ NAME COLOR`:
- fact: sm-0017 "Hero is blue"; sm-0017 "Villain is black"; sm-0024 "Billing is purple"
- check: sm-0035 "Is Start green by any chance"; sm-0286 "Is Cape red"; sm-0288 "is Silver gray"

Examples for `is ¦ NAME SHAPE`:
- fact: sm-0069 "Ci is a hexagon"; sm-0167 "Wheel is a circle"; sm2-0067 "Ask is a diamond"
- check: sm-0172 "Is Auntie a circle"; sm-0219 "Is Streak a star"; sm-0396 "is the Logger a hexagon"

Examples for `is ¦ NAME SIZE`:
- check: sm-0458 "Is the Birds section large"; sm-0465 "Is the Chest large"; sm-0471 "Is the Wall large"
- fact: sm-0546 "Recess is the smallest, tiny"; sm2-0246 "Scene is tiny"; sm2-0246 "Cut is huge"


**Verdict: consistent; the raw minority is the question/statement mood, which the pattern does not see.** Every `fact` wire (774) is a declarative sentence with no inversion and no `?` (0 exceptions); 960 of 1002 `check` wires start with an inverted auxiliary ("Is X red"). The other 42 checks have a declarative span: 22 without `?` ("Tell me if the Treasure is above the Hero too", "Check whether the Stage is bigger than the Cafe", "Check Tile4 is a square") and 20 followed by `?` (mostly "Can you check whether Lab2 is bigger than Hab?", plus a few rising declaratives and tags: fs-0253 "Maple is above the Elm?", fs-0048 "Vega is bigger than Altair, isnt it", fs-0135 "The King is not black. I think. Is he?"). Adding the mood to the pattern (last table row) leaves 3 shared patterns / 4 minority wires, all embedded "tell me if X is above Y" (check) next to the plain statement.

- Real English ambiguity (2): rising declaratives / tag questions ("X is above Y?", "..., isnt it", "..., I think. check?": about 6 cases, all labelled check, which follows the speaker's intent to ask); and embedded questions after "tell me if / check whether" whose clause is a declarative (22, all check).
- Annotation inconsistencies: 0. Proposed fixes: 0. Undecidable: 0.

## set/check

**Wires**: set 4192, check 1002 (total 5194).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 918 | 1 | 31 | 1 | 0.02% |
| loose (trigger + value keys) | 1022 | 7 | 266 | 64 | 1.23% |
| loose + sentence mood (D/Q) | 1047 | 1 | 7 | 1 | 0.02% |

After the proposed fixes: strict 0 shared / 0 minority, loose 2 shared / 2 minority.


Shared strict patterns:

| pattern | counts | majority | minority |
|---|---|---|---|
| `NAME is COLOR` | set 30, check 1 | set (30/31) | 1 |

Examples for `NAME is COLOR`:
- set: s-0171 "Series is gold"; s-0171 "Pitch is white"; s-0191 "Draft is white"
- check: s-0186 "Warn is yellow"

Shared loose patterns:

| pattern | counts | majority | minority |
|---|---|---|---|
| `is ¦ NAME COLOR` | check 103, set 39 | check (103/142) | 39 |
| `is ¦ NAME SHAPE` | check 78, set 12 | check (78/90) | 12 |
| `is ¦ NAME SIZE` | check 11, set 6 | check (11/17) | 6 |
| `is ¦ COLOR` | check 6, set 4 | check (6/10) | 4 |
| `is ¦ SHAPE` | set 2, check 1 | set (2/3) | 1 |

(+2 more shared patterns, smaller)

Examples for `is ¦ NAME COLOR`:
- check: sm-0035 "Is Start green by any chance"; sm-0286 "Is Cape red"; sm-0288 "is Silver gray"
- set: s-0171 "The Seed is green"; s-0171 "Series is gold"; s-0171 "Pitch is white"

Examples for `is ¦ NAME SHAPE`:
- check: sm-0172 "Is Auntie a circle"; sm-0219 "Is Streak a star"; sm-0396 "is the Logger a hexagon"
- set: s-0098 "the Noun is a square"; s-0098 "the Verb is a circle"; s-0098 "the Adjective is a triangle"

Examples for `is ¦ NAME SIZE`:
- check: sm-0458 "Is the Birds section large"; sm-0465 "Is the Chest large"; sm-0471 "Is the Wall large"
- set: s-0448 "Smtp is large"; s-0448 "Imap is small"; s-0463 "Mercury is tiny"


**Verdict: no inconsistency of its own.** The 64 raw minority wires (1.23%) are the sonnet_spans statements of the set/fact cluster (`is | NAME COLOR` etc.: those "X is red" statements are `set` there, `check` for "Is X red?"). With sentence mood in the pattern one shared pattern remains (7 wires, 1 minority: s-0186 "Warn is yellow", the clause inside "Can you tell me if Warn is yellow?"); after the set/fact fixes none.

- Real English ambiguity (1): the indirect request "Can you make the Logo teal?" / "Could you resize the Fiddle to small?" has the form of a question but asks for an action: 18 set wires are followed by `?`, all labelled `set`, none `check`. The convention is implicit in the data (the verb make/turn/resize decides), consistent.
- Annotation inconsistencies: 0 (the cluster is counted under set/fact). Proposed fixes: 0 here. Undecidable: 0.

## set/create

**Wires**: set 4192, create 922 (total 5114).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 1293 | 0 | 0 | 0 | 0.00% |
| loose (trigger + value keys) | 1190 | 0 | 0 | 0 | 0.00% |
| loose + sentence mood (D/Q) | 1212 | 0 | 0 | 0 | 0.00% |

After the proposed fixes: strict 0 shared / 0 minority, loose 0 shared / 0 minority.


Shared strict patterns:

_none_

Shared loose patterns:

_none_


**Verdict: consistent; no pattern is shared.** "Make a purple square called Fiction" (create: 31 of the 2367 `make` wires) and "Make the Router a big orange hexagon" (set) differ in the object: an indefinite new shape vs an existing name. Checked by script over every message: 0 `create` wires whose `name` is already in `names`, and the only `set` wires whose target is not in `names` (10) point at a shape renamed or duplicated earlier in the same message ("Rename Cow3 to Daisy and make her gray"). "I want / I need / I'd like": create when the NP is indefinite with a name or count ("I want a gold star named Conclusion", "i need 4 small squares"), set when it is a named shape ("I want the Depot to be a gray square"); no exception found.

- Real English ambiguity (1): a verb or noun used as a shape name ("Push a pink star", sl-0139, where Push is an existing shape; "Pop pink", sm2-0203) looks like the creation verb; the `names` list decides and the labels follow it (3 wires).
- Annotation inconsistencies: 0. Proposed fixes: 0. Undecidable: 0.

## connect/path

**Wires**: connect 3427, path 578 (total 4005).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 1586 | 0 | 0 | 0 | 0.00% |
| loose (trigger + value keys) | 671 | 0 | 0 | 0 | 0.00% |
| loose + sentence mood (D/Q) | 685 | 0 | 0 | 0 | 0.00% |

After the proposed fixes: strict 0 shared / 0 minority, loose 0 shared / 0 minority.


Shared strict patterns:

_none_

Shared loose patterns:

_none_


**Verdict: consistent; no shared pattern.** `path` is only asked with a reachability cue ("reachable from", "is there a path / route / way", "can I get from", "way / trail / route from", "shortest connection from A to B"); `connect` is only a drawing verb or a statement of a link ("X connects to Y", "Hub links to ...": 60+ statements, all `connect`; the legend has no fact for links). No `connect` wire is a question (the roughly 20 that sit before a `?` are "Could you / Would you connect ..."), no `path` wire contains a drawing verb.

- Real English ambiguity (2): (a) "X connects to Y" / "X reaches Y" can describe or request; labelled `connect` whenever a drawing request follows or the legend has nothing else (never `path`); (b) route/path/connection as a noun: "Draw that route as a chain of arrows" (connect, fs-0121), "show me the shortest connection from Bergen to Tromso" (path, fs-0160) are decided by the verb.
- Annotation inconsistencies: 0. Proposed fixes: 0. Undecidable: 0.

## connect/disconnect

**Wires**: connect 3427, disconnect 170 (total 3597).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 1561 | 0 | 0 | 0 | 0.00% |
| loose (trigger + value keys) | 667 | 0 | 0 | 0 | 0.00% |
| loose + sentence mood (D/Q) | 678 | 0 | 0 | 0 | 0.00% |

After the proposed fixes: strict 0 shared / 0 minority, loose 0 shared / 0 minority.


Shared strict patterns:

_none_

Shared loose patterns:

_none_


**Verdict: consistent; no shared pattern.** `disconnect` carries a removal verb (disconnect, unlink, remove/delete/cut/zap/axe/kill/ditch/sever + a link object: 43 of the 49 verbs have "link / line / connection / between / from" in the span, the other 6 are "Cut B to C", "Zap the Fort to Mine road", "Axe Stop to Idle"), `connect` never has one; a `connect` span with "without / drop / cut" is a noun or a name ("a line without arrows", "labeled cut", a shape named Drop or Cut). No `delete` wire removes a link.

- Real English ambiguity (1): "remove / delete / cut" + a link phrase vs the same verb + a shape; the object decides (49 disconnect with such verbs; no `delete` wire has a link as its object: the two "Delete Line" / "get rid of Edge" are shapes named Line and Edge). One negative state "make sure they are not linked" (sm-0031) is labelled disconnect (single case: if the link does not exist the request is empty; owner decides whether to keep a wire).
- Annotation inconsistencies: 0. Proposed fixes: 0. Undecidable: 1 (sm-0031).

## move/arrange

**Wires**: move 3044, arrange 446 (total 3490).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 1090 | 0 | 0 | 0 | 0.00% |
| loose (trigger + value keys) | 532 | 1 | 322 | 1 | 0.03% |
| loose + sentence mood (D/Q) | 554 | 1 | 321 | 1 | 0.03% |

After the proposed fixes: strict 0 shared / 0 minority, loose 0 shared / 0 minority.


Shared strict patterns:

_none_

Shared loose patterns:

| pattern | counts | majority | minority |
|---|---|---|---|
| `put ¦ NAME POSITION` | move 321, arrange 1 | move (321/322) | 1 |

Examples for `put ¦ NAME POSITION`:
- arrange: sm-0005 "Put Anna and Boris side by side at the top"
- move: sm-0035 "put Start in the center"; sm-0043 "Put Cloud at the top"; sm-0044 "put Bar below them"


**Verdict: one inconsistency (sm-0005); the layout word decides everything else.** `arrange` is chosen by a layout word (row, column, grid, circle, "line up", "stack ... in a column", "left to right", "one above the other", "next to each other under X"); `move` by a place (position, direction, distance). "Put them in a row" (arrange, 98+ wires) and "Put X at the left" (move, 116) share only the trigger `put`, which is why the loose pattern without a layout key looked like 156 shared wires; with the LAYOUT key one loose pattern is left.

- Annotation inconsistency (1): **sm-0005** "Put Anna and Boris side by side at the top" is `arrange row`; the identical construction (a place + "side by side" and no row/column word) is `move` to the place in 6 other wires: sl-0098 "Put Zeus and Hera at the top, side by side", sl-0177, sl-0089, sl-0112, sl-0155, sm2-0542 (6 of 7 = 86%). Proposed: `move`, target "Anna,Boris", position top. (The same word with "in a row" is arrange: sm-0419, sm2-0380.)
- Real English ambiguity (2): (a) "next to each other" / "one next to the other": near (move: fs-0213, fs-0418) vs a row (arrange: fs-0089, fs-0251), 2 against 2, no majority; (b) "around X": move near X in 9 wires, arrange circle only when the text says "in a circle" (8 wires): consistent, but genuinely open in English.
- Undecidable: fs-0089, fs-0251, fs-0213, fs-0418 (see above).

## move/swap

**Wires**: move 3044, swap 179 (total 3223).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 891 | 0 | 0 | 0 | 0.00% |
| loose (trigger + value keys) | 440 | 0 | 0 | 0 | 0.00% |
| loose + sentence mood (D/Q) | 456 | 0 | 0 | 0 | 0.00% |

After the proposed fixes: strict 0 shared / 0 minority, loose 0 shared / 0 minority.


Shared strict patterns:

_none_

Shared loose patterns:

_none_


**Verdict: consistent; no shared pattern.** `swap` has a swap verb or phrase in every wire (swap 170; flip 3, "switch places", "switch the Oven and the Fridge", "swapped", "swapping", "swap them back"); no `move` wire contains swap, exchange, trade, switch-places or flip. A move that exchanges positions without saying so ("put A where B is") does not occur.
- Real English ambiguity (1): "flip A and B" / "switch A and B" (swap, 3 + 1 wires) has other senses (mirror, toggle); always read as swap here.
- Annotation inconsistencies: 0. Proposed fixes: 0. Undecidable: 0.

## describe/property

**Wires**: property 261, describe 285 (total 546).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 277 | 0 | 0 | 0 | 0.00% |
| loose (trigger + value keys) | 70 | 0 | 0 | 0 | 0.00% |
| loose + sentence mood (D/Q) | 83 | 0 | 0 | 0 | 0.00% |

After the proposed fixes: strict 0 shared / 0 minority, loose 0 shared / 0 minority.


Shared strict patterns:

_none_

Shared loose patterns:

_none_


**Verdict: consistent; no shared pattern.** `property` always names one attribute (color 133, position 46, shape 42, size 29, label 11) with "what color / where / how big / what is the label of"; `describe` is "describe", "what does X look like", "show me the whole diagram" (164 of 285 with no target). No `describe` span asks for one attribute only; no `property` span asks for a general description.
- Real English ambiguity (1): a question about two attributes of one shape, "Tell me the colour and the shape of Maple" (sm2-0455): `describe`, because `property` holds one attribute; the one-attribute twin "give me the shape of Label" (s-0272) is property. Single case, consistent with the one-attribute rule.
- Annotation inconsistencies: 0. Proposed fixes: 0. Undecidable: 0.

## extreme/nearest

**Wires**: extreme 1225, nearest 424 (total 1649).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 649 | 0 | 0 | 0 | 0.00% |
| loose (trigger + value keys) | 101 | 0 | 0 | 0 | 0.00% |
| loose + sentence mood (D/Q) | 114 | 0 | 0 | 0 | 0.00% |

After the proposed fixes: strict 0 shared / 0 minority, loose 0 shared / 0 minority.


Shared strict patterns:

_none_

Shared loose patterns:

_none_


**Verdict: consistent; no shared pattern.** `nearest` always has an anchor (424 of 424: closest 296, farthest 128) and a closeness word (closest, nearest, closer, farther, further from, ...); `extreme` has a superlative of the shape set (biggest, smallest, left/right/top/bottommost, most/least connected) and never an anchor. The only `extreme` span with a distance word is "Which shape sits furthest right" (sm-0052, rightmost): the direction word, not an anchor, makes it an extreme.
- Real English ambiguity (1): "furthest/farthest" + a direction ("furthest right") vs "farthest from X"; the anchor decides.
- Annotation inconsistencies: 0. Proposed fixes: 0. Undecidable: 0. (Outside the requested pairs: the alternative question "Is A the rightmost, or B?" is extreme 3 / check 2; see the end.)

## count/list/exists

**Wires**: count 692, list 417, exists 275 (total 1384).

| level | distinct patterns | shared by both actions | wires in shared patterns | minority labels | share of the pair's requests |
|---|---|---|---|---|---|
| strict | 455 | 0 | 0 | 0 | 0.00% |
| loose (trigger + value keys) | 218 | 2 | 17 | 5 | 0.36% |
| loose + sentence mood (D/Q) | 237 | 2 | 17 | 5 | 0.36% |

After the proposed fixes: strict 0 shared / 0 minority, loose 2 shared / 5 minority.


Shared strict patterns:

_none_

Shared loose patterns:

| pattern | counts | majority | minority |
|---|---|---|---|
| `near ¦ POSITION NAME` | list 10, exists 3 | list (10/13) | 3 |
| `left of ¦ POSITION NAME` | list 2, exists 2 | list (2/4) | 2 |

Examples for `near ¦ POSITION NAME`:
- list: sm2-0009 "which shapes are near Earth"; sm2-0185 "Which shapes are near Rug"; sm2-0312 "Which cards are near Ship"
- exists: sm2-0427 "Anything near the Header"; sm2-0472 "Anything near the Ball"; sm2-0590 "Anything near Mid"

Examples for `left of ¦ POSITION NAME`:
- list: sm2-0046 "Which shapes are left of the Beans"; sm2-0062 "What is left of Hub now"
- exists: sm2-0267 "are there any shapes left of Proc"; hm2-0227 "Is there anything left of Central"


**Verdict: consistent apart from one wire; the shared loose patterns come from verbless triggers.** The two shared patterns (`near | POSITION NAME`: list 10 / exists 3; `left of | POSITION NAME`: list 2 / exists 2) are wires whose trigger is the position word itself; the cue that decides is outside the trigger: "which / what is" -> list, "anything / is there any / are there any" -> exists. Checked by script over all 1384 wires: every count has "how many / count / number / total" (except the 2 below), every exists has an existence cue, and every `list` has a "which / what / show / list" cue except s-0188.

- Annotation inconsistency (1): **s-0188** "Does the Studio have any gray neighbors" is `list`; 236 spans with "any / anything" are exists (73 of them with a position filter), this is the only list. Proposed: `exists` (filters unchanged). (Whether "neighbors" here is spatial or linked is a separate open question: the convention reserves `neighbors` for links.)
- Real English ambiguity (2): (a) "Anything near X?" is a yes/no question or a request for the list; labelled `exists` in all 7 wires that start with "Anything" (sm-0562, sm2-0427, sm2-0438, sm2-0472, sm2-0496, sm2-0590, fs-0301), `list` for "what is near X" (consistent, wording-driven); (b) a yes/no question that asks for a number, "are there still two cages left" (count, s-0161).
- Undecidable: s-0161 (count vs exists), sm-0091 "Show me all the connections" (`count` kind edge: a request for a list of links, the legend has no list for links), s-0197 "Are all of them still teal" (exists notColor teal, an inverted universal). One case each.

## Proposed fixes (`pair_fixes_proposed.jsonl`)

One JSON object per line: `pair`, `id`, `dir` (data folder), `file` (path relative to the repository), `wire_index` (0-based in the message's `wires`), `span`, `before` / `after` (`type` and `args`), `reason` (with the counts). 158 lines, 158 distinct wires, none applied:

| pair | fixes | change | evidence |
|---|---|---|---|
| set/fact | 146 | `command set` -> `fact` (args without `action`), 146 wires in `llm_bench/sonnet_spans` (s-0098 ... s-0495): statement "X is/are VALUE" and its verbless continuations | the same construction is fact in 633 wires of the other folders and 0 set; conventions: "A statement 'X is red' -> fact" |
| set/fact | 9 | `fact` -> `command set` (adds `action: set`): s-0170, s-0211, s-0305, three wires each ("Tri should be a triangle, Sq a square ...") | "should / must be VALUE": 255 set vs 3 fact |
| set/resize | 1 | s-0215 wire 2 "make it large": `resize` -> `set`, `size: large` | "make it SIZE": 51 set vs 1; "make X huge -> set" (conventions) |
| move/arrange | 1 | sm-0005 wire 0 "Put Anna and Boris side by side at the top": `arrange row` -> `move`, position top | 6 move vs 1 arrange for place + "side by side" |
| count/list/exists | 1 | s-0188 wire 2 "Does the Studio have any gray neighbors": `list` -> `exists` | "any / anything": 236 exists vs 1 list |

After the fixes the number of shared loose patterns in set/fact falls from 26 to 9, in set/check from 7 to 2 (both residual sets are verbless continuations and the mixed spans below); the other pairs have none or the same.

## Undecidable cases for the owner (not in the fix file)

Rule: under 2/3 or fewer than 5 cases, or the convention is silent.

- **Mixed statement + wish in one span**, labelled `set`: s-0245 "The Fx is a star, and magenta. Please keep it small", s-0278 "The Ladder is brown and tall... let's say large", s-0322 "The Alert is a red triangle, I want it to be tiny". Split into fact + set, or keep one set? (3 cases)
- **Verbless continuation after a place statement**, "..., big and indigo": fact 4 (fs-0270, fs-0301, sl-0234, fs-0230) vs set 3 (sm-0259, fs-0151, s-0062). Note that "The Hub is in the center" itself is `move` (the fact legend needs an anchor for a position), so the continuation is a fact about a shape whose sentence is a move. (7 cases)
- **"X is the biggest"** as a size statement: s-0392 labelled `set` huge (1 case; "Recess is the smallest, tiny" is fact).
- **"Is A the rightmost, or B?"**: extreme 3 (sm2-0132, sm2-0203, sm2-0249) vs check with a position/anchor 2 (sm-0094, sm-0166). Outside the requested pairs; 5 cases, 60% < 2/3.
- **"next to each other"**: near (move) fs-0213, fs-0418 vs row (arrange) fs-0089, fs-0251 (2 vs 2).
- **Negative link state** "make sure they are not linked" (sm-0031, disconnect, 1 case).
- **count/list/exists singletons**: s-0161 "are there still two cages left" (count), sm-0091 "Show me all the connections" (count kind edge), s-0197 "Are all of them still teal" (exists notColor).
- **"Does X have any gray neighbors"** (s-0188): the action is fixed above, but whether "neighbors" is spatial (near) or linked (`neighbors`, which has no colour filter) is open.

## Other observations (outside the twelve pairs, for the merge decision)

- **fact vs move for place statements.** "X is / sits / stands <relation> Y" is `fact` in 94 wires (60 "is", 29 "sits") and `move` in about 19, and almost all of those 19 carry a request in the span ("Fw sits between Dmz and Intranet, so move Fw there", "put it there"); a few look like the fact cases (hm2-0186 "Paint1 and Paint2 both sit near Label3", sm-0349 "Puppet1 stands left of the Stage center"). A statement with a canvas place and no anchor ("The Hub is in the center", "Dock is at the left") is always `move` (78 vs 0), because a fact needs an anchor. This pair (fact/move) is not one of the twelve, so I did not count it further.
- **Provenance.** The set/fact cluster is a labelling-batch effect (the first `s-` set), not a hard English ambiguity; the same pattern could exist for other pairs in other batches, but for the twelve pairs I found none.

## Reproduction

The scripts are scratch files (not in the repository); the counts above can be recomputed from the gold wires: event = `args.action` for commands, `args.ask` for questions, `fact` for facts; pattern = lower-cased span with the replacements of the Method section; trigger = the wire's `trigger` field.
