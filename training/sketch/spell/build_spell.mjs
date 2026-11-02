// build_spell.mjs: builds docs/model/spell/vocab.json for the VSA spell checker (docs/js/spell.js) and chooses its parameters once,
// by the protocol below; then reports the checker on typo'd copies of the demo's benchmark sets.
//
//   node training/sketch/spell/build_spell.mjs [--typo-out <dir>] [--no-write]
//     --typo-out <dir>: also write the typo'd benchmark sets there (<dir>/<set>.json, the rows of docs/bench/<set>.json with `text`
//                       replaced and a `typo` field), for short_bench.mjs (BENCH_DIR=<dir>).
//
// Vocabulary (the words the readers know), lower-case words of letters only:
//   - the composer's worlds (docs/model/micro/registry.json: every world and the fallback): model.json lexicon, the catalog's words
//     whose kind is not unknown / NAME / NUM / TEXT, and the words of front.json's value phrases and trigger phrases;
//   - added in the page and here: the legend's values and cue words (docs/js/logic.js; SpellKit.legendWords) and the canvas names.
// Kept words (`keep`: never corrected, never a correction target): the words of the training messages the worlds are trained from
// (committed training/sketch/llm_train/**/*.jsonl, outside quotes, written in lower case) that occur in 2 or more DISTINCT messages (a word
// written in two different messages is a word, not a typo; a text saved twice is one message), less the vocabulary.
//
// Protocol (owner's request 2026-11-02; fixed before the run):
//   Typo test: every message of the demo's benchmark sets (docs/bench/*.json) gets ONE typo in one known word: a word of the text
//   written in lower case, of 3 or more letters, in the vocabulary, not quoted, not after named/called/titled/labeled, not a canvas
//   name. The typo is a deletion, insertion, substitution or transposition (uniform), at a uniform position, with a uniform letter a-z.
//   A typo that makes another known word ("from" -> "form") cannot be found by a word-level checker; it is counted apart ("real-word").
//   Outcome of the typo'd word: fixed right (back to the original word), fixed wrong (another word), left. Clean texts: every
//   correction made on the original message is a false correction (the broad set has real typos in it, so this may overcount).
//   Selection: typo seed 1. Grid: n-grams {3} or {2,3}; threshold 0.40 .. 0.90 step 0.05; margin {0, .02, .04, .06, .08, .10, .15};
//   D = 1024, vector seed fixed. Objective: right - 3 * wrong - 3 * false corrections (a wrong change is worse than leaving a typo;
//   AGENTS.md "done wrong first"). Highest objective wins; ties -> the higher threshold, then the higher margin.
//   Report: a fresh typo draw of the same sets (seed 2), the clean sets, and as an outside check 2000 training messages (shuffled
//   with seed 7, typo seed 1): long, chatty messages with many rare words.
// Earlier runs (2026-11-02), selection on 2000 training messages instead of the bench:
//   run 1, vocabulary = the worlds' words and the legend (592 words), D 2048: every threshold that fixed typos also changed ordinary
//   words missing from the vocabulary (threshold 0.75: 92 false corrections in 2000 clean messages, e.g. wants -> want x225); chosen
//   threshold 0.85 fixed 6 of 1958 typos (bench: 6 of 1087).
//   run 2, + the training messages' words (2699 words), D 1024: rare real words of the chatty training texts are one edit from known
//   words (core -> score, county -> count, fairy -> fair, taxis -> axis; 268 changes at threshold 0.6); chosen threshold 0.9 fixed 1.
//   run 3, the owner's protocol (selection on the bench), the training words as correction TARGETS: chosen n-grams 2+3, threshold
//   0.55, margin 0.06; bench seed 2: right 401, wrong 64, left 598 of 1063; many wrong fixes went to rare training words the readers
//   do not know (theer -> theater, cop -> coop, reanme -> readme). The owner's spec says the nearest KNOWN word: run 4 (this file)
//   keeps the training words only as words that are left alone (`keep`); targets are the readers' words. Nothing else changed.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const REPO = new URL("../../../", import.meta.url).pathname;
const SpellKit = require(REPO + "docs/js/spell.js");
const K = require(REPO + "docs/js/logic.js");
const args = process.argv.slice(2), opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const TYPO_OUT = opt("--typo-out"), WRITE = !args.includes("--no-write");

