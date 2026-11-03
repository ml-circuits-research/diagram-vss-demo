#!/usr/bin/env python3
"""validate_combo.py: checks the combination messages after proofreading (BRIEF_HAIKU.md) and writes the ones that pass as training data.

Input
- raw: llm_train/synth_combo_raw/raw_NN.jsonl (gen_rules_cover.py --combo): {id, domain, names, text, wires: [{span, trigger, type, args, keep}],
  rules_raw}. `keep` = the words of that request a proofreader must keep (trigger, value words, names, references, numbers, quoted labels).
- rewritten: llm_train/synth_combo_raw/rewritten/rw_NN.jsonl (the Haiku agents): {id, text} per line, the same ids as raw_NN.jsonl.

For each rewritten message
1. Spans and triggers are re-derived: request by request, in order, the shortest stretch of the new text that holds every `keep` word of the
   request (whole words, case-insensitive; a word of 5+ letters may differ by one letter, so a typo the proofreader fixed still matches); the
   span is that stretch, the trigger the raw trigger found inside it (as written in the new text). The names of a request must keep their
   order (from / to, target / anchor).
2. The Rules reader (check_rules.mjs: docs/js/logic.js, the canonical form of bench-canon.js) reads the new text.
3. Verdict:
   - kept, check "rules": the Rules' wires equal the gold exactly;
   - kept, check "values": the Rules differ (a construction they cannot read, or a known Rules/convention difference) but every gold value
     still appears in its span (step 1 found every keep word); the Rules' first difference is recorded per message (combo_report.json);
   - rejected: a keep word missing, a request's names reordered, an empty or missing text, an id mismatch, a name the canvas does not have
     (the Rules note '"X" is not a shape I know' for a word that was not in the raw text), or the Rules reading MORE requests in the new text
     than the gold when they read the raw text with the right number (the rewrite added a request).
Output: llm_train/synth_combo/msg_NN.jsonl (kept, TRAIN_MSG_SPEC.md format), synth/combo_rejects.jsonl, synth/combo_report.json; a summary on stdout.
Run: python3 training/sketch/synth/validate_combo.py [--raw DIR] [--rewritten DIR] [--out DIR] [--per_file 500]
"""
import argparse, collections, glob, json, os, re, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
import sys; sys.path.insert(0, HERE)
import pin_logic   # the Rules copy the checks read (committed HEAD unless LOGIC_JS / LOGIC_REV say otherwise)
SK = os.path.dirname(HERE)
TOK = re.compile(r'"[^"]*"|“[^”]*”|(?<![\w])\'[^\']+\'(?![\w])|[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*')   # "Proxy's" -> Proxy, s

def norm_tok(t):
    t = t.lower().replace("’", "'")
    if t[:1] in "\"“'" and len(t) > 1: t = '"' + t[1:-1].strip() + '"'
    return t

def toks(s): return [(norm_tok(m.group()), m.start(), m.end()) for m in TOK.finditer(s)]

def osa1(a, b):
    """True when a and b differ by at most one edit (insert, delete, replace, swap of neighbours)"""
    if a == b: return True
    if abs(len(a) - len(b)) > 1: return False
    if len(a) == len(b):
        d = [i for i in range(len(a)) if a[i] != b[i]]
        return len(d) == 1 or (len(d) == 2 and d[1] == d[0] + 1 and a[d[0]] == b[d[1]] and a[d[1]] == b[d[0]])
    if len(a) > len(b): a, b = b, a
    for i in range(len(b)):
        if b[:i] + b[i + 1:] == a: return True
    return False

def tok_eq(k, t): return k == t or (k.isalpha() and len(k) >= 5 and len(t) >= 5 and k[0] == t[0] and osa1(k, t))

def occurrences(T, key, start):
    """positions (i, j) in token list T (from index `start`) where the token sequence `key` occurs"""
    out = [(i, i + len(key) - 1) for i in range(start, len(T) - len(key) + 1) if all(key[x] == T[i + x][0] for x in range(len(key)))]
    if out or any(all(key[x] == T[i + x][0] for x in range(len(key))) for i in range(len(T) - len(key) + 1)): return out
    # no exact occurrence anywhere in the text: a word of 5+ letters may differ by one letter (a typo the proofreader fixed, or made)
    return [(i, i + len(key) - 1) for i in range(start, len(T) - len(key) + 1) if all(tok_eq(key[x], T[i + x][0]) for x in range(len(key)))]

def window(T, keys, start):
    """the stretch of T from `start` holding every key: the keys in their raw order when possible, then the shortest, then the earliest
    -> ((i0, i1, {key index: (i, j)}), None) or (None, index of a missing key)"""
    occ = [occurrences(T, k, start) for k in keys]
    for n, o in enumerate(occ):
        if not o: return None, n
    best = None
    for p in sorted({o[0] for oc in occ for o in oc}):
        pick = {}
        for n, oc in enumerate(occ):
            nx = [o for o in oc if o[0] >= p]
            if not nx: pick = None; break
            pick[n] = nx[0]
        if pick is None: continue
        i0 = min(v[0] for v in pick.values()); i1 = max(v[1] for v in pick.values())
        pos = [pick[n][0] for n in range(len(keys))]
        inv = sum(1 for x in range(len(pos)) for y in range(x + 1, len(pos)) if pos[x] > pos[y])   # keys out of their raw order
        sc = (inv, i1 - i0, i0)
        if best is None or sc < best[3]: best = (i0, i1, pick, sc)
    return ((best[0], best[1], best[2]), None) if best else (None, 0)

