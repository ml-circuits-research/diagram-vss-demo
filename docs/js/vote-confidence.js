// vote-confidence.js: three readers voting (training/sketch/confidence3/PLAN.md, RESULT.md). The Rules, VSS and SOP-BERT read the same cut
// of a message; their requests are paired (combined-confidence.js pairValue, the script's code) and two readings AGREE when every canonical
// value (bench-canon.js canon) is equal, optionally with the engine-true equivalence of engineNorm (agreement "engine"). From the votes:
//   - columnVss(model, msg.vss): VSS alone, its own cut: its confidence = a logistic over its 14 signals + whether SOP-BERT and the Rules
//     reading the same units agree with it (agree_sop, agree_rules, n_agree) + the Rules' notes (rules_clean, rules_notes);
//   - columnSop(model, msg.bert): SOP-BERT alone on the BERT cut: its 24 signals + agree_vss, agree_rules, n_agree, rules_clean, rules_notes;
//   - vote3(model, msg.bert): the three readers on the BERT cut: per request of SOP-BERT its reading, unless SOP-BERT agrees with nobody and
//     VSS and the Rules agree with each other (then VSS's); plus VSS's requests SOP-BERT did not take. Each gets n_agree (1-3) and a
//     confidence from two logistic parts ("sop" when SOP-BERT's reading is executed, "vss" otherwise);
//   - the level "vote3_rule": no weights, execute when all three agree.
// The model is docs/model/confidence/vote3.json (written by training/sketch/confidence3/fit3.mjs EXPORT=1); training/sketch/
// test_vote_confidence.mjs checks this code against the script. The demo (docs/js/ui.js) uses columnVss for the VSS tab, columnSop for the
// SOP-BERT tab and vote3 for the "3 readers" tab, always with opts.agreement = "engine" (RESULT.md section 5: the engine-true equivalence
// everywhere; it is what logic.js does, and on the calibration part it changes no pair). The parity test calls them without opts (the
// file's own agreement). agreementWords() and ownSpec() give the plain-words reasons of a request that is not executed.
import { pairValue, percentile, bertEdges } from "./combined-confidence.js";

export const FILE = "confidence/vote3.json";
export const LEVELS = ["cost5", "cost", "cost20"], DEFAULT_LEVEL = "cost";

/** the requests whose target list logic.js takes as a set of shapes, where no target = every shape (alRun): arrange (not with a template:
 *  a template, and a tree / radial of shapes without links, uses the order given), distribute, align with a direction, and the whole-drawing
 *  operations of HIGH_LEVEL_OPS.md (training/sketch/confidence3/NEW_FORMS_AUDIT.md: improve ... untangle were missing until 2026-11-03, so two
 *  readings of "tidy up" that wrote "every shape" two ways disagreed) */
const LIST_FREE = new Set(["command:arrange", "command:distribute", ...["improve", "respace", "snap", "fit", "flip", "sort", "groupBy", "equalize", "straighten", "untangle"].map((a) => "command:" + a)]);
const listFree = (pa, got) => (LIST_FREE.has(pa) && !(pa === "command:arrange" && got.template != null)) || (pa === "command:align" && got.direction != null);
/** the arrow restyles, reverse and the labels of every arrow (kind=edge quantifier=all) that name no arrow by its ends (logic.js edgesOf,
 *  labelEdge): the arrows at the target shapes; no target = every arrow */
const edgeAll = (pa, got) => (pa === "command:reverse" || ((pa === "command:set" || pa === "command:resize") && got.kind === "edge") || (pa === "command:label" && got.kind === "edge" && got.quantifier === "all")) && got.from == null && got.to == null;
/** d1, engine-true equivalence of a canonical reading (key -> lower-case string) for the agreement of two readers. logic.js: for the requests
 *  of listFree the order of a target list does not change what is done (arrange sorts its shapes by reading order, distribute by coordinate,
 *  the others take them as a set); and no target = every shape on the canvas, so "no target", the unfiltered mention(quantifier=all) and the
 *  list of every canvas name are the same request. The same for the arrows of edgeAll (the arrows at every shape = every arrow). Nothing else
 *  is made equivalent here (align without a direction uses its first target as the base); bench-canon.js canon writes the other engine-true
 *  equivalences one way. -> a new object */
