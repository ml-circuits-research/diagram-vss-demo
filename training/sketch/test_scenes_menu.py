#!/usr/bin/env python3
"""test_scenes_menu.py: the "Scenes" of the + menu (docs/js/scenes-extra.js, appended to docs/js/scenarios.js) played to the end in a real
browser (Playwright, Chromium), as a person plays them: + -> Play on a scene's card, with the Rules tab open.

Run:  python3 training/sketch/test_scenes_menu.py [screenshot dir] [scene ids, comma-separated]   (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers)
It serves docs/ on a free local port and loads every reader (VSS, SOP-BERT with transformers.js 3.8.1 from training/laptop/node_modules in
place of cdn.jsdelivr.net), like test_cartoon.py. Checks:
  1. the menu: a "Scenes" heading with one card per scene of scenes-extra.js (the test scenes marked "test"); at phone width the sheet
     scrolls down to the last scene's Play button;
  2. per scene, played with the Rules tab open and no pause between messages: it plays to the end ("finished") with no page error; the
     view is the scene's own area (the 'focus' view: the view is at most one area wide); the names above the shapes are off (names: false);
  3. per scene, in the Rules tab: nothing lies off the canvas (every body inside the 800 x 500 cell of the scene's frame);
  4. per scene and per tab (VSS-BERT, Rules, VSS, SOP-BERT): the steps done, printed (not checked): a step is "done" when the reader executed
     every request it read with no engine error and held nothing; "partly" when it executed something but also held or failed something.
Screenshots: the menu (desktop, phone), and the end of the scenes listed in SHOTS (Rules tab), into the directory (default: a temp folder).
The page is reloaded every RELOAD scenes (the chat and the frames grow). Exit code 0 when everything passes.
"""
import functools, http.server, json, mimetypes, os, socketserver, subprocess, sys, tempfile, threading, time

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "..", "..", "docs"))
TJS = os.path.normpath(os.path.join(HERE, "..", "laptop", "node_modules", "@huggingface", "transformers", "dist"))
LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="scenes-")
os.makedirs(OUT, exist_ok=True)
SCENES = json.loads(subprocess.check_output(["node", "-e", "const S = require(process.argv[1] + '/js/scenarios.js'); console.log(JSON.stringify(S.filter(s => s.kind === 'scene').map(s => ({ id: s.id, title: s.title, test: !!s.test, names: s.names, n: s.turns.length }))))", DOCS], text=True))
ONLY = sys.argv[2].split(",") if len(sys.argv) > 2 and sys.argv[2] else None
SHOTS = {"farm", "pump", "sunrise", "playground"}
RELOAD = 6
TABS = [("combined", "VSS-BERT"), ("rules", "Rules"), ("vss", "VSS"), ("neural", "SOP-BERT")]

fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + ("" if ok or not detail else f"\n     {detail}"), flush=True)
    if not ok: fails.append(name)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=DOCS))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{httpd.server_address[1]}/"

def cdn(route):
    url = route.request.url.split("?")[0]
    rel = "transformers.min.js" if url.rstrip("/") == LIB else url[len(LIB):].lstrip("/").removeprefix("dist/")
    p = os.path.join(TJS, rel)
    if not os.path.isfile(p): return route.abort()
    ct = "application/wasm" if p.endswith(".wasm") else "text/javascript" if p.endswith((".js", ".mjs")) else (mimetypes.guess_type(p)[0] or "application/octet-stream")
    route.fulfill(status=200, body=open(p, "rb").read(), headers={"content-type": ct, "access-control-allow-origin": "*"})

# per tab: the steps of the scene (the turns after `first`) done / partly / not done, and the shapes of the scene's area off the canvas
# (window.SketchpadInfo, the page's read-only summary at the end of ui.js)
STATE = r"""(first) => { const I = window.SketchpadInfo, st = I.steps(first), out = {};
  for (const id of ['combined', 'rules', 'vss', 'neural']) out[id] = Object.assign(st[id], I.area(id));
  return out; }"""

def load(pg):
    pg.goto(base, wait_until="domcontentloaded")
    pg.wait_for_function("() => { const t = document.querySelector('[data-rtab=combined]'); return t && !t.classList.contains('off'); }", timeout=900000)
    pg.wait_for_function("() => document.querySelector('#loadov').hidden", timeout=120000)
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 2 && !document.querySelector('#msgs .typing')", timeout=180000)

