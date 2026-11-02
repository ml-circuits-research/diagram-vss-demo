// composer_errors.mjs: the root cause of every miss of the VSS composer on whole messages (AGENTS.md: a root-cause analysis after every
// evaluation; review 2026-11-02 item 7). Runs the composer exactly as llm_score.mjs SEG=composer PAIR=value does (layer_common.mjs
// loadRegistry + comp.formalize: the world cutter, the event cutter, the registry's worlds, no fallback, the context filler; the context
// rule of llm_score.mjs between requests) and scores per requested action with the same canon and the same value-aware pairing, so its
// totals are llm_score's (checked: the line "totals" equals llm_score's "vss correct / not done / done wrong / extra").
// Every gold request that is not right (done wrong or not done) gets the FIRST stage, in the order below, that explains it. The unit of a
// gold request is the unit that holds its trigger word (the annotation's `trigger`, found inside the gold span); when no unit holds it,
// the unit that shares the most letters with the gold span.
//   1 cut       lost         no unit holds any letter of the gold span
//               no trigger   the trigger word is outside every unit (units hold only other parts of the request)
//               merged       the unit also holds the trigger of another gold request that it did not give
//               cut short    a gold value written in the gold span (a name, a number, a quoted text) is outside the unit
//   2 world     not a candidate   the gold world is not among the unit's candidate worlds (the cutter's top k)
//               unknown-event     the gold world read the unit with no action word (status unknown-event / no-sense)
//               another event     the gold world read the unit as another event
//               lost to a world   the gold world read the right event, another world won: by fewer words not understood ("words"),
//                                 or in a tie by the context filler ("context") or by the cutter's order ("order")
//               ignored           no candidate understood a word (zone "ignored") although the gold world read an event
//   3 filler    asked             the right reading, but the context filler asked (zone "ask"); by the kind of the asked gap
//   4 pairing   the right action was produced in this unit but paired to another gold request of the same action
//   5 keys of a request done with the right action (the first wrong key decides, entity keys first):
//               filler filled wrong / filler dropped     a gap of that key that the filler filled with the wrong shape / dropped
//               roles: more / order   the args (unit.raw) hold the gold values and more, or in another order
//               adapter        the reader's reading holds the gold value (in a role the adapter does not map for this event), the
//                              adapter's args (unit.raw) hold it nowhere
//               roles: wrong role   the value is in the args under another key
//               roles: not placed   the value is a token of the unit (front end output) but the reader placed it in no role
//               front end      the value is not a token of the unit (normalization: no legend token for it)
//               description    the gold value is a description (mention) and the output another description or a name
//               other
// Extras (requests nobody asked for) are classified too: outside every gold span / a second request from one gold span (split) / the
// gold request of that span is done with another action.
// REGISTRY=<file> (default docs/model/micro/registry.json), CONTEXT=<file> (the filler's weights; default the registry's "context").
// node composer_errors.mjs <dir> [<dir> ...] [--examples N] [--json out.json]     (no dir: the 9 folders of micro_tools.py dirs)
import { writeFileSync } from "node:fs";
import { canon } from "../../docs/js/bench-canon.js";
import { loadRegistry, readRows, goldSpans, dirsAll, scorerUpdate, pairValue, overlap, parts, actOf } from "./layer_common.mjs";

const argv = process.argv.slice(2), exAt = argv.indexOf("--examples"), jsAt = argv.indexOf("--json");
const NEX = exAt >= 0 ? +argv[exAt + 1] : 4, JSON_OUT = jsAt >= 0 ? argv[jsAt + 1] : null;
let dirs = argv.filter((a, i) => !a.startsWith("-") && (exAt < 0 || i !== exAt + 1) && (jsAt < 0 || i !== jsAt + 1));
if (!dirs.length) dirs = dirsAll();
const { comp, meta } = await loadRegistry();
console.log(`composer: ${meta.registry} · worlds ${meta.worlds.join(", ")} · filler ${meta.ties_context} · event hint ${meta.event_hint}`);
// the world of each event (registry); a gold event ("rules" is asked as list, micro_tools.py event())
const worldOf = new Map(); for (const w of comp.worlds) for (const e of w.events) worldOf.set(e, w.id);
const evOf = (w) => (w.type === "command" ? w.args.action : w.type === "question" ? (w.args.ask === "rules" ? "list" : w.args.ask) : w.type);
const UNREADABLE = new Set(["unknown-event", "no-sense"]);
const low = (s) => String(s).toLowerCase();

