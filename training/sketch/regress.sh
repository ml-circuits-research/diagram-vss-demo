#!/bin/bash
# regress.sh: the regression command. Run it before ANY commit that touches reader code (docs/js/logic.js, vss-*.js, front.js, spell.js, neural.js,
# the models under docs/model/) and put its table in the commit message. About 3 minutes of CPU (the two long runs go in parallel; 3-7 minutes on a loaded machine).
#   bash training/sketch/regress.sh [out_dir]       out_dir keeps the raw outputs (default: a temporary folder, removed at the end)
# What it runs (Rules and VSS, the default registry docs/model/micro/registry.json, PAIR=value; every number per gold request: right / wrong /
# not done in % of the gold requests, + extra = requests nobody asked for):
#   sample        the fixed 1000-message sample, 4858 gold requests (training/sketch/eval/sample1000, built by eval/make_sample.py)
#   short: templates   hand, blind, broad, seen, new_identities, heldout_formulations (docs/bench): written or generated from the rules' own
#                 templates, so they favour the Rules reader
#   short: llm_short   3000 one-line commands written by LLM agents, with spans (llm_train/{sonnet,haiku}_short): realistic; the VSS cutter
#                 was trained on them
#   rules sets    score_rules.mjs (the demo Benchmark's per-row score, Rules only): hand 38/40 ... in the line "rules sets"
#   tests         test_diagram_ops.mjs, test_editor_history.mjs (pass / fail)
#   VSS gated     the same three sets, VSS executing a request only when its combined confidence clears the 97% threshold of PRECISION.md
#                 (GATE=97 of llm_score.mjs / short_bench.mjs; model docs/model/confidence/vss.json, as the demo): precision of execution,
#                 right % of the gold requests, asked %, unread %, extras executed. The ungated rows above are unchanged.
# It does not change any file of the repository.
set -u
cd "$(dirname "$0")/../.."
OUT=${1:-$(mktemp -d)}; mkdir -p "$OUT"
[ -d training/sketch/eval/sample1000 ] || python3 training/sketch/eval/make_sample.py > /dev/null
( GATE=97 PAIR=value SEG=composer node training/sketch/llm_score.mjs > "$OUT/sample.txt" 2>&1 ) &
( GATE=97 node training/sketch/short_bench/short_bench.mjs "$OUT/short.json" > "$OUT/short.log" 2>&1 && python3 training/sketch/short_bench/agg.py "$OUT/short.json" > "$OUT/short.txt" 2>&1 ) &
node training/sketch/score_rules.mjs "$PWD/docs/js/logic.js" > "$OUT/rules_sets.txt" 2>&1
( node training/sketch/test_diagram_ops.mjs > "$OUT/test_ops.txt" 2>&1; echo "exit $?" >> "$OUT/test_ops.txt" )
( node training/sketch/test_editor_history.mjs > "$OUT/test_hist.txt" 2>&1; echo "exit $?" >> "$OUT/test_hist.txt" )
wait
python3 - "$OUT" <<'E'
import re, sys, os
O = sys.argv[1]
def rd(n):
    try: return open(os.path.join(O, n)).read()
    except OSError: return ""
rows = []
s = rd("sample.txt")
m = re.search(r"^ALL \(.*?: (\d+) messages, (\d+) gold wires\n\s+rules correct ([\d.]+)% · not done ([\d.]+)% · done wrong ([\d.]+)% · plus (\d+) extra.*\n\s+vss\s+correct ([\d.]+)% · not done ([\d.]+)% · done wrong ([\d.]+)% · plus (\d+) extra", s, re.M)
if m:
    n, g, r1, d1, w1, e1, r2, d2, w2, e2 = m.groups()
    rows.append((f"sample ({n} msgs)", g, (r1, w1, d1, e1), (r2, w2, d2, e2)))
else: rows.append(("sample", "?", None, None))
t = rd("short.txt")
for grp, label in (("templates", "short: templates*"), ("llm_short", "short: llm_short")):
    a = re.search(rf"^ALL {grp} rules ([\d.]+)/([\d.]+)/([\d.]+) .*extra (\d+)", t, re.M); b = re.search(rf"^ALL {grp} vss ([\d.]+)/([\d.]+)/([\d.]+) .*extra (\d+)", t, re.M)
    blk = t.split("== " + grp)[1].split("== ")[0] if ("== " + grp) in t else ""
    g = sum(int(x) for x in re.findall(r"^\w+ +\d+ gold +(\d+)", blk, re.M))
    rows.append((label, str(g) if a else "?", a.groups() if a else None, b.groups() if b else None))
f = lambda x: "  -  " if x is None else f"{x[0]:>5}/{x[1]:>4}/{x[2]:>5} +{x[3]:<4}"
print("regress: per gold request, right / wrong / not done (%) + extra")
print(f"{'':22s}{'gold':>5}  {'Rules':<26}{'VSS':<26}")
for name, g, a, b in rows: print(f"{name:22s}{g:>5}  {f(a):<26}{f(b):<26}")
print("  * templates are written or generated from the rules' own templates (they favour the Rules); llm_short: the VSS cutter trained on them")
gl = re.search(r"^ALL \(.*\n(?:.*\n)*?\s+vss gated (\d+)% \(t=([\d.]+)\): precision of execution ([\d.]+)% · right ([\d.]+)% · asked ([\d.]+)% · unread ([\d.]+)% · executed wrong ([\d.]+)% · extras executed (\d+)", s, re.M)
gated = [("sample (1000 msgs)" if m else "sample", gl.groups()[2:] if gl else None)]
for grp, label in (("templates", "short: templates*"), ("llm_short", "short: llm_short")):
    a = re.search(rf"^ALL {grp} vss gated \d+%: precision ([\d.]+) · right ([\d.]+) · asked ([\d.]+) · unread ([\d.]+) · executed wrong ([\d.]+) · extras executed (\d+)", t, re.M)
    gated.append((label, a.groups() if a else None))
print(f"VSS gated at {gl.group(1) if gl else '97'}% (t = {gl.group(2) if gl else "?"}, docs/model/confidence/vss.json: out-of-fold thresholds, PRECISION_BERT.md): precision of execution / right / asked / unread (%) / executed wrong (%) + extras executed")
for name, x in gated: print(f"{name:22s}       " + ("  -" if x is None else f"{x[0]:>5} / {x[1]:>4} / {x[2]:>4} / {x[3]:>4} / {x[4]:>3} +{x[5]}"))
print("rules sets (score_rules): " + " ".join(re.findall(r"^(\w+): rules (\d+/\d+)", rd("rules_sets.txt"), re.M) and [f"{a} {b}" for a, b in re.findall(r"^(\w+): rules (\d+/\d+)", rd("rules_sets.txt"), re.M)]))
for name, fn in (("test_diagram_ops", "test_ops.txt"), ("test_editor_history", "test_hist.txt")):
    x = rd(fn); print(f"{name}: " + ("PASS" if x.rstrip().endswith("exit 0") else "FAIL") + " (" + (re.findall(r"\d+/\d+ passed|all passed", x) or ["?"])[0] + ")")
bad = [n for n in ("sample.txt", "short.txt") if not rd(n)]
if bad or any(r[2] is None for r in rows) or any(x is None for _, x in gated): print("WARNING: a run did not finish; see the files in " + O)
E
