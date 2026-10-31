// sim_presence.mjs: a readout change simulated on the SAME model, no training. The presence of a single role is read from the best
// candidate's score (the deposit that carries the word: role_r * F(filler)), as the set roles members / targets already are, instead
// of the occupancy marker (which only one-word kinds can write, presence_decomp.mjs). This is the reader's existing code path for
// legend reader.occupancy_marker = false (reader.js readRole: pres = fillerTop(...)[2]; infer.py read_role line 345).
// New presence thresholds are fitted exactly by the trainer's rule (train.py calibrate / fit_threshold: per role, the threshold that
// maximises the balanced present / absent accuracy; a role with < 5 present or < 5 absent rows gets none), on the fit split's own
// calibration rows: the 382 calib rows + 400 train rows (rng-free: every 9th train row). Never on dev. Writes sim_thresholds.json.
import { readFileSync, writeFileSync } from "node:fs";
const R = "/home/claude/diagram-vss-demo/", HERE = "/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/capacity/";
const { load } = await import(R + "docs/js/vss.js");
const dir = new URL(`${R}docs/model/fix_p80_s0/`, "file:///");
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true }), rd = vss.reader;
rd.legend.reader.occupancy_marker = false;            // presence from the candidate score
const rows = readFileSync(HERE + "fit_frames.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const train = rows.filter((r) => r.split === "train"), cal = rows.filter((r) => r.split === "calib").concat(train.filter((_, i) => i % 9 === 0).slice(0, 400));
const roleOrder = rd.schema.role_order, setRoles = new Set(["members", "targets"]), stats = {};
for (const r of cal) {
  if (!r.tokens.length) continue;
  const [S, kept] = rd.chart(r.tokens); if (!kept.length) continue;
  rd.filt = new Set(r.tokens.concat(r.tokens.map((t) => t.toLowerCase())));
  const f = rd.read(S, r.tokens, { presence: "all", estimator: rd.cfg.depth_estimator || "gates" }); rd.filt = null;
  for (const role of roleOrder) {
    if (setRoles.has(role)) continue;
    const s = (stats[role] = stats[role] || { present: [], absent: [] });
    s[Object.hasOwn(r.roles, role) ? "present" : "absent"].push(f.presence[role] ?? 0);
  }
}
function fitThreshold(p, a) {
  const v = [...new Set(p.concat(a))].sort((x, y) => x - y), c = v.length > 1 ? v.slice(1).map((x, i) => (v[i] + x) / 2) : v;
  let best = null, bs = -1;
  for (const t of c) { const s = (p.filter((x) => x >= t).length / p.length + a.filter((x) => x < t).length / a.length) / 2 - 1e-12 * t; if (s > bs) { bs = s; best = t; } }
  return [best, bs];
}
const th = {}, rep = {};
for (const [role, s] of Object.entries(stats)) {
  if (s.present.length >= 5 && s.absent.length >= 5) { const [t, b] = fitThreshold(s.present, s.absent); th[role] = t; rep[role] = { thr: +t.toFixed(4), balanced: +b.toFixed(3), n_present: s.present.length, n_absent: s.absent.length }; }
  else { th[role] = null; rep[role] = { thr: null, n_present: s.present.length, n_absent: s.absent.length }; }
}
writeFileSync(HERE + "sim_thresholds.json", JSON.stringify(th, null, 1));
// the balanced present / absent accuracy on DEV of both readouts: the marker (current thresholds) and the candidate score (new ones)
const dev = readFileSync(HERE + "dev_frames.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const oldTh = vss.model.config.thresholds.presence, acc = {};
for (const mode of ["marker", "candidate"]) {
  rd.legend.reader.occupancy_marker = mode === "marker";
  const T = mode === "marker" ? oldTh : th;
  for (const r of dev) {
    if (!r.tokens.length) continue;
    const [S, kept] = rd.chart(r.tokens); if (!kept.length) continue;
    rd.filt = new Set(r.tokens.concat(r.tokens.map((t) => t.toLowerCase())));
    const f = rd.read(S, r.tokens, { presence: "all", estimator: "kinds" }); rd.filt = null;
    if (f.event !== r.ev) continue;                       // the roles of the gold event only (read when the event is right)
    for (const role of rd.legend.eventRoles[r.ev] || []) {
      if (setRoles.has(role) || T[role] === null || T[role] === undefined) continue;
      const a = (acc[`${mode}:${role}`] = acc[`${mode}:${role}`] || { tp: 0, p: 0, tn: 0, n: 0 }), g = Object.hasOwn(r.roles, role), x = f.presence[role] ?? 0;
      if (g) { a.p++; a.tp += x >= T[role]; } else { a.n++; a.tn += x < T[role]; }
    }
  }
}
const sum = { marker: { tp: 0, p: 0, tn: 0, n: 0 }, candidate: { tp: 0, p: 0, tn: 0, n: 0 } };
for (const [k, a] of Object.entries(acc)) { const m = k.split(":")[0]; for (const x of ["tp", "p", "tn", "n"]) sum[m][x] += a[x]; }
console.log("calibration (candidate score):", JSON.stringify(rep));
console.log("dev, roles of the gold event when the event is read right: recall of present roles / specificity on absent roles");
for (const m of ["marker", "candidate"]) console.log(`  ${m}: present read present ${sum[m].tp}/${sum[m].p} = ${(100 * sum[m].tp / sum[m].p).toFixed(1)}%, absent read absent ${sum[m].tn}/${sum[m].n} = ${(100 * sum[m].tn / sum[m].n).toFixed(1)}%`);
for (const role of roleOrder) { const a = acc["marker:" + role], b = acc["candidate:" + role]; if (a || b) console.log(`  ${role}: marker ${a ? `${a.tp}/${a.p} ${a.tn}/${a.n}` : "-"} | candidate ${b ? `${b.tp}/${b.p} ${b.tn}/${b.n}` : "-"}`); }
