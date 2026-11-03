// scenes_r3/scene_readers.mjs: the shipped readers on step-by-step scenes, in context, scored per request and replayed through the engine
// (ROOT_CAUSES.md). One node process, one message at a time (2 CPUs).
//
// For every step of a scene (a row of llm_train/scenes_r3/msg_NN.jsonl or llm_bench/scenes_test/batch_NN.jsonl):
//   - the context is the GOLD drawing so far, as the demo builds it (docs/js/ui.js: names = the shapes' names and the groups' names; last =
//     the names the previous step touched, else what it highlighted): the gold wires of the earlier steps are run through docs/js/logic.js
//     (as llm_bench/scenes_test/README.md "Validation by execution": $new = the latest create / duplicate of the step, mention(...) = a
//     mention node, a shrink resize without scale gets scale=0.67);
//   - five readers read the step: Rules (createSystem().formalize, its own cut), VSS (the composer of docs/model/micro/registry.json, its own
//     cut), SOP-BERT (docs/model/neural/sop-bert, its own cut head, signals on), VSS-BERT (ui.js combinedRead, line for line: VSS on the
//     BERT cut's units, docs/js/combined-confidence.js with docs/model/confidence/combined.json) executing everything (vb_all) and at its
//     default gate "cost" (vb_gate: below the threshold, or depending on a request below it, the request is not executed);
//   - every reader's requests are paired with the gold (bench-canon.js canon / canonWant, layer_common.mjs pairValue, PAIR=value: as the
//     collectors fresh2/collect_*.mjs) -> right / wrong / extra; a gold request no request was paired with is "missed";
//   - replay: every reader has its own engine; each step it runs that reader's executed nodes (read in the gold context). At the end the
//     final drawing is compared with the gold drawing (shapes by name: missing, extra, shape, colour, fill, layer, position, size; edges;
//     groups). That is what the owner sees when the readings are executed one after the other.
// Demo scenarios (docs/js/scenarios.js) have no gold: SCENARIOS=house,... reads them with the Rules' reading as the reference (pseudo-gold).
//
//   node training/sketch/scenes_r3/scene_readers.mjs <out dir> <scene jsonl>...
//   SCENARIOS=house,traffic node training/sketch/scenes_r3/scene_readers.mjs <out dir>
// out: <out dir>/steps.jsonl (one record per step: per reader the nodes, the outcomes with got / want, the units), <out dir>/final.json
// (per scene: per reader the drawing diff against the gold).
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, basename, resolve } from "node:path";

const [outDir, ...files] = process.argv.slice(2);
if (!outDir) { console.error("usage: scene_readers.mjs <out dir> <scene jsonl>..."); process.exit(2); }
mkdirSync(outDir, { recursive: true });
const require = createRequire(import.meta.url);
const ROOT = new URL("../../../", import.meta.url);
const K = require(fileURLToPath(new URL("docs/js/logic.js", ROOT)));
globalThis.SOPKit = K;
const { load } = await import(new URL("docs/js/vss.js", ROOT));
const { loadComposer, nextContext } = await import(new URL("docs/js/vss-composer.js", ROOT));
const { canon, canonWant } = await import(new URL("docs/js/bench-canon.js", ROOT));
const { pairValue } = await import(new URL("training/sketch/layer_common.mjs", ROOT));
const CC = await import(new URL("docs/js/combined-confidence.js", ROOT));
const NC = await import(new URL("docs/js/neural-confidence.js", ROOT));
const VC = await import(new URL("docs/js/vss-confidence.js", ROOT));
global.BenchCanon = { canon };
const MODELS = new URL("docs/model/", ROOT), J = (p) => JSON.parse(readFileSync(new URL(p, MODELS), "utf8"));

