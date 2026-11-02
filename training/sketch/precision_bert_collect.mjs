// precision_bert_collect.mjs: collects, for every request SOP-BERT produces, the signals of PRECISION_BERT.md and the raw head logits
// needed for temperature scaling. Wraps docs/js/neural.js from outside (no reader file is edited); the model call is intercepted to read
// the logits that makeReader already computes. Same units, same outcomes as risk_coverage.mjs (PAIR=value pairing code of llm_score.mjs).
//   node training/sketch/precision_bert_collect.mjs <out.jsonl> <set name> <dir> [<dir> ...]     [IDS=file] [LIMIT=n]
// One line per message: {id, set, gold, sop: [{o, c, act, f: {signal: value|null}, h: [[family, [logits], chosen index]]}]}
//   o  right | wrong | extra;  c  the confidence of risk_coverage.mjs (min probability), recomputed from the heads (h) and checked;
//   h  the heads that enter that minimum, family act | value | fill | tag | desc (for temperature scaling: min over heads of softmax(l / T)[i]).
// Needs `npm install` in training/laptop (@huggingface/transformers).
import { readFileSync, readdirSync, writeFileSync, appendFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const [out, set, ...dirs] = process.argv.slice(2);
if (!out || !set || !dirs.length) { console.error("usage: precision_bert_collect.mjs <out.jsonl> <set> <dir>..."); process.exit(2); }
process.env.LLM_SCORE_LIB = "1"; process.env.SEG ||= "composer"; process.env.PAIR ||= "value";
const { logic: K } = await import("./llm_score.mjs");
const { nextContext } = await import("../../docs/js/vss-composer.js");
const { canon, canonWant } = await import("../../docs/js/bench-canon.js");
const { pairValue } = await import("./layer_common.mjs");
const require = createRequire(import.meta.url);
globalThis.SOPKit = K;
const NeuralKit = require("../../docs/js/neural.js");
const T = await import(pathToFileURL(fileURLToPath(new URL("../laptop/node_modules/@huggingface/transformers/dist/transformers.node.mjs", import.meta.url))).href);
const MODEL_DIR = fileURLToPath(new URL("../../docs/model/neural", import.meta.url)), ZS = "sop-bert";
T.env.allowLocalModels = true; T.env.localModelPath = MODEL_DIR + "/";
const OURS = Object.fromEntries(Object.entries(NeuralKit.OURS).map(([id, folder]) => [folder, id]));
const dtype = NeuralKit.dtypeOf(OURS[ZS] || ZS);
const tokenizer = await T.AutoTokenizer.from_pretrained(ZS, { local_files_only: true });
const model = await T.AutoModel.from_pretrained(ZS, { device: "cpu", dtype, local_files_only: true });
let cap = null;   // the output of the last model call
const wrapped = async (inp) => { const o = await model(inp); cap = o; return o; };
wrapped.config = model.config;
const m = Object.assign({ device: "cpu", dtype, qaModel: ZS, enumModel: ZS }, NeuralKit.makeReader(T, tokenizer, wrapped));
const RD = model.config.reader, nA = RD.acts.length, nT = RD.tags.length, maxlen = RD.max_length || 128, cutLen = RD.cut.max_length || 512;
const offs = []; { let o = nA; for (const [, vals] of RD.classes) { offs.push(o); o += vals.length; } }
const clsIdx = Object.fromEntries(RD.classes.map(([k], i) => [k, i]));
const UNK = tokenizer.model && tokenizer.model.unk_token_id != null ? tokenizer.model.unk_token_id : tokenizer.unk_token_id;
if (UNK == null) throw new Error("no unk token id");

let lastReads = null, lastRead = null, lastCut = null;
const origRM = m.readMany, origCut = m.cut;
m.readMany = async (texts) => { cap = null; const r = await origRM(texts); lastReads = r; lastRead = cap; lastTexts = texts; return r; };
let lastTexts = null;
m.cut = async (text) => { cap = null; const r = await origCut(text); lastCut = { out: cap, text }; return r; };
await m.read("draw a circle");

const WORD_RE = /[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu;
const wordsOf = (text) => [...String(text).matchAll(WORD_RE)].map((x) => ({ w: x[0], start: x.index, end: x.index + x[0].length }));
const sp2 = tokenizer.encode("");
function prep(text, limit) {   // as makeReader's prep
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

// cut head probabilities per word of the whole message: {pB, pO, pI} (words beyond the truncation: O with probability 1)
function cutProbs(text) {
  const p = prep(text, cutLen), cl = lastCut.out.cut_logits.data, res = [];
  p.ws.forEach((w, i) => { const t = p.first.get(i); if (t == null) { res.push({ w, pO: 1, pB: 0, pI: 0 }); return; } const q = softmax(Array.from(cl.slice(t * 3, t * 3 + 3))); res.push({ w, pO: q[0], pB: q[1], pI: q[2] }); });
  return res;
}

const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
function pairUp(mains, gold, row) {
  const used = new Set(), G = row.wires.map((w, j) => {
    let s0 = -1;
    if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); }
    return { s: s0, e: s0 < 0 ? -1 : s0 + w.span.length, act: gold[j].act, want: gold[j].want, args: w.args };
  });
  const units = mains.map((x) => { if (x.n.span) return { c0: x.n.span[0], c1: x.n.span[1] }; const k = x.n.src ? row.text.indexOf(x.n.src) : -1; return k < 0 ? { c0: 0, c1: 0 } : { c0: k, c1: k + x.n.src.length }; });
  return pairValue({ text: row.text, gold: G, units, prods: mains.map((x, i) => ({ act: x.act, u: i, rawC: x.got })) });
}
function outcomes(nodes, row) {
  const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
  const gold = row.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args) }));
  const res = mains.map(() => "extra");
  for (const [i, j] of pairUp(mains, gold, row)) res[i] = Object.entries(gold[j].want).every(([k, v]) => (mains[i].got[k] ?? "∅") === v) ? "right" : "wrong";
  return { mains, res };
}
const confSop = (a, R) => {   // risk_coverage.mjs confSop, unchanged
  const chosen = a.act ? a.act.value : a.kind.value, pa = (R.acts.find((x) => x.label === chosen) || R.acts[0]).score;
  let c = pa;
  for (const [k, r] of Object.entries(a.keys)) {
    if (r.value == null) continue;
    c = Math.min(c, r.score);
    if (r.fill === "written" && R.classes["fill:" + k]) c = Math.min(c, R.classes["fill:" + k].score);
  }
  return c;
};

