// clarify_experiment.mjs: the measured comparison of CLARIFY_DESIGN.md: what VSS-BERT does with the user's follow-up to a request it did not
// execute, under design A (a question; the user answers with the missing value only) and design B (no question; the user writes the request
// again explicitly, in the shape the reply shows: docs/js/clarify.js commandText).
//
//   node training/sketch/clarify_experiment.mjs build <rows.json of combine/failures_vss_bert.mjs> <out dir> <data dir> [<data dir> ...]
//       -> <out dir>/B/batch_01.jsonl, <out dir>/A/batch_01.jsonl, <out dir>/cases.json
//   (then the readers read both folders: a copy of combine/collect_pair.mjs whose context takes `last` from the row, see CLARIFY_DESIGN.md)
//   node training/sketch/clarify_experiment.mjs score <out dir>     (after combine/failures_vss_bert.mjs on each folder's records)
//
// The cases: every request VSS-BERT did not execute on the test parts of fresh2 and short3 (held, right or wrong), whose gold can be written as
// an explicit command (facts and rules cannot) and whose "$new" (a shape made earlier in the message) has a name.
// Follow-up messages (one per case, read alone, with the drawing's names = the message's names + the shapes the message creates):
//   B: the gold request written explicitly by commandText (the clearer command with the values the user meant);
//   A: the answer to the question about the first key the two readers disagree on (the gold value of that key in words: "teal", "Batter and
//      Pan", "below Kitchen"), or, when the reading has a context fill and no disagreement, the name the user meant; context `last` = the
//      names of the held request (the most favourable context: the shapes the question was about are the last ones talked about).
//      Cases with no disagreement and no fill have no slot to ask about (A would ask "did you mean ...?", answered by "yes": that is the
//      "Do it anyway" button, scored from the records without a reader).
// The gold of a follow-up message is the held request's gold (what the user wants done in the end).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { commandText, mentionOf } from "../../docs/js/clarify.js";

