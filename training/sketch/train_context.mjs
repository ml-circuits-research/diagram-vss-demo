// train_context.mjs: learns the weights of the post-VSS context filler (docs/js/vss-context.js) from the annotated gold args.
// Setup (mention ranking): every gap the filler finds in a produced request that is paired with a gold request (layer_common.mjs
// pairValue) is one instance; its candidates are the filler's closed set plus NULL; the positive is the candidate equal to the gold value
// of that key (several shapes: the same set), or NULL when no candidate is (the gold value is not in the context, or the gold has no such key).
// The context is built with teacher forcing: an earlier gap is filled with its gold candidate when there is one.
// Split: 80% / 20% of the messages by a hash of the id (layer_common.mjs isTest). Model: a conditional logit (softmax over the candidates of
// one gap), loss -log P(positive), L2 1e-3, full-batch Adam, 600 steps; nothing tuned on the test split.
// Margin (pre-registered): the smallest margin in the grid whose fills on the TRAINING split are at least 95% right.
// Writes docs/model/context/weights.json (WEIGHTS=<file> to write elsewhere). Uses the composer cache of layer_common.mjs build().
// node train_context.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Context, FEATURES, deriveNeeds, ENTITY_KEYS } from "../../docs/js/vss-context.js";
import { build, dirsAll, pairValue, createdBefore, candMatches, isTest, parts, valEq } from "./layer_common.mjs";

const OUT = process.env.WEIGHTS || new URL("../../docs/model/context/weights.json", import.meta.url).pathname;
const C = await build(dirsAll());
const train = C.msgs.filter((m) => !isTest(m.id)), test = C.msgs.filter((m) => isTest(m.id));
const needs = deriveNeeds(train.flatMap((m) => m.gold.map((g) => ({ type: g.type, args: g.args }))));
console.log(`messages: train ${train.length}, test ${test.length}`);

function collect(msgs, model) {
  const inst = [];
  for (const m of msgs) {
    const pairs = new Map(pairValue(m)), ctx = new Context({ text: m.text, canvas: m.names, model });
    m.prods.forEach((p, i) => {
      const u = m.units[p.u], raw = { nodes: p.raw.nodes, main: p.raw.nodes.find((n) => n.id === p.raw.mainId), defaulted: p.raw.defaulted };
      const j = pairs.get(i), g = j != null ? m.gold[j] : null, created = j != null ? createdBefore(m, j) : new Set();
      const oracle = (gap, cands) => {
        if (!g) return -1;
        let gv = g.want[gap.key];
        if (gv != null && gap.index != null) {   // one element of a list: the gold elements the other elements do not hold
          const others = (raw.main.args[gap.key] || []).filter((x, k) => k !== gap.index).map((x) => String(typeof x === "string" ? x : "").toLowerCase());
          const rest = parts(gv).filter((x) => !others.includes(x)); gv = rest.length === 1 ? rest[0] : null;
          if (gv == null) return -1;
        }
        if (gv != null && gv.startsWith("mention(")) gv = null;   // the gold is a description: the engine resolves it, no context entity is right
        const pos = cands.map((c, k) => (gv != null && candMatches(ctx, c, gv, created) ? k : -1)).filter((k) => k >= 0);
        inst.push({ id: m.id, key: gap.key, kind: gap.kind, hasGold: gv != null, gv, word: gap.word, src: m.text.slice(u.c0, u.c1), ckeys: cands.map((c) => c.keys.join("+")), F: cands.map((c) => c.f), kinds: cands.map((c) => c.kind), pos: pos.length ? pos : [cands.length - 1], goldIn: pos.length > 0 });
        return pos.length ? pos[0] : -1;
      };
      ctx.step(raw, u.c0, u.c1, { oracle, tokens: p.tokens });
    });
  }
  return inst;
}
const model0 = { weights: {}, margin: 0, needs };
const TR = collect(train, model0), TE = collect(test, model0);
console.log(`gap instances: train ${TR.length}, test ${TE.length}`);

