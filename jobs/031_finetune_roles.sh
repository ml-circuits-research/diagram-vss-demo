# Fine-tune the neural reader's joint model (one DistilBERT: act + class heads + role tags, one call per request) on our span-annotated requests and export q8 ONNX for transformers.js.
# AFTER: 028_links7r2
# PATHS: docs/model/neural/reader-distilbert
# training/neural/: make_roles.py -> finetune_roles.py (cuda, fp16) -> torch.onnx + q8 -> node check through docs/js/neural.js makeReader. Then training/laptop/neural_score.mjs
# scores it per request on the 100 sample messages (training/neural/sample100_ids.txt) next to the current pair act-distilbert + qa-distilbert-squad,
# and alone on the whole 1000-message sample. Checkpoints and caches stay in ~/vss-box/ft/.
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
python3 training/neural/make_roles.py --out "$HOME/vss-box/ft/roles"
python3 training/neural/finetune_roles.py --base distilbert-base-uncased --name reader-distilbert --data "$HOME/vss-box/ft/roles" --work "$HOME/vss-box/ft/reader-distilbert" --lr 6e-5 --bs 32 --epochs 8 --patience 2
find docs/model/neural/reader-distilbert -type f | sort | xargs ls -la
cat docs/model/neural/reader-distilbert/README.md
# per-request score (rules, VSS and the neural reader on the same messages; llm_score.mjs metric)
D=../sketch
cd training/laptop
echo "== the 100 sample messages: joint model reader-distilbert"
ZS=reader-distilbert IDS=../neural/sample100_ids.txt node neural_score.mjs $D/llm_bench/haiku_spans $D/llm_bench/sonnet_spans 2>&1 | grep -v "messages scored"
echo "== the 100 sample messages: current pair act-distilbert + qa-distilbert-squad"
ZS=act-distilbert IDS=../neural/sample100_ids.txt node neural_score.mjs $D/llm_bench/haiku_spans $D/llm_bench/sonnet_spans 2>&1 | grep -v "messages scored"
echo "== the whole 1000-message sample: joint model reader-distilbert"
ZS=reader-distilbert IDS=../neural/sample1000_ids.txt node neural_score.mjs $D/llm_train/sonnet_msg $D/llm_train/haiku_msg $D/llm_train/sonnet_msg2 $D/llm_train/haiku_msg2 $D/llm_train/sonnet_long \
  $D/llm_bench/fresh1/sonnet $D/llm_bench/fresh1/haiku $D/llm_train/sonnet_short $D/llm_train/haiku_short $D/llm_bench/sonnet_spans $D/llm_bench/haiku_spans 2>&1 | grep -v "messages scored" | sed -n '/^ALL/,$p'
