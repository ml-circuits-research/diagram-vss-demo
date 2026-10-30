#!/usr/bin/env bash
# run_curve.sh: the VSS world `real` trained on a share of the training messages (learning curve): for each share, build the world
# (msg_to_world.py --frac), train (same settings for every share), export to docs/model/real_p<share>. The full share is also exported
# to docs/model/real (the model the demo loads).   Usage: training/sketch/run_curve.sh [shares...]   (default: 0.25 0.5 1.0)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"; SOP="$REPO/training/vss/tool/bin/sop"; W="$HERE/worlds/real"
cd "$HERE"; export VSA_MIN_AVAILABLE_GB="${VSA_MIN_AVAILABLE_GB:-1.5}"   # the trainer's memory guard (default 4 GB) stops on this 6 GB machine
for F in "${@:-0.25 0.5 1.0}"; do
  P=$(python3 -c "print(int(round(float('$F')*100)))")
  python3 msg_to_world.py --frac "$F" | head -3
  "$SOP" check --legend "$W/legend.json" "$W"/examples/*.sop | tail -1
  RUN="${PREFIX:-real}_p${P}_D1024_e2_s0"; rm -rf "runs/$RUN"
  "$SOP" train "$W" --D 1024 --seed 0 --seeds 1 --epochs 2 --shuffle --device cpu --candidate_sets catalog --n_eval 600 --no_ckpt \
    --star_version 2 --threshold_rule fit --run_dir "$HERE/runs/$RUN" > "runs/$RUN.log" 2>&1
  "$SOP" export-web --model "$W/model" --out "$REPO/docs/model/${PREFIX:-real}_p$P" --bits 8 > /dev/null
  cp "${TABLE:-normalize_real.json}" "$REPO/docs/model/${PREFIX:-real}_p$P/normalize.json"
  echo "share $F -> docs/model/${PREFIX:-real}_p$P ($(grep -c . "$W/raw/sentences.txt") rows)"
done
rm -rf "$REPO/docs/model/real"; cp -r "$REPO/docs/model/real_p100" "$REPO/docs/model/real" 2>/dev/null || true
python3 msg_to_world.py > /dev/null   # leave the world folder built from all messages
