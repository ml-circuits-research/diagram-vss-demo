"""
trainer.py — the ONE training loop for the operator scripts (round 10 A2, rule 21): memory logged every N steps, no graph-carrying tensor
survives a step, checkpoints every M steps with --resume, finite-loss assertion.
    train_loop(model, params, cats, ids, mask, tgt, batch, lr, log_every=500, ckpt=None, resume=False, tag="")
model: has .states(cats, ids, mask) and .theta (root row zeroed after each step, as in v8); params: list of tensors for Adam.
Logs one line per log_every steps: step, loss (as .item()), process RSS (GB), torch allocated / reserved (GB), MemAvailable (GB).
Checkpoint: {"step", "params", "opt"} saved to ckpt every ckpt_every steps and at the end; with resume=True training continues from it.
batch_fn (optional, with n): the rows are not held as whole tensors; batch_fn(i, j) -> (cats, ids, mask, tgt, states_kwargs) builds the
batch of the sentences i..j-1 when it is needed (tool/sop/train.py: memory bounded by one step). stop_after > 0 stops after that many
steps and loss_every_step prints every step's loss in full precision (debugging / equivalence checks; both off by default).
"""
import os, time, torch

def _rss_gb():
    with open("/proc/self/status") as f:
        for line in f:
            if line.startswith("VmRSS:"): return int(line.split()[1]) / 1024 ** 2
    return float("nan")

def _hwm_gb():
    with open("/proc/self/status") as f:
        for line in f:
            if line.startswith("VmHWM:"): return int(line.split()[1]) / 1024 ** 2
    return float("nan")

def _avail_gb():
    with open("/proc/meminfo") as f:
        for line in f:
            if line.startswith("MemAvailable:"): return int(line.split()[1]) / 1024 ** 2
    return float("nan")

def mem_line():
    dev = f"torch alloc {torch.cuda.memory_allocated() / 1024**3:.2f} GB reserved {torch.cuda.memory_reserved() / 1024**3:.2f} GB" if torch.cuda.is_available() else "cpu"
    return f"RSS {_rss_gb():.2f} GB (peak {_hwm_gb():.2f} GB) | {dev} | MemAvailable {_avail_gb():.1f} GB"

def train_loop(model, params, cats, ids, mask, tgt, batch, lr, log_every=500, ckpt=None, ckpt_every=2000, resume=False, tag="",
               batch_fn=None, n=None, stop_after=0, loss_every_step=False):
    opt = torch.optim.Adam(params, lr=lr, betas=(0.9, 0.999), eps=1e-8); start = 0
    if batch_fn is None:
        n = cats.shape[0]; batch_fn = lambda i, j: (cats[i:j], ids[i:j], mask[i:j], tgt[i:j], {})
    if resume and ckpt and os.path.exists(ckpt):
        st = torch.load(ckpt, map_location=params[0].device)
        with torch.no_grad():
            for p, v in zip(params, st["params"]): p.copy_(v)
        opt.load_state_dict(st["opt"]); start = st["step"]; print(f"[train{tag}] resumed from {ckpt} at step {start}", flush=True)
    t0 = time.time(); last = None
    print(f"[train{tag}] start: {mem_line()}", flush=True)
    for i in range(start, n, batch):
        cb, ib, mb, t, kw = batch_fn(i, min(i + batch, n)); S = model.states(cb, ib, mb, **kw)
        cos = torch.real((torch.conj(t) * S).sum(-1)) / (S.abs().pow(2).sum(-1).sqrt() * t.abs().pow(2).sum(-1).sqrt())
        assert torch.isfinite(cos).all(), f"non-finite loss at step {i}: a target or state is NaN (check the world)"
        loss = -cos.mean(); opt.zero_grad(set_to_none=True); loss.backward(); opt.step(); last = loss.item()     # .item(): no graph survives
        with torch.no_grad(): model.theta[0] = 0
        del S, t, cos, loss, cb, ib, mb
        step = (i // batch) + 1
        if loss_every_step: print(f"[train{tag}] step {step} loss {last!r}", flush=True)
        if step % log_every == 0: print(f"[train{tag}] step {step} sent {i + batch}/{n} loss {last:.3f} ({time.time()-t0:.0f}s) | {mem_line()}", flush=True)
        if ckpt and step % ckpt_every == 0:
            torch.save({"step": i + batch, "params": [p.detach().clone() for p in params], "opt": opt.state_dict()}, ckpt)
        if stop_after and step >= stop_after:
            print(f"[train{tag}] stopped after {step} steps (stop_after)", flush=True); break
    if ckpt: torch.save({"step": n, "params": [p.detach().clone() for p in params], "opt": opt.state_dict()}, ckpt)
    if torch.cuda.is_available(): torch.cuda.empty_cache()
    print(f"[train{tag}] end: {mem_line()} ({time.time()-t0:.0f}s)", flush=True)
    for p in params: p.grad = None          # the last step's gradients are not needed after training (a parameter-sized buffer each)
    return last
