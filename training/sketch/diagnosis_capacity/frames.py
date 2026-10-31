"""frames.py: the gold frame of every request IN THE READER'S TERMS (what sop train used as the target), next to what the reader saw.
For each row of ea_dump.mjs (fit_rows.jsonl / dev_rows.jsonl) the training row is rebuilt exactly as msg_to_world.py built it
(llm_to_world.convert, soft, on the tokens normalized with the model's own front.json and the gold created names), then:
  - kinds: the kind of each token as the route book sees it (model.json catalog / legend value patterns / unknown)
  - labels: per token position, the gold role(s) it fills (pred = the predicate lemma, the FIRST token of the event's verbs, as
    world.Compiler.lemma_for picks it; <role> = entity head or word filler; <role>.attr; <role>.det)
  - split: train (examples/train.sop) or calib (examples/calib.sop: never trained, used for the thresholds), by the same hash
Writes <name>_frames.jsonl. Checks the rebuilt train texts against runs/fix_p80_D1024_e2_s0/splits.json (multiset)."""
import collections, hashlib, json, re, sys
REPO = "/home/claude/diagram-vss-demo/"; sys.path.insert(0, REPO + "training/sketch")
from llm_to_world import convert, Skip
import generate as G
HERE = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/"
M = json.load(open(REPO + "docs/model/fix_p80_s0/model.json"))
LEXICON = set(M["lexicon"]); CAT = M["catalog"]["words"]; EVROLES = {e["id"]: e.get("roles") or [] for e in M["legend"]["events"]}
EVVERBS = {e["id"]: e["verbs"] for e in M["legend"]["events"]}; ROLES = [r["id"] for r in M["legend"]["roles"]]
PAT = [(v["kind"], re.compile("^(?:" + v["pattern"] + ")$")) for v in M["legend"]["values"]]
CATS = None   # the route book's kinds are the catalog kinds + unknown (checked against the JS dump below)


def kind(t):
    if t in CAT: return CAT[t]["kind"]
    if t.lower() in CAT: return CAT[t.lower()]["kind"]
    for k, p in PAT:
        if p.match(t): return k
    return "unknown"


def cal(mid): return int(hashlib.sha256((mid + "|cal").encode()).hexdigest()[:8], 16) / 2 ** 32 < 0.08


def labels(tokens, ev, roles):
    lab = [[] for _ in tokens]
    def mark(word, lbl):
        hit = [i for i, t in enumerate(tokens) if t == word]
        for i in hit: lab[i].append(lbl)
        return len(hit)
    pred = None
    for i, t in enumerate(tokens):
        if t in EVVERBS.get(ev, []): pred = i; lab[i].append("pred"); break
    for r, v in roles.items():
        if r not in ROLES: continue                       # not a legend role (notcolor): the reader has no key for it
        if isinstance(v, list):
            for x in v: mark(x["head"], r)
        elif isinstance(v, dict):
            mark(v["head"], r)
            if v.get("attr"): mark(v["attr"], r + ".attr")
            if v.get("det"): mark(v["det"], r + ".det")
        else: mark(str(v), r)
    return lab, pred


def main(name):
    msgs = {}
    for f in (HERE + "fitset/fit.jsonl", HERE + "review/dev.jsonl"):
        for l in open(f):
            if l.strip(): m = json.loads(l); msgs[m["id"]] = m
    out = open(HERE + f"capacity/{name}_frames.jsonl", "w"); texts = collections.Counter(); bad_kind = 0; skipped = collections.Counter()
    for l in open(HERE + f"capacity/{name}_rows.jsonl"):
        r = json.loads(l); m = msgs[r["id"]]
        created = []
        for w in m["wires"][:r["wi"]]:
            if w["type"] == "command" and w["args"].get("action") == "create" and w["args"].get("name"): created.append(w["args"]["name"])
        w = m["wires"][r["wi"]]; lost = []
        row = {"text": w["span"], "names": m.get("names") or [], "created": created, "wire": {"type": w["type"], "args": w["args"]}}
        toks = r["tokGold"]
        try: text, roles, ev = convert(row, LEXICON, soft=True, lost=lost, norm=lambda t, n: (list(toks), None))
        except Skip as e: skipped[str(e).split(":")[0]] += 1; ev, roles, text = None, {}, " ".join(toks)
        dropped = ev is None or (not (set(G.EVENTS[ev]) & set(text.split())) and not roles)
        ks = [kind(t) for t in r["tokens"]]
        if ks != r["kinds"]: bad_kind += 1
        lab, pred = labels(r["tokens"], ev, roles) if ev else ([[] for _ in r["tokens"]], None)
        split = "dev" if name == "dev" else ("dropped" if dropped else "calib" if cal(r["id"]) else "train")
        if split == "train": texts[text] += 1
        r.update({"ev": ev, "roles": roles, "lost": lost, "labels": lab, "pred": pred, "split": split})
        out.write(json.dumps(r) + "\n")
    print(name, "kind mismatch JS vs python:", bad_kind, "skipped:", dict(skipped))
    if name == "fit":
        sp = collections.Counter(json.load(open(REPO + "training/sketch/runs/fix_p80_D1024_e2_s0/splits.json"))["texts"]["train"])
        print("train texts rebuilt", sum(texts.values()), "in splits.json", sum(sp.values()), "multiset difference rebuilt-splits", sum((texts - sp).values()), "splits-rebuilt", sum((sp - texts).values()))
        for t, c in list((texts - sp).items())[:5]: print("  only rebuilt:", t)
        for t, c in list((sp - texts).items())[:5]: print("  only splits:", t)


if __name__ == "__main__":
    for n in sys.argv[1:]: main(n)
