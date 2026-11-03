// fresh2/verdicts.mjs: the three verdicts of FEEDBACK_PLAN.md (with the 2026-11-02 19:10 cost-score amendment) from the records of the four arms.
//   node training/sketch/fresh2/verdicts.mjs --out <verdicts.md> --data <data dir> [--data <data dir> ..] \
//        --vss-g <arm> --vss-t <arm> --bert-g <arm> --bert-t <arm> [--standin]
//   <arm> = <records dir>[@<records file>][=<row label>]:
//     records dir   the arm's records as written by its job (results/<job>/records); its report.md is results/<job>/report.md (checked if present)
//     records file  without ".jsonl"; default vss_arm for the VSS arms, sop_arm_own for the BERT arms (fit_report.mjs ARM readers)
//     row label     the row of the cost-score table of that report.md to compare with (default: the first row starting "VSS" / "SOP-BERT")
//   <data dir>: the annotated writer folders, as for fit_report.mjs (training/sketch/llm_bench/fresh2/opus_{a,b,c,d}).
//   --standin     the records are NOT the arms (a code test): numbers are printed, the verdict lines are replaced by "n/a (stand-in records)".
//   --json <file> (TRAIN_PLAN_1103.md, job 072: G = the shipped readers, T = the retrained ones) also writes, per arm, the test score with its
//                 interval, the share done right and confidently wrong, and the paired differences VSS-T - VSS-G and BERT-T - BERT-G
//                 (same resamples) as JSON. Without it the output is exactly as before.
// The fit of each arm is fit_report.mjs's, copied unchanged (same split, same percentile maps / prior / L2 grid / 5 folds, same out-of-fold
// cost-score threshold on the fresh2 calibration part only, no CAL_FOLDERS); each arm's test score is checked against its report.md.
// Bootstrap: BOOT resamples (default 1000) of the test messages, seed SEED (default 1), the SAME index draws for every arm (paired), the same
// quantiles as fit_report.mjs. Env: MINEXEC (50), BOOT, SEED, COST (10) as in fit_report.mjs.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, dirname } from "node:path";
import { percentile } from "../precision_confidence.mjs";

// ------------------------------------------------------------------ arguments
const A = process.argv.slice(2), ARG = { data: [] };
for (let i = 0; i < A.length; i++) {
  const a = A[i];
  if (a === "--standin") ARG.standin = true;
  else if (a === "--data") ARG.data.push(A[++i]);
  else if (/^--(out|vss-g|vss-t|bert-g|bert-t|json)$/.test(a)) ARG[a.slice(2)] = A[++i];
  else { console.error(`unknown argument ${a}`); process.exit(2); }
}
for (const k of ["out", "vss-g", "vss-t", "bert-g", "bert-t"]) if (!ARG[k] || !ARG.data.length) { console.error("usage: verdicts.mjs --out <md> --data <dir>.. --vss-g <arm> --vss-t <arm> --bert-g <arm> --bert-t <arm> [--standin]"); process.exit(2); }
const MINEXEC = process.env.MINEXEC ? +process.env.MINEXEC : 50, BOOT = process.env.BOOT ? +process.env.BOOT : 1000, SEED = process.env.SEED ? +process.env.SEED : 1;
const COST = process.env.COST ? +process.env.COST : 10;
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const pc = (x) => (Number.isFinite(x) ? (x * 100).toFixed(1) : "-"), f3 = (x) => (Number.isFinite(x) ? x.toFixed(3) : "-");
const sc1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : "-");

// ------------------------------------------------------------------ messages and split (fit_report.mjs, no CAL_FOLDERS)
const META = new Map();
for (const d of ARG.data) {
  const files = readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort();
  for (const r of files.flatMap((f) => readJ(`${d}/${f}`))) {
    if (!Array.isArray(r.wires) || META.has(r.id)) continue;
    META.set(r.id, { writer: basename(d) });
  }
}
const isCal = (id) => BigInt("0x" + createHash("sha256").update(id).digest("hex")) % 3n === 0n;
const meta = (id) => { const m = META.get(id); if (!m) throw new Error(`record id ${id} is not in the data dirs`); return m; };
const kindOf = (act) => { const t = String(act).split(":")[0]; return t === "command" ? "command" : t === "question" ? "question" : "fact/rule"; };

