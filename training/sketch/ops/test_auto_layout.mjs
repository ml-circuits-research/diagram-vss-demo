// test_auto_layout.mjs: docs/js/auto-layout.js (design: training/sketch/ops/HIGH_LEVEL_OPS.md).
// Every layout on small and edge-case diagrams (empty, one shape, loops, several parts, groups, a selection among other shapes), no
// overlaps, inside the canvas, deterministic, `improve` never lowers the score, a tree is laid out as a tree, the operations on the current
// positions (align, spacing, snap, flip, fit, sort, cluster, equalize, straighten, untangle), and the time on 200 shapes.
// Run: node training/sketch/ops/test_auto_layout.mjs   (exit code 1 on a failure)
import { createRequire } from "node:module";
const AL = createRequire(import.meta.url)("../../../docs/js/auto-layout.js");

let fail = 0, n = 0;
const ok = (name, cond, detail) => { n++; if (!cond) fail++; if (!cond || process.env.VERBOSE) console.log(`${cond ? "ok  " : "FAIL"} ${name}${cond || detail == null ? "" : "\n     " + (typeof detail === "string" ? detail : JSON.stringify(detail))}`); };
const CANVAS = { x: 0, y: 0, w: 800, h: 500 };
const S = (name, x, y, o = {}) => Object.assign({ name, x, y, w: o.w || 62, h: o.h || 62, color: o.color || "white", shape: o.shape || "circle", size: o.size || 62 }, o);
const L = (from, to, arrow) => (arrow ? { from, to, arrow } : { from, to });
const at = (shapes, res) => AL.apply(shapes, res);
const overlaps = (shapes) => { const out = []; for (let i = 0; i < shapes.length; i++) for (let j = i + 1; j < shapes.length; j++) { const p = shapes[i], q = shapes[j]; if (Math.abs(p.x - q.x) < (p.w + q.w) / 2 && Math.abs(p.y - q.y) < (p.h + q.h) / 2) out.push([p.name, q.name]); } return out; };
const outside = (shapes, c = CANVAS) => shapes.filter((s) => s.x - s.w / 2 < c.x || s.y - s.h / 2 < c.y || s.x + s.w / 2 > c.x + c.w || s.y + s.h / 2 > c.y + c.h).map((s) => s.name);
const throwsCode = (fn) => { try { fn(); return null; } catch (e) { return e.name === "LayoutError" ? e.code + (e.ask ? "+ask" : "") : "OTHER " + e.message; } };
let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };   // deterministic test data

// ---------- fixtures ----------
const tree7 = () => ({ shapes: [S("Ceo", 400, 60), S("Cto", 200, 300), S("Cfo", 600, 200), S("Dev", 100, 420), S("Qa", 300, 100), S("Acc", 700, 400), S("Ops", 520, 440)],
  links: [L("Ceo", "Cto"), L("Ceo", "Cfo"), L("Cto", "Dev"), L("Cto", "Qa"), L("Cfo", "Acc"), L("Cfo", "Ops")] });
const dag = () => ({ shapes: [S("A", 100, 100), S("B", 300, 300), S("C", 500, 120), S("D", 650, 400), S("E", 200, 420)], links: [L("A", "B"), L("A", "C"), L("B", "D"), L("C", "D"), L("D", "E")] });
const cycle = () => ({ shapes: [S("P", 100, 100), S("Q", 600, 120), S("R", 580, 400), S("T", 120, 380)], links: [L("P", "Q"), L("Q", "R"), L("R", "T"), L("T", "P")] });
const parts = () => ({ shapes: [S("R1", 100, 100), S("K1", 150, 300), S("K2", 250, 300), S("R2", 600, 100), S("K3", 600, 300), S("Lone", 700, 450)], links: [L("R1", "K1"), L("R1", "K2"), L("R2", "K3")] });
const nolinks = () => ({ shapes: [S("A", 100, 100), S("B", 140, 120), S("C", 400, 300), S("D", 700, 50), S("E", 420, 310)], links: [] });
const undirected = () => ({ shapes: [S("H", 400, 250), S("X1", 100, 100), S("X2", 700, 100), S("X3", 400, 450)], links: [L("H", "X1", "none"), L("X2", "H", "none"), L("H", "X3", "both")] });
const mixedSizes = () => ({ shapes: [S("Big", 100, 100, { w: 160, h: 100 }), S("Small", 120, 110, { w: 30, h: 30 }), S("Wide", 300, 300, { w: 190, h: 62 }), S("Tall", 310, 320, { w: 62, h: 120 })], links: [L("Big", "Small"), L("Big", "Wide"), L("Wide", "Tall")] });
function bigTree(nn) { const shapes = [], links = []; for (let i = 0; i < nn; i++) { shapes.push(S("N" + i, Math.round(rnd() * 780 + 10), Math.round(rnd() * 480 + 10), { w: 40, h: 30 })); if (i) links.push(L("N" + Math.floor((i - 1) / 3), "N" + i)); } return { shapes, links }; }
function randomGraph(nn, mm) { const shapes = [], links = []; for (let i = 0; i < nn; i++) shapes.push(S("V" + i, Math.round(rnd() * 700 + 50), Math.round(rnd() * 400 + 50), { w: 50 + Math.round(rnd() * 40), h: 40 + Math.round(rnd() * 30), color: ["red", "blue", "green"][i % 3] })); const seen = new Set(); for (let k = 0; k < mm; k++) { const a = Math.floor(rnd() * nn), b = Math.floor(rnd() * nn); if (a === b || seen.has(a + ">" + b)) continue; seen.add(a + ">" + b); links.push(L("V" + a, "V" + b, rnd() < 0.2 ? "none" : undefined)); } return { shapes, links }; }

