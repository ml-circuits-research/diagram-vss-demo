import { readFileSync } from "node:fs";
import { load } from "/home/claude/diagram-vss-demo/docs/js/vss.js";
import * as FRONT from "/home/claude/diagram-vss-demo/docs/js/front.js";
const dir = `/home/claude/diagram-vss-demo/docs/model/${process.env.MODEL || "fix_p80_s0"}/`;
const readFile = async (n) => { const b = readFileSync(dir + n); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true }), F = JSON.parse(await readFile("front.json"));
for (const t of process.argv.slice(2)) {
  const { tokens } = FRONT.normalize(t, [], F), r = vss.read(tokens.join(" "));
  console.log(JSON.stringify(t), tokens.join(" "), "|", r.status, r.frame.event, JSON.stringify(r.frame.roles), "unplaced", r.unplaced.join(","), "margins", JSON.stringify(r.margins).slice(0, 200));
}
