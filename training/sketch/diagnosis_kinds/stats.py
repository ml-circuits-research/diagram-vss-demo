"""stats.py: the numbers of KINDS.md from the outputs of ablate.mjs, rows.py, rowsfn.py, cluster.py, ib.py and maps.py.
python3 stats.py > stats_out.txt"""
import json, collections
import numpy as np
from scipy.stats import spearmanr
from sklearn.metrics import adjusted_rand_score
H = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/kinds/"
RUNS = {"fix": "/home/claude/diagram-vss-demo/training/sketch/runs/fix_p80_D1024_e2_s0", "data2": "/home/claude/diagram-vss-demo/training/sketch/runs/data2_p80_D1024_e2_s0"}
MODEL = {"fix": "fix_p80_s0", "data2": "data2_p80_s0"}
D = 1024
def dense_bytes(K): return (3 * K * K + 2 * K) * D + 4 * K          # path, bg0 (K x D), bg, A, L (K x K x D), 8 bits; logits float32
def reached(tag, kmap):
    """rows a training on the same rows would reach with this kind map (train.reached_rows), and the number of kinds"""
    M = json.load(open(f"/home/claude/diagram-vss-demo/docs/model/{MODEL[tag]}/model.json")); kind = {w: e["kind"] for w, e in M["catalog"]["words"].items()}
    kind = {w: kmap.get(w, k) for w, k in kind.items()}
    tr = json.load(open(RUNS[tag] + "/splits.json"))["texts"]["train"]; rows = set(); cats = set()
    for s in tr:
        c = [kind[t] for t in s.split()]; cats.update(c)
        for k in range(len(c)):
            rows.add(("m", c[k])); rows.add(("bg", c[k - 1] if k else "^", c[k]))
            for q in range(k): rows.add(("A", c[q], c[k])); rows.add(("L", c[k], c[q]))
    return len(set(kind.values()) | {"unknown"}), len(rows)      # K = the kinds of the catalog (what the route book is built over)
