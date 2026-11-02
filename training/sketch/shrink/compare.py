#!/usr/bin/env python3
"""compare.py: the decisions of candidate exports against the shipped ones (decisions.mjs output; training/sketch/shrink/SHRINK.md).

  python3 training/sketch/shrink/compare.py <base.jsonl> <cand.jsonl> [<cand.jsonl> ...]

Per candidate and per set (sample = the 1000-message sample; fresh2 = training/sketch/llm_bench/fresh2, ids fo-*):
  msgs changed     messages whose produced requests (action + canonical arguments, in order) differ from the base
  req changed      gold requests whose outcome (right / wrong / not done) changed, counted per message as the sum of the positive
                   differences of the three counts (exact unless two requests of one message swap outcomes), plus |delta extra|
  right/wrong/not done/extra   the candidate's totals (% of gold requests; extra as a count) and their change from the base
  gate97 changed   produced requests whose execute / ask decision at the demo's 97% threshold differs (messages with the same produced
                   requests only), and max |delta confidence| on those messages
  exec97 r/w/e     requests executed at the demo's 97% threshold: right / wrong / extra (whole set), and the change from the base
  cost97           the cost score at the demo's 97% threshold (AGENTS.md: right - 10 x (executed wrong + extras executed), per 100
                   requested actions); fresh2: its test part only (FRESH2_PLAN.md: int(sha256(id), 16) % 3 != 0)
  costcal          fresh2 test part, at the threshold that maximises the cost score on the fresh2 calibration part (% 3 == 0, in-sample)
"""
import hashlib, json, os, sys


def load(p):
    rows = {}
    for l in open(p):
        r = json.loads(l)
        if "_meta" in r: rows["_meta"] = r["_meta"]; continue
        rows[r["id"]] = r
    return rows


def is_fresh(i): return str(i).startswith("fo-")
def is_cal(i): return int(hashlib.sha256(str(i).encode()).hexdigest(), 16) % 3 == 0


def cost(rows, t=None):
    """t None: the gated tallies at 97 (decisions.mjs g97); else every produced request with conf >= t is executed"""
    gold = sum(r["s"]["gold"] for r in rows)
    if t is None: r_ = sum(r["g97"]["r"] for r in rows); bad = sum(r["g97"]["w"] + r["g97"]["e"] for r in rows)
    else:
        r_ = sum(1 for r in rows for c, o in zip(r["conf"], r["out"]) if c >= t and o == "right")
        bad = sum(1 for r in rows for c, o in zip(r["conf"], r["out"]) if c >= t and o != "right")
    return (r_ - 10 * bad) / gold * 100 if gold else 0.0


def best_t(rows):
    ts = sorted({c for r in rows for c in r["conf"]} | {float("inf")})
    return max(ts, key=lambda t: (cost(rows, t), t))


def summary(B, C, sel):
    ids = [i for i in B if i != "_meta" and sel(i)]
    out = dict(msgs=len(ids), msgs_changed=0, req_changed=0, gate_changed=0, dconf=0.0)
    tot = {k: 0 for k in ("right", "wrong", "missed", "extra", "gold")}; tb = dict(tot)
    for i in ids:
        b, c = B[i], C[i]
        for k in tot: tot[k] += c["s"][k]; tb[k] += b["s"][k]
        if b["prod"] != c["prod"]: out["msgs_changed"] += 1
        else:
            out["dconf"] = max([out["dconf"]] + [abs(x - y) for x, y in zip(b["conf"], c["conf"])])
            out["gate_changed"] += sum(1 for x, y in zip(b["conf"], c["conf"]) if (x >= T97) != (y >= T97))
        out["req_changed"] += sum(max(0, c["s"][k] - b["s"][k]) for k in ("right", "wrong", "missed")) + abs(c["s"]["extra"] - b["s"]["extra"])
    out["tot"] = tot; out["base"] = tb
    ex = lambda R: (sum(r["g97"]["r"] for r in R), sum(r["g97"]["w"] for r in R), sum(r["g97"]["e"] for r in R))
    out["exec"] = ex([C[i] for i in ids]); out["exec_base"] = ex([B[i] for i in ids])
    rows_c = [C[i] for i in ids]; rows_b = [B[i] for i in ids]
    test = [C[i] for i in ids if not is_fresh(i) or not is_cal(i)]
    out["cost97"] = cost(test); out["cost97_base"] = cost([B[i] for i in ids if not is_fresh(i) or not is_cal(i)])
    if any(is_fresh(i) for i in ids):
        cal = [C[i] for i in ids if is_cal(i)]; t = best_t(cal); out["costcal"] = cost(test, t); out["tcal"] = t
        calb = [B[i] for i in ids if is_cal(i)]; tb_ = best_t(calb)
        out["costcal_base"] = cost([B[i] for i in ids if not is_cal(i)], tb_)
    return out


T97 = None


def main():
    global T97
    base = load(sys.argv[1])
    # the demo's 97% threshold (docs/model/confidence/vss.json, as vss-confidence.js threshold(model, "97") reads it)
    conf = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "docs", "model", "confidence", "vss.json")))
    T97 = find_threshold(conf)
    pct = lambda x, g: f"{100 * x / g:5.1f}"
    print(f"base: {sys.argv[1]}  (97% threshold {T97:.4f})")
    hdr = f"{'cand':8s} {'set':7s} {'msgs chg':>8s} {'req chg':>7s}  {'right':>11s} {'wrong':>11s} {'not done':>11s} {'extra':>9s}  {'gate97 chg':>10s} {'max dconf':>9s} {'exec97 r/w/e (delta)':>24s} {'cost97':>13s} {'costcal (test)':>16s}"
    print(hdr)
    for p in sys.argv[2:]:
        C = load(p); name = p.rsplit("/", 1)[-1].replace(".jsonl", "")
        for sname, sel in (("sample", lambda i: not is_fresh(i)), ("fresh2", is_fresh)):
            s = summary(base, C, sel); T, Bt = s["tot"], s["base"]; g = T["gold"]
            d = lambda k: f"{pct(T[k], g)}({100 * (T[k] - Bt[k]) / g:+.1f})"
            cc = f"{s['costcal']:6.1f}({s['costcal'] - s['costcal_base']:+.1f})" if "costcal" in s else "-"
            print(f"{name:8s} {sname:7s} {s['msgs_changed']:8d} {s['req_changed']:7d}  {d('right'):>11s} {d('wrong'):>11s} {d('missed'):>11s} {T['extra']:4d}({T['extra'] - Bt['extra']:+d})"
                  f"  {s['gate_changed']:10d} {s['dconf']:9.2e} {'/'.join(map(str, s['exec'])) + ' (' + '/'.join(f'{x - y:+d}' for x, y in zip(s['exec'], s['exec_base'])) + ')':>24s} {s['cost97']:6.1f}({s['cost97'] - s['cost97_base']:+.1f}) {cc:>16s}")
        m = C.get("_meta", {}); print(f"{'':8s} load {m.get('load_ms')} ms, read {m.get('read_ms')} ms, rss {m.get('rss_mb')} MB")


def find_threshold(conf):
    """vss-confidence.js threshold(model, "97"): the reader's level entry"""
    spec = conf["readers"]["vss_combined"] if "readers" in conf else conf
    lv = spec.get("levels", {}).get("97")
    if isinstance(lv, dict) and "threshold" in lv: return float(lv["threshold"])
    raise SystemExit("compare.py: no 97% threshold in docs/model/confidence/vss.json")


main()
