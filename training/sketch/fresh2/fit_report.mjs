// fresh2/fit_report.mjs: fits the confidences on the calibration part and writes the report of FRESH2_PLAN.md (test part).
//   node training/sketch/fresh2/fit_report.mjs <records dir> <report.md> <data dir> [<data dir> ...]
//   <data dir>: the writer folders of the annotated messages (e.g. training/sketch/llm_bench/fresh2/opus_a ..): the folder name is the
//   writer slice; ids, texts and gold wires come from the files the collectors read.
// Records (written by collect_*.mjs in <records dir>): rules_own, rules_vss, vss_r1, vss_r2, sop_shipped_own, sop_shipped_vss,
//   sop_all_own, sop_all_vss (.jsonl; a missing file leaves that reader out).
// Split: int(sha256(id), 16) % 3 == 0 -> calibration, else test. Fitting uses ONLY the calibration part; the test part is only scored.
// Recipe for both learned readers (FRESH2_PLAN.md): percentile maps, world / act prior and L2 fitted inside 5 folds of the calibration
// part (folds by message), L2 grid {0.01, 0.1, 1, 10} chosen by out-of-fold AUROC; threshold = the lowest confidence whose OUT-OF-FOLD
// precision of execution (right / (right + wrong + extra) over requests with confidence >= t) is >= 95 / 97 / 99% with >= MINEXEC (50)
// executed; the final model (refit on all of the calibration part) is applied to the test part with that threshold; no level reached:
// the reader asks about everything at that level. The old JSONs (precision_thresholds.json, precision_thresholds_bert.json) are applied
// unchanged. Env: MINEXEC (default 50; only the tiny pipeline test lowers it), BOOT (resamples, default 1000), SEED (default 1).
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename } from "node:path";
import { percentile, vssCombinedConfidence } from "../precision_confidence.mjs";
import { bertConfidence } from "../precision_confidence_bert.mjs";

const [RECDIR, REPORT, ...DATADIRS] = process.argv.slice(2);
if (!RECDIR || !REPORT || !DATADIRS.length) { console.error("usage: fit_report.mjs <records dir> <report.md> <data dir>..."); process.exit(2); }
const REPO = new URL("../../../", import.meta.url).pathname;
const MINEXEC = process.env.MINEXEC ? +process.env.MINEXEC : 50, BOOT = process.env.BOOT ? +process.env.BOOT : 1000, SEED = process.env.SEED ? +process.env.SEED : 1;
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const pc = (x) => (Number.isFinite(x) ? (x * 100).toFixed(1) : "-"), f3 = (x) => (Number.isFinite(x) ? x.toFixed(3) : "-");
const out = []; const log = (s = "") => out.push(s);

// ------------------------------------------------------------------ messages: writer slice, sentences, split
const META = new Map();
for (const d of DATADIRS) {
  const files = readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort();
  for (const r of files.flatMap((f) => readJ(`${d}/${f}`))) {
    if (!Array.isArray(r.wires) || META.has(r.id)) continue;
    const sent = r.text.split(/(?<=[.!?])\s+/).filter((s) => /[\p{L}\p{N}]/u.test(s)).length;
    META.set(r.id, { writer: basename(d), sent, lenClass: sent <= 1 ? "1 sentence" : sent <= 6 ? "2-6 sentences" : "7+ sentences" });
  }
}
const isCal = (id) => BigInt("0x" + createHash("sha256").update(id).digest("hex")) % 3n === 0n;
const meta = (id) => { const m = META.get(id); if (!m) throw new Error(`record id ${id} is not in the data dirs`); return m; };
const kindOf = (act) => { const t = String(act).split(":")[0]; return t === "command" ? "command" : t === "question" ? "question" : "fact/rule"; };

// ------------------------------------------------------------------ statistics
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
const COST = process.env.COST ? +process.env.COST : 10;
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

