"""llm_to_world.py: the LLM-written training clauses (llm_train/*/train_*.jsonl, gold in the demo's legend) as sketch-world examples
(worlds/sketch/examples/train_llm.sop), the inverse of docs/js/vss-adapter.js. Each clause is normalized exactly as the reader will see it,
and its gold wire becomes the event with its roles; every word a role is filled with must be a token of the normalized clause (the reader
reads only what the sentence carries), otherwise the clause is set aside and counted by reason (llm_train/CONVERSION.md).
Run after generate.py: python3 llm_to_world.py"""
import collections, glob, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from generate import LEXICON, EVENTS, ROLES, SHAPES, wires_for, sha256_file, soplang
from normalize import normalize, slug

PLURAL = dict(SHAPES) | {"shape": "shapes"}
REL = {"leftOf": "left_of", "rightOf": "right_of", "above": "above", "below": "below", "near": "next_to", "between": "between"}
REGION = {"center": "center", "top": "top", "bottom": "bottom", "left": "left_side", "right": "right_side", "topLeft": "top_left",
          "topRight": "top_right", "bottomLeft": "bottom_left", "bottomRight": "bottom_right"}
SUPER = {"biggest": "biggest", "smallest": "smallest", "leftmost": "leftmost", "rightmost": "rightmost", "topmost": "topmost",
         "bottommost": "bottommost", "mostConnected": "mostconnected", "leastConnected": "leastconnected", "closest": "closest", "farthest": "farthest"}
QUESTION_EVENT = {"count": "count", "exists": "exists", "list": "list", "property": "property", "describe": "describe", "neighbors": "neighbors",
                  "path": "path", "reachable": "reachable", "cycle": "cycle", "check": "check", "extreme": "extreme", "nearest": "nearest",
                  "connected": "connected", "degree": "degree", "rules": "list"}


class Skip(Exception): pass


