"""
exp.py - experiments E0 (a, b, c), E1, E2 of research/attention/PLAN.md, implementer A.
Run: python exp.py --exp e0 --seeds 0 1      (writes results/<exp>_seed<k>.json and prints the tables)
Choices fixed before any run (see RESULTS.md): D 256, train 6000 messages (1-3 requests, 0-2 chatter phrases, p(false centre) 0.3 per
phrase, p(name in chatter) 0.25), dev 600 (same distribution), test 1200 (1-4 requests, all 60 names: 15 never seen in training),
3 epochs, Adam lr 0.02, batch 16 (Std) / 32 messages (Rel), R = 2 centres per side. The presence threshold of the optional role
(create.color) is chosen on dev. Test is read once.
"""
import argparse, json, os, sys, time
import numpy as np, torch
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import world as W, minivss as M

D = 256; HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "results"); os.makedirs(OUT, exist_ok=True)
CONTENT = {"NAME", "COLOR", "SHAPE", "REL"} | set(W.VERB_KINDS)
log = lambda *a: print(*a, flush=True)

def spans(ms):
    return [([t for t, o in zip(m["tokens"], m["owner"]) if o == i], q) for m in ms for i, q in enumerate(m["requests"])]

def has_unseen(q): return any(v in W.TEST_NAMES for v in q["roles"].values())

class Tally:
    """per message: gold hits (per request), outputs, zones -> tables by number of requests and chatter level"""
    def __init__(self): self.rows = []
    def add(self, m, frames, assigned=None, assigned2=None):
        hits = match_list(frames, m["requests"]); ng = len(m["requests"])
        row = {"n_req": ng, "n_chat": m["n_chat"], "hits": int(sum(hits)), "n_gold": ng, "n_out": len(frames),
               "extra": max(0, len(frames) - ng), "unseen_hits": int(sum(h for h, q in zip(hits, m["requests"]) if has_unseen(q))),
               "unseen_n": int(sum(has_unseen(q) for q in m["requests"])),
               "false_centres": int(sum(1 for t, o in zip(m["tokens"], m["owner"]) if o < 0 and t in W.ACTION_OF))}
        for tag, asg in (("z", assigned), ("z2", assigned2)):
            if asg is None: continue
            gz = set(W.gold_zones(m)); pz = set(W.zones_from_assignment(m["tokens"], asg))
            row[tag + "_tp"], row[tag + "_np"], row[tag + "_ng"] = len(gz & pz), len(pz), len(gz)
            gt = [o == -2 for t, o in zip(m["tokens"], m["owner"]) if t not in W.SEP_WORDS]
            pt = [not a for t, a in zip(m["tokens"], asg) if t not in W.SEP_WORDS]
            row[tag + "_ttp"] = int(sum(g and p for g, p in zip(gt, pt))); row[tag + "_tnp"] = int(sum(pt)); row[tag + "_tng"] = int(sum(gt))
        self.rows.append(row)
    def summary(self):
        def agg(rs):
            ng = sum(r["n_gold"] for r in rs)
            if not ng: return None
            d = {"acc": sum(r["hits"] for r in rs) / ng, "extra_per100": 100 * sum(r["extra"] for r in rs) / ng, "n_gold": ng,
                 "unseen_acc": (sum(r["unseen_hits"] for r in rs) / max(1, sum(r["unseen_n"] for r in rs)))}
            for tag in ("z", "z2"):
                if tag + "_tp" in rs[0]:
                    tp, npred, ngd = (sum(r[tag + x] for r in rs) for x in ("_tp", "_np", "_ng"))
                    p = tp / npred if npred else 1.0; rc = tp / ngd if ngd else 1.0; d[tag + "_span_f1"] = 2 * p * rc / (p + rc) if p + rc else 0.0
                    tp, npred, ngd = (sum(r[tag + x] for r in rs) for x in ("_ttp", "_tnp", "_tng"))
                    p = tp / npred if npred else 1.0; rc = tp / ngd if ngd else 1.0; d[tag + "_tok_f1"] = 2 * p * rc / (p + rc) if p + rc else 0.0
            return d
        out = {"all": agg(self.rows)}
        for n in sorted({r["n_req"] for r in self.rows}): out[f"req{n}"] = agg([r for r in self.rows if r["n_req"] == n])
        for c in sorted({r["n_chat"] for r in self.rows}): out[f"chat{c}"] = agg([r for r in self.rows if r["n_chat"] == c])
        return out

def match_list(frames, reqs):
    left = list(range(len(frames))); hits = []
    for q in reqs:
        h = False
        for j in left:
            if M.frame_eq(frames[j], q): left.remove(j); h = True; break
        hits.append(h)
    return hits

