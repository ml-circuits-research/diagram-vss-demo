"""check_gpu.py: what the box can use. Prints torch and CUDA versions, the card, its memory, and the time of a small matrix product
on the card and on the CPU (a sanity check only: the real speed is measured by probe.sh on a micro-world)."""
import os, time
import torch

print(f"torch {torch.__version__}, built for CUDA {torch.version.cuda}, CPU threads {torch.get_num_threads()}, cores visible {os.cpu_count()}")
with open("/proc/meminfo") as f: mem = {l.split(":")[0]: int(l.split()[1]) for l in f}
print(f"memory: total {mem['MemTotal'] / 2**20:.1f} GB, available {mem['MemAvailable'] / 2**20:.1f} GB")
if not torch.cuda.is_available():
    raise SystemExit("CUDA not available: check the driver (nvidia-smi on the host) and that the container runs with --gpus all")
p = torch.cuda.get_device_properties(0); free, total = torch.cuda.mem_get_info()
print(f"card: {p.name}, compute {p.major}.{p.minor}, memory {total / 2**30:.2f} GB (free {free / 2**30:.2f} GB)")
for dev in ("cuda", "cpu"):
    a = torch.randn(1024, 1024, device=dev); b = torch.randn(1024, 1024, device=dev)
    for _ in range(3): a @ b
    if dev == "cuda": torch.cuda.synchronize()
    t0 = time.time()
    for _ in range(50): a @ b
    if dev == "cuda": torch.cuda.synchronize()
    print(f"{dev}: 50 products 1024x1024 in {time.time() - t0:.3f} s")