def convert(row, lexicon=None, soft=False, lost=None, table=None):
    """soft: never set a row aside for a missing word; a role whose words are not in the clause is left out (listed in `lost`)"""
    lexicon = LEXICON if lexicon is None else lexicon; lost = [] if lost is None else lost
    names = list(row.get("names") or []) + list(row.get("created") or [])
    toks, info = normalize(row["text"], lexicon, names, table=table)
    T = set(toks); w = row["wire"]; a = w.get("args", {}); typ = w.get("type")
    ev = a.get("action") if typ == "command" else QUESTION_EVENT.get(a.get("ask")) if typ == "question" else typ
    if ev not in EVENTS: raise Skip(f"no event for {typ}:{a.get('action') or a.get('ask')}")
    if not (set(EVENTS[ev]) & T):
        if not soft: raise Skip(f"no {ev} verb in the clause")
        lost.append(f"verb of {ev}")
    def need(tok):
        if tok not in T:
            if soft: lost.append(tok); return None
            raise Skip(f"word not in the clause: {tok}")
        return tok
    def ent(v):
        v = str(v)
        if v == "$new":
            for nm in reversed(row.get("created") or []):
                if "n_" + slug(nm) in T: return {"head": "n_" + slug(nm)}, None
            for p in ("it", "them"):
                if p in T: return {"head": p}, None
            if soft: lost.append("$new"); return None, None
            raise Skip("$new not in the clause")
        if v.startswith("mention("):
            kv = dict(x.split("=", 1) for x in v[len("mention("):-1].split(",") if "=" in x)
            plural = kv.get("quantifier") == "all"
            sh = kv.get("shape")
            cands = ([PLURAL[sh], sh] if sh else ["shapes", "shape", "everything"]) if plural else ([sh] if sh else ["shape", "it"])
            head = next((c for c in cands if c in T), None) or next((c for c in ("it", "them", "everything") if c in T), None)
            if head is None:
                if soft: lost.append(f"head of {v}"); return None, None
                raise Skip(f"no head for {v}")
            e = {"head": head}
            if kv.get("color"): e["attr"] = need(kv["color"])
            if kv.get("recency"): e["det"] = need(kv["recency"])
            elif plural: d = next((x for x in ("all", "every", "each") if x in T), None); e.update({"det": d} if d else {})
            return e, kv.get("notcolor")
        n = "n_" + slug(v)
        if n in T: return {"head": n}, None
        for p in ("it", "them", "this", "that"):
            if p in T and p in LEXICON: return {"head": p}, None
        if soft: lost.append(f"name {v}"); return None, None
        raise Skip(f"name not in the clause: {v}")
    roles, neg = {}, None
    def place():
        if "position" not in a: return
        p = a["position"]
        if p in REGION: roles["region"] = need(REGION[p]); return
        if p not in REL:
            if soft: lost.append(f"position {p}"); return
            raise Skip(f"position {p}")
        roles["relation"] = need(REL[p])
        anc = [x.strip() for x in str(a.get("anchor", "")).split(",") if x.strip()]
        if anc: roles["landmark"], _ = ent(anc[0])
        if len(anc) > 1: roles["landmark2"], _ = ent(anc[1])
    if ev == "create":
        sh = a.get("shape", "circle"); cnt = a.get("count")
        head = next((c for c in ([PLURAL[sh], sh] if cnt else [sh]) if c in T), None)
        if head is None and not soft: raise Skip(f"no shape word {sh}")
        if head is None: lost.append(f"shape word {sh}")
        e = {"head": head}
        if a.get("color"): e["attr"] = need(a["color"])
        roles["object"] = e
        if a.get("size"): roles["size"] = need(a["size"])
        if cnt: roles["quantity"] = need(str(cnt))
        if a.get("name"): roles["name"] = need("n_" + slug(a["name"]))
        if a.get("label"): roles["text"] = need("t_" + slug(a["label"]))
        place()
    elif ev in ("delete", "duplicate", "neighbors", "describe", "property", "degree", "toFront", "toBack", "resize", "rename", "label", "set", "align", "arrange", "distribute", "move", "check", "fact", "connected"):
        if a.get("target") is not None:
            tg = [x.strip() for x in str(a["target"]).split(",") if x.strip()] if not str(a["target"]).startswith("mention(") else [a["target"]]
            roles["object"], neg = ent(tg[0])
        elif ev == "describe" and "canvas" in T: roles["object"] = {"head": "canvas"}
        elif ev in ("arrange", "distribute") and "everything" in T: roles["object"] = {"head": "everything"}
        if ev == "duplicate" and a.get("count"): roles["quantity"] = need(str(a["count"]))
        if ev == "rename": roles["name"] = need("n_" + slug(a.get("name", "")))
        if ev == "label": roles["text"] = need("t_" + slug(a.get("label", "")))
        if ev in ("set", "check", "fact"):
            if a.get("color"): roles["color"] = need(a["color"])
            if a.get("shape"): roles["shape"] = need(a["shape"])
            if a.get("size"): roles["size"] = need(a["size"])
            if a.get("notColor"): neg = a["notColor"]
        if ev == "move":
            if a.get("direction"): roles["direction"] = need(a["direction"]); roles.update({"amount": need(str(a["distance"]))} if a.get("distance") else {})
            else: place()
        if ev in ("check", "fact"):
            if a.get("comparison"): roles["comparison"] = need(a["comparison"]); roles["landmark"], _ = ent(a.get("anchor", ""))
            else: place()
        if ev == "connected": roles["landmark"], _ = ent(a.get("anchor", ""))
        if ev in ("align", "distribute") and a.get("axis"): roles["axis"] = need({"horizontal": "horizontally", "vertical": "vertically"}[a["axis"]])
        if ev == "arrange" and a.get("layout"): roles["layout"] = need({"circle": "ring"}.get(a["layout"], a["layout"]))
        if ev in ("toFront", "toBack"): roles["depth"] = need("front" if ev == "toFront" else "back")
    elif ev == "swap":
        x = [s.strip() for s in str(a.get("target", "")).split(",")]
        if len(x) != 2:
            if not soft: raise Skip("swap needs two")
            lost.append("swap needs two")
        roles["object"], _ = ent(x[0])
        if len(x) > 1: roles["target"], _ = ent(x[1])
    elif ev in ("connect", "disconnect", "path", "reachable"):
        if a.get("from") is not None:
            fr = [x.strip() for x in str(a["from"]).split(",")] if not str(a["from"]).startswith("mention(") else [a["from"]]
            if len(fr) > 1:
                if not soft: raise Skip("several sources in one role")
                lost.append("several sources (first kept)")
            roles["source"], neg = ent(fr[0])
        if a.get("to") is not None:
            to = [s.strip() for s in str(a["to"]).split(",")] if not str(a["to"]).startswith("mention(") else [a["to"]]
            if len(to) > 1:
                if not soft: raise Skip("several targets in one role")
                lost.append("several targets (first kept)")
            roles["target"], _ = ent(to[0])
        if ev == "connect":
            if a.get("style"): roles["style"] = need(a["style"])
            if a.get("arrow") == "both": roles["arrow"] = need("two_way")
            if a.get("arrow") == "none" and "plain" in T: roles["arrow"] = "plain"
            edge = next((x for x in ("arrow", "line", "connection") if x in T), None)
            if a.get("color"):
                if not edge and not soft: raise Skip("edge colour without an edge word")
                if edge: roles["edge"] = {"head": edge, "attr": need(a["color"])}
                else: lost.append("edge word")
            elif edge and (a.get("arrow") == "none" or edge != "arrow" or a.get("style")): roles["edge"] = {"head": edge}
            if a.get("label"): roles["text"] = need("t_" + slug(a["label"]))
            if a.get("pairing"): roles["pairing"] = need({"all": "each_other"}.get(a["pairing"], a["pairing"]))
    elif ev in ("count", "exists", "list", "extreme", "nearest", "rule"):
        if a.get("ask") == "rules": roles["object"] = {"head": need("rules")}
        else:
            sh = a.get("shape")
            cands = [PLURAL.get(sh, sh), sh] if sh else ["shapes", "shape"]
            head = next((c for c in cands if c in T), None)
            if head: roles["object"] = {"head": head} | ({"attr": need(a["color"])} if a.get("color") and ev != "rule" else {})
            elif sh:
                if not soft: raise Skip(f"no shape word {sh}")
                lost.append(f"shape word {sh}")
            if ev == "rule":
                if a.get("color"): roles["color"] = need(a["color"])
                if a.get("size"): roles["size"] = need(a["size"])
            if a.get("notColor"): neg = a["notColor"]
            if ev in ("extreme", "nearest"): roles["superlative"] = need(SUPER.get(a.get("superlative"), "?"))
            if ev == "nearest" and a.get("anchor"): roles["landmark"], _ = ent(a["anchor"])
            elif ev in ("count", "exists", "list"): place()
    elif ev in ("undo", "redo", "forget", "cycle"):
        pass
    if neg: roles["notcolor"] = need("not_" + neg)
    clean = {}
    for r, v in roles.items():
        if v is None: continue
        if isinstance(v, dict):
            if v.get("head") is None: continue
            v = {k: x for k, x in v.items() if x is not None}
        clean[r] = v
    return " ".join(toks), clean, ev


