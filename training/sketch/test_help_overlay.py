#!/usr/bin/env python3
"""test_help_overlay.py: the Help overlay of the demo (docs/js/docs.js) in a real browser (Playwright, Chromium).

Run:  python3 training/sketch/test_help_overlay.py [--models]
      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ on a free local port. By default the model files (docs/model/micro, docs/model/neural) are blocked, so the test checks the
overlay alone and needs little memory; --models loads them as the live site does and also reports the page's long tasks.

What it checks (bug of 2026-11-02: after the page "Where things go" the sidebar took no clicks, because <h2 id="canvas"> of that page matched
the app's CSS rule for the drawing's svg #canvas, became position:absolute; inset:0 and lay over the sidebar):
  1. every help page: each of its ids is unique in the whole document (a page shares the document with the app);
  2. every help page: each sidebar link is the element a click at its centre reaches (document.elementsFromPoint);
  3. clicking through every sidebar entry with the mouse shows that page (desktop width), with no page error;
  4. Back, close (Esc), an example sentence, reopen, browser Back / Forward: the overlay is shown or hidden as the URL says, the app behind
     it is inert exactly while it is open, and the sidebar still takes clicks afterwards;
  5. phone width: the Pages menu opens and each of its entries can be clicked;
  6. a section link #help/<page>/<anchor> scrolls to the section inside the page; a section of the old Start here (#help/start/replies, ...)
     opens that section of Using the demo (docs.js ALIASES, 2026-11-03);
  7. no broken anchors: every link #help/<page>[/<anchor>] inside a help page, and every data-help button of the app, names a page of the
     sidebar (a removed page's id only through docs.js ALIASES, for the app's buttons) and, when it has one, an id inside that page.
Exit code 0 when everything passes.
"""
import functools, http.server, os, re, socketserver, sys, threading, time

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

DOCS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "docs"))
MODELS = "--models" in sys.argv
INIT = """window.__lt = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}"""

fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + ("" if ok or not detail else f"\n     {detail}"))
    if not ok: fails.append(name)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def serve():
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=DOCS))
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"

# one evaluate per page: ids of the page repeated elsewhere, and the sidebar links a click at their centre would not reach
PAGE_STATE = """() => {
  const page = document.querySelector('#docs-page'), dup = [];
  for (const e of page.querySelectorAll('[id]')) if (document.querySelectorAll(`[id="${e.id}"]`).length > 1) dup.push(e.id);
  const nav = document.querySelector('#docs-nav'), blocked = [];
  for (const a of nav.querySelectorAll('a')) {
    a.scrollIntoView({ block: 'nearest' });
    const r = a.getBoundingClientRect(), top = document.elementsFromPoint(r.x + r.width / 2, r.y + r.height / 2)[0];
    if (!top || top.closest('a') !== a) blocked.push(a.getAttribute('href') + ' -> ' + (top ? top.tagName + (top.id ? '#' + top.id : '') : 'nothing'));
  }
  const ids = [...page.querySelectorAll('[id]')].map(e => e.id);
  const links = [...page.querySelectorAll('a[href^="#help"], [data-help]')].map(a => a.getAttribute('href') || '#help/' + a.dataset.help);
  return { title: (document.querySelector('#docs-title') || {}).textContent, dup, blocked, ids, links };
}"""
LINK_AT = """h => { const a = document.querySelector(`#docs-nav a[href="${h}"]`); a.scrollIntoView({ block: 'nearest' }); const r = a.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, t: a.textContent }; }"""
STATE = """() => { const d = document.querySelector('#docs'), app = document.querySelector('.app'); return { url: location.href, hash: location.hash, open: !!d && !d.hidden, appInert: !!app && app.inert, docsInert: !!d && !!d.closest('[inert]') }; }"""

def click_link(pg, href, timeout=4000):
    L = pg.evaluate(LINK_AT, href)
    t0 = time.time(); pg.mouse.click(L["x"], L["y"])
    try:
        pg.wait_for_function("t => (document.querySelector('#docs-title') || {}).textContent === t", arg=L["t"], timeout=timeout)
        return True, (time.time() - t0) * 1000
    except Exception:
        return False, (time.time() - t0) * 1000

