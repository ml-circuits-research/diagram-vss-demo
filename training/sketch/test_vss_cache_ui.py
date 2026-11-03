#!/usr/bin/env python3
"""test_vss_cache_ui.py: the persistent cache of the VSS models in a real browser (Playwright, Chromium; docs/js/vss-formalizer.js,
Cache API cache "vss-models", keyed by the versioned URLs ?v=<version> of docs/model/versions.json).

Run:  python3 training/sketch/test_vss_cache_ui.py            (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers in this sandbox)
It serves docs/ like GitHub Pages (Cache-Control: max-age=600, ETag / Last-Modified, 304 on a conditional request) on a free local port, in
one persistent browser profile; the neural model and the transformers.js library are unreachable (memory). Steps:
  1. first visit: every model file comes from the network ("miss"), and is stored once the composer loaded (cacheSaved() -> true);
  2. reload with the HTTP cache cleared: every model file comes from the persistent cache ("hit"), no model file of micro/ is asked from
     the server, and the readings of 25 sample messages are identical to step 1 (the nodes, notes, ignored parts, asks, and every unit's
     world, event, status and confidence signals);
  3. a version change (versions.json says micro/help8 has another version): only help8's files are downloaded ("partial"), the old
     version's entries are deleted, the new ones stored; same readings;
  4. storage failures: caches.open rejects ("off"), Cache.put rejects (loaded, saved false), Cache.match rejects (loaded from the network):
     VSS loads every time, same readings; ?vsscache=0 turns the cache off.
Exit code 0 when everything passes.
"""
import functools, http.server, json, os, socketserver, sys, tempfile, threading, shutil

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.sync_api import sync_playwright  # noqa: E402

REPO = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
DOCS = os.path.join(REPO, "docs")
VERSIONS = json.load(open(os.path.join(DOCS, "model", "versions.json")))
REG = json.load(open(os.path.join(DOCS, "model", "micro", "registry.json")))
fails = []
def check(name, ok, detail=""):
    print(("ok   " if ok else "FAIL ") + name + ("" if ok or not detail else f"\n     {detail}"))
    if not ok: fails.append(name)

# ---- a GitHub Pages-like server: max-age=600, ETag + Last-Modified, 304; versions.json can be replaced (step 3); requests are logged
served = {"versions": None, "log": []}
class Pages(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header("Cache-Control", "max-age=600"); super().end_headers()
    def send_head(self):
        served["log"].append(self.path)
        if self.path.split("?")[0] == "/model/versions.json" and served["versions"] is not None:
            body = json.dumps(served["versions"]).encode()
            self.send_response(200); self.send_header("Content-type", "application/json"); self.send_header("Content-Length", str(len(body))); self.end_headers()
            import io; return io.BytesIO(body)
        path = self.translate_path(self.path)
        if not os.path.isfile(path): return super().send_head()
        st = os.stat(path); etag = '"%x-%x"' % (int(st.st_mtime), st.st_size); lm = self.date_time_string(st.st_mtime)
        if self.headers.get("If-None-Match") == etag or (not self.headers.get("If-None-Match") and self.headers.get("If-Modified-Since") == lm):
            self.send_response(304); self.send_header("ETag", etag); self.end_headers(); return None
        f = open(path, "rb")
        self.send_response(200); self.send_header("Content-type", self.guess_type(path)); self.send_header("Content-Length", str(st.st_size))
        self.send_header("ETag", etag); self.send_header("Last-Modified", lm); self.end_headers(); return f

httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Pages, directory=DOCS)); httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{httpd.server_address[1]}/"

# ---- 25 sample messages (training/sketch/eval/sample1000, spread over its folders)
S = os.path.join(REPO, "training", "sketch", "eval", "sample1000"); rows = []
for d in sorted(os.listdir(S)):
    for f in sorted(x for x in os.listdir(os.path.join(S, d)) if x.endswith(".jsonl")):
        rows += [json.loads(l) for l in open(os.path.join(S, d, f)) if l.strip()]
