"""select_front.py: the front end's thresholds chosen on held-out TRAINING messages (80% fit / 20% dev by a hash of the id), never on the
test sets. Score of a setting on the dev messages: requests whose span the learned front end makes fully readable (the gold event's token
and every gold value token present: llm_to_world.convert with nothing lost) minus chatter sentences in which a trigger fires; segmenter
epochs by exact-span F1. Coordinate search: values first, then triggers. Writes front_params.json and llm_train/FRONT_SELECTION.md."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import front as FR
from llm_to_world import convert, Skip
import generate as G

msgs = FR.load_msgs(); fit = [m for m in msgs if FR.split_of(m, 0.8)]; dev = [m for m in msgs if not FR.split_of(m, 0.8)]
reqs_fit, chat_fit = FR.requests(fit); reqs_dev, chat_dev = FR.requests(dev); vt = set(FR.value_kinds())
EVTOK = {v for vs in G.EVENTS.values() for v in vs}
lex = set(FR.value_kinds()) | EVTOK


def score(P):
    V = FR.learn_values(reqs_fit, P["val_min_count"], P["val_min_prec"])
    T = FR.learn_triggers(reqs_fit, chat_fit, V, P["trig_min_count"], P["trig_share"], P["trig_min_prec"], vt)
    F = {"values": V, "triggers": T}; norm = lambda text, names: FR.normalize(text, names, F)
    ok = 0
    for m, w, sp, names in reqs_dev:
        lost = []
        row = {"text": sp, "names": names, "created": [], "wire": {"type": w["type"], "args": w["args"]}}
        try:
            convert(row, lex, soft=True, lost=lost, norm=norm)
            ok += not lost
        except Skip: pass
        except Exception: pass
    false = sum(any(t in EVTOK for t in FR.normalize(s, names, F)[0]) for s, names in chat_dev)
    return ok - false, ok, false


P = dict(FR.DEFAULTS); log = []
for key, grid in (("val_min_count", [2, 3, 5]), ("val_min_prec", [0.6, 0.7, 0.8, 0.9]), ("trig_min_count", [2, 3, 5]), ("trig_share", [0.6, 0.75, 0.9]), ("trig_min_prec", [0.5, 0.6, 0.7, 0.8])):
    res = []
    for g in grid:
        s = score(dict(P, **{key: g})); res.append((s, g)); log.append(f"| {key} | {g} | {s[1]} | {s[2]} | {s[0]} |"); print(key, g, s, flush=True)
    P[key] = max(res)[1]
best_f1, best_ep = -1, None
for ep in (3, 5, 8):
    F = {"segmenter": FR.train_segmenter(fit, ep)}; tp = fp = fn = 0
    for m in dev:
        g = {w["span"].strip(" ,") for w in m["wires"] if w.get("span") and w["span"] in m["text"]}; p = {x.strip(" ,") for x in FR.segment(m["text"], m.get("names") or [], F)}
        tp += len(g & p); fp += len(p - g); fn += len(g - p)
    f1 = 2 * tp / (2 * tp + fp + fn); log.append(f"| seg_epochs | {ep} | span F1 {f1:.3f} | | |"); print("seg", ep, f1, flush=True)
    if f1 > best_f1: best_f1, best_ep = f1, ep
P["seg_epochs"] = best_ep
json.dump(P, open(os.path.join(HERE, "front_params.json"), "w"), indent=1)
open(os.path.join(HERE, "llm_train", "FRONT_SELECTION.md"), "w").write(
    f"# Front-end thresholds chosen on held-out training messages\n\nfit {len(fit)} messages, dev {len(dev)} messages ({len(reqs_dev)} requests, {len(chat_dev)} chatter sentences).\n"
    f"Score = dev requests made fully readable - chatter sentences where a trigger fires. Chosen: {json.dumps(P)}\n\n| parameter | value | readable | false triggers | score |\n|---|---|---|---|---|\n" + "\n".join(log) + "\n")
print(P)