// ------------------------------------------------------------------ copied unchanged from fit_report.mjs
function auroc(it) {
  const pos = it.filter((x) => x.ok).map((x) => x.c), neg = it.filter((x) => !x.ok).map((x) => x.c).sort((a, b) => a - b);
  if (!pos.length || !neg.length) return NaN;
  let s = 0; for (const p of pos) { let lo = 0, hi = neg.length; while (lo < hi) { const m = (lo + hi) >> 1; if (neg[m] < p) lo = m + 1; else hi = m; } let eq = lo; while (eq < neg.length && neg[eq] === p) eq++; s += lo + (eq - lo) / 2; }
  return s / (pos.length * neg.length);
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
function fitTable(vals, sign) {   // the table of precision_bert.mjs (a signal with values in {0, 1} is binary)
  const v = vals.filter((x) => x != null).map((x) => x * sign).sort((a, b) => a - b), n = v.length;
  const binary = v.every((x) => x === 0 || Math.abs(x) === 1);
  const values = [], below = [];
  for (let i = 0; i < n; i++) if (i === 0 || v[i] !== v[i - 1]) { values.push(v[i]); below.push(i); }
  return { sign, binary, n, values, below };
}
function operatingPoint(items, p) {   // lowest t with precision >= p and >= MINEXEC executed; null if none
  const s = items.slice().sort((a, b) => b.c - a.c), cand = []; let right = 0;
  for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") right++; j++; } cand.push({ t: s[i].c, n: j, right }); i = j; }
  for (let k = cand.length - 1; k >= 0; k--) if (cand[k].n >= MINEXEC && cand[k].right / cand[k].n >= p) return cand[k];
  return null;
}
function stats(items, G, t) {   // execute when c >= t (-Infinity: all, Infinity: none); items [{c, o}]
  let r = 0, w = 0, e = 0, ar = 0, aw = 0;
  for (const x of items) { if (x.c >= t) { if (x.o === "right") r++; else if (x.o === "wrong") w++; else e++; } else if (x.o === "right") ar++; else if (x.o === "wrong") aw++; }
  const n = r + w + e, tr = r + ar, tw = w + aw;
  return { n, r, w, e, bad: w + e, conf_wrong: n ? (w + e) / n : NaN, cov: G ? r / G : NaN, asked: G ? (ar + aw) / G : NaN, unread: G ? (G - tr - tw) / G : NaN, wrong_all: G ? tw / G : NaN, G };
}
function curveAt(items, G, target) {   // most requests done right with confidently wrong <= target, over the confidence-ordered prefixes (block ends)
  const s = items.slice().sort((a, b) => b.c - a.c); let r = 0, bad = 0, best = null;
  for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") r++; else bad++; j++; } if (bad / j <= target + 1e-12) best = r; i = j; }
  return best == null ? NaN : best / G;
}
// ------------------------------------------------------------------ the cost score (AGENTS.md, owner 2026-11-02 19:09)
// score = (requests done right - COST * (executed wrong + extras executed)) / requested actions * 100; asked / not done = 0.
const scoreOf = (st, cost = COST) => (st.G ? ((st.r - cost * (st.w + st.e)) / st.G) * 100 : NaN);
function costThreshold(oofItems, G, cost = COST) {   // the t maximising the score on out-of-fold items [{c, o}]; ties keep the HIGHER (more cautious) t
  const s = oofItems.slice().sort((a, b) => b.c - a.c); let r = 0, bad = 0, best = { t: Infinity, score: 0, n: 0, kind: "asks everything" };
  for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") r++; else bad++; j++; }
    const sc = ((r - cost * bad) / G) * 100; if (sc > best.score + 1e-12) best = { t: s[i].c, score: sc, n: j, kind: "threshold" }; i = j; }
  const all = ((r - cost * bad) / G) * 100;   // r, bad now count everything: the "execute everything" candidate
  if (best.kind === "threshold" && best.n === s.length) best = { t: -Infinity, score: best.score, n: s.length, kind: "executes everything" };
  else if (all > best.score + 1e-12) best = { t: -Infinity, score: all, n: s.length, kind: "executes everything" };
  return best;
}
// ------------------------------------------------------------------ the two learned confidences: signals
const VSS_NAMES = [["cut_start", 1], ["cut_end", 1], ["world_gap", 1], ["world_rank", 1], ["wnu_gap", 1], ["tie", 1], ["role_min", 1], ["residual", -1], ["unplaced", -1], ["abstain", -1], ["notu_frac", -1], ["ctx_fill", -1], ["ctx_margin", 1], ["world_prior", 1]];   // the event stage (event_gap, event_agree, event_margin) left out
const SOP_NAMES = [["act_p", 1], ["act_margin", 1], ["act_negent", 1], ["act_prior", 1], ["val_p_min", 1], ["val_margin_min", 1], ["none_p_min", 1], ["fill_p_min", 1], ["fill_margin_min", 1], ["ctx_fill", -1],
  ["tag_p_min", 1], ["tag_margin_min", 1], ["tag_all_min", 1], ["tag_stray", -1], ["desc_p_min", 1], ["desc_margin_min", 1], ["cut_start", 1], ["cut_end", 1], ["cut_inner_min", 1],
  ["unk_share", -1], ["split_share", -1], ["n_words", 1], ["n_roles", 1], ["n_units", 1]];
