"""rows.py: measurement 2, the learned route-book rows of the own kinds, compared pair by pair.

For a model under docs/model (dense export, 8-bit phases) and its training run (runs/<run>/splits.json: the training sentences):
1. the rows the training reached (train.py reached_rows: path m[c_k]; bigram bg0[c_0], bg[c_(k-1), c_k]; chain A[c_q, c_k] q < k;
   chainL L[c_q, c_k] q > k), with how many training sentences read each row;
2. the INITIAL value of every row, regenerated exactly as train.LeanTheta draws it (np.random.default_rng(200 + seed), V2's table and
   identities skipped, then V4's table, V5's 24 position rows, V6's L rows, one stream); checked: the rows training did not reach must
   equal their regenerated initial value within the 8-bit quantization;
3. for every pair of own kinds (a, b), per family, the rows of a and b in the same context (path[a] / path[b]; bg0; bg[x, a] / bg[x, b]
   'in'; bg[a, x] / bg[b, x] 'out'; A in / out; L in / out), only where both rows were reached:
     final  = mean_d cos(theta_a - theta_b)   (1 = the same address; 0 +- 1/sqrt(2D) for two independent random rows)
     delta  = the cosine between the two training moves wrap(theta - theta0) (what training wrote into the rows, whatever the start)
   aggregated per pair over the contexts, weighted by min(n_a, n_b) sentences.
python3 rows.py <model> <run_dir> <out.npz-prefix>"""
import json, struct, sys, collections
import numpy as np

R = "/home/claude/diagram-vss-demo/"
model, run, outp = sys.argv[1], sys.argv[2], sys.argv[3]
b = open(f"{R}docs/model/{model}/routebook.bin", "rb").read()
n = struct.unpack("<I", b[8:12])[0]; H = json.loads(b[12:12 + n]); start = 12 + n + ((4 - (12 + n) % 4) % 4)
D = H["D"]; cats = H["cats"]; K = len(cats); cid = {c: i for i, c in enumerate(cats)}
arr = {}
for a in H["arrays"]:
    o = start + a["offset"]
    if a["kind"] == "phase":
        assert a["bits"] == 8
        arr[a["name"]] = np.frombuffer(b, np.uint8, int(np.prod(a["shape"])), o).reshape(a["shape"])      # dequantized on access (ph)
    else:
        arr[a["name"]] = np.frombuffer(b, np.float32, int(np.prod(a["shape"])), o).astype(np.float64).reshape(a["shape"])
M = json.load(open(f"{R}docs/model/{model}/model.json"))
kind = {w: e["kind"] for w, e in M["catalog"]["words"].items()}
V = len(kind)
sp = json.load(open(f"{run}/splits.json"))
train = sp["texts"]["train"]
own = [c for c in cats if c != "unknown" and c == c.lower() and kind.get(c) == c]
print(f"{model}: K {K}, own kinds {len(own)}, vocab {V}, training sentences {len(train)}")

# 1. reached rows and their use (sentences reading them)
use = {f: collections.Counter() for f in ("path", "bg0", "bg", "A", "L")}
for s in train:
    c = [cid[kind[t]] for t in s.split()]
    T = len(c); seen = {f: set() for f in use}
    for k in range(T):
        seen["path"].add(c[k])
        if k == 0: seen["bg0"].add(c[0])
        else: seen["bg"].add((c[k - 1], c[k]))
        for q in range(k): seen["A"].add((c[q], c[k]))
        for q in range(k + 1, T): seen["L"].add((c[q], c[k]))
    for f in use: use[f].update(seen[f])
nreach = sum(len(u) for u in use.values())
print(f"rows reached: {nreach} (+ the root row = {nreach + 1}; the training log states its own count)")

# 2. initial values (train.LeanTheta / v2 / v4 / v5 / v6 layout)
P2 = 1 + K * K + K
off_m4 = P2; off_bg0 = P2 + K; off_bg = P2 + 2 * K; off_pos = P2 + K + (K + 1) * K; off_pc = off_pos + 16; off_pos5 = off_pc + K; off_L = off_pos5 + 24
P = off_L + K * K
assert P == 3 * K * K + 4 * K + 41
row_of = {"path": lambda i: off_m4 + i, "bg0": lambda i: off_bg0 + i, "bg": lambda ij: off_bg + ij[0] * K + ij[1],
          "A": lambda ij: 1 + ij[0] * K + ij[1], "L": lambda ij: off_L + ij[0] * K + ij[1]}
need = {}            # theta row -> (family, key)
for f, u in use.items():
    for key in u: need[row_of[f](key)] = (f, key)
