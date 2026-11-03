#!/usr/bin/env python3
"""test_vss_gate_ui.py: the VSS gate of the demo in a real browser (Playwright, Chromium): VSS executes a request only when its
confidence clears the threshold of the chosen level (default "cost", the safety threshold that maximises the cost score, owner 2026-11-02
21:24). With SOP-BERT loaded the confidence includes the votes of SOP-BERT and the Rules (docs/js/vote-confidence.js columnVss,
docs/model/confidence/vote3.json; checked by test_vote_ui.py); here SOP-BERT is blocked, so VSS falls back to its own confidence alone
(docs/js/vss-confidence.js, docs/model/confidence/vss.json) and the details say so.

Run:  python3 training/sketch/test_vss_gate_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ on a free local port and loads the VSS models (docs/model/micro, about 23 MB); the neural model files and the transformers.js
library are blocked (memory). On the VSS tab, after the page's own start messages:
  1. "Move Done below Start."                          one request the confidence clears at the default level: executed, no "Do it anyway";
  2. "Make Process green and connect Start to Done."  the first request executed, the second not (VSS not sure: read in the links
                                                     world, which is often wrong), one button;
  3. click "Do it anyway": the link Start -> Done appears in the VSS drawing, the button is disabled; "undo" takes exactly that back;
  4. VSS › Settings shows the levels (bolder / safety threshold / more careful / execute all, the safety threshold checked, each with the
     thresholds of vote3.json for commands and questions); choosing another level is kept in localStorage, the default is not stored.
Screenshots of each step go to the directory (default: a temporary folder). Exit code 0 when everything passes.
"""
import functools, http.server, json, os, socketserver, sys, tempfile, threading

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

DOCS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "docs"))
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="vss-gate-ui-")
os.makedirs(OUT, exist_ok=True)
SPEC = json.load(open(os.path.join(DOCS, "model", "confidence", "vss.json")))["readers"]["vss_combined"]
T_COST = SPEC["levels"]["cost"]["threshold"]                                       # the default level's threshold
VOTE = json.load(open(os.path.join(DOCS, "model", "confidence", "vote3.json")))["columns"]["vss"]["levels"]   # the levels of the VSS tab
OTHER = "all"                                                                       # a level to choose in Settings
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

# the last bot bubble's VSS line: its text, the requests not done (src, reason) and their buttons
VSS_LINE = """() => {
  const bs = [...document.querySelectorAll('#msgs .b.bot')], b = bs[bs.length - 1]; if (!b) return null;
  const rl = [...b.querySelectorAll('.rl')].find(x => /^VSS(?!-BERT)/.test((x.querySelector('b') || {}).textContent || ''));
  if (!rl) return { text: b.textContent, held: [] };
  return { text: rl.querySelector('.t').textContent, held: [...rl.querySelectorAll('.held li')].map(li => ({ src: li.querySelector('.src').textContent, why: li.querySelector('.why').textContent, button: !!li.querySelector('button.anyway') })) };
}"""
VSS_DONE = """() => { const S = window.__vssState; return S; }"""

