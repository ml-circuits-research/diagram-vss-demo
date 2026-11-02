// feedback/data_needs.mjs: what data VSS needs, from UNLABELLED text only (owner's goal 2026-11-02 18:56: "a more explainable model, and
// indications of what data it needs"; DATA_NEEDS.md). It runs the VSS composer (the default registry, as the demo loads it:
// layer_common.mjs loadRegistry) over messages, reads only their `text` (and `id`, to name an instance; no gold, no canvas names unless
// --names is given), and collects every request VSS is not sure of or could not read, with the causes VSS itself names:
//   - a produced request whose combined confidence (docs/js/vss-confidence.js, the demo's model docs/model/confidence/vss.json) is under
//     the threshold of the precision level (default 97, the demo's): its reasons (vss-confidence.js reasons(): the groups cut, world,
//     words, unplaced, reading, context, prior, in the order of their pull) are expanded into concrete causes with the composer's own
//     outputs: the words of the unit whose kind is "unknown" in the chosen world (never in its training data), the words the reader placed
//     in no role (vss unplaced), the role with the smallest margin, the world chosen against the cutter's first choice, the gap the
//     context filler filled with a weak margin, the cut's boundary words;
//   - a unit the context filler asked about (zone "ask"): the gap (role, reference word);
//   - a unit no candidate world could read (zone "ignored": unknown-event / no-sense / no word understood): the first word of the unit no
//     candidate world knows, with the event cutter's hint (the composer's unit.hint: the event cutter's best B-<event> at its first token);
//   - a unit read that gave no request (the adapter gave nothing);
//   - text outside every unit (the cutter's O zones), cut at . ! ? ;, that some world reads as a request (vss-composer.js readWnu, the
//     composer's own rule: an event and at least one word understood): a request the cutter may have left out, with its action word.
// Every instance gets a GROUPING KEY made mechanically from these outputs (the cause, the unknown word or the kind of the unplaced word,
// the event read or hinted, the world, the role, the boundary word); instances with the same key make one NEED, counted in requests
// (distinct units), with up to 5 example snippets and a statement of the data to write (a template per cause, filled with the key's
// fields and the most frequent words / local constructions of its instances). No example is read to make a group.
//
//   node training/sketch/feedback/data_needs.mjs [options] <dir|file.jsonl> [...]
//     --split cal|test   keep only the fresh2 calibration part (int(sha256(id), 16) % 3 == 0) or the rest; applied to the ids while the
//                        lines are parsed, before any text is used
//     --ids <file>       keep only these ids (whitespace separated)
//     --names            pass the message's canvas names (field `names`) to the composer (default: text only, as asked)
//     --level 95|97      the precision level whose threshold makes a request "not sure" (default 97)
//     --out <file.json>  needs + instances (default: needs.json in the scratch folder given by DN_OUT_DIR or the cwd)
//     --md <file.md>     a markdown table of the top needs (default: none)   --top N (default 50, for the markdown)
//   REGISTRY=<file> as layer_common.mjs (default docs/model/micro/registry.json).
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as FRONT from "../../../docs/js/front.js";
import * as VC from "../../../docs/js/vss-confidence.js";
import { loadRegistry } from "../layer_common.mjs";

const PUNCT = new Set([".", ",", "!", "?", ";", ":"]);
const isCal = (id) => BigInt("0x" + createHash("sha256").update(String(id)).digest("hex")) % 3n === 0n;   // fresh2/fit_report.mjs split

/** messages of dirs / files -> [{id, text, names}]; the split / ids filter is applied to the id before the text is kept */
export function readMessages(paths, { split = null, ids = null, names = false } = {}) {
  const out = [], seen = new Set();
  for (const p of paths) {
    const files = statSync(p).isDirectory() ? readdirSync(p).filter((f) => f.endsWith(".jsonl")).sort().map((f) => `${p}/${f}`) : [p];
    for (const f of files) for (const line of readFileSync(f, "utf8").split("\n")) {
      if (!line.trim()) continue;
      const r = JSON.parse(line), id = String(r.id);
      if (split === "cal" && !isCal(id)) continue;
      if (split === "test" && isCal(id)) continue;
      if (ids && !ids.has(id)) continue;
      if (seen.has(id) || typeof r.text !== "string") continue;
      seen.add(id);
      out.push({ id, text: r.text, names: names && Array.isArray(r.names) ? r.names.slice() : [] });
    }
  }
  return out;
}

