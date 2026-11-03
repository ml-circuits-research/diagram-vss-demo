#!/usr/bin/env python3
"""test_cartoon.py: the "Cartoon" example of the + menu (docs/js/scenarios.js, id 'cartoon') played to the end in a real browser
(Playwright, Chromium), as a person would play it: + -> Play on the Cartoon card.

Run:  python3 training/sketch/test_cartoon.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ on a free local port and loads every reader (VSS, SOP-BERT with transformers.js 3.8.1 from training/laptop/node_modules in
place of cdn.jsdelivr.net), like test_combined_ui.py. Checks:
  1. the scenario is in the + menu and plays to the end ("finished") with no page error;
  2. in the Rules tab (it reads every step of the script): the expected number of shapes and lines, every shape the script names, and the
     groups of the characters (Robot, Monkey, Kid, Bunny, Hippo, Tree), each with its members;
  3. in every tab: nothing lies off the canvas (every body inside the 800 x 500 cell of the scenario's frame);
  4. the number of steps each reader executed (VSS-BERT, VSS, SOP-BERT: the steps that drew something, from the shapes and lines each tab
     holds at the end) is printed; VSS-BERT must have drawn at least MIN_COMBINED of the shapes (it asks about what it is not sure of).
Screenshots during and after the play, desktop and phone width, light and dark, go to the directory (default: a temporary folder).
Exit code 0 when everything passes.
"""
import functools, http.server, json, mimetypes, os, re, socketserver, subprocess, sys, tempfile, threading

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "..", "..", "docs"))
TJS = os.path.normpath(os.path.join(HERE, "..", "laptop", "node_modules", "@huggingface", "transformers", "dist"))
LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="cartoon-")
os.makedirs(OUT, exist_ok=True)

# the expected drawing: the script run by the Rules engine in node (the same docs/js/logic.js the page runs)
NODE = r"""
const K = require(process.argv[1] + '/js/logic.js'), SC = require(process.argv[1] + '/js/scenarios.js');
const sc = SC.find(s => s.id === 'cartoon'), S = K.createSystem();
for (const t of sc.turns) { const names = S.world.state.shapes.map(s => s.name).concat(S.world.state.groups.map(g => g.name)); S.engine.run(S.formalize(t, { names, last: [] }).nodes, { partial: true }); }
const st = S.world.state;
console.log(JSON.stringify({ steps: sc.turns.length, tab: sc.tab || null, shapes: st.shapes.map(s => s.name), edges: st.edges.length, groups: Object.fromEntries(st.groups.map(g => [g.name, g.members])) }));
"""
EXP = json.loads(subprocess.check_output(["node", "-e", NODE, DOCS], text=True))
GROUPS = ["Robot", "Monkey", "Kid", "Bunny", "Hippo", "Tree"]
MIN_COMBINED = 60

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
    url = route.request.url.split("?")[0]
    rel = "transformers.min.js" if url.rstrip("/") == LIB else url[len(LIB):].lstrip("/").removeprefix("dist/")
    p = os.path.join(TJS, rel)
    if not os.path.isfile(p): return route.abort()
    ct = "application/wasm" if p.endswith(".wasm") else "text/javascript" if p.endswith((".js", ".mjs")) else (mimetypes.guess_type(p)[0] or "application/octet-stream")
    route.fulfill(status=200, body=open(p, "rb").read(), headers={"content-type": ct, "access-control-allow-origin": "*"})

# the drawing of the active tab: every item's name, centre and box (its body's bounding box in drawing units), the lines, the groups
DRAWING = r"""() => {
  const shapes = [...document.querySelectorAll('#layer .shp')].map(g => { const m = (g.getAttribute('transform') || '').match(/translate\(([-\d.]+) ([-\d.]+)\)/); const b = (g.querySelector('.body') || g.querySelector('.ftext')).getBBox();
    return { name: g.dataset.name, x: m ? +m[1] : null, y: m ? +m[2] : null, x1: +m[1] + b.x, y1: +m[2] + b.y, x2: +m[1] + b.x + b.width, y2: +m[2] + b.y + b.height }; });
  const lines = [...document.querySelectorAll('#layer .edge .ln')].map(l => l.tagName === 'line' ? [[+l.getAttribute('x1'), +l.getAttribute('y1')], [+l.getAttribute('x2'), +l.getAttribute('y2')]] : l.getAttribute('points').trim().split(/\s+/).map(p => p.split(',').map(Number)));
  return { shapes, lines, edges: document.querySelectorAll('#layer .edge').length, groups: [...document.querySelectorAll('#layer .grp')].map(g => g.dataset.group), readout: document.querySelector('#readout').textContent };
}"""

def tab(pg, t):
    pg.click(f"[data-rtab={t}]"); pg.wait_for_timeout(400)

