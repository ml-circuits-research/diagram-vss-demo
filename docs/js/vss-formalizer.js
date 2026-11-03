// vss-formalizer.js: the VSS formalizer of the demo: formalize(text, ctx) -> the composer (vss-composer.js): the cutter, the
// micro-worlds of ../model/micro/registry.json, and the router; loaded on first use.
// Exposes window.VSSFormalizer = { formalize, loadComposerAt, composerInfo, cacheSaved, cut, CUT_STRATEGIES, DEFAULT_CUT, loadConfidence, gate, confidenceInfo,
// GATE_LEVELS, DEFAULT_GATE }. The gate (vss-confidence.js, model docs/model/confidence/vss.json, versioned like every model): a request is executed only
// when its combined confidence clears the threshold of the chosen level (default "cost": the cost-score threshold of vss.json; or a
// precision level 95 / 97 / 99 when the model reaches it). (The single-model path, ../model/real/ read with
// ?vss=single, was removed on 2026-11-02; it is in git history.)
import { load as loadVSS } from "./vss.js";
import { loadComposer, cutUnits, CUT_STRATEGIES, DEFAULT_CUT } from "./vss-composer.js";
import * as CONF from "./vss-confidence.js";
export { CUT_STRATEGIES, DEFAULT_CUT };
export const GATE_LEVELS = CONF.LEVELS, DEFAULT_GATE = CONF.DEFAULT_LEVEL;

// ---- model versions (owner's rule 2026-11-02: never use an older model after a new one is published). versions.json (written by
// training/sketch/stamp_models.py) maps every model folder / file under docs/model/ to a content version; every model URL gets
// ?v=<version>, so a new version is a new URL (HTTP cache and service workers cannot serve the old one) and an unchanged model stays cached.
// versions.json and registry.json are small and fetched with cache: "no-cache" (always revalidated).
const MODEL_ROOT = new URL("../model/", import.meta.url).href;
let versionsP = null;
function versions() { return versionsP || (versionsP = (async () => { try { const r = await fetch(new URL("versions.json", MODEL_ROOT), { cache: "no-cache" }); return r.ok ? (await r.json()).files || {} : {}; } catch (e) { return {}; } })()); }
let vmap = {};   // path under docs/model/ -> version; filled by ensureVersions()
async function ensureVersions() { vmap = await versions(); }
/** the URL with ?v=<version> of the longest model folder / file of versions.json that contains it (urls outside docs/model/ are unchanged) */
function versioned(url) {
  const u = new URL(url), root = new URL(MODEL_ROOT);
  if (u.origin !== root.origin || !u.pathname.startsWith(root.pathname)) return u.href;
  const rel = u.pathname.slice(root.pathname.length).split("/");
  for (let n = rel.length; n > 0; n--) { const v = vmap[rel.slice(0, n).join("/")]; if (v) { u.searchParams.set("v", v); break; } }
  return u.href;
}
// ---- the persistent cache (Cache API, cache MODEL_CACHE): the bytes of every versioned model file (URL with ?v=<version>), kept across
// visits. A versioned URL never changes content (a new version is a new URL), so a file found there is used without asking the server (the
// HTTP cache of GitHub Pages expires after 10 minutes, then every file is asked again); the manifest's sha256 still checks the model files.
// What is kept is the files as downloaded: the route book's 8-bit phase codes ARE the ready-to-use arrays (loader.js keeps them as codes,
// routebook.js reads cos / sin from a 256-level table), so the decoded tables would be 8x larger to store and slower to read back than
// to rebuild. A downloaded file is stored only after the whole composer loaded (the manifests' sha256 passed), then the entries of other
// versions are deleted; if loading fails after files came from the cache, the cache is dropped, so that the next load downloads them.
// Every storage call is in try / catch: without the Cache API (private window, storage blocked or full) the files come from the network
// as before. ?vsscache=0 turns it off.
const MODEL_CACHE = "vss-models";
const fromCache = new WeakSet();                             // the buffers read from the persistent cache (checked before they were stored)
const store = { opening: null, cache: null, hits: 0, misses: 0, putFails: 0, hitBytes: 0, error: null, toPut: [], saved: null, evicted: 0 };
const cacheOff = () => { try { return typeof location !== "undefined" && new URLSearchParams(location.search).get("vsscache") === "0"; } catch (e) { return false; } };
function modelCache() {
  if (!store.opening) store.opening = (async () => {
    store.cache = null;
    if (cacheOff()) { store.error = "turned off (?vsscache=0)"; return null; }
    try { if (typeof caches !== "undefined") store.cache = await caches.open(MODEL_CACHE); else store.error = "no Cache API in this browser"; }
    catch (e) { store.error = `the Cache API is not available: ${e && e.message || e}`; }
    return store.cache;
  })();
  return store.opening;
}
/** the bytes of a versioned URL from the persistent cache, else from the network (then kept); unversioned URLs only from the network */
async function getBytes(vurl, init) {
  const keep = /[?&]v=/.test(vurl) && !(init && init.cache === "no-cache"), c = keep ? await modelCache() : null;
  if (c) {
    try { const r = await c.match(vurl); if (r) { const b = await r.arrayBuffer(); store.hits++; store.hitBytes += b.byteLength; fromCache.add(b); return b; } }
    catch (e) { store.error = `reading the cache failed: ${e && e.message || e}`; }
  }
  const r = await fetch(vurl, init); if (!r.ok) throw new Error(`${vurl}: HTTP ${r.status}`);
  const b = await r.arrayBuffer();
  if (c) { store.misses++; store.toPut.push([vurl, b, r.headers.get("Content-Type") || "application/octet-stream"]); }
  return b;
}
/** store the files downloaded in this load (after it succeeded), then delete the other versions; sets store.saved */
async function saveToCache() {
  const c = store.cache, todo = store.toPut; store.toPut = [];
  if (!c) return store.saved;
  let ok = true;
  for (const [url, b, type] of todo) {
    try { await c.put(url, new Response(b, { headers: { "Content-Type": type } })); }   // the body is a copy of the bytes
    catch (e) { ok = false; store.putFails++; store.error = `storing in the cache failed: ${e && e.message || e}`; }   // full or blocked: loaded anyway
  }
  store.evicted += await evictOtherVersions();
  store.saved = ok && store.putFails === 0;
  return store.saved;
}
/** after a failed load: drop the cache if anything came from it (a damaged entry must not fail every later visit) */
async function dropCacheAfterFailure() {
  store.toPut = [];
  if (!store.cache || !store.hits) return;
  try { await caches.delete(MODEL_CACHE); } catch (e) { /* nothing more to do */ }
  store.opening = null; store.hits = 0; store.misses = 0; store.hitBytes = 0;
}
/** delete the cached files that are not the current version of their URL (an older or newer model, a file no longer listed) */
async function evictOtherVersions() {
  const c = store.cache; if (!c) return 0;
  let n = 0;
  try {
    for (const req of await c.keys()) {
      const u = new URL(req.url), v = u.searchParams.get("v"); u.searchParams.delete("v");
      if (versioned(u.href) !== req.url || !v) { await c.delete(req); n++; }
    }
  } catch (e) { store.error = `cleaning the cache failed: ${e && e.message || e}`; }
  return n;
}
/** what the cache did in this load: state "hit" (every model file from it), "partial", "miss" (none: first visit or a new version), "off" */
function cacheState() {
  const state = !store.cache ? "off" : store.misses === 0 && store.hits > 0 ? "hit" : store.hits === 0 ? "miss" : "partial";
  return { state, hits: store.hits, misses: store.misses, bytesFromCache: store.hitBytes, putFails: store.putFails, saved: store.saved, evicted: store.evicted, error: store.error };
}

