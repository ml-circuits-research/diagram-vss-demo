#!/usr/bin/env python3
"""make_sample.py: the fixed evaluation data of the composer, rebuilt from the committed annotated messages.

  python3 training/sketch/eval/make_sample.py            writes eval/sample1000/ and eval/goldev/ (default)
  python3 training/sketch/eval/make_sample.py --check DIR   compares eval/sample1000/ with an older copy DIR (byte identity)

eval/sample1000/<folder>/s.jsonl : the 1000 messages whose ids are in training/neural/sample1000_ids.txt, from the 9 folders below, one
                                   s.jsonl per folder (the messages in id order, exactly as annotated). Score all 9 with
                                   PAIR=value SEG=composer node training/sketch/llm_score.mjs training/sketch/eval/sample1000/*
                                   (4858 gold requests). llm_score.mjs and cut_bench.mjs default to this folder.
eval/goldev/<event>/e.jsonl      : per event, the messages of the SAME 9 folders (whole folders, not only the sample, in file order) that
                                   contain a wire of that event, each message with ONLY the wires of that event (id, domain, names, text and
                                   the other fields kept). Score one event with SEG=gold:
                                   MODEL=micro/<world> SEG=gold node training/sketch/llm_score.mjs training/sketch/eval/goldev/<event>
The gold of the new operations (group, ungroup, members, groupOf, doublepos) is built by training/sketch/make_goldev_ops.py from
llm_train/ops_*; run it with OUT_DIR = training/sketch/eval/goldev_ops.
"""
import glob, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SK = os.path.dirname(HERE)
IDS = os.path.join(os.path.dirname(SK), "neural", "sample1000_ids.txt")
# sample folder name -> (folder under training/sketch/, file pattern)
FOLDERS = {   # in the order of the training data (front.py TRAIN_DIRS): the order of the gold files
    "train_sonnet_msg": ("llm_train/sonnet_msg", "msg_*.jsonl"),
    "train_haiku_msg": ("llm_train/haiku_msg", "msg_*.jsonl"),
    "train_sonnet_msg2": ("llm_train/sonnet_msg2", "msg_*.jsonl"),
    "train_haiku_msg2": ("llm_train/haiku_msg2", "msg_*.jsonl"),
    "train_sonnet_long": ("llm_train/sonnet_long", "msg_*.jsonl"),
    "bench_fresh1_sonnet": ("llm_bench/fresh1/sonnet", "batch_*.jsonl"),
    "bench_fresh1_haiku": ("llm_bench/fresh1/haiku", "batch_*.jsonl"),
    "bench_sonnet_spans": ("llm_bench/sonnet_spans", "batch_*.jsonl"),
    "bench_haiku_spans": ("llm_bench/haiku_spans", "batch_*.jsonl"),
}


def event(w):   # same rule as train_cutter.py event()
    a = w["args"]
    if w["type"] == "command": return a["action"]
    if w["type"] == "question": return "list" if a.get("ask") == "rules" else a.get("ask")
    return w["type"]


def read(folder, pat):
    return [l for f in sorted(glob.glob(os.path.join(SK, folder, pat))) for l in open(f, encoding="utf8").read().split("\n") if l.strip()]


def main():
    ids = {l.strip() for l in open(IDS) if l.strip()}
    out = os.path.join(HERE, "sample1000"); gold = {}
    nmsg = 0
    for name, (folder, pat) in FOLDERS.items():
        lines = read(folder, pat); rows = [(json.loads(l), l) for l in lines]
        for m, _ in rows:
            for e in dict.fromkeys(event(w) for w in m["wires"]):
                gold.setdefault(e, []).append(dict(m, wires=[w for w in m["wires"] if event(w) == e]))
            ws = [w for w in m["wires"] if event(w) == "property" and w["args"].get("property") == "color"]
            if ws: gold.setdefault("property_color", []).append(dict(m, wires=ws))   # the "what color is X" questions alone
        pick = sorted((r for r in rows if r[0]["id"] in ids), key=lambda r: r[0]["id"])
        os.makedirs(os.path.join(out, name), exist_ok=True)
        with open(os.path.join(out, name, "s.jsonl"), "w", encoding="utf8") as f:
            for _, l in pick: f.write(l + "\n")
        nmsg += len(pick); print(f"{name}: {len(pick)} messages")
    print(f"sample: {nmsg} of {len(ids)} ids")
    g = os.path.join(HERE, "goldev")
    for e, rows in sorted(gold.items()):
        os.makedirs(os.path.join(g, e), exist_ok=True)
        with open(os.path.join(g, e, "e.jsonl"), "w", encoding="utf8") as f:
            for r in rows: f.write(json.dumps(r) + "\n")
    print(f"goldev: {len(gold)} events, {sum(len(r) for r in gold.values())} messages")


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--check":
        bad = 0
        for name in FOLDERS:
            a, b = os.path.join(HERE, "sample1000", name, "s.jsonl"), os.path.join(sys.argv[2], name, "s.jsonl")
            same = open(a, "rb").read() == open(b, "rb").read(); bad += not same; print(("identical  " if same else "DIFFERENT  ") + name)
        sys.exit(1 if bad else 0)
    main()
