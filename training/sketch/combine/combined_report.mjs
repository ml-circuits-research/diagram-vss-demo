// combine/combined_report.mjs: the combined reader of COMBINED_READER.md (SOP-BERT and VSS on one cut, paired; SOP-BERT's reading executed on a
// pair, the one that exists otherwise; its confidence: a logistic over the executing reader's own signals + agreement + the other reader's
// confidence), fitted on the fresh2 calibration part out of fold, for the BERT cut and the VSS cut; the report; EXPORT=1 also writes the demo's
// model docs/model/confidence/combined.json and the parity fixture training/sketch/combine/combined_parity.json.
//   [EXPORT=1] [VARIANT=d2] node training/sketch/combine/combined_report.mjs <records dir> <out.md> <data dir> [<data dir> ...]
//   VARIANT=d2: the combined reader's two logistic parts without their prior input (no act_prior in the 'sop' part, no world_prior in the
//   'vss' part): variant "(a) + d2 no prior" of confidence3/PLAN.md, the one the selection rule of fit3.mjs chose for the VSS-BERT column in
//   the refit of 2026-11-03 (calibration out-of-fold cost score 39.9 vs 38.1 for the plain recipe). Default: the plain recipe (a).
//   The readers alone (SOP-BERT, VSS: the checks against their shipped files) and other_conf (vss.json's recipe) keep their priors.
//   <records dir>: sop_own.jsonl, vss_own.jsonl, vss_bert.jsonl, sop_vss.jsonl of combine/collect_pair.mjs. <data dir>: fresh2/opus_a .. opus_d.
// The recipe and the statistics are copies of combine/combine_report.mjs (= fresh2/fit_report.mjs: percentile maps, prior, L2 grid by
// out-of-fold AUROC, 5 folds by message, the cost-score threshold on the out-of-fold calibration confidences, a tie keeps the higher
// threshold, the final model refit on all of the calibration part applied to the test part). Fitting and choosing: calibration part only.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { percentile } from "../precision_confidence.mjs";
import { pairValue } from "../layer_common.mjs";
import { canonWant } from "../../../docs/js/bench-canon.js";
import * as VC from "../../../docs/js/vss-confidence.js";

const [RECDIR, OUT, ...DATADIRS] = process.argv.slice(2);
if (!RECDIR || !OUT || !DATADIRS.length) { console.error("usage: combined_report.mjs <records dir> <out.md> <data dir>..."); process.exit(2); }
const REPO = new URL("../../../", import.meta.url).pathname;
const COST = 10, BOOT = 1000, SEED = 1, FOLDS = 5, LAMS = [0.01, 0.1, 1, 10], NPARITY = 200;
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const out = []; const log = (s = "") => out.push(s);
const pc = (x) => (Number.isFinite(x) ? (x * 100).toFixed(1) + "%" : "-"), f3 = (x) => (Number.isFinite(x) ? x.toFixed(3) : "-"), s1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : "-");

// ------------------------------------------------------------------ messages and their gold requests (collect_pair.mjs pairUp / outcomes)
const ROW = new Map();
for (const d of DATADIRS) for (const f of readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort())
  for (const r of readJ(`${d}/${f}`)) if (Array.isArray(r.wires) && !ROW.has(r.id)) ROW.set(r.id, r);
const isCal = (id) => BigInt("0x" + createHash("sha256").update(id).digest("hex")) % 3n === 0n;
const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
const GOLD = new Map();
function goldOf(id) {
  if (GOLD.has(id)) return GOLD.get(id);
  const row = ROW.get(id), used = new Set();
  const G = row.wires.map((w) => {
    let s0 = -1;
    if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); }
    return { s: s0, e: s0 < 0 ? -1 : s0 + w.span.length, act: actOf(w.type, w.args), want: canonWant(w.type, w.args), args: w.args };
  });
  GOLD.set(id, G); return G;
}
/** the outcome of every produced request of one message, all paired with the gold at once (collect_pair.mjs outcomes) */
function outcomesOf(id, prods) {
  const G = goldOf(id), row = ROW.get(id), res = prods.map(() => "extra");
  const pairs = pairValue({ text: row.text, gold: G, units: prods.map((p) => ({ c0: p.span[0], c1: p.span[1] })), prods: prods.map((p, i) => ({ act: p.pa, u: i, rawC: p.got })) });
  for (const [i, j] of pairs) res[i] = Object.entries(G[j].want).every(([k, v]) => (prods[i].got[k] ?? "∅") === v) ? "right" : "wrong";
  return res;
}

