"""lookup.py <cases_out.json> <cases_lookup.json>: for each picked case, is the construction in the training data of the learned readers?
Training spans = every wire span of the 17 folders of train_stats.py (SOP-BERT-G trains on all of them; the VSS-G worlds on all but sonnet_short / haiku_short, the cutter on those too).
Checks (skeletons: names/colours/shapes/sizes/numbers masked): exact = same skeleton as a training span with the same act; pre3 = the first 3 skeleton words start a training span of the same act;
bi = share of the case's word pairs that occur in training spans of the same act; trig_n = training spans of this act that contain the case's first skeleton word."""
import json, sys, re, collections, os, glob
sys.path.insert(0, os.path.dirname(__file__))
import importlib.util
spec = importlib.util.spec_from_file_location('ts', os.path.join(os.path.dirname(__file__), 'train_stats.py'))
# avoid re-running train_stats: copy the small helpers
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')); SK = ROOT + '/training/sketch'
src = open(os.path.join(os.path.dirname(__file__), 'train_stats.py')).read()
ns = {'__file__': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'train_stats.py')}; exec(src.split('tot = collections.Counter()')[0], ns)
FOLD, rows, skel = ns['FOLD'], ns['rows'], ns['skel']
exact = collections.defaultdict(collections.Counter); exact_w = collections.defaultdict(collections.Counter); pre3 = collections.defaultdict(set); bi = collections.defaultdict(set); first = collections.defaultdict(collections.Counter)
exact_any = set(); wcount = collections.Counter(); owner = collections.defaultdict(set)
for d in FOLD:
    short = 'short' in d
    for r in rows(d):
        for w in r['wires']:
            sp = w.get('span') or r['text']; a = w['type'] + ':' + (w['args'].get('action') or w['args'].get('ask') or '')
            s = skel(sp, r.get('names') or []); t = s.split()
            exact[a][s] += 1; exact_any.add(s); owner[(a, s)].add(r['id'])
            if not short: exact_w[a][s] += 1; pre3[a].add(' '.join(t[:3]))
            for x in zip(t, t[1:]): bi[a].add(x)
            for x in set(t): first[a][x] += 1
            for x in set(t): wcount[x] += 1
C = json.load(open(sys.argv[1])); out = []
for c in C:
    a = c['gold']['act']; sp = c['gold'].get('span') or c['text']; s = skel(sp, c['names']); t = s.split()
    pairs = list(zip(t, t[1:])); bs = sum(1 for p in pairs if p in bi[a]) / max(1, len(pairs))
    unseen = [x for x in t if wcount[x] == 0]
    out.append({**c, 'skel': s, 'exact': s in exact[a], 'n_other_sop': len(owner[(a, s)] - {c['id']}), 'n_other_vss': exact_w[a][s], 'exact_other_act': (s in exact_any) and s not in exact[a], 'pre3': ' '.join(t[:3]) in pre3[a], 'bi': round(bs, 2), 'unseen_words': unseen, 'first_word_in_act_spans': first[a][t[0]] if t else 0})
json.dump(out, open(sys.argv[2], 'w'), indent=1)
