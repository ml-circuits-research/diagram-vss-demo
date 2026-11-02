# Where the composer's errors come from

Script: `training/sketch/composer_errors.mjs` (run: `node composer_errors.mjs [--examples N] [--json out.json]`; takes the 9 folders of
`micro_tools.py dirs` by default, about 3 minutes). Nothing else was changed.
Model: composer with `docs/model/micro/registry.json` (cutter `micro/cutter.json`, 15 micro-worlds, fallback `kinds_p80_s0`), 4640
annotated messages, 22702 requested actions. Everything below counts requested actions (owner's rule); there are no per-message numbers.
Check of the script: on `llm_bench/haiku_spans` it gives right 1540 / extra 104, the same as `SEG=composer node llm_score.mjs`.

How an action is counted (the rule of `llm_score.mjs`, copied): the produced commands/questions are aligned in order to the gold wires
(longest common subsequence on type + action). Aligned and every gold key equal = right. Aligned and a gold key differs = wrong. Gold wire
with no partner = not done. Produced command with no partner = extra. Extra keys in the output do not count.
Because the alignment looks only at the action, a request read with the WRONG action is counted twice: once not done, once extra
(see section 3, "other", 971 of 1511 extras).

## 1. Totals per requested action (learned cut)

| data folder | requested | right | wrong | not done | extra |
|---|---|---|---|---|---|
| llm_train/sonnet_msg | 3127 | 1791 (57.3%) | 612 (19.6%) | 724 (23.2%) | 177 |
| llm_train/haiku_msg | 2304 | 2030 (88.1%) | 177 (7.7%) | 97 (4.2%) | 34 |
| llm_train/sonnet_msg2 | 2789 | 1296 (46.5%) | 343 (12.3%) | 1150 (41.2%) | 264 |
| llm_train/haiku_msg2 | 2001 | 1335 (66.7%) | 176 (8.8%) | 490 (24.5%) | 143 |
| llm_train/sonnet_long | 2562 | 1269 (49.5%) | 603 (23.5%) | 690 (26.9%) | 219 |
| llm_bench/fresh1/sonnet | 3030 | 1976 (65.2%) | 475 (15.7%) | 579 (19.1%) | 151 |
| llm_bench/fresh1/haiku | 2514 | 1745 (69.4%) | 342 (13.6%) | 427 (17.0%) | 125 |
| llm_bench/sonnet_spans | 2173 | 688 (31.7%) | 449 (20.7%) | 1036 (47.7%) | 294 |
| llm_bench/haiku_spans | 2202 | 1540 (69.9%) | 318 (14.4%) | 344 (15.6%) | 104 |
| **ALL** | **22702** | **13670 (60.2%)** | **3495 (15.4%)** | **5537 (24.4%)** | **1511** |

Per action (right / wrong / not done): set 2596/524/1072, connect 1211/1107/1109, move 1586/708/750, extreme 1124/7/94,
check 882/58/62, create 467/119/336, fact 565/46/163, count 448/207/37, path 504/14/60, connected 399/14/144, list 181/112/264,
arrange 166/201/79, neighbors 38/0/186, reachable 31/2/112, distribute 72/91/19 (full list in the script output).

## 2. First cause of the 9032 requests that are not right (3495 wrong + 5537 not done)

Causes are tested in the order a, b, c, d, e; a request gets the first that fits. The unit of a request is the unit with the most
letters/digits inside the gold span.

| cause | requests | share | of which wrong | of which not done |
|---|---|---|---|---|
| a CUTTER | 1568 | 17.4% | 541 | 1027 |
| b NO ACTION WORD | 2582 | 28.6% | 189 | 2393 |
| c ROUTING | 1436 | 15.9% | 88 | 1348 |
| d WORLD READING | 2371 | 26.3% | 1848 | 523 |
| e REFERENCE (not an error by AGENTS.md; counted apart) | 866 | 9.6% | 829 | 37 |
| f fits none: alignment artefact (below) | 209 | 2.3% | 0 | 209 |

Where it matters for "done wrong" (3495): d 1848, e 829 (references, left to the reasoning layer), a 541, b 189, c 88. Where it matters
for "not done" (5537): b 2393, c 1348, a 1027, d 523. So wrong readings mostly come from the worlds and from references; the missing
actions come mostly from verbless units and routing.

### a. CUTTER (1568)

| sub-class | requests | wrong | not done |
|---|---|---|---|
| missed: no unit overlaps the span | 613 | 68 | 545 |
| merged: the unit also overlaps another gold request | 393 | 120 | 273 |
| split: the request is spread over 2 (264) or 3 (10) units | 274 | 201 | 73 |
| too short: the unit cuts off words that carry a gold value | 288 | 152 | 136 |

Examples (message id, gold span -> what was produced):
- missed, sm-0008 "Bedroom must be below Hall" (move Bedroom below Hall) -> no unit; sm2-0442 "Even them out" (distribute) -> no unit;
  s-0326 "Water goes Tank to Pump to Tray" (connect chain) -> no unit.
- merged, sm-0013 "Connect Build to Test" -> the unit "Connect Build to Test and Test to Deploy, with a label "on pass"" was read as one
  connect from [Build,Test,Deploy] to [Test] (wrong); sm2-0153 "Dist2 points at Acc2" inside "Dist1 points at Acc1 and Dist2 points at Acc2"
  -> ignored, no action token (not done); sl-0099 "Make both towers triangles, red for TowerA" inside "... and blue for TowerB" -> no-sense.
- split, sm-0103 gold is one chain "Connect And1 to Or1, then Or1 to Not1, plain lines without arrowheads"; units "Connect And1 to Or1"
  (read) + "then Or1 to Not1, plain lines ..." (no action token) -> the connect has one pair only (wrong).
  s-0041 "Alice reports to Head, and so does Bob, so draw both arrows" -> units "does Bob" + "draw both arrows".
- too short, sm-0025 "another yellow star called Osaka, both under Travel" -> unit "another yellow star called Osaka": position and anchor
  (Travel) cut off; hm2-0167 "Croissant, Bagel and Muffin should be spread out evenly vertically" -> unit "Muffin should be spread ..."
  (the first two names cut off; read as set).

### b. NO ACTION WORD (2582): the unit is whole but the fallback's front end finds no action token in it

All of these units were "ignored" (status unknown-event, reason "no action token"); the composer has no rule that gives such a unit the
action of the previous request.

| sub-class | requests | wrong | not done |
|---|---|---|---|
| b1 the previous request of the message has the same action | 1070 | 94 | 976 |
| b2 other, by the kind of the annotated trigger (hand-made kinds, section 5): | 1512 | 95 | 1417 |
| &nbsp;&nbsp;K4 a verb is in the text, the front end has no token for it | 1372 | 72 | 1300 |
| &nbsp;&nbsp;K2 trigger is a name / noun phrase (ellipsis) with no earlier same action | 71 | 14 | 57 |
| &nbsp;&nbsp;K1 copula (should be / are / can be) | 36 | 3 | 33 |
| &nbsp;&nbsp;K3 trigger is a value or preposition word | 33 | 6 | 27 |

Examples: b1: sm-0012 "Earth a small blue one" (set), sm2-0040 "then Wifi to Phone and Laptop" (connect), fs-0118 "the Median green" (set),
s-0106 "Tie Stop2 back to Depot too" (connect; "Tie" gives no token here, so b1 also holds some K4 cases).
b2/K4: sm-0008 "Kitchen should go to the left of Hall", sm2-0168 "Hook Topic up to Pro and Con", sm2-0488 "Draft goes to Edit",
hm2-0251 "What can be reached from Desk1", fh-0330 "Show me all the gray shapes". b2/K1: sm-0105 "should be pink", sm2-0351 "every new circle should
be lime" (rule). b2/K3: sm-0035 "bigger please", fs-0173 "stock beside bond", s-0124 "Exit goes bottom right".

### c. ROUTING (1436): the unit has an action token but went to a world that does not hold the gold action

| sub-class | requests | wrong | not done |
|---|---|---|---|
| c1 candidates tied on different events: marked ask | 189 | 5 | 184 |
| c2 the gold event's world was a candidate and lost the choice | 99 | 2 | 97 |
| c3 the unit's action token belongs to another event (gold event's world was never a candidate) | 1148 | 81 | 1067 |