export function engineNorm(got, pa, names) {
  if (!listFree(pa, got) && !edgeAll(pa, got)) return got;
  const g = { ...got }, t = g.target;
  const all = (names || []).map((n) => String(n).toLowerCase()).sort().join(",");
  if (t == null || t === "mention(quantifier=all)") g.target = "*all*";
  else if (!t.includes("mention(") && !t.includes("$new")) { const s = t.split(",").sort().join(","); g.target = all && s === all ? "*all*" : s; }
  return g;
}
/** a reading {pa, got} with its target list (listFree: arrange, distribute, the whole-drawing operations) as the engine takes it on a drawing
 *  (docs/js/ui.js engineView: logic.js alRun / itemsOnly / expandGroups): a group name stands for its members, the background and zone panels
 *  are not moved (a list of panels only is kept as it is, as itemsOnly does). view = {groups: Map(lower-case group name -> lower-case member
 *  names), panels: Set(lower-case names)}. engineNorm then compares the list as a set and with every shape. On the messages the votes were
 *  fitted on (no groups, no panels) it changes nothing. -> a new reading (or the same one) */
export function engineTargets(x, view) {
  const t = x.got && x.got.target;
  if (!listFree(x.pa, x.got) || t == null || t.includes("mention(") || t.includes("$new")) return x;
  const all = [...new Set(t.split(",").flatMap((n) => (view.groups && view.groups.get(n)) || [n]))], kept = all.filter((n) => !(view.panels && view.panels.has(n)));
  return Object.assign({}, x, { got: Object.assign({}, x.got, { target: (kept.length ? kept : all).sort().join(",") }) });
}
/** the share of keys with equal values of two readings (action / ask excluded; an empty union is 1) */
export function sameShare(x, y, names, mode = "canon") {
  const gx = mode === "engine" ? engineNorm(x.got, x.pa, names) : x.got, gy = mode === "engine" ? engineNorm(y.got, y.pa, names) : y.got;
  const keys = [...new Set([...Object.keys(gx), ...Object.keys(gy)])].filter((k) => k !== "action" && k !== "ask");
  const eq = keys.filter((k) => (gx[k] ?? "∅") === (gy[k] ?? "∅")).length;
  return keys.length ? eq / keys.length : 1;
}
/** A's requests paired with B's (B plays the gold side of pairValue, as combined-confidence.js agreement); A, B: [{pa, got, span, args0}]
 *  -> per A request {agree, agree_share, partner (index into B, -1)} */
export function agreementOf(text, A, B, names, mode = "canon") {
  const res = A.map(() => ({ agree: 0, agree_share: 0, partner: -1 }));
  if (!A.length || !B.length) return res;
  const gold = B.map((y) => ({ s: y.span[0], e: y.span[1], act: y.pa, want: y.got, args: y.args0 || {} }));
  const units = A.map((x) => ({ c0: x.span[0], c1: x.span[1] })), prods = A.map((x, u) => ({ act: x.pa, u, rawC: x.got }));
  for (const [a, b] of pairValue({ text, gold, units, prods })) { const s = sameShare(A[a], B[b], names, mode); res[a] = { agree: s === 1 ? 1 : 0, agree_share: s, partner: b }; }
  return res;
}
/** the Rules' signals of a request paired with Rules request r (or none): rules = [{notes}], rulesMsg = {msgNotes, unread} */
function rulesSig(rules, rulesMsg, ri) {
  const bad = (rulesMsg ? (rulesMsg.msgNotes || 0) + (rulesMsg.unread || 0) : 0), r = ri >= 0 ? rules[ri] : null;
  return { rules_clean: r && (r.notes || 0) === 0 && bad === 0 ? 1 : 0, rules_notes: bad + (r ? r.notes || 0 : 0) };
}
/** one logistic part of the file on raw signals f; key = the act (kind sop) or the world (kind vss) for the prior */
export function partConfidence(part, f, key) {
  const raw = (n) => (n === part.prior_name ? (part.prior[part.kind === "vss" ? key || "none" : key] ?? part.prior_default) : f[n]);
  let z = part.intercept;
  for (const s of part.features) z += s.weight * percentile(part.tables[s.name], raw(s.name));
  return 1 / (1 + Math.exp(-z));
}
/** the threshold of a level for a request of act pa ("question:..." or anything else = command); "all" -> -Infinity */
export function thresholdOf(levels, level, pa) {
  if (String(level) === "all") return -Infinity;
  const L = levels[String(level)] || levels.cost, v = String(pa).startsWith("question:") && L.question !== undefined ? L.question : L.command !== undefined ? L.command : L.all;
  return typeof v === "number" ? v : v === "executes everything" ? -Infinity : Infinity;
}
const decide = (items, levels, level) => { for (const it of items) { it.threshold = thresholdOf(levels, level, it.pa); it.execute = it.conf >= it.threshold; } return items; };

