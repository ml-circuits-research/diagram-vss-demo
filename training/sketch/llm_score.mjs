// llm_score.mjs: Rules vs VSS on the LLM-written messages (llm_bench/<model>/batch_*.jsonl, gold written by the LLM, SPEC.md).
// Per message: the readers' non-mention wires are aligned to the gold wires in order (longest common subsequence on type + action/ask),
// then an aligned wire counts as correct when every gold key matches (bench-canon.js canonical form).
// Reports: messages fully right, wires right (of gold wires), act right (type + action/ask), extra wires, and per action/ask.
// node llm_score.mjs <dir> [<dir> ...] [--dump out.json] [-v]
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { load } from "../../docs/js/vss.js";
import { compile, normalize } from "../../docs/js/snorm.js";
import * as FRONT from "../../docs/js/front.js";
import { vssCentres } from "../../docs/js/vss-centers.js";
import { existsSync } from "node:fs";
import { readingFromWires, toNodes } from "../../docs/js/vss-adapter.js";
import { canon } from "../../docs/js/bench-canon.js";
const require = createRequire(import.meta.url);
const K = require("../../docs/js/logic.js");
const argv = process.argv.slice(2), verbose = argv.includes("-v"), dumpAt = argv.indexOf("--dump");
const dirs = argv.filter((a, i) => !a.startsWith("-") && (dumpAt < 0 || i !== dumpAt + 1));
const dir = new URL(`../../docs/model/${process.env.MODEL || "sketch"}/`, import.meta.url);
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true });
const F = existsSync(new URL("front.json", dir)) ? JSON.parse(await readFile("front.json")) : null;   // the learned front end (world real)
const C = F ? null : compile(JSON.parse(await readFile("normalize.json")));
const lex = new Set(Object.keys(vss.model.lexicon || {})), verbEvent = new Map();
for (const e of vss.model.legend.events) for (const v of e.verbs) verbEvent.set(v, e.id);
const sys = K.createSystem();

