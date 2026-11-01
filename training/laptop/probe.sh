#!/usr/bin/env bash
# probe.sh: the real training speed of this box, on cuda and on cpu, with a probe world of the manage7 events (delete,duplicate,rename,label;
# ~1000 rows). Five epochs each (~5000 sentences: the trainer logs every 4000), the Plan B settings otherwise (DATA=spans FRONT_ROWS=world). Prints sentences per second from the trainer's log; the
# coordinator compares it with its own machine (~2.4-3.7 sentences/s per training, 2 at once) and decides how many runs go where.
# It writes only probe_* folders, removed at the end. Run inside the box, from the repository root: bash training/laptop/probe.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
for dev in ${DEVICES:-cuda cpu}; do
  w="probe_$dev"; t0=$(date +%s)
  DEVICE=$dev DATA=spans FRONT_ROWS=world EPOCHS=5 N_EVAL=20 EVAL_MODES=primary SOP_PYTHON=python3 \
    bash training/sketch/train_micro.sh "$w" delete,duplicate,rename,label > "/tmp/$w.out" 2>&1 || { echo "$dev: FAILED"; tail -20 "/tmp/$w.out"; continue; }
  log="training/sketch/runs/micro_${w}_D1024_e5_s0/train.log"
  echo "$dev: total $(( $(date +%s) - t0 )) s; last progress lines:"; grep "sent" "$log" | tail -2
  rm -rf "training/sketch/worlds_micro/$w" "docs/model/micro/$w" "training/sketch/runs/micro_${w}_D1024_e5_s0" "training/sketch/runs/micro_${w}_D1024_e5_s0.log"
done
