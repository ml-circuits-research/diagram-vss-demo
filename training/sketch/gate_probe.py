"""gate_probe.py (M2): a small world-selection model ("gate"). Input: the words of the gold span (word unigrams + bigrams of the fallback front end's
tokens, names -> NAME, texts -> TEXT, numbers -> NUM) + the previous request's gold world (or NONE). Output: a ranking of the 15 worlds + fallback.
Model: multinomial logistic regression (L2), trained by L-BFGS (numpy / scipy; scikit-learn is not installed). 80% / 20% split by hash of the message id.
python3 gate_probe.py [--data gate.json] [--C 1.0]    (without --data it runs gate_export.mjs; needs node)"""
import json, sys, os, math, hashlib, subprocess, tempfile, collections, random
import numpy as np, scipy.sparse as sp
from scipy.optimize import minimize
HERE = os.path.dirname(os.path.abspath(__file__))
arg = lambda k, d=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
data = arg("--data"); TOKS = arg("--tokens", "toks"); L2 = float(arg("--l2", "1e-4"))
if not data:
    data = os.path.join(tempfile.mkdtemp(), "gate.json"); subprocess.check_call(["node", os.path.join(HERE, "gate_export.mjs"), data])
D = json.load(open(data)); W = D["worlds"]; rows = D["rows"]; wi = {w: i for i, w in enumerate(W)}; K = len(W)
h = lambda s: int(hashlib.md5(s.encode()).hexdigest(), 16)
split_by = arg("--split", "id")
test = np.array([h(r["id"] if split_by == "id" else r["text"]) % 5 == 0 for r in rows]); y = np.array([wi[r["world"]] for r in rows])
def grams(r):
    t = ["<s>"] + r[TOKS] + ["</s>"]; return ["u=" + x for x in t[1:-1]] + ["b=" + a + "_" + b for a, b in zip(t, t[1:])]
def build(vocab, rs, prev):
    ri, ci = [], []
    for i, r in enumerate(rs):
        for g in set(grams(r)):
            j = vocab.get(g)
            if j is not None: ri.append(i); ci.append(j)
        if prev: ri.append(i); ci.append(len(vocab) + (wi[r["prev"]] if r["prev"] != "NONE" else K))
    n = len(vocab) + (K + 1 if prev else 0)
    X = sp.csr_matrix((np.ones(len(ri)), (ri, ci)), shape=(len(rs), n)); return X
def fit(X, yy, l2):
    n, d = X.shape; Y = np.zeros((n, K)); Y[np.arange(n), yy] = 1
    def f(w):
        Wm = w[:d * K].reshape(d, K); b = w[d * K:]; Z = X @ Wm + b; Z -= Z.max(1, keepdims=True); P = np.exp(Z); P /= P.sum(1, keepdims=True)
        loss = -np.log(P[np.arange(n), yy] + 1e-12).mean() + l2 * (Wm ** 2).sum() / 2; G = (P - Y) / n
        return loss, np.concatenate([(X.T @ G + l2 * Wm).ravel(), G.sum(0)])
    r = minimize(f, np.zeros(d * K + K), jac=True, method="L-BFGS-B", options={"maxiter": 300}); return r.x[:d * K].reshape(d, K), r.x[d * K:]
def wilson(k, n, z=1.96):
    p = k / n; d = 1 + z * z / n; c = p + z * z / (2 * n); hh = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return (c - hh) / d, (c + hh) / d