function vssFormalize(text, ctx) {
  // SEG=gold: the annotated spans (held-out TRAINING messages only: the test sets have none): the reading quality without the cut
  const segs = process.env.SEG === "gold" && ctx.spans ? ctx.spans.map((src) => ({ src }))
    : process.env.SEG === "centres" && F ? vssCentres(text, ctx.names, F, vss, { confident: process.env.CONFIDENT === "1" }).map((src) => ({ src }))      // the VSS reader's own cut
    : F ? FRONT.segment(text, ctx.names, F).map((src) => ({ src })) : sys.formalize(text, ctx).segments;
  const seq = { s: 0, m: 0 }, c = { names: ctx.names, last: [], refs: new Map() }, nodes = [];
  for (const seg of segs) {
    const nm = c.names.concat([...c.refs.keys()]);
    const { tokens, info: ni } = F ? FRONT.normalize(seg.src, nm, F) : normalize(C, lex, seg.src, nm), r = vss.read(tokens.join(" "));
    const verb = tokens.find((t) => verbEvent.has(t)) || null;
    const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb);
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
const low = (v) => Array.isArray(v) ? v.map((x) => String(x).toLowerCase()).join(",") : String(v).toLowerCase();
const actOf = (type, args) => `${type}:${args.action || args.ask || ""}`;

function align(pred, gold) {          // LCS on act labels
  const n = pred.length, m = gold.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = pred[i].act === gold[j].act ? 1 + L[i + 1][j + 1] : Math.max(L[i + 1][j], L[i][j + 1]);
  const pairs = []; let i = 0, j = 0;
  while (i < n && j < m) { if (pred[i].act === gold[j].act) { pairs.push([i, j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  return pairs;
}
function scoreMessage(nodes, row) {
  const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
  const gold = row.wires.map((w) => ({ act: actOf(w.type, w.args), want: Object.fromEntries(Object.entries(w.args).map(([k, v]) => [k, low(v)])) }));
  const pairs = align(mains, gold); let right = 0; const bad = [];
  for (const [i, j] of pairs) {
    const miss = Object.entries(gold[j].want).filter(([k, v]) => (mains[i].got[k] ?? "∅") !== v).map(([k, v]) => `${k}:${mains[i].got[k] ?? "∅"}≠${v}`);
    if (!miss.length) right++; else bad.push(`${gold[j].act} ${miss.join(" ")}`);
  }
  const matched = new Set(pairs.map((p) => p[1])), usedP = new Set(pairs.map((p) => p[0]));
  mains.forEach((m, i) => { if (!usedP.has(i)) bad.push(`EXTRA ${m.act} ${JSON.stringify(m.got)} <- "${m.n.src || ''}"`); });
  gold.forEach((g, j) => { if (!matched.has(j)) bad.push(`missing ${g.act}`); });
  return { right, wrongAligned: pairs.length - right, missed: gold.length - pairs.length, acts: pairs.length, gold: gold.length, extra: mains.length - pairs.length, exact: right === gold.length && mains.length === gold.length, bad, perAct: gold.map((g, j) => [g.act, pairs.some(([i, jj]) => jj === j && !bad.some((b) => false))]) };
}

const report = {}, ALL = { n: 0, rules: { exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0 }, vss: { exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0 } };
for (const d of dirs) {
  const files = readdirSync(d).filter((f) => f.endsWith(".jsonl")).sort();
  const rows = files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)));
  const tot = { rules: { exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, byAct: {} }, vss: { exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, byAct: {} } }, dump = [];
  for (const r of rows) {
    const ctx = { names: r.names || [], last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null };
    const out = { rules: sys.formalize(r.text, ctx).nodes, vss: vssFormalize(r.text, ctx) }, rec = { id: r.id, text: r.text };
    for (const f of ["rules", "vss"]) {
      const s = scoreMessage(out[f], r), T = tot[f];
      T.exact += s.exact; T.right += s.right; T.wrongAligned += s.wrongAligned; T.missed += s.missed; T.acts += s.acts; T.extra += s.extra; T.gold += s.gold; rec[f] = s.bad;
      // per gold act: right?
      const mains = out[f].filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, out[f]) }));
      const gold = r.wires.map((w) => ({ act: actOf(w.type, w.args), want: Object.fromEntries(Object.entries(w.args).map(([k, v]) => [k, low(v)])) }));
      const pairs = align(mains, gold), ok = new Set(pairs.filter(([i, j]) => Object.entries(gold[j].want).every(([k, v]) => (mains[i].got[k] ?? "∅") === v)).map((p) => p[1]));
      gold.forEach((g, j) => { const b = T.byAct[g.act] = T.byAct[g.act] || [0, 0]; b[1]++; if (ok.has(j)) b[0]++; });
    }
    dump.push(rec);
  }
  const n = rows.length, line = (f) => { const T = tot[f]; return `${f.padEnd(5)} messages fully right ${(T.exact / n * 100).toFixed(1)}% · wires right ${(T.right / T.gold * 100).toFixed(1)}% (${T.right}/${T.gold}) · act found ${(T.acts / T.gold * 100).toFixed(1)}% · extra wires ${T.extra}`; };
  console.log(`\n${d}: ${n} messages, ${tot.rules.gold} gold wires`); console.log("  " + line("rules")); console.log("  " + line("vss"));
  const acts = Object.keys(tot.rules.byAct).sort((a, b) => tot.rules.byAct[b][1] - tot.rules.byAct[a][1]);
  console.log("  per act (rules · vss · n): " + acts.map((a) => `${a.split(":").pop() || a} ${tot.rules.byAct[a][0]}·${(tot.vss.byAct[a] || [0])[0]}·${tot.rules.byAct[a][1]}`).join(", "));
  report[d] = { n, tot }; ALL.n += n; for (const f of ["rules", "vss"]) for (const k of ["exact", "right", "wrongAligned", "missed", "acts", "extra", "gold"]) ALL[f][k] += tot[f][k]; if (verbose) dump.slice(0, 12).forEach((x) => console.log(`  ${x.id} ${x.text}\n     rules: ${x.rules.join(" | ") || "ok"}\n     vss:   ${x.vss.join(" | ") || "ok"}`));
  if (dumpAt >= 0) writeFileSync(argv[dumpAt + 1].replace(/(\.json)?$/, `_${d.split("/").filter(Boolean).pop()}.json`), JSON.stringify(dump, null, 1));
}
if (dirs.length > 1) { const n = ALL.n, pc = (x, T) => (x / T.gold * 100).toFixed(1) + "%", line = (f) => { const T = ALL[f]; return `${f.padEnd(5)} correct ${pc(T.right, T)} · not done ${pc(T.missed, T)} · done wrong ${pc(T.wrongAligned, T)} · plus ${T.extra} extra wires not asked for (${pc(T.extra, T)} of the gold count) · messages fully right ${(T.exact / n * 100).toFixed(1)}%`; };
  console.log(`\nALL (${dirs.join(" + ")}): ${n} messages, ${ALL.rules.gold} gold wires`); console.log("  " + line("rules")); console.log("  " + line("vss")); }
