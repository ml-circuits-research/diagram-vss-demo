// fresh2/collect_rules.mjs: the Rules collector of FRESH2_PLAN.md (Rules has no confidence: every produced request is executed).
// Same outcomes as ../precision.mjs `rules` (PAIR=value; checked against llm_score.mjs tally), plus `pa` (act of the produced request) and
// `g` (paired gold index, -1 = extra) and `goldActs` per message, and the "same cut" variant: CUTS=own,vss where "vss" gives the Rules
// reader the units of the VSS cut (default registry, cutUnits "vss"; as cut_bench.mjs, CUT_SHARED.md).
//   [CUTS=own,vss] node training/sketch/fresh2/collect_rules.mjs <out pattern with %CUT%> <set> <dir> [<dir> ...]
import { readFileSync, readdirSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
process.env.LLM_SCORE_LIB = "1"; process.env.SEG ||= "composer"; process.env.PAIR ||= "value";
const L = await import("../llm_score.mjs");
const { canon, canonWant } = await import("../../../docs/js/bench-canon.js");
const { pairValue } = await import("../layer_common.mjs");
const [outPat, set, ...dirs] = process.argv.slice(2);
if (!outPat || !set || !dirs.length || !outPat.includes("%CUT%")) { console.error("usage: collect_rules.mjs <out pattern with %CUT%> <set> <dir>..."); process.exit(2); }
const CUTS = (process.env.CUTS || "own,vss").split(",");
const sys = L.logic.createSystem();
const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
function pairUp(mains, gold, row) {   // as precision.mjs / vss_confidence.mjs
  const used = new Set(), G = row.wires.map((w, j) => {
    let s0 = -1;
    if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); }
    return { s: s0, e: s0 < 0 ? -1 : s0 + w.span.length, act: gold[j].act, want: gold[j].want, args: w.args };
  });
  const units = mains.map((x) => { if (x.n.span) return { c0: x.n.span[0], c1: x.n.span[1] }; const k = x.n.src ? row.text.indexOf(x.n.src) : -1; return k < 0 ? { c0: 0, c1: 0 } : { c0: k, c1: k + x.n.src.length }; });
  return pairValue({ text: row.text, gold: G, units, prods: mains.map((x, i) => ({ act: x.act, u: i, rawC: x.got })) });
}
let cutter = null;
if (CUTS.includes("vss")) {
  const { load } = await import("../../../docs/js/vss.js");
  const { loadComposer, cutUnits } = await import("../../../docs/js/vss-composer.js");
  const MODELS = new URL("../../../docs/model/", import.meta.url), J = (p) => JSON.parse(readFileSync(new URL(p, MODELS), "utf8"));
  const REG = J("micro/registry.json"), cache = new Map();
  const loadModel = async (name) => {
    if (cache.has(name)) return cache.get(name);
    const d = new URL(`${name}/`, MODELS), rf = async (n) => { const b = readFileSync(new URL(n, d)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
    const m = { vss: await load(null, { readFile: rf, sentenceCandidates: true }), F: existsSync(new URL("front.json", d)) ? JSON.parse(await rf("front.json")) : null };
    cache.set(name, m); return m;
  };
  const comp = await loadComposer(REG, J(REG.cutter), loadModel, { context: J(REG.context), eventCutter: J(REG.event_cutter) });
  cutter = (text, names) => cutUnits(text, { names, last: [] }, "vss", { composer: comp });
}
const rows = [], seen = new Set();
for (const d of dirs) {
  const files = readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort();
  for (const r of files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l))).filter((r) => Array.isArray(r.wires) && !seen.has(r.id)).slice(0, process.env.LIMIT ? +process.env.LIMIT : Infinity)) { seen.add(r.id); rows.push(r); }
}
for (const cut of CUTS) {
  const out = outPat.replace("%CUT%", cut); writeFileSync(out, "");
  let G = 0, R = 0, W = 0, E = 0;
  for (const r of rows) {
    const ctx = { names: (r.names || []).slice(), last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null };
    const nodes = cut === "vss" ? sys.formalize(r.text, ctx, { units: await cutter(r.text, ctx.names) }).nodes : sys.formalize(r.text, ctx).nodes;
    const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
    const gold = r.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args) }));
    const res = mains.map(() => "extra"), gi = mains.map(() => -1);
    for (const [i, j] of pairUp(mains, gold, r)) { gi[i] = j; res[i] = Object.entries(gold[j].want).every(([k, v]) => (mains[i].got[k] ?? "∅") === v) ? "right" : "wrong"; }
    const tot = { exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0, byAct: {} };
    L.tally(tot, nodes, r);
    const q = { right: res.filter((x) => x === "right").length, wrong: res.filter((x) => x === "wrong").length, extra: res.filter((x) => x === "extra").length };
    if (q.right !== tot.right || q.wrong !== tot.wrongAligned || q.extra !== tot.extra) throw new Error(`rules outcomes differ from tally on ${r.id}`);
    appendFileSync(out, JSON.stringify({ id: r.id, set, cut, gold: r.wires.length, goldActs: gold.map((g) => g.act), rules: res.map((o, i) => ({ o, pa: mains[i].act, g: gi[i] })) }) + "\n");
    G += r.wires.length; R += q.right; W += q.wrong; E += q.extra;
  }
  console.log(`rules ${set} cut ${cut}: ${rows.length} messages, ${G} gold · right ${(R / G * 100).toFixed(1)} · wrong ${(W / G * 100).toFixed(1)} · extra ${E} (checked against tally)`);
}
