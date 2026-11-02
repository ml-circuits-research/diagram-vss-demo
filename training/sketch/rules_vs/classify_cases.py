"""classify_cases.py <cases_lk.json> <out.json>: the 100 cases with the cause assigned by reading each one (this file IS the judgement; reasons are short).
Causes: DATA = the construction/word/key is absent or nearly absent from the training data of that reader (counts in conv_checks.py / lookup.py);
CONV = the training annotation uses another convention than the Rules' output; ASK = read right, the confidence gate asks; ERR = covered in training, read wrong."""
import json, sys, collections
C = json.load(open(sys.argv[1]))
Q = {}
def q(ix, cause, why):
    for i in (ix if isinstance(ix, (list, tuple, range)) else [ix]): Q[i] = (cause, why)
q(range(45, 55), 'ASK', 'read right; confidence under the threshold')
q(12, 'DATA', "trigger 'discard' (forget): 5 training spans, 2 in the worlds' data")
q([55, 59], 'DATA', "trigger 'erase': 3 training spans, 1 in the worlds' data")
q(58, 'DATA', "trigger 'detach': 2 training spans, none in the worlds' data")
q(63, 'DATA', "'upper left corner': 'upper' occurs in 3 training spans (all 'top left' phrasing is covered)")
q(74, 'DATA', "'upper left corner': 'upper' occurs in 3 training spans")
q(65, 'DATA', "typo 'cricles' never seen (the demo's spell checker may fix it)")
q(75, 'DATA', "typo 'Strat'/'yelow' never seen (the demo's spell checker may fix it)")
q(66, 'DATA', "'sketch me': 'sketch' occurs in 11 training spans, 3 in the worlds' data")
q(76, 'DATA', "'wipe out' as delete: 5 training spans, none in the worlds' data")
q([39, 72, 73], 'DATA', "delete + 'not <colour>': 4 training spans in all")
q(69, 'DATA', "a description as the source of connect: 4 of 3427 'from' fillers in the worlds' data are descriptions")
q([82, 86, 93], 'DATA', "'outline': 0 training spans (key not in the training legend)")
q([85, 88, 90, 99], 'DATA', "groups: 14 training spans mention groups, 0 annotate a group action or group count")
q(89, 'DATA', "'at x, y' coordinates: 0 training spans")
q([83, 91], 'DATA', "'what does X say': 'say' occurs in 5 question spans, none about a label")
q([84, 96], 'DATA', "statement 'X is connected to Y' as a fact with 'linked': 0 training facts have it (training facts are colours/sizes)")
q(98, 'DATA', "'remove all connections': 0 disconnect spans with all/every/connections")
q(87, 'CONV', "training writes 'connect A and B ...' as from=A,B (61 of 78 spans); Rules write from=A to=B")
q([92, 94, 97], 'CONV', "'everything'/'the shapes' as a target: training leaves the target empty (0 of 60 'arrange ... everything' spans write all); Rules write mention(all)")
q(81, 'CONV', "no axis in the text: Rules default to horizontal; the training annotator chose per message")
for i in range(len(C)):
    if i not in Q: Q[i] = ('ERR', '')
sub = {0: 'wrong act (rules read as list)', 1: "'box' -> circle", 2: 'rule read as fact', 3: 'cutter made no unit', 4: 'value dropped (red)', 5: "property read as fact", 6: 'value dropped (position)', 7: 'role confusion (to=pair)', 8: 'wrong act (rules read as list)',
       9: 'notColor read as color', 10: 'description attribute dropped (last)', 11: 'description attribute dropped (newest)', 13: 'role confusion (from/to=pair)', 14: 'wrong act', 15: 'rule read as set', 16: 'cutter made no unit', 17: 'description attribute dropped (every)',
       18: 'value dropped (shape)', 19: 'name and target swapped', 20: 'cutter made no unit', 21: 'value dropped (shape)', 22: 'value dropped (colour)', 23: 'value dropped (name)', 24: 'value dropped (kind)', 25: 'cutter made no unit', 26: 'anchor list cut to one', 27: 'wrong act (rules read as list)', 28: "create read as 'check' (region phrase)",
       29: "'box' -> circle", 56: "create read as 'check' (region phrase)", 57: 'all circles filled with every name', 62: 'all circles filled with every name', 60: 'second request source wrong', 61: 'property read as fact', 64: 'description attribute dropped (last)', 67: 'cutter made no unit'}
out = []
for i, c in enumerate(C):
    cause, why = Q[i]
    if cause == 'ERR' and not why: why = sub.get(i) or ('description attribute wrong/dropped' if c['reader'] == 'sop' and 'mention' in json.dumps(c['want']) else 'value wrong/dropped')
    out.append({'i': i, 'set': c['set'], 'reader': c['reader'], 'text': c['text'], 'cause': cause, 'why': why})
json.dump(out, open(sys.argv[2], 'w'), indent=1)
cnt = collections.Counter(o['cause'] for o in out); print(dict(cnt))
for rd in ('vss', 'sop'): print(rd, dict(collections.Counter(o['cause'] for o in out if o['reader'] == rd)))
for st in ('llm_short', 'written', 'help'):
    sel = [o for o in out if (o['set'] == 'llm_short') == (st == 'llm_short') and (o['set'] == 'help') == (st == 'help')]
    print(st, len(sel), dict(collections.Counter(o['cause'] for o in sel)))
print(dict(collections.Counter(o['why'] for o in out if o['cause'] == 'ERR').most_common()))