// ---- vocabulary from the composer's worlds
const MODELS = REPO + "docs/model/";
const REG = JSON.parse(readFileSync(MODELS + "micro/registry.json", "utf8"));
const worlds = REG.worlds.map((w) => w.model).concat(REG.fallback ? [REG.fallback] : []);
const WORD = /^[a-z]+$/, vocab = new Map();   // word -> set of sources
const add = (w, src) => { if (WORD.test(w)) { if (!vocab.has(w)) vocab.set(w, new Set()); vocab.get(w).add(src); } };
const wordSources = () => { const c = {}; for (const s of vocab.values()) for (const x of s) c[x] = (c[x] || 0) + 1; return c; };
for (const m of worlds) {
  const mj = JSON.parse(readFileSync(MODELS + m + "/model.json", "utf8"));
  for (const w of Object.keys(mj.lexicon || {})) add(w, "lexicon");
  for (const [w, v] of Object.entries((mj.catalog && mj.catalog.words) || {})) if (!["unknown", "NAME", "NUM", "TEXT"].includes(v.kind)) add(w, "catalog");
  if (existsSync(MODELS + m + "/front.json")) {
    const F = JSON.parse(readFileSync(MODELS + m + "/front.json", "utf8"));
    for (const k of Object.keys(F.values || {})) for (const w of k.split(" ")) add(w, "values");
    for (const t of F.triggers || []) for (const w of t.p.split(" ")) add(w, "triggers");
  }
}

