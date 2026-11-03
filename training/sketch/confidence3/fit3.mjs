// confidence3/fit3.mjs: the fits, the diagnosis and the report of confidence3/PLAN.md. Five readers (columns): Rules (own cut, executes
// everything), VSS (own cut), SOP-BERT (own = BERT cut), VSS-BERT (BERT cut, COMBINED_READER.md) and the 3-vote (Rules + VSS + SOP-BERT on
// the BERT cut); methods (a) current recipes, (b) the vote with no fitted weights, (c) the vote as inputs of the logistics, (d) the fixes of
// the closed menu (d1 engine-true agreement, d2 no prior, d3 prior shrinkage k = 50, d5 per-type thresholds); selection on the calibration
// part out of fold; the verdict on the test part (paired bootstrap, 1000 resamples of messages, seed 1).
//   [SHORT_NAMES="a b" SHORT_REC="<records dir a> <records dir b>" SHORT_DATA="<data dir a> <data dir b>"] [EXPORT=1] node training/sketch/confidence3/fit3.mjs <records dir> <out.md> <data dir> [<data dir> ...]
//   <records dir>: sop_own, vss_own, vss_bert, sop_vss (combine/collect_pair.mjs), rules_own, rules_bert, rules_vss (collect_rules3.mjs).
//   <data dir>: the annotated messages (fresh2/opus_a..d; tomorrow also llm_bench/short3/*): split int(sha256(id),16) % 3 == 0 -> calibration.
//   SHORT_*: extra evaluation sets (short commands), one name / records dir / data dir each (evaluation only, never fitted on).
//   EXPORT=1: writes docs/model/confidence/vote3.json (the chosen method per column, the models and thresholds) and
//   training/sketch/confidence3/vote3_parity.json (inputs + the script's confidences, for test_vote_confidence.mjs).
// The recipe and the statistics are copies of combine/combined_report.mjs (= fresh2/fit_report.mjs).
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { percentile } from "../precision_confidence.mjs";
import { pairValue } from "../layer_common.mjs";
import { canonWant } from "../../../docs/js/bench-canon.js";
import * as VC from "../../../docs/js/vss-confidence.js";
import { engineNorm } from "../../../docs/js/vote-confidence.js";

const [RECDIR, OUT, ...DATADIRS] = process.argv.slice(2);
if (!RECDIR || !OUT || !DATADIRS.length) { console.error("usage: fit3.mjs <records dir> <out.md> <data dir>..."); process.exit(2); }
const REPO = new URL("../../../", import.meta.url).pathname;
const COST = 10, BOOT = 1000, SEED = 1, FOLDS = 5, LAMS = [0.01, 0.1, 1, 10];
const words = (k) => (process.env[k] || "").split(/\s+/).filter(Boolean), SHORT_REC = words("SHORT_REC"), SHORT_DATA = words("SHORT_DATA");
const SHORT_NAMES = words("SHORT_NAMES").length ? words("SHORT_NAMES") : SHORT_REC.map((_, i) => `short${i + 1}`);
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const out = []; const log = (s = "") => out.push(s);
const pc = (x) => (Number.isFinite(x) ? (x * 100).toFixed(1) + "%" : "-"), f3 = (x) => (Number.isFinite(x) ? x.toFixed(3) : "-"), s1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : "-");

// ------------------------------------------------------------------ messages and gold
const ROW = new Map();
for (const d of DATADIRS.concat(SHORT_DATA)) for (const f of readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort())
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
function outcomesOf(id, prods) {
  const G = goldOf(id), row = ROW.get(id), res = prods.map(() => "extra");
  const pairs = pairValue({ text: row.text, gold: G, units: prods.map((p) => ({ c0: p.span[0], c1: p.span[1] })), prods: prods.map((p, i) => ({ act: p.pa, u: i, rawC: p.got })) });
  for (const [i, j] of pairs) res[i] = Object.entries(G[j].want).every(([k, v]) => (prods[i].got[k] ?? "∅") === v) ? "right" : "wrong";
  return res;
}

// ------------------------------------------------------------------ statistics (combined_report.mjs, copied; thresholds may be per type)
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
const grpOf = (pa) => (String(pa).startsWith("question:") ? "question" : "command");
const tOf = (T, x) => (T[grpOf(x.pa)] ?? T.all);
function stats(items, G, T) {
  let r = 0, w = 0, e = 0, ar = 0, aw = 0;
  for (const x of items) { if (x.c >= tOf(T, x)) { if (x.o === "right") r++; else if (x.o === "wrong") w++; else e++; } else if (x.o === "right") ar++; else if (x.o === "wrong") aw++; }
  const n = r + w + e, tr = r + ar, tw = w + aw;
  return { n, r, w, e, conf_wrong: n ? (w + e) / n : NaN, prec: n ? r / n : NaN, cov: G ? r / G : NaN, asked: G ? (ar + aw) / G : NaN, unread: G ? (G - tr - tw) / G : NaN, wrong_all: G ? tw / G : NaN, G };
}
const scoreOf = (st, cost = COST) => (st.G ? ((st.r - cost * (st.w + st.e)) / st.G) * 100 : NaN);
function costThreshold(items, G, cost = COST) {
  const s = items.slice().sort((a, b) => b.c - a.c); let r = 0, bad = 0, best = { t: Infinity, score: 0, n: 0, kind: "asks everything" };
  for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") r++; else bad++; j++; }
    const sc = ((r - cost * bad) / G) * 100; if (sc > best.score + 1e-12) best = { t: s[i].c, score: sc, n: j, kind: "threshold" }; i = j; }
  const all = ((r - cost * bad) / G) * 100;
  if (best.kind === "threshold" && best.n === s.length) best = { t: -Infinity, score: best.score, n: s.length, kind: "executes everything" };
  else if (all > best.score + 1e-12) best = { t: -Infinity, score: all, n: s.length, kind: "executes everything" };
  return best;
}
/** the thresholds of a reader: one for all (perType false) or one per type (command / question), each the cost optimum of its own items
 *  (the cost score is a sum over requests, so the two are chosen independently) */
function chooseT(items, G, cost = COST, perType = false) {
  if (!perType) return { all: costThreshold(items, G, cost).t };
  const T = { all: costThreshold(items, G, cost).t };
  for (const g of ["command", "question"]) { const sub = items.filter((x) => grpOf(x.pa) === g); T[g] = sub.length ? costThreshold(sub, G, cost).t : T.all; }
  return T;
}

// ------------------------------------------------------------------ signals and models
const VSS_NAMES = [["cut_start", 1], ["cut_end", 1], ["world_gap", 1], ["world_rank", 1], ["wnu_gap", 1], ["tie", 1], ["role_min", 1], ["residual", -1], ["unplaced", -1], ["abstain", -1], ["notu_frac", -1], ["ctx_fill", -1], ["ctx_margin", 1], ["world_prior", 1]];
const SOP_NAMES = [["act_p", 1], ["act_margin", 1], ["act_negent", 1], ["act_prior", 1], ["val_p_min", 1], ["val_margin_min", 1], ["none_p_min", 1], ["fill_p_min", 1], ["fill_margin_min", 1], ["ctx_fill", -1],
  ["tag_p_min", 1], ["tag_margin_min", 1], ["tag_all_min", 1], ["tag_stray", -1], ["desc_p_min", 1], ["desc_margin_min", 1], ["cut_start", 1], ["cut_end", 1], ["cut_inner_min", 1],
  ["unk_share", -1], ["split_share", -1], ["n_words", 1], ["n_roles", 1], ["n_units", 1]];
