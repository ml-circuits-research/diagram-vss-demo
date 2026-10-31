// cutstats.mjs: where the VSS own cut loses (read-only analysis; nothing in the repository is changed).
// For one model: (1) every annotated span read alone (= llm_score SEG=gold), (2) the message cut by an instrumented copy of
// docs/js/vss-centers.js (or, for a centre model, vss.readMessage = llm_score SEG=centres-model), with every centre, every chosen
// stretch and every reading kept; both scored with llm_score.mjs's alignment (LCS on type+action, then all gold keys).
// Decoding variants of the cut (CUT=...) are options of the copy; CUT=base must reproduce llm_score.mjs's default numbers exactly.
//   MODEL=fix_p80_s0 [CUT=base|join2|...] node cutstats.mjs <dev.jsonl> <out.json>
import { readFileSync, writeFileSync } from "node:fs";
import { load } from "/home/claude/diagram-vss-demo/docs/js/vss.js";
import * as FRONT from "/home/claude/diagram-vss-demo/docs/js/front.js";
import { readingFromWires, toNodes } from "/home/claude/diagram-vss-demo/docs/js/vss-adapter.js";
import { canon, canonWant } from "/home/claude/diagram-vss-demo/docs/js/bench-canon.js";

const [devPath, outPath] = process.argv.slice(2);
const MODEL = process.env.MODEL, CUT = process.env.CUT || "base";
const dir = `/home/claude/diagram-vss-demo/docs/model/${MODEL}/`;
const readFile = async (n) => { const b = readFileSync(dir + n); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true });
const F = JSON.parse(await readFile("front.json"));
const CM = !!(vss.model.legend.reader && vss.model.legend.reader.centres);
const verbEvent = new Map(); for (const e of vss.model.legend.events) for (const v of e.verbs) verbEvent.set(v, e.id);
const VERBS = new Set(verbEvent.keys());
const ENDS = new Set([".", "!", "?"]), PUNCT = new Set([".", ",", "!", "?", ";", ":"]);
const vk = new Set(Object.entries(vss.model.lexicon || {}).filter(([w, e]) => /^[A-Z]+$/.test(e.kind) && e.kind !== "VERB").map(([w]) => w));
const isContent = (t) => t.startsWith("n_") || t.startsWith("t_") || /^\d+$/.test(t) || VERBS.has(t) || vk.has(t);

// ---------------- variants of the cut (decoding only)
// base   : vss-centers.js as it is (stretch holds exactly one centre and exactly one event token; score placed - unplaced content)
// opts.G : a stretch may hold up to G consecutive centres (a joined request), read alone like an annotated span
// opts.score: "base" | "noev" (event tokens neither for nor against: only names / texts / numbers / values count) | "noevj" (as base,
//          but in a stretch of several centres the event tokens the reading leaves unplaced do not count against it)
// opts.tie: "fewer" -> on equal totals the segmentation with fewer stretches wins
// opts.minrole: a stretch whose reading places no content token besides an event token is not a request
// CUT is "base" or a comma list of key=value: scan=base|resume|ltr, nv=one|any, G=1|2|3, score=base|noev|noevj, tie=fewer, minrole=1
const V = { G: 1, score: "base", scan: "base", nv: "one" };
if (CUT !== "base") for (const kv of CUT.split(",")) { const [k, v] = kv.split("="); V[k] = k === "G" ? +v : k === "minrole" ? (v === "1" ? true : v) : v; }

/** applyTriggers (front.js) that also says which rule fired and where: -> {t, i, e} or null (same rule order, same contexts) */
const ctxOf = (t) => (t == null ? "B" : t.startsWith("n_") ? "NAME" : t.startsWith("t_") ? "TEXT" : /^\d+$/.test(t) ? "NUM" : t);
const pform = (toks) => toks.map((x) => (x.startsWith("n_") ? "NAME" : x));
function fire1(toks) {
  const tp = pform(toks);
  for (const e of F.triggers) {
    const ph = e.p.split(" ");
    for (let i = 0; i + ph.length <= toks.length; i++) {
      if (!ph.every((x, k) => tp[i + k] === x)) continue;
      const p = ctxOf(i > 0 ? toks[i - 1] : null), n = ctxOf(i + ph.length < toks.length ? toks[i + ph.length] : null), p2 = ctxOf(i > 1 ? toks[i - 2] : null);
      if ((e.prev === "*" || e.prev === p) && (e.next === "*" || e.next === n) && (e.prev2 === undefined || e.prev2 === "*" || e.prev2 === p2)) return { i, e, L: ph.length };
    }
  }
  return null;
}
const byFirst = new Map(); for (const e of F.triggers) { const f = e.p.split(" ")[0]; if (!byFirst.has(f)) byFirst.set(f, []); byFirst.get(f).push(e); }
/** centres of a sentence's words. scan "base": vss-centers.js as it is (the first rule in rule order that fires anywhere in the rest,
 *  or else the first literal event word; the scan resumes one position after it). "resume": the same, but it resumes after the fired
 *  rule's whole phrase. "ltr": left to right as front.js normalizeMessage (at each position the first rule in rule order that starts
 *  there; a literal event word is a centre; resume after the phrase). Each centre: word index, event token, how, phrase, skipped. */
