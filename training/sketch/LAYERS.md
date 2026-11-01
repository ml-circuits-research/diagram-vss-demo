# VSS layer and post-VSS layer, scored apart

Scripts (new, nothing existing changed):
- `training/sketch/layer_score.mjs`: the scorer. `node layer_score.mjs` (Part A); `FILL=1` adds the context filler; `SPLIT=test` restricts to
  the 20% test messages; `MARGIN=<x>` overrides the filler's margin. The first run builds a cache of one composer pass (2.5 minutes).
  After that every run takes seconds. The cache goes to `$LAYER_CACHE_DIR/layer_cache.json` (or `CACHE=`); `REBUILD=1` rebuilds it.
- `training/sketch/layer_common.mjs`: the composer pass (copy of the unit loop of `composer_errors.mjs`), the per-key classes, both pairings.
- `docs/js/vss-context.js`: the post-VSS context filler (browser-ready ES module). Nothing in the existing path imports it.
- `training/sketch/train_context.mjs`: learns the filler's weights and margin. Output: `docs/model/context/weights.json` (a new file).

Data and model for every number below: the 9 folders of `micro_tools.py dirs` (4640 messages, 22702 requested actions). The composer is
`docs/model/micro/registry.json` (cutter `micro/cutter.json`, 15 micro-worlds, fallback `kinds_p80_s0`) with the learned cut. Cache built
2026-11-01 08:21 UTC. Check: with llm_score's order-only alignment the scorer gives right 13670 / wrong 3495 / not done 5537 / extra 1511.
That is exactly COMPOSER_ERRORS.md section 1.

## Part A: the two layers

**VSS layer** = the reading of the unit, turned into command args by the adapter's own mapping (`toNodes`) with nothing resolved:
- "it" / "them" stay as `@it` / `@them`;
- a name stays the name VSS read (never a reference to a shape created earlier);
- a description stays a mention (`mention(color=blue)`);
- the two adapter defaults (create shape "circle", property "color") count as empty.

For every gold key of every requested action that was done (paired, see A.4), the VSS value is put in one class:
1. **right**: equal to the gold value. A name equals `$new` when the gold creates a shape with that name earlier in the message.
2. **honest gap**: VSS left the role empty, or gave a reference (`@it`, `@them`, a mention), and the gold value's words are not in the unit.
   They are tested as text words and as the unit's tokens (`n_<name>`, `left_of`, ...). Also in class 2: "2 partial list" (VSS gave some
   members of a gold list, all of them right; the missing ones are not in the unit).
3. **filled WRONG**: VSS put a name or a legend value that is not the gold one.
4. **missed**: empty (4a), a reference (4b) or a partial list (4c), although the gold words ARE in the unit.
5. **extra key**: a key VSS gave that the gold does not have (counted apart).

**Post-VSS layer** = what fills the class-2 keys: today the adapter (`it`/`them` -> `ctx.last`, the last target or created shape; nothing
else), or the filler of Part B.

### A.1 Requested actions

| scoring | right | wrong | asked | not done | extra executed | extra asked |
|---|---|---|---|---|---|---|
| today, order-only alignment (llm_score) | 13670 (60.2%) | 3495 (15.4%) | 0 | 5537 (24.4%) | 1511 | 0 |
| today, value-aware alignment | 13940 (61.4%) | 3259 (14.4%) | 0 | 5503 (24.2%) | 1477 | 0 |

**VSS-correct** (done, and every gold key in class 1 or 2): 15679 of the 17199 done requests (91.2%), i.e. 69.1% of the 22702 requested.
Today's metric counts 13940 of them right. The difference is mostly class-2 keys that the post-VSS layer resolves wrongly or not at all.

VSS-correct per world (done / VSS-correct): set 3168 / 93.9%, connect 2321 / 82.6%, move 2304 / 78.9%, superlatives 1537 / 99.3%,
filters 1124 / 87.6%, fallback kinds_p80_s0 1106 / 96.8%, graph 964 / 97.2%, facts 726 / 96.8%, describe 704 / 98.7%, layout 656 / 89.2%,
targets 637 / 96.2%, create 586 / 92.5%, history 566 / 100%, naming 507 / 90.7%, resize 192 / 96.9%, disconnect 101 / 97.0%.

