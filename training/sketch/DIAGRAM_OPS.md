# DIAGRAM_OPS.md: groups and double positions (2026-11-02)

Owner's request: the editor supports two more diagram operations, read by the three readers into the same SOP wires:

1. **Groups**: "group Start, Process and Check as Pipeline", "ungroup Pipeline"; a group name then works as one unit (move, delete,
   duplicate, align, front/back, ...); questions "what is in Pipeline?", "which group is Check in?".
2. **Double positions**: a position may combine a canvas region and up to two relations to shapes ("below A but above B", "top left,
   right of Y", "between A and B, near the top"), for create, move, facts and questions.

Status: the engine, the rules reader, the canvas and the VSS adapter (`docs/js/vss-adapter.js`) are done and tested
(`training/sketch/test_diagram_ops.mjs`). The VSS worlds are NOT trained for them yet: this file says what the VSS side needs
(sections 4 to 7). The neural reader (`docs/js/neural.js`) does not read them (it has no hypotheses for the new actions).

## 1. The SOP forms

| request | SOP wire |
|---|---|
| group Start, Process and Check as Pipeline | `command action=group target=Start,Process,Check name=Pipeline` |
| put A and C together (no name) | `command action=group target=A,C` (the engine names it group1, group2, ...) |
| add Done to Pipeline | `command action=group target=Done,Pipeline name=Pipeline` (a group name in `target` stands for its shapes) |
| ungroup Pipeline / split Pipeline up | `command action=ungroup target=Pipeline` |
| take Done out of Pipeline | `command action=ungroup target=Done` (a shape name: that shape leaves its group) |
| what is in Pipeline? | `question ask=members target=Pipeline` |
| which group is Check in? | `question ask=groupOf target=Check` |
| what groups are there? / how many groups? / are there any groups? | `question ask=list kind=group` / `ask=count kind=group` / `ask=exists kind=group` |
| move Pipeline below Done (any action on a group) | `command action=move target=Pipeline position=below anchor=Done` |
| draw a star below A but above B | `command action=create shape=star position=below anchor=A position2=above anchor2=B` |
| draw a star top left, right of Y | `command action=create shape=star position=rightOf anchor=Y region=topLeft` |
| add a circle between A and B, near the top | `command action=create shape=circle position=between anchor=A,B region=top` |
| move Y below A and also left of C | `command action=move target=Y position=below anchor=A position2=leftOf anchor2=C` |
| is Y below A and above B? | `question ask=check target=Y position=below anchor=A position2=above anchor2=B` |
| which shapes are left of C and in the top left? | `question ask=list position=leftOf anchor=C region=topLeft` |
| Y is right of A and below C | `fact target=Y position=rightOf anchor=A position2=below anchor2=C` |

New legend questions (`docs/js/logic.js`): `position2` (same values as `position`), `anchor2` (names), `region` (the nine canvas
places), `members` (the members of a group, used by the world write-back). New values: `action` group, ungroup; `ask` members, groupOf;
`kind` group. A single position is written exactly as before (`position=topLeft`, or `position=below anchor=A`): `region` and
`position2` appear only when a position combines two or three parts. The first relation in the text is `position`/`anchor`, the
second `position2`/`anchor2`.

The world write-back (`SOPKit.worldNodes(state)` / `SOPKit.worldSOP(state)` in logic.js) now writes groups as
`@Pipeline group members=$Start,$Process,$Check` after the shapes, edges and rules.

## 2. What the engine does

Groups (plugin `groups` in logic.js; patches `group`, `ungroup`, `renameGroup`; `state.groups = [{name, members}]`):
- A shape is in at most one group; groups do not nest (grouping a group takes its shapes). A group needs two shapes; its name must
  not be a shape's name (and a shape cannot take a group's name).
- move: the box around the members is placed by the same placement rules as one shape (relative, region, direction, coordinates,
  double positions); every member shifts by the same amount, so the layout inside the group is kept.
- delete: the members, their links and the group. duplicate: the members are copied as one block to the right (or where the position
  says), the links among them are copied too, and the copies form a new group (Pipeline2). rename of a group name renames the group.
- align, distribute, arrange, set, resize, label, toFront, toBack: the group name stands for its members.
- A group name can be an anchor ("put X below Pipeline", "is X left of Pipeline?"): the anchor is the box around the members.
- Deleting or renaming a member updates the group; a group whose last member is deleted is gone. Undo / redo restore everything
  (the history keeps whole snapshots of the world, groups included).
- The canvas draws each group as a light dashed frame with its name around the members, recomputed on every render (also while a
  member is dragged by hand).

