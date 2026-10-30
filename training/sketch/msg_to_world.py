"""msg_to_world.py: the VSS world `real` (worlds/real) built ONLY from the legend and the realistic training messages
(llm_train/*_msg/msg_*.jsonl), as VSS_READER_SPEC.md section 2 says. No templates, no hand-written kind list.

- One training row per gold wire: its `span` (normalized), its event, and its roles located in the span (llm_to_world.convert, soft
  mode: a role whose words are not in the span is left out and counted; no row is dropped for that).
- `$new` resolves to the name created earlier in the same message (or a pronoun in the span).
- Kinds, learned: a legend VALUE token -> the kind of its legend question (SHAPE, COLOR, REL, ...); an event's verb token -> VERB;
  every other token seen at least --freq times in the training spans -> a kind of its own (function words: the, to, of, and, it, ...);
  all other words -> no lexicon entry, i.e. the reader's kind `unknown` (the same kind unseen words get).
- Rows are dropped only when they cannot be trained at all (no verb and no role: a zero target); they are counted.
Writes worlds/real/{legend.json, kinds.tsv, world.json, split_hints.json, examples/train.sop}, llm_train/REAL_WORLD.md, and
real_lexicon.json (the lexicon the normalizer uses for this world). Run: python3 msg_to_world.py [--freq 8]"""
import argparse, collections, datetime, glob, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import generate as G
from llm_to_world import convert, Skip
from normalize import normalize

VALUE_KINDS = {"SHAPE", "EDGE", "COLOR", "SIZE", "STYLE", "ARROW", "REL", "REGION", "DIR", "LAYOUT", "AXIS", "PAIR", "NOTCOLOR", "DEPTH", "RECENT", "SUPER"}


