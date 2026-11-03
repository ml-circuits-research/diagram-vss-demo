#!/usr/bin/env python3
"""test_clarify_ui.py: the reply about requests the demo did not do, in a real browser (Playwright, Chromium): training/sketch/CLARIFY_DESIGN.md
design B, docs/js/clarify.js rendered by docs/js/ui.js (owner, 2026-11-03: explicit and clear rather than fluent; no questions, the reasons
and the clearer command to write; a bare answer is never taken as understood).

Run:  python3 training/sketch/test_clarify_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ on a free local port and loads VSS and SOP-BERT (as test_combined_ui.py: transformers.js 3.8.1 from training/laptop/node_modules
in place of cdn.jsdelivr.net). The chat shows VSS-BERT's replies (the default). Checks, on the VSS-BERT tab:
  1. a two-request message where one request is held ("Make Check red and put Done below it"; the next messages of TRY when the shipped
     models execute both): the reply says what was done, then "Not done, because I am not sure what you meant:", the words of the held
     request, 1 to 3 plain reasons, the clearer command ("Write it with the name instead of the word, like this: “Move Done below Check.”"),
     Do it anyway and Edit;
  2. no numbers and no reader names in the chat line (the confidence and the threshold are in the details, which still show them);
  3. "yes" while the request is held: the fixed reply of clarify.js nothingReadText ("I found no request in this message, and I did not ask
     a question. …"), with the clearer command as the example; nothing changes in the drawing;
  4. Edit puts the clearer command into the message box without sending it (no new reply);
  5. sending that command (the rewrite) executes it, and the held request becomes "superseded": its Do it anyway and Edit buttons are
     disabled and a short note says "replaced by your later command"; the details say so too;
  6. the dependency rule: in "add Fail below Check in red and connect Check to Fail with label "no"" (s3-0261 of short3; the next messages
     of DEP_TRY when the create is executed) the create is held, and the request that names Fail is held too with the reason
     "it needs “add Fail below Check in red” first", the line "Do the request it depends on first; then write: …", no Do it anyway button;
  7. Do it anyway on the held create: the reply spells out what it runs ("Did it anyway: “Add …”"), the button reads "Done anyway";
  8. the other tabs, when checked in ⋮ › Settings › Replies in the chat, reply in the same format (a held request of theirs has the same parts);
  9. no page error.
Screenshots (desktop and phone width) go to the directory (default: a temporary folder). Exit code 0 when everything passes.
"""
import functools, http.server, mimetypes, os, re, socketserver, sys, tempfile, threading

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "..", "..", "docs"))
TJS = os.path.normpath(os.path.join(HERE, "..", "laptop", "node_modules", "@huggingface", "transformers", "dist"))
LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="clarify-ui-")
os.makedirs(OUT, exist_ok=True)
HEAD1 = "Not done, because I am not sure what you meant:"
NUM = re.compile(r"\b\d")                        # a number (a digit inside a name such as A1 is a name; the messages here have none)
READER = re.compile(r"SOP-BERT|VSS|Rules|confidence|threshold")
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
    """the demo's transformers.js version from the local npm copy (as test_combined_ui.py)"""
    url = route.request.url.split("?")[0]
    rel = "transformers.min.js" if url.rstrip("/") == LIB else url[len(LIB):].lstrip("/").removeprefix("dist/")
    p = os.path.join(TJS, rel)
    if not os.path.isfile(p): return route.abort()
    ct = "application/wasm" if p.endswith(".wasm") else "text/javascript" if p.endswith((".js", ".mjs")) else (mimetypes.guess_type(p)[0] or "application/octet-stream")
    route.fulfill(status=200, body=open(p, "rb").read(), headers={"content-type": ct, "access-control-allow-origin": "*"})

