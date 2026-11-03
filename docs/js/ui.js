(function () {
'use strict';
const K = SOPKit;
const $ = s => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const svg = $('#canvas'), layer = $('#layer'), framesG = $('#frames'), msgs = $('#msgs');
const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Three readers turn each message into SOP wires, and a fourth tab combines two of them. Each has its own system (world, engine, undo/redo),
// changed only by its own readings; the canvas shows the active tab's world. Every message goes to every reader that is loaded. The tab of the
// neural reader is labelled SOP-BERT (its id stays 'neural'); VSS-BERT (id 'combined') is the combined reader of VSS and SOP-BERT (see the
// "VSS-BERT" block below; training/sketch/combine/COMBINED_READER.md). "3 readers" (id 'vote3') executes what Rules, VSS and SOP-BERT read
// the same (the "Three readers voting" block below; training/sketch/confidence3/RESULT.md).
const READERS = [['rules', 'Rules'], ['vss', 'VSS'], ['neural', 'SOP-BERT'], ['combined', 'VSS-BERT'], ['vote3', '3 readers']].map(([id, label]) => Object.assign({ id, label, last: [], pending: null, focusCell: null, reads: 0, lastRead: null }, K.createSystem()));
const RD = Object.fromEntries(READERS.map(r => [r.id, r]));
const sys = RD.rules, engine = sys.engine;          // the legend, plugins and SOP rendering are the same in every reader; the Rules system serves them
let cur = RD.rules, world = cur.world;               // the active tab
const neural = NeuralKit.create(RD.neural.engine, RD.neural.formalize);
let models = null, queue = Promise.resolve();
// the VSS formalizer reads through the composer (docs/model/micro/registry.json: 9 micro-worlds, CandidateRouter, event hint;
// training/sketch/COMBINED.md).
const VSS_OPTS = { composer: true };
let view = 'auto';
let hl = { shapes: new Set(), edges: new Set() }, hlTimer = null, drag = null;
const history = []; let turnSeq = 0;               // every message with what each reader made of it; a bubble's "details" shows one
let sub = 'drawing';                                // the active reader's subtab: 'drawing' | 'sop' | 'settings' (the same for every reader)
// browser storage is a convenience only: every access is guarded and the page works without it
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { } } };
const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// The gate (owner's main metric, 2026-11-02: do only what you are sure of, ask about the rest; training/sketch/PRECISION.md): a learned reader
// executes a request only when its own confidence clears the threshold of the chosen precision level; below it the request is not executed,
// the reply says why the reader is not sure (vss-confidence.js reasons) and offers "Do it anyway" (that one reading, as one undoable turn).
// GATES[reader id](its formalize result) -> Promise<gate> | null; a gate is {level, threshold, units: [{index, src, conf, execute, nodes,
// reasons: [{text}]}], executed (the nodes to run, message order), held (the units not executed)} (vss-confidence.js gate).
// VSS and SOP-BERT (since 2026-11-03, training/sketch/confidence3/RESULT.md method (c), judged "better" than each reader's own confidence
// on the fresh2 test part): the confidence of a request is the reader's own signals plus whether the other two readers, reading the same
// requests, read it the same way (the "Three readers voting" block below: columnVss, columnSop of docs/js/vote-confidence.js, model
// docs/model/confidence/vote3.json, a threshold for commands and one for questions). When the other learned reader has not read the message
// (not loaded), the tab uses its own confidence alone: VSS docs/model/confidence/vss.json (vss-confidence.js), SOP-BERT
// docs/model/confidence/sop-bert.json (the "Neural gate" block below); the details say which. Level: the tab's Settings (default "cost": the
// safety threshold that maximises the cost score, one confident mistake = 10 right answers, owner 2026-11-02 21:24; execute all, never the
// default; a choice other than the default is kept in this browser when storage works). readPart / doPart, the reply, "Do it anyway" and the details
// are the same code for every reader. The Rules have no confidence and execute everything.
// The cost levels (owner, 2026-11-02 22:12): besides the default (cost 10), "bolder" (one confident mistake counts as 5 right answers) and
// "more careful" (as 20), each the cost-score optimum fitted the same way and stored in the reader's confidence file (vote3.json, vss.json,
// sop-bert.json, combined.json); a file without one falls back to the default. The precision levels 95 / 97 / 99 of vss.json and
// sop-bert.json are not offered any more: the confidences with the votes have only the cost levels.
const GATE_KEY = 'sop.vss.gate', GATE_LEVELS = ['cost5', 'cost', 'cost20', 'all'], GATE_DEFAULT = 'cost';
const COST_OF = { cost5: 5, cost: 10, cost20: 20 }, costWords = c => `one confident mistake counts as ${c} right answers`;
/** what a reader does at a level, for the note when the setting changes */
const gateDoes = l => l === 'all' ? 'executes every request it reads (no gate)' : COST_OF[l] ? `executes a request only when its confidence clears its ${gateLabel(l)} threshold (${costWords(COST_OF[l])}); below it, it asks` : `executes a request only at ${l}% precision; below it, it asks`;
let vssGate = GATE_LEVELS.includes(store.get(GATE_KEY)) ? store.get(GATE_KEY) : GATE_DEFAULT;
const GATES = { vss: v => window.VSSFormalizer && window.VSSFormalizer.gate ? window.VSSFormalizer.gate(v, vssGate) : null, neural: null };
const gateLabel = l => l === 'all' ? 'execute all' : l === 'cost' ? 'safety threshold' : l === 'cost5' ? 'bolder' : l === 'cost20' ? 'more careful' : `${l}% precision`;
// Neural gate (GATES.neural): SOP-BERT's fitted confidence (docs/js/neural-confidence.js; model docs/model/confidence/sop-bert.json, versioned;
// training/sketch/PRECISION_BERT.md), 24 numbers read from the head logits of the reader's own model calls (the act, the value heads, who
// fills each role, the word tags, the cut head, the word pieces), the same value as the scripts (training/sketch/test_neural_confidence.mjs).
// Level: SOP-BERT › Settings, default the file's "cost" level (its safety threshold), the other levels of the file, execute all; a level other
// than the default is kept in this browser. The confidence was fitted on requests cut by the BERT cutter: with that cut the cut head's
// output of the cutter's call is reused; with another cut (Rules, VSS) neural.js runs the cut head once more to read it at that cut's units.
// Without the file every request is asked (the reason says so).
const NGATE_KEY = 'sop.neural.gate';
let neuralGate = ['cost5', 'cost20', 'all'].includes(store.get(NGATE_KEY)) ? store.get(NGATE_KEY) : null;   // null: the default level ("cost")
let ncNow = null;   // the module once loaded (the settings render synchronously)
const ncP = import(new URL('js/neural-confidence.js', document.baseURI).href).then(m => { ncNow = m; return m; }).catch(e => { console.error(e); return null; });
const nconf = { spec: null, error: null, url: null };
/** the confidence file (loaded once; a failure is kept in nconf.error and tried again on the next message) */
async function neuralSpec() {
  const NC = await ncP; if (!NC) throw new Error('docs/js/neural-confidence.js could not be loaded');
  const url = await NeuralKit.confidenceUrl(); nconf.url = url;
  try { nconf.spec = await NC.load(url); nconf.error = null; } catch (e) { nconf.spec = null; nconf.error = e; throw e; }
  return nconf.spec;
}
/** the level the neural gate uses: the chosen one when the file reaches it (or "all"), else the file's default */
const neuralLevel = (NC, spec) => neuralGate && (!spec || neuralGate === 'all' || NC.reached(spec, neuralGate)) ? neuralGate : spec ? NC.defaultLevel(spec) : 'cost';
/** SOP-BERT's own confidence alone (sop-bert.json): the gate when VSS has not read the message (see GATES) */
async function neuralOwnGate(n) {
  const NC = await ncP; if (!NC || !n || !n.joint) return null;
  let spec = null; try { spec = await neuralSpec(); } catch (e) { console.error(e); }
  return NC.gate(spec, n, neuralLevel(NC, spec));
}
// VSS-BERT (READERS id 'combined'; owner, 2026-11-02 21:57 and 22:08): the combined reader of VSS and SOP-BERT (docs/js/combined-confidence.js;
// model docs/model/confidence/combined.json, versioned; training/sketch/combine/COMBINED_READER.md). Both readers read the units of the BERT
// cutter (the cut whose combined confidence scored best on the fresh2 calibration part, the file's best_cut): when the message was cut by it,
// the readings of the VSS and SOP-BERT tabs are reused (no model call); otherwise VSS-BERT cuts with the BERT cutter and both read those units
// here, with its own drawing's names (two calls of the SOP-BERT model: the cut and the read; VSS has no model call). Without the BERT cutter
// (no span head), it reads the shared cut with that cut's fit. The two readers' requests are paired; on a pair SOP-BERT's reading is
// executed, otherwise the one that exists; each gets the combined confidence (SOP-BERT's or VSS's own signals, the agreement of the two, VSS's
// own confidence of its paired reading), executed when it clears the file's threshold; below it the reply says why ("the two readers disagree
// on the colour", "only one reader found this request", what the executing reader itself was unsure of) and offers "Do it anyway". Level:
// VSS-BERT › Settings: safety threshold (default) or execute all, kept in this browser when it is not the default. Every number comes from the file.
const CGATE_KEY = 'sop.combined.gate';
let combGate = ['cost5', 'cost20', 'all'].includes(store.get(CGATE_KEY)) ? store.get(CGATE_KEY) : 'cost';
let ccNow = null;
const ccP = import(new URL('js/combined-confidence.js', document.baseURI).href).then(m => { ccNow = m; return m; }).catch(e => { console.error(e); return null; });
const vcP = import(new URL('js/vss-confidence.js', document.baseURI).href).catch(e => { console.error(e); return null; });
const cconf = { spec: null, error: null, url: null };
/** the combined confidence file (loaded once; a failure is kept in cconf.error and tried again on the next message) */
async function combinedSpec() {
  const CC = await ccP; if (!CC) throw new Error('docs/js/combined-confidence.js could not be loaded');
  if (cconf.spec) return cconf.spec;
  try { cconf.url = await CC.urlUnder(new URL('model/', document.baseURI).href); cconf.spec = await CC.load(cconf.url); cconf.error = null; } catch (e) { cconf.error = e; throw e; }
  return cconf.spec;
}
const CNAMES = { sop: 'SOP-BERT', vss: 'VSS' };
/** the request's text as written on a wire rebuilt from a reader's wire (VSS-BERT, 3 readers): the help world answers from its words
 *  ("how do I label an arrow?"; logic.js help plugin reads node.src, else node.unit.src) */
const keepSrc = (x, y) => { const src = x.src || (x.unit && x.unit.src); if (src) Object.defineProperty(y, 'src', { value: src, enumerable: false, configurable: true }); };
/** VSS-BERT reads one message: the two readings on the BERT cut, paired, the combined confidence and the gate -> {nodes, notes, gate, ms, ...} */
async function combinedRead(rd, text, rec, ctx) {
  const t0 = performance.now(), CC = await ccP, NC = await ncP, VCm = await vcP;
  let spec = null; try { spec = await combinedSpec(); } catch (e) { console.error(e); }
  const want = spec ? spec.best_cut : 'bert', rv = rec.readers.vss, rn = rec.readers.neural, shared = rec.cut ? rec.cut.strategy : null;
  let v, n, cut, how, readMs = 0;
  if (shared === want && rv && rv.vss && rn && rn.neural) { v = rv.vss; n = rn.neural; cut = want; how = 'reused'; readMs = (rv.ms || 0) + (rn.ms || 0); }
  else if (!cutWhyNot(want)) {
    const units = await VF.cut(text, ctx, want, { rules: RD.rules, neural: NeuralKit });
    n = await neural.formalize(text, ctx, { units, signals: true });
    v = await window.VSSFormalizer.formalize(text, ctx, rd.formalize, Object.assign({}, VSS_OPTS, { units }));
    cut = want; how = 'own';
  } else {
    if (!rv || !rv.vss || !rn || !rn.neural) throw new Error('VSS-BERT needs the readings of both VSS and SOP-BERT for this message');
    v = rv.vss; n = rn.neural; cut = shared || 'vss'; how = 'shared'; readMs = (rv.ms || 0) + (rn.ms || 0);
  }
  const tc = performance.now();
  let vssModel = null; try { vssModel = await window.VSSFormalizer.loadConfidence(); } catch (e) { console.error(e); }
  let nspec = null; try { nspec = await neuralSpec(); } catch (e) { console.error(e); }
  const pa = x => `${x.type}:${x.args.action || x.args.ask || ''}`;
  const args0 = x => ({ action: x.args.action ?? null, name: typeof x.args.name === 'string' ? x.args.name : null, count: x.args.count ?? null });
  const sop = n.nodes.filter(x => x.type !== 'mention' && x.unit).map(x => { const sig = NC ? NC.signals(n, n.analyses.indexOf(x.unit)) : null;
    return { node: x, sig, f: sig ? sig.f : {}, act: sig ? sig.act : (x.args.action || x.args.ask || x.type), pa: pa(x), got: BenchCanon.canon(x, n.nodes), span: x.span || [0, 0], args0: args0(x) }; });
  const vss = v.nodes.filter(x => x.type !== 'mention' && x.unit).map(x => ({ node: x, f: x.unit.signals || {}, world: x.unit.world, pa: pa(x), got: BenchCanon.canon(x, v.nodes), span: x.span || [x.unit.c0, x.unit.c1], args0: args0(x),
    conf: vssModel && VCm ? (x.unit.signals ? VCm.confidence(vssModel, x.unit.signals, x.unit.world) : 0) : NaN }));
  const msg = { text, cut, sop, vss, cutWords: n.joint ? n.joint.cut : null };
  const ok = !!(spec && CC && vssModel && NC);
  const res = ok ? CC.combine(spec, msg, combGate) : null;
  const items = res ? res.items : sop.map((s, j) => ({ from: 'sop', j, partner: -1, conf: NaN, execute: combGate === 'all' })).concat(vss.map((s, j) => ({ from: 'vss', j, partner: -1, conf: NaN, execute: combGate === 'all' })));
  // the readings to run, in message order, with fresh ids (the two readers number their wires independently); a VSS request that refers
  // to a shape made by a paired request refers to SOP-BERT's reading of it (the one executed)
  const R = { sop: { res: n, list: sop }, vss: { res: v, list: vss } };
  items.forEach(it => { const q = R[it.from].list[it.j]; it.req = q; it.nodes0 = R[it.from].res.nodes.filter(x => x.unit === q.node.unit); });
  items.sort((a, b) => (a.req.span[0] - b.req.span[0]) || (a.from === 'sop' ? -1 : 1));
  const idOf = new Map(); let k = 0;
  for (const it of items) for (const x of it.nodes0) idOf.set(it.from + ':' + x.id, (x.type === 'mention' ? 'm' : 'w') + (++k));
  for (const it of items) if (it.from === 'sop' && it.partner >= 0) idOf.set('vss:' + vss[it.partner].node.id, idOf.get('sop:' + it.req.node.id));
  const mapV = (from, val) => K.isRef(val) ? { ref: idOf.get(from + ':' + val.ref) || val.ref } : Array.isArray(val) ? val.map(y => mapV(from, y)) : val;
  const units = items.map((it, index) => {
    const nodes = it.nodes0.map(x => { const y = { id: idOf.get(it.from + ':' + x.id), type: x.type, args: Object.fromEntries(Object.entries(x.args).map(([a, b]) => [a, mapV(it.from, b)])) };
      if (x.span) Object.defineProperty(y, 'span', { value: x.span, enumerable: false, configurable: true }); keepSrc(x, y); return y; });
    const src = text.slice(it.req.span[0], it.req.span[1]).trim() || it.req.node.src || '';
    return { index, item: it, from: it.from, src, conf: it.conf, execute: it.execute, nodes, reasons: [], dependsOn: [] };
  });
  const owner = new Map(); units.forEach(u => u.nodes.forEach(x => owner.set(x.id, u)));
  const refsOf = val => K.isRef(val) ? [val.ref] : Array.isArray(val) ? val.flatMap(refsOf) : [];
  for (const u of units) for (const x of u.nodes) for (const r of Object.values(x.args).flatMap(refsOf)) { const o = owner.get(r); if (o && o !== u && !u.dependsOn.includes(o)) u.dependsOn.push(o); }
  for (const u of units) {   // message order: a request's dependencies come before it
    const off = u.dependsOn.filter(d => !d.execute);
    if (u.execute && off.length) { u.execute = false; u.reasons = off.map(d => ({ text: `it uses what “${d.src}” would have made, which was not done` })); continue; }
    if (u.execute) continue;
    if (!ok) { u.reasons = [{ text: !spec ? 'the combined confidence model could not be loaded' : !vssModel ? 'VSS’s confidence model could not be loaded' : 'the code of the combined confidence could not be loaded' }]; continue; }
    u.reasons = CC.reasons(msg, u.item, CNAMES).map(x => ({ text: x.text }));
    // what the executing reader itself was unsure of (its own confidence below its own safety threshold)
    if (u.from === 'sop' && nspec && u.item.req.sig) { const c = NC.confidence(nspec, u.item.req.sig.f, u.item.req.sig.act); if (c < NC.threshold(nspec, 'cost')) { const w = NC.reasons(nspec, u.item.req.sig)[0]; if (w) u.reasons.push({ text: `SOP-BERT alone is not sure: ${w.text}` }); } }
    if (u.from === 'vss' && VCm) { const q = u.item.req; if (q.conf < VCm.threshold(vssModel, 'cost')) { const w = VCm.reasons(vssModel, q.node.unit)[0]; if (w) u.reasons.push({ text: `VSS alone is not sure: ${w.text}` }); } }
  }
  const all = units.flatMap(u => u.nodes), run = new Set(units.filter(u => u.execute).flatMap(u => u.nodes));
  const t = res ? res.threshold : combGate === 'all' ? -Infinity : Infinity;
  const gate = { level: combGate, effective: combGate, threshold: t, units, executed: all.filter(x => run.has(x)), held: units.filter(u => !u.execute) };
  const notes = [];
  if (how === 'shared') notes.push(`The BERT cutter is not available, so VSS-BERT read the shared cut (${cutLabel(cut)})${res && !res.fitted ? '; its confidence was fitted on the BERT and VSS cuts, the BERT cut’s fit is used' : ''}.`);
  const combineMs = performance.now() - tc;
  return { nodes: all, notes, gate, cut, how, fitted: res ? res.fitted : null, fit: res ? res.cut : null, msg, items, units, readMs, combineMs, calls: how === 'own' ? n.calls + 1 : 0,   // + 1: the cut (neural.js counts the calls of one formalize)
   
    ms: how === 'own' ? performance.now() - t0 : readMs + combineMs };
}
GATES.combined = async c => c.gate;
/** VSS-BERT in a message's details: where the readings came from, and how the two readings of each request compare */
function combinedHTML(c) {
  const from = c.how === 'reused' ? `the readings of the VSS and SOP-BERT tabs on the ${cutLabel(c.cut)}’s requests, reused (VSS and SOP-BERT ${fmtMs(c.readMs)}, combining ${fmtMs(c.combineMs)})`
    : c.how === 'own' ? `read here on the ${cutLabel(c.cut)}’s requests (${c.calls} SOP-BERT model calls: the cut and the read; VSS on the same requests; combining ${fmtMs(c.combineMs)})`
    : `the readings of the shared cut (${cutLabel(c.cut)}), reused`;
  let h = `<div class="note">VSS-BERT: ${escH(from)}; combined confidence of the ${escH(c.fit ? cutLabel(c.fit) : '?')}${c.fitted === false ? ' (this cut was not fitted)' : ''}.</div>`;
  h += `<ul class="units">${c.units.map(u => { const it = u.item, p = it.from === 'sop' && it.partner >= 0;
    const what = it.from === 'vss' ? 'VSS’s reading (SOP-BERT has none of this action here)' : p ? `SOP-BERT’s reading; VSS ${it.agree ? 'reads it the same' : `agrees on ${Math.round(it.agree_share * 100)}% of the values`} (VSS’s own confidence ${Number.isFinite(it.other_conf) ? it.other_conf.toFixed(3) : '?'})` : 'SOP-BERT’s reading (VSS has none of this action here)';
    return `<li><span class="src">“${escH(u.src)}”</span> → ${escH(what)}</li>`; }).join('')}</ul>`;
  return h;
}
/** VSS-BERT › Settings: what it is, the level (safety threshold or execute all) and the file's numbers */
function combinedSettingsHTML() {
  const spec = cconf.spec;
  if (!spec) { const again = () => { if (sub === 'settings' && cur.id === 'combined') renderSub(); }; if (!cconf.error) combinedSpec().then(again, again); }
  const pc = v => (v * 100).toFixed(1) + '%', B = spec ? spec.cuts[spec.best_cut] : null, cal = B && B.calibration_oof, te = B && B.test_already_read_exploratory, alone = spec && spec.readers_alone;
  const opt = (l, about) => `<label style="display:flex;gap:8px;align-items:flex-start;margin:0 0 6px;cursor:pointer"><input type="radio" name="comb-gate" value="${l}" ${l === combGate ? 'checked' : ''}> <span><b>${escH(gateLabel(l))}</b>${l === 'cost' ? ' (default)' : ''}: ${escH(about)}</span></label>`;
  const costAbout = l => { const x = B && (B.levels || {})[l];
    if (!x) return cconf.error ? `the model could not be loaded (${cconf.error.message || cconf.error}): every request is asked` : spec ? `not in the model file: the safety threshold is used` : 'loading the model…';
    return `acts when its combined confidence is at least ${x.threshold.toFixed(4)}: the threshold that scores best when ${costWords(x.cost)}; on the calibration messages (out-of-fold scores) ${pc(x.heldout_oof_precision)} of what it executed was right, it did ${pc(x.heldout_oof_coverage)} of the requests right and asked about ${pc(x.heldout_oof_asked)}`; };
  return `<h3 class="sub">VSS-BERT reader</h3>${readerFacts(RD.combined)}
  <p class="intro">VSS-BERT is not a third model: it is VSS and SOP-BERT reading the same requests, and it does what they are sure of together. Both read the requests of the BERT cutter (the cut with which this combination scored best; when the message was cut by it, the readings of the two tabs are reused, otherwise VSS-BERT cuts and reads here, with two SOP-BERT model calls). The two readings of each request are paired: when both readers have it, SOP-BERT’s reading is the one executed; when only one has it, that one. Each request gets a combined confidence: the executing reader’s own numbers, whether the two readers agree (all the values, or a share of them) and VSS’s own confidence. When the two agree, a request is right about 95% of the time, so agreement raises the confidence; when they disagree, or only one reader found the request, it is lowered. Below the threshold it asks, says why, and offers <b>Do it anyway</b>.</p>
  <p class="intro"><button type="button" class="btn" data-help="two-readers">Two readers together</button></p>
  <h3 class="sub">When VSS-BERT acts</h3>
  ${['cost5', 'cost', 'cost20'].map(l => opt(l, costAbout(l))).join('')}${opt('all', 'no gate: every request is executed (SOP-BERT’s reading on a pair, the one that exists otherwise)')}
  ${B ? `<p class="note">Fitted on the calibration part of the fresh2 and short3 messages (368 messages), out of fold (training/sketch/combine/COMBINED_READER.md, refitted for the readers of 2026-11-03${spec.variant && spec.variant !== '(a)' ? `; variant ${escH(spec.variant)}: the combined confidence reads neither how often SOP-BERT’s action nor how often VSS’s world is read right, the variant chosen on the calibration part by the rule of training/sketch/confidence3/PLAN.md` : ''}). Cost score on that part: VSS-BERT ${cal.score.toFixed(1)}, SOP-BERT alone ${alone.sop.calibration_oof_score.toFixed(1)}, VSS alone ${alone.vss.calibration_oof_score.toFixed(1)}. On the test part (already read before; exploratory): ${te.score.toFixed(1)}, ${pc(te.confidently_wrong)} of what it executed wrong, ${pc(te.done_right)} of the requests done right. The clean confirmation needs a fresh set of messages (fresh3). Model <code>confidence/combined.json</code>${cconf.url && /[?&]v=/.test(cconf.url) ? `, version <code>${escH(decodeURIComponent(cconf.url.split('v=').pop()))}</code>` : ''}.</p>` : ''}`;
}
// Three readers voting (owner, 2026-11-02 evening; training/sketch/confidence3/PLAN.md, RESULT.md; docs/js/vote-confidence.js, model
// docs/model/confidence/vote3.json, versioned, written by training/sketch/confidence3/export3.mjs). The Rules, VSS and SOP-BERT read the same
// requests (the shared cut); their readings of a request are paired, and two readings agree when every canonical value (bench-canon.js) is
// equal after engineNorm (d1: what logic.js does with them: an arrange / distribute / whole-drawing operation's list in any order, "no target" = "all" = every name on
// the canvas). The Rules are edited often: comparing after engineNorm keeps a change in how they write the same request from counting as a
// disagreement. Uses:
//  - VSS tab: columnVss (VSS's own signals, no world prior, + whether SOP-BERT and the Rules read it the same), method (c) of RESULT.md;
//  - SOP-BERT tab: columnSop (its own signals and act prior + the votes of VSS and the Rules), method (c);
//  - "3 readers" tab (id vote3): by default a request is executed only when all three read it the same (no fitted weight: on the
//    calibration messages such a request was right 96.7% of the time, on the test part 95.8%); "fitted vote": the fitted vote (vote3.json
//    columns.vote3) at its cost-score threshold (it executes less than "all three agree" and is confidently wrong less often on the BERT
//    cut it was fitted on; the page cuts with the VSS cutter by default, see voteSettingsHTML); execute all. "2 of 3 agree" is not offered:
//    measured, it is not safe (RESULT.md section 2).
// Every vote reuses the readings the three tabs made of this message (rec.readers): nothing is read twice. Thresholds per type (commands,
// questions) and weights are the file's. The fitted columns were fitted on the BERT cut (SOP-BERT, 3 readers) and the VSS cut (VSS).
const VOTE_OPTS = { agreement: 'engine' };
let vtNow = null;
const vtP = import(new URL('js/vote-confidence.js', document.baseURI).href).then(m => { vtNow = m; return m; }).catch(e => { console.error(e); return null; });
const vconf = { spec: null, error: null, url: null };
/** the vote file (loaded once; a failure is kept in vconf.error and tried again on the next message) */
async function voteSpec() {
  const VT = await vtP; if (!VT) throw new Error('docs/js/vote-confidence.js could not be loaded');
  if (vconf.spec) return vconf.spec;
  try { vconf.url = await VT.urlUnder(new URL('model/', document.baseURI).href); vconf.spec = await VT.load(vconf.url); vconf.error = null; } catch (e) { vconf.error = e; throw e; }
  return vconf.spec;
}
const VKEY = 'sop.vote3.gate';
let voteGate = ['fitted', 'all'].includes(store.get(VKEY)) ? store.get(VKEY) : 'agree3';   // 'agree3' (default) | 'fitted' (the fitted vote) | 'all'
const voteLabel = l => l === 'agree3' ? 'all three agree' : l === 'fitted' ? 'fitted vote' : 'execute all';
const unitOfNode = (n, text) => { if (n.span) return [n.span[0], n.span[1]]; const k = n.src ? text.indexOf(n.src) : -1; return k < 0 ? [0, 0] : [k, k + n.src.length]; };
const paOf = x => `${x.type}:${x.args.action || x.args.ask || ''}`;
const args0Of = x => ({ action: x.args.action ?? null, name: typeof x.args.name === 'string' ? x.args.name : null, count: x.args.count ?? null });
/** the three readers' readings of one message in the form vote-confidence.js takes (training/sketch/confidence3/collect_rules3.mjs and
 *  combine/collect_pair.mjs: one entry per wire that is not a mention; SOP-BERT and VSS: the wires of a request), built once per message
 *  from the readings of the Rules, VSS and SOP-BERT tabs. A reader that did not read the message has null. */
