// combine/combine_report.mjs: the fits and tables of COMBINE.md (A: the VSS reader on the SOP-BERT cut; B: agreement between the two readers).
//   node training/sketch/combine/combine_report.mjs <records dir> <out.md> <data dir> [<data dir> ...]
//   <records dir>: sop_own.jsonl, vss_own.jsonl, vss_bert.jsonl of combine/collect_pair.mjs. <data dir>: fresh2/opus_a .. opus_d (texts).
// The recipe is a copy of fresh2/fit_report.mjs (percentile maps, prior, L2 grid by out-of-fold AUROC, 5 folds by message, the cost-score
// threshold on the out-of-fold calibration confidences, the final model refit on all of the calibration part applied to the test part);
// the only change is that a reader's signal list can carry the two agreement signals (agree, agree_share) of COMBINE.md.
// Fitting and choosing: calibration part only. The test part (already read for FEEDBACK_PLAN) is only scored, labelled exploratory.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { percentile } from "../precision_confidence.mjs";
import { pairValue } from "../layer_common.mjs";

const [RECDIR, OUT, ...DATADIRS] = process.argv.slice(2);
if (!RECDIR || !OUT || !DATADIRS.length) { console.error("usage: combine_report.mjs <records dir> <out.md> <data dir>..."); process.exit(2); }
const COST = 10, BOOT = 1000, SEED = 1, FOLDS = 5, LAMS = [0.01, 0.1, 1, 10];
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const out = []; const log = (s = "") => out.push(s);
const pc = (x) => (Number.isFinite(x) ? (x * 100).toFixed(1) + "%" : "-"), f3 = (x) => (Number.isFinite(x) ? x.toFixed(3) : "-"), s1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : "-");

// ------------------------------------------------------------------ messages
const TEXT = new Map();
for (const d of DATADIRS) for (const f of readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort())
  for (const r of readJ(`${d}/${f}`)) if (Array.isArray(r.wires) && !TEXT.has(r.id)) TEXT.set(r.id, r.text);
const isCal = (id) => BigInt("0x" + createHash("sha256").update(id).digest("hex")) % 3n === 0n;

// ------------------------------------------------------------------ statistics (fit_report.mjs, copied)
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
function costThreshold(oofItems, G) {
  const s = oofItems.slice().sort((a, b) => b.c - a.c); let r = 0, bad = 0, best = { t: Infinity, score: 0, n: 0, kind: "asks everything" };
  for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") r++; else bad++; j++; }
    const sc = ((r - COST * bad) / G) * 100; if (sc > best.score + 1e-12) best = { t: s[i].c, score: sc, n: j, kind: "threshold" }; i = j; }
  const all = ((r - COST * bad) / G) * 100;
  if (best.kind === "threshold" && best.n === s.length) best = { t: -Infinity, score: best.score, n: s.length, kind: "executes everything" };
  else if (all > best.score + 1e-12) best = { t: -Infinity, score: all, n: s.length, kind: "executes everything" };
  return best;
}

// ------------------------------------------------------------------ signals
const VSS_NAMES = [["cut_start", 1], ["cut_end", 1], ["world_gap", 1], ["world_rank", 1], ["wnu_gap", 1], ["tie", 1], ["role_min", 1], ["residual", -1], ["unplaced", -1], ["abstain", -1], ["notu_frac", -1], ["ctx_fill", -1], ["ctx_margin", 1], ["world_prior", 1]];
const SOP_NAMES = [["act_p", 1], ["act_margin", 1], ["act_negent", 1], ["act_prior", 1], ["val_p_min", 1], ["val_margin_min", 1], ["none_p_min", 1], ["fill_p_min", 1], ["fill_margin_min", 1], ["ctx_fill", -1],
  ["tag_p_min", 1], ["tag_margin_min", 1], ["tag_all_min", 1], ["tag_stray", -1], ["desc_p_min", 1], ["desc_margin_min", 1], ["cut_start", 1], ["cut_end", 1], ["cut_inner_min", 1],
  ["unk_share", -1], ["split_share", -1], ["n_words", 1], ["n_roles", 1], ["n_units", 1]];
