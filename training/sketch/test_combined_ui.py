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
  2. with the default cut (VSS cutter) VSS-BERT reads the BERT cutter's requests itself (details: "read here", 2 SOP-BERT model calls);
     with the BERT cutter as the shared cut it reuses the two tabs' readings (details: "reused");
  3. a message with a request the two readers read the same is executed; a request below the combined threshold is not done, its reason
     is one of the combined reader's plain sentences (the readers disagree / only one reader found it / ...), with its confidence, the
     file's threshold and a "Do it anyway" button; clicking it runs that reading in the VSS-BERT drawing; undo takes it back;
  4. the details show "VSS-BERT gate: safety threshold (it acts from confidence <the file's threshold of the BERT cut>)";
  5. Settings: a table of the levels boldest (cost 1) / very bold (cost 2) / bolder (cost 5) / safety threshold / more careful (cost 20) /
     execute all (safety threshold checked), with the file's thresholds and each level's numbers on the calibration part (done right,
     confidently wrong, asked, with % signs; combined.json levels and execute_all); a choice other than the default is kept in localStorage
     and after a reload, the default removes it;
  4b. the VSS and SOP-BERT tabs use the confidence with the votes of the other readers: their details show vote3.json's thresholds per type
     (the check of the removed test_vote_ui.py);
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
REASONS = re.compile(r"the two readers disagree on|only one reader found this request|the two readers read different actions here|both readers read it the same way|it uses what")
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
  return { prefix: (rl.querySelector(':scope > b') || {}).textContent || null, who, readers, prefixes, text: rl.querySelector('.t').textContent, held: [...rl.querySelectorAll('.held li')].map(li => ({ src: li.querySelector('.src').textContent, why: li.querySelector('.why').textContent, button: !!li.querySelector('button.anyway') })) };
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
    pg.wait_for_function("() => { const t = document.querySelector('[data-rtab=combined]'); return t && !t.classList.contains('off'); }", timeout=900000)
    pg.wait_for_function("() => document.querySelectorAll('#msgs .b.bot').length >= 1 + (window.StartDiagram ? StartDiagram.MESSAGES.length : 3) && !document.querySelector('#msgs .typing')", timeout=180000)
    tabs = pg.evaluate("() => [...document.querySelectorAll('#rtabs [data-rtab]')].map(x => x.textContent.trim())")
    check("1. the tabs are VSS-BERT, Rules, VSS, SOP-BERT (no 3 readers tab)", tabs == ["VSS-BERT", "Rules", "VSS", "SOP-BERT"] and not pg.query_selector("[data-rtab=vote3]"), str(tabs))
    subs = pg.evaluate("() => [...document.querySelectorAll('#subtabs [data-sub]')].map(x => x.dataset.sub)")
    of = pg.evaluate("() => (document.querySelector('#subtabs .of') || {}).textContent")
    check("1. VSS-BERT has the subtabs Drawing / SOP Lang / Settings", subs == ["drawing", "sop", "settings"] and of == "VSS-BERT reader", f"{subs} {of}")
    pg.screenshot(path=f"{OUT}/0_start.png")

    # 1 + 2 + 3: the default cut (VSS cutter): VSS-BERT reads the BERT cut itself; the chat shows its line only, without a prefix
    r1 = send(pg, "Move Done below Start.")
    pg.screenshot(path=f"{OUT}/1_agree.png")
    check("1. the default chat shows only VSS-BERT's reply", bool(r1 and r1["readers"] == ["combined"]), str(r1))
    check("1. one line without the 'VSS-BERT · ms:' prefix; 'VSS-BERT · <ms>' is a quiet tag beside the time", bool(r1 and r1["prefix"] is None and r1["who"] and re.match(r"VSS-BERT · [\d.]+ ms$", r1["who"])), str(r1))
    check("3. a request both readers read the same is executed", bool(r1 and not r1["held"] and "Moved" in r1["text"]), str(r1))
    det1 = details(pg, 1)
    check("2. default cut: VSS-BERT read the BERT cutter's requests itself (2 SOP-BERT model calls)", "VSS-BERT: read here on the BERT cutter" in det1 and "2 SOP-BERT model calls" in det1, det1[det1.find("VSS-BERT:"):][:300])
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
        check("3. its reason is one of the combined reader's plain sentences", bool(REASONS.search(why)), why)
        check(f"3. the reason shows the confidence and the file's threshold ({T_COST:.2f})", f"it acts from {T_COST:.2f}" in why and "confidence " in why, why)
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

    # 2: the BERT cutter as the shared cut: the readings of the two tabs are reused
    open_settings(pg)
    pg.check("#sbody input[data-chat=combined]"); pg.uncheck("#sbody input[data-chat=rules]"); pg.wait_for_timeout(200)
    kept = pg.evaluate(STORED, "sop.chat.tabs")
    check("7. back to VSS-BERT only: nothing stored", kept is None, str(kept))
    pg.check("#sbody input[name=cut-strategy][value='bert']"); pg.wait_for_timeout(200)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    r5 = send(pg, "Make Check orange.")
    det5 = details(pg, 1)
    check("2. BERT cutter shared: VSS-BERT reuses the readings of the VSS and SOP-BERT tabs", "VSS-BERT: the readings of the VSS and SOP-BERT tabs on the BERT cutter" in det5 and "reused" in det5, det5[det5.find("VSS-BERT:"):][:300])
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

    # phone width
    pg.set_viewport_size({"width": 390, "height": 844}); pg.wait_for_timeout(500)
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
