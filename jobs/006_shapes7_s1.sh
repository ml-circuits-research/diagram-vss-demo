# PATHS: docs/model/micro/shapes7_s1 training/sketch/runs/micro_shapes7_s1_D1024_e10_s1 training/sketch/runs/micro_shapes7_s1_D1024_e10_s1.log
# SEEDS_SHAPES7.md: world shapes7_s1, seed 1, on cuda.
set -euo pipefail
export PATH="$HOME/vss-box/venv/bin:$PATH" OMP_NUM_THREADS=8 MKL_NUM_THREADS=8
SEED=1 DEVICE=cuda VSA_MEM_FRACTION=0.45 SOP_PYTHON=python3 DATA=spans FRONT_ROWS=world N_EVAL=150 EVAL_MODES=primary VSA_MAX_HOURS=16 \
  bash training/sketch/train_micro.sh shapes7_s1 create,set,resize,fact,rule