const KINDS = {
  vss: { names: VSS_NAMES, prior: "world_prior", key: (x) => x.w || "none", priorKeyDefault: "none" },
  sop: { names: SOP_NAMES, prior: "act_prior", key: (x) => x.act, priorKeyDefault: null },
};
const FOLDS = 5, LAMS = [0.01, 0.1, 1, 10];
function fitModel(rows, kind, lam) {   // rows: [{ok, f, w|act}]; percentile maps and prior from these rows only
  const K = KINDS[kind], overall = rows.filter((x) => x.ok).length / rows.length, ar = {};
  for (const x of rows) { const k = K.key(x); (ar[k] ||= [0, 0]); ar[k][1]++; if (x.ok) ar[k][0]++; }
  const prior = Object.fromEntries(Object.entries(ar).map(([k, [r, n]]) => [k, (r + overall * 5) / (n + 5)]));
  const raw = (x, n) => (n === K.prior ? (prior[K.key(x)] ?? overall) : x.f[n]);
  const tables = Object.fromEntries(K.names.map(([n, s]) => [n, fitTable(rows.map((x) => raw(x, n)), s)]));
  const vec = (x) => K.names.map(([n]) => percentile(tables[n], raw(x, n)));
  const w = logistic(rows.map(vec), rows.map((x) => (x.ok ? 1 : 0)), lam);
  return { kind, lam, prior, overall, tables, w, score: (x) => sigm(w, vec(x)) };
}
function fitReader(items, kind) {   // items: calibration produced requests [{mi, o, ok, f, ...}]
  if (items.length < 20 || !items.some((x) => x.ok) || items.every((x) => x.ok)) return null;
  const foldOf = (x) => x.mi % FOLDS;
  let best = null;
  for (const lam of LAMS) {
    const oof = new Array(items.length);
    for (let k = 0; k < FOLDS; k++) {
      const tr = items.filter((x) => foldOf(x) !== k);
      if (tr.length < 5 || !tr.some((x) => x.ok) || tr.every((x) => x.ok)) { items.forEach((x, i) => { if (foldOf(x) === k) oof[i] = 0.5; }); continue; }
      const m = fitModel(tr, kind, lam); items.forEach((x, i) => { if (foldOf(x) === k) oof[i] = m.score(x); });
    }
    const a = auroc(items.map((x, i) => ({ c: oof[i], ok: x.ok })));
    if (!best || a > best.auc + 1e-9) best = { lam, auc: a, oof };
  }
  const model = fitModel(items, kind, best.lam);
  const oofItems = items.map((x, i) => ({ c: best.oof[i], o: x.o }));
  const thr = {}; for (const p of [0.95, 0.97, 0.99]) { const o = operatingPoint(oofItems, p); thr[p] = o ? { t: o.t, n: o.n, prec: o.right / o.n } : null; }
  return { model, lam: best.lam, oofAuc: best.auc, thr, nCal: items.length, oofItems };
}