// ---------- 1. every layout on every fixture: no overlaps, inside the canvas, deterministic, or the expected question ----------
const FIX = { tree7, dag, cycle, parts, nolinks, undirected, mixedSizes };
const EXPECT_ERR = { tree: { dag: "not-a-tree+ask", cycle: "not-a-tree+ask", nolinks: "no-links+ask" }, layers: { nolinks: "no-links+ask" }, radial: { nolinks: "no-links+ask" } };
for (const kind of AL.LAYOUTS) for (const [fname, mk] of Object.entries(FIX)) {
  const { shapes, links } = mk(), want = (EXPECT_ERR[kind] || {})[fname];
  if (want) { ok(`${kind} on ${fname}: asks (${want})`, throwsCode(() => AL.layout(kind, shapes, links, { canvas: CANVAS })) === want, throwsCode(() => AL.layout(kind, shapes, links, { canvas: CANVAS }))); continue; }
  let r; try { r = AL.layout(kind, shapes, links, { canvas: CANVAS }); } catch (e) { ok(`${kind} on ${fname}: runs`, false, e.message); continue; }
  const after = at(shapes, r);
  ok(`${kind} on ${fname}: no overlaps`, overlaps(after).length === 0, overlaps(after));
  ok(`${kind} on ${fname}: inside the canvas`, outside(after).length === 0 && !r.crowded, { outside: outside(after), crowded: r.crowded });
  const r2 = AL.layout(kind, mk().shapes, mk().links, { canvas: CANVAS });
  ok(`${kind} on ${fname}: deterministic`, JSON.stringify(r2.positions) === JSON.stringify(r.positions));
}

// ---------- 2. edge cases ----------
for (const kind of AL.LAYOUTS) ok(`${kind} on an empty canvas: 'empty'`, throwsCode(() => AL.layout(kind, [], [], { canvas: CANVAS })) === "empty");
for (const kind of ["row", "column", "grid", "circle", "organic", "auto"]) {
  const r = AL.layout(kind, [S("Solo", 30, 30)], [], { canvas: CANVAS });
  ok(`${kind} on one shape: centred on the canvas`, r.positions.Solo.x === 400 && r.positions.Solo.y === 257, r.positions.Solo);
}
ok("tree on one shape: 'no-links' (asks)", throwsCode(() => AL.layout("tree", [S("Solo", 30, 30)], [], {})) === "no-links+ask");
ok("unknown layout", throwsCode(() => AL.layout("spiral", tree7().shapes, [], {})) === "unknown-layout");
ok("unknown root", throwsCode(() => AL.layout("tree", tree7().shapes, tree7().links, { root: "Nobody" })) === "unknown-root");
ok("unknown target", throwsCode(() => AL.layout("grid", tree7().shapes, [], { targets: ["Nobody"] })) === "unknown-shape");
{ const { shapes, links } = cycle(); let msg = ""; try { AL.layout("tree", shapes, links, {}); } catch (e) { msg = e.message; }
  ok("tree on a loop: the message names the loop and offers layers", /P → Q → R → T → P/.test(msg) && /layers/.test(msg), msg); }
{ const { shapes, links } = dag(); let msg = ""; try { AL.layout("tree", shapes, links, {}); } catch (e) { msg = e.message; }
  ok("tree on a diamond: the message names the shape with two parents", /D has 2 arrows coming in/.test(msg), msg); }
{ const a = AL.analyse(dag().shapes, dag().links); ok("analyse(dag): a DAG, not a tree, D has two parents", a.isDAG && !a.isTree && a.multiParent[0].name === "D", a); }
{ const a = AL.analyse(cycle().shapes, cycle().links); ok("analyse(cycle): the loop", !a.isDAG && a.cycle.join(",") === "P,Q,R,T", a); }
{ const a = AL.analyse(parts().shapes, parts().links); ok("analyse(parts): 3 components, a forest, Lone isolated", a.components === 3 && a.isTree && a.isolated.join() === "Lone", a); }

