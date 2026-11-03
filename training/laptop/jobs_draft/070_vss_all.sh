# PATHS: docs/model/arms/ALL/micro docs/model/arms/ALL/context docs/model/arms/ALL/logs docs/model/arms/ALL/cutter_worlds8s.json docs/model/arms/ALL/cutter_events8.json docs/model/arms/ALL/registry_ALL.json results/070_vss_all
# TRAIN_PLAN_1103.md, arm ALL, VSS: the whole VSS chain retrained so that it reads the forms of 2026-11-02 (help questions, the layout operations,
# reverse, templates, free text, panels, arrow restyle and labels, create with a layout), on the G data + every synthetic and new realistic folder.
# Nothing under docs/model/micro, docs/model/context or docs/model/neural is written: every export goes to docs/model/arms/ALL/.
#   - LEGEND_EXT=1 (generate.py / front.py / llm_to_world.py): the new events and roles; the 9 worlds of worlds_micro/GROUPS_8ops.json: the 7 shipped
#     worlds (their events, plus reverse in links, group / ungroup in manage, members / groupOf in questions) + layout (improve, respace, snap,
#     fit, flip, sort, groupBy, equalize, straighten, untangle) + help.
#   - the conversion fixes of training/sketch/synth/CONVERT_FIX.md (2026-11-03; every one off by default, all three on here):
#     VAL_PICK=specific (front.py learn_values: a value n-gram stands for its most specific value, so "circles" is no longer the quantifier
#     `all`, and "not orange" -> not_orange); LEGEND_EXT=1 now also never writes a description broader than its gold ("remove all the stars"
#     is never "every shape") and gives the keys outline, at (x, y), linked and the undo / redo count their roles; DIAGRAM_OPS=1 (groups:
#     group, ungroup, members, groupOf; position2 / anchor2; a region with a relation). Before training, convert_check.py gates the data:
#     the share of each folder's requests whose world row reproduces its gold, and the job stops if a trained folder turns more than 1% of
#     its requests into "every shape".
#     Each world with the settings of the shipped BUILD.json of its GROUPS_7 world (DATA=spans FRONT_ROWS=world QCOLOR=1 MARKER=0 KINDMAP=kinds_comb1
#     CAL_FALLBACK=train D=1024 EPOCHS=10 SEED=0 N_EVAL=150 EVAL_MODES=primary; CREATE_COLOR=role for shapes), the two new worlds with the same
#     common settings; FAST=1 FAST_MEM_MB=256 (training/vss/FAST_TRAIN.md: byte-identical training, a step's memory bounded) on cuda. Each world
#     is built as <world>8_all, then moved to docs/model/arms/ALL/micro/<world>8.
#   - world cutter (SHORT=1, GROUPS_8.json) and event cutter (GROUPS_EVENTS_8.json): python on CPU, one process each, while the worlds train.
#   - registry_ALL.json (built from GROUPS_8.json: router cutter, event hint H1, this arm's cutters and filler), then the context filler.
#   - a smoke read of a few messages through the new registry (the browser composer in node); the measurement is job 072.
# Data: EXTRA_DIRS = the G folders (opus_train_a..d, opus_gen_1/2) + synth_rules + synth_rules_ops + synth_rules_ext + ops_formulations +
#   opus_ext_1 + synth_combo (dry build 2026-11-03 with LEGEND_EXT=1 only: shapes 15919 rows, position 10143, questions 7432, links 6680,
#   graphq 4905, manage 3678, history 901, help 847, layout 501). synth_rules_ops stays: with DIAGRAM_OPS=1 and the new roles 76.5% of its
#   requests become rows that reproduce their gold (35.4% without; CONVERT_FIX.md); its group / ungroup / members / groupOf requests go to
#   manage and questions (manage 3909 rows in the 2026-11-03 smoke build).
# GPU / memory (round logs, jobs 061/065: RTX 3050 Ti, 3.73 GB, 15.2 GB RAM): a world allocates 0.03-0.17 GB on the card, 1.65-1.7 GB RSS while
# training and 2.8-4.3 GB at the end; job 061 lost shapes7c and links7 to the 0.35 cap, both ran alone at 0.85 (065). So WORLD_PAR (default 2)
# worlds train at once, biggest first, across ALL jobs of this machine (slot files in $HOME/vss-box/state/gpu: SOP-BERT jobs take every slot),
# VSA_MEM_FRACTION 0.35 per world, and a world that fails is retried alone at 0.85, holding every slot.
# Expected time (scaled from 065 by rows: shapes7c 8047 rows 419 s, links7 4741 534 s, position7 5711 357 s, questions7 207 s, graphq7 206 s,
# manage7 75 s, history7 23 s): worlds ~35 min at WORLD_PAR=2, ~55 min if shapes and links need the 0.85 retry again; cutters (CPU, 24.7k messages,
# ~4x job 061's) ~25-30 min in parallel; context filler ~15-20 min (job 065: 4.7 min on 6440 messages). In all ~60-80 min.
set -uo pipefail
ARM=ALL; ARMLC=all; JOB=070_vss_all
EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_gen_1 llm_train/opus_gen_2 llm_train/synth_rules llm_train/synth_rules_ops llm_train/synth_rules_ext llm_train/ops_formulations llm_train/opus_ext_1 llm_train/synth_combo"
export EXTRA_DIRS LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1   # CONVERT_FIX.md: the three conversion switches, for every learned part
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
stamp "arm VSS-$ARM, LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1, $W_GROUPS, EXTRA_DIRS=$EXTRA_DIRS"; nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv | tee -a "$TL"; free -g | tee -a "$TL"