async function fetchSize(url, acc, init) { const b = await getBytes(init && init.cache === "no-cache" ? String(url) : versioned(String(url)), init); acc.bytes += b.byteLength; return b; }
// hosts that serve no binary files get the .bin files as base64 text parts listed in bin-parts.json; the manifest's sha256 still checks them
// (bin-parts.json and its parts are in the model folder, so they carry the folder's version too)
async function fetchBin(base, name, acc) {
  try { return await fetchSize(new URL(name, base), acc); } catch (e) {
    const parts = JSON.parse(new TextDecoder().decode(await fetchSize(new URL("bin-parts.json", base), acc)))[name];
    if (!parts) throw e;
    let b64 = ""; for (const p of parts) { const r = await fetch(versioned(new URL(p, base).href)); if (!r.ok) throw new Error(`${p}: HTTP ${r.status}`); b64 += await r.text(); }
    const bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    acc.bytes += u8.byteLength; return u8.buffer;
  }
}

// ---- the composer: every model folder of the registry, loaded with the same fetch code. The files of all worlds are requested at once
// (the registry's order first), then each world is decoded when its files are in; the times are kept in comp.phases
const comp = { c: null, loading: null, bytes: 0, loadMs: 0, registry: null, root: null, sizes: new Map(), phases: null };   // bytes: registry and cutters; sizes: bytes per model folder
const WORLD_FILES = ["manifest.json", "model.json", "routebook.bin", "stars.json", "front.json"];   // a vss-web-3 folder (an older one asks for the rest)
const yieldToPage = () => new Promise((r) => setTimeout(r, 0));
async function modelAt(base, ph) {
  const cache = new Map(), acc = { bytes: 0 }; comp.sizes.set(base, acc);
  const getFile = (name) => { if (!cache.has(name)) { const p = name.endsWith(".bin") ? fetchBin(base, name, acc) : fetchSize(new URL(name, base), acc); p.catch(() => {}); cache.set(name, p); } return cache.get(name); };
  const t0 = performance.now();
  WORLD_FILES.forEach(getFile);
  try { await Promise.all(WORLD_FILES.filter((n) => n !== "front.json").map(getFile)); }
  catch (e) { await ph.turn(base); ph.done(base); throw e; }  // the next world still gets its turn
  ph.netMs = Math.max(ph.netMs, performance.now() - ph.t0);
  await ph.turn(base);                                        // decode one world at a time, in the registry's order
  try {
    const t1 = performance.now(), readFile = async (name) => { const b = await getFile(name); return name.endsWith(".json") ? new TextDecoder().decode(b) : b; };
    const checked = new Set(); for (const n of cache.keys()) { const b = await getFile(n).catch(() => null); if (b && fromCache.has(b)) checked.add(n); }
    const vss = await loadVSS(null, { readFile, sentenceCandidates: true, verified: (n) => checked.has(n) });
    let F = null; try { F = JSON.parse(await readFile("front.json")); } catch (e) { F = null; }
    ph.decodeMs += performance.now() - t1; ph.worlds.push({ base, filesMs: Math.round(t1 - t0), decodeMs: Math.round(performance.now() - t1) });
    return { vss, F };
  } finally { ph.done(base); await yieldToPage(); }
}
/** one world decoded at a time, in the given order (the page gets a turn between two worlds) */
function decodeTurns(order) {
  let next = 0; const waiting = new Map();
  const wake = () => { const w = waiting.get(order[next]); if (w) { waiting.delete(order[next]); w(); } };
  return {
    turn: (base) => (order[next] === base || !order.includes(base) ? Promise.resolve() : new Promise((r) => waiting.set(base, r))),
    done: (base) => { if (order[next] === base) { next++; wake(); } },
  };
}
/** load the composer: root = the docs/model/ folder (registry at micro/registry.json, model folders relative to root) */
export async function loadComposerAt(root = new URL("../model/", import.meta.url).href) {
  if (comp.c) return comp.c;
  if (!comp.loading) comp.loading = (async () => {
    try { return await loadAll(root); } catch (e) { comp.loading = null; await dropCacheAfterFailure(); throw e; }
  })();
  return comp.loading;
}
/** cacheSaved(): resolves once the files of the last load are stored in the persistent cache (true), could not all be stored (false) */
export function cacheSaved() { return comp.saving || Promise.resolve(store.saved); }
async function loadAll(root) {
  comp.root = root; await ensureVersions(); const t0 = performance.now(), json = async (u, init) => JSON.parse(new TextDecoder().decode(await fetchSize(new URL(u, root), comp, init)));
  const registry = await json("micro/registry.json", { cache: "no-cache" }); comp.registry = registry;
  const bases = (registry.worlds || []).map((e) => new URL(e.model.replace(/\/?$/, "/"), root).href);
  const ph = Object.assign({ t0, netMs: 0, decodeMs: 0, worlds: [] }, decodeTurns(bases));
  const models = new Map(bases.map((b) => { const p = modelAt(b, ph); p.catch(() => {}); return [b, p]; }));   // every world's files at once
  const cutterP = json(registry.cutter), contextP = registry.router === "cutter" ? json(registry.context || "context/weights.json") : undefined;   // CandidateRouter needs the context filler
  const eventP = registry.event_cutter ? json(registry.event_cutter) : undefined;   // the event hint (vss-composer.js, EVENT_HINT.md)
  [cutterP, contextP, eventP].forEach((p) => p && p.catch(() => {}));
  const [cutter, context, eventCutter] = await Promise.all([cutterP, contextP, eventP]);
  comp.c = await loadComposer(registry, cutter, (name) => models.get(new URL(name.replace(/\/?$/, "/"), root).href), { context, eventCutter });
  comp.loadMs = performance.now() - t0;
  comp.phases = { netMs: Math.round(ph.netMs), decodeMs: Math.round(ph.decodeMs), totalMs: Math.round(comp.loadMs), worlds: ph.worlds };
  comp.saving = saveToCache();                              // after the load, not before it: the page does not wait for the writes
  return comp.c;
}

