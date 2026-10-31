// error_analysis.mjs: why VSS misreads requests that are cut perfectly. Every gold request of held-out TRAINING messages is read alone
// from its annotated span (no cut errors), then classified by the first cause that explains the miss:
//   A action word not recognized    - the learned front end puts no event token in the span
//   B wrong action                  - an event token is there but the reading's event differs from the gold
//   C reader refuses                - status unknown-event / no-sense (no frame)
//   D value not reachable           - a gold value (colour, place, ...) has no token in the normalized span (front end lost it)
//   E name not reachable            - a gold name (target, from, to, anchor) has no name token in the span (pronoun, context)
//   F role missed                   - the token is in the span but the reading leaves the role empty
//   G role wrong                    - the reading fills the role with another word
// plus, for every request: the share of its words that have no kind of their own (read as `unknown`), and whether the reading abstained.
// MODEL=<model under docs/model> node error_analysis.mjs <dir of jsonl with spans> [--examples N]
import { readFileSync, readdirSync } from "node:fs";
import { load } from "../../docs/js/vss.js";
import * as FRONT from "../../docs/js/front.js";
import { readingFromWires, toNodes } from "../../docs/js/vss-adapter.js";
import { canon, canonWant } from "../../docs/js/bench-canon.js";
const dirArg = process.argv[2], nEx = +(process.argv[process.argv.indexOf("--examples") + 1] || 4);
const dir = new URL(`../../docs/model/${process.env.MODEL}/`, import.meta.url);
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true }), F = JSON.parse(await readFile("front.json"));
const lex = vss.model.lexicon || {}, verbs = new Map(); for (const e of vss.model.legend.events) for (const v of e.verbs) verbs.set(v, e.id);
const evOf = (w) => (w.type === "command" ? w.args.action : w.type === "question" ? ({ rules: "list" }[w.args.ask] || w.args.ask) : w.type);
const rows = readdirSync(dirArg).filter((f) => f.endsWith(".jsonl")).flatMap((f) => readFileSync(`${dirArg}/${f}`, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)));
const cause = {}, ex = {}, unk = { right: [0, 0], wrong: [0, 0] }, byStatus = {}; let n = 0, right = 0;
// SEG=centres-model: the requests are read as the centre model cuts the whole message (vss.readMessage), not from the annotated span.
// Each gold request is matched to the accepted centres inside its span (the one of its own event first); before the reading causes
// below, the cut causes: X0 no event token in the span, X1 every centre in the span rejected (null >= 0.5); after them, for a request
// read right, nothing. Also counted: the cut of the matched centre against the span (members missing span words / taking words outside
// it), and the EXTRA readings (accepted centres read ok / abstain outside every span, or a second one inside a span), by where they are.
const CM = process.env.SEG === "centres-model", cut = { missing: 0, outside: 0, exact: 0 }, extra = {}, exEx = {};
const addX = (c, e) => { extra[c] = (extra[c] || 0) + 1; (exEx[c] = exEx[c] || []).length < nEx && exEx[c].push(e); };
const add = (c, e) => { cause[c] = (cause[c] || 0) + 1; (ex[c] = ex[c] || []).length < nEx && ex[c].push(e); };
for (const m of rows) {
  const ctx = { names: m.names || [], last: [], refs: new Map() }, seq = { s: 0, m: 0 }, created = [];
  let MN = null, used = new Set(), taken = new Set();
  if (CM) {
    const nm = FRONT.normalizeMessage(m.text, ctx.names, F); MN = { ...nm, r: vss.readMessage(nm.tokens.join(" ")) };
    const spans = []; for (const w of m.wires) { const s0 = w.span ? m.text.indexOf(w.span) : -1; if (s0 >= 0) spans.push([s0, s0 + w.span.length]); }
    MN.r.centres.forEach((k, j) => {
      if (!k.accepted || k.status === "unknown-event" || k.status === "no-sense") return;
      const [a] = MN.src[k.pos], inside = spans.findIndex(([s, e]) => a >= s && a < e);
      if (inside < 0) addX("extra: an accepted centre outside every span", `${k.token} <- "${m.text.slice(MN.src[Math.min(...k.members)][0], MN.src[Math.max(...k.members)][1])}"  status ${k.status}`);
    });
  }
  for (const w of m.wires) {
    if (!w.span || !m.text.includes(w.span)) continue;
    n++;
    const names = ctx.names.concat(created);
    let spanToks = null;
    let { tokens, info } = CM ? { tokens: [], info: MN.info } : FRONT.normalize(w.span, names, F), rC = null;
    if (CM) {
      const s0 = m.text.indexOf(w.span), e0 = s0 + w.span.length, inSpan = (i) => MN.src[i][0] >= s0 && MN.src[i][0] < e0;
      const ks = MN.r.centres.map((k, j) => [k, j]).filter(([k]) => inSpan(k.pos));
      const evToks = new Set((vss.model.legend.events.find((e) => e.id === evOf(w)) || { verbs: [] }).verbs);
      const acc = ks.filter(([k]) => k.accepted), pick = acc.find(([k, j]) => evToks.has(k.token) && !used.has(j)) || acc.find(([k, j]) => !used.has(j));
      acc.filter(([k, j]) => pick && j !== pick[1] && !taken.has(j) && k.status !== "unknown-event" && k.status !== "no-sense").forEach(([k, j]) => { taken.add(j); addX("extra: a second accepted centre inside one span", `${k.token} in "${w.span}"`); });
      if (!ks.length) { add("X0 no event token in the span (front end)", `${w.span}  ->  message tokens [${MN.tokens.filter((_, i) => inSpan(i)).join(" ")}]`); continue; }
      if (!pick) { add("X1 every centre in the span rejected (null >= 0.5)", `${w.span}  ->  ${ks.map(([k]) => `${k.token} null ${k.null.toFixed(2)}`).join(", ")}`); continue; }
      used.add(pick[1]); taken.add(pick[1]); const k = pick[0];
      const spanIdx = MN.tokens.map((_, i) => i).filter(inSpan), mem = new Set(k.members), P = new Set([".", ",", "!", "?", ";", ":"]);
      const miss = spanIdx.filter((i) => !mem.has(i) && !P.has(MN.tokens[i])).length, out = k.members.filter((i) => !inSpan(i) && !P.has(MN.tokens[i])).length;
      if (miss) cut.missing++; if (out) cut.outside++; if (!miss && !out) cut.exact++;
      tokens = k.tokens || k.members.map((i) => MN.tokens[i]); rC = k; spanToks = spanIdx.map((i) => MN.tokens[i]);
    }
    const words = tokens.filter((t) => /^[a-z]/.test(t) && !t.startsWith("n_") && !t.startsWith("t_"));
    const unknownShare = words.length ? words.filter((t) => !Object.hasOwn(lex, t)).length / words.length : 0;
    const r = rC ? { status: rC.status, wires: rC.wires } : vss.read(tokens.join(" ")); byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    const verb = tokens.find((t) => verbs.has(t)) || null;
    const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb, tokens);
    const out = reading ? toNodes(reading, info, ctx, seq) : { nodes: [] };
    const main = out.nodes.filter((x) => x.type !== "mention").pop();
    const got = main ? canon(main, out.nodes) : {}, want = canonWant(w.type, w.args);
    const goldEv = evOf(w), gotEv = main ? (main.type === "command" ? main.args.action : main.type === "question" ? main.args.ask : main.type) : null;
    const bad = Object.entries(want).filter(([k, v]) => (got[k] ?? "∅") !== v), extra = Object.keys(got).filter((k) => !(k in want) && k !== "type");
    const e = `${w.span}  ->  [${tokens.join(" ")}]  status ${r.status}  gold ${JSON.stringify(w.args)}  got ${JSON.stringify(main ? main.args : null)}`;
    const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
    const ok = main && !bad.length && actOf(main.type, main.args) === actOf(w.type, w.args);   // the same rule as llm_score.mjs (extra keys do not count)
    const slot = ok ? "right" : "wrong"; unk[slot][0] += unknownShare; unk[slot][1]++;
    if (ok) right++;
    else if (!verb) add("A action word not recognized", e);
    else if (!main) add("C reader refuses", e);
    else if (actOf(main.type, main.args) !== actOf(w.type, w.args)) add("B wrong action or type", e);
    else {
      const [k, v] = bad[0] || [];
      if (["target", "from", "to", "anchor"].includes(k) && String(v).startsWith("mention(")) add((got[k] ?? "∅") === "∅" ? "F role missed" : "G description read differently", e + `  canon got ${k}=${got[k]}`);
      else if (["target", "from", "to", "anchor"].includes(k)) {
        const nameToks = v.split(",").filter((x) => !x.startsWith("mention(") && x !== "$new").map((x) => "n_" + x.replace(/[^a-z0-9]+/g, "_"));
        if (CM && nameToks.some((t) => !tokens.includes(t) && spanToks.includes(t))) add("H cut: a name of the span not taken by the centre", e);
        else if (nameToks.length && nameToks.some((t) => !tokens.includes(t))) add("E name not reachable", e);
        else if ((got[k] ?? "∅") === "∅") add("F role missed", e); else add("G role wrong", e);
      } else {
        const inSpan = tokens.some((t) => t.replace(/^not_/, "") === v || t === v + "s" || t.replace(/_/g, "") === v.replace(/_/g, ""));
        const inMsgSpan = CM && spanToks.some((t) => t.replace(/^not_/, "") === v || t === v + "s" || t.replace(/_/g, "") === v.replace(/_/g, ""));
        if (!inSpan && inMsgSpan && !["count", "distance"].includes(k)) add("H cut: a value of the span not taken by the centre", e);
        else if (!inSpan && !["count", "distance"].includes(k)) add("D value not reachable", e);
        else if ((got[k] ?? "∅") === "∅") add("F role missed", e); else add("G role wrong", e);
      }
    }
    if (main && main.args.action === "create" && main.args.name) created.push(String(main.args.name));
    if (main && main.args.target != null && !Array.isArray(main.args.target)) ctx.last = [main.args.target];
  }
}
console.log(`${n} gold requests ${CM ? "read as the centre model cuts the whole message (SEG=centres-model)" : "read alone from their spans"}; fully right ${right} (${(100 * right / n).toFixed(1)}%)`);
console.log("reader status:", JSON.stringify(byStatus));
console.log(`words without a kind of their own (read as unknown): right requests ${(100 * unk.right[0] / unk.right[1]).toFixed(1)}%, wrong requests ${(100 * unk.wrong[0] / unk.wrong[1]).toFixed(1)}%`);
if (CM) {
  console.log(`\ncut of the matched centre against the span (punctuation not counted): exact ${cut.exact}, missing span words ${cut.missing}, taking words outside the span ${cut.outside}`);
  for (const [c, k] of Object.entries(extra).sort()) { console.log(`${c}: ${k}`); for (const e of exEx[c]) console.log("   " + e.slice(0, 330)); }
}
for (const [c, k] of Object.entries(cause).sort()) { console.log(`\n${c}: ${k} (${(100 * k / n).toFixed(1)}% of all requests)`); for (const e of ex[c]) console.log("   " + e.slice(0, 330)); }