// ------------------------------------------------------------------ token helpers (per world)
const isUpperKind = (k) => typeof k === "string" && /^[A-Z_]+$/.test(k);
function kindIn(w, t) {
  const R = w.vss.reader, k = R.kind(t);
  return k === null || k === undefined || k === "unknown" || !R.rb.catId.has(k) ? "unknown" : k;
}
/** a normalized token as a construction class: names, texts, numbers and legend values by their class, other words as themselves */
function cls(w, t) {
  if (t.startsWith("n_")) return "NAME";
  if (t.startsWith("t_")) return "TEXT";
  if (/^\d+$/.test(t)) return "NUM";
  const k = w ? kindIn(w, t) : "unknown";
  return isUpperKind(k) && k !== "VERB" ? `[${k}]` : t;
}
/** the unit's surface tokens as construction classes, the token at focus (index into the surface) marked: -> "in the *corner*" */
function windowAt(tr, w, focusSurf, L = 2, R = 3) {
  // surface index -> normalized token
  const of = new Map(); tr.surf.forEach((ss, j) => ss.forEach((i) => of.set(i, j)));
  const a = Math.max(0, focusSurf - L), b = Math.min(tr.surface.length, focusSurf + R + 1), out = [];
  for (let i = a; i < b; i++) {
    const s = tr.surface[i][0], j = of.get(i), t = j === undefined ? s : tr.tokens[j];
    let c = s.startsWith("n_") ? "NAME" : s.startsWith("t_") ? "TEXT" : /^\d+$/.test(s) ? "NUM" : j !== undefined && t !== s ? cls(w, t) : s;
    if (i === focusSurf) c = `*${s.startsWith("n_") ? "NAME" : s.startsWith("t_") ? "TEXT" : s}*`;
    if (!out.length || out[out.length - 1] !== c || i === focusSurf) out.push(c);
  }
  return out.join(" ");
}
const surfIndexOf = (tr, j) => (tr.surf[j] && tr.surf[j].length ? tr.surf[j][0] : -1);
const lowerSurface = (tr, j) => (tr.surf[j] || []).map((i) => tr.surface[i][0]).join(" ");
/** the surface word before character c0 of text (lower case; names NAME): the left context of a unit */
function prevWord(text, c0, names) {
  const [toks] = FRONT.tokenize(text.slice(0, c0), names);
  if (!toks.length) return "<start>";
  const t = toks[toks.length - 1][0];
  return t.startsWith("n_") ? "NAME" : t.startsWith("t_") ? "TEXT" : /^\d+$/.test(t) ? "NUM" : t;
}
const firstWord = (tr) => { const s = tr.surface.find(([t]) => !PUNCT.has(t)); return s ? (s[0].startsWith("n_") ? "NAME" : s[0].startsWith("t_") ? "TEXT" : s[0]) : "-"; };

