// precision_bert.mjs: fits and measures the SOP-BERT confidences of PRECISION_BERT.md (plan written before the run).
//   node training/sketch/precision_bert.mjs <pb dir> <vss_items.json> <out dir>
//   <pb dir>: the records of precision_bert_collect.mjs (heldout, sample, short299, hand, blind, broad, seen, new_identities, heldout_formulations .jsonl)
//   <vss_items.json>: VSS combined items per set + out-of-fold held-out scores, from a copy of precision.mjs (see PRECISION_BERT.md)
//   <out dir>: numbers_bert.md, and training/sketch/precision_thresholds_bert.json is written.
import { readFileSync, writeFileSync } from "node:fs";
import { percentile, bertConfidence, bertTemperatureConfidence } from "./precision_confidence_bert.mjs";

const [PB, VSSF, OUT] = process.argv.slice(2);
const REPO = new URL("../../", import.meta.url).pathname;
const SIX = ["hand", "blind", "broad", "seen", "new_identities", "heldout_formulations"];
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const f1 = (x) => x.toFixed(1), f3 = (x) => x.toFixed(3), pc = (x) => (x * 100).toFixed(1);
const out = []; const log = (s = "") => out.push(s);

// ---------------------------------------------------------------- signals
const SIGNALS = [   // name, orientation (+1: higher = more confident, -1: lower = more confident; "free" ones start at +1 and the weight takes its sign), family
  ["act_p", 1, "act"], ["act_margin", 1, "act"], ["act_negent", 1, "act"], ["act_prior", 1, "act"],
  ["val_p_min", 1, "value"], ["val_margin_min", 1, "value"], ["none_p_min", 1, "value"],
  ["fill_p_min", 1, "fill"], ["fill_margin_min", 1, "fill"], ["ctx_fill", -1, "fill"],
  ["tag_p_min", 1, "tag"], ["tag_margin_min", 1, "tag"], ["tag_all_min", 1, "tag"], ["tag_stray", -1, "tag"],
  ["desc_p_min", 1, "desc"], ["desc_margin_min", 1, "desc"],
  ["cut_start", 1, "cut"], ["cut_end", 1, "cut"], ["cut_inner_min", 1, "cut"],
  ["unk_share", -1, "text"], ["split_share", -1, "text"], ["n_words", 1, "text"], ["n_roles", 1, "text"], ["n_units", 1, "text"],
];
const SIGN = Object.fromEntries(SIGNALS.map((s) => [s[0], s[1]]));
const FAMS = ["act", "value", "fill", "tag", "desc"];

