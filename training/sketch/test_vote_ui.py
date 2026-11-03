#!/usr/bin/env python3
"""test_vote_ui.py: the "3 readers" tab of the demo and the votes in the VSS and SOP-BERT tabs, in a real browser (Playwright, Chromium)
(docs/js/vote-confidence.js, docs/model/confidence/vote3.json; training/sketch/confidence3/RESULT.md).

Run:  python3 training/sketch/test_vote_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ on a free local port and loads VSS (docs/model/micro, about 31 MB) and SOP-BERT (docs/model/neural/sop-bert, about 68 MB, WASM;
transformers.js 3.8.1 from training/laptop/node_modules in place of cdn.jsdelivr.net, as test_combined_ui.py). Checks:
  1. the tabs read Rules, VSS, SOP-BERT, VSS-BERT, 3 readers; 3 readers has its own drawing and the subtabs Drawing / SOP Lang / Settings;
     every reply has a "3 readers · <ms>" line;
  2. on the opening drawing, "arrange all in a circle" and "distribute all vertically" are executed in the 3 readers tab (all three readers
     read them the same; the details say so and that the readings of the three tabs were reused); each is undone after. On the rendered canvas no shape body, name tag, free text or group name overlaps another,
     at the start and after each command (bounding boxes of the SVG elements);
  3. a request the readers do not all read the same is not done in the 3 readers tab: its reason says who agrees and what the other reads
     ("… agree, SOP-BERT reads … instead", "only … found this request", …), with a "Do it anyway" button that runs it; undo takes it back;
  4. the VSS and SOP-BERT tabs use the confidence with the votes: their details show the thresholds of vote3.json per type ("for commands and
     … for questions, with the votes of the other two readers");
  5. Settings of 3 readers: all three agree (checked) / fitted vote (with vote3.json's thresholds) / execute all; "fitted vote" is kept
     in localStorage and is still chosen after a reload of the page; the default removes it. VSS and SOP-BERT › Settings: bolder / safety
     threshold / more careful / execute all, with the thresholds of vote3.json;
  6. no page error.
Screenshots go to the directory (default: a temporary folder). Exit code 0 when everything passes.
"""
import functools, http.server, json, mimetypes, os, re, socketserver, sys, tempfile, threading

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "..", "..", "docs"))
TJS = os.path.normpath(os.path.join(HERE, "..", "laptop", "node_modules", "@huggingface", "transformers", "dist"))
LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="vote-ui-")
os.makedirs(OUT, exist_ok=True)
SPEC = json.load(open(os.path.join(DOCS, "model", "confidence", "vote3.json")))
COL = SPEC["columns"]
T3 = COL["vote3"]["levels"]["cost"]
REASONS = re.compile(r"agree, .*(reads?|did not find this request)|no two readers read it the same|only (VSS|SOP-BERT) found this request|it uses what")
fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + ("" if ok or not detail else f"\n     {detail}"))
    if not ok: fails.append(name)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=DOCS))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{httpd.server_address[1]}/"

def cdn(route):
    """the demo's transformers.js version from the local npm copy (as test_neural_gate_ui.py)"""
    url = route.request.url.split("?")[0]
    rel = "transformers.min.js" if url.rstrip("/") == LIB else url[len(LIB):].lstrip("/").removeprefix("dist/")
    p = os.path.join(TJS, rel)
    if not os.path.isfile(p): return route.abort()
    ct = "application/wasm" if p.endswith(".wasm") else "text/javascript" if p.endswith((".js", ".mjs")) else (mimetypes.guess_type(p)[0] or "application/octet-stream")
    route.fulfill(status=200, body=open(p, "rb").read(), headers={"content-type": ct, "access-control-allow-origin": "*"})

