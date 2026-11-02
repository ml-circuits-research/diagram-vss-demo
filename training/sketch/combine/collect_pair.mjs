// combine/collect_pair.mjs: the records of COMBINE.md, in ONE node process (one heavy process at a time on this machine): for every message,
//   1. SOP-BERT (MODEL, default docs/model/neural/sop-bert = arm BERT-G) on its own cut (its span head): records sop_own.jsonl;
//   2. VSS (the default registry docs/model/micro/registry.json = arm VSS-G, its context filler) on its own cut: records vss_own.jsonl;
//   3. the same VSS reader on the units of the SOP-BERT cut (the demo's BERT-cut path, docs/js/vss-composer.js cutUnits "bert": the span
//      head's units with c1 > c0, given to the composer as opts.units): records vss_bert.jsonl.
// Copies: the SOP part is fresh2/collect_sop.mjs (signals, heads, outcomes, PAIR=value pairing unchanged; only the "own" cut); the VSS part is
// fresh2/collect_vss.mjs (features, outcomes, the tally check unchanged). Additions:
//   - every produced request also carries `got` (its canonical values, bench-canon.js canon: what the outcome is decided on), `span` (the
//     [c0, c1] unit the pairing uses) and `args0` ({action, name, count} of its raw args: the "created before" rule of layer_common.mjs);
//   - vss_bert: the VSS features are computed as in collect_vss.mjs (the world cutter is still decoded over the message for the candidate
//     worlds, CUT_SHARED.md), then cut_start / cut_end are REPLACED by the SOP-BERT cut head's probabilities at the unit's edges, with the
//     definitions of collect_sop.mjs (cut_start = P(B) of the unit's first word; cut_end = 1 - P(I) of the word after its last, 1 at the end of
//     the text); the VSS cutter's values are kept as cut_start_vss / cut_end_vss (not used by the fit). COMBINE.md states this choice.
//   [MODEL=<folder>] [THREADS=n] [LIMIT=n] [IDS=<file>] node training/sketch/combine/collect_pair.mjs <out dir> <set> <dir> [<dir> ...]
// Needs `npm install` in training/laptop (@huggingface/transformers).
import { readFileSync, readdirSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, basename, resolve } from "node:path";

const [outDir, set, ...dirs] = process.argv.slice(2);
if (!outDir || !set || !dirs.length) { console.error("usage: collect_pair.mjs <out dir> <set> <dir>..."); process.exit(2); }
mkdirSync(outDir, { recursive: true });
process.env.LLM_SCORE_LIB = "1"; process.env.SEG ||= "composer"; process.env.PAIR ||= "value";
const { vssFormalize, tally, logic: K } = await import("../llm_score.mjs");
const { Composer, nextContext } = await import("../../../docs/js/vss-composer.js");
const { Context } = await import("../../../docs/js/vss-context.js");
const FRONT = await import("../../../docs/js/front.js");
const { canon, canonWant } = await import("../../../docs/js/bench-canon.js");
const { pairValue } = await import("../layer_common.mjs");
const require = createRequire(import.meta.url);

// ================================================================== VSS: observe the composer (collect_vss.mjs), plus the given units
let ST = [];
const origStep = Context.prototype.step;
Context.prototype.step = function (raw, c0, c1, opts) { const r = origStep.apply(this, arguments); if (!(opts && opts.dry)) ST.push({ c0, c1, r }); return r; };
const origF = Composer.prototype.formalizeCutter;
Composer.prototype.formalizeCutter = function (text, ctx = {}, opts = {}) {
  ST = [];
  if (globalThis.__units) opts = Object.assign({}, opts, { units: globalThis.__units });   // the units of the SOP-BERT cut (pass 3)
  const o = origF.call(this, text, ctx, opts), canvas = ctx.names || [];
  const [toks] = FRONT.tokenize(text, canvas), words = toks.map((x) => x[0]);
  const C = this.cutter, cs = FRONT.segDecodeLabels(words, C.segmenter, C.labels).scores;
  const E = this.eventCutter, es = E ? FRONT.segDecodeLabels(words, E.segmenter, E.labels).scores : null;
  globalThis.__obs = { units: o.units, toks, cs, es, C, E, ST: ST.slice() };
  return o;
};

