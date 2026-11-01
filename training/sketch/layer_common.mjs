// layer_common.mjs: shared by layer_score.mjs and train_context.mjs.
//  - build(): ONE composer pass (docs/js/vss-composer.js via loadComposer, registry docs/model/micro/registry.json, the learned cutter) over
//    the 9 data folders (micro_tools.py dirs). Per read unit it keeps: the VSS layer (vss-context.js rawNodes: the adapter's mapping with
//    nothing resolved) and today's post-VSS output (vss-adapter.js toNodes with the context rule of llm_score.mjs, scorerUpdate), both in
//    the canonical form of bench-canon.js. The loop over units is copied from composer_errors.mjs (itself a copy of Composer.formalize).
//    The result is cached as JSON (CACHE=<file>, default in the scratchpad dir given by LAYER_CACHE_DIR or /tmp); REBUILD=1 rebuilds.
//  - classify(): the VSS layer's output per gold key (classes 1-5 of LAYERS.md).
//  - pairOrder() (llm_score.mjs: LCS on the action label) and pairValue() (per action label, a maximum-weight matching: as many pairs as
//    possible, then the most gold keys the VSS layer read right, then the most letters shared by the unit and the gold span).
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { load } from "../../docs/js/vss.js";
import * as FRONT from "../../docs/js/front.js";
import { readingFromWires, toNodes } from "../../docs/js/vss-adapter.js";
import { canon, canonWant } from "../../docs/js/bench-canon.js";
import { loadComposer } from "../../docs/js/vss-composer.js";
import { rawNodes, ENTITY_KEYS } from "../../docs/js/vss-context.js";

export const MODELS = new URL("../../docs/model/", import.meta.url);
export const actOf = (type, args) => `${type}:${args.action || args.ask || ""}`;
export const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9$]+/g, " ").trim();
export const isTest = (id) => { let h = 2166136261; for (const ch of String(id)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h % 5 === 0; };   // 20% of messages by id hash (FNV-1a)
export const dirsAll = () => execFileSync("python3", [new URL("micro_tools.py", import.meta.url).pathname, "dirs"], { encoding: "utf8" }).split("\n").filter(Boolean);
export const defaultCache = () => process.env.CACHE || `${process.env.LAYER_CACHE_DIR || "/tmp"}/layer_cache.json`;

function scorerUpdate(c, main) {   // llm_score.mjs, copied
  if (main && main.args) {
    if (main.args.action === "create") { if (main.args.name && !main.args.count) c.refs.set(String(main.args.name).toLowerCase(), { ref: main.id }); c.last = [{ ref: main.id }]; }
    else if (main.args.target != null && !Array.isArray(main.args.target)) c.last = [main.args.target];
  }
}
/** canon with the name of a created shape kept: "$new" -> "$new=<name>" (for the per-key comparisons only) */
export function canonN(main, nodes) {
  const byId = new Map(nodes.map((n) => [n.id, n])), sub = (v) => {
    if (Array.isArray(v)) return v.map(sub);
    if (v && typeof v === "object" && typeof v.ref === "string") { const m = byId.get(v.ref); if (m && m.type !== "mention" && m.args && m.args.name != null && !m.args.count) return "$new=" + String(m.args.name); }
    return v;
  };
  return canon({ type: main.type, args: Object.fromEntries(Object.entries(main.args).map(([k, v]) => [k, sub(v)])) }, nodes);
}
function goldSpans(r) {   // composer_errors.mjs, copied
  const used = new Set();
  return r.wires.map((w, idx) => {
    let s = -1, from = 0;
    for (;;) { const k = r.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s = k; break; } from = k + 1; }
    if (s < 0) s = r.text.indexOf(w.span);
    used.add(s);
    return { idx, s, e: s + w.span.length, span: w.span, type: w.type, args: w.args, act: actOf(w.type, w.args), want: canonWant(w.type, w.args) };
  });
}

