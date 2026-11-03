# AFTER: 078_vss_round2_resume2 074_bert_round2
# PATHS: results/079_measure_round2 docs/model/arms/R2/confidence
# TRAIN_PLAN_R2.md, arm R2, the measurement (CPU only): the round-2 readers (VSS: docs/model/arms/R2/registry_R2.json, job 073; SOP-BERT:
# docs/model/arms/R2/neural/sop-bert-R2, job 074) against the SHIPPED readers (arm ALL since 220295a: docs/model/micro/registry.json,
# docs/model/neural/sop-bert, docs/model/confidence), on
#   - fresh2: the four Opus writer folders llm_bench/fresh2/opus_{a,b,c,d} (405 long realistic messages nobody trained on);
#   - short3: llm_bench/short3 without the messages that still hold a "pending" wire (as job 072; filtered copy in $R/data/short3).
# Steps:
#   -. guards: the scorer / vote hold the NEW_FORMS_AUDIT fixes; audit_new_forms.mjs -> $R/audit_new_forms.md;
#   0. the conversion ceiling (convert_check.py --registry) of the shipped worlds and of the R2 worlds on short3 / fresh2;
#   1. collectors (fresh2/collect_vss.mjs, collect_sop.mjs CUTS=own, collect_rules.mjs CUTS=own) for the 4 learned readers + the Rules;
#   2. per situation, fit_report.mjs for the shipped pair (ALL) and the new pair (R2), then verdicts.mjs (G = shipped, T = new: the same fit
#      recipe, the cost-score threshold fitted out of fold on the calibration part, int(sha256(id),16) % 3 == 0; 1000 paired resamples of the
#      test messages) with --json;
#   3. VSS-BERT (the demo's first reader): the shipped VSS-BERT = combine/collect_pair.mjs records of the shipped models + the shipped
#      combined.json / vss.json; the new VSS-BERT = the records refit.sh collects for the R2 models + the combined.json / vss.json it fits
#      (COMB_VARIANT=d2, as shipped). combine/failures_vss_bert.mjs applies each exactly as the demo does; the test part's cost score of both
#      and their paired difference come from 1000 resamples of the test messages (seed 0, the same draws for both);
#   4. confidence3/refit.sh on the R2 readers (REGISTRY / MODEL of arm R2, DATA = fresh2 + the filtered short3, COMB_VARIANT=d2, STAMP=0): every
#      confidence file (vss.json, sop-bert.json, combined.json, vote3.json) and the parity fixtures are refitted; they are copied to
#      docs/model/arms/R2/confidence/ and the shipped ones are restored (git checkout), so docs/model/confidence stays the shipped readers';
#   5. $R/COMPARE.md: rows = situations, columns = readers (VSS, SOP-BERT, VSS-BERT: shipped and R2; the Rules executing everything), cost score
#      on the test part [95% CI], the paired differences R2 - shipped [95% CI], and the conversion ceilings.
# Expected time on the GPU machine's CPU: as job 072 (~20-25 min) + the shipped VSS-BERT records (~3 min): ~25-30 min.
set -uo pipefail
ARM=R2; JOB=079_measure_round2
export PATH="$HOME/vss-box/venv/bin:$PATH" TOKENIZERS_PARALLELISM=false
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then export PATH="$HOME/vss-box/node/bin:$PATH"; fi
ROOT=$PWD; A=docs/model/arms/$ARM; R=results/$JOB; F=training/sketch/fresh2; SK=training/sketch
REG_NEW=$A/registry_$ARM.json; CTX_NEW=$A/context/weights.json; BERT_NEW=$A/neural/sop-bert-$ARM; BERT_OLD=docs/model/neural/sop-bert; REG_OLD=docs/model/micro/registry.json
mkdir -p "$R/data/short3" "$A/confidence"
TL=$R/timings.txt; T0=$(date +%s)
stamp() { echo "[$(date +%T) +$(( $(date +%s) - T0 ))s] $*" | tee -a "$TL"; }
fail() { stamp "FAILED: $*"; exit 1; }
for f in "$REG_NEW" "$CTX_NEW" "$BERT_NEW/config.json" "$BERT_OLD/config.json" "$REG_OLD" docs/model/confidence/combined.json; do [ -f "$f" ] || fail "missing $f (jobs 073 / 074)"; done
grep -q '"VAL_PICK": "specific"' "$REG_OLD" || fail "docs/model/micro/registry.json is not arm ALL (the shipped readers this job compares with)"
(cd training/laptop && npm install --no-audit --no-fund >/dev/null)
# the scorer and the vote with the engine-true equivalences of the new forms (training/sketch/confidence3/NEW_FORMS_AUDIT.md, 2026-11-03): without
# them help (aspect overview / topic general / about), whole-drawing operations ("every shape" two ways, target order), chains (pairing=chain) and
# arrow restyles (quantifier) are scored wrong, and the readers disagree, where logic.js does the same thing. Then the audit itself (~40 s, CPU).
grep -q "^function same(type, act, el)" docs/js/bench-canon.js && grep -q "^const listFree" docs/js/vote-confidence.js \
  || fail "docs/js/bench-canon.js / vote-confidence.js predate NEW_FORMS_AUDIT.md: merge main into gpu-runs first"
