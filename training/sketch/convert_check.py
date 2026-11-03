"""convert_check.py: does the annotated gold reach the VSS worlds in a form they can learn? (VSS_SYNTH_DIAGNOSIS.md section 4, 6.C)

For every request of each data folder: the world row that msg_to_world.py would write for it (llm_to_world.convert(soft=True) with the
world's own front end, learned exactly as train_micro.sh learns it: DATA, EXTRA_DIRS, FRONT_ROWS, the switches of the environment and of
the world's settings), passed back through the browser adapter (docs/js/vss-adapter.js toNodes, the composer's reference rule between the
requests of a message) and compared with the gold in bench-canon form (docs/js/bench-canon.js). Per folder it reports the share of requests
  round trip    the row reproduces the gold (and the row carries its event token);
  every shape   the row turns a description or a list into "every shape" (an entity key reads mention(quantifier=all) where the gold says
                something else: "remove all the stars" -> delete target=mention(quantifier=all)), the worst kind of row to train on;
  no world      the request's event is in no world of the grouping (no row at all);
and the other outcomes (no event token, differs, no node), with the keys that differ most.

Usage (from the repository root or anywhere):
  [LEGEND_EXT=1 DIAGRAM_OPS=1 VAL_PICK=specific EXTRA_DIRS="..."] python3 training/sketch/convert_check.py
      [--groups worlds_micro/GROUPS_8.json | --registry REG] [--worlds-tsv <070's worlds.tsv>] [--fronts-out DIR | --fronts-in DIR]
      [--gate 1.0] [--tests] [--json out.json] [--show N] [--dump requests.jsonl] [folder ...]
  folders: default = the base folders of DATA (one row) + each EXTRA_DIRS folder; --tests adds llm_bench/short3 (messages with a pending
  wire left out, as job 072) and llm_bench/fresh2 (opus_a..d); extra folder arguments (relative to training/sketch) are checked too.
  --registry REG: the worlds of a trained registry instead (events from REG, each world's settings from its BUILD.json and its front end
  from its exported front.json; job 072: the conversion ceiling of the trained arm on short3 / fresh2, `--registry ... --no-base --tests`).
  --worlds-tsv: the world table of job 070 (world, folder, events, settings); its settings (CREATE_COLOR, QCOLOR, VAL_PICK, ...) are applied
  per world. Without it, the same table is built as 070 builds it (the shipped BUILD.json of each GROUPS_7 world; new worlds: the common
  settings). Switches that change module tables (LEGEND_EXT, DIAGRAM_OPS) must be set in the environment and equal for every world.
  --gate P: exit 3 when a TRAINED folder (base or EXTRA_DIRS) has an "every shape" share above P percent (the test folders are reported
  only). Read-only: it writes nothing in the repository (the fronts go to --fronts-out, a temporary folder otherwise)."""
import argparse, collections, glob, json, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(os.path.dirname(HERE)); sys.path.insert(0, HERE)
CWD = os.getcwd(); os.chdir(HERE)   # file arguments are read relative to the caller's folder (CWD); data folders relative to training/sketch
import front as FR
import generate as G
from llm_to_world import convert, Skip, QUESTION_EVENT

SHIPPED = {"shapes": "shapes7c", "links": "links7", "position": "position7", "graphq": "graphq7", "questions": "questions7", "manage": "manage7", "history": "history7"}
KEYS = ["DATA", "FRAC", "QCOLOR", "MARKER", "ROW_SHAPE", "FRONT_ROWS", "KINDMAP", "CAL_FALLBACK", "D", "EPOCHS", "SEED", "N_EVAL", "EVAL_MODES", "HOLDOUT",
        "CREATE_COLOR", "N_CAL", "VAL_PREC", "VAL_SUB", "VAL_PICK", "SHORT", "OPS", "DIAGRAM_OPS"]
COMMON = "DATA=spans FRAC=1.0 QCOLOR=1 MARKER=0 FRONT_ROWS=world KINDMAP=diagnosis_kinds/kinds_comb1.json CAL_FALLBACK=train D=1024 EPOCHS=10 SEED=0 N_EVAL=150 EVAL_MODES=primary"
PER_WORLD = ("CREATE_COLOR", "QCOLOR", "VAL_PREC", "VAL_SUB", "VAL_PICK", "FRONT_ROWS", "ROW_SHAPE")   # read at call time: may differ per world
GLOBAL = ("LEGEND_EXT", "DIAGRAM_OPS", "DATA", "SHORT", "OPS")                                     # read at import or by load_msgs: one value for all


