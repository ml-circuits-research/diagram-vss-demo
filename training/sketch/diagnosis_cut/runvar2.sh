#!/bin/bash
# runvar2.sh DEVFILE OUTPREFIX MODEL tag "CUT spec" ... : as runvar.sh, with the dev file and an output prefix
cd "$(dirname "$0")"
DEV=$1; PRE=$2; M=$3; shift 3
while [ $# -gt 0 ]; do
  tag=$1; spec=$2; shift 2
  MODEL=$M CUT="$spec" node cutstats.mjs $DEV ${PRE}_${M%%_*}_$tag.json | sed "s|^|$PRE |" | tee -a variants_all.txt
  python3 analyze.py ${PRE}_${M%%_*}_$tag.json --ex 2 --json ${PRE}_${M%%_*}_$tag.an.json > ${PRE}_${M%%_*}_$tag.an.txt
done
