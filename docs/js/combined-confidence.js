// combined-confidence.js: the combined reader "VSS + Neural" (training/sketch/combine/COMBINED_READER.md): the requests of SOP-BERT and of VSS
// on the same cut of one message are paired, one reading of each request is chosen to execute (SOP-BERT's on a pair, the one that exists
// otherwise), and each gets the combined confidence; a request executes when its confidence clears the threshold. Browser-ready ES module,
// no imports (node imports it as is: training/sketch/test_combined_confidence.mjs checks it against the script).
//
// The model is docs/model/confidence/combined.json, written by training/sketch/combine/combined_report.mjs (EXPORT=1), one fit per cut
// (cuts.bert, cuts.vss; best_cut = the cut whose combined reader scored best on the calibration part). Each fit has two logistic parts:
//   sop: SOP-BERT executes (a pair, or a SOP-BERT request nothing was paired with): its 24 signals (neural-confidence.js signals) with the act
//        prior, plus agree (binary), agree_share and other_conf (VSS's own confidence of the paired request, docs/js/vss-confidence.js with
//        docs/model/confidence/vss.json, on the signals of vss-composer.js unit.signals; 0 when unpaired);
//   vss: a VSS request no SOP-BERT request was paired with: VSS's 14 signals with the world prior; on the BERT cut its two cut signals are the
//        SOP-BERT cut head's probabilities at the unit's edges (bertEdges), on the VSS cut the VSS cutter's (unit.signals).
// confidence = 1 / (1 + exp(-(intercept + sum weight * percentile))), percentile as vss-confidence.js (null -> 1). The code below is the
// script's, line for line: pairValue (training/sketch/layer_common.mjs, PAIR=value: per act a maximum-weight matching, most pairs, then most
// keys equal, then most letters shared), the agreement of COMBINE.md, the percentile maps and the logistic.

