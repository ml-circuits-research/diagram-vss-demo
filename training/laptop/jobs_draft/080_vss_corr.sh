# AFTER: 078_vss_round2_resume2
# PATHS: docs/model/arms/R3C/micro docs/model/arms/R3C/context docs/model/arms/R3C/logs docs/model/arms/R3C/cutter_worlds8s.json docs/model/arms/R3C/cutter_events8.json docs/model/arms/R3C/registry_R3C.json results/080_vss_corr
# TRAIN_PLAN_R3.md, arm R3C: the learned world-level correction operator (future-experiments.md, "The Rules and VSS in one space", item 2).
# The recipe of job 078 (arm R2: the same 9 worlds of worlds_micro/GROUPS_8ops.json, the same settings, the same data, NEW_DISTINCT=1, FAST=1
# FAST_MEM_MB=256 on cuda) with ONE change: VSA_CORR=phase for every world. sop train then fits, after the route book and with it frozen, one
# phase vector per world (tool/sop/train.py fit_corr: the closed-form maximum of the trainer's own cosine loss over the training rows, put on
# the 8-bit grid), calibrates the presence thresholds through it, and the export carries it (routebook.bin array "corr", manifest vss-web-4);
# the browser reader (docs/js/vss/reader.js) rotates the chart by it before every cleanup. BUILD.json records VSA_CORR=phase.
# One change only: the world cutter, the event cutter and the context filler are NOT retrained; arm R2's files (job 078) are copied, so the
# registry of R3C differs from R2's only in the world models. Nothing under docs/model/micro, context, neural is written.
# Measured by TRAIN_PLAN_R3.md section 3 (the 079 recipe with arm R2 as G and arm R3C as T).
# GPU / memory / time: as job 078's worlds (the fit adds one chart per training row on the CPU: ~1-2% of the calibration); no cutters, no
# filler: expected ~40-60 min.
set -uo pipefail
ARM=R3C; ARMLC=r3c; JOB=080_vss_corr; BASE=R2   # BASE: the arm whose cutters / filler are reused (job 078)
export FAST_PROCS=${FAST_PROCS:-2}   # 073 failed: calibration in 8 processes left MemAvailable 0.8 GB (guard 1.5 GB); 2 processes now
EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_gen_1 llm_train/opus_gen_2 llm_train/synth_rules_dd llm_train/synth_rules_ops_dd llm_train/synth_rules_ext_dd llm_train/ops_formulations llm_train/opus_ext_1 llm_train/synth_combo_dd llm_train/synth_short_r2 llm_train/opus_short_r2"
export EXTRA_DIRS LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1 NEW_DISTINCT=1   # CONVERT_FIX.md + round 2 (NEW_DISTINCT); FRONT_NEG / VAL_GUARD stay off
W_GROUPS=worlds_micro/GROUPS_8ops.json; EV_GROUPS=worlds_micro/GROUPS_EVENTS_8ops.json   # GROUPS_8 + the group events (DIAGRAM_OPS=1)
WORLD_PAR=${WORLD_PAR:-2}; SLOTS=3; [ "$WORLD_PAR" -le "$SLOTS" ] || WORLD_PAR=$SLOTS
export PATH="$HOME/vss-box/venv/bin:$PATH" TOKENIZERS_PARALLELISM=false
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  if [ ! -x "$HOME/vss-box/node/bin/node" ]; then
    mkdir -p "$HOME/vss-box/node"; curl -fsSL https://nodejs.org/dist/v22.11.0/node-v22.11.0-linux-x64.tar.xz | tar -xJ -C "$HOME/vss-box/node" --strip-components=1
  fi
  export PATH="$HOME/vss-box/node/bin:$PATH"
fi
ROOT=$PWD; A=docs/model/arms/$ARM; R=results/$JOB; LOCK=$HOME/vss-box/state/gpu
mkdir -p "$A/micro" "$A/context" "$A/logs" "$R" "$LOCK"
TL=$R/timings.txt; T0=$(date +%s)
stamp() { echo "[$(date +%T) +$(( $(date +%s) - T0 ))s] $*" | tee -a "$TL"; }
fail() { stamp "FAILED: $*"; exit 1; }
stamp "arm VSS-$ARM (= $BASE + VSA_CORR=phase), LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1 NEW_DISTINCT=1, $W_GROUPS, EXTRA_DIRS=$EXTRA_DIRS"; nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv | tee -a "$TL"; free -g | tee -a "$TL"