// ------------------------------------------------------------------ records -> readers
function load(name) { const f = `${RECDIR}/${name}.jsonl`; return existsSync(f) ? readJ(f) : null; }
const rawFiles = {};
for (const n of ["rules_own", "rules_vss", "vss_r1", "vss_r2", "sop_shipped_own", "sop_shipped_vss", "sop_all_own", "sop_all_vss"]) rawFiles[n] = load(n);
// a reader: {id, label, file, kind: rules|vss|sop, cut, old: json spec or null}. Items are built once per file: one per produced request.
function itemsOf(recs, kind) {
  const calIdx = new Map(); let nc = 0;
  const msgs = recs.map((r) => { const m = meta(r.id), cal = isCal(r.id); if (cal && !calIdx.has(r.id)) calIdx.set(r.id, nc++); return { id: r.id, cal, gold: r.gold, goldActs: r.goldActs, writer: m.writer, lenClass: m.lenClass }; });
  const items = [];
  recs.forEach((r, k) => {
    const prod = kind === "rules" ? r.rules : kind === "vss" ? r.vss : r.sop;
    for (const x of prod) {
      const pa = kind === "sop" ? x.pa : x.a ?? x.pa;
      items.push({ k, id: r.id, cal: msgs[k].cal, mi: calIdx.get(r.id) ?? -1, o: x.o, ok: x.o === "right", f: x.f, w: x.w, act: x.act, pa, kind: kindOf(pa) });
    }
  });
  return { msgs, items };
}
const READERS = [];
const add = (id, label, file, kind, extra = {}) => { if (rawFiles[file]) READERS.push({ id, label, file, kind, ...extra }); };
add("rules_own", "Rules (own cut)", "rules_own", "rules", { group: "main" });
add("vss_r1", "VSS default", "vss_r1", "vss", { group: "main" });
add("vss_r2", "VSS round 2", "vss_r2", "vss", { group: "main" });
add("sop_shipped_own", "SOP-BERT shipped", "sop_shipped_own", "sop", { group: "main" });
add("sop_all_own", "SOP-BERT all-data", "sop_all_own", "sop", { group: "main" });
add("rules_vss", "Rules on the VSS cut", "rules_vss", "rules", { group: "same" });
add("vss_r1_same", "VSS default (its cut)", "vss_r1", "vss", { group: "same" });
add("sop_shipped_vss", "SOP-BERT shipped on the VSS cut", "sop_shipped_vss", "sop", { group: "same" });
add("sop_all_vss", "SOP-BERT all-data on the VSS cut", "sop_all_vss", "sop", { group: "same" });
const OLDV = JSON.parse(readFileSync(`${REPO}training/sketch/precision_thresholds.json`, "utf8")).readers.vss_combined;
const OLDB = JSON.parse(readFileSync(`${REPO}training/sketch/precision_thresholds_bert.json`, "utf8"));
const oldVLevel = (p) => { const l = OLDV.levels[String(Math.round(p * 100))]; return l ? l.threshold : null; };
const oldBLevel = (p) => { const l = OLDB.levels_out_of_fold[String(Math.round(p * 100))]; return l ? l.threshold : null; };
add("vss_r1_old", "VSS default, old fit (unchanged)", "vss_r1", "vss", { group: "old", old: true });
add("vss_r2_old", "VSS round 2, old fit (unchanged)", "vss_r2", "vss", { group: "old", old: true });
add("sop_shipped_old", "SOP-BERT shipped, old fit (unchanged)", "sop_shipped_own", "sop", { group: "old", old: true });
add("sop_all_old", "SOP-BERT all-data, old fit (unchanged)", "sop_all_own", "sop", { group: "old", old: true });
if (!READERS.length) throw new Error(`no records in ${RECDIR}`);