/** VSS alone on its own cut. m = {text, names, vss: [{f, world, pa, got, span, args0}], sop: [{pa, got, span, args0}] (SOP-BERT on the same
 *  units), rules: [{pa, got, span, args0, notes}] (the Rules on the same units), rulesMsg: {msgNotes, unread}}
 *  -> [{from: "vss", j, pa, n_agree, agree_sop, agree_rules, conf, threshold, execute}] */
export function columnVss(model, m, level = DEFAULT_LEVEL, opts = {}) {
  const C = model.columns.vss, mode = opts.agreement || C.agreement, V = m.vss || [], aS = agreementOf(m.text, V, m.sop || [], m.names, mode), aR = agreementOf(m.text, V, m.rules || [], m.names, mode);
  return decide(V.map((v, j) => {
    const f = Object.assign({}, v.f, { agree_sop: aS[j].agree, agree_rules: aR[j].agree, n_agree: 1 + aS[j].agree + aR[j].agree }, rulesSig(m.rules || [], m.rulesMsg, aR[j].partner));
    return { from: "vss", j, pa: v.pa, n_agree: f.n_agree, agree_sop: f.agree_sop, agree_rules: f.agree_rules, partner_sop: aS[j].partner, partner_rules: aR[j].partner, conf: partConfidence(C.model, f, v.world) };
  }), C.levels, level);
}
/** SOP-BERT alone on the BERT cut. m = {text, names, sop: [{f, act, pa, got, span, args0}], vss: [{pa, got, span, args0}] (VSS on the same
 *  units), rules, rulesMsg} -> [{from: "sop", j, pa, n_agree, agree_vss, agree_rules, conf, threshold, execute}] */
export function columnSop(model, m, level = DEFAULT_LEVEL, opts = {}) {
  const C = model.columns.sop, mode = opts.agreement || C.agreement, S = m.sop || [], aV = agreementOf(m.text, S, m.vss || [], m.names, mode), aR = agreementOf(m.text, S, m.rules || [], m.names, mode);
  return decide(S.map((s, j) => {
    const f = Object.assign({}, s.f, { agree_vss: aV[j].agree, agree_rules: aR[j].agree, n_agree: 1 + aV[j].agree + aR[j].agree }, rulesSig(m.rules || [], m.rulesMsg, aR[j].partner));
    return { from: "sop", j, pa: s.pa, n_agree: f.n_agree, agree_vss: f.agree_vss, agree_rules: f.agree_rules, partner_vss: aV[j].partner, partner_rules: aR[j].partner, conf: partConfidence(C.model, f, s.act) };
  }), C.levels, level);
}
/** the three readers on the BERT cut. m = {text, names, sop: [{f, act, pa, got, span, args0}], vss: [{f, world, pa, got, span, args0, conf,
 *  bert_edges?}] (f: vss-composer.js unit.signals; conf: its vss.json confidence; bert_edges, else from m.cutWords: the SOP-BERT cut head at the
 *  unit's edges), rules: [{pa, got, span, args0, notes}], rulesMsg}. rule = true: the weight-free level (execute when all three agree).
 *  -> [{from: "sop" | "vss" (whose reading is executed), j, pa, n_agree, pattern, conf, threshold, execute}]: one per SOP-BERT request, then
 *  the VSS requests SOP-BERT did not take */
