# PATHS: docs/model/micro/history7r2 training/sketch/runs/micro_history7r2_D1024_e10_s0 training/sketch/runs/micro_history7r2_D1024_e10_s0.log
# AFTER: 021_shapes7r2 026_manage7r2
# ROUND2.md: world history7r2, round 2 (presence thresholds on all rows, front value learning, short and new-operation data, groups and double positions), on cuda.
set -euo pipefail
export PATH="$HOME/vss-box/venv/bin:$PATH" OMP_NUM_THREADS=8 MKL_NUM_THREADS=8
for d in sonnet_short haiku_short ops_groups ops_positions; do ls training/sketch/llm_train/$d/msg_*.jsonl > /dev/null || { echo "missing data: llm_train/$d (ROUND2.md: run after the new-operation data are final)"; exit 1; }; done
N_CAL=100000 CREATE_COLOR=role VAL_SUB=value SHORT=1 OPS=1 DIAGRAM_OPS=1 SEED=0 DEVICE=cuda VSA_MEM_FRACTION=0.85 PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True SOP_PYTHON=python3 DATA=spans FRONT_ROWS=world \
  N_EVAL=150 EVAL_MODES=primary VSA_MAX_HOURS=16 bash training/sketch/train_micro.sh history7r2 undo,redo,forget