const AGREE = [["agree", 1], ["agree_share", 1]];
const KIND = { vss: { prior: "world_prior", key: (x) => x.w || "none" }, sop: { prior: "act_prior", key: (x) => x.act } };

function fitModel(rows, spec, lam) {
  const K = KIND[spec.kind], names = spec.names, overall = rows.filter((x) => x.ok).length / rows.length, ar = {};
  for (const x of rows) { const k = K.key(x); (ar[k] ||= [0, 0]); ar[k][1]++; if (x.ok) ar[k][0]++; }
  const prior = Object.fromEntries(Object.entries(ar).map(([k, [r, n]]) => [k, (r + overall * 5) / (n + 5)]));
  const raw = (x, n) => (n === K.prior ? (prior[K.key(x)] ?? overall) : x.f[n]);
  const tables = Object.fromEntries(names.map(([n, s]) => [n, fitTable(rows.map((x) => raw(x, n)), s)]));
  const vec = (x) => names.map(([n]) => percentile(tables[n], raw(x, n)));
  const w = logistic(rows.map(vec), rows.map((x) => (x.ok ? 1 : 0)), lam);
  return { w, tables, prior, score: (x) => sigm(w, vec(x)) };
}
function fitReader(items, spec) {   // items: calibration produced requests
  let best = null;
  for (const lam of LAMS) {
    const oof = new Array(items.length);
    for (let k = 0; k < FOLDS; k++) {
      const tr = items.filter((x) => x.mi % FOLDS !== k);
      const m = fitModel(tr, spec, lam); items.forEach((x, i) => { if (x.mi % FOLDS === k) oof[i] = m.score(x); });
    }
    const a = auroc(items.map((x, i) => ({ c: oof[i], ok: x.ok })));
    if (!best || a > best.auc + 1e-9) best = { lam, auc: a, oof };
  }
  return { model: fitModel(items, spec, best.lam), lam: best.lam, oofAuc: best.auc, oof: best.oof };
}

// ------------------------------------------------------------------ records -> items
const REC = { sop: readJ(`${RECDIR}/sop_own.jsonl`), vss: readJ(`${RECDIR}/vss_own.jsonl`), vssb: readJ(`${RECDIR}/vss_bert.jsonl`) };
const ids = REC.sop.map((r) => r.id);
for (const k of ["vss", "vssb"]) if (REC[k].map((r) => r.id).join() !== ids.join()) throw new Error(`${k}: message order differs from sop_own`);
const calIdx = new Map(); for (const id of ids) if (isCal(id) && !calIdx.has(id)) calIdx.set(id, calIdx.size);
const GOLD = new Map(REC.sop.map((r) => [r.id, r.gold]));
function itemsOf(recs, kind) {
  const items = [];
  recs.forEach((r, k) => {
    for (const x of kind === "sop" ? r.sop : r.vss) items.push({ k, id: r.id, cal: isCal(r.id), mi: calIdx.get(r.id) ?? -1, o: x.o, ok: x.o === "right", f: { ...x.f }, w: x.w, act: x.act, pa: kind === "sop" ? x.pa : x.a, got: x.got, span: x.span, args0: x.args0 });
  });
  return items;
}
const ITEMS = { sop: itemsOf(REC.sop, "sop"), vss: itemsOf(REC.vss, "vss"), vssb: itemsOf(REC.vssb, "vss") };
const byMsg = (items) => { const m = new Map(); items.forEach((x, i) => { if (!m.has(x.id)) m.set(x.id, []); m.get(x.id).push(i); }); return m; };

