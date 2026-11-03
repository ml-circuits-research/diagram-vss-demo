# AFTER: 070_vss_all 071_bert_all
# PATHS: results/072_measure docs/model/arms/ALL/confidence
# TRAIN_PLAN_1103.md, arm ALL, the measurement (CPU only): the retrained readers (VSS: docs/model/arms/ALL/registry_ALL.json, job 070; SOP-BERT:
# docs/model/arms/ALL/neural/sop-bert-ALL, job 071) against the shipped ones (docs/model/micro/registry.json, docs/model/neural/sop-bert), on
#   - fresh2: the four Opus writer folders llm_bench/fresh2/opus_{a,b,c,d} (405 long realistic messages nobody trained on);
#   - short3: llm_bench/short3 (530 short blind commands; commit 23617e2 filled 139 of the 156 pending wires). A message that still holds a
#     wire with a "pending" key (17, no SOP Lang form yet) is left out whole: its other wires stay unscored rather than turn a reading of the
#     pending span into an "extra". The filtered copy is written to $R/data/short3/batch_01.jsonl.
# Steps:
#   0. the conversion ceiling (training/sketch/convert_check.py --registry, CONVERT_FIX.md; CPU, ~1 min each): for the shipped worlds and the new
#      ones, the share of the short3 / fresh2 requests whose world row (each world's own front.json and BUILD.json settings) reproduces the gold
#      through the browser adapter: what a perfect reading of each world could reach. Tables in $R/ceiling_{G,ALL}.log;
#   1. collectors (fresh2/collect_vss.mjs, collect_sop.mjs CUTS=own, collect_rules.mjs CUTS=own) for the 4 learned readers + the Rules, per situation;
#   2. per situation, fit_report.mjs for the shipped pair (G) and the new pair (ALL), then verdicts.mjs (G = shipped, T = new: the same fit recipe,
#      the cost-score threshold fitted out of fold on the situation's calibration part, int(sha256(id),16) % 3 == 0; 1000 paired resamples of the
#      test messages) with --json;
#   3. the comparison table $R/COMPARE.md: rows = situations, columns = readers (VSS shipped, VSS new, SOP-BERT shipped, SOP-BERT new, Rules
#      executing everything), cost score on the test part [95% CI], and the paired differences new - shipped [95% CI];
#   4. training/sketch/confidence3/refit.sh on the NEW readers (REGISTRY / MODEL of arm ALL, DATA = fresh2 + the filtered short3, STAMP=0): every
#      confidence file (vss.json, sop-bert.json, combined.json, vote3.json) and the parity fixtures are refitted; they are copied to
#      docs/model/arms/ALL/confidence/ and the shipped ones are restored (git checkout), so docs/model/confidence stays the shipped readers'.
# Expected time on the GPU machine's CPU: collectors ~1-2 min per reader and situation (job 065: VSS fresh2 25 s; job 062: SOP-BERT fresh2 11 s), ~10 min
# in all; fit_report + verdicts ~2 min per situation; refit.sh ~6-8 min (its own estimate: ~4 min on 2 CPUs for fresh2 + short3). In all ~20-25 min.
set -uo pipefail
ARM=ALL; JOB=072_measure
export PATH="$HOME/vss-box/venv/bin:$PATH" TOKENIZERS_PARALLELISM=false
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then export PATH="$HOME/vss-box/node/bin:$PATH"; fi
ROOT=$PWD; A=docs/model/arms/$ARM; R=results/$JOB; F=training/sketch/fresh2; SK=training/sketch
REG_NEW=$A/registry_$ARM.json; CTX_NEW=$A/context/weights.json; BERT_NEW=$A/neural/sop-bert-$ARM; BERT_OLD=docs/model/neural/sop-bert
mkdir -p "$R/data/short3" "$A/confidence"
TL=$R/timings.txt; T0=$(date +%s)
stamp() { echo "[$(date +%T) +$(( $(date +%s) - T0 ))s] $*" | tee -a "$TL"; }
fail() { stamp "FAILED: $*"; exit 1; }
for f in "$REG_NEW" "$CTX_NEW" "$BERT_NEW/config.json" "$BERT_OLD/config.json" docs/model/micro/registry.json; do [ -f "$f" ] || fail "missing $f (jobs 070 / 071)"; done
(cd training/laptop && npm install --no-audit --no-fund >/dev/null)

