// rules_inventory.mjs: what the Rules reader (docs/js/logic.js) can detect, read MECHANICALLY from the code.
//   1. the legend: every question of the engine's legend, its kind, its values and each value's cue words (engine.legend, as the
//      formalizer's lexicons read them: L.lexicon(key));
//   2. the formalizer's own hard-coded word lists, extracted from the source of makeFormalizer (the lines that decide the wire type, the
//      question kind, positions, regions, pairing, arrow, style, axis, layout, counts, scale, notColor, recency, quantifier ...), each with
//      its line number, so RULES_COVERAGE.md can cite them.
// Output: JSON on stdout ({legend, formalizer}), or with --md a Markdown table of the legend (used in RULES_COVERAGE.md).
//   node training/sketch/synth/rules_inventory.mjs [--md]
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const REPO = new URL("../../../", import.meta.url).pathname;
const SRC = process.env.LOGIC_JS || (REPO + "docs/js/logic.js");   // LOGIC_JS: another copy (gen_rules_cover.py pins the committed one)
const K = require(SRC);
const sys = K.createSystem();
const L = sys.engine.legend;

const legend = {};
for (const [key, q] of L.questions) {
  legend[key] = { ask: q.ask || null, kind: q.kind, plugins: q.plugins.slice(), values: q.values ? Object.fromEntries(Object.entries(q.values).map(([v, c]) => [v, (c || []).slice()])) : null };
}

// the formalizer's source lines (makeFormalizer .. the end of clause()), with line numbers
const lines = readFileSync(SRC, "utf8").split("\n");
const start = lines.findIndex((l) => l.startsWith("const NUMW")), end = lines.findIndex((l) => l.startsWith("function rulesCut"));
const F = lines.slice(start, end).map((t, i) => ({ n: start + i + 1, t }));
const grepF = (re) => F.filter((x) => re.test(x.t)).map((x) => ({ line: x.n, src: x.t.trim().slice(0, 400) }));
const formalizer = {
  numberWords: Object.keys(eval("(" + /const NUMW = (\{[^}]*\})/.exec(readFileSync(SRC, "utf8"))[1] + ")")),
  edgeWords: /const EDGE_WORDS = '([^']*)'/.exec(readFileSync(SRC, "utf8"))[1].split("|"),
  stopWords: eval(/const STOP = new Set\((\[[^\]]*\])\)/.exec(readFileSync(SRC, "utf8"))[1]),
  // the lines that decide things, by topic (each: line number + source)
  wireType: grepF(/kind = 'command'; action = |action = 'forget'|kind = 'rule'|kind = 'question'|kind = 'fact'/),
  politePrefixes: grepF(/t = t\.replace\(\/\^\\s\*\(\?:\(\?:please/),
  verbContext: grepF(/\['make', 'put', 'place'\]|action = 'connect';|action = 'label';|action = 'disconnect';|verb === 'give'|action === 'swap' &&|action = 'create';\s*$|action = 'set';\s+\/\*|CONNECT_ONLY && CONNECT_ONLY.test\(t\)\) action|PLACE_ONLY && PLACE_ONLY.test\(t\)\) action|start over|split\|break/),
  questionKinds: grepF(/ask = '|ask = nref/),
  roles: grepF(/take\(|grab\(|\['between'|\['leftOf'|\['rightOf'|\['above'|\['below'|\['near'|C\.args\.(style|arrow|pairing|axis|layout|quantifier|notColor|count|direction|kind) =/),
  segmenter: grepF(/const SPLIT_VERB|const CREATE_START|const OBJ_SPLIT|const COORD|const DIST_VERB|const ELLIPSIS|const PLACE_ONLY|const CONNECT_ONLY|const FACT_LIST|body\.split|sentences = text\.split/),
  mentions: grepF(/mention\(|lastRef|lastGroup/)
};

if (process.argv.includes("--md")) {
  const out = ["| question | kind | values | cue words (beside the value's own name) |", "|---|---|---|---|"];
  for (const [k, q] of Object.entries(legend)) {
    if (!q.values) { out.push(`| ${k} | ${q.kind} | (free: ${q.kind}) | |`); continue; }
    const vs = Object.entries(q.values);
    out.push(`| ${k} | ${q.kind} | ${vs.length} | ${vs.map(([v, c]) => `**${v}**${c.length ? ": " + c.join(", ") : ""}`).join("; ")} |`);
  }
  console.log(out.join("\n"));
} else console.log(JSON.stringify({ legend, formalizer }, null, 1));