MSGS = [{"text": r["text"], "names": r.get("names") or []} for r in rows[:: max(1, len(rows) // 25)][:25]]

READY = "() => { const t = document.querySelector('[data-rtab=vss]'); return t && !t.classList.contains('off'); }"
READ = """async (msgs) => { const out = [];
  for (const m of msgs) { const r = await VSSFormalizer.formalize(m.text, { names: m.names, last: [] });
    out.push({ nodes: r.nodes, notes: r.notes, ignored: r.ignored, asks: r.asks, units: r.units.map(u => ({ src: u.src, world: u.world, event: u.event, status: u.status, signals: u.signals, decidedBy: u.decidedBy, tried: u.tried })) }); }
  return JSON.stringify(out); }"""
INFO = "async () => { const ok = await VSSFormalizer.cacheSaved(); return Object.assign({ savedNow: ok }, VSSFormalizer.composerInfo().cache); }"
KEYS = "async () => { try { const c = await caches.open('vss-models'); return (await c.keys()).map(r => r.url.replace(location.origin, '')); } catch (e) { return null; } }"
MODEL_FILES = 5 * len(REG["worlds"]) + 3          # five files per world + the cutter, the event cutter, the context filler

def visit(ctx, url=base, init=None, clear_http=False):
    pg = ctx.new_page(); errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    if init: pg.add_init_script(init)
    if clear_http: ctx.new_cdp_session(pg).send("Network.clearBrowserCache")
    served["log"].clear()
    pg.goto(url, wait_until="domcontentloaded"); pg.wait_for_function(READY, timeout=300000)
    info = pg.evaluate(INFO); readings = pg.evaluate(READ, MSGS); keys = pg.evaluate(KEYS)
    asked = [p for p in served["log"] if p.startswith("/model/micro/") and "registry.json" not in p]
    pg.close(); return info, readings, keys, asked, errors

with sync_playwright() as p:
    ud = tempfile.mkdtemp(prefix="vss-cache-ui-")
    ctx = p.chromium.launch_persistent_context(ud, args=["--host-resolver-rules=MAP cdn.jsdelivr.net ~NOTFOUND, MAP huggingface.co ~NOTFOUND"], viewport={"width": 1280, "height": 860})
    ctx.add_init_script("try { localStorage.setItem('sop.chat.tabs', 'vss'); } catch (e) {}")
    try:
        # 1. first visit
        i1, r1, k1, a1, e1 = visit(ctx)
        check("1 first visit: every model file from the network (miss)", i1["state"] == "miss" and i1["misses"] >= MODEL_FILES and i1["hits"] == 0, json.dumps(i1))
        check("1 the downloaded files are stored after the load", i1["savedNow"] is True and k1 is not None and len(k1) >= MODEL_FILES, f"saved {i1['savedNow']}, {len(k1 or [])} keys")
        check("1 every stored URL is versioned (?v=)", all("?v=" in k for k in k1 or []), str([k for k in k1 or [] if "?v=" not in k][:3]))
        check("1 no page error", not e1, str(e1[:2]))
        # 2. reload with the HTTP cache cleared: the persistent cache alone
        i2, r2, k2, a2, e2 = visit(ctx, clear_http=True)
        check("2 reload: every model file from the persistent cache (hit)", i2["state"] == "hit" and i2["misses"] == 0 and i2["hits"] >= MODEL_FILES, json.dumps(i2))
        check("2 no model file of micro/ asked from the server", not a2, str(a2[:5]))
        check("2 the readings are identical to the first visit's", r2 == r1, "readings differ")
        check("2 no page error", not e2, str(e2[:2]))
        # 3. a new version of one world
        old = VERSIONS["files"]["micro/help8"]; served["versions"] = json.loads(json.dumps(VERSIONS)); served["versions"]["files"]["micro/help8"] = "0123456789"
        i3, r3, k3, a3, e3 = visit(ctx, clear_http=True)
        check("3 version change: only that world's 5 files are downloaded (partial)", i3["state"] == "partial" and i3["misses"] == 5 and all("/help8/" in a for a in a3) and len(a3) == 5, json.dumps(i3) + " asked " + str(a3))
        check("3 the old version's entries are deleted, the new ones stored", i3["evicted"] >= 5 and not any(f"v={old}" in k for k in k3) and sum("help8" in k and "v=0123456789" in k for k in k3) == 5, str([k for k in k3 if "help8" in k]))
        check("3 the readings are identical", r3 == r1)
        served["versions"] = None
        i3b, r3b, k3b, _, _ = visit(ctx, clear_http=True)       # and back: the published version is a miss again for help8 only
        check("3 back to the published version: help8 downloaded again, the test version deleted", i3b["state"] == "partial" and i3b["misses"] == 5 and not any("0123456789" in k for k in k3b), json.dumps(i3b))
        # 4. storage failures: the normal path
        i4, r4, _, _, e4 = visit(ctx, init="caches.open = () => Promise.reject(new DOMException('blocked', 'SecurityError'));")
        check("4 caches.open rejects: loaded from the network (off), same readings", i4["state"] == "off" and r4 == r1 and not e4, json.dumps(i4))
        i5, r5, _, _, e5 = visit(ctx, init="Cache.prototype.match = () => Promise.reject(new Error('broken')); Cache.prototype.put = () => Promise.reject(new DOMException('full', 'QuotaExceededError'));")
        check("4 Cache.match and Cache.put reject (storage full): loaded from the network, not saved, same readings", i5["state"] == "miss" and i5["savedNow"] is False and i5["putFails"] >= MODEL_FILES and r5 == r1 and not e5, json.dumps(i5))
        i6, r6, _, _, e6 = visit(ctx, init="Object.defineProperty(window, 'caches', { value: undefined, configurable: true });")
        check("4 no Cache API: loaded from the network (off), same readings", i6["state"] == "off" and r6 == r1 and not e6, json.dumps(i6))
        i7, r7, _, _, _ = visit(ctx, url=base + "?vsscache=0")
        check("4 ?vsscache=0: cache off, same readings", i7["state"] == "off" and r7 == r1, json.dumps(i7))
        i8, r8, _, a8, _ = visit(ctx, clear_http=True)
        check("4 after the failures the cache still serves every file", i8["state"] == "hit" and not a8 and r8 == r1, json.dumps(i8))
    finally:
        ctx.close(); shutil.rmtree(ud, ignore_errors=True); httpd.shutdown()

print(f"{len(MSGS)} messages compared; " + ("FAIL: " + ", ".join(fails) if fails else "all passed"))
sys.exit(1 if fails else 0)