c3, most frequent (gold action <- event of the token): connect <- create 133, set <- fact 115, move <- set 92, neighbors <- fact+connected 61,
create <- move 52, degree <- count 44, neighbors <- list 41, toFront <- move 35, exists <- fact 31, move <- neighbors 30.
Examples: c1: sm-0039 "Which are the neighbors of Closed", hm-0408 "What is the cycle here, if any", s-0018 "Make Jupiter the biggest planet" (all marked ask).
(The "is"-word `fact` token and the `create` token on "add/put ..." are the usual wrong tokens; see the script output for 5 examples per sub-class.)

### d. WORLD READING (2371): right world, wrong or missing value

| sub-class | requests | wrong | not done |
|---|---|---|---|
| d0 the right world refuses (unknown-event 228, no-sense 34) | 262 | 15 | 247 |
| d1 wrong action inside the right world | 233 | 0 | 233 |
| d2 a key is missing or wrong | 1876 | 1833 | 43 |

d1: ask "rules" read as "list" 90 (same event name, different ask), check instead of connected 62, path instead of reachable 18,
check instead of extreme 17.
d2 by the first wrong key (missing + wrong): position 391 (371 missing), target 295, from 258, pairing 207 (chain / all-to-all missing), kind 174 (missing),
notColor 143 (missing), label 106, color 53, shape 50, layout 48, axis 35, direction 24, to 22, arrow 18, count 17, anchor 16.
Examples: fh-0045 "add a red box called Error" -> create circle named Error (shape wrong, color missing); sm-0552 "Put Reef at the left" ->
move Reef with no position; sm-0014 "Sidebar on the left" -> direction=left where the gold has position=left (many "position missing"
cases are this direction/position choice: the reading is sensible, the gold key differs; I did not count how many).

