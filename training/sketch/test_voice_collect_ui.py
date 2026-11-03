#!/usr/bin/env python3
"""test_voice_collect_ui.py: voice input with translation (docs/js/voice.js) and the collected requests (docs/js/collect.js) in a real
browser (Playwright, Chromium), with the browser's speech and translation APIs mocked by an init script.

Run:  python3 training/sketch/test_voice_collect_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ on a free local port and loads VSS and SOP-BERT (as test_clarify_ui.py: transformers.js 3.8.1 from training/laptop/node_modules
in place of cdn.jsdelivr.net). The init script replaces SpeechRecognition (a fake that the test drives with window.__say), Translator (Chrome's
on-device API: ro <-> en available, fr -> en unavailable, a small dictionary) and speechSynthesis.speak (records what would be read). Checks:
  1. the microphone button beside the message box opens the popup (a dialog, focus inside); the language list starts with Romanian and English
     and has a free BCP-47 field; the support lines say: speech recognition yes, translation Romanian -> English yes on this device, the voices;
     the note about the browser vendor's servers is there;
  2. a spoken Romanian phrase: the interim transcript is shown live, the final one fills the box, Stop translates it on the device into the
     English box; Send puts the English text in the chat as a normal message with the Romanian original under it in small text, and VSS-BERT
     replies; with "read aloud" on, the reply is read in Romanian (translated back by the same Translator);
  3. the collected entry of that message: the English text, the Romanian original, its language, via voice, translated on the device, the
     names on the drawing, the four readers' readings (SOP Lang and wires), VSS-BERT's units with their confidences and executed / held;
  4. typing in a language this browser cannot translate (French): the popup says plainly that there is no built-in translation, the text
     is kept as it is, and nothing is sent anywhere (the online fallback is off; no request leaves the page); an invalid BCP-47 tag is refused;
     Escape closes the popup and gives the focus back to the microphone button; the choices are kept after a reload;
  5. the events: Undo (toolbar) right after a message -> "undo-next"; Do it anyway on a held request -> "anyway"; Edit -> "edit", the sent
     rewrite -> "edit-sent" and "superseded" (when the shipped models hold a request of the tried messages);
  6. ⋮ › Settings › Collected requests: the count, the preview of the last ones (with the original), Download as JSONL (a file name with
     the date; every line valid JSON; as many lines as the count; the converter collect_to_bench.py turns it into texts / batch with an empty
     gold / context), Clear with a confirmation inside the page (Cancel keeps them, Delete empties them; never a browser dialog), the switch
     off keeps nothing new;
  7. phone width (390 x 844): the popup fits the screen without a horizontal scroll;
  8. no page error.
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
  const DICT = { 'fă Done roșu': 'make Done red', 'șterge Start': 'delete Start' };
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
  window.__spoken = [];
  try {
    const voices = [{ name: 'Ioana', lang: 'ro-RO', default: false }, { name: 'Samantha', lang: 'en-US', default: true }];
    window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; this.lang = ''; this.voice = null; } };   // a voice of the mock is not a real SpeechSynthesisVoice
    speechSynthesis.getVoices = () => voices;
    speechSynthesis.speak = u => { window.__spoken.push({ text: u.text, lang: u.lang, voice: u.voice && u.voice.name }); };
    speechSynthesis.cancel = () => {};
  } catch (e) {}
  window.__dialogs = 0;
})();
"""
NBOT = "() => document.querySelectorAll('#msgs .b.bot').length"
ENTRIES = "() => { try { return JSON.parse(localStorage.getItem('sop.collect.v1') || '[]'); } catch (e) { return null; } }"
LINE = """() => { const bs = [...document.querySelectorAll('#msgs .b.bot')], b = bs[bs.length - 1]; const rl = b && b.querySelector('.rl[data-reader=combined]');
  return rl ? { text: rl.querySelector('.t').textContent, held: [...rl.querySelectorAll('.held > li')].map(li => ({ key: li.dataset.held,
    anyway: !!li.querySelector('button.anyway') && !li.querySelector('button.anyway').disabled, edit: li.querySelector('button.edit') ? li.querySelector('button.edit').dataset.text : null })) } : null; }"""

def wait_reply(pg, n):
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n, timeout=240000)
    pg.wait_for_timeout(400)

def send(pg, text):
    n = pg.evaluate(NBOT); pg.fill("#say", text); pg.click("#send-btn"); wait_reply(pg, n)
    return pg.evaluate(LINE)

def shot(pg, name): pg.screenshot(path=f"{OUT}/{name}.png")

