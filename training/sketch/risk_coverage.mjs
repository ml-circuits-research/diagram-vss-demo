// risk_coverage.mjs: risk-coverage comparison of VSS (the composer) and SOP-BERT (docs/model/neural/sop-bert) (RISK_COVERAGE.md).
// Every produced request gets one confidence (fixed in RISK_COVERAGE.md before the results):
//   VSS       the minimum of the chosen reading's margins (unit.vss.margins of the composer; the reader's own `_margin`);
//   SOP-BERT  min(p_act, the probability of every role the request fills: class head, fill head + lowest tag probability of a written
//             name, desc heads of a description, lowest tag probability of a tag key).
// Outcome of a produced request: right / wrong / extra, by the scoring of llm_score.mjs (PAIR=value; the pairing code below is the
// PAIR=value branch of llm_score.mjs pairUp, and the totals are checked against llm_score.mjs tally on every message).
//   node training/sketch/risk_coverage.mjs run <out.jsonl> <set name> <dir> [<dir> ...]     [IDS=file] [LIMIT=n] [HELDOUT=ids file]
//       one line per message: {id, set, heldout, gold, vss: [[conf, outcome, diag]], sop: [[conf, outcome, diag]]}
//   node training/sketch/risk_coverage.mjs report <records.jsonl> [...]                      [VSS_WRONG=11.4] [HELD=set name]
//       the curves, the comparison at equal wrong, AURC / E-AURC / AUROC, calibration, and the thresholds chosen on the set HELD
//       (default "heldout") applied to the other sets. Markdown tables.
// Needs `npm install` in training/laptop (@huggingface/transformers 3.8.1) for `run`.
import { readFileSync, readdirSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const [mode, ...args] = process.argv.slice(2);
if (mode === "run") await run(args); else if (mode === "report") report(args);
else { console.error("usage: risk_coverage.mjs run <out.jsonl> <set> <dir>... | report <records.jsonl>..."); process.exit(2); }

async function run([out, set, ...dirs]) {
  process.env.LLM_SCORE_LIB = "1"; process.env.SEG ||= "composer"; process.env.PAIR ||= "value";
  if (process.env.SEG !== "composer" || process.env.PAIR !== "value") throw new Error("risk_coverage.mjs: SEG=composer PAIR=value only");
  const { vssFormalize, tally, logic: K } = await import("./llm_score.mjs");
  const { Composer, nextContext } = await import("../../docs/js/vss-composer.js");
  const { canon, canonWant } = await import("../../docs/js/bench-canon.js");
  const { pairValue } = await import("./layer_common.mjs");
  // the composer's units of the last message (the same Composer class llm_score.mjs uses; only observed, the output is unchanged)
  const origF = Composer.prototype.formalizeCutter;
  Composer.prototype.formalizeCutter = function (...a) { const o = origF.apply(this, a); globalThis.__units = o.units; return o; };
  const require = createRequire(import.meta.url);
  globalThis.SOPKit = K;
  const NeuralKit = require("../../docs/js/neural.js");
  const T = await import(pathToFileURL(fileURLToPath(new URL("../laptop/node_modules/@huggingface/transformers/dist/transformers.node.mjs", import.meta.url))).href);
  const MODEL_DIR = fileURLToPath(new URL("../../docs/model/neural", import.meta.url)), ZS = "sop-bert";
  T.env.allowLocalModels = true; T.env.localModelPath = MODEL_DIR + "/";
  const OURS = Object.fromEntries(Object.entries(NeuralKit.OURS).map(([id, folder]) => [folder, id]));
  const dtype = NeuralKit.dtypeOf(OURS[ZS] || ZS);
  const tokenizer = await T.AutoTokenizer.from_pretrained(ZS, { local_files_only: true });
  const model = await T.AutoModel.from_pretrained(ZS, { device: "cpu", dtype, local_files_only: true });
  const m = Object.assign({ device: "cpu", dtype, qaModel: ZS, enumModel: ZS }, NeuralKit.makeReader(T, tokenizer, model));
  let lastReads = null; const origRM = m.readMany;
  m.readMany = async (texts) => { const r = await origRM(texts); lastReads = r; return r; };
  await m.read("draw a circle");
  const nsys = K.createSystem(), neural = NeuralKit.create(nsys.engine, () => { throw new Error("SOP-BERT called the Rules reader"); });
  neural.setModels(m); neural.setStrategy("finetuned");

  const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
  function pairUp(mains, gold, row) {   // llm_score.mjs pairUp, PAIR=value branch
    const used = new Set(), G = row.wires.map((w, j) => {
      let s0 = -1;
      if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); }
      return { s: s0, e: s0 < 0 ? -1 : s0 + w.span.length, act: gold[j].act, want: gold[j].want, args: w.args };
    });
    const units = mains.map((x) => { if (x.n.span) return { c0: x.n.span[0], c1: x.n.span[1] }; const k = x.n.src ? row.text.indexOf(x.n.src) : -1; return k < 0 ? { c0: 0, c1: 0 } : { c0: k, c1: k + x.n.src.length }; });
    return pairValue({ text: row.text, gold: G, units, prods: mains.map((x, i) => ({ act: x.act, u: i, rawC: x.got })) });
  }
  function outcomes(nodes, row) {
    const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
    const gold = row.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args) }));
    const res = mains.map(() => "extra");
    for (const [i, j] of pairUp(mains, gold, row)) res[i] = Object.entries(gold[j].want).every(([k, v]) => (mains[i].got[k] ?? "∅") === v) ? "right" : "wrong";
    return { mains, res };
  }
  const confVss = (n) => {
    const u = (globalThis.__units || []).find((x) => n.span && x.c0 === n.span[0] && x.c1 === n.span[1] && x.vss);
    if (!u) return [0, { unit: "not found" }];
    const ms = Object.values(u.vss.margins || {}).map(Number).filter((x) => Number.isFinite(x));
    return [ms.length ? Math.min(...ms) : 0, { status: u.vss.status, by: u.decidedBy, tie: u.tie, notU: (u.notUnderstood || []).length, res: +(+u.vss.residual).toFixed(4), world: u.world }];
  };
  const confSop = (a, R) => {
    const chosen = a.act ? a.act.value : a.kind.value, pa = (R.acts.find((x) => x.label === chosen) || R.acts[0]).score;
    let c = pa;
    for (const [k, r] of Object.entries(a.keys)) {
      if (r.value == null) continue;
      c = Math.min(c, r.score);
      if (r.fill === "written" && R.classes["fill:" + k]) c = Math.min(c, R.classes["fill:" + k].score);
    }
    return [c, { pAct: +pa.toFixed(5), act: chosen }];
  };

  const IDS = process.env.IDS ? new Set(readFileSync(process.env.IDS, "utf8").split(/\s+/).filter(Boolean)) : null;
  const HELD = process.env.HELDOUT ? new Set(readFileSync(process.env.HELDOUT, "utf8").split(/\s+/).filter(Boolean)) : new Set();
  const LIMIT = process.env.LIMIT ? +process.env.LIMIT : Infinity;
  const blank = () => ({ exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0, byAct: {} });
  const tot = { vss: blank(), sop: blank() }, mine = { vss: { right: 0, wrong: 0, extra: 0 }, sop: { right: 0, wrong: 0, extra: 0 } };
  writeFileSync(out, "");
  let done = 0; const seen = new Set();
  for (const d of dirs) {
    const files = readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort();
    const rows = files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)))
      .filter((r) => Array.isArray(r.wires) && (!IDS || IDS.has(r.id)) && !seen.has(r.id)).slice(0, LIMIT);
    for (const r of rows) {
      seen.add(r.id);
      const ctx = { names: (r.names || []).slice(), last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null };
      globalThis.__units = null;
      const vn = vssFormalize(r.text, ctx);
      const rec = { id: r.id, set, heldout: HELD.has(r.id), gold: r.wires.length, vss: [], sop: [] };
      { const { mains, res } = outcomes(vn, r); mains.forEach((x, i) => { const [c, dg] = confVss(x.n); rec.vss.push([+c.toFixed(6), res[i], dg]); mine.vss[res[i]]++; }); tally(tot.vss, vn, r); }
      lastReads = null;
      const ctx2 = { names: (r.names || []).slice(), last: [], spans: ctx.spans };
      const sr = await neural.formalize(r.text, ctx2, { update: nextContext }), src = new Map(sr.analyses.map((a) => [a.id, a.src]));
      for (const n of sr.nodes) if (n.type !== "mention" && src.has(n.id)) Object.defineProperty(n, "src", { value: src.get(n.id), enumerable: false });
      const aIdx = new Map(sr.analyses.map((a, i) => [a.id, i]));
      { const { mains, res } = outcomes(sr.nodes, r);
        mains.forEach((x, i) => { const si = aIdx.get(x.n.id), [c, dg] = confSop(sr.analyses[si], lastReads[si]); rec.sop.push([+c.toFixed(6), res[i], dg]); mine.sop[res[i]]++; });
        tally(tot.sop, sr.nodes, r); }
      appendFileSync(out, JSON.stringify(rec) + "\n");
      if (++done % 100 === 0) console.error(`${done} messages (${set})`);
    }
  }
  for (const f of ["vss", "sop"]) {   // the per-request outcomes must give llm_score.mjs's totals
    const t = tot[f], q = mine[f];
    if (t.right !== q.right || t.wrongAligned !== q.wrong || t.extra !== q.extra) throw new Error(`${f}: outcomes ${JSON.stringify(q)} differ from tally ${t.right}/${t.wrongAligned}/${t.extra}`);
    const p = (x) => (x / t.gold * 100).toFixed(1);
    console.log(`${set} ${f}: ${done} messages, ${t.gold} gold · right ${p(t.right)} · wrong ${p(t.wrongAligned)} · not done ${p(t.missed)} · extra ${t.extra} (checked against tally)`);
  }
}