// ---------------------------------------------------------------- VSS: the demo's composer (vss-formalizer.js loadAll)
const REG = J(process.env.REGISTRY ? resolve(process.env.REGISTRY) : "micro/registry.json");
const cache = new Map();
const loadModel = async (name) => {
  if (cache.has(name)) return cache.get(name);
  const d = new URL(`${name.replace(/\/?$/, "/")}`, MODELS), rf = async (n) => { const b = readFileSync(new URL(n, d)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
  const mm = { vss: await load(null, { readFile: rf, sentenceCandidates: true }), F: existsSync(new URL("front.json", d)) ? JSON.parse(await rf("front.json")) : null };
  cache.set(name, mm); return mm;
};
const comp = await loadComposer(REG, J(REG.cutter), loadModel, { context: J(REG.context || "context/weights.json"), eventCutter: REG.event_cutter ? J(REG.event_cutter) : undefined });
const vssModel = J("confidence/vss.json"), nspec = J("confidence/sop-bert.json"), cspec = J("confidence/combined.json");

// ---------------------------------------------------------------- SOP-BERT (as fresh2/collect_sop.mjs)
const NeuralKit = require(fileURLToPath(new URL("docs/js/neural.js", ROOT)));
const T = await import(pathToFileURL(fileURLToPath(new URL("training/laptop/node_modules/@huggingface/transformers/dist/transformers.node.mjs", ROOT))).href);
const MODEL_PATH = resolve(process.env.MODEL || fileURLToPath(new URL("docs/model/neural/sop-bert", ROOT)));
const ZS = basename(MODEL_PATH);
T.env.allowLocalModels = true; T.env.localModelPath = dirname(MODEL_PATH) + "/";
const OURS = Object.fromEntries(Object.entries(NeuralKit.OURS).map(([id, folder]) => [folder, id]));
const dtype = NeuralKit.dtypeOf(OURS[ZS] || ZS);
const tokenizer = await T.AutoTokenizer.from_pretrained(ZS, { local_files_only: true });
const model = await T.AutoModel.from_pretrained(ZS, { device: "cpu", dtype, local_files_only: true, session_options: { intraOpNumThreads: +(process.env.THREADS || 2) } });
const m = Object.assign({ device: "cpu", dtype, qaModel: ZS, enumModel: ZS }, NeuralKit.makeReader(T, tokenizer, model));
const nsys = K.createSystem(), neural = NeuralKit.create(nsys.engine, () => { throw new Error("SOP-BERT called the Rules reader"); });
neural.setModels(m); neural.setStrategy("finetuned");

// ---------------------------------------------------------------- gold wires -> SOP program (sc3 run_scene.mjs)
const parts = (s) => { const o = []; let d = 0, c = ""; for (const ch of String(s)) { if (ch === "(") d++; if (ch === ")") d--; if (ch === "," && d === 0) { o.push(c); c = ""; } else c += ch; } o.push(c); return o; };
const fmt = (k, v) => {
  if (["items", "items2", "parents"].includes(k)) return String(v).split(",").map((x) => /^[A-Za-z0-9_-]+$/.test(x.trim()) ? x.trim() : JSON.stringify(x.trim())).join(",");
  if (["label", "title"].includes(k)) return JSON.stringify(String(v));
  if (/^-?\d+(\.\d+)?$/.test(String(v)) || /^[A-Za-z_][\w-]*$/.test(String(v)) || /^-?\d+,-?\d+$/.test(String(v))) return String(v);
  if (/^[A-Za-z0-9_$,-]+$/.test(String(v))) return String(v);
  return JSON.stringify(String(v));
};
function goldProgram(wires) {
  const lines = []; let lastCreate = null, mm = 0;
  wires.forEach((w, i) => {
    const id = "w" + (i + 1), a = Object.assign({}, w.args), args = [];
    if (a.action === "resize" && a.scale == null && a.size == null && /\b(shrink|smaller|tinier|reduce|less big)/i.test(w.span || "")) a.scale = "0.67";
    for (const [k, v] of Object.entries(a)) {
      if (typeof v === "string" && (v.includes("mention(") || v.includes("$new")) && ["target", "from", "to", "anchor", "anchor2", "members"].includes(k)) {
        const vals = parts(v).map((p) => { if (p === "$new") return "$" + lastCreate; const q = /^mention\((.*)\)$/.exec(p);
          if (q) { const mid = "m" + (++mm); lines.push(`@${mid} mention ` + q[1].split(",").map((kv) => kv.replace(/^notcolor=/, "notColor=")).join(" ")); return "$" + mid; } return p; });
        args.push(`${k}=${vals.join(",")}`);
      } else args.push(`${k}=${fmt(k, v)}`);
    }
    lines.push(`@${id} ${w.type} ${args.join(" ")}`);
    if (w.type === "command" && ["create", "duplicate"].includes(a.action)) lastCreate = id;
  });
  return lines.join("\n");
}

// ---------------------------------------------------------------- scoring (collect_pair.mjs outcomes, unchanged)
const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
function unitOf(n, text) { if (n.span) return { c0: n.span[0], c1: n.span[1] }; const k = n.src ? text.indexOf(n.src) : -1; return k < 0 ? { c0: 0, c1: 0 } : { c0: k, c1: k + n.src.length }; }
function goldOf(row) {
  const used = new Set();
  return row.wires.map((w) => {
    let s0 = -1;
    if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); }
    return { s: s0, e: s0 < 0 ? -1 : s0 + w.span.length, act: w.want ? w.act : actOf(w.type, w.args), want: w.want || canonWant(w.type, w.args), args: w.args || {} };
  });
}
function outcomes(nodes, row) {
  const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
  const G = goldOf(row), units = mains.map((x) => unitOf(x.n, row.text));
  const pairs = pairValue({ text: row.text, gold: G, units, prods: mains.map((x, i) => ({ act: x.act, u: i, rawC: x.got })) });
  const res = mains.map(() => "extra"), gi = mains.map(() => -1);
  for (const [i, j] of pairs) { gi[i] = j; res[i] = Object.entries(G[j].want).every(([k, v]) => (mains[i].got[k] ?? "∅") === v) ? "right" : "wrong"; }
  const prods = mains.map((x, i) => ({ o: res[i], g: gi[i], act: x.act, got: x.got, span: [units[i].c0, units[i].c1] }));
  const paired = new Set(gi.filter((j) => j >= 0));
  const gold = G.map((g, j) => ({ act: g.act, want: g.want, span: [g.s, g.e], paired: paired.has(j) }));
  return { prods, gold };
}

