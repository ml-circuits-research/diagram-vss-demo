#!/usr/bin/env bash
# train_micro.sh: one micro-world of the composer (docs/js/vss-composer.js): built from the rows of its events only, with a legend that
# lists only its events (msg_to_world.py WORLD_EVENTS, research/hier/HIER.md trap 1), trained, and exported (sparse) with its front end
# to docs/model/micro/<world>/. It does not touch worlds/real, docs/model/real or llm_train/REAL_WORLD.md.
# Usage: training/sketch/train_micro.sh <world> <event,event,...>
#   e.g. training/sketch/train_micro.sh history undo,redo,forget
# Settings (environment; the defaults are the fallback kinds_p80_s0's build switches, on all the data of msg_to_world.py):
#   DATA=all FRAC=1.0 QCOLOR=1 MARKER=0 KINDMAP=diagnosis_kinds/kinds_comb1.json CAL_FALLBACK=train D=1024 EPOCHS=10 SEED=0
#   ROW_SHAPE=single|lists|chain (connect only: rows of one construction, msg_to_world.py shape_is).
#   FRONT_ROWS=world: the world's front.json (value n-grams and trigger rules) learned only from the world's own rows (msg_to_world.py
#   FRONT_ROWS; ROUTER_V2.md); unset = learned from all messages, as before. Recorded in BUILD.json.
#   N_EVAL=600 EVAL_MODES=all: the trainer's own evaluation after training (metrics.json only; it does not change the model, and our
#   decisions use llm_score.mjs). N_EVAL=150 EVAL_MODES=primary cuts hours from big worlds (connect: ~3 h of it). Recorded in BUILD.json.
#   HOLDOUT=<word,...>: experiments only (msg_to_world.py): the messages with these words are left out. Recorded in BUILD.json.
#   CREATE_COLOR=role: the colour of a new shape fills the event role `color` (llm_to_world.py; default: the shape word's attribute).
#   Recorded in BUILD.json.
#   N_CAL=<n>: training rows sampled to fit the presence thresholds (sop train --n_cal, default 400; BETWEEN.md: 100000 = all rows). Recorded in BUILD.json.
#   VAL_PREC=event: the front's value n-grams count a value's precision only over requests of events that carry that value's kind
#   (front.py learn_values; ROUND2.md fix 4: "three" -> 3 instead of "add three" -> 3). Default: over every request. Recorded in BUILD.json.
#   VAL_SUB=value: a longer value n-gram is blocked only by a sub-n-gram that explains it (front.py learn_values; ROUND2.md fix 3:
#   "bottom left" -> bottom_left although "left" -> left_of). Default: any kept sub-n-gram blocks it. Recorded in BUILD.json.
#   VAL_PICK=specific: a value n-gram stands for the most specific of the values that pass the bars, not the most frequent one (front.py
#   learn_values; VSS_SYNTH_DIAGNOSIS.md: "circles" -> circles, not the quantifier all). Recorded in BUILD.json only when set.
#   SHORT=1: the data also read llm_train/{sonnet,haiku}_short (front.py train_dirs). OPS=1: also llm_train/ops_groups, ops_positions
#   (DIAGRAM_OPS.md section 7). DIAGRAM_OPS=1: groups and double positions in the conversion and the legend (llm_to_world.py; events
#   group, ungroup, members, groupOf; roles relation2, landmark3). All three recorded in BUILD.json.
#   LEGEND_EXT=1: the forms of 2026-11-02 as legend events / roles / values (generate.py, front.py, llm_to_world.py; worlds of
#   worlds_micro/GROUPS_8.json; TRAIN_PLAN_1103.md). Recorded in BUILD.json only when set (an unset switch leaves BUILD.json as before).
#   DRY=1: build the world's data only (msg_to_world.py + sop check, full report), then stop: no training, docs/model untouched.
#   DEVICE=cpu: the torch device of sop train (cuda on a machine with an NVIDIA card: training/laptop/README.md). Recorded in BUILD.json.
#   KINDMAP= (empty) -> the own-kind rule "seen >= --freq times". SOP_PYTHON: the Python with torch (sop train).
# Then register it: add {"world": "<world>", "events": [<events>], "model": "micro/<world>"} to docs/model/micro/registry.json "worlds".
set -euo pipefail
[ $# -eq 2 ] || { echo "usage: $0 <world> <event,event,...>" >&2; exit 2; }
WORLD="$1"; EVENTS="$2"
[[ "$WORLD" =~ ^[a-z0-9_]+$ ]] || { echo "world id: lowercase letters, digits, _" >&2; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"; SOP="$REPO/training/vss/tool/bin/sop"
W="$HERE/worlds_micro/$WORLD"; OUT="$REPO/docs/model/micro/$WORLD"
cd "$HERE"; export VSA_MIN_AVAILABLE_GB="${VSA_MIN_AVAILABLE_GB:-1.5}"
export DATA="${DATA:-all}" QCOLOR="${QCOLOR:-1}" MARKER="${MARKER:-0}" CAL_FALLBACK="${CAL_FALLBACK:-train}" WORLD_EVENTS="$EVENTS" FRONT_ROWS="${FRONT_ROWS:-}"
export EXTRA_DIRS="${EXTRA_DIRS:-}"   # extra annotated folders for every learned part (front.py extra_dirs; FEEDBACK_PLAN.md arms); recorded in BUILD.json
export VAL_PREC="${VAL_PREC:-}" VAL_SUB="${VAL_SUB:-}" SHORT="${SHORT:-}" OPS="${OPS:-}" DIAGRAM_OPS="${DIAGRAM_OPS:-}"
export VAL_PICK="${VAL_PICK:-}"   # VAL_PICK=specific: front.py learn_values picks the most specific value (VSS_SYNTH_DIAGNOSIS.md); recorded in BUILD.json when set
export LEGEND_EXT="${LEGEND_EXT:-}"   # LEGEND_EXT=1: the forms of 2026-11-02 (help, layout ops, reverse, templates, free text, arrows; generate.py, TRAIN_PLAN_1103.md); recorded in BUILD.json
# round 2 (TRAIN_PLAN_R2.md), each recorded in BUILD.json only when set (an unset switch leaves BUILD.json and the build as before):
#   FRONT_NEG=1|<grouping.json>: the world's value n-grams and trigger rules also lose precision on the OTHER worlds' requests (front.py);
#   VAL_GUARD=1|mask|keep: a value n-gram never takes in its trigger; a trigger rule keeps a value token only when it is gold (front.py);
#   NEW_DISTINCT=1: several `$new` in one wire become distinct created names (llm_to_world.py; VSS_FROM_TO.md section 1).
export FRONT_NEG="${FRONT_NEG:-}" VAL_GUARD="${VAL_GUARD:-}" NEW_DISTINCT="${NEW_DISTINCT:-}"
KINDMAP="${KINDMAP-diagnosis_kinds/kinds_comb1.json}"; if [ -n "$KINDMAP" ]; then export KINDMAP; else unset KINDMAP; fi
FRAC="${FRAC:-1.0}"; D="${D:-1024}"; EPOCHS="${EPOCHS:-10}"; SEED="${SEED:-0}"
if [ "${DRY:-0}" = "1" ]; then
  python3 msg_to_world.py --frac "$FRAC" --out "$W"
  "$SOP" check --legend "$W/legend.json" "$W"/examples/*.sop | tail -1
  echo "DRY=1: data of $WORLD built in $W ($(grep -c . "$W/raw/sentences.txt") rows); not trained"; exit 0
fi
python3 msg_to_world.py --frac "$FRAC" --out "$W" | sed -n 1,7p
"$SOP" check --legend "$W/legend.json" "$W"/examples/*.sop | tail -1
RUN="micro_${WORLD}_D${D}_e${EPOCHS}_s${SEED}"; mkdir -p runs; rm -rf "runs/$RUN"
N_EVAL="${N_EVAL:-600}"; EVAL_MODES="${EVAL_MODES:-all}"; DEVICE="${DEVICE:-cpu}"
"$SOP" train "$W" --D "$D" --seed "$SEED" --seeds 1 --epochs "$EPOCHS" --shuffle --device "$DEVICE" --candidate_sets catalog --n_eval "$N_EVAL" --eval_modes "$EVAL_MODES" ${N_CAL:+--n_cal "$N_CAL"} --no_ckpt \
  --star_version 2 --threshold_rule fit --calibrate_on_heldout_formulations --run_dir "$HERE/runs/$RUN" > "runs/$RUN.log" 2>&1
rm -rf "$OUT"
"$SOP" export-web --model "$W/model" --out "$OUT" --bits 8 --sparse --stars generated > /dev/null   # stars generated in the browser (SHRINK.md)
cp "$W/front.json" "$OUT/front.json"
cat > "$OUT/BUILD.json" <<JSON
{"world": "$WORLD", "events": "$EVENTS", "command": "training/sketch/train_micro.sh $WORLD $EVENTS", "DATA": "$DATA", "FRAC": "$FRAC", "QCOLOR": "$QCOLOR",
 "MARKER": "$MARKER", "ROW_SHAPE": "${ROW_SHAPE:-}", "FRONT_ROWS": "$FRONT_ROWS", "KINDMAP": "${KINDMAP:-}", "CAL_FALLBACK": "$CAL_FALLBACK", "D": $D, "EPOCHS": $EPOCHS, "SEED": $SEED, "N_EVAL": $N_EVAL, "EVAL_MODES": "$EVAL_MODES", "DEVICE": "$DEVICE", "HOLDOUT": "${HOLDOUT:-}", "CREATE_COLOR": "${CREATE_COLOR:-}", "N_CAL": "${N_CAL:-}", "VAL_PREC": "$VAL_PREC", "VAL_SUB": "$VAL_SUB", "SHORT": "$SHORT", "OPS": "$OPS", "DIAGRAM_OPS": "$DIAGRAM_OPS",${LEGEND_EXT:+ \"LEGEND_EXT\": \"$LEGEND_EXT\",}${VAL_PICK:+ \"VAL_PICK\": \"$VAL_PICK\",}${FRONT_NEG:+ \"FRONT_NEG\": \"$FRONT_NEG\",}${VAL_GUARD:+ \"VAL_GUARD\": \"$VAL_GUARD\",}${NEW_DISTINCT:+ \"NEW_DISTINCT\": \"$NEW_DISTINCT\",} "EXTRA_DIRS": "$EXTRA_DIRS", "rows": $(grep -c . "$W/raw/sentences.txt"),
 "run_log": "training/sketch/runs/$RUN.log"}
JSON
echo "world $WORLD [$EVENTS] -> docs/model/micro/$WORLD ($(grep -c . "$W/raw/sentences.txt") rows); registry line:"
python3 -c "import json,sys; print(json.dumps({'world': sys.argv[1], 'events': sys.argv[2].split(','), 'model': 'micro/' + sys.argv[1]}))" "$WORLD" "$EVENTS"
