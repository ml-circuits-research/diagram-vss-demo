// llm_score.mjs: Rules vs VSS on the LLM-written messages (llm_bench/<model>/batch_*.jsonl, gold written by the LLM, SPEC.md).
// Per message: the readers' non-mention wires are aligned to the gold wires in order (longest common subsequence on type + action/ask),
// then an aligned wire counts as correct when every gold key matches (bench-canon.js canonical form).
// Reports: messages fully right, wires right (of gold wires), act right (type + action/ask), extra wires, and per action/ask.
// Per message (line "per message"): right (every gold wire right, no extra wire) / honest (some request not done, nothing wrong) /
// wrong (at least one wrong or extra wire).
// SEG=composer: the composer (docs/js/vss-composer.js): the cutter, the registry of micro-worlds, the router, the fallback world.
//   REGISTRY=<file> (default docs/model/micro/registry.json); the fallback is MODEL when set, else the registry's "fallback";
//   CUTTER=<file> (default the registry's "cutter"). Reported in addition: units per world, asked, ignored.
// CUTTER=<file> with SEG=tagger: the units come from that file's `segmenter` (e.g. docs/model/micro/cutter.json) instead of the
//   model's front.json (whose segmenter is empty unless FRONT_TAGGER=1 built it).
// node llm_score.mjs <dir> [<dir> ...] [--dump out.json] [-v]
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { load } from "../../docs/js/vss.js";
import { compile, normalize } from "../../docs/js/snorm.js";
import * as FRONT from "../../docs/js/front.js";
import { vssCentres } from "../../docs/js/vss-centers.js";
import { existsSync } from "node:fs";
import { readingFromWires, toNodes } from "../../docs/js/vss-adapter.js";
import { canon, canonWant } from "../../docs/js/bench-canon.js";
import { loadComposer } from "../../docs/js/vss-composer.js";
const require = createRequire(import.meta.url);
const K = require("../../docs/js/logic.js");
const argv = process.argv.slice(2), verbose = argv.includes("-v"), dumpAt = argv.indexOf("--dump");
const dirs = argv.filter((a, i) => !a.startsWith("-") && (dumpAt < 0 || i !== dumpAt + 1));
const MODELS = new URL("../../docs/model/", import.meta.url), COMPOSER = process.env.SEG === "composer";
const REG = COMPOSER ? JSON.parse(readFileSync(process.env.REGISTRY || new URL("micro/registry.json", MODELS), "utf8")) : null;
const MODEL = COMPOSER ? process.env.MODEL || REG.fallback : process.env.MODEL || "sketch";   // SEG=composer: MODEL names the fallback
const dir = new URL(`${MODEL}/`, MODELS);
const CUT = process.env.CUTTER || (COMPOSER && REG.cutter ? new URL(REG.cutter, MODELS) : null), CUTF = CUT ? JSON.parse(readFileSync(CUT, "utf8")) : null;
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
// EXCL=1 / Q1B=1 (DECODE.md): the decode data learned from the training frames, decode.json in the model folder (tool/sop/decode_stats.py)
const DEC = process.env.EXCL === "1" || process.env.Q1B === "1" ? JSON.parse(readFileSync(new URL("decode.json", dir), "utf8")) : null;
if (process.env.Q1B === "1" && process.env.SEG !== "q1") throw new Error("Q1B=1 is a switch of the q1 cut: use it with SEG=q1");
const vss = await load(null, Object.assign({ readFile, sentenceCandidates: true }, process.env.EXCL === "1" ? { excl: DEC.excl_pairs } : {}));
const F = existsSync(new URL("front.json", dir)) ? JSON.parse(await readFile("front.json")) : null;   // the learned front end (world real)
const C = F ? null : compile(JSON.parse(await readFile("normalize.json")));
const lex = new Set(Object.keys(vss.model.lexicon || {})), verbEvent = new Map();
for (const e of vss.model.legend.events) for (const v of e.verbs) verbEvent.set(v, e.id);
const sys = K.createSystem();
// the context carried from one request to the next in this scorer (names created earlier, `last`); SEG=composer uses the same rule
function scorerUpdate(c, main) {
  if (main && main.args) {
    if (main.args.action === "create") { if (main.args.name && !main.args.count) c.refs.set(String(main.args.name).toLowerCase(), { ref: main.id }); c.last = [{ ref: main.id }]; }
    else if (main.args.target != null && !Array.isArray(main.args.target)) c.last = [main.args.target];
  }
}
let comp = null; const CSTAT = { units: 0, byWorld: {}, ask: 0, ignored: 0, ignoredNoToken: 0, multi: 0 };
if (COMPOSER) {
  const cache = new Map([[MODEL, { vss, F }]]);
  const loadModel = async (name) => {
    if (cache.has(name)) return cache.get(name);
    const d = new URL(`${name}/`, MODELS), rf = async (n) => { const b = readFileSync(new URL(n, d)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
    const m = { vss: await load(null, { readFile: rf, sentenceCandidates: true }), F: existsSync(new URL("front.json", d)) ? JSON.parse(await rf("front.json")) : null };
    cache.set(name, m); return m;
  };
  comp = await loadComposer(REG, CUTF, loadModel, { fallback: MODEL });
  console.log(`composer: cutter ${CUT ? CUT.toString().replace(/^file:\/\//, "") : "-"} · fallback ${MODEL} · worlds ${comp.worlds.map((w) => `${w.id} [${[...w.events]}]`).join(", ") || "none"}`);
}
function composerFormalize(text, ctx) {
  const out = comp.formalize(text, { names: ctx.names, last: [] }, { update: scorerUpdate });
  for (const u of out.units) {
    CSTAT.units++; if (u.tried.length > 1) CSTAT.multi++;
    if (u.zone === "read") CSTAT.byWorld[u.world] = (CSTAT.byWorld[u.world] || 0) + 1;
    else if (u.zone === "ask") CSTAT.ask++;
    else { CSTAT.ignored++; if (u.reason === "no action token") CSTAT.ignoredNoToken++; }
  }
  return out.nodes;
}

// SEG=centres-model: the message is read by a CENTRE model (legend reader.centres; research/attention/port/NOTES.md): one normalization
// of the whole message (front.js normalizeMessage), one reading (vss.readMessage): every accepted centre whose reading is ok / abstain is
// a request, in text order; the model cuts by itself (no annotated span, no hard-centre search). The ignored token spans are counted.
const IGN = { spans: 0, tokens: 0, msgs: 0 };
function vssCentresModel(text, ctx) {
  const { tokens, src, info } = FRONT.normalizeMessage(text, ctx.names, F), r = vss.readMessage(tokens.join(" "));
  const seq = { s: 0, m: 0 }, c = { names: ctx.names, last: [], refs: new Map() }, nodes = [];
  IGN.msgs++; IGN.spans += r.ignored.length; IGN.tokens += r.ignored.reduce((a, [x, y]) => a + y - x, 0);
  for (const k of r.centres) {
    if (!k.accepted || k.status === "unknown-event" || k.status === "no-sense") continue;
    const reading = readingFromWires(k.wires, k.token, k.tokens), out = reading ? toNodes(reading, info, c, seq) : { nodes: [] };
    const srcText = text.slice(Math.min(...k.members.map((i) => src[i][0])), Math.max(...k.members.map((i) => src[i][1])));
    out.nodes.forEach((n) => { if (n.type !== "mention") Object.defineProperty(n, "src", { value: srcText, enumerable: false }); }); nodes.push(...out.nodes);
    const main = out.nodes[out.nodes.length - 1];
    if (main && main.args) {
      if (main.args.action === "create") { if (main.args.name && !main.args.count) c.refs.set(String(main.args.name).toLowerCase(), { ref: main.id }); c.last = [{ ref: main.id }]; }
      else if (main.args.target != null && !Array.isArray(main.args.target)) c.last = [main.args.target];
    }
  }
  return nodes;
}

const SEGQ1 = process.env.SEG === "q1";
function vssFormalize(text, ctx) {
  if (process.env.SEG === "centres-model") return vssCentresModel(text, ctx);
  if (COMPOSER) return composerFormalize(text, ctx);
  // SEG=gold: the annotated spans (held-out TRAINING messages only: the test sets have none): the reading quality without the cut
  const segs = process.env.SEG === "gold" && ctx.spans ? ctx.spans.map((src) => ({ src }))
    : process.env.SEG === "tagger" && F ? FRONT.segment(text, ctx.names, CUTF || F).map((src) => ({ src }))        // the BIO cutter (CUTTER=<file>, else the model's front.json)
    : SEGQ1 && F ? vssCentres(text, ctx.names, F, vss, Object.assign({ cut: "q1", confident: process.env.CONFIDENT === "1" }, process.env.Q1B === "1" ? { roleless: DEC.roleless_ok } : {})).map((src) => ({ src }))   // SEG=q1: the q1 cut (diagnosis_cut/CUT.md)
    : F ? vssCentres(text, ctx.names, F, vss, { confident: process.env.CONFIDENT === "1" }).map((src) => ({ src }))   // default: the VSS reader's own cut
    : sys.formalize(text, ctx).segments;
  const seq = { s: 0, m: 0 }, c = { names: ctx.names, last: [], refs: new Map() }, nodes = [];
  for (const seg of segs) {
    const nm = c.names.concat([...c.refs.keys()]);
    const { tokens, info: ni } = F ? FRONT.normalize(seg.src, nm, F) : normalize(C, lex, seg.src, nm), r = vss.read(tokens.join(" "));
    const verb = tokens.find((t) => verbEvent.has(t)) || null;
    const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb, tokens);
    const out = reading ? toNodes(reading, ni, c, seq) : { nodes: [] };
    out.nodes.forEach((n) => { if (n.type !== "mention") Object.defineProperty(n, "src", { value: seg.src, enumerable: false }); }); nodes.push(...out.nodes);
    scorerUpdate(c, out.nodes[out.nodes.length - 1]);
  }
  return nodes;
}
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
  const gold = row.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args) }));
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