// ---------------------------------------------------------------- VSS-BERT (ui.js combinedRead, line for line, without the UI parts)
const pa = (x) => `${x.type}:${x.args.action || x.args.ask || ""}`;
const args0 = (x) => ({ action: x.args.action ?? null, name: typeof x.args.name === "string" ? x.args.name : null, count: x.args.count ?? null });
function combined(text, n, v, level) {
  const sop = n.nodes.filter((x) => x.type !== "mention" && x.unit).map((x) => { const sig = NC.signals(n, n.analyses.indexOf(x.unit));
    return { node: x, sig, f: sig ? sig.f : {}, act: sig ? sig.act : (x.args.action || x.args.ask || x.type), pa: pa(x), got: canon(x, n.nodes), span: x.span || [0, 0], args0: args0(x) }; });
  const vss = v.nodes.filter((x) => x.type !== "mention" && x.unit).map((x) => ({ node: x, f: x.unit.signals || {}, world: x.unit.world, pa: pa(x), got: canon(x, v.nodes), span: x.span || [x.unit.c0, x.unit.c1], args0: args0(x),
    conf: x.unit.signals ? VC.confidence(vssModel, x.unit.signals, x.unit.world) : 0 }));
  const msg = { text, cut: "bert", sop, vss, cutWords: n.joint ? n.joint.cut : null };
  const res = CC.combine(cspec, msg, level);
  const items = res.items;
  const R = { sop: { res: n, list: sop }, vss: { res: v, list: vss } };
  items.forEach((it) => { const q = R[it.from].list[it.j]; it.req = q; it.nodes0 = R[it.from].res.nodes.filter((x) => x.unit === q.node.unit); });
  items.sort((a, b) => (a.req.span[0] - b.req.span[0]) || (a.from === "sop" ? -1 : 1));
  const idOf = new Map(); let k = 0;
  for (const it of items) for (const x of it.nodes0) idOf.set(it.from + ":" + x.id, (x.type === "mention" ? "m" : "w") + (++k));
  for (const it of items) if (it.from === "sop" && it.partner >= 0) idOf.set("vss:" + vss[it.partner].node.id, idOf.get("sop:" + it.req.node.id));
  const mapV = (from, val) => K.isRef(val) ? { ref: idOf.get(from + ":" + val.ref) || val.ref } : Array.isArray(val) ? val.map((y) => mapV(from, y)) : val;
  const units = items.map((it) => {
    const nodes = it.nodes0.map((x) => { const y = { id: idOf.get(it.from + ":" + x.id), type: x.type, args: Object.fromEntries(Object.entries(x.args).map(([a, b]) => [a, mapV(it.from, b)])) };
      if (x.span) Object.defineProperty(y, "span", { value: x.span, enumerable: false, configurable: true }); return y; });
    return { item: it, from: it.from, conf: it.conf, execute: it.execute, nodes, dependsOn: [] };
  });
  const owner = new Map(); units.forEach((u) => u.nodes.forEach((x) => owner.set(x.id, u)));
  const refsOf = (val) => K.isRef(val) ? [val.ref] : Array.isArray(val) ? val.flatMap(refsOf) : [];
  for (const u of units) for (const x of u.nodes) for (const r of Object.values(x.args).flatMap(refsOf)) { const o = owner.get(r); if (o && o !== u && !u.dependsOn.includes(o)) u.dependsOn.push(o); }
  for (const u of units) { const off = u.dependsOn.filter((d) => !d.execute); if (u.execute && off.length) u.execute = false; }
  const all = units.flatMap((u) => u.nodes), run = new Set(units.filter((u) => u.execute).flatMap((u) => u.nodes));
  return { nodes: all, executed: all.filter((x) => run.has(x)), threshold: res.threshold,
    items: units.map((u) => ({ from: u.from, conf: +(+u.conf).toFixed(4), execute: u.execute, agree: u.item.agree, partner: u.item.partner, span: u.item.req.span, pa: u.item.req.pa })) };
}

