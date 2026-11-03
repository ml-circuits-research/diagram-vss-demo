#!/usr/bin/env python3
"""test_direct_edit_ui.py: direct editing on the drawing (docs/js/ui.js "Direct editing"; owner 2026-11-03) in a real browser (Playwright,
Chromium). The learned readers' models are blocked (the Rules tab draws), so it runs in seconds.

Run:  python3 training/sketch/test_direct_edit_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
On the Rules tab of the opening drawing:
  1. a click on Check selects it (a dashed frame); Delete removes it through the engine: the chat shows "Delete Check" and "Deleted Check.";
     undo brings it back in one step;
  2. Backspace in the message box does not delete the selected item; a click on the empty canvas clears the selection;
  3. a double-click on Process (label "Validate") opens an input over the label; typing "Verify" and Enter changes the label (the chat
     shows the command); Escape in the editor changes nothing;
  4. a double-click on Done (no label) adds one; a double-click on the arrow label "yes" changes it; a double-click on the free text
     MainTitle changes the title; undo takes the last change back.
Exit code 0 when everything passes.
"""
import functools, http.server, os, socketserver, sys, tempfile, threading
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "..", "..", "docs"))
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="direct-edit-ui-")
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

SHAPES = "() => [...document.querySelectorAll('#layer .shp')].map(g => g.dataset.name)"
LABEL = "n => { const g = document.querySelector(`#layer .shp[data-name=\"${n}\"]`); const t = g && g.querySelector('.lbl, .ftext'); return t ? t.textContent : null; }"
ELABEL = "() => [...document.querySelectorAll('#layer .edge .elbl')].map(t => t.textContent)"
LAST = "() => { const bs = [...document.querySelectorAll('#msgs .b')]; return bs.slice(-2).map(b => (b.querySelector('.txt, .t') || b).textContent.trim()); }"
def bot(pg): return pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
def wait_reply(pg, n): pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n, timeout=30000); pg.wait_for_timeout(300)
def center(pg, sel):
    r = pg.evaluate("s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }", sel)
    return r

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 860})
    errors = []; pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.add_init_script("try { if (!sessionStorage.getItem('t0')) { localStorage.clear(); localStorage.setItem('sop.chat.tabs', 'rules'); sessionStorage.setItem('t0', '1'); } } catch (e) {}")
    pg.route("**/model/**", lambda r: r.abort()); pg.route("https://cdn.jsdelivr.net/**", lambda r: r.abort()); pg.route("https://huggingface.co/**", lambda r: r.abort())
    pg.goto(base, wait_until="domcontentloaded")
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=60000)
    pg.click("[data-rtab=rules]"); pg.wait_for_timeout(300)

    # 1. select + Delete, undo
    x, y = center(pg, '#layer .shp[data-name="Check"] .body'); pg.mouse.click(x, y); pg.wait_for_timeout(200)
    check("1. a click on Check selects it", pg.evaluate("() => !!document.querySelector('#layer .shp[data-name=\"Check\"] .selbox')"))
    pg.screenshot(path=f"{OUT}/1_selected.png")
    n = bot(pg); pg.keyboard.press("Delete"); wait_reply(pg, n)
    last = pg.evaluate(LAST)
    check("1. Delete removes Check through the engine; the chat shows the command and 'Deleted Check.'", "Check" not in pg.evaluate(SHAPES) and last[0] == "Delete Check" and "Deleted Check" in last[1], str(last))
    n = bot(pg); pg.click("[data-say=Undo]"); wait_reply(pg, n)
    check("1. undo brings Check back in one step", "Check" in pg.evaluate(SHAPES))
    # 2. Backspace in the message box, a click on the empty canvas
    x, y = center(pg, '#layer .shp[data-name="Done"] .body'); pg.mouse.click(x, y); pg.wait_for_timeout(200)
    pg.click("#say"); pg.keyboard.type("ab"); pg.keyboard.press("Backspace"); pg.wait_for_timeout(300)
    check("2. Backspace in the message box does not delete the selected shape", "Done" in pg.evaluate(SHAPES) and pg.input_value("#say") == "a")
    pg.fill("#say", "")
    sv = pg.evaluate("() => { const r = document.querySelector('#canvas').getBoundingClientRect(); return [r.x + 12, r.y + r.height - 40]; }")
    pg.mouse.click(sv[0], sv[1]); pg.wait_for_timeout(200)
    check("2. a click on the empty canvas clears the selection", not pg.evaluate("() => !!document.querySelector('#layer .selbox')"))
    # 3. double-click a label, type, Enter; Escape cancels
    x, y = center(pg, '#layer .shp[data-name="Process"] .lbl'); pg.mouse.dblclick(x, y); pg.wait_for_timeout(300)
    check("3. a double-click on Process's label opens the editor with its text", pg.evaluate("() => { const i = document.querySelector('.inl-edit'); return i && i.value; }") == "Validate")
    pg.screenshot(path=f"{OUT}/3_editor.png")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
    check("3. Escape closes it without a change", not pg.query_selector(".inl-edit") and pg.evaluate(LABEL, "Process") == "Validate")
    pg.mouse.dblclick(x, y); pg.wait_for_timeout(300); pg.keyboard.press("Control+a"); pg.keyboard.type("Verify")
    n = bot(pg); pg.keyboard.press("Enter"); wait_reply(pg, n)
    check("3. typing 'Verify' and Enter changes the label through the engine", pg.evaluate(LABEL, "Process") == "Verify" and pg.evaluate(LAST)[0] == 'Label Process "Verify"', str(pg.evaluate(LAST)))
    # 4. a shape with no label, an arrow label, a free text
    x, y = center(pg, '#layer .shp[data-name="Done"] .body'); pg.mouse.dblclick(x, y); pg.wait_for_timeout(300); pg.keyboard.type("end")
    n = bot(pg); pg.keyboard.press("Enter"); wait_reply(pg, n)
    check("4. a double-click on Done (no label) adds one", pg.evaluate(LABEL, "Done") == "end")
    x, y = center(pg, '#layer .edge .elbl'); pg.mouse.dblclick(x, y); pg.wait_for_timeout(300); pg.keyboard.press("Control+a"); pg.keyboard.type("ok")
    n = bot(pg); pg.keyboard.press("Enter"); wait_reply(pg, n)
    check("4. a double-click on the arrow label 'yes' changes it", "ok" in pg.evaluate(ELABEL), str(pg.evaluate(ELABEL)))
    x, y = center(pg, '#layer .shp[data-name="MainTitle"] .ftext'); pg.mouse.dblclick(x, y); pg.wait_for_timeout(300); pg.keyboard.press("Control+a"); pg.keyboard.type("Orders")
    n = bot(pg); pg.keyboard.press("Enter"); wait_reply(pg, n)
    check("4. a double-click on the free text MainTitle changes the title", pg.evaluate(LABEL, "MainTitle") == "Orders")
    pg.screenshot(path=f"{OUT}/4_edited.png")
    n = bot(pg); pg.click("[data-say=Undo]"); wait_reply(pg, n)
    check("4. undo takes the last change back", pg.evaluate(LABEL, "MainTitle") == "Order flow")
    bad = [e for e in errors if "Failed to fetch" not in e]
    check("no page error (besides the blocked model files)", not bad, "; ".join(bad[:3]))
    b.close()
httpd.shutdown()
print(f"screenshots: {OUT}")
print("PASS" if not fails else f"FAIL ({len(fails)})")
sys.exit(1 if fails else 0)