const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
function unitOf(n, text) { if (n.span) return { c0: n.span[0], c1: n.span[1] }; const k = n.src ? text.indexOf(n.src) : -1; return k < 0 ? { c0: 0, c1: 0 } : { c0: k, c1: k + n.src.length }; }
function pairUp(mains, gold, row) {
  const used = new Set(), G = row.wires.map((w, j) => {
    let s0 = -1;
    if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); }
    return { s: s0, e: s0 < 0 ? -1 : s0 + w.span.length, act: gold[j].act, want: gold[j].want, args: w.args };
  });
  const units = mains.map((x) => unitOf(x.n, row.text));
  return pairValue({ text: row.text, gold: G, units, prods: mains.map((x, i) => ({ act: x.act, u: i, rawC: x.got })) });
}
function outcomes(nodes, row) {
  const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
  const gold = row.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args) }));
  const res = mains.map(() => "extra"), gi = mains.map(() => -1);
  for (const [i, j] of pairUp(mains, gold, row)) { gi[i] = j; res[i] = Object.entries(gold[j].want).every(([k, v]) => (mains[i].got[k] ?? "∅") === v) ? "right" : "wrong"; }
  return { mains, res, gi, gold };
}
const args0 = (n) => ({ action: n.args.action ?? null, name: typeof n.args.name === "string" ? n.args.name : null, count: n.args.count ?? null });
const maxOf = (sc, labs) => Math.max(...labs.map((l) => sc[l]));
function vssFeatures(n) {   // collect_vss.mjs features(), unchanged
  const ob = globalThis.__obs, u = (ob.units || []).find((x) => n.span && x.c0 === n.span[0] && x.c1 === n.span[1] && x.vss);
  if (!u) return { w: null, f: { found: 0 } };
  const f = { found: 1 };
  const k = ob.toks.findIndex(([, s]) => s === u.c0), kEnd = ob.toks.findIndex(([, , e]) => e === u.c1);
  const Bw = ob.C.labels.filter((l) => l.startsWith("B-")), IO = ["I", "O"];
  if (k >= 0) f.cut_start = maxOf(ob.cs[k], Bw) - maxOf(ob.cs[k], IO); else f.cut_start = null;
  if (kEnd >= 0 && kEnd + 1 < ob.toks.length) { const s = ob.cs[kEnd + 1]; f.cut_end = Math.max(maxOf(s, Bw), s.O) - s.I; } else f.cut_end = null;
  const cand = u.candidates || [], ch = cand.find((c) => c.world === u.world), others = cand.filter((c) => c.world !== u.world);
  f.world_gap = ch && others.length ? ch.score - Math.max(...others.map((c) => c.score)) : null;
  f.world_rank = cand.length && cand[0].world === u.world ? 1 : 0;
  const tr = u.tried || [], me = tr.find((t) => t.world === u.world), oth = tr.filter((t) => t.world !== u.world && t.event && t.notUnderstood < t.words);
  f.wnu_gap = me && oth.length ? Math.min(...oth.map((t) => t.notUnderstood)) - me.notUnderstood : 0;
  f.tie = 1 / (u.tie || 1);
  f.notu_frac = me && me.words ? me.notUnderstood / me.words : 1;
  if (ob.es && k >= 0) {
    const sc = ob.es[k], B = ob.E.labels.filter((l) => l.startsWith("B-")), lab = "B-" + u.event;
    const best = B.reduce((a, l) => (sc[l] > sc[a] ? l : a), B[0]);
    f.event_agree = best === lab ? 1 : 0;
    f.event_gap = sc[lab] !== undefined ? sc[lab] - Math.max(...B.filter((l) => l !== lab).map((l) => sc[l])) : null;
  } else { f.event_agree = 0; f.event_gap = null; }
  const mg = u.vss.margins || {}, rm = Object.entries(mg).filter(([key]) => key !== "structure" && key !== "event").map(([, v]) => +v).filter(Number.isFinite);
  const all = Object.values(mg).map(Number).filter(Number.isFinite);
  f.event_margin = Number.isFinite(+mg.event) ? +mg.event : null;
  f.role_min = rm.length ? Math.min(...rm) : null;
  f.margin_min = all.length ? Math.min(...all) : 0;
  f.residual = Number.isFinite(+u.vss.residual) ? +u.vss.residual : 0;
  f.unplaced = (u.vss.unplaced || []).length;
  f.abstain = u.vss.status === "ok" ? 0 : 1;
  const st = ob.ST.filter((s) => s.c0 === u.c0 && s.c1 === u.c1).pop(), gaps = st && st.r ? st.r.gaps : [];
  const fills = gaps.filter((g) => g.decision === "fill"), fm = fills.map((g) => g.margin).filter((m) => Number.isFinite(m));
  f.ctx_fill = fills.length;
  f.ctx_margin = fm.length ? Math.min(...fm) : null;
  f.ctx_left = gaps.filter((g) => g.decision === "left").length;
  return { w: u.world, f };
}