# ---- data and code checks: every folder annotated, the LEGEND_EXT code present, the legend values current
( cd training/sketch && python3 -c "import front; d = front.extra_dirs(); print(len(d), 'extra folders:', d)" ) || fail "EXTRA_DIRS folders are missing or not annotated"
( cd training/sketch && DATA=spans python3 -c "import front; print(len(front.load_msgs()), 'messages for the worlds (DATA=spans + EXTRA_DIRS)')" ) | tee -a "$TL"
for f in training/sketch/$W_GROUPS training/sketch/$EV_GROUPS training/sketch/legend_ext/legend_values.json training/sketch/convert_check.py docs/model/context/weights.json; do [ -f "$f" ] || fail "missing $f"; done
( cd training/sketch && python3 -c "import generate as G, llm_to_world, front; assert G.LEGEND_EXT and 'help' in G.EVENTS, 'LEGEND_EXT code missing'; assert 'group' in G.EVENTS and {'outline', 'x', 'y', 'linked'} <= dict(G.ROLES).keys(), 'CONVERT_FIX code missing'; assert front.val_pick() == 'specific'; print(len(G.EVENTS), 'legend events,', len(G.ROLES), 'roles')" ) | tee -a "$TL" || fail "LEGEND_EXT / DIAGRAM_OPS / VAL_PICK code"
node training/sketch/legend_ext/export_legend_values.mjs > "$R/legend_values.log" && git diff --quiet -- training/sketch/legend_ext/legend_values.json || fail "legend_values.json is not the legend of docs/js/logic.js (re-export and commit it)"

# ---- the world table: GROUPS_8 world -> model folder, its events, the settings (the shipped BUILD.json of its GROUPS_7 world; new worlds: the common
# settings), biggest first (rows of the 2026-11-03 dry build)
COMMON="DATA=spans FRAC=1.0 QCOLOR=1 MARKER=0 FRONT_ROWS=world KINDMAP=diagnosis_kinds/kinds_comb1.json CAL_FALLBACK=train D=1024 EPOCHS=10 SEED=0 N_EVAL=150 EVAL_MODES=primary"
python3 - "$COMMON" > "$R/worlds.tsv" <<'PY' || fail "worlds.tsv"
import json, sys
g = json.load(open("training/sketch/worlds_micro/GROUPS_8ops.json")); common = sys.argv[1]
SHIPPED = {"shapes": "shapes7c", "links": "links7", "position": "position7", "graphq": "graphq7", "questions": "questions7", "manage": "manage7", "history": "history7"}
ORDER = ["shapes", "position", "questions", "links", "graphq", "manage", "history", "help", "layout"]   # rows, dry build 2026-11-03
KEYS = ["DATA", "FRAC", "QCOLOR", "MARKER", "ROW_SHAPE", "FRONT_ROWS", "KINDMAP", "CAL_FALLBACK", "D", "EPOCHS", "SEED", "N_EVAL", "EVAL_MODES", "HOLDOUT",
        "CREATE_COLOR", "N_CAL", "VAL_PREC", "VAL_SUB", "VAL_PICK", "SHORT", "OPS", "DIAGRAM_OPS"]
