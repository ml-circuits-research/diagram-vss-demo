// layer_score.mjs: the VSS layer and the post-VSS layer scored apart (LAYERS.md), per REQUESTED action and per gold key.
// Data: the 9 folders of micro_tools.py dirs; composer with docs/model/micro/registry.json (layer_common.mjs build(): one composer pass,
// cached; REBUILD=1 rebuilds the cache). Nothing in docs/js, llm_score.mjs or any model is changed.
//   VSS layer (before the adapter resolves anything; vss-context.js rawNodes), per gold key of every requested action that was done:
//     1 right; 2 honest gap (empty, or a reference word / a description, and the gold value's words are not in the unit);
//     3 filled WRONG (a name or value that is not the gold one); 4 missed (empty or a reference word although the gold words ARE in the unit);
//     5 an extra key nobody asked for (counted apart).
//   post-VSS layer, for the class-2 keys: resolved right / resolved wrong / unresolved; today (vss-adapter.js "it"/"them" -> ctx.last) and,
//     with FILL=1, the context filler (docs/js/vss-context.js with docs/model/context/weights.json, trained by train_context.mjs).
//   Requested actions: right / wrong / not done / extra, with llm_score.mjs's order-only alignment and with the value-aware one (pairValue).
// node layer_score.mjs [--examples N] [--json out.json]   (FILL=1 adds the filler columns; SPLIT=test restricts to the 20% test messages)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { canon } from "../../docs/js/bench-canon.js";
import { Context, ENTITY_KEYS } from "../../docs/js/vss-context.js";
import { build, dirsAll, pairOrder, pairValue, classifyKey, createdBefore, valEq, parts, canonN, isTest, words, candMatches } from "./layer_common.mjs";

