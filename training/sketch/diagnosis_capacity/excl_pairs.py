"""excl_pairs.py: the role pairs LEARNED from the training frames (fit train rows): two roles of one event that share a candidate kind,
each given in >= 5 training frames of that event, and never given together -> excl_pairs.json (the rule's data, no hand list)"""
import json, collections, itertools
HERE = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/capacity/"
R = [r for r in map(json.loads, open(HERE + "fit_frames.jsonl")) if r["split"] == "train"]
M = json.load(open("/home/claude/diagram-vss-demo/docs/model/fix_p80_s0/model.json")); sch = M["schema"]["roles"]
ev = {e["id"]: e["roles"] for e in M["legend"]["events"]}; co = collections.Counter(); one = collections.Counter()
for r in R:
    ks = [k for k in r["roles"] if k in sch]
    for k in ks: one[(r["ev"], k)] += 1
    for a, b in itertools.combinations(sorted(ks), 2): co[(r["ev"], a, b)] += 1
out = {}
for e, rs in ev.items():
    for a, b in itertools.combinations(sorted(rs), 2):
        ka = set(sch[a].get("head_kinds") or sch[a].get("kinds") or []); kb = set(sch[b].get("head_kinds") or sch[b].get("kinds") or [])
        if ka & kb and one[(e, a)] >= 5 and one[(e, b)] >= 5 and co[(e, a, b)] == 0: out.setdefault(e, []).append([a, b])
json.dump(out, open(HERE + "excl_pairs.json", "w"), indent=1); print(out)
