"""
export_web.py — `sop export-web`: a trained model/ folder -> the files app/src/vss.js loads in the browser (VSS Diagram Editor spec section 6).

  model.json     config (D, seeds, star_version, thresholds, tau, depth estimator, presence readout), the legend (raw json) and its sha256,
                 the kinds lexicon (kinds.tsv) with lemmas and the legend's value patterns, the catalog words with kinds / lemmas, the schema,
                 the legend's reader block, the residual background statistics (scalars only)
  routebook.bin  every array of infer.Routebook (path, bg0, bg, A, L, rel, pos, pc as PHASES quantized to --bits; logits, rel_mask,
                 taker_mask as float32); cats, codes, pos_max in the header
  stars.bin      the stars the reader needs (catalog identities, legend verbs, role vectors, the decoder's operator vectors, the occupancy
                 marker, closed-value symbols), quantized to --bits
  manifest.json  sha256 of the three files, legend sha, training commit, bits, sizes
  stars.json     (--stars generated, manifest format vss-web-3, instead of stars.bin) the keys stars.bin would hold and their bits: the browser
                 regenerates each listed star from its name (star_version 2) and quantizes it exactly as quantize() does, byte for byte the
                 stars.bin values (checked by --from-web against an existing stars.bin), so the reader's decisions do not change.
                 {"format": "vss-stars-generated-1", "star_version": 2, "D", "bits", "quantize": "keys" | "all", "keys": [...]};
                 quantize "all" also quantizes the stars of words outside the keys (experiments, training/sketch/shrink/SHRINK.md)

Binary layout of routebook.bin / stars.bin: 8 bytes magic b"VSSBIN1\\n", uint32 LE header length, the header (UTF-8 JSON), zero padding to
a multiple of 4, then the arrays at the offsets the header gives (relative to the start of the data block). A phase array with bits 8 stores
q = round((wrap(phase) + pi) / (2 pi) * 256) mod 256 per byte, dequantized as q * 2 pi / 256 - pi; bits 4 packs two 16-level values per
byte (low nibble first); bits 32 stores float32 phases unchanged. Phases are wrapped to [-pi, pi): every phase array is used through
exp(i phase) only (path through exp(i cumsum), invariant to multiples of 2 pi), so wrapping changes nothing but the stored range.
Sparse route book (--sparse; manifest format vss-web-2): the K x K tables bg, A and L keep only the rows that training changed. Training
changes only the rows some training sentence reads (train.py LeanTheta); every other row keeps its initial random value (pure noise when a
reader meets that kind pair). A row is "trained" when its stored value differs from its initial value, regenerated here from the seed
(untrained_rows: the V8 phase table stream). Such a table is written as an index array "<name>.rows" (kind "index", uint32 LE, the sorted
flat row numbers i * K + j that are stored) and the table itself (header "rows": "<name>.rows", "absent": "zero", "shape" the FULL shape)
holding only those rows in that order. Reading rule for an absent row: it contributes nothing (the bigram term of that token is left out;
a chain term over that A or L pair is left out). path and bg0 stay dense.
Bits 1, 2, 4 and 6 pack the values as one little-endian bit stream (value i holds stream bits i*bits .. i*bits+bits-1; bits 4 is the
low nibble first, as before).
Usage: sop export-web --model <model dir> --out <dir> [--bits 8|6|4|2|1|32] [--sparse] [--stars bin|generated]
       sop export-web --from-web <export-web dir> --out <dir> --sparse     (an existing dense export made sparse, values byte for byte)
       sop export-web --from-web <export-web dir> --out <dir> --stars generated [--star-bits B] [--star-quantize keys|all]
                      (stars.bin -> stars.json; route book and model.json byte for byte; with the stored bits every stored star is checked
                      against its regenerated quantized star and the export is refused on any difference)
"""
import argparse, hashlib, json, os, sys
import numpy as np

MAGIC = b"VSSBIN1\n"
PHASE_ARRAYS = ("path", "bg0", "bg", "A", "L", "rel", "pos", "pc", "vo", "cthR", "cthL", "cthC", "cbgL", "cbgR")
SPARSE_TABLES = ("bg", "A", "L")       # the K x K x D tables a sparse export stores row by row
FLOAT_ARRAYS = ("logits", "rel_mask", "taker_mask", "verb_mask", "cue_mask", "cA", "cDist", "cbeta", "cN")   # c*: the centre reader
DECODER_OPS = ("pred", "says.scope", "says.speaker", "not", "attr", "det", "wide", "q", "quantity", "must", "may", "if.condition",
               "if.consequence", "and.next")


