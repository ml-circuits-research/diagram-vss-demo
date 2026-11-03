"""combine/failures_classify.py: the root-cause classes of VSS-BERT's failures on the test parts (training/sketch/combine/VSS_BERT_FAILURES.md).

    python3 training/sketch/combine/failures_classify.py <rows.json of failures_vss_bert.mjs> [<out.json>]

Every failure gets ONE cause, the first that explains it, and the stage where the cause sits:
- confidently wrong (executed wrong / extra executed, 14 on the test parts) and missed (67): read one by one; the labels are in MANUAL below,
  each with the reason in a comment;
- held but right (622): classified by rule from the records (the pairing situation, which key VSS read differently, the largest pull of
  the confidence), the rules written below; a sample of each class was read to check the rule;
- held and wrong (the gate did its job): by the first key where SOP-BERT's reading differs from the gold, for the stage table only.
"""
import json, sys, collections

ROWS = json.load(open(sys.argv[1]))
OUT = sys.argv[2] if len(sys.argv) > 2 else None
TEST = [r for r in ROWS if r["part"] == "test"]

NAME_KEYS = {"target", "from", "to", "anchor", "name", "items", "parents", "items2"}
# the forms added 2026-11-02 (LEGEND_EXT, TRAIN_PLAN_1103.md): actions and keys
NEW_ACTS = {"help", "improve", "respace", "snap", "fit", "flip", "sort", "groupby", "equalize", "straighten", "untangle", "group", "ungroup",
            "reverse", "tofront", "toback"}
NEW_KEYS = {"outline", "at", "linked", "items", "template", "title", "about", "topic", "aspect", "scheme"}


def is_new_form(g):
    if not g:
        return False
    act = (g.get("action") or g.get("ask") or "").lower()
    if act in NEW_ACTS or any(k in g for k in NEW_KEYS):
        return True
    if act == "undo" and "count" in g:
        return True
    if act == "label" and ("from" in g or "to" in g):
        return True
    if act == "create" and "layout" in g:
        return True
    return False


# ---------------------------------------------------------------- the 14 confidently wrong, read one by one
MANUAL_WRONG = {
    "fo-0052": ("name tag", "data", "'Worker and the copies': both readers drop 'the copies' (a reference to the shapes the held duplicate makes)"),
    "fo-0259": ("scoring artifact", "measurement", "typo 'whte': both readers drop the colour; the demo's spelling check corrects 'whte' to 'white' first, the records skip that step"),
    "fo-0433": ("cut", "data", "the BERT cut splits one chain request ('Retail to Returns ..., and Returns to Factory') in two; the first half is executed, the second held"),
    "fo-0435": ("pairing / gate", "code", "'Label the diamond': executed while the create of the diamond was held: it labels no shape / the wrong one"),
    "fo-0453": ("cut", "data", "the cut splits 'Draw an arrow ... and label it \"headcount\"': the arrow is drawn without its label, the label part is held"),
    "fo-0460": ("scoring artifact", "gold", "'Is Closing linked to anything yet': neighbors vs degree; both answer the question"),
    "fo-0534": ("cut", "data", "self-correction 'a dark navy ..., but no, teal reads better': the cut stops before 'but no, teal'; navy is executed"),
    "s3-0062": ("value", "data", "'undo twice': the count is dropped by both readers (undo with a count: a new form)"),
    "s3-0146": ("pairing / gate", "code", "'connect Api to Db' executed while 'create Api and Db squares' was held: no shape named Api"),
    "s3-0188": ("value", "data", "'undo the last 2 changes': the count is dropped by both readers (new form)"),
    "s3-0261": ("pairing / gate", "code", "'connect Check to Fail' executed while 'add Fail below Check' was held: no shape named Fail"),
    "s3-0293": ("description", "data", "'trash the small squares': size=small is dropped from the description; every square is deleted"),
    "s3-0354": ("value", "data", "'the outline of check orange': read as the fill colour (outline: a new form)"),
    "s3-0358": ("value", "data", "'the outline color of process': property read as colour (outline: a new form)"),
}

