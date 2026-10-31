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
import { canon } from "../../docs/js/bench-canon.js";
const dirArg = process.argv[2], nEx = +(process.argv[process.argv.indexOf("--examples") + 1] || 4);
const dir = new URL(`../../docs/model/${process.env.MODEL}/`, import.meta.url);
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true }), F = JSON.parse(await readFile("front.json"));
const lex = vss.model.lexicon || {}, verbs = new Map(); for (const e of vss.model.legend.events) for (const v of e.verbs) verbs.set(v, e.id);
const low = (v) => (Array.isArray(v) ? v.map((x) => String(x).toLowerCase()).join(",") : String(v).toLowerCase());
const evOf = (w) => (w.type === "command" ? w.args.action : w.type === "question" ? ({ rules: "list" }[w.args.ask] || w.args.ask) : w.type);
const rows = readdirSync(dirArg).filter((f) => f.endsWith(".jsonl")).flatMap((f) => readFileSync(`${dirArg}/${f}`, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)));
const cause = {}, ex = {}, unk = { right: [0, 0], wrong: [0, 0] }, byStatus = {}; let n = 0, right = 0;
const add = (c, e) => { cause[c] = (cause[c] || 0) + 1; (ex[c] = ex[c] || []).length < nEx && ex[c].push(e); };
for (const m of rows) {
  const ctx = { names: m.names || [], last: [], refs: new Map() }, seq = { s: 0, m: 0 }, created = [];
  for (const w of m.wires) {
    if (!w.span || !m.text.includes(w.span)) continue;
    n++;
    const names = ctx.names.concat(created), { tokens, info } = FRONT.normalize(w.span, names, F);
    const words = tokens.filter((t) => /^[a-z]/.test(t) && !t.startsWith("n_") && !t.startsWith("t_"));
    const unknownShare = words.length ? words.filter((t) => !Object.hasOwn(lex, t)).length / words.length : 0;
    const r = vss.read(tokens.join(" ")); byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    const verb = tokens.find((t) => verbs.has(t)) || null;
    const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb, tokens);
    const out = reading ? toNodes(reading, info, ctx, seq) : { nodes: [] };
    const main = out.nodes.filter((x) => x.type !== "mention").pop();
    const got = main ? canon(main, out.nodes) : {}, want = Object.fromEntries(Object.entries(w.args).map(([k, v]) => [k, low(v)]));
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
        if (nameToks.length && nameToks.some((t) => !tokens.includes(t))) add("E name not reachable", e);
        else if ((got[k] ?? "∅") === "∅") add("F role missed", e); else add("G role wrong", e);
      } else {
        const inSpan = tokens.some((t) => t.replace(/^not_/, "") === v || t === v + "s" || t.replace(/_/g, "") === v.replace(/_/g, ""));
        if (!inSpan && !["count", "distance"].includes(k)) add("D value not reachable", e);
        else if ((got[k] ?? "∅") === "∅") add("F role missed", e); else add("G role wrong", e);
      }
    }
    if (main && main.args.action === "create" && main.args.name) created.push(String(main.args.name));
    if (main && main.args.target != null && !Array.isArray(main.args.target)) ctx.last = [main.args.target];
  }
}
console.log(`${n} gold requests read alone from their spans; fully right ${right} (${(100 * right / n).toFixed(1)}%)`);
console.log("reader status:", JSON.stringify(byStatus));
console.log(`words without a kind of their own (read as unknown): right requests ${(100 * unk.right[0] / unk.right[1]).toFixed(1)}%, wrong requests ${(100 * unk.wrong[0] / unk.wrong[1]).toFixed(1)}%`);
for (const [c, k] of Object.entries(cause).sort()) { console.log(`\n${c}: ${k} (${(100 * k / n).toFixed(1)}% of all requests)`); for (const e of ex[c]) console.log("   " + e.slice(0, 330)); }