// ------------------------------------------------------------------ statistics (combine_report.mjs, copied)
function auroc(it) {
  const pos = it.filter((x) => x.ok).map((x) => x.c), neg = it.filter((x) => !x.ok).map((x) => x.c).sort((a, b) => a - b);
  if (!pos.length || !neg.length) return NaN;
  let s = 0; for (const p of pos) { let lo = 0, hi = neg.length; while (lo < hi) { const m = (lo + hi) >> 1; if (neg[m] < p) lo = m + 1; else hi = m; } let eq = lo; while (eq < neg.length && neg[eq] === p) eq++; s += lo + (eq - lo) / 2; }
  return s / (pos.length * neg.length);
}
function logistic(X, y, lam, iters = 200) {
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
function fitTable(vals, sign) {
  const v = vals.filter((x) => x != null).map((x) => x * sign).sort((a, b) => a - b), n = v.length;
  const binary = v.every((x) => x === 0 || Math.abs(x) === 1);
  const values = [], below = [];
  for (let i = 0; i < n; i++) if (i === 0 || v[i] !== v[i - 1]) { values.push(v[i]); below.push(i); }
  return { sign, binary, n, values, below };
}
function stats(items, G, t) {
  let r = 0, w = 0, e = 0, ar = 0, aw = 0;
  for (const x of items) { if (x.c >= t) { if (x.o === "right") r++; else if (x.o === "wrong") w++; else e++; } else if (x.o === "right") ar++; else if (x.o === "wrong") aw++; }
  const n = r + w + e, tr = r + ar, tw = w + aw;
  return { n, r, w, e, conf_wrong: n ? (w + e) / n : NaN, cov: G ? r / G : NaN, asked: G ? (ar + aw) / G : NaN, unread: G ? (G - tr - tw) / G : NaN, wrong_all: G ? tw / G : NaN, G };
}
const scoreOf = (st) => (st.G ? ((st.r - COST * (st.w + st.e)) / st.G) * 100 : NaN);
function costThreshold(oofItems, G, cost = COST) {   // cost: the price of one confident mistake in right answers (10: the demo's default)
  const s = oofItems.slice().sort((a, b) => b.c - a.c); let r = 0, bad = 0, best = { t: Infinity, score: 0, n: 0, kind: "asks everything" };
  for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") r++; else bad++; j++; }
    const sc = ((r - cost * bad) / G) * 100; if (sc > best.score + 1e-12) best = { t: s[i].c, score: sc, n: j, kind: "threshold" }; i = j; }
  const all = ((r - cost * bad) / G) * 100;
  if (best.kind === "threshold" && best.n === s.length) best = { t: -Infinity, score: best.score, n: s.length, kind: "executes everything" };
  else if (all > best.score + 1e-12) best = { t: -Infinity, score: all, n: s.length, kind: "executes everything" };
  return best;
}

// ------------------------------------------------------------------ signals and models
const VSS_NAMES = [["cut_start", 1], ["cut_end", 1], ["world_gap", 1], ["world_rank", 1], ["wnu_gap", 1], ["tie", 1], ["role_min", 1], ["residual", -1], ["unplaced", -1], ["abstain", -1], ["notu_frac", -1], ["ctx_fill", -1], ["ctx_margin", 1], ["world_prior", 1]];
const SOP_NAMES = [["act_p", 1], ["act_margin", 1], ["act_negent", 1], ["act_prior", 1], ["val_p_min", 1], ["val_margin_min", 1], ["none_p_min", 1], ["fill_p_min", 1], ["fill_margin_min", 1], ["ctx_fill", -1],
  ["tag_p_min", 1], ["tag_margin_min", 1], ["tag_all_min", 1], ["tag_stray", -1], ["desc_p_min", 1], ["desc_margin_min", 1], ["cut_start", 1], ["cut_end", 1], ["cut_inner_min", 1],
  ["unk_share", -1], ["split_share", -1], ["n_words", 1], ["n_roles", 1], ["n_units", 1]];
const COMB = [["agree", 1], ["agree_share", 1], ["other_conf", 1]];   // the combined reader's added inputs (COMBINED_READER.md 4)
const VARIANT = process.env.VARIANT || "a";
if (!["a", "d2"].includes(VARIANT)) throw new Error(`VARIANT=${VARIANT}: expected a (the plain recipe) or d2 (no prior input)`);
const noPrior = (names) => (VARIANT === "d2" ? names.filter(([n]) => n !== "act_prior" && n !== "world_prior") : names);   // the combined reader's parts only
const VARIANT_NAME = VARIANT === "d2" ? "(a) + d2 no prior" : "(a)";
const KIND = { vss: { prior: "world_prior", key: (x) => x.w || "none" }, sop: { prior: "act_prior", key: (x) => x.act } };
function fitModel(rows, spec, lam) {
  const K = KIND[spec.kind], names = spec.names, overall = rows.filter((x) => x.ok).length / rows.length, ar = {};
  for (const x of rows) { const k = K.key(x); (ar[k] ||= [0, 0]); ar[k][1]++; if (x.ok) ar[k][0]++; }
  const prior = Object.fromEntries(Object.entries(ar).map(([k, [r, n]]) => [k, (r + overall * 5) / (n + 5)]));
  const raw = (x, n) => (n === K.prior ? (prior[K.key(x)] ?? overall) : x.f[n]);
  const tables = Object.fromEntries(names.map(([n, s]) => [n, fitTable(rows.map((x) => raw(x, n)), s)]));
  const vec = (x) => names.map(([n]) => percentile(tables[n], raw(x, n)));
  const w = logistic(rows.map(vec), rows.map((x) => (x.ok ? 1 : 0)), lam);
  return { w, tables, prior, overall, names, lam, score: (x) => sigm(w, vec(x)) };
}
/** fit_report.mjs fitReader, with a hook that sets fold-dependent inputs (other_conf) before each fold's fit: prep(k) for fold k, prep(-1)
 *  for the final fit on all of the calibration items */
function fitReader(items, spec, prep = () => {}) {
  let best = null;
  for (const lam of LAMS) {
    const oof = new Array(items.length);
    for (let k = 0; k < FOLDS; k++) {
      prep(k);
      const tr = items.filter((x) => x.mi % FOLDS !== k);
      const m = fitModel(tr, spec, lam); items.forEach((x, i) => { if (x.mi % FOLDS === k) oof[i] = m.score(x); });
    }
    const a = auroc(items.map((x, i) => ({ c: oof[i], ok: x.ok })));
    if (!best || a > best.auc + 1e-9) best = { lam, auc: a, oof };
  }
  prep(-1);
  return { model: fitModel(items, spec, best.lam), lam: best.lam, oofAuc: best.auc, oof: best.oof };
}

