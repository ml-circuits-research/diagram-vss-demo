#!/usr/bin/env python3
"""collect_to_bench.py: a file of collected requests (downloaded from the demo, ⋮ › Settings › Collected requests › Download as JSONL;
format training/sketch/COLLECT_FORMAT.md) -> an un-annotated llm_bench folder, ready for annotation.

  python3 training/sketch/collect_to_bench.py <collected.jsonl> [more.jsonl ...] --out training/sketch/llm_bench/<name>
      [--prefix col] [--via typed,voice] [--dedupe] [--force]

Writes, in the fresh2 / short3 layout (training/sketch/llm_bench/fresh2/README.md):
  texts/texts_01.jsonl      {id, domain, names, text}: the texts, saved before any annotation (AGENTS.md: the annotated texts are checked
                            against this file)
  batch_01.jsonl            {id, domain, names, text, wires: []}: the gold is empty, to be annotated (wires as in short3: span, trigger,
                            type, args)
  context/context_01.jsonl  {id, collected: {...}}: everything else of the entry (time, source with the original words and their language,
                            what the readers read, what VSS-BERT executed or held, the user's later actions). Kept apart so the annotation
                            can be blind to the readers: an annotator opens only texts/ and batch_01.jsonl.
  README.md                 where the messages come from, the counts, and how to annotate.

Options: --via keeps only the entries whose source.via is listed (default: every entry); --dedupe keeps the first of entries with the same
text and the same names; --prefix sets the id prefix (ids <prefix>-0001, ...); --force writes into a folder that already has a batch file.
Entries are taken in file order (oldest first, as the demo writes them); lines that are not valid entries are counted and skipped.
Exit code 0 on success, 1 when nothing could be written.
"""
import argparse, collections, json, os, sys

FORMAT = "sop-collect/1"
READERS = ("rules", "vss", "neural", "combined")


def read_entries(paths):
    """-> (entries, problems): entries in file order; problems: [(path, line number, why)]"""
    out, bad = [], []
    for p in paths:
        with open(p, encoding="utf-8") as f:
            for i, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                try:
                    e = json.loads(line)
                except json.JSONDecodeError as ex:
                    bad.append((p, i, f"not JSON: {ex.msg}")); continue
                why = check_entry(e)
                if why:
                    bad.append((p, i, why)); continue
                out.append(e)
    return out, bad


def check_entry(e):
    """the reason an object is not a collected entry, or None"""
    if not isinstance(e, dict):
        return "not an object"
    if e.get("format") != FORMAT:
        return f"format is {e.get('format')!r}, not {FORMAT!r}"
    if not isinstance(e.get("text"), str) or not e["text"].strip():
        return "no text"
    if not isinstance(e.get("names", []), list):
        return "names is not a list"
    return None


def convert(entries, prefix="col", via=None, dedupe=False):
    """-> (rows, stats): rows = [(text_row, batch_row, context_row)]"""
    stats = collections.Counter()
    seen, rows = set(), []
    for e in entries:
        src = e.get("source") or {}
        v = src.get("via") or "typed"
        if via and v not in via:
            stats["skipped (via)"] += 1; continue
        names = [str(x) for x in e.get("names") or []]
        key = (e["text"].strip(), tuple(names))
        if dedupe and key in seen:
            stats["skipped (duplicate)"] += 1; continue
        seen.add(key)
        rid = f"{prefix}-{len(rows) + 1:04d}"
        domain = e.get("domain") or "collected from the demo"
        text_row = {"id": rid, "domain": domain, "names": names, "text": e["text"]}
        batch_row = dict(text_row, wires=[])
        ctx = {k: e[k] for k in ("id", "time", "session", "turn", "source", "read", "spell", "cut", "tab", "reply", "readings", "events") if k in e}
        rows.append((text_row, batch_row, {"id": rid, "collected": ctx}))
        stats["kept"] += 1
        stats[f"via {v}"] += 1
        if src.get("original"):
            stats[f"original in {src.get('lang') or '?'}"] += 1
        for ev in e.get("events") or []:
            stats[f"event {ev.get('kind')}"] += 1
    return rows, stats


