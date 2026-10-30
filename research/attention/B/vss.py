"""
vss.py (implementer B) -- a mini-VSS reader (PyTorch, CPU) and the centre readers for the attention experiments.

Stars: fixed random unit-modulus complex vectors (word identities F, one per word of the shared vocabulary; role keys R_r and the
predicate key P per world). Target of a request: P (x) F[action word] + sum_r R_r (x) F[filler]. Objective: max cos(state, target).
Reading: unbind P and each role key, best candidate among the input's words of the right kinds (contract: the answer is a word of the
input); optional roles by a presence ratio chosen on dev; one-to-one (a word fills at most as many roles as it occurs).

StandardReader (E0): state = sum_i g[k_i] * (exp(i path_i) + exp(i bgL[k_{i-1},k_i]) + exp(i bgR[k_i,k_{i+1}])) * F_i,
  path_i = sum_{j<=i} thP[k_j] from the start of the input (prefix scan).
CentreReader (E1-E3, E5): every action-kind word is a centre; every other word is attached to AT MOST TWO centres, the nearest one on
  its left and the nearest one on its right (bounded: cost linear in tokens). For centre c and attached word i:
    state_c = sum_i w_ic * (exp(i rel_ic) + bgL_i + bgR_i) * F_i
    rel_ic  = centre-relative path: sum of thR[k_j] for j in (c, i] (word right of c) or sum of thL[k_j] for j in [i, c) (left of c),
              both differences of prefix sums (the beacon-relative emitter generalised: the centre is the beacon, every attached word
              is drawn relative to it); the centre itself at exp(i thC[k_c]).
    w_ic    = sigmoid(A[k_i, k_c, side] + Dist[side, min(|i-c|,15)] + sum_{j strictly between} beta[side, k_j]) * (1 - n_i)
              (barrier term = learned per-kind cost of every word between, e.g. separators and other words; prefix sums)
    n_i     = 0, or (null centre, E3b) sigmoid(N0[k_i] + N1[k_{i-1}] + N2[k_{i+1}] + N3[k_{i-2}] + N4[k_{i+2}]): the probability that
              word i is attached to the NULL centre (chatter / another world). A centre c with n_c >= 0.5 is rejected.
    gold mode (E1): w_ic = 1 if word i belongs to c's request in the gold, else 0.
"""
import math, time
import numpy as np, torch
import world as W

torch.set_num_threads(1)
CDT = torch.complex64; RDT = torch.float32


def E(ph): return torch.polar(torch.ones_like(ph), ph)


class Stars:
    def __init__(self, vocab, worlds, D, seed):
        rng = np.random.default_rng(1000 + seed)
        self.vocab = sorted(vocab); self.idx = {w: i for i, w in enumerate(self.vocab)}; self.D = D
        self.F = torch.tensor(np.exp(1j * rng.uniform(-np.pi, np.pi, (len(self.vocab), D))), dtype=CDT)
        self.keys = {}
        for w in worlds:
            for r in ["__pred__"] + w.roles: self.keys[(w.name, r)] = torch.tensor(np.exp(1j * rng.uniform(-np.pi, np.pi, D)), dtype=CDT)

    def target(self, wname, req):
        t = self.keys[(wname, "__pred__")] * self.F[self.idx[req["act"]]]
        for r, v in req["roles"].items(): t = t + self.keys[(wname, r)] * self.F[self.idx[v]]
        return t


# ------------------------------------------------------------------ encoding (numpy, linear in tokens)
class Batch: pass


def encode_inputs(inputs, world, stars):
    """inputs: list of token lists (each one input = one segment). Returns flat arrays for the StandardReader."""
    K = len(world.kinds); kid = {k: i for i, k in enumerate(world.kinds)}
    ids, kinds, seg, kp, kn = [], [], [], [], []
    for s, toks in enumerate(inputs):
        ks = [kid[world.kind(t)] for t in toks]
        ids += [stars.idx[t] for t in toks]; kinds += ks; seg += [s] * len(toks)
        kp += [K] + ks[:-1]; kn += ks[1:] + [K + 1]
    b = Batch(); b.n = len(inputs)
    b.ids, b.kinds, b.seg, b.kp, b.kn = (torch.tensor(np.array(x, dtype=np.int64)) for x in (ids, kinds, seg, kp, kn))
    starts = np.zeros(len(inputs), dtype=np.int64); c = 0
    for s, toks in enumerate(inputs): starts[s] = c; c += len(toks)
    b.start = torch.tensor(starts)
    return b


