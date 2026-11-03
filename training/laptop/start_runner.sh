#!/usr/bin/env bash
# start_runner.sh: start the GPU job runner (runner.sh) on the owner's machine, in a tmux session named "gpu".
#   bash ~/vss-box/diagram-vss-demo/training/laptop/start_runner.sh
# It updates the gpu-runs branch first, so the newest runner.sh is copied, then runs the copy (a pull cannot change it while it runs).
# Back into the session: tmux attach -t gpu   (leave it: Ctrl+B then D; stop the runner: Ctrl+C inside it)
set -euo pipefail
REPO=${REPO:-$HOME/vss-box/diagram-vss-demo}
cd "$REPO"
git fetch -q origin gpu-runs
[ "$(git rev-parse --abbrev-ref HEAD)" = gpu-runs ] || git checkout -q gpu-runs
git pull -q --rebase --autostash origin gpu-runs
cp training/laptop/runner.sh "$HOME/vss-box/runner.sh"
if tmux has-session -t gpu 2>/dev/null; then
  echo "a tmux session 'gpu' already exists: tmux attach -t gpu"; exit 1
fi
tmux new-session -d -s gpu "MAXJOBS=${MAXJOBS:-2} bash $HOME/vss-box/runner.sh; echo 'runner ended'; exec bash"
echo "runner started in tmux session 'gpu' (MAXJOBS=${MAXJOBS:-2}); watch it: tmux attach -t gpu"
