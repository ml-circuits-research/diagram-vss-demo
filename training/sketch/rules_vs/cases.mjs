// cases.mjs <cases_in.json> <cases_out.json>: what each reader produced for the picked cases (canonical form of the request that covers the gold span),
// so the cause can be read. Rules, VSS-G (docs/model/micro/registry.json), SOP-BERT-G (docs/model/neural/sop-bert). Setup lines copied from fresh2/collect_sop.mjs.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, basename, resolve } from "node:path";
process.env.LLM_SCORE_LIB = "1"; process.env.SEG ||= "composer"; process.env.PAIR ||= "value";
const REPO = new URL("../../../", import.meta.url).pathname;
const L = await import(REPO + "training/sketch/llm_score.mjs");
const K = L.logic; globalThis.SOPKit = K;
const { nextContext } = await import(REPO + "docs/js/vss-composer.js");
const { canon, canonWant } = await import(REPO + "docs/js/bench-canon.js");
const require = createRequire(import.meta.url), NeuralKit = require(REPO + "docs/js/neural.js");
const T = await import(pathToFileURL(REPO + "training/laptop/node_modules/@huggingface/transformers/dist/transformers.node.mjs").href);
const MODEL_PATH = resolve(REPO + "docs/model/neural/sop-bert"), MODEL_DIR = dirname(MODEL_PATH), ZS = basename(MODEL_PATH);
T.env.allowLocalModels = true; T.env.localModelPath = MODEL_DIR + "/";
const OURS = Object.fromEntries(Object.entries(NeuralKit.OURS).map(([id, folder]) => [folder, id])), dtype = NeuralKit.dtypeOf(OURS[ZS] || ZS);
const tokenizer = await T.AutoTokenizer.from_pretrained(ZS, { local_files_only: true }), model = await T.AutoModel.from_pretrained(ZS, { device: "cpu", dtype, local_files_only: true });
const m = Object.assign({ device: "cpu", dtype, qaModel: ZS, enumModel: ZS }, NeuralKit.makeReader(T, tokenizer, model));
const nsys = K.createSystem(), neural = NeuralKit.create(nsys.engine, () => { throw new Error("SOP-BERT called the Rules reader"); });
neural.setModels(m); neural.setStrategy("finetuned");
const sys = K.createSystem();
const show = (nodes) => nodes.filter((n) => n.type !== "mention").map((n) => ({ act: `${n.type}:${n.args.action || n.args.ask || ""}`, got: canon(n, nodes) }));
const cases = JSON.parse(readFileSync(process.argv[2], "utf8")), out = [];
for (const c of cases) {
  const ctx = () => ({ names: (c.names || []).slice(), last: [] });
  const rn = sys.formalize(c.text, ctx()).nodes, vn = L.vssFormalize(c.text, ctx());
  const sr = await neural.formalize(c.text, ctx(), { update: nextContext });
  const want = canonWant(c.gold.act.split(":")[0], c.gold.args);
  out.push({ ...c, want, rules: show(rn), vss: show(vn), sop: show(sr.nodes) });
}
writeFileSync(process.argv[3], JSON.stringify(out, null, 1)); console.log("cases", out.length);
