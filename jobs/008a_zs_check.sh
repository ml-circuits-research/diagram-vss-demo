# Why the neural reader reads every message as "describe": the zero-shot classifier on a few messages, q8 vs fp32 (zs_check.mjs).
# PATHS:
set -euo pipefail
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  if [ ! -x "$HOME/vss-box/node/bin/node" ]; then
    mkdir -p "$HOME/vss-box/node"; curl -fsSL https://nodejs.org/dist/v22.11.0/node-v22.11.0-linux-x64.tar.xz | tar -xJ -C "$HOME/vss-box/node" --strip-components=1
  fi
  export PATH="$HOME/vss-box/node/bin:$PATH"
fi
(cd training/laptop && npm install --no-audit --no-fund >/dev/null)
node training/laptop/zs_check.mjs 2>&1 | grep -vE "^\s*$|dtype not specified"
