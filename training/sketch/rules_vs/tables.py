"""tables.py <all.json>: the tables of RULES_VS_LEARNED.md (markdown to stdout). Cells: right % / wrong % / not done %  · extras (count executed).
Gated = executed only when the confidence of docs/model/confidence/*.json (cost level) clears the threshold; below it the request is asked (counted not done)."""
import json, sys, re, hashlib, collections
D = json.load(open(sys.argv[1])); tV, tB = D['tV'], D['tB']; rows = D['rows']
def cell(rs, reader, gated):
    g = R = W = E = 0; ex = 0
    for r in rs:
        rd = r[reader]; g += len(r['gold'])
        thr = {'vss': tV, 'sop': tB}.get(reader, -1e9) if gated else -1e9
        for p in rd['per']:
            if p['st'] in ('right', 'wrong') and (p.get('c') is None or p['c'] >= thr):
                R += p['st'] == 'right'; W += p['st'] == 'wrong'
        if reader == 'rules': E += len(rd['extras'])
        else: E += sum(1 for x in rd['extras'] if x['c'] >= thr)
    return g, R, W, E
def fmt(c): g, R, W, E = c; return f"{R/g*100:.1f}% / {W/g*100:.1f}% / {(g-R-W)/g*100:.1f}% · {E}"
def table(title, groups):
    print(f"\n**{title}**\n\n| situation | requests | Rules | VSS-G | VSS-G gated | SOP-BERT-G | SOP-BERT-G gated |\n|---|---|---|---|---|---|---|")
    for name, rs in groups:
        if not rs: continue
        g = sum(len(r['gold']) for r in rs)
        print(f"| {name} | {g} | " + " | ".join(fmt(cell(rs, rd, gt)) for rd, gt in [('rules', 0), ('vss', 0), ('vss', 1), ('sop', 0), ('sop', 1)]) + " |")
by = lambda s: [r for r in rows if r['set'] == s]
ls = by('llm_short')
cmd = lambda r: all(a.startswith('command') for a in [g['act'] for g in r['gold']])
qst = lambda r: all(not a.startswith('command') for a in [g['act'] for g in r['gold']])
print("cell = right % / wrong % / not done %  (of requested actions) · extras executed (requests nobody asked for)\n")
table("(a) llm_short: 3000 one-line commands (1 request each)", [('all', ls), ('written by Sonnet', [r for r in ls if r['src'] == 'sonnet_short']), ('written by Haiku', [r for r in ls if r['src'] == 'haiku_short']),
  ('commands', [r for r in ls if cmd(r)]), ('questions / facts / rules', [r for r in ls if qst(r)])])
acts = collections.Counter(r['gold'][0]['act'] for r in ls)
table("(a2) llm_short by action (actions with >= 40 messages)", [(a, [r for r in ls if r['gold'][0]['act'] == a]) for a, n in acts.most_common() if n >= 40])
table("(d) the demo's own example sentences (help.js, docs-concepts.js): gold = the Rules' reading, so Rules = agreement by construction", [('help sentences, one request', by('help'))])
T = ['hand', 'blind', 'broad', 'seen', 'new_identities', 'heldout_formulations']
table("(b) the six template short sets (written by the Rules' author or generated from the Rules' own cues: they favour the Rules)", [(s, by(s)) for s in T] + [('written by hand (hand+blind+broad)', [r for s in 'hand blind broad'.split() for r in by(s)]), ('all six', [r for s in T for r in by(s)])])
f2 = [r for r in rows if r['set'] == 'fresh2' and int(hashlib.sha256(r['id'].encode()).hexdigest(), 16) % 3 != 0]
ns = lambda r: len([x for x in re.split(r'(?<=[.!?])\s+', r['text'].strip()) if x])
print(f"\n(fresh2 test part: {len(f2)} messages, {sum(len(r['gold']) for r in f2)} requests; calibration part left out)")
table("(c) fresh2 test part by number of sentences (descriptive; this part was already read)", [('1 sentence', [r for r in f2 if ns(r) == 1]), ('2-6 sentences', [r for r in f2 if 2 <= ns(r) <= 6]), ('7+ sentences', [r for r in f2 if ns(r) >= 7]), ('all', f2)])
print('\nmessages per group:', {k: len(v) for k, v in {'fresh2 1': [r for r in f2 if ns(r) == 1], 'fresh2 2-6': [r for r in f2 if 2 <= ns(r) <= 6], 'fresh2 7+': [r for r in f2 if ns(r) >= 7]}.items()})
print('requests per message in llm_short:', collections.Counter(len(r['gold']) for r in ls))
