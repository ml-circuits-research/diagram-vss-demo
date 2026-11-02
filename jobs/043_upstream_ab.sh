# UPSTREAM_AUDIT.md, the missing A/B: history7 and graphq7 trained with vss-demo 9c85649's own trainer, ours at upstream defaults, and ours
# as shipped, same data and seed; route books compared and scored (SEG=gold). CPU/GPU as the trainer picks; runs beside job 041.
# PATHS: ab
set -uo pipefail
export PATH="$HOME/vss-box/venv/bin:$PATH" OMP_NUM_THREADS=8 MKL_NUM_THREADS=8
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then export PATH="$HOME/vss-box/node/bin:$PATH"; fi
bash tools/upstream_ab_job.sh history7 undo,redo,forget
bash tools/upstream_ab_job.sh graphq7 check,connected,path,reachable,cycle,exists
find ab -name "*.log" | sort | xargs tail -n 5
find ab -name model -type d | xargs -I{} find {} -name "*.bin" -size +1M -delete   # keep logs and scores, not the large route books