for tag in ("fix", "data2"):
    print(f"\n######## {tag} ({MODEL[tag]})")
    ab = json.load(open(H + f"abl_{tag}.json")); runs = ab["runs"]; own = list(runs)
    print("baseline", ab["baseline"])
    net = {w: runs[w]["fit"]["rw"] - runs[w]["fit"]["wr"] for w in own}; dnet = {w: runs[w]["dev"]["rw"] - runs[w]["dev"]["wr"] for w in own}
    tok = {w: runs[w]["fit"]["tok"] for w in own}
    rule = json.load(open(H + f"rule_{tag}.json")); keep = set(rule["keep_sign_test"])
    order = sorted(own, key=lambda w: (-net[w], -dnet[w], -tok[w]))
    print("| rank | word | fit tokens | fit right->wrong | fit wrong->right | fit net | dev tokens | dev right->wrong | dev wrong->right | dev net | sign test p (fit) |")
    for i, w in enumerate(order):
        if i < 30 or i >= len(order) - 30:
            f, d = runs[w]["fit"], runs[w]["dev"]
            print(f"| {i + 1} | {w} | {f['tok']} | {f['rw']} | {f['wr']} | {net[w]} | {d['tok']} | {d['rw']} | {d['wr']} | {dnet[w]} | {rule['p'][w]:.3g}{' *' if w in keep else ''} |")
        elif i == 30: print("| ... |")
    print("spearman fit net vs dev net", spearmanr([net[w] for w in own], [dnet[w] for w in own]))
    print("spearman fit net vs fit tokens", spearmanr([net[w] for w in own], [tok[w] for w in own]))
    print("net <= 0 on fit:", sum(1 for w in own if net[w] <= 0), "of", len(own), "; total fit flips of all single ablations rw", sum(runs[w]["fit"]["rw"] for w in own), "wr", sum(runs[w]["fit"]["wr"] for w in own))
    for lo, hi in ((8, 15), (16, 31), (32, 63), (64, 127), (128, 10 ** 9)):
        ws = [w for w in own if lo <= tok[w] <= hi]
        if ws: print(f"  fit tokens {lo}-{hi}: {len(ws)} words, sign-test kept {sum(1 for w in ws if w in keep)}, net>0 {sum(1 for w in ws if net[w] > 0)}, mean net {np.mean([net[w] for w in ws]):.1f}")
    kd = [w for w in own if w in keep]; nk = [w for w in own if w not in keep]
    print(f"dev net of the sign-test words: {sum(dnet[w] for w in kd)} (each: {sum(1 for w in kd if dnet[w] > 0)} of {len(kd)} positive); of the others: {sum(dnet[w] for w in nk)}")
    # measurement 2
    r = json.load(open(H + f"rows_{tag}.json")); print("\nraw rows: null sd", round(r["null_final_sd"], 4))
    for fam in r["fams"]:
        F = [(p, v[fam]) for p, v in r["pairs"].items() if v[fam]]
        f = np.array([x[1][0] for x in F]); d = np.array([x[1][1] for x in F])
        top = sorted(F, key=lambda x: -x[1][0])[:5]
        print(f"  {fam}: pairs {len(F)}, final cos mean {f.mean():.3f} p99 {np.percentile(f, 99):.3f} max {f.max():.3f}; pairs > 0.5: {int(np.sum(f > 0.5))}; top {[(p.replace(chr(9), '/'), round(v[0], 2)) for p, v in top]}")
    fn = json.load(open(H + f"rowsfn_{tag}.json"))
    snr = {a: {k: v["snr"] for k, v in fn["profile"][a].items()} for a in fn["own"]}
    print("functional profile snr >= 3: out_role", sum(1 for a in snr if snr[a].get("out_role", 0) >= 3), "in_role", sum(1 for a in snr if snr[a].get("in_role", 0) >= 3),
          "in_presence", sum(1 for a in snr if snr[a].get("in_presence", 0) >= 3), "of", len(snr))
    cl = json.load(open(H + f"clusters_{tag}.json"))
    print("m2 writes nothing:", cl["m2_empty"]); print("m2 clusters 0.9:", [c for c in cl["m2_clusters"]["0.9"] if len(c) > 1])
    print("m2 clusters 0.75:", [c for c in cl["m2_clusters"]["0.75"] if len(c) > 1])
    print("m2 top components:", {a: cl["m2_top"][a] for a in list(cl["m2_top"])})
    ib = json.load(open(H + f"ib_{tag}_self-next-prev-pos.json"))
    print("ib K*", ib["K_star"], "clusters:", [c for c in ib["clusters"] if len(c) > 1], "singletons", [c[0] for c in ib["clusters"] if len(c) == 1])
    lab2 = {a: i for i, c in enumerate(cl["m2_clusters"]["0.75"]) for a in c}; lab2.update({a: -1 for a in cl["m2_empty"]})
    lab3 = {a: i for i, c in enumerate(ib["clusters"]) for a in c if a != "UNK"}
    both = [a for a in own if a in lab2 and a in lab3]
    print("ARI m2(0.75) vs ib K*:", round(adjusted_rand_score([lab2[a] for a in both], [lab3[a] for a in both]), 3), "m2 vs significance-merge m3:", round(cl["ari_m2_075_vs_m3"], 3))
    cos = cl["m2_cos"]; g = lambda a, b: cos.get(f"{a}\t{b}", cos.get(f"{b}\t{a}"))
    inside = [g(a, b) for c in ib["clusters"] for i, a in enumerate(c) for b in c[i + 1:] if g(a, b) is not None]
    print(f"m2 cosine of pairs inside ib clusters: mean {np.mean(inside):.3f} (n {len(inside)}) vs all pairs {np.mean(list(cos.values())):.3f}")
    # the same-cluster pairs both measurements agree on (ib cluster and m2 cosine >= 0.75)
    agree = sorted({(a, b) for c in ib["clusters"] for i, a in enumerate(c) for b in c[i + 1:] if (g(a, b) or 0) >= 0.75})
    print("pairs in one ib cluster with m2 cosine >= 0.75:", agree)
    # maps
    try: am = json.load(open(H + f"abl_{tag}_maps.json"))
    except FileNotFoundError: am = None
    maps = json.load(open(H + f"maps_{tag}.json")); maps.update(json.load(open(H + f"maps_{tag}_rule.json")))
    try: am_r = json.load(open(H + f"abl_{tag}_rule.json")); am = am or {"runs": {}}; am["runs"].update(am_r["runs"])
    except FileNotFoundError: pass
    print("\n| map | own kinds left | K | dense route book MB | reached rows (sparse MB) | fit right->wrong | fit wrong->right | fit net | dev right->wrong | dev wrong->right | dev net | dev right after |")
    K0, R0 = reached(tag, {})
    print(f"| current | {len(own)} | {K0} | {dense_bytes(K0) / 1e6:.1f} | {R0} ({R0 * D / 1e6:.1f}) | 0 | 0 | 0 | 0 | 0 | 0 | {ab['baseline']['dev']['right']} |")
    for name, kmap in maps.items():
        K, Rr = reached(tag, kmap); left = len(set(own) - set(kmap))
        if am and name in am["runs"]:
            x = am["runs"][name]; f, d = x["fit"], x["dev"]
            print(f"| {name} | {left} | {K} | {dense_bytes(K) / 1e6:.1f} | {Rr} ({Rr * D / 1e6:.1f}) | {f['rw']} | {f['wr']} | {f['wr'] - f['rw']} | {d['rw']} | {d['wr']} | {d['wr'] - d['rw']} | {d['right_after']} |")
        else: print(f"| {name} | {left} | {K} | {dense_bytes(K) / 1e6:.1f} | {Rr} ({Rr * D / 1e6:.1f}) | (not run) |")
    # the kind map a TRAINING would use under the proposed rule (kinds_<tag>.json): words not listed -> their legend kind or unknown
    km = json.load(open(H + f"kinds_{tag}.json"))["map"]
    M = json.load(open(f"/home/claude/diagram-vss-demo/docs/model/{MODEL[tag]}/model.json"))
    full = {w: (km[w] if w in km else (e["kind"] if (e["kind"] == "unknown" or e["kind"].isupper()) else "unknown")) for w, e in M["catalog"]["words"].items()}
    K, Rr = reached(tag, full)
    print(f"rule as trained (kinds_{tag}.json): K {K}, dense {dense_bytes(K) / 1e6:.1f} MB, reached rows {Rr} (sparse {Rr * D / 1e6:.1f} MB); words with a non-legend kind {len(km)}; "
          f"catalog words that had no kind and get one: {sum(1 for w in km if w in M['catalog']['words'] and M['catalog']['words'][w]['kind'] == 'unknown')}")
# words the two models share: does the effect agree?
a1 = json.load(open(H + "abl_fix.json"))["runs"]; a2 = json.load(open(H + "abl_data2.json"))["runs"]
com = [w for w in a1 if w in a2]
n1 = [a1[w]["fit"]["rw"] - a1[w]["fit"]["wr"] for w in com]; n2 = [a2[w]["fit"]["rw"] - a2[w]["fit"]["wr"] for w in com]
print("\nwords own kind in both models:", len(com), "spearman of fit net (fix on old fit vs data2 on all fit):", spearmanr(n1, n2))
r1 = set(json.load(open(H + "rule_fix.json"))["keep_sign_test"]); r2 = set(json.load(open(H + "rule_data2.json"))["keep_sign_test"])
print("sign-test words: fix only", sorted(r1 - r2), "data2 only", sorted(r2 - r1), "both", len(r1 & r2))