// ------------------------------------------------------------------ one arm: records -> reader (fit_report.mjs itemsOf / fit / calOof)
function parseArm(spec, kind) {
  const m = /^([^@=]+)(?:@([^=]+))?(?:=(.+))?$/.exec(spec);
  return { dir: m[1].replace(/\/$/, ""), file: m[2] || (kind === "vss" ? "vss_arm" : "sop_arm_own"), label: m[3] || null, kind };
}
function buildArm(name, spec, kind) {
  const R = { name, ...parseArm(spec, kind) };
  const f = `${R.dir}/${R.file}.jsonl`;
  if (!existsSync(f)) throw new Error(`${name}: ${f} not found`);
  const recs = readJ(f), calIdx = new Map(); let nc = 0;
  R.msgs = recs.map((r) => { meta(r.id); const cal = isCal(r.id); if (cal && !calIdx.has(r.id)) calIdx.set(r.id, nc++); return { id: r.id, cal, gold: r.gold }; });
  R.items = [];
  recs.forEach((r, k) => {
    for (const x of kind === "vss" ? r.vss : r.sop) {
      const pa = kind === "sop" ? x.pa : x.a ?? x.pa;
      R.items.push({ k, id: r.id, cal: R.msgs[k].cal, mi: calIdx.get(r.id) ?? -1, o: x.o, ok: x.o === "right", f: x.f, w: x.w, act: x.act, pa, kind: kindOf(pa) });
    }
  });
  R.G = { cal: R.msgs.filter((m) => m.cal).reduce((a, m) => a + m.gold, 0), test: R.msgs.filter((m) => !m.cal).reduce((a, m) => a + m.gold, 0) };
  R.nMsg = { cal: R.msgs.filter((m) => m.cal).length, test: R.msgs.filter((m) => !m.cal).length };
  R.fit = fitReader(R.items.filter((x) => x.cal), kind);
  if (!R.fit) throw new Error(`${name}: too few or one-sided calibration requests, not fitted (fit_report.mjs would ask everything)`);
  for (const x of R.items) x.c = R.fit.model.score(x);
  R.ct = costThreshold(R.fit.oofItems, R.G.cal);   // calOof(R) of fit_report.mjs
  R.t = R.ct.t;
  R.test = R.items.filter((x) => !x.cal).map((x) => ({ c: x.c, o: x.o, id: x.id }));
  R.st = stats(R.test, R.G.test, R.t);            // at the cost-score threshold
  R.stAll = stats(R.test, R.G.test, -Infinity);   // execute everything
  R.score = scoreOf(R.st);
  R.cur3 = curveAt(R.test, R.G.test, 0.03);       // requests done right at <= 3% confidently wrong (test part's own curve), reported beside
  return R;
}
const ARMS = { "VSS-G": buildArm("VSS-G", ARG["vss-g"], "vss"), "VSS-T": buildArm("VSS-T", ARG["vss-t"], "vss"), "BERT-G": buildArm("BERT-G", ARG["bert-g"], "sop"), "BERT-T": buildArm("BERT-T", ARG["bert-t"], "sop") };
const AL = Object.values(ARMS);

