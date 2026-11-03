# AFTER: 084_vss_r3c 082_bert_r3 083_measure_r3
# PATHS: results/085_measure_r3c docs/model/arms/R3C/confidence
# TRAIN_PLAN_R3.md section B, arm R3C, the measurement (CPU only): ONE change measured, VSA_CORR=phase. G = arm R3 (VSS
# docs/model/arms/R3/registry_R3.json, job 081; its confidence files docs/model/arms/R3/confidence, job 083), T = arm R3C (VSS
# docs/model/arms/R3C/registry_R3C.json, job 084: the same cutters, filler, data and settings, the worlds trained with VSA_CORR=phase).
# SOP-BERT is arm R3's (job 082) on both sides, so the SOP-BERT columns are equal by construction (its records are collected once and copied).
# The recipe of job 083 (= 079) on the same four sets: fresh2, short3 (no pending wire), scenes_test, collected_1; VSS-BERT of R3 = R3's models with
# R3's refitted confidence files (put in place for the scoring, then restored); VSS-BERT of R3C = refit.sh on the R3C VSS + R3 SOP-BERT
# (DATA = fresh2 + the filtered short3, COMB_VARIANT=d2), copied to docs/model/arms/R3C/confidence. $R/COMPARE.md as 083; $R/VERDICT.md applies the
# pre-registered rule of TRAIN_PLAN_R3.md B.4; $R/corr_cosine.md: each world's training cosine before / after the correction.
# Expected time: as 083 (~10-15 min), minus one SOP-BERT collection per set.
set -uo pipefail
ARM=R3C; JOB=085_measure_r3c; OLD=R3
export PATH="$HOME/vss-box/venv/bin:$PATH" TOKENIZERS_PARALLELISM=false
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then export PATH="$HOME/vss-box/node/bin:$PATH"; fi
ROOT=$PWD; A=docs/model/arms/$ARM; R=results/$JOB; F=training/sketch/fresh2; SK=training/sketch
REG_NEW=$A/registry_$ARM.json; CTX_NEW=$A/context/weights.json; REG_OLD=docs/model/arms/$OLD/registry_$OLD.json; CTX_OLD=docs/model/arms/$OLD/context/weights.json
BERT_OLD=docs/model/arms/$OLD/neural/sop-bert-$OLD; BERT_NEW=$BERT_OLD; CONF_OLD=docs/model/arms/$OLD/confidence   # SOP-BERT: arm R3's on both sides
mkdir -p "$R/data/short3" "$A/confidence"
TL=$R/timings.txt; T0=$(date +%s)
stamp() { echo "[$(date +%T) +$(( $(date +%s) - T0 ))s] $*" | tee -a "$TL"; }
fail() { stamp "FAILED: $*"; exit 1; }
for f in "$REG_NEW" "$CTX_NEW" "$CTX_OLD" "$BERT_OLD/config.json" "$REG_OLD" $CONF_OLD/{vss,sop-bert,combined,vote3}.json; do [ -f "$f" ] || fail "missing $f (jobs 081 / 082 / 083 / 084)"; done
grep -q '"VSA_CORR": "phase"' "$REG_NEW" && ! grep -q '"VSA_CORR"' "$REG_OLD" || fail "$REG_NEW is not arm R3C or $REG_OLD is not arm R3"
cmp -s docs/model/arms/$OLD/cutter_worlds8s.json $A/cutter_worlds8s.json && cmp -s docs/model/arms/$OLD/cutter_events8.json $A/cutter_events8.json && cmp -s "$CTX_OLD" "$CTX_NEW" || fail "arm $ARM does not share arm $OLD's cutters / filler (one change only)"
python3 - docs/model/arms/$OLD/micro "$A/micro" <<'PY' | tee -a "$TL" "$R/corr_cosine.md" || fail "the worlds of R3 and R3C differ in more than VSA_CORR"
import glob, json, os, sys
old, new = sys.argv[1:3]; bad = []
print("| world | rows R3 / R3C | R3C train cosine before -> after the correction | held-out formulations before -> after |\n|---|---|---|---|")
for f in sorted(glob.glob(os.path.join(old, "*", "BUILD.json"))):
    w = os.path.basename(os.path.dirname(f)); a = json.load(open(f)); b = json.load(open(os.path.join(new, w, "BUILD.json")))
    diff = {k for k in set(a) | set(b) if a.get(k) != b.get(k)} - {"world", "command", "run_log", "VSA_CORR"}
    if diff or b.get("VSA_CORR") != "phase" or a.get("VSA_CORR") or not (a.get("GAP_ROLE") == b.get("GAP_ROLE") == "1"): bad.append(f"{w}: {sorted(diff)}")
    c = (json.load(open(os.path.join(new, w, "model.json")))["config"].get("correction") or {}).get("cosine") or {}
    pick = lambda k: next((v for n, v in c.items() if k in n), {})
    tr, ho = pick("train"), pick("formulation")
    print(f"| {w} | {a.get('rows')} / {b.get('rows')} | {tr.get('mean_cos_before')} -> {tr.get('mean_cos_after')} | {ho.get('mean_cos_before')} -> {ho.get('mean_cos_after')} |")
