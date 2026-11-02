"""parity_reader.py: the golden file of the one-request reader's parity test (parity_reader.mjs). Python reads every annotated span of
the given messages with the numpy reader (tool/sop/infer.py Reader.formalize) on EXACTLY the numbers the browser reads: an export-web
folder only (model.json, routebook.bin dense or sparse, stars.bin or stars.json (generated stars), front.json), no trained model folder needed. The span is normalized
by front.normalize (the message's names); written per span: the tokens, the SOP text of the reading, its status and residual.
The JS side (docs/js/vss.js read + docs/js/front.js normalize) must give the same tokens, SOP texts and statuses; residuals are compared
with a stated tolerance.
With --excl the reader runs with the switch EXCL (training/sketch/DECODE.md): the exclusion pairs of <export-web dir>/decode.json.
Usage: python3 parity_reader.py --web <export-web dir> --msgs <jsonl> [--msgs <jsonl> ...] --out <golden.json> [--excl]"""
import argparse, json, os, sys, tempfile
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "..", "vss", "tool"))
import front as FR
from sop.infer import Reader, idgen
from sop import soplang, export_web


def web_reader(web_dir):
    """a numpy Reader built from an export-web folder: config, legend and catalog from model.json (the legend file is rewritten, so its
    file hash differs: force=True, the hash of model.json is the one written in the SOP text), the route book and the stars dequantized
    from routebook.bin / stars.bin, the sentence's own words as candidates (as docs/js/vss.js is loaded in llm_score.mjs)"""
    model = json.load(open(os.path.join(web_dir, "model.json")))
    if model["catalog"].get("identity_table"): raise SystemExit("parity_reader: identity_table models are not supported (the export keeps only a flag)")
    d = tempfile.mkdtemp(prefix="parity_reader_")
    json.dump(model["config"], open(os.path.join(d, "config.json"), "w"))
    json.dump(model["legend"], open(os.path.join(d, "legend.json"), "w"))
    json.dump({"words": model["catalog"]["words"], "schema": model["schema"], "star_seed": model["catalog"]["star_seed"],
               "star_version": model["catalog"].get("star_version", 1)}, open(os.path.join(d, "catalog.json"), "w"))
    rd = Reader(d, force=True, sentence_candidates=True, routebook=export_web.routebook_from_bin(os.path.join(web_dir, "routebook.bin")))
    keys, M = export_web.stars_of_web(web_dir)   # stars.bin, or the generated stars of a vss-web-3 export (SHRINK.md)
    table = {k: np.exp(1j * M[i]) for i, k in enumerate(keys)}
    st = rd.st; get0 = st.get
    def get(name, seed=None): return table[name] if name in table else get0(name, seed)
    st.get = get
    st.marker = lambda: table["marker"] if "marker" in table else get0("op:marker")
    return rd, model


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--web", required=True); ap.add_argument("--msgs", required=True, action="append")
    ap.add_argument("--out", required=True); ap.add_argument("--excl", action="store_true"); a = ap.parse_args()
    rd, model = web_reader(a.web); F = json.load(open(os.path.join(a.web, "front.json")))
    if a.excl: rd.excl_pairs = json.load(open(os.path.join(a.web, "decode.json")))["excl_pairs"]
    directives = [("world", model.get("world") or "?", None), ("legend", model["legend_sha256"], None)]
    cases = []
    for path in a.msgs:
        for line in open(path):
            if not line.strip(): continue
            m = json.loads(line)
            if not m.get("wires") or not all(w.get("span") for w in m["wires"]): continue
            for j, w in enumerate(m["wires"]):
                toks, _ = FR.normalize(w["span"], m.get("names") or [], F)
                wires, frame, info = rd.formalize(" ".join(toks), 0, idgen())
                cases.append({"id": f"{m.get('id')}#{j}", "span": w["span"], "names": m.get("names") or [], "tokens": toks,
                              "sop": soplang.write(soplang.Doc(directives=directives, wires=wires)), "status": info["status"], "residual": info["residual"]})
    json.dump(dict({"web": a.web, "cases": cases}, **({"excl": True} if a.excl else {})), open(a.out, "w"))
    print(f"golden: {len(cases)} spans -> {a.out}")


if __name__ == "__main__":
    main()