// ---------- 3. a tree is laid out as a tree ----------
for (const dir of ["down", "up", "right", "left"]) {
  const { shapes, links } = tree7(), r = AL.layout("tree", shapes, links, { direction: dir }), p = r.positions;
  const depthOf = (s) => (dir === "down" ? p[s].y : dir === "up" ? -p[s].y : dir === "right" ? p[s].x : -p[s].x);
  const crossOf = (s) => (dir === "down" || dir === "up" ? p[s].x : p[s].y);
  ok(`tree ${dir}: every child is one level past its parent`, links.every((l) => depthOf(l.to) > depthOf(l.from)));
  ok(`tree ${dir}: siblings on one level`, depthOf("Cto") === depthOf("Cfo") && depthOf("Dev") === depthOf("Qa") && depthOf("Qa") === depthOf("Acc"));
  ok(`tree ${dir}: a parent is centred over its children`, ["Ceo", "Cto", "Cfo"].every((par) => { const ks = links.filter((l) => l.from === par).map((l) => crossOf(l.to)); return Math.abs(crossOf(par) - (Math.min(...ks) + Math.max(...ks)) / 2) <= 1; }));
  ok(`tree ${dir}: no crossings`, AL.score(at(shapes, r), links).metrics.crossings === 0);
  ok(`tree ${dir}: children keep their current order (Dev left of Qa: current x 100 < 300)`, dir === "left" || dir === "right" ? true : crossOf("Dev") < crossOf("Qa"));
}
{ const { shapes, links } = tree7(), r = AL.layout("tree", shapes, links, { root: "Cto" }), p = r.positions;
  ok("tree with root Cto: Cto on top, Ceo below it", p.Cto.y < p.Ceo.y && p.Cto.y < p.Dev.y, p); }
{ const { shapes, links } = parts(), r = AL.layout("tree", shapes, links, {}), p = r.positions;
  ok("tree on a forest: both roots on the top level, the lone shape too", p.R1.y === p.R2.y && p.K1.y > p.R1.y && p.K3.y > p.R2.y, p);
  ok("tree on a forest: the trees side by side in their current order (R1 left of R2)", p.R1.x < p.R2.x, p); }
{ const { shapes, links } = undirected(), r = AL.layout("tree", shapes, links, {}); ok("tree on plain lines: a root is chosen, no overlap", overlaps(at(shapes, r)).length === 0 && r.roots.length === 1, r); }

// ---------- 4. layers follow the arrows ----------
for (const dir of ["down", "right"]) {
  const { shapes, links } = dag(), r = AL.layout("layers", shapes, links, { direction: dir }), p = r.positions;
  ok(`layers ${dir}: every arrow of a DAG points ${dir}`, links.every((l) => (dir === "down" ? p[l.to].y > p[l.from].y : p[l.to].x > p[l.from].x)), p);
}
{ const { shapes, links } = cycle(), r = AL.layout("layers", shapes, links, {}), p = r.positions;
  ok("layers on a loop: one arrow points back, the note says so", links.filter((l) => p[l.to].y < p[l.from].y).length === 1 && r.notes.some((x) => /back/.test(x)), r); }

{ const { shapes, links } = dag(), r = AL.layout("layers", shapes, links, { direction: "right", root: "B" }), p = r.positions;
  ok("layers starting from B: B is in the first layer (leftmost)", Object.keys(p).every((k) => k === "B" || p[k].x >= p.B.x), p); }

// ---------- 5. selections, obstacles and groups ----------
{ const { shapes, links } = nolinks(), r = AL.layout("row", shapes, links, { targets: ["A", "B", "E"] }), after = at(shapes, r);
  ok("row of a selection: the others do not move", ["C", "D"].every((x) => !r.positions[x] && !r.moved.includes(x)));
  ok("row of a selection: on one line, no overlap with the others", r.positions.A.y === r.positions.B.y && r.positions.B.y === r.positions.E.y && overlaps(after).length === 0, { pos: r.positions, ov: overlaps(after) }); }
{ const shapes = [S("A", 100, 100), S("B", 200, 100), S("C", 150, 200), S("X", 600, 300), S("Y", 650, 400), S("Z", 500, 420)], links = [L("A", "X"), L("X", "Y"), L("X", "Z")];
  const groups = [{ name: "Trio", members: ["A", "B", "C"] }], r = AL.layout("tree", shapes, links, { groups }), p = r.positions;
  ok("a group moves as one block (members keep their offsets)", p.B.x - p.A.x === 100 && p.B.y - p.A.y === 0 && p.C.x - p.A.x === 50 && p.C.y - p.A.y === 100, p);
  ok("  ... and the block is the tree's root (above X)", p.A.y < p.X.y, p);
  const r2 = AL.layout("row", shapes, links, { groups, targets: ["A", "B", "C"] });
  ok("a group arranged on its own is laid out (not kept as a block)", r2.positions.A.y === r2.positions.C.y, r2.positions); }

// ---------- 6. the quality score ----------
{ const s = AL.score([S("A", 100, 100), S("B", 120, 100)], []); ok("score: an overlap is counted", s.metrics.overlaps === 1 && s.score < 90, s); }
{ const s = AL.score([S("A", 100, 100), S("B", 300, 300), S("C", 300, 100), S("D", 100, 300)], [L("A", "B"), L("C", "D")]); ok("score: a crossing is counted", s.metrics.crossings === 1, s); }
{ const s = AL.score([S("A", 100, 100), S("M", 300, 100), S("B", 500, 100)], [L("A", "B")]); ok("score: a link through a shape is counted", s.metrics.through === 1, s); }
{ const s = AL.score([S("A", 10, 10), S("B", 300, 300)], []); ok("score: a shape off the canvas is counted", s.metrics.outside === 1, s); }
{ const s = AL.score([], []); ok("score: an empty canvas scores 100", s.score === 100, s); }

