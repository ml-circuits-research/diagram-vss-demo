# Fine-tune SOP-BERT again on ALL the data (owner, 2026-11-02 18:07: "do not cut data"): exactly the messages the shipped VSS chain trains on
# (7640 messages: the 9 training folders + llm_bench/{sonnet,haiku}_spans), no sample removed, no held-out, fixed 8 epochs (the best epoch of
# job 031, which was its last), same hyper-parameters and seed (lr 6e-5, batch 32, fp16, seed 0). Exports q8 ONNX to a NEW folder
# (results/041_sopbert_all/sop-bert-all), never touching docs/model/neural/sop-bert, then checks node (docs/js/neural.js makeReader) vs torch.
# Details: training/neural/ALL_DATA.md. Expected time: about 12 min of training (job 031: 53 s/epoch on 15683 rows; here 25702 rows, 1.64x
# -> ~87 s/epoch, 8 epochs ~ 12 min) + about 5 min for make_roles, export, quantization and the node check; 20-25 min in all, 3-4 GB of GPU
# memory at most (job 031 fitted the 4 GB card; batch 32 plus 8 whole messages per step are unchanged).
# PATHS: results/041_sopbert_all/sop-bert-all results/041_sopbert_all/make_roles.log results/041_sopbert_all/finetune.log
set -euo pipefail
export PATH="$HOME/vss-box/venv/bin:$PATH" OMP_NUM_THREADS=8 MKL_NUM_THREADS=8 HF_HOME="$HOME/vss-box/ft/hf" TOKENIZERS_PARALLELISM=false
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  if [ ! -x "$HOME/vss-box/node/bin/node" ]; then
    mkdir -p "$HOME/vss-box/node"; curl -fsSL https://nodejs.org/dist/v22.11.0/node-v22.11.0-linux-x64.tar.xz | tar -xJ -C "$HOME/vss-box/node" --strip-components=1
  fi
  export PATH="$HOME/vss-box/node/bin:$PATH"
fi
(cd training/laptop && npm install --no-audit --no-fund >/dev/null)
mkdir -p "$HOME/vss-box/ft"
uv pip install --python "$HOME/vss-box/venv/bin/python3" -r training/neural/requirements.txt
python3 -c "import torch; print('torch', torch.__version__, 'cuda', torch.cuda.is_available())"
R=results/041_sopbert_all; mkdir -p "$R"
# rows: make_data.py --all is the count/check step (messages and requests); make_roles.py --all makes the rows finetune_roles.py reads
python3 training/neural/make_data.py --all --out "$HOME/vss-box/ft/data_all" 2>&1 | tee "$R/make_roles.log" | head -5
python3 training/neural/make_roles.py --all --out "$HOME/vss-box/ft/roles_all" >> "$R/make_roles.log" 2>&1
head -4 "$R/make_roles.log" | cut -c1-300
# no held-out -> finetune_roles.py trains 8 epochs and keeps the last; --out is the NEW folder; the node check runs inside (train rows)
python3 training/neural/finetune_roles.py --base distilbert-base-uncased --name sop-bert-all --data "$HOME/vss-box/ft/roles_all" \
  --work "$HOME/vss-box/ft/sop-bert-all" --out "$R/sop-bert-all" --lr 6e-5 --bs 32 --epochs 8 --patience 2 2>&1 | grep -v Warning | tee "$R/finetune.log"
find "$R/sop-bert-all" -type f | sort | xargs ls -la
# the node parity check again, on its own, as the last word (torch refs are written by the run above)
node training/neural/check_roles_node.mjs "$(cd "$R" && pwd)" sop-bert-all "$HOME/vss-box/ft/sop-bert-all/torch_ref.jsonl" "$HOME/vss-box/ft/sop-bert-all/torch_cut_ref.jsonl" 2>&1 | tail -5 | tee -a "$R/finetune.log"
cat "$R/sop-bert-all/README.md"
git status --short docs/model/neural | head   # must show nothing: docs/model/neural/sop-bert is untouched
