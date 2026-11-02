# PATHS: docs/model/micro/shapes7c_s2 training/sketch/runs/micro_shapes7c_s2_D1024_e10_s2 training/sketch/runs/micro_shapes7c_s2_D1024_e10_s2.log
# SEEDS_SHAPES7.md: world shapes7c_s2, seed 2, on cuda.
set -euo pipefail
export PATH="$HOME/vss-box/venv/bin:$PATH"
CREATE_COLOR=role SEED=2 DEVICE=cuda VSA_MEM_FRACTION=0.45 SOP_PYTHON=python3 DATA=spans FRONT_ROWS=world N_EVAL=150 EVAL_MODES=primary VSA_MAX_HOURS=16 \
  bash training/sketch/train_micro.sh shapes7c_s2 create,set,resize,fact,rule
