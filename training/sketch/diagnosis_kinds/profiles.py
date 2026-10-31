"""profiles.py: measurement 3, the role profile of each word from the annotation alone (no model).

Every request with a span is normalized with a model's learned front end (front.json; tokenization only) and converted to its training
row exactly as msg_to_world.py does (llm_to_world.convert, soft, gold created names). Each token gets its gold labels (frames.py rule:
pred = the first token of the event's verbs; <role> = a filler head or word; <role>.attr / .det collapsed to <role>). For every word
token (front.is_word, not a legend value token, not an event token) four features:
  self  : the role the token itself fills (or '-' when it is inside no filler)
  next  : the role of the nearest labelled token to its right ('$' = none in the span)
  prev  : the role of the nearest labelled token to its left ('^' = none)
  pos   : its position relative to the predicate token: -3+ / -2 / -1 / +1 / +2 / +3+ / 'nopred'
Writes <out>.json: {word: {split: {feature: Counter}}} for the two files given (fit, dev), and the fit split cut in two folds by a hash
of the message id (fitA, fitB: for the cross-validated choice of the number of clusters in ib.py).
python3 profiles.py <model> <fit.jsonl> <dev.jsonl> <out>"""
import collections, hashlib, json, os, re, sys
SK = "/home/claude/diagram-vss-demo/training/sketch"; sys.path.insert(0, SK)
import front as FR
import generate as G
from llm_to_world import convert, Skip
model, fitf, devf, out = sys.argv[1:5]
R = "/home/claude/diagram-vss-demo/"
M = json.load(open(f"{R}docs/model/{model}/model.json")); F = json.load(open(f"{R}docs/model/{model}/front.json"))
LEX = set(M["lexicon"]); ROLES = [r["id"] for r in M["legend"]["roles"]]
EVVERBS = {e["id"]: e["verbs"] for e in M["legend"]["events"]}
base = set(FR.value_kinds()) | {v for vs in G.EVENTS.values() for v in vs}


def labels(tokens, ev, roles):
    lab = [None] * len(tokens); pred = None
    for i, t in enumerate(tokens):
        if t in EVVERBS.get(ev, []): pred = i; lab[i] = "PRED"; break
    def mark(word, r):
        for i, t in enumerate(tokens):
            if t == word and lab[i] is None: lab[i] = r
    for r, v in roles.items():
        if r not in ROLES: continue
        if isinstance(v, list):
            for x in v: mark(x["head"], r)
        elif isinstance(v, dict):
            mark(v["head"], r)
            if v.get("attr"): mark(v["attr"], r)
            if v.get("det"): mark(v["det"], r)
        else: mark(str(v), r)
    return lab, pred


def posb(i, p):
    if p is None: return "nopred"
    d = i - p
    return "-3+" if d <= -3 else "+3+" if d >= 3 else f"{d:+d}"


res = collections.defaultdict(lambda: collections.defaultdict(lambda: collections.defaultdict(collections.Counter)))
stats = collections.Counter()
for split, f in (("fit", fitf), ("dev", devf)):
    for l in open(f):
        if not l.strip(): continue
        m = json.loads(l); created = []
        fold = "fitA" if int(hashlib.sha256((m["id"] + "|fold").encode()).hexdigest()[:8], 16) % 2 == 0 else "fitB"   # 2-fold split of fit, by message
        for w in m["wires"]:
            if w.get("span") and w["span"] in m["text"]:
                row = {"text": w["span"], "names": m.get("names") or [], "created": list(created), "wire": {"type": w["type"], "args": w["args"]}}
                toks = FR.normalize(w["span"], (m.get("names") or []) + created, F)[0]
                try: _, roles, ev = convert(row, LEX, soft=True, lost=[], norm=lambda t, n: (list(toks), None))
                except Skip: ev, roles = None, {}
                lab, p = labels(toks, ev, roles) if ev else ([None] * len(toks), None)
                stats[split + " requests"] += 1
                for i, t in enumerate(toks):
                    if not FR.is_word(t) or t in base: continue
                    w_ = t.lower(); stats[split + " word tokens"] += 1
                    nx = next((lab[j] for j in range(i + 1, len(toks)) if lab[j]), "$")
                    pv = next((lab[j] for j in range(i - 1, -1, -1) if lab[j]), "^")
                    for feat, v in (("self", lab[i] or "-"), ("next", nx), ("prev", pv), ("pos", posb(i, p))):
                        res[w_][split][feat][v] += 1
                        if split == "fit": res[w_][fold][feat][v] += 1
            if w["type"] == "command" and w["args"].get("action") == "create" and w["args"].get("name"): created.append(w["args"]["name"])
print(dict(stats))
json.dump({"stats": stats, "words": res}, open(out + ".json", "w"))