# ---- data and code checks: every folder annotated, the LEGEND_EXT code present, the legend values current
for f in docs/model/arms/$BASE/registry_$BASE.json docs/model/arms/$BASE/cutter_worlds8s.json docs/model/arms/$BASE/cutter_events8.json docs/model/arms/$BASE/context/weights.json; do [ -f "$f" ] || fail "missing $f (job 078 first)"; done
grep -q "def fit_corr" training/vss/tool/sop/train.py && grep -q "this.rb.corr" docs/js/vss/reader.js && grep -q 'VSA_CORR' training/sketch/train_micro.sh || fail "the VSA_CORR=phase code is missing (tool/sop/train.py fit_corr, docs/js/vss/reader.js)"
( cd training/sketch && python3 -c "import front; d = front.extra_dirs(); print(len(d), 'extra folders:', d)" ) || fail "EXTRA_DIRS folders are missing or not annotated"
( cd training/sketch && DATA=spans python3 -c "import front; print(len(front.load_msgs()), 'messages for the worlds (DATA=spans + EXTRA_DIRS)')" ) | tee -a "$TL"
for f in training/sketch/$W_GROUPS training/sketch/$EV_GROUPS training/sketch/legend_ext/legend_values.json training/sketch/convert_check.py docs/model/context/weights.json; do [ -f "$f" ] || fail "missing $f"; done
( cd training/sketch && python3 -c "import generate as G, llm_to_world, front; assert G.LEGEND_EXT and 'help' in G.EVENTS, 'LEGEND_EXT code missing'; assert 'group' in G.EVENTS and {'outline', 'x', 'y', 'linked'} <= dict(G.ROLES).keys(), 'CONVERT_FIX code missing'; assert front.val_pick() == 'specific'; assert 'NEW_DISTINCT' in open('llm_to_world.py').read() and hasattr(front, 'neg_labels'), 'round-2 code missing'; assert not front.front_neg() and not front.val_guard('mask') and not front.val_guard('keep'), 'FRONT_NEG / VAL_GUARD must be off'; print(len(G.EVENTS), 'legend events,', len(G.ROLES), 'roles')" ) | tee -a "$TL" || fail "LEGEND_EXT / DIAGRAM_OPS / VAL_PICK / round-2 code"
node training/sketch/legend_ext/export_legend_values.mjs > "$R/legend_values.log" || fail "export_legend_values.mjs"
# only the values matter: a new logic.js commit changes the sha line alone (076 stopped on that)
git diff -U0 -- training/sketch/legend_ext/legend_values.json | grep "^[-+][^-+]" | grep -qv "sha" && fail "legend_values.json values differ from the legend of docs/js/logic.js (re-export and commit it)"
git checkout -- training/sketch/legend_ext/legend_values.json

# ---- the world table: GROUPS_8ops world -> model folder, its events, the settings (the shipped BUILD.json of its <world>8, arm ALL, + NEW_DISTINCT=1),
# biggest first (rows of the 2026-11-03 dry build)
python3 - > "$R/worlds.tsv" <<'PY' || fail "worlds.tsv"
import json
g = json.load(open("training/sketch/worlds_micro/GROUPS_8ops.json"))
ORDER = ["shapes", "position", "questions", "links", "graphq", "manage", "history", "help", "layout"]   # rows, dry build 2026-11-03
KEYS = ["DATA", "FRAC", "QCOLOR", "MARKER", "ROW_SHAPE", "FRONT_ROWS", "KINDMAP", "CAL_FALLBACK", "D", "EPOCHS", "SEED", "N_EVAL", "EVAL_MODES", "HOLDOUT",
        "CREATE_COLOR", "N_CAL", "VAL_PREC", "VAL_SUB", "VAL_PICK", "SHORT", "OPS", "DIAGRAM_OPS", "LEGEND_EXT"]
assert sorted(ORDER) == sorted(k for k in g if not k.startswith("_")), "GROUPS_8ops.json worlds changed: update ORDER"
for w in ORDER:
    b = json.load(open(f"docs/model/micro/{w}8/BUILD.json"))   # the shipped world of arm ALL (job 070)
    assert b.get("LEGEND_EXT") == "1" and b.get("VAL_PICK") == "specific" and b.get("DIAGRAM_OPS") == "1", f"docs/model/micro/{w}8 is not arm ALL"
    env = " ".join(f"{k}={b[k]}" for k in KEYS if k in b and str(b[k]) != "")
    print(f"{w}\t{w}8\t{','.join(g[w])}\t{env} NEW_DISTINCT=1 FAST=1 FAST_MEM_MB=256 FAST_PROCS=2 VSA_CORR=phase")