// ------------------------------------------------------------------ records -> items
const REC = { sop_own: readJ(`${RECDIR}/sop_own.jsonl`), vss_own: readJ(`${RECDIR}/vss_own.jsonl`), vss_bert: readJ(`${RECDIR}/vss_bert.jsonl`), sop_vss: readJ(`${RECDIR}/sop_vss.jsonl`) };
const ids = REC.sop_own.map((r) => r.id);
for (const k of Object.keys(REC)) if (REC[k].map((r) => r.id).join() !== ids.join()) throw new Error(`${k}: message order differs from sop_own`);
const calIdx = new Map(); for (const id of ids) if (isCal(id) && !calIdx.has(id)) calIdx.set(id, calIdx.size);
const NG = new Map(REC.sop_own.map((r) => [r.id, r.gold]));
function itemsOf(recs, kind) {
  const items = [];
  recs.forEach((r) => (kind === "sop" ? r.sop : r.vss).forEach((x, j) => items.push({ id: r.id, j, cal: isCal(r.id), mi: calIdx.get(r.id) ?? -1, o: x.o, ok: x.o === "right", f: { ...x.f }, w: x.w, act: x.act,
    pa: kind === "sop" ? x.pa : x.a, got: x.got, span: x.span, args0: x.args0 })));
  return items;
}
const ITEMS = { sop_own: itemsOf(REC.sop_own, "sop"), vss_own: itemsOf(REC.vss_own, "vss"), vss_bert: itemsOf(REC.vss_bert, "vss"), sop_vss: itemsOf(REC.sop_vss, "sop") };
const byMsg = (items) => { const m = new Map(); items.forEach((x, i) => { if (!m.has(x.id)) m.set(x.id, []); m.get(x.id).push(i); }); return m; };
// check: outcomesOf on one reader's requests reproduces the recorded outcomes
{ let n = 0, diff = 0; for (const k of Object.keys(ITEMS)) for (const [id, ii] of byMsg(ITEMS[k])) { const res = outcomesOf(id, ii.map((i) => ITEMS[k][i])); ii.forEach((i, q) => { n++; if (res[q] !== ITEMS[k][i].o) diff++; }); }
  if (diff) throw new Error(`outcomesOf differs from the recorded outcomes on ${diff} of ${n} requests`);
  console.error(`check: outcomes recomputed for ${n} produced requests (4 record files) = the recorded ones`); }

// the VSS signals as the demo has them (vss-composer.js unit.signals: the VSS cutter's cut signals at the unit) and as the V-model reads them
const demoF = (x) => (x.f.cut_start_vss !== undefined ? { ...x.f, cut_start: x.f.cut_start_vss, cut_end: x.f.cut_end_vss } : x.f);

// agreement of S (SOP-BERT) with V (VSS) on each message (COMBINE.md B; V plays the gold of pairValue)
function agreement(S, V) {
  const res = S.map(() => ({ agree: 0, agree_share: 0, partner: -1 })), bs = byMsg(S), bv = byMsg(V);
  for (const [id, si] of bs) {
    const vi = bv.get(id) || []; if (!vi.length) continue;
    const text = ROW.get(id).text;
    const gold = vi.map((j) => ({ s: V[j].span[0], e: V[j].span[1], act: V[j].pa, want: V[j].got, args: V[j].args0 || {} }));
    const units = si.map((i) => ({ c0: S[i].span[0], c1: S[i].span[1] })), prods = si.map((i, u) => ({ act: S[i].pa, u, rawC: S[i].got }));
    for (const [a, b] of pairValue({ text, gold, units, prods })) {
      const x = S[si[a]], y = V[vi[b]];
      const keys = [...new Set([...Object.keys(x.got), ...Object.keys(y.got)])].filter((k) => k !== "action" && k !== "ask");
      const eq = keys.filter((k) => (x.got[k] ?? "∅") === (y.got[k] ?? "∅")).length, share = keys.length ? eq / keys.length : 1;
      res[si[a]] = { agree: share === 1 ? 1 : 0, agree_share: share, partner: vi[b] };
    }
  }
  return res;
}

// the VSS confidence inside the folds (COMBINED_READER.md 4: refitted with vss.json's recipe on the VSS-own-cut requests of the training folds)
const VSSJ = JSON.parse(readFileSync(`${REPO}docs/model/confidence/vss.json`, "utf8")), VSPEC = VC.specOf(VSSJ);
const VSS_SPEC = { kind: "vss", names: VSS_NAMES };
const vssCal = ITEMS.vss_own.filter((x) => x.cal);
const PARTNER = []; for (let k = 0; k < FOLDS; k++) PARTNER.push(fitModel(vssCal.filter((x) => x.mi % FOLDS !== k), VSS_SPEC, VSPEC.l2));
const partnerAll = fitModel(vssCal, VSS_SPEC, VSPEC.l2);
let vssRefitDiff = 0; for (const x of ITEMS.vss_own) vssRefitDiff = Math.max(vssRefitDiff, Math.abs(partnerAll.score(x) - VC.confidence(VSSJ, x.f, x.w)));
console.error(`check: vss.json's recipe refitted on all of the calibration part vs the shipped vss.json, max |confidence difference| over ${ITEMS.vss_own.length} requests = ${vssRefitDiff.toExponential(2)}`);
const vssShipped = (x) => VC.confidence(VSSJ, demoF(x), x.w);

