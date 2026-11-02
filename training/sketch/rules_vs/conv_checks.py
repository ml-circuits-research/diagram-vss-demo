"""conv_checks.py: counts in the training spans (17 folders) behind the 'label convention' and 'phrasing absent' judgements of RULES_VS_LEARNED.md."""
import json, os, re, collections
ns = {'__file__': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'train_stats.py')}
exec(open(ns['__file__']).read().split('tot = collections.Counter()')[0], ns)
FOLD, rows = ns['FOLD'], ns['rows']
S = []   # (span text lower, wire, folder-is-short)
for d in FOLD:
    for r in rows(d):
        for w in r['wires']:
            S.append(((w.get('span') or r['text']).lower(), w, 'short' in d, d))
def act(w): return w['type'] + ':' + (w['args'].get('action') or w['args'].get('ask') or '')
def has(t, word): return re.search(rf'\b{word}\b', t) is not None
def rep(name, sel, test):
    xs = [(t, w) for t, w, sh, d in S if sel(t, w)]; n = len(xs); k = sum(1 for t, w in xs if test(t, w))
    print(f"{name}: {k}/{n}" + (f" = {k/n*100:.0f}%" if n else ""))
args = lambda w: w['args']
print('spans', len(S))
rep("spans with 'box(es)' (create/mention): shape=rectangle annotated", lambda t, w: has(t, 'box') or has(t, 'boxes'), lambda t, w: 'rectangle' in json.dumps(w['args']))
rep("connect spans with the word 'line' and no 'arrow': arrow=none annotated", lambda t, w: act(w) == 'command:connect' and has(t, 'line') and not has(t, 'arrow'), lambda t, w: args(w).get('arrow') == 'none')
rep("connect spans with 'joined/join' + 'line': arrow=none", lambda t, w: act(w) == 'command:connect' and has(t, 'line') and (has(t, 'join') or has(t, 'joined')), lambda t, w: args(w).get('arrow') == 'none')
rep("spans with 'last' + a shape word, anywhere in args: recency=newest", lambda t, w: has(t, 'last') and 'recency' in json.dumps(w['args']), lambda t, w: 'recency=newest' in json.dumps(w['args']))
rep("arrange spans with 'everything' or 'all': target mention(quantifier=all) written", lambda t, w: act(w) == 'command:arrange' and (has(t, 'everything') or has(t, 'all')), lambda t, w: 'quantifier=all' in json.dumps(w['args']))
rep("arrange spans with 'everything': target mention(quantifier=all)", lambda t, w: act(w) == 'command:arrange' and has(t, 'everything'), lambda t, w: 'quantifier=all' in json.dumps(w['args']))
rep("distribute spans: axis annotated", lambda t, w: act(w) == 'command:distribute', lambda t, w: 'axis' in args(w))
print('actions in training:', {a: c for a, c in collections.Counter(act(w) for t, w, sh, d in S).items() if a.split(':')[1] in ('group', 'ungroup', 'rules', '')})
print('spans with an outline key:', sum(1 for t, w, sh, d in S if 'outline' in json.dumps(w['args'])), ' with word outline:', sum(1 for t, w, sh, d in S if has(t, 'outline')))
print("spans with 'group' word:", sum(1 for t, w, sh, d in S if has(t, 'group') or has(t, 'groups')))
print("'at X, Y' coordinates (key 'at'):", sum(1 for t, w, sh, d in S if 'at' in args(w)))
rep("question:count spans with 'groups'", lambda t, w: act(w) == 'question:count' and (has(t, 'groups') or has(t, 'group')), lambda t, w: 'group' in json.dumps(w['args']))
rep("question:count spans with 'arrows|connections|edges|links': kind=edge", lambda t, w: act(w) == 'question:count' and any(has(t, x) for x in ['arrows', 'connections', 'edges', 'links']), lambda t, w: args(w).get('kind') == 'edge')
rep("spans 'the rules|defaults|rules': ask=rules", lambda t, w: w['type'] == 'question' and (has(t, 'rules') or has(t, 'defaults')), lambda t, w: args(w).get('ask') == 'rules')
rep("'how large/big/small is X': ask=property", lambda t, w: re.search(r'\bhow (large|big|small|tall|wide)\b', t) is not None, lambda t, w: act(w) == 'question:property')
rep("spans 'upper/top left|right corner/top right' create: position=topright/topleft", lambda t, w: act(w) == 'command:create' and re.search(r'(top|upper) (left|right)', t) is not None, lambda t, w: str(args(w).get('position','')).lower() in ('topleft', 'topright'))
rep("create spans with 'center' as place: position=center", lambda t, w: act(w) == 'command:create' and has(t, 'center'), lambda t, w: str(args(w).get('position','')).lower() == 'center')
rep("mention with 'not X' (notColor) in training mention strings", lambda t, w: 'notcolor' in json.dumps(w['args']).lower(), lambda t, w: True)
rep("delete spans: 'not <colour>' in span", lambda t, w: act(w) == 'command:delete' and re.search(r'\bnot (red|blue|green|yellow|black|white|gray|orange|purple)\b', t) is not None, lambda t, w: 'notcolor' in json.dumps(w['args']).lower())
print("delete spans in training:", sum(1 for t, w, sh, d in S if act(w) == 'command:delete'), 'with a mention target:', sum(1 for t, w, sh, d in S if act(w) == 'command:delete' and 'mention' in json.dumps(w['args'])))
print("typos: unseen words in 'cricles','yelow','Strat' -> n/a")
