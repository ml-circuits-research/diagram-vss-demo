"""review_data.py: checks of the LLM-written training messages (llm_train/*_msg) against their own text and the legend.
Reports counts and examples per problem; writes llm_train/DATA_REVIEW.md. Run: python3 review_data.py"""
import collections, glob, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
rows = [(f.split("/")[-2], json.loads(l)) for f in sorted(glob.glob(os.path.join(HERE, "llm_train", "*_msg", "*.jsonl"))) for l in open(f) if l.strip()]
cues = json.load(open(os.path.join(HERE, "legend_cues.json")))
cue_of = {q: {c.lower(): v for v, cs in vs.items() for c in [v] + list(cs)} for q, vs in cues.items()}
VALUE_Q = [q for q in cue_of if q not in ("action", "ask", "property", "kind", "outline")]
value_words = {w for q in VALUE_Q for c in cue_of[q] for w in c.split()}
FUNC = {"the", "a", "an", "to", "at", "in", "on", "of", "is", "are", "it", "its", "and", "by"}
issues, ex = collections.Counter(), collections.defaultdict(list)
def add(k, src, e):
    issues[(k, src)] += 1
    if len(ex[k]) < 5: ex[k].append(e)
def words(s): return [x.lower() for x in re.findall(r"[A-Za-z][\w'-]*", s)]
for src, m in rows:
    t = m["text"]; covered = [0] * len(t); names = {n.lower() for n in m.get("names") or []}
    for w in m["wires"]:
        sp, tr, a = w.get("span", ""), w.get("trigger", ""), w["args"]
        i = t.find(sp)
        if i < 0: add("span not in text", src, sp); continue
        for k in range(i, i + len(sp)): covered[k] = 1
        tw = words(tr)
        if tw and all(x in value_words or x in FUNC for x in tw): add("trigger marks a value (colour, place, layout...), not the action", src, f"{sp!r} trigger={tr!r} -> {a}")
        if any(x in names for x in tw): add("trigger contains a shape name", src, f"{sp!r} trigger={tr!r}")
        sw = set(words(sp))
        for key in ("color", "shape", "size"):
            v = a.get(key)
            if v and not any(c in " ".join(words(sp)) for c, vv in cue_of.get(key, {}).items() if vv == v): add(f"{key}={v} not expressed in the span", src, f"{sp!r} -> {a}")
        for key in ("target", "from", "to", "anchor"):
            v = a.get(key)
            if isinstance(v, str) and not v.startswith(("mention(", "$")):
                for n in v.split(","):
                    if n.strip() and n.strip().lower() not in sw and not ({"it", "them", "both", "they", "its", "him", "her", "each", "all"} & sw):
                        add(f"{key} name not in the span", src, f"{sp!r} -> {key}={v}")
        if w["type"] == "command" and a.get("action") == "resize": add("resize: bigger and smaller are the same label", src, sp)
        if w["type"] == "question" and a.get("ask") in ("path", "reachable") and (a.get("ask") == "reachable") == bool(a.get("to")): add("reachable/path mismatch (reachable takes from only, path from+to)", src, f"{sp!r} -> {a}")
    for s in re.finditer(r"[^.!?]+[.!?]?", t):
        if len(s.group(0).strip()) > 3 and not any(covered[s.start():s.end()]): issues[("fluff sentence (no wire): usable as a 'not a request' example", src)] += 1
out = ["# Review of the training messages", "", f"{len(rows)} messages ({collections.Counter(s for s, _ in rows)}).", "", "| problem | source | n |", "|---|---|---|"]
out += [f"| {k} | {s} | {n} |" for (k, s), n in sorted(issues.items())]
for k, v in ex.items(): out += ["", f"## {k}", ""] + [f"- {e}" for e in v]
open(os.path.join(HERE, "llm_train", "DATA_REVIEW.md"), "w").write("\n".join(out) + "\n")
print("\n".join(out))
