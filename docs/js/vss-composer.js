// vss-composer.js: the VSS formalizer as a composition (research/hier/HIER.md section 3, the owner's architecture):
//   1. the CUTTER (the BIO perceptron of front.py / front.js segment, learned on every annotated message: docs/model/micro/cutter.json,
//      training/sketch/train_cutter.py) cuts the message into units;
//   2. the REGISTRY (docs/model/micro/registry.json: [{world, events, model}], plus "fallback") lists the micro-worlds;
//   3. the ROUTER sends each unit to the worlds whose events include an action token of the unit (the unit normalized once by the
//      fallback's front end); several candidates each read the unit and ONE key picks (below); none -> the FALLBACK world;
//   4. the FALLBACK is the big model (registry.fallback, today kinds_p80_s0). It also stands for every event no micro-world lists: when
//      a unit's action tokens include such an event, the fallback is one of the candidates (stated assumption: with no world for that
//      event, the fallback is that event's world);
//   5. the existing reasoning: the reading of the chosen world -> vss-adapter.js (readingFromWires, toNodes), with the references of the
//      message (names created earlier, `last`) carried from unit to unit.
// Each unit's result carries its world id (unit.world, and node.world on every node it gave).
// The key (HIER.md section 3, level 2), compared in this order:
//   (a) a readable status (ok, abstain) before an unreadable one (unknown-event, no-sense);
//   (b) the larger score = content tokens of the unit placed by the frame minus those not placed, counted over ONE global content-token
//       set (HIER.md trap 2: a world's own `unplaced` uses its own content kinds and is not comparable across worlds): the tokens of the
//       unit as the FALLBACK's front end normalizes it that are names (n_), quoted texts (t_), numbers, or legend value tokens (the
//       fallback lexicon's kinds in capitals, not VERB; the rule of vss-centers.js); event tokens are not counted. Placed = the words of
//       the frame's role fillers and of the offers the adapter accepts;
//   (c) a reading that fills a role before one that fills none;
//   (d) ok before abstain;
//   (e) the smaller residual, last.
// Readable candidates equal on (a)-(d) whose events differ -> the unit is marked "ask" (both readings are shown, none is executed).
// Units that are not read (no candidate reads them: no action token and no reading, or every reading unreadable) are "ignored" zones,
// reported as the formalizer does today. No number in this file is tuned.
import * as FRONT from "./front.js";
import { fillerWords } from "./vss/reader.js";
import { readingFromWires, toNodes } from "./vss-adapter.js";

const UNREADABLE = new Set(["unknown-event", "no-sense"]);

/** one world: {id, events (Set | null for the fallback), vss, F, verbEvent} */
export function makeWorld(id, events, vss, F) {
  if (!F) throw new Error(`composer: world ${id} has no front.json`);
  const verbEvent = new Map(); for (const e of vss.model.legend.events) for (const v of e.verbs || []) verbEvent.set(v, e.id);
  return { id, events: events ? new Set(events) : null, vss, F, verbEvent };
}

/** the context carried from one request to the next (the demo's rule, vss-formalizer.js): created names, `last`, renamed names */
export function nextContext(c, main) {
  if (!main || !main.args) return;
  if (main.args.action === "create") { if (main.args.name != null && !main.args.count) c.refs.set(String(main.args.name).toLowerCase(), { ref: main.id }); c.last = [{ ref: main.id }]; }
  else if (main.args.target != null && !Array.isArray(main.args.target)) c.last = [main.args.target];
  else if (main.args.action === "connect" && main.args.to != null && !Array.isArray(main.args.to)) c.last = [main.args.to];
  if (main.args.action === "rename" && main.args.name) c.names = c.names.concat([String(main.args.name)]);
}