Double positions (`placeMulti` in logic.js): when a wire has `region` or `position2`, every point of an 8 px grid over the drawing's
cell is a candidate; occupied points are skipped (the free-spot test of every placement); each remaining point is scored first by how
many constraints hold (the same tests the questions use: `relHolds` for relations, the region test of `filterShapes` for regions), ties
going to the earlier constraints (position, then position2, then region), then by the distance to the point each constraint prefers
(the point the single-position placement would use for a relation; for a region, the distance to the region's area). If not all
constraints can hold, the shape is still placed where most of them hold and the reply says which one it could not satisfy ("I couldn't
also put Mid above Pipeline: ..."). Facts with two relations move the shape the same way when they do not hold yet. Questions (check,
count, list, exists) apply every constraint (Datalog: one literal per constraint; the JS handlers: one filter per constraint).

Unchanged: a wire with only `position` (+`anchor`) is placed exactly as before. Checked: `score_rules.mjs` gives the same rows right and
the same misses on all five sets, and the demo's 10 scenarios plus its 3 start messages give the same SOP, answers and final positions
(trace diff, before/after).

## 3. The rules reader

Hand-written for the rules reader only (allowed for the rules; the learned readers learn their words from annotated data):
- group: the legend cues `group`, `put together`, `bundle`; also "put A and B together"; the name after `as` / `into` / `called` /
  `named` ("into a group called Side"); "add/move/put X to/into <group>" becomes a group with that name.
- ungroup: `ungroup`, `split up`, `break up`, `dissolve`; "split/break ... up/apart"; "take/remove X out of/from <group>" (X leaves).
- members: a question naming a known group with "in / inside / of <group>", "contain", "members", "holds"; groupOf: "which/what group",
  "belongs to", "part of a/any/which", "in a/any group"; `kind=group`: count/list/exists questions with "group(s)" and no name.
- double positions: after the first relation, the reader looks for a second one in the rest of the clause (any connective: "but",
  "and also", "and", a comma) and for a canvas region ("in the top left", "near the top", "towards the bottom", bare "top left").
- The formalizer knows group names from `ctx.groups`, or else from the groups of its own world.

## 4. VSS: roles and events needed

The VSS legend (`docs/model/micro/<world>/model.json`, field `legend`) has the roles relation, landmark, landmark2, region. Needed:

| new thing | VSS event / role | in the legend today? |
|---|---|---|
| group | event `group`, roles `members` (set role; one shape -> `object`), `name` | `members`, `name` exist; event is new |
| ungroup | event `ungroup`, role `object` (a group name or a shape name) | event is new |
| what is in Pipeline? | event `members`, role `object` | event is new |
| which group is Check in? | event `groupOf`, role `object` | event is new |
| what groups are there? / how many groups? | events `list` / `count` / `exists` with `object` head `groups` | events exist; the head token `groups` is new |
| a group name as target or anchor | `object`, `members`, `landmark` with a name token `n_pipeline` | yes, nothing new |
| second relation | roles `relation2` (value like `relation`) and `landmark3` (its shape) | both NEW roles |
| region together with a relation | `region` and `relation` (+ landmark, landmark2) in the same reading | roles exist; today the converter writes only one of them |

Why new roles for the second relation and not landmark2: `landmark2` is the second shape of `between` ("between A and B"), and
"between A and B, below C" needs three shapes; giving landmark2 a second meaning would make the reader guess which one it is. A
second `between` in one position is not supported (rare); the converter puts a `between` always in `relation`.

The adapter (`docs/js/vss-adapter.js`, done): events group / ungroup / members / groupOf -> the wires of section 1; `relation` +
`landmark` (+`landmark2`) -> position / anchor; `relation2` + `landmark3` -> position2 / anchor2; `region` -> `position` when it is
alone (as before) and `region` when a relation is also read; `list`/`count`/`exists` with object head `groups` -> `kind=group`.
Checked on hand-made readings: the same SOP as the rules reader for every form of section 1.

## 5. Which world gets what

| world (registry) | events today | add events | add roles to events |
|---|---|---|---|
| manage7 (`manage`) | delete, duplicate, rename, label | group, ungroup | group: members, object, name; ungroup: object |
| questions7 (`questions`) | count, list, extreme, nearest, describe, neighbors, degree, property | members, groupOf | members, groupOf: object; count, list: region, relation2, landmark3 (count also landmark2, which list has) |
| position7 (`position`) | move, swap, arrange, align, distribute, toFront, toBack | none | move: relation2, landmark3 |
| shapes7c (`shapes`) | create, set, resize, fact, rule | none | create: relation2, landmark3; fact: region, relation2, landmark3 |
| graphq7 (`graphq`) | check, connected, path, reachable, cycle, exists | none | check, exists: relation2, landmark3; exists: region, landmark2 |

group / ungroup go to manage7 (it manages shapes as objects and already reads `name` for rename; position7 already has 7 events);
members / groupOf go to questions7, next to describe / neighbors / property (questions about one named thing). msg_to_world.py derives
each event's roles from its rows, so the role lists follow from the converted data; the table says what the data must contain.

Also to change when the worlds are trained (not code of this change; listed so nothing is missed):
- `training/sketch/generate.py`: `EVENTS` += `"group": ["group"], "ungroup": ["ungroup"], "members": ["members_q"], "groupOf":
  ["group_q"]` (pseudo-verb tokens for the two question openers, like `neigh_q`); `ROLES` += `("relation2", "and where else, relative
  to another shape?")`, `("landmark3", "relative to which other shape?")`.
- `worlds_micro/GROUPS_7.json` (manage += group, ungroup; questions += members, groupOf) and `worlds_micro/GROUPS_EVENTS.json` (one
  world per event: group, ungroup, members, groupOf), then the world cutter (`cutter_worlds7s`) and the event cutter (`cutter_events`)
  retrained with the new data (new labels B-group, B-ungroup, B-members, B-groupOf).
- The composer's fallback model (`kinds_p80_s0` in `docs/model/micro/registry.json`) must know the new events too: vss-composer.js
  refuses a world whose events are not in the fallback legend. Retrain the fallback with the new data, then update `registry.json`
  (events per world, versions).
- `export_cues.mjs` now exports the new hand-written rules cues (group, put together, bundle, ungroup, split up, break up, dissolve,
  the members / groupOf question phrases, kind group: groups) into `legend_cues.json` and so into the VSS normalizer table. AGENTS.md
  ("a cue added for one reader is added for both, and only from training data"): do not re-export for the VSS side before the
  coordinator decides; the learned front end (front.py) learns these triggers from the annotated `trigger` fields instead.
- `docs/js/ui.js` passes `ctx.names` from the shapes only. The rules reader finds the group names itself (its own world); the VSS
  front end recognizes a capitalised group name as a name token anyway, but a group name written in lower case is not a name for it.
  `ctx.names` (or a `ctx.groups`) should include the group names (ui.js `readWith`, owned by the agent restructuring ui.js).

## 6. What llm_to_world.py must write (the other agent implements it)

Input rows keep the gold of section 1 (whole messages, `TRAIN_MSG_SPEC.md`, with the additions of section 7). Per clause:

1. `QUESTION_EVENT` += `"members": "members", "groupOf": "groupOf"`.
2. Names: the normalizer must see the group names as names: `names = row["names"] + row.get("groups", []) + created`, where the
   `name` of a `group` wire of an earlier clause of the same message counts as created (as the `name` of a create does today).
3. Events group, ungroup, members, groupOf: handled like the `target` events (the tuple `("delete", "duplicate", ...)`): `target` with
   one name -> `object`, with several names -> `members` (LISTS=1), a mention -> `object` as today. A group name in `target` is just a
   name (`n_pipeline`). For `group`, `name` -> `roles["name"] = need("n_" + slug(name))`; a group without `name` has no name role.
4. `ask` count / list / exists with `kind=group`: `roles["object"] = {"head": "groups"}` (or `"group"`), the word must be in the clause
   (`need`); no other filter.
5. `place()` (used by create, move, check, fact, count, list, exists), replacing the current one:
   ```python
   def place():
       p, p2, rg = a.get("position"), a.get("position2"), a.get("region")
       if p is None and p2 is None and rg is None: return
       rels, regs = [], [rg] if rg else []
       for pk, ak in (("position", "anchor"), ("position2", "anchor2")):
           v = a.get(pk)
           if v is None: continue
           if v in REGION: regs.append(v); continue            # a canvas place written in position / position2
           if v not in REL: lost-or-Skip(f"position {v}")
           rels.append((v, [x.strip() for x in str(a.get(ak, "")).split(",") if x.strip()]))
       if not rels:                                           # a canvas place alone: exactly as today
           roles["region"] = need(REGION[regs[0]]); return
       if len(rels) == 2 and rels[1][0] == "between": rels.reverse()   # a between is always the first relation
       if len(rels) == 2 and rels[1][0] == "between": Skip("two betweens")
       (r1, anc1) = rels[0]
       roles["relation"] = need(REL[r1])
       if anc1: roles["landmark"], _ = ent(anc1[0])
       if len(anc1) > 1: roles["landmark2"], _ = ent(anc1[1])
       if len(rels) == 2:
           (r2, anc2) = rels[1]
           roles["relation2"] = need(REL[r2])
           if anc2: roles["landmark3"], _ = ent(anc2[0])
       if regs: roles["region"] = need(REGION[regs[0]])
   ```
   With one relation and no region the roles are exactly today's. The region tokens (`top_left`, `top`, ...) must be in the normalized
   clause; "near the top" must normalize to the token `top` (check `normalize.py` / `front.py` on the new data, and report the clauses
   set aside by reason in CONVERSION.md, as today).
6. `ENTITY_ROLES`-like lists in the converter and the trainer: `landmark3` is an entity role (a shape), like `landmark2`.
7. `wires_for` writes roles in the order of `ROLES`: add `relation2`, `landmark3` to `ROLES` (generate.py, section 5) after
   `landmark2`.

## 7. Training messages needed

Written by LLM agents following `training/sketch/llm_train/TRAIN_MSG_SPEC.md` (whole messages, many domains and personas, text that
is not a request, self-corrections, typos, questions in about half of the messages), with these additions to its legend:

- Commands: `group`: target (the shapes, comma-joined, or a mention such as "mention(quantifier=all,shape=circle)"; a group name in
  target stands for its shapes), name (when said); `ungroup`: target (a group name, or a shape name when one shape leaves its group).
- Questions: `members`: target (a group); `groupOf`: target (a shape); count / list / exists of groups: `kind` = "group".
- Positions: `position` + `anchor` = the first relation in the text, `position2` + `anchor2` = the second, `region` = a canvas place
  stated together with a relation; a canvas place alone stays `position` (as today).
- Row field `groups`: the groups already on the canvas before the message, `{"Pipeline": ["Start", "Process"]}` (the writer must know
  them to write "move Pipeline ..."); group names are one capitalised word, like shape names.

What the messages must contain (requests, not messages; they sit inside ordinary whole messages that also do other things; the rare
events of the current data have about 250 requests each, so these numbers put the new ones at the same level):

| what | requests | kinds of phrasing |
|---|---|---|
| group | 300 | group / put together / bundle / combine / make one unit of / treat as one block; with and without a name ("as", "into a group called", "call the group"); lists of 2-5 names, a mention ("all the red boxes"), "add X to Pipeline" |
| ungroup | 200 | ungroup / split up / break apart / dissolve / undo the grouping / take X out of Pipeline / remove X from the group |
| members | 150 | what is in / inside / which shapes are in / what does ... contain / list the members of / show me Pipeline |
| groupOf | 150 | which group is X in / what group does X belong to / is X part of a group / is X in any group |
| groups listed / counted / exists | 80 | what groups are there / how many groups / are there any groups / list the groups |
| a group name as target of another action | 300 | spread over move (incl. direction + distance), delete, duplicate, align, distribute, arrange, toFront, toBack, set, resize, label |
| a group name as anchor | 80 | "put X below Pipeline", "is X left of Pipeline?" |
| two relations (create 150, move 150, check 80, list / count / exists 60, fact 40) | 480 | "below A but above B", "under A and over B", "left of A and also below B", "just under A, a bit to the right of B", "below A while staying left of B", "between A and B and below C", reversed orders |
| region + relation (create 100, move 100, check 40, list / count 40, fact 20) | 300 | "top left, right of Y", "in the top right corner next to X", "right of Y in the top left", "between A and B, near the top", "near the bottom, left of X", "in the middle but above A" |

Plus, as SHORT.md found for the cutter, about 10% of these requests also as short one-request messages ("group A and B", "ungroup
Flow", "what's in Flow?"). Every new key value needs at least 40 requests (TRAIN_MSG_SPEC coverage rule). Messages that also contain
contradictory positions ("left of A but right of A") are realistic and welcome: their gold is what the text says.

Then (AGENTS.md, "A new sentence construction needs further training from the current model, mixed with old examples, and the old
tests are re-run"): convert, retrain manage7, questions7, position7, shapes7c, graphq7, the two cutters and the fallback from the
current models mixed with the old data, re-run the old measures (llm_score / error_analysis on the existing data and the demo's short
sets) to show nothing was lost, and measure the new requests per action (right / wrong / not done / extra).

## 8. Tests

- `node training/sketch/test_diagram_ops.mjs`: 78 checks. Engine: shapes placed with two relations, region + relation and between +
  region satisfy every constraint (checked with the check question) for create and move; two shapes with the same constraints do not
  overlap; impossible constraints are reported by name; list / count with two relations; facts with two relations. Groups: create,
  questions, move by direction and by relation (layout inside kept, group as anchor), undo / redo, toBack, set, duplicate, delete +
  undo, align, rename (group and member), a member leaving, delete of a member, ungroup, name clashes, one group per shape, the world
  write-back. Rules reader: 27 sentences with their exact SOP.
- `node training/sketch/score_rules.mjs docs/js/logic.js` before / after: hand 37/40, blind 50/60, seen 296/300, new_identities
  296/300, heldout_formulations 299/300 both times, with identical miss lists (`-v`).
- `node training/sketch/test_editor_history.mjs`: all passed.
- The demo in a browser (Playwright, Rules tab): a group drawn, moved to the bottom, undone and redone; create with two relations,
  with region + relation and with between + region; the check / groupOf / members questions; an impossible pair of relations reported.
