# diag3.py: classify every one of the 328 requests (first reason). Needs diag2.json (diag2.py) and fit_emit.json (emit.mjs).
from diag1 import *
D = json.load(open("diag2.json"))
THR = dict(c=P["trig_min_count"], s=P["trig_share"], p=P["trig_min_prec"])
# STOP: words that carry no action by themselves (used ONLY here, in the diagnosis, to count 'verbless' triggers; nothing learned uses it)
STOP = set("the a an to of at in on by with and or it its them her his their uh very just far pixels pixel px one this that these those so but too also near".split())
rulesByPh = collections.defaultdict(list)
for e in F["triggers"]: rulesByPh[e["p"]].append(e)
def fails(s):
    if not s: return ["never an annotated trigger in a located position"]
    r = []
    if s["n"] < THR["c"]: r.append("count")
    if s["share"] < THR["s"]: r.append("share")
    if s["prec"] < THR["p"]: r.append("prec")
    return r
res = []
for x in D:
    c = dict(x)
    w = x["why"]
    if w == "no trigger annotated" or w == "no event token for the gold event": c["cls"] = "5 other: " + w
    elif w == "trigger empty after cut at first name":
        c["cls"] = "1a verbless: the trigger is a name (or starts with one): 'X to Y', 'X blue', 'X a ..'"
    elif w.startswith("other"):
        c["cls"] = "5 other: the annotated trigger is a prefix of a token (Where in Where's)"
    elif w == "trigger not found in value-normalized span":
        c["cls"] = "3b rule/phrase exists but a value n-gram rewrote the trigger word first"
    else:
        tt = x["tt"]; toks = tt
        if x["trigger"].split()[0][:1].isupper() is False: pass
        # did the original trigger contain a name that was cut? (e.g. 'the Hero a')
        names_cut = len(x["tt_raw"]) > len(tt)
        gen = x["gen"]; spec = x["spec"]
        c["verbless_rule_elsewhere"] = False
        allstop = all((t in STOP) or (t in VT) or t.isdigit() for t in tt)
        if names_cut and all(t in STOP for t in tt): c["cls"] = "1b verbless: determiner + name ('the Hero a')"
        elif allstop: c["cls"] = "1c verbless: the trigger is a value / position / description phrase (no action word)"; c["verbless_rule_elsewhere"] = bool(rulesByPh.get(x["ph"]))
        elif gen and gen["share"] < THR["s"]: c["cls"] = "4 ambiguous phrase: two events share it, the deciding word is outside the 1-token context"; c["fails"] = fails(gen)
        elif rulesByPh.get(x["ph"]): c["cls"] = "3a a rule of this phrase exists, but not for this context"
        else:
            f = fails(gen)
            c["fails"] = f
            c["cls"] = "2 never a rule: " + ("+".join(f) if f else "?")
    res.append(c)
json.dump(res, open("diag3.json", "w"), indent=1)
cnt = collections.Counter(c["cls"].split(":")[0] if c["cls"][0] in "125" and c["cls"].startswith(("1","5")) else c["cls"] for c in res)
for k, v in sorted(cnt.items()): print(v, k)