// ------------------------------------------------------------------ the combined reader on one cut
const Gcal = ids.filter(isCal).reduce((a, id) => a + NG.get(id), 0), Gtest = ids.filter((id) => !isCal(id)).reduce((a, id) => a + NG.get(id), 0);
function combinedOn(cut, S, V) {
  const ag = agreement(S, V), taken = new Set(ag.filter((a) => a.partner >= 0).map((a) => a.partner));
  // the combined reader's produced requests: every SOP-BERT request, and the VSS requests no SOP-BERT request was paired with
  const sI = S.map((x, i) => ({ ...x, from: "sop", src: i, partner: ag[i].partner, f: { ...x.f, agree: ag[i].agree, agree_share: ag[i].agree_share, other_conf: 0 } }));
  const vI = V.map((x, i) => ({ ...x, from: "vss", src: i, partner: -1 })).filter((x) => !taken.has(x.src));
  // combined outcomes: all of the combined reader's requests of a message paired with the gold at once
  const all = sI.concat(vI);
  for (const [id, ii] of byMsg(all)) { const res = outcomesOf(id, ii.map((i) => all[i])); ii.forEach((i, q) => { all[i].o = res[q]; all[i].ok = res[q] === "right"; }); }
  const setOther = (k) => { for (const x of sI) x.f.other_conf = x.partner < 0 ? 0 : k < 0 ? vssShipped(V[x.partner]) : PARTNER[k].score({ f: demoF(V[x.partner]), w: V[x.partner].w }); };
  const specS = { kind: "sop", names: noPrior(SOP_NAMES.concat(COMB)) }, specV = { kind: "vss", names: noPrior(VSS_NAMES) };
  const sCal = sI.filter((x) => x.cal), vCal = vI.filter((x) => x.cal);
  const fitS = fitReader(sCal, specS, setOther), fitV = fitReader(vCal, specV);   // setOther(-1) last: the shipped vss.json for the final fit and the test part
  const calItems = sCal.map((x, i) => ({ c: fitS.oof[i], o: x.o, id: x.id, from: "sop", paired: x.partner >= 0, agree: x.f.agree })).concat(vCal.map((x, i) => ({ c: fitV.oof[i], o: x.o, id: x.id, from: "vss", paired: false, agree: 0 })));
  const tItems = sI.filter((x) => !x.cal).map((x) => ({ c: fitS.model.score(x), o: x.o, id: x.id, from: "sop", paired: x.partner >= 0, agree: x.f.agree }))
    .concat(vI.filter((x) => !x.cal).map((x) => ({ c: fitV.model.score(x), o: x.o, id: x.id, from: "vss", paired: false, agree: 0 })));
  const ct = costThreshold(calItems, Gcal);
  const c = { id: "comb_" + cut, cut, label: `combined (${cut === "bert" ? "BERT" : "VSS"} cut)`, fitS, fitV, sI, vI, S, V, calItems, tItems, ct, t: ct.t,
    auc: auroc(calItems.map((x) => ({ c: x.c, ok: x.o === "right" }))), aucT: auroc(tItems.map((x) => ({ c: x.c, ok: x.o === "right" }))) };
  return c;
}
function aloneOn(id, label, kind, items) {
  const spec = { kind, names: kind === "sop" ? SOP_NAMES : VSS_NAMES }, cal = items.filter((x) => x.cal), fit = fitReader(cal, spec);
  const calItems = cal.map((x, i) => ({ c: fit.oof[i], o: x.o, id: x.id })), tItems = items.filter((x) => !x.cal).map((x) => ({ c: fit.model.score(x), o: x.o, id: x.id }));
  const ct = costThreshold(calItems, Gcal);
  return { id, label, fit, calItems, tItems, ct, t: ct.t, auc: fit.oofAuc, aucT: auroc(tItems.map((x) => ({ c: x.c, ok: x.o === "right" }))) };
}
const CB = combinedOn("bert", ITEMS.sop_own, ITEMS.vss_bert), CV = combinedOn("vss", ITEMS.sop_vss, ITEMS.vss_own);
const SOP = aloneOn("sop", "SOP-BERT alone (own cut)", "sop", ITEMS.sop_own), VSS = aloneOn("vss", "VSS alone (own cut)", "vss", ITEMS.vss_own);
const SOPV = aloneOn("sop_v", "SOP-BERT alone (VSS cut)", "sop", ITEMS.sop_vss), VSSB = aloneOn("vss_b", "VSS alone (BERT cut)", "vss", ITEMS.vss_bert.map((x) => ({ ...x })));
const ALL = [CB, CV, SOP, VSS, SOPV, VSSB];
for (const c of ALL) { c.calSt = stats(c.calItems, Gcal, c.t); c.testSt = stats(c.tItems, Gtest, c.t); c.calAll = stats(c.calItems, Gcal, -Infinity); c.testAll = stats(c.tItems, Gtest, -Infinity); }
// the recommended cut (COMBINED_READER.md 1): the higher calibration out-of-fold cost score; a tie keeps the VSS cut
const BEST = scoreOf(CB.calSt) > scoreOf(CV.calSt) + 1e-12 ? CB : CV, OTHER = BEST === CB ? CV : CB;

// ------------------------------------------------------------------ bootstrap (combine_report.mjs, copied)
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const q = (a, z) => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.max(0, Math.floor(z * a.length)))] : NaN; };
function perMsg(itemsC, t, part) {
  const msgIds = ids.filter((id) => (part === "cal" ? isCal(id) : !isCal(id))), per = new Map(msgIds.map((id) => [id, { g: NG.get(id), r: 0, bad: 0 }]));
  for (const x of itemsC) if (x.c >= t) { const e = per.get(x.id); if (x.o === "right") e.r++; else e.bad++; }
  return msgIds.map((id) => per.get(id));
}
function bootScore(c, part) {
  const arr = perMsg(part === "cal" ? c.calItems : c.tItems, c.t, part), rand = rng(SEED), sc = [];
  for (let b = 0; b < BOOT; b++) { let g = 0, r = 0, bad = 0; for (let i = 0; i < arr.length; i++) { const e = arr[Math.floor(rand() * arr.length)]; g += e.g; r += e.r; bad += e.bad; } sc.push(((r - COST * bad) / g) * 100); }
  return [q(sc, 0.025), q(sc, 0.975)];
}
function bootDiff(c1, c0, part) {
  const a1 = perMsg(part === "cal" ? c1.calItems : c1.tItems, c1.t, part), a0 = perMsg(part === "cal" ? c0.calItems : c0.tItems, c0.t, part), rand = rng(SEED), d = [];
  for (let b = 0; b < BOOT; b++) { let g = 0, r1 = 0, b1 = 0, r0 = 0, b0 = 0; for (let i = 0; i < a1.length; i++) { const j = Math.floor(rand() * a1.length); g += a1[j].g; r1 += a1[j].r; b1 += a1[j].bad; r0 += a0[j].r; b0 += a0[j].bad; } d.push(((r1 - COST * b1) - (r0 - COST * b0)) / g * 100); }
  const p1 = scoreOf(part === "cal" ? c1.calSt : c1.testSt), p0 = scoreOf(part === "cal" ? c0.calSt : c0.testSt);
  return { point: p1 - p0, ci: [q(d, 0.025), q(d, 0.975)] };
}
const ci = (a) => `[${s1(a[0])}, ${s1(a[1])}]`;

