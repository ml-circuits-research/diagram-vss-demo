"""learn_triggers.py: the front end of the VSS world `real`, LEARNED from the training messages instead of written by hand.

The table normalize_real.json has
  - the mechanical part only: quoted text -> t_ tokens, numbers, names (capitalised or on the canvas) -> n_ tokens, contractions,
    punctuation (no politeness stripping, no hand-written question openers, no rewrites, no hand-written multi-word expressions);
  - the legend's value cue words (colours, places, layouts...: legend_cues.json, the same list the rules use);
  - TRIGGERS learned from the annotation: each training wire marks the words (`trigger`) that say which action or question it is. A
    trigger phrase, with the class of the token before and after it (name, article, the, pronoun, boundary, other), becomes a rule
    "phrase in this context -> the event's token" when the data supports it:
      * seen >= MIN_COUNT times in that context, with >= SHARE of them for one event;
      * PRECISION >= MIN_PREC, where the false positives are the occurrences of the phrase in the FLUFF of the training messages (the
        sentences no wire covers) and inside spans where it is not the trigger. This is how the fluff is used: a word that is often
        chatter ("layout", "dupe") does not become a trigger.
    Context backs off from (prev, next) to (*, next), (prev, *), (*, *); every level is a separate rule with its own support.
The same learned action phrases (context-free level) go to docs/js/learned-cues.js, so the rules know the same words.
Only the TRAINING messages are read. Writes normalize_real.json, docs/js/learned-cues.js, llm_train/LEARNED_TRIGGERS.md.
Run: python3 learn_triggers.py"""
import collections, glob, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(os.path.dirname(HERE)); sys.path.insert(0, HERE)
import generate as G
import make_normalizer as MN
from normalize import normalize, tclass
from msg_to_world import legend_kinds, VALUE_KINDS

MIN_COUNT, SHARE, MIN_PREC = 2, 0.75, 0.6
PROPERTY_TOK = {"color": "what_color", "shape": "what_shape", "position": "where_is", "size": "how_big", "label": "what_says"}
CUT = {"it", "them", "this", "that", "these", "those", "everything", "the", "a", "an", "all", "both", "every", "each", "its"}


def event_of(w):
    a = w["args"]; t = w["type"]
    if t == "command": return a.get("action")
    if t == "question": return {"rules": "list"}.get(a.get("ask"), a.get("ask"))
    return t


def event_token(w):
    ev = event_of(w)
    if ev == "property": return PROPERTY_TOK.get(w["args"].get("property"), "what_color")
    return G.EVENTS[ev][0] if ev in G.EVENTS else None


def base_table():
    b = json.load(open(os.path.join(HERE, "normalize_base.json")))
    keep = {k: b[k] for k in ("contractions", "punctuation", "number_words", "number_word_exceptions", "article_followers", "name_before")}
    keep.update({"lead_strip": [], "openers": [], "mwe": [], "synonyms": {}, "rewrites": [], "question_verbs": [],
                 "about": "normalize_real.json: the front end of the VSS world `real`. Mechanical part + the legend's cue words + triggers LEARNED from the training messages (learn_triggers.py)."})
    return keep


