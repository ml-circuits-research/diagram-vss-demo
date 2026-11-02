#!/usr/bin/env bash
# upstream_ab_job.sh: the training A/B of training/sketch/UPSTREAM_AUDIT.md, for a machine with more memory than the agents' sandbox
# (the vss-demo 9c85649 trainer was killed for memory three times in the sandbox: it holds the whole phase table 5-6 times).
# Run from a diagram-vss-demo checkout (the box: /box/diagram-vss-demo). Needs: python3 with torch, git, network for the vss-demo clone.
#   bash upstream_ab_job.sh history7 undo,redo,forget
#   bash upstream_ab_job.sh graphq7 check,connected,path,reachable,cycle,exists
# For each world: the world's data is built once (train_micro.sh DRY=1, the same switches as the shipped BUILD.json), then trained
#   up   = vss-demo 9c85649 tool/sop + experiment (git archive), unchanged
#   def  = this repository's training/vss, CAL_FALLBACK unset (every switch at the upstream default)
#   ship = this repository's training/vss, CAL_FALLBACK=train (the shipped setting)
# with the command of train_micro.sh (D 1024, seed 0, 10 epochs, --shuffle, --star_version 2, --threshold_rule fit), one at a time.
# Outputs: ab/<world>_<v>/model and ab/<world>_<v>.log; then compare the route books (cmpmodel below) and score
#   MODEL=<abs path of a dense export> SEG=gold node training/sketch/llm_score.mjs <the world's eval/goldev/<event> folders>
set -euo pipefail
WORLD="$1"; EVENTS="$2"; REPO="$(pwd)"; AB="$REPO/ab"; mkdir -p "$AB"
[ -d "$AB/vss-demo-9c85649" ] || { git clone -q https://github.com/ml-circuits-research/vss-demo.git "$AB/vss-demo.git" && \
  mkdir -p "$AB/vss-demo-9c85649" && git -C "$AB/vss-demo.git" archive 9c85649 tool experiment | tar -x -C "$AB/vss-demo-9c85649"; }
# the world's data, exactly as the shipped build (docs/model/micro/<world>/BUILD.json: DATA=spans FRONT_ROWS=world QCOLOR=1 MARKER=0 KINDMAP=...)
DATA=spans FRONT_ROWS=world DRY=1 bash training/sketch/train_micro.sh "$WORLD" "$EVENTS"
for V in up def ship; do
  W="$AB/$V/$WORLD"; rm -rf "$W"; mkdir -p "$W"
  (cd "training/sketch/worlds_micro/$WORLD" && cp -r legend.json kinds.tsv world.json split_hints.json front.json examples raw "$W/")
  echo '{"label": null}' > "$W/status.json"
  CODE="$REPO/training/vss"; [ "$V" = up ] && CODE="$AB/vss-demo-9c85649"
  ( unset CAL_FALLBACK; [ "$V" = ship ] && export CAL_FALLBACK=train
    SOP_PYTHON=python3 VSA_MIN_AVAILABLE_GB=1 "$CODE/tool/bin/sop" train "$W" --D 1024 --seed 0 --seeds 1 --epochs 10 --shuffle --device cpu \
      --candidate_sets catalog --n_eval 150 --eval_modes primary --no_ckpt --star_version 2 --threshold_rule fit \
      --calibrate_on_heldout_formulations --run_dir "$AB/runs/${WORLD}_$V" > "$AB/${WORLD}_$V.log" 2>&1 )
  SOP_PYTHON=python3 training/vss/tool/bin/sop export-web --model "$W/model" --out "$AB/web/${WORLD}_$V" --bits 8 > /dev/null
  cp "$W/front.json" "$AB/web/${WORLD}_$V/front.json"
done
echo "done: $AB/web/${WORLD}_{up,def,ship} (dense exports); score each with MODEL=$AB/web/${WORLD}_<v> SEG=gold node training/sketch/llm_score.mjs ..."
