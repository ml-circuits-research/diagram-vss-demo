"""
minivss.py - a small VSS reader (PyTorch, CPU) mirroring training/vss (v8_gates / trainer / sop.world / sop.infer), implementer A.

Shared principles (as in the real reader):
- fixed random phase vectors (stars) per word, per role key and for the predicate key (world.Stars); never learned;
- a word's term = (learned address, from its kind and its context) x (its star) x (learned gate of its kind); the state = sum of terms;
- target = the request's world state  R_pred x f_action + sum_r R_r x f_filler;  objective: max cos(state, target) (Adam);
- readout: unbind the predicate key / each role key, best candidate among the words of the role's kinds (sentence candidates);
  an optional role is present when (its best cosine / structure score) >= a threshold chosen on dev.

Two address schemes:
- Std (the standard reader, E0): path code = exp(i cumsum_{j<=k} path[kind_j]) from the START of the input, plus a bigram code
  exp(i bg[kind_{k-1}, kind_k]); one state per input.
- Rel (E1 / E2): one state per CENTRE (every action-kind token). LINEAR in the number of tokens: a token is attached only to its R
  nearest centres on each side (slots (side, rank)), with weight w in [0,1]; its address relative to centre c restarts at c and runs
  outwards: phase = A[side, kind_c] + sum_{j strictly after c up to i, towards i} w(j, c) th[side, kind_j]  (a prefix scan: the sum
  is computed from per-rank prefix sums of the weighted kind counts, T x R x K numbers), plus a directional bigram code with the
  neighbour on the centre's side; the centre itself is drawn at P[kind_c]. S_c = sum_{i attached to c} w_ic g[kind_i] addr_ic f_i.
  w: GOLD (E1: 1 if c is the centre of i's request, else 0) or LEARNED (E2): w = sigmoid(U[side,k_i,k_c] + V[side,k_i,dist bucket]
  + W[side,k_i,rank] - sum of a learned barrier softplus(beta[k_j]) over the tokens strictly between c and i + b0).
  rank-1 = the number of other centres between (the plan's "number of other centres between them"); the barrier is the learned
  version of "separators between them" (no hand-written separator list).
"""
import time
import numpy as np, torch
import world as W

torch.set_num_threads(2)
K = len(W.KINDS); KID = W.KIND_ID
VERB_IDS = [KID[k] for k in W.VERB_KINDS]
IS_VERB = np.zeros(K, bool); IS_VERB[VERB_IDS] = True
CDT = torch.complex64

def E(ph): return torch.polar(torch.ones_like(ph), ph)

class Lex:
    """kinds of words: lexicon of the TRAINING words (the kind of each word seen in training); unseen -> NAME by capital, else UNK"""
    def __init__(self, train_msgs):
        self.k = {}
        for m in train_msgs:
            for t in m["tokens"]: self.k[t] = W.kind_of_word(t)
    def kind(self, t):
        if t in self.k: return self.k[t]
        return "NAME" if t[:1].isupper() else "UNK"
    def kinds(self, toks): return np.array([KID[self.kind(t)] for t in toks], dtype=np.int64)

class StarTable:
    def __init__(self, D, seed):
        self.st = W.Stars(D, seed); self.D = D; self.cache = {}
        self.pred = torch.tensor(self.st.pred(), dtype=CDT); self.roles = {r: torch.tensor(self.st.role(r), dtype=CDT) for r in W.ROLES}
    def ids(self, toks):
        out = []
        for t in toks:
            v = self.cache.get(t)
            if v is None: v = self.cache[t] = torch.tensor(self.st.id(t), dtype=CDT)
            out.append(v)
        return torch.stack(out)
    def target(self, req): return torch.tensor(self.st.target(req), dtype=CDT)

def cosine(S, T):
    return torch.real((torch.conj(T) * S).sum(-1)) / (S.abs().pow(2).sum(-1).sqrt() * T.abs().pow(2).sum(-1).sqrt() + 1e-9)

