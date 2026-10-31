"""tiny_missobj.py <world>: the rows of a tiny world whose gold object the model (in sample) leaves out, with their kind sequence and the
object presence ratio split by the class of token kind (own / VERB / NAME / value), on the tiny model (the infer.py reader's arithmetic)."""
import collections, json, sys
import numpy as np
sys.path.insert(0, "/home/claude/diagram-vss-demo/training/vss/tool")
from sop.infer import Reader, idgen
HERE = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/capacity/"
W = sys.argv[1]; rd = Reader(HERE + f"tiny/{W}/model")
keys = {(x["id"], x["wi"]) for x in json.load(open(HERE + f"tiny/{W}/rows.json"))}
rows = [r for r in map(json.loads, open(HERE + "fit_frames.jsonl")) if (r["id"], r["wi"]) in keys]
per = collections.Counter(v["kind"] for v in rd.words.values())
cls = lambda k: "unknown" if k in (None, "unknown") else k if k in ("VERB", "NAME") else ("own" if per[k] <= 1 else "value")
thr = rd.th["presence"]["object"]; byk = collections.defaultdict(lambda: [0, 0]); out = []
for r in rows:
    if "object" not in r["roles"]: continue
    toks = r["tokens"]; S, kept, unknown, addr = rd.chart(toks); nS = np.linalg.norm(S)
    wires, f, info = rd.formalize(" ".join(toks), 0, idgen())
    if f.get("event") != r["ev"]: continue
    core = f["core"]; key = np.conj(rd.st.role("object")) * np.conj(rd.st.marker()) / np.sqrt(rd.D)
    parts = collections.Counter()
    for j, i in enumerate(kept):
        parts[cls(rd.kind(toks[i]))] += float(np.real(np.sum(addr[j] * rd.st.id(rd.ident(toks[i])) * key))) / nS / core
    ks = " ".join(r["kinds"]); got = "object" in (f.get("roles") or {})
    byk[ks][0] += got; byk[ks][1] += 1
    if not got: out.append(f"  {' '.join(toks):40s} [{ks}] presence {sum(parts.values()):.3f} (thr {thr:.3f}) own {parts['own']:.3f} VERB {parts['VERB']:.3f} NAME {parts['NAME']:.3f} value {parts['value']:.3f}")
print(f"{W}: gold object left out in sample:"); print("\n".join(out))
print("object read / rows, by kind sequence (sequences with a miss):")
for k, (a, b) in sorted(byk.items(), key=lambda x: -x[1][1]):
    if a < b: print(f"  [{k}] {a}/{b}")