### A.2 VSS layer per gold key (17199 requests done, 37073 gold keys; the 11683 keys of requests not done are not classified)

| key | gold keys | 1 right | 2 honest gap | 3 filled WRONG | 4 missed |
|---|---|---|---|---|---|
| target | 10128 | 8930 (88.2%) | 893 (8.8%) | **149 (1.5%)** | 156 (1.5%) |
| color | 4101 | 3973 (96.9%) | 66 (1.6%) | **18 (0.4%)** | 44 (1.1%) |
| anchor | 3337 | 3021 (90.5%) | 200 (6.0%) | **39 (1.2%)** | 77 (2.3%) |
| position | 3211 | 2719 (84.7%) | 109 (3.4%) | **39 (1.2%)** | 344 (10.7%) |
| from | 2973 | 2264 (76.2%) | 393 (13.2%) | **215 (7.2%)** | 101 (3.4%) |
| shape | 2718 | 2592 (95.4%) | 68 (2.5%) | **33 (1.2%)** | 25 (0.9%) |
| to | 2120 | 1810 (85.4%) | 191 (9.0%) | **58 (2.7%)** | 61 (2.9%) |
| size | 2117 | 2070 (97.8%) | 34 (1.6%) | **13 (0.6%)** | 0 |
| superlative | 1537 | 1535 (99.9%) | 0 | **2** | 0 |
| pairing | 820 | 499 (60.9%) | 320 (39.0%) | 0 | 1 |
| name | 693 | 676 (97.5%) | 6 | **4** | 7 |
| arrow | 502 | 468 (93.2%) | 28 | **1** | 5 |
| label | 433 | 312 (72.1%) | 12 | **23 (5.3%)** | 86 (19.9%) |
| comparison | 409 | 402 | 6 | 0 | 1 |
| style | 390 | 381 | 9 | 0 | 0 |
| layout | 368 | 310 (84.2%) | 1 | **8** | 49 (13.3%) |
| axis | 285 | 245 (86.0%) | 34 | **6** | 0 |
| count | 179 | 158 | 20 | **1** | 0 |
| kind | 174 | 0 | 174 | 0 | 0 |
| property | 172 | 172 | 0 | 0 | 0 |
| notColor | 146 | 0 | 3 | 0 | 143 (97.9%) |
| direction | 130 | 102 | 4 | 0 | 24 |
| distance | 130 | 99 | 8 | 0 | 23 |
| **all** | **37073** | **32738 (88.3%)** | **2579 (7.0%)** | **609 (1.6%)** | **1147 (3.1%)** |

Reading the table:
- **Filled wrong: 609 keys** (1.6%). Entity roles: 461 (from 215, target 149, to 58, anchor 39). Values: 148 (position 39, shape 33,
  label 23, color 18, size 13, layout 8, axis 6, name 4, superlative 2, arrow 1, count 1).
  - Sub-classes: 242 "some names right, some wrong" (mostly a merged unit such as "Connect Build to Test and Test to Deploy" read as one
    connect over all three names); 163 "wrong shape"; 56 "another description" (the recency or the colour dropped).
- **Honest gaps: 2579.** 1677 in entity roles (target 893, from 393, anchor 200, to 191), the case the owner's rule is about. 902 in
  value keys (pairing 320, kind 174, position 109, ...). For value keys the text test is weak: "chain" is written as "A to B to C", the
  count `kind=edge` as "connections"/"arrows", "bottomleft" as "bottom left". Most of these 902 are reading misses the text test cannot
  see, not context gaps.
- **Real misses: 1147.** position 344 (largely "Sidebar on the left", read as direction=left: see class 5), target 156, notColor 143
  (VSS never fills it), from 101, label 86, anchor 77, to 61, layout 49, color 44. 4a empty 1041, 4b a reference word although the name
  is in the unit 52, 4c partial list 54.
