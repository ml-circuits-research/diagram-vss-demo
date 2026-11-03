"""form_audit.py: before training on a data folder, how much of its gold can survive each reader's data path? (PREPROCESS_FIXES.md, check 2)

For every request of the given folders it runs the existing oracles and groups the requests that fail by their first cause:
  VSS       training/sketch/convert_check.py (the world row of the request with each world's front end, back through docs/js/vss-adapter.js,
            compared with the gold): round trip / every shape / no world / no event token / differs (by the first differing key);
            the fronts are those of a registry (--registry, default the shipped docs/model/micro/registry.json), or learned with the
            caller's EXTRA_DIRS (--learn: the fronts a training run with that data list would have; the switches of the environment apply,
            e.g. FRONT_NAMEDIGIT=1 FRONT_NUMWORDS=1 GAP_ROLE=1);
  SOP-BERT  training/neural/roles_roundtrip.py (the gold as labels of the layout built from a data list, decoded by docs/js/neural.js):
            the causes of roundtrip.json per folder (first wrong key); the data list is --sop-extra-dirs (default: the registry's EXTRA_DIRS,
            the shipped list); the environment's NUM_WORDS=table applies.
A request that fails an oracle cannot be learned right by that reader even with a perfect model: a data / legend / converter / decode cause
to fix before the GPU (scenes_r3/ROOT_CAUSES.md section 2).

Usage (repository root; folders relative to training/sketch):
  python3 training/sketch/checks/form_audit.py llm_bench/scenes_test llm_bench/collected_1 [--registry REG | --learn] [--sop-extra-dirs "..."]
      [--no-vss] [--no-sop] [--work DIR] [--top 8] [--gate PCT]
  --gate PCT: exit 1 when a folder has more than PCT % of its requests failing an oracle (VSS or SOP-BERT); without it the exit code is 0.
Takes ~1 min for VSS with a registry (~2 min with --learn) and ~2-4 min for SOP-BERT (make_roles.py on the data list, then only the audited
folders are decoded: roles_roundtrip.py ONLY_ALSO=1)."""
import argparse, collections, json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__)); SK = os.path.dirname(HERE); REPO = os.path.dirname(os.path.dirname(SK))
ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
ap.add_argument("folders", nargs="+"); ap.add_argument("--registry", default=os.path.join(REPO, "docs", "model", "micro", "registry.json"))
ap.add_argument("--learn", action="store_true"); ap.add_argument("--sop-extra-dirs"); ap.add_argument("--no-vss", action="store_true"); ap.add_argument("--no-sop", action="store_true")
ap.add_argument("--work"); ap.add_argument("--top", type=int, default=8); ap.add_argument("--gate", type=float)
a = ap.parse_args()
REG = json.load(open(os.path.abspath(a.registry)))
work = os.path.abspath(a.work) if a.work else tempfile.mkdtemp(prefix="form_audit_"); os.makedirs(work, exist_ok=True)
env = dict(os.environ)
for k in ("LEGEND_EXT", "DIAGRAM_OPS", "VAL_PICK"):
    if REG.get(k) not in (None, "") and not env.get(k): env[k] = str(REG[k])
fails = collections.defaultdict(dict)   # folder -> reader -> failing share
pc = lambda x, n: f"{100 * x / n:.1f}%" if n else "-"