def encode_messages(msgs, world, stars, train=False):
    """messages -> flat arrays for the CentreReader. Centres = action-kind tokens. Per token: nearest centre left / right in its message
    (global centre index or -1), distances; gold weights for E1. Per centre: token index, message, gold request (or -1)."""
    K = len(world.kinds); kid = {k: i for i, k in enumerate(world.kinds)}; isact = np.array([world.is_act_kind(k) for k in world.kinds])
    ids, kinds, kp, kn, kp2, kn2, msg, pos = [], [], [], [], [], [], [], []
    lc, rc, dl, dr, gl, gr = [], [], [], [], [], []
    ctok, cmsg, creq, cworld_ok = [], [], [], []
    off = 0; cbase = 0
    for m, M in enumerate(msgs):
        toks = M["toks"]; T = len(toks); ks = [kid[world.kind(t)] for t in toks]
        ids += [stars.idx[t] for t in toks]; kinds += ks
        kp += [K] + ks[:-1]; kn += ks[1:] + [K + 1]; kp2 += ([K, K] + ks)[:T]; kn2 += (ks[2:] + [K + 1, K + 1])[:T]
        msg += [m] * T; pos += list(range(T))
        cpos = [i for i in range(T) if isact[ks[i]]]
        trig = {}
        for ri, r in enumerate(M.get("reqs", [])):
            if r.get("world", world.name) == world.name and "act_pos" in r: trig[r["act_pos"]] = ri
        cidx = {p: cbase + j for j, p in enumerate(cpos)}
        for p in cpos:
            ctok.append(off + p); cmsg.append(m); creq.append(trig.get(p, -1))
        labels = M.get("labels", [-1] * T)
        last = -1
        L = [-1] * T
        for i in range(T):
            if isact[ks[i]]: last = i; L[i] = -1
            else: L[i] = last
        R = [-1] * T; nxt = -1
        for i in range(T - 1, -1, -1):
            if isact[ks[i]]: nxt = i; R[i] = -1
            else: R[i] = nxt
        for i in range(T):
            lc.append(cidx[L[i]] if L[i] >= 0 else -1); rc.append(cidx[R[i]] if R[i] >= 0 else -1)
            dl.append(min(i - L[i], 15) if L[i] >= 0 else 0); dr.append(min(R[i] - i, 15) if R[i] >= 0 else 0)
            # gold attachment: word i belongs to the request whose trigger is that centre
            gl.append(1.0 if L[i] >= 0 and labels[i] >= 0 and trig.get(L[i], -9) == labels[i] else 0.0)
            gr.append(1.0 if R[i] >= 0 and labels[i] >= 0 and trig.get(R[i], -9) == labels[i] else 0.0)
        off += T; cbase += len(cpos)
    b = Batch(); b.nmsg = len(msgs); b.N = off; b.C = cbase
    for name, x in (("ids", ids), ("kinds", kinds), ("kp", kp), ("kn", kn), ("kp2", kp2), ("kn2", kn2), ("msg", msg), ("pos", pos),
                    ("lc", lc), ("rc", rc), ("dl", dl), ("dr", dr), ("ctok", ctok), ("cmsg", cmsg), ("creq", creq)):
        setattr(b, name, torch.tensor(np.array(x, dtype=np.int64)))
    b.gl = torch.tensor(np.array(gl, dtype=np.float32)); b.gr = torch.tensor(np.array(gr, dtype=np.float32))
    b.isc = torch.zeros(b.N, dtype=torch.bool); b.isc[b.ctok] = True
    return b


