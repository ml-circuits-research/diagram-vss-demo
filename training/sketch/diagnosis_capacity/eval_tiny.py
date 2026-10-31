"""eval_tiny.py <world> [model_dir]: reads every training row of a tiny world with its trained model (training/vss/tool/sop/infer.py
Reader, the trainer's own reader) and reports, IN SAMPLE (the rows the model was trained on):
  - event right, frame exactly right (event + every legend role, compared as frames.py / analyze.py do)
  - per role: present rows read present / absent rows read absent with the model's own thresholds (fitted on these rows), and the best
    balanced accuracy ANY single threshold could reach on these rows (threshold-free separability of the presence ratio)
  - for the list structures: the frame right per gold structure
Also, for comparison, the same on the same rows read by the full model fix_p80_s0 is in analyze.py's output (fit train rows)."""
import collections, json, sys
import numpy as np
REPO = "/home/claude/diagram-vss-demo/"; sys.path.insert(0, REPO + "training/vss/tool")
from sop.infer import Reader, idgen
HERE = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/capacity/"
sys.argv += [] ; W = sys.argv[1]; MD = sys.argv[2] if len(sys.argv) > 2 else HERE + f"tiny/{W}/model"
rd = Reader(MD)
keys = {(x["id"], x["wi"]) for x in json.load(open(HERE + f"tiny/{W}/rows.json"))}
rows = [r for r in map(json.loads, open(HERE + "fit_frames.jsonl")) if (r["id"], r["wi"]) in keys]
ROLES = rd.legend.roles if hasattr(rd.legend, "roles") else None
LROLES = [x["id"] for x in json.load(open(HERE + f"tiny/{W}/legend.json"))["roles"]]
EVR = {e["id"]: set(e.get("roles") or []) for e in json.load(open(HERE + f"tiny/{W}/legend.json"))["events"]}


def gcanon(v):
    if isinstance(v, list): return ("S", tuple(sorted(x["head"] for x in v)))
    if isinstance(v, dict): return ("E", v["head"], v.get("attr"), v.get("det"))
    return ("W", str(v))


def dcanon(fl):
    if fl is None: return None
    if fl[0] == "set": return ("S", tuple(sorted(e[1] for e in fl[1:])))
    if fl[0] == "entity":
        a = fl[2]; return ("E", fl[1], (a[1] if a and a[0] == "word" else ("not_" + a[1]) if a else None), fl[3])
    if fl[0] == "negword": return ("W", "not_" + fl[1])
    return ("W", fl[1])


def struct(r): return "+".join(k for k in ("source", "target", "object", "members", "targets") if k in r["roles"]) or "-"


n = ev_ok = fr_ok = 0; per = collections.defaultdict(lambda: {"p": [], "a": []}); bys = collections.defaultdict(lambda: [0, 0]); errs = collections.Counter()
status = collections.Counter(); bad = []
for r in rows:
    wires, f, info = rd.formalize(" ".join(r["tokens"]), 0, idgen())
    n += 1; status[info["status"]] += 1
    e = f.get("event") == r["ev"] and info["status"] not in ("unknown-event", "no-sense"); ev_ok += e
    g = {k: gcanon(v) for k, v in r["roles"].items() if k in LROLES}; d = {k: dcanon(v) for k, v in (f.get("roles") or {}).items() if v is not None}
    ok = e and g == d; fr_ok += ok
    bys[(r["ev"], struct(r))][0] += ok; bys[(r["ev"], struct(r))][1] += 1
    if not ok:
        errs["event " + str(f.get("event")) + " <- " + r["ev"] if not e else " ".join(sorted([f"miss {k}" for k in g if k not in d] + [f"extra {k}" for k in d if k not in g] + [f"wrong {k}" for k in g if k in d and d[k] != g[k]]))] += 1
        if len(bad) < 12: bad.append(f"{' '.join(r['tokens'])} | gold {r['ev']} {json.dumps(g)} | got {f.get('event')} {json.dumps(d)} | {info['status']}")
    if e:
        for k in EVR.get(r["ev"], ()):
            x = f["presence"].get(k)
            if isinstance(x, (int, float)): per[k]["p" if k in r["roles"] else "a"].append(x)


def best_bal(p, a):
    if not p or not a: return None
    v = np.unique(np.array(p + a)); c = (v[:-1] + v[1:]) / 2 if len(v) > 1 else v; P, A = np.array(p), np.array(a)
    return max(((P >= t).mean() + (A < t).mean()) / 2 for t in c)


print(f"world {W}: {n} training rows read in sample; status {dict(status)}")
print(f"event right {ev_ok} ({100 * ev_ok / n:.1f}%), frame exactly right {fr_ok} ({100 * fr_ok / n:.1f}%)")
print("\nframe right per (event, gold structure):")
for k, (a, b) in sorted(bys.items(), key=lambda x: -x[1][1])[:16]: print(f"  {k[0]} {k[1]}: {a}/{b}")
print("\nmost common errors:", errs.most_common(10))
th = rd.th.get("presence", {}); sm = rd.th.get("set_member", {})
print("\nper role (rows whose event is read right): present read present / absent read absent with the model's thresholds; best balanced accuracy of any threshold")
for k, v in per.items():
    t = th.get(k); P, A = v["p"], v["a"]
    if t is None: tp = tn = "-"
    else: tp = f"{sum(x >= t for x in P)}/{len(P)}"; tn = f"{sum(x < t for x in A)}/{len(A)}"
    bb = best_bal(P, A)
    print(f"  {k}: thr {t if t is None else round(t, 3)} present {tp} absent {tn} | best balanced {'-' if bb is None else f'{bb:.3f}'}")
print("\nexamples of errors:"); [print("  " + b) for b in bad]