async function votesOf(rec) {
  if (rec.votes) return rec.votes;
  const NC = await ncP, VCm = await vcP, R = rec.readers, text = rec.text;
  let vssModel = null; try { vssModel = await window.VSSFormalizer.loadConfidence(); } catch (e) { console.error(e); }
  const rr = R.rules && R.rules.rulesRes, rv = R.vss && R.vss.vss, rn = R.neural && R.neural.neural;
  const one = (res, x) => ({ node: x, pa: paOf(x), got: BenchCanon.canon(x, res.nodes), span: unitOfNode(x, text), args0: args0Of(x) });
  const rules = rr ? rr.nodes.filter(x => x.type !== 'mention').map(x => Object.assign(one(rr, x), { notes: (rr.notes || []).filter(s => String(s).startsWith(`@${x.id}:`)).length })) : null;
  const rulesMsg = rr ? { msgNotes: (rr.notes || []).filter(s => !/^@\w+:/.test(String(s))).length, unread: (rr.segments || []).filter(sg => sg.id == null).length } : null;
  const vss = rv ? rv.nodes.filter(x => x.type !== 'mention' && x.unit).map(x => Object.assign(one(rv, x), { span: x.span ? [x.span[0], x.span[1]] : x.unit.c1 != null ? [x.unit.c0, x.unit.c1] : unitOfNode(x, text),
    f: x.unit.signals || {}, world: x.unit.world, conf: vssModel && VCm ? (x.unit.signals ? VCm.confidence(vssModel, x.unit.signals, x.unit.world) : 0) : NaN })) : null;
  const sop = rn ? rn.nodes.filter(x => x.type !== 'mention' && x.unit).map(x => { const sig = NC ? NC.signals(rn, rn.analyses.indexOf(x.unit)) : null;
    return Object.assign(one(rn, x), { sig, f: sig ? sig.f : {}, act: sig ? sig.act : (x.args.action || x.args.ask || x.type) }); }) : null;
  rec.votes = { text, rules, rulesMsg, vss, sop, cutWords: rn && rn.joint ? rn.joint.cut : null, cut: rec.cut ? rec.cut.strategy : null };
  return rec.votes;
}
/** what logic.js does with the shapes of one tab's drawing when it arranges or distributes (alRun / alShapes, itemsOnly, expandGroups): a
 *  group name stands for its members; the background and zone panels are not moved; no target or "all" = every other shape of the
 *  drawing's current area. -> {all: those names (engineNorm's "every canvas name"), groups (lower-case name -> members), panels} */
function engineView(rd) {
  const S = rd.world.state, f = S.frame || { x: 0, y: 0 }, lc = n => String(n).toLowerCase(), isPanel = s => s.layer === 'background' || s.layer === 'zone';
  return { all: S.shapes.filter(s => !isPanel(s) && (c => c.x === f.x && c.y === f.y)(K.cellOf(s.x, s.y))).map(s => s.name),
    groups: new Map((S.groups || []).map(g => [lc(g.name), g.members.map(lc)])), panels: new Set(S.shapes.filter(isPanel).map(s => lc(s.name))) };
}
/** the input of vote-confidence.js for one tab: the three readings, their arrange / distribute lists as that tab's drawing makes them
 *  (vote-confidence.js engineTargets), and the names of "every shape" of that drawing */
const voteMsg = (votes, rd) => { const v = engineView(rd), f = l => (l || []).map(x => vtNow.engineTargets(x, v)); return Object.assign({}, votes, { rules: f(votes.rules), vss: f(votes.vss), sop: f(votes.sop), names: v.all }); };
/** a tab's gate from a column of the vote file: base = the reader's own gate at level "all" (the requests and their wires, every one
 *  executed), items = columnVss / columnSop (one per wire of a request), list = the readings the items index. A request executes when every
 *  item of it clears its threshold, and only when the requests it refers to execute (as vss-confidence.js gate). -> the gate (see GATES) */
function columnGate(base, items, list, level, levels, whyOf) {
  const VT = vtNow, by = new Map();
  items.forEach(it => { const u = list[it.j].node.unit; (by.get(u) || by.set(u, []).get(u)).push(it); });
  const gu = new Map(base.units.map(g => [g.unit, g]));
  for (const g of base.units) {
    const its = by.get(g.unit) || [];
    g.items = its; g.conf = its.length ? Math.min(...its.map(i => i.conf)) : NaN; g.t = its.length ? Math.max(...its.map(i => i.threshold)) : -Infinity;
    g.sure = g.execute = its.every(i => i.execute);
    g.reasons = g.execute ? [] : whyOf(its.filter(i => !i.execute));
  }
  for (const g of base.units) {   // message order: a request's dependencies come before it
    const off = g.dependsOn.map(o => gu.get(o)).filter(d => d && !d.execute);
    if (g.execute && off.length) { g.execute = false; g.reasons = off.map(d => ({ text: `it uses what “${d.src}” would have made, which was not done` })); }
  }
  const run = new Set(base.units.filter(g => g.execute).flatMap(g => g.nodes));
  const thresholds = { command: VT.thresholdOf(levels, level, 'command:'), question: VT.thresholdOf(levels, level, 'question:') };
  return Object.assign(base, { level, effective: level, label: gateLabel(level), threshold: thresholds.command, thresholds, method: 'votes', executed: base.executed.filter(n => !n.unit || run.has(n)), held: base.units.filter(g => !g.execute) });
}
/** the plain-words reasons of a held request of a column: who reads it the same, then what the reader itself was unsure of (its own signals
 *  under the column's weights, the sentences of vss-confidence.js / neural-confidence.js) */
function columnWhy(self, mine, others, names, own) {
  const VT = vtNow, out = [{ text: VT.agreementWords(self, mine, others, names, 'engine') }];
  for (const w of (own || []).slice(0, 2)) out.push({ text: `${self} itself: ${w.text}` });
  return out;
}
/** why a reader's gate has no votes for this message, in plain words: the other learned reader still loading, not available, or ready but
 *  without a reading of it; the Rules did not read it */
function noVoteWhy(votes, other, otherRd) {
  votes = votes || {};
  if (!votes[other === 'SOP-BERT' ? 'sop' : 'vss']) {
    const st = other === 'SOP-BERT' ? nState : vssState;
    return isReady(otherRd) ? `${other} did not read this message` : ['checking', 'loading', 'idle'].includes(st) ? `${other} is still loading` : `${other} is not available`;
  }
  return !votes.rules ? 'the Rules did not read this message' : null;
}
/** a gate without the votes (noVoteWhy): the reason of every request held by the reader's own confidence starts with why there were no votes,
 *  "SOP-BERT is still loading, so VSS decided alone and is not sure: …" (a request held because it uses one not done keeps its reason) */
