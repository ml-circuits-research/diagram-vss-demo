// leniency.mjs: for each reader, the requests llm_score counts right, which of them carry keys the gold lacks (extra keys), and whether
// those keys make the editor (docs/js/logic.js) do something different from the gold. Two independent judgements:
//  static : the handler that runs the wire reads that key and the value is not the handler's own default (rules below, from logic.js)
//  dynamic: run gold-prefix + gold wire vs gold-prefix + (gold wire + the extra keys) in a fresh editor and compare state and answer
// Also: other leniencies inside "right" wires (resize direction, label / name case, $new identity).
// MODEL=comb1_p80_s0 node leniency.mjs <dev.jsonl> [out.json]
import { writeFileSync } from "node:fs";
import { readRows, loadVSS, vssFormalize, rulesFormalize, ctxOf, scorePairs, goldToNodes, splitTop, K, actOf } from "./audit_lib.mjs";
const [file, outp] = process.argv.slice(2), MODEL = process.env.MODEL || "comb1_p80_s0";
await loadVSS(MODEL);
const rows = readRows(file);

// ---- static: which keys each handler reads, and the values that are its default (logic.js line refs in AUDIT.md)
const REL = new Set(["leftOf", "rightOf", "above", "below", "near", "between"].map((x) => x.toLowerCase()));
const FILTERS = ["shape", "color", "size", "outline", "notColor", "notcolor", "label", "linked"];
function staticChanges(act, k, v, want, got) {
  const has = (x) => want[x] != null || got[x] != null, pos = (got.position || "").toLowerCase(), relPos = REL.has(pos);
  const isDefault = { "command:create": { shape: ["circle", "any"], color: ["white"], size: ["medium"], count: ["1", "0"] },
    "command:connect": { style: ["solid"], arrow: ["forward"] }, "command:align": { axis: ["horizontal"] }, "command:distribute": { axis: ["horizontal"] },
    "question:property": { property: ["color"] }, "question:extreme": { superlative: ["biggest"] }, "question:nearest": { superlative: ["closest"] },
    "command:undo": { count: ["1", "0"] }, "command:redo": { count: ["1", "0"] }, "command:duplicate": { count: ["1", "0"] } }[act] || {};
  if ((isDefault[k] || []).includes(v)) return false;
  if (k === "shape" && v === "any") return false;
  if (k === "kind" && v === "shape") return false;
  const reads = {
    "command:create": ["shape", "color", "size", "outline", "name", "label", "count", "position", "at", "linked"].concat(relPos ? ["anchor", "distance"] : []),
    "command:delete": ["target"],
    "command:move": ["target", "direction", "at"].concat(want.direction || got.direction ? ["distance"] : ["position"].concat(relPos ? ["anchor", "distance"] : [])),
    "command:set": ["target", "color", "shape", "label", "outline", "size"], "command:resize": ["target", "color", "shape", "label", "outline", "size"],
    "command:rename": ["target", "name"], "command:label": ["target", "label"],
    "command:duplicate": ["target", "count", "name", "color", "position"].concat(relPos ? ["anchor", "distance"] : []), "command:swap": ["target"],
    "command:connect": ["from", "to", "style", "arrow", "color", "pairing"].concat(got.pairing || (!got.to && String(got.from || "").includes(",")) ? [] : ["label"]),
    "command:disconnect": ["from", "to", "target", "quantifier"],
    "command:align": ["target", "axis"], "command:arrange": ["target", "layout"].concat(has("layout") ? [] : ["axis"]), "command:distribute": ["target", "axis"],
    "command:toFront": ["target"], "command:toBack": ["target"], "command:undo": ["count"], "command:redo": ["count"], "command:forget": [],
    "question:count": ["target", "kind", "position"].concat(FILTERS, relPos ? ["anchor"] : []), "question:list": ["target", "kind", "position"].concat(FILTERS, relPos ? ["anchor"] : []),
    "question:exists": ["target", "kind", "position"].concat(FILTERS, relPos ? ["anchor"] : []),
    "question:property": ["target", "property"], "question:check": ["target", "position", "comparison"].concat(FILTERS, relPos || got.comparison ? ["anchor"] : []),
    "question:describe": ["target"], "question:neighbors": ["target"], "question:connected": ["target", "anchor"], "question:degree": ["target"],
    "question:path": ["from", "to"].concat(has("to") ? [] : ["anchor"]), "question:reachable": ["from", "position"].concat(FILTERS, relPos ? ["anchor"] : []),
    "question:cycle": [], "question:rules": [],
    "question:extreme": ["target", "superlative", "position"].concat(FILTERS, relPos ? ["anchor"] : []),
    "question:nearest": ["anchor", "superlative"].concat(FILTERS, has("anchor") ? [] : ["target"]),
    "fact:": ["target", "color", "shape", "size", "outline", "label", "position", "linked"].concat(relPos ? ["anchor"] : []),
    "rule:": ["shape", "color", "size", "outline"]
  }[act];
  if (!reads) return true;
  // connect: an extra pairing chain / next on a list without `to` is the default branch (logic.js:567-570: next == chain)
  if (act === "command:connect" && k === "pairing" && (v === "chain" || v === "next") && !got.to && String(got.from || "").includes(",") && !want.pairing) return false;
  return reads.includes(k);
}

