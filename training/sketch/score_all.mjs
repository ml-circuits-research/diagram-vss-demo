// score_all.mjs: Rules and VSS on the benchmark sets in node, with the same scoring and the same pipeline as the browser
// (rules segmenter -> snorm -> VSS reader -> adapter). node score_all.mjs [--limit 300] [-v]
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { load } from "../../docs/js/vss.js";
import { compile, normalize } from "../../docs/js/snorm.js";
import { readingFromWires, toNodes } from "../../docs/js/vss-adapter.js";
import { score } from "../../docs/js/bench-canon.js";
const require = createRequire(import.meta.url);
const K = require("../../docs/js/logic.js");
const args = process.argv.slice(2), limit = +(args[args.indexOf("--limit") + 1] || 300), verbose = args.includes("-v");
const dir = new URL("../../docs/model/sketch/", import.meta.url);
const bytes = {};
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); bytes[n] = b.length; return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const t0 = performance.now();
const vss = await load(null, { readFile, sentenceCandidates: true });
const C = compile(JSON.parse(await readFile("normalize.json")));
const loadMs = performance.now() - t0;
const lex = new Set(Object.keys(vss.model.lexicon || {})), verbEvent = new Map();
for (const e of vss.model.legend.events) for (const v of e.verbs) verbEvent.set(v, e.id);
const sys = K.createSystem();

function vssFormalize(text, ctx) {
  const cut = sys.formalize(text, ctx), seq = { s: 0, m: 0 }, c = { names: ctx.names, last: [], refs: new Map() }, nodes = [], info = [];
  for (const seg of cut.segments) {
    const { tokens, info: ni } = normalize(C, lex, seg.src), r = vss.read(tokens.join(" "));
    const verb = tokens.find((t) => verbEvent.has(t)) || null;
    const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb);
    const out = reading ? toNodes(reading, ni, c, seq) : { nodes: [] };
    nodes.push(...out.nodes); info.push({ norm: tokens.join(" "), status: r.status, sop: r.sop });
    const main = out.nodes[out.nodes.length - 1];
    if (main && main.args && main.args.action === "create") { if (main.args.name && !main.args.count) c.refs.set(String(main.args.name).toLowerCase(), { ref: main.id }); c.last = [{ ref: main.id }]; }
  }
  return { nodes, info };
}

const times = { rules: [], vss: [] }, total = { rules: [0, 0], vss: [0, 0] };
for (const id of ["hand", "blind", "broad", "seen", "new_identities", "heldout_formulations"]) {
  const rows = JSON.parse(readFileSync(new URL(`../../docs/bench/${id}.json`, import.meta.url), "utf8")).slice(0, limit);
  const ok = { rules: 0, vss: 0 }, miss = [], cats = {};
  for (const r of rows) {
    const ctx = { names: r.names, last: [] };
    let t = performance.now(); const rn = sys.formalize(r.text, ctx).nodes; times.rules.push(performance.now() - t);
    t = performance.now(); const v = vssFormalize(r.text, ctx); times.vss.push(performance.now() - t);
    const sr = score(rn, r), sv = score(v.nodes, r);
    if (sr.ok) ok.rules++; if (sv.ok) ok.vss++;
    if (r.cat) { const c = r.cat.split(":")[0]; cats[c] = cats[c] || { n: 0, rules: 0, vss: 0 }; cats[c].n++; if (sr.ok) cats[c].rules++; if (sv.ok) cats[c].vss++; }
    if (!sr.ok && verbose && process.argv.includes("--rules")) miss.push(`[rules] ${r.text}  ->  ${Object.entries(sr.per).filter(([, p]) => !p.ok).map(([k, p]) => `${k}:${p.got}≠${p.want}`).join(" ")}`);
    if (!sv.ok) miss.push(`${r.text}\n      norm: ${v.info.map((x) => x.norm + " [" + x.status + "]").join(" | ")}\n      miss: ${Object.entries(sv.per).filter(([, p]) => !p.ok).map(([k, p]) => `${k}:${p.got}≠${p.want}`).join(" ")}`);
  }
  total.rules[0] += ok.rules; total.rules[1] += rows.length; total.vss[0] += ok.vss; total.vss[1] += rows.length;
  console.log(`${id.padEnd(22)} n=${String(rows.length).padStart(3)}  rules ${(ok.rules / rows.length * 100).toFixed(1)}%  vss ${(ok.vss / rows.length * 100).toFixed(1)}%`);
  if (Object.keys(cats).length) console.log("   by category: " + Object.entries(cats).map(([c, x]) => `${c} ${x.rules}/${x.vss}/${x.n}`).join(" · ") + "   (rules/vss/n)");
  if (verbose) miss.slice(0, 40).forEach((m) => console.log("   " + m));
}
const med = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)], p95 = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length * 0.95)];
console.log(`VSS model: ${Object.entries(bytes).map(([k, v]) => `${k} ${(v / 1e6).toFixed(2)} MB`).join(", ")}; load ${loadMs.toFixed(0)} ms; D ${vss.model.config.D}`);
console.log(`ms/message median · p95: rules ${med(times.rules).toFixed(2)} · ${p95(times.rules).toFixed(2)}, vss ${med(times.vss).toFixed(2)} · ${p95(times.vss).toFixed(2)} (node ${process.version})`);
