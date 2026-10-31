// ablate.mjs: read-time kind ablation on a trained VSS model. Every gold request is read alone from its annotated span exactly as
// training/sketch/error_analysis.mjs does (same normalization, reading, adapter, canon and "right" rule; copied, not imported, read-only).
// A kind map {word: kind} is applied ONLY at read time: the word's catalog entry and lexicon entry get the new kind ("unknown" = no kind
// of its own: the route book's `unknown` rows, and the word is no longer a candidate of a role whose kinds held its old kind).
// Only the messages whose baseline tokens contain a changed word are re-read (the others cannot change: same tokens, same readings,
// same created names, by induction over the message's requests).
//
// MODEL=fix_p80_s0 node ablate.mjs <out.json> <name>=<file.jsonl> [<name>=<file.jsonl> ...] [--single] [--maps maps.json]
//   --single: one run per own-kind word (word -> unknown)
//   --maps: a JSON object {label: {word: kind}}: one run per label (several words changed together)
//   --dump <file>: one JSON line per request of the baseline reading (set, id, wi, ok, status, tokens)
import { readFileSync, writeFileSync } from "node:fs";
const R = "/home/claude/diagram-vss-demo/";
const { load } = await import(R + "docs/js/vss.js");
const FRONT = await import(R + "docs/js/front.js");
const { readingFromWires, toNodes } = await import(R + "docs/js/vss-adapter.js");
const { canon, canonWant } = await import(R + "docs/js/bench-canon.js");
const dir = new URL(`${R}docs/model/${process.env.MODEL}/`, "file:///");
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true }), F = JSON.parse(await readFile("front.json"));
const verbs = new Map(); for (const e of vss.model.legend.events) for (const v of e.verbs) verbs.set(v, e.id);
const rd = vss.reader, rb = vss.rb;
const args = process.argv.slice(2), out = args[0];
const sets = args.slice(1).filter((a) => a.includes("=") && !a.startsWith("--")).map((a) => { const [n, f] = a.split("="); return [n, readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))]; });
const single = args.includes("--single"), mapsArg = args.includes("--maps") ? JSON.parse(readFileSync(args[args.indexOf("--maps") + 1], "utf8")) : null;
const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;

function readMsg(m) {
  const ctx = { names: m.names || [], last: [], refs: new Map() }, seq = { s: 0, m: 0 }, created = [], res = [];
  m.wires.forEach((w, wi) => {
    if (!w.span || !m.text.includes(w.span)) return;
    const names = ctx.names.concat(created);
    const { tokens, info } = FRONT.normalize(w.span, names, F);
    const r = vss.read(tokens.join(" "));
    const verb = tokens.find((t) => verbs.has(t)) || null;
    const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb, tokens);
    const o = reading ? toNodes(reading, info, ctx, seq) : { nodes: [] };
    const main = o.nodes.filter((x) => x.type !== "mention").pop();
    const got = main ? canon(main, o.nodes) : {}, want = canonWant(w.type, w.args);
    const bad = Object.entries(want).filter(([k, v]) => (got[k] ?? "∅") !== v);
    const ok = !!(main && !bad.length && actOf(main.type, main.args) === actOf(w.type, w.args));
    res.push({ wi, ok, status: r.status, tokens, ev: r.frame ? r.frame.event : null, roles: r.frame && r.frame.roles ? Object.keys(r.frame.roles).sort() : [] });
    if (main && main.args.action === "create" && main.args.name) created.push(String(main.args.name));
    if (main && main.args.target != null && !Array.isArray(main.args.target)) ctx.last = [main.args.target];
  });
  return res;
}

// the kind map, applied to the reader's catalog and lexicon; returns the undo
function apply(map) {
  const undo = [];
  for (const [w, k] of Object.entries(map)) {
    if (k !== "unknown" && !rb.catId.has(k)) throw new Error(`kind ${k} not in the route book`);
    const e = rd.words.get(w); undo.push([w, e, rd.legend.lexicon.has(w) ? rd.legend.lexicon.get(w) : undefined]);
    rd.words.set(w, Object.assign({}, e || {}, { kind: k })); rd.legend.lexicon.set(w, k);
  }
  rd._cands.clear();
  return () => { for (const [w, e, l] of undo) { if (e) rd.words.set(w, e); else rd.words.delete(w); if (l === undefined) rd.legend.lexicon.delete(w); else rd.legend.lexicon.set(w, l); } rd._cands.clear(); };
}

