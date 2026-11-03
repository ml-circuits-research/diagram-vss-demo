# AFTER: 081_vss_r3 082_bert_r3
# PATHS: results/083_measure_r3 docs/model/arms/R3/confidence
# TRAIN_PLAN_R3.md section A, arm R3, the measurement (CPU only): the round-3 readers (VSS: docs/model/arms/R3/registry_R3.json, job 081;
# SOP-BERT: docs/model/arms/R3/neural/sop-bert-R3, job 082) against the SHIPPED readers (arm ALL: docs/model/micro/registry.json,
# docs/model/neural/sop-bert, docs/model/confidence), with the recipe of job 079, on
#   - fresh2: llm_bench/fresh2/opus_{a,b,c,d} (long realistic messages) and short3: llm_bench/short3 without the messages that still hold a
#     "pending" wire (filtered copy in $R/data/short3): the two sets the confidences are fitted on (calibration part, sha256 % 3 == 0) and
#     scored on (test part), as in 072 / 079;
#   - scenes_test: llm_bench/scenes_test (the 4 held-out step-by-step scenes, 166 messages, 163 requests) and collected_1: llm_bench/collected_1
#     (the owner's session 1: 26 messages as sent + the same 26 corrected, ids col- / colc-): reported sets. No confidence of either arm is
#     fitted on them: VSS-BERT is scored on ALL their messages with each arm's combined.json (fitted on fresh2 + short3); VSS and SOP-BERT alone
#     follow verdicts.mjs (threshold fitted on the set's own calibration part, scored on its test part), as for fresh2 / short3.
# Steps:
#   -. guards: the shipped registry is arm ALL; every R3 world was built with NEW_DISTINCT=1 GAP_ROLE=1; the scorer / vote hold the
#      NEW_FORMS_AUDIT fixes; audit_new_forms.mjs -> $R/audit_new_forms.md;
#   0. the conversion ceiling (convert_check.py --registry) of the shipped worlds and of the R3 worlds (GAP_ROLE=1 in the environment: it is a
#      module switch of llm_to_world.py) on short3 / fresh2 / scenes_test / collected_1;
#   1. collectors (fresh2/collect_vss.mjs, collect_sop.mjs CUTS=own, collect_rules.mjs CUTS=own) for the 4 learned readers + the Rules, per set;
#   2. per set, fit_report.mjs for the shipped pair (ALL) and the new pair (R3), then verdicts.mjs (G = shipped, T = R3; 1000 paired resamples);
#   3. VSS-BERT shipped: combine/collect_pair.mjs records of the shipped models + combine/failures_vss_bert.mjs with the shipped combined.json /
#      vss.json (fresh2 + short3 in one records dir, as 079; scenes_test and collected_1 each in its own);
#   4. confidence3/refit.sh on the R3 readers (REGISTRY / MODEL of arm R3, DATA = fresh2 + the filtered short3, the same data as the shipped
#      fit, COMB_VARIANT=d2, STAMP=0); with the refitted files in place: failures_vss_bert on the refit records, collect_pair + failures_vss_bert
#      of the R3 models on scenes_test and collected_1; then the files are copied to docs/model/arms/R3/confidence/ and the shipped ones restored;
#   5. $R/COMPARE.md: rows = sets, columns = readers (VSS, SOP-BERT, VSS-BERT: shipped and R3; the Rules executing everything), cost score
#      [95% CI], done right, confidently wrong, the paired differences R3 - shipped [95% CI], the conversion ceilings; and $R/VERDICT.md: the
#      pre-registered rule of TRAIN_PLAN_R3.md A.6 applied to the numbers.
# Expected time on the GPU machine's CPU: 079 took 5 min for fresh2 + short3; + scenes_test and collected_1 (230 messages, ~3-5 min): ~10-15 min.
set -uo pipefail
ARM=R3; JOB=083_measure_r3; OLD=ALL
export PATH="$HOME/vss-box/venv/bin:$PATH" TOKENIZERS_PARALLELISM=false
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then export PATH="$HOME/vss-box/node/bin:$PATH"; fi
ROOT=$PWD; A=docs/model/arms/$ARM; R=results/$JOB; F=training/sketch/fresh2; SK=training/sketch
REG_NEW=$A/registry_$ARM.json; CTX_NEW=$A/context/weights.json; BERT_NEW=$A/neural/sop-bert-$ARM; BERT_OLD=docs/model/neural/sop-bert; REG_OLD=docs/model/micro/registry.json
mkdir -p "$R/data/short3" "$A/confidence"
TL=$R/timings.txt; T0=$(date +%s)
stamp() { echo "[$(date +%T) +$(( $(date +%s) - T0 ))s] $*" | tee -a "$TL"; }
fail() { stamp "FAILED: $*"; exit 1; }
for f in "$REG_NEW" "$CTX_NEW" "$BERT_NEW/config.json" "$BERT_OLD/config.json" "$REG_OLD" docs/model/confidence/combined.json; do [ -f "$f" ] || fail "missing $f (jobs 081 / 082)"; done
grep -q '"VAL_PICK": "specific"' "$REG_OLD" && ! grep -q '"NEW_DISTINCT"\|"GAP_ROLE"' "$REG_OLD" || fail "docs/model/micro/registry.json is not arm ALL (the shipped readers this job compares with)"
python3 - "$A/micro" <<'PY' || fail "an R3 world was not built with NEW_DISTINCT=1 GAP_ROLE=1"
import glob, json, os, sys
B = [json.load(open(f)) for f in glob.glob(os.path.join(sys.argv[1], "*", "BUILD.json"))]
sys.exit(0 if len(B) == 9 and all(b.get("NEW_DISTINCT") == "1" and b.get("GAP_ROLE") == "1" for b in B) else 1)
PY
(cd training/laptop && npm install --no-audit --no-fund >/dev/null)
grep -q "^function same(type, act, el)" docs/js/bench-canon.js && grep -q "^const listFree" docs/js/vote-confidence.js \
  || fail "docs/js/bench-canon.js / vote-confidence.js predate NEW_FORMS_AUDIT.md: merge main into gpu-runs first"