# a span grows from the keep words to the whole request: leftwards over question openers and articles, rightwards to the end of the clause
LEFT_OK = {"what", "whats", "which", "who", "where", "how", "is", "are", "does", "do", "did", "has", "have", "the", "a", "an", "any", "there", "me", "show",
           "tell", "list", "count", "many", "much", "s"}
RIGHT_STOP = {"and", "then", "after", "afterwards", "finally", "also", "next", "so", "because", "since", "please", "thanks", "thank", "pls", "but", "too"}
def extend(text, T, i0, i1, lo, hi, own=()):
    """grow token window [i0, i1] within [lo, hi]: left over LEFT_OK words and the words of the raw request (`own`), right to a clause end
    (punctuation or a RIGHT_STOP word)"""
    gap = lambda a, b: text[T[a][2]:T[b][1]]   # the characters between token a and token b (a < b)
    while i0 - 1 >= lo and (T[i0 - 1][0] in LEFT_OK or T[i0 - 1][0] in own) and T[i0 - 1][0] not in RIGHT_STOP and not (T[i0 - 1][0] == "that" and i0 - 2 >= 0 and T[i0 - 2][0] == "after") and not re.search(r"[.!?;,]", gap(i0 - 1, i0)): i0 -= 1
    while i1 + 1 <= hi and T[i1 + 1][0] not in RIGHT_STOP and not T[i1 + 1][0].startswith('"') and not re.search(r"[.!?;,]", gap(i1, i1 + 1)): i1 += 1
    if i1 + 1 <= hi and T[i1 + 1][0].startswith('"') and not re.search(r"[.!?;,]", gap(i1, i1 + 1)): i1 += 1   # a quoted label right after
    return i0, i1

