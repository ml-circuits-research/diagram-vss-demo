#!/usr/bin/env python3
"""gen_rules_cover.py: short synthetic commands that cover everything the Rules reader (docs/js/logic.js) can detect (AGENTS.md, owner
2026-11-02 22:04; RULES_COVERAGE.md is the inventory; training/sketch/rules_vs/RULES_VS_LEARNED.md says what the learned readers miss).

What it does
1. Builds candidate messages (seeded): one request per message mostly, two- and three-request one-liners for a share, every action and
   question of the legend, every cue word of every value (picked least-used-first, so rare cues are not starved), every target form
   (a name, a description "the red circle" / "the last box" / "all the stars" / "the boxes that are not blue" / "the blue ones" /
   "everything", a pronoun, a shape made earlier in the message, a list of names) in every role that takes one (target, from, to, anchor),
   with natural variation (capitalisation, polite openers and closers, a few typos, the word orders the Rules accept). Names come from
   per-domain pools; a message's `names` (the canvas) holds the names it mentions plus a few others.
2. Writes the gold of each request by LABEL_CONVENTIONS.md / TRAIN_MSG_SPEC.md (span, trigger, type, args) and, where the conventions are
   silent, by the training majority (RULES_VS_LEARNED.md section 3: "connect A and B" -> from "A,B"; "everything" as the object of arrange /
   distribute -> no target; no axis key without an axis word).
3. Runs the Rules on every candidate (check_rules.mjs) and KEEPS only the messages whose Rules wires equal the gold exactly. The rejects are
   counted by cause and written out (synth/rejects.jsonl, synth/REJECTS.md): generator bugs or Rules/convention differences, never hidden.
4. Removes every kept message whose text equals (lower case, punctuation stripped) or has the same token set as a message of a test set
   (docs/bench six template sets, llm_short, llm_bench/fresh2), and reports the counts (+ Jaccard >= 0.8 near-duplicates, reported only).
5. Writes llm_train/synth_rules/msg_NN.jsonl (the legend of LABEL_CONVENTIONS.md) and llm_train/synth_rules_ops/msg_NN.jsonl (what the Rules
   detect beyond it: groups, double positions, outline, x/y coordinates, "X is connected to Y", "remove all connections"), plus
   synth/coverage.json (per action, per cue: generated, kept).

Run: python3 training/sketch/synth/gen_rules_cover.py [--seed 0] [--n 9000] [--n_ops 1100] [--dry]
"""
import argparse, collections, glob, hashlib, json, math, os, random, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pin_logic   # first: sets LOGIC_JS before anything reads the legend
import cue_counts as CC

HERE = os.path.dirname(os.path.abspath(__file__))
SK = os.path.dirname(HERE)
REPO = os.path.dirname(os.path.dirname(SK))
OUT_CORE = os.path.join(SK, "llm_train", "synth_rules")
OUT_OPS = os.path.join(SK, "llm_train", "synth_rules_ops")
OUT_EXT = os.path.join(SK, "llm_train", "synth_rules_ext")   # free text, templates, help (39be436): its own folder, so synth_rules stays comparable

# ---------------------------------------------------------------------------------------------------------------------------------
# The legend, read from logic.js (rules_inventory.mjs): value cue words of shape, colour, size and the action verbs
# ---------------------------------------------------------------------------------------------------------------------------------
from pin_logic import LOGIC_JS, LOGIC_FROM   # the copy of logic.js the gold is checked against (committed HEAD by default)
INV = json.loads(subprocess.run(["node", os.path.join(HERE, "rules_inventory.mjs")], capture_output=True, text=True, check=True).stdout)
LEG = INV["legend"]
# shape=text (a free text, 39be436) is not a shape noun of descriptions in the Rules ("the title" is not a mention): it has its own builders
# (free text, synth_rules_ext), so the core shapes leave it out
SHAPES = [v for v in LEG["shape"]["values"] if v not in ("any", "text")]
SHAPE_SG, SHAPE_PL = {}, {}
for v, cues in LEG["shape"]["values"].items():
    if v == "text": continue
    forms = ([v] if v != "any" else []) + cues
    SHAPE_PL[v] = [c for c in forms if c.endswith("s") and c != "rhombus"]
    SHAPE_SG[v] = [c for c in forms if not (c.endswith("s") and c != "rhombus")]
SHAPE_SG["any"] = [c for c in SHAPE_SG["any"] if c != "one"]
SHAPE_PL["any"] = SHAPE_PL["any"] + ["things"]   # weight: "things" is the commonest generic plural people type        # "the one" alone is not a description
SHAPE_PL["any"] = [c for c in SHAPE_PL["any"] if c != "ones"]       # "the blue ones" is its own form below
COLORS = list(LEG["color"]["values"])
COLOR_CUES = {v: [v] + c for v, c in LEG["color"]["values"].items()}
SIZES = list(LEG["size"]["values"])
SIZE_CUES = {v: [v] + c for v, c in LEG["size"]["values"].items()}
VERBS = {a: c for a, c in LEG["action"]["values"].items()}
# the words the Rules' spelling step corrects towards (logic.js 1271-1275): shape / colour / size cue words, one-word verb cues of 4+
# letters, the canvas names. A typo elsewhere ("btween", "Wehre") is not corrected by the Rules, so typos are put only on these words.
TYPO_OK = {w for k in ("shape", "color", "size") for v, cs in LEG[k]["values"].items() for w in [v] + cs if len(w) >= 3}
TYPO_OK |= {w for cs in VERBS.values() for w in cs if " " not in w and len(w) >= 4}

def mention(**kw):
    kw = {k: v for k, v in kw.items() if v is not None}
    return "mention(" + ",".join(f"{k}={kw[k]}" for k in sorted(kw)) + ")"

# ---------------------------------------------------------------------------------------------------------------------------------
# names (one capitalised word, letters/digits) by domain; none is a cue word or an English word the templates use
# ---------------------------------------------------------------------------------------------------------------------------------
DOMAINS = {
    "network diagram": "Router Switch1 Lan Wan Firewall Modem Nas Gateway Vpn Proxy Dns Dhcp Ap2 Uplink Rack3".split(),
    "cloud architecture": "Api Db Cache Queue Worker Cdn Lambda Bucket S3 Redis Kafka Auth Billing Ingress Pod1 Pod2".split(),
    "flowchart": "Start Done Check Process Decide Review Submit Approve Reject Verify Retry Finish Begin Stop2 Draft".split(),
    "org chart": "Ceo Cfo Cto Coo Hr Sales Legal Ops Intern Manager Lead Finance Marketing Support Recruiting".split(),
    "family tree": "Grandma Grandpa Mom Dad Aunt Uncle Alice Bob Carol Dave Emma Liam Noah Olivia Sophia".split(),
    "state machine": "Idle Running Paused Stopped Error Ready Waiting Loading Closed Open2 Locked Armed Booting Halted".split(),
    "mind map": "Idea Goals Budget Team Risks Timeline Vision Scope Metrics Users Research Launch Pricing Branding".split(),
    "kanban board": "Todo Doing Backlog Blocked Testing Deployed Sprint1 Sprint2 Epic Story Bug42 Task7 Ticket9".split(),
    "floor plan": "Kitchen Bedroom Bathroom Hallway Garage Office Pantry Porch Attic Cellar Lounge Studio Closet".split(),
    "school diagram": "Sun Earth Mars Venus Jupiter Saturn Moon Comet Neptune Mercury Pluto Orbit Nucleus Cell Atom".split(),
    "game map": "Castle Forest Village Cave Bridge Tower Dungeon Swamp Harbor Volcano Temple Mine Camp Shrine".split(),
    "recipe": "Flour Sugar Eggs Butter Milk Dough Oven Batter Yeast Salt Mix Bowl Cream Icing Whisk".split(),
    "sports play": "Qb Wr1 Wr2 Te Rb Center Guard Tackle Safety Corner2 Striker Keeper Winger Pivot".split(),
    "story board": "Scene1 Scene2 Scene3 Hero Villain Intro Climax Ending Twist Prologue Epilogue Chapter4".split(),
    "pipeline": "Ingest Parse Clean Enrich Train Deploy Monitor Export Validate Archive Etl Loader Sink Source".split(),
    "ui wireframe": "Header Footer Sidebar Navbar Button1 Search Logo Banner Modal Card Avatar Menu Toolbar".split(),
    "electric circuit": "Battery Resistor Led Capacitor Ground Vcc Diode Fuse Relay Motor Sensor Coil R1 C2".split(),
    "supply chain": "Factory Warehouse Depot Store Supplier Truck Port Customs Retailer Hub Dock Plant Courier".split(),
    "biology": "Plankton Krill Fish Seal Shark Algae Whale Squid Crab Kelp Coral Otter Heron".split(),
    "letters": "B C D E F G H K M P Q X Y Z".split(),
}
FRESH = ("Nova Gem Prism Atlas Zed Kiwi Vault Ledger Inbox Beacon Cobalt Ember Falcon Glacier Harbor2 Iris Jade Karma Lotus Maple "
         "Nimbus Onyx Pebble Quartz Raven Sage Tundra Umbra Vega Willow Xenon Yarrow Zenith Aster Birch Cedar Delta9 Echo Fable Gizmo "
         "Hazel Indigo2 Juno Kepler Lumen Mango Nectar Opal Pixel2 Quill Rumba Sierra Tango Ursa Vortex Wren Yeti Zinnia Acorn Bramble "
         "Cinder Dune Flint Grove Halo Ivy Jasper Koala Lark Mesa Nook Oasis Plume Reef Spire Thistle Vale Wisp").split()
LABELS = ["start", "end", "ok?", "yes", "no", "retry", "Save", "Load data", "step 1", "step 2", "Approve", "v2", "TODO", "Draft", "Paid",
          "Shipped", "Error 404", "home", "login", "Next", "Back", "Pending", "Done!", "Q1", "beta", "Main entry", "checkout", "sync",
          "upload", "Refund", "archive", "notify", "Input", "Output", "payment", "Cancel", "Is it valid?", "send email", "hot", "cold",
          "OK", "Go", "low priority", "urgent", "x > 0", "loop", "sales 2026", "phase A", "fail", "pass"]
