# PATHS: docs/model/arms/R3/micro docs/model/arms/R3/context docs/model/arms/R3/logs docs/model/arms/R3/cutter_worlds8s.json docs/model/arms/R3/cutter_events8.json docs/model/arms/R3/registry_R3.json results/081_vss_r3
# TRAIN_PLAN_R3.md section A, arm R3, VSS: the whole VSS chain (9 worlds of worlds_micro/GROUPS_8ops.json, world cutter, event cutter, context
# filler) retrained as job 070 (arm ALL, the shipped readers) with the round-3 data and two converter switches. Nothing under docs/model/micro,
# docs/model/context or docs/model/neural is written: every export goes to docs/model/arms/R3/. The measurement against arm ALL is job 083.
# What changes against job 070 (arm ALL):
#   - data (P1 of scenes_r3/ROOT_CAUSES.md section 6): EXTRA_DIRS = arm ALL's 12 folders (NOT round 2's *_dd / synth_short_r2 / opus_short_r2:
#     TRAIN_PLAN_R3.md section A.2 says why) + llm_train/scenes_r3 (16 step-by-step scenes, 701 messages, 714 requests) + llm_train/scenes_r3b
#     (4 targeted scenes, 96 messages, 94 requests) + llm_train/opus_r3_gaps (the forms of the owner's session 1, 136 messages, 147 requests;
#     training data written from SESSION_1_ANALYSIS.md, not the benchmark llm_bench/collected_1). Never trained on: llm_bench/scenes_test,
#     short3, fresh2, collected_1 (overlap checked, TRAIN_PLAN_R3.md section A.3).
#   - GAP_ROLE=1 (P2; llm_to_world.py): a gap written with a relation ("6 px above Pot") fills the role amount; docs/js/vss-adapter.js reads
#     amount beside a relation as distance. Recorded in BUILD.json (train_micro.sh).
#   - NEW_DISTINCT=1 (llm_to_world.py; TRAIN_PLAN_R2.md 2.3): several `$new` in one wire become distinct created names; a converter correctness
#     fix (16 rows of 070's data + tests change, all to the roles the text states).
#   - NOT switched on: FRONT_NEG, VAL_GUARD (round 2: no gain), VAL_SHADOW / VAL_PREC=event (ROOT_CAUSES.md section 4: a folder went down),
#     P3 / P6 (need the owner's OK), VSA_CORR (arm R3C, job 084, one change at a time).
#   - the settings of each world: the shipped BUILD.json of its <world>8 (arm ALL) + NEW_DISTINCT=1 GAP_ROLE=1, FAST=1 FAST_MEM_MB=256
#     FAST_PROCS=2 on cuda (the memory-safe settings of job 078: 073 was stopped by the memory guard with 8 calibration processes).
# Why everything is retrained: every learned part reads EXTRA_DIRS (front.py train_dirs, train_cutter.py, micro_tools.py for the filler). The
# the 955 new requests reach 8 of the 9 worlds (TRAIN_PLAN_R3.md A.4: shapes 477, manage 138, questions 109, position 84, links 73, graphq 50,
# history 19, layout 5); help gets none (its rows and front end come out as arm ALL's; it is retrained anyway, ~1 min, so that the arm is one
# build); the cutters and the filler learn from every message.
# Gates before the GPU is used: the data folders exist and are annotated; the round-2 / round-3 code is present with FRONT_NEG / VAL_GUARD off;
# legend_values.json values are the legend of docs/js/logic.js; convert_check.py with this world table: no trained folder turns more than 1% of
# its requests into "every shape", and no trained folder's round trip is below 40% (TRAIN_PLAN_R3.md A.5 has the dry-run numbers).
# GATES_ONLY=1 (dry checks on any machine): stops after the gates, trains nothing (the runner never sets it).
# GPU / memory / time: as job 078 (results/078_vss_round2_resume2/timings.txt): rows +4.3% against 070 (933 messages more). Expected ~70-90 min
# (worlds ~40-60 min at WORLD_PAR=2, cutters ~30 min in parallel, filler ~20 min).
set -uo pipefail
ARM=R3; ARMLC=r3; JOB=081_vss_r3
export FAST_PROCS=${FAST_PROCS:-2}   # 073 failed: calibration in 8 processes left MemAvailable 0.8 GB (guard 1.5 GB); 2 processes since 078
EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_gen_1 llm_train/opus_gen_2 llm_train/synth_rules llm_train/synth_rules_ops llm_train/synth_rules_ext llm_train/ops_formulations llm_train/opus_ext_1 llm_train/synth_combo llm_train/scenes_r3 llm_train/scenes_r3b llm_train/opus_r3_gaps"
export EXTRA_DIRS LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1 NEW_DISTINCT=1 GAP_ROLE=1   # CONVERT_FIX.md + NEW_DISTINCT + GAP_ROLE; FRONT_NEG / VAL_GUARD stay off
# PREP_SWITCHES: the round-3 preprocessing switches approved by the owner (P3 name token, P6 number words, ...; TRAIN_PLAN_R3.md A.1), as
# NAME=VALUE words, filled in by the coordinator once each is measured; exported for every learned part (convert_check, the worlds, the cutters,
# the filler) and appended to every world's settings in worlds.tsv. Empty: arm R3 as dry-run on 2026-11-03.
PREP_SWITCHES=${PREP_SWITCHES-""}
for kv in $PREP_SWITCHES; do export "$kv"; done
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
stamp "PREP_SWITCHES=$PREP_SWITCHES"; stamp "arm VSS-$ARM, LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1 NEW_DISTINCT=1 GAP_ROLE=1, $W_GROUPS, EXTRA_DIRS=$EXTRA_DIRS"; nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv | tee -a "$TL"; free -g | tee -a "$TL"