node $SK/confidence3/audit_new_forms.mjs > "$R/audit_new_forms.md" 2>&1 || fail "audit_new_forms.mjs"
grep "^In all" "$R/audit_new_forms.md" | tee -a "$TL"

# ---- data: fresh2 as is; short3 without the messages that still hold a pending wire; scenes_test and collected_1 as they are (no pending wire)
F2="$SK/llm_bench/fresh2/opus_a $SK/llm_bench/fresh2/opus_b $SK/llm_bench/fresh2/opus_c $SK/llm_bench/fresh2/opus_d"
SCT=$SK/llm_bench/scenes_test; COL=$SK/llm_bench/collected_1
for d in $F2 $SCT $COL; do [ -f "$d/batch_01.jsonl" ] || fail "$d is missing on this branch"; done
grep -l '"pending"' $SCT/batch_*.jsonl $COL/batch_*.jsonl && fail "scenes_test / collected_1 hold a pending wire: filter them as short3"
python3 - "$SK/llm_bench/short3" "$R/data/short3/batch_01.jsonl" <<'PY' | tee -a "$TL" || fail "short3"
import glob, json, os, sys
src, out = sys.argv[1], sys.argv[2]; rows = [json.loads(l) for f in sorted(glob.glob(os.path.join(src, "batch_*.jsonl"))) for l in open(f) if l.strip()]
keep = [r for r in rows if not any("pending" in w for w in r["wires"])]
open(out, "w").write("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in keep))
print(f"short3: {len(rows)} messages, {len(rows) - len(keep)} left out (a pending wire), {len(keep)} kept with {sum(len(r['wires']) for r in keep)} gold requests")
PY
S3=$R/data/short3
declare -A DATA=( [fresh2]="$F2" [short3]="$S3" [scenes_test]="$SCT" [collected_1]="$COL" )
SITS="fresh2 short3 scenes_test collected_1"

# ---- 0. the conversion ceiling of the shipped (arm ALL) and of the R3 worlds: the share of the requests whose world row (each world's own
# front.json and BUILD.json settings) reproduces the gold through the browser adapter (2026-11-03 dry build, the fronts convert_check learns
# itself with 081's settings and data: short3 61.2%, fresh2 74.4%, scenes_test 65.6%; TRAIN_PLAN_R3.md A.5)
LEGEND_EXT=1 DIAGRAM_OPS=1 python3 $SK/convert_check.py --registry "$REG_OLD" --no-base --tests --json "$R/ceiling_$OLD.json" llm_bench/scenes_test llm_bench/collected_1 > "$R/ceiling_$OLD.log" 2>&1 || { tail -5 "$R/ceiling_$OLD.log"; fail "convert_check shipped"; }
LEGEND_EXT=1 DIAGRAM_OPS=1 GAP_ROLE=1 python3 $SK/convert_check.py --registry "$REG_NEW" --no-base --tests --json "$R/ceiling_$ARM.json" llm_bench/scenes_test llm_bench/collected_1 > "$R/ceiling_$ARM.log" 2>&1 || { tail -5 "$R/ceiling_$ARM.log"; fail "convert_check R3"; }
for x in $OLD $ARM; do echo "ceiling $x:"; grep "^|" "$R/ceiling_$x.log"; done | tee -a "$TL"

# ---- 1. collectors: ALL = the shipped readers, R3 = the new ones (records dirs as fit_report.mjs / verdicts.mjs read them)
for sit in $SITS; do
  d=${DATA[$sit]}; G=$R/$sit/$OLD/records; N=$R/$sit/$ARM/records; mkdir -p "$G" "$N"
  stamp "$sit: collectors"
  ( REGISTRY="$REG_OLD" LEGEND_EXT=1 node $F/collect_vss.mjs "$G/vss_arm.jsonl" $sit $d > "$G/log_vss_arm.txt" 2>&1 ) &
  ( REGISTRY="$REG_NEW" CONTEXT="$CTX_NEW" LEGEND_EXT=1 node $F/collect_vss.mjs "$N/vss_arm.jsonl" $sit $d > "$N/log_vss_arm.txt" 2>&1 ) &
  wait
  ( MODEL="$BERT_OLD" CUTS=own THREADS=3 node $F/collect_sop.mjs "$G/sop_arm_%CUT%.jsonl" $sit $d > "$G/log_sop_arm.txt" 2>&1 ) &
  ( MODEL="$BERT_NEW" CUTS=own THREADS=3 node $F/collect_sop.mjs "$N/sop_arm_%CUT%.jsonl" $sit $d > "$N/log_sop_arm.txt" 2>&1 ) &
  ( CUTS=own node $F/collect_rules.mjs "$G/rules_%CUT%.jsonl" $sit $d > "$G/log_rules.txt" 2>&1 ) &
  wait
  cp "$G/rules_own.jsonl" "$N/rules_own.jsonl"
  for x in "$G" "$N"; do for f in vss_arm sop_arm_own rules_own; do [ -s "$x/$f.jsonl" ] || fail "$sit: $x/$f.jsonl is missing (see the logs there)"; done; tail -1 "$x/log_vss_arm.txt" | cut -c1-250 | tee -a "$TL"; done
  # ---- 2. the fit_report of each pair, then the paired verdicts (G = shipped, T = new)
  for arm in $OLD $ARM; do
    ARM="$arm" node $F/fit_report.mjs "$R/$sit/$arm/records" "$R/$sit/$arm/report.md" $d > "$R/$sit/$arm/log_fit_report.txt" 2>&1 || { tail -20 "$R/$sit/$arm/log_fit_report.txt"; fail "$sit fit_report $arm"; }
  done
  node $F/verdicts.mjs --out "$R/$sit/verdicts.md" --json "$R/$sit/verdicts.json" $(for x in $d; do echo --data $x; done) \
    --vss-g "$R/$sit/$OLD/records" --vss-t "$R/$sit/$ARM/records" --bert-g "$R/$sit/$OLD/records" --bert-t "$R/$sit/$ARM/records" > "$R/$sit/log_verdicts.txt" 2>&1
  if [ $? != 0 ]; then   # a reported set too small for its own threshold fit (collected_1: 2026-11-03 dry run, "too few calibration requests")
    case $sit in fresh2|short3) tail -20 "$R/$sit/log_verdicts.txt"; fail "$sit verdicts";;
      *) rm -f "$R/$sit/verdicts.json"; stamp "$sit: verdicts.mjs could not fit VSS / SOP-BERT alone on this set ($(tail -1 "$R/$sit/log_verdicts.txt" | cut -c1-150)); reported as -";;
    esac
  fi
  stamp "$sit: reports written ($R/$sit/{$OLD,$ARM}/report.md, verdicts.md, verdicts.json)"
