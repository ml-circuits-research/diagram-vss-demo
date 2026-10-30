"""
bench.py - cost of the E2 reader (learned soft attention, R = 2 centres per side) on ONE message of n tokens (synthetic: many requests
with chatter, world.long_message). Each size runs in a fresh process; reported: wall time of (preprocessing + states + readout of every
centre), the states alone, and the peak resident memory above the process baseline (VmHWM - RSS after model load).
Run: python bench.py            (all sizes)      python bench.py --one 1000   (one size, prints a JSON line)
"""
import argparse, json, os, subprocess, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def mem(field):
    with open("/proc/self/status") as f:
        for l in f:
            if l.startswith(field): return int(l.split()[1]) / 1024
    return float("nan")

def one(n, seed=0, chunk=4096):
    import numpy as np, torch, world as W, minivss as M
    torch.set_num_threads(1)                               # one core: the machine is shared with another run
    D = 256; tr, _, _ = W.splits(seed, 2000, 1, 1); lex = M.Lex(tr); st = M.StarTable(D, seed); rd = M.Reader(lex, st)
    mod = M.Rel(D, seed, R=2, learned=True)
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "results", f"e2_seed{seed}.pt")
    if os.path.exists(p): mod.load_state_dict(torch.load(p))
    m = W.long_message(seed + 99, n); st.ids(list(set(m["tokens"])))       # star cache warm (stars are a fixed table)
    base = mem("VmRSS:")
    t0 = time.time(); pp = [M.Prep(lex, m, mod.R)]; c = M.collate(pp, st, D); t1 = time.time()
    ts = []
    for _ in range(3):                                   # min of 3 (the machine is shared)
        a = time.time()
        with torch.no_grad(): S, _ = mod.states(c, chunk)
        ts.append(time.time() - a)
    t2 = time.time()
    out = M.rel_read_all(mod, lex, st, [m], batch=1, chunk=chunk)[0]          # again: prep + states + attachment windows
    frames = [rd.read(S_, win, 0.4)[0] for _, S_, win, _ in out]; t3 = time.time()
    return {"tokens": len(m["tokens"]), "centres": len(out), "prep_s": t1 - t0, "states_s": min(ts), "end_to_end_s": t3 - t2,
            "peak_extra_MB": mem("VmHWM:") - base, "state_bytes_per_centre": D * 8}

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--one", type=int); a = ap.parse_args()
    if a.one: print(json.dumps(one(a.one))); sys.exit()
    rows = []
    for n in (10, 100, 1000, 10000, 100000):
        r = subprocess.run([sys.executable, __file__, "--one", str(n)], capture_output=True, text=True)
        row = json.loads(r.stdout.strip().splitlines()[-1]); rows.append(row); print(row, flush=True)
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "results", "bench.json"), "w") as f: json.dump(rows, f, indent=1)