# ---- data and code checks: every folder annotated, the code of the switches present, the legend values current
( cd training/sketch && python3 -c "import front; d = front.extra_dirs(); print(len(d), 'extra folders:', d)" ) || fail "EXTRA_DIRS folders are missing or not annotated"
( cd training/sketch && DATA=spans python3 -c "import front; print(len(front.load_msgs()), 'messages for the worlds (DATA=spans + EXTRA_DIRS)')" ) | tee -a "$TL"
for f in training/sketch/$W_GROUPS training/sketch/$EV_GROUPS training/sketch/legend_ext/legend_values.json training/sketch/convert_check.py docs/model/context/weights.json; do [ -f "$f" ] || fail "missing $f"; done
( cd training/sketch && python3 -c "import generate as G, llm_to_world, front; assert G.LEGEND_EXT and 'help' in G.EVENTS, 'LEGEND_EXT code missing'; assert 'group' in G.EVENTS and {'outline', 'x', 'y', 'linked'} <= dict(G.ROLES).keys(), 'CONVERT_FIX code missing'; assert front.val_pick() == 'specific'; assert 'NEW_DISTINCT' in open('llm_to_world.py').read() and hasattr(front, 'neg_labels'), 'round-2 code missing'; assert llm_to_world.GAP_ROLE, 'GAP_ROLE code missing (llm_to_world.py)'; assert not front.front_neg() and not front.val_guard('mask') and not front.val_guard('keep'), 'FRONT_NEG / VAL_GUARD must be off'; print(len(G.EVENTS), 'legend events,', len(G.ROLES), 'roles')" ) | tee -a "$TL" || fail "LEGEND_EXT / DIAGRAM_OPS / VAL_PICK / NEW_DISTINCT / GAP_ROLE code"
grep -q "GAP_ROLE" training/sketch/train_micro.sh && grep -q "R.amount != null" docs/js/vss-adapter.js || fail "GAP_ROLE is not recorded by train_micro.sh or not read by docs/js/vss-adapter.js"
node training/sketch/legend_ext/export_legend_values.mjs > "$R/legend_values.log" || fail "export_legend_values.mjs"
# only the values matter: a new logic.js commit changes the sha line alone (076 stopped on that)
git diff -U0 -- training/sketch/legend_ext/legend_values.json > "$R/legend_values.diff"; git checkout -- training/sketch/legend_ext/legend_values.json   # restored before any stop
grep "^[-+][^-+]" "$R/legend_values.diff" | grep -qv "sha" && fail "legend_values.json values differ from the legend of docs/js/logic.js (re-export and commit it; $R/legend_values.diff)"

# ---- the world table: GROUPS_8ops world -> model folder, its events, the settings (the shipped BUILD.json of its <world>8, arm ALL,
# + NEW_DISTINCT=1 GAP_ROLE=1), biggest first (rows of the 2026-11-03 dry build)
python3 - "$PREP_SWITCHES" > "$R/worlds.tsv" <<'PY' || fail "worlds.tsv"
import json, sys
prep = (" " + sys.argv[1].strip()) if sys.argv[1].strip() else ""
g = json.load(open("training/sketch/worlds_micro/GROUPS_8ops.json"))
ORDER = ["shapes", "position", "questions", "links", "graphq", "manage", "history", "help", "layout"]   # rows, dry build 2026-11-03
KEYS = ["DATA", "FRAC", "QCOLOR", "MARKER", "ROW_SHAPE", "FRONT_ROWS", "KINDMAP", "CAL_FALLBACK", "D", "EPOCHS", "SEED", "N_EVAL", "EVAL_MODES", "HOLDOUT",
        "CREATE_COLOR", "N_CAL", "VAL_PREC", "VAL_SUB", "VAL_PICK", "SHORT", "OPS", "DIAGRAM_OPS", "LEGEND_EXT"]
