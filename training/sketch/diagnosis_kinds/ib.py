"""ib.py: measurement 3, second form. Which own-kind words can share a kind, judged by how well a kind PREDICTS the annotated roles
around its tokens (no model). Agglomerative information bottleneck with a cross-validated stop:
- units: the own-kind words of the model (or, with --min N, every word seen >= N times in the fit spans), plus one pseudo-word UNK =
  every other word token (the reader's `unknown` today);
- each unit: four categorical distributions over its tokens (self, next, prev, pos: profiles.py); a cluster predicts a token's features
  with the cluster's distributions (product of the four, add-0.5 smoothing over the categories);
- merge path: repeatedly merge the two clusters whose merge loses the least information about the features on the training tokens
  (sum over the four features of n_i KL(p_i || p_ij) + n_j KL(p_j || p_ij));
- the number of clusters K is chosen by 2-fold cross-validation INSIDE the fit split (fold = hash of the message id): the merge path is
  run on one fold and the log-likelihood of the other fold's tokens is recorded at every K; K* = the K with the best mean held-out
  log-likelihood. Then the path is run on the whole fit split down to K*; the dev split only reports.
python3 ib.py <tag: fix|data2> [features, default self,next,prev,pos] [--min N]"""
import json, sys, collections
import numpy as np
tag = sys.argv[1]; FEATS = (sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("--") else "self,next,prev,pos").split(",")
MIN = int(sys.argv[sys.argv.index("--min") + 1]) if "--min" in sys.argv else None   # units = every word seen >= MIN times in fit (no own-kind list)
H = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/kinds/"
pr = json.load(open(H + f"prof_{tag}.json"))["words"]; own = json.load(open(H + f"rowsfn_{tag}.json"))["own"]
if MIN is None: units = [w for w in own if w in pr] + ["UNK"]
else: units = sorted(w for w in pr if sum(pr[w].get("fit", {}).get("self", {}).values()) >= MIN) + ["UNK"]
unitset = set(units)
vals = {f: sorted({v for w in pr for s in pr[w] for v in pr[w][s].get(f, {})}) for f in FEATS}
def cnt(w, split):
    ws = [w] if w != "UNK" else [x for x in pr if x not in unitset]
    return [np.array([sum(pr[x].get(split, {}).get(f, {}).get(v, 0) for x in ws) for v in vals[f]], float) for f in FEATS]
C = {s: {u: cnt(u, s) for u in units} for s in ("fit", "fitA", "fitB", "dev")}
A = 0.5
def logp(c): return [np.log((x + A) / (x.sum() + A * len(x))) for x in c]
def kl_loss(ci, cj):
    loss = 0.0
    for a, b in zip(ci, cj):
        m = a + b; pm = m / max(m.sum(), 1e-12)
        for x in (a, b):
            if x.sum() == 0: continue
            p = x / x.sum(); nz = p > 0
            loss += x.sum() * np.sum(p[nz] * np.log(p[nz] / pm[nz]))
    return loss
def path(split, stop_at=1, score_split=None):
    cl = {u: ([u], [x.copy() for x in C[split][u]]) for u in units}; curve = {}; merges = []
    def ll():
        tot = 0.0
        for k, (mem, c) in cl.items():
            lp = logp(c)
            for u in mem: tot += sum(float(np.dot(h, l)) for h, l in zip(C[score_split][u], lp))
        return tot
    L = {}
    ks = list(cl)
    for i in range(len(ks)):
        for j in range(i + 1, len(ks)): L[(ks[i], ks[j])] = kl_loss(cl[ks[i]][1], cl[ks[j]][1])
    if score_split: curve[len(cl)] = ll()
    while len(cl) > stop_at:
        (i, j), loss = min(L.items(), key=lambda kv: kv[1])
        merges.append((len(cl) - 1, cl[i][0][:], cl[j][0][:], round(loss, 2)))
        cl[i] = (cl[i][0] + cl[j][0], [a + b for a, b in zip(cl[i][1], cl[j][1])]); del cl[j]
        L = {k: v for k, v in L.items() if i not in k and j not in k}
        for k in cl:
            if k != i: L[(i, k) if (i, k) in L or True else (k, i)] = kl_loss(cl[i][1], cl[k][1])
        if score_split: curve[len(cl)] = ll()
    return cl, curve, merges
_, cA, _ = path("fitA", 1, "fitB"); _, cB, _ = path("fitB", 1, "fitA")
cv = {k: (cA[k] + cB[k]) / 2 for k in cA}
Kstar = max(cv, key=lambda k: cv[k])
cl, cdev, merges = path("fit", Kstar, "dev")
_, cdev_all, _ = path("fit", 1, "dev")
clusters = sorted((sorted(m) for m, _ in cl.values()), key=lambda v: (-len(v), v))
n_fit = {u: int(C["fit"][u][0].sum()) for u in units}
out = {"tag": tag, "features": FEATS, "units": len(units), "K_star": Kstar, "cv_ll": {str(k): v for k, v in sorted(cv.items())},
       "dev_ll": {str(k): v for k, v in sorted(cdev_all.items())}, "clusters": clusters, "merges": merges, "n_fit": n_fit}
json.dump(out, open(H + f"ib_{tag}_{'-'.join(FEATS)}{'' if MIN is None else f'_min{MIN}'}.json", "w"), indent=1)
best_dev = max(cdev_all, key=lambda k: cdev_all[k])
print(f"{tag} features {FEATS}: units {len(units)} (own kinds + UNK); K* by 2-fold CV inside fit = {Kstar} (own-kind units {len(units)}); dev-best K = {best_dev}")
print("cv ll at K =", {k: round(cv[k], 1) for k in sorted(cv) if k in (1, 2, 5, 10, 20, 30, 40, 50, 60, 80, 100, 120, 150, 168, Kstar)})
for c in clusters:
    if len(c) > 1: print("  ", len(c), sum(n_fit[u] for u in c), " ".join(c))
print("  singletons:", " ".join(c[0] for c in clusters if len(c) == 1))