/* ---------------------------------------------------------------- pairing (layer_common.mjs pairValue and its helpers, copied) */
const parts = (s) => { const o = []; let d = 0, cur = ""; for (const ch of String(s)) { if (ch === "(") d++; if (ch === ")") d--; if (ch === "," && d === 0) { o.push(cur); cur = ""; } else cur += ch; } o.push(cur); return o; };
const elEq = (x, g, created) => x === g || (g === "$new" && (created.has(x) || x.startsWith("$new"))) || (x.startsWith("$new=") && x.slice(5) === g) || (x === "$new" && g === "$new");
const valEq = (v, g, created) => { if (v == null) return false; const a = parts(v), b = parts(g); return a.length === b.length && a.every((x, i) => elEq(x, b[i], created)); };
const createdBefore = (m, j) => new Set(m.gold.filter((o) => o.s < m.gold[j].s && o.args.action === "create" && o.args.name != null && !o.args.count).map((o) => String(o.args.name).toLowerCase()));
function hungarianMax(W) {   // square matrix, maximum total weight; returns col of each row
  const n = W.length, INF = 1e18, u = new Float64Array(n + 1), v = new Float64Array(n + 1), p = new Int32Array(n + 1), way = new Int32Array(n + 1);
  for (let i = 1; i <= n; i++) {
    p[0] = i; let j0 = 0; const minv = new Float64Array(n + 1).fill(INF), used = new Uint8Array(n + 1);
    do {
      used[j0] = 1; const i0 = p[j0]; let delta = INF, j1 = 0;
      for (let j = 1; j <= n; j++) if (!used[j]) { const cur = -W[i0 - 1][j - 1] - u[i0] - v[j]; if (cur < minv[j]) { minv[j] = cur; way[j] = j0; } if (minv[j] < delta) { delta = minv[j]; j1 = j; } }
      for (let j = 0; j <= n; j++) if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta;
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const col = new Int32Array(n); for (let j = 1; j <= n; j++) col[p[j] - 1] = j - 1; return col;
}
const alnum = /[A-Za-z0-9]/;
const overlap = (text, a0, a1, b0, b1) => { let k = 0; for (let i = Math.max(a0, b0); i < Math.min(a1, b1); i++) if (alnum.test(text[i])) k++; return k; };
function rightKeys(m, p, j) {
  const g = m.gold[j], cr = createdBefore(m, j); let k = 0;
  for (const [key, gv] of Object.entries(g.want)) { if (key === "action" || key === "ask") continue; if (valEq(p.rawC[key], gv, cr)) k++; }
  return k;
}
/** m = {text, gold: [{s, e, act, want, args}], units: [{c0, c1}], prods: [{act, u, rawC}]} -> [[prod index, gold index]] */
export function pairValue(m) {
  const pairs = [];
  for (const act of new Set(m.prods.map((p) => p.act))) {
    const P = m.prods.map((p, i) => [p, i]).filter(([p]) => p.act === act), G = m.gold.map((g, j) => [g, j]).filter(([g]) => g.act === act);
    if (!G.length) continue;
    const n = Math.max(P.length, G.length), W = Array.from({ length: n }, () => new Array(n).fill(0));
    P.forEach(([p, i], a) => G.forEach(([g, j], b) => { const u = m.units[p.u]; W[a][b] = 1e6 + 1000 * rightKeys(m, p, j) + overlap(m.text, u.c0, u.c1, g.s, g.e); }));
    const col = hungarianMax(W);
    P.forEach(([, i], a) => { const b = col[a]; if (b < G.length) pairs.push([i, G[b][1]]); });
  }
  return pairs.sort((x, y) => x[0] - y[0]);
}

/** the agreement of every SOP-BERT request with VSS's on one message (COMBINE.md B): VSS's requests play the gold of pairValue.
 *  S, V: [{pa: "type:action", got: canonical values (bench-canon.js canon), span: [c0, c1], args0: {action, name, count}}]
 *  -> per S request {agree, agree_share, partner (index into V, -1), differ: [{key, sop, vss}]} */
export function agreement(text, S, V) {
  const res = S.map(() => ({ agree: 0, agree_share: 0, partner: -1, differ: [] }));
  if (!S.length || !V.length) return res;
  const gold = V.map((y) => ({ s: y.span[0], e: y.span[1], act: y.pa, want: y.got, args: y.args0 || {} }));
  const units = S.map((x) => ({ c0: x.span[0], c1: x.span[1] })), prods = S.map((x, u) => ({ act: x.pa, u, rawC: x.got }));
  for (const [a, b] of pairValue({ text, gold, units, prods })) {
    const x = S[a], y = V[b];
    const keys = [...new Set([...Object.keys(x.got), ...Object.keys(y.got)])].filter((k) => k !== "action" && k !== "ask");
    const eq = keys.filter((k) => (x.got[k] ?? "∅") === (y.got[k] ?? "∅")).length, share = keys.length ? eq / keys.length : 1;
    res[a] = { agree: share === 1 ? 1 : 0, agree_share: share, partner: b, differ: keys.filter((k) => (x.got[k] ?? "∅") !== (y.got[k] ?? "∅")).map((k) => ({ key: k, sop: x.got[k] ?? "∅", vss: y.got[k] ?? "∅" })) };
  }
  return res;
}

/* ---------------------------------------------------------------- confidence */
/** the percentile of a raw signal x in its calibration table (vss-confidence.js percentile, the same code) */
export function percentile(tab, x) {
  if (x == null) return 1;
  const y = x * tab.sign;
  if (tab.binary) return tab.sign > 0 ? (y > 0 ? 1 : 0) : (y > -0.5 ? 1 : 0);
  const u = tab.values, below = tab.below, n = tab.n;
  let lo = 0, hi = u.length; while (lo < hi) { const m = (lo + hi) >> 1; if (u[m] < y) lo = m + 1; else hi = m; }
  const nb = lo < u.length ? below[lo] : n, eq = lo < u.length && u[lo] === y ? (lo + 1 < u.length ? below[lo + 1] : n) - below[lo] : 0;
  return n ? (nb + eq / 2) / n : 0.5;
}
/** one logistic part ("sop": key = the act, prior act_prior; "vss": key = the world, prior world_prior) on the raw signals f */
export function partConfidence(part, kind, f, key) {
  const prior = kind === "sop" ? "act_prior" : "world_prior";
  const raw = (n) => (n === prior ? ((kind === "sop" ? part.act_prior : part.world_prior)[kind === "sop" ? key : key || "none"] ?? (kind === "sop" ? part.act_prior_default : part.world_prior_default)) : f[n]);
  const x = part.features.map((s) => percentile(part.tables[s.name], raw(s.name)));
  let z = part.intercept; for (let j = 0; j < x.length; j++) z += part.features[j].weight * x[j];
  return 1 / (1 + Math.exp(-z));
}
/** the SOP-BERT cut head's two edge signals at a unit [c0, c1] (combine/collect_pair.mjs bertEdges); words: neural.js result.joint.cut
 *  ([{start, end, pO, pB, pI}] per word of the message) -> {cut_start, cut_end} (both null without the cut head's output) */
export function bertEdges(words, c0, c1) {
  if (!words) return { cut_start: null, cut_end: null };
  const i0 = words.findIndex((x) => x.start >= c0), iEnd = words.reduce((acc, x, i) => (x.end <= c1 ? i : acc), -1);
  return { cut_start: i0 >= 0 ? words[i0].pB : null, cut_end: iEnd >= 0 && iEnd + 1 < words.length ? 1 - words[iEnd + 1].pI : 1 };
}

/* ---------------------------------------------------------------- the fit of a cut, levels */
export const FILE = "confidence/combined.json";
/** the levels (owner, 2026-11-02 22:12; 1 and 2 added 2026-11-03 09:30): the cost-score optimum when one confident mistake counts as 1
 *  ("boldest"), 2 ("very bold"), 5 ("bolder"), 10 (the default, "safety threshold") or 20 ("more careful") right answers, each stored per cut
 *  in the file (cuts[cut].levels); and "all" (execute everything) */
export const LEVELS = ["cost1", "cost2", "cost5", "cost", "cost20", "all"], DEFAULT_LEVEL = "cost";
export const label = (l) => (l === "all" ? "execute all" : l === "cost1" ? "boldest" : l === "cost2" ? "very bold" : l === "cost5" ? "bolder" : l === "cost20" ? "more careful" : "safety threshold");
/** the fit used for a message cut by `cut` ("bert" | "vss" | "rules" | ...): its own when the file has one, else the best cut's -> {key, fitted} */
export function fitFor(model, cut) { return model.cuts[cut] ? { key: cut, fitted: true } : { key: model.best_cut, fitted: false }; }
/** the threshold of a level: "all" -> -Infinity; "cost1" | "cost2" | "cost5" | "cost" | "cost20" -> that level's threshold in the fit (-Infinity when it executes
 *  everything, Infinity when it asks; a level the file does not have -> the default's) */
export function threshold(model, cutKey, level = DEFAULT_LEVEL) {
  if (String(level) === "all") return -Infinity;
  const C = model.cuts[cutKey], L = (C.levels || {})[String(level)] || (C.levels || {}).cost || C;
  return Number.isFinite(L.threshold) ? L.threshold : L.kind === "executes everything" ? -Infinity : Infinity;
}

/** the combined reader on one message.
 *  msg = {text, cut, sop: [{f, act, pa, got, span, args0}], vss: [{f, world, pa, got, span, args0, conf, bert_edges?}], cutWords?}
 *    sop[i].f: neural-confidence.js signals(result, index).f; vss[j].f: vss-composer.js unit.signals; vss[j].conf: its vss.json confidence
 *    (vss-confidence.js confidence); vss[j].bert_edges (else from msg.cutWords, the neural result's joint.cut): the cut signals the "vss"
 *    part reads on the BERT cut.
 *  -> {cut: the fit used, fitted, threshold, items: [{from: "sop" | "vss", j, partner, agree, agree_share, other_conf, differ, conf,
 *     execute}]} in the order: every SOP-BERT request, then the VSS requests nothing was paired with. */
export function combine(model, msg, level = DEFAULT_LEVEL) {
  const { key, fitted } = fitFor(model, msg.cut), C = model.cuts[key], t = threshold(model, key, level);
  const S = msg.sop || [], V = msg.vss || [], ag = agreement(msg.text, S, V), taken = new Set(ag.filter((a) => a.partner >= 0).map((a) => a.partner));
  const items = S.map((s, j) => {
    const a = ag[j], other = a.partner < 0 ? 0 : V[a.partner].conf;
    const conf = partConfidence(C.sop, "sop", Object.assign({}, s.f, { agree: a.agree, agree_share: a.agree_share, other_conf: other }), s.act);
    return { from: "sop", j, partner: a.partner, agree: a.agree, agree_share: a.agree_share, other_conf: other, differ: a.differ, conf };
  });
  V.forEach((v, j) => {
    if (taken.has(j)) return;
    let f = v.f;
    if (key === "bert") { const e = v.bert_edges || bertEdges(msg.cutWords, v.span[0], v.span[1]); f = Object.assign({}, v.f, { cut_start: e.cut_start, cut_end: e.cut_end }); }
    items.push({ from: "vss", j, partner: -1, agree: 0, agree_share: 0, other_conf: 0, differ: [], conf: partConfidence(C.vss, "vss", f, v.world) });
  });
  for (const it of items) it.execute = t === -Infinity || it.conf >= t;
  return { cut: key, fitted, threshold: t, items };
}

/* ---------------------------------------------------------------- reasons (why a request is below the threshold), in plain words */
const KEYW = { color: "the colour", shape: "the shape", size: "the size", target: "which shape it is about", from: "where the link starts", to: "where the link ends",
  anchor: "the shape it is placed against", position: "the position", name: "the name", label: "the label", count: "how many", style: "the line style",
  arrow: "the arrow", outline: "the outline", direction: "the direction", ask: "the question", action: "the action" };
const keyWord = (k) => KEYW[k] || "the " + String(k).replace(/([A-Z])/g, " $1").toLowerCase();
const plain = (v) => (v === "∅" ? "nothing" : /[($]/.test(v) || v.length > 24 ? null : `‘${v}’`);
const actWord = (pa) => String(pa).split(":").pop() || String(pa).split(":")[0];
/** the reasons of one combined request (an item of combine) that is below the threshold -> [{group, text}]: what the two readings say;
 *  the caller adds what the executing reader itself was unsure of. names: {sop, vss} (the tab names, default Neural and VSS) */
export function reasons(msg, item, names = { sop: "Neural", vss: "VSS" }) {
  const S = msg.sop || [], V = msg.vss || [], out = [];
  if (item.from === "sop" && item.partner >= 0) {
    if (!item.agree) {
      const d = item.differ.slice(0, 3), vals = d.map((x) => [plain(x.sop), plain(x.vss)]);
      const said = d.length === 1 && vals[0][0] && vals[0][1] ? ` (${names.sop}: ${vals[0][0]}; ${names.vss}: ${vals[0][1]})` : "";
      out.push({ group: "disagree", text: `the two readers disagree on ${d.map((x) => keyWord(x.key)).join(", ").replace(/, ([^,]*)$/, " and $1")}${said}` });
    } else out.push({ group: "agree", text: "both readers read it the same way, but the confidence of the reading is still below the threshold" });
    return out;
  }
  // a request only one reader produced: did the other read this part of the message as another action?
  const me = item.from === "sop" ? S[item.j] : V[item.j], others = item.from === "sop" ? V : S;
  const over = others.filter((o) => overlap(msg.text, me.span[0], me.span[1], o.span[0], o.span[1]) > 0 && o.pa !== me.pa);
  if (over.length) {
    const [a, b] = item.from === "sop" ? [me, over[0]] : [over[0], me];
    out.push({ group: "action", text: `the two readers read different actions here (${names.sop}: ${actWord(a.pa)}; ${names.vss}: ${actWord(b.pa)})` });
  } else out.push({ group: "alone", text: `only one reader found this request (${item.from === "sop" ? names.sop : names.vss}; ${item.from === "sop" ? names.vss : names.sop} read nothing here)` });
  return out;
}

/* ---------------------------------------------------------------- loading (browser) */
const loaded = new Map();
/** fetch and parse the model file once per URL (docs/model/confidence/combined.json?v=<version from versions.json>) */
export function load(url) {
  if (!loaded.has(url)) loaded.set(url, fetch(url, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`); return r.json(); })
    .catch((e) => { loaded.delete(url); throw e; }));
  return loaded.get(url);
}
/** the versioned URL of the model under a docs/model/ root (versions.json "files"["confidence/combined.json"]) */
export async function urlUnder(root) {
  let v = "unversioned";
  try { const r = await fetch(new URL("versions.json", root).href, { cache: "no-cache" }); if (r.ok) v = ((await r.json()).files || {})[FILE] || v; } catch (e) { /* unversioned */ }
  return new URL(FILE, root).href + "?v=" + encodeURIComponent(v);
}