// agreement of reader X's requests with reader Y's on each message (COMBINE.md B): Y plays the gold of pairValue
function agreement(X, Y) {
  const res = X.map(() => ({ agree: 0, agree_share: 0, partner: -1 })), bx = byMsg(X), by = byMsg(Y);
  for (const [id, xi] of bx) {
    const yi = by.get(id) || []; if (!yi.length) continue;
    const text = TEXT.get(id);
    const gold = yi.map((j) => ({ s: Y[j].span[0], e: Y[j].span[1], act: Y[j].pa, want: Y[j].got, args: Y[j].args0 || {} }));
    const units = xi.map((i) => ({ c0: X[i].span[0], c1: X[i].span[1] }));
    const prods = xi.map((i, u) => ({ act: X[i].pa, u, rawC: X[i].got }));
    for (const [a, b] of pairValue({ text, gold, units, prods })) {
      const x = X[xi[a]], y = Y[yi[b]];
      const keys = [...new Set([...Object.keys(x.got), ...Object.keys(y.got)])].filter((k) => k !== "action" && k !== "ask");
      const eq = keys.filter((k) => (x.got[k] ?? "∅") === (y.got[k] ?? "∅")).length, share = keys.length ? eq / keys.length : 1;
      res[xi[a]] = { agree: share === 1 ? 1 : 0, agree_share: share, partner: yi[b] };
    }
  }
  return res;
}
const AG = { sop_vssb: agreement(ITEMS.sop, ITEMS.vssb), sop_vss: agreement(ITEMS.sop, ITEMS.vss), vss_sop: agreement(ITEMS.vss, ITEMS.sop), vssb_sop: agreement(ITEMS.vssb, ITEMS.sop) };
const withAgree = (items, ag) => items.map((x, i) => ({ ...x, f: { ...x.f, agree: ag[i].agree, agree_share: ag[i].agree_share }, partner: ag[i].partner }));

// ------------------------------------------------------------------ configurations
const CFG = [
  { id: "sop", label: "SOP-BERT", kind: "sop", names: SOP_NAMES, items: ITEMS.sop },
  { id: "vss", label: "VSS (own cut)", kind: "vss", names: VSS_NAMES, items: ITEMS.vss },
  { id: "vssb", label: "VSS on the BERT cut", kind: "vss", names: VSS_NAMES, items: ITEMS.vssb },
  { id: "sop_ag_vssb", label: "SOP-BERT + agreement (VSS on the BERT cut)", kind: "sop", names: SOP_NAMES.concat(AGREE), items: withAgree(ITEMS.sop, AG.sop_vssb), partner: "vssb" },
  { id: "sop_ag_vss", label: "SOP-BERT + agreement (VSS own cut)", kind: "sop", names: SOP_NAMES.concat(AGREE), items: withAgree(ITEMS.sop, AG.sop_vss), partner: "vss" },
  { id: "vss_ag", label: "VSS + agreement (SOP-BERT)", kind: "vss", names: VSS_NAMES.concat(AGREE), items: withAgree(ITEMS.vss, AG.vss_sop), partner: "sop" },
  { id: "vssb_ag", label: "VSS on the BERT cut + agreement (SOP-BERT)", kind: "vss", names: VSS_NAMES.concat(AGREE), items: withAgree(ITEMS.vssb, AG.vssb_sop), partner: "sop" },
  { id: "rule_vssb", label: "both agree (SOP-BERT and VSS on the BERT cut)", rule: true, items: withAgree(ITEMS.sop, AG.sop_vssb), partner: "vssb" },
  { id: "rule_vss", label: "both agree (SOP-BERT and VSS own cut)", rule: true, items: withAgree(ITEMS.sop, AG.sop_vss), partner: "vss" },
];
const Gcal = ids.filter(isCal).reduce((a, id) => a + GOLD.get(id), 0), Gtest = ids.filter((id) => !isCal(id)).reduce((a, id) => a + GOLD.get(id), 0);
const C = Object.fromEntries(CFG.map((c) => [c.id, c]));
for (const c of CFG) {
  const cal = c.items.filter((x) => x.cal);
  if (c.rule) {   // no confidence: executed when agree = 1
    for (const x of c.items) x.c = x.f.agree;
    c.calItems = cal.map((x) => ({ c: x.c, o: x.o, id: x.id })); c.t = 0.5; c.ct = { t: 0.5, score: scoreOf(stats(c.calItems, Gcal, 0.5)), n: c.calItems.filter((x) => x.c >= 0.5).length, kind: "rule" };
    continue;
  }
  c.fit = fitReader(cal, c);
  c.calItems = cal.map((x, i) => ({ c: c.fit.oof[i], o: x.o, id: x.id }));
  c.ct = costThreshold(c.calItems, Gcal); c.t = c.ct.t;
  let ci = 0; for (const x of c.items) x.c = x.cal ? c.fit.oof[ci++] : c.fit.model.score(x);   // calibration: out-of-fold; test: the final model
}
const testItems = (c) => c.items.filter((x) => !x.cal).map((x) => ({ c: c.rule ? x.c : c.fit.model.score(x), o: x.o, id: x.id }));
for (const c of CFG) { c.tItems = testItems(c); c.calSt = stats(c.calItems, Gcal, c.t); c.testSt = stats(c.tItems, Gtest, c.t); c.calAll = stats(c.calItems, Gcal, -Infinity); c.testAll = stats(c.tItems, Gtest, -Infinity); }

