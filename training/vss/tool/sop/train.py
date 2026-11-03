"""
train.py — `sop train <world>`: legend.json + examples/*.sop -> <world>/model/ (spec 4), with torch.

What is GIVEN and what is LEARNED (rule 20): the legend's roles, the identities (stars regenerated from the seed), the kinds (lexicon) and
the event synonym table are inputs; the reader learns the route book only — per-kind displacements of the path, bigram and chain codes
and the gates (which kinds emit), by the single generative objective max cos(S, S_world) (structured per-sentence targets with pre-set
roles; the model learns the assignment). The model and the loop are the repository's: experiment/v8_gates.V8 (path + chainL + bigram,
gates learned from an all-closed start) and experiment/trainer.train_loop (memory logged, checkpoint, finite-loss assertion; rule 21).

Steps: check every example against the legend (abort on errors, or on a legend-hash mismatch unless --force); build the rows (one per
top-level wire with _text); SPLITS written to runs/<ts>/splits.json BEFORE training (seen formulations = train + held-out sentences;
held-out formulations; new identities; held-out depth); trace of one row (rule 11); training; export of the route book; numpy/torch
agreement check; thresholds set on CALIBRATION rows = a sample of the training split (rule 25); evaluation of every split with the CLI's
own numpy reader; metrics.json, REPORT.md, background.npz, status.json.
Spec section 6 (steps 3-7) as implemented here: kinds (6.3, with the `unknown` kind and its share), the four splits (6.4) written before
training, the lexical bag baseline on the same rows (6.4), training with the reference trainer (6.5), the evaluation fields of 6.6 (per role,
FULL with the structure estimated and given, occupancy in three cases, calibration, held-out formulations, new identities, baselines). Steps
1-2 and 6b-8 are the skill's (skills/train-world/scripts/loop.py).
Memory (2026-10-31): bounded by one step. The targets and the encoded sentences are built per batch; the phase table (3 K^2 + 4 K + 41 rows
of D float64 for K kinds) is never held whole: only the rows the training sentences reach are trained (LeanTheta, Compact), the others keep
their initial values and are redrawn for the route book; each batch is computed at its own longest sentence (--pad_to_longest: the corpus'
longest, bit for bit the previous trainer); the torch model is freed before calibration and the reader's route book is loaded once.
"""
import argparse, collections, copy, datetime, hashlib, json, os, shutil, subprocess, sys, tempfile, time
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(os.path.dirname(HERE)); EXP = os.path.join(REPO, "experiment")

from . import soplang, check as checkmod, world, activate
from .legend import Legend, tokenize

UNKNOWN_KIND = "unknown"

TAUS = (0.0, 0.02, 0.05, 0.1, 0.15)


class Tee:
    def __init__(self, *s): self.s = s
    def write(self, x):
        for s in self.s: s.write(x)
    def flush(self):
        for s in self.s: s.flush()


def h01(*parts):
    return int.from_bytes(hashlib.sha256(":".join(map(str, parts)).encode()).digest()[:8], "little") / 2 ** 64


def git_commit():
    try:
        c = subprocess.run(["git", "-C", REPO, "rev-parse", "--short", "HEAD"], capture_output=True, text=True).stdout.strip()
        dirty = subprocess.run(["git", "-C", REPO, "status", "--porcelain", "--", "tool/sop", "experiment"], capture_output=True, text=True).stdout.strip()
        return c + ("-dirty" if dirty else "")
    except Exception: return "unknown"


# ------------------------------------------------------------------ rows
def load_rows(world_dir, legend, force=False):
    rows, errors = [], []
    exdir = os.path.join(world_dir, "examples")
    files = sorted(os.path.join(dp, f) for dp, _, fs in os.walk(exdir) for f in fs if f.endswith(".sop"))
    comp = world.Compiler(legend, world.Stars(0, 8))
    for p in files:
        rep, doc = checkmod.check_file(p, {os.path.basename(os.path.abspath(world_dir)): legend}, require_text=True, force=force)
        if not rep.ok: errors += rep.lines(); continue
        by = doc.by_id(); rel = os.path.relpath(p, world_dir)
        for w in doc.top_level():
            text = w.value("_text"); wname = w.value("_world") or doc.directive("world")
            if text is None: continue
            if wname is not None and wname != os.path.basename(os.path.abspath(world_dir)):
                print(f"[rows] {rel}: wire {w.id} has _world={wname}, not this world ({os.path.basename(os.path.abspath(world_dir))}): skipped"); continue
            toks = tokenize(text); f = world.frame_of(w, by, legend)
            if f["shape"] == "ok" and legend.reader["predicate_role"] and not f.get("lemma"):
                f["lemma"] = comp.lemma_for(f["event"], toks, set())
            tl = w.get("_table"); table = [x.text for x in tl.atoms if x.kind == "word"] if tl is not None else None
            rows.append({"table": table, "id": f"{rel}#{w.id}", "file": rel, "text": text, "tokens": toks, "wire": w, "by": by, "frame": f, "template": w.value("_template"),
                         "depth": len(f["speakers"]), "source": w.value("_source", "?"),
                         # R81: a NEGATIVE example (`_negative=true`): a sentence of another world, written with the anchor role only; its
                         # target is MINUS the compiled state, so training pushes the state away from this world's anchor (one-vs-rest)
                         "negative": str(w.value("_negative", "")).lower() == "true"})
    return rows, errors, files


def content_kinds_of(rows, legend):
    ks = set()
    for r in rows:
        for fl in r["frame"]["roles"].values():
            for wd in world.filler_words(fl):
                k = legend.kind(wd)
                if k: ks.add(k)
        for sp in r["frame"]["speakers"]:
            k = legend.kind(sp or "")
            if k: ks.add(k)
    # D14 item 2: content kinds = the kinds that fill a question (or a speaker) in the training rows, plus the kinds the legend names in
    # reader.content_kinds; a kind that never answers a question (prefix and function words with their own kinds) is NOT content, so the
    # explained residual does not charge it. (Before: every kind with 2+ lexicon words counted as content, which made "please", "you",
    # "want" unexplained words and short sentences no-sense in the diagram world.) Models trained earlier keep their stored schema.
    return ks | set(legend.reader.get("content_kinds") or [])


# ------------------------------------------------------------------ splits
def fit_threshold(present, absent):
    """the calibration RULE (judgment 752853c §2): the threshold that maximises the balanced present / absent accuracy on the calibration rows;
    candidates = the midpoints between consecutive distinct calibration values; ties: the lowest"""
    present, absent = np.asarray(present, float), np.asarray(absent, float)
    v = np.unique(np.concatenate([present, absent]))
    cands = (v[:-1] + v[1:]) / 2 if len(v) > 1 else v
    if len(present) == 0 or len(absent) == 0:      # degenerate (nan means): the original loop, unchanged
        return float(max(cands, key=lambda t: ((present >= t).mean() + (absent < t).mean()) / 2 - 1e-12 * t))
    # same value as the loop above, in O(n log n) instead of O(n^2) (the loop was ~70 % of the post-training time of a big world): counts by
    # binary search, then the same float operations ((count / n) + (count / n)) / 2 - 1e-12 * t; np.argmax = the first (lowest) maximum, like max()
    sp, sa = np.sort(present), np.sort(absent)
    hit_p = (len(sp) - np.searchsorted(sp, cands, side="left")) / len(sp)      # present >= t
    hit_a = np.searchsorted(sa, cands, side="left") / len(sa)                  # absent < t
    return float(cands[int(np.argmax((hit_p + hit_a) / 2 - 1e-12 * cands))])


