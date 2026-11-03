# PATHS: docs/model/arms/R2/micro docs/model/arms/R2/context docs/model/arms/R2/logs docs/model/arms/R2/cutter_worlds8s.json docs/model/arms/R2/cutter_events8.json docs/model/arms/R2/registry_R2.json results/078_vss_round2_resume2
# Resume of job 073 (exit 1: shapes8, position8, links8 stopped by the memory guard in calibration with 8 processes): trained worlds and both cutters are skipped; FAST_PROCS=2.
# TRAIN_PLAN_R2.md, arm R2, VSS: the whole VSS chain (9 worlds of worlds_micro/GROUPS_8ops.json, world cutter, event cutter, context filler)
# retrained as job 070 (arm ALL, the shipped readers since 220295a) with the fixes and the data of round 2. Nothing under docs/model/micro,
# docs/model/context or docs/model/neural is written: every export goes to docs/model/arms/R2/. The measurement against the shipped readers
# is job 075.
# What changes against job 070 (each measured in TRAIN_PLAN_R2.md; every switch is off by default, all off = builds byte-identical):
#   - NEW_DISTINCT=1 (llm_to_world.py; VSS_FROM_TO.md section 1): a wire with several `$new` gives each its own created name ("Arrows from Dad
#     and Mom to Me" was members={Me,Me}, target=Me; now members={Dad,Mom}). 16 rows of 070's data + tests change, all to the right roles.
#   - NOT switched on (measured, no gain; TRAIN_PLAN_R2.md section 2): FRONT_NEG (the other worlds' requests as negative evidence for a world's
#     front end) and VAL_GUARD (value n-grams never take in the trigger; kept value tokens must be gold). The switches stay in the code, off.
#   - data (EXTRA_DIRS): synth_rules, synth_rules_ops, synth_rules_ext, synth_combo replaced by their frame-deduplicated copies *_dd
#     (data_repetition.py --keep 2: 1683 of 14058 messages dropped, each a copy of kept ones up to names / numbers / quoted texts); new
#     synth_short_r2 (1997 synthetic short commands of the 2026-11-02 forms the data lacked, read exactly by the Rules, 1374 of them wrapped
#     in narration) and opus_short_r2 (255 realistic short messages: verbless commands, chained commands and gapping, self-corrections,
#     narration, the new forms the Rules do not read; written by an Opus writer, label-checked by Rules paraphrases).
#   - the settings of each world: the shipped BUILD.json of its <world>8 (arm ALL: DATA=spans FRONT_ROWS=world QCOLOR=1 MARKER=0
#     KINDMAP=kinds_comb1 CAL_FALLBACK=train D=1024 EPOCHS=10 SEED=0 N_EVAL=150 EVAL_MODES=primary LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1;
#     CREATE_COLOR=role for shapes) + NEW_DISTINCT=1, FAST=1 FAST_MEM_MB=256 on cuda.
# Gates before the GPU is used: the data folders exist and are annotated; the round-2 code is present; legend_values.json is the legend of
# docs/js/logic.js; convert_check.py: no trained folder turns more than 1% of its requests into "every shape" (2026-11-03 with these
# settings: at most 0.5%, base 0.4%), and no trained folder's round trip is below 40% (lowest 2026-11-03: opus_ext_1 49.3%, opus_short_r2 56.8%).
# GPU / memory / time: as job 070 (results/070_vss_all/timings.txt). Rows of the dry build (convert_check, 2026-11-03): about the same as
# 070 (+2342 new messages, -1683 deduplicated). Expected ~60-80 min (070: worlds ~35-55 min, cutters ~25-30 min in parallel, filler ~15-20 min).
set -uo pipefail
ARM=R2; ARMLC=r2; JOB=078_vss_round2_resume2
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
stamp "arm VSS-$ARM, LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1 NEW_DISTINCT=1, $W_GROUPS, EXTRA_DIRS=$EXTRA_DIRS"; nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv | tee -a "$TL"; free -g | tee -a "$TL"

