"""lists.py: the list requests (gold has a set role members / targets) by the structure of the gold frame, and what the reader decodes
(roles missing / extra / wrong at the reader level), fit train rows and dev rows."""
import collections, json, sys
sys.argv = sys.argv[:1]
from analyze import FIT, DEV, ROLES, gcanon, dcanon
import analyze as A


def struct(r):
    rs = [k for k in ("source", "target", "object", "members", "targets") if k in r["roles"]]
    return "+".join(rs) + (" +pairing" if "pairing" in r["roles"] else "")


def shape(r):
    """kind sequence with runs of NAME / , / and compressed"""
    return " ".join(k if k in ("VERB", "NAME", "to", "and", "from", ",", "between", "with", "each_other", "PAIR", "LAYOUT", "AXIS") else "." for k in r["kinds"])


for nm, rows in (("fit train", [r for r in FIT if r["split"] == "train"]), ("dev", DEV)):
    L = [r for r in rows if r["pat"].startswith("P5")]
    print(f"\n## {nm}: {len(L)} list requests (pattern P5)\n\n| gold structure | n | command right | frame right | most common reader error |\n|---|---|---|---|---|")
    by = collections.defaultdict(list)
    for r in L: by[(r["ev"], struct(r))].append(r)
    for (ev, s), xs in sorted(by.items(), key=lambda x: -len(x[1])):
        err = collections.Counter()
        for r in xs:
            ev_ok, miss, extra, wrong = r["fr"]
            if r["frame_ok"]: continue
            err["event" if not ev_ok else ("miss " + ",".join(sorted(miss)) if miss else "") + (" extra " + ",".join(sorted(extra)) if extra else "") + (" wrong " + ",".join(sorted(wrong)) if wrong else "")] += 1
        top = "; ".join(f"{k.strip()} ({v})" for k, v in err.most_common(2))
        print(f"| {ev}: {s} | {len(xs)} | {sum(r['ok'] for r in xs)} | {sum(r['frame_ok'] for r in xs)} | {top} |")