PY
cat "$R/worlds.tsv" | tee -a "$TL"

# ---- the conversion gate (CPU, ~1 min; training/sketch/convert_check.py, CONVERT_FIX.md): for every trained folder (the base folders of DATA
# and each EXTRA_DIRS folder) and for short3 / fresh2, the share of the requests whose world row (this world table, these switches) reproduces
# the gold through the browser adapter, the share turned into "every shape" and the share in no world. It stops the job when a trained folder
# turns more than 1% of its requests into "every shape" (2026-11-03 with these switches and data: at most 0.5%, base 0.4%), then the
# round-trip floor: no trained folder below 40% (2026-11-03: the lowest are opus_ext_1 49.3% and opus_short_r2 56.8%; a broken conversion
# falls far below: synth_rules_ops was 5.5% without its switches).
python3 training/sketch/convert_check.py --groups "$W_GROUPS" --worlds-tsv "$R/worlds.tsv" --tests --gate 1.0 --json "$R/convert_check.json" > "$R/convert_check.log" 2>&1; rc=$?
grep -E "^\||^GATE|^gate" "$R/convert_check.log" | tee -a "$TL"
[ "$rc" = 0 ] || fail "convert_check (exit $rc, $R/convert_check.log): a trained folder turns more than 1% of its requests into every shape, or the check failed"
python3 - "$R/convert_check.json" <<'PY' | tee -a "$TL" || fail "convert_check: a trained folder's round trip is below 40% (TRAIN_PLAN_R2.md section 4)"
import json, sys
J = json.load(open(sys.argv[1])); low = []
for r in J["results"]:
    rt = 100 * r["counts"].get("ok", 0) / max(1, r["requests"])
    if r["trained"] and rt < 40: low.append(f"{r['folder']} {rt:.1f}%")
print("round-trip floor (40%):", "passed" if not low else "FAILED " + ", ".join(low)); sys.exit(1 if low else 0)
PY

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
run_world() {   # folder events settings...   (runs in a subshell that owns FD)
  local base=$1 events=$2; shift 2; local w="${base}_${ARMLC}" t=$(date +%s)
  if [ -f "$A/micro/$base/BUILD.json" ]; then echo "[$(date +%T)] skip $base (already trained)" >> "$TL"; return 0; fi
  echo "[$(date +%T)] start $w (VSA_MEM_FRACTION ${MEMFRAC:-0.35})" >> "$TL"
  env "$@" EXTRA_DIRS="$EXTRA_DIRS" DEVICE=cuda VSA_MEM_FRACTION=${MEMFRAC:-0.35} PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True SOP_PYTHON=python3 VSA_MAX_HOURS=4 \
    OMP_NUM_THREADS=2 MKL_NUM_THREADS=2 OPENBLAS_NUM_THREADS=2 bash training/sketch/train_micro.sh "$w" "$events" > "$R/train_$base.log" 2>&1
  local rc=$?
  cp "training/sketch/runs/micro_${w}_D1024_e10_s0.log" "$A/logs/$base.run.log" 2>/dev/null; cp "training/sketch/runs/micro_${w}_D1024_e10_s0/train.log" "$A/logs/$base.train.log" 2>/dev/null
  cp "training/sketch/worlds_micro/$w/REAL_WORLD.md" "$A/logs/$base.REAL_WORLD.md" 2>/dev/null
  if [ $rc -eq 0 ] && [ -f "docs/model/micro/$w/BUILD.json" ]; then
    rm -rf "$A/micro/$base"; mv "docs/model/micro/$w" "$A/micro/$base"; echo "[$(date +%T)] done $w in $(( $(date +%s) - t )) s" >> "$TL"
  else echo "[$(date +%T)] FAILED $w (exit $rc, $R/train_$base.log)" >> "$TL"; return 1; fi
}

# ---- 1. world cutter + event cutter: arm R2's (job 078), copied (one change only: the world models)
CW=$A/cutter_worlds8s.json; CE=$A/cutter_events8.json
cp docs/model/arms/$BASE/cutter_worlds8s.json "$CW"; cp docs/model/arms/$BASE/cutter_events8.json "$CE"; stamp "cutters copied from arm $BASE"

# ---- 2. the 9 worlds, WORLD_PAR at a time, biggest first; a failed world (0.35 cap) is retried alone at 0.85
PIDS=()
while IFS=$'\t' read -r gw base events settings; do
  acquire_slot
  ( run_world "$base" "$events" $settings ) < /dev/null &
  PIDS+=($!)
  exec {FD}>&-          # the child keeps the lock (its copy of FD); this one is closed
