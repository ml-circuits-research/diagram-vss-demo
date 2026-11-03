// combine/failures_vss_bert.mjs: VSS-BERT's failures on the test parts of fresh2 and short3, by kind, with the attributes the root-cause
// analysis needs (training/sketch/combine/VSS_BERT_FAILURES.md). Read-only: it reads the records of combine/collect_pair.mjs (the refit of
// confidence3/refit.sh) and applies the SHIPPED combined reader exactly as the demo does (docs/js/combined-confidence.js combine() with
// docs/model/confidence/combined.json, VSS's own confidence docs/js/vss-confidence.js with docs/model/confidence/vss.json), on the BERT cut.
//   node training/sketch/combine/failures_vss_bert.mjs <records dir> <out.json> <data dir> [<data dir> ...]
// <records dir>: sop_own.jsonl, vss_bert.jsonl, units.jsonl. Output: one row per gold request and per produced request nothing was paired
// with (extras), each with: set (fresh2 / short3), part (cal / test), kind (done_right, executed_wrong, extra_executed, held_right, held_wrong,
// extra_held, missed), the executing reading and the gold, keys that differ, the unit and gold spans, the pairing situation (agree,
// disagree, sop_only, vss_only), the confidence, the threshold, the largest pulls of the 'sop' part, and VSS's reading of the same request.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { pairValue } from "../layer_common.mjs";
import { canonWant } from "../../../docs/js/bench-canon.js";
import * as VC from "../../../docs/js/vss-confidence.js";
import * as CC from "../../../docs/js/combined-confidence.js";

const [RECDIR, OUT, ...DATADIRS] = process.argv.slice(2);
if (!RECDIR || !OUT || !DATADIRS.length) { console.error("usage: failures_vss_bert.mjs <records dir> <out.json> <data dir>..."); process.exit(2); }
const REPO = new URL("../../../", import.meta.url).pathname;
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const ROW = new Map();
for (const d of DATADIRS) for (const f of readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort())
  for (const r of readJ(`${d}/${f}`)) if (Array.isArray(r.wires) && !ROW.has(r.id)) ROW.set(r.id, r);
const isCal = (id) => BigInt("0x" + createHash("sha256").update(id).digest("hex")) % 3n === 0n;
const setOf = (id) => (id.startsWith("s3-") ? "short3" : "fresh2");
const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
function goldOf(row) {   // combined_report.mjs goldOf, copied
  const used = new Set();
  return row.wires.map((w) => {
    let s0 = -1;
    if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); }
    return { s: s0, e: s0 < 0 ? -1 : s0 + w.span.length, act: actOf(w.type, w.args), want: canonWant(w.type, w.args), args: w.args, span: w.span };
  });
}
const COMB = JSON.parse(readFileSync(`${REPO}docs/model/confidence/combined.json`, "utf8")), VSSJ = JSON.parse(readFileSync(`${REPO}docs/model/confidence/vss.json`, "utf8"));
const demoF = (f) => (f.cut_start_vss !== undefined ? { ...f, cut_start: f.cut_start_vss, cut_end: f.cut_end_vss } : f);
const SOP = readJ(`${RECDIR}/sop_own.jsonl`), VSB = readJ(`${RECDIR}/vss_bert.jsonl`), UNITS = new Map(readJ(`${RECDIR}/units.jsonl`).map((u) => [u.id, u]));
const C = COMB.cuts.bert, T = CC.threshold(COMB, "bert");
// the typical percentile of a 'sop' feature: the mean over the calibration requests is ~0.5 for continuous maps (percentile of its own data);
// for a binary feature the share of ones. The pull below is weight x (typical - this request's percentile), as vss-confidence.js pulls.
const typ = (tab) => { if (!tab.binary) return 0.5; const ones = tab.values.reduce((a, y, i) => a + ((tab.sign > 0 ? y > 0 : y > -0.5) ? (i + 1 < tab.values.length ? tab.below[i + 1] : tab.n) - tab.below[i] : 0), 0); return tab.n ? ones / tab.n : 0.5; };
function sopPulls(f) {
  return C.sop.features.map((s) => { const p = CC.percentile(C.sop.tables[s.name], f[s.name]); return { name: s.name, p: +p.toFixed(3), pull: +(s.weight * (typ(C.sop.tables[s.name]) - p)).toFixed(3) }; })
    .filter((x) => x.pull > 0.05).sort((a, b) => b.pull - a.pull).slice(0, 4);
}
const alnum = /[A-Za-z0-9]/;
const ov = (text, a0, a1, b0, b1) => { let k = 0; for (let i = Math.max(a0, b0); i < Math.min(a1, b1); i++) if (alnum.test(text[i])) k++; return k; };
const nal = (text, a0, a1) => ov(text, a0, a1, a0, a1);

