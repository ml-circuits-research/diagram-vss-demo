"""pin_logic.py: which copy of the Rules reader (docs/js/logic.js) the synth scripts read. LOGIC_JS (a file) if set; else logic.js as committed
at LOGIC_REV (default HEAD), copied once to synth/.logic_<rev>.js, so an edit of logic.js in the working tree during a run cannot change the
result; LOGIC_REV=worktree: the file on disk. Importing this module sets os.environ["LOGIC_JS"] for the node child processes
(check_rules.mjs, rules_inventory.mjs) and exposes LOGIC_JS (the path) and LOGIC_FROM (in words)."""
import os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
def _pin():
    if os.environ.get("LOGIC_JS"): return os.environ["LOGIC_JS"], os.environ.get("LOGIC_FROM", "file " + os.environ["LOGIC_JS"])
    rev = os.environ.get("LOGIC_REV", "HEAD")
    if rev == "worktree": return os.path.join(REPO, "docs", "js", "logic.js"), "working tree"
    sha = subprocess.run(["git", "-C", REPO, "rev-parse", "--short", rev], capture_output=True, text=True, check=True).stdout.strip()
    path = os.path.join(HERE, f".logic_{sha}.js")
    if not os.path.exists(path):
        open(path, "wb").write(subprocess.run(["git", "-C", REPO, "show", f"{rev}:docs/js/logic.js"], capture_output=True, check=True).stdout)
    return path, f"commit {sha}"
LOGIC_JS, LOGIC_FROM = _pin()
os.environ["LOGIC_JS"] = LOGIC_JS; os.environ["LOGIC_FROM"] = LOGIC_FROM
