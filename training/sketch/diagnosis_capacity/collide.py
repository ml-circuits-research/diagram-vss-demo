"""collide.py: the collision test. What enters the reader's state for a request (reader.js chart / routebook.js addresses, the twin of
infer.py Routebook.addresses / v8_gates.V8.states): S = sum_j a_j(c) * F(token_j), where the address a_j depends ONLY on the kind
sequence c (path: cumulative phases of the kinds, bigram: kind pair, chainL: gates and pair phases of the kinds) and F is the fixed
hashed star of the word. So two requests with the same kind sequence and the same pattern of repeated words (which positions hold
the same word) get the same addresses; their decoded frames differ only in which words sit at the positions. Gold frames that need
different roles at the same position cannot both be read, whatever the training.

View of a row = (kinds, repeat pattern). Labels per position: pred / role / role.attr / role.det (frames.py). Two rows of one view
CONFLICT when (a) their gold predicate sits at different positions, or (b) for a role r that BOTH gold events take (legend event
roles: the decoder reads only those), r is at position p in one and not in the other. Differences in roles that only one of the two
events reads are not conflicts (one address can carry both keys). Per view: the largest set of mutually compatible signatures
(exact, brute force over distinct signatures) = the most rows any route book could read right; the rest are unavoidable misses."""
import collections, itertools, json, sys
sys.argv = sys.argv[:1]
from analyze import FIT, DEV, EVROLES
HERE = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/capacity/"


def view(r):
    first = {}; rep = []
    for i, t in enumerate(r["tokens"]): rep.append(first.setdefault(t, i))
    return (tuple(r["kinds"]), tuple(rep))


def sig(r):
    return (r["ev"], r["pred"], tuple(tuple(sorted(l)) for l in r["labels"]))


def conflict(a, b):
    (ea, pa, la), (eb, pb, lb) = a, b
    if pa != pb: return "pred position"
    shared = EVROLES.get(ea, set()) & EVROLES.get(eb, set())
    for p, (x, y) in enumerate(zip(la, lb)):
        for r in shared:
            for suf in ("", ".attr", ".det"):
                if ((r + suf) in x) != ((r + suf) in y): return f"role {r}{suf} at {p}"
    return None


def best_compatible(sigs):
    """sigs: Counter of signatures -> (max rows of a mutually compatible subset, that subset)"""
    S = list(sigs); n = len(S)
    C = [[conflict(S[i], S[j]) is not None for j in range(n)] for i in range(n)]
    if n > 16:          # greedy by weight (never reached on these data, kept for safety)
        keep = []
        for i in sorted(range(n), key=lambda i: -sigs[S[i]]):
            if all(not C[i][j] for j in keep): keep.append(i)
        return sum(sigs[S[i]] for i in keep), {S[i] for i in keep}
    best = (0, set())
    for mask in range(1, 1 << n):
        idx = [i for i in range(n) if mask >> i & 1]
        if any(C[i][j] for i, j in itertools.combinations(idx, 2)): continue
        w = sum(sigs[S[i]] for i in idx)
        if w > best[0]: best = (w, {S[i] for i in idx})
    return best


if __name__ == "__main__":
    train = [r for r in FIT if r["split"] == "train"]
    groups = collections.defaultdict(list)
    for r in train: groups[view(r)].append(r)
    unavoid = set(); out = []; reasons = collections.Counter()
    for v, rs in groups.items():
        sigs = collections.Counter(sig(r) for r in rs)
        if len(sigs) < 2: continue
        w, keep = best_compatible(sigs)
        if w == len(rs): continue
        lost = [r for r in rs if sig(r) not in keep]
        for r in lost:
            unavoid.add((r["id"], r["wi"]))
            for k in keep:
                c = conflict(sig(r), k)
                if c: reasons[c.split(" at ")[0]] += 1; break
        out.append({"kinds": " ".join(v[0]), "n": len(rs), "readable_at_most": w,
                    "rows": [{"tokens": " ".join(r["tokens"]), "ev": r["ev"], "roles": r["roles"], "ok": r["ok"], "kept": sig(r) in keep} for r in rs][:12]})
    out.sort(key=lambda x: -(x["n"] - x["readable_at_most"]))
    json.dump(out, open(HERE + "collisions.json", "w"), indent=1)
    nv = len(groups); multi = sum(1 for rs in groups.values() if len(rs) > 1)
    print(f"train rows {len(train)}, distinct views {nv} ({multi} with 2+ rows; rows in shared views {sum(len(rs) for rs in groups.values() if len(rs) > 1)})")
    print(f"views with incompatible gold frames: {len(out)}; rows no route book can read right (beyond the best compatible subset): {len(unavoid)} "
          f"({100 * len(unavoid) / len(train):.1f}% of the train rows); by first conflict: {dict(reasons)}")
    wrong = [r for r in train if not r["ok"]]
    print(f"train rows read wrong: {len(wrong)}; of them in a conflicting view's lost part: {sum(1 for r in wrong if (r['id'], r['wi']) in unavoid)}")
    print("\nby pattern: train n | wrong | wrong and unavoidable (collision)")
    for p in sorted({r["pat"] for r in train}):
        xs = [r for r in train if r["pat"] == p]; wr = [r for r in xs if not r["ok"]]
        print(f"| {p} | {len(xs)} | {len(wr)} | {sum(1 for r in wr if (r['id'], r['wi']) in unavoid)} | all-collided rows {sum(1 for r in xs if (r['id'], r['wi']) in unavoid)} |")
    print("\nlargest conflicting views:")
    for o in out[:14]:
        print(f"- [{o['kinds']}] n={o['n']} readable at most {o['readable_at_most']}")
        for x in o["rows"][:5]: print(f"     {'K' if x['kept'] else '-'} {'ok' if x['ok'] else 'xx'} {x['tokens']} | {x['ev']} {json.dumps(x['roles'])}")
    # dev: rows whose view exists in training, and whose gold conflicts with the training rows of that view
    dv = [r for r in DEV]; seen = [r for r in dv if view(r) in groups]
    conf = []
    for r in seen:
        sigs = collections.Counter(sig(x) for x in groups[view(r)]); w, keep = best_compatible(sigs)
        if any(conflict(sig(r), k) for k in keep): conf.append(r)
    print(f"\ndev rows {len(dv)}; view seen in training {len(seen)} (right {sum(r['ok'] for r in seen)}); unseen view {len(dv) - len(seen)} (right {sum(r['ok'] for r in dv if view(r) not in groups)});"
          f" dev gold conflicting with the readable training frames of its view: {len(conf)} (right {sum(r['ok'] for r in conf)})")