// ---------- 7. improve never lowers the score; a clean diagram is left alone ----------
let worse = 0, changedNoGain = 0, runs = 0, improved = 0;
const fixtures = Object.values(FIX).map((f) => f());
for (let k = 0; k < 40; k++) fixtures.push(randomGraph(4 + (k % 12), k % 5 === 0 ? 0 : 3 + (k % 14)));
for (const { shapes, links } of fixtures) {
  runs++; const r = AL.improve(shapes, links, {}), s0 = AL.score(shapes, links).score, s1 = AL.score(at(shapes, r), links).score;
  if (s1 < s0) worse++; if (r.changed && s1 <= s0) changedNoGain++; if (s1 > s0) improved++;
  const r2 = AL.improve(shapes, links, {}); if (JSON.stringify(r2.positions) !== JSON.stringify(r.positions)) { ok("improve deterministic", false); }
}
ok(`improve never lowers the score (${runs} diagrams, ${improved} improved)`, worse === 0, { worse });
ok("improve changes something only when the score rises", changedNoGain === 0, { changedNoGain });
{ const r = AL.layout("grid", nolinks().shapes, [], {}), clean = at(nolinks().shapes, r), imp = AL.improve(clean, [], {});
  ok("improve on a clean grid: nothing to do, and it says so", !imp.changed && /left it as it is/.test(imp.message), imp.message); }
{ const { shapes, links } = tree7(), imp = AL.improve(shapes, links, {}); ok("improve on a messy tree: picks the tree layout", imp.chosen === "tree" && imp.changed, { chosen: imp.chosen, cands: imp.candidates, msg: imp.message }); }
{ const { shapes, links } = dag(), imp = AL.improve(shapes, links, {}); ok("improve on a messy DAG: picks layers or something at least as good", imp.changed && imp.after.score >= imp.before.score, { chosen: imp.chosen, cands: imp.candidates }); }
{ const shapes = [S("A", 100, 100), S("B", 110, 105), S("C", 600, 300)], imp = AL.improve(shapes, [], {}); ok("improve with overlaps: they are gone", overlaps(at(shapes, imp)).length === 0 && imp.after.metrics.overlaps === 0, imp.message); }
ok("improve on an empty canvas: 'empty'", throwsCode(() => AL.improve([], [], {})) === "empty");

// ---------- 8. operations on the current positions ----------
{ const shapes = [S("A", 100, 100, { w: 80 }), S("B", 300, 200, { w: 40 }), S("C", 200, 400)], r = AL.align(shapes, [], { direction: "left" }), a = at(shapes, r);
  ok("align left: the left edges are flush", new Set(a.map((s) => s.x - s.w / 2)).size === 1, a); }
{ const shapes = [S("A", 100, 100), S("B", 300, 200), S("C", 200, 400)], r = AL.align(shapes, [], { direction: "down" }), a = at(shapes, r);
  ok("align bottom: the bottom edges are flush, no overlap", new Set(a.map((s) => s.y + s.h / 2)).size === 1 && overlaps(a).length === 0, a); }
{ const shapes = [S("A", 100, 100), S("B", 120, 200)], r = AL.align(shapes, [], { axis: "horizontal" }), a = at(shapes, r);
  ok("align on one line: shapes that would overlap are pushed apart along it", a[0].y === a[1].y && overlaps(a).length === 0, a); }
