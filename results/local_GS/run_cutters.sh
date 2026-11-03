#!/usr/bin/env bash
set -uo pipefail
cd /home/claude/diagram-vss-demo
A=docs/model/arms/GS; R=results/local_GS; ROOT=$PWD
export EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_gen_1 llm_train/opus_gen_2 llm_train/synth_rules"
export OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 DEVICE=cpu
t=$(date +%s); echo "[$(date +%T)] world cutter start (synth md5 $(cat training/sketch/llm_train/synth_rules/msg_*.jsonl | md5sum | cut -c1-12))" >> $R/timings.txt
( cd training/sketch && SHORT=1 python3 train_cutter.py --worlds worlds_micro/GROUPS_7.json --out "$ROOT/$A/cutter_worlds7s.json" > "$ROOT/$R/cutter_worlds.log" 2>&1 ); echo "[$(date +%T)] world cutter exit $? in $(( $(date +%s) - t )) s" >> $R/timings.txt
t=$(date +%s); echo "[$(date +%T)] event cutter start" >> $R/timings.txt
( cd training/sketch && python3 train_cutter.py --worlds worlds_micro/GROUPS_EVENTS.json --out "$ROOT/$A/cutter_events.json" > "$ROOT/$R/cutter_events.log" 2>&1 ); echo "[$(date +%T)] event cutter exit $? in $(( $(date +%s) - t )) s" >> $R/timings.txt
