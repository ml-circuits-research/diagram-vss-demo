#!/usr/bin/env python3
"""cue_counts.py: how often each cue word of the Rules reader occurs in the synthetic data, counted on the TEXT (not on the generator's tags):
a cue counts once per request span that contains it (whole words, case-insensitive) AND whose gold carries the value the cue stands for
(an action verb: the span's trigger is the cue and the wire's act is that action). Cues: the legend's values and cue words
(rules_inventory.mjs) plus the formalizer's own hard-coded cue lists (logic.js line numbers in RULES_COVERAGE.md).
Run: python3 training/sketch/synth/cue_counts.py [folder ...]   (default llm_train/synth_rules llm_train/synth_rules_ops) -> JSON on stdout,
     --md: a Markdown table (value, cue, count), --min N: list only the cues counted fewer than N times."""
import glob, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__)); SK = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import pin_logic   # the same copy of logic.js as gen_rules_cover.py (committed HEAD unless LOGIC_JS / LOGIC_REV say otherwise)
LEG = json.loads(subprocess.run(["node", os.path.join(HERE, "rules_inventory.mjs")], capture_output=True, text=True, check=True).stdout)["legend"]

def legend_cues(key, skip=()):
    return {v: [v] + c for v, c in LEG[key]["values"].items() if v not in skip}

# the formalizer's own cue words, beside the legend's (logic.js 1225-1676; RULES_COVERAGE.md lists the lines)
FORMALIZER = {
    "position": {"leftOf": ["left of", "to the left of", "on the left of", "left side of"], "rightOf": ["right of", "to the right of", "on the right of", "right side of"],
                 "above": ["above", "over", "on top of"], "below": ["below", "under", "underneath", "beneath"],
                 "near": ["next to", "near", "beside", "close to", "by", "alongside", "around"], "between": ["between"],
                 "topLeft": ["top left", "top-left", "upper left", "upper-left"], "topRight": ["top right", "top-right", "upper right", "upper-right"],
                 "bottomLeft": ["bottom left", "bottom-left", "lower left", "lower-left"], "bottomRight": ["bottom right", "bottom-right", "lower right", "lower-right"],
                 "center": ["center", "centre", "middle"], "top": ["top"], "bottom": ["bottom"], "left": ["left"], "right": ["right"]},
    "direction": {"left": ["left"], "right": ["right"], "up": ["up", "upwards"], "down": ["down", "downwards"]},
    "style": {"dashed": ["dashed", "dash"], "dotted": ["dotted"]},   # the legend's "dot" (dotted) is not read by the formalizer (logic.js 1629): not counted
    "arrow": {"both": ["two-way", "two way", "bidirectional", "both ways", "double-headed", "two headed"], "none": ["line", "lines", "plain", "undirected", "without an arrow", "without arrows"]},
    "pairing": {"chain": ["in a chain", "one after the other", "one after other", "in sequence", "in order"], "next": ["to the next", "to the next one", "each to the next"],
                "all": ["all to each other", "every pair", "to each other"]},
    "axis": {"horizontal": ["horizontally", "horizontal", "in a row"], "vertical": ["vertically", "vertical", "in a column", "column"]},
    "layout": {"row": ["row", "line", "horizontally"], "column": ["column", "stack", "vertically"], "grid": ["grid", "tidy"], "circle": ["circle", "ring"]},
    "superlative": {"biggest": ["biggest", "largest"], "smallest": ["smallest", "tiniest"], "leftmost": ["leftmost"], "rightmost": ["rightmost"], "topmost": ["topmost", "highest"],
                    "bottommost": ["bottommost", "lowest"], "closest": ["closest", "nearest"], "farthest": ["farthest", "furthest"],
                    "mostConnected": ["most connections", "most links", "most edges", "most arrows", "most connected"],
                    "leastConnected": ["fewest connections", "least connections", "fewest links", "fewest arrows", "least connected"]},
    "comparison": {"bigger": ["bigger than", "larger than"], "smaller": ["smaller than"]},
    "recency": {"newest": ["new", "newest", "last", "latest", "most recent"], "oldest": ["first", "oldest", "earliest"]},
    "quantifier": {"all": ["all", "every", "each", "everything"]},
    "property": {"color": ["color", "colour"], "size": ["size", "how big", "how large", "how small"], "shape": ["shape"], "label": ["label", "text", "say"],
                 "position": ["where", "position", "location"]},
    "kind": {"edge": ["arrows", "connections", "links", "edges", "lines"], "group": ["groups"]},
}
ASK_CUES = {"count": ["how many", "count", "number of"], "exists": ["is there", "are there", "are any", "any"], "list": ["list", "which", "show", "what"],
            "property": ["what color", "what colour", "where", "how big", "how large", "how small", "what size", "what shape", "what does", "label", "position", "location"],
            "check": ["is", "bigger than", "smaller than"], "describe": ["describe", "summarize", "summarise", "overview", "tell me about", "what's on", "what is on"],
            "neighbors": ["connected to", "linked to", "attached to", "joined to", "connect to", "link to", "neighbours", "neighbors", "connections"],
            "connected": ["connected", "linked", "attached", "joined", "connect to", "link to"], "degree": ["how many connections", "how many links", "how many arrows", "how many lines", "how many edges", "how many neighbours", "how many neighbors"],
            "path": ["path", "route", "get from", "reachable", "reach", "lead to", "go from", "flow to"],
            "reachable": ["reached", "reachable", "reach", "go from", "downstream", "get to"], "cycle": ["cycle", "cycles", "loop", "loops", "circular"],
            "rules": ["rules", "defaults"], "extreme": ["biggest", "largest", "smallest", "tiniest", "leftmost", "rightmost", "topmost", "highest", "lowest", "bottommost", "most", "fewest", "least"],
            "nearest": ["closest", "nearest", "farthest", "furthest"], "members": ["what is in", "contain", "members", "who is in", "which shapes are in"],
            "groupOf": ["which group", "what group", "belong to", "in a group"]}