assert sorted(ORDER) == sorted(k for k in g if not k.startswith("_")), "GROUPS_8ops.json worlds changed: update ORDER"
for w in ORDER:
    if w in SHIPPED:
        b = json.load(open(f"docs/model/micro/{SHIPPED[w]}/BUILD.json"))
        env = " ".join(f"{k}={b[k]}" for k in KEYS if k in b and str(b[k]) != "")
    else: env = common
    print(f"{w}\t{w}8\t{','.join(g[w])}\t{env} FAST=1 FAST_MEM_MB=256 LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1")
PY
cat "$R/worlds.tsv" | tee -a "$TL"

# ---- the conversion gate (CPU, ~1 min; training/sketch/convert_check.py, CONVERT_FIX.md): for every trained folder (the base folders of DATA
# and each EXTRA_DIRS folder) and for short3 / fresh2, the share of the requests whose world row (this world table, these switches) reproduces
# the gold through the browser adapter, the share turned into "every shape" and the share in no world. It stops the job when a trained folder
# turns more than 1% of its requests into "every shape" (2026-11-03 with these switches: 0.0% everywhere; 070 as first drafted: synth_rules 4.1%).
python3 training/sketch/convert_check.py --groups "$W_GROUPS" --worlds-tsv "$R/worlds.tsv" --tests --gate 1.0 --json "$R/convert_check.json" > "$R/convert_check.log" 2>&1; rc=$?
grep -E "^\||^GATE|^gate" "$R/convert_check.log" | tee -a "$TL"
[ "$rc" = 0 ] || fail "convert_check (exit $rc, $R/convert_check.log): a trained folder turns more than 1% of its requests into every shape, or the check failed"

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

# ---- 3. registry_ALL.json (paths relative to docs/model/), from GROUPS_8.json and the world table
python3 - <<PY || fail "registry"
import json
P = "arms/$ARM/"; g = json.load(open("training/sketch/$W_GROUPS"))
folder = {l.split("\t")[0]: l.split("\t")[1] for l in open("$R/worlds.tsv") if l.strip()}
reg = {"about": "Arm VSS-$ARM of TRAIN_PLAN_1103.md: the VSS chain (9 worlds of worlds_micro/GROUPS_8ops.json with LEGEND_EXT=1 VAL_PICK=specific DIAGRAM_OPS=1 (CONVERT_FIX.md): the 7 shipped worlds, reverse in links, group / ungroup in manage, members / groupOf in questions, the new worlds layout and help; cutter_worlds8s, cutter_events8 with the event hint H1, the context filler) retrained on base + EXTRA_DIRS = $EXTRA_DIRS (all learned parts).",
       "router": "cutter", "cutter": P + "cutter_worlds8s.json", "context": P + "context/weights.json", "event_cutter": P + "cutter_events8.json", "event_hint": "H1",
       "EXTRA_DIRS": "$EXTRA_DIRS", "LEGEND_EXT": 1, "VAL_PICK": "specific", "DIAGRAM_OPS": 1, "grouping": "$W_GROUPS",
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
EOF
mkdir -p "$R/smoke" && cp "$R/smoke.jsonl" "$R/smoke/batch_01.jsonl"
REGISTRY="$A/registry_$ARM.json" CONTEXT="$A/context/weights.json" node training/sketch/fresh2/collect_vss.mjs "$R/smoke_records.jsonl" smoke "$R/smoke" 2>&1 | tail -2 | tee -a "$TL"
stamp "done"; du -sh "$A" "$R"
git status --short docs/model/micro docs/model/context docs/model/neural | head   # must show nothing
