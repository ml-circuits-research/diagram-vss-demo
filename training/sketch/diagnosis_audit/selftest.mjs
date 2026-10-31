// selftest.mjs: feed the GOLD wires of a file to llm_score's canon + alignment path as if they were a reader's output.
// Expected: every wire right, 0 extra wires. Also: gold values the editor's legend rejects, and gold that the editor cannot run.
// node selftest.mjs <file.jsonl> [out.json]
import { writeFileSync } from "node:fs";
import { readRows, goldToNodes, scorePairs, sys, benchScore, K } from "./audit_lib.mjs";
const [file, outp] = process.argv.slice(2);
const rows = readRows(file);
let gold = 0, right = 0, extraW = 0, exact = 0; const fails = [], issues = [], legendErr = [], runErr = [];
for (const r of rows) {
  const { nodes, issues: is } = goldToNodes(r);
  is.forEach((x) => issues.push({ id: r.id, ...x }));
  const s = scorePairs(nodes, r);
  gold += s.nGold; extraW += s.extraWires; const ok = s.pairs.filter((p) => p.right).length; right += ok;
  if (ok === s.nGold && s.nMain === s.nGold) exact++;
  for (const p of s.pairs) if (!p.right) fails.push({ id: r.id, wire: p.j, span: p.goldWire.span, args: p.goldWire.args, miss: p.miss });
  if (s.pairs.length !== s.nGold) fails.push({ id: r.id, what: `aligned ${s.pairs.length} of ${s.nGold}` });
  // the editor's legend check on each gold node (what engine.run does first: an error stops the wire)
  for (const n of nodes) for (const v of sys.engine.legend.validate(n)) legendErr.push({ id: r.id, node: n.id, type: n.type, level: v.level, msg: v.msg });
  // run the gold in a fresh editor whose canvas holds the message's names (default circles): world-independent failures only
  const S = K.createSystem(); S.engine.run((r.names || []).map((nm, i) => ({ id: "c" + i, type: "command", args: { action: "create", name: nm } })));
  const res = S.engine.run(nodes);
  for (const e of res.errors) { const msg = String(e.error.message); if (/Which |can't find|There are no|already exists|nothing to/.test(msg)) continue; runErr.push({ id: r.id, node: e.node.id, args: e.node.args, msg }); }
}
// bench-canon.js score(): the other scoring entry point (docs/js/ui.js bench, score_all.mjs). A row with `wires` takes each gold wire's
// `gold` field, which wires in the TRAIN_MSG_SPEC format do not have (they have `args`): test it with deliberately wrong nodes.
let benchTypeOnly = 0, benchRows = 0;
for (const r of rows) {
  const wrong = r.wires.map((w, i) => ({ id: "s" + (i + 1), type: w.type, args: w.type === "command" ? { action: "undo" } : w.type === "question" ? { ask: "cycle" } : {} }));
  benchRows++; if (benchScore(wrong, r).ok) benchTypeOnly++;
}
const out = { file, messages: rows.length, gold, right, extraWires: extraW, exactMessages: exact, fails, issues, legendErr, runErr, benchCanonScoreWiresBranch: { rows: benchRows, okWithWrongArgs: benchTypeOnly } };
console.log(`${file}: ${rows.length} messages, ${gold} gold wires -> right ${right} (${(right / gold * 100).toFixed(2)}%), extra wires ${extraW}, messages exact ${exact}`);
console.log(`fails ${fails.length}; gold-format issues ${issues.length}; legend errors ${legendErr.filter((x) => x.level === "error").length}, legend warnings ${legendErr.filter((x) => x.level === "warn").length}; world-independent run errors ${runErr.length}`);
console.log(`bench-canon score() on wires rows with deliberately wrong args (same type): ok ${benchTypeOnly}/${benchRows}`);
for (const f of fails.slice(0, 30)) console.log("  FAIL", JSON.stringify(f));
for (const f of issues.slice(0, 30)) console.log("  ISSUE", JSON.stringify(f));
for (const f of legendErr.slice(0, 30)) console.log("  LEGEND", JSON.stringify(f));
for (const f of runErr.slice(0, 40)) console.log("  RUN", JSON.stringify(f));
if (outp) writeFileSync(outp, JSON.stringify(out, null, 1));
