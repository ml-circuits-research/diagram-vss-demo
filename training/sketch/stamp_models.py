#!/usr/bin/env python3
"""stamp_models.py: write the content version of every model the browser demo loads (owner's rule 2026-11-02: the browser must
never use an older version of a model after a new one is published).

Version = first 10 hex digits of the sha256 over the model's files (relative path + content, sorted; BUILD.json is not loaded and
is left out). Folder models: a folder with manifest.json (VSS) or, under neural/, with config.json (a transformers.js model).
File models: docs/model/micro/*.json (cutters; not registry*.json) and docs/model/context/*.json.
Writes docs/model/versions.json {"files": {path relative to docs/model: version}} for everything, and the same versions as
fields in docs/model/micro/registry.json ("version" per world, "cutter_version", "event_cutter_version", "context_version",
"fallback_version"). The loader appends ?v=<version> to every model URL. Idempotent: run it before every commit that changes a model.

  python3 training/sketch/stamp_models.py [--model-root docs/model]     # --model-root: a copy to stamp (tests)
"""
import argparse, hashlib, json, os, sys

SKIP = {"BUILD.json"}


def folder_version(path):
    h = hashlib.sha256()
    for dp, dn, fn in os.walk(path):
        dn.sort()
        for f in sorted(fn):
            if f in SKIP: continue
            full = os.path.join(dp, f)
            h.update(os.path.relpath(full, path).replace(os.sep, "/").encode() + b"\0")
            with open(full, "rb") as fh:
                for chunk in iter(lambda: fh.read(1 << 20), b""): h.update(chunk)
            h.update(b"\0")
    return h.hexdigest()[:10]


def file_version(path):
    with open(path, "rb") as fh: return hashlib.sha256(fh.read()).hexdigest()[:10]


def dump(obj, **kw): return json.dumps(obj, indent=1, ensure_ascii=False, **kw) + "\n"


def write_if_changed(path, text):
    old = open(path, encoding="utf-8").read() if os.path.exists(path) else None
    if old != text:
        open(path, "w", encoding="utf-8").write(text); return True
    return False


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser()
    ap.add_argument("--model-root", default=os.path.join(here, "..", "..", "docs", "model"))
    root = os.path.normpath(ap.parse_args().model_root)
    vers = {}
    for dp, dn, fn in os.walk(root):
        dn.sort()
        rel = os.path.relpath(dp, root).replace(os.sep, "/")
        if rel == ".": continue
        if "manifest.json" in fn or (rel.startswith("neural/") and rel.count("/") == 1 and "config.json" in fn):
            vers[rel] = folder_version(dp); dn[:] = []
    for sub in ("micro", "context"):
        d = os.path.join(root, sub)
        for f in sorted(os.listdir(d)) if os.path.isdir(d) else []:
            if f.endswith(".json") and not f.startswith("registry") and os.path.isfile(os.path.join(d, f)): vers[f"{sub}/{f}"] = file_version(os.path.join(d, f))
    vers = dict(sorted(vers.items()))
    vpath = os.path.join(root, "versions.json")
    old = json.load(open(vpath))["files"] if os.path.exists(vpath) else {}
    changes = [(k, old.get(k), v) for k, v in vers.items() if old.get(k) != v] + [(k, old[k], None) for k in old if k not in vers]
    write_if_changed(vpath, dump({"about": "Content versions of the model folders and files the demo loads (training/sketch/stamp_models.py). The loader appends ?v=<version>.", "files": vers}))
    rpath = os.path.join(root, "micro", "registry.json")
    if os.path.exists(rpath):
        reg = json.load(open(rpath)); before = dump(reg)
        def v(p):
            p = (p or "").rstrip("/")
            if p not in vers: sys.exit(f"stamp_models: registry names {p!r}, which has no version (missing folder/file?)")
            return vers[p]
        for w in reg["worlds"]: w["version"] = v(w["model"])
        for key, field in (("cutter", "cutter_version"), ("event_cutter", "event_cutter_version"), ("context", "context_version"), ("fallback", "fallback_version")):
            if reg.get(key): reg[field] = v(reg[key])
        if reg.get("router") == "cutter" and not reg.get("context"): reg["context_version"] = v("context/weights.json")   # the loader's default context file
        if write_if_changed(rpath, dump(reg)): changes.append(("micro/registry.json", None, "fields updated"))
    for k, a, b in changes: print(f"  {k}: {a or '(new)'} -> {b or '(removed)'}")
    print(f"{len(vers)} versions, {len(changes)} changed")


main()
