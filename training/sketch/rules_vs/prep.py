"""prep.py: turn the template sets docs/bench/*.json into msg_01.jsonl folders (id, text, names, wires) that the fresh2 collectors read.
Gold action case fixed as in short_bench.mjs (tofront -> toFront, toback -> toBack)."""
import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
CASE = {'tofront': 'toFront', 'toback': 'toBack'}
def fix(a):
    if a and a.get('action') in CASE: a = {**a, 'action': CASE[a['action']]}
    return a
for s in ['hand', 'blind', 'broad', 'seen', 'new_identities', 'heldout_formulations']:
    rows = json.load(open(f'{ROOT}/docs/bench/{s}.json'))
    out = []
    for i, r in enumerate(rows):
        ws = r['wires'] if 'wires' in r else [r]
        wires = [{'type': w['type'], 'args': fix(w.get('gold', w.get('args')))} for w in ws]
        out.append({'id': f'{s}-{i:04d}', 'text': r['text'], 'names': r.get('names', []), 'wires': wires, 'cat': r.get('cat') or r.get('template')})
    d = f'{ROOT}/training/sketch/rules_vs/data/{s}'; os.makedirs(d, exist_ok=True)
    with open(f'{d}/msg_01.jsonl', 'w') as f:
        for o in out: f.write(json.dumps(o) + '\n')
    print(s, len(out))
