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
KINDMAP="${KINDMAP-diagnosis_kinds/kinds_comb1.json}"; if [ -n "$KINDMAP" ]; then export KINDMAP; else unset KINDMAP; fi
FRAC="${FRAC:-1.0}"; D="${D:-1024}"; EPOCHS="${EPOCHS:-10}"; SEED="${SEED:-0}"
python3 msg_to_world.py --frac "$FRAC" --out "$W" | sed -n 1,7p
"$SOP" check --legend "$W/legend.json" "$W"/examples/*.sop | tail -1
RUN="micro_${WORLD}_D${D}_e${EPOCHS}_s${SEED}"; mkdir -p runs; rm -rf "runs/$RUN"
N_EVAL="${N_EVAL:-600}"; EVAL_MODES="${EVAL_MODES:-all}"
"$SOP" train "$W" --D "$D" --seed "$SEED" --seeds 1 --epochs "$EPOCHS" --shuffle --device cpu --candidate_sets catalog --n_eval "$N_EVAL" --eval_modes "$EVAL_MODES" --no_ckpt \
  --star_version 2 --threshold_rule fit --calibrate_on_heldout_formulations --run_dir "$HERE/runs/$RUN" > "runs/$RUN.log" 2>&1
rm -rf "$OUT"
"$SOP" export-web --model "$W/model" --out "$OUT" --bits 8 --sparse > /dev/null
cp "$W/front.json" "$OUT/front.json"
cat > "$OUT/BUILD.json" <<JSON
{"world": "$WORLD", "events": "$EVENTS", "command": "training/sketch/train_micro.sh $WORLD $EVENTS", "DATA": "$DATA", "FRAC": "$FRAC", "QCOLOR": "$QCOLOR",
 "MARKER": "$MARKER", "ROW_SHAPE": "${ROW_SHAPE:-}", "FRONT_ROWS": "$FRONT_ROWS", "KINDMAP": "${KINDMAP:-}", "CAL_FALLBACK": "$CAL_FALLBACK", "D": $D, "EPOCHS": $EPOCHS, "SEED": $SEED, "N_EVAL": $N_EVAL, "EVAL_MODES": "$EVAL_MODES", "rows": $(grep -c . "$W/raw/sentences.txt"),
 "run_log": "training/sketch/runs/$RUN.log"}
JSON
echo "world $WORLD [$EVENTS] -> docs/model/micro/$WORLD ($(grep -c . "$W/raw/sentences.txt") rows); registry line:"
python3 -c "import json,sys; print(json.dumps({'world': sys.argv[1], 'events': sys.argv[2].split(','), 'model': 'micro/' + sys.argv[1]}))" "$WORLD" "$EVENTS"
