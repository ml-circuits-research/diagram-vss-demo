// Sanity run of the rules reader on ops_groups/msg_*.jsonl: per new kind, how many gold requests the rules read right / wrong / not done.
// node rules_sanity.mjs   (pairing: LCS on type+action/ask, like llm_score.mjs)
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { canon, canonWant } from "../../../../docs/js/bench-canon.js";
const require = createRequire(import.meta.url), K = require("../../../../docs/js/logic.js"), sys = K.createSystem();
const D = new URL("./", import.meta.url).pathname;
const rows = readdirSync(D).filter(f => /^msg_\d+\.jsonl$/.test(f)).sort().flatMap(f => readFileSync(D + f, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)));
const act = (t, a) => `${t}:${a.action || a.ask || ""}`;
const T = {}; const bump = (k, f) => { (T[k] = T[k] || { n: 0, right: 0, wrong: 0, missed: 0 })[f]++; };
const isG = (r, v) => String(v ?? "").split(",").some(x => x in r.groups);
for (const r of rows) {
  const ctx = { names: r.names, groups: Object.keys(r.groups), last: [] };
  let nodes = []; try { nodes = sys.formalize(r.text, ctx).nodes; } catch (e) { nodes = []; }
  const mains = nodes.filter(n => n.type !== "mention").map(n => ({ act: act(n.type, n.args), got: canon(n, nodes) }));
  const gold = r.wires.map(w => ({ w, act: act(w.type, w.args), want: canonWant(w.type, w.args) }));
  const n = mains.length, m = gold.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = mains[i].act === gold[j].act ? 1 + L[i + 1][j + 1] : Math.max(L[i + 1][j], L[i][j + 1]);
  const pair = new Map(); let i = 0, j = 0;
  while (i < n && j < m) { if (mains[i].act === gold[j].act) { pair.set(j, i); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  gold.forEach((g, j) => {
    const a = g.w.args; let kinds = [];
    if (a.action === "group") kinds.push("group"); else if (a.action === "ungroup") kinds.push("ungroup");
    else if (a.ask === "members") kinds.push("members"); else if (a.ask === "groupOf") kinds.push("groupOf");
    else if (a.kind === "group") kinds.push("groups list/count/exists");
    else { if (isG(r, a.target)) kinds.push("group as target: " + a.action); if (isG(r, a.anchor)) kinds.push("group as anchor"); }
    if (a.action === "set" && a.shape) kinds.push("set shape");
    if (!kinds.length) kinds.push("old requests");
    const p = pair.get(j); const ok = p !== undefined && Object.entries(g.want).every(([k, v]) => (mains[p].got[k] ?? "∅") === v);
    for (const k of kinds) { bump(k, "n"); bump(k, p === undefined ? "missed" : ok ? "right" : "wrong"); }
  });
}
const sum = (pred) => Object.entries(T).filter(([k]) => pred(k)).reduce((s, [, v]) => ({ n: s.n + v.n, right: s.right + v.right, wrong: s.wrong + v.wrong, missed: s.missed + v.missed }), { n: 0, right: 0, wrong: 0, missed: 0 });
const line = (k, v) => `${k.padEnd(34)} n=${String(v.n).padStart(4)}  right ${String(v.right).padStart(4)} (${(v.right / v.n * 100).toFixed(0)}%)  wrong ${String(v.wrong).padStart(4)}  not done ${String(v.missed).padStart(4)}`;
for (const [k, v] of Object.entries(T).sort((a, b) => b[1].n - a[1].n)) console.log(line(k, v));
console.log(line("ALL group-as-target", sum(k => k.startsWith("group as target"))));
console.log(line("ALL new group kinds", sum(k => ["group", "ungroup", "members", "groupOf", "groups list/count/exists"].includes(k) || k.startsWith("group as"))));
