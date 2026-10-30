"""aggregate.py (implementer B): logs/*.json -> markdown tables for RESULTS.md (means over seeds 0 and 1, per-seed in brackets)"""
import json, numpy as np

SEEDS = [0, 1]


def load(tag): return [json.load(open(f"logs/{tag}_s{s}.json")) for s in SEEDS]


def summ(recs):
    g = sum(r["gold"] for r in recs); ok = sum(r["ok"] for r in recs); ex = sum(r["extra"] for r in recs)
    tp = sum(r["ztp"] for r in recs); fp = sum(r["zfp"] for r in recs); fn = sum(r["zfn"] for r in recs)
    return ok / max(1, g), ex / max(1, g), 2 * tp / max(1, 2 * tp + fp + fn)


def table(tag, keys, zone=True):
    L = load(tag); out = []
    hdr = "| exp | test | all (s0 / s1) | n=1 | n=2 | n=3 | n=4 | chatter 0 | chatter 1 | chatter 2 | extra / gold req | zone F1 |"
    out += [hdr, "|" + "---|" * 12]
    for k in keys:
        for s in ("test_seen", "test_unseen"):
            runs = [l[k][s] for l in L]
            allv = [summ(r)[0] for r in runs]
            f = lambda sel, i=0: np.mean([summ([x for x in r if sel(x)])[i] for r in runs])
            row = [k, s, f"{np.mean(allv):.3f} ({allv[0]:.3f} / {allv[1]:.3f})"] + [f"{f(lambda x, n=n: x['n'] == n):.3f}" for n in (1, 2, 3, 4)] + \
                  [f"{f(lambda x, c=c: x['c'] == c):.3f}" for c in (0, 1, 2)] + [f"{np.mean([summ(r)[1] for r in runs]):.3f}",
                   f"{np.mean([summ(r)[2] for r in runs]):.3f}" if zone else "-"]
            out.append("| " + " | ".join(row) + " |")
    return "\n".join(out)


def e4_table(keys):
    M, E = load("main"), load("e4"); out = ["| exp | test | trained 1-4, on n=3-4 | trained 1-2, on n=3-4 | drop (points) |", "|---|---|---|---|---|"]
    for k in keys:
        for s in ("test_seen", "test_unseen"):
            a = np.mean([summ([x for x in l[k][s] if x["n"] >= 3])[0] for l in M]); b = np.mean([summ([x for x in l[k][s] if x["n"] >= 3])[0] for l in E])
            out.append(f"| {k} | {s} | {a:.3f} | {b:.3f} | {100 * (a - b):+.1f} |")
    return "\n".join(out)


def e5_table(tag):
    L = [json.load(open(f"logs/{tag}_s{s}.json")) for s in SEEDS]
    keys = ["A_acc", "B_goldcut", "B_from_zones", "B_recovery_ratio", "B_direct", "A_on_B_per_Breq", "B_on_A_per_Areq", "Bdirect_on_A_per_Areq",
            "A_extra_rate", "B_extra_rate", "A_zone_F1", "leftover_chatter_F1"]
    out = ["| measure | test_seen (s0 / s1) | test_unseen (s0 / s1) |", "|---|---|---|"]
    for k in keys:
        cells = []
        for s in ("test_seen", "test_unseen"):
            v = [l[s][k] for l in L]; cells.append(f"{np.mean(v):.3f} ({v[0]:.3f} / {v[1]:.3f})")
        out.append(f"| {k} | " + " | ".join(cells) + " |")
    return "\n".join(out)


if __name__ == "__main__":
    print("## E0\n" + table("main", ["E0a", "E0b", "E0c"]))
    print("\n## E1-E3 (zone rule 1)\n" + table("main", ["E1", "E2", "E3a", "E3b", "E3c", "E1d", "E3d"]))
    print("\n## zone rule 2\n" + table("main", ["E2_z2", "E3a_z2", "E3b_z2", "E3c_z2", "E3d_z2"]))
    rho = {k: [load("main")[i].get(k + "_rho") for i in range(2)] for k in ("E2", "E3a", "E3b", "E3c", "E3d")}; print("rho", rho)
    print("E3a thr", [l.get("E3a_thr") for l in load("main")])
    print("\n## E4\n" + e4_table(["E0a", "E0c", "E1", "E2", "E3a", "E3b", "E3c", "E1d", "E3d"]))
    print("\n## E4 full tables\n" + table("e4", ["E0a", "E2", "E3b", "E3c", "E3d"]))
    print("\n## E5\n" + e5_table("e5")); print("\n## E5 neg\n" + e5_table("e5_neg"))
