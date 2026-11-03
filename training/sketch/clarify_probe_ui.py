#!/usr/bin/env python3
"""clarify_probe_ui.py: what the demo does today when a request is not executed and the user answers in the chat (CLARIFY_DESIGN.md, part 1).

Run:  python3 training/sketch/clarify_probe_ui.py [docs dir] [out.json]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves the docs dir (default: docs/; CLARIFY_DESIGN.md ran it on a `git archive HEAD docs` copy, so the edits of other agents in the
working tree do not change the page), loads every reader (as test_combined_ui.py), makes the chat show every reader's line, and plays the
conversations below, each in a freshly loaded page. For every turn it records each reader's line (text, the requests not done with their
reasons), the engine's question chips, and the VSS-BERT drawing (SOP Lang subtab). No assertions: it is a probe, the output is read by hand.
"""
import functools, http.server, json, mimetypes, os, socketserver, sys, threading

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = sys.argv[1] if len(sys.argv) > 1 else os.path.normpath(os.path.join(HERE, "..", "..", "docs"))
OUTF = sys.argv[2] if len(sys.argv) > 2 else None
TJS = os.path.normpath(os.path.join(HERE, "..", "laptop", "node_modules", "@huggingface", "transformers", "dist"))
LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"

CONVERSATIONS = [
    ("sure + unsure, then short answers", ["Make Start blue, put Process next to Done and make check purple",
                                            "the red one", "yes", "Done", "move it left of Check", "I meant the circle"]),
    ("a request held, then the same request written explicitly", ["make Start blue and line them up",
                                                                  "Align Start, Process, Check and Done horizontally."]),
    ("the engine's own question (which circle?)", ["add two circles named A1 and A2", "make the circle green", "the left one", "A2"]),
    ("a longer message", ["Make Check red. Then put Done below it, and connect Start to Done with a dashed arrow. Process can be a hexagon",
                          "yes, do it", "I meant Done should be below Check"]),
    ("one request done, one held (\"put Done below it\"), then the five short answers of the owner's question",
     ["Make Check red and put Done below it", "the red one", "yes", "Done", "move it left of Check", "I meant the circle"]),
]
ONLY = os.environ.get("ONLY")   # comma list of conversation indexes to play (default: all)
if ONLY: CONVERSATIONS = [c for i, c in enumerate(CONVERSATIONS) if str(i) in ONLY.split(",")]


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


LINES = """() => {
  const bs = [...document.querySelectorAll('#msgs .b.bot')], b = bs[bs.length - 1]; if (!b) return null;
  const rl = [...b.querySelectorAll('.rl')].map(x => ({ reader: (x.querySelector('b') || {}).textContent || '', text: (x.querySelector('.t') || {}).textContent || '',
    sub: (x.querySelector('.sub') || {}).textContent || '', held: [...x.querySelectorAll('.held li')].map(li => ({ src: li.querySelector('.src').textContent, why: li.querySelector('.why').textContent })) }));
  return { lines: rl, chips: [...b.querySelectorAll('.chip, button.chip')].map(c => c.textContent), all: b.textContent.slice(0, 2000) };
}"""


def send(pg, text):
    n = pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
    pg.fill("#say", text); pg.click("#send-btn")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n, timeout=240000)
    pg.wait_for_timeout(400)
    return pg.evaluate(LINES)


def drawing(pg):
    pg.click("[data-rtab=combined]"); pg.wait_for_timeout(200)
    pg.click("[data-sub=sop]"); pg.wait_for_timeout(300)
    t = pg.evaluate("() => (document.querySelector('#rpanel') || {}).textContent || ''")
    pg.click("[data-sub=drawing]"); pg.wait_for_timeout(100)
    return t[:3000]


out = []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--js-flags=--max-old-space-size=1536"])
    for title, msgs in CONVERSATIONS:
        pg = b.new_page(viewport={"width": 1280, "height": 860})
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        # every reader's line in the chat (ui.js CHAT_KEY), a clean storage otherwise
        pg.add_init_script("try { localStorage.clear(); localStorage.setItem('sop.chat.tabs', 'combined,rules,vss,neural'); } catch (e) {}")
        pg.route(LIB + "**", cdn)
        pg.route("https://huggingface.co/**", lambda r: r.abort())
        pg.goto(base, wait_until="domcontentloaded")
        pg.wait_for_function("() => ['combined', 'vss', 'neural'].every(id => { const t = document.querySelector(`[data-rtab=${id}]`); return t && !t.classList.contains('off'); })", timeout=900000)
        pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=240000)
        conv = {"title": title, "turns": []}
        for m in msgs:
            r = send(pg, m)
            conv["turns"].append({"user": m, "reply": r, "vss_bert_drawing": drawing(pg)})
            print(f"\n>>> {m}")
            for ln in (r or {}).get("lines", []):
                print(f"  {ln['reader']} {ln['text']}" + (f" [{ln['sub']}]" if ln["sub"] else ""))
                for h in ln["held"]: print(f"      held “{h['src']}”: {h['why']}")
            if r and r.get("chips"): print("  chips:", r["chips"])
        conv["errors"] = errors
        out.append(conv)
        pg.close()
    b.close()
httpd.shutdown()
if OUTF: json.dump(out, open(OUTF, "w"), indent=1)
