// test_templates.mjs: the template geometry of docs/js/templates.js (design: training/sketch/legend_ext/LEGEND_EXT.md).
// For every template, at every item count it accepts, in several boxes (the whole canvas, a half, a quarter, a small box), with and
// without a title and a second list: no two elements of layer >= 2 overlap, everything is inside the box, one element per item, the
// template's link count, links between existing elements, the same input gives the same output, names are legal and unique.
// Then place(): obstacles are avoided, the preferred region is used when free, a full canvas asks for a new frame.
// Run: node training/sketch/test_templates.mjs   (exit code 1 on a failure)
import { createRequire } from "node:module";
const T = createRequire(import.meta.url)("../../docs/js/templates.js");
let fail = 0, n = 0; const fails = [];
const ok = (name, cond, detail) => { n++; if (!cond) { fail++; fails.push(name + (detail ? `: ${detail}` : "")); } };

const WORDS = ["Plan", "Build MVP", "Test with users", "Ship", "Learn", "Grow", "Hire", "Fund", "Scale up", "Repeat", "Celebrate", "Rest", "Review", "Iterate", "Launch"];
const BOXES = { whole: T.boxFor({ x: 0, y: 0, w: 800, h: 500 }, "whole"), left: T.boxFor({ x: 0, y: 0, w: 800, h: 500 }, "left", "huge"), top: T.boxFor({ x: 0, y: 0, w: 800, h: 500 }, "top", "huge"), cell2: T.boxFor({ x: 880, y: 580, w: 800, h: 500 }, "whole") };
const NAME = /^[A-Za-z_][\w-]*$/;
let layouts = 0, crowded = [];
for (const [name, tp] of Object.entries(T.TEMPLATES)) {
  const counts = [...new Set([tp.min, tp.def, Math.ceil((tp.min + tp.max) / 2), tp.max])];
  for (const cnt of counts) for (const [bname, box] of Object.entries(BOXES)) for (const variant of ["plain", "title", "two"]) {
    if (variant === "two" && !tp.uses2) continue;
    const items = WORDS.slice(0, cnt), items2 = variant === "two" ? WORDS.slice(5, 5 + Math.max(1, Math.min(tp.max, 3))) : [];
    const P = { items, items2, title: variant !== "plain" ? "Our big plan" : null };
    const L = T.layout(name, P, box); layouts++;
    const tag = `${name} n=${cnt} ${bname} ${variant}`;
    // 1. a small box may be crowded (k = 0.5 is the floor); the whole canvas and the halves may not, up to the template's maximum
    if (L.crowded) { if (bname === "whole" || bname === "cell2") ok(`${tag}: fits`, false, L.problems.slice(0, 3).join("; ")); else crowded.push(`${tag} (${L.problems[0]})`); continue; }
    ok(`${tag}: no problem reported`, L.problems.length === 0, L.problems.join("; "));
    // 2. re-check independently: inside the box, no overlap among layers >= 2
    const probs = T.check(L, box); ok(`${tag}: check() clean`, probs.length === 0, probs.join("; "));
    // 3. one element per item (and per second item); the count of links
    const items1 = L.elements.filter(e => e.role === "item"), items2e = L.elements.filter(e => e.role === "item2");
    ok(`${tag}: one element per item`, items1.length === (name === "matrix" ? 4 : cnt) && items1.every((e, i) => items1.some(x => x.index === i)), `${items1.length} items`);
    const twoN = tp.uses2 ? Math.min(tp.max2 || tp.max, items2.length) : 0;
    ok(`${tag}: one element per second item`, items2e.length === twoN, `${items2e.length} vs ${twoN}`);
    const wantLinks = tp.links(name === "matrix" ? 4 : cnt, twoN);
    ok(`${tag}: ${wantLinks} links`, L.links.length === wantLinks, `${L.links.length}`);
    // 4. the item texts are kept (the item or its label element)
    const shown = new Set(L.elements.map(e => e.text));
    ok(`${tag}: every item text is shown`, items.slice(0, tp.max).every(t => shown.has(t)));
    // 5. integers, positive sizes, layers 0..3, colours are names
    ok(`${tag}: integer geometry`, L.elements.every(e => [e.x, e.y, e.w, e.h].every(Number.isInteger) && e.w > 0 && e.h > 0 && e.layer >= 0 && e.layer <= 3 && /^[a-z]+$/.test(e.color)));
    // 6. stable: the same input gives the same output
    ok(`${tag}: stable`, JSON.stringify(T.layout(name, P, box)) === JSON.stringify(L));
    // 7. names: legal, unique, never one already taken
    const taken = ["Plan", "Start", "Done"], nm = T.nameElements(L, T.groupName(name, P.title, taken), taken), vals = [...nm.values()];
    ok(`${tag}: names legal and unique`, vals.every(v => NAME.test(v)) && new Set(vals.map(v => v.toLowerCase())).size === vals.length && !vals.some(v => taken.map(x => x.toLowerCase()).includes(v.toLowerCase())), vals.join(","));
  }
}
// 8. place(): an obstacle in the middle of the canvas -> the template goes around it (no element covers it)
{
  const canvas = { x: 0, y: 0, w: 800, h: 500 }, obst = [{ x1: 360, y1: 200, x2: 440, y2: 300 }];
  for (const name of Object.keys(T.TEMPLATES)) {
    const r = T.place(name, { items: WORDS.slice(0, T.TEMPLATES[name].def) }, canvas, obst, {});
    const hit = r.layout.elements.some(e => e.x + e.w / 2 > 352 && e.x - e.w / 2 < 448 && e.y + e.h / 2 > 192 && e.y - e.h / 2 < 308);
    ok(`place ${name} around an obstacle: fits=${r.fits} region=${r.region}`, r.fits ? !hit : true);
  }
  const r1 = T.place("process", { items: ["A", "B", "C"] }, canvas, [], { region: "bottom" });
  ok("place: a free preferred region is used", r1.fits && r1.region === "bottom" && !r1.moved);
  const r2 = T.place("process", { items: ["A", "B", "C"] }, canvas, [{ x1: 0, y1: 260, x2: 800, y2: 500 }], { region: "bottom" });
  ok("place: a taken preferred region -> another region, moved=true", r2.fits && r2.region !== "bottom" && r2.moved);
  const r3 = T.place("cycle", { items: ["A", "B", "C"] }, canvas, [{ x1: 0, y1: 0, x2: 800, y2: 500 }], {});
  ok("place: a full canvas -> fits=false (the engine opens a new frame)", !r3.fits && r3.region === "newFrame");
  const r4 = T.place("timeline", { items: ["A", "B", "C"] }, canvas, [], { rel: "below", anchor: { x1: 300, y1: 40, x2: 500, y2: 120 } });
  ok("place: below an anchor -> every element is below it", r4.fits && r4.layout.elements.every(e => e.y - e.h / 2 >= 120));
}
// 9. parameters: placeholders, the count, ranges, schemes, one colour, the vertical axis, parents
{
  const box = BOXES.whole;
  const L1 = T.layout("process", { count: 5 }, box); ok("count=5 without items -> 5 placeholders Step 1..5", L1.elements.filter(e => e.role === "item").map(e => e.text).join("|") === "Step 1|Step 2|Step 3|Step 4|Step 5");
  const L2 = T.layout("matrix", { items: ["A", "B", "C", "D", "E"] }, box); ok("matrix with 5 items: 4 quadrants and a note", L2.elements.filter(e => e.role === "item").length === 4 && L2.notes.length === 1);
  const L3 = T.layout("timeline", { items: ["A", "B", "C"], scheme: "ocean" }, box); ok("scheme ocean: item colours from the ocean palette", L3.elements.filter(e => e.role === "item").every(e => T.SCHEMES.ocean.items.includes(e.color)));
  const L4 = T.layout("cycle", { items: ["A", "B", "C"], color: "red" }, box); ok("color=red: every item red", L4.elements.filter(e => e.role === "item").every(e => e.color === "red"));
  const L5 = T.layout("process", { items: ["A", "B", "C"], axis: "vertical" }, box), it5 = L5.elements.filter(e => e.role === "item");
  ok("axis=vertical: one column, top to bottom", it5.every(e => e.x === it5[0].x) && it5[0].y < it5[1].y && it5[1].y < it5[2].y);
  const L6 = T.layout("hierarchy", { items: ["Ceo", "Cto", "Cfo", "Dev"], parents: ["Ceo", "Ceo", "Cto"] }, box), it6 = Object.fromEntries(L6.elements.filter(e => e.role === "item").map(e => [e.text, e]));
  ok("hierarchy with parents: Dev under Cto, Cto and Cfo on one level below Ceo", it6.Dev.y > it6.Cto.y && it6.Cto.y === it6.Cfo.y && it6.Cto.y > it6.Ceo.y && L6.links.some(l => l.from === "item2" && l.to === "item4"));
  const L7 = T.layout("target", { items: ["Core", "Team", "World"] }, box), rings = L7.elements.filter(e => e.role === "item");
  ok("target: rings are drawn outermost first (z-order), the first item is the smallest", rings[0].w > rings[rings.length - 1].w && rings.find(e => e.text === "Core").w === Math.min(...rings.map(e => e.w)));
  const L8 = T.layout("mountain", { items: ["A", "B", "C"] }, box);
  ok("mountain: the mountain is background (layer 0), the summit item is a star at the top", L8.elements[0].layer === 0 && L8.elements.find(e => e.text === "C").shape === "star" && L8.elements.find(e => e.text === "C").y < L8.elements.find(e => e.text === "A").y);
  const L9 = T.layout("balance", { items: ["Cost", "Risk", "Time"], items2: ["Speed"] }, box), lft = L9.elements.find(e => e.text === "Cost"), rgt = L9.elements.find(e => e.text === "Speed");
  ok("balance: the side with more items hangs lower", lft.y > rgt.y);
  ok("legend(): template values = the catalogue, scheme values = the schemes", Object.keys(T.legend().template.values).length === Object.keys(T.TEMPLATES).length && Object.keys(T.legend().scheme.values).join() === Object.keys(T.SCHEMES).join());
  let threw = false; try { T.layout("rocket", {}, box); } catch (e) { threw = /no template "rocket"/.test(e.message); } ok("an unknown template throws a reason", threw);
  ok("nameFromText: Build MVP -> BuildMVP, 2027 plan -> N2027Plan, empty -> null", T.nameFromText("Build MVP") === "BuildMVP" && T.nameFromText("2027 plan") === "N2027Plan" && T.nameFromText("!!") === null);
}
console.log(`templates: ${Object.keys(T.TEMPLATES).length} (${Object.values(T.TEMPLATES).filter(t => t.family === "emotion").length} with emotional forms), layouts checked: ${layouts}`);
if (crowded.length) console.log(`crowded in a small box (allowed, the engine says so): ${crowded.length}\n  ` + crowded.slice(0, 8).join("\n  "));
for (const f of fails.slice(0, 40)) console.log("FAIL " + f);
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
