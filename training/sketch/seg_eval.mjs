// seg_eval.mjs: the two ways of cutting a message into requests, on held-out TRAINING messages (spans are the annotation):
// the learned BIO tagger (front.js segment) and the VSS reader's own cut by centres (vss-centers.js; vss-segment.js was the negative result). Exact-span F1 and time per message.
// MODEL=<model dir under docs/model> node seg_eval.mjs <dev.jsonl> [max messages]
import { readFileSync } from "node:fs";
import { load } from "../../docs/js/vss.js";
import * as FRONT from "../../docs/js/front.js";
import { vssSegment } from "../../docs/js/vss-segment.js";
import { vssCentres } from "../../docs/js/vss-centers.js";
const dir = new URL(`../../docs/model/${process.env.MODEL}/`, import.meta.url);
const readFile = async (n) => { const b = readFileSync(new URL(n, dir)); return n.endsWith(".json") ? b.toString("utf8") : b.buffer.slice(b.byteOffset, b.byteOffset + b.length); };
const vss = await load(null, { readFile, sentenceCandidates: true }), F = JSON.parse(await readFile("front.json"));
const rows = readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).slice(0, +(process.argv[3] || 1e9));
const tally = { tagger: [0, 0, 0, 0], centres: [0, 0, 0, 0] }, clean = (x) => x.trim().replace(/^[,\s]+|[,\s]+$/g, "");
for (const m of rows) {
  const gold = new Set(m.wires.map((w) => w.span).filter((s) => s && m.text.includes(s)).map(clean));
  for (const [k, fn] of [["tagger", () => FRONT.segment(m.text, m.names || [], F)], ["centres", () => vssCentres(m.text, m.names || [], F, vss)]]) {
    const t0 = performance.now(), p = new Set(fn().map(clean)), T = tally[k];
    T[3] += performance.now() - t0;
    for (const x of p) gold.has(x) ? T[0]++ : T[1]++;
    for (const x of gold) if (!p.has(x)) T[2]++;
  }
}
for (const [k, [tp, fp, fn, ms]] of Object.entries(tally)) console.log(`${k.padEnd(6)} exact-span F1 ${(2 * tp / (2 * tp + fp + fn)).toFixed(3)} (tp ${tp}, fp ${fp}, fn ${fn}) · ${(ms / rows.length).toFixed(0)} ms per message`);