print("settings check:", "same except VSA_CORR" if not bad else "DIFFER " + "; ".join(bad)); sys.exit(1 if bad or len(glob.glob(os.path.join(old, "*", "BUILD.json"))) != 9 else 0)
PY
(cd training/laptop && npm install --no-audit --no-fund >/dev/null)
grep -q "^function same(type, act, el)" docs/js/bench-canon.js && grep -q "^const listFree" docs/js/vote-confidence.js \
  || fail "docs/js/bench-canon.js / vote-confidence.js predate NEW_FORMS_AUDIT.md: merge main into gpu-runs first"
node $SK/confidence3/audit_new_forms.mjs > "$R/audit_new_forms.md" 2>&1 || fail "audit_new_forms.mjs"
grep "^In all" "$R/audit_new_forms.md" | tee -a "$TL"

# ---- data (as 083): fresh2 as is; short3 without the messages that still hold a pending wire; scenes_test and collected_1 as they are (no pending wire)
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

# ---- 0. the conversion ceiling of the R3 and of the R3C worlds (the same data and fronts, so it must be the same: a check that only the
# route books differ)
LEGEND_EXT=1 DIAGRAM_OPS=1 GAP_ROLE=1 python3 $SK/convert_check.py --registry "$REG_OLD" --no-base --tests --json "$R/ceiling_$OLD.json" llm_bench/scenes_test llm_bench/collected_1 > "$R/ceiling_$OLD.log" 2>&1 || { tail -5 "$R/ceiling_$OLD.log"; fail "convert_check R3"; }
LEGEND_EXT=1 DIAGRAM_OPS=1 GAP_ROLE=1 python3 $SK/convert_check.py --registry "$REG_NEW" --no-base --tests --json "$R/ceiling_$ARM.json" llm_bench/scenes_test llm_bench/collected_1 > "$R/ceiling_$ARM.log" 2>&1 || { tail -5 "$R/ceiling_$ARM.log"; fail "convert_check R3C"; }
for x in $OLD $ARM; do echo "ceiling $x:"; grep "^|" "$R/ceiling_$x.log"; done | tee -a "$TL"

