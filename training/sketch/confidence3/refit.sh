#!/usr/bin/env bash
# confidence3/refit.sh: refit every reader confidence of the demo on the current models, in one command (confidence3/PLAN.md, RESULT.md).
# Run it after the readers are retrained (new docs/model/micro registry / VSS worlds, new docs/model/neural/sop-bert): the confidences
# belong to the models they were fitted on, so a new model needs a refit.
#
#   [DATA="dir .."] [REC=<records dir>] [MODEL=<SOP-BERT folder>] [THREADS=2] [SKIP_COLLECT=1] [STAMP=0] bash training/sketch/confidence3/refit.sh
#
# Inputs (the calibration data: blind, Opus-written messages the readers were NOT trained on; never synthetic text: synth_rules /
# synth_combo are the learned readers' training data):
#   DATA   annotated message folders (files msg_*.jsonl / batch_*.jsonl / s_*.jsonl with id, text, names, wires). Default: the four fresh2
#          writer folders training/sketch/llm_bench/fresh2/opus_{a,b,c,d}, plus training/sketch/llm_bench/short3 (and each sub-folder of it
#          holding .jsonl files) when it exists. Every message with int(sha256(id),16) % 3 == 0 is calibration (fitted on, out of fold);
#          the rest is the test part (only scored, in the reports).
#   models the ones the demo loads: docs/model/micro/registry.json (VSS worlds, cutter, context filler), docs/model/neural/sop-bert (or
#          MODEL=<folder>), docs/js/logic.js (the Rules).
# Steps:
#   1. combine/collect_pair.mjs   records of SOP-BERT and VSS on both cuts (+ units.jsonl)                 -> $REC
#   2. confidence3/collect_rules3.mjs   records of the Rules on their own cut and on both cuts' units     -> $REC
#   3. fresh2/fit_report.mjs (ARM) + fresh2/export_confidence.mjs   -> docs/model/confidence/vss.json, sop-bert.json
#   4. combine/combined_report.mjs EXPORT=1 VARIANT=d2              -> docs/model/confidence/combined.json (+ cost5 / cost20 levels in
#                                                                      vss.json and sop-bert.json), combine/combined_parity.json
#   5. confidence3/fit3.mjs EXPORT=1                                -> docs/model/confidence/vote3.json, confidence3/vote3_parity.json,
#                                                                      the report $REC/confidence3_report.md (variants, selection, test part)
#   6. the parity tests of the browser code against the fits; then training/sketch/stamp_models.py (STAMP=0 skips it).
# VSS-BERT's variant: d2 (no prior input), the one fit3.mjs's selection rule chose in the refit of 2026-11-03; COMB_VARIANT=a exports the
# plain recipe. When fit3.mjs's report chooses another VSS-BERT variant after a refit, change the default here.
# Reports: $REC/fresh2_report.md, $REC/combined_report.md, $REC/confidence3_report.md. Wall time on this machine: ~4 min (2 CPU).
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd); cd "$ROOT"
SK=training/sketch
if [ -z "${DATA:-}" ]; then
  DATA="$SK/llm_bench/fresh2/opus_a $SK/llm_bench/fresh2/opus_b $SK/llm_bench/fresh2/opus_c $SK/llm_bench/fresh2/opus_d"
  S3=$SK/llm_bench/short3
  if [ -d "$S3" ]; then
    ls "$S3"/*.jsonl >/dev/null 2>&1 && DATA="$DATA $S3"
    for d in "$S3"/*/; do [ "$(basename "$d")" = texts ] && continue; ls "$d"*.jsonl >/dev/null 2>&1 && DATA="$DATA ${d%/}"; done   # texts/: the texts saved before annotating (no gold)
  fi
fi
REC=${REC:-results/confidence3/records}; THREADS=${THREADS:-2}
mkdir -p "$REC" "$REC/fit"
echo "data: $DATA"; echo "records: $REC"
if [ "${SKIP_COLLECT:-0}" != 1 ]; then
  echo "[$(date +%T)] 1. SOP-BERT + VSS records"
  THREADS=$THREADS node $SK/combine/collect_pair.mjs "$REC" refit $DATA > "$REC/log_pair.txt" 2>&1 || { tail -20 "$REC/log_pair.txt"; exit 1; }
  grep -E "gold ·|produced requests" "$REC/log_pair.txt"
  echo "[$(date +%T)] 2. Rules records"
  node $SK/confidence3/collect_rules3.mjs "$REC" refit $DATA | tee "$REC/log_rules.txt"
fi
echo "[$(date +%T)] 3. VSS and SOP-BERT alone (fit_report + export_confidence)"
ln -sf "$(realpath "$REC/vss_own.jsonl")" "$REC/vss_arm.jsonl"; ln -sf "$(realpath "$REC/sop_own.jsonl")" "$REC/sop_arm_own.jsonl"
ARM=refit EXPORT="$REC/fit" node $SK/fresh2/fit_report.mjs "$REC" "$REC/fresh2_report.md" $DATA > "$REC/log_fit_report.txt" 2>&1 || { tail -20 "$REC/log_fit_report.txt"; exit 1; }
node $SK/fresh2/export_confidence.mjs --vss "$REC/fit/vss_arm.json" --bert "$REC/fit/sop_arm_own.json" --arm-vss refit --arm-bert refit
echo "[$(date +%T)] 4. VSS-BERT (combined_report)"
EXPORT=1 VARIANT=${COMB_VARIANT:-d2} node $SK/combine/combined_report.mjs "$REC" "$REC/combined_report.md" $DATA
echo "[$(date +%T)] 5. three readers (fit3)"
EXPORT=1 node $SK/confidence3/fit3.mjs "$REC" "$REC/confidence3_report.md" $DATA
echo "[$(date +%T)] 6. parity tests"
node $SK/test_vss_confidence.mjs > "$REC/log_tests.txt" 2>&1 && echo "test_vss_confidence: ok" || { echo "test_vss_confidence FAILED (see $REC/log_tests.txt)"; }
node $SK/test_combined_confidence.mjs >> "$REC/log_tests.txt" 2>&1 && echo "test_combined_confidence: ok" || echo "test_combined_confidence FAILED"
node $SK/test_vote_confidence.mjs >> "$REC/log_tests.txt" 2>&1 && echo "test_vote_confidence: ok" || echo "test_vote_confidence FAILED"
node $SK/test_neural_confidence.mjs >> "$REC/log_tests.txt" 2>&1 && echo "test_neural_confidence: ok" || echo "test_neural_confidence FAILED"
if [ "${STAMP:-1}" = 1 ]; then python3 $SK/stamp_models.py; fi
echo "[$(date +%T)] done: docs/model/confidence/{vss,sop-bert,combined,vote3}.json; reports in $REC"