// ------------------------------------------------------------------ paired bootstrap over the test messages (rng and quantiles of fit_report.mjs)
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const testIds = [...new Set([...META.keys()].filter((id) => !isCal(id)))].sort();
for (const R of AL) {   // every arm must have read the same test messages (the pairing is by message)
  const ids = new Set(R.msgs.filter((m) => !m.cal).map((m) => m.id));
  if (ids.size !== testIds.length || testIds.some((id) => !ids.has(id))) console.error(`WARNING: ${R.name} records do not cover exactly the ${testIds.length} test messages (${ids.size})`);
}
const rand = rng(SEED), N = testIds.length, DRAWS = [];
for (let b = 0; b < BOOT; b++) { const d = new Int32Array(N); for (let i = 0; i < N; i++) d[i] = Math.floor(rand() * N); DRAWS.push(d); }
for (const R of AL) {
  const per = new Map(testIds.map((id) => [id, { g: 0, r: 0, bad: 0, items: [] }]));
  for (const m of R.msgs) if (!m.cal) per.get(m.id).g = m.gold;
  for (const x of R.test) { const e = per.get(x.id); e.items.push(x); if (x.c >= R.t) { if (x.o === "right") e.r++; else e.bad++; } }
  R.per = testIds.map((id) => per.get(id));
  R.bScore = new Float64Array(BOOT); R.bCur3 = new Float64Array(BOOT); R.bDone = new Float64Array(BOOT); let nan3 = 0;
  for (let b = 0; b < BOOT; b++) {
    let g = 0, r = 0, bad = 0; const its = [];
    for (const i of DRAWS[b]) { const e = R.per[i]; g += e.g; r += e.r; bad += e.bad; for (const x of e.items) its.push(x); }
    R.bScore[b] = g ? ((r - COST * bad) / g) * 100 : NaN;
    R.bDone[b] = g ? (r / g) * 100 : NaN;
    const c3 = curveAt(its, g, 0.03); if (Number.isNaN(c3)) { nan3++; R.bCur3[b] = 0; } else R.bCur3[b] = c3 * 100;   // no prefix within 3%: nothing executed = 0 done right
  }
  R.nan3 = nan3;
}
const ciOf = (arr) => { const s = Array.from(arr).filter(Number.isFinite).sort((x, y) => x - y); const q = (z) => (s.length ? s[Math.min(s.length - 1, Math.max(0, Math.floor(z * s.length)))] : NaN); return [q(0.025), q(0.975)]; };
const diffArr = (f) => { const o = new Float64Array(BOOT); for (let b = 0; b < BOOT; b++) o[b] = f(b); return o; };
const cur3pt = (R) => (Number.isFinite(R.cur3) ? R.cur3 * 100 : 0);

function three(metric) {   // metric: "score" or "cur3"; the point value and the paired bootstrap array of an arm
  const pt = (R) => (metric === "score" ? R.score : cur3pt(R)), bs = (R) => (metric === "score" ? R.bScore : R.bCur3);
  const d1 = diffArr((b) => bs(ARMS["VSS-T"])[b] - bs(ARMS["VSS-G"])[b]), d1pt = pt(ARMS["VSS-T"]) - pt(ARMS["VSS-G"]);
  const d2 = diffArr((b) => (bs(ARMS["VSS-T"])[b] - bs(ARMS["VSS-G"])[b]) - (bs(ARMS["BERT-T"])[b] - bs(ARMS["BERT-G"])[b]));
  const d2pt = d1pt - (pt(ARMS["BERT-T"]) - pt(ARMS["BERT-G"]));
  const bertCI = ciOf(bs(ARMS["BERT-T"]));
  const c1 = ciOf(d1), c2 = ciOf(d2), vt = pt(ARMS["VSS-T"]);
  return { d1pt, c1, h1: c1[0] > 0, d2pt, c2, h2: c2[0] > 0, vt, bertCI, h3: vt >= bertCI[0] && vt <= bertCI[1] };
}
const V = three("score"), V3 = three("cur3");

// ------------------------------------------------------------------ check against each arm's own report.md
function checkReport(R) {
  const rp = `${dirname(R.dir)}/report.md`;
  if (!existsSync(rp)) return { name: R.name, rp, status: "no report.md found" };
  const lines = readFileSync(rp, "utf8").split("\n"), start = lines.findIndex((l) => l.startsWith("| reader | score-optimal threshold"));
  if (start < 0) return { name: R.name, rp, status: "no cost-score table in report.md" };
  const rows = []; for (let i = start + 2; i < lines.length && lines[i].startsWith("|"); i++) rows.push(lines[i]);
  const row = rows.find((l) => (R.label ? l.includes(`| ${R.label} |`) : R.kind === "vss" ? /^\| VSS/.test(l) : /^\| SOP-BERT/.test(l)));
  if (!row) return { name: R.name, rp, status: `no row${R.label ? ` "${R.label}"` : ""} in the cost-score table` };
  const cells = row.split("|").map((s) => s.trim()), thr = cells[2], tst = cells[3];
  const ci = ciOf(R.bScore), mine = `${sc1(R.score)} [${sc1(ci[0])}, ${sc1(ci[1])}]`;
  const mt = /^(\S+) \(([-\d.]+), (\d+)\)$/.exec(thr), myThr = R.ct.kind === "threshold" ? `${R.t.toFixed(4)} (${sc1(R.ct.score)}, ${R.ct.n})` : null;
  const thrOk = myThr ? thr === myThr : /executes everything|asks everything/.test(thr) && thr.includes(R.ct.kind === "executes everything" ? "executes" : "asks");
  return { name: R.name, rp, row: cells[1], theirs: tst, mine, theirsThr: thr, mineThr: myThr || R.ct.kind, ok: tst === mine && thrOk, scoreOk: tst === mine, thrOk };
}
const CHECKS = AL.map(checkReport);

