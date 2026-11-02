# AFTER: 062_arm_bert_G
# FEEDBACK_PLAN.md arm BERT-T: SOP-BERT fine-tuned on ALL the data of job 041 (make_data/make_roles --all, 8 epochs, lr 6e-5, batch 32, fp16, seed 0)
# + the arm's extra folders (EXTRA_DIRS below: base opus_train_{a,b,c,d} + T). Same recipe as job 041_sopbert_all; the model goes to
# results/064_arm_bert_T/sop-bert-T, never to docs/model/neural/sop-bert. Then the collector (SOP-BERT arm on its own cut, Rules) on fresh2 + the old held-out text and
# fit_report.mjs (calibration = fresh2 calibration part + old held-out text).
# GPU: job 041 used 3-4 GB of the 3.73 GB card, so the fine-tuning takes EVERY slot of $HOME/vss-box/state/gpu (the VSS arm jobs take one each per world): it waits
# until no world is training, and no world starts while it trains. make_roles (CPU) runs before it without the lock.
# PATHS: results/064_arm_bert_T
export CAL_OLDHELD=0 FAST=1 FAST_PROCS=4   # FEEDBACK_PLAN amendment 19:40; FAST=1: same model, faster (commit ee8d016)
set -uo pipefail
ARM=T; JOB=064_arm_bert_T
EXTRA_DIRS="llm_train/opus_train_a llm_train/opus_train_b llm_train/opus_train_c llm_train/opus_train_d llm_train/opus_tgt_1 llm_train/opus_tgt_2"
export EXTRA_DIRS
export PATH="$HOME/vss-box/venv/bin:$PATH" OMP_NUM_THREADS=8 MKL_NUM_THREADS=8 HF_HOME="$HOME/vss-box/ft/hf" TOKENIZERS_PARALLELISM=false
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  if [ ! -x "$HOME/vss-box/node/bin/node" ]; then
    mkdir -p "$HOME/vss-box/node"; curl -fsSL https://nodejs.org/dist/v22.11.0/node-v22.11.0-linux-x64.tar.xz | tar -xJ -C "$HOME/vss-box/node" --strip-components=1
  fi
  export PATH="$HOME/vss-box/node/bin:$PATH"
fi
R=results/$JOB; REC=$R/records; FT=$HOME/vss-box/ft; LOCK=$HOME/vss-box/state/gpu; SLOTS=3
mkdir -p "$R" "$REC" "$FT" "$LOCK"
TL=$R/timings.txt; T0=$(date +%s)
stamp() { echo "[$(date +%T) +$(( $(date +%s) - T0 ))s] $*" | tee -a "$TL"; }
fail() { stamp "FAILED: $*"; exit 1; }
stamp "arm BERT-$ARM, EXTRA_DIRS=$EXTRA_DIRS"; free -g | tee -a "$TL"
( cd training/sketch && python3 -c "import front; d = front.extra_dirs(); print(len(d), 'extra folders:', d)" ) || fail "EXTRA_DIRS folders are missing or not annotated"
(cd training/laptop && npm install --no-audit --no-fund >/dev/null)
uv pip install --python "$HOME/vss-box/venv/bin/python3" -r training/neural/requirements.txt
python3 -c "import torch; print('torch', torch.__version__, 'cuda', torch.cuda.is_available())"

# ---- rows (CPU): make_data.py --all is the count/check step, make_roles.py --all makes the rows finetune_roles.py reads
python3 training/neural/make_data.py --all --out "$FT/data_all_$ARM" 2>&1 | tee "$R/make_roles.log" | head -5
python3 training/neural/make_roles.py --all --out "$FT/roles_all_$ARM" >> "$R/make_roles.log" 2>&1 || fail "make_roles"
head -4 "$R/make_roles.log" | cut -c1-300; stamp "rows done"

# ---- the fine-tuning, alone on the card
for i in $(seq 0 $((SLOTS - 1))); do exec {fd}>"$LOCK/slot.$i"; flock "$fd"; done     # blocks until every world slot is free; kept until this script ends
stamp "GPU is ours"
python3 training/neural/finetune_roles.py --base distilbert-base-uncased --name "sop-bert-$ARM" --data "$FT/roles_all_$ARM" \
  --work "$FT/sop-bert-$ARM" --out "$R/sop-bert-$ARM" --lr 6e-5 --bs 32 --epochs 8 --patience 2 2>&1 | grep -v Warning | tee "$R/finetune.log"
rc=${PIPESTATUS[0]}
stamp "fine-tuning exit $rc"
[ "$rc" = 0 ] && [ -f "$R/sop-bert-$ARM/config.json" ] || fail "finetune_roles (see $R/finetune.log)"
node training/neural/check_roles_node.mjs "$(cd "$R" && pwd)" "sop-bert-$ARM" "$FT/sop-bert-$ARM/torch_ref.jsonl" "$FT/sop-bert-$ARM/torch_cut_ref.jsonl" 2>&1 | tail -5 | tee -a "$R/finetune.log"
printf 'arm BERT-%s\nEXTRA_DIRS=%s\nmake_data.py --all / make_roles.py --all with this EXTRA_DIRS; finetune_roles.py --epochs 8 --lr 6e-5 --bs 32 (job 041 recipe)\n' "$ARM" "$EXTRA_DIRS" > "$R/sop-bert-$ARM/DATA.txt"
find "$R/sop-bert-$ARM" -type f | sort | xargs ls -la
# the slots are released when this script ends; the collectors below are CPU only

# ---- collectors + fit_report on fresh2 (+ the old held-out text)
F2=training/sketch/llm_bench/fresh2; DATA="$F2/opus_a $F2/opus_b $F2/opus_c $F2/opus_d"
for d in $DATA; do [ -f "$d/batch_01.jsonl" ] || fail "$d is missing on this branch"; done
CALF=""
if [ "${CAL_OLDHELD:-1}" = 1 ]; then python3 training/sketch/fresh2/make_oldheld.py "$R/oldheld" | tee -a "$TL" && DATA="$DATA $R/oldheld" && CALF=oldheld; fi
F=training/sketch/fresh2
( MODEL="$R/sop-bert-$ARM" CUTS=own THREADS=6 node $F/collect_sop.mjs "$REC/sop_arm_%CUT%.jsonl" fresh2 $DATA > "$REC/log_sop_arm.txt" 2>&1 ) &
( CUTS=own node $F/collect_rules.mjs "$REC/rules_%CUT%.jsonl" fresh2 $DATA > "$REC/log_rules.txt" 2>&1 ) &
wait
tail -2 "$REC/log_sop_arm.txt" | cut -c1-250; stamp "collectors done"
ARM="BERT-$ARM" CAL_FOLDERS="$CALF" node $F/fit_report.mjs "$REC" "$R/report.md" $DATA > "$REC/log_fit_report.txt" 2>&1 || { tail -20 "$REC/log_fit_report.txt"; fail "fit_report"; }
stamp "report written: $R/report.md"; head -8 "$R/report.md" | cut -c1-300
du -sh "$R"
git status --short docs/model/neural | head   # must show nothing: docs/model/neural/sop-bert is untouched
