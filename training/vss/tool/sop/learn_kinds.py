"""
learn_kinds.py: `sop train <world> --learn_kinds M`, the SOFT PHASE of the learned kind map (training/sketch/LEARNED_KINDS.md).

What is learned. Today every word has one fixed kind (msg_to_world.py): a legend value token -> its question's kind, an event token
-> VERB, a word seen >= 8 times -> a kind of its own, every other word -> `unknown`. Here the words that the frequency rule decides
(an own kind or `unknown`) and that never fill a role in the training frames are the LEARNABLE words; each gets a distribution
p_w = softmax(l_w) over a pool of M free kinds `slot00` .. `slot<M-1>` plus `unknown`, trained jointly with the route book (path,
bigram and chainL phases, one gate per kind) by the trainer's loss, -cos(S, S_world). The other words keep their kind (given).
With --learn_kinds_verbs V the event tokens (kind VERB) are learnable too, over a pool of their own, `VERB_00` .. `VERB_<V-1>`, so a
verb kind never holds a non-verb word.

Why the role fillers are not learnable: a kind that fills a role in the training frames becomes one of the role's candidate kinds
(train.build_schema), and the reader takes the role's filler from every sentence word of those kinds. A slot shared by `it` and `the`
would make `the` a candidate object. The loss cannot see this (the decoder's candidate sets are not in it), so those words (it, them,
that, shape, shapes, arrow, line, rules ... read from the frames, not a list) keep the frequency rule's kind.

How a kind choice enters the state (straight-through Gumbel-softmax). Each OCCURRENCE j of a learnable word w draws one kind:
c_j = argmax_a (l_w[a] + gumbel), and the FORWARD pass is exactly V8.states with that hard kind sequence: every term is a word star
at a route-book address of unit modulus, the reader's own algebra. The BACKWARD pass uses the relaxed choice y_j = softmax(l_w + gumbel)
(temperature 1) through the MIXTURE OF THE COMPLEX UNIT VECTORS of the pool, never through the phases: a token's path factor
is z_j = sum_a y_j(a) exp(i path[a]), its bigram term sum_{a,b} y_(j-1)(a) y_j(b) exp(i bg[a, b]), its chain codes
sum_{a,b} y_q(a) y_k(b) exp(i A[a, b]) (and L), its gate sum_a y_j(a) g_a. For path and bigram this mixture is the exact expectation
of the term over the kind draw (the path term prod_l z_l is a product of independent factors); for the chain it is the mean-field
expectation. Mixing PHASES instead (sum_a y(a) theta_a) is not well defined on the circle: theta and theta + 2 pi are the same phase
but give different mixtures and different gradients. In the code the relaxed part is dl = y - y.detach() (value exactly 0, gradient
of y): the forward value is unchanged and the gradient is that of the mixture at the drawn kinds (first order, exact for a straight-
through estimator). The path factor uses prod_l (1 + dl . u / u_(c_l)) ~ 1 + sum_l ..., exact in value (= 1) and in the first derivative.

`unknown`: an unseen word at inference has kind `unknown` (the standard reader, unchanged). `unknown` is one choice of the pool, and
every learnable word STARTS half unknown: l_w = 0 for the M slots and log(M) for `unknown` (p_w(unknown) = 1/2, the rest spread over the
slots). A word leaves `unknown` when its occurrences pull it to a slot; a word with little evidence stays `unknown` and trains the
`unknown` address as the rare words do today. The constant log(M) is stated here, chosen once, not tuned.

Output: the hard map (argmax p_w) -> learned_kinds.tsv (word<TAB>kind for every learnable word, `unknown` included) and
learned_kinds.json (per word: count, p_max, entropy; per slot: its words), in the run folder (or --learn_kinds_out). The model is not
exported: the HARD PHASE is the standard world build with that map (msg_to_world.py KINDS_FILE=...) and the standard `sop train`.
Memory: the whole phase table is held (every slot pair can be reached): 3 K^2 + 4 K + 41 rows of D float64 for K kinds (K ~ 60).
"""
import collections, json, math, os, sys, time
import numpy as np

