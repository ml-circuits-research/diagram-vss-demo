import json,collections,sys
"""agg.py <out.json>: the per-request table of short_bench.mjs, the two groups apart.
templates: written or generated from the rules' own templates, so they favour the Rules reader. llm_short: LLM-written one-line commands (the VSS cutter trained on them)."""
D=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'out.json'))
GROUPS=[('templates',['hand','blind','broad','seen','new_identities','heldout_formulations'],"written or generated from the rules' own templates: they favour the Rules reader"),
        ('llm_short',['llm_short'],"3000 LLM-written one-line commands with spans; the VSS cutter was trained on them")]
def demo(rows,f):
    if any(r['demoOk'] is None for r in rows): return '  -  '
    return f"{sum(r['demoOk'][f] for r in rows)/len(rows)*100:5.1f}"
print("set n | demo-ok rules vss | per request rules R/W/ND(+wrongact) extra | vss R/W/ND extra")
for gname,sets,note in GROUPS:
    if not any(r['set'] in sets for r in D): continue
    print(f"== {gname}: {note}")
    T={'rules':collections.Counter(),'vss':collections.Counter()}
    for s in sets:
        rows=[r for r in D if r['set']==s]
        if not rows: continue
        g=sum(len(r['wires']) for r in rows)
        line=f"{s:22s} {len(rows):4d} gold {g:4d} | demo {demo(rows,'rules')} {demo(rows,'vss')} |"
        for f in ['rules','vss']:
            R=sum(r[f]['right'] for r in rows); W=sum(r[f]['wrong'] for r in rows); M=sum(r[f]['missed'] for r in rows); E=sum(r[f]['extra'] for r in rows)
            MA=sum(r[f]['missed'] for r in rows if r[f]['acts'])
            T[f].update(dict(R=R,W=W,M=M,MA=MA,E=E,G=g))
            line+=f" {f} {R/g*100:5.1f}/{W/g*100:4.1f}/{M/g*100:5.1f} (wrong act {MA/g*100:4.1f}) x{E} |"
        print(line)
    for f in T: t=T[f]; g=t['G']; print(f'ALL {gname} {f}', f"{t['R']/g*100:.1f}/{t['W']/g*100:.1f}/{t['M']/g*100:.1f} (wrong act {t['MA']/g*100:.1f}) extra {t['E']}")
    rows=[r for r in D if r['set'] in sets and 'gated' in r['vss']]
    if rows:   # GATE=<level> (short_bench.mjs): VSS executes a request only when its confidence clears the level's threshold (PRECISION.md)
        G=collections.Counter()
        for r in rows: G.update(r['vss']['gated'])
        ex=G['r']+G['w']+G['e']; g=G['gold']; pc=lambda x: f"{x/g*100:.1f}"
        print(f"ALL {gname} vss gated {rows[0]['gate']}%: precision {G['r']/ex*100 if ex else 0:.1f} · right {pc(G['r'])} · asked {pc(G['ar']+G['aw'])} · unread {pc(g-G['r']-G['w']-G['ar']-G['aw'])} · executed wrong {pc(G['w'])} · extras executed {G['e']} (of {G['e']+G['ae']}) · executed {ex} of {G['n']} produced")
