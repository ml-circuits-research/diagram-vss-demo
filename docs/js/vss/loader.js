// loader.js — the files written by `sop export-web` (tool/sop/export_web.py): model.json, routebook.bin, stars.bin, manifest.json.
// Binary layout: 8 bytes "VSSBIN1\n", uint32 LE header length, UTF-8 JSON header, zero padding to 4, then the arrays at the header's
// offsets. Phase arrays: bits 8 (q * 2pi/256 - pi), bits 1, 2, 4 or 6 (2**bits levels, q * 2pi/2**bits - pi, packed as one little-endian bit
// stream: value i holds bits [i*bits, (i+1)*bits), so bits 4 is two values per byte, low nibble first) or 32 (float32); float arrays float32.
// Generated stars (manifest format vss-web-3, manifest.stars.source "generated"; training/sketch/shrink/SHRINK.md): no stars.bin; stars.json
// lists the keys stars.bin would hold and the bits. Each listed star is regenerated from its name (stars.js starV2Quantized: the portable
// star_version 2 phases quantized exactly as export_web.py quantizes them), byte for byte the stars.bin values, so every reader decision is
// the same; quantize "keys" (default) = only the listed keys are quantized (a word outside them gets float phases, as with stars.bin),
// "all" = every generated star is quantized (experiments).
// Sparse route book (export_web --sparse, manifest format vss-web-2): an array of kind "index" (uint32 LE) lists the flat row numbers a
// table stores; the table's entry names it ("rows"), its "shape" is the FULL shape and its data holds only those rows, in that order. Such
// a table comes back as {data (stored rows x D), shape (full), rowOf: Int32Array over the full rows, -1 = absent}; dense tables have no rowOf.
// A quantized phase array also carries its codes (one level per value; for bits 8 a view of the file's bytes) and deq (the phase of each
// level); its Float64 data is built on first access only (quantizedPhases below).

import { starV2Quantized, starV2Phases, starV2Codes } from "./stars.js";

const MAGIC = "VSSBIN1\n";

export function readBin(buf) {
  const u8 = new Uint8Array(buf), magic = new TextDecoder().decode(u8.subarray(0, 8));
  if (magic !== MAGIC) throw new Error("vss.js: not a vss binary (bad magic)");
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), n = dv.getUint32(8, true);
  const header = JSON.parse(new TextDecoder().decode(u8.subarray(12, 12 + n))), start = 12 + n + ((4 - ((12 + n) % 4)) % 4), arrays = {};
  const index = {};
  for (const a of header.arrays) if (a.kind === "index") index[a.name] = new Uint32Array(u8.slice(start + a.offset, start + a.offset + 4 * a.shape[0]).buffer);
  for (const a of header.arrays) {
    if (a.kind === "index") continue;
    const rows = a.rows ? index[a.rows] : null, D = a.shape[a.shape.length - 1];
    const count = rows ? rows.length * D : a.shape.reduce((x, y) => x * y, 1), o = start + a.offset;
    let entry;
    if (a.kind === "phase" && a.bits !== 32) entry = quantizedPhases(u8, o, count, a.bits, a.shape);
    else {
      const f = new Float32Array(u8.slice(o, o + 4 * count).buffer), data = new Float64Array(count); for (let i = 0; i < count; i++) data[i] = f[i];
      entry = { data, shape: a.shape };
    }
    arrays[a.name] = entry;
    if (rows) { const rowOf = new Int32Array(a.shape.slice(0, -1).reduce((x, y) => x * y, 1)).fill(-1); rows.forEach((r, i) => { rowOf[r] = i; }); entry.rowOf = rowOf; }
  }
  return { header, arrays };
}

/** a quantized phase array (bits 1, 2, 4, 6 or 8): {codes (Uint8Array, one level per value), deq (Float64Array of the 2**bits phases
 *  q * 2pi/2**bits - pi, the value of level q), shape, data}. data (Float64Array, deq[codes[i]]: the same doubles as computing
 *  q * step - pi per value) is built on first access only: the route book reads most phase arrays only through cos / sin tables
 *  (routebook.js tab), which it builds from codes and deq without data (2**bits cos / sin evaluations instead of one per value) */
function quantizedPhases(u8, o, count, bits, shape) {
  if (!(bits === 8 || bits === 4 || bits === 1 || bits === 2 || bits === 6)) throw new Error(`vss.js: bits ${bits}`);
  const L = 1 << bits, step = (2 * Math.PI) / L, deq = new Float64Array(L);
  for (let q = 0; q < L; q++) deq[q] = q * step - Math.PI;
  let codes;
  if (bits === 8) codes = u8.subarray(o, o + count);                 // a view: the file's bytes are the codes
  else if (bits === 4) { codes = new Uint8Array(count); for (let i = 0; i < count; i++) { const b = u8[o + (i >> 1)]; codes[i] = (i & 1) ? (b >> 4) : (b & 15); } }
  else {
    const B = bits, mask = L - 1; codes = new Uint8Array(count);
    for (let i = 0; i < count; i++) { const bit = i * B, k = o + (bit >> 3), sh = bit & 7, w = u8[k] | ((sh + B > 8 ? u8[k + 1] : 0) << 8); codes[i] = (w >> sh) & mask; }
  }
  return phaseEntry(codes, deq, shape);
}

