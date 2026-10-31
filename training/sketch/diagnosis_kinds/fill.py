"""fill.py: puts the tables of stats_out.txt and the flip reasons of abl_<tag>_rule.json into KINDS.md (placeholders TABLE_FIX,
TABLE_DATA2, TABLE_MAPS, WHY_FIX)."""
import json
H = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/kinds/"
L = open(H + "stats_out.txt").read().split("\n")
def block(tag, header):
    i = L.index(f"######## {tag} ({'fix_p80_s0' if tag == 'fix' else 'data2_p80_s0'})")
    j = next(k for k in range(i, len(L)) if L[k].startswith(header))
    out = []
    for k in range(j, len(L)):
        if not L[k].startswith("|"): break
        out.append(L[k])
    return out
def ins(t):  # markdown separator after the header row
    n = t[0].count("|") - 1
    return [t[0], "|" + "---|" * n] + t[1:]
fixT = ins(block("fix", "| rank")); d2T = ins(block("data2", "| rank"))
maps = []
for tag in ("fix", "data2"):
    t = block(tag, "| map")
    maps += [f"**{tag}** (fit / dev as in section 1):", ""] + ins(t) + [""]
why = []
for tag in ("fix", "data2"):
    try: r = json.load(open(H + f"abl_{tag}_rule.json"))["runs"]
    except FileNotFoundError: continue
    for name, x in r.items():
        why.append(f"{tag} `{name}`: fit {json.dumps(x['fit'].get('why', {}))}; dev {json.dumps(x['dev'].get('why', {}))}")
s = open(H + "KINDS.md").read()
s = s.replace("TABLE_FIX", "\n".join(fixT)).replace("TABLE_DATA2", "\n".join(d2T)).replace("TABLE_MAPS", "\n".join(maps))
s = s.replace("WHY_FIX", "\n\n" + "\n".join("- " + w for w in why) + "\n")
open(H + "KINDS.md", "w").write(s)
print("filled", len(fixT), len(d2T), len(maps), len(why))
