# AFTER: 000_setup
# Training speed of this machine on cuda and on cpu (probe.sh: a small probe world, 5 epochs each, folders removed at the end).
set -euo pipefail
export PATH="$HOME/vss-box/venv/bin:$PATH"
bash training/laptop/probe.sh