rows = []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--js-flags=--max-old-space-size=2048"])
    pg = b.new_page(viewport={"width": 1280, "height": 860})
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.add_init_script("try { if (!sessionStorage.getItem('t0')) { localStorage.clear(); sessionStorage.setItem('t0', '1'); } } catch (e) {}")
    pg.route(LIB + "**", cdn)
    pg.route("https://huggingface.co/**", lambda r: r.abort())
    load(pg)

    # 1. the menu
    pg.click("#open-examples"); pg.wait_for_timeout(400)
    head = pg.locator("#sbody #scenes-head")
    check("1. the menu has a Scenes heading", head.count() == 1)
    cards = pg.locator("#sbody .sc-list.scenes article.sc")
    check(f"1. one card per scene ({len(SCENES)})", cards.count() == len(SCENES), str(cards.count()))
    titles = [t.strip() for t in cards.locator("h4").all_inner_texts()]
    exp = [s["title"] + (" test" if s["test"] else "") for s in SCENES]
    check("1. the cards' titles, the test scenes marked 'test'", [t.replace("\n", " ") for t in titles] == exp, str(titles))
    pg.screenshot(path=f"{OUT}/menu_desktop_top.png")
    head.scroll_into_view_if_needed(); pg.wait_for_timeout(300)
    pg.screenshot(path=f"{OUT}/menu_desktop_scenes.png")
    pg.set_viewport_size({"width": 390, "height": 844}); pg.wait_for_timeout(500)
    last = cards.nth(cards.count() - 1).locator("[data-how=play]")
    last.scroll_into_view_if_needed(); pg.wait_for_timeout(300)
    vis = pg.evaluate("(el) => { const r = el.getBoundingClientRect(); return r.bottom <= innerHeight && r.top >= 0 && r.right <= innerWidth; }", last.element_handle())
    wide = pg.evaluate("() => document.documentElement.scrollWidth <= innerWidth + 1 && document.querySelector('#sbody').scrollWidth <= document.querySelector('#sbody').clientWidth + 1")
    check("1. phone width: the sheet scrolls to the last scene's Play button, no sideways scroll", vis and wide, f"visible {vis}, no sideways scroll {wide}")
    pg.screenshot(path=f"{OUT}/menu_phone_last.png")
    head.scroll_into_view_if_needed(); pg.wait_for_timeout(300)
    pg.screenshot(path=f"{OUT}/menu_phone_scenes.png")
    pg.set_viewport_size({"width": 1280, "height": 860}); pg.wait_for_timeout(400)
    pg.click("#close-sheet")
    pg.wait_for_timeout(300)

    todo = [s for s in SCENES if not ONLY or s["id"] in ONLY]
    for k, sc in enumerate(todo):
        if k and k % RELOAD == 0:
            load(pg)
        t0 = time.time()
        pg.click("[data-rtab=rules]"); pg.wait_for_timeout(200)
        pg.click("#open-examples"); pg.wait_for_timeout(300)
        pg.select_option("#sc-delay", "0")
        first = pg.evaluate("() => SketchpadInfo.turn()")
        nerr = len(errors)
        pg.locator(f"#sbody [data-sc={sc['id']}][data-how=play]").click()
        pg.wait_for_timeout(500)
        focus = pg.evaluate("() => SketchpadInfo.view() === 'focus' && document.querySelector('#canvas').viewBox.baseVal.width <= 900")
        names_off = pg.evaluate("() => document.querySelector('#names-btn').getAttribute('aria-pressed') === 'false'")
        pg.wait_for_function("() => /finished/.test((document.querySelector('#player') || {}).textContent || '')", timeout=1800000)
        pg.wait_for_function("() => !document.querySelector('#msgs .typing')", timeout=120000)
        pg.wait_for_timeout(300)
        st = pg.evaluate(STATE, first)
        tags = pg.evaluate("() => document.querySelectorAll('#layer .tag').length")
        check(f"2. {sc['id']}: plays to the end with no page error", len(errors) == nerr, "; ".join(errors[nerr:nerr + 3]))
        check(f"2. {sc['id']}: the view is the scene's own area", focus)
        check(f"2. {sc['id']}: the names are off (no name tag drawn)", names_off and tags == 0 and sc["names"] is False, f"switch off {names_off}, tags {tags}")
        check(f"3. {sc['id']}: Rules: nothing off the canvas ({st['rules']['shapes']} shapes)", not st["rules"]["off"], str(st["rules"]["off"]))
        rows.append((sc, st, time.time() - t0))
        print("     " + "  ".join(f"{lab} {st[i]['done']}+{st[i]['partly']}/{sc['n']}" for i, lab in TABS) + f"   ({time.time() - t0:.0f} s)", flush=True)
        if sc["id"] in SHOTS:
            pg.wait_for_timeout(4500)   # the highlight of the last step fades
            pg.screenshot(path=f"{OUT}/scene_{sc['id']}_rules.png")
            pg.click("[data-rtab=combined]"); pg.wait_for_timeout(400)
            pg.screenshot(path=f"{OUT}/scene_{sc['id']}_vssbert.png")
    check("4. no page error at the end", not errors, "; ".join(errors[:3]))
    b.close()

print("\nsteps done per tab (done fully + partly, of the scene's steps; the first step is \"Clear the canvas\")")
print(f"{'scene':<26}{'steps':>6}  " + "".join(f"{lab:>12}" for _, lab in TABS) + "   Rules shapes")
for sc, st, _ in rows:
    print(f"{(sc['title'] + (' (test)' if sc['test'] else '')):<26}{sc['n']:>6}  " + "".join(f"{str(st[i]['done']) + '+' + str(st[i]['partly']):>12}" for i, _ in TABS) + f"   {st['rules']['shapes']:>5}")
json.dump([{"id": sc["id"], "title": sc["title"], "test": sc["test"], "steps": sc["n"], "tabs": st, "seconds": round(dt)} for sc, st, dt in rows], open(f"{OUT}/scenes.json", "w"), indent=1)
print(f"\nscreenshots and scenes.json in {OUT}")
print("FAILED: " + "; ".join(fails) if fails else "all checks passed")
sys.exit(1 if fails else 0)
