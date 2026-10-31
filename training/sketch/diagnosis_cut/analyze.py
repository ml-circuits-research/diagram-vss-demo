"""analyze.py: per-span centre counts, extra-wire sources, miss causes and mechanisms of the VSS own cut (read-only).
Reads the JSON written by cutstats.mjs.
  python3 analyze.py <model.json> [--alone <other.json>] [--ex N] [--json out.json]
--alone: take the 'reading alone' of each span from another run (for the centre model, whose own reading alone is not meaningful).
"""
import json, re, sys
from collections import Counter, defaultdict

args = sys.argv[1:]
path = args[0]
opt = lambda k, d=None: args[args.index(k) + 1] if k in args else d
alone_path, NEX, JOUT = opt("--alone"), int(opt("--ex", 3)), opt("--json")
D = json.load(open(path))
A = {r["id"]: r for r in json.load(open(alone_path))} if alone_path else None
WORD = re.compile(r'"[^"]*"|“[^”]*”|[A-Za-z0-9_][A-Za-z0-9_\'’-]*')
_m = json.load(open("/home/claude/diagram-vss-demo/docs/model/fix_p80_s0/model.json"))
EV = set(v for e in _m["legend"]["events"] for v in e["verbs"])   # the legend's event tokens (identical in the four models)
CM = any(st.get("members") for r in D for st in r["stretches"])


def words(text, c0, c1):
    return [(m.start(), m.end()) for m in WORD.finditer(text) if m.start() >= c0 and m.end() <= c1]


def overlap(a0, a1, b0, b1):
    return a0 < b1 and b0 < a1


def covered(st, text):
    if st.get("members"):
        W = [(m.start(), m.end()) for m in WORD.finditer(text)]
        return set(w for w in W if any(a <= w[0] < b for a, b, t in st["members"]))
    return set(words(text, st["c0"], st["c1"]))


def bin_n(n):
    return "3+" if n >= 3 else str(n)


MECH = {
    "M1a": "two centres from ONE trigger phrase: the scan resumes inside the fired phrase (same event twice)",
    "M1b": "a literal legend event word of the request (is, which, color, ...) beside the request's own action token",
    "M1c": "two trigger words of one annotated request (both on the annotated trigger, or a request with two verbs)",
    "M2": "a learned rule fires inside the request on a word that is not its trigger",
    "M3": "the request's words go to a neighbour centre's stretch",
    "M4": "no event token even when the span is read alone (verbless for the front end)",
    "M5": "event token found alone but not in the message scan (context at the span start / skipped by the scan)",
    "M6": "one centre, stretch = span, read differently (context of created names)",
    "M7": "one centre, no other event token: the per-stretch score cuts the span short or extends it",
    "M8": "a centre outside every span",
    "M9": "centre found but dropped / unreadable",
    "M10": "two requests' centres joined into one stretch (over-join; only with joined stretches)",
    "M0": "other",
}

per_bin = defaultdict(lambda: [0, 0, 0]); per_bin_found = defaultdict(lambda: [0, 0, 0])
miss_cls = Counter(); miss_ex = defaultdict(list); loss_cls = Counter(); loss_ex = defaultdict(list)
extra_cls = Counter(); extra_ex = defaultdict(list); pair_ct = Counter(); extra_tok = Counter()
mech_loss = Counter(); mech_miss = Counter(); mech_extra = Counter(); mech_ex = defaultdict(list); mech_pairs = defaultdict(Counter)
G = cut_right = alone_right = both = gain = n_extra = 0
rows_out = []


def add(c, k, e, store, n=NEX):
    c[k] += 1
    if len(store[k]) < n: store[k].append(e)


def second_mech(cs, trig, text):
    """mechanism of a span (or request) holding the centres cs (text order) beside its trigger"""
    on = [bool(trig and overlap(c["c0"], c["c1"], trig[0], trig[1])) for c in cs]
    if any(c.get("insidePrev") for c in cs[1:]): return "M1a"
    off = [c for c, o in zip(cs, on) if not o]
    if not off: return "M1c"
    if all(c["how"] == "literal" for c in off): return "M1b"
    return "M2"