# one reader's line of a bot bubble (k: 1 = the last bubble): its text, the line above the held requests, every held request with its parts
LINE = """([k, rid]) => {
  const bs = [...document.querySelectorAll('#msgs .b.bot')], b = bs[bs.length - k]; if (!b) return null;
  const rl = b.querySelector(`.rl[data-reader=${rid}]`); if (!rl) return { text: b.textContent, all: b.textContent, head: null, held: [] };
  return { text: rl.querySelector('.t').textContent, all: rl.textContent, head: (rl.querySelector('.hhead') || {}).textContent || null,
    held: [...rl.querySelectorAll('.held > li')].map(li => ({ key: li.dataset.held, cls: li.className, src: li.querySelector('.src').textContent,
      reasons: [...li.querySelectorAll('.why .r')].map(x => x.textContent), how: (li.querySelector('.how') || {}).textContent || '',
      runs: (li.querySelector('.runs') || {}).textContent || '', state: (li.querySelector('.state') || {}).textContent || '',
      anyway: li.querySelector('button.anyway') ? { disabled: li.querySelector('button.anyway').disabled, text: li.querySelector('button.anyway').textContent } : null,
      edit: li.querySelector('button.edit') ? { disabled: li.querySelector('button.edit').disabled, text: li.querySelector('button.edit').dataset.text } : null })) };
}"""
HELD = """key => { const li = document.querySelector(`[data-held="${key}"]`); if (!li) return null;
  return { cls: li.className, state: (li.querySelector('.state') || {}).textContent || '', anyway: li.querySelector('button.anyway') ? li.querySelector('button.anyway').disabled : null,
    anywayText: li.querySelector('button.anyway') ? li.querySelector('button.anyway').textContent : null, edit: li.querySelector('button.edit') ? li.querySelector('button.edit').disabled : null }; }"""
COUNTS = """() => { const m = (((document.querySelector('#readout') || {}).textContent || '').match(/(\\d+) shapes? · (\\d+) links?/) || [0, -1, -1]); return [+m[1], +m[2]]; }"""
NBOT = "() => document.querySelectorAll('#msgs .b.bot').length"

def send(pg, text, rid="combined"):
    n = pg.evaluate(NBOT)
    pg.fill("#say", text); pg.click("#send-btn")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n, timeout=240000)
    pg.wait_for_timeout(300)
    return pg.evaluate(LINE, [1, rid])

def details(pg, k_from_end):
    pg.evaluate("k => { const bs = [...document.querySelectorAll('#msgs .b.bot [data-turn]')]; bs[bs.length - k].click(); }", k_from_end)
    pg.wait_for_timeout(400)
    t = pg.evaluate("() => (document.querySelector('#sbody') || {}).textContent || ''")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    return t

def shot(pg, name, sel=None):
    if sel: pg.locator(sel).last.scroll_into_view_if_needed()
    pg.screenshot(path=f"{OUT}/{name}.png")

def clean(name, line):
    """2: no numbers and no reader names in a chat line"""
    check(f"2. {name}: no numbers and no reader names in the chat line", bool(line) and not NUM.search(line["all"]) and not READER.search(line["all"]), line and line["all"])

