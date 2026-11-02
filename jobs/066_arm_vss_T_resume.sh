# AFTER: 063_arm_vss_T
# FEEDBACK_PLAN.md arm VSS-T: the SHIPPED VSS chain retrained on base + T (EXTRA_DIRS below), then measured on fresh2.
# Nothing under docs/model/micro, docs/model/context or docs/model/neural is written: every export goes to docs/model/arms/T/.
#   - 7 worlds: the settings of their shipped docs/model/micro/<world>/BUILD.json (DATA=spans FRONT_ROWS=world N_EVAL=150 EVAL_MODES=primary D=1024
#     EPOCHS=10 SEED=0, CREATE_COLOR=role for shapes7c; read from BUILD.json, not typed here), on cuda; each world is built as <world>_t (its own build
#     and run folders), then moved to docs/model/arms/T/micro/<world>.
#   - world cutter (SHORT=1, GROUPS_7.json) and event cutter (GROUPS_EVENTS.json): python on CPU, one process each, at the same time as the worlds.
#   - registry_T.json (the shipped registry with this arm's models, cutters and filler), then the context filler (train_context.mjs on the 9 folders + the
#     extra ones; the shipped filler breaks ties while the training units are built, the new one is written to arms/T/context/weights.json).
#   - collectors (VSS arm, Rules) on fresh2 + the old held-out text, then fit_report.mjs (calibration = fresh2 calibration part + old held-out text).
# GPU / memory (measured in the round-2 logs, job 002: RTX 3050 Ti, 3.73 GB, 15.2 GB RAM): a world allocates 0.17 GB (shapes), 0.15, 0.12, 0.10, 0.09, 0.03 on the
# card, 1.65-1.7 GB RSS while training and 2.8-4.3 GB at the end (eval/export). Seven at once do not fit: 7 x (RSS 1.7-4.3 GB) is more than the 11 GB free, and the CUDA
# context of each process (about 0.3 GB, not measured) comes on top of the allocator. So WORLD_PAR (default 2, the number that ran in round 2) worlds train at once,
# biggest first, across ALL jobs of this machine (slot files in $HOME/vss-box/state/gpu: SOP-BERT jobs take every slot, so they never share the card with a world).
#   WORLD_PAR=3 only if the desktop leaves >= 9 GB available. VSA_MEM_FRACTION is 0.35 per world (1.3 GB cap, expandable segments).
# PATHS: docs/model/arms/T results/066_arm_vss_T_resume
export CAL_OLDHELD=0 FAST=1 FAST_PROCS=4   # FEEDBACK_PLAN amendment 19:40; FAST=1: same model, faster (commit ee8d016)
[ "$(cat results/063_arm_vss_T.exit 2>/dev/null)" = 0 ] && { echo "job 063 succeeded: nothing to resume"; exit 0; }
set -uo pipefail
ARM=T; ARMLC=t; JOB=066_arm_vss_T_resume
EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_tgt_1 llm_train/opus_tgt_2"
export EXTRA_DIRS
WORLD_PAR=${WORLD_PAR:-2}; SLOTS=3; [ "$WORLD_PAR" -le "$SLOTS" ] || WORLD_PAR=$SLOTS
export PATH="$HOME/vss-box/venv/bin:$PATH" TOKENIZERS_PARALLELISM=false
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  if [ ! -x "$HOME/vss-box/node/bin/node" ]; then
    mkdir -p "$HOME/vss-box/node"; curl -fsSL https://nodejs.org/dist/v22.11.0/node-v22.11.0-linux-x64.tar.xz | tar -xJ -C "$HOME/vss-box/node" --strip-components=1
  fi
  export PATH="$HOME/vss-box/node/bin:$PATH"
fi
ROOT=$PWD; A=docs/model/arms/$ARM; R=results/$JOB; REC=$R/records; LOCK=$HOME/vss-box/state/gpu
mkdir -p "$A/micro" "$A/context" "$A/logs" "$R" "$REC" "$LOCK"
TL=$R/timings.txt; T0=$(date +%s)
stamp() { echo "[$(date +%T) +$(( $(date +%s) - T0 ))s] $*" | tee -a "$TL"; }
fail() { stamp "FAILED: $*"; exit 1; }
stamp "arm VSS-$ARM, EXTRA_DIRS=$EXTRA_DIRS"; nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv | tee -a "$TL"; free -g | tee -a "$TL"

# ---- data check: every folder annotated (front.py extra_dirs() stops with a message when one is missing), the shipped model folders present
( cd training/sketch && python3 -c "import front; d = front.extra_dirs(); print(len(d), 'extra folders:', d)" ) || fail "EXTRA_DIRS folders are missing or not annotated"
( cd training/sketch && DATA=spans python3 -c "import front; print(len(front.load_msgs()), 'messages for the worlds (DATA=spans + EXTRA_DIRS)')" ) | tee -a "$TL"
for f in docs/model/micro/registry.json docs/model/context/weights.json training/sketch/worlds_micro/GROUPS_7.json training/sketch/worlds_micro/GROUPS_EVENTS.json; do [ -f "$f" ] || fail "missing $f"; done

