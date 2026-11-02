// test_vss_confidence.mjs: the browser's VSS confidence equals the scripts' (PRECISION.md, VSS_CONFIDENCE.md).
//   browser: the composer's own unit.signals (docs/js/vss-composer.js) + docs/js/vss-confidence.js with docs/model/confidence/vss.json
//            (since 2026-11-02 21:24 the fit of arm VSS-G on the fresh2 calibration part, fresh2/export_confidence.mjs; its default level
//            "cost" and its reached precision levels);
//   scripts: the records of training/sketch/vss_confidence.mjs collect (the composer observed from outside, run as a separate process) +
//            training/sketch/precision_confidence.mjs with the same spec (SPEC=<file> compares with another file's spec instead, e.g.
//            training/sketch/precision_thresholds.json: its weights must then be identical to vss.json's).
// Both read the same messages of the fixed sample (training/sketch/eval/sample1000) with the same scorer context rule (llm_score.mjs
// vssFormalize). Per produced request: every raw signal, the world, the confidence (max abs difference reported) and the execute / ask
// decision at every threshold (vss.json: cost and the reached levels; with SPEC, that file's levels too), each confidence against the
// same threshold. Also the gated numbers of the requests compared (precision of execution, right % of requests, asked
// %, from the records' outcomes), from both confidences.
//   node training/sketch/test_vss_confidence.mjs            300 produced requests (whole messages, spread over the sample)
//   N=<n>  at least n requests;  ALL=1  the whole sample;  RECORDS=<file.jsonl>  also compare with earlier collect records (e.g. those
//   of PRECISION.md) on the same messages: reports how many requests differ (a model or code change since), not a failure.
// Exit code 0 when the signals and decisions are identical and the confidence differs by < 1e-12.
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
process.env.LLM_SCORE_LIB = "1"; process.env.SEG = "composer"; process.env.PAIR = "value";
const REPO = new URL("../../", import.meta.url).pathname;
const SAMPLE = REPO + "training/sketch/eval/sample1000";
const { vssFormalize } = await import(REPO + "training/sketch/llm_score.mjs");
const B = await import(REPO + "docs/js/vss-confidence.js");
const S = await import(REPO + "training/sketch/precision_confidence.mjs");
const VSSJSON = REPO + "docs/model/confidence/vss.json", SPECF = process.env.SPEC || VSSJSON;
const MB = JSON.parse(readFileSync(VSSJSON, "utf8")), MS = JSON.parse(readFileSync(SPECF, "utf8"));
const specS = MS.readers ? MS.readers.vss_combined : MS, specB = B.specOf(MB);
const sameFile = ["intercept", "features", "tables", "world_prior", "world_prior_default"].every((k) => JSON.stringify(specB[k]) === JSON.stringify(specS[k]));
// the thresholds compared: vss.json's default level (cost) and reached precision levels; with SPEC, that file's levels (in-sample) too
const THR = [[`${B.DEFAULT_LEVEL} (vss.json default)`, B.threshold(MB, B.DEFAULT_LEVEL)]].concat(B.reachedLevels(MB).map((l) => [`${l}% (vss.json)`, B.threshold(MB, String(l))]))
  .concat(SPECF === VSSJSON ? [] : Object.entries(specS.levels_in_sample || specS.levels || {}).filter(([, L]) => L && Number.isFinite(L.threshold)).map(([l, L]) => [`${l} (${SPECF.split("/").pop()})`, L.threshold]));
const LEVELS = THR.map(([k]) => k), TH = Object.fromEntries(THR);

// the sample's messages, in the order collect reads them (dirs sorted, files msg_/batch_/s_ sorted)
const dirs = readdirSync(SAMPLE).sort().map((d) => `${SAMPLE}/${d}`);
const rows = [];
for (const d of dirs) for (const f of readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort())
  for (const l of readFileSync(`${d}/${f}`, "utf8").split("\n")) if (l.trim()) { const r = JSON.parse(l); if (Array.isArray(r.wires)) rows.push(r); }