### e. REFERENCE (866, counted apart)

Only target/from/to/anchor differ and the gold name is not in the span (or is `$new`). With a pronoun in the span: 575 (target 288, from 131,
to 54, from+to 52, anchor 49, ...); name stated elsewhere: 291 (target 190, anchor 39, to 30, from 29).
Examples: sm-0001 "make it large" (gold target Cart, got none); sl-0075 "distribute them horizontally" (gold Mon..Fri, got none);
sm-0004 "connect Running to it" (gold `$new`, got Error). 829 of these are counted "wrong" by the metric although the reading is truthful
or missing: they are not errors by the AGENTS.md rule, but a wrong earlier name (fh-0257: "them" read as Conductor) is wrong and cannot be told apart here.

### f. Fits none (209): an artefact of the alignment, not of the composer

The unit read exactly the gold command (e.g. sm-0035 "put Start in the center" -> move Start center), but the order-only alignment paired
the produced command with another gold request of the same action: the neighbour "Bank to the bottom left" was verbless, so the
single move was paired with Bank and Start became "not done". In addition, 233 of the 3495 "wrong" requests are the same artefact the other way
round (the produced command is exactly right for ANOTHER gold request of the same message). The alignment makes one missing request cost up to two. A value-aware
alignment would turn about 440 of these into right; I did not change the metric.

## 3. Extra actions (1511 produced commands that match no requested action)

| class | extras | share |
|---|---|---|
| other: the unit belongs to one request but produced a different action (the same incident is also one "not done") | 971 | 64.3% |
| from a unit with no gold request: text outside every span read as a command | 350 | 23.2% |
| second piece of a split request | 97 | 6.4% |
| other: same action produced twice or paired away (section 2f) | 84 | 5.6% |
| from a merged unit (two requests in one unit) | 9 | 0.6% |

