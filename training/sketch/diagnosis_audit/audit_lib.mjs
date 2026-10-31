// audit_lib.mjs: the readers and the scoring path of training/sketch/llm_score.mjs, copied verbatim (vssFormalize, align,
// scoreMessage's matching rule), so the audit scripts measure exactly what llm_score measures. Plus: gold wires -> reader-style nodes.
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
const REPO = "/home/claude/diagram-vss-demo";
const { load } = await import(`${REPO}/docs/js/vss.js`);
const { compile, normalize } = await import(`${REPO}/docs/js/snorm.js`);
const FRONT = await import(`${REPO}/docs/js/front.js`);
const { vssCentres } = await import(`${REPO}/docs/js/vss-centers.js`);
const { readingFromWires, toNodes } = await import(`${REPO}/docs/js/vss-adapter.js`);
export const { canon, canonWant, score: benchScore } = await import(`${REPO}/docs/js/bench-canon.js`);
const require = createRequire(import.meta.url);
export const K = require(`${REPO}/docs/js/logic.js`);

export const readRows = (p) => readFileSync(p, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
export const actOf = (type, args) => `${type}:${args.action || args.ask || ""}`;

let vss = null, F = null, C = null, lex = null, verbEvent = null;
export const sys = K.createSystem();
export async function loadVSS(model) {
  const dir = `${REPO}/docs/model/${model}/`;
  const readFile = async (n) => { const b = readFileSync(dir + n); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
  vss = await load(null, { readFile, sentenceCandidates: true });
  F = existsSync(dir + "front.json") ? JSON.parse(await readFile("front.json")) : null;
  C = F ? null : compile(JSON.parse(await readFile("normalize.json")));
  lex = new Set(Object.keys(vss.model.lexicon || {})); verbEvent = new Map();
  for (const e of vss.model.legend.events) for (const v of e.verbs) verbEvent.set(v, e.id);
}
// verbatim from llm_score.mjs (vssFormalize), with SEG passed as an argument instead of process.env.SEG
export function vssFormalize(text, ctx, SEG) {
  const segs = SEG === "gold" && ctx.spans ? ctx.spans.map((src) => ({ src }))
    : F ? vssCentres(text, ctx.names, F, vss, { confident: false }).map((src) => ({ src }))
    : sys.formalize(text, ctx).segments;
  const seq = { s: 0, m: 0 }, c = { names: ctx.names, last: [], refs: new Map() }, nodes = [];
  for (const seg of segs) {
    const nm = c.names.concat([...c.refs.keys()]);
    const { tokens, info: ni } = F ? FRONT.normalize(seg.src, nm, F) : normalize(C, lex, seg.src, nm), r = vss.read(tokens.join(" "));
    const verb = tokens.find((t) => verbEvent.has(t)) || null;
    const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb, tokens);
    const out = reading ? toNodes(reading, ni, c, seq) : { nodes: [] };
    out.nodes.forEach((n) => { if (n.type !== "mention") Object.defineProperty(n, "src", { value: seg.src, enumerable: false }); }); nodes.push(...out.nodes);
    const main = out.nodes[out.nodes.length - 1];
    if (main && main.args) {
      if (main.args.action === "create") { if (main.args.name && !main.args.count) c.refs.set(String(main.args.name).toLowerCase(), { ref: main.id }); c.last = [{ ref: main.id }]; }
      else if (main.args.target != null && !Array.isArray(main.args.target)) c.last = [main.args.target];
    }
  }
  return nodes;
}
export const rulesFormalize = (text, ctx) => sys.formalize(text, ctx).nodes;
export const ctxOf = (r) => ({ names: r.names || [], last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null });

// verbatim from llm_score.mjs
export function align(pred, gold) {
  const n = pred.length, m = gold.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = pred[i].act === gold[j].act ? 1 + L[i + 1][j + 1] : Math.max(L[i + 1][j], L[i][j + 1]);
  const pairs = []; let i = 0, j = 0;
  while (i < n && j < m) { if (pred[i].act === gold[j].act) { pairs.push([i, j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  return pairs;
}
/** llm_score's scoreMessage rule, returning per aligned pair the reader node, the canonical forms and the verdict */
export function scorePairs(nodes, row) {
  const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
  const gold = row.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args), w }));
  const pairs = align(mains, gold).map(([i, j]) => {
    const miss = Object.entries(gold[j].want).filter(([k, v]) => (mains[i].got[k] ?? "∅") !== v).map(([k, v]) => ({ k, got: mains[i].got[k] ?? "∅", want: v }));
    const extra = Object.keys(mains[i].got).filter((k) => !(k in gold[j].want));
    return { i, j, right: !miss.length, miss, extra, got: mains[i].got, want: gold[j].want, node: mains[i].n, goldWire: gold[j].w };
  });
  return { pairs, nMain: mains.length, nGold: gold.length, extraWires: mains.length - pairs.length, mains, gold };
}

// ---- gold wire -> the node a reader would emit (SOP Lang: arrays for lists, numbers for count/distance, mention wires, refs for $new)
const NUMERIC = new Set(["count", "distance"]);
const MENTION_KEY = { color: "color", notcolor: "notColor", quantifier: "quantifier", recency: "recency", shape: "shape", size: "size" };
export const splitTop = (s) => { const out = []; let d = 0, cur = ""; for (const ch of String(s)) { if (ch === "(") d++; if (ch === ")") d--; if (ch === "," && d === 0) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; };
/** returns { nodes, issues }: issues = things in the gold that a reader's node cannot reproduce as written */
export function goldToNodes(row) {
  const nodes = [], issues = []; let s = 0, m = 0; const created = [];
  const conv = (k, v, wi) => {
    const parts = Array.isArray(v) ? v.map(String) : splitTop(v);
    const out = parts.map((p) => {
      const t = p.trim();
      if (t !== p) issues.push({ wi, k, what: `whitespace around a list item "${p}"` });
      const mm = /^mention\((.*)\)$/.exec(t);
      if (mm) {
        const a = {};
        for (const kv of mm[1].split(",").filter(Boolean)) { const [mk, mv] = kv.split("="); if (!MENTION_KEY[mk]) issues.push({ wi, k, what: `mention key "${mk}" not produced by any reader` }); a[MENTION_KEY[mk] || mk] = mv; }
        const id = "m" + (++m); nodes.push({ id, type: "mention", args: a }); return { ref: id };
      }
      if (t === "$new") { if (!created.length) { issues.push({ wi, k, what: "$new with no create earlier in the message" }); return { ref: "s0" }; } return { ref: created[created.length - 1] }; }
      if (NUMERIC.has(k) && /^-?\d+(\.\d+)?$/.test(t)) return Number(t);
      return t;
    });
    return out.length === 1 ? out[0] : out;
  };
  row.wires.forEach((w, wi) => {
    const args = {};
    for (const [k, v] of Object.entries(w.args)) args[k] = k === "action" || k === "ask" ? v : conv(k, v, wi);
    const id = (w.type === "rule" ? "r" : "s") + (++s); nodes.push({ id, type: w.type, args });
    if (args.action === "create" || args.action === "duplicate") created.push(id);
  });
  return { nodes, issues };
}

// Wilson 95% interval
export function wilson(k, n, z = 1.959964) {
  if (!n) return [0, 0];
  const p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}
// seeded PRNG (mulberry32) and Fisher-Yates
export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function shuffle(arr, seed) { const r = rng(seed), a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
