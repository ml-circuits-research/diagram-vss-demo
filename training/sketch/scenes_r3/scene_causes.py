"""scenes_r3/scene_causes.py: the cause of every miss of scene_readers.mjs records (ROOT_CAUSES.md), per reader.

A miss is a gold request not done right (wrong, or not done) or an extra (a request nobody asked for). Each gets ONE primary cause, the
first stage of the pipeline that explains it (cut -> act / world -> confidence or gate -> names -> values), and every wrong key is also
counted on its own (a request with a lost size and a lost position counts once in the primary table, in both rows of the key table).
  cut          not done, and no request of the reader overlaps the gold span (nothing was read there), or the unit that covered it was paired
               with another gold request (two requests merged); an extra outside every gold span (chatter read as a request) or a second
               request inside one gold span (the cut split it)
  act / world  not done, and a request of another act overlaps the gold span (VSS: a unit with no world / no event token is "act / world"
               too); an extra of an act the gold span does not have
  gate         vb_gate only: the request was read right by VSS-BERT executing everything, but its confidence was under the threshold (a
               right request held), or a request it depends on was held
  name tags    target / anchor / from / to / members / items wrong or lost, the name written in the request
  new name     the `name` of a create / duplicate / group wrong or lost
  description  a gold mention(...) read as a name or the other way, or a mention with other keys
  context      the gold name is not written in the request ("it", "the pot", "the copy"): the context filler / the pronoun rule
  value lost: <key>   the key is in the gold and absent in the reading (at, size, width/height, distance, count, colour, layer, other)
  value wrong: <key>  present with another value
Extra columns: the VSS conversion ceiling (convert_check --dump) and the SOP-BERT label ceiling (roles_roundtrip --dump) of the gold
request, when given: a miss whose gold does not round-trip through the reader's own training rows is "oracle fails" (the reader could not
have learned it from this gold: a legend / adapter / decode / labelling cause), the others are "oracle passes" (a model / data cause).

  python3 training/sketch/scenes_r3/scene_causes.py <steps.jsonl>... [--vss-dump D.jsonl] [--sop-dump D.jsonl] [--examples N] [--md OUT]"""
import argparse, collections, json, re

READERS = ["vss", "sop", "vb_all", "vb_gate", "rules"]
NAME_KEYS = {"target", "anchor", "anchor2", "from", "to", "linked", "members", "items", "items2", "parents"}
VALUE_GROUP = {"at": "at", "size": "size", "width": "width/height", "height": "width/height", "distance": "distance", "count": "count",
               "color": "colour", "fill": "colour", "outline": "colour", "notcolor": "colour", "layer": "layer"}
NUMBER_WORDS = r"\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|a couple|a pair|twice|double)\b"


def overlap(a, b):
    return max(0, min(a[1], b[1]) - max(a[0], b[0]))


def gold_spans(rec):
    used, out = set(), []
    for g in rec["gold"]:
        s = -1
        if g.get("span"):
            k = rec["text"].find(g["span"])
            while k >= 0 and k in used: k = rec["text"].find(g["span"], k + 1)
            s = k if k >= 0 else rec["text"].find(g["span"]); used.add(s)
        out.append((s, s + len(g["span"])) if s >= 0 and g.get("span") else (0, len(rec["text"])))
    return out


def written(name, span):
    return all(re.search(r"(?<![A-Za-z0-9])" + re.escape(p.strip()) + r"(?![A-Za-z0-9])", span, re.I) for p in name.split(",") if p.strip())


def key_causes(want, got, span):
    """the causes of a paired wrong request, one per differing key -> [(cause, key, want, got)]"""
    out = []
    for k, v in want.items():
        if k in ("action", "ask"): continue
        g = got.get(k, "∅")
        if g == v: continue
        if k in NAME_KEYS:
            if "mention(" in v or "mention(" in g: c = "description"
            elif v != "$new" and not written(v, span): c = "context / pronoun"
            else: c = "name tags (target / anchor)"
        elif k == "name": c = "new name"
        else:
            grp = VALUE_GROUP.get(k, "other (" + k + ")")
            c = ("value lost: " if g == "∅" else "value wrong: ") + grp
        out.append((c, k, v, g))
    for k, g in got.items():   # keys read that the gold does not have
        if k not in want and k not in ("action", "ask") and k != "scale":
            out.append(("extra key: " + (VALUE_GROUP.get(k) or ("names" if k in NAME_KEYS else k)), k, "∅", g))
    return out


ORDER = ["description", "context / pronoun", "name tags (target / anchor)", "new name"]


def primary(kc):
    """the first cause of a wrong request: names before values (a value on the wrong shape is a name error first)"""
    cs = [c for c, *_ in kc]
    for o in ORDER:
        if o in cs: return o
    lost = [c for c in cs if c.startswith("value lost")]
    if lost: return lost[0]
    wrong = [c for c in cs if c.startswith("value wrong")]
    if wrong: return wrong[0]
    return cs[0] if cs else "?"