const rows = [];
let check = { exec: 0, bad: 0, right: 0, G: 0 };
for (let mi = 0; mi < SOP.length; mi++) {
  const rs = SOP[mi], rv = VSB[mi]; if (rs.id !== rv.id) throw new Error("record order differs");
  const row = ROW.get(rs.id); if (!row) throw new Error(`no data row for ${rs.id}`);
  const G = goldOf(row), text = row.text, part = isCal(rs.id) ? "cal" : "test";
  const S = rs.sop.map((x) => ({ f: x.f, act: x.act, pa: x.pa, got: x.got, span: x.span, args0: x.args0, o: x.o }));
  const V = rv.vss.map((x) => ({ f: demoF(x.f), world: x.w, pa: x.a, got: x.got, span: x.span, args0: x.args0, conf: VC.confidence(VSSJ, demoF(x.f), x.w), bert_edges: { cut_start: x.f.cut_start, cut_end: x.f.cut_end }, o: x.o, rawf: x.f }));
  const res = CC.combine(COMB, { text, cut: "bert", sop: S, vss: V });
  // the combined reader's produced requests, paired with the gold at once (collect_pair.mjs outcomes)
  const prods = res.items.map((it) => (it.from === "sop" ? S[it.j] : V[it.j]));
  const pairs = pairValue({ text, gold: G, units: prods.map((p) => ({ c0: p.span[0], c1: p.span[1] })), prods: prods.map((p, i) => ({ act: p.pa, u: i, rawC: p.got })) });
  const goldOfProd = new Map(pairs.map(([i, j]) => [i, j])), prodOfGold = new Map(pairs.map(([i, j]) => [j, i]));
  const units = (UNITS.get(rs.id) || {}).bert || [];
  const situation = (it) => (it.from === "vss" ? "vss_only" : it.partner < 0 ? "sop_only" : it.agree ? "agree" : "disagree");
  const unitInfo = (sp) => units.filter((u) => ov(text, u.c0, u.c1, sp[0], sp[1]) > 0).map((u) => [u.c0, u.c1]);
  const base = { id: rs.id, set: setOf(rs.id), part, text, names: row.names, n_gold: G.length };
  G.forEach((g, j) => {
    const i = prodOfGold.get(j);
    if (part === "test") check.G++;
    if (i === undefined) {   // missed: nothing of the gold's act was paired with it
      const overl = prods.map((p, k) => ({ p, k })).filter(({ p }) => ov(text, p.span[0], p.span[1], g.s, g.e) > 0);
      const goldUnits = unitInfo([g.s, g.e]);
      const otherGold = G.filter((h, jj) => jj !== j && goldUnits.some(([a, b]) => ov(text, a, b, h.s, h.e) > 0)).length;
      rows.push({ ...base, kind: "missed", gold: g.want, gold_act: g.act, gold_span: g.span, gold_se: [g.s, g.e], units_over_gold: goldUnits.map(([a, b]) => text.slice(a, b)),
        unit_cover: goldUnits.length ? Math.max(...goldUnits.map(([a, b]) => ov(text, a, b, g.s, g.e))) / Math.max(1, nal(text, g.s, g.e)) : 0, other_gold_in_unit: otherGold,
        overlapping_prods: overl.map(({ p, k }) => ({ act: p.pa, got: p.got, from: res.items[k].from, conf: +res.items[k].conf.toFixed(3), exec: res.items[k].execute, paired_gold: goldOfProd.has(k) ? G[goldOfProd.get(k)].act : null })),
        sop_any: S.some((p) => p.pa === g.act), vss_any: V.some((p) => p.pa === g.act) });
      return;
    }
    const it = res.items[i], p = prods[i];
    const keys = [...new Set([...Object.keys(g.want), ...Object.keys(p.got)])].filter((k) => k !== "action" && k !== "ask");
    const differ = Object.entries(g.want).filter(([k, v]) => (p.got[k] ?? "∅") !== v).map(([k, v]) => ({ key: k, got: p.got[k] ?? "∅", gold: v }));
    const ok = differ.length === 0;
    const extraKeys = Object.keys(p.got).filter((k) => !(k in g.want) && k !== "action" && k !== "ask");
    const kind = it.execute ? (ok ? "done_right" : "executed_wrong") : ok ? "held_right" : "held_wrong";
    if (part === "test" && it.execute) { check.exec++; if (ok) check.right++; else check.bad++; }
    const vPartner = it.from === "sop" && it.partner >= 0 ? V[it.partner] : null;
    rows.push({ ...base, kind, from: it.from, situation: situation(it), conf: +it.conf.toFixed(4), threshold: +T.toFixed(4), gold: g.want, gold_act: g.act, got: p.got, differ, extra_keys: extraKeys,
      gold_span: g.span, unit_span: text.slice(p.span[0], p.span[1]), unit_cover: ov(text, p.span[0], p.span[1], g.s, g.e) / Math.max(1, nal(text, g.s, g.e)),
      unit_spill: 1 - ov(text, p.span[0], p.span[1], g.s, g.e) / Math.max(1, nal(text, p.span[0], p.span[1])),
      agree_share: +it.agree_share.toFixed(3), other_conf: +it.other_conf.toFixed(3), sop_differ: it.differ, vss_got: vPartner ? vPartner.got : null,
      vss_right: vPartner ? Object.entries(g.want).every(([k, v]) => (vPartner.got[k] ?? "∅") === v) : null,
      ctx_fill: p.f && p.f.ctx_fill, pulls: it.from === "sop" ? sopPulls(Object.assign({}, p.f, { agree: it.agree, agree_share: it.agree_share, other_conf: it.other_conf })) : null });
  });
  res.items.forEach((it, i) => {
    if (goldOfProd.has(i)) return;
    const p = prods[i];
    if (part === "test" && it.execute) { check.exec++; check.bad++; }
    const overGold = G.filter((g) => ov(text, p.span[0], p.span[1], g.s, g.e) > 0).map((g) => ({ act: g.act, want: g.want, span: g.span, taken: prodOfGold.has(G.indexOf(g)) }));
    rows.push({ ...base, kind: it.execute ? "extra_executed" : "extra_held", from: it.from, situation: situation(it), conf: +it.conf.toFixed(4), threshold: +T.toFixed(4), got: p.got, act: p.pa,
      unit_span: text.slice(p.span[0], p.span[1]), gold_over_unit: overGold, pulls: it.from === "sop" ? sopPulls(Object.assign({}, p.f, { agree: it.agree, agree_share: it.agree_share, other_conf: it.other_conf })) : null });
  });
}
console.error(`test part: ${check.G} gold, executed ${check.exec} (${check.right} right, ${check.bad} wrong or extra), done right ${(100 * check.right / check.G).toFixed(1)}% (combined.json test: executed ${C.levels.cost.test_executed}, done right ${(100 * C.levels.cost.test_done_right).toFixed(1)}%)`);
writeFileSync(OUT, JSON.stringify(rows));
const tally = {}; for (const r of rows) { const k = `${r.part}/${r.set}/${r.kind}`; tally[k] = (tally[k] || 0) + 1; }
console.log(JSON.stringify(tally, null, 1));
