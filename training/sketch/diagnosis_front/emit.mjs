// emit.mjs: per request of a jsonl file: tokens after FRONT.normalize (same as error_analysis.mjs), verb, ok flag. usage: MODEL=.. node emit.mjs file.jsonl out.json
import { readFileSync, writeFileSync } from "node:fs";
const R = "/home/claude/diagram-vss-demo";
const { load } = await import(`${R}/docs/js/vss.js`);
const FRONT = await import(`${R}/docs/js/front.js`);
const { readingFromWires, toNodes } = await import(`${R}/docs/js/vss-adapter.js`);
const { canon, canonWant } = await import(`${R}/docs/js/bench-canon.js`);
const dir = new URL(`file://${R}/docs/model/${process.env.MODEL}/`);
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true }), F = JSON.parse(await readFile(process.env.FRONTJSON ? "front.json" : "front.json"));
const FF = process.env.FRONTJSON ? JSON.parse(readFileSync(process.env.FRONTJSON, "utf8")) : F;
const verbs = new Map(); for (const e of vss.model.legend.events) for (const v of e.verbs) verbs.set(v, e.id);
const evOf = (w) => (w.type === "command" ? w.args.action : w.type === "question" ? ({ rules: "list" }[w.args.ask] || w.args.ask) : w.type);
const rows = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const out = [];
for (const m of rows) {
  const ctx = { names: m.names || [], last: [], refs: new Map() }, seq = { s: 0, m: 0 }, created = [];
  for (const w of m.wires) {
    if (!w.span || !m.text.includes(w.span)) continue;
    const names = ctx.names.concat(created);
    const { tokens, info } = FRONT.normalize(w.span, names, FF);
    const verb = tokens.find((t) => verbs.has(t)) || null;
    const r = vss.read(tokens.join(" "));
    const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb, tokens);
    const o = reading ? toNodes(reading, info, ctx, seq) : { nodes: [] };
    const main = o.nodes.filter((x) => x.type !== "mention").pop();
    const got = main ? canon(main, o.nodes) : {}, want = canonWant(w.type, w.args);
    const bad = Object.entries(want).filter(([k, v]) => (got[k] ?? "∅") !== v);
    const act = (t, a) => `${t}:${a.action || a.ask || ""}`;
    const ok = !!(main && !bad.length && act(main.type, main.args) === act(w.type, w.args));
    out.push({ id: m.id, span: w.span, names, tokens, verb, ok, ev: evOf(w), trigger: w.trigger || null });
    if (main && main.args.action === "create" && main.args.name) created.push(String(main.args.name));
    if (main && main.args.target != null && !Array.isArray(main.args.target)) ctx.last = [main.args.target];
  }
}
writeFileSync(process.argv[3], JSON.stringify({ events: Object.fromEntries(verbs), rows: out }));
console.log(out.length, "requests; no verb:", out.filter((x) => !x.verb).length, "no verb & not ok:", out.filter((x) => !x.verb && !x.ok).length);