if not a.no_vss:
    dump = os.path.join(work, "vss_dump.jsonl")
    cmd = [sys.executable, os.path.join(SK, "convert_check.py"), "--no-base", "--dump", dump]
    if a.learn: cmd += ["--groups", os.path.join(SK, REG.get("grouping") or "worlds_micro/GROUPS_8ops.json")]   # the registry's grouping (relative to training/sketch)
    else: cmd += ["--registry", os.path.abspath(a.registry)]
    venv = dict(env)
    if not a.learn: venv["EXTRA_DIRS"] = ""   # the registry's fronts need no data; with EXTRA_DIRS convert_check would also check every training folder
    else: venv.setdefault("EXTRA_DIRS", REG.get("EXTRA_DIRS", ""))
    r = subprocess.run(cmd + a.folders, env=venv, cwd=SK, capture_output=True, text=True)
    if r.returncode not in (0, 3): sys.stderr.write(r.stdout + r.stderr); raise SystemExit("form_audit: convert_check.py failed")
    rows = [json.loads(l) for l in open(dump)]
    print(f"## VSS: conversion oracle (convert_check.py, fronts: {'learned with EXTRA_DIRS' if a.learn else os.path.relpath(os.path.abspath(a.registry), REPO)})\n")
    for f in a.folders:
        rs = [x for x in rows if x["folder"] == f]; n = len(rs)
        cause = collections.Counter(("differs: " + x["bad"][0]) if x["c"] == "differs" and x.get("bad") else x["c"] for x in rs if x["c"] != "ok")
        bad = sum(cause.values()); fails[f]["VSS"] = 100 * bad / max(n, 1)
        print(f"### {f}: {n} requests, round trip {pc(n - bad, n)}, fail {pc(bad, n)}\n\n| first cause | requests | share |\n|---|---|---|")
        for c, k in cause.most_common(a.top): print(f"| {c} | {k} | {pc(k, n)} |")
        if len(cause) > a.top: print(f"| (other causes: {len(cause) - a.top}) | {sum(k for _, k in cause.most_common()[a.top:])} | |")
        print()

if not a.no_sop:
    senv = dict(env, ALSO_DIRS=" ".join(a.folders), ONLY_ALSO="1", EXTRA_DIRS=a.sop_extra_dirs if a.sop_extra_dirs is not None else env.get("EXTRA_DIRS", REG.get("EXTRA_DIRS", "")))
    sw = os.path.join(work, "sop")
    r = subprocess.run([sys.executable, os.path.join(REPO, "training", "neural", "roles_roundtrip.py"), "--work", sw], env=senv, capture_output=True, text=True)
    if r.returncode != 0: sys.stderr.write(r.stdout[-3000:] + r.stderr[-3000:]); raise SystemExit("form_audit: roles_roundtrip.py failed")
    RT = json.load(open(os.path.join(sw, "roundtrip.json")))
    print(f"## SOP-BERT: label round trip (roles_roundtrip.py, layout from EXTRA_DIRS = {senv['EXTRA_DIRS'] or 'none'}{', NUM_WORDS=table' if env.get('NUM_WORDS') == 'table' else ''})\n")
    for f in a.folders:
        t = RT["table"].get(f, {}); n = t.get("gold", 0); ok = t.get("right", 0) + t.get("right_or_ref", 0)
        cause = collections.Counter(RT.get("causes_by_folder", {}).get(f, {}))
        ref = t.get("right_or_ref", 0)
        fails[f]["SOP-BERT"] = 100 * (n - ok - t.get("asked", 0)) / max(n, 1)
        print(f"### {f}: {n} requests, round trip {pc(t.get('right', 0), n)} ({pc(ok, n)} counting the references the shared context rule fills), "
              f"asked {pc(t.get('asked', 0), n)}, silent wrong labels {pc(t.get('silent', 0), t.get('rows', 0))} of the rows\n\n| first cause | requests | share |\n|---|---|---|")
        for c, k in cause.most_common(a.top): print(f"| {c} | {k} | {pc(k, n)} |")
        if len(cause) > a.top: print(f"| (other causes: {len(cause) - a.top}) | {sum(k for _, k in cause.most_common()[a.top:])} | |")
        print()

print("| folder | " + " | ".join(r for r in ("VSS", "SOP-BERT") if any(r in v for v in fails.values())) + " |  (share of the requests failing the oracle)")
for f, v in fails.items(): print(f"| {f} | " + " | ".join(f"{x:.1f}%" for x in v.values()) + " |")
print(f"(work files: {work})")
if a.gate is not None:
    bad = [f"{f} {r} {x:.1f}%" for f, v in fails.items() for r, x in v.items() if x > a.gate]
    if bad: print(f"GATE FAILED (> {a.gate}%): " + ", ".join(bad)); sys.exit(1)
    print(f"gate passed: every folder fails the oracles for at most {a.gate}% of its requests")