NUMS_DIST = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 100, 120, 150, 200, 250]
NUMW = {2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve"}

# ---------------------------------------------------------------------------------------------------------------------------------
# a request = chunks: (kind, text) with kind t = trigger, c = cue word (may get a typo), n = name (may get a typo), x = plain
# ---------------------------------------------------------------------------------------------------------------------------------
class Req:
    def __init__(self, chunks, typ, args, tags, needs=(), creates=None, last=None, group=None, question=False, folder="core"):
        self.chunks, self.type, self.args, self.tags = [list(c) for c in chunks if c[1] != ""], typ, args, list(tags)
        self.needs, self.creates, self.last, self.group, self.question, self.folder = list(needs), creates, last, group, question, folder
        self.verbless = False   # a clause without a verb (a placement, "A goes to B", "two blue boxes"): the Rules read it only first in a message
        self.sentence = typ in ("fact", "rule")   # facts and rules are joined to their neighbours by a sentence end
    @property
    def text(self): return "".join(c[1] for c in self.chunks)
    @property
    def trigger(self):
        ts = [c[1] for c in self.chunks if c[0] == "t"]
        return ts[0] if ts else None

def T(s): return ("t", s)
def C(s): return ("c", s)
def N(s): return ("n", s)
def X(s): return ("x", s)
def act_of(typ, a): return f"{typ}:{a.get('action') or a.get('ask') or ''}" if typ in ("command", "question") else typ

class Gen:
    def __init__(self, seed):
        self.r = random.Random(seed)
        self.use = collections.Counter()
    # balanced choice: least-used options first (probability ~ 1/(1+uses)^2), so every cue appears
    def pick(self, tag, options, w=None):
        opts = list(options)
        ws = [(w[i] if w else 1.0) / (1 + self.use[f"{tag}={o if isinstance(o, str) else o[0]}"]) ** 2 for i, o in enumerate(opts)]
        o = self.r.choices(opts, ws)[0]
        self.use[f"{tag}={o if isinstance(o, str) else o[0]}"] += 1
        return o
    def coin(self, p): return self.r.random() < p
    def ch(self, xs): return self.r.choice(xs)

# ---------------------------------------------------------------------------------------------------------------------------------
# the message context: canvas names of the domain, names used, names created in this message
# ---------------------------------------------------------------------------------------------------------------------------------
class Msg:
    def __init__(self, g, domain):
        self.g, self.domain, self.pool = g, domain, DOMAINS[domain][:]
        g.r.shuffle(self.pool)
        self.used, self.created, self.prev = [], {}, None
    def name(self, avoid=()):
        cands = [n for n in self.pool if n not in avoid and n not in self.created]
        n = self.g.ch(cands)
        if n not in self.used: self.used.append(n)
        return n
    def names(self, k, avoid=()):
        out = []
        for _ in range(k): out.append(self.name(avoid=list(avoid) + out))
        return out
    def fresh(self):
        taken = {x.lower() for d in DOMAINS.values() for x in d} | {x.lower() for x in self.created}
        return self.g.ch([f for f in FRESH if f.lower() not in taken])

# ---------------------------------------------------------------------------------------------------------------------------------
# value phrases (each returns chunks, gold value, tags)
# ---------------------------------------------------------------------------------------------------------------------------------
def color_w(g, val=None):
    v = val or g.pick("val:color", COLORS); cue = g.pick(f"color:{v}", COLOR_CUES[v]); return cue, v, [f"color:{v}={cue}"]
def size_w(g, val=None):
    v = val or g.pick("val:size", SIZES); cue = g.pick(f"size:{v}", SIZE_CUES[v]); return cue, v, [f"size:{v}={cue}"]
def shape_w(g, plural=False, val=None, generic=False):
    vals = SHAPES + (["any"] if generic else [])
    v = val or g.pick("val:shape", vals)
    cue = g.pick(f"shape:{v}:{'pl' if plural else 'sg'}", (SHAPE_PL if plural else SHAPE_SG)[v])
    return cue, (None if v == "any" else v), [f"shape:{v}={cue}"]
def art(word): return "an" if word[0].lower() in "aeiou" else "a"

def names_list(g, ns, conj=None):
    """'A and B', 'A, B and C', 'A & B'"""
    conj = conj or g.ch([" and "] * 6 + [" & "])
    ch = []
    for i, n in enumerate(ns):
        if i: ch.append(X(conj if i == len(ns) - 1 else ", "))
        ch.append(N(n))
    return ch

# a description of existing shapes; forms: desc (the [colour] shape), recency, all, theplural, bare, notcolor, ones, everything, generic
def describe(g, m, form, plural_ok=True, color_p=0.55, whole=False):
    tags = [f"desc:{form}"]
    if form == "desc":
        col = color_w(g) if g.coin(color_p) else None
        sw, sv, st = shape_w(g, generic=col is not None and g.coin(0.15))   # "the blue element": a colour and a generic noun
        words = ["the"] + ([col[0]] if col else []) + [sw]
        return [X(" ".join(words[:-1]) + " "), C(sw)], mention(color=col[1] if col else None, shape=sv), tags + st + (col[2] if col else []), "one"
    if form == "recency":
        rec = g.pick("recency", ["new", "newest", "last", "latest", "most recent", "first", "oldest", "earliest"])
        rv = "oldest" if rec in ("first", "oldest", "earliest") else "newest"
        col = color_w(g) if g.coin(0.35) else None
        sw, sv, st = shape_w(g)
        pre = "the " + rec + " " + (col[0] + " " if col else "")
        return [X(pre), C(sw)], mention(color=col[1] if col else None, recency=rv, shape=sv), tags + [f"recency:{rv}={rec}"] + st + (col[2] if col else []), "one"
    if form == "recency_one":
        rec = g.pick("recency", ["new", "newest", "last", "latest", "most recent", "first", "oldest", "earliest"])
        rv = "oldest" if rec in ("first", "oldest", "earliest") else "newest"
        return [X(f"the {rec} one")], mention(recency=rv), tags + [f"recency:{rv}={rec}"], "one"
    if form in ("all", "theplural", "bare"):
        col = color_w(g) if g.coin(color_p) else None
        if form == "all":
            q = g.pick("quant", ["all", "all the", "all of the", "every", "each"])
            pl = q not in ("every", "each")
            sw, sv, st = shape_w(g, plural=pl, generic=g.coin(0.2))
            pre = q + " " + (col[0] + " " if col else "")
            tags.append(f"quantifier:all={q}")
        else:
            sw, sv, st = shape_w(g, plural=True, generic=g.coin(0.1) and form == "theplural")
            pre = ("the " if form == "theplural" else "") + (col[0] + " " if col else "")
            tags.append(f"quantifier:all={'the+plural' if form == 'theplural' else 'bare plural'}")
        return [X(pre), C(sw)], mention(color=col[1] if col else None, quantifier="all", shape=sv), tags + st + (col[2] if col else []), "many" if form != "bare" else "many_nogroup"
    if form == "notcolor":
        nv = g.pick("val:notcolor", COLORS)
        pat = g.pick("notcolor", ["the {s} that are not {c}", "all {s} which are not {c}", "the {s} which aren't", "every {s1} that is not {c}", "all the {s} that are not {c}"][:2] + ["every {s1} that is not {c}", "all the {s} that are not {c}"])
        pl = "{s1}" not in pat
        sw, sv, st = shape_w(g, plural=pl, generic=g.coin(0.15))
        txt = pat.replace("{s}", sw).replace("{s1}", sw).replace("{c}", nv)
        i = txt.index(sw)
        return [X(txt[:i]), C(sw), X(txt[i + len(sw):])], mention(notcolor=nv, quantifier="all", shape=sv), tags + st + [f"notColor:{nv}=not {nv}", "quantifier:all=" + pat.split()[0]], "many"
    if form == "ones":
        col = color_w(g)
        return [X(g.pick("ones", ["the ", "all the "]) + col[0] + " ones")], mention(color=col[1], quantifier="all"), tags + col[2] + ["shape:any=ones"], "many"
    if form == "everything":
        w = g.pick("everything", ["everything", "all shapes", "all the shapes", "every shape", "all of the shapes", "all the nodes", "all the elements", "everything on the canvas"]
                   + (["all", "them all", "all of them", "the whole diagram", "the diagram"] if whole else []))
        return [X(w)], mention(quantifier="all"), tags + [f"quantifier:all={w}"], "many_nogroup"
    raise ValueError(form)

def target(g, m, forms, weights=None, whole=False):
    """a target: a name (sometimes 'the Name', 'the box Name', 'the shape named Name', sometimes typed in lower case), a list of names, or a
    description; whole=True: "everything" may also be said "all", "them all", "the whole diagram" (arrange / align / distribute)"""
    f = g.pick("tform", forms, weights)
    if f == "name":
        n = m.name()
        shown = n.lower() if g.coin(0.05) and len(n) > 2 else n
        if g.coin(0.1):   # "the shape/box/node X" -> the name X (logic.js nounBeforeName)
            pre = g.pick("noun+name", ["the shape ", "the box ", "the node ", "the shape named ", "the node called ", "the element "])
            return [X(pre), N(n)], n, ["target:noun+name", f"noun+name:{pre.strip()}"], "one"
        pre = [X("the ")] if g.coin(0.08) else []
        return pre + [N(shown)], n, ["target:name" + ("_lc" if shown != n else "")], "one"
    if f == "list":
        ns = m.names(g.ch([2, 2, 3]))
        return names_list(g, ns), ",".join(ns), ["target:list"], "many"
    ch, gold, tags, num = describe(g, m, f, whole=whole)
    return ch, gold, tags + ["target:desc"], num

def anchor(g, m, desc_p=0.4, avoid=()):
    if g.coin(desc_p):
        ch, gold, tags, _ = describe(g, m, g.pick("aform", ["desc", "recency"]))
        return ch, gold, tags + ["anchor:desc"]
    n = m.name(avoid=avoid)
    return [N(n)], n, ["anchor:name"]

REL = {"leftOf": ["left of", "to the left of", "on the left of", "left side of"], "rightOf": ["right of", "to the right of", "on the right of", "right side of"],
       "above": ["above", "over", "on top of"], "below": ["below", "under", "underneath", "beneath"],
       "near": ["next to", "near", "beside", "close to", "by", "alongside", "around"]}
REGION = {"topLeft": ["in the top left", "in the top left corner", "in the upper left", "in the upper-left corner", "at the top left", "to the top left", "in the top-left corner"],
          "topRight": ["in the top right", "in the top right corner", "in the upper right", "at the top-right", "to the top right", "in the upper-right corner"],
          "bottomLeft": ["in the bottom left", "in the lower left", "in the bottom-left corner", "to the lower left corner", "in the lower-left corner"],
          "bottomRight": ["in the bottom right", "in the lower right", "in the bottom right corner", "to the lower-right", "in the bottom-right corner"],
          "center": ["in the center", "in the middle", "in the centre", "at the center", "in the middle of the canvas", "in the center of the page", "to the middle"],
          "top": ["at the top", "along the top", "at the top edge", "on the top"],
          "bottom": ["at the bottom", "along the bottom", "at the bottom edge", "on the bottom"],
          "left": ["on the left", "at the left", "along the left edge", "on the left side"],
          "right": ["on the right", "at the right", "along the right edge", "on the right side"]}

def place(g, m, kinds=("rel", "between", "region"), w=(5, 1, 3), desc_p=0.4, avoid=()):
    k = g.pick("place", kinds, list(w))
    if k == "rel":
        p = g.pick("val:position", list(REL)); cue = g.pick(f"position:{p}", REL[p])
        ach, ag, at = anchor(g, m, desc_p, avoid)
        return [C(cue), X(" ")] + ach, {"position": p, "anchor": ag}, [f"position:{p}={cue}"] + at, cue
    if k == "between":
        a, b = m.names(2, avoid=avoid)
        return [C("between"), X(" "), N(a), X(" and "), N(b)], {"position": "between", "anchor": f"{a},{b}"}, ["position:between=between"], "between"
    p = g.pick("val:region", list(REGION)); cue = g.pick(f"region:{p}", REGION[p])
    return [C(cue)], {"position": p}, [f"position:{p}={cue}"], cue

def verb(g, action, options=None):
    v = g.pick(f"verb:{action}", options or VERBS[action])
    return v, [f"verb:{action}={v}"]

# ---------------------------------------------------------------------------------------------------------------------------------
# COMMANDS
# ---------------------------------------------------------------------------------------------------------------------------------
def r_create(g, m):
    v, vt = verb(g, "create", [x for x in VERBS["create"]])
    tags = ["act:create"] + vt
    args = {"action": "create"}
    count = None
    if g.coin(0.15):
        count = g.pick("count", [str(n) for n in range(2, 13)] + [NUMW[n] for n in range(2, 13)] + ["a couple of", "a pair of"])
        cnum = 2 if count in ("a couple of", "a pair of") else int(count) if count.isdigit() else {w: n for n, w in NUMW.items()}[count]
        args["count"] = str(cnum); tags.append("count:" + ("word" if not count.isdigit() else "digit"))
    mods = []
    if g.coin(0.35): s = size_w(g); mods.append(s); args["size"] = s[1]; tags += s[2]
    if g.coin(0.6): c = color_w(g); mods.append(c); args["color"] = c[1]; tags += c[2]
    if g.coin(0.15): mods.reverse()
    sw, sv, st = shape_w(g, plural=bool(count))
    args["shape"] = sv; tags += st
    first = (mods[0][0] if mods else sw)
    det = count if count else (g.ch(["another", "one"]) if g.coin(0.06) else art(first))
    if det in ("another", "one"): tags.append("det:" + det)
    me = " me" if v in ("sketch", "draw") and g.coin(0.15) else ""
    ch = [T(v), X(me + " " + det + " ")]
    for mw in mods: ch += [C(mw[0]), X(" ")]
    ch.append(C(sw))
    tails = []
    if not count and g.coin(0.35):
        n = m.fresh(); m.created[n] = True; args["name"] = n
        cue = g.pick("named", ["named", "called", "with the name", "name it"])
        tails.append([X(f" {cue} "), N(n)]); tags.append(f"name:{cue}")
    if g.coin(0.18):
        lab = g.ch(LABELS)
        how = g.pick("labelcue", ['labeled "{}"', 'labelled "{}"', 'with the text "{}"', 'with the label "{}"', 'saying "{}"', 'that says "{}"',
                                  'titled "{}"', 'reading "{}"', '"{}"', "labeled '{}'", "“{}”", "labeled {}"])
        if how == "labeled {}": lab = g.ch([l for l in LABELS if re.fullmatch(r"[A-Za-z0-9_]+", l)])
        args["label"] = lab; tails.append([X(" " + how.format(lab))]); tags.append("label:" + how.replace("{}", "L"))
    if g.coin(0.5):
        pc, pa, pt, _ = place(g, m)
        args.update(pa); tails.append([X(" ")] + pc); tags += pt
    if len(tails) > 1 and g.coin(0.3): g.r.shuffle(tails)
    for t in tails: ch += t
    if "name" in args and not count: last = "$new"
    else: last = "$new"
    r = Req(ch, "command", args, tags, creates=args.get("name"), last=None if count else last, group="$new" if count else None)
    r.made = None if count else (args.get("color"), args.get("shape"))
    return r

def r_create_verbless(g, m):
    """'a red circle', 'two blue boxes': a clause that starts with an article or a number is a create (logic.js 1435)"""
    args = {"action": "create"}; tags = ["act:create", "verb:create=(none)"]
    cnt = g.coin(0.4)
    col = color_w(g); args["color"] = col[1]; tags += col[2]
    sw, sv, st = shape_w(g, plural=cnt); args["shape"] = sv; tags += st
    if cnt:
        n = g.ch(range(2, 7)); w = g.ch([str(n), NUMW[n]]); args["count"] = str(n)
        ch = [T(w), X(" "), C(col[0]), X(" "), C(sw)]
    else:
        a = art(col[0]); ch = [T(a), X(" "), C(col[0]), X(" "), C(sw)]
    if g.coin(0.5):
        pc, pa, pt, _ = place(g, m); args.update(pa); ch += [X(" ")] + pc; tags += pt
    r = Req(ch, "command", args, tags, last=None if cnt else "$new", group="$new" if cnt else None); r.verbless = True; return r

ALLT = ["name", "desc", "recency", "all", "theplural", "bare", "notcolor", "ones", "everything", "list"]
ALLW = [10, 4, 2, 2, 2, 1.5, 1.5, 1, 1, 2]

def r_delete(g, m):
    v, vt = verb(g, "delete")
    tc, tg, tt, num = target(g, m, ALLT, ALLW)
    ch = [T(v), X(" ")] + tc
    if v in ("clear", "wipe", "reset") and g.coin(0.3) and tg == mention(quantifier="all"):
        pass
    if v == "wipe" and g.coin(0.4): ch = [T("wipe out"), X(" ")] + tc; vt = ["verb:delete=wipe out"]
    return Req(ch, "command", {"action": "delete", "target": tg}, ["act:delete"] + vt + tt)

def r_clear(g, m):
    """'clear the canvas', 'wipe the diagram', 'start over' -> delete everything (logic.js 1439, 1652)"""
    p = g.pick("clear", ["clear the canvas", "clear the diagram", "wipe the canvas", "reset the diagram", "start over", "clear everything", "delete everything", "erase the whole diagram"])
    trig = p.split()[0] if p != "start over" else "start over"
    return Req([T(trig), X(p[len(trig):])], "command", {"action": "delete", "target": mention(quantifier="all")}, ["act:delete", f"verb:delete={trig}", "clear:" + p])

DIRW = {"left": ["left", "to the left"], "right": ["right", "to the right"], "up": ["up", "upwards"], "down": ["down", "downwards"]}
def r_move(g, m):
    v, vt = verb(g, "move", VERBS["move"] + ["put", "place"])
    tags = ["act:move"] + vt
    tforms = ["name", "desc", "recency", "list", "all", "theplural"] if v not in ("put", "place") else ["name", "list"]
    tc, tg, tt, num = target(g, m, tforms, [10, 3, 2, 1.5, 1, 1][:len(tforms)])
    tags += tt; args = {"action": "move", "target": tg}
    avoid = tg.split(",") if not tg.startswith("mention") else []
    k = g.pick("move_kind", ["dir", "dist", "rel", "between", "region"], [3, 3, 5, 1, 3]) if v not in ("put", "place") else g.pick("move_kind_pp", ["rel", "between", "region"], [5, 1, 3])
    ch = [T(v), X(" ")] + tc
    if k in ("dir", "dist"):
        d = g.pick("val:direction", list(DIRW)); dw = g.pick(f"direction:{d}", DIRW[d]); args["direction"] = d; tags.append(f"direction:{d}={dw}")
        if k == "dist":
            n = g.ch(NUMS_DIST); args["distance"] = str(n)
            unit = g.pick("unit", ["px", " px", " pixels", " pixel", " units", " points", ""])
            if unit == "": form = g.ch(["by {n}"]);
            else: form = g.ch(["{n}{u}", "by {n}{u}"])
            dist = form.format(n=n, u=unit); tags.append("distance:" + form.replace("{n}", "N").replace("{u}", unit or ""))
            if g.coin(0.5): ch += [X(" "), C(dw), X(" " + dist)]
            else: ch += [X(" " + dist + " "), C(dw)]
        else: ch += [X(" "), C(dw)]
    else:
        pc, pa, pt, _ = place(g, m, kinds=("rel", "between", "region"), w=(1, 0, 0) if k == "rel" else (0, 1, 0) if k == "between" else (0, 0, 1), avoid=avoid)
        if k == "region" and not pc[0][1].startswith(("to ", "at ", "in ", "on ", "along ")): pass
        if k == "region" and g.coin(0.3) and pa["position"] in ("topLeft", "topRight", "bottomLeft", "bottomRight", "center", "top", "bottom"):
            pc = [C("to the " + pc[0][1].split(" the ", 1)[1])] if " the " in pc[0][1] and not pc[0][1].startswith("to ") and pa["position"] not in ("top", "bottom") else pc
        args.update(pa); tags += pt; ch += [X(" ")] + pc
    return Req(ch, "command", args, tags, last=tg if num == "one" else None, group=tg if num == "many" else None)

def r_move_verbless(g, m):
    """'Kitchen at the top', 'Pit below the Stage': a name + a place is a move (PLACE_ONLY, logic.js 1332, 1438)"""
    n = m.name(); args = {"action": "move", "target": n}
    pc, pa, pt, cue = place(g, m, kinds=("rel", "between", "region"), w=(4, 1, 2), desc_p=0.0, avoid=[n])
    if pa["position"] in ("left", "right") or cue.startswith("to "):    # "X to the left" is a direction elsewhere; keep the region cues that PLACE_ONLY reads
        pc, pa, pt, cue = [C("at the top")], {"position": "top"}, ["position:top=at the top"], "at the top"
    args.update(pa)
    filler = g.ch(["", "", "", " just", " right", " should be"])
    if filler == " right" and cue.split()[0] in ("left", "right", "to", "on"): filler = " just"
    ch = [N(n), X(filler + " "), T(pc[0][1])] + pc[1:]
    r = Req(ch, "command", args, ["act:move", "verb:move=(none)"] + pt, last=n); r.verbless = True; return r

SET_COLOR_FRAMES = [("make", "{v} {T} {c}"), ("turn", "{v} {T} {c}"), ("paint", "{v} {T} {c}"), ("color", "{v} {T} {c}"), ("colour", "{v} {T} {c}"),
                    ("recolor", "{v} {T} {c}"), ("recolour", "{v} {T} {c}"), ("set", "{v} {T} to {c}"), ("change", "{v} {T} to {c}"),
                    ("change", "{v} the color of {T} to {c}"), ("set", "{v} the colour of {T} to {c}"), ("fill", "{v} {T} with {c}"),
                    ("give", "{v} {T} {a} {c} color"), ("give", "{v} {T} the colour {c}"), ("set", "{v} {T}'s color to {c}")]
SET_SHAPE_FRAMES = [("make", "{v} {T} {a} {s}"), ("turn", "{v} {T} into {a} {s}"), ("change", "{v} {T} to {a} {s}"), ("change", "{v} the shape of {T} to {a} {s}"),
                    ("transform", "{v} {T} into {a} {s}"), ("convert", "{v} {T} into {a} {s}"), ("reshape", "{v} {T} into {a} {s}"), ("morph", "{v} {T} into {a} {s}"),
                    ("convert", "{v} {T} to {a} {s}"), ("set", "{v} the shape of {T} to {s}")]
SET_SIZE_FRAMES = [("make", "{v} {T} {z}"), ("set", "{v} {T} to {z}"), ("change", "{v} {T} to {z}"), ("turn", "{v} {T} {z}"), ("set", "{v} the size of {T} to {z}")]

def r_set(g, m):
    what = g.pick("set_kind", ["color", "shape", "size", "combo"], [6, 2.5, 2, 1.5])
    frames = {"color": SET_COLOR_FRAMES, "shape": SET_SHAPE_FRAMES, "size": SET_SIZE_FRAMES, "combo": [("make", "{v} {T} {a} {z} {c} {s}"), ("turn", "{v} {T} into {a} {c} {s}"), ("turn", "{v} {T} into {a} {z} {c} {s}"), ("change", "{v} {T} to {a} {z} {s}"), ("make", "{v} {T} {a} {c} {s}")]}[what]
    vv, fr = g.pick(f"setframe:{what}", frames)
    tags = ["act:set", f"verb:set={vv}", f"setframe:{fr}"]
    tforms = ["name", "desc", "recency", "all", "theplural", "bare", "notcolor", "ones", "everything", "list"]
    tc, tg, tt, num = target(g, m, tforms, [10, 4, 2, 2, 2, 1, 1.5, 1, 0.7, 1.5])
    if "'s " in fr and (tg.startswith("mention") or "," in tg): fr = "{v} the colour of {T} to {c}"   # "the red circles's color": only a name takes 's
    tags += tt; args = {"action": "set", "target": tg}
    if fr.startswith("{v} {T} {c}") and tg.startswith("mention") and "notcolor" not in tg and g.coin(0.0): pass
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{v}": ch.append(T(vv))
        elif piece == "{T}": ch += tc
        elif piece == "{c}": c = color_w(g); ch.append(C(c[0])); args["color"] = c[1]; tags += c[2]
        elif piece == "{z}": z = size_w(g); ch.append(C(z[0])); args["size"] = z[1]; tags += z[2]
        elif piece == "{s}":
            s = shape_w(g); ch.append(C(s[0])); args["shape"] = s[1]; tags += s[2]
        elif piece == "{a}": ch.append(X("{a}"))
        elif piece: ch.append(X(piece))
    # articles: decided after the next word is known
    for i, c in enumerate(ch):
        if c[1] == "{a}": ch[i] = X(art(ch[i + 2][1]))
    return Req(ch, "command", args, tags, last=tg if num == "one" else None, group=tg if num == "many" else None)

RESIZE = [("resize", "{v} {T}"), ("grow", "{v} {T}"), ("enlarge", "{v} {T}"), ("shrink", "{v} {T}"), ("scale", "{v} {T}"), ("scale", "{v} {T} up"), ("scale", "{v} {T} down"),
          ("make", "{v} {T} bigger"), ("make", "{v} {T} smaller"), ("make", "{v} {T} larger"), ("make", "{v} {T} a bit bigger"), ("make", "{v} {T} a little smaller"),
          ("make", "{v} {T} much bigger"), ("make", "{v} {T} a lot smaller"), ("make", "{v} {T} way bigger"), ("make", "{v} {T} twice as big"), ("make", "{v} {T} twice as large"),
          ("make", "{v} {T} half the size"), ("make", "{v} {T} double the size"), ("make", "{v} {T} 3 times bigger"), ("make", "{v} {T} three times larger"), ("grow", "{v} {T} a bit")]
def r_resize(g, m):
    vv, fr = g.pick("resizeframe", RESIZE)
    tc, tg, tt, num = target(g, m, ["name", "desc", "recency", "all", "theplural", "list"], [10, 3, 1.5, 2, 1.5, 1])
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{v}": ch.append(T(vv))
        elif piece == "{T}": ch += tc
        elif piece: ch.append(X(piece))
    return Req(ch, "command", {"action": "resize", "target": tg}, ["act:resize", f"verb:resize={vv}", f"resizeframe:{fr}"] + tt, last=tg if num == "one" else None, group=tg if num == "many" else None)

def r_rename(g, m):
    fr = g.pick("renameframe", ["rename {T} to {N}", "rename {T} as {N}", "rename {T} into {N}", "call {T} {N}", "rename {T} {N}"])
    tc, tg, tt, num = target(g, m, ["name", "desc", "recency"], [8, 2, 1])
    n = m.fresh(); m.created[n] = True
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{T}": ch += tc
        elif piece == "{N}": ch.append(N(n))
        elif piece.startswith("rename") or piece.startswith("call"): w = piece.split()[0]; ch += [T(w), X(piece[len(w):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "command", {"action": "rename", "target": tg, "name": n}, ["act:rename", f"verb:rename={fr.split()[0]}", f"renameframe:{fr}"] + tt, last=None)

LABEL_FRAMES = ['label {T} "{L}"', 'label {T} as "{L}"', 'label {T} with "{L}"', 'write "{L}" on {T}', 'write "{L}" in {T}', 'title {T} "{L}"', 'caption {T} "{L}"',
                'inscribe "{L}" on {T}', 'stamp "{L}" on {T}', 'tag {T} "{L}"', 'add a label "{L}" to {T}', 'add the text "{L}" to {T}', 'add a caption "{L}" to {T}',
                "label {T} '{L}'", 'label {T} “{L}”', "label {T} {W}", "label {T} as {W}", 'put "{L}" on {T}', 'put the label "{L}" on {T}']
def r_label(g, m):
    fr = g.pick("labelframe", LABEL_FRAMES)
    tc, tg, tt, num = target(g, m, ["name", "desc", "recency", "all"], [8, 2, 1, 1])
    lab = g.ch(LABELS) if "{L}" in fr else g.ch([l for l in LABELS if re.fullmatch(r"[A-Za-z][A-Za-z0-9_]*", l)])
    vw = fr.split()[0]; vw = "add" if vw == "add" else vw
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{T}": ch += tc
        elif piece in ("{L}", "{W}"): ch.append(X(lab))
        elif piece.startswith(vw): ch += [T(vw), X(piece[len(vw):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "command", {"action": "label", "target": tg, "label": lab}, ["act:label", f"verb:label={vw}", f"labelframe:{fr}"] + tt, last=tg if num == "one" else None)

def r_duplicate(g, m):
    fr = g.pick("dupframe", ["{v} {T}", "{v} {T}", "{v} {T} {n} times", "{v} {T} twice", "make {n} copies of {T}", "make a copy of {T}", "{v} {T} {w} times"])
    v = g.pick("verb:duplicate", VERBS["duplicate"]) if "{v}" in fr else "make"
    tc, tg, tt, num = target(g, m, ["name", "desc", "recency"], [8, 2, 1])
    args = {"action": "duplicate", "target": tg}
    n = g.ch(range(2, 7))
    if "{n}" in fr or "{w}" in fr or "twice" in fr: args["count"] = "2" if "twice" in fr else str(n)
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{v}": ch.append(T(v))
        elif piece == "{T}": ch += tc
        elif piece == "{n}": ch.append(X(str(n)))
        elif piece == "{w}": ch.append(X(NUMW[n]))
        elif piece.startswith("make"): ch += [T("make"), X(piece[4:])]
        elif piece: ch.append(X(piece))
    return Req(ch, "command", args, ["act:duplicate", f"verb:duplicate={v}", f"dupframe:{fr}"] + tt)

def r_swap(g, m):
    fr = g.pick("swapframe", ["swap {A} and {B}", "swap {A} with {B}", "exchange {A} and {B}", "trade {A} and {B}", "switch places of {A} and {B}",
                              "swap the positions of {A} and {B}", "{A} and {B} switch places", "{A} and {B} trade places", "exchange {A} with {B}"])
    a = m.name()
    if g.coin(0.15): bch, bg, bt, _ = describe(g, m, "desc", color_p=0.7); bt = bt + ["target:desc"]
    else: b = m.name(avoid=[a]); bch, bg, bt = [N(b)], b, []
    trig = next(w for w in ["switch places", "trade places", "swap", "exchange", "trade"] if w in fr)
    ch = []
    for piece in re.split(r"(\{\w\}|switch places|trade places|swap|exchange|trade)", fr):
        if piece == "{A}": ch.append(N(a))
        elif piece == "{B}": ch += bch
        elif piece == trig: ch.append(T(piece))
        elif piece: ch.append(X(piece))
    return Req(ch, "command", {"action": "swap", "target": f"{a},{bg}"}, ["act:swap", f"verb:swap={trig}", f"swapframe:{fr}"] + bt)

def endpoint(g, m, desc_p, avoid):
    if g.coin(desc_p):
        ch, gold, tags, _ = describe(g, m, g.pick("eform", ["desc", "recency"]), color_p=0.7)
        return ch, gold, tags + ["endpoint:desc"]
    n = m.name(avoid=avoid); return [N(n)], n, ["endpoint:name"]

STYLE = {"dashed": ["dashed", "dash"], "dotted": ["dotted"]}
ARROW = {"both": ["two-way", "two way", "bidirectional", "double-headed", "two headed"], "none": ["plain", "undirected"]}
def r_connect(g, m):
    kind = g.pick("connect_kind", ["pair", "pair_and", "one_many", "many_one", "pairing", "sequence", "edge_noun", "goes_to"], [8, 1.5, 2, 1, 3, 1.2, 3, 3])
    tags = ["act:connect", f"connect:{kind}"]; args = {"action": "connect"}
    mods = []   # style / arrow / colour / label words that go into "with a ... arrow/line"
    def edge_phrase(noun_default):
        """a dashed red two-way arrow / a plain line: sets args"""
        words = []
        if g.coin(0.3): s = g.pick("val:style", list(STYLE)); sw = g.pick(f"style:{s}", STYLE[s]); words.append(sw); args["style"] = s; tags.append(f"style:{s}={sw}")
        if g.coin(0.25): c = color_w(g); words.append(c[0]); args["color"] = c[1]; tags.extend(c[2])
        noun = noun_default
        if g.coin(0.5):
            a = g.pick("val:arrow", ["both", "none", "line"])
            if a == "line": noun = "line"; args["arrow"] = "none"; tags.append("arrow:none=line")
            else: aw = g.pick(f"arrow:{a}", ARROW[a], [2.5, 2, 1, 1, 1] if a == "both" else None); words.append(aw); args["arrow"] = a; tags.append(f"arrow:{a}={aw}")
        if noun in ("line", "lines"): args["arrow"] = args.get("arrow") if args.get("arrow") == "both" else "none"
        return words, noun
    v = g.pick("verb:connect", VERBS["connect"]) if kind not in ("edge_noun", "goes_to") else None
    if v: tags.append(f"verb:connect={v}")
    ch = []
    if kind in ("pair", "pair_and"):
        fch, fg, ft = endpoint(g, m, 0.4, [])
        tch, tg_, tt = endpoint(g, m, 0.4, [fg])
        if kind == "pair_and" and fg.startswith("mention") is False and tg_.startswith("mention") is False:
            # "connect A and B": the training majority (61 of 78 spans) writes from "A,B" with no `to`; the Rules write from A to B (RULES_VS_LEARNED.md)
            args["from"] = f"{fg},{tg_}"; prep = " and "
        else:
            args["from"] = fg; args["to"] = tg_; prep = g.ch([" to ", " to ", " to ", " with "]) if v != "hook" else " up to "
            if prep == " with " and v not in ("join", "connect", "link"): prep = " to "
        ch = [T(v), X(" ")] + fch + [X(prep)] + tch; tags += ft + tt
    elif kind == "one_many":
        a = m.name(); bs = m.names(g.ch([2, 3]), avoid=[a]); args["from"] = a; args["to"] = ",".join(bs)
        ch = [T(v), X(" "), N(a), X(" to ")] + names_list(g, bs, " and ")
    elif kind == "many_one":
        # several to one: the conventions write ONE connect, from "A,B", to "C" (LABEL_CONVENTIONS.md "Other conventions")
        as_ = m.names(2); b = m.name(avoid=as_); args["from"] = ",".join(as_); args["to"] = b
        ch = [T(v), X(" ")] + names_list(g, as_, " and ") + [X(" to "), N(b)]
    elif kind == "pairing":
        ns = m.names(g.ch([3, 3, 4])); p = g.pick("val:pairing", ["chain", "next", "all"])
        cue = g.pick(f"pairing:{p}", {"chain": ["in a chain", "one after the other", "one after other", "in sequence", "in order"], "next": ["each to the next", "each to the next one", "to the next one"], "all": ["all to each other", "every pair", "to each other"]}[p])
        args["from"] = ",".join(ns); args["pairing"] = p; tags.append(f"pairing:{p}={cue}")
        ch = [T(v), X(" ")] + names_list(g, ns, " and ") + [X(" "), C(cue)]
    elif kind == "sequence":
        ns = m.names(3); args["from"] = ",".join(ns); args["pairing"] = "chain"; tags.append("pairing:chain=(A to B and B to C)")
        ch = [T(v), X(" "), N(ns[0]), X(" to "), N(ns[1]), X(g.ch([" and ", ", "])), N(ns[1]), X(" to "), N(ns[2])]
    elif kind == "edge_noun":
        ev = g.pick("edgeverb", ["draw", "add", "create", "make", "put", "insert", "place"]); tags.append(f"verb:connect={ev} (+edge noun)")
        nn = g.pick("edgenoun", ["arrow", "line", "edge", "link", "connection", "connector", "wire"])
        words, noun = edge_phrase(nn)
        if nn == "line": args["arrow"] = args.get("arrow") if args.get("arrow") == "both" else "none"
        tags.append(f"edgenoun:{noun}")
        a = m.name(); b = m.name(avoid=[a]); args["from"] = a; args["to"] = b
        phr = " ".join(words + [noun])
        det = art(phr) if not phr.endswith("s") else "a"
        if noun == "lines": phr = phr[:-1]; noun = "line"
        frm = g.ch(["from {a} to {b}", "from {a} to {b}", "between {a} and {b}"])
        ch = [T(ev), X(f" {det} {phr} ")] + [X(frm.split("{a}")[0]), N(a), X(frm.split("{a}")[1].split("{b}")[0]), N(b)]
        return Req(ch, "command", args, tags, last=None)
    else:  # goes_to: "A goes to B" (CONNECT_ONLY, logic.js 1333, 1437)
        a = m.name(); b = m.name(avoid=[a]); args["from"] = a; args["to"] = b
        vw = g.pick("goesto", ["goes to", "leads to", "flows into", "flows to", "points to", "feeds into", "sends to", "runs to", "passes to", "connects to", "to"])
        tags.append(f"verb:connect={vw}")
        ch = [N(a), X(" "), T(vw), X(" "), N(b)]
        r = Req(ch, "command", args, tags, last=None); r.verbless = True; return r
    if kind in ("pair", "one_many", "many_one", "pairing", "pair_and") and g.coin(0.35):
        words, noun = edge_phrase(g.ch(["arrow", "line", "arrow"]))
        if words or noun == "line" or g.coin(0.3):
            phr = " ".join(words + [noun])
            if noun == "line" and kind in ("one_many", "many_one", "pairing") and g.coin(0.5): ch += [X(" with " + phr + "s")]; tags.append("arrow:none=lines")
            else: ch += [X(" with " + art(phr) + " " + phr)]
            if noun == "line": args["arrow"] = args.get("arrow") if args.get("arrow") == "both" else "none"
        if g.coin(0.2) and kind in ("pair", "one_many"):
            lab = g.ch(LABELS); args["label"] = lab; ch.append(X(f' labeled "{lab}"')); tags.append("connect:label")
    elif kind in ("pair",) and g.coin(0.3):
        a = g.pick("val:arrow2", ["both ways", "without an arrow", "without arrows"])
        args["arrow"] = "both" if a == "both ways" else "none"; ch.append(X(" " + a)); tags.append(f"arrow:{args['arrow']}={a}")
    return Req(ch, "command", args, tags, last=None)

DISC = ["{v} {A} from {B}", "{v} {A} and {B}", "{v} {A} from {B}"]
def r_disconnect(g, m):
    kind = g.pick("disc_kind", ["verb", "edge"], [3, 1.3])
    a = m.name(); b = m.name(avoid=[a])
    if kind == "verb":
        v = g.pick("verb:disconnect", VERBS["disconnect"]); fr = g.ch(DISC)
        if v in ("separate",): fr = g.ch(["{v} {A} and {B}", "{v} {A} from {B}"])
        ch = [T(v), X(" "), N(a), X(" from " if "from" in fr else " and "), N(b)]; tags = [f"verb:disconnect={v}"]
    else:
        v = g.pick("discedge", ["remove", "delete", "erase", "get rid of", "drop", "kill", "cut", "sever", "snip"])
        noun = g.pick("discnoun", ["arrow", "line", "link", "connection", "edge", "connector", "wire"])
        fr = g.ch(["the {n} from {A} to {B}", "the {n} between {A} and {B}"])
        p1, rest = fr.split("{A}"); p2, p3 = rest.split("{B}")
        ch = [T(v), X(" " + p1.replace("{n}", noun)), N(a), X(p2), N(b), X(p3)]; tags = [f"verb:disconnect={v} (+edge noun)", f"edgenoun:{noun}"]
    return Req(ch, "command", {"action": "disconnect", "from": a, "to": b}, ["act:disconnect"] + tags)

AXIS = {"horizontal": ["horizontally", "in a row", "horizontal"], "vertical": ["vertically", "in a column", "vertical"]}
def r_align(g, m):
    v = g.pick("verb:align", ["align", "line up"])
    tc, tg, tt, num = target(g, m, ["list", "all", "theplural", "everything"], [5, 2, 2, 4], whole=True)
    ax = g.pick("val:axis", list(AXIS)); aw = g.pick(f"axis:{ax}", AXIS[ax])
    args = {"action": "align", "target": tg, "axis": ax}
    if not g.coin(0.06): ch = [T(v), X(" ")] + tc + [X(" "), C(aw)]
    else: ch = [T(v), X(" ")] + tc; del args["axis"]   # no axis word: the conventions write no axis; the Rules write horizontal
    return Req(ch, "command", args, ["act:align", f"verb:align={v}", f"axis:{ax}={aw}" if "axis" in args else "axis:(none)"] + tt, group=tg)

def r_distribute(g, m):
    v = g.pick("verb:distribute", ["distribute", "space", "spread", "space out", "spread out"])
    fr = g.pick("distframe", ["{v} {T} {a}", "{v} {T} evenly {a}", "{v} {T} {a} evenly"])
    if v in ("space out", "spread out"): vv, rest = v.split()[0], " out"; fr = fr.replace("{v} {T}", "{v} {T}" + rest)
    else: vv = v
    tc, tg, tt, num = target(g, m, ["list", "all", "theplural", "everything"], [5, 2, 2, 4], whole=True)
    ax = g.pick("val:axis_d", list(AXIS)); aw = g.pick(f"axis:{ax}", AXIS[ax])
    args = {"action": "distribute", "target": tg, "axis": ax}
    noax = g.coin(0.06)
    if noax: del args["axis"]; fr = fr.replace(" {a}", "")
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{v}": ch.append(T(vv))
        elif piece == "{T}": ch += tc
        elif piece == "{a}": ch.append(C(aw))
        elif piece: ch.append(X(piece))
    return Req(ch, "command", args, ["act:distribute", f"verb:distribute={v}", f"axis:{ax}={aw}" if not noax else "axis:(none)"] + tt, group=tg)

LAYOUT = {"row": ["in a row", "in a line", "as a row", "horizontally"], "column": ["in a column", "in a stack", "as a column", "vertically"], "grid": ["in a grid", "as a grid"], "circle": ["in a circle", "in a ring", "as a ring"]}
def r_arrange(g, m):
    v = g.pick("verb:arrange", VERBS["arrange"])
    lay = g.pick("val:layout", list(LAYOUT)); lw = g.pick(f"layout:{lay}", LAYOUT[lay])
    args = {"action": "arrange", "layout": lay}
    tags = ["act:arrange", f"verb:arrange={v}", f"layout:{lay}={lw}"]
    if v == "tidy":   # "tidy (up)" is the improve operation since the ops patch (HIGH_LEVEL_OPS.md section 8); kept for a legend that still lists it
        if g.coin(0.5): return Req([T("tidy"), X(" up")], "command", {"action": "improve"}, ["act:improve", "verb:improve=tidy"])
        tc, tg, tt, num = target(g, m, ["everything"], whole=True)
        return Req([T("tidy"), X(" up ")] + tc, "command", {"action": "improve", "target": tg}, ["act:improve", "verb:improve=tidy"] + tt)
    tf = g.pick("arr_t", ["list", "all", "theplural", "none", "everything"], [4, 2, 2, 2, 4])
    if tf == "none": ch = [T(v), X(" "), C(lw)]
    else:
        tc, tg, tt, num = target(g, m, [tf], whole=True); tags += tt
        args["target"] = tg   # "everything" -> mention(quantifier=all) (coordinator's convention, 2026-11-02); no target word -> no target
        ch = [T(v), X(" ")] + tc + [X(" "), C(lw)]
    return Req(ch, "command", args, tags)

ALL_PHRASES = ["everything", "all shapes", "all the shapes", "every shape", "all of the shapes", "all the nodes", "all the elements", "everything on the canvas",
               "all", "them all", "the whole diagram", "the diagram"]
def r_whole(g, m):
    """whole-diagram one-liners: 'arrange all', 'arrange everything in a grid', 'align all horizontally', 'distribute all vertically'
    (coordinator 2026-11-02: the object 'all / everything / the shapes / the diagram / them all' -> target=mention(quantifier=all))"""
    act = g.pick("whole_act", ["arrange", "align", "distribute"], [3, 2, 2])
    ph = g.pick("whole_phrase", ALL_PHRASES)
    tags = [f"act:{act}", f"whole:{ph}", f"quantifier:all={ph}"]
    args = {"action": act, "target": mention(quantifier="all")}
    if act == "arrange":
        v = g.pick("verb:arrange", ["arrange", "layout", "lay out", "organize", "organise", "arrange", "tidy up"])
        if g.coin(0.2) and v != "tidy up": return Req([T(v), X(" " + ph)], "command", args, tags + [f"verb:arrange={v}"])   # "arrange all": no layout key
        if v == "tidy up": return Req([T("tidy"), X(" up " + ph)], "command", {"action": "improve", "target": mention(quantifier="all")}, [f"whole:{ph}", "act:improve", "verb:improve=tidy"])   # tidy -> improve (ops patch)
        lay = g.pick("val:layout", list(LAYOUT)); lw = g.pick(f"layout:{lay}", LAYOUT[lay]); args["layout"] = lay
        return Req([T(v), X(" " + ph + " "), C(lw)], "command", args, tags + [f"verb:arrange={v}", f"layout:{lay}={lw}"])
    v = g.pick(f"verb:{act}", ["align", "line up"] if act == "align" else ["distribute", "space", "spread", "space out", "spread out"])
    ax = g.pick("val:axis", list(AXIS)); aw = g.pick(f"axis:{ax}", AXIS[ax]); args["axis"] = ax
    vv, out = (v.split()[0], " out") if v.endswith(" out") else (v, "")
    ev = " evenly" if act == "distribute" and g.coin(0.4) else ""
    return Req([T(vv), X(out + " " + ph + ev + " "), C(aw)], "command", args, tags + [f"verb:{act}={v}", f"axis:{ax}={aw}"])

def r_front_back(g, m):
    which = g.pick("fb", ["toFront", "toBack"])
    fr = g.pick(f"fbframe:{which}", {"toFront": ["bring {T} to the front", "bring {T} forward", "bring {T} to front", "raise {T}", "bring {T} in front"],
                                       "toBack": ["send {T} to the back", "send {T} backward", "send {T} backwards", "send {T} behind", "send {T} to back"]}[which])
    tc, tg, tt, num = target(g, m, ["name", "desc", "recency", "all"], [8, 2, 1.5, 1])
    vw = fr.split()[0]; ch = [T(vw), X(" ")] + tc + [X(fr.split("{T}")[1])]
    return Req(ch, "command", {"action": which, "target": tg}, [f"act:{which}", f"verb:{which}={vw}", f"fbframe:{fr}"] + tt, last=tg if num == "one" else None)

def r_history(g, m):
    a = g.pick("hist", ["undo", "redo", "forget"], [1.2, 1, 1])
    if a == "undo": p = g.pick("undoframe", ["undo", "undo that", "undo the last step", "undo the last change", "revert", "revert that", "take that back", "take it back", "undo twice", "undo 3 times"])
    elif a == "redo": p = g.pick("redoframe", ["redo", "redo that", "reapply", "reapply that", "re-apply", "do that again", "redo the last change"])
    else: p = g.pick("forgetframe", ["forget the rules", "forget the defaults", "forget all rules", "clear the rules", "remove all rules", "remove the default rules",
                                      "delete the default rules", "drop the defaults", "reset the defaults", "cancel the rules", "discard the rules", "discard the default rules",
                                      "disregard the defaults", "forget every rule"])
    trig = "take that back" if p.startswith("take that") else "take it back" if p.startswith("take it") else "do that again" if p.startswith("do that") else p.split()[0]
    args = {"action": a}
    # "undo twice" / "undo 3 times": the Rules write count; the conventions list no key for undo (kept to show the difference)
    if p in ("undo twice", "undo 3 times"): pass
    return Req([T(trig), X(p[len(trig):])], "command", args, [f"act:{a}", f"verb:{a}={trig}", f"{a}frame:{p}"])

# ---------------------------------------------------------------------------------------------------------------------------------
# QUESTIONS
# ---------------------------------------------------------------------------------------------------------------------------------
def q_filter(g, m, allow_pos=True):
    """shape / colour / notColor / position filters of count / list / exists -> (noun chunks, args, tags, plural noun used)"""
    args, tags = {}, []
    col = color_w(g) if g.coin(0.45) else None
    sw, sv, st = shape_w(g, plural=True, generic=g.coin(0.4) or col is None and g.coin(0.2))
    if sv: args["shape"] = sv
    if col: args["color"] = col[1]; tags += col[2]
    tags += st
    noun = [C(col[0]), X(" "), C(sw)] if col else [C(sw)]
    return noun, args, tags

def q_count(g, m):
    fr = g.pick("countframe", ["how many {N} are there", "how many {N} do we have", "how many {N} are on the canvas", "count the {N}", "count all the {N}",
                               "what is the number of {N}", "how many {N} {P}", "how many {N} are {P}", "how many {N} are not {c}", "how many arrows are there",
                               "how many connections are there", "how many lines are there", "count the links", "how many edges do we have", "how many {N} {R}"])
    args = {"ask": "count"}; tags = ["act:count", f"countframe:{fr}"]
    trig = "how many" if fr.startswith("how many") else "count" if fr.startswith("count") else "number of"
    if any(w in fr for w in ("arrows", "connections", "lines", "links", "edges")):
        args["kind"] = "edge"; tags.append("kind:edge")
        i = fr.index(trig); return Req([X(fr[:i]), T(trig), X(fr[i + len(trig):])], "question", args, tags, question=True)
    noun, fa, ft = q_filter(g, m); args.update(fa); tags += ft
    ch = []
    for piece in re.split(r"(\{\w\}|how many|count|number of)", fr):
        if piece == "{N}": ch += noun
        elif piece in ("how many", "count", "number of"): ch.append(T(piece))
        elif piece == "{P}":
            pc, pa, pt, _ = place(g, m, kinds=("rel", "between", "region"), w=(5, 1, 2), desc_p=0.15); ch += pc; args.update(pa); tags += pt
        elif piece == "{R}":
            pc, pa, pt, _ = place(g, m, kinds=("region",), w=(1,)); ch += pc; args.update(pa); tags += pt
        elif piece == "{c}": nv = g.pick("val:notcolor", COLORS); ch.append(C(nv)); args["notColor"] = nv; tags.append(f"notColor:{nv}=are not {nv}")
        elif piece: ch.append(X(piece))
    if "notColor" in args and "color" in args:   # "how many red circles are not blue" is nonsense: drop the colour
        return q_count(g, m)
    return Req(ch, "question", args, tags, question=True)

def q_exists(g, m):
    fr = g.pick("existsframe", ["is there {a} {N1}", "are there any {N}", "any {N}", "are any {N} {P}", "is there {a} {N1} {P}", "are there {N} {R}", "is there anything {P}", "are there any {N} that are not {c}"])
    args = {"ask": "exists"}; tags = ["act:exists", f"existsframe:{fr}"]
    trig = "is there" if fr.startswith("is there") else "are there" if fr.startswith("are there") else "any" if fr.startswith("any") else "are any"
    col = color_w(g) if g.coin(0.5) else None
    sw1, sv, st = shape_w(g, plural=False)
    sw = g.pick(f"shape:{sv}:pl", SHAPE_PL[sv])
    if col: args["color"] = col[1]; tags += col[2]
    ch = [T(trig)]; rest = fr[len(trig):]
    for piece in re.split(r"(\{\w+\})", rest):
        if piece == "{N}": ch += ([C(col[0]), X(" ")] if col else []) + [C(sw)]; args["shape"] = sv; tags.append(f"shape:{sv}={sw}")
        elif piece == "{N1}": ch += ([C(col[0]), X(" ")] if col else []) + [C(sw1)]; args["shape"] = sv; tags += st
        elif piece == "{a}": ch.append(X(art(col[0] if col else sw1)))
        elif piece == "{P}":
            pc, pa, pt, _ = place(g, m, kinds=("rel", "between"), w=(5, 1), desc_p=0.15); ch += pc; args.update(pa); tags += pt
        elif piece == "{R}":
            pc, pa, pt, _ = place(g, m, kinds=("region",), w=(1,)); ch += pc; args.update(pa); tags += pt
        elif piece == "{c}": nv = g.pick("val:notcolor", [c for c in COLORS if not col or c != col[1]]); ch.append(C(nv)); args["notColor"] = nv; tags.append(f"notColor:{nv}=are not {nv}")
        elif piece: ch.append(X(piece))
    if "{N" not in fr and "color" in args: del args["color"]
    if fr == "is there anything {P}": args.pop("color", None)
    return Req(ch, "question", args, tags, question=True)

def q_list(g, m):
    fr = g.pick("listframe", ["list the {N}", "list all {N}", "show me the {N}", "show the {N}", "which {N} are there", "which shapes are {c}", "what is {P}", "which {N} are {P}",
                              "list everything {P}", "which shapes are not {nc}", "list the {N} that are not {nc}", "show all {N} {R}", "list all arrows", "show me the connections",
                              "what shapes are {c}", "which {N} are {R}"])
    args = {"ask": "list"}; tags = ["act:list", f"listframe:{fr}"]
    trig = fr.split()[0] if fr.split()[0] != "show" else ("show me" if fr.startswith("show me") else "show")
    if "arrows" in fr or "connections" in fr:
        args["kind"] = "edge"; tags.append("kind:edge"); return Req([T(trig), X(fr[len(trig):])], "question", args, tags, question=True)
    noun, fa, ft = q_filter(g, m)
    ch = [T(trig)]
    for piece in re.split(r"(\{\w+\})", fr[len(trig):]):
        if piece == "{N}": ch += noun; args.update(fa); tags += ft
        elif piece == "{c}": c = color_w(g); ch.append(C(c[0])); args["color"] = c[1]; tags += c[2]
        elif piece == "{nc}": nv = g.pick("val:notcolor", COLORS); ch.append(C(nv)); args["notColor"] = nv; tags.append(f"notColor:{nv}=not {nv}")
        elif piece == "{P}":
            pc, pa, pt, _ = place(g, m, kinds=("rel", "between"), w=(5, 1), desc_p=0.15); ch += pc; args.update(pa); tags += pt
        elif piece == "{R}":
            pc, pa, pt, _ = place(g, m, kinds=("region",), w=(1,)); ch += pc; args.update(pa); tags += pt
        elif piece: ch.append(X(piece))
    if "notColor" in args and "color" in args: return q_list(g, m)
    return Req(ch, "question", args, tags, question=True)

def qtarget(g, m):
    return target(g, m, ["name", "desc", "recency"], [8, 2.5, 1])

def q_property(g, m):
    fr = g.pick("propframe", ["what color is {T}", "what colour is {T}", "what is the color of {T}", "where is {T}", "what is the position of {T}", "what's the location of {T}",
                              "how big is {T}", "how large is {T}", "how small is {T}", "what size is {T}", "what is the size of {T}", "what shape is {T}", "what is the shape of {T}",
                              "what does {T} say", "what is the label of {T}", "what text is on {T}", "what's written on {T}"])
    prop = ("color" if "colo" in fr else "position" if ("where" in fr or "position" in fr or "location" in fr) else "size" if ("big" in fr or "large" in fr or "small" in fr or "size" in fr)
            else "shape" if "shape" in fr else "label")
    tc, tg, tt, num = qtarget(g, m)
    trig = next(t for t in ["what color", "what colour", "color", "where", "position", "location", "how big", "how large", "how small", "what size", "size", "what shape",
                            "shape", "what does", "label", "text", "written"] if t in fr)
    if trig == "written": trig = "what's written"
    ch = []
    for piece in re.split(r"(\{T\})", fr):
        if piece == "{T}": ch += tc
        elif trig in piece: i = piece.index(trig); ch += [X(piece[:i]), T(trig), X(piece[i + len(trig):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "question", {"ask": "property", "target": tg, "property": prop}, ["act:property", f"property:{prop}", f"propframe:{fr}"] + tt, question=True, last=tg if num == "one" else None)

def q_describe(g, m):
    fr = g.pick("descframe", ["describe {T}", "describe the diagram", "describe the canvas", "describe everything", "tell me about {T}", "what's on the canvas", "what is on the canvas",
                              "summarize the diagram", "summarise the drawing", "give an overview", "what is {N}",
                              "what is on the screen right now", "what is on the page", "what's on the diagram so far", "summarize the canvas", "summarize what we have so far", "overview of the canvas", "quick overview of the diagram please",
                              "summarise the canvas for me"])
    if fr == "give an overview": fr = "overview of the diagram"
    args = {"ask": "describe"}; tags = ["act:describe", f"descframe:{fr}"]
    fr = fr.replace("describe everything", "describe {E}")
    trig = next(t for t in ["describe", "tell me about", "what's on", "what is on", "summarize", "summarise", "overview", "what is"] if fr.startswith(t) or t in fr)
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{E}": ch.append(X("everything")); args["target"] = mention(quantifier="all")   # "describe everything" (coordinator's convention 2026-11-02)
        elif piece == "{T}": tc, tg, tt, num = qtarget(g, m); ch += tc; args["target"] = tg; tags += tt
        elif piece == "{N}": n = m.name(); ch.append(N(n)); args["target"] = n; tags.append("target:name")
        elif piece == "everything": ch.append(X(piece)); args["target"] = mention(quantifier="all")   # coordinator's convention 2026-11-02
        elif trig in piece: i = piece.index(trig); ch += [X(piece[:i]), T(trig), X(piece[i + len(trig):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "question", args, tags, question=True)

def q_neighbors(g, m):
    fr = g.pick("neighframe", ["what is connected to {T}", "what's connected to {T}", "who is linked to {T}", "what is attached to {T}", "what is joined to {T}", "what does {T} connect to",
                               "what does {T} link to", "what does {T} point to", "neighbours of {T}", "what are the neighbors of {T}", "which shapes are connected to {T}", "list the connections of {T}"])
    tc, tg, tt, num = qtarget(g, m)
    trig = next(t for t in ["connected to", "linked to", "attached to", "joined to", "connect to", "link to", "point to", "neighbours", "neighbors", "connections"] if t in fr)
    ch = []
    for piece in re.split(r"(\{T\})", fr):
        if piece == "{T}": ch += tc
        elif trig in piece: i = piece.index(trig); ch += [X(piece[:i]), T(trig), X(piece[i + len(trig):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "question", {"ask": "neighbors", "target": tg}, ["act:neighbors", f"neighframe:{fr}"] + tt, question=True)

def q_connected(g, m):
    fr = g.pick("connframe", ["are {A} and {B} connected", "is {A} connected to {B}", "is {A} linked to {B}", "are {A} and {B} linked", "is {A} attached to {B}", "is {A} joined to {B}",
                              "does {A} connect to {B}", "does {A} link to {B}", "is there a connection between {A} and {B}"])
    a = m.name()
    if g.coin(0.2): bch, bg, bt, _ = describe(g, m, "desc", color_p=0.7)
    else: b = m.name(avoid=[a]); bch, bg, bt = [N(b)], b, []
    trig = next(t for t in ["connected", "linked", "attached", "joined", "connect to", "link to", "connection"] if t in fr)
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{A}": ch.append(N(a))
        elif piece == "{B}": ch += bch
        elif trig in piece: i = piece.index(trig); ch += [X(piece[:i]), T(trig), X(piece[i + len(trig):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "question", {"ask": "connected", "target": a, "anchor": bg}, ["act:connected", f"connframe:{fr}"] + bt, question=True)

def q_degree(g, m):
    fr = g.pick("degframe", ["how many connections does {T} have", "how many links does {T} have", "how many arrows does {T} have", "how many lines does {T} have",
                             "how many edges does {T} have", "how many neighbours does {T} have", "how many neighbors has {T} got", "how many links has {T} got", "how many connections do {T} have"])
    if fr.endswith("do {T} have"): fr = "how many connections does {T} have"
    tc, tg, tt, num = qtarget(g, m)
    i = fr.index("{T}"); w = fr.split()[2]
    return Req([T("how many " + w), X(fr[len("how many " + w):i])] + tc + [X(fr[i + 3:])], "question", {"ask": "degree", "target": tg}, ["act:degree", f"degframe:{fr}"] + tt, question=True)

def q_path(g, m):
    fr = g.pick("pathframe", ["is there a path from {A} to {B}", "is there a route from {A} to {B}", "can I get from {A} to {B}", "is {B} reachable from {A}", "can {A} reach {B}",
                              "does {A} lead to {B}", "does anything from {A} lead to {B}", "does {A} reach {B}", "is there a way to go from {A} to {B}", "does {A} flow to {B}", "is {B} downstream of {A}"])
    a_ch, ag, at = endpoint(g, m, 0.15, []); b_ch, bg, bt = endpoint(g, m, 0.1, [ag])
    trig = next(t for t in ["path", "route", "get from", "reachable", "reach", "lead to", "go from", "flow to", "downstream"] if t in fr)
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{A}": ch += a_ch
        elif piece == "{B}": ch += b_ch
        elif trig in piece: i = piece.index(trig); ch += [X(piece[:i]), T(trig), X(piece[i + len(trig):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "question", {"ask": "path", "from": ag, "to": bg}, ["act:path", f"pathframe:{fr}"] + at + bt, question=True)

def q_reachable(g, m):
    fr = g.pick("reachframe", ["what can be reached from {A}", "what is reachable from {A}", "where can I go from {A}", "which shapes can be reached from {A}", "what can I reach from {A}",
                               "what is downstream from {A}", "what can I get to from {A}"])
    a_ch, ag, at = endpoint(g, m, 0.15, [])
    trig = next(t for t in ["reached", "reachable", "go from", "reach", "downstream", "get to"] if t in fr)
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{A}": ch += a_ch
        elif trig in piece: i = piece.index(trig); ch += [X(piece[:i]), T(trig), X(piece[i + len(trig):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "question", {"ask": "reachable", "from": ag}, ["act:reachable", f"reachframe:{fr}"] + at, question=True)

def q_simple(g, m):
    a = g.pick("qsimple", ["cycle", "rules"])
    fr = g.pick(f"{a}frame", {"cycle": ["are there any cycles", "is there a cycle", "is there a loop", "are there loops", "does the diagram have any cycles", "any cycles", "is the graph circular", "do the arrows form a loop",
                                        "are there any loops in the diagram", "is there a cycle anywhere", "does the graph have a cycle", "is anything circular", "do the arrows go in a loop", "any loops"],
                              "rules": ["what rules are there", "what are the rules", "which rules are active", "what defaults are set", "which defaults are active", "show me the rules", "list the defaults", "what default rules do we have"]}[a])
    trig = next(t for t in ["cycles", "cycle", "loops", "loop", "circular", "rules", "defaults", "default"] if t in fr.split())
    i = fr.index(trig)
    return Req([X(fr[:i]), T(trig), X(fr[i + len(trig):])], "question", {"ask": a}, [f"act:{a}", f"{a}frame:{fr}"], question=True)

def q_check(g, m):
    k = g.pick("check_kind", ["color", "shape", "size", "rel", "between", "region", "comparison", "notcolor"], [3, 2, 1.5, 3, 1, 1, 2.5, 1])
    tc, tg, tt, num = target(g, m, ["name", "desc", "recency"], [8, 2, 1])
    args = {"ask": "check", "target": tg}; tags = ["act:check", f"check:{k}"] + tt
    lead = "is "
    ch = [T("is"), X(" ")] + tc
    if k == "color": c = color_w(g); ch += [X(" "), C(c[0])]; args["color"] = c[1]; tags += c[2]
    elif k == "notcolor": nv = g.pick("val:notcolor", COLORS); ch += [X(" not "), C(nv)]; args["notColor"] = nv; tags.append(f"notColor:{nv}=is not {nv}")
    elif k == "shape": s = shape_w(g); ch += [X(" " + art(s[0]) + " "), C(s[0])]; args["shape"] = s[1]; tags += s[2]
    elif k == "size": z = size_w(g); ch += [X(" "), C(z[0])]; args["size"] = z[1]; tags += z[2]
    elif k in ("rel", "between", "region"):
        pc, pa, pt, _ = place(g, m, kinds=(k,), w=(1,), desc_p=0.15, avoid=[tg]); ch += [X(" ")] + pc; args.update(pa); tags += pt
    else:
        cw = g.pick("val:comparison", ["bigger", "larger", "smaller"]); cv = "smaller" if cw == "smaller" else "bigger"
        ach, ag, at = anchor(g, m, 0.25, avoid=[tg])
        ch = [X("is "), ] + tc + [X(" "), T(cw + " than"), X(" ")] + ach; args["comparison"] = cv; args["anchor"] = ag; tags += [f"comparison:{cv}={cw}"] + at
    if tg.startswith("mention") and k in ("color",) and "color=" in tg: return q_check(g, m)
    return Req(ch, "question", args, tags, question=True, last=tg if num == "one" else None)

SUPER = {"biggest": ["biggest", "largest"], "smallest": ["smallest", "tiniest"], "leftmost": ["leftmost"], "rightmost": ["rightmost"], "topmost": ["topmost", "highest"],
         "bottommost": ["bottommost", "lowest"], "mostConnected": ["most connections", "most links", "most arrows", "most edges", "most connected"],
         "leastConnected": ["fewest connections", "least connections", "fewest links", "least connected", "fewest arrows"]}
def q_extreme(g, m):
    s = g.pick("val:superlative", list(SUPER)); w = g.pick(f"superlative:{s}", SUPER[s])
    if s.endswith("Connected"):
        fr = g.pick("extframe_c", ["which shape has the {w}", "what has the {w}", "which node has the {w}", "who has the {w}", "which one is {w}"] if "connected" in w else ["which shape has the {w}", "what has the {w}", "which node has the {w}", "who has the {w}"])
        if fr == "which one is {w}": fr = "which one is the {w}"
    else:
        fr = g.pick("extframe", ["which shape is the {w}", "what is the {w} shape", "which is the {w}", "what's the {w} one", "which one is {w}", "which node is the {w}", "show me the {w} shape"])
    args = {"ask": "extreme", "superlative": s}; tags = ["act:extreme", f"superlative:{s}={w}", f"extframe:{fr}"]
    if g.coin(0.06) and not s.endswith("Connected"):   # a shape filter: the Rules write it, the conventions list only superlative (kept to show the difference)
        sw, sv, st = shape_w(g); fr = fr.replace(" shape", "").replace("{w}", "{w} " + sw) if "shape" in fr or "one" not in fr else fr; args["shape"] = sv; tags += st + ["extreme:shape filter"]
    i = fr.index("{w}")
    return Req([X(fr[:i]), T(w), X(fr[i + 3:])], "question", args, tags, question=True)

def q_nearest(g, m):
    s = g.pick("val:nearest", ["closest", "nearest", "farthest", "furthest"]); sv = "farthest" if s in ("farthest", "furthest") else "closest"
    fr = g.pick("nearframe", ["what is {s} to {A}", "which shape is {s} to {A}", "what's the {s} shape to {A}", "which {N} is {s} to {A}", "what is the {s} {N} from {A}", "which one is {s} from {A}",
                              "what's {s} to {A}", "which {N} is the {s} from {A}"])
    ach, ag, at = anchor(g, m, 0.25)
    args = {"ask": "nearest", "superlative": sv, "anchor": ag}; tags = ["act:nearest", f"superlative:{sv}={s}", f"nearframe:{fr}"] + at
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{s}": ch.append(T(s))
        elif piece == "{A}": ch += ach
        elif piece == "{N}":
            col = color_w(g) if g.coin(0.4) else None; sw, svv, st = shape_w(g); args["shape"] = svv; tags += st
            if col: ch += [C(col[0]), X(" ")]; args["color"] = col[1]; tags += col[2]
            ch.append(C(sw))
        elif piece: ch.append(X(piece))
    return Req(ch, "question", args, tags, question=True)

# ---------------------------------------------------------------------------------------------------------------------------------
# FACTS and RULES
# ---------------------------------------------------------------------------------------------------------------------------------
def r_fact(g, m):
    k = g.pick("fact_kind", ["color", "shape", "size", "rel", "between", "region", "combo"], [4, 2, 1.5, 3, 1, 1.5, 1])
    n = m.name(); args = {"target": n}; tags = ["act:fact", f"fact:{k}"]
    ch = [N(n), X(" "), T(g.ch(["is"]))]
    if k == "color": c = color_w(g); ch += [X(" "), C(c[0])]; args["color"] = c[1]; tags += c[2]
    elif k == "shape": s = shape_w(g); ch += [X(" " + art(s[0]) + " "), C(s[0])]; args["shape"] = s[1]; tags += s[2]
    elif k == "size": z = size_w(g); ch += [X(" "), C(z[0])]; args["size"] = z[1]; tags += z[2]
    elif k == "combo":
        z = size_w(g) if g.coin(0.5) else None; c = color_w(g); s = shape_w(g)
        first = (z or c)[0]; ch += [X(" " + art(first) + " ")] + ([C(z[0]), X(" ")] if z else []) + [C(c[0]), X(" "), C(s[0])]
        args.update({"color": c[1], "shape": s[1]}); tags += c[2] + s[2]
        if z: args["size"] = z[1]; tags += z[2]
    else:
        pc, pa, pt, _ = place(g, m, kinds=(k,), w=(1,), desc_p=0.0, avoid=[n]); ch += [X(" ")] + pc; args.update(pa); tags += pt
    return Req(ch, "fact", args, tags, last=n)

RULE_OPEN = ["from now on", "by default", "in the future", "in future", "henceforth", "going forward", "always"]
def r_rule(g, m):
    fr = g.pick("ruleframe", ["{o} {S} are {v}", "{o} {S} should be {v}", "{o} make {S} {v}", "{o} all shapes are {v}", "{o} everything is {v}", "new {S} should be {v}", "new {S} must be {v}",
                              "new {S} will be {v}", "{S} should be {v} from now on", "{o}, {S} are {v}", "{o} new shapes should be {v}", "{o} {S} are {v2}"])
    args = {}; tags = ["act:rule", f"ruleframe:{fr}"]
    o = g.pick("ruleopen", RULE_OPEN) if "{o}" in fr else None
    if o == "always" and not fr.startswith("{o} make"): o = g.ch(RULE_OPEN[:-1])
    if fr.startswith("{o} make") and g.coin(0.5): o = "always"
    if o: tags.append(f"rule:opener={o}")
    ch = []
    for piece in re.split(r"(\{\w+\})", fr):
        if piece == "{o}": ch.append(T(o))
        elif piece == "{S}": sw, sv, st = shape_w(g, plural=True); ch.append(C(sw)); args["shape"] = sv; tags += st
        elif piece in ("{v}", "{v2}"):
            if piece == "{v2}": c = color_w(g); z = size_w(g); ch += [C(z[0]), X(" and "), C(c[0])]; args["color"] = c[1]; args["size"] = z[1]; tags += c[2] + z[2]
            elif g.coin(0.7): c = color_w(g); ch.append(C(c[0])); args["color"] = c[1]; tags += c[2]
            else: z = size_w(g); ch.append(C(z[0])); args["size"] = z[1]; tags += z[2]
        elif piece.startswith("new ") and not o:
            ch += [X("new ")]
        elif not o and "should be" in piece: i = piece.index("should be"); ch += [X(piece[:i]), T("should be"), X(piece[i + 9:])]
        elif not o and ("must be" in piece or "will be" in piece): w = "must be" if "must be" in piece else "will be"; i = piece.index(w); ch += [X(piece[:i]), T(w), X(piece[i + len(w):])]
        elif piece: ch.append(X(piece))
    if fr.startswith("{S} should be") and not o:
        pass
    if not any(c[0] == "t" for c in ch):
        for c in ch:
            if c[1].strip() == "" or c[0] != "x": continue
            if "from now on" in c[1]: i = c[1].index("from now on"); idx = ch.index(c); ch[idx:idx + 1] = [X(c[1][:i]), T("from now on"), X(c[1][i + 11:])]; break
    return Req(ch, "rule", args, tags)

# ---------------------------------------------------------------------------------------------------------------------------------
# FEATURES beyond LABEL_CONVENTIONS.md (folder synth_rules_ops): groups, double positions, outline, coordinates, linked, disconnect all
# ---------------------------------------------------------------------------------------------------------------------------------
def ops_groups(m):
    """the message's existing groups: {name: members} (names from FRESH, members from the canvas pool)"""
    if not hasattr(m, "groups"):
        m.groups = {}
    return m.groups
def new_group(g, m):
    gs = ops_groups(m)
    gname = g.ch(["Pipeline", "Intake", "Backend", "Frontend", "Team1", "Cluster", "Wing", "Block7", "Squad", "Bundle2", "Stage1", "Layer2", "Zone4", "Unit5", "Ring3"])
    while gname in gs: gname += "x"
    members = m.names(g.ch([2, 3]))
    gs[gname] = members
    return gname, members

def o_group(g, m):
    fr = g.pick("groupframe", ["group {L} as {G}", "group {L} into {G}", "group {L}", "put {L} together", "put {L} together as {G}", "bundle {L} as {G}", "bundle {L} into {G}", "group {L} as a group called {G}"])
    ns = m.names(g.ch([2, 3, 3])); gname = g.ch(["Pipeline", "Intake", "Core", "Cluster", "Wing", "Squad", "Stage1", "Layer2", "Zone4", "Unit5", "Ring3", "Bundle2"])
    while gname in ns or gname in m.created: gname += "x"
    m.created[gname] = True
    args = {"action": "group", "target": ",".join(ns)}
    if "{G}" in fr: args["name"] = gname
    trig = "put" if fr.startswith("put") else fr.split()[0]
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{L}": ch += names_list(g, ns, " and ")
        elif piece == "{G}": ch.append(N(gname))
        elif piece.startswith(trig): ch += [T(trig), X(piece[len(trig):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "command", args, ["act:group", f"groupframe:{fr}"], folder="ops")

def o_add_to_group(g, m):
    gname, mem = new_group(g, m); n = m.name(avoid=mem)
    fr = g.pick("addgframe", ["add {N} to {G}", "put {N} in {G}", "move {N} into {G}", "add {N} to the {G} group"])
    v = fr.split()[0]
    p = fr.replace("{N}", "\0").replace("{G}", "\1")
    ch = [T(v), X(" "), N(n)] + [X(p.split("\0")[1].split("\1")[0]), N(gname), X(p.split("\1")[1])]
    return Req(ch, "command", {"action": "group", "target": f"{n},{gname}", "name": gname}, ["act:group", f"addgframe:{fr}"], folder="ops")

def o_ungroup(g, m):
    gname, mem = new_group(g, m)
    fr = g.pick("ungroupframe", ["ungroup {G}", "split {G} up", "break {G} up", "dissolve {G}", "take {M} out of {G}", "remove {M} from {G}", "split up {G}", "break up the group {G}"])
    tg = mem[0] if "{M}" in fr else gname
    trig = next(t for t in ["ungroup", "split up", "break up", "split", "break", "dissolve", "take", "remove"] if fr.startswith(t))
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{G}": ch.append(N(gname))
        elif piece == "{M}": ch.append(N(mem[0]))
        elif piece.startswith(trig): ch += [T(trig), X(piece[len(trig):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "command", {"action": "ungroup", "target": tg}, ["act:ungroup", f"ungroupframe:{fr}"], folder="ops")

def o_group_q(g, m):
    gname, mem = new_group(g, m)
    fr = g.pick("groupqframe", ["what is in {G}", "what does {G} contain", "which shapes are in {G}", "who is in {G}", "what are the members of {G}",
                                "which group is {M} in", "what group is {M} in", "what group does {M} belong to", "is {M} part of any group", "is {M} in a group",
                                "how many groups are there", "what groups are there", "are there any groups", "list the groups"])
    if "{M}" in fr: args = {"ask": "groupOf", "target": mem[0]}
    elif "{G}" in fr: args = {"ask": "members", "target": gname}
    else: args = {"ask": {"how many": "count", "what groups": "list", "are there": "exists", "list the": "list"}[next(k for k in ["how many", "what groups", "are there", "list the"] if fr.startswith(k))], "kind": "group"}
    trig = next(t for t in ["what groups", "which group", "what group", "belong to", "part of", "in a group", "what is in", "contain", "members", "which shapes are in", "who is in", "how many groups", "what groups", "any groups", "list the groups"] if t in fr)
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{G}": ch.append(N(gname))
        elif piece == "{M}": ch.append(N(mem[0]))
        elif trig in piece: i = piece.index(trig); ch += [X(piece[:i]), T(trig), X(piece[i + len(trig):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "question", args, [f"act:{args['ask']}", f"groupqframe:{fr}"], question=True, folder="ops")

def o_group_target(g, m):
    """a group name as the target of another action (move, delete, duplicate, align, toFront, set, ...)"""
    gname, mem = new_group(g, m)
    k = g.pick("gtarget", ["move", "delete", "duplicate", "toFront", "toBack", "set", "resize", "anchor"])
    if k == "move":
        o = m.name(avoid=mem); rel = g.pick("val:position", ["below", "above", "leftOf", "rightOf"]); cue = REL[rel][0]
        return Req([T("move"), X(" "), N(gname), X(f" {cue} "), N(o)], "command", {"action": "move", "target": gname, "position": rel, "anchor": o}, ["act:move", "group:as target"], folder="ops")
    if k == "delete": return Req([T("delete"), X(" "), N(gname)], "command", {"action": "delete", "target": gname}, ["act:delete", "group:as target"], folder="ops")
    if k == "duplicate": return Req([T("duplicate"), X(" "), N(gname)], "command", {"action": "duplicate", "target": gname}, ["act:duplicate", "group:as target"], folder="ops")
    if k == "toFront": return Req([T("bring"), X(" "), N(gname), X(" to the front")], "command", {"action": "toFront", "target": gname}, ["act:toFront", "group:as target"], folder="ops")
    if k == "toBack": return Req([T("send"), X(" "), N(gname), X(" to the back")], "command", {"action": "toBack", "target": gname}, ["act:toBack", "group:as target"], folder="ops")
    if k == "set": c = color_w(g); return Req([T("make"), X(" "), N(gname), X(" "), C(c[0])], "command", {"action": "set", "target": gname, "color": c[1]}, ["act:set", "group:as target"] + c[2], folder="ops")
    if k == "resize": return Req([T("shrink"), X(" "), N(gname)], "command", {"action": "resize", "target": gname}, ["act:resize", "group:as target"], folder="ops")
    s = shape_w(g); o = [T("add"), X(" " + art(s[0]) + " "), C(s[0]), X(" below "), N(gname)]
    return Req(o, "command", {"action": "create", "shape": s[1], "position": "below", "anchor": gname}, ["act:create", "group:as anchor"] + s[2], folder="ops")

def o_double(g, m):
    """two relations, or a relation + a canvas region (DIAGRAM_OPS.md section 1)"""
    k = g.pick("double_kind", ["create2", "create_region", "move2", "move_region", "check2", "list_region", "fact2", "count2"])
    a, b = m.names(2)
    r1 = g.pick("val:position", list(REL)[:4]); r2 = g.ch([r for r in list(REL)[:4] if r != r1 and {r, r1} not in ({"leftOf", "rightOf"}, {"above", "below"})])
    c1, c2 = REL[r1][0], REL[r2][0]
    conj = g.ch([" and ", " but ", " and also ", ", "])
    reg = g.pick("val:region", ["topLeft", "topRight", "bottomLeft", "bottomRight", "top", "bottom"]); regw = {"topLeft": "in the top left", "topRight": "in the top right", "bottomLeft": "in the bottom left", "bottomRight": "in the bottom right", "top": "near the top", "bottom": "near the bottom"}[reg]
    if k in ("create2", "create_region"):
        s = shape_w(g); ch = [T(g.ch(["draw", "add", "put"])), X(" " + art(s[0]) + " "), C(s[0]), X(" ")]
        args = {"action": "create", "shape": s[1], "position": r1, "anchor": a}
        if k == "create2": ch += [X(f"{c1} "), N(a), X(conj + f"{c2} "), N(b)]; args.update({"position2": r2, "anchor2": b})
        else: ch += [X(f"{c1} "), N(a), X(", " + regw)]; args["region"] = reg
        return Req(ch, "command", args, ["act:create", f"double:{k}"], folder="ops")
    if k in ("move2", "move_region"):
        t = m.name(avoid=[a, b]); ch = [T("move"), X(" "), N(t), X(f" {c1} "), N(a)]
        args = {"action": "move", "target": t, "position": r1, "anchor": a}
        if k == "move2": ch += [X(conj + f"{c2} "), N(b)]; args.update({"position2": r2, "anchor2": b})
        else: ch += [X(", " + regw)]; args["region"] = reg
        return Req(ch, "command", args, ["act:move", f"double:{k}"], folder="ops")
    if k == "check2":
        t = m.name(avoid=[a, b]); return Req([T("is"), X(" "), N(t), X(f" {c1} "), N(a), X(f" and {c2} "), N(b)], "question", {"ask": "check", "target": t, "position": r1, "anchor": a, "position2": r2, "anchor2": b}, ["act:check", "double:check2"], question=True, folder="ops")
    if k == "count2":
        return Req([T("how many"), X(f" shapes are {c1} "), N(a), X(f" and {c2} "), N(b)], "question", {"ask": "count", "position": r1, "anchor": a, "position2": r2, "anchor2": b}, ["act:count", "double:count2"], question=True, folder="ops")
    if k == "list_region":
        return Req([T("which"), X(f" shapes are {c1} "), N(a), X(" and " + regw.replace("near the", "at the"))], "question", {"ask": "list", "position": r1, "anchor": a, "region": reg}, ["act:list", "double:list_region"], question=True, folder="ops")
    t = m.name(avoid=[a, b])
    return Req([N(t), X(" "), T("is"), X(f" {c1} "), N(a), X(f" and {c2} "), N(b)], "fact", {"target": t, "position": r1, "anchor": a, "position2": r2, "anchor2": b}, ["act:fact", "double:fact2"], folder="ops")

def o_outline(g, m):
    k = g.pick("outline_kind", ["set", "set2", "set3", "create", "create_none"])
    c = color_w(g)
    if k == "set": n = m.name(); return Req([T("give"), X(" "), N(n), X(" " + art(c[0]) + " "), C(c[0]), X(" " + g.ch(["outline", "border"]))], "command", {"action": "set", "target": n, "outline": c[1]}, ["act:set", "outline:give"] + c[2], folder="ops")
    if k == "set2": n = m.name(); return Req([T("make"), X(" "), N(n), X("'s " + g.ch(["border", "outline"]) + " "), C(c[0])], "command", {"action": "set", "target": n, "outline": c[1]}, ["act:set", "outline:make's"] + c[2], folder="ops")
    if k == "set3": n = m.name(); return Req([T("set"), X(" the " + g.ch(["border", "outline"]) + " of "), N(n), X(" to "), C(c[0])], "command", {"action": "set", "target": n, "outline": c[1]}, ["act:set", "outline:set the border of"] + c[2], folder="ops")
    s = shape_w(g)
    if k == "create": return Req([T("add"), X(" " + art(s[0]) + " "), C(s[0]), X(" with " + art(c[0]) + " "), C(c[0]), X(" " + g.ch(["border", "outline"]))], "command", {"action": "create", "shape": s[1], "outline": c[1]}, ["act:create", "outline:with a C border"] + c[2] + s[2], folder="ops")
    return Req([T("draw"), X(" " + art(s[0]) + " "), C(s[0]), X(" with no " + g.ch(["outline", "border"]))], "command", {"action": "create", "shape": s[1], "outline": "none"}, ["act:create", "outline:none"] + s[2], folder="ops")

def o_coords(g, m):
    x, y = g.ch(range(40, 760, 10)), g.ch(range(40, 460, 10))
    form = g.pick("coordform", ["at {x}, {y}", "at ({x}, {y})", "to {x},{y}", "at x={x} y={y}", "at position {x}, {y}", "to coordinates {x}, {y}", "at x {x}, y {y}"])
    phr = form.format(x=x, y=y)
    if g.coin(0.5):
        s = shape_w(g); n = m.fresh() if g.coin(0.4) else None
        if form.startswith("to"): phr = "at" + phr[2:]
        ch = [T(g.ch(["draw", "add", "put"])), X(" " + art(s[0]) + " "), C(s[0])] + ([X(" named "), N(n)] if n else []) + [X(" " + phr)]
        args = {"action": "create", "shape": s[1], "at": f"{x},{y}"}
        if n: args["name"] = n
        return Req(ch, "command", args, ["act:create", f"coords:{form}"] + s[2], folder="ops")
    t = m.name()
    if form.startswith("at"): phr = "to" + phr[2:]
    return Req([T(g.ch(["move", "drag", "shift"])), X(" "), N(t), X(" " + phr)], "command", {"action": "move", "target": t, "at": f"{x},{y}"}, ["act:move", f"coords:{form}"], folder="ops")

def o_linked(g, m):
    k = g.pick("linked_kind", ["fact", "create", "count"])
    a, b = m.names(2); w = g.ch(["connected", "linked"])
    if k == "fact": return Req([N(a), X(" "), T("is"), X(f" {w} to "), N(b)], "fact", {"target": a, "linked": b}, ["act:fact", "linked:fact"], folder="ops")
    if k == "create":
        s = shape_w(g); return Req([T("add"), X(" " + art(s[0]) + " "), C(s[0]), X(f" {w} to "), N(a)], "command", {"action": "create", "shape": s[1], "linked": a}, ["act:create", "linked:create"] + s[2], folder="ops")
    return Req([T("how many"), X(f" shapes are {w} to "), N(a)], "question", {"ask": "count", "linked": a}, ["act:count", "linked:count"], question=True, folder="ops")

EDGE_NOUNS = ["arrow", "line", "edge", "link", "connection", "connector", "wire"]
def edge_ref(g, m, ends=None):
    """an existing connection named by its ends -> (chunks, args {from, to} or one of them, tag)"""
    noun = g.pick("edgeref_noun", EDGE_NOUNS)
    k = ends or g.pick("edgeref", ["from_to", "between", "arrow_sym", "dash", "from", "into"], [4, 3, 1.5, 1.5, 1, 1])
    a, b = m.names(2)
    if k == "from_to": return [X(f"the {noun} from "), N(a), X(" to "), N(b)], {"from": a, "to": b}, f"edgeref:the {noun} from A to B"
    if k == "between": return [X(f"the {noun} between "), N(a), X(" and "), N(b)], {"from": a, "to": b}, f"edgeref:the {noun} between A and B"
    if k == "arrow_sym": sym = g.ch(["->", "→"]); return [X("the "), N(a), X(sym), N(b), X(f" {noun}")], {"from": a, "to": b}, f"edgeref:the A{sym}B {noun}"
    if k == "dash": sym = g.ch(["–", "-", " - "]); return [X(f"the {noun} "), N(a), X(sym), N(b)] if g.coin(0.5) else [X("the "), N(a), X(sym), N(b), X(f" {noun}")], {"from": a, "to": b}, f"edgeref:A{sym.strip()}B"
    if k == "from": w = g.ch(["from", "out of", "leaving"]); return [X(f"the {noun} {w} "), N(a)], {"from": a}, f"edgeref:the {noun} {w} A"
    w = g.ch(["into", "going into"]); return [X(f"the {noun} {w} "), N(b)], {"to": b}, f"edgeref:the {noun} {w} B"

def o_edge_label(g, m):
    """the label of an existing connection: set, change, remove, ask (logic.js labelEdge / edgeProperty; coordinator 2026-11-02)"""
    k = g.pick("edgelabel_kind", ["set", "remove", "ask"], [3, 1.5, 1.5])
    ech, ea, et = edge_ref(g, m)
    lab = g.ch(LABELS)
    if k == "set":
        fr = g.pick("edgelabel_set", ['label {E} "{L}"', 'label {E} as "{L}"', 'write "{L}" on {E}', 'put the label "{L}" on {E}', 'change the label of {E} to "{L}"', "label {E} '{L}'"])
        args = dict(action="label", label=lab, **ea)
    elif k == "remove":
        fr = g.pick("edgelabel_rm", ["remove the label of {E}", "remove the text from {E}", "unlabel {E}", "clear the label on {E}", "delete the label from {E}", "get rid of the label on {E}"])
        args = dict(action="label", label="", **ea)
    else:
        fr = g.pick("edgelabel_q", ["what does {E} say", "what is the label of {E}", "what's the label on {E}", "what text is on {E}"])
        args = dict(ask="property", property="label", **ea)
    trig = next(t for t in ["get rid of", "what does", "what is the label", "what's the label", "what text", "label", "write", "put", "change", "remove", "unlabel", "clear", "delete"] if fr.startswith(t))
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece == "{E}": ch += ech
        elif piece == "{L}": ch.append(X(lab))
        elif piece.startswith(trig): ch += [T(trig), X(piece[len(trig):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "question" if k == "ask" else "command", args, [f"act:{'property' if k == 'ask' else 'label'}", f"edgelabel:{k}", f"edgelabel_frame:{fr}", et], question=k == "ask", folder="ops")

def o_unlabel(g, m):
    """removing a shape's label: label="" (coordinator 2026-11-02)"""
    fr = g.pick("unlabel", ["remove the label of {T}", "unlabel {T}", "clear the text of {T}", "clear {N}'s label", "remove {N}'s caption", "get rid of the label on {T}",
                            "remove the title of {T}", "delete the label of {T}", "delete {N}'s label"])
    if "{N}" in fr: n = m.name(); tc, tg, tt = [N(n)], n, ["target:name"]
    else: tc, tg, tt, _ = target(g, m, ["name", "desc", "recency"], [8, 2, 1])
    trig = next(t for t in ["get rid of", "remove", "unlabel", "clear", "delete"] if fr.startswith(t))
    ch = []
    for piece in re.split(r"(\{\w\})", fr):
        if piece in ("{T}", "{N}"): ch += tc
        elif piece.startswith(trig): ch += [T(trig), X(piece[len(trig):])]
        elif piece: ch.append(X(piece))
    return Req(ch, "command", {"action": "label", "target": tg, "label": ""}, ["act:label", f"unlabel:{fr}"] + tt, folder="ops")

def o_create_layout(g, m):
    """several new shapes in a pattern: create count=N shape=S layout=... (+ a position) (coordinator 2026-11-02)"""
    n = g.ch(range(2, 9)); nw = g.ch([str(n), NUMW[n]])
    sw, sv, st = shape_w(g, plural=True)
    lay = g.pick("val:create_layout", ["row", "column", "grid", "circle"])
    cue = g.pick(f"create_layout:{lay}", {"row": ["in a row", "side by side", "in a line", "as a row", "in a row layout"], "column": ["in a column", "stacked", "in a stack", "as a column"],
                                          "grid": ["in a grid", "in a grid layout", "as a grid"], "circle": ["in a circle layout", "in a ring", "as a ring"]}[lay])
    v = g.pick("create_layout_v", ["add", "draw", "create", "put", "place", "make"])
    args = {"action": "create", "count": str(n), "shape": sv, "layout": lay}
    ch = [T(v), X(f" {nw} "), C(sw), X(" " + cue)]
    if g.coin(0.4):
        pc, pa, pt, _ = place(g, m, kinds=("rel", "region"), w=(1, 1), desc_p=0.0); args.update(pa); ch += [X(" ")] + pc; st = st + pt
    return Req(ch, "command", args, ["act:create", f"create_layout:{lay}={cue}"] + st, folder="ops", group="$new")

def o_disc_all(g, m):
    p = g.pick("discall", ["remove all connections", "delete all the arrows", "delete every arrow", "remove all the lines", "erase all links", "get rid of all connections", "remove every connection"])
    trig = "get rid of" if p.startswith("get rid of") else p.split()[0]
    return Req([T(trig), X(p[len(trig):])], "command", {"action": "disconnect", "quantifier": "all"}, ["act:disconnect", f"discall:{p}"], folder="ops")

# ---------------------------------------------------------------------------------------------------------------------------------
# OPS (synth_rules_ops): the high-level layout operations and arrow restyling of the ops patch (training/sketch/ops/HIGH_LEVEL_OPS.md);
# their cue words from the legend (action improve / respace / snap / flip / reverse / sort / equalize / straighten / untangle / fit,
# layout tree / layers / radial / organic). Gold by HIGH_LEVEL_OPS.md sections 2-3; kept only when the Rules read it exactly.
# ---------------------------------------------------------------------------------------------------------------------------------
WHOLE_OBJ = [("", None), (" the diagram", "all"), (" everything", "all"), (" the whole diagram", "all"), (" the whole thing", "all"), (" it all", "all")]
def whole_obj(g, tag):
    ph, q = g.pick(tag, WHOLE_OBJ, [3, 2, 2, 1, 1, 1])
    return ph, ({"target": mention(quantifier="all")} if q else {})

def o_relayout(g, m):
    k = g.pick("relayout_kind", ["improve", "respace", "snap", "flip", "reverse", "sort", "equalize", "straighten", "untangle", "fit", "layout", "align_edge"])
    if k == "improve":
        v = g.pick("verb:improve", VERBS.get("improve", ["tidy up"]))
        ph, tg = whole_obj(g, "improve_obj")
        return Req([T(v), X(ph)], "command", dict({"action": "improve"}, **tg), ["act:improve", f"verb:improve={v}"], folder="ops")
    if k == "respace":
        v = g.pick("verb:respace", VERBS.get("respace", ["compact"]))
        ph, tg = whole_obj(g, "respace_obj")
        return Req([T(v), X(ph)], "command", dict({"action": "respace", "comparison": "smaller"}, **tg), ["act:respace", f"verb:respace={v}"], folder="ops")
    if k == "snap":
        ph, tg = g.pick("snap_obj", [(" everything", "all"), (" the shapes", "all"), ("", None)], [3, 1, 1])
        ch = [T("snap"), X(ph + " to the grid")]
        return Req(ch, "command", dict({"action": "snap"}, **({"target": mention(quantifier="all")} if tg else {})), ["act:snap", "verb:snap=snap"], folder="ops")
    if k == "flip":
        v = g.pick("verb:flip", VERBS.get("flip", ["flip"]))
        ph, tg = whole_obj(g, "flip_obj")
        ax = g.pick("flip_axis", ["", " horizontally", " vertically", " upside down", " left to right"])
        args = dict({"action": "flip"}, **tg)
        if ax.strip() in ("vertically", "upside down"): args["axis"] = "vertical"
        elif ax.strip() in ("horizontally", "left to right"): args["axis"] = "horizontal"
        return Req([T(v), X(ph + ax)], "command", args, ["act:flip", f"verb:flip={v}", f"flip_axis:{ax.strip() or 'none'}"], folder="ops")
    if k == "reverse":
        v = g.pick("verb:reverse", VERBS.get("reverse", ["reverse"]))
        if g.coin(0.4): return Req([T(v), X(" " + g.ch(["all the arrows", "every arrow", "all arrows", "all the lines"]))], "command", {"action": "reverse", "quantifier": "all"}, ["act:reverse", f"verb:reverse={v}", "reverse:all"], folder="ops")
        a = m.name(); b = m.name(avoid=[a]); noun = g.pick("rev_noun", ["arrow", "line", "link", "connection"])
        return Req([T(v), X(f" the {noun} from "), N(a), X(" to "), N(b)], "command", {"action": "reverse", "from": a, "to": b}, ["act:reverse", f"verb:reverse={v}", "reverse:ends"], folder="ops")
    if k == "sort":
        v = g.pick("verb:sort", [x for x in VERBS.get("sort", ["sort"])])
        obj = g.ch(["", " everything", " the shapes"]); tg = {"target": mention(quantifier="all")} if obj else {}   # "everything" / "the shapes": every shape (convention)
        if v.startswith("alphabeti"): return Req([T(v), X(obj)], "command", dict({"action": "sort", "property": "name"}, **tg), ["act:sort", f"verb:sort={v}"], folder="ops")
        prop, pw = g.pick("sort_by", [("name", "name"), ("size", "size"), ("color", "colour"), ("color", "color"), ("shape", "shape"), ("label", "label")])
        obj = obj or " them"; tg = {"target": mention(quantifier="all")} if obj != " them" else {}
        return Req([T(v), X(f"{obj} by {pw}")], "command", dict({"action": "sort", "property": prop}, **tg), ["act:sort", f"verb:sort={v}", f"sort_by:{pw}"], folder="ops")
    if k == "equalize":
        v = g.pick("verb:equalize", VERBS.get("equalize", ["equalize"]))
        prop, pw = g.pick("eq_prop", [("size", "sizes"), ("color", "colours"), ("color", "colors")])   # "equalize the shapes" is ambiguous (kind or every shape): not written
        return Req([T(v), X(f" the {pw}")], "command", {"action": "equalize", "property": prop}, ["act:equalize", f"verb:equalize={v}"], folder="ops")
    if k == "straighten":
        return Req([T("straighten"), X(" the " + g.ch(["arrows", "lines", "links", "connections"]))], "command", {"action": "straighten"}, ["act:straighten", "verb:straighten=straighten"], folder="ops")
    if k == "untangle":
        v = g.pick("verb:untangle", VERBS.get("untangle", ["untangle"]))
        return Req([T(v), X(" the " + g.ch(["arrows", "lines", "links", "connections"]))], "command", {"action": "untangle"}, ["act:untangle", f"verb:untangle={v}"], folder="ops")
    if k == "fit":
        v = g.pick("verb:fit", VERBS.get("fit", ["fit"]))
        if v == "fit": return Req([T("fit"), X(" everything on the canvas")], "command", {"action": "fit", "target": mention(quantifier="all")}, ["act:fit", "verb:fit=fit"], folder="ops")
        return Req([T(v), X(g.ch([" the diagram", " everything"]))], "command", {"action": "fit", "position": "center", "target": mention(quantifier="all")}, ["act:fit", f"verb:fit={v}"], folder="ops")
    if k == "layout":
        lay = g.pick("relayout_lay", ["tree", "layers", "radial", "organic"])
        cue = g.pick(f"layout:{lay}", [c for c in LEG["layout"]["values"][lay] if " " not in c] or [lay])
        v = g.pick("verb:arrange_ops", ["arrange", "lay out", "rearrange", "organize", "reorganize"])
        ph, tg = g.pick("relayout_obj", [(" everything", "all"), (" the diagram", "all"), (" the whole diagram", "all"), ("", None)])
        how = {"tree": [" as a tree", " as a hierarchy"], "layers": [" in layers", " as a flowchart", " in tiers"], "radial": [" radially", " as a radial layout"], "organic": [" organically", " as an organic layout"]}[lay]
        hw = g.pick(f"relayout_how:{lay}", how)
        return Req([T(v), X(ph + hw)], "command", dict({"action": "arrange", "layout": lay}, **({"target": mention(quantifier="all")} if tg else {})), ["act:arrange", f"layout:{lay}={hw.strip()}"], folder="ops")
    # align by an edge
    ns = m.names(3); edge, d = g.pick("align_edge", [("left edges", "left"), ("right edges", "right"), ("tops", "up"), ("bottoms", "down")])
    return Req([T(g.ch(["align", "line up"])), X(f" the {edge} of ")] + names_list(g, ns, " and "), "command", {"action": "align", "direction": d, "target": ",".join(ns)}, ["act:align", f"align_edge:{edge}"], folder="ops")

def o_restyle(g, m):
    """an existing arrow restyled: by its ends (set from= to=), or every arrow (set kind=edge quantifier=all); thicker / thinner: resize"""
    noun = g.pick("restyle_noun", ["arrow", "line", "link", "connection"])
    a = m.name(); b = m.name(avoid=[a])
    every = g.coin(0.35)
    ref = [X(f"all the {noun}s")] if every else [X(f"the {noun} from "), N(a), X(" to "), N(b)]
    ends = {"kind": "edge", "quantifier": "all"} if every else {"from": a, "to": b}
    k = g.pick("restyle_kind", ["style", "color", "arrow", "size", "thicker"])
    if k == "style":
        st = g.pick("restyle_style", ["dashed", "dotted", "solid"])
        return Req([T("make"), X(" ")] + ref + [X(" " + st)], "command", dict({"action": "set", "style": st}, **ends), ["act:set", f"restyle:style={st}"], folder="ops")
    if k == "color":
        c = color_w(g)
        return Req([T("make"), X(" ")] + ref + [X(" "), C(c[0])], "command", dict({"action": "set", "color": c[1]}, **ends), ["act:set", "restyle:color"] + c[2], folder="ops")
    if k == "arrow":
        aw, av = g.pick("restyle_arrow", [("two-way", "both"), ("bidirectional", "both"), ("double-headed", "both")])
        return Req([T("make"), X(" ")] + ref + [X(" " + aw)], "command", dict({"action": "set", "arrow": av}, **ends), ["act:set", f"restyle:arrow={aw}"], folder="ops")
    if k == "size":
        sw, sv = g.pick("restyle_size", [("thick", "large"), ("thin", "small"), ("bold", "large")])
        return Req([T("make"), X(" ")] + ref + [X(" " + sw)], "command", dict({"action": "set", "size": sv}, **ends), ["act:set", f"restyle:size={sw}"], folder="ops")
    cw = g.pick("restyle_comp", ["thicker", "thinner"])
    return Req([T("make"), X(" ")] + ref + [X(" " + cw)], "command", dict({"action": "resize"}, **ends), ["act:resize", f"restyle:{cw}"], folder="ops")

# ---------------------------------------------------------------------------------------------------------------------------------
# EXT (synth_rules_ext): the forms of 39be436 (LEGEND_EXT.md): free text (create shape=text), templates (create / arrange template=…),
# help questions (question ask=help topic aspect about). Gold by the proposed conventions of LEGEND_EXT.md section 7.
# Not covered: width / height / fill / layer (the Rules do not read them from a sentence; only the engine and templates set them).
# ---------------------------------------------------------------------------------------------------------------------------------
TEXT_NOUNS = ["text", "title", "heading", "headline", "caption", "subtitle", "banner", "note"]
TEXT_PLACES = [("", None), (" at the top", "top"), (" at the bottom", "bottom"), (" in the top left", "topLeft"), (" in the bottom right", "bottomRight"), (" in the middle", "center"),
               (" in the top right", "topRight"), (" at the bottom left", "bottomLeft")]
TEXT_LABELS = ["Q3 plan", "Draft", "Order flow", "Team map", "v2", "Week 1", "Read me", "Ideas wall", "Budget 2027", "Notes", "Overview", "Main flow", "Do not edit", "Legend"]
def e_text(g, m):
    lab = g.pick("text_label", TEXT_LABELS); pl, pv = g.pick("text_place", TEXT_PLACES)
    args = {"action": "create", "shape": "text", "label": lab}
    if pv: args["position"] = pv
    k = g.pick("text_frame", ["add_noun", "write", "title", "colour"])
    if k == "add_noun":
        v = g.pick("text_verb", ["add", "put", "place", "insert", "write"]); tn = g.pick("text_noun", TEXT_NOUNS)
        ch = [T(v), X(f" {art(tn)} {tn} \"{lab}\"{pl}")]; tags = [f"text:{v} a {tn}"]
    elif k == "write":
        ch = [T("write"), X(f" \"{lab}\"{pl}")]; tags = ["text:write"]
    elif k == "title":
        ch = [T("title"), X(f" the diagram \"{lab}\"")]; tags = ["text:title the diagram"]; args.pop("position", None)
    else:
        c = color_w(g); tn = g.pick("text_noun", TEXT_NOUNS)
        ch = [T("add"), X(f" {art(c[0])} "), C(c[0]), X(f" {tn} \"{lab}\"{pl}")]; args["color"] = c[1]; tags = ["text:colour"] + c[2]
    return Req(ch, "command", args, ["act:create", "shape:text"] + tags, folder="ext")

ITEM_WORDS = ["Plan", "Build", "Test", "Launch", "Research", "Design", "Review", "Ship", "Idea", "Draft", "Edit", "Publish", "Morning", "Noon", "Evening",
              "Awareness", "Interest", "Decision", "Action", "Basics", "Practice", "Mastery", "Kickoff", "Pilot", "Rollout", "Feedback", "Spring", "Summer",
              "Autumn", "Winter", "Sales", "Support", "Product", "Finance", "Hiring", "Training", "Growth", "Safety", "Quality", "Speed"]
TPL = LEG.get("template", {}).get("values", {})
def tpl_cue(g, v):
    cues = [v] + TPL[v]   # every cue, also the multi-word ones ("hierarchy of needs", "pros and cons"); the Rules filter what they do not read
    return g.pick(f"template:{v}", cues)
def e_template(g, m):
    v = g.pick("val:template", list(TPL)); cue = tpl_cue(g, v)
    n = g.ch([3, 3, 4, 4, 5]); items = g.r.sample(ITEM_WORDS, n)
    il = ", ".join(items[:-1]) + " and " + items[-1]
    vb = g.pick("tpl_verb", ["draw", "make", "create", "build", "add", "sketch"])
    args = {"action": "create", "template": v}
    k = g.pick("tpl_frame", ["of", "colon", "titled", "scheme", "count", "arrange", "place"])
    if k == "arrange" and re.search(r"\b(?:tree|hierarchy|org chart|organigram|flow|flowchart|layers|levels|spokes|mind map|radial|sunburst)\b", cue): k = "of"   # a re-layout by the links (ops patch), not the template
    if k == "count":
        c = g.ch([3, 4, 5, 6]); ch = [T(vb), X(f" {art(str(c))} {c}-step {cue}")]; args["count"] = str(c)
        return Req(ch, "command", args, ["act:create", f"tpl:{v}={cue}", "tpl:count"], folder="ext")
    if k == "arrange":
        ns = m.names(g.ch([3, 4])); av = g.pick("tpl_arr_verb", ["arrange", "lay out", "organize"])
        ch = [T(av), X(" ")] + names_list(g, ns, " and ") + [X(f" as {art(cue)} {cue}")]
        return Req(ch, "command", {"action": "arrange", "template": v, "target": ",".join(ns)}, ["act:arrange", f"tpl:{v}={cue}", "tpl:arrange"], folder="ext")
    args["items"] = ",".join(items)
    if k == "colon": ch = [T(vb), X(f" {art(cue)} {cue}: {il}")]
    elif k == "titled":
        t = g.ch(["Our year", "Plan B", "Next steps", "The roadmap", "Team values"]); ch = [T(vb), X(f" {art(cue)} {cue} titled \"{t}\" of {il}")]; args["title"] = t
    elif k == "scheme":
        sv = g.pick("val:scheme", list(LEG["scheme"]["values"])); sc = g.pick(f"scheme:{sv}", [sv] + [c for c in LEG["scheme"]["values"][sv] if "colo" not in c])
        ch = [T(vb), X(f" {art(cue)} {cue} of {il} in {sc} colours")]; args["scheme"] = sv
    elif k == "place":
        pw, pv = g.pick("tpl_place", [(" in the top left", "topLeft"), (" in the bottom right", "bottomRight"), (" at the top", "top"), (" in the middle", "center")])
        ch = [T(vb), X(f" {art(cue)} {cue}{pw} of {il}")]; args["position"] = pv
    else: ch = [T(vb), X(f" {art(cue)} {cue} of {il}")]
    return Req(ch, "command", args, ["act:create", f"tpl:{v}={cue}", f"tpl_frame:{k}"], folder="ext")

TOPIC = LEG.get("topic", {}).get("values", {})
GENERIC_VERBS = {"add", "make", "put", "draw", "create", "set", "change", "give", "place", "insert", "build", "turn", "stick", "pop", "throw", "spawn", "sketch", "write", "call",
                 "tie", "hook", "attach", "cut", "separate", "fill", "push", "drop", "clear", "scale", "title", "tag", "send", "bring", "space", "line up", "transform", "convert",
                 "reset", "trade", "exchange", "park", "tuck", "dissolve", "split up", "break up", "stamp", "color", "colour", "tidy"}
FAMILY = {"connections": "arrows", "groups": "groups", "text": "titles", "color": "colours", "size": "sizes", "position": "positions", "style": "styles",
          "template": "templates", "layout": "layouts", "rules": "rules", "outline": "outlines", "fill": "fills", "layer": "backgrounds"}
def help_phrases():
    """topic -> (verb phrase for how/can, noun phrase for overview/example) the Rules map to that topic"""
    out = {}
    for a, cues in VERBS.items():
        if a not in TOPIC: continue
        sp = [c for c in [a] + cues if c not in GENERIC_VERBS and c.isalpha() and c.islower()]
        if sp: out[a] = (f"{sp[0]} shapes" if a not in ("undo", "redo", "forget") else sp[0], None)
    for v in TPL:
        if v in TOPIC: out[v] = (f"make {art(v)} {v}", f"{art(v)} {v}")
    for t, w in FAMILY.items():
        if t in TOPIC: out[t] = (None, w)
    for key in ("shape", "color", "style"):
        for v in LEG[key]["values"]:
            if v in TOPIC and v not in out and v not in ("any", "text", "solid"): out[v] = ("use " + (v + "s" if key == "shape" else v), None)   # a value: "can I use stars"
    return out
HELP_PH = help_phrases()
HELP_ABOUT = ["images", "photos", "emojis", "fonts", "shadows", "animations", "comments", "videos"]
def e_help(g, m):
    k = g.pick("help_kind", ["topic", "topic", "topic", "topic", "about", "bare"])
    if k == "bare":
        p = g.pick("help_bare", ["help", "what can you do", "help me"])
        return Req([T(p)], "question", {"ask": "help"}, ["act:help", f"help:bare={p}"], question=True, folder="ext")
    if k == "about":
        w = g.pick("help_about", HELP_ABOUT); lead = g.pick("help_about_lead", ["can I add", "is it possible to add"])
        return Req([T(lead), X(f" {w}")], "question", {"ask": "help", "aspect": "can", "about": w}, ["act:help", "help:about"], question=True, folder="ext")
    t = g.pick("help_topic", list(HELP_PH)); vp, np_ = HELP_PH[t]
    leads = ([("how do I", "how"), ("how can I", "how"), ("how to", "how"), ("can I", "can"), ("is it possible to", "can")] if vp else []) + \
            ([("tell me about", "overview"), ("help with", "overview"), ("show me an example of", "example")] if np_ else [])
    lead, asp = g.pick(f"help_lead", leads)
    ph = vp if asp in ("how", "can") else np_
    return Req([T(lead), X(f" {ph}")], "question", {"ask": "help", "topic": t, "aspect": asp}, ["act:help", f"help:topic={t}", f"help:lead={lead}"], question=True, folder="ext")

# ---------------------------------------------------------------------------------------------------------------------------------
# the mix (requests): roughly how often people use each, every one present
# ---------------------------------------------------------------------------------------------------------------------------------
CORE = [(r_create, 13), (r_create_verbless, 1), (r_delete, 6), (r_clear, 0.8), (r_move, 10), (r_move_verbless, 1.5), (r_set, 12), (r_resize, 3), (r_rename, 2.5),
        (r_label, 3), (r_duplicate, 2.5), (r_swap, 2), (r_connect, 11), (r_disconnect, 3), (r_align, 2), (r_distribute, 2), (r_arrange, 2.5), (r_whole, 3), (r_front_back, 3),
        (r_history, 4), (q_count, 3.5), (q_exists, 2.5), (q_list, 3), (q_property, 3.5), (q_describe, 1.5), (q_neighbors, 1.5), (q_connected, 1.5), (q_degree, 1.2),
        (q_path, 1.5), (q_reachable, 1.2), (q_simple, 3), (q_check, 4), (q_extreme, 4.5), (q_nearest, 2), (r_fact, 3), (r_rule, 2.5)]
OPS = [(o_group, 3), (o_add_to_group, 1), (o_ungroup, 2), (o_group_q, 3), (o_group_target, 2.5), (o_double, 4), (o_outline, 2.5), (o_coords, 2), (o_linked, 2), (o_disc_all, 1),
       (o_edge_label, 4), (o_unlabel, 2), (o_create_layout, 2.5), (o_relayout, 6), (o_restyle, 3)]
EXT = [(e_text, 3), (e_template, 6), (e_help, 5)]

# ---------------------------------------------------------------------------------------------------------------------------------
# a follow-up that refers back: a pronoun, "that one", the created shape's name
# ---------------------------------------------------------------------------------------------------------------------------------
def followup(g, m, prev):
    """a second request whose target is what `prev` made or touched -> Req or None"""
    single = prev.last; plural = prev.group
    if not single and not plural: return None
    if single and (not plural or g.coin(0.7)):
        if single == "$new" and prev.creates and g.coin(0.4): ref_ch, gold = [N(prev.creates)], "$new"; ftag = "ref:created name"
        else:
            w = g.pick("pron", ["it", "it", "it", "that one", "this one", "the same one"]); ref_ch, gold = [X(w)], single; ftag = f"ref:{w}"
    else:
        w = g.pick("pronpl", ["them", "them", "all of them"]); ref_ch, gold = [X(w)], plural; ftag = f"ref:{w}"
        if w == "all of them": ref_ch = [X("them")]
    k = g.pick("fu_kind", ["set", "move", "connect", "label", "delete", "resize", "toFront", "property"] if ftag != "ref:them" else ["set", "move", "delete", "arrange"])
    if k == "set":
        c = color_w(g); v = g.pick("fu_setv", ["make", "paint", "turn", "color"])
        return Req([T(v), X(" ")] + ref_ch + [X(" "), C(c[0])], "command", {"action": "set", "target": gold, "color": c[1]}, ["act:set", ftag] + c[2])
    if k == "move":
        if g.coin(0.5):
            d = g.pick("val:direction", list(DIRW)); dw = g.pick(f"direction:{d}", DIRW[d])
            return Req([T(g.ch(["move", "shift", "nudge"])), X(" ")] + ref_ch + [X(" "), C(dw)], "command", {"action": "move", "target": gold, "direction": d}, ["act:move", ftag])
        o = m.name(); rel = g.pick("val:position", list(REL)); cue = g.pick(f"position:{rel}", REL[rel])
        return Req([T("move"), X(" ")] + ref_ch + [X(f" {cue} "), N(o)], "command", {"action": "move", "target": gold, "position": rel, "anchor": o}, ["act:move", ftag, f"position:{rel}={cue}"])
    if k == "connect":
        if gold != "$new" or ftag.startswith("ref:them"): return None
        o = m.name(); v = g.pick("verb:connect", VERBS["connect"])
        return Req([T(v), X(" ")] + ref_ch + [X(" to "), N(o)], "command", {"action": "connect", "from": gold, "to": o}, ["act:connect", ftag])
    if k == "label":
        lab = g.ch(LABELS); return Req([T("label"), X(" ")] + ref_ch + [X(f' "{lab}"')], "command", {"action": "label", "target": gold, "label": lab}, ["act:label", ftag])
    if k == "delete": return Req([T(g.ch(["delete", "remove"])), X(" ")] + ref_ch, "command", {"action": "delete", "target": gold}, ["act:delete", ftag])
    if k == "resize": return Req([T(g.ch(["enlarge", "shrink"])), X(" ")] + ref_ch, "command", {"action": "resize", "target": gold}, ["act:resize", ftag])
    if k == "toFront": return Req([T("bring"), X(" ")] + ref_ch + [X(" to the front")], "command", {"action": "toFront", "target": gold}, ["act:toFront", ftag])
    if k == "arrange":
        lay = g.pick("val:layout", list(LAYOUT)); lw = LAYOUT[lay][0]
        return Req([T("arrange"), X(" ")] + ref_ch + [X(" " + lw)], "command", {"action": "arrange", "target": gold, "layout": lay}, ["act:arrange", ftag])
    if ref_ch[0][1] in ("this one", "that one", "the same one"): return None
    return Req([X("where is "), ] + ref_ch, "question", {"ask": "property", "target": gold, "property": "position"}, ["act:property", ftag], question=True) if False else Req([T("what color"), X(" is ")] + ref_ch, "question", {"ask": "property", "target": gold, "property": "color"}, ["act:property", ftag], question=True)

def ellipsis(g, m):
    """verb ellipsis: 'make A red, B blue and C green' / 'put A left of B and C above B' / 'connect A to B, then C to D': one wire and span per clause"""
    k = g.pick("ellipsis", ["set", "move", "connect"], [3, 2, 1.5])
    reqs = []
    if k == "set":
        v = g.pick("ell_setv", ["make", "paint", "turn", "color", "colour", "set"])
        ns = m.names(g.ch([2, 3])); kind = g.ch(["color", "color", "size"])
        for i, n in enumerate(ns):
            if kind == "color": c = color_w(g); val = [C(c[0])]; a = {"color": c[1]}; t = c[2]
            else: z = size_w(g); val = [C(z[0])]; a = {"size": z[1]}; t = z[2]
            if v == "set": val = [X("to ")] + val
            ch = ([T(v), X(" "), N(n)] if i == 0 else [N(n)]) + [X(" ")] + val
            if i > 0: ch[0] = ("t", ch[0][1])
            reqs.append(Req(ch, "command", dict(action="set", target=n, **a), ["act:set", "ellipsis:set"] + t))
    elif k == "move":
        v = g.pick("ell_movev", ["put", "move", "place", "shift"])
        base = m.name(); ns = m.names(2, avoid=[base])
        for i, n in enumerate(ns):
            rel = g.pick("val:position", list(REL)[:4]); cue = g.pick(f"position:{rel}", REL[rel])
            ch = ([T(v), X(" "), N(n), X(" "), C(cue)] if i == 0 else [N(n), X(" "), T(cue)]) + [X(" "), N(base)]
            reqs.append(Req(ch, "command", {"action": "move", "target": n, "position": rel, "anchor": base}, ["act:move", "ellipsis:move", f"position:{rel}={cue}"]))
    else:
        v = g.pick("verb:connect", ["connect", "link", "join", "hook"])
        a, b, c, d = m.names(4)
        reqs.append(Req([T(v), X(" "), N(a), X(" to "), N(b)], "command", {"action": "connect", "from": a, "to": b}, ["act:connect", "ellipsis:connect"]))
        reqs.append(Req([T(c + " to"), X(" "), N(d)], "command", {"action": "connect", "from": c, "to": d}, ["act:connect", "ellipsis:connect"]))
        # the trigger of an elided connect: the leading name + "to" (LABEL_CONVENTIONS.md: "Core to" 21 of 33)
        reqs[-1].chunks = [("t", c + " to"), X(" "), N(d)]
        return reqs, ", then "
    return reqs, None

def multi_objects(g, m):
    """'add a red circle and a blue square': one clause per created object (CREATE_START / OBJ_SPLIT, logic.js 1310-1311, 1362)"""
    v = g.pick("multiobj_v", ["draw", "add", "create", "insert", "sketch", "place", "put", "make"])
    reqs = []
    for i in range(g.ch([2, 2, 3])):
        c = color_w(g) if g.coin(0.6) else None; s = shape_w(g)
        first = c[0] if c else s[0]; a = art(first)
        ch = ([T(v), X(" " + a + " ")] if i == 0 else [T(a), X(" ")]) + ([C(c[0]), X(" ")] if c else []) + [C(s[0])]
        args = {"action": "create", "shape": s[1]}
        if c: args["color"] = c[1]
        reqs.append(Req(ch, "command", args, ["act:create", "construction:one clause per object"] + s[2] + (c[2] if c else [])))
    return reqs, None

# ---------------------------------------------------------------------------------------------------------------------------------
# surface variation: polite openers / closers, capitalisation, punctuation, typos
# ---------------------------------------------------------------------------------------------------------------------------------
OPEN_CMD = ["please ", "Please ", "could you ", "can you ", "would you ", "will you ", "kindly ", "now ", "ok ", "okay ", "ok so ", "so ", "hey ", "hey, ", "next ", "also ",
            "go ahead and ", "let's ", "lets ", "I want you to ", "i want you to ", "I'd like you to ", "I would like you to ", "now please "]
OPEN_Q = ["so ", "ok ", "okay ", "hey ", "hey, ", "ok so ", "also ", "now "]
CLOSE_CMD = [" please", ", please", " thanks", ", thanks", " thank you", " pls"]
LETTERS = "abcdefghijklmnopqrstuvwxyz"
NEAR = {c: n for c, n in zip("qwertyuiopasdfghjklzxcvbnm", "wqrtyuiopoassdfghjklkzxcvbnmn")}

def typo(g, word):
    if len(word) < 5 or not word.isalpha(): return None
    i = g.r.randrange(1, len(word) - 2)
    op = g.ch(["swap", "drop", "near"])
    if op == "swap": w = word[:i] + word[i + 1] + word[i] + word[i + 2:]
    elif op == "drop": w = word[:i] + word[i + 1:]
    else: w = word[:i] + NEAR.get(word[i].lower(), word[i]) + word[i + 1:]
    return w if w.lower() != word.lower() else None

def build(g, m, reqs, joiners):
    """reqs (in order) + joiners -> text, wires; surface variation applied"""
    msg_tags = []
    for r in reqs: r.chunks = [list(c) for c in r.chunks if c[1] != ""]
    # one typo in about 6% of messages: in a trigger or cue word or a name
    if g.coin(0.06):
        cands = [(ri, ci) for ri, r in enumerate(reqs) for ci, c in enumerate(r.chunks) if c[0] in ("t", "c", "n") and " " not in c[1] and len(c[1]) >= 5 and c[1].isalpha()
                 and (c[0] == "n" or c[1].lower() in TYPO_OK) and (c[0] == "n" or c[1][0].islower())]
        if cands:
            ri, ci = g.ch(cands); w = typo(g, reqs[ri].chunks[ci][1])
            if w: reqs[ri].chunks[ci][1] = w; msg_tags.append("typo")
    texts, pieces = [], []
    q_end = []
    for i, r in enumerate(reqs):
        lead = ""
        if i == 0:
            if r.question and g.coin(0.12): lead = g.pick("openq", OPEN_Q); msg_tags.append("opener")
            elif not r.question and g.coin(0.22) and r.chunks[0][0] == "t": lead = g.pick("openc", OPEN_CMD); msg_tags.append("opener")
        else: lead = joiners[i - 1]
        # capitalise the first letter of the message, or after a sentence end
        cap = (i == 0 and not lead and g.coin(0.4)) or (lead.endswith((". ", "? ", "! ")) and g.coin(0.75))
        if cap: r.chunks[0][1] = r.chunks[0][1][0].upper() + r.chunks[0][1][1:]
        if i == 0 and lead and g.coin(0.4): lead = lead[0].upper() + lead[1:]
        pieces.append(lead); pieces.append(r)
    out = ""; wires = []
    for k, p in enumerate(pieces):
        if isinstance(p, str): out += p; continue
        s0 = len(out); out += p.text
        trig = p.trigger
        wires.append({"span": p.text, "trigger": trig, "type": p.type, "args": {k2: v for k2, v in p.args.items()}})
        nxt = pieces[k + 1] if k + 1 < len(pieces) else None
        if nxt is None:
            if p.question: out += "?" if g.coin(0.75) else ""
            else:
                if not p.question and g.coin(0.1): out += g.pick("closec", CLOSE_CMD); msg_tags.append("closer")
                out += g.ch(["", "", "", ".", "!"]) if not out.endswith(("please", "thanks", "pls", "you")) or g.coin(0.5) else ""
    return out, wires, msg_tags

def joiner(g, prev, nxt):
    if prev.verbless or prev.sentence or nxt.sentence:   # a verbless clause would be merged into the next; a fact / rule is its own sentence
        return g.ch([". ", ". ", "! "]) if not prev.question else "? "
    if prev.question or nxt.question:
        if prev.question: return g.ch(["? ", "? ", "? "])
        return g.ch([". ", ". ", "! "])
    return g.pick("join", [" and ", ", then ", " then ", " and then ", ", and then ", ". ", "; ", ", after that ", ". Then ", ", finally "])

def make_message(g, idx, ops=False, ext=False):
    dom = g.ch(list(DOMAINS)) if not (ops or ext) else g.ch([d for d in DOMAINS if d != "letters"])
    m = Msg(g, dom)
    table = EXT if ext else OPS if ops else CORE
    fns, ws = zip(*table)
    nreq = 1 if ops and g.coin(0.85) else g.r.choices([1, 2, 3], [70, 22, 8])[0]
    reqs, joins = [], []
    if ext:   # one new-form request, alone (75%) or with an ordinary request before or after it
        r = g.r.choices(fns, ws)[0](g, m)
        reqs = [r]
        if g.coin(0.25):
            o = g.r.choices(*zip(*CORE))[0](g, m)
            while o.verbless: o = g.r.choices(*zip(*CORE))[0](g, m)
            reqs = [o, r] if g.coin(0.5) else [r, o]
            joins = [joiner(g, reqs[0], reqs[1]) if not reqs[1].question and not reqs[0].question else (". " if not reqs[0].question else "? ")]
    elif not ops and nreq > 1 and g.coin(0.18):
        reqs, j = (ellipsis if g.coin(0.6) else multi_objects)(g, m)
        joins = [j or g.ch([", ", " and "])] * (len(reqs) - 1)
        if len(reqs) == 3 and j is None: joins = [", ", " and "]
        if reqs and reqs[0].tags and "ellipsis:move" in reqs[0].tags: joins = [g.ch([" and ", ", "])] * (len(reqs) - 1)
    else:
        for i in range(nreq):
            r = None
            if i > 0 and g.coin(0.45): r = followup(g, m, reqs[-1])
            while r is None or (i > 0 and r.verbless):   # a verbless clause after another request takes the earlier verb (logic.js 1359): only first
                r = g.r.choices(fns, ws)[0](g, m)
            if i > 0: joins.append(joiner(g, reqs[-1], r))
            reqs.append(r)
    text, wires, mtags = build(g, m, reqs, joins)
    # `names`: the canvas: the names the message mentions that are not created by it, plus 0-3 others of the domain
    used = [n for n in m.used if n not in m.created]
    groups = getattr(m, "groups", {})
    for gn, mem in groups.items():
        for x in mem:
            if x not in used: used.append(x)
    used = [n for n in used if n not in groups]
    others = [n for n in m.pool if n not in used and n not in m.created and n not in groups]
    canvas = used + g.r.sample(others, min(len(others), g.ch([0, 1, 2, 3])))
    g.r.shuffle(canvas)
    row = {"id": f"{'se' if ext else 'so' if ops else 'sr'}-{idx:05d}", "domain": dom, "names": canvas}
    if ops: row["groups"] = {k: v for k, v in groups.items()}
    row.update({"text": text, "wires": wires})
    tags = sorted({t for r in reqs for t in r.tags} | set(mtags) | {f"requests:{len(reqs)}"})
    return row, tags

# ---------------------------------------------------------------------------------------------------------------------------------
# COMBOS (owner, 2026-11-02 22:14): 2-5 requests in one message, joined the way people write, with references back; raw, for proofreading
# by Haiku agents (BRIEF_HAIKU.md) and validate_combo.py. Written to llm_train/synth_combo_raw/raw_NN.jsonl (not msg_*: not training data).
# ---------------------------------------------------------------------------------------------------------------------------------
# text that is not a request: each checked to give no wire in the Rules (between two requests)
CHATTER_OPEN = ["Ok so I'm sketching our office network.", "This is for tomorrow's review.", "I'm explaining this to my team later.", "We are planning the next sprint.",
                "I'm drawing the family tree for grandma.", "Hmm, let me think.", "Let me see.", "My manager asked for this."]
CHATTER_MID = ["That way it is easier to read.", "It was getting crowded.", "We need it for the meeting.", "I keep losing track of things.", "Sorry, long day.",
               "That's the main flow.", "Right, that's better.", "Because the old one was wrong.", "It should read better now.", "Ugh, messy.", "Almost done.",
               "Just tidying things up a bit."]
CHATTER_END = ["Thanks!", "Perfect.", "Nice.", "Almost done.", "Thanks."]
COMBO_JOIN = [" and ", ", then ", " and then ", ". After that, ", ". Then ", ", and after that ", "; ", ". Also, ", ". Next, ", ". ", ", "]

def combo_ref(g, m, prev):
    """a reference back to what `prev` made or touched: (chunks, gold, tag) or None"""
    opts = []
    if prev.last: opts += ["it", "that one"]
    if prev.group and prev.group == "$new" or (prev.group and prev.group.startswith("mention(quantifier=all")): opts += ["them"]
    if prev.creates: opts += ["name"]
    made = getattr(prev, "made", None)
    if prev.last == "$new" and made and made[1]: opts += ["desc", "desc", "newone"]
    if not opts: return None
    k = g.pick("comboref", opts)
    if k == "it": return [("r", "it")], prev.last, "ref:it"
    if k == "that one": w = g.ch(["that one", "this one", "the same one"]); return [("r", w)], prev.last, f"ref:{w}"
    if k == "them": return [("r", "them")], prev.group, "ref:them"
    if k == "name": return [("n", prev.creates)], "$new", "ref:created name"
    if k == "newone":
        w = g.ch(["new", "newest", "last", "latest"]); return [X("the "), ("r", f"{w} one")], mention(recency="newest"), f"ref:the {w} one"
    col, sh = made
    sw = g.ch(SHAPE_SG[sh]); cw = g.ch(COLOR_CUES[col]) if col and g.coin(0.8) else None
    return [X("the "), ("r", (cw + " " if cw else "") + sw)], mention(color=col if cw else None, shape=sh), "ref:description of the shape made earlier"

def combo_followup(g, m, prev):
    ref = combo_ref(g, m, prev)
    if not ref: return None
    rc, gold, tag = ref
    plural = gold == prev.group and tag == "ref:them"
    k = g.pick("combo_fu", ["set", "move", "dir", "connect", "label", "resize", "toFront", "toBack", "property", "check", "duplicate", "rename"] if not plural else ["set", "move", "dir", "resize", "arrange", "align"])
    if k == "set":
        c = color_w(g); v = g.pick("fu_setv", ["make", "paint", "turn", "color"])
        return Req([T(v), X(" ")] + rc + [X(" "), C(c[0])], "command", {"action": "set", "target": gold, "color": c[1]}, ["act:set", tag] + c[2], last=gold if not plural else None, group=gold if plural else None)
    if k == "dir":
        d = g.pick("val:direction", list(DIRW)); dw = g.pick(f"direction:{d}", DIRW[d]); n = g.ch(NUMS_DIST)
        ch = [T(g.ch(["move", "shift", "nudge", "push"])), X(" ")] + rc + ([X(" "), C(dw)] if g.coin(0.5) else [X(f" {n} px "), C(dw)])
        args = {"action": "move", "target": gold, "direction": d}
        if "px" in "".join(c[1] for c in ch): args["distance"] = str(n)
        return Req(ch, "command", args, ["act:move", tag], last=gold if not plural else None, group=gold if plural else None)
    if k == "move":
        pc, pa, pt, _ = place(g, m, desc_p=0.0)
        return Req([T(g.ch(["move", "put", "drag"])), X(" ")] + rc + [X(" ")] + pc, "command", dict(action="move", target=gold, **pa), ["act:move", tag] + pt, last=gold if not plural else None, group=gold if plural else None)
    if k == "connect":
        o = m.name(); v = g.pick("verb:connect", ["connect", "link", "join", "hook"])
        return Req([T(v), X(" ")] + rc + [X(" to "), N(o)], "command", {"action": "connect", "from": gold, "to": o}, ["act:connect", tag])
    if k == "label":
        lab = g.ch(LABELS); v = g.ch(["write", "stamp", "inscribe"])
        return Req([T(v), X(f' "{lab}" on ')] + rc, "command", {"action": "label", "target": gold, "label": lab}, ["act:label", tag], last=gold)
    if k == "resize":
        v, fr = g.ch([("enlarge", "{v} {T}"), ("shrink", "{v} {T}"), ("make", "{v} {T} bigger"), ("make", "{v} {T} a bit smaller"), ("grow", "{v} {T}")])
        pre, post = fr.split("{T}")
        return Req([T(v), X(pre.replace("{v}", ""))] + rc + [X(post)], "command", {"action": "resize", "target": gold}, ["act:resize", tag], last=gold if not plural else None, group=gold if plural else None)
    if k in ("toFront", "toBack"):
        return Req([T("bring" if k == "toFront" else "send"), X(" ")] + rc + [X(" to the front" if k == "toFront" else " to the back")], "command", {"action": k, "target": gold}, [f"act:{k}", tag], last=gold)
    if k == "arrange":
        lay = g.pick("val:layout", list(LAYOUT)); lw = g.pick(f"layout:{lay}", LAYOUT[lay])
        return Req([T("arrange"), X(" ")] + rc + [X(" "), C(lw)], "command", {"action": "arrange", "target": gold, "layout": lay}, ["act:arrange", tag])
    if k == "align":
        ax = g.pick("val:axis", list(AXIS)); aw = g.pick(f"axis:{ax}", AXIS[ax])
        return Req([T("align"), X(" ")] + rc + [X(" "), C(aw)], "command", {"action": "align", "target": gold, "axis": ax}, ["act:align", tag])
    if k == "duplicate":
        n = g.ch([2, 3]); return Req([T(g.ch(["duplicate", "copy", "clone"])), X(" ")] + rc + [X(f" {n} times")], "command", {"action": "duplicate", "target": gold, "count": str(n)}, ["act:duplicate", tag])
    if k == "rename":
        if tag == "ref:created name": return None
        n = m.fresh(); m.created[n] = True
        return Req([T("rename"), X(" ")] + rc + [X(" to "), N(n)], "command", {"action": "rename", "target": gold, "name": n}, ["act:rename", tag])
    if k == "property":
        return Req([T("what color"), X(" is ")] + rc, "question", {"ask": "property", "target": gold, "property": "color"}, ["act:property", tag], question=True, last=gold)
    c = color_w(g)
    return Req([T("is"), X(" ")] + rc + [X(" "), C(c[0])], "question", {"ask": "check", "target": gold, "color": c[1]}, ["act:check", tag] + c[2], question=True, last=gold)

KEEP_WORDS = {"not", "twice", "bigger", "smaller", "larger", "double", "half", "dashed", "dash", "dotted", "two-way", "bidirectional", "double-headed", "plain",
              "undirected", "line", "lines", "arrow", "arrows", "edge", "link", "connection", "connector", "wire", "times", "copies", "copy", "evenly"}
def wire_keys(r):
    """the words a proofreader must keep for this request: its trigger, value and name words, references, numbers, quoted labels, "not" """
    keys = [c[1] for c in r.chunks if c[0] in ("t", "c", "n", "r")]
    xtext = "".join(c[1] if c[0] == "x" else " \0 " for c in r.chunks)   # the plain text of the request (a quoted label may span chunks)
    q = re.findall(r""""[^"]*"|“[^”]*”|(?<!\w)'[^']+'(?!\w)""", xtext); keys += q
    for x in q: xtext = xtext.replace(x, " ")
    for c in [["x", p] for p in xtext.split("\0")]:
        if True:
            rest = c[1]
            keys += re.findall(r"\b\d+\b", rest)
            keys += [p for p in ("two way", "two headed", "both ways", "without an arrow", "without arrows") if p in rest]
            keys += [w for w in re.findall(r"[A-Za-z]+(?:-[A-Za-z]+)*", rest) if w.lower() in KEEP_WORDS or w.lower() in TYPO_OK and w.lower() not in ("one", "ones", "shape", "shapes", "thing", "things")]
    out = []
    for k in keys:
        k = k.strip()
        if k and k not in out: out.append(k)
    return out

def make_combo(g, idx):
    dom = g.ch([d for d in DOMAINS if d != "letters"])
    m = Msg(g, dom)
    fns, ws = zip(*CORE)
    n = g.r.choices([2, 3, 4, 5], [35, 35, 20, 10])[0]
    reqs = []
    for i in range(n):
        r = None
        if i > 0 and g.coin(0.5): r = combo_followup(g, m, reqs[-1])
        while r is None or (i > 0 and r.verbless):
            r = g.r.choices(fns, ws)[0](g, m)
        reqs.append(r)
    for r in reqs: r.chunks = [list(c) for c in r.chunks if c[1] != ""]
    out, wires = "", []
    if g.coin(0.25): out = g.ch(CHATTER_OPEN) + " "
    for i, r in enumerate(reqs):
        if i:
            p = reqs[i - 1]
            if p.question: j = "? "
            elif p.verbless or p.sentence or r.sentence or r.question: j = g.ch([". ", ". ", "! "])
            else: j = g.pick("combojoin", COMBO_JOIN)
            if g.coin(0.15) and not p.question: j = j.rstrip() if j.strip() in (".", "!") else ". "; j = (j if j.endswith(" ") else j + " ") + g.ch(CHATTER_MID) + " "
            out += j
        cap = (not out) or out.endswith((". ", "? ", "! "))
        if cap and g.coin(0.7): r.chunks[0][1] = r.chunks[0][1][0].upper() + r.chunks[0][1][1:]
        out += r.text
        wires.append({"span": r.text, "trigger": r.trigger, "type": r.type, "args": dict(r.args), "keep": wire_keys(r)})
    out += "?" if reqs[-1].question else g.ch(["", ".", "!"])
    if g.coin(0.15) and not reqs[-1].question: out += (" " if out[-1] in ".!" else ". ") + g.ch(CHATTER_END)
    used = [x for x in m.used if x not in m.created]
    others = [x for x in m.pool if x not in used and x not in m.created]
    canvas = used + g.r.sample(others, min(len(others), g.ch([0, 1, 2, 3]))); g.r.shuffle(canvas)
    row = {"id": f"sc-{idx:05d}", "domain": dom, "names": canvas, "text": out, "wires": wires}
    return row, sorted({t for r in reqs for t in r.tags} | {f"requests:{n}"})

def write_combos(g, n, per_file):
    out = os.path.join(SK, "llm_train", "synth_combo_raw"); os.makedirs(out, exist_ok=True)
    for f in glob.glob(os.path.join(out, "raw_*.jsonl")): os.remove(f)
    rows, tags = [], {}
    for i in range(n):
        r, t = make_combo(g, i + 1); rows.append(r); tags[r["id"]] = t
    tmp_in, tmp_out = os.path.join(HERE, ".combo.jsonl"), os.path.join(HERE, ".combo_v.jsonl")
    with open(tmp_in, "w") as f:
        for r in rows: f.write(json.dumps(r, ensure_ascii=False) + "\n")
    subprocess.run(["node", os.path.join(HERE, "check_rules.mjs"), tmp_in, tmp_out], check=True)
    V = {v["id"]: v for v in (json.loads(l) for l in open(tmp_out) if l.strip())}
    os.remove(tmp_in); os.remove(tmp_out)
    for r in rows: r["rules_raw"] = "ok" if V[r["id"]]["ok"] else V[r["id"]]["cause"]
    for k in range(0, len(rows), per_file):
        with open(os.path.join(out, f"raw_{k // per_file + 1:02d}.jsonl"), "w") as f:
            for r in rows[k:k + per_file]: f.write(json.dumps(r, ensure_ascii=False) + "\n")
    acts, nreq, ok = collections.Counter(), collections.Counter(), sum(1 for r in rows if r["rules_raw"] == "ok")
    for r in rows:
        nreq[len(r["wires"])] += 1
        for w in r["wires"]: acts[act_of(w["type"], w["args"])] += 1
    refs = collections.Counter(t for ts in tags.values() for t in ts if t.startswith("ref:"))
    json.dump({"messages": len(rows), "files": math.ceil(len(rows) / per_file), "requests_per_message": dict(sorted(nreq.items())), "raw_read_exactly_by_rules": ok,
               "requests_per_act": dict(sorted(acts.items())), "references_back": dict(refs.most_common())}, open(os.path.join(out, "raw_stats.json"), "w"), indent=1)
    print(f"combos: {len(rows)} raw messages in {out} ({ok} read exactly by the Rules before proofreading)")

# ---------------------------------------------------------------------------------------------------------------------------------
# overlap with the test sets
# ---------------------------------------------------------------------------------------------------------------------------------
def norm(t): return re.sub(r"\s+", " ", re.sub(r"[^\w\s']", " ", t.lower())).strip()
def test_texts():
    T = {}
    for s in ["hand", "blind", "broad", "seen", "new_identities", "heldout_formulations"]:
        T[s] = [r["text"] for r in json.load(open(os.path.join(REPO, "docs", "bench", s + ".json")))]
    for name, pat in [("llm_short", "llm_train/*_short/msg_*.jsonl"), ("fresh2", "llm_bench/fresh2/opus_*/batch_*.jsonl"),
                      ("short3", "llm_bench/short3/batch_*.jsonl"), ("short3_texts", "llm_bench/short3/texts/texts_*.jsonl"),   # short3: a new blind set (2026-11-02)
                      ("collected", "llm_bench/collected_*/batch_*.jsonl"), ("collected_texts", "llm_bench/collected_*/texts/texts_*.jsonl")]:   # real users' messages (2026-11-03)
        T[name] = [json.loads(l)["text"] for f in sorted(glob.glob(os.path.join(SK, pat))) for l in open(f) if l.strip()]
    return T

# why a candidate was rejected: the first class that explains it (C = the gold follows LABEL_CONVENTIONS.md / the training majority and the
# Rules write it otherwise; R = a construction or word the Rules do not read as the conventions do; G = left to the generator)
def classify(r, tg, v):
    c, t, low = v["cause"] or "", r["text"], r["text"].lower()
    T = set(tg)
    if "connect:pair_and" in T and "from" in c: return "C connect A and B: gold from=A,B (training majority); Rules from=A to=B"
    if "connect:many_one" in T and ("from" in c or "to" in c): return "C several to one (A and B to C): gold one connect from=A,B; Rules from=A to=B (C lost)"
    if "rules miss target" in c and re.search(r"\b(all|them all|all of them|the whole diagram|the diagram)\b", low): return "R 'all' / 'them all' / 'the (whole) diagram' as the object is not read as all shapes ('all' only at the end of a clause)"
    if "axis=horizontal" in c: return "C no axis word: gold no axis; Rules axis=horizontal (default)"
    if "undo: rules add count" in c: return "C undo twice / 3 times: gold no count (no key in the conventions); Rules count"
    if "extreme:shape filter" in T: return "C a shape filter on extreme: gold superlative only (conventions); Rules add shape"
    if "typo" in T: return "R a typo the Rules' spelling step does not fix (capitalised word, tie, or too short)"
    if any(x in T for x in ("propframe:what is the shape of {T}",)): return "R 'what is the shape of X': 'the shape' becomes a description, the question is read as list"
    if "propframe:what's written on {T}" in T: return "R 'what's written on X': 'written' corrected to the verb 'write'"
    if "listframe:show me the connections" in T: return "R 'show me the connections': read as neighbors without a target"
    if "connframe:is there a connection between {A} and {B}" in T: return "R 'is there a connection between A and B': read as exists"
    if "neighframe:what does {T} point to" in T or "groupqframe:is {M} part of any group" in T: return "R spelling step: 'point' -> 'paint', 'part' -> 'park'"
    if "ruleframe:{S} should be {v} from now on" in T: return "R a rule with 'from now on' at the end is not read"
    if "pathframe:is {B} downstream of {A}" in T: return "R 'is B downstream of A': from/to read in text order"
    if "listframe:list the {N} that are not {nc}" in T or ("notColor" in c and "question:list" in c): return "R notColor of a described set in list/count is dropped"
    if re.search(r"(along|at) the (top|bottom|left|right) edge", low) and "kind=edge" in c: return "R the word 'edge' in 'along the right edge' makes count/list count connections"
    if "outline:set the border of" in T or "rules miss outline" in c: return "R 'set the outline/border of X to C' read as a colour"
    if re.search(r"\b(?:[A-Z])\b", t) and any(len(n) == 1 for n in r["names"]) and ("requests:" in c or "act:" in c): return "R one-letter names are not used by the clause splitters (logic.js 1315)"
    if "connect:sequence" in T and "pairing" in c: return "R 'A to B and B to C' with wire / attach / tie: the second clause is lost (only connect/link/join/hook split, logic.js 1318)"
    if "ellipsis:move" in T or "ellipsis:set" in T or "ellipsis:connect" in T: return "R verb ellipsis not split (opener before the verb, a position word outside the splitter's list, or a list target)"
    if "construction:one clause per object" in T: return "R several objects in one create not split (an opener before the verb, logic.js 1310)"
    if "rename: rules miss name" in c: return "R rename followed by more words (thanks, please, then ...): the new name is read only at the end of the clause"
    if "act: gold command:label, rules command:move" in c: return "R 'put the label \"x\" on <a description>' is read as a move (with a name it is a label)"
    if re.search(r"\w - \w", t) and ("edgeref" in " ".join(T)) : return "R an arrow named 'A - B' (spaced dash) in a question or with a typo is not read"
    if "label: rules miss target" in c: return "R 'label it \"x\"': 'label it' is taken as the label cue, the pronoun is lost"
    if "group" in c and "act:" in c: return "R group membership / groupOf not read (a closer after the group name, 'part of')"
    if "act: gold command:connect, rules command:create" in c: return "R 'draw a two-way arrow ...': a hyphenated word before the arrow noun hides it (create)"
    if "act: gold question:connected" in c or "act: gold question:neighbors" in c or "act: gold question:list" in c or "act: gold question:property" in c: return "R a question form read as another question"
    if "ruleframe" in " ".join(T) and "requests:" in c: return "R a rule frame not read"
    if "verb:move=(none)" in T and "requests:" in c: return "R a verbless placement with a position word PLACE_ONLY does not list (by, around, close to, left side of, ...)"
    if re.search(r"\b(revert|take (that|it) back|do that again|reapply|re-apply|cancel|discard|disregard|reset|clear|drop|remove|delete|forget)\b[^.?!;]*\b(rules?|defaults?|back|again|that|revert)\b", low) and "requests:" in c and re.search(r"(undo|redo|forget)frame", " ".join(T)):
        return "R an undo / redo / forget clause whose word is not a verb cue (revert, take that back, cancel, ...) is merged into the next clause"
    if re.search(r"\b(\w+), (\w+) (and|&) (\w+)\b", t) and "requests: rules 2" in c: return "R a list of three names before a value ('paint A, B and C red', 'slide A, B and C up') is split into two requests"
    if "label: gold" in c: return "R an unquoted one-word label corrected towards a cue word ('end' -> 'send', 'hot' -> 'dot')"
    if "rules miss arrow" in c and "both ways" in low: return "R 'both ways' after a description: 'both' is read as the pronoun 'them'"
    if "pathframe:can {A} reach {B}" in T: return "R 'can A reach B' (no 'I/we' after 'can') is not read as a question"
    if "requests:" in c: return "R a clause merged into or split from its neighbour (other)"
    return "G/R other (read the row)"

NO_TOPUP = {"relabel", "unlabel"}
# values of the forms added after ca2850a (free text, the ops actions and layouts): their cues are covered by the ops / ext builders with
# least-used picks, not by the top-up of core candidates (which cannot make them)
NEW_VALUES = {("shape", "text")} | {("action", v) for v in ("improve", "respace", "snap", "flip", "reverse", "sort", "groupBy", "equalize", "straighten", "untangle", "fit")} \
    | {("layout", v) for v in ("tree", "layers", "radial", "organic")} | {("action", "arrange")}   # label cues added to logic.js in the working tree during this run (label removal / arrow labels): no frames yet

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=0); ap.add_argument("--n", type=int, default=9000); ap.add_argument("--n_ops", type=int, default=1100)
    ap.add_argument("--n_ext", type=int, default=3500, help="candidates of the forms of 39be436 (free text, templates, help) -> llm_train/synth_rules_ext")
    ap.add_argument("--per_file", type=int, default=1000); ap.add_argument("--dry", action="store_true")
    ap.add_argument("--combo", type=int, default=0, help="write N raw combination messages (synth_combo_raw) and stop")
    a = ap.parse_args()
    g = Gen(a.seed)
    if a.combo:
        write_combos(Gen(a.seed + 1000), a.combo, 100); return
    cands, tags = [], {}
    for i in range(a.n):
        row, t = make_message(g, i + 1); cands.append(row); tags[row["id"]] = t
    for i in range(a.n_ops):
        row, t = make_message(g, i + 1, ops=True); cands.append(row); tags[row["id"]] = t
    ge = Gen(a.seed + 7)   # its own stream: the core and ops candidates stay those of the same seed without --n_ext
    for i in range(a.n_ext):
        row, t = make_message(ge, i + 1, ext=True); cands.append(row); tags[row["id"]] = t
    def rules_check(rows):
        tmp_in, tmp_out = os.path.join(HERE, ".cands.jsonl"), os.path.join(HERE, ".verdicts.jsonl")
        with open(tmp_in, "w") as f:
            for r in rows: f.write(json.dumps(r, ensure_ascii=False) + "\n")
        subprocess.run(["node", os.path.join(HERE, "check_rules.mjs"), tmp_in, tmp_out], check=True)
        out = {v["id"]: v for v in (json.loads(l) for l in open(tmp_out) if l.strip())}
        os.remove(tmp_in); os.remove(tmp_out); return out
    V = rules_check(cands)
    # overlap with the test sets, duplicates within the synthetic data
    T = test_texts()
    exact = {norm(t): s for s, ts in T.items() for t in ts}
    tokset = {frozenset(norm(t).split()): s for s, ts in T.items() for t in ts}
    toks_by_set = [(s, set(norm(t).split()), t) for s, ts in T.items() for t in ts if len(norm(t).split()) <= 30]
    ov_exact, ov_tok, near = collections.Counter(), collections.Counter(), collections.Counter()
    removed, final, seen_text = [], [], set(); dup = [0]
    def admit(r, need=None):
        """r passed the Rules: keep it unless it overlaps a test set or repeats a text; `need`: keep only if it adds a low cue"""
        n = norm(r["text"]); ts = frozenset(n.split())
        if n in exact: ov_exact[exact[n]] += 1; removed.append((r, "exact", exact[n])); return
        if ts in tokset: ov_tok[tokset[ts]] += 1; removed.append((r, "token set", tokset[ts])); return
        if n in seen_text: dup[0] += 1; return
        if need is not None:
            cc = CC.counts(r["wires"])
            if not any(cc.get(q, {}).get(v, {}).get(c, 0) for q, v, c in need): return
        seen_text.add(n); final.append(r)
        for s in {s for s, tt, _ in toks_by_set if tt and len(ts & tt) / len(ts | tt) >= 0.8}: near[s] += 1
    for r in cands:
        if V[r["id"]]["ok"]: admit(r)
    # top-up: while a Rules cue word is in fewer than 5 kept requests, more candidates are generated and only those that hold such a cue
    # are added (the cues the Rules never read in a kept message stay low and are reported: RULES_COVERAGE.md)
    topup, nxt = 0, a.n + 1
    for rnd in range(4):
        need = [x for x in CC.low(CC.counts([w for r in final for w in r["wires"]]), 5, skip=NO_TOPUP) if (x[0], x[1]) not in NEW_VALUES]
        if not need: break
        extra = []
        for i in range(2000):
            row, t = make_message(g, nxt); nxt += 1; extra.append(row); tags[row["id"]] = t
        V.update(rules_check(extra)); cands += extra
        before = len(final)
        for r in extra:
            if V[r["id"]]["ok"]: admit(r, need)
        topup += len(final) - before
    kept = [r for r in cands if V[r["id"]]["ok"]]
    rej = [r for r in cands if not V[r["id"]]["ok"]]
    dup_within = dup[0]
    # coverage
    gen_c, keep_c, final_c = collections.Counter(), collections.Counter(), collections.Counter()
    fin_ids = {r["id"] for r in final}
    for r in cands:
        for t in tags[r["id"]]:
            gen_c[t] += 1
            if V[r["id"]]["ok"]: keep_c[t] += 1
            if r["id"] in fin_ids: final_c[t] += 1
    causes = collections.Counter()
    def cause_key(c):
        c = re.sub(r"#\d+ ", "", c)
        c = re.sub(r"(gold|rules) [^;,]*", r"\1 …", c) if c.startswith("requests") is False and ":" in c and ("gold" in c and "rules" in c and "act:" not in c) else c
        return c
    for r in rej: causes[(V[r["id"]]["cause"] or "?")] += 1
    summary = {"seed": a.seed, "logic_js": LOGIC_FROM, "logic_js_sha256": hashlib.sha256(open(LOGIC_JS, "rb").read()).hexdigest()[:16], "candidates": len(cands), "kept_by_rules": len(kept), "rejected": len(rej), "removed_overlap_exact": dict(ov_exact),
               "removed_overlap_tokenset": dict(ov_tok), "near_dup_jaccard08_reported": dict(near), "removed_duplicate_texts_within_synth": dup_within, "topup_messages": topup,
               "low_cues_after_topup": [" ".join(x) for x in CC.low(CC.counts([w for r in final for w in r["wires"]]), 5)], "final": len(final),
               "final_core": sum(1 for r in final if r["id"].startswith("sr")), "final_ops": sum(1 for r in final if r["id"].startswith("so")), "final_ext": sum(1 for r in final if r["id"].startswith("se"))}
    print(json.dumps(summary, indent=1))
    if a.dry:
        for c, n in causes.most_common(60): print(f"{n:5d}  {c}")
        if os.environ.get("DRY_DUMP"):
            with open(os.environ["DRY_DUMP"], "w") as f:
                for r in rej: f.write(json.dumps({"id": r["id"], "text": r["text"], "names": r["names"], "cause": V[r["id"]]["cause"], "gold": [w["args"] for w in r["wires"]], "rules": V[r["id"]]["rules"], "corr": V[r["id"]]["corrections"]}, ensure_ascii=False) + "\n")
        return
    # write
    for out, pre in [(OUT_CORE, "sr"), (OUT_OPS, "so"), (OUT_EXT, "se")]:
        os.makedirs(out, exist_ok=True)
        for f in glob.glob(os.path.join(out, "msg_*.jsonl")): os.remove(f)
        rows = [r for r in final if r["id"].startswith(pre)]
        for k in range(0, len(rows), a.per_file):
            with open(os.path.join(out, f"msg_{k // a.per_file + 1:02d}.jsonl"), "w") as f:
                for r in rows[k:k + a.per_file]: f.write(json.dumps(r, ensure_ascii=False) + "\n")
    with open(os.path.join(HERE, "rejects.jsonl"), "w") as f:
        for r in rej: f.write(json.dumps({"id": r["id"], "text": r["text"], "names": r["names"], "gold": [{"type": w["type"], "args": w["args"]} for w in r["wires"]], "cause": V[r["id"]]["cause"], "class": classify(r, tags[r["id"]], V[r["id"]]), "rules": V[r["id"]]["rules"], "corrections": V[r["id"]]["corrections"], "tags": tags[r["id"]]}, ensure_ascii=False) + "\n")
    with open(os.path.join(HERE, "overlap_removed.jsonl"), "w") as f:
        for r, how, s in removed: f.write(json.dumps({"id": r["id"], "text": r["text"], "how": how, "set": s}, ensure_ascii=False) + "\n")
    acts = collections.Counter(); acts_f = collections.Counter()
    for r in final:
        for w in r["wires"]: acts_f[act_of(w["type"], w["args"])] += 1
    cls = collections.Counter(classify(r, tags[r["id"]], V[r["id"]]) for r in rej)
    print("rejects by class:"); [print(f"{n:5d}  {k}") for k, n in cls.most_common()]
    json.dump({"summary": summary, "rejects_by_class": dict(cls.most_common()), "rejects_by_cause": dict(causes.most_common()), "requests_per_act_final": dict(sorted(acts_f.items())),
               "tags": {t: {"generated": gen_c[t], "kept": keep_c[t], "final": final_c[t]} for t in sorted(gen_c)}}, open(os.path.join(HERE, "coverage.json"), "w"), indent=1)

if __name__ == "__main__":
    main()
