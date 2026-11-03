#!/usr/bin/env python3
"""build_opus_r2.py: turns an Opus writer's batch (texts saved first, then the annotation) into training messages, with the label checks of
round 2 (TRAIN_PLAN_R2.md section 5).

Input (a folder under training/sketch/llm_train/, e.g. opus_short_r2):
  texts/texts_NN.jsonl   {id, domain, names, text}: written and saved BEFORE the annotation (AGENTS.md); never edited afterwards;
  annot/annot_NN.txt     per message "@<id>" then one line per request:
                           span | trigger | c|q|r|f <action or ask> key=value; key=value | paraphrase (an explicit command the Rules read) or -
                         or "@<id> EXCLUDE <reason>" (the message is left out and the reason is listed in the report).
Checks (a message that fails a structural check stops the build; nothing is silently dropped):
  1. every text id is annotated once (or excluded); every span is a substring of the text, in text order, not overlapping; every trigger is a
     substring of its span; the text of texts_NN.jsonl is the text written out (byte for byte);
  2. the label check: each request's paraphrase is read by the Rules (synth/check_rules.mjs, the pinned logic.js, the message's canvas) and
     must give exactly the gold wire (bench-canon form). A paraphrase is an explicit form of the SAME request ("Draft blue" -> "make Draft
     blue"), so a gold that differs from what the Rules make of the explicit form is a label error to fix, or the Rules' own limit (listed);
  3. overlap with the test sets (exact text after lower-casing / punctuation stripped, or the same token set; gen_rules_cover.test_texts:
     the six template sets, llm_short, fresh2, short3) and duplicates inside the folder: such messages are removed and counted.
Output: <folder>/msg_NN.jsonl (one per batch) and <folder>/CHECK.json (per batch: counts, the paraphrase verdicts, exclusions, overlaps).
  python3 training/sketch/synth/build_opus_r2.py training/sketch/llm_train/opus_short_r2"""
import collections, glob, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.argv_saved = sys.argv; sys.argv = [sys.argv[0]]
sys.path.insert(0, HERE)
import gen_rules_cover as G
sys.argv = sys.argv_saved
TYPES = {"c": "command", "q": "question", "r": "rule", "f": "fact"}


def parse_annot(path):
    out, cur = {}, None
    for n, line in enumerate(open(path, encoding="utf8"), 1):
        line = line.rstrip("\n")
        if not line.strip() or line.startswith("#"): continue
        if line.startswith("@"):
            parts = line[1:].split(" ", 2); cur = parts[0]
            if cur in out: raise SystemExit(f"{path}:{n}: {cur} annotated twice")
            out[cur] = {"exclude": parts[2] if len(parts) > 1 and parts[1] == "EXCLUDE" else None, "wires": []}
            continue
        f = [x.strip() for x in line.split(" | ")]
        if len(f) != 4 or cur is None: raise SystemExit(f"{path}:{n}: expected 'span | trigger | type args | paraphrase': {line!r}")
        span, trig, ta, para = f
        t, *rest = ta.split(" ", 2)
        if t not in TYPES: raise SystemExit(f"{path}:{n}: type {t!r}")
        typ = TYPES[t]; args = {}
        if typ in ("command", "question"):
            head = rest[0]; args["action" if typ == "command" else "ask"] = head; kv = rest[1] if len(rest) > 1 else ""
        else: kv = " ".join(rest)
        for x in [x for x in kv.split("; ") if x.strip()]:
            k, v = x.split("=", 1); args[k.strip()] = v.strip()
        out[cur]["wires"].append({"span": span, "trigger": trig, "type": typ, "args": args, "_para": None if para == "-" else para, "_line": n})
    return out


