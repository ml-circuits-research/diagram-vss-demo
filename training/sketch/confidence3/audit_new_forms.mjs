// confidence3/audit_new_forms.mjs: does the code that COMBINES and MEASURES the readers treat the forms of 2026-11-02 right?
// (training/sketch/confidence3/NEW_FORMS_AUDIT.md). For every gold request of the given folders:
//   1. gold vs gold: the gold wire turned into SOP nodes (mentions and $new as reference wires) is read by bench-canon.js canon, and must
//      equal canonWant of the same gold; two copies of the message's requests must pair one to one and agree in combined-confidence.js
//      agreement (VSS-BERT) and in vote-confidence.js agreementOf (canon and engine modes);
//   2. variants of the new forms (target order, "every shape" written three ways, items order, help keys, label "" / null, arrow ends
//      swapped, quantifier, pairing, one value changed, one key dropped or added): each variant is read as the reading of one reader
//      against the gold as the other, and the verdicts of the agreement (vote3 engine mode, VSS-BERT) and of the scorer (every gold key
//      equal: the collectors' "right") are compared with what docs/js/logic.js DOES: the message is run on two drawings (the message's
//      names as shapes, arrows between neighbours one way; the same with arrows both ways and a group of the first two names) once with
//      the gold and once with the variant in place of that request; the engine does the same thing when every drawing ends identical and
//      every step gives the same value, answer and error.
//   A false agreement: the readings agree but the engine does different things; a false disagreement: they disagree but the engine does the
//   same thing. The same for the scorer (false right / false wrong).
//   [JS_DIR=<dir>] node training/sketch/confidence3/audit_new_forms.mjs [--json out.json] [--show N] [<data dir> ...]
//   default folders: llm_bench/short3 (messages with a pending wire left out), llm_train/opus_ext_1, synth_rules_ext, ops_formulations.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
const HERE = path.dirname(fileURLToPath(import.meta.url)), SK = path.resolve(HERE, ".."), ROOT = path.resolve(SK, "../..");
const K = createRequire(import.meta.url)(path.join(ROOT, "docs/js/logic.js"));
const JS = process.env.JS_DIR || path.join(ROOT, "docs/js");   // JS_DIR: another copy of bench-canon.js, combined-confidence.js, vote-confidence.js (e.g. HEAD's, for a before / after)
const { canon, canonWant } = await import(path.join(JS, "bench-canon.js"));
const CC = await import(path.join(JS, "combined-confidence.js"));
const VT = await import(path.join(JS, "vote-confidence.js"));

const argv = process.argv.slice(2), opt = (k) => { const i = argv.indexOf(k); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const JSON_OUT = opt("--json"), SHOW = +(opt("--show") || 3);
const DIRS = argv.length ? argv : ["llm_bench/short3", "llm_train/opus_ext_1", "llm_train/synth_rules_ext", "llm_train/ops_formulations"];

// ------------------------------------------------------------------ gold wire -> SOP nodes (the form a reader produces)
const TEXT = new Set(["label", "title", "about", "name"]);
const parts = (s) => { const o = []; let d = 0, cur = ""; for (const ch of String(s)) { if (ch === "(") d++; if (ch === ")") d--; if (ch === "," && d === 0) { o.push(cur); cur = ""; } else cur += ch; } o.push(cur); return o; };
const MAKERS = new Set(["create", "duplicate", "group"]);
/** the gold wires of a message (args as the annotation writes them) -> {nodes, mains: [node of wire j or null]}; a mention becomes a mention
 *  wire, "$new" a reference to the latest earlier wire that made shapes (create, duplicate, group) */
function goldNodes(wires) {
  const nodes = [], mains = []; let m = 0, w = 0, lastMade = null;
  const val = (x) => {
    const s = String(x).trim();
    const mm = /^mention\((.*)\)$/.exec(s);
    if (mm) { const id = "gm" + (++m), args = {}; for (const kv of parts(mm[1])) { const i = kv.indexOf("="); if (i > 0) args[kv.slice(0, i)] = kv.slice(i + 1); } nodes.push({ id, type: "mention", args }); return { ref: id }; }
    if (s === "$new") return lastMade ? { ref: lastMade } : "$new";
    return /^-?\d+(\.\d+)?$/.test(s) ? +s : s;
  };
  for (const g of wires) {
    if (!g.type) { mains.push(null); continue; }
    const args = {};
    for (const [k, v] of Object.entries(g.args || {})) {
      if (v === undefined) { args[k] = undefined; continue; }
      if (v === null) { args[k] = null; continue; }
      if (TEXT.has(k) && !Array.isArray(v)) { args[k] = String(v); continue; }
      const list = (Array.isArray(v) ? v : parts(v)).map(val);
      args[k] = list.length === 1 && !["items", "items2", "parents"].includes(k) ? list[0] : list;
    }
    const id = "gw" + (++w), n = { id, type: g.type, args };
    nodes.push(n); mains.push(n);
    if (g.type === "command" && MAKERS.has(args.action)) lastMade = id;
  }
  return { nodes, mains };
}
const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
const args0 = (n) => ({ action: n.args.action ?? null, name: typeof n.args.name === "string" ? n.args.name : null, count: n.args.count ?? null });
function spansOf(row) {   // the gold span of each wire in the text (collect_pair.mjs pairUp)
  const used = new Set();
  return row.wires.map((w) => { let s0 = -1; if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); } return s0 < 0 ? [0, 0] : [s0, s0 + w.span.length]; });
}
/** the readings of a message as the vote / combine code takes them, from SOP nodes (mains[j] = the node of gold wire j) */
const readings = (nodes, mains, spans) => mains.map((n, j) => (n ? { pa: actOf(n.type, n.args), got: canon(n, nodes), span: spans[j], args0: args0(n), j } : null)).filter(Boolean);