done < "$R/worlds.tsv"
bad=0; for p in "${PIDS[@]}"; do wait "$p" || bad=$((bad + 1)); done
if [ "$bad" != 0 ]; then
  stamp "retrying $bad failed world(s) alone, VSA_MEM_FRACTION=0.85"; LOCKS=()
  for i in 0 1 2; do exec {L}>"$LOCK/slot.$i"; flock "$L"; LOCKS+=($L); done
  bad=0
  while IFS=$'\t' read -r gw base events settings; do
    [ -f "$A/micro/$base/BUILD.json" ] && continue
    MEMFRAC=0.85 run_world "$base" "$events" $settings < /dev/null || bad=$((bad + 1))
  done < "$R/worlds.tsv"
  for L in "${LOCKS[@]}"; do exec {L}>&-; done
fi
stamp "worlds done ($bad failed)"
[ "$bad" = 0 ] || fail "$bad world(s) failed (see $R/train_*.log)"
[ -s "$CW" ] && [ -s "$CE" ] || fail "a cutter is missing (see $R/cutter_*.log)"
git status --short docs/model/micro docs/model/context docs/model/neural | head   # must show nothing: the shipped models are untouched
python3 - "$A/micro" <<'PY' | tee -a "$TL" || fail "a world of arm R3C has no correction (VSA_CORR=phase not applied)"
import glob, json, os, sys
bad = []
for d in sorted(glob.glob(os.path.join(sys.argv[1], "*", "manifest.json"))):
    m = json.load(open(d)); b = json.load(open(os.path.join(os.path.dirname(d), "BUILD.json"))); c = json.load(open(os.path.join(os.path.dirname(d), "model.json")))["config"].get("correction") or {}
    cos = (c.get("cosine") or {}).get("train (fit)", {})
    print(os.path.basename(os.path.dirname(d)), m.get("format"), "corr" if m.get("corr") else "NO CORR", b.get("VSA_CORR"), "train cos", cos.get("mean_cos_before"), "->", cos.get("mean_cos_after"))
    if not m.get("corr") or b.get("VSA_CORR") != "phase": bad.append(d)
sys.exit(1 if bad else 0)
PY

# ---- 3. registry_$ARM.json (paths relative to docs/model/), from GROUPS_8ops.json and the world table
python3 - <<PY || fail "registry"
import json
P = "arms/$ARM/"; g = json.load(open("training/sketch/$W_GROUPS"))
folder = {l.split("\t")[0]: l.split("\t")[1] for l in open("$R/worlds.tsv") if l.strip()}
reg = {"about": "Arm VSS-$ARM of TRAIN_PLAN_R3.md: arm $BASE (job 078) with VSA_CORR=phase in every world (the learned world-level correction phase vector, tool/sop/train.py fit_corr); the cutters and the context filler are arm $BASE's files, copied. Data: base + EXTRA_DIRS = $EXTRA_DIRS.", "VSA_CORR": "phase",
       "router": "cutter", "cutter": P + "cutter_worlds8s.json", "context": P + "context/weights.json", "event_cutter": P + "cutter_events8.json", "event_hint": "H1",
       "EXTRA_DIRS": "$EXTRA_DIRS", "LEGEND_EXT": 1, "VAL_PICK": "specific", "DIAGRAM_OPS": 1, "NEW_DISTINCT": 1, "grouping": "$W_GROUPS",
       "worlds": [{"world": w, "events": g[w], "model": P + "micro/" + folder[w]} for w in g if not w.startswith("_")]}
json.dump(reg, open(f"docs/model/arms/$ARM/registry_$ARM.json", "w"), indent=1)
print("registry:", [w["world"] for w in reg["worlds"]])
PY

# ---- 4. context filler: arm R2's weights, copied (not retrained: one change only)
cp docs/model/arms/$BASE/context/weights.json "$A/context/weights.json"; stamp "context filler copied from arm $BASE"

