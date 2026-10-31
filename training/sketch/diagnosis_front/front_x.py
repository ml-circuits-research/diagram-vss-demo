"""front_x.py: SCRATCH variants of the learning step of training/sketch/front.py (the repository file is not edited).
learn_x(msgs, params, opts) with opts = set of flags; with no flag it must give exactly the same front.json as front.learn.
Flags:
  SUB   candidate trigger phrases = every contiguous sub-phrase of each annotated trigger (not only the whole trigger);
        a false occurrence of a phrase is an occurrence in chatter, or in a span of another event, outside that span's own trigger
  MASK  learn_values: an n-gram that overlaps an annotated trigger but is not inside it is not a value candidate
  CTX2  rules may also condition on the second token to the left (prev2)
  CLS   a context token that is a legend value token is replaced by its kind (COLOR, SHAPE, POS ...) in contexts
  SMOOTH precision = n / (n + fp + 1) instead of n / (n + fp)
  NAMEPH a trigger that is cut to nothing at its first name ('Bank to Fraud') becomes a rule over the pattern 'NAME to NAME', which INSERTS
        the event token in front of the matched words (it cannot replace them: the names must stay)
  MC1   (not a flag of the procedure, a what-if) set trig_min_count=1 via params
"""
import sys, collections, json
sys.path.insert(0, "/home/claude/diagram-vss-demo/training/sketch")
import front
from front import tokenize, apply_values, ctx as ctx0, is_word, gold_values, event_token, requests, value_kinds, KEY_KIND, mention_kv

KINDS = value_kinds()
def make_ctx(opts):
    if "CLS" not in opts: return ctx0
    def c(t):
        r = ctx0(t)
        return KINDS[r] if r in KINDS and r != "all" else r
    return c

def trig_tokens(w, names, V):
    tt = apply_values([x[0] for x in tokenize(w["trigger"], names)[0]], V)
    tt = [x for x in tt if x not in ".,!?;:"]
    cut = next((k for k, x in enumerate(tt) if x.startswith("n_")), len(tt))
    return tt[:cut]

def learn_values_x(reqs, min_count, min_prec, opts):
    co, occ = collections.defaultdict(collections.Counter), collections.Counter()
    for m, w, sp, names in reqs:
        toks = [x[0] for x in tokenize(sp, names)[0]]; gv = gold_values(w)
        reg = None
        if "MASK" in opts and w.get("trigger"):
            tr = [x[0] for x in tokenize(w["trigger"], names)[0]]
            tr = [x for x in tr if x not in ".,!?;:"]
            pos = next((k for k in range(len(toks) - len(tr) + 1) if tr and toks[k:k + len(tr)] == tr), None)
            if pos is not None: reg = (pos, pos + len(tr))
        grams, strad = set(), set()
        for n in (1, 2, 3):
            for i in range(len(toks) - n + 1):
                if not all(is_word(x) for x in toks[i:i + n]): continue
                g = " ".join(toks[i:i + n]); grams.add(g)
                if reg and i < reg[1] and i + n > reg[0] and not (i >= reg[0] and i + n <= reg[1]): strad.add(g)   # straddles the trigger boundary
        for g in grams:
            occ[g] += 1                      # the occurrence still counts in the denominator
            if g in strad and g not in {" ".join(toks[i:i + n]) for n in (1, 2, 3) for i in range(len(toks) - n + 1) if all(is_word(x) for x in toks[i:i + n]) and not (reg and i < reg[1] and i + n > reg[0] and not (i >= reg[0] and i + n <= reg[1]))}: continue   # ... but it is no evidence for a value
            for v in gv:
                if not v.isdigit() or not g.isdigit(): co[g][v] += 1
    V = {}
    for n in (1, 2, 3):
        for g, c in co.items():
            if len(g.split()) != n: continue
            v, k = c.most_common(1)[0]
            if k < min_count or k / occ[g] < min_prec: continue
            ws = g.split()
            if any(" ".join(ws[i:i + j]) in V for j in range(1, n) for i in range(n - j + 1)): continue
            V[g] = v
    return V