// ------------------------------------------------------------------ the engine: does a reading do the same thing as the gold?
/** two drawings for a message: its names as shapes on a grid; arrows between neighbours one way (world 0); arrows both ways (the forward
 *  ones labelled, dotted and red) and a group of the first two names when the message has none (world 1); the message's own groups in both */
function worlds(row) {
  const names = row.names || [], groups = row.groups || {}, out = [];
  for (const both of [false, true]) {
    const sop = names.map((n, i) => `@s${i} command action=create shape=${["circle", "square", "star", "diamond"][i % 4]} color=${["red", "blue", "green", "gold"][i % 4]} name=${n} at=${100 + (i % 5) * 140},${90 + Math.floor(i / 5) * 120 + (i % 2) * 20}`);
    names.slice(1).forEach((n, i) => { sop.push(`@l${i} command action=connect from=${names[i]} to=${n}${both ? ` label="L${i}" style=dotted color=red` : ""}`); if (both) sop.push(`@r${i} command action=connect from=${n} to=${names[i]}`); });
    Object.entries(groups).forEach(([g, ms], i) => { if (ms.length >= 2) sop.push(`@g${i} command action=group target=${ms.join(",")} name=${g}`); });
    if (both && !Object.keys(groups).length && names.length >= 3) sop.push(`@g9 command action=group target=${names[0]},${names[1]} name=Grp9`);
    out.push(sop.join("\n"));
  }
  return out;
}
const clean = (x) => JSON.parse(JSON.stringify(x === undefined ? null : x));
/** what the engine does with the message's nodes on each drawing: the final drawing and every step's value / answer / error */
function effect(row, nodes) {
  const res = [];
  for (const w of worlds(row)) {
    const S = K.createSystem(); if (w) S.engine.run(K.parse(w));
    let r; try { r = S.engine.run(nodes.map((n) => ({ id: n.id, type: n.type, args: n.args }))); } catch (e) { res.push("THROW " + e.message); continue; }
    const st = S.world.state;
    res.push(JSON.stringify({ shapes: st.shapes, edges: st.edges, groups: st.groups || [], rules: st.rules, steps: r.steps.filter((s) => s.node.type !== "mention").map((s) => [clean(s.value), s.answer || null, s.error ? String(s.error.message) : null]) }));
  }
  return res.join("\n");
}

