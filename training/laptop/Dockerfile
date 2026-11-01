# The training box for a laptop with an NVIDIA card (training/laptop/README.md). Python only: scoring (node llm_score.mjs) stays on
# the coordinator's machine. Versions are those of the coordinator's venv, so CPU runs here and there use the same code.
# torch 2.15.0 from PyPI ships CUDA 13 wheels: the host needs an NVIDIA driver >= 580 (nvidia-smi shows "CUDA Version: 13.x").
FROM python:3.13-slim
RUN apt-get update && apt-get install -y --no-install-recommends git procps && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir numpy==2.5.4 torch==2.15.0
WORKDIR /box
CMD ["sleep", "infinity"]
