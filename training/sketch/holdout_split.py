"""holdout_split.py: the data of the abstraction test (HOLDOUT_PURPLE.md). From the gold requests of one world (micro_tools.py gold
<world> --out DIR/all), write DIR/purple_value (only the requests whose gold args name the word), DIR/purple (every request of the
messages that mention it) and DIR/rest (the other messages). Usage: python3 holdout_split.py DIR [--word purple]"""
import argparse, json, os, re
ap = argparse.ArgumentParser(); ap.add_argument("dir"); ap.add_argument("--word", default="purple"); a = ap.parse_args()
rx = re.compile(r"\b" + re.escape(a.word) + r"\b", re.I); w = a.word.lower()
out = {k: open(os.path.join(a.dir, k, k + ".jsonl"), "w") for k in ("purple_value", "purple", "rest") if os.makedirs(os.path.join(a.dir, k), exist_ok=True) or True}
n = dict.fromkeys(out, 0)
for line in open(os.path.join(a.dir, "all", "all.jsonl")):
    m = json.loads(line)
    if rx.search(m["text"]):
        out["purple"].write(line); n["purple"] += len(m["wires"])
        vw = [x for x in m["wires"] if w in json.dumps(x["args"]).lower()]
        if vw: out["purple_value"].write(json.dumps(dict(m, wires=vw)) + "\n"); n["purple_value"] += len(vw)
    else: out["rest"].write(line); n["rest"] += len(m["wires"])
print({k: f"{v} requests" for k, v in n.items()})
