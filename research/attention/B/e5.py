"""
e5.py (implementer B) -- two worlds. World A (diagram) reads a mixed message and hands its unexplained zones to world B (errands).
Run: python e5.py --seed 0 [--negatives]   (needs logs/main_s<seed>_e3c.pt from exp.py --exp e3c)
--negatives: R81-style fallback variant: A is retrained with world-B requests inside its training messages labelled as "not this
world" (no target, null for every word, attachment 0); see RESULTS.md.
"""
import argparse, json, time
import numpy as np, torch
import world as W, vss as V

ap = argparse.ArgumentParser(); ap.add_argument("--seed", type=int, default=0); ap.add_argument("--D", type=int, default=256)
ap.add_argument("--negatives", action="store_true"); ap.add_argument("--ntrain", type=int, default=8000)
a = ap.parse_args(); seed = a.seed; LOG = lambda s: print(s, flush=True)
A = W.World(W.DIAGRAM); B = W.World(W.ERRANDS)
st = V.Stars(A.vocab() | B.vocab(), [A, B], a.D, seed); V.set_stars(st)


def spans(M, wname):
    return [([t for t, l in zip(M["toks"], M["labels"]) if l == i], r) for i, r in enumerate(M["reqs"]) if r["world"] == wname]


def train_centre(wd, data, negatives=False):
    m = V.CentreReader(len(wd.kinds), a.D, seed, null=True)
    def mk(model, chunk):
        b = V.encode_messages(chunk, wd, st); S, (wL, wR, wS, n) = model.states(b, return_w=True)
        creq = b.creq.numpy(); cm = b.cmsg.numpy(); real = np.where(creq >= 0)[0]
        T = torch.stack([st.target(wd.name, chunk[cm[c]]["reqs"][creq[c]]) for c in real])
        loss = V.cosloss(S[torch.tensor(real)], T)
        bce = torch.nn.functional.binary_cross_entropy; cl = lambda x: x.clamp(1e-6, 1 - 1e-6)
        loss = loss + bce(cl(n[b.ctok]), torch.tensor((creq < 0).astype(np.float32)))
        hL = b.lc >= 0; hR = b.rc >= 0
        loss = loss + bce(cl(wL[hL]), b.gl[hL]) + bce(cl(wR[hR]), b.gr[hR]) + bce(cl(wS), torch.tensor((creq >= 0).astype(np.float32)))
        return loss
    t = V.train_model(m, mk, data, 3, 16, 0.02, max_seconds=420); LOG(f"trained {wd.name} centre reader in {t:.0f}s")
    return m


def train_standard(wd, items):
    m = V.StandardReader(len(wd.kinds), a.D, seed)
    def mk(model, chunk):
        b = V.encode_inputs([x[0] for x in chunk], wd, st); S = model.states(b)
        return V.cosloss(S, torch.stack([st.target(wd.name, x[1]) for x in chunk]))
    V.train_model(m, mk, items, 3, 16, 0.02, max_seconds=420); return m


def read_msgs(m, wd, rc, msgs):
    """per message: list of (pos, raw reading, null, wL..., ) and per-token explained flags (zone rule 1, accepted = null < 0.5)"""
    out = []
    for i in range(0, len(msgs), 256):
        chunk = msgs[i:i + 256]; b = V.encode_messages(chunk, wd, st)
        with torch.no_grad(): S, (wL, wR, wS, n) = m.states(b, return_w=True)
        sc = rc.scores(S) if b.C else None; wins = V.centre_windows(b)
        cm = b.cmsg.numpy(); ct = b.ctok.numpy(); pos = b.pos.numpy(); msgv = b.msg.numpy(); nn = n.numpy()
        per = [{"cent": [], "acc": set()} for _ in chunk]
        for c in range(b.C):
            rd = rc.read(sc, c, wins[c]); per[cm[c]]["cent"].append((int(pos[ct[c]]), rd, float(nn[ct[c]]), c))
        start = 0; lc = b.lc.numpy(); rcn = b.rc.numpy(); wLn = wL.numpy(); wRn = wR.numpy()
        for k, M in enumerate(chunk):
            p = per[k]; T = len(M["toks"])
            for (q, rd, nl, c) in p["cent"]:
                if rd is not None and nl < 0.5: p["acc"].add(c)
            ex = []
            for t in range(start, start + T):
                e = (lc[t] in p["acc"] and wLn[t] >= 0.5) or (rcn[t] in p["acc"] and wRn[t] >= 0.5)
                ex.append(e)
            for (q, rd, nl, c) in p["cent"]:
                if c in p["acc"]: ex[q] = True
            p["explained"] = ex; start += T
        out += per
    return out