def derive(text, raw):
    """re-derived wires for the rewritten text, or (None, cause)"""
    T = toks(text); found = []; cursor = 0; prev_start = 0
    names = [n for n in raw["names"]] + [x for x in re.findall(r"[A-Z][A-Za-z0-9]*", raw["text"])]
    for wi, w in enumerate(raw["wires"]):
        keys = [[t for t, _, _ in toks(k)] for k in w["keep"]]
        keys = [k for k in keys if k]
        res, miss = window(T, keys, cursor)
        if res is None: res, miss = window(T, keys, prev_start + 1 if wi else 0)   # a word shared with the request before
        if res is None: return None, f"keep word missing: '{w['keep'][miss]}' (request {wi + 1})"
        i0, i1, pick = res
        # names keep their order inside the request (from -> to, target -> anchor)
        nk = [(pick[n][0], k) for n, k in enumerate(keys) if len(k) == 1 and any(k[0] == x.lower() for x in names)]
        order_new = [k for _, k in sorted(nk)]
        order_raw = [k for k in keys if len(k) == 1 and any(k[0] == x.lower() for x in names)]
        if [tuple(x) for x in order_new] != [tuple(x) for x in order_raw]: return None, f"names reordered inside request {wi + 1}"
        found.append((i0, i1)); cursor = i1 + 1; prev_start = i0
    wires = []
    for wi, (w, (i0, i1)) in enumerate(zip(raw["wires"], found)):
        lo = found[wi - 1][1] + 1 if wi else 0
        hi = found[wi + 1][0] - 1 if wi + 1 < len(found) else len(T) - 1
        i0, i1 = extend(text, T, i0, i1, max(lo, 0), max(hi, i1), {t for t, _, _ in toks(w["span"])})
        span = text[T[i0][1]:T[i1][2]]
        tr = [t for t, _, _ in toks(w["trigger"])]
        St = toks(span); o = occurrences(St, tr, 0)
        if not o: return None, f"trigger missing: '{w['trigger']}' (request {wi + 1})"
        trigger = span[St[o[0][0]][1]:St[o[0][1]][2]]
        wires.append({"span": span, "trigger": trigger, "type": w["type"], "args": w["args"]})
    return wires, None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", default=os.path.join(SK, "llm_train", "synth_combo_raw"))
    ap.add_argument("--rewritten", default=None)
    ap.add_argument("--out", default=os.path.join(SK, "llm_train", "synth_combo"))
    ap.add_argument("--per_file", type=int, default=500)
    a = ap.parse_args()
    rwdir = a.rewritten or os.path.join(a.raw, "rewritten")
    raw = {}
    for f in sorted(glob.glob(os.path.join(a.raw, "raw_*.jsonl"))):
        for l in open(f, encoding="utf8"):
            if l.strip(): r = json.loads(l); raw[r["id"]] = r
    rw, dup = {}, 0
    for f in sorted(glob.glob(os.path.join(rwdir, "rw_*.jsonl"))):
        for l in open(f, encoding="utf8"):
            if not l.strip(): continue
            r = json.loads(l)
            if r.get("id") in rw: dup += 1
            rw[r.get("id")] = r
    rejects, rows, cause_c = [], [], collections.Counter()
    for i, r in rw.items():
        if i not in raw: rejects.append({"id": i, "cause": "id not in the raw files"}); continue
        t = (r.get("text") or "").strip()
        if not t: rejects.append({"id": i, "cause": "empty text"}); continue
        wires, cause = derive(t, raw[i])
        if cause: rejects.append({"id": i, "text": t, "raw": raw[i]["text"], "cause": cause}); continue
        row = {"id": i, "domain": raw[i]["domain"], "names": raw[i]["names"]}
        if raw[i].get("groups"): row["groups"] = raw[i]["groups"]
        row.update({"text": t, "wires": wires}); rows.append(row)
    missing = sorted(set(raw) - set(rw))
    tmp_in, tmp_out = os.path.join(HERE, ".rw.jsonl"), os.path.join(HERE, ".rw_v.jsonl")
    with open(tmp_in, "w", encoding="utf8") as f:
        for r in rows: f.write(json.dumps(r, ensure_ascii=False) + "\n")
    if rows: subprocess.run(["node", os.path.join(HERE, "check_rules.mjs"), tmp_in, tmp_out], check=True)
    V = {v["id"]: v for v in (json.loads(l) for l in open(tmp_out))} if rows else {}
    for p in (tmp_in, tmp_out):
        if os.path.exists(p): os.remove(p)
    kept, checks, value_causes, flags = [], collections.Counter(), collections.Counter(), collections.Counter()
    for r in rows:
        v = V[r["id"]]; R = raw[r["id"]]
        rawtext_words = {w.lower() for w in re.findall(r"[A-Za-z0-9_]+", R["text"])}
        unknown = [n for n in v.get("notes", []) if n.endswith("is not a shape I know.") and re.match(r'^"([^"]+)"', n).group(1).lower() not in rawtext_words]
        if unknown: rejects.append({"id": r["id"], "text": r["text"], "raw": R["text"], "cause": "a name the canvas does not have: " + unknown[0]}); continue
        if v["ok"]: checks["rules"] += 1; kept.append(r); continue
        m = re.match(r"requests: rules (\d+), gold (\d+)", v["cause"] or "")
        raw_count_ok = R["rules_raw"] == "ok" or not (R["rules_raw"] or "").startswith("requests:")
        if m and int(m.group(1)) > int(m.group(2)) and raw_count_ok:
            rejects.append({"id": r["id"], "text": r["text"], "raw": R["text"], "cause": "the rewrite adds a request the Rules read", "rules": v["rules"]}); continue
        checks["values"] += 1; value_causes[re.sub(r"#\d+ ", "", v["cause"])[:90]] += 1
        if R["rules_raw"] == "ok": flags["raw read exactly by the Rules, rewrite not"] += 1
        r["_check"] = v["cause"]; kept.append(r)
    for x in rejects: cause_c[re.sub(r"'[^']*'|\(request \d+\)|request \d+|: .*$", "", x["cause"]).strip()] += 1
    os.makedirs(a.out, exist_ok=True)
    for f in glob.glob(os.path.join(a.out, "msg_*.jsonl")): os.remove(f)
    kept.sort(key=lambda r: r["id"])
    for k in range(0, len(kept), a.per_file):
        with open(os.path.join(a.out, f"msg_{k // a.per_file + 1:02d}.jsonl"), "w", encoding="utf8") as f:
            for r in kept[k:k + a.per_file]: f.write(json.dumps({x: y for x, y in r.items() if not x.startswith("_")}, ensure_ascii=False) + "\n")
    with open(os.path.join(HERE, "combo_rejects.jsonl"), "w", encoding="utf8") as f:
        for x in rejects: f.write(json.dumps(x, ensure_ascii=False) + "\n")
    rep = {"raw_messages": len(raw), "rewritten_messages": len(rw), "duplicate_ids_in_rewritten": dup, "raw_without_rewrite": len(missing),
           "kept": len(kept), "kept_check_rules": checks["rules"], "kept_check_values": checks["values"], "flags": dict(flags),
           "kept_values_by_rules_difference": dict(value_causes.most_common()), "rejected": len(rejects), "rejects_by_cause": dict(cause_c.most_common()),
           "values_messages": {r["id"]: r["_check"] for r in kept if "_check" in r}}
    json.dump(rep, open(os.path.join(HERE, "combo_report.json"), "w"), indent=1, ensure_ascii=False)
    print(json.dumps({k: v for k, v in rep.items() if k not in ("values_messages", "kept_values_by_rules_difference")}, indent=1))
    print("kept with check 'values' (the Rules' first difference):")
    for c, n in value_causes.most_common(25): print(f"  {n:4d}  {c}")

if __name__ == "__main__":
    main()