const COMB = [["agree", 1], ["agree_share", 1], ["other_conf", 1]];          // COMBINED_READER.md's inputs (SOP-BERT part)
const VOTE_S = [["agree_rules", 1], ["n_agree", 1], ["rules_clean", 1], ["rules_notes", -1]];                  // (c) added to a SOP-BERT reading
const VOTE_V = [["agree_sop", 1], ["agree_rules", 1], ["n_agree", 1], ["rules_clean", 1], ["rules_notes", -1]];  // (c) added to a VSS reading
const VOTE_S1 = [["agree_vss", 1]].concat(VOTE_S);                                                              // (c) SOP-BERT alone
const KIND = { vss: { prior: "world_prior", key: (x) => x.w || "none" }, sop: { prior: "act_prior", key: (x) => x.act } };
/** spec: {kind, names, shrink (prior pseudo-count, default 5), noPrior} */
function fitModel(rows, spec, lam) {
  const K = KIND[spec.kind], k = spec.shrink ?? 5, names = spec.noPrior ? spec.names.filter(([n]) => n !== K.prior) : spec.names;
  const overall = rows.filter((x) => x.ok).length / rows.length, ar = {};
  for (const x of rows) { const key = K.key(x); (ar[key] ||= [0, 0]); ar[key][1]++; if (x.ok) ar[key][0]++; }
  const prior = Object.fromEntries(Object.entries(ar).map(([key, [r, n]]) => [key, (r + overall * k) / (n + k)]));
  const raw = (x, n) => (n === K.prior ? (prior[K.key(x)] ?? overall) : x.f[n]);
  const tables = Object.fromEntries(names.map(([n, s]) => [n, fitTable(rows.map((x) => raw(x, n)), s)]));
  const vec = (x) => names.map(([n]) => percentile(tables[n], raw(x, n)));
  const w = logistic(rows.map(vec), rows.map((x) => (x.ok ? 1 : 0)), lam);
  return { w, tables, prior, overall, names, lam, kind: spec.kind, raw, vec, score: (x) => sigm(w, vec(x)) };
}
function fitReader(items, spec, prep = () => {}) {
  let best = null;
  if (!items.length) return null;
  for (const lam of LAMS) {
    const oof = new Array(items.length);
    for (let k = 0; k < FOLDS; k++) {
      prep(k);
      const tr = items.filter((x) => x.mi % FOLDS !== k);
      const m = fitModel(tr, spec, lam); items.forEach((x, i) => { if (x.mi % FOLDS === k) oof[i] = m.score(x); });
    }
    const a = auroc(items.map((x, i) => ({ c: oof[i], ok: x.ok })));
    if (!best || a > best.auc + 1e-9 || (!Number.isFinite(best.auc) && !Number.isFinite(a) && false)) best = { lam, auc: a, oof };
  }
  if (!best) best = { lam: 1, auc: NaN, oof: null };
  if (!best.oof) { // AUROC undefined (one class only): L2 1
    const oof = new Array(items.length); for (let k = 0; k < FOLDS; k++) { prep(k); const m = fitModel(items.filter((x) => x.mi % FOLDS !== k), spec, 1); items.forEach((x, i) => { if (x.mi % FOLDS === k) oof[i] = m.score(x); }); }
    best = { lam: 1, auc: NaN, oof };
  }
  prep(-1);
  return { model: fitModel(items, spec, best.lam), lam: best.lam, oofAuc: best.auc, oof: best.oof };
}

// ------------------------------------------------------------------ records -> items
function loadSet(dir, tag) {
  const need = ["sop_own", "vss_own", "vss_bert", "sop_vss", "rules_own", "rules_bert", "rules_vss"];
  for (const k of need) if (!existsSync(`${dir}/${k}.jsonl`)) throw new Error(`${dir}/${k}.jsonl missing`);
  const REC = Object.fromEntries(need.map((k) => [k, readJ(`${dir}/${k}.jsonl`)]));
  const ids = REC.sop_own.map((r) => r.id);
  for (const k of need) if (REC[k].map((r) => r.id).join() !== ids.join()) throw new Error(`${dir}/${k}: message order differs from sop_own`);
  const calIdx = new Map(); for (const id of ids) if (tag === "main" && isCal(id) && !calIdx.has(id)) calIdx.set(id, calIdx.size);
  const RM = Object.fromEntries(["rules_own", "rules_bert", "rules_vss"].map((k) => [k, new Map(REC[k].map((r) => [r.id, r]))]));
  const it = (recs, field) => { const items = []; recs.forEach((r) => (r[field] || []).forEach((x, j) => items.push({ id: r.id, j, cal: tag === "main" && isCal(r.id), test: tag === "main" && !isCal(r.id), mi: calIdx.get(r.id) ?? -1, o: x.o, ok: x.o === "right",
    f: { ...(x.f || {}) }, w: x.w, act: x.act, pa: field === "vss" ? x.a : x.pa, got: x.got, span: x.span, args0: x.args0, notes: x.notes ?? 0 }))); return items; };
  const I = { sop_own: it(REC.sop_own, "sop"), vss_own: it(REC.vss_own, "vss"), vss_bert: it(REC.vss_bert, "vss"), sop_vss: it(REC.sop_vss, "sop"),
    rules_own: it(REC.rules_own, "rules"), rules_bert: it(REC.rules_bert, "rules"), rules_vss: it(REC.rules_vss, "rules") };
  const NG = new Map(REC.sop_own.map((r) => [r.id, r.gold]));
  const logic = REC.rules_own[0] && REC.rules_own[0].logic;
  return { tag, dir, ids, I, NG, RM, logic, Gcal: ids.filter((id) => tag === "main" && isCal(id)).reduce((a, id) => a + NG.get(id), 0),
    Gtest: ids.filter((id) => tag === "main" && !isCal(id)).reduce((a, id) => a + NG.get(id), 0), Gall: ids.reduce((a, id) => a + NG.get(id), 0) };
}
const byMsg = (items) => { const m = new Map(); items.forEach((x, i) => { if (!m.has(x.id)) m.set(x.id, []); m.get(x.id).push(i); }); return m; };