# ------------------------------------------------------------------ models
class StandardReader(torch.nn.Module):
    def __init__(self, K, D, seed):
        super().__init__(); g = torch.Generator().manual_seed(seed)
        u = lambda *s: torch.nn.Parameter((torch.rand(*s, generator=g) * 2 - 1) * math.pi)
        self.thP = u(K, D); self.bgL = u(K + 2, K, D); self.bgR = u(K, K + 2, D); self.gate = torch.nn.Parameter(torch.zeros(K))

    def states(self, b):
        th = self.thP[b.kinds].double()
        P = torch.cat([torch.zeros(1, th.shape[1], dtype=th.dtype), torch.cumsum(th, 0)], 0)     # P[t] = sum_{j<t}
        st = b.start[b.seg]
        path = (P[1:] - P[st]).float()
        addr = E(path) + E(self.bgL[b.kp, b.kinds]) + E(self.bgR[b.kinds, b.kn])
        term = torch.sigmoid(self.gate[b.kinds]).unsqueeze(-1) * addr * F_GLOBAL[b.ids]
        S = torch.zeros(b.n, term.shape[1], dtype=CDT); S.index_add_(0, b.seg, term)
        return S


class CentreReader(torch.nn.Module):
    def __init__(self, K, D, seed, mode="learned", null=False, ck=False):
        """ck (E3d): the centre-relative phases depend on the CENTRE's kind too (thR[k_c, k_j], thL[k_c, k_j]), as the verb-order
        route of v8 (vo keyed by the nearest verb's category); one prefix scan per centre kind (still linear)."""
        super().__init__(); g = torch.Generator().manual_seed(seed); self.mode, self.null, self.K, self.ck = mode, null, K, ck
        u = lambda *s: torch.nn.Parameter((torch.rand(*s, generator=g) * 2 - 1) * math.pi)
        self.thR = u(K, D); self.thL = u(K, D); self.thC = u(K, D); self.bgL = u(K + 2, K, D); self.bgR = u(K, K + 2, D)
        if ck: self.thR2 = u(K, K, D); self.thL2 = u(K, K, D)
        self.A = torch.nn.Parameter(torch.zeros(K, K, 3)); self.Dist = torch.nn.Parameter(torch.zeros(3, 16))
        self.beta = torch.nn.Parameter(torch.zeros(2, K))
        if null: self.Nw = torch.nn.Parameter(torch.zeros(5, K + 2))
        with torch.no_grad(): self.A[:, :, 2] = 3.0                       # a centre starts attached to itself

    def null_prob(self, b):
        if not self.null: return torch.zeros(b.N)
        Nw = self.Nw
        return torch.sigmoid(Nw[0, b.kinds] + Nw[1, b.kp] + Nw[2, b.kn] + Nw[3, b.kp2] + Nw[4, b.kn2])

    def weights(self, b):
        """(wL, wR, wS): weight of each token to its left centre, right centre, and of each centre token to itself"""
        kc = b.kinds[b.ctok]; n = self.null_prob(b); keep = 1 - n
        if self.mode == "gold":
            return b.gl, b.gr, torch.ones(b.C), n
        bR = self.beta[1][b.kinds].double(); bL = self.beta[0][b.kinds].double()
        QR = torch.cat([torch.zeros(1, dtype=bR.dtype), torch.cumsum(bR, 0)]); QL = torch.cat([torch.zeros(1, dtype=bL.dtype), torch.cumsum(bL, 0)])
        idx = torch.arange(b.N)
        hasL = b.lc >= 0; hasR = b.rc >= 0
        lcs = b.lc.clamp(min=0); rcs = b.rc.clamp(min=0)
        ctL = b.ctok[lcs]; ctR = b.ctok[rcs]
        # word right of its left centre (side 1): words strictly between = (ctL, i)
        barR = (QR[idx] - QR[ctL + 1]).float()
        sL = self.A[b.kinds, b.kinds[ctL], 1] + self.Dist[1, b.dl] + barR
        # word left of its right centre (side 0): words strictly between = (i, ctR)
        barL = (QL[ctR] - QL[idx + 1]).float()
        sR = self.A[b.kinds, b.kinds[ctR], 0] + self.Dist[0, b.dr] + barL
        wL = torch.sigmoid(sL) * hasL * keep; wR = torch.sigmoid(sR) * hasR * keep
        wS = torch.sigmoid(self.A[kc, kc, 2] + self.Dist[2, 0]) * keep[b.ctok]
        return wL, wR, wS, n

    def ptab(self, side):
        """(E, K, D) phase table and a map centre-kind -> row: E = 1 (shared) or K (by centre kind)"""
        if self.ck: return (self.thR2 if side == "R" else self.thL2), (lambda kc: kc)
        return (self.thR if side == "R" else self.thL).unsqueeze(0), (lambda kc: torch.zeros_like(kc))

    def states(self, b, return_w=False):
        wL, wR, wS, n = self.weights(b)
        D = self.thR.shape[1]
        idx = torch.arange(b.N); lcs = b.lc.clamp(min=0); rcs = b.rc.clamp(min=0); ctL = b.ctok[lcs]; ctR = b.ctok[rcs]
        tR, mR = self.ptab("R"); tL, mL = self.ptab("L")
        kcs = b.kinds[b.ctok]; used = torch.unique(mR(kcs)) if b.C else torch.zeros(1, dtype=torch.long)
        comp = torch.zeros(tR.shape[0], dtype=torch.long); comp[used] = torch.arange(len(used))
        PR = torch.zeros(len(used), b.N + 1, D, dtype=torch.float64); PL = torch.zeros(len(used), b.N + 1, D, dtype=torch.float64)
        for j, e in enumerate(used.tolist()):                                  # one prefix scan per centre kind present
            PR[j, 1:] = torch.cumsum(tR[e][b.kinds].double(), 0); PL[j, 1:] = torch.cumsum(tL[e][b.kinds].double(), 0)
        eL = comp[mR(b.kinds[ctL])]; eR = comp[mL(b.kinds[ctR])]
        Fi = F_GLOBAL[b.ids]
        bg = (E(self.bgL[b.kp, b.kinds]) + E(self.bgR[b.kinds, b.kn])) * Fi
        relR = (PR[eL, idx + 1] - PR[eL, ctL + 1]).float()                 # sum_{j in (c, i]} thR
        relL = (PL[eR, ctR] - PL[eR, idx]).float()                         # sum_{j in [i, c)} thL
        S = torch.zeros(b.C, D, dtype=CDT)
        S.index_add_(0, lcs, wL.unsqueeze(-1) * (E(relR) * Fi + bg))
        S.index_add_(0, rcs, wR.unsqueeze(-1) * (E(relL) * Fi + bg))
        ct = b.ctok
        S.index_add_(0, torch.arange(b.C), wS.unsqueeze(-1) * (E(self.thC[b.kinds[ct]]) * Fi[ct] + bg[ct]))
        if return_w: return S, (wL, wR, wS, n)
        return S


