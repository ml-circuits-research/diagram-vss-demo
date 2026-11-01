"""action_confusion.py: which actions does the cutter mix up? A measurement for the world-granularity recipe (skills/vss-world-design).
The cutter perceptron of cutter_worlds_probe.py (same features and epochs), with one B label per legend event (B-<event>, I, O)
instead of one per world. Trained on 80% of the messages (md5(id) mod 5 != 0), read on the other 20% with the gold previous label
(forced context). At the first token of every gold request, the top-scoring event is the cutter's guess.
Output: the confusion per event (n, share right, the events it is taken for), the pairs that are confused most (both directions summed),
and for each grouping file given, the share of the confusions that fall inside one group (a merge removes them) vs across groups.
python3 action_confusion.py [--groups worlds_micro/GROUPS_6.json,worlds_micro/GROUPS_16.json] [--epochs N]"""
import collections, hashlib, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import front as FR
from front import ctx, ENDS
import micro_tools as MT
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
EPOCHS = int(arg("--epochs", json.load(open(os.path.join(HERE, "front_params.json")))["seg_epochs"]))
event = MT.event
msgs = []
for d in MT.DIRS:
    dd = os.path.join(HERE, d)
    for f in sorted(os.listdir(dd)):
        if f.endswith(".jsonl"):
            for l in open(os.path.join(dd, f)):
                if l.strip(): msgs.append(json.loads(l))
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
        used.add(s); e = s + len(w["span"]); idx = [i for i, (t, a, b) in enumerate(toks) if s <= a and b <= e]
        if idx: G.append({"lo": idx[0], "hi": idx[-1], "ev": event(w)})
    lab = ["O"] * len(toks)
    for g in G:
        for i in range(g["lo"], g["hi"] + 1):
            if lab[i] == "O": lab[i] = ("B-" + g["ev"]) if i == g["lo"] else "I"
    return {"toks": [t[0] for t in toks], "G": G, "lab": lab, "id": m["id"]}
D = [prepare(m) for m in msgs]
EVENTS = sorted({g["ev"] for x in D for g in x["G"]}); LABELS = tuple("B-" + e for e in EVENTS) + ("I", "O")
isTest = lambda x: int(hashlib.md5(x["id"].encode()).hexdigest(), 16) % 5 == 0
train = [x for x in D if not isTest(x)]; test = [x for x in D if isTest(x)]
def feats(toks, i, pl):     # the cutter's features (front.py seg_feats, as copied in cutter_worlds_probe.py)
    w = lambda k: ctx(toks[k]) if 0 <= k < len(toks) else ("<s>" if k < 0 else "</s>")
    start = i == 0 or toks[i - 1] in ENDS
    return [f"w0={w(i)}", f"w-1={w(i - 1)}", f"w+1={w(i + 1)}", f"w-2={w(i - 2)}", f"w+2={w(i + 2)}", f"pl={pl}", f"pl,w0={pl},{w(i)}",
            f"w-1,w0={w(i - 1)},{w(i)}", f"w0,w+1={w(i)},{w(i + 1)}", f"start={int(start)}", f"start,w0={int(start)},{w(i)}", "bias"]
def train_model(data):
    W, tot, last, c = collections.defaultdict(int), collections.defaultdict(int), collections.defaultdict(int), 0
    order = sorted(range(len(data)), key=lambda i: hashlib.sha256(str(i).encode()).hexdigest())
    for ep in range(EPOCHS):
        for di in order:
            toks, gold = data[di]["toks"], data[di]["lab"]; prev = "<s>"
            for i in range(len(toks)):
                c += 1; fs = feats(toks, i, prev); best, bl = None, None
                for L in LABELS:
                    s = sum(W[f + "\t" + L] for f in fs)
                    if best is None or s > best: best, bl = s, L
                if bl != gold[i]:
                    for f in fs:
                        for L, d in ((gold[i], 1), (bl, -1)):
                            k = f + "\t" + L; tot[k] += (c - last[k]) * W[k]; last[k] = c; W[k] += d
                prev = gold[i]
    for k in W: tot[k] += (c - last[k]) * W[k]
    return {k: v / c for k, v in tot.items() if v}
S = train_model(train)
conf = collections.defaultdict(collections.Counter)
for x in test:
    for g in x["G"]:
        i = g["lo"]; prev = x["lab"][i - 1] if i > 0 else "<s>"; fs = feats(x["toks"], i, prev)
        sc = {L: sum(S.get(f + "\t" + L, 0) for f in fs) for L in LABELS[:-2]}
        conf[g["ev"]][max(sc, key=sc.get)[2:]] += 1
out = []; P = lambda s="": (out.append(s), print(s, flush=True))
P(f"# action_confusion: train {len(train)} messages, test {len(test)} ({sum(len(x['G']) for x in test)} gold requests), {len(EVENTS)} events, epochs {EPOCHS}")
P("\n## Per event: share read as itself, and what it is taken for\n| event (n) | right | taken for |\n|---|---|---|")
for e in sorted(conf, key=lambda e: -sum(conf[e].values())):
    n = sum(conf[e].values()); P(f"| {e} ({n}) | {100*conf[e][e]/n:.1f}% | " + ", ".join(f"{o} {k}" for o, k in conf[e].most_common() if o != e)[:200] + " |")
pairs = collections.Counter()
for e in conf:
    for o, k in conf[e].items():
        if o != e: pairs[tuple(sorted((e, o)))] += k
P("\n## Pairs confused most (both directions)\n| pair | confusions |\n|---|---|")
for (a, b), k in pairs.most_common(30): P(f"| {a} / {b} | {k} |")
tot = sum(pairs.values())
for gf in (arg("--groups") or "").split(","):
    if not gf: continue
    G = {k: v for k, v in json.load(open(os.path.join(HERE, gf))).items() if not k.startswith("_")}
    gof = {e: g for g, es in G.items() for e in es}
    inside = sum(k for (a, b), k in pairs.items() if gof.get(a) is not None and gof.get(a) == gof.get(b))
    P(f"\n{gf}: {len(G)} groups; confusions inside one group {inside} of {tot} ({100*inside/tot:.1f}%), across groups {tot-inside}")
open(os.path.join(HERE, "action_confusion_output.txt"), "w").write("\n".join(out) + "\n")