// ================================================================== SOP-BERT (collect_sop.mjs, unchanged)
globalThis.SOPKit = K;
const NeuralKit = require("../../../docs/js/neural.js");
const T = await import(pathToFileURL(fileURLToPath(new URL("../../laptop/node_modules/@huggingface/transformers/dist/transformers.node.mjs", import.meta.url))).href);
const MODEL_PATH = resolve(process.env.MODEL || fileURLToPath(new URL("../../../docs/model/neural/sop-bert", import.meta.url)));
if (!existsSync(MODEL_PATH + "/config.json")) throw new Error(`MODEL=${MODEL_PATH}: no config.json`);
const MODEL_DIR = dirname(MODEL_PATH), ZS = basename(MODEL_PATH);
T.env.allowLocalModels = true; T.env.localModelPath = MODEL_DIR + "/";
const OURS = Object.fromEntries(Object.entries(NeuralKit.OURS).map(([id, folder]) => [folder, id]));
const dtype = NeuralKit.dtypeOf(OURS[ZS] || ZS);
const tokenizer = await T.AutoTokenizer.from_pretrained(ZS, { local_files_only: true });
const model = await T.AutoModel.from_pretrained(ZS, { device: "cpu", dtype, local_files_only: true, ...(process.env.THREADS ? { session_options: { intraOpNumThreads: +process.env.THREADS } } : {}) });
let cap = null;
const wrapped = async (inp) => { const o = await model(inp); cap = o; return o; };
wrapped.config = model.config;
const m = Object.assign({ device: "cpu", dtype, qaModel: ZS, enumModel: ZS }, NeuralKit.makeReader(T, tokenizer, wrapped));
const RD = model.config.reader, nA = RD.acts.length, nT = RD.tags.length, maxlen = RD.max_length || 128, cutLen = RD.cut.max_length || 512;
const offs = []; { let o = nA; for (const [, vals] of RD.classes) { offs.push(o); o += vals.length; } }
const clsIdx = Object.fromEntries(RD.classes.map(([k], i) => [k, i]));
const UNK = tokenizer.model && tokenizer.model.unk_token_id != null ? tokenizer.model.unk_token_id : tokenizer.unk_token_id;
if (UNK == null) throw new Error("no unk token id");
let lastReads = null, lastRead = null, lastCut = null, lastTexts = null, lastCutUnits = null;
const origRM = m.readMany, origCut = m.cut;
m.readMany = async (texts) => { cap = null; const r = await origRM(texts); lastReads = r; lastRead = cap; lastTexts = texts; return r; };
m.cut = async (text) => { cap = null; const r = await origCut(text); lastCut = { out: cap, text }; lastCutUnits = r.map(({ c0, c1 }) => ({ c0, c1 })); return r; };
await m.read("draw a circle");