// ------------------------------------------------------------------ the analyzer
export async function makeAnalyzer({ level = "97" } = {}) {
  const { comp, meta } = await loadRegistry();
  const model = JSON.parse(readFileSync(new URL("../../../docs/model/confidence/vss.json", import.meta.url), "utf8"));
  const thr = VC.threshold(model, level), byId = new Map(comp.worlds.map((w) => [w.id, w]));
  const spec = VC.specOf(model);

  /** one message -> {instances, stats}; uses text (and canvas names when given) only */
  function analyze(msg) {
    const { id, text } = msg, canvas = msg.names || [];
    const out = comp.formalize(text, { names: canvas, last: [] });
    const inst = [], stats = { units: out.units.length, produced: 0, unsure: 0, sure: 0, ask: 0, ignored: 0, noRequest: 0, leftoverReads: 0 };
    const add = (u, o) => inst.push(Object.assign({ msg: id, c0: u.c0, c1: u.c1, src: text.slice(u.c0, u.c1) }, o));
    const namesAt = canvas;   // the composer adds the names created earlier; for the token classes the canvas is enough
    for (const u of out.units) {
      const src = text.slice(u.c0, u.c1);
      if (u.zone === "ignored") {
        stats.ignored++;
        // the first word no candidate world knows (kind unknown in every world tried), else the unit's first word
        const ws = (u.candidates || []).map((c) => byId.get(c.world)).filter(Boolean);
        const trs = ws.map((w) => FRONT.normalizeTrace(src, namesAt, w.F));
        let focus = null, fj = -1;
        if (ws.length) {
          const tr = trs[0];
          for (let j = 0; j < tr.tokens.length && focus === null; j++) {
            const t = tr.tokens[j];
            if (PUNCT.has(t) || t.startsWith("n_") || t.startsWith("t_") || /^\d+$/.test(t)) continue;
            if (ws.every((w) => kindIn(w, t) === "unknown")) { focus = t; fj = j; }
          }
        }
        const hint = u.hint || "?", status = u.status || "?";
        if (focus !== null) add(u, { stage: "reader: no action read", cause: "unread-unknown", key: `unread-unknown|${focus}|${hint}`, word: focus, event: hint, world: ws[0] ? ws[0].id : null,
          window: windowAt(trs[0], ws[0], surfIndexOf(trs[0], fj)), status, prev: prevWord(text, u.c0, namesAt) });
        else add(u, { stage: "reader: no action read", cause: "unread-known", key: `unread-known|${hint}`, word: trs[0] ? firstWord(trs[0]) : "-", event: hint, world: ws[0] ? ws[0].id : null, status,
          window: trs[0] ? windowAt(trs[0], ws[0], 0, 0, 4) : src, prev: prevWord(text, u.c0, namesAt) });
        continue;
      }
      const w = byId.get(u.world), tr = w ? FRONT.normalizeTrace(src, u.names || namesAt, w.F) : null;
      if (u.zone === "ask") {
        stats.ask++;
        for (const g of (u.gaps || []).filter((x) => x.decision === "ask"))
          add(u, { stage: "context filler: asked", cause: "ask", key: `ask|${u.event}|${g.key}|${g.word || g.kind}`, word: g.word ? g.word.replace(/^@/, "") : `(${g.kind})`, event: u.event, world: u.world, role: g.key });
        continue;
      }
      if (!u.signals) { stats.noRequest++; add(u, { stage: "adapter: no request", cause: "no-request", key: `no-request|${u.world}|${u.event}`, word: "-", event: u.event, world: u.world }); continue; }
      stats.produced++;
      const conf = VC.confidence(model, u.signals, u.world);
      if (conf >= thr) { stats.sure++; continue; }
      stats.unsure++;
      const reasons = VC.reasons(model, u), toks = tr.tokens;
      const empty = (u.gaps || []).filter((g) => g.kind === "empty").map((g) => g.key);
      const base = { conf, event: u.event, world: u.world, empty, reasons: reasons.map((r) => r.group) };
      const notU = new Set(u.notUnderstood || []), unpl = new Set((u.vss && u.vss.unplaced) || []);
      const seenKey = new Set(), push = (o) => { if (seenKey.has(o.key)) return; seenKey.add(o.key); add(u, Object.assign({}, base, o)); };
      const unknownWord = (j) => { const t = toks[j]; push({ stage: "front end: word never seen by the world", cause: "unknown-word", key: `unknown-word|${t}|${u.event}`, word: t, window: windowAt(tr, w, surfIndexOf(tr, j)) }); };
      for (const r of reasons) {
        if (r.group === "words" || r.group === "unplaced") {
          let any = false;
          toks.forEach((t, j) => {
            if (PUNCT.has(t) || t.startsWith("n_") || t.startsWith("t_") || /^\d+$/.test(t)) return;
            const surfNotU = (tr.surf[j] || []).some((i) => notU.has(tr.surface[i][0])) || notU.has(t);
            if (kindIn(w, t) === "unknown" && (surfNotU || unpl.has(t))) { unknownWord(j); any = true; }
          });
          if (r.group === "unplaced") toks.forEach((t, j) => {
            if (!unpl.has(t) || (kindIn(w, t) === "unknown" && !t.startsWith("n_") && !t.startsWith("t_") && !/^\d+$/.test(t))) return;
            const k = t.startsWith("n_") ? "NAME" : t.startsWith("t_") ? "TEXT" : /^\d+$/.test(t) ? "NUM" : kindIn(w, t);
            push({ stage: "reader: word placed in no role", cause: "unplaced", key: `unplaced|${k}|${u.event}`, word: t.startsWith("n_") ? "NAME" : t, kind: k, window: windowAt(tr, w, surfIndexOf(tr, j)) }); any = true;
          });
          if (r.group === "words" && !any) {
            const left = [...notU].filter((x) => /\w/.test(x)).map((x) => (x.startsWith("n_") ? "NAME" : x));
            push({ stage: "reader: words left unread", cause: "words-left", key: `words-left|${u.event}`, word: left.join(" "), words: left, window: tr.surface.map(([s]) => (s.startsWith("n_") ? "NAME" : s)).slice(0, 6).join(" ") });
          }
        } else if (r.group === "reading") {
          const mg = Object.entries((u.vss && u.vss.margins) || {}).filter(([k]) => k !== "structure").filter(([, v]) => Number.isFinite(+v)).sort((a, b) => a[1] - b[1]);
          if (u.vss && u.vss.status === "abstain" && mg.length) push({ stage: "reader: close reading", cause: "close", key: `close|${u.event}|${mg[0][0].split(".")[0]}`, word: mg[0][0], role: mg[0][0].split(".")[0], window: tr.surface.map(([s]) => (s.startsWith("n_") ? "NAME" : s)).slice(0, 6).join(" ") });
          else push({ stage: "reader: residual", cause: "residual", key: `residual|${u.event}`, word: [...unpl].concat([...notU]).filter((x) => /\w/.test(x)).map((x) => (x.startsWith("n_") ? "NAME" : x)).join(" "),
            words: [...notU].filter((x) => /\w/.test(x)).map((x) => (x.startsWith("n_") ? "NAME" : x)), window: tr.surface.map(([s]) => (s.startsWith("n_") ? "NAME" : s)).slice(0, 6).join(" ") });
        } else if (r.group === "world") {
          const cand = u.candidates || [];
          if (cand.length && cand[0].world !== u.world) push({ stage: "world choice: against the cutter", cause: "world-vs-cutter", key: `world-vs-cutter|${u.world}|${cand[0].world}`, word: firstWord(tr), other: cand[0].world, window: tr.surface.map(([s]) => (s.startsWith("n_") ? "NAME" : s)).slice(0, 5).join(" ") });
          else { const o = cand.find((c) => c.world !== u.world); push({ stage: "world choice: close", cause: "world-close", key: `world-close|${u.world}|${o ? o.world : "-"}`, word: firstWord(tr), other: o ? o.world : "-", window: tr.surface.map(([s]) => (s.startsWith("n_") ? "NAME" : s)).slice(0, 5).join(" ") }); }
        } else if (r.group === "prior") {
          push({ stage: "world prior: often wrong", cause: "prior", key: `prior|${u.world}|${u.event}`, word: "-", prior: spec.world_prior[u.world] ?? spec.world_prior_default });
        } else if (r.group === "context") {
          const fills = (u.gaps || []).filter((g) => g.decision === "fill"), weak = fills.filter((g) => Number.isFinite(g.margin)).sort((a, b) => a.margin - b.margin)[0] || fills[0];
          if (weak) push({ stage: "context filler: weak fill", cause: "context", key: `context|${u.event}|${weak.key}|${weak.word || weak.kind}`, word: weak.word ? weak.word.replace(/^@/, "") : `(${weak.kind})`, role: weak.key });
        } else if (r.group === "cut") {
          const s = u.signals, ps = VC.pulls(model, s, u.world), pull = (n) => (ps.find((x) => x.name === n) || { pull: 0 }).pull;
          const where = pull("cut_start") >= pull("cut_end") ? "start" : "end";
          if (where === "start") push({ stage: "cut: where it starts", cause: "cut-start", key: `cut-start|${u.event}|${firstWord(tr).toLowerCase()}`, word: firstWord(tr), prev: prevWord(text, u.c0, namesAt) });
          else { const [after] = FRONT.tokenize(text.slice(u.c1), namesAt); const nx = after.length ? after[0][0] : "<end>"; push({ stage: "cut: where it ends", cause: "cut-end", key: `cut-end|${u.event}|${nx.startsWith("n_") ? "NAME" : nx}`, word: nx.startsWith("n_") ? "NAME" : nx, prev: tr.surface.length ? tr.surface[tr.surface.length - 1][0] : "-" }); }
        }
      }
    }
    // text outside every unit: a request the cutter left out? (split at sentence ends; read by every world, the composer's rule)
    const spans = out.units.map((u) => [u.c0, u.c1]).sort((a, b) => a[0] - b[0]), zones = []; let at = 0;
    for (const [a, b] of spans) { if (a > at) zones.push([at, a]); at = Math.max(at, b); }
    if (at < text.length) zones.push([at, text.length]);
    for (const [a, b] of zones) {
      const re = /[^.!?;]+/g, z = text.slice(a, b);
      for (const m of z.matchAll(re)) {
        let s0 = a + m.index, s1 = s0 + m[0].length;
        while (s0 < s1 && /\s|,|:/.test(text[s0])) s0++; while (s1 > s0 && /\s|,|:/.test(text[s1 - 1])) s1--;
        const piece = text.slice(s0, s1);
        if (piece.split(/\s+/).filter((x) => /\w/.test(x)).length < 2) continue;
        const reads = comp.worlds.map((w) => comp.readWnu(w, piece, namesAt)).filter((x) => x.event && x.wnu.n < x.wnu.words);
        if (!reads.length) continue;
        const best = reads.reduce((p, x) => (x.wnu.n < p.wnu.n ? x : p), reads[0]);
        const w = best.w, trc = FRONT.normalizeTrace(piece, namesAt, w.F), j = trc.tokens.findIndex((t) => w.verbEvent.has(t));
        const verb = j >= 0 ? (lowerSurface(trc, j) || trc.tokens[j]).toLowerCase() : (best.r.frame.lemma || "?");
        stats.leftoverReads++;
        inst.push({ msg: id, c0: s0, c1: s1, src: piece, stage: "cut: request outside every unit", cause: "cut-missed", key: `cut-missed|${verb}|${best.event}`, word: verb, event: best.event, world: w.id,
          window: j >= 0 && surfIndexOf(trc, j) >= 0 ? windowAt(trc, w, surfIndexOf(trc, j)) : piece.slice(0, 40), prev: prevWord(text, s0, namesAt), notu: best.wnu.n / best.wnu.words });
      }
    }
    return { instances: inst, stats };
  }
  return { analyze, comp, meta, model, thr, level, spec };
}

