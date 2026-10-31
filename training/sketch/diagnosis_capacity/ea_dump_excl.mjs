// ea_dump.mjs: error_analysis.mjs (annotated cut, read alone) one JSON row per gold request, plus what the reader saw and decoded.
// Same normalization, reading, adapter, canon and cause rule as training/sketch/error_analysis.mjs (copied, not imported; read-only).
// Extra per row: kinds of the tokens as the route book sees them, the decoded frame (event, lemma, roles), margins, presence ratios,
// and the tokens normalized with the GOLD created names (as msg_to_world.py built the training row).
// MODEL=fix_p80_s0 node ea_dump.mjs <file.jsonl> > out.jsonl
import { readFileSync } from "node:fs";
const R = "/home/claude/diagram-vss-demo/";
const { load } = await import(R + "docs/js/vss.js");
const FRONT = await import(R + "docs/js/front.js");
const { readingFromWires, toNodes } = await import(R + "docs/js/vss-adapter.js");
const { canon, canonWant } = await import(R + "docs/js/bench-canon.js");
const dir = new URL(`${R}docs/model/${process.env.MODEL || "fix_p80_s0"}/`, "file:///");
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true }), F = JSON.parse(await readFile("front.json"));
const lex = vss.model.lexicon || {}, verbs = new Map(); for (const e of vss.model.legend.events) for (const v of e.verbs) verbs.set(v, e.id);
const rb = vss.rb, rd = vss.reader;
// SIM=excl: after the roles are read, of two roles of the decided event that never occur together in the training frames and share a
// candidate kind (excl_pairs.json, learned by excl_pairs.py), only the one further above its presence threshold (ratio / threshold) is
// kept. SETONLY=1: only the pairs that hold a set role.
if (process.env.SIM === "excl") {
  const EX = JSON.parse(readFileSync("/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/capacity/excl_pairs.json", "utf8"));
  const orig = rd.read.bind(rd), setR = new Set(["members", "targets"]);
  rd.read = (S, tokens, opts = {}) => {
    const f = orig(S, tokens, opts);
    for (const [a, b] of EX[f.event] || []) {
      if (process.env.SETONLY === "1" && !setR.has(a) && !setR.has(b)) continue;
      if (!f.roles[a] || !f.roles[b]) continue;
      const sc = (r) => (f.presence[r] ?? 0) / Math.max(1e-9, rd.th.presence[r] ?? 1);
      const drop = sc(a) >= sc(b) ? b : a; delete f.roles[drop]; for (const k of Object.keys(f.margins)) if (k === drop || k.startsWith(drop + ".")) delete f.margins[k];
    }
    return f;
  };
}
const kindsOf = (toks) => toks.map((t) => { const k = rd.kind(t); return k === null || k === undefined || k === "unknown" || !rb.catId.has(k) ? "unknown" : k; });
const rows = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const r3 = (x) => (typeof x === "number" ? +x.toFixed(3) : x);
for (const m of rows) {
  const ctx = { names: m.names || [], last: [], refs: new Map() }, seq = { s: 0, m: 0 }, created = [], createdGold = [];
  m.wires.forEach((w, wi) => {
    const gc = [...createdGold];
    if (w.type === "command" && w.args.action === "create" && w.args.name) createdGold.push(w.args.name);
    if (!w.span || !m.text.includes(w.span)) return;
    const names = ctx.names.concat(created);
    const { tokens, info } = FRONT.normalize(w.span, names, F);
    const tokGold = FRONT.normalize(w.span, ctx.names.concat(gc), F).tokens;
    const words = tokens.filter((t) => /^[a-z]/.test(t) && !t.startsWith("n_") && !t.startsWith("t_"));
    const unknownShare = words.length ? words.filter((t) => !Object.hasOwn(lex, t)).length / words.length : 0;
    const r = vss.read(tokens.join(" "));
    const verb = tokens.find((t) => verbs.has(t)) || null;
    const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb, tokens);
    const out = reading ? toNodes(reading, info, ctx, seq) : { nodes: [] };
    const main = out.nodes.filter((x) => x.type !== "mention").pop();
    const got = main ? canon(main, out.nodes) : {}, want = canonWant(w.type, w.args);
    const bad = Object.entries(want).filter(([k, v]) => (got[k] ?? "∅") !== v);
    const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
    const ok = !!(main && !bad.length && actOf(main.type, main.args) === actOf(w.type, w.args));
    let cause = null;
    if (ok) cause = null;
    else if (!verb) cause = "A";
    else if (!main) cause = "C";
    else if (actOf(main.type, main.args) !== actOf(w.type, w.args)) cause = "B";
    else {
      const [k, v] = bad[0] || [];
      if (["target", "from", "to", "anchor"].includes(k) && String(v).startsWith("mention(")) cause = (got[k] ?? "∅") === "∅" ? "F" : "G2";
      else if (["target", "from", "to", "anchor"].includes(k)) {
        const nameToks = v.split(",").filter((x) => !x.startsWith("mention(") && x !== "$new").map((x) => "n_" + x.replace(/[^a-z0-9]+/g, "_"));
        if (nameToks.length && nameToks.some((t) => !tokens.includes(t))) cause = "E";
        else if ((got[k] ?? "∅") === "∅") cause = "F"; else cause = "G";
      } else {
        const inSpan = tokens.some((t) => t.replace(/^not_/, "") === v || t === v + "s" || t.replace(/_/g, "") === v.replace(/_/g, ""));
        if (!inSpan && !["count", "distance"].includes(k)) cause = "D";
        else if ((got[k] ?? "∅") === "∅") cause = "F"; else cause = "G";
      }
    }
    const fr = r.frame || {};
    console.log(JSON.stringify({ id: m.id, wi, span: w.span, tokens, kinds: kindsOf(tokens), tokGold, status: r.status, ok, cause, bad: bad.map(([k, v]) => `${k}:${got[k] ?? "∅"}!=${v}`),
      goldType: w.type, gold: w.args, got: main ? { type: main.type, ...main.args } : null, unknownShare: r3(unknownShare),
      frame: { event: fr.event ?? null, lemma: fr.lemma ?? null, roles: fr.roles || {} },
      margins: Object.fromEntries(Object.entries(r.margins || {}).map(([k, v]) => [k, r3(v)])),
      presence: Object.fromEntries(Object.entries(r.presence || {}).filter(([, v]) => typeof v === "number").map(([k, v]) => [k, r3(v)])) }));
    if (main && main.args.action === "create" && main.args.name) created.push(String(main.args.name));
    if (main && main.args.target != null && !Array.isArray(main.args.target)) ctx.last = [main.args.target];
  });
}
