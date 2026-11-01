// gate_export.mjs: the gold requests of the 9 folders for gate_probe.py (M2). One record per gold wire: message id, span tokens (fallback front end:
// names -> NAME, quoted texts -> TEXT, numbers -> NUM), verbless flag (no action token under the fallback's front end, the study of composer_errors.mjs),
// gold world (the registry world whose events hold the gold event; else "fallback"), world of the previous request (by position in the text).
// node gate_export.mjs OUT.json
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import * as FRONT from "../../docs/js/front.js";
const OUT = process.argv[2];
const dirs = execFileSync("python3", [new URL("micro_tools.py", import.meta.url).pathname, "dirs"], { encoding: "utf8" }).split("\n").filter(Boolean);
const MODELS = new URL("../../docs/model/", import.meta.url);
const REG = JSON.parse(readFileSync(new URL("micro/registry.json", MODELS), "utf8"));
const F = JSON.parse(readFileSync(new URL(`${REG.fallback}/front.json`, MODELS), "utf8"));
const BV = JSON.parse(readFileSync(new URL(`${REG.fallback}/model.json`, MODELS), "utf8"));
const verbs = new Set(); for (const e of BV.legend.events) for (const v of e.verbs || []) verbs.add(v);
const evOf = (w) => (w.type === "command" ? w.args.action : w.type === "question" ? (w.args.ask === "rules" ? "list" : w.args.ask) : w.type);
const worldOf = (ev) => (REG.worlds.find((w) => w.events.includes(ev)) || { world: "fallback" }).world;
const out = [];
for (const d of dirs) for (const f of readdirSync(d).filter((f) => f.endsWith(".jsonl")).sort()) for (const l of readFileSync(`${d}/${f}`, "utf8").split("\n")) {
  if (!l.trim()) continue; const r = JSON.parse(l), used = new Set();
  const G = r.wires.map((w) => { let s = -1, from = 0; for (;;) { const k = r.text.indexOf(w.span, from); if (k < 0) break; if (!used.has(k)) { s = k; break; } from = k + 1; } if (s < 0) s = r.text.indexOf(w.span); used.add(s); return { w, s, ev: evOf(w) }; });
  G.sort((a, b) => a.s - b.s); let prev = "NONE";
  for (const g of G) {
    const { tokens } = FRONT.normalize(g.w.span, r.names || [], F), toks = tokens.map((t) => (t.startsWith("n_") ? "NAME" : t.startsWith("t_") ? "TEXT" : /^\d+$/.test(t) ? "NUM" : t));
    const world = worldOf(g.ev);
    const raw = FRONT.tokenize(g.w.span, r.names || [])[0].map((x) => x[0]).filter((t) => !/^[.,!?;:]$/.test(t)).map((t) => (t.startsWith("n_") ? "NAME" : t.startsWith("t_") ? "TEXT" : /^\d+$/.test(t) ? "NUM" : t));
    out.push({ dir: d.split("/").slice(-2).join("/"), id: r.id, text: r.text, span: g.w.span, toks, raw, verbless: !tokens.some((t) => verbs.has(t)), ev: g.ev, world, prev });
    prev = world;
  }
}
writeFileSync(OUT, JSON.stringify({ worlds: REG.worlds.map((w) => w.world).concat(["fallback"]), rows: out }));
console.error(out.length, "requests");
