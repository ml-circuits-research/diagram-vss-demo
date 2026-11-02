#!/usr/bin/env bash
# runner.sh: the job runner of a GPU machine the coordinator cannot reach directly (training/laptop/README.md, "Without a link").
# The channel is the git branch `gpu-runs` of this repository:
#   - the coordinator pushes job scripts there: jobs/<id>.sh;
#   - this runner pulls them, runs at most MAXJOBS at once, and pushes back results/<id>.log, results/<id>.exit and the paths the job
#     names on its "# PATHS:" line (models and run logs), one commit per finished job.
# A job script runs from the repository root. Optional header lines:
#   # PATHS: <path> <path> ...   files or folders to commit when the job ends (committed only then, never while it runs)
#   # AFTER: <id> <id> ...       start only after these jobs have ended
# Local state (running pids, logs) is in $STATE, outside the repository.
#
# Start (account of the GPU machine, in tmux; the script copies itself so that a pull cannot change it while it runs):
#   cp ~/vss-box/diagram-vss-demo/training/laptop/runner.sh ~/vss-box/runner.sh && bash ~/vss-box/runner.sh
# Anyone who can push to this repository can run commands on this machine through jobs/. Stop: Ctrl+C in its tmux window.
set -u
REPO=${REPO:-$HOME/vss-box/diagram-vss-demo}
STATE=${STATE:-$HOME/vss-box/state}
BR=${BR:-gpu-runs}
MAXJOBS=${MAXJOBS:-2}
POLL=${POLL:-120}
export PATH="$HOME/vss-box/venv/bin:$HOME/.local/bin:$PATH"
# CPU threads per job: the cores divided among the jobs that run at once, so that two trainings do not fight over the same threads
# (2026-11-02: two runs with 16 threads each stalled each other in their CPU phases). A job may set its own.
THREADS=${THREADS:-$(( $(nproc) / MAXJOBS ))}; [ "$THREADS" -ge 1 ] || THREADS=1
export OMP_NUM_THREADS=$THREADS MKL_NUM_THREADS=$THREADS OPENBLAS_NUM_THREADS=$THREADS
mkdir -p "$STATE"
cd "$REPO" || exit 1
[ "$(git rev-parse --abbrev-ref HEAD)" = "$BR" ] || { echo "runner: $REPO is not on branch $BR (git checkout $BR)"; exit 1; }
log() { echo "$(date '+%F %T') $*"; }

push() {
  local i
  for i in 1 2 3; do
    git push -q origin "HEAD:$BR" && return 0
    git pull -q --rebase --autostash origin "$BR" || git rebase --abort 2>/dev/null
  done
  log "push failed 3 times; will retry next round"; return 1
}

log "runner on $(hostname), repo $REPO, branch $BR, at most $MAXJOBS jobs, $THREADS CPU threads each, poll every ${POLL}s"
while :; do
  git pull -q --rebase --autostash origin "$BR" || { git rebase --abort 2>/dev/null; log "pull failed"; }

  # 1. jobs that ended: commit their results
  for f in "$STATE"/*.running; do
    [ -e "$f" ] || continue
    id=$(basename "$f" .running)
    kill -0 "$(cat "$f")" 2>/dev/null && continue
    mkdir -p results
    cp "$STATE/$id.log" "results/$id.log" 2>/dev/null || echo "(no log)" > "results/$id.log"
    cp "$STATE/$id.exit" "results/$id.exit" 2>/dev/null || echo "killed" > "results/$id.exit"
    paths=$(sed -n 's/^# PATHS: *//p' "jobs/$id.sh" 2>/dev/null)
    existing=""; for p in $paths; do [ -e "$p" ] && existing="$existing $p"; done
    git add -f "results/$id.log" "results/$id.exit" $existing
    git commit -q -m "gpu job $id: exit $(cat "results/$id.exit")" && push
    mv "$f" "$STATE/$id.done"
    log "ended $id (exit $(cat "results/$id.exit"))"
  done

  # 2. start new jobs, in name order
  n=$(ls "$STATE"/*.running 2>/dev/null | wc -l)
  for j in jobs/*.sh; do
    [ -e "$j" ] || continue
    [ "$n" -ge "$MAXJOBS" ] && break
    id=$(basename "$j" .sh)
    if [ -e "$STATE/$id.running" ] || [ -e "$STATE/$id.done" ] || [ -e "results/$id.exit" ]; then continue; fi
    wait_for=""
    for a in $(sed -n 's/^# AFTER: *//p' "$j"); do [ -e "$STATE/$a.done" ] || [ -e "results/$a.exit" ] || wait_for="$wait_for $a"; done
    [ -n "$wait_for" ] && continue
    cp "$j" "$STATE/$id.sh"
    setsid bash -c 'bash "$1" > "$2" 2>&1; echo $? > "$3"' _ "$STATE/$id.sh" "$STATE/$id.log" "$STATE/$id.exit" < /dev/null &
    echo $! > "$STATE/$id.running"
    n=$((n + 1))
    log "started $id (pid $!)"
  done

  sleep "$POLL"
done
