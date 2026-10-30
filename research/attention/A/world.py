"""
world.py - the synthetic diagram world of research/attention/PLAN.md (implementer A).

A message = 1..n requests joined by varied separators, with 0..k chatter phrases before, between or after the requests. A chatter
phrase may contain an action word used non-actively ("this is a draw of the map"): a FALSE CENTRE.
Gold per message: the requests (event + roles) and, per token, the index of the request it belongs to (-2: chatter phrase, -1:
separator / punctuation between requests and phrases).

Kinds (the input categories of the reader). They are a property of the synthetic world: every action word has the kind of its event
(V_create, ...), the value words have the kind of their legend question (NAME, COLOR, SHAPE, REL), each function word has its own kind
(F_to, F_the, ...), every chatter word has the kind CHAT. A word never seen in training: NAME if capitalized (mechanical step, as in the
reader spec), else UNK. A false-centre action word keeps its lexical kind (the reader cannot know it is chatter from its kind).
"""
import hashlib
import numpy as np

EVENTS = {   # event -> (action words, roles)
    "create": (["draw", "add", "create"], ["shape", "color", "name"]),
    "connect": (["connect", "link"], ["source", "target"]),
    "move": (["move", "put", "place"], ["object", "relation", "landmark"]),
    "set": (["paint", "make", "colour"], ["object", "color"]),
    "delete": (["delete", "remove", "erase"], ["object"]),
}
OPTIONAL = {("create", "color")}          # the only optional role
ROLES = ["shape", "color", "name", "source", "target", "object", "relation", "landmark"]
ROLE_KINDS = {"shape": ["SHAPE"], "color": ["COLOR"], "name": ["NAME"], "source": ["NAME"], "target": ["NAME"], "object": ["NAME"],
              "relation": ["REL"], "landmark": ["NAME"]}
ACTION_OF = {w: e for e, (ws, _) in EVENTS.items() for w in ws}
COLORS = ["red", "blue", "green", "yellow", "black", "white", "orange", "purple"]
SHAPES = ["circle", "box", "square", "diamond", "ellipse", "triangle"]
RELS = ["above", "below", "left_of", "right_of", "next_to"]
FUNC = ["the", "a", "to", "with", "and", "then", ",", ".", "named", "called", "as", "in", "it", "them"]
CHAT = ["so", "uh", "um", "because", "nice", "this", "is", "looks", "good", "i", "think", "well", "ok", "really", "my", "map",
        "diagram", "project", "today", "we", "need", "maybe", "you", "know", "great", "cool", "hmm", "yes", "right", "just", "actually",
        "anyway", "sure", "thanks", "here", "now", "of", "like", "for", "team", "last", "one", "was", "fine", "things", "sometimes"]

_SYL = ["ka", "lo", "mi", "ra", "te", "su", "no", "vi", "pe", "do", "ba", "zu", "ri", "fa", "go", "le", "ma", "xi", "jo", "wen"]
def make_names(n=60, seed=12345):
    rng = np.random.default_rng(seed); out = []
    while len(out) < n:
        s = "".join(rng.choice(_SYL, size=int(rng.integers(2, 4)))).capitalize()
        if s not in out: out.append(s)
    return out
NAMES = make_names()
TRAIN_NAMES, TEST_NAMES = NAMES[:45], NAMES[45:]      # 15 names only in test

def kind_of_word(w):
    if w in ACTION_OF: return "V_" + ACTION_OF[w]
    if w in COLORS: return "COLOR"
    if w in SHAPES: return "SHAPE"
    if w in RELS: return "REL"
    if w in FUNC: return "F_" + w
    if w in CHAT: return "CHAT"
    if w[:1].isupper(): return "NAME"
    return "UNK"
KINDS = sorted({"V_" + e for e in EVENTS} | {"COLOR", "SHAPE", "REL", "NAME", "CHAT", "UNK"} | {"F_" + f for f in FUNC})
KIND_ID = {k: i for i, k in enumerate(KINDS)}
VERB_KINDS = [k for k in KINDS if k.startswith("V_")]

# ---------------------------------------------------------------- stars (fixed random phases, never learned)
def star(name, D, seed="minivss-stars"):
    h = hashlib.sha256(f"{seed}:{name}".encode()).digest()
    return np.exp(1j * np.random.default_rng(int.from_bytes(h[:8], "little")).uniform(-np.pi, np.pi, D))

