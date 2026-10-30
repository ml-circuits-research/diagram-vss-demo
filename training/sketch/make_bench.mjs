// make_bench.mjs: the browser benchmark's test sets (docs/bench/*.json) from the generator's eval files and the hand-labelled sentences.
// Every row: { text, names, type, gold }, where gold maps the demo's argument keys to canonical strings (canon() below), built with
// the SAME adapter the VSS formalizer uses, so the gold of a generated row is the generator's frame written as the demo's wires.
// node make_bench.mjs   (reads worlds/sketch/legend.json, worlds/sketch/kinds.tsv, normalize.json, eval/*.jsonl; writes ../../docs/bench/)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { compile, normalize } from "../../docs/js/snorm.js";
import { readingFromGold, toNodes } from "../../docs/js/vss-adapter.js";
import { canon } from "../../docs/js/bench-canon.js";

const here = (p) => new URL(p, import.meta.url);
const legend = JSON.parse(readFileSync(here("worlds/sketch/legend.json"), "utf8"));
const lex = new Set(readFileSync(here("worlds/sketch/kinds.tsv"), "utf8").split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.split("\t")[0]));
const C = compile(JSON.parse(readFileSync(here("normalize.json"), "utf8")));
const verbs = Object.fromEntries(legend.events.map((e) => [e.id, e.verbs]));
mkdirSync(here("../../docs/bench/"), { recursive: true });

function rows(file, limit) {
  const out = [];
  for (const line of readFileSync(here(file), "utf8").split("\n").filter(Boolean)) {
    const r = JSON.parse(line), { tokens, info } = normalize(C, lex, r.text, r.names);
    const ctx = { names: r.names, last: [] };
    const { nodes } = toNodes(readingFromGold(r, tokens, verbs), info, ctx, { s: 0, m: 0 });
    const main = nodes[nodes.length - 1]; if (!main) continue;
    const gold = canon(main, nodes);
    if (Object.values(gold).some((v) => v === "?")) continue;           // a pronoun with no context: not scorable
    out.push({ text: r.text, names: r.names, type: main.type, gold, template: r.template });
    if (out.length >= limit) break;
  }
  return out;
}
const sets = [
  ["seen", "Generated, seen formulations", "eval/seen.jsonl"],
  ["new_identities", "Generated, names and labels never seen in training", "eval/new_identities.jsonl"],
  ["heldout_formulations", "Generated, held-out formulations (template × prefix never trained)", "eval/heldout_formulations.jsonl"],
];
const index = [];
for (const [id, title, file] of sets) {
  const r = rows(file, 300); writeFileSync(here(`../../docs/bench/${id}.json`), JSON.stringify(r));
  index.push({ id, title, n: r.length, source: "training/sketch/generate.py (" + file + ")" });
}
// hand-labelled sentences (written for the demo before the VSS world existed; several are paraphrases outside every template)
const NAMES = ["Start", "Process", "Check", "Done"];
const hand = JSON.parse(readFileSync(here("hand_labelled.json"), "utf8")).map(([text, type, gold]) => ({ text, names: NAMES, type, gold: Object.fromEntries(Object.entries(gold).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => String(x).toLowerCase()).join(",") : String(v).toLowerCase()])) }));
writeFileSync(here("../../docs/bench/hand.json"), JSON.stringify(hand));
const toRows = (file) => JSON.parse(readFileSync(here(file), "utf8")).map(([text, type, gold]) => ({ text, names: NAMES, type, gold: Object.fromEntries(Object.entries(gold).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => String(x).toLowerCase()).join(",") : String(v).toLowerCase()])) }));
const blind = toRows("hand_blind.json"); writeFileSync(here("../../docs/bench/blind.json"), JSON.stringify(blind));
const low = (gold) => Object.fromEntries(Object.entries(gold).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => String(x).toLowerCase()).join(",") : String(v).toLowerCase()]));
const broad = JSON.parse(readFileSync(here("hand_broad.json"), "utf8")).map(([cat, text, type, gold]) => Array.isArray(type)
  ? { cat, text, names: NAMES, wires: type.map(([t, g]) => ({ type: t, gold: low(g) })) }
  : { cat, text, names: NAMES, type, gold: low(gold) });
writeFileSync(here("../../docs/bench/broad.json"), JSON.stringify(broad));
index.unshift({ id: "broad", title: "Broad English set: commands, questions, typos, casual and multi-clause messages (written blind)", n: broad.length, source: "training/sketch/hand_broad.json" });
index.unshift({ id: "blind", title: "Paraphrases written blind (no formalizer was tuned on them)", n: blind.length, source: "training/sketch/hand_blind.json" });
index.unshift({ id: "hand", title: "Hand-labelled paraphrases (the rules were tuned with these in view)", n: hand.length, source: "training/sketch/hand_labelled.json" });
writeFileSync(here("../../docs/bench/index.json"), JSON.stringify({ sets: index, legend: legend.version, generated: new Date().toISOString().slice(0, 10) }, null, 1));
console.log(index.map((s) => `${s.id}: ${s.n}`).join(", "));