for r in D:
    text, spans, cents, sts = r["text"], r["spans"], r["centres"], r["stretches"]
    AR = A[r["id"]] if A else r
    alone, alone_toks = AR["alone"]["perGold"], AR["aloneToks"]
    cut = r["cut"]

    def span_of(c0):
        for j, s in enumerate(spans):
            if s["c0"] >= 0 and s["c0"] <= c0 < s["c1"]: return j
        return -1
    kept_in, found_in = defaultdict(list), defaultdict(list)
    for si, st in enumerate(sts):
        j = span_of(cents[st["cj"][0]]["c0"])
        if j >= 0: kept_in[j].append(si)
    for ci, c in enumerate(cents):
        j = span_of(c["c0"])
        if j >= 0: found_in[j].append(ci)
    cov = [covered(st, text) for st in sts]
    absorbed = set(ci for st in sts for ci in st["cj"][1:])
    span_mech = {}
    for j, s in enumerate(spans):
        if s["c0"] < 0: continue
        G += 1
        cr, ar = cut["perGold"][j]["st"] == "right", alone[j]["st"] == "right"
        cut_right += cr; alone_right += ar; both += cr and ar; gain += cr and not ar
        nk, nf = len(kept_in[j]), len(found_in[j])
        for B, n in ((per_bin, nk), (per_bin_found, nf)):
            b = B[bin_n(n)]; b[0] += 1; b[1] += cr; b[2] += ar
        at = alone_toks[j] or []
        ev_alone = [t for t in at if t in EV]
        W = set(words(text, s["c0"], s["c1"]))
        other_cov = set().union(*[cov[si] for si in range(len(sts)) if si not in kept_in[j]]) if sts else set()
        neigh = bool(W & other_cov)
        fc = [cents[ci] for ci in found_in[j]]
        # skipped literal event words inside the span (base scan): they block a stretch holding both (exactly one event token per stretch)
        skipped = [x for c in cents for x in c.get("skipped", []) if s["c0"] <= x["c0"] < s["c1"]]
        mech2 = second_mech(fc, s["trig"], text) if nf >= 2 else ("M1b" if skipped or len(ev_alone) >= 2 else None)
        if nf >= 2: mech_pairs[mech2][" + ".join(f'{c["tok"]}({c["how"][0]})' for c in fc)] += 1
        span_mech[j] = mech2
        rec = {"id": r["id"], "span": s["span"], "act": s["act"], "nk": nk, "nf": nf, "cut": cut["perGold"][j]["st"], "alone": alone[j]["st"],
               "centres": [(c["tok"], c["how"], text[c["c0"]:c["c1"]], c.get("insidePrev", False)) for c in fc], "stretches": [sts[si]["src"] for si in kept_in[j]]}
        if cr:
            rows_out.append(rec); continue
        ftoks = " + ".join(f'{c["tok"]}({c["how"][0]}{"*" if c.get("insidePrev") else ""}:{text[c["c0"]:c["c1"]]})' for c in fc)
        ex = f'{r["id"]} "{s["span"]}" gold {s["act"]} | centres [{ftoks}] | read ' + " / ".join(f'"{sts[si]["src"]}"' for si in kept_in[j]) + f' | alone [{" ".join(at)}]'
        nb = " [words taken by a neighbour stretch]" if neigh else ""
        if nf == 0:
            if not ev_alone: k, m = "no centre: no event token even alone", "M4"
            elif skipped: k, m = "no centre: the span's event token skipped by the scan (it resumes after the first FIRED rule)", "M5"
            else: k, m = "no centre: event token only in the span's own normalization (rule context in the sentence)", "M5"
            k += nb
            if neigh and m == "M4": m = "M4"
        elif nk == 0 and any(ci in absorbed for ci in found_in[j]):
            k, m = "centre absorbed into a joined stretch with another request's centre (over-join)", "M10"
        elif nk == 0:
            k = ("centre(s) found, all rejected (null >= 0.5) or unknown-event / no-sense" if CM else
                 "centre(s) found, every stretch unreadable" if not any(c["readable"] for c in fc) else "centre(s) found, dropped by the DP") + nb
            m = mech2 or ("M3" if neigh else "M9")
        elif nk >= 2:
            k, m = "split: 2+ readings in the span", mech2
        else:
            C = cov[kept_in[j][0]]; miss = W - C; out = C - W
            if not miss and not out: k, m = "one centre, stretch = span, read differently", "M6"
            elif miss:
                if miss & other_cov: k, m = "one centre, span words taken by a neighbour stretch", "M3"
                elif mech2: k, m = "one centre, stretch bounded by a second event token of the span", mech2
                else: k, m = "one centre, the per-stretch score left span words out", "M7"
                if out: k += " (+ takes outside words)"
            else:
                k, m = "one centre, stretch takes words outside the span", "M7"
            if CM and m in ("M7", "M6"): m = "M7"
        rec.update(cause=k, mech=m); rows_out.append(rec)
        add(miss_cls, k, ex, miss_ex); mech_miss[m] += 1
        if ar:
            add(loss_cls, k, ex, loss_ex); mech_loss[m] += 1
            if len(mech_ex["L" + m]) < NEX: mech_ex["L" + m].append(ex)
    used_si = set(g.get("si") for g in cut["perGold"] if g["st"] != "missed")
    for e in cut["extra"]:
        n_extra += 1
        si = e["si"]; st = sts[si]; c = cents[st["cj"][0]]; j = span_of(c["c0"])
        ex = f'{r["id"]} {c["tok"]}({c["how"]}{"*" if c.get("insidePrev") else ""}:{text[c["c0"]:c["c1"]]}) <- "{st["src"]}" act {e["act"]}'
        extra_tok[c["tok"]] += 1
        if j >= 0:
            s = spans[j]; ex += f' | span "{s["span"]}" gold {s["act"]}'
            on_trig = bool(s["trig"] and overlap(c["c0"], c["c1"], s["trig"][0], s["trig"][1]))
            if si in used_si: k, m = "one reading gives 2 wires", "M0"
            elif len(kept_in[j]) >= 2:
                toks = [cents[sts[x]["cj"][0]]["tok"] for x in kept_in[j]]
                k = "second centre in a span"; pair_ct[" + ".join(toks)] += 1
                if c.get("insidePrev"): m = "M1a"
                elif on_trig: m = span_mech.get(j) or "M1c"
                elif c["how"] == "literal": m = "M1b"
                else: m = "M2"
            else:
                k, m = "the span's only reading, act differs from the gold", "M6"
        else:
            hs = any(sp["c0"] >= 0 and overlap(c["sent"][0], c["sent"][1], sp["c0"], sp["c1"]) for sp in spans) if "sent" in c else None
            k = "centre outside every span" + (", sentence holds a span" if hs else ", sentence holds no span" if hs is False else "")
            m = "M8"
        add(extra_cls, k, ex, extra_ex); mech_extra[m] += 1
        if len(mech_ex["X" + m]) < NEX: mech_ex["X" + m].append(ex)