export async function build(dirs) {
  const cacheFile = defaultCache();
  if (existsSync(cacheFile) && process.env.REBUILD !== "1") return JSON.parse(readFileSync(cacheFile, "utf8"));
  const REG = JSON.parse(readFileSync(process.env.REGISTRY || new URL("micro/registry.json", MODELS), "utf8"));
  const MODEL = process.env.MODEL || REG.fallback, CUTF = JSON.parse(readFileSync(new URL(REG.cutter, MODELS), "utf8"));
  const cache = new Map();
  const loadModel = async (name) => {
    if (cache.has(name)) return cache.get(name);
    const d = new URL(`${name}/`, MODELS), rf = async (n) => { const b = readFileSync(new URL(n, d)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
    const m = { vss: await load(null, { readFile: rf, sentenceCandidates: true }), F: existsSync(new URL("front.json", d)) ? JSON.parse(await rf("front.json")) : null };
    cache.set(name, m); return m;
  };
  const comp = await loadComposer(REG, CUTF, loadModel, { fallback: MODEL });
  const out = { meta: { registry: process.env.REGISTRY || "docs/model/micro/registry.json", fallback: MODEL, cutter: REG.cutter, worlds: comp.worlds.map((w) => w.id), built: new Date().toISOString() }, msgs: [] };
  for (const d of dirs) {
    const name = d.split("/").slice(-2).join("/");
    const rows = readdirSync(d).filter((f) => f.endsWith(".jsonl")).sort().flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)));
    for (const r of rows) {
      const names = r.names || [], c = { names: names.slice(), last: [], refs: new Map() }, seq = { s: 0, m: 0 }, rseq = { s: 100, m: 100 };
      const bnodes = [], units = [], prods = [];
      for (const [c0, c1] of FRONT.segmentSpans(r.text, names, CUTF)) {
        const src = r.text.slice(c0, c1), nm = c.names.concat([...c.refs.keys()]);
        const u = comp.route(src, nm), ui = units.length;
        units.push({ c0, c1, zone: u.zone, world: u.world, status: u.status });
        if (u.zone !== "read") continue;
        const x = u.chosen, verb = x.tokens.find((t) => x.w.verbEvent.has(t)) || x.r.frame.lemma || null;
        const reading = readingFromWires(x.r.wires, verb, x.tokens);
        const raw = rawNodes(reading, x.info, names, rseq);
        const base = toNodes(reading, x.info, c, seq);
        bnodes.push(...base.nodes); scorerUpdate(c, base.nodes[base.nodes.length - 1]);
        const bm = base.nodes.filter((n) => n.type !== "mention")[0];
        if (!bm || !raw.main) continue;
        prods.push({ u: ui, world: u.world, act: actOf(bm.type, bm.args), tokens: x.tokens, raw: { nodes: raw.nodes, mainId: raw.main.id, defaulted: raw.defaulted },
          rawC: canon(raw.main, raw.nodes), baseC: canon(bm, bnodes), baseN: canonN(bm, bnodes) });
      }
      out.msgs.push({ id: r.id, dir: name, text: r.text, names, gold: goldSpans(r), units, prods });
    }
    console.error(`built ${name}: ${rows.length} messages`);
  }
  writeFileSync(cacheFile, JSON.stringify(out));
  return out;
}

