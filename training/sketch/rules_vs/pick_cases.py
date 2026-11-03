"""pick_cases.py <all.json> <out.json>: 100 cases where the Rules are right (the request, exact) and a learned reader is not right (or is right but asks).
Fixed seed. Pools: llm_short, the written template sets (hand+blind+broad), the demo's help sentences."""
import json, sys, random
D = json.load(open(sys.argv[1])); tV, tB = D['tV'], D['tB']; rows = D['rows']; random.seed(20261102)
def pool(sets, reader, kind):
    out = []
    thr = {'vss': tV, 'sop': tB}[reader]
    for r in rows:
        if r['set'] not in sets: continue
        for j, g in enumerate(r['gold']):
            if r['rules']['per'][j]['st'] != 'right': continue
            p = r[reader]['per'][j]
            if kind == 'fail' and p['st'] != 'right': out.append((r, j, p['st']))
            if kind == 'ask' and p['st'] == 'right' and p['c'] < thr: out.append((r, j, 'asked'))
    return out
plan = [(['llm_short'], 'vss', 'fail', 30), (['llm_short'], 'sop', 'fail', 15), (['llm_short'], 'vss', 'ask', 5), (['llm_short'], 'sop', 'ask', 5),
        (['hand', 'blind', 'broad'], 'vss', 'fail', 13), (['hand', 'blind', 'broad'], 'sop', 'fail', 12), (['help'], 'vss', 'fail', 10), (['help'], 'sop', 'fail', 10)]
sel = []
for sets, rd, kind, n in plan:
    P = pool(sets, rd, kind); print(sets, rd, kind, 'pool', len(P), 'take', n)
    for r, j, st in random.sample(P, min(n, len(P))): sel.append({'set': r['set'], 'id': r['id'], 'j': j, 'reader': rd, 'kind': kind, 'status': st, 'text': r['text'], 'names': r['names'], 'gold': r['gold'][j], 'conf': r[rd]['per'][j].get('c')})
json.dump(sel, open(sys.argv[2], 'w'), indent=1); print(len(sel))
