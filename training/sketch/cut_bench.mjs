// cut_bench.mjs: the readers on the units of each CUT (owner's decision 2026-11-02: Rules, VSS and Neural read the units of one cut, chosen
// in the demo's settings; docs/js/vss-composer.js cutUnits). For each cutting strategy (rules = the rules' segmenter, logic.js rulesCut;
// vss = the world cutter cutter_worlds7s.json; bert = the span head of a joint neural model, only with BERT_MODEL) and each set:
//   - the per-request score of Rules and of VSS reading that cut's units: right / wrong / not done (% of the gold requests) + extra
//     (llm_score.mjs scoreMessage with PAIR=value, imported with LLM_SCORE_LIB=1);
//   - the cut's own errors against the gold spans: lost (a gold span no unit overlaps), merged (a unit that overlaps 2+ gold spans),
//     split (a gold span that 2+ units overlap), extra units (a unit that overlaps no gold span). Overlap = at least one letter or digit
//     in common. Gold spans: the annotated `span` of every wire (the sample); a one-request row of the short sets is one span, the whole
//     text; the short rows with several requests have no spans and are left out of the cut errors only.
// The reader that owns a cut reads it as the demo did before the setting existed: Rules with the rules cut is sys.formalize(text, ctx)
// (its own path, today's numbers); VSS with the vss cut is checked against the composer's own path (comp.formalize without units): the
// line "identical" counts the messages whose wires (text, span) and units differ (expected 0).
// Context rule between requests: the sample uses llm_score.mjs's (scorerUpdate, a copy below), the short sets the demo's (nextContext),
// as llm_score.mjs and short_bench/short_bench.mjs do, so the two reproduce their numbers.
// node cut_bench.mjs [--sample <dir with the 9 folders>] [--out <file.json>]
//   SETS=sample,short (default both) · LIMIT=<n> messages per folder / set (a quick check) · STRATS=rules,vss[,bert]
//   BERT_MODEL=<folder of a joint model with a span head (config.json reader.cut)>: adds the bert cut (transformers.js, q8 by neural.js dtypeOf)
process.env.LLM_SCORE_LIB = "1"; process.env.PAIR = "value"; process.env.SEG = "composer";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, basename } from "node:path";
import { performance } from "node:perf_hooks";
const REPO = new URL("../../", import.meta.url);
const L = await import("./llm_score.mjs");
const { load } = await import("../../docs/js/vss.js");
const { loadComposer, nextContext, cutUnits } = await import("../../docs/js/vss-composer.js");
const require = createRequire(import.meta.url);
const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const SAMPLE = arg("--sample", "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/planA/sampleF");
const OUT = arg("--out", null), LIMIT = process.env.LIMIT ? +process.env.LIMIT : Infinity;
const SETS = (process.env.SETS || "sample,short").split(",");

