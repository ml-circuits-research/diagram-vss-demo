"""
world.py (implementer B) -- synthetic worlds for the attention experiments.

Two worlds with partly shared vocabulary:
  diagram (world A): create(shape, color?, name), connect(source, target), move(object, relation, landmark), set(object, color),
                     delete(object)
  errands (world B, for E5): buy(item, qty?), schedule(meeting, day), cancel(meeting), remind(person, meeting)
Shared action words: add (A create / B buy), move (A move / B schedule), remove (A delete / B cancel). Names (capitalised) are
shared by both worlds (A: object names, B: persons). Function words and chatter words are shared.

A message: 1..4 requests joined by varied separators, with 0..2 chatter phrases before, between or after; a chatter phrase contains
an action word used non-actively ("this is a nice draw") with probability p_false (false centres).
Gold per message: the requests (event + roles + trigger position + world) and per token a label: request index, -1 chatter,
-2 separator.

Kinds (the reader's input categories), per world: trigger word -> ACT_<event>; a value word -> the kind of its role's value class;
capitalised word -> NAME (mechanical step, as names-by-capital in the real tool); closed-class function words -> their own kind;
every other word (chatter, words of another world, unseen words) -> OTHER.
"""
import numpy as np

FUNC = ["the", "a", "to", "from", "with", "and", "then", ",", ".", "called", "as", "in", "it", "them", "of", "on", "for", "about",
        "some", "is"]
CHAT = ["so", "uh", "um", "because", "nice", "this", "looks", "good", "i", "think", "we", "like", "really", "okay", "well", "hmm",
        "cool", "great", "my", "our", "team", "map", "diagram", "project", "maybe", "just", "now", "here", "please", "thanks", "yes",
        "very", "pretty", "done", "know", "see", "want", "need", "you", "there"]
SEPS = [(",",), ("and",), ("then",), (",", "then"), (".",), ("and", "then"), ()]
SEP_P = [0.25, 0.2, 0.15, 0.1, 0.15, 0.05, 0.10]

_SYL = ["ka", "lo", "mi", "ra", "to", "ne", "su", "vi", "do", "ba", "re", "ti", "mo", "la", "pe", "zu", "fa", "ni", "go", "he"]


def make_names(n=60, seed=12345):
    rng = np.random.default_rng(seed); out = []
    while len(out) < n:
        s = "".join(rng.choice(_SYL, int(rng.integers(2, 4)))).capitalize()
        if s not in out: out.append(s)
    return out


NAMES = make_names()
NAMES_TRAIN, NAMES_TEST = NAMES[:45], NAMES[45:]

# ---- world definitions: events -> acts, roles [(role, value class, optional)], templates (plain, fronted)
DIAGRAM = {
    "name": "diagram",
    "values": {"SHAPE": ["circle", "square", "box", "triangle", "diamond", "oval", "star", "hexagon"],
               "COLOR": ["red", "blue", "green", "yellow", "black", "white", "orange", "purple"],
               "REL": ["above", "below", "left_of", "right_of", "next_to"]},
    "events": {
        "create": {"acts": ["draw", "add"], "roles": [("shape", "SHAPE", False), ("color", "COLOR", True), ("name", "NAME", False)],
                   "plain": ["{act} a {color} {shape} {name}", "{act} a {color} {shape} called {name}", "{act} {name} as a {color} {shape}"],
                   "fronted": ["{name} , {act} it as a {color} {shape}"]},
        "connect": {"acts": ["connect", "link"], "roles": [("source", "NAME", False), ("target", "NAME", False)],
                    "plain": ["{act} {source} to {target}", "{act} {source} with {target}", "{act} {source} and {target}",
                              "{act} from {source} to {target}", "{act} {target} from {source}"],
                    "fronted": ["{source} and {target} , {act} them", "{source} to {target} , {act} them"]},
        "move": {"acts": ["move", "put"], "roles": [("object", "NAME", False), ("relation", "REL", False), ("landmark", "NAME", False)],
                 "plain": ["{act} {object} {relation} {landmark}", "{act} {object} to {relation} {landmark}"],
                 "fronted": ["{object} , {act} it {relation} {landmark}"]},
        "set": {"acts": ["paint", "make"], "roles": [("object", "NAME", False), ("color", "COLOR", False)],
                "plain": ["{act} {object} {color}", "{act} {object} in {color}"], "fronted": ["{object} , {act} it {color}"]},
        "delete": {"acts": ["delete", "remove"], "roles": [("object", "NAME", False)],
                   "plain": ["{act} {object}"], "fronted": ["{object} , {act} it"]},
    }}