# ---------------------------------------------------------------- the 67 missed, read one by one: (id, gold span prefix) -> (cause, stage, note)
CUT_DROP = ("cut", "data", "no unit covers the request: the BERT cutter left this text outside every request")
CUT_MERGE = ("cut", "data", "one unit covers two requests; the readers read one of them")
CUT_FRAG = ("cut", "data", "the unit covers only part of the request; the part was read as another action")
ACT = ("act / world", "data", "the unit is right, both readers read another action (or none)")
ACT_NEW = ("act / world (new form)", "data", "a form added 2026-11-02; both readers read another action")
QFORM = ("scoring artifact", "gold", "a question both forms answer (degree / count / neighbors, extreme / check): the gold chose one")
FACT = ("gold convention", "gold", "a statement of the current state ('X is already red') annotated as a fact; nothing to do")
MANUAL_MISSED = {
    ("fo-0023", "Sw2"): CUT_MERGE, ("fo-0040", "LoadB"): CUT_MERGE, ("fo-0052", "Make 3"): CUT_FRAG, ("fo-0055", "Put th"): CUT_DROP,
    ("fo-0083", "space"): CUT_DROP, ("fo-0087", "I want"): CUT_DROP, ("fo-0104", "Is Rds"): QFORM, ("fo-0105", "Chargi"): CUT_FRAG,
    ("fo-0107", "Thumbn"): ACT, ("fo-0113", "I want"): ACT, ("fo-0116", "Pubsub"): CUT_MERGE, ("fo-0125", "MinBtn"): CUT_MERGE,
    ("fo-0184", "Plants"): CUT_DROP, ("fo-0185", "Sis is"): FACT, ("fo-0197", "Mars i"): FACT,
    ("fo-0210", "Coach2"): ("act / world", "data", "gapping: 'rename Coach1 to Juniors and Coach2 to Seniors', the second rename has no verb; read as connect"),
    ("fo-0221", "where "): CUT_DROP, ("fo-0246", "can yo"): ("cut", "data", "the unit swallows the narration 'deleted the arrow from Cow to Human'; read as disconnect"),
    ("fo-0271", "can u "): CUT_FRAG, ("fo-0277", "undo"): CUT_DROP, ("fo-0282", "copy i"): CUT_MERGE, ("fo-0283", "the Tr"): FACT,
    ("fo-0335", "How ma"): QFORM, ("fo-0375", "List a"): CUT_DROP, ("fo-0400", "Start "): FACT, ("fo-0459", "Then l"): ACT,
    ("fo-0460", "Is Clo"): QFORM, ("fo-0462", "How ma"): QFORM, ("fo-0467", "the Ba"): CUT_DROP, ("fo-0491", "I want"): CUT_DROP,
    ("fo-0520", "Oven i"): CUT_MERGE, ("fo-0548", "it fee"): CUT_DROP, ("fo-0548", "Meta g"): CUT_MERGE, ("fo-0554", "Is Tea"): QFORM,
    ("fo-0562", "Valve "): CUT_MERGE, ("fo-0577", "is it "): CUT_DROP, ("fo-0594", "Is Sce"): QFORM,
    ("s3-0008", "can yo"): ACT_NEW, ("s3-0022", "square"): ACT, ("s3-0073", "no wai"): ACT, ("s3-0087", "Begin "): ACT,
    ("s3-0093", "make a"): ACT_NEW, ("s3-0109", "circle"): ACT_NEW, ("s3-0119", "tidy t"): ACT_NEW, ("s3-0122", "everyt"): CUT_MERGE,
    ("s3-0122", "except"): CUT_MERGE, ("s3-0131", "done o"): ACT, ("s3-0137", "undo"): CUT_MERGE, ("s3-0146", "Db squ"): CUT_MERGE,
    ("s3-0181", "no bor"): ACT_NEW, ("s3-0193", "check "): CUT_MERGE, ("s3-0252", "add Su"): CUT_MERGE, ("s3-0262", "text o"): ACT_NEW,
    ("s3-0264", "start "): CUT_MERGE, ("s3-0265", "start "): CUT_MERGE,
    ("s3-0290", "check "): ("act / world", "data", "'check to Test' (Test does not exist): read as connect; rename needs the drawing"),
    ("s3-0305", "named "): CUT_MERGE, ("s3-0316", "timeli"): ACT_NEW, ("s3-0322", "take t"): ACT_NEW, ("s3-0363", "add a "): ACT_NEW,
    ("s3-0399", "label "): CUT_MERGE, ("s3-0439", "end re"): CUT_MERGE, ("s3-0441", "use th"): CUT_MERGE, ("s3-0471", "re-arr"): ACT_NEW,
    ("s3-0475", "start "): CUT_MERGE, ("s3-0517", "check "): FACT, ("s3-0529", "call t"): ACT_NEW,
}


def all_names_equiv(r, a, b):
    """target values the engine treats the same: no target, mention(quantifier=all), and the list of every shape of the drawing"""
    every = ",".join(sorted(n.lower() for n in (r.get("names") or [])))
    norm = lambda v: "ALL" if v in ("∅", "mention(quantifier=all)") or ",".join(sorted(v.split(","))) == every else v
    return norm(a) == norm(b)