const argv = process.argv.slice(2), exAt = argv.indexOf("--examples"), jsAt = argv.indexOf("--json");
const NEX = exAt >= 0 ? +argv[exAt + 1] : 5, JSON_OUT = jsAt >= 0 ? argv[jsAt + 1] : null;
const FILL = process.env.FILL === "1", SPLIT = process.env.SPLIT || "all";
const WFILE = process.env.WEIGHTS || new URL("../../docs/model/context/weights.json", import.meta.url).pathname;
const MODEL = FILL ? JSON.parse(readFileSync(WFILE, "utf8")) : null;
if (FILL && process.env.MARGIN != null) MODEL.margin = +process.env.MARGIN;
const C = await build(dirsAll());
const msgs = C.msgs.filter((m) => SPLIT === "all" || (SPLIT === "test" ? isTest(m.id) : !isTest(m.id)));
console.log(`composer: fallback ${C.meta.fallback} · cutter ${C.meta.cutter} · worlds ${C.meta.worlds.join(", ")} · cache built ${C.meta.built}`);
console.log(`messages ${msgs.length} (split ${SPLIT})${FILL ? ` · filler ${WFILE.replace(/.*docs\//, "docs/")} margin ${MODEL.margin}` : ""}`);

const inc = (o, k, n = 1) => { o[k] = (o[k] || 0) + n; return o; };
const spread = (a, n) => (a.length <= n ? a : Array.from({ length: n }, (_, i) => a[Math.floor((i * a.length) / n)]));
const pc = (x, n) => (n ? (100 * x / n).toFixed(1) + "%" : "-");
const isRefVal = (v) => v == null || parts(v).every((x) => x.startsWith("@") || x.startsWith("mention("));

const ACT = {}, actT = (name) => (ACT[name] = ACT[name] || { right: 0, wrong: 0, notdone: 0, asked: 0, extra: 0, extraAsked: 0, n: 0 });
const KEYCLS = {}, WORLDCLS = {}, DIRCLS = {}, SUB = {}, EXAMPLES = {}, EXTRAKEY = {}, EXTRAEX = [];
const POST = { base: {}, fill: {} }, POSTEX = { base: {}, fill: {} };
const VC = { n: 0, vssCorrect: 0, done: 0, byWorld: {} };
const GAPS = [];     // class-2 entity gaps, for the "what the data needs" table
const PAIRCH = { n: 0, changed: 0, newlyPaired: 0, unpaired: 0, swapped: 0 };
const FG = { byKey: {}, byKind: {}, ex: {} };   // filler gaps on paired requests
const NOTDONE_KEYS = { n: 0 };
const TRANS = {}, WHY = {}, WHYEX = {}; const ALLGAPS = [];

for (const m of msgs) {
  const G = m.gold, P = m.prods;
  // ---- the filler (FILL=1): run over the produced requests in order
  let F = null;
  if (FILL) {
    const ctx = new Context({ text: m.text, canvas: m.names, model: MODEL }), allRaw = P.flatMap((p) => p.raw.nodes);
    F = P.map((p) => {
      const u = m.units[p.u], raw = { nodes: p.raw.nodes, main: p.raw.nodes.find((n) => n.id === p.raw.mainId), defaulted: p.raw.defaulted };
      const st = ctx.step(raw, u.c0, u.c1, { tokens: p.tokens });
      for (const gp of st.gaps) ALLGAPS.push(`${gp.kind}${gp.rule ? " (" + gp.rule + ")" : ""} -> ${gp.decision}`);
      return { st, c: canon(st.main, allRaw), n: canonN(st.main, allRaw), ctx };
    });
    m._ctx = ctx;
  }
  const pO = pairOrder(P, G), pV = pairValue(m);
  const score = (name, pairs, got, asked) => {
    const T = actT(name), used = new Set(pairs.map((x) => x[0])), byG = new Map(pairs.map(([i, j]) => [j, i]));
    G.forEach((g, j) => {
      T.n++; const i = byG.get(j);
      if (i === undefined) T.notdone++;
      else if (asked && asked(i)) T.asked++;
      else if (Object.entries(g.want).every(([k, v]) => (got(i)[k] ?? "∅") === v)) T.right++; else T.wrong++;
    });
    P.forEach((p, i) => { if (!used.has(i)) { if (asked && asked(i)) T.extraAsked++; else T.extra++; } });
  };
  score("today: order-only alignment", pO, (i) => P[i].baseC);
  score("today: value-aware alignment", pV, (i) => P[i].baseC);
  if (FILL) { score("filler: order-only alignment", pO, (i) => F[i].c, (i) => F[i].st.asked); score("filler: value-aware alignment", pV, (i) => F[i].c, (i) => F[i].st.asked); }
  // today -> filler, per requested action (value-aware pairs), and why a request right today is asked with the filler
  if (FILL) { const byG = new Map(pV.map(([i, j]) => [j, i]));
    G.forEach((g, j) => { const i = byG.get(j); if (i === undefined) return;
      const ok = (got) => Object.entries(g.want).every(([k, v]) => (got[k] ?? "∅") === v), t0 = ok(P[i].baseC) ? "right" : "wrong", t1 = F[i].st.asked ? "asked" : ok(F[i].c) ? "right" : "wrong";
      inc(TRANS, `${t0} -> ${t1}`);
      if (t0 === "right" && t1 !== "right") for (const gp of F[i].st.gaps) if (gp.decision === "ask" || (t1 === "wrong" && gp.decision === "fill")) { const why = `${t0} -> ${t1}: ${gp.kind} ${gp.key} ${gp.decision}${g.want[gp.key] == null ? " (gold has no such key)" : ""}`; inc(WHY, why); (WHYEX[why] = WHYEX[why] || []).push(`${m.id} unit "${m.text.slice(m.units[P[i].u].c0, m.units[P[i].u].c1)}" | gold ${JSON.stringify(g.args)} | today ${JSON.stringify(P[i].baseC)} | filler ${JSON.stringify(F[i].c)}`); }
    }); }
  // pairing change
  { const o = new Map(pO.map(([i, j]) => [j, i])), v = new Map(pV.map(([i, j]) => [j, i]));
    G.forEach((g, j) => { PAIRCH.n++; const a = o.get(j), b = v.get(j); if (a !== b) { PAIRCH.changed++; if (a === undefined) PAIRCH.newlyPaired++; else if (b === undefined) PAIRCH.unpaired++; else PAIRCH.swapped++; } }); }
  // ---- per gold key, value-aware pairs
  const byG = new Map(pV.map(([i, j]) => [j, i]));
  G.forEach((g, j) => {
    const i = byG.get(j); if (i === undefined) { NOTDONE_KEYS.n += Object.keys(g.want).filter((k) => k !== "action" && k !== "ask").length; return; }
    const p = P[i], u = m.units[p.u], src = m.text.slice(u.c0, u.c1), created = createdBefore(m, j);
    let allOk = true; VC.done++;
    for (const [k, gv] of Object.entries(g.want)) {
      if (k === "action" || k === "ask") continue;
      const v = p.raw.defaulted.includes(k) ? null : p.rawC[k];
      const c = classifyKey(k, gv, v, src, p.tokens, created);
      if (c.cls !== "1" && c.cls !== "2") allOk = false;
      inc(KEYCLS[k] = KEYCLS[k] || {}, c.cls); inc(WORLDCLS[p.world] = WORLDCLS[p.world] || {}, c.cls); inc(DIRCLS[m.dir] = DIRCLS[m.dir] || {}, c.cls); inc(SUB, c.sub);
      const ex = `${m.id} [${p.world}] unit "${src}" | gold ${g.act} ${k}=${gv} | VSS ${k}=${v ?? "∅"}`;
      (EXAMPLES[c.sub] = EXAMPLES[c.sub] || []).push(ex);
      if (c.cls === "2") {
        // post-VSS layer: today, and the filler
        const post = (vv) => (vv == null || isRefVal(vv) ? "unresolved" : valEq(vv, gv, created) ? "right" : "wrong");
        const b = post(p.baseN[k]); inc(POST.base[k] = POST.base[k] || {}, b); (POSTEX.base[b] = POSTEX.base[b] || []).push(`${ex} | today ${p.baseN[k] ?? "∅"}`);
        if (FILL) { const fa = F[i].st.asked && post(F[i].n[k]) !== "right" ? "unresolved" : post(F[i].n[k]); const f = F[i].st.asked && fa === "unresolved" ? "asked" : fa; inc(POST.fill[k] = POST.fill[k] || {}, f); (POSTEX.fill[f] = POSTEX.fill[f] || []).push(`${ex} | filler ${F[i].n[k] ?? "∅"}${F[i].st.asked ? " (request asked)" : ""}`); }
        if (ENTITY_KEYS.includes(k)) GAPS.push({ m, j, i, k, gv, v, src, sub: c.sub, created });
      }
    }
    // class 5: keys VSS gave that the gold does not have
    for (const k of Object.keys(p.rawC)) if (!(k in g.want) && k !== "action" && k !== "ask" && !p.raw.defaulted.includes(k)) { inc(EXTRAKEY, k); if (EXTRAEX.length < 4000) EXTRAEX.push(`${m.id} [${p.world}] unit "${src}" | gold ${g.act} ${JSON.stringify(g.args)} | extra ${k}=${p.rawC[k]}`); }
    const actRight = Object.entries(g.want).every(([k, v]) => (p.baseC[k] ?? "∅") === v);
    if (allOk) { VC.vssCorrect++; inc(VC.byWorld[p.world] = VC.byWorld[p.world] || {}, "correct"); } inc(VC.byWorld[p.world] = VC.byWorld[p.world] || {}, "done");
    // filler gaps on this paired request
    if (FILL) for (const gp of F[i].st.gaps) {
      const gv = g.want[gp.key], gk = gp.key + (gp.index != null ? "[i]" : ""), kind = gp.kind;
      const inC = gv != null && gp.cands.some((c) => candMatches(m._ctx, c, gv, created));
      let res;
      if (gp.decision === "fill") { const fv = F[i].n[gp.key]; res = gv == null ? "filled (gold has no such key)" : valEq(gp.index != null ? fv : fv, gv, created) ? "filled right" : "filled wrong"; }
      else if (gp.decision === "dropped") { const fv = F[i].n[gp.key]; res = gv == null || valEq(fv, gv, created) ? "dropped right" : "dropped (gold has a value)"; }
      else res = gp.decision === "left" ? "left to the engine" : "asked";
      const row = (FG.byKey[gk] = FG.byKey[gk] || {}); inc(row, res); inc(row, "n"); if (inC) inc(row, "goldInCands"); if (gv == null) inc(row, "goldNoKey");
      const rk = (FG.byKind[kind] = FG.byKind[kind] || {}); inc(rk, res); inc(rk, "n"); if (inC) inc(rk, "goldInCands");
      (FG.ex[res] = FG.ex[res] || []).push(`${m.id} unit "${m.text.slice(m.units[P[i].u].c0, m.units[P[i].u].c1)}" | ${kind} ${gp.key}${gp.word ? " " + gp.word : ""} | gold ${gv ?? "∅"} | ${gp.decision === "fill" ? "filled " + F[i].n[gp.key] : gp.decision} (margin ${Number.isFinite(gp.margin) ? gp.margin.toFixed(2) : "inf"}, ${gp.cands.length - 1} candidates)`);
    }
  });
}

// ---------------------------------------------------------------- report
const CLS = ["1", "2", "3", "4"], CN = { 1: "right", 2: "honest gap", 3: "filled WRONG", 4: "missed" };
const tableCls = (title, M) => {
  console.log(`\n${title}\n| | gold keys | 1 right | 2 honest gap | 3 filled WRONG | 4 missed |\n|---|---|---|---|---|---|`);
  const tot = {};
  for (const [k, o] of Object.entries(M).sort((a, b) => Object.values(b[1]).reduce((x, y) => x + y, 0) - Object.values(a[1]).reduce((x, y) => x + y, 0))) {
    const n = CLS.reduce((x, c) => x + (o[c] || 0), 0); CLS.forEach((c) => inc(tot, c, o[c] || 0));
    console.log(`| ${k} | ${n} | ${CLS.map((c) => `${o[c] || 0} (${pc(o[c] || 0, n)})`).join(" | ")} |`);
  }
  const n = CLS.reduce((x, c) => x + (tot[c] || 0), 0); console.log(`| **all** | **${n}** | ${CLS.map((c) => `**${tot[c] || 0}** (${pc(tot[c] || 0, n)})`).join(" | ")} |`);
};
console.log("\n=== A1. Requested actions (all keys must equal the gold; extra keys do not count) ===");
console.log("| scoring | requested | right | wrong | asked | not done | extra executed | extra asked |\n|---|---|---|---|---|---|---|---|");
for (const [k, T] of Object.entries(ACT)) console.log(`| ${k} | ${T.n} | ${T.right} (${pc(T.right, T.n)}) | ${T.wrong} (${pc(T.wrong, T.n)}) | ${T.asked} | ${T.notdone} (${pc(T.notdone, T.n)}) | ${T.extra} | ${T.extraAsked} |`);
console.log(`\nalignment: of ${PAIRCH.n} requested actions, ${PAIRCH.changed} get another partner with the value-aware pairing (${PAIRCH.swapped} a different produced command, ${PAIRCH.newlyPaired} paired where order-only left them not done, ${PAIRCH.unpaired} not done where order-only paired them)`);
console.log(`\nVSS-correct (done, every gold key class 1 or 2): ${VC.vssCorrect} of ${VC.done} done (${pc(VC.vssCorrect, VC.done)}); of all requested ${actT("today: value-aware alignment").n}: ${pc(VC.vssCorrect, actT("today: value-aware alignment").n)}. Gold keys of requests not done (not classified): ${NOTDONE_KEYS.n}`);
console.log("| world | done | VSS-correct |\n|---|---|---|"); for (const [w, o] of Object.entries(VC.byWorld).sort((a, b) => b[1].done - a[1].done)) console.log(`| ${w} | ${o.done} | ${o.correct || 0} (${pc(o.correct || 0, o.done)}) |`);
tableCls("=== A2. VSS layer per gold key (requests done, value-aware pairs) ===", KEYCLS);
tableCls("=== A3. VSS layer per world (the world that read the unit) ===", WORLDCLS);
tableCls("=== A3b. VSS layer per data folder ===", DIRCLS);
console.log("\n=== A4. Sub-classes ==="); for (const [k, n] of Object.entries(SUB).sort()) console.log(`  ${k}: ${n}`);
console.log(`\n=== A5. Class 5, extra keys VSS gave that the gold does not have: ${Object.values(EXTRAKEY).reduce((a, b) => a + b, 0)} ===\n  ` + Object.entries(EXTRAKEY).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(", "));
for (const e of spread(EXTRAEX, NEX)) console.log("     " + e.slice(0, 300));
const postTable = (title, M) => {
  console.log(`\n${title}\n| key | class-2 keys | resolved right | resolved wrong | unresolved | asked |\n|---|---|---|---|---|---|`); const tot = {};
  for (const [k, o] of Object.entries(M).sort((a, b) => Object.values(b[1]).reduce((x, y) => x + y, 0) - Object.values(a[1]).reduce((x, y) => x + y, 0))) { const n = Object.values(o).reduce((a, b) => a + b, 0); for (const [c, v] of Object.entries(o)) inc(tot, c, v); console.log(`| ${k} | ${n} | ${o.right || 0} | ${o.wrong || 0} | ${o.unresolved || 0} | ${o.asked || 0} |`); }
  const n = Object.values(tot).reduce((a, b) => a + b, 0); console.log(`| **all** | **${n}** | **${tot.right || 0}** (${pc(tot.right || 0, n)}) | **${tot.wrong || 0}** (${pc(tot.wrong || 0, n)}) | **${tot.unresolved || 0}** (${pc(tot.unresolved || 0, n)}) | **${tot.asked || 0}** (${pc(tot.asked || 0, n)}) |`);
};
postTable("=== A6. Post-VSS layer on the class-2 keys: today (adapter: it/them -> last; nothing else) ===", POST.base);
if (FILL) postTable("=== A6b. Post-VSS layer on the class-2 keys: the context filler ===", POST.fill);
// ---- what the data needs: class-2 entity gaps by key, VSS form, words of the unit, and where the gold value is in the context
console.log(`\n=== A7. Class-2 entity gaps (${GAPS.length}): by key x what VSS gave ===`);
{ const t = {}; for (const g of GAPS) inc(t, `${g.k} | ${g.sub}`); for (const [k, n] of Object.entries(t).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`); }
// analysis only (not used by any reader): the reference words of the unit, by a regex on the unit text
const REFW = /\b(it|its|them|they|this|that|these|those|both|other|one|ones|new|copies|copy|each|same|all|everything)\b/gi;
console.log("\nby the reference words in the unit (analysis regex, sorted set of words; 'none' = no such word):");
{ const t = {}; for (const g of GAPS) { const w = [...new Set((g.src.match(REFW) || []).map((x) => x.toLowerCase()))].sort().join("+") || "none"; inc(t, `${g.k} | ${w}`); } for (const [k, n] of Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 40)) console.log(`  ${k}: ${n}`); }
console.log("\nwhere the gold value is, in the GOLD context before the request (first that holds):");
{ const t = {}, ex = {};
  for (const g of GAPS) {
    const prev = g.m.gold.filter((o) => o.s < g.m.gold[g.j].s).sort((a, b) => b.s - a.s), p1 = prev[0], gv = g.gv, cr = g.created;
    const eq = (v) => v != null && valEq(v, gv, cr), mainOf = (o) => (o.args.action === "create" ? (o.args.name != null ? String(o.args.name).toLowerCase() : "$new") : o.want.target ?? o.want.from);
    const before = words(g.m.text.slice(0, g.m.units[g.m.prods[g.i].u].c0));
    let w;
    if (!p1) w = parts(gv).every((x) => x !== "$new" && (" " + before + " ").includes(" " + words(x) + " ")) ? "no earlier request; named in the text before" : "no earlier request; not named before (canvas)";
    else if (eq(p1.want[g.k])) w = "previous request, same key";
    else if (eq(mainOf(p1))) w = "previous request, its main shape";
    else if (["target", "from", "to", "anchor"].some((k) => eq(p1.want[k]))) w = "previous request, another key";
    else if (prev.some((o) => ["target", "from", "to", "anchor"].some((k) => eq(o.want[k])) || eq(mainOf(o)))) w = "an earlier request (not the previous)";
    else if (parts(gv).length > 1 && parts(gv).every((x) => prev.some((o) => ["target", "from", "to", "anchor"].some((k) => o.want[k] != null && parts(o.want[k]).includes(x)) || mainOf(o) === x))) w = "a list made of shapes of earlier requests";
    else if (parts(gv).every((x) => x !== "$new" && (" " + before + " ").includes(" " + words(x) + " "))) w = "named only in text that is not a request";
    else w = "not in the context (canvas shape never named before)";
    inc(t, w); (ex[w] = ex[w] || []).push(`${g.m.id} unit "${g.src}" | ${g.k}=${gv} | VSS ${g.v ?? "∅"}`);
  }
  for (const [k, n] of Object.entries(t).sort((a, b) => b[1] - a[1])) { console.log(`  ${k}: ${n} (${pc(n, GAPS.length)})`); for (const e of spread(ex[k], 3)) console.log("       " + e.slice(0, 260)); }
}
console.log("\n=== A8. Examples per sub-class ===");
for (const k of Object.keys(EXAMPLES).sort()) { console.log(`\n${k} (${EXAMPLES[k].length})`); for (const e of spread(EXAMPLES[k], NEX)) console.log("     " + e.slice(0, 300)); }
console.log("\npost-VSS today, examples:"); for (const [k, L] of Object.entries(POSTEX.base)) { console.log(` ${k} (${L.length})`); for (const e of spread(L, NEX)) console.log("     " + e.slice(0, 320)); }
if (FILL) {
  console.log("\npost-VSS filler, examples:"); for (const [k, L] of Object.entries(POSTEX.fill)) { console.log(` ${k} (${L.length})`); for (const e of spread(L, NEX)) console.log("     " + e.slice(0, 320)); }
  console.log("\n=== B. Filler gaps on requests done (value-aware pairs): per key and per gap kind ===");
  const ft = (M) => { console.log("| | gaps | gold in candidates | filled right | filled wrong | filled (gold has no key) | asked | left to the engine | dropped right | dropped (gold has a value) |\n|---|---|---|---|---|---|---|---|---|---|"); for (const [k, o] of Object.entries(M).sort((a, b) => b[1].n - a[1].n)) console.log(`| ${k} | ${o.n} | ${o.goldInCands || 0} (${pc(o.goldInCands || 0, o.n)}) | ${o["filled right"] || 0} | ${o["filled wrong"] || 0} | ${o["filled (gold has no such key)"] || 0} | ${o.asked || 0} | ${o["left to the engine"] || 0} | ${o["dropped right"] || 0} | ${o["dropped (gold has a value)"] || 0} |`); };
  const all = {}; for (const st of ALLGAPS) inc(all, st); console.log("\nevery gap of every produced request (paired or extra), by kind and decision: " + Object.entries(all).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · "));
  ft(FG.byKey); ft(FG.byKind);
  for (const [k, L] of Object.entries(FG.ex)) { console.log(` ${k} (${L.length})`); for (const e of spread(L, NEX)) console.log("     " + e.slice(0, 320)); }
}
if (FILL) { console.log("\n=== B2. Requests done (value-aware pairs): today -> filler ==="); for (const [k, n] of Object.entries(TRANS).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`);
  console.log("\nwhy requests right today are not right with the filler (one line per gap that asked / filled):"); for (const [k, n] of Object.entries(WHY).sort((a, b) => b[1] - a[1])) { console.log(`  ${k}: ${n}`); for (const e of spread(WHYEX[k], 3)) console.log("       " + e.slice(0, 330)); } }
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ ACT, KEYCLS, WORLDCLS, DIRCLS, SUB, EXTRAKEY, POST, VC, PAIRCH, FG: { byKey: FG.byKey, byKind: FG.byKind } }, null, 1));