ERRANDS = {
    "name": "errands",
    "values": {"ITEM": ["milk", "eggs", "bread", "apples", "rice", "coffee", "tea", "butter", "cheese", "juice"],
               "NUM": ["two", "three", "four", "five", "six"],
               "MEET": ["standup", "review", "lunch", "call", "demo", "retro", "sync", "interview"],
               "DAY": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "tomorrow"]},
    "events": {
        "buy": {"acts": ["buy", "get", "add"], "roles": [("item", "ITEM", False), ("qty", "NUM", True)],
                "plain": ["{act} {qty} {item}", "{act} some {item}", "{act} {qty} {item} for the team"],
                "fronted": ["{item} , {act} {qty} of it"]},
        "schedule": {"acts": ["schedule", "book", "move"], "roles": [("meeting", "MEET", False), ("day", "DAY", False)],
                     "plain": ["{act} the {meeting} on {day}", "{act} the {meeting} to {day}", "{act} {meeting} for {day}"],
                     "fronted": ["the {meeting} , {act} it on {day}"]},
        "cancel": {"acts": ["cancel", "remove"], "roles": [("meeting", "MEET", False)],
                   "plain": ["{act} the {meeting}"], "fronted": ["the {meeting} , {act} it"]},
        "remind": {"acts": ["remind", "tell"], "roles": [("person", "NAME", False), ("meeting", "MEET", False)],
                   "plain": ["{act} {person} about the {meeting}", "{act} {person} of the {meeting}"], "fronted": []},
    }}


class World:
    def __init__(self, spec):
        self.spec = spec; self.name = spec["name"]; self.events = list(spec["events"])
        self.act_event = {a: ev for ev, e in spec["events"].items() for a in e["acts"]}
        self.value_kind = {w: k for k, ws in spec["values"].items() for w in ws}
        self.role_class = {}
        for ev, e in spec["events"].items():
            for r, c, _ in e["roles"]:
                assert self.role_class.get(r, c) == c; self.role_class[r] = c
        self.roles = sorted(self.role_class)
        self.kinds = sorted({f"ACT_{ev}" for ev in self.events} | set(spec["values"]) | {"NAME", "OTHER"} | set(FUNC))

    def kind(self, w):
        if w in self.act_event: return "ACT_" + self.act_event[w]
        if w in self.value_kind: return self.value_kind[w]
        if w[:1].isupper(): return "NAME"
        if w in FUNC: return w
        return "OTHER"

    def is_act_kind(self, k): return k.startswith("ACT_")

    def vocab(self):
        v = set(FUNC) | set(CHAT) | set(NAMES) | set(self.act_event) | set(self.value_kind)
        return v

    def request(self, rng, names, fronted_p=0.2):
        ev = self.events[int(rng.integers(len(self.events)))]; e = self.spec["events"][ev]
        act = e["acts"][int(rng.integers(len(e["acts"])))]
        fr = e["fronted"] and rng.random() < fronted_p
        tpls = e["fronted"] if fr else e["plain"]; tpl = tpls[int(rng.integers(len(tpls)))]
        roles = {}; used = set()
        for r, c, opt in e["roles"]:
            if opt and rng.random() < 0.3: continue
            pool = names if c == "NAME" else self.spec["values"][c]
            while True:
                v = pool[int(rng.integers(len(pool)))]
                if v not in used: break
            used.add(v); roles[r] = v
        toks = []; act_pos = None
        for piece in tpl.split():
            if piece.startswith("{"):
                slot = piece[1:-1]
                if slot == "act": act_pos = len(toks); toks.append(act); continue
                if slot not in roles: continue                       # optional role absent
                if self.role_class[slot] == "NAME" and rng.random() < 0.2 and (not toks or toks[-1] != "the"): toks.append("the")
                toks.append(roles[slot])
            else: toks.append(piece)
        return {"event": ev, "act": act, "roles": roles, "toks": toks, "act_off": act_pos, "world": self.name}