# ====================================================================== the standard reader (E0)
class Std(torch.nn.Module):
    def __init__(self, D, seed):
        super().__init__(); g = torch.Generator().manual_seed(seed); u = lambda *s: (torch.rand(*s, generator=g) * 2 - 1) * np.pi
        self.path = torch.nn.Parameter(u(K, D)); self.bg0 = torch.nn.Parameter(u(K, D)); self.bg = torch.nn.Parameter(u(K, K, D))
        self.gate = torch.nn.Parameter(torch.zeros(K))
    def states(self, kinds, F, mask):
        """kinds B x T (long), F B x T x D (complex), mask B x T -> B x D"""
        ph = torch.cumsum(self.path[kinds] * mask.unsqueeze(-1), 1)
        bg = torch.cat([self.bg0[kinds[:, :1]], self.bg[kinds[:, :-1], kinds[:, 1:]]], 1)
        addr = E(ph) + E(bg)
        return (addr * F * (torch.sigmoid(self.gate)[kinds] * mask).unsqueeze(-1)).sum(1)

def pad_batch(lex, stars, seqs):
    T = max(len(s) for s in seqs); B = len(seqs); D = stars.D
    kinds = torch.zeros(B, T, dtype=torch.long); F = torch.zeros(B, T, D, dtype=CDT); mask = torch.zeros(B, T)
    for b, s in enumerate(seqs):
        n = len(s); kinds[b, :n] = torch.tensor(lex.kinds(s)); F[b, :n] = stars.ids(s); mask[b, :n] = 1
    return kinds, F, mask

def train_std(model, lex, stars, seqs, targets, epochs=3, batch=16, lr=0.02, seed=0, log=None):
    opt = torch.optim.Adam(model.parameters(), lr=lr); rng = np.random.default_rng(seed); t0 = time.time()
    tg = torch.stack(targets)
    for ep in range(epochs):
        order = rng.permutation(len(seqs)); tot = 0
        for i in range(0, len(seqs), batch):
            idx = order[i:i + batch]; kinds, F, mask = pad_batch(lex, stars, [seqs[j] for j in idx])
            loss = -cosine(model.states(kinds, F, mask), tg[idx]).mean(); opt.zero_grad(); loss.backward(); opt.step(); tot += loss.item() * len(idx)
        if log: log(f"  [std] epoch {ep} loss {tot / len(seqs):.3f} ({time.time() - t0:.0f}s)")

def std_states(model, lex, stars, seqs, batch=256):
    out = []
    with torch.no_grad():
        for i in range(0, len(seqs), batch):
            kinds, F, mask = pad_batch(lex, stars, seqs[i:i + batch]); out.append(model.states(kinds, F, mask))
    return torch.cat(out) if out else torch.zeros(0, stars.D, dtype=CDT)

# ====================================================================== readout
EVENT_OF_VERB = W.ACTION_OF
class Reader:
    def __init__(self, lex, stars):
        self.lex, self.st = lex, stars
    def read(self, S, cand_toks, thr=None):
        """S: D complex tensor; cand_toks: the candidate words (the input's tokens). -> (frame or None, color presence ratio or None,
        placed words). frame = {"event", "roles"}."""
        n = S.abs().pow(2).sum().sqrt()
        if n < 1e-9: return None, None, set()
        Sn = S / n; D = self.st.D
        byk = {}
        for t in dict.fromkeys(cand_toks): byk.setdefault(self.lex.kind(t), []).append(t)
        def best(x, kinds):
            ws = [w for k in kinds for w in byk.get(k, [])]
            if not ws: return None, 0.0
            sc = torch.real(self.st.ids(ws).conj() @ x) / np.sqrt(D); j = int(torch.argmax(sc)); return ws[j], float(sc[j])
        verb, vtop = best(Sn * self.st.pred.conj(), W.VERB_KINDS)
        if verb is None: return None, None, set()
        ev = EVENT_OF_VERB.get(verb)
        if ev is None: return None, None, set()
        roles, tops, opt = {}, [vtop], None
        for r in W.EVENTS[ev][1]:
            w, top = best(Sn * self.st.roles[r].conj(), W.ROLE_KINDS[r])
            if (ev, r) in W.OPTIONAL: opt = (r, w, top); continue
            roles[r] = w; tops.append(top)
        ratio = None
        if opt is not None:
            r, w, top = opt; core = float(np.mean(tops)); ratio = top / core if (w is not None and core > 1e-9) else 0.0
            if w is not None and thr is not None and ratio >= thr: roles[r] = w
        placed = {verb} | {w for w in roles.values() if w is not None}
        return {"event": ev, "roles": roles}, ratio, placed

