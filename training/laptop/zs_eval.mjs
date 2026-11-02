// zs_eval.mjs: which way of asking a pretrained model gets the ACT of a short command right (the neural reader's first step).
// Rows: docs/bench/{hand,blind,broad}.json, one-request rows whose gold has an action (command) or an ask (question), or type fact/rule.
// Strategies (each prints act accuracy and ms per row):
//   nli2   the demo today: kind (KIND hypotheses) then action/ask (ACTION/ASK hypotheses), hypothesis_template "{}"
//   nli1   one step over every act hypothesis (ACTION + ASK + fact + rule), template "{}"
//   emb:<model>  embedding similarity: the act of the nearest legend example (ACTION/ASK/KIND example lists of neural.js)
// Usage (cd training/laptop && npm install first): node training/laptop/zs_eval.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
globalThis.SOPKit = require("../../docs/js/logic.js");
const NeuralKit = require("../../docs/js/neural.js");
const T = await import("@huggingface/transformers");
const src = readFileSync(new URL("../../docs/js/neural.js", import.meta.url), "utf8");
const grab = (name) => eval("(" + src.slice(src.indexOf(`const ${name} = {`) + `const ${name} = `.length, src.indexOf("\n};", src.indexOf(`const ${name} = {`)) + 2) + ")");
const KIND = grab("KIND"), ACTION = grab("ACTION"), ASK = grab("ASK");
const rows = [];
for (const set of ["hand", "blind", "broad"]) for (const r of JSON.parse(readFileSync(new URL(`../../docs/bench/${set}.json`, import.meta.url), "utf8"))) {
  if (r.wires && r.wires.length !== 1) continue;
  const g = r.gold || (r.wires && r.wires[0] && r.wires[0].args) || {}, type = r.type || (r.wires && r.wires[0].type);
  const act = type === "command" ? g.action : type === "question" ? g.ask : type;
  if (act && (ACTION[act] || ASK[act] || act === "fact" || act === "rule")) rows.push({ set, text: r.text, act });
}
console.log(`${rows.length} rows (hand, blind, broad; one request each)`);
const ACTS = Object.assign({}, ACTION, ASK, { fact: KIND.fact, rule: KIND.rule });
const hypOf = Object.fromEntries(Object.entries(ACTS).map(([k, v]) => [v[0], k]));
const report = (name, ok, ms, wrong) => console.log(`${name.padEnd(34)} act right ${ok}/${rows.length} (${(ok / rows.length * 100).toFixed(1)}%) · ${ms.toFixed(0)} ms/row · most common wrong: ${Object.entries(wrong).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => k + " " + n).join(", ")}`);
for (const id of Object.values(NeuralKit.MODELS.zeroshot)) {
  const zs = await T.pipeline("zero-shot-classification", id, { device: "cpu", dtype: "q8" });
  for (const mode of ["nli2", "nli1"]) {
    let ok = 0; const wrong = {}; const t0 = performance.now();
    for (const r of rows) {
      let act;
      if (mode === "nli2") {
        const k = await zs(r.text, Object.values(KIND).map((x) => x[0]), { hypothesis_template: "{}" }), kind = Object.keys(KIND).find((x) => KIND[x][0] === k.labels[0]);
        if (kind === "fact" || kind === "rule") act = kind;
        else { const H = kind === "command" ? ACTION : ASK, a = await zs(r.text, Object.values(H).map((x) => x[0]), { hypothesis_template: "{}" }); act = Object.keys(H).find((x) => H[x][0] === a.labels[0]); }
      } else { const a = await zs(r.text, Object.keys(hypOf), { hypothesis_template: "{}" }); act = hypOf[a.labels[0]]; }
      if (act === r.act) ok++; else wrong[`${r.act}->${act}`] = (wrong[`${r.act}->${act}`] || 0) + 1;
    }
    report(`${mode} ${id.split("/")[1]}`, ok, (performance.now() - t0) / rows.length, wrong);
  }
}
for (const id of ["Xenova/all-MiniLM-L6-v2", "Xenova/bge-small-en-v1.5", "Xenova/gte-small"]) {
  let fe; try { fe = await T.pipeline("feature-extraction", id, { device: "cpu", dtype: "q8" }); } catch (e) { console.log(`emb ${id}: load failed: ${e.message}`); continue; }
  const ex = []; for (const [k, v] of Object.entries(ACTS)) for (const t of v[1]) ex.push({ k, t });
  const E = (await fe(ex.map((x) => x.t), { pooling: "mean", normalize: true })).tolist();
  let ok = 0; const wrong = {}; const t0 = performance.now();
  for (const r of rows) {
    const v = (await fe([r.text], { pooling: "mean", normalize: true })).tolist()[0];
    let best = -2, act = null; ex.forEach((x, i) => { const s = E[i].reduce((a, e, j) => a + e * v[j], 0); if (s > best) { best = s; act = x.k; } });
    if (act === r.act) ok++; else wrong[`${r.act}->${act}`] = (wrong[`${r.act}->${act}`] || 0) + 1;
  }
  report(`emb ${id.split("/")[1]}`, ok, (performance.now() - t0) / rows.length, wrong);
}
