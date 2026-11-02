"""rules_right.py <all.json> <cases_lk.json>: (1) on the requests the Rules read right, what each learned reader does (executes right / right but asked by the gate / wrong / not done);
(2) the tally of the 100 hand-classified cases (CAUSE dict below, one line per case index of cases_in.json)."""
import json, sys, collections
D = json.load(open(sys.argv[1])); tV, tB = D['tV'], D['tB']; rows = D['rows']
groups = {'llm_short (1 request each)': ['llm_short'], 'written template sets (hand, blind, broad)': ['hand', 'blind', 'broad'], 'generated template sets (seen, new_identities, heldout_formulations)': ['seen', 'new_identities', 'heldout_formulations'],
          'help sentences (Rules reading = gold)': ['help'], 'fresh2 test part, all lengths': ['fresh2']}
import hashlib
print('| group | Rules right | reader | executes right | right but asked (gate) | wrong | not done |\n|---|---|---|---|---|---|---|')
for gname, sets in groups.items():
    rs = [r for r in rows if r['set'] in sets and (r['set'] != 'fresh2' or int(hashlib.sha256(r['id'].encode()).hexdigest(), 16) % 3 != 0)]
    n = sum(1 for r in rs for j in range(len(r['gold'])) if r['rules']['per'][j]['st'] == 'right')
    for rd, thr in [('vss', tV), ('sop', tB)]:
        c = collections.Counter()
        for r in rs:
            for j in range(len(r['gold'])):
                if r['rules']['per'][j]['st'] != 'right': continue
                p = r[rd]['per'][j]
                if p['st'] == 'right': c['ok' if p['c'] >= thr else 'asked'] += 1
                elif p['st'] == 'wrong': c['wrong'] += 1
                else: c['nd'] += 1
        pc = lambda k: f"{c[k]/n*100:.1f}%"
        print(f"| {gname} | {n} | {'VSS-G' if rd=='vss' else 'SOP-BERT-G'} | {pc('ok')} | {pc('asked')} | {pc('wrong')} | {pc('nd')} |")
