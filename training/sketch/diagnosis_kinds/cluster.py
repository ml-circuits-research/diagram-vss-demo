"""cluster.py: clusters of the own kinds from measurement 2 (learned rows, rowsfn.py) and measurement 3 (annotation profiles,
profiles.py), and their agreement.

Measurement 2: per kind the functional profile [out_role | in_role | in_presence] (rowsfn.py); a part whose energy is under 3x the energy
of a never-trained row (snr < 3) is set to 0 (the rows wrote nothing there). Kinds with every part under that: group "writes nothing in
its bigram rows". The others: average-linkage clustering on the cosine distance, cut at cosine similarity 0.9 ("near-identical") and 0.75.
Measurement 3: per word four distributions (self, next, prev, pos); distance = mean Hellinger distance over the four. Two clusters are
merged when their distance is not larger than what two samples of their sizes drawn from ONE pooled distribution give (95th percentile
of 60 multinomial draws per feature): greedy, smallest ratio distance / null first, until no ratio <= 1. No other threshold.
Agreement: adjusted Rand index between the partitions (over the kinds in both), and per measurement-3 cluster the mean cosine of the
measurement-2 profiles of its members.
python3 cluster.py <model tag: fix|data2>"""
import json, sys, collections
import numpy as np
from scipy.cluster.hierarchy import linkage, fcluster
from scipy.spatial.distance import squareform
from sklearn.metrics import adjusted_rand_score
tag = sys.argv[1]
H = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/kinds/"
fn = json.load(open(H + f"rowsfn_{tag}.json")); pr = json.load(open(H + f"prof_{tag}.json"))["words"]
own = fn["own"]; out = {"tag": tag}

# ---- measurement 2
def vec(a):
    parts = []
    nr = len(fn["roles"])
    for name, n in (("out_role", nr), ("in_role", nr), ("in_presence", nr - 1)):
        p = fn["profile"][a].get(name)
        parts.append(np.array(p["vec"]) if p and p["snr"] >= 3 else np.zeros(n))
    return np.concatenate(parts)
V = {a: vec(a) for a in own}
empty = sorted(a for a in own if not np.any(V[a]))
sig = [a for a in own if np.any(V[a])]
X = np.stack([V[a] / np.linalg.norm(V[a]) for a in sig]); C = X @ X.T
Dm = np.clip(1 - C, 0, 2); np.fill_diagonal(Dm, 0)
Z = linkage(squareform(Dm, checks=False), "average")
m2 = {}
for cut in (0.9, 0.75):
    lab = fcluster(Z, 1 - cut, "distance"); cl = collections.defaultdict(list)
    for a, l in zip(sig, lab): cl[l].append(a)
    m2[str(cut)] = sorted((sorted(v) for v in cl.values()), key=lambda v: (-len(v), v))
out["m2_empty"] = empty; out["m2_clusters"] = m2
# the strongest functional component of each signal-bearing kind, for the report
names = [f"out:{r}" for r in fn["roles"]] + [f"in:{r}" for r in fn["roles"]] + [f"pres:{r}" for r in fn["roles"][:-1]]
out["m2_top"] = {a: [names[i] for i in np.argsort(-np.abs(V[a]))[:3] if V[a][i] != 0] for a in sig}
out["m2_cos"] = {f"{sig[i]}\t{sig[j]}": float(C[i, j]) for i in range(len(sig)) for j in range(i + 1, len(sig))}

# ---- measurement 3
FEATS = ["self", "next", "prev", "pos"]
vals = {f: sorted({v for w in own if w in pr for v in pr[w]["fit"][f]}) for f in FEATS}
def counts(w, split="fit"):
    return [np.array([pr[w].get(split, {}).get(f, {}).get(v, 0) for v in vals[f]], float) for f in FEATS]
words = [w for w in own if w in pr and sum(pr[w]["fit"]["self"].values()) > 0]
missing = [w for w in own if w not in words]
rng = np.random.default_rng(0)
def hell(p, q): return np.sqrt(np.clip(1 - np.sum(np.sqrt(p * q), -1), 0, 1))
def dist(ca, cb): return float(np.mean([hell(a / a.sum(), b / b.sum()) for a, b in zip(ca, cb)]))
def null95(ca, cb, R=60):
    na, nb = ca[0].sum(), cb[0].sum(); ds = np.zeros(R)
    for a, b in zip(ca, cb):
        p = (a + b) / (a + b).sum()
        A = rng.multinomial(int(na), p, R).astype(float); B = rng.multinomial(int(nb), p, R).astype(float)
        ds += hell(A / A.sum(1, keepdims=True), B / B.sum(1, keepdims=True))
    return float(np.percentile(ds / len(ca), 95))