const ALL = process.env.ALL === "1", N = +(process.env.N || 300);
// the browser path, message by message in a stride order over the sample, until N produced requests (ALL: every message)
const stride = 7, order = ALL ? rows.map((_, i) => i) : rows.map((_, i) => (i * stride) % rows.length).filter((v, i, a) => a.indexOf(v) === i);
const mine = new Map(); let nReq = 0;
for (const i of order) {
  const r = rows[i]; if (mine.has(r.id)) continue;
  const nodes = vssFormalize(r.text, { names: (r.names || []).slice(), last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null });
  const mains = nodes.filter((n) => n.type !== "mention");
  mine.set(r.id, mains.map((n) => ({ f: n.unit ? n.unit.signals : null, w: n.unit ? n.unit.world : null })));
  nReq += mains.length;
  if (!ALL && nReq >= N) break;
}
// the scripts: vss_confidence.mjs collect on the same messages, in its own process
const tmp = mkdtempSync(`${tmpdir()}/vssconf-`), ids = `${tmp}/ids.txt`, recF = `${tmp}/records.jsonl`;
writeFileSync(ids, [...mine.keys()].join("\n") + "\n");
const log = execFileSync("node", [REPO + "training/sketch/vss_confidence.mjs", "collect", recF, "sample", ...dirs], { env: Object.assign({}, process.env, { IDS: ids, LLM_SCORE_LIB: "" }), encoding: "utf8", maxBuffer: 1 << 26 });
const recs = readFileSync(recF, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
rmSync(tmp, { recursive: true, force: true });

// compare
const fmt = (x) => (x === undefined ? "undefined" : JSON.stringify(x));
let n = 0, sigDiff = 0, worldDiff = 0, countDiff = 0, maxd = 0, notFound = 0; const dis = Object.fromEntries(LEVELS.map((l) => [l, 0])), ex = [];
const items = { browser: [], scripts: [] };
for (const rec of recs) {
  const m = mine.get(rec.id);
  if (!m || m.length !== rec.vss.length) { countDiff++; if (ex.length < 5) ex.push(`${rec.id}: ${m ? m.length : "-"} requests in the browser path, ${rec.vss.length} in the records`); continue; }
  rec.vss.forEach((x, i) => {
    n++; const b = m[i];
    if (!x.f.found) notFound++;
    const keys = new Set(Object.keys(x.f).concat(Object.keys(b.f || {})));
    const bad = [...keys].filter((k) => fmt(x.f[k]) !== fmt((b.f || {})[k]));
    if (bad.length) { sigDiff++; if (ex.length < 5) ex.push(`${rec.id} #${i}: ${bad.map((k) => `${k} ${fmt(x.f[k])} vs ${fmt((b.f || {})[k])}`).join(", ")}`); }
    if (x.w !== b.w) worldDiff++;
    const cs = S.vssCombinedConfidence(specS, x.f, x.w), cb = B.confidence(MB, b.f, b.w);
    maxd = Math.max(maxd, Math.abs(cs - cb));
    for (const l of LEVELS) if ((cs >= TH[l]) !== (cb >= TH[l])) dis[l]++;
    items.scripts.push({ c: cs, o: x.o }); items.browser.push({ c: cb, o: x.o });
  });
}
const gold = recs.reduce((a, r) => a + r.gold, 0);
function gated(it, t) {
  let r = 0, w = 0, e = 0, ar = 0, aw = 0;
  for (const x of it) { if (x.c >= t) { if (x.o === "right") r++; else if (x.o === "wrong") w++; else e++; } else if (x.o === "right") ar++; else if (x.o === "wrong") aw++; }
  const p = (v) => (v * 100).toFixed(1);
  return `precision ${p(r / (r + w + e))} · right ${p(r / gold)} · asked ${p((ar + aw) / gold)} · executed wrong ${p(w / gold)} · extras executed ${e}`;
}
console.log(`collect: ${log.trim().split("\n").pop()}`);
console.log(`model files: the confidence of docs/model/confidence/vss.json (weights, intercept, tables, world prior) ${SPECF === VSSJSON ? "used by both sides" : sameFile ? `is identical to ${SPECF}'s` : `DIFFERS FROM ${SPECF}'s`}; thresholds: ${THR.map(([k, t]) => `${k} ${t.toFixed(4)}`).join(", ")}`);
console.log(`messages ${recs.length} (browser path ${mine.size}) · produced requests compared ${n} · messages with a different request count ${countDiff}`);
console.log(`requests with a raw signal that differs ${sigDiff} · world differs ${worldDiff} · records without a found unit ${notFound}`);
console.log(`confidence: max abs difference ${maxd.toExponential(2)}`);
console.log(`execute / ask decisions that differ: ${LEVELS.map((l) => `${l} ${dis[l]} of ${n}`).join(" · ")}`);
for (const l of LEVELS) console.log(`gated ${l} on these ${gold} gold requests: scripts ${gated(items.scripts, TH[l])} | browser ${gated(items.browser, TH[l])}`);
for (const e of ex) console.log("  example: " + e);
// optional: earlier records (e.g. PRECISION.md's) on the same messages
if (process.env.RECORDS) {
  const old = new Map(readFileSync(process.env.RECORDS, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)).map((r) => [r.id, r]));
  let cmp = 0, diffMsg = 0, diffReq = 0, maxo = 0;
  for (const rec of recs) {
    const o = old.get(rec.id); if (!o) continue; cmp++;
    if (o.vss.length !== rec.vss.length) { diffMsg++; continue; }
    rec.vss.forEach((x, i) => { const y = o.vss[i]; if (y.o !== x.o || y.w !== x.w || JSON.stringify(y.f) !== JSON.stringify(x.f)) diffReq++; maxo = Math.max(maxo, Math.abs(S.vssCombinedConfidence(specS, x.f, x.w) - S.vssCombinedConfidence(specS, y.f, y.w))); });
  }
  console.log(`earlier records ${process.env.RECORDS}: ${cmp} messages compared · ${diffMsg} with a different request count · ${diffReq} requests with another outcome, world or signal · max confidence difference ${maxo.toExponential(2)}`);
}
const ok = sameFile && !countDiff && !sigDiff && !worldDiff && maxd < 1e-12 && LEVELS.every((l) => !dis[l]) && n > 0;
console.log(ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
