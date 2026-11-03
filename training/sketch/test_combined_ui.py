#!/usr/bin/env python3
"""test_combined_ui.py: the VSS-BERT tab of the demo in a real browser (Playwright, Chromium): the combined reader of VSS and SOP-BERT
(docs/js/combined-confidence.js, docs/model/confidence/combined.json; training/sketch/combine/COMBINED_READER.md).

Run:  python3 training/sketch/test_combined_ui.py [screenshot dir]      (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ on a free local port and loads both readers it combines: VSS (docs/model/micro, about 31 MB) and SOP-BERT
(docs/model/neural/sop-bert, about 68 MB, WASM; transformers.js 3.8.1 from training/laptop/node_modules in place of cdn.jsdelivr.net). Nothing
is blocked except huggingface.co (never used). Checks:
  1. the tabs read VSS-BERT, Rules, VSS, SOP-BERT (owner, 2026-11-03 09:30; the neural tab is labelled SOP-BERT; no "3 readers" tab) and the
     page opens on VSS-BERT; VSS-BERT has its own drawing and the subtabs Drawing / SOP Lang / Settings; by default the chat shows only
     VSS-BERT's reply, as one line without the "VSS-BERT · <ms>:" prefix, with "VSS-BERT · <ms>" as a quiet tag beside the time;
  7. ⋮ › Settings › Replies in the chat: one checkbox per tab in the order of the tabs, VSS-BERT checked; checking the others shows their
     lines too (in the order of the tabs, each with its prefix); the choice is kept in localStorage and after a reload; the last checked
     one cannot be unchecked; back to VSS-BERT only removes the key;
  2. each tab reads its own cutter (owner, 2026-11-03 afternoon; no cut setting): the details say "cut by: BERT cutter" for VSS-BERT and
     SOP-BERT, "VSS cutter" for VSS, "Rules segmenter" for the Rules; they list the requests of the VSS cut (also read by SOP-BERT and the
     Rules for VSS's votes) and of the BERT cut (also read by VSS and the Rules for SOP-BERT's votes and VSS-BERT); VSS-BERT reuses SOP-BERT's
     reading and that VSS reading ("reused, no model call"); ⋮ › Settings has no cut setting and no Benchmark tab, and nothing is stored
     under the old key sop.cut;
  3. a message with a request the two readers read the same is executed; a request below the combined threshold is not done, its reason
     is one of the plain sentences of docs/js/clarify.js (the readers read a value differently / only one reader found it / ...), with no
     numbers and no reader names in the chat, and a "Do it anyway" button; clicking it runs that reading in the VSS-BERT drawing; undo
     takes it back (test_clarify_ui.py checks the rest of the reply: the clearer command, Edit, superseding);
  4. the details show "VSS-BERT gate: safety threshold (it acts from confidence <the file's threshold of the BERT cut>)";
  5. Settings: a table of the levels boldest (cost 1) / very bold (cost 2) / bolder (cost 5) / safety threshold / more careful (cost 20) /
     execute all (safety threshold checked), with the file's thresholds and each level's numbers on the calibration part (done right,
     confidently wrong, asked, with % signs; combined.json levels and execute_all); a choice other than the default is kept in localStorage
     and after a reload, the default removes it;
  4b. the VSS and SOP-BERT tabs use the confidence with the votes of the other readers: their details show vote3.json's thresholds per type
     (the check of the removed test_vote_ui.py);
  0. the loading overlay: present at start over the drawing area, saying why ("Loading the readers. VSS-BERT answers once both are
     ready."), one row per step (VSS, SOP-BERT, the confidence files, the first check); it disappears by itself after the load and the check;
  9. zoom and pan: + / − change the viewBox (1.25x, the zoom %), fit restores it, the zoom is shared by the tabs, dragging the empty canvas
     pans, dragging a shape still moves the shape and not the view, Ctrl+wheel zooms, arrow keys pan, after a message with shapes outside
     the view the fit button is a highlighted hint and the view does not jump; at phone width the buttons are inside the drawing and work;
  6. no page error.
Screenshots at phone width (390 x 844) too.
Screenshots go to the directory (default: a temporary folder). Exit code 0 when everything passes.
"""
import functools, http.server, json, mimetypes, os, re, socketserver, sys, tempfile, threading

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.normpath(os.path.join(HERE, "..", "..", "docs"))
TJS = os.path.normpath(os.path.join(HERE, "..", "laptop", "node_modules", "@huggingface", "transformers", "dist"))
LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix="combined-ui-")
os.makedirs(OUT, exist_ok=True)
SPEC = json.load(open(os.path.join(DOCS, "model", "confidence", "combined.json")))
CUT = SPEC["best_cut"]
LV = SPEC["cuts"][CUT]["levels"]
T_COST = LV["cost"]["threshold"]
# the reasons of a held request as the chat says them (docs/js/clarify.js reasonsOf; CLARIFY_DESIGN.md design B)
REASONS = re.compile(r"the two readers read .* differently|only one of the two readers found a request here|the words could mean two different things|the reading is right most of the time|it needs “|was taken to mean|was taken from the conversation|not sure")
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
    """the demo's transformers.js version from the local npm copy (as test_neural_gate_ui.py)"""
    url = route.request.url.split("?")[0]
    rel = "transformers.min.js" if url.rstrip("/") == LIB else url[len(LIB):].lstrip("/").removeprefix("dist/")
    p = os.path.join(TJS, rel)
    if not os.path.isfile(p): return route.abort()
    ct = "application/wasm" if p.endswith(".wasm") else "text/javascript" if p.endswith((".js", ".mjs")) else (mimetypes.guess_type(p)[0] or "application/octet-stream")
    route.fulfill(status=200, body=open(p, "rb").read(), headers={"content-type": ct, "access-control-allow-origin": "*"})

