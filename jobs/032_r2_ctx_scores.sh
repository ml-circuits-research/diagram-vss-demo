# Round-2 registry with the retrained context filler (weights_r2.json, CONTEXT_FILLER.md): the measurements that were killed by memory in the
# coordinator's sandbox. (1) short sets (six template sets + llm_short) and (2) the root cause of every miss on the 1000-message sample, plus
# (3) the default registry's root cause with the new weights, for comparison. CPU only; the three runs go in parallel.
# PATHS: results/032_out
set -uo pipefail
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then export PATH="$HOME/vss-box/node/bin:$PATH"; fi
node --version
OUT=results/032_out; mkdir -p $OUT
R2=$PWD/docs/model/micro/registry_r2.json
( REGISTRY=$R2 node training/sketch/short_bench/short_bench.mjs $OUT/short_r2.json > $OUT/short_r2.log 2>&1 && python3 training/sketch/short_bench/agg.py $OUT/short_r2.json > $OUT/short_r2.txt 2>&1; echo "short r2 exit $?" ) &
( REGISTRY=$R2 node training/sketch/composer_errors.mjs training/sketch/eval/sample1000/* --examples 5 --json $OUT/errors_r2.json > $OUT/errors_r2.txt 2>&1; echo "errors r2 exit $?" ) &
( node training/sketch/composer_errors.mjs training/sketch/eval/sample1000/* --examples 5 --json $OUT/errors_default.json > $OUT/errors_default.txt 2>&1; echo "errors default exit $?" ) &
wait
rm -f $OUT/short_r2.json
cat $OUT/short_r2.txt; head -60 $OUT/errors_r2.txt; head -60 $OUT/errors_default.txt