done

# ---- 3. VSS-BERT shipped: collect_pair records of the shipped models (both cuts), then the shipped combined reader on them (as the demo)
VB=$R/vssbert; mkdir -p "$VB/$OLD/rec" "$VB/$OLD/rec_scenes_test" "$VB/$OLD/rec_collected_1" "$VB/$ARM/rec_scenes_test" "$VB/$ARM/rec_collected_1"
stamp "VSS-BERT shipped: collect_pair"
THREADS=3 node $SK/combine/collect_pair.mjs "$VB/$OLD/rec" refit $F2 $S3 > "$VB/$OLD/rec/log_pair.txt" 2>&1 || { tail -20 "$VB/$OLD/rec/log_pair.txt"; fail "collect_pair shipped"; }
node $SK/combine/failures_vss_bert.mjs "$VB/$OLD/rec" "$VB/$OLD/rows.json" $F2 $S3 > "$VB/$OLD/tally.json" 2> "$VB/$OLD/log.txt" || { cat "$VB/$OLD/log.txt"; fail "failures_vss_bert shipped"; }
tail -2 "$VB/$OLD/log.txt" | tee -a "$TL"
for sit in scenes_test collected_1; do   # failures_vss_bert names every set that is not short3 "fresh2": one records dir and one rows file per set
  THREADS=3 node $SK/combine/collect_pair.mjs "$VB/$OLD/rec_$sit" $sit ${DATA[$sit]} > "$VB/$OLD/rec_$sit/log_pair.txt" 2>&1 || { tail -20 "$VB/$OLD/rec_$sit/log_pair.txt"; fail "collect_pair shipped $sit"; }
  node $SK/combine/failures_vss_bert.mjs "$VB/$OLD/rec_$sit" "$VB/$OLD/rows_$sit.json" ${DATA[$sit]} > "$VB/$OLD/tally_$sit.json" 2> "$VB/$OLD/log_$sit.txt" || { cat "$VB/$OLD/log_$sit.txt"; fail "failures_vss_bert shipped $sit"; }
