# PATHS: docs/model/micro/shapes7d training/sketch/runs/micro_shapes7d_D1024_e10_s0 training/sketch/runs/micro_shapes7d_D1024_e10_s0.log
# BETWEEN.md: shapes7c with the presence thresholds fitted on all training rows (N_CAL), on cuda.
set -euo pipefail
export PATH="$HOME/vss-box/venv/bin:$PATH" OMP_NUM_THREADS=8 MKL_NUM_THREADS=8
N_CAL=100000 CREATE_COLOR=role SEED=0 DEVICE=cuda VSA_MEM_FRACTION=0.45 SOP_PYTHON=python3 DATA=spans FRONT_ROWS=world N_EVAL=150 \
  EVAL_MODES=primary VSA_MAX_HOURS=16 bash training/sketch/train_micro.sh shapes7d create,set,resize,fact,rule
