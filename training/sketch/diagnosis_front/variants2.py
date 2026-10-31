import sys, json, time, collections
from measure import *
base = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/"
fit = load(base + "fitset/fit.jsonl"); dev = load(base + "review/dev.jsonl")
D = json.load(open("diag3.json")); ET = evtokens()
idx = collections.defaultdict(list)
for m in fit:
    for w in m["wires"]:
        if w.get("span") and w["span"] in m["text"]: idx[m["id"]].append(w)
E = json.load(open("fit_emit.json"))["rows"]
cls_of = {}
seen = collections.defaultdict(int)
reqs328 = []
dmap = {(x["id"], x["span"]): x for x in D}
for r in E:
    w = idx[r["id"]][seen[r["id"]]]; seen[r["id"]] += 1
    x = dmap.get((r["id"], r["span"]))
    if x and not r["verb"]: reqs328.append((r["names"], w, x["cls"]))
def short(c):
    return c[:2] if c[0] in "15" else ("1" if False else c)
V = [("baseline", ()), ("MASK", ("MASK",)), ("SUB", ("SUB",)), ("SUB+SMOOTH", ("SUB", "SMOOTH")), ("SMOOTH", ("SMOOTH",)), ("CTX2", ("CTX2",)), ("CLS", ("CLS",)), ("NAMEPH", ("NAMEPH",)),
     ("MASK+CTX2", ("MASK", "CTX2")), ("MASK+SUB+CTX2", ("MASK", "SUB", "CTX2")), ("MASK+SUB+SMOOTH+CTX2", ("MASK", "SUB", "SMOOTH", "CTX2")),
     ("MASK+SUB+SMOOTH+CTX2+NAMEPH", ("MASK", "SUB", "SMOOTH", "CTX2", "NAMEPH")), ("MC1 what-if", ("MC1",))]
out = {}
for name, opts in V:
    over = {"trig_min_count": 1} if "MC1" in opts else {}
    o = tuple(x for x in opts if x != "MC1")
    F = learn_x(fit, dict(P, **over), o)
    rf = measure(F, fit, o)[0]; rd = measure(F, dev, o)[0]
    tab = collections.defaultdict(lambda: [0, 0, 0])   # cls -> [still none, right, wrong]
    for names, w, cl in reqs328:
        toks = normalize_x(w["span"], names, F, o); ev = [t for t in toks if t in ET]
        key = cl.split(":")[0] if cl[0] in "15" else cl[:2]
        tab[cl][0 if not ev else (1 if front.event_token(w) in ev else 2)] += 1
    out[name] = dict(rules=len(F["triggers"]), fit=rf, dev=rd, tab={k: v for k, v in tab.items()})
    print(f"{name:30s} rules {len(F['triggers']):5d} | FIT a {rf['a_no_event']:4d} b {rf['b_false_outside']:4d} c {rf['c_wrong_only']:4d} | DEV a {rd['a_no_event']:4d} b {rd['b_false_outside']:4d} c {rd['c_wrong_only']:4d}", flush=True)
    json.dump(F, open(f"F_{name.replace('+','_').replace(' ','_').replace('(','').replace(')','').replace('-','')}.json", "w"))
json.dump(out, open("variants2.json", "w"), indent=1)
print("\nper class (of the 328): [still no event, event=gold, event!=gold]")
classes = sorted({c for _, _, c in reqs328})
for c in classes:
    print(c[:70], sum(1 for _, _, x in reqs328 if x == c))
    for name, _ in V:
        if name != "baseline": print("    ", f"{name:30s}", out[name]["tab"].get(c))