const cache = new Map();
for (const R of READERS) {
  if (!cache.has(R.file)) cache.set(R.file, itemsOf(rawFiles[R.file], R.kind));
  const { msgs, items: shared } = cache.get(R.file); R.msgs = msgs; R.items = shared.map((x) => ({ ...x }));   // own copies: every reader sets its own confidence c
  const items = R.items;
  const cal = items.filter((x) => x.cal), tst = items.filter((x) => !x.cal);
  R.G = { cal: msgs.filter((m) => m.cal).reduce((a, m) => a + m.gold, 0), test: msgs.filter((m) => !m.cal).reduce((a, m) => a + m.gold, 0) };
  R.nMsg = { cal: msgs.filter((m) => m.cal).length, test: msgs.filter((m) => !m.cal).length };
  R.t = { 0.95: -Infinity, 0.97: -Infinity, 0.99: -Infinity };   // Rules: executes everything
  if (R.kind === "rules") { R.conf = () => 1; R.noConf = true; continue; }
  if (R.old) {
    if (R.kind === "vss") { R.conf = (x) => vssCombinedConfidence(OLDV, x.f, x.w); for (const p of [0.95, 0.97, 0.99]) R.t[p] = oldVLevel(p) ?? Infinity; }
    else { R.conf = (x) => bertConfidence(OLDB, x.f, x.act); for (const p of [0.95, 0.97, 0.99]) R.t[p] = oldBLevel(p) ?? Infinity; }
    continue;
  }
  R.fit = fitReader(cal, R.kind);
  if (!R.fit) { R.conf = () => 0; for (const p of [0.95, 0.97, 0.99]) R.t[p] = Infinity; R.fitFailed = true; continue; }
  R.conf = (x) => R.fit.model.score(x);
  for (const p of [0.95, 0.97, 0.99]) R.t[p] = R.fit.thr[p] ? R.fit.thr[p].t : Infinity;
}
for (const R of READERS) for (const x of R.items) x.c = R.conf(x);
function calOof(R) {   // calibration items [{c, o}] on which the score threshold is read: out-of-fold for fitted readers, the calibration part itself otherwise (Rules, old fits: never fitted on it)
  return R.fit ? R.fit.oofItems : R.items.filter((x) => x.cal).map((x) => ({ c: x.c, o: x.o }));
}
const testItems = (R, pred = () => true) => R.items.filter((x) => !x.cal && pred(x)).map((x) => ({ c: x.c, o: x.o, kind: x.kind, k: x.k }));
const Gtest = (R, pred = () => true) => R.msgs.filter((m) => !m.cal && pred(m)).reduce((a, m) => a + m.gold, 0);

// ------------------------------------------------------------------ bootstrap over test messages (same draws for every reader)
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const testIds = [...new Set([...META.keys()].filter((id) => !isCal(id)))].sort();
function bootstrap(R, p) {
  const t = R.t[p], per = new Map(testIds.map((id) => [id, { g: 0, n: 0, bad: 0, r: 0 }]));
  for (const m of R.msgs) if (!m.cal) per.get(m.id).g = m.gold;
  for (const x of R.items) if (!x.cal && x.c >= t) { const e = per.get(x.id); e.n++; if (x.o === "right") e.r++; else e.bad++; }
  const arr = testIds.map((id) => per.get(id)), rand = rng(SEED), cw = [], rt = [];
  for (let b = 0; b < BOOT; b++) {
    let g = 0, n = 0, bad = 0, r = 0;
    for (let i = 0; i < arr.length; i++) { const e = arr[Math.floor(rand() * arr.length)]; g += e.g; n += e.n; bad += e.bad; r += e.r; }
    if (n) cw.push(bad / n); if (g) rt.push(r / g);
  }
  const q = (a, z) => { a.sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.max(0, Math.floor(z * a.length)))] : NaN; };
  return { cw: [q(cw, 0.025), q(cw, 0.975)], rt: [q(rt, 0.025), q(rt, 0.975)], nCw: cw.length };
}
function bootstrapScore(R, t, cost = COST) {   // same resamples as bootstrap(): the rng restarts at SEED and draws the same way
  const per = new Map(testIds.map((id) => [id, { g: 0, r: 0, bad: 0 }]));
  for (const m of R.msgs) if (!m.cal) per.get(m.id).g = m.gold;
  for (const x of R.items) if (!x.cal && x.c >= t) { const e = per.get(x.id); if (x.o === "right") e.r++; else e.bad++; }
  const arr = testIds.map((id) => per.get(id)), rand = rng(SEED), sc = [];
  for (let b = 0; b < BOOT; b++) { let g = 0, r = 0, bad = 0; for (let i = 0; i < arr.length; i++) { const e = arr[Math.floor(rand() * arr.length)]; g += e.g; r += e.r; bad += e.bad; } if (g) sc.push(((r - cost * bad) / g) * 100); }
  sc.sort((x, y) => x - y); const q = (z) => (sc.length ? sc[Math.min(sc.length - 1, Math.max(0, Math.floor(z * sc.length)))] : NaN);
  return [q(0.025), q(0.975)];
}
const ci = (a) => (Number.isFinite(a[0]) ? `[${pc(a[0])}, ${pc(a[1])}]` : "[-]");