// ------------------------------------------------------------------ the new forms and their variants
const OPS = new Set(["improve", "respace", "snap", "fit", "flip", "sort", "groupBy", "equalize", "straighten", "untangle"]);
function formOf(w) {
  const a = w.args || {}, act = a.action;
  if (w.type === "question" && a.ask === "help") return "help";
  if (w.type === "question" && a.ask === "property" && (a.from != null || a.to != null)) return "arrow property";
  if (w.type !== "command") return null;
  if (act === "create" && (a.template || a.items || a.title || a.scheme)) return "template";
  if (act === "arrange" && a.template) return "template";
  if (act === "create" && a.shape === "text") return "free text";
  if (OPS.has(act)) return "layout op";
  if (act === "arrange" && a.layout && ["tree", "layers", "radial", "organic"].includes(a.layout)) return "layout op";
  if (act === "align" && a.direction) return "layout op";
  if ((act === "set" || act === "resize") && (a.from != null || a.to != null || a.kind === "edge")) return "arrow restyle";
  if (act === "reverse") return "arrow restyle";
  if (act === "label" && (a.from != null || a.to != null || a.kind === "edge" || a.label === "")) return "arrow label";
  if (act === "create" && (a.layout || a.outline || a.at || a.linked)) return "create+";
  if ((act === "undo" || act === "redo") && a.count != null) return "undo count";
  if (act === "group" || act === "ungroup") return "group";
  if (act === "connect" && a.pairing) return "pairing";
  return null;
}
const COLORS = ["red", "blue", "green", "gold", "purple", "orange"];
/** variants of gold wire g (args as written by the annotation): [{kind, args, expect}] where expect = "same" (the engine is meant to do the
 *  same thing) or "differ"; the verdict is the engine's, expect is only the label of the variant */
function variants(g, row) {
  const a = g.args, out = [], names = row.names || [], V = (kind, args) => out.push({ kind, args });
  const list = (k) => (a[k] == null ? null : Array.isArray(a[k]) ? a[k].map(String) : parts(a[k]));
  const t = list("target");
  // order of a list
  if (t && t.length >= 2 && !String(a.target).includes("mention(")) V("target order reversed", { ...a, target: t.slice().reverse().join(",") });
  for (const k of ["items", "items2", "parents"]) { const l = list(k); if (l && l.length >= 2) { V(`${k} order reversed`, { ...a, [k]: l.slice().reverse().join(",") }); V(`${k} as an array`, { ...a, [k]: l }); } }
  // "every shape" written three ways
  if (["layout op", "arrow restyle", "arrow label"].includes(formOf(g)) || ["arrange", "distribute"].includes(a.action)) {
    if (a.target == null) { V("target absent -> mention(quantifier=all)", { ...a, target: "mention(quantifier=all)" }); if (names.length >= 2) V("target absent -> every name", { ...a, target: names.join(",") }); }
    else if (a.target === "mention(quantifier=all)") { const b = { ...a }; delete b.target; V("target all -> absent", b); if (names.length >= 2) V("target all -> every name", { ...a, target: names.join(",") }); }
    if (a.target == null && names.length >= 2) V("target absent -> one name (must differ)", { ...a, target: names[0] });
  }
  // quantifier
  if (a.quantifier === "all") { const b = { ...a }; delete b.quantifier; V("quantifier=all dropped", b); }
  else if (a.kind === "edge" || a.action === "reverse") V("quantifier=all added", { ...a, quantifier: "all" });
  // help keys
  if (a.ask === "help") {
    V("about: undefined", { ...a, about: undefined });
    if (a.aspect === "overview") { const b = { ...a }; delete b.aspect; V("aspect overview -> absent", b); }
    else if (a.aspect == null) V("aspect absent -> overview", { ...a, aspect: "overview" });
    if (a.topic == null) V("topic absent -> general", { ...a, topic: "general" });
    if (a.topic != null && a.about == null) V("about added beside a topic", { ...a, about: "images" });
    if (a.about != null) { const b = { ...a }; delete b.about; V("about dropped", b); }
    if (a.topic != null) { const b = { ...a }; delete b.topic; V("topic dropped", b); V("topic changed", { ...a, topic: a.topic === "connect" ? "delete" : "connect" }); }
    if (a.aspect != null && a.aspect !== "overview") V("aspect changed", { ...a, aspect: a.aspect === "how" ? "can" : "how" });
  }
  // label "" / null
  if (a.label === "") V("label \"\" -> null", { ...a, label: null });
  // arrow ends swapped
  if (a.from != null && a.to != null) V("from/to swapped", { ...a, from: a.to, to: a.from });
  // pairing
  if (a.action === "connect" && a.pairing && a.to == null) { const b = { ...a }; delete b.pairing; V(`pairing ${a.pairing} dropped`, b); }
  // one value changed / one key dropped / one key added (the engine should differ)
  for (const k of ["color", "template", "scheme", "style", "layout", "property", "axis", "direction", "size", "shape"]) {
    if (a[k] == null || typeof a[k] !== "string" || a[k].includes(",")) continue;
    const alt = { color: COLORS, template: ["timeline", "cycle", "pyramid"], scheme: ["warm", "cool"], style: ["dashed", "dotted", "solid"], layout: ["tree", "grid", "row"], property: ["size", "color", "name"], axis: ["horizontal", "vertical"], direction: ["left", "right"], size: ["small", "large"], shape: ["circle", "star"] }[k].find((x) => x !== a[k]);
    V(`${k} changed`, { ...a, [k]: alt });
  }
  for (const k of ["template", "items", "title", "label", "count", "outline", "at", "linked", "layout"]) if (a[k] != null && k !== "label") { const b = { ...a }; delete b[k]; V(`${k} dropped`, b); }
  if (a.action === "create" && a.template && a.title == null) V("title added", { ...a, title: "Extra" });
  if (OPS.has(a.action) && a.target == null && names.length) V("target added (one name)", { ...a, target: names[0] });
  if (a.items) { const l = list("items"); if (l.length >= 2) V("last item dropped", { ...a, items: l.slice(0, -1).join(",") }); }
  return out;
}

