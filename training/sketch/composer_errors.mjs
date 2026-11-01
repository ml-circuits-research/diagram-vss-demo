// composer_errors.mjs: where the composer's errors come from, per REQUESTED action (owner's rule, 2026-11-01: no per-message numbers).
// Runs the composer (docs/js/vss-composer.js, registry docs/model/micro/registry.json) twice on the 9 data folders (micro_tools.py dirs):
//   cut "learned": the composer's own cutter;  cut "gold": the units are the gold spans (everything else the same).
// The composer has no entry point for given units, so formalize() is COPIED here (loop over units: comp.route + readingFromWires + toNodes,
// the context rule of llm_score.mjs) and also gives the nodes of every unit. Nothing in docs/ or llm_score.mjs is changed.
// Scoring is the one of llm_score.mjs (same canon, same LCS alignment of the produced commands/questions to the gold wires on type+action):
// a gold wire is right (aligned, every gold key equal), wrong (aligned, a key differs) or not done (unaligned); a produced command that is
// aligned to no gold wire is extra.
// Output: 1 totals (per folder too), 2 first cause of every gold request not right, 3 extras, 4 both cuts, 5 verbless study.
// node composer_errors.mjs [dir ...] [--examples N] [--json out.json]
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { load } from "../../docs/js/vss.js";
import * as FRONT from "../../docs/js/front.js";
import { readingFromWires, toNodes } from "../../docs/js/vss-adapter.js";
import { canon, canonWant } from "../../docs/js/bench-canon.js";
import { loadComposer } from "../../docs/js/vss-composer.js";