// ------------------------------------------------------------------ aggregation and the statement of a need
const top = (m, n = 3) => [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))).slice(0, n);
const q = (w) => `‘${w}’`;
const list = (xs) => xs.map(([w, c]) => `${q(w)} ${c}`).join(", ");
const ev = (e) => (e && e !== "?" ? e : "(no action hinted)");

function statement(n) {
  const [cause, a, b, c] = n.key.split("|"), win = n.windows.length ? n.windows[0][0] : "";
  switch (cause) {
    case "unknown-word": return { need: `Write ${a === undefined ? "" : ""}${ev(b)} requests (${n.worldTop} world) that use the word ${q(a)}; that world never saw it in training.`, construction: win };
    case "unread-unknown": return { need: `Write ${ev(b)} requests (the event cutter's guess) in which ${q(a)} is used; no candidate world knows the word, so nothing is read.`, construction: win };
    case "unread-known": return { need: `Write ${ev(a)} requests (the event cutter's guess) in constructions starting like the ones below; the candidate worlds know the words but read no action.`, construction: `first words: ${list(n.wordsTop)}` };
    case "unplaced": if (a === "NAME" || a === "NUM" || a === "TEXT") return { need: `Write ${ev(b)} requests with more than the usual number of ${a === "NAME" ? "shape names" : a === "NUM" ? "numbers" : "quoted texts"}, each in its role; the ${n.worldTop} world reads one of them into no role of ${ev(b)}.`, construction: win };
      return { need: `Write ${ev(b)} requests in which a word of kind ${a} (${list(n.wordsTop)}) fills a role; the ${n.worldTop} world knows these words but places them in no role of ${ev(b)}.`, construction: win };
    case "words-left": return { need: `Write ${ev(a)} requests in which these words belong to the request (${list(n.wordsTop)}); the ${n.worldTop} world reads them as nothing.`, construction: win };
    case "residual": return { need: `Write ${ev(a)} requests that say more than action + roles (words left unexplained: ${list(n.wordsTop)}); the ${n.worldTop} world's reading leaves part of them unexplained.`, construction: win };
    case "close": return b === "event"
      ? { need: `Write ${ev(a)} requests in the constructions below, and requests of the action read as runner-up in similar words; the ${n.worldTop} world's choice of the action is close between two actions.`, construction: win }
      : { need: `Write ${ev(a)} requests that state the role ${q(b)} in varied ways; the reading of ${q(b)} is close between two values.`, construction: win };
    case "world-vs-cutter": return { need: `Annotate request spans of the ${a} world that open like the ones below (${list(n.wordsTop)}); the cutter ranks ${b} first for them and ${a} reads them.`, construction: win };
    case "world-close": return { need: `Annotate request spans of the ${a} world that open like the ones below (${list(n.wordsTop)}); the cutter scores ${a} and ${b} close.`, construction: win };
    case "prior": return { need: `Write more ${ev(b)} requests for the ${a} world (and re-train it): it is right ${Math.round((n.prior || 0) * 100)}% of the time on held-out messages, so all its readings are doubted.`, construction: "" };
    case "context": case "ask": {
      const how = c === "empty" ? `leaves the role ${q(b)} unsaid (the shape is clear only from the message)` : c === "desc" || c === "vague" ? `names the shape of the role ${q(b)} by a description (${c})` : `refers to an earlier shape with ${q(c.replace(/^@/, ""))} in the role ${q(b)}`;
      return { need: `Write messages in which a ${ev(a)} request ${how}, with the shape it means stated earlier in the message; the context filler ${cause === "ask" ? "cannot fill it and asks" : "fills it with a weak margin"}.`, construction: "" };
    }
    case "cut-start": return { need: `Annotate the spans of ${ev(a)} requests that begin with ${q(b)} (after ${list(n.prevTop)}); the cutter is unsure where they start.`, construction: "" };
    case "cut-end": return { need: `Annotate the spans of ${ev(a)} requests followed by ${q(b)}; the cutter is unsure where they end.`, construction: "" };
    case "cut-missed": return { need: `Annotate whole messages with sentences phrased with ${q(a)} (after ${list(n.prevTop)}) marking which are ${ev(b)} requests: the cutter left them outside every request while the ${n.worldTop} world reads them as ${ev(b)}; one of the two is wrong, the spans settle which.`, construction: win };
    case "no-request": return { need: `${ev(b)} readings of the ${a} world gave no command (the adapter); not a data need: a code path to check.`, construction: "" };
  }
  return { need: n.key, construction: win };
}