export class Composer {
  /** cutter: {segmenter}; fallback: makeWorld(..., null, ...); worlds: makeWorld(...) in registry order */
  constructor({ cutter, fallback, worlds = [] }) {
    this.cutter = cutter; this.fallback = fallback; this.worlds = worlds;
    const fev = new Set(fallback.vss.model.legend.events.map((e) => e.id));
    for (const w of worlds) {
      const lev = new Set(w.vss.model.legend.events.map((e) => e.id));
      const bad = [...w.events].filter((e) => !fev.has(e)), off = [...lev].filter((e) => !w.events.has(e)), missing = [...w.events].filter((e) => !lev.has(e));
      if (bad.length) throw new Error(`composer: world ${w.id}: events not in the fallback legend: ${bad}`);
      // HIER.md trap 1: a world's legend must list only its own events (msg_to_world.py WORLD_EVENTS), or a foreign token becomes its predicate
      if (off.length || missing.length) throw new Error(`composer: world ${w.id}: legend events [${[...lev]}] differ from the registry's [${[...w.events]}]`);
    }
    this.covered = new Set(worlds.flatMap((w) => [...w.events]));
    this.valueTokens = new Set(Object.entries(fallback.vss.model.lexicon || {}).filter(([, e]) => /^[A-Z]+$/.test(e.kind) && e.kind !== "VERB").map(([w]) => w));
  }

  /** the candidate worlds of one unit -> {events (of its action tokens), gtokens (the fallback's normalization), candidates} */
  candidates(src, names) {
    const { tokens } = FRONT.normalize(src, names, this.fallback.F);
    const events = [...new Set(tokens.filter((t) => this.fallback.verbEvent.has(t)).map((t) => this.fallback.verbEvent.get(t)))];
    const ws = this.worlds.filter((w) => events.some((e) => w.events.has(e)));
    const uncovered = events.some((e) => !this.covered.has(e));
    return { events, gtokens: tokens, candidates: !ws.length ? [this.fallback] : uncovered ? ws.concat([this.fallback]) : ws };
  }

  /** one world reads one unit (normalized by that world's own front end) */
  readIn(w, src, names) {
    const { tokens, info } = FRONT.normalize(src, names, w.F);
    const r = w.vss.read(tokens.join(" "));
    return { world: w.id, w, tokens, info, r, status: r.status, event: UNREADABLE.has(r.status) ? null : r.frame.event };
  }

  /** the key's terms of one reading (see the head of the file) */
  keyOf(x, gtokens) {
    const readable = !UNREADABLE.has(x.status);
    const placed = new Set();
    if (readable) {
      for (const fl of Object.values(x.r.frame.roles || {})) for (const w of fillerWords(fl)) placed.add(w);
      for (const w of Object.values(x.r.offers || {})) placed.add(w);
    }
    let score = 0;
    for (const t of gtokens) {
      if (this.fallback.verbEvent.has(t)) continue;
      if (!(t.startsWith("n_") || t.startsWith("t_") || /^\d+$/.test(t) || this.valueTokens.has(t))) continue;
      score += placed.has(t) ? 1 : -1;
    }
    const fills = readable && (Object.values(x.r.frame.roles || {}).some((v) => v !== null && v !== undefined) || Object.keys(x.r.offers || {}).length > 0);
    return { readable, score, fills, ok: x.status === "ok", residual: readable ? x.r.residual : Infinity };
  }

  /** route one unit -> {zone: "read" | "ask" | "ignored", world, event, status, chosen, tried, events, reason} */
  route(src, names) {
    const { events, gtokens, candidates } = this.candidates(src, names);
    const tried = candidates.map((w) => this.readIn(w, src, names));
    let chosen = tried[0], tie = [];
    if (tried.length > 1) {
      for (const x of tried) x.key = this.keyOf(x, gtokens);
      const cmp4 = (a, b) => (b.readable - a.readable) || (b.score - a.score) || (b.fills - a.fills) || (b.ok - a.ok);
      const order = tried.slice().sort((a, b) => cmp4(a.key, b.key) || (a.key.residual - b.key.residual));   // stable: registry order, fallback last
      chosen = order[0];
      tie = order.filter((x) => x.key.readable && cmp4(x.key, chosen.key) === 0);
    }
    const out = { src, events, tried: tried.map((x) => ({ world: x.world, event: x.event, status: x.status, key: x.key || null })) };
    if (tie.length > 1 && new Set(tie.map((x) => x.event)).size > 1)
      return Object.assign(out, { zone: "ask", world: null, event: null, status: "ask", chosen: null, options: tie.map((x) => ({ world: x.world, event: x.event, status: x.status })) });
    if (UNREADABLE.has(chosen.status))
      return Object.assign(out, { zone: "ignored", world: chosen.world, event: null, status: chosen.status, chosen: null, reason: events.length ? chosen.status : "no action token" });
    return Object.assign(out, { zone: "read", world: chosen.world, event: chosen.event, status: chosen.status, chosen });
  }