function centres(words) {
  const vals = [], src = []; let i = 0;
  const VV = F.values, isWord = (t) => !(t.startsWith("n_") || t.startsWith("t_") || /^\d+$/.test(t) || PUNCT.has(t));
  while (i < words.length) {
    let hit = false;
    for (const n of [3, 2, 1]) { const g = words.slice(i, i + n); if (g.length === n && g.every(isWord) && Object.hasOwn(VV, g.join(" "))) { vals.push(VV[g.join(" ")]); src.push(i); i += n; hit = true; break; } }
    if (!hit) { vals.push(words[i]); src.push(i); i++; }
  }
  const out = [], SCAN = V.scan || "base";
  if (SCAN === "ltr") {
    const pv = pform(vals);
    for (let i = 0; i < vals.length;) {
      let hit = null;
      for (const e of byFirst.get(pv[i]) || []) {
        const ph = e.p.split(" "), L = ph.length;
        if (i + L > vals.length || !ph.every((x, k) => pv[i + k] === x)) continue;
        const p = ctxOf(i > 0 ? vals[i - 1] : null), n = ctxOf(i + L < vals.length ? vals[i + L] : null), p2 = ctxOf(i > 1 ? vals[i - 2] : null);
        if ((e.prev === "*" || e.prev === p) && (e.next === "*" || e.next === n) && (e.prev2 === undefined || e.prev2 === "*" || e.prev2 === p2)) { hit = e; break; }
      }
      if (hit) { const L = hit.p.split(" ").length; if (VERBS.has(hit.tok)) out.push({ w: src[i], vi: i, L, tok: hit.tok, how: hit.ins ? "ins" : "rule", phrase: hit.p, word: words[src[i]], skipped: [] }); i += L; continue; }
      if (VERBS.has(vals[i])) out.push({ w: src[i], vi: i, L: 1, tok: vals[i], how: "literal", phrase: vals[i], word: words[src[i]], skipped: [] });
      i++;
    }
    return out;
  }
  let from = 0;
  for (;;) {
    const rest = vals.slice(from), f = fire1(rest);
    const t = FRONT.applyTriggers(rest, F.triggers);
    const k = t.findIndex((x, j) => VERBS.has(x) && x !== rest[j]);
    const kk = k >= 0 ? k : t.findIndex((x) => VERBS.has(x));
    if (kk < 0) break;
    const fired = k >= 0 && f && f.i === k;
    const skipped = k >= 0 ? rest.slice(0, kk).map((x, j) => [x, j]).filter(([x]) => VERBS.has(x)).map(([x, j]) => ({ w: src[from + j], tok: x })) : [];
    const L = fired ? f.L : 1;
    out.push({ w: src[from + kk], vi: from + kk, L, tok: t[kk], how: fired ? (f.e.ins ? "ins" : "rule") : k >= 0 ? "rule?" : "literal", phrase: fired ? f.e.p : rest[kk], word: words[src[from + kk]], skipped });
    from += SCAN === "resume" ? kk + L : kk + 1;
    if (from >= vals.length) break;
  }
  // a centre whose word lies inside the phrase of the previous fired rule (the scan resumed inside it)
  for (let q = 1; q < out.length; q++) out[q].insidePrev = out[q].vi < out[q - 1].vi + out[q - 1].L;
  return out;
}

