// check_roles_node.mjs: does a joint model folder (training/neural/finetune_roles.py) load in transformers.js 3.8.1 (AutoTokenizer + AutoModel,
// q8) and does docs/js/neural.js makeReader (the demo's decoding code) read the same as torch? Compares, per request: the word pieces,
// the act, the class of every class key, and the tag of every word.
// Usage: node training/neural/check_roles_node.mjs <parent dir of the model folder> <model folder name> <torch_ref.jsonl>
// (needs `cd training/laptop && npm install`). Last stdout line: {"ids": "k/n", "act": "k/n", "classes": "k/n", "tags": "k/n"} .
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const [parent, name, refPath] = process.argv.slice(2);
const require = createRequire(fileURLToPath(new URL("../laptop/package.json", import.meta.url)));
const T = require("@huggingface/transformers");
globalThis.SOPKit = require("../../docs/js/logic.js");
const NeuralKit = require("../../docs/js/neural.js");
T.env.allowLocalModels = true; T.env.allowRemoteModels = false; T.env.localModelPath = parent.endsWith("/") ? parent : parent + "/"; T.env.useBrowserCache = false;
const tokenizer = await T.AutoTokenizer.from_pretrained(name, { local_files_only: true });
const model = await T.AutoModel.from_pretrained(name, { device: "cpu", dtype: "q8", local_files_only: true });
const { read, reader } = NeuralKit.makeReader(T, tokenizer, model);
const rows = readFileSync(refPath, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const same = { ids: 0, act: 0, classes: 0, tags: 0 }; let k = 0;
for (const r of rows) {
  const o = await read(r.text), cls = Object.fromEntries(Object.entries(o.classes).filter(([, c]) => c.value != null).map(([key, c]) => [key, c.value]));
  const d = {
    ids: JSON.stringify(o.ids) === JSON.stringify(r.ids), act: o.acts[0].label === r.act,
    classes: JSON.stringify(Object.entries(cls).sort()) === JSON.stringify(Object.entries(r.classes).sort()), tags: JSON.stringify(o.tags) === JSON.stringify(r.tags),
  };
  for (const x of Object.keys(same)) same[x] += d[x];
  if (Object.values(d).some((x) => !x) && k++ < 5) console.log(`  differs: "${r.text}"`, JSON.stringify({ act: [r.act, o.acts[0].label], classes: [r.classes, cls], tags: [r.tags.join(" "), o.tags.join(" ")], ids: d.ids }));
}
const n = rows.length;
console.log(`node makeReader q8 vs torch on ${n} requests: word pieces ${same.ids}/${n}, act ${same.act}/${n}, classes ${same.classes}/${n}, tags ${same.tags}/${n} (${reader.tags.length} tags, ${reader.classes.length} class keys)`);
console.log(JSON.stringify(Object.fromEntries(Object.entries(same).map(([x, v]) => [x, `${v}/${n}`]))));
