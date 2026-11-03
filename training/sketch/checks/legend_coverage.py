"""legend_coverage.py: before training, what of the legend can each learned reader learn from a data list? (PREPROCESS_FIXES.md, check 1)

A learned reader only reads what its training data shows it (scenes_r3/ROOT_CAUSES.md section 2: SOP-BERT had no width / height heads, `fill`
only `light`, `create` without `distance`, because the data had none). This script counts, for the training data of a data list, every legend
key and value and every SOP-BERT action, and prints the zeros and the near-zeros, per reader:

SOP-BERT (training/neural/make_roles.py builds its layout from the data: a key gets a head / a tag only if the data has it; act_keys = the
keys the act's requests carry; a class head holds only the values seen):
  1. acts           the act set of docs/js/neural.js (+ fact, rule): requests per act;
  2. keys           every legend question (docs/js/logic.js) but action / ask: requests that carry it (0 -> no head and no tag at all);
  3. values         every value of an enum question (the legend's values, docs/js/logic.js; legend_ext/legend_values.json is its export):
                    requests with key=value (0 -> the class head has no such class: the value cannot be read);
  4. act x key      the keys an act takes in ANY annotated folder of the repository (llm_train/*, llm_bench/**: the reference) and that the
                    data list has fewer than --near times for that act (act_keys: a key an act's requests never carry is never read).
VSS (training/sketch/front.py: a value token reaches a world row only when the world's front end learned a word n-gram for it; the worlds
  learn from their own requests, FRONT_ROWS=world):
  5. per world      every legend value token of the kinds the world's requests carry (front.py value_kinds): the world's requests that carry
                    it (front.py gold_values) and the n-grams its front end learned for it; printed when it has no n-gram (the data has
                    it, no word was learned: the value cannot reach a row) or fewer than --near requests;
  6. number keys    per world, the requests with count / distance / width / height and how many of them write the number as a word
                    (a word reaches a row only when a front end learns it, or with FRONT_NUMWORDS=1).
The fronts: --fronts DIR (one <world>.json per world, convert_check.py --fronts-out), --registry REG (the shipped front.json of each world),
or learned here as convert_check.py learns them (DATA, FRONT_ROWS=world, the world settings; ~1 minute).

Usage (repository root):
  EXTRA_DIRS="<folders>" LEGEND_EXT=1 DIAGRAM_OPS=1 VAL_PICK=specific python3 training/sketch/checks/legend_coverage.py [--registry docs/model/micro/registry.json]
      [--fronts DIR] [--groups training/sketch/worlds_micro/GROUPS_8ops.json] [--near 5] [--ref-min 3] [--no-vss] [--json out.json] [--gate]
  --registry also takes the data list (EXTRA_DIRS) from the registry when EXTRA_DIRS is not set: the shipped data list.
  Exit code: 0 always (a report), unless --gate: then 1 when any zero is found in sections 2-5 (a key, a value, an act's key, a value no
  front end learned) that the reference data has at least --ref-min times."""
import argparse, collections, glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__)); SK = os.path.dirname(HERE); REPO = os.path.dirname(os.path.dirname(SK))
ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
ap.add_argument("--registry"); ap.add_argument("--fronts"); ap.add_argument("--groups", default=os.path.join(SK, "worlds_micro", "GROUPS_8ops.json"))
ap.add_argument("--near", type=int, default=5); ap.add_argument("--ref-min", type=int, default=3); ap.add_argument("--no-vss", action="store_true")
ap.add_argument("--json"); ap.add_argument("--gate", action="store_true")
a = ap.parse_args()
for k in ("registry", "fronts", "groups", "json"):
    if getattr(a, k): setattr(a, k, os.path.abspath(getattr(a, k)))
REG = json.load(open(a.registry)) if a.registry else None
if REG and not os.environ.get("EXTRA_DIRS"): os.environ["EXTRA_DIRS"] = REG.get("EXTRA_DIRS", "")
if REG:   # the registry's switches (they change the legend's value tables of front.py)
    for k in ("LEGEND_EXT", "DIAGRAM_OPS", "VAL_PICK"):
        if REG.get(k) not in (None, "") and not os.environ.get(k): os.environ[k] = str(REG[k])
    B = json.load(open(os.path.join(REPO, "docs", "model", REG["worlds"][0]["model"], "BUILD.json")))   # the worlds' data setting (DATA, SHORT, OPS)
    for k in ("DATA", "SHORT", "OPS"):
        if B.get(k) not in (None, "") and not os.environ.get(k): os.environ[k] = str(B[k])
sys.path.insert(0, SK); sys.path.insert(0, os.path.join(REPO, "training", "neural"))
import make_data as MD
import make_roles as MR

flags = []   # (section, what) zeros that count for --gate


def folder_msgs(d):
    p = d if os.path.isabs(d) else os.path.join(SK, d)
    return [json.loads(l) for f in sorted(glob.glob(os.path.join(p, "msg_*.jsonl")) + glob.glob(os.path.join(p, "batch_*.jsonl"))) for l in open(f) if l.strip()]


