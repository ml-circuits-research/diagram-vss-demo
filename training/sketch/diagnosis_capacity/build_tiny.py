"""build_tiny.py <name> <selector>: a tiny controlled world made of the fix_p80_s0 TRAINING rows of one pattern only (the same rows, tokens,
gold frames, legend and kinds as the full world: frames.py rebuilt them exactly, checked against splits.json), written to
capacity/tiny/<name>/ (legend.json, kinds.tsv, world.json, split_hints.json, examples/train.sop). No calibration file: the thresholds
are then fitted on the training rows themselves (in-sample), which is what a capacity test needs ("is there any reading that fits").
Selectors: connect = every connect row; isverb = every row whose tokens hold the fact verb `is` (the two-verb competition and its
controls); noown = every row without an own-kind word (a kind of one word); lists = every row with a set role plus the plain one-to-one connect rows."""
import json, os, sys
REPO = "/home/claude/diagram-vss-demo/"; sys.path.insert(0, REPO + "training/sketch")
import generate as G
HERE = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/capacity/"
M = json.load(open(REPO + "docs/model/fix_p80_s0/model.json"))
PERKIND = {}
for _w, _e in M["catalog"]["words"].items(): PERKIND[_e["kind"]] = PERKIND.get(_e["kind"], 0) + 1
def OWN(t):
    """a token of a kind that holds exactly one catalog word (the only tokens whose address can carry their own star)"""
    k = M["catalog"]["words"].get(t, {}).get("kind")
    return k is not None and k not in ("unknown", "VERB", "NAME") and PERKIND.get(k, 0) <= 1
def STRUCT(r): return "+".join(k for k in ("source", "target", "object", "members", "targets") if k in r["roles"])
SEL = {
    "connect": lambda r: r["ev"] == "connect",
    "isverb": lambda r: "is" in r["tokens"],
    "noown": lambda r: not any(OWN(t) for t in r["tokens"]),
    # the small worlds actually trained (a few minutes each): one structure family each, with its nearest controls
    "lists_s": lambda r: r["ev"] == "connect" and not [x for x in r["lost"] if not x.startswith("verb of")] and STRUCT(r) in ("source+targets", "target+members", "source+target", "members"),
    "isverb_s": lambda r: "is" in r["tokens"] and r["ev"] in ("path", "connected", "extreme", "fact") and not [x for x in r["lost"] if not x.startswith("verb of")],
    "lists": lambda r: any(k in ("members", "targets") for k in r["roles"]) or (r["ev"] == "connect" and "source" in r["roles"] and "target" in r["roles"]),
}


def main(name, sel, max_rows=0):
    rows = [json.loads(l) for l in open(HERE + "fit_frames.jsonl")]
    rows = [r for r in rows if r["split"] == "train" and SEL[sel](r)]
    if max_rows and len(rows) > max_rows:      # a deterministic sample that keeps every row of the rarest structures first
        by = {}
        for r in rows: by.setdefault((r["ev"], STRUCT(r)), []).append(r)
        keep, groups = [], sorted(by.values(), key=len)
        for i, g in enumerate(groups):
            room = (max_rows - len(keep)) // (len(groups) - i); keep += g[:room]
        rows = keep
    out = HERE + f"tiny/{name}/"
    for d in ("examples", "model", "runs"): os.makedirs(out + d, exist_ok=True)
    leg = json.loads(json.dumps(M["legend"]))
    if os.environ.get("MARKER") == "0": leg["reader"]["occupancy_marker"] = False     # the variant tested: presence read from the candidate's deposit
    lp = out + "legend.json"; json.dump(leg, open(lp, "w"), indent=1); sha = G.sha256_file(lp)
    with open(out + "kinds.tsv", "w") as fh:
        fh.write("# word\tkind: copied from docs/model/fix_p80_s0 (the full world's learned kinds)\n")
        for w in sorted(M["lexicon"]): fh.write(f"{w}\t{M['lexicon'][w]['kind']}\n")
    json.dump({"name": name, "language": "en", "description": f"capacity test: fix_p80_s0 training rows, selector {sel}", "created": "2026-10-31", "version": 1,
               "min_examples": 1, "max_versions_per_run": 3, "second_look_escalate": 0.05, "second_look_retrain": 0.05}, open(out + "world.json", "w"), indent=1)
    json.dump({"heldout_sentence_share": 0.0, "new_identities": "none", "file_splits": {}, "template_splits": {}, "protocol": "capacity test: train only"},
              open(out + "split_hints.json", "w"), indent=1)
    doc = G.soplang.Doc(directives=[("world", name, None), ("legend", sha, None), ("generated", "capacity/build_tiny.py", None)]); k = 0
    for r in rows:
        ids = iter(f"w{k + i}" for i in range(1, 100)); ws = G.wires_for(r["ev"], r["roles"], " ".join(r["tokens"]), f"msg.{r['id'][:2]}", ids, world=name, source="llm")
        k += len(ws); doc.wires += ws
    open(out + "examples/train.sop", "w").write(G.soplang.write(doc))
    json.dump([{"id": r["id"], "wi": r["wi"]} for r in rows], open(out + "rows.json", "w"))
    print(name, sel, len(rows), "rows; legend", sha)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 0)