# ---- world list from the shipped registry + BUILD.json: base world, events, settings (biggest first)
python3 - > "$R/worlds.tsv" <<'PY' || fail "worlds.tsv"
import json, os
reg = json.load(open("docs/model/micro/registry.json")); rows = []
KEYS = ["DATA", "FRAC", "QCOLOR", "MARKER", "ROW_SHAPE", "FRONT_ROWS", "KINDMAP", "CAL_FALLBACK", "D", "EPOCHS", "SEED", "N_EVAL", "EVAL_MODES", "HOLDOUT",
        "CREATE_COLOR", "N_CAL", "VAL_PREC", "VAL_SUB", "SHORT", "OPS", "DIAGRAM_OPS"]
for w in reg["worlds"]:
    base = w["model"].split("/")[-1]; b = json.load(open(f"docs/model/micro/{base}/BUILD.json"))
    env = " ".join(f"{k}={b[k]}" for k in KEYS if k in b and str(b[k]) != "")
    rows.append((b["rows"], base, b["events"], env))
for r, base, ev, env in sorted(rows, reverse=True): print(f"{base}\t{ev}\t{env}")
PY
cat "$R/worlds.tsv" | tee -a "$TL"

# ---- GPU slots shared by every job of this machine
acquire_slot() {   # sets FD to a locked slot file among the first WORLD_PAR
  local i
  while :; do
    for i in $(seq 0 $((WORLD_PAR - 1))); do
      exec {FD}>"$LOCK/slot.$i"
      flock -n "$FD" && return 0
      exec {FD}>&-
    done
    sleep 3
  done
}
run_world() {   # base events settings...   (runs in a subshell that owns FD)
  local base=$1 events=$2; shift 2; local w="${base}_${ARMLC}" t=$(date +%s)
  if [ -f "$A/micro/$base/BUILD.json" ]; then echo "[$(date +%T)] skip $base (already trained)" >> "$TL"; return 0; fi
  echo "[$(date +%T)] start $w" >> "$TL"
  env "$@" EXTRA_DIRS="$EXTRA_DIRS" DEVICE=cuda VSA_MEM_FRACTION=${MEMFRAC:-0.35} PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True SOP_PYTHON=python3 VSA_MAX_HOURS=4 \
    OMP_NUM_THREADS=2 MKL_NUM_THREADS=2 OPENBLAS_NUM_THREADS=2 bash training/sketch/train_micro.sh "$w" "$events" > "$R/train_$base.log" 2>&1
  local rc=$?
  cp "training/sketch/runs/micro_${w}_D1024_e10_s0.log" "$A/logs/$base.run.log" 2>/dev/null; cp "training/sketch/runs/micro_${w}_D1024_e10_s0/train.log" "$A/logs/$base.train.log" 2>/dev/null
  if [ $rc -eq 0 ] && [ -f "docs/model/micro/$w/BUILD.json" ]; then
    rm -rf "$A/micro/$base"; mv "docs/model/micro/$w" "$A/micro/$base"; echo "[$(date +%T)] done $w in $(( $(date +%s) - t )) s" >> "$TL"
  else echo "[$(date +%T)] FAILED $w (exit $rc, $R/train_$base.log)" >> "$TL"; return 1; fi
}

# ---- 1. world cutter + event cutter (CPU, one process each) at the same time as the worlds
[ -s "$A/cutter_worlds7s.json" ] && stamp "world cutter: already trained" || ( stamp "world cutter start"; cd training/sketch && SHORT=1 EXTRA_DIRS="$EXTRA_DIRS" python3 train_cutter.py --worlds worlds_micro/GROUPS_7.json --out "$ROOT/$A/cutter_worlds7s.json" > "$ROOT/$R/cutter_worlds.log" 2>&1; echo "world cutter exit $?" >> "$ROOT/$TL" ) &
PID_CW=$!
[ -s "$A/cutter_events.json" ] && stamp "event cutter: already trained" || ( stamp "event cutter start"; cd training/sketch && EXTRA_DIRS="$EXTRA_DIRS" python3 train_cutter.py --worlds worlds_micro/GROUPS_EVENTS.json --out "$ROOT/$A/cutter_events.json" > "$ROOT/$R/cutter_events.log" 2>&1; echo "event cutter exit $?" >> "$ROOT/$TL" ) &
PID_CE=$!

# ---- 2. the 7 worlds, WORLD_PAR at a time, biggest first
PIDS=()
while IFS=$'\t' read -r base events settings; do
  acquire_slot
  ( run_world "$base" "$events" $settings ) < /dev/null &
  PIDS+=($!)
  exec {FD}>&-          # the child keeps the lock (its copy of FD); this one is closed
