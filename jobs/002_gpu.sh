# AFTER: 001_probe
# After the NVIDIA driver (2026-11-02): the card as torch sees it, then the training speed on cuda only.
set -euo pipefail
export PATH="$HOME/vss-box/venv/bin:$PATH"
nvidia-smi
python3 training/laptop/check_gpu.py
DEVICES=cuda bash training/laptop/probe.sh
