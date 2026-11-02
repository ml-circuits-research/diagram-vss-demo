import json,collections,re,sys
D=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'out.json'))
REL={'left_of':'leftof','right_of':'rightof','next_to':'near'}
REGION={'left_side':'left','right_side':'right'}
def tokval(t):
    t=t.lower(); t=REL.get(t,REGION.get(t,t)); t=t.replace('_','')
    if t.endswith('s') and t[:-1] in {'circle','square','rectangle','triangle','diamond','star','hexagon'}: t=t[:-1]
    if t=='ellipses': t='ellipse'
    return t
VALUEKEYS={'color','size','shape','position','superlative','comparison','style','arrow','pairing','property','kind','count','notcolor','quantifier','label','name','layout','direction','axis'}
def gold_atoms(k,v):
    # -> list of (kind, value) atoms of gold value v
    out=[]
    for p in re.split(r',(?![^(]*\))',v):
        m=re.match(r'mention\((.*)\)',p)
        if m:
            for kv in m.group(1).split(','):
                if '=' in kv: a,b=kv.split('=',1); out.append((a,b))
        else: out.append((k,p))
    return out
def present(atom,tokens,text):
    k,v=atom
    toks=tokens.split()
    if k in ('target','from','to','anchor','name','label') and ('n_'+v.replace(' ','_')) in toks: return True
    if 't_'+re.sub(r'[^a-z0-9]+','_',v) in toks: return True
    if v in toks: return True
    return any(tokval(t)==v for t in toks)
def cause(r, w, vbad):
    units=r['units']; GW=w['world']; GE=w['event'].lower()
    if not units: return 'A cut: no unit (cutter labels every token O)'
    # units with GW among candidates
    withGW=[u for u in units if any(c['world']==GW for c in u['candidates'])]
    if not withGW: return 'C cutter: gold world not among the 3 candidate worlds'
    # gold world's readings
    trs=[(u,t) for u in withGW for t in u['tried'] if t['world']==GW]
    evs=[(u,t) for u,t in trs if t['event'] and t['event'].lower()==GE]
    if not evs:
        if all(t['status'] in ('unknown-event','no-sense') for u,t in trs): return 'D gold world reads unknown-event / no-sense (no verb found)'
        return 'E gold world reads another event'
    u,t=evs[0]
    if u['zone']=='ignored': return 'F2 ignored (reading understood no word)'
    if u['world']!=GW or (u['event'] or '').lower()!=GE: return 'F router: another world/event chosen over the right reading'
    wrong=[b for b in vbad if not b.startswith('EXTRA') and not b.startswith('missing')]
    atoms=[a for k,v in w['args'].items() if k not in ('action','ask','scale') for a in gold_atoms(k,str(v).lower())]
    src=u['src'].lower()
    def intext(a):
        k,v=a; return v in r['text'].lower()
    outside=[a for a in atoms if intext(a) and a[1] not in src]
    if outside: return 'B cut: unit leaves out part of the request'
    if len(units)>len(r['wires']): return 'B2 cut: request split into several units'
    if u['zone']=='ask' and (u['world']!=GW or (u['event'] or '').lower()!=GE): return 'F router: another world/event chosen over the right reading'
    if u['zone']=='ask':
        ks={g['kind'] for g in (u.get('gaps') or []) if g['decision']=='ask'}
        if 'empty' in ks: return 'G1 asked: the reader left a needed role EMPTY (name/description not placed)'
        return 'G2 asked: pronoun / vague reference, no context in the row (honest)'
    # right world + event chosen: args wrong. cut first: are the gold atoms inside the unit?
    # front normalization: a gold atom not present as token in the chosen world's normalized unit
    toks=u.get('normalized') or ''
    miss=[a for a in atoms if a[0] not in ('quantifier',) and not present(a,toks,r['text'])]
    if miss: return 'H1 roles: front normalization (gold value word not a legend token)'
    return 'H2 roles wrong (value tokens present; reader placed them wrong)'
SYNSRC=open('syndata.py').read().split('spans=[]')[0]; exec(SYNSRC)
def synhit(r):
    a=json.dumps(r['wires'][0]['args']).lower()
    return any(re.search(r'\b'+re.escape(x)+r'\b',r['text'].lower()) and ((f'"{q}": "{v}"' in a) or (f'{q}={v}' in a)) for q in SYN for v,ss in SYN[q].items() for x in ss)
SY=collections.Counter()
C=collections.Counter(); EX=collections.defaultdict(list); bySet=collections.defaultdict(collections.Counter)
for r in D:
    # single-request rows only for the per-request cause; multi-wire rows: each wire with world among units
    if r['vss']['right']==len(r['wires']): continue
    for j,w in enumerate(r['wires']):
        if len(r['wires'])>1:
            c='M multi-request row (not classified)'
        else:
            c=cause(r,w,r['vss']['bad'])
        SY[c]+=synhit(r); C[c]+=1; bySet[r['set']][c]+=1; EX[c].append((r['set'],r['text'],w['event'],r['vss']['bad'][:2]))
tot=sum(C.values())
print('VSS gold requests not right:',tot)
for c,n in sorted(C.items()):
    print(f'{n:5d} {n/tot*100:5.1f}% syn {SY[c]:2d}  {c}   ', ' '.join(f"{s[:5]}:{bySet[s][c]}" for s in ['hand','blind','broad','seen','new_identities','heldout_formulations']))
if '-v' in sys.argv:
    for c in sorted(EX):
        print('\n==',c)
        for e in EX[c][:int(sys.argv[-1]) if sys.argv[-1].isdigit() else 6]: print('  ',e)