def chatter_phrase(rng, act_words, p_false, content=None, p_content=0.4):
    """content: list of value words (names, colours, shapes) that chatter may mention ("Wing looks really nice"), with p_content"""
    n = int(rng.integers(2, 6)); toks = []
    for _ in range(n):
        toks.append(CHAT[int(rng.integers(len(CHAT)))] if rng.random() < 0.8 else ["the", "a", "is", "of", "it"][int(rng.integers(5))])
    false = False
    if act_words and rng.random() < p_false:
        a = act_words[int(rng.integers(len(act_words)))]; pos = int(rng.integers(0, len(toks) + 1))
        ins = [["the", a], ["a", a], [a], ["nice", a]][int(rng.integers(4))]
        toks[pos:pos] = ins; false = True
    if content and rng.random() < p_content:
        pos = int(rng.integers(0, len(toks) + 1)); toks.insert(pos, content[int(rng.integers(len(content)))])
    return toks, false


def message(rng, worlds, nreq_choices, names, p_false=0.3, chatter_choices=(0, 1, 2), world_p=None):
    """worlds: list of World; each request drawn from one world (world_p); chatter false centres use action words of all worlds"""
    nreq = int(rng.choice(nreq_choices)); nchat = int(rng.choice(chatter_choices))
    reqs = []
    for _ in range(nreq):
        w = worlds[int(rng.choice(len(worlds), p=world_p))] if len(worlds) > 1 else worlds[0]
        reqs.append(w.request(rng, names))
    units = [("req", i) for i in range(nreq)]
    for _ in range(nchat):
        pos = int(rng.integers(0, len(units) + 1)); units.insert(pos, ("chat", None))
    acts = sorted({a for w in worlds for a in w.act_event})
    toks, labels = [], []; nfalse = 0
    for ui, (typ, i) in enumerate(units):
        if ui > 0:
            sep = SEPS[int(rng.choice(len(SEPS), p=SEP_P))] if typ == "req" and units[ui - 1][0] == "req" else \
                  SEPS[int(rng.choice([0, 4, 6]))]
            for s in sep: toks.append(s); labels.append(-2)
        if typ == "req":
            r = reqs[i]; r["act_pos"] = len(toks) + r["act_off"]; toks += r["toks"]; labels += [i] * len(r["toks"])
        else:
            content = list(names) * 1 + [v for k, vs in worlds[0].spec["values"].items() for v in vs]
            ct, fl = chatter_phrase(rng, acts, p_false, content); nfalse += fl; toks += ct; labels += [-1] * len(ct)
    return {"toks": toks, "labels": labels, "reqs": reqs, "nreq": nreq, "nchat": nchat, "nfalse": nfalse}


def dataset(seed, n, worlds, nreq_choices=(1, 2, 3, 4), names=NAMES_TRAIN, p_false=0.3, world_p=None, chatter_choices=(0, 1, 2)):
    rng = np.random.default_rng(seed)
    return [message(rng, worlds, nreq_choices, names, p_false, chatter_choices, world_p) for _ in range(n)]


def zones(labels_or_explained, toks, seps=(",", ".", "and", "then")):
    """maximal runs of unexplained tokens, trimmed of separator tokens at both ends; input: list of bools (True = unexplained)"""
    out = []; i = 0; T = len(toks)
    while i < T:
        if not labels_or_explained[i]: i += 1; continue
        j = i
        while j < T and labels_or_explained[j]: j += 1
        a, b = i, j
        while a < b and toks[a] in seps: a += 1
        while b > a and toks[b - 1] in seps: b -= 1
        if b > a: out.append((a, b))
        i = j
    return out


if __name__ == "__main__":
    A, B = World(DIAGRAM), World(ERRANDS)
    for m in dataset(0, 6, [A]): print(" ".join(m["toks"]), "|", [(r["event"], r["roles"]) for r in m["reqs"]], m["nfalse"])
    for m in dataset(1, 4, [A, B]): print(" ".join(m["toks"]), "|", [(r["world"], r["event"], r["roles"]) for r in m["reqs"]])
    print(A.kinds, len(A.kinds))
