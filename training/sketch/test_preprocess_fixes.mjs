// test_preprocess_fixes.mjs: the fixes of training/sketch/PREPROCESS_FIXES.md, code against code (no model needed).
//   node training/sketch/test_preprocess_fixes.mjs        exit 0 when every check passes
// 1. the number-word table is the same in training/sketch/front.py, docs/js/front.js and docs/js/neural.js;
// 2. front.js tokenize == front.py tokenize on fixed cases, with the switches off (as before) and on (name_digit, number_words), and a
//    front.json without the field "mechanical" reads exactly as before (the shipped models);
// 3. vss-adapter.js toNodes: `at` with x and y -> at; with only x or only y -> no `at` and the node is marked incomplete;
// 4. neural.js role(): a point with four tagged numbers takes the pair joined by a comma; with no such pair the wire is marked incomplete;
//    a model whose reader.number_words_from is "table" reads "forty five" as 45, the shipped map is used otherwise;
// 5. the gates hold an incomplete request and say why (vss-confidence.js, neural-confidence.js, combined-confidence.js), except at "all".
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, "../..");
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const FRONT = await imp("docs/js/front.js"), AD = await imp("docs/js/vss-adapter.js"), VC = await imp("docs/js/vss-confidence.js");
const NC = await imp("docs/js/neural-confidence.js"), CC = await imp("docs/js/combined-confidence.js");
let fails = 0;
const check = (name, ok, detail = "") => { console.log((ok ? "ok   " : "FAIL ") + name + (ok || !detail ? "" : "\n     " + detail)); if (!ok) fails++; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 1. the tables
const py = (code) => { const r = spawnSync("python3", ["-c", code], { cwd: HERE, encoding: "utf8" }); if (r.status) throw new Error(r.stderr); return r.stdout; };
const PY = JSON.parse(py("import json, front; print(json.dumps({'u': front.NUM_UNITS, 't': front.NUM_TENS, 'd': front.NUM_DIGIT}))"));
const nsrc = readFileSync(path.join(ROOT, "docs/js/neural.js"), "utf8");
const obj = (name) => Function(`return (${new RegExp(`const ${name} = (\\{[^}]*\\})`).exec(nsrc)[1]})`)();
check("number table: front.py == front.js", eq(PY.u, FRONT.NUM_UNITS) && eq(PY.t, FRONT.NUM_TENS));
check("number table: front.js == neural.js", eq(obj("NUM_UNITS_T"), FRONT.NUM_UNITS) && eq(obj("NUM_TENS_T"), FRONT.NUM_TENS) && eq(obj("NUM_DIGIT_T"), PY.d));

// 2. tokenize parity on fixed cases, three switch settings
const CASES = [
  ["Buoy1: a tiny red circle at 700,300. Chair2, another one beside it", []],
  ["Add a forty px gap. Make two hundred wide, three circles and forty-five squares; the red one stays", ["Lamp"]],
  ["Wall first: a faint orange rectangle. Tank: blue rectangle 150 by 90 at 360, 130", []],
  ["move Lamp2 thirty five px left of B2's border. Twelve dots. One more", ["Lamp2"]],
  ["Ten circles, twenty-one triangles, ninety nine and a hundred; I said A1 and I", []],
];
const MECH = [{}, { name_digit: 1 }, { number_words: 1 }, { name_digit: 1, number_words: 1 }];
const pyTok = JSON.parse(py(`import json, front\nC = ${JSON.stringify(CASES)}\nM = ${JSON.stringify(MECH)}\nprint(json.dumps([[front.tokenize(t, n, m) for t, n in C] for m in M]))`));
MECH.forEach((m, i) => CASES.forEach(([t, n], j) => check(`tokenize parity ${JSON.stringify(m)} case ${j + 1}`, eq(FRONT.tokenize(t, n, m), pyTok[i][j]), `js ${JSON.stringify(FRONT.tokenize(t, n, m)[0])}\n     py ${JSON.stringify(pyTok[i][j][0])}`)));
const shipped = JSON.parse(readFileSync(path.join(ROOT, "docs/model/micro/shapes8/front.json"), "utf8"));
check("a shipped front.json has no switch: normalize reads as tokenize without switches", !shipped.mechanical &&
  eq(FRONT.normalize(CASES[0][0], [], shipped).tokens, FRONT.normalize(CASES[0][0], [], Object.assign({}, shipped, { mechanical: {} })).tokens));
