# read-only: the legend-only router on gold spans: candidate families = families of the event tokens in the span
import json, sys, collections
sys.path.insert(0, "/home/claude/diagram-vss-demo/training/sketch"); sys.path.insert(0, "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/hier")
import front
from generate import EVENTS
from famcnt_lib import E2F, gold_ev
F = json.load(open("/home/claude/diagram-vss-demo/docs/model/comb1_p80_s0/front.json"))
TOK2EV = {v: e for e, vs in EVENTS.items() for v in vs}
for f in sys.argv[1:]:
    msgs = [json.loads(l) for l in open(f)]; reqs, _ = front.requests(msgs); c = collections.Counter(); pairs = collections.Counter()
    for m, w, sp, names in reqs:
        toks, _ = front.normalize(sp, names, F)
        fams = {E2F.get(TOK2EV[t]) for t in toks if t in TOK2EV}; g = E2F.get(gold_ev(w))
        if not fams: c["no event token"] += 1
        elif len(fams) == 1: c["1 family, right" if g in fams else "1 family, wrong"] += 1
        else:
            c[f"{len(fams)} families, gold among them" if g in fams else f"{len(fams)} families, gold not among them"] += 1
            if g in fams: pairs[tuple(sorted(x.split()[0] for x in fams))] += 1
    n = len(reqs); print(f, n, {k: f"{v} ({100*v/n:.1f}%)" for k, v in sorted(c.items())}); print("   ", pairs.most_common(6))