cl = {i: ([w], counts(w)) for i, w in enumerate(words)}
ratio = {}
def r_of(i, j): d = dist(cl[i][1], cl[j][1]); return d / max(null95(cl[i][1], cl[j][1]), 1e-9)
keys = list(cl)
for x in range(len(keys)):
    for y in range(x + 1, len(keys)): ratio[(keys[x], keys[y])] = r_of(keys[x], keys[y])
merges = []
while ratio:
    (i, j), r = min(ratio.items(), key=lambda kv: kv[1])
    if r > 1: break
    merges.append((cl[i][0], cl[j][0], round(r, 3)))
    cl[i] = (cl[i][0] + cl[j][0], [a + b for a, b in zip(cl[i][1], cl[j][1])]); del cl[j]
    ratio = {k: v for k, v in ratio.items() if i not in k and j not in k}
    for k in cl:
        if k != i: ratio[(min(i, k), max(i, k))] = r_of(min(i, k), max(i, k))
m3 = sorted((sorted(v[0]) for v in cl.values()), key=lambda v: (-len(v), v))
out["m3_clusters"] = m3; out["m3_missing"] = missing
# dev replication: for each multi-word m3 cluster, is the cluster still indistinguishable on the dev split? (ratio of each member to the rest)
rep = []
for c in m3:
    if len(c) < 2: continue
    rs = []
    for w in c:
        if w not in pr or "dev" not in pr[w] or sum(pr[w]["dev"]["self"].values()) < 3: continue
        rest = [x for x in c if x != w and x in pr and "dev" in pr[x] and sum(pr[x]["dev"]["self"].values())]
        if not rest: continue
        cw = counts(w, "dev"); cr = [sum(z) for z in zip(*[counts(x, "dev") for x in rest])]
        rs.append(dist(cw, cr) / null95(cw, cr))
    rep.append((c, round(float(np.mean(rs)), 2) if rs else None, sum(1 for r in rs if r > 1), len(rs)))
out["m3_dev_replication"] = rep

# ---- agreement
lab2 = {a: i for i, c in enumerate(m2["0.75"]) for a in c}
for a in empty: lab2[a] = -1          # "writes nothing" as one group
lab3 = {a: i for i, c in enumerate(m3) for a in c}
both = [a for a in own if a in lab2 and a in lab3]
out["ari_m2_075_vs_m3"] = adjusted_rand_score([lab2[a] for a in both], [lab3[a] for a in both])
lab2b = {a: i for i, c in enumerate(m2["0.9"]) for a in c}
for a in empty: lab2b[a] = -1
out["ari_m2_09_vs_m3"] = adjusted_rand_score([lab2b[a] for a in both], [lab3[a] for a in both])
cosd = {}
for c in m3:
    s = [w for w in c if w in sig]
    if len(s) >= 2:
        cs = [out["m2_cos"].get(f"{a}\t{b}", out["m2_cos"].get(f"{b}\t{a}")) for i, a in enumerate(s) for b in s[i + 1:]]
        cosd[" ".join(c)] = round(float(np.mean(cs)), 3)
out["m3_cluster_mean_m2_cos"] = cosd
# null for that: mean cosine of random pairs of signal-bearing kinds
out["m2_cos_all_pairs_mean"] = float(np.mean(list(out["m2_cos"].values())))
json.dump(out, open(H + f"clusters_{tag}.json", "w"), indent=1)
print(tag, "m2 empty", len(empty), "signal", len(sig))
for cut in m2: print("m2 cut", cut, [c for c in m2[cut] if len(c) > 1])
print("m3", [c for c in m3 if len(c) > 1], "singletons", sum(1 for c in m3 if len(c) == 1))
print("m3 dev replication", rep)
print("ARI", out["ari_m2_075_vs_m3"], out["ari_m2_09_vs_m3"], "m3 cluster mean m2 cos", cosd, "all pairs", out["m2_cos_all_pairs_mean"])