# a two-request message with one request held: the context fill of "it" (CLARIFY_DESIGN.md part 1: held at the shipped threshold)
TRY = ["Make Check red and put Done below it", "Make Process green and put Start below it", "Make Done orange and move Check next to it"]
# the dependency rule: a create held, a request that names its shape (s3-0261, s3-0146 of short3)
DEP_TRY = ['add Fail below Check in red and connect Check to Fail with label "no"', "create Api and Db squares, connect Api to Db",
           "add a diamond called Retry above Process and link Retry to Check"]

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
    pg.wait_for_function("() => document.querySelector('#loadov').hidden", timeout=120000)   # the loading overlay is gone (loaded and checked)
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=180000)

    # 1. one request done, one held, with its reasons, the clearer command and the buttons
    r1, h1, msg1 = None, None, None
    for msg in TRY:
        r = send(pg, msg)
        print(f"     tried: {msg!r} -> {r['all'][:160] if r else r}")
        ok = r and r["held"] and r["head"] == HEAD1 and r["text"] and r["held"][0]["edit"] and "‹" not in r["held"][0]["edit"]["text"]
        if ok: r1, h1, msg1 = r, r["held"][0], msg; break
    shot(pg, "1_held", "#msgs .b.bot")
    check("1. a two-request message: one request done (the line says what), one held", bool(r1) and r1["text"] and len(r1["held"]) == 1, str(r1))
    if not r1:
        print("     (no message of TRY gave one request done and one held without a placeholder: the rest of 1-5 is skipped)")
    else:
        print("     reply: " + r1["all"])
        check("1. the line above it: 'Not done, because I am not sure what you meant:'", r1["head"] == HEAD1, r1["head"])
        check("1. the held request is quoted with its own words", h1["src"].startswith("“") and h1["src"].strip("“”") in msg1, h1["src"])
        check("1. 1 to 3 plain reasons", 1 <= len(h1["reasons"]) <= 3 and all(x and not NUM.search(x) for x in h1["reasons"]), str(h1["reasons"]))
        clearer = h1["edit"]["text"]
        check("1. the clearer command, in a sentence that says how to write it", bool(re.match(r"(Write it with the name instead of the word, like this|If you meant|Write it with .* stated, like this)", h1["how"])) and f"“{clearer}”" in h1["how"], h1["how"])
        check("1. a context fill: the reason says which name the word was taken to mean, and the command writes the name", (not any("was taken" in x for x in h1["reasons"])) or bool(re.search(r"(Move|Put) \w+ (below|above|next to|left of|right of) \w+\.", clearer)), f"{h1['reasons']} / {clearer}")
        check("1. Do it anyway and Edit, both enabled", bool(h1["anyway"]) and not h1["anyway"]["disabled"] and not h1["edit"]["disabled"], str(h1))
        clean("the reply with a held request", r1)
        det1 = details(pg, 1)
        check("2. the details still show the numbers (the confidence and the gate's threshold)", "VSS-BERT gate" in det1 and re.search(r"confidence 0\.\d{3}", det1) and "not executed" in det1, det1[det1.find("VSS-BERT gate"):][:300])

        # 3. "yes": nothing read while something is held -> the fixed reply
        c0 = pg.evaluate(COUNTS)
        r3 = send(pg, "yes")
        shot(pg, "3_yes", "#msgs .b.bot")
        print("     reply to yes: " + r3["all"])
        check("3. 'yes' while a request is held: the fixed reply of clarify.js nothingReadText", r3["text"].startswith("I found no request in this message, and I did not ask a question. The request I was not sure of is still not done: press Do it anyway under it, or write it again in full"), r3["text"])
        check("3. its example is the clearer command (placeholders as …)", f"e.g. “{clearer}”" in r3["text"], r3["text"])
        check("3. nothing changed in the drawing", pg.evaluate(COUNTS) == c0, f"{c0} -> {pg.evaluate(COUNTS)}")
        clean("the reply to 'yes'", r3)
        st = pg.evaluate(HELD, h1["key"])
        check("3. the held request is still held (its buttons still enabled)", st and st["anyway"] is False and st["edit"] is False and not st["state"], str(st))

        # 4. Edit: the clearer command into the box, not sent
        n0 = pg.evaluate(NBOT)
        pg.locator(f'#msgs [data-held="{h1["key"]}"] button.edit').click(); pg.wait_for_timeout(500)
        box = pg.input_value("#say")
        shot(pg, "4_edit")
        check("4. Edit puts the clearer command in the message box", box == clearer, f"{box!r} vs {clearer!r}")
        check("4. Edit does not send it (no new reply)", pg.evaluate(NBOT) == n0, f"{n0} -> {pg.evaluate(NBOT)}")

        # 5. the rewrite supersedes the held request
        n0 = pg.evaluate(NBOT)
        pg.click("#send-btn")
        pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n0, timeout=240000)
        pg.wait_for_timeout(400)
        r5 = pg.evaluate(LINE, [1, "combined"])
        print("     reply to the rewrite: " + r5["all"])
        check("5. the rewrite is executed", not r5["held"] and bool(re.search(r"Moved|is now|Connected|Drew", r5["text"])), str(r5))
        st = pg.evaluate(HELD, h1["key"])
        shot(pg, "5_superseded", f'#msgs [data-held="{h1["key"]}"]')
        check("5. the held request is superseded: Do it anyway and Edit disabled, a short note", st and "superseded" in st["cls"] and st["anyway"] is True and st["edit"] is True and st["state"] == "replaced by your later command", str(st))
        det = details(pg, 3)
        check("5. the details say it was replaced by a later command", "(then replaced by a later command)" in det, det[det.find("VSS-BERT gate"):][:400])

    # 6. the dependency rule
    r6, hc, hd, msg6 = None, None, None, None
    for msg in DEP_TRY:
        r = send(pg, msg)
        print(f"     tried: {msg!r} -> {r['all'][:200] if r else r}")
        dep = [h for h in (r["held"] if r else []) if any(x.startswith("it needs “") for x in h["reasons"])]
        if dep: r6, hd, msg6 = r, dep[0], msg; break
    shot(pg, "6_dependency", "#msgs .b.bot")
    check("6. a request that names a shape a held create would make is held too", bool(r6), str(r))
    if r6:
        print("     reply: " + r6["all"])
        need = re.match(r"it needs “(.*)” first", next(x for x in hd["reasons"] if x.startswith("it needs “"))).group(1)
        hc = next((h for h in r6["held"] if h["src"].strip("“”") == need), None)
        check("6. the request it needs is a held create of the same message", bool(hc) and need in msg6, f"{need!r} in {[h['src'] for h in r6['held']]}")
        check("6. its line: do the request it depends on first, then the command", hd["how"].startswith("Do the request it depends on first; then write: “"), hd["how"])
        check("6. no Do it anyway for it; Edit has the command", hd["anyway"] is None and bool(hd["edit"]), str(hd))
        clean("the reply with the dependency", r6)
        # 7. Do it anyway on the held create: the reply spells out what it runs
        if hc and hc["anyway"]:
            n0 = pg.evaluate(NBOT)
            pg.locator(f'#msgs [data-held="{hc["key"]}"] button.anyway').click()
            pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n", arg=n0, timeout=60000)
            pg.wait_for_timeout(400)
            r7 = pg.evaluate(LINE, [1, "combined"])
            st = pg.evaluate(HELD, hc["key"])
            shot(pg, "7_do_it_anyway", "#msgs .b.bot")
            print("     reply to Do it anyway: " + r7["all"])
            check("7. Do it anyway: the reply spells out what it ran", bool(re.match(r"Did it anyway: “[A-Z].*\.” ", r7["text"])), r7["text"])
            check("7. its button reads 'Done anyway', disabled", st and st["anyway"] is True and st["anywayText"] == "Done anyway", str(st))
            clean("the reply to Do it anyway", r7)

    # 8. the other tabs reply in the same format
    pg.click("#open-settings"); pg.wait_for_timeout(400)
    for t in ["vss", "neural"]: pg.check(f"#sbody input[data-chat={t}]"); pg.wait_for_timeout(150)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    lines8 = []
    for msg in ["Make Done purple and connect it to Start", "Make Start yellow and put Check left of it"]:
        send(pg, msg)
        lines8 += [x for x in (pg.evaluate(LINE, [1, rid]) for rid in ["vss", "neural"]) if x and x["held"]]
        if lines8: break
    shot(pg, "8_other_tabs", "#msgs .b.bot")
    if lines8:
        x = lines8[0]
        same = x["head"] == HEAD1 and all(h["reasons"] and (h["how"] or h["anyway"] or h["edit"]) for h in x["held"])
        check("8. another tab's held request has the same parts (the line above, reasons, a how-to line or buttons)", same, str(x))
        check("8. another tab: no numbers and no reader names in its held requests", not any(NUM.search(" ".join(h["reasons"] + [h["how"], h["runs"]])) or READER.search(" ".join(h["reasons"] + [h["how"], h["runs"]])) for h in x["held"]), str(x))
    else:
        print("     (no other tab held a request of these messages; 8 not checked)")

    pg.set_viewport_size({"width": 390, "height": 844}); pg.wait_for_timeout(500)
    shot(pg, "9_phone")
    wide = pg.evaluate("() => [document.querySelector('#msgs').scrollWidth, document.querySelector('#msgs').clientWidth]")
    check("9. at phone width the chat has no sideways scroll", wide[0] <= wide[1] + 1, str(wide))
    check("9. no page error", not errors, "; ".join(errors[:3]))
    b.close()
httpd.shutdown()
print(f"screenshots: {OUT}")
print("PASS" if not fails else f"FAIL ({len(fails)})")
sys.exit(1 if fails else 0)