Examples. Different action (971): sm-0005 "Put Anna and Boris side by side at the top" (gold arrange) -> move; sm2-0210 "Is Papa linked with Tante directly"
(gold connected) -> check; hm2-0354 "Which rules are set for the map" (gold rules) -> list; s-0306 "Do I have any cycle in here" (gold cycle) -> exists.
No gold request (350): sm-0004 "make that circle orange" (a self-correction, text not annotated as a request) -> set; sm2-0282 "Leo is Max and Ida's son"
-> fact; sl-0068 "the River between them is the barrier" -> fact; sl-0178 "the Mouse is the prey" -> fact; fs-0459 "Make it a chain" -> set.
Most of the 350 are statements ("X is Y") read as facts, or commands the annotator did not mark.
Split (97): sm-0191 the second half "put it right of the Fabric" of "Make a pink star named Button and put it right of the Fabric" -> move;
sl-0219 "colour red" (end of a connect request) -> set; s-0039 "give it the label "paid"" -> label.
Merged (9): sl-0145 "Support to the left of the Captain, Carry to the right" -> one move.

## 4. Cost of the cutter: learned cut against the gold cut

The composer has no entry point for given units. The script copies `Composer.formalize` (the loop over units with `comp.route`,
`readingFromWires`, `toNodes`, the same context rule as `llm_score.mjs`) and feeds it the gold spans as units (sorted by start). Everything
else (registry, models, router, context) is the same.