// ---------------------------------------------------------------- the drawing diff
function drawing(S) { const st = S.world.state; return { shapes: st.shapes.map((s) => Object.assign({}, s, K.dims(s))), edges: st.edges.map((e) => Object.assign({}, e)), groups: (st.groups || []).map((g) => ({ name: g.name, members: g.members.slice() })) }; }
const TOL = +(process.env.TOL || 12);
function diff(gold, got) {
  const lc = (x) => String(x).toLowerCase(), G = new Map(gold.shapes.map((s) => [lc(s.name), s])), R = new Map(got.shapes.map((s) => [lc(s.name), s]));
  const out = { gold: gold.shapes.length, got: got.shapes.length, missing: [], extra: [], same: 0, wrong: [], edges: { gold: gold.edges.length, missing: [], extra: [] }, groups: { gold: gold.groups.length, missing: [], wrong: [] } };
  // a shape the reader made under another name (no name, a default name) but with the gold's shape and colour near the gold place counts as
  // "renamed": matched by position before calling it missing / extra
  const unmatchedR = new Set([...R.keys()].filter((k) => !G.has(k)));
  for (const [k, g] of G) {
    let r = R.get(k), renamed = null;
    if (!r) { let best = null, bd = 1e9; for (const k2 of unmatchedR) { const c = R.get(k2), d = Math.hypot(c.x - g.x, c.y - g.y); if (c.shape === g.shape && d < bd) { bd = d; best = k2; } } if (best && bd <= 40) { r = R.get(best); renamed = best; unmatchedR.delete(best); } }
    if (!r) { out.missing.push(g.name); continue; }
    const w = [];
    if (renamed) w.push(`name ${R.get(renamed).name}`);
    for (const key of ["shape", "color", "fill", "layer", "outline", "label"]) if ((g[key] ?? null) !== (r[key] ?? null)) w.push(`${key} ${g[key] ?? "-"}→${r[key] ?? "-"}`);
    const d = Math.hypot(r.x - g.x, r.y - g.y); if (d > TOL) w.push(`pos (${Math.round(g.x)},${Math.round(g.y)})→(${Math.round(r.x)},${Math.round(r.y)})`);
    if (Math.abs(r.w - g.w) > TOL || Math.abs(r.h - g.h) > TOL) w.push(`size ${Math.round(g.w)}x${Math.round(g.h)}→${Math.round(r.w)}x${Math.round(r.h)}`);
    if (w.length) out.wrong.push({ name: g.name, what: w }); else out.same++;
  }
  out.extra = [...unmatchedR].map((k) => R.get(k).name);
  const ek = (e) => `${lc(e.from)}>${lc(e.to)}`, GE = new Set(gold.edges.map(ek)), RE = new Set(got.edges.map(ek));
  out.edges.missing = [...GE].filter((x) => !RE.has(x)); out.edges.extra = [...RE].filter((x) => !GE.has(x));
  const RG = new Map(got.groups.map((g) => [lc(g.name), g]));
  for (const g of gold.groups) { const r = RG.get(lc(g.name)); if (!r) out.groups.missing.push(g.name); else if (r.members.map(lc).sort().join() !== g.members.map(lc).sort().join()) out.groups.wrong.push(g.name); }
  return out;
}
const touchedOf = (S, result) => {
  const touched = [], hl = [];
  (result.steps || []).forEach((st) => { (st.patches || []).forEach((p) => { if (p.op === "add") touched.push(p.shape.name); else if (p.op === "set") touched.push(p.name); else if (p.op === "rename") touched.push(p.to); });
    if (st.highlight) hl.push(...(st.highlight.shapes || [])); });
  const alive = [...new Set(touched)].filter((n) => S.world.find(n));
  return alive.length ? alive : [...new Set(hl)].filter((n) => S.world.find(n));
};
const strip = (nodes) => nodes.map((x) => ({ id: x.id, type: x.type, args: x.args }));

