#!/usr/bin/env bash
# fresh2/run.sh: the whole FRESH2_PLAN.md pipeline: collectors (records), then the fit and the report.
#   [DATA="dir dir .."] [REC=records dir] [REPORT=report.md] [SOP_ALL=all-data SOP-BERT folder] [PAR=1] [THREADS=4] bash training/sketch/fresh2/run.sh
#   DATA     the annotated writer folders (default training/sketch/llm_bench/fresh2/opus_{a,b,c,d}); the folder names are the writer slices
#   REC      the records folder (default results/fresh2/records); REPORT the report (default results/fresh2/report.md)
#   SOP_ALL  the all-data SOP-BERT (default results/041_sopbert_all/sop-bert-all); missing: that reader is left out and the run says so
#   PAR=1    the collectors run in parallel, 4 node processes: VSS default · VSS round 2 · SOP-BERT shipped + Rules · SOP-BERT all-data
#            (PAR=0, the default: one process at a time). THREADS = CPU threads of each SOP-BERT process (default: all).
#   MINEXEC / BOOT / SEED: see fit_report.mjs (the plan's values are the defaults). LIMIT=n: first n messages of each folder (tests only).
# Every collector reads ALL the messages once (calibration and test parts together); the split is made by fit_report.mjs.
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd); cd "$ROOT"
F=training/sketch/fresh2
DATA=${DATA:-"training/sketch/llm_bench/fresh2/opus_a training/sketch/llm_bench/fresh2/opus_b training/sketch/llm_bench/fresh2/opus_c training/sketch/llm_bench/fresh2/opus_d"}
REC=${REC:-results/fresh2/records}; REPORT=${REPORT:-results/fresh2/report.md}
SOP_ALL=${SOP_ALL:-results/041_sopbert_all/sop-bert-all}; PAR=${PAR:-0}
mkdir -p "$REC" "$(dirname "$REPORT")"
T() { date +%s; }
run() { local name=$1; shift; local t0; t0=$(T); echo "[$(date +%T)] start $name"; "$@" > "$REC/log_$name.txt" 2>&1 || { echo "[$(date +%T)] FAILED $name (see $REC/log_$name.txt)"; tail -5 "$REC/log_$name.txt"; return 1; }
  echo "[$(date +%T)] done $name in $(( $(T) - t0 )) s: $(grep -E 'messages' "$REC/log_$name.txt" | grep -v '^composer' | tr '\n' ' ' | cut -c1-300)"; }
c_vss1() { node $F/collect_vss.mjs "$REC/vss_r1.jsonl" fresh2 $DATA; }
c_vss2() { REGISTRY=docs/model/micro/registry_r2.json CONTEXT=docs/model/context/weights_r2.json node $F/collect_vss.mjs "$REC/vss_r2.jsonl" fresh2 $DATA; }
c_sop1() { CUTS=own,vss node $F/collect_sop.mjs "$REC/sop_shipped_%CUT%.jsonl" fresh2 $DATA; }
c_rules() { CUTS=own,vss node $F/collect_rules.mjs "$REC/rules_%CUT%.jsonl" fresh2 $DATA; }
c_sop2() { MODEL="$SOP_ALL" CUTS=own,vss node $F/collect_sop.mjs "$REC/sop_all_%CUT%.jsonl" fresh2 $DATA; }
HAVE_ALL=0; [ -f "$SOP_ALL/config.json" ] && HAVE_ALL=1 || echo "NOTE: $SOP_ALL/config.json not found: the all-data SOP-BERT is left out"
T0=$(T)
if [ "$PAR" = 1 ]; then
  pids=(); fails=0
  run vss_r1 c_vss1 & pids+=($!)
  run vss_r2 c_vss2 & pids+=($!)
  (run sop_shipped c_sop1; run rules c_rules) & pids+=($!)
  [ "$HAVE_ALL" = 1 ] && { run sop_all c_sop2 & pids+=($!); }
  for p in "${pids[@]}"; do wait "$p" || fails=$((fails + 1)); done
  [ "$fails" = 0 ] || { echo "$fails collector process(es) failed"; exit 1; }
else
  run vss_r1 c_vss1; run vss_r2 c_vss2; run rules c_rules; run sop_shipped c_sop1
  [ "$HAVE_ALL" = 1 ] && run sop_all c_sop2
fi
echo "collectors: $(( $(T) - T0 )) s"
T1=$(T)
node $F/fit_report.mjs "$REC" "$REPORT" $DATA > "$REC/log_fit_report.txt" 2>&1 || { tail -20 "$REC/log_fit_report.txt"; exit 1; }
echo "fit and report: $(( $(T) - T1 )) s -> $REPORT"
