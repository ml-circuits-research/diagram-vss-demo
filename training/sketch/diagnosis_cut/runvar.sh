#!/bin/bash
# runvar.sh MODEL tag "CUT spec" ... : runs cutstats.mjs for each variant one after another (one CPU), then analyze.py
cd "$(dirname "$0")"
M=$1; shift
while [ $# -gt 0 ]; do
  tag=$1; spec=$2; shift 2
  MODEL=$M CUT="$spec" node cutstats.mjs ../review/dev.jsonl v_${M%%_*}_$tag.json | tee -a variants_${M%%_*}.txt
  python3 analyze.py v_${M%%_*}_$tag.json --ex 2 --json v_${M%%_*}_$tag.an.json > v_${M%%_*}_$tag.an.txt
done