done

# ---- 4. refit every confidence file on the R3 readers (VSS-BERT variant d2, the same data as the shipped fit), the new VSS-BERT rows with the
# refitted files in place, then keep the copies under docs/model/arms/R3/confidence and restore the shipped ones
stamp "refit.sh on the R3 readers"
CONF_FILES="docs/model/confidence training/sketch/combine/combined_parity.json training/sketch/confidence3/vote3_parity.json"
git diff --quiet -- $CONF_FILES || fail "the shipped confidence files are modified in this checkout; refusing to overwrite them"
REGISTRY="$REG_NEW" MODEL="$BERT_NEW" LEGEND_EXT=1 DATA="$F2 $S3" REC="$R/refit/records" THREADS=3 STAMP=0 COMB_VARIANT=d2 bash training/sketch/confidence3/refit.sh > "$R/refit.log" 2>&1
rc=$?; rc2=1
if [ "$rc" = 0 ]; then
  node $SK/combine/failures_vss_bert.mjs "$R/refit/records" "$VB/$ARM/rows.json" $F2 $S3 > "$VB/$ARM/tally.json" 2> "$VB/$ARM/log.txt"; rc2=$?
  for sit in scenes_test collected_1; do
    [ "$rc2" = 0 ] || break
    REGISTRY="$REG_NEW" MODEL="$BERT_NEW" LEGEND_EXT=1 THREADS=3 node $SK/combine/collect_pair.mjs "$VB/$ARM/rec_$sit" $sit ${DATA[$sit]} > "$VB/$ARM/rec_$sit/log_pair.txt" 2>&1 \
      && node $SK/combine/failures_vss_bert.mjs "$VB/$ARM/rec_$sit" "$VB/$ARM/rows_$sit.json" ${DATA[$sit]} > "$VB/$ARM/tally_$sit.json" 2> "$VB/$ARM/log_$sit.txt"; rc2=$?
  done
