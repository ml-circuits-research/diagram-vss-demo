# read-only: per annotated span, the event tokens of its normalized form (model comb1 front.json) vs the gold event
import json, sys, collections
sys.path.insert(0, "/home/claude/diagram-vss-demo/training/sketch")
import front
from generate import EVENTS
F = json.load(open("/home/claude/diagram-vss-demo/docs/model/comb1_p80_s0/front.json"))
TOK2EV = {v: e for e, vs in EVENTS.items() for v in vs}
def gold_ev(w):
    a = w["args"]; t = w["type"]
    return a.get("action") if t == "command" else ({"rules": "list"}.get(a.get("ask"), a.get("ask")) if t == "question" else t)
for f in sys.argv[1:]:
    msgs = [json.loads(l) for l in open(f)]
    reqs, _ = front.requests(msgs)
    by = collections.Counter(); amb = collections.defaultdict(collections.Counter); nev = collections.Counter()
    for m, w, sp, names in reqs:
        toks, _ = front.normalize(sp, names, F)
        evs = [t for t in toks if t in TOK2EV]
        g = gold_ev(w); nev[min(len(evs), 3)] += 1
        for t in set(evs): amb[t][g] += 1
        key = "none" if not evs else ("one" if len(set(evs)) == 1 else "several")
        ok = (len(set(evs)) == 1 and TOK2EV[evs[0]] == g)
        by[(key, ok)] += 1
    print(f, len(reqs), "spans; event tokens per span", dict(nev)); print(dict(by))
    for t, c in sorted(amb.items(), key=lambda x: -sum(x[1].values())):
        tot = sum(c.values()); own = c.get(TOK2EV[t], 0)
        if tot >= 10 and own / tot < 0.9: print(f"  {t:14s} -> {TOK2EV[t]:10s} n={tot} own={own/tot:.2f} top={c.most_common(4)}")