def frame_eq(f, req):
    return f is not None and f["event"] == req["event"] and f["roles"] == req["roles"]

def pick_threshold(ratios_present):
    """the presence threshold for the optional role: the value that best separates ratios of requests that have it (True) from those
    that do not (False), on dev. ratios_present: list of (ratio, present)"""
    rs = sorted(set(r for r, _ in ratios_present))
    if not rs: return 0.5
    cands = [0.0] + [(a + b) / 2 for a, b in zip(rs, rs[1:])] + [rs[-1] + 1e-6]
    return max(cands, key=lambda t: sum((r >= t) == p for r, p in ratios_present))

def match(frames, reqs):
    """multiset exact matching: -> number of gold requests matched by an output frame (one to one)"""
    left = list(range(len(frames))); hit = 0
    for q in reqs:
        for j in left:
            if frame_eq(frames[j], q): left.remove(j); hit += 1; break
    return hit

# ====================================================================== the centre-relative reader (E1 / E2), linear
NB = 7
def dist_bucket(d):
    d = np.asarray(d); return np.select([d <= 1, d == 2, d == 3, d <= 5, d <= 8, d <= 12], [0, 1, 2, 3, 4, 5], 6)

def oriented(kinds, isc, R):
    """for every token i: its R nearest centres STRICTLY to the left (rank 1 = nearest), -1 if none; positions"""
    T = len(kinds); L = -np.ones((T, R), np.int64); last = []
    for i in range(T):
        for r in range(min(R, len(last))): L[i, r] = last[-1 - r]
        if isc[i]: last.append(i)
    return L

class Prep:
    """per-message precomputation (numpy), for both sides; side 0 = token right of its centre, side 1 = token left of its centre
    (computed on the reversed sequence)"""
    def __init__(self, lex, m, R):
        toks = m["tokens"]; self.T = T = len(toks); self.toks = toks; self.kinds = lex.kinds(toks)
        isc = IS_VERB[self.kinds]; self.centres = np.nonzero(isc)[0]; self.R = R
        gold_c = np.array([m["centres"][o] if o >= 0 else -1 for o in m["owner"]]) if "owner" in m else None
        self.sides = []
        for side in (0, 1):
            k = self.kinds if side == 0 else self.kinds[::-1].copy()
            L = oriented(k, isc if side == 0 else isc[::-1], R)
            pos = np.arange(T)
            cen = L if side == 0 else np.where(L >= 0, T - 1 - L, -1)          # centre positions in the ORIGINAL frame
            d = pos[:, None] - L
            gw = None
            if gold_c is not None:
                g = gold_c if side == 0 else gold_c[::-1]
                gw = ((cen == g[:, None]) & (L >= 0)).astype(np.float32)
            self.sides.append({"k": k, "L": L, "cen": cen, "db": dist_bucket(d), "gw": gw})

def collate(preps, stars, D):
    """concatenate messages into one sequence (all indices offset): attachments never cross messages, so prefix sums stay exact"""
    out = {"sides": []}; offs = np.cumsum([0] + [p.T for p in preps])
    out["F"] = stars.ids([t for p in preps for t in p.toks])
    out["kinds"] = torch.tensor(np.concatenate([p.kinds for p in preps]))
    cpos = np.concatenate([p.centres + o for p, o in zip(preps, offs)]); out["cpos"] = torch.tensor(cpos)
    cid = {int(c): j for j, c in enumerate(cpos)}; out["cid"] = cid
    for side in (0, 1):
        ss = [p.sides[side] for p in preps]
        L = np.concatenate([np.where(s["L"] >= 0, s["L"] + o, -1) for s, o in zip(ss, offs)])
        cen = np.concatenate([np.where(s["cen"] >= 0, s["cen"] + o, -1) for s, o in zip(ss, offs)])
        cidx = np.vectorize(lambda c: cid.get(int(c), -1))(cen) if cen.size else cen
        d = {"k": torch.tensor(np.concatenate([s["k"] for s in ss])), "L": torch.tensor(L), "cidx": torch.tensor(cidx, dtype=torch.long),
             "db": torch.tensor(np.concatenate([s["db"] for s in ss]), dtype=torch.long),
             # previous token (towards the centre) in the oriented frame; for the first token of a message: itself (never attached)
             "prev": torch.tensor(np.concatenate([np.maximum(np.arange(p.T) - 1, 0) + o for p, o in zip(preps, offs)]))}
        if ss[0]["gw"] is not None: d["gw"] = torch.tensor(np.concatenate([s["gw"] for s in ss]))
        if side == 1:   # oriented frame = each message reversed; F index map
            d["orig"] = torch.tensor(np.concatenate([o + p.T - 1 - np.arange(p.T) for p, o in zip(preps, offs)]))
        else: d["orig"] = torch.arange(int(offs[-1]))
        out["sides"].append(d)
    out["ckind"] = out["kinds"][out["cpos"]] if len(cpos) else torch.zeros(0, dtype=torch.long)
    out["n"] = len(cpos); out["offs"] = offs
    return out