assert sorted(ORDER) == sorted(k for k in g if not k.startswith("_")), "GROUPS_8ops.json worlds changed: update ORDER"
for w in ORDER:
    b = json.load(open(f"docs/model/micro/{w}8/BUILD.json"))   # the shipped world of arm ALL (job 070)
    assert b.get("LEGEND_EXT") == "1" and b.get("VAL_PICK") == "specific" and b.get("DIAGRAM_OPS") == "1", f"docs/model/micro/{w}8 is not arm ALL"
    assert not b.get("NEW_DISTINCT") and not b.get("GAP_ROLE") and not b.get("VSA_CORR"), f"docs/model/micro/{w}8 is not arm ALL"
    env = " ".join(f"{k}={b[k]}" for k in KEYS if k in b and str(b[k]) != "")
    print(f"{w}\t{w}8\t{','.join(g[w])}\t{env} NEW_DISTINCT=1 GAP_ROLE=1 FAST=1 FAST_MEM_MB=256 FAST_PROCS=2{prep}")
PY
cat "$R/worlds.tsv" | tee -a "$TL"

# ---- the conversion gate (CPU, ~5 min; training/sketch/convert_check.py, CONVERT_FIX.md): for every trained folder (the base folders of DATA
# and each EXTRA_DIRS folder) and for short3 / fresh2 / scenes_test (reported only), the share of the requests whose world row (this world
# table, these switches; GAP_ROLE from the environment) reproduces the gold through the browser adapter, the share turned into "every shape"
# and the share in no world. It stops the job when a trained folder turns more than 1% of its requests into "every shape", then the round-trip
# floor: no trained folder below 40% (a broken conversion falls far below: synth_rules_ops was 5.5% without its switches).
python3 training/sketch/convert_check.py --groups "$W_GROUPS" --worlds-tsv "$R/worlds.tsv" --tests --gate 1.0 --json "$R/convert_check.json" llm_bench/scenes_test > "$R/convert_check.log" 2>&1; rc=$?
grep -E "^\||^GATE|^gate" "$R/convert_check.log" | tee -a "$TL"
[ "$rc" = 0 ] || fail "convert_check (exit $rc, $R/convert_check.log): a trained folder turns more than 1% of its requests into every shape, or the check failed"
python3 - "$R/convert_check.json" <<'PY' | tee -a "$TL" || fail "convert_check: a trained folder's round trip is below 40% (TRAIN_PLAN_R3.md A.5)"
import json, sys
J = json.load(open(sys.argv[1])); low = []
for r in J["results"]:
    rt = 100 * r["counts"].get("ok", 0) / max(1, r["requests"])
    if r["trained"] and rt < 40: low.append(f"{r['folder']} {rt:.1f}%")
print("round-trip floor (40%):", "passed" if not low else "FAILED " + ", ".join(low)); sys.exit(1 if low else 0)
PY
if [ "${GATES_ONLY:-0}" = 1 ]; then stamp "GATES_ONLY=1: gates passed, nothing trained"; exit 0; fi

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
python3 - "$A/micro" <<'PY' | tee -a "$TL" || fail "a world of arm R3 was not built with NEW_DISTINCT=1 GAP_ROLE=1 and this EXTRA_DIRS"
import glob, json, os, sys
bad = []
for f in sorted(glob.glob(os.path.join(sys.argv[1], "*", "BUILD.json"))):
    b = json.load(open(f)); ok = b.get("NEW_DISTINCT") == "1" and b.get("GAP_ROLE") == "1" and "llm_train/opus_r3_gaps" in b.get("EXTRA_DIRS", "") and not b.get("VSA_CORR")
    print(os.path.basename(os.path.dirname(f)), b.get("rows"), "rows", "ok" if ok else "WRONG SETTINGS")
    if not ok: bad.append(f)
sys.exit(1 if bad or len(glob.glob(os.path.join(sys.argv[1], "*", "BUILD.json"))) != 9 else 0)
PY