# the last bot bubble's VSS-BERT line: its prefix (null without one), the quiet tag beside the time, the readers of the bubble's lines, its
# text, the requests not done (src, reason) and their buttons
LINE = """() => {
  const bs = [...document.querySelectorAll('#msgs .b.bot')], b = bs[bs.length - 1]; if (!b) return null;
  const rl = b.querySelector('.rl[data-reader=combined]'), readers = [...b.querySelectorAll('.rl')].map(x => x.dataset.reader), who = (b.querySelector('.meta .who') || {}).textContent || null;
  const prefixes = [...b.querySelectorAll('.rl')].map(x => (x.querySelector(':scope > b') || {}).textContent || null);
  if (!rl) return { prefix: null, who, readers, prefixes, text: b.textContent, held: [] };
  return { prefix: (rl.querySelector(':scope > b') || {}).textContent || null, who, readers, prefixes, text: rl.querySelector('.t').textContent, all: rl.textContent, held: [...rl.querySelectorAll('.held > li')].map(li => ({ src: li.querySelector('.src').textContent, why: li.querySelector('.why').textContent, button: !!li.querySelector('button.anyway') })) };
}"""
COUNTS = """() => { const m = (((document.querySelector('#readout') || {}).textContent || '').match(/(\\d+) shapes? · (\\d+) links?/) || [0, -1, -1]); return [+m[1], +m[2]]; }"""

def send(pg, text):
    n = pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
    pg.fill("#say", text); pg.click("#send-btn")
    pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n && !document.querySelector('#msgs .typing')", arg=n, timeout=180000)
    pg.wait_for_timeout(300)
    return pg.evaluate(LINE)

def details(pg, k_from_end):
    pg.evaluate("k => { const bs = [...document.querySelectorAll('#msgs .b.bot [data-turn]')]; bs[bs.length - k].click(); }", k_from_end)
    pg.wait_for_timeout(400)
    return pg.evaluate("() => (document.querySelector('#sbody') || {}).textContent || ''")

# messages to try until one has a request VSS-BERT does not execute (the first ones are expected to)
TRY = ["Make Process green and connect it to Done.", "Add a tiny purple triangle named Tri next to Check and link it to Start with a dotted line.",
       "Put a big orange hexagon called Hub between Start and Done, then make the hub teal and attach it to Check.",
       "Connect Check to Start, recolor Start crimson and make it slightly smaller.", "Hub teal, then the triangle goes left of Process."]

