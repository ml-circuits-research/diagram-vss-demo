"""wnu_stats.py: statistics of words_not_understood.mjs output (M1, M1b). python3 wnu_stats.py F.json"""
import json, sys, math, random, collections
import numpy as np
D = json.load(open(sys.argv[1])); recs = D["recs"]; cross = D["cross"]
def wilson(k, n, z=1.96):
    if n == 0: return (0, 0)
    p = k / n; d = 1 + z * z / n; c = p + z * z / (2 * n); h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return ((c - h) / d, (c + h) / d)
def pct(k, n): lo, hi = wilson(k, n); return f"{k} ({100*k/n:.1f}%, CI {100*lo:.1f}-{100*hi:.1f})" if n else "-"
def share(r, nf=False): w = r["wordsNF"] if nf else r["words"]; u = r["undNF"] if nf else r["und"]; return u / w if w else 0.0
def auc(neg, pos):
    if not len(neg) or not len(pos): return float("nan")
    a = np.concatenate([neg, pos]); order = a.argsort(kind="mergesort"); ranks = np.empty(len(a)); 
    # average ranks for ties
    s = a[order]; i = 0; rk = np.empty(len(a))
    while i < len(a):
        j = i
        while j + 1 < len(a) and s[j + 1] == s[i]: j += 1
        rk[order[i:j + 1]] = (i + j) / 2 + 1; i = j + 1
    return (rk[len(neg):].sum() - len(pos) * (len(pos) + 1) / 2) / (len(neg) * len(pos))
by = collections.defaultdict(list)
for r in recs: by[r["kind"]].append(r)
out = []
P = lambda s="": out.append(s)
P(f"readings (produced actions, current routing): {len(recs)} from {D['n_msgs']} messages; right {len(by['right'])}, wrong {len(by['wrong'])}, extra {len(by['extra'])}")
P("\n## Distribution (words not understood, share = not understood / words of the unit)")
for nf, lab in [(False, "all surface words"), (True, "function words the/a/an/to/of/and/please ignored")]:
    P(f"\n{lab}")
    P("| kind | n | count median [Q1,Q3] | share median [Q1,Q3] | share = 0 |"); P("|---|---|---|---|---|")
    for k in ["right", "wrong", "extra"]:
        L = by[k]; c = np.array([r["undNF" if nf else "und"] for r in L]); s = np.array([share(r, nf) for r in L])
        P(f"| {k} | {len(L)} | {np.median(c):.0f} [{np.percentile(c,25):.0f},{np.percentile(c,75):.0f}] | {np.median(s):.2f} [{np.percentile(s,25):.2f},{np.percentile(s,75):.2f}] | {pct(int((s==0).sum()), len(s))} |")
# AUC with bootstrap over messages
msgs = sorted(set(r["msg"] for r in recs)); idx = collections.defaultdict(list)
for r in recs: idx[r["msg"]].append(r)
def aucs(rs, nf=False, key=None):
    f = key or (lambda r: share(r, nf))
    return auc(np.array([f(r) for r in rs if r["kind"] == "right"]), np.array([f(r) for r in rs if r["kind"] != "right"]))
rnd = random.Random(1)
def boot(f, B=500):
    v = []
    for _ in range(B):
        rs = [x for m in (rnd.choice(msgs) for _ in msgs) for x in idx[m]]; v.append(f(rs))
    v = np.array(v); return np.nanpercentile(v, 2.5), np.nanpercentile(v, 97.5)
P("\n## AUC of the share not understood (positive = wrong or extra, negative = right; 0.5 = no signal; bootstrap over messages, 500 resamples)")
for nf, lab in [(False, "all words"), (True, "function words ignored")]:
    a = aucs(recs, nf); lo, hi = boot(lambda rs: aucs(rs, nf)); P(f"- share, {lab}: AUC {a:.3f} (CI {lo:.3f}-{hi:.3f})")
a = aucs(recs, key=lambda r: r["und"]); lo, hi = boot(lambda rs: aucs(rs, key=lambda r: r["und"])); P(f"- raw count of words not understood: AUC {a:.3f} (CI {lo:.3f}-{hi:.3f})")
mg = lambda r: -(r["margin"] if r["margin"] is not None else 9)
a = aucs(recs, key=mg); lo, hi = boot(lambda rs: aucs(rs, key=mg)); P(f"- for comparison, the reader's margin (small margin = suspect): AUC {a:.3f} (CI {lo:.3f}-{hi:.3f})")
wr = [r for r in recs if r["kind"] != "extra"]
P(f"- share (all words), right vs wrong only: AUC {aucs(wr):.3f}; right vs extra only: AUC {aucs([r for r in recs if r['kind']!='wrong']):.3f}")
# trade-off
nR, nW, nE = (len(by[k]) for k in ["right", "wrong", "extra"])
P(f"\n## Trade-off: readings flagged and asked instead of executed (of right {nR}, wrong {nW}, extra {nE}; Wilson CIs)")
P("| rule | right lost | wrong avoided | extra avoided | right lost per (wrong+extra) avoided [bootstrap CI] |"); P("|---|---|---|---|---|")
def rule_counts(rs, f):
    c = collections.Counter(r["kind"] for r in rs if f(r)); return c["right"], c["wrong"], c["extra"]
def ratio(rs, f):
    a, b, c = rule_counts(rs, f); return a / (b + c) if b + c else float("nan")
