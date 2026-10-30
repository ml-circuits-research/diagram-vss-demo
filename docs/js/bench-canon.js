// bench-canon.js: the canonical form the benchmark compares. A wire's arguments become key -> lower-case string; a reference to a
// mention wire becomes "mention(k=v,...)" with the mention's own answers; a reference to a wire created in the same message becomes
// "$new". `scale` is not compared (how much bigger is a matter of taste, not of reading): the action already says resize.
const SKIP = new Set(["scale"]);
function one(v, byId) {
  if (v == null) return "?";
  if (typeof v === "object" && !Array.isArray(v) && typeof v.ref === "string") {
    const m = byId.get(v.ref);
    if (m && m.type === "mention") return ("mention(" + Object.keys(m.args).sort().map((k) => `${k}=${m.args[k]}`).join(",") + ")").toLowerCase();
    return "$new";
  }
  return String(v).toLowerCase();
}
export function canon(main, nodes) {
  const byId = new Map((nodes || []).map((n) => [n.id, n])), out = {};
  for (const [k, v] of Object.entries(main.args || {})) {
    if (SKIP.has(k)) continue;
    out[k] = Array.isArray(v) ? v.map((x) => one(x, byId)).join(",") : one(v, byId);
  }
  return out;
}
/** score one formalizer output against a row: { ok, per: {key: {got, want, ok}} }. A row with `wires` (a message of several clauses)
 *  is compared wire by wire, in order, on the non-mention wires; otherwise the last non-mention wire is the reading. */
export function score(nodes, row) {
  if (row.wires) {
    const mains = (nodes || []).filter((n) => n.type !== "mention"), per = {}; let ok = mains.length === row.wires.length;
    per._count = { got: String(mains.length), want: String(row.wires.length), ok: mains.length === row.wires.length };
    row.wires.forEach((w, i) => {
      const s = score1(mains[i] ? [...nodes.filter((n) => n.type === "mention"), mains[i]] : [], w, nodes);
      for (const [k, p] of Object.entries(s.per)) per[`${i + 1}.${k}`] = p;
      if (!s.ok) ok = false;
    });
    return { ok, per };
  }
  return score1(nodes, row, nodes);
}
function score1(nodes, row, all) {
  const main = [...(nodes || [])].reverse().find((n) => n.type !== "mention");
  const got = main ? canon(main, all || nodes) : {}, per = {};
  let ok = !!main && main.type === row.type;
  per._type = { got: main ? main.type : "∅", want: row.type, ok: !!main && main.type === row.type };
  for (const [k, want] of Object.entries(row.gold)) { const g = got[k] ?? "∅"; per[k] = { got: g, want, ok: g === want }; if (g !== want) ok = false; }
  return { ok, per };
}
if (typeof window !== "undefined") window.BenchCanon = { canon, score };