def wires(msgs):
    return [w for m in msgs for w in m.get("wires", []) if w.get("span") and w["span"] in m["text"] and "pending" not in w]


def table(rows, head):
    print("| " + " | ".join(head) + " |\n|" + "---|" * len(head))
    for r in rows: print("| " + " | ".join(str(x) for x in r) + " |")


# ---------------------------------------------------------------- the data list and the reference
dirs = MD.DIRS + MD.SAMPLE_DIRS   # make_roles.py --all (the shipped SOP-BERT): DIRS (+ EXTRA_DIRS) and the sample folders
data = wires(MD.messages(dirs))
ref_dirs = sorted({os.path.relpath(os.path.dirname(f), SK) for pat in ("llm_train/*/msg_*.jsonl", "llm_train/*/batch_*.jsonl", "llm_bench/**/msg_*.jsonl", "llm_bench/**/batch_*.jsonl")
                   for f in glob.glob(os.path.join(SK, pat), recursive=True)})
ref = wires([m for d in ref_dirs for m in folder_msgs(d)])
print(f"data list: {len(dirs)} folders (EXTRA_DIRS: {os.environ.get('EXTRA_DIRS', '') or 'none'}), {len(data)} requests; "
      f"reference: every annotated folder ({len(ref_dirs)} folders, {len(ref)} requests)\n")
LEG = MR.legend()
ACTION, ASK = MD.acts_from_neural_js(); ACTS = ACTION + ASK + ["fact", "rule"]
act = lambda w: MD.act_of(w.get("type"), w.get("args", {}))
keys_of = lambda w: [k for k in w.get("args", {}) if k not in ("action", "ask")]
out = {"data_dirs": dirs, "sop": {}, "vss": {}}

# ---------------------------------------------------------------- SOP-BERT
print("## SOP-BERT (make_roles.py layout from the data)\n")
na, nr = collections.Counter(act(w) for w in data), collections.Counter(act(w) for w in ref)
low = [(x, na[x], nr[x]) for x in ACTS if na[x] < a.near]
print(f"### 1. acts with fewer than {a.near} requests ({len(low)} of {len(ACTS)})\n")
table(low or [("-", "-", "-")], ["act", "requests in the data", "in the reference"])
out["sop"]["acts"] = {x: na[x] for x in ACTS}

nk = collections.Counter(k for w in data for k in keys_of(w)); nkr = collections.Counter(k for w in ref for k in keys_of(w))
qk = [k for k in LEG if k not in ("action", "ask")]
low = [(k, LEG[k]["kind"], nk[k], nkr[k], "no head / no tag" if nk[k] == 0 else "") for k in qk if nk[k] < a.near]
print(f"\n### 2. legend keys with fewer than {a.near} requests ({len(low)} of {len(qk)})\n")
table(low or [("-",) * 5], ["key", "legend kind", "requests in the data", "in the reference", ""])
flags += [("key", k) for k, _, n, r, _ in low if n == 0 and r >= a.ref_min]
out["sop"]["keys"] = {k: nk[k] for k in qk}

nv = collections.Counter((k, str(v)) for w in data for k, v in w.get("args", {}).items()); nvr = collections.Counter((k, str(v)) for w in ref for k, v in w.get("args", {}).items())
rows = []
for k in qk:
    vals = LEG[k]["values"]
    if not vals or LEG[k]["kind"] != "enum": continue
    for v in vals:
        if nv[(k, v)] < a.near: rows.append((k, v, nv[(k, v)], nvr[(k, v)], "no class: cannot be read" if nv[(k, v)] == 0 else ""))
print(f"\n### 3. legend values with fewer than {a.near} requests (enum keys; {len(rows)})\n")
zero_keys = collections.defaultdict(list)
for k, v, n, r, _ in rows:
    if n == 0 and r == 0: zero_keys[k].append(v)
table([x for x in rows if not (x[2] == 0 and x[3] == 0)] or [("-",) * 5], ["key", "value", "requests in the data", "in the reference", ""])
if zero_keys: print("\nvalues no annotated folder has at all (data and reference 0; not printed above): " + "; ".join(f"{k} {len(vs)} ({', '.join(vs[:6])}{' ...' if len(vs) > 6 else ''})" for k, vs in zero_keys.items()))
flags += [("value", f"{k}={v}") for k, v, n, r, _ in rows if n == 0 and r >= a.ref_min]
out["sop"]["values"] = {f"{k}={v}": n for k, v, n, r, _ in rows}

nak = collections.Counter((act(w), k) for w in data for k in keys_of(w)); nakr = collections.Counter((act(w), k) for w in ref for k in keys_of(w))
rows = sorted(((ac, k, nak[(ac, k)], r, "never read for this act (act_keys)" if nak[(ac, k)] == 0 else "") for (ac, k), r in nakr.items()
               if r >= a.ref_min and ac in ACTS and k in LEG and nak[(ac, k)] < a.near), key=lambda x: (x[2], -x[3]))