rng_chk = np.random.default_rng(12345)
unreached_sample = {}
for f, shape in (("bg", (K, K)), ("A", (K, K)), ("L", (K, K))):
    for _ in range(300):
        key = (int(rng_chk.integers(K)), int(rng_chk.integers(K)))
        if key not in use[f]: unreached_sample[row_of[f](key)] = (f, key)
for _ in range(50):
    i = int(rng_chk.integers(K))
    if i not in use["path"]: unreached_sample[row_of["path"](i)] = ("path", i)
want = dict(need); want.update(unreached_sample)
rows_sorted = np.array(sorted(want)); init = {}
rng = np.random.default_rng(200 + 0)
skip = P2 + V
for r0 in range(0, skip, 1024): rng.uniform(-np.pi, np.pi, (min(1024, skip - r0), D))
j = 0
for r0 in range(0, P, 1024):
    ch = rng.uniform(-np.pi, np.pi, (min(1024, P - r0), D))
    while j < len(rows_sorted) and rows_sorted[j] < r0 + len(ch):
        init[int(rows_sorted[j])] = ch[rows_sorted[j] - r0]; j += 1
wrap = lambda x: np.angle(np.exp(1j * x))
ph = lambda q: q.astype(np.float64) * (2 * np.pi / 256) - np.pi
def final(f, key):
    if f in ("path", "bg0"): return ph(arr[f][key])
    return ph(arr[f][key[0], key[1]])
# the check: unreached rows equal their initial value (8-bit quantization: |error| <= pi / 256)
errs = [np.abs(wrap(final(f, key) - init[r])).max() for r, (f, key) in unreached_sample.items()]
moved = [np.abs(wrap(final(f, key) - init[r])).mean() for r, (f, key) in need.items() if r != 0]
print(f"check: {len(errs)} unreached rows, max |final - initial| = {max(errs):.4f} (8-bit step {2 * np.pi / 256:.4f})")
print(f"reached rows: mean |final - initial| per dimension: median {np.median(moved):.3f} rad, 10% {np.percentile(moved, 10):.3f}, 90% {np.percentile(moved, 90):.3f}")

# 3. pairwise similarity
own_i = [cid[c] for c in own]
fin = {}; dl = {}
for r, (f, key) in need.items():
    x = final(f, key); fin[(f, key)] = np.exp(1j * x); d = wrap(x - init[r]); dl[(f, key)] = d / (np.linalg.norm(d) + 1e-12)
def pair_sim(a, bb):
    out = {}
    fams = {"path": [(a, bb)], "bg0": [(a, bb)],
            "bg_in": [((x, a), (x, bb)) for x in range(K)], "bg_out": [((a, x), (bb, x)) for x in range(K)],
            "A_in": [((x, a), (x, bb)) for x in range(K)], "A_out": [((a, x), (bb, x)) for x in range(K)],
            "L_in": [((x, a), (x, bb)) for x in range(K)], "L_out": [((a, x), (bb, x)) for x in range(K)]}
    for fam, pairs in fams.items():
        f = fam.split("_")[0]; sf = sd = wsum = 0.0; nctx = 0
        for ka, kb in pairs:
            if isinstance(ka, tuple) and (ka[0] if ka[0] == kb[0] else ka[1]) in (a, bb): continue     # a context that is a or b itself
            na, nb = use[f].get(ka, 0), use[f].get(kb, 0)
            if not na or not nb: continue
            w = min(na, nb); nctx += 1; wsum += w
            sf += w * float(np.real(np.vdot(fin[(f, ka)], fin[(f, kb)])) / D); sd += w * float(np.dot(dl[(f, ka)], dl[(f, kb)]))
        out[fam] = (sf / wsum, sd / wsum, nctx, wsum) if wsum else None
    return out
fams = ["path", "bg0", "bg_in", "bg_out", "A_in", "A_out", "L_in", "L_out"]
res = {"own": own, "fams": fams, "use_path": {c: use["path"].get(cid[c], 0) for c in own}, "pairs": {}}
for x in range(len(own_i)):
    for y in range(x + 1, len(own_i)):
        res["pairs"][f"{own[x]}\t{own[y]}"] = pair_sim(own_i[x], own_i[y])
# null: the same statistic between a reached row and an UNREACHED (random) row of the same family
null = []
for r, (f, key) in list(unreached_sample.items())[:200]:
    v = np.exp(1j * final(f, key)); k2 = next(iter(k for k in use[f] if k != key)); null.append(float(np.real(np.vdot(v, fin[(f, k2)])) / D))
res["null_final_sd"] = float(np.std(null)); res["null_final_mean"] = float(np.mean(null))
res["gates"] = {c: float(1 / (1 + np.exp(-arr["logits"][cid[c]]))) for c in own}
print(f"null (reached vs random row): mean {np.mean(null):.4f}, sd {np.std(null):.4f}")
json.dump(res, open(outp + ".json", "w"))
