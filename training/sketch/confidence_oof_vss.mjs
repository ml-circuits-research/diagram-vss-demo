// confidence_oof_vss.mjs: the out-of-fold thresholds of the VSS combined confidence (95 / 97 / 99%) written into docs/model/confidence/vss.json (levels); copied from the gate agent's scratch script, 2026-11-02. Input: the held-out records of vss_confidence.mjs collect (see the paths below).
import { readFileSync } from "node:fs";
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const f1 = (x) => x.toFixed(1), f3 = (x) => x.toFixed(3), pc = (x) => (x * 100).toFixed(1);
const SIGNALS = [   // name, stage, sign (from vss_confidence.mjs)
  ["cut_start", "cut", 1], ["cut_end", "cut", 1], ["world_gap", "world", 1], ["world_rank", "world", 1], ["wnu_gap", "world", 1], ["tie", "world", 1],
  ["event_gap", "event", 1], ["event_agree", "event", 1], ["event_margin", "event", 1],
  ["role_min", "roles", 1], ["residual", "roles", -1], ["unplaced", "roles", -1], ["abstain", "roles", -1],
  ["notu_frac", "words", -1], ["ctx_fill", "context", -1], ["ctx_margin", "context", 1],
];
function auroc(it) {   // it: [{c, ok}]
  const pos = it.filter((x) => x.ok).map((x) => x.c), neg = it.filter((x) => !x.ok).map((x) => x.c).sort((a, b) => a - b);
  if (!pos.length || !neg.length) return NaN;
  let s = 0; for (const p of pos) { let lo = 0, hi = neg.length; while (lo < hi) { const m = (lo + hi) >> 1; if (neg[m] < p) lo = m + 1; else hi = m; } let eq = lo; while (eq < neg.length && neg[eq] === p) eq++; s += lo + (eq - lo) / 2; }
  return s / (pos.length * neg.length);
}
function fitTable(vals, sign) {   // the table behind vss_confidence.mjs fitMap
  const v = vals.filter((x) => x != null).map((x) => x * sign).sort((a, b) => a - b), n = v.length;
  const binary = new Set(v).size <= 2;
  const values = [], below = [];
  for (let i = 0; i < n; i++) if (i === 0 || v[i] !== v[i - 1]) { values.push(v[i]); below.push(i); }
  return { sign, binary, n, values, below };
}
function logistic(X, y, lam, iters = 200) {   // IRLS, copied from vss_confidence.mjs (intercept unpenalised)
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

// the operating point: lowest t with precision >= p on items [{c, o}] and at least MINEXEC executed; null if none
const MINEXEC = 50;
function operatingPoint(items, p) {
  const s = items.slice().sort((a, b) => b.c - a.c);   // descending: prefix = executed set for t = s[k].c at block ends
  const cand = []; let right = 0;
  for (let i = 0; i < s.length;) {
    let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") right++; j++; }
    cand.push({ t: s[i].c, n: j, right, below: j < s.length ? s[j].c : null }); i = j;
  }
  for (let k = cand.length - 1; k >= 0; k--) if (cand[k].n >= MINEXEC && cand[k].right / cand[k].n >= p) return cand[k];   // lowest t = the last block that qualifies
  return null;
}
// the best coverage a set's own curve allows at precision >= p (>= MINEXEC executed)
function bestCoverage(items, G, p) { const op = operatingPoint(items, p); return op ? op.right / G : null; }

function stats(items, G, t) {   // items: [{c, o}]; execute when c >= t (t = -Infinity: all; t = Infinity: none)
  let r = 0, w = 0, e = 0, ar = 0, aw = 0;
  for (const x of items) { if (x.c >= t) { if (x.o === "right") r++; else if (x.o === "wrong") w++; else e++; } else if (x.o === "right") ar++; else if (x.o === "wrong") aw++; }
  const n = r + w + e, tr = r + ar, tw = w + aw;
  return { n, r, w, e, prec: n ? r / n : NaN, cov: r / G, asked: (ar + aw) / G, unread: (G - tr - tw) / G, wrong: w / G, G };
}


const VC = process.argv[2];
const held = readJ(`${VC}/heldout.jsonl`), G = held.reduce((a, r) => a + r.gold, 0);
const flat = (recs) => recs.flatMap((r, mi) => r.vss.map((x) => ({ mi, o: x.o, ok: x.o === "right", w: x.w, f: x.f })));
const H = flat(held);
const wr = {}; for (const x of H) { const k = x.w || "none"; (wr[k] ||= [0, 0]); wr[k][1]++; if (x.ok) wr[k][0]++; }
const overall = H.filter((x) => x.ok).length / H.length;
const prior = (w) => { const e = wr[w || "none"]; return e ? (e[0] + overall * 5) / (e[1] + 5) : overall; };
const names = SIGNALS.filter((s) => s[1] !== "event").map((s) => s[0]).concat(["world_prior"]);
const sgn = Object.fromEntries(SIGNALS.map((s) => [s[0], s[2]])); sgn.world_prior = 1;
const rawv = (x, n) => (n === "world_prior" ? prior(x.w) : x.f[n]);
const tables = Object.fromEntries(names.map((n) => [n, fitTable(H.map((x) => rawv(x, n)), sgn[n])]));
const { percentile, vssCombinedConfidence } = await import(new URL("precision_confidence.mjs", import.meta.url).href);
const vec = (x) => names.map((n) => percentile(tables[n], rawv(x, n)));
const folds = 5, lam = 10;
const oof = new Array(H.length);
for (let k = 0; k < folds; k++) { const tr = H.filter((x) => x.mi % folds !== k), te = H.map((x, i) => [x, i]).filter(([x]) => x.mi % folds === k);
  const w = logistic(tr.map(vec), tr.map((x) => (x.ok ? 1 : 0)), lam); for (const [x, i] of te) oof[i] = sigm(w, vec(x)); }
const W = logistic(H.map(vec), H.map((x) => (x.ok ? 1 : 0)), lam);
const J = JSON.parse(readFileSync(new URL("precision_thresholds.json", import.meta.url), "utf8")).readers.vss_combined;
console.log("intercept", W[0], "json", J.intercept, "oof auroc", auroc(H.map((x, i) => ({ c: oof[i], ok: x.ok }))));
const fin = H.map((x) => ({ c: vssCombinedConfidence(J, x.f, x.w), o: x.o })), oo = H.map((x, i) => ({ c: oof[i], o: x.o }));
const out = {};
for (const p of [0.95, 0.97, 0.99]) { const op = operatingPoint(oo, p); const L = String(Math.round(p * 100));
  if (!op) { out[L] = null; console.log(L, "not reached; highest oof precision with >=50:"); continue; }
  const so = stats(oo, G, op.t), sf = stats(fin, G, op.t);
  out[L] = { threshold: op.t, threshold_midpoint: op.below == null ? null : (op.t + op.below) / 2, heldout_oof_precision: so.prec, heldout_oof_coverage: so.cov, heldout_oof_asked: so.asked, heldout_oof_executed: so.n,
    heldout_precision: sf.prec, heldout_coverage: sf.cov, heldout_asked: sf.asked, heldout_executed: sf.n, heldout_produced: H.length };
  console.log(L, JSON.stringify(out[L])); }
console.log("JSON check 97 oof", J.levels_out_of_fold_check_97);
// highest oof precision with >= 50 executed
{ const s = oo.slice().sort((a, b) => b.c - a.c); let r = 0, best = 0; for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") r++; j++; } if (j >= 50 && r / j > best) best = r / j; i = j; } console.log("best oof precision >=50 executed", best); out.best_oof_precision = best; }
console.log("OUT " + JSON.stringify(out));