// ---- dynamic: run in the editor
const SH = ["circle", "rectangle", "diamond", "square", "triangle", "hexagon", "ellipse", "star"], CO = ["blue", "red", "green", "yellow", "gray", "orange", "purple", "teal"];
function freshWorld(names) {
  const S = K.createSystem();
  const init = names.map((nm, i) => ({ id: "c" + i, type: "command", args: { action: "create", name: nm, shape: SH[i % 8], color: CO[i % 8], size: ["small", "medium", "large"][i % 3] } }));
  // no edges up front: a pre-existing edge would turn a gold connect into "already exists" in both runs
  S.engine.run(init); return S;
}
const stateOf = (S, res) => { const st = S.world.state, last = res.steps[res.steps.length - 1];
  return JSON.stringify({ shapes: st.shapes.map((s) => [s.name, s.shape, s.color, s.size, s.label, s.outline, s.x, s.y]).sort(), order: st.shapes.map((s) => s.name), edges: st.edges.map((e) => [e.from, e.to, e.style, e.arrow, e.label, e.color]), rules: st.rules.map((r) => [r.shape, r.color, r.size]), answer: last && last.answer, value: last && last.value, err: last && last.error ? String(last.error.message) : null }); };
function dynamicChanges(row, j, extra, readerNodes, readerNode) {
  const { nodes } = goldToNodes(row), mainIdx = nodes.map((n, i) => [n, i]).filter(([n]) => n.type !== "mention").map(([, i]) => i)[j];
  const prefix = nodes.slice(0, mainIdx), gold = nodes[mainIdx], created = prefix.filter((n) => n.type !== "mention" && ["create", "duplicate"].includes(n.args.action)).map((n) => n.id);
  const add = [], args = Object.assign({}, gold.args); let mi = 0;
  const conv = (v) => { // a reader value -> executable in the gold world: its own mention (copied), a ref to a create -> the latest gold create
    if (Array.isArray(v)) return v.map(conv);
    if (v && typeof v === "object" && typeof v.ref === "string") { const m = readerNodes.find((n) => n.id === v.ref); if (m && m.type === "mention") { const id = "xm" + (++mi); add.push({ id, type: "mention", args: Object.assign({}, m.args) }); return { ref: id }; } return created.length ? { ref: created[created.length - 1] } : "NoSuchShape"; }
    return v;
  };
  for (const k of extra) { const raw = Object.keys(readerNode.args).find((x) => x.toLowerCase() === k.toLowerCase() || x === k); args[raw || k] = conv(readerNode.args[raw || k]); }
  const A = freshWorld(row.names || []), ra = A.engine.run(prefix.concat([gold]));
  const B = freshWorld(row.names || []), rb = B.engine.run(prefix.concat(add, [{ id: gold.id, type: gold.type, args }]));
  return stateOf(A, ra) !== stateOf(B, rb);
}

