"""presence_stats.py: summary of presence_decomp.mjs. For every gold-PRESENT single role of the gold event (fit train rows, dev rows):
the share of its presence ratio written by each class of token kind, and how often it reaches the role's threshold, split by whether
the sentence holds an own-kind word (a kind of exactly one word) next to the role's filler; and the same for gold-ABSENT roles."""
import collections, json, statistics as S
HERE = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/capacity/"
for name in ("fit", "dev"):
    P = [p for p in json.load(open(HERE + f"pd_{name}.json")) if p["split"] in ("train", "dev")]
    print(f"\n## {name} ({'train rows' if name == 'fit' else 'dev rows'}: {len(P)})")
    agg = collections.defaultdict(lambda: collections.defaultdict(list)); hit = collections.defaultdict(lambda: [0, 0])
    for p in P:
        has_own = "own" in p["kinds"].split()
        for role, v in p["roles"].items():
            if v["thr"] is None: continue
            g = "present" if v["gold"] else "absent"
            for c, x in v["by"].items(): agg[g][c].append(x)
            agg[g]["total"].append(v["total"])
            k = (g, has_own); hit[k][0] += v["total"] >= v["thr"]; hit[k][1] += 1
            hk = (g, role); hit[hk][0] += v["total"] >= v["thr"]; hit[hk][1] += 1
    print("| gold | mean presence ratio | written by own-kind words | VERB | NAME | other value kinds | unknown |\n|---|---|---|---|---|---|---|")
    for g in ("present", "absent"):
        a = agg[g]; print(f"| {g} (n={len(a['total'])}) | {S.mean(a['total']):.3f} | " + " | ".join(f"{S.mean(a[c]):.3f}" for c in ("own", "VERB", "NAME", "value", "unknown")) + " |")
    print("\n| gold | sentence has an own-kind word | read present (ratio >= threshold) |\n|---|---|---|")
    for g in ("present", "absent"):
        for o in (True, False):
            h = hit[(g, o)]; print(f"| {g} | {o} | {h[0]}/{h[1]} = {100 * h[0] / max(1, h[1]):.1f}% |")
    print("\nper role, gold present: read present / n (gold absent: read present / n)")
    roles = sorted({k[1] for k in hit if isinstance(k[1], str)})
    print(", ".join(f"{r} {hit[('present', r)][0]}/{hit[('present', r)][1]} ({hit[('absent', r)][0]}/{hit[('absent', r)][1]})" for r in roles))
    # sentences with NO own-kind word: the presence of the gold roles can only come from VERB / value kinds (shared by many words)
    no_own = [p for p in P if "own" not in p["kinds"].split()]
    print(f"\nsentences without any own-kind word: {len(no_own)}; right {sum(p['ok'] for p in no_own)} ({100 * sum(p['ok'] for p in no_own) / max(1, len(no_own)):.1f}%);"
          f" with one: {len(P) - len(no_own)}; right {sum(p['ok'] for p in P if p not in no_own)} ({100 * sum(p['ok'] for p in P if p not in no_own) / max(1, len(P) - len(no_own)):.1f}%)")
