from measure import *
base = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/"
fit = load(base + "fitset/fit.jsonl"); ET = evtokens()
F0 = json.load(open("/home/claude/diagram-vss-demo/docs/model/fix_p80_s0/front.json"))
def per_span(F, opts):
    out = {}
    for m in fit:
        names = list(m.get("names") or []) + [w["args"]["name"] for w in m["wires"] if w["args"].get("name")]
        for k, w in enumerate(m["wires"]):
            sp = w.get("span") or ""
            if not sp or sp not in m["text"]: continue
            toks = normalize_x(sp, names, F, opts); out[(m["id"], k)] = (sp, [t for t in toks if t in ET], front.event_token(w))
    return out
b = per_span(F0, ())
for name, opts in [("MASK", ("MASK",)), ("NAMEPH", ("NAMEPH",))]:
    F = json.load(open(f"F_{name}.json")); r = per_span(F, opts)
    lost = [(b[k][0], b[k][1], r[k][1], r[k][2]) for k in b if b[k][1] and not r[k][1]]
    wrong = [(b[k][0], b[k][1], r[k][1], r[k][2]) for k in b if r[k][1] and r[k][2] not in r[k][1] and (not b[k][1] or b[k][2] in b[k][1])]
    print(name, "lost:", len(lost)); [print("   LOST", x) for x in lost[:8]]
    print(name, "newly wrong (was right or none):", len(wrong)); [print("   WRONG", x) for x in wrong[:8]]
