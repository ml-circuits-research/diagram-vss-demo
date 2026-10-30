// parity_front.mjs: docs/js/front.js against training/sketch/front.py on golden cases (segments and normalized tokens).
// node parity_front.mjs <golden.json> <front.json>   (golden written by the Python side: {cases: [{text, names, segments, tokens: [[...]]}]})
import { readFileSync } from "node:fs";
import { segment, normalize } from "../../docs/js/front.js";
const g = JSON.parse(readFileSync(process.argv[2], "utf8")), F = JSON.parse(readFileSync(process.argv[3], "utf8"));
let bad = 0;
for (const c of g.cases) {
  const segs = segment(c.text, c.names, F), toks = segs.map((s) => normalize(s, c.names, F).tokens.join(" "));
  const ok = JSON.stringify(segs) === JSON.stringify(c.segments) && JSON.stringify(toks) === JSON.stringify(c.tokens.map((t) => t.join(" ")));
  if (!ok) { bad++; if (bad < 6) console.log("DIFF", JSON.stringify(c.text).slice(0, 120), "\n  py:", JSON.stringify(c.segments), JSON.stringify(c.tokens).slice(0, 200), "\n  js:", JSON.stringify(segs), JSON.stringify(toks).slice(0, 200)); }
}
console.log(`front parity: ${g.cases.length - bad}/${g.cases.length} identical`); process.exit(bad ? 1 : 0);
