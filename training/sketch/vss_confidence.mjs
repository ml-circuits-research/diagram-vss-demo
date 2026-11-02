// vss_confidence.mjs: a confidence for the VSS reader that sees every stage of the chain (VSS_CONFIDENCE.md; plan written before the run).
//   node training/sketch/vss_confidence.mjs collect <out.jsonl> <set> <dir> [<dir> ...]    [IDS=file] [HELDOUT=ids file] [LIMIT=n]
//       one line per message: {id, set, heldout, gold, vss: [{o: right|wrong|extra, w: world, f: {raw stage signals}}]}
//   node training/sketch/vss_confidence.mjs analyze <sample.jsonl> <heldout.jsonl> <short.jsonl> <short_split.jsonl> <rc dir with the SOP records>
// The composer and the context filler are only observed from outside (prototype wrappers in this file); no module is edited.
// The outcome definition is the one of risk_coverage.mjs (PAIR=value; the totals are checked against llm_score.mjs tally).
import { readFileSync, readdirSync, writeFileSync, appendFileSync } from "node:fs";

const [mode, ...args] = process.argv.slice(2);

// ------------------------------------------------------------------ collect
async function collect([out, set, ...dirs]) {
  process.env.LLM_SCORE_LIB = "1"; process.env.SEG ||= "composer"; process.env.PAIR ||= "value";
  const { vssFormalize, tally } = await import("./llm_score.mjs");
  const { Composer } = await import("../../docs/js/vss-composer.js");
  const { Context } = await import("../../docs/js/vss-context.js");
  const FRONT = await import("../../docs/js/front.js");
  const { canon, canonWant } = await import("../../docs/js/bench-canon.js");
  const { pairValue } = await import("./layer_common.mjs");

  // observe the composer's units + both cutters' scores for the message, and the context filler's steps
  let ST = [];
  const origStep = Context.prototype.step;
  Context.prototype.step = function (raw, c0, c1, opts) { const r = origStep.apply(this, arguments); if (!(opts && opts.dry)) ST.push({ c0, c1, r }); return r; };
  const origF = Composer.prototype.formalizeCutter;
  Composer.prototype.formalizeCutter = function (text, ctx = {}, opts = {}) {
    ST = [];
    const o = origF.apply(this, arguments), canvas = ctx.names || [];
    const [toks] = FRONT.tokenize(text, canvas), words = toks.map((x) => x[0]);
    const C = this.cutter, cs = FRONT.segDecodeLabels(words, C.segmenter, C.labels).scores;
    const E = this.eventCutter, es = E ? FRONT.segDecodeLabels(words, E.segmenter, E.labels).scores : null;
    globalThis.__obs = { units: o.units, toks, cs, es, C, E, ST: ST.slice() };
    return o;
  };

  const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
  function pairUp(mains, gold, row) {
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
  const maxOf = (sc, labs) => Math.max(...labs.map((l) => sc[l]));
  function features(n) {
    const ob = globalThis.__obs, u = (ob.units || []).find((x) => n.span && x.c0 === n.span[0] && x.c1 === n.span[1] && x.vss);
    if (!u) return { w: null, f: { found: 0 } };
    const f = { found: 1 };
    // cut: scores at the unit's first token and at the token after its last
    const k = ob.toks.findIndex(([, s]) => s === u.c0), kEnd = ob.toks.findIndex(([, , e]) => e === u.c1);
    const Bw = ob.C.labels.filter((l) => l.startsWith("B-")), IO = ["I", "O"];
    if (k >= 0) f.cut_start = maxOf(ob.cs[k], Bw) - maxOf(ob.cs[k], IO); else f.cut_start = null;
    if (kEnd >= 0 && kEnd + 1 < ob.toks.length) { const s = ob.cs[kEnd + 1]; f.cut_end = Math.max(maxOf(s, Bw), s.O) - s.I; } else f.cut_end = null;   // end of text: null (a clean end)
    // world: the cutter's candidates (u.candidates ranked by score), the chosen world, the words not understood of every tried world
    const cand = u.candidates || [], ch = cand.find((c) => c.world === u.world), others = cand.filter((c) => c.world !== u.world);
    f.world_gap = ch && others.length ? ch.score - Math.max(...others.map((c) => c.score)) : null;
    f.world_rank = cand.length && cand[0].world === u.world ? 1 : 0;
    const tr = u.tried || [], me = tr.find((t) => t.world === u.world), oth = tr.filter((t) => t.world !== u.world && t.event && t.notUnderstood < t.words);
    f.wnu_gap = me && oth.length ? Math.min(...oth.map((t) => t.notUnderstood)) - me.notUnderstood : 0;
    f.tie = 1 / (u.tie || 1);
    f.notu_frac = me && me.words ? me.notUnderstood / me.words : 1;
    // event: the event cutter at the unit's first token
    if (ob.es && k >= 0) {
      const sc = ob.es[k], B = ob.E.labels.filter((l) => l.startsWith("B-")), lab = "B-" + u.event;
      const best = B.reduce((a, l) => (sc[l] > sc[a] ? l : a), B[0]);
      f.event_agree = best === lab ? 1 : 0;
      f.event_gap = sc[lab] !== undefined ? sc[lab] - Math.max(...B.filter((l) => l !== lab).map((l) => sc[l])) : null;
    } else { f.event_agree = 0; f.event_gap = null; }
    // roles: the reader's margins
    const mg = u.vss.margins || {}, rm = Object.entries(mg).filter(([key]) => key !== "structure" && key !== "event").map(([, v]) => +v).filter(Number.isFinite);
    const all = Object.values(mg).map(Number).filter(Number.isFinite);
    f.event_margin = Number.isFinite(+mg.event) ? +mg.event : null;
    f.role_min = rm.length ? Math.min(...rm) : null;      // no role margin: null (nothing to doubt)
    f.margin_min = all.length ? Math.min(...all) : 0;     // the old confidence (risk_coverage.mjs)
    f.residual = Number.isFinite(+u.vss.residual) ? +u.vss.residual : 0;
    f.unplaced = (u.vss.unplaced || []).length;
    f.abstain = u.vss.status === "ok" ? 0 : 1;
    // context: the filler's gaps of this unit
    const st = ob.ST.filter((s) => s.c0 === u.c0 && s.c1 === u.c1).pop(), gaps = st && st.r ? st.r.gaps : [];
    const fills = gaps.filter((g) => g.decision === "fill"), fm = fills.map((g) => g.margin).filter((m) => Number.isFinite(m));
    f.ctx_fill = fills.length;
    f.ctx_margin = fm.length ? Math.min(...fm) : null;
    f.ctx_left = gaps.filter((g) => g.decision === "left").length;
    return { w: u.world, f };
  }

  const IDS = process.env.IDS ? new Set(readFileSync(process.env.IDS, "utf8").split(/\s+/).filter(Boolean)) : null;
  const HELD = process.env.HELDOUT ? new Set(readFileSync(process.env.HELDOUT, "utf8").split(/\s+/).filter(Boolean)) : new Set();
  const LIMIT = process.env.LIMIT ? +process.env.LIMIT : Infinity;
  const blank = () => ({ exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0, byAct: {} });
  const tot = blank(), mine = { right: 0, wrong: 0, extra: 0 };
  writeFileSync(out, "");
  let done = 0; const seen = new Set();
  for (const d of dirs) {
    const files = readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort();
    const rows = files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)))
      .filter((r) => Array.isArray(r.wires) && (!IDS || IDS.has(r.id)) && !seen.has(r.id)).slice(0, LIMIT);
    for (const r of rows) {
      seen.add(r.id);
      const ctx = { names: (r.names || []).slice(), last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null };
      globalThis.__obs = null;
      const vn = vssFormalize(r.text, ctx);
      const rec = { id: r.id, set, heldout: HELD.has(r.id), gold: r.wires.length, vss: [] };
      const { mains, res } = outcomes(vn, r);
      mains.forEach((x, i) => { const { w, f } = features(x.n); rec.vss.push({ o: res[i], w, f }); mine[res[i]]++; });
      tally(tot, vn, r);
      appendFileSync(out, JSON.stringify(rec) + "\n");
      if (++done % 200 === 0) console.error(`${done} messages (${set})`);
    }
  }
  if (tot.right !== mine.right || tot.wrongAligned !== mine.wrong || tot.extra !== mine.extra) throw new Error(`outcomes ${JSON.stringify(mine)} differ from tally ${tot.right}/${tot.wrongAligned}/${tot.extra}`);
  const p = (x) => (x / tot.gold * 100).toFixed(1);
  console.log(`${set} vss: ${done} messages, ${tot.gold} gold · right ${p(tot.right)} · wrong ${p(tot.wrongAligned)} · not done ${p(tot.missed)} · extra ${tot.extra} (checked against tally)`);
}