rules = [("margin: abstain (status)", lambda r: r["status"] == "abstain")] + [(f"share >= {t} (all words)", (lambda t: lambda r: share(r) >= t - 1e-12)(t)) for t in [0.2, 0.3, 0.4, 0.5, 0.6]] \
    + [(f"share >= {t} (function words ignored)", (lambda t: lambda r: share(r, True) >= t - 1e-12)(t)) for t in [0.2, 0.3, 0.4, 0.5, 0.6]] \
    + [("abstain OR share >= 0.4", lambda r: r["status"] == "abstain" or share(r) >= 0.4)]
for lab, f in rules:
    a, b, c = rule_counts(recs, f); lo, hi = boot(lambda rs: ratio(rs, f), 300)
    P(f"| {lab} | {pct(a,nR)} | {pct(b,nW)} | {pct(c,nE)} | {a/(b+c) if b+c else float('nan'):.2f} [{lo:.2f}-{hi:.2f}] |")
# bootstrap diff of ratio: share>=0.4 vs abstain
f1 = rules[0][1]; f2 = rules[3][1]
ds = []
for _ in range(300):
    rs = [x for m in (rnd.choice(msgs) for _ in msgs) for x in idx[m]]; ds.append(ratio(rs, f2) - ratio(rs, f1))
ds = np.array(ds); P(f"\nDifference of the ratio (share >= 0.4 minus abstain): {np.nanmean(ds):+.2f}, bootstrap CI {np.nanpercentile(ds,2.5):+.2f} to {np.nanpercentile(ds,97.5):+.2f}")
# per world
P("\n## Share not understood by world of the reading (median; n)")
for w, L in sorted(collections.defaultdict(list, {w: [r for r in recs if r["world"] == w] for w in set(r["world"] for r in recs)}).items(), key=lambda x: -len(x[1])):
    P(f"- {w}: n {len(L)}, median share {np.median([share(r) for r in L]):.2f}, right {sum(r['kind']=='right' for r in L)/len(L)*100:.0f}%")
# examples
P("\n## Examples (share >= 0.5, kinds)")
for k in ["right", "wrong", "extra"]:
    L = [r for r in by[k] if share(r) >= 0.5][:4]
    for r in L: P(f"- [{k}] ({r['world']}/{r['event']}) \"{r['src']}\" not understood: {r['notU']} share {share(r):.2f}")
# M1b
P("\n## M1b: every world reads the gold unit, fewest words not understood wins (ties: registry order, fallback last)")
n = len(cross); ok = ok_opt = tie = tie_ok_pess = 0; wrongwin = collections.Counter(); exs = collections.defaultdict(list); nf_all = 0
conf = collections.Counter()
for c in cross:
    u = [r["und"] if r["und"] is not None else 10**6 for r in c["reads"]]; m = min(u); winners = [r["world"] for r, x in zip(c["reads"], u) if x == m]
    picked = winners[0]; ok += picked == c["goldWorld"]; ok_opt += c["goldWorld"] in winners
    if len(winners) > 1: tie += 1
    if picked != c["goldWorld"]:
        wrongwin[picked] += 1; conf[(c["goldWorld"], picked)] += 1
        exs[picked].append(f"\"{c['span']}\" gold {c['ev']} ({c['goldWorld']}) -> {picked} [{', '.join(c['reads'][[r['world'] for r in c['reads']].index(picked)]['notU'] or [])}] ties {len(winners)}")
P(f"units {n}; picked world = gold request's world (registry-order tie break): {pct(ok, n)}")
P(f"gold world among the tied winners (optimistic tie break): {pct(ok_opt, n)}")
P(f"tie of 2+ worlds at the minimum: {pct(tie, n)}")
tg = [c for c in cross if sum(1 for r in c["reads"] if (r['und'] if r['und'] is not None else 10**6) == min((x['und'] if x['und'] is not None else 10**6) for x in c['reads'])) > 1]
P(f"mean number of worlds tied at the minimum when a tie: {np.mean([sum(1 for r in c['reads'] if r['und']==min(x['und'] for x in c['reads'])) for c in tg]):.1f}" if tg else "")
nothing = [c for c in cross if min((r["und"] if r["und"] is not None else 10**6) for r in c["reads"]) >= min(r["words"] or 10**6 for r in c["reads"] if r["words"] is not None)]
def _pk(c):
    u = [r["und"] for r in c["reads"]]; m = min(u); return [r["world"] for r, x in zip(c["reads"], u) if x == m][0]
P(f"units where NO world understood any word (minimum = all words; the pick is then just the first world of the registry): {pct(len(nothing), n)}; of the {sum(1 for c in cross if _pk(c) != c['goldWorld'])} wrong picks, {sum(1 for c in nothing if _pk(c) != c['goldWorld'])} are such units")
rest = [c for c in cross if c not in nothing]
P(f"accuracy on the other units: {pct(sum(_pk(c) == c['goldWorld'] for c in rest), len(rest))}")
P("\ngold world -> accuracy:")
gw = collections.Counter(c["goldWorld"] for c in cross); gok = collections.Counter()
for c in cross:
    u = [r["und"] for r in c["reads"]]; m = min(u); picked = [r["world"] for r, x in zip(c["reads"], u) if x == m][0]; gok[c["goldWorld"]] += picked == c["goldWorld"]
for w, k in gw.most_common(): P(f"- {w}: {gok[w]}/{k}")
P("\nworlds that win wrongly most often:")
for w, k in wrongwin.most_common(): P(f"- {w}: {k} wrong wins")
P("\ntop confusions (gold world -> picked): " + "; ".join(f"{a}->{b} {k}" for (a, b), k in conf.most_common(8)))
P("\nexamples (5 per top wrongly winning world; bracket = words the winner did not understand):")
for w, k in wrongwin.most_common(4):
    P(f"\n{w}:")
    for e in exs[w][:5]: P(f"- {e}")
print("\n".join(out)); 
