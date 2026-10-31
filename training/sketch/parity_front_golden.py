"""parity_front_golden.py: the golden file of parity_front.mjs, written by the Python side (front.py).
python parity_front_golden.py <front.json> <golden.json>      (DATA=old|all picks the training messages, as front.py)
Per message: the segments and their tokens (as before), the normalization of every annotated span alone (front.normalize, names = the
message's + its wires'), and the whole message (front.normalize_message: tokens and their source spans)."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import front
F = json.load(open(sys.argv[1])); cases = []
for m in front.load_msgs():
    names = list(m.get("names") or []) + [w["args"]["name"] for w in m["wires"] if w["args"].get("name")]
    segs = front.segment(m["text"], names, F)
    spans = [w["span"] for w in m["wires"] if w.get("span") and w["span"] in m["text"]]
    toks, src, _ = front.normalize_message(m["text"], names, F)
    cases.append({"text": m["text"], "names": names, "segments": segs, "tokens": [front.normalize(s, names, F)[0] for s in segs],
                  "spans": [{"span": s, "tokens": front.normalize(s, names, F)[0]} for s in spans], "message": {"tokens": toks, "src": src}})
json.dump({"cases": cases}, open(sys.argv[2], "w"))
print(f"{sys.argv[2]}: {len(cases)} messages, {sum(len(c['spans']) for c in cases)} spans")