// ------------------------------------------------------------------ report
const R0 = READERS[0];
log("# FRESH2 report (test part), written by training/sketch/fresh2/fit_report.mjs\n");
log(`Records: ${RECDIR}. Messages: ${META.size} in the data dirs (${[...new Set([...META.values()].map((m) => m.writer))].sort().join(", ")}); calibration ${R0.nMsg.cal} messages / ${R0.G.cal} requested actions; test ${R0.nMsg.test} messages / ${R0.G.test} requested actions.`);
log(`Split: int(sha256(id), 16) % 3 == 0 is calibration. Thresholds and confidences are fitted on the calibration part only. MINEXEC ${MINEXEC}; bootstrap ${BOOT} resamples of the test messages, seed ${SEED}.`);
log("Definitions (per requested action, PAIR=value as llm_score.mjs): confidently wrong % = (executed wrong + executed extras) / everything executed; done right % = executed right / requested actions; asked % = right or wrong requests below the threshold / requested; not read % = requested actions with no produced request / requested; extras = produced requests nobody asked for. Execute when confidence >= threshold.\n");


const sc1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : "-"), sci = (a) => (Number.isFinite(a[0]) ? `[${sc1(a[0])}, ${sc1(a[1])}]` : "[-]");
log("## Cost score: one confident mistake costs 10 right answers (the main measure, AGENTS.md 2026-11-02 19:09)\n");
log(`Score = (requests done right - ${COST} x (executed wrong + extras executed)) / requested actions x 100. A question, or a request not done, scores 0. Each reader's threshold is the one that maximises this score on the calibration part (out-of-fold confidences, the same folds and recipe as the fits below; the candidates are every out-of-fold confidence value, "execute everything" and "ask everything" = score 0; a tie keeps the higher threshold). Rules have no confidence: their only candidates are execute everything and ask everything. The old fits (unchanged JSONs) were never fitted on this data, so their threshold is read from their confidences on the calibration part. No threshold is chosen on the test part. 95% intervals: ${BOOT} bootstrap resamples of the test messages, the same resamples as the rest of the report.\n`);
log("| reader | score-optimal threshold (calibration score, executed) | test score [95% CI] |\n|---|---|---|");
const CR = [], costExtra = [];
for (const R of READERS) {
  const cal = calOof(R), Gc = R.G.cal, ct = costThreshold(cal, Gc), t = ct.t;
  const st = stats(testItems(R), Gtest(R), t), sc = scoreOf(st), b = bootstrapScore(R, t);
  const stAll = stats(testItems(R), Gtest(R), -Infinity), scAll = scoreOf(stAll), bAll = bootstrapScore(R, -Infinity);
  const thTxt = ct.kind === "threshold" ? `${t.toFixed(4)} (${sc1(ct.score)}, ${ct.n})` : ct.kind === "executes everything" ? `none: executes everything (${sc1(ct.score)}, ${ct.n})` : "none: asks everything (0.0, 0)";
  CR.push({ R, t, ct, st, sc, b, scAll, bAll, stAll });
  log(`| ${R.label} | ${thTxt} | ${sc1(sc)} ${sci(b)} |`);
}
log("\n| reader | confidently wrong % (executed) · done right % | asked % · extras executed |\n|---|---|---|");
for (const c of CR) log(`| ${c.R.label} | ${pc(c.st.conf_wrong)} · ${pc(c.st.cov)} (${c.st.n} executed) | ${pc(c.st.asked)} · ${c.st.e} |`);
log("\nEvery reader executing everything (test part, no threshold):\n");
log("| reader | score [95% CI] | right / wrong / not done % · extras |\n|---|---|---|");
for (const c of CR) log(`| ${c.R.label} | ${sc1(c.scAll)} ${sci(c.bAll)} | ${pc(c.stAll.cov)} / ${pc(c.stAll.wrong_all)} / ${pc(c.stAll.unread)} · ${c.stAll.e} |`);
// sensitivity: the threshold re-optimised for each cost, the test score ranks the five main readers
const sens = [5, 20].map((cost) => {
  const rows = READERS.filter((r) => r.group === "main").map((R) => { const ct = costThreshold(calOof(R), R.G.cal, cost); return { label: R.label, sc: scoreOf(stats(testItems(R), Gtest(R), ct.t), cost) }; }).sort((a, b) => b.sc - a.sc);
  return `cost ${cost}: ` + rows.map((x) => `${x.label} ${sc1(x.sc)}`).join(" > ");
});
const rank10 = CR.filter((c) => c.R.group === "main").sort((a, b) => b.sc - a.sc).map((c) => `${c.R.label} ${sc1(c.sc)}`).join(" > ");
log(`\nRanking of the five readers on their own cut (test score; the threshold is re-optimised on calibration for each cost; sensitivity only, 10 is the measure): cost 10: ${rank10}. ${sens.join(". ")}.\n`);

