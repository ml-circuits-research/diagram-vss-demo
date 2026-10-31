"""front.py: the LEARNED front end of the VSS reader (world `real`), VSS_READER_SPEC.md. Everything that maps language to the legend is
learned from the annotated training messages (llm_train/*_msg); the only hand-written part is mechanical (section 1). Its JS twin is
docs/js/front.js (parity: parity_front.mjs).

1. Mechanical tokenization (not learned; listed in the spec): quoted strings -> one TEXT token t_<slug>; words, digits, punctuation;
   "30px" -> 30 px; a word is a NAME token n_<slug> when it is one of the shapes on the canvas or a capitalised word that does not
   start a sentence ("I" excepted; "A" only when a shape is called A); "Done's" -> Done when Done is a name; everything else lower case.
2. SEGMENTER (learned): a greedy averaged-perceptron tagger over the message's tokens, labels B (first token of a request), I (inside a
   request), O (chatter), trained on the wires' spans; integer weights so that Python and JS decode identically.
3. VALUES (learned): word n-grams (1-3 words) -> the token of a legend value (below, left_side, two_way, not_red, circles, 2 ...), from
   the co-occurrence of the span's n-grams with the gold values of its wire; an n-gram is kept when its precision and count reach the
   thresholds and none of its sub-n-grams is kept already; applied longest first.
4. TRIGGERS (learned): the annotated trigger phrase (value-normalized, cut at the first name) with its neighbours -> the event's token;
   precision counts the phrase's occurrences in chatter and in spans of other events; context backs off (prev,next) -> (*,next) ->
   (prev,*) -> (*,*); rules tried longest phrase first, then the most specific context. Value tokens inside a phrase stay (role fillers).
The thresholds are parameters chosen on held-out training messages (select_front.py), never on the test sets."""
import collections, hashlib, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)

# ---------------------------------------------------------------- legend values -> world tokens (the world's schema, not language)
SHAPES = {"circle": "circles", "square": "squares", "rectangle": "rectangles", "triangle": "triangles", "diamond": "diamonds", "ellipse": "ellipses",
          "hexagon": "hexagons", "star": "stars"}
REL = {"leftOf": "left_of", "rightOf": "right_of", "above": "above", "below": "below", "near": "next_to", "between": "between"}
REGION = {"center": "center", "top": "top", "bottom": "bottom", "left": "left_side", "right": "right_side", "topLeft": "top_left",
          "topRight": "top_right", "bottomLeft": "bottom_left", "bottomRight": "bottom_right"}
KEY_KIND = {"shape": "SHAPE", "color": "COLOR", "notColor": "NOTCOLOR", "size": "SIZE", "comparison": "SIZE", "position": "POS", "direction": "DIR",
            "style": "STYLE", "arrow": "ARROW", "axis": "AXIS", "layout": "LAYOUT", "pairing": "PAIR", "superlative": "SUPER", "recency": "RECENT"}
NUM_KEYS = ("count", "distance")


def value_token(key, v, plural=False):
    v = str(v)
    if key == "shape": return SHAPES.get(v, v) if plural else v
    if key == "notColor": return "not_" + v
    if key == "position": return REL.get(v) or REGION.get(v) or v
    if key == "arrow": return {"both": "two_way", "none": "plain"}.get(v, v)
    if key == "axis": return {"horizontal": "horizontally", "vertical": "vertically"}.get(v, v)
    if key == "layout": return {"circle": "ring"}.get(v, v)
    if key == "pairing": return {"all": "each_other"}.get(v, v)
    if key == "superlative": return v.lower()
    return v


def value_kinds():
    """token -> kind for every legend value token (the kind is its legend question's)"""
    from generate import COLORS, SIZES
    vals = {"shape": list(SHAPES), "color": COLORS, "notColor": COLORS, "size": SIZES, "comparison": ["bigger", "smaller"], "position": list(REL) + list(REGION),
            "direction": ["left", "right", "up", "down"], "style": ["dashed", "dotted", "solid"], "arrow": ["both", "none"], "axis": ["horizontal", "vertical"],
            "layout": ["row", "column", "grid", "circle"], "pairing": ["chain", "next", "all"], "recency": ["newest", "oldest"],
            "superlative": ["biggest", "smallest", "leftmost", "rightmost", "topmost", "bottommost", "mostConnected", "leastConnected", "closest", "farthest"]}
    out = {}
    for k, vs in vals.items():
        for v in vs:
            out.setdefault(value_token(k, v), KEY_KIND[k])
            if k == "shape": out.setdefault(value_token(k, v, True), "SHAPE")
    out["all"] = "QUANT"   # the legend's quantifier=all (mentions: "every square", "all the boxes")
    return out