// ------------------------------------------------------------------ agreement (combined_report.mjs agreement(); eq: canon, or d1 engine-true)
const namesOf = (id) => (ROW.get(id).names || []);
function sameKeys(x, y, id, mode) {
  const gx = mode === "engine" ? engineNorm(x.got, x.pa, namesOf(id)) : x.got, gy = mode === "engine" ? engineNorm(y.got, y.pa, namesOf(id)) : y.got;
  const keys = [...new Set([...Object.keys(gx), ...Object.keys(gy)])].filter((k) => k !== "action" && k !== "ask");
  const eq = keys.filter((k) => (gx[k] ?? "∅") === (gy[k] ?? "∅")).length;
  return keys.length ? eq / keys.length : 1;
}
/** A produced side, B gold side of pairValue, per message; only the items of A with mask true and of B with maskB true take part */
function agreement(A, B, mode = "canon", maskA = null, maskB = null) {
  const res = A.map(() => ({ agree: 0, agree_share: 0, partner: -1 })), ba = byMsg(A), bb = byMsg(B);
  for (const [id, ai0] of ba) {
    const ai = ai0.filter((i) => !maskA || maskA[i]), bi = (bb.get(id) || []).filter((i) => !maskB || maskB[i]); if (!ai.length || !bi.length) continue;
    const text = ROW.get(id).text;
    const gold = bi.map((j) => ({ s: B[j].span[0], e: B[j].span[1], act: B[j].pa, want: B[j].got, args: B[j].args0 || {} }));
    const units = ai.map((i) => ({ c0: A[i].span[0], c1: A[i].span[1] })), prods = ai.map((i, u) => ({ act: A[i].pa, u, rawC: A[i].got }));
    for (const [a, b] of pairValue({ text, gold, units, prods })) {
      const share = sameKeys(A[ai[a]], B[bi[b]], id, mode);
      res[ai[a]] = { agree: share === 1 ? 1 : 0, agree_share: share, partner: bi[b] };
    }
  }
  return res;
}
/** the Rules signals of a request paired with Rules request r (or none) in message id */
function rulesSig(S, rulesKey, id, rIdx) {
  const rec = S.RM[rulesKey].get(id), r = rIdx >= 0 ? S.I[rulesKey][rIdx] : null;
  const msgBad = (rec ? rec.msgNotes + rec.unread : 0);
  return { rules_clean: r && r.notes === 0 && msgBad === 0 ? 1 : 0, rules_notes: msgBad + (r ? r.notes : 0) };
}

// ------------------------------------------------------------------ the partner VSS confidence inside the folds (COMBINED_READER.md 4)
const VSSJ = JSON.parse(readFileSync(`${REPO}docs/model/confidence/vss.json`, "utf8")), VSPEC = VC.specOf(VSSJ);
const demoF = (x) => (x.f.cut_start_vss !== undefined ? { ...x.f, cut_start: x.f.cut_start_vss, cut_end: x.f.cut_end_vss } : x.f);

// ------------------------------------------------------------------ build the candidates of every reader on one record set
/** Candidates of every column and method family on one record set S. Each candidate: {id, cal, mi, pa, got, span, args0, from ('sop'|'vss'),
 *  f (signals + vote inputs), w, act, o}; outcomes recomputed when a reader's candidates mix two readers. */
function build(S, mode) {
  const { I } = S;
  // --- VSS alone (own cut), partners on the VSS cut: SOP-BERT on the VSS units, the Rules on the VSS units
  const V = I.vss_own.map((x) => ({ ...x, f: { ...x.f } }));
  { const aS = agreement(V, I.sop_vss, mode), aR = agreement(V, I.rules_vss, mode);
    V.forEach((x, i) => { Object.assign(x.f, { agree_sop: aS[i].agree, agree_rules: aR[i].agree, n_agree: 1 + aS[i].agree + aR[i].agree }, rulesSig(S, "rules_vss", x.id, aR[i].partner)); x.from = "vss"; }); }
  // --- SOP-BERT alone (own = BERT cut), partners on the BERT cut
  const P = I.sop_own.map((x) => ({ ...x, f: { ...x.f } }));
  const aSV = agreement(I.sop_own, I.vss_bert, mode), aSR = agreement(I.sop_own, I.rules_bert, mode);
  P.forEach((x, i) => { Object.assign(x.f, { agree_vss: aSV[i].agree, agree_rules: aSR[i].agree, n_agree: 1 + aSV[i].agree + aSR[i].agree }, rulesSig(S, "rules_bert", x.id, aSR[i].partner)); x.from = "sop"; });
  // --- the BERT cut, three readers: S = sop_own, VB = vss_bert, RB = rules_bert
  const VB = I.vss_bert, RB = I.rules_bert;
  const takenV = new Set(aSV.filter((a) => a.partner >= 0).map((a) => a.partner)), takenR = new Set(aSR.filter((a) => a.partner >= 0).map((a) => a.partner));
  const maskV = VB.map((_, j) => !takenV.has(j)), maskR = RB.map((_, j) => !takenR.has(j));
  const aVR = agreement(VB, RB, mode, maskV, maskR);    // the VSS requests SOP-BERT did not take, with the Rules requests SOP-BERT did not take
  // the S clusters
  const sC = I.sop_own.map((x, i) => {
    const pv = aSV[i].partner, pr = aSR[i].partner, sv = aSV[i].agree, sr = aSR[i].agree;
    const vr = pv >= 0 && pr >= 0 && sameKeys(VB[pv], RB[pr], x.id, mode) === 1 ? 1 : 0;
    const rs = rulesSig(S, "rules_bert", x.id, pr);
    const base = { ...x, src: i, partner: pv, from: "sop", f: { ...x.f, agree: sv, agree_share: aSV[i].agree_share, other_conf: 0, agree_rules: sr, n_agree: 1 + sv + sr, ...rs } };
    // the 3-vote: when SOP-BERT agrees with nobody and VSS and the Rules agree with each other, VSS's reading (2/3)
    const swap = !sv && !sr && vr ? { ...VB[pv], src: pv, partner: -1, from: "vss", f: { ...VB[pv].f, agree_sop: 0, agree_rules: 1, n_agree: 2, ...rs } } : null;
    return { base, swap, n: sv || sr ? 1 + sv + sr : vr ? 2 : 1, pattern: sv && sr ? "R+V+S" : sv ? "V+S" : sr ? "R+S" : vr ? "R+V (not S)" : pv >= 0 || pr >= 0 ? "none agree (paired)" : "S only" };
  });
  const vRest = VB.map((x, j) => ({ x, j })).filter(({ j }) => maskV[j]).map(({ x, j }) => {
    const pr = aVR[j].partner, ag = aVR[j].agree;
    return { ...x, src: j, partner: -1, from: "vss", pattern: ag ? "R+V (not S)" : "V only", f: { ...x.f, agree_sop: 0, agree_rules: ag, n_agree: 1 + ag, ...rulesSig(S, "rules_bert", x.id, pr) } };
  });
  const recompute = (all) => { for (const [id, ii] of byMsg(all)) { const res = outcomesOf(id, ii.map((i) => all[i])); ii.forEach((i, q) => { all[i].o = res[q]; all[i].ok = res[q] === "right"; }); } return all; };
  // VSS-BERT: every SOP-BERT request (its reading), and the VSS requests SOP-BERT did not take (COMBINED_READER.md)
  const CB = recompute(sC.map((c) => ({ ...c.base, pattern: c.pattern, n: c.n })).concat(vRest.map((v) => ({ ...v, n: v.f.n_agree }))));
  // 3-vote: the same clusters, VSS's reading where only VSS and the Rules agree
  const VT = recompute(sC.map((c) => ({ ...(c.swap || c.base), pattern: c.pattern, n: c.n })).concat(vRest.map((v) => ({ ...v, n: v.f.n_agree }))));
  // Rules alone (own cut)
  const R = I.rules_own.map((x) => ({ ...x, from: "rules", c: 1 }));
  return { V, P, CB, VT, R, pairs: sC, vRest };
}