def legend_kinds():
    """the kinds the legend itself determines: its value tokens (by question) and its events' verb tokens"""
    k = {w: c for w, c in G.KINDS.items() if c in VALUE_KINDS}
    for vs in G.EVENTS.values():
        for v in vs: k[v] = "VERB"
    return k


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--freq", type=int, default=8); ap.add_argument("--out", default=os.path.join(HERE, "worlds", "real"))
    a = ap.parse_args()
    msgs = [json.loads(l) for f in sorted(glob.glob(os.path.join(HERE, "llm_train", "*_msg", "msg_*.jsonl"))) for l in open(f) if l.strip()]
    base = legend_kinds()
    # pass 1: normalize every span with the legend-only lexicon and count tokens
    items = []
    for m in msgs:
        created = []
        for w in m["wires"]:
            row = {"text": w.get("span") or m["text"], "names": m.get("names") or [], "created": list(created), "wire": {"type": w["type"], "args": w["args"]}}
            items.append((m, w, row))
            if w["type"] == "command" and w["args"].get("action") == "create" and w["args"].get("name"): created.append(w["args"]["name"])
    cnt = collections.Counter()
    for m, w, row in items:
        toks, _ = normalize(row["text"], set(base), list(row["names"]) + row["created"])
        cnt.update(t for t in toks if not t.startswith(("n_", "t_")) and not t.isdigit())
    kinds = dict(base)
    for t, c in cnt.items():
        if c >= a.freq and t not in kinds: kinds[t] = t
    lexicon = set(kinds)
    # pass 2: rows
    rows, lost_why, dropped, by_ev = [], collections.Counter(), collections.Counter(), collections.Counter()
    for m, w, row in items:
        lost = []
        try: text, roles, ev = convert(row, lexicon, soft=True, lost=lost)
        except Skip as e: dropped[str(e).split(":")[0]] += 1; continue
        has_verb = bool(set(G.EVENTS[ev]) & set(text.split()))
        if not has_verb and not roles: dropped["no verb and no role (zero target)"] += 1; continue
        for x in lost: lost_why[x.split(" ")[0] if not x.startswith("verb of") else "verb not found"] += 1
        rows.append((ev, text, roles, m["id"])); by_ev[ev] += 1
    # the world
    out = a.out
    for d in ("examples", "raw", "audit", "model", "runs", "versions", "requests"): os.makedirs(os.path.join(out, d), exist_ok=True)
    roles_of = collections.defaultdict(set)
    for ev, _, roles, _ in rows: roles_of[ev] |= set(roles)
    legend = {"version": 1, "roles": [{"id": r, "question": q} for r, q in G.ROLES],
              "events": [{"id": e, "verbs": vs, "roles": [r for r, _ in G.ROLES if r in roles_of[e]], "required": []} for e, vs in G.EVENTS.items()],
              "operators": ["not"], "moods": ["command"], "kinds": {"source": "lexicon", "lexicon": "kinds.tsv"},
              "values": [{"kind": "NUM", "pattern": "\\d+"}, {"kind": "NAME", "pattern": "n_[a-z0-9_]+"}, {"kind": "TEXT", "pattern": "t_[a-z0-9_]+"}],
              "reader": {"predicate_role": True, "occupancy_marker": True, "definite_dets": ["the"],
                         "gates_given": {"open": [g for g in ["to", "from", "of", "in", "on", "at", "by", "with", "into", "as", "and", ",", "named", "labeled"] if g in kinds], "closed": []}}}
    lp = os.path.join(out, "legend.json"); json.dump(legend, open(lp, "w"), indent=1); sha = G.sha256_file(lp)
    with open(os.path.join(out, "kinds.tsv"), "w") as fh:
        fh.write("# word\tkind: LEARNED by training/sketch/msg_to_world.py (legend values -> their question's kind, event verbs -> VERB, "
                 f"tokens seen >= {a.freq} times in the training spans -> own kind; everything else unknown)\n")
        for w in sorted(kinds): fh.write(f"{w}\t{kinds[w]}\n")
    json.dump({"name": "real", "language": "en", "description": "SOP Sketchpad legend, world built from realistic LLM-written messages", "created": datetime.date.today().isoformat(),
               "version": 1, "min_examples": 500, "max_versions_per_run": 3, "second_look_escalate": 0.05, "second_look_retrain": 0.05}, open(os.path.join(out, "world.json"), "w"), indent=1)
    json.dump({"heldout_sentence_share": 0.1, "new_identities": "none: realistic messages, names are not controlled",
               "heldout_formulations": "none: realistic messages, no templates; the test sets are llm_bench/* (never read here)", "file_splits": {}, "template_splits": {}},
              open(os.path.join(out, "split_hints.json"), "w"), indent=1)
    doc = G.soplang.Doc(directives=[("world", "real", None), ("legend", sha, None), ("generated", "training/sketch/msg_to_world.py from llm_train/*_msg", None)]); k = 0
    for ev, text, roles, mid in rows:
        ids = iter(f"w{k + i}" for i in range(1, 100)); ws = G.wires_for(ev, roles, text, f"msg.{mid[:2]}", ids, world="real", source="llm")
        k += len(ws); doc.wires += ws
    open(os.path.join(out, "examples", "train.sop"), "w").write(G.soplang.write(doc))
    open(os.path.join(out, "raw", "sentences.txt"), "w").write("\n".join(r[1] for r in rows) + "\n")
    if not os.path.exists(os.path.join(out, "status.json")): json.dump({"label": None, "note": "never trained"}, open(os.path.join(out, "status.json"), "w"))
    json.dump(sorted(lexicon), open(os.path.join(HERE, "real_lexicon.json"), "w"))
    kc = collections.Counter(kinds.values())
    rep = [f"# World `real`: built from {len(msgs)} training messages ({len(items)} gold wires)", "",
           f"Rows: {len(rows)}. Dropped (cannot be trained): {sum(dropped.values())} {dict(dropped)}.", "",
           f"Kinds: {len(kc)} (legend value kinds {len([c for c in kc if c in VALUE_KINDS])}, VERB 1, own-kind frequent tokens {len([c for c in kc if c not in VALUE_KINDS and c != 'VERB'])}, freq >= {a.freq}); lexicon {len(lexicon)} words.", "",
           "Own-kind tokens: " + ", ".join(sorted(t for t, c in kinds.items() if c == t)), "",
           "Roles left out because their words are not in the span (rows kept):", "", "| what | n |", "|---|---|"] + \
          [f"| {x} | {n} |" for x, n in lost_why.most_common()] + ["", "| event | rows |", "|---|---|"] + [f"| {e} | {n} |" for e, n in by_ev.most_common()]
    open(os.path.join(HERE, "llm_train", "REAL_WORLD.md"), "w").write("\n".join(rep) + "\n")
    print("\n".join(rep[:7]))


if __name__ == "__main__":
    main()