def slug(s): return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_") or "x"


# ---------------------------------------------------------------- 1. mechanical tokenization
TOK = re.compile(r"\"([^\"]*)\"|“([^”]*)”|(?<![A-Za-z0-9])'([^']+)'(?![A-Za-z0-9])|([A-Za-z0-9_][A-Za-z0-9_'’-]*)|([.,!?;:])")
ENDS = {".", "!", "?"}


def tokenize(text, names=()):
    """-> list of [token, start, end] and info {texts, names}"""
    known = {}
    for n in names: known.setdefault(str(n).lower(), str(n))
    info = {"texts": {}, "names": {}}; out = []
    for m in TOK.finditer(text):
        q = next((g for g in m.groups()[:3] if g is not None), None)
        if q is not None:
            t = "t_" + slug(q); info["texts"].setdefault(t, q); out.append([t, m.start(), m.end()]); continue
        if m.group(5): out.append([m.group(5), m.start(), m.end()]); continue
        raw = m.group(4).replace("’", "'"); s, e = m.start(), m.end()
        mm = re.fullmatch(r"(\d+)([A-Za-z]+)", raw)
        if mm: out += [[mm.group(1), s, s + len(mm.group(1))], [mm.group(2).lower(), s + len(mm.group(1)), e]]; continue
        if raw.isdigit(): out.append([raw, s, e]); continue
        start = not out or out[-1][0] in ENDS
        base = raw[:-2] if raw.lower().endswith("'s") else None
        if base and (base.lower() in known or (base[:1].isupper() and not start)): raw = base
        low = raw.lower()
        is_name = low in known or (raw[:1].isupper() and not start and raw != "I" and raw != "A")
        if is_name:
            t = "n_" + slug(low); info["names"].setdefault(t, known.get(low, raw)); out.append([t, s, e])
        else: out.append([low, s, e])
    return out, info


def ctx(t):
    if t is None: return "B"
    if t.startswith("n_"): return "NAME"
    if t.startswith("t_"): return "TEXT"
    if t.isdigit(): return "NUM"
    return t


def is_word(t): return not (t.startswith(("n_", "t_")) or t.isdigit() or t in ".,!?;:")


# ---------------------------------------------------------------- 3 + 4. normalization of one request
def apply_values(toks, V):
    out, i = [], 0
    while i < len(toks):
        for n in (3, 2, 1):
            g = toks[i:i + n]
            if len(g) == n and all(is_word(x) for x in g) and " ".join(g) in V: out.append(V[" ".join(g)]); i += n; break
        else: out.append(toks[i]); i += 1
    return out


def apply_triggers(toks, T):
    for e in T:
        ph = e["p"].split()
        for i in range(len(toks) - len(ph) + 1):
            if toks[i:i + len(ph)] != ph: continue
            p = ctx(toks[i - 1] if i > 0 else None); n = ctx(toks[i + len(ph)] if i + len(ph) < len(toks) else None)
            if e["prev"] in ("*", p) and e["next"] in ("*", n): return toks[:i] + [e["tok"]] + list(e.get("keep", [])) + toks[i + len(ph):]
    return toks


def normalize(text, names, F):
    toks, info = tokenize(text, names)
    t = apply_values([x[0] for x in toks], F["values"])
    t = apply_triggers(t, F["triggers"])
    info["numbers"] = {x: int(x) for x in t if x.isdigit()}
    return t, info


