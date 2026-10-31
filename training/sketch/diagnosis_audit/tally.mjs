// tally.mjs: label-audit rates with Wilson 95% intervals, from judgments.json and the two samples; also flags the sampled requests
// whose (correct) label the editor executes differently from the text: an undo / redo after a command of the same message, and a
// chain / next whose text order differs from the canvas creation order (assumed = the order of `names`).
import { readFileSync } from "node:fs";
import { wilson } from "./audit_lib.mjs";
const J = JSON.parse(readFileSync(new URL("./judgments.json", import.meta.url)));
const pct = (k, n) => { const [a, b] = wilson(k, n); return `${k}/${n} = ${(k / n * 100).toFixed(1)}% [95% CI ${(a * 100).toFixed(1)}-${(b * 100).toFixed(1)}%]`; };
const split = (s) => String(s).split(/,(?![^(]*\))/).filter(Boolean);
for (const [set, file] of [["dev", "sample_dev.json"], ["train", "sample_train.json"]]) {
  const S = JSON.parse(readFileSync(new URL("./" + file, import.meta.url))), n = S.rows.length, c = { C: 0, A: 0, W: 0, U: 0, "U-line": 0 }, flags = [];
  for (const r of S.rows) {
    const j = J[set][String(r.k)]; c[j ? j[0] : "C"]++;
    const a = r.wire.args, prev = r.others.slice(0, r.j);
    if (["undo", "redo"].includes(a.action) && prev.some((x) => x.startsWith("command:") && !/undo|redo/.test(x))) flags.push(`#${r.k} ${r.id} ${a.action} after a command of the same message: "${r.wire.span}"`);
    if (a.action === "connect" && (["chain", "next"].includes(a.pairing))) { const idx = split(a.from).map((x) => x === "$new" ? 1000 : r.names.indexOf(x)); if (!idx.includes(-1) && idx.join() !== idx.slice().sort((p, q) => p - q).join()) flags.push(`#${r.k} ${r.id} chain from=${a.from} on canvas order ${r.names.join(",")}: the editor links them in canvas order`); }
  }
  console.log(`\n${set}: ${n} requests (seed ${S.seed}, population ${S.population}): C ${c.C}, A ${c.A}, W ${c.W}, U ${c.U}, U-line ${c["U-line"]}`);
  console.log(`  wrong                     ${pct(c.W, n)}`);
  console.log(`  wrong or ambiguous        ${pct(c.W + c.U + c["U-line"], n)}`);
  console.log(`  wrong if 'line' = arrow=none (the editor's cue) ${pct(c.W + c["U-line"], n)}`);
  console.log(`  correct or acceptable     ${pct(c.C + c.A, n)}`);
  console.log(`  label right, editor executes it differently from the text: ${flags.length}`); flags.forEach((f) => console.log("    " + f));
}