# ------------------------------------------------------------------ E0
def train_e0a(seed, tr, lex, st):
    sp = spans(tr); mod = M.Std(D, seed)
    M.train_std(mod, lex, st, [s for s, _ in sp], [st.target(q) for _, q in sp], epochs=3, seed=seed, log=log)
    return mod

def std_threshold(mod, lex, st, rd, dv):
    sp = spans(dv); S = M.std_states(mod, lex, st, [s for s, _ in sp])
    rs = [(rd.read(S[i], sp[i][0])[1], "color" in q["roles"]) for i, (_, q) in enumerate(sp) if q["event"] == "create"]
    return M.pick_threshold([(r, p) for r, p in rs if r is not None])

def e0a(mod, lex, st, rd, thr, te):
    T = Tally()
    for m in te:
        sp = spans([m]); S = M.std_states(mod, lex, st, [s for s, _ in sp])
        T.add(m, [rd.read(S[i], sp[i][0], thr)[0] for i in range(len(sp))])
    return T.summary()

def e0b(seed, lex, st, rd, te, dv):
    """one state for the whole message: a reader trained on whole one-request messages with chatter, applied to every message"""
    tr1 = W.dataset(5000 + seed, 6000, (1, 1), names=W.TRAIN_NAMES); dv1 = W.dataset(6000 + seed, 600, (1, 1), names=W.TRAIN_NAMES)
    mod = M.Std(D, seed + 77)
    M.train_std(mod, lex, st, [m["tokens"] for m in tr1], [st.target(m["requests"][0]) for m in tr1], epochs=3, seed=seed, log=log)
    S = M.std_states(mod, lex, st, [m["tokens"] for m in dv1])
    rs = [(rd.read(S[i], m["tokens"])[1], "color" in m["requests"][0]["roles"]) for i, m in enumerate(dv1) if m["requests"][0]["event"] == "create"]
    thr = M.pick_threshold([(r, p) for r, p in rs if r is not None])
    S = M.std_states(mod, lex, st, [m["tokens"] for m in te]); T = Tally()
    for i, m in enumerate(te):
        f, _, placed = rd.read(S[i], m["tokens"], thr)
        T.add(m, [f] if f is not None else [])
    return T.summary(), thr

def e0c(mod, lex, st, rd, thr, te):
    """today's hard-centres method (docs/js/vss-centers.js) on the synthetic world: centres = action-kind tokens; for every centre each
    stretch containing it and no other centre is read; score = (#content tokens placed) - (#content tokens not placed); a dynamic
    programme picks non-overlapping stretches (a centre may be dropped); sentences cut at '.'; tokens in no stretch = zones"""
    T = Tally(); PUNCT = {",", "."}
    for m in te:
        toks = m["tokens"]; kinds = [lex.kind(t) for t in toks]; n = len(toks)
        sents, cur = [], []
        for i, t in enumerate(toks):
            cur.append(i)
            if t == ".": sents.append(cur); cur = []
        if cur: sents.append(cur)
        frames, assigned, assigned2 = [], [False] * n, [False] * n
        for s in sents:
            C = [j for j, i in enumerate(s) if kinds[i].startswith("V_")]
            if not C: continue
            cand = {}
            for ci, c in enumerate(C):
                lo = C[ci - 1] + 1 if ci > 0 else 0; hi = C[ci + 1] - 1 if ci + 1 < len(C) else len(s) - 1
                for a in range(lo, c + 1):
                    for b in range(c, hi + 1):
                        aa, bb = a, b
                        while aa <= bb and toks[s[aa]] in PUNCT: aa += 1
                        while bb >= aa and toks[s[bb]] in PUNCT: bb -= 1
                        if aa <= bb: cand[(a, b)] = (aa, bb)
            keys = sorted(set(cand.values())); seqs = [[toks[s[i]] for i in range(a, b + 1)] for a, b in keys]
            Ss = M.std_states(mod, lex, st, seqs); reads = {}
            for k, (key, sq) in enumerate(zip(keys, seqs)):
                f, _, placed = rd.read(Ss[k], sq, thr)
                content = [t for t, kk in zip(sq, [lex.kind(x) for x in sq]) if kk in CONTENT]
                un = sum(1 for t in content if t not in placed)
                reads[key] = (f, (len(content) - un) - un, placed)
            states = {-1: (0.0, [])}
            for ci, c in enumerate(C):
                lo = C[ci - 1] + 1 if ci > 0 else 0; hi = C[ci + 1] - 1 if ci + 1 < len(C) else len(s) - 1; nxt = {}
                for pe, (sc, sps) in states.items():
                    if pe not in nxt or nxt[pe][0] < sc: nxt[pe] = (sc, sps)
                    for a in range(max(lo, pe + 1), c + 1):
                        for b in range(c, hi + 1):
                            if (a, b) not in cand: continue
                            r = reads[cand[(a, b)]]
                            if r[0] is None: continue
                            v = (sc + r[1], sps + [(a, b)])
                            if b not in nxt or nxt[b][0] < v[0]: nxt[b] = v
                states = nxt
            best = max(states.values(), key=lambda x: x[0])
            for a, b in best[1]:
                aa, bb = cand[(a, b)]; f, _, placed = reads[(aa, bb)]; frames.append(f)
                for i in range(aa, bb + 1): assigned[s[i]] = True
                pos = [i for i in range(aa, bb + 1) if toks[s[i]] in placed]
                for i in range(min(pos), max(pos) + 1): assigned2[s[i]] = True
        T.add(m, frames, assigned, assigned2)
    return T.summary()

