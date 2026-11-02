// apply_ops_patch.mjs: applies the integration of the high-level layout operations and arrow restyling (docs/js/ops-integration.md) to a
// copy of docs/js/logic.js (and optionally docs/index.html). Every change is anchored on text that must occur exactly once; a missing or
// repeated anchor stops the script with the anchor's name, so a moved logic.js fails loudly instead of being patched wrongly.
// The code inserted is in training/sketch/ops/ops_patch_blocks.js (one block per "//@@ NAME" line).
//   node training/sketch/ops/apply_ops_patch.mjs <logic.js in> <logic.js out> [--html <index.html in> <index.html out>]
// In place (when logic.js is free):  node training/sketch/ops/apply_ops_patch.mjs docs/js/logic.js docs/js/logic.js --html docs/index.html docs/index.html
import { readFileSync, writeFileSync } from "node:fs";
const HERE = new URL(".", import.meta.url).pathname;
const [inp, out, flag, hin, hout] = process.argv.slice(2);
if (!inp || !out) { console.error("usage: apply_ops_patch.mjs <logic.js in> <logic.js out> [--html <in> <out>]"); process.exit(2); }

const blocks = {};
{ let name = null; for (const line of readFileSync(HERE + "ops_patch_blocks.js", "utf8").split("\n")) {
    const m = /^\/\/@@ (\w+)/.exec(line); if (m) { name = m[1]; blocks[name] = []; continue; }
    if (name) blocks[name].push(line); }
  for (const k of Object.keys(blocks)) { while (blocks[k].length && !blocks[k][blocks[k].length - 1].trim()) blocks[k].pop(); blocks[k] = blocks[k].join("\n"); } }

let src = readFileSync(inp, "utf8");
if (src.includes("const opsPlugin = {")) { console.error("already patched (opsPlugin exists)"); process.exit(3); }
const once = (name, anchor) => { const i = src.indexOf(anchor); if (i < 0) throw new Error(`anchor ${name} not found: ${anchor.slice(0, 80)}`); if (src.indexOf(anchor, i + 1) >= 0) throw new Error(`anchor ${name} occurs more than once`); return i; };
const before = (name, anchor, text) => { const i = once(name, anchor); src = src.slice(0, i) + text + "\n" + src.slice(i); };
const replace = (name, anchor, text) => { const i = once(name, anchor); src = src.slice(0, i) + text + src.slice(i + anchor.length); };
const afterLine = (name, anchor, text) => { const i = once(name, anchor), e = src.indexOf("\n", i); src = src.slice(0, e + 1) + text + "\n" + src.slice(e + 1); };
const done = [];
const step = (name, fn) => { fn(); done.push(name); };