class Stars:
    def __init__(self, D, seed=0):
        self.D, self.seed, self.cache = D, seed, {}
    def id(self, w):
        v = self.cache.get(("id", w))
        if v is None: v = self.cache[("id", w)] = star("id:" + w, self.D)          # word stars: global (same in every world)
        return v
    def role(self, r):
        v = self.cache.get(("role", r))
        if v is None: v = self.cache[("role", r)] = star(f"role:{r}", self.D, f"world-{self.seed}")
        return v
    def pred(self): return self.role("_pred")
    def target(self, req):
        """the request's world state: R_pred x f_action + sum_r R_r x f_filler"""
        S = self.pred() * self.id(req["verb"])
        for r, v in req["roles"].items(): S = S + self.role(r) * self.id(v)
        return S

# ---------------------------------------------------------------- generator
FRONTED = 0.15      # share of connect / set / delete requests with the fillers BEFORE the action word ("Kasu , delete it")
def _np(rng, n):
    t = ["the"] if rng.random() < 0.4 else []
    return t + [n]

def render_request(rng, ev, names):
    verbs, roles = EVENTS[ev]; v = str(rng.choice(verbs))
    if ev == "create":
        n = str(rng.choice(names)); s = str(rng.choice(SHAPES)); c = str(rng.choice(COLORS)) if rng.random() < 0.6 else None
        col = [c] if c else []
        t = int(rng.integers(4))
        if t == 0: toks = [v, "a"] + col + [s, "named", n]
        elif t == 1: toks = [v, "a"] + col + [s, "called", n]
        elif t == 2: toks = [v, n, "as", "a"] + col + [s]
        else: toks = [v, "a"] + col + [s, n]
        r = {"shape": s, "name": n}
        if c: r["color"] = c
    elif ev == "connect":
        a, b = [str(x) for x in rng.choice(names, 2, replace=False)]
        mid = str(rng.choice(["to", "with", "and"]))
        if rng.random() < FRONTED: toks = _np(rng, a) + ["and"] + _np(rng, b) + [",", v, "them"]
        else: toks = [v] + _np(rng, a) + [mid] + _np(rng, b)
        r = {"source": a, "target": b}
    elif ev == "move":
        a, b = [str(x) for x in rng.choice(names, 2, replace=False)]; rel = str(rng.choice(RELS))
        toks = [v] + _np(rng, a) + [rel] + _np(rng, b); r = {"object": a, "relation": rel, "landmark": b}
    elif ev == "set":
        a = str(rng.choice(names)); c = str(rng.choice(COLORS))
        t = int(rng.integers(2))
        if rng.random() < FRONTED: toks = _np(rng, a) + [",", v, "it"] + ([c] if t == 0 else ["in", c])
        else: toks = [v] + _np(rng, a) + ([c] if t == 0 else ["in", c])
        r = {"object": a, "color": c}
    else:
        a = str(rng.choice(names)); toks = (_np(rng, a) + [",", v, "it"]) if rng.random() < FRONTED else [v] + _np(rng, a); r = {"object": a}
    return toks, {"event": ev, "verb": v, "roles": r}

CHAT_PLAIN = [["so", "uh"], ["i", "think", "this", "looks", "good"], ["this", "is", "my", "diagram"], ["ok"], ["thanks"],
              ["well", "you", "know"], ["hmm", "maybe"], ["this", "is", "for", "the", "team"], ["nice", "one"], ["um", "anyway"],
              ["yes", "right"], ["just", "like", "the", "last", "one"], ["it", "was", "fine", "today"], ["cool", "really", "cool"],
              ["we", "need", "this", "now"], ["sure"], ["actually", "it", "looks", "great"], ["the", "map", "is", "here"]]
CHAT_FALSE = [["this", "is", "a", "{A}", "of", "the", "map"], ["the", "last", "{A}", "looks", "good"], ["i", "think", "the", "{A}", "is", "nice"],
              ["we", "{A}", "things", "here", "sometimes"], ["my", "{A}", "was", "fine"], ["it", "is", "like", "a", "{A}"]]
ALL_ACTIONS = sorted(ACTION_OF)

CHAT_NAME = [["{N}", "looks", "nice"], ["i", "think", "{N}", "is", "good"], ["this", "is", "for", "{N}"]]
def chatter(rng, p_false, names, p_name=0.25):
    if rng.random() < p_name:
        n = str(rng.choice(names)); return [n if t == "{N}" else t for t in CHAT_NAME[int(rng.integers(len(CHAT_NAME)))]]
    if rng.random() < p_false:
        a = str(rng.choice(ALL_ACTIONS)); ph = CHAT_FALSE[int(rng.integers(len(CHAT_FALSE)))]
        return [a if t == "{A}" else t for t in ph]
    return list(CHAT_PLAIN[int(rng.integers(len(CHAT_PLAIN)))])