print(f"\n### 4. act x key: keys an act takes in the reference (>= {a.ref_min} requests) that the data has fewer than {a.near} times ({len(rows)})\n")
table(rows or [("-",) * 5], ["act", "key", "requests in the data", "in the reference", ""])
flags += [("act x key", f"{ac}.{k}") for ac, k, n, r, _ in rows if n == 0]
out["sop"]["act_keys"] = {f"{ac}.{k}": n for ac, k, n, r, _ in rows}

# ---------------------------------------------------------------- VSS
if not a.no_vss:
    import front as FR
    print("\n## VSS (front.py: the value n-grams each world's front end learns from its own requests)\n")
    if REG:
        groups = {w["world"]: w["events"] for w in REG["worlds"]}
        F = {w["world"]: json.load(open(os.path.join(REPO, "docs", "model", w["model"], "front.json"))) for w in REG["worlds"]}
        src = f"the shipped fronts of {os.path.relpath(a.registry, REPO)}"
    else:
        groups = {k: v for k, v in json.load(open(a.groups)).items() if not k.startswith("_")}
        if a.fronts: F = {w: json.load(open(os.path.join(a.fronts, w + ".json"))) for w in groups}; src = f"the fronts in {a.fronts}"
        else:
            cwd = os.getcwd(); import convert_check as CC; os.chdir(cwd)
            os.environ.setdefault("DATA", "spans")
            F = CC.learn_fronts(groups, CC.settings_table(groups, None), FR.load_msgs()); src = "fronts learned here (convert_check.py learn_fronts)"
    vmsgs = FR.load_msgs(); vk = FR.value_kinds(); learned_by = {}
    print(f"fronts: {src}; VSS data: {len(vmsgs)} messages (front.py load_msgs: DATA={os.environ.get('DATA') or 'old'} + EXTRA_DIRS)\n")
    ev_world = {e: w for w, es in groups.items() for e in es}
    rows, nrows = [], []
    for wd, evs in groups.items():
        ws = [w for m in vmsgs for w in m.get("wires", []) if w.get("span") and FR.event_of(w) in evs]
        gv = collections.Counter(t for w in ws for t in FR.gold_values(w) if not t.isdigit())
        gr = collections.Counter(t for w in ref if FR.event_of(w) in evs for t in FR.gold_values(w) if not t.isdigit())   # the reference, this world's events
        reach = collections.Counter()   # the world's requests whose normalized span (its own front end) holds the gold token: it reaches a row
        for m in vmsgs:
            nm = list(m.get("names") or []) + [w["args"]["name"] for w in m.get("wires", []) if w.get("args", {}).get("name")]
            for w in m.get("wires", []):
                if not (w.get("span") and FR.event_of(w) in evs): continue
                g = [t for t in FR.gold_values(w) if not t.isdigit()]
                if g: T = set(FR.normalize(w["span"], nm, F[wd])[0]); reach.update(t for t in g if t in T)
        ng = collections.Counter(F[wd]["values"].values())
        kinds = {vk.get(t) for t in gv if vk.get(t)}
        for t, kd in sorted(vk.items(), key=lambda x: (x[1], x[0])):
            if kd not in kinds: continue
            if gv[t] > 0 and reach[t] == 0: rows.append((wd, kd, t, gv[t], reach[t], gr[t], ng[t], "the data has it, it never reaches a row")); flags.append(("vss value", f"{wd}:{t}")) if gv[t] >= a.ref_min else None
            elif gv[t] < a.near and gr[t] >= a.ref_min: rows.append((wd, kd, t, gv[t], reach[t], gr[t], ng[t], "no request carries it" if gv[t] == 0 else ""))
        for k in ("count", "distance", "width", "height"):
            hs = [w for w in ws if w.get("args", {}).get(k) not in (None, "")]
            if not hs: continue
            words = [w for w in hs if str(w["args"][k]).isdigit() and not re.search(r"\b" + re.escape(str(w["args"][k])) + r"(?!\d)", w["span"])]
            nrows.append((wd, k, len(hs), len(words), ", ".join(sorted({re.sub(r"\s+", " ", w["span"])[:40] for w in words})[:2])))
        learned_by[wd] = {t: ng[t] for t in gv}
    print(f"### 5. value tokens per world: the data has it and it never reaches a row (no word of the request becomes the token), or fewer than {a.near} requests while the reference has >= {a.ref_min} ({len(rows)})\n")
    table(rows or [("-",) * 8], ["world", "kind", "value token", "requests of the world with it", "of them: the token reaches the row", "in the reference", "n-grams learned", ""])
    print("\n### 6. number keys per world: requests, and those that write the number as a word (not as digits)\n")
    table(nrows or [("-",) * 5], ["world", "key", "requests", "written as a word", "e.g."])
    out["vss"] = {"rows": rows, "numbers": nrows}

print(f"\n{len(flags)} zero(s) that the reference has at least {a.ref_min} times: " + (", ".join(f"{s} {x}" for s, x in flags[:40]) + (" ..." if len(flags) > 40 else "") if flags else "none"))
if a.json: json.dump(dict(out, flags=flags), open(a.json, "w"), indent=1)
if a.gate and flags: print("GATE FAILED"); sys.exit(1)