def main():
    folder = sys.argv[1].rstrip("/"); report = {"folder": folder, "batches": {}}
    T = G.test_texts(); exact = {G.norm(t): s for s, ts in T.items() for t in ts}; tokset = {frozenset(G.norm(t).split()): s for s, ts in T.items() for t in ts}
    seen = set(); allpara = []; batches = []
    for tf in sorted(glob.glob(os.path.join(folder, "texts", "texts_*.jsonl"))):
        nn = re.search(r"texts_(\d+)", tf).group(1); af = os.path.join(folder, "annot", f"annot_{nn}.txt")
        if not os.path.exists(af): print(f"batch {nn}: not annotated yet"); continue
        texts = [json.loads(l) for l in open(tf, encoding="utf8") if l.strip()]; A = parse_annot(af)
        miss = [t["id"] for t in texts if t["id"] not in A]; extra = sorted(set(A) - {t["id"] for t in texts})
        if miss or extra: raise SystemExit(f"batch {nn}: not annotated {miss}, unknown ids {extra}")
        msgs, excl = [], {}
        for t in texts:
            a = A[t["id"]]
            if a["exclude"]: excl[t["id"]] = a["exclude"]; continue
            pos = 0
            for w in a["wires"]:
                i = t["text"].find(w["span"], pos)
                if i < 0: raise SystemExit(f"batch {nn} {t['id']} (line {w['_line']}): span {w['span']!r} not in the text after position {pos}: {t['text']!r}")
                if w["trigger"] not in w["span"]: raise SystemExit(f"batch {nn} {t['id']} (line {w['_line']}): trigger {w['trigger']!r} not in span {w['span']!r}")
                pos = i + len(w["span"])
                if w["_para"]: allpara.append({"id": f"{t['id']}#{w['_line']}", "names": t["names"], "text": w["_para"], "wires": [{"span": w["_para"], "trigger": w["_para"], "type": w["type"], "args": w["args"]}]})
            if not a["wires"]: raise SystemExit(f"batch {nn} {t['id']}: no request and not excluded")
            msgs.append({"id": t["id"], "domain": t["domain"], "names": t["names"], "text": t["text"],
                         "wires": [{k: v for k, v in w.items() if not k.startswith("_")} for w in a["wires"]]})
        batches.append((nn, msgs, excl))
    # the label check: every paraphrase through the Rules
    tin, tout = os.path.join(folder, ".para_in.jsonl"), os.path.join(folder, ".para_out.jsonl")
    open(tin, "w").write("".join(json.dumps(p, ensure_ascii=False) + "\n" for p in allpara))
    subprocess.run(["node", os.path.join(HERE, "check_rules.mjs"), tin, tout], check=True)
    V = {v["id"]: v for v in (json.loads(l) for l in open(tout) if l.strip())}; os.remove(tin); os.remove(tout)
    bad = {k: v["cause"] for k, v in V.items() if not v["ok"]}
    for nn, msgs, excl in batches:
        kept, causes = [], collections.Counter()
        for m in msgs:
            n = G.norm(m["text"])
            if n in exact: causes[f"overlap (exact) with {exact[n]}"] += 1; continue
            if frozenset(n.split()) in tokset: causes[f"overlap (token set) with {tokset[frozenset(n.split())]}"] += 1; continue
            if n in seen: causes["duplicate text in the folder"] += 1; continue
            seen.add(n); kept.append(m)
        open(os.path.join(folder, f"msg_{nn}.jsonl"), "w", encoding="utf8").write("".join(json.dumps(m, ensure_ascii=False) + "\n" for m in kept))
        ids = {m["id"] for m in msgs}
        pv = {k: v for k, v in V.items() if k.split("#")[0] in ids}
        report["batches"][nn] = {"texts": len(msgs) + len(excl), "excluded": excl, "kept": len(kept), "requests": sum(len(m["wires"]) for m in kept),
                                 "removed": dict(causes), "paraphrases": len(pv), "paraphrases_read_as_gold": sum(1 for v in pv.values() if v["ok"]),
                                 "paraphrase_mismatches": {k: v for k, v in bad.items() if k in pv}}
    json.dump(report, open(os.path.join(folder, "CHECK.json"), "w"), indent=1, ensure_ascii=False)
    for nn, b in report["batches"].items():
        print(f"batch {nn}: {b['texts']} texts, {len(b['excluded'])} excluded, {b['kept']} kept ({b['requests']} requests), removed {b['removed']}; "
              f"paraphrases {b['paraphrases_read_as_gold']}/{b['paraphrases']} read as the gold")
        for k, c in b["paraphrase_mismatches"].items(): print(f"   MISMATCH {k}: {c}")


if __name__ == "__main__":
    main()