from . import world

UNKNOWN_KIND = "unknown"


def slot_names(m, prefix="slot"):
    return [f"{prefix}{i:02d}" for i in range(m)]


def learnable_words(legend, train, also_verbs):
    """-> (learn: Counter word -> occurrences, verbs: set of learnable event tokens, fixed: word -> kind, fillers: set)"""
    fillers = set()
    for r in train:
        for fl in r["frame"]["roles"].values(): fillers.update(world.filler_words(fl))
        fillers.update(s for s in r["frame"]["speakers"] if s)
    learn, verbs, fixed = collections.Counter(), set(), {}
    for r in train:
        for t in r["tokens"]:
            k = legend.kind(t)
            own = k is not None and k in (t, t.lower())
            if (k is None or own) and t not in fillers: learn[t] += 1
            elif also_verbs and k == "VERB" and t not in fillers: learn[t] += 1; verbs.add(t)
            else: fixed[t] = k if k is not None else UNKNOWN_KIND
    return learn, verbs, fixed, fillers


def soft_states(m, cats, dl, C, ids, mask):
    """experiment/v8_gates.V8.states (codes path, bigram, chainL) with straight-through kind choices.
    cats (B x T): the drawn (hard) kind of every token; dl (B x T x Mc, real): value 0, carries the gradient of the relaxed choice over
    the pool C (Mc kind ids; 0 at the fixed-kind and padded positions). With dl = 0 the value is V8.states(cats) (checked in run)."""
    import torch
    th = m.theta * m.root_mask; B, T = cats.shape; cdt = m.F.dtype
    E = lambda ph: torch.polar(torch.ones_like(ph), ph)
    d = dl.to(cdt); Cv = C.view(1, 1, -1)
    terms = 0
    if "path" in m.codes:
        P = E(torch.cumsum(th[m.ipath[cats]] * mask.unsqueeze(-1), 1))                          # B x T x D, as V8
        u = E(th[m.ipath])                                                                        # K x D
        r = (d @ u[C]) * torch.conj(u[cats])                                                      # B x T x D: dl . u_a / u_(c_j)
        terms = terms + P * (1 + torch.cumsum(r, 1))
    if "bigram" in m.codes:
        ph = th[m.ibg[cats[:, :-1], cats[:, 1:]]]; ph = torch.cat([th[m.ibg0[cats[:, :1]]], ph], 1); t_bg = E(ph)
        g0 = d[:, :1] @ E(th[m.ibg0[C]])                                                          # B x 1 x D: first token's choice
        if T > 1:
            G1 = E(th[m.ibg[Cv, cats[:, 1:].unsqueeze(-1)]])                                      # B x T-1 x Mc x D: bg[C_a, c_t]
            G2 = E(th[m.ibg[cats[:, :-1].unsqueeze(-1), Cv]])                                     # bg[c_(t-1), C_a]
            x = torch.einsum("bta,btad->btd", d[:, :-1], G1) + torch.einsum("bta,btad->btd", d[:, 1:], G2)
            t_bg = t_bg + torch.cat([g0, x], 1)
        else: t_bg = t_bg + g0
        terms = terms + t_bg
    if "chainL" in m.codes or "chain" in m.codes:
        sg = torch.sigmoid(m.logits)
        g = (sg[cats] + dl @ sg[C]) * mask                                                       # B x T: the gate of the chosen kind
        uu = torch.log1p(-g + 1e-9); Sx = torch.cat([torch.zeros(B, 1, dtype=m.dtype, device=m.device), torch.cumsum(uu, 1)], 1)
        EA = E(th[m.iA[cats.unsqueeze(2), cats.unsqueeze(1)]])                                  # B x T(q) x T(k) x D: A[c_q, c_k]
        GA1 = E(th[m.iA[Cv, cats.unsqueeze(-1)]])                                                # [b, k, a] = A[C_a, c_k]
        GA2 = E(th[m.iA[cats.unsqueeze(-1), Cv]])                                                # [b, q, a] = A[c_q, C_a]
        EA = EA + torch.einsum("bqa,bkad->bqkd", d, GA1) + torch.einsum("bka,bqad->bqkd", d, GA2); del GA1, GA2
        one = torch.ones((), dtype=m.dtype, device=m.device); addrs = []
        for k in range(T):
            p_root = torch.exp(Sx[:, k]).unsqueeze(-1) * one
            if k == 0: addrs.append(p_root.to(EA.dtype).expand(B, th.shape[1])); continue
            prev = torch.stack(addrs, 1)
            p = g[:, :k] * torch.exp(Sx[:, k].unsqueeze(1) - Sx[:, 1:k + 1])
            addrs.append(p_root.to(EA.dtype) + torch.einsum("bq,bqd->bd", p.to(EA.dtype), prev * EA[:, :k, k]))
        addr = torch.stack(addrs, 1)
        if "chainL" in m.codes:
            EL = E(th[m.iL[cats.unsqueeze(1), cats.unsqueeze(2)]])                              # [b, k, q] = L[c_q, c_k]
            GL1 = E(th[m.iL[Cv, cats.unsqueeze(-1)]])                                            # [b, k, a] = L[C_a, c_k]
            GL2 = E(th[m.iL[cats.unsqueeze(-1), Cv]])                                            # [b, q, a] = L[c_q, C_a]
            EL = EL + torch.einsum("bqa,bkad->bkqd", d, GL1) + torch.einsum("bka,bqad->bkqd", d, GL2); del GL1, GL2
            addrLs = []
            for k in range(T):
                rr = torch.exp(Sx[:, T] - Sx[:, k + 1])
                acc = rr.unsqueeze(-1).to(EA.dtype) * addr[:, k]
                if k < T - 1:
                    pL = g[:, k + 1:] * torch.exp(Sx[:, k + 1:T] - Sx[:, k + 1].unsqueeze(1))
                    acc = acc + torch.einsum("bq,bqd->bd", pL.to(EA.dtype), addr[:, k + 1:] * EL[:, k, k + 1:])
                addrLs.append(acc)
            addrL = torch.stack(addrLs, 1)
            gk = g.unsqueeze(-1).to(EA.dtype); addr = gk * addr + (1 - gk) * addrL
        terms = terms + addr
    return (terms * m.F[ids] * mask.unsqueeze(-1)).sum(1)


