"""
decode_stats.py — the decode data LEARNED from a world's training frames, for two decode switches (training/sketch/DECODE.md):

  excl_pairs     per event, the pairs of its legend roles that (1) share a candidate kind (the schema's head_kinds / kinds), (2) are each
                 given in >= 5 training frames of that event, and (3) are given TOGETHER in 0 training frames of that event
                 (the rule of diagnosis_capacity/excl_pairs.py, CAPACITY.md section 2.2, unchanged). Used by the readers' switch EXCL
                 (infer.Reader excl_pairs / docs/js/vss/reader.js opts.excl): of such a pair read together, only the role with the
                 larger presence / threshold ratio is kept.
  roleless_ok    the events of which at least 5% of the training frames fill no role (a request with that event and no filler is a
                 request seen in training). Used by the cut switch Q1b (docs/js/vss-centers.js opts.roleless).

The training frames are the rows the trainer trained on: split `train` of the run's splits.json (or, without it, every row of
examples/train.sop), shape ok, not negative; frames as train.load_rows reads them. Nothing is written into the model's files: the output
is a separate decode.json next to them (an export-web folder keeps its manifest hashes).
Usage: python3 -m sop.decode_stats --world <world dir> [--splits <run dir>/splits.json] [--schema <export-web dir>/model.json] --out <file>
"""
import argparse, collections, itertools, json, os, sys

MIN_ROWS = 5            # (2) above: each role of a pair given in >= 5 training frames of the event (CAPACITY.md's rule, not chosen here)
ROLELESS_SHARE = 0.05   # roleless_ok: >= 5% of the event's training frames fill no role (stated once, DECODE.md; not tuned)


def stats(world_dir, splits_path=None, schema=None):
    from .legend import Legend
    from . import train
    legend = Legend(os.path.join(world_dir, "legend.json"))
    rows, errors, _ = train.load_rows(world_dir, legend)
    if errors: raise SystemExit("decode_stats: the world's examples do not check:\n" + "\n".join(errors[:10]))
    if splits_path:
        sp = json.load(open(splits_path)); keep = set(sp["rows"]["train"]); texts = sp["texts"]["train"]
        tr = [r for r in rows if r["id"] in keep]
        if sorted(r["text"] for r in tr) != sorted(texts): raise SystemExit("decode_stats: the world's train rows differ from the run's splits.json")
    else: tr = [r for r in rows if r["file"] == os.path.join("examples", "train.sop")]
    tr = [r for r in tr if r["frame"]["shape"] != "unknown" and not r["negative"]]
    if schema is None: schema = train.build_schema(tr, legend)
    sch = schema["roles"]; ev_roles = legend.event_roles
    one, co, n_ev, n_none = collections.Counter(), collections.Counter(), collections.Counter(), collections.Counter()
    for r in tr:
        e = r["frame"]["event"]; ks = sorted(k for k in r["frame"]["roles"] if k in sch)
        n_ev[e] += 1; n_none[e] += not ks
        for k in ks: one[(e, k)] += 1
        for a, b in itertools.combinations(ks, 2): co[(e, a, b)] += 1
    kinds = lambda r: set(sch[r].get("head_kinds") or sch[r].get("kinds") or []) if r in sch else set()
    excl = {}
    for e in sorted(legend.events):
        for a, b in itertools.combinations(sorted(ev_roles.get(e) or []), 2):
            if kinds(a) & kinds(b) and one[(e, a)] >= MIN_ROWS and one[(e, b)] >= MIN_ROWS and co[(e, a, b)] == 0: excl.setdefault(e, []).append([a, b])
    share = {e: (n_none[e] / n_ev[e] if n_ev[e] else None) for e in sorted(legend.events)}
    return {"legend_sha256": legend.sha, "training_rows": len(tr),
            "rule": {"excl_pairs": f"two legend roles of one event sharing a candidate kind, each given in >= {MIN_ROWS} training frames of the "
                                   "event, given together in 0 of them",
                     "roleless_ok": f"events whose training frames fill no role in >= {ROLELESS_SHARE:.0%} of their rows"},
            "excl_pairs": excl,
            "roleless_ok": sorted(e for e, s in share.items() if s is not None and s >= ROLELESS_SHARE),
            "event_rows": {e: n_ev[e] for e in sorted(legend.events)}, "event_rows_no_role": {e: n_none[e] for e in sorted(legend.events)}}


def main(argv=None):
    ap = argparse.ArgumentParser(prog="decode_stats"); ap.add_argument("--world", required=True); ap.add_argument("--splits")
    ap.add_argument("--schema", help="an export-web model.json: its stored schema (the model's own candidate kinds) instead of rebuilding it")
    ap.add_argument("--out", required=True); a = ap.parse_args(argv)
    schema = json.load(open(a.schema))["schema"] if a.schema else None
    out = stats(a.world, a.splits, schema)
    if a.schema:
        m = json.load(open(a.schema))
        if m["legend_sha256"] != out["legend_sha256"]: raise SystemExit("decode_stats: the world's legend differs from the model's")
    with open(a.out, "w") as f: json.dump(out, f, indent=1)
    print(f"decode_stats: {out['training_rows']} training rows -> {a.out}; excl_pairs {out['excl_pairs']}; roleless_ok {out['roleless_ok']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