# ---- data: fresh2 as is; short3 without the messages that still hold a pending wire
F2="$SK/llm_bench/fresh2/opus_a $SK/llm_bench/fresh2/opus_b $SK/llm_bench/fresh2/opus_c $SK/llm_bench/fresh2/opus_d"
for d in $F2; do [ -f "$d/batch_01.jsonl" ] || fail "$d is missing on this branch"; done
python3 - "$SK/llm_bench/short3" "$R/data/short3/batch_01.jsonl" <<'PY' | tee -a "$TL" || fail "short3"
import glob, json, os, sys
src, out = sys.argv[1], sys.argv[2]; rows = [json.loads(l) for f in sorted(glob.glob(os.path.join(src, "batch_*.jsonl"))) for l in open(f) if l.strip()]
keep = [r for r in rows if not any("pending" in w for w in r["wires"])]
open(out, "w").write("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in keep))
print(f"short3: {len(rows)} messages, {len(rows) - len(keep)} left out (a pending wire), {len(keep)} kept with {sum(len(r['wires']) for r in keep)} gold requests")
PY
S3=$R/data/short3
declare -A DATA=( [fresh2]="$F2" [short3]="$S3" )

# ---- 0. the conversion ceiling of the shipped and of the new worlds (2026-11-03: the shipped worlds with their own fronts short3 41.9%, fresh2
# 71.5%; job 070's settings with the fronts convert_check learns itself short3 60.6%, fresh2 72.0%); the new worlds were built with LEGEND_EXT=1 DIAGRAM_OPS=1
python3 $SK/convert_check.py --registry docs/model/micro/registry.json --no-base --tests --json "$R/ceiling_G.json" > "$R/ceiling_G.log" 2>&1 || { tail -5 "$R/ceiling_G.log"; fail "convert_check shipped"; }
LEGEND_EXT=1 DIAGRAM_OPS=1 python3 $SK/convert_check.py --registry "$REG_NEW" --no-base --tests --json "$R/ceiling_ALL.json" > "$R/ceiling_ALL.log" 2>&1 || { tail -5 "$R/ceiling_ALL.log"; fail "convert_check new"; }
for x in G ALL; do echo "ceiling $x:"; grep "^|" "$R/ceiling_$x.log"; done | tee -a "$TL"

# ---- 1. collectors: G = the shipped readers, ALL = the new ones (records dirs as fit_report.mjs / verdicts.mjs read them)
for sit in fresh2 short3; do
  d=${DATA[$sit]}; G=$R/$sit/G/records; N=$R/$sit/ALL/records; mkdir -p "$G" "$N"
  stamp "$sit: collectors"
  ( node $F/collect_vss.mjs "$G/vss_arm.jsonl" $sit $d > "$G/log_vss_arm.txt" 2>&1 ) &
  ( REGISTRY="$REG_NEW" CONTEXT="$CTX_NEW" LEGEND_EXT=1 node $F/collect_vss.mjs "$N/vss_arm.jsonl" $sit $d > "$N/log_vss_arm.txt" 2>&1 ) &
  wait
  ( MODEL="$BERT_OLD" CUTS=own THREADS=3 node $F/collect_sop.mjs "$G/sop_arm_%CUT%.jsonl" $sit $d > "$G/log_sop_arm.txt" 2>&1 ) &
  ( MODEL="$BERT_NEW" CUTS=own THREADS=3 node $F/collect_sop.mjs "$N/sop_arm_%CUT%.jsonl" $sit $d > "$N/log_sop_arm.txt" 2>&1 ) &
  ( CUTS=own node $F/collect_rules.mjs "$G/rules_%CUT%.jsonl" $sit $d > "$G/log_rules.txt" 2>&1 ) &
  wait
  cp "$G/rules_own.jsonl" "$N/rules_own.jsonl"
  for x in "$G" "$N"; do for f in vss_arm sop_arm_own rules_own; do [ -s "$x/$f.jsonl" ] || fail "$sit: $x/$f.jsonl is missing (see the logs there)"; done; tail -1 "$x/log_vss_arm.txt" | cut -c1-250 | tee -a "$TL"; done
  # ---- 2. the fit_report of each pair, then the paired verdicts (G = shipped, T = new)
  for arm in G ALL; do
    ARM="$arm" node $F/fit_report.mjs "$R/$sit/$arm/records" "$R/$sit/$arm/report.md" $d > "$R/$sit/$arm/log_fit_report.txt" 2>&1 || { tail -20 "$R/$sit/$arm/log_fit_report.txt"; fail "$sit fit_report $arm"; }
  done
  node $F/verdicts.mjs --out "$R/$sit/verdicts.md" --json "$R/$sit/verdicts.json" $(for x in $d; do echo --data $x; done) \
    --vss-g "$R/$sit/G/records" --vss-t "$R/$sit/ALL/records" --bert-g "$R/$sit/G/records" --bert-t "$R/$sit/ALL/records" > "$R/$sit/log_verdicts.txt" 2>&1 \
    || { tail -20 "$R/$sit/log_verdicts.txt"; fail "$sit verdicts"; }
  stamp "$sit: reports written ($R/$sit/{G,ALL}/report.md, verdicts.md, verdicts.json)"
done

# ---- 3. the comparison table: rows = situations, columns = readers, cost score on the test part, paired bootstrap of new - shipped
python3 - "$R" <<'PY' | tee "$R/COMPARE.md" || fail "COMPARE.md"
import hashlib, json, os, sys
R = sys.argv[1]; rows = []
cal = lambda i: int(hashlib.sha256(i.encode()).hexdigest(), 16) % 3 == 0
def rules_score(path, cost=10):   # the Rules execute everything: (right - cost x (wrong + extras)) / requested actions, test part
    g = r = bad = 0
    for l in open(path):
        x = json.loads(l)
        if cal(x["id"]): continue
        g += x["gold"]; r += sum(p["o"] == "right" for p in x["rules"]); bad += sum(p["o"] != "right" for p in x["rules"])
    return 100 * (r - cost * bad) / g if g else float("nan"), 100 * r / g if g else float("nan")
f = lambda x: f"{x:.1f}"; ci = lambda c: f"[{f(c[0])}, {f(c[1])}]"
print("# TRAIN_PLAN_1103.md: new (arm ALL) vs shipped readers, cost score on the test part\n")
print("Cost score = (requests done right - 10 x (executed wrong + extras executed)) per 100 requested actions; each learned reader executes only")
print("above its own cost-score threshold, fitted out of fold on the situation's calibration part (int(sha256(id),16) % 3 == 0); 95% intervals")
print("from 1000 paired resamples of the test messages (fresh2/verdicts.mjs; the same draws for every reader). The Rules execute everything.\n")
print("| situation (test messages / requests) | VSS shipped | VSS new | SOP-BERT shipped | SOP-BERT new | Rules | VSS new - shipped | SOP-BERT new - shipped |")
print("|---|---|---|---|---|---|---|---|")
for sit in ("fresh2", "short3"):
    V = json.load(open(f"{R}/{sit}/verdicts.json")); a = V["arms"]
    rs, rr = rules_score(f"{R}/{sit}/G/records/rules_own.jsonl")
    cell = lambda k: f"{f(a[k]['score'])} {ci(a[k]['ci'])}<br>right {f(100 * a[k]['done_right'])}%, conf. wrong {f(100 * a[k]['conf_wrong'])}%"
    print(f"| {sit} ({V['test_messages']} / {V['test_requests']}) | {cell('VSS-G')} | {cell('VSS-T')} | {cell('BERT-G')} | {cell('BERT-T')} | {f(rs)}<br>right {f(rr)}% | "
          f"{'+' if V['diff']['vss']['point'] >= 0 else ''}{f(V['diff']['vss']['point'])} {ci(V['diff']['vss']['ci'])} | {'+' if V['diff']['bert']['point'] >= 0 else ''}{f(V['diff']['bert']['point'])} {ci(V['diff']['bert']['ci'])} |")
print("\nA difference whose interval lies above 0 is a gain shown; an interval below 0 is a loss shown; otherwise not shown either way.")
print("Details: <situation>/G/report.md (shipped), <situation>/ALL/report.md (new), <situation>/verdicts.md (the per-arm tables; G = shipped, T = new).")
PY
stamp "COMPARE.md written"

# ---- 4. refit every confidence file on the NEW readers, keep the copies under docs/model/arms/ALL/confidence, restore the shipped ones
stamp "refit.sh on the new readers"
CONF_FILES="docs/model/confidence training/sketch/combine/combined_parity.json training/sketch/confidence3/vote3_parity.json"
git diff --quiet -- $CONF_FILES || fail "the shipped confidence files are modified in this checkout; refusing to overwrite them"
REGISTRY="$REG_NEW" MODEL="$BERT_NEW" LEGEND_EXT=1 DATA="$F2 $S3" REC="$R/refit/records" THREADS=3 STAMP=0 bash training/sketch/confidence3/refit.sh > "$R/refit.log" 2>&1
rc=$?
cp -r docs/model/confidence/. "$A/confidence/"; cp training/sketch/combine/combined_parity.json training/sketch/confidence3/vote3_parity.json "$A/confidence/" 2>/dev/null
git checkout -- $CONF_FILES
[ "$rc" = 0 ] || { tail -30 "$R/refit.log"; fail "refit.sh (exit $rc); the shipped confidence files are restored"; }
grep -E "test_|done:|cost" "$R/refit.log" | tail -12 | tee -a "$TL"
ls -la "$A/confidence" | tee -a "$TL"
stamp "done"; du -sh "$R" "$A/confidence"
git status --short docs/model/micro docs/model/context docs/model/neural docs/model/confidence | head   # must show nothing