class SoftKinds:
    """the model as trainer.train_loop sees it: .theta (root row zeroed after each step) and .states(cf, ids, mask, lw=..., pool=...)"""
    def __init__(self, m, kl, pools):
        self.m, self.kl, self.pools = m, kl, pools        # kl: n_learn x Mc logits; pools: list of (C tensor, word-index mask) per pool
    @property
    def theta(self): return self.m.theta
    def draw(self, lw, mask, hard_only=False):
        import torch
        learn = (lw >= 0) & (mask > 0); lg = self.kl[lw.clamp(min=0)]                            # B x T x Mc
        if hard_only: z = lg
        else:
            u = torch.rand(lg.shape, dtype=lg.dtype, device=lg.device).clamp(1e-12, 1 - 1e-12); z = lg - torch.log(-torch.log(u))
        z = z + self.pmask[lw.clamp(min=0)]                                                      # -inf outside the word's pool
        hard = z.argmax(-1); y = torch.softmax(z, -1)
        dl = (y - y.detach()) * learn.unsqueeze(-1).to(y.dtype)
        return learn, hard, dl
    def states(self, cf, ids, mask, lw=None, hard_only=False):
        import torch
        learn, hard, dl = self.draw(lw, mask, hard_only)
        cats = torch.where(learn, self.Call[hard], cf)
        return soft_states(self.m, cats, dl, self.Call, ids, mask)


