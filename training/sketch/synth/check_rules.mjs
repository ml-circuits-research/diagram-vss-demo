// check_rules.mjs: the Rules reader (docs/js/logic.js formalize, the demo's own cut) on every generated message, compared with the
// generator's gold. A message is KEPT only when the Rules give exactly the gold: the same number of requests, in order, each with the same
// wire type and the same arguments in the benchmark's canonical form (docs/js/bench-canon.js canon / canonWant: lower case, mentions
// written mention(k=v,...), a wire made earlier in the message "$new", the order-free keys of disconnect / connected / swap / check put in
// one order, `scale` not compared), no key more, no key less. Also checked: every span is a substring of the text and every trigger a
// substring of its span (generator bugs).
// Input: JSONL (one generated message per line: {id, names, groups?, text, wires, meta?}). Output: JSONL, one verdict per message:
//   {id, ok, cause, rules: [{type, args}], corrections, notes}   (cause: null when ok; else the first difference, in words; notes: the Rules' own notes)
//   node training/sketch/synth/check_rules.mjs <in.jsonl> <out.jsonl>
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const REPO = new URL("../../../", import.meta.url).pathname;
const K = require(process.env.LOGIC_JS || (REPO + "docs/js/logic.js"));   // LOGIC_JS: another copy of the Rules (gen_rules_cover.py pins the committed one)
const { canon, canonWant } = await import(REPO + "docs/js/bench-canon.js");
const [inp, out] = process.argv.slice(2);
if (!inp || !out) { console.error("usage: check_rules.mjs <in.jsonl> <out.jsonl>"); process.exit(2); }
const sys = K.createSystem();
const actOf = (type, a) => type === "command" ? `command:${a.action || "?"}` : type === "question" ? `question:${a.ask || "?"}` : type;
const res = [];
for (const line of readFileSync(inp, "utf8").split("\n")) {
  if (!line.trim()) continue;
  const m = JSON.parse(line);
  let cause = null;
  for (const w of m.wires) {
    if (!m.text.includes(w.span)) { cause = `generator: span not in text (${w.span})`; break; }
    if (!w.span.includes(w.trigger)) { cause = `generator: trigger not in span (${w.trigger})`; break; }
  }
  const ctx = { names: (m.names || []).slice(), last: [] };
  if (m.groups) ctx.groups = Object.keys(m.groups);
  const r = sys.formalize(m.text, ctx);
  const mains = r.nodes.filter((n) => n.type !== "mention");
  const got = mains.map((n) => ({ type: n.type, act: actOf(n.type, n.args), args: canon(n, r.nodes) }));
  const want = m.wires.map((w) => ({ type: w.type, act: actOf(w.type, w.args), args: canonWant(w.type, w.args) }));
  if (!cause && got.length !== want.length) cause = `requests: rules ${got.length}, gold ${want.length}`;
  if (!cause) for (let i = 0; i < want.length; i++) {
    const g = got[i], w = want[i], at = want.length > 1 ? `#${i + 1} ` : "";
    if (g.act !== w.act) { cause = `${at}act: gold ${w.act}, rules ${g.act}`; break; }
    const keys = [...new Set(Object.keys(g.args).concat(Object.keys(w.args)))].filter((k) => k !== "action" && k !== "ask");
    const miss = keys.filter((k) => !(k in g.args)), extra = keys.filter((k) => !(k in w.args)), diff = keys.filter((k) => k in g.args && k in w.args && g.args[k] !== w.args[k]);
    if (miss.length || extra.length || diff.length) {
      cause = `${at}${w.act}: ` + [miss.length ? `rules miss ${miss.join(",")}` : null, extra.length ? `rules add ${extra.map((k) => `${k}=${g.args[k]}`).join(",")}` : null,
        diff.length ? diff.map((k) => `${k}: gold ${w.args[k]}, rules ${g.args[k]}`).join("; ") : null].filter(Boolean).join("; ");
      break;
    }
  }
  res.push(JSON.stringify({ id: m.id, ok: !cause, cause, rules: got.map((g) => ({ type: g.type, args: g.args })), corrections: r.corrections || [], notes: (r.notes || []).filter((x) => !(r.corrections || []).includes(x)) }));
}
writeFileSync(out, res.join("\n") + "\n");
console.error(`check_rules: ${res.length} messages read`);
