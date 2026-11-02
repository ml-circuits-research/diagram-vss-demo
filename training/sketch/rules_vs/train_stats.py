"""train_stats.py: shape of the training data the learned readers use (SOP-BERT-G and the VSS-G chain), vs the demo's own example sentences.
Output: train_stats.json (+ printed tables). Analysis helper only: the masks below are NOT used by any reader."""
import json, glob, os, re, collections, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')); SK = ROOT + '/training/sketch'
FOLD = {  # folder -> (who trains on it)
 'llm_train/sonnet_msg':'both','llm_train/haiku_msg':'both','llm_train/sonnet_msg2':'both','llm_train/haiku_msg2':'both','llm_train/sonnet_long':'both',
 'llm_bench/fresh1/sonnet':'both','llm_bench/fresh1/haiku':'both','llm_bench/sonnet_spans':'both','llm_bench/haiku_spans':'both',
 'llm_train/sonnet_short':'SOP-BERT + VSS cutter only','llm_train/haiku_short':'SOP-BERT + VSS cutter only',
 'llm_train/opus_train_a':'both','llm_train/opus_train_b':'both','llm_train/opus_train_c':'both','llm_train/opus_train_d':'both','llm_train/opus_gen_1':'both','llm_train/opus_gen_2':'both'}
def rows(d):
    out = []
    for f in sorted(glob.glob(f'{SK}/{d}/msg_*.jsonl') + glob.glob(f'{SK}/{d}/batch_*.jsonl')):
        out += [json.loads(l) for l in open(f) if l.strip()]
    return [r for r in out if isinstance(r.get('wires'), list)]
COL = 'red blue green yellow orange purple black white gray grey pink brown gold teal navy cyan violet silver'.split()
SHP = 'circle square triangle diamond star hexagon rectangle oval ellipse box dot pentagon'.split()
SZ = 'small big large tiny huge medium bigger smaller larger'.split()
def skel(t, names):
    s = ' ' + re.sub(r'[^\w\s$@]', ' ', t.lower()) + ' '
    for n in sorted(names, key=len, reverse=True): s = re.sub(r'\b' + re.escape(n.lower()) + r'\b', ' NAME ', s)
    for w in COL: s = re.sub(rf'\b{w}s?\b', ' COL ', s)
    for w in SHP: s = re.sub(rf'\b{w}(es|s)?\b', ' SHP ', s)
    for w in SZ: s = re.sub(rf'\b{w}\b', ' SZ ', s)
    s = re.sub(r'\b\d+\b', ' N ', s); s = re.sub(r'\b(one|two|three|four|five|six)\b', ' N ', s)
    return ' '.join(s.split())
FRAME = re.compile(r"^(please|pls|can you|could you|would you|will you|can u|i want|i'd like|i would like|i need|let's|lets|now|ok|okay|hey|hi|go ahead|just|i wanna|we need|we should|next|then|also|and|so)\b")
def nsent(t): return len([x for x in re.split(r'(?<=[.!?])\s+', t.strip()) if x])
def stats(rs):
    n = len(rs); one = [r for r in rs if len(r['wires']) == 1]
    line1 = [r for r in rs if nsent(r['text']) == 1 and '\n' not in r['text']]
    short = [r for r in one if nsent(r['text']) == 1 and len(r['text'].split()) <= 8]
    bare = [r for r in one if nsent(r['text']) == 1 and not FRAME.match(r['text'].strip().lower())]
    reqs = sum(len(r['wires']) for r in rs)
    return {'messages': n, 'requests': reqs, 'one_request': len(one), 'one_sentence': len(line1), 'one_request_one_sentence': len([r for r in one if nsent(r['text']) == 1]),
            'one_req_le8w': len(short), 'one_req_one_sent_bare_start': len(bare), 'median_words': sorted(len(r['text'].split()) for r in rs)[n // 2] if n else 0}
tot = collections.Counter(); per = {}; allrows = []
for d, who in FOLD.items():
    rs = rows(d)
    if not rs: print('EMPTY', d); continue
    per[d] = stats(rs); per[d]['trains'] = who; allrows += [(d, r) for r in rs]
    tot.update({k: v for k, v in per[d].items() if isinstance(v, int) and k != 'median_words'})
ids = {}
for d, r in allrows: ids.setdefault(r['id'], (d, r))
print('folders', len(per), 'messages', len(allrows), 'unique ids', len(ids))
# help examples
H = [e['text'] for e in json.load(open('' + os.path.dirname(os.path.abspath(__file__)) + '/help_ex.json'))]
dc = open(ROOT + '/docs/js/docs-concepts.js').read()
for m in re.finditer(r"says\(((?:'[^']*'(?:\s*,\s*)?)+)\)", dc):
    H += re.findall(r"'([^']*)'", m.group(1))
H = list(dict.fromkeys(H))
HN = ['Start', 'Process', 'Check', 'Done', 'Intake', 'Hub', 'Gem', 'Box', 'Root', 'Router']
Hs = {h: skel(h, HN) for h in H}
tr_all = collections.Counter(); tr_one = collections.Counter(); tr_short = collections.Counter(); pref3 = collections.Counter()
for d, r in ids.values():
    s = skel(r['text'], r.get('names') or [])
    tr_all[s] += 1
    if len(r['wires']) == 1 and nsent(r['text']) == 1: tr_one[s] += 1; pref3[' '.join(s.split()[:3])] += 1
exact_all = sum(1 for h in H if tr_all[Hs[h]]); exact_one = sum(1 for h in H if tr_one[Hs[h]])
prefix = sum(1 for h in H if pref3[' '.join(Hs[h].split()[:3])])
hs = {'n_help_sentences': len(H), 'words_median': sorted(len(h.split()) for h in H)[len(H)//2], 'one_request_by_rules_shape': None,
      'exact_skeleton_in_training_any': exact_all, 'exact_skeleton_in_training_one_request_one_sentence': exact_one, 'first3_skeleton_prefix_in_training_one_req': prefix,
      'bare_start_help': sum(1 for h in H if not FRAME.match(h.lower())),
      'help_one_sentence': sum(1 for h in H if nsent(h) == 1), 'help_le8w': sum(1 for h in H if len(h.split()) <= 8)}
miss = [h for h in H if not tr_one[Hs[h]]]
print(json.dumps(hs, indent=1)); print('NOT matched exactly in one-request one-sentence training:', len(miss)); [print('  ', m) for m in miss[:50]]
json.dump({'per_folder': per, 'total': dict(tot), 'unique_messages': len(ids), 'help': hs, 'help_sentences': H, 'help_unmatched': miss}, open(os.path.dirname(__file__) + '/train_stats.json', 'w'), indent=1)
print(f"{'folder':28s} {'trains':26s} msgs reqs one-req one-sent 1req1sent le8w bare")
for d, p in per.items(): print(f"{d:28s} {p['trains']:26s} {p['messages']:5d} {p['requests']:5d} {p['one_request']:5d} {p['one_sentence']:5d} {p['one_request_one_sentence']:5d} {p['one_req_le8w']:5d} {p['one_req_one_sent_bare_start']:5d} med {p['median_words']}")
print('TOTAL', dict(tot))