log("## 0. The fits (calibration part)\n");
log("| reader | produced requests · L2 · out-of-fold AUROC | thresholds 95 / 97 / 99 (out-of-fold precision, executed) |\n|---|---|---|");
for (const R of READERS) {
  if (R.kind === "rules") { log(`| ${R.label} | no confidence | executes everything |`); continue; }
  if (R.old) { log(`| ${R.label} | old JSON, not refitted | ${[0.95, 0.97, 0.99].map((p) => (Number.isFinite(R.t[p]) ? R.t[p].toFixed(4) : "none")).join(" / ")} |`); continue; }
  if (R.fitFailed) { log(`| ${R.label} | ${R.items.filter((x) => x.cal).length} produced: too few or one-sided; not fitted | asks everything |`); continue; }
  const th = [0.95, 0.97, 0.99].map((p) => { const o = R.fit.thr[p]; return o ? `${o.t.toFixed(4)} (${pc(o.prec)}, ${o.n})` : "none (asks everything)"; }).join(" / ");
  log(`| ${R.label} | ${R.fit.nCal} · ${R.fit.lam} · ${f3(R.fit.oofAuc)} | ${th} |`);
}

const section = (title, group, p = 0.97) => {
  const rs = READERS.filter((r) => r.group === group);
  if (!rs.length) return;
  log(`\n${title}\n`);
  log("| reader | confidently wrong % [95% CI] · executed | requests done right % [95% CI] |\n|---|---|---|");
  const extra = [];
  for (const R of rs) {
    const st = stats(testItems(R), Gtest(R), R.t[p]), b = bootstrap(R, p);
    log(`| ${R.label}${Number.isFinite(R.t[p]) || R.noConf ? "" : " (no level reached: asks everything)"} | ${pc(st.conf_wrong)} ${ci(b.cw)} · ${st.n} | ${pc(st.cov)} ${ci(b.rt)} |`);
    extra.push(`| ${R.label} | ${pc(st.asked)} · ${pc(st.unread)} | ${st.e} (of ${st.n} executed) |`);
  }
  log("\n| reader | asked % · not read % | extras executed |\n|---|---|---|");
  extra.forEach(log);
};
log("\n## 1. Headline at the 97% threshold (test part)");
section("### 1a. The five readers, each on its own cut", "main");
section("### 1b. Same cut: every reader on the VSS cut", "same");
section("### 1c. The old fits applied unchanged (precision_thresholds.json, precision_thresholds_bert.json): how they transfer to a new writer", "old");

log("\n## 2. The 95% and 99% thresholds (test part)\n");
log("| reader | 95%: confidently wrong % · done right % | 99%: confidently wrong % · done right % |\n|---|---|---|");
for (const R of READERS.filter((r) => !r.noConf)) {
  const c = (p) => { const st = stats(testItems(R), Gtest(R), R.t[p]); return `${pc(st.conf_wrong)} · ${pc(st.cov)} (${st.n} exec)`; };
  log(`| ${R.label} | ${c(0.95)} | ${c(0.99)} |`);
}