def states_stream(model, b, chunk=4096):
    """the same states as CentreReader.states, computed in token chunks with running prefix sums (the carry) so that memory is
    O(chunk x D x E + centres x D) and time O(tokens x D x E), E = number of phase tables (1, or one per centre kind present: E3d).
    Pass 1: running prefix sums, kept only at the centres (PR[c+1], PL[c] of the centre's own table).
    Pass 2: per chunk, every token's contributions to its <= 2 centres, from the chunk's running prefix and the centre's stored value."""
    with torch.no_grad():
        wL, wR, wS, n = model.weights(b)                                      # scalars per token: O(N)
        D = model.thR.shape[1]; N = b.N; ct = b.ctok
        tR, mR = model.ptab("R"); tL, mL = model.ptab("L")
        kcs = b.kinds[ct]; used = torch.unique(mR(kcs)) if b.C else torch.zeros(1, dtype=torch.long)
        comp = torch.zeros(tR.shape[0], dtype=torch.long); comp[used] = torch.arange(len(used)); nE = len(used)
        ec = comp[mR(kcs)] if b.C else torch.zeros(0, dtype=torch.long)       # table row of each centre
        tRu = tR[used].double(); tLu = tL[used].double()                      # nE x K x D
        PRc = torch.zeros(b.C, D, dtype=torch.float64); PLc = torch.zeros(b.C, D, dtype=torch.float64)
        def scan(carryR, carryL, k):
            cR = carryR.unsqueeze(1) + torch.cumsum(tRu[:, k], 1)                                   # nE x n x D: PR[t+1]
            cL = torch.cat([carryL.unsqueeze(1), carryL.unsqueeze(1) + torch.cumsum(tLu[:, k], 1)], 1)  # nE x n+1 x D: PL[t]
            return cR, cL
        carryR = torch.zeros(nE, D, dtype=torch.float64); carryL = torch.zeros(nE, D, dtype=torch.float64)
        for s0 in range(0, N, chunk):
            s1 = min(N, s0 + chunk); cR, cL = scan(carryR, carryL, b.kinds[s0:s1])
            cs = torch.arange(int(torch.searchsorted(ct, s0)), int(torch.searchsorted(ct, s1)))
            if len(cs): PRc[cs] = cR[ec[cs], ct[cs] - s0]; PLc[cs] = cL[ec[cs], ct[cs] - s0]
            carryR = cR[:, -1]; carryL = cL[:, -1]
        S = torch.zeros(b.C, D, dtype=CDT)
        carryR = torch.zeros(nE, D, dtype=torch.float64); carryL = torch.zeros(nE, D, dtype=torch.float64)
        for s0 in range(0, N, chunk):
            s1 = min(N, s0 + chunk); sl = slice(s0, s1); k = b.kinds[sl]; cR, cL = scan(carryR, carryL, k); loc = torch.arange(s1 - s0)
            Fi = F_GLOBAL[b.ids[sl]]
            bg = (E(model.bgL[b.kp[sl], k]) + E(model.bgR[k, b.kn[sl]])) * Fi
            lcs = b.lc[sl].clamp(min=0); rcs = b.rc[sl].clamp(min=0)
            eL = ec[lcs] if b.C else torch.zeros_like(lcs); eR = ec[rcs] if b.C else torch.zeros_like(rcs)
            relR = (cR[eL, loc] - PRc[lcs]).float()
            relL = (PLc[rcs] - cL[eR, loc]).float()
            S.index_add_(0, lcs, wL[sl].unsqueeze(-1) * (E(relR) * Fi + bg))
            S.index_add_(0, rcs, wR[sl].unsqueeze(-1) * (E(relL) * Fi + bg))
            cs = torch.arange(int(torch.searchsorted(ct, s0)), int(torch.searchsorted(ct, s1)))
            if len(cs):
                tl = ct[cs] - s0
                S.index_add_(0, cs, wS[cs].unsqueeze(-1) * (E(model.thC[k[tl]]) * Fi[tl] + bg[tl]))
            carryR = cR[:, -1]; carryL = cL[:, -1]
            del Fi, bg, relR, relL, cR, cL
        return S