/** instances -> needs (one per key), sorted by requests, then messages, then key */
export function aggregate(instances, { examples = 5 } = {}) {
  const G = new Map();
  for (const x of instances) {
    let g = G.get(x.key);
    if (!g) G.set(x.key, g = { key: x.key, cause: x.cause, stage: x.stage, units: new Map(), msgs: new Set(), words: new Map(), windows: new Map(), prev: new Map(), worlds: new Map(), empty: new Map(), prior: x.prior, examples: [] });
    const uk = `${x.msg}@${x.c0}`;
    if (g.units.has(uk)) continue;
    g.units.set(uk, [x.msg, x.c0, x.c1]); g.msgs.add(x.msg);
    const inc = (m, k) => k !== undefined && k !== null && k !== "" && m.set(k, (m.get(k) || 0) + 1);
    for (const w of x.words || [x.word]) inc(g.words, w);
    inc(g.windows, x.window); inc(g.prev, x.prev); inc(g.worlds, x.world); for (const e of x.empty || []) inc(g.empty, e);
    if (g.examples.length < examples && !g.examples.some((e) => e.msg === x.msg)) g.examples.push({ msg: x.msg, text: x.src.length > 140 ? x.src.slice(0, 137) + "..." : x.src });
  }
  const needs = [...G.values()].map((g) => {
    const n = { key: g.key, cause: g.cause, stage: g.stage, requests: g.units.size, messages: g.msgs.size, prior: g.prior,
      wordsTop: top(g.words, 5), windows: top(g.windows, 3), prevTop: top(g.prev, 3), worldTop: (top(g.worlds, 1)[0] || ["?"])[0], emptyRoles: top(g.empty, 3) };
    Object.assign(n, statement(n), { examples: g.examples, instances: [...g.units.values()] });
    return n;
  });
  needs.sort((a, b) => b.requests - a.requests || b.messages - a.messages || a.key.localeCompare(b.key));
  needs.forEach((n, i) => { n.rank = i + 1; });
  return needs;
}

