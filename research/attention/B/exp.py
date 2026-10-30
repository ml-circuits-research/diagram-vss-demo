"""
exp.py (implementer B) -- experiments E0a/E0b/E0c, E1, E2, E3a/E3b, E4 on the diagram world.
Run: python exp.py --seed 0 --exp e0a,e0b,e0c,e1,e2,e3 [--train_n 1,2,3,4] [--tag main]
Writes logs/<tag>_s<seed>.json with per-message records for dev and the test sets.
"""
import argparse, json, time, os
import numpy as np, torch
import world as W, vss as V

ap = argparse.ArgumentParser()
ap.add_argument("--seed", type=int, default=0); ap.add_argument("--D", type=int, default=256)
ap.add_argument("--exp", default="e0a"); ap.add_argument("--train_n", default="1,2,3,4"); ap.add_argument("--tag", default="main")
ap.add_argument("--ntrain", type=int, default=8000); ap.add_argument("--epochs", type=int, default=3); ap.add_argument("--bs", type=int, default=16)
ap.add_argument("--lr", type=float, default=0.02); ap.add_argument("--max_seconds", type=float, default=420)
a = ap.parse_args()
LOG = lambda s: print(s, flush=True)
A = W.World(W.DIAGRAM); B_ = W.World(W.ERRANDS)
st = V.Stars(A.vocab() | B_.vocab(), [A, B_], a.D, a.seed); V.set_stars(st)
K = len(A.kinds); seed = a.seed
trn = tuple(int(x) for x in a.train_n.split(","))
train = W.dataset(seed * 100 + 1, a.ntrain, [A], trn)
sets = {"dev": W.dataset(seed * 100 + 2, 800, [A]), "test_seen": W.dataset(seed * 100 + 3, 1000, [A]),
        "test_unseen": W.dataset(seed * 100 + 4, 1000, [A], names=W.NAMES_TEST)}
rc = V.ReadCtx(A, st)
out = {"args": vars(a)}
path = f"logs/{a.tag}_s{seed}.json"
if os.path.exists(path): out = json.load(open(path)); out["args"] = vars(a)


def rec(M, correct, extras, ztp=0, zfp=0, zfn=0, gold=None):
    return {"n": M["nreq"], "c": M["nchat"], "f": M["nfalse"], "ok": correct, "gold": M["nreq"] if gold is None else gold, "extra": extras,
            "ztp": ztp, "zfp": zfp, "zfn": zfn}


def summary(recs):
    g = sum(r["gold"] for r in recs); ok = sum(r["ok"] for r in recs); ex = sum(r["extra"] for r in recs)
    tp = sum(r["ztp"] for r in recs); fp = sum(r["zfp"] for r in recs); fn = sum(r["zfn"] for r in recs)
    f1 = 2 * tp / max(1, 2 * tp + fp + fn)
    return {"acc": ok / max(1, g), "extra_rate": ex / max(1, g), "zoneF1": f1, "gold": g}


def report(name, res):
    for s, recs in res.items():
        line = f"[{name}] {s}: all {summary(recs)['acc']:.3f} extra {summary(recs)['extra_rate']:.3f} zF1 {summary(recs)['zoneF1']:.3f} | by n: " + \
               " ".join(f"{n}:{summary([r for r in recs if r['n'] == n])['acc']:.3f}" for n in (1, 2, 3, 4)) + " | by chatter: " + \
               " ".join(f"{c}:{summary([r for r in recs if r['c'] == c])['acc']:.3f}/{summary([r for r in recs if r['c'] == c])['extra_rate']:.3f}" for c in (0, 1, 2))
        LOG(line)


# ------------------------------------------------------------------ standard reader (E0a, E0b, E0c)
def spans(M):
    return [[t for t, l in zip(M["toks"], M["labels"]) if l == i] for i in range(M["nreq"])]


def train_standard(mode):
    m = V.StandardReader(len(A.kinds), a.D, seed)
    if mode == "span":
        items = [(sp, [r]) for M in train for sp, r in zip(spans(M), M["reqs"])]
    else:
        items = [(M["toks"], M["reqs"]) for M in train]

    def mk(model, chunk):
        b = V.encode_inputs([x[0] for x in chunk], A, st); S = model.states(b)
        T = torch.stack([sum(st.target("diagram", r) for r in x[1]) for x in chunk]); return V.cosloss(S, T)
    t = V.train_model(m, mk, items, a.epochs, a.bs, a.lr, log=LOG, max_seconds=a.max_seconds); LOG(f"trained standard/{mode} in {t:.0f}s")
    return m