const [MODE, ...ARGS] = process.argv.slice(2);
const readJ = (f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const NAME_KEYS = ["target", "from", "to", "anchor"];

if (MODE === "build") {
  const [ROWS, OUT, ...DIRS] = ARGS;
  const rows = JSON.parse(readFileSync(ROWS, "utf8"));
  const RAW = new Map();
  for (const d of DIRS) for (const f of readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)))
    for (const r of readJ(`${d}/${f}`)) if (Array.isArray(r.wires) && !RAW.has(r.id)) RAW.set(r.id, r);
  const cases = [], A = [], B = [];
  let skipped = { fact: 0, newUnnamed: 0, unrendered: 0 };
  for (const r of rows) {
    if (r.part !== "test" || !(r.kind === "held_right" || r.kind === "held_wrong")) continue;
    const raw = RAW.get(r.id), w = raw.wires.find((x) => x.span === r.gold_span && !x.pending);
    if (!w || !w.args || !(w.args.action || w.args.ask)) { skipped.fact++; continue; }
    // the names of the shapes the message creates (raw case), in order; "$new" -> the last one created before this request
    const created = [];
    for (const x of raw.wires) { if (x === w) break; if (x.args && x.args.action === "create" && x.args.name && !x.args.count) created.push(...String(x.args.name).split(",")); }
    const json = JSON.stringify(w.args);
    if (json.includes("$new") && !created.length) { skipped.newUnnamed++; continue; }
    const args = JSON.parse(json.replace(/\$new/g, created[created.length - 1] || "$new"));
    const names = [...new Set([...(raw.names || []), ...raw.wires.filter((x) => x.args && x.args.action === "create" && x.args.name).flatMap((x) => String(x.args.name).split(","))])];
    const goldC = Object.fromEntries(Object.entries(r.gold).map(([k, v]) => [k, typeof v === "string" ? v.replace(/\$new/g, (created[created.length - 1] || "$new").toLowerCase()) : v]));
    const btext = commandText(goldC, { names });
    if (!btext || /‹/.test(btext)) { skipped.unrendered++; continue; }
    const id = `${r.id}#${r.gold_span.slice(0, 24)}`;
    const wire = { span: null, type: w.type, args };
    // a connect with a label is written as two commands (clarify.js): its gold is the two requests the engine runs for it
    const bw = args.action === "connect" && args.label != null && args.to != null
      ? [{ type: "command", args: Object.fromEntries(Object.entries(args).filter(([k]) => k !== "label")), span: btext.slice(0, btext.indexOf(". ") + 1) },
         { type: "command", args: { action: "label", from: args.from, to: args.to, label: args.label }, span: btext.slice(btext.indexOf(". ") + 2) }]
      : [Object.assign({}, wire, { span: btext })];
    B.push({ id: "B:" + id, text: btext, names, wires: bw });
    // A: the slot asked about
    const dis = (r.sop_differ || []).map((d) => d.key).filter((k) => k !== "action" && k !== "ask" && goldC[k] != null);
    const fillKey = r.ctx_fill ? NAME_KEYS.find((k) => goldC[k] && !mentionOf(goldC[k])) : null;
    const key = dis[0] || fillKey || null;
    const last = NAME_KEYS.flatMap((k) => (goldC[k] && !mentionOf(goldC[k]) ? String(goldC[k]).split(",") : [])).map((n) => names.find((x) => x.toLowerCase() === n) || n);
    let atext = null;
    if (key) {
      const g = goldC[key];
      if (NAME_KEYS.includes(key) || key === "name") {
        const m = mentionOf(g);
        const one = (n) => names.find((x) => x.toLowerCase() === n) || n[0].toUpperCase() + n.slice(1);
        atext = m ? commandText({ ask: "describe", target: g }, { names }).replace(/^Describe /, "").replace(/\.$/, "") : ((xs) => (xs.length < 2 ? xs.join("") : xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1]))(String(g).split(",").map(one));
        if (key === "anchor" && goldC.position) atext = commandText({ action: "move", target: "x", position: goldC.position, anchor: g }, { names }).replace(/^Move X /, "").replace(/\.$/, "");
      } else if (key === "position") atext = commandText({ action: "move", target: "x", position: g, anchor: goldC.anchor }, { names }).replace(/^Move X /, "").replace(/\.$/, "");
      else if (key === "label") atext = `“${g}”`;
      else if (key === "axis") atext = g === "vertical" ? "vertically" : "horizontally";
      else if (key === "superlative" || key === "property" || key === "layout" || key === "style" || key === "color" || key === "outline" || key === "shape" || key === "size" || key === "direction" || key === "count") atext = String(g);
      else atext = String(g);
      A.push({ id: "A:" + id, text: atext, names, last, wires: [Object.assign({}, wire, { span: atext })] });
    }
    cases.push({ id, row: r.id, set: r.set, kind: r.kind, situation: r.situation, conf: r.conf, key, a: atext, b: btext, gold: goldC, got: r.got });
  }
  mkdirSync(`${OUT}/A`, { recursive: true }); mkdirSync(`${OUT}/B`, { recursive: true });
  writeFileSync(`${OUT}/A/batch_01.jsonl`, A.map((x) => JSON.stringify(x)).join("\n") + "\n");
  writeFileSync(`${OUT}/B/batch_01.jsonl`, B.map((x) => JSON.stringify(x)).join("\n") + "\n");
  writeFileSync(`${OUT}/cases.json`, JSON.stringify(cases));
  console.log(`cases ${cases.length} (B ${B.length}, A ${A.length}); skipped ${JSON.stringify(skipped)}`);
} else if (MODE === "score") {
  const [OUT] = ARGS;
  const cases = JSON.parse(readFileSync(`${OUT}/cases.json`, "utf8"));
  const pc = (a, b) => (b ? ((100 * a) / b).toFixed(1) + "%" : "-");
  const res = {};
  for (const D of ["A", "B"]) {
    const R = JSON.parse(readFileSync(`${OUT}/${D}_rows.json`, "utf8")).filter((x) => x.part !== undefined);
    const by = new Map(); for (const x of R) { const id = x.id.slice(2); (by.get(id) || by.set(id, []).get(id)).push(x); }
    res[D] = by;
  }
  const outcome = (rs) => {   // the follow-up message's result for the user: the held request done right, done wrong, or not done
    if (!rs) return "not asked";
    const g = rs.filter((x) => x.gold);   // the rows of the gold requests (two for a connect with a label in B)
    const ex = rs.filter((x) => x.kind === "executed_wrong" || x.kind === "extra_executed");
    if (g.length && g.every((x) => x.kind === "done_right")) return ex.length ? "right + extra" : "right";
    if (ex.length) return "wrong";
    return "not done";
  };
  const slotRead = (rs, key, gold) => !!(rs && rs.some((x) => x.got && key && x.got[key] === gold[key]));
  const groups = [["all held", () => true], ["held, reading right", (c) => c.kind === "held_right"], ["held, reading wrong", (c) => c.kind === "held_wrong"],
    ["fresh2", (c) => c.set === "fresh2"], ["short3", (c) => c.set === "short3"]];
  console.log("| cases | n | B: done right | B: done wrong | B: not done | A (n with a slot) | A: done right | A: done wrong | A: not done | A: some reading has the slot value |");
  console.log("|---|---|---|---|---|---|---|---|---|---|");
  for (const [name, f] of groups) {
    const C = cases.filter(f), CA = C.filter((c) => c.a != null);
    const ob = C.map((c) => outcome(res.B.get(c.id))), oa = CA.map((c) => outcome(res.A.get(c.id)));
    const cnt = (o, k) => o.filter((x) => x === k || (k === "right" && x === "right + extra")).length;
    console.log(`| ${name} | ${C.length} | ${pc(cnt(ob, "right"), C.length)} | ${pc(cnt(ob, "wrong") + ob.filter((x) => x === "right + extra").length, C.length)} | ${pc(cnt(ob, "not done"), C.length)} | ${CA.length} | ${pc(cnt(oa, "right"), CA.length)} | ${pc(cnt(oa, "wrong") + oa.filter((x) => x === "right + extra").length, CA.length)} | ${pc(cnt(oa, "not done"), CA.length)} | ${pc(CA.filter((c) => slotRead(res.A.get(c.id), c.key, c.gold)).length, CA.length)} |`);
  }
  // A's slot keys
  const byKey = {}; for (const c of cases.filter((c) => c.a != null)) { const o = outcome(res.A.get(c.id)); (byKey[c.key] ||= { n: 0, right: 0, slot: 0 }); byKey[c.key].n++; if (o.startsWith("right")) byKey[c.key].right++; if (slotRead(res.A.get(c.id), c.key, c.gold)) byKey[c.key].slot++; }
  console.log("\nA by the key asked about:", JSON.stringify(byKey));
  // A2: the value of the asked key, taken from the answer's reading and put into the held reading by code (no reader reads the result):
  // right when the answer's reading has the value AND the held reading with that value equals the gold
  { const CA = cases.filter((c) => c.a != null && c.got);
    const fix = (c) => { const r = Object.assign({}, c.got, { [c.key]: c.gold[c.key] }); return Object.entries(c.gold).every(([k, v]) => (r[k] ?? "∅") === v) && Object.keys(r).every((k) => k === "action" || k === "ask" || k in c.gold); };
    const ok = CA.filter((c) => slotRead(res.A.get(c.id), c.key, c.gold) && fix(c)).length, wouldWrong = CA.filter((c) => slotRead(res.A.get(c.id), c.key, c.gold) && !fix(c)).length;
    console.log(`\nA2 (merge by code, upper bound): of ${CA.length} cases with a slot, right after the merge ${pc(ok, CA.length)}; the merge gives a reading still wrong ${pc(wouldWrong, CA.length)}`); }
  // "yes" = Do it anyway on the shown reading: right when the held reading was right
  const yes = cases.filter((c) => c.a == null);
  console.log(`\nno slot to ask about (A asks "did you mean ...?"): ${yes.length} cases; "yes" runs the reading: right ${pc(yes.filter((c) => c.kind === "held_right").length, yes.length)}, wrong ${pc(yes.filter((c) => c.kind === "held_wrong").length, yes.length)}`);
  // examples
  const ex = (D, k, n) => cases.filter((c) => (D === "A" ? c.a != null : true) && outcome(res[D].get(c.id)).startsWith(k)).slice(0, n);
  for (const [D, k] of [["B", "right"], ["B", "wrong"], ["B", "not done"], ["A", "right"], ["A", "wrong"], ["A", "not done"]]) {
    console.log(`\n${D} ${k}:`);
    for (const c of ex(D, k, 6)) {
      const rs = res[D].get(c.id) || [], got = rs.filter((x) => x.got).map((x) => `${x.kind}:${JSON.stringify(x.got)}`).join(" ; ");
      console.log(`  ${c.row} [${c.key || "-"}] ${D === "A" ? JSON.stringify(c.a) : JSON.stringify(c.b)} -> ${got.slice(0, 220)}`);
    }
  }
} else { console.error("usage: clarify_experiment.mjs build|score ..."); process.exit(2); }
