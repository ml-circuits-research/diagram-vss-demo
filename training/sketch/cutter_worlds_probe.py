"""cutter_worlds_probe.py (M2, owner's version): the world prediction INSIDE the cutter. A BIO perceptron like front.py train_segmenter / seg_decode
(copied below, front.py is not edited; only tokenize / ctx / ENDS are imported) whose B label carries the world: B-<world> (the 15 worlds of
docs/model/micro/registry.json, "fallback" for events of no world), I and O as before. Variants:
  base      : labels B I O (the current cutter's labels and features)               -- the reference for the cut quality
  worlds    : labels B-<world> I O, same features
  worlds+pw : as worlds, plus the world of the previous unit's B label as features (pw=, pw,w0=)
Trained on 80% of the messages (md5 of the message id mod 5 != 0), tested on the other 20%, same seg_epochs as the cutter (front_params.json).
(a) recall@k of the gold world among the B-<world> scores at the gold request's first token, for every gold request and for verbless spans
    (no action token under the fallback front end, from gate.json written by gate_export.mjs), in two ways: "forced" = the context (previous label,
    previous unit's world) is the gold one; "free" = the context is what the greedy decode produced.
(b) cut quality on the same 20%: exact token-span match, one unit overlapping, missed (no unit overlaps), merged (the unit holds 2 requests),
    split (the request is spread over 2+ units); the base cutter is trained and scored by the same code.
python3 cutter_worlds_probe.py [--gate gate.json] [--epochs N]"""
import collections, hashlib, json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import front as FR
from front import ctx, ENDS
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
EPOCHS = int(arg("--epochs", json.load(open(os.path.join(HERE, "front_params.json")))["seg_epochs"]))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
REG = json.load(open(os.path.join(REPO, "docs", "model", "micro", "registry.json")))
WORLDS = [w["world"] for w in REG["worlds"]] + ["fallback"]
def event(w):
    a = w["args"]
    if w["type"] == "command": return a["action"]
    if w["type"] == "question": return "list" if a.get("ask") == "rules" else a.get("ask")
    return w["type"]
world_of = lambda ev: next((w["world"] for w in REG["worlds"] if ev in w["events"]), "fallback")
sys.path.insert(0, HERE); import micro_tools as MT
# ---------- data
gate = json.load(open(arg("--gate"))) if arg("--gate") else None
verbless = {}
if gate:
    for r in gate["rows"]: verbless[(r["dir"], r["id"], r["span"])] = r["verbless"]
msgs = []
for d in MT.DIRS:
    dd = os.path.join(HERE, d); name = "/".join(d.split("/")[-2:])
    for f in sorted(os.listdir(dd)):
        if f.endswith(".jsonl"):
            for l in open(os.path.join(dd, f)):
                if l.strip(): m = json.loads(l); m["_dir"] = name; msgs.append(m)
def prepare(m):
    toks, _ = FR.tokenize(m["text"], m.get("names") or []); used, G = set(), []
    for w in m["wires"]:
        s = -1; frm = 0
        while True:
            k = m["text"].find(w["span"], frm)
            if k < 0: break
            if k not in used: s = k; break
            frm = k + 1
        if s < 0: continue
        used.add(s); e = s + len(w["span"])
        idx = [i for i, (t, a, b) in enumerate(toks) if s <= a and b <= e]
        if idx: G.append({"lo": idx[0], "hi": idx[-1], "world": world_of(event(w)), "ev": event(w), "span": w["span"], "vb": verbless.get((m["_dir"], m["id"], w["span"]))})
    lab = ["O"] * len(toks); wl = [None] * len(toks)
    for g in G:
        for i in range(g["lo"], g["hi"] + 1):
            if lab[i] == "O": lab[i] = "B" if i == g["lo"] else "I"; wl[i] = g["world"] if i == g["lo"] else None
    return {"toks": [t[0] for t in toks], "G": G, "lab": lab, "wl": wl, "id": m["id"], "dir": m["_dir"]}
