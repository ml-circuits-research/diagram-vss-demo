from diag1 import *
# map emitted rows back to (message, wire)
rowsA = [r for r in E if not r["verb"]]
# build index id -> list of wires with span in text, in order (same order as emit)
idx = collections.defaultdict(list)
for m in fit:
    for w in m["wires"]:
        if w.get("span") and w["span"] in m["text"]: idx[m["id"]].append(w)
cnt = collections.defaultdict(int); out = []
seen = collections.defaultdict(int)
for r in E:
    w = idx[r["id"]][seen[r["id"]]]; seen[r["id"]] += 1
    if r["verb"]: continue
    names = r["names"]
    tok = front.event_token(w); trig = w.get("trigger")
    toks = front.apply_values([x[0] for x in front.tokenize(w["span"], names)[0]], V)
    d = dict(id=r["id"], span=w["span"], trigger=trig, ev=r["ev"], tok=tok, toks=toks, wtype=w["type"], args=w["args"])
    if not trig: d["why"] = "no trigger annotated"
    elif not tok: d["why"] = "no event token for the gold event"
    else:
        tt = front.apply_values([x[0] for x in front.tokenize(trig, names)[0]], V); tt = [x for x in tt if x not in ".,!?;:"]
        d["tt_raw"] = list(tt)
        cut = next((k for k, x in enumerate(tt) if x.startswith("n_")), len(tt)); tt = tt[:cut]; d["tt"] = tt
        pos = next((k for k in range(len(toks)-len(tt)+1) if tt and toks[k:k+len(tt)] == tt), None)
        if not tt: d["why"] = "trigger empty after cut at first name"
        elif pos is None and trig.lower() != "where" and not any(t.startswith(tt[0] + "'") for t in toks) : d["why"] = "trigger not found in value-normalized span"
        elif pos is None: d["why"] = "other: the trigger is a prefix of a token (Where in Where's)"
        else:
            ph = " ".join(tt); p = front.ctx(toks[pos-1] if pos > 0 else None); n = front.ctx(toks[pos+len(tt)] if pos+len(tt) < len(toks) else None)
            d["ph"] = ph; d["p"] = p; d["n"] = n
            d["gen"] = keystat((ph,"*","*")); d["spec"] = keystat((ph,p,n))
            d["why"] = "phrase located"
    out.append(d)
json.dump(out, open("diag2.json", "w"), indent=1)
print(len(out), collections.Counter(d["why"] for d in out))
