import { readFileSync } from "node:fs";
const R="/home/claude/diagram-vss-demo/";
const { load } = await import(R+"docs/js/vss.js");
const FRONT = await import(R+"docs/js/front.js");
const { readingFromWires, toNodes } = await import(R+"docs/js/vss-adapter.js");
const { canon } = await import(R+"docs/js/bench-canon.js");
const dir = new URL(`${R}docs/model/fix_p80_s0/`, "file:///");
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true }), F = JSON.parse(await readFile("front.json"));
const verbs = new Map(); for (const e of vss.model.legend.events) for (const v of e.verbs) verbs.set(v, e.id);
const low = (v) => (Array.isArray(v) ? v.map((x) => String(x).toLowerCase()).join(",") : String(v).toLowerCase());
const rows = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const out = [];
for (const m of rows) {
  const ctx = { names: m.names || [], last: [], refs: new Map() }, seq = { s: 0, m: 0 }, created = [];
  for (const w of m.wires) {
    if (!w.span || !m.text.includes(w.span)) continue;
    const { tokens, info } = FRONT.normalize(w.span, ctx.names.concat(created), F);
    const r = vss.read(tokens.join(" "));
    const verb = tokens.find((t) => verbs.has(t)) || null;
    const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb, tokens);
    const o = reading ? toNodes(reading, info, ctx, seq) : { nodes: [] };
    const main = o.nodes.filter((x) => x.type !== "mention").pop();
    const got = main ? canon(main, o.nodes) : {}, want = Object.fromEntries(Object.entries(w.args).map(([k, v]) => [k, low(v)]));
    const bad = Object.entries(want).filter(([k, v]) => (got[k] ?? "∅") !== v);
    const act = (t, a) => `${t}:${a.action || a.ask || ""}`;
    const ok = main && !bad.length && act(main.type, main.args) === act(w.type, w.args);
    const top = r.wires[0];
    const rawLines = top ? top.lines.filter(l=>!l.key.startsWith("_margin")&&!l.key.startsWith("_presence_m")).map(l => `${l.key}=${l.refs().length ? "[" + l.refs().map(id => { const e = r.wires.find(x => x.id === id); return e ? (e.value("head") + (e.value("attr")? "/"+e.value("attr"):"")) : id; }).join("&") + "]" : l.text}`) : [];
    const mem = r.presence["members.members"], tg = r.presence["targets.members"];
    out.push({ id: m.id, span: w.span, tokens: tokens.join(" "), status: r.status, ok: !!ok, verb, rawEvent: top && top.type, raw: rawLines.join(" | "),
      presence: Object.fromEntries(Object.entries(r.presence).filter(([k])=>/^(members|targets|source|target)/.test(k)).map(([k,v])=>[k, typeof v==="number"? +v.toFixed(2): Object.fromEntries(Object.entries(v).map(([a,b])=>[a,+b.toFixed(2)]))])),
      margins: r.margins, gold: w.args, goldType: w.type, got: main ? { type: main.type, ...main.args } : null, gotCanon: got, bad: bad.map(([k,v])=>k+":"+(got[k]??"∅")+"!="+v),
      names: Object.values(info.names||{}) });
    if (main && main.args.action === "create" && main.args.name) created.push(String(main.args.name));
    if (main && main.args.target != null && !Array.isArray(main.args.target)) ctx.last = [main.args.target];
  }
}
console.log(JSON.stringify(out));
