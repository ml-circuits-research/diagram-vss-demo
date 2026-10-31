// front.js: the LEARNED front end of the VSS reader (world `real`), the twin of training/sketch/front.py (parity: parity_front.mjs).
// tokenize (mechanical), segment (learned BIO tagger), normalize (learned value n-grams and trigger rules). front.json comes with the model.
const SLUG = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "x";
const TOK = /"([^"]*)"|“([^”]*)”|(?<![A-Za-z0-9])'([^']+)'(?![A-Za-z0-9])|([A-Za-z0-9_][A-Za-z0-9_'’-]*)|([.,!?;:])/g;
const ENDS = new Set([".", "!", "?"]), PUNCT = new Set([".", ",", "!", "?", ";", ":"]);

export function tokenize(text, names = []) {
  const known = new Map(); for (const n of names) if (!known.has(String(n).toLowerCase())) known.set(String(n).toLowerCase(), String(n));
  const info = { texts: {}, names: {} }, out = [];
  for (const m of text.matchAll(TOK)) {
    const q = m[1] ?? m[2] ?? m[3], s = m.index, e = m.index + m[0].length;
    if (q !== undefined) { const t = "t_" + SLUG(q); if (!(t in info.texts)) info.texts[t] = q; out.push([t, s, e]); continue; }
    if (m[5]) { out.push([m[5], s, e]); continue; }
    let raw = m[4].replace(/’/g, "'");
    const mm = /^(\d+)([A-Za-z]+)$/.exec(raw);
    if (mm) { out.push([mm[1], s, s + mm[1].length], [mm[2].toLowerCase(), s + mm[1].length, e]); continue; }
    if (/^\d+$/.test(raw)) { out.push([raw, s, e]); continue; }
    const start = !out.length || ENDS.has(out[out.length - 1][0]);
    const base = raw.toLowerCase().endsWith("'s") ? raw.slice(0, -2) : null;
    const up = (w) => w.length > 0 && w[0] >= "A" && w[0] <= "Z";
    if (base && (known.has(base.toLowerCase()) || (up(base) && !start))) raw = base;
    const low = raw.toLowerCase();
    if (known.has(low) || (up(raw) && !start && raw !== "I" && raw !== "A")) { const t = "n_" + SLUG(low); if (!(t in info.names)) info.names[t] = known.get(low) || raw; out.push([t, s, e]); }
    else out.push([low, s, e]);
  }
  return [out, info];
}
const ctx = (t) => (t == null ? "B" : t.startsWith("n_") ? "NAME" : t.startsWith("t_") ? "TEXT" : /^\d+$/.test(t) ? "NUM" : t);
const isWord = (t) => !(t.startsWith("n_") || t.startsWith("t_") || /^\d+$/.test(t) || PUNCT.has(t));

export function applyValues(toks, V) {
  const out = []; let i = 0;
  while (i < toks.length) {
    let hit = false;
    for (const n of [3, 2, 1]) {
      const g = toks.slice(i, i + n);
      if (g.length === n && g.every(isWord) && Object.hasOwn(V, g.join(" "))) { out.push(V[g.join(" ")]); i += n; hit = true; break; }
    }
    if (!hit) out.push(toks[i++]);
  }
  return out;
}
export function applyTriggers(toks, T) {
  for (const e of T) {
    const ph = e.p.split(" ");
    for (let i = 0; i + ph.length <= toks.length; i++) {
      if (!ph.every((x, k) => toks[i + k] === x)) continue;
      const p = ctx(i > 0 ? toks[i - 1] : null), n = ctx(i + ph.length < toks.length ? toks[i + ph.length] : null);
      if ((e.prev === "*" || e.prev === p) && (e.next === "*" || e.next === n)) return toks.slice(0, i).concat([e.tok], e.keep || [], toks.slice(i + ph.length));
    }
  }
  return toks;
}
export function normalize(text, names, F) {
  const [toks, info] = tokenize(text, names);
  const t = applyTriggers(applyValues(toks.map((x) => x[0]), F.values), F.triggers);
  info.numbers = Object.fromEntries(t.filter((x) => /^\d+$/.test(x)).map((x) => [x, +x]));
  return { tokens: t, info };
}
/** a WHOLE message for the centre reader (the twin of front.py normalize_message): names found anywhere are names everywhere; every
 *  trigger rule that fires is applied, left to right, contexts read on the value-normalized tokens. -> {tokens, src, info} */
