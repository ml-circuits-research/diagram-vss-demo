// feedback/validate_needs.mjs: checks the needs of data_needs.mjs against the gold of the SAME messages (DATA_NEEDS.md). The gold is used
// only here, to check the tool; data_needs.mjs never reads it.
//   node training/sketch/feedback/validate_needs.mjs <needs.json> <records.jsonl> [--causes composer_errors.json] [--md out.md] <dir> [...]
//   needs.json     data_needs.mjs output (its instances: message id + character span of the unit or the text piece flagged)
//   records.jsonl  fresh2/collect_vss.mjs output for the same messages (the default composer WITH the canvas names, as evaluated): every
//                  produced request with its outcome and the index of the gold request it was paired with (PAIR=value, llm_score.mjs)
//   --causes       composer_errors.mjs --json output for the same messages: the first root cause of every gold request not right
//   --only         keep only the needs of these causes (comma separated), ranks renumbered
//   dirs           the annotated folders (only the ids of the records are read: their gold request spans)
// A gold request is right / done wrong / not done (no produced request paired to it). It is COVERED by the top N needs when an instance
// of one of them overlaps its gold span by at least one character. Reported: the share of the wrong + not-done requests covered at
// N = 10, 20, 50 and all, and, to show that coverage is not bought by flagging everything, the share of the RIGHT requests the same
// needs touch (and the ratio of the two). Per need (top 30): the requests it touches and how many of them are not right.
import { readFileSync, writeFileSync } from "node:fs";
import { readRows, goldSpans } from "../layer_common.mjs";

