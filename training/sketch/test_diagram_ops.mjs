// test_diagram_ops.mjs: groups and double positions (training/sketch/DIAGRAM_OPS.md) in the engine and the rules reader of docs/js/logic.js.
// Run: node test_diagram_ops.mjs   (prints each rules-reader sentence with its SOP; exit code 1 on a failure)
import { createRequire } from "node:module";
const K = createRequire(import.meta.url)("../../docs/js/logic.js");
let fail = 0, n = 0;
const eq = (name, got, want) => { n++; const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) fail++; console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : `\n     got  ${JSON.stringify(got)}\n     want ${JSON.stringify(want)}`}`); };
const P = (t) => K.parse(t);
const run = (S, sop) => S.engine.run(P(sop));
const pos = (S, n) => { const s = S.world.find(n); return s ? [s.x, s.y] : null; };
const ask = (S, sop) => { const r = run(S, sop); const st = r.steps[r.steps.length - 1]; return st.error ? "ERROR " + st.error.message : st.value; };
const base = () => { const S = K.createSystem(); run(S, `@a command action=create shape=circle name=A at=150,100
@b command action=create shape=circle name=B at=150,420
@c command action=create shape=square name=C at=650,250
@d command action=create shape=square name=Y at=90,70`); return S; };

// ---------- 1. double positions: the placed shape satisfies every constraint (checked by the same questions the users ask) ----------
{
  const cases = [
    ["below A, above B", "position=below anchor=A position2=above anchor2=B"],
    ["left of C, below A", "position=leftOf anchor=C position2=below anchor2=A"],
    ["right of Y, top left region", "position=rightOf anchor=Y region=topLeft"],
    ["between A and C, top region", "position=between anchor=A,C region=top"],
    ["near C, bottom right region", "position=near anchor=C region=bottomRight"],
    ["above B, right of A, left region", "position=above anchor=B position2=rightOf anchor2=A region=left"]
  ];
  for (const [what, p] of cases) {
    const S = base(), r = run(S, `@s command action=create shape=star name=X ${p}`);
    eq(`create X ${what}: no unmet constraint`, r.steps[0].answer || null, null);
    eq(`  ... is X ${what}? (check question)`, ask(S, `@q question ask=check target=X ${p}`), true);
    const S2 = base(); run(S2, `@s command action=create shape=star name=X at=700,450`); const r2 = run(S2, `@m command action=move target=X ${p}`);
    eq(`move X ${what}: holds`, [r2.steps[0].answer || null, ask(S2, `@q question ask=check target=X ${p}`)], [null, true]);
  }
  // the free spot: two shapes placed with the same constraints do not overlap
  const S = base(); run(S, "@s command action=create shape=star name=X position=below anchor=A position2=above anchor2=B"); run(S, "@s command action=create shape=star name=X2 position=below anchor=A position2=above anchor2=B");
  const [x1, y1] = pos(S, "X"), [x2, y2] = pos(S, "X2"), d = K.dims(S.world.find("X"));
  eq("two shapes with the same two constraints do not overlap", Math.abs(x1 - x2) >= d.w || Math.abs(y1 - y2) >= d.h, true);
  eq("  ... and both satisfy them", [ask(S, "@q question ask=check target=X position=below anchor=A position2=above anchor2=B"), ask(S, "@q question ask=check target=X2 position=below anchor=A position2=above anchor2=B")], [true, true]);
  // constraints that cannot all hold: the shape is placed where the first holds, and the answer names the one that does not
  const U = base(), r = run(U, "@s command action=create shape=star name=X position=leftOf anchor=A position2=rightOf anchor2=C");
  eq("left of A and right of C (impossible): drawn, the answer names 'right of C'", [!!U.world.find("X"), /right of C/.test(r.steps[0].answer || "")], [true, true]);
  eq("  ... the first relation holds", ask(U, "@q question ask=check target=X position=leftOf anchor=A"), true);
  // a single position is unchanged: same placement as relSpot (no region, no position2)
  const S1 = base(), S2 = base();
  run(S1, "@s command action=create shape=star name=X position=below anchor=A"); run(S2, "@s command action=create shape=star name=X position=below anchor=A position2=below anchor2=A");
  eq("single position keeps its place (here: the same as the duplicated constraint would give, both below A)", ask(S1, "@q question ask=check target=X position=below anchor=A"), true);
  // list / count with two relations
  const L = base(); run(L, "@s command action=create shape=star name=X position=below anchor=A position2=above anchor2=B");
  eq("list: shapes below A and above B (C at y 250 is too)", ask(L, "@q question ask=list position=below anchor=A position2=above anchor2=B"), ["C", "X"]);
  eq("count: shapes left of C and in the top left", ask(L, "@q question ask=count position=leftOf anchor=C region=topLeft"), 2);
  // a fact with two relations moves the shape until both hold
  const F = base(); run(F, "@s command action=create shape=star name=X at=700,450"); run(F, "@f fact target=X position=below anchor=A position2=above anchor2=B");
  eq("fact 'X is below A and above B' makes it true", ask(F, "@q question ask=check target=X position=below anchor=A position2=above anchor2=B"), true);
}

// ---------- 2. groups: one unit for move, delete, duplicate, align, front/back, set; questions; undo / redo ----------
{
  const S = base();
  run(S, "@g command action=group target=A,B,Y name=Pipeline");
  eq("group A, B, Y as Pipeline", S.world.state.groups, [{ name: "Pipeline", members: ["A", "B", "Y"] }]);
  eq("what is in Pipeline", ask(S, "@q question ask=members target=Pipeline"), ["A", "B", "Y"]);
  eq("which group is B in", ask(S, "@q question ask=groupOf target=B"), ["Pipeline"]);
  eq("which group is C in", ask(S, "@q question ask=groupOf target=C"), [null]);
  eq("list groups", ask(S, "@q question ask=list kind=group"), ["Pipeline"]);
  const before = ["A", "B", "Y"].map((x) => pos(S, x)), cbefore = pos(S, "C");
  run(S, "@m command action=move target=Pipeline direction=right distance=100");
  const after = ["A", "B", "Y"].map((x) => pos(S, x));
  eq("move Pipeline right by 100: every member moves by the same amount", after.map((p, i) => [p[0] - before[i][0], p[1] - before[i][1]]), [[100, 0], [100, 0], [100, 0]]);
  eq("  ... C does not move", pos(S, "C"), cbefore);
  run(S, "@m command action=move target=Pipeline position=leftOf anchor=C");
  const rel = ["A", "B", "Y"].map((x) => pos(S, x)), off = rel.map((p) => [p[0] - rel[0][0], p[1] - rel[0][1]]);
  eq("move Pipeline left of C: the layout inside the group is kept", off, before.map((p) => [p[0] - before[0][0], p[1] - before[0][1]]));
  eq("  ... and the group is left of C (a group is an anchor too: is C right of Pipeline?)", ask(S, "@q question ask=check target=C position=rightOf anchor=Pipeline"), true);
  run(S, "@u command action=undo"); eq("undo: back to the previous place", ["A", "B", "Y"].map((x) => pos(S, x)), after);
  run(S, "@r command action=redo"); eq("redo", ["A", "B", "Y"].map((x) => pos(S, x)), rel);
  run(S, "@t command action=toBack target=Pipeline"); eq("send Pipeline to the back: its members are first in the stacking order", S.world.state.shapes.slice(0, 3).map((s) => s.name).sort(), ["A", "B", "Y"]);
  run(S, "@c command action=set target=Pipeline color=red"); eq("make Pipeline red: all members", ["A", "B", "Y", "C"].map((x) => S.world.find(x).color), ["red", "red", "red", "white"]);
  run(S, "@d command action=duplicate target=Pipeline"); eq("duplicate Pipeline: 3 new shapes and a new group", [S.world.state.shapes.length, S.world.state.groups.map((g) => g.name)], [7, ["Pipeline", "Pipeline2"]]);
  run(S, "@u command action=undo");
  run(S, "@x command action=delete target=Pipeline"); eq("delete Pipeline: its shapes and the group are gone", [S.world.state.shapes.map((s) => s.name), S.world.state.groups], [["C"], []]);
  run(S, "@u command action=undo"); eq("undo the delete: shapes and group are back", [S.world.state.shapes.map((s) => s.name).sort(), S.world.state.groups.map((g) => g.name)], [["A", "B", "C", "Y"], ["Pipeline"]]);
  run(S, "@a command action=align target=Pipeline axis=vertical"); eq("align Pipeline vertically: one x", new Set(["A", "B", "Y"].map((x) => pos(S, x)[0])).size, 1);
  run(S, "@n command action=rename target=Pipeline name=Flow"); eq("rename the group", S.world.state.groups.map((g) => g.name), ["Flow"]);
  run(S, "@n command action=rename target=A name=Alpha"); eq("rename a member: the group follows", S.world.state.groups[0].members, ["Alpha", "B", "Y"]);
  run(S, "@o command action=ungroup target=Y"); eq("ungroup Y (a member): Y leaves the group", S.world.state.groups[0].members, ["Alpha", "B"]);
  run(S, "@o command action=delete target=B"); eq("delete a member: the group keeps the rest", S.world.state.groups[0].members, ["Alpha"]);
  run(S, "@o command action=ungroup target=Flow"); eq("ungroup Flow: no groups, shapes stay", [S.world.state.groups.length, S.world.state.shapes.length], [0, 3]);
  const E = base(); const r = run(E, "@g command action=group target=A,B name=C");
  eq("a group cannot take a shape's name", /is a shape/.test(r.errors[0] && r.errors[0].error.message), true);
  const W = base(); run(W, "@g command action=group target=A,B name=P1"); run(W, "@g command action=group target=B,C name=P2");
  eq("a shape is in one group at a time", W.world.state.groups, [{ name: "P1", members: ["A"] }, { name: "P2", members: ["B", "C"] }]);
  eq("world write-back has the group wire", K.worldSOP(W.world.state).split("\n").filter((l) => / group /.test(l)), ["@P1 group members=$A", "@P2 group members=$B,$C"]);
}

// ---------- 3. the rules reader: English -> SOP ----------
{
  const S = base(); run(S, "@g command action=group target=A,B name=Pipeline");
  const ctx = { names: S.world.state.shapes.map((s) => s.name), groups: ["Pipeline"], last: [] };
  const R = [
    ["group A, B and C as Pipeline", "@s1 command action=group name=Pipeline target=A,B,C"],
    ["Group A, B and C (as Flow)", "@s1 command action=group name=Flow target=A,B,C"],
    ["put A and C together", "@s1 command action=group target=A,C"],
    ["bundle Y and C into a group called Side", "@s1 command action=group name=Side target=Y,C"],
    ["add C to Pipeline", "@s1 command action=group name=Pipeline target=C,Pipeline"],
    ["take B out of Pipeline", "@s1 command action=ungroup target=B"],
    ["ungroup Pipeline", "@s1 command action=ungroup target=Pipeline"],
    ["split Pipeline up", "@s1 command action=ungroup target=Pipeline"],
    ["break up the Pipeline group", "@s1 command action=ungroup target=Pipeline"],
    ["what is in Pipeline?", "@s1 question ask=members target=Pipeline"],
    ["what does Pipeline contain?", "@s1 question ask=members target=Pipeline"],
    ["which group is A in?", "@s1 question ask=groupOf target=A"],
    ["what groups are there?", "@s1 question ask=list kind=group"],
    ["move Pipeline below C", "@s1 command action=move target=Pipeline position=below anchor=C"],
    ["delete Pipeline", "@s1 command action=delete target=Pipeline"],
    ["duplicate Pipeline", "@s1 command action=duplicate target=Pipeline"],
    ["bring Pipeline to the front", "@s1 command action=toFront target=Pipeline"],
    ["draw a red star below A but above B", "@s1 command action=create shape=star color=red position=below anchor=A position2=above anchor2=B"],
    ["draw a star named T top left, right of Y", "@s1 command action=create shape=star name=T position=rightOf anchor=Y region=topLeft"],
    ["add a triangle between A and C, near the top", "@s1 command action=create shape=triangle position=between anchor=A,C region=top"],
    ["move Y below A and also left of C", "@s1 command action=move target=Y position=below anchor=A position2=leftOf anchor2=C"],
    ["move Y above B but below A", "@s1 command action=move target=Y position=above anchor=B position2=below anchor2=A"],
    ["is Y below A and above B?", "@s1 question ask=check target=Y position=below anchor=A position2=above anchor2=B"],
    ["which shapes are left of C and in the top left?", "@s1 question ask=list position=leftOf anchor=C region=topLeft"],
    ["Y is right of A and below C", "@s1 fact target=Y position=rightOf anchor=A position2=below anchor2=C"],
    ["move Y below A", "@s1 command action=move target=Y position=below anchor=A"],
    ["draw a circle in the top left", "@s1 command action=create shape=circle position=topLeft"]
  ];
  for (const [t, want] of R) {
    const got = S.formalize(t, ctx).nodes.map(K.serialize).join(" ; ");
    eq(`rules reader: ${t.padEnd(52)} ${got}`, got, want);
  }
}

// ---------- 4. changing a shape's kind: the rules reader gives action=set shape=..., and the engine redraws the shape ----------
{
  const T = [
    ["change the shape of Box to a star", "@s1 command action=set shape=star target=Box", "star"],
    ["transform Box into a hexagon", "@s1 command action=set shape=hexagon target=Box", "hexagon"],
    ["convert Box to a square", "@s1 command action=set shape=square target=Box", "square"],
    ["reshape Box as a rectangle", "@s1 command action=set shape=rectangle target=Box", "rectangle"],
    ["Box should be a diamond instead", "@s1 command action=set shape=diamond target=Box", "diamond"],
    ["swap Box's shape for a circle", "@s1 command action=set shape=circle target=Box", "circle"],
    ["turn Box into a big red circle", "@s1 command action=set shape=circle size=large color=red target=Box", "circle"]
  ];
  for (const [t, want, shape] of T) {
    const S = K.createSystem(); run(S, "@a command action=create shape=square name=Box at=200,200\n@b command action=create shape=square name=Hub at=500,200");
    const nodes = S.formalize(t, { names: ["Box", "Hub"], last: [] }).nodes;
    eq(`kind change: ${t}`, nodes.map(K.serialize).join(" ; "), want);
    run(S, nodes.map(K.serialize).join("\n"));
    eq(`  ... Box is now a ${shape}, Hub unchanged`, [S.world.find("Box").shape, S.world.find("Hub").shape], [shape, "square"]);
  }
  {
    const S = K.createSystem(); run(S, "@a command action=create shape=square name=Box at=200,200\n@b command action=create shape=square name=Hub at=500,200\n@c command action=create shape=circle name=Dot at=300,400");
    const nodes = S.formalize("make all the squares circles", { names: ["Box", "Hub", "Dot"], last: [] }).nodes;
    eq("kind change: make all the squares circles", nodes.map(K.serialize).join(" ; "), "@m1 mention quantifier=all shape=square ; @s1 command action=set shape=circle target=$m1");
    run(S, nodes.map(K.serialize).join("\n"));
    eq("  ... both squares are circles", ["Box", "Hub"].map((n) => S.world.find(n).shape), ["circle", "circle"]);
    const S2 = K.createSystem(); run(S2, "@a command action=create shape=square name=Box at=200,200\n@b command action=create shape=square name=Hub at=500,200");
    const n2 = S2.formalize("change Hub and Box into triangles", { names: ["Box", "Hub"], last: [] }).nodes;
    eq("kind change: change Hub and Box into triangles", n2.map(K.serialize).join(" ; "), "@s1 command action=set shape=triangle target=Hub,Box");
    run(S2, n2.map(K.serialize).join("\n"));
    eq("  ... both are triangles", ["Box", "Hub"].map((n) => S2.world.find(n).shape), ["triangle", "triangle"]);
  }
}
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
