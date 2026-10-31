// sample.mjs: a fixed-seed random sample of requests (gold wires) for the label audit.
// node sample.mjs <n> <seed> <out.json> <file.jsonl> [<file.jsonl> ...]
import { writeFileSync } from "node:fs";
import { readRows, shuffle } from "./audit_lib.mjs";
const [n, seed, out, ...files] = process.argv.slice(2);
const all = [];
for (const f of files) for (const r of readRows(f)) r.wires.forEach((w, j) => all.push({ file: f.split("/").slice(-2).join("/"), id: r.id, j, nWires: r.wires.length }));
const pick = shuffle(all, +seed).slice(0, +n);
const byKey = new Map(); for (const f of files) for (const r of readRows(f)) byKey.set(f.split("/").slice(-2).join("/") + "#" + r.id, r);
const rows = pick.map((p, k) => { const r = byKey.get(p.file + "#" + p.id); return { k: k + 1, ...p, names: r.names, text: r.text, wire: r.wires[p.j], others: r.wires.map((w, i) => i === p.j ? "<<THIS>>" : `${w.type}:${w.args.action || w.args.ask || ""}`) }; });
writeFileSync(out, JSON.stringify({ seed: +seed, population: all.length, n: +n, files, rows }, null, 1));
console.log(`population ${all.length} requests; sampled ${rows.length} with seed ${seed}`);
for (const r of rows) console.log(`\n#${r.k} ${r.id} w${r.j + 1}/${r.nWires} names=${JSON.stringify(r.names)}\n  TEXT: ${r.text}\n  SPAN: ${r.wire.span}\n  GOLD: ${r.wire.type} ${JSON.stringify(r.wire.args)}`);