// ------------------------------------------------------------------ report
function report(files) {
  const recs = files.flatMap((f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)));
  const VW = +(process.env.VSS_WRONG || 11.4), HELD = process.env.HELD || "heldout";
  const sets = [...new Set(recs.map((r) => r.set))];
  const items = (rs, f) => rs.flatMap((r) => r[f].map(([c, o]) => ({ c, o })));
  const R = { vss: "VSS", sop: "SOP-BERT" }, f1 = (x) => x.toFixed(1), f3 = (x) => x.toFixed(3);
  // cumulative expected counts after keeping k requests (k = 0..N), equal confidences as one block (linear inside it)
  function cum(it) {
    const s = it.slice().sort((a, b) => b.c - a.c), N = s.length, cr = [0], cw = [0], ce = [0];
    let i = 0;
    while (i < N) {
      let j = i; while (j < N && s[j].c === s[i].c) j++;
      const n = j - i, r = s.slice(i, j).filter((x) => x.o === "right").length, w = s.slice(i, j).filter((x) => x.o === "wrong").length, e = n - r - w;
      for (let k = 1; k <= n; k++) { cr.push(cr[i] + r * k / n); cw.push(cw[i] + w * k / n); ce.push(ce[i] + e * k / n); }
      i = j;
    }
    return { N, cr, cw, ce, s };
  }
  const at = (a, k) => { const k0 = Math.floor(k), k1 = Math.min(a.length - 1, k0 + 1), t = k - k0; return a[k0] * (1 - t) + a[k1] * t; };
  function kAtWrong(C, G, w) {   // the largest k whose wrong (% gold) is at most w
    const tgt = w * G / 100; if (C.cw[C.N] <= tgt) return C.N;
    let k = 0; while (k < C.N && C.cw[k + 1] <= tgt + 1e-9) k++;
    const d = C.cw[k + 1] - C.cw[k]; return d > 0 ? k + Math.min(1, (tgt - C.cw[k]) / d) : k;
  }
  function kAtRight(C, G, rr) { const tgt = rr * G / 100; if (C.cr[C.N] < tgt) return null; let k = 0; while (C.cr[k] < tgt) k++; const d = C.cr[k] - C.cr[k - 1]; return k - 1 + (d > 0 ? (tgt - C.cr[k - 1]) / d : 1); }
  function aurc(C) { let a = 0, opt = 0; const nR = C.cr[C.N]; for (let k = 1; k <= C.N; k++) { a += (k - C.cr[k]) / k; opt += Math.max(0, k - nR) / k; } return [a / C.N, (a - opt) / C.N]; }
  function auroc(it) { const pos = it.filter((x) => x.o === "right").map((x) => x.c), neg = it.filter((x) => x.o !== "right").map((x) => x.c).sort((a, b) => a - b);
    let s = 0; for (const p of pos) { let lo = 0, hi = neg.length; while (lo < hi) { const m = (lo + hi) >> 1; if (neg[m] < p) lo = m + 1; else hi = m; } let eq = lo; while (eq < neg.length && neg[eq] === p) eq++; s += lo + (eq - lo) / 2; }
    return s / (pos.length * neg.length); }
  const outAt = (it, G, t) => { const k = it.filter((x) => x.c >= t), r = k.filter((x) => x.o === "right").length, w = k.filter((x) => x.o === "wrong").length; return { r, w, e: k.length - r - w, n: k.length, nd: G - r - w, asked: it.length - k.length }; };
  const line = (o, G) => `right ${f1(o.r / G * 100)} · wrong ${f1(o.w / G * 100)} · not done ${f1(o.nd / G * 100)} · extra ${o.e} · asked ${o.asked} of ${o.n + o.asked} produced`;

  const BINS = { vss: [-Infinity, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5, Infinity], sop: [-Infinity, 0.5, 0.7, 0.8, 0.9, 0.95, 0.99, Infinity] };
  const thr = {};
  for (const set of [HELD, ...sets.filter((s) => s !== HELD)]) {
    const rs = recs.filter((r) => r.set === set); if (!rs.length) continue;
    const G = rs.reduce((a, r) => a + r.gold, 0);
    console.log(`\n## ${set}: ${rs.length} messages, ${G} gold requests\n`);
    const C = {}, IT = {};
    for (const f of ["vss", "sop"]) {
      IT[f] = items(rs, f); C[f] = cum(IT[f]); const c = C[f], N = c.N;
      const [A, E] = aurc(c);
      console.log(`${R[f]}: ${N} produced · all executed: right ${f1(c.cr[N] / G * 100)} · wrong ${f1(c.cw[N] / G * 100)} · not done ${f1((G - c.cr[N] - c.cw[N]) / G * 100)} · extra ${Math.round(c.ce[N])} · AURC ${f3(A)} · E-AURC ${f3(E)} · AUROC ${f3(auroc(IT[f]))}`);
    }
    for (const f of ["vss", "sop"]) {
      const c = C[f], N = c.N;
      console.log(`\n${R[f]} risk-coverage (${set}; coverage = % of its ${N} produced requests executed; extras kept in brackets)\n\n| executed | right % of gold | wrong % of gold (extra) |\n|---|---|---|`);
      for (const x of [100, 95, 90, 85, 80, 75, 70, 60, 50, 40, 30, 20, 10]) { const k = N * x / 100; console.log(`| ${x}% | ${f1(at(c.cr, k) / G * 100)} | ${f1(at(c.cw, k) / G * 100)} (${Math.round(at(c.ce, k))}) |`); }
    }
    console.log(`\nRight at equal wrong (${set}; interpolated on each curve)\n\n| wrong % of gold | VSS right % | SOP-BERT right % |\n|---|---|---|`);
    for (const w of [VW, 10, 8, 6, 4, 2]) console.log(`| ${f1(w)} | ${["vss", "sop"].map((f) => { const k = kAtWrong(C[f], G, w); return `${f1(at(C[f].cr, k) / G * 100)} (${f1(k / C[f].N * 100)}% exec., extra ${Math.round(at(C[f].ce, k))})`; }).join(" | ")} |`);
    const vr = C.vss.cr[C.vss.N] / G * 100, kr = kAtRight(C.sop, G, vr);
    console.log(`\nSOP-BERT at VSS's full right (${f1(vr)}%): ${kr == null ? "not reached" : `wrong ${f1(at(C.sop.cw, kr) / G * 100)}%, extra ${Math.round(at(C.sop.ce, kr))}, ${f1(kr / C.sop.N * 100)}% of its produced requests executed`}`);
    for (const f of ["vss", "sop"]) {
      console.log(`\n${R[f]} calibration (${set})\n\n| confidence (n) | right % | wrong % / extra % |\n|---|---|---|`);
      const b = BINS[f];
      for (let i = b.length - 2; i >= 0; i--) { const z = IT[f].filter((x) => x.c >= b[i] && x.c < b[i + 1]); if (!z.length) continue;
        const p = (o) => f1(z.filter((x) => x.o === o).length / z.length * 100);
        console.log(`| ${b[i] === -Infinity ? "< " + b[i + 1] : b[i + 1] === Infinity ? ">= " + b[i] : `[${b[i]}, ${b[i + 1]})`} (${z.length}) | ${p("right")} | ${p("wrong")} / ${p("extra")} |`); }
    }
    if (set === HELD) {   // the thresholds, chosen here
      for (const f of ["vss", "sop"]) {
        const ts = [-Infinity, ...[...new Set(IT[f].map((x) => x.c))].sort((a, b) => a - b)];
        const best = (lam) => { let bt = -Infinity, bv = -Infinity; for (const t of ts) { const o = outAt(IT[f], G, t), v = o.r - lam * (o.w + o.e); if (v > bv + 1e-9) { bv = v; bt = t; } } return bt; };
        thr[f] = { T1: best(1), T2: best(2) };
        const all = outAt(IT[f], G, -Infinity);
        thr[f].T3 = all.w / G * 100 <= VW ? null : ts.find((t) => outAt(IT[f], G, t).w / G * 100 <= VW);
      }
      console.log(`\nThresholds chosen on ${set} (ask when confidence < t)`);
      for (const f of ["vss", "sop"]) for (const [k, t] of Object.entries(thr[f])) console.log(`  ${R[f]} ${k}: ${t == null ? "not needed (held-out wrong already <= " + VW + "%)" : `t = ${t === -Infinity ? "none (execute all)" : f3(t)} -> ${set}: ${line(outAt(IT[f], G, t), G)}`}`);
    } else if (Object.keys(thr).length) {
      console.log(`\nThresholds of ${HELD} applied to ${set}`);
      for (const f of ["vss", "sop"]) for (const [k, t] of Object.entries(thr[f])) if (t != null) console.log(`  ${R[f]} ${k} (t = ${t === -Infinity ? "none" : f3(t)}): ${line(outAt(IT[f], G, t), G)}`);
    }
  }
}