def ev_of(w):
    a, t = w.get("args", {}), w.get("type")
    return a.get("action") if t == "command" else QUESTION_EVENT.get(a.get("ask")) if t == "question" else t


def settings_table(groups, tsv):
    """world -> {setting: value} (the 070 table)"""
    if tsv:
        out = {}
        for l in open(tsv):
            if not l.strip(): continue
            gw, base, events, settings = l.rstrip("\n").split("\t")
            out[gw] = dict(x.split("=", 1) for x in settings.split())
        return out
    out = {}
    for w in groups:
        if w in SHIPPED and os.path.exists(os.path.join(REPO, f"docs/model/micro/{SHIPPED[w]}/BUILD.json")):
            b = json.load(open(os.path.join(REPO, f"docs/model/micro/{SHIPPED[w]}/BUILD.json")))
            out[w] = {k: str(b[k]) for k in KEYS if k in b and str(b[k]) != ""}
        else: out[w] = dict(x.split("=", 1) for x in COMMON.split())
        for k in ("VAL_PICK", "LEGEND_EXT", "DIAGRAM_OPS"):   # the environment's switches apply to every world (as 070 passes them)
            if os.environ.get(k): out[w][k] = os.environ[k]
    return out


def with_env(st):
    """set the per-world settings in os.environ; returns the previous values"""
    old = {k: os.environ.get(k) for k in PER_WORLD}
    for k in PER_WORLD:
        if st.get(k): os.environ[k] = st[k]
        else: os.environ.pop(k, None)
    return old


def restore(old):
    for k, v in old.items():
        if v is None: os.environ.pop(k, None)
        else: os.environ[k] = v


def learn_fronts(groups, table, msgs):
    P = json.load(open(os.path.join(HERE, "front_params.json"))); F = {}
    for w, evs in groups.items():
        st = table[w]; old = with_env(st); wev = set(evs)
        if (st.get("FRONT_ROWS") or "all") == "world": F[w] = FR.learn(msgs, P, keep=lambda x: ev_of(x) in wev)
        else: F[w] = FR.learn(msgs, P)
        restore(old)
        print(f"  front {w}: {len(F[w]['values'])} value n-grams ({sum(1 for v in F[w]['values'].values() if v == 'all')} -> all), {len(F[w]['triggers'])} trigger rules", file=sys.stderr, flush=True)
    return F


def folder_msgs(d):
    p = d if os.path.isabs(d) else os.path.join(HERE, d)
    files = sorted(f for pat in ("msg_*.jsonl", "batch_*.jsonl") for f in glob.glob(os.path.join(p, pat)))
    return [json.loads(l) for f in files for l in open(f) if l.strip()]


