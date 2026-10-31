import json, sys, collections
L = json.load(open("/home/claude/diagram-vss-demo/training/sketch/worlds/real/legend.json"))
R = {e["id"]: set(e["roles"]) for e in L["events"]}
# 1. clustering of the legend's role sets (mechanical, from the legend): average-linkage Jaccard
cl = [[e] for e in R]
def jac(a, b): u = a | b; return 1.0 if not u else len(a & b) / len(u)
def link(A, B): return sum(jac(R[a], R[b]) for a in A for b in B) / (len(A) * len(B))
hist = []
while len(cl) > 1:
    best = max(((i, j) for i in range(len(cl)) for j in range(i + 1, len(cl))), key=lambda p: link(cl[p[0]], cl[p[1]]))
    s = link(cl[best[0]], cl[best[1]]); i, j = best; cl[i] = cl[i] + cl[j]; del cl[j]
    print(len(cl), round(s, 2), sorted(cl[i]))
