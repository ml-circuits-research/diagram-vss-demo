// verbless.mjs: read-only measurement of the action-resolution rule for requests without an action word. See VERBLESS.md.
// usage: node verbless.mjs [list]   ("list" prints the no-event triggers only; with VERBLESS_CLASS=<json file> classifies (i)/(ii))
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const R = "/home/claude/diagram-vss-demo/";
const FRONT = await import(R + "docs/js/front.js");
const F = JSON.parse(readFileSync(R + "docs/model/fix_p80_s0/front.json", "utf8"));
const model = JSON.parse(readFileSync(R + "docs/model/fix_p80_s0/model.json", "utf8"));
const verbs = new Set(); for (const e of model.legend.events) for (const v of e.verbs) verbs.add(v);
const splitOf = (m, s) => parseInt(createHash("sha256").update(m.id).digest("hex").slice(0, 8), 16) / 2 ** 32 < s;
const msgs = [];
for (const d of ["sonnet_msg", "haiku_msg"]) for (const f of readdirSync(R + "training/sketch/llm_train/" + d).filter((f) => /^msg_.*\.jsonl$/.test(f)))
  for (const l of readFileSync(`${R}training/sketch/llm_train/${d}/${f}`, "utf8").split("\n").filter(Boolean)) { const m = JSON.parse(l); if (splitOf(m, 0.8)) msgs.push(m); }
// ---- frames, parsed from the legend text of TRAIN_MSG_SPEC.md (logic.js lists questions and values, not keys per action)
const spec = readFileSync(R + "training/sketch/llm_train/TRAIN_MSG_SPEC.md", "utf8");
const allKeys = new Set(); for (const m of msgs) for (const w of m.wires) for (const k of Object.keys(w.args)) if (k !== "action" && k !== "ask") allKeys.add(k);
const lines = spec.split("\n"), a0 = lines.findIndex((l) => l.startsWith("Commands, by `action`")), q0 = lines.findIndex((l) => l.startsWith("Questions, by `ask`")), f0 = lines.findIndex((l) => l.startsWith("Facts:"));
const keysIn = (txt) => { txt = txt.replace(/\(\+\s*([^)]*)\)/g, ", $1 ").replace(/\(([^)]*)\)/g, (_, inner) => " " + [...inner.matchAll(/`(\w+)`/g)].map((x) => x[1]).join(" ") + " "); return new Set(txt.split(/[^A-Za-z]+/).filter((w) => allKeys.has(w))); };   // "(+ anchor)" = key kept; other parentheses are prose (only backticked keys kept)
const frames = {};
const addBullets = (from, to, pre) => { for (const l of lines.slice(from + 1, to)) { if (!l.startsWith("- ")) continue;
  for (const part of l.slice(2).split(";")) { const m = part.match(/^\s*((?:`\w+`(?:,\s*)?)+):\s*(.*)$/); if (!m) { for (const x of part.matchAll(/`(\w+)`/g)) frames[pre + x[1]] ??= new Set(); continue; }
    const names = [...m[1].matchAll(/`(\w+)`/g)].map((x) => x[1]), ks = keysIn(m[2]); for (const n of names) frames[pre + n] = new Set(ks); } } };
addBullets(a0, q0, "");
// bullets under "Questions, by ask"
addBullets(q0, f0, "?");
{ const l = lines[f0]; const fm = l.match(/Facts:\s*([^.]*)\./), rm = l.match(/Rules:\s*([^.]*)\./); frames["fact"] = keysIn(fm[1]); frames["rule"] = keysIn(rm[1]); }
// the bullet "undo; redo; forget (...)" : names without colon
for (const n of ["undo", "redo", "forget"]) frames[n] ??= new Set();
const idOf = (w) => (w.type === "command" ? w.args.action : w.type === "question" ? "?" + w.args.ask : w.type);   // "?x" = question ask x
const goldKeys = (w) => Object.keys(w.args).filter((k) => k !== "action" && k !== "ask");
if (process.argv[2] === "frames") { for (const [k, v] of Object.entries(frames)) console.log(k.padEnd(14), [...v].sort().join(", ")); process.exit(); }
// ---- requests without an event token
const rows = [];
for (const m of msgs) { const created = []; m.wires.forEach((w, i) => {
  if (w.span && m.text.includes(w.span)) {
    const { tokens } = FRONT.normalize(w.span, (m.names || []).concat(created), F);
    if (!tokens.some((t) => verbs.has(t))) rows.push({ id: m.id, i, span: w.span, trigger: w.trigger, tokens: tokens.join(" ") });
  }
  if (w.type === "command" && w.args.action === "create" && w.args.name) created.push(String(w.args.name)); }); }
if (process.argv[2] === "list") { const c = {}; for (const r of rows) c[r.trigger] = (c[r.trigger] || 0) + 1;
  console.log(rows.length, "requests without event token;", msgs.length, "fit messages"); console.log(JSON.stringify(c)); process.exit(); }
// ---- classification (i)/(ii): decided by reading the trigger list; file maps trigger -> "i" or "ii"
const cls = JSON.parse(readFileSync(new URL("./classes.json", import.meta.url), "utf8"));
const unclassified = rows.filter((r) => !(r.trigger in cls)); if (unclassified.length) { console.log("UNCLASSIFIED", unclassified.map((r) => r.trigger)); process.exit(1); }
const I = rows.filter((r) => cls[r.trigger] === "i"), II = rows.filter((r) => cls[r.trigger] === "ii");
const byId = new Map(msgs.map((m) => [m.id, m]));
const fr = (id) => frames[id] || new Set();
const run = (inherit) => { const out = { right: [], wrong: [], ask: [] };
  for (const r of I) { const w = byId.get(r.id).wires[r.i], prev = byId.get(r.id).wires[r.i - 1], K = goldKeys(w), gold = idOf(w);
    let ans = null, how = "";
    if (inherit && prev && K.every((k) => fr(idOf(prev)).has(k))) { ans = idOf(prev); how = "inherit"; }
    else { const c = Object.keys(frames).filter((a) => K.every((k) => frames[a].has(k))); if (c.length === 1) { ans = c[0]; how = "unique"; } else how = `ask (${c.length} frames fit)`; }
    const rec = { id: r.id, span: r.span, trigger: r.trigger, K, prev: prev ? `${prev.span} [${idOf(prev)}]` : null, gold, ans, how };
    out[ans === null ? "ask" : ans === gold ? "right" : "wrong"].push(rec); }
  return out; };
const A = run(true), B = run(false);
writeFileSync(new URL("./result.json", import.meta.url), JSON.stringify({ nFit: msgs.length, nNoEvent: rows.length, I: I.length, II: II.length, withInherit: A, noInherit: B, II_examples: II.slice(0, 12), cls }, null, 1));
const pct = (n) => `${n} (${(100 * n / I.length).toFixed(1)}%)`;
console.log(`fit messages ${msgs.length}; no event token ${rows.length}; (i) ${I.length}; (ii) ${II.length}`);
for (const [nm, o] of [["with inheritance", A], ["without inheritance", B]]) console.log(nm, "right", pct(o.right.length), "wrong", pct(o.wrong.length), "ask", pct(o.ask.length));
