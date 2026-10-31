"""prep_all.py: the fit / dev splits of ALL training messages (DATA=all, share 0.8 by front.split_of), as data2_p80_s0 was built.
Read only from training/sketch/llm_train (training messages, never a test set). Writes data/fit_all.jsonl, data/dev_all.jsonl and checks
that the given old-data files (fitset/fit.jsonl, review/dev.jsonl) are subsets of them."""
import json, os, sys
SK = "/home/claude/diagram-vss-demo/training/sketch"; sys.path.insert(0, SK)
os.environ["DATA"] = "all"
import front as FR
SP = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad"
msgs = FR.load_msgs()
fit = [m for m in msgs if FR.split_of(m, 0.8)]; dev = [m for m in msgs if not FR.split_of(m, 0.8)]
for n, L in (("fit_all", fit), ("dev_all", dev)):
    with open(f"{SP}/kinds/data/{n}.jsonl", "w") as fh:
        for m in L: fh.write(json.dumps(m) + "\n")
old = {"fit": [json.loads(l) for l in open(f"{SP}/fitset/fit.jsonl")], "dev": [json.loads(l) for l in open(f"{SP}/review/dev.jsonl")]}
for n, L in (("fit", fit), ("dev", dev)):
    by = {m["id"]: m for m in L}; o = old[n]
    same = sum(1 for m in o if m["id"] in by and by[m["id"]] == m); ids = sum(1 for m in o if m["id"] in by)
    print(f"{n}: all-data {len(L)} messages; old file {len(o)}, of which id present {ids}, identical {same}")
print("total messages", len(msgs))