node $SK/confidence3/audit_new_forms.mjs > "$R/audit_new_forms.md" 2>&1 || fail "audit_new_forms.mjs"
grep "^In all" "$R/audit_new_forms.md" | tee -a "$TL"

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

# ---- 0. the conversion ceiling of the shipped (arm ALL) and of the R2 worlds: the share of the short3 / fresh2 requests whose world row (each
# world's own front.json and BUILD.json settings, NEW_DISTINCT included) reproduces the gold through the browser adapter (2026-11-03, the fronts
# convert_check learns itself: arm ALL's settings short3 61.0%, fresh2 74.2%; R2's settings and data short3 63.8%, fresh2 76.5%)
LEGEND_EXT=1 DIAGRAM_OPS=1 python3 $SK/convert_check.py --registry "$REG_OLD" --no-base --tests --json "$R/ceiling_ALL.json" > "$R/ceiling_ALL.log" 2>&1 || { tail -5 "$R/ceiling_ALL.log"; fail "convert_check shipped"; }
LEGEND_EXT=1 DIAGRAM_OPS=1 python3 $SK/convert_check.py --registry "$REG_NEW" --no-base --tests --json "$R/ceiling_R2.json" > "$R/ceiling_R2.log" 2>&1 || { tail -5 "$R/ceiling_R2.log"; fail "convert_check R2"; }
for x in ALL R2; do echo "ceiling $x:"; grep "^|" "$R/ceiling_$x.log"; done | tee -a "$TL"

# ---- 1. collectors: ALL = the shipped readers, R2 = the new ones (records dirs as fit_report.mjs / verdicts.mjs read them)
for sit in fresh2 short3; do
  d=${DATA[$sit]}; G=$R/$sit/ALL/records; N=$R/$sit/R2/records; mkdir -p "$G" "$N"
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
  for arm in ALL R2; do
    ARM="$arm" node $F/fit_report.mjs "$R/$sit/$arm/records" "$R/$sit/$arm/report.md" $d > "$R/$sit/$arm/log_fit_report.txt" 2>&1 || { tail -20 "$R/$sit/$arm/log_fit_report.txt"; fail "$sit fit_report $arm"; }
  done
  node $F/verdicts.mjs --out "$R/$sit/verdicts.md" --json "$R/$sit/verdicts.json" $(for x in $d; do echo --data $x; done) \
    --vss-g "$R/$sit/ALL/records" --vss-t "$R/$sit/R2/records" --bert-g "$R/$sit/ALL/records" --bert-t "$R/$sit/R2/records" > "$R/$sit/log_verdicts.txt" 2>&1 \
    || { tail -20 "$R/$sit/log_verdicts.txt"; fail "$sit verdicts"; }
  stamp "$sit: reports written ($R/$sit/{ALL,R2}/report.md, verdicts.md, verdicts.json)"
done

# ---- 3a. VSS-BERT shipped: collect_pair records of the shipped models (both cuts), then the shipped combined reader on them (as the demo)
VB=$R/vssbert; mkdir -p "$VB/ALL/rec" "$VB/R2"
stamp "VSS-BERT shipped: collect_pair"
THREADS=3 node $SK/combine/collect_pair.mjs "$VB/ALL/rec" refit $F2 $S3 > "$VB/ALL/rec/log_pair.txt" 2>&1 || { tail -20 "$VB/ALL/rec/log_pair.txt"; fail "collect_pair shipped"; }
node $SK/combine/failures_vss_bert.mjs "$VB/ALL/rec" "$VB/ALL/rows.json" $F2 $S3 > "$VB/ALL/tally.json" 2> "$VB/ALL/log.txt" || { cat "$VB/ALL/log.txt"; fail "failures_vss_bert shipped"; }
tail -2 "$VB/ALL/log.txt" | tee -a "$TL"

