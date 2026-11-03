"""scenes_r3/scene_replay.py: what the owner sees: the final drawings of scene_readers.mjs (final.json) against the gold drawing, per reader,
and for every gold shape that is missing or differs, whether the request that created it was read right (then the difference comes from the
drawing around it: an anchor placed elsewhere or missing, the engine's free-place search, an undo / delete of something else) or not.
  python3 training/sketch/scenes_r3/scene_replay.py <out dir>..."""
import collections, json, sys

READERS = ["rules", "vss", "sop", "vb_all", "vb_gate"]
for d in sys.argv[1:]:
    F = json.load(open(f"{d}/final.json")); steps = [json.loads(l) for l in open(f"{d}/steps.jsonl")]
    created = {}   # (scene, shape name lower) -> {reader: outcome of the gold create request}
    for x in steps:
        for j, g in enumerate(x["gold"]):
            w = g["want"]
            if w.get("action") in ("create", "duplicate") and w.get("name") and not w.get("count"):
                created[(x["scene"], w["name"])] = {r: next((p["o"] for p in x["r"][r]["prods"] if p["g"] == j), "not done") for r in READERS}
    print(f"## {d}: {len(F)} scenes, {sum(len(f['gold']['shapes']) for f in F)} gold shapes, {sum(len(f['gold']['edges']) for f in F)} arrows, {sum(len(f['gold']['groups']) for f in F)} groups\n")
    print("| reader | shapes as gold | missing | differ | extra shapes | arrows missing / extra | groups missing or wrong | differ: create read right (drawing around it) | differ: create read wrong |")
    print("|---|---|---|---|---|---|---|---|---|")
    what = {r: collections.Counter() for r in READERS}
    for r in READERS:
        same = miss = wr = ex = em = ee = gm = rr = rw = 0
        for f in F:
            D = f["readers"][r]; same += D["same"]; miss += len(D["missing"]); wr += len(D["wrong"]); ex += len(D["extra"])
            em += len(D["edges"]["missing"]); ee += len(D["edges"]["extra"]); gm += len(D["groups"]["missing"]) + len(D["groups"]["wrong"])
            for w in D["wrong"]:
                o = created.get((f["scene"], w["name"].lower()), {}).get(r)
                if o == "right": rr += 1
                else: rw += 1
                for t in w["what"]: what[r][t.split(" ")[0]] += 1
        n = sum(len(f["gold"]["shapes"]) for f in F)
        print(f"| {r} | {same} ({100 * same / n:.0f}%) | {miss} | {wr} | {ex} | {em} / {ee} | {gm} | {rr} | {rw} |")
    print("\nWhat differs in the shapes that differ (a shape counts once per attribute):\n")
    print("| reader | " + " | ".join(["pos", "size", "color", "fill", "layer", "shape", "label", "outline", "name"]) + " |")
    print("|---|" + "---|" * 9)
    for r in READERS: print(f"| {r} | " + " | ".join(str(what[r][k]) for k in ["pos", "size", "color", "fill", "layer", "shape", "label", "outline", "name"]) + " |")
    print()