// ------------------------------------------------------------------ fitting one column with one method
const PARTNER = {};   // per set of cal VSS items: the fold models of the partner VSS confidence
function partnerModels(S) {
  if (PARTNER.m) return PARTNER.m;
  const vCal = S.I.vss_own.filter((x) => x.cal), spec = { kind: "vss", names: VSS_NAMES };
  const folds = []; for (let k = 0; k < FOLDS; k++) folds.push(fitModel(vCal.filter((x) => x.mi % FOLDS !== k), spec, VSPEC.l2));
  const all = fitModel(vCal, spec, VSPEC.l2);
  let diff = 0; for (const x of S.I.vss_own) diff = Math.max(diff, Math.abs(all.score(x) - VC.confidence(VSSJ, x.f, x.w)));
  PARTNER.m = { folds, all, diff }; return PARTNER.m;
}
/** a one-part column (VSS or SOP-BERT alone): spec {kind, names, shrink, noPrior} */
function fitOne(cands, spec) {
  const cal = cands.filter((x) => x.cal), fit = fitReader(cal, spec);
  return { fit, conf: (x) => fit.model.score(x), oof: new Map(cal.map((x, i) => [x, fit.oof[i]])) };
}
/** a two-part column (VSS-BERT, the 3-vote with fitted weights): the 'sop' part scores SOP-BERT readings, the 'vss' part VSS readings */
function fitTwo(S, cands, specS, specV) {
  const PM = partnerModels(S), VB = S.I.vss_bert;
  const sI = cands.filter((x) => x.from === "sop"), vI = cands.filter((x) => x.from === "vss");
  const setOther = (k) => { for (const x of sI) x.f.other_conf = x.partner < 0 ? 0 : (k < 0 ? PM.all : PM.folds[k]).score({ f: demoF(VB[x.partner]), w: VB[x.partner].w }); };
  const sCal = sI.filter((x) => x.cal), vCal = vI.filter((x) => x.cal);
  const fitS = fitReader(sCal, specS, setOther), fitV = fitReader(vCal, specV);
  const oof = new Map(); sCal.forEach((x, i) => oof.set(x, fitS.oof[i])); vCal.forEach((x, i) => oof.set(x, fitV.oof[i]));
  return { fitS, fitV, conf: (x) => (x.from === "sop" ? fitS.model.score(x) : fitV.model.score(x)), oof, setOther };
}

// ------------------------------------------------------------------ the main set
const M = loadSet(RECDIR, "main");
const SHS = SHORT_REC.map((d, i) => ({ name: SHORT_NAMES[i], S: loadSet(d, "short") }));
// check: outcomesOf reproduces the recorded outcomes of each reader
{ let n = 0, diff = 0; for (const S of [M, ...SHS.map((x) => x.S)]) for (const k of Object.keys(S.I)) for (const [id, ii] of byMsg(S.I[k])) { const res = outcomesOf(id, ii.map((i) => S.I[k][i])); ii.forEach((i, q) => { n++; if (res[q] !== S.I[k][i].o) diff++; }); }
  if (diff) throw new Error(`outcomesOf differs from the recorded outcomes on ${diff} of ${n} requests`);
  console.error(`check: outcomes recomputed for ${n} produced requests = the recorded ones`); }
const PM = partnerModels(M);
console.error(`check: vss.json's recipe refitted on the calibration part vs the shipped vss.json: max |confidence difference| ${PM.diff.toExponential(2)}`);

const BUILT = { canon: { M: build(M, "canon"), SH: SHS.map((x) => build(x.S, "canon")) }, engine: { M: build(M, "engine"), SH: SHS.map((x) => build(x.S, "engine")) } };

/** the variants of every column (PLAN.md: the selection order = the listing order; a tie keeps the earlier one) */
const priors = [["k5", {}], ["d3 k50", { shrink: 50 }], ["d2 no prior", { noPrior: true }]];
const VARIANTS = [];
const add = (col, name, family, mk) => { for (const pt of [false, true]) VARIANTS.push({ col, name: name + (pt ? " + d5 per-type thr." : ""), family, perType: pt, mk }); };
for (const [pn, po] of priors) {
  const tag = pn === "k5" ? "" : " + " + pn;
  add("VSS", "(a)" + tag, pn === "k5" ? "a" : "d", { kind: "one", key: "V", spec: { kind: "vss", names: VSS_NAMES, ...po } });
  add("SOP-BERT", "(a)" + tag, pn === "k5" ? "a" : "d", { kind: "one", key: "P", spec: { kind: "sop", names: SOP_NAMES, ...po } });
  add("VSS-BERT", "(a)" + tag, pn === "k5" ? "a" : "d", { kind: "two", key: "CB", specS: { kind: "sop", names: SOP_NAMES.concat(COMB), ...po }, specV: { kind: "vss", names: VSS_NAMES, ...po } });
}
for (const mode of ["canon", "engine"]) {
  const mt = mode === "engine" ? " + d1" : "";
  add("VSS", "(b) agrees with ≥1 other" + mt, mode === "engine" ? "d" : "b", { kind: "vote", key: "V", mode });
  add("SOP-BERT", "(b) agrees with ≥1 other" + mt, mode === "engine" ? "d" : "b", { kind: "vote", key: "P", mode });
  add("3-vote", "(b) vote" + mt, mode === "engine" ? "d" : "b", { kind: "vote", key: "VT", mode });
  for (const [pn, po] of priors) {
    const tag = mt + (pn === "k5" ? "" : " + " + pn), fam = mode === "engine" || pn !== "k5" ? "d" : "c";
    add("VSS", "(c)" + tag, fam, { kind: "one", key: "V", mode, spec: { kind: "vss", names: VSS_NAMES.concat(VOTE_V), ...po } });
    add("SOP-BERT", "(c)" + tag, fam, { kind: "one", key: "P", mode, spec: { kind: "sop", names: SOP_NAMES.concat(VOTE_S1), ...po } });
    add("VSS-BERT", "(c)" + tag, fam, { kind: "two", key: "CB", mode, specS: { kind: "sop", names: SOP_NAMES.concat(COMB, VOTE_S), ...po }, specV: { kind: "vss", names: VSS_NAMES.concat(VOTE_V), ...po } });
    add("3-vote", "(c)" + tag, fam, { kind: "two", key: "VT", mode, specS: { kind: "sop", names: SOP_NAMES.concat(COMB, VOTE_S), ...po }, specV: { kind: "vss", names: VSS_NAMES.concat(VOTE_V), ...po } });
  }
}
/** run one variant: confidences (cal oof, test, short), thresholds at cost 5 / 10 / 20 */
const FITCACHE = new Map();
/** the stats of a reader result r on every situation at its threshold r.t */
function restat(r) {
  r.calSt = stats(r.cal, M.Gcal, r.t); r.testSt = stats(r.test, M.Gtest, r.t);
  r.shSt = Object.fromEntries(SHS.map((H) => [H.name, stats(r.sh[H.name], H.S.Gall, r.t)])); r.calScore = scoreOf(r.calSt); return r;
}
function runVariant(v) {
  const mode = v.mk.mode || "canon", B = BUILT[mode].M, BS = BUILT[mode].SH, cands = B[v.mk.key];
  const ck = JSON.stringify({ ...v.mk, perType: undefined });
  let F = FITCACHE.get(ck);
  if (!F) {
    if (v.mk.kind === "vote") { F = { conf: (x) => (v.mk.key === "VT" ? x.n : x.f.n_agree), oof: null }; }
    else if (v.mk.kind === "one") F = fitOne(cands, v.mk.spec);
    else F = fitTwo(M, cands, v.mk.specS, v.mk.specV);
    FITCACHE.set(ck, F);
  }
  if (F.setOther) F.setOther(-1);
  const item = (x, c) => ({ c, o: x.o, id: x.id, pa: x.pa, x });
  const cal = cands.filter((x) => x.cal).map((x) => item(x, F.oof ? F.oof.get(x) : F.conf(x)));
  const test = cands.filter((x) => x.test).map((x) => item(x, F.conf(x)));
  const sh = {};
  SHS.forEach((H, i) => { const sc = BS[i][v.mk.key]; if (F.setOther) for (const x of sc) if (x.from === "sop") x.f.other_conf = x.partner < 0 ? 0 : PM.all.score({ f: demoF(H.S.I.vss_bert[x.partner]), w: H.S.I.vss_bert[x.partner].w }); sh[H.name] = sc.map((x) => item(x, F.conf(x))); });
  const T = { 5: chooseT(cal, M.Gcal, 5, v.perType), 10: chooseT(cal, M.Gcal, 10, v.perType), 20: chooseT(cal, M.Gcal, 20, v.perType) };
  const r = { ...v, F, cal, test, sh, T, t: T[10] };
  restat(r);
  r.auc = auroc(cal.map((x) => ({ c: x.c, ok: x.o === "right" })));
  return r;
}
const RES = VARIANTS.map(runVariant);
console.error(`fitted ${RES.length} variants`);
// Rules alone: executes everything
const rulesCol = (() => { const R = BUILT.canon.M.R, it = (x) => ({ c: 1, o: x.o, id: x.id, pa: x.pa, x });
  const r = { col: "Rules", name: "executes everything", cal: R.filter((x) => x.cal).map(it), test: R.filter((x) => x.test).map(it), sh: Object.fromEntries(SHS.map((H, i) => [H.name, BUILT.canon.SH[i].R.map(it)])), t: { all: -Infinity } };
  restat(r); return r; })();

