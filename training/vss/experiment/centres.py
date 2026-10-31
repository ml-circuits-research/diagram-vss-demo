"""
centres.py -- the centre reader in torch (training side), ported from research/attention/B/vss.py (CentreReader, variant E3d: null
probability per word, attachment trained also on the annotated spans, relative phases keyed by the centre's kind). Notes and decisions:
research/attention/port/NOTES.md. The numpy twin (inference) is tool/sop/infer.py Routebook.centre_addresses; the browser twin
docs/js/vss/routebook.js centreAddresses.

Every token whose kind is a centre kind (the kinds of the legend's verbs: the learned triggers' event tokens) is a centre: one state per
centre. Every other token is attached to AT MOST the nearest centre on its left and the nearest on its right (linear in the tokens):
    S_c   = sum_{t attached to c} w_tc * (exp(i rel_tc) + bg_t) * F_t  +  wS_c * (exp(i thC[e_c]) + bg_c) * F_c
    rel   = sum of thR[e_c, k_j] for j in (c, t] (t right of c), or of thL[e_c, k_j] for j in [t, c) (t left of c): differences of prefix
            sums, one prefix scan per centre kind present (e_c = the row of the centre's kind)
    bg_t  = exp(i bgL[k_{t-1}, k_t]) + exp(i bgR[k_t, k_{t+1}])          (BOS = K, EOS = K + 1)
    w_tc  = sigmoid(A[k_t, k_c, side] + Dist[side, min(|t - c|, 15)] + sum_{j strictly between} beta[side, k_j]) * (1 - null_t)
    wS_c  = sigmoid(A[k_c, k_c, 2] + Dist[2, 0]) * (1 - null_c)
    null_t = sigmoid(N[0, k_t] + N[1, k_{t-1}] + N[2, k_{t+1}] + N[3, k_{t-2}] + N[4, k_{t+2}])
Loss (B's E3c / E3d): -mean cos(S_c, target_c) over the centres matched to an annotated request + BCE(null_c, centre not a request)
+ BCE(w_tc, token t in the request of centre c) on both sides + BCE(wS_c, centre is a request). No chainL (not linear as written; B's
design that passed has none).
"""
import math
import numpy as np, torch

CDT = torch.complex64


def E(ph): return torch.polar(torch.ones_like(ph), ph)


