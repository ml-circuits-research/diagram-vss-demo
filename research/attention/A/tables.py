"""tables.py - markdown tables (mean over seeds, and each seed) from results/*.json. Run: python tables.py e0 E0a E0b E0c | e1 test | e2 test"""
import json, os, sys, glob
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))

def load(exp):
    return [json.load(open(p)) for p in sorted(glob.glob(os.path.join(HERE, "results", f"{exp}_seed*.json")))]

COLS = ["all", "req1", "req2", "req3", "req4", "chat0", "chat1", "chat2"]
def table(rs, key, metrics=("acc", "extra_per100", "unseen_acc", "z_span_f1", "z_tok_f1", "z2_span_f1", "z2_tok_f1")):
    lines = ["| measure | " + " | ".join(COLS) + " |", "|---" * (len(COLS) + 1) + "|"]
    for mt in metrics:
        if mt not in rs[0][key]["all"]: continue
        cells = []
        for c in COLS:
            v = [r[key][c][mt] for r in rs if c in r[key] and r[key][c] is not None]
            if not v: cells.append("-"); continue
            sc = 100 if mt in ("acc", "unseen_acc") else (1 if mt == "extra_per100" else 100)
            cells.append(f"{np.mean(v) * sc:.1f} ({' / '.join(f'{x * sc:.1f}' for x in v)})")
        name = {"acc": "accuracy %", "extra_per100": "extras / 100 req", "unseen_acc": "acc. reqs with unseen name %", "z_span_f1": "zone span F1 (z) x100",
                "z_tok_f1": "chatter token F1 (z) x100", "z2_span_f1": "zone span F1 (z2) x100", "z2_tok_f1": "chatter token F1 (z2) x100"}[mt]
        lines.append(f"| {name} | " + " | ".join(cells) + " |")
    return "\n".join(lines)

if __name__ == "__main__":
    exp = sys.argv[1]; rs = load(exp)
    print(f"seeds: {[r['seed'] for r in rs]}")
    for key in sys.argv[2:]:
        print(f"\n{key} (mean over seeds, per seed in brackets)\n"); print(table(rs, key))