function cutMessage(text, names) {
  const [toks] = FRONT.tokenize(text, names), sents = []; let cur = [];
  toks.forEach((t, k) => { cur.push(k); if (ENDS.has(t[0])) { sents.push(cur); cur = []; } });
  if (cur.length) sents.push(cur);
  const cache = new Map(), allC = [], chosen = [];
  const read = (s, a, b, g) => {
    while (a <= b && PUNCT.has(toks[s[a]][0])) a++;
    while (b >= a && PUNCT.has(toks[s[b]][0])) b--;
    if (a > b) return null;
    const c0 = toks[s[a]][1], c1 = toks[s[b]][2], srcText = text.slice(c0, c1), key = srcText + "\u0000" + g;
    if (cache.has(key)) return cache.get(key);
    const { tokens } = FRONT.normalize(srcText, names, F); let v = null;
    const nv = tokens.filter((t) => VERBS.has(t)).length;
    if (g === 1 && (V.nv || "one") === "one" ? nv === 1 : nv >= 1) {
      const r = vss.read(tokens.join(" "));
      if (r.status !== "unknown-event" && r.status !== "no-sense") {
        const cont = tokens.filter(isContent), un = r.unplaced.filter(isContent);
        const ev = cont.filter((t) => VERBS.has(t)).length, unEv = un.filter((t) => VERBS.has(t)).length;
        const all = cont.length, nonEvPlaced = (all - ev) - (un.length - unEv);
        const roles = Object.values((r.frame && r.frame.roles) || {}).filter((x) => x !== null && x !== undefined).length;
        const evRoles = ((vss.model.legend.events.find((e) => e.id === (r.frame && r.frame.event)) || {}).roles || []).length;
        let score;
        if (V.score === "roles") score = roles - (un.length - unEv);          // roles the reading fills - content words it cannot place (event tokens neither for nor against)
        else if (V.score === "base") score = (all - un.length) - un.length;
        else if (V.score === "noevj") score = g > 1 ? (all - un.length) - (un.length - unEv) : (all - un.length) - un.length;
        else score = ((all - ev) - (un.length - unEv)) - (un.length - unEv);
        // minrole: a reading that places no content word besides event tokens is not a request; minrole=legend: a reading that fills none
        // of its event's roles is not a request, unless the legend gives the event no roles (undo, redo, forget, cycle)
        const noReq = V.minrole === "legend" ? roles === 0 && evRoles > 0 : V.minrole ? nonEvPlaced <= 0 : false;
        const marg = Object.values(r.margins || {}).filter((x) => typeof x === "number"); if (!noReq) v = { margin: marg.length ? Math.min(...marg) : 0, src: srcText, c0, c1, score, status: r.status, nv, g, event: r.frame && r.frame.event };
      }
    }
    cache.set(key, v); return v;
  };
  for (const s of sents) {
    const words = s.map((k) => toks[k][0]), Cx = centres(words), C = Cx.map((c) => c.w);
    Cx.forEach((c) => allC.push({ ...c, c0: toks[s[c.w]][1], c1: toks[s[c.w]][2], sent: [toks[s[0]][1], toks[s[s.length - 1]][2]], readable: false, kept: false,
      skipped: c.skipped.map((x) => ({ ...x, c0: toks[s[x.w]][1] })) }));
    const base = allC.length - Cx.length;
    if (!C.length) continue;
    // forward DP over centres; steps[j] = Map(prevEnd -> {score, spans, n}); a stretch covers centres j..j+g-1
    const steps = Array.from({ length: C.length + 1 }, () => new Map()); steps[0].set(-1, { score: 0, spans: [], n: 0, drop: 0, dist: 0, mm: Infinity });
    // tie keys after the score, in this order when named in V.tie (joined by +): fewer = fewer stretches + dropped centres (a join beats
    // a split); keep = fewer dropped centres (a readable centre is kept rather than dropped); near = smaller total distance of the
    // stretches' words to their nearest centre (a word goes to the nearer centre)
    const TIE = (V.tie || "").split("+").filter(Boolean);
    const better = (old, cand) => {
      if (!old) return true;
      if (old.score !== cand.score) return old.score < cand.score;
      for (const t of TIE) {
        if (t === "margin") { if (old.mm !== cand.mm) return cand.mm > old.mm; continue; }   // the weakest reading's margin (higher wins)
        const k = t === "fewer" ? "n" : t === "keep" ? "drop" : t === "near" ? "dist" : null;
        if (k && old[k] !== cand[k]) return cand[k] < old[k];
      }
      return false;
    };
    const distOf = (a, b, cs) => { let d = 0; for (let w = a; w <= b; w++) if (!PUNCT.has(toks[s[w]][0])) d += Math.min(...cs.map((c) => Math.abs(w - c))); return d; };
    const put = (m, key, cand) => { if (better(m.get(key), cand)) m.set(key, cand); };
    for (let j = 0; j < C.length; j++) {
      for (const [prevEnd, st] of steps[j]) {
        put(steps[j + 1], prevEnd, { ...st, n: st.n + 1, drop: st.drop + 1 });         // the centre dropped (tie key n: stretches + dropped centres)
        for (let g = 1; g <= V.G && j + g <= C.length; g++) {
          if (g > 1 && V.joindiff && new Set(Cx.slice(j, j + g).map((c) => c.tok)).size < g) continue;   // joindiff: no two centres of one event token in a joined stretch
          const lo = j > 0 ? C[j - 1] + 1 : 0, hi = j + g < C.length ? C[j + g] - 1 : s.length - 1;
          for (let a = Math.max(lo, prevEnd + 1); a <= C[j]; a++) for (let b = C[j + g - 1]; b <= hi; b++) {
            const r = read(s, a, b, g); if (!r) continue;
            for (let q = 0; q < g; q++) allC[base + j + q].readable = true;
            put(steps[j + g], b, { score: st.score + r.score, spans: st.spans.concat([{ ...r, cj: Array.from({ length: g }, (_, q) => base + j + q) }]), n: st.n + 1, drop: st.drop, mm: Math.min(st.mm, r.margin), dist: st.dist + (TIE.includes("near") ? distOf(a, b, C.slice(j, j + g)) : 0) });
          }
        }
      }
    }
    let best = null; for (const st of steps[C.length].values()) if (better(best, st)) best = st;
    for (const sp of best.spans) { sp.cj.forEach((q) => (allC[q].kept = true)); chosen.push(sp); }
  }
  return { centres: allC, stretches: chosen };
}

