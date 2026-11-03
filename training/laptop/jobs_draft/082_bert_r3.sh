# PATHS: docs/model/arms/R3/neural results/082_bert_r3
# TRAIN_PLAN_R3.md section A, arm R3, SOP-BERT: fine-tuned as job 071 (arm ALL, the shipped SOP-BERT: make_data / make_roles --all, 8 epochs,
# lr 6e-5, batch 32, fp16, seed 0) on arm ALL's 12 EXTRA_DIRS folders + the round-3 data (P1 of scenes_r3/ROOT_CAUSES.md section 6):
# llm_train/scenes_r3 (16 scenes, 714 requests), llm_train/scenes_r3b (4 scenes, 94 requests), llm_train/opus_r3_gaps (the forms of the
# owner's session 1, 147 requests). With them the layout (built from the data: a key gets a head only if the data has it) gains the span heads
# width / height, the fill values faint / none, distance on create, and layer / label in a description (TRAIN_PLAN_R3.md A.5). The VSS
# switches of job 081 (NEW_DISTINCT, GAP_ROLE) are VSS-only: SOP-BERT reads the gold wires directly (make_roles.py).
# The model goes to docs/model/arms/R3/neural/sop-bert-R3, never to docs/model/neural/sop-bert. The measurement is job 083.
# Gates (as 071): the new acts / heads are in the rows (+ the round-3 heads: width, height, fill faint / none, distance for create, layer /
# label descriptions); roles_roundtrip.py builds the same rows (--compare-rows: byte-identical) and decodes their gold labels with
# docs/js/neural.js; the job stops if a trained folder round-trips below 95% or has more than 1% silent wrong labels. scenes_test and
# collected_1 are labelled with the same layout and reported (ALSO_DIRS), never trained on.
# GATES_ONLY=1 (dry checks on any machine): stops after the gates, trains nothing (the runner never sets it).
# GPU: as 071, every slot of $HOME/vss-box/state/gpu (waits until no world of job 081 trains). Time: 55.5k request rows (071: 54.6k), ~190 s
# per epoch: ~30-35 min + the wait for the slots.
set -uo pipefail
ARM=R3; JOB=082_bert_r3
EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_gen_1 llm_train/opus_gen_2 llm_train/synth_rules llm_train/synth_rules_ops llm_train/synth_rules_ext llm_train/ops_formulations llm_train/opus_ext_1 llm_train/synth_combo llm_train/scenes_r3 llm_train/scenes_r3b llm_train/opus_r3_gaps"
export EXTRA_DIRS
# PREP_SWITCHES: the round-3 preprocessing switches approved by the owner for SOP-BERT's rows (P6 number words in make_roles.py alignment, ...;
# TRAIN_PLAN_R3.md A.1), NAME=VALUE words filled in by the coordinator once measured; exported for make_data / make_roles / roles_roundtrip
# (the same rows are rebuilt by the round trip). Empty: arm R3 as dry-run on 2026-11-03.
PREP_SWITCHES=${PREP_SWITCHES-""}
for kv in $PREP_SWITCHES; do export "$kv"; done
export PATH="$HOME/vss-box/venv/bin:$PATH" OMP_NUM_THREADS=8 MKL_NUM_THREADS=8 HF_HOME="$HOME/vss-box/ft/hf" TOKENIZERS_PARALLELISM=false
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  if [ ! -x "$HOME/vss-box/node/bin/node" ]; then
    mkdir -p "$HOME/vss-box/node"; curl -fsSL https://nodejs.org/dist/v22.11.0/node-v22.11.0-linux-x64.tar.xz | tar -xJ -C "$HOME/vss-box/node" --strip-components=1
  fi
  export PATH="$HOME/vss-box/node/bin:$PATH"
fi
R=results/$JOB; FT=$HOME/vss-box/ft; LOCK=$HOME/vss-box/state/gpu; SLOTS=3; OUT=docs/model/arms/$ARM/neural
mkdir -p "$R" "$FT" "$LOCK" "$OUT"
TL=$R/timings.txt; T0=$(date +%s)
stamp() { echo "[$(date +%T) +$(( $(date +%s) - T0 ))s] $*" | tee -a "$TL"; }
fail() { stamp "FAILED: $*"; exit 1; }
stamp "arm BERT-$ARM, EXTRA_DIRS=$EXTRA_DIRS, PREP_SWITCHES=$PREP_SWITCHES"; free -g | tee -a "$TL"
( cd training/sketch && python3 -c "import front; d = front.extra_dirs(); print(len(d), 'extra folders:', d)" ) || fail "EXTRA_DIRS folders are missing or not annotated"
grep -q "help: \['The user asks how the editor works" docs/js/neural.js || fail "docs/js/neural.js has no help act (the TRAIN_PLAN_1103 code is missing)"
(cd training/laptop && npm install --no-audit --no-fund >/dev/null)
if [ "${GATES_ONLY:-0}" != 1 ]; then
  uv pip install --python "$HOME/vss-box/venv/bin/python3" -r training/neural/requirements.txt
  python3 -c "import torch; print('torch', torch.__version__, 'cuda', torch.cuda.is_available())"
fi