def make_splits(rows, legend, hints, seed, cal_forms=False):
    share = hints.get("heldout_sentence_share", 0.1)
    t2split = {t: name for name, ts in hints.get("template_splits", {}).items() for t in ts}
    no_new = hints.get("new_identities") == "none" or str(hints.get("new_identities", "")).startswith("none")
    new_ids = set() if no_new else set(hints.get("new_identities", [])); defs = {"seed": seed, "heldout_sentence_share": share,
                                                          "template_splits": hints.get("template_splits", {}), "source": "split_hints.json" if hints else "automatic"}
    if not new_ids and not no_new:    # automatic (spec 6.4): new identities per kind
        by_kind = collections.defaultdict(set)
        for r in rows:
            for fl in r["frame"]["roles"].values():
                for wd in world.filler_words(fl):
                    if legend.kind(wd): by_kind[legend.kind(wd)].add(wd)
        for k, ws in by_kind.items():
            if len(ws) >= 6:
                new_ids |= set(sorted(ws, key=lambda w: h01(seed, "id", w))[:max(1, len(ws) // 9)])
    named = set(hints.get("template_splits", {})) | set(hints.get("file_splits", {}).values())
    if hints.get("heldout_formulations") is not None and str(hints["heldout_formulations"]).startswith("none"):
        defs["heldout_formulations"] = {"by": "none", "reason": hints["heldout_formulations"]}
    elif not any(str(n).startswith("heldout_formulations") for n in named):
        # automatic held-out FORMULATIONS (spec 6.4): by template when the examples are templated, else by role order
        templated = any(r["template"] for r in rows)
        keys = sorted({(r["template"] if templated else "order:" + role_order(r)) for r in rows if (r["template"] or not templated)})
        if len(keys) >= 7:
            held = set(sorted(keys, key=lambda s: h01(seed, "form", s))[:max(1, len(keys) * 15 // 100)])
            for s in held: t2split[s] = "heldout_formulations"
            defs["heldout_formulations"] = {"by": "template" if templated else "role order (the order of the roles' fillers in the sentence, with depth)",
                                            "held_out": sorted(held)}
    defs["new_identities"] = sorted(new_ids); dmin = hints.get("heldout_depth_min"); defs["heldout_depth_min"] = dmin
    fsplit = hints.get("file_splits", {}); defs["file_splits"] = fsplit
    out = collections.defaultdict(list)
    for r in rows:
        words = {w for fl in r["frame"]["roles"].values() for w in world.filler_words(fl)} | set(r["frame"]["speakers"])
        key = r["template"] if r["template"] in t2split else "order:" + role_order(r)
        if r["file"] in fsplit: s = fsplit[r["file"]]
        elif words & new_ids: s = "new_identities"
        elif key in t2split: s = t2split[key]
        elif dmin is not None and r["depth"] >= dmin: s = "heldout_depth"
        elif h01(seed, "sent", r["text"]) < share: s = "heldout_sentences"
        else: s = "train"
        if cal_forms and s.startswith("heldout_formulations") and h01(seed, "calform", r["text"]) < 0.5:
            s = "calibration_" + s           # round 4: the calibration half of a held-out formulation split (never reported, never trained)
        r["split"] = s; out[s].append(r["id"])
    if cal_forms:
        defs["calibration_of_heldout_formulations"] = ("each heldout_formulations* split is cut in two halves by hash (seed, 'calform', text): "
            "calibration_<split> sets the presence thresholds together with the training sample; <split> is reported; disjoint (rule 25)")
    return defs, out


def role_order(r):
    """the clustering key of a non-templated sentence (spec 6.4): its depth and the order in which the roles' fillers occur"""
    pos = {}
    for role, fl in r["frame"]["roles"].items():
        hw = head_word(fl)
        if hw in r["tokens"]: pos[role] = r["tokens"].index(hw)
    return f"d{r['depth']}:" + ">".join(sorted(pos, key=pos.get)) + (":neg" if r["frame"]["neg"] else "")


def signature(r, legend):
    """the formulation of a sentence: tokens with the filler words replaced by their kind"""
    fill = {w for fl in r["frame"]["roles"].values() for w in world.filler_words(fl)} | set(r["frame"]["speakers"])
    return " ".join((legend.kind(t) or "?") if t in fill or legend.lemma_of(t) in fill else t for t in r["tokens"])


# ------------------------------------------------------------------ schema
def build_schema(rows, legend):
    ok = [r["frame"] for r in rows if r["frame"]["shape"] == "ok"]; n = max(1, len(ok)); roles = {}
    for r in legend.roles:
        fs = [f["roles"][r] for f in ok if r in f["roles"]]
        if not fs: continue
        shapes = collections.Counter(x[0] for x in fs); ents = [x for x in fs if x[0] == "entity"]
        # diagram-vss-demo patch: a set role of entities ("members=$a & $b") has "set" fillers; its members are entities, so the role's
        # head kinds come from them (without this the schema has no head_kinds and reading the set role fails)
        ents += [m for x in fs if x[0] == "set" for m in x[1:] if m and m[0] == "entity"]
        if ents and shapes["entity"] == 0: shapes["entity"] = len(ents)
        kinds = sorted({legend.kind(x[1]) for x in fs if x[0] in ("word", "negword") and legend.kind(x[1])})
        rs = {"rate": len(fs) / n, "shapes": dict(shapes), "main": "entity" if shapes["entity"] >= shapes["word"] + shapes["negword"] else "word",
              "kinds": kinds, "negword": shapes["negword"] > 0}
        if ents:
            rs["head_kinds"] = sorted({legend.kind(x[1]) for x in ents if legend.kind(x[1])})
            at = [x[2] for x in ents if x[2] is not None]; dt = [x[3] for x in ents if x[3] is not None]
            rs["attr_kinds"] = sorted({legend.kind(a[1]) for a in at if a[0] in ("word", "negword") and legend.kind(a[1])})
            rs["attr_neg"] = any(a[0] == "negword" for a in at); rs["attr_rate"] = len(at) / len(ents)
            rs["det_kinds"] = sorted({legend.kind(d) for d in dt if legend.kind(d)}); rs["det_rate"] = len(dt) / len(ents)
        roles[r] = rs
    setr = set(legend.reader.get("set_roles") or [])
    core = [r for r, rs in roles.items() if rs["rate"] >= 0.95 and r not in setr]
    anchor = "core roles" if core else ("predicate" if legend.reader["predicate_role"] else None)
    if not core and not legend.reader["predicate_role"]:
        # R79: a world with no always-present question has no structure anchor: the structure score falls back to the mean over every
        # role's top (weak when most roles are absent) and no frame is 'incomplete' by a role. Declare an anchor instead: a closed-value
        # role present in every example (an intent / world marker), or a predicate role. Rounds before R79 silently took the most
        # frequent role as the core, which made frames incomplete whenever that optional role was absent (SNIPS per-intent worlds, R75).
        print(f"[schema] WARNING: no question is present in >= 95% of the training rows and no predicate role: no structure anchor; "
              f"declare one (a closed-value role present in every example, or reader.predicate_role); structure score = mean over all roles")
    sk = sorted({legend.kind(s) for f in ok for s in f["speakers"] if s and legend.kind(s)})
    return {"roles": roles, "role_order": [r for r in legend.roles if r in roles], "core_roles": core, "structure_anchor": anchor, "speaker_kinds": sk,
            "max_depth": max([len(f["speakers"]) for f in ok] or [0]), "neg_event": any(f["neg"] for f in ok),
            "single_event": next(iter(legend.events)) if len(legend.events) == 1 else None,
            "unsupported_shapes": dict(collections.Counter(r["frame"]["shape"] for r in rows if r["frame"]["shape"] != "ok"))}


# ------------------------------------------------------------------ evaluation
def head_word(fl):
    if fl is None: return None
    if fl[0] in ("word", "negword", "entity"): return fl[1]
    if fl[0] in ("set", "alt"): return json.dumps(sorted(world.filler_heads(fl)))     # a set: its members' heads, order-free
    return json.dumps(fl)


class Calib:
    """(correct, margin) per axis -> accuracy, margin distribution, confident-wrong at tau, coverage, abstention split, acc-vs-coverage"""
    def __init__(self): self.rows = collections.defaultdict(list)
    def add(self, axis, ok, margin): self.rows[axis].append((bool(ok), float(margin)))
    def report(self, axis, tau):
        v = np.array(self.rows[axis]); ok, mg = v[:, 0].astype(bool), v[:, 1]; conf = mg >= tau
        return {"n": int(len(v)), "acc": float(ok.mean()), "margin_mean": float(mg.mean()), "margin_p10": float(np.percentile(mg, 10)),
                "tau": tau, "coverage": float(conf.mean()), "confident_wrong": float((conf & ~ok).mean()),
                "abstain_right": float((~conf & ok).mean()), "abstain_wrong": float((~conf & ~ok).mean()),
                "acc_at_coverage": {f"{t:.2f}": [float(ok[mg >= t].mean()) if (mg >= t).any() else None, float((mg >= t).mean())] for t in TAUS}}


def lexical_baseline(train_rows, legend, schema):
    """order baseline (rule 9): for each role, the filler is the token at the rank (among tokens of the role's head kinds) that held it
    most often in training; absent if the sentence has no token at that rank"""
    rank = {}
    for r, rs in schema["roles"].items():
        kinds = set(rs.get("head_kinds") or rs["kinds"]); c = collections.Counter()
        for row in train_rows:
            fl = row["frame"]["roles"].get(r); hw = head_word(fl)
            cand = [t for t in row["tokens"] if legend.kind(t) in kinds]
            c[cand.index(hw) if hw in cand else -1] += 1
        rank[r] = (c.most_common(1)[0][0] if c else -1, sorted(kinds))
    def predict(tokens):
        out = {}
        for r, (k, kinds) in rank.items():
            cand = [t for t in tokens if legend.kind(t) in set(kinds)]
            out[r] = cand[k] if 0 <= k < len(cand) else None
        return out
    return predict, {r: v[0] for r, v in rank.items()}


def bag_baseline(train_rows, legend, schema):
    """the LEXICAL BAG baseline of spec 6.4, trained on the training rows: no order. Role presence = the share of training sentences with the
    same bag of non-filler words that fill the role (the overall share for an unseen bag, read as present when >= 0.5); filler = the candidate
    token (of the role's head kinds) with the highest training rate P(word fills r | word in the sentence); ties broken alphabetically
    (no position information); a word never seen in training scores 0."""
    fill, present, bags, rate = collections.defaultdict(collections.Counter), collections.Counter(), collections.defaultdict(lambda: collections.defaultdict(list)), collections.defaultdict(list)
    kinds = {r: set(rs.get("head_kinds") or rs["kinds"]) for r, rs in schema["roles"].items()}
    fillk = set().union(*kinds.values()) if kinds else set()
    for row in train_rows:
        toks = set(row["tokens"]); bag = frozenset(t for t in toks if legend.kind(t) not in fillk)
        for t in toks: present[t] += 1
        for r in schema["roles"]:
            hw = head_word(row["frame"]["roles"].get(r)); rate[r].append(hw is not None); bags[r][bag].append(hw is not None)
            if hw is not None: fill[r][hw] += 1
    def predict(tokens):
        toks = set(tokens); bag = frozenset(t for t in toks if legend.kind(t) not in fillk); out = {}
        for r in schema["roles"]:
            b = bags[r].get(bag); p = np.mean(b) if b else (np.mean(rate[r]) if rate[r] else 0)
            if p < 0.5: out[r] = None; continue
            cand = sorted(t for t in toks if legend.kind(t) in kinds[r])
            out[r] = max(cand, key=lambda t: fill[r][t] / present[t] if present[t] else 0.0) if cand else None
        return out
    return predict


STRUCT_MODES = (("estimated", {}), ("fit estimate", {"estimator": "fit"}), ("gate-count estimate", {"estimator": "gates"}),
                ("kind-count estimate", {"estimator": "kinds"}), ("depth given", {"force_depth": True}), ("depth and negation given", {"force": True}),
                ("presence not decided", {"presence": "all"}), ("pooled midpoint (comparison)", {"alt_th": True}))


def evaluate(reader, rows, legend, schema, tau, filt, lexical, n_max, rng_seed=0, bag=None, seen_words=frozenset(), modes="all"):
    """one split. FULL is reported four ways side by side (author C3, judgment e9274a9 Q6): `FULL` = the depth ESTIMATED by the primary
    estimator (the open level gates passed, when the legend names level openers; else the fit), what `sop formalize` does; `FULL [fit
    estimate]` = the depth estimated by the fit (the check); depth GIVEN (as the repository scripts); depth and negation GIVEN. The negation
    is chosen by the fit unless given. All other axes use the primary mode."""
    rs = rows if len(rows) <= n_max else [rows[i] for i in sorted(np.random.default_rng(rng_seed).choice(len(rows), n_max, replace=False))]
    cal = Calib(); acc = collections.defaultdict(list); status = collections.Counter(); resid = []; ids = (f"e{i}" for i in range(10 ** 9)); full_rows = []
    pred, drop = legend.reader["predicate_role"], tuple(legend.reader.get("full_excludes") or ())
    per_form = collections.defaultdict(list)
    for row in rs:
        g = row["frame"]
        for mode, kw in (STRUCT_MODES if modes == "all" else [m_ for m_ in STRUCT_MODES if m_[0] in ("estimated", "pooled midpoint (comparison)")]):
            kk = {}
            if kw.get("force_depth"): kk["force_depth"] = len(g["speakers"])
            if kw.get("force"): kk["force"] = (len(g["speakers"]), g["neg"])
            if kk and g["shape"] != "ok": kk = {}
            if kw.get("estimator"): kk["estimator"] = kw["estimator"]
            if kw.get("presence"):
                if not getattr(reader, "_eval_presence_all", False): continue                 # only with --also_presence_all (round 3, run D)
                kk["presence"] = kw["presence"]
            saved_th = None
            if kw.get("alt_th"):
                if not getattr(reader, "_eval_alt_th", None): continue                       # the pooled midpoint of the same calibration rows
                saved_th = reader.th; reader.th = dict(reader.th, **reader._eval_alt_th)
            if mode in ("fit estimate", "gate-count estimate", "kind-count estimate") and not legend.reader.get("level_openers"): continue
            if {"gates": "gate-count estimate", "kinds": "kind-count estimate", "fit": "fit estimate"}[reader.cfg.get("depth_estimator", "gates")] == mode: continue  # = the primary
            wires, f, info = reader.formalize(row["text"], 0, ids, filt, table=row.get("table"), **kk)
            if saved_th is not None: reader.th = saved_th
            f_ok = f["shape"] == "ok"; same = lambda d: f_ok and g["shape"] == "ok" and world.canon(f, pred, d) == world.canon(g, pred, d)
            label = "" if mode == "estimated" else f" [{mode}]"
            acc["FULL" + label].append(same(drop))
            if mode == "estimated": full_rows.append((row["id"], bool(same(drop))))        # per-row FULL, for paired comparisons (activate.py)
            if mode in ("presence not decided", "pooled midpoint (comparison)"):
                for r in schema["role_order"]:
                    acc[f"role {r} [{mode}]"].append(json.dumps(world.reduce_filler(g["roles"].get(r), drop)) == json.dumps(world.reduce_filler(f["roles"].get(r) if f_ok else None, drop)))
                acc[f"heads FULL (model) [{mode}]"].append(all(head_word(g["roles"].get(r)) == head_word(f["roles"].get(r) if f_ok else None)
                                                                             for r in schema["role_order"]))
            if drop: acc["FULL incl. " + "+".join(drop) + " (previous definition)" + label].append(same(()))
            if mode in ("estimated", "pooled midpoint (comparison)") and f_ok:
                # presence per role (roles with a presence threshold): present read present / absent read absent; with the product
                # readout also the share of "present" readings that ABSTAIN (the role's margin = min(identity, presence) < tau)
                for r in schema["role_order"]:
                    if reader.th.get("presence", {}).get(r) is None: continue
                    gp, pp = g["roles"].get(r) is not None, f["roles"].get(r) is not None
                    acc[f"presence {r}: present read present{label}" if gp else f"presence {r}: absent read absent{label}"].append(pp if gp else not pp)
                    if pp and mode == "estimated":
                        ab = f["margins"].get(r, 1.0) < tau; acc[f"presence {r}: share of 'present' readings that abstain"].append(ab)
                        acc[f"presence {r}: share of FALSE 'present' readings that abstain" if not gp else f"presence {r}: share of true 'present' readings that abstain"].append(ab)
            if mode != "estimated": continue
            status[info["status"]] += 1; resid.append(info["residual"]); per_form[signature(row, legend)].append(same(drop))
            acc["structure (depth, negation)"].append(f_ok and len(f["speakers"]) == len(g["speakers"]) and f["neg"] == g["neg"])
            if f.get("depth_gates") is not None: acc["depth estimate: open-gate count"].append(f["depth_gates"] == len(g["speakers"]))
            prim = reader.cfg.get("depth_estimator", "gates")
            pv = {"gates": f.get("depth_gates"), "kinds": f.get("depth_kinds"), "fit": f.get("depth_fit")}[prim]
            if pv is not None and legend.reader.get("level_openers"): acc[f"depth estimate: primary ({prim})"].append(pv == len(g["speakers"]))
            if f.get("depth_fit") is not None: acc["depth estimate: fit (check)"].append(f["depth_fit"] == len(g["speakers"]))
            if f.get("depth_kinds") is not None: acc["depth estimate: opener-kind count"].append(f["depth_kinds"] == len(g["speakers"]))
            mg = f.get("margins", {})
            for r in legend.reader.get("set_roles") or []:     # set roles: the exact set, and the first gold member in the decoded set (8c's "condition-1")
                gw = world.filler_heads(g["roles"].get(r)); pw = set(world.filler_heads(f["roles"].get(r))) if f_ok else set()
                acc[f"set {r}: exact"].append(set(gw) == pw)
                if gw: acc[f"set {r}: first gold member in the decoded set"].append(gw[0] in pw if f_ok else False)
            if pred:
                ok = f_ok and f.get("lemma") == g.get("lemma"); acc["predicate (surface lemma)"].append(ok); cal.add("predicate", ok, mg.get("event", 0))
                acc["event type (synonym table)"].append(f_ok and f.get("event") == g.get("event"))
            if legend.reader.get("scope_terms"):
                ok = f_ok and f.get("scope") == g.get("scope"); acc["_scope (wide role / both / absent)"].append(ok); cal.add("scope", ok, mg.get("scope", 0))
                if g.get("scope") is not None: acc["_scope on two-quantifier sentences"].append(ok)
            lex = lexical(row["tokens"]); bg = bag(row["tokens"]) if bag else {}; heads_m, heads_l, heads_b = [], [], []
            for r in schema["role_order"]:
                gf, pf = g["roles"].get(r), f["roles"].get(r) if f_ok else None
                ok = json.dumps(world.reduce_filler(gf, drop)) == json.dumps(world.reduce_filler(pf, drop)); acc[f"role {r}"].append(ok)
                hm, hl, hb = head_word(gf) == head_word(pf), head_word(gf) == lex.get(r), head_word(gf) == bg.get(r)
                acc[f"head {r}"].append(hm); acc[f"lexical order head {r}"].append(hl); acc[f"lexical bag head {r}"].append(hb)
                heads_m.append(hm); heads_l.append(hl); heads_b.append(hb)
                if gf is not None and gf[0] == "entity" and gf[3] is not None or (pf is not None and pf[0] == "entity" and pf[3] is not None):
                    acc["determiner identity (outside FULL when the legend excludes it)"].append(bool(gf and pf and gf[0] == pf[0] == "entity" and gf[3] == pf[3]))
                # occupancy, three cases (spec 6.6): given with a known filler / given with an unknown filler / not given
                case = "not given" if gf is None else ("known filler" if head_word(gf) in seen_words else "unknown filler")
                acc[f"occupancy: {case}"].append((pf is not None) == (gf is not None))
                if gf is not None: cal.add(f"role {r}", ok, mg.get(r, 0)); cal.add("roles (pooled)", ok, mg.get(r, 0))
            for k, sp in enumerate(g["speakers"]):
                ok = f_ok and k < len(f["speakers"]) and f["speakers"][k] == sp; acc["speakers"].append(ok); cal.add("speakers", ok, mg.get(f"speaker.{k}", 0))
            acc["heads FULL (model)"].append(all(heads_m)); acc["heads FULL (lexical order baseline)"].append(all(heads_l))
            acc["heads FULL (lexical bag baseline, trained on the same training rows)"].append(all(heads_b))
    forms = sorted(((k, len(v), float(np.mean(v))) for k, v in per_form.items()), key=lambda x: (x[2], -x[1]))
    m = {"n": len(rs), "of": len(rows), "acc": {k: float(np.mean(v)) for k, v in acc.items()},
         "calibration": {ax: cal.report(ax, tau) for ax in cal.rows}, "residual_mean": float(np.mean(resid)) if resid else None,
         "status": dict(status), "worst_formulations": [{"formulation": k, "n": n, "FULL": v} for k, n, v in forms[:5]], "full_rows": full_rows}
    return m


def chance(reader, schema):
    out = {}
    for r, rs in schema["roles"].items():
        n = len(reader.cands(rs.get("head_kinds") or rs["kinds"])[0]); out[r] = 1 / n if n else None
    if reader.legend.reader["predicate_role"]: out["predicate"] = 1 / max(1, len(reader.legend.all_verbs()))
    return out


# ------------------------------------------------------------------ export
def export_routebook(m, path, lean=None):
    """the learned route book; with the position code also pos (40 x D), pc (K x D) and pos_max (B7). lean (a LeanTheta): the phase
    table is not held whole; its tables are written from the held rows and the redrawn initial rows (LeanTheta.export)"""
    import torch
    wrap = lambda x: np.angle(np.exp(1j * x)).astype(np.float32)
    if lean is None:
        th = (m.theta * m.root_mask).detach().cpu().numpy()
        tabs = {"path": wrap(th[m.ipath.cpu().numpy()]), "bg0": wrap(th[m.ibg0.cpu().numpy()]), "bg": wrap(th[m.ibg.cpu().numpy()]),
                "A": wrap(th[m.iA.cpu().numpy()]), "L": wrap(th[m.iL.cpu().numpy()])}
    else:
        tabs = lean.export({"path": m.ipath, "bg0": m.ibg0, "bg": m.ibg, "A": m.iA, "L": m.iL}, wrap)
    z = {"cats": np.array(m.cats), "codes": np.array(m.codes), **tabs,
         "logits": m.logits.detach().cpu().numpy().astype(np.float64), "gates": torch.sigmoid(m.logits).detach().cpu().numpy()}
    if getattr(m, "rel", None) is not None:
        z.update(rel=wrap(m.rel.detach().cpu().numpy()), rel_mask=m.rel_mask.cpu().numpy(), taker_mask=m.taker_mask.cpu().numpy())
    if "pos" in m.codes:
        z.update(pos=wrap(th[m.ipos.cpu().numpy()]), pc=wrap(th[m.ipc.cpu().numpy()]), pos_max=np.array(getattr(m, "pos_max", None) or 40))
    if getattr(m, "vo", None) is not None:
        z.update(vo=wrap(m.vo.detach().cpu().numpy()), verb_mask=m.verb_mask.cpu().numpy(), vo_nmax=np.array(m.vo_nmax), cue_mask=m.cue_mask.cpu().numpy())
    np.savez_compressed(path, **z)


# ------------------------------------------------------------------ FAST=1 (training/vss/FAST_TRAIN.md; off by default)
FAST = os.environ.get("FAST") in ("1", "2")
FAST2 = os.environ.get("FAST") == "2"      # FAST=2: FAST=1 + the chain recursions vectorised (V8.states_vec): equal within float tolerance, not bit for bit
_FAST_FN, _FAST_ITEMS, _FAST_MEMO = None, None, True


CHAIN_BYTES = 16 * 13     # bytes per (row, pair, dimension) one step holds at its peak, forward + backward (measured, FAST_TRAIN.md: ~12-14 complex128)


def fast_micro_groups(lens, mem_mb, Tg, D=1024):
    """FAST_MEM_MB: None when the batch's chain terms fit (estimated B x T(T-1)/2 x D x CHAIN_BYTES at its longest row T); else the rows
    sorted by length and cut into consecutive groups that fit (a row alone always forms a group): [(row positions, t_used or None)]"""
    est = lambda n, T: n * T * (T - 1) / 2 * D * CHAIN_BYTES / 2 ** 20
    lens = np.asarray(lens); T = int(lens.max())
    if est(len(lens), T) <= mem_mb: return None
    out, cur = [], []
    for r in np.argsort(-lens, kind="stable"):              # longest first: each group's own width is its first row's length
        if cur and est(len(cur) + 1, int(lens[cur[0]])) > mem_mb: out.append(cur); cur = []
        cur.append(int(r))
    out.append(cur)
    return [(sorted(g), (int(lens[g].max()) if int(lens[g].max()) < Tg else None)) for g in out]


def fast_procs():
    """FAST_PROCS (default: the CPUs this process may use, at most 8)"""
    try: n = len(os.sched_getaffinity(0))
    except AttributeError: n = os.cpu_count() or 1
    return max(1, int(os.environ.get("FAST_PROCS") or min(8, n)))


def _fast_call(i):
    from . import infer
    infer._MEMO = {} if _FAST_MEMO else None
    try: return _FAST_FN(_FAST_ITEMS[i])
    finally: infer._MEMO = None


def fast_map(fn, items, memo=True):
    """[fn(x) for x in items], in order, by a pool of FAST_PROCS forked processes (the reader and the rows are inherited, only the
    indices and the results cross the pipe); one process when FAST_PROCS = 1 or the list is short. fn reads with the numpy reader only
    (no torch in the children). memo: infer._MEMO on per item (the cleanups of one item are computed once)."""
    global _FAST_FN, _FAST_ITEMS, _FAST_MEMO
    _FAST_FN, _FAST_ITEMS, _FAST_MEMO = fn, list(items), memo
    try:
        n = fast_procs()
        if n <= 1 or len(_FAST_ITEMS) < 4 * n: return [_fast_call(i) for i in range(len(_FAST_ITEMS))]
        import multiprocessing as mp
        with mp.get_context("fork").Pool(n) as pool:
            return pool.map(_fast_call, range(len(_FAST_ITEMS)), chunksize=max(1, len(_FAST_ITEMS) // (n * 16)))
    finally: _FAST_FN, _FAST_ITEMS = None, None


# ------------------------------------------------------------------ VSA_CORR=phase (off by default; future-experiments.md, "The Rules and VSS in
# one space", item 2): a learned world-level correction of the chart before decoding. Unset: nothing below runs, the build is as before.
CORR = os.environ.get("VSA_CORR", "")
if CORR not in ("", "phase"): raise SystemExit(f"VSA_CORR={CORR!r}: expected unset or 'phase'")
CORR_BITS = 8          # the stored phases are on the 8-bit grid of export_web.quantize: Python's calibration and the browser read one rotation


def fit_corr(rd, rows, train, chart_of, model_dir):
    """VSA_CORR=phase: one phase vector c (D,) per world, applied by the reader as Sn -> exp(i c) * Sn (one element-wise rotation, a bind
    with a learned vector) before every cleanup. Fitted AFTER the route book, the route book frozen, on the trainer's own loss over the
    training rows: maximise mean_r Re<T_r, exp(i c) * S_r> / (|S_r| |T_r|), S_r = the reader's chart of row r (chart_of: the centre's state
    for a centre world), T_r = the compiled gold state (negative rows: minus it, as the trainer's target). |exp(i c_d)| = 1 keeps |S_r|, so
    the objective is sum_d Re(exp(i c_d) z_d) with z_d = sum_r S_rd conj(T_rd) / (|S_r| |T_r|): separable per dimension, maximised exactly
    by c_d = -arg z_d (no gradient steps, no learning rate). The phases are then put on the 8-bit grid (CORR_BITS). No regulariser: each
    c_d averages every training row. Writes model_dir/corr.npz, sets the reader's correction, returns the config.json record with the
    trainer's mean cosine before / after on the training rows (fitted in sample) and on every other split (not used by the fit)."""
    from .export_web import quantize, dequantize
    t0 = time.time(); D = rd.D
    def contrib(row):
        cs = chart_of(row)
        if cs is None or row["frame"]["shape"] == "unknown": return None
        S = cs[0]; T = rd.comp.wire(row["wire"], row["by"], row["tokens"]) * (-1.0 if row.get("negative") else 1.0)
        nS, nT = np.linalg.norm(S), np.linalg.norm(T)
        return None if nS < 1e-9 or nT < 1e-9 else S * np.conj(T) / (nS * nT)
    groups = collections.OrderedDict([("train (fit)", train)])
    tid = {id(r) for r in train}
    for r in rows:
        if id(r) not in tid and r["frame"]["shape"] != "unknown": groups.setdefault(r.get("split") or "?", []).append(r)
    per = {}
    for g, rs in groups.items():
        out = fast_map(contrib, rs, memo=False) if FAST else [contrib(r) for r in rs]
        per[g] = np.array([x for x in out if x is not None]).reshape(-1, D)
    z = per["train (fit)"].sum(0)
    if not len(per["train (fit)"]): raise SystemExit("VSA_CORR=phase: no training row has a chart and a target")
    phase = dequantize(quantize(-np.angle(z), CORR_BITS), CORR_BITS, D)
    np.savez(os.path.join(model_dir, "corr.npz"), corr=phase)
    rd.set_corr(phase); c = np.exp(1j * phase)
    rep = {}
    for g, W in per.items():
        if not len(W): continue
        b, a = np.real(W.sum(1)), np.real(W @ c)
        rep[g] = {"n": int(len(W)), "mean_cos_before": round(float(b.mean()), 5), "mean_cos_after": round(float(a.mean()), 5),
                  "rows_better": int((a > b).sum())}
    rec = {"kind": "phase", "switch": "VSA_CORR=phase", "file": "corr.npz", "bits": CORR_BITS, "D": int(D),
           "fit": "closed form, route book frozen: c_d = -arg sum_r S_rd conj(T_rd) / (|S_r| |T_r|) over the training rows (the trainer's loss), "
                  "put on the 8-bit grid", "applied": "infer.Reader.read: Sn = exp(i c) * S / |S| before every cleanup; residual (compiled): the same",
           "mean_abs_phase": round(float(np.mean(np.abs(phase))), 4), "coherence": round(float(np.abs(z).sum() / max(1, len(per["train (fit)"]))), 5),
           "cosine": rep, "t_fit_s": round(time.time() - t0, 1)}
    print(f"[corr] VSA_CORR=phase: fitted on {rep['train (fit)']['n']} training rows in {rec['t_fit_s']}s; trainer's mean cosine before -> after: "
          + "; ".join(f"{g} {v['mean_cos_before']:.4f} -> {v['mean_cos_after']:.4f} (n {v['n']})" for g, v in rep.items()), flush=True)
    return rec


# ------------------------------------------------------------------ memory-bounded training (the model, the batches)
STREAM_ROWS = 1024       # rows of the phase table drawn per chunk when it is regenerated (8 MB at D = 1024)


class LeanTheta:
    """the phase table theta of experiment/v8_gates.V8 (P x D float64; P = 3 K^2 + 4 K + 41 rows for K kinds: path, bigram, A and L per
    kind pair) WITHOUT the table itself. Only the rows that a training sentence reads with a non-zero weight are held, as one trainable
    parameter in the order of their row number (row 0, the root, first). Every other row has a gradient of exactly 0 at every step, so Adam
    leaves it at its initial value for the whole training: it is redrawn from the generator when the route book is written, never held.
    The initial values are those of V8's constructor, np.random.default_rng(200 + seed): V2 draws its table (P2 x D, P2 = K^2 + K + 1) and
    the identities (V x D), both discarded; then V4's table (P4 x D, row 0 set to 0), V5's position rows 16-39 (24 x D) and V6's L rows
    (K^2 x D) are drawn one after the other, so theta's rows are ONE contiguous stream of P x D uniform draws (same doubles, same order)."""
    def __init__(self, P, D, rng, skip_rows, held_rows, dtype, device):
        import torch
        for r0 in range(0, skip_rows, STREAM_ROWS): rng.uniform(-np.pi, np.pi, (min(STREAM_ROWS, skip_rows - r0), D))
        self.P, self.D, self.state0 = P, D, copy.deepcopy(rng.bit_generator.state)
        self.rows = np.unique(np.concatenate([[0], np.asarray(held_rows, dtype=np.int64)]))
        self.full2c = np.full(P, len(self.rows), dtype=np.int64); self.full2c[self.rows] = np.arange(len(self.rows))   # full row -> held row (or len = not held)
        vals = np.empty((len(self.rows), D))
        for r0, ch in self._stream(rng):
            sel = (self.rows >= r0) & (self.rows < r0 + len(ch)); vals[sel] = ch[self.rows[sel] - r0]
        vals[0] = 0.0                                                         # V4: th[0] = 0 (the root)
        self.theta = torch.nn.Parameter(torch.tensor(vals, dtype=dtype, device=device)); del vals

    def _stream(self, rng):
        for r0 in range(0, self.P, STREAM_ROWS): yield r0, rng.uniform(-np.pi, np.pi, (min(STREAM_ROWS, self.P - r0), self.D))

    def export(self, tables, wrap):
        """{name: index tensor of full rows} -> {name: wrap(theta[index]) as float32}, one pass over the regenerated stream"""
        rng = np.random.default_rng(); rng.bit_generator.state = self.state0
        flat = {n: t.cpu().numpy().reshape(-1) for n, t in tables.items()}
        out = {n: np.empty((len(f), self.D), dtype=np.float32) for n, f in flat.items()}
        held = self.theta.detach().cpu().numpy()
        for n, f in flat.items():
            c = self.full2c[f]; h = np.nonzero(c < len(self.rows))[0]
            for i in range(0, len(h), STREAM_ROWS): out[n][h[i:i + STREAM_ROWS]] = wrap(held[c[h[i:i + STREAM_ROWS]]])
        for r0, ch in self._stream(rng):
            for n, f in flat.items():
                sel = np.nonzero((f >= r0) & (f < r0 + len(ch)) & (self.full2c[f] == len(self.rows)))[0]
                if len(sel): out[n][sel] = wrap(ch[f[sel] - r0])
        return {n: out[n].reshape(tuple(tables[n].shape) + (self.D,)) for n in tables}


def reached_rows(m, sents):
    """the rows of V8's phase table that the sentences read with a non-zero weight (V8.states): path m[c_k]; bigram bg0[c_0] and
    bg[c_(k-1), c_k]; chain A[c_q, c_k] for q < k; chainL also L[c_q, c_k] for q > k. Padded positions and the other pairs of the T x T
    chain tensors are read with weight 0 (gradient exactly 0)."""
    ip, ib0, ib, iA, iL = (t.cpu().numpy() for t in (m.ipath, m.ibg0, m.ibg, m.iA, m.iL)); out = set()
    for toks in {tuple(s) for s in sents}:
        c = np.array([m.cat_id[m.w.cat[t]] for t in toks]); n = len(c); up = np.triu_indices(n, 1)
        if "path" in m.codes: out.update(ip[c].tolist())
        if "bigram" in m.codes: out.add(int(ib0[c[0]])); out.update(ib[c[:-1], c[1:]].tolist())
        if "chain" in m.codes or "chainL" in m.codes: out.update(iA[c[:, None], c[None, :]][up].tolist())
        if "chainL" in m.codes: out.update(iL[c[None, :], c[:, None]][up].tolist())
    return np.array(sorted(out), dtype=np.int64)


def build_v8(v8, shim, D, seed, codes, device, sents):
    """experiment/v8_gates.V8 as train_one used to build it (V8(shim, D, np.random.default_rng(200 + seed), codes, device, 'closed')), with
    the same initial values, and the generator left in the same state, but without its whole-table copies: the constructor builds the
    STRUCTURE at D = 1 (names, kinds, index tables), then LeanTheta draws the phases at the real D and holds only the rows the training
    sentences reach. Returns (model, lean). With the position code (its rows come from a second generator) the full constructor is used
    and only its unused numpy copies are freed: (model, None)."""
    import torch
    rng = np.random.default_rng(200 + seed)
    if "pos" in codes:
        m = v8.V8(shim, D, rng, list(codes), device, gate_init="closed")
        m.np_model.theta = m.np_model._m = m.np_model._v = m.np_model.F = None       # v4.V4's numpy table, Adam moments, identities: unused
        return m, None
    m = v8.V8(shim, 1, np.random.default_rng(0), list(codes), device, gate_init="closed")
    K = len(m.cats); P2 = 1 + K * K + K; P = m.theta.shape[0]
    assert P == P2 + K + (K + 1) * K + 16 + K + 24 + K * K, "phase table layout differs from v2 / v4 / v5 / v6"
    m.np_model = None; m.D = D
    lean = LeanTheta(P, D, rng, P2 + len(shim.vocab), reached_rows(m, sents), m.dtype, device)
    m.theta = lean.theta; m.rng = rng
    m.root_mask = torch.ones(len(lean.rows), 1, dtype=m.dtype, device=device); m.root_mask[0] = 0
    return m, lean


class Compact:
    """the model as trainer.train_loop sees it with a LeanTheta: each batch gets a small phase table of its own, the held rows it reads
    plus one zero row for the entries no training sentence reads with a non-zero weight (padded positions, chain pairs q >= k), and
    V8.states runs unchanged on it (a shallow copy of the model with the batch's table and index tables)"""
    def __init__(self, m, lean, v8):
        import torch
        self.m, self.lean, self.v8 = m, lean, v8; self.f2c = torch.tensor(lean.full2c, device=m.device); self.nh = len(lean.rows)
    @property
    def theta(self): return self.lean.theta
    def states(self, cats, ids, mask, t_used=None, held=None):
        import torch
        if FAST: return self.states_fast(cats, ids, mask, t_used, held)
        m = self.m; c = cats if t_used is None else cats[:, :t_used]
        tabs = {"ipath": m.ipath, "ibg0": m.ibg0, "ibg": m.ibg, "iA": m.iA, "iL": m.iL}
        read = torch.cat([m.ipath[c].reshape(-1), m.ibg0[c[:, :1]].reshape(-1), m.ibg[c[:, :-1], c[:, 1:]].reshape(-1),
                          m.iA[c.unsqueeze(2), c.unsqueeze(1)].reshape(-1), m.iL[c.unsqueeze(1), c.unsqueeze(2)].reshape(-1)])
        held = torch.unique(self.f2c[read]); held = held[held < self.nh]
        c2b = torch.full((self.nh + 1,), len(held), dtype=torch.long, device=m.device); c2b[held] = torch.arange(len(held), device=m.device)
        v = copy.copy(m)
        for n, t in tabs.items(): setattr(v, n, c2b[self.f2c[t]])
        v.theta = torch.cat([self.lean.theta[held], torch.zeros(1, self.lean.D, dtype=m.dtype, device=m.device)])
        v.root_mask = torch.ones(len(held) + 1, 1, dtype=m.dtype, device=m.device)
        return self.v8.V8.states(v, cats, ids, mask, t_used=t_used)

    def states_fast(self, cats, ids, mask, t_used=None, held=None):
        """FAST=1. With held (the batch's held rows, sorted, computed on the host before training: train_one): the batch's own small
        phase table as states() builds it, but without torch.unique (a device -> host sync per step); the rows read only with weight 0
        (padded positions) point to the zero row. Without held (checks after training): one view of the model for every batch: the
        index tables point into the held rows themselves, an entry no training sentence reads points to the root row 0, which reads as 0
        (root mask 0; LeanTheta holds it at 0) and gets no gradient. V8.states_packed (FAST=2: states_vec) computes the chain pieces
        without the T x T tables."""
        import torch
        fn = self.v8.V8.states_vec if FAST2 else self.v8.V8.states_packed
        if held is not None:
            m = self.m; h = held.shape[0]
            c2b = torch.full((self.nh + 1,), h, dtype=torch.long, device=m.device); c2b[held] = torch.arange(h, device=m.device)
            v = copy.copy(m)
            for n in ("ipath", "ibg0", "ibg", "iA", "iL"): setattr(v, n, c2b[self.f2c[getattr(m, n)]])
            v.theta = torch.cat([self.lean.theta[held], torch.zeros(1, self.lean.D, dtype=m.dtype, device=m.device)])
            v.root_mask = torch.ones(h + 1, 1, dtype=m.dtype, device=m.device)
            return fn(v, cats, ids, mask, t_used=t_used)
        v = getattr(self, "_fast_view", None)
        if v is None:
            m = self.m; f2c = self.f2c.clone(); f2c[f2c == self.nh] = 0
            v = copy.copy(m)
            for n in ("ipath", "ibg0", "ibg", "iA", "iL"): setattr(v, n, f2c[getattr(m, n)])
            v.root_mask = torch.ones(self.nh, 1, dtype=m.dtype, device=m.device); v.root_mask[0] = 0
            self._fast_view = v
        v.theta = self.lean.theta
        return fn(v, cats, ids, mask, t_used=t_used)


class Shim:
    """the minimal world object experiment/v8_gates.V8 needs: vocab, idx, cat (word -> kind)"""
    def __init__(self, words_kinds):
        self.vocab = sorted(words_kinds); self.idx = {x: i for i, x in enumerate(self.vocab)}; self.cat = dict(words_kinds)


def train_one(a, legend, rows, splits, schema, seed, model_dir, run_dir):
    os.environ.setdefault("VSA_MIN_AVAILABLE_GB", "4")
    if a.device == "cpu": os.environ["CUDA_VISIBLE_DEVICES"] = ""
    sys.path.insert(0, EXP)
    import torch
    import trainer, v8_gates as v8
    from .infer import Reader
    torch.manual_seed(seed)
    idt = None
    if a.identities.startswith("table:"):     # run C of the isolation (judgment e9274a9 C2): v16's per-seed draw over the world vocabulary
        vp = a.identities.split(":", 1)[1]; vp = vp if os.path.isabs(vp) else os.path.join(os.path.dirname(legend.path), vp)
        idt = {"vocab": json.load(open(vp)), "rng_seed": 300 + seed, "marker_word": "<m>",
               "source": f"np.random.default_rng(300 + seed).uniform(-pi, pi, (len(vocab), D)) over {os.path.basename(vp)} (experiment/v16_reference)"}
    st = world.Stars(seed, a.D, a.star_seed, idt, getattr(a, "star_version", 1)); comp = world.Compiler(legend, st)
    wk = dict(legend.lexicon); n_tok = n_unk = 0
    for r in rows:
        for t in r["tokens"]:
            k = legend.kind(t); n_tok += 1
            if k is None: n_unk += 1; k = UNKNOWN_KIND                       # spec 6.3: no kind in the lexicon -> kind `unknown`
            wk.setdefault(t, k)
    centres = bool(legend.reader.get("centres")); msgs = getattr(a, "messages", None) or []
    for mm in msgs:                                                          # the centre reader trains on whole messages: their words too
        for t in mm["tokens"]: wk.setdefault(t, legend.kind(t) or UNKNOWN_KIND)
    wk.setdefault("<unknown>", UNKNOWN_KIND)                                 # the category exists in every route book (unseen words at inference)
    shim = Shim(wk); kinds_report = {"tokens": n_tok, "unknown_kind_tokens": n_unk, "unknown_share": n_unk / max(1, n_tok)}
    if centres:
        return train_centres(a, legend, rows, msgs, splits, schema, seed, model_dir, run_dir, st, comp, wk, shim, kinds_report)
    train = [r for r in rows if r.get("split") == "train" and r["frame"]["shape"] != "unknown"]
    order = []
    rng = np.random.default_rng(seed)
    if a.length_buckets:     # v11's batching (experiment/v11_wikisql): batches of similar length, the bucket order shuffled per epoch
        lens = np.array([len(r["tokens"]) for r in train]); srt = np.argsort(lens, kind="stable")
        for e in range(a.epochs):
            bk = [list(srt[i:i + a.batch]) for i in range(0, len(srt), a.batch)]; np.random.default_rng(seed * 100 + e).shuffle(bk)
            for b_ in bk: order += b_
    else:
        for e in range(a.epochs): order += list(rng.permutation(len(train)) if e > 0 or a.shuffle else range(len(train)))
    if a.max_train: order = order[:a.max_train]
    sents = [list(train[i]["tokens"]) for i in order]
    # memory bounded by one step: the targets (one compiled state per step, complex128) and the encoded batches are built per batch from
    # `order` when the loop needs them, not for every step at once; the missing-lemma count of the [train] line is the same count (each
    # training row compiled once, counted once per step it appears in)
    def target(j):
        r = train[order[j]]; return comp.wire(r["wire"], r["by"], r["tokens"]) * (-1.0 if r.get("negative") else 1.0)
    miss = {}
    for i in order:
        if i not in miss: n0 = comp.missing_lemma; comp.wire(train[i]["wire"], train[i]["by"], train[i]["tokens"]); miss[i] = comp.missing_lemma - n0
    comp.missing_lemma = sum(miss[i] for i in order); del miss
    n_neg = sum(1 for r in train if r.get("negative"))
    if n_neg: print(f"[train] seed {seed}: {n_neg} NEGATIVE examples among the {len(train)} training rows (target = minus the anchor state; R81)")
    print(f"[train] seed {seed}: {len(train)} training rows x {a.epochs} epoch(s) -> {len(sents)} steps' sentences; D={a.D}; kinds {len(set(wk.values()))}; "
          f"vocab {len(shim.vocab)}; predicate lemma not found in {comp.missing_lemma} targets", flush=True)
    ident = (lambda w: legend.lemma_of(w)) if legend.reader.get("identity") == "lemma" else (lambda w: w)   # reader.identity (legend.py)
    F = np.array([st.id(ident(w)) for w in shim.vocab])
    m, lean = build_v8(v8, shim, a.D, seed, a.code_list, a.device, sents); m.set_F(F)
    del F; m.F_np = None; st.cache.clear()           # the torch copy is the one used; the stars are recomputed (identical) when needed
    if lean is not None:
        print(f"[train] phase table: {len(lean.rows)} of {lean.P} rows reached by the training sentences, held and trained; the other "
              f"{lean.P - len(lean.rows)} keep their initial values (gradient exactly 0) and are redrawn for the route book | {trainer.mem_line()}", flush=True)
    if "pos" in a.code_list:
        m.pos_max = max(len(s_) for s_ in sents)        # the position term is OMITTED beyond the trained length (B7 (b), the stated behaviour)
        print(f"[train] position code (declared by the legend / --codes): positions 0-{m.pos_max - 1} trained, omitted beyond")
    params = [m.theta, m.logits]
    gg = legend.reader.get("gates_given") or {}
    if gg.get("open"): print(f"[train] gates GIVEN open (legend reader.gates_given, rule 20, not learned): {m.fix_gates(gg['open'], True)}")
    if gg.get("closed"): print(f"[train] gates GIVEN closed (legend reader.gates_given, rule 20, not learned): {m.fix_gates(gg['closed'], False)}")
    if "vorder" in a.code_list:   # the verb-order route: verb kinds = the kinds of the legend's verbs and level openers (given, like the kinds)
        verbs = set(legend.all_verbs())
        vk = sorted({k for w, k in legend.lexicon.items() if legend.lemma_of(w) in verbs or w in verbs} | set(legend.reader.get("level_openers") or []))
        cues = (legend.reader.get("gates_given") or {}).get("open") or []    # variant b: words introduced by a role cue are left to the chain
        print(f"[train] verb-order route (reader.codes / --codes): verb kinds {m.set_vorder(vk, nmax=int(legend.reader.get('vorder_nmax') or 4), cue_cats=cues)}; cue kinds {cues}"); params.append(m.vo)
    rel = legend.reader.get("rel_emitters")
    if rel:      # C2b beacon-relative emitters (GIVEN set of kinds, learned displacement): part of the world's reader block (quantifier v2)
        print(f"[train] beacon-relative emitters (given): {m.set_rel_emitters(rel['emitters'], rel['takers'])} -> takers {rel['takers']}"); params.append(m.rel)
    # trace (rule 11): one row, its kinds, and the terms of its target
    r0 = train[order[0]] if order else None
    if r0 is not None:
        print(f"[trace] text: {r0['text']}\n[trace] tokens/kinds: " + " ".join(f"{t}/{legend.kind(t)}" for t in r0['tokens']))
        print(f"[trace] gold frame: {world.canon(r0['frame'])}")
        print(f"[trace] target |S_world| = {np.linalg.norm(target(0)):.2f} (sqrt(D) per unit term = {np.sqrt(a.D):.1f}); initial gates all {float(torch.sigmoid(m.logits[0])):.2f} (closed start)")
    # a batch = the sentences order[i:j], encoded as m.encode(sents) encoded them (padded to the longest sentence of all steps, Tg); V8.states
    # computes the D-dimensional terms on the batch's own longest sentence only (t_used: the same function; the gates' gradient can differ
    # in the last bit, V8.states), unless --pad_to_longest (every batch computed at the full width Tg, bit for bit the previous trainer);
    # with --length_buckets each batch has its own width, as before
    Tg = max((len(s_) for s_ in sents), default=0)
    def batch_fn(i, j):
        cb, ib, mb = m.encode(sents[i:j]); T = cb.shape[1]; kw = {}
        if not a.length_buckets and T < Tg:
            pad = lambda x: torch.cat([x, torch.zeros(x.shape[0], Tg - T, dtype=x.dtype, device=x.device)], 1)
            cb, ib, mb = pad(cb), pad(ib), pad(mb); kw = {} if getattr(a, "pad_to_longest", False) else {"t_used": T}
        return cb, ib, mb, torch.tensor(np.array([target(k) for k in range(i, j)]), dtype=m.F.dtype, device=m.device), kw
    fast_loop = FAST and lean is not None and not a.length_buckets
    if fast_loop:
        # FAST=1: every training row encoded and its target compiled ONCE, held on the device (rows x D complex + rows x Tg indices;
        # graphq7: 40 MB), a batch = the rows order[i:j] gathered there: the same tensors as batch_fn's, without the per-step compile and
        # the host -> device copies. Memory: rows (not steps) x D x 16 bytes.
        uniq = sorted(set(order)); pos_of = {i: k for k, i in enumerate(uniq)}
        cA, iA_, mA = m.encode([list(train[i]["tokens"]) for i in uniq])
        if cA.shape[1] < Tg:
            padf = lambda x: torch.cat([x, torch.zeros(x.shape[0], Tg - x.shape[1], dtype=x.dtype, device=x.device)], 1)
            cA, iA_, mA = padf(cA), padf(iA_), padf(mA)
        tgA = torch.tensor(np.array([comp.wire(train[i]["wire"], train[i]["by"], train[i]["tokens"]) * (-1.0 if train[i].get("negative") else 1.0) for i in uniq]),
                           dtype=m.F.dtype, device=m.device)
        lens = np.array([len(s_) for s_ in sents]); rowpos = torch.as_tensor(np.array([pos_of[i] for i in order], dtype=np.int64), device=m.device)
        # the held rows each batch reads with a non-zero weight (reached_rows per row, as LeanTheta), as positions in lean.theta, for every
        # batch at once: one array on the device, sliced per step (no host -> device copy, no torch.unique per step)
        rowheld = [lean.full2c[reached_rows(m, [list(train[i]["tokens"])])] for i in uniq]
        hb = [np.unique(np.concatenate([rowheld[pos_of[order[k]]] for k in range(i, min(i + a.batch, len(sents)))])) for i in range(0, len(sents), a.batch)]
        hoff = np.concatenate([[0], np.cumsum([len(x) for x in hb])]); held_dev = torch.as_tensor(np.concatenate(hb), device=m.device); del hb, rowheld
        print(f"[fast] FAST=1: training loop with the rows encoded once ({len(uniq)} rows, targets {tgA.numel() * 16 / 2**20:.0f} MB on {m.device}), "
              f"chain pieces packed (V8.states_packed)" + (", chain recursions vectorised (FAST=2, V8.states_vec)" if FAST2 else "") + ", held rows per batch computed before training, the loss read only at the log lines", flush=True)
        mem_mb = float(os.environ.get("FAST_MEM_MB") or 0); n_split = [0, 0]
        if mem_mb: print(f"[fast] FAST_MEM_MB={mem_mb:g}: a batch whose chain terms would need more is computed in micro-batches of rows of "
                          f"similar length (fast_micro_groups; the gradients summed: equal up to float order on those steps only)", flush=True)
        def batch_fn(i, j):
            ix = rowpos[i:j]; T = int(lens[i:j].max()); b = i // a.batch
            kw = {} if (getattr(a, "pad_to_longest", False) or T >= Tg) else {"t_used": T}
            kw["held"] = held_dev[int(hoff[b]):int(hoff[b + 1])]
            if mem_mb and not getattr(a, "pad_to_longest", False):
                g = fast_micro_groups(lens[i:j], mem_mb, Tg, a.D)
                n_split[0] += 1
                if g is not None:
                    n_split[1] += 1; kw["micro"] = [(torch.as_tensor(x, device=m.device), tu) for x, tu in g]
            return cA[ix], iA_[ix], mA[ix], tgA[ix], kw
    t0 = time.time()
    tm = Compact(m, lean, v8) if lean is not None else m
    trainer.train_loop(tm, params, None, None, None, None, a.batch, a.lr, log_every=a.log_every, ckpt=None if a.no_ckpt else os.path.join(run_dir, f"ckpt_seed{seed}.pt"),
                       resume=a.resume, tag=f" seed {seed}", batch_fn=batch_fn, n=len(sents), stop_after=getattr(a, 'stop_after', 0), loss_every_step=getattr(a, 'loss_every_step', False),
                       **({"lazy_loss": True} if fast_loop else {}))
    t_train = time.time() - t0
    if fast_loop and mem_mb: print(f"[fast] FAST_MEM_MB: {n_split[1]} of {n_split[0]} steps computed in micro-batches", flush=True)
    os.makedirs(model_dir, exist_ok=True)
    export_routebook(m, os.path.join(model_dir, "routebook.npz"), lean)
    print(f"[export] route book written | {trainer.mem_line()}", flush=True)
    if getattr(a, "stop_after", 0):      # debugging / equivalence checks: the route book after stop_after steps, then the run ends
        z = np.load(os.path.join(model_dir, "routebook.npz"))
        for k in sorted(z.files): print(f"[stop_after] routebook {k} {z[k].dtype} {z[k].shape} sha256 {hashlib.sha256(np.ascontiguousarray(z[k]).tobytes()).hexdigest()[:16]}")
        print(f"[stop_after] stopped after {a.stop_after} steps: no calibration, no evaluation | {trainer.mem_line()}", flush=True); sys.exit(0)
    shutil.copyfile(legend.path, os.path.join(model_dir, "legend.json"))
    lexf = legend.raw.get("kinds", {}).get("lexicon", "kinds.tsv")
    if os.path.exists(os.path.join(legend.dir, lexf)): shutil.copyfile(os.path.join(legend.dir, lexf), os.path.join(model_dir, os.path.basename(lexf)))
    catalog = {"seed": seed, "star_seed": a.star_seed, "star_version": getattr(a, "star_version", 1), "star": ("star_version 2 (portable): sha256(seed + ':' + name)[:16] -> xoshiro128** -> D phases 2*pi*(u+0.5)/2**32 - pi; " if getattr(a, "star_version", 1) == 2 else "") + "identity of a word = sha256(star_seed + ':id:' + word)[:8] little-endian -> numpy default_rng -> "
               "D uniform phases in [-pi, pi); role vectors the same with the world seed and 'role:<id>' / 'op:<name>'",
               "words": {w: ({"kind": k, "lemma": legend.lemma[w]} if w in legend.lemma else {"kind": k}) for w, k in sorted(wk.items())},
               "schema": schema, "kinds_report": kinds_report, "identity_table": idt}
    with open(os.path.join(model_dir, "catalog.json"), "w") as f: json.dump(catalog, f, indent=1, sort_keys=True)
    cfg = {"world": a.world_name, "D": a.D, "seed": seed, "star_version": getattr(a, "star_version", 1), "language": a.language, "legend_sha256": legend.sha, "legend_version": legend.version,
           "training_code_commit": a.commit, "trained": datetime.datetime.now().isoformat(timespec="seconds"), "codes": list(a.code_list),
           "gate_init": "closed", "depth_estimator": a.depth_estimator, "presence_readout": "decided", "batch": a.batch, "lr": a.lr, "epochs": a.epochs, "n_train_steps_sentences": len(sents),
           "decoder": getattr(a, "decoder", "contract"), **activate.DECODERS[getattr(a, "decoder", "contract")],      # the contract rules (activate.py, class 1)
           "activation": getattr(a, "activation_report", None),
           "thresholds": {"tau": a.tau, "tau_source": "stated (the repository's v16 value), not fitted on any rows", "no_sense_share": 0.5,
                          "no_sense_source": "stated", "no_fit_residual": 0.9, "no_fit_source": "stated (dispatcher only, spec section 9)",
                          "presence": {}, "attr_presence": {}, "det_presence": {}, "scope_term": None, "set_member": {}}}
    with open(os.path.join(model_dir, "config.json"), "w") as f: json.dump(cfg, f, indent=1)
    # numpy (inference) vs torch (training) agreement on three rows
    rd = Reader(model_dir); worst = 0.0
    with torch.no_grad():
        for s in sents[:3]:
            St = tm.states(*m.encode([s]))[0].cpu().numpy(); Sn, _, _, _ = rd.chart(s)
            worst = max(worst, float(np.linalg.norm(St - Sn) / np.linalg.norm(St)))
    print(f"[export] numpy reader vs torch states: max relative difference {worst:.2e} (float32 phases in the route book)", flush=True)
    assert worst < 1e-3, "numpy inference does not reproduce the trained model"
    gates = {c: float(g) for c, g in zip(m.cats, torch.sigmoid(m.logits).detach().cpu().numpy())}
    del tm, m, lean, params                  # the torch model is not used after the export: freed before calibration and evaluation
    rd, calrep = calibrate_and_finish(a, legend, rows, schema, seed, model_dir, run_dir, cfg, train, rd)
    return rd, {"t_train_s": round(t_train, 1), "calibration": calrep, "gates": gates, "numpy_torch_diff": worst, "kinds": kinds_report}


def load_messages(world_dir):
    """examples/messages.jsonl (training/sketch/msg_to_world.py, CENTRES=1): one line per WHOLE message, the training row of the centre
    reader: {id, split (train | calib), tokens (normalized message), requests: [{row (the row id of its wire), tokens [a, b) (its span),
    centre (the token position of its action token, or null when the front end found none in the span)}]}"""
    p = os.path.join(world_dir, "examples", "messages.jsonl")
    return [json.loads(l) for l in open(p) if l.strip()] if os.path.exists(p) else []


def message_splits(msgs, rows, seed):
    """the centre reader is trained, calibrated and reported per MESSAGE: a message of examples/calib.sop goes to the calibration half or
    the reported half by a hash of its id (the row-level halving would split one message across both); its rows follow it"""
    by = {r["id"]: r for r in rows}
    for m in msgs:
        s = "train" if m["split"] == "train" else ("calibration_heldout_formulations" if h01(seed, "calform", m["id"]) < 0.5 else "heldout_formulations")
        m["_split"] = s
        for q in m["requests"]:
            if q["row"] in by: by[q["row"]]["split"] = s
    out = collections.defaultdict(list)
    for r in rows: out[r["split"]].append(r["id"])
    return out


def message_example(m, legend, wk, shim, centre_kinds, cat_id, centre_tokens=None):
    """a message -> the centre model's input: kinds, vocabulary ids, centre flags, the request of each centre, the request of each token;
    with centre_tokens (--centre_key event) also the phase-table row of each centre (its lemma's index, else the shared last row)"""
    kind = lambda t: wk.get(t) or wk.get(t.lower()) or legend.kind(t) or UNKNOWN_KIND
    toks = m["tokens"]; k = [cat_id[kind(t)] if kind(t) in cat_id else cat_id[UNKNOWN_KIND] for t in toks]
    isc = [kind(t) in centre_kinds for t in toks]; cent = [i for i in range(len(toks)) if isc[i]]
    label = [-1] * len(toks); creq = {}
    for j, q in enumerate(m["requests"]):
        for i in range(q["tokens"][0], q["tokens"][1]):
            if label[i] < 0: label[i] = j
        if q.get("centre") is not None and isc[q["centre"]]: creq[q["centre"]] = j
    ids = [shim.idx[t] if t in shim.idx else shim.idx["<unknown>"] for t in toks]
    out = {"k": k, "ids": ids, "isc": isc, "req": [creq.get(p, -1) for p in cent], "label": label}
    if centre_tokens is not None:
        row = {w: i for i, w in enumerate(centre_tokens)}; out["ce"] = [row.get(legend.lemma_of(toks[p]), len(centre_tokens)) for p in cent]
    return out


def train_centres(a, legend, rows, msgs, splits, schema, seed, model_dir, run_dir, st, comp, wk, shim, kinds_report):
    """the centre reader (legend reader.centres): one training row = one WHOLE message with one target per annotated request (the
    compiled state of its wire, the same frames as today, aligned to the request's centre = its action token), the words outside every
    span attached to no centre, and the spans as the attachment target (experiment/centres.py; research/attention/port/NOTES.md).
    Batches: messages in shuffled order, a batch closed when it holds >= --batch matched centres (about as many states per step as the
    one-request rows had). Then the same export, calibration (each calibration row read from the state of its centre) and reports."""
    import torch
    import trainer, centres as CM
    from .infer import Reader
    torch.manual_seed(seed)
    by = {r["id"]: r for r in rows}
    cats = sorted(set(wk.values())); cat_id = {c: i for i, c in enumerate(cats)}
    verbs = set(legend.all_verbs())
    centre_kinds = sorted({k for w, k in wk.items() if w in verbs or legend.lemma_of(w) in verbs})
    key = getattr(a, "centre_key", "kind")                 # run 2: the relative phases keyed by the centre's event token (B's E3d)
    centre_tokens = sorted(legend.all_verbs()) if key == "event" else None
    tr = [m for m in msgs if m.get("_split") == "train"]
    ex = [message_example(m, legend, wk, shim, set(centre_kinds), cat_id, centre_tokens) for m in tr]
    tgt = []
    for m in tr:
        tgt.append([comp.wire(by[q["row"]]["wire"], by[q["row"]]["by"], by[q["row"]]["tokens"]) if q["row"] in by else None for q in m["requests"]])
    for e, m, T in zip(ex, tr, tgt):        # a centre matched to a request whose row was not built (dropped by msg_to_world) trains as no request
        e["req"] = [r if r >= 0 and T[r] is not None else -1 for r in e["req"]]
    nreq = sum(len(m["requests"]) for m in tr); nmat = sum(sum(1 for r in e["req"] if r >= 0) for e in ex); ncent = sum(len(e["req"]) for e in ex)
    print(f"[train] seed {seed}: CENTRE reader: {len(tr)} training messages, {nreq} annotated requests, {ncent} centres ({nmat} matched to a request, "
          f"{ncent - nmat} not a request); centre kinds {centre_kinds}; phases keyed by the centre's {key}" + (f" ({len(centre_tokens)} event tokens + '*')" if centre_tokens else "")
          + f"; kinds {len(cats)}; vocab {len(shim.vocab)}; D={a.D}", flush=True)
    ident = (lambda w: legend.lemma_of(w)) if legend.reader.get("identity") == "lemma" else (lambda w: w)
    F = np.array([st.id(ident(w)) for w in shim.vocab])
    m = CM.CentreModel(cats, centre_kinds, F, a.D, np.random.default_rng(200 + seed), centre_tokens=centre_tokens)
    opt = torch.optim.Adam(m.parameters(), lr=a.lr, betas=(0.9, 0.999), eps=1e-8)
    rng = np.random.default_rng(seed); t0 = time.time(); step = 0; last = {}
    print(f"[train seed {seed}] start: {trainer.mem_line()}", flush=True)
    for ep in range(a.epochs):
        order = list(rng.permutation(len(tr))) if (ep > 0 or a.shuffle) else list(range(len(tr)))
        i = 0
        while i < len(order):
            chunk, nm = [], 0
            while i < len(order) and (nm < a.batch or not chunk):
                chunk.append(order[i]); nm += sum(1 for r in ex[order[i]]["req"] if r >= 0); i += 1
            b, pairs = CM.batch([ex[j] for j in chunk], len(cats))
            T = torch.tensor(np.array([tgt[chunk[mi]][r] for mi, r in pairs]), dtype=CM.CDT) if pairs else torch.zeros(0, a.D, dtype=CM.CDT)
            loss, terms = m.loss(b, T)
            assert torch.isfinite(loss), f"non-finite loss at step {step}"
            opt.zero_grad(set_to_none=True); loss.backward(); opt.step(); step += 1
            last = {k: round(float(v.item()), 3) for k, v in terms.items()}
            del loss, terms, b, T
            if step % a.log_every == 0 or step == 1:
                print(f"[train seed {seed}] epoch {ep} step {step} messages {i}/{len(order)} loss terms {last} ({time.time() - t0:.0f}s) | {trainer.mem_line()}", flush=True)
    t_train = time.time() - t0
    print(f"[train seed {seed}] end: {step} steps, last loss terms {last} | {trainer.mem_line()} ({t_train:.0f}s)", flush=True)
    os.makedirs(model_dir, exist_ok=True)
    np.savez_compressed(os.path.join(model_dir, "routebook.npz"), **m.export())
    shutil.copyfile(legend.path, os.path.join(model_dir, "legend.json"))
    lexf = legend.raw.get("kinds", {}).get("lexicon", "kinds.tsv")
    if os.path.exists(os.path.join(legend.dir, lexf)): shutil.copyfile(os.path.join(legend.dir, lexf), os.path.join(model_dir, os.path.basename(lexf)))
    catalog = {"seed": seed, "star_seed": a.star_seed, "star_version": getattr(a, "star_version", 1),
               "words": {w: ({"kind": k, "lemma": legend.lemma[w]} if w in legend.lemma else {"kind": k}) for w, k in sorted(wk.items())},
               "schema": schema, "kinds_report": kinds_report, "identity_table": None}
    with open(os.path.join(model_dir, "catalog.json"), "w") as f: json.dump(catalog, f, indent=1, sort_keys=True)
    cfg = {"world": a.world_name, "D": a.D, "seed": seed, "star_version": getattr(a, "star_version", 1), "language": a.language, "legend_sha256": legend.sha, "legend_version": legend.version,
           "training_code_commit": a.commit, "trained": datetime.datetime.now().isoformat(timespec="seconds"), "codes": ["centres"],
           "reader_kind": "centres (one state per centre; experiment/centres.py)", "centre_kinds": centre_kinds, "centre_key": key, "attach_threshold": 0.5, "null_threshold": 0.5,
           "depth_estimator": a.depth_estimator, "presence_readout": "decided", "batch": a.batch, "batch_unit": "matched centres (>= batch per step)",
           "lr": a.lr, "epochs": a.epochs, "n_train_steps": step, "n_train_messages": len(tr),
           "decoder": getattr(a, "decoder", "contract"), **activate.DECODERS[getattr(a, "decoder", "contract")], "activation": None,
           "thresholds": {"tau": a.tau, "tau_source": "stated (the repository's v16 value), not fitted on any rows", "no_sense_share": 0.5,
                          "no_sense_source": "stated", "no_fit_residual": 0.9, "no_fit_source": "stated (dispatcher only, spec section 9)",
                          "presence": {}, "attr_presence": {}, "det_presence": {}, "scope_term": None, "set_member": {}}}
    with open(os.path.join(model_dir, "config.json"), "w") as f: json.dump(cfg, f, indent=1)
    rd = Reader(model_dir); worst = 0.0
    with torch.no_grad():                   # numpy (inference) vs torch (training) agreement on three messages
        for e, mm in [(e, mm) for e, mm in zip(ex, tr) if any(e["isc"])][:3]:
            b, _ = CM.batch([e], len(cats)); St = m.states(b)[0].numpy(); _, _, _, Sn = rd.centre_chart(mm["tokens"])
            worst = max(worst, float(np.linalg.norm(St - Sn) / np.linalg.norm(Sn)))
    print(f"[export] numpy reader vs torch centre states: max relative difference {worst:.2e}", flush=True)
    assert worst < 1e-3, "numpy inference does not reproduce the trained centre model"
    # each row is read for calibration from the state of the centre matched to it in its message (the members by the learned attachment)
    row_msg = {q["row"]: (mm, q) for mm in msgs for q in mm["requests"] if q.get("centre") is not None}
    cache = {}
    def chart_of(row):
        if row["id"] not in row_msg: return None
        mm, q = row_msg[row["id"]]
        if mm["id"] not in cache: cache[mm["id"]] = rd.centre_chart(mm["tokens"])
        kept, _, R, S = cache[mm["id"]]
        k = next((j for j, p in enumerate(R["centres"]) if kept[p] == q["centre"]), None)
        if k is None: return None
        return S[k], [mm["tokens"][kept[j]] for j in rd.centre_members(R, k)]
    train_rows = [r for r in rows if r.get("split") == "train" and r["frame"]["shape"] != "unknown"]
    rd, calrep = calibrate_and_finish(a, legend, rows, schema, seed, model_dir, run_dir, cfg, train_rows, rd, chart_of)
    return rd, {"t_train_s": round(t_train, 1), "calibration": calrep, "gates": {}, "numpy_torch_diff": worst, "kinds": kinds_report,
                "centres": {"messages": len(tr), "requests": nreq, "centres": ncent, "matched": nmat, "steps": step}}


def calibrate_and_finish(a, legend, rows, schema, seed, model_dir, run_dir, cfg, train, rd, chart_of=None):
    """the presence thresholds set on calibration rows (rule 25), config.json rewritten with them, background.npz; -> (reader, calibration report).
    chart_of(row) -> (state, tokens) the row is read with, or None to leave the row out (default: the chart of the row's own tokens; the
    centre reader passes the state of the centre matched to the row in its message)"""
    from .infer import Reader
    chart_of = chart_of or (lambda row: (rd.chart(row["tokens"])[0], row["tokens"]))
    if CORR: cfg["correction"] = fit_corr(rd, rows, train, chart_of, model_dir)     # VSA_CORR=phase: before the calibration, which reads through it
    # calibration rows (rule 25): a sample of the TRAINING split, never the scored rows
    pos = [r for r in train if not r.get("negative")]      # calibration rows: never a negative example
    cal_rows = [pos[i] for i in sorted(np.random.default_rng(1234 + seed).choice(len(pos), min(a.n_cal, len(pos)), replace=False))]
    def calibrate(crow):
        """thresholds = midpoints of the mean present / absent ratios on the given calibration rows (read with the gold structure)"""
        stats = collections.defaultdict(lambda: {"present": [], "absent": []})
        prefetch(crow)
        for row in crow: add_row(row, stats)
        if os.environ.get("CAL_FALLBACK") == "train": fallback_rows(crow, stats)
        return thresholds_of(stats)
    def row_entries(row):
        """one calibration row's ratios as (stats key, class, value) in the order add_row appends them (the body of calibrate's loop
        before CAL_FALLBACK; unchanged)"""
        out = []; g = row["frame"]
        if g["shape"] != "ok": return out
        cs = chart_of(row)
        if cs is None: return out
        S, toks = cs
        f = rd.read(S, toks, force=(len(g["speakers"]), g["neg"]), table=row.get("table"))
        # diagram-vss-demo patch: attribute / determiner ratios read with every role read (presence 'all'), so that a role whose
        # training rate is under 0.5 (landmark, source, target) still gets its ratios measured on the rows that fill it
        fa = rd.read(S, toks, force=(len(g["speakers"]), g["neg"]), table=row.get("table"), presence="all")
        st_ = legend.reader.get("scope_terms") or {}
        for r in legend.reader.get("set_roles") or []:      # set members: the gold members vs the other candidates of the table
            mr = f["presence"].get(r + ".members") or {}; gold = set(world.filler_heads(g["roles"].get(r)))
            for col, x in mr.items(): out.append((("set_member", r), "present" if col in gold else "absent", x))
        for r in schema["role_order"]:
            gf = g["roles"].get(r)
            if st_ and gf is not None and gf[0] == "entity" and r + ".wide" in f["presence"]:
                d = gf[3]; w_, q_ = f["presence"][r + ".wide"], f["presence"][r + ".q"]
                if d in st_.get("wide", []): out += [(("scope_term", "_"), "present", w_), (("scope_term", "_"), "absent", q_)]
                elif d in st_.get("q", []): out += [(("scope_term", "_"), "present", q_), (("scope_term", "_"), "absent", w_)]
                else: out += [(("scope_term", "_"), "absent", w_), (("scope_term", "_"), "absent", q_)]
            out.append((("presence", r), "present" if gf is not None else "absent", f["presence"].get(r, 0)))
            if gf is not None and gf[0] == "entity":
                for part, idx in (("attr", 2), ("det", 3)):
                    if r + "." + part in fa["presence"]: out.append(((part + "_presence", r), "present" if gf[idx] is not None else "absent", fa["presence"][r + "." + part]))
        return out
    # FAST=1 (FAST_TRAIN.md): each row is read once per run (calibrate runs twice, on the training sample and again with the held-out
    # calibration half; the reads do not depend on the stats), the rows are read by a pool of forked processes (FAST_PROCS), and the two
    # reads of a row share their cleanups (infer._MEMO). The entries are applied in the same order: the same thresholds, bit for bit.
    fast = FAST; cache = {}
    def prefetch(rs_):
        if not fast: return
        todo = list({id(r): r for r in rs_ if id(r) not in cache}.values())
        for r, e in zip(todo, fast_map(row_entries, todo)): cache[id(r)] = e
    def add_row(row, stats):
        """one calibration row's ratios into stats"""
        e = cache.get(id(row)) if fast else None
        if e is None: e = row_entries(row)
        for key, cls, x in e: stats[key][cls].append(x)
    def fallback_rows(crow, stats):
        """CAL_FALLBACK=train (off by default; CAPACITY.md S6). A role (or an entity role's attribute / determiner) with fewer than 5
        present or 5 absent calibration rows gets no threshold and is then read by its training rate, i.e. NEVER for a rare role
        (fix_p80_s0: direction, amount, arrow, object.det, edge.attr, 97 of 3900 training requests). The same rule for every role:
        such a role is fitted by the same rule (fit_threshold) on the calibration rows PLUS the training rows that hold the missing
        class. Reason: the training rows are the only other labelled rows the trainer has; a threshold fitted in sample is biased
        (too easy), but "never" is wrong for every request that has the role, so an in-sample threshold is the smaller error. The
        held-out calibration rows stay in. A role that still has < 5 of a class keeps no threshold (as before)."""
        used = {id(x) for x in crow}; heads = {}
        for r in schema["role_order"]:
            heads[("presence", r)] = lambda gf: gf is not None
            rs = schema["roles"].get(r, {})
            if rs.get("main") == "entity":
                if rs.get("attr_kinds"): heads[("attr_presence", r)] = lambda gf: gf is not None and gf[0] == "entity" and gf[2] is not None
                if rs.get("det_kinds"): heads[("det_presence", r)] = lambda gf: gf is not None and gf[0] == "entity" and gf[3] is not None
        need = [k for k in heads if len(stats[k]["present"]) < 5 or len(stats[k]["absent"]) < 5]
        if not need: return
        extra = collections.defaultdict(lambda: {"present": [], "absent": []}); n_abs = collections.Counter(); taken = []
        for row in pos:                     # the training rows, in their fixed order; the calibration rows are already in stats
            if id(row) in used or row["frame"]["shape"] != "ok": continue
            gr = row["frame"]["roles"]; take = False
            for (kind, r) in need:
                has = heads[(kind, r)](gr.get(r))
                if kind != "presence" and (gr.get(r) is None or gr.get(r)[0] != "entity"): continue   # attr / det: rows that fill the role only
                if has and len(stats[(kind, r)]["present"]) < 5: take = True
                if not has and len(stats[(kind, r)]["absent"]) < 5 and n_abs[(kind, r)] < 50: take = True; n_abs[(kind, r)] += 1
            if take: taken.append(row)
        prefetch(taken)                     # FAST=1 only: the rows taken do not depend on their reads; read them at once
        for row in taken: add_row(row, extra)
        for k in need:
            stats[k]["present"] += extra[k]["present"]; stats[k]["absent"] += extra[k]["absent"]; stats[k]["fallback"] = True
    def thresholds_of(stats):
        th = {"presence": {}, "attr_presence": {}, "det_presence": {}, "scope_term": None, "set_member": {}}; calrep = {}
        mid = {"presence": {}, "attr_presence": {}, "det_presence": {}, "scope_term": None, "set_member": {}}      # the pooled midpoint: the comparison, one more round
        for (kind, r), v in stats.items():
            if kind == "scope_term":       # one threshold for every slot (ratio to the structure score)
                ok_ = bool(v["present"] and v["absent"])
                mid["scope_term"] = 0.5 * (float(np.mean(v["present"])) + float(np.mean(v["absent"]))) if ok_ else None
                th["scope_term"] = (fit_threshold(v["present"], v["absent"]) if rule == "fit" else mid["scope_term"]) if ok_ else None
                calrep["scope_term"] = {"mean_present": float(np.mean(v["present"])) if v["present"] else None, "mean_absent": float(np.mean(v["absent"])) if v["absent"] else None,
                                        "threshold": th["scope_term"], "pooled_midpoint": mid["scope_term"], "n_present": len(v["present"]), "n_absent": len(v["absent"]), "rule": rule}
                continue
            if len(v["present"]) >= 5 and len(v["absent"]) >= 5:
                mp, ma = float(np.mean(v["present"])), float(np.mean(v["absent"])); mid[kind][r] = 0.5 * (mp + ma)
                th[kind][r] = fit_threshold(v["present"], v["absent"]) if rule == "fit" else mid[kind][r]
                calrep[f"{kind}:{r}"] = {"mean_present": mp, "mean_absent": ma, "threshold": th[kind][r], "pooled_midpoint": mid[kind][r], "rule": rule,
                                         "n_present": len(v["present"]), "n_absent": len(v["absent"])}
                if v.get("fallback"): calrep[f"{kind}:{r}"]["fallback"] = "CAL_FALLBACK=train: calibration rows + the training rows that hold the missing class (in sample)"
            else:
                th[kind][r] = None; calrep[f"{kind}:{r}"] = {"threshold": None, "n_present": len(v["present"]), "n_absent": len(v["absent"]),
                                                             "rule": "one class missing in the calibration rows: read by the training rate (always / never)"}
        th["_pooled_midpoint"] = mid
        return th, calrep, stats
    rule = a.threshold_rule; t_cal = time.time()
    if fast: print(f"[fast] FAST=1: calibration reads in {fast_procs()} processes, each row read once, cleanups shared by its two reads", flush=True)
    th_train, calrep, stats = calibrate(cal_rows); th = cfg["thresholds"]; th.update(th_train)
    th["calibration_split"] = f"train (a sample of {len(cal_rows)} training sentences, rng 1234+seed); never the scored rows (rule 25)"
    cal_forms = [r for r in rows if r.get("split", "").startswith("calibration_")]
    if cal_forms:      # round 4 (judgment 45ccd1d D): the thresholds are set on training rows + the CALIBRATION half of the held-out formulations
        th_cf, calrep, stats = calibrate(cal_rows + cal_forms)
        cfg["thresholds_training_rows_only"] = dict({k: v for k, v in th_train.items() if k != "_pooled_midpoint"}, calibration_split=th["calibration_split"])
        th.update(th_cf)
        th["calibration_split"] = (f"train (a sample of {len(cal_rows)} training sentences, rng 1234+seed) + the CALIBRATION half of the held-out "
                                   f"formulations ({len(cal_forms)} sentences, splits calibration_*), disjoint from the reported half (rule 25)")
    cfg["thresholds_pooled_midpoint"] = th.pop("_pooled_midpoint")
    th["rule"] = ("FITTED: per role, the threshold that maximises the balanced present / absent accuracy on the calibration rows (judgment 752853c §2); "
                  "the pooled midpoint of the same rows is kept as thresholds_pooled_midpoint, the comparison" if rule == "fit" else
                  "pooled midpoint of the mean present / absent ratios on the calibration rows (rounds 1-5)")
    th["presence_margin"] = ("|presence ratio - threshold| (ratio units), on the wire as _presence_margin.<role> (SOP Lang keys carry one dot); the role's _margin = min(identity "
                             "margin, presence margin): a near-threshold reading abstains")
    with open(os.path.join(model_dir, "config.json"), "w") as f: json.dump(cfg, f, indent=1)
    rd = Reader(model_dir, routebook=rd.rb); resid = []      # the same route book file: its tables are not loaded a second time
    if getattr(a, "store_presence_ratios", False): store_presence_ratios(rd, rows, cal_rows, schema, seed, run_dir)
    ids = (f"c{i}" for i in range(10 ** 9))
    if fast:            # FAST=1: the same formalize per row in the pool (the wire ids do not enter the residual)
        resid = fast_map(lambda row: rd.formalize(row["text"], 0, (f"c{i}" for i in range(10 ** 9)))[2]["residual"], cal_rows, memo=False)
    else:
        for row in cal_rows: resid.append(rd.formalize(row["text"], 0, ids)[2]["residual"])
    pres = {k: np.array(v["present"] + v["absent"]) for (kk, r), v in stats.items() for k in [f"{kk}:{r}"]}
    if fast: print(f"[fast] calibration: {len(cache)} rows read, {len(cal_rows)} background rows formalized in {time.time() - t_cal:.1f}s", flush=True)
    np.savez(os.path.join(model_dir, "background.npz"), residual=np.array(resid), residual_mean=np.mean(resid) if resid else 1.0,
             residual_std=np.std(resid) if resid else 0.0, **{f"presence_{k}": v for k, v in pres.items()})
    return rd, calrep


def store_presence_ratios(rd, rows, cal_rows, schema, seed, run_dir):
    """round 5 (judgment d8f8a98 Q5): the per-sentence presence ratios (the presence score of a role / the structure score; the quantity the
    presence threshold is compared with), read with the gold structure as the calibration reads them, for every role that has a presence
    threshold, stored per seed in run_dir/presence_ratios_seed<k>.json. Classes:
      present / calibration  = the calibration_* halves of the held-out formulations (the role filled);
      present / report       = the reported heldout_formulations* halves (the role filled), per split;
      absent  / calibration  = the training-sample calibration rows where the role is not given (the held-out formulations have no sentence
                               without the role, so the absent class can only come from the seen recipient-less forms);
      absent  / report       = the held-out SENTENCES where the role is not given (disjoint from the calibration rows);
      present / training     = the training-sample calibration rows with the role filled (the pooled midpoint's other input)."""
    roles = [r for r in schema["role_order"] if rd.th.get("presence", {}).get(r) is not None]
    def read3(row, r):
        """(presence ratio, the role's IDENTITY margin, the structure score); read with every role read so that the identity margin exists
        for absent rows too (the ratio does not depend on the readout)"""
        g = row["frame"]; S, _, _, _ = rd.chart(row["tokens"]); f = rd.read(S, row["tokens"], force=(len(g["speakers"]), g["neg"]), presence="all")
        return float(f["presence"].get(r, 0.0)), float(f["margins"].get(r, 0.0)), float(f.get("core", 0.0))
    pm = rd.cfg.get("thresholds_pooled_midpoint", {}).get("presence", {})
    out = {"seed": seed, "definition": store_presence_ratios.__doc__ + " Round 6: also <class>_identity_margin and <class>_core, aligned.",
           "thresholds": {"product (pooled midpoint)" if not pm else "product": {r: rd.th["presence"][r] for r in roles},
                          "pooled midpoint": {r: (pm or rd.th["presence"]).get(r) for r in roles},
                          "training rows only": {r: (rd.cfg.get("thresholds_training_rows_only") or {}).get("presence", {}).get(r) for r in roles},
                          "rule": rd.th.get("rule", "pooled midpoint")}, "roles": {}}
    ok = lambda row: row["frame"]["shape"] == "ok"
    for r in roles:
        filled = lambda row: row["frame"]["roles"].get(r) is not None
        groups = {"present_calibration": [x for x in rows if x.get("split", "").startswith("calibration_heldout_formulations") and ok(x) and filled(x)],
                  "present_training": [x for x in cal_rows if ok(x) and filled(x)],
                  "absent_calibration": [x for x in cal_rows if ok(x) and not filled(x)],
                  "absent_report": [x for x in rows if x.get("split") == "heldout_sentences" and ok(x) and not filled(x)]}
        d = {"present_report": {}, "present_report_identity_margin": {}, "present_report_core": {}}
        for k, xs in groups.items():
            v = [read3(x, r) for x in xs]; d[k] = [t[0] for t in v]; d[k + "_identity_margin"] = [t[1] for t in v]; d[k + "_core"] = [t[2] for t in v]
        for x in rows:
            s_ = x.get("split", "")
            if s_.startswith("heldout_formulations") and ok(x) and filled(x):
                t = read3(x, r)
                for key, val in (("present_report", t[0]), ("present_report_identity_margin", t[1]), ("present_report_core", t[2])): d[key].setdefault(s_, []).append(val)
        out["roles"][r] = d
    with open(os.path.join(run_dir, f"presence_ratios_seed{seed}.json"), "w") as f: json.dump(out, f)
    print(f"[presence ratios] seed {seed}: " + "; ".join(f"{r}: present cal {len(d['present_calibration'])}, report "
          f"{sum(len(v) for v in d['present_report'].values())}, absent cal {len(d['absent_calibration'])}, report {len(d['absent_report'])}"
          for r, d in out["roles"].items()), flush=True)


def run_eval(rd, rows, legend, schema, a, lexical, seen_words, new_ids, bag=None):
    by = collections.defaultdict(list)
    for r in rows: by[r["split"]].append(r)
    out = {}
    for s in sorted(by):
        if s == "train" or s.startswith("calibration_"): continue
        # both readouts (presence decided, the default; every role read) are ALWAYS scored on the unseen-formulation splits (round 3)
        rd._eval_presence_all = bool(getattr(a, "also_presence_all", False)) or s.startswith("heldout_formulations")
        rd._eval_alt_th = rd.cfg.get("thresholds_pooled_midpoint")      # the comparison, one more round (judgment 752853c §2), every split
        filt = None
        if s == "new_identities":
            new_kinds = {legend.kind(w) for w in new_ids}
            filt = set(new_ids) | {w for w in seen_words if legend.kind(w) not in new_kinds}
        else: filt = set(seen_words)
        out[s] = {"catalog candidates": evaluate(rd, by[s], legend, schema, a.tau, None, lexical, a.n_eval, bag=bag, seen_words=seen_words, modes=a.eval_modes)}
        if a.candidate_sets == "both":
            out[s]["experiment candidates"] = evaluate(rd, by[s], legend, schema, a.tau, filt, lexical, a.n_eval, bag=bag, seen_words=seen_words, modes=a.eval_modes)
    rd._eval_presence_all = bool(getattr(a, "also_presence_all", False)); rd._eval_alt_th = None; trs = [r for r in by.get("train", []) if not r.get("negative")]
    out["train (sample)"] = {"catalog candidates": evaluate(rd, trs, legend, schema, a.tau, None, lexical, min(a.n_eval, 300), 7, bag=bag, seen_words=seen_words, modes=a.eval_modes)}
    return out


def rd_cal_note(splits):
    return "set on training rows" if not any(s.startswith("calibration_") for s in splits) else "set on training rows + the calibration half of the held-out formulations"


def write_report(path, a, legend, rows, splits, defs, schema, metrics, extra, chance_, n_files):
    L = []; P = L.append
    P(f"# REPORT — world `{a.world_name}`, legend {legend.sha[:19]}… (version {legend.version})\n")
    P("Labels (rule 22): every number below is BUILT (code and measurement exist, computed by this training run). Nothing here is PLANNED "
      "or HYPOTHESIS except where a line says so.\n")
    P("## Given and learned (rule 20)\nGIVEN: the legend's roles and their vectors, the identities (stars regenerated from the seed), the kinds "
      "(lexicon), the event synonym table, the reader block of the legend. LEARNED: the route book only — per-kind displacements of the "
      "path / bigram / chain codes and the gates (sigmoid per kind, from an all-closed start), by the single objective max cos(S, S_world) "
      "with structured per-sentence targets with pre-set roles; the model learns the assignment.\n")
    srcs = collections.Counter(r["source"] for r in rows)
    P(f"## Data\n{len(rows)} annotated sentences from {n_files} files; provenance: {dict(srcs)}. Audit: none in this world folder "
      "(audit/ empty) — agreement not measured. Shapes the v1 decoder cannot read (trained as targets, scored as FULL-wrong): "
      f"{schema['unsupported_shapes'] or 'none'}.\n")
    P(f"## Splits (written to runs/{os.path.basename(a.run_dir)}/splits.json before training; source: {defs['source']})")
    for s, ids in sorted(splits.items()): P(f"- {s}: {len(ids)} sentences")
    P(f"\nThe four splits of spec 6.4: seen formulations = `train` (+ `heldout_sentences`, the held-out SENTENCES of the seen formulations, "
      f"{defs['heldout_sentence_share']:.0%} by hash); held-out FORMULATIONS (by template / file when the examples are templated, else by "
      f"signature = the sentence with its fillers replaced by their kind; splits named heldout_formulations*); new identities (fillers never in "
      f"training: {defs['new_identities']}); plus held-out depth from {defs.get('heldout_depth_min')} when the world says so. The lexical bag "
      "baseline and the lexical order baseline are trained on the same training rows and scored on the same rows as the reader.\n")
    kr = extra[0].get("kinds", {})
    if kr: P(f"## Kinds (spec 6.3)\n{kr['tokens']} tokens in the examples; {kr['unknown_kind_tokens']} with no kind in the lexicon "
             f"(share {kr['unknown_share']:.3f}), given the kind `unknown` (placed in the chart, never a filler, listed in `_unplaced`). "
             "Word -> kind table: model/catalog.json.\n")
    P(f"## Training\nD={a.D}, seeds {a.seeds_list}, batch {a.batch}, lr {a.lr}, epochs {a.epochs}, device {a.device}, codes path+chainL+bigram, "
      f"gates learned (closed start). Code commit {a.commit}. Memory curve: runs/{os.path.basename(a.run_dir)}/train.log (trainer.train_loop, rule 21).\n")
    P("## Thresholds (rule 25)\nAbstention tau = %.2f: stated, not fitted. Presence / attribute / determiner / set-member thresholds: the rule actually applied is "
      "printed per entry below (FITTED = argmax of the balanced present / absent accuracy on the calibration rows, judgment 752853c §2, the pooled midpoint "
      "printed beside it as the comparison; 'midpoint' only when that rule is the one used); calibration rows = a sample of the TRAINING split plus the "
      "calibration half of the held-out formulations when enabled (never the scored rows):" % a.tau)
    for k, v in extra[0]["calibration"].items():
        P(f"- {k}: " + (f"threshold {v['threshold']:.3f} [rule: {v.get('rule', 'fitted')}" + (f"; pooled midpoint {v['pooled_midpoint']:.3f} (comparison)" if v.get('pooled_midpoint') is not None else "") + f"] (present {v['mean_present']:.3f}, n {v['n_present']} / absent {v['mean_absent']:.3f}, n {v['n_absent']})"
                       if v.get("threshold") is not None else f"no threshold ({v['rule']}; n present {v['n_present']}, absent {v['n_absent']})"))
    P(f"\n## Results (seed {a.seeds_list[0]} model in model/; mean ± std over seeds when more than one)\n")
    P("Chance per role (1 / catalog candidates of the role's kinds): " + ", ".join(f"{k} {v:.3f}" for k, v in chance_.items() if v) + "\n")
    P("Two candidate sets: `catalog` = every catalog word of the role's kinds (what `sop formalize` does); `experiment` = as the repository "
      "scripts (seen splits: the words seen in training; new identities: the held-out words), for the P0 comparison with RESULTS.\n")
    def ms(xs): return f"{np.mean(xs):.3f}" + (f"±{np.std(xs):.3f}" if len(xs) > 1 else "")
    for s in metrics[0]:
        for cs in metrics[0][s]:
            accs = metrics[0][s][cs]["acc"]
            P(f"### {s} — {cs} (n = {metrics[0][s][cs]['n']} of {metrics[0][s][cs]['of']})")
            P("| axis | accuracy |\n|---|---|")
            for k in sorted(accs, key=lambda k: not k.startswith("FULL")): P(f"| {k} | {ms([mm[s][cs]['acc'].get(k, float('nan')) for mm in metrics])} |")
            P(f"\nresidual mean {ms([mm[s][cs]['residual_mean'] for mm in metrics])}; status {metrics[0][s][cs]['status']}")
            cal = metrics[0][s][cs]["calibration"]
            P("\n| calibration axis (seed 0) | acc | margin mean / p10 | coverage at tau | confident-wrong | abstain right / wrong |\n|---|---|---|---|---|---|")
            for ax, c in cal.items():
                P(f"| {ax} | {c['acc']:.3f} | {c['margin_mean']:.3f} / {c['margin_p10']:.3f} | {c['coverage']:.2f} | {c['confident_wrong']:.3f} | {c['abstain_right']:.3f} / {c['abstain_wrong']:.3f} |")
            P("")
    P("## Gates (seed 0; OPEN > 0.5)\n" + " ".join(f"{c}={g:.2f}" for c, g in sorted(extra[0]["gates"].items(), key=lambda x: -x[1])) + "\n")
    weak = []
    for s in metrics[0]:
        for k, v in metrics[0][s]["catalog candidates"]["acc"].items():
            if v < 0.9 and not k.startswith("lexical"): weak.append(f"{s}: {k} {v:.3f}")
    P("## What is weak, what to add\n" + ("\n".join(f"- {w}" for w in weak) if weak else "- nothing under 0.9 on these splits") + "\n")
    P("Formulations with the lowest FULL on the held-out splits (add examples of these formulations):")
    worst = sorted(((wf["FULL"], wf["n"], s, wf["formulation"]) for s in metrics[0] if not s.startswith("train")
                    for wf in metrics[0][s]["catalog candidates"].get("worst_formulations", []) if wf["FULL"] < 0.9), key=lambda x: (x[0], -x[1]))[:8]
    P("\n".join(f"- {s}: `{fm}` FULL {v:.3f} (n {n})" for v, n, s, fm in worst) if worst else "- none under 0.9")
    P("")
    if len(a.seeds_list) < 3: P("- fewer than 3 seeds (rule 6): the numbers above carry no seed variance; run with --seeds 3 or more for a result.\n")
    forms = [s for s in metrics[0] if s.startswith("heldout_formulations")]
    if forms:
        P("## Unseen formulations: the readouts (rounds 3-4; judgment 45ccd1d D)\nThe PRODUCT number comes first: the product readout decides "
          "presence (a role missing from the text reads \"not given\"; `_empty` is the product), with the thresholds of model/config.json "
          f"({rd_cal_note(splits)}). The v16-protocol row reads every role of the schema (v16 always reads C): a comparison, not available to "
          "the product, never a default. Catalog candidates.\n")
        P("| split | readout | heads FULL | FULL | " + " | ".join(f"role {r}" for r in schema["role_order"]) + " |\n|---|---|---|---|" + "---|" * len(schema["role_order"]))
        for s in forms:
            acc = lambda k: ms([mm[s]["catalog candidates"]["acc"].get(k, float("nan")) for mm in metrics])
            P(f"| {s} | product readout: presence decided | {acc('heads FULL (model)')} | {acc('FULL')} | " + " | ".join(acc(f"role {r}") for r in schema["role_order"]) + " |")
            if "heads FULL (model) [pooled midpoint (comparison)]" in metrics[0][s]["catalog candidates"]["acc"]:
                P(f"| {s} | presence decided, pooled-midpoint thresholds (the comparison, rounds 1-5) | {acc('heads FULL (model) [pooled midpoint (comparison)]')} | "
                  f"{acc('FULL [pooled midpoint (comparison)]')} | " + " | ".join(acc(f"role {r} [pooled midpoint (comparison)]") for r in schema["role_order"]) + " |")
            P(f"| {s} | v16 protocol: every role read, not available to the product | {acc('heads FULL (model) [presence not decided]')} | {acc('FULL [presence not decided]')} | "
              + " | ".join(acc(f"role {r} [presence not decided]") for r in schema["role_order"]) + " |")
        P("")
    pres_roles = [r for r in schema["role_order"] if any(k.startswith(f"presence {r}: present read present") for s_ in metrics[0] for k in metrics[0][s_]["catalog candidates"]["acc"])]
    if pres_roles:
        P("## Presence per role (judgment 752853c §2)\nProduct readout first: presence decided with the FITTED thresholds (argmax balanced accuracy on the "
          "calibration rows); the pooled midpoint of the same rows beside it as the comparison (one more round). Abstain = the role's margin "
          "min(identity, presence) under tau: a near-threshold reading is uncertain, not a claim.\n")
        P("| split | role | readout | present read present | absent read absent | balanced | 'present' readings that abstain (false / true) |\n|---|---|---|---|---|---|---|")
        for s_ in metrics[0]:
            A_ = lambda k: [mm[s_]["catalog candidates"]["acc"].get(k) for mm in metrics if mm[s_]["catalog candidates"]["acc"].get(k) is not None]
            for r in pres_roles:
                for lab, suf in (("product: fitted", ""), ("comparison: pooled midpoint", " [pooled midpoint (comparison)]")):
                    p_, a_ = A_(f"presence {r}: present read present{suf}"), A_(f"presence {r}: absent read absent{suf}")
                    if not p_ and not a_: continue
                    bal = [(x + y) / 2 for x, y in zip(p_, a_)] if p_ and a_ else []
                    ab = (ms(A_(f"presence {r}: share of 'present' readings that abstain")) + " (" + (ms(A_(f"presence {r}: share of FALSE 'present' readings that abstain")) if A_(f"presence {r}: share of FALSE 'present' readings that abstain") else "—")
                          + " / " + (ms(A_(f"presence {r}: share of true 'present' readings that abstain")) if A_(f"presence {r}: share of true 'present' readings that abstain") else "—") + ")") if not suf and A_(f"presence {r}: share of 'present' readings that abstain") else ""
                    P(f"| {s_} | {r} | {lab} | {ms(p_) if p_ else '—'} | {ms(a_) if a_ else '—'} | {ms(bal) if bal else '—'} | {ab} |")
        P("")
    P("## Structure given vs estimated (author C3)\n`FULL` = the reporting depth ESTIMATED by the primary estimator of model/config.json "
      f"(`{a.depth_estimator if not a.eval_only else 'see config.json'}`: the count of level-opener kinds by default; the open-gate count and the "
      "fit are the checks, `FULL [gate-count estimate]` / `FULL [fit estimate]`) and the event negation by the fit (what `sop formalize` does); "
      "`FULL [depth given]` = the depth GIVEN (as the repository scripts), negation estimated; `FULL [depth and negation given]`.\n")
    if legend.reader.get("full_excludes"):
        P(f"FULL is defined over the legend's questions: {legend.reader['full_excludes']} excluded (reported as its own axis); the previous "
          "definition (everything included) is printed once next to it (rule 16).\n")
    P("## Checklist\n[x] addresses from the world [x] shared identities (one star function) [x] chance printed [x] seen / unseen axes separated "
      "[x] margin [%s] >=3 seeds [x] trivial controls (lexical bag and lexical order baselines) [x] calibration (rule 18) [x] memory logged (rule 21) "
      "[x] thresholds on calibration rows (rule 25) [x] given vs learned stated (rule 20)" % ("x" if len(a.seeds_list) >= 3 else " "))
    with open(path, "w") as f: f.write("\n".join(L) + "\n")


def main(argv=None):
    ap = argparse.ArgumentParser(prog="sop train", description="train the reader on a world folder (legend.json + examples/*.sop -> model/)")
    ap.add_argument("world"); ap.add_argument("--D", type=int, default=1024); ap.add_argument("--seed", type=int, default=0); ap.add_argument("--seeds", type=int, default=1)
    ap.add_argument("--batch", type=int, default=8); ap.add_argument("--lr", type=float, default=0.02); ap.add_argument("--epochs", type=int, default=1)
    ap.add_argument("--shuffle", action="store_true", help="shuffle the first epoch too (default: file order, as the repository's generators)")
    ap.add_argument("--max_train", type=int, default=0); ap.add_argument("--device", default="cpu"); ap.add_argument("--tau", type=float, default=0.05)
    ap.add_argument("--n_eval", type=int, default=600); ap.add_argument("--n_cal", type=int, default=400); ap.add_argument("--log_every", type=int, default=500)
    ap.add_argument("--splits", help="reuse the split assignment of an earlier run (held-out set fixed before a legend change)")
    ap.add_argument("--resume", action="store_true"); ap.add_argument("--force", action="store_true", help="accept examples whose !legend hash differs (inspection only)")
    ap.add_argument("--out", help="model folder (default <world>/model)")
    ap.add_argument("--depth_estimator", default="kinds", choices=["gates", "kinds", "fit"], help="the primary depth estimator written into "
                    "model/config.json: level-opener kinds counted (default since round 3, gate-independent), open level gates passed, or the fit; "
                    "the other two stay as checks on the wire and in metrics")
    ap.add_argument("--calibrate_on_heldout_formulations", action="store_true", default=True, help="(the default since round 6) set the presence "
                    "thresholds on the training sample + one half of every held-out formulation split (calibration_*), report the other half")
    ap.add_argument("--no_heldout_calibration", dest="calibrate_on_heldout_formulations", action="store_false",
                    help="calibrate on the training sample only (rounds 1-3)")
    ap.add_argument("--threshold_rule", default="fit", choices=["fit", "midpoint"], help="the calibration RULE: 'fit' (default since round 6: "
                    "argmax balanced accuracy on the calibration rows) or 'midpoint' (the pooled midpoint of rounds 1-5)")
    ap.add_argument("--codes", default=None, help="the code list of the bundle, comma-separated (default: the legend's reader.codes, else "
                    "path,chainL,bigram — the reference bundle). 'pos' (the position code, omitted beyond the trained length) only where a "
                    "legend declares rigid order (judgment 752853c §1); the reference model does not carry it")
    ap.add_argument("--store_presence_ratios", action="store_true", help="round 5: store the per-sentence presence ratios of the calibration and "
                    "report rows (present and absent classes) per seed in the run folder (presence_ratios_seed<k>.json)")
    ap.add_argument("--also_presence_all", action="store_true", help="also score every split with presence NOT decided (every role read, as "
                    "v16), next to the decided readout (round 3, run D); the model's default readout stays 'decided'")
    ap.add_argument("--eval_modes", default="all", choices=["all", "primary"], help="'primary' = only the product readout and the pooled-midpoint "
                    "comparison (no structure variants: worlds without reporting depth, e.g. WikiSQL)")
    ap.add_argument("--candidate_sets", default="both", choices=["both", "catalog"], help="'catalog' = skip the experiment-candidate pass")
    ap.add_argument("--length_buckets", action="store_true", help="batches of similar length in shuffled bucket order, each trimmed to its "
                    "longest sentence (as experiment/v11_wikisql; real text with long sentences); off by default (the constructed worlds' regime)")
    ap.add_argument("--stop_after", type=int, default=0, help="debugging / equivalence checks: stop training after this many steps, write the "
                    "route book (its arrays' sha256 printed) and end the run (no calibration, no evaluation); 0 (default) = off")
    ap.add_argument("--pad_to_longest", action="store_true", help="compute every batch at the width of the longest training sentence, as the "
                    "trainer did before 2026-10-31 (bit for bit; memory and time per step grow with the longest sentence); default: each batch at "
                    "its own longest sentence (the same function, the gates' gradient can differ in the last bit)")
    ap.add_argument("--loss_every_step", action="store_true", help="debugging / equivalence checks: print every step's loss in full precision")
    ap.add_argument("--no_ckpt", action="store_true", help="no checkpoint file (the run folder keeps logs, metrics, splits, command only)")
    ap.add_argument("--run_dir", help="write this run's folder here instead of <world>/runs/<timestamp>")
    ap.add_argument("--eval_only", action="store_true", help="re-score the saved model/ (no training): metrics.json and REPORT.md rewritten")
    ap.add_argument("--star_version", type=int, default=1, choices=[1, 2], help="1 = the NumPy star function (every existing world); 2 = the "
                    "portable star function (SHA-256 -> xoshiro128**), reproduced exactly in the browser by app/src/vss.js (VSS Diagram Editor spec 5.1)")
    ap.add_argument("--star_seed", default=world.GLOBAL_STAR_SEED, help="seed of the word-star catalog; default the GLOBAL one shared by all worlds (spec v2 s.0)")
    ap.add_argument("--identities", default="stars", help="'stars' (the tool's star function) or 'table:<vocab.json>': the per-seed draw of "
                    "experiment/v16_reference, np.random.default_rng(300 + seed) over that vocabulary (isolation run C)")
    ap.add_argument("--vary_stars", action="store_true", help="rule 6 / research reproduction: identities drawn per seed (star seed 'seed<k>'), as the repository scripts")
    ap.add_argument("--decoder", default="contract", choices=sorted(activate.DECODERS), help="'contract' (default): the contract rules of q-formalisation on in the "
                    "model (candidates from the sentence, one answer per word, undecided by adjacency, explained residual; activate.py class 1); "
                    "'paper': the decoder of the frozen comparison rows (catalog candidates, compiled residual)")
    ap.add_argument("--activate", default="off", choices=["off", "auto"], help="'auto': the structural routes are SELECTED from the nature of the world "
                    "(activate.py: need signals on the training annotation, acceptance on selection rows the trials did not train on); the trials, "
                    "numbers and decision go to config.json 'activation' and run_dir/activation.json. 'off' (default): reader.codes / --codes as declared")
    ap.add_argument("--activate_eps", type=float, default=0.01, help="the tolerance of the acceptance test (FULL accuracy units)")
    ap.add_argument("--centre_key", default="kind", choices=["kind", "event"], help="the centre reader only (legend reader.centres): the "
                    "centre-relative phases keyed by the centre's kind (run 1) or by its event token (run 2, B's E3d; research/attention/port/NOTES.md)")
    a = ap.parse_args(argv)
    wd = os.path.abspath(a.world); a.world_name = os.path.basename(wd.rstrip("/"))
    legend = Legend(os.path.join(wd, "legend.json"))
    if legend.errors: print("legend errors:\n  " + "\n  ".join(legend.errors)); return 1
    a.code_list = [c.strip() for c in (a.codes.split(",") if a.codes else (legend.reader.get("codes") or ["path", "chainL", "bigram"])) if c.strip()]
    bad = [c for c in a.code_list if c not in ("path", "chainL", "bigram", "pos", "vorder")]
    if bad or not a.code_list: print(f"unknown codes {bad} (allowed: path, chainL, bigram, pos, vorder)"); return 1
    wj = os.path.join(wd, "world.json"); a.language = json.load(open(wj)).get("language", "en") if os.path.exists(wj) else "en"
    ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S"); a.run_dir = os.path.abspath(a.run_dir) if a.run_dir else os.path.join(wd, "runs", ts)
    os.makedirs(a.run_dir, exist_ok=True)
    log = open(os.path.join(a.run_dir, "train.log"), "w"); sys.stdout = Tee(sys.__stdout__, log)
    a.commit = git_commit()
    with open(os.path.join(a.run_dir, "command.txt"), "w") as f: f.write("sop train " + " ".join(argv if argv is not None else sys.argv[1:]) + f"\ncommit {a.commit}\n")
    status_path = os.path.join(wd, "status.json")
    def status(label, **kw):
        st = {"label": label, "when": datetime.datetime.now().isoformat(timespec="seconds"), "legend": legend.sha, "legend_version": legend.version, "run": ts, **kw}
        tmp = status_path + ".tmp"; json.dump(st, open(tmp, "w"), indent=1); os.replace(tmp, status_path)
    rows, errors, files = load_rows(wd, legend, a.force)
    if errors:
        print("examples rejected by sop check:\n" + "\n".join(errors[:50])); status("FAILED", reason="examples failed sop check"); return 1
    if not rows: print("no annotated sentences (examples/*.sop with _text)"); status("FAILED", reason="no examples"); return 1
    exhash = hashlib.sha256("".join(open(p, "rb").read().hex() for p in files).encode()).hexdigest()
    status("TRAINING", examples_sha256=exhash)
    hp = os.path.join(wd, "split_hints.json"); hints = json.load(open(hp)) if os.path.exists(hp) else {}
    defs, splits = make_splits(rows, legend, hints, a.seed, cal_forms=a.calibrate_on_heldout_formulations)
    if a.splits:
        prev = json.load(open(a.splits)); text2 = {}
        for s, ids in prev["rows"].items():
            for t in prev.get("texts", {}).get(s, []): text2[t] = s
        for r in rows: r["split"] = text2.get(r["text"], r["split"])
        splits = collections.defaultdict(list)
        for r in rows: splits[r["split"]].append(r["id"])
        defs["reused_from"] = a.splits
    a.messages = None
    if legend.reader.get("centres"):         # the centre reader: whole messages (examples/messages.jsonl), split per message
        a.messages = load_messages(wd)
        if not a.messages: print("legend reader.centres is set but examples/messages.jsonl is missing or empty"); status("FAILED", reason="no messages"); return 1
        splits = message_splits(a.messages, rows, a.seed)
        defs["centres"] = "split per message: examples/calib.sop messages halved by hash (seed, 'calform', message id); rows follow their message"
    texts = collections.defaultdict(list)
    for r in rows: texts[r["split"]].append(r["text"])
    with open(os.path.join(a.run_dir, "splits.json"), "w") as f: json.dump({"definitions": defs, "rows": splits, "texts": texts}, f, indent=1)
    print(f"[splits] written to {os.path.join(a.run_dir, 'splits.json')} before training: " + ", ".join(f"{k} {len(v)}" for k, v in sorted(splits.items())))
    train_rows = [r for r in rows if r["split"] == "train" and not r.get("negative")]; schema = build_schema(train_rows, legend)   # the schema from the positive rows
    schema["content_kinds"] = sorted(content_kinds_of(train_rows, legend))
    print(f"[schema] roles {schema['role_order']} (core {schema['core_roles']}), max depth {schema['max_depth']}, event negation {schema['neg_event']}")
    lexical, ranks = lexical_baseline(train_rows, legend, schema); bag = bag_baseline(train_rows, legend, schema)
    seen_words = {w for r in train_rows for fl in r["frame"]["roles"].values() for w in world.filler_words(fl)} | {s for r in train_rows for s in r["frame"]["speakers"]}
    a.activation_report = None
    if a.activate == "auto" and not a.eval_only:
        prof_codes, act = activate.select(a, legend, rows, splits, schema, train_one, evaluate, lexical, bag, seen_words, eps=a.activate_eps)
        a.code_list = prof_codes; a.activation_report = act
        with open(os.path.join(a.run_dir, "activation.json"), "w") as f: json.dump(act, f, indent=1)
        with open(os.path.join(a.run_dir, "PROFILE.md"), "w") as f:
            f.write(activate.profile_markdown(act["profile"], {c: (v["fires"], v["reason"]) for c, v in act["need_signals"].items()}, act["diagnostics"]))
    model_dir = os.path.abspath(a.out or os.path.join(wd, "model")); a.seeds_list = [a.seed + k for k in range(a.seeds)]
    metrics, extra = [], []
    if a.eval_only:     # re-score a saved model with the current reader code; no training, thresholds kept from its config (rule 25)
        from .infer import Reader
        prev = json.load(open(os.path.join(model_dir, "metrics.json"))); rd = Reader(model_dir); a.seeds_list = [rd.cfg["seed"]]
        mt = run_eval(rd, rows, legend, schema, a, lexical, seen_words, set(defs["new_identities"]), bag); metrics, extra = [mt], [prev["training"][0]]
        chance_ = chance(rd, schema); a.D = rd.D; a.commit = f"{a.commit} (re-scored; trained at {rd.cfg.get('training_code_commit')})"
        for s, v in mt.items(): print(f"[eval] {s}: FULL " + " | ".join(f"{cs} {vv['acc']['FULL']:.3f}" for cs, vv in v.items()), flush=True)
    try:
        for k, seed in enumerate([] if a.eval_only else a.seeds_list):
            md = model_dir if k == 0 else (os.path.join(tempfile.mkdtemp(prefix=f"sop_seed{seed}_"), "model") if a.no_ckpt else os.path.join(a.run_dir, f"seed{seed}", "model"))   # --no_ckpt: the other seeds' models are not kept in the run folder
            if k == 0 and os.path.exists(md + ".building"): shutil.rmtree(md + ".building")
            build = md + ".building" if k == 0 else md
            if a.vary_stars: a.star_seed = f"seed{seed}"
            rd, ex = train_one(a, legend, rows, splits, schema, seed, build, a.run_dir)
            mt = run_eval(rd, rows, legend, schema, a, lexical, seen_words, set(defs["new_identities"]), bag)
            metrics.append(mt); extra.append(ex)
            if k == 0: chance_ = chance(rd, schema)
            for s, v in mt.items():
                print(f"[eval] seed {seed} {s}: FULL " + " | ".join(f"{cs} {vv['acc']['FULL']:.3f}" for cs, vv in v.items()) + f" | residual {v['catalog candidates']['residual_mean']:.3f}", flush=True)
            sys.path.insert(0, EXP); import trainer; print(f"[mem] after seed {seed}: {trainer.mem_line()}")
            if k == 0:
                if os.path.exists(model_dir): shutil.rmtree(model_dir)
                os.replace(build, model_dir)
    except Exception as e:
        status("FAILED", reason=f"{type(e).__name__}: {e}"); raise
    summary = {"world": a.world_name, "legend": legend.sha, "legend_version": legend.version, "seeds": a.seeds_list, "label": "BUILT",
               "splits": {k: len(v) for k, v in splits.items()}, "chance": chance_, "lexical_ranks": ranks,
               "per_seed": metrics, "training": extra, "labels_rule22": "every number BUILT by this run"}
    agg = {}
    for s in metrics[0]:
        for cs in metrics[0][s]:
            for kk in metrics[0][s][cs]["acc"]:
                xs = [m[s][cs]["acc"][kk] for m in metrics if kk in m[s][cs]["acc"]]
                agg.setdefault(s, {}).setdefault(cs, {})[kk] = {"mean": float(np.mean(xs)), "std": float(np.std(xs))}
    summary["mean_over_seeds"] = agg
    with open(os.path.join(model_dir, "metrics.json"), "w") as f: json.dump(summary, f, indent=1)
    write_report(os.path.join(model_dir, "REPORT.md"), a, legend, rows, splits, defs, schema, metrics, extra, chance_, len(files))
    for fn in ("metrics.json", "REPORT.md", "config.json"): shutil.copyfile(os.path.join(model_dir, fn), os.path.join(a.run_dir, fn))
    full = {s: agg[s]["catalog candidates"]["FULL"]["mean"] for s in agg}
    status("BUILT", examples_sha256=exhash, metrics_summary={"FULL (catalog candidates)": full})
    print(f"[done] model written to {model_dir}; REPORT.md and metrics.json there; run log {a.run_dir}/train.log")
    print("checklist: [x] addresses from the world [x] shared identities [x] chance printed [x] seen/unseen axes separated [x] margin "
          f"[{'x' if a.seeds >= 3 else ' '}] >=3 seeds [x] trivial control (lexical order baseline) [x] calibration (18) [x] memory logged (21) "
          "[x] thresholds on calibration rows (25) [x] given vs learned stated (20)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