| cut | right | wrong | not done | extra |
|---|---|---|---|---|
| learned (the composer's cutter) | 13670 (60.2%) | 3495 (15.4%) | 5537 (24.4%) | 1511 |
| gold spans | 14028 (61.8%) | 3348 (14.7%) | 5326 (23.5%) | 1081 |
| difference = cost of the cutter | 358 (1.6 points) | 147 | 211 | 430 |

Per folder, right gold vs learned: sonnet_msg 1851 vs 1791, haiku_msg 2047 vs 2030, sonnet_msg2 1325 vs 1296, haiku_msg2 1361 vs 1335,
sonnet_long 1312 vs 1269, fresh1/sonnet 2017 vs 1976, fresh1/haiku 1757 vs 1745, sonnet_spans 770 vs 688, haiku_spans 1588 vs 1540.
Extras fall most (sonnet_long 219 -> 74, fresh1/haiku 125 -> 65). So the cutter costs 1.6 points of right actions and 430 extras; even
with perfect units 38% of the requests are not right. With the gold cut the first causes are: b NO ACTION WORD 3160 (1285 b1, 1875 b2),
d WORLD READING 2640, c ROUTING 1666, e REFERENCE 998, f 200, and only 10 cutter cases left (gold spans that overlap each other).
Total not right with the gold cut: 8674.
(Cause (a) has 1568 requests with the learned cut, but fixing the cut recovers only 358 right: most of these units are then still verbless or misrouted.)

## 5. The verbless study

Gold requests whose span has no action token after the fallback's front end (`FRONT.normalize` of the span alone): **3161 of 22702 (13.9%)**.
Result with the composer: right 18, wrong 254, not done 2889. A verbless request is practically never done right.

The previous request of the same message (by span start) has the same action in 1285 of the 3161 (40.7%). So no: verbless requests are not
always enumerations inheriting the previous action. By the kind of the annotated trigger (sorted by regular expressions on the trigger,
then checked by reading examples; the regexes are for this study only, not in any model):

| kind | requests | previous request same action | right / wrong / not done |
|---|---|---|---|
| K2 no verb in the text: the trigger is a name / noun phrase (ellipsis, "Greece blue", "the Hospital white", "Wifi to Phone") | 962 | 872 (90.6%) | 1 / 93 / 868 |
| K4 a verb IS in the text, the front end has no action token for it | 1967 | 309 (15.7%) | 9 / 123 / 1835 |
| K3 no verb: the trigger is a value / preposition word ("below", "on the right", "bigger") | 152 | 87 (57.2%) | 1 / 27 / 124 |
| K1 copula (should be / are / can be): sets, rules, facts | 80 | 17 (21.3%) | 7 / 11 / 62 |

Findings:
- Real enumerations / ellipsis (K2, plus most of K3) are 1114 requests (35%). 90% of K2 have a previous request with the same action
  (the "Paint Mon red, Tue gold" case); 90 do not (the first request of the message, or the request before has another action).
- The largest kind is not an ellipsis: 62% of verbless requests (K4) contain a verb or phrase the front end gives no token for. The most frequent
  annotated triggers: commands feeds 60, wire 60, leads to 57, goes to 56, hook 55, paint 31, place 30, nudge 29, goes 26, tie 23, align 23, slide 22, line up 21,
  recolor 20, clone 19, dupe 17, spawn 18, remove 18; questions: show me all 55, touch 41, can be reached from 32, connected 20, neighbours 20, reached from 18;
  facts: "sits above/between/below ...". Some of these words (paint, make, wire) are action words elsewhere, so the front end's trigger rules did not fire in
  this context. I did not check word by word which are unseen in training and which only fail in context; `export_cues.mjs`/`front.json` triggers would show it.
- K4 with the previous request being the same action (309) and K4 questions (377) are not ellipsis at all: the verb is there.
- Copula requests (K1, 80) are statements ("every new circle should be lime", "Arrival can be small").
- Inheriting the previous action would reach at most K2 + part of K3 (about 960 requests), and only if the values were then read right:
  a K2 request is "name + value" ("Greece blue"), so it would also need a world to read it.

## 6. If readings that abstain, or have a small margin, were asked instead of executed

Every produced action (right, wrong, extra) records the status of the chosen reading (ok / abstain) and its margin. The margin is the one
the reader reports as `_margin` of the top wire: the smallest of all role margins of the reading; `abstain` means that minimum is under tau 0.05, so the first
two rows below are identical. Today abstain readings are executed. "Becomes a question" = the action is not executed.

Learned cut: right 13670, wrong 3495, extra 1511 produced.

| rule | right lost (becomes a question) | wrong avoided | extra avoided |
|---|---|---|---|
| status abstain (margin < 0.05) | 823 (6.0%) | 548 (15.7%) | 232 (15.4%) |
| margin < 0.1 | 2638 (19.3%) | 952 (27.2%) | 399 (26.4%) |
| margin < 0.2 | 6819 (49.9%) | 1690 (48.4%) | 741 (49.0%) |

Gold cut: right 14028, wrong 3348, extra 1081: abstain 829 (5.9%) / 534 (15.9%) / 164 (15.2%); margin < 0.1: 2711 (19.3%) / 939 (28.0%) / 300 (27.8%);
margin < 0.2: 6980 (49.8%) / 1637 (48.9%) / 548 (50.7%).

Reading: executing abstain readings costs 823 right actions to avoid 548 wrong ones and 232 extras (1.5 right lost per wrong avoided, 1.2 per wrong-or-extra);
at 0.1 and 0.2 the share of right lost (19%, 50%) is about the same as the share of wrong lost (27%, 48%), i.e. the margin separates right from wrong only weakly.
(A "wrong avoided" action becomes an honest question; 829 of the 3495 wrong actions are references, section 2e; I did not split the abstain numbers by cause.)

## Limits of this analysis

- Causes are first-cause by the order given; a request with two causes appears only under the first.
- "Too short" looks for gold value phrases written in the text; a value written with another word than the gold's (under for below) is not seen.
- The reference test (e) is a text test: the gold name is not in the span or is `$new`. It cannot tell a missing reference from a wrongly resolved one.
- The verbless kinds use regular expressions on the annotated trigger (copula list, determiners, names of the message, value tokens of the fallback lexicon);
  a few cases are put in a neighbouring kind (e.g. "Copy" was seen in K3).
- All numbers are on the data the worlds were trained on (owner's rule: no hidden test set).

Models removed from the working tree on 2026-11-02 (cleanup; the numbers above stay valid): `docs/model/kinds_p80_s0` (a76b4e3), `docs/model/micro/cutter.json` (98fb038). To reproduce, restore one from the commit given: `git checkout <commit> -- docs/model/<path>`.
