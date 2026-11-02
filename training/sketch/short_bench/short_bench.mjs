// short_bench.mjs (SHORT.md): rules vs VSS composer (registry default, as the demo: comp.formalize(text, {names, last: []}), context rule
// nextContext) on docs/bench/*.json. Scoring per gold request with llm_score.mjs's scoreMessage (LLM_SCORE_LIB=1, PAIR=value), each bench
// row turned into one gold wire (or its `wires`); also the demo Benchmark's bench-canon score().ok.
// Cause of every VSS gold request not right: first stage that explains it, from the composer's units.
// Two groups of sets (the output rows carry `group`):
//   templates: hand, blind, broad, seen, new_identities, heldout_formulations (docs/bench/*.json). WRITTEN OR GENERATED FROM THE RULES' OWN
//     TEMPLATES (generate.py + the rules' cue table; hand/blind/broad by the rules' author): they favour the Rules reader.
//   llm_short: the 3000 one-line commands written by LLM agents, with annotated spans (llm_train/{sonnet,haiku}_short/msg_*.jsonl): the
//     style people type in the demo. Caveat: the VSS cutter was trained on these messages (the worlds' rows too); the rules were not.
//     Not scored with the demo's bench-canon (no canonical gold): demoOk is null for these rows.
//   LLM_SHORT=0 skips llm_short. node short_bench.mjs <out.json>
// Options (default: off; the default run is unchanged):
//   BENCH_DIR=<dir>  read the sets from <dir>/<set>.json instead of docs/bench/ (e.g. the typo'd sets of training/sketch/spell/build_spell.mjs --typo-out)
//   GATE=95|97|99    also score VSS gated (llm_score.mjs GATE, PRECISION.md): each row gets vss.gated {r, w, e executed; ar, aw, ae asked;
//                    n produced; gold} and `gate` (the level); agg.py prints the gated line per group. Not with BEST=1 (its copy of the
//                    composer gives no signals, so everything would be asked).
//   SPELL=1          run the VSA spell checker (docs/js/spell.js, docs/model/spell/vocab.json + the legend) on each text before both readers,
//                    with the row's names as the canvas, as the demo does; the row gets `spell` (the fixes)
process.env.LLM_SCORE_LIB = "1"; process.env.PAIR = "value"; process.env.SEG = "composer";
const REPO = new URL("../../../", import.meta.url).pathname;   // the repository root
const { readFileSync, writeFileSync, existsSync, readdirSync } = await import("node:fs");
const L = await import(REPO + "training/sketch/llm_score.mjs");
const { score } = await import(REPO + "docs/js/bench-canon.js");
const { load } = await import(REPO + "docs/js/vss.js");
const { loadComposer } = await import(REPO + "docs/js/vss-composer.js");
const FRONT = await import(REPO + "docs/js/front.js");
const { Context, rawNodes, chooseReading } = await import(REPO + "docs/js/vss-context.js");
const { readingFromWires } = await import(REPO + "docs/js/vss-adapter.js");
const { nextContext } = await import(REPO + "docs/js/vss-composer.js");
const MODELS = new URL("file://" + REPO + "docs/model/");
const REG = JSON.parse(readFileSync(process.env.REGISTRY || new URL("micro/registry.json", MODELS), "utf8"));   // REGISTRY=<file>: another registry (paths in it relative to docs/model/)
const J = (p) => JSON.parse(readFileSync(new URL(p, MODELS), "utf8"));
const cache = new Map();
const loadModel = async (name) => {
  if (cache.has(name)) return cache.get(name);
  const d = new URL(`${name}/`, MODELS), rf = async (n) => { const b = readFileSync(new URL(n, d)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
  const m = { vss: await load(null, { readFile: rf, sentenceCandidates: true }), F: existsSync(new URL("front.json", d)) ? JSON.parse(await rf("front.json")) : null };
  cache.set(name, m); return m;
};
// WHOLE=1: the cut is forced to ONE unit = the whole message (the gold cut of a one-request row): the cutter's weights get +2e9 on
// pl=<s> for every B-<world> label (token 0 is a B, the worlds keep their order: the same constant on every B label) and +1e9 on bias for I
// (every later token is I). Everything else (world ranking, worlds, hint, router, context filler) is the default composer.
const CUTW = J(REG.cutter);
if (process.env.WHOLE === "1") { const S = { ...CUTW.segmenter }; for (const L of CUTW.labels) if (L.startsWith("B-")) S["pl=<s>\t" + L] = (S["pl=<s>\t" + L] || 0) + 2e9; S["bias\tI"] = (S["bias\tI"] || 0) + 1e9; CUTW.segmenter = S; }
const comp = await loadComposer(REG, CUTW, loadModel, { context: J(REG.context), eventCutter: J(REG.event_cutter) });
if (process.env.GATE && process.env.BEST === "1") throw new Error("GATE with BEST=1: the BEST copy of the composer gives no signals");
const sys = L.logic.createSystem();
let speller = null;
if (process.env.SPELL === "1") {
  const { createRequire } = await import("node:module"), SK = createRequire(import.meta.url)(REPO + "docs/js/spell.js"), V = J("spell/vocab.json");
  speller = SK.create({ params: V.params, words: V.words.concat(SK.legendWords(sys.engine.legend)), keep: V.keep || [] });
}
// BEST=1: when the cutter makes NO unit (every token O), one unit from the token with the largest B-<world> score to the end of the
// message, its worlds ranked at that token (what the cutter would give if it put a B there). Otherwise the cutter's own units.
// A copy of Composer.formalizeCutter (vss-composer.js) with only the units' source changed; the hint path is kept as is.
function cutsOf(text, canvas) {
  const cuts = FRONT.segmentWorlds(text, canvas, comp.cutter);
  if (cuts.length || process.env.BEST !== "1") return cuts;
  const C = comp.cutter, [toks] = FRONT.tokenize(text, canvas); if (!toks.length) return cuts;
  const { scores } = FRONT.segDecodeLabels(toks.map((x) => x[0]), C.segmenter, C.labels), B = C.labels.filter((l) => l.startsWith("B-"));
  let k = 0, best = -Infinity; scores.forEach((sc, i) => { const m = Math.max(...B.map((l) => sc[l])); if (m > best) { best = m; k = i; } });
  const ws = C.worlds.map((w, i) => ({ world: w, score: scores[k]["B-" + w], i })).sort((a, b) => (b.score - a.score) || (a.i - b.i)).map(({ world, score }) => ({ world, score }));
  return [{ c0: toks[k][1], c1: toks[toks.length - 1][2], worlds: ws, forced: true }];
}
function formalizeCuts(self, text, ctx = {}) {
  const update = nextContext, seq = { s: 0, m: 0 }, canvas = ctx.names || [];
  const c = { names: canvas, last: (ctx.last || []).slice(), refs: new Map() }, filler = new Context({ text, canvas, model: self.contextModel });
  const nodes = [], notes = [], units = [];
  const rawOf = (x, sq = seq) => { const verb = x.tokens.find((t) => x.w.verbEvent.has(t)) || x.r.frame.lemma || null, reading = readingFromWires(x.r.wires, verb, x.tokens);
    return { reading, raw: rawNodes(reading, x.info, canvas, sq) }; };
  const hintAt = self.eventCutter ? self.eventHints(text, canvas) : null;
  for (const cu of cutsOf(text, canvas)) {
    const { c0, c1 } = cu, src = text.slice(c0, c1), names = c.names.concat([...c.refs.keys()]);
    const u = Object.assign({ c0, c1, forced: !!cu.forced }, self.routeCutter(src, names, cu.worlds, hintAt ? hintAt(c0) : null));
    units.push(u); delete u.first;
    if (u.zone === "ignored") { delete u.options; continue; }
    let x = u.options[0], R = null; u.tie = u.options.length; u.decidedBy = "words";
    if (u.options.length > 1) { const rs = u.options.map((o) => rawOf(o)), d = chooseReading(filler, rs.map((q) => q.raw), c0, c1); x = u.options[d.index]; R = rs[d.index]; u.decidedBy = d.by; }
    if (!R) R = rawOf(x);
    Object.assign(u, { world: x.world, event: x.event, status: x.status, normalized: x.tokens.join(" "), reading: R.reading, notUnderstood: x.wnu.notU });
    delete u.options;
    const st = filler.step(R.raw, c0, c1);
    if (!st) continue;
    u.gaps = st.gaps.map((g) => ({ key: g.key, kind: g.kind, decision: g.decision }));
    if (st.asked) { u.zone = "ask"; u.askedBy = "context"; }
    else { const out = R.raw.nodes.filter((n) => n.type === "mention").concat([st.main]); for (const n of out) { n.world = u.world; if (n.type !== "mention") Object.defineProperty(n, "src", { value: src, enumerable: false, configurable: true }); } nodes.push(...out); }
    update(c, st.main);
  }
  return { nodes, notes, units };
}
const evWorld = new Map(); for (const w of REG.worlds) for (const e of w.events) evWorld.set(e.toLowerCase(), w.world);
const evOf = (type, a) => (type === "command" ? a.action : type === "question" ? (a.ask === "rules" ? "list" : a.ask) : type);
const SETS = ["hand", "blind", "broad", "seen", "new_identities", "heldout_formulations"].concat(process.env.LLM_SHORT === "0" ? [] : ["llm_short"]);
const llmShort = () => ["sonnet_short", "haiku_short"].flatMap((d) => readdirSync(REPO + `training/sketch/llm_train/${d}`).filter((f) => /^msg_.*\.jsonl$/.test(f)).sort().flatMap((f) => readFileSync(REPO + `training/sketch/llm_train/${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l))));
const out = [];
for (const id of SETS) {
  const isLLM = id === "llm_short", group = isLLM ? "llm_short" : "templates";
  const rows = isLLM ? llmShort() : JSON.parse(readFileSync(process.env.BENCH_DIR ? `${process.env.BENCH_DIR}/${id}.json` : REPO + `docs/bench/${id}.json`, "utf8"));
  for (let [k, r] of rows.entries()) {
    const CASE = { tofront: "toFront", toback: "toBack" }, fix = (a) => (a && CASE[a.action] ? { ...a, action: CASE[a.action] } : a);
    const wires = (r.wires ? r.wires.map((w) => ({ type: w.type, args: w.gold ?? w.args })) : [{ type: r.type, args: r.gold ?? r.args }]).map((w, j) => ({ type: w.type, args: fix(w.args), ...(isLLM && r.wires[j].span ? { span: r.wires[j].span } : {}) }));   // gold action case as logic.js writes it (llm_score's act label is case-sensitive)
    const sp = speller ? speller.check(r.text, { names: r.names || [] }) : null;
    if (sp) r = { ...r, text: sp.text };
    const row = { text: r.text, names: r.names || [], wires };
    const ctx = { names: r.names || [], last: [] };
    const rn = sys.formalize(r.text, ctx).nodes;
    const res = process.env.BEST === "1" ? formalizeCuts(comp, r.text, { names: r.names || [], last: [] }) : comp.formalize(r.text, { names: r.names || [], last: [] });
    const sR = L.scoreMessage(rn, row), sV = L.scoreMessage(res.nodes, row);
    const gated = process.env.GATE ? L.gateBlank() : null; if (gated) L.gateTally(gated, res.nodes, row);
    const units = res.units.map((u) => ({ src: u.src, zone: u.zone, world: u.world, event: u.event, status: u.status, reason: u.reason,
      candidates: u.candidates, forced: u.forced, tried: u.tried, hint: u.hint, normalized: u.normalized, notUnderstood: u.notUnderstood, gaps: u.gaps, decidedBy: u.decidedBy }));
    // per-world normalization of the whole text (front end of each world), for the front-normalization check
    const norm = {}; for (const w of comp.worlds) norm[w.id] = FRONT.normalize(r.text, r.names || [], w.F).tokens.join(" ");
    const segw = FRONT.segmentWorlds(r.text, r.names || [], comp.cutter).map((c) => ({ c0: c.c0, c1: c.c1, worlds: c.worlds.slice(0, 4) }));
    out.push({ set: id, group, i: k, text: r.text, names: r.names, wires: wires.map((w) => ({ ...w, event: evOf(w.type, w.args), world: evWorld.get(String(evOf(w.type, w.args)).toLowerCase()) || "fallback" })),
      demoOk: isLLM ? null : { rules: score(rn, r).ok, vss: score(res.nodes, r).ok },
      rules: { right: sR.right, wrong: sR.wrongAligned, missed: sR.missed, extra: sR.extra, bad: sR.bad, acts: rn.filter((n) => n.type !== "mention").map((n) => `${n.type}:${n.args.action || n.args.ask || ""}`) },
      vss: Object.assign({ right: sV.right, wrong: sV.wrongAligned, missed: sV.missed, extra: sV.extra, bad: sV.bad, acts: res.nodes.filter((n) => n.type !== "mention").map((n) => `${n.type}:${n.args.action || n.args.ask || ""}`) }, gated ? { gated } : {}),
      ...(gated ? { gate: process.env.GATE } : {}),
      units, notes: res.notes, norm, segw, ...(sp ? { spell: sp.fixes } : {}), ...(r.typo !== undefined ? { typo: r.typo } : {}) });
  }
  console.error(id, rows.length);
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
