// export_legend_values.mjs: the legend's questions with values (docs/js/logic.js createSystem().engine.legend, after every plugin is
// loaded, so the generated `topic` values are included) -> training/sketch/legend_ext/legend_values.json {key: {kind, values}}.
// Read by training/sketch/front.py with LEGEND_EXT=1 (the value tables of the new keys: template, scheme, fill, layer, topic, aspect,
// property, and the new values of action, layout, shape, arrow). Mechanical: the legend is the only hand-written input.
// Run after any change to the legend: node training/sketch/legend_ext/export_legend_values.mjs
import { createRequire } from "module"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, "../../..");
const K = createRequire(import.meta.url)(path.join(REPO, "docs/js/logic.js"));
const L = K.createSystem().engine.legend, out = {};
for (const [k, q] of L.questions) if (q.values) out[k] = { kind: q.kind, values: Object.keys(q.values) };
const sha = (await import("crypto")).createHash("sha256").update(fs.readFileSync(path.join(REPO, "docs/js/logic.js"))).digest("hex").slice(0, 16);
fs.writeFileSync(path.join(HERE, "legend_values.json"), JSON.stringify({ about: "legend questions with values, exported from docs/js/logic.js by export_legend_values.mjs", logic_sha256_16: sha, questions: out }, null, 1) + "\n");
console.log(`legend_values.json: ${Object.keys(out).length} keys with values (logic.js ${sha}); topic ${out.topic ? out.topic.values.length : 0} values`);
