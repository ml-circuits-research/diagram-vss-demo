# Fine-tune the neural reader's act classifier (DistilBERT, DeBERTa-v3 xsmall) on our span-annotated requests and export q8 ONNX for transformers.js.
# PATHS: docs/model/neural/act-distilbert docs/model/neural/act-deberta-xsmall docs/model/neural/qa-distilbert-squad
# training/neural/: make_data.py -> finetune.py (cuda, fp16) -> optimum export + q8 -> node text-classification check. Checkpoints and caches stay in ~/vss-box/ft/.
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
python3 training/neural/make_data.py --out "$HOME/vss-box/ft/data"
python3 training/neural/finetune.py --base distilbert-base-uncased --name act-distilbert --data "$HOME/vss-box/ft/data" --work "$HOME/vss-box/ft/act-distilbert" --lr 6e-5 --bs 32 --epochs 8 --patience 2
python3 training/neural/finetune.py --base microsoft/deberta-v3-xsmall --name act-deberta-xsmall --data "$HOME/vss-box/ft/data" --work "$HOME/vss-box/ft/act-deberta-xsmall" --lr 1e-4 --bs 32 --epochs 8 --patience 2
find docs/model/neural -type f | sort | xargs ls -la
# the QA model for the roles, hosted with ours (Xenova files at the commit pinned in docs/js/neural.js REVISIONS)
python3 - <<'PY'
from huggingface_hub import hf_hub_download
import shutil, os
out = "docs/model/neural/qa-distilbert-squad"
for f in ["config.json", "tokenizer.json", "tokenizer_config.json", "onnx/model_quantized.onnx"]:
    p = hf_hub_download("Xenova/distilbert-base-cased-distilled-squad", f, revision="bdbb0a5e9c617c3c7ea9f3cbaf2be3ad871bcd7d")
    os.makedirs(os.path.dirname(os.path.join(out, f)), exist_ok=True); shutil.copy(p, os.path.join(out, f))
print("qa model copied to", out)
PY
