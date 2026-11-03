// test_generated_stars.mjs: the generated stars of a vss-web-3 export equal the shipped stars.bin values, float64 for float64
// (training/sketch/shrink/SHRINK.md). For every world of the registry: docs/model/<model>/stars.bin read by loader.js starsTable, against
// <cand_dir>/<world>/ read by loader.js loadFiles (GeneratedStars): same keys, and every phase of every star identical (===).
//   node training/sketch/shrink/test_generated_stars.mjs <cand_dir>        exit 0 when all are identical
import { readFileSync } from "node:fs";
const REPO = new URL("../../../", import.meta.url).pathname;
const { loadFiles, starsTable } = await import(REPO + "docs/js/vss/loader.js");
const cand = process.argv[2]; if (!cand) throw new Error("usage: test_generated_stars.mjs <cand_dir>");
const reg = JSON.parse(readFileSync(REPO + "docs/model/micro/registry.json", "utf8"));
let bad = 0, nStars = 0;
for (const w of reg.worlds) {
  const name = w.model.split("/").pop(), shipped = REPO + "docs/model/" + w.model + "/", dir = cand.replace(/\/?$/, "/") + name + "/";
  const b = readFileSync(shipped + "stars.bin"), old = starsTable(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
  const rf = async (n) => { const x = readFileSync(dir + n); return n.endsWith(".json") ? x.toString("utf8") : x.buffer.slice(x.byteOffset, x.byteOffset + x.length); };
  const { manifest, stars } = await loadFiles(null, rf);
  if (manifest.format !== "vss-web-3") throw new Error(`${dir}: not a vss-web-3 export`);
  let diff = 0;
  if (stars.size !== old.size) { console.log(`${name}: ${stars.size} keys vs ${old.size}`); diff++; }
  for (const [k, ph] of old) {
    const g = stars.get(k); nStars++;
    if (!g || g.length !== ph.length) { diff++; continue; }
    for (let i = 0; i < ph.length; i++) if (g[i] !== ph[i]) { diff++; break; }
  }
  console.log(`${name}: ${old.size} stars, ${diff} differ`); bad += diff;
}
console.log(bad ? `FAIL: ${bad} stars differ` : `OK: all ${nStars} stars identical (float64 ===)`);
process.exit(bad ? 1 : 0);