class CentreModel(torch.nn.Module):
    def __init__(self, cats, centre_kinds, F, D, rng, device="cpu"):
        """cats: the kind names (route book order); centre_kinds: the kinds that make a centre; F: the word stars (V x D complex numpy, the
        vocabulary order of the training shim); rng: numpy generator for the initial phases (uniform in [-pi, pi), as V8)"""
        super().__init__()
        self.cats = list(cats); K = len(self.cats); self.K = K; self.D = D; self.device = device
        self.centre_kinds = [k for k in centre_kinds if k in self.cats]; Ek = len(self.centre_kinds)
        erow = torch.full((K,), -1, dtype=torch.long)
        for e, k in enumerate(self.centre_kinds): erow[self.cats.index(k)] = e
        self.register_buffer("erow", erow)
        u = lambda *s: torch.nn.Parameter(torch.tensor(rng.uniform(-np.pi, np.pi, s), dtype=torch.float32))
        self.thR, self.thL, self.thC = u(Ek, K, D), u(Ek, K, D), u(Ek, D)
        self.bgL, self.bgR = u(K + 2, K, D), u(K, K + 2, D)
        A = torch.zeros(K, K, 3); A[:, :, 2] = 3.0                        # a centre starts attached to itself (B)
        self.A = torch.nn.Parameter(A); self.Dist = torch.nn.Parameter(torch.zeros(3, 16)); self.beta = torch.nn.Parameter(torch.zeros(2, K))
        self.N = torch.nn.Parameter(torch.zeros(5, K + 2))
        self.register_buffer("F", torch.tensor(np.asarray(F), dtype=CDT))

    def weights(self, b):
        k = b["k"]; n = torch.sigmoid(self.N[0, k] + self.N[1, b["kp"]] + self.N[2, b["kn"]] + self.N[3, b["kp2"]] + self.N[4, b["kn2"]]); keep = 1 - n
        QR = torch.cat([torch.zeros(1, dtype=torch.float64), torch.cumsum(self.beta[1][k].double(), 0)])
        QL = torch.cat([torch.zeros(1, dtype=torch.float64), torch.cumsum(self.beta[0][k].double(), 0)])
        N = k.shape[0]; idx = torch.arange(N); ct = b["ctok"]
        hasL = b["lc"] >= 0; hasR = b["rc"] >= 0; ctL = ct[b["lc"].clamp(min=0)] if len(ct) else idx; ctR = ct[b["rc"].clamp(min=0)] if len(ct) else idx
        dL = (idx - ctL).clamp(min=0, max=15); dR = (ctR - idx).clamp(min=0, max=15)
        sL = self.A[k, k[ctL], 1] + self.Dist[1, dL] + (QR[idx] - QR[(ctL + 1).clamp(max=N)]).float()
        sR = self.A[k, k[ctR], 0] + self.Dist[0, dR] + (QL[ctR] - QL[(idx + 1).clamp(max=N)]).float()
        wL = torch.sigmoid(sL) * hasL * keep; wR = torch.sigmoid(sR) * hasR * keep
        kc = k[ct]; wS = torch.sigmoid(self.A[kc, kc, 2] + self.Dist[2, 0]) * keep[ct]
        return wL, wR, wS, n

    def states(self, b):
        """b: a batch (dict of tensors, see batch()): flat tokens of several messages. -> S (C x D complex), (wL, wR, wS, null)"""
        wL, wR, wS, n = self.weights(b)
        k = b["k"]; N = k.shape[0]; ct = b["ctok"]; C = len(ct); D = self.D; idx = torch.arange(N)
        Fi = self.F[b["ids"]]
        bg = (E(self.bgL[b["kp"], k]) + E(self.bgR[k, b["kn"]])) * Fi
        S = torch.zeros(C, D, dtype=CDT)
        if C == 0: return S, (wL, wR, wS, n)
        ec = self.erow[k[ct]]; used = torch.unique(ec); comp = torch.zeros(len(self.centre_kinds), dtype=torch.long); comp[used] = torch.arange(len(used))
        PR = torch.stack([torch.cat([torch.zeros(1, D, dtype=torch.float64), torch.cumsum(self.thR[e][k].double(), 0)]) for e in used.tolist()])
        PL = torch.stack([torch.cat([torch.zeros(1, D, dtype=torch.float64), torch.cumsum(self.thL[e][k].double(), 0)]) for e in used.tolist()])
        lcs = b["lc"].clamp(min=0); rcs = b["rc"].clamp(min=0); ctL = ct[lcs]; ctR = ct[rcs]
        eL = comp[ec[lcs]]; eR = comp[ec[rcs]]
        relR = (PR[eL, idx + 1] - PR[eL, ctL + 1]).float()               # sum_{j in (c, t]} thR
        relL = (PL[eR, ctR] - PL[eR, idx]).float()                       # sum_{j in [t, c)} thL
        S = S.index_add(0, lcs, wL.unsqueeze(-1) * (E(relR) * Fi + bg))
        S = S.index_add(0, rcs, wR.unsqueeze(-1) * (E(relL) * Fi + bg))
        S = S + wS.unsqueeze(-1) * (E(self.thC[ec]) * Fi[ct] + bg[ct])
        return S, (wL, wR, wS, n)

    def loss(self, b, targets):
        """targets: M x D complex (the compiled states of the matched centres b["matched"], in that order)"""
        S, (wL, wR, wS, n) = self.states(b); bce = torch.nn.functional.binary_cross_entropy; cl = lambda x: x.clamp(1e-6, 1 - 1e-6)
        m = b["matched"]; terms = {}
        if len(m):
            Sm = S[m]; c = torch.real((torch.conj(targets) * Sm).sum(-1)) / (Sm.abs().pow(2).sum(-1).sqrt() * targets.abs().pow(2).sum(-1).sqrt() + 1e-9)
            terms["cos"] = -c.mean()
        isreq = b["isreq"]
        if len(b["ctok"]):
            terms["null"] = bce(cl(n[b["ctok"]]), 1 - isreq); terms["self"] = bce(cl(wS), isreq)
        hL = b["lc"] >= 0; hR = b["rc"] >= 0
        if hL.any(): terms["attL"] = bce(cl(wL[hL]), b["gl"][hL])
        if hR.any(): terms["attR"] = bce(cl(wR[hR]), b["gr"][hR])
        return sum(terms.values()), terms

    def export(self):
        """the arrays of the route book (infer.Routebook): phases wrapped to [-pi, pi), the rest as float64"""
        wrap = lambda x: np.angle(np.exp(1j * x.detach().cpu().numpy().astype(np.float64))).astype(np.float32)
        f = lambda x: x.detach().cpu().numpy().astype(np.float64)
        return {"cats": np.array(self.cats), "codes": np.array(["centres"]), "centre_kinds": np.array(self.centre_kinds),
                "cthR": wrap(self.thR), "cthL": wrap(self.thL), "cthC": wrap(self.thC), "cbgL": wrap(self.bgL), "cbgR": wrap(self.bgR),
                "cA": f(self.A), "cDist": f(self.Dist), "cbeta": f(self.beta), "cN": f(self.N)}