// ------------------------------------------------------------------ selection (calibration, out of fold)
const COLS = ["VSS", "SOP-BERT", "VSS-BERT", "3-vote"];
const CHOSEN = {}, CURRENT = {};
for (const col of COLS) {
  const vs = RES.filter((r) => r.col === col);
  CURRENT[col] = col === "3-vote" ? null : vs.find((r) => r.name === "(a)");
  let best = null; for (const r of vs) if (!best || r.calScore > best.calScore + 1e-9) best = r;
  CHOSEN[col] = best;
}
// the best of each family, for the per-method tables
const bestOf = (col, fam) => { let b = null; for (const r of RES.filter((r) => r.col === col && r.family === fam)) if (!b || r.calScore > b.calScore + 1e-9) b = r; return b; };

// ------------------------------------------------------------------ bootstrap
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const q = (a, z) => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.max(0, Math.floor(z * a.length)))] : NaN; };
function perMsg(items, T, part, S = M) {
  const msgIds = S.ids.filter((id) => (part === "short" ? true : part === "cal" ? isCal(id) : !isCal(id))), per = new Map(msgIds.map((id) => [id, { g: S.NG.get(id), r: 0, bad: 0 }]));
  for (const x of items) if (x.c >= tOf(T, x)) { const e = per.get(x.id); if (x.o === "right") e.r++; else e.bad++; }
  return msgIds.map((id) => per.get(id));
}
const partItems = (r, part) => (part === "cal" ? r.cal : part === "test" ? r.test : r.sh[part]);
function bootScore(r, part) {
  const arr = perMsg(partItems(r, part), r.t, part === "cal" || part === "test" ? part : "short", part === "cal" || part === "test" ? M : SHS.find((H) => H.name === part).S), rand = rng(SEED), sc = [];
  for (let b = 0; b < BOOT; b++) { let g = 0, rr = 0, bad = 0; for (let i = 0; i < arr.length; i++) { const e = arr[Math.floor(rand() * arr.length)]; g += e.g; rr += e.r; bad += e.bad; } sc.push(((rr - COST * bad) / g) * 100); }
  return [q(sc, 0.025), q(sc, 0.975)];
}
function bootDiff(r1, r0, part) {
  const a1 = perMsg(partItems(r1, part), r1.t, part), a0 = perMsg(partItems(r0, part), r0.t, part), rand = rng(SEED), d = [];
  for (let b = 0; b < BOOT; b++) { let g = 0, x1 = 0, b1 = 0, x0 = 0, b0 = 0; for (let i = 0; i < a1.length; i++) { const j = Math.floor(rand() * a1.length); g += a1[j].g; x1 += a1[j].r; b1 += a1[j].bad; x0 += a0[j].r; b0 += a0[j].bad; } d.push(((x1 - COST * b1) - (x0 - COST * b0)) / g * 100); }
  const st = (r) => (part === "cal" ? r.calSt : r.testSt);
  return { point: scoreOf(st(r1)) - scoreOf(st(r0)), ci: [q(d, 0.025), q(d, 0.975)] };
}
const ci = (a) => `[${s1(a[0])}, ${s1(a[1])}]`;
const thrTxt = (T) => { const f = (t) => (t === -Infinity ? "executes all" : t === Infinity ? "asks all" : Number.isInteger(t) ? `≥ ${t} agree` : t.toFixed(4)); return T.command !== undefined ? `cmd ${f(T.command)} / q ${f(T.question)}` : f(T.all); };

// ================================================================== report
const nCal = M.ids.filter(isCal).length, nTest = M.ids.length - nCal;
log(`# confidence3: report written by training/sketch/confidence3/fit3.mjs\n`);
log(`Records: ${RECDIR} (combine/collect_pair.mjs + confidence3/collect_rules3.mjs; logic.js ${M.logic}). Data: ${DATADIRS.join(" ")}. Calibration part ${nCal} messages / ${M.Gcal} requested actions; test part ${nTest} messages / ${M.Gtest} requested actions.${SHS.map((H) => ` Short commands "${H.name}": ${H.S.dir}, ${H.S.ids.length} messages / ${H.S.Gall} requested actions (evaluation only).`).join("")}`);
log(`Checks: outcomes recomputed = recorded; vss.json recipe refitted on cal vs the shipped file: max |difference| ${PM.diff.toExponential(2)}.`);
log(`Cost score = (right − 10 × (executed wrong + extras executed)) per 100 requested actions. "cal (oof)" = calibration part, out-of-fold confidences. "test" = the fresh2 test part. "short" = the short commands (synth_rules sample, generated from the Rules' grammar: favours the Rules).\n`);

