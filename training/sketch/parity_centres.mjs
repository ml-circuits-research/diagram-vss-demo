// parity_centres.mjs: the centre reader in the browser (docs/js/vss.js readMessage, docs/js/front.js normalizeMessage) against the numpy
// reader on the same exported numbers (parity_centres.py writes the golden file). Exact: tokens, centres (position, accepted), members,
// the SOP text of every accepted centre's reading, statuses, ignored spans. Numbers: null probabilities, residuals and centre states,
// max absolute / relative difference printed and bounded (1e-9: both sides compute in float64 from the same float64 inputs; the cos /
// sin / exp implementations of numpy and V8 may differ in the last bit).
// node parity_centres.mjs <golden.json> <export-web dir>
import { readFileSync } from "node:fs";
import { load } from "../../docs/js/vss.js";
import { normalizeMessage } from "../../docs/js/front.js";
const g = JSON.parse(readFileSync(process.argv[2], "utf8")), dir = process.argv[3].replace(/\/?$/, "/");
const readFile = async (n) => { const b = readFileSync(dir + n); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true }), F = JSON.parse(await readFile("front.json"));
let bad = 0, nC = 0, dNull = 0, dRes = 0, dS = 0; const diffs = [];
const note = (c, what, py, js) => { bad++; if (diffs.length < 8) diffs.push(`${c.id}: ${what}\n   py: ${JSON.stringify(py).slice(0, 300)}\n   js: ${JSON.stringify(js).slice(0, 300)}`); };
for (const c of g.cases) {
  const { tokens } = normalizeMessage(c.text, c.names, F);
  if (JSON.stringify(tokens) !== JSON.stringify(c.tokens)) { note(c, "tokens", c.tokens, tokens); continue; }
  const r = vss.readMessage(tokens.join(" "));
  let S = null; if (c.centres.some((x) => x.S)) S = vss.reader.centreChart(r.tokens)[3];
  if (JSON.stringify(r.ignored) !== JSON.stringify(c.ignored)) note(c, "ignored", c.ignored, r.ignored);
  if (r.centres.length !== c.centres.length) { note(c, "number of centres", c.centres.length, r.centres.length); continue; }
  c.centres.forEach((p, j) => {
    const q = r.centres[j]; nC++;
    for (const k of ["pos", "accepted", "members", "sop", "status"]) if (JSON.stringify(p[k]) !== JSON.stringify(q[k])) note(c, `centre ${j} ${k}`, p[k], q[k]);
    dNull = Math.max(dNull, Math.abs(p.null - q.null));
    if (p.residual !== undefined) dRes = Math.max(dRes, Math.abs(p.residual - q.residual));
    if (p.S) { let n = 0, e = 0; for (let d = 0; d < p.S[0].length; d++) { n += p.S[0][d] ** 2 + p.S[1][d] ** 2; e += (p.S[0][d] - S[j].re[d]) ** 2 + (p.S[1][d] - S[j].im[d]) ** 2; } dS = Math.max(dS, Math.sqrt(e / n)); }
  });
}
for (const d of diffs) console.log("DIFF " + d);
const tolOk = dNull < 1e-9 && dRes < 1e-9 && dS < 1e-9;
console.log(`centre parity: ${g.cases.length} messages, ${nC} centres; exact fields: ${bad ? bad + " differences" : "all identical"}; ` +
  `max |null diff| ${dNull.toExponential(2)}, max |residual diff| ${dRes.toExponential(2)}, max relative state diff ${dS.toExponential(2)} (bound 1e-9: ${tolOk ? "ok" : "EXCEEDED"})`);
process.exit(bad || !tolOk ? 1 : 0);