D = [prepare(m) for m in msgs]
isTest = lambda x: int(hashlib.md5(x["id"].encode()).hexdigest(), 16) % 5 == 0
train = [x for x in D if not isTest(x)]; test = [x for x in D if isTest(x)]
print(f"messages {len(D)}: train {len(train)}, test {len(test)}; gold requests in test {sum(len(x['G']) for x in test)}; epochs {EPOCHS}")
# ---------- the perceptron (copy of front.py seg_feats / seg_decode / train_segmenter, labels and the pw feature made options)
def feats(toks, i, pl, pw):
    w = lambda k: ctx(toks[k]) if 0 <= k < len(toks) else ("<s>" if k < 0 else "</s>")
    start = i == 0 or toks[i - 1] in ENDS
    fs = [f"w0={w(i)}", f"w-1={w(i - 1)}", f"w+1={w(i + 1)}", f"w-2={w(i - 2)}", f"w+2={w(i + 2)}", f"pl={pl}", f"pl,w0={pl},{w(i)}",
          f"w-1,w0={w(i - 1)},{w(i)}", f"w0,w+1={w(i)},{w(i + 1)}", f"start={int(start)}", f"start,w0={int(start)},{w(i)}", "bias"]
    if pw is not False: fs += [f"pw={pw}", f"pw,w0={pw},{w(i)}", f"pw,pl={pw},{pl}"]
    return fs
def labels_of(variant): return ("B", "I", "O") if variant == "base" else tuple("B-" + w for w in WORLDS) + ("I", "O")
def goldlab(x, variant):
    if variant == "base": return x["lab"]
    return [("B-" + x["wl"][i]) if l == "B" else l for i, l in enumerate(x["lab"])]
def nextpw(pw, lab, variant):          # the world of the most recent B label
    return lab[2:] if lab.startswith("B-") else pw
def train_model(data, variant, epochs):
    LABELS = labels_of(variant); use_pw = variant == "worlds+pw"
    W, tot, last, c = collections.defaultdict(int), collections.defaultdict(int), collections.defaultdict(int), 0
    gl = [(x["toks"], goldlab(x, variant)) for x in data]
    order = sorted(range(len(gl)), key=lambda i: hashlib.sha256(str(i).encode()).hexdigest())
    for ep in range(epochs):
        for di in order:
            toks, gold = gl[di]; prev = "<s>"; pw = "NONE"
            for i in range(len(toks)):
                c += 1; fs = feats(toks, i, prev, pw if use_pw else False); best, bl = None, None
                for L in LABELS:
                    s = sum(W[f + "\t" + L] for f in fs)
                    if best is None or s > best: best, bl = s, L
                if bl != gold[i]:
                    for f in fs:
                        for L, d in ((gold[i], 1), (bl, -1)):
                            k = f + "\t" + L; tot[k] += (c - last[k]) * W[k]; last[k] = c; W[k] += d
                prev = gold[i]; pw = nextpw(pw, prev, variant)
    for k in W: tot[k] += (c - last[k]) * W[k]
    return {k: v / c for k, v in tot.items() if v}
def scores(S, fs, LABELS): return {L: sum(S.get(f + "\t" + L, 0) for f in fs) for L in LABELS}
def decode(toks, S, variant, gold=None):
    """free decode (gold=None) or forced context (gold labels as the previous label). -> labels, and per position the scores of the labels"""
    LABELS = labels_of(variant); use_pw = variant == "worlds+pw"; labs, allsc = [], []; prev = "<s>"; pw = "NONE"
    for i in range(len(toks)):
        sc = scores(S, feats(toks, i, prev, pw if use_pw else False), LABELS); bl = max(LABELS, key=lambda L: sc[L])
        allsc.append(sc); labs.append(bl); prev = gold[i] if gold else bl; pw = nextpw(pw, prev, variant)
    return labs, allsc
def units(labs):
    out, cur = [], None
    for i, L in enumerate(labs):
        if L.startswith("B") or (L == "I" and cur is None): cur = [i, i]; out.append(cur)
        elif L == "I": cur[1] = i
        else: cur = None
    return out
def wilson(k, n, z=1.96):
    p = k / n; d = 1 + z * z / n; c = p + z * z / (2 * n); h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return 100 * (c - h) / d, 100 * (c + h) / d
