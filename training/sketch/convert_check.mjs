// convert_check.mjs <in.jsonl> <out.jsonl>: the node half of convert_check.py. Per message (its gold wires and, per wire, the world row
// convert_check.py made of it), each row goes through the browser adapter (docs/js/vss-adapter.js toNodes) with the composer's reference
// rule between the requests of a message (vss-composer.js nextContext) and is compared with the gold in bench-canon form. One output line
// per gold request: {span, c, bad, got, want, lost}; c is ok | every shape | differs | no event token | no node | no world | no span | dropped.
import { readFileSync, writeFileSync } from "node:fs";
const R = new URL("../../", import.meta.url);
const { toNodes } = await import(new URL("docs/js/vss-adapter.js", R));
const { nextContext } = await import(new URL("docs/js/vss-composer.js", R));
const { canon, canonWant } = await import(new URL("docs/js/bench-canon.js", R));
const [fi, fo] = process.argv.slice(2);
const ENT = new Set(["target", "from", "to", "anchor", "anchor2", "linked"]);
const out = [];
for (const l of readFileSync(fi, "utf8").split("\n")) {
  if (!l.trim()) continue;
  const row = JSON.parse(l), c = { names: (row.names || []).slice(), last: [], refs: new Map() }, seq = { s: 0, m: 0 };
  row.wires.forEach((w, j) => {
    if (!w.type) return;
    const k = row.conv[j], rec = { span: w.span };
    if (!k || k.nospan) rec.c = "no span";
    else if (!k.world) rec.c = "no world";
    else if (!k.ok) { rec.c = "dropped"; rec.why = k.skip; }
    else {
      rec.lost = k.lost;
      const o = toNodes({ event: k.ev, roles: k.roles, verb: k.verb, tokens: k.toks, offered: {} }, k.info, { names: c.names, refs: c.refs, last: c.last }, seq);
      const main = o.nodes.find((x) => x.type !== "mention");
      if (!main) rec.c = "no node";
      else {
        const got = canon(main, o.nodes), want = canonWant(w.type, w.args);
        const bad = Object.keys(Object.assign({}, want, got)).filter((x) => (got[x] ?? "∅") !== (want[x] ?? "∅"));
        Object.assign(rec, { got, want, bad });
        if (bad.some((x) => ENT.has(x) && got[x] === "mention(quantifier=all)" && want[x] != null)) rec.c = "every shape";
        else if (bad.length) rec.c = "differs";
        else rec.c = k.verb ? "ok" : "no event token";
        nextContext(c, main);
      }
    }
    out.push(JSON.stringify(rec));
  });
}
writeFileSync(fo, out.join("\n") + (out.length ? "\n" : ""));
