// rules_vs/analyze.mjs: per-request statuses of Rules / VSS-G / SOP-BERT-G (executing everything and gated at the demo's "cost" threshold)
// from the records of run.sh, and the tables of RULES_VS_LEARNED.md.   REC=<records dir> node analyze.mjs <out.json>
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
const REPO = new URL("../../../", import.meta.url).pathname, REC = process.env.REC;
const VC = await import(REPO + "docs/js/vss-confidence.js"), NC = await import(REPO + "docs/js/neural-confidence.js");
const vModel = JSON.parse(readFileSync(REPO + "docs/model/confidence/vss.json", "utf8")), bModel = JSON.parse(readFileSync(REPO + "docs/model/confidence/sop-bert.json", "utf8"));
const tV = VC.threshold(vModel, "cost"), tB = NC.threshold(bModel, "cost");
const SETS = { llm_short: ["training/sketch/llm_train/sonnet_short", "training/sketch/llm_train/haiku_short"], fresh2: ["a", "b", "c", "d"].map((x) => "training/sketch/llm_bench/fresh2/opus_" + x) };
for (const s of ["help", "hand", "blind", "broad", "seen", "new_identities", "heldout_formulations"]) SETS[s] = ["training/sketch/rules_vs/data/" + s];
const jl = (p) => readFileSync(p, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const out = [];
for (const [set, dirs] of Object.entries(SETS)) {
  const rows = new Map();
  for (const d of dirs) for (const f of readdirSync(REPO + d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort()) for (const r of jl(REPO + d + "/" + f)) if (Array.isArray(r.wires) && !rows.has(r.id)) rows.set(r.id, { ...r, src: d.split("/").pop() });
  const V = new Map(jl(`${REC}/vss_${set}.jsonl`).map((r) => [r.id, r])), R = new Map(jl(`${REC}/rules_${set}_own.jsonl`).map((r) => [r.id, r])), S = new Map(jl(`${REC}/sop_${set}_own.jsonl`).map((r) => [r.id, r]));
  for (const [id, row] of rows) {
    const v = V.get(id), r = R.get(id), s = S.get(id); if (!v || !r || !s) throw new Error("missing record " + set + " " + id);
    const gold = row.wires.map((w, j) => ({ act: v.goldActs[j], span: w.span || null, args: w.args || null }));
    const per = (list, getO, getC) => gold.map((_, j) => { const it = list.find((x) => x.g === j); if (!it) return { st: "nd" }; const o = getO(it); return { st: o, c: getC ? getC(it) : null, pa: it.pa || it.a }; });
    const vl = v.vss.map((x) => ({ ...x, conf: VC.confidence(vModel, x.f, x.w) })), sl = s.sop.map((x) => ({ ...x, conf: NC.confidence(bModel, x.f, x.act) }));
    const rec = { set, id, text: row.text, src: row.src, names: row.names, cat: row.cat || null, gold,
      rules: { per: per(r.rules, (x) => x.o), extras: r.rules.filter((x) => x.g < 0).map((x) => x.pa) },
      vss: { per: per(vl, (x) => x.o, (x) => x.conf), extras: vl.filter((x) => x.g < 0).map((x) => ({ a: x.a, c: x.conf })) },
      sop: { per: per(sl, (x) => x.o, (x) => x.conf), extras: sl.filter((x) => x.g < 0).map((x) => ({ a: x.pa, c: x.conf })) } };
    out.push(rec);
  }
}
writeFileSync(process.argv[2], JSON.stringify({ tV, tB, rows: out }));
console.log("rows", out.length, "tV", tV, "tB", tB);