def main():
    rows = [json.loads(l) for f in sorted(glob.glob(os.path.join(HERE, "llm_train", "*", "train_*.jsonl"))) for l in open(f) if l.strip()]
    out, why = [], collections.Counter()
    for r in rows:
        try: text, roles, ev = convert(r); out.append((ev, text, roles, f"{ev}.llm.{r.get('id', '?')[:2]}"))
        except Skip as e: why[re.sub(r":.*", "", str(e))] += 1
        except Exception as e: why[f"error {type(e).__name__}"] += 1
    wd = os.path.join(HERE, "worlds", "sketch"); sha = sha256_file(os.path.join(wd, "legend.json"))
    doc = soplang.Doc(directives=[("world", "sketch", None), ("legend", sha, None), ("generated", "training/sketch/llm_to_world.py from llm_train/", None)]); k = 0
    for ev, text, roles, template in out:
        ids = iter(f"l{k + i}" for i in range(1, 100)); ws = wires_for(ev, roles, text, template, ids); k += len(ws); doc.wires += ws
    open(os.path.join(wd, "examples", "train_llm.sop"), "w").write(soplang.write(doc))
    by_ev = collections.Counter(o[0] for o in out)
    rep = [f"# Conversion of the LLM training clauses ({len(rows)} clauses)", "", f"Converted: {len(out)} ({len(out) / max(1, len(rows)) * 100:.1f}%). Set aside: {len(rows) - len(out)}.", "",
           "| reason set aside | n |", "|---|---|"] + [f"| {k} | {v} |" for k, v in why.most_common()] + ["", "| event | converted |", "|---|---|"] + [f"| {k} | {v} |" for k, v in by_ev.most_common()]
    open(os.path.join(HERE, "llm_train", "CONVERSION.md"), "w").write("\n".join(rep) + "\n")
    print("\n".join(rep[:6])); print(dict(why.most_common(12)))


if __name__ == "__main__":
    main()