def send(pg, text):
    n = pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
    pg.fill("#say", text); pg.click("#send-btn")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n, timeout=60000)
    pg.wait_for_timeout(300)
    return pg.evaluate(VSS_LINE)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 860})
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.route("**/model/neural/**", lambda r: r.abort())
    pg.route("https://cdn.jsdelivr.net/npm/@huggingface/**", lambda r: r.abort())
    pg.route("https://huggingface.co/**", lambda r: r.abort())
    pg.goto(base, wait_until="domcontentloaded")
    # VSS ready (its tab is enabled) and the start messages read
    pg.wait_for_function("() => { const t = document.querySelector('[data-rtab=vss]'); return t && !t.classList.contains('off'); }", timeout=180000)
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=60000)
    pg.click("[data-rtab=vss]"); pg.wait_for_timeout(300)
    undo0 = pg.evaluate("() => (document.querySelector('#readout') || {}).textContent")

    r1 = send(pg, "Move Done below Start.")
    pg.screenshot(path=f"{OUT}/1_executed.png")
    check("1. a request the confidence clears is executed (no request held)", r1 is not None and not r1["held"] and "Moved" in r1["text"], str(r1))

    r2 = send(pg, "Make Process green and connect Start to Done.")
    pg.screenshot(path=f"{OUT}/2_asked.png")
    ok2 = r2 is not None and len(r2["held"]) == 1 and r2["held"][0]["button"] and "connect Start to Done" in r2["held"][0]["src"] and "Not sure about 1 of the 2 requests" in r2["text"]
    check("2. one request executed, the other not done with a reason and a button", ok2, str(r2))
    check("2. the reason is in plain words", bool(r2 and r2["held"] and any(w in r2["held"][0]["why"] for w in ("filled from context", "cut of this request", "world", "not understood", "unexplained"))), str(r2))

    # the VSS drawing before / after "Do it anyway"
    size_of = """() => +(((document.querySelector('#readout') || {}).textContent || '').match(/(\\d+) links?/) || [0, -1])[1]"""   # links in the VSS drawing
    w0 = pg.evaluate(size_of)
    steps0 = pg.evaluate("() => { const b = [...document.querySelectorAll('#msgs .b.bot')]; return b.length; }")
    pg.click("#msgs .held button.anyway")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n", arg=steps0, timeout=30000)
    pg.wait_for_timeout(400)
    r3 = pg.evaluate("() => { const bs = [...document.querySelectorAll('#msgs .b.bot')]; return bs[bs.length - 1].textContent; }")
    w1 = pg.evaluate(size_of)
    btn = pg.evaluate("() => { const x = document.querySelector('#msgs .held button.anyway'); return x && { disabled: x.disabled, text: x.textContent }; }")
    pg.screenshot(path=f"{OUT}/3_do_it_anyway.png")
    check("3. Do it anyway runs that reading (one more link)", w0 >= 0 and w1 == w0 + 1 and "Connected" in r3, f"links {w0} -> {w1}; reply {r3!r}")
    check("3. the button is disabled afterwards", bool(btn and btn["disabled"]), str(btn))
    # undoable: the VSS SOP subtab counts the steps that can be undone; undo takes back exactly the anyway turn
    pg.click("[data-sub=sop]"); pg.wait_for_timeout(200)
    n_before = pg.evaluate("() => +((document.querySelector('#rpanel .intro') || {}).textContent.match(/(\\d+) steps? can be undone/) || [0, -1])[1]")
    pg.click("[data-sub=drawing]"); pg.wait_for_timeout(200)
    send(pg, "undo")
    w2 = pg.evaluate(size_of)
    check("3. undo takes the anyway step back (the link is gone again)", w2 == w0, f"links {w0} -> {w1} -> after undo {w2}; undo steps before undo {n_before}")
    pg.screenshot(path=f"{OUT}/4_after_undo.png")

    # details of message 2: the gate block
    pg.evaluate("() => { const bs = [...document.querySelectorAll('#msgs .b.bot [data-turn]')]; bs[bs.length - 3].click(); }")
    pg.wait_for_timeout(400)
    det = pg.evaluate("() => (document.querySelector('#sbody') || {}).textContent || ''")
    pg.screenshot(path=f"{OUT}/5_details.png")
    check("details show the gate: executed and not executed requests with confidences", f"VSS gate: safety threshold (it acts from confidence {T_COST:.4f})" in det and "not executed" in det and "confidence" in det, det[:300])
    check("details say VSS used its own confidence alone (SOP-BERT did not read the message)", "SOP-BERT did not read this message, so VSS used its own confidence alone (confidence/vss.json)" in det, det[det.find("VSS gate"):][:400])
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)

    # settings: the precision level control
    pg.click("[data-sub=settings]"); pg.wait_for_timeout(300)
    pg.wait_for_function("() => /for commands/.test((document.querySelector('#rpanel') || {}).textContent || '')", timeout=30000)
    levels = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=vss-gate]')].map(x => [x.value, x.checked])")
    pg.screenshot(path=f"{OUT}/6_settings.png")
    check("settings: bolder / safety threshold / more careful / all, the safety threshold checked", levels == [["cost5", False], ["cost", True], ["cost20", False], ["all", False]], str(levels))
    lab = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=vss-gate]')].map(x => x.parentElement.textContent)")
    t5, t20 = VOTE["cost5"], VOTE["cost20"]
    check("settings: bolder and more careful in plain words, with the thresholds of vote3.json (commands, questions)", "bolder" in lab[0] and "one confident mistake counts as 5 right answers" in lab[0] and f"{t5['command']:.4f}" in lab[0] and f"{t5['question']:.4f}" in lab[0]
          and "more careful" in lab[2] and "counts as 20 right answers" in lab[2] and f"{t20['command']:.4f}" in lab[2], str(lab[:3]))
    pg.check("#rpanel input[name=vss-gate][value='cost20']"); pg.wait_for_timeout(200)
    kept20 = pg.evaluate("() => { try { return localStorage.getItem('sop.vss.gate'); } catch (e) { return 'no storage'; } }")
    check("settings: more careful is kept in localStorage", kept20 == "cost20", str(kept20))
    pg.check(f"#rpanel input[name=vss-gate][value='{OTHER}']"); pg.wait_for_timeout(200)
    kept = pg.evaluate("() => { try { return localStorage.getItem('sop.vss.gate'); } catch (e) { return 'no storage'; } }")
    check(f"settings: the chosen level ({OTHER}) is kept in localStorage", kept == OTHER, str(kept))
    pg.check("#rpanel input[name=vss-gate][value='cost']"); pg.wait_for_timeout(200)
    kept = pg.evaluate("() => { try { return localStorage.getItem('sop.vss.gate'); } catch (e) { return 'no storage'; } }")
    check("settings: back to the default, nothing stored", kept is None, str(kept))
    check("no page error", not errors, "; ".join(errors[:3]))
    b.close()
httpd.shutdown()
print(f"screenshots: {OUT}")
print("PASS" if not fails else f"FAIL ({len(fails)})")
sys.exit(1 if fails else 0)