const readers = { rules: (r) => rulesFormalize(r.text, ctxOf(r)), vss_goldcut: (r) => vssFormalize(r.text, ctxOf(r), "gold"), vss_owncut: (r) => vssFormalize(r.text, ctxOf(r), "own") };
const report = { file, model: MODEL, readers: {} };
for (const [name, fn] of Object.entries(readers)) {
  let gold = 0, right = 0, withExtra = 0, chS = 0, chD = 0, chEither = 0, extraWires = 0, exact = 0, exactS = 0, dirOnly = 0;
  const keyHist = {}, chHist = {}, ex = [], disagree = [], other = { resizeDir: [], caseOnly: [], newAmbiguous: 0, newRight: 0 };
  for (const r of rows) {
    const nodes = fn(r), s = scorePairs(nodes, r); gold += s.nGold; extraWires += s.extraWires;
    let rightMsg = 0, rightMsgS = 0;
    for (const p of s.pairs) {
      if (!p.right) continue; right++; rightMsg++;
      const act = p.goldWire.type + ":" + (p.goldWire.args.action || p.goldWire.args.ask || "");
      let st = false, dy = false;
      if (p.extra.length) {
        withExtra++;
        const stK = p.extra.filter((k) => staticChanges(act, k, p.got[k], p.want, p.got));
        st = stK.length > 0; dy = dynamicChanges(r, p.j, p.extra, nodes, p.node);
        for (const k of p.extra) { const h = `${act} +${k}=${/mention|\$new|,/.test(p.got[k]) || ["target", "anchor", "from", "to", "name", "label"].includes(k) ? "<" + k + ">" : p.got[k]}`; keyHist[h] = (keyHist[h] || 0) + 1; }
        for (const k of stK) { const h = `${act} +${k}`; chHist[h] = (chHist[h] || 0) + 1; }
        if (st) chS++; if (dy) chD++; if (st || dy) chEither++;
        const e = { id: r.id, span: p.goldWire.span, gold: p.goldWire.args, extra: Object.fromEntries(p.extra.map((k) => [k, p.got[k]])), static: st, dynamic: dy };
        if (ex.length < 400) ex.push(e); if (st !== dy) disagree.push(e);
      }
      if (!st) rightMsgS++;
      // other leniencies inside a right wire
      // `scale` is skipped by canon (bench-canon.js:4); logic.js:506 makes a resize without scale or size grow by 1.5
      if (act === "command:resize" && !p.node.args.size) { const small = /\b(smaller|shrink|shrunk|tiny|reduce|less|down)\b/i.test(p.goldWire.span), sc = p.node.args.scale != null ? +p.node.args.scale : 1.5; const want = small ? 0.67 : 1.5; if (Math.sign(sc - 1) !== Math.sign(want - 1)) { other.resizeDir.push({ id: r.id, span: p.goldWire.span, scale: sc }); if (!st) dirOnly++; } }
      for (const k of ["label", "name"]) { const g = p.goldWire.args[k], v = p.node.args[k]; if (g != null && v != null && typeof v === "string" && v !== String(g) && v.toLowerCase() === String(g).toLowerCase()) other.caseOnly.push({ id: r.id, k, gold: g, got: v }); }
      if (Object.values(p.want).some((v) => v.includes("$new"))) { other.newRight++; const creates = r.wires.slice(0, p.j).filter((w) => ["create", "duplicate"].includes(w.args.action)).length; if (creates >= 2) other.newAmbiguous++; }
    }
    if (rightMsg === s.nGold && s.nMain === s.nGold) exact++;
    if (rightMsgS === s.nGold && s.nMain === s.nGold) exactS++;
  }
  const pc = (x) => (x / gold * 100).toFixed(1) + "%";
  report.readers[name] = { gold, right, rightPct: pc(right), withExtra, changesStatic: chS, changesDynamic: chD, changesEither: chEither, rescoredStatic: right - chS, rescoredStaticPct: pc(right - chS), rescoredEither: right - chEither, rescoredEitherPct: pc(right - chEither), resizeDirectionWrong: other.resizeDir.length, rescoredWithScale: right - chS - dirOnly, rescoredWithScalePct: pc(right - chS - dirOnly), extraWires, exactMessages: exact, exactMessagesStatic: exactS, keyHist: Object.fromEntries(Object.entries(keyHist).sort((a, b) => b[1] - a[1])), changeHist: Object.fromEntries(Object.entries(chHist).sort((a, b) => b[1] - a[1])), disagree, other, examples: ex };
  console.log(`\n== ${name} (${MODEL}): right ${right}/${gold} ${pc(right)}; right with extra keys ${withExtra}; extra keys that change execution: static ${chS}, dynamic ${chD}, either ${chEither}`);
  console.log(`   re-scored (static rule) ${right - chS}/${gold} ${pc(right - chS)}; (static or dynamic) ${right - chEither}/${gold} ${pc(right - chEither)}; messages exact ${exact} -> ${exactS}`);
  console.log(`   + resize grown/shrunk against the text (scale not compared): ${other.resizeDir.length} -> ${right - chS - dirOnly}/${gold} ${pc(right - chS - dirOnly)}`);
  console.log("   extra keys:", JSON.stringify(report.readers[name].keyHist));
  console.log("   changing (static):", JSON.stringify(report.readers[name].changeHist));
  console.log(`   static/dynamic disagree: ${disagree.length}; resize direction wrong: ${other.resizeDir.length}; label/name case only: ${other.caseOnly.length}; $new right ${other.newRight} of which >=2 creates before ${other.newAmbiguous}`);
}
if (outp) writeFileSync(outp, JSON.stringify(report, null, 1));