// ------------------------------------------------------------------ report
const out = []; const log = (s = "") => out.push(s);
const SI = ARG.standin;
const word = (b, yes, no) => (SI ? "n/a (stand-in records, not a result)" : b ? `**${yes}**` : `${no}`);
const R0 = AL[0];
log("# Verdicts of FEEDBACK_PLAN.md (cost score), written by training/sketch/fresh2/verdicts.mjs\n");
if (SI) log("> **STAND-IN RUN, a test of the code.** The VSS-G / VSS-T records here are NOT the arms: they are shipped VSS records used only to exercise the script. No number or verdict on this page says anything about targeted data for VSS.\n");
log("Arms (records read):\n");
log("| arm | records | reader |\n|---|---|---|");
for (const R of AL) log(`| ${R.name} | ${R.dir}/${R.file}.jsonl | ${R.kind === "vss" ? "VSS" : "SOP-BERT"} |`);
log(`\nMessages: ${META.size} in the data dirs; calibration (fresh2 calibration part only, no CAL_FOLDERS) ${R0.nMsg.cal} messages / ${R0.G.cal} requested actions; test ${R0.nMsg.test} messages / ${R0.G.test} requested actions. Split: int(sha256(id), 16) % 3 == 0 is calibration. Each arm: confidences and the cost-score threshold fitted on the calibration part only (fit_report.mjs recipe, out-of-fold); the test part is only scored. Score = (done right - ${COST} x (executed wrong + extras executed)) / requested actions x 100. Bootstrap: ${BOOT} resamples of the ${N} test messages, seed ${SEED}, the same resamples for every arm (paired); intervals are the 2.5% and 97.5% quantiles.\n`);

log("## Check: each arm's score against its own report.md\n");
log("| arm | row of report.md | report.md: threshold (cal score, executed) and test score [95% CI] | this script | same? |\n|---|---|---|---|---|");
for (const c of CHECKS) log(c.row ? `| ${c.name} | ${c.row} | ${c.theirsThr}; ${c.theirs} | ${c.mineThr}; ${c.mine} | ${c.ok ? "yes" : "NO"} |` : `| ${c.name} | - | ${c.status} (${c.rp}) | ${sc1(ARMS[c.name].score)} | not checked |`);

