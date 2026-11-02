# precision_collect.sh: the commands that produced the records used by precision.mjs (2026-11-02).
# Records of the sample / held-out / short sets were made by risk_coverage.mjs and vss_confidence.mjs (RISK_COVERAGE.md, VSS_CONFIDENCE.md);
# this script only adds the six template short sets (docs/bench/*, converted to msg_1.jsonl by the 15-line converter in precision.mjs `bench`)
# and the Rules records. Usage: bash precision_collect.sh <scratch dir>
set -e
cd "$(dirname "$0")/../.."
P=${1:?scratch dir}; mkdir -p $P/bench6
node training/sketch/precision.mjs bench $P/bench6
for s in hand blind broad seen new_identities heldout_formulations; do
  node training/sketch/risk_coverage.mjs run $P/rc_$s.jsonl $s $P/bench6/$s > $P/rc_$s.log 2>&1
  node training/sketch/vss_confidence.mjs collect $P/vc_$s.jsonl $s $P/bench6/$s > $P/vc_$s.log 2>&1
done
node training/sketch/precision.mjs rules $P