def read_inputs(m, inputs):
    out = []
    for i in range(0, len(inputs), 512):
        chunk = inputs[i:i + 512]; b = V.encode_inputs(chunk, A, st)
        with torch.no_grad(): sc = rc.scores(m.states(b))
        for j, toks in enumerate(chunk): out.append(rc.read(sc, j, V.cand_of([st.idx[t] for t in toks])))
    return out


def eval_e0a(m):
    raw = {}
    for s, msgs in sets.items():
        ins, golds, owner = [], [], []
        for k, M in enumerate(msgs):
            for sp, r in zip(spans(M), M["reqs"]): ins.append(sp); golds.append(V.gold_key(r)); owner.append(k)
        raw[s] = (read_inputs(m, ins), golds, owner)
    thr = V.choose_thr(list(zip(raw["dev"][0], raw["dev"][1]))); LOG(f"presence thr (dev) {thr:.2f}")
    res = {}
    for s, msgs in sets.items():
        rds, golds, owner = raw[s]; ok = np.zeros(len(msgs))
        for rd, g, k in zip(rds, golds, owner): ok[k] += V.finalize(rd, thr) == g
        res[s] = [rec(M, int(ok[k]), 0) for k, M in enumerate(msgs)]
    return res, thr


def eval_e0b(m):
    raw = {s: read_inputs(m, [M["toks"] for M in msgs]) for s, msgs in sets.items()}
    thr = V.choose_thr([(rd, V.gold_key(M["reqs"][0]) if M["nreq"] == 1 else None) for rd, M in zip(raw["dev"], sets["dev"])])
    res = {}
    for s, msgs in sets.items():
        res[s] = []
        for rd, M in zip(raw[s], msgs):
            f = V.finalize(rd, thr); ok = int(f in [V.gold_key(r) for r in M["reqs"]])
            res[s].append(rec(M, ok, 0))
    return res, thr


def hard_segments(M):
    ks = [A.kind(t) for t in M["toks"]]; cp = [i for i, k in enumerate(ks) if A.is_act_kind(k)]
    if not cp: return [], []
    cuts = [0] + cp[1:] + [len(ks)]
    return cp, [M["toks"][cuts[j]:cuts[j + 1]] for j in range(len(cp))]


def eval_e0c(m, thr):
    res = {}
    for s, msgs in sets.items():
        ins, own = [], []
        for k, M in enumerate(msgs):
            cp, segs = hard_segments(M)
            for p, sg in zip(cp, segs): ins.append(sg); own.append((k, p))
        rds = read_inputs(m, ins); ok = np.zeros(len(msgs)); ex = np.zeros(len(msgs))
        for rd, (k, p) in zip(rds, own):
            M = msgs[k]; trig = {r["act_pos"]: r for r in M["reqs"]}; f = V.finalize(rd, thr)
            if p in trig: ok[k] += f == V.gold_key(trig[p])
            elif f is not None: ex[k] += 1
        # zones: the hard cut assigns every token to a segment: no zone is ever returned
        res[s] = []
        for k, M in enumerate(msgs):
            gz = W.zones([l < 0 for l in M["labels"]], M["toks"]) if hard_segments(M)[0] else []
            res[s].append(rec(M, int(ok[k]), int(ex[k]), 0, 0, len(gz)))
    return res


# ------------------------------------------------------------------ centre readers (E1, E2, E3)
def train_centre(mode, null, sup=False, ck=False):
    m = V.CentreReader(len(A.kinds), a.D, seed, mode=mode, null=null, ck=ck)
    def mk(model, chunk):
        b = V.encode_messages(chunk, A, st); S, (wL, wR, wS, n) = model.states(b, return_w=True)
        creq = b.creq.numpy(); cm = b.cmsg.numpy(); real = np.where(creq >= 0)[0]
        T = torch.stack([st.target("diagram", chunk[cm[c]]["reqs"][creq[c]]) for c in real])
        loss = V.cosloss(S[torch.tensor(real)], T)
        if null:
            lab = torch.tensor((creq < 0).astype(np.float32)); nc = n[b.ctok].clamp(1e-6, 1 - 1e-6)
            loss = loss + torch.nn.functional.binary_cross_entropy(nc, lab)
        if sup:   # E3c: attachment weights against the gold attachment, inside the bounded window
            bce = torch.nn.functional.binary_cross_entropy
            hL = b.lc >= 0; hR = b.rc >= 0
            loss = loss + bce(wL[hL].clamp(1e-6, 1 - 1e-6), b.gl[hL]) + bce(wR[hR].clamp(1e-6, 1 - 1e-6), b.gr[hR]) \
                        + bce(wS.clamp(1e-6, 1 - 1e-6), torch.tensor((creq >= 0).astype(np.float32)))
        return loss
    t = V.train_model(m, mk, train, a.epochs, a.bs, a.lr, log=LOG, max_seconds=a.max_seconds); LOG(f"trained centre/{mode}/null={null} in {t:.0f}s")
    return m