const on = Object.assign({}, shipped, { mechanical: { name_digit: 1, number_words: 1 } });
check("with the switches recorded: Buoy1 is a name, forty -> 40", FRONT.normalize("Buoy1: a tiny red circle", [], on).tokens.includes("n_buoy1") && FRONT.normalize("a forty px gap", [], on).tokens.includes("40"));
check("without them: as before", !FRONT.normalize("Buoy1: a tiny red circle", [], shipped).tokens.includes("n_buoy1") && !FRONT.normalize("a forty px gap", [], shipped).tokens.includes("40"));

// 3. the adapter
const toN = (roles) => AD.toNodes({ event: "create", roles: Object.assign({ object: { head: "squares" } }, roles), verb: "draw", tokens: [] }, { names: {} }, { names: [], refs: new Map(), last: [] });
const both = toN({ x: "400", y: "300" }).nodes[0], onlyX = toN({ x: "400" }).nodes[0], none = toN({}).nodes[0];
check("adapter: x and y -> at, not incomplete", both.args.at === "400,300" && !both.incomplete);
check("adapter: only x -> no at, incomplete with a reason", onlyX.args.at === undefined && onlyX.incomplete && onlyX.incomplete[0].key === "at" && /only the x/.test(onlyX.incomplete[0].text));
check("adapter: neither -> nothing marked", !none.incomplete && none.args.at === undefined);
check("adapter: the mark is not enumerable (dumps unchanged)", !Object.keys(onlyX).includes("incomplete") && JSON.stringify(onlyX) === JSON.stringify({ id: onlyX.id, type: onlyX.type, args: onlyX.args }));