ok("align one shape: 'too-few'", throwsCode(() => AL.align([S("A", 1, 1)], [], {})) === "too-few");
{ const shapes = [S("A", 300, 200), S("B", 400, 200), S("C", 350, 300)], r = AL.spacing(shapes, [], { scale: 2 }), a = at(shapes, r);
  ok("spacing x2: twice as far apart, centre kept", a[1].x - a[0].x === 200 && Math.round((a[0].x + a[1].x) / 2) === 350, a); }
{ const shapes = [S("A", 300, 200), S("B", 400, 200), S("C", 350, 300)], r = AL.spacing(shapes, [], { scale: 0.3 }), a = at(shapes, r);
  ok("spacing x0.3: closer, but never overlapping", overlaps(a).length === 0 && a[1].x - a[0].x < 100, a); }
{ const shapes = [S("A", 100, 250), S("B", 400, 250), S("C", 700, 250)], r = AL.spacing(shapes, [], { scale: 3 }), a = at(shapes, r);
  ok("spacing beyond the canvas: kept inside", outside(a).length === 0, a); }
{ const shapes = [S("A", 103, 97), S("B", 211, 188), S("C", 115, 105)], r = AL.snap(shapes, [], {}), a = at(shapes, r);
  ok("snap: every centre on the 20 px grid, no overlap", a.every((s) => s.x % 20 === 0 && s.y % 20 === 0) && overlaps(a).length === 0, a); }
{ const shapes = [S("A", 100, 100), S("B", 300, 150), S("C", 250, 400)], r = AL.flip(shapes, [], {}), a = at(shapes, r), r2 = AL.flip(a, [], {}), b = at(a, r2);
  ok("flip horizontal: left and right swap; twice = back", a[0].x === 300 && a[1].x === 100 && JSON.stringify(b.map((s) => [s.x, s.y])) === JSON.stringify(shapes.map((s) => [s.x, s.y])), { a, b }); }
{ const shapes = [S("A", 100, 100), S("B", 300, 150)], a = at(shapes, AL.flip(shapes, [], { axis: "vertical" })); ok("flip vertical: top and bottom swap", a[0].y === 150 && a[1].y === 100, a); }
{ const shapes = [S("A", -200, 100), S("B", 900, 700)], r = AL.fit(shapes, [], {}), a = at(shapes, r); ok("fit: everything inside the canvas", outside(a).length === 0, a); }
{ const shapes = [S("A", 100, 100), S("B", 200, 100)], r = AL.fit(shapes, [], { center: true }), a = at(shapes, r); ok("fit centred: the drawing's centre is the canvas centre", (a[0].x + a[1].x) / 2 === 400, a); }
{ const shapes = [S("Cherry", 100, 100), S("apple", 250, 100), S("Banana", 400, 100), S("date2", 550, 100), S("date10", 700, 100)], r = AL.sort(shapes, [], { property: "name" });
  const ord = AL.readingOrderNames(at(shapes, r)); ok("sort by name: the places in reading order hold the names in order (natural, case-free)", ord.join() === "apple,Banana,Cherry,date2,date10", ord); }
{ const shapes = [S("A", 100, 100, { color: "blue" }), S("B", 250, 100, { color: "red" }), S("C", 400, 100, { color: "green" })], r = AL.sort(shapes, [], { property: "color" });
  ok("sort by colour: palette order (red, green, blue)", AL.readingOrderNames(at(shapes, r)).join() === "B,C,A"); }
{ const shapes = [S("A", 100, 100, { size: 30, w: 30, h: 30 }), S("B", 250, 100, { size: 88, w: 88, h: 88 }), S("C", 400, 100)], r = AL.sort(shapes, [], { property: "size", descending: true, layout: "row" });
  ok("sort by size, biggest first, in a row", AL.readingOrderNames(at(shapes, r)).join() === "B,C,A" && overlaps(at(shapes, r)).length === 0); }
{ const shapes = [S("A", 100, 100, { color: "red" }), S("B", 700, 400, { color: "blue" }), S("C", 400, 50, { color: "red" }), S("D", 120, 420, { color: "blue" }), S("E", 650, 90, { color: "red" })];
  const r = AL.cluster(shapes, [], { property: "color" }), a = at(shapes, r), red = a.filter((s) => s.color === "red"), blue = a.filter((s) => s.color === "blue");
  const gap = (p, q) => Math.max(Math.abs(p.x - q.x) - (p.w + q.w) / 2, Math.abs(p.y - q.y) - (p.h + q.h) / 2);
  const within = Math.max(...[red, blue].flatMap((g) => g.flatMap((p) => g.filter((q) => q !== p).map((q) => gap(p, q))))), between = Math.min(...red.flatMap((p) => blue.map((q) => gap(p, q))));
  ok("cluster by colour: two blocks, the gap between blocks larger than inside them", r.clusters.join() === "red,blue" && between > within && overlaps(a).length === 0, { within, between }); }
{ const shapes = [S("A", 100, 100, { size: 44 }), S("B", 300, 100, { size: 62 }), S("C", 500, 100, { size: 62 })], r = AL.equalize(shapes, [], { property: "size" });
  ok("equalize size: the most common size; only A changes", r.value === 62 && JSON.stringify(r.props) === '{"A":{"size":62}}', r); }
{ const shapes = [S("A", 100, 100, { color: "red" }), S("B", 300, 100, { color: "blue" })], r = AL.equalize(shapes, [], { property: "color", like: "B" });
  ok("equalize colour like B", JSON.stringify(r.props) === '{"A":{"color":"blue"}}', r); }
{ const shapes = [S("A", 100, 100), S("B", 112, 300), S("C", 400, 108)], links = [L("A", "B"), L("A", "C")], r = AL.straighten(shapes, links, {}), a = at(shapes, r);
  ok("straighten: nearly vertical and nearly horizontal links become straight", a[1].x === 100 && a[2].y === 100 && r.straightened === 2, a); }
{ const shapes = [S("A", 100, 100), S("B", 400, 300)], r = AL.straighten(shapes, [L("A", "B")], {}); ok("straighten a diagonal link: nothing moves, the note says so", !r.moved.length && /nothing to straighten/.test(r.notes.join()), r); }
{ const shapes = [S("A", 100, 100), S("B", 300, 100), S("C", 100, 300), S("D", 300, 300)], links = [L("A", "D"), L("B", "C")], r = AL.untangle(shapes, links, {});
  ok("untangle: the crossing is gone", AL.score(at(shapes, r), links).metrics.crossings === 0 && r.swaps >= 1, r); }
{ const { shapes, links } = randomGraph(30, 45), c0 = AL.score(shapes, links).metrics.crossings, r = AL.untangle(shapes, links, {}), c1 = AL.score(at(shapes, r), links).metrics.crossings;
  ok(`untangle a random graph: crossings ${c0} -> ${c1}, not more`, c1 <= c0); }
{ const shapes = [S("A", 100, 100), S("B", 105, 100), S("C", 300, 300)], r = AL.separate(shapes, [], {}); ok("separate: the overlap is gone, C did not move", overlaps(at(shapes, r)).length === 0 && !r.moved.includes("C"), r); }