RULE_OPEN = ["from now on", "by default", "in the future", "in future", "henceforth", "going forward", "always", "should be", "must be", "will be"]

def has(span, cue): return re.search(r"(?<![\w-])" + re.escape(cue) + r"(?![\w-])", span, re.I) is not None

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    md, mn = "--md" in sys.argv, None
    if "--min" in sys.argv: mn = int(sys.argv[sys.argv.index("--min") + 1]); args = [a for a in args if a != str(mn)]
    dirs = args or ["llm_train/synth_rules", "llm_train/synth_rules_ops"]
    W = []
    for d in dirs:
        for f in sorted(glob.glob(os.path.join(SK, d, "msg_*.jsonl"))):
            for l in open(f, encoding="utf8"):
                if l.strip():
                    for w in json.loads(l)["wires"]: W.append(w)
    out = counts(W)
    if md:
        print("| question | value | cue: requests |"); print("|---|---|---|")
        for q, vals in out.items():
            for v, cs in vals.items(): print(f"| {q} | {v} | " + ", ".join(f"{c}: {n}" for c, n in cs.items()) + " |")
    elif mn is not None:
        for q, vals in out.items():
            for v, cs in vals.items():
                for c, n in cs.items():
                    if n < mn: print(f"{n:4d}  {q} {v} '{c}'")
    else: print(json.dumps(out, indent=1))

def counts(W):
    """{question: {value: {cue: number of request spans}}} over the wires W"""
    out = {}
    def add(q, v, cue, n): out.setdefault(q, {}).setdefault(v, {})[cue] = n
    def val_in(w, q, v):
        a = json.dumps(w["args"]).lower(); v = v.lower()
        if q == "notColor": return f'"notcolor": "{v}"' in a or f"notcolor={v}" in a
        return f'"{q.lower()}": "{v}"' in a or f"{q.lower()}={v}" in a or f'"{q.lower()}": "{v},' in a
    for q in ("shape", "color", "size"):
        for v, cues in legend_cues(q, skip=("any",)).items():
            for c in cues: add(q, v, c, sum(1 for w in W if has(w["span"], c) and val_in(w, q, v)))
    for c in LEG["shape"]["values"]["any"]: add("shape", "any", c, sum(1 for w in W if has(w["span"], c)))
    for v in LEG["color"]["values"]: add("notColor", v, f"not {v}", sum(1 for w in W if (has(w["span"], "not " + v) or has(w["span"], "non-" + v) or has(w["span"], "aren't " + v)) and val_in(w, "notColor", v)))
    for q, vals in FORMALIZER.items():
        for v, cues in vals.items():
            for c in cues: add(q, v, c, sum(1 for w in W if has(w["span"], c) and val_in(w, q, v)))
    for act, cues in LEG["action"]["values"].items():
        for c in cues:
            gapped = lambda w: c == "put together" and has(w["span"], "put") and has(w["span"], "together")
            add("action", act, c, sum(1 for w in W if w["type"] == "command" and w["args"].get("action") == act and (w["trigger"].lower() == c or gapped(w))))
    for ask, cues in ASK_CUES.items():
        for c in cues: add("ask", ask, c, sum(1 for w in W if w["type"] == "question" and w["args"].get("ask") == ask and has(w["span"], c)))
    for c in RULE_OPEN: add("rule", "rule", c, sum(1 for w in W if w["type"] == "rule" and has(w["span"], c)))
    add("fact", "fact", "is / are", sum(1 for w in W if w["type"] == "fact"))
    return out

def low(out, n, skip=()):
    """[(question, value, cue)] counted fewer than n times"""
    return [(q, v, c) for q, vals in out.items() for v, cs in vals.items() for c, k in cs.items() if k < n and c not in skip]

if __name__ == "__main__":
    main()