# ---- 1. collectors: R3 = G, R3C = T (SOP-BERT is the same model on both sides: collected once, copied) (records dirs as fit_report.mjs / verdicts.mjs read them)
for sit in $SITS; do
  d=${DATA[$sit]}; G=$R/$sit/$OLD/records; N=$R/$sit/$ARM/records; mkdir -p "$G" "$N"
  stamp "$sit: collectors"
  ( REGISTRY="$REG_OLD" CONTEXT="$CTX_OLD" LEGEND_EXT=1 node $F/collect_vss.mjs "$G/vss_arm.jsonl" $sit $d > "$G/log_vss_arm.txt" 2>&1 ) &
  ( REGISTRY="$REG_NEW" CONTEXT="$CTX_NEW" LEGEND_EXT=1 node $F/collect_vss.mjs "$N/vss_arm.jsonl" $sit $d > "$N/log_vss_arm.txt" 2>&1 ) &
  wait
  ( MODEL="$BERT_OLD" CUTS=own THREADS=3 node $F/collect_sop.mjs "$G/sop_arm_%CUT%.jsonl" $sit $d > "$G/log_sop_arm.txt" 2>&1 ) &
  ( CUTS=own node $F/collect_rules.mjs "$G/rules_%CUT%.jsonl" $sit $d > "$G/log_rules.txt" 2>&1 ) &
  wait
  cp "$G/rules_own.jsonl" "$N/rules_own.jsonl"; cp "$G/sop_arm_own.jsonl" "$N/sop_arm_own.jsonl"; cp "$G/log_sop_arm.txt" "$N/log_sop_arm.txt"
  for x in "$G" "$N"; do for f in vss_arm sop_arm_own rules_own; do [ -s "$x/$f.jsonl" ] || fail "$sit: $x/$f.jsonl is missing (see the logs there)"; done; tail -1 "$x/log_vss_arm.txt" | cut -c1-250 | tee -a "$TL"; done
  # ---- 2. the fit_report of each pair, then the paired verdicts (G = R3, T = R3C)
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

# ---- 3. VSS-BERT of R3: collect_pair records of the R3 models (both cuts), then the R3 combined reader on them (as the demo would with arm R3):
# arm R3's confidence files (job 083) are put in place of the shipped ones for the scoring and the shipped ones restored right after
CONF_FILES="docs/model/confidence training/sketch/combine/combined_parity.json training/sketch/confidence3/vote3_parity.json"
git diff --quiet -- $CONF_FILES || fail "the shipped confidence files are modified in this checkout; refusing to overwrite them"
cp $CONF_OLD/vss.json $CONF_OLD/sop-bert.json $CONF_OLD/combined.json $CONF_OLD/vote3.json docs/model/confidence/
VB=$R/vssbert; mkdir -p "$VB/$OLD/rec" "$VB/$OLD/rec_scenes_test" "$VB/$OLD/rec_collected_1" "$VB/$ARM/rec_scenes_test" "$VB/$ARM/rec_collected_1"
stamp "VSS-BERT R3: collect_pair"
REGISTRY="$REG_OLD" MODEL="$BERT_OLD" LEGEND_EXT=1 THREADS=3 node $SK/combine/collect_pair.mjs "$VB/$OLD/rec" refit $F2 $S3 > "$VB/$OLD/rec/log_pair.txt" 2>&1 || { tail -20 "$VB/$OLD/rec/log_pair.txt"; git checkout -- $CONF_FILES; fail "collect_pair R3"; }
node $SK/combine/failures_vss_bert.mjs "$VB/$OLD/rec" "$VB/$OLD/rows.json" $F2 $S3 > "$VB/$OLD/tally.json" 2> "$VB/$OLD/log.txt" || { cat "$VB/$OLD/log.txt"; git checkout -- $CONF_FILES; fail "failures_vss_bert R3"; }
tail -2 "$VB/$OLD/log.txt" | tee -a "$TL"
for sit in scenes_test collected_1; do   # failures_vss_bert names every set that is not short3 "fresh2": one records dir and one rows file per set
  REGISTRY="$REG_OLD" MODEL="$BERT_OLD" LEGEND_EXT=1 THREADS=3 node $SK/combine/collect_pair.mjs "$VB/$OLD/rec_$sit" $sit ${DATA[$sit]} > "$VB/$OLD/rec_$sit/log_pair.txt" 2>&1 || { tail -20 "$VB/$OLD/rec_$sit/log_pair.txt"; git checkout -- $CONF_FILES; fail "collect_pair R3 $sit"; }
  node $SK/combine/failures_vss_bert.mjs "$VB/$OLD/rec_$sit" "$VB/$OLD/rows_$sit.json" ${DATA[$sit]} > "$VB/$OLD/tally_$sit.json" 2> "$VB/$OLD/log_$sit.txt" || { cat "$VB/$OLD/log_$sit.txt"; git checkout -- $CONF_FILES; fail "failures_vss_bert R3 $sit"; }
done
git checkout -- $CONF_FILES