def read_centres(m, msgs):
    """per message: list of (centre position, raw reading, null prob), explained-token weights"""
    out = []
    for i in range(0, len(msgs), 256):
        chunk = msgs[i:i + 256]; b = V.encode_messages(chunk, A, st)
        with torch.no_grad():
            S, (wL, wR, wS, n) = m.states(b, return_w=True); sc = rc.scores(S)
        wins = V.centre_windows(b); cm = b.cmsg.numpy(); ct = b.ctok.numpy(); pos = b.pos.numpy(); msgv = b.msg.numpy()
        per = [{"cent": [], "wL": [], "wR": [], "lc": [], "rc": [], "wS": {}} for _ in chunk]
        wSn = wS.numpy()
        for c in range(b.C):
            per[cm[c]]["cent"].append((int(pos[ct[c]]), rc.read(sc, c, wins[c]), float(n[ct[c]]), c)); per[cm[c]]["wS"][c] = float(wSn[c])
        lc = b.lc.numpy(); rcn = b.rc.numpy(); wL = wL.numpy(); wR = wR.numpy()
        for t in range(b.N):
            p = per[msgv[t]]; p["wL"].append(float(wL[t])); p["wR"].append(float(wR[t])); p["lc"].append(int(lc[t])); p["rc"].append(int(rcn[t]))
        out += per
    return out


def eval_centres(raws, thr, accept, gold_only=False, rho=None, only=None):
    """rho None: zone rule 1 (absolute weight >= 0.5); else zone rule 2 (weight >= rho x the centre's self-weight)"""
    res = {}
    for s, msgs in sets.items():
        if only and s not in only: continue
        res[s] = []
        for M, R in zip(msgs, raws[s]):
            trig = {r["act_pos"]: r for r in M["reqs"]}; ok = ex = 0; acc_c = set()
            for p, rd, nprob, cg in R["cent"]:
                f = V.finalize(rd, thr)
                if gold_only and p not in trig: continue
                if f is None or not accept(rd, nprob): continue
                acc_c.add(cg)
                if p in trig: ok += f == V.gold_key(trig[p])
                else: ex += 1
            cpos = {cg: p for p, _, _, cg in R["cent"]}
            cut = {cg: (0.5 if rho is None else rho * R["wS"][cg]) for cg in acc_c}
            unexpl = []
            for t in range(len(M["toks"])):
                e = (R["lc"][t] in acc_c and R["wL"][t] >= cut[R["lc"][t]]) or (R["rc"][t] in acc_c and R["wR"][t] >= cut[R["rc"][t]])
                e = e or any(cpos[cg] == t for cg in acc_c)
                unexpl.append(not e)
            pz = set(W.zones(unexpl, M["toks"])); gz = set(W.zones([l < 0 for l in M["labels"]], M["toks"]))
            res[s].append(rec(M, int(ok), ex, len(pz & gz), len(pz - gz), len(gz - pz)))
    return res


def eval_both(name, raws, thr, accept, gold_only=False):
    res1 = eval_centres(raws, thr, accept, gold_only); report(name + " zone1", res1); out[name] = res1
    rhos = np.arange(0.05, 0.951, 0.05)
    rho = max(rhos, key=lambda r: summary(eval_centres(raws, thr, accept, gold_only, rho=r, only=["dev"])["dev"])["zoneF1"])
    res2 = eval_centres(raws, thr, accept, gold_only, rho=rho); LOG(f"{name} zone rule 2 rho (dev) {rho:.2f}")
    report(name + " zone2", res2); out[name + "_z2"] = res2; out[name + "_rho"] = float(rho)


def save():
    json.dump(out, open(path, "w"))


exps = a.exp.split(",")
t0 = time.time()
if "e0a" in exps or "e0c" in exps:
    m = train_standard("span"); res, thr = eval_e0a(m); report("E0a", res); out["E0a"] = res
    if "e0c" in exps: res = eval_e0c(m, thr); report("E0c", res); out["E0c"] = res
    save()