# ---- rows (CPU): make_data.py --all is the count/check step, make_roles.py --all makes the rows finetune_roles.py reads
python3 training/neural/make_data.py --all --out "$FT/data_all_$ARM" > "$R/make_data.log" 2>&1 || fail "make_data"
head -3 "$R/make_data.log"
python3 training/neural/make_roles.py --all --out "$FT/roles_all_$ARM" > "$R/make_roles.log" 2>&1 || fail "make_roles"
grep -E "^rows|^class keys|^span keys" "$R/make_roles.log" | cut -c1-400 | tee -a "$TL"
python3 - "$FT/roles_all_$ARM/reader.json" <<'PY' | tee -a "$TL" || fail "the new acts / heads are not in the rows"
import json, sys
R = json.load(open(sys.argv[1])); keys = {k for k, _ in R["classes"]}; C = dict(R["classes"])
need_acts = {"help", "improve", "respace", "snap", "fit", "flip", "sort", "groupBy", "equalize", "straighten", "untangle", "reverse"}
need_keys = {"template", "topic", "aspect", "scheme", "kind", "quantifier", "property", "position2", "region", "fill:anchor2"}
miss = (need_acts - set(R["acts"])) | (need_keys - keys) | ({"items", "title", "at", "anchor2", "width", "height", "distance"} - set(R["span_keys"])) | (set() if R.get("desc2_keys") else {"desc2_keys"})
# round 3 (TRAIN_PLAN_R3.md A.5): the heads the scenes and the session-1 data bring
miss |= {f"fill={v}" for v in ("faint", "none") if v not in (C.get("fill") or [])} | {f"create:{k}" for k in ("width", "height", "distance") if k not in R["act_keys"].get("create", [])}
miss |= {f"desc:{k}" for k in ("layer", "label") if k not in R["desc_keys"]}
print(f"acts {len(R['acts'])}, class keys {len(keys)}, span keys {R['span_keys']}, fill {C.get('fill')}, desc {R['desc_keys']}; missing: {sorted(miss) or 'none'}")
sys.exit(1 if miss else 0)
PY
# the oracle round trip of the rows (ROLES_ROUNDTRIP.md): gold labels -> docs/js/neural.js decoding -> gold? (CPU, ~2-4 min); scenes_test and
# collected_1 are labelled with this layout and reported only (the label ceiling of this layout on them)
ALSO_DIRS="llm_bench/scenes_test llm_bench/collected_1" python3 training/neural/roles_roundtrip.py --work "$FT/roles_roundtrip_$ARM" --compare-rows "$FT/roles_all_$ARM" --gate 95 1 > "$R/roles_roundtrip.log" 2>&1
rc=$?; grep -E "^\| (ALL|llm_train/(synth|scenes|opus_r3)|llm_bench)|gate|GATE|FAILED|  llm" "$R/roles_roundtrip.log" | cut -c1-300 | tee -a "$TL"
[ "$rc" = 0 ] || fail "roles round trip (see $R/roles_roundtrip.log): a trained folder's gold does not come back from its labels"
stamp "rows done"
if [ "${GATES_ONLY:-0}" = 1 ]; then stamp "GATES_ONLY=1: gates passed, nothing trained"; exit 0; fi

# ---- the fine-tuning, alone on the card
for i in $(seq 0 $((SLOTS - 1))); do exec {fd}>"$LOCK/slot.$i"; flock "$fd"; done     # blocks until every world slot is free; kept until this script ends
stamp "GPU is ours"
python3 training/neural/finetune_roles.py --base distilbert-base-uncased --name "sop-bert-$ARM" --data "$FT/roles_all_$ARM" \
  --work "$FT/sop-bert-$ARM" --out "$OUT/sop-bert-$ARM" --lr 6e-5 --bs 32 --epochs 8 --patience 2 2>&1 | grep -v Warning | tee "$R/finetune.log"
rc=${PIPESTATUS[0]}
stamp "fine-tuning exit $rc"
[ "$rc" = 0 ] && [ -f "$OUT/sop-bert-$ARM/config.json" ] || fail "finetune_roles (see $R/finetune.log)"
node training/neural/check_roles_node.mjs "$(cd "$OUT" && pwd)" "sop-bert-$ARM" "$FT/sop-bert-$ARM/torch_ref.jsonl" "$FT/sop-bert-$ARM/torch_cut_ref.jsonl" 2>&1 | tail -5 | tee -a "$R/finetune.log"
printf 'arm BERT-%s (TRAIN_PLAN_R3.md)\nEXTRA_DIRS=%s\nPREP_SWITCHES='"$PREP_SWITCHES"'\nmake_data.py --all / make_roles.py --all with this EXTRA_DIRS; finetune_roles.py --epochs 8 --lr 6e-5 --bs 32 (job 041/062/071 recipe)\n' "$ARM" "$EXTRA_DIRS" > "$OUT/sop-bert-$ARM/DATA.txt"
find "$OUT/sop-bert-$ARM" -type f | sort | xargs ls -la
stamp "done"; du -sh "$OUT" "$R"
git status --short docs/model/neural | head   # must show nothing: docs/model/neural/sop-bert is untouched
