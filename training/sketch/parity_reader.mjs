// parity_reader.mjs: the one-request reader in the browser (docs/js/vss.js read, docs/js/front.js normalize) against the numpy reader on
// the same exported numbers (parity_reader.py writes the golden file from an export-web folder, dense or sparse route book). Exact: the
// tokens, the SOP text of every span's reading and its status. Number: the residual, max absolute difference printed and bounded (1e-4:
// the browser keeps the route book's cos / sin tables in float32, numpy computes exp(i phase) in float64).
// With a second export folder (--against <dir>) it also counts the spans whose JS reading differs between the two exports (e.g. dense
// vs sparse of the same model): the effect of a format change on the readings themselves, counted three ways: any difference of the SOP
// text (margins and residual included); a difference of what is decided (the wires and their role values: the SOP lines that are not
// _ annotations) or of the status; the status alone.
// A golden file written with --excl (switch EXCL, DECODE.md) is read with the exclusion pairs of <export-web dir>/decode.json.
// node parity_reader.mjs <golden.json> <export-web dir> [--against <export-web dir>]
import { readFileSync } from "node:fs";
import { load } from "../../docs/js/vss.js";
import { normalize } from "../../docs/js/front.js";
const argv = process.argv.slice(2), ag = argv.indexOf("--against");
const g = JSON.parse(readFileSync(argv[0], "utf8"));
const open = async (d) => {
  const dir = d.replace(/\/?$/, "/"), readFile = async (n) => { const b = readFileSync(dir + n); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
  const excl = g.excl ? { excl: JSON.parse(await readFile("decode.json")).excl_pairs } : {};
  return { vss: await load(null, Object.assign({ readFile, sentenceCandidates: true }, excl)), F: JSON.parse(await readFile("front.json")) };
};
const A = await open(argv[1]), B = ag >= 0 ? await open(argv[ag + 1]) : null;
const decided = (sop) => sop.split("\n").filter((l) => !/^\s*_/.test(l)).join("\n");     // the wires and their role values, no _ annotation line
let bad = 0, dRes = 0, nDiff = 0, nStatus = 0, nDecided = 0; const diffs = [], exDiff = [];
const note = (c, what, py, js) => { bad++; if (diffs.length < 8) diffs.push(`${c.id}: ${what}\n   py: ${JSON.stringify(py).slice(0, 400)}\n   js: ${JSON.stringify(js).slice(0, 400)}`); };
for (const c of g.cases) {
  const { tokens } = normalize(c.span, c.names, A.F);
  if (JSON.stringify(tokens) !== JSON.stringify(c.tokens)) { note(c, "tokens", c.tokens, tokens); continue; }
  const r = A.vss.read(tokens.join(" "));
  if (r.sop !== c.sop) note(c, "sop", c.sop, r.sop);
  if (r.status !== c.status) note(c, "status", c.status, r.status);
  dRes = Math.max(dRes, Math.abs(r.residual - c.residual));
  if (B) {
    const q = B.vss.read(tokens.join(" "));
    if (q.sop !== r.sop || q.status !== r.status) nDiff++;
    if (q.status !== r.status) nStatus++;
    if (decided(q.sop) !== decided(r.sop) || q.status !== r.status) {
      nDecided++;
      const a = decided(r.sop).split("\n"), b = decided(q.sop).split("\n"), only = (x, y) => x.filter((l) => !y.includes(l)).map((l) => l.trim()).join(" | ");
      if (exDiff.length < 10) exDiff.push(`${c.id} "${c.span}": ${r.status} -> ${q.status}; only in the first: ${only(a, b)}; only in the second: ${only(b, a)}`);
    }
  }
}
for (const d of diffs) console.log("DIFF " + d);
const tolOk = dRes < 1e-4;
console.log(`reader parity: ${g.cases.length} spans; tokens, SOP texts, statuses: ${bad ? bad + " differences" : "all identical"}; max |residual diff| ${dRes.toExponential(2)} (bound 1e-4: ${tolOk ? "ok" : "EXCEEDED"})`);
if (B) { console.log(`JS readings that differ between ${argv[1]} and ${argv[ag + 1]}: SOP text (margins included) ${nDiff} of ${g.cases.length} spans; wires / values or status ${nDecided}; status ${nStatus}`); for (const e of exDiff) console.log("  " + e); }
process.exit(bad || !tolOk ? 1 : 0);