// ---- the composer, as short_bench.mjs and llm_score.mjs load it (the default registry)
const MODELS = new URL("docs/model/", REPO), J = (p) => JSON.parse(readFileSync(new URL(p, MODELS), "utf8"));
const REG = J("micro/registry.json"), cache = new Map();
const loadModel = async (name) => {
  if (cache.has(name)) return cache.get(name);
  const d = new URL(`${name}/`, MODELS), rf = async (n) => { const b = readFileSync(new URL(n, d)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
  const m = { vss: await load(null, { readFile: rf, sentenceCandidates: true }), F: existsSync(new URL("front.json", d)) ? JSON.parse(await rf("front.json")) : null };
  cache.set(name, m); return m;
};
const comp = await loadComposer(REG, J(REG.cutter), loadModel, { context: J(REG.context), eventCutter: J(REG.event_cutter) });
const sys = L.logic.createSystem();

// ---- the bert cut (optional): a joint model with a span head, loaded as training/laptop/neural_score.mjs loads it
let neural = null;
if (process.env.BERT_MODEL) {
  globalThis.SOPKit = L.logic;                                         // neural.js is a browser IIFE that reads the global SOPKit
  const NeuralKit = require("../../docs/js/neural.js"), Tm = await import(createRequire(new URL("../laptop/package.json", import.meta.url)).resolve("@huggingface/transformers")), T = Tm.env ? Tm : Tm.default;   // installed in training/laptop
  const dir = process.env.BERT_MODEL.replace(/\/$/, ""), name = basename(dir);
  T.env.allowLocalModels = true; T.env.localModelPath = dirname(dir) + "/";
  const dtype = NeuralKit.dtypeOf(name);
  const tokenizer = await T.AutoTokenizer.from_pretrained(name, { local_files_only: true });
  const model = await T.AutoModel.from_pretrained(name, { device: "cpu", dtype, local_files_only: true });
  const m = NeuralKit.makeReader(T, tokenizer, model);
  if (!m.cut) throw new Error(`BERT_MODEL=${dir}: this model has no span head (config.json reader.cut)`);
  neural = { canCut: () => true, cut: (text) => m.cut(text) };
  console.log(`bert cut: ${dir} (${dtype})`);
}
const STRATS = (process.env.STRATS || (neural ? "rules,vss,bert" : "rules,vss")).split(",");
if (STRATS.includes("bert") && !neural) throw new Error("STRATS has bert: set BERT_MODEL=<joint model folder with a span head>");
const ENV = { rules: sys, composer: comp, neural };

// llm_score.mjs scorerUpdate (not exported there): the context rule of the sample scoring
function scorerUpdate(c, main) {
  if (main && main.args) {
    if (main.args.action === "create") { if (main.args.name && !main.args.count) c.refs.set(String(main.args.name).toLowerCase(), { ref: main.id }); c.last = [{ ref: main.id }]; }
    else if (main.args.target != null && !Array.isArray(main.args.target)) c.last = [main.args.target];
  }
}

// ---- the sets: [{set, rows: [{text, names, wires, spans: [[s, e]] | null}]}]
function goldSpans(r) {      // the annotated spans located in the text (the first unused occurrence, as llm_score.mjs pairUp does)
  if (!r.wires.every((w) => w.span)) return null;
  const used = new Set();
  return r.wires.map((w) => {
    let s0 = -1, from = 0;
    for (;;) { const k = r.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; }
    if (s0 < 0) s0 = r.text.indexOf(w.span); used.add(s0);
    return s0 < 0 ? null : [s0, s0 + w.span.length];
  }).filter(Boolean);
}
const sets = [];
if (SETS.includes("sample")) {
  const rows = [];
  for (const d of readdirSync(SAMPLE).sort()) {
    const files = readdirSync(`${SAMPLE}/${d}`).filter((f) => f.endsWith(".jsonl")).sort();
    const rs = files.flatMap((f) => readFileSync(`${SAMPLE}/${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l))).slice(0, LIMIT);
    for (const r of rs) rows.push({ id: r.id, text: r.text, names: r.names || [], wires: r.wires, spans: goldSpans(r), ctx: { names: r.names || [], last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null } });
  }
  sets.push({ set: "sample", group: "sample", update: scorerUpdate, rows });
}
if (SETS.includes("short")) {
  for (const id of ["hand", "blind", "broad", "seen", "new_identities", "heldout_formulations"]) {
    const CASE = { tofront: "toFront", toback: "toBack" }, fix = (a) => (a && CASE[a.action] ? { ...a, action: CASE[a.action] } : a);
    const rows = JSON.parse(readFileSync(new URL(`docs/bench/${id}.json`, REPO), "utf8")).slice(0, LIMIT).map((r) => {
      const wires = (r.wires ? r.wires.map((w) => ({ type: w.type, args: w.gold ?? w.args })) : [{ type: r.type, args: r.gold ?? r.args }]).map((w) => ({ type: w.type, args: fix(w.args) }));
      return { text: r.text, names: r.names || [], wires, spans: wires.length === 1 ? [[0, r.text.length]] : null, ctx: { names: r.names || [], last: [] } };
    });
    sets.push({ set: id, group: "short", update: nextContext, rows });
  }
}

// ---- cut errors against the gold spans
const ALNUM = /[A-Za-z0-9]/;
const meets = (text, a0, a1, b0, b1) => { const s = Math.max(a0, b0), e = Math.min(a1, b1); return e > s && ALNUM.test(text.slice(s, e)); };
function cutErrors(text, units, spans) {
  const per = spans.map(([s, e]) => units.filter((u) => meets(text, u.c0, u.c1, s, e)).length);
  const perU = units.map((u) => spans.filter(([s, e]) => meets(text, u.c0, u.c1, s, e)).length);
  return { gold: spans.length, units: units.length, lost: per.filter((n) => n === 0).length, split: per.filter((n) => n >= 2).length,
    merged: perU.filter((n) => n >= 2).length, extraUnits: perU.filter((n) => n === 0).length };
}

// ---- run
const blank = () => ({ right: 0, wrong: 0, missed: 0, extra: 0, gold: 0 });
const add = (T, s) => { T.right += s.right; T.wrong += s.wrongAligned; T.missed += s.missed; T.extra += s.extra; T.gold += s.gold; };
const sig = (nodes) => JSON.stringify(nodes.map((n) => [n.id, n.type, n.args, n.src || null, n.span || null, n.world || null]));
const usig = (units) => JSON.stringify(units.map((u) => { const { noWorldSignal, ...x } = u; return x; }));
const R = {};
for (const S of sets) {
  const res = R[S.set] = { group: S.group, n: S.rows.length, strats: {} };
  for (const st of STRATS) {
    const X = res.strats[st] = { rules: blank(), vss: blank(), cut: { gold: 0, units: 0, lost: 0, split: 0, merged: 0, extraUnits: 0, rows: 0 }, cutMs: 0, noWorldSignal: 0, identical: st === "vss" ? { same: 0, differ: 0, examples: [] } : undefined };
    for (const r of S.rows) {
      const t0 = performance.now(), units = await cutUnits(r.text, { names: r.names, last: [] }, st, ENV); X.cutMs += performance.now() - t0;
      const rn = st === "rules" ? sys.formalize(r.text, r.ctx).nodes : sys.formalize(r.text, r.ctx, { units }).nodes;
      const v = comp.formalize(r.text, { names: r.names, last: [] }, { update: S.update, units });
      X.noWorldSignal += v.units.filter((u) => u.noWorldSignal).length;
      if (st === "vss") {      // the composer's own path: the same output?
        const own = comp.formalize(r.text, { names: r.names, last: [] }, { update: S.update });
        const same = sig(own.nodes) === sig(v.nodes) && usig(own.units.map(({ ms, ...u }) => u)) === usig(v.units.map(({ ms, ...u }) => u)) && JSON.stringify(own.notes) === JSON.stringify(v.notes);
        if (same) X.identical.same++; else { X.identical.differ++; if (X.identical.examples.length < 5) X.identical.examples.push(r.text); }
      }
      const row = { text: r.text, names: r.names, wires: r.wires };
      add(X.rules, L.scoreMessage(rn, row)); add(X.vss, L.scoreMessage(v.nodes, row));
      if (r.spans) { const e = cutErrors(r.text, units, r.spans); X.cut.rows++; for (const k of ["gold", "units", "lost", "split", "merged", "extraUnits"]) X.cut[k] += e[k]; }
    }
    console.error(`${S.set} ${st}: ${S.rows.length} messages`);
  }
}
// short ALL
if (SETS.includes("short")) {
  const ids = Object.keys(R).filter((k) => R[k].group === "short"), A = R.short_all = { group: "short", n: 0, strats: {} };
  for (const st of STRATS) {
    const X = A.strats[st] = { rules: blank(), vss: blank(), cut: { gold: 0, units: 0, lost: 0, split: 0, merged: 0, extraUnits: 0, rows: 0 }, cutMs: 0, noWorldSignal: 0, identical: st === "vss" ? { same: 0, differ: 0, examples: [] } : undefined };
    for (const id of ids) {
      const Y = R[id].strats[st];
      for (const f of ["rules", "vss"]) for (const k of Object.keys(X[f])) X[f][k] += Y[f][k];
      for (const k of Object.keys(X.cut)) X.cut[k] += Y.cut[k];
      X.cutMs += Y.cutMs; X.noWorldSignal += Y.noWorldSignal;
      if (Y.identical) { X.identical.same += Y.identical.same; X.identical.differ += Y.identical.differ; X.identical.examples.push(...Y.identical.examples.slice(0, 2)); }
    }
  }
  for (const id of ids) A.n += R[id].n;
}

// ---- report
const pc = (x, g) => (x / Math.max(1, g) * 100).toFixed(1);
const cell = (T) => `${pc(T.right, T.gold)} / ${pc(T.wrong, T.gold)} / ${pc(T.missed, T.gold)} +${T.extra}`;
console.log(`\ncut_bench: per gold request, right / wrong / not done (%) +extra; PAIR=value; registry ${REG.cutter}; strategies ${STRATS.join(", ")}`);
for (const [set, res] of Object.entries(R)) {
  const g = res.strats[STRATS[0]].rules.gold;
  console.log(`\n${set}: ${res.n} messages, ${g} gold requests`);
  console.log(`  ${"reader \\ cut".padEnd(14)}${STRATS.map((s) => s.padEnd(28)).join("")}`);
  for (const f of ["rules", "vss"]) console.log(`  ${(f === "rules" ? "Rules" : "VSS").padEnd(14)}${STRATS.map((s) => cell(res.strats[s][f]).padEnd(28)).join("")}`);
  for (const s of STRATS) {
    const C = res.strats[s].cut, X = res.strats[s];
    console.log(`  cut ${s.padEnd(6)} units ${C.units} for ${C.gold} gold spans (${C.rows} messages with spans): lost ${C.lost} · merged ${C.merged} · split ${C.split} · extra units ${C.extraUnits} · cut ${(X.cutMs / res.n).toFixed(2)} ms/message` +
      ` · VSS units with no world signal ${X.noWorldSignal}` + (X.identical ? ` · identical to the composer's own path: ${X.identical.same} of ${X.identical.same + X.identical.differ}` : ""));
  }
}
if (OUT) writeFileSync(OUT, JSON.stringify(R, null, 1));