def normalize_message(text, names, F):
    """a WHOLE message for the centre reader (research/attention/port/NOTES.md): -> (tokens, src, info), src[i] = [start, end) of token i
    in the text. Differences from normalize() (one request): (1) a word read as a name anywhere in the message is a name everywhere in it
    (a second tokenization with those names known: "Hub is red. connect Hub to Lamp"); (2) EVERY trigger rule that fires is applied, left
    to right: at each position the first rule (in the learned order) whose phrase and context match there fires, the phrase is replaced by
    the event token (and its kept value tokens) and the scan goes on after it; contexts are read on the value-normalized tokens. Linear in
    the tokens (rules indexed by their first word). The JS twin is docs/js/front.js normalizeMessage."""
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
    out, osrc, i = [], [], 0
    while i < len(vals):
        hit = None
        for e in by_first.get(vals[i], ()):
            ph = e["p"].split(); L = len(ph)
            if vals[i:i + L] != ph: continue
            p = ctx(vals[i - 1] if i > 0 else None); n = ctx(vals[i + L] if i + L < len(vals) else None)
            if e["prev"] in ("*", p) and e["next"] in ("*", n): hit = e; break
        if hit is None: out.append(vals[i]); osrc.append(src[i]); i += 1; continue
        L = len(hit["p"].split()); s = [src[i][0], src[i + L - 1][1]]
        for t in [hit["tok"]] + list(hit.get("keep", [])): out.append(t); osrc.append(list(s))
        i += L
    info["numbers"] = {x: int(x) for x in out if x.isdigit()}
    return out, osrc, info


# ---------------------------------------------------------------- 2. segmenter
def seg_feats(toks, i, prev_label):
    w = lambda k: ctx(toks[k]) if 0 <= k < len(toks) else ("<s>" if k < 0 else "</s>")
    start = i == 0 or toks[i - 1] in ENDS
    return [f"w0={w(i)}", f"w-1={w(i - 1)}", f"w+1={w(i + 1)}", f"w-2={w(i - 2)}", f"w+2={w(i + 2)}", f"pl={prev_label}", f"pl,w0={prev_label},{w(i)}",
            f"w-1,w0={w(i - 1)},{w(i)}", f"w0,w+1={w(i)},{w(i + 1)}", f"start={int(start)}", f"start,w0={int(start)},{w(i)}", "bias"]


LABELS = ("B", "I", "O")


def seg_decode(toks, W):
    labels, prev = [], "<s>"
    for i in range(len(toks)):
        fs = seg_feats(toks, i, prev); best, bl = None, None
        for L in LABELS:
            s = sum(W.get(f + "\t" + L, 0) for f in fs)
            if best is None or s > best: best, bl = s, L
        labels.append(bl); prev = bl
    return labels


def segment(text, names, F):
    """-> the request spans of a message, as substrings of the text"""
    toks, _ = tokenize(text, names)
    labels = seg_decode([x[0] for x in toks], F["segmenter"]); spans, cur = [], None
    for (t, s, e), L in zip(toks, labels):
        if L == "B" or (L == "I" and cur is None): cur = [s, e]; spans.append(cur)
        elif L == "I": cur[1] = e
        else: cur = None
    return [text[s:e] for s, e in spans]


def train_segmenter(msgs, epochs):
    data = []
    for m in msgs:
        toks, _ = tokenize(m["text"], m.get("names") or []); spans = []
        for w in m["wires"]:
            i = m["text"].find(w.get("span") or "\0")
            if i >= 0: spans.append((i, i + len(w["span"])))
        labels = ["O"] * len(toks)
        # B = the first token inside its span
        for k, (t, s, e) in enumerate(toks):
            sp = next((x for x in spans if x[0] <= s and e <= x[1]), None)
            if sp is not None: labels[k] = "B" if not any(sp[0] <= s2 and e2 <= sp[1] for _, s2, e2 in toks[:k]) else "I"
        data.append(([x[0] for x in toks], labels))
    W, tot, last, c = collections.defaultdict(int), collections.defaultdict(int), collections.defaultdict(int), 0
    order = sorted(range(len(data)), key=lambda i: hashlib.sha256(str(i).encode()).hexdigest())
    for ep in range(epochs):
        for di in order:
            toks, gold = data[di]; prev = "<s>"
            for i in range(len(toks)):
                c += 1; fs = seg_feats(toks, i, prev); best, bl = None, None
                for L in LABELS:
                    s = sum(W[f + "\t" + L] for f in fs)
                    if best is None or s > best: best, bl = s, L
                if bl != gold[i]:
                    for f in fs:
                        for L, d in ((gold[i], 1), (bl, -1)):
                            k = f + "\t" + L; tot[k] += (c - last[k]) * W[k]; last[k] = c; W[k] += d
                prev = gold[i]
    for k in W: tot[k] += (c - last[k]) * W[k]
    return {k: int(round(1000 * v / c)) for k, v in tot.items() if round(1000 * v / c) != 0}