// ------------------------------------------------------------------ run
const load = (d) => { const p = path.isAbsolute(d) ? d : path.join(SK, d); return readdirSync(p).filter((f) => /^(msg|batch|s)[_.].*\.jsonl$/.test(f)).sort().flatMap((f) => readFileSync(path.join(p, f), "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l))); };
const T = { gold: {}, variants: {} }, EX = {};
const ex = (k, s) => { (EX[k] ||= []).length < SHOW && EX[k].push(s); };
const bump = (o, k, f) => { o[k] ||= { n: 0, engine_same: 0, agree_engine: 0, agree_canon: 0, agree_combined: 0, scored_right: 0, false_agree: 0, false_disagree: 0, false_agree_combined: 0, false_disagree_combined: 0, false_right: 0, false_wrong: 0 }; f(o[k]); };
for (const d of DIRS) {
  const rows = load(d).filter((r) => Array.isArray(r.wires) && !r.wires.some((w) => "pending" in w) && r.wires.every((w) => w.type));
  const G = (T.gold[d] = { messages: rows.length, requests: 0, new_form: 0, canon_mismatch: 0, unpaired: 0, disagree_combined: 0, disagree_canon: 0, disagree_engine: 0, engine_unstable: 0 });
  for (const row of rows) {
    const spans = spansOf(row), { nodes, mains } = goldNodes(row.wires), R = readings(nodes, mains, spans), names = row.names || [];
    G.requests += R.length;
    // 1. canon of the gold nodes = canonWant of the gold
    row.wires.forEach((w, j) => {
      const n = mains[j]; if (!n) return; if (formOf(w)) G.new_form++;
      const got = canon(n, nodes), want = canonWant(w.type, w.args), keys = [...new Set([...Object.keys(got), ...Object.keys(want)])].filter((k) => (got[k] ?? "∅") !== (want[k] ?? "∅"));
      if (keys.length) { G.canon_mismatch++; ex(`canon mismatch ${d}`, `${row.id} ${w.span} | ${keys.map((k) => `${k}: canon ${got[k]} / canonWant ${want[k]}`).join("; ")}`); }
    });
    // 1b. gold vs gold
    const R2 = readings(goldNodes(row.wires).nodes, goldNodes(row.wires).mains, spans);
    const ac = CC.agreement(row.text, R, R2), ae = VT.agreementOf(row.text, R, R2, names, "engine"), an = VT.agreementOf(row.text, R, R2, names, "canon");
    R.forEach((x, i) => {
      if (ac[i].partner < 0) { G.unpaired++; ex(`unpaired ${d}`, `${row.id} ${x.pa}`); }
      if (!ac[i].agree) { G.disagree_combined++; ex(`gold-gold disagree ${d}`, `${row.id} ${x.pa} ${JSON.stringify(ac[i].differ)}`); }
      if (!an[i].agree) G.disagree_canon++;
      if (!ae[i].agree) G.disagree_engine++;
    });
    const base = effect(row, nodes);
    if (base !== effect(row, goldNodes(row.wires).nodes)) G.engine_unstable++;
    // 2. variants of the new forms
    row.wires.forEach((w, j) => {
      const form = formOf(w); if (!form || !mains[j]) return;
      for (const v of variants(w, row)) {
        const wires2 = row.wires.map((x, i) => (i === j ? { ...x, args: v.args } : x)), g2 = goldNodes(wires2);
        const same = effect(row, g2.nodes) === base;
        const Rv = readings(g2.nodes, g2.mains, spans);
        const mine = Rv.find((x) => x.j === j), gold = R.find((x) => x.j === j);
        const agE = VT.agreementOf(row.text, [mine], [gold], names, "engine")[0].agree, agN = VT.agreementOf(row.text, [mine], [gold], names, "canon")[0].agree;
        const agC = CC.agreement(row.text, [mine], [gold])[0].agree;
        const want = canonWant(w.type, w.args), right = mine.pa === gold.pa && Object.entries(want).every(([k, x]) => (mine.got[k] ?? "∅") === x);
        bump(T.variants, `${form} | ${v.kind}`, (o) => {
          o.n++; if (same) o.engine_same++; if (agE) o.agree_engine++; if (agN) o.agree_canon++; if (agC) o.agree_combined++; if (right) o.scored_right++;
          if (agE && !same) { o.false_agree++; ex(`false agreement: ${form} | ${v.kind}`, `${row.id} "${w.span}" gold ${JSON.stringify(gold.got)} variant ${JSON.stringify(mine.got)}`); }
          if (!agE && same) { o.false_disagree++; ex(`false disagreement: ${form} | ${v.kind}`, `${row.id} "${w.span}" gold ${JSON.stringify(gold.got)} variant ${JSON.stringify(mine.got)}`); }
          if (agC && !same) o.false_agree_combined++;
          if (!agC && same) o.false_disagree_combined++;
          if (right && !same) { o.false_right++; ex(`false right: ${form} | ${v.kind}`, `${row.id} "${w.span}" gold ${JSON.stringify(want)} variant ${JSON.stringify(mine.got)}`); }
          if (!right && same) { o.false_wrong++; ex(`false wrong: ${form} | ${v.kind}`, `${row.id} "${w.span}" gold ${JSON.stringify(want)} variant ${JSON.stringify(mine.got)}`); }
        });
      }
    });
  }
}
console.log("## 1. gold vs gold (every request of the folders)\n");
console.log("| folder | messages | requests | of them new forms | canon != canonWant | unpaired | disagree: VSS-BERT / vote canon / vote engine | engine not deterministic |");
console.log("|---|---|---|---|---|---|---|---|");
for (const [d, g] of Object.entries(T.gold)) console.log(`| ${d} | ${g.messages} | ${g.requests} | ${g.new_form} | ${g.canon_mismatch} | ${g.unpaired} | ${g.disagree_combined} / ${g.disagree_canon} / ${g.disagree_engine} | ${g.engine_unstable} |`);
console.log("\n## 2. variants of the new forms: verdicts against what logic.js does (two drawings)\n");
console.log("| form \\| variant | n | engine same | agree (vote engine) | false agree | false disagree | VSS-BERT false agree / disagree | scored right | false right | false wrong |");
console.log("|---|---|---|---|---|---|---|---|---|---|");
for (const [k, o] of Object.entries(T.variants).sort()) console.log(`| ${k} | ${o.n} | ${o.engine_same} | ${o.agree_engine} | ${o.false_agree || ""} | ${o.false_disagree || ""} | ${o.false_agree_combined || ""} / ${o.false_disagree_combined || ""} | ${o.scored_right} | ${o.false_right || ""} | ${o.false_wrong || ""} |`);
const tot = Object.values(T.variants).reduce((s, o) => { for (const k of Object.keys(o)) s[k] = (s[k] || 0) + o[k]; return s; }, {});
console.log(`\nIn all: ${tot.n} variants; false agreements ${tot.false_agree}, false disagreements ${tot.false_disagree} (vote, engine mode); VSS-BERT: ${tot.false_agree_combined} / ${tot.false_disagree_combined}; scorer: false right ${tot.false_right}, false wrong ${tot.false_wrong}.`);
console.log("\n## Examples\n");
for (const [k, xs] of Object.entries(EX)) { console.log(`- ${k}:`); for (const x of xs) console.log(`    ${x}`); }
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ totals: tot, ...T }, null, 1));