def structure(kinds, isc):
    """per message: kinds (list of K-indices) and the centre flags -> lists lc / rc (local centre index or -1) and the centre positions"""
    T = len(kinds); cent = [t for t in range(T) if isc[t]]; ci = {p: j for j, p in enumerate(cent)}
    lc = [-1] * T; rc = [-1] * T; last = -1
    for t in range(T):
        if isc[t]: last = ci[t]
        else: lc[t] = last
    nxt = -1
    for t in range(T - 1, -1, -1):
        if isc[t]: nxt = ci[t]
        else: rc[t] = nxt
    return cent, lc, rc


def batch(msgs, K):
    """msgs: list of dicts {k (kind indices), ids (vocabulary indices), isc (centre flags), req (per centre: the request index or -1),
    label (per token: the request index whose span holds it, or -1)}. -> dict of flat tensors, matched centre indices and their
    (message, request) pairs in that order"""
    k, ids, kp, kn, kp2, kn2, lc, rc, gl, gr, ctok, isreq, matched, pairs = [], [], [], [], [], [], [], [], [], [], [], [], [], []
    off = cb = 0
    for mi, m in enumerate(msgs):
        ks = list(m["k"]); T = len(ks); cent, L, R = structure(ks, m["isc"])
        k += ks; ids += list(m["ids"])
        kp += [K] + ks[:-1]; kn += ks[1:] + [K + 1]; kp2 += ([K, K] + ks)[:T]; kn2 += (ks[2:] + [K + 1, K + 1])[:T]
        for j, p in enumerate(cent):
            ctok.append(off + p); r = m["req"][j]; isreq.append(1.0 if r >= 0 else 0.0)
            if r >= 0: matched.append(cb + j); pairs.append((mi, r))
        for t in range(T):
            lc.append(cb + L[t] if L[t] >= 0 else -1); rc.append(cb + R[t] if R[t] >= 0 else -1)
            lab = m["label"][t]
            gl.append(1.0 if L[t] >= 0 and lab >= 0 and m["req"][L[t]] == lab else 0.0)
            gr.append(1.0 if R[t] >= 0 and lab >= 0 and m["req"][R[t]] == lab else 0.0)
        off += T; cb += len(cent)
    L_ = lambda x: torch.tensor(np.array(x, dtype=np.int64)); F_ = lambda x: torch.tensor(np.array(x, dtype=np.float32))
    return {"k": L_(k), "ids": L_(ids), "kp": L_(kp), "kn": L_(kn), "kp2": L_(kp2), "kn2": L_(kn2), "lc": L_(lc), "rc": L_(rc),
            "gl": F_(gl), "gr": F_(gr), "ctok": L_(ctok), "isreq": F_(isreq), "matched": L_(matched)}, pairs
