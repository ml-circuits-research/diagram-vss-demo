"""scenes_r3/scene_score.py: per-request scores of scene_readers.mjs records (steps.jsonl): per reader, of the gold requests: right / wrong /
not done, extras; the share right of what it executed (precision); the cost score (right - 10 x (wrong + extras)) per 100 requests.
  python3 training/sketch/scenes_r3/scene_score.py <steps.jsonl>..."""
import json, sys
READERS = ["rules", "vss", "sop", "vb_all", "vb_gate"]
rows = [json.loads(l) for f in sys.argv[1:] for l in open(f) if l.strip()]
print(f"{len(rows)} steps, {sum(len(r['gold']) for r in rows)} gold requests")
print("| reader | right | wrong | not done | extra | precision of execution | cost score |")
print("|---|---|---|---|---|---|---|")
for rd in READERS:
    g = sum(len(r["gold"]) for r in rows)
    right = sum(p["o"] == "right" for r in rows for p in r["r"][rd]["prods"])
    wrong = sum(p["o"] == "wrong" for r in rows for p in r["r"][rd]["prods"])
    extra = sum(p["o"] == "extra" for r in rows for p in r["r"][rd]["prods"])
    nd = g - right - wrong
    ex = right + wrong + extra
    print(f"| {rd} | {right} ({100*right/g:.1f}%) | {wrong} ({100*wrong/g:.1f}%) | {nd} ({100*nd/g:.1f}%) | {extra} | {100*right/ex if ex else 0:.1f}% | {100*(right-10*(wrong+extra))/g:.1f} |")
