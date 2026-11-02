// feedback/stage_rates.mjs: the needs of data_needs.mjs summed by the stage groups of FRESH2_CAUSES.md, per 100 composer units, for one or
// more needs files (text only; DATA_NEEDS.md uses it to compare the calibration part with the sample). A unit counts once per group
// (a unit flagged by two causes of one group counts once). The cause -> group map is fixed here, before comparing:
//   cutter      cut-missed, cut-start, cut-end
//   roles       unplaced, residual, words-left, close (a role margin), no-request (adapter)
//   event/world world-vs-cutter, world-close, unread-unknown, unread-known, close (the event margin), prior
//   references  ask, context
//   front end   unknown-word
//   node training/sketch/feedback/stage_rates.mjs <needs.json> [...]
import { readFileSync } from "node:fs";
const groupOf = (n) => {
  const c = n.cause;
  if (["cut-missed", "cut-start", "cut-end"].includes(c)) return "cutter";
  if (c === "close") return n.key.split("|")[2] === "event" ? "event/world" : "roles";
  if (["unplaced", "residual", "words-left", "no-request"].includes(c)) return "roles";
  if (["world-vs-cutter", "world-close", "unread-unknown", "unread-known", "prior"].includes(c)) return "event/world";
  if (["ask", "context"].includes(c)) return "references";
  if (c === "unknown-word") return "front end";
  return "other";
};
const files = process.argv.slice(2), R = [];
for (const f of files) {
  const N = JSON.parse(readFileSync(f, "utf8")), base = N.stats.units + N.stats.leftoverReads, G = new Map(), all = new Set();
  for (const n of N.needs) { const g = groupOf(n); if (!G.has(g)) G.set(g, new Set()); for (const [m, c0] of n.instances) { G.get(g).add(`${m}@${c0}`); all.add(`${m}@${c0}`); } }
  R.push({ f, base, units: N.stats.units, msgs: N.meta.messages, G, all });
}
const groups = ["cutter", "roles", "event/world", "references", "front end", "other"];
console.log(`| group | ${R.map((r) => `${r.f.split("/").pop()} (${r.msgs} msgs, ${r.units} units + ${r.base - r.units} pieces)`).join(" | ")} |`);
console.log(`|---|${R.map(() => "---").join("|")}|`);
for (const g of groups) console.log(`| ${g} | ${R.map((r) => `${(100 * ((r.G.get(g) || new Set()).size) / r.base).toFixed(1)}`).join(" | ")} |`);
console.log(`| any | ${R.map((r) => (100 * r.all.size / r.base).toFixed(1)).join(" | ")} |`);
