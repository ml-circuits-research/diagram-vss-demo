#!/usr/bin/env python3
"""check_file.py: the synth pipeline's checks on any file of messages in the training format (e.g. training/sketch/ops/formulations.jsonl,
written by another agent): the Rules reader on every message (check_rules.mjs), the overlap with the test sets (the six template sets,
llm_short, fresh2, short3: exact text after lower-casing / punctuation stripped, and the same token set), duplicates inside the file.
Modes:
  --mode rules (default): keep a message only when the Rules' wires equal its gold (as synth_rules);
  --mode report: keep every message that does not overlap a test set; the Rules' verdict is only reported (for operations the Rules do not
                 read yet, e.g. high-level layouts).
Writes <out_dir>/msg_NN.jsonl (kept) and synth/<out_dir name>_check.json (counts, rejects by cause, the Rules' verdict per message).
Run: python3 training/sketch/synth/check_file.py <in.jsonl> <out_dir> [--mode rules|report] [--per_file 1000]
"""
import argparse, collections, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.argv_saved = sys.argv; sys.argv = [sys.argv[0]]   # gen_rules_cover parses no arguments at import
sys.path.insert(0, HERE)
import gen_rules_cover as G
sys.argv = sys.argv_saved

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inp"); ap.add_argument("out_dir")
    ap.add_argument("--mode", choices=["rules", "report"], default="rules"); ap.add_argument("--per_file", type=int, default=1000)
    a = ap.parse_args()
    rows = [json.loads(l) for l in open(a.inp, encoding="utf8") if l.strip()]
    for r in rows:   # a file written with "gold" (the wire list, e.g. ops/formulations.jsonl) instead of "wires": the training format is "wires"
        if "wires" not in r and isinstance(r.get("gold"), list): r["wires"] = r.pop("gold")
    tmp, tin = os.path.join(HERE, ".check_file_v.jsonl"), os.path.join(HERE, ".check_file_in.jsonl")
    with open(tin, "w", encoding="utf8") as f:
        for r in rows: f.write(json.dumps(r, ensure_ascii=False) + "\n")
    subprocess.run(["node", os.path.join(HERE, "check_rules.mjs"), tin, tmp], check=True); os.remove(tin)
    V = {v["id"]: v for v in (json.loads(l) for l in open(tmp) if l.strip())}; os.remove(tmp)
    T = G.test_texts()
    exact = {G.norm(t): s for s, ts in T.items() for t in ts}
    tokset = {frozenset(G.norm(t).split()): s for s, ts in T.items() for t in ts}
    kept, seen, causes, verdict = [], set(), collections.Counter(), {}
    for r in rows:
        v = V[r["id"]]; verdict[r["id"]] = "ok" if v["ok"] else v["cause"]
        n = G.norm(r["text"])
        if n in exact: causes[f"overlap (exact) with {exact[n]}"] += 1; continue
        if frozenset(n.split()) in tokset: causes[f"overlap (token set) with {tokset[frozenset(n.split())]}"] += 1; continue
        if n in seen: causes["duplicate text in the file"] += 1; continue
        if a.mode == "rules" and not v["ok"]: causes["Rules: " + re.sub(r"#\d+ ", "", v["cause"])[:100]] += 1; continue
        seen.add(n); kept.append(r)
    os.makedirs(a.out_dir, exist_ok=True)
    for k in range(0, len(kept), a.per_file):
        with open(os.path.join(a.out_dir, f"msg_{k // a.per_file + 1:02d}.jsonl"), "w", encoding="utf8") as f:
            for r in kept[k:k + a.per_file]: f.write(json.dumps(r, ensure_ascii=False) + "\n")
    name = os.path.basename(os.path.normpath(a.out_dir))
    rep = {"input": a.inp, "mode": a.mode, "messages": len(rows), "kept": len(kept), "read_exactly_by_rules": sum(1 for x in verdict.values() if x == "ok"),
           "not_kept_by_cause": dict(causes.most_common()), "rules_verdict": verdict}
    json.dump(rep, open(os.path.join(HERE, f"{name}_check.json"), "w"), indent=1, ensure_ascii=False)
    print(json.dumps({k: v for k, v in rep.items() if k != "rules_verdict"}, indent=1))

if __name__ == "__main__":
    main()
