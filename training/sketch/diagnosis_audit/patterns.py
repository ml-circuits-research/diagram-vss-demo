# patterns.py: counts of the constructions the label sample flagged, over the dev file and all of sonnet_msg2 + haiku_msg2.
# python3 -I patterns.py
import json, glob, re
from collections import Counter, defaultdict
T = "/home/claude/diagram-vss-demo/training/sketch/llm_train"
def rows(p): return [json.loads(l) for l in open(p) if l.strip()]
SETS = {"dev": rows("/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/review/dev.jsonl"),
        "sonnet_msg2": [r for f in sorted(glob.glob(T + "/sonnet_msg2/*.jsonl")) for r in rows(f)],
        "haiku_msg2": [r for f in sorted(glob.glob(T + "/haiku_msg2/*.jsonl")) for r in rows(f)]}
act = lambda w: w["type"] + ":" + (w["args"].get("action") or w["args"].get("ask") or "")
split = lambda s: [x for x in re.split(r",(?![^(]*\))", str(s)) if x]
out = {}
for name, R in SETS.items():
    P = defaultdict(list)
    for r in R:
        names = r.get("names", [])
        for j, w in enumerate(r["wires"]):
            a, sp = w["args"], w["span"]
            # 1 "line" without "plain/no arrow": the gold writes no arrow key; logic.js:561 lists "line" as a cue of arrow=none
            if a.get("action") == "connect" and re.search(r"\blines?\b", sp, re.I) and not re.search(r"plain|arrowhead|no arrow|without arrow|undirected|two.way|both ways", sp, re.I):
                P["1 connect '... line' -> arrow=" + str(a.get("arrow"))].append((r["id"], sp))
            # 2 "is X the <superlative>?" questions
            m = re.search(r"\b(top|bottom|left|right)most\b|\b(biggest|smallest|largest|highest|lowest)\b", sp, re.I)
            if w["type"] == "question" and m and re.match(r"^\s*(and\s+)?(is|are)\b", sp, re.I):
                P["2 'is X the -most' -> " + act(w) + (" position=" + a["position"] if "position" in a else "")].append((r["id"], sp))
            # 3 "what is next to X" -> neighbors or list near
            if w["type"] == "question" and re.search(r"\bnext to\b|\bbeside\b", sp, re.I):
                P["3 question 'next to/beside' -> " + act(w) + (" position=" + a.get("position", "") if a.get("position") else "")].append((r["id"], sp))
            # 4 single-shape questions with several targets (logic.js uses only the first: check :699/:839, property is fine, degree :737, neighbors :721, connected :731)
            if w["type"] == "question" and a.get("ask") in ("check", "degree", "neighbors", "nearest", "describe", "property") and len(split(a.get("target", ""))) >= 2:
                P["4 " + act(w) + " with >=2 targets"].append((r["id"], sp, a.get("target")))
            # 5 mentions with quantifier=all and no shape / colour / notcolor filter (match every shape on the canvas)
            for k, v in a.items():
                for mm in re.findall(r"mention\(([^)]*)\)", str(v)):
                    ks = dict(x.split("=") for x in mm.split(",") if "=" in x)
                    if ks.get("quantifier") == "all" and not ({"shape", "color", "notcolor"} & set(ks)) and not re.search(r"\b(everything|all|every|each|whole)\b", sp, re.I):
                        P["5 mention(all) matching every shape, text does not say all/everything"].append((r["id"], sp, v))
                    if "recency" in ks and "quantifier" in ks:
                        P["5b mention with both quantifier and recency"].append((r["id"], sp, v))
            # 6 "X is / goes / ... <canvas place or relation>" statements: move or fact
            if re.match(r"^\s*(the\s+)?[A-Z]\w*(\s+\w+)?\s+(is|are)\s+(on|at|in|to|above|below|under|left|right|near|next|between)\b", sp):
                P["6 'X is <place>' -> " + act(w)].append((r["id"], sp))
            # 7 a conditional ("if ...") request labelled as a plain command
            if re.search(r"\bif\b", sp, re.I) and w["type"] == "command":
                P["7 conditional span labelled command:" + a.get("action", "")].append((r["id"], sp))
            # 8 undo / redo with an earlier command wire in the same message (the editor's undo reverts the previous TURN: see AUDIT.md)
            if a.get("action") in ("undo", "redo") and any(x["type"] == "command" and x["args"].get("action") not in ("undo", "redo") for x in r["wires"][:j]):
                P["8 " + a["action"] + " after a command of the same message"].append((r["id"], sp))
            # 9 chain / next whose order in the text differs from canvas order (logic.js:568 sorts the list by creation order)
            if a.get("action") == "connect" and (a.get("pairing") in ("chain", "next") or ("to" not in a and len(split(a.get("from", ""))) > 1 and not a.get("pairing"))):
                fr = split(a.get("from", ""))
                idx = [names.index(x) if x in names else (1000 + j if x == "$new" else None) for x in fr]
                if None not in idx and idx != sorted(idx):
                    P["9 chain/next whose text order != canvas creation order"].append((r["id"], sp, a["from"]))
            # 10 pronoun "them/they/it" for shapes created in this message written as mention(...) (convention: $new)
            if re.search(r"\b(them|they|it)\b", sp, re.I) and any("mention(" in str(v) for v in a.values()) and any(x["args"].get("action") in ("create", "duplicate") for x in r["wires"][:j]):
                P["10 pronoun after a create of this message written as mention (convention: $new)"].append((r["id"], sp, {k: v for k, v in a.items() if "mention(" in str(v)}))
    out[name] = P
    print(f"\n== {name}: {len(R)} messages, {sum(len(r['wires']) for r in R)} wires")
    for k in sorted(P): print(f"  {len(P[k]):4d}  {k}   e.g. {P[k][0]}")
json.dump({n: {k: v for k, v in P.items()} for n, P in out.items()}, open("/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/audit/patterns.json", "w"), indent=1)