export function vote3(model, m, level = DEFAULT_LEVEL, rule = false, opts = {}) {
  const C = rule ? { agreement: model.vote3_rule.agreement, levels: model.vote3_rule.levels } : model.columns.vote3, mode = opts.agreement || C.agreement;
  const S = m.sop || [], V = m.vss || [], R = m.rules || [], names = m.names;
  const aSV = agreementOf(m.text, S, V, names, mode), aSR = agreementOf(m.text, S, R, names, mode);
  const takenV = new Set(aSV.filter((a) => a.partner >= 0).map((a) => a.partner)), takenR = new Set(aSR.filter((a) => a.partner >= 0).map((a) => a.partner));
  const vi = V.map((_, j) => j).filter((j) => !takenV.has(j)), ri = R.map((_, j) => j).filter((j) => !takenR.has(j));
  const aVR = agreementOf(m.text, vi.map((j) => V[j]), ri.map((j) => R[j]), names, mode);
  const vf = (v) => (v.bert_edges || m.cutWords ? Object.assign({}, v.f, v.bert_edges || bertEdges(m.cutWords, v.span[0], v.span[1])) : v.f);
  const items = S.map((s, j) => {
    const pv = aSV[j].partner, pr = aSR[j].partner, sv = aSV[j].agree, sr = aSR[j].agree;
    const vr = pv >= 0 && pr >= 0 && sameShare(V[pv], R[pr], names, mode) === 1 ? 1 : 0, rs = rulesSig(R, m.rulesMsg, pr);
    const n = sv || sr ? 1 + sv + sr : vr ? 2 : 1, pattern = sv && sr ? "R+V+S" : sv ? "V+S" : sr ? "R+S" : vr ? "R+V" : "none";
    if (!sv && !sr && vr) {   // only VSS and the Rules agree: VSS's reading
      const f = Object.assign({}, vf(V[pv]), { agree_sop: 0, agree_rules: 1, n_agree: 2 }, rs);
      return { from: "vss", j: pv, pa: V[pv].pa, n_agree: n, pattern, sop: j, rules: pr, conf: rule ? n : partConfidence(C.parts.vss, f, V[pv].world) };
    }
    const f = Object.assign({}, s.f, { agree: sv, agree_share: aSV[j].agree_share, other_conf: pv < 0 ? 0 : V[pv].conf, agree_rules: sr, n_agree: 1 + sv + sr }, rs);
    return { from: "sop", j, pa: s.pa, n_agree: n, pattern, vss: pv, rules: pr, conf: rule ? n : partConfidence(C.parts.sop, f, s.act) };
  });
  vi.forEach((j, q) => {
    const ag = aVR[q].agree, pr = aVR[q].partner >= 0 ? ri[aVR[q].partner] : -1;
    const f = Object.assign({}, vf(V[j]), { agree_sop: 0, agree_rules: ag, n_agree: 1 + ag }, rulesSig(R, m.rulesMsg, pr));
    items.push({ from: "vss", j, pa: V[j].pa, n_agree: 1 + ag, pattern: ag ? "R+V" : "V only", sop: -1, rules: pr, conf: rule ? 1 + ag : partConfidence(C.parts.vss, f, V[j].world) });
  });
  return decide(items, C.levels, level);
}
/** plain words for a held request of vote3 */
export function reason(it) {
  if (it.execute) return "";
  if (it.n_agree === 3) return "the three readers agree, but its own signals are weak";
  if (it.n_agree === 2) return it.pattern === "R+V" ? "SOP-BERT reads it differently" : it.pattern === "V+S" ? "the Rules read it differently" : "VSS reads it differently";
  return "the other readers read it differently or not at all";
}

/* ---------------------------------------------------------------- reasons in plain words (the demo's held requests) */
const pretty = (v) => (v == null ? null : v === "*all*" ? "every shape" : v === "$new" ? "the shape made just before" : String(v).startsWith("mention(") ? `a description (${String(v).slice(8, -1).replace(/,/g, ", ")})` : String(v).replace(/,/g, ", "));
const actName = (pa) => { const [type, a] = String(pa).split(":"); return type === "question" ? `the question ‘${a}’` : type === "command" ? `‘${a}’` : `a ${type}`; };
const verb = (label) => (/^the | and /i.test(label) ? "read" : "reads");   // "the Rules read", "VSS reads", "VSS and the Rules read"
/** what reader `label` reads differently from the reading `ref` (both {pa, got}), in words: "SOP-BERT reads layout ‘circle’ instead of no layout" */
export function readsInstead(label, x, ref, names, mode = "engine") {
  if (x.pa !== ref.pa) return `${label} ${verb(label)} it as ${actName(x.pa)} instead of ${actName(ref.pa)}`;
  const gx = mode === "engine" ? engineNorm(x.got, x.pa, names) : x.got, gr = mode === "engine" ? engineNorm(ref.got, ref.pa, names) : ref.got;
  const keys = [...new Set([...Object.keys(gx), ...Object.keys(gr)])].filter((k) => k !== "action" && k !== "ask" && (gx[k] ?? "∅") !== (gr[k] ?? "∅"));
  if (!keys.length) return `${label} ${verb(label)} it slightly differently`;
  const one = (k, g) => (pretty(g[k]) == null ? `no ${k}` : `${k} ‘${pretty(g[k])}’`);
  return `${label} ${verb(label)} ${keys.slice(0, 3).map((k) => one(k, gx)).join(", ")} instead of ${keys.slice(0, 3).map((k) => one(k, gr)).join(", ")}`;
}
const listing = (a) => (a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);
/** what another reader read over the same words when it has no reading of the same act to pair with (the pairing pairs one act only, so
 *  "the Rules did not find this request" would be said of a request the Rules read as another action, e.g. label instead of connect): the
 *  first reading of `list` whose unit shares a letter or digit of `mine`'s unit and whose act differs, else null. list, mine: [{pa, span}] */