// ------------------------------------------------------------------ bootstrap (messages; seed 1; the same draws for every configuration)
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const q = (a, z) => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.max(0, Math.floor(z * a.length)))] : NaN; };
function perMsg(itemsC, t, part) {   // id -> {g, r, bad}
  const msgIds = ids.filter((id) => (part === "cal" ? isCal(id) : !isCal(id))), per = new Map(msgIds.map((id) => [id, { g: GOLD.get(id), r: 0, bad: 0 }]));
  for (const x of itemsC) if (x.c >= t) { const e = per.get(x.id); if (x.o === "right") e.r++; else e.bad++; }
  return msgIds.map((id) => per.get(id));
}
function bootScore(c, part) {   // 95% interval of the score
  const arr = perMsg(part === "cal" ? c.calItems : c.tItems, c.t, part), rand = rng(SEED), sc = [];
  for (let b = 0; b < BOOT; b++) { let g = 0, r = 0, bad = 0; for (let i = 0; i < arr.length; i++) { const e = arr[Math.floor(rand() * arr.length)]; g += e.g; r += e.r; bad += e.bad; } sc.push(((r - COST * bad) / g) * 100); }
  return [q(sc, 0.025), q(sc, 0.975)];
}
function bootDiff(c1, c0, part) {   // paired: score(c1) - score(c0)
  const a1 = perMsg(part === "cal" ? c1.calItems : c1.tItems, c1.t, part), a0 = perMsg(part === "cal" ? c0.calItems : c0.tItems, c0.t, part), rand = rng(SEED), d = [];
  for (let b = 0; b < BOOT; b++) { let g = 0, r1 = 0, b1 = 0, r0 = 0, b0 = 0; for (let i = 0; i < a1.length; i++) { const j = Math.floor(rand() * a1.length); g += a1[j].g; r1 += a1[j].r; b1 += a1[j].bad; r0 += a0[j].r; b0 += a0[j].bad; } d.push(((r1 - COST * b1) - (r0 - COST * b0)) / g * 100); }
  const p1 = scoreOf(part === "cal" ? c1.calSt : c1.testSt), p0 = scoreOf(part === "cal" ? c0.calSt : c0.testSt);
  return { point: p1 - p0, ci: [q(d, 0.025), q(d, 0.975)] };
}
const ci = (a) => `[${s1(a[0])}, ${s1(a[1])}]`;

