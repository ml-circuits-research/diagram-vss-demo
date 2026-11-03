#!/usr/bin/env python3
"""test_neural_gate_ui.py: the SOP-BERT gate of the demo (the tab labelled SOP-BERT, id neural) in a real browser (Playwright, Chromium): SOP-BERT executes a request only when its
fitted confidence (docs/js/neural-confidence.js, docs/model/confidence/sop-bert.json, PRECISION_BERT.md), computed in the page from the
head logits of its own model calls, clears the threshold of the chosen level (default: the file's "cost" level, the safety threshold).
With VSS loaded the confidence includes the votes of VSS and the Rules (docs/js/vote-confidence.js columnSop, docs/model/confidence/vote3.json;
checked by test_vote_confidence.mjs); here VSS is blocked, so SOP-BERT falls back to its own confidence alone (sop-bert.json) and the details say so.

Run:  python3 training/sketch/test_neural_gate_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ on a free local port and loads the neural model (docs/model/neural/sop-bert, about 68 MB, run in WASM). The VSS model files
(docs/model/micro, docs/model/context) are blocked (memory), so VSS is "not available" here. transformers.js is the demo's version
(@huggingface/transformers@3.8.1), served from training/laptop/node_modules in place of cdn.jsdelivr.net (this sandbox cannot reach the CDN;
`npm install` in training/laptop). The cut is set to the BERT cutter (localStorage sop.cut) and the chat to SOP-BERT's replies (localStorage
sop.chat.tabs; the default is VSS-BERT's only) before the page loads. On the SOP-BERT tab:
  1. "Move Done below Start."                       one request the confidence clears: executed, no "Do it anyway";
  2. "Make Process green and connect it to Done."  the first request executed, the second not: "“it” was taken to mean Process", the
                                                   clearer command "Connect Process to Done.", Do it anyway and Edit; no numbers in the
                                                   chat (the confidence and the threshold are in the details);
  3. click "Do it anyway": the link Process -> Done appears in the SOP-BERT drawing, the button is disabled; "undo" takes exactly that back;
  4. the details of message 2: "SOP-BERT gate: safety threshold (it acts from confidence <the file's cost threshold>)", the confidences;
  5. SOP-BERT > Settings: a table of the levels boldest = cost1, very bold = cost2, bolder = cost5, cost (checked), more careful = cost20,
     execute all, with the thresholds of vote3.json (commands, questions) and each level's numbers on the calibration part (done right,
     confidently wrong, asked: vote3.json level_stats); choosing one is kept in localStorage, choosing the default removes it;
  6. with the Rules segmenter as the cut (other cut than the BERT cutter): the gate still works; the details say the cut head ran once more.
Screenshots of each step go to the directory (default: a temporary folder). Exit code 0 when everything passes.
"""
import functools, http.server, json, mimetypes, os, re, socketserver, sys, tempfile, threading

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "..", "..", "docs"))
TJS = os.path.normpath(os.path.join(HERE, "..", "laptop", "node_modules", "@huggingface", "transformers", "dist"))
LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="neural-gate-ui-")
os.makedirs(OUT, exist_ok=True)
SPEC = json.load(open(os.path.join(DOCS, "model", "confidence", "sop-bert.json")))
LV = SPEC["levels_out_of_fold"]
T_COST = LV["cost"]["threshold"]
VCOL = json.load(open(os.path.join(DOCS, "model", "confidence", "vote3.json")))["columns"]["sop"]
VOTE, VSTAT = VCOL["levels"], VCOL["level_stats"]
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
    """the demo's transformers.js version from the local npm copy: the package entry (dist/transformers.min.js) and its dist/ files (the
    ONNX runtime's .mjs and .wasm that transformers.js fetches from the same CDN folder)"""
    url = route.request.url.split("?")[0]
    rel = "transformers.min.js" if url.rstrip("/") == LIB else url[len(LIB):].lstrip("/").removeprefix("dist/")
    p = os.path.join(TJS, rel)
    if not os.path.isfile(p): return route.abort()
    ct = "application/wasm" if p.endswith(".wasm") else "text/javascript" if p.endswith((".js", ".mjs")) else (mimetypes.guess_type(p)[0] or "application/octet-stream")
    route.fulfill(status=200, body=open(p, "rb").read(), headers={"content-type": ct, "access-control-allow-origin": "*"})

# the last bot bubble's Neural line: its text, the requests not done (src, reason) and their buttons
LINE = """() => {
  const bs = [...document.querySelectorAll('#msgs .b.bot')], b = bs[bs.length - 1]; if (!b) return null;
  const rl = b.querySelector('.rl[data-reader=neural]');
  if (!rl) return { text: b.textContent, held: [] };
  return { text: rl.querySelector('.t').textContent, head: (rl.querySelector('.hhead') || {}).textContent || null, all: rl.textContent, held: [...rl.querySelectorAll('.held > li')].map(li => ({ src: li.querySelector('.src').textContent, why: li.querySelector('.why').textContent, how: (li.querySelector('.how') || {}).textContent || '', button: !!li.querySelector('button.anyway'), edit: !!li.querySelector('button.edit') })) };
}"""
LINKS = """() => +(((document.querySelector('#readout') || {}).textContent || '').match(/(\\d+) links?/) || [0, -1])[1]"""

