#!/usr/bin/env bash
# One world of arm VSS-G+S on this machine's CPU (recipe of job 061 with synth_rules added). Usage: run_world.sh <base>
set -uo pipefail
cd /home/claude/diagram-vss-demo
base=$1; ARM=GS; ARMLC=gs; A=docs/model/arms/$ARM; R=results/local_GS
EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_gen_1 llm_train/opus_gen_2 llm_train/synth_rules"
mkdir -p "$A/micro" "$A/logs" "$R"
line=$(awk -F'\t' -v b="$base" '$1==b' $R/worlds.tsv); events=$(echo "$line" | cut -f2); settings=$(echo "$line" | cut -f3)
w="${base}_${ARMLC}"; t=$(date +%s)
echo "[$(date +%T)] start $w synth_rules md5 $(cat training/sketch/llm_train/synth_rules/msg_*.jsonl | md5sum | cut -c1-12) msgs $(cat training/sketch/llm_train/synth_rules/msg_*.jsonl | wc -l)" >> $R/timings.txt
env $settings EXTRA_DIRS="$EXTRA_DIRS" DEVICE=cpu FAST=1 FAST_MEM_MB=256 FAST_PROCS=1 VSA_MAX_HOURS=12 SOP_PYTHON=python3 \
  OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 bash training/sketch/train_micro.sh "$w" "$events" > "$R/train_$base.log" 2>&1
rc=$?
cp "training/sketch/runs/micro_${w}_D1024_e10_s0.log" "$A/logs/$base.run.log" 2>/dev/null
cp "training/sketch/runs/micro_${w}_D1024_e10_s0/train.log" "$A/logs/$base.train.log" 2>/dev/null
if [ $rc -eq 0 ] && [ -f "docs/model/micro/$w/BUILD.json" ]; then
  rm -rf "$A/micro/$base"; mv "docs/model/micro/$w" "$A/micro/$base"
  echo "[$(date +%T)] done $base in $(( $(date +%s) - t )) s (rows $(python3 -c "import json;print(json.load(open('$A/micro/$base/BUILD.json'))['rows'])"))" >> $R/timings.txt
else echo "[$(date +%T)] FAILED $base (exit $rc) after $(( $(date +%s) - t )) s" >> $R/timings.txt; exit 1; fi
