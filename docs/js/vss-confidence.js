// vss-confidence.js: the VSS combined confidence of one produced request, the gate that executes a request only when its confidence clears
// the threshold of a precision level, and the plain-words reasons of a request below it. Browser-ready ES module, no imports.
//
// The model is docs/model/confidence/vss.json: the confidence of the VSS worlds of arm VSS-G (FEEDBACK_RESULT.md), fitted on the fresh2
// calibration part by training/sketch/fresh2/fit_report.mjs and written by fresh2/export_confidence.mjs, with the thresholds per level as
// data (readers.vss_combined.levels[L].threshold). The default level is "cost" (owner, 2026-11-02 21:24: execute only what it is sure of):
// the threshold that maximises the cost score (one confident mistake = 10 right answers, AGENTS.md) on the out-of-fold calibration
// confidences; its entry may instead say kind "executes everything" (threshold null: no gate is better) or "asks everything". The levels
// 95 / 97 / 99 are precision levels (null when not reached with >= 50 executed). A refit changes the file only. A precision level the model
// does not reach falls back to the highest reached level below it, else to "cost" (effectiveLevel); with neither, every request is asked.
// Its readers.vss_combined holds the recipe of VSS_CONFIDENCE.md
// ("logistic all minus event"): 14 named stage signals, each turned into a percentile of its held-out distribution (tables), a weight each,
// an intercept; confidence = 1 / (1 + exp(-(intercept + sum weight * percentile))). The input is the composer's unit.signals (the raw
// signals, vss-composer.js head) and unit.world (the world prior). percentile() and confidence() reproduce
// training/sketch/precision_confidence.mjs exactly (training/sketch/test_vss_confidence.mjs checks it on sample requests).
//
// Reasons (why a request is below the threshold): each feature's pull = weight * (typical - percentile), where typical is the feature's
// mean percentile over the held-out requests (0.5 for a continuous signal by construction of the percentile; the share of 1s for a
// binary one; a missing value counts 1, as in the confidence, so a signal that is often missing, like ctx_margin, has a typical value near
// 1). A positive pull is what pulled the confidence down. The features are grouped by what they mean to the person (the cut, the world,
// the words, the reading, the context, the world's own accuracy); the groups are sorted by their summed pull and the first ones are said:
// every group with a pull of at least REASON_MIN (in logit units), at most REASON_MAX, and always the first one. These two numbers only
// choose how many sentences the reply shows; they do not change any decision.
export const REASON_MIN = 0.1, REASON_MAX = 3;
/** the levels of the setting: "cost" (the cost-score threshold, the default), the precision levels of the model file, and "all" (execute
 *  everything, no gate; never the default) */
export const LEVELS = ["cost", "95", "97", "99", "all"];
export const DEFAULT_LEVEL = "cost";

/** the reader's part of the model file (the file itself, or its readers.vss_combined) */
export const specOf = (model) => (model && model.readers ? model.readers.vss_combined : model);

/** the percentile of a raw signal x in its held-out table (training/sketch/precision_confidence.mjs percentile, the same code) */
export function percentile(tab, x) {
  if (x == null) return 1;
  const y = x * tab.sign;
  if (tab.binary) return tab.sign > 0 ? (y > 0 ? 1 : 0) : (y > -0.5 ? 1 : 0);
  const u = tab.values, below = tab.below, n = tab.n;
  let lo = 0, hi = u.length; while (lo < hi) { const m = (lo + hi) >> 1; if (u[m] < y) lo = m + 1; else hi = m; }
  const nb = lo < u.length ? below[lo] : n, eq = lo < u.length && u[lo] === y ? (lo + 1 < u.length ? below[lo + 1] : n) - below[lo] : 0;
  return n ? (nb + eq / 2) / n : 0.5;
}
/** the raw value of feature `name` for a request: the world prior from the world, the rest from the signals */
const rawOf = (spec, name, signals, world) => (name === "world_prior" ? (spec.world_prior[world || "none"] ?? spec.world_prior_default) : (signals || {})[name]);
/** the combined confidence in (0, 1) of a request with these signals, read by this world (precision_confidence.mjs vssCombinedConfidence) */
export function confidence(model, signals, world) {
  const spec = specOf(model);
  let z = spec.intercept;
  for (const s of spec.features) z += s.weight * percentile(spec.tables[s.name], rawOf(spec, s.name, signals, world));
  return 1 / (1 + Math.exp(-z));
}
/** the precision levels the model reaches (a finite threshold), as numbers ascending ("cost" is not a precision level) */
export function reachedLevels(model) {
  const lv = specOf(model).levels || {};
  return Object.keys(lv).filter((k) => /^\d+$/.test(k) && lv[k] && Number.isFinite(lv[k].threshold)).map(Number).sort((a, b) => a - b);
}
/** the cost level of the model file, or null when the file has none */
const costOf = (model) => { const L = (specOf(model).levels || {}).cost; return L && (Number.isFinite(L.threshold) || L.kind === "executes everything" || L.kind === "asks everything") ? L : null; };
/** the level the gate uses for a chosen level: "all" stays "all"; "cost" stays when the file has it; a reached precision level stays; a
 *  precision level the model does not reach -> the highest reached level below it, else "cost"; else null (every request is asked) */
