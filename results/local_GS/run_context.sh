#!/usr/bin/env bash
cd /home/claude/diagram-vss-demo; ROOT=$PWD; A=docs/model/arms/GS; R=results/local_GS
export EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_gen_1 llm_train/opus_gen_2 llm_train/synth_rules" OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1
t=$(date +%s); echo "[$(date +%T)] context filler start" >> $R/timings.txt
( cd training/sketch && REGISTRY="$ROOT/$A/registry_GS.json" CONTEXT="$ROOT/docs/model/context/weights.json" WEIGHTS="$ROOT/$A/context/weights.json" CACHE="$ROOT/$R/layer_cache_GS.json" REBUILD=1 node train_context.mjs ) > $R/context.log 2>&1
echo "[$(date +%T)] context filler exit $? in $(( $(date +%s) - t )) s" >> $R/timings.txt