def write(out, rows, stats, sources, bad):
    os.makedirs(os.path.join(out, "texts"), exist_ok=True)
    os.makedirs(os.path.join(out, "context"), exist_ok=True)
    dump = lambda path, objs: open(path, "w", encoding="utf-8").write("".join(json.dumps(o, ensure_ascii=False) + "\n" for o in objs))
    dump(os.path.join(out, "texts", "texts_01.jsonl"), [r[0] for r in rows])
    dump(os.path.join(out, "batch_01.jsonl"), [r[1] for r in rows])
    dump(os.path.join(out, "context", "context_01.jsonl"), [r[2] for r in rows])
    n_held = sum(1 for r in rows if ((r[2]["collected"].get("readings") or {}).get("combined") or {}).get("held"))
    lines = [
        f"# {os.path.basename(os.path.normpath(out))}: requests collected from the demo (un-annotated)",
        "",
        f"Made by `training/sketch/collect_to_bench.py` from {', '.join(f'`{os.path.basename(s)}`' for s in sources)} (format `training/sketch/COLLECT_FORMAT.md`).",
        f"{len(rows)} messages, ids {rows[0][0]['id']} .. {rows[-1][0]['id']}." if rows else "No messages.",
        "",
        "Files",
        "- `texts/texts_01.jsonl`: id, domain, names, text. The texts as the user sent them (in English; for a message that came through voice or",
        "  translation, the English text that was sent). Saved before any annotation: the annotated texts must stay identical to these.",
        "- `batch_01.jsonl`: the same rows with `wires: []`. Write the gold here, as in `../short3/README.md` (span, trigger, type, args; names as",
        "  in `names`, `$new`, `mention(...)`; `pending` with an intent where the SOP Lang form does not exist).",
        "- `context/context_01.jsonl`: per id, the rest of the collected entry: time, source (via, the original words and their language, how",
        "  they were translated), what Rules, VSS, SOP-BERT and VSS-BERT read (SOP Lang and wires), what VSS-BERT executed or held with its",
        "  confidence, and what the user did next (Do it anyway, Edit, superseded, undo right after). **For a blind annotation do not open it**",
        "  before the gold is written; afterwards it is the place to look for the readings that were wrong (a held request done anyway, an",
        "  executed one undone right after).",
        "",
        "Counts",
        "",
    ]
    lines += [f"- {k}: {v}" for k, v in sorted(stats.items())]
    lines += [f"- messages where VSS-BERT held at least one request: {n_held}"]
    if bad:
        lines += ["", f"Skipped lines ({len(bad)}): " + "; ".join(f"{os.path.basename(p)}:{i} {why}" for p, i, why in bad[:20]) + (" ..." if len(bad) > 20 else "")]
    lines += ["", "`names` is the drawing of the VSS-BERT tab before the message (the chat speaks for that tab); a reader whose drawing differed",
              "has its own `names` in the context file."]
    open(os.path.join(out, "README.md"), "w", encoding="utf-8").write("\n".join(lines) + "\n")


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("files", nargs="+")
    ap.add_argument("--out", required=True)
    ap.add_argument("--prefix", default="col")
    ap.add_argument("--via", default="", help="comma list of source.via values to keep (default: all)")
    ap.add_argument("--dedupe", action="store_true")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args(argv)
    if os.path.exists(os.path.join(a.out, "batch_01.jsonl")) and not a.force:
        print(f"{a.out} already has batch_01.jsonl (an annotation may be in it); use --force to overwrite", file=sys.stderr); return 1
    entries, bad = read_entries(a.files)
    via = set(x.strip() for x in a.via.split(",") if x.strip()) or None
    rows, stats = convert(entries, a.prefix, via, a.dedupe)
    if bad:
        stats["skipped (not an entry)"] = len(bad)
    if not rows:
        print("no entries to write" + (f" ({len(bad)} lines skipped: {bad[0][2]} ...)" if bad else ""), file=sys.stderr); return 1
    write(a.out, rows, stats, a.files, bad)
    print(f"wrote {len(rows)} messages to {a.out} (texts/texts_01.jsonl, batch_01.jsonl, context/context_01.jsonl, README.md)"
          + (f"; skipped {len(bad)} lines that are not entries" if bad else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