- **Class 5, extra keys: 822.** to 266 (chain read as from+to), color 161, direction 156 (the direction/position choice), style 76,
  arrow 76, target 53.

### A.3 VSS layer per world, and per data folder

| world | gold keys | 1 right | 2 honest gap | 3 filled WRONG | 4 missed |
|---|---|---|---|---|---|
| set | 8868 | 8209 (92.6%) | 447 (5.0%) | 91 (1.0%) | 121 (1.4%) |
| move | 5820 | 4920 (84.5%) | 343 (5.9%) | 91 (1.6%) | 466 (8.0%) |
| connect | 5633 | 4198 (74.5%) | 938 (16.7%) | **254 (4.5%)** | 243 (4.3%) |
| create | 3024 | 2821 (93.3%) | 147 (4.9%) | 6 (0.2%) | 50 (1.7%) |
| kinds_p80_s0 (fallback) | 2753 | 2698 (98.0%) | 18 | 12 | 25 |
| superlatives | 1960 | 1934 (98.7%) | 16 | 2 | 8 |
| graph | 1895 | 1837 (96.9%) | 6 | **51 (2.7%)** | 1 |
| facts | 1750 | 1682 (96.1%) | 40 | 17 | 11 |
| layout | 1276 | 898 (70.4%) | 303 (23.7%) | 20 | 55 |
| filters | 1169 | 840 (71.9%) | 190 (16.3%) | 1 | 138 (11.8%) |
| naming | 1014 | 936 (92.3%) | 30 | **34 (3.4%)** | 14 |
| targets | 786 | 719 (91.5%) | 43 | 15 | 9 |
| describe | 731 | 708 (96.9%) | 14 | 9 | 0 |
| disconnect | 202 | 186 | 10 | 3 | 3 |
| resize | 192 | 152 | 34 | 3 | 3 |

The connect world fills the most wrong values (254, mostly merged chains). graph has 51: "Is Retry connected to Done" read with
anchor=retry. naming has 34: multi-word labels cut to their first word ("Place order" -> "place").
Per data folder, filled wrong is 1.0% to 2.3% everywhere. Honest gaps range from 1.3% (haiku_msg) to 17.2% (sonnet_spans).

### A.4 The alignment

The value-aware pairing pairs produced and gold actions per action label with a maximum-weight matching: first as many pairs as possible,
then the most gold keys the VSS layer read right, then the most letters shared by the unit and the gold span. Text order is not used.

- **796 of the 22702 requested actions get another partner** than with llm_score's order-only rule: 146 a different produced command;
  342 paired that order-only left "not done" (the order constraint blocked them); 308 left unpaired where order-only paired them with a
  produced command that belongs to another request.
- Effect: right 13670 -> 13940 (+270), wrong 3495 -> 3259, not done 5537 -> 5503, extra 1511 -> 1477. The models are the same; only the
  scoring changes.

### A.5 Post-VSS layer today, on the 2579 class-2 keys

| key | class-2 keys | resolved right | resolved wrong | unresolved |
|---|---|---|---|---|
| target | 893 | 224 | 167 | 502 |
| from | 393 | 22 | 96 | 275 |
| anchor | 200 | 31 | 19 | 150 |
| to | 191 | 27 | 16 | 148 |
| value keys (pairing, kind, position, ...) | 902 | 9 | 12 | 881 |
| **all** | **2579** | **313 (12.1%)** | **310 (12.0%)** | **1956 (75.8%)** |

Today the adapter fills about as many honest gaps wrong as right (310 vs 313), and those wrong ones execute. The 96 wrong `from` keys are
mostly "2 partial list": VSS gave part of a chain, the rest is in another unit. Nothing after VSS completes a list.

### A.6 What the data needs: the 1677 class-2 gaps in entity roles

By key and what VSS gave: target pronoun 574, target empty 248, from empty 179, anchor empty 129, from pronoun 126, to empty 113,
from partial list 80, anchor pronoun 71, to pronoun 70, target mention 47, target partial list 24, from mention 8, to mention 6, to partial 2.

