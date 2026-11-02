// precision.mjs: precision of execution of Rules, VSS (old margin, combined confidence) and SOP-BERT (PRECISION.md; plan written before the run).
//   node training/sketch/precision.mjs bench <dir>        convert docs/bench/{hand,blind,broad,seen,new_identities,heldout_formulations}.json into <dir>/<set>/msg_1.jsonl
//   node training/sketch/precision.mjs rules <outdir>     Rules records (one outcome per produced request) -> <outdir>/rules.jsonl
//   node training/sketch/precision.mjs measure <scratch>  the measurement: reads the records, writes <scratch>/numbers.md, precision_thresholds.json
// Nothing of other agents' files is edited; the unedited risk_coverage.mjs / vss_confidence.mjs produced the records.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";

const [mode, ...args] = process.argv.slice(2);
const REPO = new URL("../../", import.meta.url).pathname;
const SIX = ["hand", "blind", "broad", "seen", "new_identities", "heldout_formulations"];
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));

// ------------------------------------------------------------------ bench: docs/bench rows -> messages with one gold wire (as short_bench.mjs)
function bench([out]) {
  const CASE = { tofront: "toFront", toback: "toBack" }, fix = (a) => (a && CASE[a.action] ? { ...a, action: CASE[a.action] } : a);
  for (const s of SIX) {
    const rows = JSON.parse(readFileSync(`${REPO}docs/bench/${s}.json`, "utf8"));
    const lines = rows.map((r, k) => {
      const wires = (r.wires ? r.wires.map((w) => ({ type: w.type, args: w.gold ?? w.args })) : [{ type: r.type, args: r.gold ?? r.args }]).map((w) => ({ type: w.type, args: fix(w.args) }));
      return JSON.stringify({ id: `${s}-${String(k).padStart(4, "0")}`, text: r.text, names: r.names || [], wires });
    });
    mkdirSync(`${out}/${s}`, { recursive: true }); writeFileSync(`${out}/${s}/msg_1.jsonl`, lines.join("\n") + "\n");
  }
}

// ------------------------------------------------------------------ rules: the Rules reader, per produced request right / wrong / extra
async function rules([outdir]) {
  process.env.LLM_SCORE_LIB = "1"; process.env.SEG ||= "composer"; process.env.PAIR ||= "value";
  const L = await import("./llm_score.mjs");
  const { canon, canonWant } = await import("../../docs/js/bench-canon.js");
  const { pairValue } = await import("./layer_common.mjs");
  const sys = L.logic.createSystem();
  const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
  function pairUp(mains, gold, row) {   // same as risk_coverage.mjs / vss_confidence.mjs
    const used = new Set(), G = row.wires.map((w, j) => {
      let s0 = -1;
      if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); }
      return { s: s0, e: s0 < 0 ? -1 : s0 + w.span.length, act: gold[j].act, want: gold[j].want, args: w.args };
    });
    const units = mains.map((x) => { if (x.n.span) return { c0: x.n.span[0], c1: x.n.span[1] }; const k = x.n.src ? row.text.indexOf(x.n.src) : -1; return k < 0 ? { c0: 0, c1: 0 } : { c0: k, c1: k + x.n.src.length }; });
    return pairValue({ text: row.text, gold: G, units, prods: mains.map((x, i) => ({ act: x.act, u: i, rawC: x.got })) });
  }
  const K = "training/sketch/llm_train", B = "training/sketch/llm_bench";
  const RC = process.env.RC;   // dir of the earlier records (heldout_ids.txt)
  const heldIds = new Set(readFileSync(`${RC}/heldout_ids.txt`, "utf8").split(/\s+/).filter(Boolean));
  const SETS = [
    ["sample", [`${REPO}training/sketch/eval/sample1000`].flatMap((d) => readdirSync(d).sort().map((x) => `${d}/${x}`)), null],
    ["heldout", [`${K}/sonnet_msg`, `${K}/haiku_msg`, `${K}/sonnet_msg2`, `${K}/haiku_msg2`, `${K}/sonnet_long`, `${B}/fresh1/sonnet`, `${B}/fresh1/haiku`, `${K}/sonnet_short`, `${K}/haiku_short`].map((d) => REPO + d), heldIds],
    ["short", [`${K}/sonnet_short`, `${K}/haiku_short`].map((d) => REPO + d), null],
    ...SIX.map((s) => [s, [`${process.env.BENCH6}/${s}`], null]),
  ];
  const out = [];
  for (const [set, dirs, IDS] of SETS) {
    const seen = new Set(); let G = 0, R = 0, W = 0, E = 0;
    for (const d of dirs) {
      const files = readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort();
      const rows = files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l))).filter((r) => Array.isArray(r.wires) && (!IDS || IDS.has(r.id)) && !seen.has(r.id));
      for (const r of rows) {
        seen.add(r.id);
        const ctx = { names: (r.names || []).slice(), last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null };
        const nodes = sys.formalize(r.text, ctx).nodes;
        const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
        const gold = r.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args) }));
        const res = mains.map(() => "extra");
        for (const [i, j] of pairUp(mains, gold, r)) res[i] = Object.entries(gold[j].want).every(([k, v]) => (mains[i].got[k] ?? "∅") === v) ? "right" : "wrong";
        const tot = { exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0, byAct: {} };
        L.tally(tot, nodes, r);   // the per-request outcomes must give llm_score.mjs's totals
        const q = { right: res.filter((x) => x === "right").length, wrong: res.filter((x) => x === "wrong").length, extra: res.filter((x) => x === "extra").length };
        if (q.right !== tot.right || q.wrong !== tot.wrongAligned || q.extra !== tot.extra) throw new Error(`rules outcomes differ from tally on ${r.id}`);
        out.push(JSON.stringify({ id: r.id, set, gold: r.wires.length, rules: res }));
        G += r.wires.length; R += q.right; W += q.wrong; E += q.extra;
      }
    }
    console.log(`rules ${set}: ${seen.size} messages, ${G} gold · right ${(R / G * 100).toFixed(1)} · wrong ${(W / G * 100).toFixed(1)} · extra ${E} (checked against tally)`);
  }
  writeFileSync(`${outdir}/rules.jsonl`, out.join("\n") + "\n");
}