if "e0b" in exps:
    m = train_standard("msg"); res, thr = eval_e0b(m); report("E0b", res); out["E0b"] = res; save()
if "e1" in exps:
    m = train_centre("gold", False)
    raws = {s: read_centres(m, msgs) for s, msgs in sets.items()}
    # E1 evaluation: true centres only, with gold weights -> zones are the gold zones by construction (not reported)
    thr = V.choose_thr([(rd, V.gold_key(t[p])) for M, R in zip(sets["dev"], raws["dev"]) for t in [{r["act_pos"]: r for r in M["reqs"]}]
                        for p, rd, _, _ in R["cent"] if p in t])
    res = eval_centres(raws, thr, lambda rd, n: True, gold_only=True); report("E1", res); out["E1"] = res; save()
if "e2" in exps or "e3" in exps:
    m = train_centre("learned", False)
    raws = {s: read_centres(m, msgs) for s, msgs in sets.items()}
    thr = V.choose_thr([(rd, V.gold_key(t[p])) for M, R in zip(sets["dev"], raws["dev"]) for t in [{r["act_pos"]: r for r in M["reqs"]}]
                        for p, rd, _, _ in R["cent"] if p in t])
    eval_both("E2", raws, thr, lambda rd, n: True); torch.save(m.state_dict(), f"logs/{a.tag}_s{seed}_e2.pt")
    if "e3" in exps:
        # E3a: confidence threshold chosen on dev = argmax (correct - extra)
        grid = np.linspace(-0.2, 0.6, 41)
        def dev_score(g):
            ok = ex = 0
            for M, R in zip(sets["dev"], raws["dev"]):
                trig = {r["act_pos"]: r for r in M["reqs"]}
                for p, rd, _, _ in R["cent"]:
                    f = V.finalize(rd, thr)
                    if f is None or rd["conf"] < g: continue
                    if p in trig: ok += f == V.gold_key(trig[p])
                    else: ex += 1
            return ok - ex
        g = max(grid, key=dev_score); LOG(f"E3a confidence threshold (dev) {g:.3f}"); out["E3a_thr"] = float(g)
        eval_both("E3a", raws, thr, lambda rd, n: rd["conf"] >= g)
        save()
        m = train_centre("learned", True)
        raws = {s: read_centres(m, msgs) for s, msgs in sets.items()}
        thr = V.choose_thr([(rd, V.gold_key(t[p])) for M, R in zip(sets["dev"], raws["dev"]) for t in [{r["act_pos"]: r for r in M["reqs"]}]
                            for p, rd, _, _ in R["cent"] if p in t])
        eval_both("E3b", raws, thr, lambda rd, n: n < 0.5)
        torch.save(m.state_dict(), f"logs/{a.tag}_s{seed}_e3b.pt")
    save()
if "e3c" in exps:
    m = train_centre("learned", True, sup=True)
    raws = {s: read_centres(m, msgs) for s, msgs in sets.items()}
    thr = V.choose_thr([(rd, V.gold_key(t[p])) for M, R in zip(sets["dev"], raws["dev"]) for t in [{r["act_pos"]: r for r in M["reqs"]}]
                        for p, rd, _, _ in R["cent"] if p in t])
    eval_both("E3c", raws, thr, lambda rd, n: n < 0.5)
    torch.save(m.state_dict(), f"logs/{a.tag}_s{seed}_e3c.pt")
    save()
for name, mode, ck in (("E1d", "gold", True), ("E3d", "learned", True)):
    if name.lower() not in exps: continue
    m = train_centre(mode, mode == "learned", sup=mode == "learned", ck=ck)
    raws = {s: read_centres(m, msgs) for s, msgs in sets.items()}
    thr = V.choose_thr([(rd, V.gold_key(t[p])) for M, R in zip(sets["dev"], raws["dev"]) for t in [{r["act_pos"]: r for r in M["reqs"]}]
                        for p, rd, _, _ in R["cent"] if p in t])
    if mode == "gold": res = eval_centres(raws, thr, lambda rd, n: True, gold_only=True); report(name, res); out[name] = res
    else: eval_both(name, raws, thr, lambda rd, n: n < 0.5); torch.save(m.state_dict(), f"logs/{a.tag}_s{seed}_e3d.pt")
    save()
LOG(f"total {time.time()-t0:.0f}s")