/** a whole message -> the composer's reading: units of the cutter, routed to the micro-worlds; each unit carries its world. The third argument (the rules' formalize) is not used; opts.composer may name another
 *  docs/model/ root (a string); opts.units: the units of another cut ([{c0, c1}], see cut below; the demo's votes), read instead of the
 *  cutter's own (vss-composer.js, "units of another cut"). */
export async function formalize(text, ctx, _rulesFormalize, opts = {}) {
  const c = await loadComposerAt(typeof opts.composer === "string" ? opts.composer : undefined);
  return Array.isArray(opts.units) ? c.formalize(text, ctx, { units: opts.units }) : c.formalize(text, ctx);
}

/** the units of one cutter (the demo: the VSS cutter's units for the other readers' votes): cut(text, ctx, strategy, env) -> Promise<[{c0, c1, src}]>. strategy "rules" | "vss" |
 *  "bert" (vss-composer.js cutUnits); "vss" loads the composer (its cutter) first. env: {rules: a logic.js system, neural: NeuralKit}. */
export async function cut(text, ctx = {}, strategy = DEFAULT_CUT, env = {}) {
  const composer = strategy === "vss" ? await loadComposerAt() : null;
  return cutUnits(text, ctx, strategy, Object.assign({}, env, composer ? { composer } : {}));
}