// ------------------------------------------------------------------ report
const nCal = ids.filter(isCal).length, nTest = ids.length - nCal;
log(`Variant of the combined reader: ${VARIANT_NAME}${VARIANT === "d2" ? " (both parts without their prior input; confidence3/PLAN.md d2)" : " (the plain recipe)"}.`);
log(`Records: ${RECDIR} (combine/collect_pair.mjs, four passes). Calibration part ${nCal} messages / ${Gcal} requested actions; test part ${nTest} messages / ${Gtest} requested actions.`);
log(`Cost score = (right − ${COST} × (executed wrong + extras executed)) per 100 requested actions. "cal (oof)" = calibration part, out-of-fold confidences (everything fitted and chosen there). "test (already read; exploratory)" = the test part, scored once, never used to choose.`);
log(`Checks: outcomes recomputed from the records = the recorded ones; vss.json's recipe refitted on the whole calibration part vs the shipped file: max |confidence difference| ${vssRefitDiff.toExponential(2)}.\n`);
const thrTxt = (c) => (c.ct.kind === "threshold" ? c.t.toFixed(4) : c.ct.kind);
const table = (title, cols, rows) => { log(`\n${title}\n`); log(`| situation | ${cols.map((c) => c.label).join(" | ")} |`); log(`|---|${cols.map(() => "---").join("|")}|`); for (const [name, fn] of rows) log(`| ${name} | ${cols.map(fn).join(" | ")} |`); };
const gated = (part) => {
  const S = (c) => (part === "cal" ? c.calSt : c.testSt), tag = part === "cal" ? "cal (oof)" : "test (already read; exploratory)";
  return [[`cost score (${tag})`, (c) => `${s1(scoreOf(S(c)))} ${ci(bootScore(c, part))}`], [`done right % of requested (${tag})`, (c) => pc(S(c).cov)],
    [`confidently wrong % of executed (${tag})`, (c) => `${pc(S(c).conf_wrong)} (${S(c).w + S(c).e} of ${S(c).n})`], [`asked % (${tag})`, (c) => pc(S(c).asked)], [`extras executed (${tag})`, (c) => String(S(c).e)]];
};
const fitRows = [["produced requests (cal / test)", (c) => `${c.calItems.length} / ${c.tItems.length}`],
  ["L2 · AUROC (cal, oof)", (c) => (c.fitS ? `SOP-BERT part ${c.fitS.lam} · ${f3(c.fitS.oofAuc)}; VSS part ${c.fitV.lam} · ${f3(c.fitV.oofAuc)}; all ${f3(c.auc)}` : `${c.fit.lam} · ${f3(c.auc)}`)],
  ["AUROC (test, already read; exploratory)", (c) => f3(c.aucT)], ["cost-score threshold (chosen on cal, oof)", thrTxt]];
const allRows = (part) => { const S = (c) => (part === "cal" ? c.calAll : c.testAll), tag = part === "cal" ? "cal" : "test (already read; exploratory)";
  return [[`execute all: right / wrong / not done % + extras (${tag})`, (c) => `${pc(S(c).cov)} / ${pc(S(c).wrong_all)} / ${pc(S(c).unread)} + ${S(c).e}`]]; };

log(`## The recommended cut\n`);
log(`Combined reader, calibration out-of-fold cost score: BERT cut ${s1(scoreOf(CB.calSt))} ${ci(bootScore(CB, "cal"))}, VSS cut ${s1(scoreOf(CV.calSt))} ${ci(bootScore(CV, "cal"))} → recommended: **${BEST.cut === "bert" ? "the BERT cutter" : "the VSS cutter"}** (difference BERT − VSS ${s1(bootDiff(CB, CV, "cal").point)} ${ci(bootDiff(CB, CV, "cal").ci)}).`);
table("## The combined reader against each reader alone", [CB, CV, SOP, VSS, SOPV, VSSB], [...fitRows, ...allRows("cal"), ...gated("cal"), ...allRows("test"), ...gated("test")]);
const vs = (c1, c0) => { const d = bootDiff(c1, c0, "cal"), dt = bootDiff(c1, c0, "test"); return `${c1.label} − ${c0.label}: cal (oof) ${s1(d.point)} ${ci(d.ci)}${d.ci[0] > 0 ? " (interval above 0)" : d.ci[1] < 0 ? " (interval below 0)" : " (interval contains 0)"}; test (already read; exploratory) ${s1(dt.point)} ${ci(dt.ci)}`; };
log(`\n### Paired differences (95% bootstrap over messages, 1000 resamples, seed 1, each at its own threshold)\n`);
for (const [a, b] of [[BEST, SOP], [BEST, VSS], [OTHER, SOP], [OTHER, VSS]]) log(`- ${vs(a, b)}`);
log(`\nVerdict line (COMBINED_READER.md 6): the combined reader (${BEST.label}) is better than SOP-BERT alone on the calibration part: ${bootDiff(BEST, SOP, "cal").ci[0] > 0 ? "yes, the interval lies above 0" : "not shown, the interval does not lie above 0"}.`);