/** the entry of a quantized phase array from its codes and level table */
export function phaseEntry(codes, deq, shape) {
  let data = null;
  return {
    codes, deq, shape,
    get data() { if (!data) { const n = codes.length; data = new Float64Array(n); for (let i = 0; i < n; i++) data[i] = deq[codes[i]]; } return data; },
  };
}

/** generated stars (stars.json of a vss-web-3 export) as a Map-like table: has(key), get(key) -> Float64Array of phases, computed on first
 *  use (nothing is generated at load). The key -> (seed, name) rule is export_web.star_keys': "marker" = op:marker under the world seed,
 *  id: and sym: under the catalog's star seed, role: and op: under the world seed */
export class GeneratedStars {
  constructor(spec, seed, starSeed) {
    if (spec.star_version !== 2) throw new Error(`vss.js: generated stars need star_version 2 (got ${spec.star_version})`);
    this.D = spec.D; this.bits = spec.bits; this.seed = seed; this.starSeed = starSeed; this.keys = new Set(spec.keys);
    this.quantizeAll = spec.quantize === "all" && spec.bits <= 8;     // bits 32: the float phases (experiments)
  }
  has(key) { return this.keys.has(key); }
  get size() { return this.keys.size; }
  _seedName(key) { return key === "marker" ? [this.seed, "op:marker"] : (key.startsWith("id:") || key.startsWith("sym:")) ? [this.starSeed, key] : [this.seed, key]; }
  get(key) {
    if (!this.keys.has(key)) return undefined;
    const [seed, name] = this._seedName(key);
    return this.bits === 32 ? starV2Phases(seed, name, this.D) : starV2Quantized(seed, name, this.D, this.bits);
  }
  /** the levels (Uint8Array) of a listed quantized star, null when the key is not listed or the stars are float (bits 32); stars.js builds
   *  the star from them with a table of the 2**bits levels' cos / sin, the same values as from get(key)'s phases */
  codes(key) {
    if (this.bits === 32 || !this.keys.has(key)) return null;
    const [seed, name] = this._seedName(key);
    return starV2Codes(seed, name, this.D, this.bits);
  }
}

/** the stars of stars.bin as a Map key -> Float64Array of phases */
export function starsTable(starsBin) {
  const { header, arrays } = readBin(starsBin), M = arrays.stars, D = header.D, out = new Map();
  header.keys.forEach((k, i) => out.set(k, M.data.subarray(i * D, (i + 1) * D)));
  return out;
}

async function sha256Hex(buf) {
  if (!globalThis.crypto || !globalThis.crypto.subtle) return null;
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", buf)); return [...h].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** fetch the four files from a base URL (browser) or read them with `readFile(name) -> ArrayBuffer|string` (node); checks the manifest.
 *  opts.verified(name) -> true: that file's sha256 was already checked against this manifest (the demo's persistent cache stores a file
 *  only after it passed), so it is not hashed again */
export async function loadFiles(base, readFile, opts = {}) {
  const get = readFile || (async (name) => { const r = await fetch(new URL(name, base)); if (!r.ok) throw new Error(`vss.js: ${name}: HTTP ${r.status}`); return name.endsWith(".json") ? r.text() : r.arrayBuffer(); });
  // the three files the manifest does not name are fetched together; the stars file once the manifest says which it is
  const mP = get("model.json"), rP = get("routebook.bin"); mP.catch(() => {}); rP.catch(() => {});
  const manifest = JSON.parse(await get("manifest.json"));
  const gen = manifest.stars && manifest.stars.source === "generated";      // vss-web-3: stars.json (keys) instead of stars.bin
  if (manifest.stars && !gen) throw new Error(`vss.js: stars source ${JSON.stringify(manifest.stars.source)}`);
  const stName = gen ? manifest.stars.file || "stars.json" : "stars.bin";
  const [modelText, rbBuf, stRaw] = await Promise.all([mP, rP, get(stName)]);
  const done = opts.verified || (() => false);
  const hashes = await Promise.all([["model.json", modelText], ["routebook.bin", rbBuf], [stName, stRaw]].filter(([fn]) => !done(fn))
    .map(async ([fn, x]) => [fn, await sha256Hex(typeof x === "string" ? new TextEncoder().encode(x) : x)]));
  for (const [fn, h] of hashes) if (h !== null && h !== manifest.files[fn].sha256) throw new Error(`vss.js: ${fn} does not match manifest.json (sha256)`);
  const model = JSON.parse(modelText);
  if (model.legend_sha256 !== manifest.legend_sha256) throw new Error("vss.js: legend hash of model.json differs from manifest.json");
  const stars = gen ? new GeneratedStars(JSON.parse(stRaw), model.config.seed, model.catalog.star_seed) : starsTable(stRaw);
  return { manifest, model, routebook: readBin(rbBuf), stars };
}