def held_right_cause(r, by_msg):
    s = r["situation"]
    if s == "vss_only":
        return ("calibration data", "calibration", "a request only VSS produced: the 'vss' part never executes (4.7% of these were right on the calibration part)")
    if s == "sop_only":
        other = [x for x in by_msg[r["id"]] if x.get("from") == "vss" and x.get("unit_span") == r["unit_span"] and x is not r]
        if other:
            return ("VSS act / world", "data", "VSS read this unit as another action")
        return ("VSS act / world", "data", "VSS produced no request on this unit (no action word found / no sense)")
    if s == "disagree":
        g, v = r["gold"], r["vss_got"] or {}
        keys = [k for k in set(g) | set(v) if k not in ("action", "ask") and (v.get(k, "∅") != g.get(k, "∅"))]
        if keys and all(k == "target" for k in keys) and all_names_equiv(r, v.get("target", "∅"), g.get("target", "∅")):
            return ("pairing / agreement", "code", "a false disagreement: VSS's target (all shapes / none / every name) does the same in the engine")
        k = sorted(keys, key=lambda k: (k not in NAME_KEYS, k))[0] if keys else "?"
        gv, vv = g.get(k, "∅"), v.get(k, "∅")
        if "mention(" in gv or "mention(" in vv:
            return ("VSS description", "data", f"VSS read the description differently ({k})")
        if k in NAME_KEYS:
            if k in ("from", "to") and vv != "∅" and gv != "∅" and set(gv.split(",")) < set(vv.split(",")):
                return ("VSS name tag", "data", "VSS put the other end's name into this list too (from 'a,b' to 'b')")
            return ("VSS name tag", "data", f"VSS tagged the names differently ({k})")
        return ("VSS value", "data", f"VSS read a value differently ({k})")
    # agree: both readers right, the confidence is under the threshold. The largest pull says which signal held it.
    top = r["pulls"][0]["name"] if r.get("pulls") else ""
    if is_new_form(r["gold"]) and top in ("n_roles", "n_words", "fill_p_min", "fill_margin_min", "none_p_min", "act_p", "act_margin", "act_negent"):
        return ("calibration data (new forms)", "calibration", "a new form; few calibration requests like it, the signals look unusual")
    if top in ("cut_start", "cut_end", "cut_inner_min"):
        return ("confidence feature: cut", "calibration", "the BERT cut head was unsure at the unit's edge (a request after 'and', 'then', 'could you', a comma)")
    if top == "ctx_fill":
        return ("confidence feature: context filler", "calibration", "a reference ('it', 'them') was filled from context (right here)")
    if top in ("n_roles", "n_words"):
        return ("confidence feature: short request", "calibration", "few words or roles: short commands look unusual to the confidence")
    if top.startswith("tag_"):
        return ("confidence feature: name tags", "calibration", "the name tags were less sure than usual")
    return ("confidence feature: values / act", "calibration", f"the largest pull is {top}")


def held_wrong_stage(r):
    d = r["differ"]
    if not d:
        return "?"
    k = sorted(d, key=lambda x: (x["key"] not in NAME_KEYS, x["key"]))[0]
    if r.get("unit_cover", 1) < 0.6 or r.get("unit_spill", 0) > 0.5:
        return "cut"
    if "mention(" in k["gold"] or "mention(" in k["got"]:
        return "description"
    if k["key"] in NAME_KEYS:
        return "context filler" if r.get("ctx_fill") else "name tag"
    return "value"


by_msg = collections.defaultdict(list)
for r in ROWS:
    by_msg[r["id"]].append(r)
out = []
for r in TEST:
    k = r["kind"]
    if k in ("executed_wrong", "extra_executed"):
        c = MANUAL_WRONG[r["id"]]
        out.append(dict(cls="confidently wrong", cause=c[0], fix=c[1], note=c[2], r=r))
    elif k == "missed":
        key = next((kk for kk in MANUAL_MISSED if kk[0] == r["id"] and r["gold_span"].startswith(kk[1])), None)
        if key is None:
            raise SystemExit(f"no manual label for missed {r['id']} {r['gold_span']!r}")
        c = MANUAL_MISSED[key]
        out.append(dict(cls="missed", cause=c[0], fix=c[1], note=c[2], r=r))
    elif k == "held_right":
        c = held_right_cause(r, by_msg)
        out.append(dict(cls="held but right", cause=c[0], fix=c[1], note=c[2], r=r, new=is_new_form(r["gold"])))
    elif k == "held_wrong":
        out.append(dict(cls="held and wrong", cause=held_wrong_stage(r), fix="", note="", r=r))

for cls in ("confidently wrong", "held but right", "missed", "held and wrong"):
    X = [x for x in out if x["cls"] == cls]
    print(f"\n## {cls}: {len(X)}  (fresh2 {sum(x['r']['set'] == 'fresh2' for x in X)}, short3 {sum(x['r']['set'] == 'short3' for x in X)})")
    c = collections.Counter((x["cause"], x["fix"]) for x in X)
    for (cause, fix), n in c.most_common():
        f2 = sum(1 for x in X if x["cause"] == cause and x["fix"] == fix and x["r"]["set"] == "fresh2")
        print(f"| {cause} | {fix} | {n} | {f2} | {n - f2} |")
    if cls == "held but right":
        print("new forms among them:", sum(1 for x in X if x.get("new")), "| conf 0.90-threshold:", sum(1 for x in X if x["r"]["conf"] >= 0.9),
              "| agree:", sum(1 for x in X if x["r"]["situation"] == "agree"))
if OUT:
    json.dump([dict(cls=x["cls"], cause=x["cause"], fix=x["fix"], note=x["note"], id=x["r"]["id"], set=x["r"]["set"], kind=x["r"]["kind"],
                    situation=x["r"].get("situation"), conf=x["r"].get("conf"), unit=x["r"].get("unit_span"), gold_span=x["r"].get("gold_span"),
                    gold=x["r"].get("gold"), got=x["r"].get("got"), vss=x["r"].get("vss_got"), text=x["r"]["text"]) for x in out], open(OUT, "w"))