log("\n## Per arm (test part, at the arm's own cost-score threshold)\n");
log("| arm | threshold | score [95% CI] | done right % | confidently wrong % (executed) | asked % | extras executed | execute-all right / wrong / not done % |\n|---|---|---|---|---|---|---|---|");
for (const R of AL) {
  const ci = ciOf(R.bScore), th = R.ct.kind === "threshold" ? R.t.toFixed(4) : R.ct.kind;
  log(`| ${R.name} | ${th} | ${sc1(R.score)} [${sc1(ci[0])}, ${sc1(ci[1])}] | ${pc(R.st.cov)} | ${pc(R.st.conf_wrong)} (${R.st.n} executed) | ${pc(R.st.asked)} | ${R.st.e} | ${pc(R.stAll.cov)} / ${pc(R.stAll.wrong_all)} / ${pc(R.stAll.unread)} (extras ${R.stAll.e}) |`);
}
log("\nRequests done right % at <= 3% confidently wrong (the test part's own curve; reported beside, NOT the verdict):\n");
log("| arm | done right % at <= 3% [95% CI] |\n|---|---|");
for (const R of AL) { const ci = ciOf(R.bCur3); log(`| ${R.name} | ${Number.isFinite(R.cur3) ? pc(R.cur3) : "- (no prefix within 3%)"} [${sc1(ci[0])}, ${sc1(ci[1])}]${R.nan3 ? ` (${R.nan3} of ${BOOT} resamples had no prefix within 3%, counted as 0)` : ""} |`);

}
const iv = (a) => `[${sc1(a[0])}, ${sc1(a[1])}]`, sg = (x) => (x >= 0 ? "+" : "") + sc1(x);
log("\n## Verdicts on the cost score (the measure)\n");
log("| # | quantity | point | 95% CI | verdict |\n|---|---|---|---|---|");
log(`| 1 | VSS-T - VSS-G (score) | ${sg(V.d1pt)} | ${iv(V.c1)} | ${word(V.h1, "targeting helps VSS", "interval not above 0: not shown")} |`);
log(`| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | ${sg(V.d2pt)} | ${iv(V.c2)} | ${word(V.h2, "helps VSS more than BERT", "interval not above 0: not shown")} |`);
log(`| 3 | VSS-T score vs the 95% CI of BERT-T's score | VSS-T ${sc1(V.vt)} | BERT-T ${iv(V.bertCI)} | ${word(V.h3, "VSS reaches SOP-BERT", "VSS-T outside BERT-T's interval: not reached")} |`);
log("\n## The same three on requests done right % at <= 3% confidently wrong (beside, not the verdict)\n");
log("| # | quantity | point (percentage points) | 95% CI | reading |\n|---|---|---|---|---|");
log(`| 1 | VSS-T - VSS-G | ${sg(V3.d1pt)} | ${iv(V3.c1)} | ${word(V3.h1, "interval above 0", "interval not above 0")} |`);
log(`| 2 | (VSS-T - VSS-G) - (BERT-T - BERT-G) | ${sg(V3.d2pt)} | ${iv(V3.c2)} | ${word(V3.h2, "interval above 0", "interval not above 0")} |`);
log(`| 3 | VSS-T vs the 95% CI of BERT-T | VSS-T ${sc1(V3.vt)} | BERT-T ${iv(V3.bertCI)} | ${word(V3.h3, "within", "outside")} |`);
log("\nA miss on any line is a negative result; no second try with the same test part (FEEDBACK_PLAN.md).");
writeFileSync(ARG.out, out.join("\n") + "\n");
if (ARG.json) {   // --json (see the head of the file): the numbers of the tables above, and both readers' paired differences T - G
  const dB = diffArr((b) => ARMS["BERT-T"].bScore[b] - ARMS["BERT-G"].bScore[b]), dV = diffArr((b) => ARMS["VSS-T"].bScore[b] - ARMS["VSS-G"].bScore[b]);
  const arm = (R) => ({ records: `${R.dir}/${R.file}.jsonl`, threshold: R.ct.kind === "threshold" ? R.t : R.ct.kind, score: R.score, ci: ciOf(R.bScore),
    done_right: R.st.cov, conf_wrong: R.st.conf_wrong, executed: R.st.n, extras_executed: R.st.e, all_right: R.stAll.cov, all_wrong: R.stAll.wrong_all, done_right_at_3pct: R.cur3 });
  writeFileSync(ARG.json, JSON.stringify({ data: ARG.data, boot: BOOT, seed: SEED, cost: COST, test_messages: N, test_requests: R0.G.test, cal_messages: R0.nMsg.cal,
    arms: Object.fromEntries(AL.map((R) => [R.name, arm(R)])),
    diff: { vss: { point: ARMS["VSS-T"].score - ARMS["VSS-G"].score, ci: ciOf(dV) }, bert: { point: ARMS["BERT-T"].score - ARMS["BERT-G"].score, ci: ciOf(dB) } } }, null, 1) + "\n");
}
console.log(out.join("\n"));
if (CHECKS.some((c) => c.row && !c.ok)) { console.error("CHECK FAILED: an arm's score differs from its report.md"); process.exit(1); }
