// snorm.js: the sketch world's normalizer in the browser, the twin of training/sketch/normalize.py, driven by the same normalize.json.
// normalize(table, lexicon, text) -> { tokens, info: { texts, names, numbers } }. Deterministic; parity is tested by training/sketch/parity.mjs.
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "x"; }

export function compile(T) {
  const split = (s) => s.split(/\s+/).filter(Boolean);
  return {
    T, lead: T.lead_strip.map(split).sort((a, b) => b.length - a.length), open: T.openers.map(([a, b]) => [split(a), split(b)]),
    mwe: T.mwe.map(([a, b]) => [split(a), split(b)]).sort((a, b) => b[0].length - a[0].length), syn: T.synonyms, num: T.number_words,
    noNum: new Set(T.number_word_exceptions), punct: T.punctuation, follow: new Set(T.article_followers), before: new Set(T.name_before),
  };
}
const eq = (a, b, i) => b.every((x, k) => a[i + k] === x);

export function normalize(C, lexicon, text) {
  const info = { texts: {}, names: {}, numbers: {} };
  let s = text.replace(/"([^"]*)"|“([^”]*)”|(?<![A-Za-z0-9])'([^']+)'(?![A-Za-z0-9])/g, (m, a, b, c) => {
    const v = a ?? b ?? c, tok = "t_" + slug(v); info.texts[tok] = v; return ` ${tok} `;
  });
  const parts = s.split(" ");
  for (let i = 0; i < parts.length; i++) if (parts[i] === "A") {
    const nxt = parts.slice(i + 1).find((x) => x) || "", prev = (parts.slice(0, i).reverse().find((x) => x) || "").toLowerCase();
    if (!C.follow.has(nxt.toLowerCase().replace(/[^a-z-]/g, "")) || C.before.has(prev)) parts[i] = "N_A_NAME";
  }
  s = parts.join(" ");
  const originals = new Map(); for (const w of s.match(/[A-Za-z_][\w-]*/g) || []) if (!originals.has(w.toLowerCase())) originals.set(w.toLowerCase(), w);
  s = s.toLowerCase();
  for (const [a, b] of Object.entries(C.T.contractions)) s = s.replace(new RegExp("(?<![a-z])" + esc(a) + "(?![a-z])", "g"), b);
  s = s.replace(new RegExp("([" + esc(C.punct) + "])(?=\\s|$)", "g"), " $1 ").replace(/,(?=\d)/g, " , ");
  let toks = s.split(/\s+/).filter(Boolean);
  for (let changed = true; changed && toks.length;) {
    changed = false;
    for (const a of C.lead) if (eq(toks, a, 0) && toks.length > a.length) { toks = toks.slice(a.length); changed = true; break; }
    if (toks[0] === ",") { toks = toks.slice(1); changed = true; }
  }
  for (const [a, b] of C.open) if (eq(toks, a, 0)) { toks = b.concat(toks.slice(a.length)); break; }
  let out = [];
  for (let i = 0; i < toks.length;) {
    const hit = C.mwe.find(([a]) => eq(toks, a, i));
    if (hit) { out.push(...hit[1]); i += hit[0].length; } else out.push(toks[i++]);
  }
  toks = out.map((t) => (Object.hasOwn(C.syn, t) ? C.syn[t] : t));
  out = [];
  for (let i = 0; i < toks.length;) {
    const t = toks[i];
    if (Object.hasOwn(C.num, t) && !C.noNum.has(t)) {
      let v = C.num[t], j = i + 1;
      if (v >= 20 && v <= 90 && j < toks.length && Object.hasOwn(C.num, toks[j]) && C.num[toks[j]] >= 1 && C.num[toks[j]] <= 9) { v += C.num[toks[j]]; j++; }
      out.push(String(v)); info.numbers[String(v)] = v; i = j; continue;
    }
    if (/^\d+$/.test(t)) info.numbers[t] = +t;
    out.push(t); i++;
  }
  const res = [];
  for (const t of out) {
    if (t === "n_a_name") { info.names.n_a = "A"; res.push("n_a"); continue; }
    if (lexicon.has(t) || /^\d+$/.test(t) || C.punct.includes(t) || t.startsWith("t_") || /^[^a-z0-9_]+$/.test(t)) { res.push(t); continue; }
    const n = "n_" + slug(t); info.names[n] = originals.get(t) || t; res.push(n);
  }
  return { tokens: res, info };
}