def classify(rec, rd, vb_all=None):
    """-> list of misses {kind: wrong | not done | extra, cause, keys, ...}"""
    R = rec["r"][rd]; G = rec["gold"]; spans = gold_spans(rec); out = []
    by_gold = {p["g"]: p for p in R["prods"] if p["g"] >= 0}
    for j, g in enumerate(G):
        p = by_gold.get(j)
        if p and p["o"] == "right": continue
        base = {"id": rec["id"], "text": rec["text"], "span": g.get("span") or "", "want": g["want"], "act": g["act"]}
        if p:   # wrong
            kc = key_causes(g["want"], p["got"], g.get("span") or rec["text"])
            if rd == "vb_gate": pass
            out.append(dict(base, kind="wrong", cause=primary(kc), keys=kc, got=p["got"])); continue
        # not done
        if rd == "vb_gate" and vb_all is not None:
            q = next((x for x in vb_all["prods"] if x["g"] == j), None)
            if q is not None:
                out.append(dict(base, kind="not done", cause="gate: held a right request" if q["o"] == "right" else "gate: held a wrong request (good)", keys=[], got=q["got"])); continue
        ov = [x for x in R["prods"] if overlap(x["span"], spans[j]) > 0]
        if any(x["act"] != g["act"] for x in ov): cause = "act / world"
        elif ov: cause = "cut (merged with another request)"
        else:
            cause = "cut (nothing read there)"
            if rd == "vss":
                us = [u for u in R.get("units", []) if overlap((u["c0"], u["c1"]), spans[j]) > 0]
                if us and all(u.get("zone") != "read" for u in us): cause = "act / world"
                elif us: cause = "act / world"
            if rd in ("sop", "vb_all") and R is not None:
                pass
        out.append(dict(base, kind="not done", cause=cause, keys=[], got=None))
    for p in R["prods"]:
        if p["o"] != "extra": continue
        ov = [j for j, s in enumerate(spans) if overlap(p["span"], s) > 0]
        if not ov: cause = "cut (chatter read as a request)"
        elif any(G[j]["act"] == p["act"] for j in ov): cause = "cut (one request read twice)"
        else: cause = "act / world"
        out.append({"id": rec["id"], "text": rec["text"], "span": rec["text"][p["span"][0]:p["span"][1]], "kind": "extra", "cause": cause, "keys": [], "got": p["got"], "act": p["act"], "want": None})
    return out


def table(misses, n_gold, title, oracle=False):
    c = collections.Counter(m["cause"] for m in misses)
    tot = len(misses)
    ofail = collections.Counter(m["cause"] for m in misses if m.get("oracle") is False)
    lines = [f"| {title} | misses | % of misses | % of gold requests |" + (" oracle fails |" if oracle else ""), "|---|---|---|---|" + ("---|" if oracle else "")]
    for k, v in c.most_common():
        lines.append(f"| {k} | {v} | {100 * v / tot:.1f}% | {100 * v / n_gold:.1f}% |" + (f" {ofail[k]} |" if oracle else ""))
    lines.append(f"| all | {tot} | 100% | {100 * tot / n_gold:.1f}% |" + (f" {sum(ofail.values())} |" if oracle else ""))
    return "\n".join(lines)


def load_oracles(vss_dump, sop_dump):
    """-> (vss: (span, sorted want items) -> ok, sop: (id, gold index) -> ok)"""
    V, S = {}, {}
    if vss_dump:
        for l in open(vss_dump):
            r = json.loads(l); V[(r["span"], json.dumps(sorted((r.get("want") or {}).items())))] = r["c"] == "ok"
    if sop_dump:
        for l in open(sop_dump):
            r = json.loads(l)
            if r["id"].startswith("sc3"):
                for j, g in enumerate(r["gold"]): S[(r["id"], j)] = g["o"] == "right"
    return V, S


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("steps", nargs="+"); ap.add_argument("--examples", type=int, default=0); ap.add_argument("--md")
    ap.add_argument("--vss-dump"); ap.add_argument("--sop-dump"); ap.add_argument("--readers", default=",".join(READERS))
    a = ap.parse_args()
    rows = [json.loads(l) for f in a.steps for l in open(f) if l.strip()]
    n_gold = sum(len(r["gold"]) for r in rows)
    out = [f"{len(rows)} steps, {n_gold} gold requests ({', '.join(a.steps)})", ""]
    V, S = load_oracles(a.vss_dump, a.sop_dump)
    for rd in a.readers.split(","):
        M = []
        for r in rows:
            for m in classify(r, rd, r["r"].get("vb_all")):
                if m["kind"] != "extra":
                    j = next((i for i, g in enumerate(r["gold"]) if (g.get("span") or "") == m["span"] and g["want"] == m["want"]), None)
                    if rd == "vss" and V: m["oracle"] = V.get((m["span"], json.dumps(sorted(m["want"].items()))))
                    if rd in ("sop", "vb_all") and S and j is not None: m["oracle"] = S.get((r["id"], j))
                M.append(m)
        orc = (rd == "vss" and bool(V)) or (rd in ("sop", "vb_all") and bool(S))
        kinds = collections.Counter(m["kind"] for m in M)
        out.append(f"### {rd}: wrong {kinds['wrong']}, not done {kinds['not done']}, extra {kinds['extra']}\n")
        out.append(table(M, n_gold, "primary cause", orc))
        kc = collections.Counter(c for m in M if m["kind"] == "wrong" for c, *_ in m["keys"])
        out.append("\nEvery wrong key of the wrong requests (a request counts in each of its rows):\n")
        out.append("| key cause | requests |\n|---|---|\n" + "\n".join(f"| {k} | {v} |" for k, v in kc.most_common()))
        if a.examples:
            out.append("\nExamples:\n")
            seen = collections.Counter()
            for m in M:
                if seen[m["cause"]] >= a.examples: continue
                seen[m["cause"]] += 1
                det = "; ".join(f"{k}: {v} -> {g}" for _, k, v, g in m["keys"][:4]) if m["keys"] else (json.dumps(m["got"]) if m["got"] else "")
                out.append(f"- {m['cause']} [{m['id']}, {m['kind']}] \"{m['span'][:110]}\" {det[:200]}")
        out.append("")
    s = "\n".join(out)
    print(s)
    if a.md: open(a.md, "w").write(s)


if __name__ == "__main__":
    main()