const argv = process.argv.slice(2), opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const valued = new Set(["--causes", "--md", "--only"]), pos = argv.filter((a, i) => !a.startsWith("--") && !valued.has(argv[i - 1]));
const [needsFile, recFile, ...dirs] = pos;
const N = JSON.parse(readFileSync(needsFile, "utf8"));
// --only c1,c2: keep only the needs of these causes (ranks renumbered in the same order), to measure a subset of causes
if (opt("--only")) { const keep = new Set(opt("--only").split(",")); N.needs = N.needs.filter((n) => keep.has(n.cause)); N.needs.forEach((n, i) => { n.rank = i + 1; }); }
const recs = readFileSync(recFile, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const ids = new Set(recs.map((r) => r.id));
const rows = new Map(); for (const d of dirs) for (const r of readRows(d)) if (ids.has(r.id) && Array.isArray(r.wires) && !rows.has(r.id)) rows.set(r.id, r);
const causes = opt("--causes") ? JSON.parse(readFileSync(opt("--causes"), "utf8")).records : [];
const causeOf = new Map(causes.map((c) => [`${c.id}#${c.j}`, c.cause]));

// instances by message: [c0, c1, rank, cause]
const byMsg = new Map();
for (const n of N.needs) for (const [m, c0, c1] of n.instances) { if (!byMsg.has(m)) byMsg.set(m, []); byMsg.get(m).push([c0, c1, n.rank, n.cause]); }
const G = [];      // gold requests: {id, j, out, minRank, causes (need causes touching it), root}
for (const rec of recs) {
  const r = rows.get(rec.id); if (!r) throw new Error(`no row for ${rec.id}`);
  const gs = goldSpans(r), out = gs.map(() => "not done");
  for (const p of rec.vss) if (p.g >= 0) out[p.g] = out[p.g] === "right" ? "right" : p.o;
  const inst = byMsg.get(rec.id) || [];
  gs.forEach((g, j) => {
    const hit = g.s < 0 ? [] : inst.filter(([a, b]) => a < g.e && b > g.s);
    G.push({ id: rec.id, j, out: out[j], found: g.s >= 0, minRank: hit.length ? Math.min(...hit.map((x) => x[2])) : Infinity, causes: [...new Set(hit.map((x) => x[3]))], hits: hit, root: causeOf.get(`${rec.id}#${j}`) || null });
  });
}
const L = [], log = (s = "") => { L.push(s); console.log(s); };
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) : "-");
const miss = G.filter((g) => g.out !== "right"), right = G.filter((g) => g.out === "right");
const wrong = G.filter((g) => g.out === "wrong"), nd = G.filter((g) => g.out === "not done");
log(`Needs: ${needsFile} (${N.meta.messages} messages, ${N.needs.length} needs; ${N.meta.names ? "with" : "without"} canvas names). Gold: ${recFile} (${recs.length} messages, ${G.length} gold requests: right ${right.length}, wrong ${wrong.length}, not done ${nd.length}; ${G.filter((g) => !g.found).length} gold spans not found in the text).`);
log("");
log("| top N needs | wrong + not done covered (wrong · not done) | right requests touched |");
log("|---|---|---|");
for (const n of [10, 20, 50, Infinity]) {
  const c = (xs) => xs.filter((g) => g.minRank < Infinity && g.minRank <= n).length;
  log(`| ${n === Infinity ? "all (" + N.needs.length + ")" : n} | ${pct(c(miss), miss.length)}% (${c(miss)}/${miss.length}) (${pct(c(wrong), wrong.length)} · ${pct(c(nd), nd.length)}) | ${pct(c(right), right.length)}% (${c(right)}/${right.length}) |`);
}
log("");
// coverage of the misses by the cause type of the needs touching them (all needs)
const ct = new Map(); for (const g of miss) for (const c of g.causes) ct.set(c, (ct.get(c) || 0) + 1);
const cr = new Map(); for (const g of right) for (const c of g.causes) cr.set(c, (cr.get(c) || 0) + 1);
log("Which kinds of cause touch the requests (all needs; a request can be touched by several):\n");
log("| cause of the need | wrong + not done touched | right touched |\n|---|---|---|");
for (const [c, v] of [...ct.entries()].sort((a, b) => b[1] - a[1])) log(`| ${c} | ${v} (${pct(v, miss.length)}%) | ${cr.get(c) || 0} (${pct(cr.get(c) || 0, right.length)}%) |`);
log("");
// per need: the gold requests it touches
log("Top 30 needs: the gold requests their instances touch, and how many of those are not right:\n");
log("| # need key | requests flagged (touching a gold request) | of the touched gold requests, not right |\n|---|---|---|");
for (const n of N.needs.slice(0, 30)) {
  const touched = G.filter((g) => g.hits.some((h) => h[2] === n.rank)), bad = touched.filter((g) => g.out !== "right");
  const inGold = n.instances.filter(([m, c0, c1]) => G.some((g) => g.id === m && g.hits.some((h) => h[2] === n.rank && h[0] === c0 && h[1] === c1))).length;
  log(`| ${n.rank} \`${n.key}\` | ${n.requests} (${inGold}) | ${bad.length}/${touched.length} (${pct(bad.length, touched.length)}%) |`);
}
log("");
if (causes.length) {
  // root cause (composer_errors.mjs) of each miss: covered by all needs / by the top 20?
  const R = new Map();
  for (const g of miss) { const k = (g.root || "(no root cause record)").replace(/\s*\(.*$/, ""); const x = R.get(k) || { n: 0, all: 0, t20: 0, by: new Map() }; x.n++; if (g.minRank < Infinity) x.all++; if (g.minRank <= 20) x.t20++; for (const c of g.causes) x.by.set(c, (x.by.get(c) || 0) + 1); R.set(k, x); }
  log("Root cause of each miss (composer_errors.mjs, gold) against the needs (text only): covered by any need / by the top 20, and the need causes touching it:\n");
  log("| root cause (gold) | misses · covered all · top 20 | need causes touching (count) |\n|---|---|---|");
  for (const [k, x] of [...R.entries()].sort((a, b) => b[1].n - a[1].n)) log(`| ${k} | ${x.n} · ${x.all} · ${x.t20} | ${[...x.by.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([c, v]) => `${c} ${v}`).join(", ")} |`);
}
if (opt("--md")) writeFileSync(opt("--md"), L.join("\n") + "\n");