// ------------------------------------------------------------------ analyze
const f1 = (x) => x.toFixed(1), f3 = (x) => x.toFixed(3);
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));

// signals: name, stage, sign (+1 higher raw = more confident, -1 lower raw = more confident), null raw = "nothing to doubt" (most confident)
const SIGNALS = [
  ["cut_start", "cut", 1], ["cut_end", "cut", 1],
  ["world_gap", "world", 1], ["world_rank", "world", 1], ["wnu_gap", "world", 1], ["tie", "world", 1],
  ["event_gap", "event", 1], ["event_agree", "event", 1], ["event_margin", "event", 1],
  ["role_min", "roles", 1], ["residual", "roles", -1], ["unplaced", "roles", -1], ["abstain", "roles", -1],
  ["notu_frac", "words", -1],
  ["ctx_fill", "context", -1], ["ctx_margin", "context", 1],
];
const REF = [["margin_min", "reference (old)", 1]];
const STAGES = ["cut", "world", "event", "roles", "words", "context"];

function auroc(it) {   // it: [{c, ok}]
  const pos = it.filter((x) => x.ok).map((x) => x.c), neg = it.filter((x) => !x.ok).map((x) => x.c).sort((a, b) => a - b);
  if (!pos.length || !neg.length) return NaN;
  let s = 0; for (const p of pos) { let lo = 0, hi = neg.length; while (lo < hi) { const m = (lo + hi) >> 1; if (neg[m] < p) lo = m + 1; else hi = m; } let eq = lo; while (eq < neg.length && neg[eq] === p) eq++; s += lo + (eq - lo) / 2; }
  return s / (pos.length * neg.length);
}
// percentile map fitted on a list of raw values (oriented so higher = more confident); null -> 1
function fitMap(vals, sign) {
  const v = vals.filter((x) => x != null).map((x) => x * sign).sort((a, b) => a - b), n = v.length;
  const bin = new Set(v).size <= 2;   // binary signals stay 0/1
  return (x) => {
    if (x == null) return 1;
    const y = x * sign;
    if (bin) return sign > 0 ? (y > 0 ? 1 : 0) : (y > -0.5 ? 1 : 0);
    let lo = 0, hi = n; while (lo < hi) { const m = (lo + hi) >> 1; if (v[m] < y) lo = m + 1; else hi = m; }
    let eq = lo; while (eq < n && v[eq] === y) eq++;
    return n ? (lo + (eq - lo) / 2) / n : 0.5;
  };
}
function flat(recs) { return recs.flatMap((r, mi) => r.vss.map((x) => ({ msg: r.id, mi, o: x.o, ok: x.o === "right", w: x.w, f: x.f }))); }