// signals and heads of one produced request. si: index of the unit among the message's reads; unit [c0, c1] characters; msgCut: cutProbs of the message
function features(a, R, si, node, msgCut, nUnits, msgWords) {
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
  // the unit's words and their tag probabilities
  const p = prep(R.words ? lastTexts[si] : lastTexts[si], maxlen), ws = p.ws;
  const tagP = ws.map((w, i) => { const t = p.first.get(i); if (t == null) return null; return softmax(Array.from(tl.slice((b * nTok + t) * nT, (b * nTok + t + 1) * nT))); });
  const tagL = ws.map((w, i) => { const t = p.first.get(i); if (t == null) return null; return Array.from(tl.slice((b * nTok + t) * nT, (b * nTok + t + 1) * nT)); });
  const wordsOfSpan = (s) => ws.map((w, i) => i).filter((i) => ws[i].start >= s.start && ws[i].end <= s.end);
  const vp = [], vm = [], np = [], fp = [], fm = [], tp = [], tm = [], dp = [], dm = [];
  let ctx = 0, nRoles = 0;
  for (const k of keys) {
    const r = a.keys[k];
    const cls = clsIdx[k] != null ? headOf(k) : null;
    if (cls) {
      const pr = softmax(cls), bi = argmax(pr), [x1, x2] = top2(pr);
      if (bi === 0) np.push(pr[0]); else { vp.push(pr[bi]); vm.push(x1 - x2); }
    }
    const fk = "fill:" + k;
    let fl = null, fillVal = null;
    if (clsIdx[fk] != null) { fl = headOf(fk); const pr = softmax(fl), bi = argmax(pr), [x1, x2] = top2(pr); fp.push(pr[bi]); fm.push(x1 - x2); fillVal = RD.classes[clsIdx[fk]][1][bi]; }
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
  // cut head, at the unit's characters in the whole message
  const c0 = node.span[0], c1 = node.span[1], mw = msgCut;
  const i0 = mw.findIndex((x) => x.w.start >= c0), iEnd = mw.reduce((acc, x, i) => (x.w.end <= c1 ? i : acc), -1);
  f.cut_start = i0 >= 0 ? mw[i0].pB : null;
  f.cut_end = iEnd >= 0 && iEnd + 1 < mw.length ? 1 - mw[iEnd + 1].pI : 1;
  f.cut_inner_min = i0 >= 0 && iEnd > i0 ? Math.min(...mw.slice(i0 + 1, iEnd + 1).map((x) => x.pI)) : null;
  // text
  let pcs = 0, unk = 0, split = 0;
  p.pieces.forEach((pc) => { pcs += pc.length; unk += pc.filter((x) => x === UNK).length; if (pc.length > 1) split++; });
  f.unk_share = pcs ? unk / pcs : 0; f.split_share = ws.length ? split / ws.length : 0; f.n_words = ws.length; f.n_roles = nRoles; f.n_units = nUnits;
  for (const k of Object.keys(f)) if (f[k] != null) f[k] = Math.round(f[k] * 1e6) / 1e6;
  return { f, h, act };
}
const minHeads = (h) => Math.min(...h.map(([, l, i]) => softmax(l)[i]));

const IDS = process.env.IDS ? new Set(readFileSync(process.env.IDS, "utf8").split(/\s+/).filter(Boolean)) : null;
const LIMIT = process.env.LIMIT ? +process.env.LIMIT : Infinity;
const nsys = K.createSystem(), neural = NeuralKit.create(nsys.engine, () => { throw new Error("SOP-BERT called the Rules reader"); });
neural.setModels(m); neural.setStrategy("finetuned");
writeFileSync(out, "");
let done = 0, maxDiff = 0, nreq = 0; const seen = new Set();
for (const d of dirs) {
  const files = readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort();
  const rows = files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)))
    .filter((r) => Array.isArray(r.wires) && (!IDS || IDS.has(r.id)) && !seen.has(r.id)).slice(0, LIMIT);
  for (const r of rows) {
    seen.add(r.id);
    const ctx2 = { names: (r.names || []).slice(), last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null };
    lastReads = null; lastRead = null; lastCut = null;
    const sr = await neural.formalize(r.text, ctx2, { update: nextContext }), src = new Map(sr.analyses.map((a) => [a.id, a.src]));
    for (const n of sr.nodes) if (n.type !== "mention" && src.has(n.id)) Object.defineProperty(n, "src", { value: src.get(n.id), enumerable: false });
    const aIdx = new Map(sr.analyses.map((a, i) => [a.id, i]));
    const { mains, res } = outcomes(sr.nodes, r);
    const rec = { id: r.id, set, gold: r.wires.length, sop: [] };
    if (mains.length) {
      const msgCut = cutProbs(r.text);
      mains.forEach((x, i) => {
        const si = aIdx.get(x.n.id), a = sr.analyses[si], R = lastReads[si];
        const c = confSop(a, R), { f, h, act } = features(a, R, si, x.n, msgCut, sr.analyses.length, null);
        const c2 = minHeads(h); maxDiff = Math.max(maxDiff, Math.abs(c - c2)); nreq++;
        rec.sop.push({ o: res[i], c: +c.toFixed(6), act, f, h });
      });
    }
    appendFileSync(out, JSON.stringify(rec) + "\n");
    if (++done % 100 === 0) console.error(`${done} messages (${set})`);
  }
}
console.log(`${set}: ${done} messages, ${nreq} produced requests; max |min over recorded heads (rounded logits) - confSop| = ${maxDiff.toExponential(2)}`);
