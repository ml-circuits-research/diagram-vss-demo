// neural_score.mjs: Rules, VSS (the composer of micro-worlds) and Neural (docs/js/neural.js: act classifier or zero-shot classifier +
// extractive QA, run here by @huggingface/transformers in node) on the same gold messages, with the same per-request metric as
// training/sketch/llm_score.mjs (whose scoring code is imported, not copied).
//   ZS=act-distilbert|act-deberta-xsmall|deberta|distilbert [LIMIT=n] [DEVICE=cpu|cuda] [MODEL_DIR=dir] node training/laptop/neural_score.mjs <dir> [<dir> ...]
// A <dir> holds one or more .jsonl files of gold messages (text, names, wires). Needs `npm install` in training/laptop first.
//   ZS      act-distilbert / act-deberta-xsmall: our fine-tuned act classifier (training/neural/finetune.py), the demo's strategy
//           "finetuned", loaded from the local folder MODEL_DIR/<name> (env.localModelPath; no network);
//           deberta = Xenova/nli-deberta-v3-xsmall (default), distilbert = Xenova/distilbert-base-uncased-mnli: the zero-shot NLI
//           baselines (strategy "zeroshot", from Hugging Face, pinned to neural.js REVISIONS)
//           The question-answering model: MODEL_DIR/qa-distilbert-squad when that folder exists (our hosted copy, as in the demo), else
//           Xenova/distilbert-base-cased-distilled-squad from Hugging Face. The file type of each model is neural.js dtypeOf (q8 unless
//           neural.js DTYPES says otherwise), as in the browser
//   MODEL_DIR  the folder of our models (default docs/model/neural)
//   DEVICE  cpu (default) or cuda (onnxruntime-node CUDA; on an error the script says so and falls back to cpu)
//   LIMIT   only the first n messages of each folder
//   PAIR / SEG / REGISTRY ...: the variables of llm_score.mjs; here PAIR defaults to value and SEG to composer
//   NEURAL_STUB=1: no models (classify returns the first hypothesis, qa an empty answer), to test the plumbing without the network
// Milliseconds per message: the time of formalizing only (the models are loaded, and warmed up, before the timing starts).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";

process.env.LLM_SCORE_LIB = "1"; process.env.SEG ||= "composer"; process.env.PAIR ||= "value";
const { vssFormalize, tally, msgLine, logic: K } = await import("../sketch/llm_score.mjs");
const require = createRequire(import.meta.url);
globalThis.SOPKit = K;                                              // neural.js is a browser IIFE that reads the global SOPKit
const NeuralKit = require("../../docs/js/neural.js");

const dirs = process.argv.slice(2).filter((a) => !a.startsWith("-"));
if (!dirs.length) { console.error("usage: ZS=act-distilbert|act-deberta-xsmall|deberta|distilbert [LIMIT=n] [DEVICE=cpu|cuda] [MODEL_DIR=dir] node training/laptop/neural_score.mjs <dir> [<dir> ...]"); process.exit(2); }
const ZS = process.env.ZS || "deberta", DEVICE = process.env.DEVICE || "cpu", STUB = process.env.NEURAL_STUB === "1", LIMIT = process.env.LIMIT ? +process.env.LIMIT : Infinity;
const MODEL_DIR = resolve(process.env.MODEL_DIR || fileURLToPath(new URL("../../docs/model/neural", import.meta.url)));
const OURS = Object.fromEntries(Object.entries(NeuralKit.OURS).map(([id, folder]) => [folder, id]));   // folder -> id
const FINETUNED = OURS[ZS] && ZS.startsWith("act-");
if (!FINETUNED && !NeuralKit.MODELS.zeroshot[ZS]) throw new Error(`ZS=${ZS}: expected ${Object.values(NeuralKit.OURS).filter((f) => f.startsWith("act-")).concat(Object.keys(NeuralKit.MODELS.zeroshot)).join(" or ")}`);
if (FINETUNED && !STUB && !existsSync(`${MODEL_DIR}/${ZS}/config.json`)) throw new Error(`ZS=${ZS}: no model folder ${MODEL_DIR}/${ZS} (config.json); set MODEL_DIR`);
const QA_LOCAL = existsSync(`${MODEL_DIR}/${NeuralKit.QA_MODEL}/config.json`);
if (!["cpu", "cuda"].includes(DEVICE)) throw new Error(`DEVICE=${DEVICE}: expected cpu or cuda`);
const NAME = `neural-${ZS}`, READERS = ["rules", "vss", NAME];