# ---------------------------------------------------------------- learning values and triggers
def mention_kv(v):
    v = str(v)
    if not v.startswith("mention("): return None
    return dict(x.split("=", 1) for x in v[len("mention("):-1].split(",") if "=" in x)


def gold_values(w):
    a = w["args"]; out = set()
    plural = (w["type"] == "question" and a.get("ask") in ("count", "list", "exists")) or bool(a.get("count") and str(a.get("count")) != "1")
    for k, v in a.items():
        if k in KEY_KIND and v not in (None, ""):
            if k == "position" and v not in REL and v not in REGION: continue
            out.add(value_token(k, v, plural and k == "shape"))
        if k in NUM_KEYS and str(v).isdigit(): out.add(str(v))
        kv = mention_kv(v) if isinstance(v, str) else None
        if kv:
            pl = kv.get("quantifier") == "all"
            if kv.get("shape"): out.add(value_token("shape", kv["shape"], pl))
            if kv.get("color"): out.add(kv["color"])
            if kv.get("notcolor"): out.add("not_" + kv["notcolor"])
            if kv.get("recency"): out.add(kv["recency"])
            if pl: out.add("all")
    return out


EVENT_TOKEN = None


def event_token(w):
    from generate import EVENTS
    a = w["args"]; t = w["type"]
    ev = a.get("action") if t == "command" else ({"rules": "list"}.get(a.get("ask"), a.get("ask")) if t == "question" else t)
    if ev == "property": return {"color": "what_color", "shape": "what_shape", "position": "where_is", "size": "how_big", "label": "what_says"}.get(a.get("property"), "what_color")
    return EVENTS[ev][0] if ev in EVENTS else None


def requests(msgs):
    """(message, wire, span text, names) for every wire whose span is in the text, and the chatter sentences of every message"""
    reqs, chatter = [], []
    for m in msgs:
        names = list(m.get("names") or []) + [w["args"]["name"] for w in m["wires"] if w["args"].get("name")]
        cov = [0] * len(m["text"])
        for w in m["wires"]:
            sp = w.get("span") or ""; i = m["text"].find(sp)
            if not sp or i < 0: continue
            for k in range(i, i + len(sp)): cov[k] = 1
            reqs.append((m, w, sp, names))
        for s in re.finditer(r"[^.!?]+[.!?]?", m["text"]):
            if len(s.group(0).strip()) > 3 and not any(cov[s.start():s.end()]): chatter.append((s.group(0), names))
    return reqs, chatter


def learn_values(reqs, min_count, min_prec):
    co, occ = collections.defaultdict(collections.Counter), collections.Counter()
    for m, w, sp, names in reqs:
        toks = [x[0] for x in tokenize(sp, names)[0]]; gv = gold_values(w)
        grams = {" ".join(toks[i:i + n]) for n in (1, 2, 3) for i in range(len(toks) - n + 1) if all(is_word(x) for x in toks[i:i + n])}
        for g in grams:
            occ[g] += 1
            for v in gv:
                if not v.isdigit() or not g.isdigit(): co[g][v] += 1
    V = {}
    for n in (1, 2, 3):
        for g, c in co.items():
            if len(g.split()) != n: continue
            v, k = c.most_common(1)[0]
            if k < min_count or k / occ[g] < min_prec: continue
            ws = g.split()
            if any(" ".join(ws[i:i + j]) in V for j in range(1, n) for i in range(n - j + 1)): continue   # a shorter n-gram already explains it
            V[g] = v
    return V