F_GLOBAL = None


def set_stars(st):
    global F_GLOBAL; F_GLOBAL = st.F


def cosloss(S, T):
    c = torch.real((torch.conj(T) * S).sum(-1)) / (S.abs().pow(2).sum(-1).sqrt() * T.abs().pow(2).sum(-1).sqrt() + 1e-9)
    return -c.mean()


# ------------------------------------------------------------------ reading
class ReadCtx:
    def __init__(self, world, stars):
        self.w, self.st = world, stars; F = stars.F
        self.keys = {r: stars.keys[(world.name, r)] for r in ["__pred__"] + world.roles}
        self.KF = {r: torch.conj(k.unsqueeze(0) * F) for r, k in self.keys.items()}          # V x D
        self.wkind = [world.kind(v) for v in stars.vocab]

    def scores(self, S):
        Sn = S / (S.abs().pow(2).sum(-1, keepdim=True).sqrt() + 1e-9)
        D = S.shape[1]
        return {r: (torch.real(Sn @ KF.T) / math.sqrt(D)).numpy() for r, KF in self.KF.items()}

    def read(self, sc, n, cand):
        """sc: score dict, n: state row, cand: dict word id -> count. Returns reading dict or None (abstain)."""
        w = self.w; acts = [i for i in cand if self.wkind[i].startswith("ACT_")]
        if not acts: return None
        sp = sc["__pred__"][n]; a = max(acts, key=lambda i: sp[i]); act = self.st.vocab[a]; ev = w.act_event[act]
        roles, opt, rsc = {}, {}, {}
        spec = w.spec["events"][ev]["roles"]
        for r, cls, optional in spec:
            cs = [i for i in cand if self.wkind[i] == cls]
            if not cs:
                if optional: continue
                return None
            s = sc[r][n]; best = max(cs, key=lambda i: s[i]); roles[r] = best; rsc[r] = float(s[best])
            if optional: opt[r] = float(s[best]) / max(float(sp[a]), 1e-6)
        # one-to-one over roles
        for _ in range(3):
            used = {}
            for r, i in roles.items(): used.setdefault(i, []).append(r)
            dup = [(i, rs) for i, rs in used.items() if len(rs) > cand.get(i, 1)]
            if not dup: break
            for i, rs in dup:
                rs = sorted(rs, key=lambda r: -rsc[r])
                for r in rs[cand.get(i, 1):]:
                    cls = w.role_class[r]; cs = [j for j in cand if self.wkind[j] == cls and j != i]
                    if not cs: return None
                    s = sc[r][n]; best = max(cs, key=lambda j: s[j]); roles[r] = best; rsc[r] = float(s[best])
        req = [x for r, cls, o in spec if not o and r in rsc for x in [rsc[r]]]
        conf = min([float(sp[a])] + req)
        return {"event": ev, "act": act, "roles": {r: self.st.vocab[i] for r, i in roles.items()}, "opt": opt, "conf": conf, "pred": float(sp[a])}