function logistic(X, y, lam, iters = 200) {   // IRLS (Newton), intercept unpenalised; X: n x d in [0,1]
  const n = X.length, d = X[0].length, w = new Array(d + 1).fill(0);
  const solve = (A, b) => { const m = b.length; for (let i = 0; i < m; i++) { let p = i; for (let r = i + 1; r < m; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r; [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
    for (let r = i + 1; r < m; r++) { const q = A[r][i] / A[i][i]; for (let c = i; c < m; c++) A[r][c] -= q * A[i][c]; b[r] -= q * b[i]; } }
    const x = new Array(m).fill(0); for (let i = m - 1; i >= 0; i--) { let s = b[i]; for (let c = i + 1; c < m; c++) s -= A[i][c] * x[c]; x[i] = s / A[i][i]; } return x; };
  for (let it = 0; it < iters; it++) {
    const g = new Array(d + 1).fill(0), H = Array.from({ length: d + 1 }, () => new Array(d + 1).fill(0));
    for (let i = 0; i < n; i++) {
      let z = w[0]; for (let j = 0; j < d; j++) z += w[j + 1] * X[i][j];
      const p = 1 / (1 + Math.exp(-z)), e = p - y[i], s = Math.max(p * (1 - p), 1e-6);
      g[0] += e; H[0][0] += s; for (let j = 0; j < d; j++) { g[j + 1] += e * X[i][j]; H[0][j + 1] += s * X[i][j]; H[j + 1][0] += s * X[i][j]; for (let k = 0; k < d; k++) H[j + 1][k + 1] += s * X[i][j] * X[i][k]; }
    }
    for (let j = 1; j <= d; j++) { g[j] += lam * w[j]; H[j][j] += lam; }
    const step = solve(H, g.slice()); let mx = 0; for (let j = 0; j <= d; j++) { w[j] -= step[j]; mx = Math.max(mx, Math.abs(step[j])); }
    if (mx < 1e-7) break;
  }
  return w;
}
const sigm = (w, x) => { let z = w[0]; for (let j = 0; j < x.length; j++) z += w[j + 1] * x[j]; return 1 / (1 + Math.exp(-z)); };

function analyze([sampleF, heldF, shortF, splitF, rcDir]) {
  const sample = readJ(sampleF), held = readJ(heldF), shortAll = readJ(shortF), split = readJ(splitF);
  const heldIds = new Set(split.filter((r) => r.set === "short_heldout299" || /heldout/.test(r.set)).map((r) => r.id));
  const short = shortAll.filter((r) => heldIds.has(r.id));
  const sets = { sample, heldout: held, short299: short };
  const out = [];
  const log = (s = "") => { out.push(s); console.log(s); };

  // -- fitting split: world prior, maps
  const H = flat(held);
  const wr = {}; for (const x of H) { const k = x.w || "none"; (wr[k] ||= [0, 0]); wr[k][1]++; if (x.ok) wr[k][0]++; }
  const overall = H.filter((x) => x.ok).length / H.length;
  const prior = (w) => { const e = wr[w || "none"]; return e ? (e[0] + overall * 5) / (e[1] + 5) : overall; };   // shrunk toward overall (5 pseudo-requests)
  const ALLSIG = SIGNALS.concat([["world_prior", "prior", 1]]);
  const maps = {};
  for (const [name, , sign] of ALLSIG.concat(REF)) maps[name] = fitMap(H.map((x) => (name === "world_prior" ? prior(x.w) : x.f[name])), sign);
  const rawv = (x, name) => (name === "world_prior" ? prior(x.w) : x.f[name]);
  const norm = (x, name) => maps[name](rawv(x, name));
  const vec = (x, names) => names.map((n) => norm(x, n));

  // -- reproduction check
  for (const [name, recs] of Object.entries(sets)) { const G = recs.reduce((a, r) => a + r.gold, 0), it = flat(recs), R = it.filter((x) => x.o === "right").length, W = it.filter((x) => x.o === "wrong").length;
    log(`check ${name}: ${recs.length} messages, ${G} gold, ${it.length} produced · right ${f1(R / G * 100)} · wrong ${f1(W / G * 100)} · not done ${f1((G - R - W) / G * 100)} · extra ${it.length - R - W}`); }

  // -- single signals: AUROC per set
  const single = (name, items) => auroc(items.map((x) => ({ c: norm(x, name), ok: x.ok })));
  const stageOf = Object.fromEntries(ALLSIG.concat(REF).map(([n, s]) => [n, s]));
  log("\n### single signals (AUROC; higher = ranks right above not-right)\n");
  log("| signal (stage) | held-out | sample | short299 |\n|---|---|---|---|");
  const rowsSingle = [];
  for (const [name] of REF.concat(ALLSIG)) { const a = Object.values(sets).map((r) => single(name, flat(r))); rowsSingle.push([name, a]); }
  // Object.values(sets) = sample, heldout, short299
  for (const [name, a] of rowsSingle) log(`| ${name} (${stageOf[name]}) | ${f3(a[1])} | ${f3(a[0])} | ${f3(a[2])} |`);
  const sigAU = Object.fromEntries(rowsSingle.map(([n, a]) => [n, { sample: a[0], heldout: a[1], short: a[2] }]));

  // -- rule (a): per stage, the best single signal on the fitting split; min over stages
  const best = {};
  for (const st of STAGES) { const cands = SIGNALS.filter((s) => s[1] === st).map((s) => s[0]); best[st] = cands.sort((a, b) => sigAU[b].heldout - sigAU[a].heldout)[0]; }
  const stNames = Object.values(best), allNames = SIGNALS.map((s) => s[0]);
  const minRule = (names) => (x) => Math.min(...names.map((n) => norm(x, n)));
  // -- rule (b): logistic; cross-validated on the fitting split by message
  const folds = 5, foldOf = (x) => x.mi % folds;
  const lamGrid = [0.01, 0.1, 1, 10];
  function cvAUC(names, lam) {
    const oof = new Array(H.length);
    for (let k = 0; k < folds; k++) {
      const tr = H.filter((x) => foldOf(x) !== k), te = H.map((x, i) => [x, i]).filter(([x]) => foldOf(x) === k);
      const w = logistic(tr.map((x) => vec(x, names)), tr.map((x) => (x.ok ? 1 : 0)), lam);
      for (const [x, i] of te) oof[i] = sigm(w, vec(x, names));
    }
    return auroc(H.map((x, i) => ({ c: oof[i], ok: x.ok })));
  }
  const variants = {
    "logistic all": SIGNALS.map((s) => s[0]).concat(["world_prior"]),
    "logistic no prior": SIGNALS.map((s) => s[0]),
    "logistic no margin signals (event_margin, role_min, residual, unplaced, abstain)": SIGNALS.map((s) => s[0]).filter((n) => !["event_margin", "role_min", "residual", "unplaced", "abstain"].includes(n)).concat(["world_prior"]),
  };
  for (const st of STAGES) { variants[`logistic stage ${st} only`] = SIGNALS.filter((s) => s[1] === st).map((s) => s[0]); variants[`logistic all minus ${st}`] = SIGNALS.filter((s) => s[1] !== st).map((s) => s[0]).concat(["world_prior"]); }
  variants["logistic prior only"] = ["world_prior"];
  const fitted = {};
  for (const [vn, names] of Object.entries(variants)) {
    let bl = lamGrid[0], ba = -1; for (const lam of lamGrid) { const a = cvAUC(names, lam); if (a > ba + 1e-9) { ba = a; bl = lam; } }
    const w = logistic(H.map((x) => vec(x, names)), H.map((x) => (x.ok ? 1 : 0)), bl);
    fitted[vn] = { names, lam: bl, cv: ba, w };
  }
  // -- all candidate rules, as functions of a request
  const rules = {};
  rules["old margin (margin_min)"] = (x) => norm(x, "margin_min");
  for (const n of allNames.concat(["world_prior"])) rules[`single ${n}`] = (x) => norm(x, n);
  rules[`min-stage (${stNames.join(", ")})`] = minRule(stNames);
  rules["min-all (all 16 signals)"] = minRule(allNames);
  for (const [vn, F] of Object.entries(fitted)) rules[vn] = (x) => sigm(F.w, vec(x, F.names));
  const auc = (rule, recs) => auroc(flat(recs).map((x) => ({ c: rule(x), ok: x.ok })));
  // selection AUROC on the fitting split: out-of-fold for fitted rules, in-split for the parameter-free ones
  const sel = {};
  for (const k of Object.keys(rules)) sel[k] = fitted[k] ? fitted[k].cv : auc(rules[k], held);
  log("\n### combinations (AUROC; the held-out column of a fitted rule is out-of-fold, 5 folds by message)\n");
  log("| rule | held-out (selection) | sample | short299 |\n|---|---|---|---|".replace("| short299 |", "| short299 |"));
  const order = Object.keys(rules).sort((a, b) => sel[b] - sel[a]);
  for (const k of order) if (!k.startsWith("single ") || true) log(`| ${k} | ${f3(sel[k])} | ${f3(auc(rules[k], sample))} | ${f3(auc(rules[k], short))} |`);
  // winner: best selection AUROC among all rules (old margin, singles, min rules, logistic variants)
  const winner = order[0];
  log(`\nWinner by held-out AUROC: ${winner}`);
  const WF = fitted[winner];
  if (WF) { log(`\nweights (L2 ${WF.lam}; features are percentiles in [0,1], intercept ${f3(WF.w[0])}):\n\n| signal (stage) | weight |\n|---|---|`);
    WF.names.forEach((n, i) => log(`| ${n} (${stageOf[n] || "prior"}) | ${WF.w[i + 1] >= 0 ? "+" : ""}${f3(WF.w[i + 1])} |`)); }
  const lw = fitted["logistic all"];
  log(`\nweights of "logistic all" (L2 ${lw.lam}, intercept ${f3(lw.w[0])}):\n\n| signal (stage) | weight |\n|---|---|`);
  lw.names.forEach((n, i) => log(`| ${n} (${stageOf[n] || "prior"}) | ${lw.w[i + 1] >= 0 ? "+" : ""}${f3(lw.w[i + 1])} |`));
  log(`\nworld prior (right-rate of produced requests on held-out): ${Object.entries(wr).map(([w, [r, n]]) => `${w} ${f1(r / n * 100)}% (${n})`).join(", ")}; overall ${f1(overall * 100)}%`);
  log(`stage signals used by min-stage: ${JSON.stringify(best)}`);

  // -- equal-wrong tables (curves per RISK_COVERAGE.md): VSS old margin, winner, SOP-BERT from the existing records
  function cum(it) {
    const s = it.slice().sort((a, b) => b.c - a.c), N = s.length, cr = [0], cw = [0], ce = [0];
    let i = 0;
    while (i < N) { let j = i; while (j < N && s[j].c === s[i].c) j++; const n = j - i, r = s.slice(i, j).filter((x) => x.o === "right").length, w = s.slice(i, j).filter((x) => x.o === "wrong").length, e = n - r - w;
      for (let k = 1; k <= n; k++) { cr.push(cr[i] + r * k / n); cw.push(cw[i] + w * k / n); ce.push(ce[i] + e * k / n); } i = j; }
    return { N, cr, cw, ce };
  }
  const at = (a, k) => { const k0 = Math.floor(k), k1 = Math.min(a.length - 1, k0 + 1), t = k - k0; return a[k0] * (1 - t) + a[k1] * t; };
  function kAtWrong(C, G, w) { const tgt = w * G / 100; if (C.cw[C.N] <= tgt) return C.N; let k = 0; while (k < C.N && C.cw[k + 1] <= tgt + 1e-9) k++; const d = C.cw[k + 1] - C.cw[k]; return d > 0 ? k + Math.min(1, (tgt - C.cw[k]) / d) : k; }
  const sopRecs = {};
  for (const [nm, f] of [["sample", "sample.jsonl"], ["heldout", "heldout.jsonl"], ["short299", "short_split.jsonl"]]) {
    let rs = readJ(`${rcDir}/${f}`); if (nm === "short299") rs = rs.filter((r) => heldIds.has(r.id));
    sopRecs[nm] = rs;
  }
  const wrongs = [11.4, 8, 6, 4, 2];
  function eqTable(nm, recs, rule) {
    const G = recs.reduce((a, r) => a + r.gold, 0), its = {
      "VSS old margin": flat(recs).map((x) => ({ c: x.f.margin_min, o: x.o })),
      [`VSS ${winner}`]: flat(recs).map((x) => ({ c: rule(x), o: x.o })),
      "SOP-BERT": sopRecs[nm].flatMap((r) => r.sop.map(([c, o]) => ({ c, o }))),
    };
    const C = Object.fromEntries(Object.entries(its).map(([k, v]) => [k, cum(v)]));
    log(`\n#### equal wrong, ${nm} (right % of gold at the same wrong % of gold; ${G} gold requests)\n\n| wrong % | ${Object.keys(C).join(" / ")} |\n|---|---|`);
    for (const w of wrongs) log(`| ${w} | ${Object.entries(C).map(([, c]) => f1(at(c.cr, kAtWrong(c, G, w)) / G * 100)).join(" / ")} |`);
    for (const [k, c] of Object.entries(C)) log(`  ${k}: all executed right ${f1(c.cr[c.N] / G * 100)} wrong ${f1(c.cw[c.N] / G * 100)} produced ${c.N}`);
  }
  log("\n### equal-wrong tables");
  eqTable("sample", sample, rules[winner]); eqTable("heldout", held, rules[winner]); eqTable("short299", short, rules[winner]);
  // SOP-BERT AUROC for reference
  for (const nm of Object.keys(sopRecs)) log(`SOP-BERT AUROC ${nm}: ${f3(auroc(sopRecs[nm].flatMap((r) => r.sop.map(([c, o]) => ({ c, ok: o === "right" })))))}`);

  // -- decomposition: lowest 20% of produced requests by each stage's signal (threshold from the fitting split)
  const FLAG = 0.20;
  // the largest value t such that at most FLAG of the fitting split has value <= t (ties never push the flagged share above FLAG); none: -1
  const flagThr = (vals) => { const v = vals.slice().sort((a, b) => a - b), n = v.length; let t = -1; for (let i = 0; i < n; i++) { let j = i; while (j < n && v[j] === v[i]) j++; if (j / n <= FLAG) t = v[i]; else break; i = j - 1; } return t; };
  log(`\n### decomposition: which of VSS's wrong / extra requests each stage's signal would flag (flag = its lowest ${FLAG * 100}% of requests, threshold from held-out)\n`);
  const stSig = Object.assign({}, best, { prior: "world_prior", "margin (old)": "margin_min" });
  const thr = {}; for (const [st, n] of Object.entries(stSig)) { thr[st] = flagThr(H.map((x) => norm(x, n))); }
  const thrWin = flagThr(H.map((x) => rules[winner](x)));
  for (const [nm, recs] of Object.entries(sets)) {
    const it = flat(recs), W = it.filter((x) => x.o === "wrong"), E = it.filter((x) => x.o === "extra"), R = it.filter((x) => x.o === "right");
    log(`\n${nm}: ${it.length} produced = ${R.length} right, ${W.length} wrong, ${E.length} extra\n\n| flagged by (signal) | wrong % / extra % | right % flagged |\n|---|---|---|`);
    const flagged = (x, st, n) => (st === "winner" ? rules[winner](x) <= thrWin : norm(x, n) <= thr[st]);
    const pct = (a, st, n) => (a.length ? f1(a.filter((x) => flagged(x, st, n)).length / a.length * 100) : "-");
    for (const [st, n] of Object.entries(stSig)) log(`| ${st} (${n}) | ${pct(W, st, n)} / ${pct(E, st, n)} | ${pct(R, st, n)} |`);
    log(`| winner (${winner}) | ${pct(W, "winner")} / ${pct(E, "winner")} | ${pct(R, "winner")} |`);
    const stagesOnly = STAGES.map((s) => [s, best[s]]);
    const anyStage = (x) => stagesOnly.some(([s, n]) => norm(x, n) <= thr[s]);
    const noneStage = (a) => (a.length ? f1(a.filter((x) => !anyStage(x)).length / a.length * 100) : "-");
    log(`| none of the six stages | ${noneStage(W)} / ${noneStage(E)} | ${noneStage(R)} |`);
    const uniq = (s) => { const n = best[s], only = (x) => norm(x, n) <= thr[s] && stagesOnly.every(([t, m]) => t === s || norm(x, m) > thr[t]); return `${f1(W.filter(only).length / W.length * 100)}`; };
    log(`\nwrong requests flagged by this stage ALONE (% of wrong): ${STAGES.map((s) => `${s} ${uniq(s)}`).join(", ")}`);
  }
  if (process.env.OUT) writeFileSync(process.env.OUT, out.join("\n") + "\n");
}

if (mode === "collect") await collect(args); else if (mode === "analyze") analyze(args);
else { console.error("usage: vss_confidence.mjs collect <out> <set> <dir>... | analyze <sample> <heldout> <short> <short_split> <rcdir>"); process.exit(2); }
