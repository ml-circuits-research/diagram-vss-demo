#!/usr/bin/env python3
"""requant_routebook.py: an exported world (export-web folder) with its route book's phases quantized to other bits, from the trained
float32 values (worlds_micro/<world>/model/routebook.npz), not from the 8-bit file (training/sketch/shrink/SHRINK.md).

The stored rows of the sparse tables, the float arrays (logits, masks), the index arrays and the header are kept as they are; only the
phase arrays are quantized again (export_web.quantize, bits 8, 6, 4, 2 or 1). --bits 8 must give back the shipped routebook.bin byte for
byte: the script checks it on every run (a run with another --bits also re-quantizes at 8 and compares, so a drifted npz is refused).
model.json, front.json and the stars (stars.bin or stars.json) are copied unchanged; manifest.json is rewritten (bits = the route book's).

  python3 training/sketch/shrink/requant_routebook.py --web docs/model/micro/shapes7c --npz training/sketch/worlds_micro/shapes7c/model/routebook.npz \
      --bits 4 --out <scratch>/rb4/shapes7c
"""
import argparse, json, os, shutil, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "vss", "tool"))
from sop import export_web as E  # noqa: E402


def parse(raw):
    assert raw[:8] == E.MAGIC, "not a vss binary"
    n = int.from_bytes(raw[8:12], "little"); hdr = json.loads(raw[12:12 + n]); start = 12 + n + ((-(12 + n)) % 4)
    return hdr, (lambda a: raw[start + a["offset"]: start + a["offset"] + a["nbytes"]])


def requant(raw, z, bits):
    hdr, blob = parse(raw); D = hdr["D"]
    index = {a["name"]: np.frombuffer(blob(a), dtype="<u4").astype(np.int64) for a in hdr["arrays"] if a["kind"] == "index"}
    blobs = []
    for a in hdr["arrays"]:
        meta = {k: v for k, v in a.items() if k not in ("offset", "nbytes")}
        if a["kind"] != "phase": blobs.append((meta, blob(a))); continue
        if a["name"] not in z.files: raise ValueError(f"phase array {a['name']} is not in the npz")
        v = np.asarray(z[a["name"]], dtype=float)
        if list(v.shape) != list(a["shape"]): raise ValueError(f"{a['name']}: npz shape {v.shape} != exported {a['shape']}")
        if a.get("rows"): v = v.reshape(-1, D)[index[a["rows"]]]
        blobs.append((dict(meta, bits=bits), E.quantize(v, bits)))
    return dict({k: v for k, v in hdr.items() if k != "arrays"}, bits=bits), blobs


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--web", required=True); ap.add_argument("--npz", required=True)
    ap.add_argument("--bits", type=int, required=True, choices=[1, 2, 4, 6, 8]); ap.add_argument("--out", required=True); a = ap.parse_args()
    raw = open(os.path.join(a.web, "routebook.bin"), "rb").read(); z = np.load(a.npz, allow_pickle=False)
    if parse(raw)[0].get("bits", 8) != 8: sys.exit(f"{a.web}: the source route book must be the 8-bit export")
    os.makedirs(a.out, exist_ok=True); tmp = os.path.join(a.out, "routebook.check8.bin")
    E.write_bin(tmp, *requant(raw, z, 8)); same = open(tmp, "rb").read() == raw; os.remove(tmp)
    if not same: sys.exit(f"{a.web}: re-quantizing the npz at 8 bits does not give the shipped routebook.bin back (npz and export differ)")
    E.write_bin(os.path.join(a.out, "routebook.bin"), *requant(raw, z, a.bits))
    for fn in ("model.json", "front.json", "stars.bin", "stars.json"):
        if os.path.exists(os.path.join(a.web, fn)): shutil.copyfile(os.path.join(a.web, fn), os.path.join(a.out, fn))
    man = {k: v for k, v in json.load(open(os.path.join(a.web, "manifest.json"))).items() if k != "files"}
    man["bits"] = a.bits; man["requant"] = {"from": "routebook.npz (float32)", "checked": "bits 8 gives the shipped routebook.bin byte for byte"}
    man = E.write_manifest(a.out, man)
    print(f"{a.out}: route book {a.bits} bits, {man['files']['routebook.bin']['bytes'] / 1e6:.3f} MB")


main()
