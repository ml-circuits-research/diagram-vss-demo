"""summarize.py: markdown tables for CUT.md from the *.an.json files written by analyze.py (read-only).
  python3 summarize.py name=file.an.json ...
"""
import json, sys
from collections import Counter

runs = [(a.split("=")[0], json.load(open(a.split("=")[1]))) for a in sys.argv[1:]]
pc = lambda a, b: f"{100*a/b:.1f}%" if b else "-"

print("### Per annotated span: number of readings the cut makes in it (kept centres; found centres in brackets)\n")
print("| model | n | spans (found) | cut right | alone right |")
print("|---|---|---|---|---|")
for name, A in runs:
    for k in ["0", "1", "2", "3+"]:
        b = A["per_bin"].get(k, [0, 0, 0]); f = A["per_bin_found"].get(k, [0, 0, 0])
        if b[0] or f[0]:
            print(f"| {name} | {k} | {b[0]} ({f[0]}) | {b[1]} ({pc(b[1], b[0])}) | {b[2]} ({pc(b[2], b[0])}) |")
    print(f"| {name} | all | {A['G']} | {A['cut_right']} ({pc(A['cut_right'], A['G'])}) | {A['alone_right']} ({pc(A['alone_right'], A['G'])}) |")

print("\n### Extra wires by source\n")
keys = sorted(set(k for _, A in runs for k in A["extra_cls"]), key=lambda k: -sum(A["extra_cls"].get(k, 0) for _, A in runs))
print("| source | " + " | ".join(n for n, _ in runs) + " |"); print("|---|" + "---|" * len(runs))
for k in keys: print(f"| {k} | " + " | ".join(str(A["extra_cls"].get(k, 0)) for _, A in runs) + " |")
print("| total | " + " | ".join(str(A["extra"]) for _, A in runs) + " |")

print("\n### Missed requests (cut not right) by first cause; in brackets those the reader gets right ALONE (lost by the cut)\n")
keys = sorted(set(k for _, A in runs for k in A["miss_cls"]), key=lambda k: -sum(A["miss_cls"].get(k, 0) for _, A in runs))
print("| cause | " + " | ".join(n for n, _ in runs) + " |"); print("|---|" + "---|" * len(runs))
for k in keys: print(f"| {k} | " + " | ".join(f'{A["miss_cls"].get(k, 0)} ({A["loss_cls"].get(k, 0)})' for _, A in runs) + " |")
print("| total | " + " | ".join(f'{A["G"] - A["cut_right"]} ({sum(A["loss_cls"].values())})' for _, A in runs) + " |")

print("\n### Mechanisms: lost requests (alone right, cut not) / extra wires\n")
MECH = ["M1a", "M1b", "M1c", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M0"]
print("| mechanism | " + " | ".join(n for n, _ in runs) + " |"); print("|---|" + "---|" * len(runs))
for m in MECH:
    if any(A["mech_loss"].get(m, 0) or A["mech_extra"].get(m, 0) for _, A in runs):
        print(f"| {m} | " + " | ".join(f'{A["mech_loss"].get(m, 0)} / {A["mech_extra"].get(m, 0)}' for _, A in runs) + " |")
for name, A in runs:
    print(f"\n{name}: second-centre token sequences (per extra wire):", ", ".join(f"{k} {v}" for k, v in Counter(A["pair_ct"]).most_common(12)))
    print(f"{name}: extra wires by centre token:", ", ".join(f"{k} {v}" for k, v in Counter(A["extra_tok"]).most_common(12)))