// ---------------- readings -> nodes (as llm_score.mjs vssFormalize / vssCentresModel)
function nodesOfStretches(stretches, names) {
  const seq = { s: 0, m: 0 }, c = { names, last: [], refs: new Map() }, nodes = [];
  stretches.forEach((sp, si) => {
    const nm = c.names.concat([...c.refs.keys()]);
    const { tokens, info: ni } = FRONT.normalize(sp.src, nm, F), r = vss.read(tokens.join(" "));
    const verb = tokens.find((t) => verbEvent.has(t)) || null;
    const reading = r.status === "unknown-event" || r.status === "no-sense" ? null : readingFromWires(r.wires, verb, tokens);
    const out = reading ? toNodes(reading, ni, c, seq) : { nodes: [] };
    sp.tokens = tokens; sp.rstatus = r.status; sp.revent = r.frame && r.frame.event;
    out.nodes.forEach((n) => { if (n.type !== "mention") Object.defineProperty(n, "si", { value: si, enumerable: false }); }); nodes.push(...out.nodes);
    const main = out.nodes[out.nodes.length - 1];
    if (main && main.args) {
      if (main.args.action === "create") { if (main.args.name && !main.args.count) c.refs.set(String(main.args.name).toLowerCase(), { ref: main.id }); c.last = [{ ref: main.id }]; }
      else if (main.args.target != null && !Array.isArray(main.args.target)) c.last = [main.args.target];
    }
  });
  return nodes;
}
function centresModelMessage(text, names) {
  const { tokens, src, info } = FRONT.normalizeMessage(text, names, F), r = vss.readMessage(tokens.join(" "));
  const seq = { s: 0, m: 0 }, c = { names, last: [], refs: new Map() }, nodes = [], centresOut = [], stretches = [];
  for (const k of r.centres) {
    const lit = text.slice(src[k.pos][0], src[k.pos][1]).toLowerCase() === k.token;
    const rec = { tok: k.token, how: lit ? "literal" : "rule", c0: src[k.pos][0], c1: src[k.pos][1], accepted: k.accepted, null: k.null, status: k.status, kept: false, readable: k.accepted };
    centresOut.push(rec);
    if (!k.accepted || k.status === "unknown-event" || k.status === "no-sense") continue;
    rec.kept = true;
    const si = stretches.length, mem = k.members;
    const c0 = Math.min(...mem.map((i) => src[i][0])), c1 = Math.max(...mem.map((i) => src[i][1]));
    stretches.push({ src: text.slice(c0, c1), c0, c1, cj: [centresOut.length - 1], members: mem.map((i) => [src[i][0], src[i][1], tokens[i]]), tokens: k.tokens, rstatus: k.status, revent: k.frame && k.frame.event });
    const reading = readingFromWires(k.wires, k.token, k.tokens), out = reading ? toNodes(reading, info, c, seq) : { nodes: [] };
    out.nodes.forEach((n) => { if (n.type !== "mention") Object.defineProperty(n, "si", { value: si, enumerable: false }); }); nodes.push(...out.nodes);
    const main = out.nodes[out.nodes.length - 1];
    if (main && main.args) {
      if (main.args.action === "create") { if (main.args.name && !main.args.count) c.refs.set(String(main.args.name).toLowerCase(), { ref: main.id }); c.last = [{ ref: main.id }]; }
      else if (main.args.target != null && !Array.isArray(main.args.target)) c.last = [main.args.target];
    }
  }
  return { centres: centresOut, stretches, nodes, mtokens: tokens, msrc: src };
}

