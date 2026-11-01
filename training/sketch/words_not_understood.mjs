// words_not_understood.mjs: M1 (words not understood as a quality signal of the composer's readings) and M1b (cross-world pick), see GATE_AND_LEFTOVER.md.
// Copy of the pieces of composer_errors.mjs it needs (nothing in docs/ or the other scripts is changed). Output: JSON (--out F) read by wnu_stats.py.
// node words_not_understood.mjs --out F [--msgs 1000] [--units 500] [--seed 1]
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { load } from "../../docs/js/vss.js";
import * as FRONT from "../../docs/js/front.js";
import { fillerWords } from "../../docs/js/vss/reader.js";
import { readingFromWires, toNodes } from "../../docs/js/vss-adapter.js";
import { canon, canonWant } from "../../docs/js/bench-canon.js";
import { loadComposer } from "../../docs/js/vss-composer.js";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const OUT = arg("--out"), NM = +arg("--msgs", 1000), NU = +arg("--units", 500), SEED = +arg("--seed", 1);
const dirs = execFileSync("python3", [new URL("micro_tools.py", import.meta.url).pathname, "dirs"], { encoding: "utf8" }).split("\n").filter(Boolean);
const MODELS = new URL("../../docs/model/", import.meta.url);
const REG = JSON.parse(readFileSync(new URL("micro/registry.json", MODELS), "utf8"));
const CUTF = JSON.parse(readFileSync(new URL(REG.cutter, MODELS), "utf8"));
const mkRead = (d) => async (n) => { const b = readFileSync(new URL(n, d)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const cache = new Map();
const loadModel = async (name) => {
  if (cache.has(name)) return cache.get(name);
  const d = new URL(`${name}/`, MODELS), rf = mkRead(d);
  const m = { vss: await load(null, { readFile: rf, sentenceCandidates: true }), F: existsSync(new URL("front.json", d)) ? JSON.parse(await rf("front.json")) : null };
  cache.set(name, m); return m;
};
const comp = await loadComposer(REG, CUTF, loadModel, { fallback: REG.fallback });
const ALLW = comp.worlds.concat([comp.fallback]);   // registry order, fallback last

// ---------- seeded sampling (mulberry32)
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shuffle(a, R) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---------- scoring helpers (copied from composer_errors.mjs / llm_score.mjs)
function scorerUpdate(c, main) {
  if (main && main.args) {
    if (main.args.action === "create") { if (main.args.name && !main.args.count) c.refs.set(String(main.args.name).toLowerCase(), { ref: main.id }); c.last = [{ ref: main.id }]; }
    else if (main.args.target != null && !Array.isArray(main.args.target)) c.last = [main.args.target];
  }
}
const actOf = (type, args) => `${type}:${args.action || args.ask || ""}`;
function align(pred, gold) {
  const n = pred.length, m = gold.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = pred[i].act === gold[j].act ? 1 + L[i + 1][j + 1] : Math.max(L[i + 1][j], L[i][j + 1]);
  const pairs = []; let i = 0, j = 0;
  while (i < n && j < m) { if (pred[i].act === gold[j].act) { pairs.push([i, j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  return pairs;
}
const evOf = (w) => (w.type === "command" ? w.args.action : w.type === "question" ? (w.args.ask === "rules" ? "list" : w.args.ask) : w.type);
function goldSpans(r) {
  const used = new Set();
  return r.wires.map((w) => {
    let s = -1, from = 0;
    for (;;) { const k = r.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s = k; break; } from = k + 1; }
    if (s < 0) s = r.text.indexOf(w.span);
    used.add(s);
    return { w, s, e: s + w.span.length, ev: evOf(w), act: actOf(w.type, w.args), want: canonWant(w.type, w.args), span: w.span };
  });
}

// ---------- words not understood
const PUNCT = new Set([".", ",", "!", "?", ";", ":"]);
const FUNC = new Set(["the", "a", "an", "to", "of", "and", "please"]);
const isWord = (t) => !(t.startsWith("n_") || t.startsWith("t_") || /^\d+$/.test(t) || PUNCT.has(t));
const ctx = (t) => (t == null ? "B" : t.startsWith("n_") ? "NAME" : t.startsWith("t_") ? "TEXT" : /^\d+$/.test(t) ? "NUM" : t);
// the normalization of front.js (normalize), step by step with the surface word each token stands for
function trace(src, names, F) {
  const [tk] = FRONT.tokenize(src, names);
  let toks = tk.map((x, i) => ({ t: x[0], surf: [i] }));
  // values
  let out = [], i = 0;
  while (i < toks.length) {
    let hit = false;
    for (const n of [3, 2, 1]) {
      const g = toks.slice(i, i + n), ts = g.map((x) => x.t);
      if (g.length === n && ts.every(isWord) && Object.hasOwn(F.values, ts.join(" "))) { out.push({ t: F.values[ts.join(" ")], surf: g.flatMap((x) => x.surf) }); i += n; hit = true; break; }
    }
    if (!hit) out.push(toks[i++]);
  }
  toks = out;
  // triggers (first rule that fires, once)
  const tp = toks.map((x) => (x.t.startsWith("n_") ? "NAME" : x.t));
  outer: for (const e of F.triggers) {
    const ph = e.p.split(" ");
    for (let k = 0; k + ph.length <= toks.length; k++) {
      if (!ph.every((x, q) => tp[k + q] === x)) continue;
      const p = ctx(k > 0 ? toks[k - 1].t : null), n = ctx(k + ph.length < toks.length ? toks[k + ph.length].t : null), p2 = ctx(k > 1 ? toks[k - 2].t : null);
      if ((e.prev === "*" || e.prev === p) && (e.next === "*" || e.next === n) && (e.prev2 === undefined || e.prev2 === "*" || e.prev2 === p2)) {
        const phr = toks.slice(k, k + ph.length);
        if (e.ins) toks = toks.slice(0, k).concat([{ t: e.tok, surf: phr.filter((x) => !x.t.startsWith("n_")).flatMap((x) => x.surf), trig: true }], toks.slice(k));
        else toks = toks.slice(0, k).concat([{ t: e.tok, surf: phr.flatMap((x) => x.surf), trig: true }], (e.keep || []).map((t) => ({ t, surf: [] })), toks.slice(k + ph.length));
        break outer;
      }
    }
  }
  return { surface: tk, toks };
}
// one reading x (Composer.readIn result) of src -> {words, und, wordsNF, undNF, und_words}
function wnu(x, src, names) {
  const { surface, toks } = trace(src, names, x.w.F);
  if (toks.map((q) => q.t).join(" ") !== x.tokens.join(" ")) return null;       // replication check
  const surfW = surface.map((s, i) => [s[0], i]).filter(([t]) => !PUNCT.has(t));
  const readable = !["unknown-event", "no-sense"].includes(x.status);
  const U = new Set();
  if (readable) {
    for (const fl of Object.values(x.r.frame.roles || {})) for (const w of fillerWords(fl)) U.add(w);
    for (const w of Object.values(x.r.offers || {})) U.add(w);
  }
  const verb = readable ? x.tokens.find((t) => x.w.verbEvent.has(t)) || x.r.frame.lemma || null : null;
  const und = new Set();
  if (readable) {
    for (const q of toks) if (U.has(q.t) || (verb && q.t === verb)) for (const i of q.surf) und.add(i);
    // the action word: the first token of the event, if the verb is a lemma not among the tokens
  }
  const nf = (t) => FUNC.has(t);
  const words = surfW.length, notU = surfW.filter(([, i]) => !und.has(i));
  const wordsNF = surfW.filter(([t]) => !nf(t)).length, undNF = notU.filter(([t]) => !nf(t));
  return { words, und: notU.length, wordsNF, undNF: undNF.length, notU: notU.map(([t]) => t) };
}

// ---------- the composer over the units of the composer's own cutter (copy of runUnits / evaluate of composer_errors.mjs)
function runUnits(text, names, cutSpans) {
  const c = { names: names.slice(), last: [], refs: new Map() }, seq = { s: 0, m: 0 }, nodes = [], units = [];
  for (const [c0, c1] of cutSpans) {
    const src = text.slice(c0, c1), nm = c.names.concat([...c.refs.keys()]);
    const u = Object.assign({ c0, c1, src, mains: [] }, comp.route(src, nm));
    units.push(u);
    if (u.zone !== "read") continue;
    const x = u.chosen; u.rstatus = x.r.status; { const m = Object.values(x.r.margins || {}); u.margin = m.length ? Math.min(...m) : Infinity; }
    u.wnu = wnu(x, src, nm); u.act_tok = x.tokens.find((t) => x.w.verbEvent.has(t)) || x.r.frame.lemma || null;
    const verb = u.act_tok;
    const reading = readingFromWires(x.r.wires, verb, x.tokens), out = toNodes(reading, x.info, c, seq);
    for (const n of out.nodes) { n.world = u.world; n.unit = units.length - 1; }
    nodes.push(...out.nodes); u.mains = out.nodes.filter((n) => n.type !== "mention");
    scorerUpdate(c, out.nodes[out.nodes.length - 1]);
  }
  return { nodes, units };
}
function evaluate(r) {
  const G = goldSpans(r), names = r.names || [];
  const spans = FRONT.segmentSpans(r.text, names, CUTF);
  const { nodes, units } = runUnits(r.text, names, spans);
  const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
  const pairs = align(mains, G.map((g) => ({ act: g.act })));
  const usedP = new Set(pairs.map((p) => p[0])), rightP = new Set();
  for (const [i, j] of pairs) { const g = G[j]; if (!Object.entries(g.want).some(([k, v]) => (mains[i].got[k] ?? "∅") !== v)) rightP.add(i); }
  return { G, mains: mains.map((m, i) => { const u = units[m.n.unit]; return { kind: usedP.has(i) ? (rightP.has(i) ? "right" : "wrong") : "extra", unit: m.n.unit, u }; }), units };
}

// ---------- load + sample
const rows = [];
for (const d of dirs) for (const f of readdirSync(d).filter((f) => f.endsWith(".jsonl")).sort())
  for (const l of readFileSync(`${d}/${f}`, "utf8").split("\n")) if (l.trim()) { const r = JSON.parse(l); r._dir = d.split("/").slice(-2).join("/"); rows.push(r); }
const R = rng(SEED), sample = shuffle(rows, R).slice(0, NM);
console.error(`rows ${rows.length}, sample ${sample.length}`);

// ---------- M1
const recs = []; let mism = 0, nunits = 0;
sample.forEach((r, mi) => {
  const E = evaluate(r);
  for (const m of E.mains) {
    const w = m.u.wnu; nunits++;
    if (!w) { mism++; continue; }
    recs.push({ msg: mi, kind: m.kind, world: m.u.world, event: m.u.event, src: m.u.src, tok: m.u.act_tok, status: m.u.rstatus, margin: m.u.margin === Infinity ? null : m.u.margin, words: w.words, und: w.und, wordsNF: w.wordsNF, undNF: w.undNF, notU: w.notU });
  }
});
console.error(`M1: ${recs.length} readings (${mism} skipped: normalization replica mismatch, of ${nunits})`);

// ---------- M1b: sample of gold units, read by every world
const pool = [];
sample.forEach((r) => { for (const g of goldSpans(r)) pool.push({ r, g }); });
const cross = shuffle(pool, rng(SEED + 1)).slice(0, NU).map(({ r, g }) => {
  const names = r.names || [], reads = ALLW.map((w) => {
    const x = comp.readIn(w, g.span, names), q = wnu(x, g.span, names);
    return { world: w.id, status: x.status, event: x.event, und: q ? q.und : null, words: q ? q.words : null, notU: q ? q.notU : null };
  });
  const goldW = (ALLW.find((w) => w.events && w.events.has(g.ev)) || comp.fallback).id;
  return { id: r.id, span: g.span, ev: g.ev, goldWorld: goldW, reads };
});
console.error(`M1b: ${cross.length} units, null-replica readings ${cross.reduce((a, c) => a + c.reads.filter((x) => x.und === null).length, 0)}`);
writeFileSync(OUT, JSON.stringify({ recs, cross, worlds: ALLW.map((w) => w.id), n_msgs: sample.length, mism, nunits }));