def main():
    httpd, base = serve()
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 1280, "height": 860})
        pg = ctx.new_page(); errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.on("crash", lambda: errors.append("renderer crashed"))
        if not MODELS:
            pg.route("**/model/micro/**", lambda r: r.abort()); pg.route("**/model/neural/**", lambda r: r.abort())
        pg.add_init_script(INIT)
        pg.goto(base, wait_until="domcontentloaded")
        pg.click("#help-btn")   # at once, while the models load
        hrefs = pg.eval_on_selector_all("#docs-nav a[href^='#help']", "as => as.map(a => a.getAttribute('href'))")
        check(f"the sidebar lists the help pages ({len(hrefs)})", len(hrefs) >= 15)

        # 1, 2, 3: every page, reached by a mouse click on its sidebar entry
        dups, blocked, missed, slow, ids_of, links_of = {}, {}, [], [], {}, {}
        for h in hrefs:
            ok, ms = click_link(pg, h)
            if not ok: missed.append(h)
            slow.append(ms)
            s = pg.evaluate(PAGE_STATE)
            if s["dup"]: dups[h] = s["dup"]
            if s["blocked"]: blocked[h] = s["blocked"][:3]
            ids_of[h.split("/")[1]] = set(s["ids"]); links_of[h] = s["links"]
        check("every page: its ids are unique in the document", not dups, str(dups))
        check("every page: every sidebar link takes the click at its centre", not blocked, str(blocked))
        ok, _ = click_link(pg, "#help/where"); pg.evaluate("() => { document.querySelector('#docs-nav').scrollTop = 0; }"); ok2, _ = click_link(pg, "#help/draw")
        check("from the page \"Where things go\", a click on \"What you can draw\" (higher in the sidebar) shows it", ok and ok2)
        check(f"clicking each of the {len(hrefs)} sidebar entries shows its page", not missed, "not shown: " + ", ".join(missed))
        print(f"     click -> page shown: median {sorted(slow)[len(slow) // 2]:.0f} ms, max {max(slow):.0f} ms")

        # 7: no broken anchors (links inside the pages; the app's data-help buttons, which may name a removed page through docs.js ALIASES)
        def broken(link, aliases=None):
            parts = (link.split("/") + [None, None])[1:3]
            pid, anchor = parts[0], parts[1]
            if pid not in ids_of and aliases and pid in aliases:
                pid, anchor = aliases[pid][0], anchor or (aliases[pid][1] if len(aliases[pid]) > 1 else None)
            if pid not in ids_of: return "no such page"
            return None if not anchor or anchor in ids_of[pid] else "no such section"
        bad = [f"{h} -> {l}: {why}" for h, ls in links_of.items() for l in ls for why in [broken(l)] if why]
        check(f"no broken anchors: every #help link inside the pages names a page and a section of it ({sum(len(v) for v in links_of.values())} links)", not bad, "; ".join(bad[:12]))
        aliases = pg.evaluate("() => (window.DocsKit && window.DocsKit.aliases) || {}")
        src = "".join(open(os.path.join(DOCS, f), encoding="utf-8").read() for f in ("index.html", "js/ui.js"))
        app_help = sorted(set(re.findall(r'data-help="([\w-]+)"', src)) | set(pg.eval_on_selector_all("[data-help]", "es => es.filter(e => !e.closest('#docs')).map(e => e.dataset.help)")))
        bad_app = [h + ": " + why for h in app_help for why in [broken("#help/" + h, aliases)] if why]
        check(f"the app's help buttons (index.html, ui.js: {len(app_help)}) open a page", not bad_app, ", ".join(bad_app))

        # 4: Back, close, an example sentence, reopen, browser Back / Forward
        for _ in range(3): pg.click("#docs-back")
        pg.wait_for_timeout(300)
        s = pg.evaluate(STATE); check("Back (x3) stays in the overlay", s["open"] and s["hash"].startswith("#help/"), str(s))
        pg.keyboard.press("Escape"); pg.wait_for_timeout(600)
        s = pg.evaluate(STATE); check("Esc closes the overlay; the app is not inert", not s["open"] and not s["appInert"] and not s["hash"].startswith("#help"), str(s))
        pg.click("#open-examples"); pg.click("#sbody [data-quick]"); pg.wait_for_timeout(300)
        pg.click("#help-btn"); pg.wait_for_timeout(200)
        s = pg.evaluate(STATE); check("reopened after an example: open, app inert, overlay not inert", s["open"] and s["appInert"] and not s["docsInert"], str(s))
        ok, _ = click_link(pg, hrefs[3]); ok2, _ = click_link(pg, hrefs[-1])
        check("after reopening, sidebar clicks work (incl. the page that broke it)", ok and ok2)
        pg.go_back(); pg.wait_for_timeout(300); pg.go_back(); pg.wait_for_timeout(300); pg.go_back(); pg.wait_for_timeout(600)
        s = pg.evaluate(STATE); check("browser Back past the first help page closes the overlay", not s["open"] and not s["appInert"], str(s))
        pg.go_forward(); pg.wait_for_timeout(400)
        s = pg.evaluate(STATE); check("browser Forward reopens it; the app is inert again", s["open"] and s["appInert"] and not s["docsInert"], str(s))
        ok, _ = click_link(pg, hrefs[5]); check("the sidebar takes clicks after Back / Forward", ok)
        pg.keyboard.press("Escape"); pg.wait_for_timeout(600)

        # 6: a section link
        pg.evaluate("() => { location.hash = '#help/where/canvas-parts'; }"); pg.wait_for_timeout(500)
        top = pg.evaluate("() => { const h = document.querySelector('#docs-page [id=\"canvas-parts\"]'), m = document.querySelector('#docs-main'); return h ? Math.round(h.getBoundingClientRect().top - m.getBoundingClientRect().top) : null; }")
        check("#help/where/canvas-parts scrolls to that section", top is not None and abs(top) < 40, f"section top relative to the page: {top}")
        pg.keyboard.press("Escape"); pg.wait_for_timeout(600)
        # 6b: a section of the old Start here (moved to Using the demo on 2026-11-03) through docs.js ALIASES
        moved = [k for k in aliases if k.startswith("start/")]
        bad_moved = []
        for k in moved:
            pg.evaluate("h => { location.hash = h; }", "#help/" + k); pg.wait_for_timeout(400)
            r = pg.evaluate("a => { const t = (document.querySelector('#docs-title') || {}).textContent, h = document.querySelector(`#docs-page [id=\"${a}\"]`), m = document.querySelector('#docs-main'); return { t, top: h ? Math.round(h.getBoundingClientRect().top - m.getBoundingClientRect().top) : null, end: m.scrollTop + m.clientHeight >= m.scrollHeight - 2 }; }", aliases[k][1])
            # the last section cannot reach the top of the pane: then the page is scrolled to its end and the section is in view
            if r["t"] != "Using the demo" or r["top"] is None or not (abs(r["top"]) <= 40 or (r["end"] and 0 <= r["top"] < 700)): bad_moved.append(f"{k}: {r}")
            pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
        check(f"the old Start here sections (#help/start/<section>, {len(moved)}) open that section of Using the demo", moved and not bad_moved, "; ".join(bad_moved))

        # 5: phone width
        pg.set_viewport_size({"width": 390, "height": 800}); pg.click("#help-btn"); pg.wait_for_timeout(200)
        pmiss = []
        for h in hrefs:
            pg.click("#docs-menu-btn")
            ok, _ = click_link(pg, h)
            if not ok: pmiss.append(h)
        check("phone width: each entry of the Pages menu can be clicked", not pmiss, ", ".join(pmiss))
        check("no page error", not errors, "; ".join(errors[:5]))
        lt = pg.evaluate("window.__lt")
        print(f"     long tasks in the page: {len(lt)}, longest {max([x[1] for x in lt], default=0)} ms, total {sum(x[1] for x in lt)} ms" + (" (models blocked)" if not MODELS else ""))
        b.close()
    httpd.shutdown()
    print(f"\n{'all passed' if not fails else str(len(fails)) + ' failed'}")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
