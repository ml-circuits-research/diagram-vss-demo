"""memorization_report.py: tables of MEMORIZATION.md from risk_coverage.mjs records.
python3 memorization_report.py <memdir>   (memdir: rec_B/C/cal.jsonl, id lists from memorization_split.py; rc dir via RC env for heldout/sample)"""
import json, os, random, sys
M = sys.argv[1]; RC = os.environ.get("RC", "")
ids = lambda f: set(open(os.path.join(M, f)).read().split())
load = lambda f: {r["id"]: r for r in (json.loads(l) for l in open(f) if l.strip())}
B, C, CAL = (load(os.path.join(M, f"rec_{x}.jsonl")) for x in "BC") , None, None
B = load(os.path.join(M, "rec_B.jsonl")); Cx = load(os.path.join(M, "rec_C.jsonl")); CAL = load(os.path.join(M, "rec_cal.jsonl"))
HELD = load(os.path.join(RC, "heldout.jsonl")); SAMP = load(os.path.join(RC, "sample.jsonl"))
C_ids = ids("ids_C_sop_train600.txt"); POOL = {**B, **Cx}
SOPTR = {i: POOL[i] for i in C_ids}
def agg(recs, f):
    r = w = e = g = 0
    for x in recs:
        g += x["gold"]
        for c, o, *_ in x[f]: r += o == "right"; w += o == "wrong"; e += o == "extra"
    return r, w, e, g
def stat(recs, f):
    r, w, e, g = agg(recs, f); return 100 * r / g, 100 * w / g, 100 * (g - r - w) / g if False else 100 * max(0, g - r - w) / g, e, g
def notdone(recs, f):   # not done = gold - produced matched (right+wrong)
    r, w, e, g = agg(recs, f); return 100 * (g - r - w) / g
def right(recs, f): r, w, e, g = agg(recs, f); return 100 * r / g
def ci(a, b, f, n=2000):   # bootstrap over messages: right(a) - right(b)
    rng = random.Random(0); d = []
    for _ in range(n):
        sa = [rng.choice(a) for _ in a]; sb = [rng.choice(b) for _ in b]; d.append(right(sa, f) - right(sb, f))
    d.sort(); return d[int(.025 * n)], d[int(.975 * n)]
def line(name, recs, f):
    r, w, e, g = agg(recs, f); return f"| {name} ({len(recs)} msgs, {g} req) | {100*r/g:.1f} / {100*w/g:.1f} / {100*(g-r-w)/g:.1f} | {100*e/g:.0f} |"
def prec(recs, f, t=None):
    r = w = e = 0
    for x in recs:
        for c, o, *_ in x[f]:
            if t is None or c >= t: r += o == "right"; w += o == "wrong"; e += o == "extra"
    return 100 * r / max(1, r + w + e), r + w + e
def med(recs, f): v = sorted(c for x in recs for c, *_ in x[f]); return v[len(v) // 2]
print("| set | right / wrong / not done (% of requests) | extras per 100 requests |\n|---|---|---|")
print("SOP-BERT"); 
sop_sets = [("trained (random 600 of its training pool)", list(SOPTR.values())), ("held-out 10%", list(HELD.values())), ("sample (never in its pool)", list(SAMP.values()))]
for n, s in sop_sets: print(line(n, s, "sop"))
tr, he, sa = (s for _, s in sop_sets)
for n, s in sop_sets[1:]:
    lo, hi = ci(tr, s, "sop"); print(f"gap trained - {n.split(' (')[0]}: {right(tr,'sop')-right(s,'sop'):+.1f} points, 95% [{lo:+.1f}, {hi:+.1f}]")
t = med(tr, "sop"); print("SOP-BERT precision of execution (right/(right+wrong+extra)) all executed:", [f"{n.split(' (')[0]} {prec(s,'sop')[0]:.1f}" for n, s in sop_sets]);
print(f"  at the trained set's median confidence {t:.3f} applied unchanged:", [f"{n.split(' (')[0]} {prec(s,'sop',t)[0]:.1f} ({prec(s,'sop',t)[1]} exec)" for n, s in sop_sets])
print("\nVSS (composer, registry.json, committed HEAD)")
vtr = list(B.values()); vcal = list(CAL.values())
for n, s in [("trained by every part but kept 'cal' out: no -> trained (random 500, not calibration)", vtr), ("calibration messages (world cores never trained on them)", vcal)]: print(line(n, s, "vss"))
lo, hi = ci(vtr, vcal, "vss"); print(f"gap trained - cal: {right(vtr,'vss')-right(vcal,'vss'):+.1f} points, 95% [{lo:+.1f}, {hi:+.1f}]")
t = med(vtr, "vss"); print("VSS precision all executed: trained %.1f, cal %.1f; at trained median conf %.3f: trained %.1f, cal %.1f" % (prec(vtr,'vss')[0], prec(vcal,'vss')[0], t, prec(vtr,'vss',t)[0], prec(vcal,'vss',t)[0]))
print("\nSame messages unseen by both cores (cal and in SOP held-out or sample):")
both = [CAL[i] for i in CAL if i in ids("sop_held.txt") | ids("sample.txt")]
print(line("VSS", both, "vss")); print(line("SOP-BERT", both, "sop"))
print("\nVSS parts: cal (core unseen) vs not, by cutter-unseen (spans folders) and filler test part")
spans, ft = ids("part_spansdir.txt"), ids("part_filler_test.txt")
allv = {**B, **CAL}
cal_ids = set(CAL)
for name, sel in [("core seen, cutter seen, filler seen", lambda i: i not in cal_ids and i not in spans and i not in ft), ("core seen, cutter UNSEEN (spans folder)", lambda i: i not in cal_ids and i in spans),
                  ("core seen, filler UNSEEN (test 20%)", lambda i: i not in cal_ids and i in ft), ("core UNSEEN, cutter seen, filler seen", lambda i: i in cal_ids and i not in spans and i not in ft),
                  ("core UNSEEN, cutter UNSEEN", lambda i: i in cal_ids and i in spans), ("core UNSEEN, filler UNSEEN", lambda i: i in cal_ids and i in ft)]:
    s = [allv[i] for i in allv if sel(i)]
    if s: print(line(name, s, "vss"))
print("\nControl: SOP-BERT on the same groups (it trained on neither the spans folders' sample nor...; see text)")
for name, sel in [("spans folder, core seen", lambda i: i not in cal_ids and i in spans), ("other folders, core seen", lambda i: i not in cal_ids and i not in spans),
                  ("spans folder, cal", lambda i: i in cal_ids and i in spans), ("other folders, cal", lambda i: i in cal_ids and i not in spans)]:
    s = [allv[i] for i in allv if sel(i)]
    print(line(name + " VSS", s, "vss")); print(line(name + " SOP-BERT", s, "sop"))