// ---------------------------------------------------------------- the VSS layer per gold key
const REL = { leftof: "left_of", rightof: "right_of", above: "above", below: "below", near: "next_to", between: "between" };   // keys lower-case: canonWant lower-cases
const REGION = { center: "center", top: "top", bottom: "bottom", left: "left_side", right: "right_side", topleft: "top_left", topright: "top_right", bottomleft: "bottom_left", bottomright: "bottom_right" };
const VALTOK = { horizontal: "horizontally", vertical: "vertically", circle: "ring", both: "two_way", none: "plain", all: "each_other", mostconnected: "mostconnected" };
export const parts = (s) => { const o = []; let d = 0, cur = ""; for (const ch of String(s)) { if (ch === "(") d++; if (ch === ")") d--; if (ch === "," && d === 0) { o.push(cur); cur = ""; } else cur += ch; } o.push(cur); return o; };
const isRefStr = (x) => x.startsWith("@") || x.startsWith("mention(");
/** element equality, VSS value x against gold g; created: names of shapes the gold creates earlier in the message */
export const elEq = (x, g, created) => x === g || (g === "$new" && (created.has(x) || x.startsWith("$new"))) || (x.startsWith("$new=") && x.slice(5) === g) || (x === "$new" && g === "$new");
export const valEq = (v, g, created) => { if (v == null) return false; const a = parts(v), b = parts(g); return a.length === b.length && a.every((x, i) => elEq(x, b[i], created)); };
/** can the gold element be read from the unit? (its words, or its token, are in the unit) */
function readableEl(k, g, src, tokens, created) {
  const W = " " + words(src) + " ", T = new Set(tokens), has = (p) => { const q = words(p.replace(/_/g, " ")); return q && (W.includes(" " + q + " ") || W.includes(" " + q + "s ")); };
  if (g === "$new") return [...created].some((n) => has(n));
  if (g.startsWith("mention(")) return g.slice(8, -1).split(",").map((p) => p.split("=")[1]).filter((x) => x && x !== "all").some((x) => has(x) || T.has(x));
  if (ENTITY_KEYS.includes(k) || k === "name") return has(g) || T.has("n_" + g.replace(/[^a-z0-9]+/g, "_"));
  const tok = (REL[g] || REGION[g] || VALTOK[g] || g).toLowerCase();
  return T.has(tok) || T.has(g) || T.has("not_" + g) || T.has("t_" + g.replace(/[^a-z0-9]+/g, "_")) || has(g) || (REL[g] && has(REL[g])) || (REGION[g] && has(REGION[g]));
}
/** the VSS layer's class of one gold key: {cls: "1".."4", sub} (class 5 = rawC keys absent from the gold, counted apart) */
export function classifyKey(k, g, v, src, tokens, created) {
  const gEls = parts(g), readAll = gEls.every((x) => readableEl(k, x, src, tokens, created));
  if (v != null && valEq(v, g, created)) return { cls: "1", sub: "right" };
  if (v == null) return readAll ? { cls: "4", sub: "4a empty" } : { cls: "2", sub: "2 empty" };
  const vEls = parts(v), refs = vEls.filter(isRefStr), vals = vEls.filter((x) => !isRefStr(x));
  if (!vals.length) {   // only references
    const kind = refs.some((x) => x.startsWith("@")) ? "pronoun" : "mention";
    if (g.startsWith("mention(") && kind === "mention" && !readAll) return { cls: "2", sub: "2 mention" };
    if (g.startsWith("mention(") && kind === "mention") return { cls: "3", sub: "3 other description" };
    return readAll ? { cls: "4", sub: "4b " + kind } : { cls: "2", sub: "2 " + kind };
  }
  if (gEls.length > 1 && vals.every((x) => gEls.some((y) => elEq(x, y, created))) && vals.length < gEls.length) {   // a partial list, every value right
    const missing = gEls.filter((y) => !vals.some((x) => elEq(x, y, created)));
    return missing.every((y) => readableEl(k, y, src, tokens, created)) ? { cls: "4", sub: "4c partial list" } : { cls: "2", sub: "2 partial list" };
  }
  if (ENTITY_KEYS.includes(k)) return { cls: "3", sub: vals.some((x) => gEls.some((y) => elEq(x, y, created))) ? "3 entity: some right, some wrong" : "3 entity: wrong shape" };
  return { cls: "3", sub: "3 value: " + k };
}
/** the gold names created before gold request j */
export const createdBefore = (m, j) => new Set(m.gold.filter((o) => o.s < m.gold[j].s && o.args.action === "create" && o.args.name != null && !o.args.count).map((o) => String(o.args.name).toLowerCase()));