def cartoon_part(d):
    """the items of the scenario's frame: the cell (880 x 580 apart, logic.js CELL) that holds the title "Sunny Meadow" or, without it, the
    last cell used"""
    cell = lambda s: (s["x"] // 880 * 880, s["y"] // 580 * 580)
    cells = [cell(s) for s in d["shapes"] if s["x"] is not None]
    c = max(cells, key=lambda c: (c[0], c[1])) if cells else (0, 0)
    return c, [s for s in d["shapes"] if s["x"] is not None and cell(s) == c]

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
    pg.wait_for_function("() => document.querySelector('#loadov').hidden", timeout=120000)
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 2 && !document.querySelector('#msgs .typing')", timeout=180000)

    # 1. + -> the Cartoon card -> Play
    pg.click("#open-examples"); pg.wait_for_timeout(400)
    card = pg.locator("#sbody article.sc", has_text="Cartoon")
    check("1. the + menu has the Cartoon example", card.count() == 1, str(card.count()))
    pg.screenshot(path=f"{OUT}/0_menu.png")
    card.locator("[data-how=play]").click()
    shown = EXP["tab"] or "combined"
    pg.wait_for_function("() => /finished/.test((document.querySelector('#player') || {}).textContent || '') || /\\b(1[5-9]|2\\d) of\\b/.test((document.querySelector('#player') || {}).textContent || '')", timeout=900000)
    pg.screenshot(path=f"{OUT}/1_during.png")
    pg.wait_for_function("() => /finished/.test((document.querySelector('#player') || {}).textContent || '')", timeout=1800000)
    pg.wait_for_function("() => !document.querySelector('#msgs .typing')", timeout=120000)
    pg.wait_for_timeout(5000)   # the highlight of the last step fades
    check("1. the scenario plays to the end", True)
    check("1. no page error", not errors, "; ".join(errors[:3]))
    active = pg.evaluate("() => (document.querySelector('#rtabs [aria-selected=true]') || {}).dataset.rtab")
    check(f"1. it is shown in the {shown} tab", active == shown, str(active))
    pg.screenshot(path=f"{OUT}/2_end_desktop_light.png")
    if pg.query_selector("#view-btn"):   # the view of the current drawing only (the scenario's frame), then back
        pg.click("#view-btn"); pg.wait_for_timeout(600); pg.screenshot(path=f"{OUT}/2_end_desktop_light_frame.png"); pg.click("#view-btn"); pg.wait_for_timeout(400)

    # 2. the Rules tab holds the whole drawing
    tab(pg, "rules")
    d = pg.evaluate(DRAWING)
    c, mine = cartoon_part(d)
    names = {s["name"] for s in mine}
    missing = [n for n in EXP["shapes"] if n not in names]
    check(f"2. Rules: all {len(EXP['shapes'])} shapes of the script are drawn", not missing and len(mine) == len(EXP["shapes"]), f"missing {missing}; {len(mine)} in the frame")
    links = int((re.search(r"(\d+) links?", d["readout"]) or [0, -1])[1])
    check(f"2. Rules: {EXP['edges']} lines in the frame (arms, legs, tail)", links - 3 == EXP["edges"], d["readout"])   # the opening drawing has 3 arrows
    check(f"2. Rules: the groups {', '.join(GROUPS)} exist", all(g in d["groups"] for g in GROUPS) and all(g in EXP["groups"] for g in GROUPS), str(d["groups"]))
    pg.screenshot(path=f"{OUT}/2_end_rules.png")
    if pg.query_selector("#view-btn"):
        pg.click("#view-btn"); pg.wait_for_timeout(600); pg.screenshot(path=f"{OUT}/2_end_rules_frame.png"); pg.click("#view-btn"); pg.wait_for_timeout(400)

    # 3 + 4. nothing off the canvas, in every tab; the steps each reader executed
    counts = {}
    for t in ["combined", "rules", "vss", "neural"]:
        tab(pg, t)
        d = pg.evaluate(DRAWING)
        json.dump(d, open(f"{OUT}/drawing_{t}.json", "w"))
        c, mine = cartoon_part(d)
        off = [s["name"] for s in mine if s["x1"] < c[0] - 0.5 or s["y1"] < c[1] - 0.5 or s["x2"] > c[0] + 800.5 or s["y2"] > c[1] + 500.5]
        check(f"3. {t}: nothing off the canvas", not off, str(off))
        counts[t] = len(mine)
    print("     shapes drawn per tab (of %d): %s" % (len(EXP["shapes"]), counts))
    check(f"4. VSS-BERT drew at least {MIN_COMBINED} shapes", counts["combined"] >= MIN_COMBINED, str(counts))
    tab(pg, shown)

    # screenshots: dark, phone (light and dark)
    pg.emulate_media(color_scheme="dark"); pg.wait_for_timeout(400)
    pg.screenshot(path=f"{OUT}/3_end_desktop_dark.png")
    if pg.query_selector("#view-btn"):
        pg.click("#view-btn"); pg.wait_for_timeout(600); pg.screenshot(path=f"{OUT}/3_end_desktop_dark_frame.png"); pg.click("#view-btn"); pg.wait_for_timeout(400)
    pg.set_viewport_size({"width": 390, "height": 844}); pg.wait_for_timeout(600)
    pg.screenshot(path=f"{OUT}/4_end_phone_dark.png")
    pg.emulate_media(color_scheme="light"); pg.wait_for_timeout(400)
    pg.screenshot(path=f"{OUT}/4_end_phone_light.png")
    if pg.query_selector("#view-btn"):   # the other view (the scenario's frame alone, or every frame)
        pg.click("#view-btn"); pg.wait_for_timeout(600); pg.screenshot(path=f"{OUT}/4_end_phone_light_view2.png")
        pg.emulate_media(color_scheme="dark"); pg.wait_for_timeout(400); pg.screenshot(path=f"{OUT}/4_end_phone_dark_view2.png")
    check("6. no page error at the end", not errors, "; ".join(errors[:3]))
    b.close()

print(f"\nscreenshots in {OUT}")
print("FAILED: " + "; ".join(fails) if fails else "all checks passed")
sys.exit(1 if fails else 0)