# ---- 5. smoke read: the new registry in the browser composer (node), one message per new form
cat > "$R/smoke.jsonl" <<'EOF'
{"id": "smoke-1", "names": ["Start", "Process", "Check", "Done"], "text": "how do I connect two shapes?", "wires": [{"span": "how do I connect two shapes", "type": "question", "args": {"ask": "help", "topic": "connect", "aspect": "how"}}]}
{"id": "smoke-2", "names": ["Start", "Process", "Check", "Done"], "text": "tidy up the diagram", "wires": [{"span": "tidy up the diagram", "type": "command", "args": {"action": "improve", "target": "mention(quantifier=all)"}}]}
{"id": "smoke-3", "names": [], "text": "make a timeline of Kickoff, Design, Build and Launch", "wires": [{"span": "make a timeline of Kickoff, Design, Build and Launch", "type": "command", "args": {"action": "create", "template": "timeline", "items": "Kickoff,Design,Build,Launch"}}]}
{"id": "smoke-4", "names": ["Start", "Done"], "text": "add a title \"Q3 roadmap\" at the top", "wires": [{"span": "add a title \"Q3 roadmap\" at the top", "type": "command", "args": {"action": "create", "shape": "text", "label": "Q3 roadmap", "position": "top"}}]}
{"id": "smoke-5", "names": ["Start", "Process", "Check", "Done"], "text": "make all the arrows dashed", "wires": [{"span": "make all the arrows dashed", "type": "command", "args": {"action": "set", "style": "dashed", "kind": "edge", "quantifier": "all"}}]}
{"id": "smoke-6", "names": ["Start", "Process", "Check", "Done"], "text": "reverse the arrow from Start to Process", "wires": [{"span": "reverse the arrow from Start to Process", "type": "command", "args": {"action": "reverse", "from": "Start", "to": "Process"}}]}
{"id": "smoke-7", "names": ["Start", "Process", "Check", "Done"], "text": "remove all the stars", "wires": [{"span": "remove all the stars", "type": "command", "args": {"action": "delete", "target": "mention(quantifier=all,shape=star)"}}]}
{"id": "smoke-8", "names": ["Start", "Process", "Check", "Done"], "text": "give Process a red outline", "wires": [{"span": "give Process a red outline", "type": "command", "args": {"action": "set", "target": "Process", "outline": "red"}}]}
{"id": "smoke-9", "names": ["Start", "Process", "Check", "Done"], "text": "group Start and Done as Ends", "wires": [{"span": "group Start and Done as Ends", "type": "command", "args": {"action": "group", "target": "Start,Done", "name": "Ends"}}]}
{"id": "smoke-10", "names": ["Start", "Process", "Check", "Done"], "text": "move Done to 300,200", "wires": [{"span": "move Done to 300,200", "type": "command", "args": {"action": "move", "target": "Done", "at": "300,200"}}]}
{"id": "smoke-11", "names": ["Start", "Process", "Check", "Done", "Draft"], "text": "Draft blue", "wires": [{"span": "Draft blue", "type": "command", "args": {"action": "set", "target": "Draft", "color": "blue"}}]}
{"id": "smoke-12", "names": ["Start", "Process", "Check", "Done"], "text": "ok so now undo twice pls", "wires": [{"span": "undo twice", "type": "command", "args": {"action": "undo", "count": "2"}}]}
{"id": "smoke-13", "names": ["Start", "Process", "Check", "Done"], "text": "no border on Check", "wires": [{"span": "no border on Check", "type": "command", "args": {"action": "set", "target": "Check", "outline": "none"}}]}
{"id": "smoke-14", "names": ["Start", "Process", "Check", "Done"], "text": "make Done red. no wait, orange", "wires": [{"span": "make Done red. no wait, orange", "type": "command", "args": {"action": "set", "target": "Done", "color": "orange"}}]}
{"id": "smoke-15", "names": ["Start", "Process", "Check", "Done"], "text": "start left, done right", "wires": [{"span": "start left", "type": "command", "args": {"action": "move", "target": "Start", "position": "left"}}, {"span": "done right", "type": "command", "args": {"action": "move", "target": "Done", "position": "right"}}]}
{"id": "smoke-16", "names": ["Start", "Process", "Check", "Done"], "text": "delete the small squares", "wires": [{"span": "delete the small squares", "type": "command", "args": {"action": "delete", "target": "mention(quantifier=all,shape=square,size=small)"}}]}
EOF
mkdir -p "$R/smoke" && cp "$R/smoke.jsonl" "$R/smoke/batch_01.jsonl"
REGISTRY="$A/registry_$ARM.json" CONTEXT="$A/context/weights.json" node training/sketch/fresh2/collect_vss.mjs "$R/smoke_records.jsonl" smoke "$R/smoke" 2>&1 | tail -2 | tee -a "$TL"
stamp "done"; du -sh "$A" "$R"
git status --short docs/model/micro docs/model/context docs/model/neural | head   # must show nothing
