# AFTER: 008_neural_check
# Neural vs rules vs VSS on the fixed 1000-message sample (4858 gold requests), both classifiers, cpu.
# PATHS:
set -euo pipefail
export PATH="$HOME/vss-box/node/bin:$PATH"
for zs in deberta distilbert; do
  echo "=== ZS=$zs DEVICE=cpu, all 1000 messages"; ZS=$zs node training/laptop/neural_score.mjs data/sampleF/* 2>&1 | grep -vE "^\s*\[" | tail -60
done
