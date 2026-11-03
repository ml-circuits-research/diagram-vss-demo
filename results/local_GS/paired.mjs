// paired.mjs: paired bootstrap of the cost score (cost 10) between two readers on a set of test messages, plus right / wrong / not done / extras.
//   node paired.mjs <fitdir with EXPORT jsons> <records dir> <idPrefix or ''> <jsonA> <jsonB> [<name=records file for Rules>]
// Uses the EXPORT of fresh2/fit_report.mjs (every produced request: id, cal, outcome o, confidence c; the cost-score threshold t).
import { readFileSync, existsSync } from "node:fs";
const [FIT, REC, PREFIX, A, B, RULES] = process.argv.slice(2);
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const num = (t) => (t === "Infinity" ? Infinity : t === "-Infinity" ? -Infinity : +t);
const COST = 10, BOOT = 1000, SEED = 1;
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const sel = (id) => (PREFIX ? id.startsWith(PREFIX) : !id.startsWith("s3-"));
function perMsg(items, gold, t) {
  const per = new Map(); for (const [id, g] of gold) per.set(id, { g, r: 0, w: 0, e: 0 });
  for (const x of items) if (!x.cal && sel(x.id) && x.c >= t) { const e = per.get(x.id); if (!e) continue; if (x.o === "right") e.r++; else if (x.o === "wrong") e.w++; else e.e++; }
  return per;
}
const gold = new Map(); for (const r of readJ(`${REC}/vss_arm.jsonl`)) gold.set(r.id, r.gold);
const testGold = new Map([...gold].filter(([id]) => sel(id) && !isCal(id)));
import { createHash } from "node:crypto";
function isCal(id) { return BigInt("0x" + createHash("sha256").update(id).digest("hex")) % 3n === 0n; }
const readers = [];
for (const f of [A, B]) { const j = JSON.parse(readFileSync(`${FIT}/${f}.json`, "utf8")); readers.push({ name: j.label, t: process.env.ALL ? -Infinity : num(j.costThreshold.t), kind: process.env.ALL ? "no threshold" : j.costThreshold.kind, per: perMsg(j.items, testGold, process.env.ALL ? -Infinity : num(j.costThreshold.t)) }); }
if (RULES) { const rec = readJ(`${REC}/${RULES}.jsonl`); const items = rec.flatMap((r) => r.rules.map((x) => ({ id: r.id, cal: isCal(r.id), o: x.o, c: 1 }))); readers.push({ name: "Rules (executes everything)", t: -Infinity, kind: "none", per: perMsg(items, testGold, -Infinity) }); }
const ids = [...testGold.keys()].sort();
const agg = (R, idx) => { let g = 0, r = 0, w = 0, e = 0; for (const i of idx) { const m = R.per.get(ids[i]); g += m.g; r += m.r; w += m.w; e += m.e; } return { g, r, w, e, score: ((r - COST * (w + e)) / g) * 100 }; };
const all = ids.map((_, i) => i);
const q = (a, z) => { a.sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.max(0, Math.floor(z * a.length)))]; };
const rand = rng(SEED), draws = []; for (let b = 0; b < BOOT; b++) draws.push(ids.map(() => Math.floor(rand() * ids.length)));
const p1 = (x) => x.toFixed(1);
console.log(`messages ${ids.length}, requested ${agg(readers[0], all).g}`);
for (const R of readers) {
  const s = agg(R, all), sc = draws.map((d) => agg(R, d).score);
  R.s = s; R.sc = sc;
  console.log(`${R.name}: threshold ${R.t} (${R.kind}) | right ${p1(s.r / s.g * 100)}% wrong ${p1(s.w / s.g * 100)}% not done ${p1((s.g - s.r - s.w) / s.g * 100)}% extras ${s.e} (executed ${s.r + s.w + s.e}; right ${s.r}, wrong ${s.w}, of ${s.g}) | score ${p1(s.score)} [${p1(q(sc.slice(), 0.025))}, ${p1(q(sc.slice(), 0.975))}]`);
}
for (let i = 1; i < readers.length; i++) { const d = readers[i].sc.map((x, k) => x - readers[0].sc[k]); console.log(`paired difference (${readers[i].name}) - (${readers[0].name}): ${p1(readers[i].s.score - readers[0].s.score)} [${p1(q(d.slice(), 0.025))}, ${p1(q(d.slice(), 0.975))}]`); }
