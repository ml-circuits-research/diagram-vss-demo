// presence_decomp.mjs: where the PRESENCE of a single role comes from. With legend reader.occupancy_marker the reader decides that a
// single role r is present from the marker component of the state (reader.js readRole line 234 / infer.py read_role line 343-345):
//   presence(r) = Re< marker/sqrt(D), Sn * conj(role_r) > / core,   Sn = S / |S|,  S = sum_j a_j(kinds) * F(token_j)
// The training target holds role_r * (F(filler) + marker) (world.Compiler.wire), so the marker term must be written by the chart; a token
// j adds a_j * F_j, and F_j is the fixed hashed star of the WORD while a_j depends only on the kinds. A token can therefore write
// role_r * marker only if its address carries conj(F_j): possible for a kind that holds one word (an own-kind word: to, from, the ...),
// not for a kind shared by many words (NAME, VERB, COLOR, POS ...), where the same address serves every word of the kind.
// This script splits every presence ratio into the contributions of the tokens, grouped by the class of the token's kind:
//   own (the kind holds exactly one catalog word), VERB, NAME, value (other multi-word kinds: COLOR, POS, SIZE ...), unknown.
// Also the predicate score of each verb of the sentence split the same way. Rows: capacity/<name>_frames.jsonl.
// node presence_decomp.mjs fit|dev > out.json
import { readFileSync } from "node:fs";
const R = "/home/claude/diagram-vss-demo/", HERE = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/capacity/";
const { load } = await import(R + "docs/js/vss.js");
const dir = new URL(`${R}docs/model/fix_p80_s0/`, "file:///");
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true }), rd = vss.reader, st = vss.stars, rb = vss.rb, D = rb.D, sq = Math.sqrt(D);
const words = vss.model.catalog.words, perKind = {};
for (const [w, e] of Object.entries(words)) perKind[e.kind] = (perKind[e.kind] || 0) + 1;
const cls = (k) => (k === "unknown" ? "unknown" : k === "VERB" ? "VERB" : k === "NAME" ? "NAME" : (perKind[k] || 0) <= 1 ? "own" : "value");
const evRoles = Object.fromEntries(vss.model.legend.events.map((e) => [e.id, e.roles || []])), setRoles = new Set(["members", "targets"]);
const re = (a, b) => { let s = 0; for (let d = 0; d < D; d++) s += a.re[d] * b.re[d] + a.im[d] * b.im[d]; return s; };   // Re(conj(a) . b)
const mulc = (a, b) => { const o = { re: new Float64Array(D), im: new Float64Array(D) }; for (let d = 0; d < D; d++) { o.re[d] = a.re[d] * b.re[d] + a.im[d] * b.im[d]; o.im[d] = a.im[d] * b.re[d] - a.re[d] * b.im[d]; } return o; };   // a * conj(b)
const mul = (a, b) => { const o = { re: new Float64Array(D), im: new Float64Array(D) }; for (let d = 0; d < D; d++) { o.re[d] = a.re[d] * b.re[d] - a.im[d] * b.im[d]; o.im[d] = a.re[d] * b.im[d] + a.im[d] * b.re[d]; } return o; };
const mk = st.marker(), pred = st.op("pred");
const rows = readFileSync(HERE + `${process.argv[2]}_frames.jsonl`, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.split !== "dropped");
const out = [];
for (const r of rows) {
  const toks = r.tokens; if (!toks.length) continue;
  const [kept, cidx] = rd.encode(toks); if (!kept.length) continue;
  const addr = rb.addresses(cidx), terms = kept.map((i, j) => mul(addr[j], st.id(rd.ident(toks[i]))));
  const S = { re: new Float64Array(D), im: new Float64Array(D) }; for (const t of terms) for (let d = 0; d < D; d++) { S.re[d] += t.re[d]; S.im[d] += t.im[d]; }
  let nS = 0; for (let d = 0; d < D; d++) nS += S.re[d] ** 2 + S.im[d] ** 2; nS = Math.sqrt(nS);
  // core = the structure score: the best verb of the whole catalog against Sn * conj(pred) (structureScore, predicate only: no core roles)
  const SnP = mulc({ re: S.re.map((x) => x / nS), im: S.im.map((x) => x / nS) }, pred);
  let core = -1e9; for (const v of rd.legend.allVerbs()) core = Math.max(core, re(st.id(v), SnP) / sq);
  const ks = kept.map((i) => cls(rd.kind(toks[i]) && rb.catId.has(rd.kind(toks[i])) ? rd.kind(toks[i]) : "unknown"));
  const roles = {};
  for (const role of evRoles[r.ev] || []) {
    if (setRoles.has(role)) continue;
    const key = mul(st.role(role), mk);          // presence = sum_j Re< role * marker, a_j F_j > / (sqrt(D) |S| core)
    const by = { own: 0, VERB: 0, NAME: 0, value: 0, unknown: 0 }; let tot = 0;
    terms.forEach((t, j) => { const c = re(key, t) / (sq * nS * core); by[ks[j]] += c; tot += c; });
    roles[role] = { gold: Object.hasOwn(r.roles, role), thr: (vss.model.config.thresholds.presence || {})[role] ?? null, total: +tot.toFixed(4), by: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, +v.toFixed(4)])) };
  }
  // the predicate: score of each verb of the sentence split into its own deposit and the rest
  const verbsHere = [...new Set(kept.map((i) => toks[i]).filter((t) => rd.legend.eventOfLemma(t)))];
  const predSc = Object.fromEntries(verbsHere.map((v) => { const F = st.id(v); let own = 0, rest = 0; terms.forEach((t, j) => { const c = re(mulc(F, { re: pred.re.map((x, d) => x), im: pred.im.map((x) => -x) }), t); if (toks[kept[j]] === v) own += c; else rest += c; }); return [v, { own: +(own / (sq * nS)).toFixed(4), rest: +(rest / (sq * nS)).toFixed(4) }]; }));
  out.push({ id: r.id, wi: r.wi, split: r.split, pat: null, tokens: toks.join(" "), kinds: ks.join(" "), ev: r.ev, ok: r.ok, core: +core.toFixed(4), roles, pred: predSc });
}
console.log(JSON.stringify(out));