function aloneReasons(g, why, self) {
  if (!g) return g;
  for (const u of g.units || []) if (!u.execute && u.sure === false)
    u.reasons = [{ text: `${why}, so ${self} decided alone and is not sure${u.reasons.length ? ': ' + u.reasons.map(r => r.text).join('; ') : ''}` }];
  return g;
}
/** VSS's gate (GATES.vss): columnVss when SOP-BERT and the Rules have read the message, else VSS's own confidence alone (vss.json) */
GATES.vss = async (v, rec, r) => {
  if (!window.VSSFormalizer || !window.VSSFormalizer.gate) return null;
  const VT = await vtP; let spec = null; try { spec = await voteSpec(); } catch (e) { console.error(e); }
  const votes = rec ? await votesOf(rec) : null;
  const why = !VT || !spec ? 'the model of the votes (confidence/vote3.json) could not be loaded' : noVoteWhy(votes, 'SOP-BERT', RD.neural);
  if (why) { const g = aloneReasons(await window.VSSFormalizer.gate(v, vssGate), why, 'VSS'); if (g) g.fallback = `${why}, so VSS used its own confidence alone (confidence/vss.json)`; return g; }
  const VCm = await vcP, C = spec.columns.vss, m = voteMsg(votes, RD.vss), items = VT.columnVss(spec, m, vssGate, VOTE_OPTS);
  const own = VCm ? VT.ownSpec(C.model) : null;
  return columnGate(await window.VSSFormalizer.gate(v, 'all'), items, m.vss, vssGate, C.levels, held => held.length ? columnWhy('VSS', m.vss[held[0].j], [
    { label: 'SOP-BERT', agree: held[0].agree_sop, reading: held[0].partner_sop >= 0 ? m.sop[held[0].partner_sop] : VT.otherAct(m.text, m.sop, m.vss[held[0].j]) },
    { label: 'the Rules', agree: held[0].agree_rules, reading: held[0].partner_rules >= 0 ? m.rules[held[0].partner_rules] : VT.otherAct(m.text, m.rules, m.vss[held[0].j]) }], m.names, own ? VCm.reasons(own, m.vss[held[0].j].node.unit) : []) : []);
};
/** SOP-BERT's gate (GATES.neural): columnSop when VSS and the Rules have read the message, else its own confidence alone (sop-bert.json) */
GATES.neural = async (n, rec, r) => {
  const NC = await ncP; if (!NC || !n || !n.joint) return null;
  const VT = await vtP; let spec = null; try { spec = await voteSpec(); } catch (e) { console.error(e); }
  const votes = rec ? await votesOf(rec) : null;
  const why = !VT || !spec ? 'the model of the votes (confidence/vote3.json) could not be loaded' : noVoteWhy(votes, 'VSS', RD.vss);
  if (why) { const g = aloneReasons(await neuralOwnGate(n), why, 'SOP-BERT'); if (g) g.fallback = `${why}, so SOP-BERT used its own confidence alone (confidence/sop-bert.json)`; return g; }
  const level = neuralGate || 'cost', C = spec.columns.sop, m = voteMsg(votes, RD.neural), items = VT.columnSop(spec, m, level, VOTE_OPTS), own = VT.ownSpec(C.model);
  for (const it of items) { const s = m.sop[it.j]; if (level !== 'all' && (!s.sig || s.sig.detail.noCut)) { it.conf = NaN; it.execute = false; it.noSignals = true; } }
  return columnGate(NC.gate(null, n, 'all'), items, m.sop, level, C.levels, held => {
    if (!held.length) return [];
    const it = held[0], s = m.sop[it.j];
    if (it.noSignals) return [{ text: !s.sig ? 'the model’s head outputs were not available, so its confidence is not known' : 'the cut head’s output was not available, so its confidence is not known' }];
    return columnWhy('SOP-BERT', s, [{ label: 'VSS', agree: it.agree_vss, reading: it.partner_vss >= 0 ? m.vss[it.partner_vss] : VT.otherAct(m.text, m.vss, s) },
      { label: 'the Rules', agree: it.agree_rules, reading: it.partner_rules >= 0 ? m.rules[it.partner_rules] : VT.otherAct(m.text, m.rules, s) }], m.names, NC.reasons(own, s.sig));
  });
};
/** the "3 readers" tab reads one message: the three tabs' readings, paired, voted on, gated -> {nodes, notes, gate, units, ms, ...} */
async function voteRead(rd, text, rec, ctx) {
  const t0 = performance.now(), VT = await vtP;
  let spec = null; try { spec = await voteSpec(); } catch (e) { console.error(e); }
  const R = rec.readers;
  if (!(R.rules && R.rules.rulesRes) || !(R.vss && R.vss.vss) || !(R.neural && R.neural.neural)) throw new Error('3 readers needs the readings of Rules, VSS and SOP-BERT for this message');
  const votes = await votesOf(rec), m = voteMsg(votes, rd), level = voteGate, ok = !!(VT && spec);
  const items = ok ? VT.vote3(spec, m, level === 'all' ? 'all' : 'cost', level === 'agree3', VOTE_OPTS)
    : m.sop.map((s, j) => ({ from: 'sop', j, pa: s.pa, n_agree: 1, pattern: '?', vss: -1, rules: -1, conf: NaN, threshold: Infinity, execute: level === 'all' }));
  // the wires to run: per request, the wires of the reader whose reading is executed (with the mentions of that request), fresh ids
  const RES = { sop: { res: R.neural.neural, list: m.sop }, vss: { res: R.vss.vss, list: m.vss } };
  const groups = new Map();   // one request of the reply per unit of the reader whose reading is executed: a unit with two wires is executed whole
  for (const it of items) { const q = RES[it.from].list[it.j], u = q.node.unit;
    if (!groups.has(u)) groups.set(u, { from: it.from, unit: u, items: [], req: q }); groups.get(u).items.push(it); }
  const G = [...groups.values()].sort((a, b) => (a.req.span[0] - b.req.span[0]) || (a.from === 'sop' ? -1 : 1));
  G.forEach(g => { g.nodes0 = RES[g.from].res.nodes.filter(x => x.unit === g.unit); });
  const idOf = new Map(); let k = 0;
  for (const g of G) for (const x of g.nodes0) idOf.set(g.from + ':' + x.id, (x.type === 'mention' ? 'm' : 'w') + (++k));
  for (const g of G) for (const it of g.items) {   // a reference to the paired reading of the other learned reader refers to the one executed
    if (it.from === 'sop' && it.vss >= 0) idOf.set('vss:' + m.vss[it.vss].node.id, idOf.get('sop:' + m.sop[it.j].node.id));
    if (it.from === 'vss' && it.sop >= 0) idOf.set('sop:' + m.sop[it.sop].node.id, idOf.get('vss:' + m.vss[it.j].node.id));
  }
  const mapV = (from, val) => K.isRef(val) ? { ref: idOf.get(from + ':' + val.ref) || val.ref } : Array.isArray(val) ? val.map(y => mapV(from, y)) : val;
  const rule = level === 'agree3', names = m.names;
  const whyOf = it => {   // plain words: who reads it the same; what the one that differs reads instead
    if (!ok) return [{ text: !VT ? 'the code of the votes could not be loaded' : 'the model of the votes (confidence/vote3.json) could not be loaded' }];
    const has = c => it.pattern.includes(c);
    if (it.pattern === 'R+V+S') return [{ text: 'all three readers read it the same, but the fitted vote’s confidence is below its threshold' }];
    if (it.from === 'vss') return [{ text: VT.agreementWords('VSS', m.vss[it.j], [{ label: 'the Rules', agree: has('R'), reading: it.rules >= 0 ? m.rules[it.rules] : VT.otherAct(m.text, m.rules, m.vss[it.j]) }, { label: 'SOP-BERT', agree: 0, reading: it.sop >= 0 ? m.sop[it.sop] : VT.otherAct(m.text, m.sop, m.vss[it.j]) }], names, 'engine') }];
    return [{ text: VT.agreementWords('SOP-BERT', m.sop[it.j], [{ label: 'the Rules', agree: has('R'), reading: it.rules >= 0 ? m.rules[it.rules] : VT.otherAct(m.text, m.rules, m.sop[it.j]) }, { label: 'VSS', agree: has('V'), reading: it.vss >= 0 ? m.vss[it.vss] : VT.otherAct(m.text, m.vss, m.sop[it.j]) }], names, 'engine') }];
  };
  const units = G.map((g, index) => {
    const nodes = g.nodes0.map(x => { const y = { id: idOf.get(g.from + ':' + x.id), type: x.type, args: Object.fromEntries(Object.entries(x.args).map(([a, b]) => [a, mapV(g.from, b)])) };
      if (x.span) Object.defineProperty(y, 'span', { value: x.span, enumerable: false, configurable: true }); keepSrc(x, y); return y; });
    const src = text.slice(g.req.span[0], g.req.span[1]).trim() || g.req.node.src || '';
    const execute = g.items.every(i => i.execute), held = g.items.filter(i => !i.execute);
    const conf = rule ? NaN : Math.min(...g.items.map(i => i.conf)), t = rule ? NaN : Math.max(...g.items.map(i => i.threshold));
    return { index, from: g.from, items: g.items, src, conf, t, execute, nodes, reasons: held.length ? whyOf(held[0]) : [], dependsOn: [] };
  });
  const owner = new Map(); units.forEach(u => u.nodes.forEach(x => owner.set(x.id, u)));
  const refsOf = val => K.isRef(val) ? [val.ref] : Array.isArray(val) ? val.flatMap(refsOf) : [];
  for (const u of units) for (const x of u.nodes) for (const r of Object.values(x.args).flatMap(refsOf)) { const o = owner.get(r); if (o && o !== u && !u.dependsOn.includes(o)) u.dependsOn.push(o); }
  for (const u of units) { const off = u.dependsOn.filter(d => !d.execute); if (u.execute && off.length) { u.execute = false; u.reasons = off.map(d => ({ text: `it uses what “${d.src}” would have made, which was not done` })); } }
  const all = units.flatMap(u => u.nodes), run = new Set(units.filter(u => u.execute).flatMap(u => u.nodes));
  const L = ok && level === 'fitted' ? spec.columns.vote3.levels : null;
  const thresholds = L ? { command: VT.thresholdOf(L, 'cost', 'command:'), question: VT.thresholdOf(L, 'cost', 'question:') } : null;
  const gate = { level, effective: level, label: voteLabel(level), threshold: level === 'all' ? -Infinity : thresholds ? thresholds.command : NaN, thresholds, rule, units, executed: all.filter(x => run.has(x)), held: units.filter(u => !u.execute) };
  const notes = [];
  if (level === 'fitted' && votes.cut && votes.cut !== 'bert') notes.push(`The fitted vote was fitted on the requests of the BERT cutter; this message was cut by the ${cutLabel(votes.cut)}.`);
  return { nodes: all, notes, gate, units, items, cut: votes.cut, ok, ms: performance.now() - t0 };
}
GATES.vote3 = async x => x.gate;
/** "3 readers" in a message's details: where the readings came from, and who agrees on each request */
function voteHTML(x) {
  const names = { sop: 'SOP-BERT’s reading', vss: 'VSS’s reading' };
  let h = `<div class="note">3 readers: the readings of the Rules, VSS and SOP-BERT tabs on the ${escH(cutLabel(x.cut || 'rules'))}’s requests, reused (voting ${fmtMs(x.ms)}); readings compared after engineNorm.</div>`;
  h += `<ul class="units">${x.units.map(u => `<li><span class="src">“${escH(u.src)}”</span> → ${escH(names[u.from])}; ${escH(u.items.map(i => i.pattern === 'R+V+S' ? 'all three read it the same' : i.pattern === 'V+S' ? 'VSS and SOP-BERT agree' : i.pattern === 'R+S' ? 'the Rules and SOP-BERT agree' : i.pattern === 'R+V' ? 'the Rules and VSS agree' : 'no two readers agree').join('; '))}</li>`).join('')}</ul>`;
  return h;
}
/** 3 readers › Settings: what it is, the level, the file's numbers */
function voteSettingsHTML() {
  const spec = vconf.spec;
  if (!spec) { const again = () => { if (sub === 'settings' && cur.id === 'vote3') renderSub(); }; if (!vconf.error) voteSpec().then(again, again); }
  const pc = v => (v * 100).toFixed(1) + '%', C = spec && spec.columns.vote3, L = C && C.levels.cost;
  const opt = (l, about) => `<label style="display:flex;gap:8px;align-items:flex-start;margin:0 0 6px;cursor:pointer"><input type="radio" name="vote-gate" value="${l}" ${l === voteGate ? 'checked' : ''}> <span><b>${escH(voteLabel(l))}</b>${l === 'agree3' ? ' (default)' : ''}: ${escH(about)}</span></label>`;
  const fitted = !spec ? (vconf.error ? `the model could not be loaded (${vconf.error.message || vconf.error}): every request is asked` : 'loading the model…')
    : `the fitted vote: a confidence from SOP-BERT’s or VSS’s own numbers and who agrees with whom; it acts when the confidence is at least ${L.command.toFixed(4)} for commands and ${L.question.toFixed(4)} for questions, the thresholds that score best when ${costWords(10)}; on the calibration messages (out-of-fold scores) ${pc(C.calibration_oof.done_right)} of the requests done right, ${pc(C.calibration_oof.confidently_wrong)} of what it executed wrong; on the test part ${pc(C.test.done_right)} and ${pc(C.test.confidently_wrong)} (all three agree: 47.4% and 4.2%): it does less and is wrong less often. It was fitted on requests of the BERT cutter; with the VSS cutter (the default cut) it is used as is, and it then holds requests all three read the same, such as “arrange all in a circle”, which is why it is not the default`;
  return `<h3 class="sub">3 readers</h3>${readerFacts(RD.vote3)}
  <p class="intro">3 readers is not a new model: it is the Rules, VSS and SOP-BERT reading the same requests (the readings of their tabs, reused) and voting. Two readings agree when they would make the editor do the same thing (an arrange or distribute list in any order; “all” = no target = every shape). By default a request is executed only when <b>all three</b> read it the same: on the calibration messages such requests were right 96.7% of the time, on the test part 95.9%. When only two agree, a request is right 34–89% of the time (calibration and test part), depending on which two: too often wrong, so it asks, says who reads it differently, and offers <b>Do it anyway</b>. “2 of 3 agree” is not a level: executing it scored −23.6 (calibration) and −22.9 (test part) against +31.3 and +26.8 for “all three agree” (cost score; the refit of 2026-11-03, results/072_measure/refit/records/confidence3_report.md on branch gpu-runs).</p>
  <p class="intro"><button type="button" class="btn" data-help="three-readers">Three readers voting</button> <button type="button" class="btn" data-help="two-readers">Two readers together</button></p>
  <h3 class="sub">When 3 readers acts</h3>
  ${opt('agree3', 'it acts on a request only when the Rules, VSS and SOP-BERT read it the same (no fitted weight); the reading executed is SOP-BERT’s, which is the same')}${opt('fitted', fitted)}${opt('all', 'no gate: every request SOP-BERT or VSS found is executed (SOP-BERT’s reading, VSS’s when only VSS and the Rules agree)')}
  ${spec ? `<p class="note">Model <code>confidence/vote3.json</code>${vconf.url && /[?&]v=/.test(vconf.url) ? `, version <code>${escH(decodeURIComponent(vconf.url.split('v=').pop()))}</code>` : ''} (fitted on the calibration part of the fresh2 and short3 messages, training/sketch/confidence3/fit3.mjs, export3.mjs).</p>` : ''}`;
}
// spelling (docs/js/spell.js): a VSA spell checker corrects typed messages before the readers read them; every reader reads the same
// corrected text. Its vocabulary: docs/model/spell/vocab.json (the VSS worlds' words), the legend's values and cue words, and the names
// on the active reader's canvas. The switch is in ⋮ › Settings (Spelling); it is kept in this browser when storage works.
const SPELL_OFF = 'sop.spell.off';
let spellEnabled = store.get(SPELL_OFF) !== '1', speller = null;
const spellP = (window.SpellKit ? SpellKit.load(new URL('model/', document.baseURI).href, engine.legend) : Promise.resolve(null)).then(s => { speller = s; return s; });
const canvasNames = rd => rd.world.state.shapes.map(s => s.name).concat((rd.world.state.groups || []).map(g => g.name));
// cutting (owner's decision 2026-11-02): the three readers read the SAME requests. Each message is cut once, by the strategy chosen in
// ⋮ › Settings › Cutting (Rules segmenter, VSS cutter, BERT cutter; vss-composer.js CUT_STRATEGIES, cutUnits), and every reader reads those
// units; the tabs differ only in how each reads a request. The default is vss-composer.js DEFAULT_CUT (the best measured, training/sketch/
// cut_bench.mjs); the choice is kept in this browser when storage works. A strategy that is not available yet (VSS not loaded, no neural
// span head) is replaced by the Rules segmenter for that message, and the details say so. The cut reads the canvas of the reader it
// comes from (Rules, VSS or Neural), as that reader did when it cut for itself.
const CUT_KEY = 'sop.cut';
let cutPick = store.get(CUT_KEY), VF = null;
const vfP = import(new URL('js/vss-formalizer.js', document.baseURI).href).then(m => { VF = m; return m; }).catch(e => { console.error(e); return null; });
const CUT_OWNER = { rules: 'rules', vss: 'vss', bert: 'neural' };
const cutStrategies = () => VF ? VF.CUT_STRATEGIES : [{ id: 'rules', label: 'Rules segmenter' }, { id: 'vss', label: 'VSS cutter' }, { id: 'bert', label: 'BERT cutter' }];
const cutLabel = id => (cutStrategies().find(x => x.id === id) || { label: id }).label;
const cutWanted = () => cutPick || (VF ? VF.DEFAULT_CUT : 'vss');
const bertCut = () => nState === 'ready' && !!models && NeuralKit.canCut();
/** why a strategy cannot cut now (null: it can) */
function cutWhyNot(id) {
  if (id === 'rules') return null;
  if (id === 'vss') return vssState === 'ready' && VF ? null : vssState === 'failed' ? 'the VSS reader could not be loaded' : 'the VSS reader is still loading';
  if (id === 'bert') return bertCut() ? null : nState === 'ready' || nState === 'unpublished' ? 'the neural model with a span head (the BERT cutter) is not published yet' : 'the neural reader is not loaded';
  return 'unknown strategy';
}
/** cut one message once: -> {strategy, wanted, why (the wanted one could not cut), units [{c0, c1, src}], ms} */
async function cutMessage(text) {
  await vfP;
  const wanted = cutWanted(); let why = cutWhyNot(wanted), strategy = why ? 'rules' : wanted;
  const go = st => { const rd = RD[CUT_OWNER[st]]; return VF ? VF.cut(text, { names: canvasNames(rd), last: rd.last }, st, { rules: RD.rules, neural: NeuralKit }) : RD.rules.cut(text, { names: canvasNames(rd), last: rd.last }); };
  const t0 = performance.now(); let units;
  try { units = await go(strategy); } catch (e) { why = e.message; strategy = 'rules'; units = await go('rules'); }
  return { strategy, wanted, why, units, ms: performance.now() - t0 };
}

