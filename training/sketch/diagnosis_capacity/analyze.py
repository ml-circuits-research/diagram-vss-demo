"""analyze.py: patterns of the requests by the STRUCTURE of the normalized tokens and the gold frame (frames.py output), accuracy per
pattern on fit (train rows, calib rows) and dev, and the collision test: rows the reader cannot tell apart (same kind sequence and the
same pattern of repeated words: the route book addresses depend on nothing else) whose gold frames are incompatible.
Run: python3 analyze.py  -> prints the tables (CAPACITY.md quotes them) and writes collisions.json"""
import collections, itertools, json, sys
HERE = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/capacity/"
M = json.load(open("/home/claude/diagram-vss-demo/docs/model/fix_p80_s0/model.json"))
EVROLES = {e["id"]: set(e.get("roles") or []) for e in M["legend"]["events"]}; ROLES = [r["id"] for r in M["legend"]["roles"]]
SCH = M["schema"]["roles"]; CONTENT = set(M["schema"]["content_kinds"]); SETR = {"members", "targets"}
load = lambda n: [json.loads(l) for l in open(HERE + n)]
FIT, DEV = load("fit_frames.jsonl"), load("dev_frames.jsonl")


def gcanon(v):
    if isinstance(v, list): return ("S", tuple(sorted(x["head"] for x in v)))
    if isinstance(v, dict): return ("E", v["head"], v.get("attr"), v.get("det"))
    return ("W", str(v))


def dcanon(fl):
    if fl is None: return None
    if fl[0] == "set": return ("S", tuple(sorted(e[1] for e in fl[1:])))
    if fl[0] == "entity":
        a = fl[2]; return ("E", fl[1], (a[1] if a and a[0] == "word" else ("not_" + a[1]) if a else None), fl[3])
    if fl[0] == "negword": return ("W", "not_" + fl[1])
    return ("W", fl[1])


def frame_cmp(r):
    """reader-level comparison: the decoded frame against the gold training frame (legend roles only)"""
    g = {k: gcanon(v) for k, v in r["roles"].items() if k in ROLES}; d = {k: dcanon(v) for k, v in r["frame"]["roles"].items()}
    d = {k: v for k, v in d.items() if v is not None}
    ev_ok = r["frame"]["event"] == r["ev"] and r["status"] not in ("unknown-event", "no-sense")
    miss = [k for k in g if k not in d]; extra = [k for k in d if k not in g]; wrong = [k for k in g if k in d and d[k] != g[k]]
    return ev_ok, miss, extra, wrong


def feats(r):
    toks, ks, lab, p = r["tokens"], r["kinds"], r["labels"], r["pred"]
    verbs = [i for i, k in enumerate(ks) if k == "VERB"]
    pos = [i for i, l in enumerate(lab) if any(x != "pred" for x in l)]
    f = {"nV": len(verbs), "pred": p, "pred_first": p is not None and verbs and p == verbs[0], "list": any(k in SETR for k in r["roles"]),
         "left": p is not None and any(i < p for i in pos), "far": p is not None and any(abs(i - p) > 5 for i in pos),
         "nNames": sum(1 for k in ks if k == "NAME"), "unk": sum(1 for k in ks if k == "unknown"), "len": len(toks),
         "lost": [x for x in r["lost"] if not x.startswith("verb of")], "nroles": len([k for k in r["roles"] if k in ROLES])}
    # the no-sense rule (reader.js formalizeState): unplaced = unknown-kind tokens + content-kind tokens not placed; > half -> no-sense
    placed = set()
    for k, v in r["roles"].items():
        if isinstance(v, list): placed |= {x["head"] for x in v}
        elif isinstance(v, dict): placed |= {x for x in (v["head"], v.get("attr"), v.get("det")) if x}
        else: placed.add(str(v))
    if p is not None: placed.add(toks[p])
    unpl = sum(1 for t, k in zip(toks, ks) if k == "unknown" or (k in CONTENT and t not in placed))
    f["gold_nosense"] = len(toks) > 0 and unpl > 0.5 * len(toks)
    # the one-to-one rule: a word fills at most as many roles as it occurs
    use = collections.Counter()
    for k, v in r["roles"].items():
        if k not in ROLES: continue
        if isinstance(v, list): use.update(x["head"] for x in v)
        elif isinstance(v, dict): use[v["head"]] += 1
        else: use[str(v)] += 1
    f["one_to_one"] = any(c > max(1, toks.count(w)) for w, c in use.items())
    # admissible candidates: the filler's kind must be one of the role's kinds; the role must be one of the event's roles
    bad = []
    for k, v in r["roles"].items():
        if k not in ROLES: continue
        rs = SCH.get(k, {}); hk = set(rs.get("head_kinds") or rs.get("kinds") or [])
        heads = [x["head"] for x in v] if isinstance(v, list) else [v["head"]] if isinstance(v, dict) else [str(v)]
        for h in heads:
            kk = [ks[i] for i, t in enumerate(toks) if t == h]
            if kk and kk[0] not in hk: bad.append(f"{k}:{h}/{kk[0]}")
        if r["ev"] and k not in EVROLES.get(r["ev"], set()): bad.append(f"{k} not a role of {r['ev']}")
    f["inadmissible"] = bad
    return f


