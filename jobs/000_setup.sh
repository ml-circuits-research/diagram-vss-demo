# Set up Python for training (no sudo): uv, Python 3.13 in ~/vss-box/venv, numpy 2.5.4 and torch 2.15.0 (the coordinator's versions).
set -euxo pipefail
command -v uv || curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
[ -x "$HOME/vss-box/venv/bin/python3" ] || uv venv --python 3.13 "$HOME/vss-box/venv"
uv pip install --python "$HOME/vss-box/venv/bin/python3" numpy==2.5.4 torch==2.15.0
uname -a; nproc; free -g; nvidia-smi
"$HOME/vss-box/venv/bin/python3" training/laptop/check_gpu.py