// what is executed, by kind
log(`\n## What the combined reader executes, by kind (at its threshold)\n`);
log(`| situation | ${[CB, CV].map((c) => `${c.label}, cal (oof)`).concat([CB, CV].map((c) => `${c.label}, test (already read; exploratory)`)).join(" | ")} |`); log(`|---|---|---|---|---|`);
const kinds = [["paired, agree", (x) => x.from === "sop" && x.paired && x.agree === 1], ["paired, do not agree", (x) => x.from === "sop" && x.paired && x.agree !== 1], ["SOP-BERT only", (x) => x.from === "sop" && !x.paired], ["VSS only", (x) => x.from === "vss"]];
for (const [name, fn] of kinds) {
  const cell = (c, part) => { const it = (part === "cal" ? c.calItems : c.tItems).filter(fn), ex = it.filter((x) => x.c >= c.t), r = ex.filter((x) => x.o === "right").length, rAll = it.filter((x) => x.o === "right").length;
    return `${it.length} produced (${pc(rAll / it.length)} right) · ${ex.length} executed, ${ex.length - r} of them wrong or extra`; };
  log(`| ${name} | ${[cell(CB, "cal"), cell(CV, "cal"), cell(CB, "test"), cell(CV, "test")].join(" | ")} |`);
}
const wts = (c) => { const n = c.fitS.model.names.length, w = c.fitS.model.w; return `agree ${w[n - 2].toFixed(2)}, agree_share ${w[n - 1].toFixed(2)}, other_conf ${w[n].toFixed(2)}`; };
log(`\nWeights of the added inputs in the final SOP-BERT part (percentile scale): BERT cut: ${wts(CB)}; VSS cut: ${wts(CV)}.`);

// ------------------------------------------------------------------ the balance (coordinator's request, 2026-11-02 22:1x): requests done right at
// equal confidently-wrong rates (the risk-coverage curve read at fixed rates), and the cost-score threshold at cost 5 and 20 (sensitivity)
/** the most requests done right (share of requested) over the thresholds (block ends of the confidence order) whose confidently-wrong rate
 *  (wrong + extras executed / executed) is at most `rate`; -> {cov, t, n, cw} or null */
function atRate(items, G, rate) {
  const s = items.slice().sort((a, b) => b.c - a.c); let r = 0, bad = 0, best = null;
  for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") r++; else bad++; j++; }
    if (bad / j <= rate + 1e-12 && (!best || r / G > best.cov)) best = { cov: r / G, t: s[i].c, n: j, cw: bad / j }; i = j; }
  return best;
}
/** the threshold of the calibration oof scores at another cost (costThreshold with COST replaced), and its operating point on both parts */
function costAt(c, cost) {
  const ct = costThreshold(c.calItems, Gcal, cost);
  return { t: ct.t, kind: ct.kind, score: ct.score, cal: stats(c.calItems, Gcal, ct.t), test: stats(c.tItems, Gtest, ct.t) };
}
{
  const cols = [BEST, SOP, OTHER, VSS], RATES = [0.01, 0.02, 0.03, 0.05, SOP.calSt.conf_wrong, SOP.testSt.conf_wrong];
  log(`\n## The balance: requests done right at the same confidently-wrong rate\n`);
  log(`Each cell: the largest share of the requested actions done right over the thresholds whose confidently-wrong rate (wrong + extras executed, of executed) is at most the rate; read off the calibration out-of-fold confidences, and off the test part (already read; exploratory) with the final models. These are best-case readings of each curve (the threshold is picked after seeing the outcomes), the same for every reader; the operating threshold of the demo is the cost-score one above. "-" = no threshold reaches the rate.\n`);
  for (const part of ["cal", "test"]) {
    const G = part === "cal" ? Gcal : Gtest, it = (c) => (part === "cal" ? c.calItems : c.tItems);
    log(`| confidently wrong at most (${part === "cal" ? "cal (oof)" : "test (already read; exploratory)"}) | ${cols.map((c) => c.label).join(" | ")} |`); log(`|---|${cols.map(() => "---").join("|")}|`);
    for (const rate of RATES) {
      const tag = rate === SOP.calSt.conf_wrong ? ` (SOP-BERT alone at its threshold, cal)` : rate === SOP.testSt.conf_wrong ? ` (SOP-BERT alone at its threshold, test)` : "";
      log(`| ${pc(rate)}${tag} | ${cols.map((c) => { const b = atRate(it(c), G, rate); return b ? `${pc(b.cov)} (${b.n} executed, ${pc(b.cw)} wrong)` : "-"; }).join(" | ")} |`);
    }
    log("");
  }
  log(`## The cost score's weight: the operating point at cost 5, 10 and 20 (threshold chosen on cal oof at that cost; the demo keeps cost 10)\n`);
  log(`| situation | ${[BEST, SOP].flatMap((c) => [5, 10, 20].map((k) => `${c.label}, cost ${k}`)).join(" | ")} |`); log(`|---|${[BEST, SOP].flatMap(() => [5, 10, 20]).map(() => "---").join("|")}|`);
  const P = [BEST, SOP].flatMap((c) => [5, 10, 20].map((k) => costAt(c, k)));
  log(`| threshold | ${P.map((x) => (Number.isFinite(x.t) ? x.t.toFixed(4) : String(x.t))).join(" | ")} |`);
  for (const [part, tag] of [["cal", "cal (oof)"], ["test", "test (already read; exploratory)"]]) {
    log(`| done right % (${tag}) | ${P.map((x) => pc(x[part].cov)).join(" | ")} |`);
    log(`| confidently wrong % of executed (${tag}) | ${P.map((x) => `${pc(x[part].conf_wrong)} (${x[part].w + x[part].e} of ${x[part].n})`).join(" | ")} |`);
    log(`| asked % (${tag}) | ${P.map((x) => pc(x[part].asked)).join(" | ")} |`);
  }
}

