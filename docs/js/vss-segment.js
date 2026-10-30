// vss-segment.js: the message cut into requests BY THE VSS READER ITSELF (no separate model; approved by the owner 2026-10-30).
// A VSS state holds one request (one predicate). So: within each sentence (cut at . ! ? only), every stretch of up to MAX_LEN tokens
// whose normalized form carries exactly one event token is read by the VSS reader; its score is the number of its tokens times
// (1 - residual) minus LAMBDA times the tokens the reading could not place (chatter glued to a request is not explained). A dynamic programme picks the non-overlapping stretches with the highest
// total score; tokens left out are chatter. Stretches the reader cannot read (unknown-event, no-sense) score nothing.
import * as FRONT from "./front.js";

const ENDS = new Set([".", "!", "?"]), PUNCT = new Set([".", ",", "!", "?", ";", ":"]);

export function vssSegment(text, names, F, vss, opts = {}) {
  const maxLen = opts.maxLen || 14, lambda = opts.lambda ?? (+process?.env?.SEG_LAMBDA || 1), verbs = opts.verbs || new Set(vss.model.legend.events.flatMap((e) => e.verbs || []));
  const [toks] = FRONT.tokenize(text, names), sents = []; let cur = [];
  toks.forEach((t, k) => { cur.push(k); if (ENDS.has(t[0])) { sents.push(cur); cur = []; } });
  if (cur.length) sents.push(cur);
  const out = [], cache = new Map();
  const read = (a, b, s) => {
    const src = text.slice(toks[s[a]][1], toks[s[b - 1]][2]);
    if (cache.has(src)) return cache.get(src);
    let v = null;
    const { tokens } = FRONT.normalize(src, names, F);
    if (tokens.filter((t) => verbs.has(t)).length === 1) {
      const r = vss.read(tokens.join(" "));
      if (r.status !== "unknown-event" && r.status !== "no-sense") {
        const placed = tokens.length - r.unplaced.length;   // tokens the reading put into a role (or the predicate)
        v = { src, score: (placed - lambda * r.unplaced.length) * (1 - Math.min(1, Math.max(0, r.residual))) };
      }
    }
    cache.set(src, v); return v;
  };
  for (const s of sents) {
    const n = s.length, best = new Array(n + 1).fill(0), back = new Array(n + 1).fill(null);
    for (let i = 1; i <= n; i++) {
      best[i] = best[i - 1]; back[i] = null;                                   // token i-1 is chatter
      for (let a = Math.max(0, i - maxLen); a < i; a++) {
        if (PUNCT.has(toks[s[a]][0]) || PUNCT.has(toks[s[i - 1]][0])) continue;   // a stretch neither starts nor ends on punctuation
        const r = read(a, i, s); if (!r) continue;
        if (best[a] + r.score > best[i]) { best[i] = best[a] + r.score; back[i] = [a, r.src]; }
      }
    }
    const spans = []; let i = n;
    while (i > 0) { if (back[i]) { spans.push(back[i][1]); i = back[i][0]; } else i--; }
    out.push(...spans.reverse());
  }
  return out;
}
