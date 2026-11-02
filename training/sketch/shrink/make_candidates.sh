#!/bin/bash
# make_candidates.sh: the candidate exports of SHRINK.md, written OUTSIDE docs/model (the shipped worlds are not touched).
#   bash training/sketch/shrink/make_candidates.sh <out_dir>
# For each of the 7 worlds of docs/model/micro/registry.json, folders <out_dir>/<variant>/<world> and a registry <out_dir>/<variant>/registry.json
# (the shipped registry with every world's "model" pointing at the candidate folder; cutters and context unchanged):
#   gen8        stars generated (vss-web-3, stars.json): every stored star checked byte for byte against stars.bin; route book unchanged
#   sfloat      stars generated as float phases (no quantization)                        (experiment)
#   s6 s4 s2 s1 stars generated and quantized to 6 / 4 / 2 / 1 bits, every star (quantize "all")   (experiment; s1 = bipolar +-1 stars)
#   rb6 rb4 rb2 rb1  gen8 with the route book re-quantized from the float32 npz to 6 / 4 / 2 / 1 bits (requant_routebook.py)   (experiment)
#   b6 b4 b2 b1 both: route book and stars at 6 / 4 / 2 / 1 bits                              (experiment; b1 = dense binary vectors)
set -eu
cd "$(dirname "$0")/../../.."
OUT=${1:?out dir}; mkdir -p "$OUT"
SOP=training/vss/tool/bin/sop
WORLDS=$(python3 -c "import json; print(' '.join(w['model'].split('/')[-1] for w in json.load(open('docs/model/micro/registry.json'))['worlds']))")
for w in $WORLDS; do
  src=docs/model/micro/$w; npz=training/sketch/worlds_micro/$w/model/routebook.npz
  $SOP export-web --from-web "$src" --out "$OUT/gen8/$w" --stars generated > /dev/null
  $SOP export-web --from-web "$src" --out "$OUT/sfloat/$w" --stars generated --star-bits 32 --star-quantize all > /dev/null
  for b in 6 4 2 1; do
    $SOP export-web --from-web "$src" --out "$OUT/s$b/$w" --stars generated --star-bits $b --star-quantize all > /dev/null
    python3 training/sketch/shrink/requant_routebook.py --web "$OUT/gen8/$w" --npz "$npz" --bits $b --out "$OUT/rb$b/$w" > /dev/null
    python3 training/sketch/shrink/requant_routebook.py --web "$OUT/s$b/$w" --npz "$npz" --bits $b --out "$OUT/b$b/$w" > /dev/null
  done
  echo "$w done"
done
for v in gen8 sfloat s6 s4 s2 s1 rb6 rb4 rb2 rb1 b6 b4 b2 b1; do
  python3 - "$OUT/$v" <<'E'
import json, os, sys
d = os.path.abspath(sys.argv[1]); reg = json.load(open("docs/model/micro/registry.json"))
for w in reg["worlds"]: w["model"] = os.path.join(d, w["model"].split("/")[-1])
reg["about"] = f"SHRINK.md candidate {os.path.basename(d)} (make_candidates.sh); cutters and context: the shipped ones"
json.dump(reg, open(os.path.join(d, "registry.json"), "w"), indent=1)
E
done
du -sb "$OUT"/*/ | sort -k2
