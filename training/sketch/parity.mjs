// parity.mjs: the browser normalizer (docs/js/snorm.js) against the Python one (normalize.py) on golden sentences.
// node parity.mjs <golden.json>   (golden: {lexicon: [...], cases: [{text, tokens}]}, written by the Python side)
import { readFileSync } from "node:fs";
import { compile, normalize } from "../../docs/js/snorm.js";
const g = JSON.parse(readFileSync(process.argv[2], "utf8"));
const C = compile(JSON.parse(readFileSync(new URL("./normalize.json", import.meta.url), "utf8"))), lex = new Set(g.lexicon);
let bad = 0;
for (const c of g.cases) { const t = normalize(C, lex, c.text).tokens.join(" "); if (t !== c.tokens.join(" ")) { bad++; if (bad < 8) console.log("DIFF", JSON.stringify(c.text), "\n  py:", c.tokens.join(" "), "\n  js:", t); } }
console.log(`normalizer parity: ${g.cases.length - bad}/${g.cases.length} identical`); process.exit(bad ? 1 : 0);