// ---- seeded helpers
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pick = (r, a) => a[Math.floor(r() * a.length)];
const LET = "abcdefghijklmnopqrstuvwxyz", NAMING = new Set(["named", "called", "titled", "labeled", "labelled"]);
const TOK = /"[^"]*"|“[^”]*”|(?<![A-Za-z0-9])'[^']+'(?![A-Za-z0-9])|[A-Za-z0-9_]+(?:['’][A-Za-z]+)*|[.!?]/g;
/** one typo in one known word of the text -> {text, word, typo, op, at, realWord} or null (no candidate word) */
function typoOf(text, names, known, untouched, r) {
  const nm = new Set((names || []).map((n) => String(n).toLowerCase())), cands = [];
  let prev = null;
  for (const m of text.matchAll(TOK)) {
    const t = m[0]; if (/^[.!?"“']/.test(t)) { prev = null; continue; }
    if (/^[a-z]+$/.test(t) && t.length >= 3 && known(t) && !nm.has(t) && !(prev && NAMING.has(prev))) cands.push({ w: t, at: m.index });
    prev = t.toLowerCase();
  }
  if (!cands.length) return null;
  const c = pick(r, cands), w = c.w;
  for (let tries = 0; tries < 50; tries++) {
    const op = pick(r, ["deletion", "insertion", "substitution", "transposition"]);
    let y;
    if (op === "deletion") { const i = Math.floor(r() * w.length); y = w.slice(0, i) + w.slice(i + 1); }
    else if (op === "insertion") { const i = Math.floor(r() * (w.length + 1)); y = w.slice(0, i) + pick(r, LET) + w.slice(i); }
    else if (op === "substitution") { const i = Math.floor(r() * w.length); y = w.slice(0, i) + pick(r, LET.replace(w[i], "")) + w.slice(i + 1); }
    else { const i = Math.floor(r() * (w.length - 1)); if (w[i] === w[i + 1]) continue; y = w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2); }
    if (y === w) continue;
    return { text: text.slice(0, c.at) + y + text.slice(c.at + w.length), word: w, typo: y, op, at: c.at, realWord: untouched(y) || nm.has(y) };
  }
  return null;
}

// ---- data
const trainFiles = execSync("git ls-files 'training/sketch/llm_train/*.jsonl' 'training/sketch/llm_train/**/*.jsonl'", { cwd: REPO, encoding: "utf8" }).split("\n").filter(Boolean).sort();
// each message TEXT counts once: the texts_*.jsonl saved before annotation and the msg_*.jsonl / batch_*.jsonl with the same texts, the
// llm_train/{sonnet,haiku} copies of the *_short folders and repeated folders are the same message (2026-11-02 review: 13528 rows, 6538 distinct
// texts in llm_train alone; the typos abov, benath, betwen, blu, botom, diamand, lft, moev were "words of 2+ messages" because one text was counted 2-3 times)
let train = []; const seenText = new Set(); let nRows = 0;
for (const f of trainFiles) for (const l of readFileSync(REPO + f, "utf8").split("\n")) if (l.trim()) { const j = JSON.parse(l); if (j.text) { nRows++; if (seenText.has(j.text)) continue; seenText.add(j.text); train.push({ text: j.text, names: j.names || [] }); } }
console.log(`training texts: ${nRows} rows, ${train.length} distinct texts`);
{ const r = rng(7); for (let i = train.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [train[i], train[j]] = [train[j], train[i]]; } }
const nTrainAll = train.length, rest = train, keepAll = new Set(); train = train.slice(0, 2000);
{ const df = new Map();
  for (const x of rest) { const seen = new Set(); let prev = null;
    for (const m of x.text.matchAll(TOK)) { const t = m[0]; if (/^[.!?"“']/.test(t)) { prev = null; continue; } if (/^[a-z]+$/.test(t)) seen.add(t); prev = t; }
    for (const w of seen) df.set(w, (df.get(w) || 0) + 1); }
  for (const [w, n] of df) if (n >= 2 && WORD.test(w)) keepAll.add(w);
  console.log(`training words in 2+ of ${rest.length} distinct messages: ${keepAll.size}`); }
const vssWords = [...vocab.keys()].sort();
const legendWords = SpellKit.legendWords(K.createSystem().engine.legend);
const keepWords = [...keepAll].filter((w) => !vocab.has(w) && !legendWords.includes(w)).sort();
console.log(`vocabulary: ${vssWords.length} words of the worlds, ${legendWords.length} legend words, ${new Set(vssWords.concat(legendWords)).size} together; kept words ${keepWords.length}`);
const SETS = ["hand", "blind", "broad", "seen", "new_identities", "heldout_formulations"];
const bench = SETS.flatMap((s) => JSON.parse(readFileSync(REPO + `docs/bench/${s}.json`, "utf8")).map((row, i) => ({ set: s, i, row, text: row.text, names: row.names || [] })));

// ---- raw decisions: every word the checker would look at, with its best candidate and the two similarities (threshold/margin open)
function raw(sc, rows, seed) {
  const r = rng(seed), out = [];
  for (const x of rows) {
    const ty = typoOf(x.text, x.names, (w) => sc.has(w), (w) => sc.has(w) || sc.kept(w), r);
    const all = (t) => sc.check(t, { names: x.names, threshold: -9, margin: -9 }).fixes;
    out.push({ x, ty, clean: all(x.text), typod: ty ? all(ty.text) : [] });
  }
  return out;
}
const applies = (f, thr, mar) => f.sim >= thr && f.sim - f.second >= mar;
function tally(R, thr, mar) {
  const t = { msgs: R.length, typos: 0, realWord: 0, right: 0, wrong: 0, left: 0, falseFix: 0, falseMsgs: 0, falseList: [] };
  for (const { x, ty, clean, typod } of R) {
    const fc = clean.filter((f) => applies(f, thr, mar));
    t.falseFix += fc.length; if (fc.length) { t.falseMsgs++; t.falseList.push(...fc.map((f) => ({ text: x.text, from: f.from, to: f.to, sim: f.sim, second: f.second }))); }
    if (!ty) continue;
    t.typos++;
    if (ty.realWord) { t.realWord++; continue; }
    const f = typod.find((f) => f.at === ty.at);
    if (!f || !applies(f, thr, mar)) t.left++;
    else if (f.to.toLowerCase() === ty.word) t.right++; else t.wrong++;
  }
  t.score = t.right - 3 * t.wrong - 3 * t.falseFix;
  return t;
}

// ---- protocol: selection on the benchmark sets, typo seed 1
const THR = [], MAR = [0, 0.02, 0.04, 0.06, 0.08, 0.10, 0.15]; for (let v = 40; v <= 90; v += 5) THR.push(v / 100);
const NG = [[3], [2, 3]];
const base = { D: 1024, seed: 1234567, minLen: 3 };
let best = null; const grid = [];
for (const ngrams of NG) {
  const t0 = Date.now(), sc = SpellKit.create({ params: { ...base, ngrams }, words: vssWords.concat(legendWords), keep: keepWords });
  const R = raw(sc, bench, 1);
  for (const thr of THR) for (const mar of MAR) {
    const t = tally(R, thr, mar), g = { ngrams: ngrams.join("+"), thr, mar, ...t, falseList: undefined }; grid.push(g);
    if (!best || t.score > best.score || (t.score === best.score && (thr > best.thr || (thr === best.thr && mar > best.mar)))) best = { ...g, ngramsArr: ngrams };
  }
  console.log(`n-grams ${ngrams.join("+")}: ${sc.size()} words, raw pass ${Date.now() - t0} ms`);
}
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) : "0.0") + "%";
const row = (t) => `typos ${t.typos} (real-word ${t.realWord}) | right ${t.right} (${pct(t.right, t.typos - t.realWord)}) wrong ${t.wrong} (${pct(t.wrong, t.typos - t.realWord)}) left ${t.left} (${pct(t.left, t.typos - t.realWord)}) | false corrections on clean text ${t.falseFix} in ${t.falseMsgs}/${t.msgs} messages`;
console.log(`\nSELECTION (${bench.length} benchmark messages, typo seed 1): chosen n-grams ${best.ngrams}, threshold ${best.thr}, margin ${best.mar}, objective ${best.score}`);
console.log("  " + row(best));
console.log("  neighbours of the choice (same n-grams):");
for (const g of grid.filter((g) => g.ngrams === best.ngrams && Math.abs(g.thr - best.thr) <= 0.1001 && [0, 0.04, best.mar, 0.1].includes(g.mar)))
  console.log(`   thr ${g.thr.toFixed(2)} mar ${g.mar.toFixed(2)}: right ${g.right} wrong ${g.wrong} left ${g.left} false ${g.falseFix} -> ${g.score}`);
const otherNg = grid.filter((g) => g.ngrams !== best.ngrams).sort((a, b) => b.score - a.score)[0];
console.log(`  best with n-grams ${otherNg.ngrams}: thr ${otherNg.thr} mar ${otherNg.mar}: right ${otherNg.right} wrong ${otherNg.wrong} left ${otherNg.left} false ${otherNg.falseFix} -> ${otherNg.score}`);

const params = { D: base.D, seed: base.seed, ngrams: best.ngramsArr, threshold: best.thr, margin: best.mar, minLen: base.minLen };
if (WRITE) {
  mkdirSync(MODELS + "spell", { recursive: true });
  writeFileSync(MODELS + "spell/vocab.json", JSON.stringify({
    about: "VSA spell checker vocabulary (docs/js/spell.js), built by training/sketch/spell/build_spell.mjs from the composer's worlds (registry.json: lexicon, catalog words with a learned kind, front.json value and trigger phrases). keep: the words of 2+ training messages, never corrected and never a correction target. The page adds the legend's values and cue words and the canvas names. params: chosen once by the protocol in build_spell.mjs (one typo per benchmark message, seed 1).",
    built_from: { sources: wordSources(), registry: "micro/registry.json", models: worlds, selection: { data: "docs/bench/*.json", messages: bench.length, typo_seed: 1, objective: "right - 3*wrong - 3*false", right: best.right, wrong: best.wrong, left: best.left, real_word: best.realWord, false_corrections: best.falseFix } },
    params, words: vssWords, keep: keepWords }, null, 0) + "\n");
  console.log(`wrote docs/model/spell/vocab.json: ${vssWords.length} words, ${keepWords.length} kept words, params ${JSON.stringify(params)}`);
}

// ---- report on the demo's benchmark sets (typo seed 2)
const sc = SpellKit.create({ params, words: vssWords.concat(legendWords), keep: keepWords });
const RB = raw(sc, bench, 2), tb = tally(RB, params.threshold, params.margin);
{ const RT = raw(sc, train, 1), tt = tally(RT, params.threshold, params.margin);
  console.log(`\nOUTSIDE CHECK on ${train.length} of ${nTrainAll} training messages (typo seed 1): ` + row(tt));
  const C = new Map(); for (const f of tt.falseList) { const k = `${f.from}->${f.to}`; C.set(k, (C.get(k) || 0) + 1); }
  console.log("  changes on the clean training texts: " + [...C].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, n]) => k + (n > 1 ? " x" + n : "")).join(", ")); }
