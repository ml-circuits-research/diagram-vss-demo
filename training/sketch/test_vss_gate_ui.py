#!/usr/bin/env python3
"""test_vss_gate_ui.py: the VSS gate of the demo in a real browser (Playwright, Chromium): VSS executes a request only when its
confidence clears the threshold of the chosen level (default "cost", the safety threshold that maximises the cost score, owner 2026-11-02
21:24). With SOP-BERT loaded the confidence includes the votes of SOP-BERT and the Rules (docs/js/vote-confidence.js columnVss,
docs/model/confidence/vote3.json; checked by test_vote_confidence.mjs); here SOP-BERT is blocked, so VSS falls back to its own confidence alone
(docs/js/vss-confidence.js, docs/model/confidence/vss.json) and the details say so.

Run:  python3 training/sketch/test_vss_gate_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ on a free local port and loads the VSS models (docs/model/micro, about 31 MB); the neural model files and the transformers.js
library are blocked (memory). The chat is set to show VSS's replies (localStorage sop.chat.tabs; the default is VSS-BERT's only). On the VSS
tab, after the page's own start messages:
  1. "Move Done below Start."                          one request the confidence clears at the default level: executed, no "Do it anyway";
  2. "Make Process green and connect Start to Done."  the first request executed, the second not (VSS not sure: read in the links
                                                     world, which is often wrong): the reply lists it with plain reasons (no
                                                     numbers, no reader names), a clearer command, Do it anyway and Edit;
  3. click "Do it anyway": the link Start -> Done appears in the VSS drawing, the button is disabled; "undo" takes exactly that back;
  4. VSS › Settings shows the levels as a table (boldest / very bold / bolder / safety threshold / more careful / execute all, the safety
     threshold checked, each with the thresholds of vote3.json for commands and questions and its numbers on the calibration part);
     choosing another level is kept in localStorage, the default is not stored.
Screenshots of each step go to the directory (default: a temporary folder). Exit code 0 when everything passes.
"""
import functools, http.server, json, os, re, socketserver, sys, tempfile, threading

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

DOCS = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "docs"))
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="vss-gate-ui-")
os.makedirs(OUT, exist_ok=True)
SPEC = json.load(open(os.path.join(DOCS, "model", "confidence", "vss.json")))["readers"]["vss_combined"]
T_COST = SPEC["levels"]["cost"]["threshold"]                                       # the default level's threshold
VCOL = json.load(open(os.path.join(DOCS, "model", "confidence", "vote3.json")))["columns"]["vss"]   # the levels of the VSS tab
VOTE, VSTAT = VCOL["levels"], VCOL["level_stats"]
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
  const rl = b.querySelector('.rl[data-reader=vss]');
  if (!rl) return { text: b.textContent, held: [] };
  return { text: rl.querySelector('.t').textContent, head: (rl.querySelector('.hhead') || {}).textContent || null, all: rl.textContent, held: [...rl.querySelectorAll('.held > li')].map(li => ({ src: li.querySelector('.src').textContent, why: li.querySelector('.why').textContent, how: (li.querySelector('.how') || {}).textContent || '', button: !!li.querySelector('button.anyway'), edit: !!li.querySelector('button.edit') })) };
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
    pg.add_init_script("try { if (!sessionStorage.getItem('t0')) { localStorage.clear(); localStorage.setItem('sop.chat.tabs', 'vss'); sessionStorage.setItem('t0', '1'); } } catch (e) {}")
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
    ok2 = r2 is not None and len(r2["held"]) == 1 and r2["held"][0]["button"] and "connect Start to Done" in r2["held"][0]["src"] and r2["head"] == "Not done, because I am not sure what you meant:"
    check("2. one request executed, the other not done with a reason and a button", ok2, str(r2))
    check("2. the reason is in plain words (CLARIFY_DESIGN.md design B: no numbers, no reader names in the chat)", bool(r2 and r2["held"] and any(w in r2["held"][0]["why"] for w in ("was taken to mean", "taken from the conversation", "not sure where", "not sure what kind", "not understood", "unexplained", "fit no part", "could not be checked", "often read wrong", "often wrong"))) and not re.search(r"\b\d", r2["all"]) and not re.search(r"SOP-BERT|VSS|Rules", r2["all"]), str(r2))
    check("2. the held request has a clearer command and an Edit button", bool(r2 and r2["held"] and r2["held"][0]["how"] and r2["held"][0]["edit"]), str(r2))

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
    check("details say VSS used its own confidence alone because SOP-BERT is not available, and a held request's reason says so first", "SOP-BERT is not available, so VSS used its own confidence alone (confidence/vss.json)" in det and "not executed: SOP-BERT is not available, so VSS decided alone and is not sure" in det, det[det.find("VSS gate"):][:400])
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)

    # settings: the precision level control
    pg.click("[data-sub=settings]"); pg.wait_for_timeout(300)
    pg.wait_for_function("() => /for commands/.test((document.querySelector('#rpanel') || {}).textContent || '')", timeout=30000)
    levels = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=vss-gate]')].map(x => [x.value, x.checked])")
    pg.screenshot(path=f"{OUT}/6_settings.png")
    COSTL = ["cost1", "cost2", "cost5", "cost", "cost20"]
    check("settings: boldest / very bold / bolder / safety threshold / more careful / all, the safety threshold checked", levels == [[l, l == "cost"] for l in COSTL + ["all"]], str(levels))
    lab = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=vss-gate]')].map(x => x.parentElement.textContent)")
    check("settings: each level in plain words, with the thresholds of vote3.json (commands, questions)", all(n in t and f"one confident mistake counts as {c} right answer" in t and f"{VOTE[l]['command']:.4f}" in t and f"{VOTE[l]['question']:.4f}" in t
          for n, c, l, t in zip(["Boldest", "Very bold", "Bolder", "Safety threshold", "More careful"], [1, 2, 5, 10, 20], COSTL, lab)), str(lab))
    rows = pg.evaluate("() => [...document.querySelectorAll('#rpanel .lvt tbody tr')].map(tr => [...tr.querySelectorAll('td')].slice(1).map(td => td.textContent.trim()))")
    pc = lambda v: f"{v * 100:.1f}%"
    wantRows = [[pc(VSTAT[l]["calibration_oof"]["done_right"]), pc(VSTAT[l]["calibration_oof"]["confidently_wrong"]), pc(VSTAT[l]["calibration_oof"]["asked"])] for l in COSTL + ["all"]]
    check("settings: the table shows each level's numbers on the calibration part (done right, confidently wrong, asked, with % signs)", rows == wantRows, f"{rows} vs {wantRows}")
    pg.check("#rpanel input[name=vss-gate][value='cost2']"); pg.wait_for_timeout(200)
    kept2 = pg.evaluate("() => { try { return localStorage.getItem('sop.vss.gate'); } catch (e) { return 'no storage'; } }")
    check("settings: very bold (cost 2) is kept in localStorage", kept2 == "cost2", str(kept2))
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
