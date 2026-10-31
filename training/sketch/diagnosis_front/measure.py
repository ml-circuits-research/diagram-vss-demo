# measure.py: (a) spans with no event token, (b) event tokens produced outside every span, (c) spans with event tokens but none = gold
import sys, json, collections
from common import *
import front_x
from front_x import *
EVTOK = None
def evtokens():
    from generate import EVENTS
    return {v for vs in EVENTS.values() for v in vs}
def measure(F, msgs, opts=()):
    ET = evtokens(); a = c = n = b = 0; bmsgs = 0; b_ex = []; a_ex = []; goldseen = 0
    for m in msgs:
        names = list(m.get("names") or []) + [w["args"]["name"] for w in m["wires"] if w["args"].get("name")]
        spans = []
        for w in m["wires"]:
            sp = w.get("span") or ""; i = m["text"].find(sp)
            if not sp or i < 0: continue
            spans.append((i, i + len(sp)))
            toks = normalize_x(sp, names, F, opts); ev = [t for t in toks if t in ET]; n += 1
            if not ev: a += 1; a_ex.append(sp)
            elif front.event_token(w) not in ev: c += 1
        evs = message_events_x(m["text"], names, F, opts); k = 0
        for tok, s, e in evs:
            if not any(x0 <= s < x1 for x0, x1 in spans): k += 1; b_ex.append((tok, m["text"][max(0, s - 25):e + 20]))
        b += k; bmsgs += bool(k)
    return dict(requests=n, a_no_event=a, b_false_outside=b, b_msgs=bmsgs, c_wrong_only=c), a_ex, b_ex
if __name__ == "__main__":
    base = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/"
    fit = load(base + "fitset/fit.jsonl"); dev = load(base + "review/dev.jsonl")
    F0 = json.load(open("/home/claude/diagram-vss-demo/docs/model/fix_p80_s0/front.json"))
    print("stored front.json, fit:", measure(F0, fit)[0]); print("stored front.json, dev:", measure(F0, dev)[0])
    Fx = learn_x(fit, P, ()); print("learn_x no flags == stored triggers:", Fx["triggers"] == F0["triggers"] and Fx["values"] == F0["values"])