/* ---------------- canvas ---------------- */
/* ---------------- canvas ---------------- */
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function lum(hex) { const n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
function outlinePts(s) {
  const { w, h } = K.dims(s), hw = w / 2, hh = h / 2;
  if (s.shape === 'triangle') return [[0, -hh], [hw, hh], [-hw, hh]];
  if (s.shape === 'diamond') return [[0, -hh], [hw, 0], [0, hh], [-hw, 0]];
  if (s.shape === 'hexagon') return [0, 1, 2, 3, 4, 5].map(i => [Math.cos(i * Math.PI / 3) * hw, Math.sin(i * Math.PI / 3) * hh * 1.0]);
  if (s.shape === 'star') return [...Array(10)].map((_, i) => { const r = i % 2 ? 0.44 : 1, a = -Math.PI / 2 + i * Math.PI / 5; return [Math.cos(a) * hw * r, Math.sin(a) * hh * r + hh * 0.08]; });
  return null;
}
function rayDist(s, ux, uy) {
  const { w, h } = K.dims(s), hw = w / 2, hh = h / 2, c = Math.abs(ux) || 1e-6, sn = Math.abs(uy) || 1e-6;
  switch (s.shape) {
    case 'circle': return hw;
    case 'ellipse': return 1 / Math.sqrt((c / hw) ** 2 + (sn / hh) ** 2);
    case 'square': case 'rectangle': return Math.min(hw / c, hh / sn);
    case 'diamond': return 1 / (c / hw + sn / hh);
    case 'hexagon': return Math.min(hw / c, (hh * 0.87) / sn, 1 / Math.sqrt((c / hw) ** 2 + (sn / hh) ** 2) * 1.02);
    case 'triangle': return Math.min(hw, hh) * 0.72;
    default: return hw * 0.62;
  }
}
/* fill=light / faint / none (zones, backgrounds, venn circles): the opacity of the body's fill */
const FILL_OPACITY = { light: 0.3, faint: 0.13, none: 0 };
function drawShape(g, s) {
  const grp = el('g', { class: 'shp' + (hl.shapes.has(s.name) ? ' hl' : '') + (s.layer ? ' ' + s.layer : '') + (s.shape === 'text' ? ' txt' : ''), 'data-name': s.name, transform: `translate(${s.x} ${s.y})` }, g);
  const { w, h } = K.dims(s), fill = K.COLOR_HEX[s.color] || '#ffffff';
  if (s.shape === 'text') {   /* a free text: no body, no name tag; its colour is the text's */
    if (hl.shapes.has(s.name)) el('rect', { class: 'halo', x: -w / 2 - 5, y: -h / 2 - 4, width: w + 10, height: h + 8, rx: 8 }, grp);
    const t = el('text', { class: 'ftext', x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': K.fontOf(s), fill: K.COLOR_HEX[s.color] || '#24282E' }, grp); t.textContent = s.label || '';
    return;
  }
  const attrs = { class: 'body' + (s.outline ? ' outlined' : ''), fill };
  if (s.outline) attrs.style = `stroke: ${K.COLOR_HEX[s.outline]}`;
  if (FILL_OPACITY[s.fill] != null) attrs['fill-opacity'] = FILL_OPACITY[s.fill];
  const pts = outlinePts(s);
  if (s.shape === 'circle') el('circle', Object.assign({ r: w / 2 }, attrs), grp);
  else if (s.shape === 'ellipse') el('ellipse', Object.assign({ rx: w / 2, ry: h / 2 }, attrs), grp);
  else if (pts) el('polygon', Object.assign({ points: pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' '), 'stroke-linejoin': 'round' }, attrs), grp);
  else el('rect', Object.assign({ x: -w / 2, y: -h / 2, width: w, height: h, rx: 6 }, attrs), grp);
  if (hl.shapes.has(s.name)) el('rect', { class: 'halo', x: -w / 2 - 7, y: -h / 2 - 7, width: w + 14, height: h + 14, rx: 10 }, grp);
  /* the name above the shape; a template's own shapes do not show it (their texts say what they are; the details list the names), nor does
     a panel (a background or a zone: its group's frame, its caption and the details name it, and its name shows on hover), so that no
     shape laid out on a zone sits under the zone's name */
  if (s.layer === 'background' || s.layer === 'zone') el('title', {}, grp).textContent = s.name;
  else if (!s.quiet) { const tag = el('text', { class: 'tag', x: 0, y: -h / 2 - (hl.shapes.has(s.name) ? 12 : 7), 'text-anchor': 'middle' }, grp); tag.textContent = s.name; }
  if (s.label) {
    const room = s.shape === 'rectangle' || s.shape === 'square' || s.shape === 'ellipse' || s.shape === 'circle' ? w * 0.84 : w * 0.56;
    let fs = s.w ? Math.max(10, Math.min(15, s.h / 2.8)) : Math.max(9, Math.min(14, s.size / 4.4)), txt = s.label;   // a box of its own size: the font follows its height
    while (txt.length * fs * 0.56 > room && fs > 9) fs -= 0.5;
    const maxc = Math.max(3, Math.floor(room / (fs * 0.56))); if (txt.length > maxc) txt = txt.slice(0, maxc - 1) + '…';
    const t = el('text', { class: 'lbl', x: 0, y: s.shape === 'triangle' ? h * 0.18 : 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': fs.toFixed(1), fill: lum(fill) > 0.62 ? '#17202B' : '#FFFFFF' }, grp);
    t.textContent = txt;
  }
}
function drawEdge(g, e, a, b, offset, taken) {
  let dx = b.x - a.x, dy = b.y - a.y; const L = Math.hypot(dx, dy) || 1; const ux = dx / L, uy = dy / L;
  const ox = -uy * offset, oy = ux * offset;
  const ra = rayDist(a, ux, uy) + 3, rb = rayDist(b, -ux, -uy) + 3;
  if (ra + rb >= L - 4) return;
  const x1 = a.x + ux * ra + ox, y1 = a.y + uy * ra + oy, x2 = b.x - ux * rb + ox, y2 = b.y - uy * rb + oy;
  const grp = el('g', { class: 'edge' + (hl.edges.has(e.id) ? ' hl' : '') }, g);
  const col = e.color ? K.COLOR_HEX[e.color] : null;
  const head = (tx, ty, vx, vy) => { const bx = tx - vx * 11, by = ty - vy * 11; el('polygon', { class: 'hd', points: `${tx},${ty} ${bx - vy * 5},${by + vx * 5} ${bx + vy * 5},${by - vx * 5}`, style: col ? `fill:${col}` : '' }, grp); };
  const sx = e.arrow === 'both' ? x1 + ux * 9 : x1, sy = e.arrow === 'both' ? y1 + uy * 9 : y1;
  const ex = e.arrow === 'none' ? x2 : x2 - ux * 9, ey = e.arrow === 'none' ? y2 : y2 - uy * 9;
  const ln = el('line', { class: 'ln', x1: sx, y1: sy, x2: ex, y2: ey, style: col ? `stroke:${col}` : '' }, grp);
  if (e.style === 'dashed') ln.setAttribute('stroke-dasharray', '8 6');
  if (e.style === 'dotted') { ln.setAttribute('stroke-dasharray', '0.5 6'); ln.setAttribute('stroke-linecap', 'round'); ln.setAttribute('stroke-width', '2.6'); }
  if (e.width) ln.setAttribute('stroke-width', String(e.style === 'dotted' ? Math.max(2.6, e.width + 0.6) : e.width));   /* an arrow restyled thicker / thinner (size -> px, logic.js EDGE_PX) */
  if (e.arrow !== 'none') head(x2, y2, ux, uy);
  if (e.arrow === 'both') head(x1, y1, -ux, -uy);
  if (e.label) {
    /* beside the arrow, at its middle; when a shape, a name tag or a text is there, the first free spot further along it or on its other side */
    const lw = String(e.label).length * 6.8 + 4, free = (cx, cy) => !(taken || []).some(o => Math.min(o.x2, cx + lw / 2) - Math.max(o.x1, cx - lw / 2) > 0.5 && Math.min(o.y2, cy + 8) - Math.max(o.y1, cy - 8) > 0.5);
    const spots = []; for (const f of [0.5, 0.38, 0.62, 0.26, 0.74]) for (const side of [1, -1]) { const off = side * (12 + Math.abs(uy) * lw / 2); spots.push([x1 + (x2 - x1) * f - uy * off, y1 + (y2 - y1) * f + ux * off]); }
    const [lx, ly] = spots.find(([cx, cy]) => free(cx, cy)) || spots[0];
    const t = el('text', { class: 'elbl', x: lx, y: ly, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, grp); t.textContent = e.label;
  }
}

/* a group: a light dashed frame around its members with its name, drawn behind them and recomputed from the members on every render */
function drawGroups(g, S) {
  const spots = new Map(K.groupLabels(S).map(q => [q.name, q]));   /* the name where nothing else is drawn (logic.js groupLabels) */
  for (const gr of S.groups || []) {
    const b = K.groupBox(S, gr); if (!b) continue;
    const pad = 12, x = b.x1 - pad, y = b.y1 - pad - 14, w = b.w + 2 * pad, h = b.h + 2 * pad + 14, at = spots.get(gr.name) || { x: x + 10, y: y - 6 };
    const grp = el('g', { class: 'grp', 'data-group': gr.name }, g);
    el('rect', { x, y, width: w, height: h, rx: 12, style: 'fill: var(--accent); fill-opacity: .045; stroke: var(--faint); stroke-width: 1.25; stroke-dasharray: 6 5; pointer-events: none' }, grp);
    const t = el('text', { x: at.x, y: at.y, style: 'font-family: var(--font); font-size: 12px; font-weight: 600; fill: var(--faint); pointer-events: none' }, grp);
    t.textContent = gr.name;
  }
}
function cellsInUse() {
  const S = world.state, cells = new Map(), add = c => cells.set(c.x + ',' + c.y, c);
  S.shapes.forEach(s => add(K.cellOf(s.x, s.y)));
  add(S.frame || { x: 0, y: 0 });
  return [...cells.values()];
}
function renderCanvas() {
  layer.textContent = ''; framesG.textContent = '';
  const S = world.state, by = new Map(S.shapes.map(s => [s.name, s])), cells = cellsInUse();
  const narrow = svg.clientWidth > 0 && svg.clientWidth < 640;
  const focus = view === 'focus' || (view === 'auto' && narrow);
  if (focus) {
    const fc = cur.focusCell || S.frame || { x: 0, y: 0 };
    const inside = S.shapes.filter(s => { const c = K.cellOf(s.x, s.y); return c.x === fc.x && c.y === fc.y; });
    let bx1 = fc.x, by1 = fc.y, bx2 = fc.x + 800, by2 = fc.y + 500;
    if (inside.length) {
      bx1 = Math.min(...inside.map(s => s.x - K.dims(s).w / 2)) - 40; bx2 = Math.max(...inside.map(s => s.x + K.dims(s).w / 2)) + 40;
      by1 = Math.min(...inside.map(s => s.y - K.dims(s).h / 2)) - 44; by2 = Math.max(...inside.map(s => s.y + K.dims(s).h / 2)) + 30;
      const minW = 380, minH = 240;
      if (bx2 - bx1 < minW) { const m = (bx1 + bx2) / 2; bx1 = m - minW / 2; bx2 = m + minW / 2; }
      if (by2 - by1 < minH) { const m = (by1 + by2) / 2; by1 = m - minH / 2; by2 = m + minH / 2; }
    }
    svg.setAttribute('viewBox', `${bx1} ${by1} ${bx2 - bx1} ${by2 - by1}`);
  } else {
    const x1 = Math.min(...cells.map(c => c.x)), y1 = Math.min(...cells.map(c => c.y));
    const x2 = Math.max(...cells.map(c => c.x + 800)), y2 = Math.max(...cells.map(c => c.y + 500));
    svg.setAttribute('viewBox', `${x1 - 14} ${y1 - (cells.length > 1 ? 30 : 8)} ${x2 - x1 + 28} ${y2 - y1 + (cells.length > 1 ? 44 : 16)}`);
  }
  const vb = $('#view-btn'); if (vb) { vb.setAttribute('aria-pressed', String(!focus)); vb.title = focus ? 'Show the whole canvas' : 'Zoom to the current drawing'; vb.setAttribute('aria-label', vb.title); }
  if (cells.length > 1) for (const c of cells) {
    el('rect', { class: 'frame', x: c.x, y: c.y, width: 800, height: 500, rx: 14 }, framesG);
    const f = (S.frames || []).find(f => f.x === c.x && f.y === c.y);
    if (f && f.title) { const t = el('text', { class: 'ftitle', x: c.x + 14, y: c.y - 9 }, framesG); t.textContent = f.title; }
  }
  if (!S.shapes.length) { const f = S.frame || { x: 0, y: 0 }, t = el('text', { class: 'empty-note', x: f.x + 400, y: f.y + 250, 'text-anchor': 'middle' }, layer); t.textContent = 'Nothing here yet. Write what to draw.'; }
  const gg = el('g', {}, layer), eg = el('g', {}, layer), sg = el('g', {}, layer);
  drawGroups(gg, S);
  const taken = [];   /* what an arrow's label must not cover: the shapes' bodies, their name tags and the free texts */
  for (const s of S.shapes) { if (s.layer) continue; const d = K.dims(s); taken.push({ x1: s.x - d.w / 2, x2: s.x + d.w / 2, y1: s.y - d.h / 2, y2: s.y + d.h / 2 }); if (s.shape !== 'text' && !s.quiet) taken.push(K.tagBox(s)); }
  for (const e of S.edges) {
    const a = by.get(e.from), b = by.get(e.to); if (!a || !b) continue;
    drawEdge(eg, e, a, b, S.edges.some(o => o !== e && o.from === e.to && o.to === e.from) ? 6 : 0, taken);
  }
  for (const s of S.shapes) drawShape(sg, s);
  const n = S.shapes.length, m = S.edges.length;
  $('#readout').textContent = `${n} shape${n === 1 ? '' : 's'} · ${m} link${m === 1 ? '' : 's'}`;
}
function flash(h) {
  hl = { shapes: new Set((h && h.shapes) || []), edges: new Set((h && h.edges) || []) };
  renderCanvas(); clearTimeout(hlTimer);
  if (hl.shapes.size || hl.edges.size) hlTimer = setTimeout(() => { hl = { shapes: new Set(), edges: new Set() }; renderCanvas(); }, 4200);
}

/* drag shapes by hand */
function svgPt(ev) { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
svg.addEventListener('pointerdown', ev => {
  const g = ev.target.closest && ev.target.closest('.shp'); if (!g) return;
  const s = world.find(g.dataset.name); if (!s || s.layer === 'background') return;   // the background stays put
  const p = svgPt(ev); drag = { name: s.name, before: world.snapshot(), dx: s.x - p.x, dy: s.y - p.y, cell: K.cellOf(s.x, s.y), moved: false };
  svg.setPointerCapture(ev.pointerId); ev.preventDefault();
});
svg.addEventListener('pointermove', ev => {
  if (!drag) return; const s = world.find(drag.name); if (!s) return;
  const p = svgPt(ev), { w, h } = K.dims(s), c = drag.cell;
  const x = Math.round(Math.min(c.x + 800 - w / 2 - 10, Math.max(c.x + w / 2 + 10, p.x + drag.dx))), y = Math.round(Math.min(c.y + 500 - h / 2 - 10, Math.max(c.y + h / 2 + 24, p.y + drag.dy)));
  if (x !== s.x || y !== s.y) { s.x = x; s.y = y; drag.moved = true; renderCanvas(); }
});
const endDrag = () => {
  if (!drag) return; const d = drag; drag = null;
  if (d.moved) { world.commit(d.before); cur.last = [d.name]; updateTabs(); }
};
svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);

/* ---------------- chat ---------------- */
const scrollDown = () => { msgs.scrollTop = msgs.scrollHeight; };
function meBubble(text, sp) {
  const d = document.createElement('div'); d.className = 'b me';
  const fix = sp && sp.fixes.length ? `<div class="fix" title="${escH('Every reader read: ' + sp.text)}">spelling: ${sp.fixes.map(f => `<s>${escH(f.from)}</s> → ${escH(f.to)}`).join(', ')}</div>` : '';
  d.innerHTML = `<div class="txt">${escH(text)}</div>${fix}<div class="meta"><time>${clock()}</time></div>`;
  msgs.appendChild(d); scrollDown();
}
function botBubble(o) {
  const d = document.createElement('div'); d.className = 'b bot' + (o.err ? ' err' : '');
  let h = o.lines ? o.lines.map(p => `<div class="rl${p.err ? ' err' : ''}${p.off ? ' off' : ''}"><b>${escH(p.rd.label)}${p.ms != null ? ` · ${fmtMs(p.ms)}` : ''}:</b> <span class="t">${escH(p.off || p.text)}</span>${p.held && p.held.length ? heldHTML(p.held) : ''}${p.sub ? `<div class="sub">${escH(p.sub)}</div>` : ''}</div>`).join('')
    : `<div class="txt">${escH(o.text)}</div>`;
  if (o.sub) h += `<div class="sub">${escH(o.sub)}</div>`;
  if (o.chips && o.chips.length) h += `<div class="chips">${o.chips.map(c => `<button type="button" data-pick="${escH(c)}">${escH(c)}</button>`).join('')}</div>`;
  h += `<div class="meta">${o.tag ? `<span class="tag2">${escH(o.tag)}</span>` : ''}${o.turn ? `<button type="button" data-turn="${o.turn}">details</button>` : ''}<time>${clock()}</time></div>`;
  d.innerHTML = h;
  if (o.replace) o.replace.replaceWith(d); else msgs.appendChild(d);
  scrollDown(); return d;
}
function sysNote(text) { const d = document.createElement('div'); d.className = 'sys'; d.textContent = text; msgs.appendChild(d); scrollDown(); }
function typing() { const d = document.createElement('div'); d.className = 'b bot'; d.innerHTML = '<div class="typing" aria-label="Thinking"><i></i><i></i><i></i></div>'; msgs.appendChild(d); scrollDown(); return d; }
function setStatus(t) { $('#status').textContent = t; }
const fmtMs = ms => ms < 10 ? ms.toFixed(1) + ' ms' : Math.round(ms) + ' ms';
const isReady = rd => rd.id === 'rules' || (rd.id === 'vss' ? vssState === 'ready' : rd.id === 'neural' ? !!models && nState === 'ready' : isReady(RD.vss) && isReady(RD.neural));
/** what a reader that is not loaded says instead of an answer */
function offText(rd) {
  if (rd.id === 'combined') { const wait = [RD.vss, RD.neural].filter(x => !isReady(x)); return `waits for ${listing(wait.map(x => x.label))} (it combines the readings of VSS and SOP-BERT)`; }
  if (rd.id === 'vote3') { const wait = [RD.vss, RD.neural].filter(x => !isReady(x)); return `waits for ${listing(wait.map(x => x.label))} (it votes on the readings of Rules, VSS and SOP-BERT)`; }
  if (rd.id === 'vss') return vssState === 'failed' ? 'not available (it could not be loaded)' : 'still loading, did not read this';
  return { unpublished: 'not available (the neural model is not published yet)', failed: 'not available (loading failed; see SOP-BERT › Settings)' }[nState] || 'still loading, did not read this';
}
const idleStatus = () => 'reads with ' + listing(READERS.filter(isReady).map(r => r.label));
msgs.addEventListener('click', ev => {
  const p = ev.target.closest('[data-pick]'); if (p) { submit(p.dataset.pick); return; }
  const a = ev.target.closest('[data-anyway]');
  if (a) { const [rid, turn, idx] = a.dataset.anyway.split(':'); a.disabled = true; queue = queue.then(() => doAnyway(rid, +turn, +idx)).catch(e => { console.error(e); botBubble({ text: 'Something went wrong: ' + e.message, err: true }); }); return; }
  const t = ev.target.closest('[data-turn]'); if (t) openSheet('turn', null, +t.dataset.turn);
});

/* Turn effects into one or two plain sentences. */
const listing = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const few = (a, n) => a.length > n ? listing(a.slice(0, n).concat(`${a.length - n} more`)) : listing(a);
function summarize(result) {
  const adds = [], links = [], unlinks = [], dels = [], moved = [], changed = [], renames = [], rules = [], said = [], answers = [];
  for (const st of result.steps) {
    if (st.node.type === 'mention' || st.error || st.skipped) continue;
    if (st.node.args && st.node.args.template && st.answer) { answers.push(st.answer); continue; }   // a template: its answer says what it drew
    for (const p of st.patches) {
      if (p.op === 'add') adds.push(`${p.shape.name}`);
      else if (p.op === 'link') links.push(K.edgeText(p.edge).replace(/ \(.*$|\s+".*"$/, ''));
      else if (p.op === 'unlink') unlinks.push(p.edge ? `${p.edge.from}–${p.edge.to}` : p.id);
      else if (p.op === 'remove') dels.push(p.name);
      else if (p.op === 'rename') renames.push(`${p.from} to ${p.to}`);
      else if (p.op === 'rule') rules.push(p.rule);
      else if (p.op === 'forget') said.push('Forgot all default rules.');
      else if (p.op === 'reorder') said.push(p.to === 'front' ? `Brought ${p.name} to the front.` : `Sent ${p.name} to the back.`);
      else if (p.op === 'edgeSet') { if (!st.answer && p.edge) said.push(`The arrow ${p.edge.from}–${p.edge.to} ${p.edge.label ? `now says “${p.edge.label}”` : 'has no label now'}.`); }
      else if (p.op === 'set') {
        if ('x' in p.props && !moved.includes(p.name)) moved.push(p.name);
        const ch = Object.entries(p.props).filter(([k]) => k !== 'x' && k !== 'y').map(([k, v]) => k === 'size' ? K.sizeName(v) : k === 'label' ? `labeled “${v}”` : k === 'outline' ? (v ? `${v} outline` : 'no outline') : k === 'shape' ? `a ${v}` : String(v));
        if (ch.length) changed.push(`${p.name} is now ${listing(ch)}`);
      }
    }
    if (st.answer) answers.push(st.answer);
    for (const n of st.notes || []) if (/^(reverted|re-applied|there was nothing)|already/.test(n)) said.push(n.charAt(0).toUpperCase() + n.slice(1) + '.');
  }
  const out = [];
  if (adds.length) out.push(`Drew ${few(adds, 6)}.`);
  if (links.length) out.push(`Connected ${few(links, 4)}.`);
  if (renames.length) out.push(`Renamed ${listing(renames)}.`);
  if (changed.length) out.push(changed.slice(0, 4).join('; ') + (changed.length > 4 ? `; and ${changed.length - 4} more.` : '.'));
  if (moved.length) out.push(`Moved ${few(moved, 5)}.`);
  if (unlinks.length) out.push(`Removed the link${unlinks.length > 1 ? 's' : ''} ${few(unlinks, 4)}.`);
  if (dels.length) out.push(`Deleted ${few(dels, 6)}.`);
  for (const r of rules) out.push(`From now on, new ${r.shape ? r.shape + 's' : 'shapes'} will be ${['size', 'color'].filter(k => r[k]).map(k => r[k]).join(' ')}${r.outline ? ' with a ' + r.outline + ' outline' : ''}.`);
  out.push(...said.map(s => s.replace(/^Reverted 1 turn\.$/, 'Undid the last change.').replace(/^Re-applied 1 turn\.$/, 'Redid it.')));
  out.push(...answers);
  return out.join(' ') || 'Done.';
}

/* ---------------- running a turn ---------------- */
function submit(text, sop) { if (typeof sop !== 'string') sop = undefined; queue = queue.then(() => run(text, sop)).catch(e => { console.error(e); botBubble({ text: 'Something went wrong: ' + e.message, err: true }); }); return queue; }
async function run(text, sop) {
  text = String(text).trim(); if (!text) return;
  // the spell checker runs before every reader (not on SOP and toolbar buttons): they all read the corrected text
  const typed = text, raw = !!sop || text.startsWith('@');
  let sp = null;
  if (!raw && spellEnabled) { const sc = await spellP; if (sc) { sp = sc.check(text, { names: canvasNames(cur) }); text = sp.text; } }
  meBubble(typed, sp);
  const id = ++turnSeq, rec = { id, time: clock(), text, typed, spell: sp, spellOff: !raw && !spellEnabled, raw, sop: sop || text, button: !!sop, readers: {}, off: {}, ran: [] }; history.push(rec);
  if (rec.raw) { try { K.parse(rec.sop); } catch (e) { rec.error = e; botBubble({ text: e.message, err: true, turn: id, tag: 'SOP Lang' }); return; } }
  // the readers that read this message are fixed now: one that finishes loading meanwhile starts from the Rules drawing instead
  const live = READERS.filter(isReady);
  // a reply to a question ("which Hub?") goes to the readers that asked it; the others have nothing to choose
  const want = text.toLowerCase().replace(/^(?:i\s+mean|use|the\s+one\s+(?:named|called))\s+/, '').replace(/[.!]+$/, '').trim();
  const picks = new Map(live.map(rd => [rd, rd.pending && rd.pending.candidates.find(c => c.toLowerCase() === want)]));
  const anyPick = [...picks.values()].some(Boolean);
  const wait = live.length > 1 ? typing() : null; if (wait) setStatus('typing…');
  if (!rec.raw && !anyPick && live.length) rec.cut = await cutMessage(text);   // one cut, read by every reader
  // first every reader reads (formalizes) the message, then each one's gate and engine run: the gates of VSS and SOP-BERT use the
  // readings of the other two readers (see GATES), and "3 readers" votes on the three readings
  const plan = [];
  for (const rd of READERS) {
    if (!live.includes(rd)) { rec.off[rd.id] = offText(rd); plan.push({ rd, line: { off: rec.off[rd.id] } }); continue; }
    const pend = rd.pending; rd.pending = null;
    if (anyPick && !picks.get(rd)) { plan.push({ rd, ran: true, line: { text: 'No question was open here; nothing to choose.' } }); continue; }
    const pk = picks.get(rd) ? { pend, pick: picks.get(rd) } : null;
    plan.push({ rd, ran: true, pk, line: await readPart(rd, text, rec, pk) });
  }
  const parts = [];
  for (const x of plan) {
    const p = x.line || await doPart(x.rd, text, rec, x.pk);
    if (x.ran) rec.ran.push(x.rd.id);
    parts.push(Object.assign(p, { rd: x.rd }));
  }
  setStatus(idleStatus());
  botBubble({ lines: parts, chips: [...new Set(parts.flatMap(p => p.chips || []))], turn: id, tag: rec.button ? 'button' : rec.raw ? 'SOP Lang' : null, replace: wait });
  const mine = parts.find(p => p.rd === cur);
  if (mine && mine.highlight) flash(mine.highlight); else renderCanvas();
  updateTabs(); renderSopBar();
}
/** a question of the engine ("which Hub?") -> the reader's pending choice: the wire asked about, its dependents, the wires they refer to
 *  (with the values they had), so a reply with a name runs them again */
function pendingOf(er, nodes, result, overrides) {
  const e = er.error, keep = new Set([e.wire, ...er.dependents.map(n => n.id)]);
  const need = new Set(); const refsOf = v => K.isRef(v) ? [v.ref] : Array.isArray(v) ? v.flatMap(refsOf) : [];
  for (const n of nodes) if (keep.has(n.id)) Object.values(n.args).flatMap(refsOf).forEach(x => need.add(x));
  const ov = Object.assign({}, overrides); for (const st of result.steps) if (need.has(st.node.id) && !keep.has(st.node.id) && st.value !== undefined) ov[st.node.id] = st.value;
  return { nodes: nodes.filter(n => keep.has(n.id) || need.has(n.id)), wire: e.wire, candidates: e.candidates, overrides: ov };
}
/** "Do it anyway" (see GATES): the reading of one request the reader was not sure of, run now in that reader's world as one turn (undoable
 *  like any message). The wires of the message it refers to that ran earlier keep their values; a request that uses what another request
 *  that was not done would have made is not run (the reply says which to do first). */
async function doAnyway(rid, turn, idx) {
  const rec = history.find(x => x.id === turn), rd = RD[rid], r = rec && rec.readers[rid], h = r && r.gate && r.gate.units.find(u => u.index === idx);
  const mark = () => document.querySelectorAll(`[data-anyway="${rid}:${turn}:${idx}"]`).forEach(b => { b.disabled = true; b.textContent = 'Done anyway'; });
  if (!h || h.doneAnyway) { mark(); return; }
  const env = r.env || (r.env = Object.assign({}, r.result ? r.result.env : {}));
  const own = new Set(h.nodes.map(n => n.id)), refsOf = v => K.isRef(v) ? [v.ref] : Array.isArray(v) ? v.flatMap(refsOf) : [];
  const need = [...new Set(h.nodes.flatMap(n => Object.values(n.args).flatMap(refsOf)).filter(x => !own.has(x)))];
  const missing = need.filter(x => !(x in env));
  if (missing.length) {
    const deps = r.gate.units.filter(u => u.nodes.some(n => missing.includes(n.id)));
    botBubble({ lines: [{ rd, text: `“${h.src}” uses what ${listing(deps.map(d => `“${d.src}”`))} would make; do ${deps.length > 1 ? 'those' : 'that'} first.`, err: true }], turn });
    return;
  }
  const overrides = Object.fromEntries(need.map(x => [x, env[x]]));
  const list = (r.allNodes || []).filter(n => need.includes(n.id)).concat(h.nodes);
  const result = rd.engine.run(list, { overrides });
  Object.assign(env, result.env); h.doneAnyway = true; (r.anyway || (r.anyway = [])).push({ index: idx, src: h.src, nodes: list, result });
  mark();
  const clarE = (result.errors || []).find(er => er.error instanceof K.Clarify);
  if (clarE) rd.pending = pendingOf(clarE, list, result, overrides);
  const problems = (result.errors || []).filter(er => !(er.error instanceof K.Clarify)).map(er => er.error.message);
  const done = result.steps.some(st => !st.error && !st.skipped && st.node.type !== 'mention' && !(st.node.id in overrides));
  const touched = [];
  result.steps.forEach(st => st.patches.forEach(p => { if (p.op === 'add') touched.push(p.shape.name); else if (p.op === 'set') touched.push(p.name); else if (p.op === 'rename') touched.push(p.to); }));
  const alive = [...new Set(touched)].filter(n => rd.world.find(n)); if (alive.length) rd.last = alive;
  const text = `Did “${h.src}” anyway: ` + [done ? summarize(result) : '', clarE ? clarE.error.message.replace(/ Reply with a name\.$/, '') : '', problems.join(' ')].filter(Boolean).join(' ');
  botBubble({ lines: [{ rd, text: text.replace(/: $/, ': nothing changed.'), err: !done && !clarE }], chips: clarE ? clarE.error.candidates : [], turn, tag: 'Do it anyway' });
  if (rd === cur) { if (alive.length) flash({ shapes: alive, edges: [] }); else renderCanvas(); }
  updateTabs(); renderSopBar();
}
/** the requests a reader did not do because it was not sure (see GATES): the reason of each and its "Do it anyway" button */
function heldHTML(held) {
  return `<ul class="held">${held.map(h => `<li><span class="src">“${escH(h.src || '')}”</span> <span class="why">${Number.isFinite(h.conf) ? `confidence ${h.conf.toFixed(2)}, it acts from ${h.t.toFixed(2)}: ` : ''}${escH(h.reasons.join('; ') || 'not sure')}.</span> <button type="button" class="anyway" data-anyway="${escH(h.reader)}:${h.turn}:${h.index}" title="Run exactly this reading now (undo takes it back)">Do it anyway</button></li>`).join('')}</ul>`;
}
/** one reader reads (formalizes) one message, nothing is executed yet: fills rec.readers[rd.id]; returns null, or the reply's line when it failed */
async function readPart(rd, text, rec, pk) {
  const r = { nodes: [], notes: [], overrides: {} }; rec.readers[rd.id] = r;
  const ctx = { names: rd.world.state.shapes.map(s => s.name).concat((rd.world.state.groups || []).map(g => g.name)), last: rd.last };   // group names are names too (VSS reads a name only if it is listed)
  r.names = ctx.names;
  // the time is the formalizing only (text -> SOP wires), not the engine or the drawing; VSS and Neural are loaded before they read
  const t0 = performance.now();
  try {
    if (pk) { r.nodes = pk.pend.nodes; r.overrides = Object.assign({}, pk.pend.overrides, { [pk.pend.wire]: [pk.pick] }); }
    else if (rec.raw) r.nodes = K.parse(rec.sop);   // SOP: nothing to formalize, no time
    else if (rd.id === 'rules') { const f = rec.cut && rec.cut.strategy !== 'rules' ? rd.formalize(text, ctx, { units: rec.cut.units }) : rd.formalize(text, ctx); r.ms = performance.now() - t0; r.rulesRes = f; r.nodes = f.nodes; r.notes = f.notes; }
    else if (rd.id === 'vss') { const v = await window.VSSFormalizer.formalize(text, ctx, rd.formalize, Object.assign({}, VSS_OPTS, rec.cut ? { units: rec.cut.units } : {})); r.ms = performance.now() - t0; r.vss = v; r.nodes = v.nodes; r.notes = v.notes; }
    else if (rd.id === 'combined') { const c = await combinedRead(rd, text, rec, ctx); r.ms = c.ms; r.combined = c; r.nodes = c.nodes; r.notes = c.notes; }
    else if (rd.id === 'vote3') { const x = await voteRead(rd, text, rec, ctx); r.ms = x.ms; r.vote = x; r.nodes = x.nodes; r.notes = x.notes; }
    else { const n = await neural.formalize(text, ctx, rec.cut ? { units: rec.cut.units, signals: true } : { signals: true }); r.ms = performance.now() - t0; r.neural = n; r.nodes = n.nodes; r.notes = n.notes.filter(x => !/couldn't find an action/.test(x)); }
    if (rec.cut && !pk && !rec.raw) r.cutBy = r.combined ? r.combined.cut : rec.cut.strategy;
  } catch (e) { r.error = e; r.ms = performance.now() - t0; return { text: `The ${rd.label} reader failed: ${e.message}`, err: true, ms: r.ms }; }
  return null;
}
/** the reader's gate and engine on what it read (readPart); returns its line of the reply ({text, sub, err, chips, ms, highlight, held}) */
async function doPart(rd, text, rec, pk) {
  const r = rec.readers[rd.id], overrides = r.overrides;
  try {
    // the gate (see GATES): the requests this reader is not sure of are not executed; the reply lists them with "Do it anyway"
    const gf = !pk && !rec.raw ? GATES[rd.id] : null, gsrc = rd.id === 'vss' ? r.vss : rd.id === 'combined' ? r.combined : rd.id === 'vote3' ? r.vote : r.neural;
    if (gf && gsrc) { const g = await gf(gsrc, rec, r); if (g) { r.gate = g; r.allNodes = r.nodes; r.nodes = g.executed; } }
  } catch (e) { r.error = e; return { text: `The ${rd.label} reader failed: ${e.message}`, err: true, ms: r.ms }; }
  const ms = r.ms, nodes = r.nodes, notes = r.notes, world = rd.world, engine = rd.engine;
  rd.reads++; rd.lastRead = { turn: rec.id, nodes };
  // the parts no reading took: the Rules reader's "couldn't find an action in …" and the VSS reader's "Ignored (not understood): “…”, “…”"
  const unread = notes.filter(n => /couldn't find an action/.test(n)).map(n => (n.match(/in "(.*)"\.?$/) || [])[1]).filter(Boolean)
    .concat(notes.filter(n => /^Ignored \(not understood\):/.test(n)).flatMap(n => [...n.matchAll(/“([^”]*)”/g)].map(m => m[1])).filter(u => u.trim().split(/\s+/).length > 1));   // a one-word unit ("and") stays in the details only
  const held = r.gate ? r.gate.held.map(h => ({ reader: rd.id, turn: rec.id, index: h.index, src: h.src, conf: h.conf, t: Number.isFinite(h.t) ? h.t : r.gate.threshold, reasons: h.reasons.map(x => x.text) })) : [];
  const nReq = r.gate ? r.gate.units.length : 0;
  // the reply's line with the requests not executed (their reasons and buttons are rendered under the line, botBubble)
  const withHeld = o => held.length ? Object.assign(o, { held, text: (o.text && o.text !== 'Done.' ? o.text + ' ' : '') + `Not sure about ${held.length === nReq ? (nReq === 1 ? 'the request' : `any of the ${nReq} requests`) : `${held.length} of the ${nReq} requests`}, so ${held.length === 1 ? 'it was' : 'they were'} not done:` }) : o;
  if (!nodes.length && held.length) {
    const sub = unread.length ? unread.map(u => `I didn’t understand “${u}”.`).join(' ') : null;
    return withHeld({ text: '', sub, ms });
  }
  if (!nodes.length) {
    r.error = new K.SOPError('No wires.');
    return { text: unread.length ? 'I didn’t get what to do there. Try something like “draw a red circle next to Start” or “what is connected to Start?”.' : 'I couldn’t turn that into anything I can do.', err: true, ms };
  }
  const result = engine.run(nodes, { overrides }); r.result = result;
  // do what was understood; ask about the rest (a question never blocks the other wires of the message)
  const asks = [], problems = [];
  let clar = null;
  for (const er of result.errors || []) {
    const e = er.error;
    if (e instanceof K.Clarify && !clar) { clar = e; rd.pending = pendingOf(er, nodes, result, overrides); } else if (!(e instanceof K.Clarify)) problems.push(e.message + (er.dependents.length ? ` (so I also skipped ${er.dependents.length} step${er.dependents.length > 1 ? 's' : ''} that needed it)` : ''));
  }
  for (const u of unread) asks.push(`I didn’t understand “${u}”. Could you say it another way?`);
  const anyDone = result.steps.some(st => !st.error && !st.skipped && st.node.type !== 'mention');
  if (!anyDone && !clar && !problems.length && !asks.length) return withHeld({ text: 'Done.', ms });
  const highlight = { shapes: [], edges: [] }, touched = [];
  result.steps.forEach(s => {
    s.patches.forEach(p => { if (p.op === 'add') touched.push(p.shape.name); else if (p.op === 'set') touched.push(p.name); else if (p.op === 'rename') touched.push(p.to); });
    if (s.highlight) { highlight.shapes.push(...(s.highlight.shapes || [])); highlight.edges.push(...(s.highlight.edges || [])); }
  });
  const alive = [...new Set(touched)].filter(n => world.find(n));
  if (alive.length) rd.last = alive; else if (highlight.shapes.length) rd.last = [...new Set(highlight.shapes)].filter(n => world.find(n));
  if (!highlight.shapes.length) highlight.shapes = alive;
  { const f = world.find(highlight.shapes[0] || alive[0]); if (f) rd.focusCell = K.cellOf(f.x, f.y); }
  const odd = notes.filter(n => /is not a shape I know|couldn't tell|^I read /.test(n));
  const did = anyDone ? summarize(result) : '';
  const tail = problems.concat(asks).join(' ');
  const examples = [...new Set(result.steps.flatMap(st => st.examples || []))];   // a help answer's example sentences: buttons that send them
  if (clar) return withHeld({ text: (did && did !== 'Done.' ? did + ' ' : '') + clar.message.replace(/ Reply with a name\.$/, ''), sub: [tail, odd.join(' ')].filter(Boolean).join(' ') || null, chips: clar.candidates, ms, highlight });
  if (problems.length && !anyDone) return withHeld({ text: problems.join(' '), sub: [asks.join(' '), odd.join(' ')].filter(Boolean).join(' ') || null, err: true, ms, highlight });
  return withHeld({ text: did || 'Done.', sub: [tail, odd.join(' ')].filter(Boolean).join(' ') || null, ms, highlight, chips: examples.length ? examples : undefined });
}

/* ---------------- technical history ---------------- */
function turnHTML(r) {
  if (r.error) return `<pre class="sop"><span class="cm"># typed as SOP Lang</span>\n${escH(r.sop)}</pre><div class="errt">${escH(r.error.message)}</div>`;
  return READERS.map(rd => {
    const x = r.readers[rd.id];
    if (!x) return `<section class="rdsec"><div class="minihead">${escH(rd.label)} <span>${escH(r.off[rd.id] || 'did not read this')}</span></div></section>`;
    let h = `<div class="minihead">${escH(rd.label)} <span>${x.ms != null ? 'formalized in ' + fmtMs(x.ms) : r.raw ? 'SOP Lang, nothing to formalize' : 'your choice from the question'}${x.neural ? ` · ${x.neural.calls} model calls` : ''}${x.cutBy ? ` · cut by: ${escH(cutLabel(x.cutBy))}` : ''}</span></div>`;
    if (x.nodes && x.nodes.length) h += `<pre class="sop">${r.raw ? `<span class="cm"># ${r.button ? 'toolbar button, sent as SOP Lang' : 'typed as SOP Lang'}</span>\n` : ''}${x.nodes.map(hlNode).join('\n')}</pre>`;
    (x.notes || []).forEach(n => { h += `<div class="note">${escH(n)}</div>`; });
    if (x.gate) h += gateHTML(x, rd);
    if (x.vss) h += vssHTML(x.vss);
    if (x.neural) h += neuralHTML(x.neural);
    if (x.combined) h += combinedHTML(x.combined);
    if (x.vote) h += voteHTML(x.vote);
    if (x.result) h += x.result.steps.map(stepHTML).join('');
    for (const a of x.anyway || []) h += `<div class="note">Done anyway: “${escH(a.src)}”</div><pre class="sop">${a.nodes.map(hlNode).join('\n')}</pre>` + a.result.steps.map(stepHTML).join('');
    const err = x.error && x.error.message !== 'No wires.' ? x.error : x.result && !x.result.ok ? x.result.error : null;
    if (err) h += `<div class="errt">${escH(err.message)}</div>`;
    if (!x.nodes || !x.nodes.length) h += '<div class="note">No wires were produced.</div>';
    return `<section class="rdsec">${h}</section>`;
  }).join('');
}
const ranLabel = r => (r.button ? 'button · ' : r.raw ? 'SOP Lang · ' : '') + (r.ran.length ? r.ran.map(id => RD[id].label).join(' · ') : 'none');
/** the details of one message: what each reader wrote (SOP wires), how long that took, and what it did to that reader's drawing */
function renderTurn(id) {
  const r = history.find(x => x.id === id);
  if (!r) return '<p class="intro">This message is no longer here.</p>';
  const sp = r.spell, fixes = sp && sp.fixes.length ? sp.fixes.map(f => `${f.from} → ${f.to} (similarity ${f.sim.toFixed(2)}, next ${f.second.toFixed(2)})`).join(', ') : '';
  const spell = fixes ? `<div class="note">Spelling, in ${fmtMs(sp.ms)}: ${escH(fixes)}. Every reader read the corrected text:</div><div class="q">${escH(r.text)}</div>`
    : sp ? `<div class="note">Spelling: nothing corrected (${fmtMs(sp.ms)}).</div>` : r.spellOff ? '<div class="note">Spelling check was off (⋮ › Settings).</div>' : '';
  const c = r.cut, cut = c ? `<div class="note">Cut into ${c.units.length} request${c.units.length === 1 ? '' : 's'} by the ${escH(cutLabel(c.strategy))} in ${fmtMs(c.ms)}${c.why ? ` (the ${escH(cutLabel(c.wanted))} was chosen, but ${escH(c.why)})` : ''}; every reader read these:</div><ul class="units">${c.units.map(u => `<li><span class="src">“${escH(u.src)}”</span></li>`).join('')}</ul>` : '';
  return `<div class="msghead"><div class="q">${escH(r.typed || r.text)}</div>${spell}${cut}<div class="note">${escH(r.time)} · read by ${escH(ranLabel(r))}</div></div>
  <p class="intro">What each reader wrote for this message in SOP Lang and how long writing it took, the plugin that ran each wire and the changes it made to that reader’s drawing, the requests each VSS world read and the neural model’s evidence.</p>${turnHTML(r)}`;
}

/* ---------------- SOP highlighting ---------------- */
function hlValue(raw) {
  return K.fmtValue(raw).split(/(,)/).map(part => {
    if (part === ',') return '<span class="cm">,</span>';
    if (part.startsWith('$')) return `<span class="rf">${escH(part)}</span>`;
    if (part.startsWith('"')) return `<span class="str">${escH(part)}</span>`;
    return `<span class="v">${escH(part)}</span>`;
  }).join('');
}
function hlNode(n) {
  const line = K.serialize(n); const head = `<span class="wid">@${escH(n.id)}</span> <span class="wt">${escH(n.type)}</span>`;
  const keys = line.split(' ').slice(2).map(t => t.split('=')[0]);
  const body = keys.map(k => { const q = engine.legend.get(k); return ` <span class="k"${q && q.ask ? ` title="${escH(q.ask)}"` : ''}>${escH(k)}</span><span class="cm">=</span>${hlValue(n.args[k])}`; }).join('');
  return `<span class="${n.type === 'mention' ? 'ln-mention' : ''}">${head}${body}</span>`;
}

/* ---------------- conversation ---------------- */
function patchLine(p) {
  const sz = v => K.sizeName(v);
  switch (p.op) {
    case 'add': return ['add', '+', `${p.shape.name}  ${sz(p.shape.size)} ${p.shape.color} ${p.shape.shape}${p.shape.label ? ` "${p.shape.label}"` : ''}`];
    case 'remove': return ['del', '−', p.name];
    case 'set': { const pr = p.props, parts = []; if ('x' in pr) parts.push(`moved to (${pr.x}, ${pr.y})`); for (const [k, v] of Object.entries(pr)) { if (k === 'x' || k === 'y') continue; parts.push(k === 'size' ? `size ${sz(v)}` : `${k} ${v == null ? 'none' : v}`); } return ['chg', '~', `${p.name}  ${parts.join(', ')}`]; }
    case 'rename': return ['chg', '~', `${p.from} is now ${p.to}`];
    case 'link': return ['add', '+', K.edgeText(p.edge)];
    case 'unlink': return ['del', '−', p.edge ? K.edgeText(p.edge) : p.id];
    case 'edgeSet': return ['chg', '~', p.edge ? `${K.edgeText(p.edge)}${'label' in p.props && p.props.label == null ? '  label removed' : ''}` : p.id];
    case 'rule': return ['add', '+', `rule ${p.rule.id}`];
    case 'forget': return ['del', '−', 'all rules'];
  }
  return ['chg', '?', p.op];
}
function stepHTML(st) {
  const bits = [];
  if (st.patches.length) bits.push(`<ul class="fx">${st.patches.map(p => { const [c, o, t] = patchLine(p); return `<li><span class="op ${c}">${o}</span>${escH(t)}</li>`; }).join('')}</ul>`);
  if (st.answer) bits.push(`<div class="answer">${escH(st.answer)}</div>`);
  if (st.notes && st.notes.length) bits.push(`<div class="note">${escH(st.notes.join('; '))}</div>`);
  (st.issues || []).filter(i => i.level === 'warn').forEach(i => bits.push(`<div class="note">${escH(i.msg)}</div>`));
  if (st.lowering) bits.push(`<details class="lower"><summary>Lowered to Datalog and evaluated</summary><pre>${escH(st.lowering)}</pre></details>`);
  if (!bits.length) return '';
  const plug = st.plugin ? engine.plugin(st.plugin) : null;
  return `<div class="row"><span class="chip">@${escH(st.node.id)} <span class="p">${escH(plug ? plug.name : st.plugin || '')}</span></span><div class="res">${bits.join('')}</div></div>`;
}
const fmtV = v => v == null ? '' : K.fmtValue(v);
/** the gate of one reader on one message (see GATES): the level, each request's confidence, executed or not and why, the wires not run */
function gateHTML(x, rd) {
  const g = x.gate, ex = g.units.filter(u => u.execute).length, t = g.threshold, T = g.thresholds;
  const tt = g.rule ? ' (it acts only when the Rules, VSS and SOP-BERT read a request the same)'
    : T && Number.isFinite(T.command) && Number.isFinite(T.question) ? ` (it acts from confidence ${T.command.toFixed(4)} for commands and ${T.question.toFixed(4)} for questions${g.method === 'votes' ? ', with the votes of the other two readers' : ''})`
    : Number.isFinite(t) ? ` (it acts from confidence ${t.toFixed(4)})` : t === -Infinity ? ' (every request is executed)' : ' (no confidence: every request is asked)';
  const lab = g.label || gateLabel(g.effective || g.level);
  let h = `<div class="note">${escH(rd.label)} gate: ${escH(lab)}${!g.label && g.effective && g.effective !== g.level ? ` (${escH(gateLabel(g.level))} is not reached)` : ''}${escH(tt)}; executed ${ex} of ${g.units.length} request${g.units.length === 1 ? '' : 's'}${g.held.length ? `, not sure about ${g.held.length}` : ''}.</div>`;
  if (g.fallback) h += `<div class="note">${escH(g.fallback.charAt(0).toUpperCase() + g.fallback.slice(1))}.</div>`;
  if (g.units.length) h += `<ul class="units">${g.units.map(u => `<li><span class="src">“${escH(u.src || '')}”</span> → ${Number.isFinite(u.conf) ? `confidence ${u.conf.toFixed(3)}, ` : ''}${u.execute ? 'executed' : `<b>not executed</b>: ${escH(u.reasons.map(r => r.text).join('; ') || 'not sure')}${u.doneAnyway ? ' (then done anyway)' : ''}`}</li>`).join('')}</ul>`;
  const heldNodes = g.held.flatMap(u => u.nodes);
  if (heldNodes.length) h += `<pre class="sop"><span class="cm"># not executed (not sure)</span>\n${heldNodes.map(hlNode).join('\n')}</pre>`;
  return h;
}
function vssHTML(v) {
  let h = '';
  if (v.units) h += `<div class="note">The requests and the world that read each:</div><ul class="units">${v.units.map(u => `<li><span class="src">“${escH(u.src || '')}”</span> → ${u.zone === 'ignored' ? 'not read' + (u.reason ? ' (' + escH(u.reason) + ')' : '') : `world <code>${escH(((vssInfo && vssInfo.worlds || []).find(w => w.world === u.world) || { model: u.world || '' }).model)}</code>, ${escH(u.event || '?')}${u.zone === 'ask' ? ', asked which shape' : ''}${u.tie > 1 ? `, ${u.tie} worlds read it, decided by ${escH(u.decidedBy || '?')}` : ''}${u.reread ? ', action from the event hint' : ''}`}${u.noWorldSignal ? ' (the VSS cutter named no world here: every world read it)' : ''}</li>`).join('')}</ul>`;
  for (const c of v.clauses) {
    if (!c.vss) continue;
    const m = c.vss.margins || {}, ms = Object.entries(m).filter(([, x]) => typeof x === 'number').map(([k, x]) => `${k} ${x.toFixed(2)}`).slice(0, 8).join(' · ');
    h += `<details class="cmp"><summary>clause <span class="src">${escH(c.src)}</span></summary><div class="tb" style="padding:6px 0 0">
      <div class="note">normalized: <code>${escH(c.normalized)}</code> · status <b>${escH(c.vss.status)}</b> · residual ${(+c.vss.residual).toFixed(3)}${c.vss.unplaced && c.vss.unplaced.length ? ' · unplaced: ' + escH(c.vss.unplaced.join(' ')) : ''}</div>
      ${ms ? `<div class="note">margins: ${escH(ms)}</div>` : ''}<pre class="sop">${escH(c.vss.sop)}</pre></div></details>`;
  }
  return h;
}
function neuralHTML(n) {
  const pct = x => (x * 100).toFixed(0) + '%';
  let h = '';
  // where the cut numbers of the neural gate's confidence came from (GATES.neural)
  if (n.joint && n.joint.cutFrom === 'cut head (extra call)') h += '<div class="note">The cut numbers of SOP-BERT’s confidence were read from its cut head, run once more over the message, at the requests of the shared cut; the confidence was fitted on the requests of the BERT cutter.</div>';
  for (const a of n.analyses) {
    const r = a.rules, rows = [];
    const actKey = a.kind.value === 'command' ? 'action' : a.kind.value === 'question' ? 'ask' : null;
    rows.push(['wire type', r ? r.type : '', a.kind.value, a.kind.top.map(t => `${t[0]} ${pct(t[1])}`).join(' · '), true]);
    if (actKey || (r && (r.args.action || r.args.ask))) { const rk = r ? (r.args.action || r.args.ask || '') : ''; rows.push([actKey || 'action/ask', rk, a.act ? a.act.value : '', a.act ? a.act.top.map(t => `${t[0]} ${pct(t[1])}`).join(' · ') : '', true]); }
    const keys = new Set(Object.keys(a.keys).concat(r ? Object.keys(r.args).filter(k => k !== 'action' && k !== 'ask') : []));
    for (const k of keys) {
      const q = a.keys[k];
      const why = q ? (q.span ? `“${q.span}” ${pct(q.score)}${q.source !== 'neural' ? ' · from ' + q.source : ''}` : 'no span') : 'not in frame';
      rows.push([k, r ? fmtV(r.args[k]) : '', q ? fmtV(q.value) : '', why, false]);
    }
    const body = rows.filter(x => x[1] !== '' || x[2] !== '' || x[4]).map(([k, rv, nv, why]) => r ? `<tr class="${rv === nv ? 'same' : 'diff'}"><th>${escH(k)}</th><td>${escH(rv || '–')}</td><td>${escH(nv || '–')}</td><td class="why">${escH(why)}</td></tr>` : `<tr><th>${escH(k)}</th><td>${escH(nv || '–')}</td><td class="why">${escH(why)}</td></tr>`).join('');
    h += `<details class="cmp"><summary>@${escH(a.id)} <span class="src">${escH(a.src)}</span></summary><div class="tbl"><table><thead><tr><th>question</th>${r ? '<th>rules</th>' : ''}<th>neural</th><th>model evidence</th></tr></thead><tbody>${body}</tbody></table></div></details>`;
  }
  return h;
}

/* ---------------- sheets ---------------- */
const sheet = $('#sheet'), scrim = $('#scrim'), sbody = $('#sbody'), stabs = $('#stabs');
let sheetKind = null, sheetTab = null, sheetTurn = null;
// the readers' own settings and their drawing as SOP are subtabs of each reader tab; the sheet keeps what is shared by every reader
// Help is not here: it is the full-screen overlay (docs/js/docs.js), opened by the ? button above the drawing
const TABS = { settings: [['settings', 'Settings'], ['plugins', 'Capabilities'], ['benchmark', 'Benchmark']], examples: [], turn: [] };
function openSheet(kind, tab, focus) {
  sheetKind = kind; sheetTab = tab || (TABS[kind][0] || [])[0] || null;
  $('#sheet-title').textContent = kind === 'examples' ? 'Examples' : kind === 'turn' ? 'Message details' : 'Settings';
  stabs.hidden = !TABS[kind].length;
  stabs.innerHTML = TABS[kind].map(([k, l]) => `<button class="stab" role="tab" type="button" data-stab="${k}" aria-selected="${k === sheetTab}">${l}</button>`).join('');
  sheet.hidden = false; scrim.hidden = false; renderSheet(focus); sbody.scrollTop = 0;
}
function closeSheet() { sheet.hidden = true; scrim.hidden = true; sheetKind = null; }
$('#close-sheet').addEventListener('click', closeSheet); scrim.addEventListener('click', closeSheet);
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !sheet.hidden) closeSheet(); });
stabs.addEventListener('click', ev => { const b = ev.target.closest('[data-stab]'); if (!b) return; sheetTab = b.dataset.stab; stabs.querySelectorAll('.stab').forEach(x => x.setAttribute('aria-selected', String(x === b))); renderSheet(); sbody.scrollTop = 0; });
$('#open-settings').addEventListener('click', () => openSheet('settings', 'settings'));
$('#help-btn').addEventListener('click', () => { closeSheet(); DocsKit.open('start'); });
/** open a help page from anywhere in the app (a button with data-help="<page>") */
function openHelp(id) { if (!sheet.hidden) closeSheet(); DocsKit.open(id); }
$('#open-examples').addEventListener('click', () => openSheet('examples'));
function renderSheet(focus) {
  if (sheetKind === 'examples') sbody.innerHTML = renderExamples();
  else if (sheetKind === 'turn') { if (focus) sheetTurn = focus; sbody.innerHTML = renderTurn(sheetTurn); }
  else if (sheetTab === 'settings') sbody.innerHTML = renderSettings();
  else if (sheetTab === 'benchmark') { sbody.innerHTML = renderBench(); if (!benchSets) benchIndex().then(() => { if (sheetTab === 'benchmark' && !sheet.hidden) sbody.innerHTML = renderBench(); }).catch(e => { sbody.innerHTML = `<p class="intro">The test sets could not be loaded: ${escH(e.message)}</p>`; }); }
  else if (sheetTab === 'plugins') sbody.innerHTML = renderPlugins();
}

/* ---------------- examples ---------------- */
const QUICK = [
  'Draw a small pink star next to Done',
  'Make the green circle bigger',
  'Connect Done to Start with a dotted line',
  'Is there a path from Start to Done?',
  'What is connected to Check?',
  'Add three tiny red circles in a row below Process',
  'Which shape has the most connections?',
  'From now on, circles are orange',
  'Check is above Process',
  'Rename Done to End',
  'Arrange everything in a circle',
  'Describe the diagram',
  '@g1 command action=create shape=star color=gold name=Gem position=center'
];
function renderExamples() {
  return `<h3 class="sub">Send one sentence</h3>
  <div class="quick">${QUICK.map(q => `<button type="button" data-quick="${escH(q)}">${escH(q.startsWith('@') ? 'SOP Lang: ' + q : q)}</button>`).join('')}</div>
  <h3 class="sub">Play a scenario</h3>
  <p class="intro">A scenario is a script of messages. It is drawn in a new area next to what is already on the canvas; nothing is erased.</p>
  <div class="opts"><label for="sc-delay">Pause between messages</label><select id="sc-delay"><option value="0">none</option><option value="400" selected>0.4 s</option><option value="1000">1 s</option><option value="2000">2 s</option></select></div>
  <div class="sc-list">${SCENARIOS.map(sc => `<article class="sc"><header><h4>${escH(sc.title)}</h4><span class="len">${sc.size} · ${sc.turns.length} message${sc.turns.length === 1 ? '' : 's'}</span></header><p>${escH(sc.blurb)}</p><div class="row2"><button type="button" class="btn solid" data-sc="${sc.id}" data-how="play">Play</button><button type="button" class="btn" data-sc="${sc.id}" data-how="step">Step through</button><button type="button" class="btn" data-sc="${sc.id}" data-how="edit">Edit a copy</button></div></article>`).join('')}</div>
  <h3 class="sub">Your own script</h3>
  <p class="intro">One message per line. Lines starting with <code>#</code> are comments; lines starting with <code>@</code> are SOP Lang, sent to the engine as they are.</p>
  <textarea id="sc-text" rows="7" spellcheck="false" placeholder="# My diagram&#10;Draw a blue circle named Hub in the center.&#10;Add a red square named Node1 left of Hub and connect Hub to it.&#10;What is connected to Hub?"></textarea>
  <div class="row2" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px"><button type="button" class="btn solid" data-own="play">Play</button><button type="button" class="btn" data-own="step">Step through</button><label class="btn file">Load .txt<input type="file" id="sc-file" accept=".txt,.md,.sop,text/plain"></label><span class="status" id="sc-status"></span></div>`;
}
const player = { name: '', turns: [], i: 0, playing: false, stop: false, delay: 400 };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const parseScript = txt => txt.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.startsWith('//'));
function renamedForCanvas(turns) {
  const declared = new Set(); turns.forEach(t => (t.match(/\b(?:named|called)\s+([A-Za-z_][\w-]*)/g) || []).forEach(m => declared.add(m.split(/\s+/).pop())));
  const map = {};
  const taken = n => READERS.some(rd => rd.world.find(n));
  for (const n of declared) if (taken(n)) { let k = 2; while (taken(n + k) || declared.has(n + k)) k++; map[n] = n + k; }
  const keys = Object.keys(map); if (!keys.length) return { turns, map };
  const re = new RegExp(`\\b(${keys.join('|')})\\b`, 'g');
  return { turns: turns.map(t => t.replace(re, m => map[m])), map };
}
function renderPlayer() {
  const bar = $('#player');
  if (!player.turns.length) { bar.hidden = true; return; }
  bar.hidden = false;
  const done = player.i >= player.turns.length;
  bar.innerHTML = `<div class="pl-t"><b>${escH(player.name)}</b> · ${done ? 'finished' : `${player.i + 1} of ${player.turns.length}`}${done ? '' : `<span>Next: ${escH(player.turns[player.i])}</span>`}</div>
    ${done ? '' : player.playing ? '<button type="button" class="pbtn ghost" data-pl="pause">Pause</button>' : '<button type="button" class="pbtn ghost" data-pl="play">Play</button><button type="button" class="pbtn" data-pl="next">Next</button>'}
    <button type="button" class="ib" data-pl="close" aria-label="Close player"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
}
async function playRest() {
  if (player.playing) return; player.playing = true; player.stop = false; renderPlayer();
  while (player.i < player.turns.length && !player.stop) { const t = player.turns[player.i++]; renderPlayer(); await submit(t); await sleep(player.delay); }
  player.playing = false; renderPlayer();
}
async function startScript(name, turns, how) {
  if (!turns.length) return;
  player.delay = +(($('#sc-delay') || {}).value || 400);
  player.stop = true; await queue; player.playing = false;
  closeSheet();
  const fixed = renamedForCanvas(turns);
  for (const rd of READERS) {   // every reader's drawing gets the new area
    const w = rd.world;
    if (w.state.shapes.length) { const before = w.snapshot(); w.newFrame(name); w.commit(before); }
    else { w.state.frame = { x: 0, y: 0 }; w.state.frames = [{ x: 0, y: 0, title: name }]; }
    rd.focusCell = Object.assign({}, w.state.frame);
  }
  const ren = Object.entries(fixed.map).map(([a, b]) => `${a} → ${b}`);
  sysNote(`Scenario: ${name}` + (ren.length ? ` · renamed ${ren.join(', ')} to avoid clashes` : ''));
  renderCanvas();
  Object.assign(player, { name, turns: fixed.turns, i: 0 });
  renderPlayer();
  if (how === 'play') playRest();
}
$('#player').addEventListener('click', async ev => {
  const b = ev.target.closest('[data-pl]'); if (!b) return;
  const a = b.dataset.pl;
  if (a === 'next' && player.i < player.turns.length && !player.playing) { const t = player.turns[player.i++]; renderPlayer(); await submit(t); renderPlayer(); }
  if (a === 'play') playRest();
  if (a === 'pause') player.stop = true;
  if (a === 'close') { player.stop = true; player.turns = []; renderPlayer(); }
});

/* ---------------- formalizers: rules, VSS, neural ---------------- */
let vssState = 'idle', vssInfo = null, vssError = null, neuralBytes = 0, neuralLoadMs = 0;
// neural: 'checking' (is it published? in the cache?), 'loading', 'ready', 'unpublished' (our model is not on this site), 'failed'
let nState = 'checking', nError = null, nProg = { L: 0, T: 0 }, nFromCache = false, nToken = 0;
const VSS_HINT = 31.4e6;   // the composer's files (9 worlds of arm VSS-ALL with generated stars, cutters, context weights), measured 2026-11-03; the loaded size is measured again in the page
const RULES_BYTES_INLINE = (() => { try { return [...document.scripts].filter(s => !s.src && /SOPKit/.test(s.textContent.slice(0, 400))).reduce((a, s) => a + s.textContent.length, 0); } catch (e) { return 0; } })();
const rulesBytes = () => { try { const e = performance.getEntriesByType('resource').find(r => /\/js\/logic\.js$/.test(r.name)); return e && e.decodedBodySize ? e.decodedBodySize : RULES_BYTES_INLINE; } catch (e) { return RULES_BYTES_INLINE; } };
const mb = b => b >= 1e6 ? (b / 1e6).toFixed(1) + ' MB' : (b / 1e3).toFixed(0) + ' KB';
const mb0 = b => Math.round(b / 1e6) + ' MB';

/* a reader that finishes loading before it has read anything starts from the Rules drawing */
function copyDrawing(src, dst) {
  const c = x => JSON.parse(JSON.stringify(x));
  dst.world.restore(src.world.state); dst.world.undoStack = c(src.world.undoStack); dst.world.redoStack = c(src.world.redoStack);
  dst.last = src.last.slice(); dst.focusCell = src.focusCell && Object.assign({}, src.focusCell); dst.pending = null;
}
function adoptRules(rd) { queue = queue.then(() => { if (!rd.reads) { copyDrawing(RD.rules, rd); if (rd === cur) renderCanvas(); } updateTabs(); renderSopBar(); }); return queue; }
function alignDrawings() {
  queue = queue.then(() => {
    const src = cur, to = READERS.filter(rd => rd !== src && isReady(rd));
    for (const rd of to) copyDrawing(src, rd);
    sysNote(`Drawings aligned: ${to.map(rd => rd.label).join(' and ') || 'no other reader'} now ${to.length > 1 ? 'have' : 'has'} the ${src.label} drawing and its undo history.`);
    renderCanvas(); updateTabs(); renderSopBar();
  });
}
/* what a drawing shows (shapes, links, rules), independent of ids and counters */
function sig(w) {
  const S = w.state;
  return JSON.stringify([S.shapes.map(s => [s.name, s.shape, s.color, s.size, s.x, s.y, s.label || '', s.outline || ''].join('|')).sort(),
    S.edges.map(e => [e.from, e.to, e.style, e.arrow, e.label || '', e.color || ''].join('|')).sort(), S.rules.map(r => [r.shape, r.size, r.color, r.outline].join('|')).sort()]);
}
const differs = rd => rd !== cur && isReady(rd) && isReady(cur) && sig(rd.world) !== sig(cur.world);

/* ---------------- reader tabs, SOP bar, loading card ---------------- */
const rtabs = $('#rtabs');
function tabTitle(rd) {
  if (!isReady(rd)) return `${rd.label}: ${offText(rd).replace(/, did not read this$/, '')}`;
  return differs(rd) ? `${rd.label}: this drawing differs from the ${cur.label} drawing` : `${rd.label}: show this reader’s drawing`;
}
function updateTabs() {
  renderSub();
  const keep = rtabs.scrollLeft;
  rtabs.innerHTML = READERS.map(rd => `<button type="button" role="tab" class="rtab${isReady(rd) ? '' : ' off'}" data-rtab="${rd.id}" aria-selected="${rd === cur}" title="${escH(tabTitle(rd))}">${escH(rd.label)}${differs(rd) ? `<i class="dot" aria-label="differs from ${escH(cur.label)}"></i>` : ''}${!isReady(rd) && ((rd.id !== 'neural' && vssState === 'loading') || (rd.id !== 'vss' && (nState === 'loading' || nState === 'checking'))) ? '<i class="spin" aria-hidden="true"></i>' : ''}</button>`).join('');
  rtabs.scrollLeft = keep; activeTabInView();
}
/** on a narrow screen the tab strip scrolls sideways: the active tab is scrolled into view (after a render and a resize) */
function activeTabInView() {
  const sel = rtabs.querySelector('[aria-selected="true"]');
  if (sel && rtabs.scrollWidth > rtabs.clientWidth) { const a = rtabs.getBoundingClientRect(), b = sel.getBoundingClientRect(); if (b.left < a.left) rtabs.scrollLeft -= a.left - b.left; else if (b.right > a.right) rtabs.scrollLeft += b.right - a.right; }
}
function setActive(id) {
  if (!RD[id] || drag) return;
  cur = RD[id]; world = cur.world; hl = { shapes: new Set(), edges: new Set() }; clearTimeout(hlTimer);
  renderCanvas(); updateTabs(); renderCard(); renderSopBar();
}
rtabs.addEventListener('click', ev => { const b = ev.target.closest('[data-rtab]'); if (b) setActive(b.dataset.rtab); });
rtabs.addEventListener('keydown', ev => {
  if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
  const i = READERS.indexOf(cur), n = READERS[(i + (ev.key === 'ArrowRight' ? 1 : READERS.length - 1)) % READERS.length];
  setActive(n.id); const b = rtabs.querySelector(`[data-rtab="${n.id}"]`); if (b) b.focus();
});
/* the align tool: shown when another loaded reader's drawing differs from the one on screen; copies this drawing to them */
function renderSopBar() {
  const b = $('#align-btn'); if (!b) return;
  b.hidden = !READERS.some(differs);
  b.title = b.ariaLabel = `Copy this ${cur.label} drawing and its undo history to the other tabs`;
}
$('#align-btn').addEventListener('click', alignDrawings);
function renderCard() {
  const c = $('#rcard');
  if (cur.id === 'rules' || isReady(cur) || sub !== 'drawing') { c.hidden = true; return; }
  c.hidden = false;
  c.className = 'rcard' + (cur.id === 'neural' && nState === 'unpublished' ? ' small' : '');
  c.innerHTML = cur.id === 'vss' ? `<b>VSS reader</b>${vssState === 'failed' ? errHTML(vssError) : `<p>Loading the 9 micro-worlds from this site (about ${mb0(VSS_HINT)})…</p>`}`
    : cur.id === 'combined' ? `<b>VSS-BERT reader</b><p>It ${escH(offText(cur))}; it starts when both are loaded.</p>`
    : cur.id === 'vote3' ? `<b>3 readers</b><p>It ${escH(offText(cur))}; it starts when both are loaded.</p>`
    : `<b>SOP-BERT reader</b>${neuralBoxHTML()}`;
}

/* ---------------- VSS: loads by itself when the page opens (same site) ---------------- */
async function ensureVSS(announce) {
  if (vssState === 'ready') return true;
  if (vssState === 'loading') { while (vssState === 'loading') await sleep(100); return vssState === 'ready'; }
  vssState = 'loading'; refreshReaders();
  try {
    if (!window.VSSFormalizer) await import(new URL('js/vss-formalizer.js', document.baseURI).href);
    await window.VSSFormalizer.loadComposerAt(); vssInfo = window.VSSFormalizer.composerInfo();
    try {
      await window.VSSFormalizer.loadConfidence();
      // a level kept from before that the model does not reach (e.g. 99): the highest reached level below it, else the safety threshold
      const ci = window.VSSFormalizer.confidenceInfo(), eff = ci && ci.effective(vssGate);
      if (eff && eff !== vssGate) { sysNote(`VSS does not reach ${vssGate}% precision on its calibration messages; it uses its ${gateLabel(eff)} instead.`); vssGate = eff; store.set(GATE_KEY, vssGate === GATE_DEFAULT ? null : vssGate); }
    } catch (e) { sysNote('The VSS confidence model could not be loaded (' + (e && e.message || e) + '): VSS will ask about every request.'); }
    vssState = 'ready'; vssError = null;
    const fresh = !RD.vss.reads;
    if (announce !== false) sysNote((vssInfo.composer ? `VSS ready: ${vssInfo.worlds.length} micro-worlds, ${mb(vssInfo.bytes)}, loaded in ${(vssInfo.loadMs / 1000).toFixed(1)} s.`
      : `VSS model ready: ${mb(vssInfo.bytes)}, D ${vssInfo.D}, loaded in ${(vssInfo.loadMs / 1000).toFixed(1)} s.`) + (fresh ? ' It starts from the Rules drawing.' : ''));
    adoptRules(RD.vss); if (isReady(RD.combined)) adoptRules(RD.combined); if (isReady(RD.vote3)) adoptRules(RD.vote3);
  } catch (e) { vssState = 'failed'; vssError = e; sysNote('The VSS reader could not be loaded: ' + (e && e.message || e)); }
  refreshReaders(); return vssState === 'ready';
}

/* ---------------- Neural: our model (SOP-BERT, NeuralKit.modelsFor) loads by itself when the page opens, like VSS ---------------- */
let nStatus = null;   // NeuralKit.status(): is our model published on this site
/** the neural model(s) this page loads, by name: "SOP-BERT" (one model; the earlier pair joined with +) */
const neuralNames = () => { try { return NeuralKit.modelsFor().map(id => NeuralKit.NAMES[id] || id); } catch (e) { return []; } };
const nBytesHint = () => NeuralKit.modelsFor().reduce((a, id) => a + (NeuralKit.bytesOf(id) || 0), 0);
function errHTML(e) {
  if (!e) return '';
  const msg = String(e.message || e);
  return `<div class="errt">${escH(msg)}</div>${e.files && e.files.length ? `<div class="note">Files still loading when it failed: ${e.files.map(u => `<code>${escH(u)}</code>`).join(', ')}</div>` : e.url && !msg.includes(e.url) ? `<div class="note">File: <code>${escH(e.url)}</code></div>` : ''}${e.network ? '<div class="note">This looks like a network failure (this site or the transformers.js library on cdn.jsdelivr.net could not be reached).</div>' : ''}`;
}
function progText() { return nFromCache ? 'Loading from this browser’s cache…' : nProg.T ? `Downloading ${(nProg.L / 1e6).toFixed(0)} of ${(nProg.T / 1e6).toFixed(0)} MB…` : 'Starting the download…'; }
function unpublishedHTML() { return `<p>The neural model is not published yet.</p>${nStatus && nStatus.missing.length ? `<div class="note">Not on this site: ${nStatus.missing.map(m => `<code>${escH(m)}</code>`).join(', ')}</div>` : ''}`; }
function neuralBoxHTML() {
  if (nState === 'checking') return '<p>Checking whether the neural model is published and in this browser’s cache…</p>';
  if (nState === 'unpublished') return unpublishedHTML();
  if (nState === 'loading') return `<p class="nprog-t">${escH(progText())}</p><div class="prog"><div style="width:${nProg.T ? (nProg.L / nProg.T * 100).toFixed(1) : 0}%"></div></div>`;
  if (nState === 'failed') return `<p>The neural model could not be loaded:</p>${errHTML(nError)}<div class="acts"><button type="button" class="btn solid" data-nact="retry">Try again</button></div>`;
  return `<p>Ready: ${escH(neuralNames().join(' + '))} on the CPU (WASM, ${escH(models.dtypeText || '8-bit files')}), ${mb(neuralBytes)}, loaded in ${(neuralLoadMs / 1000).toFixed(1)} s${nFromCache ? ' from the browser cache' : ''}.</p>`;
}
let nRaf = 0;
function refreshReaders() {   // every place that shows a reader's state
  updateTabs(); renderCard(); setStatus(idleStatus());
  const box = $('#nm-box'); if (box) box.innerHTML = neuralBoxHTML();
}
/** when the page opens: is our model published? then it loads (from the browser cache when it is there) */
async function checkNeural() {
  const tok = ++nToken; models = null; neural.setModels(null); nState = 'checking'; nError = null; refreshReaders();
  nStatus = await NeuralKit.status();
  if (tok !== nToken) return;
  if (sub === 'settings' && cur.id === 'neural') renderSub();   // the sizes and the model facts are known now
  if (nStatus.error) { nState = 'failed'; nError = Object.assign(new Error(nStatus.error), { network: true }); refreshReaders(); return; }
  if (!nStatus.published) { nState = 'unpublished'; refreshReaders(); return; }
  loadModels(await NeuralKit.cached());
}
async function loadModels(fromCache) {
  const tok = ++nToken, files = {}, t0 = performance.now(); neuralBytes = 0;
  models = null; neural.setModels(null); nState = 'loading'; nError = null; nFromCache = !!fromCache; nProg = { L: 0, T: 0 }; refreshReaders();
  try {
    const m = await NeuralKit.load(e => {
      if (tok !== nToken || e.status !== 'progress' || !e.file) return;
      files[e.name + '/' + e.file] = [e.loaded || 0, e.total || 0]; const v = Object.values(files);
      nProg = { L: v.reduce((a, x) => a + x[0], 0), T: v.reduce((a, x) => a + x[1], 0) }; neuralBytes = nProg.T;
      if (!nRaf) nRaf = requestAnimationFrame(() => { nRaf = 0; if (nState !== 'loading') return; document.querySelectorAll('.nprog-t').forEach(x => { x.textContent = progText(); }); document.querySelectorAll('.rcard .prog > div, #nm-box .prog > div').forEach(x => { x.style.width = (nProg.T ? nProg.L / nProg.T * 100 : 0).toFixed(1) + '%'; }); setStatus(`loading the neural reader ${(nProg.T ? nProg.L / nProg.T * 100 : 0).toFixed(0)}%`); });
    });
    if (tok !== nToken) return;
    neural.setStrategy('finetuned'); neural.setModels(m); models = m; nState = 'ready'; neuralLoadMs = performance.now() - t0;
    if (!neuralBytes) neuralBytes = nBytesHint();
    const fresh = !RD.neural.reads;
    sysNote(`SOP-BERT reader ready: ${neuralNames().join(' + ')} on the CPU, ${mb(neuralBytes)}${fromCache ? ' from the browser cache' : ''}, ${(neuralLoadMs / 1000).toFixed(1)} s.` + (fresh ? ' It starts from the Rules drawing.' : ''));
    adoptRules(RD.neural); if (isReady(RD.combined)) adoptRules(RD.combined); if (isReady(RD.vote3)) adoptRules(RD.vote3);
  } catch (e) {
    if (tok !== nToken) return;
    console.error(e); nState = e && e.unpublished ? 'unpublished' : 'failed'; nError = e;
    if (nState === 'failed') sysNote('The neural model could not be loaded: ' + (e && e.message || e) + (e && e.files && e.files.length ? ` (while loading ${e.files.length === 1 ? e.files[0] : e.files.length + ' files; SOP-BERT › Settings lists them'})` : ''));
  }
  refreshReaders();
}
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-nact]'); if (!b) return;
  if (b.dataset.nact === 'retry') loadModels(false);
});

/* ---------------- reader subtabs: Drawing | SOP | Settings ---------------- */
const SUBS = [['drawing', 'Drawing'], ['sop', 'SOP Lang'], ['settings', 'Settings']];
const subbar = $('#subtabs'), rpanel = $('#rpanel');
function renderSub() {
  subbar.innerHTML = SUBS.map(([k, l]) => `<button type="button" role="tab" class="subtab" data-sub="${k}" aria-selected="${k === sub}">${l}</button>`).join('') + `<span class="of">${escH(cur.label)} reader</span>`;
  const draw = sub === 'drawing';
  $('#view-btn').hidden = !draw; $('#readout').hidden = !draw;
  if (draw) { rpanel.hidden = true; rpanel.innerHTML = ''; return; }
  const top = rpanel.hidden ? 0 : rpanel.scrollTop;
  rpanel.hidden = false;
  rpanel.innerHTML = sub === 'sop' ? renderWorld(cur) : renderReaderSettings(cur);
  rpanel.scrollTop = top;
}
function setSub(k) { if (k === sub || !SUBS.some(x => x[0] === k)) return; sub = k; renderSub(); renderCard(); if (k === 'drawing') renderCanvas(); }
subbar.addEventListener('click', ev => { const b = ev.target.closest('[data-sub]'); if (b) setSub(b.dataset.sub); });
rpanel.addEventListener('change', ev => {   // SOP-BERT › Settings: the level of the neural gate (GATES.neural)
  if (ev.target.name !== 'neural-gate') return;
  const l = ['cost5', 'cost20', 'all'].includes(ev.target.value) ? ev.target.value : 'cost'; neuralGate = l === 'cost' ? null : l; store.set(NGATE_KEY, neuralGate);
  sysNote(`SOP-BERT now ${gateDoes(l)}.`);
  if (sub === 'settings') renderSub();
});
rpanel.addEventListener('change', ev => {   // VSS-BERT › Settings: safety threshold or execute all
  if (ev.target.name !== 'comb-gate') return;
  combGate = ['cost5', 'cost20', 'all'].includes(ev.target.value) ? ev.target.value : 'cost'; store.set(CGATE_KEY, combGate === 'cost' ? null : combGate);
  sysNote(`VSS-BERT now ${gateDoes(combGate)}.`);
  if (sub === 'settings') renderSub();
});
rpanel.addEventListener('change', ev => {   // 3 readers › Settings: all three agree (default), the fitted vote or execute all
  if (ev.target.name !== 'vote-gate') return;
  voteGate = ['fitted', 'all'].includes(ev.target.value) ? ev.target.value : 'agree3'; store.set(VKEY, voteGate === 'agree3' ? null : voteGate);
  sysNote(`3 readers now ${voteGate === 'agree3' ? 'executes a request only when the Rules, VSS and SOP-BERT read it the same' : voteGate === 'fitted' ? `executes a request when the fitted vote’s confidence clears its threshold (${costWords(10)})` : 'executes every request (no gate)'}.`);
  if (sub === 'settings') renderSub();
});
rpanel.addEventListener('change', ev => {
  if (ev.target.name === 'vss-gate' && GATE_LEVELS.includes(ev.target.value)) { vssGate = ev.target.value; store.set(GATE_KEY, vssGate === GATE_DEFAULT ? null : vssGate); sysNote(`VSS now ${gateDoes(vssGate)}.`); if (sub === 'settings') renderSub(); }
});
rpanel.addEventListener('click', ev => { const h = ev.target.closest('[data-help]'); if (h) { openHelp(h.dataset.help); return; } const b = ev.target.closest('[data-open]'); if (b) openSheet('settings', b.dataset.open); });
function vssStatusHTML() {
  return escH(vssState === 'ready' ? (vssInfo.composer ? `Ready: ${vssInfo.worlds.length} micro-worlds, ${mb(vssInfo.bytes)}, loaded in ${(vssInfo.loadMs / 1000).toFixed(1)} s.`
    : `Ready: D ${vssInfo.D}, ${vssInfo.bits || 8}-bit route book, ${mb(vssInfo.bytes)}, loaded in ${(vssInfo.loadMs / 1000).toFixed(1)} s.`) : vssState === 'failed' ? 'Failed: ' + (vssError && vssError.message || vssError) : `Loading (about ${mb0(VSS_HINT)} from this site)…`);
}
/** the cost levels of a column of the vote file in the settings (VSS and SOP-BERT tabs): one radio per level, the file's thresholds per type */
function columnLevelsHTML(name, col, chosen, fallbackNote) {
  const spec = vconf.spec, C = spec && spec.columns[col], pc = v => (v * 100).toFixed(1) + '%';
  if (!spec) { const again = () => { if (sub === 'settings') renderSub(); }; if (!vconf.error) voteSpec().then(again, again); }
  const opt = (l, about) => `<label style="display:flex;gap:8px;align-items:flex-start;margin:0 0 6px;cursor:pointer"><input type="radio" name="${name}" value="${l}" ${l === chosen ? 'checked' : ''}> <span><b>${escH(gateLabel(l))}</b>${l === 'cost' ? ' (default)' : ''}: ${escH(about)}</span></label>`;
  const about = l => { const x = C && C.levels[l];
    if (!x) return vconf.error ? `the model of the votes could not be loaded (${vconf.error.message || vconf.error}): ${fallbackNote}` : 'loading the model…';
    const num = v => typeof v === 'number' ? v.toFixed(4) : v;
    return `acts when its confidence is at least ${num(x.command ?? x.all)} for commands and ${num(x.question ?? x.all)} for questions: the thresholds that score best when ${costWords(COST_OF[l])}`; };
  const cal = C && C.calibration_oof, te = C && C.test;
  return ['cost5', 'cost', 'cost20'].map(l => opt(l, about(l))).join('') + opt('all', 'no gate: every request it reads is executed (as before 2026-11-02)')
    + (C ? `<p class="note">At the safety threshold, on the calibration part of the fresh2 and short3 messages (out-of-fold scores): cost score ${cal.score.toFixed(1)}, ${pc(cal.done_right)} of the requests done right, ${pc(cal.confidently_wrong)} of what it executed wrong; on the test part ${te.score.toFixed(1)}, ${pc(te.done_right)} and ${pc(te.confidently_wrong)}. Model <code>confidence/vote3.json</code>${vconf.url && /[?&]v=/.test(vconf.url) ? `, version <code>${escH(decodeURIComponent(vconf.url.split('v=').pop()))}</code>` : ''}, column <code>${escH(col)}</code> (${escH(C.variant)}).</p>` : '');
}
/** VSS › Settings: the level of the gate (see GATES): the confidence with the votes (vote3.json column vss) */
function gateSettingsHTML() {
  const info = window.VSSFormalizer && window.VSSFormalizer.confidenceInfo ? window.VSSFormalizer.confidenceInfo() : null;
  return `<h3 class="sub">When VSS acts</h3>
  <p class="intro">VSS executes a request only when its confidence clears the threshold of the level chosen here (by default its safety threshold: the one that scores best when a confident mistake costs as much as 10 right answers; “bolder” and “more careful” are the same rule with a mistake counted as 5 or as 20 right answers); below it, it does not execute the request, says why it is not sure and offers <b>Do it anyway</b>. The confidence combines 13 numbers from VSS’s own chain (the cut, the world, the reading, the words, the context filler) with <b>whether SOP-BERT and the Rules, reading the same request, read it the same way</b> (and whether the Rules had a note about it). Commands and questions have their own threshold. It was fitted on the calibration part of the fresh2 and short3 messages, from out-of-fold scores (the refit of 2026-11-03 for the 9 worlds: votes as inputs, no world prior, a threshold for commands and one for questions), and on the test part it did better than VSS’s confidence without the votes: cost score 22.9 against 4.8, difference +18.2 (95% interval 11.9 to 24.7), 37.8% of the requests done right instead of 5.3%. So a held request’s reason first says who reads it differently (“SOP-BERT reads colour ‘red’ instead of colour ‘blue’”), then what VSS itself was unsure of. When SOP-BERT has not read the message (still loading, or not available), VSS uses its confidence without the votes (<code>confidence/vss.json</code>${info && info.version ? `, version <code>${escH(info.version)}</code>` : ''}) at the same level, and the details say so. A level other than the default is kept in this browser.</p>
  ${columnLevelsHTML('vss-gate', 'vss', vssGate, 'VSS uses its confidence without the votes (vss.json)')}`;
}
/** what every reader's Settings subtab starts with: its drawing and what it has read */
function readerFacts(rd) {
  const S = rd.world.state, n = S.shapes.length, m = S.edges.length, u = rd.world.undoStack.length;
  return `<table class="kv"><tr><td>State</td><td>${escH(isReady(rd) ? 'ready' : offText(rd).replace(/, did not read this$/, '').replace(/ \(see SOP-BERT › Settings\)$/, '').replace(/; see SOP-BERT › Settings\)$/, ')'))}</td></tr><tr><td>Messages read</td><td>${rd.reads}</td></tr><tr><td>Its drawing</td><td>${n} shape${n === 1 ? '' : 's'} · ${m} link${m === 1 ? '' : 's'} · ${u} step${u === 1 ? '' : 's'} to undo</td></tr><tr><td>Requests cut by</td><td>${escH(cutLabel(cutWanted()))} (the same for every reader; ⋮ › Settings)</td></tr></table>`;
}
const sharedNote = `<p class="intro">SOP Lang (the commands every reader writes) and the engine’s capabilities are the same for all three readers. Help explains both: <button type="button" class="btn" data-help="sop-lang">SOP Lang</button> <button type="button" class="btn" data-help="capabilities">Capabilities</button> <button type="button" class="btn" data-help="architecture">How it works inside</button></p>`;
function renderReaderSettings(rd) {
  if (rd.id === 'combined') return combinedSettingsHTML() + sharedNote;
  if (rd.id === 'vote3') return voteSettingsHTML() + sharedNote;
  if (rd.id === 'rules') return `<h3 class="sub">Rules reader</h3>${readerFacts(rd)}
  <p class="intro">Hand-written code (<code>docs/js/logic.js</code>, ${mb(rulesBytes())}): it cuts the message into requests, finds the action by its cue words and answers the SOP Lang questions from the words around it. Nothing to download and nothing to choose; it reads every message at once.</p>${sharedNote}`;
  if (rd.id === 'vss') {
    const vrows = vssState === 'ready' && vssInfo.composer ? `<table class="kv">${vssInfo.worlds.map(w => `<tr><td><code>${escH(w.model)}</code></td><td>${escH(w.events.join(', '))}</td><td>${mb(w.bytes)}</td></tr>`).join('')}<tr><td>cutters, registry</td><td>which world reads which request</td><td>${mb(vssInfo.cutterBytes)}</td></tr></table>` : '';
    return `<h3 class="sub">VSS reader</h3>${readerFacts(rd)}<div class="actions"><span class="status" id="vss-st">${vssStatusHTML()}</span></div>
    <p class="intro">Seven small VSS readers (micro-worlds), each trained on a few actions of SOP Lang (VSA route books, no transformer). The world cutter names the worlds that could read each request (and cuts the message when the VSS cutter is the chosen cut); each of those worlds reads it, and the reading that leaves the fewest words not understood is kept (no drawing is passed to a world). A tie, and a reference such as “it” or a role left empty, go to the context filler, which fills it from the conversation and the names on the canvas when one candidate ranks first, and asks otherwise (the rule of 2026-11-01). In a world with several actions, a request without a verb (“Hub teal”) gets its action from a second cutter (the event hint). The files come from this site and load when the page opens.</p>
    <p class="intro"><button type="button" class="btn" data-help="vss-reader">How the VSS reader works</button> <button type="button" class="btn" data-help="vss-worlds">What a VSS world is</button></p>
    ${gateSettingsHTML()}
    ${vssState === 'ready' ? '<h3 class="sub">Worlds: actions and sizes</h3>' + vrows : ''}`;
  }
  const N = NeuralKit.NAMES, A = NeuralKit.ABOUT, info = nStatus ? nStatus.info : {}, ids = NeuralKit.modelsFor();
  const size = id => { const b = NeuralKit.bytesOf(id); return b ? mb(b) : 'size not known yet'; };
  const facts = id => { const f = info[id] && info[id].facts; if (!f) return ''; const p = [f.base && `base model <code>${escH(f.base)}</code>`, f.spans && `${escH(f.spans)} annotated requests`, f.heldout && `held-out act accuracy ${(+f.heldout * 100).toFixed(1)}%`].filter(Boolean); return p.length ? ` (${p.join(', ')})` : ''; };
  const row = (label, id) => `<label>${label}</label><div>${escH(N[id] || id)} · ${size(id)}<div class="note">${escH(A[id] || '')}${facts(id)}.${info[id] ? `${info[id].readme ? ` <a href="${escH(info[id].readme)}" target="_blank" rel="noopener">README</a> ·` : ''} version <code>${escH(info[id].version)}</code>` : ''}</div></div>`;
  return `<h3 class="sub">SOP-BERT reader</h3>${readerFacts(rd)}
  <p class="intro">SOP-BERT: one DistilBERT model of ours, fine-tuned on the same annotated requests as the VSS worlds, run in this browser. In two calls per message (the cut, then all its requests at once) it reads, for every request, the action, the value of each SOP Lang key, who fills each role (a name written in the request, “it”, or a description such as “the red circle”) and the words that are names, labels and numbers; the SOP Lang wires are then assembled by the legend. It does not use the Rules reader. It carries out a request only when its confidence clears the threshold chosen below, and asks about the rest. Its cut head is the BERT cutter (⋮ › Settings). The files come from this site, load by themselves when the page opens, and stay in this browser’s cache.</p>
  <p class="intro"><button type="button" class="btn" data-help="neural-reader">How SOP-BERT works</button> <button type="button" class="btn" data-help="bert">What we do with BERT</button></p>
  <div class="form">
    ${ids.map((id, i) => row(ids.length > 1 ? ['Act', 'Answers'][i] || 'Model' : 'Model', id)).join('')}
    <label>Device</label><div>CPU (WASM), ${escH(NeuralKit.dtypeText())}</div>
  </div>
  <div class="nbox" id="nm-box">${neuralBoxHTML()}</div>
  ${neuralGateSettingsHTML()}`;
}
/** SOP-BERT › Settings: the level of the neural gate (GATES.neural): the confidence with the votes (vote3.json column sop) */
function neuralGateSettingsHTML() {
  return `<h3 class="sub">When SOP-BERT acts</h3>
  <p class="intro">SOP-BERT executes a request only when its confidence clears the threshold of the level chosen here (by default its safety threshold, the one that scores best when a confident mistake costs as much as 10 right answers; “bolder” and “more careful” count a mistake as 5 or 20 right answers); below it, it does not execute the request, says why it is not sure and offers <b>Do it anyway</b>. The confidence combines 24 numbers read from the model’s own outputs for that request (the action, the values, who fills each role, the word tags, the cut, the word pieces, how often its action is read right) with <b>whether VSS and the Rules, reading the same request, read it the same way</b> (and whether the Rules had a note about it). Commands and questions have their own threshold. It was fitted on requests of the BERT cutter, on the calibration part of the fresh2 and short3 messages, from out-of-fold scores (the refit of 2026-11-03 for the new SOP-BERT: votes as inputs, a threshold for commands and one for questions); on the test part it scored 33.4 against 29.3 for SOP-BERT’s confidence without the votes, difference +4.0 (95% interval −2.4 to 9.8: not shown either way), confidently wrong on 2.5% of what it executed instead of 3.0%. A held request’s reason first says who reads it differently, then what SOP-BERT itself was unsure of. When VSS has not read the message (still loading, or not available), SOP-BERT uses its confidence without the votes (<code>confidence/sop-bert.json</code>${nconf.url && /[?&]v=/.test(nconf.url) ? `, version <code>${escH(decodeURIComponent(nconf.url.split('v=').pop()))}</code>` : ''}) at the same level. With another cut than the BERT cutter, the model’s cut head runs once more and is read at that cut’s requests. A level other than the default is kept in this browser.</p>
  ${columnLevelsHTML('neural-gate', 'sop', neuralGate || 'cost', 'SOP-BERT uses its confidence without the votes (sop-bert.json)')}`;
}
sbody.addEventListener('click', async ev => {
  const q = ev.target.closest('[data-quick]'); if (q) { closeSheet(); submit(q.dataset.quick); return; }
  const op = ev.target.closest('[data-open]'); if (op) { openSheet('settings', op.dataset.open); return; }
  const hp = ev.target.closest('[data-help]'); if (hp) { openHelp(hp.dataset.help); return; }
  const b = ev.target.closest('[data-sc]');
  if (b) {
    const sc = SCENARIOS.find(x => x.id === b.dataset.sc);
    if (b.dataset.how === 'edit') { const t = $('#sc-text'); t.value = `# ${sc.title}\n` + sc.turns.join('\n'); t.focus(); t.scrollIntoView({ block: 'center' }); return; }
    startScript(sc.title, sc.turns.slice(), b.dataset.how); return;
  }
  const o = ev.target.closest('[data-own]');
  if (o) { const v = $('#sc-text').value, turns = parseScript(v); if (!turns.length) { $('#sc-status').textContent = 'Write at least one line first.'; return; } startScript((v.match(/^\s*#\s*(.+)$/m) || [])[1] || 'Your script', turns, o.dataset.own); return; }
  if (ev.target.id === 'bm-run') runBench(ev.target);
  if (ev.target.id === 'bm-stop') benchStop = true;
  const fx = ev.target.closest('[data-fails]'); if (fx) { const d = document.getElementById('fails-' + fx.dataset.fails); if (d) d.hidden = !d.hidden; }
});
sbody.addEventListener('change', ev => {
  if (ev.target.name === 'cut-strategy') { const id = ev.target.value, def = VF ? VF.DEFAULT_CUT : null; cutPick = id === def ? null : id; store.set(CUT_KEY, cutPick); sysNote(`Requests are now cut by the ${cutLabel(id)}${cutWhyNot(id) ? ` (until it is available, by the Rules segmenter: ${cutWhyNot(id)})` : ''}; every reader reads them.`); if (sub === 'settings') renderSub(); return; }
  if (ev.target.id === 'spell-on') { spellEnabled = ev.target.checked; store.set(SPELL_OFF, spellEnabled ? null : '1'); sysNote(`Spelling check ${spellEnabled ? 'on' : 'off'}.`); return; }
  if (ev.target.id === 'sc-file' && ev.target.files[0]) {
    const f = ev.target.files[0], rd = new FileReader();
    rd.onload = () => { $('#sc-text').value = String(rd.result); $('#sc-status').textContent = `Loaded ${f.name}: ${parseScript(String(rd.result)).length} messages.`; };
    rd.onerror = () => { $('#sc-status').textContent = `Couldn't read ${f.name}.`; };
    rd.readAsText(f); ev.target.value = '';
  }
  const pl = ev.target.closest('[data-plug]');
  if (pl) { setPlug(pl.dataset.plug, pl.checked); sbody.innerHTML = renderPlugins(); }
});

/* ---------------- benchmark: every reader on the same labelled sentences ---------------- */
let benchStop = false, benchSets = null, benchLast = null, benchCut = null;
async function benchIndex() { if (!benchSets) { const r = await fetch(new URL('bench/index.json', document.baseURI)); benchSets = (await r.json()).sets; } return benchSets; }
function renderBench() {
  const sets = benchSets || [];
  const fz = [['rules', 'Rules', true], ['vss', 'VSS', vssState !== 'failed'], ['neural', 'SOP-BERT', !!models]];
  return `<p class="intro">Every reader reads the same labelled sentences against the same gold wires, cut into requests by the ${escH(cutLabel(cutWanted()))} (⋮ › Settings). A message counts when its wire type and every labelled answer match (descriptions are compared by what they describe). Speed is measured here, in this browser, per message, after the model has loaded.</p>
  <h3 class="sub">Test sets</h3>
  ${sets.length ? sets.map(s => `<label class="ck" style="display:flex;margin:4px 0"><input type="checkbox" data-bset="${s.id}" ${['blind', 'broad', 'new_identities'].includes(s.id) ? 'checked' : ''}> ${escH(s.title)} <span class="status">&nbsp;· ${s.n}</span></label>`).join('') : '<p class="intro">Loading the test sets…</p>'}
  <div class="opts" style="margin-top:8px"><label for="bm-limit">Sentences per generated set</label><select id="bm-limit"><option value="50">50</option><option value="100" selected>100</option><option value="300">300</option></select></div>
  <h3 class="sub">Readers</h3>
  ${fz.map(([k, l, ok]) => `<label class="ck" style="display:flex;margin:4px 0"><input type="checkbox" data-bfz="${k}" ${ok ? 'checked' : ''}> ${l}${k === 'neural' && !models ? ' <span class="status">&nbsp;(not loaded yet: see SOP-BERT › Settings)</span>' : ''}</label>`).join('')}
  <div class="actions" style="margin-top:10px"><button type="button" class="btn solid" id="bm-run">Run benchmark</button><button type="button" class="btn" id="bm-stop">Stop</button><span class="status" id="bm-status"></span></div>
  <div id="bm-out">${benchLast || ''}</div>`;
}
const pctl = (xs, p) => { if (!xs.length) return 0; const s = xs.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
async function runBench(btn) {
  benchStop = false; btn.disabled = true;
  const stat = () => $('#bm-status'), say = t => { const s = stat(); if (s) s.textContent = t; };
  const setIds = [...document.querySelectorAll('[data-bset]')].filter(x => x.checked).map(x => x.dataset.bset);
  const fzs = [...document.querySelectorAll('[data-bfz]')].filter(x => x.checked).map(x => x.dataset.bfz);
  const limit = +($('#bm-limit') || { value: 100 }).value;
  if (fzs.includes('vss') && !(await ensureVSS(false))) fzs.splice(fzs.indexOf('vss'), 1);
  if (fzs.includes('neural') && !models) fzs.splice(fzs.indexOf('neural'), 1);
  const res = {}; for (const f of fzs) res[f] = { sets: {}, times: [], fails: [] };
  await vfP; const cst = cutWhyNot(cutWanted()) ? 'rules' : cutWanted();   // every reader reads the units of one cut per sentence (the setting)
  benchCut = cst;
  for (const id of setIds) {
    const meta = benchSets.find(s => s.id === id);
    let rows = await (await fetch(new URL(`bench/${id}.json`, document.baseURI))).json();
    if (!['hand', 'blind', 'broad'].includes(id)) rows = rows.slice(0, limit);
    for (const f of fzs) res[f].sets[id] = { ok: 0, n: 0, keys: 0, kok: 0 };
    for (let i = 0; i < rows.length && !benchStop; i++) {
      const r = rows[i], ctx = { names: r.names, last: [] };
      let units = null; try { units = VF ? await VF.cut(r.text, ctx, cst, { rules: sys, neural: NeuralKit }) : sys.cut(r.text, ctx); } catch (e) { units = sys.cut(r.text, ctx); }
      for (const f of fzs) {
        const t0 = performance.now(); let nodes = [];
        try {
          if (f === 'rules') nodes = (cst === 'rules' ? sys.formalize(r.text, ctx) : sys.formalize(r.text, ctx, { units })).nodes;
          else if (f === 'vss') nodes = (await window.VSSFormalizer.formalize(r.text, ctx, sys.formalize, Object.assign({}, VSS_OPTS, { units }))).nodes;
          else nodes = (await neural.formalize(r.text, ctx, { units })).nodes;
        } catch (e) { nodes = []; }
        const dt = performance.now() - t0; res[f].times.push(dt);
        const sc = BenchCanon.score(nodes, r), S = res[f].sets[id]; S.n++; if (sc.ok) S.ok++;
        for (const [k, p] of Object.entries(sc.per)) { if (k === '_type') continue; S.keys++; if (p.ok) S.kok++; }
        if (!sc.ok && res[f].fails.length < 400) res[f].fails.push({ set: id, text: r.text, miss: Object.entries(sc.per).filter(([, p]) => !p.ok).map(([k, p]) => `${k === '_type' ? 'type' : k}: ${p.got} (want ${p.want})`).join('; ') });
      }
      if (i % 5 === 0) { say(`${meta.title}: ${i + 1} of ${rows.length}`); await sleep(0); }
    }
    if (benchStop) break;
  }
  const size = { rules: rulesBytes(), vss: vssInfo ? vssInfo.bytes : 0, neural: neuralBytes };
  const load = { rules: 0, vss: vssInfo ? vssInfo.loadMs : 0, neural: neuralLoadMs };
  const label = { rules: 'Rules', vss: vssInfo && vssInfo.composer ? `VSS (${vssInfo.worlds.length} micro-worlds)` : `VSS (D ${vssInfo ? vssInfo.D : '?'})`, neural: models ? `SOP-BERT (${neuralNames().join(' + ')})` : 'SOP-BERT' };
  const sets = setIds.filter(id => fzs.some(f => res[f].sets[id] && res[f].sets[id].n));
  const cell = S => S && S.n ? `<b>${(S.ok / S.n * 100).toFixed(0)}%</b> <span class="why">${S.ok}/${S.n} · answers ${(S.kok / Math.max(1, S.keys) * 100).toFixed(0)}%</span>` : '–';
  const html = `<h3 class="sub">Results</h3><p class="intro">Every reader read the requests cut by the ${escH(cutLabel(benchCut))} (⋮ › Settings); the times are the reading only.</p><div class="tbl"><table class="bench"><thead><tr><th>reader</th>${sets.map(id => `<th>${escH(benchSets.find(s => s.id === id).title.split(' (')[0])}</th>`).join('')}<th>model size</th><th>load</th><th>ms / message (median · p95)</th></tr></thead><tbody>
    ${fzs.map(f => `<tr><td><b>${escH(label[f])}</b></td>${sets.map(id => `<td>${cell(res[f].sets[id])}</td>`).join('')}<td>${f === 'rules' ? mb(size[f]) + ' <span class="why">code</span>' : mb(size[f])}</td><td>${f === 'rules' ? '–' : (load[f] / 1000).toFixed(1) + ' s'}</td><td>${pctl(res[f].times, 0.5).toFixed(1)} · ${pctl(res[f].times, 0.95).toFixed(1)}</td></tr>`).join('')}
  </tbody></table></div>
  <p class="intro" style="margin-top:8px">The generated sets (seen, new identities, held-out formulations) come from templates written by the author of the rules, with the rules’ own words, so they favour the rules; the VSS worlds and the neural model are trained on messages written by LLM agents, not on these templates. The blind paraphrases and the broad set were written before any reader was run on them and no reader was tuned on them afterwards; their author also wrote the rules, which favours the rules.</p>
  ${fzs.map(f => `<div class="actions"><button type="button" class="btn" data-fails="${f}">${escH(label[f])}: ${res[f].fails.length} misread message${res[f].fails.length === 1 ? '' : 's'}</button></div><div id="fails-${f}" hidden><div class="tbl"><table class="bench"><tbody>${res[f].fails.map(x => `<tr><td>${escH(x.text)}<div class="why">${escH(x.set)} · ${escH(x.miss)}</div></td></tr>`).join('')}</tbody></table></div></div>`).join('')}`;
  benchLast = html; btn.disabled = false;
  const out = $('#bm-out'); if (out) out.innerHTML = html;
  say(benchStop ? 'Stopped.' : `Done: ${fzs.length} reader${fzs.length > 1 ? 's' : ''} on ${sets.length} set${sets.length > 1 ? 's' : ''}.`);
}
/* ---------------- Help overlay and settings (docs/js/help.js, docs.js; their lists are read from the legend) ---------------- */
/** what the help pages need: the engine (legend, plugins), the canvas drawing code for their small drawings, and facts to quote */
function helpEnv() {
  let nb = neuralBytes; try { if (!nb) nb = nBytesHint(); } catch (e) { }
  const def = VF ? VF.DEFAULT_CUT : 'vss';
  return { K, engine, drawShape, drawEdge, drawGroups, startMessages: START, vssBytes: vssInfo && vssInfo.bytes ? vssInfo.bytes : VSS_HINT, neuralBytes: nb,
    neuralModels: neuralNames(), cut: { current: cutLabel(cutWanted()), def: cutLabel(def) } };
}
/** a capability switch (Settings › Capabilities or Help › Capabilities): the same for every reader */
function setPlug(name, on) {
  for (const rd of READERS) rd.engine.plugin(name).enabled = on;
  const p = engine.plugin(name); sysNote(`${(HelpKit.CAPS[p.name] || p).t || p.title} switched ${p.enabled ? 'on' : 'off'} for every reader`);
}
/** ⋮ › Settings: the two steps that act before every reader */
const renderSettings = () => `<p class="intro">These act before every reader: the spell checker, then the cut into requests. What each one is: <button type="button" class="btn" data-help="spelling">Spell checker</button> <button type="button" class="btn" data-help="cutting">One cut for all readers</button></p>` + cutHelpHTML() + spellHelpHTML()
  + `<div class="help"><h3 class="sub">Help</h3><p class="note">How to use the editor, SOP Lang, the concepts and the architecture are in Help: the <b>?</b> button above the drawing. <button type="button" class="btn" data-help="start">Open Help</button></p></div>`;
/** the cut setting, in ⋮ › Settings (it acts before every reader, so it is not one reader's setting) */
function cutHelpHTML() {
  const want = cutWanted(), def = VF ? VF.DEFAULT_CUT : null;
  const opt = s => { const why = cutWhyNot(s.id), off = s.id === 'bert' && why;   // VSS can be chosen while it loads (the Rules segmenter cuts until then)
    return `<label style="display:flex;gap:8px;align-items:flex-start;margin:0 0 6px;cursor:${off ? 'default' : 'pointer'}${off ? ';opacity:.6' : ''}"><input type="radio" name="cut-strategy" value="${escH(s.id)}" ${s.id === want ? 'checked' : ''} ${off ? 'disabled' : ''}> <span><b>${escH(s.label)}</b>${s.id === def ? ' (default)' : ''}${s.about ? `: ${escH(s.about)}` : ''}${why ? `<br><span class="note">Not available now: ${escH(why)}.</span>` : ''}</span></label>`; };
  return `<div class="help"><h3 class="sub">Cutting into requests</h3>
  <p class="note">A message is cut into requests once, and Rules, VSS and SOP-BERT all read the same requests; the tabs differ only in how each reader reads a request. <b>details</b> under a reply lists the requests and the time the cut took.</p>
  ${cutStrategies().map(opt).join('')}</div>`;
}
/** the spell checker's switch, in ⋮ › Settings (it acts before every reader, so it is not one reader's setting) */
function spellHelpHTML() {
  const P = speller && speller.params;
  const about = P ? `A word that no reader knows is replaced by the most similar known word when the similarity of their letter groups (VSA character n-grams, D ${P.D}) is at least ${P.threshold} and ${P.margin} above the next word. Known words: ${speller.size()} (the VSS worlds’ words, the legend’s values and cue words) and the names on the canvas; ${speller.keepSize()} more words of the training messages are left alone. Never changed: quoted text, numbers, words of one or two letters, the word after “named” or “called”, and capitalised names that are not on the canvas.`
    : 'The spell checker’s vocabulary is not loaded (yet).';
  return `<div class="help"><h3 class="sub">Spelling</h3>
  <label style="display:flex;gap:8px;align-items:flex-start;margin:0 0 6px;cursor:pointer"><input type="checkbox" id="spell-on" ${spellEnabled ? 'checked' : ''}> <span>Correct typos before the readers read a message (“gree circle” → “green circle”). Every reader reads the corrected text; your message shows what was changed, and <b>details</b> shows the typed and the corrected text.</span></label>
  <p class="note">${escH(about)}</p></div>`;
}
const renderPlugins = () => HelpKit.capSwitches(helpEnv());
function renderWorld(rd) {
  const w = rd.world, S = w.state, lines = [];
  for (const s of S.shapes) lines.push(hlNode({ id: s.name, type: 'shape', args: Object.assign({ shape: s.shape, size: K.sizeName(s.size), color: s.color }, s.outline ? { outline: s.outline } : {}, s.label ? { label: s.label } : {}, { at: [s.x, s.y] }) }));
  for (const e of S.edges) lines.push(hlNode({ id: e.id, type: 'edge', args: Object.assign({ from: { ref: e.from }, to: { ref: e.to }, style: e.style, arrow: e.arrow }, e.color ? { color: e.color } : {}, e.label ? { label: e.label } : {}) }));
  for (const r of S.rules) { const a = {}; ['shape', 'size', 'color', 'outline'].forEach(k => { if (r[k]) a[k] = r[k]; }); lines.push(hlNode({ id: r.id, type: 'rule', args: a })); }
  for (const g of S.groups || []) lines.push(hlNode({ id: g.name, type: 'group', args: { members: g.members.map(m => ({ ref: m })) } }));
  if (!lines.length) lines.push('<span class="cm"># empty</span>');
  return `${isReady(rd) ? '' : `<p class="intro">This reader is ${escH(offText(rd).replace(/, did not read this$/, '').replace(/ \(see SOP-BERT › Settings\)$/, ''))}; its Settings subtab shows how to load it.</p>`}<p class="intro">The ${escH(rd.label)} reader’s drawing, written back as SOP Lang wires. This is what a backend such as Datalog, Prolog or Z3 would receive after lowering. ${w.undoStack.length} step${w.undoStack.length === 1 ? '' : 's'} can be undone.</p><pre class="sop">${lines.join('\n')}</pre>`;
}

/* ---------------- composer ---------------- */
const ta = $('#say');
const grow = () => { ta.style.height = 'auto'; ta.style.height = Math.min(128, ta.scrollHeight) + 'px'; };
ta.addEventListener('input', grow);
// the messages typed in this box, oldest first (this page only, like a shell's history). ArrowUp on the first line of the box goes to the
// previous one, ArrowDown on the last line to the next one and, after the newest, back to the draft that was being typed. A recalled
// message can be edited; the edit is kept while walking the history, until a message is sent.
const sent = [], edits = new Map();
let histPos = 0, draft = '';
function sendTyped() {
  const v = ta.value; if (!v.trim()) return;
  if (sent[sent.length - 1] !== v) sent.push(v);
  histPos = sent.length; draft = ''; edits.clear();
  ta.value = ''; grow(); submit(v);
}
function recall(to) {
  if (to < 0 || to > sent.length || to === histPos) return false;
  if (histPos === sent.length) draft = ta.value; else if (ta.value !== sent[histPos]) edits.set(histPos, ta.value); else edits.delete(histPos);
  histPos = to;
  ta.value = to === sent.length ? draft : (edits.has(to) ? edits.get(to) : sent[to]);
  grow(); const n = ta.value.length; ta.setSelectionRange(n, n);
  return true;
}
const touchFirst = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
ta.addEventListener('keydown', ev => {
  if ((ev.key === 'ArrowUp' || ev.key === 'ArrowDown') && !ev.shiftKey && !ev.altKey && !ev.ctrlKey && !ev.metaKey && !ev.isComposing && ta.selectionStart === ta.selectionEnd) {
    const v = ta.value, at = ta.selectionStart;
    const firstLine = v.lastIndexOf('\n', at - 1) === -1, lastLine = v.indexOf('\n', at) === -1;
    if (ev.key === 'ArrowUp' && firstLine && recall(histPos - 1)) ev.preventDefault();
    else if (ev.key === 'ArrowDown' && lastLine && recall(histPos + 1)) ev.preventDefault();
    return;
  }
  if (ev.key !== 'Enter' || ev.shiftKey || ev.isComposing || ev.keyCode === 229) return;
  if (touchFirst && !ev.ctrlKey && !ev.metaKey) return; // phone keyboards: Enter adds a line, the button sends
  ev.preventDefault(); sendTyped();
});
const sendBtn = $('#send-btn');
sendBtn.addEventListener('pointerdown', ev => ev.preventDefault()); // keep the keyboard open
sendBtn.addEventListener('click', () => { sendTyped(); ta.focus({ preventScroll: true }); });

/* Fit the app to the visible area, so the composer stays above the on-screen keyboard. */
const appEl = document.querySelector('.app');
function fitViewport() {
  const vv = window.visualViewport; if (!vv) return;
  const full = window.innerHeight, h = Math.round(vv.height);
  appEl.style.setProperty('--app-h', h + 'px');
  appEl.classList.toggle('kb', full - h > 120 && window.matchMedia('(max-width: 860px)').matches);
  if (vv.offsetTop) window.scrollTo(0, 0);
  msgs.scrollTop = msgs.scrollHeight;
}
if (window.visualViewport) { visualViewport.addEventListener('resize', fitViewport); visualViewport.addEventListener('scroll', fitViewport); fitViewport(); }
// the toolbar buttons are not language: their SOP wires go straight to every loaded reader (each undoes or clears its own drawing)
document.querySelectorAll('[data-say]').forEach(b => b.addEventListener('click', () => submit(b.dataset.say, b.dataset.sop)));
$('#view-btn').addEventListener('click', () => { const narrow = svg.clientWidth < 640, focused = view === 'focus' || (view === 'auto' && narrow); view = focused ? 'all' : 'focus'; renderCanvas(); });
window.addEventListener('resize', () => { if (!drag) renderCanvas(); activeTabInView(); });

/* ---------------- start ---------------- */
updateTabs(); renderCanvas(); setStatus(idleStatus());
botBubble({ text: 'Hi! Tell me what to draw, change or connect, or ask me about the drawing. Three readers (Rules, VSS, SOP-BERT) read every message, each into its own drawing; VSS-BERT does what VSS and SOP-BERT are sure of together, and 3 readers does what all three read the same; the tabs above the canvas switch between them. Tap + for examples and whole scenarios, ? for help, ⋮ for settings.' });
/* the opening drawing (docs/js/start-diagram.js): a background, two zones, the items and their texts, as SOP Lang wires run by every
   reader's engine (not a message: no reader reads it); then its first question is sent as a message */
const START = [StartDiagram.SOP];
for (const rd of READERS) rd.engine.run(K.parse(StartDiagram.SOP));
renderCanvas(); updateTabs();
StartDiagram.MESSAGES.forEach(t => submit(t));
queue.then(() => { READERS.forEach(rd => { rd.world.undoStack = []; }); renderSopBar(); });
// the Help overlay: opened by the ? button, by a data-help button, or by a link #help/<page> (also on reload)
DocsKit.init({ env: helpEnv, say: t => submit(t), onPlug: (name, on) => { setPlug(name, on); if (!sheet.hidden && sheetTab === 'plugins') sbody.innerHTML = renderPlugins(); } });
ensureVSS();              // same site: no button, no question
checkNeural();            // our neural model loads by itself (from the browser cache when it is there)
})();
