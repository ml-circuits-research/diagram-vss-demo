"""
scale.py (implementer B) -- wall time and memory of the centre reader (E3c model, seed 0) on ONE message of N tokens.
Run: python scale.py            (spawns one fresh process per N, so that the peak memory of each size is measured on its own)
     python scale.py --n 10000  (one size)
The message: test_seen-style messages (1-4 requests, 0-2 chatter phrases) joined by " . " until N tokens.
Measured: encoding (python, O(N)), states (streamed prefix scans, states_stream), reading (all centres), total; peak RSS above the
baseline of the same process after loading the model; accuracy of the readings on the long message (should not depend on N).
"""
import argparse, json, os, resource, subprocess, sys, time
import numpy as np, torch
import world as W, vss as V

ap = argparse.ArgumentParser(); ap.add_argument("--n", type=int, default=0); ap.add_argument("--chunk", type=int, default=4096); ap.add_argument("--model", default="e3c")
a = ap.parse_args()


def rss_mb(): return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024


def long_message(N, seed=7):
    rng_msgs = W.dataset(seed, max(4, N // 8), [W.World(W.DIAGRAM)])
    toks, labels, reqs = [], [], []
    for M in rng_msgs:
        if len(toks) >= N: break
        if toks: toks.append("."); labels.append(-2)
        off = len(toks); base = len(reqs)
        for r in M["reqs"]:
            r = dict(r); r["act_pos"] += off; reqs.append(r)
        toks += M["toks"]; labels += [l + base if l >= 0 else l for l in M["labels"]]
    toks, labels = toks[:N], labels[:N]
    reqs = [r for r in reqs if r["act_pos"] < N]
    return {"toks": toks, "labels": labels, "reqs": reqs, "nreq": len(reqs), "nchat": 0, "nfalse": 0}


if a.n == 0:
    rows = []
    for N in [10, 100, 1000, 10000, 100000, 1000000]:
        o = subprocess.run([sys.executable, "scale.py", "--n", str(N), "--chunk", str(a.chunk), "--model", a.model], capture_output=True, text=True)
        line = [l for l in o.stdout.splitlines() if l.startswith("{")]
        if not line: print(o.stdout, o.stderr); continue
        r = json.loads(line[-1]); rows.append(r); print(json.dumps(r), flush=True)
    json.dump(rows, open(f"logs/scale_{a.model}.json", "w"), indent=1)
    sys.exit()

A = W.World(W.DIAGRAM); B_ = W.World(W.ERRANDS)
st = V.Stars(A.vocab() | B_.vocab(), [A, B_], 256, 0); V.set_stars(st)
m = V.CentreReader(len(A.kinds), 256, 0, null=True, ck=a.model == "e3d"); m.load_state_dict(torch.load(f"logs/main_s0_{a.model}.pt")); m.eval()
rc = V.ReadCtx(A, st)
M = long_message(a.n)
# warm-up on a tiny input (allocator, lazy init), then the baseline
b0 = V.encode_messages([long_message(50)], A, st); V.states_stream(m, b0)
base = rss_mb(); t0 = time.time()
b = V.encode_messages([M], A, st); t1 = time.time(); t_enc = t1 - t0
reps = []
for _ in range(3):
    ta = time.time(); S = V.states_stream(m, b, chunk=a.chunk); reps.append(time.time() - ta)
t2 = time.time(); t1 = t2 - min(reps); t0 = t1 - t_enc                    # states time = best of 3; total = encode + best states + read
with torch.no_grad():
    wL, wR, wS, n = m.weights(b)
sc = rc.scores(S); wins = V.centre_windows(b); ct = b.ctok.numpy(); nn = n.numpy()
trig = {r["act_pos"]: r for r in M["reqs"]}; ok = ex = 0; thr = 0.0
for c in range(b.C):
    rd = rc.read(sc, c, wins[c]); f = V.finalize(rd, thr); p = int(ct[c])
    if f is None or nn[p] >= 0.5: continue
    if p in trig: ok += f == V.gold_key(trig[p])
    else: ex += 1
t3 = time.time(); peak = rss_mb()
check = None
if a.n <= 10000:
    with torch.no_grad(): S2 = m.states(b)
    S = V.states_stream(m, b, chunk=64)                                      # many chunks: checks the carry
    check = float((S - S2).abs().max() / S2.abs().max())
print(json.dumps({"tokens": len(M["toks"]), "centres": int(b.C), "requests": len(M["reqs"]), "encode_s": round(t1 - t0, 4),
                  "states_s": round(t2 - t1, 4), "read_s": round(t3 - t2, 4), "total_s": round(t3 - t0, 4),
                  "peak_rss_above_base_mb": round(peak - base, 1), "base_rss_mb": round(base, 1), "acc": ok / max(1, len(M["reqs"])),
                  "extra": ex, "stream_vs_full_maxrelerr": check}))