print(f"== {path}  (alone from {alone_path or path})")
print(f"gold {G}; alone right {alone_right} ({100*alone_right/G:.1f}%); cut right {cut_right} ({100*cut_right/G:.1f}%); both {both}; right only in the cut {gain}; right only alone {alone_right-both}; extra {n_extra}")
print("\nper span: readings (kept centres) of the cut in it | spans | cut right | alone right")
for k in ["0", "1", "2", "3+"]:
    b = per_bin[k]
    if b[0]: print(f"  {k:>2} | {b[0]:4d} | {b[1]:4d} {100*b[1]/b[0]:5.1f}% | {b[2]:4d} {100*b[2]/b[0]:5.1f}%")
print("per span: centres FOUND (before the DP / before the null) in it")
for k in ["0", "1", "2", "3+"]:
    b = per_bin_found[k]
    if b[0]: print(f"  {k:>2} | {b[0]:4d} | {b[1]:4d} {100*b[1]/b[0]:5.1f}% | {b[2]:4d} {100*b[2]/b[0]:5.1f}%")
print("\nextra wires by source:")
for k, v in extra_cls.most_common():
    print(f"  {v:4d}  {k}")
    for e in extra_ex[k]: print("        " + e[:300])
print("  token sequences of spans with 2+ readings (per extra):", pair_ct.most_common(15))
print("  extra wires by centre token:", extra_tok.most_common(15))
print("\ncut misses (cut not right) by first cause:  n  (alone right = lost by the cut)")
for k, v in miss_cls.most_common():
    print(f"  {v:4d} ({loss_cls[k]:4d})  {k}")
    for e in loss_ex[k] or miss_ex[k]: print("        " + e[:330])
print("\nmechanisms:  losses (alone right, cut not) | all cut misses | extra wires")
for m in MECH:
    if mech_loss[m] or mech_extra[m] or mech_miss[m]:
        print(f"  {m:4s} {mech_loss[m]:4d} | {mech_miss[m]:4d} | {mech_extra[m]:4d}   {MECH[m]}")
for m in ["M1a", "M1b", "M1c", "M2"]:
    print(f"  {m} spans with 2+ centres, centre sequences:", mech_pairs[m].most_common(8))
for k in sorted(mech_ex):
    print(f"  ex {k}:"); [print("        " + e[:300]) for e in mech_ex[k]]
if JOUT:
    json.dump({"G": G, "cut_right": cut_right, "alone_right": alone_right, "extra": n_extra, "per_bin": per_bin, "per_bin_found": per_bin_found,
               "mech_loss": mech_loss, "mech_miss": mech_miss, "mech_extra": mech_extra, "miss_cls": miss_cls, "loss_cls": loss_cls, "extra_cls": extra_cls, "pair_ct": pair_ct, "extra_tok": extra_tok, "mech_pairs": mech_pairs, "rows": rows_out}, open(JOUT, "w"), indent=0)