// 4. neural.js decode with a stand-in model
const require = createRequire(import.meta.url);
globalThis.SOPKit = require(path.join(ROOT, "docs/js/logic.js"));
const NK = require(path.join(ROOT, "docs/js/neural.js")), K = globalThis.SOPKit;
const WRE = /[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu;
function fakeRead(text, tagOf, reader) {   // tagOf(word, index, words) -> tag
  const ws = [...text.matchAll(WRE)].map((m) => ({ w: m[0], start: m.index, end: m.index + m[0].length })), tags = ws.map((x, i) => tagOf(x.w, i, ws));
  const spans = {}; let cur = null;
  tags.forEach((t, i) => { if (t === "O") { cur = null; return; } const [p, k] = [t[0], t.slice(2)], L = spans[k] || (spans[k] = []), last = L[L.length - 1];
    if (p === "I" && cur === k && last && last.j === i) last.j = i + 1; else { L.push({ i, j: i + 1 }); cur = k; } });
  for (const k of Object.keys(spans)) spans[k] = spans[k].map((s) => ({ text: text.slice(ws[s.i].start, ws[s.j - 1].end), start: ws[s.i].start, end: ws[s.j - 1].end, score: 0.99 }));
  const res = { words: ws.map((x) => x.w), acts: [{ label: "create", score: 0.99 }], classes: { shape: { value: "rectangle", score: 0.99 } }, tags, spans };
  Object.defineProperty(res, "text", { value: text, enumerable: false });
  return res;
}
async function readWith(text, tagOf, reader) {
  const sys = K.createSystem(), n = NK.create(sys.engine, () => { throw new Error("rules"); });
  n.setModels({ reader, read: async (t) => fakeRead(t, tagOf, reader), readMany: async (ts) => ts.map((t) => fakeRead(t, tagOf, reader)) });
  n.setStrategy("finetuned");
  return n.formalize(text, { names: [], last: [] }, { units: [{ c0: 0, c1: text.length }] });
}
const reader0 = { acts: ["create"], act_keys: { create: ["shape", "at", "width"] }, ref_keys: [], desc_keys: [], number_words: { lights: "2" } };
const numTag = (key) => (w) => (/^\d+$/.test(w) ? "B-" + key : "O");
let r = await readWith("black rectangle 150 by 90 at 700,300", numTag("at"), reader0), w = r.nodes.find((x) => x.type === "command");
check("neural point: 4 numbers, one pair joined by a comma -> 700,300", w && w.args.at === "700,300" && !w.incomplete, JSON.stringify(w && w.args));
r = await readWith("black rectangle 150 by 90 at 700 300", numTag("at"), reader0); w = r.nodes.find((x) => x.type === "command");
check("neural point: 4 numbers, no comma pair -> no at, incomplete, a note", w && w.args.at === undefined && w.incomplete && w.incomplete[0].key === "at" && r.notes.some((x) => /not sure/.test(x)), JSON.stringify(w && w.args) + " " + JSON.stringify(r.notes));
r = await readWith("a box at 700,300", numTag("at"), reader0); w = r.nodes.find((x) => x.type === "command");
check("neural point: 2 numbers -> as before", w && w.args.at === "700,300" && !w.incomplete);
r = await readWith("a box at 360,130 next to 200,100", numTag("at"), reader0); w = r.nodes.find((x) => x.type === "command");
check("neural point: two comma pairs -> ambiguous, incomplete", w && w.args.at === undefined && w.incomplete);
const tagW = (w, i, ws) => (["forty", "five"].includes(w.toLowerCase()) ? (w.toLowerCase() === "forty" ? "B-width" : "I-width") : "O");
r = await readWith("a box forty five wide", tagW, Object.assign({}, reader0, { number_words: { forty: "40", five: "5" }, number_words_from: "table" })); w = r.nodes.find((x) => x.type === "command");
check("neural number: number_words_from=table reads 'forty five' as 45", w && w.args.width === 45, JSON.stringify(w && w.args));
r = await readWith("a box forty five wide", tagW, reader0); w = r.nodes.find((x) => x.type === "command");
check("neural number: the shipped map (no table) reads it as before (no value)", w && w.args.width === undefined, JSON.stringify(w && w.args));

// 5. the gates
const unit = { src: "draw a square at 400, 300", world: "shapes", signals: null };
const nodeI = Object.assign({}, onlyX); Object.defineProperty(nodeI, "incomplete", { value: onlyX.incomplete }); Object.defineProperty(nodeI, "unit", { value: unit });
const vssModel = JSON.parse(readFileSync(path.join(ROOT, "docs/model/confidence/vss.json"), "utf8"));
let g = VC.gate(vssModel, { nodes: [nodeI], units: [unit] }, "cost");
check("vss gate: incomplete -> held, reason 'incomplete'", g.held.length === 1 && g.units[0].reasons[0].group === "incomplete" && /only the x/.test(g.units[0].reasons[0].text), JSON.stringify(g.units[0].reasons));
g = VC.gate(vssModel, { nodes: [nodeI], units: [unit] }, "all");
check("vss gate at 'all': executed", g.held.length === 0);
r = await readWith("black rectangle 150 by 90 at 700 300", numTag("at"), reader0);
g = NC.gate(null, r, "all");
check("neural gate at 'all': executed", g.held.length === 0);
const spec = JSON.parse(readFileSync(path.join(ROOT, "docs/model/confidence/sop-bert.json"), "utf8"));
g = NC.gate(spec, r, "cost");
check("neural gate: incomplete -> held, reason 'incomplete'", g.held.length === 1 && g.held[0].reasons[0].group === "incomplete", JSON.stringify(g.held.map((x) => x.reasons)));
const cspec = JSON.parse(readFileSync(path.join(ROOT, "docs/model/confidence/combined.json"), "utf8"));
const msg = { text: "draw a square at 400, 300", cut: "bert", sop: [], vss: [{ node: nodeI, f: {}, world: "shapes", pa: "command:create", got: {}, span: [0, 25], args0: {}, conf: 0.99 }] };
let c = CC.combine(cspec, msg, "cost");
check("combined: a VSS request with an incomplete value -> held", c.items.length === 1 && !c.items[0].execute && c.items[0].incomplete && c.items[0].incomplete[0].reader === "vss");
check("combined: the reason names the reader and the value", /VSS read a value only in part: only the x/.test(CC.reasons(msg, c.items[0], { sop: "SOP-BERT", vss: "VSS" })[0].text));
c = CC.combine(cspec, msg, "all");
check("combined at 'all': executed", c.items[0].execute);

console.log(fails ? `${fails} check(s) failed` : "all checks passed");
process.exit(fails ? 1 : 0);
