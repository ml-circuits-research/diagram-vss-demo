"""make_oldheld.py: the text of the OLD held-out split (585 messages; RISK_COVERAGE.md, PRECISION.md; make_data.py split_messages with the
default seed 0 and no --all) as one data folder <out>/msg_01.jsonl, so that the collectors can read it and fit_report.mjs (CAL_FOLDERS) can
use it as calibration beside the fresh2 calibration part (FEEDBACK_PLAN.md). The messages are taken from the folders as they are now.
Always the DEFAULT 10% split of the original folders (EXTRA_DIRS is ignored here, so the split does not move when an arm adds folders).
Usage: python3 training/sketch/fresh2/make_oldheld.py <out dir>"""
import json, os, sys
os.environ.pop("EXTRA_DIRS", None)
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, "..", "..", "neural"))
import make_data as MD
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
train_msgs, held, _, _ = MD.split_messages(os.path.join(MD.HERE, "sample1000_ids.txt"), 0, False)
rows = [m for m in train_msgs if m["id"] in held]
with open(os.path.join(out, "msg_01.jsonl"), "w", encoding="utf8") as f:
    for m in rows: f.write(json.dumps({k: v for k, v in m.items() if k != "_dir"}, ensure_ascii=False) + "\n")
print(f"{len(rows)} messages, {sum(len(m.get('wires', [])) for m in rows)} requests -> {out}/msg_01.jsonl")