// ------------------------------------------------------------------ report
const nCal = ids.filter(isCal).length, nTest = ids.length - nCal;
log(`Records: ${RECDIR} (combine/collect_pair.mjs). Calibration part ${nCal} messages / ${Gcal} requested actions; test part ${nTest} messages / ${Gtest} requested actions.`);
log(`Cost score = (right − ${COST} × (executed wrong + extras executed)) per 100 requested actions. "cal (oof)" = calibration part, out-of-fold confidences (where everything is fitted and chosen). "test (already read; exploratory)" = the test part, scored once, never used to choose.\n`);
const table = (title, cols, rows) => { log(`\n${title}\n`); log(`| situation | ${cols.map((c) => c.label).join(" | ")} |`); log(`|---|${cols.map(() => "---").join("|")}|`); for (const [name, fn] of rows) log(`| ${name} | ${cols.map(fn).join(" | ")} |`); };
const thrTxt = (c) => (c.rule ? "none (rule: agree = 1)" : c.ct.kind === "threshold" ? c.t.toFixed(4) : c.ct.kind);
const execRows = (part) => {
  const S = (c) => (part === "cal" ? c.calAll : c.testAll), tag = part === "cal" ? "cal" : "test (already read; exploratory)";
  return [[`execute all, right % (${tag})`, (c) => pc(S(c).cov)], [`execute all, wrong % (${tag})`, (c) => pc(S(c).wrong_all)], [`execute all, not done % (${tag})`, (c) => pc(S(c).unread)], [`execute all, extras (${tag})`, (c) => String(S(c).e)], [`execute all, cost score (${tag})`, (c) => s1(scoreOf(S(c)))]];
};
const gatedRows = (part) => {
  const S = (c) => (part === "cal" ? c.calSt : c.testSt), tag = part === "cal" ? "cal (oof)" : "test (already read; exploratory)";
  return [[`cost score (${tag})`, (c) => `${s1(scoreOf(S(c)))} ${ci(bootScore(c, part))}`], [`done right % of requested (${tag})`, (c) => pc(S(c).cov)], [`confidently wrong % of executed (${tag})`, (c) => `${pc(S(c).conf_wrong)} (${S(c).w + S(c).e} of ${S(c).n})`],
    [`asked % (${tag})`, (c) => pc(S(c).asked)], [`extras executed (${tag})`, (c) => String(S(c).e)]];
};
const fitRows = [["produced requests (cal / test)", (c) => `${c.calItems.length} / ${c.tItems.length}`], ["L2 · AUROC cal (oof)", (c) => (c.rule ? "-" : `${c.fit.lam} · ${f3(c.fit.oofAuc)}`)],
  ["AUROC test (already read; exploratory)", (c) => (c.rule ? "-" : f3(auroc(c.tItems.map((x) => ({ c: x.c, ok: x.o === "right" })))))], ["cost-score threshold (chosen on cal oof)", thrTxt]];

log("## Check against the arms (fresh2/VERDICTS.md)\n");
log(`SOP-BERT: threshold ${thrTxt(C.sop)}, cal score ${s1(C.sop.ct.score)} (${C.sop.ct.n} executed), test score ${s1(scoreOf(C.sop.testSt))}; execute all (test) ${pc(C.sop.testAll.cov)} / ${pc(C.sop.testAll.wrong_all)} / ${pc(C.sop.testAll.unread)} + ${C.sop.testAll.e}. Arm BERT-G: 0.8233 (24.8, 401); 14.4; 78.7 / 18.1 / 3.2 + 107.`);
log(`VSS: threshold ${thrTxt(C.vss)}, cal score ${s1(C.vss.ct.score)} (${C.vss.ct.n} executed), test score ${s1(scoreOf(C.vss.testSt))}; execute all (test) ${pc(C.vss.testAll.cov)} / ${pc(C.vss.testAll.wrong_all)} / ${pc(C.vss.testAll.unread)} + ${C.vss.testAll.e}. Arm VSS-G: 0.8964 (8.2, 115); 12.9; 60.4 / 18.8 / 20.8 + 118.`);