export function effectiveLevel(model, level = DEFAULT_LEVEL) {
  if (String(level) === "all") return "all";
  if (String(level) === "cost") return costOf(model) ? "cost" : null;
  const r = reachedLevels(model), want = Number(level);
  if (r.includes(want)) return String(want);
  const below = r.filter((x) => x < want);
  return below.length ? String(below[below.length - 1]) : costOf(model) ? "cost" : null;
}
/** the threshold of a level ("cost" | "95" | "97" | "99" | "all"): "all" -> -Infinity (execute all); "cost" -> its threshold (-Infinity
 *  when its kind is "executes everything", Infinity for "asks everything"); a level the model does not reach -> the threshold of
 *  effectiveLevel; no level -> Infinity (ask all) */
export function threshold(model, level = DEFAULT_LEVEL) {
  const e = effectiveLevel(model, level);
  if (e === "all") return -Infinity;
  if (e === null) return Infinity;
  const L = specOf(model).levels[e];
  return Number.isFinite(L.threshold) ? L.threshold : L.kind === "executes everything" ? -Infinity : Infinity;
}
/** the number of held-out requests the tables were fitted on (missing values count 1 in the typical value) */
const heldN = (spec) => { const L = Object.values(spec.levels || {}).find((x) => x && x.heldout_produced); return L ? L.heldout_produced : Math.max(...Object.values(spec.tables).map((t) => t.n)); };
/** the typical (mean held-out) percentile of a feature (see the head of the file) */
export function typical(model, name) {
  const spec = specOf(model), t = spec.tables[name], N = Math.max(heldN(spec), t.n);
  let mean = 0.5;
  if (t.binary) {      // the share of the held-out values that map to 1
    const ones = t.values.reduce((a, y, i) => a + ((t.sign > 0 ? y > 0 : y > -0.5) ? (i + 1 < t.values.length ? t.below[i + 1] : t.n) - t.below[i] : 0), 0);
    mean = t.n ? ones / t.n : 0.5;
  }
  return (mean * t.n + (N - t.n)) / N;
}
/** every feature's percentile and pull for one request -> [{name, stage, weight, raw, p, typical, pull}] */
export function pulls(model, signals, world) {
  const spec = specOf(model);
  return spec.features.map((s) => { const raw = rawOf(spec, s.name, signals, world), p = percentile(spec.tables[s.name], raw), ty = typical(spec, s.name);
    return { name: s.name, stage: s.stage, weight: s.weight, raw, p, typical: ty, pull: s.weight * (ty - p) }; });
}

// the groups the reasons are said in, and the sentence of each (u: the composer's unit)
const GROUP = { cut_start: "cut", cut_end: "cut", world_gap: "world", world_rank: "world", wnu_gap: "world", tie: "world", notu_frac: "words",
  residual: "reading", role_min: "reading", abstain: "reading", unplaced: "unplaced", ctx_fill: "context", ctx_margin: "context", world_prior: "prior" };
