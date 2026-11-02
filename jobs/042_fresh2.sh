# FRESH2_PLAN.md: the one comparison on the Opus-written set (600 messages, llm_bench/fresh2/opus_{a,b,c,d}). It reads each message once with every
# reader (Rules, VSS default, VSS round 2, SOP-BERT shipped, SOP-BERT all-data of job 041; and Rules / SOP-BERT on the VSS cut for the "same cut"
# table), writes the per-request records, then fits each learned confidence on the calibration third (int(sha256(id),16) % 3 == 0) and reports
# the test part: confidently wrong % at 97% (headline), requests done right, asked, not read, extras, equal-confidently-wrong curves, execute-all,
# AUROC, per writer / length / commands-questions, 95% bootstrap intervals, and the old JSONs applied unchanged. Script: training/sketch/fresh2/run.sh.
# No GPU needed (all CPU: onnxruntime + node). The four collector processes run in parallel (VSS default; VSS round 2; SOP-BERT shipped, then
# Rules; SOP-BERT all-data), SOP-BERT processes with 4 CPU threads each = 16 threads. Expected time: about 5-8 min of collecting (VSS ~1.5-2 min,
# Rules ~1 min, each SOP-BERT process ~4-6 min: 600 messages x 2 cuts), the fit and report ~10 s, plus ~1 min for npm install: 10 min in all.
# Needs on the branch: training/sketch/fresh2/, training/sketch/llm_bench/fresh2/ (the messages), results/041_sopbert_all/sop-bert-all (job 041).
# Nothing is edited or trained: the records and the report are new files under results/042_fresh2/. The messages are read by these scripts only.
# AFTER: 041_sopbert_all
# PATHS: results/042_fresh2/report.md results/042_fresh2/records
set -euo pipefail
export PATH="$HOME/vss-box/venv/bin:$PATH" TOKENIZERS_PARALLELISM=false
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  if [ ! -x "$HOME/vss-box/node/bin/node" ]; then
    mkdir -p "$HOME/vss-box/node"; curl -fsSL https://nodejs.org/dist/v22.11.0/node-v22.11.0-linux-x64.tar.xz | tar -xJ -C "$HOME/vss-box/node" --strip-components=1
  fi
  export PATH="$HOME/vss-box/node/bin:$PATH"
fi
(cd training/laptop && npm install --no-audit --no-fund >/dev/null)
R=results/042_fresh2; mkdir -p "$R/records"
test -f results/041_sopbert_all/sop-bert-all/config.json || { echo "results/041_sopbert_all/sop-bert-all is missing: job 041 did not finish"; exit 1; }
test -f training/sketch/llm_bench/fresh2/opus_a/batch_01.jsonl || { echo "training/sketch/llm_bench/fresh2 is missing on this branch"; exit 1; }
ls training/sketch/llm_bench/fresh2/*/batch_01.jsonl | xargs wc -l
# 4 node processes at once, 16 threads: the SOP-BERT processes use 4 intra-op threads each (the others are single-threaded JavaScript)
PAR=1 THREADS=4 REC="$R/records" REPORT="$R/report.md" SOP_ALL=results/041_sopbert_all/sop-bert-all bash training/sketch/fresh2/run.sh
cat "$R/report.md"
du -sh "$R/records"
git status --short docs/model | head   # must show nothing of ours: no model or reader file is touched
