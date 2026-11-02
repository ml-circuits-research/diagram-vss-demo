// test_vote_confidence.mjs: parity of the browser code of the three-reader vote (docs/js/vote-confidence.js) with the script that fitted it
// (training/sketch/confidence3/fit3.mjs), on the fixture training/sketch/confidence3/vote3_parity.json (written by fit3.mjs EXPORT=1: the first
// 60 test-part messages of fresh2, the readings and signals as the page has them, and the script's confidence of every request of the columns
// vss, sop, vote3 and the vote count of the weight-free rule). other_conf (vote3's sop part) is computed here as in the page:
// docs/js/vss-confidence.js with docs/model/confidence/vss.json. Also: engineNorm on hand-made examples.
//   node training/sketch/test_vote_confidence.mjs [vote3.json] [fixture]
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, "../..");
const MODEL = JSON.parse(readFileSync(process.argv[2] || path.join(ROOT, "docs/model/confidence/vote3.json"), "utf8"));
const FX = JSON.parse(readFileSync(process.argv[3] || path.join(HERE, "confidence3/vote3_parity.json"), "utf8"));
const VSSJ = JSON.parse(readFileSync(path.join(ROOT, "docs/model/confidence/vss.json"), "utf8"));
const VT = await import(pathToFileURL(path.join(ROOT, "docs/js/vote-confidence.js")).href);
const VC = await import(pathToFileURL(path.join(ROOT, "docs/js/vss-confidence.js")).href);

let fails = 0;
const check = (name, ok, detail = "") => { console.log((ok ? "ok   " : "FAIL ") + name + (ok || !detail ? "" : "\n     " + detail)); if (!ok) fails++; };

const runs = {
  vss: (m) => VT.columnVss(MODEL, { text: m.text, names: m.names, ...m.vss }),
  sop: (m) => VT.columnSop(MODEL, { text: m.text, names: m.names, sop: m.bert.sop, vss: m.bert.vss, rules: m.bert.rules, rulesMsg: m.bert.rulesMsg }),
  vote3: (m) => VT.vote3(MODEL, { text: m.text, names: m.names, ...m.bert, vss: m.bert.vss.map((v) => Object.assign({}, v, { conf: VC.confidence(VSSJ, v.f, v.world) })) }),
  vote3_rule: (m) => VT.vote3(MODEL, { text: m.text, names: m.names, ...m.bert, vss: m.bert.vss.map((v) => Object.assign({}, v, { conf: 0 })) }, "cost", true)
};
for (const [col, run] of Object.entries(runs)) {
  let n = 0, maxd = 0, sameSet = 0, msgs = 0, sameN = 0;
  for (const m of FX.messages) {
    const exp = m.expect[col], got = run(m); msgs++;
    const key = (x) => `${x.from}:${x.j}`, G = new Map(got.map((x) => [key(x), x]));
    if (got.length === exp.length && exp.every((e) => G.has(key(e)))) sameSet++;
    for (const e of exp) { const x = G.get(key(e)); n++; if (!x) continue; if (x.n_agree === e.n) sameN++; if (e.conf !== undefined) maxd = Math.max(maxd, Math.abs(x.conf - e.conf)); }
  }
  check(`${col}: the same requests (and whose reading) on ${sameSet} of ${msgs} messages`, sameSet === msgs);
  check(`${col}: the same vote count n_agree on ${sameN} of ${n} requests`, sameN === n);
  if (col !== "vote3_rule") check(`${col}: max |confidence, browser code − script| = ${maxd.toExponential(2)} over ${n} requests`, n >= 60 && maxd < 1e-9);
}
// thresholds by level and type come from the file
{ const L = MODEL.columns.vote3.levels.cost, t = VT.thresholdOf(MODEL.columns.vote3.levels, "cost", "question:count"), tc = VT.thresholdOf(MODEL.columns.vote3.levels, "cost", "command:move");
  check("thresholdOf: per-type thresholds of the file", t === (L.question ?? L.all) && tc === (L.command ?? L.all)); }
// engineNorm: arrange / distribute targets as sets, "no target" = mention(quantifier=all) = every canvas name; nothing else
{
  const N = ["Start", "Check", "Done", "Retry"];
  const a = VT.engineNorm({ action: "arrange", layout: "circle" }, "command:arrange", N), b = VT.engineNorm({ action: "arrange", layout: "circle", target: "check,done,retry,start" }, "command:arrange", N);
  const c = VT.engineNorm({ action: "distribute", axis: "vertical", target: "mention(quantifier=all)" }, "command:distribute", N);
  const d = VT.engineNorm({ action: "arrange", target: "done,start" }, "command:arrange", N), e = VT.engineNorm({ action: "arrange", target: "start,done" }, "command:arrange", N);
  const f = VT.engineNorm({ action: "align", target: "done,start" }, "command:align", N), g = VT.engineNorm({ action: "arrange", target: "mention(quantifier=all,shape=star)" }, "command:arrange", N);
  check("engineNorm: no target = mention(quantifier=all) = every canvas name; order-free for arrange; align and filtered mentions unchanged",
    a.target === "*all*" && b.target === "*all*" && c.target === "*all*" && d.target === e.target && d.target === "done,start" && f.target === "done,start" && g.target === "mention(quantifier=all,shape=star)",
    JSON.stringify([a, b, c, d, e, f, g]));
}
console.log(fails ? `\n${fails} failed` : "\nall passed");
process.exit(fails ? 1 : 0);
