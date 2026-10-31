"""train_cutter.py: the CUTTER of the composer (docs/js/vss-composer.js), learned on ALL annotated messages that carry spans.

The cutter is the greedy averaged-perceptron BIO tagger of front.py (`train_segmenter`; JS twin docs/js/front.js `segment`), the same
trainer and the same `seg_epochs` (front_params.json), nothing tuned (CUTTER.md). Only the data differ: every folder whose messages
carry spans, not only the fit split. Since 2026-11-01 (AGENTS.md) every annotated message is data, so the former test set fresh1 is
in the training data too.

Data (relative to training/sketch): llm_train/{sonnet_msg, haiku_msg, sonnet_msg2, haiku_msg2, sonnet_long}/msg_*.jsonl and
llm_bench/fresh1/{sonnet, haiku}/batch_*.jsonl. The folders llm_train/{sonnet, haiku} (one clause per row, field `wire`, no spans) and
llm_bench/{sonnet, haiku} (no spans) cannot teach a cut and are not read.
A message with a gold wire whose span is missing or not found in its text is left out (its request would be labelled O: a wrong label,
not a hard example); the count is printed and stored.

Writes docs/model/micro/cutter.json: {about, command, data, params, segmenter}. The composer reads only `segmenter`.
Run: python3 training/sketch/train_cutter.py [--out docs/model/micro/cutter.json]
"""
import argparse, glob, hashlib, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import front as FR

DIRS = ["llm_train/sonnet_msg", "llm_train/haiku_msg", "llm_train/sonnet_msg2", "llm_train/haiku_msg2", "llm_train/sonnet_long",
        "llm_bench/fresh1/sonnet", "llm_bench/fresh1/haiku"]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--out", default=os.path.join(HERE, "..", "..", "docs", "model", "micro", "cutter.json"))
    a = ap.parse_args()
    P = json.load(open(os.path.join(HERE, "front_params.json")))
    msgs, data = [], []
    for d in DIRS:
        files = sorted(glob.glob(os.path.join(HERE, d, "msg_*.jsonl")) + glob.glob(os.path.join(HERE, d, "batch_*.jsonl")))
        rows = [json.loads(l) for f in files for l in open(f) if l.strip()]
        ok = [m for m in rows if all(w.get("span") and w["span"] in m["text"] for w in m.get("wires", []))]
        h = hashlib.sha256("".join(open(f, "rb").read().hex() for f in files).encode()).hexdigest()[:16]
        data.append({"folder": d, "files": len(files), "messages": len(rows), "used": len(ok), "left_out_missing_span": len(rows) - len(ok), "sha256_16": h})
        msgs += ok
        print(f"{d}: {len(rows)} messages, {len(ok)} used ({len(rows) - len(ok)} with a wire whose span is missing)")
    ntok = sum(len(FR.tokenize(m["text"], m.get("names") or [])[0]) for m in msgs)
    S = FR.train_segmenter(msgs, P["seg_epochs"])
    out = {"about": "cutter.json: the BIO cutter of the composer (front.py train_segmenter, front.js segment), learned on every annotated message with spans",
           "command": "python3 training/sketch/train_cutter.py", "data": data, "messages": len(msgs), "tokens": ntok,
           "params": {"seg_epochs": P["seg_epochs"]}, "segmenter": dict(sorted(S.items()))}
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    json.dump(out, open(a.out, "w"))
    print(f"{len(msgs)} messages, {ntok} tokens, {len(S)} weights -> {os.path.abspath(a.out)}")


if __name__ == "__main__":
    main()
