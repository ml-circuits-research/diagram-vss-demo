#!/usr/bin/env bash
# run_tiny.sh <world> <epochs>: train a tiny capacity world with the full world's settings (run_curve.sh: D 1024, seed 0, star_version 2,
# --threshold_rule fit, sentence candidates by the contract decoder) except: many epochs, no held-out calibration file (thresholds fitted
# on the training rows: in-sample, a capacity test), a small evaluation sample. Then eval_tiny.py reads every training row.
set -euo pipefail
H=/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/capacity; W=$H/tiny/$1
cd /home/claude/diagram-vss-demo/training/sketch; export VSA_MIN_AVAILABLE_GB=1.5
SOP_PYTHON=/home/claude/venv/bin/python3 /home/claude/diagram-vss-demo/training/vss/tool/bin/sop train "$W" --D 1024 --seed 0 --seeds 1 --epochs "$2" --shuffle --device cpu --candidate_sets catalog \
  --n_eval 50 --n_cal 300 --eval_modes primary --no_ckpt --star_version 2 --threshold_rule fit --no_heldout_calibration --log_every 50 --run_dir "$W/runs/e$2" > "$W/train_e$2.log" 2>&1
/home/claude/venv/bin/python3 $H/eval_tiny.py "$1" > "$H/tiny_$1_e$2.txt" 2>&1
echo done
