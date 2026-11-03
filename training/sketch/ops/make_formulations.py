#!/usr/bin/env python3
"""make_formulations.py: writes training/sketch/ops/formulations.jsonl (and formulations_texts.jsonl, ids and texts only) from the
hand-written short commands below: the high-level layout operations and arrow restyling of HIGH_LEVEL_OPS.md, the way people type them
(clipped, imperative, typos, chatty), with the gold wires of the design (the wire format of llm_train/synth_combo: span, trigger, type, args).

A clearly labelled SYNTHETIC, hand-written set (AGENTS.md: short literal commands covering what the Rules detect), written by one agent;
texts and gold were written together. Notation in a text: [span] marks a request, {trigger} its trigger words inside the span; the
args of each span are given in order. Conventions (HIGH_LEVEL_OPS.md section 3):
  - all / everything / all the shapes / the (whole) diagram / the canvas / the whole thing / all of them  -> target mention(quantifier=all)
  - no target word, or "it" / "this" / "things" with nothing before it -> no target (the engine then takes every shape of the drawing)
  - respace: comparison=bigger (more space) | smaller (less), scale only for an amount word, distance for "N px"
Run: python3 training/sketch/ops/make_formulations.py
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ALL = "mention(quantifier=all)"
POOL = ["Start", "Process", "Check", "Done", "Ceo", "Cto", "Cfo", "Hub", "Api", "Db", "Cache", "Web", "Auth", "Login", "Home", "Cart",
        "Pay", "Idea", "Plan", "Build", "Ship", "Router", "Lan", "Queue", "Worker", "Root", "Leaf", "Mars", "Venus", "Alpha", "Beta"]
def mall(**kw): kw["quantifier"] = "all"; return "mention(" + ",".join(f"{k}={kw[k]}" for k in sorted(kw)) + ")"

def C(**kw): return {"type": "command", "args": {k: str(v) for k, v in kw.items()}}
def Q(**kw): return {"type": "question", "args": {k: str(v) for k, v in kw.items()}}
def imp(**kw): return C(action="improve", **kw)
def arr(**kw): return C(action="arrange", **kw)
def sp(**kw): return C(action="respace", **kw)

L = []
def add(op, text, *wires, note=None): L.append((op, text, list(wires), note))

# ---------------------------------------------------------------- improve (tidy up, clean up, make it look better) ----------------------------------------------------------------
for t, w in [
    ("[{tidy up}]", imp()), ("[{tidy} this up] pls", imp()), ("can you [{tidy up} the diagram]?", imp(target=ALL)), ("[{tidy up} everything]", imp(target=ALL)),
    ("ok [{clean this up}]", imp()), ("[{clean up} the canvas] please", imp(target=ALL)), ("[{clean it up}] a bit", imp()), ("pls [{clean up} the whole diagram]", imp(target=ALL)),
    ("[{make it look better}]", imp()), ("can you [{make} this {look nicer}]", imp()), ("[{make} the diagram {look} more {professional}]", imp(target=ALL)), ("[{make} it {look} less {messy}]", imp()),
    ("[{improve} the layout]", imp()), ("[{improve} everything]", imp(target=ALL)), ("just [{improve} it]", imp()), ("[{improve} the diagram] pls", imp(target=ALL)),
    ("[{fix the layout}]", imp()), ("[{fix this mess}]", imp()), ("can u [{fix the layout}] its all over the place", imp()), ("[{sort out the mess}]", imp()),
    ("[{neaten} it up]", imp()), ("[{neaten} everything]", imp(target=ALL)), ("[{declutter}]", imp()), ("[{declutter} the canvas]", imp(target=ALL)),
    ("[{less clutter}] pls", imp()), ("[{less messy}] please", imp()), ("[{tidy}] pls", imp()), ("[{tidyup}] the diagram pls", imp(target=ALL)),
    ("[{tidey up}]", imp()), ("[{tidy up} all the shapes]", imp(target=ALL)), ("[{clean up} the boxes]", imp(target=mall(shape="rectangle"))), ("[{tidy up} the circles]", imp(target=mall(shape="circle"))),
    ("[{tidy up} Start, Process and Check]", imp(target="Start,Process,Check")), ("[{clean up} Hub, Api and Db]", imp(target="Hub,Api,Db")), ("[{beautify} it]", imp()), ("[{prettify} the diagram]", imp(target=ALL)),
    ("it's a mess, [{tidy} it up]", imp()), ("this looks awful, [{clean it up}] for me", imp()), ("[{make} everything {look neater}]", imp(target=ALL)), ("[{make it tidier}]", imp()),
    ("[{make it cleaner}]", imp()), ("[{clean} things {up}] a little", imp()), ("hey [{tidy up} the drawing] before the meeting", imp(target=ALL)), ("[{improve} the look of the whole thing]", imp(target=ALL)),
    ("[{fix up the layout}] please", imp()), ("[{tidy} the whole thing {up}]", imp(target=ALL)), ("[{improve} the layout] of everything", imp(target=ALL)), ("[{fix the positioning}]", imp()),
    ("[{make it look good}]", imp()), ("[{make it nicer}] pls", imp()), ("[{declutter} this diagram]", imp(target=ALL)), ("[{neaten up} the layout]", imp()),
]:
    add("improve", t, w)

# ---------------------------------------------------------------- arrange as a tree ----------------------------------------------------------------
T = lambda **kw: arr(layout="tree", **kw)
for t, w in [
    ("[{arrange} everything as a tree]", T(target=ALL)), ("[{arrange} all as a tree]", T(target=ALL)), ("[{arrange} it as a tree]", T()), ("[{arrange} as a tree]", T()),
    ("[{tree layout}] pls", T()), ("[tree {layout}] please", T()), ("[{make it a tree}]", T()), ("[{make} the diagram a tree]", T(target=ALL)),
    ("[{lay out} the diagram as a tree]", T(target=ALL)), ("[{lay} everything {out} as a tree]", T(target=ALL)), ("[{organize} it as a hierarchy]", T()), ("[{arrange} hierarchically]", T()),
    ("[{arrange} it like an org chart]", T()), ("[{org chart} style] pls", T()), ("[{layout} as an org chart]", T()), ("[{turn} this into an org chart]", T()),
    ("[{arrange} the shapes as a tree]", T(target=ALL)), ("[{arrange} Start, Process and Check as a tree]", T(target="Start,Process,Check")), ("[{arange} it as a tree]", T()), ("[{arrange} as a tre]", T()),
    ("[{arrange} as a tree with Ceo at the top]", T(anchor="Ceo")), ("[{arrange} everything as a tree rooted at Ceo]", T(target=ALL, anchor="Ceo")), ("[{make it a tree} with Root at the top]", T(anchor="Root")), ("[{arrange} as a tree starting from Start]", T(anchor="Start")),
    ("[{tree layout} with Hub as the root]", T(anchor="Hub")), ("[{arrange} as a hierarchy with Ceo on top]", T(anchor="Ceo")),
    ("[{arrange} as a tree from left to right]", T(direction="right")), ("[horizontal tree {layout}]", T(direction="right")), ("[{arrange} as a horizontal tree]", T(direction="right")), ("[{arrange} as a tree going right]", T(direction="right")),
    ("[{make it a tree} growing sideways]", T(direction="right")), ("[{arrange} as a vertical tree]", T(direction="down")), ("[{arrange} as a tree top to bottom]", T(direction="down")), ("[{arrange} as a top-down tree]", T(direction="down")),
    ("[{arrange} as an upside down tree]", T(direction="up")), ("[{arrange} as a tree growing upwards]", T(direction="up")), ("[{arrange} as a tree bottom to top]", T(direction="up")), ("[{arrange} as a tree right to left]", T(direction="left")),
    ("[{lay out} as a tree, root at the left]", T(direction="right"), ), ("[{arrange} the org chart from left to right]", T(direction="right")), ("[{reorganize} it as a family tree]", T()), ("[{rearrange} as a tree]", T()),
    ("[{arrange} Ceo, Cto and Cfo as a hierarchy]", T(target="Ceo,Cto,Cfo")), ("[{organise} the boxes as a tree]", T(target=mall(shape="rectangle"))), ("[{relayout} as tree]", T()),
]:
    add("arrange:tree", t, w, note="ambiguous with the tree template: no items list, existing shapes -> re-layout by the links" if "family tree" in t else None)

# ---------------------------------------------------------------- arrange in layers (layered flow, follows the arrows) ----------------------------------------------------------------
Y = lambda **kw: arr(layout="layers", **kw)
for t, w in [
    ("[{arrange} in layers]", Y()), ("[{arrange} everything in layers]", Y(target=ALL)), ("[layered {layout}] pls", Y()), ("[{arrange} as a flowchart]", Y()),
    ("[{lay out} the diagram as a flow]", Y(target=ALL)), ("[{arrange} as a flow from left to right]", Y(direction="right")), ("[{arrange} in layers left to right]", Y(direction="right")), ("[{layout} as a flowchart, top to bottom]", Y(direction="down")),
    ("[{arrange} as a layered flow going down]", Y(direction="down")), ("[{arrange} in layers bottom to top]", Y(direction="up")), ("[{arrange} in layers right to left]", Y(direction="left")), ("[{arrange} in tiers]", Y()),
    ("[{arrange} in levels]", Y()), ("[{organize} it in layers by the arrows]", Y()), ("[{lay} it {out} as a flow chart]", Y()), ("[flowchart {layout}] pls", Y()),
    ("[{make it a flowchart}] left to right", Y(direction="right")), ("[{arrange} all of it in layers]", Y(target=ALL)), ("[{arrange} Start, Process, Check and Done as a flow]", Y(target="Start,Process,Check,Done")), ("[{arange} in layers]", Y()),
    ("[{arrange} in layrs]", Y(), ), ("[{arrange} as a horizontal flow]", Y(direction="right")), ("[{arrange} as a vertical flowchart]", Y(direction="down")), ("[{arrange} in layers starting from Start]", Y(anchor="Start")),
    ("[{arrange} as a flow with Start at the left]", Y(direction="right", anchor="Start"), ), ("[{lay out} the whole diagram in layers]", Y(target=ALL)), ("[{rearrange} as a layered flow]", Y()), ("[{arrange} the arrows' flow top to bottom]", Y(direction="down")),
    ("[{organise} everything as a flowchart]", Y(target=ALL)), ("[layers {layout} LR]", Y(direction="right")), ("[{layout} TD]", arr(direction="down")), ("[{layout} LR] pls", arr(direction="right")),
]:
    add("arrange:layers", t, w, note="'layrs': a typo the Rules' spelling step does not fix (not a cue word of 4+ letters)" if "layrs" in t else None)

# ---------------------------------------------------------------- arrange with no pattern / a direction only (the layout the links ask for) ----------------------------------------------------------------
for t, w in [
    ("[{auto layout}]", arr()), ("[{auto-layout} everything]", arr(target=ALL)), ("[{autolayout}] pls", arr()), ("[{arrange} everything]", arr(target=ALL)),
    ("[{arrange} the diagram]", arr(target=ALL)), ("[{lay} it {out}]", arr()), ("[{re-layout} the whole diagram]", arr(target=ALL)), ("[{rearrange} everything]", arr(target=ALL)),
    ("[{left to right}] pls", arr(direction="right")), ("[{make} it flow {left to right}]", Y(direction="right")), ("[{arrange} left to right]", arr(direction="right")), ("[{top to bottom}] please", arr(direction="down")),
    ("[{arrange} everything top to bottom]", arr(target=ALL, direction="down")), ("[{arrange} it right to left]", arr(direction="left")), ("[{arrange} bottom to top]", arr(direction="up")), ("[{lay out} left to right]", arr(direction="right")),
    ("[{organize} the shapes left to right]", arr(target=ALL, direction="right")), ("[{reorganize} the diagram]", arr(target=ALL)), ("[{arrange} Api, Db and Cache left to right]", arr(target="Api,Db,Cache", direction="right")), ("[{relayout}]", arr()),
    ("[{arrange} things automatically]", arr()), ("[{reformat} the diagram]", arr(target=ALL)), ("[{rearange} everything]", arr(target=ALL)), ("[{arrange} all the shapes]", arr(target=ALL)),
]:
    add("arrange:auto", t, w, note="no pattern: the engine picks the layout the links ask for (tree / layers / circle / grid)" if "direction" not in w["args"] else None)

# ---------------------------------------------------------------- radial ----------------------------------------------------------------
R = lambda **kw: arr(layout="radial", **kw)
for t, w in [
    ("[{radial layout}]", R()), ("[{arrange} radially]", R()), ("[{arrange} everything radially]", R(target=ALL)), ("[{arrange} in a radial layout]", R()),
    ("[{arrange} radially around Hub]", R(anchor="Hub")), ("[{radial layout} with Check at the center]", R(anchor="Check")), ("[{arrange} radially with Start in the middle]", R(anchor="Start")), ("[{arrange} as a mind map around Idea]", R(anchor="Idea")),
    ("[{arrange} as a mind map]", R()), ("[{lay out} the diagram radially]", R(target=ALL)), ("[{arrange} in concentric rings]", R()), ("[{arrange} as a sunburst]", R()),
    ("[{arrange} hub and spokes with Api as the hub]", R(anchor="Api")), ("[{radial} please]", R()), ("[{arrange} radially centred on Hub]", R(anchor="Hub")), ("[{radial layout} around Root]", R(anchor="Root")),
    ("[{arange} radially]", R()), ("[{arrange} all of them radially]", R(target=ALL)), ("[{make it radial}]", R()), ("[{organize} it as a mind map]", R()),
    ("[{arrange} radialy around Hub]", R(anchor="Hub")), ("[{arrange} Hub, Api, Db and Cache radially]", R(target="Hub,Api,Db,Cache")), ("[{radial layout} with Hub as the centre]", R(anchor="Hub")), ("[{arrange} in rings around Start]", R(anchor="Start")),
    ("[{rearrange} radially]", R()), ("[{lay} everything {out} radially around Ceo]", R(target=ALL, anchor="Ceo")),
]:
    add("arrange:radial", t, w, note="'radialy': a typo the Rules' spelling step does not fix" if "radialy" in t else ("'rings around' without 'concentric': only 'around X' is read" if "in rings" in t else None))

# ---------------------------------------------------------------- organic ----------------------------------------------------------------
O = lambda **kw: arr(layout="organic", **kw)
for t, w in [
    ("[{organic layout}]", O()), ("[{arrange} organically]", O()), ("[{arrange} everything organically]", O(target=ALL)), ("[{force-directed layout}] pls", O()),
    ("[{arrange} with a force directed layout]", O()), ("[{spring layout}]", O()), ("[{arrange} it organically]", O()), ("[{lay out} the network organically]", O()),
    ("[{arrange} in an organic layout]", O()), ("[{organic} please]", O()), ("[{arrange} the diagram organically]", O(target=ALL)), ("[{arange} organically]", O()),
    ("[{arrange} Router, Lan and Hub organically]", O(target="Router,Lan,Hub")), ("[{make it organic}]", O()), ("[{arrange} with physics]", O()), ("[{layout}: organic]", O()),
    ("[{rearrange} organically]", O()), ("[{organise} everything organically]", O(target=ALL)), ("[{arrange} the shapes organically]", O(target=ALL)), ("[{force directed}] pls", O()),
    ("[{arrange} all of it organically]", O(target=ALL)), ("[organic {layout}] for the network pls", O()), ("[{arrange} everything force-directed]", O(target=ALL)), ("[{lay} it {out} organically]", O()),
    ("[{arrange} as a force directed graph]", O()),
]:
    add("arrange:organic", t, w)

# ---------------------------------------------------------------- grid / circle / row / column ----------------------------------------------------------------
G = lambda **kw: arr(layout="grid", **kw)
for t, w in [
    ("[{arrange} everything in a grid]", G(target=ALL)), ("[{grid layout}]", G()), ("[{arrange} in a grid]", G()), ("[{put} them in a grid]", G()),
    ("[{arrange} the boxes in a grid]", G(target=mall(shape="rectangle"))), ("[{lay out} everything as a grid]", G(target=ALL)), ("[{arrange} all of them in a grid]", G(target=ALL)), ("[{arrange} Start, Process, Check and Done in a grid]", G(target="Start,Process,Check,Done")),
    ("[{arange} in a grid]", G()), ("[{arrange} in a gird]", G()), ("[{organize} the shapes into a grid]", G(target=ALL)), ("[{make it a grid}]", G()),
    ("[{arrange} the stars in a grid]", G(target=mall(shape="star"))), ("[{grid} pls]", G()), ("[{arrange} the diagram in a grid]", G(target=ALL)), ("[{arrange} the red ones in a grid]", G(target=mall(color="red"))),
    ("[{tidy} them into a grid]", G()), ("[{organise} everything in a grid]", G(target=ALL)), ("[{lay} the circles {out} in a grid]", G(target=mall(shape="circle"))), ("[{arrange} Hub, Api and Db in a grid]", G(target="Hub,Api,Db")),
    ("[{rearrange} into a grid]", G()), ("[{arrange} all shapes in a grid]", G(target=ALL)), ("[{put} everything in a grid]", G(target=ALL)), ("[{arrange} the whole thing in a grid]", G(target=ALL)),
    ("[{arrange} into a neat grid]", G()), ("[{lay out} in a grid] please", G()),
]:
    add("arrange:grid", t, w, note="'tidy ... into a grid': a pattern word turns tidy into arrange" if "tidy" in t else ("'gird': a typo the Rules' spelling step does not fix" if "gird" in t else None))
CI = lambda **kw: arr(layout="circle", **kw)
for t, w in [
    ("[{arrange} everything in a circle]", CI(target=ALL)), ("[{arrange} in a circle]", CI()), ("[{circle layout}]", CI()), ("[{arrange} them in a ring]", CI()),
    ("[{put} them in a circle]", CI()), ("[{arrange} the stars in a circle]", CI(target=mall(shape="star"))), ("[{arrange} Plan, Build, Ship and Check in a circle]", CI(target="Plan,Build,Ship,Check")), ("[{lay out} everything in a circle]", CI(target=ALL)),
    ("[{arrange} all shapes in a circle]", CI(target=ALL)), ("[{arange} in a circle]", CI()), ("[{arrange} in a cirle]", CI()), ("[{make} a ring of them]", CI()),
    ("[{arrange} the diagram in a circle]", CI(target=ALL)), ("[{organize} the shapes in a circle]", CI(target=ALL)), ("[{arrange} everything as a ring]", CI(target=ALL)), ("[{arrange} the blue ones in a circle]", CI(target=mall(color="blue"))),
    ("[{arrange} all of them in a circle]", CI(target=ALL)), ("[{rearrange} into a circle]", CI()), ("[circle {layout}] please", CI()), ("[{arrange} the hexagons in a ring]", CI(target=mall(shape="hexagon"))),
    ("[{organise} it in a circle]", CI()), ("[{arrange} Hub, Api, Db and Web in a ring]", CI(target="Hub,Api,Db,Web")), ("[{put} everything in a ring]", CI(target=ALL)), ("[{arrange} the whole thing in a circle]", CI(target=ALL)),
    ("[{lay} them {out} in a circle]", CI()),
]:
    add("arrange:circle", t, w, note="'make a ring of them': no layout cue in the 'in/as a ring' form" if "ring of" in t else None)
RW = lambda **kw: arr(layout="row", **kw)
for t, w in [
    ("[{arrange} everything in a row]", RW(target=ALL)), ("[{arrange} in a row]", RW()), ("[{put} them in a row]", RW()), ("[{arrange} them in a line]", RW()),
    ("[{arrange} Start, Process, Check and Done in a row]", RW(target="Start,Process,Check,Done")), ("[{arrange} the circles in a row]", RW(target=mall(shape="circle"))), ("[{lay out} everything in a row]", RW(target=ALL)), ("[{arrange} all of them horizontally]", RW(target=ALL)),
    ("[{arrange} everything horizontally]", RW(target=ALL)), ("[{arange} in a row]", RW()), ("[{arrange} in one row]", RW()), ("[{organize} the shapes in a row]", RW(target=ALL)),
    ("[{arrange} the boxes in a line]", RW(target=mall(shape="rectangle"))), ("[{line} them {up} in a row]", C(action="align", axis="horizontal")), ("[{arrange} Plan, Build and Ship in a row, left to right]", RW(target="Plan,Build,Ship", direction="right")), ("[{arrange} in a row from right to left]", RW(direction="left")),
    ("[row {layout}] pls", RW()), ("[{arrange} the diagram in a row]", RW(target=ALL)), ("[{arrange} all shapes in a line]", RW(target=ALL)), ("[{rearrange} into a row]", RW()),
    ("[{arrange} the green ones in a row]", RW(target=mall(color="green"))), ("[{put} everything in a line]", RW(target=ALL)), ("[{lay} them {out} in a row]", RW()), ("[{arrange} Api, Db and Cache horizontally]", RW(target="Api,Db,Cache")),
    ("[{organise} them in a row]", RW()),
]:
    add("arrange:row", t, w, note="'line them up in a row': align on one line (axis), not a re-layout" if "line} them" in t else None)
CO = lambda **kw: arr(layout="column", **kw)
for t, w in [
    ("[{arrange} everything in a column]", CO(target=ALL)), ("[{arrange} in a column]", CO()), ("[{put} them in a column]", CO()), ("[{stack} them]", CO()),
    ("[{arrange} Start, Process, Check and Done in a column]", CO(target="Start,Process,Check,Done")), ("[{arrange} the circles in a column]", CO(target=mall(shape="circle"))), ("[{lay out} everything in a column]", CO(target=ALL)), ("[{arrange} all of them vertically]", CO(target=ALL)),
    ("[{arrange} everything vertically]", CO(target=ALL)), ("[{arange} in a column]", CO()), ("[{arrange} in a colum]", CO()), ("[{organize} the shapes in a column]", CO(target=ALL)),
    ("[{arrange} the boxes in a stack]", CO(target=mall(shape="rectangle"))), ("[{arrange} in a column from bottom to top]", CO(direction="up")), ("[column {layout}] pls", CO()), ("[{arrange} the diagram in a column]", CO(target=ALL)),
    ("[{arrange} all shapes in a column]", CO(target=ALL)), ("[{rearrange} into a column]", CO()), ("[{arrange} the red ones in a column]", CO(target=mall(color="red"))), ("[{put} everything in a column]", CO(target=ALL)),
    ("[{lay} them {out} in a column]", CO()), ("[{arrange} Login, Home and Cart vertically]", CO(target="Login,Home,Cart")), ("[{organise} them in a column]", CO()), ("[{arrange} them in a stack]", CO()),
    ("[{arrange} Idea, Plan and Build in a column, top to bottom]", CO(target="Idea,Plan,Build", direction="down")),
]:
    add("arrange:column", t, w, note="'stack them': a bare verb, no cue" if t == "[{stack} them]" else None)

# ---------------------------------------------------------------- align (axis) and align edges ----------------------------------------------------------------
for t, w in [
    ("[{line up} everything]", C(action="align", target=ALL)), ("[{line} everything {up}]", C(action="align", target=ALL)), ("[{align} all the shapes horizontally]", C(action="align", target=ALL, axis="horizontal")), ("[{align} everything vertically]", C(action="align", target=ALL, axis="vertical")),
    ("[{align} Start, Process and Check horizontally]", C(action="align", target="Start,Process,Check", axis="horizontal")), ("[{line up} Api and Db vertically]", C(action="align", target="Api,Db", axis="vertical")), ("[{align} the circles]", C(action="align", target=mall(shape="circle"))), ("[{allign} everything horizontally]", C(action="align", target=ALL, axis="horizontal")),
    ("[{align} them in a row]", C(action="align", axis="horizontal")), ("[{line up} the boxes in a column]", C(action="align", target=mall(shape="rectangle"), axis="vertical")), ("[{align} the stars horizontally]", C(action="align", target=mall(shape="star"), axis="horizontal")), ("[{align} all of them vertically]", C(action="align", target=ALL, axis="vertical")),
    ("[{line up} Ceo, Cto and Cfo]", C(action="align", target="Ceo,Cto,Cfo")), ("[{align} the diagram horizontally]", C(action="align", target=ALL, axis="horizontal")), ("[{line up} the red ones horizontally]", C(action="align", target=mall(color="red"), axis="horizontal")), ("[{align} Hub and Api vertically]", C(action="align", target="Hub,Api", axis="vertical")),
]:
    add("align", t, w)
AE = lambda d, **kw: C(action="align", direction=d, **kw)
for t, w in [
    ("[{align} everything to the left]", AE("left", target=ALL)), ("[{align left}]", AE("left")), ("[{left align} everything]", AE("left", target=ALL)), ("[{align} the left edges]", AE("left")),
    ("[{align} all the shapes to the right]", AE("right", target=ALL)), ("[{align right}] pls", AE("right")), ("[{align} the right edges of Start, Process and Check]", AE("right", target="Start,Process,Check")), ("[{right align} the boxes]", AE("right", target=mall(shape="rectangle"))),
    ("[{align} the tops]", AE("up")), ("[{align} their tops]", AE("up")), ("[{align top}]", AE("up")), ("[{top align} everything]", AE("up", target=ALL)),
    ("[{align} Api, Db and Cache to the top]", AE("up", target="Api,Db,Cache")), ("[{align} the bottoms]", AE("down")), ("[{align bottom}]", AE("down")), ("[{bottom align} the circles]", AE("down", target=mall(shape="circle"))),
    ("[{align} everything to the bottom]", AE("down", target=ALL)), ("[{align} the bottom edges]", AE("down")), ("[{line up} the left edges]", AE("left")), ("[{line up} the tops of Ceo, Cto and Cfo]", AE("up", target="Ceo,Cto,Cfo")),
    ("[{allign} left]", AE("left")), ("[{align} left edges] pls", AE("left")), ("[{align} the stars to the left]", AE("left", target=mall(shape="star"))), ("[{align} Hub and Api to the right]", AE("right", target="Hub,Api")),
    ("[{align} all of them to the top]", AE("up", target=ALL)), ("[{align} the diagram to the left]", AE("left", target=ALL)), ("[{align} the blue ones to the bottom]", AE("down", target=mall(color="blue"))), ("[{left-align} the labels column]", AE("left")),
]:
    add("align:edge", t, w, note="'the labels column': not a description the Rules read; no target" if "labels column" in t else None)

# ---------------------------------------------------------------- distribute (even spacing, keeps the ends) ----------------------------------------------------------------
D = lambda **kw: C(action="distribute", **kw)
for t, w in [
    ("[{space} them {out} evenly]", D()), ("[{space out} everything evenly]", D(target=ALL)), ("[{distribute} horizontally]", D(axis="horizontal")), ("[{distribute} everything vertically]", D(target=ALL, axis="vertical")),
    ("[{distribute} Start, Process and Check horizontally]", D(target="Start,Process,Check", axis="horizontal")), ("[{spread} the circles {out} evenly]", D(target=mall(shape="circle"))), ("[{even out} the spacing]", D()), ("[{space} the boxes evenly in a row]", D(target=mall(shape="rectangle"), axis="horizontal")),
    ("[{distribute} all the shapes evenly]", D(target=ALL)), ("[{distrbute} everything horizontally]", D(target=ALL, axis="horizontal")), ("[{space} Api, Db and Cache evenly]", D(target="Api,Db,Cache")), ("[{spread} them {out} vertically]", D(axis="vertical")),
    ("[{distribute} the stars in a column]", D(target=mall(shape="star"), axis="vertical")), ("[{equal spacing}] between all shapes", D(target=ALL)), ("[{space} everything {out} evenly, horizontally]", D(target=ALL, axis="horizontal")), ("[{distribute} them evenly]", D()),
    ("[{spread out} the shapes evenly]", D(target=ALL)), ("[{distribute} the diagram vertically]", D(target=ALL, axis="vertical")), ("[{space} Ceo, Cto and Cfo evenly]", D(target="Ceo,Cto,Cfo")), ("[{spread} all of them {out} evenly]", D(target=ALL)),
    ("[{distribute} the red ones horizontally]", D(target=mall(color="red"), axis="horizontal")), ("[{even} the gaps {out}]", D()), ("[{space} them equally]", D()), ("[{distribute} evenly] pls", D()),
    ("[{spread} everything {out} evenly in a row]", D(target=ALL, axis="horizontal")), ("[{make} the gaps {equal}]", D()),
]:
    add("distribute", t, w, note="'equal spacing', 'make the gaps equal': no distribute cue" if "equal" in t else None)

# ---------------------------------------------------------------- spacing: more / less space ----------------------------------------------------------------
MORE, LESS = dict(comparison="bigger"), dict(comparison="smaller")
for t, w in [
    ("[{more space} between the shapes]", sp(target=ALL, **MORE)), ("[{more space}] pls", sp(**MORE)), ("[give them {more room}]", sp(**MORE)), ("[{spread} them {out more}]", sp(**MORE)),
    ("[{spread} everything {out more}]", sp(target=ALL, **MORE)), ("[{space} things {out a bit}]", sp(scale="1.25", **MORE)), ("[{less space} between them]", sp(**LESS)), ("[{less space}] pls", sp(**LESS)),
    ("[{tighten} it {up}]", sp(**LESS)), ("[{make it more compact}]", sp(**LESS)), ("[{compact} the layout]", sp(**LESS)), ("[{compact} everything]", sp(target=ALL, **LESS)),
    ("[{squeeze} them together]", sp(**LESS)), ("[{bring} everything {closer together}]", sp(target=ALL, **LESS)), ("[{closer together}] please", sp(**LESS)), ("[{further apart}] pls", sp(**MORE)),
    ("[{move} them {further apart}]", sp(**MORE)), ("[{push} everything {further apart}]", sp(target=ALL, **MORE)), ("[{double the spacing}]", sp(scale="2", **MORE)), ("[{halve the spacing}]", sp(scale="0.5", **LESS)),
    ("[{increase the spacing}]", sp(**MORE)), ("[{reduce the spacing}]", sp(**LESS)), ("[{increase the gaps} a little]", sp(scale="1.25", **MORE)), ("[{decrease the spacing}] between all shapes", sp(target=ALL, **LESS)),
    ("it's [{too crowded}], spread it out", sp(**MORE)), ("[{too cramped}], more room pls", sp(**MORE)), ("[{too spread out}], pull it in", sp(**LESS)), ("[{a lot more space} between the shapes]", sp(target=ALL, scale="2", **MORE)),
    ("[{much less space}] please", sp(scale="0.5", **LESS)), ("[{more space} between Start, Process and Check]", sp(target="Start,Process,Check", **MORE)), ("[{less space} between the boxes]", sp(target=mall(shape="rectangle"), **LESS)), ("[{condense} the diagram]", sp(target=ALL, **LESS)),
    ("[{more breathing room}] pls", sp(**MORE)), ("[{bigger gaps}] between the circles", sp(target=mall(shape="circle"), **MORE)), ("[{smaller gaps}]", sp(**LESS)), ("[{space} them {50 px apart}]", sp(distance="50")),
    ("[{spread} everything {out} a bit {more}]", sp(target=ALL, scale="1.25", **MORE)), ("[{make it tighter}]", sp(**LESS)), ("[{more space} betwen the shapes]", sp(target=ALL, **MORE)), ("[{les space}] pls", sp(**LESS)),
    ("[{give} everything {more room}]", sp(target=ALL, **MORE)), ("[{pack} them tighter]", sp(**LESS)),
]:
    add("respace", t, w, note={"[{les space}] pls": "typo 'les': not a cue word the Rules correct", "it's [{too crowded}], spread it out": "two phrasings of one request; one wire",
                               "[{too spread out}], pull it in": "'pull it in' restates the request; one wire", "[{too cramped}], more room pls": "one request said twice; one wire"}.get(t))

# ---------------------------------------------------------------- untangle / straighten / snap ----------------------------------------------------------------
U = lambda **kw: C(action="untangle", **kw)
for t, w in [
    ("[{untangle} the arrows]", U()), ("[{untangle} it]", U()), ("[{untangle} everything]", U(target=ALL)), ("[{fewer crossings}] pls", U()),
    ("[{reduce the crossings}]", U()), ("[{remove the crossings}]", U()), ("[{make} the lines {not cross}]", U()), ("[{make} the arrows {stop crossing}]", U()),
    ("[{fix} the {crossing} lines]", U()), ("[so the lines {don't cross}]", U()), ("[{no crossing} arrows] please", U()), ("[{minimize crossings}]", U()),
    ("[{untangle} the diagram]", U(target=ALL)), ("[{disentangle} the links]", U()), ("[{uncross} the lines]", U()), ("[{untagle} the arrows]", U()),
    ("[{untangle} the lines between Hub, Api and Db]", U(target="Hub,Api,Db")), ("[{avoid crossings}]", U()), ("the arrows are a mess, [{untangle} them]", U()), ("[{less crossings}] please", U()),
    ("[{make} the links {not overlap}]", U()), ("[{arrows overlap}, fix it]", U()), ("[{untangle} the whole thing]", U(target=ALL)), ("[{rearrange} to {reduce crossings}]", U()),
    ("[{get rid of} the {crossings}]", U()), ("[{untangle} the spaghetti]", U()), ("[{untangle} all of it]", U(target=ALL)), ("[{fix} the {tangled} arrows]", U()),
]:
    add("untangle", t, w, note="'make the links not overlap': the links overlap each other (crossings), not shapes" if "not overlap" in t else None)
ST = lambda **kw: C(action="straighten", **kw)
for t, w in [
    ("[{straighten} the arrows]", ST()), ("[{straighten} the lines]", ST()), ("[{straighten} everything]", ST(target=ALL)), ("[{make} the lines {straight}]", ST()),
    ("[{make} the arrows {straight}]", ST()), ("[{straighten} it {out}]", ST()), ("[{straighten} the links]", ST()), ("[{no diagonal} lines] pls", ST()),
    ("[{no more diagonal} arrows]", ST()), ("[{straighten} the connections]", ST()), ("[{straigten} the arrows]", ST()), ("[{straighten} the arrows] between Start and Done", ST(target="Start,Done")),
    ("[{make} all the lines {straight}]", ST()), ("[{straight} lines] please", ST()), ("[{straighten} the wonky arrows]", ST()), ("[{straighten} the diagram]", ST(target=ALL)),
    ("[{straighten} the lines between Hub and Api]", ST(target="Hub,Api")), ("[{straighten} out the arrows]", ST()), ("[{fix} the {slanted} lines]", ST()), ("[{make} the arrows {straight} again]", ST()),
    ("[{straighten} all the arrows]", ST()), ("[{straighten} up the links]", ST()), ("[{make} every line {straight}]", ST()), ("[{straighten} the crooked lines]", ST()),
    ("[{straighten} all of it]", ST(target=ALL)), ("[{make} the connectors {straight}]", ST()),
]:
    add("straighten", t, w, note="the arrows between Start and Done: the engine straightens the links at those shapes" if "between Start" in t else ("'fix the slanted lines': 'slanted' alone is not read" if "slanted" in t else None))
SN = lambda **kw: C(action="snap", **kw)
for t, w in [
    ("[{snap} to grid]", SN()), ("[{snap} everything to the grid]", SN(target=ALL)), ("[{snap} it to the grid]", SN()), ("[{snap to grid}] pls", SN()),
    ("[{align} everything to the grid]", SN(target=ALL)), ("[{put} everything on the grid]", SN(target=ALL)), ("[{snap} all shapes to the grid]", SN(target=ALL)), ("[{snap} the boxes to the grid]", SN(target=mall(shape="rectangle"))),
    ("[{snap} Start, Process and Check to the grid]", SN(target="Start,Process,Check")), ("[{snap} to a 20px grid]", SN(distance="20")), ("[{snap} everything to a 50 px grid]", SN(target=ALL, distance="50")), ("[{snap} them to the grid]", SN()),
    ("[{snpa} to grid]", SN()), ("[{snap} the circles to the grid]", SN(target=mall(shape="circle"))), ("[{line} everything {up} with the grid]", SN(target=ALL)), ("[{snap} to the grid] please", SN()),
    ("[{snap} the diagram to the grid]", SN(target=ALL)), ("[{snap} all of them to the grid]", SN(target=ALL)), ("[{move} everything onto the grid]", SN(target=ALL)), ("[{grid-snap} everything]", SN(target=ALL)),
    ("[{snap} positions to the grid]", SN()), ("[{snap} Hub and Api to the grid]", SN(target="Hub,Api")), ("[{snap} the stars to the grid]", SN(target=mall(shape="star"))), ("[{snap} every shape to the grid]", SN(target=ALL)),
    ("[{snap} to a 10 pixel grid]", SN(distance="10")),
]:
    add("snap", t, w, note={"[{snpa} to grid]": "typo 'snpa': too short for the Rules' spelling step", "[{line} everything {up} with the grid]": "'with the grid' (not to/on the grid)",
                            "[{grid-snap} everything]": "hyphenated verb"}.get(t))

# ---------------------------------------------------------------- equalize (the same size / colour / shape) ----------------------------------------------------------------
EQ = lambda **kw: C(action="equalize", **kw)
for t, w in [
    ("[{make} them all {the same size}]", EQ(target=ALL, property="size")), ("[{make} everything {the same size}]", EQ(target=ALL, property="size")), ("[{same size} for all] pls", EQ(target=ALL, property="size")), ("[{make} all the boxes {the same size}]", EQ(target=mall(shape="rectangle"), property="size")),
    ("[{make} the circles {the same size}]", EQ(target=mall(shape="circle"), property="size")), ("[{make} Start, Process and Check {the same size}]", EQ(target="Start,Process,Check", property="size")), ("[{make} everything {the same size as} Start]", EQ(target=ALL, property="size", anchor="Start")), ("[{make} all shapes {the same color}]", EQ(target=ALL, property="color")),
    ("[{make} them {the same colour}]", EQ(property="color")), ("[{make} everything {the same colour as} Hub]", EQ(target=ALL, property="color", anchor="Hub")), ("[{make} all of them {the same shape}]", EQ(target=ALL, property="shape")), ("[{make} the stars {the same size}]", EQ(target=mall(shape="star"), property="size")),
    ("[{equalize} the sizes]", EQ(property="size")), ("[{equalise} the sizes]", EQ(property="size")), ("[{unify} the colours]", EQ(property="color")), ("[{make} Api, Db and Cache {as big as} Hub]", EQ(target="Api,Db,Cache", property="size", anchor="Hub")),
    ("[{same size} please]", EQ(property="size")), ("[{make} everything {same size}]", EQ(target=ALL, property="size")), ("[{give} all the shapes {the same size}]", EQ(target=ALL, property="size")), ("[{set} everything to {the same size}]", EQ(target=ALL, property="size")),
    ("[{make} them {teh same size}]", EQ(property="size")), ("[{resize} them all to {the same size}]", EQ(target=ALL, property="size")), ("[{make} the boxes {the same size as} Login]", EQ(target=mall(shape="rectangle"), property="size", anchor="Login")), ("[{match} the {sizes}]", EQ(property="size")),
    ("[{make} all the circles {the same colour as} Start]", EQ(target=mall(shape="circle"), property="color", anchor="Start")), ("[{make} the outlines {the same}]", EQ(property="outline")), ("[{make} Ceo, Cto and Cfo {the same size}]", EQ(target="Ceo,Cto,Cfo", property="size")), ("[{same colour} for all the stars]", EQ(target=mall(shape="star"), property="color")),
    ("[{make} the diagram's shapes {the same size}]", EQ(target=ALL, property="size")),
]:
    add("equalize", t, w, note={"[{make} them {teh same size}]": "typo 'teh'", "[{make} the outlines {the same}]": "'the same' without a property noun after it: property from 'outlines'",
                                "[{make} the diagram's shapes {the same size}]": "possessive 'the diagram's shapes' = all shapes"}.get(t))

# ---------------------------------------------------------------- fit / centre ----------------------------------------------------------------
FIT = lambda **kw: C(action="fit", **kw)
for t, w in [
    ("[{fit} everything on the canvas]", FIT(target=ALL)), ("[{fit} it on the screen]", FIT()), ("[{make} everything {fit}]", FIT(target=ALL)), ("[{fit to canvas}]", FIT()),
    ("[{fit} the diagram to the page]", FIT(target=ALL)), ("[{bring} everything {back on the canvas}]", FIT(target=ALL)), ("[{bring} it all {into view}]", FIT(target=ALL)), ("[some shapes are {off the canvas}, fix that]", FIT(target=ALL)),
    ("[{center} the diagram]", FIT(target=ALL, position="center")), ("[{centre} everything]", FIT(target=ALL, position="center")), ("[{center} it]", FIT(position="center")), ("[{center} the whole thing]", FIT(target=ALL, position="center")),
    ("[{center the drawing}] on the canvas", FIT(target=ALL, position="center")), ("[{recenter}] pls", FIT(position="center")), ("[{centre} the diagram on the page]", FIT(target=ALL, position="center")), ("[{fit} all shapes on the canvas]", FIT(target=ALL)),
    ("[{fit} to screen]", FIT()), ("[{fit} everything in]", FIT(target=ALL)), ("[{center} everything on the canvas]", FIT(target=ALL, position="center")), ("[{fit} and {center} everything]", FIT(target=ALL, position="center")),
    ("[{fit} the drawing on the canvas]", FIT(target=ALL)), ("[{put} everything {back on the canvas}]", FIT(target=ALL)), ("[{centre} the layout]", FIT(position="center")), ("[{cetner} the diagram]", FIT(target=ALL, position="center")),
    ("[{fit} all of it on the page]", FIT(target=ALL)), ("[{make} it all {fit} on the screen]", FIT(target=ALL)), ("[{move} everything {into view}]", FIT(target=ALL)), ("[{center} the shapes]", FIT(target=ALL, position="center")),
    ("[{fit} Start, Process and Check on the canvas]", FIT(target="Start,Process,Check")), ("[{scale} it to {fit} the canvas]", FIT()),
]:
    add("fit", t, w, note={"[{cetner} the diagram]": "typo: 'cetner' is not corrected (not a cue word)", "[some shapes are {off the canvas}, fix that]": "the request is 'fix that'; the plural 'shapes' reads as all shapes (fit acts on the whole drawing anyway)",
                           "[{center} the shapes]": "'center the shapes' = the drawing centred, not each shape moved to the centre"}.get(t))

# ---------------------------------------------------------------- flip / mirror ----------------------------------------------------------------
FL = lambda **kw: C(action="flip", **kw)
for t, w in [
    ("[{flip} the diagram]", FL(target=ALL)), ("[{flip} it horizontally]", FL(axis="horizontal")), ("[{flip} everything vertically]", FL(target=ALL, axis="vertical")), ("[{mirror} it]", FL()),
    ("[{mirror} the diagram left to right]", FL(target=ALL, axis="horizontal")), ("[{flip} it upside down]", FL(axis="vertical")), ("[{turn} it {upside down}]", FL(axis="vertical")), ("[{flip} left and right]", FL(axis="horizontal")),
    ("[{flip} top and bottom]", FL(axis="vertical")), ("[{mirror} everything]", FL(target=ALL)), ("[{flip} Start, Process and Check horizontally]", FL(target="Start,Process,Check", axis="horizontal")), ("[{flip} the boxes vertically]", FL(target=mall(shape="rectangle"), axis="vertical")),
    ("[{flipp} it horizontally]", FL(axis="horizontal")), ("[{mirror} horizontally]", FL(axis="horizontal")), ("[{flip} it] pls", FL()), ("[{flip} the whole thing]", FL(target=ALL)),
    ("[{mirror} the drawing vertically]", FL(target=ALL, axis="vertical")), ("[{flip} it sideways]", FL(axis="horizontal")), ("[{flip} everything left to right]", FL(target=ALL, axis="horizontal")), ("[{flip} all of them]", FL(target=ALL)),
    ("[{mirror} the layout]", FL()), ("[{flip} the diagram top to bottom]", FL(target=ALL, axis="vertical")), ("[{flip} Hub, Api and Db]", FL(target="Hub,Api,Db")), ("[{mirror} image] of the diagram pls", FL(target=ALL)),
    ("[{flip} the circles horizontally]", FL(target=mall(shape="circle"), axis="horizontal")), ("[{flip} vertically]", FL(axis="vertical")),
]:
    add("flip", t, w, note="'flip': mirror the positions (not the arrows); with an arrow word it is reverse" if t == "[{flip} the diagram]" else ("typo 'flipp': too short for the Rules' spelling step" if "flipp" in t else None))

# ---------------------------------------------------------------- sort ----------------------------------------------------------------
SO = lambda **kw: C(action="sort", **kw)
for t, w in [
    ("[{sort} by name]", SO(property="name")), ("[{sort} them alphabetically]", SO(property="name")), ("[{sort} everything by name]", SO(target=ALL, property="name")), ("[{alphabetize}]", SO(property="name")),
    ("[{alphabetize} the shapes]", SO(target=ALL, property="name")), ("[{sort} by colour]", SO(property="color")), ("[{sort} by color]", SO(property="color")), ("[{sort} by size]", SO(property="size")),
    ("[{sort} by size, biggest first]", SO(property="size", superlative="biggest")), ("[{sort} them by size, smallest first]", SO(property="size", superlative="smallest")), ("[{order} them by size]", SO(property="size")), ("[{order} the shapes by name]", SO(target=ALL, property="name")),
    ("[{sort} the boxes alphabetically]", SO(target=mall(shape="rectangle"), property="name")), ("[{sort} by shape]", SO(property="shape")), ("[{sort} by label]", SO(property="label")), ("[{sort} alphabetically in a row]", SO(property="name", layout="row")),
    ("[{sort} by size in a column]", SO(property="size", layout="column")), ("[{sort} Start, Process, Check and Done by name]", SO(target="Start,Process,Check,Done", property="name")), ("[{srot} by name]", SO(property="name")), ("[{sort} the circles by size]", SO(target=mall(shape="circle"), property="size")),
    ("[{arrange} them {alphabetically}]", SO(property="name")), ("[{put} them in {alphabetical} order]", SO(property="name")), ("[{order} everything {biggest first}]", SO(target=ALL, property="size", superlative="biggest")), ("[{line up} by size]", SO(property="size")),
    ("[{sort} the stars by colour]", SO(target=mall(shape="star"), property="color")), ("[{sort} by name A to Z]", SO(property="name")), ("[{rank} them by size]", SO(property="size")), ("[{sort} all of them by colour]", SO(target=ALL, property="color")),
    ("[{sort} everything by size in a grid]", SO(target=ALL, property="size", layout="grid")),
]:
    add("sort", t, w, note={"[{srot} by name]": "typo 'srot': too short for the Rules' spelling step", "[{alphabetize}]": "alphabetize = by name"}.get(t))

# ---------------------------------------------------------------- group by (cluster by colour / kind) ----------------------------------------------------------------
GB = lambda **kw: C(action="groupBy", **kw)
for t, w in [
    ("[{group} them {by colour}]", GB(property="color")), ("[{group} everything {by color}]", GB(target=ALL, property="color")), ("[{cluster} by colour]", GB(property="color")), ("[{cluster} the shapes by color]", GB(target=ALL, property="color")),
    ("[{put} the {same colours together}]", GB(property="color")), ("[{keep} the {same colours together}]", GB(property="color")), ("[{group} {by shape}]", GB(property="shape")), ("[{cluster} by kind]", GB(property="shape")),
    ("[{group} the shapes {by type}]", GB(target=ALL, property="shape")), ("[{arrange} {by colour}]", GB(property="color")), ("[{arrange} everything {by color}]", GB(target=ALL, property="color")), ("[{organize} {by shape}]", GB(property="shape")),
    ("[{gather} them {by colour}]", GB(property="color")), ("[{cluster} by size]", GB(property="size")), ("[{group} the circles {by colour}]", GB(target=mall(shape="circle"), property="color")), ("[{clsuter} by colour]", GB(property="color")),
    ("[{group} {by colour}] please", GB(property="color")), ("[{lay out} {by colour}]", GB(property="color")), ("[{bunch} them {by color}]", GB(property="color")), ("[{group} all of them {by shape}]", GB(target=ALL, property="shape")),
    ("[{put} {colours together}]", GB(property="color")), ("[{cluster} the diagram by colour]", GB(target=ALL, property="color")), ("[{organise} the shapes {by colour}]", GB(target=ALL, property="color")), ("[{group} Start, Process, Check and Done {by colour}]", GB(target="Start,Process,Check,Done", property="color")),
    ("[{cluster}] them", GB()), ("[{collect} the shapes {by kind}]", GB(target=ALL, property="shape")),
]:
    add("groupBy", t, w, note={"[{group} them {by colour}]": "ambiguous with the groups feature: 'group ... by <property>' re-lays out (no named group is made)",
                               "[{clsuter} by colour]": "typo 'clsuter': not a cue word the Rules correct", "[{cluster}] them": "no property: the engine clusters by colour"}.get(t))

# ---------------------------------------------------------------- reverse arrows ----------------------------------------------------------------
RV = lambda **kw: C(action="reverse", **kw)
for t, w in [
    ("[{reverse} the arrow from Check to Done]", RV(**{"from": "Check", "to": "Done"})), ("[{reverse} the Check→Done arrow]", RV(**{"from": "Check", "to": "Done"})), ("[{flip} the arrow between Start and Process]", RV(**{"from": "Start", "to": "Process"})), ("[{reverse} all the arrows]", RV(quantifier="all")),
    ("[{reverse} the arrows]", RV()), ("[{flip} the arrows]", RV()), ("[{turn} the arrow from Api to Db {around}]", RV(**{"from": "Api", "to": "Db"})), ("[{make} the arrow from Hub to Web {point the other way}]", RV(**{"from": "Hub", "to": "Web"})),
    ("[{reverse} the direction of the arrow from Login to Home]", RV(**{"from": "Login", "to": "Home"})), ("[{reverse} the link Cart-Pay]", RV(**{"from": "Cart", "to": "Pay"})), ("[the arrow from Check to Done should {go the other way}]", RV(**{"from": "Check", "to": "Done"})), ("[{flip} the direction] of the Process->Check arrow", RV(**{"from": "Process", "to": "Check"})),
    ("[{reverse} every arrow]", RV(quantifier="all")), ("[{flip} all the arrows]", RV(quantifier="all")), ("[{revese} the arrow from Start to Process]", RV(**{"from": "Start", "to": "Process"})), ("[{reverse} the arrows at Hub]", RV(target="Hub")),
    ("[{switch the direction} of the arrow from Api to Cache]", RV(**{"from": "Api", "to": "Cache"})), ("[{reverse} the connection between Router and Lan]", RV(**{"from": "Router", "to": "Lan"})), ("[{flip} the Start-Process arrow]", RV(**{"from": "Start", "to": "Process"})), ("[{turn} all the arrows {around}]", RV(quantifier="all")),
    ("[{reverse} the line from Queue to Worker]", RV(**{"from": "Queue", "to": "Worker"})), ("[the arrow between Idea and Plan points {backwards}, flip it]", RV(**{"from": "Idea", "to": "Plan"})), ("[{reverse} each arrow]", RV(quantifier="all")), ("[{invert} the arrows]", RV()),
    ("[{reverse} the arrow Process→Check]", RV(**{"from": "Process", "to": "Check"})), ("[{flip} arrow direction] Check to Done", RV(**{"from": "Check", "to": "Done"})), ("[arrow from Check to Done {backwards}] pls", RV(**{"from": "Check", "to": "Done"})), ("[{reverse} the arrows from Hub]", RV(**{"from": "Hub"})),
]:
    add("reverse", t, w, note={"[{reverse} the arrows at Hub]": "the arrows touching Hub", "[the arrow from Check to Done should {go the other way}]": "no verb cue: 'go the other way'",
                               "[{flip} arrow direction] Check to Done": "the ends are outside the span the Rules read",
                               "[the arrow between Idea and Plan points {backwards}, flip it]": "one request said twice; one wire"}.get(t))

# ---------------------------------------------------------------- restyle existing arrows ----------------------------------------------------------------
def RS(**kw): return C(action="set", **kw)
F_ = lambda a, b: {"from": a, "to": b}
for t, w in [
    ("[{make} the arrow from Start to Process dashed]", RS(**F_("Start", "Process"), style="dashed")), ("[Process-Check line {red}]", RS(**F_("Process", "Check"), color="red")), ("[{make} the arrow from Check to Done red]", RS(**F_("Check", "Done"), color="red")), ("[{make} all arrows red]", RS(kind="edge", quantifier="all", color="red")),
    ("[{make} the arrows dashed]", RS(kind="edge", style="dashed")), ("[{make} every line dotted]", RS(kind="edge", quantifier="all", style="dotted")), ("[{change} all connections to dashed]", RS(kind="edge", quantifier="all", style="dashed")), ("[{color} the arrow from Hub to Api blue]", RS(**F_("Hub", "Api"), color="blue")),
    ("[{make} the arrow between Start and Done two-way]", RS(**F_("Start", "Done"), arrow="both")), ("[{remove the arrowhead} from the Start to Process arrow]", RS(**F_("Start", "Process"), arrow="none")), ("[{make} the line from Api to Db plain, no arrowhead]", RS(**F_("Api", "Db"), arrow="none")), ("[{make} the Start→Process arrow thicker]", C(action="resize", **F_("Start", "Process"))),
    ("[{make} the arrow from Start to Process thick and blue]", RS(**F_("Start", "Process"), size="large", color="blue")), ("[{make} the lines thinner]", C(action="resize", kind="edge")), ("[{paint} all the arrows gray]", RS(kind="edge", quantifier="all", color="gray")), ("[{make} the connections grey]", RS(kind="edge", color="gray")),
    ("[{set} the arrow from Login to Home to dotted]", RS(**F_("Login", "Home"), style="dotted")), ("[Check→Done arrow {dashed}]", RS(**F_("Check", "Done"), style="dashed")), ("[{make} the link between Cart and Pay solid]", RS(**F_("Cart", "Pay"), style="solid")), ("[{make} the arrow from Ceo to Cfo two-way]", RS(**F_("Ceo", "Cfo"), arrow="both")),
    ("[{make} all the lines black]", RS(kind="edge", quantifier="all", color="black")), ("[{turn} the arrow from Hub to Web green]", RS(**F_("Hub", "Web"), color="green")), ("[{make} the arrows between Api and Cache bidirectional]", RS(**F_("Api", "Cache"), arrow="both")), ("[{remove the arrowheads}]", RS(kind="edge", arrow="none")),
    ("[{remove} all {arrowheads}]", RS(kind="edge", quantifier="all", arrow="none")), ("[{make} the arrow from Plan to Build dashed and orange]", RS(**F_("Plan", "Build"), style="dashed", color="orange")), ("[{make} the Router-Lan link dotted]", RS(**F_("Router", "Lan"), style="dotted")), ("[{dash} the line from Queue to Worker]", RS(**F_("Queue", "Worker"), style="dashed")),
    ("[{make} the arrow from Start to Done thiker]", C(action="resize", **F_("Start", "Done"))), ("[{make} the arrows bolder]", C(action="resize", kind="edge")), ("[Start-Process arrow {blue}] pls", RS(**F_("Start", "Process"), color="blue")), ("[{colour} the connections purple]", RS(kind="edge", color="purple")),
    ("[{make} every arrow solid]", RS(kind="edge", quantifier="all", style="solid")), ("[{change} the line between Idea and Plan to red]", RS(**F_("Idea", "Plan"), color="red")), ("[{make} the arrow from Mars to Venus one-way]", RS(**F_("Mars", "Venus"), arrow="forward")), ("[{add an arrowhead} to the line from Alpha to Beta]", RS(**F_("Alpha", "Beta"), arrow="forward")),
    ("[{make} the arrow from Check to Done very thick]", RS(**F_("Check", "Done"), size="huge")), ("[{make} the arrows thin]", RS(kind="edge", size="small")), ("[{make} the dashed arrow from Api to Db solid]", RS(**F_("Api", "Db"), style="solid")), ("[{recolor} all the links teal]", RS(kind="edge", quantifier="all", color="teal")),
]:
    add("restyle", t, w, note={"[{dash} the line from Queue to Worker]": "'dash' as a verb: no verb cue", "[{make} the arrow from Start to Done thiker]": "typo 'thiker'",
                               "[{make} the dashed arrow from Api to Db solid]": "two styles in the text: the new one is 'solid'; the old one describes the arrow",
                               "[{make} the Start→Process arrow thicker]": "thickness needs an edge width in ui.js (proposed)"}.get(t))

# ---------------------------------------------------------------- two requests ----------------------------------------------------------------
for t, ws in [
    ("[{arrange} everything as a tree] then [{make} Ceo red]", [T(target=ALL), C(action="set", target="Ceo", color="red")]),
    ("[{tidy up}] and [{make} the arrows dashed]", [imp(), RS(kind="edge", style="dashed")]),
    ("[{arrange} as a tree with Ceo at the top], then [{make} Ceo gold]", [T(anchor="Ceo"), C(action="set", target="Ceo", color="gold")]),
    ("[{clean up} the diagram] and then [{center} it]", [imp(target=ALL), FIT(target=ALL, position="center")]),
    ("[{arrange} in layers left to right] then [{straighten} the arrows]", [Y(direction="right"), ST()]),
    ("[{make} all the boxes {the same size}] and [{line up} the tops]", [EQ(target=mall(shape="rectangle"), property="size"), AE("up")]),
    ("[{reverse} the arrow from Check to Done] and [{make} it red]", [RV(**{"from": "Check", "to": "Done"}), RS(**F_("Check", "Done"), color="red")]),
    ("[{radial layout} around Hub], then [{make} Hub bigger]", [R(anchor="Hub"), C(action="resize", target="Hub")]),
    ("[{group} the shapes {by colour}] and [{tidy up}]", [GB(target=ALL, property="color"), imp()]),
    ("[{sort} by name in a row], then [{snap} to grid]", [SO(property="name", layout="row"), SN()]),
    ("[{more space} between the shapes] and [{fit} everything on the canvas]", [sp(target=ALL, **MORE), FIT(target=ALL)]),
    ("[{untangle} the arrows] then [{tidy up}]", [U(), imp()]),
    ("[{delete} Cache] and [{tidy up}]", [C(action="delete", target="Cache"), imp()]),
    ("[{draw} a red circle named Log] then [{arrange} everything in a grid]", [C(action="create", shape="circle", color="red", name="Log"), G(target=ALL)]),
    ("[{connect} Api to Db] and [{arrange} as a tree]", [C(action="connect", **F_("Api", "Db")), T()]),
    ("[{arrange} everything in a circle] then [{make} the arrows gray]", [CI(target=ALL), RS(kind="edge", color="gray")]),
    ("[{flip} the diagram horizontally] and [{center} it]", [FL(target=ALL, axis="horizontal"), FIT(target=ALL, position="center")]),
    ("[{less space}] and [{align} everything to the left]", [sp(**LESS), AE("left", target=ALL)]),
    ("[{make} the arrow from Start to Process dashed] and [the one from Process to Check {dotted}]", [RS(**F_("Start", "Process"), style="dashed"), RS(**F_("Process", "Check"), style="dotted")]),
    ("[{tidy up}], then [{how many} arrows are there]?", [imp(), Q(ask="count", kind="edge")]),
    ("[{arrange} as an org chart] and [{paint} the boxes blue]", [T(), C(action="set", target=mall(shape="rectangle"), color="blue")]),
    ("[{organic layout}] then [{snap} everything to the grid]", [O(), SN(target=ALL)]),
    ("[{straighten} the lines] and [{make} them black]", [ST(), RS(kind="edge", color="black")]),
    ("[{arrange} Start, Process and Check in a row] and [{connect} them in a chain]", [RW(target="Start,Process,Check"), C(action="connect", **{"from": "Start,Process,Check"}, pairing="chain")]),
    ("[{tidy} this {up}] and [{undo} if it looks worse]", [imp(), C(action="undo")]),
    ("[{arrange} as a tree left to right] then [{fit} it on the screen]", [T(direction="right"), FIT()]),
    ("[{make} everything {the same size}] then [{arrange} in a grid]", [EQ(target=ALL, property="size"), G()]),
    ("[{reverse} all the arrows] and [{arrange} in layers]", [RV(quantifier="all"), Y()]),
    ("[{remove the arrowheads}] and [{straighten} the lines]", [RS(kind="edge", arrow="none"), ST()]),
    ("[{compact} the layout] then [{move} Legend to the bottom right]", [sp(**LESS), C(action="move", target="Legend", position="bottomRight")]),
    ("[{arrange} radially with Hub in the middle] and [{make} the lines thin]", [R(anchor="Hub"), RS(kind="edge", size="small")]),
    ("[{sort} by colour] and then [{align} them horizontally]", [SO(property="color"), C(action="align", axis="horizontal")]),
    ("[{clean up}], [{snap} to grid] and [{center} everything]", [imp(), SN(), FIT(target=ALL, position="center")]),
    ("[{tidy up} the diagram] but [keep Start {at the top}]", [imp(target=ALL), C(action="move", target="Start", position="top")]),
    ("[{arrange} everything as a tree] and [{color} the arrow from Ceo to Cto red]", [T(target=ALL), RS(**F_("Ceo", "Cto"), color="red")]),
    ("[{flip} it upside down] then [{tidy up}]", [FL(axis="vertical"), imp()]),
    ("[{spread} them {out more}] and [{make} them all {the same size}]", [sp(**MORE), EQ(target=ALL, property="size")]),
    ("[{untangle} it] and [{make} the arrow from Api to Db dashed]", [U(), RS(**F_("Api", "Db"), style="dashed")]),
    ("[{group} {by shape}] then [{arrange} each... no, just {tidy up}]", [GB(property="shape"), imp()]),
    ("[{arrange} in layers] and [{make} the arrow from Check to Start dotted, it's the loop back]", [Y(), RS(**F_("Check", "Start"), style="dotted")]),
]:
    add("combo", t, *ws, note={"[{tidy up} the diagram] but [keep Start {at the top}]": "'keep X at the top' after a re-layout: a move after the improve; the engine runs them in order",
                               "[{group} {by shape}] then [{arrange} each... no, just {tidy up}]": "self-correction: the second request is improve",
                                                              "[{make} the arrow from Start to Process dashed] and [the one from Process to Check {dotted}]": "ellipsis: the second request has no verb"}.get(t))

# ---------------------------------------------------------------- write ----------------------------------------------------------------
def parse(text):
    """'[{tidy} this up] pls' -> (plain text, [(span, trigger)]); a trigger of several {..} pieces is the stretch from the first to the last"""
    plain, res, cur = "", [], None
    for c in text:
        if c == "[": cur = {"s": len(plain), "t": []}; continue
        if c == "]": cur["e"] = len(plain); res.append(cur); continue
        if c == "{": cur["t"].append([len(plain), None]); continue
        if c == "}": cur["t"][-1][1] = len(plain); continue
        plain += c
    out = []
    for r_ in res:
        if not r_["t"]: raise ValueError("no trigger: " + text)
        out.append((plain[r_["s"]:r_["e"]], plain[r_["t"][0][0]:r_["t"][-1][1]]))
    return plain, out

rows, seen = [], set()
for k, (op, text, ws, note) in enumerate(L):
    plain, spans = parse(text)
    key = re.sub(r"[^a-z0-9]+", " ", plain.lower()).strip()
    if key in seen: raise ValueError("duplicate: " + plain)
    seen.add(key)
    if len(spans) != len(ws): raise ValueError(f"spans {len(spans)} != wires {len(ws)}: {text}")
    gold = []
    for (span, trig), w in zip(spans, ws):
        gold.append({"span": span, "trigger": trig, "type": w["type"], "args": w["args"]})
    names = [n for n in POOL if re.search(r"\b" + n + r"\b", plain)]
    names += [n for n in ["Legend", "Log"] if n == "Legend" and "Legend" in plain]
    extra = [n for n in POOL if n not in names][(k * 7) % 20:(k * 7) % 20 + 3]
    rows.append({"id": f"ops-{k + 1:04d}", "domain": "generic", "names": names + extra, "text": plain, "gold": gold, "op": op, "note": note})
with open(os.path.join(HERE, "formulations_texts.jsonl"), "w") as f:
    for r in rows: f.write(json.dumps({"id": r["id"], "text": r["text"]}, ensure_ascii=False) + "\n")
with open(os.path.join(HERE, "formulations.jsonl"), "w") as f:
    for r in rows: f.write(json.dumps({k: v for k, v in r.items() if not (k == "note" and v is None)}, ensure_ascii=False) + "\n")
import collections
c = collections.Counter(r["op"] for r in rows)
print(len(rows), "lines;", dict(sorted(c.items())))
