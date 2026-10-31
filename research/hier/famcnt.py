import json, sys, collections
FAM9 = {"W1 place": ["create", "move"], "W2 object-only": ["degree", "delete", "describe", "duplicate", "label", "neighbors", "property", "rename", "swap", "toBack", "toFront"],
        "W3 attributes": ["check", "fact", "rule", "set"], "W4 layout": ["align", "arrange", "distribute", "resize"], "W5 connect": ["connect"],
        "W6 graph": ["disconnect", "path", "reachable"], "W7 no-role": ["cycle", "forget", "redo", "undo"], "W8 scene sets": ["connected", "count", "exists", "list"],
        "W9 superlatives": ["extreme", "nearest"]}
E2F = {e: f for f, es in FAM9.items() for e in es}
def gold_ev(w):
    a = w["args"]; t = w["type"]
    return a.get("action") if t == "command" else ({"rules": "list"}.get(a.get("ask"), a.get("ask")) if t == "question" else t)
files = sys.argv[1:]; tab = {}
for f in files:
    c = collections.Counter(); per_msg = collections.Counter()
    for l in open(f):
        m = json.loads(l); fams = set()
        for w in m["wires"]: fam = E2F.get(gold_ev(w), "?" + str(gold_ev(w))); c[fam] += 1; fams.add(fam)
        per_msg[len(fams)] += 1
    tab[f] = c; print(f, "families per message:", sorted(per_msg.items()))
print("| family | events | " + " | ".join(f.split("/")[-2] + "/" + f.split("/")[-1] for f in files) + " |")
for fam, es in FAM9.items(): print(f"| {fam} | {', '.join(es)} | " + " | ".join(str(tab[f][fam]) for f in files) + " |")
print("| total | | " + " | ".join(str(sum(tab[f].values())) for f in files) + " |")
