#!/usr/bin/env bash
# rules_vs/run.sh: collect Rules / VSS-G / SOP-BERT-G records on every set (records folder REC, default /tmp-like scratch given by env).
# usage: REC=<dir> bash training/sketch/rules_vs/run.sh
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd); cd "$ROOT"
F=training/sketch/fresh2; D=training/sketch/rules_vs/data; REC=${REC:?REC=records dir}; mkdir -p "$REC"
declare -A SETS
SETS[llm_short]="training/sketch/llm_train/sonnet_short training/sketch/llm_train/haiku_short"
for s in hand blind broad seen new_identities heldout_formulations; do SETS[$s]="$D/$s"; done
SETS[help]="$D/help"
SETS[fresh2]="training/sketch/llm_bench/fresh2/opus_a training/sketch/llm_bench/fresh2/opus_b training/sketch/llm_bench/fresh2/opus_c training/sketch/llm_bench/fresh2/opus_d"
which=${WHICH:-"vss rules sop"}
for s in ${ONLY:-"${!SETS[@]}"}; do
  for w in $which; do
    case $w in
      vss) node $F/collect_vss.mjs "$REC/vss_$s.jsonl" $s ${SETS[$s]} > "$REC/log_vss_$s.txt" 2>&1 ;;
      rules) CUTS=own node $F/collect_rules.mjs "$REC/rules_${s}_%CUT%.jsonl" $s ${SETS[$s]} > "$REC/log_rules_$s.txt" 2>&1 ;;
      sop) CUTS=own node $F/collect_sop.mjs "$REC/sop_${s}_%CUT%.jsonl" $s ${SETS[$s]} > "$REC/log_sop_$s.txt" 2>&1 ;;
    esac
    echo "done $w $s"
  done
done
