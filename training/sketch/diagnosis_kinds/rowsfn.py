"""rowsfn.py: measurement 2b, what the own kinds' bigram rows DO for the readout (not their raw phases).

A bigram row adds exp(i theta) to a token's address; the decoder reads a token j for role r through Re<role_r, a_j> / D, for the
predicate through Re<pred, a_j> / D, and the occupancy marker of role r through Re<role_r * marker * conj(F_j), a_j> / D (reader.js
readRole / structure; stars from stars.bin). So the part of a row that matters is its projection on these keys; the rest is the random
start that training never needed to change. Per own kind a:
  IN  rows: bg0[a] and bg[x, a] (the address of a's OWN token): role / pred components and the presence components with F(a)
  OUT rows: bg[a, x] (the address of the NEXT token, of kind x): role / pred components (and presence with F(x) when x is one word)
Each row gives a vector of components; a random row gives components of sd 1 / sqrt(2D) = 0.022.
Per kind and side, the use-weighted mean of the components over its contexts (its functional profile), with the energy of that mean
against the energy a never-trained row would give (snr; ~1 = the rows wrote nothing the readout reads). Clustering: cluster.py.
python3 rowsfn.py <model> <run_dir> <out>"""
import json, struct, sys, collections
import numpy as np
R = "/home/claude/diagram-vss-demo/"
model, run, outp = sys.argv[1:4]
def rbin(path):
    b = open(path, "rb").read(); n = struct.unpack("<I", b[8:12])[0]; H = json.loads(b[12:12 + n]); s = 12 + n + ((4 - (12 + n) % 4) % 4)
    A = {}
    for a in H["arrays"]:
        cnt = int(np.prod(a["shape"]))
        A[a["name"]] = np.frombuffer(b, np.uint8 if a["kind"] == "phase" else np.float32, cnt, s + a["offset"]).reshape(a["shape"])
    return H, A
ph = lambda q: q.astype(np.float64) * (2 * np.pi / 256) - np.pi
H, A = rbin(f"{R}docs/model/{model}/routebook.bin"); SH, SA = rbin(f"{R}docs/model/{model}/stars.bin")
D = H["D"]; cats = H["cats"]; K = len(cats); cid = {c: i for i, c in enumerate(cats)}
star = {k: np.exp(1j * ph(SA["stars"][i])) for i, k in enumerate(SH["keys"])}
M = json.load(open(f"{R}docs/model/{model}/model.json")); kind = {w: e["kind"] for w, e in M["catalog"]["words"].items()}
roles = [r["id"] for r in M["legend"]["roles"]]
own = [c for c in cats if c != "unknown" and c == c.lower() and kind.get(c) == c]
train = json.load(open(f"{run}/splits.json"))["texts"]["train"]
use_bg = collections.Counter(); use_bg0 = collections.Counter()
for s in train:
    c = [cid[kind[t]] for t in s.split()]
    use_bg0[c[0]] += 1; use_bg.update(set(zip(c[:-1], c[1:])))
RK = np.stack([star["role:" + r] for r in roles] + [star["op:pred"]])          # role and predicate keys (26 x D)
mk = star["marker"]
def comps(theta, word=None):
    u = np.exp(1j * ph(theta))
    v = np.real(np.conj(RK) @ u) / D
    if word is None or "id:" + word not in star: return v, None
    P = np.stack([star["role:" + r] * mk * np.conj(star["id:" + word]) for r in roles])
    return v, np.real(np.conj(P) @ u) / D
prof = {}
for a in own:
    ia = cid[a]; IN = {}; OUT = {}
    if use_bg0[ia]: IN["^"] = (use_bg0[ia],) + comps(A["bg0"][ia], a)
    for x in range(K):
        if use_bg[(x, ia)]: IN[cats[x]] = (use_bg[(x, ia)],) + comps(A["bg"][x, ia], a)
        if use_bg[(ia, x)]: OUT[cats[x]] = (use_bg[(ia, x)],) + comps(A["bg"][ia, x], cats[x] if cats[x] in own else None)
    prof[a] = {"IN": IN, "OUT": OUT}
noise = 1 / (2 * D)
# the averaged functional profile of a kind: per side, the use-weighted mean of its rows' components over the contexts; the noise of each
# averaged component (rows untouched by training) is var = noise * sum(w^2) / (sum w)^2
def avg(a, side, pres):
    P = [(n, (p if pres else v)) for x, (n, v, p) in prof[a][side].items() if (p is not None or not pres)]
    if not P: return None, None
    W = sum(n for n, _ in P); vec = sum(n * v for n, v in P) / W; var = noise * sum(n * n for n, _ in P) / W ** 2
    return vec, var
res = {"own": own, "roles": roles + ["pred"], "magnitude": {}, "profile": {}}
for a in own:
    parts = {}
    for name, side, pres in (("out_role", "OUT", False), ("in_role", "IN", False), ("in_presence", "IN", True)):
        vec, var = avg(a, side, pres)
        if vec is None: continue
        E = float(np.sum(vec ** 2)); En = float(var * len(vec))
        parts[name] = {"vec": vec.round(4).tolist(), "energy": E, "noise_energy": En, "snr": E / En}
    res["profile"][a] = parts
    mags = {}
    for side in ("IN", "OUT"):
        P = prof[a][side]
        if not P: continue
        W = sum(v[0] for v in P.values())
        top = collections.Counter()
        for x, (n, v, p) in P.items():
            for i, r in enumerate(res["roles"]): top[r] += n * v[i] / W
            if p is not None:
                for i, r in enumerate(roles): top["presence:" + r] += n * p[i] / W
        mags[side + "_top"] = [(r, round(float(s), 3)) for r, s in top.most_common(4)]
    res["magnitude"][a] = mags
json.dump(res, open(outp + ".json", "w"))
print(model, "own", len(own))
