"""pin_logic.py: which copy of the Rules reader (docs/js/logic.js) the synth scripts read. LOGIC_JS (a file) if set; else logic.js as committed
at LOGIC_REV (default HEAD), copied once (with the rest of docs/js) to synth/.logic_<rev>/, so an edit of logic.js in the working tree during a run cannot change the
result; LOGIC_REV=worktree: the file on disk. Importing this module sets os.environ["LOGIC_JS"] for the node child processes
(check_rules.mjs, rules_inventory.mjs) and exposes LOGIC_JS (the path) and LOGIC_FROM (in words)."""
import os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
def _pin():
    if os.environ.get("LOGIC_JS"): return os.environ["LOGIC_JS"], os.environ.get("LOGIC_FROM", "file " + os.environ["LOGIC_JS"])
    rev = os.environ.get("LOGIC_REV", "HEAD")
    if rev == "worktree": return os.path.join(REPO, "docs", "js", "logic.js"), "working tree"
    sha = subprocess.run(["git", "-C", REPO, "rev-parse", "--short", rev], capture_output=True, text=True, check=True).stdout.strip()
    # the whole docs/js of that commit (logic.js requires templates.js, help-answers.js, auto-layout.js ... next to it)
    d = os.path.join(HERE, f".logic_{sha}"); path = os.path.join(d, "docs", "js", "logic.js")
    if not os.path.exists(path):
        os.makedirs(d, exist_ok=True)
        tar = subprocess.run(["git", "-C", REPO, "archive", rev, "docs/js"], capture_output=True, check=True).stdout
        subprocess.run(["tar", "-x", "-C", d], input=tar, check=True)
    return path, f"commit {sha}"
LOGIC_JS, LOGIC_FROM = _pin()
os.environ["LOGIC_JS"] = LOGIC_JS; os.environ["LOGIC_FROM"] = LOGIC_FROM
