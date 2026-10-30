#!/usr/bin/env bash
# run_curve.sh: the VSS world `real` built and trained on a share of the training messages (the share = the messages whose id hashes
# below it: 0.2 / 0.4 / 0.8 are nested subsets of the 80% fit split, 1.0 is every message), exported with its learned front end to
# docs/model/${PREFIX}_p<share>. Same training settings for every share. The 1.0 share is also copied to docs/model/real (the demo's model).
# Usage: PREFIX=final training/sketch/run_curve.sh 0.2 0.4 0.8 1.0
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"; SOP="$REPO/training/vss/tool/bin/sop"; W="$HERE/worlds/real"
cd "$HERE"; export VSA_MIN_AVAILABLE_GB="${VSA_MIN_AVAILABLE_GB:-1.5}"   # the trainer's memory guard (default 4 GB) stops on this 7 GB machine
PREFIX="${PREFIX:-real}"
for F in "$@"; do
  P=$(python3 -c "print(int(round(float('$F')*100)))")
  python3 msg_to_world.py --frac "$F" | head -5
  "$SOP" check --legend "$W/legend.json" "$W"/examples/*.sop | tail -1
  RUN="${PREFIX}_p${P}_D1024_e2_s0"; rm -rf "runs/$RUN"
  "$SOP" train "$W" --D 1024 --seed 0 --seeds 1 --epochs 2 --shuffle --device cpu --candidate_sets catalog --n_eval 600 --no_ckpt \
    --star_version 2 --threshold_rule fit --run_dir "$HERE/runs/$RUN" > "runs/$RUN.log" 2>&1
  rm -rf "$REPO/docs/model/${PREFIX}_p$P"
  "$SOP" export-web --model "$W/model" --out "$REPO/docs/model/${PREFIX}_p$P" --bits 8 > /dev/null
  cp "$W/front.json" "$REPO/docs/model/${PREFIX}_p$P/front.json"
  echo "share $F -> docs/model/${PREFIX}_p$P ($(grep -c . "$W/raw/sentences.txt") rows)"
  if [ "$P" = "100" ]; then rm -rf "$REPO/docs/model/real"; cp -r "$REPO/docs/model/${PREFIX}_p100" "$REPO/docs/model/real"; fi
done
