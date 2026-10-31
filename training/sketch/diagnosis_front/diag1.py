from common import *
fit = load("/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/fitset/fit.jsonl")
E = json.load(open("fit_emit.json"))["rows"]
F = relearn(fit); V = F["values"]
byid = {m["id"]: m for m in fit}
reqs, chatter = front.requests(fit)
# instrumented copy of learn_triggers counting
def stats():
    tp = collections.defaultdict(collections.Counter); phrases = set()
    for m, w, sp, names in reqs:
        tok = front.event_token(w)
        if tok and w.get("trigger"):
            toks = front.apply_values([x[0] for x in front.tokenize(sp, names)[0]], V)
            tt = front.apply_values([x[0] for x in front.tokenize(w["trigger"], names)[0]], V); tt = [x for x in tt if x not in ".,!?;:"]
            cut = next((k for k, x in enumerate(tt) if x.startswith("n_")), len(tt)); tt = tt[:cut]
            pos = next((k for k in range(len(toks) - len(tt) + 1) if tt and toks[k:k + len(tt)] == tt), None)
            if pos is not None:
                ph = " ".join(tt); phrases.add(ph)
                p = front.ctx(toks[pos-1] if pos > 0 else None); n = front.ctx(toks[pos+len(tt)] if pos+len(tt) < len(toks) else None)
                for key in ((ph,p,n),(ph,"*",n),(ph,p,"*"),(ph,"*","*")): tp[key][tok] += 1
    return tp, phrases
tp, phrases = stats()
chat = [front.apply_values([x[0] for x in front.tokenize(s, names)[0]], V) for s, names in chatter]
# occurrences of phrase in chatter / in spans by event (same as learn_triggers.scan, general key only + per key)
occ = collections.defaultdict(collections.Counter); occ_c = collections.Counter()
def scan(toks, hit, own=None):
    for ph in phrases:
        pt = ph.split()
        if own and len(own) > len(pt): continue
        for i in range(len(toks) - len(pt) + 1):
            if toks[i:i+len(pt)] == pt:
                p = front.ctx(toks[i-1] if i > 0 else None); n = front.ctx(toks[i+len(pt)] if i+len(pt) < len(toks) else None)
                for key in ((ph,p,n),(ph,"*",n),(ph,p,"*"),(ph,"*","*")): hit(key)
for m, w, sp, names in reqs:
    tok = front.event_token(w); toks = front.apply_values([x[0] for x in front.tokenize(sp, names)[0]], V); own = None
    if tok and w.get("trigger"):
        tt = front.apply_values([x[0] for x in front.tokenize(w["trigger"], names)[0]], V); tt = [x for x in tt if x not in ".,!?;:"]
        cut = next((k for k, x in enumerate(tt) if x.startswith("n_")), len(tt)); tt = tt[:cut]
        pos = next((k for k in range(len(toks)-len(tt)+1) if tt and toks[k:k+len(tt)] == tt), None)
        if pos is not None: own = tt
    scan(toks, lambda key: occ[key].update([tok]), own)
for toks in chat: scan(toks, lambda key: occ_c.update([key]))
def keystat(key):
    c = tp.get(key)
    if not c: return None
    n = sum(c.values()); tok, k = c.most_common(1)[0]
    fpc = occ_c[key]; fps = sum(v for e, v in occ[key].items() if e != tok)
    return dict(n=n, tok=tok, k=k, share=k/n, prec=n/(n+fpc+fps), fp_chat=fpc, fp_span=fps, dist=dict(c))