STORED = "k => { try { return localStorage.getItem(k); } catch (e) { return 'no storage'; } }"
PC = lambda v: f"{v * 100:.1f}%"

def open_settings(pg):
    pg.click("#open-settings"); pg.wait_for_timeout(400)

with sync_playwright() as p:
    b = p.chromium.launch(args=["--js-flags=--max-old-space-size=1536"])
    pg = b.new_page(viewport={"width": 1280, "height": 860})
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.add_init_script("try { if (!sessionStorage.getItem('t0')) { localStorage.clear(); sessionStorage.setItem('t0', '1'); } } catch (e) {}")
    pg.route(LIB + "**", cdn)
    pg.route("https://huggingface.co/**", lambda r: r.abort())
    pg.goto(base, wait_until="domcontentloaded")
    pg.wait_for_timeout(500)
    first = pg.evaluate("() => (document.querySelector('#rtabs [aria-selected=true]') || {}).dataset.rtab")
    check("1. the page opens on the VSS-BERT tab", first == "combined", str(first))
    pg.screenshot(path=f"{OUT}/0_loading.png")
    ov = pg.evaluate("() => { const o = document.querySelector('#loadov'), b = document.querySelector('.board').getBoundingClientRect(), r = o.getBoundingClientRect(); return { shown: !o.hidden, text: o.textContent, rows: [...o.querySelectorAll('.lo-row')].map(x => x.dataset.step), covers: Math.abs(r.width - b.width) < 2 && Math.abs(r.height - b.height) < 2, card: o.querySelector('.lo-card') ? o.querySelector('.lo-card').getBoundingClientRect().width : 0 }; }")
    check("0. the loading overlay is there at start, over the whole drawing area, and says why", ov["shown"] and ov["covers"] and "Loading the readers. VSS-BERT answers once both are ready." in ov["text"] and ov["card"] >= 420, str(ov)[:300])
    check("0. one row per step: VSS, SOP-BERT, the confidence files, the first check", ov["rows"] == ["VSS", "SOP-BERT", "Confidence files", "The first check"], str(ov["rows"]))
    pg.wait_for_function("() => { const t = document.querySelector('[data-rtab=combined]'); return t && !t.classList.contains('off'); }", timeout=900000)
    pg.wait_for_function("() => document.querySelector('#loadov').hidden", timeout=120000)
    check("0. the overlay disappears by itself once everything has loaded and the first check passed", pg.evaluate("() => document.querySelector('#loadov').hidden"), "")
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=180000)
    tabs = pg.evaluate("() => [...document.querySelectorAll('#rtabs [data-rtab]')].map(x => x.textContent.trim())")
    check("1. the tabs are VSS-BERT, Rules, VSS, SOP-BERT (no 3 readers tab)", tabs == ["VSS-BERT", "Rules", "VSS", "SOP-BERT"] and not pg.query_selector("[data-rtab=vote3]"), str(tabs))
    subs = pg.evaluate("() => [...document.querySelectorAll('#subtabs [data-sub]')].map(x => x.dataset.sub)")
    of = pg.evaluate("() => (document.querySelector('#subtabs .of') || {}).textContent")
    check("1. VSS-BERT has the subtabs Drawing / SOP Lang / Settings", subs == ["drawing", "sop", "settings"] and of == "VSS-BERT reader", f"{subs} {of}")
    pg.screenshot(path=f"{OUT}/0_start.png")

    # 1 + 2 + 3: each tab's own cutter; VSS-BERT reuses the readings of the BERT cut; the chat shows its line only, without a prefix
    r1 = send(pg, "Move Done below Start.")
    pg.screenshot(path=f"{OUT}/1_agree.png")
    check("1. the default chat shows only VSS-BERT's reply", bool(r1 and r1["readers"] == ["combined"]), str(r1))
    check("1. one line without the 'VSS-BERT · ms:' prefix; 'VSS-BERT · <ms>' is a quiet tag beside the time", bool(r1 and r1["prefix"] is None and r1["who"] and re.match(r"VSS-BERT · [\d.]+ ms$", r1["who"])), str(r1))
    check("3. a request both readers read the same is executed", bool(r1 and not r1["held"] and "Moved" in r1["text"]), str(r1))
    det1 = details(pg, 1)
    check("2. VSS-BERT reuses SOP-BERT's reading and VSS's reading of the BERT cutter's requests (no model call)", "VSS-BERT: the BERT cutter’s requests: the SOP-BERT tab’s reading and VSS’s reading of the same requests" in det1 and "reused, no model call" in det1, det1[det1.find("VSS-BERT:"):][:300])
    heads = pg.evaluate("() => [...document.querySelectorAll('#sbody .minihead')].map(h => h.textContent)")
    by = {h.split(' ')[0]: (re.search(r"cut by: ([^·]+)", h) or [None, None])[1] for h in heads}
    by = {k: (v or '').strip() for k, v in by.items()}
    check("2. each tab's own cutter: VSS-BERT and SOP-BERT the BERT cutter, VSS the VSS cutter, the Rules the Rules segmenter", by.get("VSS-BERT") == "BERT cutter" and by.get("SOP-BERT") == "BERT cutter" and by.get("VSS") == "VSS cutter" and by.get("Rules") == "Rules segmenter", str(heads))
    check("2. the details list the VSS cut's requests, also read by SOP-BERT and the Rules for VSS's votes", "VSS cutter, 1 request, also read by SOP-BERT and the Rules for VSS’s votes" in det1, det1[:700])
    check("2. ... and the BERT cut's requests, also read by VSS and the Rules for SOP-BERT's votes and VSS-BERT", "BERT cutter, 1 request, also read by VSS and the Rules for SOP-BERT’s votes and VSS-BERT" in det1, det1[:700])
    VC = json.load(open(os.path.join(DOCS, "model", "confidence", "vote3.json")))["columns"]
    vt = lambda c: f"(it acts from confidence {VC[c]['levels']['cost']['command']:.4f} for commands and {VC[c]['levels']['cost']['question']:.4f} for questions, with the votes of the other two readers)"
    check("4. the VSS and SOP-BERT tabs use the confidence with the votes (vote3.json's thresholds per type in the details)", f"VSS gate: safety threshold {vt('vss')}" in det1 and f"SOP-BERT gate: safety threshold {vt('sop')}" in det1, det1[det1.find("VSS gate"):][:300])
    check("1. the details still show every reader", all(f"{x} " in det1 for x in ["Rules", "VSS", "SOP-BERT"]) and "VSS-BERT gate" in det1 and "VSS gate" in det1 and "SOP-BERT gate" in det1, det1[:400])
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)

    held, k = None, 0
    for msg in TRY:
        r = send(pg, msg); k += 1
        print(f"     tried: {msg!r} -> {r['text'][:120] if r else r}")
        if r and r["held"]: held = (msg, r); break
    pg.screenshot(path=f"{OUT}/2_held.png")
    check("3. a request below the combined threshold is not done, with a reason and a button", held is not None and held[1]["held"][0]["button"], str(held))
    if held:
        why = held[1]["held"][0]["why"]
        check("3. its reason is one of the plain sentences of docs/js/clarify.js", bool(REASONS.search(why)), why)
        check("3. no numbers and no reader names in the chat (the confidence and the threshold are in the details)", not re.search(r"\b\d", held[1]["all"]) and not re.search(r"SOP-BERT|VSS|Rules", held[1]["all"]), held[1]["all"])
        c0 = pg.evaluate(COUNTS)
        n0 = pg.evaluate("() => document.querySelectorAll('#msgs .b.bot').length")
        pg.locator('#msgs button.anyway[data-anyway^="combined:"]').last.click()
        pg.wait_for_function("n => document.querySelectorAll('#msgs .b.bot').length > n", arg=n0, timeout=30000)
        pg.wait_for_timeout(400)
        r3 = pg.evaluate(LINE)
        c1 = pg.evaluate(COUNTS)
        pg.screenshot(path=f"{OUT}/3_do_it_anyway.png")
        check("3. Do it anyway runs that reading in the VSS-BERT drawing", bool(r3 and r3["readers"] == ["combined"] and "anyway" in r3["text"]) and c1 != c0, f"{r3!r}; shapes/links {c0} -> {c1}")
        send(pg, "undo")
        c2 = pg.evaluate(COUNTS)
        check("3. undo takes it back", c2 == c0, f"{c0} -> {c1} -> after undo {c2}")
        det = details(pg, 3)
        pg.screenshot(path=f"{OUT}/4_details.png")
        check("4. details show the VSS-BERT gate, its level and the file's threshold", f"VSS-BERT gate: safety threshold (it acts from confidence {T_COST:.4f})" in det and "not executed" in det, det[det.find("VSS-BERT"):][:400])
        check("4. details say which reading each request comes from", "SOP-BERT’s reading" in det or "VSS’s reading" in det, "")
        pg.keyboard.press("Escape"); pg.wait_for_timeout(300)

    # 7: Replies in the chat
    open_settings(pg)
    cks = pg.evaluate("() => [...document.querySelectorAll('#sbody input[data-chat]')].map(x => [x.dataset.chat, x.checked])")
    check("7. Settings › Replies in the chat: one checkbox per tab, in the order of the tabs, VSS-BERT checked", cks == [["combined", True], ["rules", False], ["vss", False], ["neural", False]], str(cks))
    pg.locator("#sbody input[data-chat=combined]").scroll_into_view_if_needed()
    pg.screenshot(path=f"{OUT}/7_chat_settings.png")
    pg.click("#sbody input[data-chat=combined]"); pg.wait_for_timeout(200)   # the page keeps it checked
    still = pg.evaluate("() => document.querySelector('#sbody input[data-chat=combined]').checked")
    check("7. the last chosen tab cannot be unchecked", still, str(still))
    for t in ["rules", "vss", "neural"]: pg.check(f"#sbody input[data-chat={t}]"); pg.wait_for_timeout(150)
    kept = pg.evaluate(STORED, "sop.chat.tabs")
    check("7. the choice is kept in localStorage", kept == "combined,rules,vss,neural", str(kept))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    r4 = send(pg, "Make Check orange.")
    pg.screenshot(path=f"{OUT}/7_all_tabs_reply.png")
    check("7. with the other tabs checked, the reply has every tab's line in the order of the tabs, each with its prefix", bool(r4 and r4["readers"] == ["combined", "rules", "vss", "neural"] and all(x and re.match(r"(VSS-BERT|Rules|VSS|SOP-BERT) · [\d.]+ ms:", x) for x in r4["prefixes"]) and not r4["who"]), str(r4))
    open_settings(pg)
    pg.uncheck("#sbody input[data-chat=combined]"); pg.uncheck("#sbody input[data-chat=vss]"); pg.uncheck("#sbody input[data-chat=neural]"); pg.wait_for_timeout(200)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    r4b = send(pg, "What is connected to Check?")
    check("7. only Rules checked: the chat shows the Rules' line alone, without a prefix", bool(r4b and r4b["readers"] == ["rules"] and r4b["prefix"] is None and r4b["who"] and r4b["who"].startswith("Rules")), str(r4b))

    # 2: no cut setting and no Benchmark tab
    open_settings(pg)
    pg.check("#sbody input[data-chat=combined]"); pg.uncheck("#sbody input[data-chat=rules]"); pg.wait_for_timeout(200)
    kept = pg.evaluate(STORED, "sop.chat.tabs")
    check("7. back to VSS-BERT only: nothing stored", kept is None, str(kept))
    sett = pg.evaluate("() => document.querySelector('#sbody').textContent")
    check("2. ⋮ › Settings has no cut setting", pg.locator("#sbody input[name=cut-strategy]").count() == 0 and "Cutting into requests" not in sett and "Each tab’s cutter" in sett, sett[:300])
    stabs = pg.evaluate("() => [...document.querySelectorAll('#stabs [data-stab]')].map(x => x.dataset.stab)")
    check("2. ⋮ › Settings has no Benchmark tab", stabs == ["settings", "plugins"], str(stabs))
    pg.screenshot(path=f"{OUT}/2_settings_sheet.png")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    r5 = send(pg, "Make Check orange.")
    check("2. nothing is stored under the old cut key", pg.evaluate(STORED, "sop.cut") is None, str(pg.evaluate(STORED, "sop.cut")))
    check("1. its time is VSS + SOP-BERT + combining", bool(r5 and r5["who"] and re.match(r"VSS-BERT · [\d.]+ ms$", r5["who"])), str(r5))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)

    # 5: Settings: the levels
    COSTL = ["cost1", "cost2", "cost5", "cost", "cost20"]
    pg.click("[data-sub=settings]"); pg.wait_for_timeout(300)
    pg.wait_for_function("() => document.querySelectorAll('#rpanel input[name=comb-gate]').length === 6", timeout=30000)
    levels = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=comb-gate]')].map(x => [x.value, x.checked])")
    lab = pg.evaluate("() => [...document.querySelectorAll('#rpanel input[name=comb-gate]')].map(x => x.parentElement.textContent)")
    rows = pg.evaluate("() => [...document.querySelectorAll('#rpanel .lvt tbody tr')].map(tr => [...tr.querySelectorAll('td')].slice(1).map(td => td.textContent.trim()))")
    pg.evaluate("() => { const r = document.querySelector('#rpanel'), t = document.querySelector('#rpanel .lvt'); r.scrollTop += t.getBoundingClientRect().top - r.getBoundingClientRect().top - 40; }")
    pg.screenshot(path=f"{OUT}/5_settings.png")
    check("5. settings: boldest / very bold / bolder / safety threshold / more careful / execute all, the safety threshold checked", levels == [[l, l == "cost"] for l in COSTL + ["all"]], str(levels))
    check("5. each cost level in plain words with the file's threshold", all(n in t and f"{LV[l]['threshold']:.4f}" in t and f"counts as {c} right answer" in t for n, l, c, t in zip(["Boldest", "Very bold", "Bolder", "Safety threshold", "More careful"], COSTL, [1, 2, 5, 10, 20], lab)), str(lab))
    EA = SPEC["cuts"][CUT]["execute_all"]
    want = [[PC(LV[l]["heldout_oof_coverage"]), PC(1 - LV[l]["heldout_oof_precision"]), PC(LV[l]["heldout_oof_asked"])] for l in COSTL] + [[PC(EA["heldout_oof_coverage"]), PC(1 - EA["heldout_oof_precision"]), PC(EA["heldout_oof_asked"])]]
    check("5. the table shows each level's numbers on the calibration part (done right, confidently wrong, asked, with % signs)", rows == want, f"{rows} vs {want}")
    pg.check("#rpanel input[name=comb-gate][value='cost20']"); pg.wait_for_timeout(200)
    check("5. more careful is kept in localStorage", pg.evaluate(STORED, "sop.combined.gate") == "cost20", "")
    pg.check("#rpanel input[name=comb-gate][value='cost2']"); pg.wait_for_timeout(200)
    kept = pg.evaluate(STORED, "sop.combined.gate")
    check("5. very bold (cost 2) is kept in localStorage", kept == "cost2", str(kept))
    r6 = send(pg, "Make Process yellow.")
    det6 = details(pg, 1)
    check(f"5. very bold acts from the file's cost-2 threshold ({LV['cost2']['threshold']:.4f})", f"VSS-BERT gate: very bold (it acts from confidence {LV['cost2']['threshold']:.4f})" in det6, det6[det6.find("VSS-BERT gate"):][:200])
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    sop = pg.click("[data-sub=sop]"); pg.wait_for_timeout(200)
    txt = pg.evaluate("() => (document.querySelector('#rpanel') || {}).textContent || ''")
    check("1. SOP Lang subtab shows the VSS-BERT drawing", "The VSS-BERT reader’s drawing" in txt, txt[:200])
    pg.click("[data-sub=drawing]"); pg.wait_for_timeout(200)

    # 9: zoom and pan (a pure view transform on the viewBox)
    VB = "() => document.querySelector('#canvas').getAttribute('viewBox').split(' ').map(Number)"
    PCT = "() => document.querySelector('#zoom-pct').textContent"
    vb0 = pg.evaluate(VB)
    pg.click("#zoom-in"); vb1 = pg.evaluate(VB)
    check("9. + zooms in: the viewBox is 1.25 times smaller, around the same centre; 125%", abs(vb1[2] - vb0[2] / 1.25) < 0.05 and abs((vb1[0] + vb1[2] / 2) - (vb0[0] + vb0[2] / 2)) < 0.05 and pg.evaluate(PCT) == "125%", f"{vb0} -> {vb1} {pg.evaluate(PCT)}")
    pg.click("#zoom-out"); pg.click("#zoom-out"); vb2 = pg.evaluate(VB)
    check("9. − zooms out: 80%, a larger viewBox", abs(vb2[2] - vb0[2] / 0.8) < 0.05 and pg.evaluate(PCT) == "80%", f"{vb2} {pg.evaluate(PCT)}")
    pg.click("#zoom-fit")
    check("9. fit restores the automatic viewBox and 100%", pg.evaluate(VB) == vb0 and pg.evaluate(PCT) == "100%", f"{pg.evaluate(VB)} vs {vb0}")
    tabs_vb = []
    pg.click("#zoom-in"); pg.click("[data-rtab=rules]"); pg.wait_for_timeout(200); tabs_vb.append(pg.evaluate(PCT)); pg.click("[data-rtab=combined]"); pg.wait_for_timeout(200)
    check("9. the zoom is shared by the tabs", tabs_vb == ["125%"] and pg.evaluate(PCT) == "125%", str(tabs_vb))
    bd = pg.evaluate("() => { const r = document.querySelector('.board').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }")
    # an empty spot of the canvas: no shape under it (the background panel counts as empty: it never moves)
    spot = pg.evaluate("""b => { for (let fy = 0.15; fy < 0.9; fy += 0.05) for (let fx = 0.05; fx < 0.95; fx += 0.05) { const x = b[0] + b[2] * fx, y = b[1] + b[3] * fy, e = document.elementFromPoint(x, y), g = e && e.closest('.shp');
      if (e && e.closest('#canvas') && (!g || g.classList.contains('bg') || /background/.test(g.getAttribute('class') || '') || g.dataset.name === 'Backdrop')) return [x, y]; } return null; }""", bd)
    vb3 = pg.evaluate(VB)
    pg.mouse.move(spot[0], spot[1]); pg.mouse.down(); pg.mouse.move(spot[0] + 50, spot[1] + 20, steps=4); pg.mouse.move(spot[0] + 100, spot[1] + 40, steps=4); pg.mouse.up()
    vb4 = pg.evaluate(VB)
    check("9. dragging the empty canvas pans: the view moves against the drag, same size", vb4[0] < vb3[0] - 10 and vb4[1] < vb3[1] - 3 and abs(vb4[2] - vb3[2]) < 0.01, f"{vb3} -> {vb4} (at {spot})")
    pg.screenshot(path=f"{OUT}/9_zoom_pan.png")
    # a shape drag still moves the shape, not the view
    sh = pg.evaluate("() => { const g = document.querySelector('#layer .shp[data-name=Start]'); const r = g.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
    pg.mouse.move(sh[0], sh[1]); pg.mouse.down(); pg.mouse.move(sh[0] + 30, sh[1] + 10, steps=5); pg.mouse.up(); pg.wait_for_timeout(200)
    sh2 = pg.evaluate("() => { const g = document.querySelector('#layer .shp[data-name=Start]'); const r = g.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
    check("9. dragging a shape still moves the shape, and the view stays", pg.evaluate(VB) == vb4 and sh2[0] > sh[0] + 15, f"{sh} -> {sh2}, {pg.evaluate(VB)}")
    # Ctrl+wheel around the pointer; arrow keys pan
    pg.mouse.move(spot[0], spot[1]); pg.keyboard.down("Control"); pg.mouse.wheel(0, -200); pg.keyboard.up("Control"); pg.wait_for_timeout(100)
    check("9. Ctrl+wheel zooms in", int(pg.evaluate(PCT).rstrip("%")) > 125, pg.evaluate(PCT))
    pg.focus("#canvas"); vb5 = pg.evaluate(VB); pg.keyboard.press("ArrowRight"); vb6 = pg.evaluate(VB)
    check("9. an arrow key pans when the canvas has focus", vb6[0] > vb5[0] and vb6[1] == vb5[1], f"{vb5} -> {vb6}")
    # shapes outside the view after a message: the fit button is a highlighted hint; the view does not jump
    for _ in range(25): pg.keyboard.press("ArrowRight")
    vb7 = pg.evaluate(VB); send(pg, "Make Process yellow.")
    check("9. after a message with shapes outside the view, fit is highlighted and the view does not jump", pg.evaluate("() => document.querySelector('#zoom-fit').classList.contains('hint')") and pg.evaluate(VB) == vb7, str(pg.evaluate(VB)))
    pg.screenshot(path=f"{OUT}/9_fit_hint.png")
    pg.click("#zoom-fit")
    check("9. fit: back to the automatic view, the hint gone", pg.evaluate(PCT) == "100%" and not pg.evaluate("() => document.querySelector('#zoom-fit').classList.contains('hint')"), "")

    # phone width
    pg.set_viewport_size({"width": 390, "height": 844}); pg.wait_for_timeout(500)
    vbp = pg.evaluate(VB); pg.click("#zoom-in"); vbq = pg.evaluate(VB)
    foot = pg.evaluate("() => { const f = document.querySelector('#cfoot').getBoundingClientRect(), b = document.querySelector('.board').getBoundingClientRect(); return f.left >= b.left && f.right <= b.right && f.bottom <= b.bottom + 0.5; }")
    check("9. phone width: the zoom buttons inside the drawing area and working", foot and abs(vbq[2] - vbp[2] / 1.25) < 0.05, f"{foot} {vbp} -> {vbq}")
    pg.screenshot(path=f"{OUT}/9_phone_zoom.png")
    pg.click("#zoom-fit")
    pg.screenshot(path=f"{OUT}/8_phone_chat.png")
    pg.click("[data-sub=settings]"); pg.wait_for_timeout(400)
    pg.evaluate("() => { const r = document.querySelector('#rpanel'), t = document.querySelector('#rpanel .lvt'); r.scrollTop += t.getBoundingClientRect().top - r.getBoundingClientRect().top - 40; }")
    pg.screenshot(path=f"{OUT}/8_phone_levels.png")
    wide = pg.evaluate("() => { const t = document.querySelector('#rpanel .lvt table'), w = document.querySelector('#rpanel .lvt'); return [t.scrollWidth, w.clientWidth]; }")
    check("5. at phone width the levels table fits without sideways scrolling", wide[0] <= wide[1] + 1, str(wide))
    pg.click("[data-sub=drawing]"); pg.wait_for_timeout(200)
    open_settings(pg)
    pg.screenshot(path=f"{OUT}/8_phone_chat_settings.png")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    pg.set_viewport_size({"width": 1280, "height": 860}); pg.wait_for_timeout(300)

    # the choices survive a reload (VSS-BERT very bold; the chat: VSS-BERT and SOP-BERT)
    open_settings(pg); pg.check("#sbody input[data-chat=neural]"); pg.wait_for_timeout(200); pg.keyboard.press("Escape")
    pg.reload(wait_until="domcontentloaded"); pg.wait_for_timeout(1500)
    first = pg.evaluate("() => (document.querySelector('#rtabs [aria-selected=true]') || {}).dataset.rtab")
    pg.click("[data-sub=settings]"); pg.wait_for_function("() => document.querySelectorAll('#rpanel input[name=comb-gate]').length === 6", timeout=60000)
    lv2 = pg.evaluate("() => (document.querySelector('#rpanel input[name=comb-gate]:checked') || {}).value")
    open_settings(pg)
    cks2 = pg.evaluate("() => [...document.querySelectorAll('#sbody input[data-chat]')].map(x => [x.dataset.chat, x.checked])")
    pg.keyboard.press("Escape")
    check("5. after a reload VSS-BERT is still very bold", lv2 == "cost2" and first == "combined", f"{lv2} {first}")
    check("7. after a reload the chat still shows VSS-BERT and SOP-BERT", cks2 == [["combined", True], ["rules", False], ["vss", False], ["neural", True]], str(cks2))
    check("6. no page error", not errors, "; ".join(errors[:3]))
    b.close()
httpd.shutdown()
print(f"screenshots: {OUT}")
print("PASS" if not fails else f"FAIL ({len(fails)})")
sys.exit(1 if fails else 0)
