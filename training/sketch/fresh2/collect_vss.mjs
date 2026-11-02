// fresh2/collect_vss.mjs: the VSS collector of FRESH2_PLAN.md. A copy of the `collect` function of ../vss_confidence.mjs (the features, the
// outcome definition PAIR=value and the check against llm_score.mjs tally are unchanged); the only additions: every produced request also
// carries `a` (its act, type:action) and `g` (the index of the gold request it was paired with, -1 for an extra), and the record carries
// `goldActs` (the act of every gold request), which the report needs for the commands / questions split.
//   [REGISTRY=<registry json>] [CONTEXT=<context filler json>] node training/sketch/fresh2/collect_vss.mjs <out.jsonl> <set> <dir> [<dir> ...]
//   VSS round 1: no env (docs/model/micro/registry.json, its context filler);  round 2: REGISTRY=docs/model/micro/registry_r2.json CONTEXT=docs/model/context/weights_r2.json
import { readFileSync, readdirSync, writeFileSync, appendFileSync } from "node:fs";
const [mode, ...args] = ["collect", ...process.argv.slice(2)];

// ------------------------------------------------------------------ collect
async function collect([out, set, ...dirs]) {
  process.env.LLM_SCORE_LIB = "1"; process.env.SEG ||= "composer"; process.env.PAIR ||= "value";
  const { vssFormalize, tally } = await import("../llm_score.mjs");
  const { Composer } = await import("../../../docs/js/vss-composer.js");
  const { Context } = await import("../../../docs/js/vss-context.js");
  const FRONT = await import("../../../docs/js/front.js");
  const { canon, canonWant } = await import("../../../docs/js/bench-canon.js");
  const { pairValue } = await import("../layer_common.mjs");

  // observe the composer's units + both cutters' scores for the message, and the context filler's steps
  let ST = [];
  const origStep = Context.prototype.step;
  Context.prototype.step = function (raw, c0, c1, opts) { const r = origStep.apply(this, arguments); if (!(opts && opts.dry)) ST.push({ c0, c1, r }); return r; };
  const origF = Composer.prototype.formalizeCutter;
  Composer.prototype.formalizeCutter = function (text, ctx = {}, opts = {}) {
    ST = [];
    const o = origF.apply(this, arguments), canvas = ctx.names || [];
    const [toks] = FRONT.tokenize(text, canvas), words = toks.map((x) => x[0]);
    const C = this.cutter, cs = FRONT.segDecodeLabels(words, C.segmenter, C.labels).scores;
    const E = this.eventCutter, es = E ? FRONT.segDecodeLabels(words, E.segmenter, E.labels).scores : null;
    globalThis.__obs = { units: o.units, toks, cs, es, C, E, ST: ST.slice() };
    return o;
  };

  const actOf = (type, a) => `${type}:${a.action || a.ask || ""}`;
  function pairUp(mains, gold, row) {
    const used = new Set(), G = row.wires.map((w, j) => {
      let s0 = -1;
      if (w.span) { let from = 0; for (;;) { const k = row.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s0 = k; break; } from = k + 1; } if (s0 < 0) s0 = row.text.indexOf(w.span); used.add(s0); }
      return { s: s0, e: s0 < 0 ? -1 : s0 + w.span.length, act: gold[j].act, want: gold[j].want, args: w.args };
    });
    const units = mains.map((x) => { if (x.n.span) return { c0: x.n.span[0], c1: x.n.span[1] }; const k = x.n.src ? row.text.indexOf(x.n.src) : -1; return k < 0 ? { c0: 0, c1: 0 } : { c0: k, c1: k + x.n.src.length }; });
    return pairValue({ text: row.text, gold: G, units, prods: mains.map((x, i) => ({ act: x.act, u: i, rawC: x.got })) });
  }
  function outcomes(nodes, row) {
    const mains = nodes.filter((n) => n.type !== "mention").map((n) => ({ act: actOf(n.type, n.args), got: canon(n, nodes), n }));
    const gold = row.wires.map((w) => ({ act: actOf(w.type, w.args), want: canonWant(w.type, w.args) }));
    const res = mains.map(() => "extra"), gi = mains.map(() => -1);
    for (const [i, j] of pairUp(mains, gold, row)) { gi[i] = j; res[i] = Object.entries(gold[j].want).every(([k, v]) => (mains[i].got[k] ?? "∅") === v) ? "right" : "wrong"; }
    return { mains, res, gi, gold };
  }
  const maxOf = (sc, labs) => Math.max(...labs.map((l) => sc[l]));
  function features(n) {
    const ob = globalThis.__obs, u = (ob.units || []).find((x) => n.span && x.c0 === n.span[0] && x.c1 === n.span[1] && x.vss);
    if (!u) return { w: null, f: { found: 0 } };
    const f = { found: 1 };
    // cut: scores at the unit's first token and at the token after its last
    const k = ob.toks.findIndex(([, s]) => s === u.c0), kEnd = ob.toks.findIndex(([, , e]) => e === u.c1);
    const Bw = ob.C.labels.filter((l) => l.startsWith("B-")), IO = ["I", "O"];
    if (k >= 0) f.cut_start = maxOf(ob.cs[k], Bw) - maxOf(ob.cs[k], IO); else f.cut_start = null;
    if (kEnd >= 0 && kEnd + 1 < ob.toks.length) { const s = ob.cs[kEnd + 1]; f.cut_end = Math.max(maxOf(s, Bw), s.O) - s.I; } else f.cut_end = null;   // end of text: null (a clean end)
    // world: the cutter's candidates (u.candidates ranked by score), the chosen world, the words not understood of every tried world
    const cand = u.candidates || [], ch = cand.find((c) => c.world === u.world), others = cand.filter((c) => c.world !== u.world);
    f.world_gap = ch && others.length ? ch.score - Math.max(...others.map((c) => c.score)) : null;
    f.world_rank = cand.length && cand[0].world === u.world ? 1 : 0;
    const tr = u.tried || [], me = tr.find((t) => t.world === u.world), oth = tr.filter((t) => t.world !== u.world && t.event && t.notUnderstood < t.words);
    f.wnu_gap = me && oth.length ? Math.min(...oth.map((t) => t.notUnderstood)) - me.notUnderstood : 0;
    f.tie = 1 / (u.tie || 1);
    f.notu_frac = me && me.words ? me.notUnderstood / me.words : 1;
    // event: the event cutter at the unit's first token
    if (ob.es && k >= 0) {
      const sc = ob.es[k], B = ob.E.labels.filter((l) => l.startsWith("B-")), lab = "B-" + u.event;
      const best = B.reduce((a, l) => (sc[l] > sc[a] ? l : a), B[0]);
      f.event_agree = best === lab ? 1 : 0;
      f.event_gap = sc[lab] !== undefined ? sc[lab] - Math.max(...B.filter((l) => l !== lab).map((l) => sc[l])) : null;
    } else { f.event_agree = 0; f.event_gap = null; }
    // roles: the reader's margins
    const mg = u.vss.margins || {}, rm = Object.entries(mg).filter(([key]) => key !== "structure" && key !== "event").map(([, v]) => +v).filter(Number.isFinite);
    const all = Object.values(mg).map(Number).filter(Number.isFinite);
    f.event_margin = Number.isFinite(+mg.event) ? +mg.event : null;
    f.role_min = rm.length ? Math.min(...rm) : null;      // no role margin: null (nothing to doubt)
    f.margin_min = all.length ? Math.min(...all) : 0;     // the old confidence (risk_coverage.mjs)
    f.residual = Number.isFinite(+u.vss.residual) ? +u.vss.residual : 0;
    f.unplaced = (u.vss.unplaced || []).length;
    f.abstain = u.vss.status === "ok" ? 0 : 1;
    // context: the filler's gaps of this unit
    const st = ob.ST.filter((s) => s.c0 === u.c0 && s.c1 === u.c1).pop(), gaps = st && st.r ? st.r.gaps : [];
    const fills = gaps.filter((g) => g.decision === "fill"), fm = fills.map((g) => g.margin).filter((m) => Number.isFinite(m));
    f.ctx_fill = fills.length;
    f.ctx_margin = fm.length ? Math.min(...fm) : null;
    f.ctx_left = gaps.filter((g) => g.decision === "left").length;
    return { w: u.world, f };
  }

  const IDS = process.env.IDS ? new Set(readFileSync(process.env.IDS, "utf8").split(/\s+/).filter(Boolean)) : null;
  const HELD = process.env.HELDOUT ? new Set(readFileSync(process.env.HELDOUT, "utf8").split(/\s+/).filter(Boolean)) : new Set();
  const LIMIT = process.env.LIMIT ? +process.env.LIMIT : Infinity;
  const blank = () => ({ exact: 0, right: 0, wrongAligned: 0, missed: 0, acts: 0, extra: 0, gold: 0, mRight: 0, mHonest: 0, mWrong: 0, byAct: {} });
  const tot = blank(), mine = { right: 0, wrong: 0, extra: 0 };
  writeFileSync(out, "");
  let done = 0; const seen = new Set();
  for (const d of dirs) {
    const files = readdirSync(d).filter((f) => f.endsWith(".jsonl") && /^(msg|batch|s)[_.]/.test(f)).sort();
    const rows = files.flatMap((f) => readFileSync(`${d}/${f}`, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)))
      .filter((r) => Array.isArray(r.wires) && (!IDS || IDS.has(r.id)) && !seen.has(r.id)).slice(0, LIMIT);
    for (const r of rows) {
      seen.add(r.id);
      const ctx = { names: (r.names || []).slice(), last: [], spans: r.wires.every((w) => w.span) ? r.wires.map((w) => w.span) : null };
      globalThis.__obs = null;
      const vn = vssFormalize(r.text, ctx);
      const rec = { id: r.id, set, heldout: HELD.has(r.id), gold: r.wires.length, vss: [] };
      const { mains, res, gi, gold } = outcomes(vn, r);
      rec.goldActs = gold.map((g) => g.act);
      mains.forEach((x, i) => { const { w, f } = features(x.n); rec.vss.push({ o: res[i], w, f, a: x.act, g: gi[i] }); mine[res[i]]++; });
      tally(tot, vn, r);
      appendFileSync(out, JSON.stringify(rec) + "\n");
      if (++done % 200 === 0) console.error(`${done} messages (${set})`);
    }
  }
  if (tot.right !== mine.right || tot.wrongAligned !== mine.wrong || tot.extra !== mine.extra) throw new Error(`outcomes ${JSON.stringify(mine)} differ from tally ${tot.right}/${tot.wrongAligned}/${tot.extra}`);
  const p = (x) => (x / tot.gold * 100).toFixed(1);
  console.log(`${set} vss: ${done} messages, ${tot.gold} gold · right ${p(tot.right)} · wrong ${p(tot.wrongAligned)} · not done ${p(tot.missed)} · extra ${tot.extra} (checked against tally)`);
}


await collect(args);
