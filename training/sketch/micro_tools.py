"""micro_tools.py: helpers of the micro-world loop (skills/vss-microworlds/SKILL.md). Written from the scratch scripts of round 1
(MICRO_ROUND1.md), so the next round does not rebuild them.

  python3 micro_tools.py gold <world> [--out DIR]        the annotated messages that hold a request of the world's events, with only
                                                          those wires (DIR/all.jsonl; default worlds_micro_gold/<world>). The world's
                                                          events are read from docs/model/micro/<world>/BUILD.json.
  python3 micro_tools.py registry <w1,w2,...> --out F   a scratch registry (docs/model/micro/registry.json with only these worlds,
                                                          in this order; the first world wins a tie). Optional --cutter micro/<file>.
  python3 micro_tools.py dirs                           the data folders with spans, one per line (for llm_score.mjs).

ROW_SHAPE worlds (connect_single / connect_lists / connect_chain) are filtered with msg_to_world.shape_is as in their build."""
import argparse, glob, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
# Every annotated folder whose wires carry spans (the same list as train_cutter.py plus the spans sets).
DIRS = ["llm_train/sonnet_msg", "llm_train/haiku_msg", "llm_train/sonnet_msg2", "llm_train/haiku_msg2", "llm_train/sonnet_long",
        "llm_bench/fresh1/sonnet", "llm_bench/fresh1/haiku", "llm_bench/sonnet_spans", "llm_bench/haiku_spans"]


def event(w):
    a = w["args"]
    if w["type"] == "command": return a["action"]
    if w["type"] == "question": return "list" if a.get("ask") == "rules" else a.get("ask")
    return w["type"]


def build(world):
    return json.load(open(os.path.join(REPO, "docs", "model", "micro", world, "BUILD.json")))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("cmd", choices=["gold", "registry", "dirs"]); ap.add_argument("arg", nargs="?")
    ap.add_argument("--out"); ap.add_argument("--cutter"); a = ap.parse_args()
    if a.cmd == "dirs":
        print("\n".join(os.path.join(HERE, d) for d in DIRS)); return
    if a.cmd == "gold":
        B = build(a.arg); E = set(B["events"].split(",")); shape = B.get("ROW_SHAPE") or ""
        if not shape and a.arg.split("_", 1)[-1] in ("single", "lists", "chain") and a.arg.startswith("connect_"): shape = a.arg.split("_", 1)[1]   # round-1 split worlds (BUILD.json without ROW_SHAPE)
        sys.path.insert(0, HERE); import msg_to_world as MW
        out = a.out or os.path.join(HERE, "worlds_micro_gold", a.arg); os.makedirs(out, exist_ok=True); n = k = 0
        with open(os.path.join(out, "all.jsonl"), "w") as fo:
            for d in DIRS:
                for f in sorted(glob.glob(os.path.join(HERE, d, "msg_*.jsonl")) + glob.glob(os.path.join(HERE, d, "batch_*.jsonl"))):
                    for l in open(f):
                        if not l.strip(): continue
                        r = json.loads(l); ws = [w for w in r.get("wires", []) if event(w) in E and (not shape or MW.shape_is(shape, w["args"]))]
                        if ws: fo.write(json.dumps(dict(r, wires=ws)) + "\n"); n += 1; k += len(ws)
        print(f"{a.arg}: {n} messages, {k} requests -> {out}/all.jsonl"); return
    reg = json.load(open(os.path.join(REPO, "docs", "model", "micro", "registry.json")))
    reg["worlds"] = [{"world": w, "events": build(w)["events"].split(","), "model": "micro/" + w} for w in a.arg.split(",") if w]
    if a.cutter: reg["cutter"] = a.cutter
    json.dump(reg, open(a.out, "w"), indent=1); print(f"{len(reg['worlds'])} worlds -> {a.out}")


if __name__ == "__main__":
    main()
