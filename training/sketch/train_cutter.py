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

--worlds [GROUPING] (owner's decision 2026-11-01, ROUTER_V2.md; the design of cutter_worlds_probe.py, variant "worlds"): the B label
carries the world of its request: B-<world> for the worlds of the grouping, B-fallback for the events no world holds (that label exists
only when some legend event has no world); I and O as before; the same features, trainer and epochs. GROUPING is a {world: [events]}
file (worlds_micro/GROUPS_16.json, worlds_micro/GROUPS_6.json) or a registry ({"worlds": [{world, events}]}); with no file, the
registry docs/model/micro/registry.json. Events are legend event ids (generate.EVENTS); a question ask=rules is the event `list`.
The label order (the decode's tie order) is the grouping's worlds, then fallback, then I, O. Writes docs/model/micro/cutter_worlds.json
(default with --worlds): {..., labels, worlds, grouping, segmenter}; read by front.js segmentWorlds (the composer with router "cutter",
vss-composer.js), which checks that the registry's worlds and events are the cutter's grouping.
Run: python3 training/sketch/train_cutter.py --worlds [GROUPING] [--out docs/model/micro/cutter_worlds.json]

Switches (environment; default off = the old build byte for byte; ROUND2.md section 5.2): SHORT=1 adds llm_train/{sonnet,haiku}_short;
OPS=1 adds llm_train/ops_groups and ops_positions (the new-operation messages); DIAGRAM_OPS=1 makes the events group, ungroup,
members, groupOf legend events (needed for a grouping that lists them). Round 2:
  SHORT=1 OPS=1 DIAGRAM_OPS=1 python3 training/sketch/train_cutter.py --worlds training/sketch/worlds_micro/GROUPS_7r2.json --out docs/model/micro/cutter_worlds7r2.json
  SHORT=1 OPS=1 DIAGRAM_OPS=1 python3 training/sketch/train_cutter.py --worlds training/sketch/worlds_micro/GROUPS_EVENTS_r2.json --out docs/model/micro/cutter_events_r2.json
"""
import argparse, collections, glob, hashlib, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import front as FR

def event(w):   # the event of a gold wire (micro_tools.py event, cutter_worlds_probe.py)
    a = w["args"]
    if w["type"] == "command": return a["action"]
    if w["type"] == "question": return "list" if a.get("ask") == "rules" else a.get("ask")
    return w["type"]


DIRS = ["llm_train/sonnet_msg", "llm_train/haiku_msg", "llm_train/sonnet_msg2", "llm_train/haiku_msg2", "llm_train/sonnet_long",
        "llm_bench/fresh1/sonnet", "llm_bench/fresh1/haiku"]
if os.environ.get("SHORT") == "1":  # pre-registered in SHORT.md section 5: add the one-request short messages (default unchanged)
    DIRS = DIRS + ["llm_train/sonnet_short", "llm_train/haiku_short"]
if os.environ.get("OPS") == "1":  # ROUND2.md: add the messages of the new operations (DIAGRAM_OPS.md section 7; same folders as front.py train_dirs OPS=1)
    DIRS = DIRS + ["llm_train/ops_groups", "llm_train/ops_positions"]
DIRS = DIRS + FR.extra_dirs()   # EXTRA_DIRS (FEEDBACK_PLAN.md arms; default: none), the same folders as front.py train_dirs
# LEGEND_EXT=1: the events help, improve ... untangle, reverse are legend events (generate.EVENTS, updated in place by generate.py itself)
if os.environ.get("DIAGRAM_OPS") == "1":  # the new events group / ungroup / members / groupOf become legend events (generate.EVENTS, updated in place by llm_to_world.py)
    import llm_to_world  # noqa: F401  (side effect only)


def main():
    MICRO = os.path.join(HERE, "..", "..", "docs", "model", "micro")
    ap = argparse.ArgumentParser(); ap.add_argument("--out"); ap.add_argument("--worlds", nargs="?", const=os.path.join(MICRO, "registry.json"), default=None)
    a = ap.parse_args()
    if a.out is None: a.out = os.path.join(MICRO, "cutter_worlds.json" if a.worlds else "cutter.json")
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
    if not a.worlds:
        S = FR.train_segmenter(msgs, P["seg_epochs"])
        out = {"about": "cutter.json: the BIO cutter of the composer (front.py train_segmenter, front.js segment), learned on every annotated message with spans",
               "command": "python3 training/sketch/train_cutter.py", "data": data, "messages": len(msgs), "tokens": ntok,
               "params": {"seg_epochs": P["seg_epochs"]}, "segmenter": dict(sorted(S.items()))}
    else:
        import generate as G
        g = json.load(open(a.worlds))
        grouping = {w["world"]: list(w["events"]) for w in g["worlds"]} if isinstance(g.get("worlds"), list) else {k: list(v) for k, v in g.items() if not k.startswith("_")}
        RW = list(grouping)
        if "fallback" in RW: raise SystemExit("--worlds: a world may not be called 'fallback' (the label of the events no world holds)")
        ev_world = {e: w for w, evs in grouping.items() for e in evs}
        if len(ev_world) != sum(len(v) for v in grouping.values()): raise SystemExit("--worlds: an event is listed by two worlds")
        bad = sorted(set(ev_world) - set(G.EVENTS))
        if bad: raise SystemExit(f"--worlds: not legend events: {bad} (a question ask=rules is the event list)")
        free = sorted(set(G.EVENTS) - set(ev_world))
        # a request whose event is no legend event (e.g. group / ungroup / members / groupOf of llm_train/synth_rules_ops while DIAGRAM_OPS is
        # off, or the events of LEGEND_EXT while it is off) has no B label: its message is left out, as a message with a missing span, and
        # counted (before: its B-fallback label was trained but never decoded). With no such request nothing changes.
        noev = collections.Counter(event(w) for m in msgs for w in m["wires"] if event(w) not in G.EVENTS)
        if noev:
            n0 = len(msgs); msgs = [m for m in msgs if all(event(w) in G.EVENTS for w in m["wires"])]
            print(f"left out: {n0 - len(msgs)} messages with a request whose event is no legend event {dict(noev.most_common())}")
            ntok = sum(len(FR.tokenize(m["text"], m.get("names") or [])[0]) for m in msgs)
        WORLDS = RW + (["fallback"] if free else []); LABELS = tuple("B-" + w for w in WORLDS) + ("I", "O")
        S = FR.train_segmenter(msgs, P["seg_epochs"], labels_set=LABELS, b_label=lambda w: "B-" + ev_world.get(event(w), "fallback"))
        nb = collections.Counter(ev_world.get(event(w), "fallback") for m in msgs for w in m["wires"])
        rel = os.path.relpath(os.path.abspath(a.worlds), os.path.join(HERE, "..", ".."))
        empty = [w for w in WORLDS if not nb.get(w)]
        if empty: print(f"WARNING: worlds with no request in the data (their B label is never trained): {empty}")
        out = {"about": "cutter_worlds.json: the BIO cutter whose B label carries the world (B-<world>; front.py train_segmenter with b_label, front.js "
                        "segmentWorlds), learned on every annotated message with spans; worlds = the registry's worlds + fallback (events no world holds)",
               "command": f"python3 training/sketch/train_cutter.py --worlds {rel}" + ("" if os.path.basename(a.out) == "cutter_worlds.json" else f" --out {os.path.relpath(os.path.abspath(a.out), os.path.join(HERE, '..', '..'))}"),
               "data": data, "messages": len(msgs), "tokens": ntok, "params": {"seg_epochs": P["seg_epochs"]},
               "grouping_file": rel, "grouping": grouping, "events_of_no_world": free, "worlds": WORLDS, "labels": list(LABELS),
               **({"left_out_no_legend_event": dict(noev.most_common()), "LEGEND_EXT": 1} if noev or G.LEGEND_EXT else {}),
               "requests_per_world": dict(nb.most_common()), "segmenter": dict(sorted(S.items()))}
        print("requests per world label: " + ", ".join(f"{w} {n}" for w, n in nb.most_common()))
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    json.dump(out, open(a.out, "w"))
    print(f"{len(msgs)} messages, {ntok} tokens, {len(S)} weights -> {os.path.abspath(a.out)}")


if __name__ == "__main__":
    main()