def thr_on_dev(m, wd, rc, dev):
    R = read_msgs(m, wd, rc, dev)
    return V.choose_thr([(rd, V.gold_key(t[p])) for M, Rm in zip(dev, R) for t in [{r["act_pos"]: r for r in M["reqs"]}]
                         for p, rd, _, _ in Rm["cent"] if p in t])


def f1(tp, fp, fn): return 2 * tp / max(1, 2 * tp + fp + fn)


t0 = time.time()
# ---- world A reader
trainA = W.dataset(seed * 100 + 1, a.ntrain, [A])
if a.negatives:
    # R81-style: A's training messages also contain world-B requests (p = 0.3 per request), labelled not-this-world: the encoder sees
    # their tokens as non-request (label -1 for A), their action words as false centres (no target, null)
    mix = W.dataset(seed * 100 + 21, a.ntrain, [A, B], world_p=[0.7, 0.3])
    for M in mix:
        M["labels"] = [l if l >= 0 and M["reqs"][l]["world"] == "diagram" else (-1 if l >= 0 else l) for l in M["labels"]]
    mA = train_centre(A, mix, negatives=True)
else:
    mA = V.CentreReader(len(A.kinds), a.D, seed, null=True); mA.load_state_dict(torch.load(f"logs/main_s{seed}_e3c.pt"))
rcA = V.ReadCtx(A, st); thrA = thr_on_dev(mA, A, rcA, W.dataset(seed * 100 + 2, 800, [A]))
# ---- world B readers (centre + gold-cut standard)
trainB = W.dataset(seed * 100 + 11, a.ntrain, [B]); devB = W.dataset(seed * 100 + 12, 800, [B])
mB = train_centre(B, trainB); rcB = V.ReadCtx(B, st); thrB = thr_on_dev(mB, B, rcB, devB)
sB = train_standard(B, [(sp, r) for M in trainB for sp, r in spans(M, "errands")])
LOG(f"thresholds: A presence {thrA:.2f}, B presence {thrB:.2f}")