export function otherAct(text, list, mine) {
  if (!list || !mine || !mine.span) return null;
  const al = /[A-Za-z0-9]/, ov = (a, b) => { for (let i = Math.max(a[0], b[0]); i < Math.min(a[1], b[1]); i++) if (al.test(String(text)[i])) return true; return false; };
  return list.find((x) => x && x.span && x.pa !== mine.pa && ov(x.span, mine.span)) || null;
}
/** who reads a request the same way as the reading `mine` of reader `self`, in one plain sentence. others: [{label, agree (0/1), reading
 *  ({pa, got}) or null (that reader found no such request)}]. -> "the Rules and VSS agree, SOP-BERT reads layout ‘circle’ instead of no layout" */
export function agreementWords(self, mine, others, names, mode = "engine") {
  const yes = others.filter((o) => o.agree), no = others.filter((o) => !o.agree);
  if (!no.length) return others.length === 2 ? "all three readers read it the same" : "both readers read it the same";
  const missing = no.filter((o) => !o.reading), differ = no.filter((o) => o.reading);
  if (!yes.length && !differ.length) return `only ${self} found this request`;
  // the two others read it the same as each other, but not as this reader: one sentence for both
  if (!yes.length && differ.length === 2 && sameShare(differ[0].reading, differ[1].reading, names, mode) === 1 && differ[0].reading.pa === differ[1].reading.pa)
    return readsInstead(listing(differ.map((o) => o.label)), differ[0].reading, mine, names, mode).replace(/^(.*?) read /, "$1 both read ");
  const head = yes.length ? `${listing(yes.map((o) => o.label).concat(self))} agree` : `no two readers read it the same`;
  const tail = differ.map((o) => readsInstead(o.label, o.reading, mine, names, mode)).concat(missing.length ? [`${listing(missing.map((o) => o.label))} did not find this request`] : []);
  return `${head}, ${tail.join("; ")}`;
}
/** the vote inputs of the fitted logistics (not the reader's own signals) */
export const VOTE_INPUTS = new Set(["agree_sop", "agree_vss", "agree_rules", "n_agree", "rules_clean", "rules_notes", "agree", "agree_share", "other_conf"]);
/** a column's logistic part restricted to the reader's own signals, in the format the reasons of vss-confidence.js (kind vss) or
 *  neural-confidence.js (kind sop) read: their reasons() then say which of the reader's own signals pulled the confidence down, with the
 *  weights of this model (the vote inputs are said by agreementWords) */
export function ownSpec(part) {
  const own = part.features.filter((f) => !VOTE_INPUTS.has(f.name));
  return part.kind === "vss"
    ? { intercept: part.intercept, features: own.map((f) => ({ ...f, stage: f.name })), tables: part.tables, world_prior: part.prior || {}, world_prior_default: part.prior_default, levels: {} }
    : { intercept: part.intercept, features: own, tables: part.tables, act_prior: part.prior || {}, act_prior_default: part.prior_default, levels_out_of_fold: {} };
}

/* ---------------------------------------------------------------- loading (browser) */
const loaded = new Map();
/** fetch and parse the model file once per URL (docs/model/confidence/vote3.json?v=<version from versions.json>) */
export function load(url) {
  if (!loaded.has(url)) loaded.set(url, fetch(url, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`); return r.json(); })
    .catch((e) => { loaded.delete(url); throw e; }));
  return loaded.get(url);
}
/** the versioned URL of the model under a docs/model/ root (versions.json "files"["confidence/vote3.json"]) */
export async function urlUnder(root) {
  let v = "unversioned";
  try { const r = await fetch(new URL("versions.json", root).href, { cache: "no-cache" }); if (r.ok) v = ((await r.json()).files || {})[FILE] || v; } catch (e) { /* unversioned */ }
  return new URL(FILE, root).href + "?v=" + encodeURIComponent(v);
}
