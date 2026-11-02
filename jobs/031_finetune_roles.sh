# Fine-tune SOP-BERT (one DistilBERT: cut head + act + value class heads + name tags + per name-role filler kind + description keys) on our
# span-annotated requests and export q8 ONNX for transformers.js. SOP-BERT reads descriptions and references itself: the neural reader no
# longer calls the Rules reader (docs/js/neural.js formalizeJoint).
# PATHS: docs/model/neural/sop-bert
# training/neural/: make_roles.py -> finetune_roles.py --name sop-bert (cuda, fp16) -> torch.onnx + q8 -> node check through docs/js/neural.js
# makeReader. Then training/laptop/neural_score.mjs scores it per request (llm_score.mjs metric) on the 100 sample messages
# (training/neural/sample100_ids.txt) and on the whole 1000-message sample, each with the model's own cut and with CUT=rules (the units of
# the rules' segmenter given to it); then the per-kind accuracy of the name-roles (written / context / description) and the description
# accuracy from the held-out and sample evaluation. Checkpoints and caches stay in ~/vss-box/ft/.
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
python3 training/neural/make_roles.py --out "$HOME/vss-box/ft/roles_sb"
python3 training/neural/finetune_roles.py --base distilbert-base-uncased --name sop-bert --data "$HOME/vss-box/ft/roles_sb" --work "$HOME/vss-box/ft/sop-bert" --lr 6e-5 --bs 32 --epochs 8 --patience 2
find docs/model/neural/sop-bert -type f | sort | xargs ls -la
cat docs/model/neural/sop-bert/README.md
# per-request score (rules, VSS and the neural reader on the same messages; llm_score.mjs metric)
D=../sketch
ALLDIRS="$D/llm_train/sonnet_msg $D/llm_train/haiku_msg $D/llm_train/sonnet_msg2 $D/llm_train/haiku_msg2 $D/llm_train/sonnet_long $D/llm_bench/fresh1/sonnet $D/llm_bench/fresh1/haiku $D/llm_train/sonnet_short $D/llm_train/haiku_short $D/llm_bench/sonnet_spans $D/llm_bench/haiku_spans"
cd training/laptop
echo "== the 100 sample messages: SOP-BERT, its own cut"
ZS=sop-bert IDS=../neural/sample100_ids.txt node neural_score.mjs $D/llm_bench/haiku_spans $D/llm_bench/sonnet_spans 2>&1 | grep -v "messages scored"
echo "== the 100 sample messages: SOP-BERT, CUT=rules"
CUT=rules ZS=sop-bert IDS=../neural/sample100_ids.txt node neural_score.mjs $D/llm_bench/haiku_spans $D/llm_bench/sonnet_spans 2>&1 | grep -v "messages scored"
echo "== the whole 1000-message sample: SOP-BERT, its own cut"
ZS=sop-bert IDS=../neural/sample1000_ids.txt node neural_score.mjs $ALLDIRS 2>&1 | grep -v "messages scored" | sed -n '/^ALL/,$p'
echo "== the whole 1000-message sample: SOP-BERT, CUT=rules"
CUT=rules ZS=sop-bert IDS=../neural/sample1000_ids.txt node neural_score.mjs $ALLDIRS 2>&1 | grep -v "messages scored" | sed -n '/^ALL/,$p'
cd ../..
echo "== name-roles per filler kind (the model's reading of the gold request span; context: the kind only, its value comes from the shared context rule)"
python3 - "$HOME/vss-box/ft/sop-bert/eval.json" <<'EOF'
import json, sys
ev = json.load(open(sys.argv[1]))
for s in ("heldout", "sample1000"):
    fk = ev.get(s, {}).get("fill kinds", {})
    print(f"  {s}: " + " · ".join(f"{k}: kind right {v['kind right']}/{v['gold']}, value right {v['value right']}/{v['gold']} ({v['value right'] / max(v['gold'], 1) * 100:.1f}%)" for k, v in fk.items()))
    d = fk.get("description")
    if d: print(f"  {s}: description accuracy (read as a description, every key of the mention right): {d['value right']}/{d['gold']} = {d['value right'] / max(d['gold'], 1) * 100:.1f}%")
EOF
