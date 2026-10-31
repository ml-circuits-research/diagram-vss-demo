// test_bench_canon.mjs: bench-canon.js score() on `wires` rows. Gold as the reading must score 100%; a corrupted reading must not.
// Run: node test_bench_canon.mjs [dev.jsonl]   (default: the review dev file given as argv[2] or ./review/dev.jsonl)
import { readFileSync } from "node:fs";
import { score } from "../../docs/js/bench-canon.js";
const file = process.argv[2] || "review/dev.jsonl";
const rows = readFileSync(file, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
// gold wire -> reader-style nodes: a mention(...) value becomes a mention wire referenced by {ref}
// a string value holding "a,b" is a list of names (a reader emits it as an array)
const split = (s) => { const out = []; let d = 0, cur = ""; for (const ch of s) { if (ch === "(") d++; if (ch === ")") d--; if (ch === "," && d === 0) { out.push(cur); cur = ""; } else cur += ch; } out.push(cur); return out; };
const toNodes = (r, corrupt) => {
  const nodes = []; let mid = 0;
  const val = (v) => { if (typeof v === "string" && v.startsWith("mention(")) { const args = Object.fromEntries(v.slice(8, -1).split(",").filter(Boolean).map((kv) => kv.split("="))); const id = "m" + ++mid; nodes.push({ id, type: "mention", args }); return { ref: id }; } return v; };
  r.wires.forEach((w, i) => { const args = {}; for (const [k, v] of Object.entries(w.args)) { const parts = Array.isArray(v) ? v : typeof v === "string" && k !== "label" && k !== "name" ? split(v) : [v]; args[k] = parts.length > 1 || Array.isArray(v) ? parts.map(val) : val(parts[0]); } corrupt?.(w, args, i); nodes.push({ id: "s" + (i + 1), type: w.type, args }); });
  return nodes;
};
const run = (name, corrupt, accept) => { let ok = 0; for (const r of rows) if (score(toNodes(r, corrupt), r).ok) ok++; const pass = accept(ok); console.log(`${pass ? "ok  " : "FAIL"} ${name}: ${ok}/${rows.length} messages scored right`); return pass; };
let good = true;
good &= run("gold as the reading", null, (ok) => ok === rows.length);
// same types, wrong action (the bug: only the type was compared)
good &= run("every wire's action replaced by a wrong one", (w, a) => { const k = a.action ? "action" : a.ask ? "ask" : Object.keys(a)[0]; a[k] = a[k] === "zzz" ? "yyy" : "zzz"; }, (ok) => ok === 0);
good &= run("every target replaced by a wrong name", (w, a) => { if (a.target != null) a.target = "Zzz"; else if (a.name != null) a.name = "Zzz"; }, (ok) => ok < rows.length * 0.05);
good &= run("only the first wire of each message corrupted (action)", (w, a, i) => { if (i === 0) a[a.action ? "action" : a.ask ? "ask" : Object.keys(a)[0]] = "zzz"; }, (ok) => ok === 0);
console.log(good ? "\nall passed" : "\nFAILED"); process.exit(good ? 0 : 1);
