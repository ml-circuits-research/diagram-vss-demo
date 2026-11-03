# PATHS: docs/model/arms/R2/neural results/074_bert_round2
# TRAIN_PLAN_R2.md, arm R2, SOP-BERT: fine-tuned as job 071 (arm ALL, the shipped SOP-BERT since 220295a: make_data / make_roles --all, 8 epochs,
# lr 6e-5, batch 32, fp16, seed 0) on the round-2 data: the same EXTRA_DIRS as job 073, i.e. synth_rules, synth_rules_ops, synth_rules_ext,
# synth_combo replaced by their frame-deduplicated copies *_dd (data_repetition.py --keep 2: 1683 of 14058 messages dropped, each a copy of
# kept ones up to names / numbers / quoted texts), plus synth_short_r2 (1997 synthetic short commands of the 2026-11-02 forms the data lacked:
# undo / redo counts, outline set / create / question, a size in a description, how many arrows, arrows by their ends, every arrow, templates,
# free text, layout operations, at x,y; 1374 wrapped in narration; every one read exactly by the Rules) and opus_short_r2 (255 realistic short
# messages by an Opus writer: verbless commands, chained commands and gapping, self-corrections, narration, the new forms the Rules do not
# read). The VSS switches of job 073 (NEW_DISTINCT ...) are VSS-only: SOP-BERT reads the gold wires directly.
# The model goes to docs/model/arms/R2/neural/sop-bert-R2, never to docs/model/neural/sop-bert. The measurement is job 075.
# Gate (as 071): roles_roundtrip.py builds the same rows and decodes their gold labels with docs/js/neural.js; the job stops if a trained folder
# round-trips below 95% or has more than 1% silent wrong labels (2026-11-03 with this data: every trained folder passes; ALL trained 95.4%
# right, 99.5% right or reference only, 0.1% silent wrong labels; synth_short_r2 96.0% + 4.0% asked (label=""), opus_short_r2 94.2% right,
# 99.7% right or reference only).
# GPU: as 071, every slot of $HOME/vss-box/state/gpu. Time: rows ~55.0k requests (071: 54.6k), ~190 s per epoch: ~30 min + the wait.
set -uo pipefail
ARM=R2; JOB=074_bert_round2
EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_gen_1 llm_train/opus_gen_2 llm_train/synth_rules_dd llm_train/synth_rules_ops_dd llm_train/synth_rules_ext_dd llm_train/ops_formulations llm_train/opus_ext_1 llm_train/synth_combo_dd llm_train/synth_short_r2 llm_train/opus_short_r2"
export EXTRA_DIRS
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
stamp "arm BERT-$ARM, EXTRA_DIRS=$EXTRA_DIRS"; free -g | tee -a "$TL"
( cd training/sketch && python3 -c "import front; d = front.extra_dirs(); print(len(d), 'extra folders:', d)" ) || fail "EXTRA_DIRS folders are missing or not annotated"
grep -q "help: \['The user asks how the editor works" docs/js/neural.js || fail "docs/js/neural.js has no help act (the TRAIN_PLAN_1103 code is missing)"
(cd training/laptop && npm install --no-audit --no-fund >/dev/null)
uv pip install --python "$HOME/vss-box/venv/bin/python3" -r training/neural/requirements.txt
python3 -c "import torch; print('torch', torch.__version__, 'cuda', torch.cuda.is_available())"

# ---- rows (CPU): make_data.py --all is the count/check step, make_roles.py --all makes the rows finetune_roles.py reads
python3 training/neural/make_data.py --all --out "$FT/data_all_$ARM" > "$R/make_data.log" 2>&1 || fail "make_data"
head -3 "$R/make_data.log"
python3 training/neural/make_roles.py --all --out "$FT/roles_all_$ARM" > "$R/make_roles.log" 2>&1 || fail "make_roles"
grep -E "^rows|^class keys|^span keys" "$R/make_roles.log" | cut -c1-400 | tee -a "$TL"
python3 - "$FT/roles_all_$ARM/reader.json" <<'PY' | tee -a "$TL" || fail "the new acts / heads are not in the rows"
import json, sys
R = json.load(open(sys.argv[1])); keys = {k for k, _ in R["classes"]}
need_acts = {"help", "improve", "respace", "snap", "fit", "flip", "sort", "groupBy", "equalize", "straighten", "untangle", "reverse"}
need_keys = {"template", "topic", "aspect", "scheme", "kind", "quantifier", "property", "position2", "region", "fill:anchor2"}
miss = (need_acts - set(R["acts"])) | (need_keys - keys) | ({"items", "title", "at", "anchor2"} - set(R["span_keys"])) | (set() if R.get("desc2_keys") else {"desc2_keys"})
print(f"acts {len(R['acts'])}, class keys {len(keys)}, span keys {R['span_keys']}; missing: {sorted(miss) or 'none'}")
sys.exit(1 if miss else 0)
PY
# the oracle round trip of the rows (ROLES_ROUNDTRIP.md): gold labels -> docs/js/neural.js decoding -> gold? (CPU, ~1 min)
python3 training/neural/roles_roundtrip.py --work "$FT/roles_roundtrip_$ARM" --compare-rows "$FT/roles_all_$ARM" --gate 95 1 > "$R/roles_roundtrip.log" 2>&1
rc=$?; grep -E "^\| (ALL|llm_train/synth)|gate|GATE|FAILED|  llm" "$R/roles_roundtrip.log" | cut -c1-300 | tee -a "$TL"
[ "$rc" = 0 ] || fail "roles round trip (see $R/roles_roundtrip.log): a trained folder's gold does not come back from its labels"
stamp "rows done"

# ---- the fine-tuning, alone on the card
for i in $(seq 0 $((SLOTS - 1))); do exec {fd}>"$LOCK/slot.$i"; flock "$fd"; done     # blocks until every world slot is free; kept until this script ends
stamp "GPU is ours"
python3 training/neural/finetune_roles.py --base distilbert-base-uncased --name "sop-bert-$ARM" --data "$FT/roles_all_$ARM" \
  --work "$FT/sop-bert-$ARM" --out "$OUT/sop-bert-$ARM" --lr 6e-5 --bs 32 --epochs 8 --patience 2 2>&1 | grep -v Warning | tee "$R/finetune.log"
rc=${PIPESTATUS[0]}
stamp "fine-tuning exit $rc"
[ "$rc" = 0 ] && [ -f "$OUT/sop-bert-$ARM/config.json" ] || fail "finetune_roles (see $R/finetune.log)"
node training/neural/check_roles_node.mjs "$(cd "$OUT" && pwd)" "sop-bert-$ARM" "$FT/sop-bert-$ARM/torch_ref.jsonl" "$FT/sop-bert-$ARM/torch_cut_ref.jsonl" 2>&1 | tail -5 | tee -a "$R/finetune.log"
printf 'arm BERT-%s (TRAIN_PLAN_R2.md)\nEXTRA_DIRS=%s\nmake_data.py --all / make_roles.py --all with this EXTRA_DIRS; finetune_roles.py --epochs 8 --lr 6e-5 --bs 32 (job 041/062 recipe)\n' "$ARM" "$EXTRA_DIRS" > "$OUT/sop-bert-$ARM/DATA.txt"
find "$OUT/sop-bert-$ARM" -type f | sort | xargs ls -la
stamp "done"; du -sh "$OUT" "$R"
git status --short docs/model/neural | head   # must show nothing: docs/model/neural/sop-bert is untouched
