"""memorization_split.py: which messages each reader trained on (MEMORIZATION.md). Writes id lists; reads only the annotated folders.
Usage: python3 training/sketch/memorization_split.py <outdir>
Sets (messages of the folders the shipped VSS worlds read, DATA=spans, no SHORT; and of SOP-BERT's pool):
  vss_cal      sha256(id|cal) < 0.08 (msg_to_world.py CAL_SHARE): the requests are in the worlds' calib.sop, never trained on by a world's core
  sop_held     SOP-BERT's 10% held-out (make_data.py split_messages, seed 0)
  sop_train    SOP-BERT's training messages
  sample       the fixed 1000-message sample (never in SOP-BERT; VSS worlds read it when it is in the spans folders)
"""
import hashlib, json, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, "..", "neural"))
import make_data as MD
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
VSS_DIRS = ["llm_train/sonnet_msg", "llm_train/haiku_msg", "llm_train/sonnet_msg2", "llm_train/haiku_msg2", "llm_train/sonnet_long",
            "llm_bench/fresh1/sonnet", "llm_bench/fresh1/haiku", "llm_bench/sonnet_spans", "llm_bench/haiku_spans"]
cal = lambda mid: int(hashlib.sha256((mid + "|cal").encode()).hexdigest()[:8], 16) / 2 ** 32 < 0.08
train_msgs, held, sample_msgs, missing = MD.split_messages(os.path.join(MD.HERE, "sample1000_ids.txt"), 0)
sop_train = {m["id"] for m in train_msgs if m["id"] not in held}; sample = {m["id"] for m in sample_msgs}
vss = {}
for m in MD.messages(VSS_DIRS): vss.setdefault(m["id"], m["_dir"])
S = {"sop_train": sop_train, "sop_held": set(held), "sample": sample, "vss_all": set(vss), "vss_cal": {i for i in vss if cal(i)}}
for k, v in S.items(): open(os.path.join(out, k + ".txt"), "w").write("\n".join(sorted(v)) + "\n")
print({k: len(v) for k, v in S.items()})
cells = {"cal&sop_train": S["vss_cal"] & S["sop_train"], "cal&sop_held": S["vss_cal"] & S["sop_held"], "cal&sample": S["vss_cal"] & S["sample"],
         "cal&other": S["vss_cal"] - S["sop_train"] - S["sop_held"] - S["sample"],
         "noncal&sop_held": (S["vss_all"] - S["vss_cal"]) & S["sop_held"], "noncal&sample": (S["vss_all"] - S["vss_cal"]) & S["sample"],
         "noncal&sop_train": (S["vss_all"] - S["vss_cal"]) & S["sop_train"]}
print({k: len(v) for k, v in cells.items()})
# which VSS parts saw a message of the VSS folders: world core (not vss_cal), front end (all), cutter cutter_worlds7s (not the *_spans folders),
# filler (not isTest: layer_common.mjs, FNV-1a of the id, id % 5 == 0 is the 20% test part)
def fnv(i):
    h = 2166136261
    for ch in i: h ^= ord(ch); h = (h * 16777619) & 0xFFFFFFFF
    return h
test = lambda i: fnv(i) % 5 == 0
spans = {i for i, d in vss.items() if d.endswith("_spans")}
sub = {"cal": S["vss_cal"], "cal&spansdir": S["vss_cal"] & spans, "cal&filler_test": {i for i in S["vss_cal"] if test(i)},
       "cal&spansdir&filler_test": {i for i in S["vss_cal"] & spans if test(i)}, "noncal&spansdir": (S["vss_all"] - S["vss_cal"]) & spans,
       "noncal&filler_test": {i for i in S["vss_all"] - S["vss_cal"] if test(i)}, "spansdir": spans, "filler_test": {i for i in vss if test(i)}}
print({k: len(v) for k, v in sub.items()})
for k, v in sub.items(): open(os.path.join(out, "part_" + k.replace("&", "_") + ".txt"), "w").write("\n".join(sorted(v)) + "\n")
for k, v in cells.items(): open(os.path.join(out, "cell_" + k.replace("&", "_") + ".txt"), "w").write("\n".join(sorted(v)) + "\n")
