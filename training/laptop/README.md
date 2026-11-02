# Training on a laptop with an NVIDIA card

Use this to run micro-world trainings (training/sketch/train_micro.sh) on a laptop. Everything runs in a Docker container (the box),
so it does not interfere with the owner's other work.

The first target is an MSI Creator M16: i7-11800H (8 cores, 16 threads), 16 GB of memory and an RTX 3050 Ti with 4 GB.

**What one training used, measured:**
- on the CPU: 1.2-1.5 GB of memory, with peaks of 3.3 GB;
- on a GPU (DGX, 2026-10-24): 0.5-1.3 GB allocated on the card (up to 1.8 GB reserved), plus ~2.5 GB of memory.

On a 4 GB card, that leaves room for about 2 trainings on the card. Others can run on the CPU at the same time.

## Host, once (the owner)

1. **Operating system:** Ubuntu 24.04 LTS (or 22.04).
2. **NVIDIA driver:** `sudo ubuntu-drivers install`. If Secure Boot asks for a MOK password, set one and enroll it at the reboot. Then
   check with `nvidia-smi`. It must show "CUDA Version: 13.x": torch 2.15.0 needs driver >= 580.
3. **Docker:** install Docker and the NVIDIA Container Toolkit (`nvidia-ctk runtime configure --runtime=docker`, then restart docker).
   Check with `docker run --rm --gpus all ubuntu nvidia-smi`.
4. **Claude desktop app:** install it (Linux beta: https://code.claude.com/docs/en/desktop-linux). Link the session to this
   computer and connect only the folder `~/vss-box`.

## The box (the coordinator, through the linked shell)

```
mkdir -p ~/vss-box && cd ~/vss-box
git clone https://github.com/ml-circuits-research/diagram-vss-demo.git          # public repository; no credentials needed
docker build -t vss-box diagram-vss-demo/training/laptop
docker run -d --name vss-box --gpus all --cpus 6 --memory 10g --memory-swap 10g \
  -v ~/vss-box:/box -w /box/diagram-vss-demo vss-box
docker exec vss-box python3 training/laptop/check_gpu.py                       # card, memory, CUDA
docker exec vss-box bash training/laptop/probe.sh                              # sentences/s on cuda and on cpu
```

- `--cpus 6 --memory 10g` keeps 10 threads and ~6 GB for the owner. Change them only with the owner's agreement.
- If 2 trainings share the card, give each `VSA_MEM_FRACTION=0.45` (vss/experiment/guard.py), so that one cannot take the other's
  memory.

## A training in the box

```
docker exec -d vss-box bash -c 'DEVICE=cuda VSA_MEM_FRACTION=0.45 DATA=spans FRONT_ROWS=world N_EVAL=150 EVAL_MODES=primary \
  VSA_MAX_HOURS=16 SOP_PYTHON=python3 bash training/sketch/train_micro.sh <world> <events> > /box/train_<world>.log 2>&1'
```

- **On the CPU:** use `DEVICE=cpu OMP_NUM_THREADS=2` instead, so CPU runs don't fight over threads.
- **Done signal:** a run is done when `docs/model/micro/<world>/BUILD.json` exists. BUILD.json records DEVICE.

**Results back.** The coordinator copies `docs/model/micro/<world>/` and `training/sketch/runs/micro_<world>_*` from `~/vss-box` into
its own checkout. It scores them there (node llm_score.mjs) and commits them. Nothing is pushed from the laptop.

**Shared queue.** The coordinator's queue scripts take a world by creating `claim_<world>`. To give a world to the laptop, create its
claim folder in the local queue's scratch folder first.

**Comparing results.** A model trained on the card may differ slightly in its numbers from one trained on the CPU. Compare variants
trained on the same device, or say which device each one used.

## Without a link: the git runner (Fedora, 2026-11-02)

The Claude desktop app's link needs Ubuntu or Debian, and the coordinator's cloud session cannot message a Remote Control session on
another machine. On a machine that can only be reached through git (the owner's Fedora box with a 4 GB card, a dedicated account, no
Docker), `runner.sh` is the channel: the coordinator pushes job scripts to the branch `gpu-runs` (jobs/<id>.sh), the runner runs them
and pushes back results/<id>.{log,exit} and the paths each job names (models, run logs). The coordinator fetches the branch, scores
the models here and commits them to main. Nothing from `gpu-runs` reaches main without the coordinator's check.

**Once, in the dedicated account** (the push key is a GitHub deploy key of this repository only, with write access):
```
ssh-keygen -t ed25519 -C "vss-gpu deploy key" -f ~/.ssh/vss_deploy -N ""
cat ~/.ssh/vss_deploy.pub        # GitHub: repository Settings -> Deploy keys -> Add deploy key, tick "Allow write access"
printf 'Host github-vss\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/vss_deploy\n  IdentitiesOnly yes\n' >> ~/.ssh/config
chmod 600 ~/.ssh/config
ssh -T git@github-vss            # "Hi ml-circuits-research/diagram-vss-demo! You've successfully authenticated"
cd ~/vss-box/diagram-vss-demo
git remote set-url origin git@github-vss:ml-circuits-research/diagram-vss-demo.git
git config user.name vss-gpu; git config user.email vss-gpu@users.noreply.github.com
git fetch origin && git checkout gpu-runs
tmux new -d -s runner 'cp training/laptop/runner.sh ~/vss-box/runner.sh && bash ~/vss-box/runner.sh 2>&1 | tee -a ~/vss-box/runner.log'
```
The first jobs set up Python 3.13 with `uv` in ~/vss-box/venv (numpy 2.5.4, torch 2.15.0, no sudo), check the card and measure
sentences/s on cuda and on cpu (probe.sh). A training job uses `DEVICE=cuda VSA_MEM_FRACTION=0.45` (2 on the card at once) or
`DEVICE=cpu OMP_NUM_THREADS=2`, and names `docs/model/micro/<world>` and its run logs on its `# PATHS:` line.