// ---------------------------------------------------------------- statistics
function auroc(it) {
  const pos = it.filter((x) => x.ok).map((x) => x.c), neg = it.filter((x) => !x.ok).map((x) => x.c).sort((a, b) => a - b);
  if (!pos.length || !neg.length) return NaN;
  let s = 0; for (const p of pos) { let lo = 0, hi = neg.length; while (lo < hi) { const m = (lo + hi) >> 1; if (neg[m] < p) lo = m + 1; else hi = m; } let eq = lo; while (eq < neg.length && neg[eq] === p) eq++; s += lo + (eq - lo) / 2; }
  return s / (pos.length * neg.length);
}
function fitTable(vals, sign) {
  const v = vals.filter((x) => x != null).map((x) => x * sign).sort((a, b) => a - b), n = v.length;
  const binary = v.every((x) => x === 0 || Math.abs(x) === 1);   // values in {0, 1} (oriented: {0, -1})
  const values = [], below = [];
  for (let i = 0; i < n; i++) if (i === 0 || v[i] !== v[i - 1]) { values.push(v[i]); below.push(i); }
  return { sign, binary, n, values, below };
}
function logistic(X, y, lam, iters = 200) {   // IRLS, as precision.mjs (intercept unpenalised)
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
const MINEXEC = 50;
function operatingPoint(items, p) {
  const s = items.slice().sort((a, b) => b.c - a.c), cand = []; let right = 0;
  for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") right++; j++; } cand.push({ t: s[i].c, n: j, right, below: j < s.length ? s[j].c : null }); i = j; }
  for (let k = cand.length - 1; k >= 0; k--) if (cand[k].n >= MINEXEC && cand[k].right / cand[k].n >= p) return cand[k];
  return null;
}
function maxPrec(its) { const s = its.slice().sort((a, b) => b.c - a.c); let r = 0, best = 0; for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") r++; j++; } if (j >= MINEXEC && r / j > best) best = r / j; i = j; } return best; }
function stats(items, G, t) {
  let r = 0, w = 0, e = 0, ar = 0, aw = 0;
  for (const x of items) { if (x.c >= t) { if (x.o === "right") r++; else if (x.o === "wrong") w++; else e++; } else if (x.o === "right") ar++; else if (x.o === "wrong") aw++; }
  const n = r + w + e, tr = r + ar, tw = w + aw;
  return { n, r, w, e, prec: n ? r / n : NaN, cov: r / G, asked: (ar + aw) / G, unread: (G - tr - tw) / G, wrong: w / G, G };
}

// ---------------------------------------------------------------- records
const recs = { heldout: readJ(`${PB}/heldout.jsonl`), sample: readJ(`${PB}/sample.jsonl`), short299: readJ(`${PB}/short299.jsonl`) };
for (const s of SIX) recs[s] = readJ(`${PB}/${s}.jsonl`);
recs.six = SIX.flatMap((s) => recs[s]);
const SETNAMES = ["sample", "heldout", "short299", ...SIX, "six"];
const G = Object.fromEntries(SETNAMES.map((s) => [s, recs[s].reduce((a, r) => a + r.gold, 0)]));
const flat = (rs) => rs.flatMap((r, mi) => r.sop.map((x) => ({ mi, o: x.o, ok: x.o === "right", f: x.f, h: x.h, act: x.act, c0: x.c })));
const X = Object.fromEntries(SETNAMES.map((s) => [s, flat(recs[s])]));
const H = X.heldout;
log(`held-out split: ${recs.heldout.length} messages, ${G.heldout} requested, ${H.length} produced requests (${H.filter((x) => x.ok).length} right)`);

// ---------------------------------------------------------------- the rules
const FOLDS = 5, LAMS = [0.01, 0.1, 1, 10];
const softmax = (a, T = 1) => { const mx = Math.max(...a), e = a.map((x) => Math.exp((x - mx) / T)), z = e.reduce((p, q) => p + q, 0); return e.map((x) => x / z); };
const confT = (x, Ts) => { let c = 1; for (const [fam, l, i] of x.h) c = Math.min(c, softmax(l, Ts[fam] ?? Ts.all)[i]); return c; };
const GRID = Array.from({ length: 41 }, (_, i) => 0.5 * Math.pow(40, i / 40));   // 0.5 .. 20
const nll = (rows, Ts) => { let s = 0; for (const x of rows) { const p = Math.min(1 - 1e-6, Math.max(1e-6, confT(x, Ts))); s -= x.ok ? Math.log(p) : Math.log(1 - p); } return s; };
function fitT1(rows) { let bt = 1, bv = Infinity; for (const T of GRID) { const v = nll(rows, { all: T }); if (v < bv) { bv = v; bt = T; } } return { all: bt }; }
function fitT5(rows) {   // one T per family: coordinate descent over the grid from the global T, 3 passes
  const Ts = { ...fitT1(rows) }; for (const f of FAMS) Ts[f] = Ts.all;
  for (let pass = 0; pass < 3; pass++) for (const f of FAMS) { let bt = Ts[f], bv = nll(rows, Ts); for (const T of GRID) { const v = nll(rows, { ...Ts, [f]: T }); if (v < bv - 1e-9) { bv = v; bt = T; } } Ts[f] = bt; }
  return Ts;
}
// logistic over percentile features. names: the signals used; the maps (tables, act prior) are fitted on the fitting rows only
function fitLogistic(rows, names, lam) {
  const overall = rows.filter((x) => x.ok).length / rows.length, ar = {};
  for (const x of rows) { (ar[x.act] ||= [0, 0]); ar[x.act][1]++; if (x.ok) ar[x.act][0]++; }
  const prior = Object.fromEntries(Object.entries(ar).map(([k, [r, n]]) => [k, (r + overall * 5) / (n + 5)]));
  const raw = (x, n) => (n === "act_prior" ? (prior[x.act] ?? overall) : x.f[n]);
  const tables = Object.fromEntries(names.map((n) => [n, fitTable(rows.map((x) => raw(x, n)), SIGN[n])]));
  const vec = (x) => names.map((n) => percentile(tables[n], raw(x, n)));
  const w = logistic(rows.map(vec), rows.map((x) => (x.ok ? 1 : 0)), lam);
  return { names, tables, prior, overall, w, score: (x) => sigm(w, vec(x)) };
}
const foldOf = (x) => x.mi % FOLDS;
function oofLogistic(names, lam) { const o = new Array(H.length); for (let k = 0; k < FOLDS; k++) { const m = fitLogistic(H.filter((x) => foldOf(x) !== k), names, lam); H.forEach((x, i) => { if (foldOf(x) === k) o[i] = m.score(x); }); } return o; }
function oofTemp(fit) { const o = new Array(H.length); for (let k = 0; k < FOLDS; k++) { const Ts = fit(H.filter((x) => foldOf(x) !== k)); H.forEach((x, i) => { if (foldOf(x) === k) o[i] = confT(x, Ts); }); } return o; }
const aucOf = (scores) => auroc(H.map((x, i) => ({ c: scores[i], ok: x.ok })));

const ALL = SIGNALS.map((s) => s[0]), NOPRIOR = ALL.filter((n) => n !== "act_prior");
const cand = {};   // name -> {oof, auc, build(): final scorer}
cand["a: min of probabilities"] = { oof: H.map((x) => x.c0) };
cand["b1: temperature, one T"] = { oof: oofTemp(fitT1), fit: () => fitT1(H) };
cand["b2: temperature, one T per head family"] = { oof: oofTemp(fitT5), fit: () => fitT5(H) };
for (const [nm, names] of [["c1: logistic, all signals", ALL], ["c2: logistic, without act_prior", NOPRIOR]]) {
  let best = null;
  for (const lam of LAMS) { const o = oofLogistic(names, lam), a = aucOf(o); if (!best || a > best.a + 1e-9) best = { lam, a, o }; }
  cand[nm] = { oof: best.o, lam: best.lam, names };
}
for (const k of Object.keys(cand)) cand[k].auc = aucOf(cand[k].oof);
log("\n## selection: out-of-fold AUROC on held-out (5 folds cut by message; tables, act prior, temperature refitted inside each fold)\n");
log("| rule | out-of-fold AUROC | detail |\n|---|---|---|");
for (const [k, v] of Object.entries(cand)) log(`| ${k} | ${f3(v.auc)} | ${v.lam != null ? "L2 " + v.lam : v.fit ? "T " + JSON.stringify(Object.fromEntries(Object.entries(v.fit()).map(([a, b]) => [a, +b.toFixed(2)]))) : "no fitting"} |`);
const winnerName = Object.entries(cand).sort((a, b) => b[1].auc - a[1].auc)[0][0];
log(`\nwinner (best out-of-fold AUROC): ${winnerName}`);

// information only: single signals (AUROC on held-out, oriented), and stage subsets of the logistic (out-of-fold, best L2)
log("\n## single signals (AUROC on held-out, in the oriented direction; information only)\n\n| signal | AUROC | held-out values missing |\n|---|---|---|");
for (const n of ALL.filter((n) => n !== "act_prior")) {
  const it = H.map((x) => ({ c: x.f[n] == null ? Infinity : x.f[n] * SIGN[n], ok: x.ok })); log(`| ${n} | ${f3(auroc(it))} | ${H.filter((x) => x.f[n] == null).length} |`);
}
log("\n## stage subsets of the logistic (out-of-fold AUROC; information only)\n\n| signals | out-of-fold AUROC | L2 |\n|---|---|---|");
for (const fam of ["act", "value", "fill", "tag", "desc", "cut", "text"]) {
  const names = SIGNALS.filter((s) => s[2] === fam).map((s) => s[0]); let best = null;
  for (const lam of LAMS) { const a = aucOf(oofLogistic(names, lam)); if (!best || a > best.a) best = { a, lam }; }
  log(`| ${fam} only | ${f3(best.a)} | ${best.lam} |`);
}
for (const fam of ["act", "value", "fill", "tag", "desc", "cut", "text"]) {
  const names = ALL.filter((n) => SIGNALS.find((s) => s[0] === n)[2] !== fam); let best = null;
  for (const lam of LAMS) { const a = aucOf(oofLogistic(names, lam)); if (!best || a > best.a) best = { a, lam }; }
  log(`| all minus ${fam} | ${f3(best.a)} | ${best.lam} |`);
}

// ---------------------------------------------------------------- the final scorer of the winner (refit on all held-out)
const W = cand[winnerName];
let scorer, spec;
if (W.names) {
  const m = fitLogistic(H, W.names, W.lam);
  scorer = (x) => m.score(x);
  spec = { rule: "logistic", l2: W.lam, intercept: m.w[0], features: W.names.map((n, i) => ({ name: n, weight: m.w[i + 1] })), tables: m.tables, act_prior: m.prior, act_prior_default: m.overall };
  log("\nweights of the final model (each signal is a percentile in [0, 1]; intercept " + f3(m.w[0]) + "):\n");
  log("| signal | weight |\n|---|---|");
  for (const s of spec.features) log(`| ${s.name} | ${s.weight >= 0 ? "+" : ""}${f3(s.weight)} |`);
} else if (W.fit) {
  const Ts = W.fit(); scorer = (x) => confT(x, Ts);
  spec = { rule: "temperature", T: Ts }; log("\nfinal temperatures: " + JSON.stringify(Ts));
} else { scorer = (x) => x.c0; spec = { rule: "min" }; }

// ---------------------------------------------------------------- thresholds and per-set numbers
const PS = [0.95, 0.97, 0.99];
const Hfin = H.map((x) => ({ c: scorer(x), o: x.o }));
const Hoof = H.map((x, i) => ({ c: W.oof[i], o: x.o }));
const opOof = Object.fromEntries(PS.map((p) => [p, operatingPoint(Hoof, p)])), opIn = Object.fromEntries(PS.map((p) => [p, operatingPoint(Hfin, p)]));
const opMin = Object.fromEntries(PS.map((p) => [p, operatingPoint(H.map((x) => ({ c: x.c0, o: x.o })), p)]));
log("\n## thresholds (execute when confidence >= t; lowest t with held-out precision >= level and >= 50 executed)\n");
log("| level | t from out-of-fold scores | t from in-sample scores (reference) |\n|---|---|---|");
const cell = (o, items) => { if (!o) return "not reached"; const s = stats(items, G.heldout, o.t); return `${o.t.toFixed(4)} (held-out precision ${pc(s.prec)}, right ${pc(s.cov)}%, ${s.n} executed)`; };
for (const p of PS) log(`| ${p * 100} | ${cell(opOof[p], Hoof)} | ${cell(opIn[p], Hfin)} |`);
log(`\nthe winner's final model, scored in-sample on held-out, with the out-of-fold thresholds: ` + PS.map((p) => (opOof[p] ? `${p * 100}: precision ${pc(stats(Hfin, G.heldout, opOof[p].t).prec)}, right ${pc(stats(Hfin, G.heldout, opOof[p].t).cov)}%` : `${p * 100}: -`)).join(" · "));
log(`min of probabilities (today's SOP-BERT): highest held-out precision with >= ${MINEXEC} executed ${pc(maxPrec(H.map((x) => ({ c: x.c0, o: x.o }))))}%; levels reached: ${PS.filter((p) => opMin[p]).map((p) => p * 100).join(", ") || "none"}`);
log(`best possible with the winner, out-of-fold: highest held-out precision with >= ${MINEXEC} executed ${pc(maxPrec(Hoof))}%`);

// VSS combined (from the copy of precision.mjs)
const V = JSON.parse(readFileSync(VSSF, "utf8"));
const vOof = Object.fromEntries(PS.map((p) => [p, operatingPoint(V.oof, p)]));
log("\nVSS combined, for parity: thresholds from its own out-of-fold held-out scores vs the in-sample ones of PRECISION.md\n");
log("| level | out-of-fold t | in-sample t |\n|---|---|---|");
for (const p of PS) log(`| ${p * 100} | ${vOof[p] ? vOof[p].t.toFixed(4) : "not reached"} | ${V.op[p] ? V.op[p].t.toFixed(4) : "not reached"} |`);

const Vitems = Object.fromEntries(Object.entries(V.items).map(([s, it]) => [s, it]));
const itemsBert = (s) => X[s].map((x) => ({ c: scorer(x), o: x.o }));
const itemsMin = (s) => X[s].map((x) => ({ c: x.c0, o: x.o }));
const LABEL = { sample: "sample1000 (SOP-BERT never saw it; VSS trained on it)", heldout: "held-out split (585 messages; SOP-BERT held out and the confidence fitted on it; VSS combined also fitted on it)", short299: "short held-out 299 commands (held out for SOP-BERT; trained on by the VSS cutter)", six: "the six template sets pooled (favour the Rules)" };
for (const s of SIX) LABEL[s] = `${s} (template set; favours the Rules)`;
const au = (items) => auroc(items.map((x) => ({ c: x.c, ok: x.o === "right" })));
function tableFor(s, p) {
  const ob = opOof[p], ov = vOof[p];
  const rb = ob ? stats(itemsBert(s), G[s], ob.t) : null, rv = ov ? stats(Vitems[s], G[s], ov.t) : null, rm = stats(itemsMin(s), G[s], -Infinity);
  const row = (nm, st) => `| ${nm} | ${st && st.n ? pc(st.prec) : "-"} · ${st ? pc(st.cov) : "0.0"} | ${st ? `${pc(st.asked)} · ${pc(st.unread)} · ${pc(st.wrong)} · ${st.e}` : "-"} |`;
  return [`\n### ${LABEL[s]}: ${G[s]} requested actions, ${p * 100}% operating point (thresholds from held-out out-of-fold scores)\n`, "| reader | precision of execution · right % of requests | asked % · unread % · executed wrong % · extras executed |", "|---|---|---|",
    row(`SOP-BERT fitted (${winnerName.split(":")[0]}, t=${ob ? ob.t.toFixed(3) : "-"})`, rb),
    row(`VSS combined (t=${ov ? ov.t.toFixed(3) : "-"})`, rv),
    row("SOP-BERT min of probabilities, executes all (no threshold reaches the level)", rm)].join("\n");
}
log("\n## per set at the 97% operating point");
for (const s of SETNAMES) log(tableFor(s, 0.97));
log("\n## the same at 95% and 99% (pooled view: sample, held-out, short 299, six)\n");
log("| set / level | SOP-BERT fitted: precision · right % | VSS combined: precision · right % |\n|---|---|---|");
for (const s of ["sample", "heldout", "short299", "six"]) for (const p of [0.95, 0.99]) {
  const a = opOof[p] ? stats(itemsBert(s), G[s], opOof[p].t) : null, b = vOof[p] ? stats(Vitems[s], G[s], vOof[p].t) : null;
  log(`| ${s} / ${p * 100} | ${a ? `${pc(a.prec)} · ${pc(a.cov)}` : "not reached"} | ${b ? `${pc(b.prec)} · ${pc(b.cov)}` : "not reached"} |`);
}
log("\n## AUROC of the confidence (right vs not right), all produced requests\n\n| set | SOP-BERT min · SOP-BERT fitted | VSS combined |\n|---|---|---|");
for (const s of SETNAMES) log(`| ${s} | ${f3(au(itemsMin(s)))} · ${f3(au(itemsBert(s)))} | ${f3(au(Vitems[s]))} |`);
log("\n## everything executed (no threshold)\n\n| set | precision · right % of requests | produced · extras |\n|---|---|---|");
for (const s of ["sample", "heldout", "short299", "six"]) { const st = stats(itemsMin(s), G[s], -Infinity); log(`| ${s} | ${pc(st.prec)} · ${pc(st.cov)} | ${st.n} · ${st.e} |`); }
log("\n## equal-precision reference (NOT the protocol: the threshold read off the set itself, >= 50 executed): highest right % of requests at precision >= 97%\n\n| set | SOP-BERT fitted | VSS combined |\n|---|---|---|");
const bestCov = (items, g, p) => { const o = operatingPoint(items, p); return o ? pc(o.right / g) : "not reached"; };
for (const s of ["sample", "heldout", "short299", "six"]) log(`| ${s} | ${bestCov(itemsBert(s), G[s], 0.97)} | ${bestCov(Vitems[s], G[s], 0.97)} |`);

// ---------------------------------------------------------------- export + verification
const point = (op, items) => Object.fromEntries(PS.map((p) => { const o = op[p]; if (!o) return [String(Math.round(p * 100)), null]; const st = stats(items, G.heldout, o.t); return [String(Math.round(p * 100)), { threshold: o.t, heldout_precision: st.prec, heldout_coverage: st.cov, heldout_executed: st.n, heldout_produced: items.length }]; }));
const exp = {
  protocol: "PRECISION_BERT.md: rule chosen by the best 5-fold out-of-fold AUROC on SOP-BERT's held-out split (585 messages, 1711 requested); threshold = lowest confidence whose held-out precision of execution is >= the level with >= 50 executed, read from the OUT-OF-FOLD scores; the final model (refit on all held-out) is applied unchanged elsewhere. Operating level 97.",
  winner: winnerName, operating_level: "97", heldout: { messages: recs.heldout.length, requested: G.heldout, produced: H.length },
  levels_out_of_fold: point(opOof, Hoof), levels_in_sample: point(opIn, Hfin),
  how_to: "Execute a request when confidence >= threshold. confidence = bertConfidence(spec, f, act) of precision_confidence_bert.mjs (rule logistic: z = intercept + sum(weight_i * percentile_i), 1/(1+exp(-z)); percentile as described in that file; the signals f come from precision_bert_collect.mjs `features`), or bertTemperatureConfidence(spec, heads) (rule temperature).",
  ...spec, threshold: opOof[0.97] ? opOof[0.97].t : null,
};
writeFileSync(`${REPO}training/sketch/precision_thresholds_bert.json`, JSON.stringify(exp));
const J = JSON.parse(readFileSync(`${REPO}training/sketch/precision_thresholds_bert.json`, "utf8"));
const pool = ["sample", "heldout", "short299", "six"].flatMap((s) => X[s]);
const pick = Array.from({ length: 200 }, (_, i) => pool[Math.floor(i * pool.length / 200)]);
const fromJson = (x) => (J.rule === "logistic" ? bertConfidence(J, x.f, x.act) : J.rule === "temperature" ? bertTemperatureConfidence(J, x.h) : x.c0);
let md = 0; for (const x of pick) md = Math.max(md, Math.abs(scorer(x) - fromJson(x)));
let dis = 0, tot = 0; for (const x of X.sample) { tot++; if ((scorer(x) >= opOof[0.97].t) !== (fromJson(x) >= J.threshold)) dis++; }
log(`\n## export check\n\nconfidence recomputed from precision_thresholds_bert.json alone on 200 produced requests: max abs difference ${md.toExponential(2)}; execute/ask decisions of the JSON threshold vs the script's on all ${tot} sample requests: ${dis} differ.`);
writeFileSync(`${OUT}/numbers_bert.md`, out.join("\n") + "\n");
console.log(out.join("\n"));