fmt = lambda k, n: f"{100*k/n:.1f}% ({wilson(k, n)[0]:.1f}-{wilson(k, n)[1]:.1f})" if n else "-"
out = []; P = lambda s="": (out.append(s), print(s, flush=True))
P(f"# cutter_worlds_probe: train {len(train)} messages, test {len(test)} messages ({sum(len(x['G']) for x in test)} gold requests; verbless {sum(1 for x in test for g in x['G'] if g['vb'])}); 95% Wilson intervals")
RES = {}
for variant in ["base", "worlds", "worlds+pw"]:
    S = train_model(train, variant, EPOCHS); LABELS = labels_of(variant); cut = collections.Counter(); rk = {m: collections.defaultdict(lambda: [0, 0]) for m in ("forced", "free")}
    e2e = [0, 0]; cutvb = collections.Counter()
    for x in test:
        gl = goldlab(x, variant)
        for mode in (["forced", "free"] if variant != "base" else ["free"]):
            labs, sc = decode(x["toks"], S, variant, gl if mode == "forced" else None)
            if mode == "free":
                U = units(labs)
                for g in x["G"]:
                    ov = [u for u in U if u[0] <= g["hi"] and g["lo"] <= u[1]]
                    if not ov: k = "missed"
                    elif any(any(o is not g and o["lo"] <= u[1] and u[0] <= o["hi"] for o in x["G"]) for u in ov): k = "merged"
                    elif len(ov) >= 2: k = "split"
                    elif ov[0] == [g["lo"], g["hi"]]: k = "exact"
                    else: k = "one unit, not exact"
                    cut[k] += 1; cut["all"] += 1
                    if g["vb"]: cutvb[k] += 1; cutvb["all"] += 1
                extra = sum(1 for u in U if not any(u[0] <= g["hi"] and g["lo"] <= u[1] for g in x["G"])); cut["units with no gold request"] += extra; cut["units"] += len(U)
                if variant != "base":
                    for g in x["G"]:
                        e2e[1] += 1; e2e[0] += labs[g["lo"]] == "B-" + g["world"]
            if variant != "base":
                for g in x["G"]:
                    s = sc[g["lo"]]; ranked = sorted(WORLDS, key=lambda w: -s["B-" + w]); pos = ranked.index(g["world"])
                    for k in (1, 2, 3):
                        for key in ("all",) + (("verbless",) if g["vb"] else ()) + (("with action token",) if g["vb"] is False else ()):
                            rk[mode][(key, k)][0] += pos < k; rk[mode][(key, k)][1] += 1
    RES[variant] = (cut, cutvb, rk, e2e)
P("\n## (b) Cut quality on the test 20%, free greedy decode (gold requests; units of the cutter)")
P("| cutter | exact | one unit, not exact | missed | merged | split | units with no gold request / units |\n|---|---|---|---|---|---|---|")
for v, (cut, cutvb, rk, e2e) in RES.items():
    n = cut["all"]; P(f"| {v} | " + " | ".join(fmt(cut[k], n) + f" [{cut[k]}]" for k in ["exact", "one unit, not exact", "missed", "merged", "split"]) + f" | {cut['units with no gold request']} / {cut['units']} |")
P(f"(n = {RES['base'][0]['all']} gold requests)")
P("\nVerbless gold requests only:\n| cutter | exact | one unit, not exact | missed | merged | split |\n|---|---|---|---|---|---|")
for v, (cut, cutvb, rk, e2e) in RES.items():
    n = cutvb["all"]; P(f"| {v} | " + " | ".join(fmt(cutvb[k], n) + f" [{cutvb[k]}]" for k in ["exact", "one unit, not exact", "missed", "merged", "split"]) + " |")
P("\n## (a) Rank of the gold world among the B-<world> scores at the gold request's first token")
for mode in ("forced", "free"):
    P(f"\n{mode} context ({'previous label / previous unit world = gold' if mode=='forced' else 'previous labels as the greedy decode produced them'})\n| cutter | requests | recall@1 | recall@2 | recall@3 |\n|---|---|---|---|---|")
    for v in ("worlds", "worlds+pw"):
        rk = RES[v][2][mode]
        for key in ("all", "verbless", "with action token"):
            n = rk[(key, 1)][1]; P(f"| {v} | {key} ({n}) | " + " | ".join(fmt(*rk[(key, k)]) for k in (1, 2, 3)) + " |")
for v in ("worlds", "worlds+pw"):
    k, n = RES[v][3]; P(f"\nend to end ({v}): the free decode labels the gold first token exactly B-<gold world>: {fmt(k, n)} of {n}")
open(os.path.join(HERE, "cutter_worlds_probe_output.txt"), "w").write("\n".join(out) + "\n")