// ---------------- diagnosis
log(`## 1. Diagnosis (calibration part, current confidences (a))\n`);
// 1a reliability
log(`### 1a. Reliability: predicted confidence (out of fold) against observed precision\n`);
const BINS = [[0, 0.5], [0.5, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 0.95], [0.95, 1.0001]];
const relCols = ["VSS", "SOP-BERT", "VSS-BERT"].map((c) => CURRENT[c]);
log(`| confidence bin | ${relCols.map((r) => `${r.col}: n · mean conf · observed right`).join(" | ")} |`); log(`|---|${relCols.map(() => "---").join("|")}|`);
for (const [lo, hi] of BINS) log(`| ${lo.toFixed(2)}–${Math.min(hi, 1).toFixed(2)} | ${relCols.map((r) => { const b = r.cal.filter((x) => x.c >= lo && x.c < hi); return b.length ? `${b.length} · ${pc(b.reduce((a, x) => a + x.c, 0) / b.length)} · ${pc(b.filter((x) => x.o === "right").length / b.length)}` : "0"; }).join(" | ")} |`);
// 1b held right requests, pulls
log(`\n### 1b. Right requests held by each gate, and what holds them\n`);
log(`Held right = requests whose reading is right but whose out-of-fold confidence is below the cost-10 threshold. Pulls are from the final model (all of the calibration part): pull = weight × (typical percentile − this request's percentile), in logit units; positive pulls the confidence down. "Freed by the prior at typical" = held right requests whose final-model confidence would clear the threshold if the prior input alone were at its typical value.\n`);
for (const col of ["VSS", "SOP-BERT"]) {
  const r = CURRENT[col], mdl = r.F.fit.model, t = r.t.all, calX = r.cal;
  const right = calX.filter((x) => x.o === "right"), held = right.filter((x) => x.c < t), heldWrong = calX.filter((x) => x.o !== "right" && x.c < t);
  const typ = mdl.names.map(([n], j) => calX.reduce((a, it) => a + mdl.vec(it.x)[j], 0) / calX.length);
  const pullSum = mdl.names.map(() => 0); let freed = 0; const priorName = KIND[mdl.kind].prior;
  for (const it of held) { const v = mdl.vec(it.x); let z = mdl.w[0]; v.forEach((p, j) => { z += mdl.w[j + 1] * p; pullSum[j] += mdl.w[j + 1] * (typ[j] - p); });
    const jp = mdl.names.findIndex(([n]) => n === priorName); if (jp >= 0) { const z2 = z + mdl.w[jp + 1] * (typ[jp] - v[jp]); if (1 / (1 + Math.exp(-z2)) >= t && 1 / (1 + Math.exp(-z)) < t) freed++; } }
  const top = mdl.names.map(([n], j) => [n, pullSum[j] / Math.max(1, held.length), mdl.w[j + 1]]).sort((a, b) => b[1] - a[1]).slice(0, 6);
  log(`- **${col}** (threshold ${thrTxt(r.t)}): ${right.length} right requests produced, **${held.length} held (${pc(held.length / right.length)})**; held wrong or extra ${heldWrong.length}. Mean pull over the held right requests, largest first: ${top.map(([n, p, w]) => `${n} ${p.toFixed(2)} (weight ${w.toFixed(2)})`).join(", ")}. Freed by the prior at typical: ${freed} of ${held.length}.`);
}
{ // VSS-BERT
  const r = CURRENT["VSS-BERT"], right = r.cal.filter((x) => x.o === "right"), held = right.filter((x) => x.c < r.t.all);
  const byPat = {}; for (const it of r.cal) { const k = it.x.pattern; (byPat[k] ||= { n: 0, right: 0, exec: 0, heldRight: 0 }); byPat[k].n++; if (it.o === "right") byPat[k].right++; if (it.c >= r.t.all) byPat[k].exec++; else if (it.o === "right") byPat[k].heldRight++; }
  log(`- **VSS-BERT** (threshold ${thrTxt(r.t)}): ${right.length} right requests produced, **${held.length} held (${pc(held.length / right.length)})**. By what the three readers did (the Rules only observed here):`);
  log(`\n| situation | produced | right | executed | right but held |`); log(`|---|---|---|---|---|`);
  for (const [k, v] of Object.entries(byPat).sort((a, b) => b[1].n - a[1].n)) log(`| ${k} | ${v.n} | ${pc(v.right / v.n)} | ${v.exec} | ${v.heldRight} |`);
}
// the act prior / world prior of the symptom acts
{
  const mS = CURRENT["SOP-BERT"].F.fit.model, mV = CURRENT["VSS"].F.fit.model;
  const acts = ["command:arrange", "command:distribute", "command:align"];
  const calS = BUILT.canon.M.P.filter((x) => x.cal);
  log(`\nThe act prior of SOP-BERT (shrunk share right per act, k = 5) for the layout acts: ${acts.map((a) => { const its = calS.filter((x) => x.pa === a); return `${a.split(":")[1]} ${pc(mS.prior[its[0] ? its[0].act : a])} (${its.filter((x) => x.ok).length} right of ${its.length})`; }).join("; ")}; overall ${pc(mS.overall)}. The world prior of VSS: ${Object.entries(mV.prior).sort((a, b) => a[1] - b[1]).map(([w, p]) => `${w} ${pc(p)}`).join(", ")}.`);
}
// 1c threshold instability
log(`\n### 1c. How unstable the threshold is (1000 bootstrap resamples of the ${nCal} calibration messages, the out-of-fold confidences fixed)\n`);
log(`| reader | threshold (all cal) | threshold 2.5% / 50% / 97.5% | executed on cal at those three | cal score at the 2.5% and 97.5% thresholds |`); log(`|---|---|---|---|---|`);
for (const col of ["VSS", "SOP-BERT", "VSS-BERT"]) {
  const r = CURRENT[col], ids = M.ids.filter(isCal), byId = new Map(ids.map((id) => [id, []])); for (const x of r.cal) byId.get(x.id).push(x);
  const rand = rng(SEED), ts = [];
  for (let b = 0; b < BOOT; b++) { const it = [], G0 = { v: 0 }; for (let i = 0; i < ids.length; i++) { const id = ids[Math.floor(rand() * ids.length)]; G0.v += M.NG.get(id); for (const x of byId.get(id)) it.push(x); } ts.push(costThreshold(it, G0.v).t); }
  const fin = ts.filter(Number.isFinite), Q = [q(fin, 0.025), q(fin, 0.5), q(fin, 0.975)], ex = Q.map((t) => r.cal.filter((x) => x.c >= t).length);
  const sc = [Q[0], Q[2]].map((t) => scoreOf(stats(r.cal, M.Gcal, { all: t })));
  log(`| ${col} | ${thrTxt(r.t)} | ${Q.map((t) => t.toFixed(3)).join(" / ")}${fin.length < BOOT ? ` (${BOOT - fin.length} resamples: ask all / execute all)` : ""} | ${ex.join(" / ")} of ${r.cal.length} | ${sc.map(s1).join(" / ")} |`);
}
// 1d false disagreements
log(`\n### 1d. False disagreements: order of a target list, list vs no target vs mention(quantifier=all) (d1)\n`);
{
  const C = BUILT.canon.M, E = BUILT.engine.M;
  const tab = (part) => { let pairs = 0, dis = 0, flip = 0, flipRight = 0; const ex = [];
    C.pairs.forEach((c, i) => { const x = c.base; if (!(part === "cal" ? x.cal : part === "test" ? x.test : true) || x.partner < 0) return; pairs++; if (!x.f.agree) { dis++; if (E.pairs[i].base.f.agree) { flip++; if (x.ok) flipRight++; if (ex.length < 4) ex.push(`${JSON.stringify(x.got)} vs ${JSON.stringify(M.I.vss_bert[x.partner].got)}`); } } });
    return { pairs, dis, flip, flipRight, ex }; };
  for (const part of ["cal", "test"]) { const t = tab(part); log(`- ${part === "cal" ? "Calibration" : "Test"} part, BERT cut: ${t.pairs} SOP-BERT–VSS pairs, ${t.dis} disagree under canon; **${t.flip} of them agree under d1** (${t.flipRight} of those SOP-BERT readings are right).${t.ex.length ? " Examples: " + t.ex.join("; ") : ""}`); }
  SHS.forEach((H, hi) => { const CS = BUILT.canon.SH[hi], ES = BUILT.engine.SH[hi]; let pairs = 0, dis = 0, flip = 0, flipRight = 0; const ex = [];
    CS.pairs.forEach((c, i) => { const x = c.base; if (x.partner < 0) return; pairs++; if (!x.f.agree) { dis++; if (ES.pairs[i].base.f.agree) { flip++; if (x.ok) flipRight++; if (ex.length < 4) ex.push(`“${ROW.get(x.id).text}”: ${JSON.stringify(x.got)} vs ${JSON.stringify(H.S.I.vss_bert[x.partner].got)}`); } } });
    log(`- Short commands "${H.name}": ${pairs} pairs, ${dis} disagree under canon; **${flip} agree under d1** (${flipRight} right).${ex.length ? " Examples: " + ex.join("; ") : ""}`); });
}