// ---- conditional logit
const fi = new Map(FEATURES.map((f, k) => [f, k])), D = FEATURES.length;
const dense = (I) => I.map((x) => ({ X: x.F.map((f) => { const v = new Float64Array(D); for (const [k, a] of Object.entries(f)) v[fi.get(k)] = a; return v; }), pos: x.pos }));
const dTR = dense(TR), dTE = dense(TE);
const w = new Float64Array(D), mA = new Float64Array(D), vA = new Float64Array(D), L2 = 1e-3, LR = 0.05;
const scoresOf = (X) => X.map((x) => { let s = 0; for (let k = 0; k < D; k++) s += w[k] * x[k]; return s; });
function lossGrad(data) {
  const grad = new Float64Array(D); let loss = 0;
  for (const { X, pos } of data) {
    const s = scoresOf(X), mx = Math.max(...s), e = s.map((x) => Math.exp(x - mx)), Z = e.reduce((a, b) => a + b, 0), Zp = pos.reduce((a, k) => a + e[k], 0);
    loss -= Math.log(Zp / Z);
    for (let c = 0; c < X.length; c++) { const pAll = e[c] / Z, pPos = pos.includes(c) ? e[c] / Zp : 0; for (let k = 0; k < D; k++) grad[k] += (pAll - pPos) * X[c][k]; }
  }
  for (let k = 0; k < D; k++) { grad[k] = grad[k] / data.length + 2 * L2 * w[k]; }
  return { loss: loss / data.length, grad };
}
for (let t = 1; t <= 600; t++) {
  const { loss, grad } = lossGrad(dTR);
  for (let k = 0; k < D; k++) { mA[k] = 0.9 * mA[k] + 0.1 * grad[k]; vA[k] = 0.999 * vA[k] + 0.001 * grad[k] * grad[k]; w[k] -= LR * (mA[k] / (1 - 0.9 ** t)) / (Math.sqrt(vA[k] / (1 - 0.999 ** t)) + 1e-8); }
  if (t % 200 === 0) console.log(`step ${t}: train loss ${loss.toFixed(4)} · test loss ${lossGrad(dTE).loss.toFixed(4)}`);
}
const weights = Object.fromEntries(FEATURES.map((f, k) => [f, +w[k].toFixed(4)]));

