import json,collections,sys
D=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'out.json'))
sets=['hand','blind','broad','seen','new_identities','heldout_formulations']
def cls(x, wires, acts):
    # per gold request: right, wrong (same action, wrong args), wrong-act (no gold-act produced but some other act produced), not done
    pass
print("set n | demo-ok rules vss | per request rules R/W/ND(+wrongact) extra | vss R/W/ND extra")
T={'rules':collections.Counter(),'vss':collections.Counter()}
for s in sets:
    rows=[r for r in D if r['set']==s]; g=sum(len(r['wires']) for r in rows)
    line=f"{s:22s} {len(rows):4d} gold {g:4d} | demo {sum(r['demoOk']['rules'] for r in rows)/len(rows)*100:5.1f} {sum(r['demoOk']['vss'] for r in rows)/len(rows)*100:5.1f} |"
    for f in ['rules','vss']:
        R=sum(r[f]['right'] for r in rows); W=sum(r[f]['wrong'] for r in rows); M=sum(r[f]['missed'] for r in rows); E=sum(r[f]['extra'] for r in rows)
        # missed split: something else produced (wrong action) vs nothing
        MA=sum(r[f]['missed'] for r in rows if r[f]['acts'])
        T[f].update(dict(R=R,W=W,M=M,MA=MA,E=E,G=g))
        line+=f" {f} {R/g*100:5.1f}/{W/g*100:4.1f}/{M/g*100:5.1f} (wrong act {MA/g*100:4.1f}) x{E} |"
    print(line)
for f in T: t=T[f]; g=t['G']; print('ALL',f, f"{t['R']/g*100:.1f}/{t['W']/g*100:.1f}/{t['M']/g*100:.1f} (wrong act {t['MA']/g*100:.1f}) extra {t['E']}")