// the same `m` object NeuralKit.load builds in the browser (neural.js, function load/build), with the node package.
// Our models are loaded by folder name from MODEL_DIR (env.localModelPath); the Hugging Face ones by id, pinned to neural.js REVISIONS.
async function buildModels() {
  const zsId = FINETUNED ? ZS : NeuralKit.MODELS.zeroshot[ZS], qaId = QA_LOCAL ? NeuralKit.QA_MODEL : NeuralKit.MODELS.qaHF;
  if (STUB) return {
    device: "stub", dtype: "none", qaModel: qaId, enumModel: zsId,
    classify: async (text, hyps) => ({ labels: hyps.slice(), scores: hyps.map(() => 1 / hyps.length) }),
    act: async () => [{ label: "create", score: 1 }],
    qa: async () => ({ answer: "", score: 0 }),
  };
  const T = await import("@huggingface/transformers");
  T.env.allowLocalModels = true; T.env.localModelPath = MODEL_DIR + "/";
  const isOurs = (model) => !model.includes("/");   // a folder name in MODEL_DIR
  const build = async (device) => {
    const make = (task, model) => T.pipeline(task, model, { device, dtype: NeuralKit.dtypeOf(OURS[model] || model), ...(isOurs(model) ? { local_files_only: true } : { revision: NeuralKit.revOf(model) }) });
    const qa = await make("question-answering", qaId);
    const m = { device, dtype: [...new Set([zsId, qaId].map((x) => NeuralKit.dtypeOf(OURS[x] || x)))].join("+"), qaModel: qaId, enumModel: zsId };
    m.qa = async (q, c) => { let r = await qa(q, c); if (Array.isArray(r)) r = r[0]; return r || { answer: "", score: 0 }; };
    if (FINETUNED) {
      const clf = await make("text-classification", zsId);
      m.act = async (text) => { const r = await clf(text, { top_k: null }); return Array.isArray(r[0]) ? r[0] : r; };   // every class, best first
      await m.act("draw a circle");
    } else {
      const zs = await make("zero-shot-classification", zsId);
      m.classify = async (text, hyps) => { const r = await zs(text, hyps, { hypothesis_template: "{}" }); return Array.isArray(r) ? r[0] : r; };
      await m.classify("draw a circle", ["This asks the editor to change the diagram.", "This asks a question about the diagram."]);
    }
    await m.qa("What is drawn?", "A red circle is drawn.");
    return m;
  };
  if (DEVICE === "cuda") {
    try { return await build("cuda"); }
    catch (e) { console.error(`DEVICE=cuda failed (${String(e && e.message || e).split("\n")[0]}); falling back to cpu`); }
  }
  return await build("cpu");
}
const t0load = performance.now(), models = await buildModels();
console.error(`models loaded in ${((performance.now() - t0load) / 1000).toFixed(1)} s: ${models.enumModel} + ${models.qaModel} · device ${models.device} · dtype ${models.dtype}`);
const rsys = K.createSystem(), nsys = K.createSystem(), neural = NeuralKit.create(nsys.engine, nsys.formalize);
neural.setModels(models); neural.setStrategy(FINETUNED ? "finetuned" : "zeroshot");
console.log(`neural: ${models.enumModel} + ${models.qaModel} · device ${models.device} · dtype ${models.dtype}${STUB ? " (STUB models)" : ""}${LIMIT < Infinity ? ` · LIMIT ${LIMIT} per folder` : ""}`);

