// zs_check.mjs: does the zero-shot classifier pick the right kind and action? The neural reader's own hypotheses (docs/js/neural.js
// KIND, ACTION), on a few messages, for each classifier and each file type (q8 = the browser's files, fp32 = the full model).
// Usage (needs @huggingface/transformers next to it: cd training/laptop && npm install): node training/laptop/zs_check.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
globalThis.SOPKit = require("../../docs/js/logic.js");
const NeuralKit = require("../../docs/js/neural.js");
const T = await import("@huggingface/transformers");
const src = (await import("node:fs")).readFileSync(new URL("../../docs/js/neural.js", import.meta.url), "utf8");
const grab = (name) => eval("(" + src.slice(src.indexOf(`const ${name} = {`) + `const ${name} = `.length, src.indexOf("\n};", src.indexOf(`const ${name} = {`)) + 2) + ")");
const KIND = grab("KIND"), ACTION = grab("ACTION");
const MSG = ["create a black star", "draw a blue circle named Hub", "delete Start", "what is connected to Hub?", "move Box below Hub", "make Hub red", "how many circles are there?", "Hub is above Box"];
for (const [zsName, id] of Object.entries(NeuralKit.MODELS.zeroshot)) for (const dtype of ["q8", "int8", "fp32"]) {
  let zs; try { zs = await T.pipeline("zero-shot-classification", id, { device: "cpu", dtype }); } catch (e) { console.log(`${zsName} ${dtype}: load failed: ${e.message}`); continue; }
  console.log(`\n=== ${zsName} (${id}) dtype ${dtype}`);
  for (const m of MSG) {
    const k = await zs(m, Object.values(KIND).map((x) => x[0]), { hypothesis_template: "{}" }), a = await zs(m, Object.values(ACTION).map((x) => x[0]), { hypothesis_template: "{}" });
    const kn = Object.keys(KIND)[Object.values(KIND).findIndex((x) => x[0] === k.labels[0])], an = Object.keys(ACTION)[Object.values(ACTION).findIndex((x) => x[0] === a.labels[0])];
    const kn2 = Object.keys(KIND)[Object.values(KIND).findIndex((x) => x[0] === k.labels[1])];
    console.log(`  ${m.padEnd(32)} kind ${kn} ${k.scores[0].toFixed(2)} (2nd ${kn2} ${k.scores[1].toFixed(2)}) · action ${an} ${a.scores[0].toFixed(2)} (2nd ${Object.keys(ACTION)[Object.values(ACTION).findIndex((x) => x[0] === a.labels[1])]} ${a.scores[1].toFixed(2)})`);
  }
}
