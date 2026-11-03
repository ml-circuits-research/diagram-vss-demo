#!/usr/bin/env python3
"""data_repetition.py: how repetitive is each training folder? (round 2, TRAIN_PLAN_R2.md section 7; owner 2026-11-03: "many current problems
come from poor, repetitive data"). Read-only unless --apply.

Frames. A message's FRAME is its text lower-cased with the parts that are mechanical tokens for every reader abstracted: the names (the
message's canvas names, the names its wires create, and every capitalised word that does not start a sentence) -> N, quoted texts -> Q, digits
-> #. Value words (colours, shapes, sizes ...) stay: "make N red" and "make N blue" are different frames, because the value words are
what the readers learn. A span's frame is the same for one request span.
Per folder it reports:
  messages, requests;
  distinct frames / messages (1.0 = no two messages share a frame);
  the most frequent message frame and its count; the share of messages whose frame occurs more than K times (K = --keep, default 2);
  span frames: distinct / requests, and the most frequent first three words of a span frame ("then add a") with its count and its share
  of the requests.
The rule applied with --apply (K = --keep, default 2): inside one folder, messages are visited in the order of sha256(id); a message is
DROPPED when every one of its request spans has a span frame that K kept messages already carry, and kept otherwise (a message with no span
is kept). So each request formulation is kept at least K times with different names / numbers / texts, a message that brings at least one
formulation not yet seen K times is kept whole, and only the copies that differ from kept ones in mechanical tokens alone are dropped. Long
realistic messages are almost never dropped (some of their spans are new); single-request synthetic messages are thinned. n-gram habits
inside different messages ("then add a") are reported only.
  python3 training/sketch/data_repetition.py [--keep 2] [--json out.json] [--apply SUFFIX] <folder> ...
  --apply SUFFIX: writes each folder's kept messages to <folder>SUFFIX/msg_NN.jsonl (1000 per file, the original file order), with
  DEDUP.json (the rule, the counts, the dropped ids). Folders are relative to training/sketch."""
import argparse, collections, glob, hashlib, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
TOK = re.compile(r"\"[^\"]*\"|“[^”]*”|(?<![A-Za-z0-9])'[^']+'(?![A-Za-z0-9])|[A-Za-z0-9_][A-Za-z0-9_'’-]*|[.,!?;:→>-]")


def load(d):
    p = d if os.path.isabs(d) else os.path.join(HERE, d)
    files = sorted(f for pat in ("msg_*.jsonl", "batch_*.jsonl") for f in glob.glob(os.path.join(p, pat)))
    return [(os.path.basename(f), json.loads(l)) for f in files for l in open(f) if l.strip()]


def frame(text, names):
    known = {str(n).lower() for n in names}; out = []
    for i, m in enumerate(TOK.finditer(text)):
        t = m.group(0)
        if t[0] in "\"“'" and len(t) > 1: out.append("Q"); continue
        if t.isdigit() or re.fullmatch(r"\d+[a-z]*", t): out.append("#"); continue
        start = not out or out[-1] in (".", "!", "?")
        low = t.lower().replace("’", "'")
        if low in known or (t[:1].isupper() and not start and t not in ("I", "A")): out.append("N"); continue
        out.append(low)
    return " ".join(out)


def names_of(m):
    return list(m.get("names") or []) + [w["args"]["name"] for w in m.get("wires", []) if isinstance(w.get("args", {}).get("name"), str)]


def measure(rows, K):
    msgs = [m for _, m in rows]
    fr = [frame(m["text"], names_of(m)) for m in msgs]
    c = collections.Counter(fr)
    spans = [frame(w["span"], names_of(m)) for m in msgs for w in m.get("wires", []) if w.get("span")]
    sc = collections.Counter(spans)
    tri = collections.Counter(" ".join(s.split()[:3]) for s in spans if len(s.split()) >= 3)
    top, n = (c.most_common(1) or [("", 0)])[0]
    t3, n3 = (tri.most_common(1) or [("", 0)])[0]
    return {"messages": len(msgs), "requests": len(spans), "distinct_frames": round(len(c) / max(1, len(msgs)), 3),
            "top_frame": top[:80], "top_frame_n": n, f"share_in_frames_over_{K}": round(sum(v for v in c.values() if v > K) / max(1, len(msgs)), 3),
            "distinct_span_frames": round(len(sc) / max(1, len(spans)), 3), "top_span_start": t3, "top_span_start_n": n3,
            "top_span_start_share": round(n3 / max(1, len(spans)), 3)}


def dedup(rows, K):
    order = sorted(range(len(rows)), key=lambda i: hashlib.sha256(rows[i][1]["id"].encode()).hexdigest())
    seen, keep = collections.Counter(), set()
    for i in order:
        m = rows[i][1]; fs = [frame(w["span"], names_of(m)) for w in m.get("wires", []) if w.get("span")]
        if not fs or any(seen[f] < K for f in fs): seen.update(fs); keep.add(i)
    return [rows[i] for i in range(len(rows)) if i in keep], [rows[i][1]["id"] for i in range(len(rows)) if i not in keep]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("folders", nargs="+"); ap.add_argument("--keep", type=int, default=2); ap.add_argument("--json"); ap.add_argument("--apply")
    a = ap.parse_args(); K = a.keep; res = {}
    print(f"| folder | messages | requests | distinct frames / messages | top frame (n) | messages in frames > {K} | distinct span frames / requests | top span start (n, share) | after dedup (K={K}) |")
    print("|---|---|---|---|---|---|---|---|---|")
    for d in a.folders:
        rows = load(d)
        if not rows: print(f"| {d} | (no msg_*/batch_* files) |"); continue
        r = measure(rows, K); kept, dropped = dedup(rows, K); r2 = measure(kept, K)
        res[d] = {"before": r, "after": r2, "dropped": len(dropped)}
        print(f"| {d} | {r['messages']} | {r['requests']} | {r['distinct_frames']:.3f} | `{r['top_frame'][:50]}` ({r['top_frame_n']}) | {100 * r[f'share_in_frames_over_{K}']:.1f}% | "
              f"{r['distinct_span_frames']:.3f} | `{r['top_span_start']}` ({r['top_span_start_n']}, {100 * r['top_span_start_share']:.1f}%) | "
              f"{r2['messages']} msgs ({len(dropped)} dropped), {r2['requests']} requests, span frames {r2['distinct_span_frames']:.3f}, top span start {r2['top_span_start_n']} |")
        if a.apply:
            out = os.path.join(HERE, d.rstrip("/") + a.apply); os.makedirs(out, exist_ok=True)
            for f in glob.glob(os.path.join(out, "msg_*.jsonl")): os.remove(f)
            for k in range(0, len(kept), 1000):
                open(os.path.join(out, f"msg_{k // 1000 + 1:02d}.jsonl"), "w").write("".join(json.dumps(m, ensure_ascii=False) + "\n" for _, m in kept[k:k + 1000]))
            json.dump({"source": d, "rule": f"span-frame dedup, K={K}: a message is dropped when every one of its request spans has a frame that {K} kept messages already carry (training/sketch/data_repetition.py)", "messages": len(rows), "kept": len(kept),
                       "dropped_ids": dropped, "before": r, "after": r2}, open(os.path.join(out, "DEDUP.json"), "w"), indent=1)
    if a.json: json.dump({"K": K, "folders": res}, open(a.json, "w"), indent=1)


if __name__ == "__main__":
    main()
