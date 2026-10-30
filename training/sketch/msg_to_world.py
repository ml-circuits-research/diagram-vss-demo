"""msg_to_world.py: the VSS world `real` (worlds/real), built ONLY from the legend and the annotated training messages
(llm_train/*_msg/msg_*.jsonl), VSS_READER_SPEC.md section 2. No templates, no hand-written word lists.

- The front end (front.py) is LEARNED from the same messages: segmenter, value n-grams, trigger rules (thresholds: front_params.json,
  chosen on held-out training messages by select_front.py). It is written to worlds/real/front.json and exported with the model.
- One training row per gold wire: its span normalized by the learned front end, its event, and its roles located in the span
  (llm_to_world.convert, soft: a role whose words are not in the span is left out and counted; no row is dropped for that).
  `$new` resolves to the name created earlier in the same message (or a pronoun in the span). Lists of shapes fill the set roles
  `members` / `targets`.
- Kinds: a legend value token -> the kind of its legend question (front.value_kinds); an event token -> VERB; every other token seen at
  least --freq times in the training spans -> a kind of its own; all other words -> no entry (the reader's kind `unknown`).
- Rows are dropped only when they cannot be trained at all (no event token and no role: a zero target); they are counted.
Writes worlds/real/{legend.json, kinds.tsv, world.json, split_hints.json, front.json, examples/train.sop} and llm_train/REAL_WORLD.md.
Run: python3 msg_to_world.py [--frac 0.8] [--freq 8]"""
import argparse, collections, datetime, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import generate as G
import front as FR
from llm_to_world import convert, Skip

