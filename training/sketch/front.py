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
The thresholds are parameters chosen on held-out training messages (select_front.py), never on the test sets.

FRONT_V2=1 (learning only; default off, then everything below is exactly as before) switches on three learning changes found by the root-cause
analysis of the front end (diagnosis_front/FRONT_DIAG.md, pre-registration diagnosis_front/FRONT_V2.md):
  MASK   (learn_values)   a word n-gram that overlaps an annotated trigger without being inside it is no evidence for a value (it still
                          counts in the denominator): "make all the" -> all ate the verb "make".
  CTX2   (learn_triggers) a rule may also condition on the second token to the left (rule field "prev2"): "Can X be reached from" vs
                          "What can be reached from".
  NAMEPH (learn_triggers) a trigger that starts with a name ("Bank to Fraud", "the Hero a") is not dropped: it becomes a pattern over the
                          placeholder NAME ("NAME to NAME"); such a rule (field "ins") INSERTS the event token in front of the matched
                          words (the names stay).
Applying a front.json is the same code either way (the new rule fields are read when present); only learning is behind the switch."""
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


def v2(): return os.environ.get("FRONT_V2") == "1"


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


def pform(toks): return ["NAME" if x.startswith("n_") else x for x in toks]   # a phrase over NAME matches any name token


def apply_triggers(toks, T):
    tp = pform(toks)
    for e in T:
        ph = e["p"].split()
        for i in range(len(toks) - len(ph) + 1):
            if tp[i:i + len(ph)] != ph: continue
            p = ctx(toks[i - 1] if i > 0 else None); n = ctx(toks[i + len(ph)] if i + len(ph) < len(toks) else None); p2 = ctx(toks[i - 2] if i > 1 else None)
            if e["prev"] in ("*", p) and e["next"] in ("*", n) and e.get("prev2", "*") in ("*", p2):
                if e.get("ins"): return toks[:i] + [e["tok"]] + toks[i:]          # pattern rule: the event token goes in front, the words stay
                return toks[:i] + [e["tok"]] + list(e.get("keep", [])) + toks[i + len(ph):]
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
    pv = pform(vals)
    out, osrc, i = [], [], 0
    while i < len(vals):
        hit = None
        for e in by_first.get(pv[i], ()):
            ph = e["p"].split(); L = len(ph)
            if pv[i:i + L] != ph: continue
            p = ctx(vals[i - 1] if i > 0 else None); n = ctx(vals[i + L] if i + L < len(vals) else None); p2 = ctx(vals[i - 2] if i > 1 else None)
            if e["prev"] in ("*", p) and e["next"] in ("*", n) and e.get("prev2", "*") in ("*", p2): hit = e; break
        if hit is None: out.append(vals[i]); osrc.append(src[i]); i += 1; continue
        L = len(hit["p"].split()); s = [src[i][0], src[i + L - 1][1]]
        if hit.get("ins"):   # pattern rule: the event token in front, then the words themselves
            out.append(hit["tok"]); osrc.append(list(s)); out.append(vals[i]); osrc.append(src[i]); i += 1; continue
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


def seg_decode_labels(toks, W, labels):
    """seg_decode with any label set (the cutter with worlds, train_cutter.py --worlds: B-<world> I O); ties go to the first label of
    `labels`, as in seg_decode. -> (labels, per position {label: score}). The JS twin is front.js segDecodeLabels."""
    out, scores, prev = [], [], "<s>"
    for i in range(len(toks)):
        fs = seg_feats(toks, i, prev); sc = {}; best, bl = None, None
        for L in labels:
            s = sum(W.get(f + "\t" + L, 0) for f in fs); sc[L] = s
            if best is None or s > best: best, bl = s, L
        out.append(bl); scores.append(sc); prev = bl
    return out, scores


def segment_worlds(text, names, C):
    """the units of the cutter with worlds (C = cutter_worlds.json: {labels, worlds, segmenter}) with, per unit, the worlds ranked by the
    score of their B-<world> label at the unit's first token: -> [(start, end, [(world, score), ...])]. A unit starts at a B-<world>
    label (or at an I after O, as in segment). The JS twin is front.js segmentWorlds."""
    toks, _ = tokenize(text, names)
    labels, scores = seg_decode_labels([x[0] for x in toks], C["segmenter"], C["labels"]); spans, cur = [], None
    for k, ((t, s, e), L) in enumerate(zip(toks, labels)):
        if L.startswith("B") or (L == "I" and cur is None):
            ws = sorted(((w, scores[k]["B-" + w]) for w in C["worlds"]), key=lambda x: -x[1])   # stable: label order on equal scores
            cur = [s, e, ws]; spans.append(cur)
        elif L == "I": cur[1] = e
        else: cur = None
    return [tuple(x) for x in spans]


def segment(text, names, F):
    """-> the request spans of a message, as substrings of the text"""
    toks, _ = tokenize(text, names)
    labels = seg_decode([x[0] for x in toks], F["segmenter"]); spans, cur = [], None
    for (t, s, e), L in zip(toks, labels):
        if L == "B" or (L == "I" and cur is None): cur = [s, e]; spans.append(cur)
        elif L == "I": cur[1] = e
        else: cur = None
    return [text[s:e] for s, e in spans]


def train_segmenter(msgs, epochs, labels_set=LABELS, b_label=None):
    """the BIO tagger. b_label (default None: the label is "B", exactly the original cutter): a function wire -> the B label of its span
    (train_cutter.py --worlds: "B-<world>"), with labels_set the full label set in decode order (ties go to the first)."""
    data = []
    for m in msgs:
        toks, _ = tokenize(m["text"], m.get("names") or []); spans = []
        for w in m["wires"]:
            i = m["text"].find(w.get("span") or "\0")
            if i >= 0: spans.append((i, i + len(w["span"]), "B" if b_label is None else b_label(w)))
        labels = ["O"] * len(toks)
        # B = the first token inside its span
        for k, (t, s, e) in enumerate(toks):
            sp = next((x for x in spans if x[0] <= s and e <= x[1]), None)
            if sp is not None: labels[k] = sp[2] if not any(sp[0] <= s2 and e2 <= sp[1] for _, s2, e2 in toks[:k]) else "I"
        data.append(([x[0] for x in toks], labels))
    W, tot, last, c = collections.defaultdict(int), collections.defaultdict(int), collections.defaultdict(int), 0
    order = sorted(range(len(data)), key=lambda i: hashlib.sha256(str(i).encode()).hexdigest())
    for ep in range(epochs):
        for di in order:
            toks, gold = data[di]; prev = "<s>"
            for i in range(len(toks)):
                c += 1; fs = seg_feats(toks, i, prev); best, bl = None, None
                for L in labels_set:
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
        if os.environ.get("DIAGRAM_OPS") == "1": names += list(m.get("groups") or {})   # the groups already on the canvas (DIAGRAM_OPS.md 6.2)
        cov = [0] * len(m["text"])
        for w in m["wires"]:
            sp = w.get("span") or ""; i = m["text"].find(sp)
            if not sp or i < 0: continue
            for k in range(i, i + len(sp)): cov[k] = 1
            reqs.append((m, w, sp, names))
        for s in re.finditer(r"[^.!?]+[.!?]?", m["text"]):
            if len(s.group(0).strip()) > 3 and not any(cov[s.start():s.end()]): chatter.append((s.group(0), names))
    return reqs, chatter


def trigger_region(w, toks, names):
    """(start, end) of the annotated trigger among the raw tokens of its span, or None"""
    if not w.get("trigger"): return None
    tr = [x[0] for x in tokenize(w["trigger"], names)[0] if x[0] not in ".,!?;:"]
    pos = next((k for k in range(len(toks) - len(tr) + 1) if tr and toks[k:k + len(tr)] == tr), None)
    return None if pos is None else (pos, pos + len(tr))


def event_of(w):
    """the legend event of a wire (as llm_to_world.QUESTION_EVENT: ask=rules is the event list)"""
    a, t = w["args"], w["type"]
    return a.get("action") if t == "command" else {"rules": "list"}.get(a.get("ask"), a.get("ask")) if t == "question" else t


def value_kind(v, _vk={}):
    """the kind of a gold value token (its legend question's): digits -> NUM, the rest from value_kinds()"""
    if not _vk: _vk.update(value_kinds())
    return "NUM" if v.isdigit() else _vk.get(v, "?")


def val_prec(): return os.environ.get("VAL_PREC", "") or "all"
def val_sub(): return os.environ.get("VAL_SUB", "") or "any"


def learn_values(reqs, min_count, min_prec):
    """VAL_PREC=event (off by default; ROUND2.md fix 4, BETWEEN.md "the count of a new group"): the precision of n-gram -> value v is
    counted only over the requests of the events that carry v's kind (an event carries a kind when the gold values of at least one of
    its requests in `reqs` have that kind: the same rule as the legend's roles, which come from the rows). Default (all): over every
    request, so "three" lost to the set spans that cannot have a count ("make the three rooms squares") and the bigram "add three"
    won. The same rule for every kind.
    VAL_SUB=value (off by default; ROUND2.md fix 3): a longer n-gram is blocked by a kept sub-n-gram only when the sub-n-gram explains
    it: it gives the same value, or its own value is still in the gold of the longer n-gram's requests with precision >= min_prec
    ("circles near": "near" -> next_to stays right there, so it is blocked). One whose sub-n-gram reads wrong inside it ("bottom left"
    -> bottom_left while "left" -> left_of, and left_of is not gold there) is kept when it passes the thresholds on its own, and the
    longest-first application makes it win. Default (any): any kept sub-n-gram blocks it."""
    mask = v2(); per_event = val_prec() == "event"
    if val_prec() not in ("all", "event"): raise SystemExit(f"VAL_PREC={val_prec()!r}: expected all or event")
    if val_sub() not in ("any", "value"): raise SystemExit(f"VAL_SUB={val_sub()!r}: expected any or value")
    ev_kinds = collections.defaultdict(set)
    if per_event:
        for m, w, sp, names in reqs:
            ev_kinds[event_of(w)].update(value_kind(v) for v in gold_values(w))
    co, occ = collections.defaultdict(collections.Counter), collections.Counter()
    occ_k = collections.defaultdict(collections.Counter)   # VAL_PREC=event: n-gram -> kind -> occurrences in requests of events that carry the kind
    for m, w, sp, names in reqs:
        toks = [x[0] for x in tokenize(sp, names)[0]]; gv = gold_values(w); ks = ev_kinds[event_of(w)] if per_event else ()
        grams = {" ".join(toks[i:i + n]) for n in (1, 2, 3) for i in range(len(toks) - n + 1) if all(is_word(x) for x in toks[i:i + n])}
        ok = grams
        if mask:   # MASK: an n-gram that overlaps the annotated trigger without being inside it is no evidence for a value (it still counts in occ)
            reg = trigger_region(w, toks, names)
            if reg:
                ok = {" ".join(toks[i:i + n]) for n in (1, 2, 3) for i in range(len(toks) - n + 1) if all(is_word(x) for x in toks[i:i + n])
                      and not (i < reg[1] and i + n > reg[0] and not (i >= reg[0] and i + n <= reg[1]))}
        for g in grams:
            occ[g] += 1
            for kd in ks: occ_k[g][kd] += 1
            if g not in ok: continue
            for v in sorted(gv):   # sorted: a tie between two values is broken the same way in every run (gv is a set: its order follows the string hash)
                if not v.isdigit() or not g.isdigit(): co[g][v] += 1
    V = {}
    same = val_sub() == "value"
    for n in (1, 2, 3):
        for g, c in co.items():
            if len(g.split()) != n: continue
            v, k = c.most_common(1)[0]
            den = occ_k[g][value_kind(v)] if per_event else occ[g]
            if k < min_count or k / den < min_prec: continue
            ws = g.split()
            subs = [" ".join(ws[i:i + j]) for j in range(1, n) for i in range(n - j + 1)]
            dn = lambda u: occ_k[g][value_kind(u)] if per_event else occ[g]
            # a shorter n-gram already explains it (VAL_SUB=value: when it gives the same value, or when its own value is still read
            # right inside g, with the same precision bar: "circles near" -> circles must not swallow "near" -> next_to)
            if any(s in V and (not same or V[s] == v or (dn(V[s]) and c[V[s]] / dn(V[s]) >= min_prec)) for s in subs): continue
            V[g] = v
    return V


def learn_triggers(reqs, chatter, V, min_count, share, min_prec, value_tokens):
    new = v2()   # CTX2 (second token to the left) and NAMEPH (name-initial pattern rules), see the docstring
    tp = collections.defaultdict(collections.Counter); phrases = set(); spans = []
    def keys(ph, toks, pos, L):
        p = ctx(toks[pos - 1] if pos > 0 else None); n = ctx(toks[pos + L] if pos + L < len(toks) else None)
        ks = [(ph, p, n, "*"), (ph, "*", n, "*"), (ph, p, "*", "*"), (ph, "*", "*", "*")]
        if new: p2 = ctx(toks[pos - 2] if pos > 1 else None); ks = [(ph, p, n, p2), (ph, p, "*", p2)] + ks
        return ks
    for m, w, sp, names in reqs:
        tok = event_token(w); toks = apply_values([x[0] for x in tokenize(sp, names)[0]], V); own = None; region = None
        if new: toks = pform(toks)
        if tok and w.get("trigger"):
            full = [x for x in apply_values([x[0] for x in tokenize(w["trigger"], names)[0]], V) if x not in ".,!?;:"]
            cut = next((k for k, x in enumerate(full) if x.startswith("n_")), len(full)); tt = full[:cut]
            if new and not tt and full: tt = pform(full)   # NAMEPH: the trigger starts with a name: a pattern over NAME
            pos = next((k for k in range(len(toks) - len(tt) + 1) if tt and toks[k:k + len(tt)] == tt), None)
            if pos is not None:
                own = tt; ph = " ".join(tt); phrases.add(ph); region = (pos, pos + len(tt))
                for key in keys(ph, toks, pos, len(tt)): tp[key][tok] += 1
        spans.append((toks, tok, own, region))
    chat = [apply_values([x[0] for x in tokenize(s, names)[0]], V) for s, names in chatter]
    if new: chat = [pform(t) for t in chat]
    occ, occ_c = collections.defaultdict(collections.Counter), collections.Counter()
    redundant = new and os.environ.get("FRONT_V2_OLD_PATTERN") != "1"
    occ_red = collections.Counter()   # pattern phrase occurrences in a span of the SAME event that has its own trigger elsewhere (REDUNDANT)
    def scan(toks, hit, own=None, region=None, ev=None):
        for ph in phrases:
            pt = ph.split()
            if own and len(own) > len(pt): continue
            for i in range(len(toks) - len(pt) + 1):
                if toks[i:i + len(pt)] == pt:
                    for key in keys(ph, toks, i, len(pt)):
                        hit(key)
                        if redundant and region and "NAME" in pt and not (region[0] <= i < region[1]): occ_red[(key, ev)] += 1
    for toks, ev, own, region in spans: scan(toks, lambda key: occ[key].update([ev]), own, region, ev)
    for toks in chat: scan(toks, lambda key: occ_c.update([key]))
    rules = []
    for key, c in tp.items():
        n = sum(c.values()); tok, k = c.most_common(1)[0]
        fp = occ_c[key] + sum(v for e, v in occ[key].items() if e != tok) + occ_red[(key, tok)]   # REDUNDANT: pattern rules also lose where a span already has its own trigger
        prec = n / (n + fp)
        if n >= min_count and k / n >= share and prec >= min_prec:
            e = {"p": key[0], "prev": key[1], "next": key[2], "tok": tok, "n": n, "prec": round(prec, 3)}
            if key[3] != "*": e["prev2"] = key[3]
            if "NAME" in key[0].split(): e["ins"] = True
            else:
                kv = [x for x in key[0].split() if x in value_tokens]
                if kv: e["keep"] = kv
            rules.append(e)
    spec = lambda e: (e["prev"] != "*") + (e["next"] != "*") + (e.get("prev2", "*") != "*")
    rules.sort(key=lambda e: (-len(e["p"].split()), -spec(e), -e["n"], e["p"], e["prev"], e["next"], e.get("prev2", "*")))
    return rules


DEFAULTS = {"seg_epochs": 5, "val_min_count": 2, "val_min_prec": 0.7, "trig_min_count": 2, "trig_share": 0.75, "trig_min_prec": 0.6}


def learn(msgs, params=None, keep=None):
    """keep (default None: every request and the text outside the spans, exactly as before): a function wire -> bool. With it the value
    n-grams and the trigger rules are learned ONLY from the requests it keeps (a micro-world's own rows, msg_to_world.py FRONT_ROWS=world):
    the text outside the spans and the requests of other events are not read, so a rule's precision is counted inside those rows only.
    The names of every wire of the message still count as names (the tokenization of the rows is the same either way)."""
    P = dict(DEFAULTS, **(params or {}))
    reqs, chatter = requests(msgs)
    if keep is not None: reqs, chatter = [r for r in reqs if keep(r[1])], []
    V = learn_values(reqs, P["val_min_count"], P["val_min_prec"])
    vt = set(value_kinds())
    T = learn_triggers(reqs, chatter, V, P["trig_min_count"], P["trig_share"], P["trig_min_prec"], vt)
    # the BIO tagger (train_segmenter) is NOT part of the pipeline (owner's decision, 2026-10-31); it is trained only on request, as a
    # labelled reference: FRONT_TAGGER=1
    S = train_segmenter(msgs, P["seg_epochs"]) if os.environ.get("FRONT_TAGGER") == "1" else {}
    return {"about": "front.json: the learned front end of the VSS world `real` (training/sketch/front.py); learned from " + str(len(msgs)) + " training messages",
            "params": P, "values": dict(sorted(V.items())), "triggers": T, "segmenter": dict(sorted(S.items())), **({"v2": ["MASK", "CTX2", "NAMEPH"]} if v2() else {}),
            **({"value_learning": {k: os.environ[k] for k in ("VAL_PREC", "VAL_SUB") if os.environ.get(k)}}
               if any(os.environ.get(k) for k in ("VAL_PREC", "VAL_SUB")) else {})}


# The training folders, in one place. DATA=old (or unset): the first two (exactly the original behaviour); DATA=all: all five.
TRAIN_DIRS = {"old": ["sonnet_msg", "haiku_msg"],
              "all": ["sonnet_msg", "haiku_msg", "sonnet_msg2", "haiku_msg2", "sonnet_long"],
              "everything": ["sonnet_msg", "haiku_msg", "sonnet_msg2", "haiku_msg2", "sonnet_long", "../llm_bench/fresh1/sonnet", "../llm_bench/fresh1/haiku"],   # paths relative to llm_train/
              "spans": ["sonnet_msg", "haiku_msg", "sonnet_msg2", "haiku_msg2", "sonnet_long", "../llm_bench/fresh1/sonnet", "../llm_bench/fresh1/haiku",
                        "../llm_bench/sonnet_spans", "../llm_bench/haiku_spans"]}   # every annotated folder with spans (micro_tools.py DIRS)


def extra_dirs():
    """EXTRA_DIRS (FEEDBACK_PLAN.md arms): extra annotated folders added to EVERY learned part, the same list everywhere (front.py train_dirs,
    train_cutter.py DIRS, micro_tools.py DIRS = the context filler's folders, training/neural/make_data.py DIRS). A space- or comma-separated
    list of folders relative to training/sketch (e.g. "llm_train/opus_train_a llm_train/opus_gen_1") or absolute. Unset or empty: [], so
    every default behaviour is unchanged. A listed folder without msg_*.jsonl / batch_*.jsonl is an error (never a silent empty arm)."""
    import glob
    out = []
    for d in os.environ.get("EXTRA_DIRS", "").replace(",", " ").split():
        d = os.path.relpath(os.path.join(HERE, d), HERE) if not os.path.isabs(d) else d
        if not (glob.glob(os.path.join(HERE, d, "msg_*.jsonl")) or glob.glob(os.path.join(HERE, d, "batch_*.jsonl"))):
            raise SystemExit(f"EXTRA_DIRS: {d!r} has no msg_*.jsonl / batch_*.jsonl (not written or not annotated yet)")
        if d not in out: out.append(d)
    return out


def train_dirs():
    """DATA picks the base folders; two switches add folders (default off: exactly the base folders; ROUND2.md):
    SHORT=1 adds the one-request short messages llm_train/{sonnet,haiku}_short (the same folders train_cutter.py SHORT=1 adds);
    OPS=1 adds the messages of the new operations llm_train/ops_groups, llm_train/ops_positions (DIAGRAM_OPS.md section 7; a folder
    that does not exist yet adds nothing; only msg_*.jsonl / batch_*.jsonl are read, never the texts_*.jsonl saved before annotation)."""
    d = os.environ.get("DATA") or "old"
    if d not in TRAIN_DIRS: raise SystemExit(f"DATA={d!r}: expected one of {sorted(TRAIN_DIRS)}")
    out = list(TRAIN_DIRS[d])
    if os.environ.get("SHORT") == "1": out += ["sonnet_short", "haiku_short"]
    if os.environ.get("OPS") == "1": out += ["ops_groups", "ops_positions"]
    out += [os.path.relpath(os.path.join(HERE, d), os.path.join(HERE, "llm_train")) for d in extra_dirs()]   # EXTRA_DIRS (default: none)
    return out


def load_msgs(dirs=None):
    import glob
    files = sorted(f for d in (dirs or train_dirs()) for pat in ("msg_*.jsonl", "batch_*.jsonl") for f in glob.glob(os.path.join(HERE, "llm_train", d, pat)))   # sorted over all folders, as the old glob did
    return [json.loads(l) for f in files for l in open(f) if l.strip()]


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