def ctx_keys(ph, toks, pos, L, ctx, opts):
    p = ctx(toks[pos - 1] if pos > 0 else None); n = ctx(toks[pos + L] if pos + L < len(toks) else None)
    keys = [(ph, p, n, "*"), (ph, "*", n, "*"), (ph, p, "*", "*"), (ph, "*", "*", "*")]
    if "CTX2" in opts:
        p2 = ctx(toks[pos - 2] if pos > 1 else None)
        keys = [(ph, p, n, p2), (ph, p, "*", p2)] + keys
    return keys

def learn_triggers_x(reqs, chatter, V, min_count, share, min_prec, value_tokens, opts):
    ctx = make_ctx(opts)
    tp = collections.defaultdict(collections.Counter); phrases = set(); spans = []
    for m, w, sp, names in reqs:
        tok = event_token(w); toks = apply_values([x[0] for x in tokenize(sp, names)[0]], V); own = None
        toks = ["NAME" if x.startswith("n_") else x for x in toks] if "NAMEPH" in opts else toks
        if tok and w.get("trigger"):
            tt = trig_tokens(w, names, V); ins = False
            if not tt and "NAMEPH" in opts:
                full = [x for x in apply_values([x[0] for x in tokenize(w["trigger"], names)[0]], V) if x not in ".,!?;:"]
                tt = ["NAME" if x.startswith("n_") else x for x in full]; ins = True
            tt_s = tt
            pos = next((k for k in range(len(toks) - len(tt) + 1) if tt and toks[k:k + len(tt)] == tt), None)
            if pos is not None:
                own = (pos, pos + len(tt))
                cands = [(pos, tt)]
                if "SUB" in opts:
                    cands = [(pos + i, tt[i:i + l]) for l in range(1, len(tt) + 1) for i in range(len(tt) - l + 1)]
                for ps, ph_t in cands:
                    ph = " ".join(ph_t); phrases.add(ph)
                    for key in ctx_keys(ph, toks, ps, len(ph_t), ctx, opts): tp[key][tok] += 1
        spans.append((toks, tok, own))
    chat = [apply_values([x[0] for x in tokenize(s, names)[0]], V) for s, names in chatter]
    if "NAMEPH" in opts: chat = [["NAME" if x.startswith("n_") else x for x in t] for t in chat]
    occ, occ_c = collections.defaultdict(collections.Counter), collections.Counter()
    byfirst = collections.defaultdict(list)
    for ph in phrases: byfirst[ph.split()[0]].append(ph)
    def scan(toks, hit, own=None):
        for i, t in enumerate(toks):
            for ph in byfirst.get(t, ()):
                pt = ph.split()
                if toks[i:i + len(pt)] != pt: continue
                if own:
                    if "SUB" in opts:
                        if i >= own[0] and i + len(pt) <= own[1]: continue          # inside the span's own trigger
                    elif (own[1] - own[0]) > len(pt): continue                       # original rule: shorter than the own trigger
                for key in ctx_keys(ph, toks, i, len(pt), ctx, opts): hit(key)
    for toks, ev, own in spans: scan(toks, lambda key: occ[key].update([ev]), own)
    for toks in chat: scan(toks, lambda key: occ_c.update([key]))
    rules = []
    for key, c in tp.items():
        n = sum(c.values()); tok, k = c.most_common(1)[0]
        fp = occ_c[key] + sum(v for e, v in occ[key].items() if e != tok)
        prec = n / (n + fp + (1 if 'SMOOTH' in opts else 0))
        if n >= min_count and k / n >= share and prec >= min_prec:
            e = {"p": key[0], "prev": key[1], "next": key[2], "tok": tok, "n": n, "prec": round(prec, 3)}
            if key[3] != "*": e["prev2"] = key[3]
            kv = [x for x in key[0].split() if x in value_tokens]
            if "NAME" in key[0].split(): e["ins"] = True
            elif kv: e["keep"] = kv
            rules.append(e)
    spec = lambda e: (e["prev"] != "*") + (e["next"] != "*") + (e.get("prev2", "*") != "*")
    rules.sort(key=lambda e: (-len(e["p"].split()), -spec(e), -e["n"], e["p"], e["prev"], e["next"], e.get("prev2", "*")))
    return rules