const quote = (ws) => ws.slice(0, 5).map((w) => `‘${w}’`).join(", ") + (ws.length > 5 ? ` and ${ws.length - 5} more` : "");
const plainRef = (g) => (g.word ? `‘${String(g.word).replace(/^@/, "")}’` : g.kind === "empty" ? `the missing ${g.key}` : `the ${g.key}`);
function sentence(group, u, model, parts) {
  const by = Object.fromEntries(parts.map((x) => [x.name, x]));
  switch (group) {
    case "cut": {
      const s = by.cut_start ? by.cut_start.pull : 0, e = by.cut_end ? by.cut_end.pull : 0;
      return `the cut of this request was uncertain (${s >= e ? "where it starts" : "where it ends"})`;
    }
    case "world": return by.world_rank && by.world_rank.p < 1 ? `it was read by a world that was not the cutter's first choice (${u.world})` : `which world should read it was uncertain (${u.world} was close to another)`;
    case "words": { const nu = [...new Set((u.notUnderstood || []).filter((w) => /\w/.test(w)))]; return nu.length ? `the word${nu.length > 1 ? "s" : ""} ${quote(nu)} ${nu.length > 1 ? "were" : "was"} not understood` : "some words were not understood"; }
    case "unplaced": { const un = [...new Set((u.vss && u.vss.unplaced) || [])]; return un.length ? `the word${un.length > 1 ? "s" : ""} ${quote(un)} fit no part of the reading` : "some words fit no part of the reading"; }
    case "reading": return by.abstain && by.abstain.p < 1 && (!by.residual || by.abstain.pull >= by.residual.pull) ? "the reading was close to another reading" : "part of the request is unexplained by the reading";
    case "context": {
      const fills = (u.gaps || []).filter((g) => g.decision === "fill"), weak = fills.filter((g) => Number.isFinite(g.margin)).sort((a, b) => a.margin - b.margin)[0];
      if (weak) return `${plainRef(weak)} was filled from context with a weak margin`;
      return fills.length ? `${fills.map(plainRef).join(" and ")} ${fills.length > 1 ? "were" : "was"} filled from context` : "a reference was filled from context";
    }
    case "prior": { const sp = specOf(model), r = sp.world_prior[u.world || "none"] ?? sp.world_prior_default; return `read in the ${u.world || "unknown"} world, which is often wrong (right about ${Math.round(r * 100)}% of the time on the calibration messages)`; }
  }
  return group;
}
/** the plain-words reasons of one unit's confidence -> [{group, pull, text}] (see the head of the file) */
export function reasons(model, u) {
  const ps = pulls(model, u.signals, u.world), sum = new Map(), parts = new Map();
  for (const x of ps) { const g = GROUP[x.name] || x.stage; sum.set(g, (sum.get(g) || 0) + x.pull); (parts.get(g) || parts.set(g, []).get(g)).push(x); }
  const order = [...sum.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  return order.filter(([, v], i) => i === 0 || (i < REASON_MAX && v >= REASON_MIN)).map(([g, v]) => ({ group: g, pull: v, text: sentence(g, u, model, parts.get(g)) }));
}

/** the gate over one composer result (vss-composer.js formalize): every unit that gave a request gets its confidence; a unit executes when
 *  its confidence >= the level's threshold, and also only when every request of the message it refers to ({ref} to a node of another unit)
 *  executes (a request that uses a shape an unexecuted request would have made is not executed either; its reason says so).
 *  model null (it could not be loaded): no confidence; every request is asked (level "all": every request is executed).
 *  -> {level, threshold, units: [{index, unit, src, conf, execute, nodes, reasons, dependsOn}], executed (nodes, message order), held (units not executed)} */
export function gate(model, result, level = DEFAULT_LEVEL) {
  const t = String(level) === "all" ? -Infinity : model ? threshold(model, level) : Infinity, byUnit = new Map(), owner = new Map();
  for (const n of result.nodes || []) {
    const u = n.unit; if (!u) continue;
    if (!byUnit.has(u)) byUnit.set(u, []);
    byUnit.get(u).push(n); owner.set(n.id, u);
  }
  const refsOf = (v) => (v && typeof v === "object" && !Array.isArray(v) && typeof v.ref === "string" ? [v.ref] : Array.isArray(v) ? v.flatMap(refsOf) : []);
  const G = [], gu = new Map();
  for (const [u, nodes] of byUnit) {
    const conf = model ? (u.signals ? confidence(model, u.signals, u.world) : 0) : NaN, sure = t === -Infinity || conf >= t;
    const why = sure ? [] : model ? reasons(model, u) : [{ group: "model", pull: 0, text: "the confidence model could not be loaded" }];
    const g = { index: (result.units || []).indexOf(u), unit: u, src: u.src, world: u.world, event: u.event, conf, sure, execute: sure, nodes, reasons: why, dependsOn: [] };
    for (const n of nodes) for (const r of Object.values(n.args || {}).flatMap(refsOf)) { const o = owner.get(r); if (o && o !== u && !g.dependsOn.includes(o)) g.dependsOn.push(o); }
    G.push(g); gu.set(u, g);
  }
  for (const g of G) {      // message order: a unit's dependencies come before it
    const off = g.dependsOn.map((o) => gu.get(o)).filter((d) => d && !d.execute);
    if (g.execute && off.length) { g.execute = false; g.reasons = off.map((d) => ({ group: "depends", pull: 0, text: `it uses what “${d.src}” would have made, which was not done` })); }
  }
  const run = new Set(G.filter((g) => g.execute).flatMap((g) => g.nodes));
  return { level: String(level), effective: String(level) === "all" ? "all" : model ? effectiveLevel(model, level) : null, threshold: t, units: G, executed: (result.nodes || []).filter((n) => !n.unit || run.has(n)), held: G.filter((g) => !g.execute) };
}