By the reference words of the unit (an analysis regex, not used by any reader):
- target + "it" 415, target with no reference word 188, target + "them" 149;
- from + "them" 117, from with no word 88 ("and to Dmz", "then Wifi to Phone"), anchor with no word 83, anchor + "it" 62;
- to + "them" 49, from + "it" 41, to + "it" 41;
- smaller: "all" 29, "all+them" 24, "those" 19, "both" 18+12+6, "copies" 9, "one" 8, "that" 6, "new" 4.

Where the gold value is, in the gold context before the request (first that holds):

| where | gaps |
|---|---|
| no earlier request; the name is written in the text before ("Cart is already there, so make it large") | 391 (23.3%) |
| the previous request, same key | 340 (20.3%) |
| the previous request, its main shape | 258 (15.4%) |
| named only in text that is not a request | 196 (11.7%) |
| no earlier request, never named (a canvas shape: "Put all the desks in a grid") | 116 (6.9%) |
| a canvas shape never named before | 106 (6.3%) |
| a list made of shapes of earlier requests ("Distribute them horizontally") | 106 (6.3%) |
| an earlier request, not the previous | 105 (6.3%) |
| the previous request, another key | 59 (3.5%) |

So "the previous request" covers only 39%. 35% is reachable only through the text (names written before) and 13% only through the canvas.

### A.7 Examples (5 per main class; message id, [world], unit, gold, VSS)

**2 honest gap**
- sm-0001 [set] "make it large": gold target=Cart, VSS `@it` (Cart was named two sentences before).
- sm2-0018 [connect] "Connect it to App and also to Store": from=$new (Auth, created before), VSS `@it`.
- sm-0002 [connect] "hook it up to Lan with a dotted line": from=$new, VSS empty.
- sm-0060 [set] "make him purple": target=Enemy, VSS `mention()`.
- sm-0103 [connect] "Connect And1 to Or1": from=And1,Or1,Not1 (a chain cut in two units), VSS from=And1 (partial list).

**3 filled WRONG**
- sm-0013 [connect] "Connect Build to Test and Test to Deploy, with a label "on pass"": gold from=Test, to=Deploy; VSS
  from=Build,Test,Deploy, to=Test.
- sm2-0220 [move] "put Auth at the top left": gold target=$new (the shape created just before is not Auth); VSS Auth.
- sl-0083 [graph] "Is Retry connected to Done": anchor=Done, VSS Retry.
- hm-0078 [naming] "Label the Confirm as Place order": label "place order", VSS "place".
- hm-0344 [set] "Set Mage to a navy hexagon, no wait, a teal hexagon": color teal, VSS navy (the self-correction was not followed).

**4 missed**
- sm-0014 [move] "Sidebar on the left": position=left, VSS empty (it gave direction=left).
- hm-0349 [move] "Move Tea rightOf Latte": anchor=Latte, VSS empty.
- s-0426 [move] "Host is in the middle": anchor=Host, VSS empty.
- sm-0062 [connect] "Connect Grandpa to Dad and to Uncle": to=Dad,Uncle, VSS Dad (4c).
- sl-0172 [move] "Put Hall1 left of the Lobby and Hall2 right of it": target=Hall1, VSS `@it` (4b).

**Post-VSS today, wrong**
- sm-0004 "connect Running to it": to=$new, today Error.
- sl-0116 "duplicate it for the right": target=Light, today Backdrop.
- fs-0380 "Connect them all one after the other": from=Kickoff,...,Launch, today Kickoff.

## Part B: the post-VSS context filler (`docs/js/vss-context.js`)

Design as the coordinator set it: a closed candidate set, hard filters, a learned linear ranker, and a margin. The output is always one of
the context's shapes or "ask". The data-derived rules from A.6 became candidate sources and features; there is no cascade of rules.

