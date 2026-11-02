# PATHS: docs/model/micro/shapes7c_g0 training/sketch/runs/micro_shapes7c_g0_D1024_e10_s0 training/sketch/runs/micro_shapes7c_g0_D1024_e10_s0.log
# SEEDS_SHAPES7.md: world shapes7c_g0, seed 0, on cuda.
set -euo pipefail
export PATH="$HOME/vss-box/venv/bin:$PATH"
CREATE_COLOR=role SEED=0 DEVICE=cuda VSA_MEM_FRACTION=0.45 SOP_PYTHON=python3 DATA=spans FRONT_ROWS=world N_EVAL=150 EVAL_MODES=primary VSA_MAX_HOURS=16 \
  bash training/sketch/train_micro.sh shapes7c_g0 create,set,resize,fact,rule