def main():
    msgs = [json.loads(l) for f in sorted(glob.glob(os.path.join(HERE, "llm_train", "*_msg", "msg_*.jsonl"))) for l in open(f) if l.strip()]
    lex = set(legend_kinds())
    table, _ = MN.build(lex, base=base_table(), out_path=None)
    # value cues only: action cue words of the legend are not used here (the triggers are learned); drop synonyms that map to a verb token
    verbs = {v for vs in G.EVENTS.values() for v in vs}
    table["synonyms"] = {k: v for k, v in table["synonyms"].items() if v not in verbs}
    table["mwe"] = [x for x in table["mwe"] if not set(x[1].split()) & verbs]
    tp = collections.defaultdict(collections.Counter)        # (phrase, prev, next) -> event token counts
    phrases = set()
    spans_toks, fluff_toks = [], []
    for m in msgs:
        names = list(m.get("names") or []) + [w["args"]["name"] for w in m["wires"] if w["args"].get("name")]
        covered = [0] * len(m["text"])
        for w in m["wires"]:
            sp = w.get("span") or ""; i = m["text"].find(sp)
            if i >= 0:
                for k in range(i, i + len(sp)): covered[k] = 1
            tok = event_token(w)
            toks, _ = normalize(sp, lex, names, table=table); spans_toks.append([toks, tok, None])
            if not tok or not w.get("trigger"): continue
            tt, _ = normalize(w["trigger"], lex, names, table=table)
            tt = [x for x in tt if x not in ("?", ".", ",", "!")]
            while tt and tt[0] in CUT: tt = tt[1:]
            cut = next((k for k, x in enumerate(tt) if x.startswith("n_") or x in CUT), len(tt)); tt = tt[:cut]
            if not tt: continue
            pos = next((k for k in range(len(toks)) if toks[k:k + len(tt)] == tt), None)
            if pos is None: continue
            p = tclass(toks[pos - 1] if pos > 0 else None); n = tclass(toks[pos + len(tt)] if pos + len(tt) < len(toks) else None)
            ph = " ".join(tt); phrases.add(ph); spans_toks[-1][2] = tt
            for key in ((ph, p, n), (ph, "*", n), (ph, p, "*"), (ph, "*", "*")): tp[key][tok] += 1
        for s in re.finditer(r"[^.!?]+[.!?]?", m["text"]):
            if len(s.group(0).strip()) > 3 and not any(covered[s.start():s.end()]): fluff_toks.append(normalize(s.group(0), lex, names, table=table)[0])
    # false positives of a rule: its phrase in the same context inside FLUFF, or inside a span whose request is another event
    occ = collections.defaultdict(collections.Counter); occ_fluff = collections.Counter()
    def scan(toks, hit, own=None):
        for ph in phrases:
            pt = ph.split()
            for i in range(len(toks) - len(pt) + 1):
                if toks[i:i + len(pt)] == pt:
                    if own and len(own) > len(pt): continue   # the span's own, longer trigger is tried first (rules are ordered longest first)
                    p = tclass(toks[i - 1] if i > 0 else None); n = tclass(toks[i + len(pt)] if i + len(pt) < len(toks) else None)
                    for key in ((ph, p, n), (ph, "*", n), (ph, p, "*"), (ph, "*", "*")): hit(key)
    for toks, ev, own in spans_toks: scan(toks, lambda key: occ[key].__setitem__(ev, occ[key][ev] + 1), own)
    for toks in fluff_toks: scan(toks, lambda key: occ_fluff.__setitem__(key, occ_fluff[key] + 1))
    rules, report = [], []
    for key, c in tp.items():
        n = sum(c.values()); tok, k = c.most_common(1)[0]
        fp = occ_fluff[key] + sum(v for e, v in occ[key].items() if e != tok)
        prec = n / (n + fp) if n + fp else 0
        ok = n >= MIN_COUNT and k / n >= SHARE and prec >= MIN_PREC
        report.append((key, n, dict(c.most_common(3)), occ_fluff[key], round(prec, 2), ok))
        if ok:
            e = {"p": key[0], "prev": key[1], "next": key[2], "tok": tok, "n": n, "prec": round(prec, 2)}
            kv = [x for x in key[0].split() if G.KINDS.get(x) in VALUE_KINDS]
            if kv: e["keep"] = kv   # "right_side", "bigger than", "how many circles": the value words stay as role fillers
            rules.append(e)
    spec = lambda e: (e["prev"] != "*") + (e["next"] != "*")
    rules.sort(key=lambda e: (-len(e["p"].split()), -spec(e), -e["n"], e["p"]))
    table["triggers"] = rules
    json.dump(table, open(os.path.join(HERE, "normalize_real.json"), "w"), indent=1)
    # variant A (VSS_READER_SPEC: the learned words go into the LEXICON, no rewriting): every context-free trigger kept above becomes a
    # verb of its event in the legend; a multi-word trigger becomes one token (its words joined by "_") so that it can be a verb word.
    # A word has one event (its majority), so context ("put a" vs "put the") is not available to the reader in this variant.
    tok2ev = {v: k for k, vs in G.EVENTS.items() for v in vs}
    verbs, mwe = collections.defaultdict(list), []
    for key, n, c, f, prec, ok in report:   # the majority event of every phrase (no share threshold: one event per word is this variant's premise)
        tok = max(c, key=c.get)
        if key[1] != "*" or key[2] != "*" or n < MIN_COUNT or prec < MIN_PREC or tok not in tok2ev or any(G.KINDS.get(x) in VALUE_KINDS for x in key[0].split()): continue
        e = {"p": key[0], "tok": tok}
        w = e["p"].replace(" ", "_")
        if " " in e["p"]: mwe.append([e["p"], w])
        verbs[tok2ev[e["tok"]]].append(w)
    lt = dict(table); lt.pop("triggers"); lt["mwe"] = sorted(mwe, key=lambda x: -len(x[0].split())) + table["mwe"]
    lt["about"] = "normalize_real_lex.json: variant A of the learned front end: mechanical part + legend value cues + learned multi-word triggers joined into one token; the verbs themselves are in the legend (learned_verbs.json)."
    json.dump(lt, open(os.path.join(HERE, "normalize_real_lex.json"), "w"), indent=1)
    json.dump({k: sorted(set(v)) for k, v in sorted(verbs.items())}, open(os.path.join(HERE, "learned_verbs.json"), "w"), indent=1)
    # the same learned ACTION phrases (context-free rules) for the rules formalizer
    inv = {v: k for k, vs in G.EVENTS.items() for v in vs if k in json.load(open(os.path.join(HERE, "legend_cues.json")))["action"]}
    act = collections.defaultdict(list)
    for e in rules:
        if e["prev"] == "*" and e["next"] == "*" and e["tok"] in inv and len(e["p"]) > 2: act[inv[e["tok"]]].append(e["p"])
    js = ("// learned-cues.js: GENERATED by training/sketch/learn_triggers.py from the training messages' trigger annotations. Do not edit.\n"
          "(function (root) { const C = " + json.dumps({"action": {k: sorted(v) for k, v in sorted(act.items())}}, sort_keys=True) + ";\n"
          "  if (typeof module !== 'undefined' && module.exports) module.exports = C; else root.SOP_LEARNED_CUES = C; })(this);\n")
    open(os.path.join(REPO, "docs", "js", "learned-cues.js"), "w").write(js)
    report.sort(key=lambda r: (not r[5], -r[1]))
    md = [f"# Triggers learned from {len(msgs)} training messages", "", f"{len(rules)} rules kept (count >= {MIN_COUNT}, share >= {SHARE}, precision >= {MIN_PREC}; precision counts the phrase's "
          f"occurrences in {len(fluff_toks)} fluff sentences). Action phrases passed to the rules: {sum(len(v) for v in act.values())}.", "",
          "| phrase | before | after | n | events | in fluff | precision | kept |", "|---|---|---|---|---|---|---|---|"]
    md += [f"| {k[0]} | {k[1]} | {k[2]} | {n} | {c} | {f} | {p} | {'yes' if ok else ''} |" for k, n, c, f, p, ok in report if n >= 2]
    open(os.path.join(HERE, "llm_train", "LEARNED_TRIGGERS.md"), "w").write("\n".join(md) + "\n")
    print(md[2]); print("examples:", [(e["p"], e["prev"], e["next"], e["tok"], e["prec"]) for e in rules[:25]])


if __name__ == "__main__":
    main()