def ready(pg):
    pg.wait_for_function("() => { const t = document.querySelector('[data-rtab=combined]'); return t && !t.classList.contains('off'); }", timeout=900000)
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=180000)

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

    # 1. the popup
    check("1. a microphone button beside the message box", pg.locator("#composer #mic-btn").count() == 1 and pg.get_attribute("#mic-btn", "aria-label") is not None)
    pg.click("#mic-btn"); pg.wait_for_selector(".vx:not([hidden])")
    dlg = pg.evaluate("() => { const d = document.querySelector('.vx'); return { role: d.getAttribute('role'), modal: d.getAttribute('aria-modal'), focusInside: d.contains(document.activeElement),"
                      " opts: [...d.querySelectorAll('#vx-lang option')].map(o => o.value), support: [...d.querySelectorAll('.vx-support li')].map(l => l.textContent), note: d.querySelector('.vx-note').textContent }; }")
    check("1. a modal dialog with the focus inside", dlg["role"] == "dialog" and dlg["modal"] == "true" and dlg["focusInside"], str(dlg)[:300])
    check("1. Romanian and English first, a free BCP-47 field last", dlg["opts"][:2] == ["ro-RO", "en-US"] and dlg["opts"][-1] == "other" and len(dlg["opts"]) > 30, str(dlg["opts"][:5]))
    sup = " | ".join(dlg["support"])
    check("1. support: speech recognition yes", "Speech recognition: yes" in sup, sup)
    check("1. support: translation Romanian -> English on this device", "Translation Romanian → English: yes, on this device" in sup, sup)
    check("1. support: the voices for Romanian", "Speech synthesis: 1 voice for Romanian" in sup, sup)
    check("1. the note: the API is the browser's, audio may go to the vendor's servers", "browser’s" in dlg["note"] and "vendor’s servers" in dlg["note"], dlg["note"])

    # 2. speak Romanian, translate, send
    pg.click(".vx-opts summary")   # the options are folded by default
    pg.check(".vx [data-pref=tts]")
    pg.click(".vx [data-vx=rec]")
    rec = pg.evaluate("() => { const r = window.__srActive; return r && { lang: r.lang, interim: r.interimResults, cont: r.continuous, started: r.started }; }")
    check("2. recognition started in ro-RO with interim results, not continuous", rec == {"lang": "ro-RO", "interim": True, "cont": False, "started": True}, str(rec))
    check("2. the button says Stop while listening", pg.get_attribute(".vx [data-vx=rec]", "aria-pressed") == "true" and "Stop" in pg.inner_text(".vx [data-vx=rec]"))
    pg.evaluate("() => window.__say('fă Done', false)")
    interim = pg.inner_text(".vx-interim")
    check("2. the interim transcript is shown live", interim == "fă Done" and pg.is_visible(".vx-interim"), interim)
    shot(pg, "1_listening")
    pg.evaluate("() => window.__say('fă Done roșu', true)")
    check("2. the final transcript fills the box", pg.input_value("#vx-orig") == "fă Done roșu", pg.input_value("#vx-orig"))
    pg.click(".vx [data-vx=rec]")
    pg.wait_for_function("() => document.querySelector('#vx-en').value === 'make Done red'", timeout=10000)
    trs = pg.inner_text(".vx-trstate")
    check("2. Stop translates on the device into the English box", "Translated on this device" in trs, trs)
    shot(pg, "2_translated")
    n0 = pg.evaluate(NBOT)
    pg.click(".vx [data-vx=send]")
    check("2. Send closes the popup", pg.is_hidden(".vx"))
    wait_reply(pg, n0)
    me = pg.evaluate("() => { const m = [...document.querySelectorAll('#msgs .b.me')].pop(); return { txt: m.querySelector('.txt').textContent, orig: (m.querySelector('.orig') || {}).textContent || '', lang: (m.querySelector('.orig') || { getAttribute: () => null }).getAttribute('lang') }; }")
    check("2. the chat shows the English text as the message", me["txt"] == "make Done red", str(me))
    check("2. the Romanian original under it, in small text", "fă Done roșu" in me["orig"] and "Romanian" in me["orig"] and me["lang"] == "ro-RO", str(me))
    reply = pg.evaluate(LINE)
    check("2. VSS-BERT replied to the English text", bool(reply) and bool(reply["text"]), str(reply))
    pg.wait_for_function("() => window.__spoken.length > 0", timeout=10000)
    spoken = pg.evaluate("() => window.__spoken")
    check("2. the reply is read aloud in Romanian (translated back on the device)", spoken[-1]["lang"] == "ro-RO" and spoken[-1]["text"].startswith("RO: ") and spoken[-1]["voice"] == "Ioana", str(spoken))
    shot(pg, "3_chat_original")

    # 3. the collected entry
    es = pg.evaluate(ENTRIES)
    e = es[-1] if es else {}
    check("3. one entry per message sent", len(es) == 1, f"{len(es)} entries")
    check("3. the English text and the Romanian original, with its language", e.get("text") == "make Done red" and e.get("source", {}).get("original") == "fă Done roșu" and e["source"].get("lang") == "ro-RO", str(e.get("source")))
    check("3. via voice, translated on the device, not edited", e.get("source", {}).get("via") == "voice" and e["source"].get("translation") == {"by": "builtin", "edited": False}, str(e.get("source")))
    check("3. format, id, time, gold empty", e.get("format") == "sop-collect/1" and str(e.get("id", "")).startswith("c-") and re.match(r"\d{4}-\d\d-\d\dT", e.get("time", "")) and e.get("wires") == [], str({k: e.get(k) for k in ("format", "id", "time", "wires")}))
    check("3. the names on the drawing", "Done" in e.get("names", []) and "Start" in e.get("names", []), str(e.get("names")))
    R = e.get("readings", {})
    check("3. all four readers' readings", set(R) == {"rules", "vss", "neural", "combined"} and all(R[k]["status"] == "read" for k in R), str({k: R[k].get("status") for k in R}))
    check("3. each reading has SOP Lang and fresh2-style wires", all(R[k]["sop"] and R[k]["wires"] and all("type" in w and "args" in w for w in R[k]["wires"]) for k in R), json.dumps(R.get("combined", {}))[:400])
    c = R.get("combined", {})
    check("3. VSS-BERT: units with confidences, executed / held", bool(c.get("units")) and all(isinstance(u.get("conf"), (int, float)) for u in c["units"]) and sorted(c.get("executed", []) + c.get("held", [])) == [u["index"] for u in c["units"]], json.dumps(c.get("units"))[:400])
    check("3. VSS-BERT read 'set Done red'", any(w["args"].get("action") == "set" and w["args"].get("color") == "red" for w in c.get("wires", [])), json.dumps(c.get("wires")))
    check("3. the reply text is kept", bool(e.get("reply")), str(e.get("reply")))

    # 4. typing in a language this browser cannot translate; an invalid tag; Escape; the choices kept
    pg.click("#mic-btn"); pg.wait_for_selector(".vx:not([hidden])")
    check("4. the popup remembers Romanian and read aloud", pg.input_value("#vx-lang") == "ro-RO" and pg.is_checked(".vx [data-pref=tts]"))
    pg.select_option("#vx-lang", "other")
    pg.fill("#vx-tag", "not a tag"); pg.press("#vx-tag", "Enter")
    err = pg.inner_text(".vx-tagerr")
    check("4. an invalid BCP-47 tag is refused", "is not a BCP-47 language tag" in err, err)
    pg.fill("#vx-tag", "fr-fr"); pg.press("#vx-tag", "Enter")
    check("4. a valid tag is taken, canonical", pg.input_value("#vx-lang") == "fr-FR", pg.input_value("#vx-lang"))
    pg.wait_for_function("() => /Translation French → English: no/.test(document.querySelector('.vx-support').textContent)", timeout=10000)
    pg.fill("#vx-orig", "bonjour, mets Done en bleu")
    pg.wait_for_function("() => /no built-in translation/.test(document.querySelector('.vx-trstate').textContent)", timeout=10000)
    trs = pg.inner_text(".vx-trstate")
    check("4. no translation for French: said plainly, the text kept as it is", "This browser has no built-in translation from French to English" in trs and pg.input_value("#vx-en") == "bonjour, mets Done en bleu", trs)
    check("4. nothing sent to the online service (off by default)", not outside and not pg.is_checked(".vx [data-pref=online]"), str(outside))
    shot(pg, "4_no_translation")
    pg.keyboard.press("Escape")
    check("4. Escape closes the popup, the focus goes back to the microphone button", pg.is_hidden(".vx") and pg.evaluate("() => document.activeElement && document.activeElement.id") == "mic-btn")
    prefs = pg.evaluate("() => JSON.parse(localStorage.getItem('sop.voice'))")
    check("4. the choices are kept in localStorage", prefs.get("lang") == "fr-FR" and prefs.get("tts") is True and prefs.get("online") is False and prefs.get("continuous") is False, str(prefs))
    # back to Romanian for the rest; typed Romanian (not spoken): via typed
    pg.click("#mic-btn"); pg.select_option("#vx-lang", "ro-RO"); pg.evaluate("() => { document.querySelector('.vx-opts').open = true; }"); pg.uncheck(".vx [data-pref=tts]")
    pg.fill("#vx-orig", "șterge Start")
    pg.wait_for_function("() => document.querySelector('#vx-en').value === 'delete Start'", timeout=10000)
    n0 = pg.evaluate(NBOT); pg.keyboard.press("Control+Enter"); wait_reply(pg, n0)
    es = pg.evaluate(ENTRIES)
    check("4. typed Romanian: translated, sent with Ctrl+Enter, collected as typed with the original", es[-1]["text"] == "delete Start" and es[-1]["source"] == {"via": "typed", "lang": "ro-RO", "original": "șterge Start", "translation": {"by": "builtin", "edited": False}}, str(es[-1].get("source")))

    # 5. events: undo right after; Do it anyway; Edit, the rewrite sent, superseded
    n0 = pg.evaluate(NBOT); pg.click("[data-say=Undo]"); wait_reply(pg, n0)
    es = pg.evaluate(ENTRIES)
    check("5. the toolbar Undo is not collected as a message", len(es) == 2, f"{len(es)} entries")
    check("5. Undo right after -> 'undo-next' on the message before it", [x["kind"] for x in es[-1]["events"]] == ["undo-next"] and es[-1]["events"][0].get("by") == "button", str(es[-1]["events"]))
    held = []
    for msg in TRY:
        r = send(pg, msg)
        print(f"     tried: {msg!r} -> {r}")
        if r and r["held"]: held.append(r["held"][0])
        if len(held) >= 2: break
    if not held:
        check("5. a held request among the tried messages (needed for the event checks)", False, "the shipped models executed every tried message")
    else:
        h = next((x for x in held if x["anyway"]), None)
        if h:
            n0 = pg.evaluate(NBOT); pg.locator(f'#msgs [data-held="{h["key"]}"] button.anyway').click(); wait_reply(pg, n0)
            rid, turn, idx = h["key"].split(":")
            e = next((x for x in pg.evaluate(ENTRIES) if x["turn"] == int(turn)), {})
            check("5. Do it anyway -> 'anyway' with the reader and the request", any(x["kind"] == "anyway" and x["reader"] == rid and x["index"] == int(idx) for x in e.get("events", [])), str(e.get("events")))
        h2 = next((x for x in held if x["edit"] and x is not h), None) or next((x for x in held if x["edit"]), None)
        if h2 and h2 is not h:
            pg.locator(f'#msgs [data-held="{h2["key"]}"] button.edit').click(); pg.wait_for_timeout(300)
            box = pg.input_value("#say")
            n0 = pg.evaluate(NBOT); pg.click("#send-btn"); wait_reply(pg, n0)
            rid, turn, idx = h2["key"].split(":")
            es = pg.evaluate(ENTRIES)
            e = next((x for x in es if x["turn"] == int(turn)), {})
            kinds = [x["kind"] for x in e.get("events", [])]
            check("5. Edit -> 'edit' with the suggested command", any(x["kind"] == "edit" and x.get("suggested") == box for x in e.get("events", [])), str(e.get("events")))
            check("5. the rewrite sent -> 'edit-sent', the same text", any(x["kind"] == "edit-sent" and x.get("sent") == box and x.get("same") is True for x in e.get("events", [])), str(e.get("events")))
            check("5. the rewrite executed -> 'superseded' by the next turn", "superseded" in kinds and any(x["kind"] == "superseded" and x.get("by") == es[-1]["turn"] for x in e["events"]), str(e.get("events")))
        else:
            print("     (only one held request with the needed buttons: the Edit events were not reached)")

    # 6. Settings › Collected requests
    pg.click("#open-settings"); pg.wait_for_selector("#collect-box")
    pg.locator("#collect-box").scroll_into_view_if_needed()
    nst = len(pg.evaluate(ENTRIES))
    box = pg.inner_text("#collect-box")
    check("6. the section: the count", pg.inner_text("[data-collect-count]") == str(nst), f"{pg.inner_text('[data-collect-count]')} vs {nst}")
    check("6. the section: says nothing leaves the browser unless downloaded", "Nothing leaves your browser unless you download the file" in box, box[:300])
    check("6. the section: a preview of the last ones, with the original", "make Done red" in box and "ro-RO: fă Done roșu" in box, box)
    check("6. the switch is on", pg.is_checked("[data-collect=toggle]"))
    shot(pg, "5_settings_collected")
    with pg.expect_download() as dl:
        pg.click("[data-collect=download]")
    d = dl.value
    path = os.path.join(OUT, d.suggested_filename); d.save_as(path)
    check("6. Download: the file name has the date", bool(re.fullmatch(r"sop-requests-\d{4}-\d\d-\d\d-\d{4}\.jsonl", d.suggested_filename)), d.suggested_filename)
    lines = open(path, encoding="utf-8").read().splitlines()
    ok = True
    try: objs = [json.loads(l) for l in lines]
    except json.JSONDecodeError: ok, objs = False, []
    check("6. Download: valid JSONL, one entry per line, as many as the count", ok and len(objs) == nst and all(o["format"] == "sop-collect/1" for o in objs), f"{len(lines)} lines, count {nst}")
    out = os.path.join(tempfile.mkdtemp(prefix="collect-bench-"), "collected_test")
    r = subprocess.run([sys.executable, os.path.join(HERE, "collect_to_bench.py"), path, "--out", out], capture_output=True, text=True)
    batch = [json.loads(l) for l in open(os.path.join(out, "batch_01.jsonl"), encoding="utf-8")] if r.returncode == 0 else []
    check("6. the converter makes an un-annotated llm_bench folder from the download", r.returncode == 0 and len(batch) == nst and all(x["wires"] == [] for x in batch) and batch[0]["text"] == "make Done red"
          and os.path.isfile(os.path.join(out, "texts", "texts_01.jsonl")) and os.path.isfile(os.path.join(out, "context", "context_01.jsonl")), r.stdout + r.stderr)
    pg.click("[data-collect=clear]")
    check("6. Clear asks inside the page", pg.is_visible(".collect-confirm") and "Delete all" in pg.inner_text(".collect-confirm"))
    shot(pg, "6_clear_confirm")
    pg.click("[data-collect=clear-no]")
    check("6. Cancel keeps them", not pg.locator(".collect-confirm").count() and len(pg.evaluate(ENTRIES)) == nst)
    pg.click("[data-collect=clear]"); pg.click("[data-collect=clear-yes]")
    check("6. Delete empties them (the page and the storage)", pg.inner_text("[data-collect-count]") == "0" and pg.evaluate("() => localStorage.getItem('sop.collect.v1')") is None)
    pg.uncheck("[data-collect=toggle]")
    check("6. the switch off is kept", pg.evaluate("() => localStorage.getItem('sop.collect.off')") == "1")
    pg.keyboard.press("Escape")
    send(pg, "make Start blue")
    check("6. off: nothing new is kept", pg.evaluate(ENTRIES) == [], str(pg.evaluate(ENTRIES))[:200])
    pg.click("#open-settings"); pg.wait_for_selector("#collect-box"); pg.check("[data-collect=toggle]"); pg.keyboard.press("Escape")
    send(pg, "make Start green")
    check("6. on again: kept", len(pg.evaluate(ENTRIES)) == 1)

    # 7. phone width
    pg.set_viewport_size({"width": 390, "height": 844}); pg.wait_for_timeout(300)
    pg.click("#mic-btn"); pg.wait_for_selector(".vx:not([hidden])")
    pg.click(".vx [data-vx=rec]"); pg.evaluate("() => window.__say('fă Done roșu', true)"); pg.click(".vx [data-vx=rec]")
    pg.wait_for_function("() => document.querySelector('#vx-en').value === 'make Done red'", timeout=10000)
    geo = pg.evaluate("() => { const r = document.querySelector('.vx').getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: innerWidth, h: innerHeight, sw: document.documentElement.scrollWidth }; }")
    check("7. phone: the popup fits the screen, no horizontal scroll", geo["l"] >= 0 and geo["r"] <= geo["w"] + 0.5 and geo["t"] >= 0 and geo["b"] <= geo["h"] + 0.5 and geo["sw"] <= geo["w"], str(geo))
    shot(pg, "7_phone_popup")
    pg.keyboard.press("Escape")
    pg.reload(wait_until="domcontentloaded"); ready(pg)
    pg.click("#mic-btn"); pg.wait_for_selector(".vx:not([hidden])")
    check("4. after a reload the language is still Romanian", pg.input_value("#vx-lang") == "ro-RO")
    pg.keyboard.press("Escape")
    pg.click("#open-settings"); pg.wait_for_selector("#collect-box"); pg.locator("#collect-box").scroll_into_view_if_needed()
    check("6. after a reload the entries are still there", pg.inner_text("[data-collect-count]") == "1")
    shot(pg, "8_phone_settings")
    check("8. no page error and no browser dialog", not errors, "\n     ".join(errors[:5]))
    b.close()

httpd.shutdown()
print(f"\n{'FAILED: ' + ', '.join(fails) if fails else 'all passed'}  (screenshots: {OUT})")
sys.exit(1 if fails else 0)
