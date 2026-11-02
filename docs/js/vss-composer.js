// vss-composer.js: the VSS formalizer as a composition (research/hier/HIER.md section 3, the owner's architecture). One router, the cutter's.
// The registry (docs/model/micro/registry.json: [{world, events, model}]) lists the micro-worlds. The existing reasoning follows the
// reading of the chosen world: vss-adapter.js (readingFromWires, toNodes), with the references of the message (names created earlier,
// `last`) carried from unit to unit. Each unit's result carries its world id (unit.world, and node.world on every node it gave).
// Units that no candidate understands are "ignored" zones. No number in this file is tuned.
//
// The router (owner's decision 2026-11-01, training/sketch/ROUTER_V2.md; registry field "router": "cutter"; the earlier token router was removed):
//   1. the CUTTER WITH WORLDS (train_cutter.py --worlds: B-<world> labels; front.js segmentWorlds) cuts the message and ranks the worlds
//      of each unit by their B-<world> score at the unit's first token; no phrase -> action table runs before the router;
//   2. the candidates of a unit are the cutter's top ROUTER_K worlds (ROUTER_K = 3: the smallest k whose recall of the gold world is at
//      least 97% in cutter_worlds_probe.py, 97.9%); "fallback" (the events no world holds) stands for the fallback model, and a fallback
//      reading whose event a registered world holds is not counted (the fallback is a candidate only for the events no world holds);
//      FALLBACK OPTIONAL (owner, 2026-11-02; SHORT2.md): with router "cutter" the registry's "fallback" may be absent, and is absent by
//      default (kinds_p80_s0 read 0 of 4643 requests on the 1000-message sample and 0 of 877 on the six short sets). With no fallback,
//      a cutter candidate "fallback" is skipped (it keeps its place in the top k: the other candidates are the same as with a fallback),
//      and the world events are not checked against a fallback legend (a new event of a new world needs no fallback);
//   3. each candidate reads the unit with ITS OWN front end; the reading that leaves the FEWEST WORDS NOT UNDERSTOOD wins (the count of
//      training/sketch/words_not_understood.mjs: the unit's surface words, punctuation excluded, that are not behind a role filler word, an
//      accepted offer or the action token of the reading; an unreadable status understands no word); a reading that understands no word is
//      not a reading (with no other, the unit is ignored: not understood);
//   4. a tie goes to the post-VSS layer (vss-context.js chooseReading: the reading the message context can complete; else the cutter's
//      order); the VSS layer never asks;
//   5. the post-VSS context filler (vss-context.js Context with docs/model/context/weights.json) fills the reference gaps of the chosen
//      reading; a request with a gap it cannot fill is asked (zone "ask"), not executed.
// EVENT HINT (training/sketch/EVENT_HINT.md; registry field "event_cutter", a path under docs/model/ like "cutter";
// absent = the composer above, unchanged):
//   1. the EVENT CUTTER (train_cutter.py --worlds worlds_micro/GROUPS_EVENTS.json: one world per legend event, labels B-<event>) is decoded
//      once over the whole message (front.js segDecodeLabels, the same tokens as segmentWorlds); a unit's EVENT HINT is the B-<event> label
//      with the largest score at the unit's first token (equal scores: label order). The event cutter does not cut; the units stay those
//      of the cutter with worlds;
//   2. each candidate world reads the unit as above; then, only when the hint is one of that world's events, the world reads the unit
//      again with the event given (vss.read opts.event, reader.js: the predicate's candidates are that event's verb lemmas and the verb
//      check is met) and that second reading replaces the first in step 3:
//      mode "H1" (registry field "event_hint", the default): when the first reading's status is unknown-event;
//      mode "H2": also when the first reading is readable (ok, abstain) and its event differs from the hint.
//   Each unit carries hint, hintApplies (the hint is an event of a candidate world), reread (readings replaced) and hintChanged (the unit's
//   chosen reading, world and SOP text, or ignored, differs from the one the first readings give).
import * as FRONT from "./front.js";
import { fillerWords } from "./vss/reader.js";
import { readingFromWires, toNodes } from "./vss-adapter.js";
import { Context, rawNodes, chooseReading, ENTITY_KEYS } from "./vss-context.js";