log("\n## A. The VSS reader on the SOP-BERT cut");
const A = [C.vss, C.vssb, C.sop];
table("### A1. Executing everything (no threshold)", A, [...execRows("cal"), ...execRows("test")]);
table("### A2. The fits and the gate at the cost-score threshold", A, [...fitRows, ...gatedRows("cal"), ...gatedRows("test")]);
const dA = bootDiff(C.vssb, C.vss, "cal"), dAt = bootDiff(C.vssb, C.vss, "test");
log(`\nVerdict line (cal oof): VSS on the BERT cut − VSS own cut = ${s1(dA.point)} ${ci(dA.ci)} → ${dA.ci[0] > 0 ? "interval above 0: A worked" : "interval not above 0: not shown"}. Test part (already read; exploratory): ${s1(dAt.point)} ${ci(dAt.ci)}.`);
// units of the BERT cut that VSS left unread
{ let units = 0, prod = 0; for (const r of REC.vssb) { units += r.units; prod += r.vss.length; } log(`VSS on the BERT cut: ${units} units of the BERT cut over the 600 messages, ${prod} produced requests (a unit gives none when VSS finds no action word or more than half of its tokens cannot be placed).`); }

log("\n## B. Agreement between the two readers");
// agreement descriptives (cal)
const desc = (c) => { const cal = c.items.filter((x) => x.cal), ag = cal.filter((x) => x.f.agree === 1), pa = cal.filter((x) => x.partner >= 0);
  return { n: cal.length, paired: pa.length, agree: ag.length, agreeRight: ag.filter((x) => x.ok).length, notAgree: cal.length - ag.length, notAgreeRight: cal.filter((x) => x.f.agree !== 1 && x.ok).length }; };
const B0 = [C.sop_ag_vssb, C.sop_ag_vss, C.vss_ag, C.vssb_ag];
log("\n### B0. How often the readers agree (calibration part; a request agrees when the other reader has a request of the same act with the same values on every key)\n");
log(`| situation | ${B0.map((c) => c.label.replace(" + agreement", ", agreement with")).join(" | ")} |`); log(`|---|${B0.map(() => "---").join("|")}|`);
const D = B0.map(desc);
log(`| produced requests | ${D.map((d) => d.n).join(" | ")} |`);
log(`| paired with a request of the other reader (same act) | ${D.map((d) => `${d.paired} (${pc(d.paired / d.n)})`).join(" | ")} |`);
log(`| agree (same act, same values) | ${D.map((d) => `${d.agree} (${pc(d.agree / d.n)})`).join(" | ")} |`);
log(`| right among those that agree | ${D.map((d) => pc(d.agreeRight / d.agree)).join(" | ")} |`);
log(`| right among those that do not agree | ${D.map((d) => pc(d.notAgreeRight / d.notAgree)).join(" | ")} |`);
log(`| right among all produced | ${D.map((d) => pc((d.agreeRight + d.notAgreeRight) / d.n)).join(" | ")} |`);

table("### B1. SOP-BERT with agreement", [C.sop, C.sop_ag_vssb, C.sop_ag_vss], [...fitRows, ...gatedRows("cal"), ...gatedRows("test")]);
table("### B2. VSS with agreement", [C.vss, C.vss_ag, C.vssb, C.vssb_ag], [...fitRows, ...gatedRows("cal"), ...gatedRows("test")]);
table("### B3. The rule \"execute only when both agree\" (SOP-BERT's request, executed once; no confidence)", [C.rule_vssb, C.rule_vss, C.sop], [["threshold", thrTxt], ...gatedRows("cal"), ...gatedRows("test")]);
for (const c of [C.rule_vssb, C.rule_vss]) {   // the two outcomes of an agreeing pair
  const P = ITEMS[c.partner]; let n = 0, diff = 0; c.items.forEach((x) => { if (x.f.agree === 1) { n++; if (P[x.partner].o !== x.o) diff++; } });
  log(`${c.label}: ${n} agreeing pairs (both parts); the two requests of a pair have different outcomes in ${diff} (the same act and values, paired to different gold requests).`);
}
const verdict = (c1, c0, name) => { const d = bootDiff(c1, c0, "cal"), dt = bootDiff(c1, c0, "test");
  log(`\nVerdict line, ${name} (cal oof): ${c1.label} − ${c0.label} = ${s1(d.point)} ${ci(d.ci)} → ${d.ci[0] > 0 ? "interval above 0: B worked" : "interval not above 0: not shown"}. Test part (already read; exploratory): ${s1(dt.point)} ${ci(dt.ci)}.`); };