const t0 = Date.now(), base = {}, index = {};          // index: lowercased token -> [set, message index]
for (const [n, ms] of sets) {
  base[n] = ms.map(readMsg);
  base[n].forEach((rs, i) => { for (const r of rs) for (const t of r.tokens) { const k = t.toLowerCase(); (index[k] = index[k] || new Set()).add(`${n}\t${i}`); } });
}
if (args.includes("--dump")) writeFileSync(args[args.indexOf("--dump") + 1], sets.map(([n, ms]) => base[n].map((rs, i) => rs.map((q) => JSON.stringify({ set: n, id: ms[i].id, wi: q.wi, ok: q.ok, status: q.status, tokens: q.tokens })).join("\n")).filter(Boolean).join("\n")).join("\n") + "\n");
const summ = (n) => { const rs = base[n].flat(); return { requests: rs.length, right: rs.filter((r) => r.ok).length }; };
const result = { model: process.env.MODEL, baseline: Object.fromEntries(sets.map(([n]) => [n, summ(n)])), seconds_baseline: (Date.now() - t0) / 1000, runs: {} };
console.error(JSON.stringify(result.baseline), result.seconds_baseline, "s");

function run(label, map) {
  const ws = Object.keys(map).map((w) => w.toLowerCase()), aff = new Set(ws.flatMap((w) => [...(index[w] || [])]));
  const undo = apply(map), r = {};
  for (const [n] of sets) r[n] = { req_with: 0, tok: 0, rw: 0, wr: 0, right_after: 0, ex_rw: [], ex_wr: [] };
  for (const [n] of sets) for (const rs of base[n]) for (const q of rs) { const c = q.tokens.filter((t) => ws.includes(t.toLowerCase())).length; if (c) { r[n].req_with++; r[n].tok += c; } }
  for (const key of aff) {
    const [n, i] = key.split("\t"), m = sets.find(([x]) => x === n)[1][+i], after = readMsg(m), before = base[n][+i];
    after.forEach((a, j) => {
      const b = before[j];
      if (b.ok && !a.ok) {
        r[n].rw++; r[n].ex_rw.length < 3 && r[n].ex_rw.push(a.tokens.join(" "));
        // why (--single runs and maps alike): the first difference between the two readings
        const why = a.status !== b.status && (a.status === "no-sense" || a.status === "unknown-event") ? `status ${a.status}` : a.ev !== b.ev ? "other event"
          : b.roles.some((x) => !a.roles.includes(x)) ? "a role read before is now absent" : a.roles.some((x) => !b.roles.includes(x)) ? "an extra role" : "same roles, other filler";
        r[n].why = r[n].why || {}; r[n].why[why] = (r[n].why[why] || 0) + 1;
      }
      if (!b.ok && a.ok) { r[n].wr++; r[n].ex_wr.length < 3 && r[n].ex_wr.push(a.tokens.join(" ")); }
    });
  }
  for (const [n] of sets) r[n].right_after = result.baseline[n].right - r[n].rw + r[n].wr;
  undo(); result.runs[label] = { map, ...r };
}

if (single) {
  const own = rb.cats.filter((c) => c !== "unknown" && c === c.toLowerCase() && rd.words.has(c) && rd.words.get(c).kind === c);
  result.own_kinds = own;
  own.forEach((w, i) => { run(w, { [w]: "unknown" }); if (i % 10 === 0) console.error(i, w, (Date.now() - t0) / 1000, "s"); });
}
if (mapsArg) for (const [label, map] of Object.entries(mapsArg)) { run(label, map); console.error(label, JSON.stringify(Object.fromEntries(sets.map(([n]) => [n, [result.runs[label][n].rw, result.runs[label][n].wr]])))); }
result.seconds_total = (Date.now() - t0) / 1000;
writeFileSync(out, JSON.stringify(result, null, 1));