class Rel(torch.nn.Module):
    def __init__(self, D, seed, R=2, learned=True, uniform=False):
        super().__init__(); self.uniform = uniform; g = torch.Generator().manual_seed(seed); u = lambda *s: (torch.rand(*s, generator=g) * 2 - 1) * np.pi
        self.R, self.D, self.learned = R, D, learned
        self.P = torch.nn.Parameter(u(K, D)); self.A = torch.nn.Parameter(u(2, K, D)); self.th = torch.nn.Parameter(u(2, K, D))
        self.bg = torch.nn.Parameter(u(2, K, K, D)); self.gate = torch.nn.Parameter(torch.zeros(K))
        if learned:
            self.U = torch.nn.Parameter(torch.zeros(2, K, K)); self.V = torch.nn.Parameter(torch.zeros(2, K, NB))
            self.Wr = torch.nn.Parameter(torch.zeros(2, K, R)); self.beta = torch.nn.Parameter(torch.full((K,), -2.0))
            self.b0 = torch.nn.Parameter(torch.zeros(()))

    def weights(self, c, s, side):
        """w: T x R for one side (oriented frame)"""
        valid = (s["L"] >= 0).float()
        if self.uniform: return valid                       # control: every attached token with weight 1 (no attention)
        if not self.learned: return s["gw"] * valid
        k = s["k"]; T = k.shape[0]
        bp = torch.cat([torch.zeros(1), torch.cumsum(torch.nn.functional.softplus(self.beta[k]), 0)])   # bp[x] = sum_{j<x}
        Lc = s["L"].clamp(min=0)
        between = bp[torch.arange(T).unsqueeze(1)] - bp[Lc + 1]                                       # sum over c < j < i
        kc = c["kinds"][c["sides"][0]["orig"]] if False else s["k"][Lc]
        sc = self.U[side, k.unsqueeze(1), kc] + self.V[side, k.unsqueeze(1), s["db"]] + self.Wr[side, k].reshape(T, self.R) - between + self.b0
        return torch.sigmoid(sc) * valid

    def side_terms(self, c, side, F, chunk=None):
        s = c["sides"][side]; k = s["k"]; T = k.shape[0]; R = self.R
        w = self.weights(c, s, side)                                                                  # T x R
        oh = torch.nn.functional.one_hot(k, K).float()                                                # T x K
        Q = torch.cat([torch.zeros(1, R, K), torch.cumsum(w.unsqueeze(-1) * oh.unsqueeze(1), 0)], 0)   # Q[x, s] = sum_{j<x} w[j,s] oh_j
        L = s["L"]; Fo = F[s["orig"]]; g = torch.sigmoid(self.gate)
        S = torch.zeros(c["n"], self.D, dtype=CDT)
        rng_ = range(0, T, chunk) if chunk else [0]
        for a in rng_:
            b = min(T, a + chunk) if chunk else T; ii = torch.arange(a, b)
            for r in range(R):                                                                         # slot rank r+1
                Lr = L[a:b, r]; ok = Lr >= 0
                if not bool(ok.any()): continue
                cnt = torch.zeros(b - a, K)
                for sg in range(r + 1):                                                                 # segments: rank sg+1
                    lo = L[a:b, r - sg].clamp(min=0)                                                   # segment (lo, hi]
                    hi = L[a:b, r - sg - 1].clamp(min=0) if r - sg - 1 >= 0 else ii
                    cnt = cnt + Q[hi + 1, sg] - Q[lo + 1, sg]
                kc = k[Lr.clamp(min=0)]
                ph = self.A[side, kc] + cnt @ self.th[side]
                addr = E(ph) + E(self.bg[side, k[s["prev"][a:b]], k[a:b]])
                coef = (w[a:b, r] * g[k[a:b]] * ok.float()).to(CDT).unsqueeze(-1)
                S.index_add_(0, s["cidx"][a:b, r].clamp(min=0), coef * addr * Fo[a:b] * ok.to(CDT).unsqueeze(-1))
        return S, w

    def states(self, c, chunk=None):
        F = c["F"]
        S0, w0 = self.side_terms(c, 0, F, chunk); S1, w1 = self.side_terms(c, 1, F, chunk)
        self_t = E(self.P[c["ckind"]]) * F[c["cpos"]] * torch.sigmoid(self.gate)[c["ckind"]].to(CDT).unsqueeze(-1)
        return S0 + S1 + self_t, (w0, w1)