console.log(`\nREPORT on the benchmark sets (${bench.length} messages, typo seed 2), threshold ${params.threshold} margin ${params.margin} n-grams ${params.ngrams.join("+")}:`);
console.log("  ALL " + row(tb));
for (const s of SETS) { const t = tally(RB.filter((q) => q.x.set === s), params.threshold, params.margin); console.log(`  ${s.padEnd(21)} ` + row(t)); }
const ops = {}; for (const q of RB) if (q.ty && !q.ty.realWord) { const o = q.ty.op, f = q.typod.find((f) => f.at === q.ty.at), k = !f || !applies(f, params.threshold, params.margin) ? "left" : f.to.toLowerCase() === q.ty.word ? "right" : "wrong"; ops[o] = ops[o] || { right: 0, wrong: 0, left: 0 }; ops[o][k]++; }
console.log("  by typo kind: " + Object.entries(ops).map(([o, v]) => `${o} ${v.right}/${v.wrong}/${v.left}`).join(" · ") + "  (right/wrong/left)");
console.log("  false corrections on the clean sets:"); for (const f of tb.falseList) console.log(`    ${f.from} -> ${f.to} (${f.sim} vs ${f.second}) in: ${f.text}`);
const wrongs = RB.filter((q) => q.ty && !q.ty.realWord).map((q) => ({ q, f: q.typod.find((f) => f.at === q.ty.at) })).filter(({ q, f }) => f && applies(f, params.threshold, params.margin) && f.to.toLowerCase() !== q.ty.word);
console.log("  typos fixed wrong:"); for (const { q, f } of wrongs) console.log(`    ${q.ty.word} -> ${q.ty.typo} -> ${f.to} (${f.sim} vs ${f.second})`);
const lefts = RB.filter((q) => q.ty && !q.ty.realWord).map((q) => ({ q, f: q.typod.find((f) => f.at === q.ty.at) })).filter(({ f }) => !f || !applies(f, params.threshold, params.margin));
console.log(`  typos left (first 25 of ${lefts.length}): ` + lefts.slice(0, 25).map(({ q, f }) => `${q.ty.word}->${q.ty.typo}${f ? `(${f.to} ${f.sim}/${f.second})` : ""}`).join(", "));
// timing of a whole message with the chosen parameters (fresh checker: the per-word cache starts empty)
{ const sc2 = SpellKit.create({ params, words: vssWords.concat(legendWords), keep: keepWords }), ms = [];
  for (const q of RB) { const t = q.ty ? q.ty.text : q.x.text, t0 = performance.now(); sc2.check(t, { names: q.x.names }); ms.push(performance.now() - t0); }
  ms.sort((a, b) => a - b); const at = (p) => ms[Math.min(ms.length - 1, Math.floor(p * ms.length))].toFixed(2);
  console.log(`  time per message (node, cold cache, D ${params.D}): median ${at(0.5)} ms, p95 ${at(0.95)} ms, max ${ms[ms.length - 1].toFixed(2)} ms`); }
// the owner's examples
for (const [t, names] of [["transform rectangle1 in a gree circle", ["rectangle1", "Start", "Process", "Check", "Done"]], ["draw a circle named Gree", ["Start"]], ['label it "teh"', ["Start"]], ["conect Strat to Done", ["Start", "Done"]]]) {
  const r = sc.check(t, { names }); console.log(`  example: ${t} -> ${r.text}  ${r.fixes.map((f) => `${f.from}->${f.to} ${f.sim}/${f.second}`).join(", ")}`);
}
if (TYPO_OUT) {
  mkdirSync(TYPO_OUT, { recursive: true });
  for (const s of SETS) writeFileSync(`${TYPO_OUT}/${s}.json`, JSON.stringify(RB.filter((q) => q.x.set === s).map((q) => q.ty ? { ...q.x.row, text: q.ty.text, typo: { word: q.ty.word, typo: q.ty.typo, op: q.ty.op, realWord: q.ty.realWord } } : { ...q.x.row, typo: null }), null, 1));
  console.log(`wrote the typo'd sets to ${TYPO_OUT}`);
}