log("\n## 3. Requests done right % at an equal confidently-wrong rate (read off the test part's own curve; NOT a protocol threshold)\n");
log("| reader | done right % at confidently wrong <= 5 / 3 / 1 % |\n|---|---|");
for (const R of READERS) {
  if (R.noConf) { const st = stats(testItems(R), Gtest(R), -Infinity); log(`| ${R.label} | no confidence: one point, ${pc(st.conf_wrong)} confidently wrong, ${pc(st.cov)} right |`); continue; }
  const it = testItems(R), G = Gtest(R);
  log(`| ${R.label} | ${[0.05, 0.03, 0.01].map((x) => pc(curveAt(it, G, x))).join(" / ")} |`);
}

log("\n## 4. Executing everything (no threshold), for continuity\n");
log("| reader | right / wrong / not done % of requests | extras · AUROC of the confidence (test) |\n|---|---|---|");
for (const R of READERS) {
  if (R.old) continue;
  const it = testItems(R), G = Gtest(R), st = stats(it, G, -Infinity), au = auroc(it.map((x) => ({ c: x.c, ok: x.o === "right" })));
  log(`| ${R.label} | ${pc(st.cov)} / ${pc(st.wrong_all)} / ${pc(st.unread)} | ${st.e} · ${R.noConf ? "-" : f3(au)} |`);
}

log("\n## 5. AUROC of each confidence on the test part (right vs not right, all produced requests)\n");
log("| reader | test | calibration, out-of-fold (fitted ones) |\n|---|---|---|");
for (const R of READERS.filter((r) => !r.noConf)) {
  const au = auroc(testItems(R).map((x) => ({ c: x.c, ok: x.o === "right" })));
  log(`| ${R.label} | ${f3(au)} | ${R.fit ? f3(R.fit.oofAuc) : "-"} |`);
}

log("\n## 6. Breakdowns at the 97% threshold (test part; confidently wrong % (executed) · done right % (requested))");
const MAINR = READERS.filter((r) => r.group === "main");
const brk = (title, groups, msgPred, itemPred) => {
  log(`\n### ${title}\n`);
  log("| group · reader | confidently wrong % (executed) | done right % (requested) |\n|---|---|---|");
  for (const g of groups) for (const R of MAINR) {
    const it = R.items.filter((x) => !x.cal && itemPred(g, x)).map((x) => ({ c: x.c, o: x.o })), G = R.msgs.filter((m) => !m.cal).reduce((a, m) => a + msgPred(g, m), 0);
    const st = stats(it, G, R.t[0.97]);
    log(`| ${g} · ${R.label} | ${pc(st.conf_wrong)} (${st.n}) | ${pc(st.cov)} (${G}) |`);
  }
};
const writers = [...new Set([...META.values()].map((m) => m.writer))].sort();
brk("6a. Per writer folder", writers, (g, m) => (m.writer === g ? m.gold : 0), (g, x) => META.get(x.id).writer === g);
const lens = ["1 sentence", "2-6 sentences", "7+ sentences"];
brk("6b. Per length class (sentences in the text)", lens, (g, m) => (m.lenClass === g ? m.gold : 0), (g, x) => META.get(x.id).lenClass === g);
brk("6c. Commands vs questions (kind of the requested / produced act)", ["command", "question", "fact/rule"], (g, m) => m.goldActs.filter((a) => kindOf(a) === g).length, (g, x) => x.kind === g);
log("\nMessages per length class (test part): " + lens.map((l) => `${l} ${R0.msgs.filter((m) => !m.cal && m.lenClass === l).length}`).join(", ") + ". Per writer: " + writers.map((w) => `${w} ${R0.msgs.filter((m) => !m.cal && m.writer === w).length}`).join(", ") + ".");
log("A 'not done' request of a kind has no produced request, so the commands / questions split of 'done right' uses the requested acts as denominator and the produced act's kind for the executed side.");

writeFileSync(REPORT, out.join("\n") + "\n");
console.log(out.join("\n"));