export function markdown(res, N = 50) {
  const L = [];
  L.push(`# Data needs (${res.meta.when}; ${res.meta.messages} messages of ${res.meta.inputs.join(", ")}${res.meta.split ? ", split " + res.meta.split : ""}; registry ${res.meta.registry}; level ${res.meta.level}, threshold ${res.meta.threshold.toFixed(4)})\n`);
  const s = res.stats;
  L.push(`Units ${s.units}: requests produced ${s.produced} (sure ${s.sure}, not sure ${s.unsure}), asked by the context filler ${s.ask}, unread (ignored) ${s.ignored}, read but no request ${s.noRequest}; text outside every unit that a world reads as a request: ${s.leftoverReads} pieces.\n`);
  // by cause (the same instances, a unit counted once per cause): the specific needs are many small groups, this shows their sum
  const byCause = new Map();
  for (const n of res.needs) { const c = byCause.get(n.cause) || { stage: n.stage, units: new Set(), needs: 0, keys: [] }; c.needs++; for (const [m, c0] of n.instances) c.units.add(`${m}@${c0}`); if (c.keys.length < 3) c.keys.push(`${n.key.split("|").slice(1).join(" ")} (${n.requests})`); byCause.set(n.cause, c); }
  L.push("By cause (all needs; a unit counts once per cause):\n\n| cause · stage | requests (needs) | largest needs |\n|---|---|---|");
  for (const [c, x] of [...byCause.entries()].sort((a, b) => b[1].units.size - a[1].units.size)) L.push(`| ${c} · ${x.stage} | ${x.units.size} (${x.needs}) | ${x.keys.join("; ")} |`);
  L.push("");
  L.push("| # | need (data to write) · stage · construction | requests |\n|---|---|---|");
  for (const n of res.needs.slice(0, N)) L.push(`| ${n.rank} | ${n.need} *(${n.stage}${n.construction ? "; " + n.construction.replace(/\|/g, "/") : ""})* | ${n.requests} |`);
  L.push("\n## Examples (snippets of the messages; for the reviewer, not for the writer)\n");
  for (const n of res.needs.slice(0, N)) L.push(`- **${n.rank}** \`${n.key}\`: ` + n.examples.map((e) => `“${e.text.replace(/\n/g, " ")}”`).join(" · "));
  return L.join("\n") + "\n";
}