// ---------- values: gold value atoms vs the unit's tokens, the reading's fillers and the raw args
const REL = { left_of: "leftof", right_of: "rightof", next_to: "near" }, REGION = { left_side: "left", right_side: "right" };
const SHAPE = new Set(["circle", "square", "rectangle", "triangle", "diamond", "ellipse", "hexagon", "star"]);
/** a token of the front end -> the canonical string of a value (bench-canon: lower case, no "_"); names lose n_, texts t_ */
function tokval(t) {
  t = low(t).replace(/^[nt]_/, ""); t = REL[t] || REGION[t] || t; t = t.replace(/_/g, "");
  if (t.endsWith("s") && SHAPE.has(t.slice(0, -1))) t = t.slice(0, -1); if (t === "ellipses") t = "ellipse";
  return t;
}
const squash = (v) => low(v).replace(/[^a-z0-9$]+/g, "");
/** the atoms of a canonical gold value: names / values, and the answers of a description mention(k=v,...) */
function atoms(v) {
  const out = [];
  for (const p of parts(v)) { const m = /^mention\((.*)\)$/.exec(p); if (m) { for (const kv of m[1].split(",")) if (kv.includes("=")) out.push(kv.split("=")[1]); } else out.push(p); }
  return out.filter((x) => x && x !== "all" && x !== "$new" && x !== "?");
}
/** the fillers of a reading (readingFromWires): role -> [canonical values] */
function fillers(reading) {
  const out = new Set();
  for (const v of Object.values((reading && reading.roles) || {})) for (const x of [].concat(v)) {
    if (x == null) continue;
    if (typeof x === "string") out.add(tokval(x));
    else { if (x.head) out.add(tokval(x.head)); if (x.attr) out.add(tokval(x.attr)); if (x.det) out.add(tokval(x.det)); }
  }
  return out;
}

