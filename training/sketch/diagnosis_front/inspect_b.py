from measure import *
import random, collections
base = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/"
fit = load(base + "fitset/fit.jsonl")
F0 = json.load(open("/home/claude/diagram-vss-demo/docs/model/fix_p80_s0/front.json"))
r0, a0, b0 = measure(F0, fit)
Fs = learn_x(fit, P, ("SUB",)); r1, a1, b1 = measure(Fs, fit, ("SUB",))
c0 = collections.Counter(t for t, _ in b0); c1 = collections.Counter(t for t, _ in b1)
print("baseline false by token:", c0.most_common(12)); print("SUB false by token:", c1.most_common(12))
set0 = collections.Counter(b0)
new = [x for x in b1 if x not in set0]
random.seed(1)
for t, s in random.sample(new, 25): print("NEW", t, "|", s.replace("\n", " "))
print("--- baseline false examples")
for t, s in random.sample(b0, 12): print("OLD", t, "|", s.replace("\n", " "))
# which rule phrases cause the new false triggers: count by phrase