// ---------- 9. 200 shapes: time and quality ----------
{
  seed = 777; const T = bigTree(200), G = randomGraph(200, 260), times = {};
  for (const kind of AL.LAYOUTS) {
    const fx = kind === "tree" ? T : G; const t0 = performance.now(); let r;
    try { r = AL.layout(kind, fx.shapes, fx.links, {}); } catch (e) { r = { err: e.code }; }
    times[kind] = Math.round(performance.now() - t0);
    ok(`${kind} on 200 shapes: under 1500 ms (${times[kind]} ms)`, times[kind] < 1500);
    if (r.positions) ok(`${kind} on 200 shapes: no overlaps or it says it is crowded`, overlaps(at(fx.shapes, r)).length === 0 || r.crowded, { crowded: r.crowded, ov: overlaps(at(fx.shapes, r)).length });
  }
  const t0 = performance.now(); const imp = AL.improve(G.shapes, G.links, {}); const ti = Math.round(performance.now() - t0);
  ok(`improve on 200 shapes, 260 links: under 4000 ms (${ti} ms), not worse (${imp.before.score} -> ${imp.after.score})`, ti < 4000 && imp.after.score >= imp.before.score, imp.candidates);
  const t1 = performance.now(); AL.score(G.shapes, G.links); ok(`score on 200 shapes: under 100 ms (${Math.round(performance.now() - t1)} ms)`, performance.now() - t1 < 100);
  console.log("times (ms) on 200 shapes:", JSON.stringify(times), "improve:", ti);
}

// ---------- 9b. fitting the canvas, shapes without links, routing (owner's session 2026-11-03: "they do not all fit on the canvas without
// touching", a tree of unlinked shapes, lines through shapes) ----------
{
  const T = 22;   // the name tag on top of each box, as logic.js passes it
  const big = (name, x, y) => S(name, x, y, { w: 88, h: 88 + T });
  const sum = Object.values(AL.WEIGHTS).reduce((a, b) => a + b, 0);
  ok(`the weights sum to 100 (${sum}) and include labels`, sum === 100 && AL.WEIGHTS.labels > 0);
  // a chain of 10 large shapes: as a tree or layers it must fit (direction chosen by fit, else a grid in link order), no overlap, inside
  const chain = { shapes: Array.from({ length: 10 }, (_, i) => big("C" + i, 60 + (i % 5) * 150, 80 + Math.floor(i / 5) * 200)), links: Array.from({ length: 9 }, (_, i) => L("C" + i, "C" + (i + 1))) };
  for (const kind of ["auto", "tree", "layers", "circle", "grid", "row", "organic"]) {
    const r = AL.layout(kind, chain.shapes, chain.links, { canvas: CANVAS }), after = at(chain.shapes, r);
    ok(`chain of 10 large shapes, ${kind}: fits (not crowded), no overlaps, inside the canvas${r.fellBack ? " (fell back to " + r.layout + ")" : ""}`, !r.crowded && !overlaps(after).length && !outside(after).length, { crowded: r.crowded, ov: overlaps(after), out: outside(after), notes: r.notes });
  }
  // most shapes unlinked: auto is a grid, and says why; an asked tree packs the unlinked shapes beside the tree
  const mostly = { shapes: ["A", "B", "C", "D", "E", "F", "G"].map((n, i) => S(n, 100 + i * 90, 100 + (i % 3) * 120)), links: [L("A", "B"), L("B", "C")] };
  const ra = AL.layout("auto", mostly.shapes, mostly.links, { canvas: CANVAS });
  ok(`auto with 4 of 7 shapes unlinked: a grid, with the reason (${ra.why})`, ra.layout === "grid" && /no links/.test(ra.why || ""));
  const lessly = { shapes: mostly.shapes, links: [L("A", "B"), L("B", "C"), L("C", "D"), L("D", "E")] };
  const rt = AL.layout("tree", lessly.shapes, lessly.links, { canvas: CANVAS }), aft = at(lessly.shapes, rt), y = n => aft.find(s => s.name === n);
  ok(`tree with F and G unlinked: they stand beside the tree, not in its first level (${rt.why})`, /F and G have no links/.test(rt.why || "") && !overlaps(aft).length && (y("F").y !== y("A").y || y("F").x > Math.max(...["A", "B", "C", "D", "E"].map(n => y(n).x))), aft.map(s => `${s.name}@${s.x},${s.y}`).join(" "));
  // a circle of 12 large shapes: an ellipse that fills the canvas instead of a squeezed circle
  const twelve = Array.from({ length: 12 }, (_, i) => big("R" + i, 400 + Math.cos(i) * 200, 250 + Math.sin(i) * 150));
  const rc = AL.layout("circle", twelve, [], { canvas: CANVAS }), ac = at(twelve, rc);
  ok("circle of 12 large shapes: not crowded, no overlaps, inside the canvas", !rc.crowded && !overlaps(ac).length && !outside(ac).length, { crowded: rc.crowded, ov: overlaps(ac).length });
  // routing: a link whose straight line passes through a shape bends around it; a clear link stays straight; labels avoid the boxes
  const row3 = [S("A", 100, 200), S("B", 300, 200), S("C", 500, 200), S("D", 300, 400)];
  const rr = AL.routeEdges(row3, [{ id: "e1", from: "A", to: "C", label: "long label" }, { id: "e2", from: "A", to: "B" }, { id: "e3", from: "B", to: "D", label: "x" }]);
  ok("routeEdges: A -> C (B in the way) bends round B; A -> B stays straight; nothing blocked", rr.routes.e1.points.length > 0 && rr.routes.e2.points.length === 0 && rr.blocked === 0, rr);
  const lb = rr.routes.e1.label, lw = "long label".length * 6.8 + 4;
  ok("routeEdges: the label of A -> C lies on no shape", lb && !row3.some(s => Math.abs(lb.x - s.x) < (lw + s.w) / 2 && Math.abs(lb.y - s.y) < (16 + s.h) / 2), lb);
  const pts = [row3[0]].concat(rr.routes.e1.points, [row3[2]]);
  ok("routeEdges: no leg of A -> C passes through B", !pts.slice(1).some((q, i) => { const p = pts[i]; return AL.score([Object.assign({}, row3[1]), { name: "p", x: p.x, y: p.y, w: 1, h: 1 }, { name: "q", x: q.x, y: q.y, w: 1, h: 1 }], [L("p", "q")]).metrics.through > 0; }), pts);
  // the score counts label collisions: a label between two touching-close shapes has no free place
  const tight = [S("A", 100, 100), S("B", 170, 100), S("X", 135, 60, { w: 200, h: 30 }), S("Y", 135, 140, { w: 200, h: 30 })];
  ok("score: a label with no free place beside its link counts (labelHits)", AL.score(tight, [{ from: "A", to: "B", label: "a long label here" }]).metrics.labelHits === 1);
  // improve never lowers the score, on random diagrams of 6 to 14 shapes
  let worse = 0; for (let k = 0; k < 20; k++) { const g = randomGraph(6 + (k % 9), 4 + k % 10), r = AL.improve(g.shapes, g.links, { canvas: CANVAS }); if (r.after.score < r.before.score) worse++; }
  ok(`improve never lowers the score (20 random diagrams; ${worse} worse)`, worse === 0);
}