def finalize(rd, thr):
    if rd is None: return None
    roles = {r: v for r, v in rd["roles"].items() if r not in rd["opt"] or rd["opt"][r] >= thr}
    return (rd["event"], tuple(sorted(roles.items())))


def gold_key(req): return (req["event"], tuple(sorted(req["roles"].items())))


def cand_of(ids):
    c = {}
    for i in ids: c[i] = c.get(i, 0) + 1
    return c


def centre_windows(b):
    """per centre: the word ids that may attach to it (its window between the neighbouring centres, both included? no: excluded)"""
    ids = b.ids.numpy(); lc = b.lc.numpy(); rc = b.rc.numpy(); ct = b.ctok.numpy()
    win = [[] for _ in range(b.C)]
    for t in range(b.N):
        if lc[t] >= 0: win[lc[t]].append(ids[t])
        if rc[t] >= 0: win[rc[t]].append(ids[t])
    for c in range(b.C): win[c].append(ids[ct[c]])
    return [cand_of(x) for x in win]


def choose_thr(pairs, grid=np.linspace(0, 1.2, 25)):
    """pairs: list of (raw reading, gold key or None); returns the optional-role presence threshold maximizing correct readings"""
    best = max(grid, key=lambda t: sum(1 for rd, g in pairs if g is not None and finalize(rd, t) == g))
    return float(best)


def train_model(model, make_batch, data, epochs, bs, lr, extra_loss=None, log=None, max_seconds=None):
    opt = torch.optim.Adam(model.parameters(), lr=lr); t0 = time.time(); rng = np.random.default_rng(0); step = 0
    for ep in range(epochs):
        order = rng.permutation(len(data))
        for i in range(0, len(order), bs):
            chunk = [data[j] for j in order[i:i + bs]]
            loss = make_batch(model, chunk)
            opt.zero_grad(); loss.backward(); opt.step(); step += 1
            if log and step % 200 == 0: log(f"  ep {ep} step {step} loss {loss.item():.3f} ({time.time()-t0:.0f}s)")
            if max_seconds and time.time() - t0 > max_seconds: return time.time() - t0
    return time.time() - t0
