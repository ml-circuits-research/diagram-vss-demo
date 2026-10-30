// export_cues.mjs: the legend's cue words (docs/js/logic.js, the rules formalizer's legend) as JSON: { question: { value: [cues] } }.
// The VSS normalizer's synonym table is generated from this file (make_normalizer.py), so both readers know the same words.
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const K = createRequire(import.meta.url)("../../docs/js/logic.js");
const L = K.createSystem().engine.legend, out = {};
for (const q of L.questions.values()) if (q.values) out[q.key] = q.values;
writeFileSync(new URL("./legend_cues.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(Object.entries(out).map(([k, v]) => `${k}:${Object.keys(v).length}`).join(" "));
