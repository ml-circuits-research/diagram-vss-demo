"""front_rows_check.py: does a micro-world's own front end (msg_to_world.py FRONT_ROWS=world) give every event of the world its trigger
rules? For each world of a grouping (worlds_micro/GROUPS_16.json, GROUPS_6.json) the front end is learned exactly as msg_to_world.py
FRONT_ROWS=world learns it (front.learn with keep = the world's events), and each request of the world's events is normalized as
msg_to_world.py normalizes a training row (front.normalize of its span, names = the message's names + the names created earlier in it).
Per event it reports: requests; trigger rules whose token is one of the event's tokens (generate.EVENTS); requests whose normalized row
holds a token of THIS event ("own token"); requests whose row holds a token of another event and none of its own ("other event's
token"; an event token is also a plain word: "move", "make", "which"); rows with no event token at all ("none"). The same counts with the global front end (learned from all the
messages, today's micro-worlds) are given for comparison. Nothing is trained; nothing is written except the report (--out).
Data: DATA (front.py TRAIN_DIRS; default spans, the setting of the micro-worlds). PYTHONHASHSEED fixes the order of ties (front.py
learn_values breaks a tie of two values by the iteration order of a set of strings; see ROUTER_V2.md).
python3 front_rows_check.py worlds_micro/GROUPS_6.json [worlds_micro/GROUPS_16.json ...] [--out FILE]"""
import collections, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
os.environ.setdefault("DATA", "spans")
import front as FR, generate as G
from llm_to_world import QUESTION_EVENT

ev_of = lambda w: w["args"].get("action") if w["type"] == "command" else QUESTION_EVENT.get(w["args"].get("ask")) if w["type"] == "question" else w["type"]
args = [a for a in sys.argv[1:]]; out = args[args.index("--out") + 1] if "--out" in args else None
files = [a for i, a in enumerate(args) if not a.startswith("--") and (i == 0 or args[i - 1] != "--out")]
msgs = FR.load_msgs(); P = json.load(open(os.path.join(HERE, "front_params.json")))
rows = []          # (event, span, names) as msg_to_world.py builds the rows
for m in msgs:
    created = []
    for w in m["wires"]:
        if w.get("span") and w["span"] in m["text"]: rows.append((ev_of(w), w["span"], list(m.get("names") or []) + list(created)))
        if w["type"] == "command" and w["args"].get("action") == "create" and w["args"].get("name"): created.append(w["args"]["name"])
TOK = {e: set(v) for e, v in G.EVENTS.items()}; ALLTOK = {t: e for e, v in G.EVENTS.items() for t in v}
F_all = FR.learn(msgs, P)
lines = [f"# front_rows_check: {len(msgs)} messages (DATA={os.environ['DATA']}), {len(rows)} requests with a span; PYTHONHASHSEED={os.environ.get('PYTHONHASHSEED', 'random')}", ""]


def counts(F, evs, e):
    R = [r for r in rows if r[0] == e]; c = collections.Counter()
    for _, span, names in R:
        toks, _ = FR.normalize(span, names, F); evt = {ALLTOK[t] for t in toks if t in ALLTOK}
        c["own" if e in evt else "other" if evt else "none"] += 1
    rules = sum(1 for t in F["triggers"] if t["tok"] in TOK[e])
    return len(R), rules, c


for gf in files:
    g = {k: v for k, v in json.load(open(gf)).items() if not k.startswith("_")}
    lines += [f"## {gf}", "", "| world | event | requests | rules (own front) | own token | other event's token | none | rules (global front) | own token (global) | other event's token (global) | none (global) |",
              "|---|---|---|---|---|---|---|---|---|---|---|"]
    for wd, evs in g.items():
        keep = lambda w, evs=evs: ev_of(w) in set(evs)
        F = FR.learn(msgs, P, keep=keep)
        for e in evs:
            n, r, c = counts(F, evs, e); _, rg, cg = counts(F_all, evs, e)
            pc = lambda k, C: f"{C[k]} ({100 * C[k] / n:.1f}%)" if n else "-"
            cg2 = cg
            lines.append(f"| {wd} | {e} | {n} | {r} | {pc('own', c)} | {pc('other', c)} | {pc('none', c)} | {rg} | {pc('own', cg2)} | {pc('other', cg2)} | {pc('none', cg2)} |")
        print(f"{gf}: {wd} done", file=sys.stderr, flush=True)
    lines.append("")
txt = "\n".join(lines) + "\n"; print(txt)
if out: open(out, "w").write(txt)