# ------------------------------------------------------------------ E1 / E2
def rel_threshold(mod, lex, st, rd, dv):
    out = M.rel_read_all(mod, lex, st, dv); rs = []
    for m, res in zip(dv, out):
        cm = {r[0]: r for r in res}
        for q, c in zip(m["requests"], m["centres"]):
            if q["event"] != "create": continue
            r = rd.read(cm[c][1], cm[c][2])[1]
            if r is not None: rs.append((r, "color" in q["roles"]))
    return M.pick_threshold(rs)

def rel_eval(mod, lex, st, rd, thr, te, gold_only):
    out = M.rel_read_all(mod, lex, st, te); T = Tally()
    for m, res in zip(te, out):
        n = len(m["tokens"]); frames = []; assigned = [False] * n; assigned2 = [False] * n
        gold = set(m["centres"])
        for cc, S, win, att in res:
            if gold_only and cc not in gold: continue
            f, _, placed = rd.read(S, win, thr)
            if f is None: continue
            frames.append(f)
            for p, w in att.items():
                if w > 0.5: assigned[p] = True
            pos = [p for p in att if m["tokens"][p] in placed] + [cc]
            for p in range(min(pos), max(pos) + 1): assigned2[p] = True
        T.add(m, frames, None if gold_only else assigned, None if gold_only else assigned2)
    return T.summary()

def run(exp, seed):
    kw = {"train_req": (1, 2), "test_req": (3, 4)} if exp == "e4" else {}
    t0 = time.time(); tr, dv, te = W.splits(seed, *((300, 60, 60) if os.environ.get("SMOKE") else ()), **kw); lex = M.Lex(tr); st = M.StarTable(D, seed); rd = M.Reader(lex, st); res = {"seed": seed}
    if exp == "e0":
        mod = train_e0a(seed, tr, lex, st); thr = std_threshold(mod, lex, st, rd, dv); res["thr_a"] = thr
        res["E0a_dev"] = e0a(mod, lex, st, rd, thr, dv)["all"]; log("E0a dev", res["E0a_dev"])
        res["E0a"] = e0a(mod, lex, st, rd, thr, te); log("E0a", res["E0a"]["all"])
        res["E0b"], res["thr_b"] = e0b(seed, lex, st, rd, te, dv); log("E0b", res["E0b"]["all"])
        res["E0c"] = e0c(mod, lex, st, rd, thr, te); log("E0c", res["E0c"]["all"])
    elif exp in ("e1", "e2", "e2u", "e4"):
        mod = M.Rel(D, seed, R=2, learned=(exp != "e1"), uniform=(exp == "e2u")); M.train_rel(mod, lex, st, tr, epochs=3, seed=seed, log=log)
        thr = rel_threshold(mod, lex, st, rd, dv); res["thr"] = thr
        res["dev"] = rel_eval(mod, lex, st, rd, thr, dv, exp == "e1")["all"]; log(exp, "dev", res["dev"])
        res["test"] = rel_eval(mod, lex, st, rd, thr, te, exp == "e1"); log(exp, "test", res["test"]["all"])
        torch.save(mod.state_dict(), os.path.join(OUT, f"{exp}_seed{seed}.pt"))
        if exp in ("e2", "e4"):
            g = torch.sigmoid(mod.gate).detach().numpy(); res["gates"] = {k: round(float(x), 3) for k, x in zip(W.KINDS, g)}
            res["barrier"] = {k: round(float(x), 3) for k, x in zip(W.KINDS, torch.nn.functional.softplus(mod.beta).detach().numpy())}
    res["time_s"] = time.time() - t0
    if not os.environ.get("SMOKE"):
        with open(os.path.join(OUT, f"{exp}_seed{seed}.json"), "w") as f: json.dump(res, f, indent=1)
    log(f"done {exp} seed {seed} in {res['time_s']:.0f}s")

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--exp", required=True); ap.add_argument("--seeds", type=int, nargs="+", default=[0, 1])
    a = ap.parse_args()
    for s in a.seeds: run(a.exp, s)