def rel_targets(preps, msgs, stars):
    """per collated batch: (centre indices that are gold centres, their targets)"""
    idx, tg, base = [], [], 0
    for p, m in zip(preps, msgs):
        cl = list(p.centres)
        for q, c in zip(m["requests"], m["centres"]): idx.append(base + cl.index(c)); tg.append(stars.target(q))
        base += len(cl)
    return torch.tensor(idx, dtype=torch.long), torch.stack(tg)

def train_rel(model, lex, stars, msgs, epochs=3, batch=32, lr=0.02, seed=0, log=None):
    preps = [Prep(lex, m, model.R) for m in msgs]
    opt = torch.optim.Adam(model.parameters(), lr=lr); rng = np.random.default_rng(seed); t0 = time.time()
    for ep in range(epochs):
        order = rng.permutation(len(msgs)); tot = n = 0
        for i in range(0, len(msgs), batch):
            ids = order[i:i + batch]; pp = [preps[j] for j in ids]; mm = [msgs[j] for j in ids]
            c = collate(pp, stars, stars.D); S, _ = model.states(c); gi, tg = rel_targets(pp, mm, stars)
            loss = -cosine(S[gi], tg).mean(); opt.zero_grad(); loss.backward(); opt.step(); tot += loss.item(); n += 1
        if log: log(f"  [rel {'uniform' if model.uniform else 'learned' if model.learned else 'gold'}] epoch {ep} loss {tot / n:.3f} ({time.time() - t0:.0f}s)")

def rel_read_all(model, lex, stars, msgs, batch=64, chunk=None):
    """-> per message: list over centres of (centre position, state, window candidate tokens, {position: weight to this centre}).
    The window of a centre = the tokens attached to it by a slot (rank <= R on either side), whatever their weight. Linear in T."""
    out = []
    with torch.no_grad():
        for i in range(0, len(msgs), batch):
            mm = msgs[i:i + batch]; pp = [Prep(lex, m, model.R) for m in mm]; c = collate(pp, stars, stars.D)
            S, (w0, w1) = model.states(c, chunk); base = 0; off = c["offs"]
            for j, (p, m) in enumerate(zip(pp, mm)):
                T = p.T; o = int(off[j]); att = {int(cc): {int(cc): 1.0} for cc in p.centres}
                for side, w in ((0, w0), (1, w1)):
                    cen = p.sides[side]["cen"]; ww = w[o:o + T].numpy()
                    orig = np.arange(T) if side == 0 else T - 1 - np.arange(T)
                    tt, rr = np.nonzero(cen >= 0)
                    for t, r in zip(tt.tolist(), rr.tolist()):
                        d = att[int(cen[t, r])]; po = int(orig[t]); d[po] = max(d.get(po, 0.0), float(ww[t, r]))
                res = []
                for q, cc in enumerate(p.centres):
                    a = att[int(cc)]; res.append((int(cc), S[base + q], [p.toks[t] for t in sorted(a)], a))
                base += len(p.centres); out.append(res)
    return out