// 1. the engine: helpers + the ops plugin, the new arrange handler, the legend cues, the plugin list
step("ENGINE_HELPERS", () => before("layoutPlugin", "const layoutPlugin = {", blocks.ENGINE_HELPERS + "\n"));
step("ARRANGE_HANDLER", () => {
  const start = once("arrange handler start", "    { type: 'command', when: { action: 'arrange' }, run(a, ctx) {");
  const endAnchor = "notes: [`${lay} layout`] };\n    } }", end = src.indexOf(endAnchor, start);
  if (end < 0) throw new Error("anchor arrange handler end not found");
  src = src.slice(0, start) + blocks.ARRANGE_HANDLER + src.slice(end + endAnchor.length);
});
step("LEGEND arrange cues", () => replace("arrange cues", "arrange: ['arrange', 'layout', 'lay out', 'organize', 'organise', 'tidy']", "arrange: ['arrange', 'layout', 'lay out', 'organize', 'organise', 'rearrange', 're-arrange', 'relayout', 're-layout', 'reorganize', 'reorganise', 'reformat']"));
step("LEGEND grid cues", () => replace("grid cues", "grid: ['grid', 'tidy']", "grid: ['grid']"));
step("LEGEND description", () => replace("layout description", "description: 'Align shapes along an axis, or arrange many shapes as a row, column, grid or circle.'", "description: 'Align shapes along an axis or an edge, space them evenly, bring to the front or send to the back; arrange shapes as a row, column, grid, circle, tree, layers, radial or organic layout (the last four follow the links).'"));
step("PLUGINS", () => replace("plugin list", "rulesPlugin, factsPlugin]", "rulesPlugin, factsPlugin, opsPlugin]"));
// 2. the Rules reader
step("COMMON", () => replace("COMMON words", "stroke yourself up down unlabel", "stroke yourself up down unlabel clean cleaner neat neater tidier messy mess clutter cluttered nicer prettier tree trees flow layers lay good thin thick collect chart charts"));
step("FORMALIZER_MASK", () => afterLine("TPL_PART", "    const TPL_PART = '\\u0001';", blocks.FORMALIZER_MASK));
step("SENTENCE_TEMPLATE_GUARD", () => replace("sentence template", "templateOf(' ' + p + ' ') ? [TPL_PART + p]", blocks.SENTENCE_TEMPLATE_GUARD));
step("READER_HELPERS", () => before("makeFormalizer", "function makeFormalizer(engine) {", blocks.READER_HELPERS + "\n"));
step("CLAUSE_TEMPLATE_GUARD", () => replace("template guard", "      if (templateClause(t.trim(), isQ)) return;   // a diagram template (timeline, pyramid, heart, ...)", blocks.CLAUSE_TEMPLATE_GUARD));
step("CLAUSE_VERBLESS", () => before("verbless", "        else { F.notes.push(`I couldn't find an action in", blocks.CLAUSE_VERBLESS));
step("CLAUSE_ACTION", () => before("isCmd", "      const isCmd = kind === 'command';", blocks.CLAUSE_ACTION));
step("CLAUSE_ROOT", () => before("roles", "      // ---- roles that use prepositions ----", blocks.CLAUSE_ROOT));
step("CLAUSE_EDGE_ENDS", () => replace("edge ends", "      if (action === 'connect' || action === 'disconnect' || ask === 'path') {", blocks.CLAUSE_EDGE_ENDS));
step("ARRANGE_LINE tidy", () => replace("arrange tidy", "if (action === 'arrange') { const lay = rest.match(/\\b(row|line|column|stack|grid|circle|ring|tidy)\\b/); if (lay) C.args.layout = { line: 'row', stack: 'column', ring: 'circle', tidy: 'grid' }[lay[1]] || lay[1];",
  "if (action === 'arrange') { const lay = rest.match(/\\b(row|line|column|stack|grid|circle|ring)\\b/); if (lay) C.args.layout = { line: 'row', stack: 'column', ring: 'circle' }[lay[1]] || lay[1];"));
step("CLAUSE_ARGS", () => afterLine("after the arrange line", "if (action === 'arrange') { const lay = rest.match(/\\b(row|line|column|stack|grid|circle|ring)\\b/);", blocks.CLAUSE_ARGS));
step("NO_TARGET_NOTE", () => replace("no target note", "&& args.target == null && args.from == null && args.to == null) F.notes.push(", "&& args.target == null && args.from == null && args.to == null && args.kind == null) F.notes.push("));
step("ARRANGE_GRID tidy", () => replace("grid tidy", "/\\bgrid|tidy\\b/i.test(raw)) C.args.layout = 'grid';", "/\\bgrid\\b/i.test(raw)) C.args.layout = 'grid';"));
writeFileSync(out, src);
if (flag === "--html") {
  let h = readFileSync(hin, "utf8"); const a = '<script src="js/logic.js"></script>';
  if (!h.includes("js/auto-layout.js")) { if (!h.includes(a)) throw new Error("index.html: logic.js script tag not found"); h = h.replace(a, '<script src="js/auto-layout.js"></script>\n' + a); }
  writeFileSync(hout, h); done.push("index.html script tag");
}
console.error(`patched: ${done.join(", ")}`);
