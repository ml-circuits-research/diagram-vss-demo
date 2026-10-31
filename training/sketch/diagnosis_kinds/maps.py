"""maps.py: the kind maps tested at read time (ablate.mjs --maps), from the measurements of one model.
- sign test on the single ablations (fit split only): a word keeps its own kind when its right->wrong flips (rw) outnumber its
  wrong->right flips (wr) beyond chance: one-sided sign test P(X >= rw | n = rw + wr, 1/2) < 0.05 (rw >= 5 when wr = 0)
- drop_sign: every other own-kind word -> unknown, all at once
- drop_net<t: the words whose fit net effect rw - wr is below t -> unknown (a curve over t)
- drop_all: every own-kind word -> unknown (only the legend value kinds, VERB and unknown left)
- ib: the clusters of ib.py (annotation, K by 2-fold CV inside fit): each cluster -> the kind of its most frequent word, UNK's cluster ->
  unknown
- sign_ib: the sign-test words keep their own kind; the others -> the most frequent non-sign word of their ib cluster (UNK's -> unknown)
- m2_09: the clusters of the learned rows at cosine 0.9 (cluster.py) -> the kind of their most frequent word; kinds whose rows write
  nothing -> unknown
python3 maps.py <tag> -> maps_<tag>.json, rule_<tag>.json (the sign-test words)"""
import json, sys
from math import comb
tag = sys.argv[1]; H = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/kinds/"
ab = json.load(open(H + f"abl_{tag}.json")); ib = json.load(open(H + f"ib_{tag}_self-next-prev-pos.json")); cl = json.load(open(H + f"clusters_{tag}.json"))
own = list(ab["runs"]); fit = {w: ab["runs"][w]["fit"] for w in own}
def p_sign(rw, wr):
    n = rw + wr
    return 1.0 if n == 0 else sum(comb(n, k) for k in range(rw, n + 1)) / 2 ** n
keep = sorted((w for w in own if p_sign(fit[w]["rw"], fit[w]["wr"]) < 0.05), key=lambda w: -(fit[w]["rw"] - fit[w]["wr"]))
freq = {w: fit[w]["tok"] for w in own}
M = {"drop_sign": {w: "unknown" for w in own if w not in keep}, "drop_all": {w: "unknown" for w in own}}
for t in (1, 2, 3, 5, 10, 20, 40):
    M[f"drop_net<{t}"] = {w: "unknown" for w in own if fit[w]["rw"] - fit[w]["wr"] < t}
def rep_map(clusters, members_ok=lambda w: True, unk_name="UNK"):
    m = {}
    for c in clusters:
        ws = [w for w in c if w in own and members_ok(w)]
        if not ws: continue
        if unk_name in c: m.update({w: "unknown" for w in ws}); continue
        r = max(ws, key=lambda w: freq[w])
        m.update({w: r for w in ws if w != r})
    return m
M["ib"] = rep_map(ib["clusters"])
M["sign_ib"] = rep_map(ib["clusters"], lambda w: w not in keep)
# ib_min2: the clusters of ib.py --min 2 (every word seen >= 2 times in fit, no frequency list): every word of a cluster -> the most
# frequent own-kind word of that cluster (so a word with no kind today can GET one); a cluster with no own-kind word, and UNK's -> unknown
ib2 = json.load(open(H + f"ib_{tag}_self-next-prev-pos_min2.json")); m = {}
for c in ib2["clusters"]:
    ko = [w for w in c if w in own]
    if "UNK" in c or not ko: m.update({w: "unknown" for w in c if w in own}); continue
    r = max(ko, key=lambda w: freq[w]); m.update({w: r for w in c if w != r and w != "UNK"})
M["ib_min2"] = m
M["m2_09"] = rep_map(cl["m2_clusters"]["0.9"]); M["m2_09"].update({w: "unknown" for w in cl["m2_empty"]})
json.dump(M, open(H + f"maps_{tag}.json", "w"), indent=1)
json.dump({"keep_sign_test": keep, "p": {w: p_sign(fit[w]["rw"], fit[w]["wr"]) for w in own}}, open(H + f"rule_{tag}.json", "w"), indent=1)
print(tag, "own", len(own), "sign-test keep", len(keep), keep)
for k, v in M.items(): print(" ", k, "changes", len(v), "words; kinds left among own:", len(set(own) - set(v)))

# ---- the proposed rule: the sign-test words keep a kind of their own; every other word seen >= 2 times in the fit spans gets the kind of
# its ib --min 2 cluster (cluster minus the sign-test words); UNK's cluster (and the words seen once) -> unknown.
# kinds_<tag>.json: the map a training would use (cluster kinds named c<i>_<most frequent word>, lowercase like the own kinds); maps_<tag>_rule.json: its read-time
# version on the trained model (a cluster -> the kind of its most frequent word that HAS a kind in the model; none -> unknown)
words2 = [w for c in ib2["clusters"] for w in c if w != "UNK"]
cnt2 = ib2["n_fit"]; train_map = {}; read_map = {}; nclu = 0
for c in ib2["clusters"]:
    rest = [w for w in c if w not in keep and w != "UNK"]
    if "UNK" in c:
        read_map.update({w: "unknown" for w in rest if w in own}); continue
    if not rest: continue
    top = max(rest, key=lambda w: cnt2[w]); nclu += 1
    train_map.update({w: f"c{nclu}_{top}" for w in rest})
    ko = [w for w in rest if w in own]
    if ko:
        r = max(ko, key=lambda w: freq[w]); read_map.update({w: r for w in rest if w != r})
    else: read_map.update({w: "unknown" for w in rest if w in own})
train_map.update({w: w for w in keep})
json.dump({"rule": read_map}, open(H + f"maps_{tag}_rule.json", "w"), indent=1)
json.dump({"about": f"kind map of the proposed rule for {tag}: legend value tokens and event tokens keep their kinds (not listed); sign-test words -> own kind; "
           "other words seen >= 2 times in the fit spans -> their ib cluster's kind; every word not listed -> unknown", "keep_own": keep, "map": dict(sorted(train_map.items()))},
          open(H + f"kinds_{tag}.json", "w"), indent=1)
K_train = 18 + 1 + len(keep) + nclu
print(f"rule: own kinds {len(keep)}, cluster kinds {nclu}, words with a kind {len(train_map)} -> K = {K_train} (18 legend kinds incl. VERB + unknown)")
