// vss-centers.js: the message cut into requests by the VSS reader, "several centres of gravity" (owner's idea, approved 2026-10-31).
// First principles: a VSS state has ONE predicate (its centre) and its word addresses are computed from a start point, so a message
// with several requests needs several states, one per centre. Here:
//   1. the centres are the event words of the sentence (the learned triggers, applied repeatedly along the sentence);
//   2. for every centre, every stretch [start, end] that contains it and no other centre is read by the VSS reader; a stretch scores
//      (#tokens the reading places in a role or as the predicate) - (#tokens it cannot place): a word belongs to a centre when that
//      centre's reading explains it; chatter glued to a request is not explained and costs;
//   3. a dynamic programme over the centres picks, for each, the stretch with the best total score, stretches not overlapping; a centre
//      whose every stretch is unreadable (unknown-event, no-sense) is dropped; tokens in no stretch are chatter.
// Sentences are cut at . ! ? (punctuation is a mechanical separator). No separate model, no tuned weight.
import * as FRONT from "./front.js";

const ENDS = new Set([".", "!", "?"]), PUNCT = new Set([".", ",", "!", "?", ";", ":"]);

/** the event centres of a token list: positions (in `toks`) where a learned trigger rule fires, found left to right */
function centres(words, F, verbs) {
  // values first, keeping for each value token the index of its first source word
  const vals = [], src = []; let i = 0;
  const V = F.values, isWord = (t) => !(t.startsWith("n_") || t.startsWith("t_") || /^\d+$/.test(t) || PUNCT.has(t));
  while (i < words.length) {
    let hit = false;
    for (const n of [3, 2, 1]) { const g = words.slice(i, i + n); if (g.length === n && g.every(isWord) && Object.hasOwn(V, g.join(" "))) { vals.push(V[g.join(" ")]); src.push(i); i += n; hit = true; break; } }
    if (!hit) { vals.push(words[i]); src.push(i); i++; }
  }
  const out = []; let from = 0;
  for (;;) {
    const rest = vals.slice(from), t = FRONT.applyTriggers(rest, F.triggers);
    const k = t.findIndex((x, j) => verbs.has(x) && x !== rest[j]);   // the position where a rule fired (its token differs from the word)
    const kk = k >= 0 ? k : t.findIndex((x) => verbs.has(x));          // or a word that is itself an event token
    if (kk < 0) break;
    out.push(src[from + kk]); from += kk + 1;
    if (from >= vals.length) break;
  }
  return out;
}

export function vssCentres(text, names, F, vss, opts = {}) {
  const verbs = opts.verbs || new Set(vss.model.legend.events.flatMap((e) => e.verbs || []));
  const [toks] = FRONT.tokenize(text, names), sents = []; let cur = [];
  toks.forEach((t, k) => { cur.push(k); if (ENDS.has(t[0])) { sents.push(cur); cur = []; } });
  if (cur.length) sents.push(cur);
  const out = [], cache = new Map();
  const read = (s, a, b) => {                                   // stretch s[a..b] inclusive
    while (a <= b && PUNCT.has(toks[s[a]][0])) a++;
    while (b >= a && PUNCT.has(toks[s[b]][0])) b--;
    if (a > b) return null;
    const srcText = text.slice(toks[s[a]][1], toks[s[b]][2]);
    if (cache.has(srcText)) return cache.get(srcText);
    const { tokens } = FRONT.normalize(srcText, names, F); let v = null;
    if (tokens.filter((t) => verbs.has(t)).length === 1) {
      const r = vss.read(tokens.join(" "));
      if (r.status !== "unknown-event" && r.status !== "no-sense") {
        const un = r.unplaced.filter((t) => !PUNCT.has(t)).length, all = tokens.filter((t) => !PUNCT.has(t)).length;
        v = { src: srcText, score: (all - un) - un };
      }
    }
    cache.set(srcText, v); return v;
  };
  for (const s of sents) {
    const words = s.map((k) => toks[k][0]), C = centres(words, F, verbs);
    if (!C.length) continue;
    // DP over centres: state = end index of the previous stretch
    let states = new Map([[-1, { score: 0, spans: [] }]]);
    C.forEach((c, j) => {
      const lo = j > 0 ? C[j - 1] + 1 : 0, hi = j + 1 < C.length ? C[j + 1] - 1 : s.length - 1, next = new Map();
      for (const [prevEnd, st] of states) {
        if (!next.has(prevEnd) || next.get(prevEnd).score < st.score) next.set(prevEnd, st);      // the centre dropped
        for (let a = Math.max(lo, prevEnd + 1); a <= c; a++) for (let b = c; b <= hi; b++) {
          const r = read(s, a, b); if (!r) continue;
          const cand = { score: st.score + r.score, spans: st.spans.concat([r.src]) };
          if (!next.has(b) || next.get(b).score < cand.score) next.set(b, cand);
        }
      }
      states = next;
    });
    let best = null; for (const st of states.values()) if (!best || st.score > best.score) best = st;
    out.push(...best.spans);
  }
  return out;
}