// ---------------------------------------------------------------- pairing
export function pairOrder(prods, gold) {   // llm_score.mjs align(), copied
  const n = prods.length, m = gold.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = prods[i].act === gold[j].act ? 1 + L[i + 1][j + 1] : Math.max(L[i + 1][j], L[i][j + 1]);
  const pairs = []; let i = 0, j = 0;
  while (i < n && j < m) { if (prods[i].act === gold[j].act) { pairs.push([i, j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  return pairs;
}
function hungarianMax(W) {   // square matrix, maximum total weight; returns col of each row
  const n = W.length, INF = 1e18, u = new Float64Array(n + 1), v = new Float64Array(n + 1), p = new Int32Array(n + 1), way = new Int32Array(n + 1);
  for (let i = 1; i <= n; i++) {
    p[0] = i; let j0 = 0; const minv = new Float64Array(n + 1).fill(INF), used = new Uint8Array(n + 1);
    do {
      used[j0] = 1; const i0 = p[j0]; let delta = INF, j1 = 0;
      for (let j = 1; j <= n; j++) if (!used[j]) { const cur = -W[i0 - 1][j - 1] - u[i0] - v[j]; if (cur < minv[j]) { minv[j] = cur; way[j] = j0; } if (minv[j] < delta) { delta = minv[j]; j1 = j; } }
      for (let j = 0; j <= n; j++) if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta;
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const col = new Int32Array(n); for (let j = 1; j <= n; j++) col[p[j] - 1] = j - 1; return col;
}
const alnum = /[A-Za-z0-9]/;
const overlap = (text, a0, a1, b0, b1) => { let k = 0; for (let i = Math.max(a0, b0); i < Math.min(a1, b1); i++) if (alnum.test(text[i])) k++; return k; };
/** VSS-layer right keys of produced i for gold j */
export function rightKeys(m, p, j) {
  const g = m.gold[j], cr = createdBefore(m, j); let k = 0;
  for (const [key, gv] of Object.entries(g.want)) { if (key === "action" || key === "ask") continue; if (valEq(p.rawC[key], gv, cr)) k++; }
  return k;
}
export function pairValue(m) {
  const pairs = [];
  for (const act of new Set(m.prods.map((p) => p.act))) {
    const P = m.prods.map((p, i) => [p, i]).filter(([p]) => p.act === act), G = m.gold.map((g, j) => [g, j]).filter(([g]) => g.act === act);
    if (!G.length) continue;
    const n = Math.max(P.length, G.length), W = Array.from({ length: n }, () => new Array(n).fill(0));
    P.forEach(([p, i], a) => G.forEach(([g, j], b) => { const u = m.units[p.u]; W[a][b] = 1e6 + 1000 * rightKeys(m, p, j) + overlap(m.text, u.c0, u.c1, g.s, g.e); }));
    const col = hungarianMax(W);
    P.forEach(([, i], a) => { const b = col[a]; if (b < G.length) pairs.push([i, G[b][1]]); });
  }
  return pairs.sort((x, y) => x[0] - y[0]);
}

// ---------------------------------------------------------------- gold label of a context candidate (vss-context.js Context)
/** does candidate cand (entity keys) equal the gold value gv (canonical string)? set equality for several shapes */
export function candMatches(ctx, cand, gv, created) {
  if (cand.kind === "null" || gv == null) return false;
  const g = parts(gv), elOk = (key, x) => { const e = ctx.ents.get(key); if (!e) return false; return (e.created && x === "$new") || (e.name != null && String(e.name).toLowerCase() === x) || key === x || (x === "$new" && created.has(key)); };
  if (cand.keys.length !== g.length) return false;
  if (g.length === 1) return elOk(cand.keys[0], g[0]);
  const used = new Set();
  return g.every((x) => { const k = cand.keys.find((y) => !used.has(y) && elOk(y, x)); if (k == null) return false; used.add(k); return true; });
}
