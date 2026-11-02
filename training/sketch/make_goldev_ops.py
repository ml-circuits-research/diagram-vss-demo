#!/usr/bin/env python3
"""make_goldev_ops.py: per-event gold folders for the new operations (ROUND2.md section 6.D), in the format of planB7/goldev/<event>/e.jsonl:
the messages of the ops folders that contain a wire of that event, each message with ONLY the wires of that event (all other fields kept:
id, domain, names, groups, text). Messages are read from llm_train/ops_groups and llm_train/ops_positions (msg_*.jsonl), in file order.
  python3 training/sketch/make_goldev_ops.py OUT_DIR
writes OUT_DIR/{group,ungroup,members,groupOf}/e.jsonl and OUT_DIR/doublepos/e.jsonl (wires of any event whose args carry position2, or a
region together with a position: the "two relations" and "region + relation" requests; the gold of each of its parts is position, anchor,
position2, anchor2, region). Score: MODEL=micro/<world>r2 SEG=gold node training/sketch/llm_score.mjs OUT_DIR/<event>
(group / ungroup: manage7r2; members / groupOf: questions7r2; doublepos: the world of each wire's event, one run per world).
  --by-event also writes OUT_DIR/doublepos_<event>/e.jsonl, one per event (so that each run has only the wires its world holds).
Also counts: the requests per event and the key values (TRAIN_MSG_SPEC coverage rule: each at least 40 requests).
"""
import collections, glob, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
DIRS = ["ops_groups", "ops_positions"]
NEW = ["group", "ungroup", "members", "groupOf"]


def event(w):   # same rule as train_cutter.py event()
    a = w["args"]
    if w["type"] == "command": return a["action"]
    if w["type"] == "question": return "list" if a.get("ask") == "rules" else a.get("ask")
    return w["type"]


def double(w):
    a = w["args"]
    return bool(a.get("position2")) or bool(a.get("region") and (a.get("position") or a.get("relation")))


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    if len(args) != 1: raise SystemExit(__doc__)
    out = args[0]; by_event = "--by-event" in sys.argv
    files = sorted(f for d in DIRS for f in glob.glob(os.path.join(HERE, "llm_train", d, "msg_*.jsonl")))
    msgs = [json.loads(l) for f in files for l in open(f) if l.strip()]
    sets = {e: [] for e in NEW}; sets["doublepos"] = []; per_ev = collections.defaultdict(list)
    for m in msgs:
        for e in NEW:
            ws = [w for w in m["wires"] if event(w) == e]
            if ws: sets[e].append(dict(m, wires=ws))
        ws = [w for w in m["wires"] if double(w)]
        if ws:
            sets["doublepos"].append(dict(m, wires=ws))
            for ev in sorted({event(w) for w in ws}): per_ev["doublepos_" + ev].append(dict(m, wires=[w for w in ws if event(w) == ev]))
    if by_event: sets.update(per_ev)
    for name, rows in sets.items():
        os.makedirs(os.path.join(out, name), exist_ok=True)
        with open(os.path.join(out, name, "e.jsonl"), "w") as f:
            for r in rows: f.write(json.dumps(r, ensure_ascii=False) + "\n")
        print(f"{name}: {len(rows)} messages, {sum(len(r['wires']) for r in rows)} requests")
    print(f"from {len(msgs)} messages of {len(files)} files ({', '.join(DIRS)})")
    pos = collections.Counter(w["args"].get(k) for m in msgs for w in m["wires"] if double(w) for k in ("position", "position2", "region") if w["args"].get(k))
    print("double-position values:", dict(pos.most_common()))


main()