const UNREADABLE = new Set(["unknown-event", "no-sense"]);
export const ROUTER_K = 3;                       // router "cutter": candidates per unit (see the head of the file)
const PUNCT = new Set([".", ",", "!", "?", ";", ":"]);

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
  constructor({ cutter, fallback, worlds = [], router = "cutter", context = null, k = ROUTER_K, eventCutter = null, eventHint = null, needRead = false }) {
    this.needRead = needRead || false;      // true: every empty needed role; "ask": only the roles the filler would ask about
    this.cutter = cutter; this.worlds = worlds; this.router = router; this.contextModel = context; this.k = k;
    this.eventCutter = eventCutter || null; this.eventHint = eventCutter ? eventHint || "H1" : null;
    this.fallback = fallback || null;
    for (const w of worlds) {
      const lev = new Set(w.vss.model.legend.events.map((e) => e.id));
      const off = [...lev].filter((e) => !w.events.has(e)), missing = [...w.events].filter((e) => !lev.has(e));
      // HIER.md trap 1: a world's legend must list only its own events (msg_to_world.py WORLD_EVENTS), or a foreign token becomes its predicate
      if (off.length || missing.length) throw new Error(`composer: world ${w.id}: legend events [${[...lev]}] differ from the registry's [${[...w.events]}]`);
    }
    this.covered = new Set(worlds.flatMap((w) => [...w.events]));
    if (router !== "cutter") throw new Error(`composer: router ${router}: expected cutter (the token router was removed)`);
    {
      if (!cutter || !Array.isArray(cutter.labels) || !Array.isArray(cutter.worlds)) throw new Error("composer: router cutter needs a cutter with worlds (train_cutter.py --worlds)");
      if (!context) throw new Error("composer: router cutter needs the context filler's model (docs/model/context/weights.json)");
      const G = cutter.grouping || {}, same = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
      for (const w of worlds) if (!cutter.worlds.includes(w.id) || !same(new Set(G[w.id] || []), w.events)) throw new Error(`composer: world ${w.id} [${[...w.events]}] is not a world of the cutter (${cutter.command || "?"}); retrain it with this grouping`);
      for (const cw of cutter.worlds) if (cw !== "fallback" && !worlds.some((w) => w.id === cw)) throw new Error(`composer: the cutter's world ${cw} is not in the registry`);
    }
    if (eventHint && !eventCutter) throw new Error("composer: event_hint needs an event cutter (registry field event_cutter)");
    if (eventCutter) {      // the event hint (see the head of the file)
      if (this.eventHint !== "H1" && this.eventHint !== "H2") throw new Error(`composer: event_hint ${this.eventHint}: expected H1 or H2`);
      if (!Array.isArray(eventCutter.labels) || !Array.isArray(eventCutter.worlds)) throw new Error("composer: the event cutter has no labels (train_cutter.py --worlds)");
      const G = eventCutter.grouping || {};
      for (const e of eventCutter.worlds) if (e !== "fallback" && ((G[e] || []).length !== 1 || G[e][0] !== e)) throw new Error(`composer: the event cutter's world ${e} is not one legend event (${eventCutter.command || "?"}); train it with worlds_micro/GROUPS_EVENTS.json`);
    }
  }

  // ---------------------------------------------------------------- router "cutter" (see the head of the file)
  /** one world reads one unit with its own front end; -> the reading with its words not understood (wnu: {words, n, notU}) */
  readWnu(w, src, names, ropts) {      // ropts: the reader's options (the event hint: {event})
    const tr = FRONT.normalizeTrace(src, names, w.F), r = w.vss.read(tr.tokens.join(" "), ropts);
    const x = { world: w.id, w, tokens: tr.tokens, info: tr.info, r, status: r.status, event: UNREADABLE.has(r.status) ? null : r.frame.event };
    const und = new Set();
    if (x.event) {
      const U = new Set();
      for (const fl of Object.values(r.frame.roles || {})) for (const t of fillerWords(fl)) U.add(t);
      for (const t of Object.values(r.offers || {})) U.add(t);
      const verb = tr.tokens.find((t) => w.verbEvent.has(t)) || r.frame.lemma || null;
      tr.tokens.forEach((t, i) => { if (U.has(t) || (verb && t === verb)) for (const k of tr.surf[i]) und.add(k); });
    }
    const words = tr.surface.map((s, i) => [s[0], i]).filter(([t]) => !PUNCT.has(t)), notU = words.filter(([, i]) => !und.has(i)).map(([t]) => t);
    x.wnu = { words: words.length, n: notU.length, notU };
    // the fallback stands only for the events no registered world holds
    if (w === this.fallback && x.event && this.covered.has(x.event)) x.held = true;
    return x;
  }

  /** route one unit (router "cutter"); ranked: the cutter's worlds of the unit -> {zone "read" | "ignored", options (the tied best
   *  readings, cutter order), tried, candidates, reason} */
  routeCutter(src, names, ranked, hint = null) {
    const cands = ranked.slice(0, this.k), byId = new Map(this.worlds.map((w) => [w.id, w]));
    const tried = cands.filter((c) => c.world !== "fallback" || this.fallback).map((c) => this.readWnu(c.world === "fallback" ? this.fallback : byId.get(c.world), src, names));
    let first = null, reread = 0, hintApplies = false;
    if (hint !== null) {      // the event hint (see the head of the file): a world whose events include the hint may read the unit again
      first = tried.slice();
      tried.forEach((x, i) => {
        if (!x.w.events || !x.w.events.has(hint)) return;
        hintApplies = true;
        if (x.status === "unknown-event" || (this.eventHint === "H2" && x.event && x.event !== hint)) { tried[i] = Object.assign(this.readWnu(x.w, src, names, { event: hint }), { reread: x.status + (x.event ? " " + x.event : "") }); reread++; }
      });
    }
    const out = Object.assign({ src, candidates: cands.map((c) => ({ world: c.world, score: c.score })),
      tried: tried.map((x) => Object.assign({ world: x.world, event: x.event, status: x.status, words: x.wnu.words, notUnderstood: x.wnu.n, held: !!x.held }, x.reread ? { reread: x.reread } : {})) },
      this.pickCutter(tried));
    if (hint !== null) Object.assign(out, { hint, hintApplies, reread }, reread ? { first: this.pickCutter(first) } : {});
    return out;
  }

  /** the readings of one unit (router "cutter") -> {zone "read", options (the readings tied at the fewest words not understood)} or
   *  {zone "ignored", world, event, status, options [], reason} */
  pickCutter(tried) {
    const usable = tried.filter((x) => x.event && !x.held && x.wnu.n < x.wnu.words);
    if (!usable.length) {
      const reason = tried.some((x) => x.held) && !tried.some((x) => x.event && !x.held) ? "only the fallback read it, with an event a world holds"
        : tried.some((x) => x.event) ? "no candidate world understood any word" : "no candidate world could read it (" + [...new Set(tried.map((x) => x.status))].join(", ") + ")";
      return { zone: "ignored", world: null, event: null, status: tried[0] ? tried[0].status : "no-sense", options: [], reason };
    }
    const min = Math.min(...usable.map((x) => x.wnu.n)), options = usable.filter((x) => x.wnu.n === min);
    return { zone: "read", options };
  }

  /** NEED READ (registry field "need_read": true; SHORT2.md): the reader leaves an entity role empty when its presence ratio is under the
   *  role's calibrated threshold. When the context filler finds that the action NEEDS that role (an `empty` gap: missingRoles, learned from
   *  the gold args) and the unit has words the reader placed nowhere, the same world reads the unit again with every role present (the
   *  reader's option presence "all", same event) and its filler of an empty entity role is taken when (1) its head is a word the first
   *  reading left unplaced (attr and det kept only when they are unplaced words too), (2) through the adapter it fills only roles the
   *  context found empty and needed. A description becomes a mention node, resolved by the engine as the rules' mentions are.
   *  Measured 2026-11-02 (SHORT2.md): short sets right +1.3, wrong +1.0 points (13 requests right, 13 wrong: the worlds read a
   *  description's colour / "not <colour>" / recency too rarely); sample unchanged. NOT adopted: off by default, kept for the round-2 worlds.
   *  -> {reading, raw, added: [role]} | null (nothing to take: the first reading stays) */
  readNeeded(x, R, filler, c0, c1, canvas, seq) {
    if (!R.raw || !R.raw.main) return null;
    const st0 = filler.step(R.raw, c0, c1, { dry: true }); if (!st0) return null;
    const empty = new Set(st0.gaps.filter((g) => g.kind === "empty" && (this.needRead !== "ask" || g.decision === "ask")).map((g) => g.key));
    const unplaced = new Set(x.r.unplaced || []);
    if (!empty.size || !unplaced.size) return null;
    const r2 = x.w.vss.read(x.tokens.join(" "), { presence: "all", event: x.event });
    if (UNREADABLE.has(r2.status) || r2.frame.event !== x.event) return null;
    const sch = x.w.vss.reader.schema.roles, sets = x.w.vss.reader.setRoles, roles0 = R.reading.roles || {};
    const has = (a, k) => a[k] !== undefined && a[k] !== null, base = R.raw.main.args, scratch = { s: 0, m: 1000 };
    const took = {};
    for (const [r, fl] of Object.entries(r2.frame.roles || {})) {
      if (!sch[r] || sch[r].main !== "entity" || sets.has(r) || has(roles0, r) || !Array.isArray(fl) || fl[0] !== "entity" || !unplaced.has(fl[1])) continue;
      const en = { head: fl[1], attr: fl[2] && fl[2][0] === "word" && unplaced.has(fl[2][1]) ? fl[2][1] : null, det: fl[3] && unplaced.has(fl[3]) ? fl[3] : null };
      const t = rawNodes(Object.assign({}, R.reading, { roles: Object.assign({}, roles0, { [r]: en }) }), x.info, canvas, scratch);
      const added = t.main ? ENTITY_KEYS.filter((k) => has(t.main.args, k) && !has(base, k)) : [];
      if (added.length && added.every((k) => empty.has(k))) took[r] = en;
    }
    if (!Object.keys(took).length) return null;
    // the taken fillers must account for EVERY word the first reading left unplaced: a description read only in part ("the blue circles"
    // read as circles, "the stars that are not magenta" as stars) is a wrong request; it stays a question
    const placed = new Set(Object.values(took).flatMap((en) => [en.head, en.attr, en.det].filter((w) => w)));
    if ([...unplaced].some((w) => !placed.has(w))) return null;
    const reading = Object.assign({}, R.reading, { roles: Object.assign({}, roles0, took), needRead: Object.keys(took) });
    return { reading, raw: rawNodes(reading, x.info, canvas, seq), added: Object.keys(took) };
  }

  /** the event hint of every unit start: the event cutter decoded over the message -> (c0) => event | null (see the head of the file) */
  eventHints(text, canvas) {
    const E = this.eventCutter, [toks] = FRONT.tokenize(text, canvas), { scores } = FRONT.segDecodeLabels(toks.map((x) => x[0]), E.segmenter, E.labels);
    const at = new Map(toks.map(([, s], k) => [s, k])), B = E.labels.filter((L) => L.startsWith("B-") && L !== "B-fallback");
    return (c0) => {
      const k = at.get(c0); if (k === undefined) return null;
      let best = null; for (const L of B) if (best === null || scores[k][L] > scores[k][best]) best = L;
      return best === null ? null : best.slice(2);
    };
  }

  /** a whole message with router "cutter" -> the same shape as formalize; units carry candidates, tried, decidedBy, gaps */
  formalizeCutter(text, ctx = {}, opts = {}) {
    const t0 = performance.now(), update = opts.update || nextContext, seq = { s: 0, m: 0 }, canvas = ctx.names || [];
    const c = { names: canvas, last: (ctx.last || []).slice(), refs: new Map() }, filler = new Context({ text, canvas, model: this.contextModel });
    const nodes = [], notes = [], units = [];
    const rawOf = (x, sq = seq) => { const verb = x.tokens.find((t) => x.w.verbEvent.has(t)) || x.r.frame.lemma || null, reading = readingFromWires(x.r.wires, verb, x.tokens);
      return { reading, raw: rawNodes(reading, x.info, canvas, sq) }; };
    const hintAt = this.eventCutter ? this.eventHints(text, canvas) : null;
    for (const cu of FRONT.segmentWorlds(text, canvas, this.cutter)) {
      const { c0, c1 } = cu, src = text.slice(c0, c1), names = c.names.concat([...c.refs.keys()]);
      const u = Object.assign({ c0, c1 }, this.routeCutter(src, names, cu.worlds, hintAt ? hintAt(c0) : null));
      units.push(u);
      // the event hint: the reading the first readings would have given (same choice, dry; a scratch id counter), to count the changes
      let before;
      if (u.first) {
        const p = u.first; delete u.first;
        if (p.zone === "ignored") before = null;
        else if (p.options.length === 1) before = p.options[0];
        else { const sq = { s: seq.s, m: seq.m }; before = p.options[chooseReading(filler, p.options.map((o) => rawOf(o, sq).raw), c0, c1).index]; }
      }
      const changed = (x) => {
        if (before === undefined) return;
        u.hintChanged = x === null ? before !== null : before === null || before.world !== x.world || before.r.sop !== x.r.sop;
        if (u.hintChanged) u.hintBefore = before === null ? null : { world: before.world, event: before.event, status: before.status };
      };
      if (u.zone === "ignored") { notes.push(`VSS could not read “${src}” (${u.reason})`); delete u.options; changed(null); continue; }
      let x = u.options[0], R = null; u.tie = u.options.length; u.decidedBy = "words";
      if (u.options.length > 1) {
        const rs = u.options.map((o) => rawOf(o)), d = chooseReading(filler, rs.map((q) => q.raw), c0, c1);
        x = u.options[d.index]; R = rs[d.index]; u.decidedBy = d.by; u.tiedWorlds = u.options.map((o, i) => ({ world: o.world, event: o.event, fits: d.fits[i] }));
      }
      changed(x);
      if (!R) R = rawOf(x);
      Object.assign(u, { world: x.world, event: x.event, status: x.status, normalized: x.tokens.join(" "), reading: R.reading, notUnderstood: x.wnu.notU,
        vss: { status: x.r.status, sop: x.r.sop, margins: x.r.margins, residual: x.r.residual, unplaced: x.r.unplaced } });
      delete u.options;
      if (this.needRead) { const alt = this.readNeeded(x, R, filler, c0, c1, canvas, seq); if (alt) { R = alt; u.needRead = alt.added; } }
      const st = filler.step(R.raw, c0, c1);
      if (!st) { notes.push(`VSS read “${src}” as ${x.event} (world ${x.world}) but it gave no request`); continue; }
      u.gaps = st.gaps.map((g) => ({ key: g.key, kind: g.kind, decision: g.decision }));
      if (st.asked) {
        u.zone = "ask"; u.askedBy = "context";
        notes.push(`In “${src}” (${x.event}), which shape is meant by ` + st.gaps.filter((g) => g.decision === "ask").map((g) => g.key + (g.word ? " (" + g.word.replace(/^@/, "") + ")" : "")).join(", ") + "?");
      } else {
        const out = R.raw.nodes.filter((n) => n.type === "mention").concat([st.main]);
        for (const n of out) { n.world = u.world; if (n.type !== "mention") Object.defineProperty(n, "src", { value: src, enumerable: false, configurable: true }); }
        Object.defineProperty(st.main, "span", { value: [c0, c1], enumerable: false, configurable: true });
        nodes.push(...out);
      }
      update(c, st.main);
    }
    let rest = text; const used = units.filter((u) => u.zone !== "ignored").map((u) => [u.c0, u.c1]);
    for (const [a, b] of used.slice().reverse()) rest = rest.slice(0, a) + "\u0000" + rest.slice(b);
    const ignored = rest.split("\u0000").map((x) => x.replace(/^[\s.,!?;:]+|[\s.,!?;:]+$/g, "")).filter((x) => x.length > 2);
    if (ignored.length) notes.push("Ignored (not understood): " + ignored.map((z) => `“${z}”`).join(", "));
    return { nodes, notes, units, clauses: units, ignored, asks: units.filter((u) => u.zone === "ask"), ms: performance.now() - t0 };
  }

  /** a whole message -> {nodes, notes, units, clauses, ignored, asks, ms}. opts.update: the context rule (default nextContext) */
  formalize(text, ctx = {}, opts = {}) { return this.formalizeCutter(text, ctx, opts); }
}