done < "$R/worlds.tsv"
bad=0; for p in "${PIDS[@]}"; do wait "$p" || bad=$((bad + 1)); done
if [ "$bad" != 0 ]; then   # a world that ran out of the 0.35 cap (job 061: shapes, links) is retried alone, holding every slot, at 0.85
  stamp "retrying $bad failed world(s) alone, VSA_MEM_FRACTION=0.85"; LOCKS=()
  for i in 0 1 2; do exec {L}>"$LOCK/slot.$i"; flock "$L"; LOCKS+=($L); done
  bad=0
  while IFS=$'\t' read -r base events settings; do
    [ -f "$A/micro/$base/BUILD.json" ] && continue
    MEMFRAC=0.85 run_world "$base" "$events" $settings < /dev/null || bad=$((bad + 1))
  done < "$R/worlds.tsv"
  for L in "${LOCKS[@]}"; do exec {L}>&-; done
fi
wait "$PID_CW" "$PID_CE"
stamp "worlds done ($bad failed); cutters done"
[ "$bad" = 0 ] || fail "$bad world(s) failed (see $R/train_*.log)"
[ -s "$A/cutter_worlds7s.json" ] && [ -s "$A/cutter_events.json" ] || fail "a cutter is missing (see $R/cutter_*.log)"
git status --short docs/model/micro docs/model/context docs/model/neural | head   # must show nothing: the shipped models are untouched

# ---- 3. registry_ARM.json: the shipped registry with this arm's models (paths relative to docs/model/)
python3 - <<PY || fail "registry"
import json
reg = json.load(open("docs/model/micro/registry.json")); arm = "$ARM"; P = f"arms/{arm}/"
reg["about"] = f"Arm VSS-{arm} of FEEDBACK_PLAN.md: the shipped chain (7 worlds with their BUILD.json settings, cutter_worlds7s, cutter_events, context filler) retrained on base + {arm}. Data: EXTRA_DIRS = $EXTRA_DIRS (all learned parts). Registry of docs/model/micro/registry.json otherwise unchanged."
reg["cutter"] = P + "cutter_worlds7s.json"; reg["event_cutter"] = P + "cutter_events.json"; reg["context"] = P + "context/weights.json"
for w in reg["worlds"]: w["model"] = P + "micro/" + w["model"].split("/")[-1]; w.pop("version", None)
for k in ("cutter_version", "event_cutter_version", "context_version"): reg.pop(k, None)
reg["EXTRA_DIRS"] = "$EXTRA_DIRS"
json.dump(reg, open(f"docs/model/arms/{arm}/registry_{arm}.json", "w"), indent=1)
PY

# ---- 4. context filler (CPU, node, one process): the arm's registry builds the units; the SHIPPED filler breaks ties during that build
stamp "context filler start"
( cd training/sketch && EXTRA_DIRS="$EXTRA_DIRS" REGISTRY="$ROOT/$A/registry_$ARM.json" CONTEXT="$ROOT/docs/model/context/weights.json" WEIGHTS="$ROOT/$A/context/weights.json" \
    CACHE="$HOME/vss-box/state/layer_cache_$ARM.json" REBUILD=1 node train_context.mjs ) > "$R/context.log" 2>&1 || { tail -5 "$R/context.log"; fail "context filler"; }
tail -4 "$R/context.log" | cut -c1-250; stamp "context filler done"

# ---- 5. collectors + fit_report on fresh2 (records: fresh2 + the old held-out text; calibration = old held-out + fresh2 calibration part, FEEDBACK_PLAN.md)
F2=training/sketch/llm_bench/fresh2; DATA="$F2/opus_a $F2/opus_b $F2/opus_c $F2/opus_d"
for d in $DATA; do [ -f "$d/batch_01.jsonl" ] || fail "$d is missing on this branch"; done
CALF=""
if [ "${CAL_OLDHELD:-1}" = 1 ]; then python3 training/sketch/fresh2/make_oldheld.py "$R/oldheld" | tee -a "$TL" && DATA="$DATA $R/oldheld" && CALF=oldheld; fi
F=training/sketch/fresh2
( REGISTRY="$A/registry_$ARM.json" CONTEXT="$A/context/weights.json" node $F/collect_vss.mjs "$REC/vss_arm.jsonl" fresh2 $DATA > "$REC/log_vss_arm.txt" 2>&1 ) &
( CUTS=own node $F/collect_rules.mjs "$REC/rules_%CUT%.jsonl" fresh2 $DATA > "$REC/log_rules.txt" 2>&1 ) &
wait
tail -2 "$REC/log_vss_arm.txt" | cut -c1-250; stamp "collectors done"
ARM="VSS-$ARM" CAL_FOLDERS="$CALF" node $F/fit_report.mjs "$REC" "$R/report.md" $DATA > "$REC/log_fit_report.txt" 2>&1 || { tail -20 "$REC/log_fit_report.txt"; fail "fit_report"; }
stamp "report written: $R/report.md"; head -8 "$R/report.md" | cut -c1-300
du -sh "$A" "$R"
git status --short docs/model/micro docs/model/context docs/model/neural | head   # must show nothing
