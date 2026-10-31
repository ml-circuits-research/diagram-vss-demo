"""parity_centres.py: the golden file of the centre reader's parity test (parity_centres.mjs). Python reads whole messages with the numpy
reader (tool/sop/infer.py Reader.read_message) on EXACTLY the numbers the browser reads: the route book and the stars as exported by
`sop export-web` (dequantized), the message tokens from front.normalize_message. Written per message: the tokens, per centre its position,
null probability, acceptance, members, SOP text of its reading, status, residual, and its state (complex, for the first --n_states
messages); the ignored spans. The JS side (docs/js/vss.js readMessage + docs/js/front.js normalizeMessage) must give the same tokens,
centres, members, SOP texts, statuses and ignored spans; the numbers are compared with a stated tolerance.
Usage: python3 parity_centres.py --model <model dir with routebook.npz> --web <export-web dir> --msgs <jsonl> --out <golden.json>"""
import argparse, json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, "..", "vss", "tool"))
import front as FR
from sop.infer import Reader, idgen
from sop import soplang, export_web


def web_reader(model_dir, web_dir):
    """a numpy Reader whose route book arrays and stars are the browser's (dequantized from routebook.bin / stars.bin), with the sentence's
    own words as candidates (sentence_candidates: what docs/js/vss.js is loaded with in llm_score.mjs and the editor)"""
    rd = Reader(model_dir, sentence_candidates=True)
    _, arr = export_web.read_bin(os.path.join(web_dir, "routebook.bin"))
    for n, v in arr.items(): setattr(rd.rb, n, v)
    sh, sa = export_web.read_bin(os.path.join(web_dir, "stars.bin")); M = sa["stars"]
    table = {k: np.exp(1j * M[i]) for i, k in enumerate(sh["keys"])}
    st = rd.st; get0 = st.get
    def get(name, seed=None): return table[name] if name in table else get0(name, seed)
    st.get = get
    st.marker = lambda: table["marker"] if "marker" in table else get0("op:marker")
    return rd


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--model", required=True); ap.add_argument("--web", required=True); ap.add_argument("--msgs", required=True)
    ap.add_argument("--out", required=True); ap.add_argument("--n", type=int, default=0); ap.add_argument("--n_states", type=int, default=20)
    a = ap.parse_args()
    rd = web_reader(a.model, a.web); F = json.load(open(os.path.join(a.web, "front.json")))
    msgs = [json.loads(l) for l in open(a.msgs) if l.strip()]
    if a.n: msgs = msgs[:a.n]
    cases = []
    for k, m in enumerate(msgs):
        toks, src, info = FR.normalize_message(m["text"], m.get("names") or [], F)
        r = rd.read_message(" ".join(toks), 0, idgen())
        cs = []
        if k < a.n_states: _, _, _, S = rd.centre_chart(r["tokens"])
        for j, c in enumerate(r["centres"]):
            o = {"pos": c["pos"], "null": c["null"], "accepted": c["accepted"], "members": c["members"]}
            if c["accepted"]:
                o.update(sop=soplang.write(soplang.Doc(directives=[("world", rd.cfg.get("world", "?"), None), ("legend", rd.legend.sha, None)], wires=c["wires"])),
                         status=c["info"]["status"], residual=c["info"]["residual"])
            if k < a.n_states: o["S"] = [S[j].real.tolist(), S[j].imag.tolist()]
            cs.append(o)
        cases.append({"id": m.get("id"), "text": m["text"], "names": m.get("names") or [], "tokens": r["tokens"], "centres": cs, "ignored": r["ignored"]})
    json.dump({"model": a.model, "web": a.web, "cases": cases}, open(a.out, "w"))
    print(f"golden: {len(cases)} messages, {sum(len(c['centres']) for c in cases)} centres -> {a.out}")


if __name__ == "__main__":
    main()