# ---- 4. refit every confidence file on the R3C readers (R3C VSS + R3 SOP-BERT; variant d2, the same data as R3's fit), the R3C VSS-BERT rows
# with the refitted files in place, then keep the copies under docs/model/arms/R3C/confidence and restore the shipped ones
stamp "refit.sh on the R3C readers"
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
[ "$rc2" = 0 ] || { cat "$VB/$ARM"/log*.txt; fail "failures_vss_bert / collect_pair R3C (see $VB/$ARM)"; }
grep -E "test_|done:|cost|ok$|FAILED" "$R/refit.log" | tail -14 | tee -a "$TL"
tail -2 "$VB/$ARM/log.txt" | tee -a "$TL"
ls -la "$A/confidence" | tee -a "$TL"

# ---- 5. the comparison table and the pre-registered verdict (TRAIN_PLAN_R3.md B.4)
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
out = [f"# TRAIN_PLAN_R3.md section B: arm {NEW} (arm {OLD} + VSA_CORR=phase) vs arm {OLD}; SOP-BERT is arm {OLD}'s on both sides\n",
       "Cost score = (requests done right - 10 x (executed wrong + extras executed)) per 100 requested actions. VSS and SOP-BERT alone: each executes",
       "above its own cost-score threshold, fitted out of fold on the set's calibration part (int(sha256(id),16) % 3 == 0) and scored on its test part,",
       f"95% intervals from 1000 paired resamples of the test messages (fresh2/verdicts.mjs). VSS-BERT: the demo's combined reader; {OLD} = the {OLD}",
       f"models with arm {OLD}'s combined.json (job 083), {NEW} = the {NEW} models with the combined.json refit.sh fitted on the calibration part of",
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
# the pre-registered rule (TRAIN_PLAN_R3.md B.4): the same rule as A.6, R3C against R3: adopted when the VSS-BERT difference's 95% interval
# lies above 0 on fresh2 or on scenes_test, and below 0 on none of fresh2, short3, scenes_test (collected_1 is reported only)
lo = lambda s: VB[s][5][0] > 0; hi_neg = lambda s: VB[s][5][1] < 0
gain = [s for s in ("fresh2", "scenes_test") if lo(s)]; loss = [s for s in ("fresh2", "short3", "scenes_test") if hi_neg(s)]
verdict = "ADOPT (pre-registered rule met)" if gain and not loss else "NOT ADOPTED (pre-registered rule not met)"
v = [f"# Verdict, arm {NEW} vs {OLD} (TRAIN_PLAN_R3.md B.4)\n", f"**{verdict}**\n",
     f"- VSS-BERT {NEW} - {OLD}, 95% interval: " + "; ".join(f"{s} {sg(VB[s][4])} {ci(VB[s][5])}" for s in SITS),
     f"- gain shown on (fresh2 / scenes_test): {', '.join(gain) or 'none'}; loss shown on (fresh2 / short3 / scenes_test): {', '.join(loss) or 'none'}",
     f"- VSS-BERT confidently wrong (of executed), {OLD} -> {NEW}: " + "; ".join(f"{s} {pct(VB[s][0][1])} -> {pct(VB[s][2][1])}" for s in SITS),
     f"- VSS-BERT done right, {OLD} -> {NEW}: " + "; ".join(f"{s} {pct(VB[s][0][2])} -> {pct(VB[s][2][2])}" for s in SITS),
     f"- VSS alone {NEW} - {OLD} (reported, not the rule): " + "; ".join(f"{s} {sg(json.load(open(f'{R}/{s}/verdicts.json'))['diff']['vss']['point'])} {ci(json.load(open(f'{R}/{s}/verdicts.json'))['diff']['vss']['ci'])}" for s in SITS if os.path.exists(f'{R}/{s}/verdicts.json')),
     "", open(f"{R}/corr_cosine.md").read()]
open(f"{R}/VERDICT.md", "w").write("\n".join(v) + "\n"); print("\n".join(v))
PY
stamp "COMPARE.md, VERDICT.md written"; stamp "done"; du -sh "$R" "$A/confidence"
git status --short docs/model/micro docs/model/context docs/model/neural docs/model/confidence | head   # must show nothing