def run(a, legend, rows, seed, run_dir, status=None):
    import torch
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "experiment"))
    import trainer, v8_gates as v8
    from .train import Shim, LeanTheta
    if set(a.code_list) - {"path", "bigram", "chainL"}:
        print(f"[learn_kinds] codes {a.code_list}: only path, bigram, chainL are implemented"); return 1
    if a.device == "cpu": os.environ["CUDA_VISIBLE_DEVICES"] = ""
    torch.manual_seed(seed)
    M, V = int(a.learn_kinds), int(getattr(a, "learn_kinds_verbs", 0) or 0)
    st = world.Stars(seed, a.D, a.star_seed, None, getattr(a, "star_version", 1)); comp = world.Compiler(legend, st)
    train = [r for r in rows if r.get("split") == "train" and r["frame"]["shape"] != "unknown" and not r.get("negative")]
    learn, verbs, fixed, fillers = learnable_words(legend, train, V > 0)
    words = sorted(learn); widx = {w: i for i, w in enumerate(words)}
    slots, vslots = slot_names(M), slot_names(V, "VERB_")
    wk = dict(fixed); wk.update({f"<kind:{s}>": s for s in slots + vslots}); wk["<unknown>"] = UNKNOWN_KIND
    wk.update({w: UNKNOWN_KIND for w in words})          # placeholder: a learnable word's kind is drawn per occurrence, never read here
    shim = Shim(wk)
    m = v8.V8(shim, 1, np.random.default_rng(0), list(a.code_list), a.device, gate_init="closed")
    K = len(m.cats); P2 = 1 + K * K + K; P = m.theta.shape[0]; m.np_model = None; m.D = a.D
    lean = LeanTheta(P, a.D, np.random.default_rng(200 + seed), P2 + len(shim.vocab), np.arange(P), m.dtype, a.device)
    m.theta = lean.theta; m.root_mask = torch.ones(P, 1, dtype=m.dtype, device=a.device); m.root_mask[0] = 0
    ident = (lambda w: legend.lemma_of(w)) if legend.reader.get("identity") == "lemma" else (lambda w: w)
    m.set_F(np.array([st.id(ident(w)) for w in shim.vocab])); m.F_np = None; st.cache.clear()
    # the choice pools: Call = the kind ids of every choice (free slots + unknown, then the verb slots); pmask restricts a word to its pool
    choices = slots + [UNKNOWN_KIND] + vslots; Call = torch.tensor([m.cat_id[c] for c in choices], device=a.device); Mc = len(choices)
    pm = np.zeros((len(words), Mc)); free = np.array([c not in vslots for c in choices])
    for w, i in widx.items(): pm[i, ~free if w not in verbs else free] = -np.inf
    kl0 = np.zeros((len(words), Mc)); kl0[:, choices.index(UNKNOWN_KIND)] = math.log(M)     # every free word starts half unknown
    kl = torch.nn.Parameter(torch.tensor(kl0, dtype=m.dtype, device=a.device))
    sk = SoftKinds(m, kl, None); sk.Call = Call; sk.pmask = torch.tensor(pm, dtype=m.dtype, device=a.device)
    kept = sorted(w for w in fillers if w in fixed and fixed[w] in (w, w.lower(), UNKNOWN_KIND))
    print(f"[learn_kinds] soft phase: {len(words)} learnable words ({sum(learn.values())} occurrences; {len(verbs)} event tokens) over "
          f"{M} free slots + unknown" + (f" and {V} verb slots" if V else "") + f"; {len(fixed)} fixed-kind words, of which {len(kept)} role "
          f"fillers that keep the frequency rule's kind: {kept[:40]}; K = {K} kinds, phase table {P} rows x D {a.D} held whole | {trainer.mem_line()}", flush=True)
    # the training order and the targets: as train.train_one
    rng = np.random.default_rng(seed); order = []
    for e in range(a.epochs): order += list(rng.permutation(len(train)) if e > 0 or a.shuffle else range(len(train)))
    if a.max_train: order = order[:a.max_train]
    sents = [list(train[i]["tokens"]) for i in order]
    def target(j):
        r = train[order[j]]; return comp.wire(r["wire"], r["by"], r["tokens"])
    def encode(ss):
        B, T = len(ss), max(len(s) for s in ss)
        cf = torch.zeros(B, T, dtype=torch.long); ids = torch.zeros(B, T, dtype=torch.long); lw = torch.full((B, T), -1, dtype=torch.long)
        mask = torch.zeros(B, T, dtype=m.dtype)
        for b, toks in enumerate(ss):
            for j, t in enumerate(toks):
                ids[b, j] = shim.idx[t]; mask[b, j] = 1
                if t in widx: lw[b, j] = widx[t]
                else: cf[b, j] = m.cat_id[shim.cat[t]]
        return cf.to(a.device), ids.to(a.device), mask.to(a.device), lw.to(a.device)
    # check: with the relaxed part at 0 the forward value is V8.states of the drawn kinds
    with torch.no_grad():
        cf, ids, mask, lw = encode(sents[:4]); learn_m, hard, _ = sk.draw(lw, mask)
        cats = torch.where(learn_m, Call[hard], cf); Sv = v8.V8.states(m, cats, ids, mask)
        Ss = soft_states(m, cats, torch.zeros(cats.shape + (Mc,), dtype=m.dtype, device=a.device), Call, ids, mask)
        print(f"[learn_kinds] check: soft_states (relaxed part 0) vs V8.states: max relative difference "
              f"{float((Ss - Sv).abs().max() / Sv.abs().max()):.2e}", flush=True)
    def batch_fn(i, j):
        cf, ids, mask, lw = encode(sents[i:j])
        return cf, ids, mask, torch.tensor(np.array([target(k) for k in range(i, j)]), dtype=m.F.dtype, device=a.device), {"lw": lw}
    cnt = np.array([learn[w] for w in words], dtype=float)
    def kind_stats():
        with torch.no_grad():
            p = torch.softmax(kl + sk.pmask, -1).cpu().numpy()
        ent = -(p * np.log(np.where(p > 0, p, 1))).sum(1); pmax = p.max(1); am = p.argmax(1)
        return p, ent, pmax, am
    t0 = time.time()
    # the loop: trainer.train_loop (memory logged, root row zeroed, finite loss); the kind statistics printed after each epoch
    n_ep = max(1, a.epochs); per = len(sents) // n_ep
    opt = torch.optim.Adam([m.theta, m.logits, kl], lr=a.lr, betas=(0.9, 0.999), eps=1e-8)      # one optimizer for the whole run
    print(f"[train learn_kinds seed {seed}] start: {trainer.mem_line()}", flush=True)
    for ep in range(n_ep):
        i0, i1 = ep * per, (len(sents) if ep == n_ep - 1 else (ep + 1) * per)
        last = _epoch(trainer, sk, opt, a, batch_fn, i0, i1, f" learn_kinds seed {seed} epoch {ep}")
        p, ent, pmax, am = kind_stats()
        used = collections.Counter(choices[x] for x in am)
        print(f"[learn_kinds] epoch {ep}: loss {last:.4f}; p_w entropy (nats) mean {ent.mean():.3f}, occurrence-weighted {np.average(ent, weights=cnt):.3f} "
              f"(uniform over the pool: {math.log(M + 1):.3f}); words with p_max >= 0.9: {(pmax >= 0.9).mean():.1%} (occurrences {np.average(pmax >= 0.9, weights=cnt):.1%}); "
              f"argmax unknown {used[UNKNOWN_KIND]} words; slots used {sum(1 for c in used if c != UNKNOWN_KIND)} of {M + V} ({time.time() - t0:.0f}s) | {trainer.mem_line()}", flush=True)
    p, ent, pmax, am = kind_stats()
    hard_map = {w: choices[am[widx[w]]] for w in words}
    out = getattr(a, "learn_kinds_out", None) or os.path.join(run_dir, "learned_kinds.tsv")
    with open(out, "w") as fh:
        fh.write(f"# word\tkind: LEARNED kind map (sop train --learn_kinds {M}" + (f" --learn_kinds_verbs {V}" if V else "") + f", seed {seed}, {a.epochs} epoch(s), "
                 f"world {a.world_name}): argmax of p_w over {M} free slots + unknown" + (" (+ verb slots for the event tokens)" if V else "") +
                 "; `unknown` = the word stays unknown-kind; words not listed keep msg_to_world.py's rule\n")
        for w in words: fh.write(f"{w}\t{hard_map[w]}\n")
    by = collections.defaultdict(list)
    for w in words: by[hard_map[w]].append(w)
    rep = {"M": M, "verb_slots": V, "seed": seed, "epochs": a.epochs, "loss_last": last, "learnable_words": len(words), "fixed_words": len(fixed),
           "fillers_kept_fixed": kept,
           "entropy_mean": float(ent.mean()), "entropy_weighted": float(np.average(ent, weights=cnt)), "uniform_entropy": math.log(M + 1),
           "share_pmax_ge_0.9": float((pmax >= 0.9).mean()), "share_pmax_ge_0.9_weighted": float(np.average(pmax >= 0.9, weights=cnt)),
           "kinds_after": sorted(set(fixed.values()) | {hard_map[w] for w in words}),
           "slots": {c: sorted(({"word": w, "n": int(learn[w]), "p": round(float(pmax[widx[w]]), 3)} for w in ws), key=lambda x: -x["n"]) for c, ws in sorted(by.items())},
           "t_s": round(time.time() - t0, 1)}
    json.dump(rep, open(os.path.splitext(out)[0] + ".json", "w"), indent=1)
    print(f"[learn_kinds] hard map written: {out} ({len(words)} words; kinds after the map: {len(rep['kinds_after'])} + `unknown`)")
    for c in choices:
        ws = sorted(by.get(c, []), key=lambda w: -learn[w])
        if not ws: continue
        print(f"  {c:8s} {len(ws):4d} words, {int(sum(learn[w] for w in ws)):5d} occ: " + ", ".join(f"{w}({learn[w]},{pmax[widx[w]]:.2f})" for w in ws[:18]) + (" ..." if len(ws) > 18 else ""))
    if status: status("NOT BUILT", note=f"learn_kinds run: the kind map {out}; no model written")
    return 0


