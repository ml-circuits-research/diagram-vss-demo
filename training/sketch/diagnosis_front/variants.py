import sys, json, time
from measure import *
base = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/"
fit = load(base + "fitset/fit.jsonl"); dev = load(base + "review/dev.jsonl")
VARS = [("baseline", (), {}), ("MASK", ("MASK",), {}), ("SUB", ("SUB",), {}), ("CTX2", ("CTX2",), {}), ("CLS", ("CLS",), {}),
        ("MASK+CTX2", ("MASK", "CTX2"), {}), ("MASK+SUB", ("MASK", "SUB"), {}), ("MASK+SUB+CTX2", ("MASK", "SUB", "CTX2"), {}),
        ("MASK+SUB+CTX2+CLS", ("MASK", "SUB", "CTX2", "CLS"), {}), ("MC1 (what-if)", (), {"trig_min_count": 1}), ("MASK+SUB+CTX2+MC1", ("MASK", "SUB", "CTX2"), {"trig_min_count": 1})]
res = {}
for name, opts, over in VARS:
    t = time.time(); F = learn_x(fit, dict(P, **over), opts)
    rf = measure(F, fit, opts)[0]; rd = measure(F, dev, opts)[0]
    res[name] = dict(rules=len(F["triggers"]), values=len(F["values"]), fit=rf, dev=rd)
    print(f"{name:22s} rules {len(F['triggers']):4d} vals {len(F['values']):3d} | FIT a {rf['a_no_event']:4d} b {rf['b_false_outside']:4d} c {rf['c_wrong_only']:4d} | DEV a {rd['a_no_event']:4d} b {rd['b_false_outside']:4d} c {rd['c_wrong_only']:4d}  ({time.time()-t:.0f}s)", flush=True)
json.dump(res, open("variants.json", "w"), indent=1)
