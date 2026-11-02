# Neural vs rules vs VSS, quick check on 20 messages per folder (training/laptop/neural_score.mjs). Installs node in ~/vss-box/node if missing.
# PATHS:
set -euo pipefail
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  if [ ! -x "$HOME/vss-box/node/bin/node" ]; then
    mkdir -p "$HOME/vss-box/node"; curl -fsSL https://nodejs.org/dist/v22.11.0/node-v22.11.0-linux-x64.tar.xz | tar -xJ -C "$HOME/vss-box/node" --strip-components=1
  fi
  export PATH="$HOME/vss-box/node/bin:$PATH"
fi
node --version
(cd training/laptop && npm install --no-audit --no-fund)
for zs in deberta distilbert; do
  echo "=== ZS=$zs LIMIT=20 DEVICE=cpu"; ZS=$zs LIMIT=20 node training/laptop/neural_score.mjs data/sampleF/* 2>&1 | grep -vE "^\s*\[|progress" | tail -40
done