**Gap** (the same test for every entity role):
- `pron`: the role holds `@it` (one shape) or `@them` (several);
- `vague`: a mention with no shape, colour, quantifier or recency ("this", "that one", "him");
- `desc`: a mention with a shape and/or colour. It is filled only by a context shape whose KNOWN attributes confirm it; otherwise it is
  left to the engine, which resolves descriptions against the canvas;
- `empty`: the role is missing although the action needs it.
  - "Needs" is learned from the gold args: a role is needed when at least 90% of the gold wires of that action that agree with the roles
    present (same roles, same one/several arity, same position value) have it, with at least 10 such wires.
  - Examples: connect with nothing -> from; connect from=A -> to; connect from=[A,B] -> nothing; connected target=A -> anchor;
    describe -> nothing.

**Candidates**:
- singles: every shape created, read in a role, or acted on earlier in the message; the canvas shapes (`row.names`); the names written in
  the text (the tokenizer's capital-letter rule);
- groups: a list read earlier in a role; the last two shapes in a role; all shapes created; the shapes of the trailing run of requests with
  one action; all shapes in a role so far; all canvas shapes; the names that share the stem of a plural word of the unit ("the tiles" ->
  Tile1..Tile4); the last two names written before the unit;
- NULL ("nobody in the context").

**Filters**:
- "it" -> one shape; "them" -> several; empty or vague -> either;
- a description's shape and colour must be known and equal;
- not a shape another role of the same frame holds, and not the shape the request itself creates.

**Features** (shared by all roles), each also with a per-gap-kind copy, i.e. one shared weight plus a correction per gap kind:
- requests since the shape was last in a role (1, 2, 3+, never);
- the role it had there (target / from / to / anchor / created / list member);
- same role as the gap; same action; the previous request's main shape; ln(1 + times in a role);
- the last name written before the unit; written before; written inside the unit; on the canvas; created;
- several shapes; several x the share of lists for this role in the data; the group source flags; constraints confirmed;
- NULL bias per gap kind.

**Three decisions that need no ranking**, all generic:
- a mention with a quantifier or a recency word ("the newest triangle") is the engine's: left;
- a pronoun inside a list that already names two or more shapes points back to that list ("Dev to Staging to Prod, chain them"): dropped;
- a vague mention in a role the action does not need ("Describe the diagram"): dropped.

**Training** (`train_context.mjs`), set up as mention ranking:
- every gap of a produced request paired with a gold request is one instance;
- the positive is the candidate equal to the gold value (a set, for several shapes), or NULL when no candidate is;
- the context is built with teacher forcing (an earlier gap is filled with its gold candidate);
- split: 80/20 of the messages by FNV hash of the id: 3697 train / 943 test messages, 1254 / 327 gap instances;
- model: softmax over the candidates of one gap, L2 1e-3, Adam, 600 steps;
- margin rule, fixed before looking at the test split: the smallest margin (grid 0..5, step 0.25) whose fills on the training split are
  at least 95% right. Result: **3.25**.

### B.1 Candidate recall, accuracy and asks (teacher-forced context)

- Gold among the candidates (recall), over gaps whose gold value is a shape (not a description): train 937 / 1084 (86.4%), test 243 / 282
  (86.2%).
  - Test by kind: pron 92.7%, empty 84.8%, vague 83.3%, desc 12.5% (desc golds are mostly descriptions themselves).
  - Test by key: target 89.0%, from 85.1%, anchor 89.7%, to 71.9%.
- Top-1 on train when the gold is a candidate: pron one shape 87%, empty several 88%, empty one shape 45%.

Margin trade-off:

| margin | train fills | right | wrong | not filled | test fills | right | wrong | not filled |
|---|---|---|---|---|---|---|---|---|
| 0 | 918 | 708 (77.1%) | 210 | 336 | 229 | 172 (75.1%) | 57 | 98 |
| 1 | 544 | 463 (85.1%) | 81 | 710 | 142 | 124 (87.3%) | 18 | 185 |
| 2 | 386 | 344 (89.1%) | 42 | 868 | 97 | 87 (89.7%) | 10 | 230 |
| 2.5 | 284 | 265 (93.3%) | 19 | 970 | 76 | 69 (90.8%) | 7 | 251 |
| 3 | 175 | 164 (93.7%) | 11 | 1079 | 49 | 47 (95.9%) | 2 | 278 |
| **3.25 (chosen)** | **117** | **113 (96.6%)** | **4** | **1137** | **35** | **33 (94.3%)** | **2** | **292** |
| 4 | 31 | 30 (96.8%) | 1 | 1223 | 7 | 6 (85.7%) | 1 | 320 |

At the chosen margin the filler is conservative: it fills about 9% of the gaps and asks about the rest.

Learned weights (shared part; positive = preferred):
- in the unit 1.88, stem group 1.70, last name written before 1.08, NULL 0.92, several x list share 0.70, last role "created" 0.52,
  previous request's main shape 0.43, written before 0.39, created 0.38;
- negative: last role "from" -0.71, 3+ requests ago -0.54, canvas only -0.46, several -0.35, 2 requests ago -0.33.
- Pronoun corrections: written before +1.63, last two names written +0.99, last name written +0.96, previous main +0.78, created +0.75,
  same role +0.68; several -1.09.
- Empty-role corrections: several x list share +1.79, stem group +1.70, same action +0.69, canvas group +0.62; last two names -1.31,
  previous main -0.58.

### B.2 End to end: the filler with its own context (the margin from training)

All 4640 messages (80% of them were used for training):

| | right | wrong | asked | not done | extra executed | extra asked |
|---|---|---|---|---|---|---|
| today (value-aware alignment) | 13940 (61.4%) | 3259 (14.4%) | 0 | 5503 (24.2%) | 1477 | 0 |
| filler, margin 3.25 (chosen) | 13762 (60.6%) | **1911 (8.4%)** | 1526 | 5503 | 1052 | 425 |
| filler, margin 2 | 14016 (61.7%) | 2025 (8.9%) | 1158 | 5503 | 1094 | 383 |
| filler, margin 0 | 14303 (63.0%) | 2376 (10.5%) | 520 | 5503 | 1260 | 217 |

TEST split only (943 messages, 4586 requested actions, never trained on):

| | right | wrong | asked | not done | extra executed | extra asked |
|---|---|---|---|---|---|---|
| today | 2873 (62.6%) | 645 (14.1%) | 0 | 1068 (23.3%) | 299 | 0 |
| filler, margin 3.25 (chosen) | 2832 (61.8%) | **387 (8.4%)** | 299 | 1068 | 217 | 82 |
| filler, margin 2 | 2884 (62.9%) | 405 (8.8%) | 229 | 1068 | 229 | 70 |
| filler, margin 0 | 2942 (64.2%) | 476 (10.4%) | 100 | 1068 | 263 | 36 |

With llm_score's order-only alignment, all data, chosen margin: right 13508, wrong 2142, asked 1515, not done 5537, extra 1075 (+436 asked).

Per request, today -> filler (all data, chosen margin): right->right 13738, wrong->wrong 1911, **wrong->asked 1324**, right->asked 202,
wrong->right 24, right->wrong 0.
- The 202 right requests lost are pronouns that today's `ctx.last` got right and the ranker did not reach the margin for: target 136,
  anchor 27, to 14, ...
- At margin 2 the loss shrinks to 70 and wrong->right rises to 146.

Post-VSS on the 2579 class-2 keys (all data):
- today: right 313 / wrong 310 / unresolved 1956;
- filler at 3.25: right 128 / wrong 116 / unresolved 801 / asked 1534;
- filler at 2: right 413 / wrong 188 / asked 1133;
- filler at 0: right 659 / wrong 405 / asked 571.
- Most of the remaining "wrong" at 3.25 are partial lists the filler does not touch (from 79).

### B.3 What fires how often, and how often it is wrong

On the requests done (value-aware pairs), all data, chosen margin:

| gap kind | gaps | gold among candidates | filled right | filled wrong | asked | left to the engine | dropped right | dropped, gold had a value |
|---|---|---|---|---|---|---|---|---|
| pron | 913 | 731 (80.1%) | 101 | 3 (+1 where the gold has no such key) | 785 | 0 | 18 | 5 |
| empty | 749 | 547 (73.0%) | 20 | 2 | 727 | 0 | 0 | 0 |
| vague | 74 | 37 (50.0%) | 0 | 0 | 48 | 0 | 22 | 4 |
| desc | 86 | 2 | 0 | 0 | 0 | 86 | 0 | 0 |

The same on the test split: pron 22 right / 1 wrong / 145 asked; empty 4 / 1 / 152; vague 0 / 0 / 8 (+7 dropped right, 1 not);
desc 16 left.

All gaps of all produced requests (paired or extra): empty->ask 1033, pron->ask 866, pron->fill 118, vague->ask 100, desc->left 100,
vague->dropped 26, pronoun inside a named list->dropped 25, empty->fill 22.

Examples:
- **Filled right:** sm-0023 "Put all the desks in a grid" -> Desk1..Desk4 (empty target, canvas/stem group); sm2-0299 "Duplicate it four
  times" -> Dream; fs-0002 "color it yellow" -> Check; fh-0040 "move it to the top right" -> Volcano; s-0312 "make it white" -> Ward.
- **Filled wrong** (all 5, plus 1 where the gold has no such key):
  - sm-0170 "make it yellow instead" -> Charger (gold Bot1);
  - sl-0092 "make it tiny" -> Manager (gold Agent);
  - s-0491 "connect both to it" -> from=Result (gold Control,Test: the gold reads "both" as the source and "it" as the target);
  - h-0208 "align the boxes horizontally" and h-0493 "Put all the boxes in a grid" -> the Box shapes by stem, where the gold is the
    description "all rectangles";
  - s-0015 "connect Parse to it and it to Output" -> to=Output (the gold has no such key).
- **Asked:** sm-0001 "make it large" (gold Cart: only candidate, margin 2.94 < 3.25); sl-0032 "make it big, I mean huge" (Home);
  fs-0023 "make it green" (Light); sm-0515 "distribute horizontally" (Ride1..3); s-0108 "put the Arena between them" (TeamA, TeamB).
- **Dropped right:** sm-0537 "Dev to Staging to Prod, chain them"; sm-0124 "button goes to mcu and mcu goes to led, link them like that";
  hm2-0073 "Describe the diagram".
- **Left to the engine:** hm-0060 "move the red circle to the left of Desk2"; sm-0113 "rename the first star Week1".

### B.4 Reading

- The filler's main effect is honesty, not accuracy. At the chosen margin it turns 1324 wrong executions into questions to the user.
  It loses 202 right ones: pronouns that today's "last shape" rule happens to get right but the ranker cannot be 95% sure of.
- On the test split, wrong falls 645 -> 387 (-40%) and right falls 2873 -> 2832 (-1.4%).
- The margin is the owner's choice. The rule fixed beforehand (95% right fills on training) gives 3.25.
  - Margin 2 keeps right at today's level (+11 on test) with wrong -37%.
  - Margin 0 gives the most right (+69 on test) with wrong -26%.
- The weak part is the empty role with one shape (45% top-1). Many of these golds read one "them" as two roles ("Connect them with a dashed
  line" -> from=Sun12, to=Earth12), which a one-role filler cannot express; the margin asks there.

## Limits

- The class test for "words in the unit" is a text test. For value keys it misses synonyms and structure (A.2). For `$new` any shape
  created earlier counts, because the gold does not say which.
- Class 2 for value keys (902) is mostly reading misses, not context gaps. The filler only handles entity roles.
- B.1 uses a teacher-forced context. B.2 uses the filler's own context, which is the end-to-end number.
- The "asked" column is a new outcome: a request whose needed role stays unresolved is not executed. Today's metric has no such column, so
  "asked" is part of "not done" in the owner's terms.
- Partial lists (VSS read part of a chain) are not completed by anything after VSS: 106 + 54 keys.
- The 9 folders are training data for the worlds (owner's rule: no hidden test set). The 20% test split is held out only from the
  filler's weights.