def learn_triggers(reqs, chatter, V, min_count, share, min_prec, value_tokens):
    tp = collections.defaultdict(collections.Counter); phrases = set(); spans = []
    for m, w, sp, names in reqs:
        tok = event_token(w); toks = apply_values([x[0] for x in tokenize(sp, names)[0]], V); own = None
        if tok and w.get("trigger"):
            tt = apply_values([x[0] for x in tokenize(w["trigger"], names)[0]], V)
            tt = [x for x in tt if x not in ".,!?;:"]
            cut = next((k for k, x in enumerate(tt) if x.startswith("n_")), len(tt)); tt = tt[:cut]
            pos = next((k for k in range(len(toks) - len(tt) + 1) if tt and toks[k:k + len(tt)] == tt), None)
            if pos is not None:
                own = tt; ph = " ".join(tt); phrases.add(ph)
                p = ctx(toks[pos - 1] if pos > 0 else None); n = ctx(toks[pos + len(tt)] if pos + len(tt) < len(toks) else None)
                for key in ((ph, p, n), (ph, "*", n), (ph, p, "*"), (ph, "*", "*")): tp[key][tok] += 1
        spans.append((toks, tok, own))
    chat = [apply_values([x[0] for x in tokenize(s, names)[0]], V) for s, names in chatter]
    occ, occ_c = collections.defaultdict(collections.Counter), collections.Counter()
    def scan(toks, hit, own=None):
        for ph in phrases:
            pt = ph.split()
            if own and len(own) > len(pt): continue
            for i in range(len(toks) - len(pt) + 1):
                if toks[i:i + len(pt)] == pt:
                    p = ctx(toks[i - 1] if i > 0 else None); n = ctx(toks[i + len(pt)] if i + len(pt) < len(toks) else None)
                    for key in ((ph, p, n), (ph, "*", n), (ph, p, "*"), (ph, "*", "*")): hit(key)
    for toks, ev, own in spans: scan(toks, lambda key: occ[key].update([ev]), own)
    for toks in chat: scan(toks, lambda key: occ_c.update([key]))
    rules = []
    for key, c in tp.items():
        n = sum(c.values()); tok, k = c.most_common(1)[0]
        fp = occ_c[key] + sum(v for e, v in occ[key].items() if e != tok)
        prec = n / (n + fp)
        if n >= min_count and k / n >= share and prec >= min_prec:
            e = {"p": key[0], "prev": key[1], "next": key[2], "tok": tok, "n": n, "prec": round(prec, 3)}
            kv = [x for x in key[0].split() if x in value_tokens]
            if kv: e["keep"] = kv
            rules.append(e)
    spec = lambda e: (e["prev"] != "*") + (e["next"] != "*")
    rules.sort(key=lambda e: (-len(e["p"].split()), -spec(e), -e["n"], e["p"], e["prev"], e["next"]))
    return rules


DEFAULTS = {"seg_epochs": 5, "val_min_count": 2, "val_min_prec": 0.7, "trig_min_count": 2, "trig_share": 0.75, "trig_min_prec": 0.6}


def learn(msgs, params=None):
    P = dict(DEFAULTS, **(params or {}))
    reqs, chatter = requests(msgs)
    V = learn_values(reqs, P["val_min_count"], P["val_min_prec"])
    vt = set(value_kinds())
    T = learn_triggers(reqs, chatter, V, P["trig_min_count"], P["trig_share"], P["trig_min_prec"], vt)
    # the BIO tagger (train_segmenter) is NOT part of the pipeline (owner's decision, 2026-10-31); it is trained only on request, as a
    # labelled reference: FRONT_TAGGER=1
    S = train_segmenter(msgs, P["seg_epochs"]) if os.environ.get("FRONT_TAGGER") == "1" else {}
    return {"about": "front.json: the learned front end of the VSS world `real` (training/sketch/front.py); learned from " + str(len(msgs)) + " training messages",
            "params": P, "values": dict(sorted(V.items())), "triggers": T, "segmenter": dict(sorted(S.items()))}


def load_msgs(pattern="llm_train/*_msg/msg_*.jsonl"):
    import glob
    return [json.loads(l) for f in sorted(glob.glob(os.path.join(HERE, pattern))) for l in open(f) if l.strip()]


def split_of(m, share):
    return int(hashlib.sha256(m["id"].encode()).hexdigest()[:8], 16) / 2 ** 32 < share


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument("--share", type=float, default=1.0); ap.add_argument("--params"); ap.add_argument("--out", default=os.path.join(HERE, "front.json"))
    a = ap.parse_args()
    msgs = [m for m in load_msgs() if split_of(m, a.share)] if a.share < 1 else load_msgs()
    F = learn(msgs, json.load(open(a.params)) if a.params else None)
    json.dump(F, open(a.out, "w"), indent=0)
    print(f"{a.out}: {len(msgs)} messages; {len(F['values'])} value n-grams, {len(F['triggers'])} trigger rules, {len(F['segmenter'])} segmenter weights")