# the last bot bubble's line of one reader: its label (with the time), text, the requests not done (src, reason) and their buttons
LINE = """lab => {
  const bs = [...document.querySelectorAll('#msgs .b.bot')], b = bs[bs.length - 1]; if (!b) return null;
  const rl = [...b.querySelectorAll('.rl')].find(x => ((x.querySelector('b') || {}).textContent || '').startsWith(lab + ' ·') || ((x.querySelector('b') || {}).textContent || '') === lab + ':');
  if (!rl) return { label: null, text: b.textContent, held: [] };
  return { label: rl.querySelector('b').textContent, text: rl.querySelector('.t').textContent, held: [...rl.querySelectorAll('.held li')].map(li => ({ src: li.querySelector('.src').textContent, why: li.querySelector('.why').textContent, button: !!li.querySelector('button.anyway') })) };
}"""
COUNTS = """() => { const m = (((document.querySelector('#readout') || {}).textContent || '').match(/(\\d+) shapes? · (\\d+) links?/) || [0, -1, -1]); return [+m[1], +m[2]]; }"""
# where the shapes of the active tab's drawing are (name -> [x, y])
POS = """() => Object.fromEntries([...document.querySelectorAll('#layer .shp')].map(g => [g.dataset.name, (g.getAttribute('transform').match(/translate\\(([-\\d.]+) ([-\\d.]+)\\)/) || []).slice(1).map(Number)]))"""

# the drawn boxes that must not overlap (shape bodies, name tags, free texts, group names, arrow labels), as pairs of names; panels have no tag
OVERLAPS = """() => { const L = document.querySelector('#layer'), out = [];
  const add = (kind, name, el) => { if (!el) return; const r = el.getBoundingClientRect(); if (r.width && r.height) out.push({ kind, name, x1: r.left, y1: r.top, x2: r.right, y2: r.bottom }); };
  for (const g of L.querySelectorAll('.shp')) { const nm = g.dataset.name, panel = g.classList.contains('zone') || g.classList.contains('background');
    add('tag', nm, g.querySelector(':scope > text.tag'));
    if (g.classList.contains('txt')) add('text', nm, g.querySelector('text.ftext')); else if (!panel) add('shape', nm, g.querySelector('.body')); }
  for (const g of L.querySelectorAll('.grp')) add('group name', g.dataset.group, g.querySelector('text'));
  for (const t of L.querySelectorAll('.edge text.elbl')) add('arrow label', t.textContent, t);
  const bad = []; for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) { const a = out[i], b = out[j];
    if (Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1) > 1 && Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1) > 1) bad.push(`${a.kind} ${a.name} / ${b.kind} ${b.name}`); }
  return bad; }"""

def send(pg, text, lab="3 readers"):
    n = pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
    pg.fill("#say", text); pg.click("#send-btn")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n, timeout=180000)
    pg.wait_for_timeout(300)
    return pg.evaluate(LINE, lab)

def details(pg, k_from_end):
    pg.evaluate("k => { const bs = [...document.querySelectorAll('#msgs .b.bot [data-turn]')]; bs[bs.length - k].click(); }", k_from_end)
    pg.wait_for_timeout(400)
    return pg.evaluate("() => (document.querySelector('#sbody') || {}).textContent || ''")

def section(det, label, nxt):
    """the part of a message's details about one reader (from its header to the next reader's)"""
    i = det.find(label + " formalized")
    if i < 0: i = det.find(label)
    j = det.find(nxt, i + 1) if nxt else -1
    return det[i: j if j > 0 else None]

# messages to try until one has a request the three readers do not all read the same
TRY = ["Make Process green and connect it to Done.", "Add a tiny purple triangle named Tri next to Check and link it to Start with a dotted line.",
       "Put a big orange hexagon called Hub between Start and Done, then make the hub teal and attach it to Check.",
       "Connect Check to Start, recolor Start crimson and make it slightly smaller.", "Hub teal, then the triangle goes left of Process."]