const argv = process.argv.slice(2), exAt = argv.indexOf("--examples"), jsAt = argv.indexOf("--json");
const NEX = exAt >= 0 ? +argv[exAt + 1] : 5, JSON_OUT = jsAt >= 0 ? argv[jsAt + 1] : null;
let dirs = argv.filter((a, i) => !a.startsWith("-") && (exAt < 0 || i !== exAt + 1) && (jsAt < 0 || i !== jsAt + 1));
if (!dirs.length) dirs = execFileSync("python3", [new URL("micro_tools.py", import.meta.url).pathname, "dirs"], { encoding: "utf8" }).split("\n").filter(Boolean);
const MODELS = new URL("../../docs/model/", import.meta.url);
const REG = JSON.parse(readFileSync(process.env.REGISTRY || new URL("micro/registry.json", MODELS), "utf8"));
const MODEL = process.env.MODEL || REG.fallback;
const CUTF = JSON.parse(readFileSync(new URL(REG.cutter, MODELS), "utf8"));
const mkRead = (d) => async (n) => { const b = readFileSync(new URL(n, d)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const cache = new Map();
const loadModel = async (name) => {
  if (cache.has(name)) return cache.get(name);
  const d = new URL(`${name}/`, MODELS), rf = mkRead(d);
  const m = { vss: await load(null, { readFile: rf, sentenceCandidates: true }), F: existsSync(new URL("front.json", d)) ? JSON.parse(await rf("front.json")) : null };
  cache.set(name, m); return m;
};
const comp = await loadComposer(REG, CUTF, loadModel, { fallback: MODEL });
console.log(`composer: fallback ${MODEL} · worlds ${comp.worlds.map((w) => `${w.id} [${[...w.events]}]`).join(", ")}`);
const worldEvents = new Map(comp.worlds.map((w) => [w.id, w.events]));

// ---------- scoring helpers (copied from llm_score.mjs)
function scorerUpdate(c, main) {
  if (main && main.args) {
    if (main.args.action === "create") { if (main.args.name && !main.args.count) c.refs.set(String(main.args.name).toLowerCase(), { ref: main.id }); c.last = [{ ref: main.id }]; }
    else if (main.args.target != null && !Array.isArray(main.args.target)) c.last = [main.args.target];
  }
}
const actOf = (type, args) => `${type}:${args.action || args.ask || ""}`;
function align(pred, gold) {
  const n = pred.length, m = gold.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = pred[i].act === gold[j].act ? 1 + L[i + 1][j + 1] : Math.max(L[i + 1][j], L[i][j + 1]);
  const pairs = []; let i = 0, j = 0;
  while (i < n && j < m) { if (pred[i].act === gold[j].act) { pairs.push([i, j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  return pairs;
}
// the event name of a gold wire (micro_tools.py event())
const evOf = (w) => (w.type === "command" ? w.args.action : w.type === "question" ? (w.args.ask === "rules" ? "list" : w.args.ask) : w.type);

// ---------- the composer run over given or learned units (copy of Composer.formalize, with the nodes kept per unit)
function runUnits(text, names, cutSpans) {
  const c = { names: names.slice(), last: [], refs: new Map() }, seq = { s: 0, m: 0 }, nodes = [], units = [];
  for (const [c0, c1] of cutSpans) {
    const src = text.slice(c0, c1), nm = c.names.concat([...c.refs.keys()]);
    const u = Object.assign({ c0, c1, src, mains: [] }, comp.route(src, nm));
    units.push(u);
    if (u.zone !== "read") continue;
    const x = u.chosen; u.rstatus = x.r.status; { const m = Object.values(x.r.margins || {}); u.margin = m.length ? Math.min(...m) : Infinity; }
    const verb = x.tokens.find((t) => x.w.verbEvent.has(t)) || x.r.frame.lemma || null;
    const reading = readingFromWires(x.r.wires, verb, x.tokens), out = toNodes(reading, x.info, c, seq);
    for (const n of out.nodes) { n.world = u.world; n.unit = units.length - 1; }
    nodes.push(...out.nodes); u.mains = out.nodes.filter((n) => n.type !== "mention");
    scorerUpdate(c, out.nodes[out.nodes.length - 1]);
  }
  return { nodes, units };
}

// ---------- text helpers
const alnum = /[A-Za-z0-9]/;
function ov(a0, a1, b0, b1) { let k = 0; for (let i = Math.max(a0, b0); i < Math.min(a1, b1); i++) if (alnum.test(ASRC[i])) k++; return k; }
let ASRC = "";
const words = (s) => s.toLowerCase().replace(/[^a-z0-9$]+/g, " ").trim();
function goldSpans(r) {
  const used = new Set();
  return r.wires.map((w, idx) => {
    let s = -1, from = 0;
    for (;;) { const k = r.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s = k; break; } from = k + 1; }
    if (s < 0) s = r.text.indexOf(w.span);
    used.add(s);
    return { w, idx, s, e: s + w.span.length, ev: evOf(w), act: actOf(w.type, w.args), want: canonWant(w.type, w.args), span: w.span };
  });
}
const goldTxt = (g) => JSON.stringify(g.w.args);
const gotTxt = (n, nodes) => (n ? JSON.stringify(n.args) : "-");
// words of a gold value (lower-case phrases); mention(k=v,...) gives its inner values
function valuePhrases(want) {
  const out = [];
  for (const [k, v] of Object.entries(want)) {
    if (k === "action" || k === "ask" || k === "type") continue;
    const inner = v.replace(/mention\(([^)]*)\)/g, (_, x) => x.split(",").map((p) => p.split("=")[1]).join(","));
    for (const p of inner.split(",")) { const q = words(p.replace(/_/g, " ")); if (q && q !== "$new" && q !== "?") out.push(q); }
  }
  return out;
}
const PRON = /\b(it|its|them|they|their|this|that|those|these|him|her|one|ones|same|both|each|other)\b/i;
const ENTITY = new Set(["target", "from", "to", "anchor"]);

// kinds of the trigger of a verbless request (analysis only): what the annotator marked as the trigger is ...
function trigKind(g, r) {
  const trig = (g.w.trigger || "").trim(), tl = trig.toLowerCase();
  if (!tl) return "K0 no trigger marked";
  const tt = FRONT.normalize(trig, r.names || [], comp.fallback.F).tokens;
  if (/^(is|are|was|were|be|am|'s|should be|must be|will be|can be|has to be|have to be|needs? to be)$/.test(tl)) return "K1 copula (is / are / should be): the verb is a copula the front end gives no action token here";
  const isName = (r.names || []).some((n) => n && new RegExp("\\b" + n.replace(/[^A-Za-z0-9]/g, "") + "\\b", "i").test(trig));
  if (tt.some((t) => t.startsWith("t_")) || isName || /^(the|a|an|another|one|two|three|four|five|both|all|\d+)\b/i.test(trig)) return "K2 no verb in the text: the trigger is a name / noun phrase (ellipsis: 'Greece blue', 'the Hospital white')";
  if (tt.every((t) => comp.valueTokens.has(t) || /^(to|of|on|in|at|the|a|and|from|with|by|into|onto|than|as|too|also|then)$/.test(t))) return "K3 no verb in the text: the trigger is a value / preposition word ('below', 'on the right')";
  return "K4 a verb is in the text but the front end has no action token for it (word unseen in training, or only in other contexts)";
}
// ---------- one cut -> per-gold outcome, per-prediction outcome
function evaluate(r, cut) {
  ASRC = r.text;
  const G = goldSpans(r), names = r.names || [];
  const spans = cut === "gold" ? G.map((g) => [g.s, g.e]).sort((a, b) => a[0] - b[0] || a[1] - b[1]) : FRONT.segmentSpans(r.text, names, CUTF);
  const { nodes, units } = runUnits(r.text, names, spans);
  const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
  const pairs = align(mains, G.map((g) => ({ act: g.act })));
  const pOf = new Map(pairs.map(([i, j]) => [j, i])), usedP = new Set(pairs.map((p) => p[0]));
  for (const [j, g] of G.entries()) {
    const i = pOf.get(j);
    if (i === undefined) { g.status = "notdone"; continue; }
    g.pred = mains[i];
    g.diff = Object.entries(g.want).filter(([k, v]) => (mains[i].got[k] ?? "∅") !== v).map(([k, v]) => [k, v, mains[i].got[k] ?? "∅"]);
    g.status = g.diff.length ? "wrong" : "right";
  }
  for (const g of G) if (g.status === "wrong") g.misaligned = G.some((o) => o !== g && o.act === g.act && Object.entries(o.want).every(([k, v]) => (g.pred.got[k] ?? "∅") === v));
  const extras = mains.map((m, i) => ({ m, i })).filter(({ i }) => !usedP.has(i));
  mains.forEach((m, i) => { const u = units[m.n.unit]; m.rstatus = u.rstatus; m.margin = u.margin; m.kind = usedP.has(i) ? (G.some((g) => g.pred === m && g.status === "right") ? "right" : "wrong") : "extra"; });
  return { G, units, mains, nodes, extras };
}

const PAIRS = { c3: {}, d1: {} }; let PAIRS_ON = true;   // pairs are counted for the learned cut only
// ---------- the first cause of a gold request that is not right (spec order a-e)
function cause(g, G, units, r, nodes) {
  const ovl = units.map((u, k) => [k, ov(g.s, g.e, u.c0, u.c1)]).filter(([, o]) => o > 0);
  const best = ovl.length ? ovl.slice().sort((a, b) => b[1] - a[1])[0][0] : -1, U = best >= 0 ? units[best] : null;
  const produced = () => (U ? `unit "${U.src}" -> ${U.zone}${U.world ? " " + U.world : ""} ${U.event || ""} ${U.zone === "read" ? U.mains.map((n) => gotTxt(n)).join(" ; ") || "(no command)" : U.reason ? "(" + U.reason + ")" : ""}`.trim() : "no unit");
  const ex = (c, sub, extra = "") => ({ c, sub, ex: `${r.id}  span "${g.span}"  gold ${g.act} ${goldTxt(g)}  |  ${produced()}${extra}` });
  if (!ovl.length) return ex("a CUTTER", "missed (no unit overlaps the span)");
  const others = G.filter((o) => o !== g && o.s !== g.s);
  if (ovl.some(([k]) => G.some((o) => o !== g && !(o.s === g.s && o.e === g.e) && ov(o.s, o.e, units[k].c0, units[k].c1) > 0))) return ex("a CUTTER", "merged (a unit holds two requests)");
  if (ovl.length >= 2) return ex("a CUTTER", "split (the request is spread over " + ovl.length + " units)", `  units: ${ovl.map(([k]) => '"' + units[k].src + '"').join(" + ")}`);
  // too short: span words outside the unit that carry a gold value
  const unc = []; for (let i = g.s; i < g.e; i++) if (!(i >= U.c0 && i < U.c1)) unc.push(r.text[i]); const uncW = " " + words(unc.join("")) + " ";
  const lost = valuePhrases(g.want).filter((p) => uncW.includes(" " + p + " ") || uncW.includes(" " + p.replace(/s$/, "") + " "));
  if (lost.length) return ex("a CUTTER", "too short (cuts off gold value words)", `  cut off: ${[...new Set(lost)].join(", ")}`);
  // b no action word
  if (!U.events.length) {
    const prev = G.filter((o) => o.s < g.s).sort((a, b) => b.s - a.s)[0];
    const trigIn = g.w.trigger && words(g.span).includes(words(g.w.trigger).split(" ")[0]);
    const trigOut = trigIn && !(g.s + g.span.toLowerCase().indexOf(g.w.trigger.toLowerCase()) >= U.c0 && g.s + g.span.toLowerCase().indexOf(g.w.trigger.toLowerCase()) < U.c1);
    return ex("b NO ACTION WORD", prev && prev.ev === g.ev ? "b1 previous request has the same action" : "b2 " + trigKind(g, r).split(":")[0].split(" (")[0], (trigOut ? "  [trigger word lies outside the unit]" : "") + `  trigger "${g.w.trigger}"`);
  }
  // c routing
  const goldHeldBy = (wid) => wid && (wid === comp.fallback.id || (worldEvents.get(wid) && worldEvents.get(wid).has(g.ev)));
  if (U.zone === "ask") return ex("c ROUTING", "c1 marked ask / tie");
  if (!goldHeldBy(U.world)) { if (PAIRS_ON && !U.events.includes(g.ev)) PAIRS.c3[g.ev + " <- token of " + U.events.join("+")] = (PAIRS.c3[g.ev + " <- token of " + U.events.join("+")] || 0) + 1; return ex("c ROUTING", U.events.includes(g.ev) ? "c2 gold event's world lost the choice" : "c3 unit's action token belongs to another event", `  [tokens of: ${U.events.join(",")}]`); }
  // d / e world reading
  if (U.zone === "ignored") return ex("d WORLD READING", "d0 right world refuses (" + U.status + ")");
  const pr = g.pred || U.mains.find((n) => actOf(n.type, n.args) === g.act);
  if (!pr) { const kk = (U.event || "-") + " instead of " + g.ev; if (PAIRS_ON) PAIRS.d1[kk] = (PAIRS.d1[kk] || 0) + 1; return ex("d WORLD READING", "d1 wrong action in the right world", `  [${kk}]`); }
  const gotc = pr.got || canon(pr, nodes), diff = g.diff || Object.entries(g.want).filter(([k, v]) => (gotc[k] ?? "∅") !== v).map(([k, v]) => [k, v, gotc[k] ?? "∅"]);
  if (!diff.length) return ex("f UNEXPLAINED", "the unit read exactly the gold command, but the order-only alignment paired it with another request of the same action (a neighbour was verbless / extra)");
  const spanW = " " + words(g.span) + " ";
  const isRef = ([k, v]) => ENTITY.has(k) && (v.includes("$new") || v.split(/,(?![^(]*\))/).filter((x) => !x.startsWith("mention(") && x !== "$new").some((x) => !spanW.includes(" " + words(x.replace(/_/g, " ")) + " ")));
  if (diff.every(isRef)) return ex("e REFERENCE", "e " + diff.map(([k]) => k).join("+") + (PRON.test(g.span) ? " (pronoun in span)" : " (name not in span)"), `  diff ${diff.map(([k, v, o]) => `${k}: gold ${v} got ${o}`).join("; ")}`);
  const d1 = diff.find((d) => !isRef(d));
  return ex("d WORLD READING", "d2 key " + d1[0] + (d1[2] === "∅" ? " missing" : " wrong"), `  diff ${diff.map(([k, v, o]) => `${k}: gold ${v} got ${o}`).join("; ")}`);
}

// ---------- extras
function extraClass(e, G, units, r) {
  const u = units[e.m.n.unit], gs = G.filter((o) => ov(o.s, o.e, u.c0, u.c1) > 0);
  const txt = `${r.id}  unit "${u.src}" (${u.world}) -> ${e.m.act} ${JSON.stringify(e.m.n.args)}${gs.length ? "  overlaps gold " + gs.map((g) => g.act + ' "' + g.span + '"').join(" + ") : ""}`;
  if (!gs.length) return { c: "from a unit with no gold request (text outside every span)", ex: txt };
  if (gs.some((g) => units.filter((v) => ov(g.s, g.e, v.c0, v.c1) > 0).length >= 2)) return { c: "second piece of a split request", ex: txt };
  if (gs.length >= 2) return { c: "from a merged unit (two requests in one unit)", ex: txt };
  const g = gs[0];
  return { c: g.act !== e.m.act ? "other: unit of one request, produced a different action (counted also as not done)" : "other: unit of one request, same action produced twice or misaligned", ex: txt };
}

// ---------- run
const spread = (a, n) => (a.length <= n ? a : Array.from({ length: n }, (_, i) => a[Math.floor((i * a.length) / n)]));
const T = { learned: { right: 0, wrong: 0, notdone: 0, extra: 0 }, gold: { right: 0, wrong: 0, notdone: 0, extra: 0 } }, byDir = {};
const CA = {}, EX = {}, VB = { n: 0, outcome: {}, kinds: {}, kindEx: {}, prevSame: 0 }, GOLDCAUSE = {};
const add = (m, c, sub, ex) => { const k = c + " / " + sub; (m[k] = m[k] || []).push(ex); };
const nGoldTot = { n: 0 };
const goldByAction = {};
const MIS = { n: 0 };
const THR = [0.05, 0.1, 0.2], ABS = { learned: {}, gold: {} };
function absTally(cut, E) {
  for (const m of E.mains) {
    const A = ABS[cut]; const row = (A[m.kind] = A[m.kind] || { n: 0, abstain: 0, thr: THR.map(() => 0), okMin: [], hist: 0 });
    row.n++; if (m.rstatus === "abstain") row.abstain++; THR.forEach((t, i) => { if (m.rstatus === "abstain" || m.margin < t) row.thr[i]++; });
  }
}
const outcomeByAct = { learned: {}, gold: {} };
for (const d of dirs) {
  const files = readdirSync(d).filter((f) => f.endsWith(".jsonl")).sort();
  const rows = files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)));
  const name = d.split("/").slice(-2).join("/");
  byDir[name] = { learned: { right: 0, wrong: 0, notdone: 0, extra: 0 }, gold: { right: 0, wrong: 0, notdone: 0, extra: 0 }, n: 0, msgs: rows.length };
  for (const r of rows) {
    const L = evaluate(r, "learned"), Gd = evaluate(r, "gold");
    for (const [cut, E] of [["learned", L], ["gold", Gd]]) {
      for (const g of E.G) { T[cut][g.status]++; byDir[name][cut][g.status]++; const oa = outcomeByAct[cut][g.ev] = outcomeByAct[cut][g.ev] || { right: 0, wrong: 0, notdone: 0 }; oa[g.status]++; }
      T[cut].extra += E.extras.length; byDir[name][cut].extra += E.extras.length;
    }
    MIS.n += L.G.filter((g) => g.misaligned).length; absTally("learned", L); absTally("gold", Gd); byDir[name].n += L.G.length;
    // causes (learned cut)
    for (const g of L.G) if (g.status !== "right") { const k = cause(g, L.G, L.units, r, L.nodes); add(CA, k.c, k.sub, { ex: `[${g.status}] ` + k.ex, status: g.status, id: r.id, dir: name }); }
    PAIRS_ON = false;
    for (const g of Gd.G) if (g.status !== "right") { const k = cause(g, Gd.G, Gd.units, r, Gd.nodes); add(GOLDCAUSE, k.c, k.sub, { ex: `[${g.status}] ` + k.ex, status: g.status }); }
    PAIRS_ON = true;
    for (const e of L.extras) { const k = extraClass(e, L.G, L.units, r); (EX[k.c] = EX[k.c] || []).push({ ex: k.ex, dir: name }); }
    // verbless study (by the fallback's front end), outcome from the learned cut
    for (const g of L.G) {
      const { tokens } = FRONT.normalize(g.span, names0(r), comp.fallback.F);
      if (tokens.some((t) => comp.fallback.verbEvent.has(t))) continue;
      VB.n++; VB.outcome[g.status] = (VB.outcome[g.status] || 0) + 1;
      const prev = L.G.filter((o) => o.s < g.s).sort((a, b) => b.s - a.s)[0];
      const kind = verblessKind(g, prev, r, tokens);
      (VB.kinds[kind] = VB.kinds[kind] || []).push({ ex: `${r.id}  [${g.status}] span "${g.span}"  gold ${g.act} ${goldTxt(g)}  trigger "${g.w.trigger}"  prev: ${prev ? prev.act + ' "' + prev.span + '"' : "none"}  tokens [${tokens.join(" ")}]`, status: g.status });
    }
  }
}
function names0(r) { return r.names || []; }
function verblessKind(g, prev, r, tokens) { return trigKind(g, r) + " || prev " + (!prev ? "none" : prev.ev === g.ev ? "same action" : "other action") + " || " + g.w.type; }

// ---------- print
const pc = (x, n) => (n ? (100 * x / n).toFixed(1) + "%" : "-");
const line = (t) => { const n = t.right + t.wrong + t.notdone; return `right ${t.right} (${pc(t.right, n)}) · wrong ${t.wrong} (${pc(t.wrong, n)}) · not done ${t.notdone} (${pc(t.notdone, n)}) · extra ${t.extra}  [requested ${n}]`; };
console.log("\n=== 1. Totals per requested action, learned cut ===\nALL: " + line(T.learned));
for (const [d, v] of Object.entries(byDir)) console.log(`  ${d.padEnd(28)} ${line(v.learned)}`);
console.log("\nper gold action (learned cut): action right/wrong/notdone");
for (const [a, v] of Object.entries(outcomeByAct.learned).sort((x, y) => (y[1].right + y[1].wrong + y[1].notdone) - (x[1].right + x[1].wrong + x[1].notdone))) console.log(`  ${a.padEnd(12)} ${v.right}/${v.wrong}/${v.notdone}  (of ${v.right + v.wrong + v.notdone})`);
const bad = T.learned.wrong + T.learned.notdone;
console.log(`\n=== 2. First cause of every requested action that is not right (learned cut; ${bad} requests) ===`);
const order = Object.keys(CA).sort();
let tot2 = 0; for (const k of order) tot2 += CA[k].length;
for (const c of [...new Set(order.map((k) => k.split(" / ")[0]))]) {
  const ks = order.filter((k) => k.startsWith(c + " / ")), nC = ks.reduce((a, k) => a + CA[k].length, 0);
  console.log(`\n${c}: ${nC} (${pc(nC, bad)} of the not-right; wrong ${ks.reduce((a, k) => a + CA[k].filter((x) => x.status === "wrong").length, 0)}, not done ${ks.reduce((a, k) => a + CA[k].filter((x) => x.status === "notdone").length, 0)})`);
  for (const k of ks) {
    const L = CA[k]; console.log(` ${k.split(" / ")[1]}: ${L.length} (${pc(L.length, bad)}; wrong ${L.filter((x) => x.status === "wrong").length}, not done ${L.filter((x) => x.status === "notdone").length})`);
    for (const e of spread(L, NEX)) console.log("     " + e.ex.slice(0, 420));
  }
}
console.log(`\n=== 3. Extra actions (learned cut; ${T.learned.extra}) ===`);
for (const [c, L] of Object.entries(EX).sort((a, b) => b[1].length - a[1].length)) { console.log(`\n${c}: ${L.length} (${pc(L.length, T.learned.extra)})`); for (const e of spread(L, NEX)) console.log("     " + e.ex.slice(0, 420)); }
console.log("\n=== 4. Cutter cost: learned cut vs gold cut (units = gold spans) ===");
console.log("learned cut: " + line(T.learned)); console.log("gold cut:    " + line(T.gold));
const dl = (k) => T.gold[k] - T.learned[k];
console.log(`difference (gold minus learned): right ${dl("right")}, wrong ${dl("wrong")}, not done ${dl("notdone")}, extra ${dl("extra")}`);
for (const [d, v] of Object.entries(byDir)) console.log(`  ${d.padEnd(28)} learned: ${line(v.learned)}\n  ${"".padEnd(28)} gold:    ${line(v.gold)}`);
console.log("\nFirst cause of the not-right requests with the GOLD cut:");
for (const k of Object.keys(GOLDCAUSE).sort()) console.log(`  ${k}: ${GOLDCAUSE[k].length} (wrong ${GOLDCAUSE[k].filter((x) => x.status === "wrong").length}, not done ${GOLDCAUSE[k].filter((x) => x.status === "notdone").length})`);
console.log("\nc3 (token of another event) top pairs gold <- token:"); for (const [k, v] of Object.entries(PAIRS.c3).sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`   ${v}  ${k}`);
console.log("d1 (wrong action in the right world) top pairs:"); for (const [k, v] of Object.entries(PAIRS.d1).sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`   ${v}  ${k}`);
console.log(`\nalignment artefact: ${MIS.n} of the ${T.learned.wrong} 'wrong' requests (learned cut) were paired with the wrong gold request: the produced command is exactly right for ANOTHER gold request of the same message (same action)`);
console.log("\n=== 6. If readings below a margin were not executed (asked instead) ===");
for (const cut of ["learned", "gold"]) {
  console.log(`cut ${cut}: produced actions right ${ABS[cut].right.n}, wrong ${ABS[cut].wrong.n}, extra ${ABS[cut].extra.n}`);
  const rule = (label, f) => console.log(`  ${label.padEnd(22)} becomes a question: right ${f("right")} (${pc(f("right"), ABS[cut].right.n)} lost) · wrong ${f("wrong")} (${pc(f("wrong"), ABS[cut].wrong.n)}) · extra ${f("extra")} (${pc(f("extra"), ABS[cut].extra.n)})`);
  rule("status abstain", (k) => ABS[cut][k].abstain); THR.forEach((t, i) => rule(`margin < ${t} or abstain`, (k) => ABS[cut][k].thr[i]));
}
console.log(`\n=== 5. Verbless study: gold requests whose span has no action token (fallback front end): ${VB.n} of ${T.learned.right + T.learned.wrong + T.learned.notdone} ===`);
console.log("outcome with the learned cut: " + JSON.stringify(VB.outcome));
{ const by = {}; for (const [k, L] of Object.entries(VB.kinds)) { const [kind, prev, ty] = k.split(" || "); (by[kind] = by[kind] || {})[prev + " / " + ty] = L.length; }
  console.log("\nverbless kinds x previous request x type:"); for (const [kind, o] of Object.entries(by).sort()) { console.log(` ${kind}: ${Object.values(o).reduce((a, b) => a + b, 0)}`); for (const [k, v] of Object.entries(o).sort()) console.log(`      ${k}: ${v}`); } }
for (const k of Object.keys(VB.kinds).sort()) { console.log(`\n${k}: ${VB.kinds[k].length}  (right ${VB.kinds[k].filter((x) => x.status === "right").length}, wrong ${VB.kinds[k].filter((x) => x.status === "wrong").length}, not done ${VB.kinds[k].filter((x) => x.status === "notdone").length})`); for (const e of spread(VB.kinds[k], Math.max(NEX, 12))) console.log("     " + e.ex.slice(0, 400)); }
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ ABS, T, byDir, CA, EX, GOLDCAUSE, VB, outcomeByAct }, null, 1));