// ------------------------------------------------------------------ measure
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

async function measure([S]) {
  const RC = process.env.RC, VC = process.env.VC, PR = process.env.PR || S;
  const rcSplit = readJ(`${RC}/short_split.jsonl`);
  const heldShort = new Set(rcSplit.filter((r) => r.set === "short_heldout299").map((r) => r.id));
  const out = [];
  const log = (s = "") => { out.push(s); };
  const vcRec = { sample: readJ(`${VC}/sample.jsonl`), heldout: readJ(`${VC}/heldout.jsonl`) };
  const vcShort = readJ(`${VC}/short.jsonl`);
  vcRec.short299 = vcShort.filter((r) => heldShort.has(r.id)); vcRec.short2701 = vcShort.filter((r) => !heldShort.has(r.id));
  const rcRec = { sample: readJ(`${RC}/sample.jsonl`), heldout: readJ(`${RC}/heldout.jsonl`) };
  rcRec.short299 = rcSplit.filter((r) => r.set === "short_heldout299"); rcRec.short2701 = rcSplit.filter((r) => r.set === "short_trained2701");
  const rlRec = {};
  const rlAll = readJ(`${PR}/rules.jsonl`);
  for (const r of rlAll) (rlRec[r.set] ||= []).push(r);
  rlRec.short299 = (rlRec.short || []).filter((r) => heldShort.has(r.id)); rlRec.short2701 = (rlRec.short || []).filter((r) => !heldShort.has(r.id));
  for (const s of SIX) { vcRec[s] = readJ(`${PR}/vc_${s}.jsonl`); rcRec[s] = readJ(`${PR}/rc_${s}.jsonl`); }
  const poolSix = (m) => SIX.flatMap((s) => m[s]);
  vcRec.six = poolSix(vcRec); rcRec.six = poolSix(rcRec); rlRec.six = poolSix(rlRec);
  const SETNAMES = ["sample", "heldout", "short299", "short2701", ...SIX, "six"];
  const gold = (recs) => recs.reduce((a, r) => a + r.gold, 0);

  // consistency: the VSS records of vss_confidence.mjs and of risk_coverage.mjs hold the same requests
  const cons = [];
  for (const s of SETNAMES) { const a = vcRec[s].reduce((q, r) => q + r.vss.length, 0), b = rcRec[s].reduce((q, r) => q + r.vss.length, 0);
    const ra = vcRec[s].reduce((q, r) => q + r.vss.filter((x) => x.o === "right").length, 0), rb = rcRec[s].reduce((q, r) => q + r.vss.filter((x) => x[1] === "right").length, 0);
    const wa = vcRec[s].reduce((q, r) => q + r.vss.filter((x) => x.o === "wrong").length, 0), wb = rcRec[s].reduce((q, r) => q + r.vss.filter((x) => x[1] === "wrong").length, 0);
    if (a !== b || ra !== rb || wa !== wb) cons.push(`${s}: vc ${a} produced / ${ra} right / ${wa} wrong, rc ${b} / ${rb} / ${wb}`); }
  log(`record consistency (vss_confidence vs risk_coverage VSS records): ${cons.length ? "DIFFERENCES: " + cons.join("; ") : "identical on all sets"}`);

  // ---- fit the combined confidence on held-out (vss_confidence.mjs "logistic all minus event")
  const flat = (recs) => recs.flatMap((r, mi) => r.vss.map((x) => ({ mi, o: x.o, ok: x.o === "right", w: x.w, f: x.f })));
  const H = flat(vcRec.heldout);
  const notFound = H.filter((x) => !x.f.found).length;
  const wr = {}; for (const x of H) { const k = x.w || "none"; (wr[k] ||= [0, 0]); wr[k][1]++; if (x.ok) wr[k][0]++; }
  const overall = H.filter((x) => x.ok).length / H.length;
  const prior = (w) => { const e = wr[w || "none"]; return e ? (e[0] + overall * 5) / (e[1] + 5) : overall; };
  const names = SIGNALS.filter((s) => s[1] !== "event").map((s) => s[0]).concat(["world_prior"]);
  const sgn = Object.fromEntries(SIGNALS.map((s) => [s[0], s[2]])); sgn.world_prior = 1;
  const rawv = (x, n) => (n === "world_prior" ? prior(x.w) : x.f[n]);
  const tables = Object.fromEntries(names.map((n) => [n, fitTable(H.map((x) => rawv(x, n)), sgn[n])]));
  // percentile through the exported code path (precision_confidence.mjs), so the fit and the export share one implementation
  const { percentile, vssCombinedConfidence } = await import("./precision_confidence.mjs");
  const vec = (x) => names.map((n) => percentile(tables[n], rawv(x, n)));
  const folds = 5, lamGrid = [0.01, 0.1, 1, 10];
  const cvOof = (lam) => { const oof = new Array(H.length); for (let k = 0; k < folds; k++) { const tr = H.filter((x) => x.mi % folds !== k), te = H.map((x, i) => [x, i]).filter(([x]) => x.mi % folds === k);
    const w = logistic(tr.map(vec), tr.map((x) => (x.ok ? 1 : 0)), lam); for (const [x, i] of te) oof[i] = sigm(w, vec(x)); } return oof; };
  let bestLam = lamGrid[0], bestA = -1, bestOof = null;
  for (const lam of lamGrid) { const oof = cvOof(lam), a = auroc(H.map((x, i) => ({ c: oof[i], ok: x.ok }))); if (a > bestA + 1e-9) { bestA = a; bestLam = lam; bestOof = oof; } }
  const W = logistic(H.map(vec), H.map((x) => (x.ok ? 1 : 0)), bestLam);
  log(`combined confidence refit on held-out: ${H.length} produced requests (${notFound} without a found unit), L2 ${bestLam}, out-of-fold AUROC ${f3(bestA)}, intercept ${f3(W[0])} (VSS_CONFIDENCE.md: L2 10, 0.822, -2.757)`);
  log("weights: " + names.map((n, i) => `${n} ${W[i + 1] >= 0 ? "+" : ""}${f3(W[i + 1])}`).join(", "));
  const spec = {
    features: names.map((n, i) => ({ name: n, stage: n === "world_prior" ? "prior" : SIGNALS.find((s) => s[0] === n)[1], weight: W[i + 1] })),
    intercept: W[0], l2: bestLam, tables,
    world_prior: Object.fromEntries(Object.keys(wr).map((k) => [k, prior(k === "none" ? null : k)])), world_prior_default: overall,
  };
  const comb = (x) => vssCombinedConfidence(spec, x.f, x.w);

  // ---- items per reader and set
  const items = { rules: {}, margin: {}, combined: {}, sop: {} };
  for (const s of SETNAMES) {
    items.rules[s] = rlRec[s].flatMap((r) => r.rules.map((o) => ({ c: 1, o })));
    items.margin[s] = flat(vcRec[s]).map((x) => ({ c: x.f.found ? x.f.margin_min : 0, o: x.o }));
    items.combined[s] = flat(vcRec[s]).map((x) => ({ c: comb(x), o: x.o }));
    items.sop[s] = rcRec[s].flatMap((r) => r.sop.map(([c, o]) => ({ c, o })));
  }
  const G = Object.fromEntries(SETNAMES.map((s) => [s, gold(rcRec[s])]));
  for (const s of SETNAMES) if (gold(vcRec[s]) !== G[s] || gold(rlRec[s]) !== G[s]) throw new Error(`gold differs on ${s}: ${gold(vcRec[s])} ${gold(rlRec[s])} ${G[s]}`);
  const READERS = [["rules", "Rules"], ["margin", "VSS old margin"], ["combined", "VSS combined confidence"], ["sop", "SOP-BERT"]];
  const LEARNED = READERS.filter((r) => r[0] !== "rules");

  // ---- operating points chosen on held-out
  const PS = [0.95, 0.97, 0.99], op = {};
  for (const [k] of LEARNED) { op[k] = {}; for (const p of PS) op[k][p] = operatingPoint(items[k].heldout, p); }
  // side check: combined, threshold from the out-of-fold scores
  const oofItems = H.map((x, i) => ({ c: bestOof[i], o: x.o })), oofOp = operatingPoint(oofItems, 0.97);

  log("\n## thresholds chosen on held-out (execute when confidence >= t; lowest t with held-out precision >= p, >= 50 executed)\n");
  log("| reader / precision | t | held-out precision · coverage (right %) · executed / produced |\n|---|---|---|");
  for (const [k, nm] of LEARNED) for (const p of PS) { const o = op[k][p];
    if (!o) { log(`| ${nm} / ${p * 100} | not reached | highest precision with >= 50 executed: see below |`); continue; }
    const st = stats(items[k].heldout, G.heldout, o.t); log(`| ${nm} / ${p * 100} | ${k === "sop" || k === "margin" ? o.t.toFixed(4) : o.t.toFixed(4)} | ${pc(st.prec)} · ${pc(st.cov)} · ${st.n} / ${items[k].heldout.length} |`); }
  log(`\nside check, combined at 97% from the out-of-fold held-out scores: ${oofOp ? `t = ${oofOp.t.toFixed(4)} (in-sample t = ${op.combined[0.97] ? op.combined[0.97].t.toFixed(4) : "-"})` : "not reached"}`);
  // the best precision reachable with >= 50 executed (for readers that do not reach a level)
  const maxPrec = (its) => { const s = its.slice().sort((a, b) => b.c - a.c); let r = 0, best = 0; for (let i = 0; i < s.length;) { let j = i; while (j < s.length && s[j].c === s[i].c) { if (s[j].o === "right") r++; j++; } if (j >= MINEXEC && r / j > best) best = r / j; i = j; } return best; };
  for (const [k, nm] of LEARNED) log(`highest held-out precision with >= ${MINEXEC} executed, ${nm}: ${pc(maxPrec(items[k].heldout))}%`);

  // ---- per set tables
  const AU = {};
  for (const s of SETNAMES) AU[s] = Object.fromEntries(LEARNED.map(([k]) => [k, auroc(items[k][s].map((x) => ({ c: x.c, ok: x.o === "right" })))]));
  const LABEL = { sample: "sample1000 (1000 messages; VSS trained on it, SOP-BERT never saw it)", heldout: "held-out split (585 messages; held-out for SOP-BERT, same folders as VSS training; the combined confidence is fitted on it)", short299: "short held-out 299 commands (held-out for SOP-BERT; the VSS cutter trained on them)", short2701: "short 2701 commands (SOP-BERT trained on them; VSS trained on them)", six: "the six template sets pooled (1128 rows; written from the Rules' own cues and templates)" };
  for (const s of SIX) LABEL[s] = `${s} (template set; favours the Rules)`;
  const setRows = {};
  const t97 = {};
  for (const [k] of LEARNED) t97[k] = op[k][0.97] ? op[k][0.97].t : null;
  const table = (s, p) => {
    const rows = [];
    const rs = stats(items.rules[s], G[s], -Infinity);
    rows.push(["Rules (no confidence, executes all)", rs]);
    for (const [k, nm] of LEARNED) { const t = op[k][p] ? op[k][p].t : null; rows.push([`${nm}${t == null ? " (no threshold reaches " + p * 100 + "%: asks everything)" : ` (t=${t.toFixed(3)})`}`, stats(items[k][s], G[s], t == null ? Infinity : t)]); }
    setRows[s] = rows;
    const o = [`\n### ${LABEL[s]}: ${G[s]} requested actions, operating point ${p * 100}% (thresholds from held-out)\n`, "| reader | precision of execution · right % of requests | asked % · unread % · executed wrong % · extras executed |", "|---|---|---|"];
    for (const [nm, st] of rows) o.push(`| ${nm} | ${st.n ? pc(st.prec) : "-"} · ${pc(st.cov)} | ${pc(st.asked)} · ${pc(st.unread)} · ${pc(st.wrong)} · ${st.e} |`);
    return o.join("\n");
  };
  log("\n## per set at the 97% operating point");
  for (const s of SETNAMES) log(table(s, 0.97));
  log("\n## everything executed (no threshold), for reference\n");
  log("| set / reader | precision of execution · right % of requests | wrong % · extras · AUROC of the confidence |\n|---|---|---|");
  for (const s of ["sample", "heldout", "short299", "six"]) for (const [k, nm] of READERS) { const st = stats(items[k][s], G[s], -Infinity); log(`| ${s} / ${nm} | ${pc(st.prec)} · ${pc(st.cov)} | ${pc(st.wrong)} · ${st.e} · ${k === "rules" ? "-" : f3(AU[s][k])} |`); }

  log("\n## equal precision: right % of requests (coverage) with the held-out thresholds applied unchanged; in brackets the set's own best coverage at that precision (>= 50 executed)\n");
  for (const p of PS) {
    log(`\n### precision >= ${p * 100}%\n\n| set | VSS old margin · VSS combined | SOP-BERT · Rules (all executed) |\n|---|---|---|`);
    for (const s of ["sample", "heldout", "short299", "short2701", "six"]) {
      const cell = (k) => { const t = op[k][p] ? op[k][p].t : null; if (t == null) return "none"; const st = stats(items[k][s], G[s], t), b = bestCoverage(items[k][s], G[s], p); return `${pc(st.cov)} (prec ${pc(st.prec)}; best ${b == null ? "-" : pc(b)})`; };
      const rs = stats(items.rules[s], G[s], -Infinity);
      log(`| ${s} | ${cell("margin")} · ${cell("combined")} | ${cell("sop")} · ${pc(rs.cov)} (prec ${pc(rs.prec)}) |`);
    }
  }
  log("\n## own-curve reference (NOT the protocol: the threshold is read off the set itself, >= 50 executed; shows what each confidence could do if it were calibrated on the set)\n");
  log("| set / precision | VSS old margin · VSS combined | SOP-BERT (highest precision with >= 50 executed) |\n|---|---|---|");
  for (const s of ["sample", "heldout", "short299", "six"]) for (const p of PS) {
    const c = (k) => { const b = bestCoverage(items[k][s], G[s], p); return b == null ? "not reached" : pc(b); };
    log(`| ${s} / ${p * 100} | ${c("margin")} · ${c("combined")} | ${c("sop")} (${pc(maxPrec(items.sop[s]))}) |`);
  }
  log("\n## AUROC of the confidence (right vs not right)\n\n| set | VSS old margin · VSS combined | SOP-BERT |\n|---|---|---|");
  for (const s of SETNAMES) log(`| ${s} | ${f3(AU[s].margin)} · ${f3(AU[s].combined)} | ${f3(AU[s].sop)} |`);

  // ---- export
  const defs = {
    rules: { confidence: "none: every produced request is executed", threshold: null },
    vss_old_margin: { confidence: "minimum of the chosen reading's margins (unit.vss.margins: event, structure, every role, attribute, determiner, speaker, scope); no margin or no unit: 0. Execute when confidence >= threshold." },
    vss_combined: { confidence: "logistic over 14 named stage signals, each a percentile of the held-out distribution (see features, tables); the winner 'logistic all minus event' of VSS_CONFIDENCE.md. Reference implementation: training/sketch/precision_confidence.mjs. Execute when confidence >= threshold." },
    sop_bert: { confidence: "minimum probability over SOP-BERT's heads: p_act and, for every key of the act that got a value, its class-head probability, or for a name role its fill-head probability and (when written) the lowest tag probability of its words; descriptions also every desc:<key> head; a tag key the lowest tag probability of its words (RISK_COVERAGE.md). No temperature scaling. Execute when confidence >= threshold." },
  };
  const point = (k) => Object.fromEntries(PS.map((p) => { const o = op[k][p]; if (!o) return [String(Math.round(p * 100)), null];
    const st = stats(items[k].heldout, G.heldout, o.t); const lowerNeighbour = o.below;
    return [String(Math.round(p * 100)), { threshold: o.t, threshold_midpoint: lowerNeighbour == null ? null : (o.t + lowerNeighbour) / 2, heldout_precision: st.prec, heldout_coverage: st.cov, heldout_asked: st.asked, heldout_executed: st.n, heldout_produced: items[k].heldout.length }]; }));
  const r97 = stats(items.rules.heldout, G.heldout, -Infinity);
  const exp = {
    protocol: "PRECISION.md: threshold = lowest confidence value whose held-out precision of execution (right / (right + wrong + extra), over requests with confidence >= threshold) is >= the level, with at least 50 executed on held-out; chosen on the held-out split only (585 messages, 1711 requested actions), applied unchanged elsewhere. The operating point is level 97.",
    operating_level: "97",
    heldout: { messages: rcRec.heldout.length, requested: G.heldout },
    readers: {
      rules: { ...defs.rules, heldout_precision: r97.prec, heldout_coverage: r97.cov },
      vss_old_margin: { ...defs.vss_old_margin, levels: point("margin") },
      vss_combined: { ...defs.vss_combined, levels: point("combined"), l2: spec.l2, intercept: spec.intercept, features: spec.features, tables: spec.tables, world_prior: spec.world_prior, world_prior_default: spec.world_prior_default, how_to: "z = intercept + sum(weight_i * percentile_i); confidence = 1/(1+exp(-z)). percentile_i: x = raw signal (world_prior: the table value of the chosen world, else world_prior_default; world 'none' when no world); null/undefined -> 1; binary table -> (sign>0 ? x>0 : x<0.5) ? 1 : 0; else y = x*sign, lo = count of table values < y, eq = count equal to y, percentile = (lo + eq/2)/n. tables[name]: n, sign, binary, values (sorted distinct oriented held-out values), below (number of held-out values strictly below each distinct value)." },
      sop_bert: { ...defs.sop_bert, levels: point("sop") },
    },
  };
  exp.readers.vss_combined.levels_out_of_fold_check_97 = oofOp ? oofOp.t : null;
  for (const k of ["vss_old_margin", "vss_combined", "sop_bert"]) exp.readers[k].threshold = exp.readers[k].levels["97"] ? exp.readers[k].levels["97"].threshold : null;
  writeFileSync(`${REPO}training/sketch/precision_thresholds.json`, JSON.stringify(exp));

  // ---- verification: recompute the combined confidence from the JSON alone on 200 produced requests (spread over sample, held-out, short299, six)
  const J = JSON.parse(readFileSync(`${REPO}training/sketch/precision_thresholds.json`, "utf8")).readers.vss_combined;
  const pool = ["sample", "heldout", "short299", "six"].flatMap((s) => flat(vcRec[s]));
  const pick = Array.from({ length: 200 }, (_, i) => pool[Math.floor(i * pool.length / 200)]);
  let md = 0; for (const x of pick) { const a = comb(x), b = vssCombinedConfidence(J, x.f, x.w); md = Math.max(md, Math.abs(a - b)); }
  // and the decisions on all produced requests of the sample: execute / ask from the JSON threshold equals the script's
  const thr = JSON.parse(readFileSync(`${REPO}training/sketch/precision_thresholds.json`, "utf8")).readers.vss_combined.threshold;
  let dis = 0, tot = 0; for (const x of flat(vcRec.sample)) { tot++; if ((comb(x) >= op.combined[0.97].t) !== (vssCombinedConfidence(J, x.f, x.w) >= thr)) dis++; }
  log(`\n## export check\n\nconfidence recomputed from precision_thresholds.json alone on 200 produced requests: max abs difference ${md.toExponential(2)}; execute/ask decisions of the JSON threshold vs the script's on all ${tot} sample requests: ${dis} differ.`);
  writeFileSync(`${S}/numbers.md`, out.join("\n") + "\n");
  console.log(out.join("\n"));
}

if (mode === "bench") bench(args); else if (mode === "rules") await rules(args); else if (mode === "measure") await measure(args);
else { console.error("usage: precision.mjs bench <dir> | rules <outdir> | measure <scratch>"); process.exit(2); }