// ---------------------------------------------------------------- scenes
const scenes = [];
if (process.env.SCENARIOS) {
  const SC = require(fileURLToPath(new URL("docs/js/scenarios.js", ROOT)));
  for (const id of process.env.SCENARIOS.split(",")) { const s = SC.find((x) => x.id === id); if (!s) throw new Error(`no scenario ${id}`); scenes.push({ id: "demo-" + id, pseudo: true, steps: s.turns.map((t, i) => ({ id: `demo-${id}-${String(i + 1).padStart(3, "0")}`, text: t })) }); }
}
for (const f of files) { const rows = readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)); scenes.push({ id: basename(dirname(f)) + "/" + basename(f), steps: rows }); }

const READERS = ["rules", "vss", "sop", "vb_all", "vb_gate"];
const STEPS = `${outDir}/steps.jsonl`; writeFileSync(STEPS, "");
const FINAL = [];
const t0 = Date.now(); let nsteps = 0;
for (const sc of scenes) {
  const Sg = K.createSystem(), E = Object.fromEntries(READERS.map((r) => [r, K.createSystem()]));
  let lastG = [];
  const engErr = Object.fromEntries(READERS.map((r) => [r, 0]));
  for (const row of sc.steps) {
    const st = Sg.world.state, names = st.shapes.map((s) => s.name).concat((st.groups || []).map((g) => g.name));
    // PAD_NAMES=n (off by default): n more names on the canvas list (Item1 .. Itemn, shapes the drawing does not hold): the readers on a crowded
    // canvas (the context filler with 60+ names), the gold unchanged
    const pad = Array.from({ length: +(process.env.PAD_NAMES || 0) }, (_, i) => `Item${i + 1}`);
    const ctx = () => ({ names: names.concat(pad), last: lastG.slice() });
    // the readings
    const rules = Sg ? K.createSystem() : null;   // the Rules read on a copy of the gold drawing (they resolve names against their world)
    rules.world.state = JSON.parse(JSON.stringify(st));
    const rr = rules.formalize(row.text, ctx());
    const vv = comp.formalize(row.text, ctx());
    const nn = await neural.formalize(row.text, ctx(), { signals: true });
    const bertUnits = Array.isArray(nn.units) ? nn.units : [];
    const vb = comp.formalize(row.text, ctx(), { units: bertUnits });
    const cAll = combined(row.text, nn, vb, "all"), cGate = combined(row.text, nn, vb, "cost");
    const NODES = { rules: rr.nodes, vss: vv.nodes, sop: nn.nodes, vb_all: cAll.executed, vb_gate: cGate.executed };
    // the gold of this step: the wires (scenes) or the Rules' reading (a demo scenario)
    if (sc.pseudo) row.wires = rr.nodes.filter((x) => x.type !== "mention").map((x) => ({ type: x.type, act: actOf(x.type, x.args), want: canon(x, rr.nodes), span: x.src || "", args: x.args }));
    const rec = { id: row.id, scene: sc.id, text: row.text, names: names.length, last: lastG, gold: row.wires.map((w) => ({ act: w.act || actOf(w.type, w.args), want: w.want || canonWant(w.type, w.args), span: w.span })), r: {} };
    for (const r of READERS) {
      const o = outcomes(NODES[r], row);
      rec.r[r] = Object.assign(o, { nodes: strip(NODES[r]) });
    }
    rec.r.vss.units = (vv.units || []).map((u) => ({ c0: u.c0, c1: u.c1, zone: u.zone, reason: u.reason, world: u.world, event: u.event, status: u.vss && u.vss.status }));
    rec.r.sop.units = bertUnits.map((u) => ({ c0: u.c0, c1: u.c1 }));
    rec.r.vb_all.items = cAll.items; rec.r.vb_gate.items = cGate.items; rec.r.vb_gate.threshold = cGate.threshold;
    // the gold step through the gold engine
    let gr;
    try { gr = sc.pseudo ? Sg.engine.run(rr.nodes) : Sg.engine.run(K.parse(goldProgram(row.wires))); } catch (e) { gr = { ok: false, errors: [{ error: e }], steps: [] }; }
    rec.goldErrors = (gr.errors || []).map((x) => (x.error && x.error.message) || String(x));
    lastG = touchedOf(Sg, gr);
    // the replay of every reader's executed nodes in its own engine
    rec.engine = {};
    for (const r of READERS) {
      let res; try { res = E[r].engine.run(NODES[r]); } catch (e) { res = { errors: [{ error: e }] }; }
      const errs = (res.errors || []).map((x) => (x.error && x.error.message) || String(x)); if (errs.length) { engErr[r] += errs.length; rec.engine[r] = errs; }
    }
    rec.shapes = Object.fromEntries(READERS.map((r) => [r, E[r].world.state.shapes.length])); rec.shapes.gold = Sg.world.state.shapes.length;
    appendFileSync(STEPS, JSON.stringify(rec) + "\n");
    if (++nsteps % 50 === 0) console.error(`${nsteps} steps, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  const G = drawing(Sg), fin = { scene: sc.id, steps: sc.steps.length, engineErrors: engErr, readers: {} };
  for (const r of READERS) fin.readers[r] = diff(G, drawing(E[r]));
  fin.gold = G; fin.drawings = Object.fromEntries(READERS.map((r) => [r, drawing(E[r])]));
  FINAL.push(fin);
  const line = READERS.map((r) => { const d = fin.readers[r]; return `${r} same ${d.same}/${d.gold} miss ${d.missing.length} wrong ${d.wrong.length} extra ${d.extra.length}`; }).join(" | ");
  console.log(`${sc.id}: ${line}`);
}
writeFileSync(`${outDir}/final.json`, JSON.stringify(FINAL));
console.log(`done: ${nsteps} steps in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
