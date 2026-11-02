// loadtime.mjs: bytes and load time of the worlds of a registry in node (docs/js/vss.js load: the files read from disk, the manifest's
// sha256 checked with crypto.subtle, the binaries decoded, the readers built), as the browser does after the download
// (training/sketch/shrink/SHRINK.md). Also the time to generate EVERY listed star of the generated-star worlds (the most a session can
// spend on star generation: the browser generates a star on its first use only).
//   node training/sketch/shrink/loadtime.mjs [<registry.json>]  [REPEAT=3]
import { readFileSync, readdirSync, statSync } from "node:fs";
const REPO = new URL("../../../", import.meta.url).pathname;
const { load } = await import(REPO + "docs/js/vss.js");
const reg = JSON.parse(readFileSync(process.argv[2] || REPO + "docs/model/micro/registry.json", "utf8"));
const MODELS = new URL("docs/model/", "file://" + REPO);
const REPEAT = +(process.env.REPEAT || 3);
const best = { load: Infinity, gen: Infinity }; let bytes = 0; const per = [];
for (let rep = 0; rep < REPEAT; rep++) {
  let tl = 0, tg = 0, nGen = 0; bytes = 0; per.length = 0;
  for (const w of reg.worlds) {
    const d = new URL(`${w.model}/`, MODELS), dir = d.pathname;
    const files = readdirSync(dir).filter((f) => f !== "BUILD.json"); const b = files.reduce((a, f) => a + statSync(dir + f).size, 0); bytes += b;
    const raw = Object.fromEntries(files.map((f) => [f, readFileSync(dir + f)]));
    const rf = async (n) => { const x = raw[n]; if (!x) throw new Error(`${dir}${n}: missing`); return n.endsWith(".json") ? x.toString("utf8") : x.buffer.slice(x.byteOffset, x.byteOffset + x.length); };
    const t0 = performance.now(), v = await load(null, { readFile: rf, sentenceCandidates: true }), t1 = performance.now(); tl += t1 - t0;
    const ex = v.stars.exported;
    if (ex && ex.keys instanceof Set) { const t2 = performance.now(); for (const k of ex.keys) ex.get(k); tg += performance.now() - t2; nGen += ex.keys.size; }
    per.push(`${w.model.split("/").pop()} ${(b / 1e6).toFixed(2)} MB ${(t1 - t0).toFixed(0)} ms`);
  }
  best.load = Math.min(best.load, tl); best.gen = Math.min(best.gen, nGen ? tg : 0); best.nGen = nGen;
}
console.log(`${process.argv[2] || "docs/model/micro/registry.json"}: ${reg.worlds.length} worlds, ${(bytes / 1e6).toFixed(2)} MB; load ${best.load.toFixed(0)} ms (best of ${REPEAT})` +
  (best.nGen ? `; generating all ${best.nGen} listed stars ${best.gen.toFixed(0)} ms` : "") + ` · rss ${Math.round(process.memoryUsage().rss / 1e6)} MB`);
console.log("  " + per.join(" · "));
