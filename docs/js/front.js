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
