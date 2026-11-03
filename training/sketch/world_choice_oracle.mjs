// world_choice_oracle.mjs: which world and which event the VSS composer picks for each gold request when the units are the gold spans
// (the cut oracle), with the shipped worlds and, optionally, every world's front end replaced by another front.json (FRONTS=<dir> holding
// <world>.json, as convert_check.py --fronts-out writes them). Round 2 (TRAIN_PLAN_R2.md): the effect of a front-end learning rule
// (FRONT_NEG, VAL_GUARD) on the router, measured before any world is retrained. The models stay the shipped ones, so a request whose gold
// world loses its own action token under the new front loses it here too; a world that stops claiming a foreign word stops winning here.
//   [FRONTS=dir] [PART=test|cal|all] [REGISTRY=docs/model/micro/registry.json] node training/sketch/world_choice_oracle.mjs <out.json> <data dir>...
// PART: test = the messages with int(sha256(id), 16) % 3 != 0 (the test parts of fresh2 / short3), cal = == 0, all = every message.
// Messages with a "pending" wire are left out (as job 072). Per request: the gold world (the registry world of the gold event) and
//   world right     the unit was read by the gold world, with the gold event;
//   other world     another world won (cause 1 of VSS_FROM_TO.md section 5 when the gold world read the gold event in `tried`);
//   wrong event     the gold world was chosen and read another event;
//   not read        no world read the unit (unknown-event / no-sense everywhere, or the unit was ignored).
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const R = new URL("../../", import.meta.url).pathname;
const [OUT, ...DIRS] = process.argv.slice(2);
if (!OUT || !DIRS.length) { console.error("usage: [FRONTS=dir] [PART=test] node world_choice_oracle.mjs <out.json> <data dir>..."); process.exit(2); }
const PART = process.env.PART || "test", FRONTS = process.env.FRONTS || "";
const { load } = await import(R + "docs/js/vss.js");
const { loadComposer } = await import(R + "docs/js/vss-composer.js");
const MODELS = R + "docs/model/";
const REG = JSON.parse(readFileSync(process.env.REGISTRY || MODELS + "micro/registry.json", "utf8"));
const rj = (p) => JSON.parse(readFileSync(MODELS + p, "utf8"));
const worldOf = new Map(); for (const w of REG.worlds) worldOf.set(w.model, w.world);
const loadModel = async (name) => {
  const d = MODELS + name + "/", rf = async (n) => { const b = readFileSync(d + n); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
  const wid = worldOf.get(name), alt = FRONTS && wid ? `${FRONTS}/${wid}.json` : null;
  if (alt && !existsSync(alt)) throw new Error(`FRONTS: ${alt} is missing`);
  const F = alt ? JSON.parse(readFileSync(alt, "utf8")) : existsSync(d + "front.json") ? JSON.parse(await rf("front.json")) : null;
  return { vss: await load(null, { readFile: rf, sentenceCandidates: true }), F };
};
const comp = await loadComposer(REG, rj(REG.cutter), loadModel, { router: "cutter", context: rj(REG.context), eventCutter: REG.event_cutter ? rj(REG.event_cutter) : undefined, eventHint: REG.event_hint });
const LOW = { tofront: "toFront", toback: "toBack", groupby: "groupBy", groupof: "groupOf" };
const evW = new Map(); for (const w of REG.worlds) for (const e of w.events) evW.set(e, w.world);
const QEV = { rules: "list" };
const goldEvent = (w) => {
  const a = w.args || {};
  if (w.type === "command") return LOW[a.action] || a.action;
  if (w.type === "question") return QEV[a.ask] || LOW[a.ask] || a.ask;
  return w.type;   // fact / rule
};
const part = (id) => { const h = BigInt("0x" + createHash("sha256").update(id).digest("hex")) % 3n; return PART === "all" || (PART === "cal" ? h === 0n : h !== 0n); };
const rows = [];
for (const d of DIRS) {
  const dd = d.startsWith("/") ? d : R + "training/sketch/" + d;
  for (const f of readdirSync(dd).filter((f) => /^(msg|batch)_.*\.jsonl$/.test(f)).sort())
    for (const l of readFileSync(dd + "/" + f, "utf8").split("\n")) if (l.trim()) { const m = JSON.parse(l); if (part(m.id) && !m.wires.some((w) => "pending" in w)) rows.push([d, m]); }
}
const tally = {}, per = [];
const add = (k, x) => { tally[k] = tally[k] || {}; tally[k][x] = (tally[k][x] || 0) + 1; };
for (const [d, m] of rows) {
  const units = []; const at = [];
  for (const w of m.wires) {
    const i = w.span ? m.text.indexOf(w.span) : -1;
    at.push(i < 0 ? null : [i, i + w.span.length]);
    if (i >= 0 && !units.some((u) => u.c0 === i && u.c1 === i + w.span.length)) units.push({ c0: i, c1: i + w.span.length });
  }
  units.sort((a, b) => a.c0 - b.c0);
  let res;
  try { res = comp.formalize(m.text, { names: (m.names || []).slice(), last: [] }, { units }); } catch (e) { res = { units: [] }; }
  m.wires.forEach((w, j) => {
    if (!w.type || !at[j]) return;
    const ge = goldEvent(w), gw = evW.get(ge) || null;
    if (!gw) return;   // an event in no world (not routed)
    const u = (res.units || []).find((v) => v.c0 === at[j][0] && v.c1 === at[j][1]);
    const tried = (u && u.tried) || [], gt = tried.find((t) => t.world === gw);
    let k;
    if (!u || !u.world || !u.event) k = "not read";
    else if (u.world === gw && u.event === ge) k = "world right";
    else if (u.world === gw) k = "wrong event";
    else k = gt && gt.event === ge ? "other world (gold world read the gold event)" : "other world";
    const set = d.includes("short3") ? "short3" : d.includes("fresh2") ? "fresh2" : d;
    add(set, k); add("all", k);
    per.push({ id: m.id, set, span: w.span, gold: `${gw}/${ge}`, got: u && u.world ? `${u.world}/${u.event}` : null, k, tokens: u && u.normalized });
  });
}
writeFileSync(OUT, JSON.stringify({ fronts: FRONTS || "shipped", part: PART, tally, per }, null, 0));
for (const [s, t] of Object.entries(tally)) {
  const n = Object.values(t).reduce((a, b) => a + b, 0);
  console.log(`${s}: ${n} requests; ` + Object.entries(t).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v} (${(100 * v / n).toFixed(1)}%)`).join(", "));
}