def learn_x(msgs, params, opts=()):
    opts = set(opts); P = dict(front.DEFAULTS, **params)
    reqs, chatter = requests(msgs)
    V = learn_values_x(reqs, P["val_min_count"], P["val_min_prec"], opts)
    T = learn_triggers_x(reqs, chatter, V, P["trig_min_count"], P["trig_share"], P["trig_min_prec"], set(value_kinds()), opts)
    return {"params": P, "values": dict(sorted(V.items())), "triggers": T, "opts": sorted(opts)}

# ---- applying (same as front.apply_triggers / normalize_message, plus prev2 and the context classes)
def PF(toks): return ["NAME" if x.startswith("n_") else x for x in toks]
def apply_triggers_x(toks, T, opts=()):
    ctx = make_ctx(opts); tp = PF(toks)
    for e in T:
        ph = e["p"].split()
        for i in range(len(toks) - len(ph) + 1):
            if tp[i:i + len(ph)] != ph: continue
            p = ctx(toks[i - 1] if i > 0 else None); n = ctx(toks[i + len(ph)] if i + len(ph) < len(toks) else None)
            p2 = ctx(toks[i - 2] if i > 1 else None)
            if e["prev"] in ("*", p) and e["next"] in ("*", n) and e.get("prev2", "*") in ("*", p2):
                if e.get("ins"): return toks[:i] + [e["tok"]] + toks[i:]
                return toks[:i] + [e["tok"]] + list(e.get("keep", [])) + toks[i + len(ph):]
    return toks

def normalize_x(text, names, F, opts=()):
    toks, info = tokenize(text, names)
    t = apply_values([x[0] for x in toks], F["values"])
    return apply_triggers_x(t, F["triggers"], opts)

def message_events_x(text, names, F, opts=()):
    """whole message, like front.normalize_message: every rule that fires, left to right. -> list of (event token, char start) """
    ctx = make_ctx(opts)
    toks0, info0 = tokenize(text, names)
    toks, info = tokenize(text, list(names) + [info0["names"][t] for t in info0["names"]])
    V = F["values"]; vals, src, i = [], [], 0
    while i < len(toks):
        for n in (3, 2, 1):
            g = [x[0] for x in toks[i:i + n]]
            if len(g) == n and all(is_word(x) for x in g) and " ".join(g) in V:
                vals.append(V[" ".join(g)]); src.append([toks[i][1], toks[i + n - 1][2]]); i += n; break
        else: vals.append(toks[i][0]); src.append([toks[i][1], toks[i][2]]); i += 1
    by_first = {}
    for e in F["triggers"]: by_first.setdefault(e["p"].split()[0], []).append(e)
    vals_o = vals; vals = PF(vals)
    out, i = [], 0
    while i < len(vals):
        hit = None
        for e in by_first.get(vals[i], ()):
            ph = e["p"].split(); L = len(ph)
            if vals[i:i + L] != ph: continue
            p = ctx(vals[i - 1] if i > 0 else None); n = ctx(vals[i + L] if i + L < len(vals) else None); p2 = ctx(vals[i - 2] if i > 1 else None)
            if e["prev"] in ("*", p) and e["next"] in ("*", n) and e.get("prev2", "*") in ("*", p2): hit = e; break
        if hit is None: i += 1; continue
        L = len(hit["p"].split()); out.append((hit["tok"], src[i][0], src[i + L - 1][1])); i += 1 if hit.get("ins") else L
    return out