verdict(C.sop_ag_vssb, C.sop, "SOP-BERT");
verdict(C.vss_ag, C.vss, "VSS");
log("Beside (not verdicts): " + [[C.sop_ag_vss, C.sop], [C.vssb_ag, C.vssb], [C.vssb, C.vss], [C.rule_vssb, C.sop], [C.rule_vss, C.sop]].map(([a, b]) => { const d = bootDiff(a, b, "cal"); return `${a.label} − ${b.label}: ${s1(d.point)} ${ci(d.ci)} (cal oof)`; }).join("; ") + ".");

// false negatives of VSS / confident mistakes of SOP-BERT
function flows(base, plus, part) {   // same items in the same order (plus = base + agreement)
  const B = part === "cal" ? base.calItems : base.tItems, P = part === "cal" ? plus.calItems : plus.tItems;
  const o = { fnBase: 0, fnNowExec: 0, fpBase: 0, fpNowAsked: 0, rightLost: 0, badNew: 0, execBase: 0, execPlus: 0 };
  B.forEach((x, i) => { const eb = x.c >= base.t, ep = P[i].c >= plus.t, ok = x.o === "right"; if (eb) o.execBase++; if (ep) o.execPlus++;
    if (ok && !eb) { o.fnBase++; if (ep) o.fnNowExec++; } if (!ok && eb) { o.fpBase++; if (!ep) o.fpNowAsked++; } if (ok && eb && !ep) o.rightLost++; if (!ok && !eb && ep) o.badNew++; });
  return o;
}
log("\n### B4. VSS's false negatives and SOP-BERT's confident mistakes, with agreement (each configuration at its own cost-score threshold)\n");
log("| situation | VSS → VSS + agreement, cal (oof) | VSS → VSS + agreement, test (already read; exploratory) | SOP-BERT → SOP-BERT + agreement (VSS on the BERT cut), cal (oof) | SOP-BERT → SOP-BERT + agreement (VSS on the BERT cut), test (already read; exploratory) |\n|---|---|---|---|---|");
const F = [flows(C.vss, C.vss_ag, "cal"), flows(C.vss, C.vss_ag, "test"), flows(C.sop, C.sop_ag_vssb, "cal"), flows(C.sop, C.sop_ag_vssb, "test")];
log(`| executed: alone → with agreement | ${F.map((o) => `${o.execBase} → ${o.execPlus}`).join(" | ")} |`);
log(`| right readings asked alone (false negatives) | ${F.map((o) => o.fnBase).join(" | ")} |`);
log(`| ... of which executed with agreement | ${F.map((o) => `${o.fnNowExec} (${pc(o.fnNowExec / o.fnBase)})`).join(" | ")} |`);
log(`| wrong or extra executed alone (confident mistakes) | ${F.map((o) => o.fpBase).join(" | ")} |`);
log(`| ... of which asked with agreement (caught) | ${F.map((o) => `${o.fpNowAsked} (${pc(o.fpNowAsked / o.fpBase)})`).join(" | ")} |`);
log(`| wrong or extra asked alone, executed with agreement (new mistakes) | ${F.map((o) => o.badNew).join(" | ")} |`);
log(`| right executed alone, asked with agreement (lost) | ${F.map((o) => o.rightLost).join(" | ")} |`);

// the weights of the agreement signals
log("\nWeights of the agreement signals in the final fits (percentile scale; intercept and the other signals not shown): " + [C.sop_ag_vssb, C.sop_ag_vss, C.vss_ag, C.vssb_ag].map((c) => { const n = c.names.length, w = c.fit.model.w; return `${c.label}: agree ${w[n - 1].toFixed(2)}, agree_share ${w[n].toFixed(2)}`; }).join("; ") + ".");

writeFileSync(OUT, out.join("\n") + "\n");
console.log(out.join("\n"));
