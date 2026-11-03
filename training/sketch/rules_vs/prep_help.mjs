// prep_help.mjs: the demo's own example sentences (help.js examples(), docs-concepts.js says(...)) as a set "help" with the RULES' reading as the gold
// (so this set measures AGREEMENT with the Rules on the sentences written for the Rules: Rules = 100% by construction). Single-request sentences only
// (the Rules produce exactly one request), no `pre` sentences. Writes data/help/msg_01.jsonl.  help_ex.json: the scratch list made by train_stats.py's caller.
process.env.LLM_SCORE_LIB = "1"; process.env.SEG ||= "composer";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const REPO = new URL("../../../", import.meta.url).pathname;
const L = await import(REPO + "training/sketch/llm_score.mjs");
const H = JSON.parse(readFileSync(process.argv[2], "utf8")).filter((e) => !e.pre || !e.pre.length).map((e) => e.text);
const dc = readFileSync(REPO + "docs/js/docs-concepts.js", "utf8");
for (const m of dc.matchAll(/says\(((?:'[^']*'(?:\s*,\s*)?)+)\)/g)) for (const t of m[1].matchAll(/'([^']*)'/g)) H.push(t[1]);
const texts = [...new Set(H)], names = ["Start", "Process", "Check", "Done", "Intake"], sys = L.logic.createSystem(), out = [], skipped = [];
for (const t of texts) {
  const nodes = sys.formalize(t, { names, last: [] }).nodes, mains = nodes.filter((n) => n.type !== "mention");
  if (mains.length !== 1) { skipped.push(t + "  [" + mains.length + " requests]"); continue; }
  const n = mains[0], mm = Object.fromEntries(nodes.filter((x) => x.type === "mention").map((x) => [x.id, "mention(" + Object.keys(x.args).sort().map((k) => `${k}=${x.args[k]}`).join(",") + ")"]));
  const args = Object.fromEntries(Object.entries(n.args).map(([k, v]) => [k, v && v.ref && mm[v.ref] ? mm[v.ref] : v]));
  out.push({ id: "help-" + String(out.length).padStart(3, "0"), text: t, names, wires: [{ type: n.type, args }] });
}
mkdirSync(REPO + "training/sketch/rules_vs/data/help", { recursive: true });
writeFileSync(REPO + "training/sketch/rules_vs/data/help/msg_01.jsonl", out.map((o) => JSON.stringify(o)).join("\n") + "\n");
console.log("help sentences", texts.length, "single-request", out.length, "skipped", skipped.length); console.log(skipped.join("\n"));