out = []; P = lambda s="": (out.append(s), print(s))
tr = [r for r, t in zip(rows, test) if not t]; te = [r for r, t in zip(rows, test) if t]; ytr, yte = y[~test], y[test]
trmsg = set(r["id"] for r in tr); temsg = set(r["id"] for r in te)
P(f"tokens: {TOKS}\nrequests {len(rows)}: train {len(tr)} ({len(trmsg)} message ids), test {len(te)} ({len(temsg)} ids); split by hash of the {split_by}; message ids in both: {len(trmsg & temsg)}")
trspan = set(r["span"].lower() for r in tr); P(f"test requests whose exact span text also occurs in train: {sum(r['span'].lower() in trspan for r in te)} of {len(te)}")
P("gold worlds in test: " + ", ".join(f"{W[k]} {v}" for k, v in collections.Counter(yte).most_common()))
cnt = collections.Counter(g for r in tr for g in set(grams(r))); vocab = {g: i for i, g in enumerate(sorted(g for g, c in cnt.items() if c >= 2))}
P(f"features: {len(vocab)} unigrams+bigrams (document frequency >= 2 in train) + previous-world one-hot (17); L2 {L2}")
vb = np.array([r["verbless"] for r in te]); P(f"verbless requests in test: {vb.sum()} of {len(te)} ({100*vb.mean():.1f}%); in all data {sum(r['verbless'] for r in rows)} of {len(rows)}")
res = {}
for name, prev in [("with previous world", True), ("without previous world", False)]:
    Xtr, Xte = build(vocab, tr, prev), build(vocab, te, prev); Wm, b = fit(Xtr, ytr, L2); S = Xte @ Wm + b
    rank = np.argsort(-S, axis=1); res[name] = {k: (rank[:, :k] == yte[:, None]).any(1) for k in (1, 2, 3)}
# baselines: majority; previous world alone
prior = np.bincount(ytr, minlength=K); order = np.argsort(-prior); res["majority world"] = {k: np.isin(yte, order[:k]) for k in (1, 2, 3)}
# previous world alone: most frequent next world after each previous world
nxt = collections.defaultdict(collections.Counter)
for r, yy in zip(tr, ytr): nxt[r["prev"]][yy] += 1
def prevrank(r, k): c = nxt[r["prev"]]; return [w for w, _ in c.most_common(k)]
res["previous world only"] = {k: np.array([yy in prevrank(r, k) for r, yy in zip(te, yte)]) for k in (1, 2, 3)}
for lab, mask in [("all test requests", np.ones(len(te), bool)), ("verbless requests (no action token)", vb), ("requests with an action token", ~vb)]:
    P(f"\n### {lab} (n = {mask.sum()})\n| model | recall@1 | recall@2 | recall@3 |\n|---|---|---|---|")
    for name in ["with previous world", "without previous world", "previous world only", "majority world"]:
        P(f"| {name} | " + " | ".join(f"{100*res[name][k][mask].mean():.1f}% ({100*wilson(int(res[name][k][mask].sum()), int(mask.sum()))[0]:.1f}-{100*wilson(int(res[name][k][mask].sum()), int(mask.sum()))[1]:.1f})" for k in (1, 2, 3)) + " |")
# paired bootstrap over message ids: with minus without previous world
ids = np.array([r["id"] for r in te]); uid = sorted(set(ids)); byid = collections.defaultdict(list)
for i, m in enumerate(ids): byid[m].append(i)
rnd = random.Random(1); P("\nPaired bootstrap over test messages (500 resamples): recall with minus without the previous world")
for lab, mask in [("all", np.ones(len(te), bool)), ("verbless", vb)]:
    for k in (1, 2, 3):
        a, bb = res["with previous world"][k], res["without previous world"][k]; ds = []
        for _ in range(500):
            ix = [i for m in (rnd.choice(uid) for _ in uid) for i in byid[m] if mask[i]]
            if ix: ds.append(a[ix].mean() - bb[ix].mean())
        P(f"- {lab}, recall@{k}: {100*(a[mask].mean()-bb[mask].mean()):+.1f} points (CI {100*np.percentile(ds,2.5):+.1f} to {100*np.percentile(ds,97.5):+.1f})")
open(os.path.join(HERE, f"gate_probe_output_{TOKS}_{split_by}.txt"), "w").write("\n".join(out) + "\n")