fi
cp -r docs/model/confidence/. "$A/confidence/"; cp training/sketch/combine/combined_parity.json training/sketch/confidence3/vote3_parity.json "$A/confidence/" 2>/dev/null
git checkout -- $CONF_FILES
[ "$rc" = 0 ] || { tail -30 "$R/refit.log"; fail "refit.sh (exit $rc); the shipped confidence files are restored"; }
[ "$rc2" = 0 ] || { cat "$VB/$ARM"/log*.txt; fail "failures_vss_bert / collect_pair R3 (see $VB/$ARM)"; }
grep -E "test_|done:|cost|ok$|FAILED" "$R/refit.log" | tail -14 | tee -a "$TL"
tail -2 "$VB/$ARM/log.txt" | tee -a "$TL"
ls -la "$A/confidence" | tee -a "$TL"

# ---- 5. the comparison table and the pre-registered verdict (TRAIN_PLAN_R3.md A.6)
python3 - "$R" "$OLD" "$ARM" <<'PY' || fail "COMPARE.md / VERDICT.md"
import collections, hashlib, json, os, random, sys
R, OLD, NEW = sys.argv[1:4]
SITS = ("fresh2", "short3", "scenes_test", "collected_1"); FITTED = ("fresh2", "short3")   # the sets the confidences are fitted on (cal part)
cal = lambda i: int(hashlib.sha256(i.encode()).hexdigest(), 16) % 3 == 0
f = lambda x: "-" if x is None else f"{x:.1f}"; ci = lambda c: f"[{f(c[0])}, {f(c[1])}]"; pct = lambda x: "-" if x is None else f"{100 * x:.1f}%"
sg = lambda x: ("+" if x >= 0 else "") + f(x)
def rules_score(path, test_only, cost=10):   # the Rules execute everything: (right - cost x (wrong + extras)) / requested actions
    g = r = bad = 0
    for l in open(path):
        x = json.loads(l)
        if test_only and cal(x["id"]): continue
        g += x["gold"]; r += sum(p["o"] == "right" for p in x["rules"]); bad += sum(p["o"] != "right" for p in x["rules"])
    return 100 * (r - cost * bad) / g if g else float("nan"), 100 * r / g if g else float("nan")
def vb_msgs(path, sit):   # VSS-BERT rows (failures_vss_bert.mjs) -> per message: (gold, right, executed wrong + extras executed, executed)
    M = collections.defaultdict(lambda: [0, 0, 0, 0])
    for x in json.load(open(path)):
        if sit in FITTED and (x["part"] != "test" or x["set"] != sit): continue   # fitted sets: the test part; the others: every message
        m = M[x["id"]]; k = x["kind"]
        if k in ("done_right", "executed_wrong", "held_right", "held_wrong", "missed"): m[0] += 1
        if k == "done_right": m[1] += 1; m[3] += 1
        if k in ("executed_wrong", "extra_executed"): m[2] += 1; m[3] += 1
    return M