// ---------------- the 3-vote by agreement pattern
log(`\n## 2. The 3-reader vote (b): what each agreement pattern is worth (BERT cut; SOP-BERT's reading unless marked)\n`);
for (const mode of ["canon", "engine"]) {
  log(`${mode === "canon" ? "Agreement = canonical values equal" : "Agreement with d1 (engine-true equivalence for arrange / distribute targets)"}:\n`);
  log(`| pattern | cal: produced · right % | test: produced · right % |${SHS.map((H) => ` ${H.name}: produced · right % |`).join("")}`); log(`|---|---|---|${SHS.map(() => "---|").join("")}`);
  const VT = BUILT[mode].M.VT, VTs = BUILT[mode].SH.map((B) => B.VT), pats = [...new Set(VT.map((x) => x.pattern).concat(VTs.flat().map((x) => x.pattern)))];
  const cell = (its) => (its.length ? `${its.length} · ${pc(its.filter((x) => x.ok).length / its.length)}` : "0");
  for (const p of pats) log(`| ${p}${p === "R+V (not S)" ? " (VSS's reading)" : ""} | ${cell(VT.filter((x) => x.cal && x.pattern === p))} | ${cell(VT.filter((x) => x.test && x.pattern === p))} |${VTs.map((V) => ` ${cell(V.filter((x) => x.pattern === p))} |`).join("")}`);
  log("");
}

// ---------------- per-method tables
const SITS = [["cal", "calibration (oof)"], ["test", "test part"], ...SHS.map((H) => [H.name, `short commands ${H.name}`])];
const stOf = (r, p) => (p === "cal" ? r.calSt : p === "test" ? r.testSt : r.shSt[p]);
function methodTable(title, cols) {
  log(`\n### ${title}\n`);
  log(`| situation | ${cols.map((r) => (r ? `${r.col}: ${r.name}` : "-")).join(" | ")} |`); log(`|---|${cols.map(() => "---").join("|")}|`);
  log(`| threshold (cost 10, chosen on cal oof) | ${cols.map((r) => (r ? thrTxt(r.t) : "-")).join(" | ")} |`);
  log(`| AUROC (cal, oof) | ${cols.map((r) => (r && r.auc !== undefined ? f3(r.auc) : "-")).join(" | ")} |`);
  for (const [p, name] of SITS) {
    log(`| **${name}**: score [95% CI] | ${cols.map((r) => (r ? `${s1(scoreOf(stOf(r, p)))} ${ci(bootScore(r, p))}` : "-")).join(" | ")} |`);
    log(`| ${name}: precision of execution | ${cols.map((r) => (r ? `${pc(stOf(r, p).prec)} (${stOf(r, p).n} executed)` : "-")).join(" | ")} |`);
    log(`| ${name}: done right % · confidently wrong % · asked % | ${cols.map((r) => (r ? `${pc(stOf(r, p).cov)} · ${pc(stOf(r, p).conf_wrong)} · ${pc(stOf(r, p).asked)}` : "-")).join(" | ")} |`);
  }
}
log(`\n## 3. The methods (one table per method; each column at its own cost-10 threshold)\n`);
log(`Confidently wrong % = of what it executed (wrong + extras), 1 − precision. Asked % = of the requested actions, read but held.`);
const b3 = (mode) => { const r = RES.find((x) => x.col === "3-vote" && x.name === "(b) vote" + (mode === "engine" ? " + d1" : "")); return restat({ ...r, name: r.name + " 3/3", t: { all: 3 } }); };
const b2 = (mode) => { const r = RES.find((x) => x.col === "3-vote" && x.name === "(b) vote" + (mode === "engine" ? " + d1" : "")); return restat({ ...r, name: r.name + " ≥2/3", t: { all: 2 } }); };
methodTable("(a) the current confidences", [rulesCol, CURRENT.VSS, CURRENT["SOP-BERT"], CURRENT["VSS-BERT"], null]);
methodTable("(b) the vote, no fitted weights (VSS / SOP-BERT: execute its own reading when ≥ 1 other reader agrees; 3-vote: 3/3 and ≥ 2/3)", [rulesCol, RES.find((r) => r.col === "VSS" && r.name === "(b) agrees with ≥1 other"), RES.find((r) => r.col === "SOP-BERT" && r.name === "(b) agrees with ≥1 other"), null, b3("canon"), b2("canon")]);
methodTable("(c) the vote as inputs of the fitted logistics", [rulesCol, RES.find((r) => r.col === "VSS" && r.name === "(c)"), RES.find((r) => r.col === "SOP-BERT" && r.name === "(c)"), RES.find((r) => r.col === "VSS-BERT" && r.name === "(c)"), RES.find((r) => r.col === "3-vote" && r.name === "(c)")]);
methodTable("(d) the best fix of the menu per column (by cal oof score)", [rulesCol, ...COLS.map((c) => bestOf(c, "d"))]);
methodTable("b3/b2 with d1 (engine-true agreement)", [b3("engine"), b2("engine")]);

// ---------------- all variants
log(`\n## 4. Every variant tried (calibration out-of-fold cost score at cost 10; the selection rule of PLAN.md picks the highest; a tie keeps the earlier row)\n`);
log(`| column | variant | family | threshold | cal oof score | done right % · confidently wrong % | AUROC |`); log(`|---|---|---|---|---|---|---|`);
for (const r of RES) log(`| ${r.col} | ${r.name}${CHOSEN[r.col] === r ? " **(chosen)**" : ""} | ${r.family} | ${thrTxt(r.t)} | ${s1(r.calScore)} | ${pc(r.calSt.cov)} · ${pc(r.calSt.conf_wrong)} | ${f3(r.auc)} |`);