def _epoch(trainer, model, opt, a, batch_fn, i0, i1, tag):
    """the step of experiment/trainer.train_loop (the same loss, Adam, root row zeroed, finite-loss assertion, memory line) over the
    sentences i0..i1-1, batches of a.batch counted from i0 (as one train_loop over all steps when the epoch length is a multiple of it)"""
    import torch
    last = None; t0 = time.time()
    for i in range(i0, i1, a.batch):
        cb, ib, mb, t, kw = batch_fn(i, min(i + a.batch, i1)); S = model.states(cb, ib, mb, **kw)
        cos = torch.real((torch.conj(t) * S).sum(-1)) / (S.abs().pow(2).sum(-1).sqrt() * t.abs().pow(2).sum(-1).sqrt())
        assert torch.isfinite(cos).all(), f"non-finite loss at step {i}"
        loss = -cos.mean(); opt.zero_grad(set_to_none=True); loss.backward(); opt.step(); last = loss.item()
        with torch.no_grad(): model.theta[0] = 0
        del S, t, cos, loss, cb, ib, mb
        step = (i - i0) // a.batch + 1
        if step % a.log_every == 0: print(f"[train{tag}] step {step} sent {i - i0 + a.batch}/{i1 - i0} loss {last:.3f} ({time.time() - t0:.0f}s) | {trainer.mem_line()}", flush=True)
    return last