res = {}
for name, names in (("test_seen", W.NAMES_TRAIN), ("test_unseen", W.NAMES_TEST)):
    msgs = W.dataset(seed * 100 + 13 + (name == "test_unseen"), 1000, [A, B], names=names, world_p=[0.5, 0.5])
    RA = read_msgs(mA, A, rcA, msgs)
    # B gold cut
    ins = [(sp, r) for M in msgs for sp, r in spans(M, "errands")]
    bstd = V.encode_inputs([x[0] for x in ins], B, st)
    with torch.no_grad(): scs = rcB.scores(sB.states(bstd))
    B_goldcut = np.mean([V.finalize(rcB.read(scs, j, V.cand_of([st.idx[t] for t in x[0]])), thrB) == V.gold_key(x[1]) for j, x in enumerate(ins)])
    # B direct on whole messages (reference)
    RBd = read_msgs(mB, B, rcB, msgs)
    # zones of A -> B
    zin, zown = [], []
    for k, (M, R) in enumerate(zip(msgs, RA)):
        for (s0, s1) in W.zones([not e for e in R["explained"]], M["toks"]):
            zin.append({"toks": M["toks"][s0:s1], "labels": [-1] * (s1 - s0)}); zown.append((k, s0, s1))
    RBz = read_msgs(mB, B, rcB, zin)
    c = dict(A_ok=0, A_gold=0, B_ok=0, B_gold=0, A_on_B=0, B_on_A=0, A_extra=0, B_extra=0, Bdirect_ok=0, Bdirect_on_A=0,
             z_tp=0, z_fp=0, z_fn=0, lz_tp=0, lz_fp=0, lz_fn=0)
    leftover = {k: [] for k in range(len(msgs))}
    Bfound = {k: set() for k in range(len(msgs))}
    for (k, s0, s1), Z, R in zip(zown, zin, RBz):
        M = msgs[k]; trig = {r["act_pos"]: r for r in M["reqs"]}
        for (q, rd, nl, cg) in R["cent"]:
            if cg not in R["acc"]: continue
            p = s0 + q; f = V.finalize(rd, thrB)
            if p in trig and trig[p]["world"] == "errands": Bfound[k].add(p) if f == V.gold_key(trig[p]) else None
            elif p in trig: c["B_on_A"] += 1
            else: c["B_extra"] += 1
        for (z0, z1) in W.zones([not e for e in R["explained"]], Z["toks"]): leftover[k].append((s0 + z0, s0 + z1))
    for k, (M, R, Rd) in enumerate(zip(msgs, RA, RBd)):
        trig = {r["act_pos"]: r for r in M["reqs"]}
        c["A_gold"] += sum(r["world"] == "diagram" for r in M["reqs"]); c["B_gold"] += sum(r["world"] == "errands" for r in M["reqs"])
        c["B_ok"] += len(Bfound[k])
        for (q, rd, nl, cg) in R["cent"]:
            if cg not in R["acc"]: continue
            f = V.finalize(rd, thrA)
            if q in trig and trig[q]["world"] == "diagram": c["A_ok"] += f == V.gold_key(trig[q])
            elif q in trig: c["A_on_B"] += 1
            else: c["A_extra"] += 1
        for (q, rd, nl, cg) in Rd["cent"]:
            if cg not in Rd["acc"]: continue
            f = V.finalize(rd, thrB)
            if q in trig and trig[q]["world"] == "errands": c["Bdirect_ok"] += f == V.gold_key(trig[q])
            elif q in trig: c["Bdirect_on_A"] += 1
        # A's zones vs gold "not an A request" zones; leftover vs gold pure chatter zones
        gzA = set(W.zones([l < 0 or M["reqs"][l]["world"] != "diagram" for l in M["labels"]], M["toks"]))
        pzA = set(W.zones([not e for e in R["explained"]], M["toks"]))
        c["z_tp"] += len(gzA & pzA); c["z_fp"] += len(pzA - gzA); c["z_fn"] += len(gzA - pzA)
        gl = set(W.zones([l < 0 for l in M["labels"]], M["toks"])); pl = set(leftover[k])
        c["lz_tp"] += len(gl & pl); c["lz_fp"] += len(pl - gl); c["lz_fn"] += len(gl - pl)
    r = {"A_acc": c["A_ok"] / c["A_gold"], "B_from_zones": c["B_ok"] / c["B_gold"], "B_goldcut": float(B_goldcut),
         "B_recovery_ratio": c["B_ok"] / c["B_gold"] / B_goldcut, "B_direct": c["Bdirect_ok"] / c["B_gold"],
         "A_on_B_per_Breq": c["A_on_B"] / c["B_gold"], "B_on_A_per_Areq": c["B_on_A"] / c["A_gold"],
         "Bdirect_on_A_per_Areq": c["Bdirect_on_A"] / c["A_gold"],
         "A_extra_rate": c["A_extra"] / c["A_gold"], "B_extra_rate": c["B_extra"] / c["B_gold"],
         "A_zone_F1": f1(c["z_tp"], c["z_fp"], c["z_fn"]), "leftover_chatter_F1": f1(c["lz_tp"], c["lz_fp"], c["lz_fn"]), "counts": c}
    res[name] = r
    LOG(f"[E5{' neg' if a.negatives else ''}] {name}: " + " ".join(f"{k} {v:.3f}" for k, v in r.items() if k != "counts"))
json.dump(res, open(f"logs/e5{'_neg' if a.negatives else ''}_s{seed}.json", "w"), indent=1)
LOG(f"total {time.time()-t0:.0f}s")