// ---------------- verdicts
log(`\n## 5. Verdicts (test part, once; paired bootstrap over the ${nTest} test messages, 1000 resamples, seed 1)\n`);
log(`| column | chosen (cal oof score) | current (a) (cal oof score) | test: chosen · current | difference [95% CI] | verdict |`); log(`|---|---|---|---|---|---|`);
const VERD = {};
for (const col of ["VSS", "SOP-BERT", "VSS-BERT"]) {
  const c = CHOSEN[col], a = CURRENT[col];
  if (c === a) { log(`| ${col} | (a) is the chosen one | ${s1(a.calScore)} | ${s1(scoreOf(a.testSt))} | - | no change |`); VERD[col] = "no change"; continue; }
  const d = bootDiff(c, a, "test"), v = d.ci[0] > 0 ? "**better**" : d.ci[1] < 0 ? "**worse**" : "not shown";
  VERD[col] = v; log(`| ${col} | ${c.name} (${s1(c.calScore)}) | ${s1(a.calScore)} | ${s1(scoreOf(c.testSt))} · ${s1(scoreOf(a.testSt))} | ${s1(d.point)} ${ci(d.ci)} | ${v} |`);
}
{ const c = CHOSEN["3-vote"], a = CURRENT["VSS-BERT"], d = bootDiff(c, a, "test"), v = d.ci[0] > 0 ? "**better**" : d.ci[1] < 0 ? "**worse**" : "not shown"; VERD["3-vote"] = v;
  log(`| 3-vote vs VSS-BERT (a) | ${c.name} (${s1(c.calScore)}) | ${s1(a.calScore)} | ${s1(scoreOf(c.testSt))} · ${s1(scoreOf(a.testSt))} | ${s1(d.point)} ${ci(d.ci)} | ${v} |`); }
{ /* the default level of the "3 readers" tab (owner: execute only what you are sure of): the weight-free 3/3 vote (engine-true agreement, as
     the page) against the chosen fitted vote, by how often each is confidently wrong; paired bootstrap over messages of the difference */
  const A = b3("engine"), F = CHOSEN["3-vote"];
  log(`\n### The "3 readers" tab: the weight-free vote 3/3 (+ d1, as the page) against the fitted vote (${F.name})\n`);
  log(`Confidently wrong = (wrong + extras executed) / executed. Difference = 3/3 − fitted, in points of the confidently-wrong rate (positive: the fitted vote is wrong less often), and in cost score; 95% paired bootstrap over messages (${BOOT} resamples, seed ${SEED}).\n`);
  log(`| part | 3/3: executed · wrong + extras · confidently wrong % · score | fitted: executed · wrong + extras · confidently wrong % · score | confidently wrong, 3/3 − fitted [95% CI] | score, fitted − 3/3 [95% CI] |`); log(`|---|---|---|---|---|`);
  /* the short commands (short3, ids s3-…) apart from the long messages (fresh2): the 3/3 default was chosen when the fitted vote had seen long
     messages only (RESULT.md); the calibration part now holds short3 too */
  const isShort = (id) => String(id).startsWith("s3-");
  for (const [part, sub, label] of [["cal", null, "calibration (oof)"], ["test", null, "test part"], ["cal", false, "calibration (oof), fresh2 only"], ["cal", true, "calibration (oof), short3 only"], ["test", false, "test part, fresh2 only"], ["test", true, "test part, short3 only"]]) {
    const keep = (x) => sub == null || isShort(x.id) === sub, ia = partItems(A, part).filter(keep), iF = partItems(F, part).filter(keep);
    const ids = M.ids.filter((id) => (part === "cal" ? isCal(id) : !isCal(id)) && (sub == null || isShort(id) === sub)), G = ids.reduce((g, id) => g + M.NG.get(id), 0);
    const per = (items, T) => { const m = new Map(ids.map((id) => [id, { g: M.NG.get(id), r: 0, bad: 0 }])); for (const x of items) if (x.c >= tOf(T, x)) { const e = m.get(x.id); if (x.o === "right") e.r++; else e.bad++; } return ids.map((id) => m.get(id)); };
    const a = per(ia, A.t), f = per(iF, F.t), rand = rng(SEED), d = [], dsc = [];
    for (let b = 0; b < BOOT; b++) { let g = 0, ra = 0, ba = 0, rf = 0, bf = 0; for (let i = 0; i < a.length; i++) { const j = Math.floor(rand() * a.length); g += a[j].g; ra += a[j].r; ba += a[j].bad; rf += f[j].r; bf += f[j].bad; } d.push((ba / (ra + ba || 1) - bf / (rf + bf || 1)) * 100); dsc.push(((rf - COST * bf) - (ra - COST * ba)) / g * 100); }
    const sa = stats(ia, G, A.t), sf = stats(iF, G, F.t);
    log(`| ${label} (${ids.length} messages, ${G} requested) | ${sa.n} · ${sa.w + sa.e} · ${pc(sa.conf_wrong)} · ${s1(scoreOf(sa))} | ${sf.n} · ${sf.w + sf.e} · ${pc(sf.conf_wrong)} · ${s1(scoreOf(sf))} | ${s1((sa.conf_wrong - sf.conf_wrong) * 100)} ${ci([q(d, 0.025), q(d, 0.975)])} | ${s1(scoreOf(sf) - scoreOf(sa))} ${ci([q(dsc, 0.025), q(dsc, 0.975)])} |`);
  }
}
methodTable("The chosen variant of each column (the selection rule)", [rulesCol, ...COLS.map((c) => CHOSEN[c])]);
log(`\nThe chosen variants, cost 5 / 10 / 20 thresholds (cal oof): ${COLS.map((c) => `${c} ${CHOSEN[c].name}: ${[5, 10, 20].map((k) => thrTxt(CHOSEN[c].T[k])).join(" / ")}`).join("; ")}.`);
log(`\nSelection optimism: the chosen variant is the best of ${RES.filter((r) => r.col === "VSS").length}-${RES.filter((r) => r.col === "3-vote").length} on 195 messages; its calibration score is optimistic, the test part is the check.`);

// ---------------- the symptom commands
const SYM = SHS.find((H) => H.S.ids.some((id) => id.startsWith("sym-")));
if (SYM) { const SH = SYM.S;
  log(`\n## 6. The symptom commands (canvas Start, Check, Done, Retry)\n`);
  log(`| command | reader | reading | (a) confidence · executes? | chosen confidence · executes? |`); log(`|---|---|---|---|---|`);
  for (const id of SH.ids.filter((id) => id.startsWith("sym-"))) {
    const text = ROW.get(id).text;
    const row = (col, key) => { const a = col === "3-vote" ? null : CURRENT[col], c = CHOSEN[col];
      const its = (r) => (r ? r.sh[SYM.name].filter((x) => x.id === id) : []), A = its(a), C = its(c);
      const n = Math.max(A.length, C.length);
      for (let i = 0; i < Math.max(1, n); i++) { const xa = A[i], xc = C[i], x = (xa || xc || {}).x;
        log(`| ${text} | ${col} | ${x ? `${x.from || ""} ${JSON.stringify(x.got)}` : "nothing read"} | ${xa ? `${xa.c.toFixed(3)} · ${xa.c >= tOf(a.t, xa) ? "yes" : "no"}` : "-"} | ${xc ? `${(Number.isInteger(xc.c) ? xc.c + " agree" : xc.c.toFixed(3))} · ${xc.c >= tOf(c.t, xc) ? "yes" : "no"}` : "-"} |`); } };
    const rr = SH.I.rules_own.filter((x) => x.id === id); log(`| ${text} | Rules | ${rr.map((x) => JSON.stringify(x.got)).join("; ") || "nothing read"} | executes | executes |`);
    for (const col of COLS) row(col);
  }
}
writeFileSync(OUT, out.join("\n") + "\n");
console.error(`wrote ${OUT}`);

// ================================================================== EXPORT
if (process.env.EXPORT === "1") {
  const { exportVote } = await import("./export3.mjs");
  exportVote({ REPO, CHOSEN, CURRENT, VERD, M, SHS, ROW, BUILT, thrTxt, scoreOf, VSS_NAMES, SOP_NAMES, KIND, PM, demoF });
}