def wrap(ph): return (np.asarray(ph, dtype=np.float64) + np.pi) % (2 * np.pi) - np.pi


PACKED_BITS = (1, 2, 4, 6)     # phases packed as one little-endian bit stream (value i: bits [i*bits, (i+1)*bits)); bits 4 = low nibble first


def quantize(ph, bits):
    ph = wrap(ph).ravel()
    if bits == 32: return ph.astype("<f4").tobytes()
    if bits != 8 and bits not in PACKED_BITS: raise ValueError(f"bits {bits}: expected 32, 8, 6, 4, 2 or 1")
    L = 1 << bits; q = (np.round((ph + np.pi) / (2 * np.pi) * L).astype(np.int64) % L).astype(np.uint8)
    if bits == 8: return q.tobytes()
    # the bit stream: bit k of value i is stream bit i*bits + k; np.packbits(bitorder="little") fills byte j with stream bits 8j..8j+7
    bitsarr = ((q[:, None] >> np.arange(bits, dtype=np.uint8)[None, :]) & 1).astype(np.uint8).ravel()
    return np.packbits(bitsarr, bitorder="little").tobytes()


def dequantize(buf, bits, count):
    if bits == 32: return np.frombuffer(buf, dtype="<f4", count=count).astype(np.float64)
    if bits == 8: q = np.frombuffer(buf, dtype=np.uint8, count=count).astype(np.float64)
    elif bits in PACKED_BITS:
        b = np.unpackbits(np.frombuffer(buf, dtype=np.uint8, count=(count * bits + 7) // 8), bitorder="little")[:count * bits].reshape(count, bits)
        q = (b.astype(np.int64) << np.arange(bits)[None, :]).sum(1).astype(np.float64)
    else: raise ValueError(bits)
    return q * (2 * np.pi / (1 << bits)) - np.pi


def write_bin(path, header, blobs):
    data = b""; arrays = []
    for meta, blob in blobs:
        pad = (-len(data)) % 4; data += b"\0" * pad
        arrays.append(dict(meta, offset=len(data), nbytes=len(blob))); data += blob
    header = dict(header, arrays=arrays); h = json.dumps(header, separators=(",", ":")).encode("utf-8")
    pad = (-(len(MAGIC) + 4 + len(h))) % 4
    with open(path, "wb") as f: f.write(MAGIC + len(h).to_bytes(4, "little") + h + b"\0" * pad + data)


def read_bin(path):
    """-> (header, {name: numpy array}) with phases DEQUANTIZED to float64 (what the browser reads). A sparse table <name> comes back as
    its stored rows (n x D) plus <name>_rowmap (the full shape without D: the stored row of every kind pair, -1 = absent); the index
    arrays themselves are not returned"""
    raw = open(path, "rb").read()
    assert raw[:8] == MAGIC, f"{path}: not a vss binary"
    n = int.from_bytes(raw[8:12], "little"); header = json.loads(raw[12:12 + n]); start = 12 + n + ((-(12 + n)) % 4)
    blob = lambda a: raw[start + a["offset"]: start + a["offset"] + a["nbytes"]]
    index = {a["name"]: np.frombuffer(blob(a), dtype="<u4").astype(np.int64) for a in header["arrays"] if a["kind"] == "index"}
    out = {}
    for a in header["arrays"]:
        if a["kind"] == "index": continue
        rows = index[a["rows"]] if a.get("rows") else None
        shape = [len(rows), a["shape"][-1]] if rows is not None else a["shape"]
        count = int(np.prod(shape)) if shape else 1
        v = dequantize(blob(a), a["bits"], count) if a["kind"] == "phase" else np.frombuffer(blob(a), dtype="<f4", count=count).astype(np.float64)
        out[a["name"]] = v.reshape(shape)
        if rows is not None:
            rm = np.full(int(np.prod(a["shape"][:-1])), -1, dtype=np.int64); rm[rows] = np.arange(len(rows)); out[a["name"] + "_rowmap"] = rm.reshape(a["shape"][:-1])
    return header, out


def stars_of_web(web_dir):
    """(keys, M) of an export folder, M the phases the browser reads (keys x D, float64): from stars.bin, or for a vss-web-3 export
    (stars.json) the regenerated stars quantized and dequantized as loader.js GeneratedStars does. Words outside the keys are generated
    unquantized by both readers (quantize "keys"); quantize "all" is not reproduced here"""
    man = json.load(open(os.path.join(web_dir, "manifest.json")))
    if not (man.get("stars") or {}).get("source") == "generated":
        h, a = read_bin(os.path.join(web_dir, "stars.bin")); return h["keys"], a["stars"]
    spec = json.load(open(os.path.join(web_dir, man["stars"].get("file", "stars.json")))); model = json.load(open(os.path.join(web_dir, "model.json")))
    if spec.get("quantize", "keys") != "keys": raise ValueError("stars_of_web: quantize 'all' (an experiment) is not reproduced in Python")
    seed, star_seed, D, b = model["config"]["seed"], model["catalog"]["star_seed"], spec["D"], spec["bits"]
    ph = [np.angle(regenerate_star(k, seed, star_seed, D)) for k in spec["keys"]]
    M = np.stack(ph) if b == 32 else np.stack([dequantize(quantize(p, b), b, D) for p in ph])
    return spec["keys"], M


def routebook_from_bin(path):
    """an infer.Routebook built from an exported routebook.bin (dense or sparse), on exactly the numbers the browser reads"""
    from .infer import Routebook
    header, arr = read_bin(path); rb = Routebook.__new__(Routebook)
    rb.cats = list(header["cats"]); rb.cat_id = {c: i for i, c in enumerate(rb.cats)}; rb.codes = list(header["codes"])
    for n in PHASE_ARRAYS + FLOAT_ARRAYS + tuple(t + "_rowmap" for t in SPARSE_TABLES): setattr(rb, n, arr.get(n))
    rb.pos_max = header.get("pos_max"); rb.vo_nmax = header.get("vo_nmax")
    rb.centre_kinds = header.get("centre_kinds"); rb.centre_tokens = header.get("centre_tokens")
    if rb.vo is not None and rb.cue_mask is None: rb.cue_mask = np.zeros(len(rb.cats))
    rb.D = header["D"]
    return rb


def untrained_rows(cats, codes, D, seed, n_vocab, row_equal):
    """{name: bool array over the flat rows of the K x K table} for bg, A, L: True = the stored row is still its initial random value.
    The initial values are regenerated as train.py LeanTheta draws them (V8's constructor stream: np.random.default_rng(200 + seed), the
    P2 x D table and the n_vocab x D identities of V2 skipped, then the P x D phase table); the row numbers come from V8's index tables
    (built at D = 1, no phases kept). row_equal(name, sel, init) -> bool per selected row: the stored row sel[i] equals init[i] (init:
    float32 wrapped initial phases, as export_routebook writes them). Refuses a model whose layout or stream it does not reproduce."""
    if "pos" in codes: raise ValueError("sparse export: models with the position code draw part of their table from a second generator; not supported")
    sys.path.insert(0, EXP)
    import v8_gates as v8
    from .train import Shim, STREAM_ROWS
    m = v8.V8(Shim({c: c for c in cats}), 1, np.random.default_rng(0), list(codes), "cpu", gate_init="closed")
    if list(m.cats) != list(cats): raise ValueError("sparse export: the kinds of V8 differ from the route book's")
    K = len(cats); P2 = 1 + K * K + K; P = m.theta.shape[0]
    idx = {"bg": m.ibg.numpy().reshape(-1), "A": m.iA.numpy().reshape(-1), "L": m.iL.numpy().reshape(-1)}
    same = {n: np.zeros(len(f), dtype=bool) for n, f in idx.items()}
    rng = np.random.default_rng(200 + seed)
    for r0 in range(0, P2 + n_vocab, STREAM_ROWS): rng.uniform(-np.pi, np.pi, (min(STREAM_ROWS, P2 + n_vocab - r0), D))
    for r0 in range(0, P, STREAM_ROWS):
        ch = rng.uniform(-np.pi, np.pi, (min(STREAM_ROWS, P - r0), D))
        for n, f in idx.items():
            sel = np.nonzero((f >= r0) & (f < r0 + len(ch)))[0]
            if len(sel): same[n][sel] = row_equal(n, sel, wrap(ch[f[sel] - r0]).astype(np.float32))
    if not any(v.any() for v in same.values()):
        raise ValueError("sparse export: no row equals its regenerated initial value (seed, vocabulary size or table layout differ); use the dense export")
    return same


EXP = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "experiment")


def sparse_blobs(name, table, keep, bits):
    """(index blob, table blob) of a sparse table: keep = bool over its flat rows"""
    rows = np.nonzero(keep)[0].astype("<u4"); D = table.shape[-1]
    return [({"name": name + ".rows", "kind": "index", "bits": 32, "shape": [len(rows)]}, rows.tobytes()),
            ({"name": name, "kind": "phase", "bits": bits, "shape": list(table.shape), "rows": name + ".rows", "absent": "zero"},
             quantize(np.asarray(table, dtype=float).reshape(-1, D)[rows], bits))]


def star_keys(reader):
    """every (key, vector) the decoder can ask for. Keys: id:<token>, role:<r>, op:<name>, marker, sym:<value>"""
    st, L = reader.st, reader.legend; out = {}
    words = set(reader.words) | set(L.lexicon) | set(L.all_verbs()) | set(L.lemma.values())
    from .world import value_token
    for w in sorted(words): out["id:" + value_token(w)] = st.id(w)
    for r in L.roles: out["role:" + r] = st.role(r)
    for o in DECODER_OPS: out["op:" + o] = st.op(o)
    out["marker"] = st.marker()
    for r, vals in (L.reader.get("closed_values") or {}).items():
        for v in vals: out["sym:" + str(v)] = st.get("sym:" + str(v), st.star_seed)
    return out


def generated_stars_doc(keys, D, bits, quantize="keys"):
    return {"format": "vss-stars-generated-1", "star_version": 2, "D": int(D), "bits": int(bits), "quantize": quantize, "keys": sorted(keys)}


def regenerate_star(key, seed, star_seed, D):
    """the star_version 2 vector of a stars.bin key (loader.js GeneratedStars: "marker" = op:marker under the world seed, id: / sym: under
    the catalog's star seed, the rest under the world seed)"""
    from .world import star_v2
    if key == "marker": return star_v2(seed, "op:marker", D)
    return star_v2(star_seed if key.startswith(("id:", "sym:")) else seed, key, D)


def check_generatable(cfg, catalog_meta):
    if int(cfg.get("star_version", 1) or 1) != 2: raise ValueError("--stars generated needs a star_version 2 model")
    if catalog_meta.get("identity_table") or cfg.get("star_table") or catalog_meta.get("star_table"):
        raise ValueError("--stars generated: identity_table / star_table models draw stars that are not the portable function; keep stars.bin")


def export(model_dir, out_dir, bits=8, sparse=False, stars_mode="bin"):
    from .infer import Reader
    rd = Reader(model_dir); os.makedirs(out_dir, exist_ok=True); rb = rd.rb
    # ---- routebook.bin
    blobs = []; untrained = None
    if sparse:     # the stored float32 rows against the regenerated float32 initial rows, exactly
        tabs = {n: np.asarray(getattr(rb, n)).reshape(-1, rb.D) for n in SPARSE_TABLES}
        untrained = untrained_rows(rb.cats, rb.codes, rb.D, rd.cfg["seed"], len(rd.words),
                                   lambda n, sel, init: (tabs[n][sel].astype(np.float32) == init).all(1))
    for name in PHASE_ARRAYS:
        v = getattr(rb, name, None)
        if v is None: continue
        if untrained is not None and name in untrained:
            blobs += sparse_blobs(name, np.asarray(v), ~untrained[name], bits); continue
        # float64 as before (infer.Routebook keeps bg / A / L as stored, float32; the conversion is exact), one table at a time
        blobs.append(({"name": name, "kind": "phase", "bits": bits, "shape": list(v.shape)}, quantize(np.asarray(v, dtype=float), bits)))
    for name in FLOAT_ARRAYS:
        v = getattr(rb, name, None)
        if v is None: continue
        blobs.append(({"name": name, "kind": "float", "bits": 32, "shape": list(v.shape)}, np.asarray(v, dtype="<f4").tobytes()))
    hdr = {"cats": rb.cats, "codes": rb.codes, "pos_max": rb.pos_max, "vo_nmax": rb.vo_nmax, "D": rb.D, "bits": bits}
    if rb.centre_kinds is not None: hdr["centre_kinds"] = rb.centre_kinds          # the centre reader (legend reader.centres)
    if getattr(rb, "centre_tokens", None) is not None: hdr["centre_tokens"] = rb.centre_tokens   # run 2: phase rows keyed by the centre's token
    if untrained is not None: hdr["sparse"] = {"rule": "zero", "tables": list(SPARSE_TABLES)}
    write_bin(os.path.join(out_dir, "routebook.bin"), hdr, blobs)
    # ---- stars.bin
    stars = star_keys(rd); keys = sorted(stars)
    if stars_mode == "generated":
        check_generatable(rd.cfg, rd.cat)
        sb = 8 if bits == 32 else bits       # float32 stars cannot be regenerated exactly: the generated stars are quantized to 8 bits then
        for k in keys:                       # the regenerated star must be the reader's star (same seeds, same function)
            if not np.allclose(regenerate_star(k, rd.cfg["seed"], rd.cat.get("star_seed"), rd.D), stars[k], atol=1e-9): raise ValueError(f"star {k}: not the portable star")
        with open(os.path.join(out_dir, "stars.json"), "w") as f: json.dump(generated_stars_doc(keys, rd.D, sb), f, separators=(",", ":"))
        if os.path.exists(os.path.join(out_dir, "stars.bin")): os.remove(os.path.join(out_dir, "stars.bin"))
    else:
        M = np.stack([np.angle(stars[k]) for k in keys])
        write_bin(os.path.join(out_dir, "stars.bin"), {"keys": keys, "D": rd.D, "bits": bits},
                  [({"name": "stars", "kind": "phase", "bits": bits, "shape": list(M.shape)}, quantize(M, bits))])
    # ---- model.json
    L = rd.legend; bg = {}
    if rd.background is not None:
        for k, v in rd.background.items():
            if np.ndim(v) == 0: bg[k] = float(v)
    model = {"format": "vss-web-1", "world": rd.cfg.get("world"), "config": rd.cfg, "legend": L.raw, "legend_sha256": L.sha,
             "lexicon": {w: ({"kind": k, "lemma": L.lemma[w]} if w in L.lemma else {"kind": k}) for w, k in sorted(L.lexicon.items())},
             "values": L.raw.get("values", []), "reader": L.reader, "catalog": {"words": rd.words, "star_seed": rd.cat.get("star_seed"),
             "star_version": rd.cfg.get("star_version", 1), "identity_table": bool(rd.cat.get("identity_table"))},
             "schema": rd.schema, "background": bg, "bits": bits}
    with open(os.path.join(out_dir, "model.json"), "w") as f: json.dump(model, f, separators=(",", ":"))
    man = {"format": "vss-web-2" if sparse else "vss-web-1", "legend_sha256": L.sha, "training_code_commit": rd.cfg.get("training_code_commit"),
           "bits": bits, "star_version": rd.cfg.get("star_version", 1), "D": rd.D, "n_stars": len(keys)}
    if untrained is not None: man["sparse"] = sparse_summary(untrained)
    if stars_mode == "generated": man["format"] = "vss-web-3"; man["stars"] = {"source": "generated", "file": "stars.json", "bits": 8 if bits == 32 else bits}
    return write_manifest(out_dir, man)


def sparse_summary(untrained):
    return {"rule": "zero", "stored_rows": {n: int((~v).sum()) for n, v in untrained.items()}, "rows": {n: int(len(v)) for n, v in untrained.items()}}


def write_manifest(out_dir, man):
    files = ["model.json", "routebook.bin", man.get("stars", {}).get("file", "stars.json") if man.get("stars") else "stars.bin"]
    man = dict(man, files={fn: {"sha256": hashlib.sha256(open(os.path.join(out_dir, fn), "rb").read()).hexdigest(), "bytes": os.path.getsize(os.path.join(out_dir, fn))} for fn in files})
    with open(os.path.join(out_dir, "manifest.json"), "w") as f: json.dump(man, f, indent=1)
    return man


def sparsify_web(src, out_dir):
    """an existing DENSE export (model.json, routebook.bin, stars.bin, manifest.json, front.json if any) -> a sparse export in out_dir:
    the stored bytes of every kept row and of every other array unchanged; untrained rows found by comparing the stored bytes with the
    regenerated initial rows quantized exactly as export() quantizes them (wrap -> float32 -> wrap -> bits)"""
    import shutil
    raw = open(os.path.join(src, "routebook.bin"), "rb").read()
    assert raw[:8] == MAGIC, "not a vss binary"
    n = int.from_bytes(raw[8:12], "little"); hdr = json.loads(raw[12:12 + n]); start = 12 + n + ((-(12 + n)) % 4)
    if hdr.get("sparse"): raise ValueError(f"{src}: already sparse")
    model = json.load(open(os.path.join(src, "model.json"))); man0 = json.load(open(os.path.join(src, "manifest.json")))
    meta = {a["name"]: a for a in hdr["arrays"]}; D = hdr["D"]
    blob = lambda a: raw[start + a["offset"]: start + a["offset"] + a["nbytes"]]
    def rowbytes(a):
        if a["bits"] == 32: return 4 * D
        if (D * a["bits"]) % 8: raise ValueError("rows not byte aligned")
        return D * a["bits"] // 8
    stored = {t: np.frombuffer(blob(meta[t]), dtype=np.uint8).reshape(-1, rowbytes(meta[t])) for t in SPARSE_TABLES}
    def row_equal(name, sel, init):
        q = np.frombuffer(quantize(np.asarray(init, dtype=float), meta[name]["bits"]), dtype=np.uint8).reshape(len(sel), -1)
        return (q == stored[name][sel]).all(1)
    untrained = untrained_rows(hdr["cats"], hdr["codes"], D, model["config"]["seed"], len(model["catalog"]["words"]), row_equal)
    blobs = []
    for a in hdr["arrays"]:
        m = {k: v for k, v in a.items() if k not in ("offset", "nbytes")}
        if a["name"] in untrained:
            rows = np.nonzero(~untrained[a["name"]])[0].astype("<u4")
            blobs.append(({"name": a["name"] + ".rows", "kind": "index", "bits": 32, "shape": [len(rows)]}, rows.tobytes()))
            blobs.append((dict(m, rows=a["name"] + ".rows", absent="zero"), stored[a["name"]][rows].tobytes()))
        else: blobs.append((m, blob(a)))
    h = {k: v for k, v in hdr.items() if k != "arrays"}; h["sparse"] = {"rule": "zero", "tables": list(SPARSE_TABLES)}
    os.makedirs(out_dir, exist_ok=True); write_bin(os.path.join(out_dir, "routebook.bin"), h, blobs)
    for fn in ("model.json", "stars.bin", "stars.json", "front.json"):
        if os.path.exists(os.path.join(src, fn)): shutil.copyfile(os.path.join(src, fn), os.path.join(out_dir, fn))
    man = {k: v for k, v in man0.items() if k != "files"}; man["format"] = "vss-web-2"; man["sparse"] = sparse_summary(untrained)
    man["sparse"]["from"] = {"routebook.bin": man0["files"]["routebook.bin"]}
    return write_manifest(out_dir, man)


def generate_stars_web(src, out_dir, star_bits=None, quantize_mode="keys"):
    """an existing export with stars.bin -> the same export with generated stars (stars.json, format vss-web-3). model.json, routebook.bin
    and front.json are copied byte for byte. With star_bits None (the stored bits) every stored star is compared byte for byte with its
    regenerated star quantized the same way, and any difference refuses the conversion: the browser then reads exactly the stars.bin
    values. Other star_bits (or quantize "all") are experiments: they change the stars and are marked so in the manifest."""
    import shutil
    model = json.load(open(os.path.join(src, "model.json"))); man0 = json.load(open(os.path.join(src, "manifest.json")))
    check_generatable(model["config"], model["catalog"])
    raw = open(os.path.join(src, "stars.bin"), "rb").read(); assert raw[:8] == MAGIC, "stars.bin: not a vss binary"
    n = int.from_bytes(raw[8:12], "little"); hdr = json.loads(raw[12:12 + n]); start = 12 + n + ((-(12 + n)) % 4)
    a = hdr["arrays"][0]; D = hdr["D"]; keys = hdr["keys"]; bits0 = a["bits"]
    if bits0 == 32: raise ValueError("stars.bin holds float32 stars: generated stars are quantized; export again with --bits 8")
    data = raw[start + a["offset"]: start + a["offset"] + a["nbytes"]]; per = D * bits0 // 8
    seed, star_seed = model["config"]["seed"], model["catalog"]["star_seed"]
    exact = star_bits is None and quantize_mode == "keys"
    if star_bits is None:
        for i, k in enumerate(keys):
            q = quantize(np.angle(regenerate_star(k, seed, star_seed, D)), bits0)
            if q != data[i * per:(i + 1) * per]: raise ValueError(f"{src}: star {k} differs from its regenerated quantized star; keep stars.bin")
    os.makedirs(out_dir, exist_ok=True)
    for fn in ("model.json", "routebook.bin", "front.json"):
        if os.path.exists(os.path.join(src, fn)): shutil.copyfile(os.path.join(src, fn), os.path.join(out_dir, fn))
    sb = bits0 if star_bits is None else star_bits
    with open(os.path.join(out_dir, "stars.json"), "w") as f: json.dump(generated_stars_doc(keys, D, sb, quantize_mode), f, separators=(",", ":"))
    man = {k: v for k, v in man0.items() if k != "files"}; man["format"] = "vss-web-3"
    man["stars"] = {"source": "generated", "file": "stars.json", "bits": sb, "quantize": quantize_mode,
                    "checked": f"{len(keys)} stars equal stars.bin byte for byte" if exact else "experiment: the stars differ from stars.bin",
                    "from": {"stars.bin": man0["files"]["stars.bin"]}}
    return write_manifest(out_dir, man)


def main(argv=None):
    ap = argparse.ArgumentParser(prog="sop export-web"); ap.add_argument("--model"); ap.add_argument("--from-web", dest="from_web")
    ap.add_argument("--out", required=True); ap.add_argument("--bits", type=int, default=8, choices=[1, 2, 4, 6, 8, 32])
    ap.add_argument("--sparse", action="store_true", help="store only the trained rows of bg, A, L (format vss-web-2)")
    ap.add_argument("--stars", choices=["bin", "generated"], default="bin", help="generated: stars.json (keys) instead of stars.bin (format vss-web-3)")
    ap.add_argument("--star-bits", dest="star_bits", type=int, choices=[1, 2, 4, 6, 8, 32], help="--from-web --stars generated: experiments only")
    ap.add_argument("--star-quantize", dest="star_quantize", choices=["keys", "all"], default="keys"); a = ap.parse_args(argv)
    if (a.model is None) == (a.from_web is None): ap.error("give exactly one of --model, --from-web")
    if a.from_web and a.sparse == (a.stars == "generated"): ap.error("--from-web takes exactly one of --sparse, --stars generated (each keeps the other files byte for byte)")
    if a.from_web and a.stars == "generated": man = generate_stars_web(a.from_web, a.out, a.star_bits, a.star_quantize)
    else: man = sparsify_web(a.from_web, a.out) if a.from_web else export(a.model, a.out, a.bits, a.sparse, a.stars)
    if man.get("sparse"):
        sp = man["sparse"]; print("export-web: sparse route book, stored rows " + ", ".join(f"{k} {sp['stored_rows'][k]}/{sp['rows'][k]}" for k in sp["rows"]))
    if man.get("stars"): print(f"export-web: generated stars ({man['stars']['bits']} bits): " + man["stars"].get("checked", "keys listed in stars.json"))
    tot = sum(f["bytes"] for f in man["files"].values())
    print(f"export-web: {a.model or a.from_web} -> {a.out} (bits {man['bits']}, D {man['D']}, star_version {man['star_version']}, {man['n_stars']} stars): "
          + ", ".join(f"{k} {v['bytes'] / 1e6:.3f} MB" for k, v in man["files"].items()) + f"; total {tot / 1e6:.3f} MB")
    if man["star_version"] == 1:
        print("export-web: NOTE star_version 1 — the browser reads only the exported stars; words outside the catalog get no identity "
              "(train with --star_version 2 for a model whose new words, labels and numbers are read in the browser)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