// ---------- the run
const C = { gold: 0, right: 0, wrong: 0, notDone: 0, extra: 0 }, CAUSE = new Map(), EXTRA = new Map(), PERDIR = {};
const add = (M, k, ex, kind) => { const r = M.get(k) || { n: 0, wrong: 0, notDone: 0, ex: [] }; r.n++; if (kind) r[kind]++; if (r.ex.length < NEX) r.ex.push(ex); M.set(k, r); };
const records = [];
for (const d of dirs) {
  const name = d.split("/").filter(Boolean).slice(-2).join("/"), rows = readRows(d), T = (PERDIR[name] = { gold: 0, right: 0, wrong: 0, notDone: 0, extra: 0 });
  for (const r of rows) {
    const out = comp.formalize(r.text, { names: r.names || [], last: [] }, { update: scorerUpdate }), units = out.units, nodes = out.nodes;
    const G = goldSpans(r);
    // the triggers: the trigger word inside the gold span (first occurrence)
    for (const g of G) { const w = r.wires[g.idx]; const k = w.trigger && g.s >= 0 ? low(r.text).indexOf(low(w.trigger), g.s) : -1; g.t0 = k >= 0 && k < g.e ? k : -1; g.t1 = g.t0 >= 0 ? g.t0 + w.trigger.length : -1; g.ev = evOf(w); g.world = worldOf.get(g.ev) || "none"; }
    const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ n, act: actOf(n.type, n.args), got: canon(n, nodes), u: n.span ? units.findIndex((u) => u.c0 === n.span[0] && u.c1 === n.span[1]) : -1 }));
    const pairs = pairValue({ text: r.text, gold: G, units: mains.map((m) => (m.n.span ? { c0: m.n.span[0], c1: m.n.span[1] } : { c0: 0, c1: 0 })), prods: mains.map((m, i) => ({ act: m.act, u: i, rawC: m.got })) });
    const pairOfG = new Map(pairs.map(([i, j]) => [j, i])), pairOfP = new Map(pairs.map(([i, j]) => [i, j]));
    const ex = (g, u, extra = {}) => Object.assign({ id: r.id, gold: `${g.act} ${JSON.stringify(g.want)}`, span: g.span, unit: u ? u.src : null }, extra);
    const unitOfG = (g) => {
      let k = g.t0 >= 0 ? units.findIndex((u) => u.c0 <= g.t0 && g.t0 < u.c1) : -1;
      if (k >= 0) return { k, how: "trigger" };
      let best = -1, bo = 0; units.forEach((u, i) => { const o = overlap(r.text, u.c0, u.c1, g.s, g.e); if (o > bo) { bo = o; best = i; } });
      return { k: best, how: best >= 0 ? "overlap" : "none" };
    };
    G.forEach((g, j) => {
      C.gold++; T.gold++;
      const pi = pairOfG.get(j), m = pi != null ? mains[pi] : null;
      const wrongKeys = m ? Object.entries(g.want).filter(([k, v]) => (m.got[k] ?? "∅") !== v).map(([k]) => k) : null;
      if (m && !wrongKeys.length) { C.right++; T.right++; return; }
      const kind = m ? "wrong" : "notDone"; C[kind]++; T[kind]++;
      const { k: uk, how } = unitOfG(g), u = uk >= 0 ? units[uk] : null;
      const cause = (c, extra) => { add(CAUSE, c, ex(g, u, extra), kind); records.push({ id: r.id, j, kind, cause: c }); };
      // 1 cut
      if (!u) return cause("1 cut: lost (no unit holds a letter of the request)");
      if (how === "overlap" && g.t0 >= 0) return cause("1 cut: the trigger word is outside every unit");
      const others = G.filter((h, jj) => jj !== j && h.t0 >= 0 && u.c0 <= h.t0 && h.t0 < u.c1);
      const gaveOther = others.some((h) => { const p = pairOfG.get(h.idx); return p != null && mains[p].u === uk; });
      if (others.length && (!m || m.u !== uk) && gaveOther) return cause("1 cut: merged with another request (the unit gave the other one)");
      const inSpan = atoms(Object.entries(g.want).filter(([k]) => k !== "action" && k !== "ask").map(([, v]) => v).join(",")).filter((a) => low(r.text.slice(g.s, g.e)).includes(a) && a.length > 1);
      const outside = inSpan.filter((a) => !low(u.src).includes(a));
      if (outside.length) return cause("1 cut: cut short (a value of the request is outside the unit)", { outside });
      // 2 world / event
      const gw = g.world, tried = (u.tried || []).find((t) => t.world === gw);
      if (!tried) return cause("2 world: the gold world is not a candidate (cutter's top k)");
      if (tried && UNREADABLE.has(tried.status)) return cause(`2 unknown-event: the gold world found no action word (${tried.status})`);
      if (tried && tried.event !== g.ev) return cause("2 event: the gold world read another event", { read: tried.event });
      if (u.zone === "ignored") return cause("2 ignored: no candidate understood a word");
      if (u.world !== gw) return cause(`2 world: another world won (${u.decidedBy === "words" ? "fewer words not understood" : "tie decided by " + u.decidedBy})`, { chosen: `${u.world}:${u.event}` });
      if (u.event !== g.ev) return cause("2 event: the chosen reading has another event");
      // 3 the context filler asked
      if (u.zone === "ask") { const ks = [...new Set((u.gaps || []).filter((x) => x.decision === "ask").map((x) => `${x.kind} ${x.key}`))].join(", "); return cause(`3 filler asked (${[...new Set((u.gaps || []).filter((x) => x.decision === "ask").map((x) => x.kind))].sort().join("+")})`, { gaps: ks }); }
      // 4 pairing
      if (!m) return cause("4 pairing: the unit's request was paired to another gold request (or none)", { act: g.act });
      if (m.u !== uk) return cause("4 pairing: done by another unit", { by: units[m.u] ? units[m.u].src : null });
      // 5 the wrong keys of a request done with the right action
      const ent = new Set(comp.entity.keys), order = wrongKeys.slice().sort((a, b) => (ent.has(b) ? 1 : 0) - (ent.has(a) ? 1 : 0));
      const k = order[0], gv = g.want[k], got = m.got[k] ?? "∅";
      const gap = (u.gaps || []).find((x) => x.key === k);
      if (gap && gap.decision === "fill") return cause(`5 filler filled wrong (${gap.kind} ${ent.has(k) ? "entity key" : k})`, { key: k, got, want: gv });
      if (gap && gap.decision === "dropped") return cause(`5 filler dropped a reference (${gap.kind})`, { key: k, got, want: gv });
      if (gv.startsWith("mention(") && (got.startsWith("mention(") || got !== "∅")) return cause("5 description read as another description or a name", { key: k, got, want: gv });
      const raw = u.raw && u.raw.main ? canon(u.raw.main, u.raw.nodes) : {}, rawVals = new Set(Object.entries(raw).filter(([kk]) => kk !== k).flatMap(([, v]) => atoms(v).map(squash)));
      const want = atoms(gv).map(squash), fill = fillers(u.reading), toks = new Set((u.normalized || "").split(" ").map(tokval));
      const missing = want.filter((a) => !atoms(raw[k] || "").map(squash).includes(a));
      if (!missing.length) {
        const ra = atoms(raw[k] || "").map(squash);
        if (ra.length > want.length) return cause("5 roles: the key holds the gold values and more (reader)", { key: k, got, want: gv });
        if (ra.length === want.length && [...ra].sort().join() === [...want].sort().join() && ra.join() !== want.join()) return cause("5 roles: the values in another order", { key: k, got, want: gv });
        return cause("5 other (the raw args hold the value; a later step changed it)", { key: k, got, want: gv });
      }
      const a = missing[0];
      if (rawVals.has(a)) return cause("5 roles: the value is in another key (wrong role)", { key: k, got, want: gv });
      if (fill.has(a)) return cause("5 adapter: the reading holds the value, the args do not", { key: k, got, want: gv });
      if (toks.has(a)) return cause("5 roles: the value is a token of the unit, placed in no role", { key: k, got, want: gv });
      if (k === "action" || k === "ask") return cause("5 other", { key: k, got, want: gv });
      return cause("5 front end: the value is not a token of the unit", { key: k, got, want: gv, tokens: u.normalized });
    });
    // extras
    mains.forEach((m, i) => {
      if (pairOfP.has(i)) return;
      C.extra++; T.extra++;
      const u = units[m.u] || null, e = { id: r.id, got: `${m.act} ${JSON.stringify(m.got)}`, unit: u ? u.src : m.n.src };
      if (!u) return add(EXTRA, "extra: no unit (unexpected)", e);
      const hit = G.filter((g) => overlap(r.text, u.c0, u.c1, g.s, g.e) > 0);
      if (!hit.length) return add(EXTRA, "extra: the unit is outside every gold request (text that is not a request)", e);
      if (hit.some((g) => pairOfG.has(g.idx) && mains[pairOfG.get(g.idx)].u !== m.u)) return add(EXTRA, "extra: a second request from one gold request (split, or one request read twice)", e);
      return add(EXTRA, "extra: the gold request of this unit is done with another action (it counts as not done too)", e);
    });
  }
}
const pc = (x, n) => (n ? (100 * x / n).toFixed(1) : "0.0");
console.log(`\ntotals (per gold request): ${C.gold} requests · right ${pc(C.right, C.gold)}% · done wrong ${pc(C.wrong, C.gold)}% · not done ${pc(C.notDone, C.gold)}% · extra ${C.extra}`);
for (const [d, T] of Object.entries(PERDIR)) console.log(`  ${d}: ${T.gold} · right ${pc(T.right, T.gold)} · wrong ${pc(T.wrong, T.gold)} · not done ${pc(T.notDone, T.gold)} · extra ${T.extra}`);
const miss = C.wrong + C.notDone;
console.log(`\nfirst cause of the ${miss} requests not right (${C.wrong} done wrong + ${C.notDone} not done)\n| cause | requests | share of misses | done wrong | not done |\n|---|---|---|---|---|`);
const sorted = [...CAUSE.entries()].sort((a, b) => a[0].localeCompare(b[0], "en", { numeric: true }));
for (const [c, x] of sorted) console.log(`| ${c} | ${x.n} | ${pc(x.n, miss)}% | ${x.wrong} | ${x.notDone} |`);
const stage = {}; for (const [c, x] of sorted) { const s = c.split(":")[0].replace(/^(\d) .*/, (m0, n) => ({ 1: "1 cut", 2: "2 world / event", 3: "3 filler asked", 4: "4 pairing", 5: "5 keys" })[n] || m0); const o = (stage[s] = stage[s] || { n: 0, wrong: 0, notDone: 0 }); o.n += x.n; o.wrong += x.wrong; o.notDone += x.notDone; }
console.log("\nper stage: " + Object.entries(stage).map(([s, o]) => `${s} ${o.n} (${pc(o.n, miss)}%: wrong ${o.wrong}, not done ${o.notDone})`).join(" · "));
console.log(`\nextras (${C.extra})\n| cause | extras |\n|---|---|`);
for (const [c, x] of [...EXTRA.entries()].sort((a, b) => b[1].n - a[1].n)) console.log(`| ${c} | ${x.n} |`);
if (NEX > 0) {
  console.log("\nexamples");
  for (const [c, x] of sorted) { console.log(`\n${c}`); for (const e of x.ex) console.log("  " + JSON.stringify(e)); }
  for (const [c, x] of EXTRA) { console.log(`\n${c}`); for (const e of x.ex) console.log("  " + JSON.stringify(e)); }
}
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ meta, totals: C, perDir: PERDIR, causes: Object.fromEntries(CAUSE), extras: Object.fromEntries(EXTRA), records }, null, 1));