export function normalizeMessage(text, names, F) {
  const [toks0, info0] = tokenize(text, names);
  const [toks, info] = tokenize(text, names.concat(Object.values(info0.names)));
  const V = F.values, vals = [], src = []; let i = 0;
  while (i < toks.length) {
    let hit = false;
    for (const n of [3, 2, 1]) {
      const g = toks.slice(i, i + n).map((x) => x[0]);
      if (g.length === n && g.every(isWord) && Object.hasOwn(V, g.join(" "))) { vals.push(V[g.join(" ")]); src.push([toks[i][1], toks[i + n - 1][2]]); i += n; hit = true; break; }
    }
    if (!hit) { vals.push(toks[i][0]); src.push([toks[i][1], toks[i][2]]); i++; }
  }
  const byFirst = new Map();
  for (const e of F.triggers) { const f = e.p.split(" ")[0]; if (!byFirst.has(f)) byFirst.set(f, []); byFirst.get(f).push(e); }
  const out = [], osrc = []; i = 0;
  while (i < vals.length) {
    let hit = null;
    for (const e of byFirst.get(vals[i]) || []) {
      const ph = e.p.split(" "), L = ph.length;
      if (i + L > vals.length || !ph.every((x, k) => vals[i + k] === x)) continue;
      const p = ctx(i > 0 ? vals[i - 1] : null), n = ctx(i + L < vals.length ? vals[i + L] : null);
      if ((e.prev === "*" || e.prev === p) && (e.next === "*" || e.next === n)) { hit = e; break; }
    }
    if (!hit) { out.push(vals[i]); osrc.push(src[i]); i++; continue; }
    const L = hit.p.split(" ").length, s = [src[i][0], src[i + L - 1][1]];
    for (const t of [hit.tok].concat(hit.keep || [])) { out.push(t); osrc.push([s[0], s[1]]); }
    i += L;
  }
  info.numbers = Object.fromEntries(out.filter((x) => /^\d+$/.test(x)).map((x) => [x, +x]));
  return { tokens: out, src: osrc, info };
}
// ---- the segmenter (greedy averaged perceptron, integer weights)
const LABELS = ["B", "I", "O"];
function segFeats(toks, i, pl) {
  const w = (k) => (k >= 0 && k < toks.length ? ctx(toks[k]) : k < 0 ? "<s>" : "</s>");
  const start = i === 0 || ENDS.has(toks[i - 1]) ? 1 : 0;
  return [`w0=${w(i)}`, `w-1=${w(i - 1)}`, `w+1=${w(i + 1)}`, `w-2=${w(i - 2)}`, `w+2=${w(i + 2)}`, `pl=${pl}`, `pl,w0=${pl},${w(i)}`,
    `w-1,w0=${w(i - 1)},${w(i)}`, `w0,w+1=${w(i)},${w(i + 1)}`, `start=${start}`, `start,w0=${start},${w(i)}`, "bias"];
}
export function segDecode(toks, W) {
  const labels = []; let prev = "<s>";
  for (let i = 0; i < toks.length; i++) {
    const fs = segFeats(toks, i, prev); let best = null, bl = null;
    for (const L of LABELS) { let s = 0; for (const f of fs) s += W[f + "\t" + L] || 0; if (best === null || s > best) { best = s; bl = L; } }
    labels.push(bl); prev = bl;
  }
  return labels;
}
export function segment(text, names, F) {
  const [toks] = tokenize(text, names), labels = segDecode(toks.map((x) => x[0]), F.segmenter), spans = []; let cur = null;
  toks.forEach(([, s, e], k) => {
    const L = labels[k];
    if (L === "B" || (L === "I" && cur === null)) { cur = [s, e]; spans.push(cur); }
    else if (L === "I") cur[1] = e;
    else cur = null;
  });
  return spans.map(([s, e]) => text.slice(s, e));
}