# ---- data and code checks: every folder annotated, the LEGEND_EXT code present, the legend values current
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
    print(f"{w}\t{w}8\t{','.join(g[w])}\t{env} NEW_DISTINCT=1 FAST=1 FAST_MEM_MB=256 FAST_PROCS=2")
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

# ---- 1. world cutter + event cutter (CPU, one process each) at the same time as the worlds
CW=$A/cutter_worlds8s.json; CE=$A/cutter_events8.json
[ -s "$CW" ] && stamp "world cutter: already trained" || ( stamp "world cutter start"; cd training/sketch && SHORT=1 python3 train_cutter.py --worlds "$W_GROUPS" --out "$ROOT/$CW" > "$ROOT/$R/cutter_worlds.log" 2>&1; echo "world cutter exit $?" >> "$ROOT/$TL" ) &
PID_CW=$!
[ -s "$CE" ] && stamp "event cutter: already trained" || ( stamp "event cutter start"; cd training/sketch && python3 train_cutter.py --worlds "$EV_GROUPS" --out "$ROOT/$CE" > "$ROOT/$R/cutter_events.log" 2>&1; echo "event cutter exit $?" >> "$ROOT/$TL" ) &
PID_CE=$!

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
wait "$PID_CW" "$PID_CE"
stamp "worlds done ($bad failed); cutters done"
[ "$bad" = 0 ] || fail "$bad world(s) failed (see $R/train_*.log)"
[ -s "$CW" ] && [ -s "$CE" ] || fail "a cutter is missing (see $R/cutter_*.log)"
grep -h "left out\|requests per world" "$R"/cutter_*.log | cut -c1-400 | tee -a "$TL"
git status --short docs/model/micro docs/model/context docs/model/neural | head   # must show nothing: the shipped models are untouched

# ---- 3. registry_R2.json (paths relative to docs/model/), from GROUPS_8ops.json and the world table
python3 - <<PY || fail "registry"
import json
P = "arms/$ARM/"; g = json.load(open("training/sketch/$W_GROUPS"))
folder = {l.split("\t")[0]: l.split("\t")[1] for l in open("$R/worlds.tsv") if l.strip()}
reg = {"about": "Arm VSS-$ARM of TRAIN_PLAN_R2.md: the VSS chain of arm ALL (9 worlds of worlds_micro/GROUPS_8ops.json with LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1, cutter_worlds8s, cutter_events8 with the event hint H1, the context filler) retrained with NEW_DISTINCT=1 on base + EXTRA_DIRS = $EXTRA_DIRS (all learned parts; *_dd = frame-deduplicated copies, data_repetition.py).",
       "router": "cutter", "cutter": P + "cutter_worlds8s.json", "context": P + "context/weights.json", "event_cutter": P + "cutter_events8.json", "event_hint": "H1",
       "EXTRA_DIRS": "$EXTRA_DIRS", "LEGEND_EXT": 1, "VAL_PICK": "specific", "DIAGRAM_OPS": 1, "NEW_DISTINCT": 1, "grouping": "$W_GROUPS",
       "worlds": [{"world": w, "events": g[w], "model": P + "micro/" + folder[w]} for w in g if not w.startswith("_")]}
json.dump(reg, open(f"docs/model/arms/$ARM/registry_$ARM.json", "w"), indent=1)
print("registry:", [w["world"] for w in reg["worlds"]])
PY

# ---- 4. context filler (CPU, node, one process): the arm's registry builds the units; the SHIPPED filler breaks ties during that build
stamp "context filler start"
( cd training/sketch && EXTRA_DIRS="$EXTRA_DIRS" REGISTRY="$ROOT/$A/registry_$ARM.json" CONTEXT="$ROOT/docs/model/context/weights.json" WEIGHTS="$ROOT/$A/context/weights.json" \
    CACHE="$HOME/vss-box/state/layer_cache_$ARM.json" REBUILD=1 node train_context.mjs ) > "$R/context.log" 2>&1 || { tail -5 "$R/context.log"; fail "context filler"; }
tail -4 "$R/context.log" | cut -c1-250; stamp "context filler done"

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
