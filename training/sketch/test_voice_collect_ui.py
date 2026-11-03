#!/usr/bin/env python3
"""test_voice_collect_ui.py: the dictation dock (docs/js/voice.js) and the collected requests (docs/js/collect.js, format 2) in a real
browser (Playwright, Chromium), with the browser's speech and translation APIs mocked by an init script.

Run:  python3 training/sketch/test_voice_collect_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ on a free local port and loads VSS and SOP-BERT (as test_clarify_ui.py: transformers.js 3.8.1 from training/laptop/node_modules
in place of cdn.jsdelivr.net). The init script replaces SpeechRecognition (a fake that the test drives: window.__say(text, final), __end()
(the browser ends a session after a pause), __err(code) (an error, then the end)), Translator (Chrome's on-device API: ro <-> en available,
fr -> en unavailable, a small dictionary) and speechSynthesis (records what would be read; speaking until window.__endSpeech()). Checks:
  1. layout (owner, 12:22): the drawing fills its column edge to edge (the background panel's left and right edges are the board's, its wash
     covers the rest, no padding); the dock sits under it, level with the message box, one row (the mic, the language code "RO", the
     transcript; no English row: the English goes into the message box); no popup left;
  2. the settings popover: opens from the language code above the dock without moving anything, has the language list, the switches and
     what the browser supports; closes on a click outside and on Escape (the focus back on the code); a choice is kept;
  3. speech: the mic starts continuous recognition in ro-RO; the interim transcript shows live in the row; the English goes straight into
     the message box; "fă Done roșu trimite" sends
     "make Done red" (the command word is not sent), the chat shows the Romanian original under it, the dock empties and keeps listening;
     with "read replies aloud" on, the reply is read in Romanian and recognition pauses while it is spoken, then resumes;
  4. the collected entry (format 2): the English text, the Romanian original, via voice, translated on the device, the names, the model
     versions, VSS-BERT's decision per request with its confidence, the reply; no reader's readings;
  5. staying on: the browser ends a session after a pause -> a new one starts by itself and the text is kept; a no-speech error -> a new
     session; the listening indicator stays on; "șterge" clears the dock and the message box; "not-allowed" stops listening and says why
     in the note at the end of the row;
     "oprește" stops listening and nothing restarts;
  6. no translation (French): the dock's note says so, puts nothing in the message box, and sends nothing (Enter, the send button, a spoken
     "send"); English written in the message box is sent (translation by "user") and the note goes away; nothing goes online; an invalid tag is
     refused; a non-English message typed straight into the message box is sent, with a one-time hint;
  7. the events: Undo (toolbar) right after a message -> "undo-next"; "fă-o oricum" presses the last Do it anyway -> "anyway"; "editează"
     presses the last Edit, then a spoken "trimite" sends the message box -> "edit-sent" (when the shipped models hold a request);
  8. ⋮ › Settings › Collected requests: the count, the preview, Download as JSONL (format 2; the converter reads it), Clear with an in-page
     confirmation, the switch;
  9. after a reload: the choices are kept, and since the mic was on, "Resume listening" starts it again in one tap;
 10. phone width (390 x 844): the dock just above the message box, one row, the popover inside the screen, no horizontal scroll;
 11. no page error.
Screenshots go to the directory (default: a temporary folder). Exit code 0 when everything passes.
"""
import functools, http.server, json, mimetypes, os, re, socketserver, subprocess, sys, tempfile, threading

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "..", "..", "docs"))
TJS = os.path.normpath(os.path.join(HERE, "..", "laptop", "node_modules", "@huggingface", "transformers", "dist"))
LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="voice-ui-")
os.makedirs(OUT, exist_ok=True)
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

