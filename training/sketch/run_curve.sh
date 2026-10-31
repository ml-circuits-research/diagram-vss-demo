#!/usr/bin/env bash
# run_curve.sh: the VSS world `real` built and trained on a share of the training messages (the share = the messages whose id hashes
# below it: 0.2 / 0.4 / 0.8 are nested subsets of the 80% fit split, 1.0 is every message), exported with its learned front end to
# docs/model/${PREFIX}_p<share>. Same training settings for every share. The 1.0 share is also copied to docs/model/real (the demo's model).
# FAMILY=<comma list of events> (msg_to_world.py): train only on the rows of those events (INTERFERENCE.md).
# Usage: PREFIX=final training/sketch/run_curve.sh 0.2 0.4 0.8 1.0
# CENTRES=1: the centre reader (research/attention/port/NOTES.md): the world is built into worlds_centres/real with legend
# reader.centres = true and examples/messages.jsonl (msg_to_world.py CENTRES=1, no negative rows: the text outside the spans is in the
# messages), trained with the same settings; docs/model/real is never replaced by a centre model.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"; SOP="$REPO/training/vss/tool/bin/sop"; W="$HERE/worlds/real"
cd "$HERE"; export VSA_MIN_AVAILABLE_GB="${VSA_MIN_AVAILABLE_GB:-1.5}"   # the trainer's memory guard (default 4 GB) stops on this 7 GB machine
PREFIX="${PREFIX:-real}"; SEED="${SEED:-0}"; CENTRES="${CENTRES:-0}"; EPOCHS="${EPOCHS:-2}"; D="${D:-1024}"   # D: hypervector dimension (default 1024); EPOCHS: training epochs (default 2)
OUT=(); KEY=(); if [ "$CENTRES" = "1" ]; then W="$HERE/worlds_centres/real"; OUT=(--out "$W"); export CENTRES NEGATIVES=0; fi
if [ "$CENTRES" = "1" ] && [ -n "${CENTRE_KEY:-}" ]; then KEY=(--centre_key "$CENTRE_KEY"); fi   # CENTRE_KEY=event: run 2 (NOTES.md)
for F in "$@"; do
  P=$(python3 -c "print(int(round(float('$F')*100)))")
  python3 msg_to_world.py --frac "$F" "${OUT[@]}" | sed -n 1,5p
  "$SOP" check --legend "$W/legend.json" "$W"/examples/*.sop | tail -1
  RUN="${PREFIX}_p${P}_D${D}_e${EPOCHS}_s${SEED}"; rm -rf "runs/$RUN"
  "$SOP" train "$W" --D "$D" --seed "$SEED" --seeds 1 --epochs "$EPOCHS" --shuffle --device cpu --candidate_sets catalog --n_eval 600 --no_ckpt \
    --star_version 2 --threshold_rule fit --calibrate_on_heldout_formulations --run_dir "$HERE/runs/$RUN" "${KEY[@]}" > "runs/$RUN.log" 2>&1
  rm -rf "$REPO/docs/model/${PREFIX}_p${P}_s${SEED}"
  "$SOP" export-web --model "$W/model" --out "$REPO/docs/model/${PREFIX}_p${P}_s${SEED}" --bits 8 > /dev/null
  cp "$W/front.json" "$REPO/docs/model/${PREFIX}_p${P}_s${SEED}/front.json"
  echo "share $F -> docs/model/${PREFIX}_p${P}_s${SEED} ($(grep -c . "$W/raw/sentences.txt") rows)"
  if [ "$P" = "100" ] && [ "$CENTRES" != "1" ]; then rm -rf "$REPO/docs/model/real"; cp -r "$REPO/docs/model/${PREFIX}_p100_s${SEED}" "$REPO/docs/model/real"; fi
done
