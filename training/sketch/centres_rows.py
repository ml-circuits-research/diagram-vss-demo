"""centres_rows.py: the training rows of the CENTRE reader (legend reader.centres; research/attention/port/NOTES.md), used by
msg_to_world.py when CENTRES=1. One row of the centre reader = one WHOLE message: its tokens (front.normalize_message: every trigger
applied, names found anywhere known everywhere), and per annotated request its span (a token range of the message), its action token
(the centre) and its wire (the same frame as the one-request rows, built by llm_to_world.convert from the span's tokens AS THEY ARE IN THE
MESSAGE, so that the target only names tokens of the message). The words outside every span belong to no request.

Centre of a request = a token of its span that is an event token: first the one of the request's own event that overlaps the annotated
trigger, else the first of its own event, else the first event token of the span; a token is the centre of one request at most. A request
with no event token in its span has no centre (counted; its words still are its span for the attachment target)."""
import generate as G
import front as FR

EVTOK = {v for vs in G.EVENTS.values() for v in vs}


def span_range(text, src, sp, taken):
    """the token range [a, b) of span text `sp` in the message (the first occurrence not already used by another wire), or None"""
    s0 = text.find(sp)
    while s0 >= 0 and (s0, s0 + len(sp)) in taken: s0 = text.find(sp, s0 + 1)
    if s0 < 0: return None, None
    idx = [i for i, (a, b) in enumerate(src) if s0 <= a < s0 + len(sp)]
    return ((idx[0], idx[-1] + 1) if idx else None), (s0, s0 + len(sp))


def message_items(m, F):
    """-> (tokens, src, info, items): items = [(wire index, wire, [a, b) or None, centre position or None, created names before it)]"""
    toks, src, info = FR.normalize_message(m["text"], m.get("names") or [], F)
    items, created, taken, used = [], [], set(), set()
    for wi, w in enumerate(m["wires"]):
        sp = w.get("span"); rng = None
        if sp and sp in m["text"]:
            rng, ch = span_range(m["text"], src, sp, taken)
            if ch: taken.add(ch)
        centre = None
        if rng:
            ev_toks = set(G.EVENTS.get(event_of(w), []))
            tr = w.get("trigger") or ""; t0 = m["text"].find(tr, ch[0]) if tr else -1
            cands = [p for p in range(*rng) if toks[p] in EVTOK and p not in used]
            over = lambda p: t0 >= 0 and src[p][0] < t0 + len(tr) and src[p][1] > t0
            for pick in ([p for p in cands if toks[p] in ev_toks and over(p)], [p for p in cands if toks[p] in ev_toks], cands):
                if pick: centre = pick[0]; break
            if centre is not None: used.add(centre)
        items.append((wi, w, rng, centre, list(created)))
        if w["type"] == "command" and w["args"].get("action") == "create" and w["args"].get("name"): created.append(w["args"]["name"])
    return toks, src, info, items


def event_of(w):
    from llm_to_world import QUESTION_EVENT
    a = w.get("args", {}); t = w.get("type")
    return a.get("action") if t == "command" else QUESTION_EVENT.get(a.get("ask")) if t == "question" else t
