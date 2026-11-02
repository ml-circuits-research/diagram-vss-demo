// confidence3/collect_rules3.mjs: the Rules records of confidence3/PLAN.md. The Rules read every message on three cuts: their own ("own"),
// the units of the BERT cut ("bert") and of the VSS cut ("vss"), both from combine/collect_pair.mjs's units.jsonl (the same units the two
// learned readers read). Every produced request carries its outcome (PAIR=value against the gold, as fresh2/collect_rules.mjs, checked
// against llm_score.mjs tally), `pa` (its act), `g` (paired gold index, -1 = extra), `got` (bench-canon.js canon), `span`, `args0`, and the
// Rules signals: `notes` (the Rules' notes about THIS request: "@id: ..."), and per message `msgNotes` (notes not about one request: an
// action not found, a reference not resolved, an unknown name) and `unread` (pieces of the message the Rules read no request from).
//   node training/sketch/confidence3/collect_rules3.mjs <records dir with units.jsonl> <set> <data dir> [<data dir> ...]
//   writes <records dir>/rules_own.jsonl, rules_bert.jsonl, rules_vss.jsonl
import { readFileSync, readdirSync, writeFileSync, appendFileSync } from "node:fs";
import { createHash } from "node:crypto";
process.env.LLM_SCORE_LIB = "1"; process.env.SEG ||= "composer"; process.env.PAIR ||= "value";
const L = await import("../llm_score.mjs");
const { canon, canonWant } = await import("../../../docs/js/bench-canon.js");
const { pairValue } = await import("../layer_common.mjs");
const [recDir, set, ...dirs] = process.argv.slice(2);
if (!recDir || !set || !dirs.length) { console.error("usage: collect_rules3.mjs <records dir> <set> <data dir>..."); process.exit(2); }
const logicSha = createHash("sha256").update(readFileSync(new URL("../../../docs/js/logic.js", import.meta.url))).digest("hex").slice(0, 12);
const UNITS = new Map(readFileSync(`${recDir}/units.jsonl`, "utf8").split("\n").filter((l) => l.trim()).map((l) => { const u = JSON.parse(l); return [u.id, u]; }));
const sys = L.logic.createSystem();
const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
const unitOf = (n, text) => { if (n.span) return { c0: n.span[0], c1: n.span[1] }; const k = n.src ? text.indexOf(n.src) : -1; return k < 0 ? { c0: 0, c1: 0 } : { c0: k, c1: k + n.src.length }; };
const args0 = (n) => ({ action: n.args.action ?? null, name: typeof n.args.name === "string" ? n.args.name : null, count: n.args.count ?? null });
function pairUp(mains, gold, row) {   // as fresh2/collect_rules.mjs
  const used = new Set(), G = row.wires.map((w, j) => {
    let s0 = -1;
    if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); }
    return { s: s0, e: s0 < 0 ? -1 : s0 + w.span.length, act: gold[j].act, want: gold[j].want, args: w.args };
  });
  const units = mains.map((x) => unitOf(x.n, row.text));
  return pairValue({ text: row.text, gold: G, units, prods: mains.map((x, i) => ({ act: x.act, u: i, rawC: x.got })) });
}
const rows = [], seen = new Set();
for (const d of dirs) {
  const files = readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort();
  for (const r of files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l))).filter((r) => Array.isArray(r.wires) && !seen.has(r.id))) { seen.add(r.id); rows.push(r); }
}
const missing = rows.filter((r) => !UNITS.has(r.id)).length;
if (missing) throw new Error(`${missing} messages have no units in ${recDir}/units.jsonl`);
for (const cut of ["own", "bert", "vss"]) {
  const out = `${recDir}/rules_${cut}.jsonl`; writeFileSync(out, "");
  let G = 0, R = 0, W = 0, E = 0;
  for (const r of rows) {
    const ctx = { names: (r.names || []).slice(), last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null };
    const res0 = cut === "own" ? sys.formalize(r.text, ctx) : sys.formalize(r.text, ctx, { units: UNITS.get(r.id)[cut] });
    const nodes = res0.nodes, notes = res0.notes || [];
    const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
    const gold = r.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args) }));
    const res = mains.map(() => "extra"), gi = mains.map(() => -1);
    for (const [i, j] of pairUp(mains, gold, r)) { gi[i] = j; res[i] = Object.entries(gold[j].want).every(([k, v]) => (mains[i].got[k] ?? "∅") === v) ? "right" : "wrong"; }
    const tot = { exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0, byAct: {} };
    L.tally(tot, nodes, r);
    const q = { right: res.filter((x) => x === "right").length, wrong: res.filter((x) => x === "wrong").length, extra: res.filter((x) => x === "extra").length };
    if (cut === "own" && (q.right !== tot.right || q.wrong !== tot.wrongAligned || q.extra !== tot.extra)) throw new Error(`rules outcomes differ from tally on ${r.id}`);
    const about = (n) => notes.filter((s) => String(s).startsWith(`@${n.id}:`)).length;
    const msgNotes = notes.filter((s) => !/^@\w+:/.test(String(s))).length, unread = (res0.segments || []).filter((sg) => sg.id == null).length;
    appendFileSync(out, JSON.stringify({ id: r.id, set, cut, logic: logicSha, gold: r.wires.length, goldActs: gold.map((g) => g.act), msgNotes, unread,
      rules: res.map((o, i) => { const sp = unitOf(mains[i].n, r.text); return { o, pa: mains[i].act, g: gi[i], got: mains[i].got, span: [sp.c0, sp.c1], args0: args0(mains[i].n), notes: about(mains[i].n) }; }) }) + "\n");
    G += r.wires.length; R += q.right; W += q.wrong; E += q.extra;
  }
  console.log(`rules ${set} cut ${cut} (logic.js ${logicSha}): ${rows.length} messages, ${G} gold · right ${(R / G * 100).toFixed(1)} · wrong ${(W / G * 100).toFixed(1)} · extra ${E}`);
}