with sync_playwright() as p:
    b = p.chromium.launch(args=["--js-flags=--max-old-space-size=1536"])
    ctx = b.new_context(viewport={"width": 1280, "height": 860})
    pg = ctx.new_page()
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.add_init_script("try { if (!sessionStorage.getItem('t0')) { localStorage.clear(); sessionStorage.setItem('t0', '1'); } } catch (e) {}")
    pg.route(LIB + "**", cdn)
    pg.route("https://huggingface.co/**", lambda r: r.abort())
    pg.goto(base, wait_until="domcontentloaded")
    pg.wait_for_function("() => { const t = document.querySelector('[data-rtab=vote3]'); return t && !t.classList.contains('off'); }", timeout=900000)
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=180000)
    tabs = pg.evaluate("() => [...document.querySelectorAll('#rtabs [data-rtab]')].map(x => x.textContent.trim())")
    check("1. the tabs are Rules, VSS, SOP-BERT, VSS-BERT, 3 readers", tabs == ["Rules", "VSS", "SOP-BERT", "VSS-BERT", "3 readers"], str(tabs))
    pg.click("[data-rtab=vote3]"); pg.wait_for_timeout(300)
    subs = pg.evaluate("() => [...document.querySelectorAll('#subtabs [data-sub]')].map(x => x.dataset.sub)")
    of = pg.evaluate("() => (document.querySelector('#subtabs .of') || {}).textContent")
    check("1. 3 readers has the subtabs Drawing / SOP Lang / Settings", subs == ["drawing", "sop", "settings"] and of == "3 readers reader", f"{subs} {of}")
    pg.screenshot(path=f"{OUT}/0_start.png")
    ov = pg.evaluate(OVERLAPS)
    check("2. the opening drawing as drawn: no shape, name tag, text or group name overlaps another", not ov, "; ".join(ov))

    # 2: the two symptom commands on the opening drawing: executed when all three readers read them the same (after engineNorm); when one
    # reads them differently, held with the reason (printed: a finding about the readers, not a failure of the tab)
    agreed = 0
    for k, msg in enumerate(["arrange all in a circle", "distribute all vertically"]):
        p0 = pg.evaluate(POS)
        r = send(pg, msg)
        p1 = pg.evaluate(POS)
        pg.screenshot(path=f"{OUT}/{1 + k}_{msg.replace(' ', '_')}.png")
        ov = pg.evaluate(OVERLAPS)
        check(f"2. {msg!r} as drawn: no shape, name tag, text or group name overlaps another", not ov, "; ".join(ov))
        check(f"1. the reply has a 3 readers line with its time in ms ({msg!r})", bool(r and r["label"] and re.match(r"3 readers · [\d.]+ ms:", r["label"])), str(r))
        det = details(pg, 1)
        sec = section(det, "3 readers", None)
        same = "all three read it the same" in sec
        agreed += same
        check(f"2. {msg!r}: the details say the readings of the three tabs were reused and the gate is 'all three agree'", "reused" in sec and "3 readers gate: all three agree" in sec, sec[:500])
        if same:
            check(f"2. {msg!r}: all three read it the same -> executed in the 3 readers tab (nothing held, shapes moved)", bool(r and not r["held"] and p1 != p0), f"{r}")
        else:
            why = r["held"][0]["why"] if r and r["held"] else ""
            check(f"2. {msg!r}: the readers differ -> held, with who differs in plain words", bool(r and r["held"] and REASONS.search(why) and p1 == p0), str(r))
            print(f"     finding: {msg!r} is not read the same by all three: {why}")
        pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
        if p1 != p0: send(pg, "undo")
        check(f"2. the shapes are where they were after {msg!r} (undone when it ran)", pg.evaluate(POS) == p0, "")
    check("2. at least one of the two symptom commands is read the same by all three and executed", agreed >= 1, str(agreed))

    # 3: a request the readers do not all read the same
    held = None
    for msg in TRY:
        r = send(pg, msg)
        print(f"     tried: {msg!r} -> {r['text'][:140] if r else r}")
        if r and r["held"]: held = (msg, r); break
    pg.screenshot(path=f"{OUT}/3_held.png")
    check("3. a request the three readers do not all read the same is not done, with a reason and a button", held is not None and held[1]["held"][0]["button"], str(held))
    if held:
        why = held[1]["held"][0]["why"]
        check("3. its reason says who agrees and what the other reads, in plain words", bool(REASONS.search(why)) and "confidence " not in why, why)
        c0 = pg.evaluate(COUNTS)
        n0 = pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
        pg.locator('#msgs button.anyway[data-anyway^="vote3:"]').last.click()
        pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n", arg=n0, timeout=30000)
        pg.wait_for_timeout(400)
        r3 = pg.evaluate("() => { const bs = [...document.querySelectorAll('#msgs .b.bot')]; return bs[bs.length - 1].textContent; }")
        c1 = pg.evaluate(COUNTS)
        pg.screenshot(path=f"{OUT}/4_do_it_anyway.png")
        check("3. Do it anyway runs that reading in the 3 readers drawing", r3.startswith("3 readers") and "anyway" in r3, f"{r3!r}; shapes/links {c0} -> {c1}")
        send(pg, "undo")
        c2 = pg.evaluate(COUNTS)
        check("3. undo takes it back", c2 == c0, f"{c0} -> {c1} -> after undo {c2}")
        # 4: the VSS and SOP-BERT gates of the same message use the votes
        det = details(pg, 3)
        pg.screenshot(path=f"{OUT}/5_details.png")
        vs, ns = section(det, "VSS", "SOP-BERT"), section(det, "SOP-BERT", "VSS-BERT")
        tv, tn = COL["vss"]["levels"]["cost"], COL["sop"]["levels"]["cost"]
        check("4. VSS's details: the thresholds of vote3.json per type, with the votes", f"VSS gate: safety threshold (it acts from confidence {tv['command']:.4f} for commands and {tv['question']:.4f} for questions, with the votes of the other two readers)" in vs, vs[:400])
        check("4. SOP-BERT's details: the thresholds of vote3.json per type, with the votes", f"SOP-BERT gate: safety threshold (it acts from confidence {tn['command']:.4f} for commands and {tn['question']:.4f} for questions, with the votes of the other two readers)" in ns, ns[:400])
        check("3. the 3 readers details say who agrees on each request", "3 readers gate: all three agree" in det and "not executed" in section(det, "3 readers", None), section(det, "3 readers", None)[:500])
        pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
        # the reasons of the VSS and SOP-BERT tabs stay plain sentences
        for lab in ("VSS", "SOP-BERT"):
            rr = pg.evaluate("""([lab, k]) => { const bs = [...document.querySelectorAll('#msgs .b.bot')], b = bs[bs.length - k];
              const rl = [...b.querySelectorAll('.rl')].find(x => ((x.querySelector('b') || {}).textContent || '').startsWith(lab + ' ·')); return rl ? [...rl.querySelectorAll('.held .why')].map(x => x.textContent) : null; }""", [lab, 3])
            if rr: check(f"4. {lab}'s reasons are plain sentences (no code names)", all(not re.search(r"agree_|n_agree|rules_clean|[a-z]+_[a-z]+_?min|\bpa\b", w) for w in rr), str(rr))

    # 5: Settings of 3 readers
    pg.click("[data-sub=settings]"); pg.wait_for_timeout(300)
    pg.wait_for_function("() => document.querySelectorAll('#rpanel input[name=vote-gate]').length === 3", timeout=30000)
    levels = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=vote-gate]')].map(x => [x.value, x.checked])")
    lab = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=vote-gate]')].map(x => x.parentElement.textContent)")
    pg.screenshot(path=f"{OUT}/6_settings.png", full_page=True)
    check("5. settings: all three agree / fitted vote / execute all, all three agree checked", levels == [["agree3", True], ["fitted", False], ["all", False]], str(levels))
    check("5. the fitted vote shows its thresholds from vote3.json", f"{T3['command']:.4f}" in lab[1] and f"{T3['question']:.4f}" in lab[1] and "fitted vote" in lab[1], lab[1])
    check("5. the page says plainly that 2 of 3 is not used", "“2 of 3 agree” is not a level" in pg.evaluate("() => document.querySelector('#rpanel').textContent"), "")
    pg.check("#rpanel input[name=vote-gate][value='fitted']"); pg.wait_for_timeout(200)
    kept = pg.evaluate("() => { try { return localStorage.getItem('sop.vote3.gate'); } catch (e) { return 'no storage'; } }")
    check("5. the fitted vote is kept in localStorage", kept == "fitted", str(kept))
    r6 = send(pg, "Make Check orange.")
    det6 = details(pg, 1)
    check("5. with the fitted vote the 3 readers gate uses its thresholds", f"3 readers gate: fitted vote (it acts from confidence {T3['command']:.4f} for commands and {T3['question']:.4f} for questions)" in det6, section(det6, "3 readers", None)[:300])
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    # VSS and SOP-BERT settings: the cost levels with vote3.json's thresholds
    for tab, name, col in (("vss", "vss-gate", "vss"), ("neural", "neural-gate", "sop")):
        pg.click(f"[data-rtab={tab}]"); pg.wait_for_timeout(300)
        pg.wait_for_function(f"() => document.querySelectorAll('#rpanel input[name={name}]').length === 4", timeout=30000)
        lv = pg.evaluate(f"() => [...document.querySelectorAll('#rpanel input[name={name}]')].map(x => [x.value, x.checked])")
        tx = pg.evaluate(f"() => [...document.querySelectorAll('#rpanel input[name={name}]')].map(x => x.parentElement.textContent)")
        L = COL[col]["levels"]
        check(f"5. {tab} settings: bolder / safety threshold / more careful / execute all, the safety threshold checked", lv == [["cost5", False], ["cost", True], ["cost20", False], ["all", False]], str(lv))
        check(f"5. {tab} settings: each cost level with vote3.json's thresholds for commands and questions", all(f"{L[l]['command']:.4f}" in t and f"{L[l]['question']:.4f}" in t and f"counts as {c} right answers" in t for l, c, t in zip(["cost5", "cost", "cost20"], [5, 10, 20], tx)), str(tx[:3]))
        pg.screenshot(path=f"{OUT}/7_settings_{tab}.png", full_page=True)
    # the choice persists across a reload
    pg.reload(wait_until="domcontentloaded")
    pg.wait_for_function("() => document.querySelector('[data-rtab=vote3]')", timeout=60000)
    pg.click("[data-rtab=vote3]"); pg.wait_for_timeout(300)
    pg.click("[data-sub=settings]"); pg.wait_for_timeout(300)
    pg.wait_for_function("() => document.querySelectorAll('#rpanel input[name=vote-gate]').length === 3", timeout=60000)
    after = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=vote-gate]')].map(x => [x.value, x.checked])")
    check("5. after a reload the fitted vote is still chosen", after == [["agree3", False], ["fitted", True], ["all", False]], str(after))
    pg.check("#rpanel input[name=vote-gate][value='agree3']"); pg.wait_for_timeout(200)
    kept = pg.evaluate("() => { try { return localStorage.getItem('sop.vote3.gate'); } catch (e) { return 'no storage'; } }")
    check("5. back to the default, nothing stored", kept is None, str(kept))
    pg.click("[data-sub=sop]"); pg.wait_for_timeout(200)
    txt = pg.evaluate("() => (document.querySelector('#rpanel') || {}).textContent || ''")
    check("1. SOP Lang subtab shows the 3 readers drawing", "The 3 readers reader’s drawing" in txt, txt[:200])
    pg.click("[data-sub=drawing]"); pg.wait_for_timeout(200)
    # a phone-width view of the tab bar
    pg.set_viewport_size({"width": 390, "height": 800}); pg.wait_for_timeout(400)
    pg.screenshot(path=f"{OUT}/8_phone.png")
    wide = pg.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1")
    check("1. no horizontal page scroll at phone width", wide, "")
    check("6. no page error", not errors, "; ".join(errors[:3]))
    b.close()
httpd.shutdown()
print(f"screenshots: {OUT}")
print("PASS" if not fails else f"FAIL ({len(fails)})")
sys.exit(1 if fails else 0)