// ---------------- scoring (llm_score.mjs)
const actOf = (type, args) => `${type}:${args.action || args.ask || ""}`;
function align(pred, gold) {
  const n = pred.length, m = gold.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = pred[i].act === gold[j].act ? 1 + L[i + 1][j + 1] : Math.max(L[i + 1][j], L[i][j + 1]);
  const pairs = []; let i = 0, j = 0;
  while (i < n && j < m) { if (pred[i].act === gold[j].act) { pairs.push([i, j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  return pairs;
}
function score(nodes, row) {
  const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), si: n.si }));
  const gold = row.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args) }));
  const pairs = align(mains, gold), perGold = gold.map(() => ({ st: "missed" })), extra = [];
  for (const [i, j] of pairs) {
    const miss = Object.entries(gold[j].want).filter(([k, v]) => (mains[i].got[k] ?? "∅") !== v).map(([k, v]) => `${k}:${mains[i].got[k] ?? "∅"}≠${v}`);
    perGold[j] = { st: miss.length ? "wrong" : "right", si: mains[i].si, miss, act: mains[i].act };
  }
  const used = new Set(pairs.map((p) => p[0]));
  mains.forEach((m, i) => { if (!used.has(i)) extra.push({ si: m.si, act: m.act, got: m.got }); });
  return { perGold, extra, nPred: mains.length, mains: mains.map((m) => ({ si: m.si, act: m.act })) };
}

// ---------------- main
const rows = readFileSync(devPath, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
const OUT = [];
for (const row of rows) {
  const names = row.names || [];
  // gold spans in text order (sequential search; fallback indexOf)
  let pos = 0; const spans = row.wires.map((w) => { let s0 = w.span ? row.text.indexOf(w.span, pos) : -1; if (s0 < 0 && w.span) s0 = row.text.indexOf(w.span); if (s0 >= 0) pos = s0 + w.span.length;
    const t0 = s0 >= 0 && w.trigger ? row.text.indexOf(w.trigger, s0) : -1;
    return { span: w.span, c0: s0, c1: s0 >= 0 ? s0 + w.span.length : -1, trig: t0 >= 0 && t0 < s0 + w.span.length ? [t0, t0 + w.trigger.length] : null, act: actOf(w.type, w.args) }; });
  // (1) reading alone
  const goldSt = row.wires.every((w) => w.span) ? spans.map((s) => ({ src: s.span, c0: s.c0, c1: s.c1, cj: [] })) : [];
  const nAlone = nodesOfStretches(goldSt, names), sAlone = score(nAlone, row);
  const aloneToks = goldSt.map((s) => s.tokens);
  // (2) the cut
  let cut;
  if (CM) { const m = centresModelMessage(row.text, names); cut = { centres: m.centres, stretches: m.stretches, nodes: m.nodes }; }
  else { const m = cutMessage(row.text, names); cut = { ...m, nodes: nodesOfStretches(m.stretches, names) }; }
  const sCut = score(cut.nodes, row);
  OUT.push({ id: row.id, text: row.text, names, spans, aloneToks, alone: sAlone, aloneStatus: goldSt.map((s) => s.rstatus), aloneEvent: goldSt.map((s) => s.revent),
    centres: cut.centres, stretches: cut.stretches.map((s) => ({ src: s.src, c0: s.c0, c1: s.c1, cj: s.cj, tokens: s.tokens, rstatus: s.rstatus, revent: s.revent, score: s.score, g: s.g, members: s.members })), cut: sCut });
}
writeFileSync(outPath, JSON.stringify(OUT));
const tot = (k) => OUT.reduce((a, r) => a + r[k].perGold.filter((g) => g.st === "right").length, 0), G = OUT.reduce((a, r) => a + r.spans.length, 0);
const ex = (k) => OUT.reduce((a, r) => a + r[k].extra.length, 0);
console.log(`${MODEL} CUT=${CM ? "centres-model" : CUT}: gold ${G}; alone right ${tot("alone")} (${(100 * tot("alone") / G).toFixed(1)}%) extra ${ex("alone")}; cut right ${tot("cut")} (${(100 * tot("cut") / G).toFixed(1)}%) extra ${ex("cut")}`);