const report = {}, ALL = { n: 0, rules: { exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0 }, vss: { exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0 } };
// one message's outcome: right (all gold wires right, no extra) / wrong (a wrong or an extra wire) / honest (the rest: requests not done, nothing wrong)
const outcome = (s) => (s.exact ? "mRight" : s.wrongAligned > 0 || s.extra > 0 ? "mWrong" : "mHonest");
const msgLine = (f, T, n) => `${f.padEnd(5)} per message: right ${(T.mRight / n * 100).toFixed(1)}% (${T.mRight}) · honest ${(T.mHonest / n * 100).toFixed(1)}% (${T.mHonest}) · wrong ${(T.mWrong / n * 100).toFixed(1)}% (${T.mWrong})`;
for (const d of dirs) {
  const files = readdirSync(d).filter((f) => f.endsWith(".jsonl")).sort();
  const rows = files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)));
  const tot = { rules: { exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0, byAct: {} }, vss: { exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0, byAct: {} } }, dump = [];
  for (const r of rows) {
    const ctx = { names: r.names || [], last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null };
    const out = { rules: sys.formalize(r.text, ctx).nodes, vss: vssFormalize(r.text, ctx) }, rec = { id: r.id, text: r.text };
    for (const f of ["rules", "vss"]) {
      const s = scoreMessage(out[f], r), T = tot[f];
      T.exact += s.exact; T.right += s.right; T.wrongAligned += s.wrongAligned; T.missed += s.missed; T.acts += s.acts; T.extra += s.extra; T.gold += s.gold; T[outcome(s)]++; rec[f] = s.bad;
      // per gold act: right?
      const mains = out[f].filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, out[f]) }));
      const gold = r.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args) }));
      const pairs = align(mains, gold), ok = new Set(pairs.filter(([i, j]) => Object.entries(gold[j].want).every(([k, v]) => (mains[i].got[k] ?? "∅") === v)).map((p) => p[1]));
      gold.forEach((g, j) => { const b = T.byAct[g.act] = T.byAct[g.act] || [0, 0]; b[1]++; if (ok.has(j)) b[0]++; });
    }
    dump.push(rec);
  }
  const n = rows.length, line = (f) => { const T = tot[f]; return `${f.padEnd(5)} messages fully right ${(T.exact / n * 100).toFixed(1)}% · wires right ${(T.right / T.gold * 100).toFixed(1)}% (${T.right}/${T.gold}) · act found ${(T.acts / T.gold * 100).toFixed(1)}% · extra wires ${T.extra}`; };
  console.log(`\n${d}: ${n} messages, ${tot.rules.gold} gold wires`); console.log("  " + line("rules")); console.log("  " + line("vss"));
  console.log("  " + msgLine("rules", tot.rules, n)); console.log("  " + msgLine("vss", tot.vss, n));
  const acts = Object.keys(tot.rules.byAct).sort((a, b) => tot.rules.byAct[b][1] - tot.rules.byAct[a][1]);
  console.log("  per act (rules · vss · n): " + acts.map((a) => `${a.split(":").pop() || a} ${tot.rules.byAct[a][0]}·${(tot.vss.byAct[a] || [0])[0]}·${tot.rules.byAct[a][1]}`).join(", "));
  report[d] = { n, tot }; ALL.n += n; for (const f of ["rules", "vss"]) for (const k of ["exact", "right", "wrongAligned", "missed", "acts", "extra", "gold", "mRight", "mHonest", "mWrong"]) ALL[f][k] += tot[f][k]; if (verbose) dump.slice(0, 12).forEach((x) => console.log(`  ${x.id} ${x.text}\n     rules: ${x.rules.join(" | ") || "ok"}\n     vss:   ${x.vss.join(" | ") || "ok"}`));
  if (dumpAt >= 0) writeFileSync(argv[dumpAt + 1].replace(/(\.json)?$/, `_${d.split("/").filter(Boolean).pop()}.json`), JSON.stringify(dump, null, 1));
}
if (process.env.SEG === "centres-model") console.log(`\ncentres-model: ignored text (tokens taken by no accepted centre read ok / abstain): ${IGN.spans} spans, ${IGN.tokens} tokens in ${IGN.msgs} messages`);
if (dirs.length > 1) { const n = ALL.n, pc = (x, T) => (x / T.gold * 100).toFixed(1) + "%", line = (f) => { const T = ALL[f]; return `${f.padEnd(5)} correct ${pc(T.right, T)} · not done ${pc(T.missed, T)} · done wrong ${pc(T.wrongAligned, T)} · plus ${T.extra} extra wires not asked for (${pc(T.extra, T)} of the gold count) · messages fully right ${(T.exact / n * 100).toFixed(1)}%`; };
  console.log(`\nALL (${dirs.join(" + ")}): ${n} messages, ${ALL.rules.gold} gold wires`); console.log("  " + line("rules")); console.log("  " + line("vss"));
  console.log("  " + msgLine("rules", ALL.rules, n)); console.log("  " + msgLine("vss", ALL.vss, n)); }
if (COMPOSER) console.log(`\ncomposer units: ${CSTAT.units} (read by several candidate worlds: ${CSTAT.multi}) · read per world: ${Object.entries(CSTAT.byWorld).map(([w, k]) => `${w} ${k}`).join(", ") || "none"} · asked ${CSTAT.ask} · ignored ${CSTAT.ignored} (no action token ${CSTAT.ignoredNoToken})`);