writeFileSync(OUT, out.join("\n") + "\n");
console.log(out.join("\n"));

// ------------------------------------------------------------------ EXPORT: docs/model/confidence/combined.json and the parity fixture
if (process.env.EXPORT === "1") {
  const part = (m, kind) => Object.assign({ l2: m.lam, intercept: m.w[0], features: m.names.map(([n], j) => ({ name: n, weight: m.w[j + 1] })), tables: m.tables },
    kind === "sop" ? { act_prior: m.prior, act_prior_default: m.overall } : { world_prior: m.prior, world_prior_default: m.overall });
  const lvl = (c) => ({ threshold: Number.isFinite(c.t) ? c.t : null, kind: c.ct.kind, cost: COST,
    calibration_oof: { score: scoreOf(c.calSt), score_ci95: bootScore(c, "cal"), confidently_wrong: c.calSt.conf_wrong, done_right: c.calSt.cov, asked: c.calSt.asked, executed: c.calSt.n, produced: c.calItems.length, extras_executed: c.calSt.e, auroc: c.auc },
    test_already_read_exploratory: { score: scoreOf(c.testSt), score_ci95: bootScore(c, "test"), confidently_wrong: c.testSt.conf_wrong, done_right: c.testSt.cov, asked: c.testSt.asked, executed: c.testSt.n, produced: c.tItems.length, extras_executed: c.testSt.e, auroc: c.aucT } });
  // the levels of the setting (owner, 2026-11-02 22:12): the cost-score optimum at cost 5 ("bolder"), 10 (the default) and 20 ("more careful"),
  // each chosen on the calibration out-of-fold confidences exactly as the default
  const costLevel = (c, cost) => { const x = costAt(c, cost), sc = (st) => ((st.r - cost * (st.w + st.e)) / st.G) * 100;
    return { threshold: Number.isFinite(x.t) ? x.t : null, kind: x.kind, cost, heldout_oof_score: x.score, heldout_oof_precision: x.cal.n ? 1 - x.cal.conf_wrong : null, heldout_oof_coverage: x.cal.cov,
      heldout_oof_asked: x.cal.asked, heldout_oof_executed: x.cal.n, heldout_produced: c.calItems.length, test_score: sc(x.test), test_confidently_wrong: x.test.n ? x.test.conf_wrong : null,
      test_done_right: x.test.cov, test_asked: x.test.asked, test_executed: x.test.n }; };
  const cutSpec = (c) => Object.assign({ levels: { cost5: costLevel(c, 5), cost: costLevel(c, COST), cost20: costLevel(c, 20) }, sop: part(c.fitS.model, "sop"), vss: Object.assign(part(c.fitV.model, "vss"), { cut_signals: c.cut === "bert" ? "the SOP-BERT cut head at the unit's edges (cut_start = P(B) of its first word; cut_end = 1 - P(I) of the word after its last, 1 at the end of the text)" : "the VSS world cutter's (vss-composer.js unit.signals)" }) }, lvl(c));
  const vv = JSON.parse(readFileSync(`${REPO}docs/model/versions.json`, "utf8")).files["confidence/vss.json"];
  const file = {
    about: `The combined reader's confidence (VSS + Neural, COMBINED_READER.md): SOP-BERT and VSS read the same cut, their requests are paired (layer_common.mjs pairValue, as COMBINE.md); on a pair SOP-BERT's reading is executed, otherwise the one that exists. Two logistic models: 'sop' (SOP-BERT executes: ${VARIANT === "d2" ? "its 23 signals without the act prior" : "its 24 signals with the act prior"}, plus agree, agree_share, other_conf) and 'vss' (a VSS request nothing was paired with: ${VARIANT === "d2" ? "VSS's 13 signals without the world prior" : "VSS's 14 signals with the world prior"}). Fitted on the fresh2 calibration part out of fold by training/sketch/combine/combined_report.mjs (EXPORT=1); browser code docs/js/combined-confidence.js (training/sketch/test_combined_confidence.mjs checks it). A refit replaces this file only; training/sketch/stamp_models.py gives it a new version.`,
    variant: VARIANT_NAME, variant_note: VARIANT === "d2" ? "Variant (a) + d2 of confidence3/PLAN.md: neither part reads its prior (act_prior / world_prior are not among the features; the prior tables are kept in the file but unused), chosen for the VSS-BERT column by the selection rule of confidence3/fit3.mjs (the highest calibration out-of-fold cost score) in the refit of 2026-11-03; exported with VARIANT=d2." : "The plain recipe (a): each part reads its prior.",
    protocol: `COMBINED_READER.md: calibration part only (${nCal} messages, ${Gcal} requested actions); 5 folds by message; percentile maps, prior and L2 (0.01, 0.1, 1, 10 by out-of-fold AUROC) per model; one threshold over all the combined requests, the cost-score optimum (one confident mistake = 10 right answers) on the out-of-fold confidences; inside the folds other_conf came from vss.json's recipe refitted on the training folds. The test part (${nTest} messages) is scored once, never used to choose: its numbers are exploratory. The clean confirmation needs a fresh set (fresh3).`,
    how_to: "Per cut: pair the requests (SOP-BERT produced side, VSS gold side of pairValue); agree_share = keys with equal canonical values / union of keys (action, ask excluded; empty union 1), agree = agree_share == 1; other_conf = vss.json's confidence of the paired VSS request on the VSS signals as the demo has them (0 when unpaired). confidence = 1/(1+exp(-(intercept + sum weight * percentile))) of the part that executes, percentile as vss-confidence.js (null -> 1). Execute when confidence >= threshold.",
    partner: { file: "confidence/vss.json", version: vv || null, note: "other_conf is computed with this file; a refit of vss.json needs a refit of this file" },
    cost: COST, best_cut: BEST.cut, levels: ["cost5", "cost", "cost20", "all"], default_level: "cost",
    levels_note: "Per cut, levels.cost (the default, = threshold) is the threshold that maximises the cost score with one confident mistake = 10 right answers on the calibration part's out-of-fold confidences; cost5 ('bolder': one mistake = 5 right answers) and cost20 ('more careful': = 20), chosen the same way. heldout_oof_*: the calibration part at that threshold; test_*: the test part (already read; exploratory).",
    cuts: { bert: cutSpec(CB), vss: cutSpec(CV) },
    readers_alone: Object.fromEntries([SOP, VSS].map((c) => [c.id, { label: c.label, threshold: c.t, calibration_oof_score: scoreOf(c.calSt), test_score: scoreOf(c.testSt) }])),
    comparison_calibration_oof: { vs_sop_bert: bootDiff(BEST, SOP, "cal"), vs_vss: bootDiff(BEST, VSS, "cal") },
  };
  writeFileSync(`${REPO}docs/model/confidence/combined.json`, JSON.stringify(file) + "\n");   // compact: the browser downloads it
  // the same two levels for the readers alone, added to their shipped files (nothing else in them changes): the recipe here reproduces their
  // fits (checked: the same cost-10 threshold as the file, and for VSS the same confidences)
  const VJ = JSON.parse(readFileSync(`${REPO}docs/model/confidence/vss.json`, "utf8")), BJ = JSON.parse(readFileSync(`${REPO}docs/model/confidence/sop-bert.json`, "utf8"));
  if (VJ.readers.vss_combined.levels.cost.threshold !== VSS.t || BJ.levels_out_of_fold.cost.threshold !== SOP.t || vssRefitDiff > 1e-12)
    throw new Error(`the readers alone do not reproduce their shipped files: VSS ${VSS.t} vs ${VJ.readers.vss_combined.levels.cost.threshold}, SOP-BERT ${SOP.t} vs ${BJ.levels_out_of_fold.cost.threshold}`);
  const note = " Levels cost5 ('bolder': one confident mistake counts as 5 right answers) and cost20 ('more careful': as 20): the cost-score optimum at that cost on the same out-of-fold calibration confidences (added 2026-11-02 by training/sketch/combine/combined_report.mjs EXPORT=1; the weights are unchanged).";
  for (const [J, L, c] of [[VJ, VJ.readers.vss_combined.levels, VSS], [BJ, BJ.levels_out_of_fold, SOP]]) { L.cost5 = costLevel(c, 5); L.cost20 = costLevel(c, 20); }
  if (!VJ.readers.vss_combined.levels_note.includes("cost5")) VJ.readers.vss_combined.levels_note += note;
  if (!BJ.levels_note.includes("cost5")) BJ.levels_note += note;
  writeFileSync(`${REPO}docs/model/confidence/vss.json`, JSON.stringify(VJ, null, 1) + "\n");
  writeFileSync(`${REPO}docs/model/confidence/sop-bert.json`, JSON.stringify(BJ, null, 1) + "\n");
  // the parity fixture: per cut, the first messages of the test part (data order) until NPARITY combined requests; the inputs as the
  // browser has them (SOP-BERT signals; VSS signals as vss-composer.js unit.signals, plus the SOP-BERT cut head's edges on the BERT cut)
  // and the script's confidence of every combined request (the final models)
  const fx = { about: "Inputs and the script's confidences for training/sketch/test_combined_confidence.mjs (written by combine/combined_report.mjs EXPORT=1).", cuts: {} };
  const keepS = new Set(SOP_NAMES.map(([n]) => n)), keepV = new Set(VSS_NAMES.map(([n]) => n));
  const pick = (f, keep) => Object.fromEntries(Object.entries(f).filter(([k]) => keep.has(k)));
  for (const c of [CB, CV]) {
    const msgs = []; let n = 0;
    for (const id of ids) {
      if (isCal(id) || n >= NPARITY) continue;
      const sIdx = c.S.map((x, i) => [x, i]).filter(([x]) => x.id === id), vIdx = c.V.map((x, i) => [x, i]).filter(([x]) => x.id === id);
      if (!sIdx.length && !vIdx.length) continue;
      const expect = [];
      for (const x of c.sI.filter((y) => y.id === id)) expect.push({ from: "sop", j: sIdx.findIndex(([, i]) => i === x.src), conf: c.fitS.model.score(x), agree: x.f.agree, agree_share: x.f.agree_share, other_conf: x.f.other_conf,
        partner: x.partner < 0 ? -1 : vIdx.findIndex(([, i]) => i === x.partner) });
      for (const x of c.vI.filter((y) => y.id === id)) expect.push({ from: "vss", j: vIdx.findIndex(([, i]) => i === x.src), conf: c.fitV.model.score(x) });
      msgs.push({ id, text: ROW.get(id).text,
        sop: sIdx.map(([x]) => ({ f: pick(x.f, keepS), act: x.act, pa: x.pa, got: x.got, span: x.span, args0: x.args0 })),
        vss: vIdx.map(([x]) => { const d = demoF(x), o = { f: pick(d, keepV), world: x.w, pa: x.pa, got: x.got, span: x.span, args0: x.args0 }; if (c.cut === "bert") o.bert_edges = { cut_start: x.f.cut_start ?? null, cut_end: x.f.cut_end ?? null }; return o; }),
        expect });
      n += expect.length;
    }
    fx.cuts[c.cut] = { threshold: Number.isFinite(c.t) ? c.t : null, requests: n, messages: msgs };
  }
  writeFileSync(`${REPO}training/sketch/combine/combined_parity.json`, JSON.stringify(fx) + "\n");
  console.error("EXPORT: wrote docs/model/confidence/combined.json and training/sketch/combine/combined_parity.json");
}
