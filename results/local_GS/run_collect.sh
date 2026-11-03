#!/usr/bin/env bash
cd /home/claude/diagram-vss-demo; R=results/local_GS; REC=$R/records_all; mkdir -p $REC
F2=training/sketch/llm_bench/fresh2; S3=$R/data/short3_np_test; DATA="$F2/opus_a $F2/opus_b $F2/opus_c $F2/opus_d $S3"; F=training/sketch/fresh2
export OMP_NUM_THREADS=1
s(){ echo "[$(date +%T)] $*" >> $R/timings.txt; }
s "collect VSS-GS start"; REGISTRY=docs/model/arms/GS/registry_GS.json CONTEXT=docs/model/arms/GS/context/weights.json node $F/collect_vss.mjs $REC/vss_arm.jsonl fresh2 $DATA > $REC/log_vss_arm.txt 2>&1; s "collect VSS-GS exit $?"
s "collect Rules start"; CUTS=own node $F/collect_rules.mjs "$REC/rules_%CUT%.jsonl" fresh2 $DATA > $REC/log_rules.txt 2>&1; s "collect Rules exit $?"
s "collect VSS-G (shipped) start"; node $F/collect_vss.mjs $REC/vss_r1.jsonl fresh2 $DATA > $REC/log_vss_r1.txt 2>&1; s "collect VSS-G exit $?"