// ---------- 10. end to end through a PATCHED logic.js (optional): LOGIC=<patched logic.js> node test_auto_layout.mjs ----------
// The patch (docs/js/ops-integration.md, apply_ops_patch.mjs) is applied to a copy; this section checks sentence -> Rules -> engine -> world.
if (process.env.LOGIC) {
  const K = createRequire(import.meta.url)(process.env.LOGIC);
  const fresh = () => { const S = K.createSystem(); S.engine.run(K.parse(`@a command action=create shape=rectangle name=Ceo at=400,60
@b command action=create shape=rectangle name=Cto at=150,300
@c command action=create shape=rectangle name=Cfo at=650,200
@d command action=create shape=circle name=Dev at=90,440
@e command action=create shape=circle name=Qa at=300,120
@f command action=connect from=Ceo to=Cto
@g command action=connect from=Ceo to=Cfo
@h command action=connect from=Cto to=Dev
@i command action=connect from=Cto to=Qa`)); return S; };
  const say = (S, text) => { const names = S.world.state.shapes.map((s) => s.name); const r = S.formalize(text, { names, last: [] }); const out = S.engine.run(r.nodes); return { r, out, wires: r.nodes.map((x) => K.serialize(x)).join(" | "), err: out.errors.map((e) => e.error.message).join("; ") }; };
  const P = (S, n) => { const s = S.world.find(n); return [s.x, s.y]; };
  const E = (S, f, t) => S.world.state.edges.find((e) => e.from === f && e.to === t);
  const shapesOf = (S) => S.world.state.shapes.map((s) => Object.assign({ name: s.name, x: s.x, y: s.y }, K.dims(s)));
  { const S = fresh(), x = say(S, "arrange everything as a tree");
    ok(`e2e "arrange everything as a tree": ${x.wires}`, !x.err && P(S, "Ceo")[1] < P(S, "Cto")[1] && P(S, "Cto")[1] < P(S, "Dev")[1] && P(S, "Cto")[1] === P(S, "Cfo")[1], x.err || [P(S, "Ceo"), P(S, "Cto"), P(S, "Dev")]); }
  { const S = fresh(), x = say(S, "lay it out as a tree from left to right"); ok(`e2e "... tree from left to right": ${x.wires}`, !x.err && P(S, "Ceo")[0] < P(S, "Cto")[0] && P(S, "Cto")[0] < P(S, "Qa")[0], x.err); }
  { const S = fresh(), before = AL.score(shapesOf(S), S.world.state.edges).score, x = say(S, "tidy up"), after = AL.score(shapesOf(S), S.world.state.edges).score;
    ok(`e2e "tidy up": ${x.wires}; score ${before} -> ${after}`, !x.err && after >= before && /score/.test(x.out.steps[0].answer || ""), x.out.steps[0].answer); }
  { const S = fresh(), x = say(S, "make the arrow from Ceo to Cto dashed and red"); ok(`e2e restyle: ${x.wires}`, !x.err && E(S, "Ceo", "Cto").style === "dashed" && E(S, "Ceo", "Cto").color === "red" && E(S, "Ceo", "Cfo").style === "solid", x.err); }
  { const S = fresh(), x = say(S, "make all arrows gray"); ok(`e2e restyle all: ${x.wires}`, !x.err && S.world.state.edges.every((e) => e.color === "gray"), x.err); }
  { const S = fresh(), x = say(S, "remove the arrowhead from the Ceo to Cfo arrow"); ok(`e2e arrowhead off (not a delete): ${x.wires}`, !x.err && E(S, "Ceo", "Cfo") && E(S, "Ceo", "Cfo").arrow === "none", x.err); }
  { const S = fresh(), x = say(S, "reverse the arrow from Cto to Dev"); ok(`e2e reverse: ${x.wires}`, !x.err && E(S, "Dev", "Cto") && !E(S, "Cto", "Dev"), x.err); }
  { const S = fresh(), x = say(S, "make the Ceo→Cfo arrow thicker"); ok(`e2e thicker: ${x.wires}`, !x.err && E(S, "Ceo", "Cfo").width === 3, x.err || E(S, "Ceo", "Cfo")); }
  { const S = fresh(), d0 = Math.abs(P(S, "Ceo")[0] - P(S, "Cto")[0]), x = say(S, "less space between the shapes"), d1 = Math.abs(P(S, "Ceo")[0] - P(S, "Cto")[0]); ok(`e2e less space: ${x.wires} (${d0} -> ${d1})`, !x.err && d1 < d0, x.err); }
  { const S = fresh(), x = say(S, "snap everything to the grid"); ok(`e2e snap: ${x.wires}`, !x.err && S.world.state.shapes.every((s) => s.x % 20 === 0 && s.y % 20 === 0), x.err); }
  { const S = fresh(), x0 = P(S, "Cto")[0], x = say(S, "flip the diagram horizontally"); ok(`e2e flip: ${x.wires}`, !x.err && P(S, "Cto")[0] > x0, x.err); }
  { const S = fresh(), x = say(S, "align everything to the left"); const L = S.world.state.shapes.map((s) => s.x - K.dims(s).w / 2); ok(`e2e align left: ${x.wires} (left edges within 1 px: integer centres)`, !x.err && Math.max(...L) - Math.min(...L) <= 1, L); }
  { const S = fresh(), x = say(S, "center the diagram"); const b = shapesOf(S), cx = (Math.min(...b.map((s) => s.x - s.w / 2)) + Math.max(...b.map((s) => s.x + s.w / 2))) / 2; ok(`e2e center: ${x.wires} (centre x ${cx})`, !x.err && Math.abs(cx - 400) <= 1, x.err); }
  { const S = fresh(), x = say(S, "make them all the same size"); ok(`e2e same size: ${x.wires}`, !x.err && new Set(S.world.state.shapes.map((s) => s.size)).size === 1, x.err); }
  { const S = fresh(); say(S, "connect Dev to Ceo"); const x = say(S, "arrange as a tree"); ok(`e2e tree on a loop asks: ${x.wires} -> ${x.err}`, /not a tree/.test(x.err) && x.out.errors[0].error.name === "Clarify"); }
  { const S = K.createSystem(); S.engine.run(K.parse("@a command action=create shape=circle name=A at=100,100\n@b command action=create shape=circle name=B at=600,400\n@c command action=create shape=circle name=C at=300,300"));
    const x = say(S, "arrange A, B and C as a tree"); ok(`e2e tree without links -> the hierarchy template form: ${x.wires}`, !x.err && /hierarchy form/.test(x.out.steps[0].answer || ""), x.err || x.out.steps[0].answer); }
  { const S = fresh(), x = say(S, "draw an org chart of Boss, Ann and Bob"); ok(`e2e a new org chart is still a template: ${x.wires}`, /template=hierarchy/.test(x.wires) && !x.err, x.err); }
  { const S = fresh(); say(S, "group Dev and Qa as Team"); const x = say(S, "arrange everything in a row"); const p = S.world.state.shapes;
    ok(`e2e row keeps the group as a block: ${x.wires}`, !x.err && P(S, "Qa")[0] - P(S, "Dev")[0] === 300 - 90, [P(S, "Dev"), P(S, "Qa")]); }
}

console.log(`\n${n - fail}/${n} passed${fail ? `, ${fail} FAILED` : ""}`);
process.exit(fail ? 1 : 0);