def convert_msgs(msgs, groups, table, F):
    """-> one record per message: {id, names, wires (gold), conv: [per wire]} (msg_to_world.py's items: created names of earlier wires)"""
    wof = {e: w for w, es in groups.items() for e in es}; out = []
    ops = os.environ.get("DIAGRAM_OPS") == "1"
    for m in msgs:
        created, conv = [], []
        for w in m["wires"]:
            c = None
            if "type" in w and w.get("span") and w["span"] in m["text"]:
                world = wof.get(ev_of(w)); c = {"world": world}
                if world:
                    old = with_env(table[world]); Fw = F[world]; norm = lambda text, names: FR.normalize(text, names, Fw)
                    row = {"text": w["span"], "names": m.get("names") or [], "groups": list(m.get("groups") or {}), "created": list(created), "wire": {"type": w["type"], "args": w["args"]}}
                    lost = []
                    try:
                        text, roles, ev = convert(row, None, soft=True, lost=lost, norm=norm); toks = text.split()
                        _, info = norm(w["span"], list(row["names"]) + (row["groups"] if ops else []) + row["created"])
                        evt = set(G.EVENTS.get(ev, [])); verb = next((t for t in toks if t in evt), None)
                        c.update({"ok": True, "ev": ev, "toks": toks, "roles": roles, "lost": lost, "verb": verb, "info": info,
                                  "zero": not verb and not roles})
                    except Skip as e: c.update({"ok": False, "skip": str(e)})
                    restore(old)
            elif "type" in w: c = {"nospan": True}
            conv.append(c)
            if w.get("type") == "command" and w["args"].get("action") == "create" and w["args"].get("name"): created.append(w["args"]["name"])
            elif ops and w.get("type") == "command" and w["args"].get("action") == "group" and w["args"].get("name"): created.append(w["args"]["name"])
        out.append({"id": m["id"], "names": m.get("names") or [], "wires": [{"type": w.get("type"), "args": w.get("args", {}), "span": w.get("span")} for w in m["wires"]], "conv": conv})
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--groups", default="worlds_micro/GROUPS_8.json"); ap.add_argument("--registry", help="check the trained worlds of this registry (fronts and settings from their folders)"); ap.add_argument("--worlds-tsv"); ap.add_argument("--fronts-out"); ap.add_argument("--fronts-in")
    ap.add_argument("--gate", type=float, default=None); ap.add_argument("--tests", action="store_true"); ap.add_argument("--json"); ap.add_argument("--show", type=int, default=0)
    ap.add_argument("--dump", help="write every request's result (folder, span, outcome, differing keys, row vs gold) to this JSONL file")
    ap.add_argument("--no-base", action="store_true", help="skip the base folders of DATA"); ap.add_argument("folders", nargs="*")
    a = ap.parse_args()
    for k in ("registry", "worlds_tsv", "fronts_out", "fronts_in", "json", "dump"):
        if getattr(a, k): setattr(a, k, os.path.join(CWD, getattr(a, k)))
    if a.groups and not os.path.isabs(a.groups) and not os.path.exists(a.groups): a.groups = os.path.join(CWD, a.groups)
    if a.registry:   # the trained worlds of a registry: their events, the settings of their BUILD.json, their exported front.json
        reg = json.load(open(a.registry)); md = os.path.join(REPO, "docs", "model"); a.groups = a.registry
        groups = {w["world"]: w["events"] for w in reg["worlds"]}
        table, F = {}, {}
        for w in reg["worlds"]:
            d = os.path.join(md, w["model"]); b = json.load(open(os.path.join(d, "BUILD.json")))
            table[w["world"]] = {k: str(b[k]) for k in KEYS + ["LEGEND_EXT"] if k in b and str(b[k]) != ""}
            F[w["world"]] = json.load(open(os.path.join(d, "front.json")))
    else: groups = {k: v for k, v in json.load(open(a.groups)).items() if not k.startswith("_")}
    missing = sorted({e for es in groups.values() for e in es} - set(G.EVENTS))
    if missing: raise SystemExit(f"convert_check: events {missing} of {a.groups} are not legend events with these switches (LEGEND_EXT / DIAGRAM_OPS?)")
    if not a.registry: table = settings_table(groups, a.worlds_tsv)
    for k in GLOBAL:   # one value for every world, taken into the environment (train_micro.sh: DATA defaults to all)
        vals = {st.get(k, "all" if k == "DATA" else "") for st in table.values()}
        if len(vals) > 1: raise SystemExit(f"convert_check: the worlds differ in {k} ({sorted(vals)}): not supported")
        v = vals.pop()
        if os.environ.get(k, "all" if k == "DATA" else "") != v:
            if k in ("LEGEND_EXT", "DIAGRAM_OPS"): raise SystemExit(f"convert_check: the worlds have {k}={v!r}: set it in the environment ({k}={os.environ.get(k)!r})")
            os.environ[k] = v
    if a.registry: pass
    elif a.fronts_in: F = {w: json.load(open(os.path.join(a.fronts_in, f"{w}.json"))) for w in groups}
    else:
        print(f"convert_check: learning the fronts of {len(groups)} worlds (DATA={os.environ.get('DATA', '') or 'old'}, EXTRA_DIRS: {len(FR.extra_dirs())} folders)", file=sys.stderr, flush=True)
        F = learn_fronts(groups, table, FR.load_msgs())
        if a.fronts_out:
            os.makedirs(a.fronts_out, exist_ok=True)
            for w in F: json.dump(F[w], open(os.path.join(a.fronts_out, f"{w}.json"), "w"))
    sets = []   # (label, trained?, messages)
    if not a.no_base:
        base = [d for d in FR.TRAIN_DIRS[os.environ.get("DATA") or "old"]] + (["sonnet_short", "haiku_short"] if os.environ.get("SHORT") == "1" else []) + (["ops_groups", "ops_positions"] if os.environ.get("OPS") == "1" else [])
        sets.append((f"base (DATA={os.environ.get('DATA') or 'old'}: {len(base)} folders)", True, [m for d in base for m in folder_msgs(os.path.join("llm_train", d))]))
    for d in FR.extra_dirs(): sets.append((d, True, folder_msgs(d)))
    for d in a.folders: sets.append((d, False, folder_msgs(d)))
    if a.tests:
        s3 = [m for m in folder_msgs("llm_bench/short3") if not any("pending" in w for w in m["wires"])]
        sets.append(("llm_bench/short3 (no pending)", False, s3))
        sets.append(("llm_bench/fresh2 (opus_a..d)", False, [m for d in ("opus_a", "opus_b", "opus_c", "opus_d") for m in folder_msgs(f"llm_bench/fresh2/{d}")]))
    tmp = tempfile.mkdtemp(prefix="convert_check_"); results = []
    if a.dump: open(a.dump, "w").close()
    try:
        for label, trained, msgs in sets:
            recs = convert_msgs(msgs, groups, table, F)
            fi, fo = os.path.join(tmp, "in.jsonl"), os.path.join(tmp, "out.jsonl")
            open(fi, "w").write("".join(json.dumps(r) + "\n" for r in recs))
            subprocess.run(["node", os.path.join(HERE, "convert_check.mjs"), fi, fo], check=True)
            res = [json.loads(l) for l in open(fo)]
            if a.dump:
                with open(a.dump, "a") as fd:
                    for r in res: fd.write(json.dumps({"folder": label, **r}) + "\n")
            n = len(res); cnt = collections.Counter(r["c"] for r in res); bad = collections.Counter(k for r in res for k in r.get("bad", []))
            lost = collections.Counter(x.split(" ")[0] if not x.startswith("head of") else "head of mention" for r in res for x in r.get("lost", []))
            results.append({"folder": label, "trained": trained, "requests": n, "counts": dict(cnt), "bad_keys": dict(bad.most_common(10)), "lost": dict(lost.most_common(10)),
                            "examples": {c: [r["span"] + " -> " + json.dumps(r.get("got")) for r in res if r["c"] == c][:a.show] for c in cnt} if a.show else {}})
    finally:
        for f in os.listdir(tmp): os.remove(os.path.join(tmp, f))
        os.rmdir(tmp)
    sw = " ".join(f"{k}={os.environ.get(k)}" for k in ("LEGEND_EXT", "DIAGRAM_OPS", "VAL_PICK") if os.environ.get(k)) or "no switch"
    print(f"\nconvert_check ({sw}; groups {os.path.basename(a.groups)}): share of the requests whose world row ...")
    print("| folder | requests | round trip | every shape | no world | no event token | differs | no node / no span | keys that differ most |")
    print("|---|---|---|---|---|---|---|---|---|")
    pc = lambda r, *cs: 100 * sum(r["counts"].get(c, 0) for c in cs) / max(1, r["requests"])
    fail = []
    for r in results:
        es = pc(r, "every shape")
        print(f"| {r['folder']} | {r['requests']} | {pc(r, 'ok'):.1f}% | {es:.1f}% | {pc(r, 'no world'):.1f}% | {pc(r, 'no event token'):.1f}% | {pc(r, 'differs'):.1f}% | "
              f"{pc(r, 'no node', 'no span', 'dropped'):.1f}% | {' '.join(f'{k} {v}' for k, v in list(r['bad_keys'].items())[:6])} |")
        if a.gate is not None and r["trained"] and es > a.gate: fail.append(f"{r['folder']} {es:.1f}%")
        for c, xs in r["examples"].items():
            for x in xs: print(f"    {c}: {x}")
    if a.json: json.dump({"switches": sw, "groups": a.groups, "results": results}, open(a.json, "w"), indent=1)
    if fail:
        print(f"GATE FAILED: 'every shape' share above {a.gate}% in: {', '.join(fail)}"); sys.exit(3)
    if a.gate is not None: print(f"gate passed: every trained folder has an 'every shape' share of at most {a.gate}%")


if __name__ == "__main__":
    main()
