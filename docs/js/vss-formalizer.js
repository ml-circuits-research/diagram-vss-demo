// vss-formalizer.js: the VSS formalizer of the demo. Clauses come from the rules segmenter (the same cut every formalizer gets); each
// clause is normalized (snorm.js), read by the VSS reader trained on the sketch world (vss.js, model in ../model/real/ with its learned front end front.js / front.json), and turned into
// the demo's wires (vss-adapter.js). Exposes window.VSSFormalizer = { load, formalize, readClause, info }.
// Option (off by default): formalize(text, ctx, rules, { composer: true }) -> the composer (vss-composer.js): the cutter
// (../model/micro/cutter.json), the micro-worlds of ../model/micro/registry.json, the router and the fallback world; loaded on first use.
import { load as loadVSS } from "./vss.js";
import { compile, normalize } from "./snorm.js";
import * as FRONT from "./front.js";
import { vssCentres } from "./vss-centers.js";
import { readingFromWires, readingFromGold, toNodes } from "./vss-adapter.js";
import { loadComposer, nextContext } from "./vss-composer.js";

const state = { vss: null, table: null, lexicon: null, verbs: null, verbEvent: null, bytes: 0, loadMs: 0, base: null };

async function fetchSize(url, acc = state) { const r = await fetch(url); if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`); const b = await r.arrayBuffer(); acc.bytes += b.byteLength; return b; }
// hosts that serve no binary files get the .bin files as base64 text parts listed in bin-parts.json; the manifest's sha256 still checks them
async function fetchBin(base, name, acc = state) {
  try { return await fetchSize(new URL(name, base), acc); } catch (e) {
    const parts = JSON.parse(new TextDecoder().decode(await fetchSize(new URL("bin-parts.json", base), acc)))[name];
    if (!parts) throw e;
    let b64 = ""; for (const p of parts) { const r = await fetch(new URL(p, base)); if (!r.ok) throw new Error(`${p}: HTTP ${r.status}`); b64 += await r.text(); }
    const bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    acc.bytes += u8.byteLength; return u8.buffer;
  }
}

export async function load(base = new URL("../model/real/", import.meta.url).href) {
  if (state.vss) return info();
  const t0 = performance.now(); state.base = base; state.bytes = 0;
  const cache = new Map();
  const readFile = async (name) => { if (!cache.has(name)) cache.set(name, name.endsWith(".bin") ? await fetchBin(base, name) : await fetchSize(new URL(name, base))); const b = cache.get(name); return name.endsWith(".json") ? new TextDecoder().decode(b) : b; };
  state.vss = await loadVSS(null, { readFile, sentenceCandidates: true });
  try { state.front = JSON.parse(await readFile("front.json")); } catch (e) { state.front = null; }   // the learned front end (world real)
  if (!state.front) state.table = compile(JSON.parse(await readFile("normalize.json")));
  const m = state.vss.model;
  state.lexicon = new Set(Object.keys(m.lexicon || {}));
  state.verbs = {}; state.verbEvent = new Map();
  for (const e of m.legend.events || []) { state.verbs[e.id] = e.verbs || []; for (const v of e.verbs || []) state.verbEvent.set(v, e.id); }
  state.loadMs = performance.now() - t0;
  return info();
}

// ---- the composer (option `composer` of formalize): every model folder of the registry, loaded with the same fetch code
const comp = { c: null, loading: null, bytes: 0, loadMs: 0, registry: null };
async function modelAt(base) {
  const cache = new Map();
  const readFile = async (name) => { if (!cache.has(name)) cache.set(name, name.endsWith(".bin") ? await fetchBin(base, name, comp) : await fetchSize(new URL(name, base), comp)); const b = cache.get(name); return name.endsWith(".json") ? new TextDecoder().decode(b) : b; };
  const vss = await loadVSS(null, { readFile, sentenceCandidates: true });
  let F = null; try { F = JSON.parse(await readFile("front.json")); } catch (e) { F = null; }
  return { vss, F };
}
/** load the composer: root = the docs/model/ folder (registry at micro/registry.json, model folders relative to root) */
export async function loadComposerAt(root = new URL("../model/", import.meta.url).href) {
  if (comp.c) return comp.c;
  if (!comp.loading) comp.loading = (async () => {
    const t0 = performance.now(), json = async (u) => JSON.parse(new TextDecoder().decode(await fetchSize(new URL(u, root), comp)));
    const registry = await json("micro/registry.json"), cutter = await json(registry.cutter); comp.registry = registry;
    const context = registry.router === "cutter" ? await json(registry.context || "context/weights.json") : undefined;   // CandidateRouter needs the context filler
    const eventCutter = registry.event_cutter ? await json(registry.event_cutter) : undefined;   // the event hint (vss-composer.js, EVENT_HINT.md)
    comp.c = await loadComposer(registry, cutter, (name) => modelAt(new URL(name.replace(/\/?$/, "/"), root).href), { context, eventCutter });
    comp.loadMs = performance.now() - t0; return comp.c;
  })();
  return comp.loading;
}

export function info() {
  if (!state.vss) return null;
  const m = state.vss.model, man = state.vss.manifest || {};
  return { D: m.config && m.config.D, bytes: state.bytes, loadMs: state.loadMs, legend: m.legend_sha256, bits: man.bits, commit: man.training_commit, files: man.files };
}

/** one clause -> { nodes, notes, reading, vss } */
export function readClause(src, ctx, seq) {
  const names = (ctx.names || []).concat([...(ctx.refs ? ctx.refs.keys() : [])]);
  const { tokens, info: ninfo } = state.front ? FRONT.normalize(src, names, state.front) : normalize(state.table, state.lexicon, src, names);
  const text = tokens.join(" ");
  const r = state.vss.read(text);
  const verb = tokens.find((t) => state.verbEvent.has(t)) || r.frame.lemma || null;
  const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb, tokens);
  const out = reading ? toNodes(reading, ninfo, ctx, seq) : { nodes: [], notes: [`VSS could not read “${src}” (${r.status})`] };
  if (reading && Object.keys(reading.offered || {}).length) out.notes.push("accepted the reader's offer: " + Object.entries(reading.offered).map(([k, v]) => `${k}=${v}`).join(", "));
  return Object.assign(out, { reading, normalized: text, vss: { status: r.status, sop: r.sop, margins: r.margins, residual: r.residual, ms: r.timings.total_ms, unplaced: r.unplaced } });
}

/** a whole message; the VSS reader cuts it into requests by its action words (a model without front.json: the rules' cut, `rulesFormalize`).
 *  opts.cut: "q1" -> the q1 cut of vss-centers.js (training/sketch/diagnosis_cut/CUT.md); omitted -> the default cut, unchanged */
export async function formalize(text, ctx, rulesFormalize, opts = {}) {
  if (opts.composer) {          // the composer: units of the cutter, routed to the micro-worlds or the fallback; each unit carries its world
    const c = await loadComposerAt(typeof opts.composer === "string" ? opts.composer : undefined);
    return c.formalize(text, ctx);
  }
  if (!state.vss) await load();
  const t0 = performance.now(), seq = { s: 0, m: 0 };
  // the message is cut by the VSS reader itself (one state per action word, vss-centers.js); no separate tagger (owner's decision)
  const cut = state.front ? { segments: vssCentres(text, ctx.names || [], state.front, state.vss, opts.cut ? { cut: opts.cut } : {}).map((src) => ({ src, id: null })), nodes: [], corrections: [] } : rulesFormalize(text, ctx);
  const c = { names: ctx.names || [], last: (ctx.last || []).slice(), refs: new Map() };
  const nodes = [], notes = [], clauses = [];
  for (const seg of cut.segments || []) {
    const r = readClause(seg.src, c, seq);
    nodes.push(...r.nodes); notes.push(...r.notes); clauses.push({ src: seg.src, normalized: r.normalized, vss: r.vss, reading: r.reading, rules: seg.id ? cut.nodes.find((n) => n.id === seg.id) : null });
    nextContext(c, r.nodes[r.nodes.length - 1]);      // the context rule, shared with the composer (vss-composer.js)
  }
  // the text left out: every piece of the message that no request was read from (chatter, or text of another world); for now it is
  // only reported; later these zones go to the other worlds
  const used = clauses.filter((c) => c.reading).map((c) => c.src), ignored = [];
  let rest = text;
  for (const u of used) { const i = rest.indexOf(u); if (i >= 0) rest = rest.slice(0, i) + "\u0000" + rest.slice(i + u.length); }
  for (const z of rest.split("\u0000").map((x) => x.replace(/^[\s.,!?;:]+|[\s.,!?;:]+$/g, "")).filter((x) => x.length > 2)) ignored.push(z);
  if (ignored.length) notes.push("Ignored (not understood): " + ignored.map((z) => `“${z}”`).join(", "));
  return { nodes, notes: cut.corrections ? cut.corrections.concat(notes) : notes, clauses, ignored, ms: performance.now() - t0 };
}

/** what the demo shows about the composer: its worlds (model folder, actions), router, event hint, fallback, bytes and load time */
export function composerInfo() {
  const r = comp.registry; if (!comp.c || !r) return null;
  return { composer: true, bytes: comp.bytes, loadMs: comp.loadMs, about: r.about || "", router: r.router || "", hint: r.event_cutter ? (r.event_hint || "H1") : null,
    fallback: r.fallback || null, worlds: (r.worlds || []).map((w) => ({ world: w.world, model: w.model.replace(/^micro\//, ""), events: w.events || [] })) };
}

export function goldNodes(row, ctx) {
  const { tokens, info: ninfo } = normalize(state.table, state.lexicon, row.text, row.names || []);
  return toNodes(readingFromGold(row, tokens, state.verbs), ninfo, ctx, { s: 0, m: 0 }).nodes;
}

export function ready() { return !!state.vss; }
window.VSSFormalizer = { load, formalize, readClause, info, goldNodes, ready, loadComposerAt, composerInfo };
