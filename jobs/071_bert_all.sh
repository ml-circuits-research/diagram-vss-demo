# PATHS: docs/model/arms/ALL/neural results/071_bert_all
# TRAIN_PLAN_1103.md, arm ALL, SOP-BERT: fine-tuned on ALL the data of job 062 (make_data/make_roles --all, 8 epochs, lr 6e-5, batch 32, fp16, seed 0)
# + every synthetic and new realistic folder (EXTRA_DIRS below), so that it reads the forms of 2026-11-02. The act set and the heads follow the
# legend and docs/js/neural.js: acts 52 (+ improve, respace, snap, fit, flip, sort, groupBy, equalize, straighten, untangle, reverse, group, ungroup;
# questions + help, members, groupOf), class heads for template (24), topic (the topics in the training gold: 109), aspect, scheme, fill, layer,
# kind, quantifier, property, direction, layout ..., span heads for items / items2 / parents (one span per item, make_roles.py SPAN_KINDS
# "texts"), title, about, width / height. Same recipe as job 062; the model goes to docs/model/arms/ALL/neural/sop-bert-ALL, never to
# docs/model/neural/sop-bert. The measurement is job 072.
# The conversion switches of job 070 (LEGEND_EXT, VAL_PICK, DIAGRAM_OPS; training/sketch/synth/CONVERT_FIX.md) and its convert_check gate are
# VSS-only: SOP-BERT reads the gold wires directly (make_roles.py, its acts and keys follow the legend), so it keeps the same EXTRA_DIRS as
# job 070, synth_rules_ops included.
# 2026-11-03 (training/neural/ROLES_ROUNDTRIP.md): the rows are checked by an oracle round trip before the GPU is taken: roles_roundtrip.py
# builds the same rows (make_roles.py --all, this EXTRA_DIRS; --compare-rows: byte-identical train.jsonl / reader.json), gives their gold
# labels to docs/js/neural.js as a perfect prediction and compares the decoded wires with the gold (bench-canon). The job stops if a trained
# folder round-trips (right, left to the shared context rule, or refused by the engine) below 95%, or if more than 1% of its rows carry a
# silent wrong label. The pipeline fixes of that check are in the code this job runs (finetune_roles.py class_targets: arrow=none /
# outline=none are their own class; make_roles.py: list parts aligned in order and by case, a label with a comma is one text, numbers aligned
# after names, "50px"; at / position2 / anchor2 / region learned; desc2:<key> heads for a second described role).
# GPU: job 041/062 used 3-4 GB of the 3.73 GB card, so the fine-tuning takes EVERY slot of $HOME/vss-box/state/gpu (the VSS jobs take one per
# world): it waits until no world is training, and no world starts while it trains. make_roles (CPU) runs before it without the lock.
# Expected time (job 062: 31.7k request rows + 9.4k cut messages, 100 s per epoch on the RTX 3050 Ti): this data has 54.6k request rows + 24.7k
# cut messages (make_roles.py --all, 2026-11-03), so ~190 s per epoch, ~26 min for 8 epochs, + ~3 min export and node check; plus the wait for
# the GPU slots while job 070's worlds train.
set -uo pipefail
ARM=ALL; JOB=071_bert_all
EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_gen_1 llm_train/opus_gen_2 llm_train/synth_rules llm_train/synth_rules_ops llm_train/synth_rules_ext llm_train/ops_formulations llm_train/opus_ext_1 llm_train/synth_combo"
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
printf 'arm BERT-%s (TRAIN_PLAN_1103.md)\nEXTRA_DIRS=%s\nmake_data.py --all / make_roles.py --all with this EXTRA_DIRS; finetune_roles.py --epochs 8 --lr 6e-5 --bs 32 (job 041/062 recipe)\n' "$ARM" "$EXTRA_DIRS" > "$OUT/sop-bert-$ARM/DATA.txt"
find "$OUT/sop-bert-$ARM" -type f | sort | xargs ls -la
stamp "done"; du -sh "$OUT" "$R"
git status --short docs/model/neural | head   # must show nothing: docs/model/neural/sop-bert is untouched
