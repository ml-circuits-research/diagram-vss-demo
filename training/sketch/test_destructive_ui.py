#!/usr/bin/env python3
"""test_destructive_ui.py: destructive requests are cautious by design, and a tab not at its safety threshold is visible (docs/js/ui.js
holdDestructiveIn / destructiveView / renderGateBadges; docs/js/logic.js holdDestructive; owner's session 2026-11-03) in a real browser
(Playwright, Chromium). The learned readers' models are blocked (the Rules tab reads), so it runs in seconds.

Run:  python3 training/sketch/test_destructive_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
  1. VSS-BERT was left on "execute all" (localStorage sop.combined.gate = all): an amber badge "VSS-BERT: execute all" is in the chat's header;
     a click on it opens VSS-BERT's Settings; "Back to the safety threshold" removes the badge and the stored level;
  2. on the Rules tab, "Delete the circles" (a description of two shapes) is held: nothing is deleted, the reply says "Delete Start and
     Done? Write their names, or press Do it anyway." and what Do it anyway would delete (the links included); Do it anyway deletes both;
  3. "Delete Process" (a name) is done at once.
Exit code 0 when everything passes.
"""
import functools, http.server, os, socketserver, sys, tempfile, threading
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "..", "..", "docs"))
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="destructive-ui-")
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
RULES_LINE = "() => { const bs = [...document.querySelectorAll('#msgs .b.bot')], b = bs[bs.length - 1], rl = b && b.querySelector('.rl[data-reader=rules]'); return rl ? rl.textContent : (b ? b.textContent : ''); }"
def bot(pg): return pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
def say(pg, t):
    n = bot(pg); pg.fill("#say", t); pg.click("#send-btn")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n, timeout=30000); pg.wait_for_timeout(300)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 860})
    errors = []; pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.add_init_script("try { if (!sessionStorage.getItem('t0')) { localStorage.clear(); localStorage.setItem('sop.chat.tabs', 'rules'); localStorage.setItem('sop.combined.gate', 'all'); sessionStorage.setItem('t0', '1'); } } catch (e) {}")
    pg.route("**/model/**", lambda r: r.abort()); pg.route("https://cdn.jsdelivr.net/**", lambda r: r.abort()); pg.route("https://huggingface.co/**", lambda r: r.abort())
    pg.goto(base, wait_until="domcontentloaded")
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=60000)
    # 1. the badge
    badges = pg.evaluate("() => [...document.querySelectorAll('#gate-badges .gbadge')].map(x => x.textContent)")
    check("1. a badge says VSS-BERT is on execute all", badges == ["VSS-BERT: execute all"] and pg.is_visible("#gate-reset"), str(badges))
    pg.screenshot(path=f"{OUT}/1_badge.png")
    pg.set_viewport_size({"width": 390, "height": 844}); pg.wait_for_timeout(300); pg.screenshot(path=f"{OUT}/1_badge_phone.png")
    check("1. ... also visible on a phone", pg.is_visible("#gate-badges .gbadge"))
    pg.set_viewport_size({"width": 1280, "height": 860}); pg.wait_for_timeout(300)
    pg.click("#gate-badges .gbadge"); pg.wait_for_timeout(300)
    check("1. a click on it opens VSS-BERT's Settings", pg.evaluate("() => [document.querySelector('#rtabs [aria-selected=true]').dataset.rtab, document.querySelector('#subtabs [aria-selected=true]').dataset.sub]") == ["combined", "settings"])
    pg.click("#gate-reset"); pg.wait_for_timeout(300)
    check("1. 'Back to the safety threshold' removes the badge and the stored level", pg.is_hidden("#gate-badges") and pg.evaluate("() => localStorage.getItem('sop.combined.gate')") is None)
    check("1. ... and VSS-BERT's Settings shows the safety threshold chosen", pg.evaluate("() => { const r = document.querySelector('input[name=comb-gate]:checked'); return r && r.value; }") == "cost")
    pg.click("[data-sub=drawing]"); pg.click("[data-rtab=rules]"); pg.wait_for_timeout(300)
    # 2. a description of two shapes is held
    say(pg, "Delete the circles")
    line = pg.evaluate(RULES_LINE)
    check("2. 'Delete the circles' deletes nothing", all(x in pg.evaluate(SHAPES) for x in ("Start", "Done")), str(pg.evaluate(SHAPES)))
    check("2. the reply lists them: 'Delete Start and Done? Write their names, or press Do it anyway.'", "Delete Start and Done? Write their names, or press Do it anyway." in line, line)
    check("2. the reply says exactly what Do it anyway would delete", "Do it anyway would delete Start and Done, and the links Start → Process and Check → Done." in line, line)
    pg.screenshot(path=f"{OUT}/2_held.png")
    n = bot(pg); pg.click(".held button.anyway >> nth=-1"); pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n", arg=n, timeout=30000); pg.wait_for_timeout(300)
    check("2. Do it anyway deletes both", not any(x in pg.evaluate(SHAPES) for x in ("Start", "Done")), str(pg.evaluate(SHAPES)))
    # 3. a name is done at once
    say(pg, "Delete Process")
    check("3. 'Delete Process' (a name) is done at once", "Process" not in pg.evaluate(SHAPES) and "Deleted" in pg.evaluate(RULES_LINE), pg.evaluate(RULES_LINE))
    bad = [e for e in errors if "Failed to fetch" not in e]
    check("no page error (besides the blocked model files)", not bad, "; ".join(bad[:3]))
    b.close()
httpd.shutdown()
print(f"screenshots: {OUT}")
print("PASS" if not fails else f"FAIL ({len(fails)})")
sys.exit(1 if fails else 0)