/** registry + cutter + a model loader -> a Composer. loadModel(folder relative to docs/model/) -> Promise<{vss, F}>.
 *  opts.router (else registry.router, else "cutter"; the only router): cutter = a cutter with worlds and opts.context = the context filler's
 *  model (weights.json, parsed); opts.k (default ROUTER_K). When the registry names an "event_cutter", opts.eventCutter = that file,
 *  parsed (the caller reads it, as the cutter); the mode is registry.event_hint (default H1). */
export async function loadComposer(registry, cutter, loadModel, opts = {}) {
  if (registry.event_hint && !registry.event_cutter) throw new Error("composer: the registry's event_hint needs an event_cutter");
  if (registry.event_cutter && !opts.eventCutter) throw new Error(`composer: the registry names the event cutter ${registry.event_cutter}; pass it parsed as opts.eventCutter`);
  const router = opts.router || registry.router || "cutter";
  const fbName = opts.fallback || registry.fallback || null;      // optional with router cutter (see the head of the file)
  let fallback = null; if (fbName) { const fb = await loadModel(fbName); fallback = makeWorld(fbName, null, fb.vss, fb.F); }
  const worlds = [];
  for (const e of registry.worlds || []) { const m = await loadModel(e.model); worlds.push(makeWorld(e.world, e.events, m.vss, m.F)); }
  const hint = registry.event_cutter ? { eventCutter: opts.eventCutter, eventHint: registry.event_hint || "H1" } : {};
  return new Composer(Object.assign({ cutter, fallback, worlds, router, context: opts.context, k: opts.k || ROUTER_K, needRead: opts.needRead ?? registry.need_read ?? false }, hint));
}