CAL_SHARE = 0.08
ROLES = G.ROLES + [("members", "which shapes, as a list?"), ("targets", "to which shapes, as a list?")]   # set roles (lists of shapes)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--freq", type=int, default=8); ap.add_argument("--out", default=os.path.join(HERE, "worlds", "real"))
    ap.add_argument("--frac", type=float, default=1.0, help="the training messages whose id hashes below this share (0.8 = the fit split; 0.2 / 0.4 / 0.8 = the learning curve)")
    a = ap.parse_args()
    msgs = [m for m in FR.load_msgs() if a.frac >= 1 or FR.split_of(m, a.frac)]
    P = json.load(open(os.path.join(HERE, "front_params.json")))
    F = FR.learn(msgs, P)
    norm = lambda text, names: FR.normalize(text, names, F)
    vk = FR.value_kinds(); evtok = {v for vs in G.EVENTS.values() for v in vs}
    base = dict(vk); base.update({v: "VERB" for v in evtok})
    items = []
    for m in msgs:
        created = []
        for w in m["wires"]:
            if w.get("span") and w["span"] in m["text"]:
                items.append((m, w, {"text": w["span"], "names": m.get("names") or [], "created": list(created), "wire": {"type": w["type"], "args": w["args"]}}))
            if w["type"] == "command" and w["args"].get("action") == "create" and w["args"].get("name"): created.append(w["args"]["name"])
    cnt = collections.Counter()
    for m, w, row in items:
        toks, _ = norm(row["text"], list(row["names"]) + row["created"])
        cnt.update(t for t in toks if FR.is_word(t))
    kinds = dict(base)
    for t, c in cnt.items():
        if c >= a.freq and t not in kinds: kinds[t] = t
    lexicon = set(kinds)
    rows, lost_why, dropped, by_ev = [], collections.Counter(), collections.Counter(), collections.Counter()
    for m, w, row in items:
        lost = []
        try: text, roles, ev = convert(row, lexicon, soft=True, lost=lost, norm=norm)
        except Skip as e: dropped[str(e).split(":")[0]] += 1; continue
        if not (set(G.EVENTS[ev]) & set(text.split())) and not roles: dropped["no event token and no role (zero target)"] += 1; continue
        for x in lost: lost_why["event token not found" if x.startswith("verb of") else x.split(" ")[0]] += 1
        rows.append((ev, text, roles, m["id"])); by_ev[ev] += 1
    out = a.out
    for d in ("examples", "raw", "audit", "model", "runs", "versions", "requests"): os.makedirs(os.path.join(out, d), exist_ok=True)
    for f in os.listdir(os.path.join(out, "examples")): os.remove(os.path.join(out, "examples", f))
    roles_of = collections.defaultdict(set)
    for ev, _, roles, _ in rows: roles_of[ev] |= set(roles)
    legend = {"version": 1, "roles": [{"id": r, "question": q} for r, q in ROLES],
              "events": [{"id": e, "verbs": vs, "roles": [r for r, _ in ROLES if r in roles_of[e]], "required": []} for e, vs in G.EVENTS.items()],
              "operators": ["not"], "moods": ["command"], "kinds": {"source": "lexicon", "lexicon": "kinds.tsv"},
              "values": [{"kind": "NUM", "pattern": "\\d+"}, {"kind": "NAME", "pattern": "n_[a-z0-9_]+"}, {"kind": "TEXT", "pattern": "t_[a-z0-9_]+"}],
              "reader": {"predicate_role": True, "occupancy_marker": True, "definite_dets": [], "set_roles": ["members", "targets"]}}
    lp = os.path.join(out, "legend.json"); json.dump(legend, open(lp, "w"), indent=1); sha = G.sha256_file(lp)
    with open(os.path.join(out, "kinds.tsv"), "w") as fh:
        fh.write("# word\tkind: LEARNED by training/sketch/msg_to_world.py (legend value tokens -> their question's kind, event tokens -> VERB, "
                 f"tokens seen >= {a.freq} times in the training spans -> own kind; everything else unknown)\n")
        for w in sorted(kinds): fh.write(f"{w}\t{kinds[w]}\n")
    json.dump(F, open(os.path.join(out, "front.json"), "w"))
    json.dump({"name": "real", "language": "en", "description": "SOP Sketchpad legend, world built from annotated realistic messages", "created": datetime.date.today().isoformat(),
               "version": 1, "min_examples": 500, "max_versions_per_run": 3, "second_look_escalate": 0.05, "second_look_retrain": 0.05}, open(os.path.join(out, "world.json"), "w"), indent=1)
    json.dump({"heldout_sentence_share": 0.0, "new_identities": "none: realistic messages, names are not controlled",
               "file_splits": {"examples/calib.sop": "heldout_formulations"}, "template_splits": {},
               "protocol": f"calib.sop = the requests of {CAL_SHARE:.0%} of the messages: half set the thresholds, half reported; everything else is trained on"},
              open(os.path.join(out, "split_hints.json"), "w"), indent=1)
    k = 0
    # calibration (DECISIONS.md 3): the presence thresholds are set on rows the model does not train on: the requests of CAL_SHARE of the
    # messages (by a hash of the id) go to examples/calib.sop, declared as the held-out formulations split; sop train
    # --calibrate_on_heldout_formulations uses half of them for the thresholds and reports the other half. Every other row is trained on
    # (heldout_sentence_share 0: DECISIONS.md 2).
    cal = lambda mid: int(G.hashlib.sha256((mid + "|cal").encode()).hexdigest()[:8], 16) / 2 ** 32 < CAL_SHARE
    docs = {f: G.soplang.Doc(directives=[("world", "real", None), ("legend", sha, None), ("generated", "training/sketch/msg_to_world.py from llm_train/*_msg", None)]) for f in ("train.sop", "calib.sop")}
    for ev, text, roles, mid in rows:
        ids = iter(f"w{k + i}" for i in range(1, 100)); ws = G.wires_for(ev, roles, text, f"msg.{mid[:2]}", ids, world="real", source="llm")
        k += len(ws); docs["calib.sop" if cal(mid) else "train.sop"].wires += ws
    for f, d in docs.items(): open(os.path.join(out, "examples", f), "w").write(G.soplang.write(d))
    open(os.path.join(out, "raw", "sentences.txt"), "w").write("\n".join(r[1] for r in rows) + "\n")
    if not os.path.exists(os.path.join(out, "status.json")): json.dump({"label": None, "note": "never trained"}, open(os.path.join(out, "status.json"), "w"))
    kc = collections.Counter(kinds.values())
    rep = [f"# World `real`: built from {len(msgs)} training messages ({len(items)} requests with a span)", "",
           f"Front end learned from the same messages: {len(F['values'])} value n-grams, {len(F['triggers'])} trigger rules, {len(F['segmenter'])} segmenter weights; params {json.dumps(P)}.", "",
           f"Rows: {len(rows)}. Dropped (cannot be trained): {sum(dropped.values())} {dict(dropped)}.", "",
           f"Kinds: {len(kc)}; lexicon {len(lexicon)} words (legend value tokens {len(vk)}, event tokens {len(evtok)}, own-kind tokens seen >= {a.freq} times).", "",
           "Own-kind tokens: " + ", ".join(sorted(t for t, c in kinds.items() if c == t)), "",
           "Roles left out because their words are not in the normalized span (rows kept):", "", "| what | n |", "|---|---|"] + \
          [f"| {x} | {n} |" for x, n in lost_why.most_common(40)] + ["", "| event | rows |", "|---|---|"] + [f"| {e} | {n} |" for e, n in by_ev.most_common()]
    open(os.path.join(HERE, "llm_train", "REAL_WORLD.md"), "w").write("\n".join(rep) + "\n")
    print("\n".join(rep[:9]))


if __name__ == "__main__":
    main()