def send(pg, text):
    n = pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
    pg.fill("#say", text); pg.click("#send-btn")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n, timeout=120000)
    pg.wait_for_timeout(300)
    return pg.evaluate(LINE)

def details(pg, k_from_end):
    pg.evaluate("k => { const bs = [...document.querySelectorAll('#msgs .b.bot [data-turn]')]; bs[bs.length - k].click(); }", k_from_end)
    pg.wait_for_timeout(400)
    return pg.evaluate("() => (document.querySelector('#sbody') || {}).textContent || ''")

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1280, "height": 860})
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.add_init_script("try { if (!sessionStorage.getItem('t0')) { localStorage.clear(); localStorage.setItem('sop.cut', 'bert'); localStorage.setItem('sop.chat.tabs', 'neural'); sessionStorage.setItem('t0', '1'); } } catch (e) {}")
    pg.route("**/model/micro/**", lambda r: r.abort())
    pg.route("**/model/context/**", lambda r: r.abort())
    pg.route(LIB + "**", cdn)
    pg.route("https://huggingface.co/**", lambda r: r.abort())
    pg.goto(base, wait_until="domcontentloaded")
    # Neural ready (its tab is enabled) and the start messages read
    pg.wait_for_function("() => { const t = document.querySelector('[data-rtab=neural]'); return t && !t.classList.contains('off'); }", timeout=600000)
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=120000)
    pg.wait_for_function("() => [...document.querySelectorAll('#msgs .sys')].some(x => /SOP-BERT reader ready/.test(x.textContent))", timeout=600000)
    pg.click("[data-rtab=neural]"); pg.wait_for_timeout(300)

    r1 = send(pg, "Move Done below Start.")
    pg.screenshot(path=f"{OUT}/1_executed.png")
    check("1. a request the confidence clears is executed (no request held)", r1 is not None and not r1["held"] and "Moved" in r1["text"], str(r1))

    r2 = send(pg, "Make Process green and connect it to Done.")
    pg.screenshot(path=f"{OUT}/2_asked.png")
    ok2 = r2 is not None and len(r2["held"]) == 1 and r2["held"][0]["button"] and "connect it to Done" in r2["held"][0]["src"] and r2["head"] == "Not done, because I am not sure what you meant:"
    check("2. one request executed, the other not done with a reason and a button", ok2, str(r2))
    why = r2["held"][0]["why"] if r2 and r2["held"] else ""
    check("2. the reason is in plain words (the shape 'it' was taken to mean, the name not written)", bool(re.search(r"“it” was taken to mean \w+; the name was not written|was taken from the conversation; the name was not written", why)), why)
    all2 = r2["all"] if r2 else ""
    check("2. no numbers and no reader names in the chat (they are in the details)", not re.search(r"\b\d", all2) and not re.search(r"SOP-BERT|VSS|Rules", all2), all2)
    check("2. the clearer command writes the name instead of 'it', with an Edit button", bool(r2 and r2["held"] and re.search(r"Connect Process to Done\.", r2["held"][0]["how"]) and r2["held"][0]["edit"]), str(r2))

    w0 = pg.evaluate(LINKS)
    n0 = pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
    pg.click("#msgs .held button.anyway")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n", arg=n0, timeout=30000)
    pg.wait_for_timeout(400)
    r3 = pg.evaluate("() => { const bs = [...document.querySelectorAll('#msgs .b.bot')]; return bs[bs.length - 1].textContent; }")
    w1 = pg.evaluate(LINKS)
    btn = pg.evaluate("() => { const x = document.querySelector('#msgs .held button.anyway'); return x && { disabled: x.disabled, text: x.textContent }; }")
    pg.screenshot(path=f"{OUT}/3_do_it_anyway.png")
    check("3. Do it anyway runs that reading (one more link)", w0 >= 0 and w1 == w0 + 1 and "Connected" in r3, f"links {w0} -> {w1}; reply {r3!r}")
    check("3. the button is disabled afterwards", bool(btn and btn["disabled"]), str(btn))
    send(pg, "undo")
    w2 = pg.evaluate(LINKS)
    check("3. undo takes the anyway step back (the link is gone again)", w2 == w0, f"links {w0} -> {w1} -> after undo {w2}")
    pg.screenshot(path=f"{OUT}/4_after_undo.png")

    det = details(pg, 3)
    pg.screenshot(path=f"{OUT}/5_details.png")
    check("4. details show the SOP-BERT gate, its level and threshold", f"SOP-BERT gate: safety threshold (it acts from confidence {T_COST:.4f})" in det and "executed 1 of 2 requests" in det and "not executed" in det, det[:600])
    check("4. the cut head was not run again with the BERT cutter", "run once more" not in det, "")
    check("4. the details say SOP-BERT used its own confidence alone because VSS is not available, and a held request's reason says so first", "VSS is not available, so SOP-BERT used its own confidence alone (confidence/sop-bert.json)" in det and "not executed: VSS is not available, so SOP-BERT decided alone and is not sure" in det, det[det.find("SOP-BERT gate"):][:400])
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)

    pg.click("[data-sub=settings]"); pg.wait_for_timeout(300)
    pg.wait_for_function("() => document.querySelectorAll('#rpanel input[name=neural-gate]').length > 0 && /for commands/.test(document.querySelector('#rpanel').textContent)", timeout=30000)
    levels = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=neural-gate]')].map(x => [x.value, x.checked, x.disabled])")
    pg.locator("#rpanel input[name=neural-gate]").first.scroll_into_view_if_needed()
    pg.screenshot(path=f"{OUT}/6_settings.png")
    COSTL = ["cost1", "cost2", "cost5", "cost", "cost20"]
    want = [[l, l == "cost", False] for l in COSTL + ["all"]]   # one confident mistake = 1, 2, 5 right answers (bolder), the default (10), more careful (20), execute all
    check("5. settings: boldest, very bold, bolder, safety threshold, more careful and execute all, cost checked", levels == want, f"{levels} vs {want}")
    lab = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=neural-gate]')].map(x => x.parentElement.textContent)")
    check("5. the levels say what they mean in plain words", all(n in t and f"one confident mistake counts as {c} right answer" in t for n, c, t in zip(["Boldest", "Very bold", "Bolder", "Safety threshold", "More careful"], [1, 2, 5, 10, 20], lab)), str(lab))
    check("5. each cost level shows the thresholds of vote3.json for commands and questions", all(f"{VOTE[l]['command']:.4f}" in t and f"{VOTE[l]['question']:.4f}" in t for l, t in zip(COSTL, lab)), str(lab))
    rows = pg.evaluate("() => [...document.querySelectorAll('#rpanel .lvt tbody tr')].map(tr => [...tr.querySelectorAll('td')].slice(1).map(td => td.textContent.trim()))")
    pc = lambda v: f"{v * 100:.1f}%"
    wantRows = [[pc(VSTAT[l]["calibration_oof"]["done_right"]), pc(VSTAT[l]["calibration_oof"]["confidently_wrong"]), pc(VSTAT[l]["calibration_oof"]["asked"])] for l in COSTL + ["all"]]
    check("5. the table shows each level's numbers on the calibration part (done right, confidently wrong, asked, with % signs)", rows == wantRows, f"{rows} vs {wantRows}")
    pg.check("#rpanel input[name=neural-gate][value='cost20']"); pg.wait_for_timeout(200)
    kept20 = pg.evaluate("() => { try { return localStorage.getItem('sop.neural.gate'); } catch (e) { return 'no storage'; } }")
    check("5. more careful is kept in localStorage", kept20 == "cost20", str(kept20))
    pg.check("#rpanel input[name=neural-gate][value='all']"); pg.wait_for_timeout(200)
    kept = pg.evaluate("() => { try { return localStorage.getItem('sop.neural.gate'); } catch (e) { return 'no storage'; } }")
    check("5. the chosen level is kept in localStorage", kept == "all", str(kept))
    pg.check("#rpanel input[name=neural-gate][value='cost']"); pg.wait_for_timeout(200)
    kept = pg.evaluate("() => { try { return localStorage.getItem('sop.neural.gate'); } catch (e) { return 'no storage'; } }")
    check("5. choosing the default removes it", kept is None, str(kept))
    pg.click("[data-sub=drawing]"); pg.wait_for_timeout(200)

    # another cut: the Rules segmenter (⋮ > Settings > Cutting)
    pg.click("#open-settings"); pg.wait_for_timeout(400)
    pg.check("#sbody input[name=cut-strategy][value='rules']"); pg.wait_for_timeout(200)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    r6 = send(pg, "Make Check orange and move it a bit.")
    pg.screenshot(path=f"{OUT}/7_rules_cut.png")
    check("6. with the Rules cut: one executed, one not done with its reason", r6 is not None and len(r6["held"]) == 1 and r6["held"][0]["button"] and r6["head"] == "Not done, because I am not sure what you meant:", str(r6))
    det6 = details(pg, 1)
    check("6. the details say the cut head ran once more for the confidence", "run once more over the message" in det6 and "cut by: Rules segmenter" in det6, det6[:600])
    pg.screenshot(path=f"{OUT}/8_rules_cut_details.png")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    check("no page error", not errors, "; ".join(errors[:3]))
    b.close()
httpd.shutdown()
print(f"screenshots: {OUT}")
print("PASS" if not fails else f"FAIL ({len(fails)})")
sys.exit(1 if fails else 0)