// ---- decisions and the margin
const decideAll = (data, I) => data.map(({ X, pos }, n) => { const s = scoresOf(X), o = s.map((x, k) => [x, k]).sort((a, b) => b[0] - a[0]); return { best: o[0][1], margin: o.length > 1 ? o[0][0] - o[1][0] : Infinity, isNull: I[n].kinds[o[0][1]] === "null", right: pos.includes(o[0][1]), inst: I[n] }; });
const DTR = decideAll(dTR, TR), DTE = decideAll(dTE, TE);
const GRID = Array.from({ length: 21 }, (_, k) => k * 0.25);   // 0 .. 5
const at = (Ds, mg) => { let fills = 0, right = 0, ask = 0; for (const d of Ds) { if (d.isNull || d.margin < mg) ask++; else { fills++; if (d.right) right++; } } return { fills, right, wrong: fills - right, ask }; };
let margin = GRID[GRID.length - 1];
for (const mg of GRID) { const r = at(DTR, mg); if (r.fills && r.right / r.fills >= 0.95) { margin = mg; break; } }
const pc = (x, n) => (n ? (100 * x / n).toFixed(1) + "%" : "-");
console.log("\nmargin trade-off (teacher-forced context): fills right / wrong / asked");
console.log("| margin | train fills | train right | train wrong | train asked | test fills | test right | test wrong | test asked |\n|---|---|---|---|---|---|---|---|---|");
for (const mg of GRID) { const a = at(DTR, mg), b = at(DTE, mg); console.log(`| ${mg}${mg === margin ? " (chosen)" : ""} | ${a.fills} | ${a.right} (${pc(a.right, a.fills)}) | ${a.wrong} | ${a.ask} | ${b.fills} | ${b.right} (${pc(b.right, b.fills)}) | ${b.wrong} | ${b.ask} |`); }
const perKey = (Ds, title) => {
  console.log(`\n${title}\n| key / gap kind | gaps | gold has the key | gold among candidates (recall) | fills | right fills | wrong fills | asked |\n|---|---|---|---|---|---|---|---|`);
  const rows = {};
  for (const d of Ds) for (const k of [d.inst.key, "kind " + d.inst.kind, "all"]) {
    const r = (rows[k] = rows[k] || { n: 0, has: 0, rec: 0, fills: 0, right: 0, ask: 0 }); r.n++; if (d.inst.hasGold) r.has++; if (d.inst.goldIn) r.rec++;
    if (d.isNull || d.margin < margin) r.ask++; else { r.fills++; if (d.right) r.right++; }
  }
  for (const [k, r] of Object.entries(rows).sort((a, b) => b[1].n - a[1].n)) console.log(`| ${k} | ${r.n} | ${r.has} | ${r.rec} (${pc(r.rec, r.has)}) | ${r.fills} | ${r.right} (${pc(r.right, r.fills)}) | ${r.fills - r.right} | ${r.ask} (${pc(r.ask, r.n)}) |`);
};
perKey(DTR, "train split (teacher-forced context), at the chosen margin"); perKey(DTE, "TEST split (teacher-forced context), at the chosen margin");
console.log("\nlearned weights (higher = preferred; NULL = 'nobody in the context', i.e. ask):");
for (const [f, v] of Object.entries(weights).sort((a, b) => b[1] - a[1])) console.log(`  ${f.padEnd(14)} ${v >= 0 ? " " : ""}${v.toFixed(3)}`);
console.log(`chosen margin ${margin}`);
{ const r = {}; for (const d of DTR) { if (!d.inst.goldIn) continue; const k = d.inst.kind + " " + (d.inst.gv && parts(d.inst.gv).length > 1 ? "several" : "one"); const o = (r[k] = r[k] || { n: 0, top1: 0, nullTop: 0 }); o.n++; if (d.right) o.top1++; if (d.isNull) o.nullTop++; }
  console.log("train, gaps with the gold among the candidates: best = gold (top-1) / best = NULL, by gap kind and gold arity"); for (const [k, o] of Object.entries(r)) console.log(`  ${k}: ${o.n} · top-1 ${o.top1} (${pc(o.top1, o.n)}) · NULL on top ${o.nullTop}`); }
if (process.env.DEBUG) { const L = DTR.filter((d) => process.env.DEBUG === "recall" ? d.inst.hasGold && !d.inst.goldIn : d.inst.goldIn && !d.right);
  for (const d of L.filter((_, k) => k % Math.max(1, Math.floor(L.length / 40)) === 0)) console.log(`DBG ${d.inst.id} ${d.inst.kind} ${d.inst.key} ${d.inst.word || ""} gold=${d.inst.gv} best=${d.inst.ckeys[d.best]} m=${d.margin.toFixed(2)} | "${d.inst.src}" | cands ${d.inst.ckeys.slice(0, 8).join(" ")}`); }
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ about: "weights of the post-VSS context filler (docs/js/vss-context.js), learned by training/sketch/train_context.mjs from the gold args of the 80% training split (id hash); needs = the entity roles each action has in the gold data (deriveNeeds)", trained: { at: new Date().toISOString(), composer: C.meta, train_messages: train.length, test_messages: test.length, train_gaps: TR.length, test_gaps: TE.length, margin_rule: "smallest margin of the grid with >= 95% right fills on the training split" }, features: FEATURES, weights, margin, needs }, null, 1));
console.log(`wrote ${OUT}`);