// ------------------------------------------------------------------ CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2), opt = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
  const flags = new Set(["--names"]), valued = new Set(["--split", "--ids", "--level", "--out", "--md", "--top"]);
  const paths = argv.filter((a, i) => !a.startsWith("--") && !valued.has(argv[i - 1]));
  for (const a of argv) if (a.startsWith("--") && !flags.has(a) && !valued.has(a)) throw new Error(`unknown option ${a}`);
  if (!paths.length) { console.error("usage: node data_needs.mjs [--split cal|test] [--ids f] [--names] [--level 97] [--out f.json] [--md f.md] [--top 50] <dir|file> ..."); process.exit(2); }
  const ids = opt("--ids") ? new Set(readFileSync(opt("--ids"), "utf8").split(/\s+/).filter(Boolean)) : null;
  const msgs = readMessages(paths, { split: opt("--split"), ids, names: argv.includes("--names") });
  const A = await makeAnalyzer({ level: opt("--level", "97") });
  const all = [], stats = {};
  let k = 0;
  for (const m of msgs) {
    const r = A.analyze(m);
    all.push(...r.instances); for (const [a, v] of Object.entries(r.stats)) stats[a] = (stats[a] || 0) + v;
    if (++k % 100 === 0) console.error(`${k}/${msgs.length} messages`);
  }
  const needs = aggregate(all);
  const res = { meta: { when: new Date().toISOString().slice(0, 10), inputs: paths, split: opt("--split"), ids: opt("--ids"), names: argv.includes("--names"), messages: msgs.length,
    registry: A.meta.registry, level: A.level, threshold: A.thr }, stats, needs };
  const outFile = opt("--out", `${process.env.DN_OUT_DIR || "."}/needs.json`);
  writeFileSync(outFile, JSON.stringify(res));
  if (opt("--md")) writeFileSync(opt("--md"), markdown(res, +opt("--top", 50)));
  console.log(`${msgs.length} messages · ${JSON.stringify(stats)} · ${all.length} instances · ${needs.length} needs -> ${outFile}`);
  for (const n of needs.slice(0, 15)) console.log(`${String(n.rank).padStart(3)} ${String(n.requests).padStart(4)}  ${n.key}  ·  ${n.need}${n.construction ? "  [" + n.construction + "]" : ""}`);
}