# the browser APIs, mocked before any script of the page runs
MOCKS = r"""
(() => {
  try { if (!sessionStorage.getItem('t0')) { localStorage.clear(); sessionStorage.setItem('t0', '1'); } } catch (e) {}
  const DICT = { 'Într-un editor de diagrame:': 'In a diagram editor:', 'Într-un editor de diagrame: fă Done roșu': 'In a diagram editor: make Done red', 'fă Done roșu': 'make Done red', 'șterge Start': 'delete Start', 'fă Start albastru': 'make Start blue', 'fă Start albastru verde': 'make Start blue green' };
  window.__tr = [];
  window.Translator = {
    availability: async ({ sourceLanguage: s, targetLanguage: t }) => ((s === 'ro' && t === 'en') || (s === 'en' && t === 'ro')) ? 'available' : 'unavailable',
    create: async ({ sourceLanguage: s, targetLanguage: t }) => {
      if (!((s === 'ro' && t === 'en') || (s === 'en' && t === 'ro'))) throw new Error('unavailable pair');
      return { translate: async x => { window.__tr.push([s, t, x]); return s === 'en' ? 'RO: ' + x : (DICT[x] || x); } };
    }
  };
  window.__sr = [];
  class FakeSR {
    constructor() { this.lang = ''; this.continuous = false; this.interimResults = false; window.__sr.push(this); }
    start() { this.started = true; window.__srActive = this; }
    stop() { if (!this.started) return; this.started = false; setTimeout(() => this.onend && this.onend(), 0); }
    abort() { this.stop(); }
  }
  window.SpeechRecognition = FakeSR; window.webkitSpeechRecognition = FakeSR;
  window.__say = (text, final) => { const r = window.__srActive, res = [{ transcript: text }]; res.isFinal = !!final; r.onresult({ resultIndex: 0, results: [res] }); };
  // the browser ends the session by itself (silence, a minute gone): no stop() was called
  window.__end = () => { const r = window.__srActive; r.started = false; r.onend && r.onend(); };
  window.__err = code => { const r = window.__srActive; r.onerror && r.onerror({ error: code }); r.started = false; setTimeout(() => r.onend && r.onend(), 0); };
  window.__live = () => window.__sr.filter(r => r.started).length;
  window.__spoken = []; window.__speaking = false; window.__utt = null;
  try {
    const voices = [{ name: 'Ioana', lang: 'ro-RO', default: false }, { name: 'Samantha', lang: 'en-US', default: true }];
    window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; this.lang = ''; this.voice = null; } };   // a voice of the mock is not a real SpeechSynthesisVoice
    speechSynthesis.getVoices = () => voices;
    Object.defineProperty(speechSynthesis, 'speaking', { configurable: true, get: () => window.__speaking });
    speechSynthesis.speak = u => { window.__spoken.push({ text: u.text, lang: u.lang, voice: u.voice && u.voice.name }); window.__speaking = true; window.__utt = u; };
    speechSynthesis.cancel = () => {};
    window.__endSpeech = () => { window.__speaking = false; const u = window.__utt; window.__utt = null; if (u && u.onend) u.onend(); };
  } catch (e) {}
})();
"""
NBOT = "() => document.querySelectorAll('#msgs .b.bot').length"
NME = "() => document.querySelectorAll('#msgs .b.me').length"
ENTRIES = "() => { try { return JSON.parse(localStorage.getItem('sop.collect.v1') || '[]'); } catch (e) { return null; } }"
LINE = """() => { const bs = [...document.querySelectorAll('#msgs .b.bot')], b = bs[bs.length - 1]; const rl = b && b.querySelector('.rl[data-reader=combined]');
  return rl ? { text: rl.querySelector('.t').textContent, held: [...rl.querySelectorAll('.held > li')].map(li => ({ key: li.dataset.held,
    anyway: !!li.querySelector('button.anyway') && !li.querySelector('button.anyway').disabled, edit: li.querySelector('button.edit') ? li.querySelector('button.edit').dataset.text : null })) } : null; }"""
ROWS = "() => ({ src: document.querySelector('#vd-src').value, note: document.querySelector('#dock .vd-st').textContent, box: document.querySelector('#say').value })"
MIC = "() => { const m = document.querySelector('.vd-mic'); return { on: m.getAttribute('aria-pressed') === 'true', paused: m.classList.contains('paused'), listening: document.querySelector('#dock').classList.contains('listening'), n: window.__sr.length, live: window.__live(), active: window.__srActive ? { lang: window.__srActive.lang, cont: window.__srActive.continuous, interim: window.__srActive.interimResults, started: !!window.__srActive.started } : null }; }"
TOAST = "() => document.querySelector('.vd-toast').textContent"
RECT = "s => { const r = document.querySelector(s).getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height }; }"

def wait_reply(pg, n):
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n, timeout=240000)
    pg.wait_for_timeout(400)

def send(pg, text):
    n = pg.evaluate(NBOT); pg.fill("#say", text); pg.click("#send-btn"); wait_reply(pg, n)
    return pg.evaluate(LINE)

def say(pg, text, final=True): pg.evaluate("([t, f]) => window.__say(t, f)", [text, final])

def shot(pg, name): pg.screenshot(path=f"{OUT}/{name}.png")

def ready(pg):
    pg.wait_for_function("() => { const t = document.querySelector('[data-rtab=combined]'); return t && !t.classList.contains('off'); }", timeout=900000)
    pg.wait_for_function("() => document.querySelector('#loadov').hidden", timeout=120000)   # the loading overlay is gone (loaded and checked)
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=180000)

def mic_on(pg):
    if not pg.evaluate(MIC)["on"]: pg.click(".vd-mic")
    pg.wait_for_function("() => window.__srActive && window.__srActive.started", timeout=5000)

def near(a, b, tol=1.5): return abs(a - b) <= tol

def end_speech(pg):
    """the mock's reading aloud ends; wait until listening has resumed (a new session: results never reach an aborted one)"""
    n = pg.evaluate("() => window.__sr.length")
    pg.evaluate("() => window.__endSpeech()")
    pg.wait_for_function("n => window.__sr.length > n && window.__srActive.started", arg=n, timeout=5000)

def wait_box(pg, text, timeout=10000):
    """wait until the message box holds text; on a timeout say what the dock and the mic were doing"""
    try: pg.wait_for_function("t => document.querySelector('#say').value === t", arg=text, timeout=timeout)
    except Exception:
        print(f"     waited for the message box to hold {text!r}: rows {pg.evaluate(ROWS)}, mic {pg.evaluate(MIC)}"); raise