# ---- 3. registry_R3.json (paths relative to docs/model/), from GROUPS_8ops.json and the world table
python3 - <<PY || fail "registry"
import json
P = "arms/$ARM/"; g = json.load(open("training/sketch/$W_GROUPS"))
folder = {l.split("\t")[0]: l.split("\t")[1] for l in open("$R/worlds.tsv") if l.strip()}
reg = {"about": "Arm VSS-$ARM of TRAIN_PLAN_R3.md: the VSS chain of arm ALL (9 worlds of worlds_micro/GROUPS_8ops.json with LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1, cutter_worlds8s, cutter_events8 with the event hint H1, the context filler) retrained with NEW_DISTINCT=1 GAP_ROLE=1 on base + EXTRA_DIRS = $EXTRA_DIRS (all learned parts).",
       "router": "cutter", "cutter": P + "cutter_worlds8s.json", "context": P + "context/weights.json", "event_cutter": P + "cutter_events8.json", "event_hint": "H1",
       "EXTRA_DIRS": "$EXTRA_DIRS", "LEGEND_EXT": 1, "VAL_PICK": "specific", "DIAGRAM_OPS": 1, "NEW_DISTINCT": 1, "GAP_ROLE": 1, "grouping": "$W_GROUPS",
       "worlds": [{"world": w, "events": g[w], "model": P + "micro/" + folder[w]} for w in g if not w.startswith("_")]}
json.dump(reg, open(f"docs/model/arms/$ARM/registry_$ARM.json", "w"), indent=1)
print("registry:", [w["world"] for w in reg["worlds"]])
PY

# ---- 4. context filler (CPU, node, one process): the arm's registry builds the units; the SHIPPED filler breaks ties during that build
stamp "context filler start"
( cd training/sketch && EXTRA_DIRS="$EXTRA_DIRS" REGISTRY="$ROOT/$A/registry_$ARM.json" CONTEXT="$ROOT/docs/model/context/weights.json" WEIGHTS="$ROOT/$A/context/weights.json" \
    CACHE="$HOME/vss-box/state/layer_cache_$ARM.json" REBUILD=1 node train_context.mjs ) > "$R/context.log" 2>&1 || { tail -5 "$R/context.log"; fail "context filler"; }
tail -4 "$R/context.log" | cut -c1-250; stamp "context filler done"

# ---- 5. smoke read: the new registry in the browser composer (node): job 078's 16 messages + 6 of the round-3 forms (not in any data folder)
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
{"id": "smoke-17", "names": ["Pot"], "text": "Leaf: a small green circle 6 px above Pot", "wires": [{"span": "Leaf: a small green circle 6 px above Pot", "type": "command", "args": {"action": "create", "name": "Leaf", "shape": "circle", "size": "small", "color": "green", "position": "above", "anchor": "Pot", "distance": "6"}}]}
{"id": "smoke-18", "names": [], "text": "Desk: brown rectangle 160 by 70 at 300, 220", "wires": [{"span": "Desk: brown rectangle 160 by 70 at 300, 220", "type": "command", "args": {"action": "create", "name": "Desk", "shape": "rectangle", "color": "brown", "width": "160", "height": "70", "at": "300,220"}}]}
{"id": "smoke-19", "names": ["Start", "Process", "Check", "Done"], "text": "make me a blue square", "wires": [{"span": "make me a blue square", "type": "command", "args": {"action": "create", "shape": "square", "color": "blue"}}]}
{"id": "smoke-20", "names": ["Start", "Process", "Check", "Done"], "text": "put all the elements in the form of a circle", "wires": [{"span": "put all the elements in the form of a circle", "type": "command", "args": {"action": "arrange", "target": "mention(quantifier=all)", "layout": "circle"}}]}
{"id": "smoke-21", "names": ["Start", "Process", "Check", "Done"], "text": "add a text element that says Hello World", "wires": [{"span": "add a text element that says Hello World", "type": "command", "args": {"action": "create", "shape": "text", "label": "Hello World"}}]}
{"id": "smoke-22", "names": ["Start", "Process", "Check", "Done"], "text": "join Start and Done", "wires": [{"span": "join Start and Done", "type": "command", "args": {"action": "connect", "from": "Start", "to": "Done"}}]}
EOF
mkdir -p "$R/smoke" && cp "$R/smoke.jsonl" "$R/smoke/batch_01.jsonl"
REGISTRY="$A/registry_$ARM.json" CONTEXT="$A/context/weights.json" node training/sketch/fresh2/collect_vss.mjs "$R/smoke_records.jsonl" smoke "$R/smoke" 2>&1 | tail -2 | tee -a "$TL"
stamp "done"; du -sh "$A" "$R"
git status --short docs/model/micro docs/model/context docs/model/neural | head   # must show nothing