/** what the demo shows about the composer: its worlds (model folder, actions), router, event hint, bytes and load time; phases {netMs (until
 *  the last world's files were in), decodeMs (decoding the worlds), totalMs, worlds}; cache (cacheState: state "hit" = every model file
 *  from this browser's cache, "partial", "miss", "off") */
export function composerInfo() {
  const r = comp.registry; if (!comp.c || !r) return null;
  const size = (name) => { const a = comp.sizes.get(new URL(name.replace(/\/?$/, "/"), comp.root).href); return a ? a.bytes : 0; };
  const models = [...comp.sizes.values()].reduce((a, x) => a + x.bytes, 0);
  return { composer: true, bytes: comp.bytes + models, cutterBytes: comp.bytes, loadMs: comp.loadMs, phases: comp.phases, cache: cacheState(), about: r.about || "", router: r.router || "", hint: r.event_cutter ? (r.event_hint || "H1") : null,
    worlds: (r.worlds || []).map((w) => ({ world: w.world, model: w.model.replace(/^micro\//, ""), events: w.events || [], bytes: size(w.model) })) };
}

// ---- the confidence gate (vss-confidence.js): the model docs/model/confidence/vss.json (PRECISION.md), fetched with ?v=<version>
const conf = { model: null, loading: null };
/** load the confidence model once -> the parsed file ({readers: {vss_combined: ...}}) */
export async function loadConfidence() {
  if (conf.model) return conf.model;
  if (!conf.loading) conf.loading = (async () => { await ensureVersions(); const b = await fetchSize(new URL("confidence/vss.json", MODEL_ROOT).href, { bytes: 0 }); conf.model = JSON.parse(new TextDecoder().decode(b)); comp.saving = (comp.saving || Promise.resolve()).then(saveToCache); return conf.model; })();
  return conf.loading;
}
/** the gate over a formalize() result at a level ("cost" | "95" | "97" | "99" | "all"; default "cost") -> vss-confidence.js gate(): {threshold, units
 *  (each with conf, execute, reasons), executed (the nodes to run), held (the units not executed)} */
export async function gate(result, level = CONF.DEFAULT_LEVEL) {
  let model = null; try { model = await loadConfidence(); } catch (e) { conf.loading = null; conf.error = e; }   // no model: every request is asked
  return CONF.gate(model, result, level);
}
/** what the settings show about the gate: per level its threshold and the out-of-fold calibration precision / right share / asked share
 *  (the "cost" level also its kind and cost score) */
export function confidenceInfo() {
  if (!conf.model) return null;
  const sp = CONF.specOf(conf.model), v = vmap["confidence/vss.json"] || null;
  return { version: v, operating: conf.model.operating_level, best: sp.best_reachable_heldout_oof_precision ?? null, source: sp.threshold_source || "",
    effective: (l) => CONF.effectiveLevel(conf.model, l),
    levels: Object.fromEntries(Object.entries(sp.levels || {}).map(([k, L]) => [k, L ? { threshold: L.threshold, kind: L.kind || null, score: L.heldout_oof_score ?? null, cost: L.cost ?? null, executed: L.heldout_oof_executed ?? L.heldout_executed ?? null, precision: L.heldout_oof_precision ?? L.heldout_precision, coverage: L.heldout_oof_coverage ?? L.heldout_coverage, asked: L.heldout_oof_asked ?? L.heldout_asked } : null])) };
}

if (typeof window !== "undefined") window.VSSFormalizer = { formalize, loadComposerAt, composerInfo, cacheSaved, cut, CUT_STRATEGIES, DEFAULT_CUT, loadConfidence, gate, confidenceInfo, GATE_LEVELS, DEFAULT_GATE };