TRY = ["Make Check red and put Done below it", "Make Process green and put Start below it", "Make Done orange and move Check next to it",
       "Make Start teal and move Process next to it"]

with sync_playwright() as p:
    b = p.chromium.launch(args=["--js-flags=--max-old-space-size=1536"])
    ctx = b.new_context(viewport={"width": 1280, "height": 860}, accept_downloads=True)
    pg = ctx.new_page()
    errors, outside = [], []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("dialog", lambda d: (errors.append(f"a browser dialog was opened: {d.type} {d.message}"), d.dismiss()))
    pg.add_init_script(MOCKS)
    pg.route(LIB + "**", cdn)
    pg.route("https://huggingface.co/**", lambda r: r.abort())
    pg.route("https://api.mymemory.translated.net/**", lambda r: (outside.append(r.request.url), r.abort()))
    pg.goto(base, wait_until="domcontentloaded")
    ready(pg)
    check("0. nothing collected from the opening message the page sends by itself", pg.evaluate(ENTRIES) == [], str(pg.evaluate(ENTRIES))[:200])

    # 1. layout
    check("1. no popup and no microphone button in the message row any more", pg.locator(".vx, #mic-btn, .vx-scrim").count() == 0)
    check("1. no English row in the dock (the English goes into the message box)", pg.locator("#vd-en, #dock .vd-out").count() == 0)
    stage, board, dock, comp = (pg.evaluate(RECT, s) for s in (".stage", ".board", "#dock", "#composer"))
    check("1. the dock is under the drawing, as wide as its column", near(dock["l"], stage["l"]) and near(dock["r"], stage["r"]) and near(dock["t"], stage["b"]), f"{dock} {stage}")
    check("1. the dock is level with the message box", near(dock["t"], comp["t"]) and near(dock["b"], comp["b"]), f"{dock} {comp}")
    rows = pg.evaluate("() => [...document.querySelectorAll('#dock .vd-row')].map(r => r.getBoundingClientRect().height)")
    names = pg.evaluate("() => { const n = document.querySelector('#dock .vd-names'); return n && !n.hidden ? { h: n.getBoundingClientRect().height, names: [...n.querySelectorAll('.vd-name')].map(b => b.textContent), wrap: getComputedStyle(n).flexWrap } : null; }")
    check("1. one row, slim: the mic, the language code and the transcript (and one line of name chips under it)", len(rows) == 1 and all(h <= 32 for h in rows) and dock["h"] <= 82
          and pg.locator("#dock .vd-row .vd-lang + #vd-src").count() == 1, f"{rows} {dock['h']}")
    check("1. the names on the drawing are chips on one line (scrolled sideways), under the row", names is not None and names["h"] <= 24 and names["wrap"] == "nowrap" and "Start" in names["names"] and "Process" in names["names"], str(names))
    pg.click("#dock .vd-name[data-name=Process]"); pg.wait_for_timeout(200)
    check("1. a tap on a chip puts the name into what was said", pg.input_value("#vd-src").strip() == "Process", pg.input_value("#vd-src"))
    pg.fill("#vd-src", ""); pg.dispatch_event("#vd-src", "input"); pg.fill("#say", ""); pg.wait_for_timeout(600)
    check("1. the language code says RO", pg.inner_text(".vd-lang").strip() == "RO" and pg.get_attribute(".vd-lang", "aria-haspopup") == "dialog")
    bd = pg.evaluate(RECT, "[data-name=Backdrop] .body")
    check("1. the drawing fills its column: the background panel's edges are the board's (no padding)", near(bd["l"], board["l"], 2) and near(bd["r"], board["r"], 2), f"panel {bd}, board {board}")
    check("1. the panel's wash covers the rest of the board, the panel has no outline", pg.locator("#frames path.wash").count() == 1
          and pg.evaluate("() => getComputedStyle(document.querySelector('[data-name=Backdrop] .body')).stroke") == "none")
    shot(pg, "01_desktop_dock_empty")

    # 2. the settings popover
    pg.click(".vd-lang"); pg.wait_for_selector("#vd-pop:not([hidden])")
    pop = pg.evaluate(RECT, "#vd-pop"); dock2 = pg.evaluate(RECT, "#dock")
    check("2. the popover opens above the dock and moves nothing", pop["b"] <= dock2["t"] + 0.5 and dock2 == dock and pop["w"] <= 320, f"{pop} {dock2}")
    info = pg.evaluate("() => { const d = document.querySelector('#vd-pop'); return { expanded: document.querySelector('.vd-lang').getAttribute('aria-expanded'), opts: [...d.querySelectorAll('#vd-lang option')].map(o => o.value),"
                       " prefs: [...d.querySelectorAll('[data-pref]')].map(c => c.dataset.pref), support: [...d.querySelectorAll('.vd-support li')].map(l => l.textContent), note: d.querySelector('.vd-note').textContent, cmds: d.querySelector('.vd-cmds').textContent }; }")
    check("2. Romanian and English first, a free BCP-47 field last", info["opts"][:2] == ["ro-RO", "en-US"] and info["opts"][-1] == "other" and len(info["opts"]) > 30, str(info["opts"][:5]))
    check("2. the switches: I speak English, send after a pause, read replies aloud, online translation", info["prefs"] == ["speakEnglish", "autoSend", "tts", "online"] and info["expanded"] == "true", str(info))
    sup = " | ".join(info["support"])
    check("2. what the browser supports: recognition, translation on this device, voices", "Speech recognition: yes" in sup and "Translation Romanian → English: yes, on this device" in sup and "Speech synthesis: 1 voice for Romanian" in sup, sup)
    check("2. the note about the browser vendor's servers; the commands", "vendor’s servers" in info["note"] and "trimite" in info["cmds"] and "oprește" in info["cmds"], info["note"] + " | " + info["cmds"])
    pg.check("#vd-pop [data-pref=speakEnglish]"); pg.wait_for_timeout(200)
    check("2. 'I speak English': the code says EN and the language list is disabled", pg.inner_text(".vd-lang").strip() == "EN" and pg.is_disabled("#vd-lang"), pg.inner_text(".vd-lang"))
    pg.uncheck("#vd-pop [data-pref=speakEnglish]"); pg.wait_for_timeout(200)
    check("2. ... turned off: back to RO", pg.inner_text(".vd-lang").strip() == "RO" and not pg.is_disabled("#vd-lang"))
    pg.check("#vd-pop [data-pref=tts]")
    shot(pg, "02_desktop_popover")
    pg.mouse.click(300, 300)
    check("2. a click outside closes it", pg.is_hidden("#vd-pop") and pg.get_attribute(".vd-lang", "aria-expanded") == "false")
    pg.click(".vd-lang"); pg.wait_for_selector("#vd-pop:not([hidden])"); pg.keyboard.press("Escape")
    check("2. Escape closes it, the focus back on the language code", pg.is_hidden("#vd-pop") and pg.evaluate("() => document.activeElement.classList.contains('vd-lang')"))
    check("2. the choice is kept", pg.evaluate("() => JSON.parse(localStorage.getItem('sop.voice')).tts") is True)

    # 3. speech
    pg.click(".vd-mic")
    m = pg.evaluate(MIC)
    check("3. the mic starts continuous recognition in ro-RO with interim results", m["on"] and m["listening"] and m["active"] == {"lang": "ro-RO", "cont": True, "interim": True, "started": True}, str(m))
    say(pg, "fă Done", False)
    check("3. the interim transcript shows live in the row", pg.input_value("#vd-src") == "fă Done", pg.input_value("#vd-src"))
    shot(pg, "03_desktop_listening")
    say(pg, "fă Done roșu")
    pg.wait_for_function("() => document.querySelector('#say').value === 'make Done red'", timeout=10000)
    check("3. translated with the domain context ('Într-un editor de diagrame: ' before it, taken off after)", pg.evaluate("() => window.__tr.some(x => x[2] === 'Într-un editor de diagrame: fă Done roșu')"), str(pg.evaluate("() => window.__tr.slice(-4)")))
    check("3. a final transcript: the message box gets the English at once; no note on the dock", pg.evaluate(ROWS)["note"] == "", str(pg.evaluate(ROWS)))
    shot(pg, "04_desktop_translated")
    n0, nm = pg.evaluate(NBOT), pg.evaluate(NME)
    say(pg, "trimite")
    wait_reply(pg, n0)
    me = pg.evaluate("() => { const m = [...document.querySelectorAll('#msgs .b.me')].pop(); return { txt: m.querySelector('.txt').textContent, orig: (m.querySelector('.orig') || {}).textContent || '', lang: (m.querySelector('.orig') || { getAttribute: () => null }).getAttribute('lang') }; }")
    check("3. 'trimite' sends the English text, the command word is not sent", me["txt"] == "make Done red" and pg.evaluate(NME) == nm + 1, str(me))
    check("3. the Romanian original under it, in small text", "fă Done roșu" in me["orig"] and "Romanian" in me["orig"] and me["lang"] == "ro-RO", str(me))
    r = pg.evaluate(ROWS)
    check("3. the dock and the message box are empty after sending", r["src"] == "" and r["note"] == "" and r["box"] == "", str(r))
    check("3. a toast confirms it", pg.evaluate(TOAST) == "Sent", pg.evaluate(TOAST))
    pg.wait_for_function("() => window.__spoken.length > 0", timeout=10000)
    spoken = pg.evaluate("() => window.__spoken")
    check("3. the reply is read aloud in Romanian (translated back on the device)", spoken[-1]["lang"] == "ro-RO" and spoken[-1]["text"].startswith("RO: ") and spoken[-1]["voice"] == "Ioana", str(spoken))
    pg.wait_for_timeout(200)
    m = pg.evaluate(MIC)
    check("3. recognition pauses while the reply is spoken (no session listens), the mic stays on", m["on"] and m["paused"] and m["live"] == 0, str(m))
    n_before = m["n"]
    pg.evaluate("() => window.__endSpeech()")
    pg.wait_for_function("n => window.__sr.length > n && window.__srActive.started", arg=n_before, timeout=5000)
    m = pg.evaluate(MIC)
    check("3. after the reply, listening resumes by itself", m["on"] and not m["paused"] and m["live"] == 1, str(m))
    # a trailing command in one utterance
    n0 = pg.evaluate(NBOT)
    say(pg, "fă Done roșu trimite"); wait_reply(pg, n0)
    me = pg.evaluate("() => [...document.querySelectorAll('#msgs .b.me')].pop().querySelector('.txt').textContent")
    check("3. 'fă Done roșu trimite' sends 'make Done red'", me == "make Done red", me)
    pg.wait_for_function("() => window.__speaking", timeout=10000); end_speech(pg)
    shot(pg, "05_desktop_chat_original")

    # 4. the collected entry (format 2)
    es = pg.evaluate(ENTRIES)
    e = es[0] if es else {}
    check("4. one entry per message sent", len(es) == 2, f"{len(es)} entries")
    check("4. format 2, id, time, gold empty", e.get("format") == "sop-collect/2" and str(e.get("id", "")).startswith("c-") and re.match(r"\d{4}-\d\d-\d\dT", e.get("time", "")) and e.get("wires") == [], str({k: e.get(k) for k in ("format", "id", "time", "wires")}))
    check("4. the English text, the Romanian original, via voice, translated on the device", e.get("text") == "make Done red" and e.get("source") == {"via": "voice", "lang": "ro-RO", "original": "fă Done roșu", "translation": {"by": "builtin", "edited": False}}, str(e.get("source")))
    check("4. the names on the drawing", "Done" in e.get("names", []) and "Start" in e.get("names", []), str(e.get("names")))
    mv = e.get("models") or {}
    check("4. the model versions (SOP-BERT, VSS-BERT's confidence model, digests)", bool(mv.get("neural")) and bool(mv.get("combined")) and re.fullmatch(r"[0-9a-f]{8}", mv.get("all", "")) and re.fullmatch(r"[0-9a-f]{8}", mv.get("micro", "")), str(mv))
    d = e.get("decision") or {}
    check("4. VSS-BERT's decision per request: words, executed or held, confidence", d.get("status") == "read" and d.get("units") and all(isinstance(u.get("conf"), (int, float)) and isinstance(u.get("execute"), bool) and u.get("src") for u in d["units"]), json.dumps(d)[:300])
    check("4. no reader's readings are stored", not any(k in e for k in ("readings", "cut", "spell", "read")) and len(json.dumps(e)) < 1500, f"{sorted(e)} {len(json.dumps(e))} bytes")
    check("4. the reply text is kept", bool(e.get("reply")), str(e.get("reply")))

    # 5. staying on (read aloud off from here: the mock's speech lasts until __endSpeech)
    pg.click(".vd-lang"); pg.uncheck("#vd-pop [data-pref=tts]"); pg.keyboard.press("Escape")
    say(pg, "fă Start albastru")
    wait_box(pg, "make Start blue")
    n_before = pg.evaluate("() => window.__sr.length")
    pg.evaluate("() => window.__end()")
    m = pg.evaluate(MIC)
    check("5. the browser ends the session: the indicator stays on (no flicker)", m["on"] and m["listening"] and not m["paused"], str(m))
    pg.wait_for_function("n => window.__sr.length > n && window.__srActive.started", arg=n_before, timeout=5000)
    check("5. a new session starts by itself, the text is kept", pg.input_value("#vd-src") == "fă Start albastru" and pg.evaluate("() => window.__live()") == 1, pg.input_value("#vd-src"))
    say(pg, "verde")
    check("5. what is said next is added to the kept text", pg.input_value("#vd-src") == "fă Start albastru verde", pg.input_value("#vd-src"))
    n_before = pg.evaluate("() => window.__sr.length")
    pg.evaluate("() => window.__err('no-speech')")
    pg.wait_for_function("n => window.__sr.length > n && window.__srActive.started", arg=n_before, timeout=5000)
    m = pg.evaluate(MIC)
    check("5. a no-speech error: a new session, still on, no error shown", m["on"] and m["live"] == 1 and "allow" not in pg.evaluate(ROWS)["note"], str(m))
    say(pg, "șterge")
    r = pg.evaluate(ROWS)
    check("5. 'șterge' clears the dock and the message box", r["src"] == "" and r["note"] == "" and r["box"] == "" and "cleared" in pg.evaluate(TOAST), str(r) + " " + pg.evaluate(TOAST))
    n_before = pg.evaluate("() => window.__sr.length")
    pg.evaluate("() => window.__err('not-allowed')")
    pg.wait_for_timeout(900)
    m = pg.evaluate(MIC)
    check("5. 'not-allowed' stops listening for real, no restart", not m["on"] and not m["listening"] and m["n"] == n_before and m["live"] == 0, str(m))
    check("5. ... and says why, in the note at the end of the row", "did not allow the microphone" in pg.evaluate(ROWS)["note"] and pg.is_visible("#dock .vd-st.err"), pg.evaluate(ROWS)["note"])
    shot(pg, "06_desktop_not_allowed")
    mic_on(pg)
    check("5. the mic can be turned on again; the message is gone", "allow" not in pg.evaluate(ROWS)["note"])
    n_before = pg.evaluate("() => window.__sr.length")
    say(pg, "oprește")
    pg.wait_for_timeout(900)
    m = pg.evaluate(MIC)
    check("5. 'oprește' stops listening, nothing restarts", not m["on"] and m["live"] == 0 and m["n"] == n_before and "stopped listening" in pg.evaluate(TOAST), str(m) + " " + pg.evaluate(TOAST))

    # 6. no translation: French
    pg.click(".vd-lang"); pg.select_option("#vd-lang", "other")
    pg.fill("#vd-tag", "not a tag"); pg.press("#vd-tag", "Enter")
    err = pg.inner_text(".vd-tagerr")
    check("6. an invalid BCP-47 tag is refused", "is not a BCP-47 language tag" in err, err)
    pg.fill("#vd-tag", "fr-fr"); pg.press("#vd-tag", "Enter")
    check("6. a valid tag is taken, canonical; the code says FR", pg.input_value("#vd-lang") == "fr-FR" and pg.inner_text(".vd-lang").strip() == "FR", pg.input_value("#vd-lang"))
    pg.locator("#vd-pop details").evaluate("d => d.open = true")
    pg.wait_for_function("() => /Translation French → English: no/.test(document.querySelector('.vd-support').textContent)", timeout=10000)
    pg.keyboard.press("Escape")
    pg.fill("#vd-src", "mets Done en bleu")
    pg.wait_for_function("() => /No translation on this device for French → English/.test(document.querySelector('#dock .vd-st').textContent)", timeout=10000)
    r = pg.evaluate(ROWS)
    check("6. no translation: said plainly in the note, the text kept, nothing put in the message box", r["src"] == "mets Done en bleu" and r["box"] == ""
          and "write the English in the message box, or turn on online translation in the dock settings" in r["note"], str(r))
    shot(pg, "07_desktop_no_translation")
    nm = pg.evaluate(NME)
    pg.press("#vd-src", "Enter"); pg.wait_for_timeout(500)
    check("6. Enter in the dock sends nothing", pg.evaluate(NME) == nm and "Not sent" in pg.evaluate(TOAST), pg.evaluate(TOAST))
    pg.click("#send-btn"); pg.wait_for_timeout(400)
    check("6. the send button sends nothing either", pg.evaluate(NME) == nm and pg.input_value("#vd-src") == "mets Done en bleu")
    mic_on(pg); say(pg, "send"); pg.wait_for_timeout(600)
    check("6. a spoken 'send' sends nothing, the text stays", pg.evaluate(NME) == nm and pg.input_value("#vd-src") == "mets Done en bleu", f"{pg.evaluate(NME)} vs {nm}, {pg.evaluate(ROWS)}, {pg.evaluate(TOAST)}")
    pg.click(".vd-mic")
    pg.fill("#say", "make Done blue")
    check("6. English written in the message box: the 'no translation' note goes away, the dock keeps the original", pg.evaluate(ROWS)["note"] == "" and pg.input_value("#vd-src") == "mets Done en bleu", str(pg.evaluate(ROWS)))
    shot(pg, "07b_desktop_english_in_box")
    n0 = pg.evaluate(NBOT); pg.click("#send-btn"); wait_reply(pg, n0)
    es = pg.evaluate(ENTRIES)
    check("6. ... and is sent, collected with translation by the user", es[-1]["text"] == "make Done blue" and es[-1]["source"] == {"via": "typed", "lang": "fr-FR", "original": "mets Done en bleu", "translation": {"by": "user", "edited": True}}, str(es[-1].get("source")))
    check("6. nothing sent to the online service (off by default)", not outside, str(outside))
    # back to Romanian; a non-English message typed straight into the message box
    pg.click(".vd-lang"); pg.select_option("#vd-lang", "ro-RO"); pg.keyboard.press("Escape")
    nsys = pg.evaluate("() => document.querySelectorAll('#msgs .sys').length")
    n0 = pg.evaluate(NBOT); pg.fill("#say", "Fă mi un box galben"); pg.click("#send-btn"); wait_reply(pg, n0)
    notes = pg.evaluate("() => [...document.querySelectorAll('#msgs .sys')].map(x => x.textContent)")
    check("6. Romanian typed straight into the message box: sent, with a hint about the dictation bar", pg.evaluate("() => [...document.querySelectorAll('#msgs .b.me')].pop().querySelector('.txt').textContent") == "Fă mi un box galben"
          and len(notes) == nsys + 1 and "does not look like English" in notes[-1], str(notes[-2:]))
    n0 = pg.evaluate(NBOT); pg.fill("#say", "fă Start mare și verde acum"); pg.click("#send-btn"); wait_reply(pg, n0)
    check("6. the hint is given once", pg.evaluate("() => document.querySelectorAll('#msgs .sys').length") == nsys + 1)
    n0 = pg.evaluate("() => document.querySelectorAll('#msgs .sys').length"); send(pg, "make Start green and move it left")
    check("6. English typed in the box: no hint", pg.evaluate("() => document.querySelectorAll('#msgs .sys').length") == n0)

    # 7. events: undo right after; Do it anyway and Edit by voice
    nst = len(pg.evaluate(ENTRIES))
    n0 = pg.evaluate(NBOT); pg.click("[data-say=Undo]"); wait_reply(pg, n0)
    es = pg.evaluate(ENTRIES)
    check("7. the toolbar Undo is not collected as a message", len(es) == nst, f"{len(es)} entries")
    check("7. Undo right after -> 'undo-next' on the message before it", [x["kind"] for x in es[-1]["events"]] == ["undo-next"] and es[-1]["events"][0].get("by") == "button", str(es[-1]["events"]))
    held = []
    for msg in TRY:
        r = send(pg, msg)
        print(f"     tried: {msg!r} -> {r}")
        if r and r["held"]: held.append(r["held"][0])
        if len(held) >= 2: break
    if not held:
        check("7. a held request among the tried messages (needed for the event checks)", False, "the shipped models executed every tried message")
    else:
        mic_on(pg)
        h = next((x for x in held if x["anyway"]), None)
        last_anyway = pg.evaluate("() => { const bs = [...document.querySelectorAll('#msgs .held button.anyway')].filter(b => !b.disabled); const b = bs.pop(); return b ? b.closest('[data-held]').dataset.held : null; }")
        if last_anyway:
            n0 = pg.evaluate(NBOT); say(pg, "fă-o oricum"); wait_reply(pg, n0)
            rid, turn, idx = last_anyway.split(":")
            e = next((x for x in pg.evaluate(ENTRIES) if x["turn"] == int(turn)), {})
            check("7. 'fă-o oricum' presses the last Do it anyway -> 'anyway'", any(x["kind"] == "anyway" and x["reader"] == rid and x["index"] == int(idx) for x in e.get("events", [])) and "doing it anyway" in pg.evaluate(TOAST), str(e.get("events")))
        last_edit = pg.evaluate("() => { const bs = [...document.querySelectorAll('#msgs .held button.edit')].filter(b => !b.disabled); const b = bs.pop(); return b ? { key: b.closest('[data-held]').dataset.held, text: b.dataset.text } : null; }")
        if last_edit:
            say(pg, "editează"); pg.wait_for_timeout(300)
            box = pg.input_value("#say")
            check("7. 'editează' presses the last Edit: the clearer command is in the message box", box == last_edit["text"] and box != "", f"{box!r} vs {last_edit['text']!r}")
            n0 = pg.evaluate(NBOT); say(pg, "trimite"); wait_reply(pg, n0)
            rid, turn, idx = last_edit["key"].split(":")
            es = pg.evaluate(ENTRIES)
            e = next((x for x in es if x["turn"] == int(turn)), {})
            check("7. a spoken 'trimite' sends the message box -> 'edit' and 'edit-sent' (same text)", any(x["kind"] == "edit" for x in e.get("events", [])) and any(x["kind"] == "edit-sent" and x.get("sent") == box and x.get("same") is True for x in e.get("events", [])), str(e.get("events")))
        else:
            print("     (no Edit button among the held requests: the Edit events were not reached)")
        pg.click(".vd-mic")

    # 8. Settings › Collected requests
    pg.click("#open-settings"); pg.wait_for_selector("#collect-box")
    pg.locator("#collect-box").scroll_into_view_if_needed()
    nst = len(pg.evaluate(ENTRIES))
    box = pg.inner_text("#collect-box")
    check("8. the section: the count", pg.inner_text("[data-collect-count]") == str(nst), f"{pg.inner_text('[data-collect-count]')} vs {nst}")
    check("8. the section: nothing leaves the browser unless downloaded; the readings are recomputed, not stored", "Nothing leaves your browser unless you download the file" in box and "versions of the models" in box, box[:400])
    check("8. the section: a preview of the last ones, with VSS-BERT's decision", "make Start green and move it left" in box and "VSS-BERT executed" in box, box)
    shot(pg, "08_settings_collected")
    with pg.expect_download() as dl:
        pg.click("[data-collect=download]")
    dlf = dl.value
    path = os.path.join(OUT, dlf.suggested_filename); dlf.save_as(path)
    check("8. Download: the file name has the date", bool(re.fullmatch(r"sop-requests-\d{4}-\d\d-\d\d-\d{4}\.jsonl", dlf.suggested_filename)), dlf.suggested_filename)
    lines = open(path, encoding="utf-8").read().splitlines()
    ok = True
    try: objs = [json.loads(l) for l in lines]
    except json.JSONDecodeError: ok, objs = False, []
    check("8. Download: valid JSONL, format 2, as many lines as the count", ok and len(objs) == nst and all(o["format"] == "sop-collect/2" for o in objs), f"{len(lines)} lines, count {nst}")
    out = os.path.join(tempfile.mkdtemp(prefix="collect-bench-"), "collected_test")
    r = subprocess.run([sys.executable, os.path.join(HERE, "collect_to_bench.py"), path, "--out", out], capture_output=True, text=True)
    batch = [json.loads(l) for l in open(os.path.join(out, "batch_01.jsonl"), encoding="utf-8")] if r.returncode == 0 else []
    check("8. the converter makes an un-annotated llm_bench folder from the download", r.returncode == 0 and len(batch) == nst and all(x["wires"] == [] for x in batch) and batch[0]["text"] == "make Done red"
          and os.path.isfile(os.path.join(out, "texts", "texts_01.jsonl")) and os.path.isfile(os.path.join(out, "context", "context_01.jsonl")), r.stdout + r.stderr)
    pg.click("[data-collect=clear]")
    check("8. Clear asks inside the page", pg.is_visible(".collect-confirm") and "Delete all" in pg.inner_text(".collect-confirm"))
    pg.click("[data-collect=clear-no]")
    check("8. Cancel keeps them", not pg.locator(".collect-confirm").count() and len(pg.evaluate(ENTRIES)) == nst)
    pg.click("[data-collect=clear]"); pg.click("[data-collect=clear-yes]")
    check("8. Delete empties them (the page and the storage)", pg.inner_text("[data-collect-count]") == "0" and pg.evaluate("() => localStorage.getItem('sop.collect.v1')") is None)
    pg.uncheck("[data-collect=toggle]")
    check("8. the switch off is kept", pg.evaluate("() => localStorage.getItem('sop.collect.off')") == "1")
    pg.keyboard.press("Escape")
    send(pg, "make Start blue")
    check("8. off: nothing new is kept", pg.evaluate(ENTRIES) == [], str(pg.evaluate(ENTRIES))[:200])
    pg.click("#open-settings"); pg.wait_for_selector("#collect-box"); pg.check("[data-collect=toggle]"); pg.keyboard.press("Escape")
    send(pg, "make Start green")
    check("8. on again: kept", len(pg.evaluate(ENTRIES)) == 1)

    # 9. reload: choices kept; the mic was on -> one tap to resume
    mic_on(pg)
    pg.reload(wait_until="domcontentloaded"); ready(pg)
    prefs = pg.evaluate("() => JSON.parse(localStorage.getItem('sop.voice'))")
    check("9. the choices are kept (Romanian, read aloud off again, the mic was on)", prefs.get("lang") == "ro-RO" and prefs.get("tts") is False and prefs.get("micOn") is True and prefs.get("online") is False, str(prefs))
    m = pg.evaluate(MIC)
    check("9. after a reload the mic does not start by itself; 'Resume listening' shows", not m["on"] and m["n"] == 0 and pg.is_visible("[data-vd=resume]"), str(m))
    shot(pg, "09_desktop_resume")
    pg.click("[data-vd=resume]")
    m = pg.evaluate(MIC)
    check("9. one tap: listening again", m["on"] and m["live"] == 1 and pg.is_hidden("[data-vd=resume]"), str(m))
    pg.click(".vd-mic")
    check("9. after a reload the collected entries are still there", len(pg.evaluate(ENTRIES)) == 1)

    # 10. phone width
    pg.set_viewport_size({"width": 390, "height": 844}); pg.wait_for_timeout(400)
    dock, comp = pg.evaluate(RECT, "#dock"), pg.evaluate(RECT, "#composer")
    rows = pg.evaluate("() => [...document.querySelectorAll('#dock .vd-row')].map(r => r.getBoundingClientRect().height)")
    check("10. phone: the dock just above the message box, full width, one row", near(dock["b"], comp["t"]) and near(dock["l"], 0) and near(dock["r"], 390) and len(rows) == 1 and all(h <= 32 for h in rows), f"{dock} {comp} {rows}")
    mic_on(pg); say(pg, "fă Done roșu")
    wait_box(pg, "make Done red")
    shot(pg, "10_phone_dock")
    pg.click(".vd-lang"); pg.wait_for_selector("#vd-pop:not([hidden])")
    pop = pg.evaluate(RECT, "#vd-pop")
    check("10. phone: the popover inside the screen", pop["l"] >= 0 and pop["r"] <= 390 and pop["t"] >= 0, str(pop))
    shot(pg, "11_phone_popover")
    pg.keyboard.press("Escape")
    check("10. phone: no horizontal scroll", pg.evaluate("() => document.documentElement.scrollWidth") <= 390)
    pg.click(".vd-mic")
    check("11. no page error and no browser dialog", not errors, "\n     ".join(errors[:5]))
    b.close()

httpd.shutdown()
print(f"\n{'FAILED: ' + ', '.join(fails) if fails else 'all passed'}  (screenshots: {OUT})")
sys.exit(1 if fails else 0)