SEPS = [[","], ["and"], ["then"], ["."], [], [",", "then"], ["and", "then"]]

def message(rng, n_req, n_chat, names, p_false=0.3):
    """-> dict(tokens, owner (per token: request index or -1), requests, centres (gold action positions), n_chat)"""
    reqs = [render_request(rng, str(rng.choice(list(EVENTS))), names) for _ in range(n_req)]
    gaps = [[] for _ in range(n_req + 1)]                      # chatter phrases per gap (before req 0, between, after last)
    for _ in range(n_chat): gaps[int(rng.integers(n_req + 1))].append(chatter(rng, p_false, names))
    toks, owner, centres = [], [], []
    def add(ts, o):
        toks.extend(ts); owner.extend([o] * len(ts))
    for i, (rt, rq) in enumerate(reqs):
        for ph in gaps[i]:
            add(ph, -2); add([str(rng.choice([",", "."]))] if rng.random() < 0.6 else [], -1)
        if i > 0 and not gaps[i]: add(SEPS[int(rng.integers(len(SEPS)))], -1)
        centres.append(len(toks) + rt.index(rq["verb"])); add(rt, i)
    for ph in gaps[n_req]:
        add([str(rng.choice([",", "."]))] if rng.random() < 0.6 else [], -1); add(ph, -2)
    return {"tokens": toks, "owner": owner, "requests": [r for _, r in reqs], "centres": centres, "n_chat": n_chat}

def dataset(seed, n, n_req=(1, 3), n_chat=(0, 2), names=None, p_false=0.3):
    rng = np.random.default_rng(seed); names = names or TRAIN_NAMES; out = []
    for _ in range(n):
        out.append(message(rng, int(rng.integers(n_req[0], n_req[1] + 1)), int(rng.integers(n_chat[0], n_chat[1] + 1)), names, p_false))
    return out

def splits(seed, n_train=6000, n_dev=600, n_test=1200, train_req=(1, 3), test_req=(1, 4), p_false=0.3):
    """train / dev: seen names, train_req requests; test: all names (15 unseen), test_req requests"""
    return (dataset(1000 + seed, n_train, train_req, names=TRAIN_NAMES, p_false=p_false),
            dataset(2000 + seed, n_dev, train_req, names=TRAIN_NAMES, p_false=p_false),
            dataset(3000 + seed, n_test, test_req, names=NAMES, p_false=p_false))

def long_message(seed, n_tokens, p_false=0.3):
    """one synthetic message of at least n_tokens tokens (many requests with chatter), for the cost measurement"""
    rng = np.random.default_rng(seed); toks, owner, centres, reqs = [], [], [], []
    while len(toks) < n_tokens:
        m = message(rng, 4, int(rng.integers(0, 3)), NAMES, p_false)
        off = len(toks); toks += m["tokens"] + ["."]; owner += [o + len(reqs) if o >= 0 else o for o in m["owner"]] + [-1]
        centres += [c + off for c in m["centres"]]; reqs += m["requests"]
    return {"tokens": toks[:n_tokens], "owner": owner[:n_tokens], "requests": reqs, "centres": [c for c in centres if c < n_tokens], "n_chat": -1}

if __name__ == "__main__":
    tr, dv, te = splits(0, 5, 5, 5)
    for m in te:
        print(" ".join(m["tokens"])); print("  ", m["requests"]); print("  ", m["owner"])
    print(len(KINDS), KINDS)

# ---------------------------------------------------------------- zones (text that makes no sense for this world)
SEP_WORDS = {",", ".", "and", "then"}     # evaluation convention: zones are compared after trimming these at both edges
def trim(toks, a, b):
    while a <= b and toks[a] in SEP_WORDS: a += 1
    while b >= a and toks[b] in SEP_WORDS: b -= 1
    return (a, b) if a <= b else None
def runs(flags):
    out, a = [], None
    for i, f in enumerate(list(flags) + [False]):
        if f and a is None: a = i
        if not f and a is not None: out.append((a, i - 1)); a = None
    return out
def gold_zones(m):
    """maximal runs of non-request tokens that contain a chatter-phrase token, trimmed of separators"""
    out = []
    for a, b in runs([o < 0 for o in m["owner"]]):
        if any(m["owner"][i] == -2 for i in range(a, b + 1)):
            t = trim(m["tokens"], a, b)
            if t: out.append(t)
    return out
def zones_from_assignment(tokens, assigned):
    """predicted zones: maximal runs of tokens assigned to no output request, trimmed of separators"""
    out = []
    for a, b in runs([not x for x in assigned]):
        t = trim(tokens, a, b)
        if t: out.append(t)
    return out
