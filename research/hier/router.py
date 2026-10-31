# read-only: a router learned from the fit spans: event-token SET of a span -> gold family (majority); measured on dev spans (gold cut)
import json, sys, collections
sys.path.insert(0, "/home/claude/diagram-vss-demo/training/sketch"); sys.path.insert(0, "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/hier")
import front
from generate import EVENTS
from famcnt_lib import E2F, gold_ev
F = json.load(open("/home/claude/diagram-vss-demo/docs/model/comb1_p80_s0/front.json"))
TOK2EV = {v: e for e, vs in EVENTS.items() for v in vs}
def rows(f):
    msgs = [json.loads(l) for l in open(f)]; reqs, _ = front.requests(msgs); out = []
    for m, w, sp, names in reqs:
        toks, _ = front.normalize(sp, names, F); evs = frozenset(t for t in toks if t in TOK2EV)
        out.append((evs, E2F.get(gold_ev(w), "?"), gold_ev(w)))
    return out
fit = rows(sys.argv[1]); tab = collections.defaultdict(collections.Counter)
for evs, fam, ev in fit: tab[evs][fam] += 1
single = collections.defaultdict(collections.Counter)
for evs, fam, ev in fit:
    for t in evs: single[t][fam] += 1
def route(evs):
    if not evs: return None, 0
    if evs in tab: c = tab[evs]
    else:
        c = collections.Counter()
        for t in evs: c.update(single.get(t, {}))
    if not c: return None, 0
    (f, n), = c.most_common(1); return f, n / sum(c.values())
for f in sys.argv[1:]:
    R = rows(f); k = collections.Counter(); conf = collections.Counter()
    for evs, fam, ev in R:
        r, p = route(evs); key = "no token" if r is None else ("right" if r == fam else "wrong")
        k[key] += 1
        if r is not None: conf[("p>=0.9" if p >= 0.9 else "p<0.9", key)] += 1
    n = len(R); print(f, n, {a: f"{b} ({100*b/n:.1f}%)" for a, b in k.items()}, dict(conf))