def pattern(r, f):
    if f["pred"] is None: return "P1 no event token of the gold event in the span"
    if f["lost"]: return "P2 a gold role's word is not in the span (pronoun / context / value lost)"
    if f["nV"] >= 2 and not f["pred_first"]: return "P3 two+ event tokens, gold = a LATER one"
    if f["nV"] >= 2: return "P4 two+ event tokens, gold = the first"
    if f["list"]: return "P5 one event token, a list (set role)"
    if f["left"]: return "P6 one event token, a role filler BEFORE it"
    if f["unk"]: return "P7 one event token, roles after it, unknown-kind word(s)"
    if f["far"]: return "P8 one event token, roles after it, a filler > 5 tokens away"
    return "P9 one event token, roles after it, all near, no unknown kinds"


for rows in (FIT, DEV):
    for r in rows:
        r["f"] = feats(r); r["pat"] = pattern(r, r["f"]); ev_ok, miss, extra, wrong = frame_cmp(r)
        r["frame_ok"] = ev_ok and not miss and not extra and not wrong; r["fr"] = (ev_ok, miss, extra, wrong)


def table(title, key):
    print(f"\n## {title}\n\n| pattern | fit train n | right | frame right | fit calib n | right | dev n | right | frame right |\n|---|---|---|---|---|---|---|---|---|")
    groups = sorted({key(r) for r in FIT + DEV})
    pc = lambda xs, a: f"{100 * sum(1 for x in xs if x[a]) / len(xs):.1f}%" if xs else "-"
    for g in groups:
        tr = [r for r in FIT if key(r) == g and r["split"] == "train"]; ca = [r for r in FIT if key(r) == g and r["split"] == "calib"]
        dv = [r for r in DEV if key(r) == g]
        print(f"| {g} | {len(tr)} | {pc(tr, 'ok')} | {pc(tr, 'frame_ok')} | {len(ca)} | {pc(ca, 'ok')} | {len(dv)} | {pc(dv, 'ok')} | {pc(dv, 'frame_ok')} |")
    for nm, xs in (("all", None),):
        tr = [r for r in FIT if r["split"] == "train"]; ca = [r for r in FIT if r["split"] == "calib"]
        print(f"| **all** | {len(tr)} | {pc(tr, 'ok')} | {pc(tr, 'frame_ok')} | {len(ca)} | {pc(ca, 'ok')} | {len(DEV)} | {pc(DEV, 'ok')} | {pc(DEV, 'frame_ok')} |")


if __name__ == "__main__":
    print("fit rows by split:", collections.Counter(r["split"] for r in FIT), " fit right", sum(r["ok"] for r in FIT), "/", len(FIT))
    table("Exclusive patterns (first match)", lambda r: r["pat"])
    table("Event-token count x position of the gold one", lambda r: f"nV={min(r['f']['nV'], 3)} " + ("gold first" if r["f"]["pred_first"] else "gold later" if r["f"]["pred"] is not None else "no gold token"))
    table("Names in the span", lambda r: f"names={min(r['f']['nNames'], 4)}")
    table("Unknown-kind tokens in the span", lambda r: f"unk={min(r['f']['unk'], 3)}")
    table("Length of the span (tokens)", lambda r: f"len {'<=4' if r['f']['len'] <= 4 else '5-7' if r['f']['len'] <= 7 else '8-11' if r['f']['len'] <= 11 else '>=12'}")
    table("Number of gold roles", lambda r: f"roles={min(r['f']['nroles'], 5)}")
    table("Gold event", lambda r: str(r["ev"]))
    print("\n## Mechanism checks on the gold frames (fit train rows / dev rows)")
    for nm, fn in (("gold frame itself would be no-sense (> half the tokens unknown-kind or unplaced content)", lambda r: r["f"]["gold_nosense"]),
                   ("a word fills more roles than it occurs (one-to-one rule forbids)", lambda r: r["f"]["one_to_one"]),
                   ("a filler of a kind its role does not admit / a role not of the event", lambda r: bool(r["f"]["inadmissible"]))):
        tr = [r for r in FIT if r["split"] == "train" and fn(r)]; dv = [r for r in DEV if fn(r)]
        print(f"- {nm}: train {len(tr)} (right {sum(r['ok'] for r in tr)}), dev {len(dv)} (right {sum(r['ok'] for r in dv)})")
        for r in (tr + dv)[:4]: print(f"    {' '.join(r['tokens'])} | ev {r['ev']} roles {json.dumps(r['roles'])} {r['f']['inadmissible']}")