# ---- 4. refit every confidence file on the R2 readers (VSS-BERT variant d2), the new VSS-BERT rows with the refitted files in place, then keep
# the copies under docs/model/arms/R2/confidence and restore the shipped ones
stamp "refit.sh on the R2 readers"
CONF_FILES="docs/model/confidence training/sketch/combine/combined_parity.json training/sketch/confidence3/vote3_parity.json"
git diff --quiet -- $CONF_FILES || fail "the shipped confidence files are modified in this checkout; refusing to overwrite them"
REGISTRY="$REG_NEW" MODEL="$BERT_NEW" LEGEND_EXT=1 DATA="$F2 $S3" REC="$R/refit/records" THREADS=3 STAMP=0 COMB_VARIANT=d2 bash training/sketch/confidence3/refit.sh > "$R/refit.log" 2>&1
rc=$?
if [ "$rc" = 0 ]; then
  node $SK/combine/failures_vss_bert.mjs "$R/refit/records" "$VB/R2/rows.json" $F2 $S3 > "$VB/R2/tally.json" 2> "$VB/R2/log.txt"; rc2=$?
fi
cp -r docs/model/confidence/. "$A/confidence/"; cp training/sketch/combine/combined_parity.json training/sketch/confidence3/vote3_parity.json "$A/confidence/" 2>/dev/null
git checkout -- $CONF_FILES
[ "$rc" = 0 ] || { tail -30 "$R/refit.log"; fail "refit.sh (exit $rc); the shipped confidence files are restored"; }
[ "${rc2:-1}" = 0 ] || { cat "$VB/R2/log.txt"; fail "failures_vss_bert R2"; }
grep -E "test_|done:|cost|ok$|FAILED" "$R/refit.log" | tail -14 | tee -a "$TL"
tail -2 "$VB/R2/log.txt" | tee -a "$TL"
ls -la "$A/confidence" | tee -a "$TL"

# ---- 5. the comparison table: rows = situations, columns = readers, cost score on the test part, paired bootstrap of R2 - shipped
python3 - "$R" <<'PY' | tee "$R/COMPARE.md" || fail "COMPARE.md"
import collections, hashlib, json, random, sys
R = sys.argv[1]
cal = lambda i: int(hashlib.sha256(i.encode()).hexdigest(), 16) % 3 == 0
f = lambda x: "-" if x is None else f"{x:.1f}"; ci = lambda c: f"[{f(c[0])}, {f(c[1])}]"; pct = lambda x: "-" if x is None else f"{100 * x:.1f}%"
sg = lambda x: ("+" if x >= 0 else "") + f(x)
def rules_score(path, cost=10):   # the Rules execute everything: (right - cost x (wrong + extras)) / requested actions, test part
    g = r = bad = 0
    for l in open(path):
        x = json.loads(l)
        if cal(x["id"]): continue
        g += x["gold"]; r += sum(p["o"] == "right" for p in x["rules"]); bad += sum(p["o"] != "right" for p in x["rules"])
    return 100 * (r - cost * bad) / g if g else float("nan"), 100 * r / g if g else float("nan")
def vb_msgs(path, sit):   # VSS-BERT rows (failures_vss_bert.mjs) -> per test message: (gold, right, executed wrong + extras executed, executed)
    M = collections.defaultdict(lambda: [0, 0, 0, 0])
    for x in json.load(open(path)):
        if x["part"] != "test" or x["set"] != sit: continue
        m = M[x["id"]]; k = x["kind"]
        if k in ("done_right", "executed_wrong", "held_right", "held_wrong", "missed"): m[0] += 1
        if k == "done_right": m[1] += 1; m[3] += 1
        if k in ("executed_wrong", "extra_executed"): m[2] += 1; m[3] += 1
    return M
def cost(ms):
    g = sum(m[0] for m in ms); return 100 * (sum(m[1] for m in ms) - 10 * sum(m[2] for m in ms)) / g if g else float("nan")