const blank = () => ({ exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0, byAct: {} });
const fresh = () => Object.fromEntries(READERS.map((f) => [f, blank()]));
const newMs = () => Object.fromEntries(READERS.map((f) => [f, 0]));
const pc = (x, T) => (x / T.gold * 100).toFixed(1) + "%";
const ctxOf = (r) => ({ names: (r.names || []).slice(), last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null });
let done = 0, neuralErrors = 0;
const ALLT = fresh(), ALLMS = newMs(); let ALLN = 0;

function report(title, tot, ms, n) {
  console.log(title);
  for (const f of READERS) { const T = tot[f]; console.log(`  ${f.padEnd(5)} messages fully right ${(T.exact / n * 100).toFixed(1)}% · wires right ${pc(T.right, T)} (${T.right}/${T.gold}) · act found ${pc(T.acts, T)} · extra wires ${T.extra}`); }
  for (const f of READERS) console.log("  " + msgLine(f, tot[f], n));
  for (const f of READERS) { const T = tot[f]; console.log(`  ${f.padEnd(5)} per request: correct ${pc(T.right, T)} · not done ${pc(T.missed, T)} · done wrong ${pc(T.wrongAligned, T)} · extra ${T.extra} (${pc(T.extra, T)})`); }
  const acts = Object.keys(tot.rules.byAct).sort((a, b) => tot.rules.byAct[b][1] - tot.rules.byAct[a][1]);
  console.log(`  per act (${READERS.join(" · ")} · n): ` + acts.map((a) => `${a.split(":").pop() || a} ${READERS.map((f) => (tot[f].byAct[a] || [0])[0]).join("·")}·${tot.rules.byAct[a][1]}`).join(", "));
  console.log("  mean ms per message (formalizing only): " + READERS.map((f) => `${f} ${(ms[f] / n).toFixed(1)}`).join(" · "));
}

for (const d of dirs) {
  const files = readdirSync(d).filter((f) => f.endsWith(".jsonl")).sort();
  const rows = files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l))).slice(0, LIMIT);
  const tot = fresh(), ms = newMs();
  for (const r of rows) {
    const out = {}, time = async (f, fn) => { const t = performance.now(); try { out[f] = await fn(); } catch (e) { out[f] = []; if (f === NAME) { neuralErrors++; if (neuralErrors <= 5) console.error(`neural error on "${r.text}": ${e && e.message || e}`); } } ms[f] += performance.now() - t; };
    await time("rules", () => rsys.formalize(r.text, ctxOf(r)).nodes);
    await time("vss", () => vssFormalize(r.text, ctxOf(r)));
    await time(NAME, async () => {
      const res = await neural.formalize(r.text, ctxOf(r)), src = new Map(res.analyses.map((a) => [a.id, a.src]));   // the source text of each request, for PAIR=value pairing
      for (const n of res.nodes) if (n.type !== "mention" && src.has(n.id)) Object.defineProperty(n, "src", { value: src.get(n.id), enumerable: false });
      return res.nodes;
    });
    for (const f of READERS) tally(tot[f], out[f], r);
    if (++done % 50 === 0) console.error(`${done} messages scored (${d.split("/").filter(Boolean).pop()})`);
  }
  const n = rows.length; ALLN += n;
  for (const f of READERS) { ALLMS[f] += ms[f]; for (const k of Object.keys(ALLT[f])) if (k !== "byAct") ALLT[f][k] += tot[f][k]; for (const [a, v] of Object.entries(tot[f].byAct)) { const b = ALLT[f].byAct[a] ||= [0, 0]; b[0] += v[0]; b[1] += v[1]; } }
  report(`\n${d}: ${n} messages, ${tot.rules.gold} gold wires`, tot, ms, n);
}
if (dirs.length > 1) report(`\nALL (${dirs.join(" + ")}): ${ALLN} messages, ${ALLT.rules.gold} gold wires`, ALLT, ALLMS, ALLN);
if (neuralErrors) console.log(`\n${NAME}: ${neuralErrors} messages raised an error (counted as no request read)`);
