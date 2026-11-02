#!/usr/bin/env python3
"""test_combined_ui.py: the VSS-BERT tab of the demo in a real browser (Playwright, Chromium): the combined reader of VSS and SOP-BERT
(docs/js/combined-confidence.js, docs/model/confidence/combined.json; training/sketch/combine/COMBINED_READER.md).

Run:  python3 training/sketch/test_combined_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ on a free local port and loads both readers it combines: VSS (docs/model/micro, about 23 MB) and SOP-BERT
(docs/model/neural/sop-bert, about 68 MB, WASM; transformers.js 3.8.1 from training/laptop/node_modules in place of cdn.jsdelivr.net). Nothing
is blocked except huggingface.co (never used). Checks:
  1. the tabs read Rules, VSS, SOP-BERT, VSS-BERT, 3 readers (the neural tab is labelled SOP-BERT; 3 readers: test_vote_ui.py); VSS-BERT has its own drawing and the subtabs
     Drawing / SOP Lang / Settings; every reply has a "VSS-BERT · <ms>" line;
  2. with the default cut (VSS cutter) VSS-BERT reads the BERT cutter's requests itself (details: "read here", 2 SOP-BERT model calls);
     with the BERT cutter as the shared cut it reuses the two tabs' readings (details: "reused");
  3. a message with a request the two readers read the same is executed; a request below the combined threshold is not done, its reason
     is one of the combined reader's plain sentences (the readers disagree / only one reader found it / ...), with its confidence, the
     file's threshold and a "Do it anyway" button; clicking it runs that reading in the VSS-BERT drawing; undo takes it back;
  4. the details show "VSS-BERT gate: safety threshold (it acts from confidence <the file's threshold of the BERT cut>)";
  5. Settings: bolder / safety threshold / more careful / execute all (safety threshold checked), with the file's thresholds; a choice other
     than the default is kept in localStorage, the default removes it;
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
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="combined-ui-")
os.makedirs(OUT, exist_ok=True)
SPEC = json.load(open(os.path.join(DOCS, "model", "confidence", "combined.json")))
CUT = SPEC["best_cut"]
LV = SPEC["cuts"][CUT]["levels"]
T_COST = LV["cost"]["threshold"]
REASONS = re.compile(r"the two readers disagree on|only one reader found this request|the two readers read different actions here|both readers read it the same way|it uses what")
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

# the last bot bubble's VSS-BERT line: its label (with the time), text, the requests not done (src, reason) and their buttons
LINE = """() => {
  const bs = [...document.querySelectorAll('#msgs .b.bot')], b = bs[bs.length - 1]; if (!b) return null;
  const rl = [...b.querySelectorAll('.rl')].find(x => /^VSS-BERT/.test((x.querySelector('b') || {}).textContent || ''));
  if (!rl) return { label: null, text: b.textContent, held: [] };
  return { label: rl.querySelector('b').textContent, text: rl.querySelector('.t').textContent, held: [...rl.querySelectorAll('.held li')].map(li => ({ src: li.querySelector('.src').textContent, why: li.querySelector('.why').textContent, button: !!li.querySelector('button.anyway') })) };
}"""
COUNTS = """() => { const m = (((document.querySelector('#readout') || {}).textContent || '').match(/(\\d+) shapes? · (\\d+) links?/) || [0, -1, -1]); return [+m[1], +m[2]]; }"""

def send(pg, text):
    n = pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
    pg.fill("#say", text); pg.click("#send-btn")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n, timeout=180000)
    pg.wait_for_timeout(300)
    return pg.evaluate(LINE)

def details(pg, k_from_end):
    pg.evaluate("k => { const bs = [...document.querySelectorAll('#msgs .b.bot [data-turn]')]; bs[bs.length - k].click(); }", k_from_end)
    pg.wait_for_timeout(400)
    return pg.evaluate("() => (document.querySelector('#sbody') || {}).textContent || ''")

# messages to try until one has a request VSS-BERT does not execute (the first ones are expected to)
TRY = ["Make Process green and connect it to Done.", "Add a tiny purple triangle named Tri next to Check and link it to Start with a dotted line.",
       "Put a big orange hexagon called Hub between Start and Done, then make the hub teal and attach it to Check.",
       "Connect Check to Start, recolor Start crimson and make it slightly smaller.", "Hub teal, then the triangle goes left of Process."]

with sync_playwright() as p:
    b = p.chromium.launch(args=["--js-flags=--max-old-space-size=1536"])
    pg = b.new_page(viewport={"width": 1280, "height": 860})
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.add_init_script("try { if (!sessionStorage.getItem('t0')) { localStorage.clear(); sessionStorage.setItem('t0', '1'); } } catch (e) {}")
    pg.route(LIB + "**", cdn)
    pg.route("https://huggingface.co/**", lambda r: r.abort())
    pg.goto(base, wait_until="domcontentloaded")
    pg.wait_for_function("() => { const t = document.querySelector('[data-rtab=combined]'); return t && !t.classList.contains('off'); }", timeout=900000)
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=180000)
    tabs = pg.evaluate("() => [...document.querySelectorAll('#rtabs [data-rtab]')].map(x => x.textContent.trim())")
    check("1. the tabs are Rules, VSS, SOP-BERT, VSS-BERT, 3 readers", tabs == ["Rules", "VSS", "SOP-BERT", "VSS-BERT", "3 readers"], str(tabs))
    pg.click("[data-rtab=combined]"); pg.wait_for_timeout(300)
    subs = pg.evaluate("() => [...document.querySelectorAll('#subtabs [data-sub]')].map(x => x.dataset.sub)")
    of = pg.evaluate("() => (document.querySelector('#subtabs .of') || {}).textContent")
    check("1. VSS-BERT has the subtabs Drawing / SOP Lang / Settings", subs == ["drawing", "sop", "settings"] and of == "VSS-BERT reader", f"{subs} {of}")
    pg.screenshot(path=f"{OUT}/0_start.png")

    # 2 + 3: the default cut (VSS cutter): VSS-BERT reads the BERT cut itself
    r1 = send(pg, "Move Done below Start.")
    pg.screenshot(path=f"{OUT}/1_agree.png")
    check("1. the reply has a VSS-BERT line with its time in ms", bool(r1 and r1["label"] and re.match(r"VSS-BERT · [\d.]+ ms:", r1["label"])), str(r1))
    check("3. a request both readers read the same is executed", bool(r1 and not r1["held"] and "Moved" in r1["text"]), str(r1))
    det1 = details(pg, 1)
    check("2. default cut: VSS-BERT read the BERT cutter's requests itself (2 SOP-BERT model calls)", "VSS-BERT: read here on the BERT cutter" in det1 and "2 SOP-BERT model calls" in det1, det1[det1.find("VSS-BERT:"):][:300])
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)

    held, k = None, 0
    for msg in TRY:
        r = send(pg, msg); k += 1
        print(f"     tried: {msg!r} -> {r['text'][:120] if r else r}")
        if r and r["held"]: held = (msg, r); break
    pg.screenshot(path=f"{OUT}/2_held.png")
    check("3. a request below the combined threshold is not done, with a reason and a button", held is not None and held[1]["held"][0]["button"], str(held))
    if held:
        why = held[1]["held"][0]["why"]
        check("3. its reason is one of the combined reader's plain sentences", bool(REASONS.search(why)), why)
        check(f"3. the reason shows the confidence and the file's threshold ({T_COST:.2f})", f"it acts from {T_COST:.2f}" in why and "confidence " in why, why)
        c0 = pg.evaluate(COUNTS)
        n0 = pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
        pg.locator('#msgs button.anyway[data-anyway^="combined:"]').last.click()   # VSS-BERT's button (VSS or SOP-BERT may hold the same request)
        pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n", arg=n0, timeout=30000)
        pg.wait_for_timeout(400)
        r3 = pg.evaluate("() => { const bs = [...document.querySelectorAll('#msgs .b.bot')]; return bs[bs.length - 1].textContent; }")
        c1 = pg.evaluate(COUNTS)
        pg.screenshot(path=f"{OUT}/3_do_it_anyway.png")
        check("3. Do it anyway runs that reading in the VSS-BERT drawing", r3.startswith("VSS-BERT") and "anyway" in r3 and c1 != c0, f"{r3!r}; shapes/links {c0} -> {c1}")
        send(pg, "undo")
        c2 = pg.evaluate(COUNTS)
        check("3. undo takes it back", c2 == c0, f"{c0} -> {c1} -> after undo {c2}")
        det = details(pg, 3)
        pg.screenshot(path=f"{OUT}/4_details.png")
        check("4. details show the VSS-BERT gate, its level and the file's threshold", f"VSS-BERT gate: safety threshold (it acts from confidence {T_COST:.4f})" in det and "not executed" in det, det[det.find("VSS-BERT"):][:400])
        check("4. details say which reading each request comes from", "SOP-BERT’s reading" in det or "VSS’s reading" in det, "")
        pg.keyboard.press("Escape"); pg.wait_for_timeout(300)

    # 2: the BERT cutter as the shared cut: the readings of the two tabs are reused
    pg.click("#open-settings"); pg.wait_for_timeout(400)
    pg.check("#sbody input[name=cut-strategy][value='bert']"); pg.wait_for_timeout(200)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    r5 = send(pg, "Make Check orange.")
    det5 = details(pg, 1)
    check("2. BERT cutter shared: VSS-BERT reuses the readings of the VSS and SOP-BERT tabs", "VSS-BERT: the readings of the VSS and SOP-BERT tabs on the BERT cutter" in det5 and "reused" in det5, det5[det5.find("VSS-BERT:"):][:300])
    check("1. its time is VSS + SOP-BERT + combining", bool(r5 and r5["label"] and re.match(r"VSS-BERT · [\d.]+ ms:", r5["label"])), str(r5))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)

    # 5: Settings
    pg.click("[data-sub=settings]"); pg.wait_for_timeout(300)
    pg.wait_for_function("() => document.querySelectorAll('#rpanel input[name=comb-gate]').length === 4", timeout=30000)
    levels = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=comb-gate]')].map(x => [x.value, x.checked])")
    lab = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=comb-gate]')].map(x => x.parentElement.textContent)")
    pg.screenshot(path=f"{OUT}/5_settings.png", full_page=True)
    check("5. settings: bolder / safety threshold / more careful / execute all, the safety threshold checked", levels == [["cost5", False], ["cost", True], ["cost20", False], ["all", False]], str(levels))
    check("5. each cost level in plain words with the file's threshold", all(f"{LV[l]['threshold']:.4f}" in t and f"counts as {c} right answers" in t for l, c, t in zip(["cost5", "cost", "cost20"], [5, 10, 20], lab)), str(lab))
    pg.check("#rpanel input[name=comb-gate][value='cost20']"); pg.wait_for_timeout(200)
    kept = pg.evaluate("() => { try { return localStorage.getItem('sop.combined.gate'); } catch (e) { return 'no storage'; } }")
    check("5. more careful is kept in localStorage", kept == "cost20", str(kept))
    pg.check("#rpanel input[name=comb-gate][value='cost']"); pg.wait_for_timeout(200)
    kept = pg.evaluate("() => { try { return localStorage.getItem('sop.combined.gate'); } catch (e) { return 'no storage'; } }")
    check("5. back to the default, nothing stored", kept is None, str(kept))
    sop = pg.click("[data-sub=sop]"); pg.wait_for_timeout(200)
    txt = pg.evaluate("() => (document.querySelector('#rpanel') || {}).textContent || ''")
    check("1. SOP Lang subtab shows the VSS-BERT drawing", "The VSS-BERT reader’s drawing" in txt, txt[:200])
    pg.click("[data-sub=drawing]"); pg.wait_for_timeout(200)
    check("6. no page error", not errors, "; ".join(errors[:3]))
    b.close()
httpd.shutdown()
print(f"screenshots: {OUT}")
print("PASS" if not fails else f"FAIL ({len(fails)})")
sys.exit(1 if fails else 0)