def vb_compare(sit, n=1000):
    A, B = vb_msgs(f"{R}/vssbert/ALL/rows.json", sit), vb_msgs(f"{R}/vssbert/R2/rows.json", sit)
    ids = sorted(set(A) | set(B)); z = [0, 0, 0, 0]; rng = random.Random(0); da, db, dd = [], [], []
    for _ in range(n):
        s = [rng.choice(ids) for _ in ids]; a, b = cost([A.get(i, z) for i in s]), cost([B.get(i, z) for i in s]); da.append(a); db.append(b); dd.append(b - a)
    q = lambda v: (sorted(v)[int(0.025 * n)], sorted(v)[int(0.975 * n) - 1])
    def summ(M):
        ms = [M.get(i, z) for i in ids]; ex = sum(m[3] for m in ms); g = sum(m[0] for m in ms)
        return cost(ms), (sum(m[2] for m in ms) / ex if ex else None), (sum(m[1] for m in ms) / g if g else None)
    return summ(A), q(da), summ(B), q(db), cost([B.get(i, z) for i in ids]) - cost([A.get(i, z) for i in ids]), q(dd), len(ids)
print("# TRAIN_PLAN_R2.md: the round-2 readers (arm R2) vs the shipped readers (arm ALL), cost score on the test part\n")
print("Cost score = (requests done right - 10 x (executed wrong + extras executed)) per 100 requested actions. VSS and SOP-BERT alone: each executes")
print("above its own cost-score threshold, fitted out of fold on the situation's calibration part (int(sha256(id),16) % 3 == 0), 95% intervals from")
print("1000 paired resamples of the test messages (fresh2/verdicts.mjs). VSS-BERT: the demo's combined reader, shipped = the shipped models with")
print("docs/model/confidence/combined.json, R2 = the R2 models with the combined.json refit.sh fitted on the calibration part (variant d2), both")
print("applied by combine/failures_vss_bert.mjs; 1000 paired resamples of the test messages (seed 0). The Rules execute everything.\n")
print("| situation (test messages / requests) | VSS shipped | VSS R2 | SOP-BERT shipped | SOP-BERT R2 | VSS-BERT shipped | VSS-BERT R2 | Rules | VSS R2 - shipped | SOP-BERT R2 - shipped | VSS-BERT R2 - shipped |")
print("|---|---|---|---|---|---|---|---|---|---|---|")
for sit in ("fresh2", "short3"):
    V = json.load(open(f"{R}/{sit}/verdicts.json")); a = V["arms"]
    rs, rr = rules_score(f"{R}/{sit}/ALL/records/rules_own.jsonl")
    cell = lambda k: f"{f(a[k]['score'])} {ci(a[k]['ci'])}<br>right {pct(a[k]['done_right'])}, conf. wrong {pct(a[k]['conf_wrong'])}" + (" (asks everything)" if a[k].get('threshold') == "asks everything" else "")
    (sa, cia, sb, cib, d, cid, nm) = vb_compare(sit)
    vcell = lambda s, c: f"{f(s[0])} {ci(c)}<br>right {pct(s[2])}, conf. wrong {pct(s[1])}"
    print(f"| {sit} ({V['test_messages']} / {V['test_requests']}) | {cell('VSS-G')} | {cell('VSS-T')} | {cell('BERT-G')} | {cell('BERT-T')} | {vcell(sa, cia)} | {vcell(sb, cib)} | {f(rs)}<br>right {f(rr)}% | "
          f"{sg(V['diff']['vss']['point'])} {ci(V['diff']['vss']['ci'])} | {sg(V['diff']['bert']['point'])} {ci(V['diff']['bert']['ci'])} | {sg(d)} {ci(cid)} |")
print("\nA difference whose interval lies above 0 is a gain shown; an interval below 0 is a loss shown; otherwise not shown either way.")
print("\nThe conversion ceiling (convert_check.py --registry: the share of the requests whose world row reproduces the gold; what a perfect reading of")
print("each world could reach):\n")
print("| set | shipped (arm ALL) | R2 |\n|---|---|---|")
C = {x: {r["folder"]: r for r in json.load(open(f"{R}/ceiling_{x}.json"))["results"]} for x in ("ALL", "R2")}
for k in C["ALL"]:
    rt = lambda r: f"{100 * r['counts'].get('ok', 0) / max(1, r['requests']):.1f}%"
    print(f"| {k} | {rt(C['ALL'][k])} | {rt(C['R2'][k]) if k in C['R2'] else '-'} |")
print("\nDetails: <situation>/ALL/report.md (shipped), <situation>/R2/report.md (new), <situation>/verdicts.md (G = shipped, T = R2),")
print("vssbert/{ALL,R2}/rows.json (VSS-BERT per request), refit/records/*_report.md (the refit of the R2 confidences).")
PY
stamp "COMPARE.md written"; stamp "done"; du -sh "$R" "$A/confidence"
git status --short docs/model/micro docs/model/context docs/model/neural docs/model/confidence | head   # must show nothing