  /** a whole message -> {nodes, notes, units, clauses, ignored, asks, ms}. opts.update: the context rule (default nextContext) */
  formalize(text, ctx = {}, opts = {}) {
    const t0 = performance.now(), update = opts.update || nextContext, seq = { s: 0, m: 0 };
    const c = { names: ctx.names || [], last: (ctx.last || []).slice(), refs: new Map() };
    const nodes = [], notes = [], units = [];
    for (const [c0, c1] of FRONT.segmentSpans(text, ctx.names || [], this.cutter)) {
      const src = text.slice(c0, c1), names = c.names.concat([...c.refs.keys()]);
      const u = Object.assign({ c0, c1 }, this.route(src, names));
      units.push(u);
      if (u.zone === "ask") { notes.push(`Two readings of “${src}”: ` + u.options.map((o) => `${o.event} (world ${o.world})`).join(" or ") + "; which one did you mean?"); continue; }
      if (u.zone !== "read") { notes.push(`VSS could not read “${src}” (${u.reason})`); continue; }
      const x = u.chosen, verb = x.tokens.find((t) => x.w.verbEvent.has(t)) || x.r.frame.lemma || null;
      const reading = readingFromWires(x.r.wires, verb, x.tokens), out = toNodes(reading, x.info, c, seq);
      if (Object.keys(reading.offered || {}).length) out.notes.push("accepted the reader's offer: " + Object.entries(reading.offered).map(([k, v]) => `${k}=${v}`).join(", "));
      for (const n of out.nodes) { n.world = u.world; if (n.type !== "mention") Object.defineProperty(n, "src", { value: src, enumerable: false, configurable: true }); }
      nodes.push(...out.nodes); notes.push(...out.notes);
      Object.assign(u, { normalized: x.tokens.join(" "), reading, vss: { status: x.r.status, sop: x.r.sop, margins: x.r.margins, residual: x.r.residual, unplaced: x.r.unplaced } });
      update(c, out.nodes[out.nodes.length - 1]);
    }
    // the ignored zones: every piece of the message no request was read from or asked about (text outside every unit, and units not read)
    let rest = text; const used = units.filter((u) => u.zone !== "ignored").map((u) => [u.c0, u.c1]);
    for (const [a, b] of used.slice().reverse()) rest = rest.slice(0, a) + "\u0000" + rest.slice(b);
    const ignored = rest.split("\u0000").map((x) => x.replace(/^[\s.,!?;:]+|[\s.,!?;:]+$/g, "")).filter((x) => x.length > 2);
    if (ignored.length) notes.push("Ignored (not understood): " + ignored.map((z) => `“${z}”`).join(", "));
    for (const u of units) delete u.chosen;                     // keep the result plain data (the reading stays in u.reading)
    return { nodes, notes, units, clauses: units, ignored, asks: units.filter((u) => u.zone === "ask"), ms: performance.now() - t0 };
  }
}

/** registry + cutter + a model loader -> a Composer. loadModel(folder relative to docs/model/) -> Promise<{vss, F}> */
export async function loadComposer(registry, cutter, loadModel, opts = {}) {
  const fbName = opts.fallback || registry.fallback;
  if (!fbName) throw new Error("composer: the registry names no fallback");
  const fb = await loadModel(fbName), fallback = makeWorld(fbName, null, fb.vss, fb.F);
  const worlds = [];
  for (const e of registry.worlds || []) { const m = await loadModel(e.model); worlds.push(makeWorld(e.world, e.events, m.vss, m.F)); }
  return new Composer({ cutter, fallback, worlds });
}
