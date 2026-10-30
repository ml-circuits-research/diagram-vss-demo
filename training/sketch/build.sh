#!/usr/bin/env bash
# build.sh: the whole sketch-world pipeline, from the legend to the files the demo loads.
#   1. generate the world folder (legend, lexicon, examples) and the eval files
#   2. sop check, 3. sop train (CPU is enough: about 10-20 minutes at D 1024 on 2 cores), 4. sop export-web into docs/model/sketch
#   5. the benchmark sets (docs/bench), 6. the normalizer parity test (Python vs docs/js/snorm.js)
# Needs: Python with numpy and torch (SOP_PYTHON), node >= 18. The training tool is in training/vss (copied from vss-demo, see its PROVENANCE.md).
# Usage: training/sketch/build.sh [--D 1024] [--epochs 2] [--n 8000] [--seed 0] [--bits 8]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"
VSS_DEMO="${VSS_DEMO:-$REPO/training/vss}"; export VSS_DEMO
D=1024; EPOCHS=2; N=8000; SEED=0; BITS=8
while [ $# -gt 0 ]; do case "$1" in --D) D=$2; shift 2;; --epochs) EPOCHS=$2; shift 2;; --n) N=$2; shift 2;; --seed) SEED=$2; shift 2;; --bits) BITS=$2; shift 2;; *) echo "unknown option $1"; exit 1;; esac; done
SOP="$VSS_DEMO/tool/bin/sop"; W="$HERE/worlds/sketch"; RUN="sketch_n${N}_D${D}_e${EPOCHS}_s${SEED}_calattr"
# the calibration patch (RESULTS.md, finding 2) must be in the tool's train.py (it is in training/vss)
grep -q "diagram-vss-demo patch" "$VSS_DEMO/tool/sop/train.py" || { echo "train.py lacks the calibration patch: git apply patches/vss-demo_calibrate_attr_all.patch in $VSS_DEMO"; exit 1; }
cd "$HERE"
python3 generate.py --out "$W" --n "$N" --n_eval 300 --seed "$SEED"
"$SOP" check --legend "$W/legend.json" "$W"/examples/*.sop
"$SOP" train "$W" --D "$D" --seed "$SEED" --seeds 1 --epochs "$EPOCHS" --shuffle --device cpu --candidate_sets catalog --n_eval 600 --no_ckpt \
  --star_version 2 --calibrate_on_heldout_formulations --threshold_rule fit --run_dir "$HERE/runs/$RUN" | tee "$HERE/runs/$RUN.log"
"$SOP" export-web --model "$W/model" --out "$REPO/docs/model/sketch" --bits "$BITS"
cp normalize.json "$REPO/docs/model/sketch/normalize.json"
node make_bench.mjs
python3 - <<'EOF'
import json, sys
sys.path.insert(0, ".")
from generate import LEXICON
from normalize import normalize
rows = [json.loads(l) for f in ["eval/seen.jsonl", "eval/new_identities.jsonl", "eval/heldout_formulations.jsonl"] for l in open(f)]
bench = [r["text"] for f in ["hand", "blind"] for r in json.load(open(f"../../docs/bench/{f}.json"))]
json.dump({"lexicon": sorted(LEXICON), "cases": [{"text": t, "tokens": normalize(t, LEXICON)[0]} for t in [r["text"] for r in rows] + bench]}, open("/tmp/sketch_norm_golden.json", "w"))
EOF
node parity.mjs /tmp/sketch_norm_golden.json
echo "done: model in docs/model/sketch, run log runs/$RUN.log"
