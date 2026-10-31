# measure_v2.py: front-end counts with the REAL front.py code (normalize, normalize_message) on a front.json.
# a = spans with no event token; c = spans with an event token, none = gold; b = rule firings outside every span (front_x.message_events_x,
# checked equal to front.py's rules); b2 = event tokens outside every span in front.normalize_message output (includes raw words that equal a verb token)
import sys, json
sys.path.insert(0, "/home/claude/diagram-vss-demo/training/sketch"); sys.path.insert(0, "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/frontdiag")
import front, front_x
from generate import EVENTS
ET = {v for vs in EVENTS.values() for v in vs}
def measure(F, msgs):
    r = dict(requests=0, a=0, c=0, b=0, b2=0)
    for m in msgs:
        names = list(m.get("names") or []) + [w["args"]["name"] for w in m["wires"] if w["args"].get("name")]
        spans = []
        for w in m["wires"]:
            sp = w.get("span") or ""; i = m["text"].find(sp)
            if not sp or i < 0: continue
            spans.append((i, i + len(sp))); r["requests"] += 1
            ev = [t for t in front.normalize(sp, names, F)[0] if t in ET]
            if not ev: r["a"] += 1
            elif front.event_token(w) not in ev: r["c"] += 1
        out = lambda s: not any(a <= s < b for a, b in spans)
        r["b"] += sum(1 for tok, s, e in front_x.message_events_x(m["text"], names, F) if out(s))
        toks, src, _ = front.normalize_message(m["text"], names, F)
        r["b2"] += sum(1 for t, (s, e) in zip(toks, src) if t in ET and out(s))
    return r
if __name__ == "__main__":
    base = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/"
    fit = [json.loads(l) for l in open(base + "fitset/fit.jsonl")]; dev = [json.loads(l) for l in open(base + "review/dev.jsonl")]
    for name, f in [("baseline (switch off)", base + "frontdiag/v2/front_v2_off_fit.json"), ("FRONT_V2=1", base + "frontdiag/v2/front_v2_fit.json")]:
        F = json.load(open(f)); print(name, "FIT", measure(F, fit), "DEV", measure(F, dev))