const WORD_RE = /[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu;
const wordsOf = (text) => [...String(text).matchAll(WORD_RE)].map((x) => ({ w: x[0], start: x.index, end: x.index + x[0].length }));
const sp2 = tokenizer.encode("");
function prep(text, limit) {
  const ws = wordsOf(text), ids = [sp2[0]], first = new Map(), pieces = [];
  for (let i = 0; i < ws.length && ids.length < limit - 1; i++) {
    const p = tokenizer.encode(ws[i].w, { add_special_tokens: false }); pieces[i] = p;
    for (let j = 0; j < p.length && ids.length < limit - 1; j++) { if (j === 0) first.set(i, ids.length); ids.push(p[j]); }
  }
  return { ws, first, pieces };
}
const softmax = (a) => { const mx = Math.max(...a), e = a.map((x) => Math.exp(x - mx)), z = e.reduce((x, y) => x + y, 0); return e.map((x) => x / z); };
const argmax = (a) => { let b = 0; a.forEach((x, i) => { if (x > a[b]) b = i; }); return b; };
const top2 = (p) => { const s = p.slice().sort((x, y) => y - x); return [s[0], s[1] ?? 0]; };
const r3 = (x) => Math.round(x * 1000) / 1000;
function cutProbs(text) {
  const p = prep(text, cutLen), cl = lastCut.out.cut_logits.data, res = [];
  p.ws.forEach((w, i) => { const t = p.first.get(i); if (t == null) { res.push({ w, pO: 1, pB: 0, pI: 0 }); return; } const q = softmax(Array.from(cl.slice(t * 3, t * 3 + 3))); res.push({ w, pO: q[0], pB: q[1], pI: q[2] }); });
  return res;
}
// the cut head's two edge signals at a unit [c0, c1] (collect_sop.mjs definitions)
function bertEdges(mw, c0, c1) {
  const i0 = mw.findIndex((x) => x.w.start >= c0), iEnd = mw.reduce((acc, x, i) => (x.w.end <= c1 ? i : acc), -1);
  return { cut_start: i0 >= 0 ? mw[i0].pB : null, cut_end: iEnd >= 0 && iEnd + 1 < mw.length ? 1 - mw[iEnd + 1].pI : 1 };
}
const confSop = (a, R) => {
  const chosen = a.act ? a.act.value : a.kind.value, pa = (R.acts.find((x) => x.label === chosen) || R.acts[0]).score;
  let c = pa;
  for (const [k, r] of Object.entries(a.keys)) { if (r.value == null) continue; c = Math.min(c, r.score); if (r.fill === "written" && R.classes["fill:" + k]) c = Math.min(c, R.classes["fill:" + k].score); }
  return c;
};
function sopFeatures(a, R, si, node, msgCut, nUnits) {   // collect_sop.mjs features(), unchanged
  const b = si, seq = lastRead.seq_logits, K2 = seq.dims[1], row = Array.from(seq.data.slice(b * K2, (b + 1) * K2));
  const nTok = lastRead.token_logits.dims[1], tl = lastRead.token_logits.data;
  const headOf = (key) => row.slice(offs[clsIdx[key]], offs[clsIdx[key]] + RD.classes[clsIdx[key]][1].length);
  const actL = row.slice(0, nA), actP = softmax(actL);
  const chosen = a.act ? a.act.value : a.kind.value, ai = RD.acts.indexOf(chosen);
  const act = a.act ? a.act.value : a.kind.value, keys = RD.act_keys[act] || [];
  const f = {}, h = [];
  const [t1, t2] = top2(actP);
  f.act_p = actP[ai]; f.act_margin = t1 - t2;
  { let H = 0; for (const p of actP) if (p > 0) H -= p * Math.log(p); f.act_negent = 1 - H / Math.log(nA); }
  h.push(["act", actL.map(r3), ai]);
  const p = prep(lastTexts[si], maxlen), ws = p.ws;
  const tagP = ws.map((w, i) => { const t = p.first.get(i); if (t == null) return null; return softmax(Array.from(tl.slice((b * nTok + t) * nT, (b * nTok + t + 1) * nT))); });
  const tagL = ws.map((w, i) => { const t = p.first.get(i); if (t == null) return null; return Array.from(tl.slice((b * nTok + t) * nT, (b * nTok + t + 1) * nT)); });
  const wordsOfSpan = (s) => ws.map((w, i) => i).filter((i) => ws[i].start >= s.start && ws[i].end <= s.end);
  const vp = [], vm = [], np = [], fp = [], fm = [], tp = [], tm = [], dp = [], dm = [];
  let ctx = 0, nRoles = 0;
  for (const k of keys) {
    const r = a.keys[k];
    const cls = clsIdx[k] != null ? headOf(k) : null;
    if (cls) { const pr = softmax(cls), bi = argmax(pr), [x1, x2] = top2(pr); if (bi === 0) np.push(pr[0]); else { vp.push(pr[bi]); vm.push(x1 - x2); } }
    const fk = "fill:" + k;
    let fl = null;
    if (clsIdx[fk] != null) { fl = headOf(fk); const pr = softmax(fl), bi = argmax(pr), [x1, x2] = top2(pr); fp.push(pr[bi]); fm.push(x1 - x2); }
    if (!r || r.value == null) continue;
    nRoles++;
    if (cls) { const pr = softmax(cls); h.push(["value", cls.map(r3), argmax(pr)]); }
    else if (r.fill === "context") { h.push(["fill", fl.map(r3), argmax(fl)]); ctx++; }
    else if (r.fill === "description") {
      h.push(["fill", fl.map(r3), argmax(fl)]);
      for (const k2 of RD.desc_keys) { const dl = headOf("desc:" + k2), pr = softmax(dl), bi = argmax(pr); if (bi !== 0 && r.span.includes(k2 + "=")) { h.push(["desc", dl.map(r3), bi]); dp.push(pr[bi]); const [x1, x2] = top2(pr); dm.push(x1 - x2); } }
    } else {
      const spans = R.spans[k] || [];
      for (const s of spans) for (const i of wordsOfSpan(s)) if (tagP[i]) { const bi = argmax(tagP[i]), [x1, x2] = top2(tagP[i]); h.push(["tag", tagL[i].map(r3), bi]); tp.push(tagP[i][bi]); tm.push(x1 - x2); }
      if (r.fill === "written" && fl) h.push(["fill", fl.map(r3), argmax(fl)]);
    }
  }
  const mn = (a2) => (a2.length ? Math.min(...a2) : null);
  f.val_p_min = mn(vp); f.val_margin_min = mn(vm); f.none_p_min = mn(np);
  f.fill_p_min = mn(fp); f.fill_margin_min = mn(fm); f.ctx_fill = ctx;
  f.tag_p_min = mn(tp); f.tag_margin_min = mn(tm);
  f.desc_p_min = mn(dp); f.desc_margin_min = mn(dm);
  { const ps = tagP.filter(Boolean).map((q) => Math.max(...q)); f.tag_all_min = mn(ps); }
  { let stray = 0; tagP.forEach((q) => { if (!q) return; const t = RD.tags[argmax(q)]; if (t !== "O" && !keys.includes(t.slice(2))) stray++; }); f.tag_stray = stray; }
  const c0 = node.span[0], c1 = node.span[1], mw = msgCut;
  const i0 = mw.findIndex((x) => x.w.start >= c0), iEnd = mw.reduce((acc, x, i) => (x.w.end <= c1 ? i : acc), -1);
  f.cut_start = i0 >= 0 ? mw[i0].pB : null;
  f.cut_end = iEnd >= 0 && iEnd + 1 < mw.length ? 1 - mw[iEnd + 1].pI : 1;
  f.cut_inner_min = i0 >= 0 && iEnd > i0 ? Math.min(...mw.slice(i0 + 1, iEnd + 1).map((x) => x.pI)) : null;
  let pcs = 0, unk = 0, split = 0;
  p.pieces.forEach((pc) => { pcs += pc.length; unk += pc.filter((x) => x === UNK).length; if (pc.length > 1) split++; });
  f.unk_share = pcs ? unk / pcs : 0; f.split_share = ws.length ? split / ws.length : 0; f.n_words = ws.length; f.n_roles = nRoles; f.n_units = nUnits;
  for (const k of Object.keys(f)) if (f[k] != null) f[k] = Math.round(f[k] * 1e6) / 1e6;
  return { f, h, act };
}
const minHeads = (h) => Math.min(...h.map(([, l, i]) => softmax(l)[i]));
const nsys = K.createSystem(), neural = NeuralKit.create(nsys.engine, () => { throw new Error("SOP-BERT called the Rules reader"); });
neural.setModels(m); neural.setStrategy("finetuned");

// ================================================================== the messages
const IDS = process.env.IDS ? new Set(readFileSync(process.env.IDS, "utf8").split(/\s+/).filter(Boolean)) : null;
const LIMIT = process.env.LIMIT ? +process.env.LIMIT : Infinity;
const allRows = [], seenIds = new Set();
for (const d of dirs) {
  const files = readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort();
  const rows = files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)))
    .filter((r) => Array.isArray(r.wires) && (!IDS || IDS.has(r.id)) && !seenIds.has(r.id)).slice(0, LIMIT);
  for (const r of rows) { seenIds.add(r.id); allRows.push(r); }
}
const OUT = { sop_own: `${outDir}/sop_own.jsonl`, vss_own: `${outDir}/vss_own.jsonl`, vss_bert: `${outDir}/vss_bert.jsonl` };
for (const f of Object.values(OUT)) writeFileSync(f, "");
const blank = () => ({ exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0, byAct: {} });
const TOT = { vss_own: blank(), vss_bert: blank(), sop_own: blank() }, MINE = { vss_own: { right: 0, wrong: 0, extra: 0 }, vss_bert: { right: 0, wrong: 0, extra: 0 }, sop_own: { right: 0, wrong: 0, extra: 0 } };
let done = 0, maxDiff = 0, nreq = 0; const t0 = Date.now();
for (const r of allRows) {
  // 1. SOP-BERT, own cut (collect_sop.mjs "own")
  const ctx2 = { names: (r.names || []).slice(), last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null };
  lastReads = null; lastRead = null; lastCut = null; lastCutUnits = null;
  const sr = await neural.formalize(r.text, ctx2, { update: nextContext }), src = new Map(sr.analyses.map((a) => [a.id, a.src]));
  for (const n of sr.nodes) if (n.type !== "mention" && src.has(n.id)) Object.defineProperty(n, "src", { value: src.get(n.id), enumerable: false });
  if (!lastCut || !lastCutUnits) throw new Error(`${r.id}: SOP-BERT did not call its cut head`);
  const msgCut = cutProbs(r.text), bertUnits = lastCutUnits.filter((u) => u.c1 > u.c0);   // cutUnits(text, ctx, "bert"): c1 > c0
  const aIdx = new Map(sr.analyses.map((a, i) => [a.id, i]));
  { const { mains, res, gi, gold } = outcomes(sr.nodes, r);
    const rec = { id: r.id, set, cut: "own", gold: r.wires.length, goldActs: gold.map((g) => g.act), sop: [] };
    mains.forEach((x, i) => {
      const si = aIdx.get(x.n.id), a = sr.analyses[si], R = lastReads[si];
      const c = confSop(a, R), { f, h, act } = sopFeatures(a, R, si, x.n, msgCut, sr.analyses.length);
      maxDiff = Math.max(maxDiff, Math.abs(c - minHeads(h))); nreq++;
      rec.sop.push({ o: res[i], c: +c.toFixed(6), act, pa: x.act, g: gi[i], f, got: x.got, span: [unitOf(x.n, r.text).c0, unitOf(x.n, r.text).c1], args0: args0(x.n) });
      MINE.sop_own[res[i]]++;
    });
    tally(TOT.sop_own, sr.nodes, r);
    appendFileSync(OUT.sop_own, JSON.stringify(rec) + "\n"); }
  // 2. VSS own cut, 3. VSS on the SOP-BERT units (collect_vss.mjs)
  for (const which of ["vss_own", "vss_bert"]) {
    const ctx = { names: (r.names || []).slice(), last: [], spans: ctx2.spans };
    globalThis.__obs = null; globalThis.__units = which === "vss_bert" ? bertUnits : null;
    const vn = vssFormalize(r.text, ctx);
    globalThis.__units = null;
    const rec = { id: r.id, set, cut: which === "vss_bert" ? "bert" : "own", gold: r.wires.length, vss: [] };
    const { mains, res, gi, gold } = outcomes(vn, r);
    rec.goldActs = gold.map((g) => g.act);
    if (which === "vss_bert") rec.units = bertUnits.length;
    mains.forEach((x, i) => {
      const { w, f } = vssFeatures(x.n), sp = unitOf(x.n, r.text);
      if (which === "vss_bert" && f.found) { const e = bertEdges(msgCut, sp.c0, sp.c1); f.cut_start_vss = f.cut_start; f.cut_end_vss = f.cut_end; f.cut_start = e.cut_start; f.cut_end = e.cut_end; }
      rec.vss.push({ o: res[i], w, f, a: x.act, g: gi[i], got: x.got, span: [sp.c0, sp.c1], args0: args0(x.n) });
      MINE[which][res[i]]++;
    });
    tally(TOT[which], vn, r);
    appendFileSync(OUT[which], JSON.stringify(rec) + "\n");
  }
  if (++done % 25 === 0) console.error(`${done} / ${allRows.length} messages, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
for (const k of Object.keys(TOT)) {
  const tot = TOT[k], mine = MINE[k], p = (x) => (x / tot.gold * 100).toFixed(1);
  if (tot.right !== mine.right || tot.wrongAligned !== mine.wrong || tot.extra !== mine.extra) throw new Error(`${k}: outcomes ${JSON.stringify(mine)} differ from tally ${tot.right}/${tot.wrongAligned}/${tot.extra}`);
  console.log(`${set} ${k}: ${done} messages, ${tot.gold} gold · right ${p(tot.right)} · wrong ${p(tot.wrongAligned)} · not done ${p(tot.missed)} · extra ${tot.extra} (checked against tally)`);
}
console.log(`SOP-BERT ${ZS}: ${nreq} produced requests; max |min over recorded heads - confSop| = ${maxDiff.toExponential(2)}; ${((Date.now() - t0) / 1000).toFixed(0)} s`);
