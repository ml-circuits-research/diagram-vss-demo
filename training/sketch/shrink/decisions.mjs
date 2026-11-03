// decisions.mjs: every decision the composer takes on a set of messages, one line per message, so two model exports can be compared
// request by request (training/sketch/shrink/SHRINK.md). The composer, the scorer context and the pairing are llm_score.mjs's
// (SEG=composer, PAIR=value), imported as a library; the confidence is docs/js/vss-confidence.js with docs/model/confidence/vss.json, as
// the demo's gate.
//   REGISTRY=<registry.json> node training/sketch/shrink/decisions.mjs <out.jsonl> [<dir> ...]
//   no dir: the fixed 1000-message sample (training/sketch/eval/sample1000/*)
// Each line: {id, prod: [[act, canonical args JSON], ...] (the produced requests), conf: [confidence of each produced request],
//   out: [right | wrong | extra of each produced request] (llm_score.mjs pairUp with PAIR=value, copied here: it is not exported),
//   s: {right, wrong, missed, extra, gold} (the per-request score, PAIR=value), g97: the gated tally of the message at the demo's 97% threshold (llm_score.mjs gateTally)}
// The last line: {"_meta": {registry, load_ms, read_ms, messages, rss_mb}}.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
process.env.LLM_SCORE_LIB = "1"; process.env.SEG = "composer"; process.env.PAIR = "value"; process.env.GATE = process.env.GATE || "97";
const REPO = new URL("../../../", import.meta.url).pathname;
const t0 = performance.now();
const L = await import(REPO + "training/sketch/llm_score.mjs");
const loadMs = performance.now() - t0;
const { canon, canonWant } = await import(REPO + "docs/js/bench-canon.js");
const { pairValue } = await import(REPO + "training/sketch/layer_common.mjs");
const actOf = (type, args) => `${type}:${args.action || args.ask || ""}`;
// llm_score.mjs pairUp (PAIR=value), copied unchanged: the produced requests of a message -> [[produced i, gold j], ...]
function pairUp(mains, gold, row) {
  const used = new Set(), G = row.wires.map((w, j) => {
    let s0 = -1;
    if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); }
    return { s: s0, e: s0 < 0 ? -1 : s0 + w.span.length, act: gold[j].act, want: gold[j].want, args: w.args };
  });
  const units = mains.map((m) => { if (m.n.span) return { c0: m.n.span[0], c1: m.n.span[1] }; const k = m.n.src ? row.text.indexOf(m.n.src) : -1; return k < 0 ? { c0: 0, c1: 0 } : { c0: k, c1: k + m.n.src.length }; });
  return pairValue({ text: row.text, gold: G, units, prods: mains.map((m, i) => ({ act: m.act, u: i, rawC: m.got })) });
}
const CONF = await import(REPO + "docs/js/vss-confidence.js");
const CM = JSON.parse(readFileSync(REPO + "docs/model/confidence/vss.json", "utf8"));
const out = process.argv[2]; if (!out) throw new Error("usage: decisions.mjs <out.jsonl> [<dir> ...]");
let dirs = process.argv.slice(3);
if (!dirs.length) { const S = REPO + "training/sketch/eval/sample1000/"; dirs = readdirSync(S).sort().map((d) => S + d); }
const lines = []; let n = 0; const t1 = performance.now();
for (const d of dirs) {
  for (const f of readdirSync(d).filter((f) => f.endsWith(".jsonl")).sort()) {
    for (const l of readFileSync(`${d}/${f}`, "utf8").split("\n")) {
      if (!l.trim()) continue; const r = JSON.parse(l); if (!Array.isArray(r.wires)) continue;
      const ctx = { names: r.names || [], last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null };
      const nodes = L.vssFormalize(r.text, ctx), s = L.scoreMessage(nodes, r);
      const mains = nodes.filter((x) => x.type !== "mention");
      const prod = mains.map((x) => [`${x.type}:${x.args.action || x.args.ask || ""}`, JSON.stringify(canon(x, nodes))]);
      const conf = mains.map((x) => (x.unit && x.unit.signals ? CONF.confidence(CM, x.unit.signals, x.unit.world) : 0));
      const g = L.gateBlank(); L.gateTally(g, nodes, r);
      const M = mains.map((x) => ({ act: actOf(x.type, x.args), got: canon(x, nodes), n: x })), gold = r.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args) }));
      const res = M.map(() => "extra");
      for (const [i, j] of pairUp(M, gold, r)) res[i] = Object.entries(gold[j].want).every(([k, v]) => (M[i].got[k] ?? "∅") === v) ? "right" : "wrong";
      const cnt = (o) => res.filter((x) => x === o).length;
      if (cnt("right") !== s.right || cnt("wrong") !== s.wrongAligned || cnt("extra") !== s.extra) throw new Error(`${r.id}: the copied pairing differs from llm_score.mjs`);
      lines.push(JSON.stringify({ id: r.id, prod, conf, out: res, s: { right: s.right, wrong: s.wrongAligned, missed: s.missed, extra: s.extra, gold: s.gold }, g97: g }));
      n++;
    }
  }
}
lines.push(JSON.stringify({ _meta: { registry: process.env.REGISTRY || "docs/model/micro/registry.json", load_ms: Math.round(loadMs), read_ms: Math.round(performance.now() - t1), messages: n, rss_mb: Math.round(process.memoryUsage().rss / 1e6) } }));
writeFileSync(out, lines.join("\n") + "\n");
console.log(`decisions: ${n} messages -> ${out} (composer load ${(loadMs / 1000).toFixed(1)} s, read ${((performance.now() - t1) / 1000).toFixed(1)} s, rss ${Math.round(process.memoryUsage().rss / 1e6)} MB)`);