def cost(ms):
    g = sum(m[0] for m in ms); return 100 * (sum(m[1] for m in ms) - 10 * sum(m[2] for m in ms)) / g if g else float("nan")
def vb_compare(sit, n=1000):
    rows = lambda arm: f"{R}/vssbert/{arm}/rows.json" if sit in FITTED else f"{R}/vssbert/{arm}/rows_{sit}.json"
    A, B = vb_msgs(rows(OLD), sit), vb_msgs(rows(NEW), sit)
    ids = sorted(set(A) | set(B)); z = [0, 0, 0, 0]; rng = random.Random(0); da, db, dd = [], [], []
    for _ in range(n):
        s = [rng.choice(ids) for _ in ids]; a, b = cost([A.get(i, z) for i in s]), cost([B.get(i, z) for i in s]); da.append(a); db.append(b); dd.append(b - a)
    q = lambda v: (sorted(v)[int(0.025 * n)], sorted(v)[int(0.975 * n) - 1])
    def summ(M):
        ms = [M.get(i, z) for i in ids]; ex = sum(m[3] for m in ms); g = sum(m[0] for m in ms)
        return cost(ms), (sum(m[2] for m in ms) / ex if ex else None), (sum(m[1] for m in ms) / g if g else None), g
    sa, sb = summ(A), summ(B)
    return sa, q(da), sb, q(db), sb[0] - sa[0], q(dd), len(ids)
out = [f"# TRAIN_PLAN_R3.md section A: the round-3 readers (arm {NEW}) vs the shipped readers (arm {OLD})\n",
       "Cost score = (requests done right - 10 x (executed wrong + extras executed)) per 100 requested actions. VSS and SOP-BERT alone: each executes",
       "above its own cost-score threshold, fitted out of fold on the set's calibration part (int(sha256(id),16) % 3 == 0) and scored on its test part,",
       "95% intervals from 1000 paired resamples of the test messages (fresh2/verdicts.mjs). VSS-BERT: the demo's combined reader; shipped = the shipped",
       f"models with docs/model/confidence/combined.json, {NEW} = the {NEW} models with the combined.json refit.sh fitted on the calibration part of",
       "fresh2 + short3 (variant d2), both applied by combine/failures_vss_bert.mjs; fresh2 / short3: the test part; scenes_test / collected_1: every",
       "message (no confidence was fitted on them); 1000 paired resamples of the messages (seed 0). The Rules execute everything (same parts).\n",
       f"| set (VSS-BERT messages / requests) | VSS {OLD} | VSS {NEW} | SOP-BERT {OLD} | SOP-BERT {NEW} | VSS-BERT {OLD} | VSS-BERT {NEW} | Rules | VSS {NEW} - {OLD} | SOP-BERT {NEW} - {OLD} | VSS-BERT {NEW} - {OLD} |",
       "|---|---|---|---|---|---|---|---|---|---|---|"]
VB = {}
for sit in SITS:
    V = json.load(open(f"{R}/{sit}/verdicts.json")) if os.path.exists(f"{R}/{sit}/verdicts.json") else None   # None: too small to fit alone
    a = V["arms"] if V else {}
    rs, rr = rules_score(f"{R}/{sit}/{OLD}/records/rules_own.jsonl", sit in FITTED)
    cell = lambda k: "-" if not V else f"{f(a[k]['score'])} {ci(a[k]['ci'])}<br>right {pct(a[k]['done_right'])}, conf. wrong {pct(a[k]['conf_wrong'])}" + (" (asks everything)" if a[k].get('threshold') == "asks everything" else "")
    VB[sit] = (sa, cia, sb, cib, d, cid, nm) = vb_compare(sit)
    vcell = lambda s, c: f"{f(s[0])} {ci(c)}<br>right {pct(s[2])}, conf. wrong {pct(s[1])}"
    out.append(f"| {sit} ({nm} / {sa[3]}) | {cell('VSS-G')} | {cell('VSS-T')} | {cell('BERT-G')} | {cell('BERT-T')} | {vcell(sa, cia)} | {vcell(sb, cib)} | {f(rs)}<br>right {f(rr)}% | "
               + (f"{sg(V['diff']['vss']['point'])} {ci(V['diff']['vss']['ci'])} | {sg(V['diff']['bert']['point'])} {ci(V['diff']['bert']['ci'])} | " if V else "- | - | ") + f"{sg(d)} {ci(cid)} |")
