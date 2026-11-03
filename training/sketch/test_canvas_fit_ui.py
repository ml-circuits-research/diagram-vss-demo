#!/usr/bin/env python3
"""test_canvas_fit_ui.py: the automatic fit of the drawing (docs/js/ui.js renderCanvas, contentExtent; owner's bug report 2026-11-03: the
examples' drawings were crammed into the left of the screen) in a real browser (Playwright, Chromium). The learned readers' models are
blocked (not needed: the Rules tab draws), so it runs in seconds.

Run:  python3 training/sketch/test_canvas_fit_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
On the Rules tab, after "Clear the canvas" each time, three examples from the + menu (the scenarios Traffic light and Little house, and the
example sentence "Add three tiny red circles in a row below Process") at desktop width, and one at phone width (390 x 844). After each:
  - the drawing's bounding box (every shape on screen) lies inside the drawing area;
  - it is centred: the gaps left and right, and above and below, differ by at most 12% of the area's size (+ 6 px);
  - zoom in, then fit: the viewBox is the automatic one again (the zoom and pan apply on top of the fit).
No page error besides the blocked model files. Exit code 0 when everything passes.
"""
import functools, http.server, os, socketserver, sys, tempfile, threading

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "..", "..", "docs"))
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="fit-ui-")
os.makedirs(OUT, exist_ok=True)
fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + ("" if ok or not detail else f"\n     {detail}"))
    if not ok: fails.append(name)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=DOCS)); httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{httpd.server_address[1]}/"

BOX = """() => { const sv = document.querySelector('#canvas').getBoundingClientRect(), gs = [...document.querySelectorAll('#layer .shp')];
  if (!gs.length) return null; const rs = gs.map(g => g.getBoundingClientRect());
  const b = { l: Math.min(...rs.map(r => r.left)), r: Math.max(...rs.map(r => r.right)), t: Math.min(...rs.map(r => r.top)), b: Math.max(...rs.map(r => r.bottom)) };
  return { area: [sv.left, sv.right, sv.top, sv.bottom], box: [b.l, b.r, b.t, b.b], n: gs.length }; }"""
VB = "() => document.querySelector('#canvas').getAttribute('viewBox')"

def bot(pg): return pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
def say(pg, t):
    n = bot(pg); pg.fill("#say", t); pg.click("#send-btn")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n", arg=n, timeout=30000); pg.wait_for_timeout(300)
def scenario(pg, sc):
    pg.click("#open-examples"); pg.wait_for_timeout(300); pg.select_option("#sc-delay", "0")
    pg.click(f"[data-sc={sc}][data-how=play]")
    pg.wait_for_function("() => /finished/.test((document.querySelector('#player') || {}).textContent || '')", timeout=60000); pg.wait_for_timeout(500)
def quick(pg, text):
    pg.click("#open-examples"); pg.wait_for_timeout(300); n = bot(pg)
    pg.click(f"[data-quick='{text}']")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n", arg=n, timeout=30000); pg.wait_for_timeout(500)
def clear(pg):
    n = bot(pg); pg.click("[data-say='Clear the canvas']")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n", arg=n, timeout=30000); pg.wait_for_timeout(300)

def fitted(pg, name):
    r = pg.evaluate(BOX)
    if not r: check(f"{name}: something is drawn", False); return
    (L, R, T, B), (l, rr, t, b) = r["area"], r["box"]
    inside = l >= L - 0.5 and rr <= R + 0.5 and t >= T - 0.5 and b <= B + 0.5
    gl, gr, gt, gb = l - L, R - rr, t - T, B - b
    centred = abs(gl - gr) <= 0.12 * (R - L) + 6 and abs(gt - gb) <= 0.12 * (B - T) + 6
    check(f"{name}: the drawing ({r['n']} shapes) is inside the drawing area", inside, str(r))
    check(f"{name}: the drawing is centred (gaps left/right {gl:.0f}/{gr:.0f}, top/bottom {gt:.0f}/{gb:.0f})", centred, str(r))
    vb0 = pg.evaluate(VB); pg.click("#zoom-in"); vb1 = pg.evaluate(VB); pg.click("#zoom-fit")
    check(f"{name}: zoom in changes the view, fit returns to the automatic one", vb1 != vb0 and pg.evaluate(VB) == vb0, f"{vb0} {vb1} {pg.evaluate(VB)}")
    pg.screenshot(path=f"{OUT}/{name.replace(' ', '_')}.png")

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 860})
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.add_init_script("try { if (!sessionStorage.getItem('t0')) { localStorage.clear(); localStorage.setItem('sop.chat.tabs', 'rules'); sessionStorage.setItem('t0', '1'); } } catch (e) {}")
    pg.route("**/model/**", lambda r: r.abort()); pg.route("https://cdn.jsdelivr.net/**", lambda r: r.abort()); pg.route("https://huggingface.co/**", lambda r: r.abort())
    pg.goto(base, wait_until="domcontentloaded")
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=60000)
    pg.click("[data-rtab=rules]"); pg.wait_for_timeout(300)
    fitted(pg, "0 the opening drawing")
    clear(pg); scenario(pg, "traffic"); fitted(pg, "1 traffic light")
    clear(pg); scenario(pg, "house"); fitted(pg, "2 little house")
    clear(pg); quick(pg, "Add three tiny red circles in a row below Process"); fitted(pg, "3 three tiny circles")
    pg.set_viewport_size({"width": 390, "height": 844}); pg.wait_for_timeout(400)
    clear(pg); scenario(pg, "login"); fitted(pg, "4 phone login flowchart")
    bad = [e for e in errors if "Failed to fetch" not in e]
    check("no page error (besides the blocked model files)", not bad, "; ".join(bad[:3]))
    b.close()
httpd.shutdown()
print(f"screenshots: {OUT}")
print("PASS" if not fails else f"FAIL ({len(fails)})")
sys.exit(1 if fails else 0)