out += ["\nA difference whose interval lies above 0 is a gain shown; an interval below 0 is a loss shown; otherwise not shown either way.",
        "\nThe conversion ceiling (convert_check.py --registry: the share of the requests whose world row reproduces the gold; what a perfect reading of",
        "each world could reach):\n", f"| set | {OLD} | {NEW} |", "|---|---|---|"]
C = {x: {r["folder"]: r for r in json.load(open(f"{R}/ceiling_{x}.json"))["results"]} for x in (OLD, NEW)}
rt = lambda r: f"{100 * r['counts'].get('ok', 0) / max(1, r['requests']):.1f}%"
for k in C[OLD]: out.append(f"| {k} | {rt(C[OLD][k])} | {rt(C[NEW][k]) if k in C[NEW] else '-'} |")
out += [f"\nDetails: <set>/{OLD}/report.md, <set>/{NEW}/report.md, <set>/verdicts.md (G = {OLD}, T = {NEW}), vssbert/{{{OLD},{NEW}}}/rows*.json (VSS-BERT per",
        f"request), refit/records/*_report.md (the refit of the {NEW} confidences)."]
open(f"{R}/COMPARE.md", "w").write("\n".join(out) + "\n"); print("\n".join(out))
# the pre-registered rule (TRAIN_PLAN_R3.md A.6): adopted when the VSS-BERT difference's 95% interval lies above 0 on fresh2 or on scenes_test,
# and below 0 on none of fresh2, short3, scenes_test (collected_1 is reported only: 22 requests per variant)
lo = lambda s: VB[s][5][0] > 0; hi_neg = lambda s: VB[s][5][1] < 0
gain = [s for s in ("fresh2", "scenes_test") if lo(s)]; loss = [s for s in ("fresh2", "short3", "scenes_test") if hi_neg(s)]
verdict = "ADOPT (pre-registered rule met)" if gain and not loss else "NOT ADOPTED (pre-registered rule not met)"
v = [f"# Verdict, arm {NEW} vs {OLD} (TRAIN_PLAN_R3.md A.6)\n", f"**{verdict}**\n",
     f"- VSS-BERT {NEW} - {OLD}, 95% interval: " + "; ".join(f"{s} {sg(VB[s][4])} {ci(VB[s][5])}" for s in SITS),
     f"- gain shown on (fresh2 / scenes_test): {', '.join(gain) or 'none'}; loss shown on (fresh2 / short3 / scenes_test): {', '.join(loss) or 'none'}",
     f"- VSS-BERT confidently wrong (of executed), {OLD} -> {NEW}: " + "; ".join(f"{s} {pct(VB[s][0][1])} -> {pct(VB[s][2][1])}" for s in SITS),
     f"- VSS-BERT done right, {OLD} -> {NEW}: " + "; ".join(f"{s} {pct(VB[s][0][2])} -> {pct(VB[s][2][2])}" for s in SITS)]
open(f"{R}/VERDICT.md", "w").write("\n".join(v) + "\n"); print("\n".join(v))
PY
stamp "COMPARE.md, VERDICT.md written"; stamp "done"; du -sh "$R" "$A/confidence"
git status --short docs/model/micro docs/model/context docs/model/neural docs/model/confidence | head   # must show nothing
